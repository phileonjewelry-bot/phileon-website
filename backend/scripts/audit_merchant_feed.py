#!/usr/bin/env python3
"""
PHILEON — Merchant Center feed consistency audit (Phase 5, read-only).

Cross-checks every product in `/app/frontend/public/merchant-feed.xml`
against the fields the frontend catalog parses from products.js, and flags:
  • missing image_link
  • URL scheme mismatch (feed uses https://phileon.com; check the slug maps
    to an actual page component)
  • price/currency parse anomalies
  • title mismatch with catalog `name`

Report-only. Never rewrites the feed.

Usage: python3 /app/backend/scripts/audit_merchant_feed.py
"""
from __future__ import annotations

import re
from pathlib import Path
from xml.etree import ElementTree as ET

FEED_PATH = Path("/app/frontend/public/merchant-feed.xml")
CATALOG_PATH = Path("/app/frontend/src/data/products.js")
APP_PATH = Path("/app/frontend/src/App.js")

NS = {"g": "http://base.google.com/ns/1.0"}


def parse_catalog_names() -> dict[str, str]:
    src = CATALOG_PATH.read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r"\{[^{}]*?slug:\s*['\"]([a-z0-9\-]+)['\"][^{}]*?\}", src, re.DOTALL):
        block = m.group(0)
        name = re.search(r"name:\s*['\"]([^'\"]+)['\"]", block)
        if name:
            out[m.group(1)] = name.group(1)
    return out


def known_route_paths() -> set[str]:
    src = APP_PATH.read_text(encoding="utf-8")
    return set(re.findall(r'path="([^"]+)"', src))


def main() -> int:
    tree = ET.parse(str(FEED_PATH))
    root = tree.getroot()
    items = root.findall(".//item")
    names = parse_catalog_names()
    routes = known_route_paths()

    issues: list[str] = []
    prices = []
    for it in items:
        gid = it.findtext("g:id", default="", namespaces=NS)
        title = it.findtext("g:title", default="", namespaces=NS)
        link = it.findtext("g:link", default="", namespaces=NS)
        image = it.findtext("g:image_link", default="", namespaces=NS)
        price = it.findtext("g:price", default="", namespaces=NS)
        avail = it.findtext("g:availability", default="", namespaces=NS)

        if not image:
            issues.append(f"[no-image] {gid}")
        if not price or not re.match(r"^\d+(\.\d+)?\s+(USD|CAD)$", price):
            issues.append(f"[bad-price] {gid}: {price!r}")
        if avail != "in_stock":
            issues.append(f"[bad-availability] {gid}: {avail!r}")
        # Route existence check
        path = link.replace("https://phileon.com", "")
        if not any(path == r or path.startswith(r.rstrip('*')) for r in routes):
            issues.append(f"[route-missing] {gid}: {path}")
        # Title vs catalog
        catalog_name = names.get(gid)
        if catalog_name and title.strip() != catalog_name.strip():
            issues.append(f"[title-mismatch] {gid}: feed={title!r} catalog={catalog_name!r}")
        prices.append((gid, price))

    print(f"[merchant-audit] items={len(items)} · issues={len(issues)}")
    for i in issues:
        print(f"  • {i}")
    if not issues:
        print("  ✔ all listings pass consistency checks")

    # Preview 5 prices
    print("\nFirst 5 listings:")
    for gid, price in prices[:5]:
        print(f"  {gid}: {price}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
