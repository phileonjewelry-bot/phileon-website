# PHILEON — Product Requirements

## Original Problem Statement
High-end luxury jewelry e-commerce. Bespoke, cinematic product pages with strict
layout rhythms, sitewide live metal pricing, locked typography (Playfair Display,
Cinzel, Cormorant Garamond). Minimal precision-driven, conversion-optimized
design with deep blacks and soft champagne gold accents. All customer-facing
prices render in USD (CAD * 0.75 with luxury rounding rules).

## Core Requirements
- 92vh full-bleed cinematic heroes (autoplay video or hero image)
- Sitewide live metal pricing (gold/silver/platinum/palladium ticker)
- Backend cart validation to prevent price manipulation
- Cartier-style luxury motion: opacity shifts + IntersectionObserver staggered
  reveals, no aggressive scaling/bouncing
- Strict 5-frame Carapace gallery, never auto-regenerated without user approval

---

## Implemented (Latest)

### 2026-02 — LA SCARPA — FINAL WORD Closer Upgrade
- Replaced the small Cormorant italic closer with a full editorial
  cinema closer: 180px vertical padding, deep burgundy gradient
  (#4a1f24 → #341317), centered ivory Cormorant headline at
  clamp(2.4rem, 5vw, 4.8rem) line-height 1.08, soft cream FINAL WORD
  eyebrow at 0.45em tracking.
- Added animated gold signature line that draws from 0 → 240px over
  3.5s ease-out with 0.45s delay — soft champagne radial gradient,
  underlines the sentence like a signature. Verified: 240px width hit
  exactly post-animation.
- H2 semantic for accessibility.

### 2026-02 — LA SCARPA DELLA REGINA — Page Restructure
- Removed duplicate "Artifact" pendant render section (FRAME tile in
  archive already covers this view).
- Reordered final page flow per user spec:
  1. Hero (portrait + Italian/English intro copy + ADD TO CART)
  2. 9-Slot Archive Gallery (CinematicLightbox)
  3. Editorial — COMPOSITION · STRUCTURE · CRAFT (3 blocks; FINAL WORD
     pulled out)
  4. Specifications
  5. Pricing + ADD TO CART
  6. FINAL WORD — singular closer on burgundy band
     ("Every great room has a woman in it worth remembering.")
- Italian "La corona fu data" signature stanza retired in favour of the
  cleaner FINAL WORD closer per the new spec.

### 2026-02 — LA SCARPA DELLA REGINA — 9-Slot Archive + LA REGINA Closer
- Gallery reordered per final user spec and expanded to 9 frames:
  1. CAMPAIGN · 2. INTIMACY · 3. ARCHIVE OBJECT · 4. LIFESTYLE ·
  5. REFLECTION · 6. FRAME · 7. DETAIL · 8. PROFILE · 9. LA REGINA.
- Added LA REGINA ownership-fantasy shot (`/la-scarpa/scarpa-09-la-regina.png`)
  as the closer — owner in emerald silk holding the pendant within a
  vanity-room interior. Lightbox now reads `09 / 09`.
- Archive subtitle updated → "Nine frames. One artifact."
- Pendant render click target corrected to FRAME (lightbox idx 5, 1-indexed
  slot 06) following the reorder.
- **STILL PENDING**: 10th `ON BODY` slot — no image yet supplied that's
  distinct from the CAMPAIGN portrait.

### 2026-02 — LA SCARPA DELLA REGINA — Copy Refresh + 8th Gallery Slot
- Replaced hero couplet:
  - Italian: "Non chiede la stanza. / La stanza si riorganizza intorno a lei."
  - English: "A queen does not ask for the room. / The room rearranges itself."
- FINAL WORD editorial block updated → "Every great room has a woman in it
  worth remembering."
- Added 8th gallery frame `IN HAND` (`/la-scarpa/scarpa-08-in-hand.png`) —
  manicured hand cradling the pendant against ivory silk. Lightbox now
  reads `08 / 08`.

### 2026-02 — LA SCARPA DELLA REGINA — Full Commerce Page Live
- Escalated from holding page to full editorial commerce page.
- USD pricing: $12,000 CAD × 0.75 = $9,000 USD (luxury rounding to nearest
  $500). Surfaced in hero, footer ACQUIRE block, and shop catalog (was
  `COMING SOON`).
- Rose-silk hero preserved (portrait + dual-language Italian/English copy)
  with inline ACQUIRE button + price + lead time.
- 4-block editorial section: COMPOSITION · STRUCTURE · CRAFT · FINAL WORD
  (Cormorant italic on faint rose radial wash).
- 7-frame DARK BURGUNDY archive grid with 4:5 cells, gold-rose hairline
  borders that intensify on hover. Slots: HERO · ARCHIVE OBJECT ·
  LIFESTYLE · REFLECTION · FRAME · DETAIL · PROFILE.
- Wired into shared `CinematicLightbox` with archiveLabel
  `"LA SCARPA · ARCHIVE"`. Portrait + pendant render also click to open
  lightbox.
- 6-row SPECIFICATIONS block (18K Rose Gold, hand-set diamond field
  0.85ct, ~15.5g gold, mirror-polished, made-to-order, 4–6 weeks lead).
- ACQUISITION footer: BEGIN COMMISSION CTA, USD price, lead-time line.
- Burgundy signature closer with Italian + English wording.
- ADD TO CART payload verified: `unit_amount_cents: 900000`, tierKey
  `18k-rose`, productKey `la-scarpa-della-regina`.
- **PENDING**: 8th gallery slot `ON BODY` — image not yet supplied;
  current build ships 7 frames (HERO portrait already covers worn shot).

### 2026-02 — HOMAGE SERIES: BAPE™ Placeholder
- New route `/homage/bape` with full-screen bright luxury environment.
- `BapePage.jsx` — radial white→champagne gradient, soft particle drift,
  stone-glow accents (red/gold/blue), centered ring with subtle breath
  animation, bottom tagline "Not collaboration. *Recognition.*"
- `BapeShopCard.jsx` — bespoke catalog card that intentionally breaks
  the dark PHILEON system. Glossy acrylic feel, reflective base, drop
  shadow lift on hover, stone-glow pulse, "RECOGNITION." fades in
  beneath title on hover.
- Wired into `CORE_PRODUCTS` with `customCard: 'bape'` flag; intercepted
  in both ring-grid and standard-grid renderers in `ShopDropPage.jsx`.
- Added to `SHOP_COLLECTION_MAP` as 'collective'.

### 2026-02 — BAPE™ Goes Live — Commerce Wiring
- Three-tier variant selector (10K / 14K / 18K Yellow Gold) with sublabels
  FOUNDATION · SIGNATURE · HEIRLOOM. Default selection: 14K Yellow Gold.
- USD pricing derived from CAD × 0.75 and rounded to nearest $500:
  $9,500 / $12,500 / $17,000.
- Frosted-glass variant cards with gold MOST POPULAR / COLLECTOR pills.
  Selected state: gold border, +translateY, soft shadow.
- ADD TO CART writes BAPE + selected metal + cents to `phileon_cart`.
  Verified payload: `unit_amount_cents: 1700000` for 18K.
- 7-row SPECIFICATIONS block beneath: stone count 217, Custom pavé signet
  construction, multi-stone material list, polish, made-to-order
  production, 4–6 weeks lead time, complimentary worldwide shipping.
- Shop card transitioned: COMING SOON pill → FROM $9,500. Catalog
  `price_range: 'From $9,500 USD'`.

### 2026-02 — BAPE™ Detail Archive Gallery + Lightbox Reuse
- Added 5 authentic BAPE photos (front, three-quarter, side enamel macro,
  top view, stone-field macro) to `/homage/bape`. Combined with the original
  spotlight hero render → 6-frame DETAIL ARCHIVE.
- Editorial pivot: bright luxury hero → dark archive room ("private viewing"
  contrast). 3-col desktop / 2-col tablet / 1-col mobile grid with subtle
  gold hairline borders that intensify on hover.
- Renamed `pages/laMadonna/Lightbox.jsx` → `components/CinematicLightbox.jsx`
  (shared component). Added `archiveLabel` prop (default `"ARCHIVE"`).
- LA MADONNA passes `"LA MADONNA · ARCHIVE"`, BAPE passes
  `"BAPE · TRIBUTE SERIES"`.

### 2026-02 — TRIBUTE SERIES Label Rename
- Renamed all visible "HOMAGE SERIES" copy → "TRIBUTE SERIES" across
  BapePage eyebrow + collection label, BapeShopCard series, and shop
  metadata. Route URL `/homage/bape` kept stable (path identifier).

### 2026-02 — LA MADONNA Lightbox — Archive Tick Indicator
- Added 10-tick micro index above thumbnail strip, centered, 8px gap.
- Inactive ticks: 10px × 1px, rgba(212,175,55,0.45) @ 0.22 opacity.
- Active tick: expands to 26px, rgba(245,214,142,0.95) @ opacity 1.
- Transitions 200ms ease on width / opacity / background.
- Clickable navigation; aria-label="View image N"; respects portrait-focus
  dim and reduced-motion.

### 2026-02 — LA MADONNA Cinematic Lightbox
- Built dedicated viewing-room lightbox at `/app/frontend/src/pages/laMadonna/Lightbox.jsx`.
- Framer Motion crossfades (0.45s, cubic-bezier(0.22,1,0.36,1)), 0.98 → 1
  scale, no bounce.
- Full black backdrop, image contain-fit at 88vh × 82vw desktop / 72vh mobile.
- Custom gold SVG arrow cursors on left/right click zones.
- ESC closes, ←/→ navigates with wrap, swipe (>48px) on mobile, click backdrop
  closes, body scroll locked.
- Top chrome: "LA MADONNA · ARCHIVE" eyebrow + close pill. Bottom chrome:
  slot label + counter "01 / 10" with tabular-nums.
- Bottom thumbnail strip — center-justified desktop, horizontal-scroll
  snap-x on mobile.
- When slot 09 or 10 is active, all UI chrome dims to opacity 0.45
  (full opacity on hover) so portraits dominate the frame.
- Preloads neighbour images for instant crossfades.
- Reduced-motion respected.

### 2026-02 — LA MADONNA Gallery → 10 Shots
- Added editorial portrait (gold-bokeh, raised wrist) as slot 09; pushed
  full-body campaign to slot 10. Grid: 5×2 desktop / 2×5 mobile.

### 2026-02 — LA MADONNA Gallery Expansion (5 → 9 Shots)
- Added 4 new authentic worn/editorial shots: collarbone (HUMAN ENTRY),
  worn-hand against void (ARCHITECTURE), hip context with sheer bodysuit
  (CONTEXT), full editorial portrait (CAMPAIGN).
- Re-sequenced gallery in proper luxury editorial flow: object hero → human
  entry → worn architecture → craft macros → overhead architecture →
  lifestyle → campaign closer.
- Switched thumb `object-fit` from `contain` → `cover` so portrait shots
  show meaningful crops instead of letterboxed bars.
- Forced `loading="eager"` on thumbs (only 9, painting reliably below the
  fold matters more than tiny lazy-load wins).
- Grid retuned: 5-col desktop (5 + 4 wrap), 3-col mobile.

### 2026-02 — LA MADONNA Asset Routing Per Spec
- Product page hero → `/images/la-madonna-hero-monument.png` (no-hand monument).
- Ladies > Bracelets/Cuffs catalog card → `/images/la-madonna-hand-category.png`.
- Homepage cinematic strip → 2-slide collective sequence: hand first
  ("She took the corset off…"), monument second ("Stripped to gold.").

### 2026-02 — LA MADONNA Full Editorial Page Live
- Replaced AI-generated 6-image gallery with 5 authentic user photos
  (`la-madonna-01-front.png` … `la-madonna-05-bust-detail.png`).
- Gallery grid switched from `repeat(6,1fr)` → `repeat(5,1fr)` (desktop + mobile).
- ShopDropPage entry: `price_range: '$28,500 USD'`, `inventory_count: 100`,
  removed `'COMING SOON'` flag.
- Added `'la-madonna': 'editorial'` to `SHOP_COLLECTION_MAP` so the card now
  renders inside the EDITORIAL group on `/shop` (was being silently dropped
  from grouped view). Same fix applied to `'midweek': 'editorial'` and
  `'the-carapace': 'signature'` which were also missing from the map.
- Verified end-to-end: hero loads, all 5 thumbs decode, ACQUIRE button adds
  to cart at $28,500 USD, sitewide `COMING SOON` reference is gone.

### 2026-02 — CARAPACE Pavé Variant Wiring + Oval-Shield Image Regen
- Confirmed all 4 variants render and update price on click:
  Vermeil $350 / Vermeil Pavé $600 / 10K Gold $1,100 (default) / 10K Pavé $1,450.
- Cleaned variant labels: "Vermeil Pavé (Cubic)" → "Vermeil Pavé",
  "10K Pavé (Lab Grown)" → "10K Pavé". Cubic / lab-grown context preserved
  in the description sub-line.
- Selector relabelled SELECT METAL → SELECT FINISH per spec.
- Cart payload sends clean variant name + USD price (verified via localStorage:
  `name: "The Carapace — 10K Pavé", unit_amount_cents: 145000`).
- Added `imageSet: "base" | "pave"` flag on each variant.
- Added `paveGallery: null` field with TODO; gallery falls back to base set
  until pavé assets are produced.
- Wired `07_top_real.png` (slot 2) and `08_on_hand_real.png` (slot 5) — the
  authentic user photos — into the Carapace gallery (previous agent uploaded
  files but never updated `products.js`).
- Regenerated 2 of 3 oval-shield angles via Nano Banana with both authentic
  photos as paired references and a hard pass criterion: "ELONGATED OVAL
  SHIELD". Both passed visual analyzer verdict (`PASS`).
  - `09_hero_oval.png` → slot 1 + 92vh hero poster + shop card imageUrl
  - `10_side_oval.png` → slot 3
  - **PENDING**: `11_macro_oval.png` (slot 4) — failed on Universal Key budget
    cap; user must top up Profile → Universal Key → Add Balance, then re-run
    `python /app/backend/scripts/regen_carapace_oval.py`.
  - Slot 4 still serves the legacy `04_macro.png`; rest of the set is oval-locked.

---

## Roadmap

### P2
- **Vault Exclusive Drops** (`/vault/drews-world`): build out fixed-price exclusive drop env.
- Re-run `regen_carapace_oval.py` for the missing macro shot once LLM key budget allows.
- Produce `/carapace-pave/` 5-shot set (CZ + lab-grown diamond variants).

### P3
- Port `.gd-section` / `.gd-reveal` luxury motion system to **NERVATURA** & **COURONNE**.
- Refactor `products.js` (~2.4k lines) into per-product modules.
- Build out **Chains** category (`/shop?category=chains`) once product photos are provided.
- Address dormant `backend/routes/cart.py` lint errors when the backend cart router is re-enabled.

---

## Tech Stack & Critical Locks
- React 19 + Vite-style CRA frontend, FastAPI + MongoDB backend, Stripe (USD).
- USD currency lock: never display CAD or surface a currency switcher.
- `cadToUsdLuxury` rounding: <$2000 → nearest $50, ≥$2000 → nearest $500.
- Carapace strict image control: only the user can authorise new angles.
- Video looping rule: every hero `<video>` needs `onEnded` + `useEffect` watcher
  on `timeupdate`/`ended`/`pause` (Playwright headless can't decode H.264 — that's
  a tooling issue, not a real-browser bug).

## Integrations
- Stripe (USD) — user-provided key.
- Nano Banana via Emergent Universal LLM Key (`emergentintegrations`,
  model `gemini-3.1-flash-image-preview`).
