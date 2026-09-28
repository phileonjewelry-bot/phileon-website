"""PHILEON — Jev / TypeSafe shopping-intent classifier (SHADOW MODE ONLY).

Locked invariants preserved:
    * NO customer-facing side effects. This module NEVER triggers an email,
      changes merchandising, mutates checkout / pricing / inventory / orders,
      or reveals classifications to the customer.
    * Fail-closed activation gate: if `TYPESAFE_API_KEY` is blank the
      shadow classifier is disabled. Owner sets the value to activate.
    * Uses `TYPESAFE_API_KEY` for direct TypeSafe authentication (SDK
      sends ``Authorization: Bearer <TYPESAFE_API_KEY>`` to the TypeSafe
      default base URL). No Emergent proxy substitution. `EMERGENT_LLM_KEY`
      is NOT used by this module.
    * Input state is limited to CONSENT-SAFE aggregate signals
      (`behavior_events` for a session in the current server env).
      Session ID is NEVER forwarded to Jev.
    * Persisted decisions live in `intent_classifications_shadow` for
      evaluation only. Never joined back to marketing or checkout code.
"""
from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timezone, timedelta
from functools import lru_cache
from typing import Any, Dict, Optional

from services.analytics_service import current_env

log = logging.getLogger("phileon.intent_classifier")


# ────────────────────────────────────────────────────────────────
# ACTIVATION GATE
# ────────────────────────────────────────────────────────────────

def is_enabled() -> bool:
    """Shadow classifier is enabled only when BOTH:
        1. `PHILEON_INTENT_CLASSIFIER_SHADOW` is truthy (feature flag).
        2. `TYPESAFE_API_KEY` is set to a non-empty value (owner switch).
    Fail-closed if either is missing.
    """
    flag = str(os.environ.get("PHILEON_INTENT_CLASSIFIER_SHADOW") or "").strip().lower()
    if flag not in {"true", "1", "yes", "on"}:
        return False
    key = (os.environ.get("TYPESAFE_API_KEY") or "").strip()
    return bool(key)


# ────────────────────────────────────────────────────────────────
# TYPESAFE CLIENT — direct TypeSafe authentication
# ────────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_jev_client():
    """Reusable async TypeSafe client. Cached per process.

    Authentication contract (verified against typesafe-sdk >= 0.7.x
    and TypeSafe official docs):
        * SDK sends ``Authorization: Bearer <api_key>`` automatically.
        * ``api_key`` is read from the ``TYPESAFE_API_KEY`` env var when
          the constructor arg is omitted; we pass it explicitly for clarity.
        * Base URL defaults to the TypeSafe direct endpoint. Only overridden
          if the operator explicitly sets ``TYPESAFE_BASE_URL``.
        * EMERGENT_LLM_KEY is NEVER substituted for TYPESAFE_API_KEY.
    """
    from typesafe_sdk import AsyncTypeSafeClient, RetryPolicy  # type: ignore

    api_key = (os.environ.get("TYPESAFE_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError(
            "TYPESAFE_API_KEY is empty — the shadow classifier is not "
            "activated. is_enabled() must gate this call.")

    kwargs: Dict[str, Any] = {
        "api_key": api_key,
        "retry": RetryPolicy(max_retries=2, respect_retry_after=False),
    }
    override = (os.environ.get("TYPESAFE_BASE_URL") or "").strip()
    if override:
        kwargs["base_url"] = override.rstrip("/")

    return AsyncTypeSafeClient(**kwargs)


async def aclose() -> None:
    """Close the cached TypeSafe client on shutdown."""
    try:
        client = _get_jev_client()
        await client.aclose()
    except Exception:  # pragma: no cover
        pass


def _jev_error_code(exc) -> str:
    body = getattr(exc, "body", None)
    if isinstance(body, dict):
        err = body.get("error")
        code = (err.get("type") if isinstance(err, dict) else None) or body.get("code") or body.get("error_type") or str(err or "")
    else:
        code = str(body or exc).strip()
    known = {"CAPACITY_LIMIT", "USER_CONCURRENCY_LIMIT",
             "CONCURRENCY_REQUEST_LIMIT", "budget_exceeded"}
    return "RATE_LIMITED" if getattr(exc, "status", 0) == 429 and code not in known else code


# ────────────────────────────────────────────────────────────────
# SIGNAL AGGREGATION — consent-safe, server-derived
# ────────────────────────────────────────────────────────────────

# Signals older than this are excluded from the classification state.
_SIGNAL_WINDOW = timedelta(hours=24)

# Cap the number of events surfaced to Jev — bounds payload size and cost.
_MAX_EVENTS_IN_STATE = 40

# ── OUTBOUND ALLOW-LIST — every top-level key in the Jev state payload
# must appear here. Enforced by ``build_session_state`` AND by an
# automated test that will fail if new keys are introduced without an
# audit review. See ``tests/test_intent_shadow.py``.
#
# NOTE: `recent_searches` and any form of the customer's original / raw /
# normalized / scrubbed search phrase are DELIBERATELY ABSENT from this
# allow-list. Free-form customer-entered text is NEVER sent to TypeSafe.
# Instead we send a small integer `search_activity_count` and structured
# `viewed_category_counts` derived from PHILEON's canonical
# product-category taxonomy.
OUTBOUND_STATE_ALLOWED_KEYS: frozenset = frozenset({
    "window_hours",
    "counts",
    "distinct_products",
    "repeat_view_ratio",
    "custom_inquiry_count",
    "search_activity_count",     # integer only — no phrases
    "viewed_category_counts",    # canonical PHILEON categories only
    "vault_interest_count",      # canonical "vault" category signal
    "latest_event_age_seconds",
    "total_events",
})


def _canonical_category(slug: Optional[str]) -> str:
    """Map a product_slug to its canonical PHILEON category. Vault
    pieces (`iv-*` prefix or catalog category == "vault") are surfaced
    as ``vault`` for the CUSTOM/one-of-one signal.
    Returns ``"unknown"`` for slugs not in the catalog.
    """
    if not slug:
        return "unknown"
    if slug.startswith("iv-"):
        return "vault"
    try:
        from services.pricing_engine_catalog import PRICING_ENGINE_CATALOG
        entry = PRICING_ENGINE_CATALOG.get(slug) or {}
        cat = (entry.get("category") or "").strip().lower()
        return cat if cat else "unknown"
    except Exception:
        return "unknown"


async def build_session_state(db, *, session_id: str) -> Optional[Dict[str, Any]]:
    """Aggregate a session's consent-safe behavioral signals into a
    compact JSON state for Jev. Returns ``None`` when there is not
    enough signal (fewer than 1 event) — the caller should skip.

    Outbound contract:
        * Session ID is NEVER included in the payload — only used to
          scope the DB query.
        * No customer_email, no name, no phone, no address, no IP, no
          user-agent, no payment info, no Stripe / order / account IDs.
        * Search tokens are PII-scrubbed and length-capped.
        * Timestamps are surfaced as relative *ages*, not wall-clocks,
          so the payload cannot leak precise session start times.
        * Only keys in :data:`OUTBOUND_STATE_ALLOWED_KEYS` may appear
          in the top-level state.
    """
    if not session_id:
        return None
    env = current_env()
    now = datetime.now(timezone.utc)
    since = now - _SIGNAL_WINDOW
    scope = {"session_id": session_id, "env": env,
             "created_at": {"$gte": since}}

    # Aggregate counts by event_type.
    counts_pipe = [
        {"$match": scope},
        {"$group": {"_id": "$event_type", "n": {"$sum": 1}}},
    ]
    counts: Dict[str, int] = {}
    async for row in db.behavior_events.aggregate(counts_pipe):
        counts[row["_id"]] = int(row["n"] or 0)

    total = sum(counts.values())
    if total <= 0:
        return None

    # Distinct product slugs viewed / liked / carted / checkout-started.
    distinct_pipe = [
        {"$match": scope},
        {"$group": {"_id": {"et": "$event_type",
                            "slug": "$product_slug"}}},
        {"$group": {"_id": "$_id.et",
                    "slugs": {"$addToSet": "$_id.slug"}}},
    ]
    distinct: Dict[str, list] = {}
    async for row in db.behavior_events.aggregate(distinct_pipe):
        distinct[row["_id"]] = [s for s in row["slugs"] if s][:20]

    # Repeat-view ratio: PRODUCT_VIEWED count / distinct viewed slugs.
    views = counts.get("PRODUCT_VIEWED", 0)
    distinct_viewed = len(distinct.get("PRODUCT_VIEWED", []) or [])
    repeat_view_ratio = round((views / distinct_viewed), 2) if distinct_viewed else 0.0

    # Latest event age — relative seconds, not wall-clock.
    latest = await db.behavior_events.find(scope, {"created_at": 1}) \
        .sort("created_at", -1).limit(1).to_list(1)
    latest_age_seconds = None
    if latest:
        try:
            latest_age_seconds = int(max(0, (now - latest[0]["created_at"]).total_seconds()))
        except Exception:
            latest_age_seconds = None

    # Search activity — INTEGER COUNT ONLY. The customer's actual search
    # phrase (raw / normalized / scrubbed) is NEVER forwarded to Jev.
    search_scope = {"session_id": session_id, "env": env,
                    "created_at": {"$gte": since}}
    search_activity_count = 0
    try:
        search_activity_count = int(await db.search_events.count_documents(
            search_scope) or 0)
    except Exception:
        search_activity_count = 0

    # Category breadth — derived from PHILEON's canonical product-category
    # taxonomy (bracelet / cuff / earring / pendant / ring / set / vault).
    # Only counts VIEW/LIKE/CART events; unknown-slug items collapse to
    # "unknown". No customer text of any kind.
    viewed_category_counts: Dict[str, int] = {}
    vault_interest_count = 0
    cat_pipe = [
        {"$match": {**scope,
                    "event_type": {"$in": ["PRODUCT_VIEWED",
                                           "PRODUCT_LIKED",
                                           "ADDED_TO_CART"]}}},
        {"$group": {"_id": "$product_slug", "n": {"$sum": 1}}},
    ]
    async for row in db.behavior_events.aggregate(cat_pipe):
        cat = _canonical_category(row.get("_id"))
        n = int(row.get("n") or 0)
        viewed_category_counts[cat] = viewed_category_counts.get(cat, 0) + n
        if cat == "vault":
            vault_interest_count += n

    # Custom-piece interest — presence of an inquiries row for this
    # session_id within the same window (bounded scan). Server-derived
    # count only; no inquiry content shipped.
    custom_interest = 0
    try:
        custom_interest = await db.inquiries.count_documents({
            "session_id": session_id,
            "created_at": {"$gte": since},
        })
    except Exception:
        pass

    state: Dict[str, Any] = {
        "window_hours": int(_SIGNAL_WINDOW.total_seconds() // 3600),
        "counts": {
            "product_viewed":    counts.get("PRODUCT_VIEWED", 0),
            "product_liked":     counts.get("PRODUCT_LIKED", 0),
            "product_unliked":   counts.get("PRODUCT_UNLIKED", 0),
            "added_to_cart":     counts.get("ADDED_TO_CART", 0),
            "removed_from_cart": counts.get("REMOVED_FROM_CART", 0),
            "checkout_started":  counts.get("CHECKOUT_STARTED", 0),
        },
        "distinct_products": {
            "viewed":   distinct.get("PRODUCT_VIEWED", []),
            "liked":    distinct.get("PRODUCT_LIKED", []),
            "carted":   distinct.get("ADDED_TO_CART", []),
        },
        "repeat_view_ratio":       repeat_view_ratio,
        "custom_inquiry_count":    int(custom_interest or 0),
        "search_activity_count":   int(search_activity_count),
        "viewed_category_counts":  viewed_category_counts,
        "vault_interest_count":    int(vault_interest_count),
        "latest_event_age_seconds": latest_age_seconds,
        "total_events":            min(total, _MAX_EVENTS_IN_STATE),
    }
    # Fail-closed defence: strip anything not on the allow-list.
    return {k: v for k, v in state.items() if k in OUTBOUND_STATE_ALLOWED_KEYS}


# ────────────────────────────────────────────────────────────────
# QUESTION SCHEMA — three typed decisions
# ────────────────────────────────────────────────────────────────

_INTENT_CRITERIA = ["LOW", "MEDIUM", "HIGH"]

_MODE_CRITERIA = {
    "BROWSING":         "Casually looking at products with no strong signals — few views, no likes, no cart activity, no repeat visits to the same piece.",
    "PRODUCT_RESEARCH": "Comparing multiple products deliberately — several distinct product views, repeat views of the same piece, active search queries.",
    "READY_TO_BUY":     "Focused on one or two specific products with cart activity or checkout started, low breadth of exploration.",
    "CUSTOM":           "Interested in a bespoke or custom piece — inquiry / consultation signals present, or repeat interest in one-of-one items.",
    "GIFT":             "Signals suggest shopping for someone else — broad category browsing, wishlist-heavy, wide price range, low commitment to any single item.",
}

_INTENT_LEVEL_GUIDE = (
    "LOW = one or two casual product views, no likes / no cart activity / "
    "no repeat views / no search intent. "
    "MEDIUM = deliberate research signal — several distinct product views "
    "OR one or more likes OR at least one product added to cart. "
    "HIGH = strong buying signal — active cart with retained items, "
    "checkout started in the session, or repeated focus on a single piece."
)


def _build_questions():
    from typesafe_sdk import Choice, Noul, Score  # type: ignore
    return {
        "purchase_intent": Score(
            instructions=(
                "Given the session's aggregate shopping signals, rate the "
                "customer's overall likelihood to purchase from PHILEON "
                "within the next few days. Use the following ordered "
                "level definitions: " + _INTENT_LEVEL_GUIDE
            ),
            criteria=_INTENT_CRITERIA,
        ),
        "shopping_mode": Choice(
            instructions=(
                "Which single shopping mode best describes this session? "
                "Pick the one that fits the signals best — do not blend."
            ),
            criteria=_MODE_CRITERIA,
        ),
        "followup_value": Noul(
            instructions=(
                "Would a personalised concierge follow-up (a human "
                "touchpoint, not a marketing blast) likely add value to "
                "this customer's journey? Answer yes only if there is "
                "meaningful uncertainty on the customer side that a human "
                "could resolve."
            ),
        ),
    }


# ────────────────────────────────────────────────────────────────
# SAMPLING / DEBOUNCE — privacy-safe, funnel-representative coverage
# ────────────────────────────────────────────────────────────────

# Minimum wall-clock gap between two shadow classifications for the same
# session. Prevents Jev spam on chatty sessions and prevents identical
# state being re-classified on every event.
_COOLDOWN_SECONDS = 5 * 60  # 5 minutes per session

# A session must have at least this many total events before we spend a
# Jev call on it — LOW-signal sessions add noise to shadow evaluation.
_MIN_EVENTS_FOR_CLASSIFICATION = 2

# Trigger allow-list. Uses ONLY canonical PHILEON behavior event names —
# no new event taxonomy is introduced by the classifier.
CLASSIFY_TRIGGERS: frozenset = frozenset({
    "PRODUCT_LIKED",       # wishlist milestone
    "ADDED_TO_CART",       # cart milestone
    "CHECKOUT_STARTED",    # checkout milestone (existing)
    "PRODUCT_VIEWED",      # sampled only for repeat viewers (§ below)
})

# When the trigger is PRODUCT_VIEWED, only sample when the session has
# accumulated at least this many total views — filters out casual
# one-off visits and biases coverage toward genuine research signal.
_REPEAT_VIEW_SAMPLE_THRESHOLD = 4


async def _cooldown_open(db, *, session_id: str, env: str) -> bool:
    """Return True if the session is inside its cooldown window and a
    new classification should be skipped. Atomic: uses a single
    ``upsert`` with an ``$expr`` so concurrent triggers only sample once.
    """
    now = datetime.now(timezone.utc)
    threshold = now - timedelta(seconds=_COOLDOWN_SECONDS)
    key = {"_id": f"{env}:{session_id[:128]}"}
    doc = await db.intent_classifier_cooldown.find_one_and_update(
        key,
        {"$set": {"env": env, "session_id": session_id[:128]},
         "$max": {"last_sampled_at": now},
         "$setOnInsert": {"created_at": now}},
        upsert=True,
        return_document=False,   # return the PREVIOUS doc (or None on insert)
    )
    if doc is None:
        return False  # first sample for this session
    prev = doc.get("last_sampled_at")
    if prev is None:
        return False
    # Motor returns naive datetimes for stored dates. Normalise both
    # sides to UTC-aware so the comparison never raises.
    try:
        if prev.tzinfo is None:
            prev = prev.replace(tzinfo=timezone.utc)
        return prev >= threshold
    except Exception:
        return False


async def _rewind_cooldown(db, *, session_id: str, env: str,
                           prev_at: Optional[datetime]) -> None:
    """If a sample was accounted for but never actually issued, restore
    the prior ``last_sampled_at`` so we do not skip the next real
    trigger. Best-effort — swallow errors."""
    try:
        await db.intent_classifier_cooldown.update_one(
            {"_id": f"{env}:{session_id[:128]}"},
            {"$set": {"last_sampled_at": prev_at}}
            if prev_at is not None
            else {"$unset": {"last_sampled_at": ""}},
        )
    except Exception:
        pass


async def should_sample_for_trigger(
    db, *, session_id: str, event_type: str,
) -> Dict[str, Any]:
    """Decide whether a behavior event should trigger a shadow
    classification. Returns a small dict:
        {"sample": bool, "reason": str, "trigger": str}

    Never awaits Jev. Never affects customer response.
    """
    if not is_enabled():
        return {"sample": False, "reason": "disabled", "trigger": event_type}
    if event_type not in CLASSIFY_TRIGGERS:
        return {"sample": False, "reason": "trigger_not_allowed",
                "trigger": event_type}

    env = current_env()

    # PRODUCT_VIEWED: only sample when the session has enough view depth.
    if event_type == "PRODUCT_VIEWED":
        since = datetime.now(timezone.utc) - _SIGNAL_WINDOW
        try:
            view_count = await db.behavior_events.count_documents({
                "session_id": session_id, "env": env,
                "event_type": "PRODUCT_VIEWED",
                "created_at": {"$gte": since},
            })
        except Exception:
            return {"sample": False, "reason": "count_failed",
                    "trigger": event_type}
        if view_count < _REPEAT_VIEW_SAMPLE_THRESHOLD:
            return {"sample": False, "reason": "below_view_threshold",
                    "trigger": event_type}

    # Cooldown check — atomic upsert.
    if await _cooldown_open(db, session_id=session_id, env=env):
        return {"sample": False, "reason": "cooldown",
                "trigger": event_type}
    return {"sample": True, "reason": "ok", "trigger": event_type}


async def classify_session(
    db,
    *,
    session_id: str,
    trigger: str = "manual",
) -> Dict[str, Any]:
    """Run a shadow classification for a session. Returns a dict summary
    including ``persisted_id``. Fail-closed if disabled.
    """
    if not is_enabled():
        return {"skipped": True, "reason": "disabled"}

    state = await build_session_state(db, session_id=session_id)
    if not state:
        return {"skipped": True, "reason": "no_signal"}
    if int(state.get("total_events") or 0) < _MIN_EVENTS_FOR_CLASSIFICATION:
        return {"skipped": True, "reason": "below_min_events"}

    from typesafe_sdk import TypeSafeAPIError, TypeSafeError  # type: ignore
    client = _get_jev_client()

    try:
        response = await client.system_one(
            model="jev-latest",
            state=state,
            questions=_build_questions(),
        )
    except TypeSafeAPIError as exc:
        code = _jev_error_code(exc)
        log.warning("intent_classifier jev_api_error status=%s code=%s",
                    getattr(exc, "status", None), code)
        return {"skipped": True, "reason": "jev_api_error",
                "status": getattr(exc, "status", None), "code": code}
    except TypeSafeError as exc:
        log.warning("intent_classifier jev_unavailable: %s", exc)
        return {"skipped": True, "reason": "jev_unavailable"}
    except Exception as exc:  # pragma: no cover — defensive; never surface
        log.warning("intent_classifier unexpected: %s: %s",
                    type(exc).__name__, exc)
        return {"skipped": True, "reason": "unexpected_error"}

    # ── Parse typed decisions ────────────────────────────────
    # purchase_intent is a TypeSafe Score — the RAW response is
    # preserved verbatim (score / legend / probabilities / confidence).
    # A separate `purchase_intent_band` is a DETERMINISTIC PHILEON
    # derivation (argmax of probabilities → legend name). It never
    # overwrites, replaces, or masquerades as the raw Jev Score.
    intent_ans = response.scores["purchase_intent"]
    intent_probs_int = {int(k): float(v)
                        for k, v in intent_ans.probabilities.items()}
    intent_legend_str = {str(k): str(v)
                         for k, v in intent_ans.legend.items()}
    intent_probs_str = {str(k): v for k, v in intent_probs_int.items()}
    # Derived band — deterministic, PHILEON-side.
    intent_argmax_idx = max(intent_probs_int, key=intent_probs_int.get)
    intent_band = intent_ans.legend.get(intent_argmax_idx, "unknown")

    mode_ans = response.choices["shopping_mode"]
    mode_label = mode_ans.choice
    mode_probs = {str(k): float(v) for k, v in mode_ans.probabilities.items()}

    followup_ans = response.nouls["followup_value"]
    followup_yes = float(followup_ans.noul)

    now = datetime.now(timezone.utc)
    decision = {
        "session_id": session_id[:128],
        "env": current_env(),
        "trigger": trigger,
        "model": getattr(response, "model", "jev-latest"),
        "state_snapshot": state,
        # RAW TypeSafe Score — preserved verbatim for evaluation.
        "purchase_intent": {
            "score":         float(intent_ans.score),
            "legend":        intent_legend_str,
            "probabilities": intent_probs_str,
            "confidence":    float(intent_ans.confidence),
        },
        # DERIVED categorical band — PHILEON-side, deterministic,
        # explicitly named. NEVER overwrites the raw Score. Kept for
        # readable summarisation only. No production thresholds yet.
        "purchase_intent_band": intent_band,
        "purchase_intent_band_derivation": "argmax(probabilities) -> legend[k]",
        # RAW TypeSafe Choice.
        "shopping_mode": {
            "label":         mode_label,
            "confidence":    float(mode_ans.confidence),
            "probabilities": mode_probs,
        },
        # RAW TypeSafe Noul — yes-probability only. No fabricated confidence.
        "followup_value": {
            "yes_probability": followup_yes,
        },
        "shadow_mode": True,
        "consumer_facing_effect": False,
        "created_at": now,
    }

    result = await db.intent_classifications_shadow.insert_one(decision)
    return {
        "ok": True,
        "persisted_id": str(result.inserted_id),
        "purchase_intent": decision["purchase_intent"],
        "purchase_intent_band": decision["purchase_intent_band"],
        "shopping_mode": decision["shopping_mode"],
        "followup_value": decision["followup_value"],
        "trigger": trigger,
    }


async def classify_session_safe(
    db, *, session_id: str, trigger: str = "auto",
) -> None:
    """Fire-and-forget wrapper — swallows every error. Meant to be used
    from user-facing paths (e.g., after CHECKOUT_STARTED event ingest)
    where customer traffic MUST never be affected by classifier failures.
    """
    try:
        await classify_session(db, session_id=session_id, trigger=trigger)
    except Exception as exc:  # pragma: no cover — defensive
        log.warning("intent_classifier background failure: %s: %s",
                    type(exc).__name__, exc)


def schedule_background_classification(
    db, *, session_id: str, trigger: str,
    event_type: Optional[str] = None,
) -> None:
    """Detach a shadow classification as a background asyncio task.

    Only schedules if:
        1. The classifier is enabled (owner + flag).
        2. ``event_type`` is on the trigger allow-list.
        3. The session is out of its cooldown window AND meets any
           trigger-specific thresholds (e.g. repeat-view depth).

    Never awaited by the caller — the customer response returns
    immediately. Silently no-ops on every failure path.
    """
    if not is_enabled():
        return
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:  # pragma: no cover — not in async context
        return

    async def _guarded() -> None:
        try:
            if event_type is not None:
                decision = await should_sample_for_trigger(
                    db, session_id=session_id, event_type=event_type)
                if not decision.get("sample"):
                    return
            await classify_session_safe(
                db, session_id=session_id, trigger=trigger)
        except Exception as exc:  # pragma: no cover — defensive
            log.warning("intent_classifier scheduler failure: %s: %s",
                        type(exc).__name__, exc)

    loop.create_task(_guarded())


# ────────────────────────────────────────────────────────────────
# ADMIN SUMMARY
# ────────────────────────────────────────────────────────────────

async def summarize(
    db, *, env: Optional[str] = None, days: int = 30,
) -> Dict[str, Any]:
    """Aggregate summary of shadow decisions for the admin console."""
    target_env = env or current_env()
    since = datetime.now(timezone.utc) - timedelta(days=max(1, int(days)))
    scope = {"env": target_env, "created_at": {"$gte": since}}

    total = await db.intent_classifications_shadow.count_documents(scope)

    async def _group(field: str) -> Dict[str, int]:
        pipe = [
            {"$match": scope},
            {"$group": {"_id": f"${field}", "n": {"$sum": 1}}},
        ]
        return {row["_id"] or "unknown": int(row["n"])
                async for row in db.intent_classifications_shadow.aggregate(pipe)}

    by_intent = await _group("purchase_intent_band")
    by_mode = await _group("shopping_mode.label")

    # Average confidence + followup-yes rate.
    avg_pipe = [
        {"$match": scope},
        {"$group": {
            "_id": None,
            "avg_intent_score": {"$avg": "$purchase_intent.score"},
            "avg_intent_conf": {"$avg": "$purchase_intent.confidence"},
            "avg_mode_conf": {"$avg": "$shopping_mode.confidence"},
            "avg_followup_yes": {"$avg": "$followup_value.yes_probability"},
        }},
    ]
    agg = await db.intent_classifications_shadow.aggregate(avg_pipe).to_list(1)
    avg = agg[0] if agg else {}

    return {
        "enabled": is_enabled(),
        "env": target_env,
        "window_days": int(days),
        "total_decisions": total,
        "by_purchase_intent_band": by_intent,
        "by_shopping_mode": by_mode,
        "avg_purchase_intent_score": round(float(avg.get("avg_intent_score") or 0), 3),
        "avg_purchase_intent_confidence": round(float(avg.get("avg_intent_conf") or 0), 3),
        "avg_shopping_mode_confidence": round(float(avg.get("avg_mode_conf") or 0), 3),
        "avg_followup_yes_probability": round(float(avg.get("avg_followup_yes") or 0), 3),
        "shadow_mode": True,
        "note": "Shadow-mode only. Decisions are not used for merchandising, "
                "pricing, checkout, inventory, orders, or customer-facing emails. "
                "`purchase_intent` stores the RAW TypeSafe Score; "
                "`purchase_intent_band` is a PHILEON-side derived readable band.",
    }


# ────────────────────────────────────────────────────────────────
# INDEXES
# ────────────────────────────────────────────────────────────────

async def ensure_indexes(db) -> None:
    """Idempotent index creation for the shadow classification store."""
    async def _try(create):
        try:
            await create()
        except Exception:
            pass

    await _try(lambda: db.intent_classifications_shadow.create_index(
        [("env", 1), ("created_at", -1)],
        name="ics_env_created"))
    await _try(lambda: db.intent_classifications_shadow.create_index(
        [("session_id", 1), ("created_at", -1)],
        name="ics_session_created"))
    # 90-day TTL — shadow evaluation data only.
    await _try(lambda: db.intent_classifications_shadow.create_index(
        "created_at", name="ics_ttl",
        expireAfterSeconds=60 * 60 * 24 * 90))

    # Cooldown collection — one row per (env, session_id) with rolling
    # ``last_sampled_at``. TTL keeps it self-pruning; no PII stored.
    await _try(lambda: db.intent_classifier_cooldown.create_index(
        "last_sampled_at", name="icc_ttl",
        expireAfterSeconds=60 * 60 * 24))  # 24h retention
