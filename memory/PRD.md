# PHILEON — Product Requirements Document

## Original Problem Statement
High-end luxury jewelry e-commerce site (PHILEON) with strict cinematic editorial UI (LA BÊTE visual language). Ongoing: content/UI expansion of Fine Jewelry, Inspiration Vault, and now Bracelets, with cinematic vertical galleries, autoplay-muted-loop hero video, and product-page detail pages per SKU.

## Product Registry (implemented)
- **Fine Jewelry Rings**: Rhythm Mesh, OVATION Ribbed Ring, BAJAN JOE Signet Ring, RHYTHM MESH, LA BÊTE, CYPHER, BOUND, APEX, HOMAGE, TRIBUTE: LA BÊTE, BLESSED, COOGI I, TOLA II, Galatians 6:14, TRACE, IL MORSO DEL RE
- **Fine Jewelry Bracelets/Bangles**: **CRESTA NERA (NEW)** (10K/14K Yellow Gold · Black Diamonds · hinged)
- **Inspiration Vault**: Orbit Lumière, Viridian Teardrops, Prismatic Laurel, Noir Tide, Prima Wave, Noir Cadence, Liaison, STAMPEDE, NIGHTFANG, PARALLAX
- **Other**: PTP Cuff, Forme Cuff, Désir Corset, Rosaria, Alejandra Heels, La Marva, Annie Rose, Monika Couture, Katrina Cascata

## Architecture
- Frontend: React (CRA) — pages under `/app/frontend/src/pages`, product data in `/app/frontend/src/data/products.js`
- Backend: FastAPI (routes `/api/*`), MongoDB via `MONGO_URL`, Stripe checkout scaffolding in `/app/backend/routes/checkout.py`
- Shared components: `RingProductPage`, `RingSizeSelector`, **`WristSizeSelector` (NEW)**, **`BraceletSizeGuideModal` (NEW)**
- Custom IntersectionObserver lazy-loading + quadruple-redundant video loop (do not refactor)

## Changelog

### Feb 2026
- **[DONE]** CRESTA NERA Hinged Bangle — new product with metal (10K/14K YG) + wrist size (S/M/L/XL) required selectors, dynamic pricing matrix ($10,495–$12,595), bespoke page, hero video, main-page carousel placement, `WristSizeSelector` + `BraceletSizeGuideModal` shared components
- BAJAN JOE Signet Ring — additional gallery images (bar-hand editorial); reptile-detail zoom overlay; 17-size gents range 7–15 with required validation
- Ring-size selector dropdown positioning bug fixed (now anchors to button, not to parent root)
- OVATION Ribbed Ring — audience-conditional galleries (gents lifestyle + ladies palm shots), 8-image gallery + reorder

## Roadmap / Backlog

### P1 — Paused, awaiting user
- Stripe Phase 1 Checkout E2E testing (blocked on env-var injection workflow)

### P2
- Phase 2 Stripe Financing (Affirm / Klarna / Afterpay)
- Phase 3 PayPal integration
- Backend seed for CRESTA NERA if the `/api/products?featured=true` featured section is re-enabled on the homepage

### P3
- Expand backend `catalog.py` for sitewide secure checkout
- Abandoned-cart email logic
- Companion gents signet piece to BAJAN JOE
- Sticky mobile Add-to-Cart bar

## Strict Rules
- Do NOT modify Stripe, `checkout.py`, `catalog.py`, `stripe_routes.py`, webhooks, or payment env vars
- Do NOT modify the SCACCO MATTO pilot catalog
- Do NOT refactor the gallery video loop logic

## Key File References
- `/app/frontend/src/pages/CrestaNeraBanglePage.jsx` — new bangle product page
- `/app/frontend/src/components/WristSizeSelector.jsx` — new shared wrist selector
- `/app/frontend/src/components/BraceletSizeGuideModal.jsx` — new shared bracelet size guide
- `/app/frontend/src/pages/BajanJoeSignetRingPage.jsx`, `/app/frontend/src/pages/OvationRibbedRingPage.jsx`
- `/app/frontend/src/data/products.js` — central product registry
- `/app/frontend/src/components/RingProductPage.jsx`, `/app/frontend/src/components/RingSizeSelector.jsx`
- `/app/frontend/src/components/PhileonCarousel.jsx`, `/app/frontend/src/pages/HomePage.jsx` (stripItems)
- `/app/backend/routes/checkout.py` — Stripe (on hold)
