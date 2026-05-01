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
        "foundation": {"lockedBasePriceCad": 11400, "metalType": "10K", "weightGrams": 18, "lockedMetalReferenceCad": 1125},
        "signature":  {"lockedBasePriceCad": 14800, "metalType": "14K", "weightGrams": 20, "lockedMetalReferenceCad": 1750},
        "heirloom":   {"lockedBasePriceCad": 18800, "metalType": "18K", "weightGrams": 22, "lockedMetalReferenceCad": 2475},
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
