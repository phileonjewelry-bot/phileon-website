# PHILEON — Luxury Jewelry Platform

> ⚠️ **Read `/app/memory/BLUEPRINT.md` FIRST.** It is the PHILEON constitution — the permanent design philosophy, architecture, and non-negotiable rules. All future work must follow the Blueprint before consulting this PRD or the CHANGELOG.
>
> Documentation hierarchy: **BLUEPRINT.md → PRD.md → CHANGELOG.md**.

> *The project has moved beyond building pages. Current development focuses on refining the experience.*

---

## Original Problem Statement
High-end, cinematic, editorial e-commerce for bespoke jewelry. Strict sitewide page rhythm:
**SEE → UNDERSTAND → CHOOSE → BUY** (Hero → Intro → Archive Gallery → Composition/Specs → Configurator → ADD TO CART → Final Word).
Sitewide dynamic pricing computed from CAD base, displayed strictly in USD. Typography: Playfair Display · Cinzel · Cormorant Garamond.

---

## ✅ Completed (Do Not Redesign Without Explicit Request)

- **Ladies First** — bespoke product pages (Wynette's Palette, Lady Boss Knot, Annie Rose, La Marva, Monika Couture, Alejandra Heels, Rosaria, Désir Corset, Forme Cuff, Cypher, Trace, Bound, Apex, Homage, DRAPE, Le Cocktail de Jessica, Nervatura, The Grand Dame, The Carapace, Battenti della Villa, Stackrats, Lady Jay, Lisa)
- **The Gentleman's Club** — Uncle Jo, Veyron Noir, Boss Knot, Cypher, Il Morso del Re, La Bête, Blessed, COOGI I, Galatians 6:14, Tola II, PTP Cuff, Rhythm Mesh, Midweek, Gent, Porta Aurea, COOGI DNA Tag, The True Vine, The Don Gorgon, Prise de Couronne
- **The Collective** — cross-audience editorial pieces
- **Bamburgh Circle** — collector enclave (Bamburgh, Lady Bamburgh)
- **Sacred Collection** — Rose of Sharon, Galatians 6:14, Corinthians 15:14, The True Vine, Blessed
- **Inspiration Vault** — archival "found, not created" curatorial mode:
  - Category nav (All · Earrings · Rings · Bangles & Bracelets · Pendants & Necklaces)
  - Universal `VaultHero` (image → 1.7s hold → crossfade → looping muted video; graceful image-only fallback; museum sizing `object-fit: contain`, 85vh stage)
  - Editorial Film badge on cards with motion assets
  - Scarcity line "Available until the Vault closes." in every product page
  - Curator signature ("— Curated by Phill Wilson")
  - Pieces: Prima Wave · Noir Cadence · Liaison · Noir Tide · Prismatic Laurel · Viridian Teardrops
- **Shop Catalog Consolidation** (Single Source of Truth) — `catalogProducts` array + deep `products` object both live in `/app/frontend/src/data/products.js`. `ShopDropPage.jsx` reduced 1,454 → 689 lines.

---

## 🟡 Active Priorities

### P2 — Chains Collection
Build out `/shop?category=chains` category. Pieces, configurator, dynamic pricing tier sync, hero motion.

### P3 — Luxury Motion System
Continue refining museum-quality motion, editorial transitions, and quiet luxury interactions.

- **NERVATURA** — port the new luxury motion system (`.lm-loaded`, `.gd-reveal`, staggered reveals)
- **COURONNE** — same treatment

---

## 🔵 Future / Backlog

- Backend catalog alignment (`/api/products` ↔ `catalogProducts`)
- Pricing engine refinements (tighten `round_luxury()` for exact sub-$100 prices)
- Additional Inspiration Vault releases
- Editorial campaign films (longer-form motion studies per piece)
- Collector numbering (per-edition serialisation for the archive)
- Limited editions (release windows, edition counts, archive flags)
- Lint cleanup in `backend/routes/cart.py`

---

## 🧭 PHILEON Development Philosophy

The project has moved beyond building pages. Current development should focus on **refining the experience**.

### Prioritise
- **PHILEON Editorial Observation Standard** — every page reads as a curated editorial study, not a product listing.
- **Museum-quality presentation** — generous black negative space, image-first composition, restrained typography.
- **Quiet luxury motion** — no pulsing, no bouncing, no loud animation. Crossfades, slow scale (≤1.03), staggered reveals only.
- **Gallery sequence (5 movements):** `Object → Observation → Craft → Scale → Motion`
- **Editorial storytelling** — Hero → Intro → Archive Gallery → Specs → Configurator → ADD TO CART → Final Word.
- **Performance** — minimise above-the-fold weight, lazy-load gallery cells, strip audio from hero videos for autoplay reliability.
- **Reusable architecture** — shared components like `VaultHero` drive consistent presentation across collections.
- **Manifest-driven collections** — adding a new piece = one entry in the manifest; layout / motion / sizing inherit automatically.

### Preserve All Completed Work
Completed collections are stable. Do not redesign without explicit request.

### PHILEON Blueprint = Governing Design System
All future development must align with the Blueprint above. New collections inherit it; one-off departures require deliberate justification.

---

## 🏗 Architecture

### Frontend
- Product detail pages: `/app/frontend/src/pages/`
- Shared components: `/app/frontend/src/components/` (`VaultHero`, etc.)
- Catalog single source of truth: `/app/frontend/src/data/products.js` (exports `products` + `catalogProducts` + `getCatalogList`)
- Live pricing config: `/app/frontend/src/data/livePricingConfig.js`

### Backend
- Pricing validator: `/app/backend/pricing_engine.py` (must mirror any FE pricing change)
- Cart endpoint: `POST /api/validate-cart`
- Products list: `GET /api/products` (pending alignment with `catalogProducts`)

### Core Rules
- **Sitewide page order is non-negotiable** — gallery NEVER below configurator.
- **Pricing sync**: any tier/SKU change MUST mirror in both `livePricingConfig.js` AND `pricing_engine.py`.
- **Video codecs**: Playwright headless cannot decode H.264 MP4. Verify videos via `ffprobe` + DOM attributes, NOT screenshot playback.
- **Hero videos**: use the direct `src` attribute on `<video>`. Never nest `<source>` (React `networkState: 3 / NO_SOURCE` bug). Strip audio (`ffmpeg -an`) for reliable autoplay.

---

## 📚 History
Detailed implementation log: see `/app/memory/CHANGELOG.md`.

## 🔌 Integrations
- Stripe (Payments) — pending user API key
- Emergent Universal LLM Key — image generation (Nano Banana) when needed
