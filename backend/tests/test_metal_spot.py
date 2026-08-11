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


def test_fallback_when_no_api_key():
    p = ms.get_spot()
    assert p["isFallback"] is True
    assert p["source"] == "phileon-fallback"
    assert p["goldPerGram24kCad"] == 150.0
    assert p["silverPerGramCad"] == 1.25
    assert p["timestamp"] > 0


def test_normalisation_math_troy_ounce_to_gram():
    """Metals-API gives rates.XAU = XAU per 1 CAD. Verify unit maths.

    If 1 CAD  = 0.000488 XAU  →  1 XAU (troy oz) = ~2049.18 CAD
    → per gram = 2049.18 / 31.1034768 = ~65.89 CAD/g at 24K purity
    """
    raw = {"base": "CAD", "rates": {"XAU": 0.000488, "XAG": 0.0334},
           "timestamp": 1734567890}
    p = ms._normalise_metals_api(raw)
    expected_gold_troyoz = 1.0 / 0.000488  # ≈ 2049.180
    expected_gold_per_g  = expected_gold_troyoz / 31.1034768  # ≈ 65.884
    assert abs(p["goldPerGram24kCad"] - round(expected_gold_per_g, 6)) < 1e-6
    expected_silver_troyoz = 1.0 / 0.0334  # ≈ 29.940
    expected_silver_per_g  = expected_silver_troyoz / 31.1034768  # ≈ 0.9626
    assert abs(p["silverPerGramCad"] - round(expected_silver_per_g, 6)) < 1e-6
    assert p["isFallback"] is False
    assert p["source"] == "metals-api"
    assert p["timestamp"] == 1734567890


def test_normalisation_rejects_wrong_base():
    with pytest.raises(ValueError):
        ms._normalise_metals_api({"base": "USD", "rates": {"XAU": 0.0005, "XAG": 0.033}})


def test_normalisation_rejects_missing_metals():
    with pytest.raises(ValueError):
        ms._normalise_metals_api({"base": "CAD", "rates": {"XAU": 0.0005}})


def test_provider_failure_falls_back_gracefully():
    os.environ["METALS_API_KEY"] = "dummy-key-for-test"
    ms.clear_cache()
    with patch.object(ms, "_fetch_from_metals_api",
                      side_effect=RuntimeError("provider down")):
        p = ms.get_spot(force_refresh=True)
    assert p["isFallback"] is True
    assert p["source"] == "phileon-fallback"


def test_cache_hits_second_call_when_key_missing():
    first = ms.get_spot()
    second = ms.get_spot()
    assert first is second  # exact cached object


def test_force_refresh_bypasses_cache():
    a = ms.get_spot()
    b = ms.get_spot(force_refresh=True)
    assert a is not b  # new payload created on refresh


def test_api_key_never_appears_in_returned_payload():
    os.environ["METALS_API_KEY"] = "super-secret-dont-leak"
    ms.clear_cache()
    with patch.object(ms, "_fetch_from_metals_api",
                      return_value=ms._fallback_payload()):
        p = ms.get_spot(force_refresh=True)
    assert "super-secret-dont-leak" not in str(p)
    assert "api_key" not in p and "access_key" not in p
