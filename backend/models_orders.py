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
    shipping: Optional[OrderV2Shipping] = None
    webhook_event_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def hash_status_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
