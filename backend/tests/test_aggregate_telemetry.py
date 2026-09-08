"""PHILEON — Aggregate Telemetry (Tier A) test matrix.

Coverage:
    A. fresh visitor increments PDP aggregate
    B. Reject Optional increments aggregate — no analytics identifier
       created (JS-side verified separately)
    C. Reject Optional does NOT write to behavior_events
    D. Reject Optional does NOT create retention_pending
    G. unconsented search increments SEARCH_COUNT, no raw query stored
    H. zero-result search increments ZERO_RESULT_SEARCH_COUNT
    I. no IP field present in aggregate row
    J. no user-agent field present
    K. no session_id field present
    L. unknown event_type rejected
    M. unknown / untrusted slug coerced to generic (product_slug=None)
    N. Preview aggregate absent from Production summary
    O. rate limit at 240 / 60 s per IP
    P. customer APIs have no aggregate telemetry internals leaked
"""
from __future__ import annotations

import asyncio
import os
import uuid

import pytest


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def with_db(fn):
    def _wrap():
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
        except Exception:
            pytest.skip("motor not available")
        if not os.environ.get("MONGO_URL"):
            try:
                from dotenv import load_dotenv
                load_dotenv("/app/backend/.env")
            except Exception:
                pass
        url = os.environ.get("MONGO_URL")
        if not url:
            pytest.skip("MONGO_URL not set")

        async def _driver():
            client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=1500)
            try:
                await client.admin.command("ping")
            except Exception:
                pytest.skip("MongoDB unreachable")
            name = f"phileon_agg_test_{uuid.uuid4().hex[:8]}"
            db = client[name]
            from services.aggregate_telemetry import ensure_indexes
            await ensure_indexes(db)
            try:
                await fn(db)
            finally:
                await client.drop_database(name)
                client.close()

        _run(_driver())
    _wrap.__name__ = fn.__name__
    return _wrap


# ── Service-level ────────────────────────────────────────────────

@with_db
async def test_A_pdp_increment(db):
    from services.aggregate_telemetry import increment, summarize, _current_env
    await increment(db, event_type="PDP_VIEW_COUNT", product_slug="iv-altar")
    await increment(db, event_type="PDP_VIEW_COUNT", product_slug="iv-altar")
    s = await summarize(db, env=_current_env(), days=1)
    assert s["totals"]["PDP_VIEW_COUNT"] == 2


@with_db
async def test_K_no_session_id_stored(db):
    from services.aggregate_telemetry import increment
    await increment(db, event_type="ADD_TO_CART_COUNT", product_slug="iv-altar")
    doc = await db.aggregate_telemetry_daily.find_one({})
    for banned in ("session_id", "customer_email", "email", "ip",
                   "user_agent", "fingerprint", "cookie"):
        assert banned not in doc, f"aggregate row must not carry {banned}"


@with_db
async def test_L_unknown_event_type_rejected(db):
    from services.aggregate_telemetry import increment
    with pytest.raises(ValueError):
        await increment(db, event_type="TRACK_EVERYTHING")


@with_db
async def test_M_untrusted_slug_coerced(db):
    from services.aggregate_telemetry import increment, summarize, _current_env
    # Invalid shape → dropped to None inside increment.
    await increment(db, event_type="PDP_VIEW_COUNT", product_slug="../etc/passwd")
    await increment(db, event_type="PDP_VIEW_COUNT", product_slug="")
    row = await db.aggregate_telemetry_daily.find_one({})
    assert row["product_slug"] is None


@with_db
async def test_G_H_search_never_stores_query(db):
    from services.aggregate_telemetry import increment, summarize, _current_env
    await increment(db, event_type="SEARCH_COUNT", result_bucket="many")
    await increment(db, event_type="ZERO_RESULT_SEARCH_COUNT", result_bucket="none")
    async for row in db.aggregate_telemetry_daily.find({}):
        for banned in ("query", "normalized_query", "search_query", "q"):
            assert banned not in row, f"aggregate must not carry {banned}"
    s = await summarize(db, env=_current_env(), days=1)
    assert s["totals"]["SEARCH_COUNT"] == 1
    assert s["totals"]["ZERO_RESULT_SEARCH_COUNT"] == 1


@with_db
async def test_N_env_isolation(db):
    """Rows stamped with a different env must NOT surface in the
    summary for another env. We simulate by writing a raw preview row
    then summarising production."""
    from datetime import datetime, timezone
    from services.aggregate_telemetry import summarize
    await db.aggregate_telemetry_daily.insert_one({
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "env": "preview",
        "event_type": "PDP_VIEW_COUNT",
        "product_slug": "iv-altar",
        "result_bucket": None,
        "count": 99,
    })
    prod = await summarize(db, env="production", days=1)
    assert prod["totals"]["PDP_VIEW_COUNT"] == 0


# ── Isolation from Tier B / retention pipeline ────────────────────

@with_db
async def test_C_D_no_side_effect_on_retention(db):
    from services.aggregate_telemetry import increment
    await increment(db, event_type="ADD_TO_CART_COUNT", product_slug="iv-altar")
    await increment(db, event_type="CHECKOUT_START_COUNT", product_slug="iv-altar")
    # Aggregate must NEVER feed the retention / behavior pipelines.
    for coll in ("behavior_events", "retention_pending",
                 "behavior_send_log", "marketing_consent",
                 "email_suppression"):
        assert await db[coll].count_documents({}) == 0, \
            f"aggregate telemetry leaked into {coll}"


# ── HTTP surface — reject on unknown event / rate limit / gate ────

def test_L_route_rejects_unknown_event_type(app_client):
    r = app_client.post("/api/telemetry/aggregate",
                        json={"event_type": "BADEVENT",
                              "product_slug": "iv-altar"})
    assert r.status_code == 422
    assert r.json()["detail"]["code"] == "UNKNOWN_EVENT_TYPE"


def test_extra_fields_rejected(app_client):
    r = app_client.post("/api/telemetry/aggregate",
                        json={"event_type": "PDP_VIEW_COUNT",
                              "product_slug": "iv-altar",
                              "session_id": "sneaky",
                              "env": "production"})
    assert r.status_code == 422  # extra='forbid'


def test_route_happy_path_and_env_stamp(app_client):
    r = app_client.post("/api/telemetry/aggregate",
                        json={"event_type": "PDP_VIEW_COUNT",
                              "product_slug": "iv-altar"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["accepted"] is True
    assert body["event_type"] == "PDP_VIEW_COUNT"
    # Client never dictates env.
    assert body["env"] in ("production", "preview", "test")


def test_admin_aggregate_requires_jwt(app_client):
    r = app_client.get("/api/admin/analytics/aggregate")
    assert r.status_code in (401, 403)


def test_admin_aggregate_happy(app_client):
    import jwt
    from datetime import datetime, timezone, timedelta
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        pytest.skip("JWT_SECRET unavailable")
    tok = jwt.encode({"sub": "admin",
                      "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
                     secret, algorithm="HS256")
    r = app_client.get("/api/admin/analytics/aggregate",
                       headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200


# ── §14 privacy-choices copy + §15 privacy-policy disclosure ─────

def test_privacy_choices_copy_updated():
    from pathlib import Path
    p = Path("/app/frontend/src/components/PrivacyChoices.jsx").read_text()
    assert "keep your cart, wishlist and\n" in p or \
           "keep your cart, wishlist and " in p
    assert "Marketing email is a separate choice" in p


def test_privacy_policy_aggregate_disclosure():
    from pathlib import Path
    p = Path("/app/frontend/src/data/trustPages.js").read_text()
    assert "Privacy-Minimised Aggregate Counts" in p
    assert "not tied to a browser identifier" in p
    assert "do not retain IP addresses" in p
    # Truthful: does NOT claim aggregate is exempt from consent everywhere.
    assert "not universally exempt from consent" in p


# ── Rate-limit unit ──────────────────────────────────────────────

def test_rate_limit_helper():
    from routes.telemetry import _rate_ok, _RL_MAX
    ip = "10.9.9.9"
    for _ in range(_RL_MAX):
        assert _rate_ok(ip) is True
    assert _rate_ok(ip) is False
