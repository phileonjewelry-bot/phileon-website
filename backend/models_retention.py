"""PHILEON — Behavioral Retention data models (Simulation Phase).

Locked invariants preserved:
    * PRICING, USD source-of-truth, Stripe Checkout, webhook, order/payment
      state, transactional emails, admin shipment, order status are NOT
      touched by this module.
    * Anonymous browser events are TTL-purged after 30 days.
    * Client-supplied `email` is IGNORED. Email is bound to a session ONLY
      via server-trusted paths (auth session, newsletter opt-in, webhook).
    * Marketing eligibility requires an explicit affirmative signal.
      `Customer.marketing_consent == True` (legacy default) alone does NOT
      make a customer behaviorally eligible.
"""
from __future__ import annotations
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict, Field
import uuid


# ────────────────────────────────────────────────────────────────
# EVENT TYPES + INTENT HIERARCHY
# ────────────────────────────────────────────────────────────────
EVENT_TYPES = (
    "PRODUCT_VIEWED",
    "PRODUCT_LIKED",
    "PRODUCT_UNLIKED",
    "ADDED_TO_CART",
    "REMOVED_FROM_CART",
    "CHECKOUT_STARTED",
    "ORDER_PAID",
)

INTENT_LEVEL = {
    "PRODUCT_VIEWED":     0,
    "PRODUCT_LIKED":      1,
    "ADDED_TO_CART":      2,
    "CHECKOUT_STARTED":   3,
    "ORDER_PAID":         99,
    # UNLIKED / REMOVED_FROM_CART are demote signals — handled in service.
    "PRODUCT_UNLIKED":    -1,
    "REMOVED_FROM_CART":  -1,
}

# Higher-intent event → matching pending "campaign kind".
INTENT_KIND = {
    "PRODUCT_VIEWED":   "browse",
    "PRODUCT_LIKED":    "wishlist",
    "ADDED_TO_CART":    "cart",
    "CHECKOUT_STARTED": "checkout",
}

IDENTITY_SOURCES = (
    "anonymous",       # public browser event, no known customer
    "authenticated",   # authenticated customer session
    "checkout",        # server-trusted checkout flow
    "webhook",         # server-emitted (Stripe webhook -> ORDER_PAID)
    "newsletter",      # newsletter/signup form (explicit opt-in)
)


# ────────────────────────────────────────────────────────────────
# BEHAVIOR EVENT
# ────────────────────────────────────────────────────────────────
class BehaviorEventCreate(BaseModel):
    """Public request body — ONLY the fields a browser is allowed to send."""
    model_config = ConfigDict(extra="forbid")
    event_type: Literal[
        "PRODUCT_VIEWED", "PRODUCT_LIKED", "PRODUCT_UNLIKED",
        "ADDED_TO_CART", "REMOVED_FROM_CART",
    ]
    product_slug: str = Field(min_length=1, max_length=200)
    session_id: str = Field(min_length=8, max_length=128)
    # `source` is a free-form hint (e.g., "pdp", "cart-drawer"); NEVER used
    # for identity or trust decisions. Retained only for retention analytics.
    source: Optional[str] = Field(default=None, max_length=64)


class BehaviorEvent(BaseModel):
    """Persisted behavioral event. Append-only."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str
    product_slug: str
    session_id: str
    customer_email: Optional[str] = None
    identity_source: str = "anonymous"
    source: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # MongoDB TTL field. Only set for anonymous events (30-day expiry).
    # When identity is bound to the session, this field is $unset so the
    # event is retained.
    anon_expires_at: Optional[datetime] = None


# ────────────────────────────────────────────────────────────────
# PENDING RETENTION (per identity + product)
# ────────────────────────────────────────────────────────────────
class RetentionPending(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_email: str
    product_slug: str
    intent_level: int
    intent_kind: str  # browse | wishlist | cart | checkout
    first_seen_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_event_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    earliest_send_at: datetime
    status: str = "pending"  # pending | cancelled | sent | suppressed | expired
    cancelled_at: Optional[datetime] = None
    cancelled_reason: Optional[str] = None
    sent_at: Optional[datetime] = None
    sent_email_type: Optional[str] = None
    simulation_only: bool = True


# ────────────────────────────────────────────────────────────────
# CONSENT / SUPPRESSION
# ────────────────────────────────────────────────────────────────
CONSENT_SOURCES = (
    "newsletter_signup",
    "customer_register_optin",     # register form with EXPLICIT unchecked box
    "checkout_optin",              # checkout form with EXPLICIT unchecked box
    "reactivate_signup",
)

class MarketingConsent(BaseModel):
    """Records affirmative marketing consent per email. Absence of a row
    for a given email = NOT eligible. `Customer.marketing_consent==True`
    alone does NOT create a row here (per owner decision Q1=A)."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str  # lowercase
    marketing_eligible: bool = True
    marketing_consent_source: str
    marketing_consent_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    marketing_unsubscribed_at: Optional[datetime] = None
    unsubscribe_reason: Optional[str] = None


class EmailSuppression(BaseModel):
    """Hard suppression list — takes precedence over consent. Reasons:
    unsubscribe, hard-bounce, complaint, admin-suppress, invalid."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    reason: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ────────────────────────────────────────────────────────────────
# SEND LOG (frequency cap + simulation ledger)
# ────────────────────────────────────────────────────────────────
class BehaviorSendLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    email_type: str  # browse | wishlist | cart | checkout
    product_slug: str
    pending_id: str
    mode: str = "simulated"  # simulated | live
    subject_preview: str = ""
    resend_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
