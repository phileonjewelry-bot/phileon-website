# PHILEON — Luxury Jewelry E-Commerce

## Live Pricing System — COMPLETE

**Formula**: `DISPLAY PRICE = LOCKED UPLOAD PRICE + (CURRENT METAL VALUE - LOCKED METAL REFERENCE)`

### Architecture
- **Backend**: `GET /api/market-prices` → gold/silver per gram CAD
- **Config**: `livePricingConfig.js` — 18 products × all tiers
- **Lib**: `livePricing.js` — calc functions + luxury rounding to $50
- **Context**: `MarketPricingContext.jsx` — fetches every 15 min
- **Hooks**: `useLivePrice()`, `useLiveFromPrice()`, `useLiveTierPrices()`
- **Component**: `<LiveFromPrice slug="..." />` for cards/grids

### Wired into ALL surfaces:
- Lady Bamburgh, Bamburgh, COOGI I — tier dropdowns + CTA
- Cypher, Morso — tier cards
- Bound, Apex, Homage — tier selections + price displays
- La Bete, Blessed — mobile + desktop tier prices
- PTP Cuff, Rosaria, Desir Corset — edition/material selectors
- Monika Couture — metal option prices
- Alejandra Heels, Forme Cuff — formatPrice with live fallback
- HomePage — all featured product "From $X" prices
- ShopDropPage — all collection card prices
- Market note on all product pages

## Backlog
- P2: Populate `/vault/drews-world` with exclusive drops
- P3: Mobile swipe verification for galleries
