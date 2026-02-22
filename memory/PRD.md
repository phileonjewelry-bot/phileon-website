# Phileon Jewelry Website - PRD

## Original Problem Statement
Import the GitHub repository `phileonjewelry-bot/phileon-website` (branch: main) into the Emergent workspace. Set up so it runs in this environment. User then reported the header was not rendering correctly compared to their expected design.

## Architecture
- **Frontend**: React (CRA + Craco) with Tailwind CSS, shadcn/ui, Stripe, Three.js (3D try-on)
- **Backend**: FastAPI (Python) with Motor (async MongoDB driver)
- **Database**: MongoDB
- **Integrations**: Stripe (payments), SendGrid (email), Live metal prices (simulated)

## Core Features
- Jewelry e-commerce storefront with collections & products
- Live metal price ticker (Gold, Silver, Platinum, Palladium)
- Virtual try-on (photo, 3D, AR)
- Shopping cart & Stripe checkout
- Wishlist functionality
- Admin dashboard (collections, products, inquiries, consultations, testimonials, FAQ, settings)
- Customer authentication (register, login, password reset, email verification)
- Inventory management with low-stock alerts
- Custom jewelry design wizard
- Secret/limited drop pages

## What's Been Implemented
- [2026-02-21] Repository imported from GitHub and set up in Emergent environment
- [2026-02-21] Fixed header rendering issues:
  - Added missing logo image to header `ph-left` section
  - Imported missing `phileon-header.css` in PublicLayout.jsx
  - Set header `top: 36px` to sit below fixed ticker
  - Hidden heart/cart icons on mobile (`ph-desktop-only` class)
- [2026-02-21] Fixed PHILEON text / hamburger menu overlap on mobile:
  - Switched from absolute centering to CSS grid layout (`grid-template-columns: auto 1fr auto`)
  - Added `gap: 16px` between grid columns
  - Responsive brand text: 22px/0.35em (desktop), 18px/0.25em (mobile)
  - Moved inline styles to `.ph-brand-text` CSS class for responsive control
  - Header height increased to 80px, background opacity to 0.92
  - Hamburger icon enlarged (28px wide, 2.5px thick lines)
- Backend running on port 8001 (FastAPI) - 100% tests pass
- Frontend running on port 3000 (React/Craco) - 100% tests pass

## Testing Results (Iteration 4)
- Backend: 100% (21/21 tests)
- Frontend: 95% (1 minor LOW-priority overlay issue with menu close button - pre-existing)

## Next Action Items
- Seed database with sample data if needed
- Configure Stripe keys, SendGrid keys for full integration testing
- User to review and request additional changes/improvements

## Backlog
- P2: Fix PhileonMenu close button overlay timing issue
- P2: Seed database with product catalog data
- P3: Configure email integrations (SendGrid)
- P3: Set up Stripe with real/test keys
