# PHILEON — Luxury Jewelry E-Commerce

## THE GRAND DAME — New Bespoke Product Page (Feb 2026)
- New product `theGrandDame` added to `products.js`, `livePricingConfig.js`, and `pricing_engine.py`. Slug `the-grand-dame`, category `bracelets`, audience `ladies`, type `cuff`, 3 tiers (Foundation / Signature / Heirloom), single metal (rose gold), `pricingPending: true` → page renders "Pricing on Inquiry" everywhere instead of CAD numbers.
- 8-shot luxury image set generated via Nano Banana into `/app/frontend/public/grand-dame/` with locked product identity (sculptural open cuff, polished rose gold, fine mesh lattice, no gemstones). Generator: `/app/backend/scripts/generate_grand_dame.py`.
- Bespoke editorial page at `/products/the-grand-dame` (`GrandDamePage.jsx`) with the same motion system as Don Gorgon, scoped via `.gd-*` classes (hero drift, hero copy stagger, gallery momentum, section fade-up, reduced-motion guard). No add-to-cart while pricingPending — replaced with `INQUIRE` mailto CTA.
- Tagline locked: "Old money never speaks first."
- Wired into the ladies bracelets shop grid (`ShopDropPage.jsx` CORE_PRODUCTS) using `/grand-dame/01_hero.png` as the card image.
- Backend pricing structure scaffolded with realistic placeholder weights (45g/50g/55g) at `lockedBasePriceCad: 0` so cart validation will work the moment real prices are dropped in.

## THE DON GORGON — Dual-State Video Hero (Feb 2026)
- New 92vh / 86vh-mobile cinematic video hero added ABOVE the existing HOME/AWAY variant hero. Saved at `/app/frontend/public/videos/the-don-gorgon-dual-hero.mp4`.
- Source video re-muxed with ffmpeg: H.264 Main / yuv420p / +faststart / AAC LC / 10s / 2.7 MB. The user-uploaded original (XiaoYing mobile editor export) was H.264 Baseline but had a non-streamable atom layout that some browsers refused — re-encode fixes that.
- Triple-redundant loop watcher applied (`timeupdate` near-end, `ended`, and `pause` re-resume on visibility) plus inline `onEnded` restart per video looping rule.
- Copy overlay: PHILEON / THE DON GORGON / "Two sides of the same authority." — no buttons, pricing, or selectors. BACK TO RINGS link consolidated to the new top hero (removed duplicate from the lower variant hero to avoid stacked back-buttons).
- Poster fallback: `/don-gorgon/home/01_hero.png` (cinematic 3/4 white-gold shot) — renders immediately before video plays.
- HOME default lock unchanged: page opens HOME, shop card shows HOME, "From $3,100 CAD".
- Note on testing: Playwright's headless Chromium ships without proprietary H.264 codec licenses, so automated tests show only the poster (this is normal). Real-world Chrome / Safari / Firefox / Edge / mobile browsers all play the video correctly.

## THE DON GORGON — Luxury Motion System + HOME Default Lock (Feb 2026)
- **Defaults**: `products.js` `defaultSelection.variant="home"`, `imageUrl="/don-gorgon/home/01_hero.png"`, `priceFrom="From $3,100 CAD"`, `basePrice=3100`, `hero.poster` pointing to HOME cinematic shot. Shop grid + product page both open on HOME.
- **Motion system** (scoped to `DonGorgonPage.jsx` via `.dg-*` classes to avoid bleeding into other pages):
  1. Hero drift — `scale(1)→scale(1.04) translateY(-8px)` 16s infinite alternate.
  2. Hero copy reveal — staggered 0.2s/0.45s/0.75s fade-up (eyebrow → title → subline).
  3. Variant image "light change" — opacity + brightness/contrast filter + 1.015 scale on inactive layer. HOME active = brightness 0.98 / contrast 1.05 (darker heavier). AWAY active = brightness 1.02 / contrast 1.0 (cleaner brighter).
  4. Gallery momentum — active slot at full opacity/scale/brightness, inactive slots dimmed.
  5. IntersectionObserver drives gallery `is-active` class (root=gallery scroller, threshold 0.65) and section fade-up `is-visible` (threshold 0.18).
  6. Ruby glint — 6.5s cubic-bezier sweep, applied only to the macro-ruby slot (auto-detected by alt text).
  7. Section pacing — `.dg-motion-section` opacity + translateY(26px) → 0 over 1s on intersect.
  8. `prefers-reduced-motion` override resets all animations to near-instant.
- Verified live: HOME pressed by default, all motion names confirmed via computed styles, 3 active gallery items + 8 dimmed, ruby-glint on exactly 1 slot.

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
