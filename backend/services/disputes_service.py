"""PHILEON — Disputes / Chargeback Readiness (Layer 4).

Stripe remains authoritative for dispute existence, amount, currency,
reason, status, evidence deadline, and win/loss. This module mirrors an
operational case only; it never contradicts Stripe truth.
"""
from __future__ import annotations
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
import secrets

# Stripe-authoritative status labels (mirrored verbatim).
STRIPE_STATUSES = (
    "needs_response", "under_review", "warning_needs_response",
    "warning_under_review", "warning_closed", "won", "lost",
    "charge_refunded", "charge_dismissed",
)

# Canonical classification of Stripe dispute statuses. ACTIVE means the
# money is still in-flight from Stripe's perspective (merchant response
# possible). TERMINAL means Stripe has resolved the case one way or the
# other. A historical terminal case must not remain "active" forever.
ACTIVE_STRIPE_STATUSES = frozenset({
    "needs_response", "under_review",
    "warning_needs_response", "warning_under_review",
})
TERMINAL_STRIPE_STATUSES = frozenset({
    "won", "lost", "warning_closed", "charge_dismissed", "charge_refunded",
})


async def has_active_dispute(db, order_number: str) -> bool:
    """Return True iff `order_number` has at least one Stripe-authoritative
    dispute case in an ACTIVE status. Never treats a terminal historical
    dispute as active. Safe to call for orders with no dispute history."""
    if not order_number:
        return False
    doc = await db.dispute_cases.find_one(
        {"order_number": order_number,
         "status": {"$in": list(ACTIVE_STRIPE_STATUSES)}},
        {"_id": 0, "case_id": 1},
    )
    return doc is not None

# PHILEON operational response state (separate from Stripe status).
RESPONSE_STATES = (
    "not_started", "collecting_evidence", "ready_for_owner_review",
    "approved_for_submission", "submitted", "closed",
)
RESPONSE_TRANSITIONS: Dict[str, tuple] = {
    "not_started":              ("collecting_evidence",),
    "collecting_evidence":      ("ready_for_owner_review", "not_started"),
    "ready_for_owner_review":   ("approved_for_submission", "collecting_evidence"),
    "approved_for_submission":  ("submitted", "ready_for_owner_review"),
    "submitted":                ("closed",),
    "closed":                   (),
}

FRAUD_REVIEW_STATES = ("clear", "review_required", "under_review",
                        "cleared", "blocked")


def new_case_id() -> str:
    yr = datetime.now(timezone.utc).strftime("%Y")
    return f"DSP-{yr}-{secrets.token_hex(3).upper()}"


def can_response_transition(cur: Optional[str], target: str) -> bool:
    if target not in RESPONSE_STATES:
        return False
    if cur is None:
        return target == "not_started"
    return target in RESPONSE_TRANSITIONS.get(cur, ())


def urgency_from_due(due_by: Optional[datetime]) -> str:
    """Owner-only urgency pill. Never surfaced to customers."""
    if not isinstance(due_by, datetime):
        return "unknown"
    if due_by.tzinfo is None:
        due_by = due_by.replace(tzinfo=timezone.utc)
    delta = due_by - datetime.now(timezone.utc)
    hours = delta.total_seconds() / 3600.0
    if hours < 0:
        return "overdue"
    if hours < 24:
        return "urgent"
    if hours < 72:
        return "attention"
    return "normal"


# ────────────────────────────────────────────────────────────────
# EVIDENCE PACKET — never fabricates
# ────────────────────────────────────────────────────────────────

_NOT_AVAILABLE = "NOT_AVAILABLE"


def build_evidence_packet(order: Dict[str, Any],
                           rma: Optional[Dict[str, Any]] = None,
                           audit_shipment: Optional[List[Dict[str, Any]]] = None
                           ) -> Dict[str, Any]:
    """Assemble a factual, owner-only evidence packet from data already
    persisted in PHILEON. Missing evidence is marked NOT_AVAILABLE — the
    packet NEVER fabricates.

    Excludes: secrets, unrelated orders, admin identities, behavioral
    tracking, private notes, speculation. Excludes Stripe API keys and
    webhook payloads.
    """
    shipping = order.get("shipping") or {}
    packet: Dict[str, Any] = {
        "order": {
            "order_number": order.get("order_number") or _NOT_AVAILABLE,
            "created_at": _iso(order.get("created_at")),
            "currency": order.get("currency") or "USD",
            "canonical_total_cents": int(order.get("total_cents") or 0),
            "canonical_subtotal_cents": int(order.get("subtotal_cents") or 0),
            "canonical_shipping_cents": int(order.get("shipping_cents") or 0),
            "canonical_tax_cents": int(order.get("tax_cents") or 0),
            "items": [{
                "product_name": i.get("product_name"),
                "variant": i.get("variant"),
                "ring_size": i.get("ring_size"),
                "quantity": int(i.get("quantity") or 1),
                "unit_amount_cents": int(i.get("unit_amount_cents") or 0),
            } for i in (order.get("items") or [])],
        },
        "customer": {
            "email": order.get("customer_email") or _NOT_AVAILABLE,
            "shipping_country": shipping.get("country") or _NOT_AVAILABLE,
            "shipping_recipient_name": shipping.get("recipient_name") or _NOT_AVAILABLE,
        },
        "payment": {
            "payment_status": order.get("payment_status") or _NOT_AVAILABLE,
            "risk_level": order.get("stripe_risk_level") or _NOT_AVAILABLE,
            "risk_score": order.get("stripe_risk_score") or _NOT_AVAILABLE,
            "avs_result": order.get("stripe_avs_result") or _NOT_AVAILABLE,
            "cvc_result": order.get("stripe_cvc_check") or _NOT_AVAILABLE,
            "three_ds": order.get("stripe_three_d_secure") or _NOT_AVAILABLE,
        },
        "fulfillment": {
            "fulfillment_status": order.get("fulfillment_status") or _NOT_AVAILABLE,
            "shipped_at": _iso(order.get("shipped_at")),
            "carrier": order.get("carrier") or _NOT_AVAILABLE,
            "tracking_number": order.get("tracking_number") or _NOT_AVAILABLE,
            "tracking_url": order.get("tracking_url") or _NOT_AVAILABLE,
            "signature_required": bool(shipping.get("signature_required")),
            "insurance_required": bool(shipping.get("insurance_required")),
        },
        "returns_and_refunds": {
            "rma_number": (rma or {}).get("rma_number") or _NOT_AVAILABLE,
            "rma_status": (rma or {}).get("status") or _NOT_AVAILABLE,
            "refund_decision": (rma or {}).get("refund_decision") or _NOT_AVAILABLE,
            "stripe_refund_id": (rma or {}).get("stripe_refund_id") or _NOT_AVAILABLE,
            "refund_amount_base_cents": (rma or {}).get("refund_amount_base_cents") or 0,
        },
        "communications": {
            "paid_notification_sent": bool(order.get("paid_notification_sent")),
            "shipping_notification_sent": bool(order.get("shipping_notification_sent")),
        },
        "policy": {
            "returns_page": "/returns",
            "warranty_page": "/warranty",
            "shipping_page": "/shipping",
            "return_window_days": 30,
            "final_sale_classes": ["silver", "custom", "engraved", "resized"],
        },
        "shipment_audit": list(audit_shipment or []),
    }
    return packet


def _iso(v: Any) -> Optional[str]:
    return v.isoformat() if isinstance(v, datetime) else v


# ────────────────────────────────────────────────────────────────
# AUDIT
# ────────────────────────────────────────────────────────────────

async def write_audit(db, *, case_id: str, order_number: str,
                      action: str, previous: Optional[str],
                      new: Optional[str], actor: str,
                      note: Optional[str] = None,
                      extra: Optional[Dict[str, Any]] = None) -> None:
    try:
        _BANNED = {"stripe_secret_key", "resend_api_key", "jwt_secret",
                   "status_token_hash", "email_status_token",
                   "provider_session_id", "provider_payment_intent_id",
                   "webhook_event_ids"}
        doc: Dict[str, Any] = {
            "case_id": case_id,
            "order_number": order_number,
            "action": action,
            "previous": previous,
            "new": new,
            "actor": actor or "system",
            "note": note,
            "at": datetime.now(timezone.utc),
        }
        if extra:
            safe = {k: v for k, v in extra.items() if k not in _BANNED}
            if safe:
                doc["extra"] = safe
        await db.disputes_audit.insert_one(doc)
    except Exception:
        pass


async def ensure_indexes(db) -> None:
    try:
        await db.dispute_cases.create_index("case_id", unique=True,
                                              name="dsp_case_uniq")
        await db.dispute_cases.create_index("stripe_dispute_id", unique=True,
                                              sparse=True,
                                              name="dsp_stripe_uniq")
        await db.dispute_cases.create_index([("status", 1),
                                              ("created_at", -1)],
                                              name="dsp_status_recent")
        await db.disputes_audit.create_index([("case_id", 1), ("at", -1)],
                                              name="dsp_audit_case_at")
    except Exception:
        pass
