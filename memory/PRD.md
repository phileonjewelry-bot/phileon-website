# PHILEON — Luxury Jewelry Platform (PRD)

## Original Problem Statement
High-end, cinematic, editorial e-commerce for bespoke jewelry. Strict sitewide page rhythm: SEE → UNDERSTAND → CHOOSE → BUY (Hero → Intro → Archive Gallery → Composition/Specs → Configurator → ADD TO CART → Final Word). Sitewide dynamic pricing computed from CAD base, displayed strictly in USD. Typography: Playfair Display, Cinzel, Cormorant Garamond.

## Core Rules
- **Sitewide Page Order** (non-negotiable): Hero → Editorial/Intro → Archive Gallery → Specs → Configurator → Add to Cart → Final Word. Gallery NEVER below Configurator.
- **Pricing Sync**: Any tier/SKU change must mirror in BOTH `/app/frontend/src/data/livePricingConfig.js` AND `/app/backend/pricing_engine.py`.
- **Video Codecs**: Playwright headless cannot decode H.264 MP4 → ignore black-frame test artifacts when `ffprobe` confirms valid encoding.

## Product Pages (Bespoke)
LADY JAY, COURONNE, CYPHER, RHYTHM MESH, BLESSED, BATTENTI DELLA VILLA, GENT, STACKRATS, WYNETTE'S PALETTE, VEYRON NOIR, NERVATURA.

## Architecture
- Frontend: `/app/frontend/src/pages/` (bespoke per-product pages)
- Pricing config (FE): `/app/frontend/src/data/livePricingConfig.js`
- Pricing validator (BE): `/app/backend/pricing_engine.py`
- Catalog: `/app/frontend/src/data/products.js` + `/app/frontend/src/pages/ShopDropPage.jsx`

## CHANGELOG
- 2026-02-12 — **BOSS KNOT gallery expanded**: 5 new shots wired in (2 product macros + 1 close detail + 2 lifestyle/arrival shots). Editorial layout — 2-col half cells for product details, full-width 16:9 cells for lifestyle frames. All 5 images verified loaded via `naturalWidth > 0`. Hero remains the original woven tie shot.
- 2026-02-12 — **BOSS KNOT** (Gentleman's Club · The Collective · Executive Pendant) — created `/products/boss-knot`. 3 SKUs: Sterling Silver $3,200, 10K Yellow Gold $8,500, 10K White Gold $8,500. Cascading configurator (Metal → Colour → Karat; colour/karat disabled when Silver). 18" matching chain included on every SKU. Woven mesh architecture, 70mm × 25mm. Added to homepage carousel + Signature Pieces grid. ShopDropPage CORE list updated. livePricingConfig.js + pricing_engine.py synced (`/api/validate-cart` returns diff=0 for all 3 tiers).
- 2026-02-11 — Veyron Noir archive gallery expanded: replaced archive-1 with new 3/4 suede macro shot; added archive-11 (lounge/whiskey lifestyle) and archive-12 (steering-wheel-at-Bugatti lifestyle). Total: **12 frames**. Header copy updated from "Five frames from the garage." → "Frames from the garage." CSS grid updated so frames 5, 10, 11, 12 span full width; lifestyle frames (11, 12) use 16:9 aspect with `object-fit: cover` for cinematic closure.
- 2026-02-11 — Built WYNETTE'S PALETTE & VEYRON NOIR pages, added to catalog/home.
- Earlier — STACKRATS image/configurator/hero-video fixes; pricing engine integration.

## Roadmap
### P0 (next)
- Run `testing_agent_v3_fork` on WYNETTE'S PALETTE & VEYRON NOIR (cart, dynamic pricing, layout order regression).

### P1
- Consolidate `ShopDropPage.jsx` + `products.js` into one source of truth.
- Port luxury motion system (`.lm-loaded`, `.gd-reveal`) to NERVATURA & COURONNE.
- Build Chains category (`/shop?category=chains`).
- Fix lint warnings in `backend/routes/cart.py`.

### Awaiting User
- **Actual BOSS KNOT imagery** — hero + gallery shots (woven mesh tie-silhouette pendant). Currently using Rose-of-Sharon placeholders.
- Final VEYRON NOIR pricing (currently "PRICE COMING SOON").
- Production hero footage for Wynette's Palette & Veyron Noir.

## Integrations
- Stripe (Payments) — needs user API key.
- Emergent Universal LLM Key — backend image generation (Nano Banana).
kend image generation (Nano Banana).
