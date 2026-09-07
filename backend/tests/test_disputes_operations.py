"""PHILEON — Disputes / Chargeback Readiness (Layer 4) tests."""
from __future__ import annotations
import asyncio
from datetime import datetime, timezone, timedelta
from types import SimpleNamespace

import pytest


def _run(coro):
    return asyncio.run(coro)


# ─── UNIT ─────────────────────────────────────────

def test_case_id_format():
    from services.disputes_service import new_case_id
    a, b = new_case_id(), new_case_id()
    yr = str(datetime.now(timezone.utc).year)
    assert a.startswith(f"DSP-{yr}-") and len(a) == len(f"DSP-{yr}-") + 6
    assert a != b


def test_response_state_machine():
    from services.disputes_service import can_response_transition
    assert can_response_transition(None, "not_started")
    assert can_response_transition("not_started", "collecting_evidence")
    assert can_response_transition("collecting_evidence", "ready_for_owner_review")
    assert can_response_transition("ready_for_owner_review", "approved_for_submission")
    assert can_response_transition("approved_for_submission", "submitted")
    assert can_response_transition("submitted", "closed")
    assert not can_response_transition("closed", "not_started")
    assert not can_response_transition("not_started", "submitted")


def test_urgency_bands():
    from services.disputes_service import urgency_from_due
    now = datetime.now(timezone.utc)
    assert urgency_from_due(now + timedelta(hours=200)) == "normal"
    assert urgency_from_due(now + timedelta(hours=48)) == "attention"
    assert urgency_from_due(now + timedelta(hours=6)) == "urgent"
    assert urgency_from_due(now - timedelta(hours=1)) == "overdue"
    assert urgency_from_due(None) == "unknown"


def test_evidence_packet_never_fabricates():
    from services.disputes_service import build_evidence_packet
    order = {
        "order_number": "PHI-TEST-DSP-1", "currency": "USD",
        "total_cents": 350000, "customer_email": "buyer@example.com",
        "items": [{"product_name": "X", "variant": "14K Gold",
                    "quantity": 1, "unit_amount_cents": 350000}],
        "payment_status": "disputed",
        "shipping": {"country": "US"},
    }
    p = build_evidence_packet(order)
    assert p["order"]["order_number"] == "PHI-TEST-DSP-1"
    # Missing fields flagged NOT_AVAILABLE
    assert p["fulfillment"]["carrier"] == "NOT_AVAILABLE"
    assert p["fulfillment"]["tracking_number"] == "NOT_AVAILABLE"
    assert p["payment"]["risk_level"] == "NOT_AVAILABLE"
    assert p["returns_and_refunds"]["rma_number"] == "NOT_AVAILABLE"
    # Never leaks secrets or webhook payloads
    blob = str(p).lower()
    for banned in ("stripe_secret_key", "webhook_event_ids",
                    "status_token_hash", "email_status_token",
                    "provider_session_id", "jwt_secret"):
        assert banned.lower() not in blob


def test_evidence_packet_uses_real_rma_and_audit_when_present():
    from services.disputes_service import build_evidence_packet
    order = {"order_number": "PHI-TEST-DSP-2", "currency": "USD",
             "total_cents": 350000,
             "carrier": "UPS", "tracking_number": "1Z999",
             "shipped_at": datetime.now(timezone.utc),
             "shipping": {"country": "US", "signature_required": True},
             "items": []}
    rma = {"rma_number": "RMA-2026-XYZ", "status": "denied"}
    audit = [{"action": "mark_shipped", "at": datetime.now(timezone.utc)}]
    p = build_evidence_packet(order, rma=rma, audit_shipment=audit)
    assert p["fulfillment"]["carrier"] == "UPS"
    assert p["fulfillment"]["tracking_number"] == "1Z999"
    assert p["fulfillment"]["signature_required"] is True
    assert p["returns_and_refunds"]["rma_number"] == "RMA-2026-XYZ"
    assert p["shipment_audit"][0]["action"] == "mark_shipped"


# ─── ROUTE-LEVEL ─────────────────────────────────────────

class _Coll:
    def __init__(self, docs=None, key="case_id"):
        self.docs = list(docs or [])
        self.key = key
    async def find_one(self, filt, projection=None):
        for d in self.docs:
            ok = True
            for k, v in filt.items():
                if isinstance(v, dict):
                    if "$in" in v and d.get(k) not in v["$in"]:
                        ok = False; break
                elif d.get(k) != v:
                    ok = False; break
            if ok:
                return dict(d)
        return None
    async def insert_one(self, doc):
        self.docs.append(dict(doc))
        class R: inserted_id = "x"
        return R()
    async def update_one(self, filt, update):
        for i, d in enumerate(self.docs):
            if all(d.get(k) == v for k, v in filt.items() if not isinstance(v, dict)):
                for k, v in (update.get("$set") or {}).items():
                    d[k] = v
                self.docs[i] = d
                class R: matched_count = 1
                return R()
        class R: matched_count = 0
        return R()
    def find(self, filt, projection=None):
        parent = self
        class _C:
            def sort(self, *a, **k): return self
            def limit(self, n): return self
            def __aiter__(self):
                items = list(parent.docs)
                async def gen():
                    for x in items:
                        yield dict(x)
                return gen()
        return _C()


def _install(monkeypatch, cases=None, orders=None, returns=None):
    from routes import admin_disputes as mod
    fake = SimpleNamespace(
        dispute_cases=_Coll(cases or []),
        disputes_audit=_Coll([], key="case_id"),
        orders_v2=_Coll(orders or [], key="order_number"),
        returns=_Coll(returns or [], key="rma_number"),
        fulfillment_audit=_Coll([], key="order_number"),
    )
    monkeypatch.setattr(mod, "db", fake)
    return fake, mod


def _case(**kw):
    now = datetime.now(timezone.utc)
    base = {
        "case_id": "DSP-2026-AAAAAA",
        "order_number": "PHI-TEST-DSP-Q1",
        "stripe_dispute_id": "dp_test_1",
        "status": "needs_response", "reason": "fraudulent",
        "amount_cents": 350000, "currency": "USD",
        "evidence_due_by": now + timedelta(hours=48),
        "fraud_review_status": "review_required",
        "response_status": "not_started",
        "created_at": now, "updated_at": now,
    }
    base.update(kw)
    return base


def test_list_disputes_rejects_invalid_status(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_disputes as mod
    _install(monkeypatch)
    with pytest.raises(HTTPException) as exc:
        _run(mod.list_disputes(status="bogus", q=None, limit=10, _admin="admin"))
    assert exc.value.status_code == 400


def test_list_disputes_returns_serialized_case(monkeypatch):
    from routes import admin_disputes as mod
    _install(monkeypatch, cases=[_case()])
    r = _run(mod.list_disputes(status="all", q=None, limit=10, _admin="admin"))
    assert r["count"] == 1
    c = r["cases"][0]
    assert c["case_id"] == "DSP-2026-AAAAAA"
    assert c["urgency"] in ("normal", "attention", "urgent", "overdue")
    # No Stripe secrets leak
    assert "stripe_secret_key" not in str(r).lower()


def test_get_detail_includes_evidence_packet(monkeypatch):
    from routes import admin_disputes as mod
    _install(monkeypatch,
              cases=[_case()],
              orders=[{"order_number": "PHI-TEST-DSP-Q1",
                        "customer_email": "b@x.com", "currency": "USD",
                        "total_cents": 350000, "items": [],
                        "shipping": {"country": "US"},
                        "payment_status": "disputed"}])
    r = _run(mod.get_dispute("DSP-2026-AAAAAA", _admin="admin"))
    assert "evidence_packet" in r
    assert r["evidence_packet"]["order"]["order_number"] == "PHI-TEST-DSP-Q1"
    assert r["evidence_packet"]["fulfillment"]["carrier"] == "NOT_AVAILABLE"


def test_fraud_hold_and_release(monkeypatch):
    from routes import admin_disputes as mod
    fake, _ = _install(monkeypatch, cases=[_case()])
    r = _run(mod.fraud_hold("DSP-2026-AAAAAA",
                              mod.HoldIn(reason="AVS mismatch reported by Stripe"),
                              _admin="admin"))
    assert r["fraud_review_status"] == "blocked"
    assert fake.dispute_cases.docs[0]["manual_hold_reason"] == "AVS mismatch reported by Stripe"
    r2 = _run(mod.release_fraud_hold("DSP-2026-AAAAAA", _admin="admin"))
    assert r2["fraud_review_status"] == "cleared"


def test_fraud_hold_locked_historical(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_disputes as mod
    _install(monkeypatch, cases=[_case(order_number="PHI-20260901-4CBC5C")])
    with pytest.raises(HTTPException) as exc:
        _run(mod.fraud_hold("DSP-2026-AAAAAA",
                              mod.HoldIn(reason="test"), _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "LOCKED_HISTORICAL_ORDER"


def test_response_status_transition_and_submit_gate(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_disputes as mod
    _install(monkeypatch, cases=[_case()])
    _run(mod.set_response_status("DSP-2026-AAAAAA",
        mod.ResponseStatusIn(response_status="collecting_evidence"), _admin="admin"))
    _run(mod.set_response_status("DSP-2026-AAAAAA",
        mod.ResponseStatusIn(response_status="ready_for_owner_review"), _admin="admin"))
    _run(mod.set_response_status("DSP-2026-AAAAAA",
        mod.ResponseStatusIn(response_status="approved_for_submission"), _admin="admin"))
    # Invalid direct skip
    with pytest.raises(HTTPException) as exc:
        _run(mod.set_response_status("DSP-2026-AAAAAA",
            mod.ResponseStatusIn(response_status="closed"), _admin="admin"))
    assert exc.value.detail["code"] == "INVALID_TRANSITION"


def test_note_writes_audit_only(monkeypatch):
    from routes import admin_disputes as mod
    fake, _ = _install(monkeypatch, cases=[_case()])
    _run(mod.add_note("DSP-2026-AAAAAA", mod.NoteIn(note="Customer requested shipping change"),
                       _admin="admin"))
    assert any(a["action"] == "note" for a in fake.disputes_audit.docs)


def test_forbid_extra_fields():
    from routes.admin_disputes import NoteIn, HoldIn, ResponseStatusIn, CloseIn
    with pytest.raises(Exception):
        NoteIn(note="ok", fraud_review_status="cleared")
    with pytest.raises(Exception):
        HoldIn(reason="x", stripe_dispute_id="dp_leak")
    with pytest.raises(Exception):
        ResponseStatusIn(response_status="ok", note="x")
    with pytest.raises(Exception):
        CloseIn(note="ok", closed_at="now")


# ─── INTERLOCK ─────────────────────────────────────────

def test_active_dispute_blocks_refund(monkeypatch):
    """Layer 4 interlock: /approve-refund refuses when payment_status=disputed."""
    from fastapi import HTTPException
    from routes import returns as rmod
    from services.returns_service import new_rma_number
    order = {"order_number": "PHI-TEST-DSP-INT", "payment_status": "disputed",
             "currency": "USD",
             "items": [{"quantity": 1, "unit_amount_cents": 350000}]}
    case = {"rma_number": new_rma_number(),
            "order_number": order["order_number"],
            "status": "inspection_passed",
            "items_snapshot": [{"index": 0, "eligible": True, "policy_class": "eligible_gold"}]}
    fake = SimpleNamespace(
        orders_v2=_Coll([order], key="order_number"),
        returns=_Coll([case], key="rma_number"),
        returns_audit=_Coll([]),
        dispute_cases=_Coll([]),
    )
    monkeypatch.setattr(rmod, "db", fake)
    with pytest.raises(HTTPException) as exc:
        _run(rmod.approve_refund(case["rma_number"], rmod.RefundIn(),
                                    _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "ACTIVE_DISPUTE_BLOCKS_REFUND"


def test_active_dispute_case_blocks_refund_even_if_payment_not_flipped(monkeypatch):
    """Belt-and-braces: even if orders_v2.payment_status has not yet
    flipped to disputed, an active dispute_cases row blocks refund."""
    from fastapi import HTTPException
    from routes import returns as rmod
    from services.returns_service import new_rma_number
    order = {"order_number": "PHI-TEST-DSP-INT2", "payment_status": "paid",
             "currency": "USD",
             "items": [{"quantity": 1, "unit_amount_cents": 350000}]}
    case = {"rma_number": new_rma_number(),
            "order_number": order["order_number"],
            "status": "inspection_passed",
            "items_snapshot": [{"index": 0, "eligible": True, "policy_class": "eligible_gold"}]}
    dispute = {"case_id": "DSP-2026-XXXXXX",
                "order_number": order["order_number"],
                "status": "needs_response"}
    fake = SimpleNamespace(
        orders_v2=_Coll([order], key="order_number"),
        returns=_Coll([case], key="rma_number"),
        returns_audit=_Coll([]),
        dispute_cases=_Coll([dispute]),
    )
    monkeypatch.setattr(rmod, "db", fake)
    with pytest.raises(HTTPException) as exc:
        _run(rmod.approve_refund(case["rma_number"], rmod.RefundIn(),
                                    _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "ACTIVE_DISPUTE_BLOCKS_REFUND"
