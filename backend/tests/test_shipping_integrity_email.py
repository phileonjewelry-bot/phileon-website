"""Shipping-integrity email routing — payment truth preserved, fulfillment
communication gated on `shipping_integrity_status`.

These tests use monkeypatched `send_email` so no real message is emitted.
No pytest-asyncio: we drive the async helper with `asyncio.run(...)`.
"""
import asyncio
import os
import pytest

from services import order_emails
from services.order_emails import (
    send_paid_order_emails,
    build_customer_paid_email,
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


class _Recorder:
    """Records every send_email call — no real network activity."""
    def __init__(self):
        self.calls = []

    async def __call__(self, to, subject, html, text):
        self.calls.append({"to": to, "subject": subject, "html": html, "text": text})
        return {"status": "ok", "id": f"mock-{len(self.calls)}", "to": to}


def _run(coro):
    return asyncio.run(coro)


@pytest.fixture
def rec(monkeypatch):
    r = _Recorder()
    monkeypatch.setattr(order_emails, "send_email", r)
    monkeypatch.setenv("PHILEON_ORDER_NOTIFICATION_EMAIL", "internal-review@phileon.com")
    return r


# ─────────────────────  NORMAL PATH · integrity ok  ─────────────────────
def test_normal_match_sends_customer_confirmation_and_internal(rec):
    order = {**BASE_ORDER, "shipping_integrity_status": "ok"}
    result = _run(send_paid_order_emails(order))

    assert result["customer"] is not None
    assert result["customer"].get("skipped") is None
    assert result["internal"] is not None
    assert result["internal"].get("skipped") is None

    subjects = [c["subject"] for c in rec.calls]
    assert any("Order PHI-TEST-INT-1 Confirmed" in s for s in subjects), \
        f"Expected customer ORDER CONFIRMED email, got subjects={subjects}"
    assert any(s.startswith("[PHILEON] Paid order — PHI-TEST-INT-1") for s in subjects), \
        f"Expected plain internal paid-notification, got subjects={subjects}"
    assert not any("REVIEW" in s for s in subjects)


def test_normal_path_when_integrity_status_absent(rec):
    order = {k: v for k, v in BASE_ORDER.items() if k != "shipping_integrity_status"}
    result = _run(send_paid_order_emails(order))
    assert result["customer"] is not None
    assert result["customer"].get("skipped") is None
    subjects = [c["subject"] for c in rec.calls]
    assert any("Order PHI-TEST-INT-1 Confirmed" in s for s in subjects)


# ─────────────────────  HOLD PATH · integrity pending_review  ─────────────────────
def test_pending_review_suppresses_customer_confirmation(rec):
    order = {**BASE_ORDER, "shipping_integrity_status": "pending_review"}
    result = _run(send_paid_order_emails(order))

    assert result["customer"] == {"skipped": "shipping_integrity_review"}
    assert result["internal"] is not None
    assert result["internal"].get("skipped") is None

    subjects = [c["subject"] for c in rec.calls]
    assert not any("Confirmed" in s and "PHI-TEST-INT-1" in s for s in subjects), \
        f"customer ORDER CONFIRMED must not fire while integrity is pending_review; subjects={subjects}"
    assert any("REVIEW" in s and "PHI-TEST-INT-1" in s for s in subjects), \
        f"internal integrity-review alert missing; subjects={subjects}"


def test_pending_review_internal_email_states_do_not_ship(rec):
    order = {**BASE_ORDER, "shipping_integrity_status": "pending_review"}
    _run(send_paid_order_emails(order))
    internal_calls = [c for c in rec.calls if "REVIEW" in c["subject"]]
    assert len(internal_calls) == 1
    call = internal_calls[0]
    assert call["to"] == "internal-review@phileon.com"
    assert "DO NOT SHIP" in call["text"]
    assert "Payment is real" in call["text"]
    assert "PHI-TEST-INT-1" in call["text"]


def test_pending_review_without_internal_recipient_marks_skipped(rec, monkeypatch):
    monkeypatch.delenv("PHILEON_ORDER_NOTIFICATION_EMAIL", raising=False)
    monkeypatch.delenv("PHILEON_CONCIERGE_NOTIFICATION_EMAIL", raising=False)
    order = {**BASE_ORDER, "shipping_integrity_status": "pending_review"}
    result = _run(send_paid_order_emails(order))
    assert result["customer"] == {"skipped": "shipping_integrity_review"}
    assert result["internal"] == {"skipped": "no_internal_recipient_configured"}
    assert rec.calls == []


# ─────────────────────  PAYMENT TRUTH PRESERVATION  ─────────────────────
def test_pending_review_does_not_mutate_payment_status(rec):
    order = {**BASE_ORDER, "shipping_integrity_status": "pending_review"}
    snapshot = dict(order)
    _run(send_paid_order_emails(order))
    assert order == snapshot
    assert order["payment_status"] == "paid"


# ─────────────────────  BUILDER-LEVEL SUBJECTS  ─────────────────────
def test_customer_paid_email_subject_line():
    p = build_customer_paid_email(BASE_ORDER)
    assert p["subject"] == "PHILEON — Order PHI-TEST-INT-1 Confirmed"


def test_internal_paid_notification_subject_line():
    p = build_internal_paid_notification(BASE_ORDER)
    assert p["subject"] == "[PHILEON] Paid order — PHI-TEST-INT-1"


def test_internal_integrity_review_subject_line():
    p = build_internal_integrity_review_notification(BASE_ORDER)
    assert p["subject"] == "[PHILEON · REVIEW] Shipping-integrity hold — PHI-TEST-INT-1"
    assert "DO NOT SHIP" in p["html"]
    assert "DO NOT SHIP" in p["text"]
