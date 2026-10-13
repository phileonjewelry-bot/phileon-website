"""PHILEON Growth OS — Customer Radar (SerpAPI Google Trends) + refresh orchestration.

    * SerpAPI is called ONLY when SERPAPI_API_KEY is configured. Otherwise the
      run is recorded as `skipped / integration_required`. Nothing is invented.
    * Cache: a (keyword, market) snapshot younger than `snapshot_ttl_hours`
      is never re-fetched. TIMESERIES batches up to 5 terms per call.
    * Budget: every billable call is checked against daily + monthly limits.
    * Overlap: a Mongo lock document prevents concurrent runs.
    * Jev (TypeSafe) scores discovery priority when available; otherwise a
      deterministic rule scores it. The engine used is stamped on the row.
"""
from __future__ import annotations

import asyncio
import logging
import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

import httpx

from services import growth_os as G

log = logging.getLogger("phileon.growth_radar")

LOCK_ID = "refresh"
LOCK_TTL_MIN = 30


class SerpError(Exception):
    def __init__(self, kind: str, detail: str = ""):
        super().__init__(kind)
        self.kind, self.detail = kind, detail


async def _serp(params: Dict[str, Any]) -> Dict[str, Any]:
    key = (os.environ.get("SERPAPI_API_KEY") or "").strip()
    if not key:
        raise SerpError("integration_required")
    q = {**params, "engine": "google_trends", "hl": "en", "tz": "0", "api_key": key}
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(25.0, connect=5.0)) as c:
            r = await c.get("https://serpapi.com/search", params=q)
    except httpx.TimeoutException:
        raise SerpError("timeout")
    except httpx.HTTPError as exc:
        raise SerpError("network", type(exc).__name__)
    if r.status_code in (401, 403):
        raise SerpError("auth")
    if r.status_code == 429:
        raise SerpError("quota")
    if r.status_code >= 400:
        raise SerpError("http", str(r.status_code))
    body = r.json()
    if body.get("error"):
        raise SerpError("api", str(body["error"])[:160])
    return body


async def fetch_timeseries(terms: List[str], geo: str, date: str = "today 12-m") -> Dict[str, Any]:
    return await _serp({"data_type": "TIMESERIES", "q": ",".join(terms[:5]), "geo": geo, "date": date})


async def fetch_related(term: str, geo: str, date: str = "today 12-m") -> Dict[str, Any]:
    return await _serp({"data_type": "RELATED_QUERIES", "q": term, "geo": geo, "date": date})


# ─── Parsing ──────────────────────────────────────────────────────

def summarize_timeseries(body: Dict[str, Any]) -> Dict[int, Dict[str, Any]]:
    """Return {query_index: {timeline:[[ts,val]], avg, latest, delta_pct}}."""
    rows = (body.get("interest_over_time") or {}).get("timeline_data") or []
    series: Dict[int, List[List[Any]]] = {}
    for row in rows:
        ts = row.get("timestamp")
        for v in row.get("values") or []:
            idx = int(v.get("query_index") or 0)
            val = v.get("extracted_value")
            if val is None:
                continue
            series.setdefault(idx, []).append([int(ts) if ts else None, int(val)])
    out: Dict[int, Dict[str, Any]] = {}
    for idx, pts in series.items():
        vals = [p[1] for p in pts]
        avg = round(sum(vals) / len(vals), 1) if vals else 0
        recent, prior = vals[-4:], vals[-8:-4] if len(vals) >= 8 else vals[:-4]
        r_avg = sum(recent) / len(recent) if recent else 0
        p_avg = sum(prior) / len(prior) if prior else 0
        delta = round(((r_avg - p_avg) / p_avg) * 100, 1) if p_avg else (100.0 if r_avg else 0.0)
        out[idx] = {"timeline": pts, "avg_interest": avg, "latest_value": vals[-1] if vals else 0,
                    "trend_delta_pct": delta, "points": len(vals)}
    return out


def parse_related(body: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    rq = body.get("related_queries") or {}
    def _clean(items):
        return [{"query": i.get("query"), "value": i.get("value"),
                 "extracted_value": i.get("extracted_value")} for i in (items or []) if i.get("query")]
    return {"rising": _clean(rq.get("rising")), "top": _clean(rq.get("top"))}


# ─── Priority scoring (Jev → deterministic fallback) ──────────────

def deterministic_priority(d: Dict[str, Any]) -> str:
    v = d.get("extracted_value")
    label = str(d.get("value") or "").lower()
    if label == "breakout" or (isinstance(v, (int, float)) and v >= 300):
        return "HIGH"
    if isinstance(v, (int, float)) and v >= 80:
        return "MEDIUM"
    return "LOW"


async def score_priority(db, d: Dict[str, Any]) -> Dict[str, Any]:
    from services.intent_classifier import is_enabled as jev_enabled
    if jev_enabled():
        try:
            from typesafe_sdk import Choice  # type: ignore
            from services.intent_classifier import _get_jev_client
            client = _get_jev_client()
            resp = await asyncio.wait_for(client.system_one(
                model="jev-latest",
                state={"rising_query": d.get("query"), "growth_label": d.get("value"),
                       "growth_pct": d.get("extracted_value"), "market": d.get("market"),
                       "source_keyword": d.get("source_keyword"), "brand": "PHILEON luxury fine jewellery"},
                questions={"priority": Choice(
                    instructions="How valuable is this rising Google search query as a customer-acquisition opportunity for a bespoke luxury jeweller?",
                    criteria={"HIGH": "Strong commercial intent, clearly jewellery-buying, sharp growth.",
                              "MEDIUM": "Relevant to fine jewellery with moderate growth or mixed intent.",
                              "LOW": "Weak relevance, informational or off-brand."})},
            ), timeout=20)
            await G.mark_integration(db, "jev", ok=True)
            return {"priority": resp.choices["priority"].choice, "priority_engine": "jev"}
        except Exception as exc:
            reason = f"{type(exc).__name__}"
            status = getattr(exc, "status", None)
            if status:
                reason += f" status={status}"
            await G.mark_integration(db, "jev", ok=False, reason=reason)
    return {"priority": deterministic_priority(d), "priority_engine": "deterministic"}


# ─── Lock ─────────────────────────────────────────────────────────

async def acquire_lock(db) -> bool:
    now = G._now()
    until = now + timedelta(minutes=LOCK_TTL_MIN)
    await db.growth_locks.update_one({"_id": LOCK_ID}, {"$setOnInsert": {"locked_until": None}}, upsert=True)
    res = await db.growth_locks.update_one(
        {"_id": LOCK_ID, "$or": [{"locked_until": None}, {"locked_until": {"$lt": now.isoformat()}}]},
        {"$set": {"locked_until": until.isoformat()}})
    return res.modified_count == 1


async def release_lock(db) -> None:
    await db.growth_locks.update_one({"_id": LOCK_ID}, {"$set": {"locked_until": None}})


# ─── Refresh orchestration ────────────────────────────────────────

async def _fresh_snapshot(db, keyword_id: str, market: str, kind: str, ttl_h: int) -> bool:
    since = (G._now() - timedelta(hours=ttl_h)).isoformat()
    return await db.growth_radar_snapshots.find_one(
        {"keyword_id": keyword_id, "market": market, "kind": kind, "fetched_at": {"$gte": since}}, {"_id": 1}) is not None


async def _budget_ok(db, settings) -> Optional[str]:
    u = await G.serp_usage(db, settings)
    if u["daily_remaining"] <= 0:
        return "daily_budget_exhausted"
    if u["monthly_remaining"] <= 0:
        return "monthly_budget_exhausted"
    return None


async def _upsert_discovery(db, item: Dict[str, Any], *, market: str, source_kw: Dict[str, Any]) -> bool:
    fp = G.fingerprint(item["query"], market)
    now = G._now().isoformat()
    existing = await db.growth_radar_discoveries.find_one({"fingerprint": fp}, {"_id": 0, "id": 1})
    if existing:
        await db.growth_radar_discoveries.update_one({"fingerprint": fp}, {
            "$set": {"last_seen": now, "value": item.get("value"), "extracted_value": item.get("extracted_value")},
            "$inc": {"seen_count": 1}})
        return False
    doc = {"id": str(uuid.uuid4()), "fingerprint": fp, "query": item["query"], "market": market,
           "type": "rising_query", "value": item.get("value"), "extracted_value": item.get("extracted_value"),
           "source_keyword": source_kw["term"], "source_keyword_id": source_kw["id"],
           "category": source_kw.get("category"), "status": "new", "first_seen": now, "last_seen": now, "seen_count": 1,
           "source": "serpapi_google_trends"}
    doc.update(await score_priority(db, doc))
    await db.growth_radar_discoveries.insert_one(doc)
    return True


async def run_refresh(db, *, trigger: str, run_id: Optional[str] = None, with_director: bool = True,
                      keyword_ids: Optional[List[str]] = None, markets: Optional[List[str]] = None,
                      max_requests: Optional[int] = None) -> Dict[str, Any]:
    """Full or TARGETED refresh. `keyword_ids` / `markets` scope the run without
    touching other keywords' enabled state; `max_requests` is a hard per-run cap
    on billable SerpAPI calls (checked before every call)."""
    run_id = run_id or f"{trigger}-{uuid.uuid4().hex[:12]}"
    now = G._now().isoformat()
    scope_markets = [m for m in (markets or list(G.MARKETS)) if m in G.MARKETS] or list(G.MARKETS)
    base = {"id": str(uuid.uuid4()), "run_id": run_id, "trigger": trigger, "started_at": now,
            "scope": {"keyword_ids": keyword_ids, "markets": scope_markets, "max_requests": max_requests},
            "steps": [], "counters": {"serp_calls": 0, "cache_hits": 0, "snapshots": 0,
                                      "new_discoveries": 0, "recommendations": 0}}

    def _cap_reached() -> bool:
        return max_requests is not None and base["counters"]["serp_calls"] >= max_requests

    async def _finish(status: str, reason: str = "") -> Dict[str, Any]:
        base.update(status=status, reason=reason, finished_at=G._now().isoformat())
        await db.growth_runs.update_one({"run_id": run_id}, {"$set": {k: v for k, v in base.items() if k != "_id"}}, upsert=True)
        return {k: v for k, v in base.items() if k != "_id"}

    if not G.is_enabled():
        return await _finish("skipped", "growth_os_disabled")
    if await db.growth_runs.find_one({"run_id": run_id}):
        return {"run_id": run_id, "status": "duplicate"}
    if not await acquire_lock(db):
        return await _finish("skipped", "run_already_in_progress")
    try:
        await db.growth_runs.update_one({"run_id": run_id}, {"$set": {**base, "status": "running"}}, upsert=True)
        settings = await G.get_settings(db)
        if not G.serp_configured():
            base["steps"].append("radar: integration_required (SERPAPI_API_KEY missing)")
            if with_director:
                from services.growth_director import generate_recommendations
                rec = await generate_recommendations(db, run_id=run_id)
                base["counters"]["recommendations"] = rec.get("created", 0)
                base["steps"].append(f"director: {rec.get('engine')} · {rec.get('created', 0)} new · {rec.get('reason', '')}")
            return await _finish("skipped", "integration_required")

        ttl = int(settings["snapshot_ttl_hours"])
        kw_query: Dict[str, Any] = {"enabled": True}
        if keyword_ids:
            kw_query = {"id": {"$in": list(keyword_ids)}}
        keywords = await db.growth_keywords.find(kw_query, {"_id": 0}).to_list(500)
        stop_reason = None
        for market in scope_markets:
            pending = []
            for kw in keywords:
                if market not in (kw.get("markets") or G.MARKETS):
                    continue
                if await _fresh_snapshot(db, kw["id"], market, "timeseries", ttl):
                    base["counters"]["cache_hits"] += 1
                    continue
                pending.append(kw)
            for i in range(0, len(pending), 5):
                batch = pending[i:i + 5]
                if _cap_reached():
                    stop_reason = "max_requests_reached"
                    break
                stop_reason = await _budget_ok(db, settings)
                if stop_reason:
                    break
                terms = [kw["market_terms"].get(market, kw["term"]) for kw in batch]
                try:
                    body = await fetch_timeseries(terms, market)
                    await G.record_api_call(db, provider="serpapi", kind="TIMESERIES", market=market, terms=len(terms))
                    base["counters"]["serp_calls"] += 1
                except SerpError as exc:
                    await G.record_api_call(db, provider="serpapi", kind="TIMESERIES", market=market, terms=len(terms), ok=False)
                    base["steps"].append(f"radar {market}: serp error {exc.kind}")
                    stop_reason = f"serp_{exc.kind}"
                    break
                parsed = summarize_timeseries(body)
                for idx, kw in enumerate(batch):
                    s = parsed.get(idx)
                    if not s:
                        continue
                    await db.growth_radar_snapshots.insert_one({
                        "id": str(uuid.uuid4()), "kind": "timeseries", "keyword_id": kw["id"], "term": kw["term"],
                        "query_term": terms[idx], "category": kw.get("category"), "market": market,
                        "fetched_at": G._now().isoformat(), "run_id": run_id, **s})
                    base["counters"]["snapshots"] += 1
            if stop_reason:
                break
        base["steps"].append(f"radar timeseries: {base['counters']['serp_calls']} calls · {base['counters']['cache_hits']} cache hits")

        if not stop_reason:
            per_run = int(settings["related_queries_per_run"])
            scoped_ids = {k["id"] for k in keywords}
            for market in scope_markets:
                top = await db.growth_radar_snapshots.find({"kind": "timeseries", "market": market,
                                                            "keyword_id": {"$in": list(scoped_ids)}}, {"_id": 0}) \
                    .sort("avg_interest", -1).to_list(200)
                seen, done = set(), 0
                for snap in top:
                    if done >= per_run or stop_reason:
                        break
                    if snap["keyword_id"] in seen:
                        continue
                    seen.add(snap["keyword_id"])
                    if await _fresh_snapshot(db, snap["keyword_id"], market, "related", ttl):
                        base["counters"]["cache_hits"] += 1
                        done += 1
                        continue
                    if _cap_reached():
                        stop_reason = "max_requests_reached"
                        break
                    stop_reason = await _budget_ok(db, settings)
                    if stop_reason:
                        break
                    kw = next((k for k in keywords if k["id"] == snap["keyword_id"]), None)
                    if not kw:
                        continue
                    try:
                        body = await fetch_related(snap["query_term"], market)
                        await G.record_api_call(db, provider="serpapi", kind="RELATED_QUERIES", market=market, terms=1)
                        base["counters"]["serp_calls"] += 1
                    except SerpError as exc:
                        await G.record_api_call(db, provider="serpapi", kind="RELATED_QUERIES", market=market, terms=1, ok=False)
                        stop_reason = f"serp_{exc.kind}"
                        break
                    rel = parse_related(body)
                    await db.growth_radar_snapshots.insert_one({
                        "id": str(uuid.uuid4()), "kind": "related", "keyword_id": kw["id"], "term": kw["term"],
                        "query_term": snap["query_term"], "category": kw.get("category"), "market": market,
                        "fetched_at": G._now().isoformat(), "run_id": run_id, **rel})
                    base["counters"]["snapshots"] += 1
                    for item in rel["rising"]:
                        if await _upsert_discovery(db, item, market=market, source_kw=kw):
                            base["counters"]["new_discoveries"] += 1
                    done += 1
            base["steps"].append(f"radar related: {base['counters']['new_discoveries']} new discoveries")

        if with_director:
            from services.growth_director import generate_recommendations
            rec = await generate_recommendations(db, run_id=run_id)
            base["counters"]["recommendations"] = rec.get("created", 0)
            base["steps"].append(f"director: {rec.get('engine')} · {rec.get('created', 0)} new · {rec.get('reason', '')}")

        if stop_reason:
            return await _finish("partial", stop_reason)
        return await _finish("success")
    except Exception as exc:  # pragma: no cover - defensive
        log.exception("growth refresh failed")
        return await _finish("failed", f"{type(exc).__name__}")
    finally:
        await release_lock(db)


async def estimate_run(db, *, keyword_ids: Optional[List[str]] = None, markets: Optional[List[str]] = None) -> Dict[str, Any]:
    """Dry-run cost estimate (no SerpAPI calls). Mirrors run_refresh's cache + batching logic."""
    settings = await G.get_settings(db)
    ttl = int(settings["snapshot_ttl_hours"])
    per_run = int(settings["related_queries_per_run"])
    scope_markets = [m for m in (markets or list(G.MARKETS)) if m in G.MARKETS] or list(G.MARKETS)
    kw_query: Dict[str, Any] = {"id": {"$in": list(keyword_ids)}} if keyword_ids else {"enabled": True}
    keywords = await db.growth_keywords.find(kw_query, {"_id": 0}).to_list(500)
    breakdown = []
    total = 0
    for market in scope_markets:
        kws = [k for k in keywords if market in (k.get("markets") or G.MARKETS)]
        pending_ts = [k for k in kws if not await _fresh_snapshot(db, k["id"], market, "timeseries", ttl)]
        ts_calls = -(-len(pending_ts) // 5) if pending_ts else 0
        pending_rel = [k for k in kws if not await _fresh_snapshot(db, k["id"], market, "related", ttl)]
        rel_calls = min(per_run, len(pending_rel))
        breakdown.append({"market": market, "keywords": [{"id": k["id"], "term": k["market_terms"].get(market, k["term"])} for k in kws],
                          "timeseries_calls": ts_calls, "related_calls": rel_calls,
                          "cached_timeseries": len(kws) - len(pending_ts), "cached_related": len(kws) - len(pending_rel)})
        total += ts_calls + rel_calls
    usage = await G.serp_usage(db, settings)
    return {"estimated_requests": total, "breakdown": breakdown, "markets": scope_markets,
            "keyword_count": len(keywords), "usage": usage,
            "within_budget": total <= usage["daily_remaining"] and total <= usage["monthly_remaining"],
            "serp_configured": G.serp_configured()}
