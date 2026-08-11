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


# ---------------------------------------------------------------------------
# FIXED_PRODUCTS — page-declared fixed-price products NOT in
# pricing_engine.LIVE_PRICING_CONFIG. All prices are the EXACT amount shown
# on the storefront (integer dollars). Mirrors the source page's PRICE_USD
# constants and variant tables verbatim. No new tiers invented.
# ---------------------------------------------------------------------------
# Schema per slug:
#   currency          — always "USD" here (all migrated fixed products use USD)
#   product_name / subtitle — customer-facing text
#   sku_prefix        — deterministic prefix for internal SKU
#   size_profile      — None | "ladies" | "gents" | "unisex" (ring-size validation)
#   needs_size        — bool
#   variants          — {variant_key: {price_usd, metal_label, sku_suffix (optional)}}
FIXED_PRODUCTS: Dict[str, Dict] = {

    # ── Inspiration Vault (single-tier fixed USD) ──────────────────
    "iv-altar": {
        "product_name": "ALTAR", "subtitle": "Architectural Cross Cuff · Inspiration Vault",
        "currency": "USD", "sku_prefix": "IV-AL", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 40,  "metal_label": "Gold-Plated Stainless Steel", "sku_suffix": "CRX"}},
    },
    "iv-caged-wings": {
        "product_name": "CAGED WINGS", "subtitle": "Earrings · Inspiration Vault",
        "currency": "USD", "sku_prefix": "IV-CW", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 70,  "metal_label": "Rhodium-Plated Alloy", "sku_suffix": "PR"}},
    },
    "iv-driven": {
        "product_name": "DRIVEN", "subtitle": "Bracelets · Inspiration Vault",
        "currency": "USD", "sku_prefix": "IV-DR", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 75,  "metal_label": "Rhodium-Plated Alloy", "sku_suffix": "01"}},
    },
    "iv-echelle": {
        "product_name": "ÉCHELLE", "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "sku_prefix": "IV-EC", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 115, "metal_label": "Gold-Plated Alloy", "sku_suffix": "3TG"}},
    },
    "iv-lucent": {
        "product_name": "LUCENT", "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "sku_prefix": "IV-LC", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 70,  "metal_label": "Rhodium-Plated Alloy", "sku_suffix": "CHN"}},
    },
    "iv-monaco": {
        "product_name": "MONACO", "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "sku_prefix": "IV-MC", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 60,  "metal_label": "Two-Finger Ring · Rhodium-Plated Alloy", "sku_suffix": "2F"}},
    },
    "iv-nova": {
        "product_name": "NOVA", "subtitle": "Earrings · Inspiration Vault",
        "currency": "USD", "sku_prefix": "IV-NV", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 80,  "metal_label": "Rhodium-Plated Alloy", "sku_suffix": "PR"}},
    },
    "iv-oriel": {
        "product_name": "ORIEL", "subtitle": "Inspiration Vault · Archive",
        "currency": "USD", "sku_prefix": "IV-OR", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 40,  "metal_label": "Rose-Silver-White Ring", "sku_suffix": "RSW"}},
    },
    "iv-parabola-atelier": {
        "product_name": "PARABOLA ATELIER", "subtitle": "Study · Inspiration Vault",
        "currency": "USD", "sku_prefix": "IV-PA", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 100, "metal_label": "Alloy Study", "sku_suffix": "STUDY"}},
    },
    "iv-parallax-drop-earrings": {
        "product_name": "PARALLAX", "subtitle": "Drop Earrings · Inspiration Vault",
        "currency": "USD", "sku_prefix": "IV-PARALLAX", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 70,  "metal_label": "Rhodium-Plated Alloy", "sku_suffix": "DROPS"}},
    },
    "iv-ribbon-regale": {
        "product_name": "RIBBON REGALE", "subtitle": "Inspiration Vault · Archive Piece",
        "currency": "USD", "sku_prefix": "IV-RIBBON", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 30,  "metal_label": "Costume Alloy", "sku_suffix": "REGALE"}},
    },
    "iv-roseline": {
        "product_name": "ROSELINE", "subtitle": "Rose-Gold Open Cuff Bangle · Inspiration Vault",
        "currency": "USD", "sku_prefix": "IV-RL", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 50,  "metal_label": "Rose-Gold Plated Brass", "sku_suffix": "RG"}},
    },
    "iv-stampede-set": {
        "product_name": "STAMPEDE SET", "subtitle": "Inspiration Vault · Archive Set",
        "currency": "USD", "sku_prefix": "IV-STAMPEDE", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 150, "metal_label": "Mixed Alloy Set", "sku_suffix": "SET"}},
    },
    "iv-nightfang-set": {
        "product_name": "NIGHTFANG SET", "subtitle": "Inspiration Vault · Archive Set",
        "currency": "USD", "sku_prefix": "IV-NIGHTFANG", "size_profile": None, "needs_size": False,
        "variants": {"default": {"price_usd": 185, "metal_label": "Mixed Alloy Set", "sku_suffix": "SET"}},
    },

    # ── Re-audit MIGRATED single-price products ──────────────────
    "drew-face": {
        "product_name": "DREW FACE", "subtitle": "Vault Collector Pendant",
        "currency": "USD", "sku_prefix": "DREW", "size_profile": None, "needs_size": False,
        "variants": {"vault": {"price_usd": 850, "metal_label": "Vault Collector Edition", "sku_suffix": "VAULT"}},
    },
    "la-madonna": {
        "product_name": "LA MADONNA", "subtitle": "10K Yellow Gold · Signature",
        "currency": "USD", "sku_prefix": "LMD", "size_profile": None, "needs_size": False,
        "variants": {"10k-yellow": {"price_usd": 28500, "metal_label": "10K Yellow Gold", "sku_suffix": "10K"}},
    },
    "la-scarpa-della-regina": {
        "product_name": "LA SCARPA DELLA REGINA", "subtitle": "18K Rose Gold · Signature Object",
        "currency": "USD", "sku_prefix": "LSC", "size_profile": None, "needs_size": False,
        "variants": {"18k-rose": {"price_usd": 9000, "metal_label": "18K Rose Gold", "sku_suffix": "18KR"}},
    },
    "midweek": {
        "product_name": "MIDWEEK", "subtitle": "Sterling Silver Mesh Cuff",
        "currency": "USD", "sku_prefix": "MDW", "size_profile": None, "needs_size": False,
        "variants": {"silver-black-dia": {"price_usd": 850, "metal_label": "Sterling Silver + Black Diamonds", "sku_suffix": "SBDIA"}},
    },

    # ── Re-audit MIGRATED multi-variant products ──────────────────
    "bape": {
        "product_name": "BAPE", "subtitle": "PHILEON × BAPE · Ring",
        "currency": "USD", "sku_prefix": "BAPE", "size_profile": "unisex", "needs_size": True,
        "variants": {
            "10k-yellow": {"price_usd":  9500, "metal_label": "10K Yellow Gold", "sku_suffix": "10KY"},
            "14k-yellow": {"price_usd": 12500, "metal_label": "14K Yellow Gold", "sku_suffix": "14KY"},
            "18k-yellow": {"price_usd": 17000, "metal_label": "18K Yellow Gold", "sku_suffix": "18KY"},
        },
    },
    "lisa": {
        "product_name": "LISA", "subtitle": "Emerald Dome Ring",
        "currency": "USD", "sku_prefix": "LISA", "size_profile": "ladies", "needs_size": True,
        "variants": {
            "emerald-tight": {"price_usd": 5500, "metal_label": "Tight-Set Emeralds",  "sku_suffix": "TGHT"},
            "emerald-open":  {"price_usd": 9000, "metal_label": "Open-Set Emeralds",   "sku_suffix": "OPEN"},
        },
    },
    "the-carapace": {
        "product_name": "THE CARAPACE", "subtitle": "Sculptural Lattice Dome Ring",
        "currency": "USD", "sku_prefix": "CRP", "size_profile": "unisex", "needs_size": True,
        "variants": {
            "vermeil":      {"price_usd":  350, "metal_label": "Vermeil",           "sku_suffix": "VRM"},
            "vermeil-pave": {"price_usd":  600, "metal_label": "Vermeil Pavé",      "sku_suffix": "VRMPV"},
            "10k":          {"price_usd": 1100, "metal_label": "10K Gold",          "sku_suffix": "10K"},
            "10k-pave":     {"price_usd": 1450, "metal_label": "10K Gold Pavé",     "sku_suffix": "10KPV"},
        },
    },
    "neighborhood-nip": {
        # BASE_PRICE_CAD=19950 → cadToUsdLuxury=$15,000. CUSTOM_FEE_CAD=1000 → +$750.
        # 14K White only. Ring size required. Custom pattern is metadata (server
        # does not validate the grid; the price already includes the +$750 fee).
        "product_name": "NEIGHBORHOOD NIP", "subtitle": "14K White · Victory Patch Ring",
        "currency": "USD", "sku_prefix": "NHN", "size_profile": "gents", "needs_size": True,
        "variants": {
            "original": {"price_usd": 15000, "metal_label": "14K White · Original Victory Patch", "sku_suffix": "ORIG"},
            "custom":   {"price_usd": 15750, "metal_label": "14K White · Custom B/W Layout",      "sku_suffix": "CSTM"},
        },
    },

    # ── RETRO BRED — DREW'S VAULT · PRIVATE RELEASE (CAD, chain separate) ─
    # Pendant only. Chain sold separately. 3 tiers, all CAD.
    "retro-bred": {
        "product_name": "RETRO BRED", "subtitle": "Drew's Vault · Private Release",
        "currency": "CAD", "sku_prefix": "RB", "size_profile": None, "needs_size": False,
        "variants": {
            "foundation": {"price_usd":  5995, "metal_label": "Sterling Silver · Synthetic Stones", "sku_suffix": "FND-925"},
            "signature":  {"price_usd": 10495, "metal_label": "10K Gold · Lab-Grown Stones",        "sku_suffix": "SIG-10K"},
            "heirloom":   {"price_usd": 11795, "metal_label": "14K Gold · Lab-Grown Stones",        "sku_suffix": "HRL-14K"},
        },
    },

    # ── THE GRAND DAME — Cuff · 2 metals × 3 tiers ────────────────────────
    # Current storefront (GrandDamePage.jsx + products.theGrandDame) publishes
    # FINAL prices (products.js flags `pricingPending: false` and defines
    # `metals.rose.tiers` + `metals.yellow.tiers` with concrete integer USD
    # amounts). This supersedes the STALE `pricing_engine.LIVE_PRICING_CONFIG.
    # theGrandDame` entry (all `lockedBasePriceCad: 0`) — which is retained
    # in that file for schema reasons but is NOT the trusted source anymore.
    # Cart tierKey is sent as `${metal}_${tier}` (e.g. "rose_foundation").
    "the-grand-dame": {
        "product_name": "THE GRAND DAME CUFF", "subtitle": "Sculptural Open Cuff",
        "currency": "USD", "sku_prefix": "GDM", "size_profile": None, "needs_size": False,
        "variants": {
            "rose_foundation":   {"price_usd":  9500, "metal_label": "Rose Gold · Foundation",   "sku_suffix": "ROSE-FND"},
            "rose_signature":    {"price_usd": 12500, "metal_label": "Rose Gold · Signature",    "sku_suffix": "ROSE-SIG"},
            "rose_heirloom":     {"price_usd": 17000, "metal_label": "Rose Gold · Heirloom",     "sku_suffix": "ROSE-HRL"},
            "yellow_foundation": {"price_usd":  9500, "metal_label": "Yellow Gold · Foundation", "sku_suffix": "YEL-FND"},
            "yellow_signature":  {"price_usd": 12500, "metal_label": "Yellow Gold · Signature",  "sku_suffix": "YEL-SIG"},
            "yellow_heirloom":   {"price_usd": 17000, "metal_label": "Yellow Gold · Heirloom",   "sku_suffix": "YEL-HRL"},
        },
    },
}

FIXED_PRODUCT_SLUGS: Set[str] = frozenset(FIXED_PRODUCTS.keys())


# ---------------------------------------------------------------------------
# CRESTA NERA — Hinged Bangle · 2 metals × 4 wrist sizes with size-based uplift
# ---------------------------------------------------------------------------
# Merchant-signed trusted matrix. The customer-facing frontend page (Feb 2026)
# publishes different values in its `PRICE_MATRIX` — the SERVER matrix here is
# the authoritative one and supersedes any frontend deltas.
CRESTA_NERA_MATRIX: Dict[str, Dict[str, int]] = {
    "10k-yellow-gold": {"small": 10495, "medium": 10745, "large": 10995, "xl": 11245},
    "14k-yellow-gold": {"small": 11795, "medium": 12045, "large": 12295, "xl": 12545},
}
CRESTA_NERA_METAL_LABELS = {
    "10k-yellow-gold": "10K Yellow Gold",
    "14k-yellow-gold": "14K Yellow Gold",
}
CRESTA_NERA_SIZE_LABELS = {
    "small":  ("Small",       180),
    "medium": ("Medium",      190),
    "large":  ("Large",       200),
    "xl":     ("Extra Large", 210),
}


def _resolve_cresta_nera(tier_key: Optional[str], wrist_size: Optional[str],
                        quantity: int) -> Dict:
    """CRESTA NERA hinged bangle resolver.

    `tier_key` carries the metal id (`10k-yellow-gold` | `14k-yellow-gold`).
    `wrist_size` carries the size id (`small` | `medium` | `large` | `xl`) —
    NOT a US ring size. Missing/invalid values are rejected.
    """
    if not tier_key:
        raise PricingEngineResolverError("MISSING_METAL: CRESTA NERA requires a metal selection (10K or 14K Yellow Gold).")
    mkey = tier_key.strip().lower()
    if mkey not in CRESTA_NERA_MATRIX:
        raise PricingEngineResolverError(f"INVALID_METAL: '{tier_key}' is not a valid CRESTA NERA metal.")
    if not wrist_size:
        raise PricingEngineResolverError("MISSING_WRIST_SIZE: CRESTA NERA requires a wrist size (Small / Medium / Large / Extra Large).")
    skey = wrist_size.strip().lower()
    if skey not in CRESTA_NERA_MATRIX[mkey]:
        raise PricingEngineResolverError(f"INVALID_WRIST_SIZE: '{wrist_size}' is not a valid CRESTA NERA wrist size.")

    price_usd = int(CRESTA_NERA_MATRIX[mkey][skey])
    metal_label = CRESTA_NERA_METAL_LABELS[mkey]
    size_label, size_mm = CRESTA_NERA_SIZE_LABELS[skey]

    # SKU: CRESTA-{10K|14K}-{S|M|L|XL}
    karat_token = "10K" if mkey.startswith("10k") else "14K"
    size_token = {"small": "S", "medium": "M", "large": "L", "xl": "XL"}[skey]
    sku = f"CRESTA-{karat_token}-{size_token}"

    return {
        "product_id":  "cresta-nera",
        "product_name": "CRESTA NERA HINGED BANGLE",
        "subtitle":    "Yellow Gold Hinged Bangle",
        "gemstones":   None,
        "sku":         sku,
        "variant":     f"{metal_label} · {size_label} ({size_mm} mm)",
        "karat":       karat_token,
        "metal_colour": "Yellow Gold",
        "ring_size":   None,   # Not a ring — uses wrist_size instead.
        "wrist_size":  f"{size_label} ({size_mm} mm)",
        "unit_amount_cents": price_usd * 100,
        "currency":    "USD",
        "quantity":    quantity,
        "image":       "/products/cresta-nera/hero.jpg",
        "is_dynamic_priced": False,
        "pricing_source": {"market_timestamp": 0, "market_source": "fixed-catalog", "is_stale": False},
        "metadata": {"product_slug": "cresta-nera", "sku": sku, "metal": mkey, "wrist_size": skey},
    }
ALL_SLUGS = frozenset(list(PRICING_ENGINE_CATALOG.keys()) + list(FIXED_PRODUCTS.keys()) + ["cresta-nera"])


class PricingEngineResolverError(Exception):
    """Raised for validation errors within this resolver."""


def _valid_sizes_for(profile: Optional[str]) -> Optional[frozenset]:
    if profile is None: return None
    if profile == "ladies": return _LADIES_SIZES
    if profile == "gents":  return _GENTS_SIZES
    return _UNISEX_SIZES


def _resolve_fixed_product(product_id: str, tier_key: Optional[str],
                           ring_size: Optional[str], quantity: int) -> Dict:
    """Resolver for `FIXED_PRODUCTS` (page-declared exact USD amounts).
    No market snapshot needed — the merchant sets each price directly.
    """
    cfg = FIXED_PRODUCTS[product_id]
    if not tier_key:
        # Single-variant products can safely default to their sole variant.
        if len(cfg["variants"]) == 1:
            tier_key = next(iter(cfg["variants"].keys()))
        else:
            raise PricingEngineResolverError(
                f"MISSING_TIER: {cfg['product_name']} requires a variant selection."
            )
    tk = tier_key.strip()
    if tk not in cfg["variants"]:
        raise PricingEngineResolverError(
            f"INVALID_TIER: '{tier_key}' is not a valid {cfg['product_name']} variant."
        )
    v = cfg["variants"][tk]

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

    price_usd = int(v["price_usd"])
    if price_usd <= 0:
        raise PricingEngineResolverError(f"PRICING_UNAVAILABLE: {cfg['product_name']}.")
    unit_amount_cents = price_usd * 100

    if cfg["needs_size"]:
        size_token = (size_norm or "").replace(".", "-")
        sku = f"{cfg['sku_prefix']}-{v.get('sku_suffix', tk.upper())}-SZ{size_token}"
        variant = f"{v['metal_label']} · US {size_norm}"
    else:
        sku = f"{cfg['sku_prefix']}-{v.get('sku_suffix', tk.upper())}"
        variant = v["metal_label"]

    return {
        "product_id": product_id,
        "product_name": cfg["product_name"],
        "subtitle": cfg["subtitle"],
        "gemstones": None,
        "sku": sku,
        "variant": variant,
        "karat": None,
        "metal_colour": None,
        "ring_size": f"US {size_norm}" if size_norm else None,
        "unit_amount_cents": unit_amount_cents,
        "currency": cfg["currency"],
        "quantity": quantity,
        "image": f"/products/{product_id}/hero.jpg",
        "is_dynamic_priced": False,
        "pricing_source": {"market_timestamp": 0, "market_source": "fixed-catalog", "is_stale": False},
        "metadata": {"product_slug": product_id, "sku": sku, "tier": tk},
    }


def _tiers_are_all_static(product_key: str) -> bool:
    tiers = LIVE_PRICING_CONFIG.get(product_key, {})
    if not tiers: return False
    return all(int(t.get("weightGrams", 0) or 0) == 0 for t in tiers.values())


def resolve(product_id: str, tier_key: Optional[str], ring_size: Optional[str],
            quantity: int, market_snapshot: Optional[Dict],
            wrist_size: Optional[str] = None) -> Dict:
    """Trusted resolver.

    - Cresta Nera → 2 metals × 4 wrist sizes matrix (uses `wrist_size` param).
    - `FIXED_PRODUCTS` → static USD amounts (no market snapshot needed).
    - `PRICING_ENGINE_CATALOG` → live-priced or hand-set via pricing_engine.
    - Ring products must supply `ring_size`.
    """
    if product_id == "cresta-nera":
        return _resolve_cresta_nera(tier_key, wrist_size, quantity)
    if product_id in FIXED_PRODUCTS:
        return _resolve_fixed_product(product_id, tier_key, ring_size, quantity)
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
