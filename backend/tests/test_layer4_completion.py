"""PHILEON — Layer 4 completion pass: order-level fraud hold interlocks."""
from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from types import SimpleNamespace
import pytest


def _run(coro):
    return asyncio.run(coro)


def _base_order(**kw):
    d = {
        "order_number": "PHI-TEST-L4C-1",
        "payment_status": "paid",
        "shipping_integrity_status": "ok",
        "presentment_integrity_status": "ok",
        "shipping": {"country": "US", "service_label": "Standard"},
        "fulfillment_status": None,
    }
    d.update(kw)
    return d


# ─── ELIGIBILITY: fraud gate ──────────────────────────

def test_eligibility_blocks_review_required():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_base_order(fraud_review_status="review_required"))
    assert v.eligible is False
    assert "fraud_review_review_required" in v.reasons


def test_eligibility_blocks_under_review():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_base_order(fraud_review_status="under_review"))
    assert v.eligible is False


def test_eligibility_blocks_blocked():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_base_order(fraud_review_status="blocked"))
    assert v.eligible is False
    assert "fraud_review_blocked" in v.reasons


def test_eligibility_permits_clear():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_base_order(fraud_review_status="clear"))
    assert v.eligible is True


def test_eligibility_permits_cleared():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_base_order(fraud_review_status="cleared"))
    assert v.eligible is True


def test_eligibility_permits_absent_field():
    from services.fulfillment import evaluate_eligibility
    v = evaluate_eligibility(_base_order())
    assert v.eligible is True


# ─── PRE-DISPUTE HOLD: no dispute required ───────────

class _Coll:
    def __init__(self, docs=None): self.docs = list(docs or [])
    @staticmethod
    def _match(doc, filt):
        for k, v in filt.items():
            if isinstance(v, dict) and "$in" in v:
                if doc.get(k) not in v["$in"]:
                    return False
            elif isinstance(v, dict):
                # unsupported operators → ignore (permissive)
                continue
            else:
                if doc.get(k) != v:
                    return False
        return True
    async def find_one(self, filt, projection=None):
        for d in self.docs:
            if self._match(d, filt):
                return dict(d)
        return None
    async def update_one(self, filt, update):
        for i, d in enumerate(self.docs):
            if self._match(d, filt):
                for k, v in (update.get("$set") or {}).items():
                    d[k] = v
                self.docs[i] = d
                class R: matched_count = 1
                return R()
        class R: matched_count = 0
        return R()
    async def insert_one(self, doc):
        self.docs.append(dict(doc)); return SimpleNamespace(inserted_id="x")
    def find(self, filt, projection=None):
        p = self
        class _C:
            def sort(self, *a, **k): return self
            def limit(self, n): return self
            def __aiter__(self):
                async def gen():
                    for x in p.docs: yield dict(x)
                return gen()
        return _C()


def test_admin_can_fraud_hold_order_without_dispute(monkeypatch):
    """The core Layer 4 completion invariant — owner can hold ANY paid
    order for fraud review without needing a Stripe dispute to exist."""
    from routes import admin_orders as mod
    fake = SimpleNamespace(
        orders_v2=_Coll([{"id": "1",
                           "order_number": "PHI-TEST-FR-1",
                           "payment_status": "paid",
                           "shipping_integrity_status": "ok",
                           "shipping": {"country": "US", "service_label": "Standard"},
                           "items": []}]),
        fulfillment_audit=_Coll([]),
    )
    monkeypatch.setattr(mod, "db", fake)
    r = _run(mod.order_fraud_hold("PHI-TEST-FR-1",
                                     mod.HoldIn(reason="Address mismatch reported by owner"),
                                     _admin="admin"))
    assert fake.orders_v2.docs[0]["fraud_review_status"] == "blocked"
    assert "Address mismatch" in fake.orders_v2.docs[0]["fraud_review_reason"]
    # Audit trail written
    assert any(a["action"] == "fraud_hold" for a in fake.fulfillment_audit.docs)


def test_admin_can_clear_fraud_hold(monkeypatch):
    from routes import admin_orders as mod
    fake = SimpleNamespace(
        orders_v2=_Coll([{"id": "2",
                           "order_number": "PHI-TEST-FR-2",
                           "payment_status": "paid",
                           "fraud_review_status": "blocked",
                           "fraud_review_reason": "prior",
                           "shipping_integrity_status": "ok",
                           "shipping": {"country": "US", "service_label": "Standard"},
                           "items": []}]),
        dispute_cases=_Coll([]),
        fulfillment_audit=_Coll([]),
    )
    monkeypatch.setattr(mod, "db", fake)
    _run(mod.order_clear_fraud_hold("PHI-TEST-FR-2",
                                        mod.TransitionIn(note="Reviewed with concierge"),
                                        _admin="admin"))
    assert fake.orders_v2.docs[0]["fraud_review_status"] == "cleared"


# ─── Completion pass: LOST dispute blocks generic clear ─────

def test_clear_fraud_hold_rejected_when_lost_dispute(monkeypatch):
    """Section 9 / test K: generic clear-fraud-hold must be refused when
    the order carries a Stripe-authoritative LOST dispute."""
    from fastapi import HTTPException
    from routes import admin_orders as mod
    fake = SimpleNamespace(
        orders_v2=_Coll([{"id": "L", "order_number": "PHI-TEST-FR-LOST",
                           "payment_status": "refunded",
                           "fraud_review_status": "blocked",
                           "fraud_review_reason": "dispute lost",
                           "shipping_integrity_status": "ok",
                           "shipping": {"country": "US", "service_label": "Standard"},
                           "items": []}]),
        dispute_cases=_Coll([{"case_id": "DSP-2026-LOST01",
                                "order_number": "PHI-TEST-FR-LOST",
                                "status": "lost"}]),
        fulfillment_audit=_Coll([]),
    )
    monkeypatch.setattr(mod, "db", fake)
    with pytest.raises(HTTPException) as exc:
        _run(mod.order_clear_fraud_hold("PHI-TEST-FR-LOST",
                                            mod.TransitionIn(), _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "LOST_DISPUTE_BLOCK"
    # State unchanged
    assert fake.orders_v2.docs[0]["fraud_review_status"] == "blocked"


# ─── Completion pass: WON + owner cleared → eligible ─────

def test_eligibility_won_then_cleared_passes():
    """Section 8 / test I: after Stripe reconciles a WON dispute the
    webhook restores payment_status='paid' and sets fraud_review_status
    to review_required. Once the owner explicitly clears fraud review,
    ordinary Layer 2 gates must permit fulfillment."""
    from services.fulfillment import evaluate_eligibility
    order = _base_order(payment_status="paid", fraud_review_status="cleared")
    v = evaluate_eligibility(order)
    assert v.eligible is True


# ─── Completion pass: has_active_dispute helper ─────

def test_has_active_dispute_true_for_needs_response(monkeypatch):
    from services import disputes_service as svc
    fake = SimpleNamespace(dispute_cases=_Coll([
        {"case_id": "A", "order_number": "PHI-A", "status": "needs_response"},
    ]))
    assert _run(svc.has_active_dispute(fake, "PHI-A")) is True


def test_has_active_dispute_false_for_terminal(monkeypatch):
    from services import disputes_service as svc
    fake = SimpleNamespace(dispute_cases=_Coll([
        {"case_id": "B", "order_number": "PHI-B", "status": "won"},
        {"case_id": "C", "order_number": "PHI-B", "status": "warning_closed"},
        {"case_id": "D", "order_number": "PHI-B", "status": "charge_dismissed"},
        {"case_id": "E", "order_number": "PHI-B", "status": "lost"},
    ]))
    assert _run(svc.has_active_dispute(fake, "PHI-B")) is False


def test_has_active_dispute_false_for_unknown_order(monkeypatch):
    from services import disputes_service as svc
    fake = SimpleNamespace(dispute_cases=_Coll([]))
    assert _run(svc.has_active_dispute(fake, "PHI-NONE")) is False


# ─── Completion pass: release-fraud-hold on LOST dispute case ────

def test_release_fraud_hold_rejected_when_lost(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_disputes as mod
    fake = SimpleNamespace(
        dispute_cases=_Coll([{"case_id": "DSP-2026-LOST99",
                                "order_number": "PHI-LOST-99",
                                "status": "lost",
                                "fraud_review_status": "blocked"}]),
        disputes_audit=_Coll([]),
    )
    monkeypatch.setattr(mod, "db", fake)
    with pytest.raises(HTTPException) as exc:
        _run(mod.release_fraud_hold("DSP-2026-LOST99", _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "LOST_DISPUTE_BLOCK"


def test_fraud_hold_locked_historical(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    fake = SimpleNamespace(
        orders_v2=_Coll([{"id": "H",
                           "order_number": "PHI-20260901-4CBC5C",
                           "payment_status": "paid",
                           "shipping_integrity_status": "ok",
                           "shipping": {"country": "CA", "service_label": "CA"},
                           "items": []}]),
        fulfillment_audit=_Coll([]),
    )
    monkeypatch.setattr(mod, "db", fake)
    with pytest.raises(HTTPException) as exc:
        _run(mod.order_fraud_hold("PHI-20260901-4CBC5C",
                                     mod.HoldIn(reason="test"), _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "LOCKED_HISTORICAL_ORDER"


# ─── MARK-SHIPPED refuses when fraud hold set ────────

def test_mark_shipped_blocked_by_fraud_hold(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    fake = SimpleNamespace(
        orders_v2=_Coll([{"id": "S", "order_number": "PHI-TEST-FR-3",
                           "payment_status": "paid",
                           "shipping_integrity_status": "ok",
                           "shipping": {"country": "US", "service_label": "Standard"},
                           "fraud_review_status": "review_required",
                           "shipping_notification_sent": False,
                           "items": []}]),
        fulfillment_audit=_Coll([]),
    )
    monkeypatch.setattr(mod, "db", fake)
    body = mod.MarkShippedIn(carrier="UPS", tracking_number="1Z999")
    with pytest.raises(HTTPException) as exc:
        _run(mod.mark_shipped("PHI-TEST-FR-3", body, _admin="admin"))
    assert exc.value.status_code == 409
    assert "fraud_review_review_required" in exc.value.detail["reasons"]


def test_approve_for_fulfillment_blocked_by_fraud_hold(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as mod
    fake = SimpleNamespace(
        orders_v2=_Coll([{"id": "A", "order_number": "PHI-TEST-FR-4",
                           "payment_status": "paid",
                           "shipping_integrity_status": "ok",
                           "shipping": {"country": "US", "service_label": "Standard"},
                           "fraud_review_status": "blocked",
                           "items": []}]),
        fulfillment_audit=_Coll([]),
    )
    monkeypatch.setattr(mod, "db", fake)
    with pytest.raises(HTTPException) as exc:
        _run(mod.approve_for_fulfillment("PHI-TEST-FR-4",
                                            mod.TransitionIn(), _admin="admin"))
    assert exc.value.status_code == 409
    assert "fraud_review_blocked" in exc.value.detail["reasons"]


def test_forbid_extra_fields_on_new_endpoints():
    from routes.admin_orders import HoldIn
    with pytest.raises(Exception):
        HoldIn(reason="x", fraud_review_status="cleared")
