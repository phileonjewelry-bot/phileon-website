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

## What's Been Implemented (April 2026 - Latest Session)

### Enhanced Tier Selector UI (Complete - April 9, 2026)
**UI Consistency Applied to CYPHER and IL MORSO DEL RE Pages**

Applied the refined LA BÊTE tier selector design to both pages:
- "SELECT CONFIGURATION" label (matches LA BÊTE)
- Subtle transparent background when active (`bg-white/[0.04]`)
- "MOST POPULAR" and "COLLECTOR" badges with pill styling
- Description text for each tier
- Proper opacity transitions for active/inactive states

**Updated Files:**
- `CypherPage.jsx` - Enhanced tier selector
- `MorsoPage.jsx` - Enhanced tier selector
- `products.js` - Added tier descriptions for CYPHER and MORSO

### TRIBUTE: LA BÊTE Page Refinements (Verified - April 9, 2026)
**Final Implementation Verified:**
- Desktop vertical thumbnail gallery (hover-to-swap)
- Square aspect ratio main image
- Subtle zoom (1.06 scale) on hover
- Updated purchase panel microcopy
- CRAFT section with numbered formatting
- Closing statement: "Not driven. Worn."
- Mobile 55vh hero height
- Mobile horizontal thumbnails

## What's Been Implemented (December 2025 - January 2026)

### CYPHER Men's Statement Ring Page (Complete - December 29, 2025)
**New Flagship Product Page for Gentleman's Club Collection**

- **Created `CypherPage.jsx`**: Full bespoke editorial page with:
  - Fullscreen hero with Toronto skyline image
  - 2-column layout: scrolling gallery (left) + sticky sidebar (right)
  - 9-image gallery including macro shots, lifestyle, box shot, glove shot, finger shot, silk shot
  - Rounded tier selection pills with inverted selection state
  - "CLAIM YOURS" CTA button

- **Updated `products.js`** with complete CYPHER schema:
  - Three pricing tiers: Foundation ($4,400), Signature ($7,200), Heirloom ($10,800)
  - Tagline: "Drama on your finger."
  - Full gallery of 9 images
  - Specifications: Rhythm mesh band, dual emerald cabochons, 9-stone princess diamond cluster
  - Story/Craft/Closing copy sections

**CYPHER Gallery Images:**
| Image | Description |
|-------|-------------|
| Toronto hero | Ring with CN Tower skyline |
| Black angle | Close-up on black |
| Front white | Studio shot on white |
| Macro diamond | Princess-cut cluster detail |
| Macro emerald | Cabochon emeralds detail |
| Box shot | Ring in velvet jewelry box |
| Glove shot | Craftsman polishing |
| Finger shot | On-hand lifestyle |
| Ring silk | Ring on white silk fabric |

**CYPHER Shop Integration:**
- Added to CORE_PRODUCTS in `ShopDropPage.jsx`
- Displays in: gents-rings (`/shop?category=rings&audience=gentlemens-club`)
- Added to "The Collective" menu in `PhileonMenu.jsx`
- Card displays: CYPHER / Drama on your finger. / From $4,400 CAD
- Links to: `/products/cypher`

### Cinematic Strip Fix (Complete - December 28, 2025)
**Fixed click mapping and removed hover pause**

- Fixed ANNIE ROSE image URL (was using TOLA II's image)
- Fixed TOLA II image URL (corrected to rst0mhem_1000143383.png)
- Removed hover:pause CSS rule - strip now flows continuously
- All strip items verified with correct image→link mappings

**Verified Mappings:**
| Strip Item | Image | Navigates To |
|------------|-------|--------------|
| MONIKA COUTURE | xkfi3q1b_1000139956.jpg | /products/monika-couture |
| TOLA II | rst0mhem_1000143383.png | /products/tola-ii |
| GALATIANS 6:14 | qotxl9is_1000143699.webp | /products/galatians-614 |
| FORME CUFF | k7kbqg47_1000142846.png | /products/forme-cuff |
| LA MARVA | m7k7yxis_1000138213.jpg | /products/la-marva |
| PTP CUFF | n1f04383_1000140851.jpg | /products/ptp-cuff |
| ANNIE ROSE | vg64rc4i_1000139387.jpg | /products/annie-rose |
| RHYTHM MESH | nl2vulxg_1000143088.jpg | /products/rhythm-mesh-ring |
| BOUND | 4ujxm427_1000143869.png | /products/bound |

### Pricing Standardization (Complete - December 28, 2025)
**Single Source of Truth for All Product Pricing**

All product prices now pull from `/app/frontend/src/data/products.js` using `basePrice` property. This ensures pricing consistency across all pages.

**Updated Files:**
- `products.js` - Added `basePrice` to all products (13 total)
- `ShopDropPage.jsx` - Uses `formatPrice(products.X.basePrice)`
- `HomePage.jsx` - Uses dynamic prices from products.js
- `MonikaCoutureProduct.jsx` - Uses products.monikaCouture.pricing
- `StyleItWith.jsx` - Uses dynamic prices for related products

**Product Pages Updated:**
- `BoundPage.jsx` → products.bound.pricing
- `Galatians614Page.jsx` → products.galatians614.pricing
- `LaMarvaPage.jsx` → products.laMarva.pricing
- `AnnieRosePage.jsx` → products.annieRose.pricing
- `TolaIIPage.jsx` → products.tolaII.pricing
- `RhythmMeshRingPage.jsx` → products.rhythmMeshRing.pricing
- `TracePage.jsx` → products.trace.pricing
- `FormeCuffPage.jsx` → products.formeCuff.metalOptions
- `AlejandraHeelsPage.jsx` → products.alejandraHeels.pricing

**Key Base Prices (Source of Truth):**
| Product | basePrice | Currency |
|---------|-----------|----------|
| PTP Cuff | $1,050 | CAD |
| La Marva | $3,400 | USD |
| BOUND | $12,800 | CAD |
| Annie Rose | $6,400 | USD |
| Monika Couture | $1,400 | USD |
| Alejandra Heels | $1,250 | USD |
| Forme Cuff | $695 | CAD |
| Rosaria | $2,950 | CAD |
| Désir Corset | $5,995 | CAD |
| Rhythm Mesh | $1,450 | CAD |
| TOLA II | $5,200 | CAD |
| GALATIANS 6:14 | $3,800 | CAD |
| TRACE | $900 | CAD |
| APEX | $4,800 | CAD |
| HOMAGE | $1,400 | CAD |
| CYPHER | $4,400 | CAD |

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
- **Video Lightbox Modal** - Custom fullscreen video player with play button overlay on first gallery thumbnail
- Route: `/products/bound`
- File: `BoundPage.jsx`

### APEX — Sapphire Diamond Earrings (Complete - December 28, 2025)
- **Bespoke Editorial Product Page** - 6-section structured gallery layout
- **Hero Section**: Two model shots side-by-side (front + profile view)
- **Luxury Shot Section**: Two model close-ups showcasing earrings
- **Product Breakdown (3-column)**: Structure, Setting, Scale images with labels
- **Model Section**: Two additional model shots
- **Macro Detail Section**: Full-width product photo with reflection effect
- **Editorial Grid (3-column)**: Back view, front view, scale-in-hand shots
- **Product Info Section**: 
  - Copy: "From Egypt to Santorini. Places turned into pieces..."
  - Brand tagline: "Crafted with precision. Worn with intent."
- **Tier-based pricing system**:
  - Signature (Sterling Silver — Cubic Zirconia + Lab Sapphires): $4,800
  - Foundation (10K White Gold): $10,800
  - Core (14K White Gold) — MOST CHOSEN: $14,000
  - Heirloom (18K White Gold): $18,200+
- **Specifications grid**: Weight (8.5g/17g pair), Dimensions (35mm × 16mm), Diamonds (120 round pavé 1.0mm-1.2mm), Sapphires (4 blue per earring), Finish (High polish)
- Route: `/products/apex`
- File: `ApexPage.jsx`

### Currency Indicator (Complete - December 28, 2025)
- Added "All prices in CAD" notice to site footer in `PublicLayout.jsx`
- Consistent currency display across all product pages

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
- Mobile swipe interactions verification for BOUND and APEX galleries
- On-ear lifestyle images for earrings

### P2 (Medium Priority)
- Vault page real product drops (`/vault/drews-world`)
- Cross-selling logic between products

### P3 (Low Priority)
- Additional product pages
- Expand filtering options
- Performance optimization
- File cleanup/refactoring (BoundPage.jsx and ApexPage.jsx are >850 lines - consider extracting Lightbox and gallery section components)

## Known Issues
- None currently blocking

## Third-Party Integrations
- Stripe (checkout)
- Sonner (toast notifications)
