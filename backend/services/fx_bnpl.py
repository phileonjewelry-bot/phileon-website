"""PHILEON — Trusted server-side BNPL FX service (USD → CAD only).

Isolated from `services.fx_display`. This module is the ONLY code path
authorised to influence trusted payment math for Canadian BNPL Checkout
Sessions. Everything here is fail-closed:

  * Never trusts a client-supplied rate or amount.
  * Never falls back to a display rate, a metal-spot ratio, a hard-coded
    constant (`0.75` etc.), or a browser value.
  * Rejects malformed, zero, negative, absurd, or unreasonably-stale rates.
  * Uses `Decimal` for the conversion and integer minor units for the
    persisted amount.
  * Records provider, retrieved_at, and reference/effective date on the
    resulting snapshot so `OrderV2.presentment` can audit exactly which
    rate priced the transaction.
  * If a fresh + validated rate cannot be obtained, callers MUST suppress
    the CAD BNPL lane and continue with the standard USD Checkout Session.
"""
from __future__ import annotations

import logging
import time
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, Dict, Any

import httpx

logger = logging.getLogger(__name__)

# Only USD→CAD is authorised at this stage. Adding another quote currency
# requires a separate audit + explicit owner sign-off.
BASE_CURRENCY = "USD"
QUOTE_CURRENCY = "CAD"

# Independent Frankfurter fetch — do NOT share cache with fx_display.
FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest"
HTTP_TIMEOUT_SECONDS = 6.0

# Fresh window: 6h. Stale-but-usable ceiling: 72h to accommodate FX-market
# weekends and public holidays (Frankfurter publishes ECB business-day
# rates only). Beyond 72h we hard-fail-close — no CAD session created.
FRESH_TTL_SECONDS = 6 * 60 * 60
STALE_LIMIT_SECONDS = 72 * 60 * 60

# Sanity band for USD→CAD. Outside this band we assume the provider is
# corrupted and reject the rate rather than price a transaction wrong.
MIN_RATE = Decimal("1.05")
MAX_RATE = Decimal("2.00")


class FxUnavailable(Exception):
    """Raised when no trusted rate is available. Caller must fail-close
    the BNPL lane."""


_CACHE: Dict[str, Any] = {
    "rate": None,             # Decimal
    "retrieved_at": None,     # epoch seconds
    "reference_date": None,   # ISO date string from Frankfurter payload
    "provider": None,         # "frankfurter"
}


def _now() -> float:
    return time.time()


def _fetch_frankfurter() -> Dict[str, Any]:
    """Live Frankfurter fetch, USD-base, CAD only. Raises on any anomaly."""
    r = httpx.get(FRANKFURTER_URL,
                  params={"base": BASE_CURRENCY, "symbols": QUOTE_CURRENCY},
                  timeout=HTTP_TIMEOUT_SECONDS)
    r.raise_for_status()
    payload = r.json()
    rates = payload.get("rates") or {}
    raw = rates.get(QUOTE_CURRENCY)
    if raw is None:
        raise ValueError("frankfurter missing CAD rate")
    try:
        rate = Decimal(str(raw))
    except Exception:
        raise ValueError(f"frankfurter returned non-numeric rate: {raw!r}")
    if not (MIN_RATE <= rate <= MAX_RATE):
        raise ValueError(f"frankfurter rate outside sane band: {rate}")
    ref_date = payload.get("date")
    return {
        "rate": rate,
        "reference_date": ref_date,
        "provider": "frankfurter",
    }


def _age_seconds() -> Optional[float]:
    ts = _CACHE.get("retrieved_at")
    return (_now() - float(ts)) if ts else None


def get_trusted_snapshot() -> Optional[Dict[str, Any]]:
    """Return a validated USD→CAD snapshot or `None` when no fresh AND
    no stale-within-72h rate is available. Never raises — this is the
    fail-closed entry point.

    Returned shape:
        {
          "base": "USD",
          "quote": "CAD",
          "rate": Decimal("1.3712"),
          "rate_float": 1.3712,
          "retrieved_at": <epoch seconds>,
          "reference_date": "2026-09-02",
          "provider": "frankfurter",
          "is_stale": bool,
          "age_seconds": int,
        }
    """
    age = _age_seconds()

    # 1) Fresh cache within 6h — no network touch.
    if _CACHE.get("rate") is not None and age is not None and age <= FRESH_TTL_SECONDS:
        return _snapshot_from_cache(is_stale=False, age=age)

    # 2) Attempt live fetch.
    try:
        fresh = _fetch_frankfurter()
        _CACHE["rate"] = fresh["rate"]
        _CACHE["retrieved_at"] = _now()
        _CACHE["reference_date"] = fresh["reference_date"]
        _CACHE["provider"] = fresh["provider"]
        return _snapshot_from_cache(is_stale=False, age=0.0)
    except Exception as e:
        logger.warning("fx_bnpl live fetch failed: %s", type(e).__name__)

    # 3) Live fetch failed. Serve stale if within 72h (weekend/holiday grace).
    if _CACHE.get("rate") is not None and age is not None and age <= STALE_LIMIT_SECONDS:
        logger.warning(
            "fx_bnpl serving STALE snapshot age=%.0fs reference_date=%s",
            age, _CACHE.get("reference_date"),
        )
        return _snapshot_from_cache(is_stale=True, age=age)

    # 4) No fresh, no acceptable stale → fail-closed.
    return None


def _snapshot_from_cache(is_stale: bool, age: float) -> Dict[str, Any]:
    rate: Decimal = _CACHE["rate"]  # type: ignore[assignment]
    return {
        "base": BASE_CURRENCY,
        "quote": QUOTE_CURRENCY,
        "rate": rate,
        "rate_float": float(rate),
        "retrieved_at": float(_CACHE["retrieved_at"]),  # type: ignore[arg-type]
        "reference_date": _CACHE.get("reference_date"),
        "provider": _CACHE.get("provider") or "frankfurter",
        "is_stale": bool(is_stale),
        "age_seconds": int(age),
    }


def convert_usd_cents_to_cad_cents(usd_cents: int,
                                   snapshot: Optional[Dict[str, Any]] = None
                                   ) -> Optional[int]:
    """Integer-safe conversion of USD minor units → CAD minor units using
    the trusted snapshot. Returns `None` when no snapshot is available.

    Rounding: banker-safe `ROUND_HALF_UP` on the CAD minor unit. Never
    consumes a float mid-calculation — inputs are converted to `Decimal`
    first.
    """
    if not isinstance(usd_cents, int) or usd_cents < 0:
        raise ValueError("usd_cents must be a non-negative int")
    snap = snapshot or get_trusted_snapshot()
    if snap is None:
        return None
    rate: Decimal = snap["rate"]
    if not (MIN_RATE <= rate <= MAX_RATE):
        return None
    cad = (Decimal(usd_cents) * rate).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    return int(cad)


def build_bnpl_quote(usd_subtotal_cents: int, usd_shipping_cents: int,
                     usd_tax_cents: int = 0) -> Optional[Dict[str, Any]]:
    """Build a full CAD BNPL quote from canonical USD minor-unit inputs.
    Returns `None` when no trusted snapshot is available (caller MUST
    fail-close the CAD BNPL lane and stay on USD).

    Returned shape:
        {
          "canonical_currency": "USD",
          "canonical_subtotal_cents": int,
          "canonical_shipping_cents": int,
          "canonical_tax_cents": int,
          "canonical_total_cents": int,
          "presentment_currency": "CAD",
          "presentment_subtotal_cents": int,
          "presentment_shipping_cents": int,
          "presentment_tax_cents": int,          # 0 for now (tax=OFF)
          "presentment_total_cents": int,
          "fx_rate": float,                      # for JSON transport
          "fx_rate_decimal": str,                # exact decimal string
          "fx_source": "frankfurter",
          "fx_retrieved_at": <epoch>,
          "fx_reference_date": str | None,
          "fx_is_stale": bool,
        }
    """
    snap = get_trusted_snapshot()
    if snap is None:
        return None
    sub = convert_usd_cents_to_cad_cents(int(usd_subtotal_cents), snap)
    ship = convert_usd_cents_to_cad_cents(int(usd_shipping_cents), snap)
    tax = convert_usd_cents_to_cad_cents(int(usd_tax_cents), snap)
    if sub is None or ship is None or tax is None:
        return None
    total_canonical = int(usd_subtotal_cents) + int(usd_shipping_cents) + int(usd_tax_cents)
    total_presentment = sub + ship + tax
    rate: Decimal = snap["rate"]
    return {
        "canonical_currency": BASE_CURRENCY,
        "canonical_subtotal_cents": int(usd_subtotal_cents),
        "canonical_shipping_cents": int(usd_shipping_cents),
        "canonical_tax_cents": int(usd_tax_cents),
        "canonical_total_cents": total_canonical,
        "presentment_currency": QUOTE_CURRENCY,
        "presentment_subtotal_cents": sub,
        "presentment_shipping_cents": ship,
        "presentment_tax_cents": tax,
        "presentment_total_cents": total_presentment,
        "fx_rate": float(rate),
        "fx_rate_decimal": format(rate, "f"),
        "fx_source": snap["provider"],
        "fx_retrieved_at": snap["retrieved_at"],
        "fx_reference_date": snap.get("reference_date"),
        "fx_is_stale": bool(snap["is_stale"]),
    }
