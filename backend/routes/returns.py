"""PHILEON — Returns / RMA / Refund Operations (Layer 3) — routes.

Customer intake:
  POST /api/returns/request  — token-secured customer return request.
  GET  /api/returns/{rma}    — token-secured customer status lookup.

Admin surface (JWT `verify_admin`):
  GET  /api/admin/returns                  — queue with filters.
  GET  /api/admin/returns/{rma}            — detail + audit.
  POST /api/admin/returns/{rma}/verify-delivery { delivered_at }
  POST /api/admin/returns/{rma}/authorize   { note?, return_instructions? }
  POST /api/admin/returns/{rma}/deny        { reason }
  POST /api/admin/returns/{rma}/receive     { condition_note? }
  POST /api/admin/returns/{rma}/inspect     { result: pass|fail, notes? }
  POST /api/admin/returns/{rma}/refund      { note? }
  POST /api/admin/returns/{rma}/close       { note? }
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, EmailStr, Field
import hashlib

from services.returns_service import (
    RMA_STATES, ALLOWED_TRANSITIONS, can_transition,
    new_rma_number, classify_item_policy,
    evaluate_item_eligibility, calculate_refund_cents,
    request_type_for_reason, CUSTOMER_REASON_CODES,
    write_audit,
)


customer_router = APIRouter(prefix="/returns", tags=["returns_customer"])
admin_router = APIRouter(prefix="/admin/returns", tags=["returns_admin"])


def _get_deps():
    from server import verify_admin, db
    return verify_admin, db


verify_admin, db = _get_deps()


# ────────────────────────────────────────────────────────────────
# CUSTOMER INTAKE
# ────────────────────────────────────────────────────────────────

class ReturnRequestIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    order_number: str = Field(min_length=6, max_length=64)
    token: str = Field(min_length=8, max_length=256)
    item_indices: List[int] = Field(default_factory=list, max_length=20)
    reason: str = Field(min_length=1, max_length=64)
    note: Optional[str] = Field(default=None, max_length=1000)
    customer_name: Optional[str] = Field(default=None, max_length=200)


def _hash_token(t: str) -> str:
    return hashlib.sha256(t.encode("utf-8")).hexdigest()


def _serialize_case_for_customer(case: Dict[str, Any]) -> Dict[str, Any]:
    """Customer-facing shape — never surfaces internal fields."""
    return {
        "rma_number": case.get("rma_number"),
        "order_number": case.get("order_number"),
        "status": case.get("status"),
        "request_type": case.get("request_type"),
        "customer_message": _customer_status_message(case.get("status")),
        "requested_at": _iso(case.get("requested_at")),
        "authorized_at": _iso(case.get("authorized_at")),
        "received_at": _iso(case.get("received_at")),
        "closed_at": _iso(case.get("closed_at")),
        "items": [{
            "product_name": i.get("product_name"),
            "variant": i.get("variant"),
            "ring_size": i.get("ring_size"),
            "quantity": int(i.get("quantity") or 1),
            "policy_class": i.get("policy_class"),
        } for i in (case.get("items_snapshot") or [])],
        "return_instructions": case.get("return_instructions"),
    }


def _serialize_case_for_admin(case: Dict[str, Any]) -> Dict[str, Any]:
    """Admin-facing shape — includes eligibility + inspection notes.
    Never surfaces JWTs, Stripe secret keys, or webhook payloads."""
    return {
        "rma_number": case.get("rma_number"),
        "order_number": case.get("order_number"),
        "customer_email": case.get("customer_email"),
        "customer_name": case.get("customer_name"),
        "status": case.get("status"),
        "request_type": case.get("request_type"),
        "reason_code": case.get("reason_code"),
        "customer_note": case.get("customer_note"),
        "policy_class": case.get("policy_class"),
        "owner_review_required": case.get("owner_review_required", False),
        "eligibility_reasons": case.get("eligibility_reasons") or [],
        "return_window_expires_at": _iso(case.get("return_window_expires_at")),
        "requested_at": _iso(case.get("requested_at")),
        "authorized_at": _iso(case.get("authorized_at")),
        "received_at": _iso(case.get("received_at")),
        "inspection_status": case.get("inspection_status"),
        "inspection_notes": case.get("inspection_notes"),
        "refund_decision": case.get("refund_decision"),
        "refund_amount_base_cents": case.get("refund_amount_base_cents"),
        "refund_currency_base": case.get("refund_currency_base"),
        "stripe_refund_id": case.get("stripe_refund_id"),
        "stripe_refund_status": case.get("stripe_refund_status"),
        "return_instructions": case.get("return_instructions"),
        "items_snapshot": case.get("items_snapshot") or [],
        "closed_at": _iso(case.get("closed_at")),
        "created_at": _iso(case.get("created_at")),
        "updated_at": _iso(case.get("updated_at")),
    }


def _iso(v: Any) -> Optional[str]:
    return v.isoformat() if isinstance(v, datetime) else v


_CUSTOMER_STATUS_COPY = {
    "requested":          "Return request received. Our concierge team will respond within 1 business day.",
    "under_review":       "Your request is under review.",
    "authorized":         "Return authorized. Please follow the return instructions provided.",
    "denied":             "This return request is not eligible under our current policy.",
    "in_transit":         "We're expecting your return. Thank you.",
    "received":           "Your return has arrived. Inspection will begin shortly.",
    "inspection_pending": "Inspection in progress.",
    "inspection_passed":  "Inspection complete. Refund is being prepared.",
    "inspection_failed":  "The returned item did not pass inspection.",
    "refund_approved":    "Refund approved. Please allow 5–10 business days for the refund to reach your original payment method after we process it.",
    "refund_pending":     "Refund submitted to your payment method. Please allow 5–10 business days.",
    "refunded":           "Refund confirmed by your payment provider.",
    "closed":             "This case is closed.",
}


def _customer_status_message(status: Optional[str]) -> Optional[str]:
    return _CUSTOMER_STATUS_COPY.get(status)


async def _verify_order_token(order_number: str, token: str) -> Dict[str, Any]:
    """Reuse the same status-token hash architecture used by the customer
    order-status endpoint. `status_token_hash` on `orders_v2` is the
    canonical secret."""
    if not order_number or not token:
        raise HTTPException(status_code=422, detail={"code": "MISSING_TOKEN"})
    order = await db.orders_v2.find_one({"order_number": order_number}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    expected = order.get("status_token_hash")
    if not expected or _hash_token(token) != expected:
        raise HTTPException(status_code=403, detail={"code": "INVALID_TOKEN"})
    return order


@customer_router.post("/request")
async def customer_request_return(body: ReturnRequestIn):
    """Customer intake. Token-secured. Never creates a duplicate active
    RMA for the same order — an existing non-terminal case returns 409.
    """
    order = await _verify_order_token(body.order_number, body.token)

    # One active RMA per order at a time.
    existing = await db.returns.find_one({
        "order_number": body.order_number,
        "status": {"$nin": ["denied", "refunded", "closed"]},
    }, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail={
            "code": "ACTIVE_RMA_EXISTS",
            "rma_number": existing.get("rma_number"),
        })

    reason = body.reason.strip()
    if reason not in CUSTOMER_REASON_CODES:
        raise HTTPException(status_code=422, detail={
            "code": "INVALID_REASON",
        })
    req_type = request_type_for_reason(reason)

    # Compute a preliminary policy verdict per requested item.
    items = order.get("items") or []
    idxs = body.item_indices or list(range(len(items)))
    items_snapshot: List[Dict[str, Any]] = []
    any_owner_review = False
    all_denied = True
    per_item_reasons: List[str] = []
    for i in idxs:
        if 0 <= i < len(items):
            src = items[i]
            verdict = evaluate_item_eligibility(order, src)
            items_snapshot.append({
                "index": i,
                "product_name": src.get("product_name"),
                "variant": src.get("variant"),
                "ring_size": src.get("ring_size"),
                "quantity": int(src.get("quantity") or 1),
                "unit_amount_cents": int(src.get("unit_amount_cents") or 0),
                "policy_class": verdict.policy_class,
                "eligible": verdict.eligible,
                "owner_review_required": verdict.owner_review_required,
                "reasons": verdict.reasons,
            })
            if verdict.eligible:
                all_denied = False
            if verdict.owner_review_required:
                any_owner_review = True
                all_denied = False
            per_item_reasons.extend(verdict.reasons)

    # Warranty cases ALWAYS route to owner review, never auto-eligible.
    if req_type == "warranty":
        initial_status = "under_review"
        any_owner_review = True
    elif all_denied and not any_owner_review:
        initial_status = "denied"
    elif any_owner_review:
        initial_status = "under_review"
    else:
        initial_status = "requested"

    # Aggregate policy class — pick the strictest for the case summary.
    classes = {s.get("policy_class") for s in items_snapshot}
    if "unknown" in classes:
        policy_class = "unknown"
    elif classes & {"silver", "custom", "engraved", "resized"}:
        policy_class = next(iter(classes & {"silver", "custom", "engraved", "resized"}))
    else:
        policy_class = "eligible_gold" if items_snapshot else "unknown"

    # Window from the first eligible line item.
    window_expires = None
    for s in items_snapshot:
        if s.get("policy_class") == "eligible_gold":
            v = evaluate_item_eligibility(order, items[s["index"]])
            if v.return_window_expires_at:
                window_expires = v.return_window_expires_at
                break

    now = datetime.now(timezone.utc)
    case = {
        "rma_number": new_rma_number(),
        "order_number": body.order_number,
        "customer_email": order.get("customer_email"),
        "customer_name": (body.customer_name or "").strip() or None,
        "status": initial_status,
        "request_type": req_type,
        "reason_code": reason,
        "customer_note": (body.note or "").strip() or None,
        "policy_class": policy_class,
        "owner_review_required": any_owner_review,
        "eligibility_reasons": list(dict.fromkeys(per_item_reasons)),
        "return_window_expires_at": window_expires,
        "items_snapshot": items_snapshot,
        "requested_at": now,
        "created_at": now,
        "updated_at": now,
    }
    await db.returns.insert_one(case)
    await write_audit(db, rma_number=case["rma_number"],
                      order_number=body.order_number,
                      action="request", previous=None, new=initial_status,
                      actor="customer", reason=reason,
                      extra={"request_type": req_type,
                             "owner_review_required": any_owner_review})
    return _serialize_case_for_customer(case)


@customer_router.get("/{rma_number}")
async def customer_get_return(rma_number: str,
                               order_number: str = Query(...),
                               token: str = Query(...)):
    """Token-secured customer status lookup."""
    await _verify_order_token(order_number, token)
    case = await db.returns.find_one({
        "rma_number": rma_number, "order_number": order_number,
    }, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    return _serialize_case_for_customer(case)


# ────────────────────────────────────────────────────────────────
# ADMIN — QUEUE + DETAIL
# ────────────────────────────────────────────────────────────────

_ADMIN_TABS = {
    "new":          ["requested"],
    "under_review": ["under_review"],
    "authorized":   ["authorized", "in_transit"],
    "received":     ["received", "inspection_pending"],
    "inspection":   ["inspection_pending", "inspection_passed", "inspection_failed"],
    "refund":       ["refund_approved", "refund_pending"],
    "refunded":     ["refunded"],
    "denied":       ["denied"],
    "closed":       ["closed"],
    "all":          None,
}


@admin_router.get("")
async def admin_list_returns(status: str = Query(default="new"),
                              limit: int = Query(default=50, ge=1, le=200),
                              q: Optional[str] = Query(default=None, max_length=200),
                              _admin=Depends(verify_admin)):
    if status not in _ADMIN_TABS:
        raise HTTPException(status_code=400, detail={"code": "INVALID_STATUS"})
    filt: Dict[str, Any] = {}
    states = _ADMIN_TABS[status]
    if states is not None:
        filt["status"] = {"$in": states}
    if q:
        s = q.strip()
        filt["$or"] = [
            {"rma_number": {"$regex": f"^{s}", "$options": "i"}},
            {"order_number": {"$regex": f"^{s}", "$options": "i"}},
            {"customer_email": {"$regex": s, "$options": "i"}},
        ]
    cursor = db.returns.find(filt, {"_id": 0}).sort("created_at", -1).limit(limit)
    docs = [d async for d in cursor]
    return {"status": status, "count": len(docs),
            "cases": [_serialize_case_for_admin(d) for d in docs]}


@admin_router.get("/{rma_number}")
async def admin_get_return(rma_number: str, _admin=Depends(verify_admin)):
    case = await db.returns.find_one({"rma_number": rma_number}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    cur = db.returns_audit.find({"rma_number": rma_number}, {"_id": 0}).sort("at", -1).limit(100)
    audit = []
    async for r in cur:
        audit.append({
            "action": r.get("action"),
            "previous": r.get("previous"),
            "new": r.get("new"),
            "actor": r.get("actor"),
            "reason": r.get("reason"),
            "at": _iso(r.get("at")),
            "extra": r.get("extra"),
        })
    payload = _serialize_case_for_admin(case)
    payload["audit"] = audit
    return payload


# ────────────────────────────────────────────────────────────────
# ADMIN — ACTIONS
# ────────────────────────────────────────────────────────────────

class NoteIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    note: Optional[str] = Field(default=None, max_length=1000)


class AuthorizeIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    note: Optional[str] = Field(default=None, max_length=1000)
    return_instructions: Optional[str] = Field(default=None, max_length=2000)


class DenyIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    reason: str = Field(min_length=3, max_length=500)


class ReceiveIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    condition_note: Optional[str] = Field(default=None, max_length=1000)


class InspectIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    result: str = Field(pattern="^(pass|fail)$")
    notes: Optional[str] = Field(default=None, max_length=2000)


class VerifyDeliveryIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    delivered_at: str = Field(description="ISO-8601 UTC delivery date")


class RefundIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    note: Optional[str] = Field(default=None, max_length=1000)


async def _load(rma_number: str) -> Dict[str, Any]:
    case = await db.returns.find_one({"rma_number": rma_number}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    return case


async def _transition(rma_number: str, target: str, *, actor: str,
                      reason: Optional[str] = None,
                      extra_set: Optional[Dict[str, Any]] = None,
                      allow_from: Optional[tuple] = None
                      ) -> Dict[str, Any]:
    case = await _load(rma_number)
    current = case.get("status")
    if allow_from is not None and current not in allow_from:
        raise HTTPException(status_code=409, detail={
            "code": "INVALID_TRANSITION", "from": current, "to": target,
        })
    if not can_transition(current, target):
        raise HTTPException(status_code=409, detail={
            "code": "INVALID_TRANSITION", "from": current, "to": target,
        })
    now = datetime.now(timezone.utc)
    upd: Dict[str, Any] = {"status": target, "updated_at": now}
    if extra_set:
        upd.update(extra_set)
    r = await db.returns.update_one({"rma_number": rma_number}, {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    await write_audit(db, rma_number=rma_number,
                      order_number=case.get("order_number") or "",
                      action=f"transition:{target}",
                      previous=current, new=target,
                      actor=actor, reason=reason)
    fresh = await _load(rma_number)
    return _serialize_case_for_admin(fresh)


@admin_router.post("/{rma_number}/verify-delivery")
async def verify_delivery(rma_number: str, body: VerifyDeliveryIn,
                           _admin=Depends(verify_admin)):
    """Owner records a manually-verified delivery date. Recomputes
    eligibility for the case. Never overrides `payment_status`."""
    try:
        d = datetime.fromisoformat(body.delivered_at.replace("Z", "+00:00"))
    except Exception:
        raise HTTPException(status_code=422, detail={"code": "INVALID_DATE"})
    case = await _load(rma_number)
    order = await db.orders_v2.find_one({"order_number": case.get("order_number")},
                                         {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail={"code": "ORDER_NOT_FOUND"})
    order["delivered_at"] = d
    # Recompute per-item eligibility using the owner-supplied date.
    items = order.get("items") or []
    snap = case.get("items_snapshot") or []
    for s in snap:
        i = s.get("index")
        if isinstance(i, int) and 0 <= i < len(items):
            v = evaluate_item_eligibility(order, items[i])
            s["eligible"] = v.eligible
            s["owner_review_required"] = v.owner_review_required
            s["reasons"] = v.reasons
    window_expires = None
    for s in snap:
        if s.get("policy_class") == "eligible_gold" and s.get("eligible"):
            i = s.get("index")
            if isinstance(i, int) and 0 <= i < len(items):
                v = evaluate_item_eligibility(order, items[i])
                if v.return_window_expires_at:
                    window_expires = v.return_window_expires_at
                    break
    now = datetime.now(timezone.utc)
    await db.returns.update_one({"rma_number": rma_number}, {"$set": {
        "delivered_at_owner_verified": d,
        "items_snapshot": snap,
        "return_window_expires_at": window_expires,
        "owner_review_required": any(s.get("owner_review_required") for s in snap),
        "updated_at": now,
    }})
    await write_audit(db, rma_number=rma_number,
                      order_number=case.get("order_number") or "",
                      action="verify_delivery", previous=None, new=None,
                      actor="admin", reason=None,
                      extra={"delivered_at": d.isoformat()})
    return _serialize_case_for_admin(await _load(rma_number))


@admin_router.post("/{rma_number}/authorize")
async def authorize(rma_number: str, body: AuthorizeIn = AuthorizeIn(),
                     _admin=Depends(verify_admin)):
    extra: Dict[str, Any] = {"authorized_at": datetime.now(timezone.utc)}
    if body.return_instructions:
        extra["return_instructions"] = body.return_instructions.strip()
    return await _transition(rma_number, "authorized", actor="admin",
                              reason=body.note, extra_set=extra,
                              allow_from=("requested", "under_review"))


@admin_router.post("/{rma_number}/deny")
async def deny(rma_number: str, body: DenyIn,
                _admin=Depends(verify_admin)):
    return await _transition(rma_number, "denied", actor="admin",
                              reason=body.reason,
                              extra_set={"refund_decision": "denied"},
                              allow_from=("requested", "under_review",
                                          "authorized", "in_transit",
                                          "inspection_failed"))


@admin_router.post("/{rma_number}/receive")
async def receive(rma_number: str, body: ReceiveIn = ReceiveIn(),
                   _admin=Depends(verify_admin)):
    return await _transition(rma_number, "received", actor="admin",
                              reason=body.condition_note,
                              extra_set={"received_at": datetime.now(timezone.utc)},
                              allow_from=("authorized", "in_transit"))


@admin_router.post("/{rma_number}/inspect")
async def inspect(rma_number: str, body: InspectIn,
                   _admin=Depends(verify_admin)):
    target = "inspection_passed" if body.result == "pass" else "inspection_failed"
    return await _transition(rma_number, target, actor="admin",
                              reason=body.notes,
                              extra_set={"inspection_status": body.result,
                                         "inspection_notes": body.notes},
                              allow_from=("received", "inspection_pending"))


@admin_router.post("/{rma_number}/refund")
async def refund(rma_number: str, body: RefundIn = RefundIn(),
                  _admin=Depends(verify_admin)):
    """Owner authorizes refund. Layer 3: computes trusted refund amount
    from original order snapshot. Actual Stripe refund execution is
    gated by `STRIPE_MODE` — LIVE refunds are refused in this phase.
    The final `refunded` state is set by the `charge.refunded` webhook.
    """
    case = await _load(rma_number)
    if case.get("status") not in ("inspection_passed", "refund_approved"):
        raise HTTPException(status_code=409, detail={
            "code": "INVALID_TRANSITION",
            "from": case.get("status"), "to": "refund_approved",
        })
    order = await db.orders_v2.find_one({"order_number": case.get("order_number")},
                                         {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail={"code": "ORDER_NOT_FOUND"})
    if case.get("order_number") == "PHI-20260901-4CBC5C":
        raise HTTPException(status_code=409, detail={
            "code": "LOCKED_HISTORICAL_ORDER",
        })
    item_idxs = [int(s["index"]) for s in (case.get("items_snapshot") or [])
                 if isinstance(s.get("index"), int) and s.get("eligible")]
    refund_cents, currency = calculate_refund_cents(order, item_idxs)
    if refund_cents <= 0:
        raise HTTPException(status_code=409, detail={"code": "NO_REFUNDABLE_AMOUNT"})
    if case.get("stripe_refund_id"):
        raise HTTPException(status_code=409, detail={
            "code": "REFUND_ALREADY_ISSUED",
            "stripe_refund_id": case.get("stripe_refund_id"),
        })
    # Layer 3 gate: no LIVE refund is executed. Owner sets the case to
    # `refund_approved`; the actual Stripe call is deferred to a
    # dedicated hardened path (future).
    import os
    stripe_mode = (os.environ.get("STRIPE_MODE") or "test").lower()
    if stripe_mode != "test":
        raise HTTPException(status_code=409, detail={
            "code": "LIVE_REFUND_DISABLED_IN_LAYER_3",
        })
    now = datetime.now(timezone.utc)
    r = await db.returns.update_one({"rma_number": rma_number}, {"$set": {
        "status": "refund_approved",
        "refund_decision": "approved",
        "refund_amount_base_cents": refund_cents,
        "refund_currency_base": currency,
        "refund_approved_at": now,
        "updated_at": now,
    }})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    await write_audit(db, rma_number=rma_number,
                      order_number=case.get("order_number") or "",
                      action="refund_approved",
                      previous=case.get("status"), new="refund_approved",
                      actor="admin", reason=body.note,
                      extra={"refund_amount_base_cents": refund_cents,
                             "refund_currency_base": currency})
    return _serialize_case_for_admin(await _load(rma_number))


@admin_router.post("/{rma_number}/close")
async def close_case(rma_number: str, body: NoteIn = NoteIn(),
                      _admin=Depends(verify_admin)):
    return await _transition(rma_number, "closed", actor="admin",
                              reason=body.note,
                              extra_set={"closed_at": datetime.now(timezone.utc)},
                              allow_from=("denied", "refunded",
                                          "inspection_passed",
                                          "inspection_failed",
                                          "refund_approved",
                                          "refund_pending"))
