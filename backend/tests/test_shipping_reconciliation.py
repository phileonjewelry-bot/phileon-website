"""Unit tests for the webhook shipping-reconciliation helper.

We test `_build_shipping_reconciliation` directly with mocked Stripe
Session payload shapes across both API-version locations for
`shipping_details` (classic vs post-2024). The reconciliation must never
falsify a Stripe-confirmed payment on a shipping-integrity mismatch —
payment_status and shipping_integrity_status are decoupled.
"""
import copy
import pytest

from routes.webhooks_stripe import (
    _build_shipping_reconciliation,
    _extract_shipping_details,
    _extract_shipping_amount_cents,
)


BASE_ORDER = {
    "id": "ord-1",
    "order_number": "PHI-TEST-1",
    "subtotal_cents": 60000,   # $600 · triggers signature threshold ($500)
    "tax_cents": 0,
}


def _session(shape="classic", country="CA", stripe_amount_cents=0,
             address_line1="221B Baker Street",
             recipient_name="Test Customer",
             rate_display="Standard Shipping — Canada",
             rate_id="shr_test_123"):
    addr = {
        "country": country,
        "line1": address_line1,
        "city": "Toronto",
        "postal_code": "M5V 1A1",
    }
    shipping_details = {"name": recipient_name, "address": addr}
    session = {
        "id": "cs_test_x",
        "currency": "usd",
        "shipping_cost": {
            "amount_total": stripe_amount_cents,
            "shipping_rate": {"id": rate_id, "display_name": rate_display},
        },
        "total_details": {"amount_shipping": stripe_amount_cents},
    }
    if shape == "classic":
        session["shipping_details"] = shipping_details
    elif shape == "modern":
        session["collected_information"] = {"shipping_details": shipping_details}
    elif shape == "both":
        session["shipping_details"] = shipping_details
        session["collected_information"] = {"shipping_details": shipping_details}
    else:
        pass  # neither — should still not crash
    return session


# ────────────────────────────  API-version-agnostic extraction  ───
def test_extract_shipping_details_modern_location_preferred():
    s = _session(shape="both")
    # Both shapes present → prefer modern location.
    got = _extract_shipping_details(s)
    assert got["address"]["country"] == "CA"


def test_extract_shipping_details_classic_location_fallback():
    s = _session(shape="classic")
    got = _extract_shipping_details(s)
    assert got["address"]["country"] == "CA"


def test_extract_shipping_details_none_returns_empty_dict():
    s = _session(shape="none")
    s.pop("shipping_details", None)
    s.pop("collected_information", None)
    assert _extract_shipping_details(s) == {}


def test_extract_shipping_amount_prefers_shipping_cost():
    s = _session(stripe_amount_cents=3500)
    assert _extract_shipping_amount_cents(s) == 3500


def test_extract_shipping_amount_falls_back_to_total_details():
    s = _session(stripe_amount_cents=6500)
    s["shipping_cost"] = {}   # missing amount_total
    assert _extract_shipping_amount_cents(s) == 6500


def test_extract_shipping_amount_zero_when_absent():
    s = _session()
    s["shipping_cost"] = {}
    s["total_details"] = {}
    assert _extract_shipping_amount_cents(s) == 0


# ────────────────────────────  Reconciliation happy paths  ───
@pytest.mark.parametrize("shape", ["classic", "modern"])
@pytest.mark.parametrize("country,expected_cents,zone_key", [
    ("CA", 0,    "CA"),
    ("US", 3500, "US"),
    ("GB", 6500, "INTL_TIER_1"),
    ("MX", 9500, "INTL_TIER_2"),
])
def test_reconciliation_ok_when_stripe_amount_matches_trusted_zone(shape, country, expected_cents, zone_key):
    s = _session(shape=shape, country=country, stripe_amount_cents=expected_cents)
    recon = _build_shipping_reconciliation(s, BASE_ORDER)
    assert recon["integrity_mismatch"] is False
    assert recon["trusted_zone_cents"] == expected_cents
    assert recon["shipping_cents"] == expected_cents
    assert recon["shipping"]["zone_key"] == zone_key
    assert recon["shipping"]["country"] == country
    assert recon["shipping"]["insurance_required"] is True
    # Subtotal $600 ≥ $500 → signature_required True (all Phase 1 zones support signature)
    assert recon["shipping"]["signature_required"] is True


# ────────────────────────────  Mismatch detection  ───
def test_reconciliation_flags_mismatch_when_stripe_amount_differs():
    s = _session(country="US", stripe_amount_cents=999)   # wrong amount
    recon = _build_shipping_reconciliation(s, BASE_ORDER)
    assert recon["integrity_mismatch"] is True
    assert recon["trusted_zone_cents"] == 3500
    assert recon["shipping_cents"] == 999   # never overwritten silently


def test_reconciliation_flags_mismatch_when_country_unsupported():
    s = _session(country="KP", stripe_amount_cents=0)
    recon = _build_shipping_reconciliation(s, BASE_ORDER)
    assert recon["integrity_mismatch"] is True
    assert recon["trusted_zone_cents"] == 0    # no zone matched
    assert recon["shipping"].get("zone_key") is None


# ────────────────────────────  PO Box advisory  ───
def test_reconciliation_sets_po_box_flag_advisory_only():
    s = _session(country="CA", stripe_amount_cents=0, address_line1="PO Box 42")
    recon = _build_shipping_reconciliation(s, BASE_ORDER)
    assert recon["shipping"]["po_box_flag"] is True
    # Never affects the mismatch flag or the shipping_cents value.
    assert recon["integrity_mismatch"] is False


def test_reconciliation_does_not_flag_street_address_as_po_box():
    s = _session(country="US", stripe_amount_cents=3500, address_line1="500 Fifth Ave")
    recon = _build_shipping_reconciliation(s, BASE_ORDER)
    assert recon["shipping"]["po_box_flag"] is False


# ────────────────────────────  Signature threshold at exactly the boundary  ───
def test_reconciliation_signature_required_at_exactly_500_usd():
    s = _session(country="US", stripe_amount_cents=3500)
    order = {**BASE_ORDER, "subtotal_cents": 50000}   # $500.00
    assert _build_shipping_reconciliation(s, order)["shipping"]["signature_required"] is True


def test_reconciliation_signature_not_required_at_499_99_usd():
    s = _session(country="US", stripe_amount_cents=3500)
    order = {**BASE_ORDER, "subtotal_cents": 49999}   # $499.99
    assert _build_shipping_reconciliation(s, order)["shipping"]["signature_required"] is False


# ────────────────────────────  No mutation guarantee  ───
def test_reconciliation_never_mutates_the_input_session():
    s = _session(country="GB", stripe_amount_cents=6500)
    snapshot = copy.deepcopy(s)
    _build_shipping_reconciliation(s, BASE_ORDER)
    assert s == snapshot   # pure function
