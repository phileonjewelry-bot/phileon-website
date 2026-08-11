"""Trusted resolver for PHILEON products that live in pricing_engine.LIVE_PRICING_CONFIG.

Single reusable resolver for the ~50 bespoke products whose pricing is already
mirrored in `pricing_engine.py`. The frontend displays each product either:
  • as CAD (raw `compute_live_price` output), or
  • as USD via `cadToUsdLuxury` (deterministic 0.75 × CAD rounded to $50 / $500).

To preserve the exact customer-facing amount, the server mirrors the same
deterministic conversion when a product is declared `currency: "USD"` with
`convert_usd_luxury: True`.

DO NOT add pricing here that is not already reflected in pricing_engine.
"""
from typing import Optional, Dict, Set
from pricing_engine import LIVE_PRICING_CONFIG, compute_live_price


PHILEON_FX = 0.75  # mirrors /app/frontend/src/lib/livePricing.js


def cad_to_usd_luxury(cad_value: float) -> int:
    """Deterministic mirror of the frontend `cadToUsdLuxury()`.

    JS:  raw = cad * 0.75;  step = raw < 2000 ? 50 : 500;  round(raw/step)*step
    """
    if not cad_value or cad_value <= 0:
        return 0
    raw = cad_value * PHILEON_FX
    step = 50 if raw < 2000 else 500
    return int(round(raw / step) * step)


# ---------------------------------------------------------------------------
# Slug ↔ pricing_engine key catalog for products migrated in this pass.
#
# Fields:
#   product_key            — the LIVE_PRICING_CONFIG key
#   product_name / subtitle — customer-facing text (never leaked in prices)
#   currency               — "USD" or "CAD"
#   convert_usd_luxury     — True → apply cad_to_usd_luxury to the CAD result
#   size_profile           — None | "ladies" | "gents" | "unisex" (ring-size validation)
#   needs_size             — bool (rings + some cuffs)
#   sku_prefix             — short deterministic token for SKU building
#   tier_map               — optional {frontend_tier → pricing_engine_tier}
#   allow_engraving        — bool (Bajan-Joe-style engravings)
#   category               — for downstream classification (informational)
# ---------------------------------------------------------------------------

_LADIES_SIZES = frozenset(["4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11"])
_GENTS_SIZES  = frozenset(["7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15"])
_UNISEX_SIZES = _LADIES_SIZES | _GENTS_SIZES


PRICING_ENGINE_CATALOG: Dict[str, Dict] = {

    # ────────────────────────── HAND-SET USD PRODUCTS (weightGrams=0) ─────
    # Backend `lockedBasePriceCad` numerically MIRRORS the USD amount, so we
    # return it as USD cents without any conversion.

    "boss-knot": {
        "product_key": "bossKnot", "product_name": "BOSS KNOT",
        "subtitle": "Executive Statement Pendant",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "BK",
        "category": "pendant",
    },
    "lady-boss-knot": {
        "product_key": "ladyBossKnot", "product_name": "LADY BOSS KNOT",
        "subtitle": "Ladies Executive Statement Pendant",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "LBK",
        "category": "pendant",
    },
    "veyron-noir": {
        "product_key": "veyronNoir", "product_name": "VEYRON NOIR",
        "subtitle": "Cocktail Signet Ring",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": "unisex", "needs_size": True, "sku_prefix": "VYN",
        "category": "ring",
    },
    "wynette-palette": {
        "product_key": "wynettePalette", "product_name": "WYNETTE'S PALETTE",
        "subtitle": "Statement Ring",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": "ladies", "needs_size": True, "sku_prefix": "WYN",
        "category": "ring",
    },
    "uncle-jo": {
        "product_key": "uncleJo", "product_name": "UNCLE JO",
        "subtitle": "Signature Mesh · Ring / Cuff / Set",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "UJO",
        "category": "set",
    },
    "rose-of-sharon": {
        "product_key": "roseOfSharon", "product_name": "ROSE OF SHARON",
        "subtitle": "Floral Cross Pendant",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "ROS",
        "category": "pendant",
    },
    "battenti-della-villa": {
        "product_key": "battentiDellaVilla", "product_name": "BATTENTI DELLA VILLA",
        "subtitle": "Villa Door Knocker Earrings",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "BDV",
        "category": "earring",
    },
    "gent": {
        "product_key": "gent", "product_name": "GENT",
        "subtitle": "Architectural Signet Ring",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": "gents", "needs_size": True, "sku_prefix": "GNT",
        "category": "ring",
    },
    "stackrats": {
        "product_key": "stackrats", "product_name": "STACKRATS",
        "subtitle": "Bangle Stack",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "STK",
        "category": "bracelet",
    },
    "coogi-dna-tag": {
        "product_key": "coogiDnaTag", "product_name": "COOGI DNA TAG",
        "subtitle": "PHILEON × COOGI Tribute Pendant",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "CDT",
        "category": "pendant",
    },
    "katrina-cascata": {
        "product_key": "katrinaCascata", "product_name": "KATRINA CASCATA",
        "subtitle": "Cascade Pendant",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "KC",
        "category": "pendant",
    },
    "true-vine": {
        "product_key": "theTrueVine", "product_name": "THE TRUE VINE",
        "subtitle": "Sacred Objects · Pendant + Chain",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "TV",
        "category": "pendant",
    },

    # ────────────────────────── INSPIRATION VAULT (fixed USD) ─────────────
    # Single "default" tier · fixed price · no ring size · always $USD.
    "iv-first-discovery": {
        "product_key": "inspirationVaultFirstDiscovery", "product_name": "FIRST DISCOVERY",
        "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "IV-FD",
        "category": "vault",
    },
    "iv-noir-cadence": {
        "product_key": "inspirationVaultNoirCadence", "product_name": "NOIR CADENCE",
        "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "IV-NC",
        "category": "vault",
    },
    "iv-liaison": {
        "product_key": "inspirationVaultLiaison", "product_name": "LIAISON",
        "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "IV-LI",
        "category": "vault",
    },
    "iv-noir-tide": {
        "product_key": "inspirationVaultNoirTide", "product_name": "NOIR TIDE",
        "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "IV-NT",
        "category": "vault",
    },
    "iv-prismatic-laurel": {
        "product_key": "inspirationVaultPrismaticLaurel", "product_name": "PRISMATIC LAUREL",
        "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "IV-PL",
        "category": "vault",
    },
    "iv-viridian-teardrops": {
        "product_key": "inspirationVaultViridianTeardrops", "product_name": "VIRIDIAN TEARDROPS",
        "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "IV-VT",
        "category": "vault",
    },
    "iv-orbit-lumiere": {
        "product_key": "inspirationVaultOrbitLumiere", "product_name": "ORBIT LUMIÈRE",
        "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "IV-OL",
        "category": "vault",
    },
    "iv-deco-eventail": {
        "product_key": "inspirationVaultDecoEventail", "product_name": "DECO ÉVENTAIL",
        "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "convert_usd_luxury": False,
        "size_profile": None, "needs_size": False, "sku_prefix": "IV-DE",
        "category": "vault",
    },

    # ────────────────────────── DYNAMIC-CAD PRODUCTS DISPLAYED IN USD ──────
    # Frontend calls useLivePrice → cadToUsdLuxury. Server mirrors that exactly:
    # returns USD cents by applying cad_to_usd_luxury to compute_live_price().
    # Ring products need `ringSize`. Cuff/pendant/set products don't.

    "bamburgh": {
        "product_key": "bamburgh", "product_name": "BAMBURGH",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "gents", "needs_size": True, "sku_prefix": "BAM",
        "category": "ring",
    },
    "lady-bamburgh": {
        "product_key": "ladyBamburgh", "product_name": "LADY BAMBURGH",
        "subtitle": "Ladies Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "ladies", "needs_size": True, "sku_prefix": "LBAM",
        "category": "ring",
    },
    "blessed": {
        "product_key": "blessed", "product_name": "BLESSED",
        "subtitle": "Devotional Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "unisex", "needs_size": True, "sku_prefix": "BLS",
        "category": "ring",
    },
    "apex": {
        "product_key": "apex", "product_name": "APEX",
        "subtitle": "Statement Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "gents", "needs_size": True, "sku_prefix": "APX",
        "category": "ring",
    },
    "bound": {
        "product_key": "bound", "product_name": "BOUND",
        "subtitle": "Statement Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "gents", "needs_size": True, "sku_prefix": "BND",
        "category": "ring",
    },
    "morso": {
        "product_key": "morso", "product_name": "IL MORSO DEL RE",
        "subtitle": "The King's Bite · Statement Ring",
        "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "gents", "needs_size": True, "sku_prefix": "MOR",
        "category": "ring",
    },
    "la-bete": {
        "product_key": "labete", "product_name": "LA BÊTE",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "gents", "needs_size": True, "sku_prefix": "LBT",
        "category": "ring",
    },
    "cypher": {
        "product_key": "cypher", "product_name": "CYPHER",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "gents", "needs_size": True, "sku_prefix": "CYP",
        "category": "ring",
    },
    "coogi-i": {
        "product_key": "coogiI", "product_name": "COOGI I",
        "subtitle": "Tribute Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "gents", "needs_size": True, "sku_prefix": "COO",
        "category": "ring",
    },
    "homage": {
        "product_key": "homage", "product_name": "HOMAGE",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "gents", "needs_size": True, "sku_prefix": "HMG",
        "category": "ring",
    },
    "corinthians-15-14": {
        "product_key": "corinthians1514", "product_name": "CORINTHIANS 15:14",
        "subtitle": "Devotional Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "unisex", "needs_size": True, "sku_prefix": "COR",
        "category": "ring",
    },
    "trace": {
        "product_key": "trace", "product_name": "TRACE",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "unisex", "needs_size": True, "sku_prefix": "TRC",
        "category": "ring",
    },
    "galatians-6-14": {
        "product_key": "galatians614", "product_name": "GALATIANS 6:14",
        "subtitle": "Devotional Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "unisex", "needs_size": True, "sku_prefix": "GAL",
        "category": "ring",
    },
    "drape": {
        "product_key": "drape", "product_name": "DRAPE",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "ladies", "needs_size": True, "sku_prefix": "DRP",
        "category": "ring",
    },
    "fondo-curvo": {
        "product_key": "fondoCurvo", "product_name": "FONDO CURVO",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "ladies", "needs_size": True, "sku_prefix": "FCV",
        "category": "ring",
    },
    "prise-de-couronne": {
        "product_key": "priseDeCouronne", "product_name": "PRISE DE COURONNE",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "ladies", "needs_size": True, "sku_prefix": "PDC",
        "category": "ring",
    },
    "nervatura": {
        "product_key": "nervatura", "product_name": "NERVATURA",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "unisex", "needs_size": True, "sku_prefix": "NRV",
        "category": "ring",
    },
    "the-don-gorgon": {
        "product_key": "theDonGorgon", "product_name": "THE DON GORGON",
        "subtitle": "Statement Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "gents", "needs_size": True, "sku_prefix": "DGN",
        "category": "ring",
    },
    "lady-jay": {
        "product_key": "ladyJay", "product_name": "LADY JAY",
        "subtitle": "Sapphire & Diamond Pavé Ring",
        "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "ladies", "needs_size": True, "sku_prefix": "LJY",
        "category": "ring",
    },
    "porta-aurea": {
        "product_key": "portaAurea", "product_name": "PORTA AUREA",
        "subtitle": "Signet Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "unisex", "needs_size": True, "sku_prefix": "PAA",
        "category": "ring",
    },
    "monika-couture": {
        "product_key": "monikaCouture", "product_name": "MONIKA COUTURE",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "ladies", "needs_size": True, "sku_prefix": "MKC",
        "category": "ring",
    },
    "cocktail-jessica": {
        "product_key": "cocktailJessica", "product_name": "COCKTAIL JESSICA",
        "subtitle": "Cocktail Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "ladies", "needs_size": True, "sku_prefix": "CJS",
        "category": "ring",
    },
    "rosaria": {
        "product_key": "rosaria", "product_name": "ROSARIA",
        "subtitle": "Signature Ring", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": "ladies", "needs_size": True, "sku_prefix": "RSA",
        "category": "ring",
    },
    "alejandra-heels": {
        "product_key": "alejandraHeels", "product_name": "ALEJANDRA HEELS",
        "subtitle": "Pendant", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": None, "needs_size": False, "sku_prefix": "ALH",
        "category": "pendant",
    },
    "desir-corset": {
        "product_key": "desirCorset", "product_name": "DÉSIR CORSET",
        "subtitle": "Sculptural Piece", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": None, "needs_size": False, "sku_prefix": "DCO",
        "category": "pendant",
    },
    "forme-cuff": {
        "product_key": "formeCuff", "product_name": "FORME CUFF",
        "subtitle": "Architectural Cuff", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": None, "needs_size": False, "sku_prefix": "FMC",
        "category": "cuff",
    },
    "ptp-cuff": {
        "product_key": "ptpCuff", "product_name": "PTP CUFF",
        "subtitle": "Signature Cuff", "currency": "USD", "convert_usd_luxury": True,
        "size_profile": None, "needs_size": False, "sku_prefix": "PTP",
        "category": "cuff",
    },
}


ALL_SLUGS: Set[str] = frozenset(PRICING_ENGINE_CATALOG.keys())


class PricingEngineResolverError(Exception):
    """Raised for validation errors within this resolver."""


def _valid_sizes_for(profile: Optional[str]) -> Optional[frozenset]:
    if profile is None: return None
    if profile == "ladies": return _LADIES_SIZES
    if profile == "gents":  return _GENTS_SIZES
    return _UNISEX_SIZES


def _tiers_are_all_static(product_key: str) -> bool:
    tiers = LIVE_PRICING_CONFIG.get(product_key, {})
    if not tiers: return False
    return all(int(t.get("weightGrams", 0) or 0) == 0 for t in tiers.values())


def resolve(product_id: str, tier_key: Optional[str], ring_size: Optional[str],
            quantity: int, market_snapshot: Optional[Dict]) -> Dict:
    """Trusted resolver.

    - For products with any weightGrams>0 tier, `market_snapshot` MUST be a
      checkout-safe snapshot (caller enforces `is_checkout_safe`).
    - For hand-set products (all tiers weightGrams=0), the formula collapses
      to `lockedBasePriceCad` and no snapshot is required — we use a benign
      fallback so the shared pricing helper still works.
    - Ring products must supply `ring_size`.
    - Returns the standard resolver dict shape consumed by `resolve_line_item`.
    """
    if product_id not in PRICING_ENGINE_CATALOG:
        raise PricingEngineResolverError(f"UNSUPPORTED_PRODUCT: {product_id}")
    cfg = PRICING_ENGINE_CATALOG[product_id]

    all_static = _tiers_are_all_static(cfg["product_key"])
    if market_snapshot is None:
        if not all_static:
            raise PricingEngineResolverError("LIVE_PRICE_UNAVAILABLE: missing trusted market snapshot.")
        # Fallback market — safe because weightGrams=0 makes the delta zero.
        market_snapshot = {"goldPerGram24kCad": 150.0, "silverPerGramCad": 1.25,
                           "timestamp": 0, "source": "static-only", "isFallback": False,
                           "isStale": False, "ageSeconds": 0}

    # Tier validation
    if not tier_key:
        raise PricingEngineResolverError(f"MISSING_TIER: {cfg['product_name']} requires a tier selection.")
    tk = tier_key.strip()
    tier_map = cfg.get("tier_map") or {}
    resolved_tier = tier_map.get(tk, tk)  # allow direct pass-through by default
    product_config = LIVE_PRICING_CONFIG.get(cfg["product_key"], {})
    if resolved_tier not in product_config:
        raise PricingEngineResolverError(
            f"INVALID_TIER: '{tier_key}' is not a valid {cfg['product_name']} tier."
        )
    tier_config = product_config[resolved_tier]
    if not tier_config.get("lockedBasePriceCad"):
        # Pricing pending — merchant hasn't set a price yet.
        raise PricingEngineResolverError(
            f"PRICING_PENDING: {cfg['product_name']} pricing is on inquiry only."
        )

    # Size validation (rings + some sized products)
    size_norm = None
    if cfg["needs_size"]:
        if not ring_size:
            raise PricingEngineResolverError(f"MISSING_RING_SIZE: {cfg['product_name']} requires a ring size.")
        size_norm = ring_size.replace("US ", "").strip()
        valid = _valid_sizes_for(cfg["size_profile"])
        if valid is not None and size_norm not in valid:
            raise PricingEngineResolverError(
                f"INVALID_RING_SIZE: '{ring_size}' is not a valid {cfg['product_name']} ring size."
            )

    # Price
    if all_static:
        # Hand-set: use lockedBasePriceCad exactly (no luxury rounding — those
        # amounts already reflect the merchant's exact intent, e.g. $75 IV
        # pieces, $495 Katrina Cascata, $11,334 Coogi DNA Tag).
        cad_price = float(tier_config["lockedBasePriceCad"])
    else:
        cad_price = compute_live_price(cfg["product_key"], resolved_tier, market_snapshot)
    if cad_price <= 0:
        raise PricingEngineResolverError(f"PRICING_UNAVAILABLE: could not compute {cfg['product_name']} price.")
    if cfg.get("convert_usd_luxury"):
        display_amount = cad_to_usd_luxury(cad_price)
    else:
        display_amount = cad_price
    unit_amount_cents = int(round(display_amount * 100))

    # SKU
    tier_token = resolved_tier.upper().replace("_", "-")
    if cfg["needs_size"]:
        size_token = (size_norm or "").replace(".", "-")
        sku = f"{cfg['sku_prefix']}-{tier_token}-SZ{size_token}"
        size_label = f"US {size_norm}"
        variant = f"{cfg['subtitle']} · {resolved_tier} · {size_label}"
    else:
        sku = f"{cfg['sku_prefix']}-{tier_token}"
        size_label = None
        variant = f"{cfg['subtitle']} · {resolved_tier}"

    return {
        "product_id": product_id,
        "product_name": cfg["product_name"],
        "subtitle":     cfg["subtitle"],
        "gemstones":    None,
        "sku":          sku,
        "variant":      variant,
        "karat":        tier_config.get("metalType"),
        "metal_colour": None,
        "ring_size":    size_label,
        "unit_amount_cents": unit_amount_cents,
        "currency":     cfg["currency"],
        "quantity":     quantity,
        "image":        f"/products/{product_id}/hero.jpg",
        "is_dynamic_priced": bool(tier_config.get("weightGrams", 0) > 0),
        "pricing_source": {
            "market_timestamp": int(market_snapshot.get("timestamp", 0)),
            "market_source":    market_snapshot.get("source"),
            "is_stale":         bool(market_snapshot.get("isStale", False)),
        },
        "metadata": {
            "product_slug": product_id, "sku": sku,
            "tier": resolved_tier, "market_source": market_snapshot.get("source") or "",
            "market_timestamp": str(int(market_snapshot.get("timestamp", 0))),
        },
    }
