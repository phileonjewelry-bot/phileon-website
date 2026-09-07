"""PHILEON — Returns / RMA / Refund Operations (Layer 3).

CANONICAL RMA state machine + eligibility engine + refund calculation.

Nothing in this module:
  · issues a real Stripe refund (LIVE mode is gated at the caller);
  · manually calculates a customer local-currency refund amount
    (Stripe remains authoritative for presentment refunds);
  · alters `orders_v2.payment_status` (Stripe webhook does that);
  · mutates historical orders.

Policy classes:
  · `eligible_gold`  — gold merchandise, 30-day return window from
                        confirmed delivery.
  · `silver`         — FINAL SALE.
  · `custom`         — bespoke / made-to-order → FINAL SALE.
  · `engraved`       — FINAL SALE.
  · `resized`        — FINAL SALE.
  · `unknown`        — insufficient metadata to auto-classify →
                        `OWNER_REVIEW_REQUIRED`. NEVER auto-denied.
"""
from __future__ import annotations
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple
import re
import secrets

RETURN_WINDOW_DAYS = 30

RMA_STATES = (
    "requested",           # customer submitted; awaiting owner review
    "under_review",        # owner is reviewing (also used for unknown class)
    "authorized",          # owner approved RMA; customer may ship back
    "denied",              # owner rejected before receipt
    "in_transit",          # optional; owner marked "shipped back"
    "received",            # owner marked item received
    "inspection_pending",  # awaiting inspection
    "inspection_passed",   # inspection PASS
    "inspection_failed",   # inspection FAIL
    "refund_approved",     # owner approved refund; not yet issued
    "refund_pending",      # Stripe refund request submitted; awaiting webhook
    "refunded",            # Stripe webhook confirmed refund
    "closed",              # terminal; case archived
)

# Legal transitions (admin-driven). Customer only advances 'requested'
# via `POST /api/returns/request` (fresh case) or read-only status
# viewing. All other transitions require admin JWT.
ALLOWED_TRANSITIONS: Dict[str, tuple] = {
    "requested":          ("under_review", "authorized", "denied"),
    "under_review":       ("authorized", "denied"),
    "authorized":         ("in_transit", "received", "denied"),
    "in_transit":         ("received", "denied"),
    "received":           ("inspection_pending", "inspection_passed",
                            "inspection_failed"),
    "inspection_pending": ("inspection_passed", "inspection_failed"),
    "inspection_passed":  ("refund_approved", "closed"),
    "inspection_failed":  ("denied", "closed"),
    "refund_approved":    ("refund_pending", "refunded", "closed"),
    "refund_pending":     ("refunded", "closed"),
    "refunded":           ("closed",),
    "denied":             ("closed",),
    "closed":             (),
}


def can_transition(current: Optional[str], target: str) -> bool:
    if target not in RMA_STATES:
        return False
    if current is None:
        return target == "requested"
    return target in ALLOWED_TRANSITIONS.get(current, ())


# ────────────────────────────────────────────────────────────────
# RMA NUMBER
# ────────────────────────────────────────────────────────────────

def new_rma_number() -> str:
    """RMA-YYYY-XXXXXX (uppercase hex). Non-guessable, safe to display.
    Not derived from Mongo ObjectId or sequential counter."""
    yr = datetime.now(timezone.utc).strftime("%Y")
    return f"RMA-{yr}-{secrets.token_hex(3).upper()}"


# ────────────────────────────────────────────────────────────────
# POLICY CLASSIFICATION
# ────────────────────────────────────────────────────────────────

_SILVER_HINTS = re.compile(r"\b(silver|sterling)\b", re.IGNORECASE)
_GOLD_HINTS = re.compile(r"\b(gold|karat|10K|14K|18K|22K|24K|vermeil)\b", re.IGNORECASE)
_CUSTOM_HINTS = re.compile(r"\b(custom|bespoke|atelier|made-?to-?order|mto|commission)\b",
                            re.IGNORECASE)


def classify_item_policy(item: Dict[str, Any]) -> str:
    """Return one of eligible_gold | silver | custom | engraved | resized |
    unknown for a single order line item. Never raises."""
    variant = str(item.get("variant") or "")
    karat = str(item.get("karat") or "")
    metal = str(item.get("metal_colour") or "")
    name = str(item.get("product_name") or "")
    combined = f"{name} {variant} {karat} {metal}"

    # Order-item metadata for engraving / resizing / custom is NOT
    # currently captured at checkout. If a caller later adds a
    # boolean flag we honor it here; otherwise we return `unknown` for
    # OWNER_REVIEW_REQUIRED.
    if item.get("is_engraved") is True or item.get("engraved") is True:
        return "engraved"
    if item.get("is_resized") is True or item.get("resized") is True:
        return "resized"
    if item.get("is_custom") is True or item.get("custom") is True:
        return "custom"

    if _CUSTOM_HINTS.search(combined):
        return "custom"
    if _SILVER_HINTS.search(combined) and not _GOLD_HINTS.search(combined):
        return "silver"
    if _GOLD_HINTS.search(combined):
        return "eligible_gold"
    # Unable to classify from available metadata.
    return "unknown"


_FINAL_SALE_CLASSES = frozenset({"silver", "custom", "engraved", "resized"})


# ────────────────────────────────────────────────────────────────
# ELIGIBILITY VERDICT
# ────────────────────────────────────────────────────────────────

class ReturnEligibility:
    def __init__(self, eligible: bool, policy_class: str,
                 reasons: List[str], owner_review_required: bool = False,
                 return_window_expires_at: Optional[datetime] = None):
        self.eligible = eligible
        self.policy_class = policy_class
        self.reasons = reasons
        self.owner_review_required = owner_review_required
        self.return_window_expires_at = return_window_expires_at

    def to_dict(self) -> Dict[str, Any]:
        return {
            "eligible": self.eligible,
            "policy_class": self.policy_class,
            "reasons": self.reasons,
            "owner_review_required": self.owner_review_required,
            "return_window_expires_at": (
                self.return_window_expires_at.isoformat()
                if isinstance(self.return_window_expires_at, datetime) else None
            ),
        }


def evaluate_item_eligibility(order: Dict[str, Any], item: Dict[str, Any],
                              *, now: Optional[datetime] = None) -> ReturnEligibility:
    """Server-authoritative eligibility for one line item.

    Rules:
      · order.payment_status must be `paid` or `authorized`;
      · order not fully `refunded`;
      · policy class must not be a final-sale class;
      · delivery date (`shipped_at` + delivery, or explicit `delivered_at`)
        must be within RETURN_WINDOW_DAYS. If unavailable → owner review.
    """
    reasons: List[str] = []
    now = now or datetime.now(timezone.utc)
    policy_class = classify_item_policy(item)

    ps = (order.get("payment_status") or "").lower()
    if ps not in ("paid", "authorized"):
        reasons.append("payment_not_paid")
    if ps == "refunded":
        reasons.append("already_fully_refunded")

    if policy_class in _FINAL_SALE_CLASSES:
        reasons.append(f"final_sale:{policy_class}")
        return ReturnEligibility(eligible=False, policy_class=policy_class,
                                 reasons=reasons)

    if policy_class == "unknown":
        return ReturnEligibility(
            eligible=False, policy_class="unknown",
            reasons=reasons + ["classification_uncertain"],
            owner_review_required=True,
        )

    # Delivered date — accept explicit `delivered_at`, else `shipped_at`.
    # If neither is present: NEVER auto-deny; route to owner review.
    delivered_at = order.get("delivered_at") or order.get("shipped_at")
    if not isinstance(delivered_at, datetime):
        try:
            if isinstance(delivered_at, str) and delivered_at:
                delivered_at = datetime.fromisoformat(delivered_at.replace("Z", "+00:00"))
            else:
                delivered_at = None
        except Exception:
            delivered_at = None
    if delivered_at is None:
        return ReturnEligibility(
            eligible=False, policy_class=policy_class,
            reasons=reasons + ["delivery_date_unverified"],
            owner_review_required=True,
        )

    if delivered_at.tzinfo is None:
        delivered_at = delivered_at.replace(tzinfo=timezone.utc)
    expires_at = delivered_at + timedelta(days=RETURN_WINDOW_DAYS)
    if now > expires_at:
        reasons.append("outside_return_window")
        return ReturnEligibility(
            eligible=False, policy_class=policy_class,
            reasons=reasons,
            return_window_expires_at=expires_at,
        )

    if reasons:
        return ReturnEligibility(eligible=False, policy_class=policy_class,
                                  reasons=reasons)

    return ReturnEligibility(eligible=True, policy_class=policy_class,
                              reasons=[], return_window_expires_at=expires_at)


# ────────────────────────────────────────────────────────────────
# REFUND CALCULATION — server-authoritative
# ────────────────────────────────────────────────────────────────

def calculate_refund_cents(order: Dict[str, Any],
                            item_indices: List[int]) -> Tuple[int, str]:
    """Return `(refund_amount_cents_in_canonical_currency, currency)`.

    Uses the ORIGINAL order snapshot only. Never uses current catalog
    price / current FX / current metal spot / client-submitted amount.

    Refund covers merchandise only. Never includes outbound shipping,
    tax, or duties — those are non-refundable per PHILEON policy unless
    a separate owner-approved exception is set on the RMA (not
    implemented in Layer 3).
    """
    items = order.get("items") or []
    total = 0
    for idx in item_indices:
        if idx < 0 or idx >= len(items):
            continue
        it = items[idx]
        qty = int(it.get("quantity") or 1)
        unit = int(it.get("unit_amount_cents") or 0)
        total += qty * unit
    currency = (order.get("currency") or "USD").upper()
    return total, currency


# ────────────────────────────────────────────────────────────────
# REASON CODES
# ────────────────────────────────────────────────────────────────

CUSTOMER_REASON_CODES = (
    "changed_mind",
    "size_fit",
    "appearance_style",
    "arrived_damaged",
    "suspected_defect",
    "wrong_item_received",
    "other",
)

# Damage / defect route to warranty review rather than ordinary return.
_WARRANTY_REASONS = frozenset({"arrived_damaged", "suspected_defect"})


def request_type_for_reason(reason: str) -> str:
    """`return` | `warranty` | `other_support`. Determines routing at
    intake — warranty cases go to owner review by design."""
    r = (reason or "").lower().strip()
    if r in _WARRANTY_REASONS:
        return "warranty"
    if r in CUSTOMER_REASON_CODES:
        return "return"
    return "other_support"


# ────────────────────────────────────────────────────────────────
# AUDIT LOG
# ────────────────────────────────────────────────────────────────

async def write_audit(db, *, rma_number: str, order_number: str,
                      action: str, previous: Optional[str],
                      new: Optional[str], actor: str,
                      reason: Optional[str] = None,
                      extra: Optional[Dict[str, Any]] = None) -> None:
    try:
        _BANNED = {"total_cents", "subtotal_cents", "unit_amount_cents",
                   "provider_session_id", "provider_payment_intent_id",
                   "status_token_hash", "email_status_token",
                   "webhook_event_ids", "stripe_secret_key",
                   "resend_api_key", "jwt_secret"}
        doc: Dict[str, Any] = {
            "rma_number": rma_number,
            "order_number": order_number,
            "action": action,
            "previous": previous,
            "new": new,
            "actor": actor or "system",
            "reason": reason,
            "at": datetime.now(timezone.utc),
        }
        if extra:
            safe = {k: v for k, v in extra.items() if k not in _BANNED}
            if safe:
                doc["extra"] = safe
        await db.returns_audit.insert_one(doc)
    except Exception:
        pass


async def ensure_indexes(db) -> None:
    try:
        await db.returns.create_index("rma_number", unique=True,
                                       name="returns_rma_uniq")
        await db.returns.create_index([("order_number", 1), ("status", 1)],
                                       name="returns_order_status")
        await db.returns.create_index([("customer_email", 1),
                                        ("created_at", -1)],
                                       name="returns_email_recent")
        await db.returns.create_index([("status", 1), ("created_at", -1)],
                                       name="returns_status_recent")
        await db.returns_audit.create_index([("rma_number", 1), ("at", -1)],
                                             name="returns_audit_rma_at")
    except Exception:
        pass
