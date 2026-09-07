"""PHILEON Layer 3 — Returns/RMA/Refund E2E HTTP tests against live backend.

Uses REACT_APP_BACKEND_URL. Seeds orders_v2 directly via Motor, cleans up.
Idempotent; PHI-TEST-* prefix only. Historical PHI-20260901-4CBC5C untouched.
"""
from __future__ import annotations
import hashlib
import os
import sys
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

sys.path.insert(0, "/app/backend")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL",
                          "https://labete-gallery.preview.emergentagent.com").rstrip("/")

_MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
_DB_NAME = os.environ.get("DB_NAME", "phileon_db")
_sync = MongoClient(_MONGO_URL)[_DB_NAME]


@pytest.fixture(scope="module")
def admin_token():
    from server import create_token
    return create_token("admin")


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


PLAINTEXT_TOKEN = "e2e-plaintext-token-" + uuid.uuid4().hex[:10]
TOKEN_HASH = hashlib.sha256(PLAINTEXT_TOKEN.encode()).hexdigest()


def _seed_order(order_number, *, items=None, shipped_days_ago=10, payment="paid"):
    now = datetime.now(timezone.utc)
    shipped_at = None if shipped_days_ago is None else (now - timedelta(days=shipped_days_ago))
    doc = {
        "id": order_number,
        "order_number": order_number,
        "status_token_hash": TOKEN_HASH,
        "customer_email": "e2e@example.com",
        "payment_status": payment,
        "shipped_at": shipped_at,
        "items": items or [{"product_name": "LA MARVA",
                             "variant": "14K Yellow Gold",
                             "ring_size": "US 7",
                             "quantity": 1,
                             "unit_amount_cents": 350000}],
        "currency": "USD",
        "total_cents": sum(i["unit_amount_cents"] * i["quantity"] for i in (items or [])) or 350000,
        "created_at": now,
    }
    _sync.orders_v2.insert_one(doc)
    return doc


@pytest.fixture
def cleanup_registry():
    reg = {"orders": [], "rmas": []}
    yield reg
    for o in reg["orders"]:
        _sync.orders_v2.delete_many({"order_number": o})
        _sync.returns.delete_many({"order_number": o})
        _sync.returns_audit.delete_many({"order_number": o})
    for r in reg["rmas"]:
        _sync.returns.delete_many({"rma_number": r})
        _sync.returns_audit.delete_many({"rma_number": r})


def _seed_case_direct(case):
    _sync.returns.insert_one(dict(case))


def _new_order_number():
    return f"PHI-TEST-{uuid.uuid4().hex[:8].upper()}"


# ────────────────────────────────────────────────────────────────
# Admin auth boundary
# ────────────────────────────────────────────────────────────────

def test_admin_returns_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/returns?status=new")
    assert r.status_code in (401, 403)


def test_admin_returns_bad_token():
    r = requests.get(f"{BASE_URL}/api/admin/returns?status=new",
                     headers={"Authorization": "Bearer INVALID"})
    assert r.status_code in (401, 403)


def test_admin_returns_ok_with_valid_jwt(auth_headers):
    r = requests.get(f"{BASE_URL}/api/admin/returns?status=new", headers=auth_headers)
    assert r.status_code == 200
    body = r.text
    for banned in ("status_token_hash", "email_status_token",
                   "webhook_event_ids", "provider_session_id"):
        assert banned not in body


def test_admin_returns_invalid_status_400(auth_headers):
    r = requests.get(f"{BASE_URL}/api/admin/returns?status=bogus", headers=auth_headers)
    assert r.status_code == 400
    assert r.json().get("detail", {}).get("code") == "INVALID_STATUS"


@pytest.mark.parametrize("tab", ["new", "under_review", "authorized", "received",
                                   "inspection", "refund", "refunded", "denied",
                                   "closed", "all"])
def test_admin_returns_all_valid_tabs(auth_headers, tab):
    r = requests.get(f"{BASE_URL}/api/admin/returns?status={tab}", headers=auth_headers)
    assert r.status_code == 200
    assert "cases" in r.json()


# ────────────────────────────────────────────────────────────────
# Customer request validation
# ────────────────────────────────────────────────────────────────

def test_customer_request_invalid_token_403(cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn)
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": "WRONG-TOKEN-VALUE", "reason": "changed_mind",
    })
    assert r.status_code == 403


def test_customer_request_invalid_reason_422(cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn)
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "nonsense",
    })
    assert r.status_code == 422


def test_customer_request_extra_field_422(cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn)
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN,
        "reason": "changed_mind", "total_cents": 1,
    })
    assert r.status_code == 422


# ────────────────────────────────────────────────────────────────
# Business flows
# ────────────────────────────────────────────────────────────────

def test_gold_happy_path_and_duplicate_conflict(cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn)
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "changed_mind",
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["status"] == "requested"
    cleanup_registry["rmas"].append(body["rma_number"])

    # Duplicate
    r2 = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "changed_mind",
    })
    assert r2.status_code == 409
    assert r2.json().get("detail", {}).get("code") == "ACTIVE_RMA_EXISTS"


def test_silver_denied_immediately(cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn, items=[{"product_name": "SS Chain",
                                "variant": "Sterling Silver",
                                "quantity": 1, "unit_amount_cents": 32000}])
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "changed_mind",
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["status"] == "denied"
    cleanup_registry["rmas"].append(body["rma_number"])


def test_custom_atelier_denied(cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn, items=[{"product_name": "Bespoke",
                                "variant": "Custom Atelier",
                                "quantity": 1, "unit_amount_cents": 800000}])
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "changed_mind",
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["status"] == "denied"
    cleanup_registry["rmas"].append(body["rma_number"])


def test_missing_shipped_at_owner_review(cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn, shipped_days_ago=None)
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "changed_mind",
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["status"] == "under_review"
    cleanup_registry["rmas"].append(body["rma_number"])


def test_warranty_reason_routes_review(cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn)
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "arrived_damaged",
    })
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "under_review"
    assert body["request_type"] == "warranty"
    cleanup_registry["rmas"].append(body["rma_number"])


# ────────────────────────────────────────────────────────────────
# Admin lifecycle + refund calc + audit + serialization
# ────────────────────────────────────────────────────────────────

def test_admin_lifecycle_full_happy_path(auth_headers, cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn)
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "changed_mind",
    })
    rma = r.json()["rma_number"]
    cleanup_registry["rmas"].append(rma)

    r1 = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/authorize", json={}, headers=auth_headers)
    assert r1.status_code == 200 and r1.json()["status"] == "authorized"

    r2 = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/receive", json={}, headers=auth_headers)
    assert r2.status_code == 200 and r2.json()["status"] == "received"

    r3 = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/inspect",
                       json={"result": "pass"}, headers=auth_headers)
    assert r3.status_code == 200 and r3.json()["status"] == "inspection_passed"

    r4 = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/refund", json={}, headers=auth_headers)
    assert r4.status_code == 200
    body = r4.json()
    assert body["status"] == "refund_approved"
    assert body["refund_amount_base_cents"] == 350000
    assert body["refund_currency_base"] == "USD"

    # Detail view + audit
    detail = requests.get(f"{BASE_URL}/api/admin/returns/{rma}", headers=auth_headers)
    assert detail.status_code == 200
    dj = detail.json()
    assert isinstance(dj.get("audit"), list) and len(dj["audit"]) >= 4
    body_txt = detail.text
    for banned in ("status_token_hash", "email_status_token",
                   "webhook_event_ids", "provider_session_id"):
        assert banned not in body_txt


def test_partial_refund_only_selected_items(auth_headers, cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    items = [
        {"product_name": "A", "variant": "14K Yellow Gold",
         "quantity": 1, "unit_amount_cents": 350000},
        {"product_name": "B", "variant": "18K White Gold",
         "quantity": 2, "unit_amount_cents": 32000},
    ]
    _seed_order(ordn, items=items)
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN,
        "reason": "changed_mind", "item_indices": [0],
    })
    assert r.status_code == 200, r.text
    rma = r.json()["rma_number"]
    cleanup_registry["rmas"].append(rma)

    for path, body in [("authorize", {}), ("receive", {}),
                        ("inspect", {"result": "pass"}), ("refund", {})]:
        rr = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/{path}",
                           json=body, headers=auth_headers)
        assert rr.status_code == 200, f"{path}: {rr.text}"
    final = rr.json()
    assert final["refund_amount_base_cents"] == 350000  # only item 0


def test_refund_locked_historical_order(auth_headers, cleanup_registry):
    # Insert an RMA case pointing at the historical order WITHOUT touching
    # the historical order document itself.
    from services.returns_service import new_rma_number
    rma = new_rma_number()
    cleanup_registry["rmas"].append(rma)
    case = {
        "rma_number": rma,
        "order_number": "PHI-20260901-4CBC5C",
        "status": "inspection_passed",
        "items_snapshot": [{"index": 0, "eligible": True,
                             "policy_class": "eligible_gold",
                             "unit_amount_cents": 100, "quantity": 1}],
        "created_at": datetime.now(timezone.utc),
    }
    _sync.returns.insert_one(case)
    r = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/refund",
                     json={}, headers=auth_headers)
    assert r.status_code == 409
    assert r.json().get("detail", {}).get("code") == "LOCKED_HISTORICAL_ORDER"


def test_refund_wrong_state_returns_409(auth_headers, cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn)
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "changed_mind",
    })
    rma = r.json()["rma_number"]
    cleanup_registry["rmas"].append(rma)
    rr = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/refund",
                       json={}, headers=auth_headers)
    assert rr.status_code == 409
    assert rr.json().get("detail", {}).get("code") == "INVALID_TRANSITION"


def test_verify_delivery_recomputes_eligibility(auth_headers, cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn, shipped_days_ago=None)
    r = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "changed_mind",
    })
    assert r.json()["status"] == "under_review"
    rma = r.json()["rma_number"]
    cleanup_registry["rmas"].append(rma)

    delivered_at = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
    rr = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/verify-delivery",
                       json={"delivered_at": delivered_at}, headers=auth_headers)
    assert rr.status_code == 200
    snap = rr.json().get("items_snapshot") or []
    assert any(s.get("eligible") for s in snap)


def test_inspect_fail_then_deny_then_close(auth_headers, cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn)
    rma = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "changed_mind",
    }).json()["rma_number"]
    cleanup_registry["rmas"].append(rma)
    for path, body in [("authorize", {}), ("receive", {}),
                        ("inspect", {"result": "fail", "notes": "wear"})]:
        rr = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/{path}",
                           json=body, headers=auth_headers)
        assert rr.status_code == 200, rr.text
    assert rr.json()["status"] == "inspection_failed"
    d = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/deny",
                     json={"reason": "wear"}, headers=auth_headers)
    assert d.status_code == 200 and d.json()["status"] == "denied"
    c = requests.post(f"{BASE_URL}/api/admin/returns/{rma}/close",
                     json={}, headers=auth_headers)
    assert c.status_code == 200 and c.json()["status"] == "closed"


# ────────────────────────────────────────────────────────────────
# Customer-safe payload
# ────────────────────────────────────────────────────────────────

def test_customer_get_return_safe_payload(cleanup_registry):
    ordn = _new_order_number()
    cleanup_registry["orders"].append(ordn)
    _seed_order(ordn)
    rma = requests.post(f"{BASE_URL}/api/returns/request", json={
        "order_number": ordn, "token": PLAINTEXT_TOKEN, "reason": "changed_mind",
    }).json()["rma_number"]
    cleanup_registry["rmas"].append(rma)
    r = requests.get(f"{BASE_URL}/api/returns/{rma}",
                     params={"order_number": ordn, "token": PLAINTEXT_TOKEN})
    assert r.status_code == 200, r.text
    j = r.json()
    assert "status" in j and "rma_number" in j
    body_txt = r.text
    for banned in ("inspection_notes", "audit", "refund_amount_base_cents",
                   "status_token_hash"):
        assert banned not in body_txt
