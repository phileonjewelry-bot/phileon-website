"""Tests for the Display FX service (services.fx_display).
The FX service is DISPLAY-ONLY. It is never consumed by the trusted
payment path. These tests exercise the 6h TTL + 48h stale fallback +
> 48h canonical-USD fallback behaviour.
"""
import time
import pytest
from unittest.mock import patch

from services import fx_display


@pytest.fixture(autouse=True)
def _reset_cache():
    fx_display._CACHE["rates"] = None
    fx_display._CACHE["fetched_at"] = None
    fx_display._CACHE["source"] = None
    yield
    fx_display._CACHE["rates"] = None
    fx_display._CACHE["fetched_at"] = None
    fx_display._CACHE["source"] = None


def _fake_rates():
    return {"USD": 1.0, "CAD": 1.36, "GBP": 0.79, "EUR": 0.92, "AUD": 1.52, "JPY": 150.0}


def test_snapshot_populates_all_supported_currencies():
    with patch.object(fx_display, "_fetch_frankfurter", return_value=_fake_rates()):
        snap = fx_display.get_snapshot()
    assert snap["base"] == "USD"
    assert set(fx_display.SUPPORTED_DISPLAY_CURRENCIES).issubset(snap["rates"].keys())
    assert snap["rates"]["USD"] == 1.0
    assert snap["is_stale"] is False
    assert snap["source"] == "frankfurter"


def test_snapshot_uses_fresh_cache_within_ttl():
    with patch.object(fx_display, "_fetch_frankfurter", return_value=_fake_rates()) as fetch:
        fx_display.get_snapshot()
        fx_display.get_snapshot()
        assert fetch.call_count == 1


def test_snapshot_serves_stale_when_within_48h():
    fx_display._CACHE["rates"] = _fake_rates()
    fx_display._CACHE["fetched_at"] = time.time() - (24 * 60 * 60)  # 24h ago
    fx_display._CACHE["source"] = "frankfurter"
    with patch.object(fx_display, "_fetch_frankfurter", side_effect=RuntimeError("upstream")):
        snap = fx_display.get_snapshot()
    assert snap is not None
    assert snap["is_stale"] is True
    assert snap["source"] == "stale"


def test_snapshot_returns_none_when_beyond_48h():
    fx_display._CACHE["rates"] = _fake_rates()
    fx_display._CACHE["fetched_at"] = time.time() - (72 * 60 * 60)  # 72h ago
    fx_display._CACHE["source"] = "frankfurter"
    with patch.object(fx_display, "_fetch_frankfurter", side_effect=RuntimeError("upstream")):
        snap = fx_display.get_snapshot()
    assert snap is None  # caller falls back to canonical USD


def test_convert_usd_cents_usd_identity():
    with patch.object(fx_display, "_fetch_frankfurter", return_value=_fake_rates()):
        assert fx_display.convert_usd_cents(50000, "USD") == 50000


def test_convert_usd_cents_cad():
    with patch.object(fx_display, "_fetch_frankfurter", return_value=_fake_rates()):
        # 50000 USD cents ($500) * 1.36 = 68000 CAD cents ($680)
        assert fx_display.convert_usd_cents(50000, "CAD") == 68000


def test_convert_usd_cents_jpy_no_minor_units():
    with patch.object(fx_display, "_fetch_frankfurter", return_value=_fake_rates()):
        # 50000 USD cents ($500) * 150 rate = ¥75,000 → stored as 7,500,000 "cents"
        assert fx_display.convert_usd_cents(50000, "JPY") == 7500000


def test_convert_usd_cents_unsupported_returns_none():
    with patch.object(fx_display, "_fetch_frankfurter", return_value=_fake_rates()):
        assert fx_display.convert_usd_cents(50000, "INR") is None


def test_convert_usd_cents_no_snapshot_returns_none():
    with patch.object(fx_display, "_fetch_frankfurter", side_effect=RuntimeError("no net")):
        assert fx_display.convert_usd_cents(50000, "CAD") is None
