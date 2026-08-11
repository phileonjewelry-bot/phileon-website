"""Trusted server-side metal spot-price service.

Purpose
-------
Single authority for the two units the PHILEON pricing engine consumes:
  - goldPerGram24kCad   (CAD per gram of 24K gold)
  - silverPerGramCad    (CAD per gram of silver)

Design
------
Provider adapter for Metals-API is scaffolded but is NOT contacted unless
`METALS_API_KEY` is present in the environment. When absent, the service
returns the same conservative fallback constants the frontend and
pricing_engine already treat as safe (150 CAD/g Au 24K, 1.25 CAD/g Ag),
tagged as `isFallback: True` so callers can render a "prices provisional"
UX where relevant.

Flow (target)
-------------
Metals-API  →  metal_spot.get_spot()  →  pricing_engine  →  /api/market-prices
                                            ↓
                              trusted checkout resolver  →  Stripe

The frontend must NEVER call Metals-API directly. `METALS_API_KEY` must
never appear in frontend code, logs, or Git.
"""
from __future__ import annotations
import os
import time
from typing import Dict

# Metals-API returns rates as: 1 base_ccy = X target (e.g. 1 USD = 0.000512 XAU).
# So `1 XAU (troy oz of gold) in USD` = 1 / rate.
TROY_OUNCE_GRAMS = 31.1034768

_FALLBACK_GOLD_PER_GRAM_24K_CAD = 150.0
_FALLBACK_SILVER_PER_GRAM_CAD   = 1.25
_FALLBACK_SOURCE                = "phileon-fallback"

# In-memory soft cache. Deliberately not persisted so a process restart
# forces a fresh fetch — safer for a low-volume boutique storefront than
# a stale disk cache with obscure invalidation rules.
_CACHE: Dict[str, object] = {"payload": None, "expires_at": 0.0}
_CACHE_TTL_SECONDS = 15 * 60  # 15-minute soft cache; provider may be slow


def _fallback_payload() -> Dict:
    return {
        "goldPerGram24kCad": _FALLBACK_GOLD_PER_GRAM_24K_CAD,
        "silverPerGramCad":  _FALLBACK_SILVER_PER_GRAM_CAD,
        "timestamp": int(time.time()),
        "source": _FALLBACK_SOURCE,
        "isFallback": True,
    }


def _normalise_metals_api(raw: Dict) -> Dict:
    """Normalise a Metals-API `/latest` response into PHILEON units.

    Metals-API convention: `rates.XAU` = amount of XAU per 1 unit of base.
    So the base-currency price per troy ounce of gold = 1 / rates.XAU.

    Expected input shape (parity with provider docs):
        {"base": "CAD", "rates": {"XAU": 0.000488, "XAG": 0.0334}, "timestamp": 1734567890}
    """
    base = (raw.get("base") or "").upper()
    rates = raw.get("rates") or {}
    xau = rates.get("XAU")
    xag = rates.get("XAG")
    if base != "CAD" or not xau or not xag:
        raise ValueError("Metals-API response not in expected CAD/XAU/XAG shape.")

    # 1 troy ounce in CAD =  1 / rate
    gold_troyoz_cad   = 1.0 / float(xau)
    silver_troyoz_cad = 1.0 / float(xag)

    # Per-gram (24K purity is by definition 100% Au — the karat multiplier
    # is applied downstream in pricing_engine, not here).
    gold_per_gram_24k_cad = gold_troyoz_cad   / TROY_OUNCE_GRAMS
    silver_per_gram_cad   = silver_troyoz_cad / TROY_OUNCE_GRAMS

    return {
        "goldPerGram24kCad": round(gold_per_gram_24k_cad, 6),
        "silverPerGramCad":  round(silver_per_gram_cad, 6),
        "timestamp": int(raw.get("timestamp") or time.time()),
        "source": "metals-api",
        "isFallback": False,
    }


def _fetch_from_metals_api(api_key: str) -> Dict:
    """Actual network call. Guarded so unit tests can monkeypatch."""
    import urllib.request, json
    url = f"https://metals-api.com/api/latest?access_key={api_key}&base=CAD&symbols=XAU,XAG"
    req = urllib.request.Request(url, headers={"User-Agent": "PHILEON-Backend/1.0"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        raw = json.loads(resp.read().decode("utf-8"))
    if not raw.get("success", True):
        raise ValueError(f"metals-api rejected request: {raw.get('error') or 'unknown'}")
    return _normalise_metals_api(raw)


def get_spot(force_refresh: bool = False) -> Dict:
    """Return current spot payload with normalised PHILEON units.

    Never raises to callers — on any failure it degrades to the fallback
    payload with `isFallback=True` so checkout stays operational.
    """
    now = time.time()
    if not force_refresh and _CACHE["payload"] and now < float(_CACHE["expires_at"]):
        return _CACHE["payload"]  # type: ignore

    api_key = os.environ.get("METALS_API_KEY")
    if not api_key:
        payload = _fallback_payload()
        _CACHE["payload"] = payload
        _CACHE["expires_at"] = now + _CACHE_TTL_SECONDS
        return payload

    try:
        payload = _fetch_from_metals_api(api_key)
    except Exception:
        # Any provider failure → fall back safely. Never expose provider
        # error details to the customer surface.
        payload = _fallback_payload()

    _CACHE["payload"] = payload
    _CACHE["expires_at"] = now + _CACHE_TTL_SECONDS
    return payload


def clear_cache() -> None:
    _CACHE["payload"] = None
    _CACHE["expires_at"] = 0.0
