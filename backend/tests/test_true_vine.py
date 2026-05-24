"""
THE TRUE VINE — cart validation tests (16 SKU combos + tampering)
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
VALIDATE_URL = f"{BASE_URL}/api/validate-cart"

TRUE_VINE_PRICES = {
    "foundation__pendant-only": 2200,
    "foundation__rope-20":      2650,
    "foundation__rope-22":      2750,
    "foundation__rope-24":      2850,
    "signature__pendant-only":  4200,
    "signature__rope-20":       4850,
    "signature__rope-22":       4950,
    "signature__rope-24":       5100,
    "heirloom__pendant-only":   5200,
    "heirloom__rope-20":        6050,
    "heirloom__rope-22":        6150,
    "heirloom__rope-24":        6300,
    "collector__pendant-only":  6800,
    "collector__rope-20":       8000,
    "collector__rope-22":       8150,
    "collector__rope-24":       8300,
}


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _post(client, tier_key, client_price):
    payload = {"items": [{
        "product_key": "theTrueVine",
        "tier_key": tier_key,
        "client_price": client_price,
        "quantity": 1,
    }]}
    return client.post(VALIDATE_URL, json=payload, timeout=20)


@pytest.mark.parametrize("tier_key,price", list(TRUE_VINE_PRICES.items()))
def test_all_16_true_vine_combos_valid(api_client, tier_key, price):
    r = _post(api_client, tier_key, price)
    assert r.status_code == 200, f"{tier_key}@{price} -> {r.status_code} {r.text[:300]}"
    data = r.json()
    assert data["valid"] is True, f"{tier_key}@{price} -> {data}"
    assert data["items"][0]["valid"] is True


def test_tampered_signature_rope22_rejected(api_client):
    # Real=4950, client=4000, diff=950 (>$100 tolerance)
    r = _post(api_client, "signature__rope-22", 4000)
    assert r.status_code == 200
    data = r.json()
    assert data["valid"] is False, data
    item = data["items"][0]
    assert item["valid"] is False
    # server_price should be 4950
    sp = item.get("server_price") or item.get("live_price") or item.get("computed_price")
    assert sp == 4950, f"server_price mismatch: {item}"
    diff = item.get("difference") or item.get("price_difference")
    if diff is not None:
        assert abs(abs(diff) - 950) < 5, f"diff={diff}"


def test_heirloom_rope22_server_price(api_client):
    r = _post(api_client, "heirloom__rope-22", 6150)
    assert r.status_code == 200
    data = r.json()
    assert data["valid"] is True
    item = data["items"][0]
    sp = item.get("server_price") or item.get("live_price") or item.get("computed_price")
    if sp is not None:
        assert sp == 6150, item


def test_foundation_pendant_only(api_client):
    r = _post(api_client, "foundation__pendant-only", 2200)
    assert r.status_code == 200
    assert r.json()["valid"] is True


def test_collector_rope24(api_client):
    r = _post(api_client, "collector__rope-24", 8300)
    assert r.status_code == 200
    assert r.json()["valid"] is True
