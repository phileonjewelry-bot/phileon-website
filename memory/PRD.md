# Phileon Jewelry Website - PRD

## Original Problem Statement
Import the GitHub repository `phileonjewelry-bot/phileon-website` (branch: main) into the Emergent workspace. Set up so it runs in this environment. Do not modify code — import only.

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
- Backend running on port 8001 (FastAPI)
- Frontend running on port 3000 (React/Craco)
- All dependencies installed
- Both services running successfully via Supervisor

## Next Action Items
- User to review the imported codebase and request any changes/improvements
- Seed database with sample data if needed (`populate_sample_data.py` or `populate_db.py` available)
- Configure Stripe keys, SendGrid keys, etc. for full integration testing
