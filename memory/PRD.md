# PHILEON — Luxury Jewelry E-Commerce

## Problem Statement
High-end luxury jewelry e-commerce with bespoke cinematic product pages, editorial galleries, deep negative space.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Data**: `/app/frontend/src/data/products.js`

## Recently Completed (April 12, 2026)
- **COOGI I page global scale correction**: Hero 55vh/65vh, gallery max-w-[400px] with padding, thumbnails 28px (from 44px), tightened all vertical spacing, closing section reduced
- **Homepage hero**: Reduced from h-screen to h-[50vh] md:h-[65vh]
- **Homepage category tiles**: 3-col grid, h-[80px]/h-[110px], tight padding
- **COOGI I gallery video**: CDN hero video as first gallery item
- **LA BETE gallery video**: Local hero video as first gallery item

## Backlog
- P2: Populate `/vault/drews-world` with exclusive drops
- P3: Mobile swipe verification for galleries
- P3: Cross-selling / hover images for shop grid
- P3: Stripe payment integration
