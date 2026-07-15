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
- **PHILEON Fine Jewelry** (Ladies First → Earrings)
  - 2026-07-13 — **ARCHITRAVE** · Diamond & CZ Openwork Drop Earrings · rose-window openwork medallion + graduated 3-station drop · 536 stones per pair (268 per earring)
    - **Editions** (internal CAD → converted USD via shared `cadToUsdLuxury()` at $500 luxury steps):
      • Sterling Silver · AAA CZ · CAD 8,950 → **$6,500 USD** · SKU `architrave-silver-cz`
      • 10K White Gold · Lab Diamonds · CAD 9,750 → **$7,500 USD** · SKU `architrave-10k-white-lab`
      • 14K White Gold · Lab Diamonds · CAD 9,950 → **$7,500 USD** · SKU `architrave-14k-white-lab` *(default)*
    - Made to order · Sold as a pair · uses existing PHILEON Add-to-Cart + checkout (no Inquire flow)
    - Public storefront exposes USD only; `basePriceCAD` retained internally
    - **Hero film**: `/architrave/hero-film.mp4` (1280×720, silent, autoplay+muted+loop+playsInline, poster = `still-clean-pair.jpg`); mobile hero breaks out to `calc(100vw - 24px)` with border/padding removed for maximum presence (verified uncropped at 360/390/430 px)
    - **Gallery**: 6 cells — 5 stills + 1 silent portrait autoloop film, 2-col desktop / 1-col mobile, `object-fit: contain`, no captions
    - **Shop card**: `FROM $6,500 USD`, static image (no video, no Editorial Film overlay)
    - Routes `/architrave` + `/products/architrave`; catalog entry in `Ladies First > Earrings`
- **Inspiration Vault** (editorial archive) w/ `VaultArchiveNotice`
  - 2026-07-14 — **CAGED WINGS** ($70 USD) · Inspiration Vault > Earrings · pavé butterfly drop earrings · bright white plated base metal · clear AAA cubic zirconia · sold as one pair
    - **Hero**: temporary static image (`hero-poster.jpg`) — no final hero video selected yet; do NOT wire `hero-film.mp4` until the final asset is approved
    - **Gallery**: 5 items (2 photographs + 3 silent autoplay films) · natural aspect ratios · `object-fit: contain` · no captions or overlays · all films `autoplay muted loop playsInline controls={false} disablePictureInPicture` via `videoRefs` useEffect
    - **Vault index card**: static image-only (no video on the index card)
    - **Cart**: ADD TO CART wired through the existing PHILEON `CartDrawer` (verified subtotal $70 USD, success toast)
    - **Copy restrictions**: bright white plated base metal + clear AAA cubic zirconia only — NO sterling, white-gold, platinum, or diamond claims
    - **Routes**: `/caged-wings` + `/inspiration-vault/caged-wings`
    - **Frozen**: keep implementation unchanged until the final hero video is selected (no "Just Added" / "New to the Archive" ribbon)
    - **Files touched**: `/app/frontend/src/pages/CagedWingsPage.jsx` (new), `/app/frontend/src/App.js` (import + 2 routes), `/app/frontend/src/pages/InspirationVaultPage.jsx` (manifest entry only). MONACO, ORIEL, ARCHITRAVE, Ladies First, homepage, cart logic, checkout logic untouched.
  - 2026-07-13 — **MONACO** ($60 USD) · Inspiration Vault > Rings · pavé two-finger statement ring · bright white plated base metal · AAA CZ · silent hero film · `/monaco` + `/inspiration-vault/monaco`
  - 2026-07-11 — **ORIEL** ($40 USD) · rhodium-plated nickel-free openwork rose-window drop earrings · AAA pavé CZ · hero film (720x1280, muted autoloop) · 6-slot gallery (4 studio + 2 lifestyle) · `/oriel` + `/inspiration-vault/oriel`
  - 2026-07-10 — ALTAR ($40 USD) · gold-plated stainless-steel architectural cross cuff · portrait hero film · `/altar` + `/inspiration-vault/altar`
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
