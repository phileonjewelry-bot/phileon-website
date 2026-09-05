"""OrderV2 — integer-cents order model for Phase 1 secure checkout."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid, secrets, hashlib


def _order_number() -> str:
    return f"PHI-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}"


class OrderV2Item(BaseModel):
    product_id: str
    product_name: str
    subtitle: Optional[str] = None
    sku: str
    variant: str
    karat: Optional[str] = None
    metal_colour: Optional[str] = None
    ring_size: Optional[str] = None
    gemstones: Optional[str] = None
    quantity: int
    unit_amount_cents: int
    image: Optional[str] = None


class OrderV2Shipping(BaseModel):
    """Nested, optional shipping block. Populated with the trusted zone at
    session-create and reconciled with Stripe-collected values on the
    checkout.session.completed webhook. Every field is optional so historical
    orders (which have no `shipping` block) continue to deserialize."""
    model_config = ConfigDict(extra="ignore")
    zone_key: Optional[str] = None
    country: Optional[str] = None
    address_snapshot: Optional[Dict[str, Any]] = None
    recipient_name: Optional[str] = None
    service_label: Optional[str] = None
    carrier_label: Optional[str] = None
    stripe_shipping_rate_id: Optional[str] = None
    signature_required: Optional[bool] = None
    insurance_required: Optional[bool] = None
    po_box_flag: Optional[bool] = None


class OrderV2Presentment(BaseModel):
    """Optional Stripe Adaptive Pricing / trusted-BNPL reconciliation block.

    Canonical (`OrderV2.currency`, `OrderV2.total_cents`, …) stays USD for
    every new order unless the customer explicitly took the trusted CAD
    BNPL lane, in which case the canonical remains USD AND this block
    records the trusted CAD presentment that Stripe actually charged.
    Every field is optional so orders where no presentment applied still
    deserialize cleanly.
    """
    model_config = ConfigDict(extra="ignore")
    # Whatever Stripe authoritatively reports for the customer-charged
    # currency and amount. Never derived from client input.
    stripe_presentment_currency: Optional[str] = None
    stripe_presentment_amount_cents: Optional[int] = None
    # Convenience mirrors — same values, prefixed to match the shipping
    # naming style used elsewhere on `OrderV2`. Present when Stripe reports
    # a non-USD Adaptive Pricing presentment OR when the trusted CAD BNPL
    # lane priced the order.
    presentment_currency: Optional[str] = None
    presentment_total_cents: Optional[int] = None
    # Component presentment amounts — populated by the trusted BNPL FX
    # service at session-create. Absent for Adaptive Pricing orders (Stripe
    # reports only the total).
    presentment_subtotal_cents: Optional[int] = None
    presentment_shipping_cents: Optional[int] = None
    presentment_tax_cents: Optional[int] = None
    # Authoritative Stripe-derived exchange rate for Adaptive Pricing OR
    # the trusted server-side snapshot for the BNPL lane. NEVER the
    # storefront's display-only FX.
    fx_rate: Optional[float] = None
    fx_rate_source: Optional[str] = None  # "stripe.adaptive_pricing" | "frankfurter"
    fx_retrieved_at: Optional[float] = None  # epoch seconds
    fx_reference_date: Optional[str] = None  # ISO date from provider
    fx_is_stale: Optional[bool] = None
    # UX preference reported by the browser at session-create for audit
    # only. It does NOT drive Stripe or the trusted amount.
    display_currency_selected_at_session: Optional[str] = None
    # Which Stripe field actually carried the presentment payload for this
    # order. Documented per environment so support can trace shape drift.
    extraction_source: Optional[str] = None
    # Which lane priced the order: "adaptive_pricing" (Stripe-decided
    # local presentment) or "bnpl_cad" (trusted server-side USD→CAD before
    # session-create).
    lane: Optional[str] = None


class OrderV2(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=_order_number)
    status_token_hash: str
    idempotency_key: str
    customer_email: Optional[str] = None
    items: List[OrderV2Item]
    subtotal_cents: int
    shipping_cents: int = 0
    tax_cents: int = 0
    total_cents: int
    currency: str = "USD"
    payment_provider: str = "stripe"
    provider_session_id: Optional[str] = None
    provider_session_url: Optional[str] = None
    provider_payment_intent_id: Optional[str] = None
    payment_status: str = "pending"     # pending|requires_action|authorized|paid|failed|cancelled|refunded|partially_refunded|disputed
    fulfilment_status: str = "awaiting_payment"
    # Shipping-integrity flag — decoupled from `payment_status`. Set to
    # `"pending_review"` when Stripe confirms payment succeeded but the
    # webhook detects a shipping-amount mismatch against the trusted zone.
    # Never falsifies `payment_status` — a paid order stays paid.
    shipping_integrity_status: Optional[str] = None
    # Notification delivery — each set to True ONLY when the corresponding
    # message reached the recipient (send_email returned status="sent").
    # `paid_notification_sent` remains the legacy "paid transition
    # processed" gate for backward compatibility and idempotency.
    customer_notification_sent: Optional[bool] = None
    internal_review_notification_sent: Optional[bool] = None
    shipping: Optional[OrderV2Shipping] = None
    # Stripe Adaptive Pricing reconciliation — optional; historical orders
    # have no `presentment` block. New canonical USD orders may or may not
    # carry Adaptive Pricing depending on Stripe eligibility.
    presentment: Optional[OrderV2Presentment] = None
    # Payment-method type reported by Stripe on the completed session
    # (`card`, `klarna`, `affirm`, `apple_pay`, `google_pay`, `link`, …).
    # Optional so historical orders continue to deserialize. NEVER trusted
    # for money math — recorded for support/analytics and refund handling.
    payment_method_type: Optional[str] = None
    # Optional presentment-integrity gate (mirrors `shipping_integrity_status`
    # architecture). Only set to "pending_review" when a genuine like-for-
    # like reconciliation defect is detected — Adaptive Pricing FX drift is
    # NEVER a defect.
    presentment_integrity_status: Optional[str] = None
    webhook_event_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def hash_status_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
