#!/usr/bin/env python3
"""
PHILEON — Google Merchant Center product feed generator (Phase 4).

Reads /app/frontend/src/data/products.js (regex parse — no runtime imports)
and writes a Google-Merchant-compatible XML feed to
/app/frontend/public/merchant-feed.xml.

Rules:
  • Only real catalog data. No invented GTINs, MPNs, stock counts, ratings.
  • Skip placeholders (status='placeholder' or purchasable:false).
  • Preserve currency as stored — never CAD→USD or USD→CAD.
  • Preserve original PHILEON artistic names in <title>. The Phase-2 SEO
    layer already exposes descriptive product types in <description>.
  • Brand = PHILEON, condition = new.

Run:
  python3 /app/backend/scripts/generate_merchant_feed.py
"""
from __future__ import annotations

import html
import re
from datetime import datetime, timezone
from pathlib import Path

SITE_ORIGIN = "https://phileon.com"
CATALOG_PATH = Path("/app/frontend/src/data/products.js")
OUT_PATH = Path("/app/frontend/public/merchant-feed.xml")

# category → Google product category name (public, not the numeric ID; MC
# accepts both). Only categories we actually ship are mapped.
GOOGLE_CATEGORY = {
    "rings": "Apparel & Accessories > Jewelry > Rings",
    "pendants": "Apparel & Accessories > Jewelry > Necklaces",
    "necklaces": "Apparel & Accessories > Jewelry > Necklaces",
    "chains": "Apparel & Accessories > Jewelry > Necklaces",
    "earrings": "Apparel & Accessories > Jewelry > Earrings",
    "bracelets": "Apparel & Accessories > Jewelry > Bracelets",
    "bangles": "Apparel & Accessories > Jewelry > Bracelets",
    "anklets": "Apparel & Accessories > Jewelry > Anklets",
    "sets": "Apparel & Accessories > Jewelry > Jewelry Sets",
}


def parse_catalog(source: str) -> list[dict]:
    entries: list[dict] = []
    block_re = re.compile(r"\{[^{}]*?slug:\s*['\"]([a-z0-9\-]+)['\"][^{}]*?\}", re.DOTALL)
    for m in block_re.finditer(source):
        block = m.group(0)
        slug = m.group(1)

        def find(key: str) -> str | None:
            mm = re.search(rf"{key}:\s*['\"]([^'\"]*)['\"]", block)
            return mm.group(1) if mm else None

        def find_bool(key: str) -> bool | None:
            mm = re.search(rf"{key}:\s*(true|false)", block)
            return None if not mm else mm.group(1) == "true"

        def find_first_category() -> str | None:
            mm = re.search(r"category:\s*\[([^\]]+)\]", block)
            if not mm:
                return find("category")
            first = re.search(r"['\"]([a-z\-]+)['\"]", mm.group(1))
            return first.group(1) if first else None

        def find_audience_flag() -> str | None:
            mm = re.search(r"audience:\s*\[([^\]]+)\]", block)
            audiences = re.findall(r"['\"]([a-z\-]+)['\"]", mm.group(1)) if mm else []
            for pref in ("gents", "gentlemens-club", "ladies"):
                if pref in audiences:
                    return pref
            return None

        entries.append({
            "slug": slug,
            "name": find("name") or slug.replace("-", " ").upper(),
            "href": find("href") or f"/products/{slug}",
            "material": find("materialLine"),
            "image": find("imageUrl"),
            "price_range": find("price_range"),
            "subtitle": find("subtitle"),
            "status": find("status"),
            "purchasable": find_bool("purchasable"),
            "category": find_first_category(),
            "audience": find_audience_flag(),
        })

    # Deduplicate by slug (first-wins).
    seen: set[str] = set()
    unique: list[dict] = []
    for e in entries:
        if e["slug"] in seen:
            continue
        seen.add(e["slug"])
        unique.append(e)
    return unique


def parse_price_range(price_range: str | None) -> tuple[str, str] | None:
    """Return (price_amount, currency_code). Preserves real currency.

    Handles: 'FROM $4,395 USD', '$18,000 CAD', 'CAD $18,000'. Returns None
    when no clean price is available (feed omits price so MC rejects listing
    rather than shipping fake data).
    """
    if not price_range:
        return None
    text = price_range.replace(",", "").upper()
    # currency
    if "USD" in text:
        currency = "USD"
    elif "CAD" in text:
        currency = "CAD"
    else:
        return None
    m = re.search(r"\$?\s*(\d+(?:\.\d+)?)", text)
    if not m:
        return None
    return (m.group(1), currency)


def infer_gender(audience: str | None) -> str | None:
    if audience in ("gents", "gentlemens-club"):
        return "male"
    if audience == "ladies":
        return "female"
    return None


def build_feed(products: list[dict]) -> str:
    now = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
    items: list[str] = []
    kept = 0
    for p in products:
        if p.get("status") == "placeholder":
            continue
        if p.get("purchasable") is False:
            continue
        price = parse_price_range(p.get("price_range"))
        if not price:
            continue  # never publish an invented price

        title = html.escape(p["name"])
        link = f"{SITE_ORIGIN}{p['href']}"
        image = html.escape(p.get("image") or "")
        description = html.escape(
            p.get("subtitle") or f"{p['name']} — PHILEON fine jewelry"
        )
        product_type = GOOGLE_CATEGORY.get(p.get("category") or "", "Apparel & Accessories > Jewelry")
        gender = infer_gender(p.get("audience"))
        material = html.escape(p.get("material") or "")

        item = [
            "  <item>",
            f"    <g:id>{p['slug']}</g:id>",
            f"    <g:title>{title}</g:title>",
            f"    <g:description>{description}</g:description>",
            f"    <g:link>{link}</g:link>",
        ]
        if image:
            item.append(f"    <g:image_link>{image}</g:image_link>")
        item += [
            f"    <g:availability>in_stock</g:availability>",
            f"    <g:price>{price[0]} {price[1]}</g:price>",
            f"    <g:brand>PHILEON</g:brand>",
            f"    <g:condition>new</g:condition>",
            f"    <g:google_product_category>{product_type}</g:google_product_category>",
            f"    <g:identifier_exists>no</g:identifier_exists>",
        ]
        if material:
            item.append(f"    <g:material>{material}</g:material>")
        if gender:
            item.append(f"    <g:gender>{gender}</g:gender>")
        item.append("  </item>")
        items.append("\n".join(item))
        kept += 1

    channel = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n'
        "  <channel>\n"
        "    <title>PHILEON Fine Jewelry</title>\n"
        f"    <link>{SITE_ORIGIN}/</link>\n"
        "    <description>PHILEON — architectural fine jewelry, statement rings, pendants and editorial releases.</description>\n"
        f"    <lastBuildDate>{now}</lastBuildDate>\n"
        + "\n".join(items) + "\n"
        "  </channel>\n"
        "</rss>\n"
    )
    return channel, kept


def main() -> int:
    source = CATALOG_PATH.read_text(encoding="utf-8")
    products = parse_catalog(source)
    xml, kept = build_feed(products)
    OUT_PATH.write_text(xml, encoding="utf-8")
    print(
        f"[merchant-feed] wrote {OUT_PATH} · scanned={len(products)} · listed={kept} · "
        f"skipped={len(products) - kept} (placeholders/no-price)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
