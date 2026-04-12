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
- **Luxury Editorial Sequencing**: Strict 13-step gallery order (HERO -> SECONDARY HERO -> HUMAN ENTRY -> BALANCE -> INTIMACY -> CRAFT -> ARCHITECTURE -> TRUST -> MEANING -> OWNERSHIP -> CAMPAIGN)

## Completed Features
- All bespoke product pages (LA MARVA, Annie Rose, Monika Couture, Alejandra Heels, PTP Cuff, Rosaria, Desir Corset, Forme Cuff, TOLA II, Galatians 6:14, Trace, BOUND, APEX, HOMAGE, CYPHER, IL MORSO DEL RE, LA BETE, BLESSED, COOGI I)
- Homepage: Video Hero -> PTP Cuff -> BOUND Hero -> 3 Category Tiles -> Slowed Carousel -> Collective Grid -> Signature Products -> Brand Statement -> La Marva Flagship -> Rosaria -> Custom CTA
- Cross-category filtering (array-based audiences)
- Shop/Collection grid with object-contain cards
- Cart system with add-to-cart hooks

## Recently Completed (April 12, 2026)
- **Homepage category tiles**: Reduced from `aspect-[4/3]` to `aspect-[5/2]` with tighter padding. Navigation card feel.
- **LA BETE gallery video**: Hero video (`/videos/labete-hero.mp4`) added as FIRST gallery item with poster, play icon thumbnails.
- **COOGI I gallery video**: CDN hero video added as FIRST gallery item. Hero section converted from static image to video. Thumbnails show play icon for video item. All 11 original gallery images preserved.

## Backlog
- P2: Populate `/vault/drews-world` with real exclusive drops
- P3: Mobile swipe verification for all galleries
- P3: Cross-selling logic between products
- P3: Hover images on older flagship products in shop grid
- P3: Stripe payment integration (requires user API key)

## Key Files
- `/app/frontend/src/data/products.js` — All product data
- `/app/frontend/src/pages/HomePage.jsx` — Homepage layout
- `/app/frontend/src/pages/CoogiPage.jsx` — COOGI I page (with gallery video)
- `/app/frontend/src/pages/LaBetePage.jsx` — LA BETE page (with gallery video)
- `/app/frontend/src/components/ProductGallery.jsx` — Reusable gallery component
- `/app/frontend/src/pages/ShopDropPage.jsx` — Collection grid
- `/app/frontend/src/pages/BlessedPage.jsx` — BLESSED page
