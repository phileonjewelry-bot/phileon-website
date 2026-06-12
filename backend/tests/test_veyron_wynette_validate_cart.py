"""Backend regression tests for /api/validate-cart on VEYRON NOIR (4 tiers),
WYNETTE'S PALETTE, and a Battenti Della Villa control tier."""

import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://labete-gallery.preview.emergentagent.com").rstrip("/")
VALIDATE_CART_URL = f"{BASE_URL}/api/validate-cart"


def _post(payload):
    return requests.post(VALIDATE_CART_URL, json=payload, timeout=15)


# --- VEYRON NOIR 4 tiers ---
VEYRON_TIERS = [
    ("silver", 1450),
    ("gold10k", 3500),
    ("gold14k", 5000),
    ("gold18k", 7000),
]


@pytest.mark.parametrize("tier_key,client_price", VEYRON_TIERS)
def test_validate_cart_veyron_noir_tier(tier_key, client_price):
    r = _post({"items": [{"product_key": "veyronNoir", "tier_key": tier_key, "quantity": 1, "client_price": client_price}]})
    assert r.status_code == 200, f"HTTP {r.status_code}: {r.text}"
    data = r.json()
    assert data.get("valid") is True, f"Expected valid=true: {data}"
    item = data["items"][0]
    assert item["valid"] is True
    assert abs(float(item["difference"])) < 0.01
    assert float(item["server_price"]) == float(client_price)


# --- Control: Battenti Della Villa silver = 2800 ---
def test_validate_cart_battenti_silver_control():
    r = _post({"items": [{"product_key": "battentiDellaVilla", "tier_key": "silver", "quantity": 1, "client_price": 2800}]})
    assert r.status_code == 200
    data = r.json()
    assert data["valid"] is True
    assert abs(float(data["items"][0]["difference"])) < 0.01


# --- Wynette's Palette tiers (live-computed; probe then validate) ---
WYNETTE_TIERS = ["silver", "gold10k", "gold14k"]


@pytest.mark.parametrize("tier_key", WYNETTE_TIERS)
def test_validate_cart_wynette_palette_tier(tier_key):
    # Probe to get canonical server price
    probe = _post({"items": [{"product_key": "wynettePalette", "tier_key": tier_key, "quantity": 1, "client_price": 0}]})
    assert probe.status_code == 200
    server_price = probe.json()["items"][0]["server_price"]
    assert server_price > 0, f"Got 0 server_price for wynette {tier_key}"
    # Validate at the canonical price
    r = _post({"items": [{"product_key": "wynettePalette", "tier_key": tier_key, "quantity": 1, "client_price": server_price}]})
    assert r.status_code == 200
    data = r.json()
    assert data["valid"] is True
    assert abs(float(data["items"][0]["difference"])) < 0.01


# --- Regression: existing product known-good controls ---
EXISTING_CONTROLS = [
    # (product_key, tier_key, client_price)  — probe-only when unknown
]


def test_validate_cart_rejects_wrong_price():
    """Sanity: sending wrong price should return valid=false with non-zero difference."""
    r = _post({"items": [{"product_key": "veyronNoir", "tier_key": "silver", "quantity": 1, "client_price": 999}]})
    assert r.status_code == 200
    data = r.json()
    assert data["valid"] is False
    assert abs(float(data["items"][0]["difference"])) > 0
