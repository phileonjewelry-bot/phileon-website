# PHILEON — Luxury Jewelry E-Commerce

## Live Pricing System — PRODUCTION READY
Formula: `DISPLAY PRICE = LOCKED UPLOAD PRICE + (CURRENT METAL VALUE - LOCKED METAL REFERENCE)`

### Architecture
- Backend: `GET /api/market-prices`, `POST /api/validate-cart`
- Server engine: `/app/backend/pricing_engine.py`
- Frontend: livePricingConfig.js → MarketPricingContext → useLivePrice hooks
- All surfaces wired

## UX Polish — COMPLETED (April 19, 2026)

### Mobile Swipe Audit
- Thumbnail strips: `overflow-x-auto` + `scrollbar-hide` on COOGI I, Lady Bamburgh, Bamburgh, La Bete, Blessed
- PhileonCarousel: `snap-x snap-mandatory` with `min-w-[70%] md:min-w-[30%]`
- ProductGallery (Embla): drag/swipe with dot indicators
- No vertical scroll conflicts detected

### Video Poster Frames — FIXED
- 25 of 27 videos now have poster images (remaining 2 are user-initiated modals)
- Fixed: HomePage (2), CypherPage, ApexPage (2), HomagePage, MorsoPage, FormeCuffPage, AlejandraHeelsPage, ProductDetail
- All autoplay videos have: `autoPlay muted loop playsInline poster={imageUrl}`

### Bug Fix
- BoundPage: `tierKey` → `key` variable name fix in tier price rendering

## Vault — /vault/drews-world — REVERTED TO PLACEHOLDER (Feb 2026)
- User decided cinematic video belongs on **Lady Bamburgh hero**, not the Vault
- `VaultPage.jsx` restored to the "Coming Soon" placeholder state
- Lady Bamburgh hero `<img>` replaced with `<video>` (user-provided cinematic mp4 + poster fallback) in `LadyBamburghPage.jsx`
- Existing editorial overlay preserved (PHILEON eyebrow, serif title, tagline, "Enter Bamburgh →" CTA)

## PRISE DE COURONNE — Editorial Copy Added (Feb 2026)
- Added 4 editorial sections to `/app/frontend/src/pages/CouronnePage.jsx` below the purchase block: **COMPOSITION** (bulleted material spec), **DETAIL** (3 italic prose blocks), **CRAFT** (2 italic prose blocks), **FINAL WORD** (replaces previous closing tagline).
- ⚠️ **Copy vs tier conflict**: editorial COMPOSITION says "10K gold, blackened finish" as THE material, but purchase tiers are 10K/14K/18K **white gold**. Pending user clarification (see Backlog).
- Page route: `/products/prise-de-couronne`

## Size Guide Modal — REDESIGNED (Feb 2026)
- `/app/frontend/src/components/SizeGuideModal.jsx` rewritten to a clean 2-step visual layout:
  - PHILEON label + "RING SIZE GUIDE" serif title
  - STEP 1 (wrap paper around finger) with image
  - STEP 2 (measure in mm) with image
  - Size ranges block (Ladies / Gents / Custom) on a subtle divider
  - Notes footer
- Both step images currently use a single user-provided reference photo (hand + paper strip + ruler) via `SIZE_PHOTO` constant. TODO: swap in dedicated `ring-size-wrap.jpg` and `ring-size-measure.jpg` when provided.
- Modal behavior preserved: centered desktop / bottom sheet mobile, click-outside + Escape close, scroll lock.
- `/size-guide` standalone page reuses `SizeGuideContent` so both surfaces stay in sync.
- Wired (no changes needed) on: LadyBamburghPage, CorinthiansPage, CocktailJessicaPage, CouronnePage.

## THE DON GORGON — HOME Set Re-Generated with WHITE GOLD Material Lock (Feb 2026)
- First generation pass produced yellow-gold channels (model copied the reference's yellow metal despite prompt override).
- Root cause: Nano Banana heavily weights the reference image's actual colors over text instructions.
- Fix: `generate_don_gorgon_home.py` now pre-processes the reference via PIL — fully desaturates it and pulls the red channel down 5% before base64-encoding. This way the model sees a cool, colourless reference and follows the prompt for material.
- Prompt also updated with explicit "CRITICAL MATERIAL OVERRIDE — ignore the reference's metal, output is WHITE GOLD / PLATINUM ONLY" language on every shot.
- All 10 shots regenerated and wired into HOME gallery (added 08_on_finger_macro to slot 5). Automated color analysis confirmed WHITE_GOLD on 01_hero, 05_macro_ruby, 07_on_finger_hero, and 09_box_moment.
- Rule codified: when generating product image sets from a reference with "wrong" material, pre-desaturate the reference so text prompt can override material perception.

## THE DON GORGON — Full HOME Image Set Generated via Nano Banana (Feb 2026)
- Built `/app/backend/scripts/generate_don_gorgon_home.py` — generator that takes the reference HOME artifact, locks product identity via prompt, and generates the 10-shot luxury campaign set using `gemini-3.1-flash-image-preview` with `EMERGENT_LLM_KEY`.
- **9 of 10 shots generated** and saved to `/app/frontend/public/don-gorgon/home/` (01–07, 09, 10). Shot 08 (`08_on_finger_macro`) failed mid-run because the Emergent Universal Key balance was exceeded (cap ≈ $2.00, final cost ≈ $2.02).
- HOME gallery in `products.js` rewired to a 9-slot editorial rhythm: 3/4 HERO → clean front → low-architectural → on-finger → macro ruby → macro pavé → box moment → carousel → top-down. HOME↔AWAY slot-0 crossfade remains twinned (both 3/4 cream-cushion shots).
- Script is re-runnable (skips existing files) — once the user tops up the Universal Key, running `python -m scripts.generate_don_gorgon_home` from `/app/backend` will fill in shot 08.

## THE DON GORGON — AWAY Gallery 7-Slot Rhythm (Feb 2026)
- Default variant switched to **AWAY** (`products.js` → `theDonGorgon.defaultSelection.variant = "away"`). Page now opens on the white pavé state.
- Wired user-provided 5 new AWAY images + kept the original = **6-slot AWAY gallery** (rhythm: macro ruby rail → centered dome → 3/4 editorial → box closeup → macro front → studio). HOME still uses fallback (1 photo + "coming soon" helper).
- Hero poster swapped to the new editorial AWAY macro (`5q24m209_1000148728.png`) — still waiting on `/videos/the-don-gorgon.mp4`.
- **Pricing matrix confirmed**: current implementation (base tier + $300 HOME adjustment) evaluates identically to user's explicit table (AWAY silver $2,800 / HOME $3,100; AWAY gold F/S/H $6,800 / $9,200 / $14,500; HOME gold F/S/H $7,100 / $9,500 / $14,800). Verified live: AWAY gold foundation = $6,800, HOME = $7,100.
- Crossfade hardened earlier in session (inline `transition: opacity 450ms ease-out` on all 4 layers — hero HOME/AWAY + gallery slot-0 HOME/AWAY).

## THE DON GORGON — Crossfade Hardened (Feb 2026)
- `DonGorgonPage.jsx` HOME↔AWAY variant crossfade uses inline `style={{ transition: "opacity 450ms ease-out" }}` on both hero layers AND gallery slot-0 layers (and subsequent gallery images).
- Replaced Tailwind `duration-[450ms]` arbitrary classes (were computing to 0.15s due to JIT cache) with inline style — all four image layers now verified at `opacity 0.45s ease-out`.
- Rule codified: for luxury crossfades use inline style, never Tailwind arbitrary timing classes.
- Asset status: page still uses the 2 uploaded images (1 HOME + 1 AWAY) as fallbacks. Pending user uploads: 6 more variant images + hero video (`/videos/the-don-gorgon.mp4`).

## Backlog
- P1: Real tier prices for PRISE DE COURONNE (currently placeholders: $11,400 / $14,800 / $18,800). Must update `products.js`, `livePricingConfig.js`, `pricing_engine.py`, `CouronnePage.jsx`.
- P2: Upload dedicated Step 1 ("wrap") image for the Size Guide Modal.
- P2: Vault Exclusive Drops (/vault/drews-world) fixed-price drop environment.
- P3: Build out Chains category (currently routes to Coming Soon).
- P3: Additional Vault drops as user supplies artifacts
- P3: Additional gallery images for newer products
- P3: Cross-sell/hover images for shop grid (match CYPHER hover behavior)
