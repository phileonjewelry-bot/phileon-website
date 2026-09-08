"""PHILEON — Layer 7 admin analytics + public search intake.

Owner-only surface (all `verify_admin`):

    GET  /api/admin/analytics/overview
    GET  /api/admin/analytics/funnel
    GET  /api/admin/analytics/products
    GET  /api/admin/analytics/currencies
    GET  /api/admin/analytics/lifecycle
    GET  /api/admin/analytics/operations
    GET  /api/admin/analytics/search
    GET  /api/admin/analytics/kpi-definitions

Public search intake (no auth, rate-limited):

    POST /api/search-events

Environment authority: the server stamps ``env`` from ``PHILEON_ENV``.
Admin may pass ``?env=production|preview|test`` to switch views but
the current server env is the default (see spec §2).
"""
from __future__ import annotations

import time
from collections import deque
from threading import Lock
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from services import analytics_service as A


admin_router = APIRouter(prefix="/admin/analytics", tags=["analytics_admin"])
public_router = APIRouter(prefix="", tags=["analytics_public"])


def _get_deps():
    from server import verify_admin, db
    return verify_admin, db


verify_admin, db = _get_deps()


# ─── Overview / Funnel / Products / Currencies / Lifecycle / Ops ───

@admin_router.get("/overview")
async def overview(period: str = Query(default="30d"),
                   env: Optional[str] = Query(default=None),
                   _: str = Depends(verify_admin)):
    return await A.build_overview(db,
                                  env=A.sanitize_env(env),
                                  period=period)


@admin_router.get("/funnel")
async def funnel(period: str = Query(default="30d"),
                 env: Optional[str] = Query(default=None),
                 _: str = Depends(verify_admin)):
    return await A.build_funnel(db,
                                env=A.sanitize_env(env),
                                period=period)


@admin_router.get("/products")
async def products(period: str = Query(default="30d"),
                   env: Optional[str] = Query(default=None),
                   limit: int = Query(default=50, ge=1, le=200),
                   _: str = Depends(verify_admin)):
    return await A.build_products(db,
                                  env=A.sanitize_env(env),
                                  period=period,
                                  limit=limit)


@admin_router.get("/currencies")
async def currencies(period: str = Query(default="30d"),
                     env: Optional[str] = Query(default=None),
                     _: str = Depends(verify_admin)):
    return await A.build_currencies(db,
                                    env=A.sanitize_env(env),
                                    period=period)


@admin_router.get("/lifecycle")
async def lifecycle(period: str = Query(default="30d"),
                    env: Optional[str] = Query(default=None),
                    _: str = Depends(verify_admin)):
    return await A.build_lifecycle(db,
                                   env=A.sanitize_env(env),
                                   period=period)


@admin_router.get("/operations")
async def operations(period: str = Query(default="30d"),
                     env: Optional[str] = Query(default=None),
                     _: str = Depends(verify_admin)):
    return await A.build_operations(db,
                                    env=A.sanitize_env(env),
                                    period=period)


@admin_router.get("/search")
async def search(period: str = Query(default="30d"),
                 env: Optional[str] = Query(default=None),
                 limit: int = Query(default=25, ge=1, le=100),
                 _: str = Depends(verify_admin)):
    return await A.top_searches(db,
                                env=A.sanitize_env(env),
                                period=period,
                                limit=limit)


@admin_router.get("/kpi-definitions")
async def kpi_definitions(_: str = Depends(verify_admin)):
    return {"definitions": A.KPI_DEFINITIONS,
            "server_env": A.current_env()}


# ─── Public search intake — rate-limited, sanitized ─────────────────

_RL_WINDOW = 60.0
_RL_MAX = 60
_rl_hits: dict = {}
_rl_lock = Lock()


def _rate_ok(session_id: str) -> bool:
    now = time.monotonic()
    with _rl_lock:
        q = _rl_hits.get(session_id)
        if q is None:
            q = deque()
            _rl_hits[session_id] = q
        while q and (now - q[0]) > _RL_WINDOW:
            q.popleft()
        if len(q) >= _RL_MAX:
            return False
        q.append(now)
    return True


class SearchEventIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(min_length=1, max_length=200)
    result_count: int = Field(ge=0, le=100000)
    session_id: str = Field(min_length=8, max_length=128)


@public_router.post("/search-events")
async def public_search_event(body: SearchEventIn):
    """First-party search event. Sanitizes and caps the query; never
    persists IP / user-agent / fingerprint. Env is server-stamped —
    the client cannot claim `env=production` from Preview."""
    if not _rate_ok(body.session_id):
        raise HTTPException(status_code=429,
                            detail={"code": "RATE_LIMITED"})
    result = await A.record_search(
        db,
        query=body.query,
        result_count=body.result_count,
        session_id=body.session_id,
    )
    return {"accepted": True, **result}
