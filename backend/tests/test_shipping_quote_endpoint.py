"""API-level tests for /api/checkout/shipping-quote + /api/checkout/shipping-countries."""
import os
import pytest
from fastapi.testclient import TestClient

from server import app

client = TestClient(app)


# ────────────────────────────  /shipping-countries  ───
def test_shipping_countries_endpoint_returns_full_allowlist_and_zones():
    r = client.get("/api/checkout/shipping-countries")
    assert r.status_code == 200
    payload = r.json()
    assert payload["currency"] == "USD"
    assert "CA" in payload["allowed_countries"]
    assert "US" in payload["allowed_countries"]
    assert "GB" in payload["allowed_countries"]
    assert "MX" in payload["allowed_countries"]
    # Sanctioned/excluded countries must not surface.
    for c in ("RU", "KP", "IR", "SY"):
        assert c not in payload["allowed_countries"]
    # Zones metadata present with 4 tiers.
    assert set(payload["zones"].keys()) == {"CA", "US", "INTL_TIER_1", "INTL_TIER_2"}
    assert payload["zones"]["CA"]["delivery_estimate_business_days"] == [2, 7]
    assert payload["zones"]["US"]["delivery_estimate_business_days"] == [3, 8]


# ────────────────────────────  /shipping-quote  ───
@pytest.mark.parametrize("country,rate_cents,zone_key,service", [
    ("CA", 0,    "CA",          "Standard Shipping — Canada"),
    ("US", 3500, "US",          "Standard Shipping — United States"),
    ("GB", 6500, "INTL_TIER_1", "International Standard — Tier 1"),
    ("MX", 9500, "INTL_TIER_2", "International Standard — Tier 2"),
])
def test_shipping_quote_returns_display_only_trusted_quote(country, rate_cents, zone_key, service):
    r = client.post("/api/checkout/shipping-quote", json={"country": country})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["country"] == country
    assert body["zone_key"] == zone_key
    assert body["rate_cents"] == rate_cents
    assert body["currency"] == "USD"
    assert body["service_label"] == service
    assert body["insurance_required"] is True
    assert isinstance(body["delivery_estimate_business_days"], list)
    assert len(body["delivery_estimate_business_days"]) == 2


def test_shipping_quote_rejects_unsupported_destination():
    r = client.post("/api/checkout/shipping-quote", json={"country": "KP"})
    assert r.status_code == 400
    assert r.json()["detail"]["code"] == "UNSUPPORTED_DESTINATION"


def test_shipping_quote_rejects_invalid_country_format():
    r = client.post("/api/checkout/shipping-quote", json={"country": "USA"})
    assert r.status_code == 422 or r.status_code == 400  # Pydantic length or backend format
    r = client.post("/api/checkout/shipping-quote", json={"country": "X"})
    assert r.status_code == 422 or r.status_code == 400


def test_shipping_quote_forbids_extra_fields():
    """Client cannot inject monetary override fields."""
    r = client.post("/api/checkout/shipping-quote", json={
        "country": "US",
        "rate_cents": 1,
        "shipping_amount": 99999,
    })
    assert r.status_code == 422
