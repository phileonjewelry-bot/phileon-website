"""Shipping-integrity email routing — payment truth preserved, fulfillment
communication gated on `shipping_integrity_status`. Idempotent, minimal,
backward-compatible.

Tests exercise `send_paid_order_emails` directly (monkeypatched `send_email`)
and the webhook `paid_notification_sent` / `customer_notification_sent` /
`internal_review_notification_sent` semantics separately.
"""
import asyncio
import pytest

from services import order_emails
from services.order_emails import (
    send_paid_order_emails,
    build_customer_paid_email,
    build_customer_payment_received_email,
    build_internal_paid_notification,
    build_internal_integrity_review_notification,
)


BASE_ORDER = {
    "order_number": "PHI-TEST-INT-1",
    "customer_email": "shopper@example.com",
    "currency": "USD",
    "subtotal_cents": 35000,
    "shipping_cents": 3500,
    "tax_cents": 0,
    "total_cents": 38500,
    "payment_status": "paid",
    "items": [{
        "product_name": "RIBBON REGALE ÉDITION",
        "variant": "18K Yellow Gold Plated Sterling Silver · One Pair",
        "quantity": 1,
        "unit_amount_cents": 35000,
    }],
    "shipping": {
        "zone_key": "US",
        "country": "US",
        "service_label": "Standard Shipping — United States",
    },
}


class _Sender:
    """Records send_email calls. Supports scripted failure per recipient."""
    def __init__(self, fail_for=None):
        self.calls = []
        self.fail_for = fail_for or set()

    async def __call__(self, to, subject, html, text):
        self.calls.append({"to": to, "subject": subject, "html": html, "text": text})
        if to in self.fail_for:
            return {"status": "failed", "error": "smtp-drop"}
        return {"status": "sent", "id": f"mock-{len(self.calls)}"}


def _run(coro):
    return asyncio.run(coro)


@pytest.fixture
def rec(monkeypatch):
    s = _Sender()
    monkeypatch.setattr(order_emails, "send_email", s)
    monkeypatch.setenv("PHILEON_ORDER_NOTIFICATION_EMAIL", "internal-review@phileon.com")
    return s


def _subjects(sender):
    return [c["subject"] for c in sender.calls]


# ─────────────────────────  NORMAL MATCH  ─────────────────────────
def test_normal_match_sends_confirmed_and_internal_once(rec):
    order = {**BASE_ORDER, "shipping_integrity_status": "ok"}
    r = _run(send_paid_order_emails(order))
    assert r["mode"] == "ok"
    assert r["customer"]["status"] == "sent"
    assert r["internal"]["status"] == "sent"
    subs = _subjects(rec)
    assert sum("Order PHI-TEST-INT-1 Confirmed" in s for s in subs) == 1
    assert sum(s.startswith("[PHILEON] Paid order — PHI-TEST-INT-1") for s in subs) == 1
    assert not any("Payment Received" in s for s in subs)
    assert not any("REVIEW" in s for s in subs)


def test_normal_when_integrity_status_absent(rec):
    order = {k: v for k, v in BASE_ORDER.items() if k != "shipping_integrity_status"}
    r = _run(send_paid_order_emails(order))
    assert r["mode"] == "ok"
    assert r["customer"]["status"] == "sent"
    assert any("Order PHI-TEST-INT-1 Confirmed" in s for s in _subjects(rec))


# ─────────────────────────  PENDING REVIEW  ─────────────────────────
def test_pending_review_sends_payment_received_and_internal_review(rec):
    order = {**BASE_ORDER, "shipping_integrity_status": "pending_review"}
    r = _run(send_paid_order_emails(order))
    assert r["mode"] == "pending_review"
    assert r["customer"]["status"] == "sent"
    assert r["internal"]["status"] == "sent"
    subs = _subjects(rec)
    # Exactly ONE customer PAYMENT RECEIVED and exactly ONE internal REVIEW.
    assert sum("Payment Received" in s for s in subs) == 1
    assert sum("REVIEW" in s and "PHI-TEST-INT-1" in s for s in subs) == 1
    # Never the normal ORDER CONFIRMED.
    assert not any("Order PHI-TEST-INT-1 Confirmed" in s for s in subs)


def test_pending_review_customer_email_does_not_leak_internal_terminology(rec):
    order = {**BASE_ORDER, "shipping_integrity_status": "pending_review"}
    _run(send_paid_order_emails(order))
    cust = [c for c in rec.calls if c["to"] == "shopper@example.com"]
    assert len(cust) == 1
    text_low = cust[0]["text"].lower()
    for banned in ("shipping_amount_mismatch", "integrity failure", "do not ship",
                   "webhook", "mismatch"):
        assert banned.lower() not in text_low, f"leaked internal term: {banned}"
    # But it MUST communicate payment received + review posture.
    assert "payment" in text_low and "received" in text_low
    assert "review" in text_low


# ─────────────────────────  MISSING RECIPIENT  ─────────────────────────
def test_pending_review_missing_internal_recipient_marks_actionable(rec, monkeypatch):
    monkeypatch.delenv("PHILEON_ORDER_NOTIFICATION_EMAIL", raising=False)
    monkeypatch.delenv("PHILEON_CONCIERGE_NOTIFICATION_EMAIL", raising=False)
    order = {**BASE_ORDER, "shipping_integrity_status": "pending_review"}
    r = _run(send_paid_order_emails(order))
    # Customer email may still succeed.
    assert r["customer"]["status"] == "sent"
    # Internal must NOT be marked delivered.
    assert r["internal"]["status"] == "skipped"
    assert r["internal"].get("reason") == "no_internal_recipient_configured"


def test_ok_missing_customer_recipient_still_skipped(rec):
    order = {**BASE_ORDER, "shipping_integrity_status": "ok", "customer_email": ""}
    r = _run(send_paid_order_emails(order))
    assert r["customer"]["status"] == "skipped"
    assert r["internal"]["status"] == "sent"


# ─────────────────────────  SEND FAILURE  ─────────────────────────
def test_pending_review_customer_send_failure_actionable(monkeypatch):
    s = _Sender(fail_for={"shopper@example.com"})
    monkeypatch.setattr(order_emails, "send_email", s)
    monkeypatch.setenv("PHILEON_ORDER_NOTIFICATION_EMAIL", "internal-review@phileon.com")
    order = {**BASE_ORDER, "shipping_integrity_status": "pending_review"}
    r = _run(send_paid_order_emails(order))
    assert r["customer"]["status"] == "failed"
    # Internal review still succeeds — payment truth path is not blocked by
    # a customer-side email failure.
    assert r["internal"]["status"] == "sent"


def test_pending_review_internal_send_failure_actionable(monkeypatch):
    s = _Sender(fail_for={"internal-review@phileon.com"})
    monkeypatch.setattr(order_emails, "send_email", s)
    monkeypatch.setenv("PHILEON_ORDER_NOTIFICATION_EMAIL", "internal-review@phileon.com")
    order = {**BASE_ORDER, "shipping_integrity_status": "pending_review"}
    r = _run(send_paid_order_emails(order))
    assert r["customer"]["status"] == "sent"
    assert r["internal"]["status"] == "failed"


# ─────────────────────────  PAYMENT TRUTH  ─────────────────────────
def test_email_layer_never_mutates_order(rec):
    order = {**BASE_ORDER, "shipping_integrity_status": "pending_review"}
    snap = dict(order)
    _run(send_paid_order_emails(order))
    assert order == snap
    assert order["payment_status"] == "paid"


# ─────────────────────────  BUILDER SUBJECTS  ─────────────────────────
def test_customer_paid_email_subject_line():
    assert build_customer_paid_email(BASE_ORDER)["subject"] == "PHILEON — Order PHI-TEST-INT-1 Confirmed"


def test_customer_payment_received_email_subject_and_body():
    p = build_customer_payment_received_email(BASE_ORDER)
    assert p["subject"] == "PHILEON — Payment Received · Order PHI-TEST-INT-1 Review"
    assert "PAYMENT" in p["html"] and "RECEIVED" in p["html"]
    assert "ORDER CONFIRMED" not in p["html"]
    assert "ORDER CONFIRMED" not in p["text"]
    # No internal-only vocabulary bleeds into the customer copy.
    for banned in ("DO NOT SHIP", "shipping_amount_mismatch", "integrity failure",
                   "webhook", "mismatch"):
        assert banned not in p["html"]
        assert banned not in p["text"]


def test_internal_paid_notification_subject_line():
    assert build_internal_paid_notification(BASE_ORDER)["subject"] == "[PHILEON] Paid order — PHI-TEST-INT-1"


def test_internal_integrity_review_subject_line():
    p = build_internal_integrity_review_notification(BASE_ORDER)
    assert p["subject"] == "[PHILEON · REVIEW] Shipping-integrity hold — PHI-TEST-INT-1"
    assert "DO NOT SHIP" in p["html"] and "DO NOT SHIP" in p["text"]
    assert "Payment is real" in p["html"] and "Payment is real" in p["text"]
