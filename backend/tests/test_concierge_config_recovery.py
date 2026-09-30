"""Configuration-Aware Shopping Recovery — deterministic tests.

Tests A–J from the primary spec plus K–Q from the recency/routing
corrections. No live OpenAI calls. No pricing formula changes. Uses
synthetic ledgers and direct helper invocations.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import pytest

from services.pricing_engine_catalog import (
    FIXED_PRODUCTS,
    PRICING_ENGINE_CATALOG,
)
from services.phileon_concierge import (
    EvidenceLedger,
    _TURN_CONSTRAINTS,
    _configured_price_resolve,
    _render_structured_answer,
    _required_configuration_for_slug,
    active_customer_constraints,
    tool_resolve_configured_price,
    tool_search_phileon_catalog,
)


# ─────────────────────────────────────────────────────────────────
# Small helpers
# ─────────────────────────────────────────────────────────────────

def _set_active(*, category: Optional[str] = None,
                include_vault: bool = False,
                active_budget: Optional[float] = None,
                stated_budgets: Optional[List[float]] = None) -> None:
    _TURN_CONSTRAINTS.clear()
    _TURN_CONSTRAINTS.update({
        "required_category":  category,
        "include_vault":      include_vault,
        "stated_budgets":     list(stated_budgets or []),
        "active_budget":      active_budget,
        "active_category":    category,
        "historical":         {"categories": [], "budgets": []},
    })


def _fresh_ledger(*, active_budget: Optional[float] = None,
                  active_category: Optional[str] = None,
                  stated_budgets: Optional[List[float]] = None,
                  candidate_slugs: Optional[List[str]] = None) -> EvidenceLedger:
    L = EvidenceLedger()
    L.active_budget = active_budget
    L.active_category = active_category
    L.required_category = active_category
    L.stated_budgets = list(stated_budgets or ([active_budget] if active_budget else []))
    for s in (candidate_slugs or []):
        L.candidate_slugs.add(s.lower())
    return L


# ─────────────────────────────────────────────────────────────────
# A) The original request → NEEDS_CONFIGURATION, not immediate NO_MATCH
# ─────────────────────────────────────────────────────────────────

def test_A_original_shopper_request_yields_needs_configuration():
    _set_active(category="ring", active_budget=4000.0,
                stated_budgets=[4000.0])
    try:
        out = tool_search_phileon_catalog({
            "category": "ring", "gender_or_recipient": "men",
            "material": None, "stone": None,
            "style_terms": ["statement", "black", "dark", "non-traditional"],
            "max_price": 4000, "min_price": None,
            "currency": "USD", "query_intent": "men's dark ring under $4k",
        })
    finally:
        _TURN_CONSTRAINTS.clear()
    # Strict budget results: zero (all rings are dynamic-priced → unresolved).
    assert out["result_count"] == 0
    # Secondary bucket: at least one ring candidate must survive.
    assert out["unresolved_candidate_count"] > 0
    # Every candidate is a ring, non-vault, with real required config.
    for c in out["unresolved_candidates"]:
        assert c["category"] == "ring"
        assert not c["slug"].startswith("iv-")
        assert c["price_usd"] is None
        assert c["price_status"] == "requires_configuration"
        assert c["required_configuration"]


# ─────────────────────────────────────────────────────────────────
# B) Candidate needs ring_size + tier, customer supplied neither → null
# ─────────────────────────────────────────────────────────────────

def test_B_candidate_needing_size_and_tier_returns_null_when_neither_supplied():
    r = _configured_price_resolve(
        slug="veyron-noir", ring_size=None, tier_key=None, wrist_size=None,
    )
    assert r.get("error") == "MISSING_CONFIGURATION"
    assert set(r.get("missing") or []) == {"ring_size", "tier_key"}


# ─────────────────────────────────────────────────────────────────
# C) Customer supplies size only, tier missing → no price resolution
# ─────────────────────────────────────────────────────────────────

def test_C_size_only_still_missing_tier():
    r = _configured_price_resolve(
        slug="veyron-noir", ring_size="9.5", tier_key=None, wrist_size=None,
    )
    assert r.get("error") == "MISSING_CONFIGURATION"
    assert "tier_key" in (r.get("missing") or [])
    assert "ring_size" not in (r.get("missing") or [])


# ─────────────────────────────────────────────────────────────────
# D) Valid size + valid tier → resolver executes with EXACTLY those values
# ─────────────────────────────────────────────────────────────────

def test_D_valid_configuration_resolves_authoritatively():
    # veyron-noir "silver" tier is hand-set USD $1,450 (unisex ring).
    r = _configured_price_resolve(
        slug="veyron-noir", ring_size="9.5", tier_key="silver", wrist_size=None,
    )
    assert "error" not in r, r
    assert r["price_usd"] == 1450.0
    assert r["currency"] == "USD"
    # Non-dynamic tier → static_catalog, not live pricing.
    assert r["price_source"] == "static_catalog"
    assert r["resolved_configuration"]["tier_key"] == "silver"
    assert r["resolved_configuration"]["ring_size"] == "US 9.5"


# ─────────────────────────────────────────────────────────────────
# E) Unsupported size/tier is rejected — no default/coerce
# ─────────────────────────────────────────────────────────────────

def test_E_unsupported_size_is_rejected():
    r = _configured_price_resolve(
        slug="veyron-noir", ring_size="99", tier_key="silver", wrist_size=None,
    )
    assert r.get("error") == "INVALID_CONFIGURATION"
    assert r.get("field") == "ring_size"


def test_E_unsupported_tier_is_rejected():
    r = _configured_price_resolve(
        slug="veyron-noir", ring_size="9.5", tier_key="platinum", wrist_size=None,
    )
    assert r.get("error") == "INVALID_CONFIGURATION"
    assert r.get("field") == "tier_key"


# ─────────────────────────────────────────────────────────────────
# F) Resolved authoritative price > active budget → cannot qualify
# ─────────────────────────────────────────────────────────────────

def test_F_recommendation_exceeding_active_budget_is_blocked():
    L = _fresh_ledger(active_budget=4000.0, active_category="ring")
    # Simulate a resolved veyron-noir @ $5,000 tier (gold14k, from LIVE_PRICING).
    L.record_configured_price(
        {"slug": "veyron-noir", "ring_size": "9.5", "tier_key": "gold14k",
         "wrist_size": None},
        {"slug": "veyron-noir", "name": "VEYRON NOIR", "category": "ring",
         "price_usd": 5000.0, "currency": "USD",
         "price_source": "static_catalog"},
    )
    ok, reason = L.verify_structured({
        "outcome": "MATCHES",
        "message": "This VEYRON NOIR at $5,000 is a great fit.",
        "budget_acknowledgement": {"amount": 4000.0, "currency": "USD"},
        "recommendations": [{
            "slug": "veyron-noir", "reason": "black cocktail signet",
            "price": {"amount": 5000.0, "currency": "USD"},
        }],
        "candidate_slugs": [], "missing_inputs": [],
        "follow_up_prompt_key": None,
        "no_match": False, "no_match_reason": None,
    })
    assert not ok
    assert reason.startswith("RECOMMENDATION_EXCEEDS_STATED_BUDGET"), reason


# ─────────────────────────────────────────────────────────────────
# G) Resolved authoritative price <= active budget → may qualify
# ─────────────────────────────────────────────────────────────────

def test_G_recommendation_within_active_budget_is_allowed():
    L = _fresh_ledger(active_budget=4000.0, active_category="ring")
    L.record_configured_price(
        {"slug": "veyron-noir", "ring_size": "9.5", "tier_key": "silver",
         "wrist_size": None},
        {"slug": "veyron-noir", "name": "VEYRON NOIR", "category": "ring",
         "price_usd": 1450.0, "currency": "USD",
         "price_source": "static_catalog"},
    )
    ok, reason = L.verify_structured({
        "outcome": "MATCHES",
        "message": "This piece fits under your $4,000 budget.",
        "budget_acknowledgement": {"amount": 4000.0, "currency": "USD"},
        "recommendations": [{
            "slug": "veyron-noir", "reason": "black cocktail signet",
            "price": {"amount": 1450.0, "currency": "USD"},
        }],
        "candidate_slugs": [], "missing_inputs": [],
        "follow_up_prompt_key": None,
        "no_match": False, "no_match_reason": None,
    })
    assert ok, reason


# ─────────────────────────────────────────────────────────────────
# H) No stylistically/category-relevant products at all → NO_MATCH
# ─────────────────────────────────────────────────────────────────

def test_H_genuinely_no_match():
    _set_active(category="ring", active_budget=100.0, stated_budgets=[100.0])
    try:
        out = tool_search_phileon_catalog({
            "category": "ring", "gender_or_recipient": None,
            "material": None, "stone": None,
            "style_terms": ["stegosaurus"],
            "max_price": 100, "min_price": None,
            "currency": "USD", "query_intent": "impossible query",
        })
    finally:
        _TURN_CONSTRAINTS.clear()
    # No results — style match too poor, and even the unresolved bucket
    # only carries items whose CATEGORY matched (score>=0 or cat_match).
    # Ring items with score 0 are dropped; ring items with score>0 land
    # in unresolved_candidates. This isn't a meaningful match either
    # way — the model would emit NO_MATCH.
    L = _fresh_ledger(active_budget=100.0, active_category="ring")
    L.record_search({"category": "ring", "style_terms": ["stegosaurus"]}, out)
    ok, reason = L.verify_structured({
        "outcome": "NO_MATCH",
        "message": "No PHILEON ring matches those terms under $100.",
        "budget_acknowledgement": {"amount": 100.0, "currency": "USD"},
        "recommendations": [], "candidate_slugs": [], "missing_inputs": [],
        "follow_up_prompt_key": None,
        "no_match": True, "no_match_reason": "No products match.",
    })
    assert ok, reason


# ─────────────────────────────────────────────────────────────────
# I) Customer-facing reply must never leak internal vocabulary
# ─────────────────────────────────────────────────────────────────

_BANNED_CUSTOMER_TERMS = (
    "tier_key", "resolver", "price_status", "custom-inquiry path",
    "pricing engine", "tool_names", "TOOL_DISPATCH",
    "search_phileon_catalog", "resolve_configured_price",
)


def test_I_needs_configuration_reply_leaks_no_internal_vocab():
    L = _fresh_ledger(active_budget=4000.0, active_category="ring",
                      candidate_slugs=["veyron-noir"])
    L.candidate_missing_inputs["veyron-noir"] = ["ring_size", "tier_key"]
    text = _render_structured_answer({
        "outcome": "NEEDS_CONFIGURATION",
        "message": "",
        "budget_acknowledgement": {"amount": 4000.0, "currency": "USD"},
        "recommendations": [],
        "candidate_slugs": ["veyron-noir"],
        "missing_inputs": ["ring_size", "tier_key"],
        "follow_up_prompt_key": "ring_size_plus_metal",
        "no_match": False, "no_match_reason": None,
    }, L)
    low = text.lower()
    for term in _BANNED_CUSTOMER_TERMS:
        assert term.lower() not in low, f"leaked: {term} in {text!r}"
    # Positive check: customer sees natural jewelry vocabulary.
    assert "ring size" in low
    assert "metal" in low
    assert "custom jewelry" in low


def test_I_no_match_reply_leaks_no_internal_vocab():
    L = _fresh_ledger(active_budget=4000.0, active_category="ring")
    text = _render_structured_answer({
        "outcome": "NO_MATCH",
        "message": "No PHILEON ring matches every constraint under $4,000.",
        "budget_acknowledgement": {"amount": 4000.0, "currency": "USD"},
        "recommendations": [], "candidate_slugs": [], "missing_inputs": [],
        "follow_up_prompt_key": None,
        "no_match": True, "no_match_reason": "Nothing qualifies.",
    }, L)
    low = text.lower()
    for term in _BANNED_CUSTOMER_TERMS:
        assert term.lower() not in low, f"leaked: {term}"


# ─────────────────────────────────────────────────────────────────
# J) No duplicated no-match sentence
# ─────────────────────────────────────────────────────────────────

def test_J_no_duplicated_no_match_copy():
    L = _fresh_ledger(active_budget=4000.0, active_category="ring")
    ans = {
        "outcome": "NO_MATCH",
        "message": "No PHILEON ring matches every constraint under $4,000.",
        "budget_acknowledgement": {"amount": 4000.0, "currency": "USD"},
        "recommendations": [], "candidate_slugs": [], "missing_inputs": [],
        "follow_up_prompt_key": None,
        "no_match": True,
        "no_match_reason": "No PHILEON ring matches every constraint under $4,000.",
    }
    text = _render_structured_answer(ans, L)
    # The identical sentence must appear at most once.
    count = text.lower().count("no phileon ring matches every constraint")
    assert count == 1, f"duplicated no-match copy ({count}) in {text!r}"


# ─────────────────────────────────────────────────────────────────
# K) Budget revision upward — $4,000 → $5,000 → $4,500 recommendation ok
# ─────────────────────────────────────────────────────────────────

def test_K_budget_revised_upward():
    c = active_customer_constraints(
        ["Keep it under $4,000."], "Actually I can go to $5,000.",
    )
    assert c["active_budget"] == 5000.0
    L = _fresh_ledger(active_budget=c["active_budget"],
                      active_category="ring",
                      stated_budgets=c["stated_budgets"])
    L._record_product({"slug": "veyron-noir", "name": "VEYRON NOIR",
                       "price_usd": 4500.0, "currency": "USD"})
    ok, reason = L.verify_structured({
        "outcome": "MATCHES",
        "message": "Under your $5,000 budget.",
        "budget_acknowledgement": {"amount": 5000.0, "currency": "USD"},
        "recommendations": [{"slug": "veyron-noir", "reason": "fits",
                              "price": {"amount": 4500.0, "currency": "USD"}}],
        "candidate_slugs": [], "missing_inputs": [],
        "follow_up_prompt_key": None,
        "no_match": False, "no_match_reason": None,
    })
    assert ok, reason


# ─────────────────────────────────────────────────────────────────
# L) Budget revision downward — $5,000 → $3,000 → $4,500 blocked
# ─────────────────────────────────────────────────────────────────

def test_L_budget_revised_downward_blocks_now_exceeding_price():
    c = active_customer_constraints(
        ["Show me rings up to $5,000."], "Actually I only have $3,000.",
    )
    assert c["active_budget"] == 3000.0
    L = _fresh_ledger(active_budget=c["active_budget"],
                      active_category="ring",
                      stated_budgets=c["stated_budgets"])
    L._record_product({"slug": "veyron-noir", "name": "VEYRON NOIR",
                       "price_usd": 4500.0, "currency": "USD"})
    ok, reason = L.verify_structured({
        "outcome": "MATCHES",
        "message": "At $4,500 this fits.",
        "budget_acknowledgement": {"amount": 3000.0, "currency": "USD"},
        "recommendations": [{"slug": "veyron-noir", "reason": "?",
                              "price": {"amount": 4500.0, "currency": "USD"}}],
        "candidate_slugs": [], "missing_inputs": [],
        "follow_up_prompt_key": None,
        "no_match": False, "no_match_reason": None,
    })
    assert not ok
    assert reason.startswith("RECOMMENDATION_EXCEEDS_STATED_BUDGET"), reason


# ─────────────────────────────────────────────────────────────────
# M) Category correction across turns
# ─────────────────────────────────────────────────────────────────

def test_M_category_correction_across_turns():
    c = active_customer_constraints(
        ["Show me rings."], "Actually make it a pendant.",
    )
    assert c["active_category"] == "pendant"
    c = active_customer_constraints(
        ["Show me rings.", "Actually make it a pendant."],
        "Go back to rings.",
    )
    assert c["active_category"] == "ring"


# ─────────────────────────────────────────────────────────────────
# N) Ring-size correction across turns — server never retains stale
# ─────────────────────────────────────────────────────────────────

def test_N_ring_size_correction_uses_latest_value():
    # Server-side validation never remembers prior tool calls between
    # turns; each `resolve_configured_price` invocation is validated
    # against the arguments given to it. The "correction" is entirely
    # driven by the tool arguments passed in the latest call.
    r_old = _configured_price_resolve(
        slug="veyron-noir", ring_size="9.5", tier_key="silver", wrist_size=None,
    )
    r_new = _configured_price_resolve(
        slug="veyron-noir", ring_size="10", tier_key="silver", wrist_size=None,
    )
    assert r_old["resolved_configuration"]["ring_size"] == "US 9.5"
    assert r_new["resolved_configuration"]["ring_size"] == "US 10"
    # Same tier, same product → same price (silver tier is size-invariant
    # for veyron-noir hand-set USD).
    assert r_old["price_usd"] == r_new["price_usd"]


# ─────────────────────────────────────────────────────────────────
# O) FIXED_PRODUCT configurable variant resolves from FIXED_PRODUCTS,
#    not PEC
# ─────────────────────────────────────────────────────────────────

def test_O_fixed_product_variant_uses_configured_static_variant_source():
    # BAPE has 3 variants (10k/14k/18k yellow) in FIXED_PRODUCTS and
    # requires ring size. It is NOT in PRICING_ENGINE_CATALOG.
    assert "bape" in FIXED_PRODUCTS
    assert "bape" not in PRICING_ENGINE_CATALOG
    r = _configured_price_resolve(
        slug="bape", ring_size="10", tier_key="10k-yellow", wrist_size=None,
    )
    assert "error" not in r, r
    assert r["price_source"] == "configured_static_variant"
    assert r["price_usd"] == 9500.0  # canonical FIXED_PRODUCTS value


# ─────────────────────────────────────────────────────────────────
# P) PEC product resolves through PEC only after all required inputs
# ─────────────────────────────────────────────────────────────────

def test_P_pec_product_needs_all_required_inputs_before_pec_call():
    # BAMBURGH: PEC-priced ring (dynamic gold). Needs tier + ring_size.
    assert "bamburgh" in PRICING_ENGINE_CATALOG
    # Missing tier → no resolver call.
    r0 = _configured_price_resolve(
        slug="bamburgh", ring_size="9", tier_key=None, wrist_size=None,
    )
    assert r0.get("error") == "MISSING_CONFIGURATION"
    # Missing size → no resolver call.
    r1 = _configured_price_resolve(
        slug="bamburgh", ring_size=None, tier_key="signature", wrist_size=None,
    )
    assert r1.get("error") == "MISSING_CONFIGURATION"
    # Both present → PEC executes and returns authoritative price.
    r2 = _configured_price_resolve(
        slug="bamburgh", ring_size="9", tier_key="signature", wrist_size=None,
    )
    assert "error" not in r2, r2
    assert r2["price_source"] in ("live_phileon_pricing", "static_catalog")
    assert r2["price_usd"] > 0
    assert r2["resolved_configuration"]["ring_size"] == "US 9"


# ─────────────────────────────────────────────────────────────────
# Q) Product-specific required inputs — never ask for a field the
#    product does not need
# ─────────────────────────────────────────────────────────────────

def test_Q_boss_knot_only_needs_tier_not_ring_size():
    # BOSS KNOT is a PEC pendant (not a ring) — no size needed.
    rec = PRICING_ENGINE_CATALOG["boss-knot"]
    fields = _required_configuration_for_slug("boss-knot", rec)
    field_names = {f["field"] for f in fields}
    assert field_names == {"tier_key"}
    # And a ring product needing size correctly requires both.
    rec_r = PRICING_ENGINE_CATALOG["bamburgh"]
    fields_r = _required_configuration_for_slug("bamburgh", rec_r)
    assert {f["field"] for f in fields_r} == {"tier_key", "ring_size"}
    # Single-tier-default FIXED_PRODUCTS (Inspiration Vault IV items)
    # need NO configuration at all.
    rec_iv = FIXED_PRODUCTS["iv-altar"]
    fields_iv = _required_configuration_for_slug("iv-altar", rec_iv)
    assert fields_iv == []


# ─────────────────────────────────────────────────────────────────
# Cross-cutting: secondary candidate search survives vault filter
# ─────────────────────────────────────────────────────────────────

def test_secondary_search_does_not_bypass_vault_filter():
    _set_active(category="ring", active_budget=4000.0,
                stated_budgets=[4000.0], include_vault=False)
    try:
        out = tool_search_phileon_catalog({
            "category": "ring", "gender_or_recipient": None,
            "material": None, "stone": None,
            "style_terms": ["signet"],
            "max_price": 4000, "min_price": None,
            "currency": "USD", "query_intent": "ring",
        })
    finally:
        _TURN_CONSTRAINTS.clear()
    for c in out["unresolved_candidates"]:
        assert not c["slug"].startswith("iv-"), c
        assert c["category"] == "ring", c


# ─────────────────────────────────────────────────────────────────
# Cross-cutting: tool_resolve_configured_price applies server filters
# ─────────────────────────────────────────────────────────────────

def test_tool_wrapper_blocks_category_mismatch():
    # Customer wants a pendant; the model tries to price a ring.
    _set_active(category="pendant", active_budget=None, stated_budgets=[])
    try:
        r = tool_resolve_configured_price({
            "slug": "veyron-noir", "ring_size": "9.5",
            "tier_key": "silver", "wrist_size": None,
        })
    finally:
        _TURN_CONSTRAINTS.clear()
    assert r.get("error") == "CATEGORY_MISMATCH"


def test_tool_wrapper_blocks_vault_when_not_opted_in():
    # IV single-tier items don't need config; the wrapper must still
    # refuse to authoritatively surface them when include_vault=False.
    _set_active(category=None, active_budget=None, stated_budgets=[],
                include_vault=False)
    try:
        r = tool_resolve_configured_price({
            "slug": "iv-altar", "ring_size": None,
            "tier_key": None, "wrist_size": None,
        })
    finally:
        _TURN_CONSTRAINTS.clear()
    assert r.get("error") == "VAULT_EXCLUDED"


# ─────────────────────────────────────────────────────────────────
# Cross-cutting: NEEDS_CONFIGURATION rejects fabricated candidate
# ─────────────────────────────────────────────────────────────────

def test_needs_configuration_slug_must_be_in_ledger():
    L = _fresh_ledger(active_budget=4000.0, active_category="ring",
                      candidate_slugs=["veyron-noir"])
    ok, reason = L.verify_structured({
        "outcome": "NEEDS_CONFIGURATION",
        "message": "",
        "budget_acknowledgement": {"amount": None, "currency": None},
        "recommendations": [],
        "candidate_slugs": ["not-a-real-slug"],
        "missing_inputs": ["ring_size", "tier_key"],
        "follow_up_prompt_key": "ring_size_plus_metal",
        "no_match": False, "no_match_reason": None,
    })
    assert not ok and reason.startswith("CANDIDATE_SLUG_NOT_IN_LEDGER")


def test_needs_configuration_cannot_have_recommendations():
    L = _fresh_ledger(active_budget=4000.0, active_category="ring",
                      candidate_slugs=["veyron-noir"])
    L._record_product({"slug": "veyron-noir", "name": "VEYRON NOIR",
                       "price_usd": 1450.0, "currency": "USD"})
    ok, reason = L.verify_structured({
        "outcome": "NEEDS_CONFIGURATION",
        "message": "",
        "budget_acknowledgement": {"amount": None, "currency": None},
        "recommendations": [{
            "slug": "veyron-noir", "reason": "?",
            "price": {"amount": 1450.0, "currency": "USD"},
        }],
        "candidate_slugs": ["veyron-noir"],
        "missing_inputs": ["ring_size", "tier_key"],
        "follow_up_prompt_key": "ring_size_plus_metal",
        "no_match": False, "no_match_reason": None,
    })
    assert not ok
    assert reason == "NEEDS_CONFIG_HAS_RECOMMENDATIONS"
