# PHILEON Luxury Jewelry E-Commerce Website

## Project Overview
PHILEON is a luxury jewelry e-commerce website built with React frontend and FastAPI backend. The site features a premium, editorial design aesthetic with dynamic pricing for select products.

## Core Products (5 Total)

### 1. La Marva (Flagship Ring)
- **Route**: `/products/la-marva`
- **Pricing**: Dynamic gold-based pricing
- **Editions**: Foundation ($8,000), Signature ($3,400), Heirloom 14K ($18,000), Heirloom 18K ($22,000)
- **Features**: Dynamic pricing engine that adjusts based on gold market prices

### 2. Annie Rose
- **Route**: `/products/annie-rose`
- **Pricing**: Fixed tiered pricing by metal × stone type
- **Options**: Lab/Natural diamonds, 10K/14K/18K gold
- **Price Range**: $6,400 - $12,200

### 3. Monika Couture Earrings
- **Route**: `/products/monika-couture`
- **Pricing**: Fixed by metal type
- **Options**: Silver ($1,400), White/Yellow/Rose 10K Gold ($3,700)
- **Features**: Metal swatches that switch gallery images

### 4. Alejandra Heels
- **Route**: `/products/alejandra-heels`
- **Pricing**: Three-tier by material and stone
- **Options**: Silver + Cubic ($1,250), Gold Plated + Cubic ($1,450), Solid 10K/14K + Lab ($4,800-$5,300)
- **Features**: Metal swatches with gallery sync

### 5. PTP Cuff (NEW - Added March 2026)
- **Route**: `/products/ptp-cuff`
- **Subtitle**: "PTP — Power To The People"
- **Description**: Sculptural cuff bracelet with raised fists symbolizing unity
- **Currency**: CAD
- **Editions**:
  - Movement Edition: Gold Vermeil - $1,050 CAD (Entry into the PTP design)
  - Signature Edition: 10K Solid Gold - $4,400 CAD ⭐ Most Popular (Best balance of weight and value)
  - Heirloom Edition: 14K Solid Gold - $8,400 CAD (Collector-level edition)
- **Gallery**: Video (first item) + 4 images (hero reflection, angled, macro detail, on-wrist lifestyle)
- **Video**: Autoplay, looped, muted (CDN hosted, ~5MB)
- **Visual Hierarchy**: Signature Edition card has enhanced styling (larger, gold border, stronger shadow)

## Architecture

### Frontend (`/app/frontend/`)
- **Framework**: React with React Router
- **Styling**: Tailwind CSS with custom PHILEON theme
- **State**: React Context (CartContext, WishlistContext)
- **Components**: Shadcn/UI base components

### Backend (`/app/backend/`)
- **Framework**: FastAPI
- **Key Endpoint**: `/api/metals` - Live gold prices for dynamic pricing

### Data Architecture
- **Product Data**: `/app/frontend/src/data/products.js` (Single source of truth)
- **Pricing Logic**: `/app/frontend/src/utils/pricing.js` (Centralized engine)

## Key Pages
- Homepage: Video hero, PTP Cuff feature section, Signature Pieces grid
- Shop: Product grid with all 5 core products + drop items
- Product pages: Individual pages with galleries, edition selectors, cart integration

## Recent Changes (March 2026)

### Typography Refinement
- Homepage hero headline updated to "Not jewelry. Identity."
- Letter spacing increased to 0.12em
- Line height adjusted for luxury balance

### PTP Cuff Product Addition
- New product page with three editions
- Homepage feature section below hero
- Added to shop page product grid
- Full cart integration

## Technical Notes
- All backend routes prefixed with `/api`
- Environment variables from `.env` files
- MongoDB for data persistence
- Stripe integration for checkout

## Backlog / Future Tasks
1. Monika Couture swatch refinement (map swatches to specific gallery slides)
2. Git workflow improvements (clean branch strategy)

## Notes
- Village Cuff concept has been fully absorbed into "The PTP Cuff" - no separate product exists
