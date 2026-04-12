# PHILEON — Luxury Jewelry E-Commerce

## Problem Statement
High-end luxury jewelry e-commerce application featuring bespoke, cinematic product pages with video backgrounds, precise aspect-ratio handling, editorial galleries, and deep negative space. Products span rings, earrings, bracelets, pendants, and heels across Gents, Ladies, and Collective categories.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Data**: Product catalog in `/app/frontend/src/data/products.js` (centralized pricing, metadata, gallery arrays, audience arrays)
- **Routing**: React Router with bespoke pages per flagship product

## Key Technical Concepts
- **Array-based audience filtering**: `product.audience` can be a string or array for cross-category rendering
- **Cinematic Video Integration**: `<video>` tags with `autoPlay muted loop playsInline` + `poster` fallbacks
- **Object-Contain Cards**: Shop grid uses `object-contain` with flexible heights to prevent ring clipping
- **Luxury Editorial Sequencing**: Strict 13-step gallery order (HERO → SECONDARY HERO → HUMAN ENTRY → BALANCE → INTIMACY → CRAFT → ARCHITECTURE → TRUST → MEANING → OWNERSHIP → CAMPAIGN)

## Completed Features
- LA MARVA flagship page with dynamic gold pricing
- Annie Rose, Monika Couture, Alejandra Heels, PTP Cuff, Rosaria, Desir Corset, Forme Cuff pages
- TOLA II, Galatians 6:14, Trace, BOUND, APEX, HOMAGE, CYPHER, IL MORSO DEL RE, LA BETE pages
- BLESSED (Collective Ring) with rotating hero videos, full specs, pricing
- COOGI I (Tribute Series) with cinematic hero, specs, stone composition map
- Cross-category filtering (array-based audiences for Gents/Ladies/Collective)
- Homepage: LA Marva Video Hero → PTP Cuff Feature → BOUND Hero → 3 Category Tiles → Slowed Product Carousel → Collective Grid → Signature Products → Brand Statement → La Marva Flagship → Rosaria → Custom Design CTA
- Shop/Collection grid with object-contain cards
- Secret `/vault/drews-world` gate (type "phileon")
- Cart system with add-to-cart hooks

## Recently Completed (April 12, 2026)
- **Homepage category tiles**: Reduced from `aspect-[4/3]` to `aspect-[5/2]` with tighter padding (py-8/py-12 vs py-12/py-20). Now feel like navigation cards, not hero banners.
- **LA BETE gallery video**: Restored hero video (`/videos/labete-hero.mp4`) as FIRST item in gallery array. Video renders with autoPlay, muted, loop, playsInline, poster image. Thumbnails show play icon overlay for video items.

## Backlog
- P2: Populate `/vault/drews-world` with real exclusive drops
- P3: Mobile swipe verification for all galleries
- P3: Cross-selling logic between products
- P3: Hover images on older flagship products in shop grid
- P3: Stripe payment integration (requires user API key)

## File References
- `/app/frontend/src/data/products.js` — All product data
- `/app/frontend/src/pages/HomePage.jsx` — Homepage layout
- `/app/frontend/src/pages/LaBetePage.jsx` — LA BETE bespoke page (with gallery video)
- `/app/frontend/src/components/ProductGallery.jsx` — Reusable gallery component
- `/app/frontend/src/pages/ShopDropPage.jsx` — Collection grid
- `/app/frontend/src/pages/BlessedPage.jsx` — BLESSED page
- `/app/frontend/src/pages/CoogiPage.jsx` — COOGI I page
