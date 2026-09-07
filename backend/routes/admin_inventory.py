"""PHILEON Layer 5 — Admin inventory routes.

Owner-only endpoints for viewing and mutating physical inventory. All
mutations are audit-logged. No customer surfaces here.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from services import inventory_service as inv

try:
    from server import db, verify_admin  # type: ignore
except Exception:  # pragma: no cover
    db = None  # type: ignore
    async def verify_admin():  # type: ignore
        return "admin"


router = APIRouter(prefix="/admin/inventory", tags=["admin_inventory"])


class UpsertIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    # Canonical identity — either provide the resolved fields (server
    # recomputes the key) OR provide inventory_key directly for an existing
    # record.
    inventory_key: Optional[str] = None
    slug: Optional[str] = None
    variant: Optional[str] = None
    karat: Optional[str] = None
    metal_colour: Optional[str] = None
    ring_size: Optional[str] = None
    availability_mode: str = Field(pattern=r"^(made_to_order|ready_to_ship|unavailable)$")
    stock_on_hand: int = Field(0, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    owner_note: Optional[str] = None


class AdjustIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    delta: int
    reason: str = Field(min_length=1)
    related_order: Optional[str] = None


class MarkUnavailableIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    reason: Optional[str] = None


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return {}
    available = int(doc.get("stock_on_hand", 0)) - int(doc.get("stock_reserved", 0))
    slug = doc.get("product_slug")
    out = {
        "inventory_key": doc["inventory_key"],
        "product_slug": slug,
        "is_inspiration_vault": inv.is_inspiration_vault_slug(slug),
        "variant": doc.get("variant"),
        "karat": doc.get("karat"),
        "metal_colour": doc.get("metal_colour"),
        "ring_size": doc.get("ring_size"),
        "availability_mode": doc.get("availability_mode"),
        "manual_unavailable": bool(doc.get("manual_unavailable", False)),
        "stock_on_hand": int(doc.get("stock_on_hand", 0)),
        "stock_reserved": int(doc.get("stock_reserved", 0)),
        "available": max(0, available),
        "low_stock_threshold": doc.get("low_stock_threshold"),
        "owner_note": doc.get("owner_note"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }
    if out["availability_mode"] == inv.MODE_READY_TO_SHIP and not out["manual_unavailable"]:
        out["derived_state"] = "sold_out" if available <= 0 else "ready_to_ship"
    elif out["availability_mode"] == inv.MODE_UNAVAILABLE or out["manual_unavailable"]:
        out["derived_state"] = "unavailable"
    else:
        out["derived_state"] = "made_to_order"
    return out


@router.get("")
async def list_inventory(mode: Optional[str] = Query(None),
                          low_stock: bool = Query(False),
                          vault_only: bool = Query(False),
                          _admin=Depends(verify_admin)):
    q: Dict[str, Any] = {}
    if mode == "sold_out":
        q["availability_mode"] = inv.MODE_READY_TO_SHIP
        q["manual_unavailable"] = {"$ne": True}
    elif mode == "unavailable":
        q["$or"] = [{"availability_mode": inv.MODE_UNAVAILABLE},
                    {"manual_unavailable": True}]
    elif mode in inv.CANONICAL_MODES:
        q["availability_mode"] = mode
    if vault_only:
        q["product_slug"] = {"$in": sorted(inv._inspiration_vault_slugs())}
    cursor = db.inventory.find(q, {"_id": 0}).sort([("updated_at", -1)]).limit(500)
    items = [_serialize(d) async for d in cursor]
    if mode == "sold_out":
        items = [i for i in items if i["available"] <= 0]
    if low_stock:
        def _low(i):
            t = i.get("low_stock_threshold")
            return t is not None and i["available"] <= int(t)
        items = [i for i in items if _low(i)]
    return {"items": items, "count": len(items)}


@router.get("/vault-slugs")
async def vault_slugs(_admin=Depends(verify_admin)):
    """Authoritative Inspiration Vault slug list, derived from the
    fixed-price catalog. Used by the admin UI to show/hide the
    READY TO SHIP option per product."""
    slugs = sorted(inv._inspiration_vault_slugs())
    return {"slugs": slugs, "count": len(slugs)}


@router.post("/upsert")
async def upsert(body: UpsertIn, _admin=Depends(verify_admin)):
    # Resolve inventory_key: either provided explicitly, or computed
    # from the canonical fields.
    if body.inventory_key:
        # Owner can update mode/stock on an existing key — but must still
        # provide canonical fields on first create. Reject if we can't
        # resolve a canonical.
        prev = await inv.get_inventory(db, body.inventory_key)
        if not prev and not body.slug:
            raise HTTPException(status_code=400, detail={
                "code": "MISSING_CANONICAL",
                "message": "New inventory keys require slug/variant/karat/metal_colour/ring_size."
            })
        canonical = ({
            "slug": prev.get("product_slug"),
            "variant": prev.get("variant"),
            "karat": prev.get("karat"),
            "metal_colour": prev.get("metal_colour"),
            "ring_size": prev.get("ring_size"),
        } if prev else inv.canonical_identity({
            "product_id": body.slug, "variant": body.variant,
            "karat": body.karat, "metal_colour": body.metal_colour,
            "ring_size": body.ring_size,
        }))
        key = body.inventory_key
    else:
        if not body.slug:
            raise HTTPException(status_code=400, detail={"code": "MISSING_SLUG"})
        canonical = inv.canonical_identity({
            "product_id": body.slug, "variant": body.variant,
            "karat": body.karat, "metal_colour": body.metal_colour,
            "ring_size": body.ring_size,
        })
        key = inv.compute_inventory_key({
            "product_id": body.slug, "variant": body.variant,
            "karat": body.karat, "metal_colour": body.metal_colour,
            "ring_size": body.ring_size,
        })
    try:
        doc = await inv.upsert_inventory(
            db, inventory_key=key, canonical=canonical,
            mode=body.availability_mode, stock_on_hand=body.stock_on_hand,
            low_stock_threshold=body.low_stock_threshold,
            owner_note=body.owner_note, actor="admin",
        )
    except ValueError as e:
        msg = str(e)
        if msg.startswith("READY_TO_SHIP_RESTRICTED_TO_INSPIRATION_VAULT"):
            raise HTTPException(status_code=409, detail={
                "code": "READY_TO_SHIP_RESTRICTED_TO_INSPIRATION_VAULT",
                "slug": canonical.get("slug"),
                "message": "READY TO SHIP is reserved for The Inspiration Vault.",
            })
        raise HTTPException(status_code=409, detail={"code": "UPSERT_REJECTED",
                                                        "message": msg})
    return _serialize(doc)


@router.get("/{inventory_key}")
async def get_one(inventory_key: str, _admin=Depends(verify_admin)):
    doc = await inv.get_inventory(db, inventory_key)
    if not doc:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    return _serialize(doc)


@router.post("/{inventory_key}/adjust")
async def adjust(inventory_key: str, body: AdjustIn, _admin=Depends(verify_admin)):
    try:
        doc = await inv.adjust_stock(db, inventory_key=inventory_key,
                                        delta=body.delta, reason=body.reason,
                                        actor="admin",
                                        related_order=body.related_order)
    except ValueError as e:
        raise HTTPException(status_code=409, detail={"code": "ADJUSTMENT_REJECTED",
                                                        "message": str(e)})
    return _serialize(doc)


@router.post("/{inventory_key}/mark-unavailable")
async def mark_unavailable(inventory_key: str, body: MarkUnavailableIn = MarkUnavailableIn(),
                              _admin=Depends(verify_admin)):
    try:
        doc = await inv.set_manual_unavailable(db, inventory_key=inventory_key,
                                                    value=True, reason=body.reason,
                                                    actor="admin")
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"code": str(e)})
    return _serialize(doc)


@router.post("/{inventory_key}/re-enable")
async def re_enable(inventory_key: str, body: MarkUnavailableIn = MarkUnavailableIn(),
                       _admin=Depends(verify_admin)):
    try:
        doc = await inv.set_manual_unavailable(db, inventory_key=inventory_key,
                                                    value=False, reason=body.reason,
                                                    actor="admin")
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"code": str(e)})
    return _serialize(doc)


@router.get("/{inventory_key}/audit")
async def audit_log(inventory_key: str, _admin=Depends(verify_admin)):
    cursor = db.inventory_audit.find({"inventory_key": inventory_key},
                                        {"_id": 0}).sort("at", -1).limit(200)
    entries = [d async for d in cursor]
    return {"entries": entries}


@router.get("/reconcile/stale-reservations")
async def stale(_admin=Depends(verify_admin)):
    """READ-ONLY. Returns HELD reservations whose Stripe session should be
    expired according to local record. Owner must verify Stripe truth
    before releasing anything."""
    entries = await inv.stale_reservations(db)
    return {"entries": entries, "count": len(entries),
            "note": "Verify Stripe Session state before releasing. Layer 5 does not autonomously release stale reservations."}
