# PHILEON — Product Requirements Document

## Original Problem Statement
High-end luxury jewelry e-commerce site (PHILEON) with strict cinematic editorial UI (LA BÊTE visual language). Ongoing: content/UI expansion of Fine Jewelry, Inspiration Vault, and now Bracelets, with cinematic vertical galleries, autoplay-muted-loop hero video, and product-page detail pages per SKU.

## Product Registry (implemented)
- **Fine Jewelry Rings**: Rhythm Mesh, OVATION Ribbed Ring, BAJAN JOE Signet Ring, **QUADRIGA DOMINUS (NEW)**, RHYTHM MESH, LA BÊTE, CYPHER, BOUND, APEX, HOMAGE, TRIBUTE: LA BÊTE, BLESSED, COOGI I, TOLA II, Galatians 6:14, TRACE, IL MORSO DEL RE
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
- **[DONE Feb 11]** **Full-catalog migration wave 2** — 47 additional bespoke products routed through the trusted server-side catalog via a new reusable `services/pricing_engine_catalog.py` resolver. Now **58 products** total pass through server-authoritative pricing. Wave 2 includes 12 hand-set USD products (BOSS KNOT, LADY BOSS KNOT, VEYRON NOIR, WYNETTE'S PALETTE, UNCLE JO, ROSE OF SHARON, BATTENTI DELLA VILLA, GENT, STACKRATS, COOGI DNA TAG, KATRINA CASCATA, TRUE VINE), 8 Inspiration Vault fixed USD pieces (FIRST DISCOVERY, NOIR CADENCE, LIAISON, NOIR TIDE, PRISMATIC LAUREL, VIRIDIAN TEARDROPS, ORBIT LUMIÈRE, DECO ÉVENTAIL), and 27 dynamic-CAD-converted-to-USD live-priced rings/cuffs/pendants (BAMBURGH, LADY BAMBURGH, BLESSED, APEX, BOUND, IL MORSO DEL RE, LA BÊTE, CYPHER, COOGI I, HOMAGE, CORINTHIANS 15:14, TRACE, GALATIANS 6:14, DRAPE, FONDO CURVO, PRISE DE COURONNE, NERVATURA, THE DON GORGON, LADY JAY, PORTA AUREA, MONIKA COUTURE, COCKTAIL JESSICA, ROSARIA, ALEJANDRA HEELS, DÉSIR CORSET, FORME CUFF, PTP CUFF). Mirrors the frontend's deterministic `cadToUsdLuxury` conversion server-side so the customer-facing price is preserved exactly.
- **[DONE Feb 11]** **Live-pricing engine wired to trusted checkout** — 7 dynamic CAD rings (LA MARVA, ANNIE ROSE, RHYTHM MESH, TOLA II, PARABOLA, PARABOLA HERITAGE, OVATION) resolvable via `services/catalog._resolve_dynamic_ring`. Server pulls `metal_spot.get_spot()`, enforces `is_checkout_safe()` (fresh ≤10m / stale-usable ≤30m), computes CAD cents via the shared gold/silver delta formula + `round_luxury`. Fallback / expired snapshots → `LIVE_PRICE_UNAVAILABLE` 503.
- **[DONE Feb 11]** **PRICE_MOVED re-quote contract** — backend returns HTTP 409 when trusted price exceeds `MAX($50, 1%)` of the client's displayed snapshot. Redaction-safe payload: `product_slug`, `variant`, `old_display_price_cents`, `new_trusted_price_cents`, `currency`. `price_move_acknowledged=true` triggers a fresh market re-check; a second movement returns 409 again — no race-condition bypass. Frontend `Checkout.jsx` renders a cinematic PHILEON overlay.
- **[DONE Feb 11]** `MarketPricingContext` refreshes every 10 min (was 15), on `visibilitychange` after >10 min hidden, and on `phileon:refresh-market` event fired by `Checkout.jsx` at mount.
- **[DONE]** QUADRIGA DOMINUS — new gents statement ring with 4 colorway switch cards (Red/Black default, Black/Red, Green/Black, Black/Green), 10K/14K metal selector, gents US 7–15 half sizes, dynamic price matrix ($10,495–$13,750), shared `RingSizeSelector` reuse, size-guide CTA, substantial-band fit note. Registered in `/quadriga-dominus` (+ `/products/`, `/fine-jewelry/`) and appears in Gentleman's Club → Rings + Collective (excluded from Ladies and Inspiration Vault).
- **[DONE]** BAJAN JOE gallery — presentation-box (red PHILEON box) added as 9th/final gallery image; existing order preserved
- **[DONE]** CRESTA NERA Hinged Bangle — new product with metal (10K/14K YG) + wrist size (S/M/L/XL) required selectors, dynamic pricing matrix ($10,495–$12,595), bespoke page, hero video, main-page carousel placement, `WristSizeSelector` + `BraceletSizeGuideModal` shared components
- BAJAN JOE Signet Ring — additional gallery images (bar-hand editorial); reptile-detail zoom overlay; 17-size gents range 7–15 with required validation
- Ring-size selector dropdown positioning bug fixed (now anchors to button, not to parent root)
- OVATION Ribbed Ring — audience-conditional galleries (gents lifestyle + ladies palm shots), 8-image gallery + reorder

## Roadmap / Backlog

### P0 — Blocked on user env
- Provide `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` → unblock E2E checkout for all 11 catalog products
- Provide `METALS_API_KEY` → replace deterministic fallback in `metal_spot.py` with live provider quotes

### P1
- Migrate remaining 60+ bespoke products into trusted catalog (needs merchant pricing CSV)
- Analytics event when PRICE_MOVED is triggered (product, delta $, session id)

### P2
- Phase 2 Stripe Financing (Affirm / Klarna / Afterpay)
- Phase 3 PayPal integration
- Backend seed for CRESTA NERA if the `/api/products?featured=true` featured section is re-enabled on the homepage

### P3
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
