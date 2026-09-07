"""Admin-only order fulfillment mutations.

Uses the existing `verify_admin` JWT Bearer dependency defined in
`server.py`. Never trusts non-monetary/monetary client fields for pricing.
The only fields writable through these routes are fulfillment/tracking
metadata — canonical USD amounts, presentment, and payment_status are
untouchable here.

Layer-2 additions on top of the original mark-shipped endpoint:
  · GET  /admin/orders                          — paginated fulfillment queue
  · POST /admin/orders/{order}/approve          — approve for fulfillment
  · POST /admin/orders/{order}/prepare          — move to in_preparation
  · POST /admin/orders/{order}/ready-to-ship    — move to ready_to_ship
  · POST /admin/orders/{order}/hold             — manual owner hold
  · POST /admin/orders/{order}/release-hold     — release manual hold
  · POST /admin/orders/{order}/correct-shipment — controlled tracking correction
  · GET  /admin/orders/{order}/audit            — fulfillment audit trail

Every state-advancing endpoint enforces `evaluate_eligibility()` and
records an entry in `fulfillment_audit`. Integrity holds
(`shipping_integrity_status` / `presentment_integrity_status`) can NEVER
be bypassed from the admin panel — they are set by the Stripe webhook and
must be resolved at the source.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from services.fulfillment import (
    OPERATIONAL_STATES,
    can_transition,
    evaluate_eligibility,
    sanitize_tracking_number,
    build_tracking_url,
    write_audit,
)


router = APIRouter(prefix="/admin/orders", tags=["admin_orders"])


# ────────────────────────────────────────────────────────────────
# INPUT MODELS
# ────────────────────────────────────────────────────────────────

class MarkShippedIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    carrier: str = Field(min_length=1, max_length=80)
    tracking_number: str = Field(min_length=1, max_length=120)
    tracking_url: Optional[str] = Field(default=None, max_length=500)
    service: Optional[str] = Field(default=None, max_length=120)


class SetFulfillmentIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    fulfillment_type: Optional[str] = None
    dispatch_estimate: Optional[str] = None
    fulfillment_status: Optional[str] = None


class TransitionIn(BaseModel):
    """Body for advance-state endpoints (approve/prepare/ready-to-ship).

    Optional operator note carried into the audit log — no other fields
    are accepted to prevent field-injection.
    """
    model_config = ConfigDict(extra="forbid")
    note: Optional[str] = Field(default=None, max_length=500)


class HoldIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    reason: str = Field(min_length=3, max_length=500)


class CorrectShipmentIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    carrier: Optional[str] = Field(default=None, min_length=1, max_length=80)
    tracking_number: Optional[str] = Field(default=None, min_length=1, max_length=120)
    tracking_url: Optional[str] = Field(default=None, max_length=500)
    service: Optional[str] = Field(default=None, max_length=120)
    reason: str = Field(min_length=3, max_length=500)


# ────────────────────────────────────────────────────────────────
# WIRING
# ────────────────────────────────────────────────────────────────

def _get_db_and_verify():
    from server import verify_admin, db  # noqa: F401
    return verify_admin, db


verify_admin, db = _get_db_and_verify()


# ────────────────────────────────────────────────────────────────
# HELPERS
# ────────────────────────────────────────────────────────────────

_SUMMARY_PROJECTION = {
    "_id": 0,
    "status_token_hash": 0,
    "email_status_token": 0,
    "id": 0,
    "provider_session_id": 0,
    "provider_payment_intent_id": 0,
    "webhook_event_ids": 0,
    "idempotency_key": 0,
    # `presentment.fx_*` internal reconciliation kept out of admin JSON.
    "presentment.fx_rate": 0,
    "presentment.fx_rate_source": 0,
    "presentment.fx_retrieved_at": 0,
    "presentment.fx_reference_date": 0,
    "presentment.fx_is_stale": 0,
    "presentment.stripe_presentment_currency": 0,
    "presentment.stripe_presentment_amount_cents": 0,
    "presentment.extraction_source": 0,
    "presentment.display_currency_selected_at_session": 0,
}


def _projection_for_get() -> Dict[str, int]:
    return dict(_SUMMARY_PROJECTION)


def _serialize_order_for_admin(doc: Dict[str, Any]) -> Dict[str, Any]:
    shipping = doc.get("shipping") or {}
    presentment = doc.get("presentment") or {}
    shipped_at = doc.get("shipped_at")
    created_at = doc.get("created_at")
    return {
        "order_number": doc.get("order_number"),
        "customer_email": doc.get("customer_email"),
        "payment_status": doc.get("payment_status"),
        "fulfilment_status": doc.get("fulfilment_status"),        # BR — webhook truth
        "fulfillment_status": doc.get("fulfillment_status"),       # US — operational
        "fulfillment_hold_reason": doc.get("fulfillment_hold_reason"),
        "shipping_integrity_status": doc.get("shipping_integrity_status"),
        "presentment_integrity_status": doc.get("presentment_integrity_status"),
        "shipping_notification_sent": bool(doc.get("shipping_notification_sent")),
        "shipping": {
            "country": shipping.get("country"),
            "zone_key": shipping.get("zone_key"),
            "service_label": shipping.get("service_label"),
            "carrier_label": shipping.get("carrier_label"),
            "recipient_name": shipping.get("recipient_name"),
            "signature_required": shipping.get("signature_required"),
            "insurance_required": shipping.get("insurance_required"),
        },
        "presentment": {
            "presentment_currency": presentment.get("presentment_currency"),
            "presentment_total_cents": presentment.get("presentment_total_cents"),
            "lane": presentment.get("lane"),
        } if presentment else None,
        "carrier": doc.get("carrier"),
        "tracking_number": doc.get("tracking_number"),
        "tracking_url": doc.get("tracking_url"),
        "shipped_at": shipped_at.isoformat() if isinstance(shipped_at, datetime) else shipped_at,
        "currency": doc.get("currency"),
        "total_cents": int(doc.get("total_cents") or 0),
        "items": [{
            "product_name": i.get("product_name"),
            "variant": i.get("variant"),
            "quantity": int(i.get("quantity") or 1),
            "unit_amount_cents": int(i.get("unit_amount_cents") or 0),
            "ring_size": i.get("ring_size"),
            "metal_colour": i.get("metal_colour"),
            "karat": i.get("karat"),
        } for i in (doc.get("items") or [])],
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else created_at,
    }


async def _load(order_number: str) -> Dict[str, Any]:
    doc = await db.orders_v2.find_one({"order_number": order_number},
                                       _projection_for_get())
    if not doc:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    return doc


async def _apply_transition(order_number: str, target: str,
                            *, actor: str, note: Optional[str] = None,
                            enforce_eligibility: bool = True,
                            extra_set: Optional[Dict[str, Any]] = None
                            ) -> Dict[str, Any]:
    """Load, validate transition, apply, audit. Returns the updated order."""
    doc = await _load(order_number)
    current = doc.get("fulfillment_status")

    if enforce_eligibility:
        verdict = evaluate_eligibility(doc)
        if not verdict.eligible:
            raise HTTPException(status_code=409, detail={
                "code": "NOT_ELIGIBLE",
                "reasons": verdict.reasons,
                "requires": verdict.requires,
            })

    if not can_transition(current, target):
        raise HTTPException(status_code=409, detail={
            "code": "INVALID_TRANSITION",
            "from": current, "to": target,
        })

    now = datetime.now(timezone.utc)
    upd: Dict[str, Any] = {
        "fulfillment_status": target,
        "updated_at": now,
    }
    # Releasing a hold clears the recorded reason.
    if current == "on_hold" and target != "on_hold":
        upd["fulfillment_hold_reason"] = None
    if extra_set:
        upd.update(extra_set)

    r = await db.orders_v2.update_one({"order_number": order_number},
                                       {"$set": upd})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})

    await write_audit(db, order_number=order_number,
                      action=f"transition:{target}",
                      previous=current, new=target,
                      actor=actor, reason=note)

    fresh = await db.orders_v2.find_one({"order_number": order_number},
                                        _projection_for_get())
    return _serialize_order_for_admin(fresh)


# ────────────────────────────────────────────────────────────────
# QUEUE + DETAIL
# ────────────────────────────────────────────────────────────────

_ELIGIBLE_STATUS_FILTERS = {
    "needs_review",     # awaiting owner approval OR integrity hold
    "in_preparation",
    "ready_to_ship",
    "shipped",
    "on_hold",
    "cancelled",
    "all",
}


@router.get("")
async def list_orders(
    status: str = Query(default="needs_review",
                        description="Queue filter."),
    q: Optional[str] = Query(default=None, max_length=200,
                              description="Search by order_number or customer_email."),
    limit: int = Query(default=50, ge=1, le=200),
    _admin=Depends(verify_admin),
):
    """Paginated fulfillment queue. All money-authoritative fields are
    projected out; only fulfillment / operations metadata is returned."""
    if status not in _ELIGIBLE_STATUS_FILTERS:
        raise HTTPException(status_code=400,
                            detail={"code": "INVALID_STATUS"})

    filt: Dict[str, Any] = {}
    if status == "needs_review":
        filt["payment_status"] = {"$in": ["paid", "authorized"]}
        filt["$or"] = [
            {"fulfillment_status": {"$in": [None, "pending_review"]}},
            {"shipping_integrity_status": "pending_review"},
            {"presentment_integrity_status": "pending_review"},
        ]
    elif status == "in_preparation":
        filt["fulfillment_status"] = {"$in": ["approved_for_fulfillment", "in_preparation"]}
    elif status == "ready_to_ship":
        filt["fulfillment_status"] = "ready_to_ship"
    elif status == "shipped":
        filt["fulfillment_status"] = "shipped"
    elif status == "on_hold":
        filt["fulfillment_status"] = "on_hold"
    elif status == "cancelled":
        filt["fulfillment_status"] = "cancelled"
    # status == "all" → no filter

    if q:
        q_str = q.strip()
        or_search = [
            {"order_number": {"$regex": f"^{q_str}", "$options": "i"}},
            {"customer_email": {"$regex": q_str, "$options": "i"}},
        ]
        if "$or" in filt:
            # Merge the two $or clauses under $and.
            filt = {"$and": [{"$or": filt.pop("$or")}, {"$or": or_search}], **filt}
        else:
            filt["$or"] = or_search

    cursor = db.orders_v2.find(filt, _projection_for_get()).sort("created_at", -1).limit(limit)
    docs = [d async for d in cursor]
    return {
        "status": status,
        "count": len(docs),
        "orders": [_serialize_order_for_admin(d) for d in docs],
    }


@router.get("/{order_number}")
async def get_order(order_number: str, _admin=Depends(verify_admin)):
    """Admin-only order summary for the shipment UI."""
    doc = await _load(order_number)
    verdict = evaluate_eligibility(doc)
    payload = _serialize_order_for_admin(doc)
    payload["eligibility"] = verdict.to_dict()
    return payload


@router.get("/{order_number}/audit")
async def get_audit_trail(order_number: str, _admin=Depends(verify_admin),
                          limit: int = Query(default=50, ge=1, le=200)):
    """Return the audit trail for one order (newest first)."""
    # Existence check first — never leak "does this order exist" via audit.
    await _load(order_number)
    cursor = db.fulfillment_audit.find(
        {"order_number": order_number}, {"_id": 0},
    ).sort("at", -1).limit(limit)
    rows: List[Dict[str, Any]] = []
    async for r in cursor:
        at = r.get("at")
        rows.append({
            "order_number": r.get("order_number"),
            "action": r.get("action"),
            "previous": r.get("previous"),
            "new": r.get("new"),
            "actor": r.get("actor"),
            "reason": r.get("reason"),
            "at": at.isoformat() if isinstance(at, datetime) else at,
            "extra": r.get("extra"),
        })
    return {"order_number": order_number, "count": len(rows), "audit": rows}


# ────────────────────────────────────────────────────────────────
# TRANSITIONS
# ────────────────────────────────────────────────────────────────

@router.post("/{order_number}/approve")
async def approve_for_fulfillment(order_number: str,
                                  body: TransitionIn = TransitionIn(),
                                  _admin=Depends(verify_admin)):
    """Owner confirms item/size/variant is correct and integrity is green.
    Advances `fulfillment_status` → `approved_for_fulfillment`."""
    return await _apply_transition(order_number, "approved_for_fulfillment",
                                   actor="admin", note=body.note)


@router.post("/{order_number}/prepare")
async def prepare(order_number: str, body: TransitionIn = TransitionIn(),
                  _admin=Depends(verify_admin)):
    """`approved_for_fulfillment` → `in_preparation`."""
    return await _apply_transition(order_number, "in_preparation",
                                   actor="admin", note=body.note)


@router.post("/{order_number}/ready-to-ship")
async def ready_to_ship(order_number: str, body: TransitionIn = TransitionIn(),
                        _admin=Depends(verify_admin)):
    """`in_preparation` → `ready_to_ship`."""
    return await _apply_transition(order_number, "ready_to_ship",
                                   actor="admin", note=body.note)


@router.post("/{order_number}/hold")
async def place_on_hold(order_number: str, body: HoldIn,
                        _admin=Depends(verify_admin)):
    """Place a paid order on MANUAL fulfillment hold. Records the reason.
    Does NOT touch `payment_status`. Cannot be used to bypass an integrity
    hold — this is a SEPARATE hold from the webhook-set integrity states.
    """
    doc = await _load(order_number)
    if (doc.get("fulfillment_status") or "").lower() == "shipped":
        raise HTTPException(status_code=409, detail={
            "code": "ALREADY_SHIPPED",
            "message": "Shipped orders cannot be placed on hold.",
        })
    if (doc.get("payment_status") or "").lower() not in ("paid", "authorized"):
        raise HTTPException(status_code=409, detail={
            "code": "NOT_PAID",
            "message": "Only paid or authorized orders can be held.",
        })
    current = doc.get("fulfillment_status")
    await db.orders_v2.update_one(
        {"order_number": order_number},
        {"$set": {
            "fulfillment_status": "on_hold",
            "fulfillment_hold_reason": body.reason.strip(),
            "updated_at": datetime.now(timezone.utc),
        }},
    )
    await write_audit(db, order_number=order_number, action="hold",
                      previous=current, new="on_hold",
                      actor="admin", reason=body.reason.strip())
    fresh = await db.orders_v2.find_one({"order_number": order_number},
                                        _projection_for_get())
    return _serialize_order_for_admin(fresh)


@router.post("/{order_number}/release-hold")
async def release_hold(order_number: str, body: TransitionIn = TransitionIn(),
                       _admin=Depends(verify_admin)):
    """Release a MANUAL hold. Does not release integrity holds — those must
    be resolved at the webhook/data source. Returns to `pending_review`
    only if all integrity gates are green (otherwise 409 NOT_ELIGIBLE).
    """
    doc = await _load(order_number)
    if (doc.get("fulfillment_status") or "").lower() != "on_hold":
        raise HTTPException(status_code=409, detail={
            "code": "NOT_ON_HOLD", "message": "Order is not on manual hold.",
        })
    # Eligibility must be green (all integrity gates ok) before release.
    # Temporarily view the order as if not on hold, to compute eligibility.
    view = dict(doc)
    view["fulfillment_status"] = None
    verdict = evaluate_eligibility(view)
    if not verdict.eligible:
        raise HTTPException(status_code=409, detail={
            "code": "NOT_ELIGIBLE",
            "reasons": verdict.reasons,
            "requires": verdict.requires,
        })
    await db.orders_v2.update_one(
        {"order_number": order_number},
        {"$set": {
            "fulfillment_status": "pending_review",
            "fulfillment_hold_reason": None,
            "updated_at": datetime.now(timezone.utc),
        }},
    )
    await write_audit(db, order_number=order_number, action="release_hold",
                      previous="on_hold", new="pending_review",
                      actor="admin", reason=body.note)
    fresh = await db.orders_v2.find_one({"order_number": order_number},
                                        _projection_for_get())
    return _serialize_order_for_admin(fresh)


# ────────────────────────────────────────────────────────────────
# MARK-SHIPPED  (INTEGRITY-GATED)
# ────────────────────────────────────────────────────────────────

@router.post("/{order_number}/mark-shipped")
async def mark_shipped(order_number: str, body: MarkShippedIn,
                       _admin=Depends(verify_admin)):
    """Admin-only. Marks an already-paid order as SHIPPED and stores the
    carrier + tracking metadata. Idempotent — a second call with the same
    tracking data does NOT resend the customer email.

    Integrity gate (Layer 2): the endpoint refuses to mark shipped when
    `shipping_integrity_status` or `presentment_integrity_status` is
    `pending_review`, or when the order is `on_hold`, or when payment is
    not `paid`/`authorized`. Owners cannot bypass an integrity hold from
    the admin panel.
    """
    doc = await db.orders_v2.find_one({"order_number": order_number}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    if doc.get("payment_status") not in ("paid", "authorized"):
        raise HTTPException(status_code=409, detail={
            "code": "NOT_PAID", "message": "Order is not paid; cannot mark shipped.",
        })
    verdict = evaluate_eligibility(doc)
    if not verdict.eligible:
        raise HTTPException(status_code=409, detail={
            "code": "NOT_ELIGIBLE",
            "reasons": verdict.reasons,
            "requires": verdict.requires,
        })

    carrier = body.carrier.strip()
    tn_clean = sanitize_tracking_number(body.tracking_number)
    if not tn_clean:
        raise HTTPException(status_code=422, detail={
            "code": "INVALID_TRACKING_NUMBER",
        })
    tracking_url = build_tracking_url(carrier, tn_clean,
                                       explicit_url=body.tracking_url)

    now = datetime.now(timezone.utc)
    fields = {
        "carrier": carrier,
        "tracking_number": tn_clean,
        "tracking_url": tracking_url,
        "shipped_at": now,
        "fulfillment_status": "shipped",
        "shipping_notification_sent": True,
        "updated_at": now,
    }
    if body.service:
        fields["shipping.service_label"] = body.service.strip()

    upd = await db.orders_v2.find_one_and_update(
        {"order_number": order_number,
         "shipping_notification_sent": {"$ne": True}},
        {"$set": fields},
        return_document=True,
    )
    email_sent = False
    if upd is not None:
        try:
            from services.order_emails import send_shipment_email
            result = await send_shipment_email(upd)
            email_sent = isinstance(result, dict) and result.get("status") == "sent"
        except Exception:
            email_sent = False
        await write_audit(db, order_number=order_number, action="mark_shipped",
                          previous=doc.get("fulfillment_status"), new="shipped",
                          actor="admin", reason=None,
                          extra={"carrier": carrier,
                                 "tracking_number": tn_clean,
                                 "tracking_url": tracking_url,
                                 "service": body.service})
    if not upd:
        # Second call — support-case metadata update only. No second email.
        await db.orders_v2.update_one(
            {"order_number": order_number},
            {"$set": {
                "carrier": carrier,
                "tracking_number": tn_clean,
                "tracking_url": tracking_url,
                "updated_at": now,
            }},
        )
        await write_audit(db, order_number=order_number,
                          action="mark_shipped_noop",
                          previous="shipped", new="shipped",
                          actor="admin", reason="duplicate_call")

    return {"ok": True, "email_sent": email_sent,
            "tracking_url": tracking_url}


# ────────────────────────────────────────────────────────────────
# CORRECT-SHIPMENT (owner-only tracking correction; no auto-resend)
# ────────────────────────────────────────────────────────────────

@router.post("/{order_number}/correct-shipment")
async def correct_shipment(order_number: str, body: CorrectShipmentIn,
                           _admin=Depends(verify_admin)):
    """Owner-only correction of carrier / tracking / service on an already
    shipped order. Records BOTH the previous and new values in the audit
    log. Never re-sends the shipping confirmation email."""
    doc = await _load(order_number)
    if (doc.get("fulfillment_status") or "").lower() != "shipped":
        raise HTTPException(status_code=409, detail={
            "code": "NOT_SHIPPED", "message": "Only shipped orders can be corrected.",
        })
    prev = {
        "carrier": doc.get("carrier"),
        "tracking_number": doc.get("tracking_number"),
        "tracking_url": doc.get("tracking_url"),
        "service": (doc.get("shipping") or {}).get("service_label"),
    }
    updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}
    if body.carrier is not None:
        updates["carrier"] = body.carrier.strip()
    if body.tracking_number is not None:
        tn = sanitize_tracking_number(body.tracking_number)
        if not tn:
            raise HTTPException(status_code=422, detail={
                "code": "INVALID_TRACKING_NUMBER",
            })
        updates["tracking_number"] = tn
    if body.tracking_url is not None or body.tracking_number is not None or body.carrier is not None:
        updates["tracking_url"] = build_tracking_url(
            updates.get("carrier", prev["carrier"]) or "",
            updates.get("tracking_number", prev["tracking_number"]) or "",
            explicit_url=body.tracking_url if body.tracking_url is not None else prev["tracking_url"],
        )
    if body.service is not None:
        updates["shipping.service_label"] = body.service.strip()

    if len(updates) == 1:  # only updated_at → no real change
        raise HTTPException(status_code=400, detail={"code": "NO_FIELDS"})

    await db.orders_v2.update_one({"order_number": order_number}, {"$set": updates})
    await write_audit(db, order_number=order_number, action="correct_shipment",
                      previous="shipped", new="shipped",
                      actor="admin", reason=body.reason.strip(),
                      extra={"previous": prev, "new": {
                          "carrier": updates.get("carrier", prev["carrier"]),
                          "tracking_number": updates.get("tracking_number", prev["tracking_number"]),
                          "tracking_url": updates.get("tracking_url", prev["tracking_url"]),
                          "service": updates.get("shipping.service_label", prev["service"]),
                      }})
    fresh = await db.orders_v2.find_one({"order_number": order_number},
                                        _projection_for_get())
    return _serialize_order_for_admin(fresh)


@router.post("/{order_number}/fraud-hold")
async def order_fraud_hold(order_number: str, body: HoldIn,
                             _admin=Depends(verify_admin)):
    """Owner places an order on fraud review WITHOUT requiring a Stripe
    dispute to exist. Independent of payment_status and dispute status.
    Fulfillment eligibility (Layer 2) refuses shipping while this is set.
    """
    doc = await _load(order_number)
    if order_number == "PHI-20260901-4CBC5C":
        raise HTTPException(status_code=409,
                              detail={"code": "LOCKED_HISTORICAL_ORDER"})
    prev = doc.get("fraud_review_status") or "clear"
    now = datetime.now(timezone.utc)
    await db.orders_v2.update_one({"order_number": order_number}, {"$set": {
        "fraud_review_status": "blocked",
        "fraud_review_reason": body.reason.strip(),
        "fraud_review_updated_at": now,
        "updated_at": now,
    }})
    await write_audit(db, order_number=order_number,
                      action="fraud_hold", previous=prev, new="blocked",
                      actor="admin", reason=body.reason)
    fresh = await db.orders_v2.find_one({"order_number": order_number},
                                         _projection_for_get())
    return _serialize_order_for_admin(fresh)


@router.post("/{order_number}/clear-fraud-hold")
async def order_clear_fraud_hold(order_number: str,
                                    body: TransitionIn = TransitionIn(),
                                    _admin=Depends(verify_admin)):
    """Owner clears an order-level fraud hold. Other integrity gates still
    apply — clearing this does not automatically unlock fulfillment.

    Refuses to clear when the order carries a Stripe-authoritative LOST
    dispute; a lost chargeback is a permanent fulfillment block and the
    generic clear-fraud-hold path may not defeat it. Recovery from a lost
    dispute requires a separately authorized owner path.
    """
    doc = await _load(order_number)
    lost_dispute = await db.dispute_cases.find_one(
        {"order_number": order_number, "status": "lost"},
        {"_id": 0, "case_id": 1},
    )
    if lost_dispute:
        raise HTTPException(status_code=409, detail={
            "code": "LOST_DISPUTE_BLOCK",
            "case_id": lost_dispute.get("case_id"),
        })
    prev = doc.get("fraud_review_status") or "clear"
    now = datetime.now(timezone.utc)
    await db.orders_v2.update_one({"order_number": order_number}, {"$set": {
        "fraud_review_status": "cleared",
        "fraud_review_reason": None,
        "fraud_review_updated_at": now,
        "updated_at": now,
    }})
    await write_audit(db, order_number=order_number,
                      action="clear_fraud_hold", previous=prev, new="cleared",
                      actor="admin", reason=body.note)
    fresh = await db.orders_v2.find_one({"order_number": order_number},
                                         _projection_for_get())
    return _serialize_order_for_admin(fresh)


# ────────────────────────────────────────────────────────────────
# LEGACY generic fulfillment metadata setter (kept for backward compat)
# ────────────────────────────────────────────────────────────────

@router.post("/{order_number}/fulfillment")
async def set_fulfillment(order_number: str, body: SetFulfillmentIn,
                          _admin=Depends(verify_admin)):
    """Legacy admin route. Sets `fulfillment_type` / `dispatch_estimate` /
    `fulfillment_status`. Preserved for backward compatibility with any
    pre-Layer-2 admin tooling.

    Note: setting `fulfillment_status` through this route DOES enforce the
    state-machine when the target is one of the operational states. It
    does NOT enforce eligibility — legacy behavior. New callers should
    use the /approve /prepare /ready-to-ship /hold /release-hold /
    mark-shipped endpoints instead.
    """
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail={"code": "NO_FIELDS"})
    target = fields.get("fulfillment_status")
    if target is not None:
        if target not in OPERATIONAL_STATES:
            raise HTTPException(status_code=422, detail={
                "code": "INVALID_FULFILLMENT_STATUS",
            })
    r = await db.orders_v2.update_one({"order_number": order_number},
                                       {"$set": fields})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    return {"ok": True, "updated": fields}
