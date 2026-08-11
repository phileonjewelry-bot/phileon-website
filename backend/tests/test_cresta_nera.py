"""Trusted-catalog tests — CRESTA NERA Hinged Bangle · 2 metals × 4 sizes.

Merchant-signed trusted USD matrix (Feb 2026). Ring size is NOT applicable —
wrist size is the sizing dimension.
"""
import pytest
from services.catalog import resolve_line_item, compute_totals, CatalogError, is_supported, is_dynamic_priced


# ────────────────────────  All 8 valid combinations  ─────
@pytest.mark.parametrize("metal, size, expected_cents, sku", [
    # 10K Yellow Gold
    ("10k-yellow-gold", "small",  1049500, "CRESTA-10K-S"),
    ("10k-yellow-gold", "medium", 1074500, "CRESTA-10K-M"),
    ("10k-yellow-gold", "large",  1099500, "CRESTA-10K-L"),
    ("10k-yellow-gold", "xl",     1124500, "CRESTA-10K-XL"),
    # 14K Yellow Gold
    ("14k-yellow-gold", "small",  1179500, "CRESTA-14K-S"),
    ("14k-yellow-gold", "medium", 1204500, "CRESTA-14K-M"),
    ("14k-yellow-gold", "large",  1229500, "CRESTA-14K-L"),
    ("14k-yellow-gold", "xl",     1254500, "CRESTA-14K-XL"),
])
def test_cresta_nera_all_eight_variants(metal, size, expected_cents, sku):
    r = resolve_line_item("cresta-nera", None, None, None, 1,
                          tier=metal, wrist_size=size, market_snapshot=None)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_cents
    assert r["sku"] == sku
    assert r["karat"] in ("10K", "14K")
    assert r["ring_size"] is None
    assert r["wrist_size"].startswith(("Small", "Medium", "Large", "Extra Large"))


# ────────────────────────  Registry  ─────
def test_cresta_nera_is_supported():
    assert is_supported("cresta-nera")

def test_cresta_nera_is_static():
    assert not is_dynamic_priced("cresta-nera")


# ────────────────────────  Validation  ─────
def test_invalid_wrist_size_rejected():
    with pytest.raises(CatalogError, match="INVALID_WRIST_SIZE"):
        resolve_line_item("cresta-nera", None, None, None, 1,
                          tier="10k-yellow-gold", wrist_size="huge",
                          market_snapshot=None)

def test_missing_wrist_size_rejected():
    with pytest.raises(CatalogError, match="MISSING_WRIST_SIZE"):
        resolve_line_item("cresta-nera", None, None, None, 1,
                          tier="10k-yellow-gold", wrist_size=None,
                          market_snapshot=None)

def test_invalid_metal_rejected():
    with pytest.raises(CatalogError, match="INVALID_METAL"):
        resolve_line_item("cresta-nera", None, None, None, 1,
                          tier="18k-yellow-gold", wrist_size="small",
                          market_snapshot=None)

def test_missing_metal_rejected():
    with pytest.raises(CatalogError, match="MISSING_METAL"):
        resolve_line_item("cresta-nera", None, None, None, 1,
                          tier=None, wrist_size="small",
                          market_snapshot=None)

def test_ring_size_field_is_ignored_for_bangle():
    # Passing a ring size string does not sneak past the wrist-size gate.
    with pytest.raises(CatalogError, match="MISSING_WRIST_SIZE"):
        resolve_line_item("cresta-nera", None, None, "US 10", 1,
                          tier="10k-yellow-gold", market_snapshot=None)


# ────────────────────────  Client price ignored  ─────
def test_client_supplied_price_ignored_for_cresta_nera():
    # Cannot influence the trusted amount — no price argument exists.
    r = resolve_line_item("cresta-nera", None, None, None, 1,
                          tier="14k-yellow-gold", wrist_size="xl",
                          market_snapshot=None)
    assert r["unit_amount_cents"] == 1254500  # $12,545 EXACT


# ────────────────────────  Size-based uplift is intentional  ─────
def test_size_based_uplift_is_active_10k():
    # Each step up in size must yield a strictly higher trusted cents value.
    prices = []
    for size in ("small", "medium", "large", "xl"):
        r = resolve_line_item("cresta-nera", None, None, None, 1,
                              tier="10k-yellow-gold", wrist_size=size,
                              market_snapshot=None)
        prices.append(r["unit_amount_cents"])
    assert prices == sorted(prices)
    assert prices == [1049500, 1074500, 1099500, 1124500]

def test_size_based_uplift_is_active_14k():
    prices = []
    for size in ("small", "medium", "large", "xl"):
        r = resolve_line_item("cresta-nera", None, None, None, 1,
                              tier="14k-yellow-gold", wrist_size=size,
                              market_snapshot=None)
        prices.append(r["unit_amount_cents"])
    assert prices == sorted(prices)
    assert prices == [1179500, 1204500, 1229500, 1254500]
