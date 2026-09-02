"""Phase 1 — Stripe webhook receiver. Signature-verified, deduped, idempotent."""
import logging, os
from datetime import datetime, timezone
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
            if not integrity_ok:
                logger.warning(
                    f"SHIPPING_AMOUNT_MISMATCH order={order.get('order_number')} "
                    f"stripe_amt={trusted_shipping_cents} trusted_amt={recon['trusted_zone_cents']}"
                )
            result = await db.orders_v2.update_one(filt, update)
            if result.modified_count == 1:
                # We won the first-paid transition. Send emails exactly once.
                fresh = await db.orders_v2.find_one({"id": order["id"]}, {"_id": 0})
                try:
                    from services.order_emails import send_paid_order_emails
                    await send_paid_order_emails(fresh or order)
                except Exception as email_err:  # never break the webhook on email
                    logger.warning(f"paid-order email send failed for {order['id']}: {type(email_err).__name__}")
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
                    await send_paid_order_emails(fresh or order)
                except Exception as email_err:
                    logger.warning(f"paid-order email send failed for {order['id']}: {type(email_err).__name__}")

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

    elif etype == "charge.dispute.created":
        if order:
            await db.orders_v2.update_one({"id": order["id"]},
                {"$set": {"payment_status": "disputed", "updated_at": datetime.now(timezone.utc)},
                 "$addToSet": {"webhook_event_ids": event["id"]}})

    else:
        logger.info(f"Unhandled Stripe event type: {etype}")

    return {"received": True}
