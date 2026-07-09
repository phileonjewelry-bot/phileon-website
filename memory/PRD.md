# PHILEON — Product Requirements Document

## Original Problem Statement
The user is building a high-end luxury jewelry e-commerce platform requiring bespoke, cinematic product pages with strict layout rhythms. All work must adhere to `/app/memory/BLUEPRINT.md` (the PHILEON Constitution).

**Design principles**
- Cinematic, editorial UI
- Strict typography (Playfair Display, Cinzel, Cormorant Garamond)
- Page flow: SEE → UNDERSTAND → CHOOSE → BUY
- Strict frontend/backend cart price sync via `/api/validate-cart`
- No cropping of jewelry — `object-contain` with generous black negative space

## Architecture
- **Frontend**: React (CRA), Tailwind, Shadcn/UI, framer-motion (`LuxuryMotion`)
- **Backend**: FastAPI + MongoDB, `pricing_engine.py` for cart validation
- **Catalog**: single source of truth in `/app/frontend/src/data/products.js` + `catalogProducts` array
- **Rings**: standardized via `RingProductPage.jsx` (tier + size selectors, per-tier gallery)
- **Vault pieces**: cinematic hero + `VaultArchiveNotice`
- **Live pricing**: `livePricingConfig.js` (frontend) mirrored by `pricing_engine.py` (backend)

## What's Been Implemented (up to 2026-07)
- Rose of Sharon, Boss Knot, Lady Boss Knot, Uncle Jo, Veyron Noir, Wynette Palette, La Marva, Annie Rose, Monika Couture, Katrina Cascata, Alejandra Heels, PTP Cuff, Rosaria, Désir Corset, Forme Cuff, Rhythm Mesh Ring, TOLA II, GALATIANS 6:14, TRACE, BOUND, APEX, HOMAGE, CYPHER, IL MORSO DEL RE, TRIBUTE: LA BÊTE, BLESSED, COOGI I, Fondo Curvo, 1 Corinthians 15:14, DRAPE, Le Cocktail de Jessica, Prise de Couronne, Nervatura, The Don Gorgon, The Grand Dame, The Carapace, MIDWEEK, LA MADONNA, LA SCARPA DELLA REGINA, BAPE, LISA, LADY JAY, THE TRUE VINE, PORTA AUREA, COOGI DNA TAG, BATTENTI DELLA VILLA, GENT, STACKRATS, Deco Éventail, Orbit Lumière
- **Inspiration Vault** (editorial archive) w/ 13 pieces + `VaultArchiveNotice`
  - 2026-07-10 — **ALTAR** ($40 USD) · gold-plated stainless-steel architectural cross cuff · `/altar` + `/inspiration-vault/altar` (hero is image-only pending the editorial film upload)
  - 2026-07-09 — ROSELINE ($50 USD) · rose-gold pavé safety-pin cuff bangle
  - 2026-07-07 — LUCENT ($70 USD) · articulated pavé chain-link hoop earrings
  - 2026-07-06 — ÉCHELLE ($115 USD) · three-tone architectural ribbon hoops
  - 2026-07-05 — PARABOLA ATELIER ($100 USD) · concave study companion to the Parabola family
- **PARABOLA** family (Ladies First · Heritage · Atelier) w/ shared `ParabolaFamilyNav`
  - Sterling Silver ($1,250 USD) · 10K White Gold ($7,800 CAD) · 10K Rose Gold ($7,800 CAD)
  - Per-tier gallery swap (Silver + White Gold → white-metal gallery, Rose Gold → rose-gold gallery)
  - Default metal: **10K Rose Gold**; default ring size: **US 7**
  - Frontend/backend price sync verified — `difference: 0` for all tiers via `/api/validate-cart`

## Backlog / Prioritized Roadmap
- **P2** — Chains Collection (`/shop?category=chains`)
- **P3** — Backend catalog alignment
- **P3** — Pricing engine refinements
- **P3** — Additional Inspiration Vault releases
- **P3** — Editorial campaign films
- **P3** — Collector numbering & Limited editions
- **Future** — Surface "Sized to Order — Free Resizing" pill on ring shop cards

## Third-Party Integrations
- Stripe (Payments) — requires user API key
- Universal LLM Key (Emergent integrations)

## Key Files
- `/app/memory/BLUEPRINT.md` — PHILEON Constitution
- `/app/frontend/src/components/RingProductPage.jsx` — reusable ring page (per-tier gallery support added Feb 2026)
- `/app/frontend/src/components/VaultHero.jsx`
- `/app/frontend/src/components/LuxuryMotion.jsx`
- `/app/frontend/src/data/livePricingConfig.js`
- `/app/backend/pricing_engine.py`
- `/app/frontend/src/data/products.js`
