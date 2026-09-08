"""PHILEON — Aggregate Telemetry (Tier A, unconsented).

Privacy-minimised operational counters. NO visitor identity is ever
persisted here: no session_id, no cookie, no IP, no user-agent, no
fingerprint, no cross-page stitching. Rows are strictly aggregate
`$inc` counters keyed on (date, env, event_type, product_slug?).

Tier A is REPORTING ONLY. It does NOT feed:

    * behavior_events / retention_pending / behavior_send_log
    * marketing_consent / email_suppression
    * any lifecycle send eligibility (browse/wishlist/cart/checkout
      abandonment, welcome, post-purchase, winback)

The consented Layer-7 analytics pipeline is Tier B and remains
unchanged.
"""
from __future__ import annotations

import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional


AGGREGATE_EVENT_TYPES = {
    "PDP_VIEW_COUNT",
    "PRODUCT_LIKE_COUNT",
    "ADD_TO_CART_COUNT",
    "CHECKOUT_START_COUNT",
    "SEARCH_COUNT",
    "ZERO_RESULT_SEARCH_COUNT",
}

# Allow-list of dimension buckets for search result-count reporting.
# Never accept arbitrary numbers from the client.
_RESULT_COUNT_BUCKETS = {"none", "few", "many"}


def bucket_result_count(n: Optional[int]) -> str:
    """Coerce a raw result_count into a coarse bucket. Discards precise
    numbers so aggregate rows carry only a coarse dimension."""
    if n is None:
        return "none"
    try:
        n_ = int(n)
    except Exception:
        return "none"
    if n_ <= 0:
        return "none"
    if n_ < 5:
        return "few"
    return "many"


def _current_env() -> str:
    v = (os.environ.get("PHILEON_ENV") or "").strip().lower()
    return v if v in {"production", "preview", "test"} else "preview"


def _today_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,80}$")


def _valid_slug(slug: Optional[str]) -> bool:
    """Cheap shape check. Deeper validation against the approved
    catalog happens in the route (Depends on backend product store).
    Slugs that fail the shape check are dropped to prevent creating
    catalog authority from client input."""
    if not slug:
        return False
    return bool(_SLUG_RE.match(slug))


async def increment(db, *, event_type: str,
                    product_slug: Optional[str] = None,
                    result_bucket: Optional[str] = None) -> Dict[str, Any]:
    """Atomically increment a single aggregate counter."""
    if event_type not in AGGREGATE_EVENT_TYPES:
        raise ValueError(f"unknown event_type: {event_type}")
    env = _current_env()
    date = _today_utc()

    # Normalise slug — untrusted client string is dropped if it fails
    # the shape check. The catalog-membership check happens upstream.
    slug = product_slug if _valid_slug(product_slug) else None

    key: Dict[str, Any] = {
        "date": date, "env": env, "event_type": event_type,
        "product_slug": slug,
    }
    # SEARCH_COUNT / ZERO_RESULT_SEARCH_COUNT may carry a coarse
    # result-count bucket (never a query string).
    if event_type in ("SEARCH_COUNT", "ZERO_RESULT_SEARCH_COUNT") \
            and result_bucket in _RESULT_COUNT_BUCKETS:
        key["result_bucket"] = result_bucket
    else:
        key["result_bucket"] = None

    await db.aggregate_telemetry_daily.update_one(
        key,
        {"$inc": {"count": 1},
         "$setOnInsert": {"created_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    return {"ok": True, "env": env, "event_type": event_type,
            "product_slug": slug, "result_bucket": key["result_bucket"]}


async def ensure_indexes(db) -> None:
    try:
        await db.aggregate_telemetry_daily.create_index(
            [("date", 1), ("env", 1), ("event_type", 1),
             ("product_slug", 1), ("result_bucket", 1)],
            unique=True, name="agg_key_uniq")
    except Exception:
        pass
    try:
        await db.aggregate_telemetry_daily.create_index(
            [("env", 1), ("date", -1)], name="agg_env_date")
    except Exception:
        pass


async def summarize(db, *, env: str, days: int = 30) -> Dict[str, Any]:
    """Return event-type totals + top slugs, aggregated over the last
    ``days`` days for ``env``. Owner-only."""
    from datetime import timedelta
    end = datetime.now(timezone.utc).date()
    start = end - timedelta(days=days)
    start_s = start.strftime("%Y-%m-%d")
    end_s = end.strftime("%Y-%m-%d")

    totals_pipe = [
        {"$match": {"env": env,
                    "date": {"$gte": start_s, "$lte": end_s}}},
        {"$group": {"_id": "$event_type", "count": {"$sum": "$count"}}},
    ]
    totals = {r["_id"]: r["count"]
              async for r in db.aggregate_telemetry_daily.aggregate(totals_pipe)}

    slugs_pipe = [
        {"$match": {"env": env,
                    "date": {"$gte": start_s, "$lte": end_s},
                    "event_type": "PDP_VIEW_COUNT",
                    "product_slug": {"$ne": None}}},
        {"$group": {"_id": "$product_slug", "count": {"$sum": "$count"}}},
        {"$sort": {"count": -1}}, {"$limit": 25},
    ]
    top_slugs = [{"product_slug": r["_id"], "count": r["count"]}
                 async for r in db.aggregate_telemetry_daily.aggregate(slugs_pipe)]

    return {
        "env": env,
        "range": {"start": start_s, "end": end_s},
        "totals": {
            "PDP_VIEW_COUNT": totals.get("PDP_VIEW_COUNT", 0),
            "PRODUCT_LIKE_COUNT": totals.get("PRODUCT_LIKE_COUNT", 0),
            "ADD_TO_CART_COUNT": totals.get("ADD_TO_CART_COUNT", 0),
            "CHECKOUT_START_COUNT": totals.get("CHECKOUT_START_COUNT", 0),
            "SEARCH_COUNT": totals.get("SEARCH_COUNT", 0),
            "ZERO_RESULT_SEARCH_COUNT":
                totals.get("ZERO_RESULT_SEARCH_COUNT", 0),
        },
        "top_slugs": top_slugs,
        "note": "TOTAL AGGREGATE ACTIVITY — not unique visitors, not "
                "unique sessions, not a connected funnel. No visitor "
                "identity is stored.",
    }
