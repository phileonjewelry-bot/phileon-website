"""Phase 1 — Secure Stripe checkout (SCACCO MATTO pilot + Fine Jewelry expansion).
Trusted server-side pricing, idempotency, protected order-status lookup,
live-metal PRICE_MOVED contract for the 7 dynamic rings."""
import hashlib, hmac, json, logging, os, secrets
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel, Field

from services.catalog import (
    resolve_line_item, compute_totals, CatalogError, is_supported,
    is_dynamic_priced, detect_price_move,
)
from services import metal_spot
from models_orders import OrderV2, OrderV2Item, hash_status_token

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/checkout", tags=["checkout-v2"])

def get_db():
    from server import db
    return db

def _cfg(name: str, default=None):
    v = os.environ.get(name, default)
    return v.strip() if isinstance(v, str) else v


class PaymentConfigError(HTTPException):
    """Fail-closed payment configuration error. Never leaks key contents."""
    def __init__(self, code: str, message: str):
        super().__init__(status_code=503, detail={"code": code, "message": message})


def _payment_configured() -> bool:
    return bool(_cfg("STRIPE_SECRET_KEY") and _cfg("STRIPE_WEBHOOK_SECRET"))


def _resolve_stripe_mode() -> str:
    mode = (_cfg("STRIPE_MODE") or "test").lower()
    if mode not in ("test", "live"):
        raise PaymentConfigError(
            "PAYMENT_MISCONFIGURED",
            "STRIPE_MODE must be 'test' or 'live'.",
        )
    return mode


def _validate_stripe_config() -> str:
    """Fail-closed environment/key compatibility check.

    Rules (never logs or returns the key itself):
      • STRIPE_MODE must be 'test' or 'live' (defaults to 'test' when unset).
      • STRIPE_SECRET_KEY must be present and start with the mode-appropriate
        prefix — 'sk_test_' in test mode, 'sk_live_' in live mode.
      • STRIPE_WEBHOOK_SECRET must be present and start with 'whsec_'
        (Stripe does not distinguish test vs live in the whsec_ prefix, so
        we only verify shape, per the brief's `where reliably determinable`
        clause).
      • Rejects mixed-environment ('test' mode + sk_live_… or vice versa).
      • Rejects missing / malformed keys.
    Returns the resolved mode string.
    """
    mode = _resolve_stripe_mode()
    secret = _cfg("STRIPE_SECRET_KEY") or ""
    whsec = _cfg("STRIPE_WEBHOOK_SECRET") or ""
    if not secret or not whsec:
        raise PaymentConfigError(
            "PAYMENT_NOT_CONFIGURED",
            "Payment service is not configured.",
        )
    expected_secret_prefix = "sk_live_" if mode == "live" else "sk_test_"
    if not secret.startswith(expected_secret_prefix):
        # Never include the key or its length in the response/log.
        raise PaymentConfigError(
            "PAYMENT_MODE_MISMATCH",
            f"Configured Stripe key does not match STRIPE_MODE={mode}.",
        )
    if not whsec.startswith("whsec_"):
        raise PaymentConfigError(
            "PAYMENT_MISCONFIGURED",
            "Stripe webhook secret is malformed.",
        )
    return mode


def _require_payment_config():
    """Preserved public name. Now delegates to the fail-closed validator."""
    _validate_stripe_config()


def _stripe():
    _validate_stripe_config()
    import stripe
    stripe.api_key = _cfg("STRIPE_SECRET_KEY")
    return stripe


class CartItemIn(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=5)
    karat: Optional[str] = None
    metalColour: Optional[str] = None
    ringSize: Optional[str] = None
    # New optional variant descriptors — only consumed by the trusted server
    # catalog; client-supplied price/currency values are NEVER trusted.
    variant: Optional[str] = None      # e.g. RRE tier key: "plated" / "10k" / "14k" / "18k"
    colorway: Optional[str] = None     # e.g. QUADRIGA: "red-black" / "black-red" / …
    tier: Optional[str] = None         # dynamic-ring tier key (foundation/signature/heirloom/…)
    wristSize: Optional[str] = None    # CRESTA NERA wrist size id: small / medium / large / xl
    # Client-side snapshot of the price shown at Add-to-Cart. NEVER trusted for
    # payment. Used only to detect price movement between add-to-cart and
    # checkout for live-priced items.
    displayed_unit_amount_cents: Optional[int] = Field(default=None, ge=0)


class StripeSessionIn(BaseModel):
    items: List[CartItemIn]
    customer_email: Optional[str] = None
    idempotency_key: Optional[str] = None
    # Client acknowledges the trusted updated quote returned by a prior
    # PRICE_MOVED 409. Backend still re-verifies the market before creating
    # the Stripe session.
    price_move_acknowledged: bool = False


async def _ensure_indexes(db):
    try:
        await db.orders_v2.create_index("idempotency_key", unique=True)
        await db.orders_v2.create_index("order_number", unique=True)
        await db.orders_v2.create_index("provider_session_id")
        await db.orders_v2.create_index("status_token_hash")
        await db.orders_v2.create_index("created_at")
        await db.webhook_events.create_index([("provider", 1), ("event_id", 1)], unique=True)
    except Exception as e:
        logger.warning(f"index creation warning: {e}")


def _cart_fingerprint(items: List[CartItemIn]) -> str:
    payload = json.dumps([i.model_dump() for i in items], sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()[:20]


@router.post("/stripe/session")
async def create_stripe_session(body: StripeSessionIn, request: Request,
                                idempotency_header: Optional[str] = Header(None, alias="Idempotency-Key")):
    _require_payment_config()
    db = get_db()
    await _ensure_indexes(db)

    # 1. Guard: every product must be listed in the trusted catalog.
    for it in body.items:
        if not is_supported(it.product_id):
            raise HTTPException(status_code=400, detail={
                "code": "UNSUPPORTED_PRODUCT",
                "message": f"Product '{it.product_id}' cannot be purchased through this flow yet."})
    if not body.items:
        raise HTTPException(status_code=400, detail={"code": "EMPTY_CART", "message": "Cart is empty."})

    # 1b. If any item is live-priced, fetch a trusted market snapshot and
    # enforce checkout-safe age (fresh ≤10m or stale-but-usable ≤30m).
    needs_market = any(is_dynamic_priced(it.product_id) for it in body.items)
    market_snapshot = None
    if needs_market:
        market_snapshot = metal_spot.get_spot()
        if not metal_spot.is_checkout_safe(market_snapshot):
            raise HTTPException(status_code=503, detail={
                "code": "LIVE_PRICE_UNAVAILABLE",
                "message": "We’re refreshing current precious-metal pricing. Please try again shortly."})

    # 2. Resolve every item from trusted catalog.
    try:
        resolved = [resolve_line_item(
                        i.product_id, i.karat, i.metalColour, i.ringSize,
                        i.quantity, variant=i.variant, colorway=i.colorway,
                        tier=i.tier, market_snapshot=market_snapshot,
                        wrist_size=i.wristSize,
                    ) for i in body.items]
    except CatalogError as e:
        msg = str(e)
        if msg.startswith("LIVE_PRICE_UNAVAILABLE"):
            raise HTTPException(status_code=503, detail={
                "code": "LIVE_PRICE_UNAVAILABLE",
                "message": "We’re refreshing current precious-metal pricing. Please try again shortly."})
        raise HTTPException(status_code=400, detail={"code": "VALIDATION", "message": msg})

    # 2a. Live-price movement detection. Compare each dynamic-priced item's
    # trusted server price vs the client-supplied displayed snapshot. If any
    # exceeds the threshold, return 409 PRICE_MOVED and do NOT reach Stripe.
    moved_items = []
    for it_in, r in zip(body.items, resolved):
        if not is_dynamic_priced(it_in.product_id):
            continue
        move = detect_price_move(it_in.displayed_unit_amount_cents, r["unit_amount_cents"])
        if move is not None:
            moved_items.append({
                "product_slug": r["product_id"],
                "variant": r["variant"],
                "currency": r["currency"],
                **move,
            })
    if moved_items and not body.price_move_acknowledged:
        raise HTTPException(status_code=409, detail={
            "code": "PRICE_MOVED",
            "message": "Live precious-metal pricing has moved since this item was added to cart.",
            "items": moved_items,
        })
    # If the customer acknowledged a previous quote, verify the LATEST trusted
    # price is still within threshold of what they were shown. If it moved
    # again, surface PRICE_MOVED once more — no race-condition bypass.
    if moved_items and body.price_move_acknowledged:
        # `displayed_unit_amount_cents` sent by the client on the retry MUST
        # be the last trusted price we returned in the prior 409 response.
        # A second movement means the market shifted again in flight.
        raise HTTPException(status_code=409, detail={
            "code": "PRICE_MOVED",
            "message": "Live precious-metal pricing moved again while confirming the previous update.",
            "items": moved_items,
        })

    # 2b. Backend-authoritative mixed-currency guard — reject BEFORE Stripe.
    try:
        totals = compute_totals(resolved)
    except CatalogError as e:
        msg = str(e)
        if msg.startswith("MIXED_CURRENCY_CART"):
            raise HTTPException(status_code=400, detail={
                "code": "MIXED_CURRENCY_CART",
                "message": "Items priced in different currencies must be purchased separately."})
        raise HTTPException(status_code=400, detail={"code": "VALIDATION", "message": msg})

    # 3. Idempotency: caller-provided key OR (email + cart fingerprint)
    idem = (body.idempotency_key or idempotency_header or
            f"{(body.customer_email or 'anon').lower()}:{_cart_fingerprint(body.items)}")

    # 4. Try to atomically create the pending OrderV2 (unique index on idempotency_key)
    existing = await db.orders_v2.find_one({"idempotency_key": idem})
    if existing:
        # Conflict check: same key + different cart → 409
        if int(existing["total_cents"]) != int(totals["total_cents"]):
            raise HTTPException(status_code=409, detail={
                "code": "IDEMPOTENCY_CONFLICT",
                "message": "Idempotency key already used with different cart contents."})
        if existing.get("provider_session_url"):
            return {"checkout_url": existing["provider_session_url"],
                    "order_number": existing["order_number"],
                    "status_token": None,  # only issued once at creation; not re-emitted
                    "reused": True}

    status_token = secrets.token_urlsafe(32) if not existing else None
    if existing:
        order = OrderV2(**existing)
    else:
        items = [OrderV2Item(**{k: v for k, v in r.items() if k != "currency"}) for r in resolved]
        order = OrderV2(
            idempotency_key=idem,
            customer_email=body.customer_email,
            items=items,
            subtotal_cents=totals["subtotal_cents"],
            shipping_cents=totals["shipping_cents"],
            tax_cents=totals["tax_cents"],
            total_cents=totals["total_cents"],
            currency=totals["currency"],
            status_token_hash=hash_status_token(status_token),
        )
        try:
            await db.orders_v2.insert_one(order.model_dump(mode="json"))
        except Exception as e:
            # Race: another request beat us — reload
            existing = await db.orders_v2.find_one({"idempotency_key": idem})
            if not existing:
                raise HTTPException(status_code=500, detail={"code": "ORDER_PERSIST_FAILED", "message": str(e)})
            order = OrderV2(**existing)
            status_token = None

    # 5. Create Stripe Checkout Session with Dynamic Payment Methods
    stripe = _stripe()
    success_url = _cfg("CHECKOUT_SUCCESS_URL", "https://labete-gallery.preview.emergentagent.com/checkout/success")
    cancel_url  = _cfg("CHECKOUT_CANCEL_URL",  "https://labete-gallery.preview.emergentagent.com/checkout/cancel")

    line_items = [{
        "price_data": {
            "currency": totals["currency"].lower(),
            "product_data": {"name": f"{r['product_name']} — {r['subtitle']}",
                             "description": r["variant"],
                             "metadata": (r.get("metadata") or {"sku": r["sku"], "internal_product_id": r["product_id"]})},
            "unit_amount": r["unit_amount_cents"],
        },
        "quantity": r["quantity"],
    } for r in resolved]

    # ── Shipping — approved PHILEON policy ─────────────────────────────
    # Canada: free standard shipping (Canada Post + UPS).
    # United States: shipping is calculated at checkout via UPS/FedEx —
    #   dynamic-rate integration is NOT yet wired, so US destinations are
    #   deliberately blocked at Stripe until that integration lands.
    # International: DHL/UPS/FedEx where available — same story, blocked
    #   at Stripe until dynamic rates are wired.
    # Duties, taxes and brokerage remain the customer's responsibility per
    # the published Shipping trust page — no prepayment collected here.
    canada_free_shipping = {
        "shipping_rate_data": {
            "type": "fixed_amount",
            "display_name": "Standard Shipping — Canada",
            "fixed_amount": {"amount": 0, "currency": totals["currency"].lower()},
            "delivery_estimate": {
                "minimum": {"unit": "business_day", "value": 2},
                "maximum": {"unit": "business_day", "value": 7},
            },
        },
    }

    session_kwargs = dict(
        mode="payment",
        line_items=line_items,
        success_url=f"{success_url}?order={order.order_number}&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{cancel_url}?order={order.order_number}",
        customer_email=body.customer_email,
        billing_address_collection="required",
        shipping_address_collection={"allowed_countries": ["CA"]},
        shipping_options=[canada_free_shipping],
        metadata={"internal_order_id": order.id, "public_order_number": order.order_number},
    )

    try:
        session = stripe.checkout.Session.create(
            automatic_payment_methods={"enabled": True, "allow_redirects": "always"},
            idempotency_key=hashlib.sha256(f"session:{idem}".encode()).hexdigest(),
            **session_kwargs,
        )
    except stripe.error.StripeError as e:  # type: ignore
        logger.error(f"Stripe error: {type(e).__name__}")
        raise HTTPException(status_code=502, detail={"code": "STRIPE_ERROR", "message": "Payment provider error."})
    except TypeError:
        # Older SDK without automatic_payment_methods: fall back gracefully.
        session = stripe.checkout.Session.create(**session_kwargs)

    await db.orders_v2.update_one({"id": order.id}, {"$set": {
        "provider_session_id": session.id,
        "provider_session_url": session.url,
    }})

    return {"checkout_url": session.url, "order_number": order.order_number,
            "status_token": status_token, "reused": False}


@router.get("/order/{order_number}/status")
async def order_status(order_number: str, token: str, session_id: Optional[str] = None):
    """Protected order status lookup. Requires the one-time status token
    issued at session creation (compared against a stored hash)."""
    db = get_db()
    doc = await db.orders_v2.find_one({"order_number": order_number}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    if hash_status_token(token) != doc.get("status_token_hash"):
        raise HTTPException(status_code=403, detail={"code": "INVALID_TOKEN"})
    # Safe response — no addresses, no provider objects, no metadata
    return {
        "order_number": doc["order_number"],
        "payment_status": doc["payment_status"],
        "fulfilment_status": doc["fulfilment_status"],
        "currency": doc["currency"],
        "total_cents": doc["total_cents"],
        "items": [{"product_name": i["product_name"], "variant": i["variant"],
                   "quantity": i["quantity"], "unit_amount_cents": i["unit_amount_cents"]}
                  for i in doc["items"]],
    }


@router.get("/health")
async def health():
    """Payment health — reports credentials_present, stripe_api_verified,
    webhook_secret_present, and mode. Never exposes secret values."""
    credentials_present = bool(_cfg("STRIPE_SECRET_KEY"))
    webhook_secret_present = bool(_cfg("STRIPE_WEBHOOK_SECRET"))
    api_verified = False
    api_error_code = None
    if credentials_present:
        try:
            import stripe
            stripe.api_key = _cfg("STRIPE_SECRET_KEY")
            # Lightweight verification: retrieve account balance metadata.
            stripe.Balance.retrieve()
            api_verified = True
        except Exception as e:
            # Report a short error code, never the key or prefix.
            api_error_code = type(e).__name__
    return {
        "credentials_present": credentials_present,
        "webhook_secret_present": webhook_secret_present,
        "stripe_api_verified": api_verified,
        "stripe_api_error_code": api_error_code,
        "mode": _cfg("STRIPE_MODE", "test"),
        "supported_products": sorted(list(_SUPPORTED_SLUGS_FOR_HEALTH)),
    }


# Health-report list mirrors services.catalog._SUPPORTED_SLUGS. Kept as a
# private constant so the health endpoint isn't lying about coverage.
from services.catalog import _SUPPORTED_SLUGS as _SUPPORTED_SLUGS_FOR_HEALTH  # noqa: E402
