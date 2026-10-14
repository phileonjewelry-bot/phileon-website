"""PHILEON Growth OS — Phase 1 tests (flags · schedule · cron auth · budget · parsing · dedupe · admin CRUD)."""
import asyncio
import json
import os
from datetime import datetime, timezone

import pytest

from services import growth_os as G
from services import growth_radar as R
from services import growth_director as D


# ── Pure helpers ───────────────────────────────────────────────

def test_market_terms_spelling_variants():
    mt = G.market_terms("Custom diamond jewellery")
    assert mt == {"CA": "Custom diamond jewellery", "US": "Custom diamond jewelry"}
    assert G.market_terms("Men's gold bracelets")["US"] == "Men's gold bracelets"
    assert G.market_terms("Personalised luxury jewellery")["US"] == "Personalized luxury jewelry"


def test_seed_keyword_list_matches_owner_brief():
    terms = [t for ts in G.SEED_KEYWORDS.values() for t in ts]
    assert len(terms) == 19 and len(set(terms)) == 19
    assert "Bespoke engagement rings" in terms and "Diamond anniversary gifts" in terms


def test_next_run_is_7am_toronto_dst_aware():
    summer = G.next_scheduled_run(datetime(2026, 7, 10, 12, 0, tzinfo=timezone.utc))
    assert summer["local"].startswith("2026-07-11T07:00:00-04:00")
    assert summer["utc"].startswith("2026-07-11T11:00:00")
    winter = G.next_scheduled_run(datetime(2026, 1, 10, 12, 0, tzinfo=timezone.utc))
    assert winter["local"].startswith("2026-01-11T07:00:00-05:00")
    assert winter["utc"].startswith("2026-01-11T12:00:00")
    # 06:30 local → same day
    same_day = G.next_scheduled_run(datetime(2026, 7, 10, 10, 30, tzinfo=timezone.utc))
    assert same_day["local"].startswith("2026-07-10T07:00:00-04:00")
    assert summer["cron"] == "0 7 * * *" and summer["timezone"] == "America/Toronto"


def test_flags_fail_closed(monkeypatch):
    monkeypatch.delenv("PHILEON_GROWTH_OS_ENABLED", raising=False)
    monkeypatch.delenv("GROWTH_OS_CRON_ENABLED", raising=False)
    monkeypatch.setenv("SERPAPI_API_KEY", "")
    assert not G.is_enabled() and not G.cron_enabled() and not G.serp_configured()
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    assert G.is_enabled() and not G.cron_enabled()


def test_summarize_timeseries_and_related():
    body = {"interest_over_time": {"timeline_data": [
        {"timestamp": str(1000 + i), "values": [{"query_index": 0, "extracted_value": v},
                                                {"query_index": 1, "extracted_value": 10}]}
        for i, v in enumerate([10, 10, 10, 10, 20, 20, 20, 20])]}}
    out = R.summarize_timeseries(body)
    assert out[0]["avg_interest"] == 15.0 and out[0]["latest_value"] == 20 and out[0]["trend_delta_pct"] == 100.0
    assert out[1]["trend_delta_pct"] == 0.0 and out[1]["points"] == 8
    rel = R.parse_related({"related_queries": {"rising": [{"query": "x", "value": "Breakout"}], "top": None}})
    assert rel["rising"][0]["query"] == "x" and rel["top"] == []
    assert R.parse_related({}) == {"rising": [], "top": []}


def test_deterministic_priority():
    assert R.deterministic_priority({"value": "Breakout"}) == "HIGH"
    assert R.deterministic_priority({"extracted_value": 350}) == "HIGH"
    assert R.deterministic_priority({"extracted_value": 90}) == "MEDIUM"
    assert R.deterministic_priority({"extracted_value": 20}) == "LOW"


def test_fingerprint_normalizes():
    assert G.fingerprint("  Men's  Rings ", "ca") == G.fingerprint("men's rings", "CA")
    assert G.fingerprint("a", "CA") != G.fingerprint("a", "US")


def test_extract_json_handles_fences():
    assert D._extract_json('```json\n[{"a":1}]\n```') == [{"a": 1}]
    assert D._extract_json('Here you go: [{"a":2}] thanks') == [{"a": 2}]


def test_deterministic_recommendations_only_from_evidence():
    ev = [{"id": "E001", "kind": "internal_search_gap", "text": "x", "query": "tennis bracelet"},
          {"id": "E002", "kind": "internal_product", "text": "views 40, likes 1, adds 0, checkout starts 0, paid orders 0",
           "product_slug": "cypher"},
          {"id": "E003", "kind": "radar_trend", "text": "irrelevant"}]
    recs = D.deterministic_recommendations(ev, 6)
    assert len(recs) == 2 and all(r["evidence_ids"] for r in recs)
    assert D.deterministic_recommendations([], 6) == []


# ── HTTP: admin + cron ─────────────────────────────────────────

def _admin_headers():
    import jwt
    from datetime import timedelta
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        pytest.skip("JWT_SECRET unavailable")
    tok = jwt.encode({"sub": "test-admin", "exp": datetime.now(timezone.utc) + timedelta(hours=1)}, secret, algorithm="HS256")
    return {"Authorization": f"Bearer {tok}"}


def test_admin_requires_auth(app_client):
    assert app_client.get("/api/admin/growth-os/overview").status_code in (401, 403)


def test_admin_disabled_returns_409_except_overview(app_client, monkeypatch):
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "false")
    h = _admin_headers()
    r = app_client.get("/api/admin/growth-os/overview", headers=h)
    assert r.status_code == 200 and r.json()["enabled"] is False
    assert app_client.get("/api/admin/growth-os/keywords", headers=h).status_code == 409


def test_overview_never_leaks_secrets(app_client, monkeypatch):
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    r = app_client.get("/api/admin/growth-os/overview", headers=_admin_headers())
    assert r.status_code == 200
    body = r.text
    for k in ("WEBHOOK_CRON_SECRET", "EMERGENT_LLM_KEY", "SERPAPI_API_KEY", "TYPESAFE_API_KEY"):
        v = (os.environ.get(k) or "").strip()
        if v:
            assert v not in body
    d = r.json()
    assert d["schedule"]["next_run"]["timezone"] == "America/Toronto"
    assert "serpapi" in d["health"] and "jev" in d["health"] and "claude" in d["health"]


def test_keyword_crud(app_client, monkeypatch):
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    h = _admin_headers()
    r = app_client.post("/api/admin/growth-os/keywords", headers=h,
                        json={"term": "Pytest jewellery probe", "category": "Test"})
    assert r.status_code == 201, r.text
    kw = r.json()
    assert kw["market_terms"]["US"] == "Pytest jewelry probe"
    assert app_client.post("/api/admin/growth-os/keywords", headers=h,
                           json={"term": "pytest JEWELLERY probe", "category": "Test"}).status_code == 409
    r = app_client.post(f"/api/admin/growth-os/keywords/{kw['id']}/toggle", headers=h)
    assert r.json()["enabled"] is False
    r = app_client.put(f"/api/admin/growth-os/keywords/{kw['id']}", headers=h,
                       json={"market_terms": {"CA": "probe ca", "US": "probe us"}, "markets": ["US"]})
    assert r.json()["market_terms"] == {"CA": "probe ca", "US": "probe us"} and r.json()["markets"] == ["US"]
    assert app_client.delete(f"/api/admin/growth-os/keywords/{kw['id']}", headers=h).status_code == 200
    assert app_client.delete(f"/api/admin/growth-os/keywords/{kw['id']}", headers=h).status_code == 404


def test_settings_limits(app_client, monkeypatch):
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    h = _admin_headers()
    before = app_client.get("/api/admin/growth-os/overview", headers=h).json()["settings"]
    r = app_client.put("/api/admin/growth-os/settings", headers=h, json={"serp_daily_limit": 7})
    assert r.status_code == 200 and r.json()["serp_daily_limit"] == 7
    assert app_client.put("/api/admin/growth-os/settings", headers=h, json={"serp_daily_limit": -1}).status_code == 422
    app_client.put("/api/admin/growth-os/settings", headers=h, json={"serp_daily_limit": before["serp_daily_limit"]})


def test_manual_refresh_refused_without_serp(app_client, monkeypatch):
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    monkeypatch.setenv("SERPAPI_API_KEY", "")
    r = app_client.post("/api/admin/growth-os/radar/refresh", headers=_admin_headers(), json={"confirm": True})
    assert r.status_code == 409 and r.json()["detail"] == "SERPAPI_INTEGRATION_REQUIRED"
    r = app_client.get("/api/admin/growth-os/radar", headers=_admin_headers())
    assert r.json()["integration_required"] is True and r.json()["serpapi"]["status"] == "integration_required"


def test_cron_auth_and_gates(app_client, monkeypatch):
    monkeypatch.setenv("WEBHOOK_CRON_SECRET", "unit-test-secret-0123456789abcdef")
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    monkeypatch.setenv("GROWTH_OS_CRON_ENABLED", "false")
    assert app_client.post("/api/growth-os/cron/daily-refresh").status_code == 401
    assert app_client.post("/api/growth-os/cron/daily-refresh", headers={"Authorization": "Bearer wrong"}).status_code == 401
    ok = {"Authorization": "Bearer unit-test-secret-0123456789abcdef", "X-Webhook-Id": "pytest-cron-1"}
    r = app_client.post("/api/growth-os/cron/daily-refresh", headers=ok, json={"event": "schedule.triggered"})
    assert r.status_code == 202 and r.json() == {"accepted": False, "reason": "cron_disabled", "run_id": "pytest-cron-1"}
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "false")
    monkeypatch.setenv("GROWTH_OS_CRON_ENABLED", "true")
    r = app_client.post("/api/growth-os/cron/daily-refresh", headers=ok, json={})
    assert r.json()["reason"] == "growth_os_disabled"
    monkeypatch.delenv("WEBHOOK_CRON_SECRET")
    assert app_client.post("/api/growth-os/cron/daily-refresh", headers=ok, json={}).status_code == 401


def test_cron_enabled_without_serp_records_skipped_run(app_client, monkeypatch):
    monkeypatch.setenv("WEBHOOK_CRON_SECRET", "unit-test-secret-0123456789abcdef")
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    monkeypatch.setenv("GROWTH_OS_CRON_ENABLED", "true")
    monkeypatch.setenv("SERPAPI_API_KEY", "")
    monkeypatch.setenv("EMERGENT_LLM_KEY", "")  # director deterministic → no external calls
    ok = {"Authorization": "Bearer unit-test-secret-0123456789abcdef", "X-Webhook-Id": "pytest-cron-skip-1"}
    r = app_client.post("/api/growth-os/cron/daily-refresh", headers=ok, json={})
    assert r.status_code == 202 and r.json()["accepted"] is True
    # duplicate delivery is acknowledged, not re-run
    r2 = app_client.post("/api/growth-os/cron/daily-refresh", headers=ok, json={})
    assert r2.json().get("duplicate") is True
    runs = app_client.get("/api/admin/growth-os/activity", headers=_admin_headers()).json()["runs"]
    mine = [x for x in runs if x["run_id"] == "pytest-cron-skip-1"]
    assert mine and mine[0]["status"] == "skipped" and mine[0]["reason"] == "integration_required"
    ledger = app_client.get("/api/admin/growth-os/activity", headers=_admin_headers()).json()["ledger"]
    assert not any(l["provider"] == "serpapi" and l["ok"] for l in ledger if l["at"] >= mine[0]["started_at"])


# ── Radar pipeline with mocked SerpAPI (no live key) ───────────

async def _fake_timeseries(terms, geo, date="today 12-m"):
    return {"interest_over_time": {"timeline_data": [
        {"timestamp": str(1700000000 + i * 604800),
         "values": [{"query_index": idx, "extracted_value": (10 if i < 4 else 40) + idx} for idx in range(len(terms))]}
        for i in range(8)]}, "_http_status": 200}


async def _fake_related(term, geo, date="today 12-m"):
    return {"related_queries": {"rising": [{"query": f"{term} near me", "value": "Breakout", "extracted_value": None},
                                           {"query": f"best {term}", "value": "+120%", "extracted_value": 120}],
                                "top": [{"query": term, "value": "100", "extracted_value": 100}]}, "_http_status": 200}


@pytest.fixture
def radar_env(monkeypatch):
    from motor.motor_asyncio import AsyncIOMotorClient
    from dotenv import load_dotenv
    load_dotenv('/app/backend/.env')
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    monkeypatch.setenv("SERPAPI_API_KEY", "dummy-key-for-mocked-tests")
    monkeypatch.setenv("EMERGENT_LLM_KEY", "")
    monkeypatch.setenv("TYPESAFE_API_KEY", "")
    monkeypatch.setattr(R, "fetch_timeseries", _fake_timeseries)
    monkeypatch.setattr(R, "fetch_related", _fake_related)
    loop = asyncio.new_event_loop()
    client = AsyncIOMotorClient(os.environ["MONGO_URL"], io_loop=loop)
    db = client[os.environ["DB_NAME"] + "_growth_test"]  # isolated: mocked data never touches preview collections

    async def _reset():
        for c in ("growth_radar_snapshots", "growth_radar_discoveries", "growth_recommendations", "growth_runs",
                  "growth_api_ledger", "growth_locks"):
            await db[c].delete_many({})
        await db.growth_settings.update_one({"_id": G.SETTINGS_ID}, {"$set": dict(G.DEFAULT_SETTINGS)}, upsert=True)
        await G.ensure_seed(db)
    loop.run_until_complete(_reset())
    yield db, loop
    loop.run_until_complete(_reset())
    client.close()
    loop.close()


def test_run_refresh_full_pipeline_dedupes_and_caches(radar_env):
    db, loop = radar_env
    loop.run_until_complete(G.update_settings(db, {"serp_daily_limit": 40}))  # full-run scenario needs > default 6
    res = loop.run_until_complete(R.run_refresh(db, trigger="test", run_id="pipe-1"))
    assert res["status"] == "success", res
    c = res["counters"]
    # 19 keywords × 2 markets → 4 TIMESERIES batches per market (8) + 4 related per market (8)
    assert c["serp_calls"] == 16 and c["snapshots"] == 38 + 8
    assert c["new_discoveries"] == 16  # 2 rising per related call, unique per (query, market)
    assert loop.run_until_complete(db.growth_radar_discoveries.count_documents({})) == 16
    disc = loop.run_until_complete(db.growth_radar_discoveries.find_one({"value": "Breakout"}))
    assert disc["priority"] == "HIGH" and disc["priority_engine"] == "deterministic"
    usage = loop.run_until_complete(G.serp_usage(db))
    assert usage["daily_used"] == 16

    # Second run inside TTL → everything cached, zero new SerpAPI calls, zero duplicate discoveries.
    res2 = loop.run_until_complete(R.run_refresh(db, trigger="test", run_id="pipe-2"))
    assert res2["status"] == "success" and res2["counters"]["serp_calls"] == 0
    assert res2["counters"]["new_discoveries"] == 0 and res2["counters"]["cache_hits"] >= 38
    assert loop.run_until_complete(G.serp_usage(db))["daily_used"] == 16
    # Duplicate run_id is refused.
    assert loop.run_until_complete(R.run_refresh(db, trigger="test", run_id="pipe-2"))["status"] == "duplicate"


def test_run_refresh_stops_at_daily_budget(radar_env):
    db, loop = radar_env
    loop.run_until_complete(G.update_settings(db, {"serp_daily_limit": 3}))
    res = loop.run_until_complete(R.run_refresh(db, trigger="test", run_id="budget-1"))
    assert res["status"] == "partial" and res["reason"] == "daily_budget_exhausted"
    assert res["counters"]["serp_calls"] == 3
    assert loop.run_until_complete(G.serp_usage(db))["daily_remaining"] == 0


def test_run_refresh_refuses_overlap(radar_env):
    db, loop = radar_env
    assert loop.run_until_complete(R.acquire_lock(db)) is True
    res = loop.run_until_complete(R.run_refresh(db, trigger="test", run_id="overlap-1"))
    assert res["status"] == "skipped" and res["reason"] == "run_already_in_progress"
    loop.run_until_complete(R.release_lock(db))
    assert loop.run_until_complete(R.acquire_lock(db)) is True
    loop.run_until_complete(R.release_lock(db))


def test_serp_error_recorded_not_fabricated(radar_env, monkeypatch):
    db, loop = radar_env

    async def _boom(terms, geo, date="today 12-m"):
        raise R.SerpError("auth")
    monkeypatch.setattr(R, "fetch_timeseries", _boom)
    res = loop.run_until_complete(R.run_refresh(db, trigger="test", run_id="err-1"))
    assert res["status"] == "partial" and res["reason"] == "serp_auth"
    assert loop.run_until_complete(db.growth_radar_snapshots.count_documents({})) == 0
    # Conservative billing: the request reached the provider (HTTP 401) so it stays reserved as billable.
    assert loop.run_until_complete(G.serp_usage(db))["daily_used"] == 1


# ── Director quality corrections: provenance · clustering · scoring ──

def test_grade_internal_quality_requires_provenance_not_env_label():
    real = [f"phi-{i:08d}-1111-2222-3333-444444444444" for i in range(4)]
    assert D.grade_internal("preview", sessions=real, event_count=50, slug_known=False)[0] == "test"
    assert D.grade_internal("production", sessions=["sess-xxxxxxxx", "phi-real-search-1"], event_count=50, days=5)[0] == "test"
    # One fixture session contaminates the whole sample.
    assert D.grade_internal("production", sessions=real + ["phi-real-search-1"], event_count=50, days=5)[0] == "test"
    assert D.grade_internal("preview", sessions=real, event_count=50, days=5)[0] == "unverified"
    # Production label alone is NOT enough: non-genuine ids, too few sessions or days stay unverified.
    assert D.grade_internal("production", sessions=["anonymous"], event_count=50, days=5)[0] == "unverified"
    assert D.grade_internal("production", sessions=real[:2], event_count=50, days=5)[0] == "unverified"
    assert D.grade_internal("production", sessions=real, event_count=50, days=1)[0] == "unverified"
    assert D.grade_internal("production", sessions=real, event_count=3, days=3)[0] == "unverified"
    q, reason = D.grade_internal("production", sessions=real, event_count=40, days=3)
    assert q == "verified" and "4 genuine sessions" in reason
    # Real frontend session format (phi-<uuid>) is genuine, never a fixture.
    assert D._GENUINE_SESSION_RX.match("phi-0f3a9c2e-5b1d-4e7f-8a9b-0c1d2e3f4a5b")
    assert not D._TEST_SESSION_RX.match("phi-0f3a9c2e-5b1d-4e7f-8a9b-0c1d2e3f4a5b")


def test_cluster_consolidates_equivalent_actions():
    recs = [
        {"title": "Create a ring landing page", "action": "Build a ring landing page", "channel": "collection", "market": "ALL", "evidence_ids": ["E002"]},
        {"title": "Curate a ring collection page", "action": "Group rings into a collection page", "channel": "collection", "market": "ALL", "evidence_ids": ["E002"]},
        {"title": "Tune ring search results", "action": "Improve ring search synonyms", "channel": "seo", "market": "ALL", "evidence_ids": ["E002"]},
        {"title": "Concierge prompt for ring browsers", "action": "Offer concierge chat on ring searches", "channel": "concierge", "market": "ALL", "evidence_ids": ["E002"]},
        {"title": "Bespoke ring consultation CTA", "action": "Invite ring searchers to a bespoke consultation", "channel": "bespoke", "market": "ALL", "evidence_ids": ["E002"]},
        {"title": "Men's bracelet editorial for Canada", "action": "Write a men's bracelet journal piece", "channel": "content", "market": "CA", "evidence_ids": ["E007"]},
    ]
    out = D.cluster(recs)
    assert len(out) == 3
    ring_site = next(c for c in out if c["channel"] == "collection")
    assert ring_site["merged_variants"] == 2 and len(ring_site["actions"]) == 3
    relationship = next(c for c in out if c["channel"] in ("concierge", "bespoke"))
    assert relationship["merged_variants"] == 1
    assert next(c for c in out if c["market"] == "CA")["merged_variants"] == 0


def test_score_is_deterministic_and_caps_exploratory():
    index = {"E1": {"id": "E1", "quality": "unverified", "events": 6, "provenance": {"source": "site_search_events"}},
             "E2": {"id": "E2", "quality": "verified", "events": 500, "provenance": {"source": "serpapi_google_trends"}}}
    weak = D.score({"channel": "collection", "impact": "high", "effort": "low", "evidence_ids": ["E1"]}, index)
    assert weak["exploratory"] is True and weak["evidence_strength"] == "exploratory" and weak["priority"] != "HIGH"
    strong = D.score({"channel": "collection", "impact": "high", "effort": "low", "evidence_ids": ["E2"]}, index)
    assert strong["exploratory"] is False and strong["evidence_strength"] == "established" and strong["priority"] == "HIGH"
    assert strong["score"] > weak["score"] and strong["provenance"][0]["source"] == "serpapi_google_trends"
    assert "confidence" not in strong


def test_sanitize_blocks_revenue_channels_on_unverified_evidence():
    index = {"E1": {"id": "E1", "quality": "unverified"}, "E2": {"id": "E2", "quality": "verified"}}
    base = {"title": "x", "actions": ["do it"], "evidence_ids": ["E1"]}
    assert D._sanitize({**base, "channel": "collection"}, index) is None
    assert D._sanitize({**base, "channel": "concierge"}, index) is None
    assert D._sanitize({**base, "channel": "content"}, index)["channel"] == "content"
    assert D._sanitize({**base, "channel": "collection", "evidence_ids": ["E2"]}, index)["channel"] == "collection"
    assert D._sanitize({"title": "no evidence", "channel": "content", "evidence_ids": ["E9"]}, index) is None


def test_evidence_report_excludes_test_fixture_data(radar_env):
    """Mocked internal analytics: an unknown slug + fixture sessions must be graded `test` and excluded."""
    db, loop = radar_env
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    loop.run_until_complete(db.behavior_events.delete_many({}))
    loop.run_until_complete(db.search_events.delete_many({}))
    loop.run_until_complete(db.behavior_events.insert_many([
        {"event_type": "PRODUCT_VIEWED", "product_slug": "p1", "session_id": "sess-xxxxxxxx", "env": "preview", "created_at": now}
        for _ in range(6)]))
    loop.run_until_complete(db.search_events.insert_many([
        {"normalized_query": "ring", "result_count": 3, "session_id": "phi-real-search-1", "env": "preview", "created_at": now}
        for _ in range(6)]))
    report = loop.run_until_complete(D.evidence_report(db))
    assert report["summary"]["test"] == 2 and report["summary"]["verified"] == 0
    assert all(e["excluded"] for e in report["evidence"])
    assert all("provenance" in e and e["provenance"]["event_count"] >= 6 for e in report["evidence"])
    ledger, _ = loop.run_until_complete(D.collect_evidence(db))
    assert ledger == []
    res = loop.run_until_complete(D.generate_recommendations(db, run_id="ev-1"))
    assert res["created"] == 0 and res["reason"] == "no_usable_evidence"
    loop.run_until_complete(db.behavior_events.delete_many({}))
    loop.run_until_complete(db.search_events.delete_many({}))


# ── Test-database isolation (fail-closed) ─────────────────────

def test_pytest_session_is_bound_to_disposable_database(app_client):
    from server import db
    assert "_pytest_" in db.name and db.name == os.environ["DB_NAME"]
    assert db.name != os.environ["PHILEON_PERSISTENT_DB_NAME"]


def test_server_refuses_persistent_database_under_pytest(monkeypatch):
    import importlib, sys as _sys
    monkeypatch.setenv("DB_NAME", "phileon_db")
    src = open("/app/backend/server.py", encoding="utf-8").read()
    guard = src[src.index("# MongoDB connection"):src.index("client = AsyncIOMotorClient(mongo_url)")]
    ns = {"os": os, "sys": _sys}
    with pytest.raises(RuntimeError, match="persistent database under pytest"):
        exec(guard, ns)


def test_public_ingestion_in_tests_never_touches_preview_db(app_client):
    """The exact writes that caused the contamination now land in the disposable DB only."""
    from pymongo import MongoClient
    r = app_client.post("/api/behavior/events", json={"event_type": "PRODUCT_VIEWED", "product_slug": "p1",
                                                      "session_id": "sess-xxxxxxxx"})
    assert r.status_code == 202
    r = app_client.post("/api/search-events", json={"query": "ring", "result_count": 3, "session_id": "phi-real-search-1"})
    assert r.status_code == 200
    c = MongoClient(os.environ["MONGO_URL"], serverSelectionTimeoutMS=2000)
    persistent = c[os.environ["PHILEON_PERSISTENT_DB_NAME"]]
    assert persistent.behavior_events.count_documents({"product_slug": "p1", "session_id": "sess-xxxxxxxx"}) == 0
    assert persistent.search_events.count_documents({"session_id": "phi-real-search-1"}) == 0
    disposable = c[os.environ["DB_NAME"]]
    assert disposable.behavior_events.count_documents({"product_slug": "p1"}) >= 1
    c.close()


# ── Targeted research run (mocked SerpAPI — never live) ───────

def _kw(loop, db, term):
    return loop.run_until_complete(db.growth_keywords.find_one({"term": term}, {"_id": 0}))


def test_estimate_single_keyword_canada_is_two_requests(radar_env):
    db, loop = radar_env
    kw = _kw(loop, db, "Bespoke engagement rings")
    est = loop.run_until_complete(R.estimate_run(db, keyword_ids=[kw["id"]], markets=["CA"]))
    assert est["estimated_requests"] == 2 and est["markets"] == ["CA"] and est["keyword_count"] == 1
    assert est["breakdown"][0]["keywords"][0]["term"] == "Bespoke engagement rings"
    assert est["breakdown"][0] == {**est["breakdown"][0], "timeseries_calls": 1, "related_calls": 1}
    # Full run estimate for comparison: 19 keywords × 2 markets → 8 timeseries + 8 related.
    full = loop.run_until_complete(R.estimate_run(db))
    assert full["estimated_requests"] == 16


def test_targeted_run_canada_only_consumes_two_and_leaves_others_enabled(radar_env):
    db, loop = radar_env
    kw = _kw(loop, db, "Bespoke engagement rings")
    res = loop.run_until_complete(R.run_refresh(db, trigger="manual", run_id="target-1", keyword_ids=[kw["id"]],
                                                markets=["CA"], max_requests=2))
    assert res["status"] == "success", res
    assert res["counters"]["serp_calls"] == 2 and res["scope"]["markets"] == ["CA"]
    snaps = loop.run_until_complete(db.growth_radar_snapshots.find({}, {"_id": 0}).to_list(50))
    assert {s["market"] for s in snaps} == {"CA"} and {s["keyword_id"] for s in snaps} == {kw["id"]}
    assert loop.run_until_complete(db.growth_radar_snapshots.count_documents({"market": "US"})) == 0
    assert loop.run_until_complete(db.growth_keywords.count_documents({"enabled": True})) == 19
    assert loop.run_until_complete(G.serp_usage(db))["daily_used"] == 2
    # Re-estimate: everything cached → 0 requests.
    assert loop.run_until_complete(R.estimate_run(db, keyword_ids=[kw["id"]], markets=["CA"]))["estimated_requests"] == 0
    # Evidence from this run is external search interest, never customer enquiries.
    ledger, _ = loop.run_until_complete(D.collect_evidence(db))
    assert ledger and all(e["signal_type"] == "market_search_interest" for e in ledger)
    assert all("NOT customer enquiries" in e["quality_reason"] for e in ledger)


def test_max_requests_hard_cap_stops_run(radar_env):
    db, loop = radar_env
    res = loop.run_until_complete(R.run_refresh(db, trigger="manual", run_id="cap-1", markets=["CA"], max_requests=3))
    assert res["status"] == "partial" and res["reason"] == "max_requests_reached"
    assert res["counters"]["serp_calls"] == 3
    assert loop.run_until_complete(G.serp_usage(db))["daily_used"] == 3


def test_default_budgets_are_six_daily_two_hundred_monthly():
    assert G.DEFAULT_SETTINGS["serp_daily_limit"] == 6 and G.DEFAULT_SETTINGS["serp_monthly_limit"] == 200


def test_http_refresh_requires_confirmation_and_respects_max(app_client, monkeypatch):
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    monkeypatch.setenv("SERPAPI_API_KEY", "dummy-for-gate-tests")

    async def _never(*a, **k):
        raise AssertionError("live SerpAPI must not be called in tests")
    monkeypatch.setattr(R, "fetch_timeseries", _never)
    monkeypatch.setattr(R, "fetch_related", _never)
    h = _admin_headers()
    kws = app_client.get("/api/admin/growth-os/keywords", headers=h).json()["keywords"]
    kw = next(k for k in kws if k["term"] == "Bespoke engagement rings")
    scope = {"keyword_ids": [kw["id"]], "markets": ["CA"], "max_requests": 2}
    est = app_client.post("/api/admin/growth-os/radar/estimate", headers=h, json=scope)
    assert est.status_code == 200 and est.json()["estimated_requests"] == 2
    r = app_client.post("/api/admin/growth-os/radar/refresh", headers=h, json=scope)
    assert r.status_code == 409 and r.json()["detail"] == "CONFIRMATION_REQUIRED"
    r = app_client.post("/api/admin/growth-os/radar/refresh", headers=h, json={**scope, "max_requests": 1, "confirm": True})
    assert r.status_code == 409 and r.json()["detail"].startswith("ESTIMATE_EXCEEDS_MAX:2>1")
    assert app_client.get("/api/admin/growth-os/radar/runs/nope", headers=h).json()["status"] == "pending"


# ── Security + billing + empty-result + sparse-data corrections (mocked, no live calls) ──

def test_log_redaction_filter_strips_credentials(caplog, monkeypatch):
    import logging
    monkeypatch.setenv("SERPAPI_API_KEY", "zz-secret-serp-key-0123456789abcdef")
    G.install_log_redaction()
    with caplog.at_level(logging.WARNING):
        logging.getLogger("httpx").warning("GET https://serpapi.com/search?q=x&api_key=zz-secret-serp-key-0123456789abcdef ok")
        try:
            raise RuntimeError("boom api_key=zz-secret-serp-key-0123456789abcdef")
        except RuntimeError:
            logging.getLogger("phileon.t").exception("failed")
    text = caplog.text
    assert "zz-secret-serp-key-0123456789abcdef" not in text and "REDACTED" in text
    assert not logging.getLogger("httpx").isEnabledFor(logging.INFO)
    assert G.redact("x?api_key=abc123&geo=CA") == "x?api_key=[REDACTED]&geo=CA"
    assert R.SerpError("api", "bad api_key=abc123def").detail == "bad api_key=[REDACTED]"


def test_empty_related_queries_is_completed_research_and_cached(radar_env, monkeypatch):
    db, loop = radar_env

    async def _empty(term, geo, date="today 12-m"):
        return {"_empty": True, "_provider_message": "Google Trends hasn't returned any results for this query.", "_http_status": 200}
    monkeypatch.setattr(R, "fetch_related", _empty)
    kw = _kw(loop, db, "Bespoke engagement rings")
    res = loop.run_until_complete(R.run_refresh(db, trigger="manual", run_id="empty-1", keyword_ids=[kw["id"]], markets=["CA"], max_requests=2))
    assert res["status"] == "success" and not res.get("reason"), res
    assert res["counters"]["serp_calls"] == 2 and res["counters"]["empty_results"] == 1 and res["counters"]["new_discoveries"] == 0
    rel = loop.run_until_complete(db.growth_radar_snapshots.find_one({"kind": "related"}, {"_id": 0}))
    assert rel["empty"] is True and rel["rising"] == [] and "hasn't returned" in rel["provider_note"]
    ledger = loop.run_until_complete(db.growth_api_ledger.find({"attempted": True}, {"_id": 0}).to_list(10))
    assert sorted(l["outcome"] for l in ledger) == ["empty_result", "success"]
    assert all(l["billable"] and l["http_status"] == 200 for l in ledger)
    # Cached: a second targeted run spends nothing and re-estimate is 0.
    res2 = loop.run_until_complete(R.run_refresh(db, trigger="manual", run_id="empty-2", keyword_ids=[kw["id"]], markets=["CA"]))
    assert res2["counters"]["serp_calls"] == 0 and res2["counters"]["cache_hits"] == 2
    assert loop.run_until_complete(R.estimate_run(db, keyword_ids=[kw["id"]], markets=["CA"]))["estimated_requests"] == 0


def test_provider_error_is_billable_and_diagnosed_not_empty(radar_env, monkeypatch):
    db, loop = radar_env

    async def _err(term, geo, date="today 12-m"):
        raise R.SerpError("api", "Some unexpected provider error api_key=leak123", 200)
    monkeypatch.setattr(R, "fetch_related", _err)
    kw = _kw(loop, db, "Bespoke engagement rings")
    res = loop.run_until_complete(R.run_refresh(db, trigger="manual", run_id="err-2", keyword_ids=[kw["id"]], markets=["CA"]))
    assert res["status"] == "partial" and res["reason"] == "serp_api"
    assert any("RELATED_QUERIES: api HTTP 200" in st and "leak123" not in st for st in res["steps"])
    row = loop.run_until_complete(db.growth_api_ledger.find_one({"kind": "RELATED_QUERIES"}, {"_id": 0}))
    assert row["outcome"] == "provider_error" and row["billable"] is True and row["ok"] is False
    assert row["http_status"] == 200 and row["error_kind"] == "api" and "REDACTED" in row["provider_message"]
    assert loop.run_until_complete(G.serp_usage(db))["daily_used"] == 2  # both reached the provider


def test_auth_and_transport_errors_are_not_treated_as_empty(radar_env, monkeypatch):
    db, loop = radar_env
    kw = _kw(loop, db, "Bespoke engagement rings")

    async def _auth(terms, geo, date="today 12-m"):
        raise R.SerpError("auth", "", 401)
    monkeypatch.setattr(R, "fetch_timeseries", _auth)
    res = loop.run_until_complete(R.run_refresh(db, trigger="manual", run_id="auth-1", keyword_ids=[kw["id"]], markets=["CA"]))
    assert res["status"] == "partial" and res["reason"] == "serp_auth"
    assert loop.run_until_complete(db.growth_radar_snapshots.count_documents({})) == 0
    row = loop.run_until_complete(db.growth_api_ledger.find_one({"kind": "TIMESERIES"}, {"_id": 0}))
    assert row["outcome"] == "http_error" and row["http_status"] == 401 and row["billable"] is True

    async def _net(terms, geo, date="today 12-m"):
        raise R.SerpError("timeout")
    monkeypatch.setattr(R, "fetch_timeseries", _net)
    loop.run_until_complete(db.growth_api_ledger.delete_many({}))
    res = loop.run_until_complete(R.run_refresh(db, trigger="manual", run_id="net-1", keyword_ids=[kw["id"]], markets=["CA"]))
    assert res["reason"] == "serp_timeout"
    row = loop.run_until_complete(db.growth_api_ledger.find_one({"kind": "TIMESERIES"}, {"_id": 0}))
    assert row["outcome"] == "transport_error" and row["billable"] is True  # conservative reservation kept


def test_usage_reconciles_against_provider_counter(radar_env, monkeypatch):
    db, loop = radar_env
    monkeypatch.setitem(G._serp_account_cache, "data", {"status": "operational", "account": {"this_month_usage": 9}})
    u = loop.run_until_complete(G.serp_usage(db))
    assert u["internal_monthly_used"] == 0 and u["provider_monthly_used"] == 9
    assert u["monthly_used"] == 9 and u["monthly_remaining"] == 200 - 9 and u["reconciled"] is False
    monkeypatch.setitem(G._serp_account_cache, "data", None)


def test_sparse_trends_snapshot_is_unverified_and_cannot_drive_revenue(radar_env):
    db, loop = radar_env
    kw = _kw(loop, db, "Bespoke engagement rings")
    now = G._now().isoformat()
    tl = [[1700000000 + i * 604800, 100 if i == 2 else 0] for i in range(53)]
    loop.run_until_complete(db.growth_radar_snapshots.insert_one({
        "id": "s1", "kind": "timeseries", "keyword_id": kw["id"], "term": kw["term"], "query_term": kw["term"], "market": "CA",
        "fetched_at": now, "timeline": tl, "avg_interest": 1.9, "latest_value": 0, "trend_delta_pct": 0.0, "points": 53}))
    loop.run_until_complete(db.growth_radar_snapshots.insert_one({
        "id": "s2", "kind": "timeseries", "keyword_id": "other", "term": "x", "query_term": "x", "market": "CA",
        "fetched_at": now, "timeline": [], "avg_interest": 0, "latest_value": 0, "trend_delta_pct": 0.0, "points": 0, "empty": True}))
    ledger, index = loop.run_until_complete(D.collect_evidence(db))
    assert len(ledger) == 1  # empty snapshot contributes nothing
    e = ledger[0]
    assert e["quality"] == "unverified" and e["provenance"]["sparse"] is True and e["provenance"]["nonzero_weeks"] == 1
    assert "NOT search volume" in e["quality_reason"] and "normalised" in e["text"]
    assert D._sanitize({"title": "Sell rings", "channel": "collection", "actions": ["x"], "evidence_ids": [e["id"]]}, index) is None
    sc = D.score({"channel": "content", "impact": "high", "effort": "low", "evidence_ids": [e["id"]]}, index)
    assert sc["exploratory"] is True and sc["priority"] != "HIGH"


# ── Content Studio (drafts are DRAFT ONLY · Claude is mocked) ───────────────

def _rec(**over):
    base = {"id": over.pop("id", "rec-" + os.urandom(4).hex()), "title": "Engagement ring edit for Canadian search interest",
            "status": "new", "priority": "MEDIUM", "market": "CA", "channel": "editorial", "evidence_quality": "verified",
            "evidence_strength": "indicative", "fingerprint": "fp-" + os.urandom(3).hex(), "created_at": G._now().isoformat(),
            "evidence": [{"id": "E001", "text": "Google Trends CA 'engagement ring' 53 non-zero weeks", "quality": "verified"}],
            "evidence_ids": ["E001"], "rationale": "Sustained Canadian interest.", "actions": ["Curate a ring edit."]}
    base.update(over)
    return base


def test_eligible_sources_filters_and_dedupes(radar_env):
    db, loop = radar_env
    canonical = _rec(id="canon", fingerprint="fp-same", created_at="2026-10-13T10:00:00+00:00")
    rows = [canonical,
            _rec(id="dup-older", fingerprint="fp-same", created_at="2026-10-12T10:00:00+00:00"),
            _rec(id="merged", status="merged", merged_into="canon"),
            _rec(id="invalid", status="invalidated", evidence_quality="test"),
            _rec(id="synthetic", status="new", evidence_quality="test"),
            _rec(id="dismissed", status="dismissed"),
            _rec(id="accepted", status="accepted")]
    loop.run_until_complete(db.growth_recommendations.insert_many(rows))
    ids = [s["id"] for s in loop.run_until_complete(D.eligible_sources(db))]
    assert ids == ["canon", "accepted"] or sorted(ids) == ["accepted", "canon"]
    assert "dup-older" not in ids and "merged" not in ids and "synthetic" not in ids


def test_generate_draft_mocked_claude_versions_and_never_publishes(radar_env, monkeypatch):
    db, loop = radar_env
    loop.run_until_complete(db.growth_content_drafts.delete_many({}))
    loop.run_until_complete(db.growth_recommendations.insert_many([_rec(id="canon"), _rec(id="merged", status="merged", merged_into="canon")]))
    monkeypatch.setattr(G, "claude_configured", lambda: True)
    calls = []

    async def _fake_claude(system, prompt, *, session, max_tokens=4000):
        calls.append((system, prompt))
        return "A ring is the piece that stays. (MOCKED DRAFT)"
    monkeypatch.setattr(D, "_claude", _fake_claude)

    d1 = loop.run_until_complete(D.generate_draft(db, recommendation_id="canon", discovery_id=None, fmt="instagram_caption", notes="quiet"))
    d2 = loop.run_until_complete(D.generate_draft(db, recommendation_id="canon", discovery_id=None, fmt="instagram_caption"))
    assert (d1["version"], d2["version"]) == (1, 2) and d1["id"] != d2["id"]
    assert d1["published"] is False and d1["publish_locked"] is True and d1["status"] == "draft"
    assert d1["evidence_ids"] == ["E001"] and d1["evidence"][0]["id"] == "E001" and d1["recommendation_id"] == "canon"
    assert "PHILEON" in calls[0][0] and "engagement ring" in calls[0][1].lower() and "quiet" in calls[0][1]
    assert loop.run_until_complete(db.growth_content_drafts.count_documents({})) == 2  # v1 kept, never overwritten

    with pytest.raises(ValueError, match="source_superseded"):
        loop.run_until_complete(D.generate_draft(db, recommendation_id="merged", discovery_id=None, fmt="instagram_caption"))
    with pytest.raises(ValueError, match="source_not_found"):
        loop.run_until_complete(D.generate_draft(db, recommendation_id="ghost", discovery_id=None, fmt="instagram_caption"))
    with pytest.raises(ValueError, match="unsupported_format"):
        loop.run_until_complete(D.generate_draft(db, recommendation_id="canon", discovery_id=None, fmt="tweet"))
    loop.run_until_complete(db.growth_content_drafts.delete_many({}))


def test_content_drafts_route_exposes_sources_and_formats(app_client, monkeypatch):
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    r = app_client.get("/api/admin/growth-os/content-drafts", headers=_admin_headers())
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["publish_locked"] is True and set(body["formats"]) == set(D.DRAFT_FORMATS)
    assert isinstance(body["sources"], list) and isinstance(body["drafts"], list)
    r = app_client.post("/api/admin/growth-os/content-drafts/generate", headers=_admin_headers(),
                        json={"recommendation_id": "ghost", "format": "instagram_caption"})
    assert r.status_code in (422, 502) and r.json()["detail"] in ("SOURCE_NOT_FOUND", "CLAUDE_INTEGRATION_REQUIRED")


# ── Catalogue adapter (read-only; pricing engine stays the only price authority) ──────────

from services import catalogue_adapter as CA  # noqa: E402


def _cat(loop, db=None):
    return loop.run_until_complete(CA.build_catalogue(db))


def test_catalogue_snapshot_in_sync_with_storefront_source():
    drift = CA.snapshot_drift()
    assert drift["checked"] is True and drift["in_sync"] is True, "run: node backend/scripts/export_storefront_catalogue.mjs"


def test_catalogue_maps_parents_skus_and_reports_mismatches(radar_env):
    db, loop = radar_env
    cat = _cat(loop, db)
    s, by = cat["summary"], {p["slug"]: p for p in cat["products"]}
    assert s["checkout_supported_parents"] == 84 and s["sku_configurations"] > 84  # parents ≠ SKUs
    assert by["la-bete"]["storefront_slug"] == "labete" and by["la-bete"]["name"]  # linked via pricing product_key
    assert by["galatians-6-14"]["storefront_slug"] == "galatians-614"
    assert {"pricing_slug": "la-bete", "storefront_slug": "labete"} in cat["mismatches"]["slug_differs_between_storefront_and_pricing"]
    assert "two-finger-ring" in cat["mismatches"]["storefront_only_not_purchasable"]
    assert "drew-face" in cat["mismatches"]["pricing_only_no_storefront_record"]
    assert by["la-marva"]["sku_count"] >= 3 and by["la-marva"]["editions"] and by["la-marva"]["public_url"] == "/products/la-marva"
    assert by["apex"]["categories"] == ["earrings"]  # storefront category wins over pricing-engine default
    # Never a second pricing authority: no price fields anywhere.
    blob = json.dumps(cat["products"]).lower()
    for forbidden in ("price_usd", "unit_amount", "lockedbaseprice", "price_cents", "\"price\""):
        assert forbidden not in blob
    # Missing data is reported, not invented.
    assert "description" in by["drew-face"]["missing_fields"] and by["drew-face"]["description"] is None
    assert by["drew-face"]["marketing_eligible"] is False and "no_verified_public_url" in by["drew-face"]["ineligibility_reasons"]


def test_catalogue_vault_exclusion_and_availability(radar_env):
    db, loop = radar_env
    loop.run_until_complete(db.inventory.delete_many({}))
    loop.run_until_complete(db.inventory.insert_one({"product_slug": "iv-altar", "availability_mode": "ready_to_ship",
                                                     "stock_on_hand": 1, "stock_reserved": 0, "manual_unavailable": False}))
    by = {p["slug"]: p for p in _cat(loop, db)["products"]}
    assert by["iv-altar"]["is_inspiration_vault"] and by["iv-altar"]["availability"]["state"] == "ready_to_ship"
    assert by["iv-altar"]["marketing_eligible"] is False and "vault_one_of_one" in by["iv-altar"]["ineligibility_reasons"]
    assert by["iv-nova"]["availability"]["state"] == "unavailable"  # Vault with no owner-confirmed stock is never advertised
    assert by["iv-orbit-lumiere"]["is_inspiration_vault"] is True  # iv-* in pricing catalogue → Vault, even if untracked
    assert by["veyron-noir"]["availability"]["state"] == "made_to_order" and by["veyron-noir"]["marketing_eligible"]
    assert by["gravite"]["marketing_eligible"] is False if "gravite" in by else "gravite" in _cat(loop, db)["mismatches"]["storefront_only_not_purchasable"]
    loop.run_until_complete(db.inventory.delete_many({}))


def test_match_products_is_grounded_and_never_forced(radar_env):
    db, loop = radar_env
    products = _cat(loop, db)["products"]
    m = CA.match_products(products, text="Engagement ring edit for Canadian search interest · bridal pieces")
    assert m and all("rings" in x["categories"] for x in m) and all(not x["slug"].startswith("iv-") for x in m)
    assert all("confirm fit manually" in x["match_reason"] for x in m)  # no piece is tagged bridal → say so
    assert CA.match_products(products, text="luxury watch straps for men") == []
    named = CA.match_products(products, text="Veyron Noir signet interest in the US")
    assert named[0]["slug"] == "veyron-noir" and "named in research" in named[0]["match_reason"]
    assert all(not x["slug"].startswith("iv-") for x in CA.match_products(products, text="Altar architectural cross cuff"))
    assert CA.content_brief(products, ["la-marva", "iv-altar", "ghost", "drew-face"]) and \
        [p["slug"] for p in CA.content_brief(products, ["la-marva", "iv-altar", "ghost", "drew-face"])] == ["la-marva"]


def test_director_attach_products_keeps_only_eligible_cited_slugs(radar_env):
    db, loop = radar_env
    products = _cat(loop, db)["products"]
    rec = {"title": "Editorial guide to choosing a ring", "rationale": "Google Trends CA interest in engagement rings",
           "actions": ["Curate a ring edit"], "evidence_ids": ["E001"], "product_slugs": ["veyron-noir", "iv-altar", "ghost", "drew-face"]}
    out = D.attach_products(rec, {"E001": {"id": "E001", "text": "Google Trends CA: 'Engagement rings' interest"}}, products)
    slugs = [p["slug"] for p in out["products"]]
    assert "veyron-noir" in slugs and "iv-altar" not in slugs and "ghost" not in slugs and "drew-face" not in slugs
    assert "product_slugs" not in out and len(slugs) <= 5
    none = D.attach_products({"title": "Watch straps", "rationale": "", "actions": [], "evidence_ids": []}, {}, products)
    assert none["products"] == []


def test_generate_draft_passes_only_verified_pieces_to_claude(radar_env, monkeypatch):
    db, loop = radar_env
    loop.run_until_complete(db.growth_content_drafts.delete_many({}))
    loop.run_until_complete(db.growth_recommendations.insert_one(_rec(id="ring-rec", products=[
        {"slug": "la-marva", "name": "La Marva"}, {"slug": "iv-altar", "name": "ALTAR"}, {"slug": "ghost", "name": "Ghost"}])))
    monkeypatch.setattr(G, "claude_configured", lambda: True)
    prompts = []

    async def _fake(system, prompt, *, session, max_tokens=4000):
        prompts.append(prompt)
        return "La Marva holds its line. (MOCKED)"
    monkeypatch.setattr(D, "_claude", _fake)
    d = loop.run_until_complete(D.generate_draft(db, recommendation_id="ring-rec", discovery_id=None, fmt="product_story"))
    assert [p["slug"] for p in d["products_referenced"]] == ["la-marva"]
    assert "La Marva" in prompts[0] and "ALTAR" not in prompts[0] and "Ghost" not in prompts[0]
    assert "price" not in prompts[0].lower().replace("pricing", "")  # no price facts handed to the writer
    d2 = loop.run_until_complete(D.generate_draft(db, recommendation_id="ring-rec", discovery_id=None, fmt="product_story", product_slugs=[]))
    assert d2["products_referenced"] == [] and "do NOT name" in prompts[1] and d2["version"] == 2
    assert d2["published"] is False and d2["publish_locked"] is True
    loop.run_until_complete(db.growth_content_drafts.delete_many({}))


def test_catalogue_route_is_admin_only_and_price_free(app_client, monkeypatch):
    monkeypatch.setenv("PHILEON_GROWTH_OS_ENABLED", "true")
    assert app_client.get("/api/admin/growth-os/catalogue").status_code in (401, 403)
    r = app_client.get("/api/admin/growth-os/catalogue", headers=_admin_headers())
    assert r.status_code == 200 and r.json()["summary"]["checkout_supported_parents"] == 84
    assert "price_usd" not in r.text and "unit_amount" not in r.text
