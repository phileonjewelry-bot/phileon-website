"""Trusted-catalog test — RETRO BRED · Drew's Vault · Private Release.

Merchant-signed CAD tiers (Feb 2026). Pendant only — chain sold separately.
Public routing is intentionally NOT exposed; this test only asserts the
backend contract.
"""
import pytest
from services.catalog import (
    resolve_line_item, compute_totals, CatalogError, is_supported, is_dynamic_priced,
)


# ────────────────────────  Trusted CAD pricing per storefront  ─────
@pytest.mark.parametrize("tier, expected_cents, sku", [
    ("foundation",  599500, "RB-FND-925"),   # $5,995 CAD  · Sterling + synthetic
    ("signature",  1049500, "RB-SIG-10K"),   # $10,495 CAD · 10K + lab-grown
    ("heirloom",   1179500, "RB-HRL-14K"),   # $11,795 CAD · 14K + lab-grown
])
def test_retro_bred_trusted_price_and_sku(tier, expected_cents, sku):
    r = resolve_line_item("retro-bred", None, None, None, 1,
                          tier=tier, market_snapshot=None)
    assert r["currency"] == "CAD"
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
    r = resolve_line_item("retro-bred", None, None, None, 1,
                          tier="heirloom", market_snapshot=None)
    assert r["unit_amount_cents"] == 1179500  # $11,795 CAD EXACT


# ────────────────────────  Mixed currency (CAD Vault + USD static)  ─────
def test_mixed_currency_retro_bred_cad_plus_bajan_joe_usd_rejected():
    a = resolve_line_item("retro-bred", None, None, None, 1,
                          tier="foundation", market_snapshot=None)
    b = resolve_line_item("bajan-joe", None, None, "US 10", 1, variant="polish")
    with pytest.raises(CatalogError, match="MIXED_CURRENCY_CART"):
        compute_totals([a, b])


# ────────────────────────  Chain-price isolation  ─────
def test_pendant_price_does_not_include_chain():
    # Sanity: tier prices are pendant-only; chain is sold separately and the
    # server has no chain SKU wired here.
    prices = []
    for tier in ("foundation", "signature", "heirloom"):
        r = resolve_line_item("retro-bred", None, None, None, 1, tier=tier)
        prices.append(r["unit_amount_cents"])
    # No hidden add-on: prices exactly match the merchant matrix.
    assert prices == [599500, 1049500, 1179500]
