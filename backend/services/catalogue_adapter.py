"""PHILEON Growth OS — READ-ONLY catalogue adapter.

Merges the authoritative sources without copying them anywhere:
  · storefront snapshot  (backend/data/storefront_catalogue.json, exported from frontend/src/data/products.js + App.js routes)
  · pricing engine       (services.pricing_engine_catalog, services.catalog, pricing_engine.LIVE_PRICING_CONFIG) — SKU identity only
  · inventory rules      (services.inventory_service — Vault membership, availability states; db.inventory is only read)
Prices are never exposed here: the pricing engine stays the sole pricing authority.
"""
from __future__ import annotations

import hashlib
import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

from services import catalog as C
from services import pricing_engine_catalog as P
from services import inventory_service as INV
import pricing_engine as PE

_ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PATH = _ROOT / "data" / "storefront_catalogue.json"
PRODUCTS_JS = _ROOT.parent / "frontend" / "src" / "data" / "products.js"

CATEGORY_WORDS = {
    "rings": {"ring", "rings", "band", "bands", "signet", "engagement", "wedding", "bridal", "solitaire"},
    "earrings": {"earring", "earrings", "hoops", "studs", "drop"},
    "pendants": {"pendant", "pendants", "necklace", "necklaces", "chain", "cross"},
    "bracelets": {"bracelet", "bracelets", "cuff", "cuffs", "bangle", "bangles"},
    "anklets": {"anklet", "anklets"},
    "sets": {"set", "sets"},
}
_CAT_ALIASES = {"ring": "rings", "earring": "earrings", "pendant": "pendants", "bracelet": "bracelets", "cuff": "bracelets",
                "necklace": "pendants", "anklet": "anklets", "set": "sets"}
ATTRIBUTE_VOCAB = {"signet", "diamond", "diamonds", "sapphire", "emerald", "ruby", "peridot", "pearl", "pavé", "pave", "solitaire",
                   "cocktail", "statement", "sculptural", "cross", "tribute", "mesh", "lattice", "concave", "ribbed", "bangle",
                   "rose", "white", "yellow", "tri-colour", "platinum", "sterling", "10k", "14k", "18k", "lab-grown", "natural",
                   "heirloom", "bespoke", "custom", "men's", "ladies", "unisex", "floral", "architectural", "stackable"}


# ─── Snapshot ─────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def load_snapshot() -> Dict[str, Any]:
    if not SNAPSHOT_PATH.exists():
        return {"generated_at": None, "source": {}, "routes": [], "records": []}
    return json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))


def snapshot_drift() -> Dict[str, Any]:
    """Is the snapshot still identical to frontend/src/data/products.js? (checked only where the frontend source exists)."""
    snap = load_snapshot()
    if not PRODUCTS_JS.exists():
        return {"checked": False, "in_sync": None, "generated_at": snap.get("generated_at")}
    digest = hashlib.sha256(PRODUCTS_JS.read_bytes()).hexdigest()
    return {"checked": True, "in_sync": digest == snap.get("source", {}).get("products_js_sha256"),
            "generated_at": snap.get("generated_at")}


def _norm_cat(c: str) -> str:
    c = (c or "").strip().lower()
    return _CAT_ALIASES.get(c, c)


def _merge_storefront() -> Dict[str, Dict[str, Any]]:
    """One storefront record per slug AND per storefront key (editorial object wins over shop-grid card)."""
    by_slug: Dict[str, Dict[str, Any]] = {}
    for rec in load_snapshot().get("records", []):
        keys = [rec["slug"]] if rec["slug"] != "inspiration-vault" else []
        if rec.get("storefront_key"):
            keys.append(f"key:{rec['storefront_key']}")
        for k in keys:
            cur = by_slug.get(k)
            if not cur:
                by_slug[k] = dict(rec)
                continue
            primary, secondary = (cur, rec) if cur["origin"] == "products" else (rec, cur)
            merged = dict(primary)
            for f in ("name", "subtitle", "description", "story", "tribute", "material_line", "href", "status",
                      "purchasable", "pricing_pending", "is_core", "size_profile"):
                if merged.get(f) in (None, "", []) and secondary.get(f) not in (None, "", []):
                    merged[f] = secondary[f]
            for f in ("images", "metals", "stones", "tags", "category", "audience", "collections", "variants"):
                seen, out = set(), []
                for v in (primary.get(f) or []) + (secondary.get(f) or []):
                    kk = json.dumps(v, sort_keys=True) if isinstance(v, dict) else v
                    if kk not in seen:
                        seen.add(kk)
                        out.append(v)
                merged[f] = out
            by_slug[k] = merged
    return by_slug


# ─── Pricing-engine identity (no prices) ──────────────────────────

def _pricing_parents() -> Dict[str, Dict[str, Any]]:
    out: Dict[str, Dict[str, Any]] = {}
    for slug, cfg in P.PRICING_ENGINE_CATALOG.items():
        tiers = PE.LIVE_PRICING_CONFIG.get(cfg.get("product_key") or "", {})
        out[slug] = {"name": cfg.get("product_name"), "subtitle": cfg.get("subtitle"), "category": _norm_cat(cfg.get("category")),
                     "product_key": cfg.get("product_key"), "size_profile": cfg.get("size_profile"), "source": "pricing_engine_catalog",
                     "skus": [{"key": k, "metal": (t.get("metal_label") or t.get("metalType"))} for k, t in tiers.items()]}
    for slug, cfg in P.FIXED_PRODUCTS.items():
        out[slug] = {"name": cfg.get("product_name"), "subtitle": cfg.get("subtitle"), "category": None, "product_key": None,
                     "size_profile": cfg.get("size_profile"), "source": "fixed_products",
                     "skus": [{"key": k, "metal": v.get("metal_label")} for k, v in (cfg.get("variants") or {}).items()]}
    for slug, cfg in C._DYNAMIC_RING_TIERS.items():
        out[slug] = {"name": cfg.get("product_name"), "subtitle": cfg.get("subtitle"), "category": "rings",
                     "product_key": cfg.get("product_key"), "size_profile": cfg.get("size_profile"), "source": "catalog_dynamic_rings",
                     "skus": [{"key": k, "metal": t.get("metal_label")} for k, t in (cfg.get("tiers") or {}).items()]}
    extra = {
        "scacco-matto": ("rings", [{"key": f"{k}-{c}", "metal": f"{k} {c.title()} Gold"} for k, c in C._SCACCO_PRICE_CENTS_USD]),
        "ribbon-regale-edition": ("earrings", [{"key": k, "metal": v.get("metal_label")} for k, v in C._RRE_METALS.items()]),
        "quadriga-dominus": ("rings", [{"key": k, "metal": None} for k in getattr(C, "_QUADRIGA_COLORWAYS", {})]),
        "bajan-joe": ("rings", [{"key": k, "metal": None} for k in getattr(C, "_BAJAN_JOE_TIERS", {})]),
        "cresta-nera": (None, [{"key": k, "metal": v} for k, v in P.CRESTA_NERA_METAL_LABELS.items()]),
        "her-eternal-reign": ("rings", [{"key": k, "metal": (v.get("metal_label") if isinstance(v, dict) else None)}
                                        for k, v in (P.HER_TIERS or {}).items()]),
    }
    for slug, (cat, skus) in extra.items():
        if slug in C._SUPPORTED_SLUGS and slug not in out:
            out[slug] = {"name": None, "subtitle": None, "category": cat, "product_key": None, "size_profile": None,
                         "source": "catalog_static", "skus": skus}
    return out


def _vault_alias(slug: str) -> Optional[str]:
    return next((a for a, canon in INV.VAULT_PUBLIC_ALIASES.items() if canon == slug), None)


def _public_url(slug: str, sf: Optional[Dict[str, Any]], routes: set) -> Optional[str]:
    if f"/products/{slug}" in routes:
        return f"/products/{slug}"
    alias = _vault_alias(slug) or (slug[3:] if slug.startswith("iv-") else None)
    if alias and f"/inspiration-vault/{alias}" in routes:
        return f"/inspiration-vault/{alias}"
    if f"/{slug}" in routes:
        return f"/{slug}"
    if sf and sf.get("href") in routes:
        return sf["href"]
    if sf and sf.get("slug") != slug and f"/products/{sf.get('slug')}" in routes:
        return f"/products/{sf['slug']}"
    return None


async def _vault_availability(db, slug: str) -> Dict[str, Any]:
    if db is None:
        return {"state": "unknown", "available": False, "verified": False}
    docs = await db.inventory.find({"product_slug": slug}, {"_id": 0}).to_list(50)
    if not docs:
        return {**INV._derive_customer_state(None, is_vault=True), "verified": True}
    states = [INV._derive_customer_state(d, is_vault=True) for d in docs]
    live = next((s for s in states if s["available"]), None)
    return {**(live or states[0]), "verified": True}


# ─── Build ────────────────────────────────────────────────────────

async def build_catalogue(db=None) -> Dict[str, Any]:
    snap = load_snapshot()
    routes = set(snap.get("routes", []))
    sf_index = _merge_storefront()
    parents = _pricing_parents()
    products: List[Dict[str, Any]] = []
    category_conflicts: List[Dict[str, Any]] = []
    for slug in sorted(C._SUPPORTED_SLUGS):
        pr = parents.get(slug) or {"name": None, "subtitle": None, "category": None, "product_key": None, "skus": [],
                                   "size_profile": None, "source": "catalog_supported_only"}
        sf = sf_index.get(slug) or (sf_index.get(f"key:{pr['product_key']}") if pr.get("product_key") else None)
        vault_tracked = INV.is_inspiration_vault_slug(slug)
        is_vault = vault_tracked or slug.startswith("iv-")
        sf_cats = sorted({_norm_cat(c) for c in (sf or {}).get("category", []) if c})
        pe_cat = _norm_cat(pr["category"]) if pr.get("category") else None
        categories = sf_cats or ([pe_cat] if pe_cat else [])
        if sf_cats and pe_cat and pe_cat not in sf_cats:
            category_conflicts.append({"slug": slug, "storefront": sf_cats, "pricing_engine": pe_cat, "used": "storefront"})
        name = (sf or {}).get("name") or pr.get("name")
        if vault_tracked:
            availability = await _vault_availability(db, slug)
        elif sf and (sf.get("purchasable") is False or sf.get("status") == "placeholder" or sf.get("pricing_pending") is True):
            availability = {"state": "not_purchasable", "available": False, "verified": True}
        else:
            availability = {"state": INV.MODE_MADE_TO_ORDER, "available": True, "verified": True}
        public_url = _public_url(slug, sf, routes)
        reasons = []
        if not name:
            reasons.append("no_verified_name")
        if is_vault:
            reasons.append("vault_one_of_one")
        if not availability["available"]:
            reasons.append(f"availability:{availability['state']}")
        if not public_url:
            reasons.append("no_verified_public_url")
        if not sf:
            reasons.append("no_storefront_record")
        missing = [f for f, v in (("description", (sf or {}).get("description") or (sf or {}).get("story")),
                                  ("images", (sf or {}).get("images")), ("metals", (sf or {}).get("metals") or pr.get("skus")),
                                  ("public_url", public_url), ("category", categories)) if not v]
        storefront_variants = (sf or {}).get("variants") or []
        products.append({
            "slug": slug, "name": name, "subtitle": (sf or {}).get("subtitle") or pr.get("subtitle"),
            "storefront_slug": (sf or {}).get("slug"), "categories": categories, "audience": (sf or {}).get("audience", []),
            "description": (sf or {}).get("description"), "story": (sf or {}).get("story"), "tribute": (sf or {}).get("tribute"),
            "material_line": (sf or {}).get("material_line"), "metals": (sf or {}).get("metals", []),
            "sku_metals": sorted({s["metal"] for s in pr.get("skus", []) if s.get("metal")}),
            "stones": (sf or {}).get("stones", []), "editions": storefront_variants, "skus": pr.get("skus", []),
            "sku_count": len(pr.get("skus", [])), "images": (sf or {}).get("images", []), "public_url": public_url,
            "is_inspiration_vault": is_vault, "vault_inventory_tracked": vault_tracked, "availability": availability,
            "checkout_supported": True,
            "pricing_source": pr.get("source"), "pricing_authority": "pricing_engine (prices not exposed here; customer-facing USD)",
            "marketing_eligible": not reasons, "ineligibility_reasons": reasons, "missing_fields": missing,
            "content_ready": not reasons and bool((sf or {}).get("description") or (sf or {}).get("story") or (sf or {}).get("material_line")),
        })
    supported_keys = {p["storefront_slug"] for p in products if p["storefront_slug"]} | set(C._SUPPORTED_SLUGS)
    storefront_only = sorted({r["slug"] for r in snap.get("records", []) if r["slug"] not in supported_keys and r["slug"] != "inspiration-vault"})
    pricing_only = [p["slug"] for p in products if "no_storefront_record" in p["ineligibility_reasons"]]
    summary = {
        "checkout_supported_parents": len(products), "sku_configurations": sum(p["sku_count"] for p in products),
        "storefront_records": len(snap.get("records", [])), "storefront_distinct_slugs": len({r["slug"] for r in snap.get("records", [])}),
        "mapped_to_storefront": sum(1 for p in products if p["storefront_slug"]),
        "mapped_via_product_key": sum(1 for p in products if p["storefront_slug"] and p["storefront_slug"] != p["slug"]),
        "vault_pieces": sum(1 for p in products if p["is_inspiration_vault"]),
        "marketing_eligible": sum(1 for p in products if p["marketing_eligible"]),
        "content_ready": sum(1 for p in products if p["content_ready"]),
        "incomplete_records": sum(1 for p in products if p["missing_fields"]),
    }
    return {"generated_at": snap.get("generated_at"), "drift": snapshot_drift(), "summary": summary, "products": products,
            "mismatches": {"storefront_only_not_purchasable": storefront_only, "pricing_only_no_storefront_record": pricing_only,
                           "category_conflicts_storefront_wins": category_conflicts,
                           "slug_differs_between_storefront_and_pricing": [
                               {"pricing_slug": p["slug"], "storefront_slug": p["storefront_slug"]}
                               for p in products if p["storefront_slug"] and p["storefront_slug"] != p["slug"]]}}


# ─── Matching ─────────────────────────────────────────────────────

def _tokens(text: str) -> set:
    return {t for t in re.findall(r"[a-zà-ÿ0-9']+", (text or "").lower()) if len(t) > 2}


def match_products(products: List[Dict[str, Any]], *, text: str, include_vault: bool = False, limit: int = 5) -> List[Dict[str, Any]]:
    """Grounded matching: a piece is proposed only when its own name or category appears in the research text."""
    toks = _tokens(text)
    wanted = {cat for cat, words in CATEGORY_WORDS.items() if toks & words}
    out = []
    for p in products:
        if not p["marketing_eligible"] and not (include_vault and p["is_inspiration_vault"] and p["availability"]["available"]):
            continue
        reasons, score = [], 0
        name_toks = _tokens(p["name"] or "") - {"the", "tribute"}
        if name_toks and name_toks <= toks:
            reasons.append(f"named in research: {p['name']}")
            score += 10
        cat_hit = wanted & set(p["categories"])
        if cat_hit:
            reasons.append(f"category match: {', '.join(sorted(cat_hit))}")
            score += 3
        if not reasons:
            continue
        attr_toks = _tokens(" ".join([p.get("subtitle") or "", p.get("material_line") or ""] + p.get("tags", []) + p.get("stones", [])))
        attr_hit = toks & attr_toks & ATTRIBUTE_VOCAB
        if attr_hit:
            reasons.append(f"attribute match: {', '.join(sorted(attr_hit))}")
            score += 2 * len(attr_hit)
        aud = set(p.get("audience") or [])
        if toks & {"ladies", "women", "womens", "her", "bridal", "engagement"} and "ladies" in aud:
            score += 1
        if toks & {"men", "mens", "gents", "gentlemen", "him"} and ({"gentlemens-club", "gents", "unisex"} & aud):
            score += 1
        if p.get("description") or p.get("story"):
            score += 1
        theme = toks & {"engagement", "bridal", "wedding"}
        if theme and not (_tokens(" ".join([p.get("description") or "", p.get("story") or ""] + p.get("tags", []))) & theme):
            reasons.append("no PHILEON piece is tagged for this theme — confirm fit manually")
        out.append({"slug": p["slug"], "name": p["name"], "categories": p["categories"], "public_url": p["public_url"],
                    "availability": p["availability"]["state"], "match_reason": "; ".join(reasons), "_score": score})
    out.sort(key=lambda m: (-m["_score"], m["slug"]))
    return [{k: v for k, v in m.items() if k != "_score"} for m in out[:limit]]


def content_brief(products: List[Dict[str, Any]], slugs: List[str]) -> List[Dict[str, Any]]:
    """Verified facts only, for Claude's draft context. Pieces that are not content-ready are dropped, never padded."""
    idx = {p["slug"]: p for p in products}
    out = []
    for s in slugs:
        p = idx.get(s)
        if not p or not p["content_ready"]:
            continue
        out.append({k: v for k, v in {
            "slug": p["slug"], "name": p["name"], "subtitle": p["subtitle"], "categories": p["categories"], "description": p["description"],
            "story": p["story"], "material_line": p["material_line"], "metals": p["metals"] or p["sku_metals"], "stones": p["stones"],
            "editions": [{"name": e.get("name"), "material": e.get("material"), "specs": e.get("specs")} for e in p["editions"]][:6],
            "availability": p["availability"]["state"], "public_url": p["public_url"]}.items() if v})
    return out
