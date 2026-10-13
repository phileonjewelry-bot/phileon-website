"""PHILEON Growth OS — AI Growth Director (Claude Sonnet 5.5, evidence-grounded) + content drafts.

    * Every recommendation MUST cite evidence ids from the ledger assembled
      server-side (radar snapshots, discoveries, internal analytics).
      Recommendations citing unknown evidence are discarded.
    * No evidence → no recommendations ("no_evidence"). Nothing invented.
    * Claude failure → deterministic rule engine over INTERNAL evidence only
      (engine stamped "deterministic").
    * Content is DRAFT ONLY. Never published, sent or promoted anywhere.
"""
from __future__ import annotations

import json
import logging
import os
import re
import uuid
from typing import Any, Dict, List, Optional, Tuple

from services import growth_os as G
from services.analytics_service import build_products, top_searches, current_env

log = logging.getLogger("phileon.growth_director")

MODEL = ("anthropic", "claude-sonnet-5-5")
CHANNELS = {"content", "seo", "social", "concierge", "collection", "email_concept", "bespoke"}
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


# ─── Evidence ledger ──────────────────────────────────────────────

async def collect_evidence(db) -> Tuple[List[Dict[str, Any]], Dict[str, Dict[str, Any]]]:
    evidence: List[Dict[str, Any]] = []
    n = 0

    def _add(kind: str, text: str, **meta):
        nonlocal n
        n += 1
        eid = f"E{n:03d}"
        evidence.append({"id": eid, "kind": kind, "text": text, **meta})

    snaps = await db.growth_radar_snapshots.find({"kind": "timeseries"}, {"_id": 0}).sort("fetched_at", -1).to_list(200)
    latest: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for s in snaps:
        latest.setdefault((s["keyword_id"], s["market"]), s)
    ranked = sorted(latest.values(), key=lambda s: (abs(s.get("trend_delta_pct") or 0), s.get("avg_interest") or 0), reverse=True)
    for s in ranked[:12]:
        _add("radar_trend", f"Google Trends {s['market']}: '{s['query_term']}' avg interest {s['avg_interest']}/100, "
             f"latest {s['latest_value']}, recent 4-wk vs prior 4-wk {s['trend_delta_pct']:+}%", market=s["market"],
             keyword_id=s["keyword_id"], category=s.get("category"))
    disc = await db.growth_radar_discoveries.find({"status": {"$in": ["new", "watching"]}}, {"_id": 0}) \
        .sort("last_seen", -1).to_list(40)
    for d in disc[:12]:
        _add("radar_discovery", f"Rising Google query in {d['market']}: '{d['query']}' ({d.get('value')}) related to "
             f"'{d['source_keyword']}', priority {d.get('priority')} ({d.get('priority_engine')})", market=d["market"],
             discovery_id=d["id"], category=d.get("category"))

    env = current_env()
    try:
        prod = await build_products(db, env=env, period="30d", limit=8)
        for p in prod.get("products", []):
            if (p["views"] or 0) >= 5 or p["paid_orders"]:
                _add("internal_product", f"Site (30d, {env}): '{p['product_slug']}' views {p['views']}, likes {p['likes']}, "
                     f"adds {p['adds']}, checkout starts {p['checkout_starts']}, paid orders {p['paid_orders']}",
                     product_slug=p["product_slug"])
        srch = await top_searches(db, env=env, period="30d", limit=8)
        for q in srch.get("zero_result_searches", [])[:6]:
            if q.get("count", 0) >= 2:
                _add("internal_search_gap", f"Site search (30d): '{q['query']}' returned zero results {q['count']} times",
                     query=q["query"])
        for q in srch.get("top_searches", [])[:5]:
            if q.get("count", 0) >= 3:
                _add("internal_search", f"Site search (30d): '{q['query']}' searched {q['count']} times "
                     f"(avg {q['avg_results']} results)", query=q["query"])
    except Exception as exc:  # pragma: no cover
        log.warning("internal evidence unavailable: %s", exc)
    return evidence, {e["id"]: e for e in evidence}


# ─── Deterministic fallback ───────────────────────────────────────

def deterministic_recommendations(evidence: List[Dict[str, Any]], limit: int) -> List[Dict[str, Any]]:
    recs: List[Dict[str, Any]] = []
    for e in evidence:
        if e["kind"] == "internal_search_gap":
            recs.append({"title": f"Close catalogue gap for '{e['query']}'", "channel": "collection", "market": "ALL",
                         "priority": "HIGH", "confidence": 0.7, "evidence_ids": [e["id"]],
                         "rationale": "Repeated zero-result searches signal unmet demand on the site.",
                         "action": f"Review whether a piece or editorial page should answer '{e['query']}'; add synonyms to search."})
        elif e["kind"] == "internal_product":
            m = re.search(r"views (\d+).*checkout starts (\d+), paid orders (\d+)", e["text"])
            if m and int(m.group(1)) >= 20 and int(m.group(3)) == 0:
                recs.append({"title": f"Convert interest on '{e['product_slug']}'", "channel": "concierge", "market": "ALL",
                             "priority": "MEDIUM", "confidence": 0.6, "evidence_ids": [e["id"]],
                             "rationale": "High attention with no paid orders in 30 days.",
                             "action": "Offer a concierge consultation CTA and a sizing/finish explainer on this product page."})
        elif e["kind"] == "radar_discovery" and "priority HIGH" in e["text"]:
            recs.append({"title": f"Editorial response to rising demand in {e['market']}", "channel": "content",
                         "market": e["market"], "priority": "HIGH", "confidence": 0.6, "evidence_ids": [e["id"]],
                         "rationale": "A breakout/high-priority rising query maps to PHILEON's category.",
                         "action": "Draft a journal piece and collection landing block aligned to this query."})
    return recs[:limit]


# ─── Recommendation generation ────────────────────────────────────

_SYSTEM = (
    "You are the PHILEON Growth Director. PHILEON is a Toronto-based luxury fine-jewellery house "
    "(bespoke diamond and gold pieces, men's luxury jewellery, contemporary sculptural pieces, bridal). "
    "Markets: Canada (CA) and United States (US). You produce customer-acquisition recommendations that are "
    "STRICTLY grounded in the numbered evidence supplied. Rules: cite evidence ids for every recommendation; never "
    "invent statistics, trends or customers; no paid ads launches; no discounts, urgency or scarcity tactics; "
    "tone is calm, editorial, luxury. Output ONLY a JSON array."
)


async def generate_recommendations(db, *, run_id: str, trigger: str = "auto") -> Dict[str, Any]:
    settings = await G.get_settings(db)
    limit = int(settings["director_max_recommendations"])
    evidence, index = await collect_evidence(db)
    if not evidence:
        return {"created": 0, "engine": "none", "reason": "no_evidence", "evidence_count": 0}

    recs: List[Dict[str, Any]] = []
    engine = "claude-sonnet-5-5"
    reason = ""
    if G.claude_configured():
        prompt = (
            "EVIDENCE LEDGER:\n" + "\n".join(f"[{e['id']}] ({e['kind']}) {e['text']}" for e in evidence) +
            f"\n\nProduce up to {limit} recommendations as a JSON array of objects with keys: "
            "title (≤80 chars), rationale (≤240 chars, reference the evidence), action (concrete next step ≤240 chars), "
            f"channel (one of {sorted(CHANNELS)}), market (CA|US|ALL), priority (HIGH|MEDIUM|LOW), "
            "confidence (0-1), evidence_ids (array of ids from the ledger). Only use evidence ids that exist."
        )
        try:
            raw = await _claude(_SYSTEM, prompt, session=f"growth-director-{run_id}")
            parsed = _extract_json(raw)
            if not isinstance(parsed, list):
                raise ClaudeError("non_list_output")
            for r in parsed:
                ids = [i for i in (r.get("evidence_ids") or []) if i in index]
                if not ids or not r.get("title"):
                    continue
                recs.append({"title": str(r["title"])[:120], "rationale": str(r.get("rationale") or "")[:400],
                             "action": str(r.get("action") or "")[:400],
                             "channel": r.get("channel") if r.get("channel") in CHANNELS else "content",
                             "market": r.get("market") if r.get("market") in ("CA", "US", "ALL") else "ALL",
                             "priority": r.get("priority") if r.get("priority") in ("HIGH", "MEDIUM", "LOW") else "MEDIUM",
                             "confidence": max(0.0, min(1.0, float(r.get("confidence") or 0.5))), "evidence_ids": ids})
            await G.mark_integration(db, "claude", ok=True)
        except Exception as exc:
            reason = f"claude_error:{type(exc).__name__}"
            log.warning("growth director claude failure: %s", type(exc).__name__)
            await G.mark_integration(db, "claude", ok=False, reason=str(exc)[:160])
            recs, engine = deterministic_recommendations(evidence, limit), "deterministic"
    else:
        recs, engine, reason = deterministic_recommendations(evidence, limit), "deterministic", "claude_not_configured"

    created = 0
    now = G._now().isoformat()
    for r in recs[:limit]:
        fp = G.fingerprint(r["title"], r["market"], r["channel"])
        if await db.growth_recommendations.find_one({"fingerprint": fp}, {"_id": 1}):
            await db.growth_recommendations.update_one({"fingerprint": fp}, {"$set": {"last_seen": now}, "$inc": {"seen_count": 1}})
            continue
        await db.growth_recommendations.insert_one({
            "id": str(uuid.uuid4()), "fingerprint": fp, **r, "engine": engine, "run_id": run_id, "trigger": trigger,
            "status": "new", "created_at": now, "last_seen": now, "seen_count": 1,
            "evidence": [index[i] for i in r["evidence_ids"]]})
        created += 1
    return {"created": created, "engine": engine, "reason": reason, "evidence_count": len(evidence),
            "candidates": len(recs)}


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
    source_text = json.dumps({k: brief.get(k) for k in ("title", "rationale", "action", "channel", "market",
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
