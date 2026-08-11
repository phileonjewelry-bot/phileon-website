"""Trusted server-side metal spot-price service.

Cache policy (production-safe)
------------------------------
  FRESH     ( ageSeconds <= 600 )         → return cached trusted value; no network
  STALE     ( 600 < ageSeconds <= 1800 )  → try provider; on failure return cached
                                            trusted value flagged isStale=True
  EXPIRED   ( ageSeconds  > 1800 )        → try provider; on failure return the
                                            development fallback — the expired
                                            trusted quote is NOT returned for
                                            production checkout

Contract
--------
get_spot() returns:
  {
    "goldPerGram24kCad": float,
    "silverPerGramCad":  float,
    "timestamp":         int,
    "source":            "metals-api" | "phileon-fallback",
    "isFallback":        bool,
    "isStale":           bool,
    "ageSeconds":        int,
  }

is_checkout_safe(snapshot) returns True only when the snapshot is a real
provider quote (isFallback == False) with ageSeconds <= 1800.
"""
from __future__ import annotations
import os, time
from typing import Dict, Optional

TROY_OUNCE_GRAMS = 31.1034768

# Cache windows (seconds)
FRESH_MAX_AGE   = 10 * 60   # 10 minutes
STALE_MAX_AGE   = 30 * 60   # 30 minutes (absolute upper bound for trusted-cache reuse)

_FALLBACK_GOLD_PER_GRAM_24K_CAD = 150.0
_FALLBACK_SILVER_PER_GRAM_CAD   = 1.25
_FALLBACK_SOURCE                = "phileon-fallback"

# Only trusted provider snapshots are cached here. Never a fallback payload.
_TRUSTED_CACHE: Dict[str, Optional[Dict]] = {"snapshot": None}


def _now() -> int: return int(time.time())


def _fallback_payload() -> Dict:
    ts = _now()
    return {
        "goldPerGram24kCad": _FALLBACK_GOLD_PER_GRAM_24K_CAD,
        "silverPerGramCad":  _FALLBACK_SILVER_PER_GRAM_CAD,
        "timestamp": ts, "source": _FALLBACK_SOURCE,
        "isFallback": True, "isStale": False, "ageSeconds": 0,
    }


def _normalise_metals_api(raw: Dict) -> Dict:
    """Metals-API `/latest` → PHILEON units. Rates are XAU/XAG per 1 CAD."""
    base = (raw.get("base") or "").upper()
    rates = raw.get("rates") or {}
    xau, xag = rates.get("XAU"), rates.get("XAG")
    if base != "CAD" or not xau or not xag:
        raise ValueError("Metals-API response not in expected CAD/XAU/XAG shape.")
    gold_troyoz_cad   = 1.0 / float(xau)
    silver_troyoz_cad = 1.0 / float(xag)
    gold_per_gram_24k = gold_troyoz_cad   / TROY_OUNCE_GRAMS
    silver_per_gram   = silver_troyoz_cad / TROY_OUNCE_GRAMS
    return {
        "goldPerGram24kCad": round(gold_per_gram_24k, 6),
        "silverPerGramCad":  round(silver_per_gram, 6),
        "timestamp": int(raw.get("timestamp") or _now()),
        "source": "metals-api", "isFallback": False,
        "isStale": False, "ageSeconds": 0,
    }


def _fetch_from_metals_api(api_key: str) -> Dict:
    import urllib.request, json
    url = f"https://metals-api.com/api/latest?access_key={api_key}&base=CAD&symbols=XAU,XAG"
    req = urllib.request.Request(url, headers={"User-Agent": "PHILEON-Backend/1.0"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        raw = json.loads(resp.read().decode("utf-8"))
    if not raw.get("success", True):
        raise ValueError(f"metals-api rejected request: {raw.get('error') or 'unknown'}")
    return _normalise_metals_api(raw)


def _with_age(snapshot: Dict, age: int, is_stale: bool) -> Dict:
    """Return a copy of a trusted snapshot with current age/stale flags."""
    out = dict(snapshot)
    out["ageSeconds"] = int(age)
    out["isStale"] = bool(is_stale)
    return out


def get_spot(force_refresh: bool = False) -> Dict:
    """Return current spot payload following the fresh/stale/expired policy.

    Never raises to callers. Never overwrites a valid trusted cache with the
    development fallback when the provider fails while cache is <= 30 min.
    """
    cached: Optional[Dict] = _TRUSTED_CACHE["snapshot"]
    age = (_now() - cached["timestamp"]) if cached else None
    api_key = os.environ.get("METALS_API_KEY")

    # FRESH cache — return immediately unless caller forces a refresh
    if cached is not None and age is not None and age <= FRESH_MAX_AGE and not force_refresh:
        return _with_age(cached, age, is_stale=False)

    # Attempt provider only when a key is present
    if api_key:
        try:
            fresh = _fetch_from_metals_api(api_key)
            _TRUSTED_CACHE["snapshot"] = fresh
            return _with_age(fresh, 0, is_stale=False)
        except Exception:
            # Provider failed. Decide whether to reuse cache or fall back.
            pass

    # No provider (or provider failed). Reuse trusted cache while age <= 30 min.
    if cached is not None and age is not None and age <= STALE_MAX_AGE:
        return _with_age(cached, age, is_stale=(age > FRESH_MAX_AGE))

    # No usable cache — development fallback (never checkout-safe).
    return _fallback_payload()


def is_checkout_safe(snapshot: Dict) -> bool:
    """A snapshot is checkout-safe only when it is a real provider quote
    within the 30-minute usable window. Fallback is never safe."""
    if not snapshot: return False
    if snapshot.get("isFallback"): return False
    age = int(snapshot.get("ageSeconds", 0))
    return age <= STALE_MAX_AGE


def clear_cache() -> None:
    _TRUSTED_CACHE["snapshot"] = None
