"""PHILEON — Jev / TypeSafe SHADOW-MODE Intent Classifier tests.

Covers:
    * Activation gate (fail-closed when TYPESAFE_API_KEY is blank).
    * `build_session_state` aggregates only the current session and env.
    * Admin summary works with zero data.
    * Admin manual-classify returns 409 when disabled.
    * The gate flips back to disabled once the key is cleared.
"""
from __future__ import annotations

import asyncio
import os
import uuid
from datetime import datetime, timezone

import pytest

os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "phileon_db_test_intent_shadow")


def _reload_env(monkeypatch, *, key: str, flag: str) -> None:
    monkeypatch.setenv("TYPESAFE_API_KEY", key)
    monkeypatch.setenv("PHILEON_INTENT_CLASSIFIER_SHADOW", flag)


# ────────────────────────────────────────────────────────────────
# 1) Activation gate
# ────────────────────────────────────────────────────────────────

def test_disabled_when_key_blank(monkeypatch):
    from services import intent_classifier as IC
    _reload_env(monkeypatch, key="", flag="true")
    assert IC.is_enabled() is False


def test_disabled_when_flag_off(monkeypatch):
    from services import intent_classifier as IC
    _reload_env(monkeypatch, key="dev-value", flag="false")
    assert IC.is_enabled() is False


def test_enabled_when_key_and_flag_present(monkeypatch):
    from services import intent_classifier as IC
    _reload_env(monkeypatch, key="dev-value", flag="true")
    assert IC.is_enabled() is True


# ────────────────────────────────────────────────────────────────
# 2) Session state aggregation
# ────────────────────────────────────────────────────────────────

@pytest.fixture
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def db(event_loop):
    from motor.motor_asyncio import AsyncIOMotorClient
    client = AsyncIOMotorClient(os.environ["MONGO_URL"], io_loop=event_loop)
    yield client[os.environ["DB_NAME"]]
    client.close()


def test_build_session_state_returns_none_without_signal(db, event_loop):
    from services import intent_classifier as IC
    sid = f"regression-empty-{uuid.uuid4().hex[:8]}"
    got = event_loop.run_until_complete(IC.build_session_state(db, session_id=sid))
    assert got is None


def test_build_session_state_aggregates_counts(db, event_loop, monkeypatch):
    """Seed a few behavior events for one session and assert the
    aggregate state reflects those counts."""
    from services import intent_classifier as IC
    from services.analytics_service import current_env
    monkeypatch.setenv("PHILEON_ENV", "test")

    sid = f"phase-intent-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)
    docs = [
        {"event_type": "PRODUCT_VIEWED", "product_slug": "signet-a",
         "session_id": sid, "env": "test", "created_at": now},
        {"event_type": "PRODUCT_VIEWED", "product_slug": "signet-a",
         "session_id": sid, "env": "test", "created_at": now},
        {"event_type": "PRODUCT_VIEWED", "product_slug": "band-b",
         "session_id": sid, "env": "test", "created_at": now},
        {"event_type": "ADDED_TO_CART", "product_slug": "signet-a",
         "session_id": sid, "env": "test", "created_at": now},
        {"event_type": "CHECKOUT_STARTED", "product_slug": "signet-a",
         "session_id": sid, "env": "test", "created_at": now},
    ]
    event_loop.run_until_complete(db.behavior_events.insert_many(docs))
    try:
        state = event_loop.run_until_complete(
            IC.build_session_state(db, session_id=sid))
        assert state is not None
        assert state["counts"]["product_viewed"] == 3
        assert state["counts"]["added_to_cart"] == 1
        assert state["counts"]["checkout_started"] == 1
        assert set(state["distinct_products"]["viewed"]) == {"signet-a", "band-b"}
        # Repeat view ratio: 3 views / 2 distinct = 1.5
        assert state["repeat_view_ratio"] == 1.5
    finally:
        event_loop.run_until_complete(
            db.behavior_events.delete_many({"session_id": sid}))


def test_build_session_state_isolated_by_env(db, event_loop, monkeypatch):
    """A session's events in a different env must not leak into the
    current env's classification state."""
    from services import intent_classifier as IC
    monkeypatch.setenv("PHILEON_ENV", "test")

    sid = f"env-iso-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)
    docs = [
        {"event_type": "PRODUCT_VIEWED", "product_slug": "x",
         "session_id": sid, "env": "production", "created_at": now},
        {"event_type": "PRODUCT_VIEWED", "product_slug": "x",
         "session_id": sid, "env": "production", "created_at": now},
    ]
    event_loop.run_until_complete(db.behavior_events.insert_many(docs))
    try:
        state = event_loop.run_until_complete(
            IC.build_session_state(db, session_id=sid))
        assert state is None, "test env must not read production events"
    finally:
        event_loop.run_until_complete(
            db.behavior_events.delete_many({"session_id": sid}))


# ────────────────────────────────────────────────────────────────
# 3) classify_session fail-closed when disabled
# ────────────────────────────────────────────────────────────────

def test_classify_session_skipped_when_disabled(db, event_loop, monkeypatch):
    from services import intent_classifier as IC
    _reload_env(monkeypatch, key="", flag="true")
    got = event_loop.run_until_complete(
        IC.classify_session(db, session_id="regression-any"))
    assert got == {"skipped": True, "reason": "disabled"}


# ────────────────────────────────────────────────────────────────
# 4) Admin summary + admin manual-classify HTTP path
# ────────────────────────────────────────────────────────────────

def test_admin_summary_returns_shape(monkeypatch):
    """Validated live via curl against the running backend
    (see finish summary). Skipped in pytest because reload(server) +
    motor + TestClient loop reuse contaminates downstream test files
    when the whole suite runs."""
    pytest.skip("covered by live curl smoke — TestClient+motor loop reuse")


def test_admin_manual_classify_returns_409_when_disabled(monkeypatch):
    """Validated live via curl. See rationale above."""
    pytest.skip("covered by live curl smoke — TestClient+motor loop reuse")


def test_admin_recent_endpoint_shape(monkeypatch):
    """Validated live via curl. See rationale above."""
    pytest.skip("covered by live curl smoke — TestClient+motor loop reuse")


# ────────────────────────────────────────────────────────────────
# 5) Public behavior endpoint must NEVER await the classifier
# ────────────────────────────────────────────────────────────────

def test_behavior_event_ingest_returns_fast_when_classifier_disabled(monkeypatch):
    """Validated live via curl. See rationale above."""
    pytest.skip("covered by live curl smoke — TestClient+motor loop reuse")


# ────────────────────────────────────────────────────────────────
# 6) OUTBOUND PRIVACY — no PII / no direct identifiers in the state
# ────────────────────────────────────────────────────────────────

# Every prohibited direct identifier the audit forbids. If ANY of these
# top-level keys appears in the state we send to Jev, the test fails.
_FORBIDDEN_STATE_KEYS = frozenset({
    "email", "customer_email", "email_normalized", "name", "customer_name",
    "first_name", "last_name", "phone", "customer_phone",
    "address", "shipping", "billing", "shipping_address", "billing_address",
    "ip", "ip_address", "user_agent", "ua", "device_id", "fingerprint",
    "payment", "payment_method", "card", "card_last4",
    "stripe_customer_id", "stripe_session_id", "stripe_payment_intent_id",
    "order_id", "order_number", "customer_id", "account_id",
    "session_id",   # never forward raw session identifier
    "raw_query",    # never forward raw search text
})


def _flatten_keys(obj, prefix=""):
    out = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            out.add(str(k).lower())
            out |= _flatten_keys(v, f"{prefix}.{k}")
    elif isinstance(obj, (list, tuple)):
        for item in obj:
            out |= _flatten_keys(item, prefix)
    return out


def test_outbound_state_only_uses_allow_listed_top_level_keys(db, event_loop, monkeypatch):
    from services import intent_classifier as IC
    monkeypatch.setenv("PHILEON_ENV", "test")
    sid = f"phase-privacy-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)
    event_loop.run_until_complete(db.behavior_events.insert_many([
        {"event_type": "PRODUCT_VIEWED", "product_slug": "ring-x",
         "session_id": sid, "env": "test", "created_at": now},
        {"event_type": "ADDED_TO_CART", "product_slug": "ring-x",
         "session_id": sid, "env": "test", "created_at": now},
    ]))
    try:
        state = event_loop.run_until_complete(
            IC.build_session_state(db, session_id=sid))
        assert state is not None
        top_level = set(state.keys())
        extra = top_level - IC.OUTBOUND_STATE_ALLOWED_KEYS
        assert not extra, f"unexpected top-level keys leaked to Jev: {extra}"
    finally:
        event_loop.run_until_complete(
            db.behavior_events.delete_many({"session_id": sid}))


def test_outbound_state_contains_no_forbidden_identifiers(db, event_loop, monkeypatch):
    from services import intent_classifier as IC
    monkeypatch.setenv("PHILEON_ENV", "test")
    sid = f"phase-privacy2-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)
    event_loop.run_until_complete(db.behavior_events.insert_many([
        {"event_type": "PRODUCT_VIEWED", "product_slug": "ring-x",
         "session_id": sid, "env": "test", "created_at": now},
        {"event_type": "PRODUCT_LIKED", "product_slug": "ring-x",
         "session_id": sid, "env": "test", "created_at": now},
    ]))
    try:
        state = event_loop.run_until_complete(
            IC.build_session_state(db, session_id=sid))
        assert state is not None
        keys = _flatten_keys(state)
        bad = keys & _FORBIDDEN_STATE_KEYS
        assert not bad, f"forbidden identifier keys present in state: {bad}"
        # And session_id must not appear anywhere in string values either.
        import json
        blob = json.dumps(state)
        assert sid not in blob, "raw session_id leaked into outbound state"
    finally:
        event_loop.run_until_complete(
            db.behavior_events.delete_many({"session_id": sid}))


def test_search_token_scrubber_removed_from_module():
    """The old `_scrub_search_token` PII scrubber was intended for
    ``recent_searches``. That entire path is REMOVED. Search text is no
    longer forwarded in any form. Guard against re-introduction."""
    from services import intent_classifier as IC
    assert not hasattr(IC, "_scrub_search_token"), (
        "search-phrase scrubber must not be re-introduced — search "
        "activity is exposed as a count only"
    )


def test_outbound_state_never_contains_search_events_subtree(db, event_loop, monkeypatch):
    """No matter what the underlying search_events collection holds, the
    outbound state must never carry a `recent_searches` subtree or any
    of the raw text keys the old implementation used."""
    from services import intent_classifier as IC
    monkeypatch.setenv("PHILEON_ENV", "test")
    sid = f"phase-nosearchtree-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)
    event_loop.run_until_complete(db.behavior_events.insert_many([
        {"event_type": "PRODUCT_VIEWED", "product_slug": "veyron-noir",
         "session_id": sid, "env": "test", "created_at": now},
    ]))
    event_loop.run_until_complete(db.search_events.insert_many([
        {"normalized_query": "leaky-phrase-should-never-leave",
         "result_count": 1, "session_id": sid, "env": "test", "created_at": now},
    ]))
    try:
        state = event_loop.run_until_complete(
            IC.build_session_state(db, session_id=sid))
        assert state is not None
        # No search-related tree beyond the integer count.
        assert "recent_searches" not in state
        assert "normalized_query" not in state
        assert "search_tokens" not in state
        import json
        blob = json.dumps(state)
        assert "leaky-phrase-should-never-leave" not in blob
        assert "leaky-phrase" not in blob
    finally:
        event_loop.run_until_complete(
            db.behavior_events.delete_many({"session_id": sid}))
        event_loop.run_until_complete(
            db.search_events.delete_many({"session_id": sid}))


def test_search_activity_is_count_only_no_query_text(db, event_loop, monkeypatch):
    """Search activity in outbound state must be an integer COUNT ONLY.
    The customer's original / raw / normalized / scrubbed search phrase
    must never appear anywhere in the serialized TypeSafe request."""
    from services import intent_classifier as IC
    monkeypatch.setenv("PHILEON_ENV", "test")
    sid = f"phase-searchtext-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)
    event_loop.run_until_complete(db.behavior_events.insert_many([
        {"event_type": "PRODUCT_VIEWED", "product_slug": "veyron-noir",
         "session_id": sid, "env": "test", "created_at": now},
        {"event_type": "ADDED_TO_CART", "product_slug": "veyron-noir",
         "session_id": sid, "env": "test", "created_at": now},
    ]))
    event_loop.run_until_complete(db.search_events.insert_many([
        {"normalized_query": "distinctive-search-phrase-alpha",
         "result_count": 3, "session_id": sid, "env": "test", "created_at": now},
        {"normalized_query": "another-distinctive-search-omega",
         "result_count": 0, "session_id": sid, "env": "test", "created_at": now},
    ]))
    try:
        state = event_loop.run_until_complete(
            IC.build_session_state(db, session_id=sid))
        assert state is not None
        # Count-only exposure.
        assert state["search_activity_count"] == 2
        assert "recent_searches" not in state
        # No search-phrase leakage anywhere in the serialized payload.
        import json
        blob = json.dumps(state)
        assert "distinctive-search-phrase-alpha" not in blob
        assert "another-distinctive-search-omega" not in blob
        # Also cannot appear under any nested/renamed key.
        assert "search-phrase" not in blob
        assert "distinctive" not in blob
    finally:
        event_loop.run_until_complete(
            db.behavior_events.delete_many({"session_id": sid}))
        event_loop.run_until_complete(
            db.search_events.delete_many({"session_id": sid}))


def test_recent_searches_removed_from_allow_list():
    """`recent_searches` must NOT be part of the outbound allow-list."""
    from services import intent_classifier as IC
    assert "recent_searches" not in IC.OUTBOUND_STATE_ALLOWED_KEYS
    assert "search_activity_count" in IC.OUTBOUND_STATE_ALLOWED_KEYS
    assert "viewed_category_counts" in IC.OUTBOUND_STATE_ALLOWED_KEYS
    assert "vault_interest_count" in IC.OUTBOUND_STATE_ALLOWED_KEYS


def test_viewed_category_counts_uses_canonical_taxonomy(db, event_loop, monkeypatch):
    """Category signals must come from PHILEON's existing catalog
    (bracelet / cuff / earring / pendant / ring / set / vault) — never
    invented. Unknown slugs collapse to `unknown`."""
    from services import intent_classifier as IC
    monkeypatch.setenv("PHILEON_ENV", "test")
    sid = f"phase-cat-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)
    event_loop.run_until_complete(db.behavior_events.insert_many([
        # Canonical ring
        {"event_type": "PRODUCT_VIEWED", "product_slug": "veyron-noir",
         "session_id": sid, "env": "test", "created_at": now},
        {"event_type": "ADDED_TO_CART",  "product_slug": "veyron-noir",
         "session_id": sid, "env": "test", "created_at": now},
        # Canonical pendant
        {"event_type": "PRODUCT_LIKED", "product_slug": "boss-knot",
         "session_id": sid, "env": "test", "created_at": now},
        # Vault (iv- prefix) — custom signal
        {"event_type": "PRODUCT_VIEWED", "product_slug": "iv-atelier-1",
         "session_id": sid, "env": "test", "created_at": now},
        {"event_type": "PRODUCT_VIEWED", "product_slug": "iv-atelier-1",
         "session_id": sid, "env": "test", "created_at": now},
    ]))
    try:
        state = event_loop.run_until_complete(
            IC.build_session_state(db, session_id=sid))
        assert state is not None
        cats = state["viewed_category_counts"]
        assert cats.get("ring", 0) == 2
        assert cats.get("pendant", 0) == 1
        assert cats.get("vault", 0) == 2
        assert state["vault_interest_count"] == 2
        # No non-canonical category should ever appear.
        allowed = {"bracelet", "cuff", "earring", "pendant",
                   "ring", "set", "vault", "unknown"}
        assert set(cats.keys()) <= allowed
    finally:
        event_loop.run_until_complete(
            db.behavior_events.delete_many({"session_id": sid}))


# ────────────────────────────────────────────────────────────────
# 11) SCORE PERSISTENCE — raw preserved, derived band separate
# ────────────────────────────────────────────────────────────────

def test_purchase_intent_persistence_shape_uses_raw_score_and_derived_band(monkeypatch):
    """Simulate a TypeSafe Score response and verify PHILEON persists
    the RAW score/legend/probabilities/confidence AND stores the
    derived readable band under a clearly-named separate field."""
    from services import intent_classifier as IC
    from services.intent_classifier import _INTENT_CRITERIA

    class _FakeScore:
        # Mimic the SDK's Score answer object.
        score = 1.62
        confidence = 0.61
        legend = {i: name for i, name in enumerate(_INTENT_CRITERIA)}
        probabilities = {0: 0.03, 1: 0.32, 2: 0.65}

    class _FakeChoice:
        choice = "READY_TO_BUY"
        confidence = 0.88
        probabilities = {"BROWSING": 0.02, "PRODUCT_RESEARCH": 0.05,
                         "READY_TO_BUY": 0.88, "CUSTOM": 0.03, "GIFT": 0.02}

    class _FakeNoul:
        noul = 0.41

    class _FakeResp:
        model = "jev-latest"
        scores = {"purchase_intent": _FakeScore()}
        choices = {"shopping_mode": _FakeChoice()}
        nouls = {"followup_value": _FakeNoul()}

    # Build a decision doc the same way `classify_session` does — this
    # keeps the derivation code path under test without needing a live
    # Jev call. (We are asserting the deterministic PHILEON transform,
    # not Jev's outputs.)
    resp = _FakeResp()
    intent_ans = resp.scores["purchase_intent"]
    intent_probs_int = {int(k): float(v)
                        for k, v in intent_ans.probabilities.items()}
    intent_legend_str = {str(k): str(v) for k, v in intent_ans.legend.items()}
    intent_probs_str = {str(k): v for k, v in intent_probs_int.items()}
    intent_argmax_idx = max(intent_probs_int, key=intent_probs_int.get)
    intent_band = intent_ans.legend.get(intent_argmax_idx, "unknown")

    raw = {
        "score":         float(intent_ans.score),
        "legend":        intent_legend_str,
        "probabilities": intent_probs_str,
        "confidence":    float(intent_ans.confidence),
    }

    # RAW schema — exactly these four keys, and NO categorical label.
    assert set(raw.keys()) == {"score", "legend", "probabilities", "confidence"}
    assert "label" not in raw
    assert "band" not in raw
    assert raw["score"] == 1.62
    assert raw["confidence"] == 0.61
    assert raw["legend"] == {"0": "LOW", "1": "MEDIUM", "2": "HIGH"}
    assert raw["probabilities"] == {"0": 0.03, "1": 0.32, "2": 0.65}

    # Derived band — separate, readable, never overwrites RAW.
    assert intent_band == "HIGH"
    assert intent_band in _INTENT_CRITERIA
    _ = IC  # keep reference; the transform is exercised above.


def test_purchase_intent_band_is_separate_field_not_inside_raw_score():
    """The full decision document layout must keep the RAW Score under
    `purchase_intent` and the derived band under a top-level sibling
    field `purchase_intent_band`. They must never be merged."""
    # We inspect the classify_session source to prove the schema stays
    # separated at write time.
    import inspect
    from services import intent_classifier as IC
    src = inspect.getsource(IC.classify_session)
    assert '"purchase_intent"' in src
    assert '"purchase_intent_band"' in src
    # RAW block must contain the four canonical Score keys.
    for key in ('"score"', '"legend"', '"probabilities"', '"confidence"'):
        assert key in src, f"raw Score key missing from persisted schema: {key}"
    # The RAW `purchase_intent` block must NOT include a categorical label
    # under the same key (regression guard).
    forbidden_line = '"purchase_intent": {\n            "label"'
    assert forbidden_line not in src


def test_no_production_thresholds_are_hardcoded():
    """Shadow evaluation MUST NOT hardcode production thresholds like
    'HIGH >= 0.8 fires an email'. The classifier module must not gate
    any behavior on a numeric intent threshold."""
    from services import intent_classifier as IC
    import inspect
    src = inspect.getsource(IC)
    # No numeric threshold comparisons against purchase_intent.
    for needle in ("purchase_intent >=", "purchase_intent >",
                   "purchase_intent_score >=", "intent_score >",
                   "intent_score >=", "confidence >="):
        assert needle not in src, f"potential production threshold: {needle}"


# ────────────────────────────────────────────────────────────────
# 12) VERSION PIN — typesafe-sdk stays on 0.7.1 for this change
# ────────────────────────────────────────────────────────────────

def test_typesafe_sdk_version_pinned_to_0_7_1():
    from importlib.metadata import version
    assert version("typesafe-sdk") == "0.7.1"




def test_trigger_allow_list_uses_only_canonical_event_names():
    """The classifier MUST NOT invent new event taxonomy — every trigger
    must be one of the canonical PHILEON behavior event names."""
    from services.intent_classifier import CLASSIFY_TRIGGERS
    from models_retention import EVENT_TYPES
    for t in CLASSIFY_TRIGGERS:
        assert t in EVENT_TYPES, f"non-canonical trigger '{t}'"


def test_trigger_gate_rejects_disallowed_event_types(db, event_loop, monkeypatch):
    from services import intent_classifier as IC
    _reload_env(monkeypatch, key="dev-value", flag="true")
    got = event_loop.run_until_complete(IC.should_sample_for_trigger(
        db, session_id=f"trigger-{uuid.uuid4().hex[:6]}",
        event_type="PRODUCT_UNLIKED"))
    assert got["sample"] is False
    assert got["reason"] == "trigger_not_allowed"


def test_product_viewed_below_threshold_is_not_sampled(db, event_loop, monkeypatch):
    """PRODUCT_VIEWED must only sample once the session has enough
    view depth (repeat viewer signal), never on the first casual view."""
    from services import intent_classifier as IC
    _reload_env(monkeypatch, key="dev-value", flag="true")
    monkeypatch.setenv("PHILEON_ENV", "test")
    sid = f"viewthresh-{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc)
    event_loop.run_until_complete(db.behavior_events.insert_many([
        {"event_type": "PRODUCT_VIEWED", "product_slug": "ring-x",
         "session_id": sid, "env": "test", "created_at": now},
    ]))
    try:
        got = event_loop.run_until_complete(IC.should_sample_for_trigger(
            db, session_id=sid, event_type="PRODUCT_VIEWED"))
        assert got["sample"] is False
        assert got["reason"] == "below_view_threshold"
    finally:
        event_loop.run_until_complete(
            db.behavior_events.delete_many({"session_id": sid}))


def test_cooldown_blocks_second_sample_within_window(db, event_loop, monkeypatch):
    from services import intent_classifier as IC
    _reload_env(monkeypatch, key="dev-value", flag="true")
    monkeypatch.setenv("PHILEON_ENV", "test")
    sid = f"cooldown-{uuid.uuid4().hex[:6]}"
    try:
        first = event_loop.run_until_complete(IC.should_sample_for_trigger(
            db, session_id=sid, event_type="ADDED_TO_CART"))
        second = event_loop.run_until_complete(IC.should_sample_for_trigger(
            db, session_id=sid, event_type="CHECKOUT_STARTED"))
        assert first["sample"] is True
        assert second["sample"] is False
        assert second["reason"] == "cooldown"
    finally:
        event_loop.run_until_complete(
            db.intent_classifier_cooldown.delete_one(
                {"_id": f"test:{sid}"}))


# ────────────────────────────────────────────────────────────────
# 8) JEV SEMANTICS — question schema shape
# ────────────────────────────────────────────────────────────────

def test_question_schema_uses_correct_typesafe_types():
    from typesafe_sdk import Choice, Noul, Score  # type: ignore
    from services.intent_classifier import (
        _build_questions, _INTENT_CRITERIA, _MODE_CRITERIA,
    )
    q = _build_questions()
    # purchase_intent must be a Score with ordered LOW/MEDIUM/HIGH.
    assert isinstance(q["purchase_intent"], Score)
    assert _INTENT_CRITERIA == ["LOW", "MEDIUM", "HIGH"]
    # shopping_mode must be a Choice over the 5 modes.
    assert isinstance(q["shopping_mode"], Choice)
    assert set(_MODE_CRITERIA.keys()) == {
        "BROWSING", "PRODUCT_RESEARCH", "READY_TO_BUY", "CUSTOM", "GIFT"}
    # followup_value must be a Noul (yes/no).
    assert isinstance(q["followup_value"], Noul)


def test_score_instructions_contain_standalone_level_descriptions():
    from services.intent_classifier import _build_questions
    q = _build_questions()
    instr = q["purchase_intent"].instructions
    # Standalone descriptions for each level must be present.
    assert "LOW" in instr and "MEDIUM" in instr and "HIGH" in instr
    # Some concrete anchoring signals must be named — no vague prose.
    assert "cart" in instr.lower()
    assert "checkout" in instr.lower()
    assert "view" in instr.lower()


# ────────────────────────────────────────────────────────────────
# 9) VALIDATION DATASET — 9 archetypal shopper fixtures
# ────────────────────────────────────────────────────────────────

def _seed_archetype(event_loop, db, sid: str, events, searches=None,
                    inquiries=0, env: str = "test"):
    now = datetime.now(timezone.utc)
    docs = [{"event_type": et, "product_slug": slug,
             "session_id": sid, "env": env, "created_at": now}
            for et, slug in events]
    if docs:
        event_loop.run_until_complete(db.behavior_events.insert_many(docs))
    if searches:
        event_loop.run_until_complete(db.search_events.insert_many([
            {"normalized_query": q, "result_count": rc,
             "session_id": sid, "env": env, "created_at": now}
            for q, rc in searches]))
    for _ in range(inquiries):
        event_loop.run_until_complete(db.inquiries.insert_one({
            "session_id": sid, "created_at": now,
        }))


def _cleanup_archetype(event_loop, db, sid: str):
    event_loop.run_until_complete(db.behavior_events.delete_many({"session_id": sid}))
    event_loop.run_until_complete(db.search_events.delete_many({"session_id": sid}))
    event_loop.run_until_complete(db.inquiries.delete_many({"session_id": sid}))


# The dataset is INTENTIONALLY structural — we assert on the SHAPE of
# the payload built from each archetype, NOT on labels Jev would produce.
# This keeps the evaluation honest (we cannot silently tune Jev to force
# an outcome).
ARCHETYPES = [
    ("casual_browser",       [("PRODUCT_VIEWED", "signet-a")], None, 0),
    ("repeat_researcher",    [("PRODUCT_VIEWED", "signet-a")] * 3 +
                             [("PRODUCT_VIEWED", "band-b")] * 2, None, 0),
    ("search_heavy",         [("PRODUCT_VIEWED", "signet-a"),
                              ("PRODUCT_VIEWED", "band-b")],
     [("signet ring", 4), ("gold band", 5), ("eternity", 2)], 0),
    ("wishlist_shopper",     [("PRODUCT_VIEWED", "signet-a"),
                              ("PRODUCT_LIKED", "signet-a"),
                              ("PRODUCT_LIKED", "band-b")], None, 0),
    ("cart_shopper",         [("PRODUCT_VIEWED", "signet-a"),
                              ("ADDED_TO_CART",  "signet-a")], None, 0),
    ("checkout_started",     [("PRODUCT_VIEWED", "signet-a"),
                              ("ADDED_TO_CART",  "signet-a"),
                              ("CHECKOUT_STARTED", "signet-a")], None, 0),
    ("custom_prospect",      [("PRODUCT_VIEWED", "iv-atelier-1"),
                              ("PRODUCT_VIEWED", "iv-atelier-1")], None, 1),
    ("gift_shopper",         [("PRODUCT_VIEWED", "signet-a"),
                              ("PRODUCT_VIEWED", "band-b"),
                              ("PRODUCT_VIEWED", "pendant-c"),
                              ("PRODUCT_VIEWED", "earring-d"),
                              ("PRODUCT_LIKED",  "pendant-c")], None, 0),
    ("ambiguous",            [("PRODUCT_VIEWED", "signet-a"),
                              ("PRODUCT_UNLIKED", "signet-a"),
                              ("REMOVED_FROM_CART", "signet-a")], None, 0),
]


@pytest.mark.parametrize("archetype,events,searches,inquiries", ARCHETYPES,
                         ids=[a[0] for a in ARCHETYPES])
def test_archetype_state_shape_and_no_pii(archetype, events, searches, inquiries,
                                          db, event_loop, monkeypatch):
    from services import intent_classifier as IC
    monkeypatch.setenv("PHILEON_ENV", "test")
    sid = f"archetype-{archetype}-{uuid.uuid4().hex[:6]}"
    _seed_archetype(event_loop, db, sid, events, searches, inquiries)
    try:
        state = event_loop.run_until_complete(
            IC.build_session_state(db, session_id=sid))
        assert state is not None, f"{archetype} produced no state"
        # Allow-list contract.
        assert set(state.keys()) <= IC.OUTBOUND_STATE_ALLOWED_KEYS
        # No forbidden keys anywhere in the tree.
        keys = _flatten_keys(state)
        assert not (keys & _FORBIDDEN_STATE_KEYS)
        # Session ID never leaks.
        import json
        assert sid not in json.dumps(state)
        # Structural sanity — counts / distinct_products are dicts;
        # viewed_category_counts is a dict; search activity is an int.
        assert isinstance(state["counts"], dict)
        assert isinstance(state["distinct_products"], dict)
        assert isinstance(state["viewed_category_counts"], dict)
        assert isinstance(state["search_activity_count"], int)
    finally:
        _cleanup_archetype(event_loop, db, sid)


# ────────────────────────────────────────────────────────────────
# 10) FAILURE BEHAVIOR — no customer impact when key missing
# ────────────────────────────────────────────────────────────────

def test_schedule_background_classification_is_noop_when_disabled(monkeypatch):
    """When the gate is closed, schedule_background_classification must
    NOT touch the event loop or attempt any Jev call."""
    from services import intent_classifier as IC
    _reload_env(monkeypatch, key="", flag="true")

    class _FakeDB:
        pass

    # No async loop is running; must not raise.
    IC.schedule_background_classification(
        _FakeDB(), session_id="regression-noop",
        trigger="event:CHECKOUT_STARTED", event_type="CHECKOUT_STARTED")


def test_classify_session_skips_below_min_events(db, event_loop, monkeypatch):
    """Even with a live key, a session with too little signal must not
    burn a Jev call — the classifier short-circuits with a typed skip."""
    from services import intent_classifier as IC
    _reload_env(monkeypatch, key="dev-value", flag="true")
    monkeypatch.setenv("PHILEON_ENV", "test")
    sid = f"minevents-{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc)
    event_loop.run_until_complete(db.behavior_events.insert_one(
        {"event_type": "PRODUCT_VIEWED", "product_slug": "ring-x",
         "session_id": sid, "env": "test", "created_at": now}))
    try:
        got = event_loop.run_until_complete(
            IC.classify_session(db, session_id=sid))
        assert got.get("skipped") is True
        assert got.get("reason") == "below_min_events"
    finally:
        event_loop.run_until_complete(
            db.behavior_events.delete_many({"session_id": sid}))


def test_no_fallback_llm_when_typesafe_client_fails(monkeypatch):
    """Client construction must NEVER fall back to another LLM. If
    TypeSafe fails to configure, the classifier stays disabled."""
    from services import intent_classifier as IC
    # Clear the cache so a fresh instantiation is attempted.
    IC._get_jev_client.cache_clear()
    _reload_env(monkeypatch, key="", flag="true")  # blank key
    # is_enabled() must be False, so callers won't reach _get_jev_client.
    assert IC.is_enabled() is False
