"""PHILEON — Layer 7 Analytics Baseline.

Read-only aggregation across the existing authoritative collections.
No new event authority. No fabrication of financial truth. No PII
duplication. All metrics are labelled with a deterministic definition
(see :data:`KPI_DEFINITIONS`).

KEY INVARIANTS
==============

* Server-authoritative environment (`PHILEON_ENV`). The browser can
  never assert `env=production` and contaminate production analytics.
* `chargeback_lost` is reported **separately** from `refunded`
  (Layer 4 semantic lock).
* `paid orders` derives ONLY from `orders_v2.payment_status == "paid"`
  — never inferred from client events.
* Client-observed funnel stages (VIEW · LIKE · ADD · CHECKOUT_STARTED)
  are labelled CLIENT-OBSERVED. Server-authoritative stages
  (CHECKOUT_SESSION_CREATED · PAID) are labelled accordingly.
* Vault (`iv-*`) items are reported alongside `made_to_order` items
  but their inventory truth remains Layer 5's `inventory` collection.
* No PII is stored on analytics events beyond what
  `services/retention_service.py` already writes (`customer_email`
  only appears once an identity is server-trusted).
* No IP address is persisted. No fingerprinting. No third-party vendor.
"""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple
import os
import re


# ─── Environment authority ────────────────────────────────────────

_VALID_ENVS = {"production", "preview", "test"}


def current_env() -> str:
    """Server-authoritative environment. Fail-safe defaults to
    ``preview`` — an unconfigured server can never contaminate
    production analytics."""
    v = (os.environ.get("PHILEON_ENV") or "").strip().lower()
    return v if v in _VALID_ENVS else "preview"


def sanitize_env(requested: Optional[str]) -> str:
    """Admin may pass ``?env=production|preview|test``. Fall back to
    the current server environment if the query is missing or invalid."""
    if requested is None:
        return current_env()
    v = str(requested).strip().lower()
    return v if v in _VALID_ENVS else current_env()


# ─── Period parsing ───────────────────────────────────────────────

def parse_period(period: Optional[str]) -> Tuple[datetime, datetime, str]:
    """Return (start_utc, end_utc, canonical_label)."""
    now = datetime.now(timezone.utc)
    p = (period or "30d").strip().lower()
    end = now
    if p == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return start, end, "today"
    if p == "7d":
        return now - timedelta(days=7), end, "7d"
    if p == "30d":
        return now - timedelta(days=30), end, "30d"
    if p == "90d":
        return now - timedelta(days=90), end, "90d"
    if p == "all":
        return datetime(2020, 1, 1, tzinfo=timezone.utc), end, "all"
    # Fallback to 30d — never raise; analytics must degrade gracefully.
    return now - timedelta(days=30), end, "30d"


# ─── Bot / synthetic exclusion ────────────────────────────────────

_SYNTHETIC_SESSION_PREFIXES = (
    "phase10-", "phase-10.", "layer-7-test", "l7-",
    "synthetic-", "test-fixture-", "regression-",
)


def _synthetic_filter(field: str = "session_id") -> Dict[str, Any]:
    """Return a Mongo filter clause that excludes obvious synthetic
    fixture sessions. Deliberately conservative — never excludes real
    customer traffic based on weak heuristics (§27)."""
    return {field: {"$not": {"$regex": r"^(?:"
                              + "|".join(re.escape(p)
                                         for p in _SYNTHETIC_SESSION_PREFIXES)
                              + ")"}}}


# ─── KPI dictionary — every metric has one deterministic definition ─

KPI_DEFINITIONS: Dict[str, str] = {
    "PRODUCT_VIEWED":
        "CLIENT-OBSERVED · behavior_events.event_type='PRODUCT_VIEWED' "
        "· server-stamped env · 30-second same-(session,slug) dedupe.",
    "ADDED_TO_CART":
        "CLIENT-OBSERVED · behavior_events.event_type='ADDED_TO_CART' "
        "· fires only on a successful cart-add action.",
    "CHECKOUT_STARTED":
        "CLIENT-OBSERVED · behavior_events.event_type='CHECKOUT_STARTED' "
        "· fires only when the customer intentionally initiates checkout.",
    "CHECKOUT_SESSION_CREATED":
        "SERVER-AUTHORITATIVE · orders_v2 documents where "
        "stripe_checkout_session_id is set · counted by created_at.",
    "PAID_ORDER":
        "SERVER-AUTHORITATIVE · orders_v2.payment_status='paid' · "
        "counted by paid_at (falls back to updated_at).",
    "REFUND_CONFIRMED":
        "SERVER-AUTHORITATIVE · returns.refund_confirmed_at.",
    "CHARGEBACK_LOST":
        "SERVER-AUTHORITATIVE · orders_v2.payment_status='chargeback_lost' "
        "· distinct from refunded (Layer 4 semantic lock).",
    "CANONICAL_REVENUE":
        "SERVER-AUTHORITATIVE · sum of orders_v2.total_cents where "
        "payment_status='paid' · canonical USD source of truth.",
    "PRESENTMENT_REVENUE":
        "REPORTING · sum of orders_v2.presentment.presentment_total_cents "
        "grouped by presentment_currency · derived from Stripe at time of "
        "sale · NEVER recomputed with Frankfurter.",
    "CONVERSION_RATE_SESSION":
        "PAID_ORDER unique sessions ÷ PRODUCT_VIEWED unique sessions · "
        "session-level denominator only (not people).",
    "SEARCH_SUBMITTED":
        "CLIENT-OBSERVED · search_events row · normalized query "
        "(≤80 char, sanitized) + result_count.",
    "ZERO_RESULT_SEARCH":
        "search_events where result_count=0.",
}


# ─── Overview ─────────────────────────────────────────────────────

async def build_overview(db, *, env: str, period: str) -> Dict[str, Any]:
    start, end, label = parse_period(period)

    # Client-observed counts (funnel) — filtered to env + non-synthetic.
    async def _count(event_type: str) -> Dict[str, int]:
        q = {
            "event_type": event_type,
            "env": env,
            "created_at": {"$gte": start, "$lte": end},
            **_synthetic_filter("session_id"),
        }
        total = await db.behavior_events.count_documents(q)
        # Unique sessions — a single scan (bounded by env + date).
        pipeline = [
            {"$match": q},
            {"$group": {"_id": "$session_id"}},
            {"$count": "sessions"},
        ]
        agg = await db.behavior_events.aggregate(pipeline).to_list(1)
        unique_sessions = (agg[0]["sessions"] if agg else 0)
        return {"total": total, "unique_sessions": unique_sessions}

    views = await _count("PRODUCT_VIEWED")
    likes = await _count("PRODUCT_LIKED")
    adds = await _count("ADDED_TO_CART")
    checkout_starts = await _count("CHECKOUT_STARTED")

    # Server-authoritative counts.
    orders_scope = {"env": env, "created_at": {"$gte": start, "$lte": end}}
    session_created = await db.orders_v2.count_documents({
        **orders_scope,
        "stripe_checkout_session_id": {"$exists": True, "$ne": None},
    })
    paid_scope = {**orders_scope, "payment_status": "paid"}
    paid_orders = await db.orders_v2.count_documents(paid_scope)
    chargeback_scope = {**orders_scope, "payment_status": "chargeback_lost"}
    chargeback_lost = await db.orders_v2.count_documents(chargeback_scope)

    # Canonical revenue — sum of total_cents where paid.
    rev_pipe = [
        {"$match": paid_scope},
        {"$group": {"_id": None,
                    "cents": {"$sum": "$total_cents"},
                    "shipping": {"$sum": "$shipping_cents"}}},
    ]
    agg = await db.orders_v2.aggregate(rev_pipe).to_list(1)
    canonical_revenue_cents = (agg[0]["cents"] if agg else 0) or 0
    shipping_collected_cents = (agg[0]["shipping"] if agg else 0) or 0

    # Refunds — from returns.refund_confirmed_at.
    refund_pipe = [
        {"$match": {"env": env,
                    "refund_confirmed_at": {"$gte": start, "$lte": end}}},
        {"$group": {"_id": None,
                    "count": {"$sum": 1},
                    "cents": {"$sum": {"$ifNull": ["$refund_amount_cents", 0]}}}},
    ]
    agg = await db.returns.aggregate(refund_pipe).to_list(1)
    refunds_count = (agg[0]["count"] if agg else 0)
    refunds_cents = (agg[0]["cents"] if agg else 0) or 0

    # Directional net (owner ballpark — not accounting-grade).
    directional_net_cents = int(canonical_revenue_cents - refunds_cents)

    # Concierge + RMA ops counts for the overview strip.
    new_concierge = await db.concierge_cases.count_documents({
        "created_at": {"$gte": start, "$lte": end}})
    new_rma = await db.returns.count_documents({
        "env": env, "created_at": {"$gte": start, "$lte": end}})

    return {
        "env": env,
        "period": label,
        "range": {"start": start.isoformat(), "end": end.isoformat()},
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "client_observed": {
            "product_viewed":   views,
            "product_liked":    likes,
            "added_to_cart":    adds,
            "checkout_started": checkout_starts,
        },
        "server_authoritative": {
            "checkout_session_created": session_created,
            "paid_orders": paid_orders,
            "chargeback_lost": chargeback_lost,
            "canonical_revenue_cents": canonical_revenue_cents,
            "canonical_currency": "USD",
            "shipping_collected_cents": shipping_collected_cents,
            "refunds_count": refunds_count,
            "refunds_cents": refunds_cents,
            "directional_net_cents": directional_net_cents,
        },
        "operations": {
            "new_concierge_cases": new_concierge,
            "new_rma": new_rma,
        },
    }


# ─── Funnel ───────────────────────────────────────────────────────

async def build_funnel(db, *, env: str, period: str) -> Dict[str, Any]:
    ov = await build_overview(db, env=env, period=period)
    c = ov["client_observed"]
    s = ov["server_authoritative"]
    steps = [
        {"stage": "PRODUCT_VIEWED",       "authority": "client",
         "count": c["product_viewed"]["total"],
         "unique_sessions": c["product_viewed"]["unique_sessions"]},
        {"stage": "ADDED_TO_CART",        "authority": "client",
         "count": c["added_to_cart"]["total"],
         "unique_sessions": c["added_to_cart"]["unique_sessions"]},
        {"stage": "CHECKOUT_STARTED",     "authority": "client",
         "count": c["checkout_started"]["total"],
         "unique_sessions": c["checkout_started"]["unique_sessions"]},
        {"stage": "CHECKOUT_SESSION_CREATED", "authority": "server",
         "count": s["checkout_session_created"]},
        {"stage": "PAID_ORDER",           "authority": "server",
         "count": s["paid_orders"],
         "canonical_revenue_cents": s["canonical_revenue_cents"]},
    ]
    # Conversion rate — session-level only (not people).
    denom_sessions = c["product_viewed"]["unique_sessions"]
    conv = None
    if denom_sessions > 0:
        conv = round((s["paid_orders"] / denom_sessions) * 1000) / 1000
    return {
        "env": env, "period": ov["period"],
        "range": ov["range"],
        "steps": steps,
        "conversion_rate_paid_over_view_sessions": conv,
        "denominator_note": "PAID orders ÷ unique sessions that viewed a PDP.",
    }


# ─── Products ─────────────────────────────────────────────────────

async def build_products(db, *, env: str, period: str,
                         limit: int = 50) -> Dict[str, Any]:
    start, end, label = parse_period(period)

    async def _by_slug(event_type: str) -> Dict[str, int]:
        pipe = [
            {"$match": {
                "event_type": event_type, "env": env,
                "created_at": {"$gte": start, "$lte": end},
                **_synthetic_filter("session_id"),
            }},
            {"$group": {"_id": "$product_slug", "n": {"$sum": 1}}},
        ]
        return {row["_id"]: row["n"]
                async for row in db.behavior_events.aggregate(pipe)}

    views = await _by_slug("PRODUCT_VIEWED")
    likes = await _by_slug("PRODUCT_LIKED")
    adds = await _by_slug("ADDED_TO_CART")
    starts = await _by_slug("CHECKOUT_STARTED")

    # Paid orders per slug — from orders_v2 items[].product_slug.
    paid_pipe = [
        {"$match": {"env": env, "payment_status": "paid",
                    "created_at": {"$gte": start, "$lte": end}}},
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.product_slug",
                    "orders": {"$sum": 1},
                    "revenue_cents": {"$sum": "$items.unit_amount_cents"}}},
    ]
    paid = {row["_id"]: {"orders": row["orders"],
                         "revenue_cents": row.get("revenue_cents") or 0}
            async for row in db.orders_v2.aggregate(paid_pipe)}

    slugs = set().union(views, likes, adds, starts, paid.keys())
    rows: List[Dict[str, Any]] = []
    for slug in slugs:
        rows.append({
            "product_slug": slug,
            "is_vault": bool(slug and slug.startswith("iv-")),
            "views": views.get(slug, 0),
            "likes": likes.get(slug, 0),
            "adds":  adds.get(slug, 0),
            "checkout_starts": starts.get(slug, 0),
            "paid_orders": (paid.get(slug) or {}).get("orders", 0),
            "revenue_cents": (paid.get(slug) or {}).get("revenue_cents", 0),
        })
    rows.sort(key=lambda r: (r["paid_orders"], r["views"]), reverse=True)
    return {
        "env": env, "period": label,
        "range": {"start": start.isoformat(), "end": end.isoformat()},
        "products": rows[:limit],
        "note": "Owner-only. Never surface these counts publicly. "
                "PAID authoritative from orders_v2; earlier stages "
                "client-observed.",
    }


# ─── Countries + Currencies ───────────────────────────────────────

async def build_currencies(db, *, env: str, period: str) -> Dict[str, Any]:
    start, end, _ = parse_period(period)
    paid = {"env": env, "payment_status": "paid",
            "created_at": {"$gte": start, "$lte": end}}

    countries_pipe = [
        {"$match": paid},
        {"$group": {"_id": "$shipping.country",
                    "orders": {"$sum": 1},
                    "cents": {"$sum": "$total_cents"}}},
        {"$sort": {"orders": -1}},
    ]
    countries = [{"country": r["_id"] or "unknown",
                  "paid_orders": r["orders"],
                  "canonical_revenue_cents": r["cents"] or 0}
                 async for r in db.orders_v2.aggregate(countries_pipe)]

    presentment_pipe = [
        {"$match": paid},
        {"$group": {"_id": "$presentment.presentment_currency",
                    "orders": {"$sum": 1},
                    "presentment_cents": {"$sum":
                        {"$ifNull": ["$presentment.presentment_total_cents", 0]}}}},
        {"$sort": {"orders": -1}},
    ]
    presentment = [{"presentment_currency": r["_id"] or "USD",
                    "paid_orders": r["orders"],
                    "presentment_total_cents": r["presentment_cents"] or 0}
                   async for r in db.orders_v2.aggregate(presentment_pipe)]

    return {
        "env": env,
        "canonical_currency": "USD",
        "countries": countries,
        "presentment": presentment,
        "note": "Canonical revenue is USD. Presentment values are what "
                "Stripe charged in the customer's local currency at time "
                "of sale. Display currency (Frankfurter) is NEVER used to "
                "back-fill historical values.",
    }


# ─── Lifecycle ────────────────────────────────────────────────────

async def build_lifecycle(db, *, env: str, period: str) -> Dict[str, Any]:
    start, end, _ = parse_period(period)
    behavioral_live = str(os.environ.get("PHILEON_BEHAVIORAL_LIVE") or "").strip().lower() == "true"

    # Pending eligibility per kind (browse / wishlist / cart / checkout).
    pending_pipe = [
        {"$match": {"first_seen_at": {"$gte": start, "$lte": end}}},
        {"$group": {"_id": "$intent_kind", "n": {"$sum": 1}}},
    ]
    pending = {r["_id"]: r["n"]
               async for r in db.retention_pending.aggregate(pending_pipe)}

    # Send log — simulated vs live.
    sends_pipe = [
        {"$match": {"created_at": {"$gte": start, "$lte": end}}},
        {"$group": {"_id": {"mode": "$mode", "type": "$email_type"},
                    "n": {"$sum": 1}}},
    ]
    sends: Dict[str, Dict[str, int]] = {"simulated": {}, "live": {}}
    async for r in db.behavior_send_log.aggregate(sends_pipe):
        mode = r["_id"].get("mode") or "simulated"
        typ = r["_id"].get("type") or "unknown"
        sends.setdefault(mode, {})[typ] = r["n"]

    # Consent + suppression posture (headline counts only).
    consent_total = await db.marketing_consent.count_documents({})
    consent_active = await db.marketing_consent.count_documents(
        {"marketing_eligible": True,
         "marketing_unsubscribed_at": {"$in": [None, ""]}})
    suppressed = await db.email_suppression.count_documents({})

    return {
        "env": env,
        "behavioral_mode": "LIVE" if behavioral_live else "SIMULATED",
        "period_pending_eligibility": {
            "browse":   pending.get("browse", 0),
            "wishlist": pending.get("wishlist", 0),
            "cart":     pending.get("cart", 0),
            "checkout": pending.get("checkout", 0),
        },
        "period_sends": sends,
        "consent": {
            "marketing_consent_rows": consent_total,
            "marketing_consented_active": consent_active,
            "email_suppression_rows": suppressed,
        },
        "note": "PHILEON_BEHAVIORAL_LIVE controls whether sends are real. "
                "SIMULATED counts represent what would have been sent. "
                "Opens/clicks are not fabricated — reported only if the "
                "underlying provider actually persists them.",
    }


# ─── Operations ───────────────────────────────────────────────────

async def build_operations(db, *, env: str, period: str) -> Dict[str, Any]:
    start, end, _ = parse_period(period)
    scope = {"env": env, "created_at": {"$gte": start, "$lte": end}}

    # RMA metrics.
    async def _rma_count(match: Dict[str, Any]) -> int:
        return await db.returns.count_documents(match)
    rma_new = await _rma_count(scope)
    rma_approved = await _rma_count({**scope, "status": "authorized"})
    rma_denied = await _rma_count({**scope, "status": "denied"})
    rma_refund_approved = await db.returns.count_documents({
        "env": env,
        "refund_approved_at": {"$gte": start, "$lte": end}})
    rma_refund_confirmed = await db.returns.count_documents({
        "env": env,
        "refund_confirmed_at": {"$gte": start, "$lte": end}})
    reason_pipe = [
        {"$match": scope},
        {"$group": {"_id": "$reason_code", "n": {"$sum": 1}}},
    ]
    reasons = [{"reason_code": r["_id"] or "unspecified", "count": r["n"]}
               async for r in db.returns.aggregate(reason_pipe)]

    # Dispute metrics.
    disp_scope = {"created_at": {"$gte": start, "$lte": end}}
    disputes_new = await db.dispute_cases.count_documents(disp_scope)
    disputes_needs_response = await db.dispute_cases.count_documents({
        **disp_scope, "status": {"$in": ["needs_response", "under_review"]}})
    disputes_won = await db.dispute_cases.count_documents({
        **disp_scope, "status": "won"})
    chargeback_lost = await db.orders_v2.count_documents({
        "env": env, "payment_status": "chargeback_lost",
        "updated_at": {"$gte": start.isoformat(), "$lte": end.isoformat()}})

    # Fulfillment states (authoritative from orders_v2).
    ful_pipe = [
        {"$match": {"env": env, "created_at": {"$gte": start, "$lte": end}}},
        {"$group": {"_id": {"$ifNull": ["$fulfillment_status", "$fulfilment_status"]},
                    "n": {"$sum": 1}}},
    ]
    fulfillment = {r["_id"] or "unknown": r["n"]
                   async for r in db.orders_v2.aggregate(ful_pipe)}

    # Concierge metrics (Layer 6).
    con_scope = {"created_at": {"$gte": start, "$lte": end}}
    con_new = await db.concierge_cases.count_documents(con_scope)
    con_resolved = await db.concierge_cases.count_documents({
        "resolved_at": {"$gte": start, "$lte": end}})
    con_waiting = await db.concierge_cases.count_documents(
        {"status": "waiting_on_phileon"})
    con_overdue = await db.concierge_cases.count_documents({
        "status": {"$in": ["new", "open", "waiting_on_customer",
                           "waiting_on_phileon"]},
        "follow_up_at": {"$lte": datetime.now(timezone.utc)}})

    # Inventory (Layer 5) — operational snapshot.
    inv_pipe = [
        {"$group": {"_id": "$availability_mode",
                    "on_hand": {"$sum": "$stock_on_hand"},
                    "reserved": {"$sum": "$stock_reserved"},
                    "rows": {"$sum": 1}}},
    ]
    inventory = {r["_id"] or "unknown": {
        "on_hand": r["on_hand"] or 0,
        "reserved": r["reserved"] or 0,
        "rows": r["rows"] or 0,
    } async for r in db.inventory.aggregate(inv_pipe)}
    vault_sold_out = await db.inventory.count_documents({
        "availability_mode": "ready_to_ship",
        "stock_on_hand": {"$lte": 0},
    })

    return {
        "env": env,
        "returns": {
            "new": rma_new, "approved": rma_approved, "denied": rma_denied,
            "refund_approved": rma_refund_approved,
            "refund_confirmed": rma_refund_confirmed,
            "reason_codes": reasons,
        },
        "disputes": {
            "new": disputes_new,
            "needs_response": disputes_needs_response,
            "won": disputes_won,
            "chargeback_lost": chargeback_lost,
        },
        "fulfillment": fulfillment,
        "concierge": {
            "new": con_new, "resolved": con_resolved,
            "waiting_on_phileon": con_waiting,
            "overdue_follow_ups": con_overdue,
        },
        "inventory": {
            "by_availability_mode": inventory,
            "vault_sold_out": vault_sold_out,
        },
        "note": "Returns · Disputes · Inventory · Concierge counts are "
                "operational only. Chargeback losses are counted "
                "separately from refunds.",
    }


# ─── Search ───────────────────────────────────────────────────────

_SEARCH_QUERY_MAX = 80


def sanitize_search_query(q: str) -> str:
    """Trim + collapse whitespace + strip control chars + lowercase."""
    if not q:
        return ""
    # Remove control characters (< 0x20 + DEL).
    cleaned = "".join(c for c in q if ord(c) >= 32 and c != "\x7f")
    cleaned = re.sub(r"\s+", " ", cleaned).strip().lower()
    return cleaned[:_SEARCH_QUERY_MAX]


async def record_search(db, *, query: str, result_count: int,
                        session_id: str) -> Dict[str, Any]:
    """Layer 7 first-party SEARCH_SUBMITTED. Never persists raw
    unlimited text. Never persists IP or fingerprint."""
    normalized = sanitize_search_query(query)
    if not normalized:
        return {"skipped": True, "reason": "empty"}
    doc = {
        "normalized_query": normalized,
        "result_count": max(0, int(result_count or 0)),
        "session_id": session_id[:128],
        "env": current_env(),
        "created_at": datetime.now(timezone.utc),
    }
    await db.search_events.insert_one(doc)
    return {"ok": True, "normalized_query": normalized}


async def top_searches(db, *, env: str, period: str,
                       limit: int = 25) -> Dict[str, Any]:
    start, end, _ = parse_period(period)
    scope = {"env": env, "created_at": {"$gte": start, "$lte": end}}
    top_pipe = [
        {"$match": scope},
        {"$group": {"_id": "$normalized_query",
                    "n": {"$sum": 1},
                    "avg_results": {"$avg": "$result_count"}}},
        {"$sort": {"n": -1}},
        {"$limit": max(1, int(limit))},
    ]
    top = [{"query": r["_id"], "count": r["n"],
            "avg_results": round(r["avg_results"] or 0, 1)}
           async for r in db.search_events.aggregate(top_pipe)]
    zero_pipe = [
        {"$match": {**scope, "result_count": 0}},
        {"$group": {"_id": "$normalized_query", "n": {"$sum": 1}}},
        {"$sort": {"n": -1}},
        {"$limit": max(1, int(limit))},
    ]
    zero = [{"query": r["_id"], "count": r["n"]}
            async for r in db.search_events.aggregate(zero_pipe)]
    total = await db.search_events.count_documents(scope)
    return {"env": env, "total_searches": total,
            "top_searches": top, "zero_result_searches": zero}


# ─── Index bootstrap ──────────────────────────────────────────────

async def ensure_indexes(db) -> None:
    """Idempotent index creation for Layer-7 analytics reads."""
    async def _try(create):
        try:
            await create()
        except Exception:
            pass

    await _try(lambda: db.behavior_events.create_index(
        [("env", 1), ("event_type", 1), ("created_at", -1)],
        name="be_env_type_created"))
    await _try(lambda: db.behavior_events.create_index(
        [("env", 1), ("event_type", 1), ("product_slug", 1),
         ("created_at", -1)],
        name="be_env_type_slug_created"))
    await _try(lambda: db.orders_v2.create_index(
        [("env", 1), ("payment_status", 1), ("created_at", -1)],
        name="ov2_env_paystatus_created"))
    await _try(lambda: db.orders_v2.create_index(
        [("env", 1), ("created_at", -1)],
        name="ov2_env_created"))
    await _try(lambda: db.search_events.create_index(
        [("env", 1), ("created_at", -1)],
        name="se_env_created"))
    await _try(lambda: db.search_events.create_index(
        [("env", 1), ("normalized_query", 1), ("created_at", -1)],
        name="se_env_query_created"))
    # 90-day TTL on search events — they are lightweight aggregate signals,
    # not authoritative order truth. Owner may adjust in Layer 8.
    await _try(lambda: db.search_events.create_index(
        "created_at", name="se_ttl",
        expireAfterSeconds=60 * 60 * 24 * 90))
