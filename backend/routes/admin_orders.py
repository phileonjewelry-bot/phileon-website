"""Admin-only order fulfillment mutations.

Uses the existing `verify_admin` JWT Bearer dependency defined in
`server.py`. Never trusts non-monetary/monetary client fields for pricing.
The only fields writable through these routes are fulfillment/tracking
metadata — canonical USD amounts, presentment, and payment_status are
untouchable here.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

router = APIRouter(prefix="/admin/orders", tags=["admin_orders"])


class MarkShippedIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    carrier: str = Field(min_length=1, max_length=80)
    tracking_number: str = Field(min_length=1, max_length=120)
    tracking_url: Optional[str] = Field(default=None, max_length=500)


class SetFulfillmentIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    fulfillment_type: Optional[str] = None  # READY_TO_SHIP|MADE_TO_ORDER|CUSTOM_INQUIRY
    dispatch_estimate: Optional[str] = None
    fulfillment_status: Optional[str] = None


def _get_db_and_verify():
    # Lazy imports avoid circulars — server.py defines verify_admin.
    from server import verify_admin, db  # noqa: F401
    return verify_admin, db


verify_admin, db = _get_db_and_verify()


@router.get("/{order_number}")
async def get_order(order_number: str, _admin=Depends(verify_admin)):
    """Admin-only order summary for the shipment UI. Returns only the
    non-secret fields the admin needs to see; never exposes plaintext
    status tokens, JWTs, Stripe keys, DB `_id`, or webhook payloads."""
    doc = await db.orders_v2.find_one({"order_number": order_number}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    shipping = doc.get("shipping") or {}
    shipped_at = doc.get("shipped_at")
    return {
        "order_number": doc["order_number"],
        "customer_email": doc.get("customer_email"),
        "payment_status": doc.get("payment_status"),
        "fulfillment_status": doc.get("fulfillment_status"),
        "fulfilment_status": doc.get("fulfilment_status"),
        "shipping_integrity_status": doc.get("shipping_integrity_status"),
        "shipping_notification_sent": bool(doc.get("shipping_notification_sent")),
        "shipping": {
            "country": shipping.get("country"),
            "service_label": shipping.get("service_label"),
            "carrier_label": shipping.get("carrier_label"),
            "recipient_name": shipping.get("recipient_name"),
        },
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
        "created_at": doc.get("created_at").isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at"),
    }


@router.post("/{order_number}/mark-shipped")
async def mark_shipped(order_number: str, body: MarkShippedIn,
                       _admin=Depends(verify_admin)):
    """Admin-only. Marks an already-paid order as SHIPPED and stores
    the carrier + tracking metadata. Idempotent — a second call with the
    same tracking_number is a no-op on the email flag."""
    doc = await db.orders_v2.find_one({"order_number": order_number}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    if doc.get("payment_status") not in ("paid", "authorized"):
        raise HTTPException(status_code=409, detail={
            "code": "NOT_PAID", "message": "Order is not paid; cannot mark shipped.",
        })
    now = datetime.now(timezone.utc)
    # Atomic transition: only send the email exactly once.
    upd = await db.orders_v2.find_one_and_update(
        {"order_number": order_number, "shipping_notification_sent": {"$ne": True}},
        {"$set": {
            "carrier": body.carrier.strip(),
            "tracking_number": body.tracking_number.strip(),
            "tracking_url": (body.tracking_url or "").strip() or None,
            "shipped_at": now,
            "fulfillment_status": "shipped",
            "shipping_notification_sent": True,
        }},
        return_document=True,
    )
    email_sent = False
    if upd is not None:
        # Only fire the shipment email when THIS request performed the
        # atomic paid→shipped transition. Never raises — a failed email
        # is a signal, not a shipment failure.
        try:
            from services.order_emails import send_shipment_email
            # `upd` is the post-update document — includes carrier + tracking.
            result = await send_shipment_email(upd)
            email_sent = isinstance(result, dict) and result.get("status") == "sent"
        except Exception:
            email_sent = False
    if not upd:
        # Second call — still update tracking data (support case) but do
        # NOT send another shipping email.
        await db.orders_v2.update_one(
            {"order_number": order_number},
            {"$set": {
                "carrier": body.carrier.strip(),
                "tracking_number": body.tracking_number.strip(),
                "tracking_url": (body.tracking_url or "").strip() or None,
            }},
        )
    return {"ok": True, "email_sent": email_sent}


@router.post("/{order_number}/fulfillment")
async def set_fulfillment(order_number: str, body: SetFulfillmentIn,
                          _admin=Depends(verify_admin)):
    """Admin-only. Sets fulfillment_type / dispatch_estimate /
    fulfillment_status. Never touches money."""
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail={"code": "NO_FIELDS"})
    r = await db.orders_v2.update_one({"order_number": order_number},
                                       {"$set": fields})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    return {"ok": True, "updated": fields}
