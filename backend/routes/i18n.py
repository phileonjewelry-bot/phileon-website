"""PHILEON — i18n / display-currency routes.

Server-side authority for:
  * approved display-currency allowlist
  * current USD-base FX snapshot (Frankfurter, 6h TTL, 48h stale fallback)
  * geolocation-based currency preview

None of this is used for payment math. Trusted payment stays in canonical
USD; Stripe Adaptive Pricing decides the actual customer-charged currency
and amount at checkout.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Request

from services.fx_display import (
    SUPPORTED_DISPLAY_CURRENCIES,
    BASE_CURRENCY,
    get_snapshot,
)

router = APIRouter(prefix="/i18n", tags=["i18n"])


# Country → default display currency (display defaults ONLY — never used
# for shipping/tax/trust decisions). Missing → USD.
_EUROZONE = {
    "AT","BE","CY","DE","EE","ES","FI","FR","GR","HR","IE","IT","LT","LU",
    "LV","MT","NL","PT","SI","SK",
}


def _country_to_currency(country: Optional[str]) -> str:
    c = (country or "").strip().upper()
    if not c:
        return BASE_CURRENCY
    if c == "US":
        return "USD"
    if c == "CA":
        return "CAD"
    if c == "GB":
        return "GBP"
    if c == "AU":
        return "AUD"
    if c == "JP":
        return "JPY"
    if c in _EUROZONE:
        return "EUR"
    return BASE_CURRENCY


def _sniff_country_from_request(request: Request) -> Optional[str]:
    """Best-effort ISO alpha-2 country from platform/CDN headers.
    Never adds a new vendor — reads what the platform already provides.
    """
    hdrs = request.headers
    candidates = [
        hdrs.get("cf-ipcountry"),                  # Cloudflare
        hdrs.get("x-vercel-ip-country"),           # Vercel
        hdrs.get("x-country-code"),                # Generic
        hdrs.get("x-emergent-country"),            # Emergent platform (if present)
        hdrs.get("x-appengine-country"),           # GAE
        hdrs.get("cloudfront-viewer-country"),     # CloudFront
    ]
    for c in candidates:
        if c and isinstance(c, str) and len(c.strip()) == 2 and c.strip().upper() != "XX":
            return c.strip().upper()
    return None


@router.get("/currencies")
async def list_currencies():
    """Approved display-currency allowlist. Read-only."""
    return {
        "base": BASE_CURRENCY,
        "currencies": list(SUPPORTED_DISPLAY_CURRENCIES),
    }


@router.get("/rates")
async def get_rates():
    """Current USD-base FX snapshot (display-only)."""
    snap = get_snapshot()
    if not snap:
        return {
            "base": BASE_CURRENCY,
            "rates": {BASE_CURRENCY: 1.0},
            "is_stale": False,
            "source": "fallback",
            "fetched_at": None,
            "age_seconds": None,
        }
    return snap


@router.get("/currency-preview")
async def currency_preview(request: Request, country: Optional[str] = None):
    """Return a suggested display currency for the visitor.
    Never affects shipping, tax, catalog price, or the Stripe amount.
    """
    detected = (country or "").strip().upper() or _sniff_country_from_request(request)
    suggested = _country_to_currency(detected)
    return {
        "detected_country": detected,
        "suggested_currency": suggested,
        "supported": list(SUPPORTED_DISPLAY_CURRENCIES),
        "source": "request-header" if not country and detected else ("query" if country else "fallback"),
    }
