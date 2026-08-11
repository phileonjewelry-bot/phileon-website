"""Trusted server-side catalog for payment.
Prices are integer cents. This module is the ONLY authority for payment
prices, currency and SKU identity. Never trust client-supplied values.

Supported products:
  - scacco-matto             (USD) — Phase 1 pilot ring
  - ribbon-regale-edition    (CAD) — Fine Jewelry earring, 4 metal variants
  - quadriga-dominus         (USD) — Gents statement ring, 4 colorways × 2 karats × 17 sizes
"""
from typing import Optional, Dict, List

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


_SUPPORTED_SLUGS = {"scacco-matto", "ribbon-regale-edition", "quadriga-dominus"}

def is_supported(product_id: str) -> bool:
    return product_id in _SUPPORTED_SLUGS


# ---------------------------------------------------------------------------
# Individual resolvers
# ---------------------------------------------------------------------------
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
                      colorway: Optional[str] = None) -> Dict:
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
