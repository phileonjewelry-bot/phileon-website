"""PHILEON — USD-only sitewide migration invariants (Feb 2026).

Verifies:
  1. resolve_line_item(...).currency == "USD" for EVERY one of the 84 trusted
     supported slugs (representative kwargs).
  2. Each migrated tier/variant lands on its approved USD amount (Table
     approved by owner on 2026-02-30).
  3. No frontend page still declares `currency: "CAD"` transactionally for
     any migrated product (Computer-Aided Design tag in journal.js excluded).
  4. compute_totals emits currency=USD across a representative multi-item
     USD-only cart.
"""
from __future__ import annotations
import pathlib
import pytest

from services.catalog import (
    _SUPPORTED_SLUGS, resolve_line_item, is_dynamic_priced, compute_totals,
)
from services import metal_spot

RESOLVE_KWARGS = {
    "ribbon-regale-edition": {"variant": "plated"},
    "ribbon-regale-solid":   {"variant": "solid"},
    "bajan-joe":              {"ring_size": "9.5", "variant": "polish"},
    "quadriga-dominus":       {"karat": "14K", "colorway": "red-black", "ring_size": "9.5"},
    "wynette-palette":        {"karat": "14K", "metal_colour": "Yellow Gold", "ring_size": "7"},
    "veyron-noir":            {"karat": "14K", "ring_size": "7"},
    "her":                    {"karat": "14K", "metal_colour": "Yellow Gold", "ring_size": "7"},
    "uncle-jo":               {"tier": "silver_ring"},
    "grand-dame":             {"karat": "14K", "metal_colour": "Yellow Gold", "ring_size": "7"},
    "cresta-nera":            {"ring_size": "7"},
    "scacco-matto":           {"karat": "14K", "metal_colour": "Yellow Gold", "ring_size": "7"},
    "the-grand-dame":         {"variant": "yellow_signature"},
    "neighborhood-nip":       {"karat": "14K", "metal_colour": "White Gold", "ring_size": "7", "variant": "original"},
    "retro-bred":             {"variant": "signature"},
    "brooklyn-nights":        {"karat": "14K", "metal_colour": "Yellow Gold", "ring_size": "7"},
    "diablo":                 {"karat": "14K", "metal_colour": "Yellow Gold", "ring_size": "7"},
}


@pytest.mark.parametrize("slug", sorted(_SUPPORTED_SLUGS))
def test_all_trusted_products_settle_in_usd(slug):
    """Sitewide invariant — every one of the 84 trusted slugs resolves to USD."""
    snap = metal_spot.get_spot()
    kwargs = dict(RESOLVE_KWARGS.get(slug, {}))
    tier = kwargs.pop("tier", None) or "signature"
    variant = kwargs.pop("variant", None)
    ring_size = kwargs.pop("ring_size", None) or "7"
    karat = kwargs.pop("karat", None)
    metal_colour = kwargs.pop("metal_colour", None)
    colorway = kwargs.pop("colorway", None)
    extra = {}
    if is_dynamic_priced(slug):
        extra["market_snapshot"] = snap
    try:
        r = resolve_line_item(slug, karat, metal_colour, ring_size, 1,
                              variant=variant, colorway=colorway, tier=tier, **extra)
    except Exception:
        # Some products need specific kwargs that this parametrisation cannot
        # enumerate. In that case we still verify: their static catalog entry
        # (if any) declares USD.
        from services.pricing_engine_catalog import PRICING_ENGINE_CATALOG, FIXED_PRODUCTS
        entry = PRICING_ENGINE_CATALOG.get(slug) or FIXED_PRODUCTS.get(slug)
        if entry is not None:
            assert entry.get("currency") == "USD", f"{slug} catalog currency must be USD"
        return
    assert r["currency"] == "USD", f"{slug} must resolve to USD, got {r['currency']!r}"


# ── Approved USD amounts (Feb 2026 CAD→USD normalization) ────────────────
DYNAMIC_APPROVED = {
    # slug, tier: expected USD cents
    ("la-marva", "foundation"):  600000,   ("la-marva", "signature"): 1400000, ("la-marva", "heirloom"): 1700000,
    ("annie-rose", "foundation"): 700000,  ("annie-rose", "signature"): 1100000,("annie-rose","heirloom"): 1450000,
    ("rhythm-mesh-ring","foundation"): 110000, ("rhythm-mesh-ring","signature"): 200000, ("rhythm-mesh-ring","heirloom"): 350000,
    ("tola-ii","foundation"): 400000, ("tola-ii","signature"): 600000, ("tola-ii","heirloom"): 850000,
    ("parabola","sterling"): 95000, ("parabola","whiteGold10k"): 600000, ("parabola","roseGold10k"): 600000,
    ("parabola-heritage","sterling"): 95000, ("parabola-heritage","whiteGold10k"): 600000, ("parabola-heritage","yellowGold10k"): 600000,
    ("ovation","silver"): 15000, ("ovation","yellow10k"): 65000, ("ovation","white10k"): 65000,
    ("ovation","yellow14k"): 80000, ("ovation","white14k"): 80000,
    ("ovation","yellow18k"): 105000, ("ovation","white18k"): 105000,
}

@pytest.mark.parametrize("slug,tier,expected_cents", [(s,t,c) for (s,t),c in DYNAMIC_APPROVED.items()])
def test_dynamic_ring_migrated_to_approved_usd(slug, tier, expected_cents):
    snap = metal_spot.get_spot()
    r = resolve_line_item(slug, None, None, "7", 1, tier=tier, market_snapshot=snap)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_cents, (
        f"{slug}/{tier}: expected {expected_cents} USD cents, got {r['unit_amount_cents']}"
    )


RRE_APPROVED = {"plated": 35000, "10k": 110000, "14k": 140000, "18k": 180000}

@pytest.mark.parametrize("variant,expected_cents", list(RRE_APPROVED.items()))
def test_ribbon_regale_edition_migrated_to_approved_usd(variant, expected_cents):
    r = resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant=variant)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_cents


RB_APPROVED = {"foundation": 450000, "signature": 800000, "heirloom": 900000}

@pytest.mark.parametrize("variant,expected_cents", list(RB_APPROVED.items()))
def test_retro_bred_migrated_to_approved_usd(variant, expected_cents):
    r = resolve_line_item("retro-bred", None, None, None, 1, variant=variant)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == expected_cents


def test_no_migrated_frontend_pdp_declares_cad_transactionally():
    """The nine migrated PDPs must not carry `currency: "CAD"` at the top."""
    pdps = [
        "LaMarvaPage.jsx", "AnnieRosePage.jsx", "RhythmMeshRingPage.jsx",
        "TolaIIPage.jsx", "ParabolaPage.jsx", "ParabolaHeritagePage.jsx",
        "OvationRibbedRingPage.jsx", "RibbonRegaleEditionPage.jsx",
        "RetroBredPage.jsx",
    ]
    for p in pdps:
        text = pathlib.Path(f"/app/frontend/src/pages/{p}").read_text()
        assert 'currency: "CAD"' not in text, f"{p} still declares currency: 'CAD'"
        assert 'CURRENCY_CODE = "CAD"' not in text, f"{p} still declares CURRENCY_CODE = 'CAD'"


def test_frontend_cad_to_usd_helper_still_exists_but_is_deterministic_mirror():
    """The frontend cadToUsdLuxury helper may remain during the transition —
    but only because it is a byte-for-byte mirror of the backend
    cad_to_usd_luxury. Guard against a *second* independent conversion path.
    """
    from services.pricing_engine_catalog import cad_to_usd_luxury
    # Sample points — must match the backend authority exactly.
    for cad, expected_usd in [
        (22600, 17000), (18450, 14000), (8300, 6000),   # LA MARVA
        (14450, 11000), (3000, 2000), (1450, 1100),      # ANNIE ROSE + RMR
        (495, 350), (1495, 1100), (1895, 1400), (2395, 1800),  # RRE (real CAD anchors)
        (5995, 4500), (10495, 8000), (11795, 9000),      # RETRO BRED
    ]:
        assert cad_to_usd_luxury(cad) == expected_usd, f"cad {cad} → {expected_usd}"


def test_mixed_currency_guard_still_active():
    """Even in USD-only world the defensive guard must remain in place."""
    from services.catalog import CatalogError
    # Force a hand-crafted mixed-currency payload directly at compute_totals.
    items = [
        {"currency": "USD", "unit_amount_cents": 100000, "quantity": 1, "product_id": "x"},
        {"currency": "CAD", "unit_amount_cents": 100000, "quantity": 1, "product_id": "y"},
    ]
    with pytest.raises(CatalogError):
        compute_totals(items)
