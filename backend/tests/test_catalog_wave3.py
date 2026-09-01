"""Trusted-catalog tests for wave 3: Inspiration Vault fixed USD + re-audit.

Every product resolves to the EXACT USD amount currently shown on the
storefront. No new tiers were invented; no precious-metal expansion.
"""
import pytest
from services.catalog import (
    resolve_line_item, compute_totals, CatalogError, is_supported, is_dynamic_priced,
)
from services.pricing_engine_catalog import FIXED_PRODUCTS


# ────────────────────────  Inspiration Vault — single fixed USD  ─────────
@pytest.mark.parametrize("slug, price, sku_suffix", [
    ("iv-altar",                 40,  "CRX"),
    ("iv-caged-wings",           70,  "PR"),
    ("iv-driven",                75,  "01"),
    ("iv-echelle",              115,  "3TG"),
    ("iv-lucent",                70,  "CHN"),
    ("iv-monaco",                60,  "2F"),
    ("iv-nova",                  80,  "PR"),
    ("iv-oriel",                 40,  "RSW"),
    ("iv-parabola-atelier",     100,  "STUDY"),
    ("iv-parallax-drop-earrings",70, "DROPS"),
    ("iv-ribbon-regale",         30,  "REGALE"),
    ("iv-roseline",              50,  "RG"),
    ("iv-stampede-set",         150,  "SET"),
    ("iv-nightfang-set",        185,  "SET"),
])
def test_vault_fixed_price_matches_storefront(slug, price, sku_suffix):
    r = resolve_line_item(slug, None, None, None, 1, tier="default", market_snapshot=None)
    assert is_supported(slug)
    assert not is_dynamic_priced(slug)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == price * 100
    assert r["sku"].endswith(f"-{sku_suffix}")

def test_vault_defaults_to_sole_variant():
    # A caller omitting tier should still land on `default` because these
    # products only have one variant.
    r = resolve_line_item("iv-altar", None, None, None, 1, tier=None, market_snapshot=None)
    assert r["unit_amount_cents"] == 4000


# ────────────────────────  Re-audit single-variant products  ─────────
@pytest.mark.parametrize("slug, tier, price", [
    ("drew-face",              "vault",     850),
    ("la-madonna",             "10k-yellow", 28500),
    ("la-scarpa-della-regina", "18k-rose",   9000),
    ("midweek",                "silver-black-dia", 850),
])
def test_reaudit_single_variant_static_usd(slug, tier, price):
    r = resolve_line_item(slug, None, None, None, 1, tier=tier, market_snapshot=None)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == price * 100
    assert not is_dynamic_priced(slug)


# ────────────────────────  Re-audit multi-variant products  ─────────
@pytest.mark.parametrize("slug, tier, ring_size, price", [
    # BAPE — 3 metal tiers, requires size.
    ("bape",         "10k-yellow", "US 10",  9500),
    ("bape",         "14k-yellow", "US 10", 12500),
    ("bape",         "18k-yellow", "US 10", 17000),
    # LISA — 2 emerald tiers, ladies size.
    ("lisa",         "emerald-tight", "US 6", 5500),
    ("lisa",         "emerald-open",  "US 7", 9000),
    # CARAPACE — 4 metal tiers, requires size.
    ("the-carapace", "vermeil",      "US 6",  350),
    ("the-carapace", "vermeil-pave", "US 6",  600),
    ("the-carapace", "10k",          "US 6", 1100),
    ("the-carapace", "10k-pave",     "US 6", 1450),
    # NEIGHBORHOOD NIP — original + custom, gents size.
    ("neighborhood-nip", "original", "US 10", 15000),
    ("neighborhood-nip", "custom",   "US 10", 15750),
])
def test_reaudit_multivariant_static_usd(slug, tier, ring_size, price):
    r = resolve_line_item(slug, None, None, ring_size, 1, tier=tier, market_snapshot=None)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == price * 100
    assert r["ring_size"] == ring_size
    assert not is_dynamic_priced(slug)


# ────────────────────────  Validation  ─────────
def test_bape_invalid_metal_tier_rejected():
    with pytest.raises(CatalogError, match="INVALID_TIER"):
        resolve_line_item("bape", None, None, "US 10", 1,
                          tier="24k-yellow", market_snapshot=None)

def test_bape_requires_size():
    with pytest.raises(CatalogError, match="MISSING_RING_SIZE"):
        resolve_line_item("bape", None, None, None, 1,
                          tier="14k-yellow", market_snapshot=None)

def test_carapace_ladies_size_accepted():
    # unisex profile
    r = resolve_line_item("the-carapace", None, None, "US 4.5", 1,
                          tier="10k", market_snapshot=None)
    assert r["unit_amount_cents"] == 110000

def test_neighborhood_nip_ladies_size_rejected():
    # gents profile — US 4 is ladies-only
    with pytest.raises(CatalogError, match="INVALID_RING_SIZE"):
        resolve_line_item("neighborhood-nip", None, None, "US 4", 1,
                          tier="original", market_snapshot=None)

def test_client_supplied_price_ignored():
    # Even if the API payload injected a wildly wrong price hint, the server
    # cannot honour it — `resolve_line_item` has no price argument.
    r = resolve_line_item("iv-altar", None, None, None, 1,
                          tier="default", market_snapshot=None)
    assert r["unit_amount_cents"] == 4000  # $40 exactly


# ────────────────────────  Mixed currency (vault USD + LA MARVA CAD)  ─────
def test_mixed_currency_defensive_guard_still_active_post_migration():
    """Post USD-only migration, both iv-altar and la-marva now return USD,
    so we fabricate a mixed-currency payload directly at the totals layer
    to prove the defensive guard is still active."""
    a = resolve_line_item("iv-altar", None, None, None, 1, tier="default", market_snapshot=None)
    fabricated_cad = {**a, "currency": "CAD"}
    with pytest.raises(CatalogError, match="MIXED_CURRENCY_CART"):
        compute_totals([a, fabricated_cad])


# ────────────────────────  Registry integrity  ─────────
def test_all_wave3_slugs_registered():
    expected = {
        "iv-altar", "iv-caged-wings", "iv-driven", "iv-echelle", "iv-lucent",
        "iv-monaco", "iv-nova", "iv-oriel", "iv-parabola-atelier",
        "iv-parallax-drop-earrings", "iv-ribbon-regale", "iv-roseline",
        "iv-stampede-set", "iv-nightfang-set",
        "drew-face", "la-madonna", "la-scarpa-della-regina", "midweek",
        "bape", "lisa", "the-carapace", "neighborhood-nip",
    }
    assert expected <= set(FIXED_PRODUCTS.keys())
    for s in expected:
        assert is_supported(s)
