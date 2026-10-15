"""TRACE earrings — owner-approved four editions (preview). No ring size, USD per pair, no conversion."""
import pytest
from services import catalog as C, pricing_engine_catalog as P

SNAP = {"goldPerGram24kCad": 176.0, "silverPerGramCad": 2.4}


def test_trace_is_earrings_without_size():
    cfg = P.PRICING_ENGINE_CATALOG["trace"]
    assert cfg["category"] == "earrings" and cfg["needs_size"] is False and cfg["convert_usd_luxury"] is False


TRACE_EDITIONS = [
    ("signature",   45000,  "925", "925 Sterling Silver · Yellow-Gold Plated", "TRC-SIGNATURE"),
    ("foundation",  90000,  "10K", "Solid 10K Yellow Gold",                    "TRC-FOUNDATION"),
    ("heirloom",    240000, "14K", "Solid 14K Yellow Gold",                    "TRC-HEIRLOOM"),
    ("heirloom18k", 320000, "18K", "Solid 18K Yellow Gold",                    "TRC-HEIRLOOM18K"),
]


@pytest.mark.parametrize("tier,usd,karat,metal,sku", TRACE_EDITIONS)
def test_trace_four_editions_approved_usd_per_pair_no_conversion(tier, usd, karat, metal, sku):
    r = C.resolve_line_item("trace", None, None, None, 1, tier=tier, market_snapshot=SNAP)
    assert r["unit_amount_cents"] == usd and r["currency"] == "USD"
    assert r["sku"] == sku and r.get("ring_size") in (None, "")
    assert r["metadata"]["metal"] == metal
    r2 = C.resolve_line_item("trace", None, None, None, 2, tier=tier, market_snapshot={"goldPerGram24kCad": 300.0, "silverPerGramCad": 5.0})
    assert r2["unit_amount_cents"] == usd  # hand-set USD: no metal adjustment, no second conversion


def test_trace_has_exactly_four_purchasable_editions_mirrored_in_frontend():
    import re, pathlib
    cfg = __import__("pricing_engine").LIVE_PRICING_CONFIG["trace"]
    assert set(cfg) == {"signature", "foundation", "heirloom", "heirloom18k"}
    assert all(t.get("available", True) for t in cfg.values())
    js = (pathlib.Path(__file__).resolve().parents[2] / "frontend/src/data/livePricingConfig.js").read_text()
    block = re.search(r"\n  trace: \{(.*?)\n  \},", js, re.S).group(1)
    assert "purchasable: false" not in block
    for key, t in cfg.items():
        m = re.search(rf"{key}:\s*\{{\s*lockedBasePriceCad:\s*(\d+),\s*metalType:\s*\"(\w+)\",\s*weightGrams:\s*0", block)
        assert m and int(m.group(1)) == t["lockedBasePriceCad"] and m.group(2) == t["metalType"], key


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


# ── OVATION — owner-approved hand-set USD (Option B) ──
OVATION_APPROVED_USD = {"silver": 22500, "yellow10k": 85000, "white10k": 85000, "yellow14k": 110000,
                        "white14k": 110000, "yellow18k": 140000, "white18k": 140000}


@pytest.mark.parametrize("tier,cents", list(OVATION_APPROVED_USD.items()))
def test_ovation_seven_tiers_hand_set_usd(tier, cents):
    from services.catalog import _DYNAMIC_RING_TIERS
    assert _DYNAMIC_RING_TIERS["ovation"]["usd_hand_set"] is True
    for snap in (SNAP, {"goldPerGram24kCad": 300.0, "silverPerGramCad": 5.0}):
        r = C.resolve_line_item("ovation", None, None, "US 8", 1, tier=tier, market_snapshot=snap)
        assert r["unit_amount_cents"] == cents and r["currency"] == "USD"
        assert r["sku"] == f"OVATION-{tier.upper()}-SZ8"


# ── COOGI DNA TAG — $8,500 each, engraving +$150 charged once ──
@pytest.mark.parametrize("tier,metal", [("snow", "Solid 10K White Gold"), ("sand", "Solid 10K Rose Gold")])
def test_coogi_dna_tag_8500_and_engraving_surcharge(tier, metal):
    base = C.resolve_line_item("coogi-dna-tag", None, None, None, 1, tier=tier, market_snapshot=SNAP)
    assert base["unit_amount_cents"] == 850000 and base["sku"] == f"CDT-{tier.upper()}"
    assert base["metadata"]["metal"] == metal and base["metadata"]["engraving"] == ""
    eng = C.resolve_line_item("coogi-dna-tag", None, None, None, 1, tier=tier, market_snapshot=SNAP, engraving=True)
    assert eng["unit_amount_cents"] == 865000 and eng["sku"] == f"CDT-{tier.upper()}-ENGRAVED"
    assert eng["metadata"]["engraving"] == "laser" and eng["variant"].endswith("· Engraved")
    eng2 = C.resolve_line_item("coogi-dna-tag", None, None, None, 2, tier=tier, market_snapshot=SNAP, engraving=True)
    assert eng2["unit_amount_cents"] == 865000  # per unit, charged once per unit — never compounded


def test_engraving_flag_ignored_for_products_without_surcharge():
    r = C.resolve_line_item("trace", None, None, None, 1, tier="signature", market_snapshot=SNAP, engraving=True)
    assert r["unit_amount_cents"] == 45000 and r["sku"] == "TRC-SIGNATURE"


# ── LADY JAY — seasonal retirement enforced server-side (mocked clock) ──
def _utc(iso):
    from datetime import datetime, timezone
    return datetime.fromisoformat(iso).astimezone(timezone.utc)


@pytest.mark.parametrize("now_iso,available", [
    ("2026-10-31T23:59:00-04:00", True),   # last minute of the 2026 season (America/Toronto)
    ("2026-11-01T00:00:00-04:00", False),  # retired at midnight local
    ("2027-04-01T12:00:00-04:00", False),  # no automatic 2027 reopening
])
def test_lady_jay_seasonal_window(monkeypatch, now_iso, available):
    monkeypatch.setattr(P, "_now_utc", lambda: _utc(now_iso))
    state = P.season_state("lady-jay")
    assert state["seasonal"] is True and state["available"] is available and state["reopens_at"] is None
    if available:
        r = C.resolve_line_item("lady-jay", None, None, "US 6", 1, tier="foundation", market_snapshot=SNAP)
        assert r["currency"] == "USD" and r["sku"] == "LJY-FOUNDATION-SZ6"
    else:
        assert state["message"] == "Retired Until Opening Day — Jays Season 2027"
        with pytest.raises(C.CatalogError, match="SEASONALLY_RETIRED"):
            C.resolve_line_item("lady-jay", None, None, "US 6", 1, tier="foundation", market_snapshot=SNAP)


def test_non_seasonal_products_unaffected_by_clock(monkeypatch):
    monkeypatch.setattr(P, "_now_utc", lambda: _utc("2027-04-01T12:00:00-04:00"))
    assert P.season_state("trace")["seasonal"] is False
    assert C.resolve_line_item("trace", None, None, None, 1, tier="signature", market_snapshot=SNAP)["unit_amount_cents"] == 45000


def test_merchant_feed_drops_lady_jay_when_retired(monkeypatch):
    import importlib.util, pathlib
    spec = importlib.util.spec_from_file_location("gmf", pathlib.Path(__file__).resolve().parents[1] / "scripts/generate_merchant_feed.py")
    gmf = importlib.util.module_from_spec(spec); spec.loader.exec_module(gmf)
    monkeypatch.setattr(P, "_now_utc", lambda: _utc("2026-11-01T00:00:00-04:00"))
    assert gmf._live_feed_price("lady-jay") is None
    monkeypatch.setattr(P, "_now_utc", lambda: _utc("2026-10-31T12:00:00-04:00"))
    price = gmf._live_feed_price("lady-jay")
    assert price and price[1] == "USD" and int(price[0]) >= 4500
