"""PHILEON — Layer 6: Concierge / Customer-Service Operations.

Lightweight coordination surface. NOT a CRM. NOT a helpdesk replacement.

The service exposes:

* `create_case(...)`     — create a `concierge_cases` row
* `transition_status`    — legal state-machine transition (server-enforced)
* `set_priority`         — owner-only
* `set_next_action`      — owner-only
* `set_follow_up_at`     — owner-only
* `set_waiting_on`       — owner-only
* `add_note`             — append an internal note
* `add_contact_log`      — append a factual contact record
* `find_active_dedupe`   — 15-minute retry dedupe window
* `list_cases`, `get_case`
* `build_customer_360`   — aggregate orders_v2 / RMA / disputes / consent
* `build_order_timeline` — aggregate existing authoritative audit rows
* `case_id`              — CON-YYYY-XXXXXX safe identifier
* `ensure_indexes`       — idempotent index setup

Every mutation is written server-side. The customer-facing view intentionally
masks priority, internal notes, next_action, and audit rows.

This service does NOT duplicate authority for shipments, refunds,
disputes, or inventory — those Layers remain the source of truth. Cases
reference their state via deep-links only.
"""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple
import hashlib
import re
import secrets


# ─── Enumerations ──────────────────────────────────────────────────────────

CASE_STATES = ["new", "open", "waiting_on_customer",
               "waiting_on_phileon", "resolved", "closed"]

# Legal transitions. Owner-controlled reopen is allowed from resolved/closed
# back to `open`. Illegal transitions must be rejected at the route boundary.
LEGAL_TRANSITIONS: Dict[str, List[str]] = {
    "new":                 ["open", "waiting_on_customer",
                            "waiting_on_phileon", "resolved", "closed"],
    "open":                ["waiting_on_customer", "waiting_on_phileon",
                            "resolved", "closed"],
    "waiting_on_customer": ["open", "waiting_on_phileon",
                            "resolved", "closed"],
    "waiting_on_phileon":  ["open", "waiting_on_customer",
                            "resolved", "closed"],
    "resolved":            ["open", "closed"],
    "closed":              ["open"],
}

ALLOWED_PRIORITIES = ["normal", "attention", "urgent"]

ALLOWED_SOURCES = [
    "contact_form", "order_support", "return", "warranty",
    "shipping", "payment", "manual_owner_case",
]

ALLOWED_CATEGORIES = [
    "order_status", "shipping", "return", "warranty",
    "product_question", "size_fit", "customization",
    "payment", "other",
]

# Customer-safe labels — never expose priority, internal notes, or next_action.
CUSTOMER_STATUS_COPY: Dict[str, str] = {
    "new":                 "Request received.",
    "open":                "PHILEON is reviewing your request.",
    "waiting_on_customer": "We're waiting for your response.",
    "waiting_on_phileon":  "PHILEON is reviewing your request.",
    "resolved":            "Your request has been resolved.",
    "closed":              "This request is now closed.",
}


# ─── Identifiers ───────────────────────────────────────────────────────────

# 27-char "unambiguous" alphabet — no I/O/0/1/L to avoid customer confusion
# when the ID is spoken or handwritten.
_CASE_ID_ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def case_id(now: Optional[datetime] = None) -> str:
    """Return a customer-safe case identifier of the form ``CON-YYYY-XXXXXX``.

    * `secrets`-random suffix so external observers cannot infer case volume.
    * 6-char suffix ⇒ 27**6 ≈ 3.87e8 keyspace ⇒ collision-negligible.
    * Uniqueness is enforced at the DB layer via a unique index.
    """
    when = now or datetime.now(timezone.utc)
    year = when.strftime("%Y")
    suffix = "".join(secrets.choice(_CASE_ID_ALPHA) for _ in range(6))
    return f"CON-{year}-{suffix}"


# ─── Utility ───────────────────────────────────────────────────────────────

def normalize_email(email: Optional[str]) -> Optional[str]:
    """Trim + lowercase. Do NOT collapse Gmail dots / plus aliases /
    unrelated addresses — that would create identity merges the owner
    never authorized (Layer 6 §2)."""
    if not email:
        return None
    e = str(email).strip().lower()
    return e or None


def _iso(dt: Any) -> Optional[str]:
    if not dt:
        return None
    if isinstance(dt, str):
        return dt
    if isinstance(dt, datetime):
        return dt.isoformat()
    return None


def _dedupe_hash(email: Optional[str], subject: str, message: str) -> str:
    """Retry-dedupe key. Identical (email, subject, message) triples
    submitted within a short window collapse to one case."""
    canon = "\n".join([
        (email or "").strip().lower(),
        (subject or "").strip().lower(),
        (message or "").strip(),
    ])
    return hashlib.sha256(canon.encode("utf-8")).hexdigest()


def customer_safe_status_label(status: Optional[str]) -> str:
    if not status:
        return ""
    return CUSTOMER_STATUS_COPY.get(status, "")


def serialize_case_for_admin(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Full admin projection. Excludes `_id` and the dedupe hash."""
    if not doc:
        return doc
    d = {k: v for k, v in doc.items() if k not in ("_id", "dedupe_hash")}
    for tk in ("created_at", "updated_at", "resolved_at", "closed_at",
               "follow_up_at"):
        if tk in d and isinstance(d[tk], datetime):
            d[tk] = d[tk].isoformat()
    for entry in d.get("admin_notes", []) or []:
        if isinstance(entry.get("at"), datetime):
            entry["at"] = entry["at"].isoformat()
    for entry in d.get("contact_log", []) or []:
        if isinstance(entry.get("at"), datetime):
            entry["at"] = entry["at"].isoformat()
    for entry in d.get("status_history", []) or []:
        if isinstance(entry.get("at"), datetime):
            entry["at"] = entry["at"].isoformat()
    return d


def serialize_case_for_customer(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Customer projection — masks all owner-only data.

    Never surfaces: priority, admin_notes, contact_log, next_action,
    waiting_on, follow_up_at, audit rows, actor identities."""
    if not doc:
        return doc
    return {
        "case_id": doc.get("case_id"),
        "order_number": doc.get("order_number"),
        "subject": doc.get("subject"),
        "status": doc.get("status"),
        "customer_message": customer_safe_status_label(doc.get("status")),
        "created_at": _iso(doc.get("created_at")),
        "updated_at": _iso(doc.get("updated_at")),
    }


# ─── DB — creation, updates, audit ─────────────────────────────────────────

async def ensure_indexes(db) -> None:
    """Idempotent index creation. Safe to call on every boot."""
    try:
        await db.concierge_cases.create_index(
            "case_id", unique=True, name="cc_case_id_uniq")
    except Exception:
        pass
    try:
        await db.concierge_cases.create_index(
            [("customer_email_normalized", 1), ("created_at", -1)],
            name="cc_customer_email_recent")
    except Exception:
        pass
    try:
        await db.concierge_cases.create_index(
            [("order_number", 1), ("created_at", -1)],
            name="cc_order_recent")
    except Exception:
        pass
    try:
        await db.concierge_cases.create_index(
            [("status", 1), ("priority", 1), ("created_at", -1)],
            name="cc_status_priority_recent")
    except Exception:
        pass
    try:
        await db.concierge_cases.create_index(
            "follow_up_at", name="cc_follow_up_at")
    except Exception:
        pass
    try:
        await db.concierge_cases.create_index(
            [("dedupe_hash", 1), ("created_at", -1)],
            name="cc_dedupe_recent")
    except Exception:
        pass
    try:
        await db.concierge_cases_audit.create_index(
            [("case_id", 1), ("at", -1)], name="cc_audit_case_at")
    except Exception:
        pass


async def _write_audit(db, *, case_id_: str, actor: str, action: str,
                       previous: Optional[str] = None,
                       new: Optional[str] = None,
                       order_number: Optional[str] = None,
                       extra: Optional[Dict[str, Any]] = None) -> None:
    """Append-only. Audit rows never contain secrets or Stripe IDs."""
    try:
        clean_extra: Dict[str, Any] = {}
        for k, v in (extra or {}).items():
            if k in ("token", "status_token_hash", "email_status_token",
                     "stripe_customer_id", "provider_payment_intent_id",
                     "webhook_secret", "api_key"):
                continue
            clean_extra[k] = v
        doc = {
            "case_id": case_id_,
            "order_number": order_number,
            "actor": actor,
            "action": action,
            "previous": previous,
            "new": new,
            "at": datetime.now(timezone.utc),
            "extra": clean_extra,
        }
        await db.concierge_cases_audit.insert_one(doc)
    except Exception:
        # Audit is best-effort; never break the mutation path.
        pass


async def find_active_dedupe(db, *, email: Optional[str], subject: str,
                             message: str, window_minutes: int = 15
                             ) -> Optional[Dict[str, Any]]:
    """Return a case created within ``window_minutes`` whose (email,
    subject, message) triple hashes to the same value. Used to collapse
    identical duplicate-network-retry submissions.
    """
    if not (subject or message):
        return None
    h = _dedupe_hash(email, subject, message)
    since = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)
    doc = await db.concierge_cases.find_one({
        "dedupe_hash": h,
        "created_at": {"$gte": since},
    }, {"_id": 0})
    return doc


async def create_case(db, *,
                      source: str,
                      category: str,
                      subject: str,
                      customer_message: str,
                      customer_email: Optional[str] = None,
                      customer_name: Optional[str] = None,
                      customer_phone: Optional[str] = None,
                      order_number: Optional[str] = None,
                      priority: str = "normal",
                      actor: str = "customer",
                      dedupe_window_minutes: int = 15
                      ) -> Tuple[Dict[str, Any], bool]:
    """Create a case, honouring the retry-dedupe window.

    Returns ``(doc, created)`` — ``created`` is False when the retry-dedupe
    matched an existing case (idempotent behaviour for genuine network
    retries)."""
    if source not in ALLOWED_SOURCES:
        raise ValueError(f"invalid source: {source}")
    if category not in ALLOWED_CATEGORIES:
        raise ValueError(f"invalid category: {category}")
    if priority not in ALLOWED_PRIORITIES:
        raise ValueError(f"invalid priority: {priority}")

    subject = (subject or "").strip()[:200]
    customer_message = (customer_message or "").strip()[:4000]
    if not subject or not customer_message:
        raise ValueError("subject and customer_message are required")

    normalized_email = normalize_email(customer_email)

    existing = await find_active_dedupe(
        db, email=normalized_email, subject=subject,
        message=customer_message,
        window_minutes=dedupe_window_minutes)
    if existing:
        return existing, False

    now = datetime.now(timezone.utc)
    cid = case_id(now)
    # Extremely unlikely collision — retry once.
    while await db.concierge_cases.find_one({"case_id": cid}, {"_id": 1}):
        cid = case_id(now)

    doc = {
        "case_id": cid,
        "source": source,
        "category": category,
        "subject": subject,
        "customer_message": customer_message,
        "customer_email": (customer_email or "").strip() or None,
        "customer_email_normalized": normalized_email,
        "customer_name": (customer_name or "").strip() or None,
        "customer_phone": (customer_phone or "").strip() or None,
        "order_number": (order_number or "").strip() or None,
        "status": "new",
        "priority": priority,
        "owner_summary": None,
        "next_action": None,
        "follow_up_at": None,
        "waiting_on": None,
        "admin_notes": [],
        "contact_log": [],
        "status_history": [
            {"status": "new", "actor": actor, "at": now},
        ],
        "created_at": now,
        "updated_at": now,
        "resolved_at": None,
        "closed_at": None,
        "dedupe_hash": _dedupe_hash(normalized_email, subject,
                                    customer_message),
    }
    await db.concierge_cases.insert_one(doc)
    await _write_audit(db, case_id_=cid, actor=actor, action="create",
                       previous=None, new="new",
                       order_number=order_number,
                       extra={"source": source, "category": category,
                              "priority": priority})
    # Strip internal _id if the driver mutated it in-place.
    doc.pop("_id", None)
    return doc, True


async def get_case(db, case_id_: str) -> Optional[Dict[str, Any]]:
    return await db.concierge_cases.find_one({"case_id": case_id_},
                                             {"_id": 0})


async def list_cases(db, *, status: Optional[str] = None,
                     priority: Optional[str] = None,
                     source: Optional[str] = None,
                     category: Optional[str] = None,
                     order_number: Optional[str] = None,
                     email: Optional[str] = None,
                     search: Optional[str] = None,
                     limit: int = 200) -> List[Dict[str, Any]]:
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    if priority:
        q["priority"] = priority
    if source:
        q["source"] = source
    if category:
        q["category"] = category
    if order_number:
        q["order_number"] = order_number
    if email:
        q["customer_email_normalized"] = normalize_email(email)
    if search:
        # Escape user input — protects against ReDoS and metacharacter abuse
        # (mirrors the Layer-5 admin_returns hardening).
        s = re.escape(search.strip())[:80]
        q["$or"] = [
            {"case_id":       {"$regex": s, "$options": "i"}},
            {"order_number":  {"$regex": s, "$options": "i"}},
            {"customer_email_normalized": {"$regex": s, "$options": "i"}},
            {"customer_name": {"$regex": s, "$options": "i"}},
            {"subject":       {"$regex": s, "$options": "i"}},
        ]
    cursor = db.concierge_cases.find(q, {"_id": 0}).sort(
        "created_at", -1).limit(min(max(limit, 1), 500))
    return [d async for d in cursor]


async def transition_status(db, *, case_id_: str, new_status: str,
                            actor: str) -> Dict[str, Any]:
    if new_status not in CASE_STATES:
        raise ValueError(f"invalid status: {new_status}")
    case = await get_case(db, case_id_)
    if not case:
        raise LookupError("case not found")
    current = case.get("status") or "new"
    if new_status == current:
        return case
    allowed = LEGAL_TRANSITIONS.get(current, [])
    if new_status not in allowed:
        raise PermissionError(
            f"illegal transition {current} → {new_status}")
    now = datetime.now(timezone.utc)
    upd: Dict[str, Any] = {"status": new_status, "updated_at": now}
    if new_status == "resolved":
        upd["resolved_at"] = now
    if new_status == "closed":
        upd["closed_at"] = now
    if new_status == "open" and current in ("resolved", "closed"):
        # Reopen — clear terminal timestamps so downstream views correctly
        # reflect the case is active again.
        upd["resolved_at"] = None
        upd["closed_at"] = None
    await db.concierge_cases.update_one(
        {"case_id": case_id_},
        {"$set": upd,
         "$push": {"status_history":
                   {"status": new_status, "actor": actor, "at": now}}},
    )
    await _write_audit(db, case_id_=case_id_, actor=actor,
                       action="transition",
                       previous=current, new=new_status,
                       order_number=case.get("order_number"))
    return await get_case(db, case_id_)


async def set_priority(db, *, case_id_: str, priority: str,
                       actor: str) -> Dict[str, Any]:
    if priority not in ALLOWED_PRIORITIES:
        raise ValueError(f"invalid priority: {priority}")
    case = await get_case(db, case_id_)
    if not case:
        raise LookupError("case not found")
    previous = case.get("priority") or "normal"
    if previous == priority:
        return case
    now = datetime.now(timezone.utc)
    await db.concierge_cases.update_one(
        {"case_id": case_id_},
        {"$set": {"priority": priority, "updated_at": now}},
    )
    await _write_audit(db, case_id_=case_id_, actor=actor,
                       action="priority",
                       previous=previous, new=priority,
                       order_number=case.get("order_number"))
    return await get_case(db, case_id_)


async def set_next_action(db, *, case_id_: str,
                          next_action: Optional[str],
                          actor: str) -> Dict[str, Any]:
    case = await get_case(db, case_id_)
    if not case:
        raise LookupError("case not found")
    cleaned = (next_action or "").strip()[:200] or None
    now = datetime.now(timezone.utc)
    await db.concierge_cases.update_one(
        {"case_id": case_id_},
        {"$set": {"next_action": cleaned, "updated_at": now}},
    )
    await _write_audit(db, case_id_=case_id_, actor=actor,
                       action="next_action",
                       previous=case.get("next_action"),
                       new=cleaned,
                       order_number=case.get("order_number"))
    return await get_case(db, case_id_)


async def set_follow_up_at(db, *, case_id_: str,
                           follow_up_at: Optional[str],
                           actor: str) -> Dict[str, Any]:
    case = await get_case(db, case_id_)
    if not case:
        raise LookupError("case not found")
    parsed: Optional[datetime] = None
    if follow_up_at:
        try:
            s = follow_up_at.replace("Z", "+00:00")
            parsed = datetime.fromisoformat(s)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
        except Exception as exc:
            raise ValueError(f"invalid follow_up_at: {exc}")
    now = datetime.now(timezone.utc)
    await db.concierge_cases.update_one(
        {"case_id": case_id_},
        {"$set": {"follow_up_at": parsed, "updated_at": now}},
    )
    await _write_audit(db, case_id_=case_id_, actor=actor,
                       action="follow_up_at",
                       previous=_iso(case.get("follow_up_at")),
                       new=_iso(parsed),
                       order_number=case.get("order_number"))
    return await get_case(db, case_id_)


async def set_waiting_on(db, *, case_id_: str, waiting_on: Optional[str],
                         actor: str) -> Dict[str, Any]:
    case = await get_case(db, case_id_)
    if not case:
        raise LookupError("case not found")
    cleaned = (waiting_on or "").strip()[:120] or None
    now = datetime.now(timezone.utc)
    await db.concierge_cases.update_one(
        {"case_id": case_id_},
        {"$set": {"waiting_on": cleaned, "updated_at": now}},
    )
    await _write_audit(db, case_id_=case_id_, actor=actor,
                       action="waiting_on",
                       previous=case.get("waiting_on"),
                       new=cleaned,
                       order_number=case.get("order_number"))
    return await get_case(db, case_id_)


async def add_note(db, *, case_id_: str, note: str,
                   actor: str) -> Dict[str, Any]:
    """Append a factual, timestamped internal note. Notes are never
    surfaced through customer routes."""
    cleaned = (note or "").strip()
    if not cleaned:
        raise ValueError("note is required")
    if len(cleaned) > 4000:
        raise ValueError("note is too long")
    case = await get_case(db, case_id_)
    if not case:
        raise LookupError("case not found")
    now = datetime.now(timezone.utc)
    entry = {"note": cleaned, "actor": actor, "at": now}
    await db.concierge_cases.update_one(
        {"case_id": case_id_},
        {"$push": {"admin_notes": entry},
         "$set": {"updated_at": now}},
    )
    await _write_audit(db, case_id_=case_id_, actor=actor,
                       action="note",
                       order_number=case.get("order_number"),
                       extra={"note_len": len(cleaned)})
    return {"note": cleaned, "actor": actor, "at": now.isoformat()}


CONTACT_DIRECTIONS = {"inbound", "outbound"}
CONTACT_CHANNELS = {"email", "phone", "website", "other"}


async def add_contact_log(db, *, case_id_: str, direction: str,
                          channel: str, summary: str,
                          actor: str) -> Dict[str, Any]:
    if direction not in CONTACT_DIRECTIONS:
        raise ValueError(f"invalid direction: {direction}")
    if channel not in CONTACT_CHANNELS:
        raise ValueError(f"invalid channel: {channel}")
    cleaned = (summary or "").strip()
    if not cleaned:
        raise ValueError("summary is required")
    if len(cleaned) > 2000:
        raise ValueError("summary is too long")
    case = await get_case(db, case_id_)
    if not case:
        raise LookupError("case not found")
    now = datetime.now(timezone.utc)
    entry = {"direction": direction, "channel": channel,
             "summary": cleaned, "actor": actor, "at": now}
    await db.concierge_cases.update_one(
        {"case_id": case_id_},
        {"$push": {"contact_log": entry},
         "$set": {"updated_at": now}},
    )
    await _write_audit(db, case_id_=case_id_, actor=actor,
                       action="contact_log",
                       order_number=case.get("order_number"),
                       extra={"direction": direction, "channel": channel})
    return {"direction": direction, "channel": channel,
            "summary": cleaned, "actor": actor,
            "at": now.isoformat()}


# ─── Customer 360 — read-only aggregation ─────────────────────────────────

# Fields that MUST NEVER escape a customer-360 payload. Includes Stripe
# secrets, webhook rows, JWTs, dispute evidence, and internal storage keys.
_ORDER_SECRETS = {
    "_id", "status_token_hash", "email_status_token",
    "provider_payment_intent_id", "stripe_customer_id",
    "raw_stripe_session", "raw_webhook_payload", "webhook_events",
    "webhook_secret", "api_key",
}

_ORDER_SAFE_FIELDS = [
    "order_number", "created_at", "customer_email",
    "currency", "total_cents",
    "payment_status", "fulfilment_status", "fulfillment_status",
    "fulfillment_type", "dispatch_estimate",
    "carrier", "tracking_number", "tracking_url",
    "shipped_at", "signature_required", "insurance_required",
    "fraud_review_status", "inventory_snapshot",
    "presentment", "shipping", "items",
]


def _project_order_for_ops(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    safe: Dict[str, Any] = {}
    for k in _ORDER_SAFE_FIELDS:
        if k in doc:
            safe[k] = doc[k]
    # Item projection — strip Stripe IDs and internal price internals.
    items = safe.get("items") or []
    safe["items"] = [
        {
            "product_slug": it.get("product_slug") or it.get("slug"),
            "product_name": it.get("product_name"),
            "variant": it.get("variant"),
            "karat": it.get("karat"),
            "metal_colour": it.get("metal_colour"),
            "ring_size": it.get("ring_size"),
            "quantity": int(it.get("quantity") or 1),
            "unit_amount_cents": int(it.get("unit_amount_cents") or 0),
            "availability_mode": it.get("availability_mode"),
        }
        for it in items
    ]
    # Shipping — carrier already at top-level; strip anything else risky.
    ship = safe.get("shipping") or {}
    if isinstance(ship, dict):
        safe["shipping"] = {
            "country":       ship.get("country"),
            "region":        ship.get("region") or ship.get("state"),
            "city":          ship.get("city"),
            "postal_code":   ship.get("postal_code"),
            "address_line1": ship.get("address_line1") or ship.get("line1"),
            "address_line2": ship.get("address_line2") or ship.get("line2"),
            "service_label": ship.get("service_label"),
        }
    # Presentment — customer-facing charged currency/amount only.
    pres = safe.get("presentment") or {}
    if isinstance(pres, dict):
        safe["presentment"] = {
            "presentment_currency": (
                pres.get("presentment_currency")
                or pres.get("stripe_presentment_currency")),
            "presentment_total_cents": (
                pres.get("presentment_total_cents")
                or pres.get("stripe_presentment_amount_cents")),
        }
    # datetime → ISO
    for tk in ("created_at", "shipped_at"):
        if isinstance(safe.get(tk), datetime):
            safe[tk] = safe[tk].isoformat()
    return safe


async def build_customer_360(db, *, email: str) -> Dict[str, Any]:
    """Aggregate factual operational context for one normalized email."""
    normalized = normalize_email(email)
    if not normalized:
        return {"email": None, "orders": [], "cases": [], "rma": [],
                "disputes": [], "consent": None}

    # Orders — case-insensitive match on stored customer_email.
    order_query = {
        "$or": [
            {"customer_email": normalized},
            {"customer_email": {"$regex": f"^{re.escape(normalized)}$",
                                "$options": "i"}},
        ]
    }
    orders_cursor = db.orders_v2.find(order_query).sort("created_at", -1) \
        .limit(50)
    orders: List[Dict[str, Any]] = []
    order_numbers: List[str] = []
    async for o in orders_cursor:
        orders.append(_project_order_for_ops(o))
        if o.get("order_number"):
            order_numbers.append(o["order_number"])

    # RMA cases — by order association.
    rma_docs: List[Dict[str, Any]] = []
    if order_numbers:
        cursor = db.returns.find(
            {"order_number": {"$in": order_numbers}},
            {"_id": 0, "case_id_internal": 0}
        ).sort("created_at", -1).limit(50)
        async for r in cursor:
            rma_docs.append({
                "rma_number": r.get("rma_number"),
                "order_number": r.get("order_number"),
                "status": r.get("status"),
                "request_type": r.get("request_type"),
                "reason_code": r.get("reason_code"),
                "created_at": _iso(r.get("created_at")),
                "closed_at": _iso(r.get("closed_at")),
                "return_window_expires_at":
                    _iso(r.get("return_window_expires_at")),
            })

    # Disputes — indicator-only.
    dispute_docs: List[Dict[str, Any]] = []
    if order_numbers:
        cursor = db.dispute_cases.find(
            {"order_number": {"$in": order_numbers}},
            {"_id": 0, "shipment_audit": 0, "raw_dispute": 0,
             "evidence_payload": 0}
        ).sort("created_at", -1).limit(50)
        async for d in cursor:
            dispute_docs.append({
                "case_id":      d.get("case_id"),
                "order_number": d.get("order_number"),
                "status":       d.get("status"),
                "reason":       d.get("reason"),
                "created_at":   _iso(d.get("created_at")),
            })

    # Concierge cases — by normalized email OR by order association.
    case_query: Dict[str, Any] = {"$or": [
        {"customer_email_normalized": normalized},
    ]}
    if order_numbers:
        case_query["$or"].append({"order_number": {"$in": order_numbers}})
    cases_cursor = db.concierge_cases.find(case_query, {"_id": 0}).sort(
        "created_at", -1).limit(50)
    cases: List[Dict[str, Any]] = []
    async for c in cases_cursor:
        cases.append(serialize_case_for_admin(c))

    # Consent + suppression.
    consent = await db.marketing_consent.find_one(
        {"email": normalized}, {"_id": 0})
    suppression = await db.email_suppression.find_one(
        {"email": normalized}, {"_id": 0})
    consent_view: Dict[str, Any] = {
        "email": normalized,
        "marketing_consented": bool(
            consent and consent.get("marketing_eligible") and
            not consent.get("marketing_unsubscribed_at")),
        "marketing_unsubscribed_at":
            _iso(consent.get("marketing_unsubscribed_at")) if consent else None,
        "suppressed": bool(suppression),
        "suppression_reason": (suppression or {}).get("reason"),
    }

    return {
        "email": normalized,
        "orders": orders,
        "cases": cases,
        "rma": rma_docs,
        "disputes": dispute_docs,
        "consent": consent_view,
    }


# ─── Unified order timeline (read-only aggregation) ────────────────────────

async def build_order_timeline(db, *, order_number: str
                               ) -> Dict[str, Any]:
    """Return a chronological read-only timeline for one order.

    Aggregates *existing* authoritative rows. No new financial truth is
    created. Duplicate rows are collapsed by (event_type, at) so a
    duplicate webhook doesn't inflate the timeline.
    """
    order = await db.orders_v2.find_one(
        {"order_number": order_number}, {"_id": 0})
    if not order:
        return {"order_number": order_number, "events": [],
                "order": None}

    events: List[Dict[str, Any]] = []

    def add(event_type: str, at: Any, *,
            source: str, detail: Optional[Dict[str, Any]] = None):
        if not at:
            return
        if isinstance(at, str):
            try:
                s = at.replace("Z", "+00:00")
                at = datetime.fromisoformat(s)
            except Exception:
                return
        if not isinstance(at, datetime):
            return
        events.append({
            "event": event_type,
            "at": at,
            "source": source,
            "detail": detail or {},
        })

    add("ORDER_CREATED", order.get("created_at"),
        source="orders_v2",
        detail={"total_cents": order.get("total_cents"),
                "currency": order.get("currency")})
    if order.get("paid_at"):
        add("PAYMENT_CONFIRMED", order.get("paid_at"), source="orders_v2")
    elif (order.get("payment_status") or "").lower() == "paid":
        add("PAYMENT_CONFIRMED",
            order.get("updated_at") or order.get("created_at"),
            source="orders_v2")

    if (order.get("fraud_review_status") or "").lower() in (
            "hold", "under_review", "on_hold"):
        add("FRAUD_HOLD",
            order.get("fraud_review_at")
            or order.get("updated_at")
            or order.get("created_at"),
            source="orders_v2",
            detail={"status": order.get("fraud_review_status")})

    if order.get("shipped_at"):
        add("SHIPPED", order.get("shipped_at"), source="orders_v2",
            detail={"carrier": order.get("carrier"),
                    "tracking_number": order.get("tracking_number")})

    # Fulfillment audit rows
    async for row in db.fulfillment_audit.find(
            {"order_number": order_number},
            {"_id": 0}).sort("at", 1):
        act = (row.get("action") or "").lower()
        mapping = {
            "approve":            "FULFILLMENT_APPROVED",
            "approved":           "FULFILLMENT_APPROVED",
            "in_preparation":     "IN_PREPARATION",
            "prepare":            "IN_PREPARATION",
            "ship":               "SHIPPED",
            "shipped":            "SHIPPED",
            "correct_tracking":   "TRACKING_CORRECTED",
            "tracking_updated":   "TRACKING_CORRECTED",
            "cancel":             "CASE_STATUS_CHANGE",
            "hold":               "INTEGRITY_HOLD",
        }
        add(mapping.get(act, "CASE_STATUS_CHANGE"),
            row.get("at"), source="fulfillment_audit",
            detail={"action": row.get("action"),
                    "actor": row.get("actor")})

    # RMA — return lifecycle.
    async for r in db.returns.find(
            {"order_number": order_number}, {"_id": 0}).sort("created_at", 1):
        add("RETURN_REQUESTED", r.get("requested_at") or r.get("created_at"),
            source="returns",
            detail={"rma_number": r.get("rma_number"),
                    "reason": r.get("reason_code")})
        if r.get("authorized_at"):
            add("RETURN_AUTHORIZED", r.get("authorized_at"),
                source="returns",
                detail={"rma_number": r.get("rma_number")})
        if r.get("received_at"):
            add("ITEM_RECEIVED", r.get("received_at"),
                source="returns",
                detail={"rma_number": r.get("rma_number")})
        if r.get("refund_approved_at"):
            add("REFUND_APPROVED", r.get("refund_approved_at"),
                source="returns",
                detail={"rma_number": r.get("rma_number")})
        if r.get("refund_confirmed_at"):
            add("REFUND_CONFIRMED", r.get("refund_confirmed_at"),
                source="returns",
                detail={"rma_number": r.get("rma_number")})

    # Disputes.
    async for d in db.dispute_cases.find(
            {"order_number": order_number},
            {"_id": 0, "shipment_audit": 0, "raw_dispute": 0,
             "evidence_payload": 0}).sort("created_at", 1):
        add("DISPUTE_CREATED", d.get("created_at"), source="disputes",
            detail={"case_id": d.get("case_id"),
                    "reason": d.get("reason")})
        st = (d.get("status") or "").lower()
        if st == "won":
            add("DISPUTE_WON", d.get("resolved_at") or d.get("updated_at"),
                source="disputes",
                detail={"case_id": d.get("case_id")})
        if (order.get("payment_status") or "").lower() == "chargeback_lost":
            add("CHARGEBACK_LOST",
                d.get("resolved_at") or d.get("updated_at")
                or order.get("updated_at"),
                source="orders_v2",
                detail={"case_id": d.get("case_id")})

    # Concierge cases.
    async for c in db.concierge_cases.find(
            {"order_number": order_number}, {"_id": 0}).sort("created_at", 1):
        add("CONCIERGE_CONTACT", c.get("created_at"),
            source="concierge_cases",
            detail={"case_id": c.get("case_id"),
                    "category": c.get("category"),
                    "source_type": c.get("source")})
        for entry in (c.get("admin_notes") or []):
            add("CONCIERGE_NOTE", entry.get("at"),
                source="concierge_cases",
                detail={"case_id": c.get("case_id"),
                        "actor": entry.get("actor")})
        for entry in (c.get("status_history") or []):
            if entry.get("status") == "new":
                continue
            add("CASE_STATUS_CHANGE", entry.get("at"),
                source="concierge_cases",
                detail={"case_id": c.get("case_id"),
                        "status": entry.get("status")})

    # De-duplicate by (event, isoformat) — protects against duplicate
    # webhooks and dual sources producing the same row.
    seen = set()
    unique: List[Dict[str, Any]] = []
    for e in events:
        key = (e["event"], e["at"].isoformat())
        if key in seen:
            continue
        seen.add(key)
        unique.append(e)

    unique.sort(key=lambda x: x["at"])
    # ISO-format for the wire — datetime is not JSON-serialisable.
    for e in unique:
        e["at"] = e["at"].isoformat()

    return {
        "order_number": order_number,
        "order": _project_order_for_ops(order),
        "events": unique,
    }


# ─── Canned reply message previews (static, preview/copy only) ─────────────

MESSAGE_PREVIEWS: List[Dict[str, str]] = [
    {
        "key": "request_received",
        "title": "Request received",
        "body": (
            "Thank you for reaching out to PHILEON. Your request has been "
            "received and a member of our concierge is reviewing it. You "
            "will hear back from us shortly."
        ),
    },
    {
        "key": "reviewing_order",
        "title": "We're reviewing your order",
        "body": (
            "Thank you for your patience. PHILEON is reviewing the details "
            "of your order and will follow up with a clear update as soon "
            "as we have confirmed the next step."
        ),
    },
    {
        "key": "need_more_info",
        "title": "We need additional information",
        "body": (
            "To move your request forward, PHILEON needs a small piece of "
            "additional information from you. Could you please share the "
            "details below when you have a moment?"
        ),
    },
    {
        "key": "shipping_update",
        "title": "Shipping update",
        "body": (
            "PHILEON has an update on the shipment for your order. The "
            "details below reflect the most recent information from our "
            "fulfilment team."
        ),
    },
    {
        "key": "return_update",
        "title": "Return / Warranty update",
        "body": (
            "PHILEON has an update regarding your return or warranty "
            "request. Please review the details below and let us know if "
            "you have any questions."
        ),
    },
    {
        "key": "case_resolved",
        "title": "Your request has been resolved",
        "body": (
            "PHILEON has resolved your request. Thank you for the time "
            "you have taken to share this with us. Please don't hesitate "
            "to reach out again if we can help in any way."
        ),
    },
]
