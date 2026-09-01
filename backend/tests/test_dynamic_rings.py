"""Trusted catalog tests for the 7 live-priced dynamic rings.

Run: cd /app/backend && python -m pytest tests/test_dynamic_rings.py -v

Covers:
  • Each dynamic ring's base/premium tier resolution
  • CAD currency + integer cents math (mocked market snapshot)
  • Invalid tier / size rejection
  • Client-supplied price ignored (server-authoritative)
  • Fresh / stale-usable snapshot accepted; fallback / expired rejected
  • PRICE_MOVED threshold logic ($50 floor and 1% above threshold)
"""
import pytest
from services.catalog import (
    resolve_line_item, compute_totals, CatalogError,
    is_supported, is_dynamic_priced, DYNAMIC_RING_SLUGS,
    detect_price_move, price_move_threshold_cents,
    PRICE_MOVE_MIN_CENTS,
)
from services import metal_spot as ms


# A deterministic, checkout-safe market snapshot for tests.
# Chosen to match the fallback exactly so `delta = current_ref - lockedRef = 0`
# whenever the tier's `lockedMetalReferenceCad` was computed at the same rates
# (150 CAD/g Au 24K, 1.25 CAD/g Ag). This makes assertions deterministic.
FRESH_MARKET = {
    "goldPerGram24kCad": 150.0,
    "silverPerGramCad":  1.25,
    "timestamp": 1_700_000_000,
    "source": "metals-api",
    "isFallback": False, "isStale": False,
    "ageSeconds": 60,
}

# A stale-but-usable snapshot (18 min old).
STALE_USABLE_MARKET = {**FRESH_MARKET, "isStale": True, "ageSeconds": 18 * 60}

# Fallback (never checkout-safe).
FALLBACK_MARKET = {
    "goldPerGram24kCad": 150.0, "silverPerGramCad": 1.25,
    "timestamp": 1_700_000_000, "source": "phileon-fallback",
    "isFallback": True, "isStale": False, "ageSeconds": 0,
}


# ────────────────────────  Registry / support flags  ────────────────────────
def test_all_seven_slugs_registered():
    expected = {
        "la-marva", "annie-rose", "rhythm-mesh-ring", "tola-ii",
        "parabola", "parabola-heritage", "ovation",
    }
    assert expected <= DYNAMIC_RING_SLUGS
    for s in expected:
        assert is_supported(s)
        assert is_dynamic_priced(s)

def test_static_products_are_not_flagged_dynamic():
    for s in ("scacco-matto", "ribbon-regale-edition", "quadriga-dominus", "bajan-joe"):
        assert is_supported(s)
        assert not is_dynamic_priced(s)


# ────────────────────────  Missing snapshot rejection  ────────────────────────
@pytest.mark.parametrize("slug, tier, size", [
    ("la-marva",          "foundation",   "US 6"),
    ("annie-rose",        "signature",    "US 6"),
    ("rhythm-mesh-ring",  "foundation",   "US 10"),
    ("tola-ii",           "signature",    "US 10"),
    ("parabola",          "sterling",     "US 6"),
    ("parabola-heritage", "whiteGold10k", "US 10"),
    ("ovation",           "yellow10k",    "US 8"),
])
def test_dynamic_resolver_requires_market_snapshot(slug, tier, size):
    with pytest.raises(CatalogError, match="LIVE_PRICE_UNAVAILABLE"):
        resolve_line_item(slug, None, None, size, 1, tier=tier, market_snapshot=None)


# ────────────────────────  Per-ring pricing (with fallback-equal market)  ────
# When the market matches the locked reference exactly, the formula yields
# lockedBasePriceCad (rounded to nearest $50) → integer cents.
@pytest.mark.parametrize("slug, tier, size, cents", [
    ("la-marva",          "foundation",    "US 6",  800000),   # $8,000 CAD
    ("la-marva",          "signature",     "US 6",  1800000),  # $18,000
    ("la-marva",          "heirloom",      "US 7",  2200000),  # $22,000
    ("annie-rose",        "foundation",    "US 6",  920000),   # $9,200
    ("annie-rose",        "signature",     "US 6",  1380000),  # $13,800
    ("annie-rose",        "heirloom",      "US 7",  1840000),  # $18,400
    ("rhythm-mesh-ring",  "foundation",    "US 10", 145000),   # $1,450 (silver)
    ("rhythm-mesh-ring",  "signature",     "US 10", 280000),   # $2,800
    ("rhythm-mesh-ring",  "heirloom",      "US 10", 420000),   # $4,200
    ("tola-ii",           "foundation",    "US 10", 520000),   # $5,200
    ("tola-ii",           "signature",     "US 10", 780000),   # $7,800
    ("tola-ii",           "heirloom",      "US 10", 1100000),  # $11,000
    ("parabola",          "sterling",      "US 6",  125000),   # $1,250 (locked, wg=0)
    ("parabola",          "whiteGold10k",  "US 6",  780000),   # $7,800
    ("parabola",          "roseGold10k",   "US 7",  780000),
    ("parabola-heritage", "sterling",      "US 10", 125000),
    ("parabola-heritage", "whiteGold10k",  "US 10", 780000),
    ("parabola-heritage", "yellowGold10k", "US 11", 780000),
    ("ovation",           "silver",        "US 8",  20000),    # $225 → rounds to $200 ($50 luxury increments)
    ("ovation",           "yellow10k",     "US 8",  85000),    # $850
    ("ovation",           "white10k",      "US 9",  85000),
    ("ovation",           "yellow14k",     "US 8",  110000),   # $1,100
    ("ovation",           "white14k",      "US 9",  110000),
    ("ovation",           "yellow18k",     "US 8",  140000),   # $1,400
    ("ovation",           "white18k",      "US 10", 140000),
])
def test_dynamic_pricing_at_reference_market(slug, tier, size, cents):
    """`cents` in this parametrize is the historical CAD amount (kept as
    the human-readable anchor). Post-migration the resolver returns USD via
    cad_to_usd_luxury, so we convert once here to build the expected."""
    from services.pricing_engine_catalog import cad_to_usd_luxury
    expected_usd_cents = int(cad_to_usd_luxury(cents / 100.0)) * 100
    r = resolve_line_item(slug, None, None, size, 1, tier=tier, market_snapshot=FRESH_MARKET)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_usd_cents
    assert r["is_dynamic_priced"] is True


# ────────────────────────  Market movement (Au +$5/g)  ───────────────────────
def test_gold_price_uplift_moves_only_gold_tiers():
    """+$5/g on 24K gold. LA MARVA foundation (10K, 18g) should move by:
       0.416667 * 5 * 18 = $37.50 → rounded to $50 luxury increment (CAD).
       Post-migration the CAD result then converts to USD via cad_to_usd_luxury.
    """
    from services.pricing_engine_catalog import cad_to_usd_luxury
    up_market = {**FRESH_MARKET, "goldPerGram24kCad": 155.0}
    r_la = resolve_line_item("la-marva", None, None, "US 6", 1, tier="foundation",
                             market_snapshot=up_market)
    assert r_la["unit_amount_cents"] == int(cad_to_usd_luxury(8050)) * 100

    r_silver = resolve_line_item("rhythm-mesh-ring", None, None, "US 10", 1,
                                 tier="foundation", market_snapshot=up_market)
    # Sterling silver tier unaffected by gold spot movement.
    assert r_silver["unit_amount_cents"] == int(cad_to_usd_luxury(1450)) * 100


# ────────────────────────  Invalid tier / size  ─────────────────────────────
def test_invalid_tier_rejected():
    with pytest.raises(CatalogError, match="INVALID_TIER"):
        resolve_line_item("la-marva", None, None, "US 6", 1,
                          tier="platinum", market_snapshot=FRESH_MARKET)

def test_missing_tier_rejected():
    with pytest.raises(CatalogError, match="MISSING_TIER"):
        resolve_line_item("la-marva", None, None, "US 6", 1,
                          tier=None, market_snapshot=FRESH_MARKET)

def test_invalid_size_ladies_rejects_gents_size():
    # La Marva is ladies-profile (US 4-11). US 15 is out of range.
    with pytest.raises(CatalogError, match="INVALID_RING_SIZE"):
        resolve_line_item("la-marva", None, None, "US 15", 1,
                          tier="foundation", market_snapshot=FRESH_MARKET)

def test_invalid_size_gents_rejects_ladies_size():
    # TOLA II is gents-profile (US 7-15). US 4 is out of range.
    with pytest.raises(CatalogError, match="INVALID_RING_SIZE"):
        resolve_line_item("tola-ii", None, None, "US 4", 1,
                          tier="foundation", market_snapshot=FRESH_MARKET)

def test_missing_size_rejected():
    with pytest.raises(CatalogError, match="MISSING_RING_SIZE"):
        resolve_line_item("parabola", None, None, None, 1,
                          tier="sterling", market_snapshot=FRESH_MARKET)


# ────────────────────────  Client price cannot influence server  ────────────
def test_client_supplied_price_ignored():
    # Even if a rogue payload injected a `unit_amount_cents` or `price`,
    # `resolve_line_item()` does not accept a price argument — it cannot
    # influence the outcome by construction. The server value is fixed.
    r = resolve_line_item("tola-ii", None, None, "US 10", 1,
                          tier="foundation", market_snapshot=FRESH_MARKET)
    # Post USD-only migration: 520000 CAD cents → 400000 USD cents.
    from services.pricing_engine_catalog import cad_to_usd_luxury
    assert r["unit_amount_cents"] == int(cad_to_usd_luxury(5200)) * 100


# ────────────────────────  Market-safety semantics via metal_spot  ─────────────
def test_is_checkout_safe_fresh_true():
    assert ms.is_checkout_safe(FRESH_MARKET) is True

def test_is_checkout_safe_stale_usable_true():
    assert ms.is_checkout_safe(STALE_USABLE_MARKET) is True

def test_is_checkout_safe_fallback_false():
    assert ms.is_checkout_safe(FALLBACK_MARKET) is False

def test_is_checkout_safe_expired_false():
    over = {**FRESH_MARKET, "ageSeconds": 31 * 60}
    assert ms.is_checkout_safe(over) is False


# ────────────────────────  PRICE_MOVED threshold logic  ─────────────────────
def test_threshold_min_50_dollars():
    # Any small displayed price: threshold floor is $50 (5000 cents).
    assert price_move_threshold_cents(150000) == PRICE_MOVE_MIN_CENTS  # 1% of $1500 = $15 < $50
    assert price_move_threshold_cents(0) == PRICE_MOVE_MIN_CENTS
    assert price_move_threshold_cents(None) == PRICE_MOVE_MIN_CENTS  # type: ignore[arg-type]

def test_threshold_scales_with_1_percent():
    assert price_move_threshold_cents(800000)   == 8000   # $8,000 → $80 = 1%
    assert price_move_threshold_cents(1200000)  == 12000  # $12,000 → $120
    assert price_move_threshold_cents(2500000)  == 25000  # $25,000 → $250

def test_price_move_below_threshold_returns_none():
    # $8,000 displayed → threshold $80. Movement of $30 must NOT trigger.
    assert detect_price_move(800000, 803000) is None

def test_price_move_exactly_at_threshold_no_trigger():
    # Movement equal to threshold is not "beyond" — no PRICE_MOVED.
    assert detect_price_move(800000, 808000) is None

def test_price_move_above_threshold_triggers():
    # $8,000 displayed, threshold $80. New $8,081 → delta $81 > $80 → moved.
    m = detect_price_move(800000, 808100)
    assert m is not None
    assert m["old_display_price_cents"] == 800000
    assert m["new_trusted_price_cents"] == 808100
    assert m["delta_cents"] == 8100
    assert m["threshold_cents"] == 8000

def test_price_move_50_floor_kicks_in_for_low_ticket():
    # $1,500 displayed: 1% = $15 → floor lifts threshold to $50.
    # A $60 movement (>$50) triggers.
    m = detect_price_move(150000, 156000)
    assert m is not None and m["threshold_cents"] == PRICE_MOVE_MIN_CENTS
    # A $45 movement stays under the $50 floor.
    assert detect_price_move(150000, 154500) is None

def test_price_move_missing_displayed_snapshot_never_triggers():
    # Contract: if client omits `displayed_unit_amount_cents`, we cannot
    # compute a movement — treat as fresh and let checkout proceed.
    assert detect_price_move(None, 900000) is None
    assert detect_price_move(0, 900000) is None


# ────────────────────────  Regression: static products still work  ─────────
def test_regression_scacco_still_static_usd():
    r = resolve_line_item("scacco-matto", "10K", "Yellow Gold", "US 7", 1)
    assert r["currency"] == "USD" and r["unit_amount_cents"] == 390000

def test_regression_rre_migrated_to_usd():
    """Post Feb 2026 USD-only migration: RRE 14K CAD $1,895 → USD $1,400."""
    r = resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant="14k")
    assert r["currency"] == "USD" and r["unit_amount_cents"] == 140000

def test_regression_quadriga_still_static_usd():
    r = resolve_line_item("quadriga-dominus", "14K", "red-black", "US 11", 1)
    assert r["currency"] == "USD" and r["unit_amount_cents"] == 1225000

def test_regression_bajan_joe_still_static_795_usd():
    r = resolve_line_item("bajan-joe", None, None, "US 10", 1, variant="polish")
    assert r["currency"] == "USD" and r["unit_amount_cents"] == 79500


# ────────────────────────  Defensive mixed-currency guard  ────────────────
def test_mixed_currency_defensive_guard_via_fabricated_cad():
    """Post USD-only migration no legitimate product yields CAD. Fabricate a
    CAD-tagged resolver output at the seam to prove the defensive guard is
    still active in compute_totals."""
    r_usd = resolve_line_item("bajan-joe", None, None, "US 10", 1, variant="polish")
    r_para = resolve_line_item("parabola", None, None, "US 6", 1,
                                tier="sterling", market_snapshot=FRESH_MARKET)
    fabricated_cad = {**r_para, "currency": "CAD"}
    with pytest.raises(CatalogError, match="MIXED_CURRENCY_CART"):
        compute_totals([r_usd, fabricated_cad])

def test_two_dynamic_items_ok_all_usd():
    a = resolve_line_item("la-marva", None, None, "US 6", 1,
                          tier="foundation", market_snapshot=FRESH_MARKET)
    b = resolve_line_item("tola-ii", None, None, "US 10", 1,
                          tier="foundation", market_snapshot=FRESH_MARKET)
    t = compute_totals([a, b])
    assert t["currency"] == "USD"
    assert t["subtotal_cents"] == a["unit_amount_cents"] + b["unit_amount_cents"]
