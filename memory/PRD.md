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

## Backlog
- P2: Populate `/vault/drews-world` with exclusive drops
- P3: Additional gallery images for newer products
