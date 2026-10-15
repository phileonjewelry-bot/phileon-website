"""Tests for PARABOLA USD pricing fix (no double CAD->USD conversion)."""
import os
import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://labete-gallery.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")

TIERS = [
    ("sterling", 125000, "PARABOLA-STERLING-SZ6"),
    ("whiteGold10k", 780000, "PARABOLA-WHITEGOLD10K-SZ6"),
    ("roseGold10k", 780000, "PARABOLA-ROSEGOLD10K-SZ6"),
]


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.mark.parametrize("tier,expected_cents,expected_sku", TIERS)
def test_stripe_session_parabola_usd(client, tier, expected_cents, expected_sku):
    """Backend should resolve USD prices with no double conversion."""
    import uuid
    payload = {
        "items": [{
            "product_id": "parabola",
            "tier": tier,
            "ringSize": "US 6",
            "quantity": 1,
            "displayed_unit_amount_cents": expected_cents,
        }],
        "shipping_country": "US",
        "customer_email": "qa@example.com",
        "idempotency_key": f"test-{tier}-{uuid.uuid4().hex[:8]}",
    }
    r = client.post(f"{BASE_URL}/api/checkout/stripe/session", json=payload, timeout=30)
    print(f"[{tier}] status={r.status_code} body={r.text[:800]}")
    assert r.status_code != 409 or "PRICE_MOVED" not in r.text, f"Unexpected PRICE_MOVED for {tier}"
    assert r.status_code == 200, f"Expected 200 for {tier}, got {r.status_code}: {r.text[:400]}"
    data = r.json()
    order_number = data.get("order_number")
    assert order_number, f"No order_number in response: {data}"
    # Verify stored order in Mongo for canonical USD/SKU/unit_amount
    from pymongo import MongoClient
    import time
    mongo_url = os.environ.get("MONGO_URL") or "mongodb://localhost:27017"
    # The live preview backend writes to the persistent DB (not pytest's disposable DB)
    db_name = os.environ.get("PHILEON_PERSISTENT_DB_NAME") or "phileon_db"
    print(f"[DEBUG] MONGO_URL={mongo_url} DB_NAME={db_name}")
    mc = MongoClient(mongo_url)
    db = mc[db_name]
    order = None
    for i in range(10):
        order = db.orders_v2.find_one({"order_number": order_number})
        if order and (order.get("line_items") or order.get("items")):
            break
        time.sleep(0.5)
    print(f"[DEBUG] order found after wait: {bool(order)}; keys={list(order.keys()) if order else None}")
    assert order, f"Order {order_number} not persisted"
    assert order.get("currency") == "USD", f"{tier}: expected USD, got {order.get('currency')}"
    lines = order.get("line_items") or order.get("items") or []
    assert lines, f"No line items persisted for order {order_number}"
    line = lines[0]
    assert line.get("unit_amount_cents") == expected_cents, f"{tier}: expected {expected_cents} got {line.get('unit_amount_cents')}"
    assert line.get("sku") == expected_sku, f"{tier}: expected sku {expected_sku} got {line.get('sku')}"


def test_price_moved_guard_sterling(client):
    """Sending stale lower price must trigger 409 PRICE_MOVED with trusted 125000."""
    payload = {
        "items": [{
            "product_id": "parabola",
            "tier": "sterling",
            "ringSize": "US 6",
            "quantity": 1,
            "displayed_unit_amount_cents": 95000,
        }],
        "shipping_country": "US",
        "customer_email": "qa@example.com",
    }
    r = client.post(f"{BASE_URL}/api/checkout/stripe/session", json=payload, timeout=30)
    print(f"[price_moved] status={r.status_code} body={r.text[:800]}")
    assert r.status_code == 409, f"Expected 409 got {r.status_code}"
    data = r.json()
    body_text = r.text
    assert "PRICE_MOVED" in body_text, f"Expected PRICE_MOVED code: {body_text[:400]}"
    # Pull new price from nested detail
    detail = data.get("detail", data)
    if isinstance(detail, dict):
        new_price = detail.get("new_trusted_price_cents")
        if new_price is None:
            # might be in items list
            items = detail.get("items") or detail.get("moved_items") or []
            if items:
                new_price = items[0].get("new_trusted_price_cents") or items[0].get("trusted_price_cents")
        assert new_price == 125000, f"Expected new_trusted_price_cents 125000, got {new_price}; detail={detail}"


def test_validate_cart_parabola(client):
    payload = {
        "items": [
            {"product_key": "parabola", "tier_key": "sterling", "client_price": 1250},
            {"product_key": "parabola", "tier_key": "whiteGold10k", "client_price": 7800},
            {"product_key": "parabola", "tier_key": "roseGold10k", "client_price": 7800},
        ]
    }
    r = client.post(f"{BASE_URL}/api/validate-cart", json=payload, timeout=30)
    print(f"[validate-cart] status={r.status_code} body={r.text[:800]}")
    assert r.status_code == 200, f"Expected 200 got {r.status_code}: {r.text[:400]}"
    data = r.json()
    items = data.get("items") or data.get("results") or []
    assert len(items) == 3, f"Expected 3 items, got {len(items)}: {data}"
    for it in items:
        assert it.get("valid") is True, f"Item not valid: {it}"
        diff = it.get("difference", it.get("diff"))
        assert diff == 0, f"Expected diff 0, got {diff}: {it}"
