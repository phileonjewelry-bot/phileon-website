"""
PHILEON — Resend transactional email helper (Phase 10).

Non-blocking wrapper around the Resend SDK. Delivery is fire-and-forget
from the caller's perspective: `send_email` returns a small dict describing
what happened so the caller can persist a `notificationStatus` alongside
the source-of-truth record. NEVER raises on failure — email is
notification, not the source of truth for Concierge inquiries.

Required env:
    RESEND_API_KEY                          # from https://resend.com
    PHILEON_FROM_EMAIL                      # default: onboarding@resend.dev (test)
    PHILEON_CONCIERGE_NOTIFICATION_EMAIL    # internal inbox for new inquiries

If RESEND_API_KEY is not set, `send_email` short-circuits and returns
`{"status": "skipped", "reason": "no_api_key"}`. That lets Concierge intake
work in a fresh environment without pretending emails were sent.
"""
import asyncio
import logging
import os

import resend

logger = logging.getLogger(__name__)

FROM_EMAIL = (os.environ.get("PHILEON_FROM_EMAIL") or "onboarding@resend.dev").strip()
INTERNAL_TO = (os.environ.get("PHILEON_CONCIERGE_NOTIFICATION_EMAIL") or "").strip()


def _configured() -> bool:
    return bool((os.environ.get("RESEND_API_KEY") or "").strip())


async def send_email(to: str, subject: str, html: str, text: str | None = None,
                     from_email: str | None = None) -> dict:
    """Send a transactional email. Never raises.

    `from_email` — if provided AND non-empty AND validates as an email
    address, overrides the module-level FROM_EMAIL. This lets behavioral
    marketing use a dedicated sender subdomain (reputation isolation)
    WITHOUT touching the transactional sender for order/shipment mails.
    Falls back to FROM_EMAIL when unset.

    Returns:
        {"status": "sent",    "id": "...",         "sentAt": iso}
        {"status": "skipped", "reason": "no_api_key" | "no_recipient"}
        {"status": "failed",  "error": "..."}
    """
    if not to:
        return {"status": "skipped", "reason": "no_recipient"}
    if not _configured():
        return {"status": "skipped", "reason": "no_api_key"}
    resend.api_key = os.environ["RESEND_API_KEY"]
    _from = FROM_EMAIL
    if from_email and isinstance(from_email, str):
        v = from_email.strip()
        # Very light validation. Any well-formed `local@host.tld` is accepted;
        # invalid values fall back to FROM_EMAIL so a misconfigured behavioral
        # sender can NEVER accidentally break transactional delivery.
        if "@" in v and "." in v.split("@", 1)[1]:
            _from = v
    params = {"from": _from, "to": [to], "subject": subject, "html": html}
    if text:
        params["text"] = text
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        return {"status": "sent", "id": (result or {}).get("id")}
    except Exception as e:
        logger.warning("Resend send failed: %s", e)
        return {"status": "failed", "error": str(e)[:200]}
