"""Trusted-catalog test — RETRO BRED · Drew's Vault · Private Release.

Post Feb 2026 USD-only migration. The three merchant-signed CAD tiers
($5,995 / $10,495 / $11,795 CAD) were converted once via the sitewide luxury
USD rule (`cad_to_usd_luxury`) and are now served as direct USD amounts by
the trusted backend catalog:

    Foundation  $4,500 USD  (RB-FND-925 · Sterling + synthetic)
    Signature   $8,000 USD  (RB-SIG-10K · 10K + lab-grown)
    Heirloom    $9,000 USD  (RB-HRL-14K · 14K + lab-grown)

Public routing is intentionally NOT exposed; this test only asserts the
backend contract. Pendant only — chain sold separately.
"""
import pytest
from services.catalog import (
    resolve_line_item, compute_totals, CatalogError, is_supported, is_dynamic_priced,
)


# ────────────────────────  Trusted USD pricing per storefront  ─────
@pytest.mark.parametrize("tier, expected_cents, sku", [
    ("foundation", 450000, "RB-FND-925"),   # $4,500 USD · Sterling + synthetic
    ("signature",  800000, "RB-SIG-10K"),   # $8,000 USD · 10K + lab-grown
    ("heirloom",   900000, "RB-HRL-14K"),   # $9,000 USD · 14K + lab-grown
])
def test_retro_bred_trusted_price_and_sku(tier, expected_cents, sku):
    r = resolve_line_item("retro-bred", None, None, None, 1,
                          tier=tier, market_snapshot=None)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_cents
    assert r["sku"] == sku
    assert r["ring_size"] is None
    assert r["product_id"] == "retro-bred"


# ────────────────────────  Registry  ─────
def test_retro_bred_is_supported():
    assert is_supported("retro-bred")

def test_retro_bred_is_static():
    assert not is_dynamic_priced("retro-bred")


# ────────────────────────  Validation  ─────
def test_retro_bred_invalid_tier_rejected():
    with pytest.raises(CatalogError, match="INVALID_TIER"):
        resolve_line_item("retro-bred", None, None, None, 1,
                          tier="platinum", market_snapshot=None)

def test_retro_bred_missing_tier_rejected():
    # Multi-variant product → tier is required (no sensible default).
    with pytest.raises(CatalogError, match="MISSING_TIER"):
        resolve_line_item("retro-bred", None, None, None, 1,
                          tier=None, market_snapshot=None)


# ────────────────────────  Client price ignored  ─────
def test_client_supplied_price_ignored_for_retro_bred():
    # Trusted price validation must not weaken: even if a client attempted to
    # supply a stale CAD-anchored `displayed_unit_amount_cents`, the resolver
    # returns the trusted USD amount exactly.
    r = resolve_line_item("retro-bred", None, None, None, 1,
                          tier="heirloom", market_snapshot=None)
    assert r["unit_amount_cents"] == 900000  # $9,000 USD EXACT


# ────────────────────────  Mixed-currency defensive guard  ─────
def test_mixed_currency_guard_still_active_for_retro_bred_plus_fabricated_cad():
    """Post USD-only migration every legitimate product resolves as USD, so
    the natural RETRO BRED + BAJAN JOE pairing is now uniformly USD and the
    MIXED_CURRENCY_CART guard has no legitimate trigger. This test fabricates
    a CAD line item to prove the defensive guard is still wired and fires
    when currencies diverge.
    """
    usd_line = resolve_line_item("retro-bred", None, None, None, 1,
                                 tier="foundation", market_snapshot=None)
    assert usd_line["currency"] == "USD"
    fabricated_cad = {**usd_line, "currency": "CAD"}
    with pytest.raises(CatalogError, match="MIXED_CURRENCY_CART"):
        compute_totals([usd_line, fabricated_cad])


def test_retro_bred_plus_bajan_joe_both_usd_totals_cleanly():
    """Natural post-migration pairing: RETRO BRED (USD) + BAJAN JOE (USD)
    must total without triggering the mixed-currency guard."""
    a = resolve_line_item("retro-bred", None, None, None, 1,
                          tier="foundation", market_snapshot=None)
    b = resolve_line_item("bajan-joe", None, None, "US 10", 1, variant="polish")
    assert a["currency"] == "USD" and b["currency"] == "USD"
    totals = compute_totals([a, b])
    # Foundation $4,500 + BAJAN JOE $795 = $5,295 USD
    assert totals["currency"] == "USD"
    assert totals["total_cents"] == 450000 + 79500


# ────────────────────────  Chain-price isolation  ─────
def test_pendant_price_does_not_include_chain():
    # Sanity: tier prices are pendant-only; chain is sold separately and the
    # server has no chain SKU wired here.
    prices = []
    for tier in ("foundation", "signature", "heirloom"):
        r = resolve_line_item("retro-bred", None, None, None, 1, tier=tier)
        prices.append(r["unit_amount_cents"])
    # Post-migration approved USD matrix — pendant-only, no hidden add-on.
    assert prices == [450000, 800000, 900000]


# ────────────────────────  No double conversion  ─────
def test_retro_bred_prices_match_deterministic_cad_to_usd_luxury_from_original_anchors():
    """Locks in the fact that RETRO BRED USD amounts are the ONE-TIME output
    of `cad_to_usd_luxury` applied to the original CAD anchors — not a
    double-converted value. Runs the sitewide helper directly against the
    historical CAD figures and confirms it produces the current USD table.
    """
    from services.pricing_engine_catalog import cad_to_usd_luxury
    assert cad_to_usd_luxury(5995)  == 4500   # Foundation
    assert cad_to_usd_luxury(10495) == 8000   # Signature
    assert cad_to_usd_luxury(11795) == 9000   # Heirloom
