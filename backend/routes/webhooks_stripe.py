"""Phase 1 — Stripe webhook receiver. Signature-verified, deduped, idempotent."""
import logging, os
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def get_db():
    from server import db
    return db


def _cfg(name):
    v = os.environ.get(name)
    return v.strip() if isinstance(v, str) else v


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
        updates = {
            "provider_session_id": obj.get("id"),
            "provider_payment_intent_id": obj.get("payment_intent"),
            "updated_at": datetime.now(timezone.utc),
        }
        if paid:
            updates["payment_status"] = "paid"
            updates["fulfilment_status"] = "paid"
        else:
            # Async pending (e.g., Klarna/Afterpay/bank redirect) — leave pending
            updates["payment_status"] = obj.get("payment_status") or "processing"
        await db.orders_v2.update_one({"id": order["id"]},
                                     {"$set": updates,
                                      "$addToSet": {"webhook_event_ids": event["id"]}})

    elif etype == "checkout.session.async_payment_succeeded":
        if order and order.get("payment_status") != "paid":
            await db.orders_v2.update_one({"id": order["id"]},
                {"$set": {"payment_status": "paid", "fulfilment_status": "paid",
                          "updated_at": datetime.now(timezone.utc)},
                 "$addToSet": {"webhook_event_ids": event["id"]}})

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
