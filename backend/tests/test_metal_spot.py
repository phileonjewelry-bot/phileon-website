"""Unit tests for the trusted metal spot service.
   Run: cd /app/backend && python -m pytest tests/test_metal_spot.py -v
"""
import os
from unittest.mock import patch
import pytest
from services import metal_spot as ms


def setup_function(_fn):
    ms.clear_cache()
    os.environ.pop("METALS_API_KEY", None)


# Canned normalised provider payload (60 CAD/g Au 24K, 1.10 CAD/g Ag).
def _fake_fresh_provider_payload(ts=None):
    import time as _t
    return {
        "goldPerGram24kCad": 60.0,
        "silverPerGramCad":  1.10,
        "timestamp": int(ts or _t.time()),
        "source": "metals-api", "isFallback": False,
        "isStale": False, "ageSeconds": 0,
    }


# 1
def test_no_api_key_returns_fallback():
    p = ms.get_spot()
    assert p["isFallback"] is True
    assert p["source"] == "phileon-fallback"
    assert p["goldPerGram24kCad"] == 150.0 and p["silverPerGramCad"] == 1.25

# 2
def test_fallback_has_isFallback_true_and_notStale():
    p = ms.get_spot()
    assert p["isFallback"] is True and p["isStale"] is False

# 3
def test_provider_success_returns_trusted_fresh():
    os.environ["METALS_API_KEY"] = "dummy"
    with patch.object(ms, "_fetch_from_metals_api", return_value=_fake_fresh_provider_payload()):
        p = ms.get_spot(force_refresh=True)
    assert p["source"] == "metals-api" and p["isFallback"] is False and p["isStale"] is False
    assert p["goldPerGram24kCad"] == 60.0

# 4
def test_fresh_cache_under_10min_no_network_call():
    os.environ["METALS_API_KEY"] = "dummy"
    with patch.object(ms, "_fetch_from_metals_api", return_value=_fake_fresh_provider_payload()) as m:
        ms.get_spot()          # populates cache
        ms.get_spot(); ms.get_spot()
    assert m.call_count == 1   # subsequent reads used cache

# 5
def test_cache_10_to_30_min_triggers_refresh_attempt():
    os.environ["METALS_API_KEY"] = "dummy"
    import time as _t
    old = _fake_fresh_provider_payload(ts=_t.time() - 900)  # 15 min old
    ms._TRUSTED_CACHE["snapshot"] = old
    call_count = {"n": 0}
    def _spy(_k):
        call_count["n"] += 1
        return _fake_fresh_provider_payload()
    with patch.object(ms, "_fetch_from_metals_api", side_effect=_spy):
        ms.get_spot()
    assert call_count["n"] == 1

# 6
def test_refresh_success_returns_new_trusted_value():
    os.environ["METALS_API_KEY"] = "dummy"
    import time as _t
    ms._TRUSTED_CACHE["snapshot"] = _fake_fresh_provider_payload(ts=_t.time() - 900)
    new = _fake_fresh_provider_payload(); new["goldPerGram24kCad"] = 62.5
    with patch.object(ms, "_fetch_from_metals_api", return_value=new):
        p = ms.get_spot()
    assert p["goldPerGram24kCad"] == 62.5 and p["isStale"] is False

# 7 + 8 + 9
def test_refresh_fail_at_15min_returns_trusted_stale():
    os.environ["METALS_API_KEY"] = "dummy"
    import time as _t
    ms._TRUSTED_CACHE["snapshot"] = _fake_fresh_provider_payload(ts=_t.time() - 900)  # 15 min
    with patch.object(ms, "_fetch_from_metals_api", side_effect=RuntimeError("boom")):
        p = ms.get_spot()
    assert p["source"] == "metals-api"
    assert p["isFallback"] is False
    assert p["isStale"] is True
    assert 850 < p["ageSeconds"] < 950

# 10
def test_cache_over_30min_provider_success_returns_fresh():
    os.environ["METALS_API_KEY"] = "dummy"
    import time as _t
    ms._TRUSTED_CACHE["snapshot"] = _fake_fresh_provider_payload(ts=_t.time() - 3600)  # 60 min
    with patch.object(ms, "_fetch_from_metals_api", return_value=_fake_fresh_provider_payload()):
        p = ms.get_spot()
    assert p["isFallback"] is False and p["isStale"] is False and p["ageSeconds"] == 0

# 11
def test_cache_over_30min_provider_fail_returns_fallback_not_expired_trusted():
    os.environ["METALS_API_KEY"] = "dummy"
    import time as _t
    ms._TRUSTED_CACHE["snapshot"] = _fake_fresh_provider_payload(ts=_t.time() - 3600)
    with patch.object(ms, "_fetch_from_metals_api", side_effect=RuntimeError("still down")):
        p = ms.get_spot()
    assert p["isFallback"] is True
    assert p["source"] == "phileon-fallback"
    # Expired trusted values must NOT be returned as a checkout-safe quote

# 12
def test_force_refresh_bypasses_fresh_cache():
    os.environ["METALS_API_KEY"] = "dummy"
    with patch.object(ms, "_fetch_from_metals_api", return_value=_fake_fresh_provider_payload()) as m:
        ms.get_spot()
        ms.get_spot(force_refresh=True)
        ms.get_spot(force_refresh=True)
    assert m.call_count == 3

# 13
def test_provider_failure_never_overwrites_valid_trusted_cache():
    os.environ["METALS_API_KEY"] = "dummy"
    import time as _t
    trusted = _fake_fresh_provider_payload(ts=_t.time() - 300)  # 5 min
    ms._TRUSTED_CACHE["snapshot"] = trusted
    with patch.object(ms, "_fetch_from_metals_api", side_effect=RuntimeError("dip")):
        ms.get_spot(force_refresh=True)
    # Cache still holds the previous trusted snapshot — NOT a fallback
    assert ms._TRUSTED_CACHE["snapshot"] is trusted

# 14
def test_is_checkout_safe_fresh_provider_true():
    p = _fake_fresh_provider_payload(); p["ageSeconds"] = 30
    assert ms.is_checkout_safe(p) is True

# 15
def test_is_checkout_safe_stale_under_30min_true():
    p = _fake_fresh_provider_payload(); p["ageSeconds"] = 1200; p["isStale"] = True
    assert ms.is_checkout_safe(p) is True

# 16
def test_is_checkout_safe_fallback_false():
    assert ms.is_checkout_safe(ms._fallback_payload()) is False

# 17
def test_is_checkout_safe_over_30min_provider_false():
    p = _fake_fresh_provider_payload(); p["ageSeconds"] = 1900
    assert ms.is_checkout_safe(p) is False

# 18
def test_api_key_never_appears_in_payload():
    os.environ["METALS_API_KEY"] = "super-secret-dont-leak"
    with patch.object(ms, "_fetch_from_metals_api", return_value=_fake_fresh_provider_payload()):
        p = ms.get_spot(force_refresh=True)
    assert "super-secret-dont-leak" not in str(p)

# ── Preserved normalisation math tests ────────────────────────────────────
def test_normalisation_math_troy_ounce_to_gram():
    raw = {"base": "CAD", "rates": {"XAU": 0.000488, "XAG": 0.0334}, "timestamp": 1734567890}
    p = ms._normalise_metals_api(raw)
    expected_gold_per_g = (1.0 / 0.000488) / 31.1034768
    expected_silver_per_g = (1.0 / 0.0334) / 31.1034768
    assert abs(p["goldPerGram24kCad"] - round(expected_gold_per_g, 6)) < 1e-6
    assert abs(p["silverPerGramCad"] - round(expected_silver_per_g, 6)) < 1e-6
    assert p["isFallback"] is False and p["source"] == "metals-api"

def test_normalisation_rejects_wrong_base():
    with pytest.raises(ValueError):
        ms._normalise_metals_api({"base": "USD", "rates": {"XAU": 0.0005, "XAG": 0.033}})

def test_normalisation_rejects_missing_metals():
    with pytest.raises(ValueError):
        ms._normalise_metals_api({"base": "CAD", "rates": {"XAU": 0.0005}})
