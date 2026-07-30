# PHILEON — Product Requirements Document

## Original Problem Statement
High-end luxury jewelry e-commerce site (PHILEON) with strict cinematic editorial UI (LA BÊTE visual language). Phase 1 goal: server-side secure Stripe checkout. Ongoing: content/UI expansion of the Fine Jewelry line and Inspiration Vault, with cinematic vertical galleries, lazy-loaded video, and product-page detail pages per SKU.

## Product Registry (implemented)
- **La Marva** (rings), **Annie Rose** (rings), **Monika Couture** (earrings), **Katrina Cascata** (earrings)
- **Inspiration Vault**: Orbit Lumière, Viridian Teardrops, Prismatic Laurel, Noir Tide, Prima Wave, Noir Cadence, Liaison, STAMPEDE (set), NIGHTFANG (set), PARALLAX (drop earrings)
- **Fine Jewelry**: Rhythm Mesh Ring, **OVATION Ribbed Ring**, TOLA II, Galatians 6:14, TRACE, BOUND, APEX, HOMAGE, CYPHER, IL MORSO DEL RE, TRIBUTE: LA BÊTE, BLESSED, COOGI I
- **Bracelets**: PTP Cuff, Forme Cuff
- **Pendants**: Désir Corset
- **Earrings**: Rosaria, Alejandra Heels

## Architecture
- Frontend: React (CRA) — pages under `/app/frontend/src/pages`, product data in `/app/frontend/src/data/products.js`, shared ring template in `RingProductPage.jsx`.
- Backend: FastAPI (routes prefixed `/api`), MongoDB via `MONGO_URL`, Stripe checkout scaffolding in `/app/backend/routes/checkout.py`.
- Custom `IntersectionObserver` lazy-loading + quadruple-redundant video looping (native loop + `ended` + `timeupdate` + `pause` catcher) — **do not refactor**.
- Square Inspiration Vault cards use `aspect-ratio: auto` CSS override.

## Changelog

### Feb 2026
- **[DONE]** Integrated final OVATION Ribbed Ring assets (hero = 3-ring stack on light marble; gallery = dark-stone stack, hand-worn stack, single ring on wood). Placeholder removed from `products.js` and `OvationRibbedRingPage.jsx`.
- **[DONE]** Added `hoverImage` for OVATION card in Fine Jewelry grid.

### Previous session
- Added NIGHTFANG SET to Inspiration Vault
- Rebuilt IV galleries into vertical lazy-loaded stacks
- Added PARALLAX DROP EARRINGS (with video looping fix)
- Created OVATION Ribbed Ring page + 7 metal/karat variants (placeholder image at the time)

## Roadmap / Backlog

### P1 — Paused, awaiting user
- Stripe Phase 1 Checkout E2E testing (blocked on env-var injection workflow; user forbade putting `STRIPE_SECRET_KEY` in `/app/backend/.env`).

### P2
- Phase 2 Stripe Financing: Affirm / Klarna / Afterpay dynamic appearance based on eligibility.
- Phase 3 PayPal integration (JS SDK + PayPal Orders v2 API backend).

### P3
- Expand backend `catalog.py` to support all PHILEON products (sitewide rollout of secure checkout).
- Abandoned-cart email logic.
- Optional refactor: extract shared `<MetalKaratSelector>` from `RingProductPage.jsx`.

## Strict Rules
- Do NOT modify Stripe, `checkout.py`, `catalog.py`, `stripe_routes.py`, webhook files, or payment architecture.
- Do NOT refactor the gallery video loop logic in product pages.

## Key File References
- `/app/frontend/src/data/products.js` — central product registry
- `/app/frontend/src/pages/OvationRibbedRingPage.jsx` — OVATION page + 4-image gallery
- `/app/frontend/src/pages/NightfangSetPage.jsx`
- `/app/frontend/src/pages/ParallaxDropEarringsPage.jsx`
- `/app/frontend/src/pages/InspirationVaultPage.jsx`
- `/app/frontend/src/components/RingProductPage.jsx` — shared ring template
- `/app/backend/routes/checkout.py` — Stripe (on hold)

## DB
- `orders_v2`: {internal_order_id, public_order_number, secure_status_token} (not actively used this session).
