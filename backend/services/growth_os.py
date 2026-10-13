"""PHILEON Growth OS — Phase 1 core (flags · settings · keywords · schedule · budget · health).

Invariants:
    * Admin-only. Zero public-site / checkout / pricing / catalogue effect.
    * Never fabricates research. Missing integration => "integration_required".
    * `PHILEON_GROWTH_OS_ENABLED` gates the module; `GROWTH_OS_CRON_ENABLED`
      separately gates scheduled refreshes (default OFF).
    * Secrets (SERPAPI_API_KEY, WEBHOOK_CRON_SECRET, EMERGENT_LLM_KEY,
      TYPESAFE_API_KEY) are never returned, logged or echoed.
"""
from __future__ import annotations

import hashlib
import logging
import os
import re
import time
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from zoneinfo import ZoneInfo

import httpx

log = logging.getLogger("phileon.growth_os")

TORONTO = ZoneInfo("America/Toronto")
REFRESH_HOUR_LOCAL = 7
MARKETS = ("CA", "US")
CRON_NAME = "growth-os-daily"

SETTINGS_ID = "growth_os"
DEFAULT_SETTINGS: Dict[str, Any] = {
    "serp_daily_limit": 40,
    "serp_monthly_limit": 300,
    "related_queries_per_run": 4,
    "snapshot_ttl_hours": 20,
    "director_max_recommendations": 6,
}

SEED_KEYWORDS: Dict[str, List[str]] = {
    "Bespoke and Custom Jewellery": [
        "Custom diamond jewellery", "Bespoke engagement rings", "Custom gold rings",
        "Personalized luxury jewellery", "Jewellery redesign",
    ],
    "Men's Luxury Jewellery": [
        "Men's diamond rings", "Luxury signet rings", "Men's gold bracelets",
        "Men's statement jewellery", "Custom gold chains",
    ],
    "Contemporary Fine Jewellery": [
        "Modern tennis bracelets", "Diamond cuff bracelets", "Sculptural gold jewellery",
        "Luxury statement rings", "Unisex fine jewellery",
    ],
    "Bridal and Milestone": [
        "Unique wedding bands", "Custom anniversary jewellery",
        "Alternative engagement rings", "Diamond anniversary gifts",
    ],
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _truthy(name: str) -> bool:
    return str(os.environ.get(name) or "").strip().lower() in {"true", "1", "yes", "on"}


# ─── Flags ────────────────────────────────────────────────────────

def is_enabled() -> bool:
    return _truthy("PHILEON_GROWTH_OS_ENABLED")


def cron_enabled() -> bool:
    return _truthy("GROWTH_OS_CRON_ENABLED")


def serp_configured() -> bool:
    return bool((os.environ.get("SERPAPI_API_KEY") or "").strip())


def claude_configured() -> bool:
    return bool((os.environ.get("EMERGENT_LLM_KEY") or "").strip())


def cron_secret_configured() -> bool:
    return len((os.environ.get("WEBHOOK_CRON_SECRET") or "").strip()) >= 16


# ─── Keyword spelling variants ────────────────────────────────────

_SPELL = [(re.compile(r"jewellery", re.I), "jewelry"), (re.compile(r"personalised", re.I), "personalized")]


def market_terms(term: str) -> Dict[str, str]:
    us = term
    for rx, repl in _SPELL:
        us = rx.sub(lambda m: repl.capitalize() if m.group(0)[0].isupper() else repl, us)
    return {"CA": term, "US": us}


def new_keyword(term: str, category: str, source: str = "manual") -> Dict[str, Any]:
    now = _now().isoformat()
    return {
        "id": str(uuid.uuid4()), "term": term.strip(), "category": category.strip(),
        "markets": list(MARKETS), "market_terms": market_terms(term.strip()),
        "enabled": True, "source": source, "created_at": now, "updated_at": now,
    }


async def ensure_seed(db) -> int:
    settings = await get_settings(db)
    if settings.get("seeded"):
        return 0
    docs = [new_keyword(t, cat, source="seed") for cat, terms in SEED_KEYWORDS.items() for t in terms]
    if docs:
        await db.growth_keywords.insert_many(docs)
    await db.growth_settings.update_one({"_id": SETTINGS_ID}, {"$set": {"seeded": True}}, upsert=True)
    return len(docs)


# ─── Settings ─────────────────────────────────────────────────────

async def get_settings(db) -> Dict[str, Any]:
    doc = await db.growth_settings.find_one({"_id": SETTINGS_ID}) or {}
    out = {**DEFAULT_SETTINGS, **{k: v for k, v in doc.items() if k != "_id"}}
    return out


async def update_settings(db, patch: Dict[str, Any]) -> Dict[str, Any]:
    allowed = {k: int(v) for k, v in patch.items() if k in DEFAULT_SETTINGS and v is not None}
    for k, v in allowed.items():
        if v < 0 or v > 100000:
            raise ValueError(f"{k} out of range")
    if allowed:
        await db.growth_settings.update_one({"_id": SETTINGS_ID}, {"$set": allowed}, upsert=True)
    return await get_settings(db)


# ─── Schedule (07:00 America/Toronto, DST-aware) ─────────────────

def next_scheduled_run(now: Optional[datetime] = None) -> Dict[str, Any]:
    now = now or _now()
    local = now.astimezone(TORONTO)
    candidate = local.replace(hour=REFRESH_HOUR_LOCAL, minute=0, second=0, microsecond=0)
    if candidate <= local:
        candidate = (candidate + timedelta(days=1)).replace(hour=REFRESH_HOUR_LOCAL)
    candidate = datetime(candidate.year, candidate.month, candidate.day, REFRESH_HOUR_LOCAL, tzinfo=TORONTO)
    return {
        "local": candidate.isoformat(), "utc": candidate.astimezone(timezone.utc).isoformat(),
        "timezone": "America/Toronto", "cron": f"0 {REFRESH_HOUR_LOCAL} * * *", "name": CRON_NAME,
    }


async def schedule_status(db) -> Dict[str, Any]:
    last_ok = await db.growth_runs.find_one({"status": {"$in": ["success", "partial"]}}, {"_id": 0},
                                            sort=[("finished_at", -1)])
    last_any = await db.growth_runs.find_one({}, {"_id": 0}, sort=[("started_at", -1)])
    nxt = next_scheduled_run()
    armed = is_enabled() and cron_enabled() and serp_configured() and cron_secret_configured()
    return {
        "next_run": nxt,
        "next_run_will_execute": armed,
        "cron_enabled": cron_enabled(),
        "cron_secret_configured": cron_secret_configured(),
        "last_successful_run": {k: last_ok.get(k) for k in ("run_id", "trigger", "status", "started_at", "finished_at", "counters")} if last_ok else None,
        "last_run": {k: last_any.get(k) for k in ("run_id", "trigger", "status", "reason", "started_at", "finished_at")} if last_any else None,
    }


# ─── SerpAPI budget ledger ────────────────────────────────────────

async def record_api_call(db, *, provider: str, kind: str, market: str = "", terms: int = 0,
                          cached: bool = False, ok: bool = True) -> None:
    now = _now()
    await db.growth_api_ledger.insert_one({
        "id": str(uuid.uuid4()), "provider": provider, "kind": kind, "market": market,
        "terms": terms, "cached": cached, "ok": ok, "billable": (not cached) and ok,
        "day": now.strftime("%Y-%m-%d"), "month": now.strftime("%Y-%m"), "at": now.isoformat(),
    })


async def serp_usage(db, settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    settings = settings or await get_settings(db)
    now = _now()
    day, month = now.strftime("%Y-%m-%d"), now.strftime("%Y-%m")
    used_day = await db.growth_api_ledger.count_documents({"provider": "serpapi", "billable": True, "day": day})
    used_month = await db.growth_api_ledger.count_documents({"provider": "serpapi", "billable": True, "month": month})
    return {
        "daily_used": used_day, "daily_limit": settings["serp_daily_limit"],
        "daily_remaining": max(0, settings["serp_daily_limit"] - used_day),
        "monthly_used": used_month, "monthly_limit": settings["serp_monthly_limit"],
        "monthly_remaining": max(0, settings["serp_monthly_limit"] - used_month),
    }


# ─── Integration health ───────────────────────────────────────────

_serp_account_cache: Dict[str, Any] = {"at": 0.0, "data": None}


async def serp_account_health(force: bool = False) -> Dict[str, Any]:
    """Free SerpAPI /account.json probe (does not consume searches). Cached 10 min."""
    if not serp_configured():
        return {"status": "integration_required", "reason": "SERPAPI_API_KEY not configured",
                "configured": False}
    if not force and _serp_account_cache["data"] and time.time() - _serp_account_cache["at"] < 600:
        return _serp_account_cache["data"]
    key = (os.environ.get("SERPAPI_API_KEY") or "").strip()
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(12.0, connect=5.0)) as c:
            r = await c.get("https://serpapi.com/account.json", params={"api_key": key})
        if r.status_code in (401, 403):
            data = {"status": "error", "reason": "SerpAPI rejected the key (auth)", "configured": True}
        elif r.status_code >= 400:
            data = {"status": "error", "reason": f"SerpAPI account probe failed ({r.status_code})", "configured": True}
        else:
            raw = r.json()
            data = {"status": "operational", "configured": True, "account": {
                k: raw.get(k) for k in ("plan_name", "searches_per_month", "plan_searches_left",
                                        "total_searches_left", "this_month_usage", "account_rate_limit_per_hour")}}
    except httpx.HTTPError as exc:
        data = {"status": "error", "reason": f"SerpAPI unreachable ({type(exc).__name__})", "configured": True}
    _serp_account_cache.update(at=time.time(), data=data)
    return data


def jev_health(settings: Dict[str, Any]) -> Dict[str, Any]:
    from services.intent_classifier import is_enabled as jev_enabled
    enabled = jev_enabled()
    last_err = settings.get("jev_last_error")
    last_ok = settings.get("jev_last_ok_at")
    if not enabled:
        return {"status": "inactive", "reason": "TYPESAFE_API_KEY / shadow flag not active",
                "fallback": "deterministic", "configured": False}
    if last_err and (not last_ok or last_err.get("at", "") > last_ok):
        return {"status": "error", "reason": last_err.get("reason", "auth failed"),
                "fallback": "deterministic", "configured": True, "last_error_at": last_err.get("at")}
    return {"status": "configured" if not last_ok else "operational", "fallback": "deterministic",
            "configured": True, "last_ok_at": last_ok}


async def health(db, *, probe_serp: bool = True) -> Dict[str, Any]:
    settings = await get_settings(db)
    serp = await serp_account_health() if probe_serp else {
        "status": "integration_required" if not serp_configured() else "configured", "configured": serp_configured()}
    claude_ok = settings.get("claude_last_ok_at")
    claude_err = settings.get("claude_last_error")
    if not claude_configured():
        claude = {"status": "integration_required", "reason": "EMERGENT_LLM_KEY not configured", "configured": False}
    elif claude_err and (not claude_ok or claude_err.get("at", "") > claude_ok):
        claude = {"status": "error", "reason": claude_err.get("reason"), "configured": True,
                  "last_error_at": claude_err.get("at"), "fallback": "deterministic"}
    else:
        claude = {"status": "operational" if claude_ok else "configured", "configured": True,
                  "model": "claude-sonnet-5-5", "last_ok_at": claude_ok}
    return {
        "growth_os": {"status": "enabled" if is_enabled() else "disabled", "flag": "PHILEON_GROWTH_OS_ENABLED"},
        "scheduler": {"status": "enabled" if cron_enabled() else "disabled", "flag": "GROWTH_OS_CRON_ENABLED",
                      "secret_configured": cron_secret_configured()},
        "serpapi": serp,
        "claude": claude,
        "jev": jev_health(settings),
    }


async def mark_integration(db, name: str, *, ok: bool, reason: str = "") -> None:
    now = _now().isoformat()
    patch = {f"{name}_last_ok_at": now} if ok else {f"{name}_last_error": {"at": now, "reason": reason[:200]}}
    await db.growth_settings.update_one({"_id": SETTINGS_ID}, {"$set": patch}, upsert=True)


# ─── Misc helpers ─────────────────────────────────────────────────

def fingerprint(*parts: str) -> str:
    norm = "|".join(re.sub(r"\s+", " ", (p or "").strip().lower()) for p in parts)
    return hashlib.sha256(norm.encode()).hexdigest()[:32]


async def ensure_indexes(db) -> None:
    async def _try(fn):
        try:
            await fn()
        except Exception as exc:  # pragma: no cover
            log.warning("growth_os index skipped: %s", exc)
    await _try(lambda: db.growth_keywords.create_index("id", unique=True))
    await _try(lambda: db.growth_radar_snapshots.create_index([("keyword_id", 1), ("market", 1), ("fetched_at", -1)]))
    await _try(lambda: db.growth_radar_discoveries.create_index("fingerprint", unique=True))
    await _try(lambda: db.growth_recommendations.create_index("fingerprint", unique=True))
    await _try(lambda: db.growth_runs.create_index("run_id", unique=True))
    await _try(lambda: db.growth_api_ledger.create_index([("provider", 1), ("billable", 1), ("day", 1)]))
    await _try(lambda: db.growth_api_ledger.create_index([("provider", 1), ("billable", 1), ("month", 1)]))
    await _try(lambda: db.growth_content_drafts.create_index("id", unique=True))
