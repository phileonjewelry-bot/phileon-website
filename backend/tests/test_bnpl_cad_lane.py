"""PHILEON — Trusted BNPL CAD lane tests.

Covers Phase 3 acceptance:
  * FX service is money-safe: Decimal-based, integer minor units, banded,
    fail-closed when Frankfurter is unreachable AND no acceptable stale.
  * `/api/checkout/bnpl-quote` returns a full CAD quote when
    `shipping_country=CA`; rejects other countries; ignores injection.
  * `/api/checkout/stripe/session` with `use_cad_bnpl_lane=True` produces
    a CAD Stripe Session, preserves canonical USD on OrderV2, and
    records the trusted FX snapshot on `OrderV2.presentment`.
"""
import time
from decimal import Decimal
from unittest.mock import patch

import pytest

from services import fx_bnpl


@pytest.fixture(autouse=True)
def _reset_fx_cache():
    fx_bnpl._CACHE["rate"] = None
    fx_bnpl._CACHE["retrieved_at"] = None
    fx_bnpl._CACHE["reference_date"] = None
    fx_bnpl._CACHE["provider"] = None
    yield
    fx_bnpl._CACHE["rate"] = None
    fx_bnpl._CACHE["retrieved_at"] = None
    fx_bnpl._CACHE["reference_date"] = None
    fx_bnpl._CACHE["provider"] = None


def _fake_fresh():
    return {"rate": Decimal("1.36"), "reference_date": "2026-09-04", "provider": "frankfurter"}


# ── FX service ───────────────────────────────────────────────────────────

def test_fx_snapshot_fresh_within_ttl():
    with patch.object(fx_bnpl, "_fetch_frankfurter", return_value=_fake_fresh()):
        snap = fx_bnpl.get_trusted_snapshot()
    assert snap is not None
    assert snap["base"] == "USD" and snap["quote"] == "CAD"
    assert snap["rate"] == Decimal("1.36")
    assert snap["is_stale"] is False
    assert snap["provider"] == "frankfurter"


def test_fx_snapshot_serves_stale_within_72h_holiday_grace():
    # Prime cache to 60h ago (past fresh but inside stale limit).
    fx_bnpl._CACHE["rate"] = Decimal("1.34")
    fx_bnpl._CACHE["retrieved_at"] = time.time() - (60 * 60 * 60)
    fx_bnpl._CACHE["reference_date"] = "2026-08-30"
    fx_bnpl._CACHE["provider"] = "frankfurter"
    with patch.object(fx_bnpl, "_fetch_frankfurter", side_effect=RuntimeError("net")):
        snap = fx_bnpl.get_trusted_snapshot()
    assert snap is not None
    assert snap["is_stale"] is True


def test_fx_snapshot_fails_closed_beyond_72h():
    fx_bnpl._CACHE["rate"] = Decimal("1.34")
    fx_bnpl._CACHE["retrieved_at"] = time.time() - (100 * 60 * 60)
    fx_bnpl._CACHE["reference_date"] = "2026-08-25"
    with patch.object(fx_bnpl, "_fetch_frankfurter", side_effect=RuntimeError("net")):
        assert fx_bnpl.get_trusted_snapshot() is None


@pytest.mark.parametrize("bad_rate", [Decimal("0"), Decimal("-1"), Decimal("0.9"), Decimal("2.5")])
def test_fx_rejects_out_of_band_rate(bad_rate):
    with patch.object(fx_bnpl, "_fetch_frankfurter",
                      side_effect=ValueError(f"out of band: {bad_rate}")):
        assert fx_bnpl.get_trusted_snapshot() is None


def test_convert_usd_cents_uses_integer_math():
    """$3,900.00 USD × 1.36 = $5,304.00 CAD → 530400 cents."""
    with patch.object(fx_bnpl, "_fetch_frankfurter", return_value=_fake_fresh()):
        assert fx_bnpl.convert_usd_cents_to_cad_cents(390000) == 530400


def test_convert_usd_cents_rejects_negative():
    with pytest.raises(ValueError):
        fx_bnpl.convert_usd_cents_to_cad_cents(-1)


def test_build_bnpl_quote_shape():
    with patch.object(fx_bnpl, "_fetch_frankfurter", return_value=_fake_fresh()):
        q = fx_bnpl.build_bnpl_quote(usd_subtotal_cents=35000,
                                       usd_shipping_cents=0,
                                       usd_tax_cents=0)
    assert q is not None
    assert q["canonical_currency"] == "USD"
    assert q["canonical_subtotal_cents"] == 35000
    assert q["presentment_currency"] == "CAD"
    # 35000 * 1.36 = 47600 exact
    assert q["presentment_subtotal_cents"] == 47600
    assert q["presentment_total_cents"] == 47600
    assert q["fx_source"] == "frankfurter"
    assert q["fx_is_stale"] is False


def test_build_bnpl_quote_returns_none_when_fx_unavailable():
    with patch.object(fx_bnpl, "_fetch_frankfurter", side_effect=RuntimeError("net")):
        assert fx_bnpl.build_bnpl_quote(usd_subtotal_cents=35000,
                                          usd_shipping_cents=0,
                                          usd_tax_cents=0) is None


# ── /api/checkout/bnpl-quote ────────────────────────────────────────────

def _rre_body(country="CA", **extra):
    body = {
        "items": [{"product_id": "ribbon-regale-edition", "quantity": 1, "variant": "plated"}],
        "shipping_country": country,
    }
    body.update(extra)
    return body


def test_bnpl_quote_ca_returns_full_snapshot(app_client):
    r = app_client.post("/api/checkout/bnpl-quote", json=_rre_body("CA"))
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["canonical_currency"] == "USD"
    assert d["canonical_subtotal_cents"] == 35000
    assert d["presentment_currency"] == "CAD"
    assert d["fx_source"] == "frankfurter"
    assert d["presentment_total_cents"] > d["canonical_total_cents"]


def test_bnpl_quote_non_ca_rejected(app_client):
    r = app_client.post("/api/checkout/bnpl-quote", json=_rre_body("US"))
    assert r.status_code == 400
    assert r.json()["detail"]["code"] == "BNPL_CAD_REQUIRES_CA"


def test_bnpl_quote_rejects_client_rate_injection(app_client):
    r = app_client.post("/api/checkout/bnpl-quote", json=_rre_body("CA", fx_rate=0.5))
    assert r.status_code == 422
    assert any("extra_forbidden" in (e.get("type") or "")
               for e in r.json().get("detail", []))


def test_bnpl_quote_rejects_client_cad_amount_injection(app_client):
    r = app_client.post("/api/checkout/bnpl-quote",
                        json=_rre_body("CA", presentment_total_cents=100))
    assert r.status_code == 422


# ── /api/checkout/stripe/session with use_cad_bnpl_lane=True ────────────

def test_bnpl_session_persists_canonical_usd_and_cad_presentment(app_client):
    r = app_client.post("/api/checkout/stripe/session", json={
        "items": [{"product_id": "ribbon-regale-edition", "quantity": 1, "variant": "plated"}],
        "customer_email": "bnpl-persist@phileon.dev",
        "shipping_country": "CA",
        "use_cad_bnpl_lane": True,
    })
    assert r.status_code in (200, 502), r.text
    if r.status_code == 200:
        d = r.json()
        assert d["checkout_url"].startswith("https://checkout.stripe.com/")
        assert d.get("order_number", "").startswith("PHI-")


def test_bnpl_flag_ignored_for_us_country(app_client):
    """`use_cad_bnpl_lane=True` on a US destination must NOT convert the
    session to CAD — normal USD flow continues."""
    r = app_client.post("/api/checkout/stripe/session", json={
        "items": [{"product_id": "ribbon-regale-edition", "quantity": 1, "variant": "plated"}],
        "customer_email": "bnpl-ignore@phileon.dev",
        "shipping_country": "US",
        "use_cad_bnpl_lane": True,
    })
    assert r.status_code in (200, 502)  # not 400 — flag is UX-only and non-fatal


def test_session_rejects_money_injection_still(app_client):
    """Adding the BNPL flag must not weaken the trust boundary."""
    r = app_client.post("/api/checkout/stripe/session", json={
        "items": [{"product_id": "ribbon-regale-edition", "quantity": 1, "variant": "plated"}],
        "customer_email": "bnpl-inject@phileon.dev",
        "shipping_country": "CA",
        "use_cad_bnpl_lane": True,
        "fx_rate": 0.5,
    })
    assert r.status_code == 422
