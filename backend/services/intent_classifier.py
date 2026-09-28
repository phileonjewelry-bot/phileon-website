"""PHILEON — Jev / TypeSafe shopping-intent classifier (SHADOW MODE ONLY).

Locked invariants preserved:
    * NO customer-facing side effects. This module NEVER triggers an email,
      changes merchandising, mutates checkout / pricing / inventory / orders,
      or reveals classifications to the customer.
    * Fail-closed activation gate: if `TYPESAFE_API_KEY` is blank the
      shadow classifier is disabled. Owner sets the value to activate.
    * Uses `EMERGENT_LLM_KEY` for the actual Jev proxy call (per the Jev
      universal-key playbook). `TYPESAFE_API_KEY` is the owner activation
      switch — not the wire secret.
    * Input state is limited to CONSENT-SAFE aggregate signals
      (`behavior_events` for a session in the current server env).
    * Persisted decisions live in `intent_classifications_shadow` for
      evaluation only. Never joined back to marketing or checkout code.
    * Never persists PII beyond `customer_email` if the caller supplied
      a server-trusted one (aligns with Layer 7 identity rules).
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
# JEV CLIENT — Universal key transport (per playbook)
# ────────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_jev_client():
    """Reusable async Jev client. Cached per process."""
    from typesafe_sdk import AsyncTypeSafeClient, RetryPolicy  # type: ignore

    emergent_key = os.environ.get("EMERGENT_LLM_KEY")
    if not emergent_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing — cannot reach Jev proxy.")
    proxy = (
        os.getenv("INTEGRATION_PROXY_URL")
        or os.getenv("integration_proxy_url")
        or "https://integrations.emergentagent.com"
    ).rstrip("/")
    return AsyncTypeSafeClient(
        api_key=emergent_key,
        base_url=f"{proxy}/llm/typesafe",
        retry=RetryPolicy(max_retries=2, respect_retry_after=False),
    )


async def aclose() -> None:
    """Close the cached Jev client on shutdown."""
    try:
        client = _get_jev_client.__wrapped__() if hasattr(_get_jev_client, "__wrapped__") else None
        # lru_cache does not expose the cached value; construct once via cached call.
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


async def build_session_state(db, *, session_id: str) -> Optional[Dict[str, Any]]:
    """Aggregate a session's consent-safe behavioral signals into a
    compact JSON state for Jev. Returns ``None`` when there is not
    enough signal (fewer than 1 event) — the caller should skip.

    Never reads customer_email. Never reads IP. Never leaves the current
    server environment.
    """
    if not session_id:
        return None
    env = current_env()
    since = datetime.now(timezone.utc) - _SIGNAL_WINDOW
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

    # Latest event timestamp — recency signal.
    latest = await db.behavior_events.find(scope, {"created_at": 1}) \
        .sort("created_at", -1).limit(1).to_list(1)
    latest_at = latest[0]["created_at"].isoformat() if latest else None

    # Recent search queries (top 5 within window) — normalized only.
    search_scope = {"session_id": session_id, "env": env,
                    "created_at": {"$gte": since}}
    search_terms: list = []
    try:
        async for row in db.search_events.find(
                search_scope, {"normalized_query": 1, "result_count": 1}) \
                .sort("created_at", -1).limit(5):
            search_terms.append({
                "query": (row.get("normalized_query") or "")[:60],
                "result_count": int(row.get("result_count") or 0),
            })
    except Exception:
        pass

    # Custom-piece interest — presence of an inquiries or consultations
    # row for this session_id within the same window (bounded scan).
    custom_interest = 0
    try:
        custom_interest = await db.inquiries.count_documents({
            "session_id": session_id,
            "created_at": {"$gte": since},
        })
    except Exception:
        pass

    return {
        "window_hours": int(_SIGNAL_WINDOW.total_seconds() // 3600),
        "counts": {
            "product_viewed":   counts.get("PRODUCT_VIEWED", 0),
            "product_liked":    counts.get("PRODUCT_LIKED", 0),
            "product_unliked":  counts.get("PRODUCT_UNLIKED", 0),
            "added_to_cart":    counts.get("ADDED_TO_CART", 0),
            "removed_from_cart": counts.get("REMOVED_FROM_CART", 0),
            "checkout_started": counts.get("CHECKOUT_STARTED", 0),
        },
        "distinct_products": {
            "viewed":   distinct.get("PRODUCT_VIEWED", []),
            "liked":    distinct.get("PRODUCT_LIKED", []),
            "carted":   distinct.get("ADDED_TO_CART", []),
        },
        "repeat_view_ratio": repeat_view_ratio,
        "custom_inquiry_count": int(custom_interest or 0),
        "recent_searches": search_terms,
        "latest_event_at": latest_at,
        "total_events": min(total, _MAX_EVENTS_IN_STATE),
    }


# ────────────────────────────────────────────────────────────────
# QUESTION SCHEMA — three typed decisions
# ────────────────────────────────────────────────────────────────

_INTENT_CRITERIA = ["LOW", "MEDIUM", "HIGH"]

_MODE_CRITERIA = {
    "BROWSING":         "Casually looking at products with no strong signals.",
    "PRODUCT_RESEARCH": "Comparing multiple products, repeat views, deliberate exploration.",
    "READY_TO_BUY":     "Cart activity or checkout started, focused on one or two products.",
    "CUSTOM":           "Interested in a bespoke or custom piece (inquiry/consultation signals).",
    "GIFT":             "Signals suggest gift-shopping: broad category browsing, wishlist-heavy, wide price range.",
}


def _build_questions():
    from typesafe_sdk import Choice, Noul, Score  # type: ignore
    return {
        "purchase_intent": Score(
            instructions=(
                "Given the session's aggregate shopping signals, rate the "
                "customer's overall likelihood to purchase from PHILEON "
                "within the next few days."
            ),
            criteria=_INTENT_CRITERIA,
        ),
        "shopping_mode": Choice(
            instructions=(
                "Which shopping mode best describes this session? Pick the "
                "single mode that fits the signals best."
            ),
            criteria=_MODE_CRITERIA,
        ),
        "followup_value": Noul(
            instructions=(
                "Would a personalised concierge follow-up (a human touchpoint, "
                "not a marketing blast) likely add value to this customer's "
                "journey? Answer yes only if there is meaningful uncertainty "
                "on the customer side that a human could resolve."
            ),
        ),
    }


# ────────────────────────────────────────────────────────────────
# CLASSIFY + PERSIST
# ────────────────────────────────────────────────────────────────

_CONFIDENCE_STORE_KEYS = ("purchase_intent", "shopping_mode", "followup_value")


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
    intent_ans = response.scores["purchase_intent"]
    intent_level_idx = max(intent_ans.probabilities, key=intent_ans.probabilities.get)
    intent_label = intent_ans.legend[intent_level_idx]
    intent_probs = {str(k): float(v) for k, v in intent_ans.probabilities.items()}

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
        "purchase_intent": {
            "label": intent_label,
            "score": float(intent_ans.score),
            "confidence": float(intent_ans.confidence),
            "probabilities": intent_probs,
        },
        "shopping_mode": {
            "label": mode_label,
            "confidence": float(mode_ans.confidence),
            "probabilities": mode_probs,
        },
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
) -> None:
    """Detach a shadow classification as a background asyncio task.
    Only schedules if the classifier is enabled. Never awaited by the
    caller — the customer response returns immediately.
    """
    if not is_enabled():
        return
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:  # pragma: no cover — not in async context
        return
    loop.create_task(classify_session_safe(
        db, session_id=session_id, trigger=trigger))


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

    by_intent = await _group("purchase_intent.label")
    by_mode = await _group("shopping_mode.label")

    # Average confidence + followup-yes rate.
    avg_pipe = [
        {"$match": scope},
        {"$group": {
            "_id": None,
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
        "by_purchase_intent": by_intent,
        "by_shopping_mode": by_mode,
        "avg_purchase_intent_confidence": round(float(avg.get("avg_intent_conf") or 0), 3),
        "avg_shopping_mode_confidence": round(float(avg.get("avg_mode_conf") or 0), 3),
        "avg_followup_yes_probability": round(float(avg.get("avg_followup_yes") or 0), 3),
        "shadow_mode": True,
        "note": "Shadow-mode only. Decisions are not used for merchandising, "
                "pricing, checkout, inventory, orders, or customer-facing emails.",
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
