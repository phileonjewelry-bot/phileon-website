"""Tests for Stripe presentment extraction & OrderV2Presentment schema.

The extractor must be defensive: tolerant of `presentment_details` on the
Session, on the PaymentIntent, and of the legacy `currency_conversion`
field. It must NEVER derive values from anything but authoritative Stripe
fields, and it must NEVER treat FX drift as an integrity failure.
"""
import pytest

from models_orders import OrderV2Presentment
from routes.webhooks_stripe import (
    _extract_stripe_presentment,
    _build_presentment_block,
)


def test_extract_from_session_presentment_details():
    sess = {
        "currency": "usd",
        "amount_total": 50000,
        "presentment_details": {
            "presentment_currency": "cad",
            "presentment_amount": 68000,
        },
    }
    out = _extract_stripe_presentment(sess)
    assert out["presentment_currency"] == "CAD"
    assert out["presentment_amount_cents"] == 68000
    assert out["extraction_source"] == "session.presentment_details"


def test_extract_from_payment_intent_when_session_missing():
    sess = {"currency": "usd", "amount_total": 50000}
    pi = {"presentment_details": {"presentment_currency": "gbp", "presentment_amount": 39500}}
    out = _extract_stripe_presentment(sess, pi)
    assert out["presentment_currency"] == "GBP"
    assert out["presentment_amount_cents"] == 39500
    assert out["extraction_source"] == "payment_intent.presentment_details"


def test_extract_falls_back_to_legacy_currency_conversion():
    sess = {"currency": "usd", "amount_total": 50000, "currency_conversion": {
        "customer_currency": "aud", "amount_total": 76000,
    }}
    out = _extract_stripe_presentment(sess)
    assert out["presentment_currency"] == "AUD"
    assert out["presentment_amount_cents"] == 76000
    assert out["extraction_source"] == "session.currency_conversion"


def test_extract_returns_empty_when_no_presentment_fields():
    out = _extract_stripe_presentment({"currency": "usd", "amount_total": 50000})
    assert out["presentment_currency"] is None
    assert out["presentment_amount_cents"] is None


def test_build_block_returns_none_when_usd_only():
    """When Stripe presented USD (customer charged in USD), no block."""
    out = _build_presentment_block(
        {"currency": "usd", "amount_total": 50000,
         "presentment_details": {"presentment_currency": "usd", "presentment_amount": 50000}},
        None, canonical_total_cents=50000, canonical_currency="USD",
    )
    assert out is None


def test_build_block_populates_all_fields_for_non_usd():
    out = _build_presentment_block(
        {"currency": "usd", "amount_total": 50000,
         "presentment_details": {"presentment_currency": "cad", "presentment_amount": 68000}},
        None, canonical_total_cents=50000, canonical_currency="USD",
    )
    assert out is not None
    assert out["presentment_currency"] == "CAD"
    assert out["presentment_total_cents"] == 68000
    assert out["stripe_presentment_currency"] == "CAD"
    assert out["stripe_presentment_amount_cents"] == 68000
    assert out["fx_rate_source"] == "stripe.adaptive_pricing"
    assert out["fx_rate"] == pytest.approx(1.36, rel=1e-3)


def test_orderv2_presentment_optional_fields_defaults_to_none():
    p = OrderV2Presentment()
    assert p.presentment_currency is None
    assert p.presentment_total_cents is None
    assert p.fx_rate is None


def test_orderv2_presentment_extra_fields_ignored():
    """Adaptive Pricing schema evolutions on Stripe's side must never break
    deserialization of stored orders."""
    p = OrderV2Presentment(**{
        "presentment_currency": "EUR",
        "presentment_total_cents": 46000,
        "fx_rate": 0.92,
        "some_future_stripe_field": "value",  # should be dropped
    })
    assert p.presentment_currency == "EUR"
