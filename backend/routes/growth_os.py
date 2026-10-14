"""PHILEON Growth OS — admin API (`/api/admin/growth-os/*`) + cron intake (`/api/growth-os/cron/*`).

Admin routes: `verify_admin` JWT. Module gated by `PHILEON_GROWTH_OS_ENABLED`
(409 GROWTH_OS_DISABLED for everything except `/overview`).
Cron route: independent `WEBHOOK_CRON_SECRET` (constant-time compare), never
bypasses feature flags, budget or integration health (those run inside the job).
"""
from __future__ import annotations

import hmac
import logging
import os
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field

from services import growth_os as G
from services import growth_radar as R
from services import growth_director as D

log = logging.getLogger("phileon.growth_os.routes")

admin_router = APIRouter(prefix="/admin/growth-os", tags=["growth-os-admin"])
cron_router = APIRouter(prefix="/growth-os/cron", tags=["growth-os-cron"])


def _deps():
    from server import verify_admin, db
    return verify_admin, db


verify_admin, db = _deps()


def _require_enabled():
    if not G.is_enabled():
        raise HTTPException(status_code=409, detail="GROWTH_OS_DISABLED")


# ─── Models ───────────────────────────────────────────────────────

class KeywordCreate(BaseModel):
    term: str = Field(min_length=2, max_length=80)
    category: str = Field(min_length=2, max_length=80)
    markets: Optional[List[str]] = None


class KeywordUpdate(BaseModel):
    term: Optional[str] = Field(default=None, min_length=2, max_length=80)
    category: Optional[str] = Field(default=None, min_length=2, max_length=80)
    markets: Optional[List[str]] = None
    market_terms: Optional[Dict[str, str]] = None
    enabled: Optional[bool] = None


class SettingsUpdate(BaseModel):
    serp_daily_limit: Optional[int] = None
    serp_monthly_limit: Optional[int] = None
    related_queries_per_run: Optional[int] = None
    snapshot_ttl_hours: Optional[int] = None
    director_max_recommendations: Optional[int] = None


class StatusUpdate(BaseModel):
    status: str


class DraftRequest(BaseModel):
    recommendation_id: Optional[str] = None
    discovery_id: Optional[str] = None
    format: str
    notes: str = ""


class DraftUpdate(BaseModel):
    body: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None


# ─── Overview ─────────────────────────────────────────────────────

@admin_router.get("/overview")
async def overview(_: str = Depends(verify_admin)):
    enabled = G.is_enabled()
    if not enabled:
        return {"enabled": False, "health": await G.health(db, probe_serp=False)}
    await G.ensure_seed(db)
    settings = await G.get_settings(db)
    counts = {
        "keywords_total": await db.growth_keywords.count_documents({}),
        "keywords_enabled": await db.growth_keywords.count_documents({"enabled": True}),
        "snapshots": await db.growth_radar_snapshots.count_documents({}),
        "discoveries_new": await db.growth_radar_discoveries.count_documents({"status": "new"}),
        "recommendations_new": await db.growth_recommendations.count_documents({"status": "new"}),
        "drafts": await db.growth_content_drafts.count_documents({}),
        "runs": await db.growth_runs.count_documents({}),
    }
    return {
        "enabled": True, "health": await G.health(db), "schedule": await G.schedule_status(db),
        "serp_usage": await G.serp_usage(db, settings), "settings": settings, "counts": counts,
        "guardrails": ["draft_only_content", "no_auto_publish", "no_customer_messaging", "no_paid_ads",
                       "no_fabricated_research", "admin_only"],
    }


# ─── Keywords ─────────────────────────────────────────────────────

@admin_router.get("/keywords")
async def list_keywords(_: str = Depends(verify_admin)):
    _require_enabled()
    await G.ensure_seed(db)
    rows = await db.growth_keywords.find({}, {"_id": 0}).sort([("category", 1), ("term", 1)]).to_list(500)
    return {"keywords": rows, "categories": sorted({r["category"] for r in rows})}


@admin_router.post("/keywords", status_code=201)
async def create_keyword(body: KeywordCreate, _: str = Depends(verify_admin)):
    _require_enabled()
    if await db.growth_keywords.find_one({"term": {"$regex": f"^{__import__('re').escape(body.term.strip())}$", "$options": "i"}}):
        raise HTTPException(status_code=409, detail="KEYWORD_EXISTS")
    doc = G.new_keyword(body.term, body.category)
    if body.markets:
        doc["markets"] = [m for m in body.markets if m in G.MARKETS] or list(G.MARKETS)
    await db.growth_keywords.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@admin_router.put("/keywords/{keyword_id}")
async def update_keyword(keyword_id: str, body: KeywordUpdate, _: str = Depends(verify_admin)):
    _require_enabled()
    patch: Dict[str, Any] = {k: v for k, v in body.model_dump().items() if v is not None}
    if "markets" in patch:
        patch["markets"] = [m for m in patch["markets"] if m in G.MARKETS] or list(G.MARKETS)
    if "term" in patch and "market_terms" not in patch:
        patch["market_terms"] = G.market_terms(patch["term"].strip())
    if "market_terms" in patch:
        patch["market_terms"] = {m: str(t)[:80] for m, t in patch["market_terms"].items() if m in G.MARKETS}
    patch["updated_at"] = G._now().isoformat()
    res = await db.growth_keywords.find_one_and_update({"id": keyword_id}, {"$set": patch}, return_document=True,
                                                       projection={"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="KEYWORD_NOT_FOUND")
    return res


@admin_router.post("/keywords/{keyword_id}/toggle")
async def toggle_keyword(keyword_id: str, _: str = Depends(verify_admin)):
    _require_enabled()
    kw = await db.growth_keywords.find_one({"id": keyword_id}, {"_id": 0})
    if not kw:
        raise HTTPException(status_code=404, detail="KEYWORD_NOT_FOUND")
    await db.growth_keywords.update_one({"id": keyword_id}, {"$set": {"enabled": not kw["enabled"], "updated_at": G._now().isoformat()}})
    return {"id": keyword_id, "enabled": not kw["enabled"]}


@admin_router.delete("/keywords/{keyword_id}")
async def delete_keyword(keyword_id: str, _: str = Depends(verify_admin)):
    _require_enabled()
    res = await db.growth_keywords.delete_one({"id": keyword_id})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail="KEYWORD_NOT_FOUND")
    return {"deleted": keyword_id}


# ─── Settings ─────────────────────────────────────────────────────

@admin_router.put("/settings")
async def put_settings(body: SettingsUpdate, _: str = Depends(verify_admin)):
    _require_enabled()
    try:
        return await G.update_settings(db, body.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


# ─── Radar ────────────────────────────────────────────────────────

@admin_router.get("/radar")
async def radar(market: Optional[str] = Query(default=None), _: str = Depends(verify_admin)):
    _require_enabled()
    q: Dict[str, Any] = {"kind": "timeseries"}
    if market in G.MARKETS:
        q["market"] = market
    snaps = await db.growth_radar_snapshots.find(q, {"_id": 0}).sort("fetched_at", -1).to_list(400)
    latest: Dict[str, Dict[str, Any]] = {}
    for s in snaps:
        latest.setdefault(f"{s['keyword_id']}:{s['market']}", s)
    dq: Dict[str, Any] = {}
    if market in G.MARKETS:
        dq["market"] = market
    disc = await db.growth_radar_discoveries.find(dq, {"_id": 0}).sort("last_seen", -1).to_list(200)
    serp = await G.serp_account_health()
    return {"serpapi": serp, "integration_required": not G.serp_configured(),
            "snapshots": sorted(latest.values(), key=lambda s: s.get("avg_interest") or 0, reverse=True),
            "discoveries": disc, "usage": await G.serp_usage(db)}


class RunScope(BaseModel):
    keyword_ids: Optional[List[str]] = None
    markets: Optional[List[str]] = None
    max_requests: Optional[int] = Field(default=None, ge=1, le=100)
    confirm: bool = False


@admin_router.post("/radar/estimate")
async def radar_estimate(body: RunScope, _: str = Depends(verify_admin)):
    """Dry run — never calls SerpAPI."""
    _require_enabled()
    return await R.estimate_run(db, keyword_ids=body.keyword_ids, markets=body.markets)


@admin_router.post("/radar/refresh", status_code=202)
async def manual_refresh(body: RunScope, background: BackgroundTasks, _: str = Depends(verify_admin)):
    """Quota-consuming. Requires explicit `confirm: true`; refused when the
    estimate exceeds `max_requests` or the remaining server-side budget."""
    _require_enabled()
    if not G.serp_configured():
        raise HTTPException(status_code=409, detail="SERPAPI_INTEGRATION_REQUIRED")
    if not body.confirm:
        raise HTTPException(status_code=409, detail="CONFIRMATION_REQUIRED")
    est = await R.estimate_run(db, keyword_ids=body.keyword_ids, markets=body.markets)
    if est["estimated_requests"] == 0:
        raise HTTPException(status_code=409, detail="NOTHING_TO_RESEARCH")
    if body.max_requests is not None and est["estimated_requests"] > body.max_requests:
        raise HTTPException(status_code=409, detail=f"ESTIMATE_EXCEEDS_MAX:{est['estimated_requests']}>{body.max_requests}")
    if not est["within_budget"]:
        raise HTTPException(status_code=409, detail="BUDGET_INSUFFICIENT")
    run_id = f"manual-{G._now().strftime('%Y%m%dT%H%M%S')}"
    background.add_task(R.run_refresh, db, trigger="manual", run_id=run_id, keyword_ids=body.keyword_ids,
                        markets=body.markets, max_requests=body.max_requests)
    return {"accepted": True, "run_id": run_id, "estimated_requests": est["estimated_requests"], "scope": {
        "keyword_ids": body.keyword_ids, "markets": est["markets"], "max_requests": body.max_requests}}


@admin_router.get("/radar/runs/{run_id}")
async def radar_run(run_id: str, _: str = Depends(verify_admin)):
    _require_enabled()
    run = await db.growth_runs.find_one({"run_id": run_id}, {"_id": 0})
    if not run:
        return {"run_id": run_id, "status": "pending"}
    return run


@admin_router.post("/discoveries/{discovery_id}/status")
async def discovery_status(discovery_id: str, body: StatusUpdate, _: str = Depends(verify_admin)):
    _require_enabled()
    if body.status not in {"new", "watching", "actioned", "dismissed"}:
        raise HTTPException(status_code=422, detail="INVALID_STATUS")
    res = await db.growth_radar_discoveries.update_one({"id": discovery_id}, {"$set": {"status": body.status}})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail="DISCOVERY_NOT_FOUND")
    return {"id": discovery_id, "status": body.status}


# ─── Director ─────────────────────────────────────────────────────

@admin_router.get("/recommendations")
async def recommendations(status: Optional[str] = Query(default=None), _: str = Depends(verify_admin)):
    _require_enabled()
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    rows = await db.growth_recommendations.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"recommendations": rows, "health": (await G.health(db, probe_serp=False))["claude"]}


@admin_router.get("/evidence")
async def evidence(_: str = Depends(verify_admin)):
    _require_enabled()
    return await D.evidence_report(db)


@admin_router.post("/director/generate")
async def director_generate(_: str = Depends(verify_admin)):
    _require_enabled()
    run_id = f"director-{G._now().strftime('%Y%m%dT%H%M%S')}"
    result = await D.generate_recommendations(db, run_id=run_id, trigger="manual")
    await db.growth_runs.insert_one({"id": run_id, "run_id": run_id, "trigger": "manual_director",
                                     "status": "success" if result.get("engine") != "none" else "skipped",
                                     "reason": result.get("reason", ""), "started_at": G._now().isoformat(),
                                     "finished_at": G._now().isoformat(),
                                     "steps": [f"director: {result.get('engine')} · {result.get('created')} new"],
                                     "counters": {"recommendations": result.get("created", 0)}})
    return result


@admin_router.post("/recommendations/{rec_id}/status")
async def recommendation_status(rec_id: str, body: StatusUpdate, _: str = Depends(verify_admin)):
    _require_enabled()
    if body.status not in {"new", "accepted", "in_progress", "done", "dismissed"}:
        raise HTTPException(status_code=422, detail="INVALID_STATUS")
    res = await db.growth_recommendations.update_one({"id": rec_id}, {"$set": {"status": body.status}})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail="RECOMMENDATION_NOT_FOUND")
    return {"id": rec_id, "status": body.status}


# ─── Content drafts ───────────────────────────────────────────────

@admin_router.get("/content-drafts")
async def content_drafts(_: str = Depends(verify_admin)):
    _require_enabled()
    rows = await db.growth_content_drafts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"drafts": rows, "formats": D.DRAFT_FORMATS, "sources": await D.eligible_sources(db), "publish_locked": True}


@admin_router.post("/content-drafts/generate", status_code=201)
async def generate_draft(body: DraftRequest, _: str = Depends(verify_admin)):
    _require_enabled()
    try:
        return await D.generate_draft(db, recommendation_id=body.recommendation_id, discovery_id=body.discovery_id,
                                      fmt=body.format, notes=body.notes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc).upper())
    except D.ClaudeError as exc:
        raise HTTPException(status_code=502, detail=f"CLAUDE_{str(exc).upper()}")


@admin_router.put("/content-drafts/{draft_id}")
async def update_draft(draft_id: str, body: DraftUpdate, _: str = Depends(verify_admin)):
    _require_enabled()
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    if "status" in patch and patch["status"] not in {"draft", "reviewed", "archived"}:
        raise HTTPException(status_code=422, detail="INVALID_STATUS")
    patch["updated_at"] = G._now().isoformat()
    patch["published"] = False
    res = await db.growth_content_drafts.find_one_and_update({"id": draft_id}, {"$set": patch}, return_document=True,
                                                             projection={"_id": 0})
    if not res:
        raise HTTPException(status_code=404, detail="DRAFT_NOT_FOUND")
    return res


@admin_router.delete("/content-drafts/{draft_id}")
async def delete_draft(draft_id: str, _: str = Depends(verify_admin)):
    _require_enabled()
    res = await db.growth_content_drafts.delete_one({"id": draft_id})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail="DRAFT_NOT_FOUND")
    return {"deleted": draft_id}


# ─── Activity ─────────────────────────────────────────────────────

@admin_router.get("/activity")
async def activity(_: str = Depends(verify_admin)):
    _require_enabled()
    runs = await db.growth_runs.find({}, {"_id": 0}).sort("started_at", -1).to_list(50)
    ledger = await db.growth_api_ledger.find({}, {"_id": 0}).sort("at", -1).to_list(100)
    return {"runs": runs, "ledger": ledger, "schedule": await G.schedule_status(db), "usage": await G.serp_usage(db)}


# ─── Cron intake ──────────────────────────────────────────────────

def _cron_authorized(request: Request) -> bool:
    secret = (os.environ.get("WEBHOOK_CRON_SECRET") or "").strip()
    header = request.headers.get("authorization") or ""
    if not secret or not header.lower().startswith("bearer "):
        return False
    return hmac.compare_digest(header[7:].strip(), secret)


@cron_router.post("/daily-refresh", status_code=202)
async def cron_daily_refresh(request: Request, background: BackgroundTasks):
    # Cron endpoints must ack 2xx immediately; enqueue/background the actual work.
    if not _cron_authorized(request):
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        envelope = await request.json()
    except Exception:
        envelope = {}
    if not isinstance(envelope, dict):
        raise HTTPException(status_code=400, detail="Invalid body")
    run_id = request.headers.get("x-webhook-id") or envelope.get("run_id") or f"cron-{G._now().strftime('%Y%m%dT%H%M')}"
    if not G.is_enabled():
        return {"accepted": False, "reason": "growth_os_disabled", "run_id": run_id}
    if not G.cron_enabled():
        return {"accepted": False, "reason": "cron_disabled", "run_id": run_id}
    if await db.growth_runs.find_one({"run_id": run_id}, {"_id": 1}):
        return {"accepted": True, "duplicate": True, "run_id": run_id}
    background.add_task(R.run_refresh, db, trigger="cron", run_id=run_id)
    return {"accepted": True, "run_id": run_id}
