"""PHILEON — Public behavior + unsubscribe routes.

Locked invariants:
    * Client-supplied `email` is NEVER trusted from this endpoint.
    * Client-supplied `session_id` is a free-form anonymous marker only.
    * Rate limited via the existing global `_rl_check` helper.
    * Unsubscribe verification uses HMAC-signed tokens (JWT_SECRET).
"""
from __future__ import annotations
from fastapi import APIRouter, Request, Response, HTTPException, Query, status
from fastapi.responses import HTMLResponse

from models_retention import BehaviorEventCreate
from services import retention_service as R

from server import db, _rl_check  # rate-limit helper reused


router = APIRouter(prefix="/behavior", tags=["behavior"])


@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
async def ingest_event(body: BehaviorEventCreate, request: Request):
    """Public browser event endpoint. Anonymous by design.

    NOTE: email/identity is NEVER read from this request. Any identity
    binding must go through the server-trusted paths (auth/checkout/
    webhook). This keeps the public surface incapable of impersonating a
    known customer.
    """
    # Cheap throttle before DB writes (60 events / minute per IP).
    _rl_check("behavior-events", request, identity=None,
              max_attempts=60, window_secs=60)

    ev = await R.record_event(
        db,
        event_type=body.event_type,
        product_slug=body.product_slug,
        session_id=body.session_id,
        trusted_email=None,          # public endpoint — no trusted email
        source=body.source,
    )
    return {"accepted": True, "event_id": ev.id}


unsub_router = APIRouter(tags=["retention"])


_UNSUB_HTML_OK = """<!doctype html><html><head><meta charset="utf-8">
<title>PHILEON — Unsubscribed</title>
<meta name="robots" content="noindex,nofollow"></head>
<body style="background:#0a0a0c;color:#e8e0cf;font-family:Georgia,serif;
padding:64px 24px;text-align:center;">
<div style="max-width:560px;margin:0 auto;">
<p style="font-family:'Cinzel',serif;letter-spacing:.5em;font-size:11px;
color:#c8a24a;margin:0 0 24px;">PHILEON</p>
<h1 style="font-family:'Cinzel',serif;letter-spacing:.14em;font-size:22px;
color:#f4ecd6;margin:0 0 16px;">UNSUBSCRIBED.</h1>
<p style="font-family:'Playfair Display',Georgia,serif;font-style:italic;
color:#a89f89;margin:0 0 24px;">You will not receive further behavioral
marketing from PHILEON. Transactional messages related to any order or
consultation will continue where required.</p></div></body></html>"""

_UNSUB_HTML_BAD = """<!doctype html><html><head><meta charset="utf-8">
<title>PHILEON — Link expired</title>
<meta name="robots" content="noindex,nofollow"></head>
<body style="background:#0a0a0c;color:#e8e0cf;font-family:Georgia,serif;
padding:64px 24px;text-align:center;">
<div style="max-width:560px;margin:0 auto;">
<p style="font-family:'Cinzel',serif;letter-spacing:.5em;font-size:11px;
color:#c8a24a;margin:0 0 24px;">PHILEON</p>
<h1 style="font-family:'Cinzel',serif;letter-spacing:.14em;font-size:22px;
color:#f4ecd6;margin:0 0 16px;">UNABLE TO VERIFY LINK.</h1>
<p style="font-family:'Playfair Display',Georgia,serif;font-style:italic;
color:#a89f89;margin:0 0 24px;">Please contact our concierge team if you
would like to update your preferences.</p></div></body></html>"""


@unsub_router.get("/unsubscribe", response_class=HTMLResponse)
async def unsubscribe_page(token: str = Query(...)):
    email = R.verify_unsub_token(token)
    if not email:
        return HTMLResponse(_UNSUB_HTML_BAD, status_code=400)
    await R.unsubscribe(db, email, reason="self_service_link")
    return HTMLResponse(_UNSUB_HTML_OK, status_code=200)


# One-click POST variant compatible with modern email clients
# (List-Unsubscribe=One-Click header). Body/query token both accepted.
@unsub_router.post("/unsubscribe")
async def unsubscribe_post(request: Request):
    token = request.query_params.get("token", "")
    if not token:
        try:
            form = await request.form()
            token = form.get("token") or ""
        except Exception:
            token = ""
    email = R.verify_unsub_token(token)
    if not email:
        raise HTTPException(status_code=400, detail={"code": "INVALID_TOKEN"})
    await R.unsubscribe(db, email, reason="one_click")
    return {"ok": True}


# Newsletter opt-in — public but requires an explicit affirmative action.
@router.post("/newsletter/subscribe")
async def newsletter_subscribe(body: dict, request: Request):
    _rl_check("newsletter-subscribe", request, identity=None,
              max_attempts=10, window_secs=60)
    email = body.get("email") if isinstance(body, dict) else None
    normalized = R.normalize_email(email)
    if not normalized:
        raise HTTPException(status_code=400, detail={"code": "INVALID_EMAIL"})
    consent_source = "newsletter_signup"
    result = await R.grant_consent(db, normalized, consent_source)
    if result is None:
        raise HTTPException(status_code=400, detail={"code": "INVALID_EMAIL"})
    # If a session_id came with the submission, bind identity to it so
    # prior anonymous browsing on this session becomes eligible.
    session_id = body.get("session_id") if isinstance(body, dict) else None
    if isinstance(session_id, str) and 8 <= len(session_id) <= 128:
        await R.bind_identity(db, session_id, normalized, source="newsletter")
    return {"ok": True}
