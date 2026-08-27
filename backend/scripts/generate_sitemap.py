#!/usr/bin/env python3
"""
PHILEON — Sitemap Generator

Scans /app/frontend/src/data/products.js for public product slugs, merges in
known category / editorial routes, and writes a fresh sitemap.xml to
/app/frontend/public/sitemap.xml.

Rules:
  • Skip products flagged as 'placeholder', in-development, or explicitly
    marked with `seoIndex: false`.
  • Never include /checkout, /cart, /admin, hidden vault release routes.
  • Never invent URLs — only emit what exists in the catalog or the fixed
    static route list below.

Run:
  python3 /app/backend/scripts/generate_sitemap.py
"""
from __future__ import annotations

import re
from datetime import date
from pathlib import Path

SITE_ORIGIN = "https://phileon.com"
CATALOG_PATH = Path("/app/frontend/src/data/products.js")
OUT_PATH = Path("/app/frontend/public/sitemap.xml")

# Static / editorial routes that are always public and indexable.
STATIC_ROUTES = [
    "/",
    "/shop",
    "/shop?collection=signature",
    "/shop?collection=collective",
    "/shop?collection=editorial",
    "/inspiration-vault",
    "/atelier",
    "/craftsmanship",
    "/ring-size-guide",
    # Phase 4 search-intent collections
    "/fine-jewelry",
    "/mens-rings",
    "/womens-rings",
    "/mens-jewelry",
    "/pendants",
    "/earrings",
    "/statement-rings",
    "/gold-jewelry",
    "/lab-grown-diamond-jewelry",
    # Phase 4 identity + origin brand-discovery landings (consolidated,
    # not one URL per keyword — aliases redirect to these two canonicals).
    "/black-owned-canadian-jewelry",
    "/custom-jewelry-canada",
    # Phase 5 trust pages (structure live, owner content pending)
    "/shipping",
    "/returns",
    "/warranty",
    "/jewelry-care",
    "/materials",
    # Phase 4 journal
    "/journal",
]

# Routes that are NEVER included in the public sitemap.
EXCLUDE_ROUTES = {
    "/checkout", "/cart", "/admin", "/secret-drop",
}
EXCLUDE_PREFIXES = ("/drews-vault/", "/admin/", "/api/")


def parse_catalog(source: str) -> list[dict]:
    """Best-effort parse of the JS catalog file.

    We use a simple regex sweep — the catalog is a large ES module that we
    do NOT want to import at build time. The generator only extracts the
    slug / href / status / audience fields it needs.
    """
    entries: list[dict] = []
    # Match each { ... slug: 'foo' ... }, non-greedy across newlines.
    block_re = re.compile(r"\{[^{}]*?slug:\s*['\"]([a-z0-9\-]+)['\"][^{}]*?\}", re.DOTALL)
    for m in block_re.finditer(source):
        block = m.group(0)
        slug = m.group(1)
        href_match = re.search(r"href:\s*['\"]([^'\"]+)['\"]", block)
        status_match = re.search(r"status:\s*['\"]([a-z\-]+)['\"]", block)
        purchasable_match = re.search(r"purchasable:\s*(true|false)", block)
        seo_index_match = re.search(r"seoIndex:\s*(true|false)", block)
        entries.append({
            "slug": slug,
            "href": href_match.group(1) if href_match else f"/products/{slug}",
            "status": status_match.group(1) if status_match else None,
            "purchasable": (purchasable_match.group(1) == "true") if purchasable_match else True,
            "seo_index": (seo_index_match.group(1) == "true") if seo_index_match else None,
        })
    # Deduplicate by slug — keep the first entry (catalog canonical).
    seen: set[str] = set()
    unique: list[dict] = []
    for e in entries:
        if e["slug"] in seen:
            continue
        seen.add(e["slug"])
        unique.append(e)
    return unique


def is_indexable(entry: dict) -> bool:
    """Placeholder / in-development pieces default to noindex."""
    if entry.get("seo_index") is not None:
        return entry["seo_index"]
    if entry.get("status") == "placeholder":
        return False
    if entry.get("purchasable") is False:
        return False
    return True


def route_allowed(path: str) -> bool:
    if path in EXCLUDE_ROUTES:
        return False
    if any(path.startswith(p) for p in EXCLUDE_PREFIXES):
        return False
    return True


def build_sitemap(entries: list[dict]) -> str:
    today = date.today().isoformat()
    urls: list[str] = []

    def add(path: str, priority: str = "0.6"):
        if not route_allowed(path):
            return
        url = f"{SITE_ORIGIN}{path}" if path.startswith("/") else path
        urls.append(
            "  <url>"
            f"\n    <loc>{url}</loc>"
            f"\n    <lastmod>{today}</lastmod>"
            f"\n    <priority>{priority}</priority>"
            "\n  </url>"
        )

    for path in STATIC_ROUTES:
        add(path, priority="0.7" if path == "/" else "0.6")

    for e in entries:
        if not is_indexable(e):
            continue
        add(e["href"], priority="0.8")

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    return xml


def main() -> int:
    source = CATALOG_PATH.read_text(encoding="utf-8")
    entries = parse_catalog(source)
    total = len(entries)
    indexable = sum(1 for e in entries if is_indexable(e))
    xml = build_sitemap(entries)
    OUT_PATH.write_text(xml, encoding="utf-8")
    print(f"[sitemap] wrote {OUT_PATH} · products_scanned={total} · indexable={indexable} · static={len(STATIC_ROUTES)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
