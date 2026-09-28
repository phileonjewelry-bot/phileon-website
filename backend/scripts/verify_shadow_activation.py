"""PHILEON — Jev shadow-activation verification harness.

Runs the nine synthetic archetypes through the real TypeSafe/Jev
classifier and records outputs + latency. MEASUREMENT ONLY — does not
tune prompts, criteria, thresholds, or classifier code.

Safety:
    * Never prints or logs TYPESAFE_API_KEY.
    * Never surfaces the key via repr, headers, or SDK internals.
    * Uses PHILEON_ENV=test to isolate from production analytics.
    * Cleans up seeded fixtures after each run.
"""
from __future__ import annotations

import asyncio
import json
import os
import time
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

# Isolate to test env so archetype rows never touch production analytics.
os.environ["PHILEON_ENV"] = "test"

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
from services import intent_classifier as IC  # noqa: E402

# Same archetypes as the test suite. Kept in sync manually — DO NOT
# modify to influence outcomes.
ARCHETYPES = [
    ("casual_browser",       [("PRODUCT_VIEWED", "signet-a"),
                              ("PRODUCT_VIEWED", "signet-a")], None, 0),
    ("repeat_researcher",    [("PRODUCT_VIEWED", "veyron-noir")] * 3 +
                             [("PRODUCT_VIEWED", "gent")] * 2, None, 0),
    ("search_heavy",         [("PRODUCT_VIEWED", "veyron-noir"),
                              ("PRODUCT_VIEWED", "gent")],
     [("signet ring", 4), ("gold band", 5), ("eternity", 2),
      ("mens ring", 3), ("architectural", 2)], 0),
    ("wishlist_shopper",     [("PRODUCT_VIEWED", "boss-knot"),
                              ("PRODUCT_LIKED",  "boss-knot"),
                              ("PRODUCT_LIKED",  "rose-of-sharon"),
                              ("PRODUCT_LIKED",  "coogi-dna-tag")], None, 0),
    ("cart_shopper",         [("PRODUCT_VIEWED", "veyron-noir"),
                              ("ADDED_TO_CART",  "veyron-noir")], None, 0),
    ("checkout_started",     [("PRODUCT_VIEWED", "veyron-noir"),
                              ("ADDED_TO_CART",  "veyron-noir"),
                              ("CHECKOUT_STARTED", "veyron-noir")], None, 0),
    ("custom_prospect",      [("PRODUCT_VIEWED", "iv-atelier-1"),
                              ("PRODUCT_VIEWED", "iv-atelier-1"),
                              ("PRODUCT_VIEWED", "iv-atelier-2")], None, 1),
    ("gift_shopper",         [("PRODUCT_VIEWED", "boss-knot"),
                              ("PRODUCT_VIEWED", "rose-of-sharon"),
                              ("PRODUCT_VIEWED", "battenti-della-villa"),
                              ("PRODUCT_VIEWED", "stackrats"),
                              ("PRODUCT_LIKED",  "rose-of-sharon")], None, 0),
    ("ambiguous",            [("PRODUCT_VIEWED", "signet-a"),
                              ("PRODUCT_UNLIKED", "signet-a"),
                              ("REMOVED_FROM_CART", "signet-a"),
                              ("PRODUCT_VIEWED", "band-b")], None, 0),
]

# Prohibited substring guards — outbound state must never contain any
# of these strings after JSON-serialisation.
PROHIBITED_SUBSTRINGS = [
    "@",              # email fragment
    "signet ring",    # example raw-search phrase from search_heavy fixture
    "gold band", "eternity", "mens ring", "architectural",
]

# Prohibited top-level keys (belt & suspenders with allow-list).
PROHIBITED_KEYS = {
    "email", "customer_email", "name", "phone", "address", "shipping",
    "billing", "ip", "user_agent", "fingerprint", "payment", "card",
    "stripe_customer_id", "stripe_session_id", "stripe_payment_intent_id",
    "order_id", "order_number", "customer_id", "account_id",
    "session_id", "raw_query", "recent_searches", "normalized_query",
}


async def _seed(db, sid, events, searches, inquiries):
    now = datetime.now(timezone.utc)
    if events:
        await db.behavior_events.insert_many([
            {"event_type": et, "product_slug": slug,
             "session_id": sid, "env": "test", "created_at": now}
            for et, slug in events
        ])
    if searches:
        await db.search_events.insert_many([
            {"normalized_query": q, "result_count": rc,
             "session_id": sid, "env": "test", "created_at": now}
            for q, rc in searches
        ])
    for _ in range(inquiries):
        await db.inquiries.insert_one({
            "session_id": sid, "created_at": now, "env": "test"})


async def _cleanup(db, sid):
    await db.behavior_events.delete_many({"session_id": sid})
    await db.search_events.delete_many({"session_id": sid})
    await db.inquiries.delete_many({"session_id": sid})
    # Also clean the cooldown row so re-runs are idempotent.
    await db.intent_classifier_cooldown.delete_one({"_id": f"test:{sid}"})


def _flatten_keys(obj):
    out = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            out.add(str(k).lower())
            out |= _flatten_keys(v)
    elif isinstance(obj, (list, tuple)):
        for it in obj:
            out |= _flatten_keys(it)
    return out


async def main():
    print(f"is_enabled = {IC.is_enabled()}")
    if not IC.is_enabled():
        print("ABORT — classifier not enabled")
        return

    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]

    # Ensure indexes exist (idempotent).
    await IC.ensure_indexes(db)

    results = []
    latencies = []
    errors = 0

    for name, events, searches, inquiries in ARCHETYPES:
        sid = f"shadow-verify-{name}-{uuid.uuid4().hex[:8]}"
        await _seed(db, sid, events, searches, inquiries)

        # Capture the outbound state BEFORE the Jev call so we can audit
        # exactly what would be sent.
        outbound = await IC.build_session_state(db, session_id=sid)
        outbound_keys = _flatten_keys(outbound or {})
        outbound_blob = json.dumps(outbound or {})
        forbidden_hits = [k for k in PROHIBITED_KEYS if k in outbound_keys]
        substring_hits = [s for s in PROHIBITED_SUBSTRINGS
                          if s.lower() in outbound_blob.lower()]

        t0 = time.perf_counter()
        try:
            out = await IC.classify_session(
                db, session_id=sid, trigger=f"verify:{name}")
            latency_ms = (time.perf_counter() - t0) * 1000
            ok = bool(out.get("ok"))
            if not ok:
                errors += 1
        except Exception as exc:  # pragma: no cover
            latency_ms = (time.perf_counter() - t0) * 1000
            out = {"ok": False, "reason": f"exception:{type(exc).__name__}"}
            errors += 1

        if out.get("ok"):
            latencies.append(latency_ms)

        results.append({
            "archetype": name,
            "success": bool(out.get("ok")),
            "skipped_reason": out.get("reason"),
            "latency_ms": round(latency_ms, 1),
            "outbound_keys": sorted(outbound_keys),
            "prohibited_key_hits": forbidden_hits,
            "prohibited_substring_hits": substring_hits,
            "purchase_intent": out.get("purchase_intent"),
            "purchase_intent_band": out.get("purchase_intent_band"),
            "shopping_mode": out.get("shopping_mode"),
            "followup_value": out.get("followup_value"),
        })

        await _cleanup(db, sid)

    # Aggregate stats.
    n_ok = sum(1 for r in results if r["success"])
    n_total = len(results)
    avg = round(sum(latencies) / len(latencies), 1) if latencies else None
    mx = round(max(latencies), 1) if latencies else None

    report = {
        "n_requests_total": n_total,
        "n_requests_ok": n_ok,
        "n_errors": errors,
        "avg_latency_ms": avg,
        "max_latency_ms": mx,
        "results": results,
    }
    print(json.dumps(report, indent=2, default=str))
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
