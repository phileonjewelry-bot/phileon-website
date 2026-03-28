# PHILEON Luxury Jewelry E-Commerce - Product Requirements Document

## Original Problem Statement
Build a sophisticated luxury jewelry e-commerce website for PHILEON brand featuring:
- Product showcase with high-end visual presentation
- Metal variant selection with dynamic pricing
- Shopping cart functionality
- Category-based filtering (Ladies First, Gentleman's Club)
- Secret vault easter egg experience

## Core Requirements

### Product Pages
- Hero image/video sections
- Horizontal scrolling gallery (ProductGallery component)
- Metal variant swatches with visual color indicators
- Dynamic pricing based on selected variant
- Add to Cart with variant details

### Navigation Structure
- **LADIES FIRST**: Rings, Earrings, Bracelets/Cuffs, Pendants
- **GENTLEMAN'S CLUB**: Rings, Earrings, Bracelets/Cuffs, Pendants
- **THE COLLECTIVE**: Curated selection (Forme Cuff, La Marva, PTP Cuff)

### Shop Grid
- Product cards with image, name, material line, price range
- "From $X" pricing format
- Stock badges (In Stock, Sold Out)
- Wishlist hearts
- Category and audience filtering via URL params

## What's Been Implemented (December 2025 - Latest Session)

### BOUND — The Bustier Bangle (Complete)
- **Custom Editorial Product Page** - Cartier-level luxury experience (not using standard wrapper)
- Full-screen cinematic hero with gradient overlays
- 2-column product layout: sticky gallery left, scrolling info right
- 9-image gallery with interactive thumbnails and desktop hover zoom
- **Tier-based pricing system**:
  - Foundation (10K Yellow Gold): $12,800
  - Signature (14K Yellow Gold): $18,400
  - Heirloom (18K Yellow Gold): $24,600
- **Editorial scroll sections**:
  - Story section (centered text)
  - Detail section (wrist on black dress image)
  - Lifestyle section (collection on glass table)
  - Craft section (angled product on velvet)
  - Structure section (back view of bangle)
  - Macro section (full-width diamond mesh close-up with overlay text)
  - Sculptural section (artistic shot with extended copy)
  - Specifications grid (18K, Mesh, VS+, Adjustable)
  - Final CTA with "From $12,800 CAD" and Add to Cart button
- Route: `/products/bound`
- File: `BoundPage.jsx`

## What's Been Implemented (March 2025)

### FORME CUFF Product (Complete)
- Metal-based gallery switching (Yellow Gold / Rose Gold sets)
- 4 variant swatches: 10K Yellow Gold, 10K Rose Gold, Plated Yellow, Plated Rose
- Pricing: $14,800 (solid gold), $1,250 (plated)
- 7 gallery images per color (hero, angled, marble, structure, macro, lifestyle, edge detail)
- Add to Cart with correct variant/image/price
- Video autoplay loop
- Shop card with "From $1,250 CAD"

### Earrings Category Clarity
- Monika Couture → "Monika Couture Earrings"
- Alejandra Heels → "Alejandra Heels Earrings"
- Rosaria → "Rosaria Earrings"
- All show "Statement Earrings" category label

### Product Placement
| Section | Products |
|---------|----------|
| Ladies First | La Marva, Annie Rose, Rosaria Earrings, Désir Corset, FORME CUFF, Monika Couture Earrings, Alejandra Heels Earrings |
| Gentleman's Club | PTP Cuff |
| The Collective | Forme Cuff, La Marva, PTP Cuff |

### Vault Easter Egg
- 7-tap logo trigger → glitch animation → video → redirect to /vault/drews-world
- Animated hero on vault page

## Technical Architecture

```
/app/frontend/src/
├── components/
│   ├── ProductGallery.jsx (horizontal scrolling gallery)
│   ├── CartDrawer.jsx
│   ├── PhileonMenu.jsx (navigation)
│   └── VaultUnlockSequence.jsx
├── pages/
│   ├── FormeCuffPage.jsx (metal swatches + gallery switching)
│   ├── ShopDropPage.jsx (filtering + product cards)
│   └── VaultPage.jsx
├── contexts/
│   └── CartContext.jsx
├── hooks/
│   └── useAddToCart.js
└── data/
    └── products.js
```

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- Add BOUND to Shop Grid / Homepage features
- Verify mobile swipe interactions for BOUND gallery
- On-ear lifestyle images for earrings

### P2 (Medium Priority)
- Vault page real product drops (`/vault/drews-world`)
- Add more products to Gentleman's Club collection
- Cross-selling between products

### P3 (Low Priority)
- Additional product pages
- Expand filtering options
- Performance optimization
- File cleanup (Header.jsx redundancy check)

## Known Issues
- None currently blocking

## Third-Party Integrations
- Stripe (checkout)
- Sonner (toast notifications)
