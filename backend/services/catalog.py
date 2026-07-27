"""Trusted server-side catalog for payment (Phase 1 pilot: SCACCO MATTO only).
Prices are integer cents. This module is the ONLY authority for payment prices."""
from typing import Optional, Dict

_SCACCO_PRICE_CENTS_USD = {
    ("10K", "yellow"): 390000,
    ("14K", "yellow"): 430000,
    ("10K", "white"):  410000,
    ("14K", "white"):  450000,
}
_VALID_SIZES = {"4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","custom"}

class CatalogError(ValueError):
    pass

def is_supported(product_id: str) -> bool:
    return product_id == "scacco-matto"

def resolve_line_item(product_id: str, karat: Optional[str], metal_colour: Optional[str],
                      ring_size: Optional[str], quantity: int) -> Dict:
    if not is_supported(product_id):
        raise CatalogError(f"UNSUPPORTED_PRODUCT: '{product_id}' is not available for online checkout yet.")
    if not karat or karat not in ("10K", "14K"):
        raise CatalogError("INVALID_KARAT: must be '10K' or '14K'.")
    colour_key = (metal_colour or "").strip().lower().replace(" gold", "")
    if colour_key not in ("yellow", "white"):
        raise CatalogError("INVALID_COLOUR: must be 'Yellow Gold' or 'White Gold'.")
    if not ring_size:
        raise CatalogError("MISSING_RING_SIZE: SCACCO MATTO requires a ring size.")
    size_norm = ring_size.replace("US ", "").strip().lower()
    if size_norm not in _VALID_SIZES:
        raise CatalogError(f"INVALID_RING_SIZE: '{ring_size}' is not a valid PHILEON ring size.")
    if not isinstance(quantity, int) or quantity < 1 or quantity > 5:
        raise CatalogError("INVALID_QUANTITY: must be an integer between 1 and 5.")
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
        "karat": karat,
        "metal_colour": colour_label,
        "ring_size": ring_size_label,
        "unit_amount_cents": unit_cents,
        "currency": "USD",
        "quantity": quantity,
        "image": "/fine-jewelry/scacco-matto/hero-three-quarter.png",
    }

def compute_totals(items):
    subtotal_cents = sum(i["unit_amount_cents"] * i["quantity"] for i in items)
    # Phase 1 pilot: no tax, no shipping applied (SCACCO MATTO is made-to-order, ship logic TBD).
    shipping_cents = 0
    tax_cents = 0
    total_cents = subtotal_cents + shipping_cents + tax_cents
    return {"subtotal_cents": subtotal_cents, "shipping_cents": shipping_cents,
            "tax_cents": tax_cents, "total_cents": total_cents, "currency": "USD"}
