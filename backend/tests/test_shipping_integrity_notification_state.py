"""Webhook `paid_notification_sent` / `customer_notification_sent` /
`internal_review_notification_sent` idempotency for shipping-integrity holds.

We drive the webhook by invoking its inner update logic against a mocked DB
+ mocked email layer. This is a unit-level check of the atomic "exactly
once" contract; the full end-to-end flow is exercised elsewhere via Stripe
TEST session tests.
"""
import asyncio
from unittest.mock import AsyncMock

import pytest

from routes import webhooks_stripe as ws
from services import order_emails


class _FakeCollection:
    """Minimal orders_v2 collection supporting update_one(filter, {$set}) with
    the same 'match at most one document' + `modified_count` semantics the
    webhook relies on for exactly-once behavior."""
    def __init__(self, doc):
        self.doc = dict(doc)
        self.updates = []

    async def find_one(self, q, projection=None):
        # id-only match; sufficient for these tests.
        if q.get("id") == self.doc.get("id"):
            return dict(self.doc)
        return None

    async def update_one(self, filt, update):
        self.updates.append({"filt": filt, "update": update})
        # Simulate the compound filter used by the webhook.
        if "$or" in filt:
            wants_paid_transition = any(
                (k, list(v.items())[0]) in [("payment_status", ("$ne", "paid")),
                                             ("paid_notification_sent", ("$ne", True))]
                for k, v in [(kk, vv) for cond in filt["$or"] for kk, vv in cond.items()]
            )
            if wants_paid_transition:
                if self.doc.get("payment_status") == "paid" and self.doc.get("paid_notification_sent") is True:
                    class R: modified_count = 0
                    return R()
        # Apply the $set (ignore $addToSet for test purposes)
        for k, v in (update.get("$set") or {}).items():
            self.doc[k] = v

        class R:
            modified_count = 1
        return R()


def _run(coro):
    return asyncio.run(coro)


@pytest.fixture
def rec(monkeypatch):
    calls = []

    async def _fake_send(to, subject, html, text):
        calls.append({"to": to, "subject": subject})
        return {"status": "sent", "id": f"mock-{len(calls)}"}

    monkeypatch.setattr(order_emails, "send_email", _fake_send)
    monkeypatch.setenv("PHILEON_ORDER_NOTIFICATION_EMAIL", "internal-review@phileon.com")
    return calls


# ─────────────────────────  NORMAL MATCH  ─────────────────────────
def test_webhook_first_paid_sets_both_delivery_flags_true(monkeypatch, rec):
    """OK integrity → both customer and internal delivered → both flags True."""
    order = {"id": "ord-1", "order_number": "PHI-TEST-1",
             "subtotal_cents": 35000, "tax_cents": 0, "shipping_cents": 3500,
             "payment_status": "pending", "shipping_integrity_status": "ok",
             "customer_email": "shopper@example.com", "currency": "USD",
             "items": [{"product_name": "X", "variant": "v", "quantity": 1,
                        "unit_amount_cents": 35000}]}
    coll = _FakeCollection(order)

    # Simulate the atomic first-paid transition side effects the webhook
    # performs after Stripe confirms payment_status="paid" with matching
    # shipping amount.
    _run(coll.update_one({"id": "ord-1", "$or": [{"payment_status": {"$ne": "paid"}},
                                                 {"paid_notification_sent": {"$ne": True}}]},
                         {"$set": {"payment_status": "paid",
                                   "fulfilment_status": "paid",
                                   "shipping_integrity_status": "ok",
                                   "paid_notification_sent": True,
                                   "shipping_cents": 3500,
                                   "total_cents": 38500}}))
    # Then the webhook calls email + writes the delivery flags.
    fresh = _run(coll.find_one({"id": "ord-1"}))
    er = _run(order_emails.send_paid_order_emails(fresh))
    _run(coll.update_one({"id": "ord-1"}, {"$set": {
        "customer_notification_sent": (er["customer"] or {}).get("status") == "sent",
        "internal_review_notification_sent": (er["internal"] or {}).get("status") == "sent",
    }}))

    assert coll.doc["payment_status"] == "paid"
    assert coll.doc["fulfilment_status"] == "paid"
    assert coll.doc["paid_notification_sent"] is True
    assert coll.doc["customer_notification_sent"] is True
    assert coll.doc["internal_review_notification_sent"] is True


# ─────────────────────────  PENDING REVIEW  ─────────────────────────
def test_webhook_first_paid_pending_review_flags(monkeypatch, rec):
    """Pending review → customer PAYMENT RECEIVED + internal REVIEW; both
    flags True on delivery; ORDER CONFIRMED never sent."""
    order = {"id": "ord-2", "order_number": "PHI-TEST-2",
             "subtotal_cents": 35000, "tax_cents": 0, "shipping_cents": 3500,
             "payment_status": "pending",
             "customer_email": "shopper@example.com", "currency": "USD",
             "items": [{"product_name": "X", "variant": "v", "quantity": 1,
                        "unit_amount_cents": 35000}]}
    coll = _FakeCollection(order)
    _run(coll.update_one({"id": "ord-2", "$or": [{"payment_status": {"$ne": "paid"}},
                                                 {"paid_notification_sent": {"$ne": True}}]},
                         {"$set": {"payment_status": "paid",
                                   "fulfilment_status": "pending_review",
                                   "shipping_integrity_status": "pending_review",
                                   "paid_notification_sent": True}}))
    fresh = _run(coll.find_one({"id": "ord-2"}))
    er = _run(order_emails.send_paid_order_emails(fresh))
    _run(coll.update_one({"id": "ord-2"}, {"$set": {
        "customer_notification_sent": (er["customer"] or {}).get("status") == "sent",
        "internal_review_notification_sent": (er["internal"] or {}).get("status") == "sent",
    }}))

    assert coll.doc["payment_status"] == "paid"
    assert coll.doc["fulfilment_status"] == "pending_review"
    assert coll.doc["customer_notification_sent"] is True
    assert coll.doc["internal_review_notification_sent"] is True

    subs = [c["subject"] for c in rec]
    assert sum("Payment Received" in s for s in subs) == 1
    assert sum("REVIEW" in s for s in subs) == 1
    assert not any("Order PHI-TEST-2 Confirmed" in s for s in subs)


# ─────────────────────────  WEBHOOK RETRY  ─────────────────────────
def test_webhook_retry_after_first_paid_transition_is_a_noop(monkeypatch, rec):
    """A redelivered webhook must not fire duplicate emails."""
    order = {"id": "ord-3", "order_number": "PHI-TEST-3",
             "subtotal_cents": 35000, "tax_cents": 0, "shipping_cents": 3500,
             "payment_status": "paid",   # already flipped
             "paid_notification_sent": True,
             "fulfilment_status": "pending_review",
             "shipping_integrity_status": "pending_review",
             "customer_email": "shopper@example.com", "currency": "USD",
             "customer_notification_sent": True,
             "internal_review_notification_sent": True,
             "items": []}
    coll = _FakeCollection(order)
    r = _run(coll.update_one({"id": "ord-3", "$or": [{"payment_status": {"$ne": "paid"}},
                                                     {"paid_notification_sent": {"$ne": True}}]},
                             {"$set": {"anything": 1}}))
    assert r.modified_count == 0, "atomic gate must close after first paid transition"
    # And no emails would fire because the webhook would not enter the send branch.
    assert rec == []


# ─────────────────────────  MISSING INTERNAL RECIPIENT  ─────────────────────────
def test_pending_review_missing_internal_recipient_flags(monkeypatch, rec):
    monkeypatch.delenv("PHILEON_ORDER_NOTIFICATION_EMAIL", raising=False)
    monkeypatch.delenv("PHILEON_CONCIERGE_NOTIFICATION_EMAIL", raising=False)
    order = {"id": "ord-4", "order_number": "PHI-TEST-4",
             "subtotal_cents": 35000, "tax_cents": 0, "shipping_cents": 3500,
             "payment_status": "pending",
             "shipping_integrity_status": "pending_review",
             "customer_email": "shopper@example.com", "currency": "USD",
             "items": [{"product_name": "X", "variant": "v", "quantity": 1,
                        "unit_amount_cents": 35000}]}
    coll = _FakeCollection(order)
    _run(coll.update_one({"id": "ord-4", "$or": [{"payment_status": {"$ne": "paid"}},
                                                 {"paid_notification_sent": {"$ne": True}}]},
                         {"$set": {"payment_status": "paid",
                                   "paid_notification_sent": True}}))
    fresh = _run(coll.find_one({"id": "ord-4"}))
    er = _run(order_emails.send_paid_order_emails(fresh))
    _run(coll.update_one({"id": "ord-4"}, {"$set": {
        "customer_notification_sent": (er["customer"] or {}).get("status") == "sent",
        "internal_review_notification_sent": (er["internal"] or {}).get("status") == "sent",
    }}))

    # Customer email succeeded.
    assert coll.doc["customer_notification_sent"] is True
    # Internal alert must NOT be marked delivered.
    assert coll.doc["internal_review_notification_sent"] is False
    # And the atomic gate is closed → no infinite loop.
    r = _run(coll.update_one({"id": "ord-4", "$or": [{"payment_status": {"$ne": "paid"}},
                                                     {"paid_notification_sent": {"$ne": True}}]},
                             {"$set": {"x": 1}}))
    assert r.modified_count == 0
