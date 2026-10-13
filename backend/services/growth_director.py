"""PHILEON Growth OS — AI Growth Director (Claude Sonnet 5.5, evidence-grounded) + content drafts.

    * Every recommendation MUST cite evidence ids from the ledger assembled
      server-side (radar snapshots, discoveries, internal analytics).
      Recommendations citing unknown evidence are discarded.
    * Evidence carries PROVENANCE (source collection, period, env, event
      count, sessions) and a QUALITY grade:
          verified   – production env, genuine sessions, real catalogue slug
          unverified – preview/test environment or otherwise unconfirmed
          test       – synthetic fixtures (unknown slug, test session ids)
      `test` evidence is EXCLUDED from the ledger. `unverified` evidence may
      only support exploratory, non-revenue recommendations.
    * No evidence → no recommendations ("no_evidence"). Nothing invented.
    * Near-duplicate recommendations are CLUSTERED into one initiative
      (deterministic token/evidence similarity) — never padded to fill.
    * Priority is a deterministic score (quality · sufficiency · relevance ·
      impact · effort), NOT an LLM confidence percentage.
    * Claude failure → deterministic rule engine (engine stamped).
    * Content is DRAFT ONLY. Never published, sent or promoted anywhere.
"""
from __future__ import annotations

import json
import logging
import math
import os
import re
import uuid
from datetime import timedelta
from typing import Any, Dict, List, Optional, Tuple

from services import growth_os as G
from services.analytics_service import build_products, top_searches, current_env

log = logging.getLogger("phileon.growth_director")

MODEL = ("anthropic", "claude-sonnet-5-5")
CHANNELS = {"content", "seo", "social", "concierge", "collection", "email_concept", "bespoke"}
REVENUE_CHANNELS = {"collection", "concierge", "bespoke", "email_concept"}
CHANNEL_GROUP = {"content": "site", "seo": "site", "collection": "site",
                 "concierge": "relationship", "email_concept": "relationship", "bespoke": "relationship",
                 "social": "social"}
PERIOD = "30d"
SUFFICIENT_EVENTS = 30          # below this every recommendation is an exploratory hypothesis
ESTABLISHED_EVENTS = 200
MIN_VERIFIED_SESSIONS = 3
MIN_VERIFIED_DAYS = 2
# Genuine browser sessions are minted by frontend/src/hooks/useAnalytics.js as `phi-<uuid>`
# (fallback `phi-<base36>`); anything else cannot be attributed to a real visitor.
_GENUINE_SESSION_RX = re.compile(r"^phi-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-z0-9]{12,})$", re.I)
_TEST_SESSION_RX = re.compile(r"^(sess-x+$|phi-real-|phi-test|test|pytest|qa-|seed|fixture)", re.I)
DRAFT_FORMATS = {
    "instagram_caption": "Instagram caption (≤120 words, editorial, no hashtags spam, max 3 tags)",
    "blog_outline": "Editorial journal/blog outline (title + 5 section headers + 1-line notes)",
    "email_concept": "Email concept (subject, preheader, 3 short paragraphs). No discounts, no urgency.",
    "product_story": "Product story paragraph (≤150 words) in PHILEON's cinematic editorial voice",
    "landing_copy": "Landing-page copy block (headline, sub-headline, 3 proof points, CTA label)",
}


class ClaudeError(Exception):
    pass


async def _claude(system: str, prompt: str, *, session: str, max_tokens: int = 4000) -> str:
    key = (os.environ.get("EMERGENT_LLM_KEY") or "").strip()
    if not key:
        raise ClaudeError("integration_required")
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    chat = LlmChat(api_key=key, session_id=session, system_message=system).with_model(*MODEL)
    try:
        chat = chat.with_params(max_tokens=max_tokens)
    except Exception:  # pragma: no cover - older lib
        pass
    out = await chat.send_message(UserMessage(text=prompt))
    return out if isinstance(out, str) else str(out)


def _extract_json(text: str) -> Any:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.S)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"(\[.*\]|\{.*\})", text, flags=re.S)
        if not m:
            raise
        return json.loads(m.group(1))


# ─── Provenance / quality ─────────────────────────────────────────

def _catalog_slugs() -> set:
    try:
        from services.pricing_engine_catalog import ALL_SLUGS
        return set(ALL_SLUGS)
    except Exception:  # pragma: no cover
        return set()


def grade_internal(env: str, *, sessions: List[str], event_count: int, slug_known: Optional[bool] = None,
                   days: int = 0) -> Tuple[str, str]:
    """Return (quality, reason). `verified` demands PROVENANCE, not a label:
    production env AND genuine browser-session ids AND enough distinct
    sessions AND activity spread over several days. The env label alone
    never establishes real customers."""
    if slug_known is False:
        return "test", "product slug is not in the PHILEON catalogue (synthetic fixture)"
    sess = [str(s) for s in sessions if s]
    fixture = [s for s in sess if _TEST_SESSION_RX.match(s)]
    genuine = [s for s in sess if _GENUINE_SESSION_RX.match(s)]
    if sess and len(fixture) == len(sess):
        return "test", "all events originate from test-fixture session ids"
    if fixture:
        return "test", f"{len(fixture)} of {len(sess)} sessions are test-fixture ids (contaminated sample)"
    if env != "production":
        return "unverified", f"{env} environment traffic is owner/agent/QA activity, not public customers"
    if not genuine:
        return "unverified", "no genuine browser session ids (phi-<uuid>) behind these events"
    if len(genuine) < len(sess):
        return "unverified", f"only {len(genuine)} of {len(sess)} sessions have genuine browser ids"
    if len(genuine) < MIN_VERIFIED_SESSIONS:
        return "unverified", f"fewer than {MIN_VERIFIED_SESSIONS} distinct genuine sessions"
    if days < MIN_VERIFIED_DAYS:
        return "unverified", f"activity confined to fewer than {MIN_VERIFIED_DAYS} distinct days"
    if event_count < 5:
        return "unverified", "too few events to attribute to genuine customer behaviour"
    return "verified", f"production traffic · {len(genuine)} genuine sessions · {days} days"


def _strength(total_events: int, worst_quality: str) -> str:
    if worst_quality != "verified" or total_events < SUFFICIENT_EVENTS:
        return "exploratory"
    return "established" if total_events >= ESTABLISHED_EVENTS else "indicative"


async def _distinct_days(coll, match: Dict[str, Any]) -> int:
    pipeline = [{"$match": match}, {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}}}},
                {"$count": "n"}]
    try:
        rows = await coll.aggregate(pipeline).to_list(1)
        return int(rows[0]["n"]) if rows else 0
    except Exception:  # pragma: no cover - non-date created_at
        return 0


# ─── Evidence ledger ──────────────────────────────────────────────

async def collect_evidence(db, *, include_excluded: bool = False) -> Tuple[List[Dict[str, Any]], Dict[str, Dict[str, Any]]]:
    """Returns (ledger, index). Ledger items carry `provenance` + `quality`.
    `test` items are excluded unless include_excluded (for the admin UI)."""
    items: List[Dict[str, Any]] = []
    env = current_env()
    since = (G._now() - timedelta(days=30))
    period = {"label": PERIOD, "from": since.isoformat(), "to": G._now().isoformat()}

    def _add(kind: str, text: str, provenance: Dict[str, Any], quality: str, reason: str, **meta):
        items.append({"kind": kind, "text": text, "provenance": provenance, "quality": quality,
                      "quality_reason": reason, "excluded": quality == "test", **meta})

    snaps = await db.growth_radar_snapshots.find({"kind": "timeseries"}, {"_id": 0}).sort("fetched_at", -1).to_list(200)
    latest: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for s in snaps:
        latest.setdefault((s["keyword_id"], s["market"]), s)
    ranked = sorted(latest.values(), key=lambda s: (abs(s.get("trend_delta_pct") or 0), s.get("avg_interest") or 0), reverse=True)
    for s in ranked[:12]:
        _add("radar_trend", f"Google Trends {s['market']}: '{s['query_term']}' avg interest {s['avg_interest']}/100, "
             f"latest {s['latest_value']}, recent 4-wk vs prior 4-wk {s['trend_delta_pct']:+}%",
             {"source": "serpapi_google_trends", "collection": "growth_radar_snapshots", "period": "today 12-m",
              "env": "external", "event_count": s.get("points", 0), "fetched_at": s.get("fetched_at")},
             "verified", "external market data (SerpAPI Google Trends)", market=s["market"],
             keyword_id=s["keyword_id"], category=s.get("category"), events=s.get("points", 0))
    disc = await db.growth_radar_discoveries.find({"status": {"$in": ["new", "watching"]}}, {"_id": 0}) \
        .sort("last_seen", -1).to_list(40)
    for d in disc[:12]:
        _add("radar_discovery", f"Rising Google query in {d['market']}: '{d['query']}' ({d.get('value')}) related to "
             f"'{d['source_keyword']}', priority {d.get('priority')} ({d.get('priority_engine')})",
             {"source": "serpapi_google_trends", "collection": "growth_radar_discoveries", "period": "today 12-m",
              "env": "external", "event_count": d.get("seen_count", 1), "fetched_at": d.get("last_seen")},
             "verified", "external market data (SerpAPI Google Trends)", market=d["market"],
             discovery_id=d["id"], category=d.get("category"), events=d.get("seen_count", 1))

    slugs = _catalog_slugs()
    try:
        prod = await build_products(db, env=env, period=PERIOD, limit=8)
        for p in prod.get("products", []):
            if (p["views"] or 0) < 5 and not p["paid_orders"]:
                continue
            slug = p["product_slug"]
            match = {"env": env, "product_slug": slug, "created_at": {"$gte": since}}
            sessions = await db.behavior_events.distinct("session_id", match)
            days = await _distinct_days(db.behavior_events, match)
            n = sum(int(p.get(k) or 0) for k in ("views", "likes", "adds", "checkout_starts", "paid_orders"))
            q, reason = grade_internal(env, sessions=sessions, event_count=n, days=days,
                                       slug_known=(slug in slugs) if slugs else None)
            _add("internal_product", f"Site ({PERIOD}, {env}): '{slug}' views {p['views']}, likes {p['likes']}, "
                 f"adds {p['adds']}, checkout starts {p['checkout_starts']}, paid orders {p['paid_orders']}",
                 {"source": "site_behaviour_events", "collection": "behavior_events", "period": PERIOD, "env": env,
                  "event_count": n, "distinct_sessions": len(sessions), "distinct_days": days,
                  "catalogue_match": slug in slugs, **period}, q, reason, product_slug=slug, events=n)
        srch = await top_searches(db, env=env, period=PERIOD, limit=8)
        for q_ in srch.get("zero_result_searches", [])[:6]:
            if q_.get("count", 0) < 2:
                continue
            match = {"env": env, "normalized_query": q_["query"], "created_at": {"$gte": since}}
            sessions = await db.search_events.distinct("session_id", match)
            days = await _distinct_days(db.search_events, match)
            q, reason = grade_internal(env, sessions=sessions, event_count=q_["count"], days=days)
            _add("internal_search_gap", f"Site search ({PERIOD}): '{q_['query']}' returned zero results {q_['count']} times",
                 {"source": "site_search_events", "collection": "search_events", "period": PERIOD, "env": env,
                  "event_count": q_["count"], "distinct_sessions": len(sessions), "distinct_days": days, **period}, q, reason,
                 query=q_["query"], events=q_["count"])
        for q_ in srch.get("top_searches", [])[:5]:
            if q_.get("count", 0) < 3:
                continue
            match = {"env": env, "normalized_query": q_["query"], "created_at": {"$gte": since}}
            sessions = await db.search_events.distinct("session_id", match)
            days = await _distinct_days(db.search_events, match)
            q, reason = grade_internal(env, sessions=sessions, event_count=q_["count"], days=days)
            _add("internal_search", f"Site search ({PERIOD}): '{q_['query']}' searched {q_['count']} times "
                 f"(avg {q_['avg_results']} results)",
                 {"source": "site_search_events", "collection": "search_events", "period": PERIOD, "env": env,
                  "event_count": q_["count"], "distinct_sessions": len(sessions), "distinct_days": days, **period}, q, reason,
                 query=q_["query"], events=q_["count"])
    except Exception as exc:  # pragma: no cover
        log.warning("internal evidence unavailable: %s", exc)

    ledger: List[Dict[str, Any]] = []
    for e in items:
        if e["excluded"] and not include_excluded:
            continue
        ledger.append(e)
    for i, e in enumerate(ledger, 1):
        e["id"] = f"E{i:03d}"
    return ledger, {e["id"]: e for e in ledger}


# ─── Clustering ───────────────────────────────────────────────────

_STOP = {"a", "an", "the", "and", "or", "for", "to", "of", "on", "in", "with", "via", "page", "pages", "create",
         "add", "build", "improve", "optimize", "optimise", "optimization", "optimisation", "launch", "new", "site",
         "phileon", "editorial", "experience", "dedicated", "landing", "section", "block", "strategy", "plan"}


def _tokens(*texts: str) -> set:
    out = set()
    for t in texts:
        for w in re.split(r"[^a-z0-9]+", (t or "").lower()):
            if len(w) < 3 or w in _STOP:
                continue
            out.add(w[:-1] if w.endswith("s") and len(w) > 4 else w)
    return out


def similar(a: Dict[str, Any], b: Dict[str, Any]) -> bool:
    """Substantially equivalent action? Same channel group AND either strong
    token overlap or shared evidence + shared topic token."""
    if CHANNEL_GROUP.get(a.get("channel")) != CHANNEL_GROUP.get(b.get("channel")):
        return False
    if a.get("market") != b.get("market") and "ALL" not in (a.get("market"), b.get("market")):
        return False
    ta, tb = _tokens(a.get("title"), a.get("action")), _tokens(b.get("title"), b.get("action"))
    if not ta or not tb:
        return False
    jacc = len(ta & tb) / len(ta | tb)
    shared_ev = bool(set(a.get("evidence_ids") or []) & set(b.get("evidence_ids") or []))
    return jacc >= 0.5 or (shared_ev and bool(ta & tb))


def cluster(recs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Greedy single-link clustering; returns consolidated initiatives."""
    groups: List[List[Dict[str, Any]]] = []
    for r in recs:
        for g in groups:
            if any(similar(r, m) for m in g):
                g.append(r)
                break
        else:
            groups.append([r])
    out = []
    for g in groups:
        head = dict(g[0])
        actions = []
        for m in g:
            for a in (m.get("actions") or [m.get("action")]):
                if a and a not in actions:
                    actions.append(a)
        head["actions"] = actions[:6]
        head["action"] = actions[0] if actions else head.get("action", "")
        head["evidence_ids"] = sorted({i for m in g for i in (m.get("evidence_ids") or [])})
        head["merged_variants"] = len(g) - 1
        head["variant_titles"] = [m["title"] for m in g[1:]]
        if len(g) > 1:
            head["channel"] = max((m.get("channel") for m in g), key=lambda c: [m.get("channel") for m in g].count(c))
        out.append(head)
    return out


# ─── Deterministic scoring ────────────────────────────────────────

_IMPACT = {"high": 15, "medium": 8, "low": 3}
_EFFORT = {"high": 10, "medium": 5, "low": 0}
_RELEVANCE = {"collection": 20, "concierge": 18, "bespoke": 18, "seo": 12, "content": 12, "email_concept": 10, "social": 8}


def score(rec: Dict[str, Any], index: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    ev = [index[i] for i in rec.get("evidence_ids", []) if i in index]
    qualities = [e["quality"] for e in ev] or ["unverified"]
    worst = "test" if "test" in qualities else "unverified" if "unverified" in qualities else "verified"
    events = sum(int(e.get("events") or 0) for e in ev)
    strength = _strength(events, worst)
    s = {"verified": 30, "unverified": 10, "test": 0}[worst]
    s += min(20, int(6 * math.log10(events + 1)))
    s += _RELEVANCE.get(rec.get("channel"), 8)
    s += _IMPACT.get(str(rec.get("impact") or "medium").lower(), 8)
    s -= _EFFORT.get(str(rec.get("effort") or "medium").lower(), 5)
    s += 5 if rec.get("merged_variants") else 0
    s = max(0, min(100, s))
    priority = "HIGH" if s >= 65 else "MEDIUM" if s >= 40 else "LOW"
    if strength == "exploratory" and priority == "HIGH":
        priority = "MEDIUM"
    return {"score": s, "priority": priority, "evidence_strength": strength, "exploratory": strength == "exploratory",
            "evidence_quality": worst, "evidence_events": events,
            "provenance": [{"id": e["id"], "quality": e["quality"], **e["provenance"]} for e in ev]}


# ─── Deterministic fallback ───────────────────────────────────────

def deterministic_recommendations(evidence: List[Dict[str, Any]], limit: int) -> List[Dict[str, Any]]:
    recs: List[Dict[str, Any]] = []
    for e in evidence:
        if e.get("quality") == "test":
            continue
        if e["kind"] == "internal_search_gap":
            recs.append({"title": f"Close catalogue gap for '{e['query']}'", "channel": "collection", "market": "ALL",
                         "impact": "medium", "effort": "medium", "evidence_ids": [e["id"]],
                         "rationale": "Repeated zero-result searches signal unmet demand on the site.",
                         "action": f"Review whether a piece or editorial page should answer '{e['query']}'; add synonyms to search."})
        elif e["kind"] == "internal_product":
            m = re.search(r"views (\d+).*checkout starts (\d+), paid orders (\d+)", e["text"])
            if m and int(m.group(1)) >= 20 and int(m.group(3)) == 0:
                recs.append({"title": f"Convert interest on '{e['product_slug']}'", "channel": "concierge", "market": "ALL",
                             "impact": "medium", "effort": "low", "evidence_ids": [e["id"]],
                             "rationale": "High attention with no paid orders in 30 days.",
                             "action": "Offer a concierge consultation CTA and a sizing/finish explainer on this product page."})
        elif e["kind"] == "radar_discovery" and "priority HIGH" in e["text"]:
            recs.append({"title": f"Editorial response to rising demand in {e['market']}", "channel": "content",
                         "market": e["market"], "impact": "medium", "effort": "medium", "evidence_ids": [e["id"]],
                         "rationale": "A breakout/high-priority rising query maps to PHILEON's category.",
                         "action": "Draft a journal piece and collection landing block aligned to this query."})
    return recs[:limit]


# ─── Recommendation generation ────────────────────────────────────

_SYSTEM = (
    "You are the PHILEON Growth Director. PHILEON is a Toronto-based luxury fine-jewellery house "
    "(bespoke diamond and gold pieces, men's luxury jewellery, contemporary sculptural pieces, bridal). "
    "Markets: Canada (CA) and United States (US). You produce customer-acquisition INITIATIVES that are STRICTLY "
    "grounded in the numbered evidence supplied. Rules: cite evidence ids for every initiative; never invent "
    "statistics, trends or customers; no paid ads launches; no discounts, urgency or scarcity tactics; tone is calm, "
    "editorial, luxury. Consolidate: one initiative per DISTINCT business opportunity — fold variations (e.g. a landing "
    "page, a collection page and search tuning for the same theme) into ONE initiative with several actions. Fewer is "
    "better; return [] if the evidence does not support a distinct opportunity. Evidence graded 'unverified' may only "
    "support exploratory hypotheses in channels content/seo/social — never collection, concierge, bespoke or email. "
    "Output ONLY a JSON array."
)


def _sanitize(r: Dict[str, Any], index: Dict[str, Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    ids = [i for i in (r.get("evidence_ids") or []) if i in index]
    if not ids or not r.get("title"):
        return None
    channel = r.get("channel") if r.get("channel") in CHANNELS else "content"
    worst_unverified = any(index[i]["quality"] != "verified" for i in ids)
    if worst_unverified and channel in REVENUE_CHANNELS:
        return None  # unverified evidence cannot back revenue-related recommendations
    actions = [str(a)[:300] for a in (r.get("actions") or []) if a][:6] or [str(r.get("action") or "")[:300]]
    return {"title": str(r["title"])[:120], "rationale": str(r.get("rationale") or "")[:400],
            "action": actions[0], "actions": actions, "channel": channel,
            "market": r.get("market") if r.get("market") in ("CA", "US", "ALL") else "ALL",
            "impact": r.get("impact") if str(r.get("impact")).lower() in _IMPACT else "medium",
            "effort": r.get("effort") if str(r.get("effort")).lower() in _EFFORT else "medium",
            "evidence_ids": ids}


async def _persist(db, recs: List[Dict[str, Any]], index, *, engine: str, run_id: str, trigger: str) -> int:
    created, now = 0, G._now().isoformat()
    existing = await db.growth_recommendations.find(
        {"status": {"$in": ["new", "accepted", "in_progress"]}}, {"_id": 0}).to_list(300)
    for r in recs:
        r.update(score(r, index))
        if r["exploratory"]:
            r["rationale"] = ("Exploratory hypothesis (limited / unverified evidence): " + r["rationale"])[:400]
        twin = next((e for e in existing if similar(r, e)), None)
        if twin:
            new_actions = [a for a in r["actions"] if a not in (twin.get("actions") or [twin.get("action")])]
            await db.growth_recommendations.update_one({"id": twin["id"]}, {
                "$set": {"last_seen": now, "evidence_ids": sorted(set(twin.get("evidence_ids", [])) | set(r["evidence_ids"]))},
                "$inc": {"seen_count": 1, "merged_variants": 1},
                "$push": {"variant_titles": r["title"], **({"actions": {"$each": new_actions[:3]}} if new_actions else {})}})
            continue
        doc = {"id": str(uuid.uuid4()), "fingerprint": G.fingerprint(r["title"], r["market"], r["channel"]), **r,
               "engine": engine, "run_id": run_id, "trigger": trigger, "status": "new", "created_at": now,
               "last_seen": now, "seen_count": 1, "evidence": [index[i] for i in r["evidence_ids"]]}
        await db.growth_recommendations.insert_one(doc)
        existing.append({k: v for k, v in doc.items() if k != "_id"})
        created += 1
    return created


async def consolidate_existing(db) -> int:
    """Merge substantially-equivalent stored recommendations into one initiative."""
    rows = await db.growth_recommendations.find({"status": {"$in": ["new", "accepted", "in_progress"]}}, {"_id": 0}) \
        .sort("created_at", 1).to_list(300)
    merged = 0
    kept: List[Dict[str, Any]] = []
    for r in rows:
        twin = next((k for k in kept if similar(r, k)), None)
        if not twin:
            kept.append(r)
            continue
        new_actions = [a for a in (r.get("actions") or [r.get("action")]) if a and a not in (twin.get("actions") or [twin.get("action")])]
        await db.growth_recommendations.update_one({"id": twin["id"]}, {
            "$set": {"evidence_ids": sorted(set(twin.get("evidence_ids", [])) | set(r.get("evidence_ids", [])))},
            "$inc": {"merged_variants": 1, "seen_count": r.get("seen_count", 1)},
            "$push": {"variant_titles": r["title"], **({"actions": {"$each": new_actions[:3]}} if new_actions else {})}})
        await db.growth_recommendations.update_one({"id": r["id"]}, {"$set": {"status": "merged", "merged_into": twin["id"]}})
        twin.setdefault("actions", [twin.get("action")]).extend(new_actions[:3])
        merged += 1
    return merged


def _ev_key(e: Dict[str, Any]) -> Tuple[str, str]:
    return (str(e.get("kind")), str(e.get("product_slug") or e.get("query") or e.get("keyword_id") or e.get("discovery_id") or ""))


async def invalidate_test_backed(db) -> int:
    """Recommendations whose cited evidence is now graded `test` are invalidated (not deleted)."""
    ledger, _ = await collect_evidence(db, include_excluded=True)
    test_keys = {_ev_key(e) for e in ledger if e["quality"] == "test"}
    if not test_keys:
        return 0
    n = 0
    async for r in db.growth_recommendations.find({"status": {"$in": ["new", "accepted", "in_progress"]}}, {"_id": 0, "id": 1, "evidence": 1}):
        cited = [_ev_key(e) for e in (r.get("evidence") or [])]
        if cited and all(k in test_keys for k in cited):
            await db.growth_recommendations.update_one({"id": r["id"]}, {"$set": {
                "status": "invalidated", "invalidated_reason": "cited evidence is synthetic test data",
                "evidence_quality": "test"}})
            n += 1
    return n


async def generate_recommendations(db, *, run_id: str, trigger: str = "auto") -> Dict[str, Any]:
    settings = await G.get_settings(db)
    invalidated = await invalidate_test_backed(db)
    merged = await consolidate_existing(db)
    evidence, index = await collect_evidence(db)
    base = {"invalidated": invalidated, "merged_existing": merged}
    if not evidence:
        return {**base, "created": 0, "engine": "none", "reason": "no_usable_evidence", "evidence_count": 0}

    # Never pad: cap by distinct evidence topics as well as the owner setting.
    topics = {e.get("query") or e.get("product_slug") or e.get("keyword_id") or e.get("discovery_id") for e in evidence}
    limit = max(1, min(int(settings["director_max_recommendations"]), len(topics)))

    recs: List[Dict[str, Any]] = []
    engine, reason = "claude-sonnet-5-5", ""
    if G.claude_configured():
        prompt = (
            "EVIDENCE LEDGER (quality: verified|unverified):\n" +
            "\n".join(f"[{e['id']}] ({e['kind']} · {e['quality']} · n={e.get('events', 0)}) {e['text']}" for e in evidence) +
            f"\n\nReturn AT MOST {limit} initiatives (fewer is better) as a JSON array of objects with keys: "
            "title (≤80 chars), rationale (≤240 chars referencing the evidence), actions (array of 1-4 concrete steps, "
            f"each ≤200 chars), channel (one of {sorted(CHANNELS)}), market (CA|US|ALL), impact (low|medium|high), "
            "effort (low|medium|high), evidence_ids (ids from the ledger). Do not output confidence percentages."
        )
        try:
            raw = await _claude(_SYSTEM, prompt, session=f"growth-director-{run_id}")
            parsed = _extract_json(raw)
            if not isinstance(parsed, list):
                raise ClaudeError("non_list_output")
            recs = [s for s in (_sanitize(r, index) for r in parsed if isinstance(r, dict)) if s]
            await G.mark_integration(db, "claude", ok=True)
        except Exception as exc:
            reason = f"claude_error:{type(exc).__name__}"
            log.warning("growth director claude failure: %s", type(exc).__name__)
            await G.mark_integration(db, "claude", ok=False, reason=str(exc)[:160])
            recs, engine = deterministic_recommendations(evidence, limit), "deterministic"
    else:
        recs, engine, reason = deterministic_recommendations(evidence, limit), "deterministic", "claude_not_configured"

    recs = [s for s in (_sanitize(r, index) for r in recs) if s]
    recs = cluster(recs)[:limit]
    created = await _persist(db, recs, index, engine=engine, run_id=run_id, trigger=trigger)
    return {**base, "created": created, "engine": engine, "reason": reason, "evidence_count": len(evidence),
            "candidates": len(recs), "limit": limit}


async def evidence_report(db) -> Dict[str, Any]:
    ledger, _ = await collect_evidence(db, include_excluded=True)
    summary = {q: sum(1 for e in ledger if e["quality"] == q) for q in ("verified", "unverified", "test")}
    return {"evidence": ledger, "summary": summary, "env": current_env(), "period": PERIOD,
            "rules": {"test": "excluded from the Director entirely",
                      "unverified": "exploratory hypotheses only; never revenue-related channels",
                      "sufficient_events": SUFFICIENT_EVENTS, "established_events": ESTABLISHED_EVENTS}}


# ─── Content drafts (draft-only) ──────────────────────────────────

_DRAFT_SYSTEM = (
    "You write DRAFT marketing copy for PHILEON, a luxury fine-jewellery house in Toronto. Voice: cinematic, "
    "editorial, restrained, confident. Never mention prices, discounts, urgency, scarcity or unverifiable claims. "
    "Never invent product names, materials, awards or statistics — use only the brief supplied. Output plain text only."
)


async def generate_draft(db, *, recommendation_id: Optional[str], discovery_id: Optional[str],
                         fmt: str, notes: str = "") -> Dict[str, Any]:
    if fmt not in DRAFT_FORMATS:
        raise ValueError("unsupported_format")
    if not G.claude_configured():
        raise ClaudeError("integration_required")
    brief: Dict[str, Any] = {}
    if recommendation_id:
        brief = await db.growth_recommendations.find_one({"id": recommendation_id}, {"_id": 0}) or {}
    elif discovery_id:
        brief = await db.growth_radar_discoveries.find_one({"id": discovery_id}, {"_id": 0}) or {}
    if not brief:
        raise ValueError("source_not_found")
    source_text = json.dumps({k: brief.get(k) for k in ("title", "rationale", "action", "actions", "channel", "market",
                                                          "query", "source_keyword", "category", "evidence")}, default=str)
    prompt = (f"FORMAT: {DRAFT_FORMATS[fmt]}\nBRIEF (JSON): {source_text}\nOWNER NOTES: {notes[:600] or 'none'}\n"
              "Write the draft now.")
    try:
        text = await _claude(_DRAFT_SYSTEM, prompt, session=f"growth-draft-{uuid.uuid4().hex[:8]}", max_tokens=1500)
        await G.mark_integration(db, "claude", ok=True)
    except Exception as exc:
        await G.mark_integration(db, "claude", ok=False, reason=str(exc)[:160])
        raise ClaudeError(type(exc).__name__)
    now = G._now().isoformat()
    doc = {"id": str(uuid.uuid4()), "format": fmt, "status": "draft", "published": False, "publish_locked": True,
           "recommendation_id": recommendation_id, "discovery_id": discovery_id,
           "title": brief.get("title") or brief.get("query") or "Untitled", "body": text.strip(), "notes": notes[:600],
           "engine": "claude-sonnet-5-5", "created_at": now, "updated_at": now}
    await db.growth_content_drafts.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}
