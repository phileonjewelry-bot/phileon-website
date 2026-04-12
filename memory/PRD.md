# PHILEON — Luxury Jewelry E-Commerce

## Problem Statement
High-end luxury jewelry e-commerce application featuring bespoke, cinematic product pages with video backgrounds, precise aspect-ratio handling, editorial galleries, and deep negative space.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Data**: Product catalog in `/app/frontend/src/data/products.js`

## Key Technical Concepts
- Array-based audience filtering for cross-category rendering
- Cinematic video integration with poster fallbacks
- Object-contain cards for shop grid
- Luxury editorial sequencing for galleries

## Recently Completed (April 12, 2026)
- **Homepage category tiles**: Changed to 3-column grid on ALL screens with fixed heights (h-[120px] mobile, h-[160px] desktop). Subtitles hidden on mobile. Compact navigation cards, not hero banners.
- **COOGI I gallery video**: CDN hero video (`VIDEO_98d0aec8...mp4`) added as FIRST gallery item. Hero section converted to video. Thumbnails show play icon. All 11 images preserved.
- **LA BETE gallery video**: Hero video (`/videos/labete-hero.mp4`) added as FIRST gallery item with poster and play icon thumbnails.

## Backlog
- P2: Populate `/vault/drews-world` with real exclusive drops
- P3: Mobile swipe verification for all galleries
- P3: Cross-selling logic between products
- P3: Hover images on older flagship products in shop grid
- P3: Stripe payment integration (requires user API key)
