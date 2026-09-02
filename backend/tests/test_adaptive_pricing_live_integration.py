"""Live integration tests for PHILEON Adaptive Pricing + Display Localization.

Hits the public REACT_APP_BACKEND_URL to verify what an end-user actually
sees (through Kubernetes ingress → FastAPI).

NOTE: These tests will actually create Stripe test Checkout Sessions. No
real payments are ever completed. Historical order PHI-20260901-4CBC5C is
never mutated.
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://labete-gallery.preview.emergentagent.com").rstrip("/")


def _cart():
    return [{
        "product_id": "scacco-matto",
        "quantity": 1,
        "karat": "10K",
        "metalColour": "Yellow Gold",
        "ringSize": "7",
    }]


def _body(**over):
    b = {
        "items": _cart(),
        "customer_email": f"TEST_{uuid.uuid4().hex[:8]}@phileon.dev",
        "idempotency_key": f"TEST-{uuid.uuid4().hex}",
        "shipping_country": "CA",
    }
    b.update(over)
    return b


# ─────────────────── /api/i18n endpoints ───────────────────
class TestI18n:
    def test_currencies(self):
        r = requests.get(f"{BASE_URL}/api/i18n/currencies", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["base"] == "USD"
        assert set(d["currencies"]) == {"USD", "CAD", "GBP", "EUR", "AUD", "JPY"}

    def test_rates(self):
        r = requests.get(f"{BASE_URL}/api/i18n/rates", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["base"] == "USD"
        assert d["rates"]["USD"] == 1.0
        # Shape: fetched_at, age_seconds, is_stale, source
        for key in ("fetched_at", "age_seconds", "is_stale", "source"):
            assert key in d, f"missing {key}"
        assert d["source"] in ("frankfurter", "stale", "fallback")
        if d["source"] != "fallback":
            for c in ("CAD", "GBP", "EUR", "AUD", "JPY"):
                assert c in d["rates"], f"missing rate {c}"
                assert d["rates"][c] > 0

    @pytest.mark.parametrize("country,expected", [
        ("US", "USD"), ("CA", "CAD"), ("GB", "GBP"),
        ("DE", "EUR"), ("AU", "AUD"), ("JP", "JPY"),
        ("BR", "USD"),
    ])
    def test_currency_preview(self, country, expected):
        r = requests.get(f"{BASE_URL}/api/i18n/currency-preview?country={country}", timeout=10)
        assert r.status_code == 200, r.text
        assert r.json()["suggested_currency"] == expected


# ─────────────────── /api/checkout/health ───────────────────
class TestCheckoutHealth:
    def test_health_mode_test(self):
        r = requests.get(f"{BASE_URL}/api/checkout/health", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["mode"] == "test"
        assert d["credentials_present"] is True
        assert d["webhook_secret_present"] is True
        assert d["stripe_api_verified"] is True
        # Trusted catalog contains exactly 84 products
        assert len(d["supported_products"]) == 84, f"expected 84 got {len(d['supported_products'])}"


# ─────────────────── /api/checkout/stripe/session ───────────────────
CURRENCY_COUNTRY = [
    ("USD", "US"), ("CAD", "CA"), ("GBP", "GB"),
    ("EUR", "DE"), ("AUD", "AU"), ("JPY", "JP"),
]


class TestStripeSession:
    @pytest.mark.parametrize("cur,country", CURRENCY_COUNTRY)
    def test_valid_display_currency_creates_session(self, cur, country):
        body = _body(display_currency=cur, shipping_country=country)
        r = requests.post(f"{BASE_URL}/api/checkout/stripe/session", json=body, timeout=30)
        assert r.status_code == 200, f"[{cur}/{country}] {r.status_code} {r.text}"
        data = r.json()
        assert "checkout_url" in data
        # Stripe test session URL contains /c/pay/cs_test_
        assert "cs_test_" in data["checkout_url"], data["checkout_url"]
        assert data["order_number"].startswith("PHI-")

    def test_invalid_display_currency_400(self):
        body = _body(display_currency="INR")
        r = requests.post(f"{BASE_URL}/api/checkout/stripe/session", json=body, timeout=15)
        assert r.status_code == 400, r.text
        assert r.json()["detail"]["code"] == "INVALID_DISPLAY_CURRENCY"

    @pytest.mark.parametrize("field,value", [
        ("fx_rate", 0.75),
        ("presentment_amount", 100000),
        ("localized_unit_amount", 12345),
        ("localized_total", 99999),
        ("localized_shipping", 500),
        ("conversion_amount", 12345),
    ])
    def test_money_injection_rejected_422(self, field, value):
        body = _body(**{field: value})
        r = requests.post(f"{BASE_URL}/api/checkout/stripe/session", json=body, timeout=15)
        assert r.status_code == 422, f"[{field}] {r.status_code} {r.text}"
        payload = r.json()
        detail = payload.get("detail", [])
        assert any("extra_forbidden" in (e.get("type") or "") for e in detail), detail

    def test_omitted_display_currency_backward_compat(self):
        body = _body()  # no display_currency
        r = requests.post(f"{BASE_URL}/api/checkout/stripe/session", json=body, timeout=30)
        assert r.status_code == 200, r.text
        assert "cs_test_" in r.json()["checkout_url"]

    def test_canonical_order_stays_usd_with_cad(self):
        """Session status endpoint reports canonical currency USD."""
        idem = f"TEST-{uuid.uuid4().hex}"
        body = _body(display_currency="CAD", idempotency_key=idem)
        r = requests.post(f"{BASE_URL}/api/checkout/stripe/session", json=body, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        token = d.get("status_token")
        order_no = d["order_number"]
        if token:
            s = requests.get(
                f"{BASE_URL}/api/checkout/order/{order_no}/status",
                params={"token": token}, timeout=15,
            )
            assert s.status_code == 200, s.text
            body_s = s.json()
            assert body_s["currency"] == "USD", body_s
            assert body_s["total_cents"] > 0
