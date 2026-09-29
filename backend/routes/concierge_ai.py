"""PHILEON — AI Concierge routes (v1, read-only).

Public:
    GET  /api/concierge/config       — { enabled }
    POST /api/concierge/message      — one turn (bounded)

Admin (owner-only):
    GET  /api/admin/concierge/status — diagnostic snapshot (no secrets, no PII)
"""
from __future__ import annotations

import os
import time
from collections import deque
from threading import Lock
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field

from services import phileon_concierge as C


public_router = APIRouter(prefix="/concierge", tags=["concierge_ai"])
admin_router = APIRouter(prefix="/admin/concierge", tags=["concierge_ai_admin"])


def _get_deps():
    from server import verify_admin
    return verify_admin


verify_admin = _get_deps()


# ── In-memory rate limit — per-IP, per-minute. Never persisted. ──

_RL_WINDOW = 60.0
_RL_MAX = 8  # 8 concierge turns / minute / IP
_hits: dict = {}
_lock = Lock()


def _rl_ok(ip: str) -> bool:
    now = time.monotonic()
    with _lock:
        q = _hits.get(ip)
        if q is None:
            q = deque(); _hits[ip] = q
        while q and (now - q[0]) > _RL_WINDOW:
            q.popleft()
        if len(q) >= _RL_MAX:
            return False
        q.append(now)
    return True


class HistoryTurn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: str = Field(min_length=1, max_length=16)
    content: str = Field(min_length=1, max_length=1500)


class ConciergeMessageIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    message: str = Field(min_length=1, max_length=1500)
    history: Optional[List[HistoryTurn]] = Field(default=None, max_length=16)


@public_router.get("/config")
async def public_config():
    """Frontend can read this to decide whether to render the launcher.
    Never exposes the API key value; only the feature-flag intent."""
    return {
        "enabled": C.is_flag_on() and C.is_enabled(),
        "flag_on": C.is_flag_on(),
    }


@public_router.get("/policy/{topic}")
async def public_policy(topic: str):
    """Public read of the CANONICAL PHILEON policy record. The concierge
    tool `get_phileon_policy` and this endpoint read from the SAME
    :mod:`services.phileon_policies` source — the site surface and the
    AI cannot drift apart."""
    from services.phileon_policies import get_policy
    try:
        return {"policy": get_policy(topic)}
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "UNKNOWN_POLICY_TOPIC"})


@public_router.post("/message")
async def public_message(body: ConciergeMessageIn, request: Request):
    if not C.is_flag_on():
        raise HTTPException(status_code=404, detail={"code": "CONCIERGE_DISABLED"})

    ip = (request.client.host if request.client else "unknown")[:64]
    if not _rl_ok(ip):
        raise HTTPException(status_code=429, detail={"code": "RATE_LIMITED"})

    history_payload = [t.model_dump() for t in (body.history or [])]
    result = await C.run_turn(message=body.message, history=history_payload)
    # We do NOT log the raw customer message. Only status / code / latency.
    return result


@admin_router.get("/status")
async def admin_status(_: str = Depends(verify_admin)):
    stats = C.STATS.snapshot()
    return {
        "enabled": C.is_enabled(),
        "flag_on": C.is_flag_on(),
        "environment": os.environ.get("PHILEON_ENV", "preview"),
        "configured_model": C.current_model(),
        "api_key_present": bool((os.environ.get("OPENAI_API_KEY") or "").strip()),
        **stats,
    }
