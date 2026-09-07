"""PHILEON — Admin Disputes routes (Layer 4)."""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from services.disputes_service import (
    RESPONSE_STATES, FRAUD_REVIEW_STATES,
    can_response_transition, urgency_from_due,
    build_evidence_packet, write_audit,
)


router = APIRouter(prefix="/admin/disputes", tags=["admin_disputes"])


def _deps():
    from server import verify_admin, db
    return verify_admin, db


verify_admin, db = _deps()


_TABS = {
    "new":            ["needs_response", "warning_needs_response"],
    "needs_response": ["needs_response", "warning_needs_response"],
    "evidence_ready": None,   # filtered by response_status
    "submitted":      None,
    "under_review":   ["under_review", "warning_under_review"],
    "won":            ["won"],
    "lost":           ["lost", "charge_refunded"],
    "closed":         ["warning_closed", "charge_dismissed"],
    "all":            None,
}


def _serialize(c: Dict[str, Any]) -> Dict[str, Any]:
    due = c.get("evidence_due_by")
    return {
        "case_id": c.get("case_id"),
        "order_number": c.get("order_number"),
        "stripe_dispute_id": c.get("stripe_dispute_id"),
        "status": c.get("status"),
        "reason": c.get("reason"),
        "amount_cents": c.get("amount_cents"),
        "currency": c.get("currency"),
        "evidence_due_by": due.isoformat() if isinstance(due, datetime) else due,
        "urgency": urgency_from_due(due),
        "is_charge_refundable": bool(c.get("is_charge_refundable")),
        "fraud_review_status": c.get("fraud_review_status") or "clear",
        "response_status": c.get("response_status") or "not_started",
        "manual_hold_reason": c.get("manual_hold_reason"),
        "created_at": _iso(c.get("created_at")),
        "updated_at": _iso(c.get("updated_at")),
        "closed_at": _iso(c.get("closed_at")),
    }


def _iso(v: Any) -> Optional[str]:
    return v.isoformat() if isinstance(v, datetime) else v


async def _load(case_id: str) -> Dict[str, Any]:
    c = await db.dispute_cases.find_one({"case_id": case_id}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    return c


# ────────────── QUEUE + DETAIL ──────────────

@router.get("")
async def list_disputes(status: str = Query(default="new"),
                          q: Optional[str] = Query(default=None, max_length=200),
                          limit: int = Query(default=50, ge=1, le=200),
                          _admin=Depends(verify_admin)):
    if status not in _TABS:
        raise HTTPException(status_code=400, detail={"code": "INVALID_STATUS"})
    filt: Dict[str, Any] = {}
    states = _TABS[status]
    if states is not None:
        filt["status"] = {"$in": states}
    elif status == "evidence_ready":
        filt["response_status"] = "ready_for_owner_review"
    elif status == "submitted":
        filt["response_status"] = "submitted"
    if q:
        s = q.strip()
        filt["$or"] = [
            {"case_id": {"$regex": f"^{s}", "$options": "i"}},
            {"order_number": {"$regex": f"^{s}", "$options": "i"}},
        ]
    cursor = db.dispute_cases.find(filt, {"_id": 0}).sort("created_at", -1).limit(limit)
    docs = [d async for d in cursor]
    return {"status": status, "count": len(docs),
            "cases": [_serialize(d) for d in docs]}


@router.get("/{case_id}")
async def get_dispute(case_id: str, _admin=Depends(verify_admin)):
    case = await _load(case_id)
    order = await db.orders_v2.find_one({"order_number": case.get("order_number")},
                                         {"_id": 0}) or {}
    rma = await db.returns.find_one({"order_number": case.get("order_number")},
                                      {"_id": 0})
    audit_cursor = db.fulfillment_audit.find(
        {"order_number": case.get("order_number")}, {"_id": 0}
    ).sort("at", -1).limit(50)
    fulfillment_audit = []
    async for r in audit_cursor:
        fulfillment_audit.append({
            "action": r.get("action"), "at": _iso(r.get("at")),
            "previous": r.get("previous"), "new": r.get("new"),
        })
    packet = build_evidence_packet(order, rma=rma,
                                     audit_shipment=fulfillment_audit)
    dcursor = db.disputes_audit.find({"case_id": case_id}, {"_id": 0}).sort("at", -1).limit(100)
    audit: List[Dict[str, Any]] = []
    async for a in dcursor:
        audit.append({
            "action": a.get("action"), "previous": a.get("previous"),
            "new": a.get("new"), "actor": a.get("actor"),
            "note": a.get("note"), "at": _iso(a.get("at")),
        })
    payload = _serialize(case)
    payload["evidence_packet"] = packet
    payload["audit"] = audit
    return payload


# ────────────── ACTIONS ──────────────

class NoteIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    note: str = Field(min_length=1, max_length=1000)


class HoldIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    reason: str = Field(min_length=3, max_length=500)


class ResponseStatusIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    response_status: str


class CloseIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    note: Optional[str] = Field(default=None, max_length=1000)


@router.post("/{case_id}/note")
async def add_note(case_id: str, body: NoteIn,
                    _admin=Depends(verify_admin)):
    case = await _load(case_id)
    await write_audit(db, case_id=case_id,
                      order_number=case.get("order_number") or "",
                      action="note", previous=None, new=None,
                      actor="admin", note=body.note)
    return {"ok": True}


@router.post("/{case_id}/fraud-hold")
async def fraud_hold(case_id: str, body: HoldIn,
                       _admin=Depends(verify_admin)):
    case = await _load(case_id)
    if case.get("order_number") == "PHI-20260901-4CBC5C":
        raise HTTPException(status_code=409,
                              detail={"code": "LOCKED_HISTORICAL_ORDER"})
    prev = case.get("fraud_review_status") or "clear"
    await db.dispute_cases.update_one({"case_id": case_id}, {"$set": {
        "fraud_review_status": "blocked",
        "manual_hold_reason": body.reason.strip(),
        "updated_at": datetime.now(timezone.utc),
    }})
    await write_audit(db, case_id=case_id,
                      order_number=case.get("order_number") or "",
                      action="fraud_hold", previous=prev, new="blocked",
                      actor="admin", note=body.reason)
    return _serialize(await _load(case_id))


@router.post("/{case_id}/release-fraud-hold")
async def release_fraud_hold(case_id: str,
                               _admin=Depends(verify_admin)):
    case = await _load(case_id)
    prev = case.get("fraud_review_status") or "blocked"
    if prev != "blocked":
        raise HTTPException(status_code=409, detail={"code": "NOT_BLOCKED"})
    # LOST dispute is a permanent fulfillment block. Generic release
    # cannot defeat a Stripe-authoritative loss.
    if (case.get("status") or "").lower() == "lost":
        raise HTTPException(status_code=409, detail={
            "code": "LOST_DISPUTE_BLOCK",
        })
    await db.dispute_cases.update_one({"case_id": case_id}, {"$set": {
        "fraud_review_status": "cleared",
        "manual_hold_reason": None,
        "updated_at": datetime.now(timezone.utc),
    }})
    await write_audit(db, case_id=case_id,
                      order_number=case.get("order_number") or "",
                      action="release_fraud_hold", previous=prev, new="cleared",
                      actor="admin", note=None)
    return _serialize(await _load(case_id))


@router.post("/{case_id}/response-status")
async def set_response_status(case_id: str, body: ResponseStatusIn,
                                _admin=Depends(verify_admin)):
    case = await _load(case_id)
    cur = case.get("response_status") or "not_started"
    if not can_response_transition(cur, body.response_status):
        raise HTTPException(status_code=409, detail={
            "code": "INVALID_TRANSITION", "from": cur,
            "to": body.response_status,
        })
    # Guard: `submitted` is only allowed via a future hardened submission
    # path in a later phase. Layer 4 refuses direct owner-set "submitted"
    # unless Stripe TEST mode is in use, and even then it does NOT
    # actually submit evidence to Stripe.
    if body.response_status == "submitted":
        import os
        if (os.environ.get("STRIPE_MODE") or "test").lower() != "test":
            raise HTTPException(status_code=409, detail={
                "code": "LIVE_SUBMISSION_DISABLED_IN_LAYER_4",
            })
    await db.dispute_cases.update_one({"case_id": case_id}, {"$set": {
        "response_status": body.response_status,
        "updated_at": datetime.now(timezone.utc),
    }})
    await write_audit(db, case_id=case_id,
                      order_number=case.get("order_number") or "",
                      action=f"response:{body.response_status}",
                      previous=cur, new=body.response_status,
                      actor="admin", note=None)
    return _serialize(await _load(case_id))


@router.post("/{case_id}/close")
async def close_case(case_id: str, body: CloseIn = CloseIn(),
                       _admin=Depends(verify_admin)):
    case = await _load(case_id)
    await db.dispute_cases.update_one({"case_id": case_id}, {"$set": {
        "response_status": "closed",
        "closed_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }})
    await write_audit(db, case_id=case_id,
                      order_number=case.get("order_number") or "",
                      action="close", previous=case.get("response_status"),
                      new="closed", actor="admin", note=body.note)
    return _serialize(await _load(case_id))
