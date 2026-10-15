"""TRACE earrings — owner-approved editions (preview). No ring size, USD per pair, Heirloom locked."""
import pytest
from services import catalog as C, pricing_engine_catalog as P

SNAP = {"goldPerGram24kCad": 176.0, "silverPerGramCad": 2.4}


def test_trace_is_earrings_without_size():
    cfg = P.PRICING_ENGINE_CATALOG["trace"]
    assert cfg["category"] == "earrings" and cfg["needs_size"] is False and cfg["convert_usd_luxury"] is False


@pytest.mark.parametrize("tier,usd", [("signature", 45000), ("foundation", 90000)])
def test_trace_approved_usd_per_pair_no_conversion(tier, usd):
    r = C.resolve_line_item("trace", None, None, None, 1, tier=tier, market_snapshot=SNAP)
    assert r["unit_amount_cents"] == usd and r["currency"] == "USD"
    r2 = C.resolve_line_item("trace", None, None, None, 2, tier=tier, market_snapshot={"goldPerGram24kCad": 300.0, "silverPerGramCad": 5.0})
    assert r2["unit_amount_cents"] == usd  # hand-set USD: no metal adjustment, no second conversion


def test_trace_heirloom_locked_until_approved():
    with pytest.raises(C.CatalogError, match="TIER_UNAVAILABLE"):
        C.resolve_line_item("trace", None, None, None, 1, tier="heirloom", market_snapshot=SNAP)
    assert "heirloom" in __import__("pricing_engine").LIVE_PRICING_CONFIG["trace"]  # historical row preserved


def test_rhythm_mesh_three_tiers_match_frontend_config():
    import json, pathlib
    src = (pathlib.Path(__file__).resolve().parents[2] / "frontend/src/data/livePricingConfig.js").read_text()
    block = src.split("rhythmMeshRing: {")[1].split("\n  },")[0]
    for t, c in C._DYNAMIC_RING_TIERS["rhythm-mesh-ring"]["tiers"].items():
        assert f"{t}:" in block and f"lockedBasePriceCad: {c['lockedBasePriceCad']}" in block


# ── PARABOLA — owner-confirmed USD retail (no second CAD→USD conversion) ──
PARABOLA_APPROVED_USD = {"sterling": 125000, "whiteGold10k": 780000, "roseGold10k": 780000}


HERITAGE_APPROVED_USD = {"sterling": 125000, "whiteGold10k": 780000, "yellowGold10k": 780000}
_USD_HAND_SET_RINGS = [("parabola", "US 6", PARABOLA_APPROVED_USD, "parabola"),
                       ("parabola-heritage", "US 10", HERITAGE_APPROVED_USD, "parabolaHeritage")]


@pytest.mark.parametrize("slug,size,approved,_js", _USD_HAND_SET_RINGS)
def test_usd_hand_set_rings_resolve_to_approved_usd(slug, size, approved, _js):
    from services.catalog import resolve_line_item
    from services import metal_spot
    snap = metal_spot.get_spot()
    sz = size.replace("US ", "")
    for tier, cents in approved.items():
        r = resolve_line_item(slug, None, None, size, 1, tier=tier, market_snapshot=snap)
        assert r["currency"] == "USD"
        assert r["unit_amount_cents"] == cents, (slug, tier)
        assert r["sku"] == f"{slug.upper().replace('-', '')}-{tier.upper()}-SZ{sz}"


@pytest.mark.parametrize("slug,_size,_approved,_js", _USD_HAND_SET_RINGS)
def test_usd_hand_set_rings_have_no_live_metal_adjustment(slug, _size, _approved, _js):
    from services.catalog import _DYNAMIC_RING_TIERS
    cfg = _DYNAMIC_RING_TIERS[slug]
    assert cfg["usd_hand_set"] is True
    for t in cfg["tiers"].values():
        assert t["weightGrams"] == 0 and t["lockedMetalReferenceCad"] == 0


@pytest.mark.parametrize("slug,_size,_approved,js_key", _USD_HAND_SET_RINGS)
def test_usd_hand_set_frontend_config_mirrors_backend(slug, _size, _approved, js_key):
    import re
    from pathlib import Path
    from services.catalog import _DYNAMIC_RING_TIERS
    js = Path(__file__).resolve().parents[2].joinpath("frontend/src/data/livePricingConfig.js").read_text()
    block = re.search(rf"\n  {js_key}: \{{(.*?)\n  \}},", js, re.S).group(1)
    for key, t in _DYNAMIC_RING_TIERS[slug]["tiers"].items():
        m = re.search(rf"{key}:\s*\{{\s*lockedBasePriceCad:\s*(\d+)[^}}]*weightGrams:\s*(\d+)", block)
        assert m, key
        assert int(m.group(1)) == t["lockedBasePriceCad"] and int(m.group(2)) == 0


# ── ANNIE ROSE — owner-approved edition ↔ diamond-type mapping carried into checkout ──
ANNIE_ROSE_EDITIONS = {
    "foundation": ("10K", "10K Yellow Gold", "Lab-Grown Diamonds"),
    "signature":  ("14K", "14K Yellow Gold", "Natural Diamonds"),
    "heirloom":   ("18K", "18K Yellow Gold", "Natural Diamonds"),
}


@pytest.mark.parametrize("tier,expected", list(ANNIE_ROSE_EDITIONS.items()))
def test_annie_rose_checkout_preserves_diamond_type(tier, expected):
    from services.catalog import resolve_line_item
    from services import metal_spot
    karat, metal, stone = expected
    r = resolve_line_item("annie-rose", None, None, "US 6", 1, tier=tier, market_snapshot=metal_spot.get_spot())
    assert r["currency"] == "USD" and r["is_dynamic_priced"] is True
    assert r["sku"] == f"ANNIEROSE-{tier.upper()}-SZ6"
    assert r["karat"] == karat and r["metal_colour"] == metal
    assert r["gemstones"] == stone and r["metadata"]["stone"] == stone
    assert r["variant"] == f"{metal} · {stone} · US 6"


def test_annie_rose_silver_not_purchasable_anywhere():
    from services.catalog import resolve_line_item, CatalogError, _DYNAMIC_RING_TIERS
    from services import metal_spot
    from pricing_engine import LIVE_PRICING_CONFIG
    assert "silver" not in _DYNAMIC_RING_TIERS["annie-rose"]["tiers"]
    assert LIVE_PRICING_CONFIG["annieRose"]["silver"]["available"] is False
    with pytest.raises(CatalogError, match="INVALID_TIER"):
        resolve_line_item("annie-rose", None, None, "US 6", 1, tier="silver", market_snapshot=metal_spot.get_spot())


def test_annie_rose_frontend_config_mirrors_backend():
    import re
    from pathlib import Path
    from services.catalog import _DYNAMIC_RING_TIERS
    js = Path(__file__).resolve().parents[2].joinpath("frontend/src/data/livePricingConfig.js").read_text()
    block = re.search(r"\n  annieRose: \{(.*?)\n  \},", js, re.S).group(1)
    assert re.search(r"silver:\s*\{[^}]*purchasable:\s*false", block)
    for key, t in _DYNAMIC_RING_TIERS["annie-rose"]["tiers"].items():
        m = re.search(rf"{key}:\s*\{{\s*lockedBasePriceCad:\s*(\d+),\s*metalType:\s*\"(\w+)\",\s*weightGrams:\s*(\d+),\s*lockedMetalReferenceCad:\s*(\d+)", block)
        assert m, key
        assert (int(m.group(1)), m.group(2), int(m.group(3)), int(m.group(4))) == (
            t["lockedBasePriceCad"], t["metalType"], t["weightGrams"], t["lockedMetalReferenceCad"])
