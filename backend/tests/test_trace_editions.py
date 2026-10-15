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


@pytest.mark.parametrize("tier,cents", list(PARABOLA_APPROVED_USD.items()))
def test_parabola_resolves_to_approved_usd(tier, cents):
    from services.catalog import resolve_line_item
    from services import metal_spot
    snap = metal_spot.get_spot()
    r = resolve_line_item("parabola", None, None, "US 6", 1, tier=tier, market_snapshot=snap)
    assert r["currency"] == "USD"
    assert r["unit_amount_cents"] == cents
    assert r["sku"] == f"PARABOLA-{tier.upper()}-SZ6"


def test_parabola_has_no_live_metal_adjustment():
    from services.catalog import _DYNAMIC_RING_TIERS
    cfg = _DYNAMIC_RING_TIERS["parabola"]
    assert cfg["usd_hand_set"] is True
    for t in cfg["tiers"].values():
        assert t["weightGrams"] == 0 and t["lockedMetalReferenceCad"] == 0


def test_parabola_frontend_config_mirrors_backend():
    import re
    from pathlib import Path
    from services.catalog import _DYNAMIC_RING_TIERS
    js = Path(__file__).resolve().parents[2].joinpath("frontend/src/data/livePricingConfig.js").read_text()
    block = re.search(r"\n  parabola: \{(.*?)\n  \},", js, re.S).group(1)
    for key, t in _DYNAMIC_RING_TIERS["parabola"]["tiers"].items():
        m = re.search(rf"{key}:\s*\{{\s*lockedBasePriceCad:\s*(\d+)[^}}]*weightGrams:\s*(\d+)", block)
        assert m, key
        assert int(m.group(1)) == t["lockedBasePriceCad"] and int(m.group(2)) == 0
