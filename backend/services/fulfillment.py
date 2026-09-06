"""PHILEON — Fulfillment Operations (Layer 2).

Small, focused module holding the CANONICAL fulfillment state machine,
eligibility rules, tracking-URL helper, and audit-log writer.

Nothing in this module touches:
  · money math (`unit_amount_cents`, `subtotal_cents`, `shipping_cents`,
    `tax_cents`, `total_cents`) — those are Stripe-authoritative +
    canonical resolver output;
  · `payment_status`         — that is Stripe truth via the webhook;
  · `shipping_integrity_status` / `presentment_integrity_status` — those
    are set by the Stripe webhook only. This module READS them but never
    writes them (owner cannot bypass an integrity hold from admin).

The two existing fulfilment fields on `OrderV2` remain in place:
  · `fulfilment_status` (BR spelling, required) — set by the webhook:
    `awaiting_payment` → `paid` | `pending_review`
  · `fulfillment_status` (US spelling, optional) — the OPERATIONAL state
    the owner drives from admin: `pending_review` | `approved_for_fulfillment`
    | `in_preparation` | `ready_to_ship` | `shipped` | `delivered` |
    `cancelled` | `on_hold`

We do NOT introduce a third status field. Historical orders continue to
deserialize cleanly (both fields are permissive-typed).
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import quote_plus
import re


# ────────────────────────────────────────────────────────────────
# STATE MACHINE
# ────────────────────────────────────────────────────────────────

# Owner-facing operational state written to `fulfillment_status` (US
# spelling, optional). Sits ON TOP of Stripe-truth `payment_status` and
# webhook-set `fulfilment_status`.
OPERATIONAL_STATES = (
    "pending_review",            # awaiting owner review OR any integrity hold
    "approved_for_fulfillment",  # owner confirmed items/size/variant; ready to prepare
    "in_preparation",            # jewelry is being prepared at the bench
    "ready_to_ship",             # packed, awaiting carrier
    "shipped",                   # tracking recorded, customer notified
    "delivered",                 # future: delivery-confirmation email (Layer 3+)
    "cancelled",                 # order cancelled/refunded pre-shipment
    "on_hold",                   # manual owner hold (address/customization/fraud/etc.)
)

# Only these transitions are legal via the admin panel. Transitions
# triggered by the Stripe webhook (payment_status→paid,
# fulfilment_status→paid|pending_review) live in `webhooks_stripe.py` and
# are NOT gated by this table.
ALLOWED_TRANSITIONS: Dict[str, tuple] = {
    None:                          ("pending_review", "approved_for_fulfillment", "on_hold", "cancelled"),
    "pending_review":              ("approved_for_fulfillment", "on_hold", "cancelled"),
    "approved_for_fulfillment":    ("in_preparation", "on_hold", "cancelled"),
    "in_preparation":              ("ready_to_ship", "on_hold", "cancelled"),
    "ready_to_ship":               ("shipped", "on_hold", "cancelled"),
    "shipped":                     ("delivered",),           # cannot un-ship
    "delivered":                   (),                        # terminal
    "cancelled":                   (),                        # terminal
    "on_hold":                     ("pending_review", "approved_for_fulfillment", "cancelled"),
}


# ────────────────────────────────────────────────────────────────
# ELIGIBILITY — server-authoritative
# ────────────────────────────────────────────────────────────────

class FulfillmentEligibility:
    """Structured verdict object; JSON-serialisable via `.to_dict()`."""

    def __init__(self, eligible: bool, reasons: List[str],
                 requires: Dict[str, bool]):
        self.eligible = eligible
        self.reasons = reasons
        self.requires = requires

    def to_dict(self) -> Dict[str, Any]:
        return {"eligible": self.eligible, "reasons": self.reasons,
                "requires": self.requires}


_TERMINAL_BAD_PAYMENT_STATES = {"failed", "cancelled", "refunded",
                                "partially_refunded", "disputed"}


def evaluate_eligibility(order: Dict[str, Any]) -> FulfillmentEligibility:
    """Server-authoritative rule set for whether an order MAY move into
    fulfillment. Called by every admin write endpoint that advances the
    fulfillment lifecycle.

    Rules:
      · payment_status must be `paid` or `authorized`.
      · shipping_integrity_status must be `ok` or absent (unchecked).
      · presentment_integrity_status must be `ok`, `null`, or absent.
      · payment_status must NOT be in a terminal bad state.
      · order must not be in fulfillment `on_hold` (manual owner hold).
      · required shipping context must be present.
    """
    reasons: List[str] = []
    requires = {
        "payment_paid":          False,
        "shipping_integrity_ok": False,
        "presentment_integrity_ok": False,
        "not_cancelled":         False,
        "not_on_hold":           False,
        "shipping_present":      False,
    }

    ps = (order.get("payment_status") or "").lower()
    if ps in ("paid", "authorized"):
        requires["payment_paid"] = True
    else:
        reasons.append("payment_not_paid")

    if ps in _TERMINAL_BAD_PAYMENT_STATES:
        reasons.append(f"payment_{ps}")
    else:
        requires["not_cancelled"] = True

    si = (order.get("shipping_integrity_status") or "").lower()
    if si in ("", "ok"):
        requires["shipping_integrity_ok"] = True
    else:
        reasons.append(f"shipping_integrity_{si}")

    pi = (order.get("presentment_integrity_status") or "").lower()
    if pi in ("", "ok"):
        requires["presentment_integrity_ok"] = True
    else:
        reasons.append(f"presentment_integrity_{pi}")

    op = (order.get("fulfillment_status") or "").lower()
    if op == "on_hold":
        reasons.append("on_manual_hold")
    else:
        requires["not_on_hold"] = True

    if op == "cancelled":
        reasons.append("fulfillment_cancelled")

    ship = order.get("shipping") or {}
    if ship.get("country") and (ship.get("service_label") or ship.get("zone_key")):
        requires["shipping_present"] = True
    else:
        reasons.append("shipping_missing")

    eligible = all(requires.values()) and not reasons
    return FulfillmentEligibility(eligible=eligible, reasons=reasons,
                                  requires=requires)


# ────────────────────────────────────────────────────────────────
# TRANSITION VALIDATION
# ────────────────────────────────────────────────────────────────

def can_transition(current: Optional[str], target: str) -> bool:
    """True iff `current → target` is a legal admin-side transition."""
    if target not in OPERATIONAL_STATES:
        return False
    return target in ALLOWED_TRANSITIONS.get(current, ())


# ────────────────────────────────────────────────────────────────
# TRACKING NUMBER SANITIZATION
# ────────────────────────────────────────────────────────────────

_TRACKING_ALLOWED = re.compile(r"[^A-Za-z0-9\-]+")


def sanitize_tracking_number(raw: str) -> str:
    """Normalize whitespace, strip HTML/script/control characters, keep only
    alphanumerics and hyphens. Preserves nothing the customer would have
    put on a shipping label. Never returns an empty string for a valid
    input; empty for junk-only input.
    """
    if not isinstance(raw, str):
        return ""
    # Collapse whitespace, strip
    v = raw.strip()
    # Remove HTML tags / script attempts
    v = re.sub(r"<[^>]*>", "", v)
    # Keep alnum + hyphen (spaces collapsed to nothing — carriers accept
    # unbroken numbers).
    v = _TRACKING_ALLOWED.sub("", v)
    return v[:120]


# ────────────────────────────────────────────────────────────────
# CARRIER TRACKING URL HELPER
# ────────────────────────────────────────────────────────────────

def build_tracking_url(carrier: str, tracking_number: str,
                       explicit_url: Optional[str] = None) -> Optional[str]:
    """Build a safe carrier tracking URL.

    If the owner supplied an explicit URL that starts with http(s)://,
    return it verbatim. Otherwise attempt a canonical URL for the known
    carrier. For unknown carriers return None so the UI shows the tracking
    number without a link.
    """
    if isinstance(explicit_url, str):
        s = explicit_url.strip()
        if s.startswith("http://") or s.startswith("https://"):
            return s
    tn = sanitize_tracking_number(tracking_number or "")
    if not tn:
        return None
    c = (carrier or "").strip().lower()
    tn_enc = quote_plus(tn)
    if "ups" in c:
        return f"https://www.ups.com/track?tracknum={tn_enc}"
    if "fedex" in c:
        return f"https://www.fedex.com/fedextrack/?trknbr={tn_enc}"
    if "dhl" in c:
        return f"https://www.dhl.com/en/express/tracking.html?AWB={tn_enc}"
    if "canada post" in c or "canadapost" in c:
        return f"https://www.canadapost-postescanada.ca/track-reperage/en#/details/{tn_enc}"
    if "usps" in c:
        return f"https://tools.usps.com/go/TrackConfirmAction?tLabels={tn_enc}"
    return None


# ────────────────────────────────────────────────────────────────
# AUDIT LOG — one collection, append-only
# ────────────────────────────────────────────────────────────────

async def write_audit(db, *, order_number: str, action: str,
                      previous: Optional[str], new: Optional[str],
                      actor: str, reason: Optional[str] = None,
                      extra: Optional[Dict[str, Any]] = None) -> None:
    """Append one row to `fulfillment_audit`. Never raises — audit failure
    must never break the primary write path."""
    try:
        doc = {
            "order_number": order_number,
            "action": action,
            "previous": previous,
            "new": new,
            "actor": actor or "admin",
            "reason": reason,
            "at": datetime.now(timezone.utc),
        }
        if extra:
            # Never allow money or Stripe IDs through the audit sidechannel.
            _BANNED = {"total_cents", "subtotal_cents", "unit_amount_cents",
                       "shipping_cents", "tax_cents", "provider_session_id",
                       "provider_payment_intent_id", "status_token_hash",
                       "email_status_token", "webhook_event_ids"}
            safe = {k: v for k, v in extra.items() if k not in _BANNED}
            if safe:
                doc["extra"] = safe
        await db.fulfillment_audit.insert_one(doc)
    except Exception:
        pass


async def ensure_indexes(db) -> None:
    """Idempotent index setup for the fulfillment audit collection."""
    try:
        await db.fulfillment_audit.create_index(
            [("order_number", 1), ("at", -1)],
            name="fulfillment_audit_order_at",
        )
        await db.fulfillment_audit.create_index(
            [("at", -1)], name="fulfillment_audit_recent",
        )
    except Exception:
        pass
