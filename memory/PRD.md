# PHILEON — Luxury Jewelry E-Commerce

## Live Pricing System — PRODUCTION READY

**Formula**: `DISPLAY PRICE = LOCKED UPLOAD PRICE + (CURRENT METAL VALUE - LOCKED METAL REFERENCE)`

### Architecture
- **Backend**: `GET /api/market-prices` (with test mode), `POST /api/validate-cart`
- **Server engine**: `/app/backend/pricing_engine.py` — mirrors frontend logic exactly
- **Config**: `livePricingConfig.js` (frontend) + `LIVE_PRICING_CONFIG` (backend) — 18 products
- **Context**: `MarketPricingContext.jsx` — 15-min refresh, localStorage cache, validation
- **Hooks**: `useLivePrice()`, `useLiveFromPrice()`, `useLiveTierPrices()`

### Safeguards
- **Cart price lock**: live price captured at add-to-cart, stored as `lockedPriceCad`
- **Server validation**: `POST /api/validate-cart` compares client vs server price ($100 tolerance)
- **Fallback**: localStorage cache (1hr TTL), defaults to $150/g gold
- **Response validation**: rejects non-positive numbers from API
- **Rounding**: all prices rounded to nearest $50 CAD, no decimals

### All surfaces wired
- All bespoke + template product pages
- Homepage, ShopDropPage, StyleItWith, PhileonCarousel, BamburghCollective
- Cart stores productKey + tierKey for server validation
- Market note on all product pages

## Backlog
- P2: Populate `/vault/drews-world` with exclusive drops
- P3: Mobile swipe verification + video poster frames
