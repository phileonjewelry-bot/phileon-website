"""PHILEON Layer 2 — Admin fulfillment E2E via public backend URL.

Exercises the live routes with a minted admin JWT. Tests do NOT mutate
the historical order PHI-20260901-4CBC5C. Where mutations are required,
we operate on freshly seeded synthetic docs via a direct Mongo write
(no Stripe, no email, no label purchase).
"""
from __future__ import annotations
import os
import pytest
import requests
from datetime import datetime, timezone

# Mint token via server.create_token
import sys
sys.path.insert(0, "/app/backend")
from server import create_token  # noqa: E402

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://labete-gallery.preview.emergentagent.com").rstrip("/")
TOKEN = create_token("admin")
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}


# ─── AUTH ────────────────────────────────────────────────────────

def test_queue_requires_token():
    r = requests.get(f"{BASE_URL}/api/admin/orders?status=needs_review", timeout=15)
    assert r.status_code in (401, 403), f"unexpected {r.status_code}: {r.text[:200]}"


def test_queue_with_token_ok():
    r = requests.get(f"{BASE_URL}/api/admin/orders?status=needs_review",
                     headers=HEADERS, timeout=15)
    assert r.status_code == 200, r.text[:300]
    body = r.json()
    assert "orders" in body and "count" in body


def test_queue_no_secret_leakage():
    r = requests.get(f"{BASE_URL}/api/admin/orders?status=all&limit=200",
                     headers=HEADERS, timeout=20)
    assert r.status_code == 200
    dumped = r.text
    for banned in ("provider_session_id", "provider_payment_intent_id",
                   "status_token_hash", "email_status_token",
                   "webhook_event_ids", "fx_rate", "fx_rate_source"):
        assert banned not in dumped, f"leaked field {banned} in queue response"


# ─── STATUS FILTERS ──────────────────────────────────────────────

@pytest.mark.parametrize("status", [
    "needs_review", "in_preparation", "ready_to_ship",
    "shipped", "on_hold", "cancelled", "all",
])
def test_queue_all_valid_status_tabs(status):
    r = requests.get(f"{BASE_URL}/api/admin/orders?status={status}",
                     headers=HEADERS, timeout=15)
    assert r.status_code == 200, f"{status}: {r.text[:200]}"


def test_queue_invalid_status():
    r = requests.get(f"{BASE_URL}/api/admin/orders?status=bogus",
                     headers=HEADERS, timeout=15)
    assert r.status_code == 400
    assert r.json()["detail"]["code"] == "INVALID_STATUS"


# ─── HISTORICAL ORDER (READ-ONLY) ────────────────────────────────

HISTORICAL = "PHI-20260901-4CBC5C"


def test_historical_order_in_needs_review_untouched():
    r = requests.get(f"{BASE_URL}/api/admin/orders?status=needs_review&limit=200",
                     headers=HEADERS, timeout=15)
    assert r.status_code == 200
    orders = r.json()["orders"]
    hist = next((o for o in orders if o["order_number"] == HISTORICAL), None)
    assert hist is not None, "PHI-20260901-4CBC5C must appear in needs_review"
    assert hist["payment_status"] == "paid"
    assert hist["currency"] == "CAD"
    assert hist["total_cents"] == 2265000


def test_historical_order_detail_has_eligibility():
    r = requests.get(f"{BASE_URL}/api/admin/orders/{HISTORICAL}",
                     headers=HEADERS, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "eligibility" in d
    assert "eligible" in d["eligibility"]
    assert "reasons" in d["eligibility"]
    assert "requires" in d["eligibility"]
    assert "shipping" in d
    assert "signature_required" in d["shipping"]
    assert "insurance_required" in d["shipping"]
    assert "presentment_integrity_status" in d
    assert "fulfillment_hold_reason" in d


def test_historical_order_audit_endpoint():
    r = requests.get(f"{BASE_URL}/api/admin/orders/{HISTORICAL}/audit",
                     headers=HEADERS, timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert "audit" in body
    # No money fields in audit
    dumped = r.text
    for banned in ("total_cents", "unit_amount_cents", "provider_session_id",
                   "webhook_event_ids", "status_token_hash", "email_status_token"):
        assert banned not in dumped


# ─── SEED SYNTHETIC ORDER FOR MUTATIONS ──────────────────────────

def _seed_order(**overrides):
    """Insert a synthetic order via direct Mongo write for test-only mutation."""
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    on = f"PHI-TEST-{datetime.now(timezone.utc).strftime('%H%M%S%f')}"
    doc = {
        "order_number": on,
        "id": on,
        "payment_status": "paid",
        "shipping_integrity_status": "ok",
        "presentment_integrity_status": "ok",
        "shipping": {
            "country": "US",
            "service_label": "Standard · US",
            "signature_required": False,
            "insurance_required": False,
        },
        "currency": "USD",
        "total_cents": 35000,
        "items": [{"product_name": "Test Ring", "variant": "v", "quantity": 1,
                   "unit_amount_cents": 35000}],
        "customer_email": "phileon.jewelry@gmail.com",
        "created_at": datetime.now(timezone.utc),
        "shipping_notification_sent": False,
        "fulfillment_status": None,
    }
    doc.update(overrides)

    async def _ins():
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        await db.orders_v2.insert_one(doc)
        client.close()
    asyncio.run(_ins())
    return on


def _cleanup(on: str):
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")

    async def _del():
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        await db.orders_v2.delete_one({"order_number": on})
        await db.fulfillment_audit.delete_many({"order_number": on})
        client.close()
    asyncio.run(_del())


# ─── MARK-SHIPPED INTEGRITY GATES ────────────────────────────────

def test_mark_shipped_blocked_by_shipping_integrity():
    on = _seed_order(shipping_integrity_status="pending_review")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                          headers=HEADERS,
                          json={"carrier": "UPS", "tracking_number": "1Z999AA10123456784"},
                          timeout=15)
        assert r.status_code == 409, r.text
        d = r.json()["detail"]
        assert d["code"] == "NOT_ELIGIBLE"
        assert "shipping_integrity_pending_review" in d["reasons"]
    finally:
        _cleanup(on)


def test_mark_shipped_blocked_by_presentment_integrity():
    on = _seed_order(presentment_integrity_status="pending_review")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                          headers=HEADERS,
                          json={"carrier": "UPS", "tracking_number": "1Z999AA10123456784"},
                          timeout=15)
        assert r.status_code == 409
        d = r.json()["detail"]
        assert d["code"] == "NOT_ELIGIBLE"
        assert "presentment_integrity_pending_review" in d["reasons"]
    finally:
        _cleanup(on)


def test_approve_blocked_by_integrity():
    on = _seed_order(shipping_integrity_status="pending_review")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/approve",
                          headers=HEADERS, json={}, timeout=15)
        assert r.status_code == 409
        assert r.json()["detail"]["code"] == "NOT_ELIGIBLE"
        assert "shipping_integrity_pending_review" in r.json()["detail"]["reasons"]
    finally:
        _cleanup(on)


# ─── HOLD / RELEASE ──────────────────────────────────────────────

def test_hold_and_release_flow():
    on = _seed_order(fulfillment_status="in_preparation")
    try:
        # hold with too-short reason → 422
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/hold",
                          headers=HEADERS, json={"reason": "no"}, timeout=15)
        assert r.status_code == 422

        # extra field → 422
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/hold",
                          headers=HEADERS,
                          json={"reason": "address concern", "carrier": "UPS"}, timeout=15)
        assert r.status_code == 422

        # valid hold
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/hold",
                          headers=HEADERS,
                          json={"reason": "address concern"}, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["fulfillment_status"] == "on_hold"
        assert body["fulfillment_hold_reason"] == "address concern"
        assert body["payment_status"] == "paid"

        # release-hold — integrity green → success → pending_review
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/release-hold",
                          headers=HEADERS, json={"note": "resolved"}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["fulfillment_status"] == "pending_review"
    finally:
        _cleanup(on)


def test_release_hold_blocked_when_integrity_red():
    on = _seed_order(fulfillment_status="on_hold",
                     shipping_integrity_status="pending_review")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/release-hold",
                          headers=HEADERS, json={}, timeout=15)
        assert r.status_code == 409
        assert r.json()["detail"]["code"] == "NOT_ELIGIBLE"
    finally:
        _cleanup(on)


# ─── LIFECYCLE ───────────────────────────────────────────────────

def test_prepare_requires_approved():
    on = _seed_order()
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/prepare",
                          headers=HEADERS, json={}, timeout=15)
        assert r.status_code == 409
        assert r.json()["detail"]["code"] == "INVALID_TRANSITION"
    finally:
        _cleanup(on)


def test_full_lifecycle():
    on = _seed_order()
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/approve",
                          headers=HEADERS, json={}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["fulfillment_status"] == "approved_for_fulfillment"

        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/prepare",
                          headers=HEADERS, json={}, timeout=15)
        assert r.status_code == 200
        assert r.json()["fulfillment_status"] == "in_preparation"

        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/ready-to-ship",
                          headers=HEADERS, json={}, timeout=15)
        assert r.status_code == 200
        assert r.json()["fulfillment_status"] == "ready_to_ship"

        # Now mark shipped
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                          headers=HEADERS,
                          json={"carrier": "UPS",
                                "tracking_number": "  1Z 999 AA 10  "},
                          timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["tracking_url"].startswith("https://www.ups.com/track")

        # Audit trail exists, sorted newest first
        r = requests.get(f"{BASE_URL}/api/admin/orders/{on}/audit",
                         headers=HEADERS, timeout=15)
        assert r.status_code == 200
        rows = r.json()["audit"]
        actions = [x["action"] for x in rows]
        assert "mark_shipped" in actions
        assert "transition:approved_for_fulfillment" in actions

        # Verify tracking number was sanitized ('1Z999AA10')
        r = requests.get(f"{BASE_URL}/api/admin/orders/{on}",
                         headers=HEADERS, timeout=15)
        assert r.json()["tracking_number"] == "1Z999AA10"
    finally:
        _cleanup(on)


# ─── TRACKING URL / SANITIZATION ─────────────────────────────────

def test_tracking_url_ups():
    on = _seed_order(fulfillment_status="ready_to_ship")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                          headers=HEADERS,
                          json={"carrier": "UPS",
                                "tracking_number": "1Z999AA10123456784"},
                          timeout=20)
        assert r.status_code == 200
        assert r.json()["tracking_url"].startswith("https://www.ups.com/track")
    finally:
        _cleanup(on)


def test_tracking_url_fedex():
    on = _seed_order(fulfillment_status="ready_to_ship")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                          headers=HEADERS,
                          json={"carrier": "FedEx", "tracking_number": "T-1234"},
                          timeout=20)
        assert r.status_code == 200
        assert "fedex.com" in r.json()["tracking_url"]
    finally:
        _cleanup(on)


def test_tracking_url_unknown_carrier_is_null():
    on = _seed_order(fulfillment_status="ready_to_ship")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                          headers=HEADERS,
                          json={"carrier": "Random Freight",
                                "tracking_number": "X-1"},
                          timeout=20)
        assert r.status_code == 200
        assert r.json()["tracking_url"] is None
    finally:
        _cleanup(on)


def test_tracking_url_explicit_https_passthrough():
    on = _seed_order(fulfillment_status="ready_to_ship")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                          headers=HEADERS,
                          json={"carrier": "UPS", "tracking_number": "1Z999",
                                "tracking_url": "https://custom.example/track"},
                          timeout=20)
        assert r.status_code == 200
        assert r.json()["tracking_url"] == "https://custom.example/track"
    finally:
        _cleanup(on)


def test_tracking_url_javascript_falls_back():
    on = _seed_order(fulfillment_status="ready_to_ship")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                          headers=HEADERS,
                          json={"carrier": "UPS", "tracking_number": "1Z999",
                                "tracking_url": "javascript:alert(1)"},
                          timeout=20)
        assert r.status_code == 200
        assert r.json()["tracking_url"].startswith("https://www.ups.com/track")
    finally:
        _cleanup(on)


def test_tracking_number_invalid_after_sanitize():
    on = _seed_order(fulfillment_status="ready_to_ship")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                          headers=HEADERS,
                          json={"carrier": "UPS",
                                "tracking_number": "<>< >"},
                          timeout=20)
        # After sanitization -> empty -> 422
        assert r.status_code == 422, r.text
        assert r.json()["detail"]["code"] == "INVALID_TRACKING_NUMBER"
    finally:
        _cleanup(on)


def test_double_shipment_second_is_noop():
    on = _seed_order(fulfillment_status="ready_to_ship")
    try:
        payload = {"carrier": "UPS", "tracking_number": "1Z999AA10"}
        r1 = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                           headers=HEADERS, json=payload, timeout=20)
        assert r1.status_code == 200
        assert r1.json()["ok"] is True
        # email_sent may be True or False depending on Resend config, but the
        # invariant is: first call attempts send, second call does NOT.
        r2 = requests.post(f"{BASE_URL}/api/admin/orders/{on}/mark-shipped",
                           headers=HEADERS, json=payload, timeout=20)
        assert r2.status_code == 200
        assert r2.json()["email_sent"] is False
        # Audit should have a mark_shipped_noop row
        r = requests.get(f"{BASE_URL}/api/admin/orders/{on}/audit",
                         headers=HEADERS, timeout=15)
        actions = [x["action"] for x in r.json()["audit"]]
        assert "mark_shipped_noop" in actions
    finally:
        _cleanup(on)


# ─── CORRECT-SHIPMENT ────────────────────────────────────────────

def test_correct_shipment_requires_shipped():
    on = _seed_order(fulfillment_status="in_preparation")
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/correct-shipment",
                          headers=HEADERS,
                          json={"tracking_number": "NEW-123",
                                "reason": "carrier issued new label"},
                          timeout=15)
        assert r.status_code == 409
        assert r.json()["detail"]["code"] == "NOT_SHIPPED"
    finally:
        _cleanup(on)


def test_correct_shipment_records_previous():
    on = _seed_order(fulfillment_status="shipped", carrier="UPS",
                     tracking_number="OLD-123",
                     tracking_url="https://www.ups.com/track?tracknum=OLD-123",
                     shipping_notification_sent=True)
    try:
        r = requests.post(f"{BASE_URL}/api/admin/orders/{on}/correct-shipment",
                          headers=HEADERS,
                          json={"tracking_number": "NEW-456",
                                "reason": "carrier issued new label"},
                          timeout=15)
        assert r.status_code == 200, r.text
        # Verify audit row contains previous + new
        r = requests.get(f"{BASE_URL}/api/admin/orders/{on}/audit",
                         headers=HEADERS, timeout=15)
        rows = r.json()["audit"]
        corr = [x for x in rows if x["action"] == "correct_shipment"]
        assert corr
        assert corr[0]["extra"]["previous"]["tracking_number"] == "OLD-123"
        assert corr[0]["extra"]["new"]["tracking_number"] == "NEW-456"
    finally:
        _cleanup(on)
