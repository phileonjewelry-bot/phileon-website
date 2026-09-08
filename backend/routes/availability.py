"""PHILEON Layer 5 — Customer availability (read-only).

Public endpoint used by PDPs and CartDrawer. Returns only the safe
availability state — never exposes stock counts, reservation IDs,
session IDs, or admin notes.
"""
from __future__ import annotations
import os
import time
from collections import deque
from threading import Lock
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict

from services import inventory_service as inv

try:
    from server import db  # type: ignore
except Exception:
    db = None  # type: ignore


router = APIRouter(prefix="/availability", tags=["availability"])


# ── Lightweight in-memory rate limit ────────────────────────────────
#
# 60 requests per minute per IP is comfortably above normal PDP
# browsing (a customer flipping through variants, sizes, and a few
# Vault pieces stays well under 20/min). It cheaply defeats
# enumeration/scrape attempts without adding an external dependency
# or requiring authentication.
_RL_WINDOW_SEC = 60.0
_RL_MAX = int(os.environ.get("PHILEON_AVAILABILITY_RL_PER_MIN") or 60)
_rl_hits: dict = {}
_rl_lock = Lock()


def _rate_limit_check(client_ip: str) -> bool:
    now = time.monotonic()
    with _rl_lock:
        q = _rl_hits.get(client_ip)
        if q is None:
            q = deque()
            _rl_hits[client_ip] = q
        # drop older entries
        while q and (now - q[0]) > _RL_WINDOW_SEC:
            q.popleft()
        if len(q) >= _RL_MAX:
            return False
        q.append(now)
    return True


class AvailabilityQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")
    slug: str
    variant: Optional[str] = None
    karat: Optional[str] = None
    metal_colour: Optional[str] = None
    ring_size: Optional[str] = None


@router.post("/resolve")
async def resolve(body: AvailabilityQuery, request: Request):
    # Lightweight abuse throttle — see module docstring.
    client_ip = (request.headers.get("x-forwarded-for") or
                    request.client.host if request.client else "unknown").split(",")[0].strip()
    if not _rate_limit_check(client_ip):
        raise HTTPException(status_code=429, detail={
            "code": "RATE_LIMITED",
            "message": "Too many availability requests. Please slow down.",
        })
    payload = await inv.resolve_availability(db, {
        "product_id": body.slug,
        "variant": body.variant,
        "karat": body.karat,
        "metal_colour": body.metal_colour,
        "ring_size": body.ring_size,
    })
    # Never expose internal counts. Vault membership + canonical slug
    # are public (already visible via URL / catalog) and help the PDP
    # render restrained copy — but stock_on_hand, stock_reserved,
    # reservation_id, session_id, and owner notes are ALWAYS stripped.
    return {
        "slug": body.slug,
        "canonical_slug": inv.resolve_canonical_slug(body.slug),
        "state": payload["state"],
        "available": payload["available"],
        "mode": payload["mode"],
        "is_inspiration_vault": payload["is_inspiration_vault"],
    }
