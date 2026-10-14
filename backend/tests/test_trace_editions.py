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
