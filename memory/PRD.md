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

## Vault — /vault/drews-world — COMPLETED (Feb 2026)
- Cinematic full-bleed video hero (user-provided Lady Bamburgh reveal mp4)
- Poster fallback for headless/slow-load
- Fixed pricing: LADY BAMBURGH — VAULT EDITION at **$14,800 CAD** (no live-pricing delta)
- `productKey: null` + `tierKey: null` on cart item → **bypasses `/api/validate-cart`** by design (see `CartContext.validateCart` filter)
- "VAULT EXCLUSIVE · LIMITED RELEASE" label + editorial statement + specs row
- Add-to-Bag wired; cart drawer confirmed working
- File: `/app/frontend/src/pages/VaultPage.jsx` (fully rewritten, Tailwind)

## Backlog
- P3: Additional Vault drops as user supplies artifacts
- P3: Additional gallery images for newer products
- P3: Cross-sell/hover images for shop grid (match CYPHER hover behavior)
