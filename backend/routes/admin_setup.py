"""PHILEON — first-time admin setup routes (`/api/admin/setup/*`). PREVIEW ONLY, owner-token gated.

Body is parsed manually (no Pydantic constraints) so validation errors can
NEVER echo the submitted token or password back in a 422 payload.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from services import admin_setup as S
from services.rate_limit import check_and_bump as _rl_check

log = logging.getLogger("phileon.admin_setup")

router = APIRouter(prefix="/admin/setup", tags=["admin-setup"])


def _deps():
    from server import db
    return db


db = _deps()


@router.get("/status")
async def status(request: Request):
    _rl_check("admin-setup-status", request, identity=None, max_attempts=60, window_secs=60)
    return await S.setup_state(db)


@router.post("/complete")
async def complete(request: Request):
    # 5 attempts / 15 min per client — token guessing is throttled before any compare.
    _rl_check("admin-setup", request, identity=None, max_attempts=5, window_secs=15 * 60)
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="INVALID_BODY")
    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="INVALID_BODY")
    fields = {k: body.get(k) for k in ("setup_token", "username", "password", "password_confirm")}
    if not all(isinstance(v, str) for v in fields.values()):
        raise HTTPException(status_code=400, detail="MISSING_FIELDS")
    code, payload = await S.complete_setup(db, setup_token=fields["setup_token"], username=fields["username"].strip(),
                                           password=fields["password"], confirm=fields["password_confirm"])
    if code == 201:
        log.info("admin first-time setup completed (username redacted)")
    return JSONResponse(status_code=code, content=payload)
