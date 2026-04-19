# PHILEON — Luxury Jewelry E-Commerce

## Problem Statement
High-end luxury jewelry e-commerce with bespoke cinematic product pages, editorial galleries, live metal pricing.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Data**: `/app/frontend/src/data/products.js`
- **Live Pricing**: `/api/market-prices` → `MarketPricingContext` → `livePricing.js` → `useLivePrice` hooks

## Live Pricing System (April 19, 2026)
**Formula**: DISPLAY PRICE = LOCKED UPLOAD PRICE + (CURRENT METAL VALUE - LOCKED METAL REFERENCE)

- **Backend**: `GET /api/market-prices` → `goldPerGram24kCad`, `silverPerGramCad`, `updatedAt`
- **Config**: `/app/frontend/src/data/livePricingConfig.js` — per-product per-tier locked prices, metal types, weights, reference values
- **Lib**: `/app/frontend/src/lib/livePricing.js` — `calculateMetalValueCad()`, `calculateLiveDisplayPrice()`, `formatCad()`, `roundLuxury()`
- **Context**: `/app/frontend/src/context/MarketPricingContext.jsx` — fetches every 15 min
- **Hooks**: `/app/frontend/src/hooks/useLivePrice.js` — `useLivePrice()`, `useLiveFromPrice()`, `useLiveTierPrices()`
- **Component**: `/app/frontend/src/components/LiveFromPrice.jsx` — drop-in for any "From $X" label

### Wired into:
- Lady Bamburgh page (tier dropdown + CTA)
- Bamburgh page (tier cards + CTA)
- COOGI I page (hero from price + tier cards + CTA)
- Cypher page (tier cards)
- Morso page (tier cards)
- HomePage (all featured product prices)
- ShopDropPage (all collection card prices)

## Product Pages
- COOGI I, THE BAMBURGH, LADY BAMBURGH, Bamburgh Circle
- All legacy pages (La Marva, Annie Rose, Cypher, Morso, etc.)

## Backlog
- Wire remaining legacy pages (Bound, Apex, Homage, La Bete) to live tier pricing hooks
- P2: Populate `/vault/drews-world` with exclusive drops
- P3: Mobile swipe verification for galleries
