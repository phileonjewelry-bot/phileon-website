"""PHILEON — Stripe pre-traffic hardening tests.

Verifies:
  1. Environment mode / key-prefix guard rejects mismatched configuration
     and accepts matched configuration.
  2. `test_gold_multiplier` remains inert under STRIPE_MODE=live.
  3. Legacy Stripe endpoints all return 410.
  4. Trusted checkout produces Canada-only shipping with a $0 free option.
  5. Paid-order email builder never leaks card/Stripe/pricing internals.
"""
from __future__ import annotations

import os
from unittest.mock import patch
import pytest
from fastapi import HTTPException

# Guard under test
from routes.checkout import _validate_stripe_config, _resolve_stripe_mode


# ─────────────────────────────  1) Mode / key guard  ────────────────────────
MATRIX = [
    # (mode, sk, whsec, expect_ok, expect_code)
    ("test", "sk_test_dummy_1234",  "whsec_test_1234", True,  None),
    ("live", "sk_live_dummy_1234",  "whsec_live_1234", True,  None),
    ("test", "sk_live_dummy_1234",  "whsec_test_1234", False, "PAYMENT_MODE_MISMATCH"),
    ("live", "sk_test_dummy_1234",  "whsec_live_1234", False, "PAYMENT_MODE_MISMATCH"),
    ("test", "",                    "whsec_test_1234", False, "PAYMENT_NOT_CONFIGURED"),
    ("test", "sk_test_dummy_1234",  "",                False, "PAYMENT_NOT_CONFIGURED"),
    ("test", "not_a_real_stripe_key", "whsec_test_1", False, "PAYMENT_MODE_MISMATCH"),
    ("test", "sk_test_dummy_1234",  "malformed_secret", False, "PAYMENT_MISCONFIGURED"),
    ("bogus", "sk_test_dummy_1234", "whsec_test_1234", False, "PAYMENT_MISCONFIGURED"),
]


@pytest.mark.parametrize("mode,sk,whsec,ok,code", MATRIX)
def test_stripe_env_guard_matrix(monkeypatch, mode, sk, whsec, ok, code):
    monkeypatch.setenv("STRIPE_MODE", mode)
    if sk:
        monkeypatch.setenv("STRIPE_SECRET_KEY", sk)
    else:
        monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)
    if whsec:
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", whsec)
    else:
        monkeypatch.delenv("STRIPE_WEBHOOK_SECRET", raising=False)
    if ok:
        assert _validate_stripe_config() in ("test", "live")
    else:
        with pytest.raises(HTTPException) as ei:
            _validate_stripe_config()
        assert ei.value.status_code == 503
        assert ei.value.detail["code"] == code
        # NEVER leak the key itself in the error message.
        if sk:
            assert sk not in str(ei.value.detail)


def test_env_guard_never_leaks_key(monkeypatch):
    secret = "sk_live_extremely_sensitive_do_not_log_9zXy"
    monkeypatch.setenv("STRIPE_MODE", "test")
    monkeypatch.setenv("STRIPE_SECRET_KEY", secret)
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_1")
    with pytest.raises(HTTPException) as ei:
        _validate_stripe_config()
    assert secret not in str(ei.value.detail)
    assert secret not in repr(ei.value.detail)


# ─────────────────────────────  2) test_gold_multiplier gated in live  ─────
def test_gold_multiplier_inert_in_live_mode(monkeypatch):
    from fastapi.testclient import TestClient
    monkeypatch.setenv("STRIPE_MODE", "live")
    # Fresh reload so /market-prices sees the updated env for its `os.environ.get`.
    from importlib import reload
    import server
    reload(server)
    client = TestClient(server.app)
    baseline = client.get("/api/market-prices").json()
    inflated = client.get("/api/market-prices?test_gold_multiplier=2.0").json()
    assert abs(baseline["goldPerGram24kCad"] - inflated["goldPerGram24kCad"]) < 0.05, (
        "test_gold_multiplier must be inert under STRIPE_MODE=live"
    )


# ─────────────────────────────  3) Legacy Stripe endpoints all 410  ────────
def test_legacy_stripe_endpoints_are_410(monkeypatch):
    from fastapi.testclient import TestClient
    from importlib import reload
    import server
    reload(server)
    client = TestClient(server.app)
    legacy = [
        ("POST", "/api/stripe/create-payment-intent", {}),
        ("POST", "/api/stripe/create-checkout-session", {}),
        ("POST", "/api/stripe/confirm-payment", {}),
        ("POST", "/api/stripe/webhook", {}),
        ("GET",  "/api/stripe/session/cs_test_dummy", None),
        ("GET",  "/api/stripe/config", None),
    ]
    for method, path, body in legacy:
        r = client.request(method, path, json=body)
        assert r.status_code == 410, f"{method} {path} -> {r.status_code}"
        assert r.json()["detail"]["code"] == "LEGACY_ENDPOINT_DISABLED"


# ─────────────────────────────  4) Paid-order email hygiene  ───────────────
def test_paid_order_email_never_leaks_stripe_or_card_data():
    from services.order_emails import build_customer_paid_email, build_internal_paid_notification
    order = {
        "order_number": "PHI-20260228-ABC123",
        "currency": "CAD",
        "total_cents": 2265000,
        "customer_email": "customer@example.com",
        "provider_session_id": "cs_test_should_never_appear",
        "provider_payment_intent_id": "pi_test_should_never_appear",
        "status_token_hash": "abcdef1234567890",
        "idempotency_key": "email@example.com:cart",
        "items": [
            {
                "product_name": "LA MARVA", "variant": "Heirloom · US 7",
                "quantity": 1, "unit_amount_cents": 2265000, "currency": "CAD",
                "metadata": {"market_source": "gold-api.com", "market_timestamp": "1"},
            }
        ],
    }
    c = build_customer_paid_email(order)
    i = build_internal_paid_notification(order)
    for blob in (c["html"], c["text"], i["html"], i["text"]):
        for banned in ("cs_test_", "pi_test_", "status_token_hash", "idempotency_key",
                       "market_source", "market_timestamp", "sk_", "whsec_",
                       "4242", "cvc", "card_number"):
            assert banned not in blob, f"leaked '{banned}' in email body"
    # Contains expected order info.
    assert order["order_number"] in c["html"]
    assert "$22,650.00 CAD" in c["html"]


def test_paid_order_email_shipping_wording_matches_policy():
    from services.order_emails import build_customer_paid_email
    cad = build_customer_paid_email({"order_number": "PHI-1", "currency": "CAD",
                                      "total_cents": 100, "items": []})
    usd = build_customer_paid_email({"order_number": "PHI-2", "currency": "USD",
                                      "total_cents": 100, "items": []})
    # Canada: policy wording + approximate 2–7 business-day window after fulfillment.
    assert "Canada" in cad["text"]
    assert "Canada Post or UPS" in cad["text"]
    assert "2" in cad["text"] and "7" in cad["text"] and "business days" in cad["text"]
    assert "after fulfillment" in cad["text"]
    # US / International: no rate promised, duties remain customer responsibility.
    assert "calculated at checkout" in usd["text"]
    assert "duties" in usd["text"] and "customer's responsibility" in usd["text"]


def _mk_order(currency, total, item_amount_cents, item_currency_field=None):
    item = {"product_name": "LA MARVA", "variant": "Heirloom · US 7",
            "quantity": 1, "unit_amount_cents": item_amount_cents}
    # item-level currency field, when present, MUST NOT influence rendering
    if item_currency_field is not None:
        item["currency"] = item_currency_field
    return {"order_number": "PHI-REGR-1", "currency": currency,
            "total_cents": total, "customer_email": "c@example.com",
            "items": [item]}


def test_customer_email_line_item_currency_follows_order_currency_cad():
    from services.order_emails import build_customer_paid_email
    o = _mk_order("CAD", 2265000, 2265000)          # no per-item currency
    m = build_customer_paid_email(o)
    for blob in (m["html"], m["text"]):
        assert "$22,650.00 CAD" in blob, blob
        assert "USD" not in blob, "must not emit USD for a CAD order"


def test_customer_email_line_item_currency_follows_order_currency_usd():
    from services.order_emails import build_customer_paid_email
    o = _mk_order("USD", 430000, 430000)
    m = build_customer_paid_email(o)
    for blob in (m["html"], m["text"]):
        assert "$4,300.00 USD" in blob, blob
        assert "CAD" not in blob, "must not emit CAD for a USD order"


def test_customer_email_ignores_stale_per_item_currency_field():
    """orders_v2 items do not persist currency. If a stale item-level
    currency is present it must be ignored in favour of order-level."""
    from services.order_emails import build_customer_paid_email
    o = _mk_order("CAD", 2265000, 2265000, item_currency_field="USD")
    m = build_customer_paid_email(o)
    assert "$22,650.00 CAD" in m["html"]
    assert "USD" not in m["html"]


def test_internal_notification_line_item_currency_follows_order_currency_cad_and_usd():
    from services.order_emails import build_internal_paid_notification
    for ccy, cents, expected in [("CAD", 2265000, "$22,650.00 CAD"),
                                  ("USD", 430000,  "$4,300.00 USD")]:
        o = _mk_order(ccy, cents, cents, item_currency_field=("USD" if ccy == "CAD" else "CAD"))
        m = build_internal_paid_notification(o)
        assert expected in m["html"]
        assert expected in m["text"]
        # Opposite currency must not appear in the same email.
        opposite = "USD" if ccy == "CAD" else "CAD"
        assert opposite not in m["html"], f"leaked opposite currency in internal HTML: {opposite}"
        assert opposite not in m["text"], f"leaked opposite currency in internal text: {opposite}"


def test_customer_email_mobile_heading_stacked_and_responsive():
    """Editorial ORDER / CONFIRMED. must render on two intentional lines and
    include a mobile media-query fallback so no client wraps mid-word."""
    from services.order_emails import build_customer_paid_email
    m = build_customer_paid_email({"order_number": "PHI-R", "currency": "CAD",
                                    "total_cents": 100, "items": []})
    html = m["html"]
    # Stacked masthead lines
    assert "<span style='display:block'>ORDER</span>" in html
    assert "<span style='display:block'>CONFIRMED.</span>" in html
    # No mid-word breaking allowed
    assert "word-break:keep-all" in html
    assert "overflow-wrap:normal" in html
    # Mobile media query shrinks the heading further on small screens.
    assert "@media (max-width: 480px)" in html
    assert ".phi-h1" in html


def test_customer_email_line_item_stacks_on_narrow_mobile():
    """Narrow-mobile line-item layout must stack metadata and price so the
    variant ('Heirloom · US 7') never wraps awkwardly. Desktop rendering is
    unaffected (media query only applies at max-width: 480px)."""
    from services.order_emails import build_customer_paid_email
    m = build_customer_paid_email({
        "order_number": "PHI-STACK",
        "currency": "CAD",
        "total_cents": 2265000,
        "items": [{"product_name": "LA MARVA", "variant": "Heirloom · US 7",
                    "quantity": 1, "unit_amount_cents": 2265000}],
    })
    html = m["html"]
    # Classes present on both cells so the media query can address them.
    assert "class='phi-li-meta'" in html
    assert "class='phi-li-price'" in html
    assert "class='phi-li-variant'" in html
    # Media query stacks the two cells at ≤ 480px.
    assert ".phi-li-meta{display:block !important" in html
    assert ".phi-li-price{display:block !important" in html
    # Price left-aligns in the stacked layout so it remains associated with the item.
    assert "text-align:left !important" in html
    # Variant becomes nowrap only inside the stacked layout — desktop unchanged.
    assert ".phi-li-variant{white-space:nowrap !important" in html
    # Desktop rendering NOT touched: variant div itself does NOT carry inline nowrap.
    assert "font-style:italic'>Heirloom · US 7" in html
    # Line-item price still renders correctly with currency.
    assert "$22,650.00 CAD" in html


# ─────────────────────────────  5) Canada-only shipping in session args  ───
def test_canada_only_shipping_in_stripe_session_args():
    """Static assertion: routes/checkout.py must configure Canada-only
    allowed_countries, a zero-amount Standard Shipping option, and the
    approved 2–7 business-day delivery estimate.
    """
    src = open("/app/backend/routes/checkout.py").read()
    assert '"allowed_countries": ["CA"]' in src, "Stripe session must restrict shipping to Canada"
    assert '"fixed_amount": {"amount": 0' in src, "Canada free-shipping option missing"
    # Delivery estimate window: 2–7 business days after fulfillment.
    assert '"unit": "business_day", "value": 2' in src, "Canada shipping minimum must be 2 business days"
    assert '"unit": "business_day", "value": 7' in src, "Canada shipping maximum must be 7 business days"
    # US / Intl allowed_countries must NOT be present as a hardcoded list.
    assert '"allowed_countries": ["US","CA","GB","AU"]' not in src, (
        "Removed until US/Intl dynamic shipping is wired"
    )
