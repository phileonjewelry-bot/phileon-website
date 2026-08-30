"""Trusted-catalog tests — H.E.R. · HER ETERNAL REIGN · Ladies Fine Jewelry.

Server-authoritative size → figure-count mapping. Client cannot claim a
lower figure count to shave the price. Currency: USD.
"""
import pytest
from services.catalog import (
    resolve_line_item, compute_totals, CatalogError, is_supported, is_dynamic_priced,
)


# ────────────────────────  12 pricing branches (figure × metal)  ─────
# USD pricing:
#   10K → base $4,995 · +$225 per additional figure
#   14K → base $6,495 · +$250 per additional figure
#   18K → base $7,595 · +$300 per additional figure
@pytest.mark.parametrize("size, tier, figures, expected_cents, sku", [
    # 17 figures
    ("US 6",   "10k", 17,  499500, "HER-10K-F17-SZ6"),
    ("US 6.5", "14k", 17,  649500, "HER-14K-F17-SZ6-5"),
    ("US 7",   "10k", 17,  499500, "HER-10K-F17-SZ7"),
    ("US 7",   "14k", 17,  649500, "HER-14K-F17-SZ7"),
    ("US 7",   "18k", 17,  759500, "HER-18K-F17-SZ7"),
    # 18 figures (+1)
    ("US 7.5", "10k", 18,  522000, "HER-10K-F18-SZ7-5"),
    ("US 8",   "10k", 18,  522000, "HER-10K-F18-SZ8"),
    ("US 8",   "14k", 18,  674500, "HER-14K-F18-SZ8"),
    ("US 8",   "18k", 18,  789500, "HER-18K-F18-SZ8"),
    # 19 figures (+2)
    ("US 8.5", "18k", 19,  819500, "HER-18K-F19-SZ8-5"),
    ("US 9",   "10k", 19,  544500, "HER-10K-F19-SZ9"),
    ("US 9",   "14k", 19,  699500, "HER-14K-F19-SZ9"),
    ("US 9",   "18k", 19,  819500, "HER-18K-F19-SZ9"),
    # 20 figures (+3)
    ("US 9.5", "14k", 20,  724500, "HER-14K-F20-SZ9-5"),
    ("US 10",  "10k", 20,  567000, "HER-10K-F20-SZ10"),
    ("US 10",  "14k", 20,  724500, "HER-14K-F20-SZ10"),
    ("US 10",  "18k", 20,  849500, "HER-18K-F20-SZ10"),
])
def test_her_pricing_matrix(size, tier, figures, expected_cents, sku):
    r = resolve_line_item("her-eternal-reign", None, None, size, 1,
                          tier=tier, market_snapshot=None)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_cents
    assert r["figure_count"] == figures
    assert r["stones_total"] == figures * 3
    assert r["sku"] == sku


# ────────────────────────  Registry  ─────
def test_her_is_supported():
    assert is_supported("her-eternal-reign")

def test_her_is_static():
    assert not is_dynamic_priced("her-eternal-reign")


# ────────────────────────  Validation  ─────
def test_size_5_rejected():
    with pytest.raises(CatalogError, match="INVALID_RING_SIZE"):
        resolve_line_item("her-eternal-reign", None, None, "US 5", 1, tier="14k")

def test_size_10_5_rejected():
    with pytest.raises(CatalogError, match="INVALID_RING_SIZE"):
        resolve_line_item("her-eternal-reign", None, None, "US 10.5", 1, tier="14k")

def test_malformed_half_size_rejected():
    with pytest.raises(CatalogError, match="INVALID_RING_SIZE"):
        resolve_line_item("her-eternal-reign", None, None, "US 7.25", 1, tier="14k")

def test_invalid_karat_rejected():
    with pytest.raises(CatalogError, match="INVALID_TIER"):
        resolve_line_item("her-eternal-reign", None, None, "US 7", 1, tier="silver")

def test_missing_ring_size_rejected():
    with pytest.raises(CatalogError, match="MISSING_RING_SIZE"):
        resolve_line_item("her-eternal-reign", None, None, None, 1, tier="14k")

def test_missing_tier_rejected():
    with pytest.raises(CatalogError, match="MISSING_TIER"):
        resolve_line_item("her-eternal-reign", None, None, "US 7", 1, tier=None)


# ────────────────────────  Client-tamper resistance  ─────
def test_client_price_ignored():
    # Even with wild ideas from the client, the resolver has no price arg.
    r = resolve_line_item("her-eternal-reign", None, None, "US 10", 1, tier="18k")
    # 18K · 20 figures = 7595 + 3×300 = 8495 → 849500 cents
    assert r["unit_amount_cents"] == 849500

def test_figure_count_is_derived_server_side():
    # Client sends US 10 (which is 20 figures) — server must charge the
    # 20-figure price, not the 17-figure base.
    r = resolve_line_item("her-eternal-reign", None, None, "US 10", 1, tier="10k")
    assert r["figure_count"] == 20
    # 10K · 20 figures = 4995 + 3×225 = 5670 → 567000 cents
    assert r["unit_amount_cents"] == 567000


# ────────────────────────  Mixed currency  ─────
# H.E.R. is now USD. Pair with RETRO BRED (CAD) to verify mixed-currency
# protection still fires.
def test_mixed_currency_her_usd_plus_retro_bred_cad_rejected():
    a = resolve_line_item("her-eternal-reign", None, None, "US 7", 1, tier="14k")
    b = resolve_line_item("retro-bred", None, None, None, 1, tier="foundation")
    with pytest.raises(CatalogError, match="MIXED_CURRENCY_CART"):
        compute_totals([a, b])


# ────────────────────────  Deterministic SKU  ─────
def test_sku_deterministic():
    a = resolve_line_item("her-eternal-reign", None, None, "US 8.5", 1, tier="14k")
    b = resolve_line_item("her-eternal-reign", None, None, "US 8.5", 1, tier="14k")
    assert a["sku"] == b["sku"] == "HER-14K-F19-SZ8-5"
