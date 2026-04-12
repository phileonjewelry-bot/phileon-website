# PHILEON — Luxury Jewelry E-Commerce

## Problem Statement
High-end luxury jewelry e-commerce with bespoke cinematic product pages, editorial galleries, deep negative space.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Data**: `/app/frontend/src/data/products.js`

## Recently Completed (April 12, 2026)
- **COOGI I video playback**: Single-active-media state via useEffect — hero pauses when gallery video plays, gallery pauses on image selection. No overlap.
- **COOGI I media container**: Hero + gallery wrapped in max-w-[520px]/[720px] centered container. Hero has rounded-[10px]. Gallery uses object-contain.
- **COOGI I thumbnails**: 48px with 6px gap, ring-[0.5px] highlight. Video thumbnail uses poster image instead of video element.
- **Homepage hero**: h-[50vh]/h-[65vh]
- **Homepage tiles**: 3-col, h-[80px]/h-[110px]

## Backlog
- P2: Populate `/vault/drews-world` with exclusive drops
- P3: Mobile swipe verification for galleries
- P3: Cross-selling / hover images for shop grid
- P3: Stripe payment integration
