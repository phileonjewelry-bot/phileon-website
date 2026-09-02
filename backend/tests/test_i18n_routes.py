"""Tests for the /api/i18n/* endpoints."""


def test_list_currencies(app_client):
    r = app_client.get("/api/i18n/currencies")
    assert r.status_code == 200
    d = r.json()
    assert d["base"] == "USD"
    for c in ("USD", "CAD", "GBP", "EUR", "AUD", "JPY"):
        assert c in d["currencies"]


def test_currency_preview_country_hints(app_client):
    for country, expected in [
        ("US", "USD"), ("CA", "CAD"), ("GB", "GBP"),
        ("DE", "EUR"), ("AU", "AUD"), ("JP", "JPY"),
        ("BR", "USD"),  # fallback
    ]:
        r = app_client.get(f"/api/i18n/currency-preview?country={country}")
        assert r.status_code == 200, r.text
        assert r.json()["suggested_currency"] == expected, f"{country} -> {r.json()}"


def test_rates_endpoint_returns_shape(app_client):
    r = app_client.get("/api/i18n/rates")
    assert r.status_code == 200
    d = r.json()
    assert d["base"] == "USD"
    assert "USD" in d["rates"]
    assert d["rates"]["USD"] == 1.0

