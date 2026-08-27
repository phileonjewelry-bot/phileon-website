#!/usr/bin/env python3
"""
PHILEON — SEO audit (read-only).

Loads each URL from the current sitemap.xml, waits for React SEO injection,
then reports:

  • missing SEO title
  • duplicate SEO titles (across scanned pages)
  • missing meta description
  • duplicate meta descriptions
  • missing H1 / multiple H1s
  • missing canonical
  • missing OG image
  • missing Product JSON-LD
  • noindex pages accidentally included in the sitemap

Non-destructive. Prints a summary. Exit code 0 always — this is a report tool.

Usage:
  python3 /app/backend/scripts/seo_audit.py
  python3 /app/backend/scripts/seo_audit.py --base https://labete-gallery.preview.emergentagent.com
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
from collections import Counter, defaultdict
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Playwright not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(0)

SITEMAP_PATH = Path("/app/frontend/public/sitemap.xml")
DEFAULT_BASE = "https://labete-gallery.preview.emergentagent.com"


def parse_sitemap_urls(base: str) -> list[str]:
    xml = SITEMAP_PATH.read_text(encoding="utf-8")
    locs = re.findall(r"<loc>([^<]+)</loc>", xml)
    # Swap the production origin for the preview origin for actual live checks.
    return [u.replace("https://phileon.com", base) for u in locs]


def audit_page(page, url: str) -> dict:
    try:
        page.goto(url, wait_until="networkidle", timeout=45_000)
    except Exception as e:
        return {"url": url, "error": str(e)[:200]}
    page.wait_for_timeout(2500)  # allow ProductSeo useEffect to inject
    data = page.evaluate(
        """() => {
          const q = (s) => document.querySelector(s);
          const qa = (s) => Array.from(document.querySelectorAll(s));
          const title = document.title;
          const desc = q('meta[name="description"]')?.content || null;
          const canonical = q('link[rel="canonical"]')?.href || null;
          const robots = q('meta[name="robots"]')?.content || null;
          const ogImage = q('meta[property="og:image"]')?.content || null;
          const h1s = qa('h1').map(h => (h.textContent || '').trim()).filter(Boolean);
          const jsonLd = qa('script[type="application/ld+json"]').map(s => {
            try { return JSON.parse(s.textContent); } catch { return null; }
          }).filter(Boolean);
          return { title, desc, canonical, robots, ogImage, h1s, jsonLd };
        }"""
    )
    types = [j.get("@type") for j in data.get("jsonLd", [])]
    data["hasProductLd"] = "Product" in types
    data["hasBreadcrumbLd"] = "BreadcrumbList" in types
    data["url"] = url
    return data


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default=DEFAULT_BASE)
    ap.add_argument("--limit", type=int, default=8, help="max URLs to audit (default: 8)")
    ap.add_argument("--json", action="store_true", help="emit JSON")
    args = ap.parse_args()

    urls = parse_sitemap_urls(args.base)
    if args.limit:
        urls = urls[: args.limit]
    print(f"[seo-audit] auditing {len(urls)} URLs against {args.base}")

    results: list[dict] = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        for u in urls:
            r = audit_page(page, u)
            results.append(r)
            marker = "OK" if not r.get("error") else "ERR"
            print(f"  [{marker}] {u}")
        browser.close()

    titles = [r["title"] for r in results if r.get("title")]
    descs = [r["desc"] for r in results if r.get("desc")]
    title_dupes = [t for t, c in Counter(titles).items() if c > 1]
    desc_dupes = [d for d, c in Counter(descs).items() if c > 1]

    issues: list[str] = []
    for r in results:
        u = r.get("url", "?")
        if r.get("error"):
            issues.append(f"{u} — LOAD ERROR: {r['error']}")
            continue
        if not r.get("title"):
            issues.append(f"{u} — missing <title>")
        if not r.get("desc"):
            issues.append(f"{u} — missing meta description")
        if not r.get("canonical"):
            issues.append(f"{u} — missing canonical link")
        if not r.get("ogImage"):
            issues.append(f"{u} — missing og:image")
        h1s = r.get("h1s") or []
        if len(h1s) == 0:
            issues.append(f"{u} — missing H1")
        elif len(h1s) > 1:
            issues.append(f"{u} — multiple H1s ({len(h1s)})")
        if r.get("robots") and "noindex" in r["robots"].lower():
            issues.append(f"{u} — noindex page appears in sitemap")
        if not r.get("hasProductLd") and "/products/" in u:
            issues.append(f"{u} — Product JSON-LD missing")

    if args.json:
        print(json.dumps({"results": results, "issues": issues, "title_dupes": title_dupes, "desc_dupes": desc_dupes}, indent=2))
    else:
        print("\n=== SUMMARY ===")
        print(f"pages_scanned={len(results)} · issues={len(issues)} · title_dupes={len(title_dupes)} · desc_dupes={len(desc_dupes)}")
        for i in issues:
            print(f"  • {i}")
        if title_dupes:
            print("\nDuplicate titles:")
            for t in title_dupes: print(f"  • {t}")
        if desc_dupes:
            print("\nDuplicate descriptions:")
            for d in desc_dupes: print(f"  • {d}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
