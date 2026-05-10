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
