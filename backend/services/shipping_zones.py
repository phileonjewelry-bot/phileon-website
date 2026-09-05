"""PHILEON shipping zones — Phase 1 · destination-driven fixed USD rates.

Owner-approved values (D1..D11, Feb 2026):

    D1  Canada             $  0 USD  (complimentary)
    D2  United States      $ 35 USD
    D3  Intl Tier 1        $ 65 USD
    D4  Intl Tier 2        $ 95 USD
    D8  Signature required at or above $500 USD subtotal (pre shipping/tax)

Architecture invariants:
  * Currency is fixed to "USD" — destination, not currency, selects the zone.
  * `build_stripe_shipping_option(country)` returns EXACTLY ONE trusted
    Stripe shipping option for the resolved zone. No unknown-country
    fallback; no multi-option surfacing (Stripe-hosted Checkout does not
    dynamically re-price on address entry).
  * `insurance_required` / `signature_required` are FULFILLMENT REQUIREMENTS
    surfaced to the label-generation pipeline. They are NOT evidence that a
    Stripe-side or carrier-side product has already been purchased.

Excluded destinations return `UNSUPPORTED_DESTINATION`. The allowlist is an
owner-attested commercial allowlist reviewable against Canadian sanctions /
export restrictions, carrier availability, insurer restrictions, jewelry /
precious-metal shipment restrictions, and destination-jurisdiction
restrictions. There is no embedded sanctions engine.
"""
from dataclasses import dataclass
from typing import Dict, FrozenSet, Tuple, Optional

CURRENCY: str = "USD"

# D8 · owner-approved signature threshold. Applied to `subtotal_cents`
# (merchandise before shipping and tax).
SIGNATURE_REQUIRED_ABOVE_USD_CENTS: int = 50000


@dataclass(frozen=True)
class ShippingZone:
    key: str                                          # "CA" | "US" | "INTL_TIER_1" | "INTL_TIER_2"
    display_name: str                                 # shopper-facing label
    carrier_label: str                                # fulfillment-facing carrier preference (D9/D10/D11)
    rate_cents: int                                   # trusted USD cents (D1..D4)
    delivery_estimate_business_days: Tuple[int, int]  # (min, max)
    countries: FrozenSet[str]                         # ISO-3166-1 alpha-2 (D5/D6)
    insurance_required: bool                          # fulfillment REQUIREMENT · not confirmation
    supports_signature_confirmation: bool             # fulfillment capability


ZONES: Dict[str, ShippingZone] = {
    "CA": ShippingZone(
        key="CA",
        display_name="Standard Shipping — Canada",
        carrier_label="UPS (primary) · alternate carriers where appropriate",  # D9
        rate_cents=0,                                                          # D1
        delivery_estimate_business_days=(2, 7),
        countries=frozenset({"CA"}),
        insurance_required=True,
        supports_signature_confirmation=True,
    ),
    "US": ShippingZone(
        key="US",
        display_name="Standard Shipping — United States",
        carrier_label="UPS / FedEx",                                           # D10
        rate_cents=3500,                                                       # D2
        delivery_estimate_business_days=(3, 8),
        countries=frozenset({"US"}),
        insurance_required=True,
        supports_signature_confirmation=True,
    ),
    "INTL_TIER_1": ShippingZone(
        key="INTL_TIER_1",
        display_name="International Standard — Tier 1",
        carrier_label="DHL / UPS / FedEx",                                     # D11
        rate_cents=6500,                                                       # D3
        delivery_estimate_business_days=(5, 12),
        countries=frozenset({                                                  # D5
            "GB", "IE", "FR", "DE", "IT", "ES", "PT", "NL", "BE", "LU", "AT", "CH",
            "DK", "SE", "NO", "FI", "IS",
            "AU", "NZ",
            "JP", "SG", "HK", "KR",
        }),
        insurance_required=True,
        supports_signature_confirmation=True,
    ),
    "INTL_TIER_2": ShippingZone(
        key="INTL_TIER_2",
        display_name="International Standard — Tier 2",
        carrier_label="DHL / UPS / FedEx",                                     # D11
        rate_cents=9500,                                                       # D4
        delivery_estimate_business_days=(5, 12),
        countries=frozenset({                                                  # D6
            "AE", "QA", "KW", "BH", "OM", "SA",
            "MX", "BR",
            "TW", "MY", "TH",
            "ZA",
        }),
        insurance_required=True,
        supports_signature_confirmation=True,
    ),
}


class ShippingZoneError(Exception):
    """UNSUPPORTED_DESTINATION | SHIPPING_ZONES_UNCONFIGURED | INVALID_COUNTRY_FORMAT"""


def _normalize_country(country_alpha2) -> str:
    if not isinstance(country_alpha2, str):
        raise ShippingZoneError("INVALID_COUNTRY_FORMAT")
    c = country_alpha2.strip().upper()
    if len(c) != 2 or not c.isalpha():
        raise ShippingZoneError("INVALID_COUNTRY_FORMAT")
    return c


def resolve_zone_for_country(country_alpha2: str) -> ShippingZone:
    """Return exactly one trusted zone. Raises on unsupported destination or
    unconfigured zone. Never returns a fallback."""
    c = _normalize_country(country_alpha2)
    for zone in ZONES.values():
        if c in zone.countries:
            if zone.rate_cents < 0:
                raise ShippingZoneError("SHIPPING_ZONES_UNCONFIGURED")
            return zone
    raise ShippingZoneError("UNSUPPORTED_DESTINATION")


def all_allowed_countries() -> FrozenSet[str]:
    """Union of countries across every configured zone. Informational —
    the Stripe Session passes ONLY the shopper's selected country to
    `shipping_address_collection.allowed_countries`."""
    out: set = set()
    for zone in ZONES.values():
        out |= zone.countries
    return frozenset(out)


def build_stripe_shipping_option(country_alpha2: str,
                                  currency_override: Optional[str] = None,
                                  rate_cents_override: Optional[int] = None) -> dict:
    """Return EXACTLY ONE Stripe shipping option payload for the resolved
    zone. Currency defaults to `"usd"` and amount defaults to the trusted
    zone rate. Both may be overridden ONLY for the trusted CAD BNPL lane
    where the backend has already computed the CAD-quoted shipping amount
    via `services.fx_bnpl`; the caller carries the authority."""
    zone = resolve_zone_for_country(country_alpha2)
    cur = (currency_override or CURRENCY).lower()
    amt = int(rate_cents_override) if rate_cents_override is not None else zone.rate_cents
    return {
        "shipping_rate_data": {
            "type": "fixed_amount",
            "fixed_amount": {"amount": amt, "currency": cur},
            "display_name": zone.display_name,
            "delivery_estimate": {
                "minimum": {"unit": "business_day", "value": zone.delivery_estimate_business_days[0]},
                "maximum": {"unit": "business_day", "value": zone.delivery_estimate_business_days[1]},
            },
        },
    }


def signature_required_for_subtotal(subtotal_cents: int, zone: ShippingZone) -> bool:
    """Server-side derivation of the fulfillment signature-required flag.
    Threshold is measured against merchandise subtotal (before shipping and
    tax) per D8."""
    return bool(
        subtotal_cents >= SIGNATURE_REQUIRED_ABOVE_USD_CENTS
        and zone.supports_signature_confirmation
    )


def looks_like_po_box(address_line1: str) -> bool:
    """Advisory PO Box detector. Sets an `OrderV2Shipping.po_box_flag` for
    fulfillment review — NEVER rejects a paid order or falsifies payment
    state. Deliberately conservative; false positives are preferable to
    false negatives here."""
    if not address_line1 or not isinstance(address_line1, str):
        return False
    s = address_line1.strip().lower()
    return any(token in s for token in (
        "p.o. box", "po box", "p o box", "p.o.box", "po-box",
        "post office box", "post-office box", "postbox", "post box",
    ))
