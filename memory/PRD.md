# PHILEON — Luxury Jewelry E-Commerce

## Problem Statement
High-end luxury jewelry e-commerce with bespoke cinematic product pages, editorial galleries, live metal pricing.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Data**: `/app/frontend/src/data/products.js`
- **Live Pricing**: `/api/market-prices` → `MarketPricingContext` → `livePricing.js`

## Live Pricing System (April 19, 2026)
- **Backend**: `/api/market-prices` returns `goldPerGram24kCad`, `silverPerGramCad`, `updatedAt`
- **Frontend lib**: `/app/frontend/src/lib/livePricing.js` — `calculateMetalValueCad()`, `calculateLiveDisplayPrice()`, `formatCad()`, `roundLuxury()`
- **Context**: `/app/frontend/src/context/MarketPricingContext.jsx` — fetches every 15 min
- **App.js**: Wrapped in `<MarketPricingProvider>`

## Product Pages
- COOGI I: `/products/coogi-i` — editorial hero image + gallery
- THE BAMBURGH: `/products/the-bamburgh` — PairHero layout, 7-image gallery
- LADY BAMBURGH: `/products/lady-bamburgh` — 90vh cinematic hero, 9-image gallery, tier/size/profile selectors
- Bamburgh Circle: `/bamburgh-circle` — editorial landing with dual hero sections

## Key Files
- `/app/frontend/src/data/products.js` — All product data
- `/app/frontend/src/pages/LadyBamburghPage.jsx`
- `/app/frontend/src/pages/BamburghPage.jsx`
- `/app/frontend/src/pages/BamburghCirclePage.jsx`
- `/app/frontend/src/pages/CoogiPage.jsx`
- `/app/frontend/src/components/PhileonCarousel.jsx`
- `/app/frontend/src/components/BamburghCollective.jsx`
- `/app/frontend/src/lib/livePricing.js`
- `/app/frontend/src/context/MarketPricingContext.jsx`

## Backlog
- Wire live pricing into product pages (use `useMarketPricing` + `calculateLiveDisplayPrice`)
- P2: Populate `/vault/drews-world` with exclusive drops
- P3: Mobile swipe verification for galleries
