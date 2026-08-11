"""Trusted-catalog test — THE GRAND DAME wave 4 unblock.

The live GrandDamePage.jsx + products.theGrandDame publish FINAL fixed USD
pricing (Foundation $9,500 / Signature $12,500 / Heirloom $17,000, parity
across rose + yellow gold). The stale pricing_engine.LIVE_PRICING_CONFIG.
theGrandDame entry (all `lockedBasePriceCad: 0`) is expressly deprecated
and MUST NOT be used for checkout.
"""
import pytest
from services.catalog import resolve_line_item, compute_totals, CatalogError, is_supported, is_dynamic_priced
from services.pricing_engine_catalog import FIXED_PRODUCTS
from pricing_engine import LIVE_PRICING_CONFIG


# ────────────────────────  Trusted USD pricing per storefront  ─────
@pytest.mark.parametrize("tier, expected_cents, sku_suffix", [
    ("rose_foundation",    950000,  "ROSE-FND"),   # $9,500
    ("rose_signature",    1250000,  "ROSE-SIG"),   # $12,500
    ("rose_heirloom",     1700000,  "ROSE-HRL"),   # $17,000
    ("yellow_foundation",  950000,  "YEL-FND"),
    ("yellow_signature",  1250000,  "YEL-SIG"),
    ("yellow_heirloom",   1700000,  "YEL-HRL"),
])
def test_grand_dame_trusted_price_and_sku(tier, expected_cents, sku_suffix):
    r = resolve_line_item("the-grand-dame", None, None, None, 1,
                          tier=tier, market_snapshot=None)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_cents
    assert r["sku"] == f"GDM-{sku_suffix}"


# ────────────────────────  Registry  ─────
def test_grand_dame_is_supported():
    assert is_supported("the-grand-dame")

def test_grand_dame_is_static():
    # Cuff — no live metal pricing, no PRICE_MOVED participation.
    assert not is_dynamic_priced("the-grand-dame")


# ────────────────────────  Validation  ─────
def test_grand_dame_invalid_tier_rejected():
    with pytest.raises(CatalogError, match="INVALID_TIER"):
        resolve_line_item("the-grand-dame", None, None, None, 1,
                          tier="platinum_foundation", market_snapshot=None)

def test_grand_dame_missing_tier_rejected():
    with pytest.raises(CatalogError, match="MISSING_TIER"):
        resolve_line_item("the-grand-dame", None, None, None, 1,
                          tier=None, market_snapshot=None)

def test_grand_dame_does_not_require_ring_size():
    # It's a cuff, not a ring — the resolver never asks for a size.
    r = resolve_line_item("the-grand-dame", None, None, "US 6", 1,
                          tier="rose_foundation", market_snapshot=None)
    assert r["ring_size"] is None


# ────────────────────────  Client-price ignored  ─────
def test_client_supplied_price_is_ignored_for_grand_dame():
    # The resolver has no price argument. Only the tier drives the amount.
    r = resolve_line_item("the-grand-dame", None, None, None, 1,
                          tier="yellow_heirloom", market_snapshot=None)
    assert r["unit_amount_cents"] == 1700000  # $17,000 EXACT


# ────────────────────────  Stale config isolation  ─────
def test_stale_pricing_engine_entry_is_not_the_source():
    """Ensure the deprecated `LIVE_PRICING_CONFIG.theGrandDame` (all zero
    prices) has NO influence on the trusted checkout amounts. Only the
    FIXED_PRODUCTS entry drives the amount."""
    stale = LIVE_PRICING_CONFIG.get("theGrandDame", {})
    # Sanity: the stale entry still has zero prices (nothing changed there).
    assert all(t["lockedBasePriceCad"] == 0 for t in stale.values())
    # And the trusted resolver returns the storefront amounts anyway.
    r = resolve_line_item("the-grand-dame", None, None, None, 1,
                          tier="rose_signature", market_snapshot=None)
    assert r["unit_amount_cents"] == 1250000
