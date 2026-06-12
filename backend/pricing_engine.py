"""
Server-side live pricing engine.
Mirrors the frontend livePricing.js logic exactly.
Used for cart validation and order price verification.
"""

import math
import random
from datetime import datetime, timezone

# Karat multipliers — same as frontend
KARAT_MULTIPLIERS = {
    "10K": 10 / 24,
    "14K": 14 / 24,
    "18K": 18 / 24,
    "925": 0.925,
}

# Default market fallback
DEFAULT_MARKET = {
    "goldPerGram24kCad": 150.0,
    "silverPerGramCad": 1.25,
}

# Locked pricing config — mirrors frontend livePricingConfig.js exactly
LIVE_PRICING_CONFIG = {
    "laMarva": {
        "signature":   {"lockedBasePriceCad": 3400,  "metalType": "925",  "weightGrams": 22,   "lockedMetalReferenceCad": 25},
        "foundation":  {"lockedBasePriceCad": 8000,  "metalType": "10K",  "weightGrams": 18,   "lockedMetalReferenceCad": 1125},
        "heirloom14k": {"lockedBasePriceCad": 18000, "metalType": "14K",  "weightGrams": 20,   "lockedMetalReferenceCad": 1750},
        "heirloom18k": {"lockedBasePriceCad": 22000, "metalType": "18K",  "weightGrams": 22,   "lockedMetalReferenceCad": 2475},
    },
    "annieRose": {
        "silver":  {"lockedBasePriceCad": 6400, "metalType": "925",  "weightGrams": 35, "lockedMetalReferenceCad": 41},
        "gold10k": {"lockedBasePriceCad": 9200, "metalType": "10K",  "weightGrams": 30, "lockedMetalReferenceCad": 1875},
    },
    "wynettePalette": {
        "silver":  {"lockedBasePriceCad": 2950, "metalType": "925", "weightGrams": 18.0, "lockedMetalReferenceCad": 17},
        "gold10k": {"lockedBasePriceCad": 7500, "metalType": "10K", "weightGrams": 16.5, "lockedMetalReferenceCad": 619},
        "gold14k": {"lockedBasePriceCad": 9950, "metalType": "14K", "weightGrams": 18.6, "lockedMetalReferenceCad": 977},
    },
    # VEYRON NOIR — Tribute Series cocktail signet · 4 metal tiers
    # Hand-set USD prices (lockedBasePriceCad numerically mirrors
    # priceUsd so server_price == client_price on /validate-cart).
    "veyronNoir": {
        "silver":  {"lockedBasePriceCad": 1450, "metalType": "925", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "gold10k": {"lockedBasePriceCad": 3500, "metalType": "10K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "gold14k": {"lockedBasePriceCad": 5000, "metalType": "14K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "gold18k": {"lockedBasePriceCad": 7000, "metalType": "18K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
    },
    "monikaCouture": {
        "silver":    {"lockedBasePriceCad": 1400, "metalType": "925",  "weightGrams": 12, "lockedMetalReferenceCad": 14},
        "white10k":  {"lockedBasePriceCad": 2400, "metalType": "10K",  "weightGrams": 10, "lockedMetalReferenceCad": 625},
        "rose10k":   {"lockedBasePriceCad": 2400, "metalType": "10K",  "weightGrams": 10, "lockedMetalReferenceCad": 625},
        "yellow10k": {"lockedBasePriceCad": 2400, "metalType": "10K",  "weightGrams": 10, "lockedMetalReferenceCad": 625},
    },
    "alejandraHeels": {
        "default": {"lockedBasePriceCad": 1250, "metalType": "925", "weightGrams": 8, "lockedMetalReferenceCad": 9},
    },
    "ptpCuff": {
        "foundation": {"lockedBasePriceCad": 1050, "metalType": "925",  "weightGrams": 45, "lockedMetalReferenceCad": 52},
        "signature":  {"lockedBasePriceCad": 2800, "metalType": "10K",  "weightGrams": 38, "lockedMetalReferenceCad": 2375},
        "heirloom":   {"lockedBasePriceCad": 4200, "metalType": "14K",  "weightGrams": 42, "lockedMetalReferenceCad": 3675},
    },
    "rosaria": {
        "foundation": {"lockedBasePriceCad": 2950, "metalType": "10K", "weightGrams": 8, "lockedMetalReferenceCad": 500},
        "signature":  {"lockedBasePriceCad": 4200, "metalType": "14K", "weightGrams": 9, "lockedMetalReferenceCad": 788},
        "heirloom":   {"lockedBasePriceCad": 6800, "metalType": "18K", "weightGrams": 10, "lockedMetalReferenceCad": 1125},
    },
    "desirCorset": {
        "pendant": {"lockedBasePriceCad": 5995, "metalType": "10K", "weightGrams": 12, "lockedMetalReferenceCad": 750},
        "full":    {"lockedBasePriceCad": 8995, "metalType": "10K", "weightGrams": 18, "lockedMetalReferenceCad": 1125},
    },
    "formeCuff": {
        "foundation": {"lockedBasePriceCad": 695,  "metalType": "925",  "weightGrams": 30, "lockedMetalReferenceCad": 35},
        "signature":  {"lockedBasePriceCad": 1800, "metalType": "10K",  "weightGrams": 25, "lockedMetalReferenceCad": 1563},
    },
    "rhythmMeshRing": {
        "foundation": {"lockedBasePriceCad": 1450, "metalType": "925",  "weightGrams": 14, "lockedMetalReferenceCad": 16},
        "signature":  {"lockedBasePriceCad": 2800, "metalType": "10K",  "weightGrams": 12, "lockedMetalReferenceCad": 750},
    },
    "tolaII": {
        "foundation": {"lockedBasePriceCad": 5200,  "metalType": "10K", "weightGrams": 16, "lockedMetalReferenceCad": 1000},
        "signature":  {"lockedBasePriceCad": 7800,  "metalType": "14K", "weightGrams": 18, "lockedMetalReferenceCad": 1575},
        "heirloom":   {"lockedBasePriceCad": 11000, "metalType": "18K", "weightGrams": 20, "lockedMetalReferenceCad": 2250},
    },
    "galatians614": {
        "foundation": {"lockedBasePriceCad": 3800, "metalType": "10K", "weightGrams": 14, "lockedMetalReferenceCad": 875},
        "signature":  {"lockedBasePriceCad": 5600, "metalType": "14K", "weightGrams": 15, "lockedMetalReferenceCad": 1313},
    },
    "trace": {
        "foundation": {"lockedBasePriceCad": 900,  "metalType": "925",  "weightGrams": 10, "lockedMetalReferenceCad": 12},
        "signature":  {"lockedBasePriceCad": 2200, "metalType": "10K",  "weightGrams": 8,  "lockedMetalReferenceCad": 500},
    },
    "bound": {
        "foundation": {"lockedBasePriceCad": 12800, "metalType": "10K", "weightGrams": 22, "lockedMetalReferenceCad": 1375},
        "signature":  {"lockedBasePriceCad": 16800, "metalType": "14K", "weightGrams": 24, "lockedMetalReferenceCad": 2100},
        "heirloom":   {"lockedBasePriceCad": 22000, "metalType": "18K", "weightGrams": 26, "lockedMetalReferenceCad": 2925},
    },
    "apex": {
        "core":       {"lockedBasePriceCad": 4800,  "metalType": "10K", "weightGrams": 14, "lockedMetalReferenceCad": 875},
        "foundation": {"lockedBasePriceCad": 6400,  "metalType": "10K", "weightGrams": 16, "lockedMetalReferenceCad": 1000},
        "signature":  {"lockedBasePriceCad": 9200,  "metalType": "14K", "weightGrams": 18, "lockedMetalReferenceCad": 1575},
        "heirloom":   {"lockedBasePriceCad": 14000, "metalType": "18K", "weightGrams": 20, "lockedMetalReferenceCad": 2250},
    },
    "homage": {
        "foundation": {"lockedBasePriceCad": 1400, "metalType": "925",  "weightGrams": 18, "lockedMetalReferenceCad": 21},
        "signature":  {"lockedBasePriceCad": 3200, "metalType": "10K",  "weightGrams": 15, "lockedMetalReferenceCad": 938},
    },
    "cypher": {
        "foundation": {"lockedBasePriceCad": 4400,  "metalType": "10K", "weightGrams": 15, "lockedMetalReferenceCad": 938},
        "signature":  {"lockedBasePriceCad": 6800,  "metalType": "14K", "weightGrams": 17, "lockedMetalReferenceCad": 1488},
        "heirloom":   {"lockedBasePriceCad": 9600,  "metalType": "18K", "weightGrams": 19, "lockedMetalReferenceCad": 2138},
    },
    "morso": {
        "foundation": {"lockedBasePriceCad": 6800,  "metalType": "10K", "weightGrams": 18, "lockedMetalReferenceCad": 1125},
        "signature":  {"lockedBasePriceCad": 9400,  "metalType": "14K", "weightGrams": 20, "lockedMetalReferenceCad": 1750},
        "heirloom":   {"lockedBasePriceCad": 13200, "metalType": "18K", "weightGrams": 22, "lockedMetalReferenceCad": 2475},
    },
    "labete": {
        "foundation": {"lockedBasePriceCad": 7400,  "metalType": "10K", "weightGrams": 20, "lockedMetalReferenceCad": 1250},
        "signature":  {"lockedBasePriceCad": 10200, "metalType": "14K", "weightGrams": 22, "lockedMetalReferenceCad": 1925},
        "heirloom":   {"lockedBasePriceCad": 14800, "metalType": "18K", "weightGrams": 24, "lockedMetalReferenceCad": 2700},
    },
    "blessed": {
        "foundation": {"lockedBasePriceCad": 880,  "metalType": "925",  "weightGrams": 12, "lockedMetalReferenceCad": 14},
        "signature":  {"lockedBasePriceCad": 2200, "metalType": "10K",  "weightGrams": 10, "lockedMetalReferenceCad": 625},
        "heirloom":   {"lockedBasePriceCad": 3800, "metalType": "14K",  "weightGrams": 11, "lockedMetalReferenceCad": 963},
    },
    "coogiI": {
        "foundation": {"lockedBasePriceCad": 12800, "metalType": "10K", "weightGrams": 15, "lockedMetalReferenceCad": 938},
        "signature":  {"lockedBasePriceCad": 16800, "metalType": "14K", "weightGrams": 17, "lockedMetalReferenceCad": 1488},
        "heirloom":   {"lockedBasePriceCad": 22000, "metalType": "18K", "weightGrams": 19, "lockedMetalReferenceCad": 2138},
    },
    "bamburgh": {
        "foundation": {"lockedBasePriceCad": 8200,  "metalType": "14K", "weightGrams": 16, "lockedMetalReferenceCad": 1400},
        "signature":  {"lockedBasePriceCad": 9600,  "metalType": "14K", "weightGrams": 18, "lockedMetalReferenceCad": 1575},
        "heirloom":   {"lockedBasePriceCad": 11000, "metalType": "18K", "weightGrams": 18, "lockedMetalReferenceCad": 2025},
    },
    "ladyBamburgh": {
        "foundation": {"lockedBasePriceCad": 11400, "metalType": "14K", "weightGrams": 12, "lockedMetalReferenceCad": 1050},
        "signature":  {"lockedBasePriceCad": 14800, "metalType": "14K", "weightGrams": 14.5, "lockedMetalReferenceCad": 1269},
        "heirloom":   {"lockedBasePriceCad": 18800, "metalType": "18K", "weightGrams": 15, "lockedMetalReferenceCad": 1688},
    },
    "fondoCurvo": {
        "silver":  {"lockedBasePriceCad": 2950, "metalType": "925", "weightGrams": 12.5, "lockedMetalReferenceCad": 14},
        "gold10k": {"lockedBasePriceCad": 5400, "metalType": "10K", "weightGrams": 12.5, "lockedMetalReferenceCad": 781},
    },
    "corinthians1514": {
        "foundation": {"lockedBasePriceCad": 4200, "metalType": "10K", "weightGrams": 16, "lockedMetalReferenceCad": 1000},
        "signature":  {"lockedBasePriceCad": 5900, "metalType": "14K", "weightGrams": 17, "lockedMetalReferenceCad": 1488},
        "heirloom":   {"lockedBasePriceCad": 8800, "metalType": "18K", "weightGrams": 18, "lockedMetalReferenceCad": 2025},
    },
    "drape": {
        "silver":     {"lockedBasePriceCad": 1950, "metalType": "925", "weightGrams": 12.5, "lockedMetalReferenceCad": 14},
        "foundation": {"lockedBasePriceCad": 5200, "metalType": "10K", "weightGrams": 12.5, "lockedMetalReferenceCad": 781},
        "signature":  {"lockedBasePriceCad": 6800, "metalType": "14K", "weightGrams": 12.5, "lockedMetalReferenceCad": 1094},
        "heirloom":   {"lockedBasePriceCad": 9200, "metalType": "18K", "weightGrams": 12.5, "lockedMetalReferenceCad": 1406},
    },
    "cocktailJessica": {
        "standard": {"lockedBasePriceCad": 8500, "metalType": "10K", "weightGrams": 18.5, "lockedMetalReferenceCad": 1156},
    },
    "priseDeCouronne": {
        "foundation": {"lockedBasePriceCad": 2800, "metalType": "925", "weightGrams": 22, "lockedMetalReferenceCad": 25},
        "signature":  {"lockedBasePriceCad": 6200, "metalType": "10K", "weightGrams": 22, "lockedMetalReferenceCad": 1375},
    },
    "nervatura": {
        "foundation": {"lockedBasePriceCad": 1200, "metalType": "10K", "weightGrams": 16, "lockedMetalReferenceCad": 1000},
        "signature":  {"lockedBasePriceCad": 1800, "metalType": "14K", "weightGrams": 16, "lockedMetalReferenceCad": 1400},
        "heirloom":   {"lockedBasePriceCad": 2600, "metalType": "18K", "weightGrams": 16, "lockedMetalReferenceCad": 1800},
    },
    "theDonGorgon": {
        "silver_foundation_home": {"lockedBasePriceCad": 3100, "metalType": "925", "weightGrams": 14, "lockedMetalReferenceCad": 18},
        "silver_foundation_away": {"lockedBasePriceCad": 2800, "metalType": "925", "weightGrams": 14, "lockedMetalReferenceCad": 18},
        "gold_foundation_home":   {"lockedBasePriceCad": 7100, "metalType": "10K", "weightGrams": 14, "lockedMetalReferenceCad": 875},
        "gold_foundation_away":   {"lockedBasePriceCad": 6800, "metalType": "10K", "weightGrams": 14, "lockedMetalReferenceCad": 875},
        "gold_signature_home":    {"lockedBasePriceCad": 9500, "metalType": "14K", "weightGrams": 14, "lockedMetalReferenceCad": 1225},
        "gold_signature_away":    {"lockedBasePriceCad": 9200, "metalType": "14K", "weightGrams": 14, "lockedMetalReferenceCad": 1225},
        "gold_heirloom_home":     {"lockedBasePriceCad": 14800, "metalType": "18K", "weightGrams": 14, "lockedMetalReferenceCad": 1575},
        "gold_heirloom_away":     {"lockedBasePriceCad": 14500, "metalType": "18K", "weightGrams": 14, "lockedMetalReferenceCad": 1575},
    },
    # THE GRAND DAME — Cuff (rose gold, 3 tiers).
    # pricingPending: lockedBasePriceCad placeholders are 0 — page renders
    # "Pricing on Inquiry" and the page does NOT submit cart validation calls.
    "theGrandDame": {
        "foundation": {"lockedBasePriceCad": 0, "metalType": "10K", "weightGrams": 45, "lockedMetalReferenceCad": 2813},
        "signature":  {"lockedBasePriceCad": 0, "metalType": "14K", "weightGrams": 50, "lockedMetalReferenceCad": 4375},
        "heirloom":   {"lockedBasePriceCad": 0, "metalType": "18K", "weightGrams": 55, "lockedMetalReferenceCad": 6188},
    },
    # LADY JAY — Tribute Series (4 metal tiers, white metal, sapphire + diamond pavé)
    # CAD bases reverse-calculated so cadToUsdLuxury produces: $4,800 / $8,500 / $11,000 / $14,500
    "ladyJay": {
        "foundation": {"lockedBasePriceCad": 6400,  "metalType": "925", "weightGrams": 10.5, "lockedMetalReferenceCad": 12},
        "signature":  {"lockedBasePriceCad": 11334, "metalType": "10K", "weightGrams": 12.8, "lockedMetalReferenceCad": 800},
        "heirloom":   {"lockedBasePriceCad": 14667, "metalType": "14K", "weightGrams": 14.5, "lockedMetalReferenceCad": 1269},
        "collector":  {"lockedBasePriceCad": 19334, "metalType": "18K", "weightGrams": 17.2, "lockedMetalReferenceCad": 1935},
    },
    # THE TRUE VINE — PHILEON Sacred Objects · Pendant
    # 4 metal tiers × 4 chain options = 16 SKUs. Tier key format: "{metal}__{chain}".
    # weightGrams=0 disables metal recalc; lockedBasePriceCad is the exact compound CAD total
    # (pendant + chain add-on). Mirrors TrueVinePage.jsx METAL_TIERS + CHAIN_OPTIONS.
    "theTrueVine": {
        # FOUNDATION — Sterling Silver Vermeil ($2,200 pendant)
        "foundation__pendant-only": {"lockedBasePriceCad": 2200, "metalType": "925", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "foundation__rope-20":      {"lockedBasePriceCad": 2650, "metalType": "925", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "foundation__rope-22":      {"lockedBasePriceCad": 2750, "metalType": "925", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "foundation__rope-24":      {"lockedBasePriceCad": 2850, "metalType": "925", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        # SIGNATURE — 10K Yellow Gold ($4,200 pendant)
        "signature__pendant-only":  {"lockedBasePriceCad": 4200, "metalType": "10K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "signature__rope-20":       {"lockedBasePriceCad": 4850, "metalType": "10K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "signature__rope-22":       {"lockedBasePriceCad": 4950, "metalType": "10K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "signature__rope-24":       {"lockedBasePriceCad": 5100, "metalType": "10K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        # HEIRLOOM — 14K Yellow Gold ($5,200 pendant)
        "heirloom__pendant-only":   {"lockedBasePriceCad": 5200, "metalType": "14K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "heirloom__rope-20":        {"lockedBasePriceCad": 6050, "metalType": "14K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "heirloom__rope-22":        {"lockedBasePriceCad": 6150, "metalType": "14K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "heirloom__rope-24":        {"lockedBasePriceCad": 6300, "metalType": "14K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        # COLLECTOR — 18K Yellow Gold ($6,800 pendant)
        "collector__pendant-only":  {"lockedBasePriceCad": 6800, "metalType": "18K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "collector__rope-20":       {"lockedBasePriceCad": 8000, "metalType": "18K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "collector__rope-22":       {"lockedBasePriceCad": 8150, "metalType": "18K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "collector__rope-24":       {"lockedBasePriceCad": 8300, "metalType": "18K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
    },
    # PORTA AUREA — PHILEON Signet Objects · Ring
    # 3 metal tiers (10K / 14K / 18K Yellow Gold), square emerald-cut ruby centre.
    # CAD bases per brief → cadToUsdLuxury produces $5,500 / $7,000 / $8,500 USD.
    "portaAurea": {
        "signature": {"lockedBasePriceCad": 7200,  "metalType": "10K", "weightGrams": 23,   "lockedMetalReferenceCad": 1438},
        "heirloom":  {"lockedBasePriceCad": 9000,  "metalType": "14K", "weightGrams": 25.5, "lockedMetalReferenceCad": 2231},
        "collector": {"lockedBasePriceCad": 11500, "metalType": "18K", "weightGrams": 27.5, "lockedMetalReferenceCad": 3094},
    },
    # COOGI DNA TAG — PHILEON × COOGI · Tribute Series · Pendant
    # Two static variants (Snow 10K white gold · Sand 10K rose gold).
    # Standardized build: ~15g gold, lab diamonds + synthetic coloured stones.
    # CAD base $11,334 → cadToUsdLuxury produces $8,500 USD each.
    "coogiDnaTag": {
        "snow": {"lockedBasePriceCad": 11334, "metalType": "10K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "sand": {"lockedBasePriceCad": 11334, "metalType": "10K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
    },
    # BATTENTI DELLA VILLA — Ladies Earrings · 4 Metal Tiers
    # Villa Door Knocker Earrings · 45×30mm · ~25g · Omega back.
    # Hand-set USD prices (no live metal adjustment). lockedBasePriceCad
    # numerically mirrors the USD shown by the page so server_price
    # equals client_price on /api/validate-cart.
    "battentiDellaVilla": {
        "silver":  {"lockedBasePriceCad": 2800, "metalType": "925", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "gold10k": {"lockedBasePriceCad": 4800, "metalType": "10K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "gold14k": {"lockedBasePriceCad": 6200, "metalType": "14K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "gold18k": {"lockedBasePriceCad": 7800, "metalType": "18K", "weightGrams": 0, "lockedMetalReferenceCad": 0},
    },
    # GENT — Gentlemen's Club · Architectural Signet Ring
    # 4 hand-set metal tiers (Sterling Silver, Vermeil, 10K, 14K — no 18K).
    # weightGrams=0 disables live metal adjustment so server_price ==
    # client_price on /validate-cart.
    "gent": {
        "silver":  {"lockedBasePriceCad": 1850, "metalType": "925",         "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "vermeil": {"lockedBasePriceCad": 2400, "metalType": "925-vermeil", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "gold10k": {"lockedBasePriceCad": 4800, "metalType": "10K",         "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "gold14k": {"lockedBasePriceCad": 6800, "metalType": "14K",         "weightGrams": 0, "lockedMetalReferenceCad": 0},
    },
    # STACKRATS — Ladies · Bangles · Collective
    # 3 characters × 2 profiles + 2 full-stack bundles.
    "stackrats": {
        "dinah_wide":     {"lockedBasePriceCad": 2400, "metalType": "14K",   "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "dinah_thin":     {"lockedBasePriceCad": 1800, "metalType": "14K",   "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "valerie_wide":   {"lockedBasePriceCad": 2600, "metalType": "14K",   "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "valerie_thin":   {"lockedBasePriceCad": 1950, "metalType": "14K",   "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "dominique_wide": {"lockedBasePriceCad": 2900, "metalType": "18K",   "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "dominique_thin": {"lockedBasePriceCad": 2200, "metalType": "18K",   "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "fullstack_wide": {"lockedBasePriceCad": 7500, "metalType": "mixed", "weightGrams": 0, "lockedMetalReferenceCad": 0},
        "fullstack_thin": {"lockedBasePriceCad": 5700, "metalType": "mixed", "weightGrams": 0, "lockedMetalReferenceCad": 0},
    },
}


def round_luxury(value: float) -> int:
    """Round to nearest $50 CAD."""
    return int(round(value / 50) * 50)


def get_spot_per_gram_cad(metal_type: str, market: dict) -> float:
    if metal_type == "925":
        return market.get("silverPerGramCad", DEFAULT_MARKET["silverPerGramCad"])
    return market.get("goldPerGram24kCad", DEFAULT_MARKET["goldPerGram24kCad"])


def calculate_metal_value_cad(weight_grams: float, metal_type: str, market: dict) -> float:
    spot = get_spot_per_gram_cad(metal_type, market)
    multiplier = KARAT_MULTIPLIERS.get(metal_type, 1.0)
    return spot * multiplier * weight_grams


def compute_live_price(product_key: str, tier_key: str, market: dict) -> int:
    """
    Compute the live display price for a product tier.
    Returns the rounded price in CAD.
    """
    product_config = LIVE_PRICING_CONFIG.get(product_key)
    if not product_config:
        return 0

    tier_config = product_config.get(tier_key)
    if not tier_config:
        return 0

    current_metal = calculate_metal_value_cad(
        weight_grams=tier_config["weightGrams"],
        metal_type=tier_config["metalType"],
        market=market,
    )
    adjustment = current_metal - tier_config["lockedMetalReferenceCad"]
    return round_luxury(tier_config["lockedBasePriceCad"] + adjustment)


def get_current_market() -> dict:
    """Get current market prices (with small fluctuation)."""
    base_gold = 152.40
    base_silver = 1.31
    return {
        "goldPerGram24kCad": round(base_gold * (1 + random.uniform(-0.008, 0.008)), 2),
        "silverPerGramCad": round(base_silver * (1 + random.uniform(-0.008, 0.008)), 2),
    }


def validate_line_item_price(product_key: str, tier_key: str, client_price: float, tolerance: float = 100) -> dict:
    """
    Validate that a client-submitted price matches the server-computed live price.
    
    Args:
        product_key: e.g. "ladyBamburgh"
        tier_key: e.g. "signature"
        client_price: the price the client claims (lockedPriceCad from cart)
        tolerance: maximum allowed difference in CAD (default $100 to account for 
                   rounding + slight market movement between client fetch and server check)
    
    Returns:
        dict with valid (bool), server_price, client_price, difference
    """
    market = get_current_market()
    server_price = compute_live_price(product_key, tier_key, market)
    
    if server_price == 0:
        # Unknown product/tier — allow it through but flag it
        return {
            "valid": True,
            "server_price": 0,
            "client_price": client_price,
            "difference": 0,
            "warning": "Unknown product/tier — manual review required",
        }
    
    difference = abs(server_price - client_price)
    
    return {
        "valid": difference <= tolerance,
        "server_price": server_price,
        "client_price": client_price,
        "difference": difference,
    }
