"""PHILEON — Admin retention (Simulation Phase).

Endpoints:
    GET  /api/admin/retention/pending
    POST /api/admin/retention/tick
    GET  /api/admin/retention/preview/{pending_id}
    GET  /api/admin/retention/send-log
    POST /api/admin/retention/consent   (owner tooling — grant/revoke)

All endpoints require the existing `verify_admin` JWT.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional, List, Dict

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from server import db, verify_admin
from services import retention_service as R
from services.retention_emails import build_email


router = APIRouter(prefix="/admin/retention", tags=["admin-retention"])


def _redact_pending(row: Dict) -> Dict:
    # Never leak internal DB `_id` or session bindings.
    return {
        "id": row.get("id"),
        "customer_email": row.get("customer_email"),
        "product_slug": row.get("product_slug"),
        "intent_kind": row.get("intent_kind"),
        "intent_level": row.get("intent_level"),
        "status": row.get("status"),
        "first_seen_at": row.get("first_seen_at"),
        "last_event_at": row.get("last_event_at"),
        "earliest_send_at": row.get("earliest_send_at"),
        "sent_at": row.get("sent_at"),
        "cancelled_at": row.get("cancelled_at"),
        "cancelled_reason": row.get("cancelled_reason"),
        "simulation_only": row.get("simulation_only", True),
    }


@router.get("/pending")
async def list_pending(
    status: str = Query("pending", pattern="^(pending|cancelled|sent|suppressed|expired|all)$"),
    limit: int = Query(100, ge=1, le=500),
    _admin=Depends(verify_admin),
):
    q: Dict = {} if status == "all" else {"status": status}
    rows = await db.retention_pending.find(q, {"_id": 0}) \
        .sort("earliest_send_at", 1).to_list(limit)
    return {"items": [_redact_pending(r) for r in rows]}


class TickIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    now: Optional[datetime] = None


async def _product_lookup_factory():
    """Return a sync callable `slug -> {name,image_url,display_price}`
    from the trusted product catalog (never fabricates)."""
    products = await db.products.find(
        {"is_visible": True},
        {"_id": 0, "slug": 1, "name": 1, "images": 1, "price_range": 1},
    ).to_list(500)
    idx = {p.get("slug"): p for p in products if p.get("slug")}

    def lookup(slug: str):
        p = idx.get(slug)
        if not p:
            return None
        imgs = p.get("images") or []
        return {
            "name": p.get("name"),
            "image_url": imgs[0] if imgs else "",
            "display_price": p.get("price_range") or "",
        }
    return lookup


@router.post("/tick")
async def run_tick(body: TickIn = None, _admin=Depends(verify_admin)):
    now = (body.now if (body and body.now) else datetime.now(timezone.utc))
    lookup = await _product_lookup_factory()
    return await R.tick(db, now=now, product_lookup=lookup)


@router.get("/preview/{pending_id}")
async def preview_pending(pending_id: str, _admin=Depends(verify_admin)):
    row = await db.retention_pending.find_one({"id": pending_id}, {"_id": 0})
    if not row:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    lookup = await _product_lookup_factory()
    product = lookup(row["product_slug"])
    preview = build_email(
        row["intent_kind"],
        email=row["customer_email"],
        product_slug=row["product_slug"],
        product=product,
    )
    return {
        "pending": _redact_pending(row),
        "preview": preview,
        "product_resolved": bool(product),
        "live_mode": bool(R.get_config()["live"]),
    }


@router.get("/send-log")
async def send_log(limit: int = Query(50, ge=1, le=500),
                   _admin=Depends(verify_admin)):
    rows = await db.behavior_send_log.find({}, {"_id": 0}) \
        .sort("created_at", -1).to_list(limit)
    return {"items": rows}


class ConsentIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str
    action: str = Field(pattern="^(grant|revoke)$")
    source: Optional[str] = None


@router.post("/consent")
async def admin_consent(body: ConsentIn, _admin=Depends(verify_admin)):
    """Admin-only override for consent state (auditing customer inquiries).
    Prefer newsletter/checkout opt-in paths in normal operation."""
    if body.action == "grant":
        result = await R.grant_consent(
            db, body.email, body.source or "admin_grant",
        )
        if result is None:
            raise HTTPException(status_code=400, detail={"code": "INVALID_EMAIL"})
        return {"ok": True, "email": result["email"]}
    result = await R.unsubscribe(db, body.email, reason="admin_revoke")
    if not result.get("ok"):
        raise HTTPException(status_code=400, detail={"code": "INVALID_EMAIL"})
    return {"ok": True, "email": result["email"]}
