"""PHILEON Growth OS — Phase 1 tests (flags · schedule · cron auth · budget · parsing · dedupe · admin CRUD)."""
import asyncio
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
    r = app_client.post("/api/admin/growth-os/radar/refresh", headers=_admin_headers())
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
        for i in range(8)]}}


async def _fake_related(term, geo, date="today 12-m"):
    return {"related_queries": {"rising": [{"query": f"{term} near me", "value": "Breakout", "extracted_value": None},
                                           {"query": f"best {term}", "value": "+120%", "extracted_value": 120}],
                                "top": [{"query": term, "value": "100", "extracted_value": 100}]}}


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
    assert loop.run_until_complete(G.serp_usage(db))["daily_used"] == 0  # failed calls are not billable


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
