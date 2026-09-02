"""PHILEON — Display FX service (server-side ONLY).

Frankfurter (api.frankfurter.dev) is a keyless, public FX aggregator used
STRICTLY as a display-only presentation authority for the storefront.

Rules
-----
* Base = USD (matches PHILEON canonical catalog currency).
* Supported display currencies = USD, CAD, GBP, EUR, AUD, JPY.
* Cache: last successful snapshot lives in-process 6h TTL.
* Provider outage:
    - snapshot age <= 48h → serve stale, mark `is_stale=True`, retain original
      timestamp. UI shows "Approx." label.
    - snapshot age > 48h  → return `None` snapshot; caller falls back to
      canonical USD display (no invented rates).
* Trusted payment paths NEVER call this module. Payment amounts come from
  `services.catalog` in USD; Stripe Adaptive Pricing decides the final
  presentment currency and amount at checkout.
"""
from __future__ import annotations

import logging
import time
from typing import Dict, Optional

import httpx

logger = logging.getLogger(__name__)

BASE_CURRENCY = "USD"
SUPPORTED_DISPLAY_CURRENCIES = ("USD", "CAD", "GBP", "EUR", "AUD", "JPY")

FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest"
TTL_SECONDS = 6 * 60 * 60          # 6h fresh window
STALE_LIMIT_SECONDS = 48 * 60 * 60  # 48h stale-but-usable ceiling
HTTP_TIMEOUT_SECONDS = 6.0

# In-process cache: last successful snapshot survives transient blips.
_CACHE: Dict[str, object] = {
    "rates": None,        # dict[str, float] — USD-base rates (USD:1.0 forced)
    "fetched_at": None,   # epoch seconds when the fetch actually succeeded
    "source": None,       # "frankfurter" | "stale" | "fallback"
}


def _now() -> float:
    return time.time()


def _fetch_frankfurter() -> Dict[str, float]:
    """Hit Frankfurter and return USD-base rates for the supported currencies.
    Raises on any error — caller decides fallback behavior.
    """
    symbols = ",".join(c for c in SUPPORTED_DISPLAY_CURRENCIES if c != BASE_CURRENCY)
    params = {"base": BASE_CURRENCY, "symbols": symbols}
    r = httpx.get(FRANKFURTER_URL, params=params, timeout=HTTP_TIMEOUT_SECONDS)
    r.raise_for_status()
    payload = r.json()
    remote_rates = payload.get("rates") or {}
    if not isinstance(remote_rates, dict) or not remote_rates:
        raise ValueError("frankfurter returned empty rates")
    out: Dict[str, float] = {BASE_CURRENCY: 1.0}
    for cur in SUPPORTED_DISPLAY_CURRENCIES:
        if cur == BASE_CURRENCY:
            continue
        v = remote_rates.get(cur)
        if v is None:
            raise ValueError(f"frankfurter missing rate for {cur}")
        rate = float(v)
        if rate <= 0 or rate > 100000:
            raise ValueError(f"frankfurter rate out of sane band for {cur}: {rate}")
        out[cur] = rate
    return out


def get_snapshot() -> Optional[Dict[str, object]]:
    """Return the current display-FX snapshot.

    Returns:
        {
          "base": "USD",
          "rates": {"USD": 1.0, "CAD": 1.36, "GBP": 0.79, ...},
          "fetched_at": <epoch seconds>,
          "age_seconds": <int>,
          "is_stale": <bool>,     # True when fresh window exceeded but <= 48h
          "source": "frankfurter" | "stale" | "fallback",
        }
        OR `None` when no rates are available at all (caller must fall back
        to canonical USD display).
    """
    cached_rates = _CACHE.get("rates")
    cached_at = _CACHE.get("fetched_at")
    age = (_now() - float(cached_at)) if cached_at else None

    # 1) Fresh cache → return without touching the network.
    if cached_rates and age is not None and age <= TTL_SECONDS:
        return {
            "base": BASE_CURRENCY,
            "rates": dict(cached_rates),
            "fetched_at": float(cached_at),
            "age_seconds": int(age),
            "is_stale": False,
            "source": _CACHE.get("source") or "frankfurter",
        }

    # 2) Cache stale or empty → attempt live fetch.
    try:
        fresh = _fetch_frankfurter()
        now = _now()
        _CACHE["rates"] = fresh
        _CACHE["fetched_at"] = now
        _CACHE["source"] = "frankfurter"
        return {
            "base": BASE_CURRENCY,
            "rates": dict(fresh),
            "fetched_at": now,
            "age_seconds": 0,
            "is_stale": False,
            "source": "frankfurter",
        }
    except Exception as e:
        logger.warning(f"fx_display frankfurter fetch failed: {type(e).__name__}")

    # 3) Live fetch failed → serve stale if within 48h, otherwise None.
    if cached_rates and age is not None and age <= STALE_LIMIT_SECONDS:
        return {
            "base": BASE_CURRENCY,
            "rates": dict(cached_rates),
            "fetched_at": float(cached_at),
            "age_seconds": int(age),
            "is_stale": True,
            "source": "stale",
        }

    return None


def convert_usd_cents(usd_cents: int, target_currency: str,
                      snapshot: Optional[Dict[str, object]] = None) -> Optional[int]:
    """Convert USD integer cents to display integer minor-units of the target
    currency using the current FX snapshot. Returns `None` when the target is
    unsupported or no snapshot is available. NEVER used for money math on the
    trusted payment path.
    """
    cur = (target_currency or "").upper().strip()
    if cur not in SUPPORTED_DISPLAY_CURRENCIES:
        return None
    if cur == BASE_CURRENCY:
        return int(usd_cents)
    snap = snapshot or get_snapshot()
    if not snap:
        return None
    rate = snap["rates"].get(cur)
    if rate is None:
        return None
    # JPY has no minor units. Frankfurter rate USD→JPY is already "yen per USD",
    # so cents * rate / 100 gives yen; represent as "0-decimal cents".
    if cur == "JPY":
        return int(round((int(usd_cents) / 100.0) * float(rate) * 100))
    return int(round(int(usd_cents) * float(rate)))
