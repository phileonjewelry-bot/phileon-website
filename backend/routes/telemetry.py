"""PHILEON — Aggregate Telemetry public ingest + admin summary.

    POST /api/telemetry/aggregate     — public, strictly allow-listed
    GET  /api/admin/analytics/aggregate — owner-only summary
"""
from __future__ import annotations

import time
from collections import deque
from threading import Lock
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict, Field

from services import aggregate_telemetry as A


public_router = APIRouter(prefix="", tags=["telemetry_public"])
admin_router = APIRouter(prefix="/admin/analytics", tags=["telemetry_admin"])


def _get_deps():
    from server import verify_admin, db
    return verify_admin, db


verify_admin, db = _get_deps()


# ── In-memory rate limit — transient IP throttle, never persisted ──

_RL_WINDOW = 60.0
_RL_MAX = 240  # 4 events/sec per IP over a 60-second window
_rl_hits: dict = {}
_rl_lock = Lock()


def _rate_ok(ip: str) -> bool:
    now = time.monotonic()
    with _rl_lock:
        q = _rl_hits.get(ip)
        if q is None:
            q = deque()
            _rl_hits[ip] = q
        while q and (now - q[0]) > _RL_WINDOW:
            q.popleft()
        if len(q) >= _RL_MAX:
            return False
        q.append(now)
    return True


class AggregateIn(BaseModel):
    """Strict allow-list payload. `extra='forbid'` rejects any unknown
    field including client-supplied env / session_id / ip / etc."""
    model_config = ConfigDict(extra="forbid")
    event_type: str = Field(min_length=1, max_length=32)
    product_slug: Optional[str] = Field(default=None, max_length=200)
    # Coarse bucket only — client cannot ship a precise count.
    result_bucket: Optional[str] = Field(default=None, max_length=8)


@public_router.post("/telemetry/aggregate")
async def public_aggregate(body: AggregateIn, request: Request):
    # Transient in-memory rate limit keyed to remote address. Never
    # persisted anywhere — the IP does not enter the aggregate row.
    ip = (request.client.host if request.client else "unknown")[:64]
    if not _rate_ok(ip):
        raise HTTPException(status_code=429,
                            detail={"code": "RATE_LIMITED"})

    if body.event_type not in A.AGGREGATE_EVENT_TYPES:
        raise HTTPException(status_code=422,
                            detail={"code": "UNKNOWN_EVENT_TYPE"})

    # Product-slug validation — untrusted client string; we only
    # persist it if it matches the trusted catalog.
    slug = body.product_slug
    if slug:
        try:
            from services.pricing_engine_catalog import FIXED_PRODUCT_SLUGS
            if slug not in FIXED_PRODUCT_SLUGS:
                slug = None  # coerce to generic aggregate, safe fallback
        except Exception:
            slug = None

    try:
        result = await A.increment(
            db,
            event_type=body.event_type,
            product_slug=slug,
            result_bucket=body.result_bucket,
        )
    except ValueError:
        raise HTTPException(status_code=422,
                            detail={"code": "UNKNOWN_EVENT_TYPE"})
    return {"accepted": True, **result}


@admin_router.get("/aggregate")
async def admin_aggregate(period: str = Query(default="30d"),
                          env: Optional[str] = Query(default=None),
                          _: str = Depends(verify_admin)):
    days = {"today": 1, "7d": 7, "30d": 30, "90d": 90}.get(period, 30)
    from services.analytics_service import sanitize_env
    return await A.summarize(db, env=sanitize_env(env), days=days)
