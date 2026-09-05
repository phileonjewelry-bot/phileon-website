"""PHILEON — Behavioral retention service (Simulation Phase).

Locked invariants:
  * `PHILEON_BEHAVIORAL_LIVE=false` (default) → NEVER sends real customer
    emails. All sends are recorded as `mode="simulated"` in the send log.
  * Transactional emails (order confirmation, shipment, admin, security)
    do NOT flow through this service.
  * Anonymous events never trigger email. Email is only associated with a
    session through server-trusted paths, not client-declared.

Public API used by routes:
    record_event(...)             — ingest a behavior event (anonymous or trusted)
    bind_identity(session_id, email, source)
                                   — associate a known email with anonymous events
    record_order_paid(email, product_slugs)
                                   — cancels pending abandonment for those products
    tick(now)                     — evaluate pending queue, generate previews
    is_marketing_eligible(email)  — consent + suppression + validity check
    grant_consent(email, source)  — record affirmative opt-in
    unsubscribe(email, reason)    — suppress + write consent row
    verify_unsub_token(token)     — HMAC-signed unsubscribe verification
"""
from __future__ import annotations
import hmac
import hashlib
import os
import re
import time
from base64 import urlsafe_b64encode, urlsafe_b64decode
from datetime import datetime, timedelta, timezone
from typing import Dict, Iterable, List, Optional, Tuple

from models_retention import (
    BehaviorEvent, RetentionPending, MarketingConsent, EmailSuppression,
    BehaviorSendLog, EVENT_TYPES, INTENT_LEVEL, INTENT_KIND, IDENTITY_SOURCES,
)

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ────────────────────────────────────────────────────────────────
# CONFIG
# ────────────────────────────────────────────────────────────────
def _int_env(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, "").strip() or default)
    except Exception:
        return default


def get_config() -> Dict[str, object]:
    """Read config lazily so tests can `monkeypatch.setenv` at will."""
    return {
        "live": (os.environ.get("PHILEON_BEHAVIORAL_LIVE", "").strip().lower() == "true"),
        "window_browse_min":   _int_env("PHILEON_RETENTION_BROWSE_MIN",   360),   # 6 h
        "window_wishlist_min": _int_env("PHILEON_RETENTION_WISHLIST_MIN", 1440),  # 24 h
        "window_cart_min":     _int_env("PHILEON_RETENTION_CART_MIN",     180),   # 3 h
        "window_checkout_min": _int_env("PHILEON_RETENTION_CHECKOUT_MIN",  90),   # 90 min
        "daily_cap":  _int_env("PHILEON_BEHAVIORAL_DAILY_CAP",  1),
        "weekly_cap": _int_env("PHILEON_BEHAVIORAL_WEEKLY_CAP", 3),
        "anon_ttl_days": _int_env("PHILEON_BEHAVIORAL_ANON_TTL_DAYS", 30),
        # First-launch global safety cap: MAX real behavioral sends allowed
        # in any rolling 24 h window. Simulated sends never count against
        # this cap (they only count against per-customer frequency caps).
        # 0 disables the cap (only safe once launch is out of the woods).
        "global_launch_cap_24h": _int_env("PHILEON_BEHAVIORAL_GLOBAL_LAUNCH_CAP", 10),
        # Behavioral-only sender (separate reputation from transactional).
        # If unset, LIVE mode is refused — protects transactional sender
        # deliverability. Never falls back to PHILEON_FROM_EMAIL.
        "behavioral_from_email": (os.environ.get("PHILEON_BEHAVIORAL_FROM_EMAIL") or "").strip(),
    }


def _window_delta(intent_kind: str) -> timedelta:
    cfg = get_config()
    return timedelta(minutes={
        "browse":   cfg["window_browse_min"],
        "wishlist": cfg["window_wishlist_min"],
        "cart":     cfg["window_cart_min"],
        "checkout": cfg["window_checkout_min"],
    }[intent_kind])


# ────────────────────────────────────────────────────────────────
# EMAIL / CONSENT UTILS
# ────────────────────────────────────────────────────────────────
def normalize_email(e: Optional[str]) -> Optional[str]:
    if not e or not isinstance(e, str):
        return None
    v = e.strip().lower()
    if not _EMAIL_RE.match(v):
        return None
    return v


async def is_marketing_eligible(db, email: str) -> bool:
    """Explicit opt-in + not suppressed + not unsubscribed."""
    e = normalize_email(email)
    if not e:
        return False
    if await db.email_suppression.find_one({"email": e}):
        return False
    consent = await db.marketing_consent.find_one({"email": e})
    if not consent:
        return False
    if consent.get("marketing_unsubscribed_at"):
        return False
    return bool(consent.get("marketing_eligible", False))


async def grant_consent(db, email: str, source: str) -> Optional[Dict]:
    """Record affirmative marketing consent. Idempotent."""
    e = normalize_email(email)
    if not e:
        return None
    now = datetime.now(timezone.utc)
    doc = {
        "email": e,
        "marketing_eligible": True,
        "marketing_consent_source": source,
        "marketing_consent_timestamp": now,
        "marketing_unsubscribed_at": None,
        "unsubscribe_reason": None,
    }
    await db.marketing_consent.update_one({"email": e}, {"$set": doc}, upsert=True)
    # Consenting clears an earlier soft-suppress from the same email; hard
    # bounces / spam complaints stay suppressed until admin removes them.
    return doc


async def unsubscribe(db, email: str, reason: str = "self_service") -> Dict:
    """Mark suppression + record unsubscribe timestamp on consent row."""
    e = normalize_email(email)
    if not e:
        return {"ok": False, "reason": "invalid_email"}
    now = datetime.now(timezone.utc)
    await db.email_suppression.update_one(
        {"email": e},
        {"$set": {"email": e, "reason": reason, "created_at": now}},
        upsert=True,
    )
    await db.marketing_consent.update_one(
        {"email": e},
        {"$set": {
            "marketing_eligible": False,
            "marketing_unsubscribed_at": now,
            "unsubscribe_reason": reason,
        }, "$setOnInsert": {
            "email": e,
            "marketing_consent_source": "unsubscribe_only",
            "marketing_consent_timestamp": now,
        }},
        upsert=True,
    )
    # Cancel all pending campaigns for this email.
    await db.retention_pending.update_many(
        {"customer_email": e, "status": "pending"},
        {"$set": {"status": "suppressed",
                  "cancelled_at": now,
                  "cancelled_reason": "unsubscribe"}},
    )
    return {"ok": True, "email": e}


# ────────────────────────────────────────────────────────────────
# HMAC-SIGNED UNSUBSCRIBE TOKENS
# ────────────────────────────────────────────────────────────────
def _secret() -> bytes:
    s = os.environ.get("JWT_SECRET", "").strip()
    if not s:
        raise RuntimeError("JWT_SECRET is required for unsubscribe token signing")
    return s.encode("utf-8")


def _b64u(b: bytes) -> str:
    return urlsafe_b64encode(b).decode("ascii").rstrip("=")


def _b64u_decode(s: str) -> bytes:
    return urlsafe_b64decode(s + "=" * (-len(s) % 4))


def make_unsub_token(email: str, ttl_days: int = 90) -> str:
    """Return `b64u(body).b64u(sig)`. Text-space delimiter — the '.' can
    NEVER appear inside either half because the urlsafe-base64 alphabet
    is `A-Za-z0-9-_`. Fixes the probabilistic (~12%) failure where a raw
    HMAC-SHA256 sig containing a `0x2e` byte caused `rsplit(b'.', 1)` to
    split at the wrong offset."""
    e = normalize_email(email) or ""
    exp = int(time.time()) + (ttl_days * 86400)
    body = f"{e}|{exp}".encode("utf-8")
    sig = hmac.new(_secret(), body, hashlib.sha256).digest()
    return f"{_b64u(body)}.{_b64u(sig)}"


def verify_unsub_token(token: str) -> Optional[str]:
    try:
        if not token or "." not in token:
            return None
        body_b64, sig_b64 = token.rsplit(".", 1)
        body = _b64u_decode(body_b64)
        sig = _b64u_decode(sig_b64)
        expected = hmac.new(_secret(), body, hashlib.sha256).digest()
        if not hmac.compare_digest(sig, expected):
            return None
        email_bytes, exp_bytes = body.rsplit(b"|", 1)
        if int(exp_bytes) < int(time.time()):
            return None
        return normalize_email(email_bytes.decode("utf-8"))
    except Exception:
        return None


# ────────────────────────────────────────────────────────────────
# EVENT INGESTION
# ────────────────────────────────────────────────────────────────
async def _resolve_identity(db, session_id: str, trusted_email: Optional[str]) -> Tuple[Optional[str], str]:
    """Returns (customer_email, identity_source).

    `trusted_email` is passed ONLY from server-trusted contexts (auth /
    checkout / webhook). Client-supplied email is never trusted.
    """
    e = normalize_email(trusted_email) if trusted_email else None
    if e:
        return e, "authenticated"
    # Reuse an identity previously bound to this anonymous session.
    row = await db.session_identity.find_one({"session_id": session_id})
    if row and row.get("email"):
        return row["email"], "session_bound"
    return None, "anonymous"


async def record_event(
    db,
    event_type: str,
    product_slug: str,
    session_id: str,
    trusted_email: Optional[str] = None,
    source: Optional[str] = None,
) -> BehaviorEvent:
    """Persist a behavior event. Update pending state per intent hierarchy."""
    if event_type not in EVENT_TYPES:
        raise ValueError("invalid event_type")
    now = datetime.now(timezone.utc)
    email, identity_source = await _resolve_identity(db, session_id, trusted_email)

    ev = BehaviorEvent(
        event_type=event_type,
        product_slug=product_slug,
        session_id=session_id,
        customer_email=email,
        identity_source=identity_source,
        source=source,
        created_at=now,
        anon_expires_at=(None if email
                         else now + timedelta(days=get_config()["anon_ttl_days"])),
    )
    await db.behavior_events.insert_one(ev.model_dump())

    # Anonymous events never trigger email, but demote signals may still
    # need to affect pending state IF a bound identity exists on the
    # session — which is the only route by which they could have
    # generated pending state.
    if email:
        await _apply_event_to_pending(db, email, event_type, product_slug, now)
    return ev


async def _apply_event_to_pending(
    db, email: str, event_type: str, product_slug: str, now: datetime,
) -> None:
    """Apply intent hierarchy + demotion rules."""
    key = {"customer_email": email, "product_slug": product_slug}

    # Demote signals cancel matching lower campaigns.
    if event_type == "PRODUCT_UNLIKED":
        await db.retention_pending.update_many(
            {**key, "status": "pending", "intent_kind": "wishlist"},
            {"$set": {"status": "cancelled", "cancelled_at": now,
                      "cancelled_reason": "PRODUCT_UNLIKED"}},
        )
        return
    if event_type == "REMOVED_FROM_CART":
        await db.retention_pending.update_many(
            {**key, "status": "pending", "intent_kind": "cart"},
            {"$set": {"status": "cancelled", "cancelled_at": now,
                      "cancelled_reason": "REMOVED_FROM_CART"}},
        )
        return
    if event_type == "ORDER_PAID":
        # Purchase suppresses ALL pending campaigns for this product
        # (browse/wishlist/cart) plus any checkout abandonment for this
        # email (checkout is per-email, product_slug on the row is just
        # the "example" product from the checkout).
        await db.retention_pending.update_many(
            {"customer_email": email, "status": "pending",
             "$or": [{"product_slug": product_slug},
                     {"intent_kind": "checkout"}]},
            {"$set": {"status": "cancelled", "cancelled_at": now,
                      "cancelled_reason": "ORDER_PAID"}},
        )
        return

    level = INTENT_LEVEL.get(event_type, -1)
    if level < 0:
        return
    kind = INTENT_KIND[event_type]

    existing = await db.retention_pending.find_one({**key, "status": "pending"})
    delta = _window_delta(kind)
    if existing is None:
        row = RetentionPending(
            customer_email=email,
            product_slug=product_slug,
            intent_level=level,
            intent_kind=kind,
            first_seen_at=now, last_event_at=now,
            earliest_send_at=now + delta,
        )
        await db.retention_pending.insert_one(row.model_dump())
        return

    # Escalate or refresh.
    if level > int(existing.get("intent_level", 0)):
        await db.retention_pending.update_one(
            {"id": existing["id"]},
            {"$set": {"intent_level": level, "intent_kind": kind,
                      "last_event_at": now,
                      "earliest_send_at": now + delta}},
        )
    elif level == int(existing.get("intent_level", 0)):
        # Same-tier event; bounce the wait window back to now+delta.
        await db.retention_pending.update_one(
            {"id": existing["id"]},
            {"$set": {"last_event_at": now,
                      "earliest_send_at": now + delta}},
        )
    # Lower-intent events do not affect pending (already covered by higher).


async def bind_identity(db, session_id: str, email: str, source: str) -> Dict:
    """Associate a trusted email with an anonymous session going forward.
    Backfills past anonymous events, removes their TTL so they persist."""
    e = normalize_email(email)
    if not e or source not in IDENTITY_SOURCES:
        return {"ok": False}
    now = datetime.now(timezone.utc)
    await db.session_identity.update_one(
        {"session_id": session_id},
        {"$set": {"session_id": session_id, "email": e,
                  "identity_source": source, "bound_at": now}},
        upsert=True,
    )
    # Backfill previously anonymous events for THIS session (do not touch
    # events for other sessions or those already tied to a different email).
    await db.behavior_events.update_many(
        {"session_id": session_id, "customer_email": None},
        {"$set": {"customer_email": e, "identity_source": source},
         "$unset": {"anon_expires_at": ""}},
    )
    # Replay all VIEW/LIKE/ADD/CHECKOUT events chronologically to seed
    # the pending state as if the identity had been known from the start.
    async for ev in db.behavior_events.find(
        {"session_id": session_id, "customer_email": e},
    ).sort("created_at", 1):
        et = ev.get("event_type")
        if et in ("PRODUCT_VIEWED", "PRODUCT_LIKED", "ADDED_TO_CART", "CHECKOUT_STARTED"):
            await _apply_event_to_pending(
                db, e, et, ev.get("product_slug") or "", ev.get("created_at") or now,
            )
        elif et in ("PRODUCT_UNLIKED", "REMOVED_FROM_CART", "ORDER_PAID"):
            await _apply_event_to_pending(
                db, e, et, ev.get("product_slug") or "", ev.get("created_at") or now,
            )
    return {"ok": True, "email": e}


async def record_order_paid(db, email: str, product_slugs: Iterable[str]) -> Dict:
    e = normalize_email(email)
    if not e:
        return {"ok": False}
    now = datetime.now(timezone.utc)
    for slug in product_slugs:
        # Insert ORDER_PAID event so history is complete + pending gets cancelled.
        ev = BehaviorEvent(
            event_type="ORDER_PAID",
            product_slug=slug,
            session_id=f"webhook:{e}",
            customer_email=e,
            identity_source="webhook",
            created_at=now,
        )
        await db.behavior_events.insert_one(ev.model_dump())
        await _apply_event_to_pending(db, e, "ORDER_PAID", slug, now)
    # Also cancel checkout-abandonment for this email (belt & braces).
    await db.retention_pending.update_many(
        {"customer_email": e, "status": "pending", "intent_kind": "checkout"},
        {"$set": {"status": "cancelled", "cancelled_at": now,
                  "cancelled_reason": "ORDER_PAID"}},
    )
    return {"ok": True, "email": e, "cancelled_for": list(product_slugs)}


# ────────────────────────────────────────────────────────────────
# FREQUENCY CAP
# ────────────────────────────────────────────────────────────────
async def _within_frequency_cap(db, email: str, now: datetime) -> bool:
    cfg = get_config()
    since_24h = now - timedelta(hours=24)
    since_7d  = now - timedelta(days=7)
    day = await db.behavior_send_log.count_documents(
        {"email": email, "created_at": {"$gte": since_24h}},
    )
    if day >= int(cfg["daily_cap"]):
        return False
    week = await db.behavior_send_log.count_documents(
        {"email": email, "created_at": {"$gte": since_7d}},
    )
    if week >= int(cfg["weekly_cap"]):
        return False
    return True


# ────────────────────────────────────────────────────────────────
# TICK — evaluate pending queue, generate previews / send
# ────────────────────────────────────────────────────────────────
async def _global_launch_cap_hit(db, now: datetime) -> bool:
    """True when the rolling-24h count of LIVE (mode='live') sends has
    reached the configured launch cap. Simulated sends NEVER count here."""
    cap = int(get_config()["global_launch_cap_24h"])
    if cap <= 0:
        return False
    since = now - timedelta(hours=24)
    n = await db.behavior_send_log.count_documents(
        {"mode": "live", "created_at": {"$gte": since}},
    )
    return n >= cap


async def tick(db, now: Optional[datetime] = None, product_lookup=None) -> Dict:
    """Return a report of what WOULD (or DID) send.

    `product_lookup(slug)` may be provided to enrich previews with the
    product image/price. When None, the preview omits image/price.

    Simulation-to-LIVE frequency-cap invariant:
      _within_frequency_cap counts BOTH `simulated` and `live` send-log
      rows. So flipping PHILEON_BEHAVIORAL_LIVE=true never causes a
      backlog flood — every simulated send already sits in the ledger
      and continues to count against per-customer caps.
    """
    from services.retention_emails import build_email
    from services.email import send_email

    cfg = get_config()
    live_requested = bool(cfg["live"])
    behavioral_from = (cfg["behavioral_from_email"] or "").strip()
    # LIVE requires a dedicated behavioral sender. Otherwise: refuse and
    # fall through to simulation — never mix behavioral sends with the
    # transactional PHILEON_FROM_EMAIL sender reputation.
    live_effective = live_requested and bool(behavioral_from)
    now = now or datetime.now(timezone.utc)
    global_cap = int(cfg["global_launch_cap_24h"])
    # Snapshot LIVE-mode sends already in the ledger (24h window).
    _sends_baseline = 0
    if live_effective and global_cap > 0:
        _sends_baseline = await db.behavior_send_log.count_documents(
            {"mode": "live", "created_at": {"$gte": now - timedelta(hours=24)}},
        )
    live_sent_this_tick = 0
    global_cap_hit = live_effective and global_cap > 0 and _sends_baseline >= global_cap
    report = {
        "mode": "live" if (live_effective and not global_cap_hit) else "simulated",
        "live_requested": live_requested,
        "live_effective": live_effective,
        "behavioral_sender_configured": bool(behavioral_from),
        "global_launch_cap_hit": global_cap_hit,
        "evaluated": 0,
        "sent": [],
        "skipped": [],
        "eligible_but_capped": [],
    }

    pending = await db.retention_pending.find(
        {"status": "pending", "earliest_send_at": {"$lte": now}},
    ).sort("earliest_send_at", 1).to_list(500)

    for row in pending:
        report["evaluated"] += 1
        email = row["customer_email"]
        slug = row["product_slug"]
        kind = row["intent_kind"]

        # 1) Consent + suppression.
        if not await is_marketing_eligible(db, email):
            await db.retention_pending.update_one(
                {"id": row["id"]},
                {"$set": {"status": "suppressed",
                          "cancelled_at": now,
                          "cancelled_reason": "not_marketing_eligible"}},
            )
            report["skipped"].append({"pending_id": row["id"], "reason": "not_marketing_eligible"})
            continue

        # 2) Frequency cap (per-email).
        if not await _within_frequency_cap(db, email, now):
            report["eligible_but_capped"].append(
                {"pending_id": row["id"], "email_type": kind, "reason": "per_email_cap"}
            )
            continue

        # 3) Global launch cap — LIVE only.
        this_call_live = live_effective and not global_cap_hit
        if live_requested and not this_call_live:
            report["eligible_but_capped"].append(
                {"pending_id": row["id"], "email_type": kind,
                 "reason": "global_launch_cap_hit" if global_cap_hit
                           else "no_behavioral_sender"}
            )
            # Leave the pending row untouched — next tick re-evaluates.
            continue

        # 4) Build preview.
        product = product_lookup(slug) if callable(product_lookup) else None
        preview = build_email(kind, email=email, product_slug=slug, product=product)

        # 5) Send OR simulate.
        resend_id = None
        mode = "simulated"
        if this_call_live:
            result = await send_email(email, preview["subject"], preview["html"],
                                       preview["text"], from_email=behavioral_from)
            resend_id = (result or {}).get("id")
            mode = "live" if (result or {}).get("status") == "sent" else "simulated"
            if mode == "live":
                live_sent_this_tick += 1
                # Halt at the cap boundary.
                if (global_cap > 0
                        and (_sends_baseline + live_sent_this_tick) >= global_cap):
                    global_cap_hit = True

        # 6) Log + close pending.
        log = BehaviorSendLog(
            email=email, email_type=kind, product_slug=slug,
            pending_id=row["id"], mode=mode,
            subject_preview=preview["subject"],
            resend_id=resend_id,
        )
        await db.behavior_send_log.insert_one(log.model_dump())
        await db.retention_pending.update_one(
            {"id": row["id"]},
            {"$set": {"status": "sent", "sent_at": now,
                      "sent_email_type": kind,
                      "simulation_only": (mode != "live")}},
        )
        report["sent"].append({
            "pending_id": row["id"],
            "email_type": kind,
            "product_slug": slug,
            "email": email,
            "mode": mode,
            "subject": preview["subject"],
        })

    return report


# ────────────────────────────────────────────────────────────────
# INDEXES (called at startup)
# ────────────────────────────────────────────────────────────────
async def ensure_indexes(db) -> None:
    # 30-day TTL on anonymous events (auto-purge).
    await db.behavior_events.create_index(
        "anon_expires_at", expireAfterSeconds=0, sparse=True,
        name="anon_events_ttl",
    )
    await db.behavior_events.create_index([("session_id", 1), ("created_at", 1)])
    await db.behavior_events.create_index([("customer_email", 1), ("created_at", -1)])
    await db.retention_pending.create_index(
        [("customer_email", 1), ("product_slug", 1), ("status", 1)],
    )
    await db.retention_pending.create_index([("status", 1), ("earliest_send_at", 1)])
    await db.marketing_consent.create_index("email", unique=True, name="consent_email_uniq")
    await db.email_suppression.create_index("email", unique=True, name="suppression_email_uniq")
    await db.behavior_send_log.create_index([("email", 1), ("created_at", -1)])
    await db.session_identity.create_index("session_id", unique=True, name="session_identity_uniq")
