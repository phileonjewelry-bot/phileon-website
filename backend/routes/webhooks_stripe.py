"""Phase 1 — Stripe webhook receiver. Signature-verified, deduped, idempotent."""
import logging, os
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Request

from services.shipping_zones import (
    resolve_zone_for_country,
    ShippingZoneError,
    signature_required_for_subtotal,
    looks_like_po_box,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def get_db():
    from server import db
    return db


def _cfg(name):
    v = os.environ.get(name)
    return v.strip() if isinstance(v, str) else v


def _extract_shipping_details(session: dict) -> dict:
    """Return the Stripe `shipping_details` block regardless of API version.
    Post-2024 Stripe API versions moved the block to
    `collected_information.shipping_details`; earlier versions expose it at
    `shipping_details`. Return an empty dict when neither is present.
    """
    ci = session.get("collected_information") or {}
    return ci.get("shipping_details") or session.get("shipping_details") or {}


def _extract_shipping_amount_cents(session: dict) -> int:
    """Return the Stripe-computed shipping amount in cents. Reads
    `shipping_cost.amount_total` first, falls back to
    `total_details.amount_shipping`. Returns 0 when neither is present."""
    sc = session.get("shipping_cost") or {}
    amt = sc.get("amount_total")
    if amt is None:
        amt = (session.get("total_details") or {}).get("amount_shipping")
    try:
        return int(amt or 0)
    except (TypeError, ValueError):
        return 0


def _extract_payment_method_type(payment_intent: Optional[dict]) -> Optional[str]:
    """Return the Stripe-authoritative payment method type used for this
    payment (e.g. `card`, `klarna`, `affirm`, `apple_pay`, `google_pay`,
    `link`). Reads `charges.data[0].payment_method_details.type` first
    (populated after payment succeeds), then falls back to
    `payment_method_types[0]` (a hint from the session; less specific).

    NEVER trusted for money math — audit/support only.
    """
    if not isinstance(payment_intent, dict):
        return None
    charges = payment_intent.get("charges")
    charges_data = None
    if isinstance(charges, dict):
        charges_data = charges.get("data")
    elif isinstance(charges, list):
        charges_data = charges
    if isinstance(charges_data, list) and charges_data:
        pmd = (charges_data[0] or {}).get("payment_method_details") or {}
        t = pmd.get("type")
        if isinstance(t, str) and t:
            return t
    types = payment_intent.get("payment_method_types")
    if isinstance(types, list) and types:
        first = types[0]
        if isinstance(first, str) and first:
            return first
    return None


def _extract_stripe_presentment(session: dict, payment_intent: Optional[dict] = None) -> dict:
    """Defensive Adaptive Pricing / presentment extractor.

    Stripe API responses can carry the customer-charged (presentment)
    currency + amount in several places depending on Adaptive Pricing
    eligibility and API version. This reader is intentionally tolerant
    and returns whatever authoritative Stripe fields are actually
    populated. It NEVER derives values from client input or from the
    storefront FX snapshot.

    Return shape:
        {
          "presentment_currency": Optional[str],       # upper-case ISO
          "presentment_amount_cents": Optional[int],
          "extraction_source": Optional[str],          # audit trail
        }

    A non-None `presentment_currency` DIFFERENT from `session.currency`
    signals that Stripe actually charged in a local currency. When they
    match (or presentment is absent), the customer paid in USD.
    """
    if not isinstance(session, dict):
        session = {}

    presentment_currency: Optional[str] = None
    presentment_amount: Optional[int] = None
    source: Optional[str] = None

    # 1) Modern Adaptive Pricing surfaces `presentment_details` on the
    # Checkout Session and on the PaymentIntent. Prefer session first.
    for parent, tag in ((session, "session.presentment_details"),
                         (payment_intent or {}, "payment_intent.presentment_details")):
        pd = parent.get("presentment_details") if isinstance(parent, dict) else None
        if isinstance(pd, dict):
            cur = pd.get("presentment_currency") or pd.get("currency")
            amt = pd.get("presentment_amount") or pd.get("amount")
            if cur:
                presentment_currency = str(cur).upper()
                if amt is not None:
                    try:
                        presentment_amount = int(amt)
                    except (TypeError, ValueError):
                        pass
                source = tag
                break

    # 2) Legacy `currency_conversion` (Adaptive Pricing preview era). Kept
    # only as a last-resort read for older orders. Never primary.
    if presentment_currency is None:
        cc = session.get("currency_conversion")
        if isinstance(cc, dict):
            cur = cc.get("customer_currency") or cc.get("currency")
            amt = cc.get("amount_total") or cc.get("amount")
            if cur:
                presentment_currency = str(cur).upper()
                if amt is not None:
                    try:
                        presentment_amount = int(amt)
                    except (TypeError, ValueError):
                        pass
                source = "session.currency_conversion"

    return {
        "presentment_currency": presentment_currency,
        "presentment_amount_cents": presentment_amount,
        "extraction_source": source,
    }


def _build_presentment_block(session: dict, payment_intent: Optional[dict],
                              canonical_total_cents: int, canonical_currency: str) -> Optional[dict]:
    """Build the `OrderV2.presentment` update block from Stripe truth.
    Returns `None` when Stripe reports no non-USD presentment (customer
    was charged in USD). Never invents values.
    """
    p = _extract_stripe_presentment(session, payment_intent)
    cur = p.get("presentment_currency")
    amt = p.get("presentment_amount_cents")
    if not cur:
        return None
    # If Stripe explicitly presented in the canonical currency, treat as
    # "no adaptive presentment" — nothing new to persist.
    if cur == (canonical_currency or "").upper() and (amt is None or amt == int(canonical_total_cents)):
        return None
    block: dict = {
        "stripe_presentment_currency": cur,
        "stripe_presentment_amount_cents": amt,
        "presentment_currency": cur,
        "presentment_total_cents": amt,
        "fx_rate_source": "stripe.adaptive_pricing",
        "extraction_source": p.get("extraction_source"),
    }
    # Authoritative FX rate = presentment/base. Only compute when both
    # sides are non-zero to avoid divide-by-zero.
    try:
        if amt is not None and int(canonical_total_cents) > 0:
            block["fx_rate"] = round(float(amt) / float(canonical_total_cents), 6)
    except Exception:
        pass
    return block


def _build_shipping_reconciliation(session: dict, order: dict) -> dict:
    """Compute the trusted `OrderV2Shipping` update block + `shipping_cents`
    from a Stripe Session. Never mutates the database — the caller decides
    whether to persist. Uses server-side zone resolution against the
    Stripe-collected country. Returns:
        {
          "shipping_cents": int,          # Stripe-computed amount, NEVER client-supplied
          "shipping": dict,                # OrderV2Shipping fields (address, service, etc.)
          "integrity_mismatch": bool,      # True when Stripe amount != trusted zone rate
          "trusted_zone_cents": int,       # server-resolved zone amount (or 0 if unresolved)
        }
    """
    sd = _extract_shipping_details(session)
    addr = sd.get("address") or {}
    country = (addr.get("country") or "").upper() or None
    recipient = sd.get("name")

    sc = session.get("shipping_cost") or {}
    sr = sc.get("shipping_rate") if isinstance(sc.get("shipping_rate"), dict) else None
    stripe_rate_id = (sr or {}).get("id") if isinstance(sr, dict) else sc.get("shipping_rate")
    service_label = (sr or {}).get("display_name") if isinstance(sr, dict) else None

    stripe_amt = _extract_shipping_amount_cents(session)

    trusted_zone_cents = 0
    trusted_service_label = None
    trusted_carrier_label = None
    trusted_insurance_required = None
    signature_required = None
    try:
        zone = resolve_zone_for_country(country) if country else None
    except ShippingZoneError:
        zone = None
    if zone is not None:
        trusted_zone_cents = zone.rate_cents
        trusted_service_label = zone.display_name
        trusted_carrier_label = zone.carrier_label
        trusted_insurance_required = zone.insurance_required
        signature_required = signature_required_for_subtotal(int(order.get("subtotal_cents") or 0), zone)

    integrity_mismatch = (zone is None) or (stripe_amt != trusted_zone_cents)

    shipping_block = {
        "zone_key": zone.key if zone else None,
        "country": country,
        "address_snapshot": addr or None,
        "recipient_name": recipient,
        "service_label": service_label or trusted_service_label,
        "carrier_label": trusted_carrier_label,
        "stripe_shipping_rate_id": stripe_rate_id,
        "signature_required": signature_required,
        "insurance_required": trusted_insurance_required,
        "po_box_flag": looks_like_po_box(addr.get("line1") or ""),
    }
    # Filter out keys whose value is None so we don't overwrite an existing
    # trusted field with a null read from Stripe.
    shipping_block = {k: v for k, v in shipping_block.items() if v is not None}

    return {
        "shipping_cents": stripe_amt,
        "shipping": shipping_block,
        "integrity_mismatch": integrity_mismatch,
        "trusted_zone_cents": trusted_zone_cents,
    }


@router.post("/stripe")
async def stripe_webhook(request: Request):
    secret = _cfg("STRIPE_WEBHOOK_SECRET")
    if not secret:
        raise HTTPException(status_code=503, detail={"code": "PAYMENT_NOT_CONFIGURED"})

    import stripe
    stripe.api_key = _cfg("STRIPE_SECRET_KEY")

    raw = await request.body()  # untouched raw body — required for signature verification
    sig = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(raw, sig, secret)
    except ValueError:
        raise HTTPException(status_code=400, detail={"code": "INVALID_PAYLOAD"})
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail={"code": "INVALID_SIGNATURE"})

    db = get_db()

    # Dedup: unique index on (provider, event_id) — atomic reservation
    try:
        await db.webhook_events.insert_one({
            "provider": "stripe",
            "event_id": event["id"],
            "type": event["type"],
            "received_at": datetime.now(timezone.utc),
        })
    except Exception:
        # Duplicate delivery — return 200 without re-processing
        logger.info(f"Duplicate Stripe webhook ignored: {event['id']}")
        return {"received": True, "duplicate": True}

    etype = event["type"]
    obj = event["data"]["object"]

    async def _find_order():
        md = obj.get("metadata") or {}
        oid = md.get("internal_order_id")
        if oid:
            o = await db.orders_v2.find_one({"id": oid})
            if o: return o
        sid = obj.get("id") if etype.startswith("checkout.session") else obj.get("checkout_session")
        if sid:
            return await db.orders_v2.find_one({"provider_session_id": sid})
        pi = obj.get("payment_intent") or (obj.get("id") if etype.startswith("payment_intent") else None)
        if pi:
            return await db.orders_v2.find_one({"provider_payment_intent_id": pi})
        return None

    order = await _find_order()

    if etype == "checkout.session.completed":
        if not order:
            logger.error(f"Order not found for session {obj.get('id')}")
            return {"received": True, "unmatched": True}
        # Only mark paid when Stripe verifies payment_status = 'paid'
        paid = obj.get("payment_status") == "paid"
        # Retrieve the full session with API-version-agnostic expansions so
        # we can reconcile Stripe's shipping amount + address regardless of
        # API version. Read-only — never mutates Stripe.
        try:
            sess_full = stripe.checkout.Session.retrieve(
                obj.get("id"),
                expand=[
                    "shipping_cost.shipping_rate",
                    "shipping_details",
                    "collected_information.shipping_details",
                ],
            )
        except Exception as e:  # never break the webhook on retrieve
            logger.warning(f"stripe session retrieve failed for {obj.get('id')}: {type(e).__name__}")
            sess_full = obj  # fall back to the raw event object
        recon = _build_shipping_reconciliation(dict(sess_full or {}), order)
        # Extract Stripe Adaptive Pricing presentment (defensive, tolerant
        # of API-version differences). May be None when Stripe charged in
        # canonical USD. Never derives from client input.
        pi_full = None
        try:
            pi_id = obj.get("payment_intent")
            if pi_id:
                pi_full = stripe.PaymentIntent.retrieve(
                    pi_id,
                    expand=["presentment_details", "charges.data.payment_method_details"],
                )
                pi_full = dict(pi_full or {})
        except Exception as e:
            logger.warning(f"stripe payment_intent retrieve failed for {order.get('order_number')}: {type(e).__name__}")
            pi_full = None
        presentment_block = _build_presentment_block(
            dict(sess_full or {}), pi_full,
            canonical_total_cents=int(order.get("subtotal_cents") or 0) + recon["shipping_cents"] + int(order.get("tax_cents") or 0),
            canonical_currency=order.get("currency") or "USD",
        )
        payment_method_type = _extract_payment_method_type(pi_full)
        if paid:
            # Atomic first-paid transition. Only the first webhook that flips
            # payment_status→paid AND paid_notification_sent→True passes the
            # filter, so the paid-order email is sent exactly once even if
            # multiple event types (e.g. checkout.session.completed and
            # checkout.session.async_payment_succeeded) both report paid or
            # the same event is redelivered.
            filt = {
                "id": order["id"],
                "$or": [
                    {"payment_status": {"$ne": "paid"}},
                    {"paid_notification_sent": {"$ne": True}},
                ],
            }
            # Shipping-integrity separation:
            #   - `payment_status` reflects Stripe truth: 'paid' when Stripe
            #     confirms payment succeeded, REGARDLESS of any shipping
            #     mismatch. We never falsify a successful payment.
            #   - `shipping_integrity_status` is a SEPARATE flag: set to
            #     'pending_review' on mismatch so fulfillment does not ship
            #     until the mismatch is reviewed. `fulfilment_status` is
            #     also held at 'pending_review' in that case (rather than
            #     advancing to 'paid').
            trusted_shipping_cents = recon["shipping_cents"]
            integrity_ok = not recon["integrity_mismatch"]
            fulfilment_status_next = "paid" if integrity_ok else "pending_review"
            shipping_integrity_next = "ok" if integrity_ok else "pending_review"
            # `total_cents` is recomputed to reflect the actual Stripe shipping.
            new_total_cents = int(order.get("subtotal_cents") or 0) + trusted_shipping_cents + int(order.get("tax_cents") or 0)
            update = {
                "$set": {
                    "provider_session_id": obj.get("id"),
                    "provider_payment_intent_id": obj.get("payment_intent"),
                    "payment_status": "paid",
                    "fulfilment_status": fulfilment_status_next,
                    "shipping_integrity_status": shipping_integrity_next,
                    "shipping_cents": trusted_shipping_cents,
                    "total_cents": new_total_cents,
                    "paid_notification_sent": True,
                    "updated_at": datetime.now(timezone.utc),
                },
                "$addToSet": {"webhook_event_ids": event["id"]},
            }
            # Merge reconciled shipping block into the persisted OrderV2.shipping.
            for k, v in (recon.get("shipping") or {}).items():
                update["$set"][f"shipping.{k}"] = v
            # Merge presentment block into `OrderV2.presentment` when Stripe
            # actually reported a non-USD Adaptive Pricing charge. Adaptive
            # Pricing FX difference is NEVER an integrity failure.
            if presentment_block:
                for k, v in presentment_block.items():
                    if v is not None:
                        update["$set"][f"presentment.{k}"] = v
            if payment_method_type:
                update["$set"]["payment_method_type"] = payment_method_type
            if not integrity_ok:
                logger.warning(
                    f"SHIPPING_AMOUNT_MISMATCH order={order.get('order_number')} "
                    f"stripe_amt={trusted_shipping_cents} trusted_amt={recon['trusted_zone_cents']}"
                )
            result = await db.orders_v2.update_one(filt, update)
            if result.modified_count == 1:
                # We won the first-paid transition. Send notifications
                # exactly once. Each channel's actual delivery status is
                # written into the OrderV2 so ops can distinguish "sent"
                # from "skipped/failed" without a second webhook pass.
                fresh = await db.orders_v2.find_one({"id": order["id"]}, {"_id": 0})
                try:
                    from services.order_emails import send_paid_order_emails
                    email_result = await send_paid_order_emails(fresh or order)
                except Exception as email_err:  # never break the webhook on email
                    logger.warning(f"paid-order email send failed for {order['id']}: {type(email_err).__name__}")
                    email_result = {"customer": {"status": "failed", "error": type(email_err).__name__},
                                    "internal": {"status": "failed", "error": type(email_err).__name__}}
                # Emit ORDER_PAID behavioral event so retention_pending
                # rows for the purchased products (and any pending
                # checkout-abandonment) are cancelled immediately. Never
                # raises — behavioral retention is a NOTIFICATION lane,
                # not the source of truth.
                try:
                    from services.retention_service import record_order_paid
                    src = fresh or order
                    slugs = [i.get("product_slug") for i in (src.get("items") or [])
                             if i.get("product_slug")]
                    await record_order_paid(db, src.get("customer_email") or "", slugs)
                except Exception as be:  # pragma: no cover - defensive
                    logger.warning(f"retention ORDER_PAID emit failed: {type(be).__name__}")
                _cust = email_result.get("customer") or {}
                _intl = email_result.get("internal") or {}
                await db.orders_v2.update_one({"id": order["id"]}, {"$set": {
                    "customer_notification_sent": _cust.get("status") == "sent",
                    "internal_review_notification_sent": _intl.get("status") == "sent",
                    "updated_at": datetime.now(timezone.utc),
                }})
        else:
            # Async pending (e.g., Klarna/Afterpay/bank redirect) — leave pending
            await db.orders_v2.update_one({"id": order["id"]},
                {"$set": {
                    "provider_session_id": obj.get("id"),
                    "provider_payment_intent_id": obj.get("payment_intent"),
                    "payment_status": obj.get("payment_status") or "processing",
                    "updated_at": datetime.now(timezone.utc),
                }, "$addToSet": {"webhook_event_ids": event["id"]}})

    elif etype == "checkout.session.async_payment_succeeded":
        if order and (order.get("payment_status") != "paid" or not order.get("paid_notification_sent")):
            filt = {
                "id": order["id"],
                "$or": [
                    {"payment_status": {"$ne": "paid"}},
                    {"paid_notification_sent": {"$ne": True}},
                ],
            }
            update = {
                "$set": {
                    "payment_status": "paid",
                    "fulfilment_status": "paid",
                    "paid_notification_sent": True,
                    "updated_at": datetime.now(timezone.utc),
                },
                "$addToSet": {"webhook_event_ids": event["id"]},
            }
            result = await db.orders_v2.update_one(filt, update)
            if result.modified_count == 1:
                fresh = await db.orders_v2.find_one({"id": order["id"]}, {"_id": 0})
                try:
                    from services.order_emails import send_paid_order_emails
                    email_result = await send_paid_order_emails(fresh or order)
                except Exception as email_err:
                    logger.warning(f"paid-order email send failed for {order['id']}: {type(email_err).__name__}")
                    email_result = {"customer": {"status": "failed", "error": type(email_err).__name__},
                                    "internal": {"status": "failed", "error": type(email_err).__name__}}
                # Behavioral retention: cancel pending abandonment for the
                # purchased products + any checkout-abandonment for this
                # customer email. Never raises.
                try:
                    from services.retention_service import record_order_paid
                    src = fresh or order
                    slugs = [i.get("product_slug") for i in (src.get("items") or [])
                             if i.get("product_slug")]
                    await record_order_paid(db, src.get("customer_email") or "", slugs)
                except Exception as be:  # pragma: no cover - defensive
                    logger.warning(f"retention ORDER_PAID emit failed: {type(be).__name__}")
                _cust = email_result.get("customer") or {}
                _intl = email_result.get("internal") or {}
                await db.orders_v2.update_one({"id": order["id"]}, {"$set": {
                    "customer_notification_sent": _cust.get("status") == "sent",
                    "internal_review_notification_sent": _intl.get("status") == "sent",
                    "updated_at": datetime.now(timezone.utc),
                }})

    elif etype == "checkout.session.async_payment_failed" or etype == "payment_intent.payment_failed":
        if order:
            await db.orders_v2.update_one({"id": order["id"]},
                {"$set": {"payment_status": "failed", "updated_at": datetime.now(timezone.utc)},
                 "$addToSet": {"webhook_event_ids": event["id"]}})

    elif etype == "charge.refunded":
        if order:
            refunded_full = obj.get("amount_refunded") == obj.get("amount")
            await db.orders_v2.update_one({"id": order["id"]},
                {"$set": {"payment_status": "refunded" if refunded_full else "partially_refunded",
                          "updated_at": datetime.now(timezone.utc)},
                 "$addToSet": {"webhook_event_ids": event["id"]}})
            # Layer 3 — reconcile any RMA case attached to this order.
            # Idempotent; never falsifies Stripe truth (Stripe → RMA, not
            # the other direction). Never raises — the webhook must
            # remain green even if the RMA lookup fails.
            try:
                rma_case = await db.returns.find_one({
                    "order_number": order.get("order_number"),
                    "status": {"$in": ["refund_approved", "refund_pending"]},
                }, {"_id": 0})
                if rma_case:
                    await db.returns.update_one(
                        {"rma_number": rma_case["rma_number"]},
                        {"$set": {
                            "status": "refunded",
                            "stripe_refund_id": (obj.get("refunds") or {}).get("data", [{}])[0].get("id"),
                            "stripe_refund_status": "succeeded" if refunded_full else "partial",
                            "refund_confirmed_at": datetime.now(timezone.utc),
                            "updated_at": datetime.now(timezone.utc),
                        }},
                    )
                    try:
                        from services.returns_service import write_audit as _rma_audit
                        await _rma_audit(
                            db,
                            rma_number=rma_case["rma_number"],
                            order_number=order.get("order_number") or "",
                            action="webhook_refund_confirmed",
                            previous=rma_case.get("status"), new="refunded",
                            actor="stripe_webhook", reason=None,
                            extra={"full": refunded_full},
                        )
                    except Exception:
                        pass
                    # REFUND ISSUED customer email — idempotent, only after
                    # Stripe-authoritative confirmation. Never mutates
                    # refund truth.
                    try:
                        from services.return_emails import dispatch_return_email
                        fresh = await db.returns.find_one(
                            {"rma_number": rma_case["rma_number"]}, {"_id": 0})
                        if fresh:
                            await dispatch_return_email(db, fresh, "refund_issued")
                    except Exception:
                        pass
            except Exception as _e:
                logger.warning(f"RMA webhook reconciliation skipped: {type(_e).__name__}")

    elif etype == "charge.dispute.created":
        if order:
            await db.orders_v2.update_one({"id": order["id"]},
                {"$set": {"payment_status": "disputed",
                          "fraud_review_status": "review_required",
                          "fraud_review_reason": f"Stripe dispute {obj.get('reason','') or 'created'}",
                          "fraud_review_updated_at": datetime.now(timezone.utc),
                          "updated_at": datetime.now(timezone.utc)},
                 "$addToSet": {"webhook_event_ids": event["id"]}})
            # Layer 4 — mirror as a PHILEON dispute_cases record. Idempotent
            # via stripe_dispute_id unique index. Never overwrites Stripe truth.
            try:
                from services.disputes_service import new_case_id, write_audit as _dsp_audit
                stripe_dispute_id = obj.get("id") or f"dp_test_{event['id']}"
                existing = await db.dispute_cases.find_one({"stripe_dispute_id": stripe_dispute_id}, {"_id": 0})
                now = datetime.now(timezone.utc)
                due_raw = obj.get("evidence_details", {}).get("due_by")
                due_by = datetime.fromtimestamp(due_raw, tz=timezone.utc) if isinstance(due_raw, (int, float)) else None
                if not existing:
                    case = {
                        "case_id": new_case_id(),
                        "order_number": order.get("order_number"),
                        "stripe_dispute_id": stripe_dispute_id,
                        "stripe_charge_id": obj.get("charge"),
                        "stripe_payment_intent_id": obj.get("payment_intent"),
                        "status": obj.get("status") or "needs_response",
                        "reason": obj.get("reason"),
                        "amount_cents": int(obj.get("amount") or 0),
                        "currency": (obj.get("currency") or "usd").upper(),
                        "evidence_due_by": due_by,
                        "is_charge_refundable": bool(obj.get("is_charge_refundable")),
                        "fraud_review_status": "review_required",
                        "response_status": "not_started",
                        "last_webhook_event_id": event["id"],
                        "created_at": now,
                        "updated_at": now,
                    }
                    await db.dispute_cases.insert_one(case)
                    await _dsp_audit(db, case_id=case["case_id"],
                        order_number=order.get("order_number") or "",
                        action="webhook_dispute_created",
                        previous=None, new=case["status"],
                        actor="stripe_webhook", note=None)
            except Exception as _e:
                logger.warning(f"dispute mirror skipped: {type(_e).__name__}")

    elif etype in ("charge.dispute.updated", "charge.dispute.closed"):
        if order:
            try:
                stripe_dispute_id = obj.get("id")
                if stripe_dispute_id:
                    prev = await db.dispute_cases.find_one({"stripe_dispute_id": stripe_dispute_id}, {"_id": 0})
                    prev_status = (prev or {}).get("status")
                    new_status = obj.get("status") or prev_status
                    due_raw = obj.get("evidence_details", {}).get("due_by")
                    due_by = datetime.fromtimestamp(due_raw, tz=timezone.utc) if isinstance(due_raw, (int, float)) else prev.get("evidence_due_by") if prev else None
                    upd = {"status": new_status,
                            "evidence_due_by": due_by,
                            "last_webhook_event_id": event["id"],
                            "updated_at": datetime.now(timezone.utc)}
                    if etype == "charge.dispute.closed" or new_status in ("won", "lost", "warning_closed", "charge_dismissed"):
                        upd["closed_at"] = datetime.now(timezone.utc)
                    await db.dispute_cases.update_one({"stripe_dispute_id": stripe_dispute_id}, {"$set": upd})
                    # Layer 4 completion — order-level fraud state follows
                    # Stripe result:
                    #   won / warning_closed / charge_dismissed → owner
                    #     must explicitly re-review before fulfillment
                    #     resumes (fraud_review_status = review_required).
                    #   lost → permanent fulfillment block (blocked).
                    # Reconcile order-level state to Stripe truth on
                    # terminal dispute outcomes:
                    #   won / warning_closed / charge_dismissed →
                    #     merchant keeps the funds. payment_status is
                    #     restored to "paid"; fraud_review_status is set
                    #     to "review_required" so owner must explicitly
                    #     re-review before ordinary Layer 2 gates apply.
                    #   lost →
                    #     funds returned to customer via chargeback.
                    #     A LOST CHARGEBACK IS NOT A MERCHANT REFUND —
                    #     we set payment_status to the canonical
                    #     "chargeback_lost" (NOT "refunded") to preserve
                    #     the accounting/CX distinction. No refund
                    #     email is emitted, no stripe_refund_id is
                    #     fabricated. Order-level fraud_review_status
                    #     becomes "blocked" (permanent fulfillment
                    #     block).
                    order_frs = None
                    order_reason = None
                    order_payment_status = None
                    if new_status in ("won", "warning_closed", "charge_dismissed"):
                        order_frs = "review_required"
                        order_reason = f"Stripe dispute resolved: {new_status} — owner re-review required"
                        order_payment_status = "paid"
                    elif new_status == "lost":
                        order_frs = "blocked"
                        order_reason = "Stripe dispute lost — fulfillment permanently blocked"
                        order_payment_status = "chargeback_lost"
                    if order_frs and order:
                        order_upd: Dict[str, Any] = {
                            "fraud_review_status": order_frs,
                            "fraud_review_reason": order_reason,
                            "fraud_review_updated_at": datetime.now(timezone.utc),
                            "updated_at": datetime.now(timezone.utc),
                        }
                        if order_payment_status:
                            order_upd["payment_status"] = order_payment_status
                        await db.orders_v2.update_one({"id": order["id"]}, {"$set": order_upd})
                    from services.disputes_service import write_audit as _dsp_audit
                    await _dsp_audit(db, case_id=(prev or {}).get("case_id") or "",
                        order_number=order.get("order_number") or "",
                        action=f"webhook_dispute_{etype.split('.')[-1]}",
                        previous=prev_status, new=new_status,
                        actor="stripe_webhook", note=None)
            except Exception as _e:
                logger.warning(f"dispute mirror update skipped: {type(_e).__name__}")

    else:
        logger.info(f"Unhandled Stripe event type: {etype}")

    return {"received": True}
