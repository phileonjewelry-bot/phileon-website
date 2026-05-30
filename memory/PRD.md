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
### 2026-02-26 — SITEWIDE PRODUCT PAGE ORDER RULE — Enforced Across All Pages
- Rule: every product page MUST follow the canonical funnel order
  **SEE → UNDERSTAND → CHOOSE → BUY**:
  1. Hero  →  2. Intro/Editorial  →  3. Archive Gallery  →
  4. Composition / Specs / Craft  →  5. Configurator (tier + size)  →
  6. ADD TO CART  →  7. Final Word.
- The Archive Gallery and the Composition/Specs/Craft blocks must
  **never** appear AFTER the ADD TO CART CTA.
- **Fixes applied this session**:
  - `LadyJayPage.jsx` — removed a duplicated `<section ladyjay-archive>`
    that the prior agent had left at the bottom after the swap. Page
    now has a single archive, correctly placed before the configurator.
  - `CouronnePage.jsx` — moved COMPOSITION → DETAIL → CRAFT →
    SPECIFICATIONS sections from below the purchase block to above it.
  - `CypherPage.jsx` — within the sticky sidebar, moved COMPOSITION,
    STRUCTURE and CRAFT blocks above the CLAIM YOURS CTA. Final Word
    remains last.
  - `RingProductPage.jsx` (used by `RhythmMeshRingPage`) — moved Story
    and Specifications above the ADD TO CART button on the right column.
  - `BlessedPage.jsx` — moved the CRAFT section above the CLAIM YOURS
    button in **both** mobile and desktop layouts.
  - `BamburghPage.jsx` — added `data-testid="bamburgh-gallery"` for
    automated order verification (already in compliant order).
- **Audit verified compliant (no change required)**: TrueVine, PortaAurea,
  Lisa, CoogiDnaTag, Bamburgh.
- **Testing**: `testing_agent_v3_fork` ran DOM-order regression across
  10 product pages. All 10 PASS (100%). Report
  `/app/test_reports/iteration_8.json`.



### 2026-02-25 — COOGI DNA TAG — Tribute Series Pendant Live
- New product page `/coogi-dna-tag` (alias `/products/coogi-dna-tag`).
- **Positioning**: PHILEON × COOGI · Tribute Series. Tagline:
  *"The pattern remembers."*
- **Variants** (2 static, both 10K, identical pricing):
  - Snow · 10K White Gold (default) — SKU `CDT-SNOW-10W`.
  - Sand · 10K Rose Gold — SKU `CDT-SAND-10R`.
- **Pricing**: Both at CAD $13,334 → **$10,000 USD** each. Mirrored in
  `livePricingConfig.coogiDnaTag` + `pricing_engine`. Validation works
  (server $13,350 vs client $13,334 = $16 diff within tolerance;
  tampered $5K Snow correctly rejected).
- **Page flow**: Hero (dual image + variant column) → Spec Strip →
  Composition (9-stone mosaic with natural colours) → The Two Runs
  (side-by-side compare with snow/sand gradient accents) → Craft →
  Final Word with repeat toggle + CTA.
- **Hero treatment**: full dual image static — the side-by-side IS the
  editorial. Variant toggle updates text + spec + applies a subtle
  rose-warm filter on Sand.
- **Skipped from mockup**: global custom cursor, corner brackets, bottom
  marquee (would clash with sitewide UX / existing metals ticker).
- **Catalog**: card live under Gents → Pendants + Collective with
  image `/coogi-dna/coogi-dna-hero.png` and "$10,000 USD".

### 2026-02-25 — PORTA AUREA — Signet Objects Ring Live
- New product page `/porta-aurea` (alias `/products/porta-aurea`) —
  `PortaAureaPage.jsx`. Cinematic dark editorial layout in warm gold
  palette (champagne `#dcb86e` / ink `#0a0806`).
- **Positioning**: PHILEON SIGNET OBJECTS · "The Golden Gate". Tagline:
  *"Some doors open for everyone. This one doesn't."*
- **Page flow**: Hero → Archive (1 frame live, 1 PENDING slot) →
  Composition · Structure · Craft → Specifications (8 rows) →
  Configurator → Final Word.
- **Configurator** (3 metals × 2 stones × 18 sizes):
  - Metal: SIGNATURE (10K) · **HEIRLOOM (14K, FEATURED, default)** ·
    COLLECTOR (18K). USD via `useLiveTierPrices("portaAurea")` →
    $5,500 / $7,000 / $8,500.
  - Stone: **Lab Ruby (default)** · Natural Ruby (note "Natural ruby
    available by custom quote." — no enquire gate, atelier confirms
    natural-stone variance at fulfillment).
  - Size: shared `RingSizeSelector`, default US 9, full US 4–12 + Custom,
    wide-band notice suppressed in favour of the bespoke compact
    `.porta-sizing-note` block (architectural profile guidance: 18×18mm
    face · 28mm total height · 6.5mm band · "size up by 0.5 for a
    relaxed fit").
  - CTA: **ADD TO CART** (no consult/enquire path). Trust line below:
    *"Made to order · 4–6 weeks · Complimentary insured shipping."*
- **Pricing**: CAD bases $7,200 / $9,000 / $11,500 mirrored in
  `livePricingConfig.js` + `pricing_engine.LIVE_PRICING_CONFIG`. All
  3 SKUs validate via `/api/validate-cart` within tolerance; tampered
  $5,000 on Heirloom correctly rejected ($4,000 diff).
- **Catalog**: `ShopDropPage.jsx` CORE_PRODUCTS adds Porta Aurea
  under Gents → Rings + Collective (audience
  `['gentlemens-club','collective']`, category `rings`,
  `From $5,500 USD`).
- **SKU contract**: `PA-{10Y|14Y|18Y}-{LAB|NAT}-SZ{7_5|CUSTOM}`.
  Cart payload carries `productKey`, `tierKey`, `metal`, `stone`,
  `ringSize`, `ringSizeLabel`, clean variant string `"Lab Ruby · US 9"`.
- **Pending**: hero image at `/porta-aurea/porta-aurea-hero.jpg` (folder
  created; drop the file in to populate the hero + archive slot 01).

### 2026-02-24 — THE TRUE VINE — Sacred Inscription (Laser Engraving) + Archive
- **5-frame archive gallery** added between hero and craft notes
  (`/the-true-vine/tv-02-front.jpg` · `tv-03-three-quarter.jpg` ·
  `tv-04-vine-macro.png` · `tv-05-on-body.png` · `tv-06-in-hand.png`).
  3-col desktop / 2-col tablet / 1-col mobile. Soft hover zoom +
  bottom-left frame-index caption pills.
- **Sacred Inscription** add-on configurator below CHAIN:
  - Toggle: `Sacred Inscription · + $250 USD` (custom checkbox styling).
  - Textarea (uppercase serif, 40-char cap) with rotating placeholder
    drawn from JOHN 15:1 / ABIDE IN ME / PSALM 91 / IN HIS NAME /
    FOR THE ONES WHO STAYED.
  - Live sanitisation: auto-uppercase + strip everything except
    `A–Z 0–9 space : . - /` + collapse repeat whitespace + trim.
  - Character counter `12 / 40` + permitted-character rules line.
  - Production note in-block: *"Laser engraved on the reverse side
    of the pendant before final finishing."*
- **Pricing**: $250 USD flat add-on layered on top of the live USD
  tier price. Backend `pricing_engine.py` unchanged — engraving is
  a frontend-only add-on (the sitewide cart validation already
  operates with a $100 CAD tolerance and the USD-vs-CAD wiring is
  a pre-existing global discrepancy out of scope).
- **SKU**: `-ENGRAVED` suffix appended when active
  (e.g. `TV-14Y-ROPE22-ENGRAVED`, `TV-18Y-ROPE24-ENGRAVED`).
- **Cart payload** now carries `sku`, `engravingEnabled`,
  `engravingMethod: "laser"`, `engravingText`. `variant` is a clean
  display string (`"Laser engraved: JOHN 15:1"`) so the cart drawer
  renders the inscription cleanly instead of an object dump.
- **CartContext.addToCart** extended to preserve the new fields
  (additive change; doesn't disturb other pages).
- **Order summary** shows `Sacred Inscription · + $250 USD` and
  `Inscription · "JOHN 15:1"` rows when active.
- Testing agent iteration 7: 100% backend (20/20 cart validation
  cases — no regression), 100% frontend (14/14 scenarios including
  sanitisation, character counter, SKU suffix, price math,
  localStorage payload).


### 2026-02-24 — THE TRUE VINE — Sacred Objects Pendant Live
- New route `/the-true-vine` (alias `/products/the-true-vine`).
- `TrueVinePage.jsx`: cinematic dark editorial pendant page. Hero image
  + dual-column layout, three craft notes (THE ARCH · THE VINE · THE
  COMPOSITION), 6 piece-detail specs, and a metal + chain configurator.
- 4 metal tiers × 4 chain options = **16 compound SKUs**. Tier key
  format: `{metal}__{chain}` (e.g. `heirloom__rope-22`).
- CAD compound pricing locked in `livePricingConfig.js` AND mirrored
  in `backend/pricing_engine.py` (16 entries each):
  - Foundation (Sterling Vermeil) pendant CAD $2,200 → $1,650 USD
  - Signature (10K) pendant CAD $4,200 → $3,000 USD
  - Heirloom (14K) pendant CAD $5,200 → $4,000 USD
  - Collector (18K) pendant CAD $6,800 → $5,000 USD
  - Chain add-ons vary by tier (rope-20/22/24).
- Displayed prices use sitewide USD lock via `useLiveTierPrices` →
  `cadToUsdLuxury` (each compound SKU is its own tier in the config).
- Cart payload posts the USD value as `price`/`lockedPriceCad` per
  sitewide convention so the cart drawer's "USD" label is accurate.
- Catalog wired into `ShopDropPage.jsx` CORE_PRODUCTS:
  audience `['gentlemens-club','collective']`, category `pendants`,
  card label `From $1,650 USD`, hero JPG as catalog image.
- `SHOP_COLLECTION_MAP['the-true-vine']: 'collective'`.
- Backend validation verified: all 16 SKUs return valid:true; tampered
  $4,000 on `signature__rope-22` (real $4,950 CAD) correctly rejected.
- Testing agent: 100% backend (20/20 pytest cases), 100% frontend
  (`/app/backend/tests/test_true_vine.py`).


### 2026-02-23 — LADY JAY Mobile Hero + PDP Refinement
- **Hero height responsive** — 68vh mobile / 82vh tablet /
  `min(100vh, 920px)` desktop. Cinematic on phones, capped on 4K.
- **Scroll cue** added — "DISCOVER THE TRIBUTE ↓" centered at
  bottom of hero, 4s float animation, low-opacity ivory. Respects
  `prefers-reduced-motion`.
- **Hero-to-configurator transition tightened**: pb-6/pb-10
  on hero, urgency strip padding cut from 56/64 → 36/44, config
  top padding 120 → 56/80. No dead space between film + acquisition.
- **FINAL WORD section removed** — hero now carries the emotional
  close. No more duplicated stanzas at the bottom.
- **Bespoke ring size content** on LADY JAY:
  - Default `RingSizeSelector` microcopy + built-in wide-band
    warning suppressed via new `hideWideBandWarning` prop.
  - Custom **WIDE BAND FIT NOTICE** block with LADY JAY's exact
    22mm copy.
  - Custom **RING SIZE GUIDANCE** with 5 bulleted points.
  - "Need help determining your size?" link → modal with two
    measurement methods, US ring size chart, and the 22mm-specific
    fit recommendation.
- **Summary card** updated to subtle champagne-gold border per spec.
- **Mobile gallery labels** tightened with `!important` overrides:
  font-size 10px, letter-spacing 0.32em, padding 6px 10px,
  background rgba(0,0,0,0.42).
- **Mobile archive section** padding reduced (120/130 → 60/70).


### 2026-02-23 — LADY JAY Cinematic Video Hero
- Replaced the static image hero with a full-screen cinematic
  H.264 MP4 video hero (`/videos/lady-jay/lady-jay-hero.mp4`,
  4.5MB, 17.76s loop).
- **Audio stream stripped via ffmpeg** (`-an`) so iOS Safari
  honors autoplay. Verified `paused: false` on first load.
- Added an aggressive autoplay watchdog (mount, loadedmetadata,
  pause, ended, visibilitychange) — matches the mobile rules
  documented in the handoff for THE CARAPACE / LA SCARPA / LISA.
- New hero implements the user's exact JSX spec:
  black canvas + 45% dark overlay + radial sapphire gradient
  + SVG film grain + bottom black-to-transparent fade. Eyebrow
  "PHILEON — TRIBUTE SERIES" at champagne `rgba(201,162,77,0.72)`.
  Title "LADY JAY" at `clamp(4.5rem, 10vw, 10rem)` Cormorant
  Garamond. Final-word copy as the hero's emotional payload.
- Generated a poster frame at
  `/images/lady-jay/lady-jay-poster.jpg` for SSR/initial paint.
- Preserved the 162-day countdown + "No reissue" promise as a
  quiet **SEASON URGENCY STRIP** between the hero and the
  configurator — keeps the commercial pressure intact without
  cluttering the cinematic moment.
- **Note**: the new hero copy duplicates the page's existing
  FINAL WORD section (same "Some pieces celebrate a moment /
  For the city" stanzas). User decision pending: literary echo
  vs. remove the bottom FINAL WORD vs. rewrite the closer.


### 2026-02-23 — Global ATELIER Access
- Added quiet `ATELIER` text link to the desktop header, far-right
  of the icon row, low-contrast champagne `rgba(201,162,77,0.42)`,
  no button, no glow — only a subtle color/opacity shift on hover.
  Mobile-hidden via `ph-desktop-only`.
- Replaced the old "Custom Jewelry" (→ `/custom-design`) footer link
  with a spec-compliant "Atelier" (→ `/atelier`) link, same quiet
  ivory-muted typography as siblings.
- Single unified bespoke entry point sitewide. No competing or
  duplicate language anywhere.


### 2026-02-23 — Sitewide Product Flow Separation
**Finished products → Add to Cart. Bespoke work → Atelier.**

- **Removed** the secondary "BOOK PRIVATE CONSULTATION" button from
  LADY JAY. Add to Cart is now the sole CTA on every finished
  PHILEON object. Verified live: the word "consultation" no longer
  appears anywhere on `/lady-jay`.
- **Retired** `/consult/lady-jay` (deleted `LadyJayConsultPage.jsx`).
- **New page**: `/atelier` (`AtelierPage.jsx`) with aliases `/custom`
  and `/commission`. This is the ONLY page in the experience where
  consultation / collaborative language lives.
  - Warm ink + champagne gold palette (deliberately distinct from
    the navy/sapphire LADY JAY world — bespoke ≠ finished).
  - 4 project types as radio cards:
    Custom Commission · Customize Your Old Gold · Heirloom Rebuild ·
    VIP Private Project.
  - Timeline select (Flexible / 8–12w / 4–8w rush / specific date).
  - Budget select ($5–15k / $15–50k / $50–150k / $150k+ / discuss).
  - Required project brief textarea (12+ characters).
  - Posts to existing `/api/consultations/private` with
    `product_slug="atelier-<projectType>"` so admin dashboard sees
    everything in one place.
- **Audit confirmed clean** — LISA, BAMBURGH, CYPHER, BLESSED,
  RHYTHM MESH, COOGI, COURONNE, DON GORGON, LADY BAMBURGH,
  CORINTHIANS, COCKTAIL JESSICA, BAPE all have Add to Cart as their
  only acquisition CTA. No consultation gatekeeping on any finished
  object sitewide.


### 2026-02-23 — LADY JAY Private Consultation + Sitewide Ring Size Pass
**New page: `/consult/lady-jay`** (`LadyJayConsultPage.jsx`)
- Private luxury appointment experience (not a contact form). Deep
  navy + sapphire + soft gold + grain overlay. Glass shell with
  blurred backdrop.
- Form fields: Full Name, Email, Phone (optional), Preferred
  Composition (Sterling / 10K / 14K / 18K White Gold), Ring Size
  (uses sitewide `RingSizeSelector` with wide-band warning),
  Preferred Consultation Type (Virtual / In-Person / Sizing /
  Collector), Message.
- CTA: REQUEST PRIVATE CONSULTATION → POSTs to
  `/api/consultations/private` with `product_slug="lady-jay"`.
- Success state: editorial thank-you panel + Return to LADY JAY link.
- Lady Jay product page secondary CTA now routes to this page
  instead of `/contact?inquiry=…`.

**Backend: new endpoint** `POST /api/consultations/private`
- New lightweight `PrivateConsultationRequest` model in `server.py`
  (separate from existing strict admin `Consultation` schema).
- Persists to `db.private_consultations`. Returns
  `{ok: true, id, message}`.

**`RingSizeSelector` — refactored sitewide**
- Removed all "Book sizing appointment" / "Schedule sizing" language.
- New microcopy: "Not sure of your size? We recommend visiting a
  local jeweler to confirm your ring size before ordering. You may
  also compare your fit against an existing ring worn on the same
  finger. For wide-band rings, sizing up by 0.25–0.5 sizes is often
  recommended depending on desired fit."
- New WIDE BAND FIT NOTICE block (eyebrow + two italic paragraphs).
- New custom-size lead-time note: "Custom sizes may require
  additional production time." (fires only when "custom" selected).
- Added `ringSizeSkuToken()` helper for SKU-safe size tokens.

**Sitewide migration — ring pages now using the new component:**
- LADY JAY (navy/sapphire, bw=22) → wide-band ON
- LISA SMALL / LISA BOLD (emerald, bw=13) → wide-band ON
- BAPE (luxe white/black, narrow)
- CORINTHIANS 1514 (luxury gold/black)
- PRISE DE COURONNE (luxury gold/black)
- LADY BAMBURGH (luxury gold/black)
- COOGI I (violet)
- CYPHER (white/black)
- BAMBURGH (white/black)
- BLESSED (amber/black)
- COCKTAIL JESSICA (champagne/wine)
- THE DON GORGON (gold/black, bw=11) → wide-band ON
- RHYTHM MESH RING (via shared `RingProductPage`, bw=11) → wide-band ON
- 13 ring pages total now share one coherent luxury sizing UX.

**Excluded — confirmed non-ring products:**
- NERVATURA (earrings), ROSARIA (earrings), APEX (earrings),
  DRAPE (pendants), BOUND (bangle).

**Cart payload contract (sitewide):**
- `name` → `PRODUCT NAME — METAL · US X.X` (or `Custom Above US 12`)
- `id` → `{slug}-{tier}-size-{7-5|custom}`
- `sku` → `PFX-TIER-SZ{7_5|CUSTOM}`
- `ringSize` + `ringSizeLabel` fields included in every ring payload.


### 2026-02-23 — Sitewide RingSizeSelector + LADY JAY FINAL WORD
- Created reusable `<RingSizeSelector>` component at
  `/app/frontend/src/components/RingSizeSelector.jsx` with the full
  spec'd UX: dark glass field, custom chevron, uppercase tracked label,
  no native `<select>` styling, US 4–12 in 0.5 increments + "Custom
  Above US 12" option (18 options total), default `US 7`, sizing
  microcopy ("Not sure of your size? / Book a sizing appointment or
  request our sizing guide…"), and conditional **WIDE BAND** warning
  block that fires when `bandWidthMm >= 10`.
- Exposes `ringSizeLabel(v)` ("US 7.5" / "Custom Above US 12") and
  `ringSizeIdToken(v)` ("7-5" / "custom") so cart line titles and
  variant ids stay consistent across the catalog.
- Themable via CSS custom properties (`--ring-accent`, `--ring-bg`,
  `--ring-fg`, `--ring-muted`) so each ring page keeps its bespoke
  palette without code duplication.
- **Applied to** (this pass — explicitly named by user):
  - LADY JAY → navy/sapphire theme, 22mm = wide-band warning ON.
    SKU updates to `LJ-18W-SZ7_5` / `LJ-SS-SZCUSTOM`.
  - LISA (small + bold) → emerald theme, 13mm = wide-band ON.
    Cart line: `LISA — SMALL · 18K White Gold · US 7.5`.
  - BAPE → luxe white-on-black theme, narrow band = no warning.
    Sizes expanded from US 6–12 → full US 4–12 + Custom.
- **FINAL WORD copy refresh** on LADY JAY: replaced the migration
  metaphor with the user's new three-stanza editorial close
  ("Some pieces celebrate a moment / Others become part of the memory
  that survives it / LADY JAY was created for the latter / For the
  city / For the cold nights / For the ones who stayed").
- **Still on the rollout list** (ring pages with existing size UI that
  need migration to the new component for consistency):
  CORINTHIANS, COURONNE (both native `<select>`), LADY BAMBURGH
  (free-form number input + separate `SizeGuideModal`).
- **Ring pages with NO size selector yet** (need adding):
  THE DON GORGON, NERVATURA, RHYTHM MESH RING, ROSARIA, BOUND,
  COOGI, APEX, DRAPE, CYPHER, BAMBURGH, BLESSED, COCKTAIL JESSICA.
  Listed for follow-up.


### 2026-02-23 — LADY JAY — Full Purchase Configurator
- Replaced single-price hero CTA with full editorial configurator at
  `#lady-jay-configurator`.
- 4 metal tiers (FOUNDATION 925 / SIGNATURE 10K / HEIRLOOM 14K /
  COLLECTOR 18K) wired into `useLiveTierPrices("ladyJay")` — added
  matching entries to `livePricingConfig.js` and
  `backend/pricing_engine.py` so cart validation accepts the SKUs.
- Ring sizes 4–10 in 0.5 increments, default size 7. Selected size
  encoded into SKU (e.g., `LJ-18W-SZ7`, `LJ-SS-SZ5_5`).
- Live summary card surfaces Selection · SKU · Today's Price + a market-
  movement disclosure line. Primary CTA "Commission Piece" (add to
  cart), secondary CTA "Book Private Consultation" → `/contact?inquiry=
  lady-jay-consultation`.
- Trust line, 8-bullet specs grid, and 3-paragraph editorial note all
  surfaced from the user's copy spec.
- **Known rounding quirk**: the sitewide cadToUsdLuxury rule rounds to
  nearest $500 for values ≥ $2,000, so the Sterling Silver tier displays
  $5,000 instead of the brief's $4,800. 10K/14K/18K all land exactly on
  spec. Awaiting user decision: accept $5,000, accept $4,500, or add a
  fixed-price override for the silver tier.

### 2026-02-23 — LADY JAY — Archive Tightened to 9 Frames
- Reordered + pruned archive to the disciplined 9-frame sequence:
  01 TORONTO → 02 PAVÉ DETAIL → 03 PORTRAIT → 04 PAIR · MACRO →
  05 ON BODY → 06 PROVENANCE → 07 VELVET → 08 TAPESTRY →
  09 CAMPAIGN · PORTRAIT.
- Removed: TWIN PORTRAIT, CAMPAIGN (blue mosaic), STUDIO PORTRAIT.
- Title updated to "Nine frames. One tribute." Natural 3×3 grid on
  desktop, no trailing-pair centering needed.


### 2026-02-23 — LADY JAY — Archive Gallery + Countdown Surfaced
- Added 6-frame editorial archive to `/lady-jay`:
  01 PORTRAIT, 02 PAIR · MACRO, 03 TWIN PORTRAIT, 04 PAVÉ DETAIL,
  05 ON BODY, 06 CAMPAIGN. 3×2 grid (2-col @ ≤900px, 1-col @ ≤560px).
- Integrated `CinematicLightbox` with `LADY JAY · ARCHIVE` label.
- Surfaced the previously-dangling `daysLeft` state as a quiet
  editorial block beneath the season notice — "162 days remaining ·
  Closes October 31, 2026". Falls back to "The 2026 season has closed.
  Lady Jay is retired." when `daysLeft === 0`. No ticking clock.
- Assets stored at `/app/frontend/public/lady-jay/lady-jay-0[2-6]-*.png`.


## Implemented (Latest)

### 2026-02 — LISA — Split into LISA SMALL / LISA BOLD + Site Placement
- Split `/lisa` into two audience-targeted product pages:
  - `/ladies/rings/lisa-small` — Ladies/Rings (LISA SMALL — Quiet Saturation)
  - `/gents/rings/lisa-bold` — Gents/Rings (LISA BOLD — Deep Field)
- Refactored `LisaPage` to accept `forceVariantId`, `audienceLabel`,
  `returnHref` props. Single-variant pages hide the "other" variant
  card, lock the cart, and reveal a cross-link CTA before FINAL WORD:
  - LISA SMALL → "Prefer a heavier expression? View LISA BOLD →"
  - LISA BOLD → "Prefer a finer grain? View LISA SMALL →"
- `/lisa` legacy dual-config URL kept live (no `forceVariantId`).
- Homepage discovery strip: inserted LISA tile directly after LA
  SCARPA, LISA BOLD hero render, subtitle "Quiet seduction.", href
  `/gents/rings/lisa-bold`. Verified 2 LISA images in marquee DOM.
- Shop catalog: replaced single `lisa` entry with `lisa-small`
  (ladies/collective · "Starting at CAD $6,800" · "Tighter saturation.
  Softer pressure.") and `lisa-bold` (gentlemens-club/collective ·
  "Starting at CAD $10,800" · "Weight without aggression.").
- **Currency override**: shop card price strings display **CAD** per
  explicit user instruction, deliberately overriding the sitewide USD
  lock for these two cards only. Internal page acquisition prices
  remain in USD (LISA SMALL $5,500 USD, LISA BOLD $9,000 USD).

### 2026-02 — LISA — Initial Build

### 2026-02 — LA SCARPA — Mobile Hero 46vh + Autoplay Enforcement
- Tightened mobile hero further: `46vh`, `min 420px`, `max 520px`.
  Title + statement + transmission stamp now all visible above the
  fold within a 420–520px frame.
- Mobile video crop: `transform: scale(1.12)` for punchier
  fashion-editorial framing.
- Mobile content padding compressed to 20px top/bottom.
- Title micro-tuned: `clamp(2.4rem, 9.5vw, 4rem)` to fit the tighter hero.
- Subtitle/statement/rule margins re-spaced to land all editorial
  copy within ~280px column.
- Video element extended with WebView attributes to force autoplay on
  Chinese/embedded browsers: `webkit-playsinline`, `x5-playsinline`,
  `x5-video-player-type="h5"`, `disablePictureInPicture`.
- Added `videoRef` + useEffect autoplay enforcement: explicitly sets
  `muted`/`defaultMuted`/`playsInline`, calls `.play()` with promise
  catch, and rebinds an `ended` listener that resets `currentTime: 0`
  for any browser that strips native `loop`.
- Verified at 390×844: hero=420px, archive begins at y=536 — first
  CAMPAIGN slide visible at bottom of viewport on initial paint.

### 2026-02 — LA SCARPA — Final Mobile Hero Crop (54vh)
- Replaced the 68vh mobile hero with the final luxury-editorial crop:
  `54vh`, `min 520px`, `max 620px`, `overflow: hidden`.
- Mobile video: `object-position: center center`, `transform: scale(1.08)`
  — punchy fashion-editorial crop that keeps face + pendant
  in-frame on every device.
- Mobile content stack returned to centered with tight 40px top/bottom
  padding (no flex-start push).
- Title rescaled to `clamp(2.7rem, 10vw, 4.4rem)`, `line-height 0.9`,
  `letter-spacing -0.03em`, `margin-bottom 18px`.
- Subtitle: `0.82rem`, `letter-spacing 0.34em`, `margin-bottom 20px`.
- Statement: `1.1rem`, `line-height 1.7`, `max-width 280px`,
  `margin-inline: auto`, tight 6px above (rule margin: 14px below).
- Verified at 390x844: hero=520px (clamp held), archive slider
  begins at y=636 → first frame peeks just below the fold.

### 2026-02 — LA SCARPA — Mobile Hero Tightened + New HD Video Edit
- Swapped hero video for the new HD cinematic edit (4.6 MB) at the
  same path (`/videos/la-scarpa-hero.mp4`).
- Hero height tiers refined:
  - Desktop (≥1025px): `100vh` (unchanged)
  - Tablet (769–1024px): **`82vh`** (new tier)
  - Mobile (≤768px): **`68vh`** with `min-height: 620px` and
    `max-height: 760px` — clamps prevent ultra-tall or ultra-short
    devices from breaking the editorial composition.
- Mobile video crop: `object-position: 72% center` so the model face
  and pendant stay on-frame even at narrow widths.
- Mobile content stack moved up: `justify-content: flex-start`,
  `padding-top: 110px`, `padding-bottom: 60px` — title + statement
  now land above the visual midline, pendant frames reveal beneath.
- Mobile title scale tightened: `clamp(3.2rem, 11vw, 5.4rem)`,
  `line-height: 0.92`, `letter-spacing: -0.02em`.
- Tagline gap tightened: rule margin `14px`, statement
  `margin-top: 28px`.
- Verified at 390/900/1920: heroes hit 620/984/1000px respectively.

### 2026-02 — LA SCARPA — Cinematic Video Hero (Milan Edit)
- Replaced the static rose-silk split hero with a full-bleed cinematic
  video — Milan opening · window scene · pendant macro · nail-touch
  macro · black PHILEON outro. File: `/videos/la-scarpa-hero.mp4`
  (5.2 MB, served with `Accept-Ranges: bytes` for streaming).
- Desktop hero: `100vh`. Mobile: `88vh`. Video attributes locked to
  `autoplay · muted · loop · playsInline · preload=auto · no controls`,
  `object-fit: cover · object-position: center · transform: scale(1.01)`.
- Cinematic atmosphere stack: soft SVG-noise grain (0.13 opacity,
  overlay blend), warm champagne radial bloom (soft-light blend),
  ellipse + top/bottom vignette band.
- Text overlay system (Cormorant Garamond serif + restrained Inter):
  - Top-left eyebrow: "PHILEON SIGNATURE OBJECTS"
  - Centered: "LA SCARPA DELLA REGINA" (clamp 2.2 → 5.4rem,
    weight 500) + sub "THE QUEEN'S SHOE"
  - 180px gold hairline that draws on a delayed easing curve
  - Italic statement: "She does not ask for the room. /
    The room rearranges itself."
  - Bottom-right stamp: "PHILEON PRIVATE TRANSMISSION"
- Slow staggered fade-in sequence using `cubic-bezier(0.22, 1, 0.36, 1)`
  over 2.2s with delays 0.45 → 0.9 → 1.4 → 2.0s.
- Mobile crop tuned: eyebrow pushed to top: 76px so it never overlaps
  the RETURN link; all text vertically centered so it never sits on
  the pendant macro frames.
- Reduced-motion respected (all fades and hairline draw disabled).
- RETURN link converted from burgundy text to soft cream with
  `mix-blend-mode: difference` so it stays legible across every frame
  of the cinematic edit.

### 2026-02 — LA SCARPA — Hero CTA Removed (Single ADD TO CART)
- Removed the inline price + ADD TO CART block that was duplicated inside
  the hero. The hero is now pure editorial: title, "THE QUEEN'S SHOE",
  Italian + English couplet, portrait.
- Page now has exactly one ADD TO CART button — in the ACQUISITION block.
- Confirmed final flow with no commerce noise interrupting the archive:
  Hero → Archive Slider → COMPOSITION · STRUCTURE · CRAFT →
  Specifications → Pricing + ADD TO CART → FINAL WORD.

### 2026-02 — LA SCARPA — Archive: Vertical Grid → Horizontal Swipe Slider
- Retired the dark 3-col burgundy archive grid in favour of a bright
  horizontal swipeable slider on a `#f6f1eb` champagne ground.
- Slides: `flex: 0 0 min(78vw, 460px)` · 4:5 aspect · 24px radius ·
  scroll-snap mandatory · `-webkit-overflow-scrolling: touch` ·
  `28px 80px` burgundy ambient shadow.
- Label pill: gold-rimmed glass capsule bottom-aligned with index +
  slot name (`01 · CAMPAIGN`, `02 · INTIMACY`, …).
- Header retitled "THE ARCHIVE" eyebrow + "Nine frames. One artifact."
  in italic Cormorant.
- Custom 4px scrollbar in burgundy palette.
- Lightbox wiring preserved — every slide opens the CinematicLightbox
  at its index.

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
