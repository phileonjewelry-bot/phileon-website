"""
Iteration 36 regression — OVATION USD matrix, COOGI DNA TAG engraving,
LADY JAY seasonal retirement.

All tests go through the in-process `app_client` fixture (disposable DB)
or call `services.catalog.resolve_line_item` directly. The autouse
network guard in conftest.py blocks any accidental live-backend HTTP.
"""
import sys
from datetime import datetime, timezone, timedelta
import pytest

sys.path.insert(0, "/app/backend")

from services import catalog as catalog_svc
from services import pricing_engine_catalog as pec


# ───────────────────── OVATION (resolver, 7 tiers × 1 size) ─────────────────────
OVATION_EXPECTED = {
    "silver":     22500,
    "yellow10k":  85000,
    "white10k":   85000,
    "yellow14k": 110000,
    "white14k":  110000,
    "yellow18k": 140000,
    "white18k":  140000,
}


@pytest.mark.parametrize("tier,expected_cents", list(OVATION_EXPECTED.items()))
def test_ovation_resolver_tier_prices(tier, expected_cents):
    # ovation is usd_hand_set=True → ignore market snapshot but resolver still
    # requires one for the dynamic-ring code path.
    snap = {"timestamp": 0, "source": "test", "isStale": False,
            "goldPerGram24kCad": 1.0, "silverPerGramCad": 1.0}
    r = catalog_svc.resolve_line_item(
        "ovation", karat=None, metal_colour=None, ring_size="US 8",
        quantity=1, tier=tier, market_snapshot=snap,
    )
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_cents, (
        f"ovation/{tier} resolved {r['unit_amount_cents']}c, expected {expected_cents}c")
    assert r["sku"].startswith("OVATION-")
    assert r["sku"].endswith("-SZ8")


# ─────────────── COOGI DNA TAG (engraving surcharge, both tiers) ───────────────
@pytest.mark.parametrize("tier,engraving,expected", [
    ("snow", False, 850000),
    ("snow", True,  865000),
    ("sand", False, 850000),
    ("sand", True,  865000),
])
def test_coogi_dna_tag_engraving_surcharge(tier, engraving, expected):
    r = catalog_svc.resolve_line_item(
        "coogi-dna-tag", karat=None, metal_colour=None, ring_size=None,
        quantity=1, tier=tier, engraving=engraving,
    )
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected, (
        f"coogi-dna-tag/{tier}/engraving={engraving} → {r['unit_amount_cents']}c, expected {expected}c")


# ───────────────────── LADY JAY — seasonal window ─────────────────────
def _snap():
    return {"timestamp": 0, "source": "test", "isStale": False,
            "goldPerGram24kCad": 100.0, "silverPerGramCad": 1.0}


def test_ladyjay_available_on_oct31_last_minute(monkeypatch):
    # 2026-10-31 23:59 America/Toronto (EDT = UTC-4) → UTC 2026-11-01 03:59
    fixed = datetime(2026, 11, 1, 3, 59, 0, tzinfo=timezone.utc)
    monkeypatch.setattr(pec, "_now_utc", lambda: fixed)
    r = catalog_svc.resolve_line_item(
        "lady-jay", karat=None, metal_colour=None, ring_size="US 6",
        quantity=1, tier="foundation", market_snapshot=_snap(),
    )
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] > 0


def test_ladyjay_retired_on_nov1_midnight(monkeypatch):
    # 2026-11-01 00:00 America/Toronto EDT = UTC 2026-11-01 04:00
    fixed = datetime(2026, 11, 1, 4, 0, 0, tzinfo=timezone.utc)
    monkeypatch.setattr(pec, "_now_utc", lambda: fixed)
    with pytest.raises(Exception) as ei:
        catalog_svc.resolve_line_item(
            "lady-jay", karat=None, metal_colour=None, ring_size="US 6",
            quantity=1, tier="foundation", market_snapshot=_snap(),
        )
    assert "SEASONALLY_RETIRED" in str(ei.value)


# ───── /api/checkout/stripe/session via app_client (no real Stripe call) ─────
def test_stripe_session_coogi_sand_engraving(app_client, monkeypatch):
    # Avoid any real Stripe call: stub stripe client used by stripe_service
    try:
        import stripe
        def _fake_create(**kw):
            class S: id = "cs_test_dummy"; url = "https://stripe.test/dummy"
            return S()
        monkeypatch.setattr(stripe.checkout.Session, "create", staticmethod(_fake_create))
    except Exception:
        pass
    body = {
        "items": [{
            "product_id": "coogi-dna-tag",
            "quantity": 1,
            "tier": "sand",
            "engraving": True,
            "displayed_unit_amount_cents": 865000,
        }],
        "customer_email": "TEST_iter36@example.com","shipping_country":"US",
    }
    resp = app_client.post("/api/checkout/stripe/session", json=body)
    # Not 409 PRICE_MOVED: our displayed matches server trusted.
    assert resp.status_code != 409, f"PRICE_MOVED unexpected: {resp.text}"
    # Any Stripe-config error (500/503) AFTER price validation is acceptable per spec.
    if resp.status_code == 400:
        detail = resp.json().get("detail", {})
        assert "PRICE_MOVED" not in str(detail), detail


def test_stripe_session_coogi_snow_no_engraving(app_client, monkeypatch):
    try:
        import stripe
        def _fake_create(**kw):
            class S: id = "cs_test_dummy"; url = "https://stripe.test/dummy"
            return S()
        monkeypatch.setattr(stripe.checkout.Session, "create", staticmethod(_fake_create))
    except Exception:
        pass
    body = {
        "items": [{
            "product_id": "coogi-dna-tag", "quantity": 1,
            "tier": "snow", "engraving": False,
            "displayed_unit_amount_cents": 850000,
        }],
        "customer_email": "TEST_iter36@example.com","shipping_country":"US",
    }
    resp = app_client.post("/api/checkout/stripe/session", json=body)
    assert resp.status_code != 409, f"PRICE_MOVED unexpected: {resp.text}"


def test_stripe_session_ovation_silver_us8(app_client, monkeypatch):
    try:
        import stripe
        def _fake_create(**kw):
            class S: id = "cs_test_dummy"; url = "https://stripe.test/dummy"
            return S()
        monkeypatch.setattr(stripe.checkout.Session, "create", staticmethod(_fake_create))
    except Exception:
        pass
    body = {
        "items": [{
            "product_id": "ovation", "quantity": 1, "tier": "silver",
            "ringSize": "US 8",
            "displayed_unit_amount_cents": 22500,
        }],
        "customer_email": "TEST_iter36@example.com","shipping_country":"US",
    }
    resp = app_client.post("/api/checkout/stripe/session", json=body)
    assert resp.status_code != 409, f"PRICE_MOVED unexpected: {resp.text}"
    # If 400, it must not be a price mismatch.
    if resp.status_code == 400:
        detail = resp.json().get("detail", {})
        assert "PRICE_MOVED" not in str(detail), detail


def test_stripe_session_ladyjay_retired(app_client, monkeypatch):
    # Monkeypatch clock → 2026-11-01 00:00 America/Toronto.
    fixed = datetime(2026, 11, 1, 4, 0, 0, tzinfo=timezone.utc)
    monkeypatch.setattr(pec, "_now_utc", lambda: fixed)
    try:
        import stripe
        def _fake_create(**kw):
            class S: id = "cs_test_dummy"; url = "https://stripe.test/dummy"
            return S()
        monkeypatch.setattr(stripe.checkout.Session, "create", staticmethod(_fake_create))
    except Exception:
        pass
    body = {
        "items": [{
            "product_id": "lady-jay", "quantity": 1, "tier": "foundation",
            "ringSize": "US 6",
        }],
        "customer_email": "TEST_iter36@example.com","shipping_country":"US",
    }
    resp = app_client.post("/api/checkout/stripe/session", json=body)
    assert resp.status_code == 400, f"expected 400, got {resp.status_code}: {resp.text}"
    body_j = resp.json()
    assert "SEASONALLY_RETIRED" in str(body_j), body_j


def test_stripe_session_ladyjay_last_minute_oct31(app_client, monkeypatch):
    fixed = datetime(2026, 11, 1, 3, 59, 0, tzinfo=timezone.utc)
    monkeypatch.setattr(pec, "_now_utc", lambda: fixed)
    try:
        import stripe
        def _fake_create(**kw):
            class S: id = "cs_test_dummy"; url = "https://stripe.test/dummy"
            return S()
        monkeypatch.setattr(stripe.checkout.Session, "create", staticmethod(_fake_create))
    except Exception:
        pass
    body = {
        "items": [{
            "product_id": "lady-jay", "quantity": 1, "tier": "foundation",
            "ringSize": "US 6",
        }],
        "customer_email": "TEST_iter36@example.com","shipping_country":"US",
    }
    resp = app_client.post("/api/checkout/stripe/session", json=body)
    # Must NOT be SEASONALLY_RETIRED. 503 (metal spot) or Stripe-config error are fine.
    assert "SEASONALLY_RETIRED" not in resp.text, resp.text
