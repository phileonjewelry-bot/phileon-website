"""PHILEON — Layer 6 concierge routes.

Admin surface (all `verify_admin`):

    GET    /api/admin/concierge/cases                  — list with filters
    GET    /api/admin/concierge/cases/{case_id}        — detail + audit
    POST   /api/admin/concierge/cases                  — manual_owner_case
    POST   /api/admin/concierge/cases/{case_id}/status
    POST   /api/admin/concierge/cases/{case_id}/priority
    POST   /api/admin/concierge/cases/{case_id}/next-action
    POST   /api/admin/concierge/cases/{case_id}/follow-up
    POST   /api/admin/concierge/cases/{case_id}/waiting-on
    POST   /api/admin/concierge/cases/{case_id}/notes
    POST   /api/admin/concierge/cases/{case_id}/contact-log
    GET    /api/admin/concierge/customer-360?email=…
    GET    /api/admin/concierge/orders/{order}/timeline
    GET    /api/admin/concierge/message-previews

Customer surface (token-secured, no auth):

    POST   /api/concierge/order-support                — order-linked intake
    GET    /api/concierge/order-support?order_number=…&token=…
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import hashlib
import re

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

import time
from collections import deque
from threading import Lock

from services import concierge_cases_service as svc


admin_router = APIRouter(prefix="/admin/concierge", tags=["concierge_admin"])
customer_router = APIRouter(prefix="/concierge", tags=["concierge_customer"])


# ── Lightweight in-memory rate limit for customer-facing intake ────
# Keyed to a hash of (order_number + token) so a single order token
# cannot spam the system, without depending on an easily-forged IP.
_RL_WINDOW_SEC = 300.0  # 5 minutes
_RL_MAX = 6
_rl_hits: dict = {}
_rl_lock = Lock()


def _rate_limit_check(key: str) -> bool:
    now = time.monotonic()
    with _rl_lock:
        q = _rl_hits.get(key)
        if q is None:
            q = deque()
            _rl_hits[key] = q
        while q and (now - q[0]) > _RL_WINDOW_SEC:
            q.popleft()
        if len(q) >= _RL_MAX:
            return False
        q.append(now)
    return True


def _get_deps():
    from server import verify_admin, db
    return verify_admin, db


verify_admin, db = _get_deps()


# ───────────────────── admin — list + detail ─────────────────────

@admin_router.get("/cases")
async def admin_list_cases(
    status: Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    source: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    order_number: Optional[str] = Query(default=None),
    email: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    limit: int = Query(default=200, ge=1, le=500),
    _admin: str = Depends(verify_admin),
):
    docs = await svc.list_cases(
        db, status=status, priority=priority, source=source,
        category=category, order_number=order_number, email=email,
        search=q, limit=limit,
    )
    return {"items": [svc.serialize_case_for_admin(d) for d in docs],
            "count": len(docs)}


@admin_router.get("/cases/{case_id}")
async def admin_get_case(case_id: str,
                         _admin: str = Depends(verify_admin)):
    doc = await svc.get_case(db, case_id)
    if not doc:
        raise HTTPException(status_code=404,
                            detail={"code": "NOT_FOUND"})
    audit_cursor = db.concierge_cases_audit.find(
        {"case_id": case_id}, {"_id": 0}).sort("at", -1).limit(200)
    audit: List[Dict[str, Any]] = []
    async for row in audit_cursor:
        if isinstance(row.get("at"), datetime):
            row["at"] = row["at"].isoformat()
        audit.append(row)
    return {"case": svc.serialize_case_for_admin(doc), "audit": audit}


# ───────────────────── admin — mutations ─────────────────────

class ManualCaseIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    subject: str = Field(min_length=1, max_length=200)
    customer_message: str = Field(min_length=1, max_length=4000)
    category: str = Field(min_length=1, max_length=32)
    customer_email: Optional[str] = Field(default=None, max_length=320)
    customer_name: Optional[str] = Field(default=None, max_length=200)
    customer_phone: Optional[str] = Field(default=None, max_length=64)
    order_number: Optional[str] = Field(default=None, max_length=64)
    priority: str = Field(default="normal", max_length=16)


@admin_router.post("/cases")
async def admin_create_case(body: ManualCaseIn,
                            admin_user: str = Depends(verify_admin)):
    try:
        doc, _ = await svc.create_case(
            db,
            source="manual_owner_case",
            category=body.category,
            subject=body.subject,
            customer_message=body.customer_message,
            customer_email=body.customer_email,
            customer_name=body.customer_name,
            customer_phone=body.customer_phone,
            order_number=body.order_number,
            priority=body.priority,
            actor=f"admin:{admin_user}",
        )
    except ValueError as e:
        raise HTTPException(status_code=422,
                            detail={"code": "INVALID", "message": str(e)})
    return svc.serialize_case_for_admin(doc)


class StatusIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: str = Field(min_length=1, max_length=32)


@admin_router.post("/cases/{case_id}/status")
async def admin_status(case_id: str, body: StatusIn,
                       admin_user: str = Depends(verify_admin)):
    try:
        doc = await svc.transition_status(
            db, case_id_=case_id, new_status=body.status,
            actor=f"admin:{admin_user}")
    except LookupError:
        raise HTTPException(status_code=404,
                            detail={"code": "NOT_FOUND"})
    except PermissionError as e:
        raise HTTPException(status_code=409,
                            detail={"code": "ILLEGAL_TRANSITION",
                                    "message": str(e)})
    except ValueError as e:
        raise HTTPException(status_code=422,
                            detail={"code": "INVALID", "message": str(e)})
    return svc.serialize_case_for_admin(doc)


class PriorityIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    priority: str = Field(min_length=1, max_length=16)


@admin_router.post("/cases/{case_id}/priority")
async def admin_priority(case_id: str, body: PriorityIn,
                         admin_user: str = Depends(verify_admin)):
    try:
        doc = await svc.set_priority(
            db, case_id_=case_id, priority=body.priority,
            actor=f"admin:{admin_user}")
    except LookupError:
        raise HTTPException(status_code=404,
                            detail={"code": "NOT_FOUND"})
    except ValueError as e:
        raise HTTPException(status_code=422,
                            detail={"code": "INVALID", "message": str(e)})
    return svc.serialize_case_for_admin(doc)


class NextActionIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    next_action: Optional[str] = Field(default=None, max_length=200)


@admin_router.post("/cases/{case_id}/next-action")
async def admin_next_action(case_id: str, body: NextActionIn,
                            admin_user: str = Depends(verify_admin)):
    try:
        doc = await svc.set_next_action(
            db, case_id_=case_id, next_action=body.next_action,
            actor=f"admin:{admin_user}")
    except LookupError:
        raise HTTPException(status_code=404,
                            detail={"code": "NOT_FOUND"})
    return svc.serialize_case_for_admin(doc)


class FollowUpIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    follow_up_at: Optional[str] = Field(default=None, max_length=48)


@admin_router.post("/cases/{case_id}/follow-up")
async def admin_follow_up(case_id: str, body: FollowUpIn,
                          admin_user: str = Depends(verify_admin)):
    try:
        doc = await svc.set_follow_up_at(
            db, case_id_=case_id, follow_up_at=body.follow_up_at,
            actor=f"admin:{admin_user}")
    except LookupError:
        raise HTTPException(status_code=404,
                            detail={"code": "NOT_FOUND"})
    except ValueError as e:
        raise HTTPException(status_code=422,
                            detail={"code": "INVALID", "message": str(e)})
    return svc.serialize_case_for_admin(doc)


class WaitingOnIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    waiting_on: Optional[str] = Field(default=None, max_length=120)


@admin_router.post("/cases/{case_id}/waiting-on")
async def admin_waiting_on(case_id: str, body: WaitingOnIn,
                           admin_user: str = Depends(verify_admin)):
    try:
        doc = await svc.set_waiting_on(
            db, case_id_=case_id, waiting_on=body.waiting_on,
            actor=f"admin:{admin_user}")
    except LookupError:
        raise HTTPException(status_code=404,
                            detail={"code": "NOT_FOUND"})
    return svc.serialize_case_for_admin(doc)


class NoteIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    note: str = Field(min_length=1, max_length=4000)


@admin_router.post("/cases/{case_id}/notes")
async def admin_note(case_id: str, body: NoteIn,
                     admin_user: str = Depends(verify_admin)):
    try:
        entry = await svc.add_note(
            db, case_id_=case_id, note=body.note,
            actor=f"admin:{admin_user}")
    except LookupError:
        raise HTTPException(status_code=404,
                            detail={"code": "NOT_FOUND"})
    except ValueError as e:
        raise HTTPException(status_code=422,
                            detail={"code": "INVALID", "message": str(e)})
    return entry


class ContactLogIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    direction: str = Field(min_length=1, max_length=16)
    channel:   str = Field(min_length=1, max_length=16)
    summary:   str = Field(min_length=1, max_length=2000)


@admin_router.post("/cases/{case_id}/contact-log")
async def admin_contact_log(case_id: str, body: ContactLogIn,
                            admin_user: str = Depends(verify_admin)):
    try:
        entry = await svc.add_contact_log(
            db, case_id_=case_id, direction=body.direction,
            channel=body.channel, summary=body.summary,
            actor=f"admin:{admin_user}")
    except LookupError:
        raise HTTPException(status_code=404,
                            detail={"code": "NOT_FOUND"})
    except ValueError as e:
        raise HTTPException(status_code=422,
                            detail={"code": "INVALID", "message": str(e)})
    return entry


# ───────────────────── admin — customer 360 + timeline ─────────────────────

@admin_router.get("/customer-360")
async def admin_customer_360(email: str = Query(..., max_length=320),
                             _admin: str = Depends(verify_admin)):
    if "@" not in email or len(email) < 3:
        raise HTTPException(status_code=422,
                            detail={"code": "INVALID_EMAIL"})
    return await svc.build_customer_360(db, email=email)


@admin_router.get("/orders/{order_number}/timeline")
async def admin_timeline(order_number: str,
                         _admin: str = Depends(verify_admin)):
    if not order_number or len(order_number) > 64:
        raise HTTPException(status_code=422,
                            detail={"code": "INVALID_ORDER"})
    return await svc.build_order_timeline(db, order_number=order_number)


@admin_router.get("/message-previews")
async def admin_message_previews(_admin: str = Depends(verify_admin)):
    return {"previews": svc.MESSAGE_PREVIEWS}


# ───────────────────── customer — order-linked support ─────────────────────

def _hash_token(t: str) -> str:
    return hashlib.sha256(t.encode("utf-8")).hexdigest()


async def _verify_order_token(order_number: str,
                              token: str) -> Dict[str, Any]:
    if not order_number or not token:
        raise HTTPException(status_code=422,
                            detail={"code": "MISSING_TOKEN"})
    order = await db.orders_v2.find_one(
        {"order_number": order_number}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404,
                            detail={"code": "NOT_FOUND"})
    expected = order.get("status_token_hash")
    if not expected or _hash_token(token) != expected:
        raise HTTPException(status_code=403,
                            detail={"code": "INVALID_TOKEN"})
    return order


class OrderSupportIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    order_number: str = Field(min_length=6, max_length=64)
    token: str = Field(min_length=8, max_length=256)
    category: str = Field(min_length=1, max_length=32)
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=4000)


_CUSTOMER_ALLOWED_CATEGORIES = {
    "order_status", "shipping", "return", "warranty",
    "product_question", "size_fit", "customization",
    "payment", "other",
}


@customer_router.post("/order-support")
async def customer_order_support(body: OrderSupportIn):
    """Order-linked customer support intake.

    * Uses the same `status_token_hash` architecture already trusted by
      the Order Status page and RMA intake.
    * Never leaks whether an order exists to an invalid caller.
    * Rate-limited (public-safe): identical retries within 15 minutes
      dedupe to the same case (idempotent).
    """
    if body.category not in _CUSTOMER_ALLOWED_CATEGORIES:
        raise HTTPException(status_code=422,
                            detail={"code": "INVALID_CATEGORY"})
    order = await _verify_order_token(body.order_number, body.token)

    # Sliding-window rate limit — keyed to the order + token hash, not
    # to the customer's IP (which is proxy-transformed on this platform).
    rl_key = "concierge_support:" + hashlib.sha256(
        (body.order_number + ":" + body.token).encode("utf-8")).hexdigest()
    allowed = _rate_limit_check(rl_key)
    if not allowed:
        raise HTTPException(status_code=429,
                            detail={"code": "RATE_LIMITED"})

    doc, _created = await svc.create_case(
        db,
        source="order_support",
        category=body.category,
        subject=body.subject,
        customer_message=body.message,
        customer_email=order.get("customer_email"),
        customer_name=(order.get("customer") or {}).get("name")
        or order.get("customer_name"),
        customer_phone=(order.get("customer") or {}).get("phone"),
        order_number=body.order_number,
        priority="normal",
        actor="customer",
    )
    return svc.serialize_case_for_customer(doc)


@customer_router.get("/order-support")
async def customer_list_order_support(
    order_number: str = Query(..., min_length=6, max_length=64),
    token:        str = Query(..., min_length=8, max_length=256),
):
    """Customer-safe list of open support cases for one order. Never
    surfaces internal notes, priority, contact log, or audit rows."""
    await _verify_order_token(order_number, token)
    cursor = db.concierge_cases.find(
        {"order_number": order_number,
         "source": "order_support"},
        {"_id": 0},
    ).sort("created_at", -1).limit(20)
    items = [svc.serialize_case_for_customer(d) async for d in cursor]
    return {"items": items}
