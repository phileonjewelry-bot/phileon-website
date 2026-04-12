# PHILEON — Luxury Jewelry E-Commerce

## Problem Statement
High-end luxury jewelry e-commerce application featuring bespoke, cinematic product pages with video backgrounds, editorial galleries, and deep negative space.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Data**: `/app/frontend/src/data/products.js`

## Recently Completed (April 12, 2026)
- **Hero height**: Reduced from `h-screen` to `h-[50vh] md:h-[65vh]`
- **Category tiles**: Fixed heights `h-[80px] md:h-[110px]`, 3-col grid on all screens, tight padding `py-4 md:py-6`
- **PTP section**: Padding reduced from `py-28 md:py-36 lg:py-44` to `py-16 md:py-20 lg:py-28`
- **COOGI I gallery video**: CDN hero video as FIRST gallery item
- **LA BETE gallery video**: Local hero video as FIRST gallery item

## Backlog
- P2: Populate `/vault/drews-world` with real exclusive drops
- P3: Mobile swipe verification for all galleries
- P3: Cross-selling logic / hover images for shop grid
- P3: Stripe payment integration
