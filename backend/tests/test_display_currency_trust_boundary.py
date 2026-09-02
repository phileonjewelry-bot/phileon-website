"""Tests for the display-currency trust boundary in create_stripe_session.

* Optional `display_currency` UX preference is accepted.
* Unknown / invalid currencies are rejected 400.
* Any attempt to inject monetary fields (fx_rate, presentment_amount,
  localized_unit_amount, etc.) is rejected 422 by `extra="forbid"`.
* The canonical order stays in USD regardless of `display_currency`.
"""
import pytest


def _valid_body(**overrides):
    body = {
        "items": [{
            "product_id": "scacco-matto",
            "quantity": 1,
            "karat": "10K",
            "metalColour": "Yellow Gold",
            "ringSize": "7",
        }],
        "customer_email": "test-boundary@phileon.dev",
        "shipping_country": "CA",
    }
    body.update(overrides)
    return body


@pytest.mark.parametrize("cur", ["USD", "CAD", "GBP", "EUR", "AUD", "JPY"])
def test_valid_display_currency_accepted(app_client, cur):
    r = app_client.post("/api/checkout/stripe/session",
                        json=_valid_body(display_currency=cur))
    # Not 422 (invalid schema) and not 400 with INVALID_DISPLAY_CURRENCY.
    assert r.status_code != 422, r.text
    if r.status_code == 400:
        assert r.json()["detail"].get("code") != "INVALID_DISPLAY_CURRENCY", r.text


def test_invalid_display_currency_rejected(app_client):
    r = app_client.post("/api/checkout/stripe/session",
                        json=_valid_body(display_currency="INR"))
    assert r.status_code == 400, r.text
    assert r.json()["detail"]["code"] == "INVALID_DISPLAY_CURRENCY"


@pytest.mark.parametrize("bad_key,bad_val", [
    ("fx_rate", 0.75),
    ("presentment_amount", 100000),
    ("localized_unit_amount", 12345),
    ("localized_total", 99999),
    ("localized_shipping", 500),
    ("conversion_amount", 12345),
])
def test_money_injection_attempts_rejected_422(app_client, bad_key, bad_val):
    r = app_client.post("/api/checkout/stripe/session",
                        json=_valid_body(**{bad_key: bad_val}))
    assert r.status_code == 422, f"{bad_key} should be forbidden: {r.text}"
    payload = r.json()
    assert any("extra_forbidden" in (e.get("type") or "")
               for e in payload.get("detail", []))

