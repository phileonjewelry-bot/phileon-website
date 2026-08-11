"""Trusted server-side catalog for payment.
Prices are integer cents. This module is the ONLY authority for payment
prices, currency and SKU identity. Never trust client-supplied values.

Supported products:
  - scacco-matto             (USD) — Phase 1 pilot ring · static price
  - ribbon-regale-edition    (CAD) — Fine Jewelry earring, 4 metal variants · static price
  - quadriga-dominus         (USD) — Gents statement ring · static price
  - bajan-joe                (USD) — Signet ring · static price
  - la-marva                 (CAD) — Live-priced dynamic ring
  - annie-rose               (CAD) — Live-priced dynamic ring
  - rhythm-mesh-ring         (CAD) — Live-priced dynamic ring
  - tola-ii                  (CAD) — Live-priced dynamic ring
  - parabola                 (CAD) — Live-priced dynamic ring
  - parabola-heritage        (CAD) — Live-priced dynamic ring
  - ovation                  (CAD) — Live-priced dynamic ring
"""
from typing import Optional, Dict, List
from pricing_engine import KARAT_MULTIPLIERS, round_luxury

# ---------------------------------------------------------------------------
# SCACCO MATTO (unchanged) — USD
# ---------------------------------------------------------------------------
_SCACCO_PRICE_CENTS_USD = {
    ("10K", "yellow"): 390000,
    ("14K", "yellow"): 430000,
    ("10K", "white"):  410000,
    ("14K", "white"):  450000,
}
_SCACCO_VALID_SIZES = {"4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","custom"}

# ---------------------------------------------------------------------------
# RIBBON REGALE ÉDITION — CAD (Fine Jewelry earring, 4 metals)
# ---------------------------------------------------------------------------
_RRE_METALS: Dict[str, Dict] = {
    "plated": {
        "sku": "RRED-GPSS",
        "unit_amount_cents": 49500,
        "metal_label": "18K Yellow Gold Plated Sterling Silver",
        "base_metal": "Sterling Silver",
        "finish": "18K Yellow Gold Plated",
        "karat": None,
        "is_solid_gold": False,
    },
    "10k": {
        "sku": "RRED-10KYG", "unit_amount_cents": 149500,
        "metal_label": "10K Solid Yellow Gold", "base_metal": None, "finish": None,
        "karat": "10K", "is_solid_gold": True,
    },
    "14k": {
        "sku": "RRED-14KYG", "unit_amount_cents": 189500,
        "metal_label": "14K Solid Yellow Gold", "base_metal": None, "finish": None,
        "karat": "14K", "is_solid_gold": True,
    },
    "18k": {
        "sku": "RRED-18KYG", "unit_amount_cents": 239500,
        "metal_label": "18K Solid Yellow Gold", "base_metal": None, "finish": None,
        "karat": "18K", "is_solid_gold": True,
    },
}

# ---------------------------------------------------------------------------
# QUADRIGA DOMINUS — USD (Gents statement ring, 4 colorways × 2 karats × sizes)
# ---------------------------------------------------------------------------
_QUADRIGA_COLORWAYS: Dict[str, Dict] = {
    "red-black":   {"name": "Red Centre / Black Pavé",   "prices_usd": {"10K": 1049500, "14K": 1225000}},
    "black-red":   {"name": "Black Centre / Red Pavé",   "prices_usd": {"10K": 1099500, "14K": 1275000}},
    "green-black": {"name": "Green Centre / Black Pavé", "prices_usd": {"10K": 1149500, "14K": 1325000}},
    "black-green": {"name": "Black Centre / Green Pavé", "prices_usd": {"10K": 1199500, "14K": 1375000}},
}
_QUADRIGA_VALID_SIZES = {
    "7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15",
}


class CatalogError(ValueError):
    pass


# ---------------------------------------------------------------------------
# BAJAN JOE — USD (Signet ring, sterling silver, two finishes, static price)
# ---------------------------------------------------------------------------
# BAJAN JOE is static-priced (does not participate in the live-metal pricing
# engine used by RHYTHM MESH / OVATION / TOLA II / PARABOLA / LA MARVA /
# ANNIE ROSE / PARABOLA HERITAGE). Both finishes ship at the same $795 price.
# Currency mirrors SCACCO / QUADRIGA (the site's other static-priced Fine
# Jewelry rings, both USD).
_BAJAN_JOE_TIERS: Dict[str, Dict] = {
    "polish": {"sku": "BJ-POL-925", "unit_amount_cents": 79500, "metal": "Sterling Silver — High Polish", "finish": "High Polish"},
    "matte":  {"sku": "BJ-MAT-925", "unit_amount_cents": 79500, "metal": "Sterling Silver — Matte",       "finish": "Matte"},
}
_BAJAN_JOE_VALID_SIZES = {
    "7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15",
}


def _resolve_bajan_joe(tier_key, ring_size, quantity):
    if not tier_key:
        raise CatalogError("MISSING_TIER: BAJAN JOE requires a finish tier ('polish' or 'matte').")
    key = tier_key.strip().lower()
    if key not in _BAJAN_JOE_TIERS:
        raise CatalogError(f"INVALID_TIER: '{tier_key}' is not a valid BAJAN JOE finish tier.")
    if not ring_size:
        raise CatalogError("MISSING_RING_SIZE: BAJAN JOE requires a ring size.")
    size_norm = ring_size.replace("US ", "").strip()
    if size_norm not in _BAJAN_JOE_VALID_SIZES:
        raise CatalogError(f"INVALID_RING_SIZE: '{ring_size}' is not a valid BAJAN JOE gents size.")
    t = _BAJAN_JOE_TIERS[key]
    ring_size_label = f"US {size_norm}"
    return {
        "product_id": "bajan-joe",
        "product_name": "BAJAN JOE",
        "subtitle": "Black Spinel Reptile Signet",
        "gemstones": "8×8mm Princess-Cut Black Spinel",
        "sku": f"{t['sku']}-SZ{size_norm.replace('.', '-')}",
        "variant": f"{t['metal']} · {ring_size_label}",
        "karat": None, "metal_colour": t["metal"], "ring_size": ring_size_label,
        "unit_amount_cents": t["unit_amount_cents"], "currency": "USD", "quantity": quantity,
        "image": "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/p84yjqh9_1000169938.png",
        "metadata": {
            "product_slug": "bajan-joe",
            "sku": f"{t['sku']}-SZ{size_norm.replace('.', '-')}",
            "tier": key, "finish": t["finish"],
            "metal": t["metal"], "ring_size": ring_size_label,
        },
    }


_SUPPORTED_SLUGS = {
    "scacco-matto", "ribbon-regale-edition", "quadriga-dominus", "bajan-joe",
    # 7 live-priced dynamic rings (CAD)
    "la-marva", "annie-rose", "rhythm-mesh-ring", "tola-ii",
    "parabola", "parabola-heritage", "ovation",
}
# Full-catalog migration: additional slugs resolved via pricing_engine.
try:
    from services.pricing_engine_catalog import (
        ALL_SLUGS as _PE_SLUGS, resolve as _pe_resolve,
        PricingEngineResolverError as _PEResolverError,
        PRICING_ENGINE_CATALOG as _PE_CATALOG,
        FIXED_PRODUCTS as _PE_FIXED,
    )  # noqa: E402
    _SUPPORTED_SLUGS = _SUPPORTED_SLUGS | set(_PE_SLUGS)
except Exception:  # pragma: no cover — defensive; core catalog must keep working
    _PE_SLUGS, _PE_CATALOG, _PE_FIXED = set(), {}, {}
    _pe_resolve = None
    _PEResolverError = Exception

# ---------------------------------------------------------------------------
# DYNAMIC RINGS — 7 live-priced CAD products
# ---------------------------------------------------------------------------
# Frontend `RingProductPage` sends `tierKey` = selectedTier (page-defined key).
# `_DYNAMIC_RING_TIERS` mirrors each page's tier definitions exactly:
#   product_key/name/subtitle/size_profile + per-tier
#     (metal_label, metalType, weightGrams, lockedBasePriceCad, lockedMetalReferenceCad).
# `weightGrams=0` locks the tier at `lockedBasePriceCad` (matches PARABOLA/OVATION
# hand-set semantics — the formula's delta collapses to 0).
_LADIES_SIZES = {"4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11"}
_GENTS_SIZES  = {"7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15"}
_UNISEX_SIZES = _LADIES_SIZES | _GENTS_SIZES

_DYNAMIC_RING_TIERS: Dict[str, Dict] = {
    "la-marva": {
        "product_key": "laMarva",
        "product_name": "LA MARVA",
        "subtitle": "Diamond & Sapphire Statement Ring",
        "size_profile": "ladies",
        "image": "/products/la-marva/hero.jpg",
        "tiers": {
            "foundation": {"metal_label": "10K Yellow Gold", "metalType": "10K", "weightGrams": 18, "lockedBasePriceCad": 8000,  "lockedMetalReferenceCad": 1125},
            "signature":  {"metal_label": "14K Yellow Gold", "metalType": "14K", "weightGrams": 20, "lockedBasePriceCad": 18000, "lockedMetalReferenceCad": 1750},
            "heirloom":   {"metal_label": "18K Yellow Gold", "metalType": "18K", "weightGrams": 22, "lockedBasePriceCad": 22000, "lockedMetalReferenceCad": 2475},
        },
    },
    "annie-rose": {
        "product_key": "annieRose",
        "product_name": "ANNIE ROSE",
        "subtitle": "Rose Halo Diamond Ring",
        "size_profile": "ladies",
        "image": "/products/annie-rose/hero.jpg",
        "tiers": {
            "foundation": {"metal_label": "10K Yellow Gold", "metalType": "10K", "weightGrams": 30, "lockedBasePriceCad": 9200,  "lockedMetalReferenceCad": 1875},
            "signature":  {"metal_label": "14K Yellow Gold", "metalType": "14K", "weightGrams": 30, "lockedBasePriceCad": 13800, "lockedMetalReferenceCad": 2625},
            "heirloom":   {"metal_label": "18K Yellow Gold", "metalType": "18K", "weightGrams": 30, "lockedBasePriceCad": 18400, "lockedMetalReferenceCad": 3375},
        },
    },
    "rhythm-mesh-ring": {
        "product_key": "rhythmMeshRing",
        "product_name": "RHYTHM MESH",
        "subtitle": "Architectural Statement Ring",
        "size_profile": "gents",
        "image": "/products/rhythm-mesh/hero.jpg",
        "tiers": {
            "foundation": {"metal_label": "Sterling Silver",  "metalType": "925", "weightGrams": 14, "lockedBasePriceCad": 1450, "lockedMetalReferenceCad": 16},
            "signature":  {"metal_label": "10K White Gold",   "metalType": "10K", "weightGrams": 12, "lockedBasePriceCad": 2800, "lockedMetalReferenceCad": 750},
            "heirloom":   {"metal_label": "14K White Gold",   "metalType": "14K", "weightGrams": 12, "lockedBasePriceCad": 4200, "lockedMetalReferenceCad": 1050},
        },
    },
    "tola-ii": {
        "product_key": "tolaII",
        "product_name": "TOLA II",
        "subtitle": "Cuban-Chain Statement Ring",
        "size_profile": "gents",
        "image": "/products/tola-ii/hero.jpg",
        "tiers": {
            "foundation": {"metal_label": "10K Yellow Gold", "metalType": "10K", "weightGrams": 16, "lockedBasePriceCad": 5200,  "lockedMetalReferenceCad": 1000},
            "signature":  {"metal_label": "14K Yellow Gold", "metalType": "14K", "weightGrams": 18, "lockedBasePriceCad": 7800,  "lockedMetalReferenceCad": 1575},
            "heirloom":   {"metal_label": "18K Yellow Gold", "metalType": "18K", "weightGrams": 20, "lockedBasePriceCad": 11000, "lockedMetalReferenceCad": 2250},
        },
    },
    "parabola": {
        "product_key": "parabola",
        "product_name": "PARABOLA",
        "subtitle": "Concave Dish Statement Ring",
        "size_profile": "ladies",
        "image": "/products/parabola/hero.jpg",
        # Hand-set locked pricing — weightGrams=0 so live metal recalc is a no-op.
        "tiers": {
            "sterling":     {"metal_label": "Sterling Silver", "metalType": "925", "weightGrams": 0, "lockedBasePriceCad": 1250, "lockedMetalReferenceCad": 0},
            "whiteGold10k": {"metal_label": "10K White Gold",  "metalType": "10K", "weightGrams": 0, "lockedBasePriceCad": 7800, "lockedMetalReferenceCad": 0},
            "roseGold10k":  {"metal_label": "10K Rose Gold",   "metalType": "10K", "weightGrams": 0, "lockedBasePriceCad": 7800, "lockedMetalReferenceCad": 0},
        },
    },
    "parabola-heritage": {
        "product_key": "parabolaHeritage",
        "product_name": "PARABOLA HERITAGE",
        "subtitle": "Concave Dish Heritage Statement Ring",
        "size_profile": "gents",
        "image": "/products/parabola-heritage/hero.jpg",
        "tiers": {
            "sterling":       {"metal_label": "Sterling Silver", "metalType": "925", "weightGrams": 0, "lockedBasePriceCad": 1250, "lockedMetalReferenceCad": 0},
            "whiteGold10k":   {"metal_label": "10K White Gold",  "metalType": "10K", "weightGrams": 0, "lockedBasePriceCad": 7800, "lockedMetalReferenceCad": 0},
            "yellowGold10k":  {"metal_label": "10K Yellow Gold", "metalType": "10K", "weightGrams": 0, "lockedBasePriceCad": 7800, "lockedMetalReferenceCad": 0},
        },
    },
    "ovation": {
        "product_key": "ovationRibbedRing",
        "product_name": "OVATION",
        "subtitle": "Ribbed Comfort-Fit Ring",
        "size_profile": "unisex",
        "image": "/products/ovation/hero.jpg",
        # Hand-set pricing mirrors products.ovationRibbedRing.pricing.
        "tiers": {
            "silver":     {"metal_label": "Sterling Silver",  "metalType": "925", "weightGrams": 0, "lockedBasePriceCad": 225,  "lockedMetalReferenceCad": 0},
            "yellow10k":  {"metal_label": "10K Yellow Gold",  "metalType": "10K", "weightGrams": 0, "lockedBasePriceCad": 850,  "lockedMetalReferenceCad": 0},
            "white10k":   {"metal_label": "10K White Gold",   "metalType": "10K", "weightGrams": 0, "lockedBasePriceCad": 850,  "lockedMetalReferenceCad": 0},
            "yellow14k":  {"metal_label": "14K Yellow Gold",  "metalType": "14K", "weightGrams": 0, "lockedBasePriceCad": 1100, "lockedMetalReferenceCad": 0},
            "white14k":   {"metal_label": "14K White Gold",   "metalType": "14K", "weightGrams": 0, "lockedBasePriceCad": 1100, "lockedMetalReferenceCad": 0},
            "yellow18k":  {"metal_label": "18K Yellow Gold",  "metalType": "18K", "weightGrams": 0, "lockedBasePriceCad": 1400, "lockedMetalReferenceCad": 0},
            "white18k":   {"metal_label": "18K White Gold",   "metalType": "18K", "weightGrams": 0, "lockedBasePriceCad": 1400, "lockedMetalReferenceCad": 0},
        },
    },
}

DYNAMIC_RING_SLUGS = frozenset(_DYNAMIC_RING_TIERS.keys())


def is_dynamic_priced(product_id: str) -> bool:
    """True when a product's checkout price depends on the current metal spot."""
    if product_id in _DYNAMIC_RING_TIERS:
        return True
    if product_id in _PE_CATALOG:
        from pricing_engine import LIVE_PRICING_CONFIG
        cfg = _PE_CATALOG[product_id]
        pcfg = LIVE_PRICING_CONFIG.get(cfg["product_key"], {})
        return any(int(t.get("weightGrams", 0)) > 0 for t in pcfg.values())
    # FIXED_PRODUCTS are always static
    return False


def is_supported(product_id: str) -> bool:
    return product_id in _SUPPORTED_SLUGS


# ---------------------------------------------------------------------------
# Dynamic ring resolver — live metal pricing
# ---------------------------------------------------------------------------
def _valid_sizes_for_profile(profile: str) -> set:
    if profile == "ladies": return _LADIES_SIZES
    if profile == "gents":  return _GENTS_SIZES
    return _UNISEX_SIZES


def _compute_dynamic_cents_cad(tier_cfg: Dict, market_snapshot: Dict) -> int:
    """Apply the PHILEON live-pricing formula. Returns integer CAD cents.

    Gold  : current_ref = goldPerGram24kCad × karatMultiplier × weightGrams
    Silver: current_ref = silverPerGramCad  × weightGrams
    price = round_luxury(lockedBasePriceCad + (current_ref − lockedMetalReferenceCad))
    """
    metal_type = tier_cfg["metalType"]
    weight = float(tier_cfg["weightGrams"])
    if metal_type == "925":
        per_gram = float(market_snapshot["silverPerGramCad"])
        current_ref = per_gram * weight  # KARAT_MULTIPLIERS["925"]=0.925 already priced-in
    else:
        per_gram = float(market_snapshot["goldPerGram24kCad"])
        multiplier = KARAT_MULTIPLIERS.get(metal_type, 1.0)
        current_ref = per_gram * multiplier * weight
    delta = current_ref - float(tier_cfg["lockedMetalReferenceCad"])
    price_cad = round_luxury(float(tier_cfg["lockedBasePriceCad"]) + delta)
    return int(price_cad) * 100


def _resolve_dynamic_ring(product_id: str, tier_key: Optional[str],
                          ring_size: Optional[str], quantity: int,
                          market_snapshot: Optional[Dict]) -> Dict:
    if market_snapshot is None:
        # Contract: caller MUST supply a checkout-safe snapshot.
        raise CatalogError("LIVE_PRICE_UNAVAILABLE: Missing trusted market snapshot for dynamic-priced product.")
    cfg = _DYNAMIC_RING_TIERS[product_id]
    if not tier_key:
        raise CatalogError(f"MISSING_TIER: {cfg['product_name']} requires a tier selection.")
    tk = tier_key.strip()
    if tk not in cfg["tiers"]:
        raise CatalogError(f"INVALID_TIER: '{tier_key}' is not a valid {cfg['product_name']} tier.")
    if not ring_size:
        raise CatalogError(f"MISSING_RING_SIZE: {cfg['product_name']} requires a ring size.")
    size_norm = ring_size.replace("US ", "").strip()
    valid_sizes = _valid_sizes_for_profile(cfg["size_profile"])
    if size_norm not in valid_sizes:
        raise CatalogError(f"INVALID_RING_SIZE: '{ring_size}' is not a valid {cfg['product_name']} ring size.")

    tier_cfg = cfg["tiers"][tk]
    unit_cents = _compute_dynamic_cents_cad(tier_cfg, market_snapshot)

    ring_size_label = f"US {size_norm}"
    slug_upper = product_id.upper().replace("-", "")
    sku = f"{slug_upper}-{tk.upper()}-SZ{size_norm.replace('.', '-')}"
    return {
        "product_id": product_id,
        "product_name": cfg["product_name"],
        "subtitle": cfg["subtitle"],
        "gemstones": None,
        "sku": sku,
        "variant": f"{tier_cfg['metal_label']} · {ring_size_label}",
        "karat": tier_cfg["metalType"], "metal_colour": tier_cfg["metal_label"],
        "ring_size": ring_size_label,
        "unit_amount_cents": unit_cents,
        "currency": "CAD",
        "quantity": quantity,
        "image": cfg["image"],
        "is_dynamic_priced": True,
        "pricing_source": {
            "market_timestamp": int(market_snapshot.get("timestamp", 0)),
            "market_source": market_snapshot.get("source"),
            "is_stale": bool(market_snapshot.get("isStale", False)),
        },
        "metadata": {
            "product_slug": product_id, "sku": sku,
            "tier": tk, "metal": tier_cfg["metal_label"],
            "ring_size": ring_size_label,
            "market_source": market_snapshot.get("source") or "",
            "market_timestamp": str(int(market_snapshot.get("timestamp", 0))),
        },
    }


# ---------------------------------------------------------------------------
# PRICE_MOVED contract
# ---------------------------------------------------------------------------
PRICE_MOVE_MIN_CENTS = 5000  # $50 CAD floor
PRICE_MOVE_PCT       = 0.01  # 1% of displayed snapshot


def price_move_threshold_cents(displayed_cents: int) -> int:
    """Threshold = MAX($50 floor, 1% of displayed). Integer cents."""
    if not displayed_cents or displayed_cents <= 0:
        return PRICE_MOVE_MIN_CENTS
    return max(PRICE_MOVE_MIN_CENTS, int(round(displayed_cents * PRICE_MOVE_PCT)))


def detect_price_move(displayed_cents: Optional[int], trusted_cents: int) -> Optional[Dict]:
    """Return a movement descriptor when the delta exceeds the threshold.

    None means the movement is within the tolerated band and checkout may proceed.
    """
    if displayed_cents is None or displayed_cents <= 0:
        return None
    delta = abs(int(trusted_cents) - int(displayed_cents))
    threshold = price_move_threshold_cents(int(displayed_cents))
    if delta > threshold:
        return {
            "old_display_price_cents": int(displayed_cents),
            "new_trusted_price_cents": int(trusted_cents),
            "delta_cents": delta,
            "threshold_cents": threshold,
        }
    return None



def _resolve_scacco(karat, metal_colour, ring_size, quantity):
    if not karat or karat not in ("10K", "14K"):
        raise CatalogError("INVALID_KARAT: must be '10K' or '14K'.")
    colour_key = (metal_colour or "").strip().lower().replace(" gold", "")
    if colour_key not in ("yellow", "white"):
        raise CatalogError("INVALID_COLOUR: must be 'Yellow Gold' or 'White Gold'.")
    if not ring_size:
        raise CatalogError("MISSING_RING_SIZE: SCACCO MATTO requires a ring size.")
    size_norm = ring_size.replace("US ", "").strip().lower()
    if size_norm not in _SCACCO_VALID_SIZES:
        raise CatalogError(f"INVALID_RING_SIZE: '{ring_size}' is not a valid PHILEON ring size.")
    unit_cents = _SCACCO_PRICE_CENTS_USD[(karat, colour_key)]
    colour_label = "Yellow Gold" if colour_key == "yellow" else "White Gold"
    ring_size_label = f"US {size_norm}" if size_norm != "custom" else "Custom (above US 12)"
    return {
        "product_id": "scacco-matto",
        "product_name": "SCACCO MATTO",
        "subtitle": "Geometric Gemstone Band",
        "gemstones": "Lab-Grown Blue & Yellow Sapphires",
        "sku": f"SM-{karat}-{colour_key.upper()}-{size_norm.upper()}",
        "variant": f"{karat} · {colour_label} · {ring_size_label}",
        "karat": karat, "metal_colour": colour_label, "ring_size": ring_size_label,
        "unit_amount_cents": unit_cents, "currency": "USD", "quantity": quantity,
        "image": "/fine-jewelry/scacco-matto/hero-three-quarter.png",
        "metadata": {
            "product_slug": "scacco-matto", "sku": f"SM-{karat}-{colour_key.upper()}-{size_norm.upper()}",
            "karat": karat, "metal_colour": colour_label, "ring_size": ring_size_label,
        },
    }


def _resolve_ribbon_regale_edition(variant_key, quantity):
    if not variant_key:
        raise CatalogError("MISSING_VARIANT: RIBBON REGALE ÉDITION requires a metal variant "
                           "(one of: plated, 10k, 14k, 18k).")
    key = variant_key.strip().lower()
    if key not in _RRE_METALS:
        raise CatalogError(f"INVALID_VARIANT: '{variant_key}' is not a valid RIBBON REGALE ÉDITION metal.")
    m = _RRE_METALS[key]
    return {
        "product_id": "ribbon-regale-edition",
        "product_name": "RIBBON REGALE ÉDITION",
        "subtitle": "Sculptural Earrings — Precious Metal Edition",
        "gemstones": None,
        "sku": m["sku"],
        "variant": f"{m['metal_label']} · One Pair",
        "karat": m["karat"], "metal_colour": m["metal_label"], "ring_size": None,
        "unit_amount_cents": m["unit_amount_cents"], "currency": "CAD", "quantity": quantity,
        "image": "/inspiration-vault/gold-theory-ribbon/hero-pair-black.png",
        "metadata": {
            "product_slug": "ribbon-regale-edition", "sku": m["sku"],
            "metal": m["metal_label"],
            "karat": m["karat"] or "",
            "base_metal": m["base_metal"] or "",
            "finish": m["finish"] or "",
            "is_solid_gold": "true" if m["is_solid_gold"] else "false",
        },
    }


def _resolve_quadriga(karat, colorway, ring_size, quantity):
    if not karat or karat not in ("10K", "14K"):
        raise CatalogError("INVALID_KARAT: QUADRIGA DOMINUS is available in 10K or 14K only.")
    if not colorway:
        raise CatalogError("MISSING_COLORWAY: QUADRIGA DOMINUS requires a colorway.")
    cw_key = colorway.strip().lower()
    if cw_key not in _QUADRIGA_COLORWAYS:
        raise CatalogError(f"INVALID_COLORWAY: '{colorway}' is not a valid QUADRIGA DOMINUS colorway.")
    if not ring_size:
        raise CatalogError("MISSING_RING_SIZE: QUADRIGA DOMINUS requires a ring size.")
    size_norm = ring_size.replace("US ", "").strip()
    if size_norm not in _QUADRIGA_VALID_SIZES:
        raise CatalogError(f"INVALID_RING_SIZE: '{ring_size}' is not a valid QUADRIGA DOMINUS gents size.")
    cw = _QUADRIGA_COLORWAYS[cw_key]
    unit_cents = cw["prices_usd"][karat]
    sku = f"QUADD-{cw_key.upper().replace('-', '')}-{karat}-SZ{size_norm.replace('.', '-')}"
    ring_size_label = f"US {size_norm}"
    return {
        "product_id": "quadriga-dominus",
        "product_name": "QUADRIGA DOMINUS",
        "subtitle": "Genuine-Stone Statement Ring",
        "gemstones": "188 Pavé Stones + Centre Stone",
        "sku": sku,
        "variant": f"{karat} · {cw['name']} · {ring_size_label}",
        "karat": karat, "metal_colour": cw["name"], "ring_size": ring_size_label,
        "unit_amount_cents": unit_cents, "currency": "USD", "quantity": quantity,
        "image": "/quadriga/card-hero.jpg",
        "metadata": {
            "product_slug": "quadriga-dominus", "sku": sku,
            "karat": karat, "colorway": cw["name"], "ring_size": ring_size_label,
        },
    }


# ---------------------------------------------------------------------------
# Public entry: resolve_line_item()
# ---------------------------------------------------------------------------
def resolve_line_item(product_id: str,
                      karat: Optional[str],
                      metal_colour: Optional[str],
                      ring_size: Optional[str],
                      quantity: int,
                      variant: Optional[str] = None,
                      colorway: Optional[str] = None,
                      tier: Optional[str] = None,
                      market_snapshot: Optional[Dict] = None) -> Dict:
    if not is_supported(product_id):
        raise CatalogError(f"UNSUPPORTED_PRODUCT: '{product_id}' is not available for online checkout yet.")
    if not isinstance(quantity, int) or quantity < 1 or quantity > 5:
        raise CatalogError("INVALID_QUANTITY: must be an integer between 1 and 5.")

    if product_id == "scacco-matto":
        return _resolve_scacco(karat, metal_colour, ring_size, quantity)
    if product_id == "ribbon-regale-edition":
        # Accept either the explicit `variant` slug or fall back to reading it
        # from the `karat` field (which the frontend uses as the tierKey).
        v = variant or karat
        return _resolve_ribbon_regale_edition(v, quantity)
    if product_id == "quadriga-dominus":
        # QUADRIGA colorway may arrive via `colorway` or via `metal_colour`
        # depending on frontend payload shape.
        cw = colorway or metal_colour
        return _resolve_quadriga(karat, cw, ring_size, quantity)
    if product_id == "bajan-joe":
        # BAJAN JOE tier arrives via `variant` (polish|matte); older payloads
        # may send it in `karat` slot.
        t = variant or karat
        return _resolve_bajan_joe(t, ring_size, quantity)

    if product_id in _DYNAMIC_RING_TIERS:
        # Dynamic-priced ring — tier arrives via `tier` / `variant` / `karat`.
        t = tier or variant or karat
        return _resolve_dynamic_ring(product_id, t, ring_size, quantity, market_snapshot)

    if product_id in _PE_CATALOG or product_id in _PE_FIXED:
        # Pricing-engine-backed OR fixed-product from wave 3. Both are routed
        # via the same PE resolver which auto-dispatches to the right path.
        t = tier or variant or karat
        try:
            return _pe_resolve(product_id, t, ring_size, quantity, market_snapshot)
        except _PEResolverError as e:  # type: ignore
            raise CatalogError(str(e))

    raise CatalogError(f"UNSUPPORTED_PRODUCT: '{product_id}' has no resolver.")


# ---------------------------------------------------------------------------
# Totals + mixed-currency guard
# ---------------------------------------------------------------------------
def compute_totals(items: List[Dict]) -> Dict:
    if not items:
        raise CatalogError("EMPTY_CART: cannot compute totals for zero items.")

    currencies = {i.get("currency") for i in items}
    if len(currencies) > 1:
        # Backend-authoritative mixed-currency rejection. Never reach Stripe.
        raise CatalogError("MIXED_CURRENCY_CART: Items priced in different currencies "
                           "must be purchased separately.")

    currency = next(iter(currencies))
    if not currency:
        raise CatalogError("MISSING_CURRENCY: resolved item is missing currency.")

    subtotal_cents = sum(i["unit_amount_cents"] * i["quantity"] for i in items)
    shipping_cents = 0
    tax_cents = 0
    total_cents = subtotal_cents + shipping_cents + tax_cents
    return {"subtotal_cents": subtotal_cents, "shipping_cents": shipping_cents,
            "tax_cents": tax_cents, "total_cents": total_cents, "currency": currency}
