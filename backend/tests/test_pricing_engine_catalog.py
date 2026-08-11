"""Trusted-catalog tests for the pricing-engine-backed migration.

Verifies the reusable resolver in `services/pricing_engine_catalog.py`
correctly serves the ~30 newly migrated products.
"""
import pytest
from services.catalog import (
    resolve_line_item, compute_totals, CatalogError,
    is_supported, is_dynamic_priced,
)
from services.pricing_engine_catalog import (
    cad_to_usd_luxury, PRICING_ENGINE_CATALOG, ALL_SLUGS,
)


FRESH_MARKET = {
    "goldPerGram24kCad": 150.0, "silverPerGramCad": 1.25,
    "timestamp": 1_700_000_000, "source": "metals-api",
    "isFallback": False, "isStale": False, "ageSeconds": 60,
}


# ────────────────────────  cad_to_usd_luxury mirror  ────────────────────────
@pytest.mark.parametrize("cad, usd", [
    (1000,   750),      # 750 → step 50 → 750
    (1500,  1100),      # 1125 → step 50 → banker's round → 1100
    (2000,  1500),      # 1500 → raw < 2000 → step 50 → 1500
    (2665,  2000),      # ~2000 → raw≥2000 → step 500 → 2000
    (8000,  6000),      # 6000 → step 500 → 6000
    (0,        0),
    (-5,       0),
])
def test_cad_to_usd_luxury_matches_frontend(cad, usd):
    assert cad_to_usd_luxury(cad) == usd


# ────────────────────────  Slug registration  ────────────────────────
def test_all_migrated_slugs_are_supported():
    for slug in ALL_SLUGS:
        assert is_supported(slug), f"{slug} not supported by catalog"


# ────────────────────────  Hand-set USD (weightGrams=0) products  ─────
@pytest.mark.parametrize("slug, tier, sku_prefix, expected_cents", [
    # These are all currency=USD with lockedBasePriceCad numerically = USD.
    ("boss-knot",           "silver",         "BK",   320000),   # $3,200
    ("boss-knot",           "gold10k_yellow", "BK",   850000),   # $8,500
    ("lady-boss-knot",      "silver",         "LBK",  320000),
    ("veyron-noir",         "silver",         "VYN",  145000),   # $1,450 (needs size)
    ("veyron-noir",         "gold18k",        "VYN",  700000),
    ("wynette-palette",     "gold10k",        "WYN",  600000),   # $6,000
    ("wynette-palette",     "gold14k",        "WYN",  800000),
    ("uncle-jo",            "silver_ring",    "UJO",  110000),   # $1,100
    ("uncle-jo",            "gold10k_set",    "UJO",  780000),   # $7,800
    ("rose-of-sharon",      "grand_gold14k",  "ROS",  560000),   # $5,600
    ("battenti-della-villa","gold14k",        "BDV",  620000),
    ("gent",                "gold14k",        "GNT",  680000),   # (needs size)
    ("stackrats",           "dominique_wide", "STK",  290000),
    ("coogi-dna-tag",       "snow",           "CDT",  1133400),  # $11,334
    ("katrina-cascata",     "vermeil",        "KC",    49500),   # $495
    ("true-vine",           "signature__rope-22", "TV", 495000), # $4,950
])
def test_hand_set_usd_pricing(slug, tier, sku_prefix, expected_cents):
    cfg = PRICING_ENGINE_CATALOG[slug]
    # For products that require a size, pick a valid one from the profile.
    size = None
    if cfg["needs_size"]:
        size = "US 10" if cfg["size_profile"] in ("gents", "unisex") else "US 6"
    r = resolve_line_item(slug, None, None, size, 1, tier=tier, market_snapshot=FRESH_MARKET)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_cents
    assert r["sku"].startswith(sku_prefix + "-")


# ────────────────────────  Inspiration Vault fixed USD  ──────────────
@pytest.mark.parametrize("slug, expected_cents", [
    ("iv-first-discovery",     7500),   # $75
    ("iv-noir-cadence",       10000),   # $100
    ("iv-liaison",             5000),   # $50
    ("iv-noir-tide",          10000),
    ("iv-prismatic-laurel",    7000),   # $70
    ("iv-viridian-teardrops", 12000),   # $120
    ("iv-orbit-lumiere",      17500),   # $175
    ("iv-deco-eventail",       6000),
])
def test_inspiration_vault_fixed_prices(slug, expected_cents):
    r = resolve_line_item(slug, None, None, None, 1, tier="default", market_snapshot=None)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_cents
    assert r["is_dynamic_priced"] is False


# ────────────────────────  Dynamic-CAD converted to USD  ──────────────
@pytest.mark.parametrize("slug, tier, ring_size, expected_usd_cents", [
    # bamburgh.foundation lockedBasePriceCad=8200, ref=1400, weight=16, 14K.
    # Fresh Au 150 → current = 150*14/24*16 = 1400. Δ=0 → cad = 8200.
    # cadToUsdLuxury(8200) = 8200*0.75 = 6150 → step 500 → 6000. cents=600000.
    ("bamburgh",         "foundation", "US 10", 600000),
    # ladyBamburgh.foundation lockedBasePriceCad=11400, ref=1050, weight=12, 14K.
    # current = 150*14/24*12 = 1050. Δ=0 → cad=11400. USD=8550→step500→8500.
    ("lady-bamburgh",    "foundation", "US 6",  850000),
    # blessed.foundation Sterling silver 880 CAD, 12g, ref=14. Ag 1.25→cur=15.
    # Δ=1 → cadPrice=round_luxury(881)=900. USD=cadToUsdLuxury(900)=675 → step 50
    # → banker's round(13.5)=14 → 700. cents=70000.
    ("blessed",          "foundation", "US 10",  70000),
    # bound.foundation 12800 CAD (10K). Δ=0 → cad=12800. USD=9600→step500→9500.
    ("bound",            "foundation", "US 10", 950000),
    # apex.core 4800 CAD. USD=3600→step500→3500.
    ("apex",             "core",       "US 10", 350000),
    # cypher.foundation 4400. Δ=0. USD=3300→step500→3500.
    ("cypher",           "foundation", "US 10", 350000),
    # rosaria.foundation 2950 CAD 10K, 8g, ref=500. current=150*10/24*8=500. Δ=0.
    # cadPrice=2950. USD=2212.5→step 500→2000.
    ("rosaria",          "foundation", "US 6",  200000),
    # forme-cuff.foundation 695 (925, 30g, ref=35). current=1.25*30=37.5.
    # Δ=2.5 → cad=round_luxury(697.5)=700. USD=525→step50→500. cents=50000.
    ("forme-cuff",       "foundation", None,     50000),
])
def test_dynamic_usd_via_cadtousd_luxury(slug, tier, ring_size, expected_usd_cents):
    r = resolve_line_item(slug, None, None, ring_size, 1, tier=tier, market_snapshot=FRESH_MARKET)
    assert r["currency"] == "USD", f"{slug} should be USD"
    assert r["unit_amount_cents"] == expected_usd_cents, \
        f"{slug}/{tier}: expected {expected_usd_cents} got {r['unit_amount_cents']}"


# ────────────────────────  Validation errors  ──────────────
def test_ring_needs_size():
    with pytest.raises(CatalogError, match="MISSING_RING_SIZE"):
        resolve_line_item("bamburgh", None, None, None, 1,
                          tier="foundation", market_snapshot=FRESH_MARKET)

def test_invalid_size_rejected():
    with pytest.raises(CatalogError, match="INVALID_RING_SIZE"):
        # Ladies-profile drape rejects US 15
        resolve_line_item("drape", None, None, "US 15", 1,
                          tier="silver", market_snapshot=FRESH_MARKET)

def test_invalid_tier_rejected():
    with pytest.raises(CatalogError, match="INVALID_TIER"):
        resolve_line_item("apex", None, None, "US 10", 1,
                          tier="platinum", market_snapshot=FRESH_MARKET)

def test_missing_tier_rejected():
    with pytest.raises(CatalogError, match="MISSING_TIER"):
        resolve_line_item("blessed", None, None, "US 10", 1,
                          tier=None, market_snapshot=FRESH_MARKET)


# ────────────────────────  is_dynamic_priced flag  ──────────────
def test_hand_set_products_not_flagged_dynamic():
    for slug in ("boss-knot", "veyron-noir", "wynette-palette", "uncle-jo",
                 "iv-first-discovery", "iv-liaison", "coogi-dna-tag",
                 "battenti-della-villa", "gent", "stackrats", "true-vine"):
        assert not is_dynamic_priced(slug), f"{slug} should be static"

def test_dynamic_usd_products_are_flagged_dynamic():
    for slug in ("bamburgh", "apex", "cypher", "rosaria", "blessed", "bound"):
        assert is_dynamic_priced(slug), f"{slug} should be dynamic"


# ────────────────────────  Mixed-currency guard  ──────────────
def test_mixed_currency_boss_knot_usd_plus_la_marva_cad_rejected():
    r_usd = resolve_line_item("boss-knot", None, None, None, 1,
                              tier="silver", market_snapshot=FRESH_MARKET)
    r_cad = resolve_line_item("la-marva", None, None, "US 6", 1,
                              tier="foundation", market_snapshot=FRESH_MARKET)
    with pytest.raises(CatalogError, match="MIXED_CURRENCY_CART"):
        compute_totals([r_usd, r_cad])


def test_two_usd_products_totals_ok():
    a = resolve_line_item("boss-knot", None, None, None, 1,
                          tier="silver", market_snapshot=FRESH_MARKET)
    b = resolve_line_item("apex", None, None, "US 10", 1,
                          tier="core", market_snapshot=FRESH_MARKET)
    t = compute_totals([a, b])
    assert t["currency"] == "USD"
    assert t["subtotal_cents"] == a["unit_amount_cents"] + b["unit_amount_cents"]
