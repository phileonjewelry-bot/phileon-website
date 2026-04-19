# PHILEON — Luxury Jewelry E-Commerce

## Live Pricing System — FINALIZED

**Formula**: `DISPLAY PRICE = LOCKED UPLOAD PRICE + (CURRENT METAL VALUE - LOCKED METAL REFERENCE)`

### Architecture
- **Backend**: `GET /api/market-prices` with test mode (`?test_gold_multiplier=1.1`)
- **Config**: `livePricingConfig.js` — 18 products, all tiers
- **Lib**: `livePricing.js` — calc + formatCad + roundLuxury ($50)
- **Context**: `MarketPricingContext.jsx` — 15-min refresh, localStorage cache, validation, fallback
- **Hooks**: `useLivePrice()`, `useLiveFromPrice()`, `useLiveTierPrices()`
- **Components**: `<LiveFromPrice>` for cards/grids, `slugToProductKey()` mapper

### Safeguards
- Cart price lock: live price captured at add-to-cart time via `tierPricesLive[tier]?.price`
- Fallback: defaults to $150/g gold if API fails
- Cache: localStorage preserves last-known prices for 1 hour
- Validation: API response checked for valid numbers before updating state
- Rounding: all prices rounded to nearest $50, no decimals

### Wired into ALL surfaces
- All bespoke pages: LadyBamburgh, Bamburgh, CoogiI, Cypher, Morso, Bound, Apex, Homage, LaBete, Blessed
- All template pages: RingProductPage, EarringsProductPage, PendantProductPage
- All product-specific pages: PTPCuff, Rosaria, DesirCorset, FormeCuff, MonikaCouture, AlejandraHeels
- HomePage: all featured sections
- ShopDropPage: all collection cards
- StyleItWith: cross-sell prices
- Market note on all product pages

## Backlog
- P2: Populate `/vault/drews-world` with exclusive drops
- P3: Mobile swipe verification + video poster frames
