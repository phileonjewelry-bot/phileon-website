"""Unit tests for services.shipping_zones — Phase 1 destination-driven rates."""
import pytest
from services.shipping_zones import (
    ZONES, CURRENCY, SIGNATURE_REQUIRED_ABOVE_USD_CENTS,
    ShippingZone, ShippingZoneError,
    resolve_zone_for_country, all_allowed_countries,
    build_stripe_shipping_option, signature_required_for_subtotal,
    looks_like_po_box,
)


# ────────────────────────────  D1..D4 owner-approved rate anchors  ───
def test_ca_rate_is_zero_cents():
    assert ZONES["CA"].rate_cents == 0

def test_us_rate_is_3500_cents():
    assert ZONES["US"].rate_cents == 3500

def test_intl_tier_1_rate_is_6500_cents():
    assert ZONES["INTL_TIER_1"].rate_cents == 6500

def test_intl_tier_2_rate_is_9500_cents():
    assert ZONES["INTL_TIER_2"].rate_cents == 9500

def test_signature_threshold_is_50000_cents_usd():
    """D8 — restated in USD; no silent conversion from legacy C$1,000."""
    assert SIGNATURE_REQUIRED_ABOVE_USD_CENTS == 50000

def test_currency_is_usd_only():
    assert CURRENCY == "USD"


# ────────────────────────────  Country membership · D5 / D6  ───
@pytest.mark.parametrize("country,expected", [
    ("CA", "CA"),
    ("US", "US"),
    ("GB", "INTL_TIER_1"),
    ("IE", "INTL_TIER_1"),
    ("FR", "INTL_TIER_1"),
    ("DE", "INTL_TIER_1"),
    ("IT", "INTL_TIER_1"),
    ("ES", "INTL_TIER_1"),
    ("PT", "INTL_TIER_1"),
    ("NL", "INTL_TIER_1"),
    ("BE", "INTL_TIER_1"),
    ("LU", "INTL_TIER_1"),
    ("AT", "INTL_TIER_1"),
    ("CH", "INTL_TIER_1"),
    ("DK", "INTL_TIER_1"),
    ("SE", "INTL_TIER_1"),
    ("NO", "INTL_TIER_1"),
    ("FI", "INTL_TIER_1"),
    ("IS", "INTL_TIER_1"),
    ("AU", "INTL_TIER_1"),
    ("NZ", "INTL_TIER_1"),
    ("JP", "INTL_TIER_1"),
    ("SG", "INTL_TIER_1"),
    ("HK", "INTL_TIER_1"),
    ("KR", "INTL_TIER_1"),
    ("AE", "INTL_TIER_2"),
    ("QA", "INTL_TIER_2"),
    ("KW", "INTL_TIER_2"),
    ("BH", "INTL_TIER_2"),
    ("OM", "INTL_TIER_2"),
    ("SA", "INTL_TIER_2"),
    ("MX", "INTL_TIER_2"),
    ("BR", "INTL_TIER_2"),
    ("TW", "INTL_TIER_2"),
    ("MY", "INTL_TIER_2"),
    ("TH", "INTL_TIER_2"),
    ("ZA", "INTL_TIER_2"),
])
def test_resolve_zone_maps_country_to_expected_zone(country, expected):
    assert resolve_zone_for_country(country).key == expected


def test_resolve_zone_is_case_insensitive_and_trimmed():
    assert resolve_zone_for_country(" ca ").key == "CA"
    assert resolve_zone_for_country("us").key == "US"
    assert resolve_zone_for_country("Gb").key == "INTL_TIER_1"


# ────────────────────────────  Unsupported / invalid inputs  ───
@pytest.mark.parametrize("country", ["RU", "KP", "IR", "SY", "CU", "BY", "MM"])
def test_unsupported_country_rejected(country):
    with pytest.raises(ShippingZoneError, match="UNSUPPORTED_DESTINATION"):
        resolve_zone_for_country(country)


@pytest.mark.parametrize("bad_input", ["", "C", "CAN", "12", None, 123, "ca!"])
def test_invalid_country_format_rejected(bad_input):
    with pytest.raises(ShippingZoneError, match="INVALID_COUNTRY_FORMAT"):
        resolve_zone_for_country(bad_input)


# ────────────────────────────  Allowlist union  ───
def test_all_allowed_countries_union():
    all_c = all_allowed_countries()
    assert "CA" in all_c and "US" in all_c
    for c in ("GB", "IE", "FR", "DE", "AU", "JP", "SG"):
        assert c in all_c
    for c in ("AE", "MX", "BR", "TH", "ZA"):
        assert c in all_c
    # Sanctioned/excluded countries never appear.
    for c in ("RU", "KP", "IR", "SY"):
        assert c not in all_c


# ────────────────────────────  Stripe shipping-option builder  ───
@pytest.mark.parametrize("country,expected_cents,expected_zone", [
    ("CA", 0,    "Standard Shipping — Canada"),
    ("US", 3500, "Standard Shipping — United States"),
    ("GB", 6500, "International Standard — Tier 1"),
    ("MX", 9500, "International Standard — Tier 2"),
])
def test_build_stripe_shipping_option_returns_exactly_one_trusted_entry(country, expected_cents, expected_zone):
    opt = build_stripe_shipping_option(country)
    assert set(opt.keys()) == {"shipping_rate_data"}
    srd = opt["shipping_rate_data"]
    assert srd["type"] == "fixed_amount"
    assert srd["fixed_amount"] == {"amount": expected_cents, "currency": "usd"}
    assert srd["display_name"] == expected_zone
    assert srd["delivery_estimate"]["minimum"]["unit"] == "business_day"
    assert srd["delivery_estimate"]["maximum"]["unit"] == "business_day"


def test_build_stripe_shipping_option_rejects_unsupported():
    with pytest.raises(ShippingZoneError, match="UNSUPPORTED_DESTINATION"):
        build_stripe_shipping_option("KP")


# ────────────────────────────  Signature threshold  ───
def test_signature_required_below_threshold_is_false():
    zone = resolve_zone_for_country("CA")
    assert signature_required_for_subtotal(49999, zone) is False   # $499.99

def test_signature_required_at_threshold_is_true():
    zone = resolve_zone_for_country("US")
    assert signature_required_for_subtotal(50000, zone) is True    # $500.00

def test_signature_required_above_threshold_is_true():
    zone = resolve_zone_for_country("GB")
    assert signature_required_for_subtotal(50001, zone) is True    # $500.01


def test_signature_requires_zone_capability():
    """If a zone declared no signature support, the threshold cannot force it."""
    fake_zone = ShippingZone(
        key="FAKE", display_name="fake", carrier_label="fake",
        rate_cents=0, delivery_estimate_business_days=(1, 2),
        countries=frozenset({"XX"}), insurance_required=False,
        supports_signature_confirmation=False,
    )
    assert signature_required_for_subtotal(999999, fake_zone) is False


# ────────────────────────────  PO Box advisory detector  ───
@pytest.mark.parametrize("line1,expected", [
    ("PO Box 123",              True),
    ("P.O. Box 45",             True),
    ("p o box 9",               True),
    ("Post Office Box 1",       True),
    ("Postbox 7",               True),
    ("221B Baker Street",       False),
    ("123 Peachtree Ave, Apt 5",False),
    ("",                        False),
    (None,                      False),
])
def test_looks_like_po_box(line1, expected):
    assert looks_like_po_box(line1) is expected


# ────────────────────────────  Insurance semantics  ───
def test_all_active_zones_require_fulfillment_insurance():
    """Phase 1 correction: `insurance_required` is a fulfillment REQUIREMENT,
    not proof that carrier insurance has been purchased."""
    for zone in ZONES.values():
        assert zone.insurance_required is True


def test_no_zone_uses_insured_in_transit_field_name():
    """Field must be named `insurance_required`, not the earlier
    `insured_in_transit` sentinel."""
    import dataclasses
    field_names = {f.name for f in dataclasses.fields(ZONES["CA"])}
    assert "insurance_required" in field_names
    assert "insured_in_transit" not in field_names
