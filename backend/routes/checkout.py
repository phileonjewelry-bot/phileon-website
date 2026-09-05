"""Phase 1 — Secure Stripe checkout (SCACCO MATTO pilot + Fine Jewelry expansion).
Trusted server-side pricing, idempotency, protected order-status lookup,
live-metal PRICE_MOVED contract for the 7 dynamic rings."""
import hashlib, hmac, json, logging, os, secrets
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel, ConfigDict, Field

from services.catalog import (
    resolve_line_item, compute_totals, CatalogError, is_supported,
    is_dynamic_priced, detect_price_move,
)
from services.shipping_zones import (
    ZONES,
    ShippingZoneError,
    resolve_zone_for_country,
    all_allowed_countries,
    build_stripe_shipping_option,
    signature_required_for_subtotal,
    CURRENCY as SHIPPING_CURRENCY,
)
from services import metal_spot
from services import fx_bnpl
from services.fx_display import SUPPORTED_DISPLAY_CURRENCIES
from models_orders import OrderV2, OrderV2Item, OrderV2Shipping, OrderV2Presentment, hash_status_token

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
    model_config = {"extra": "forbid"}
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
    # `extra="forbid"` — the client cannot inject shipping_amount, rate_cents,
    # zone_price, shipping_total, carrier_price, or any other monetary field.
    # Only ISO-3166-1 alpha-2 shipping_country and cart primitives are accepted.
    model_config = {"extra": "forbid"}
    items: List[CartItemIn]
    customer_email: Optional[str] = None
    idempotency_key: Optional[str] = None
    # Client acknowledges the trusted updated quote returned by a prior
    # PRICE_MOVED 409. Backend still re-verifies the market before creating
    # the Stripe session.
    price_move_acknowledged: bool = False
    # Destination country — non-monetary, ISO-3166-1 alpha-2. Required.
    # Validated server-side against the approved shipping-zone allowlist.
    shipping_country: str = Field(min_length=2, max_length=2)
    # Optional non-monetary flag: opt into the trusted CAD BNPL lane
    # (Klarna/Affirm Canada eligibility). NEVER trusts a client-supplied
    # rate or CAD amount — the backend derives them at session-create
    # using `services.fx_bnpl`. Ignored (fail-closed) when
    # `shipping_country != "CA"` or when no trusted FX snapshot is
    # available.
    use_cad_bnpl_lane: Optional[bool] = False
    # OPTIONAL non-monetary UX preference recording the display currency the
    # shopper had selected in the frontend when they submitted checkout.
    # ── STRICTLY DISPLAY-ONLY. It NEVER drives Stripe, shipping, tax, the
    # trusted amount, or the canonical order currency. Validated against
    # the server-approved allowlist; any other value is rejected.
    display_currency: Optional[str] = Field(default=None, min_length=3, max_length=3)


class ShippingQuoteIn(BaseModel):
    """Non-monetary destination lookup. The client sends ONLY the country;
    the backend returns a display-only trusted quote."""
    model_config = {"extra": "forbid"}
    country: str = Field(min_length=2, max_length=2)


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


# ────────────────────────────  Shipping · Phase 1  ─────────────────
@router.get("/shipping-countries")
async def shipping_countries():
    """Approved allowlist for the checkout country selector. Read-only."""
    countries = sorted(all_allowed_countries())
    zones = {
        key: {
            "display_name": z.display_name,
            "countries": sorted(z.countries),
            "delivery_estimate_business_days": list(z.delivery_estimate_business_days),
        }
        for key, z in ZONES.items()
    }
    return {"currency": SHIPPING_CURRENCY, "allowed_countries": countries, "zones": zones}


@router.post("/shipping-quote")
async def shipping_quote(body: ShippingQuoteIn):
    """Return a display-only trusted shipping quote for the given country.
    The response is authoritative but non-mutating — the client cannot
    influence any monetary value; the backend is the sole authority.
    """
    try:
        zone = resolve_zone_for_country(body.country)
    except ShippingZoneError as e:
        code = str(e) or "UNSUPPORTED_DESTINATION"
        raise HTTPException(status_code=400, detail={
            "code": code,
            "message": {
                "UNSUPPORTED_DESTINATION": "We do not ship to this destination.",
                "SHIPPING_ZONES_UNCONFIGURED": "Shipping is temporarily unavailable — please try again shortly.",
                "INVALID_COUNTRY_FORMAT": "Please provide a valid two-letter country code.",
            }.get(code, "Shipping quote unavailable."),
        })
    return {
        "country": body.country.upper(),
        "zone_key": zone.key,
        "rate_cents": zone.rate_cents,
        "currency": SHIPPING_CURRENCY,
        "service_label": zone.display_name,
        "carrier_label": zone.carrier_label,
        "delivery_estimate_business_days": list(zone.delivery_estimate_business_days),
        "insurance_required": zone.insurance_required,
        "supports_signature_confirmation": zone.supports_signature_confirmation,
    }


class BnplQuoteIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    # Non-monetary product identifiers only — the server resolves the
    # trusted USD subtotal + shipping. Client never sends a rate or a CAD
    # amount.
    items: List[CartItemIn] = Field(min_length=1)
    shipping_country: str = Field(min_length=2, max_length=2)


@router.post("/bnpl-quote")
async def bnpl_quote(body: BnplQuoteIn):
    """Return a trusted server-side CAD BNPL quote for the given cart +
    shipping country. Rate is snapshotted from `services.fx_bnpl` (the
    money-safe FX authority). NEVER accepts a client-supplied rate or
    CAD amount. Only available for shipping_country=CA."""
    country = body.shipping_country.upper()
    if country != "CA":
        raise HTTPException(status_code=400, detail={
            "code": "BNPL_CAD_REQUIRES_CA",
            "message": "The CAD BNPL lane is only available for Canadian shipping addresses.",
        })
    # Resolve canonical USD subtotal + trusted shipping the same way the
    # session endpoint does. Fail-closed on any resolver error.
    try:
        resolved = [resolve_line_item(
                        i.product_id, i.karat, i.metalColour, i.ringSize,
                        i.quantity, variant=i.variant, colorway=i.colorway,
                        tier=i.tier, wrist_size=i.wristSize,
                    ) for i in body.items]
    except CatalogError as e:
        raise HTTPException(status_code=400, detail={"code": str(e), "message": "Cart contains an item that cannot be priced."})
    try:
        zone = resolve_zone_for_country(country)
    except ShippingZoneError as e:
        raise HTTPException(status_code=400, detail={"code": str(e) or "UNSUPPORTED_DESTINATION",
                                                       "message": "We do not ship to this destination."})
    subtotal_cents = sum(int(r["unit_amount_cents"]) * int(r["quantity"]) for r in resolved)
    quote = fx_bnpl.build_bnpl_quote(
        usd_subtotal_cents=subtotal_cents,
        usd_shipping_cents=int(zone.rate_cents),
        usd_tax_cents=0,
    )
    if quote is None:
        raise HTTPException(status_code=503, detail={
            "code": "BNPL_FX_UNAVAILABLE",
            "message": "Financing is temporarily unavailable — please continue with card payment in USD.",
        })
    return quote


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
    # Shipping zone is resolved server-side from the client-supplied
    # non-monetary country. If the destination is not allowed, fail before
    # any Stripe call. `zone.rate_cents` is the trusted shipping amount.
    try:
        zone = resolve_zone_for_country(body.shipping_country)
    except ShippingZoneError as e:
        code = str(e) or "UNSUPPORTED_DESTINATION"
        raise HTTPException(status_code=400, detail={
            "code": code,
            "message": {
                "UNSUPPORTED_DESTINATION": "We do not ship to this destination.",
                "SHIPPING_ZONES_UNCONFIGURED": "Shipping is temporarily unavailable — please try again shortly.",
                "INVALID_COUNTRY_FORMAT": "Please provide a valid two-letter country code.",
            }.get(code, "Shipping unavailable."),
        })

    try:
        totals = compute_totals(resolved, shipping_cents=zone.rate_cents)
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
    # Validate optional display-currency UX preference. This never touches
    # money — only recorded on OrderV2 for audit.
    display_currency_normalized: Optional[str] = None
    if body.display_currency:
        cand = body.display_currency.strip().upper()
        if cand in SUPPORTED_DISPLAY_CURRENCIES:
            display_currency_normalized = cand
        else:
            raise HTTPException(status_code=400, detail={
                "code": "INVALID_DISPLAY_CURRENCY",
                "message": "Display currency is not supported.",
            })

    # ── Trusted CAD BNPL lane (optional). Fail-closed when preconditions
    # aren't met — normal USD flow continues below.
    bnpl_lane_active = False
    bnpl_quote = None
    if body.use_cad_bnpl_lane and body.shipping_country.upper() == "CA":
        bnpl_quote = fx_bnpl.build_bnpl_quote(
            usd_subtotal_cents=totals["subtotal_cents"],
            usd_shipping_cents=totals["shipping_cents"],
            usd_tax_cents=totals["tax_cents"],
        )
        if bnpl_quote is not None:
            bnpl_lane_active = True

    if existing:
        order = OrderV2(**existing)
    else:
        items = [OrderV2Item(**{k: v for k, v in r.items() if k != "currency"}) for r in resolved]
        # Trusted shipping snapshot at session-create. Reconciled with the
        # Stripe-collected values on `checkout.session.completed`.
        shipping_block = OrderV2Shipping(
            zone_key=zone.key,
            country=body.shipping_country.upper(),
            service_label=zone.display_name,
            carrier_label=zone.carrier_label,
            signature_required=signature_required_for_subtotal(totals["subtotal_cents"], zone),
            insurance_required=zone.insurance_required,
        )
        presentment_block = None
        if display_currency_normalized or bnpl_quote is not None:
            fields = {}
            if display_currency_normalized:
                fields["display_currency_selected_at_session"] = display_currency_normalized
            if bnpl_quote is not None:
                # BNPL lane will price in CAD when eligible. Persist the
                # trusted server-side snapshot on OrderV2 so support can
                # audit the rate/source used.
                fields.update({
                    "lane": "bnpl_cad",
                    "presentment_currency": bnpl_quote["presentment_currency"],
                    "presentment_subtotal_cents": bnpl_quote["presentment_subtotal_cents"],
                    "presentment_shipping_cents": bnpl_quote["presentment_shipping_cents"],
                    "presentment_tax_cents": bnpl_quote["presentment_tax_cents"],
                    "presentment_total_cents": bnpl_quote["presentment_total_cents"],
                    "fx_rate": bnpl_quote["fx_rate"],
                    "fx_rate_source": bnpl_quote["fx_source"],
                    "fx_retrieved_at": bnpl_quote["fx_retrieved_at"],
                    "fx_reference_date": bnpl_quote["fx_reference_date"],
                    "fx_is_stale": bnpl_quote["fx_is_stale"],
                })
            presentment_block = OrderV2Presentment(**fields)
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
            email_status_token=status_token,
            shipping=shipping_block,
            presentment=presentment_block,
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

    # ── OPTIONAL: trusted CAD BNPL lane already resolved above. Line-item
    # currency + shipping option currency will be overridden below when
    # `bnpl_lane_active` is True.

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

    # Trusted shipping — destination-driven zone. Always canonical USD.
    trusted_shipping_option = build_stripe_shipping_option(body.shipping_country)

    # If the BNPL lane is active, override BOTH the Stripe line-item
    # currency AND the shipping option currency with the trusted CAD
    # snapshot amounts. Line-item allocation preserves canonical USD-cent
    # proportions so the sum matches the FX-quoted CAD subtotal exactly.
    if bnpl_lane_active and bnpl_quote is not None:
        canonical_sub = int(bnpl_quote["canonical_subtotal_cents"])
        cad_sub_target = int(bnpl_quote["presentment_subtotal_cents"])
        # Deterministic allocator: convert each line's canonical value with
        # the same snapshot, then apply the residual to the last line so
        # the sum equals `cad_sub_target` exactly.
        allocated = []
        running = 0
        for r in resolved:
            line_canonical = int(r["unit_amount_cents"]) * int(r["quantity"])
            line_cad_total = fx_bnpl.convert_usd_cents_to_cad_cents(
                line_canonical,
                snapshot={"rate": __import__("decimal").Decimal(bnpl_quote["fx_rate_decimal"]),
                          "provider": bnpl_quote["fx_source"]},
            ) or 0
            running += line_cad_total
            allocated.append(line_cad_total)
        # Distribute the residual on the LAST line to hit the exact target.
        residual = cad_sub_target - running
        if allocated:
            allocated[-1] += residual
        line_items = []
        for r, line_cad in zip(resolved, allocated):
            qty = int(r["quantity"])
            unit_cad = line_cad // qty
            remainder = line_cad - unit_cad * qty
            # Attach any remainder as a single 1-qty micro-item so unit
            # prices stay integer and the sum matches exactly. In practice
            # remainder is < qty (≤ a few cents CAD).
            line_items.append({
                "price_data": {
                    "currency": "cad",
                    "product_data": {
                        "name": f"{r['product_name']} — {r['subtitle']}",
                        "description": r["variant"],
                        "metadata": (r.get("metadata") or {"sku": r["sku"], "internal_product_id": r["product_id"]}),
                    },
                    "unit_amount": unit_cad,
                },
                "quantity": qty,
            })
            if remainder != 0:
                line_items.append({
                    "price_data": {
                        "currency": "cad",
                        "product_data": {"name": f"{r['product_name']} — rounding adjustment"},
                        "unit_amount": remainder,
                    },
                    "quantity": 1,
                })
        trusted_shipping_option = build_stripe_shipping_option(
            body.shipping_country,
            currency_override="cad",
            rate_cents_override=int(bnpl_quote["presentment_shipping_cents"]),
        )

    session_kwargs = dict(
        mode="payment",
        line_items=line_items,
        success_url=f"{success_url}?order={order.order_number}&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{cancel_url}?order={order.order_number}",
        customer_email=body.customer_email,
        billing_address_collection="required",
        shipping_address_collection={"allowed_countries": [body.shipping_country.upper()]},
        shipping_options=[trusted_shipping_option],
        # Stripe Adaptive Pricing — customer is charged in their local
        # currency when eligible. Falls back to canonical USD when Stripe
        # deems ineligible. Server never quotes the local amount; only
        # Stripe does.
        adaptive_pricing={"enabled": True},
        metadata={"internal_order_id": order.id, "public_order_number": order.order_number},
    )

    try:
        # `automatic_payment_methods` is only accepted on newer Stripe API
        # versions; when the installed SDK / configured API version rejects
        # it, retry once with Stripe's default payment-method behaviour so
        # the Checkout Session still creates safely with the same trusted
        # amount, currency, and metadata.
        try:
            session = stripe.checkout.Session.create(
                automatic_payment_methods={"enabled": True, "allow_redirects": "always"},
                idempotency_key=hashlib.sha256(f"session:{idem}".encode()).hexdigest(),
                **session_kwargs,
            )
        except stripe.error.InvalidRequestError as ire:  # type: ignore
            err_txt = str(getattr(ire, "param", "") or "") + str(ire)
            if "adaptive_pricing" in err_txt:
                # Account or API version doesn't support Adaptive Pricing —
                # drop the flag and retry with the same trusted amount.
                session_kwargs.pop("adaptive_pricing", None)
                session = stripe.checkout.Session.create(
                    automatic_payment_methods={"enabled": True, "allow_redirects": "always"},
                    idempotency_key=hashlib.sha256(f"session-noap:{idem}".encode()).hexdigest(),
                    **session_kwargs,
                )
            elif "automatic_payment_methods" in err_txt:
                session = stripe.checkout.Session.create(
                    idempotency_key=hashlib.sha256(f"session-apm-off:{idem}".encode()).hexdigest(),
                    **session_kwargs,
                )
            else:
                raise
    except stripe.error.StripeError as e:  # type: ignore
        logger.error(f"Stripe error: {type(e).__name__}")
        raise HTTPException(status_code=502, detail={"code": "STRIPE_ERROR", "message": "Payment provider error."})
    except TypeError:
        # Older SDK signature: fall back without keyword-only extras.
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
    issued at session creation (compared against a stored hash). Never
    exposes Stripe IDs, webhook metadata, FX metadata, or internal DB IDs."""
    db = get_db()
    doc = await db.orders_v2.find_one({"order_number": order_number}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
    if hash_status_token(token) != doc.get("status_token_hash"):
        raise HTTPException(status_code=403, detail={"code": "INVALID_TOKEN"})
    # Choose the customer-facing charged amount: presentment (BNPL CAD /
    # Adaptive Pricing) if available, else canonical USD.
    charged_currency = doc.get("currency") or "USD"
    charged_amount_cents = int(doc.get("total_cents") or 0)
    presentment = doc.get("presentment") or {}
    if isinstance(presentment, dict):
        p_cur = presentment.get("presentment_currency") or presentment.get("stripe_presentment_currency")
        p_amt = presentment.get("presentment_total_cents") or presentment.get("stripe_presentment_amount_cents")
        if p_cur and p_amt is not None:
            charged_currency = str(p_cur).upper()
            charged_amount_cents = int(p_amt)
    shipping = doc.get("shipping") or {}
    return {
        "order_number": doc["order_number"],
        "payment_status": doc["payment_status"],
        "fulfilment_status": doc.get("fulfilment_status"),
        "fulfillment_status": doc.get("fulfillment_status"),
        "fulfillment_type": doc.get("fulfillment_type"),
        "dispatch_estimate": doc.get("dispatch_estimate") or "Production timing confirmed after order.",
        "charged_currency": charged_currency,
        "charged_amount_cents": charged_amount_cents,
        "canonical_currency": doc.get("currency") or "USD",
        "canonical_total_cents": int(doc.get("total_cents") or 0),
        "shipping": {
            "country": shipping.get("country"),
            "service_label": shipping.get("service_label"),
        },
        "carrier": doc.get("carrier"),
        "tracking_number": doc.get("tracking_number"),
        "tracking_url": doc.get("tracking_url"),
        "shipped_at": doc.get("shipped_at").isoformat() if isinstance(doc.get("shipped_at"), datetime) else doc.get("shipped_at"),
        "items": [{"product_name": i["product_name"], "variant": i.get("variant"),
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
