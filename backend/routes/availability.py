"""PHILEON Layer 5 — Customer availability (read-only).

Public endpoint used by PDPs and CartDrawer. Returns only the safe
availability state — never exposes stock counts, reservation IDs,
session IDs, or admin notes.
"""
from __future__ import annotations
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict

from services import inventory_service as inv

try:
    from server import db  # type: ignore
except Exception:
    db = None  # type: ignore


router = APIRouter(prefix="/availability", tags=["availability"])


class AvailabilityQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")
    slug: str
    variant: Optional[str] = None
    karat: Optional[str] = None
    metal_colour: Optional[str] = None
    ring_size: Optional[str] = None


@router.post("/resolve")
async def resolve(body: AvailabilityQuery):
    payload = await inv.resolve_availability(db, {
        "product_id": body.slug,
        "variant": body.variant,
        "karat": body.karat,
        "metal_colour": body.metal_colour,
        "ring_size": body.ring_size,
    })
    # Never expose internal counts. Vault membership is public
    # metadata (it's already visible in the URL / catalog); the
    # customer boolean lets the PDP show restrained copy.
    return {
        "slug": body.slug,
        "state": payload["state"],
        "available": payload["available"],
        "mode": payload["mode"],
        "is_inspiration_vault": inv.is_inspiration_vault_slug(body.slug),
    }
