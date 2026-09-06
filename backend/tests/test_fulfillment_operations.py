"""PHILEON — Fulfillment Operations (Layer 2) regression tests.

Covers:
  · Fulfillment state machine (`services.fulfillment.can_transition`)
  · Eligibility rules (`services.fulfillment.evaluate_eligibility`)
  · Tracking number sanitization + carrier URL helper
  · Audit log writer (isolation from money fields)
  · Admin routes: queue filters, approve/prepare/ready-to-ship,
    hold/release, correct-shipment, integrity-gated mark-shipped.

No Stripe calls. No email sends. Uses a FakeDb to isolate from Motor.
"""
from __future__ import annotations
import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest


# ────────────────────────────────────────────────────────────────
# STATE MACHINE
# ────────────────────────────────────────────────────────────────

def test_state_machine_allowed_transitions():
    from services.fulfillment import can_transition
    # From None (fresh paid order)
    assert can_transition(None, "pending_review")
    assert can_transition(None, "approved_for_fulfillment")
    assert can_transition(None, "on_hold")
    assert can_transition(None, "cancelled")
    assert not can_transition(None, "shipped")
    assert not can_transition(None, "in_preparation")
    # Approved → in_preparation → ready → shipped
    assert can_transition("approved_for_fulfillment", "in_preparation")
    assert can_transition("in_preparation", "ready_to_ship")
    assert can_transition("ready_to_ship", "shipped")
    # Cannot un-ship
    assert not can_transition("shipped", "in_preparation")
    assert not can_transition("shipped", "pending_review")
    # Delivered / cancelled are terminal
    assert not can_transition("delivered", "shipped")
    assert not can_transition("cancelled", "in_preparation")
    # Hold → release paths
    assert can_transition("in_preparation", "on_hold")
    assert can_transition("on_hold", "pending_review")


def test_state_machine_rejects_unknown_target():
    from services.fulfillment import can_transition
    assert not can_transition(None, "not_a_real_state")
    assert not can_transition("pending_review", "")


# ────────────────────────────────────────────────────────────────
# ELIGIBILITY
# ────────────────────────────────────────────────────────────────

_BASE_ORDER = {
    "order_number": "PHI-TEST-ELIG-1",
    "payment_status": "paid",
    "shipping_integrity_status": "ok",
    "presentment_integrity_status": None,
    "fulfillment_status": None,
    "shipping": {"country": "US", "service_label": "Standard · US"},
}


def _order(**overrides):
    d = dict(_BASE_ORDER)
    if "shipping" in overrides:
        d["shipping"] = overrides.pop("shipping")
    d.update(overrides)
    return d


def test_eligibility_happy_path():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_order())
    assert v.eligible is True
    assert v.reasons == []


def test_eligibility_blocks_pending_payment():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_order(payment_status="pending"))
    assert v.eligible is False
    assert "payment_not_paid" in v.reasons


def test_eligibility_blocks_refunded_order():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_order(payment_status="refunded"))
    assert v.eligible is False
    assert any(r.startswith("payment_") for r in v.reasons)


def test_eligibility_blocks_shipping_integrity_hold():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_order(shipping_integrity_status="pending_review"))
    assert v.eligible is False
    assert "shipping_integrity_pending_review" in v.reasons


def test_eligibility_blocks_presentment_integrity_hold():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_order(presentment_integrity_status="pending_review"))
    assert v.eligible is False
    assert "presentment_integrity_pending_review" in v.reasons


def test_eligibility_blocks_manual_hold():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_order(fulfillment_status="on_hold"))
    assert v.eligible is False
    assert "on_manual_hold" in v.reasons


def test_eligibility_blocks_missing_shipping():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_order(shipping={}))
    assert v.eligible is False
    assert "shipping_missing" in v.reasons


# ────────────────────────────────────────────────────────────────
# TRACKING NUMBER SANITIZATION + URL HELPER
# ────────────────────────────────────────────────────────────────

def test_tracking_sanitize_strips_html_and_spaces():
    from services.fulfillment import sanitize_tracking_number
    assert sanitize_tracking_number("  1Z999AA10123456784  ") == "1Z999AA10123456784"
    assert sanitize_tracking_number("<script>alert(1)</script>1Z-XYZ") == "alert11Z-XYZ"
    assert sanitize_tracking_number("1Z 999 AA 10") == "1Z999AA10"
    assert sanitize_tracking_number("") == ""
    assert sanitize_tracking_number(None) == ""


def test_tracking_url_prefers_explicit_https():
    from services.fulfillment import build_tracking_url
    assert build_tracking_url("UPS", "X", explicit_url="https://custom.example/track?x=1") \
        == "https://custom.example/track?x=1"


def test_tracking_url_rejects_unsafe_explicit():
    from services.fulfillment import build_tracking_url
    # Unsafe explicit → fall back to canonical carrier URL
    r = build_tracking_url("UPS", "1Z999", explicit_url="javascript:alert(1)")
    assert r and r.startswith("https://www.ups.com/track")


def test_tracking_url_canonical_carriers():
    from services.fulfillment import build_tracking_url
    assert "ups.com" in build_tracking_url("UPS", "1Z999")
    assert "fedex.com" in build_tracking_url("FedEx", "T-1")
    assert "dhl.com" in build_tracking_url("DHL", "D-1")
    assert "canadapost" in build_tracking_url("Canada Post", "C-1")
    assert "usps.com" in build_tracking_url("USPS", "U-1")
    # Unknown carrier → None (UI shows number without link)
    assert build_tracking_url("Nonexistent Freight", "X-1") is None
    # No tracking number → None
    assert build_tracking_url("UPS", "") is None


# ────────────────────────────────────────────────────────────────
# AUDIT LOG — money isolation
# ────────────────────────────────────────────────────────────────

def _run(coro):
    return asyncio.run(coro)


class _AuditCollector:
    def __init__(self):
        self.docs = []

    async def insert_one(self, doc):
        self.docs.append(doc)


def test_audit_writer_never_stores_money_fields():
    from services.fulfillment import write_audit
    coll = _AuditCollector()
    fake_db = SimpleNamespace(fulfillment_audit=coll)
    _run(write_audit(
        fake_db, order_number="PHI-A", action="test",
        previous=None, new="pending_review", actor="admin",
        reason="unit-test",
        extra={
            "carrier": "UPS",
            "total_cents": 999999,
            "unit_amount_cents": 100,
            "provider_session_id": "cs_test_LEAK",
            "webhook_event_ids": ["evt_LEAK"],
            "status_token_hash": "SECRET",
            "email_status_token": "SECRET2",
        },
    ))
    assert len(coll.docs) == 1
    extra = coll.docs[0].get("extra") or {}
    assert "total_cents" not in extra
    assert "unit_amount_cents" not in extra
    assert "provider_session_id" not in extra
    assert "webhook_event_ids" not in extra
    assert "status_token_hash" not in extra
    assert "email_status_token" not in extra
    assert extra.get("carrier") == "UPS"


# ────────────────────────────────────────────────────────────────
# ADMIN ROUTES — FakeDb-driven route-level tests
# ────────────────────────────────────────────────────────────────

class _FakeOrders:
    def __init__(self, docs):
        # docs: dict keyed by order_number
        self.docs = {k: dict(v) for k, v in docs.items()}
        self.email_calls = []

    async def find_one(self, q, projection=None):
        on = q.get("order_number")
        d = self.docs.get(on)
        if d is None:
            return None
        # Simulate integrity filter used by mark-shipped
        if "shipping_notification_sent" in q:
            req = q["shipping_notification_sent"].get("$ne")
            if d.get("shipping_notification_sent") == req:
                return None
        return dict(d)

    async def find_one_and_update(self, filt, update, return_document=True):
        on = filt.get("order_number")
        d = self.docs.get(on)
        if d is None:
            return None
        if "shipping_notification_sent" in filt:
            req = filt["shipping_notification_sent"].get("$ne")
            if d.get("shipping_notification_sent") == req:
                return None
        for k, v in (update.get("$set") or {}).items():
            if "." in k:
                head, tail = k.split(".", 1)
                d.setdefault(head, {})[tail] = v
            else:
                d[k] = v
        return dict(d)

    async def update_one(self, filt, update):
        on = filt.get("order_number")
        d = self.docs.get(on)
        if d is None:
            class R: matched_count = 0
            return R()
        for k, v in (update.get("$set") or {}).items():
            if "." in k:
                head, tail = k.split(".", 1)
                d.setdefault(head, {})[tail] = v
            else:
                d[k] = v
        class R: matched_count = 1
        return R()

    def find(self, filt, projection=None):
        # Return a naive async iterable — filters not honored in this fake
        # (route-level filter matching is verified by unit tests on the
        # eligibility helper, not on the fake collection).
        parent = self
        class _Cursor:
            def __init__(self):
                self._limit = None
            def sort(self, *a, **k): return self
            def limit(self, n):
                self._limit = n
                return self
            def __aiter__(self):
                items = list(parent.docs.values())
                if self._limit is not None:
                    items = items[:self._limit]
                async def gen():
                    for x in items:
                        yield dict(x)
                return gen()
        return _Cursor()


class _FakeAudit:
    def __init__(self): self.docs = []
    async def insert_one(self, d): self.docs.append(d)
    def find(self, filt, projection=None):
        parent = self
        class _C:
            def sort(self, *a, **k): return self
            def limit(self, n): return self
            def __aiter__(self):
                async def gen():
                    for x in parent.docs:
                        if x.get("order_number") == filt.get("order_number"):
                            yield dict(x)
                return gen()
        return _C()


def _install_fake_db(monkeypatch, orders_map):
    """Patch the admin_orders module's `db` to a fake."""
    from routes import admin_orders as mod
    orders = _FakeOrders(orders_map)
    audit = _FakeAudit()
    fake_db = SimpleNamespace(orders_v2=orders, fulfillment_audit=audit)
    monkeypatch.setattr(mod, "db", fake_db)
    return orders, audit


# ---- MARK-SHIPPED integrity gate ---------------------------------

def test_mark_shipped_blocked_by_shipping_integrity_hold(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    _install_fake_db(monkeypatch, {
        "PHI-HOLD-1": {
            "id": "1", "order_number": "PHI-HOLD-1",
            "payment_status": "paid",
            "shipping_integrity_status": "pending_review",
            "presentment_integrity_status": "ok",
            "shipping": {"country": "US", "service_label": "Standard"},
            "shipping_notification_sent": False,
            "items": [],
        },
    })
    body = mod.MarkShippedIn(carrier="UPS", tracking_number="1Z999")
    with pytest.raises(HTTPException) as exc:
        _run(mod.mark_shipped("PHI-HOLD-1", body, _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "NOT_ELIGIBLE"
    assert "shipping_integrity_pending_review" in exc.value.detail["reasons"]


def test_mark_shipped_blocked_by_presentment_integrity_hold(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    _install_fake_db(monkeypatch, {
        "PHI-HOLD-2": {
            "id": "2", "order_number": "PHI-HOLD-2",
            "payment_status": "paid",
            "shipping_integrity_status": "ok",
            "presentment_integrity_status": "pending_review",
            "shipping": {"country": "US", "service_label": "Standard"},
            "shipping_notification_sent": False,
            "items": [],
        },
    })
    body = mod.MarkShippedIn(carrier="UPS", tracking_number="1Z999")
    with pytest.raises(HTTPException) as exc:
        _run(mod.mark_shipped("PHI-HOLD-2", body, _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "NOT_ELIGIBLE"


def test_mark_shipped_blocked_by_manual_hold(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    _install_fake_db(monkeypatch, {
        "PHI-HOLD-3": {
            "id": "3", "order_number": "PHI-HOLD-3",
            "payment_status": "paid",
            "fulfillment_status": "on_hold",
            "shipping": {"country": "US", "service_label": "Standard"},
            "shipping_notification_sent": False,
            "items": [],
        },
    })
    body = mod.MarkShippedIn(carrier="UPS", tracking_number="1Z999")
    with pytest.raises(HTTPException) as exc:
        _run(mod.mark_shipped("PHI-HOLD-3", body, _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "NOT_ELIGIBLE"


def test_mark_shipped_happy_path_builds_tracking_url(monkeypatch):
    from routes import admin_orders as mod
    orders, audit = _install_fake_db(monkeypatch, {
        "PHI-HAPPY-1": {
            "id": "H1", "order_number": "PHI-HAPPY-1",
            "payment_status": "paid",
            "shipping_integrity_status": "ok",
            "presentment_integrity_status": "ok",
            "shipping": {"country": "US", "service_label": "Standard · US"},
            "shipping_notification_sent": False,
            "items": [{"product_name": "X", "variant": "v", "quantity": 1,
                       "unit_amount_cents": 350000}],
            "customer_email": "test@example.com", "currency": "USD",
            "total_cents": 350000,
        },
    })
    # Prevent actual email dispatch
    async def _fake_send(order):
        orders.email_calls.append(order.get("order_number"))
        return {"status": "sent"}
    monkeypatch.setattr("services.order_emails.send_shipment_email", _fake_send)
    body = mod.MarkShippedIn(carrier="UPS", tracking_number="  1Z999AA10123456784  ")
    r = _run(mod.mark_shipped("PHI-HAPPY-1", body, _admin="admin"))
    assert r["ok"] is True
    assert r["email_sent"] is True
    assert "ups.com" in r["tracking_url"]
    # Tracking number was sanitized
    assert orders.docs["PHI-HAPPY-1"]["tracking_number"] == "1Z999AA10123456784"
    # Audit trail written
    assert any(x["action"] == "mark_shipped" for x in audit.docs)
    # Duplicate call is a no-op on email
    r2 = _run(mod.mark_shipped("PHI-HAPPY-1", body, _admin="admin"))
    assert r2["email_sent"] is False
    assert len(orders.email_calls) == 1


# ---- APPROVE / PREPARE / READY-TO-SHIP -----------------------------

def test_approve_advances_and_audits(monkeypatch):
    from routes import admin_orders as mod
    orders, audit = _install_fake_db(monkeypatch, {
        "PHI-A-1": {
            "id": "A1", "order_number": "PHI-A-1",
            "payment_status": "paid",
            "shipping_integrity_status": "ok",
            "presentment_integrity_status": "ok",
            "shipping": {"country": "US", "service_label": "Standard"},
            "items": [],
        },
    })
    r = _run(mod.approve_for_fulfillment("PHI-A-1", mod.TransitionIn(note="looks good"),
                                          _admin="admin"))
    assert r["fulfillment_status"] == "approved_for_fulfillment"
    assert any(x["action"] == "transition:approved_for_fulfillment" for x in audit.docs)


def test_prepare_requires_approved(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    _install_fake_db(monkeypatch, {
        "PHI-P-1": {
            "id": "P1", "order_number": "PHI-P-1",
            "payment_status": "paid",
            "shipping_integrity_status": "ok",
            "shipping": {"country": "US", "service_label": "Standard"},
            "fulfillment_status": None,  # not yet approved
            "items": [],
        },
    })
    with pytest.raises(HTTPException) as exc:
        _run(mod.prepare("PHI-P-1", mod.TransitionIn(), _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "INVALID_TRANSITION"


def test_full_lifecycle_progression(monkeypatch):
    from routes import admin_orders as mod
    orders, audit = _install_fake_db(monkeypatch, {
        "PHI-L-1": {
            "id": "L1", "order_number": "PHI-L-1",
            "payment_status": "paid",
            "shipping_integrity_status": "ok",
            "presentment_integrity_status": "ok",
            "shipping": {"country": "CA", "service_label": "Complimentary · Canada"},
            "items": [],
        },
    })
    _run(mod.approve_for_fulfillment("PHI-L-1", mod.TransitionIn(), _admin="admin"))
    _run(mod.prepare("PHI-L-1", mod.TransitionIn(), _admin="admin"))
    _run(mod.ready_to_ship("PHI-L-1", mod.TransitionIn(), _admin="admin"))
    assert orders.docs["PHI-L-1"]["fulfillment_status"] == "ready_to_ship"
    actions = [x["action"] for x in audit.docs]
    assert "transition:approved_for_fulfillment" in actions
    assert "transition:in_preparation" in actions
    assert "transition:ready_to_ship" in actions


# ---- HOLD / RELEASE ---------------------------------------------

def test_hold_records_reason_and_release_requires_integrity(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    orders, audit = _install_fake_db(monkeypatch, {
        "PHI-H-1": {
            "id": "H1", "order_number": "PHI-H-1",
            "payment_status": "paid",
            "shipping_integrity_status": "ok",
            "shipping": {"country": "US", "service_label": "Standard"},
            "fulfillment_status": "in_preparation",
            "items": [],
        },
    })
    _run(mod.place_on_hold("PHI-H-1", mod.HoldIn(reason="address concern"),
                            _admin="admin"))
    assert orders.docs["PHI-H-1"]["fulfillment_status"] == "on_hold"
    assert orders.docs["PHI-H-1"]["fulfillment_hold_reason"] == "address concern"
    assert any(x["action"] == "hold" for x in audit.docs)
    # Release path — integrity is green
    _run(mod.release_hold("PHI-H-1", mod.TransitionIn(note="resolved"),
                           _admin="admin"))
    assert orders.docs["PHI-H-1"]["fulfillment_status"] == "pending_review"
    assert orders.docs["PHI-H-1"]["fulfillment_hold_reason"] in (None, "")


def test_release_hold_blocked_when_integrity_broken(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    _install_fake_db(monkeypatch, {
        "PHI-H-2": {
            "id": "H2", "order_number": "PHI-H-2",
            "payment_status": "paid",
            "shipping_integrity_status": "pending_review",
            "shipping": {"country": "US", "service_label": "Standard"},
            "fulfillment_status": "on_hold",
            "items": [],
        },
    })
    with pytest.raises(HTTPException) as exc:
        _run(mod.release_hold("PHI-H-2", mod.TransitionIn(),
                               _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "NOT_ELIGIBLE"


# ---- CORRECT-SHIPMENT --------------------------------------------

def test_correct_shipment_records_previous_values(monkeypatch):
    from routes import admin_orders as mod
    orders, audit = _install_fake_db(monkeypatch, {
        "PHI-C-1": {
            "id": "C1", "order_number": "PHI-C-1",
            "payment_status": "paid",
            "shipping_integrity_status": "ok",
            "shipping": {"country": "US", "service_label": "Standard"},
            "fulfillment_status": "shipped",
            "carrier": "UPS",
            "tracking_number": "OLD-123",
            "tracking_url": "https://ups.com/track?tracknum=OLD-123",
            "items": [],
        },
    })
    r = _run(mod.correct_shipment("PHI-C-1",
        mod.CorrectShipmentIn(tracking_number="NEW-456", reason="carrier issued new label"),
        _admin="admin"))
    assert r["tracking_number"] == "NEW-456"
    corr = [x for x in audit.docs if x["action"] == "correct_shipment"]
    assert corr
    assert corr[0]["extra"]["previous"]["tracking_number"] == "OLD-123"
    assert corr[0]["extra"]["new"]["tracking_number"] == "NEW-456"


def test_correct_shipment_requires_shipped_status(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    _install_fake_db(monkeypatch, {
        "PHI-C-2": {
            "id": "C2", "order_number": "PHI-C-2",
            "payment_status": "paid",
            "shipping_integrity_status": "ok",
            "shipping": {"country": "US", "service_label": "Standard"},
            "fulfillment_status": "in_preparation",
            "items": [],
        },
    })
    with pytest.raises(HTTPException) as exc:
        _run(mod.correct_shipment("PHI-C-2",
            mod.CorrectShipmentIn(tracking_number="X", reason="test"),
            _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "NOT_SHIPPED"


# ---- QUEUE ENDPOINT ---------------------------------------------

def test_queue_rejects_unknown_status(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    _install_fake_db(monkeypatch, {})
    with pytest.raises(HTTPException) as exc:
        _run(mod.list_orders(status="bogus", q=None, limit=10, _admin="admin"))
    assert exc.value.status_code == 400
    assert exc.value.detail["code"] == "INVALID_STATUS"


def test_queue_returns_serialized_orders_without_secrets(monkeypatch):
    from routes import admin_orders as mod
    orders, _ = _install_fake_db(monkeypatch, {
        "PHI-Q-1": {
            "id": "Q1", "order_number": "PHI-Q-1",
            "payment_status": "paid",
            "shipping_integrity_status": "ok",
            "shipping": {"country": "US", "service_label": "Standard"},
            "fulfillment_status": None,
            "items": [], "currency": "USD", "total_cents": 35000,
            # These fields must never appear in the queue response:
            "provider_session_id": "cs_test_LEAK",
            "provider_payment_intent_id": "pi_LEAK",
            "status_token_hash": "SECRET_HASH",
            "email_status_token": "SECRET_TOKEN",
            "webhook_event_ids": ["evt_LEAK"],
        },
    })
    r = _run(mod.list_orders(status="all", q=None, limit=50, _admin="admin"))
    assert r["count"] == 1
    o = r["orders"][0]
    dumped = str(o)
    assert "cs_test_LEAK" not in dumped
    assert "pi_LEAK" not in dumped
    assert "SECRET_HASH" not in dumped
    assert "SECRET_TOKEN" not in dumped
    assert "evt_LEAK" not in dumped


# ---- FORBID EXTRA FIELDS -----------------------------------------

def test_hold_rejects_extra_fields():
    from routes.admin_orders import HoldIn
    with pytest.raises(Exception):
        HoldIn(reason="x", carrier="UPS")  # extra field → 422 at API layer


def test_transition_rejects_extra_fields():
    from routes.admin_orders import TransitionIn
    with pytest.raises(Exception):
        TransitionIn(note="ok", fulfillment_status="shipped")


def test_correct_shipment_rejects_extra_fields():
    from routes.admin_orders import CorrectShipmentIn
    with pytest.raises(Exception):
        CorrectShipmentIn(reason="x", total_cents=1)
