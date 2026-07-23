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
- **PHILEON Tribute Series** (Mens → Rings · Collective)
  - 2026-07-19 — **NEIGHBORHOOD NIP** (Tribute Series · Rings) · 14K White Gold Sapphire and Diamond Tribute Ring · Tagline: *Built for the long run.* · Made to Order · Sold as one ring · **APPROVED FINAL STATE (post-ADD-TO-CART-fix)**
    - **ADD TO CART repair (2026-07-19 — corrective release, only file changed: `NeighborhoodNipPage.jsx`)**:
      - **Root cause**: button was rendered with `disabled={addDisabled}` where `addDisabled` combined `isAdding || !selectedSize || (patchType === "custom" && (!customValid || patternIncomplete))`. When a customer had no size selected or held a temporarily invalid custom pattern, the button was HTML-disabled, so taps produced no handler run and therefore no validation toast — appearing to users as a broken button.
      - **Fix**:
        - Button HTML now uses `disabled={isAdding}` **only**. It remains clickable during all normal validation states.
        - `addDisabled` compound was removed. Validation lives **inside** the `onAddToCart` handler and shows the appropriate `toast.error(...)` on each failure branch.
        - `type="button"` preserved on the CTA. Early-return `if (isAdding) return;` guard prevents duplicate submissions.
        - `selectedSize` normalized to a string before validation and payload construction (handles a selector returning either a primitive or `{ value }` object).
        - `finalPriceUsd = basePriceUsd + (isCustom ? customFeeUsd : 0)` — one numeric value, guarded via `Number.isFinite(finalPriceUsd) && finalPriceUsd > 0` before dispatch.
        - Pattern kept as canonical 12-cell array during editing/validation. Serialized only at cart-payload build (`WBW/BWB/WBW/BWB`). Length check runs on the array, never on the slashed string.
        - `handlePatchTypeChange("original")` restores `VICTORY_PATTERN` into `customGrid` and clears `gridHistory`, so a subsequent Custom toggle always starts from a valid 6+6 arrangement and the base price returns to `$15,000 USD`.
        - Cart payload uses spec-defined field names: `id`, `sku`, `name`, `edition`, `metal`, `ringSize`, `ringSizeLabel`, `patchType`, `patchPattern`, `whiteDiamondCount`, `blackDiamondCount`, `customFeeUsd`, numeric `price`, `currency: "USD"`, `soldAs: "ring"`, `quantity: 1`. Formatted price strings used only for rendering.
      - **End-to-end verified — all five required tests pass on desktop AND mobile (360 / 390 / 430 px)**:
        1. Original + no size → toast `"Please select a ring size."` · nothing enters cart
        2. Original + US 10 → cart drawer opens · `$15,000 USD` · `Ring Size: US 10` · `Victory Patch: Original` · Subtotal `$15,000 USD`
        3. Valid Custom + US 10 → `$15,750 USD` · `Victory Patch: Custom` · `Pattern: WWB/BWB/BWB/BWW` · Subtotal `$15,750 USD`
        4. Invalid Custom (7W / 5B) → toast `"Use exactly 6 white diamonds and 6 black diamonds."` · nothing enters cart · button stays clickable
        5. Custom → break pattern → back to Original → price returns to `$15,000 USD` · Original add succeeds · switching back to Custom restores 6/6 counts
      - **Scope**: only `/app/frontend/src/pages/NeighborhoodNipPage.jsx` was modified for this repair. Global cart logic, shared `RingSizeSelector`, checkout behaviour, product pricing, gallery, editorial sections, homepage placements, shop placements, REBELLE, ARCHITRAVE, DRIVEN, Inspiration Vault, and all unrelated products and routes untouched.
    - **Single edition** — no alternate metals, no alternate colourways:
      - **14K White Gold · Princess-Cut Blue Sapphires · Black and White Diamonds**
      - Internal `basePriceCAD: 19950` → public **$15,000 USD** (Original patch) via shared `cadToUsdLuxury()`
      - Custom patch upcharge: internal `CUSTOM_FEE_CAD: 1000` → public **+$750 USD** → **$15,750 USD** total (Custom patch), both converted separately via `cadToUsdLuxury()` (no second conversion function; no per-stone surcharge)
    - **Universal specifications** (only approved values displayed):
      - **200 Stones** total · Approximately **18 g** metal weight · **15 mm** band width · **3 mm** band thickness
      - Central Detail (dynamic): *Victory Lap Flag and "N" Tribute Motif* (Original) / *Custom 12-Stone Black-and-White Diamond Patch* (Custom)
      - Wide Cushion-Square Statement · Architectural Mosaic Grid setting · Reference size **US 10** (not preselected)
      - Sizes: US 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13 — all sizes at the same public price
    - **Approved page order (post-fix, verified live)**:
      1. Product information (title, subtitle, hero, tagline)
      2. Ring-size selector (shared `RingSizeSelector`, `bandWidthMm={15}`, no preselect)
      3. Ring Size Guide CTA (`/ring-size-guide`, rendered by shared selector)
      4. Wide-band sizing instructions block (custom RING SIZING copy)
      5. MAKE YOUR MARK — customization heading + copy
      6. Original / Custom selector (two-choice)
      7. Live patch preview (sapphire-framed, white-gold border, preview note)
      8. Custom editor (revealed only when Custom selected)
      9. Live counters + Reset / Invert Colours / Undo Last controls
      10. Final configuration summary (compact patch summary inside purchase block with EDIT PATCH link)
      11. Final dynamic price (`$15,000 USD` Original / `$15,750 USD` Custom)
      12. ADD TO CART (exactly one primary CTA)
      13. Gallery (8 photographs)
      14. Remaining editorial sections (THE BLOCK BECAME THE BLUEPRINT · THE BLUE MEANS EVERYTHING · THE VICTORY LAP · THE BUILD · Independent Tribute Notice · closing quote)
    - **Customization — MAKE YOUR MARK**:
      - Two-choice selector: **Original Victory Patch** (default · no charge) / **Custom Patch** (+$750 USD)
      - Interactive **3 columns × 4 rows** editor · exactly **6 white + 6 black** diamonds enforced · live counters · Reset / Invert Colours / Undo Last controls · keyboard-accessible cells (Enter/Space toggle) · W/B markers inside cells · `aria-pressed` + descriptive `aria-label`
      - Live sapphire-framed patch preview (5×5 sapphire field + white-gold border) with note: *Digital preview represents stone placement only. Final colour, brilliance, and hand-setting may vary slightly.*
      - Serialization: `WBW/BWB/WBW/BWB` (row-by-row, `/` between rows) — captured as line-item metadata alongside `patchType`, `whiteDiamondCount`, `blackDiamondCount`, `customFeeUsd`
      - Original approved pattern: `WWB/BWB/BWB/BWW`
      - ADD TO CART reachable at all times — validation runs inside the click handler and shows a toast on failure (never HTML-disabled on validation state)
      - Compact patch summary inside purchase block (Victory Patch label + fee + EDIT PATCH link that scrolls to `#make-your-mark`) — grid editor NOT duplicated in purchase block
    - **Media**:
      - **Hero**: static uncropped `hero-front.png` on Deep Sapphire panel (`#071B46`); `object-fit: contain`; no text overlay; **0 videos**
      - **Gallery**: **8 photographs · 0 videos · 0 captions / overlays** · natural aspect ratios via `object-fit: contain` · order: hand-on-book portrait, 4-panel angles composite, front, tight front, motif macro, side macro, motif extreme macro, three-quarter
    - **Palette (strict — no gold, red, orange)**: Midnight Asphalt `#03060C` · Deep Sapphire `#071B46` · Victory Blue `#123E8A` · Electric Sapphire `#2D63C8`
    - **Commerce surfaces (consistent $15,000 USD baseline)**:
      - Shop → Mens > Rings (`/shop?audience=gentlemens-club&category=rings`)
      - Shop → Collective (`/shop?collection=collective`, added to `SHOP_COLLECTION_MAP`)
      - Homepage → **THE COLLECTIVE** (first tile; `TRIBUTE SERIES` eyebrow retained; grid expanded to `md:grid-cols-2 lg:grid-cols-4`)
      - Homepage → cinematic image strip (first slot)
      - Standalone `/tribute-series` index page
    - **Cart line item**: `NEIGHBORHOOD NIP — 14K White Gold · US {size}` · `Blue Sapphires · Black and White Diamonds · Ring Size: US {size} · Victory Patch: {Original|Custom}[ · Pattern: {WBW/BWB/WBW/BWB}]` · price = `$15,000 USD` (Original) / `$15,750 USD` (Custom) · size-specific SKU pattern: `neighborhood-nip-14k-white-size-{n}` (custom patch attaches as line-item metadata — no duplicate SKUs). Line-item `id` differentiates Original vs Custom at same size so both can coexist in one cart.
    - **Ring-sizing guidance**: shared `RingSizeSelector` with `bandWidthMm={15}` + built-in Ring Size Guide CTA (`/ring-size-guide`) + custom RING SIZING block (wide-band notice, measurement tips, "select larger when between sizes"). No unconfirmed resizing promise.
    - **Routes**: `/tribute-series/neighborhood-nip` + `/neighborhood-nip` (alias) · Index: `/tribute-series`
    - **SEO**: title, meta description, og:title, og:image, og:type=product, twitter:card=summary_large_image, twitter:image all upserted client-side
    - **Language guardrails (verified — 0 forbidden terms)**: no INQUIRE · no mailto · no "price pending" · no "coming soon" · no "Tribute not for sale" · no Nipsey Hussle / Marathon Clothing likeness or logos · no gang imagery / palm trees / graffiti fonts · no sterling / 10K / 18K / yellow / rose gold / CZ / natural or lab-stone claims · no CAD rendered publicly
    - **Files owned by NEIGHBORHOOD NIP**: `/app/frontend/src/pages/NeighborhoodNipPage.jsx` · `/app/frontend/src/pages/TributeSeriesPage.jsx` · `/app/frontend/public/tribute-series/neighborhood-nip/{hero-front.png, front-clean.png, glass-reflection.png, three-quarter-elevated.png, top-border.png, gallery-01-front.png, gallery-02-front-tight.png, gallery-03-motif-macro.png, gallery-04-side-macro.png, gallery-05-motif-extreme-macro.png, gallery-06-three-quarter.png, gallery-07-hand-on-book.jpg, gallery-08-four-panel.jpg}` · route lines in `/app/frontend/src/App.js` · catalog entry in `/app/frontend/src/data/products.js` · card surfaces in `/app/frontend/src/pages/ShopDropPage.jsx` + `/app/frontend/src/pages/HomePage.jsx`
    - **Verified at 360 / 390 / 430 px (post-fix)**: hero image visible uncropped · title `NEIGHBORHOOD NIP` on one line · purchase block, patch summary + EDIT PATCH link, size selector, RING SIZING block, ADD TO CART all fully in view and clickable · CUSTOMIZATION section 3×4 grid + counters + controls + preview all inside viewport with no horizontal overflow · Original add succeeds at $15,000 · Custom add succeeds at $15,750 · gallery cells natural aspect ratios
    - **Untouched**: REBELLE · ARCHITRAVE · DRIVEN · ORIEL · MONACO · CAGED WINGS · NOVA · PARABOLA · PARABOLA HERITAGE · PARABOLA ATELIER · Inspiration Vault · Ladies First · shared `RingSizeSelector` · shared Ring Size Guide route/behaviour · `cadToUsdLuxury` function · global cart logic · unrelated checkout behaviour · unrelated pricing · unrelated routes
    - **Frozen**: no further NEIGHBORHOOD NIP changes unless explicitly requested by user. Share Your Design suggestion explicitly declined.
- **PHILEON Fine Jewelry** (Ladies First → Earrings)
  - 2026-07-19 — **REBELLE** (Ladies First · Earrings) · Black Pavé Helix Stiletto Earrings · Tagline: *Elegance was never meant to behave.* · Made to Order · Sold as one pair · **APPROVED FINAL STATE**
    - **Three purchasable editions** (internal CAD → public USD via shared `cadToUsdLuxury()`; CAD never rendered):
      - **Sterling Silver · Black Cubic Zirconia — $3,500 USD** ← **default selected edition**
      - 10K White Gold · Lab-Grown Black Diamonds — **$8,500 USD**
      - 14K White Gold · Lab-Grown Black Diamonds — **$9,500 USD**
      - All editions finished in **Black Enamel** (final approved language — NOT Black Rhodium)
      - SKUs: `rebelle-silver-black-cz` · `rebelle-10k-white-black-lab` · `rebelle-14k-white-black-lab`
    - **Universal specifications** (only approved values displayed):
      - **264 Stones Per Pair** (only approved stone count — no other figures)
      - **65 mm** Overall Drop · **15 mm** Circular Stud · **18 mm** Maximum Width
      - **Approximately 25 g Per Pair** (only approved weight display — never per-earring)
      - Pavé setting · Concentric Stud · Double Helix · Stiletto Drop
      - Secure Posts with Butterfly Backs · Sold as One Pair · Made to Order
    - **Media**:
      - **Hero**: silent autoplay **video** `/rebelle/hero-film.mp4` (h264 640×368, 15.12 s, 0 audio streams — ffprobe verified) with `/rebelle/hero-poster.jpg` as poster fallback. Video attributes: `muted=true` · `defaultMuted=true` · `autoplay=true` · `loop=true` · `playsInline=true` · `controls=false` · `volume=0` · `disablePictureInPicture=true` · `controlsList="nodownload nofullscreen noremoteplayback"`
      - **Ladies First shop card**: static image only — `/rebelle/shop-card.jpg` — 0 videos
      - **Gallery**: **8 still photographs · 0 videos · 0 captions/overlays · natural aspect ratios via `object-fit: contain`**. Hero image never duplicated in gallery.
    - **Gallery order** (editorial + product intermixed):
      1. Model portrait — both earrings visible (`still-model-02-both.jpg`)
      2. Product angled three-quarter view on gray (`still-product-01-angled.jpg`)
      3. Model close-up — single earring focus, left profile (`still-model-01-close.jpg`)
      4. Existing side plinth study — butterfly backs (`still-01-side.jpg`)
      5. Model right-profile portrait (`still-model-03-profile.jpg`)
      6. Product straight-on pair on gray (`still-product-02-straight.jpg`)
      7. Existing stiletto macro — dark reflective (`still-02-stiletto-macro.jpg`)
      8. Existing alternate side profile (`still-03-side-alt.jpg`)
    - **Purchase behavior**: Sterling Silver selected on load · default ADD TO CART lands `REBELLE — Sterling Silver` · default cart price + subtotal = `$3,500 USD` · 10K and 14K unchanged · public storefront USD only (no CAD rendered) · existing PHILEON cart & checkout unchanged.
    - **Routes**: `/rebelle` + `/products/rebelle`
    - **SEO**: title, meta description, og:title, og:image, og:type=product, twitter:card=summary_large_image, twitter:image all upserted client-side.
    - **Language guardrails (verified — 0 forbidden terms in body copy)**: Preserve *Black Enamel*. NOT Black Rhodium. No 18K edition · no yellow-gold · no rose-gold · no INQUIRE · no price-on-request · no "12.5 g per earring" · no "Facet Flow" · no 276/347/500 stone counts · no CAD / basePriceCAD / $4,950 / $11,250 / $12,350.
    - **Files owned by REBELLE**: `/app/frontend/src/pages/RebellePage.jsx` · `/app/frontend/public/rebelle/{hero-film.mp4, hero-poster.jpg, shop-card.jpg, still-01-side.jpg, still-02-stiletto-macro.jpg, still-03-side-alt.jpg, still-model-01-close.jpg, still-model-02-both.jpg, still-model-03-profile.jpg, still-product-01-angled.jpg, still-product-02-straight.jpg}` · route lines in `/app/frontend/src/App.js` · catalog entry in `/app/frontend/src/data/products.js`.
    - **Frozen**: no further REBELLE changes unless explicitly requested by user.
    - **Untouched**: ARCHITRAVE · MONIKA COUTURE · DRIVEN · NOVA · CAGED WINGS · MONACO · ORIEL · PARABOLA ATELIER · Inspiration Vault · homepage · existing routes · global cart logic · checkout · unrelated products and pricing.
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
  - 2026-07-18 — **DRIVEN gallery + REBELLE finish-copy corrections** (COMPLETE)
    - **DRIVEN** — added a 6th gallery item: `still-05-open-cuff.jpg` (open-cuff top-down study on soft neutral surface showing both terminals in a single continuous line — pointed pavé tip meeting circular nail-head across three parallel black pavé bands). Gallery now has **5 photographs + 1 silent film = 6 cells**. Hero video, Vault index card, pricing, routes, cart, other Vault products unchanged.
    - **REBELLE** — replaced `Black Rhodium` → `Black Enamel` across all 3 edition materials (Sterling Silver / 10K / 14K), the specifications table Finish row, and the Ladies First shop-card `materialLine` + `tags` in `/app/frontend/src/data/products.js`. Verified 0 occurrences of "Black Rhodium" remain in visible body copy.
    - **Files touched**: `/app/frontend/src/pages/DrivenPage.jsx` (added `STILL_OPEN_CUFF` const + one gallery entry) · `/app/frontend/public/inspiration-vault/driven/still-05-open-cuff.jpg` (new asset) · `/app/frontend/src/pages/RebellePage.jsx` (4 finish-copy swaps) · `/app/frontend/src/data/products.js` (2 finish-copy swaps in REBELLE catalog entry).
    - **Untouched**: DRIVEN hero/video/pricing/routes/cart · REBELLE hero video / hero poster / shop card image / edition prices / SKUs / gallery / SEO / routes · NOVA · CAGED WINGS · MONACO · ORIEL · PARABOLA ATELIER · ARCHITRAVE · Ladies First layout · homepage · cart logic · checkout · ring sizing · unrelated routes.
  - 2026-07-17 — **DRIVEN** ($75 USD) · Inspiration Vault > Bangles & Bracelets · black pavé nail-wrap bracelet · blackened plated base metal · black cubic zirconia · sold as one bracelet
    - **Hero**: silent autoplay **video** (`hero-film.mp4`, h264 720×1280, 11.53 s, 0 audio streams verified via ffprobe) with `hero-poster.jpg` as poster + editorial `VaultHero` image (sculptural neutral hand on black background)
    - **Gallery**: 5 items · **4 photographs + 1 silent autoplay film** · natural aspect ratios · `object-fit: contain` · no captions or overlays · film runs `autoplay muted loop playsInline controls={false} disablePictureInPicture` with `videoRefs` useEffect enforcing autoplay · gallery order: `still-01-front.jpg` → `film-01.mp4` → `still-02-three-quarter.jpg` → `still-03-nailhead-macro.jpg` → `still-04-arch-profile.jpg`
    - **Assets** (`/public/inspiration-vault/driven/`): `hero-poster.jpg` (sculptural hand on black background — canonical hero image) · `still-01-front.jpg` (full front view on white) · `still-02-three-quarter.jpg` (front three-quarter, pointed terminal) · `still-03-nailhead-macro.jpg` (macro nail-head terminal + 3 pavé bands) · `still-04-arch-profile.jpg` (side arch profile, open cuff construction) · `hero-film.mp4` · `film-01.mp4` (both films: h264 720×1280, 0 audio streams confirmed via ffprobe)
    - **Vault index card**: **static image-only** (video_in_card = 0 confirmed); scoped `.driven-vault-card` mobile-safe CSS (`height:auto`, `overflow:visible`, `max-height:none`, `object-fit:contain`, `aspect-ratio:auto`, always-visible CTA at ≤768px via `!important` overrides)
    - **Cart**: ADD TO CART wired through existing PHILEON `CartDrawer` (verified subtotal $75 USD, `DRIVEN — Black Pavé Nail-Wrap Bracelet`, success toast)
    - **Copy restrictions**: blackened plated base metal + black cubic zirconia only — NO sterling / black-gold / white-gold / platinum / solid-gold / natural-diamond / lab-grown-diamond / genuine-diamond / black-diamond claims (verified: zero forbidden terms in user-facing copy)
    - **Routes**: `/driven` + `/inspiration-vault/driven`
    - **SEO**: page title, meta description, og:title, og:image, og:type=product, twitter:card=summary_large_image, twitter:image all upserted client-side
    - **Verified at 360 / 390 / 430 px** (Vault index card): complete hero image visible uncropped · title / subtitle / `$75 USD` / `ARCHIVE PIECE` / `ENTER PIECE →` all visible · CTA works without hover · card grows naturally · zero videos in card · appears under `Bangles & Bracelets` filter
    - **Hero-video audit**: `muted=true`, `defaultMuted=true`, `autoplay=true`, `loop=true`, `playsInline=true`, `controls=false`, `volume=0`, `disablePictureInPicture=true`, `controlsList="nodownload nofullscreen noremoteplayback"`
    - **Deviations from original spec** (all approved by user / driven by asset availability): (1) hero is a video not a static image (per explicit user override "The first video is the hero video"), (2) 4 photos supplied instead of 7 — remaining 2 photographs (pointed-tip macro + bracelet on sculptural wrist) will be added as new gallery items when supplied, without changing hero, video behavior, pricing, copy, or purchase flow, (3) 1 gallery film supplied instead of 2, per user's "the second video goes in the gallery"
    - **No placeholders / duplicates**: unavailable gallery positions intentionally left empty — no photograph or video is duplicated to fill space
    - **Files touched**: `/app/frontend/src/pages/DrivenPage.jsx` (new) · `/app/frontend/src/App.js` (import + 2 route lines) · `/app/frontend/src/pages/InspirationVaultPage.jsx` (manifest entry + className condition + scoped `.driven-vault-card` CSS). NOVA, CAGED WINGS, MONACO, ORIEL, PARABOLA ATELIER, ARCHITRAVE, other Vault products, Ladies First, homepage, existing pricing, cart logic, checkout logic, ring-sizing components, unrelated routes all untouched.
  - 2026-07-15 — **Mobile-card correction · PARABOLA ATELIER Vault index card** (COMPLETE)
    - **Problem**: default `.iv-card-media` (16:10 · `object-fit: cover`) heavily cropped the tall `still-01-topdown.jpg` (natural 864×1536), pushed the two-line title beyond available card height, and the hover-gated `.iv-card-cta` was invisible on touch mobile.
    - **Fix**: added scoped `.parabola-atelier-vault-card` CSS block in `InspirationVaultPage.jsx` — `height:auto`, `overflow:visible`, `max-height:none`, `aspect-ratio:auto`, `object-fit:contain`, natural two-line title (`white-space:normal`, `line-height:0.95`, `margin-bottom:24px`), static `iv-card-cta` always visible on mobile (`@media (max-width:768px)` block with `!important` overrides). Also added `parabola-atelier-vault-card` to the card `className` conditional.
    - **Verified at 360 / 390 / 430 px**: complete concave-cocktail ring visible uncropped at natural 864×1536 aspect · full `PARABOLA ATELIER` two-line title visible · subtitle · `$100 USD` · `ARCHIVE PIECE` · `ENTER PIECE →` all visible and inside the card box · CTA works without hover · `video_in_card = 0` (static image only) · card grows naturally with proper spacing before the next Vault card.
    - **Untouched**: PARABOLA (Fine Jewelry) · PARABOLA HERITAGE · PARABOLA ATELIER product page · shared product videos · other Vault cards (CAGED WINGS, MONACO, ORIEL, NOVA, ECHELLE, ROSELINE, ALTAR, LUCENT, DECO ÉVENTAIL, etc.) · pricing · routes · cart · checkout.
  - 2026-07-15 — **NOVA** ($80 USD) · Inspiration Vault > Earrings · pavé starburst link earrings · bright white plated base metal · clear AAA cubic zirconia · sold as one pair
    - **Hero**: silent autoplay **video** (`hero-film.mp4`, portrait 720×1280, 9.28 s, 0 audio streams verified via ffprobe) with `hero-poster.jpg` as poster + editorial `VaultHero` image (per explicit user override to the original "static hero" spec — "the first one being the hero video")
    - **Gallery**: 5 items (3 photographs + 2 silent autoplay films) · natural aspect ratios · `object-fit: contain` · no captions or overlays · all films `autoplay muted loop playsInline controls={false} disablePictureInPicture` via `videoRefs` useEffect · gallery order: `still-warm.jpg` → `film-01.mp4` → `still-sparkle.jpg` → `film-02.mp4` → `still-detail.jpg`
    - **Assets** (`/public/inspiration-vault/nova/`): `hero-poster.jpg` (clean pair on white stand + red base on marble — canonical hero image) · `still-warm.jpg` (warm boutique bokeh) · `still-sparkle.jpg` (black-satin single-earring sparkle portrait) · `still-detail.jpg` (physical product close-up on reflective surface — extra 4th photograph provided by user beyond original 3-photo spec, placed at gallery tail) · `hero-film.mp4` · `film-01.mp4` · `film-02.mp4` (all 3 films: h264 720×1280, 0 audio streams confirmed)
    - **Vault index card**: static image-only (no video), scoped `.nova-vault-card` mobile-safe CSS (`height:auto`, `object-fit:contain`, always-visible CTA at ≤768px)
    - **Cart**: ADD TO CART wired through existing PHILEON `CartDrawer` (verified subtotal $80 USD, "NOVA — Pavé Starburst Link Earrings", success toast)
    - **Copy restrictions**: bright white plated base metal + clear AAA cubic zirconia only — NO sterling / white-gold / platinum / solid-gold / diamond claims (verified: zero forbidden terms in user-facing copy)
    - **Routes**: `/nova` + `/inspiration-vault/nova`
    - **SEO**: page title, meta description, og:title, og:image, og:type=product, twitter:card=summary_large_image, twitter:image all upserted client-side
    - **Deviations from original spec** (all approved by user): (1) hero is a video not a static image, (2) 3 films instead of 4, (3) 4 photos instead of 3 (4th physical-product close-up included at gallery tail per user default), (4) gallery total 5 items not 6
    - **Files touched**: `/app/frontend/src/pages/NovaPage.jsx` (new) · `/app/frontend/src/App.js` (import + 2 route lines) · `/app/frontend/src/pages/InspirationVaultPage.jsx` (manifest entry + className condition + scoped `.nova-vault-card` CSS). MONACO, ORIEL, CAGED WINGS, ARCHITRAVE, Ladies First, homepage, cart logic, checkout logic all untouched.
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


## STAMPEDE SET — Inspiration Vault (Sets)
- **2026-07-23** — Vault "SETS" category piece: pavé statement ring + matching hinged bangle, $150 USD.
- Product page `/inspiration-vault/stampede-set` — `StampedeSetPage.jsx`. Gallery order (final, user-approved 2026-07-23):
  1. `worn-set.png` — worn set on hand
  2. `bangle-black.jpg` — bangle on black
  3. `bangle-white-pedestal.png` — bangle on white pedestal (**NEW asset added 2026-07-23**)
  4. `ring-black.jpg` — ring on black
- `PAIR_01` / `PAIR_02` slots removed from the gallery (2026-07-23).
- **Vault index card mobile clipping fix (2026-07-23)** — `InspirationVaultPage.jsx` now applies a scoped `.stampede-set-vault-card` class with `height:auto`, `overflow:visible`, `object-fit:contain` on the media, and a mobile-visible (non-hover-gated) `.iv-card-cta`. Title uses `clamp(28px,7.4vw,44px)` at ≤768px so "STAMPEDE SET" never wraps or clips. Verified by `testing_agent_v3_fork` (iteration_11.json — 35/35 assertions passed at 375x800, 768x1024, and 1440x900). No sibling Vault card regressions.
