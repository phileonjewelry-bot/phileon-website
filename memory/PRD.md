# Phileon Jewelry Website - PRD

## Project Overview
Phileon is a luxury custom jewelry brand website with dark theme (black, gold, ivory), and premium features for bespoke jewelry.

## Implemented Features (Jan 2026)

### ✅ Live Metal Price Ticker (NEW - Iteration 3)
- Pinned at very top of every page (z-index 60)
- Shows 4 metals: **GOLD, SILVER, PLATINUM, PALLADIUM**
- **Smooth infinite horizontal scroll animation** (stock-ticker style)
- Percentage change with trend indicators (green up, red down)
- "Live" indicator with pulsing green dot
- Auto-updates every 30 seconds
- Mobile-first responsive design
- Backend endpoint: `/api/metal-prices`
- **Note: Uses simulated prices (MOCKED), not live market data**

### ✅ Logo & Favicon
- Logo in top-left header, clickable to home
- Premium sizing (48px height on desktop)
- Favicon set to logo.png
- Logo path: `/app/frontend/public/logo.png`

### ✅ Ring Try-On (MediaPipe) - MVP
- **Dedicated page at `/ring-try-on`**
- Also available on ring product detail pages
- Uses free MediaPipe Hands library (no paid API)
- Camera-based hand detection
- Ring overlay on selected finger (index, middle, ring, pinky)
- Adjustable ring size via slider
- Save photo functionality
- 3-step instructions with disclaimer

### ✅ Navigation
- Desktop: Shop, Custom Jewelry, About, Contact (minimal)
- Mobile: Hamburger menu with smooth animation
- Header transitions from transparent to solid black on scroll

### ✅ Homepage CTAs
- Primary CTA: "EXPLORE COLLECTIONS" - Solid gold button
- Secondary CTA: "BEGIN A CUSTOM PIECE" - Gold outline style (transparent bg with gold border)

### ✅ Core Pages
- Home with hero section
- Collections listing and detail
- Product detail with inquiry modal + Try-On
- Custom Design with 5-step inquiry form
- Ring Try-On (dedicated page)
- Process (step-by-step)
- About / Our Story
- Testimonials
- Contact with inquiry + consultation booking
- FAQ with categories
- Craftsmanship / Care Guide
- Privacy Policy
- Terms of Service

### ✅ Admin Panel (/admin)
- Dashboard with stats
- Collections CRUD
- Products CRUD (images/videos)
- Inquiries management
- Consultations management
- Testimonials CRUD
- FAQ CRUD
- Site Settings

## Tech Stack
- Frontend: React 19, Tailwind CSS, shadcn/ui, MediaPipe Hands
- Backend: FastAPI, MongoDB
- Design: Cormorant Garamond (serif headlines) + Montserrat (body), dark luxury theme
- Colors: Black (#0a0a0a), Gold (#c9a962), Ivory (#f5f2eb)

## Admin Credentials
- URL: /admin/login
- Username: admin
- Password: phileon2024

## API Endpoints
- `GET /api/` - Health check
- `GET /api/metal-prices` - Live metal prices ticker (MOCKED)
- `GET /api/collections` - Public collections
- `GET /api/products` - Public products
- `POST /api/inquiries` - Submit inquiry
- `POST /api/consultations` - Book consultation
- Admin endpoints at `/api/admin/*` (protected)

## Files Reference
- `/app/frontend/src/components/LiveMetalTicker.jsx` - Sliding metal ticker
- `/app/frontend/src/components/RingTryOn.jsx` - MediaPipe ring try-on
- `/app/frontend/src/pages/RingTryOnPage.jsx` - Dedicated try-on page
- `/app/frontend/src/components/layout/PublicLayout.jsx` - Main layout
- `/app/frontend/src/pages/HomePage.jsx` - Homepage
- `/app/backend/server.py` - All API endpoints

## What's MOCKED
- `/api/metal-prices` - Uses simulated prices with random fluctuations (±0.5%). In production, integrate with a real metals API like Metals.dev or GoldAPI.

## Next Steps / Backlog
1. Integrate live metal prices API (production)
2. Add sample collections and products via admin panel
3. Populate testimonials and FAQs
4. Configure contact email in settings
5. Add admin video upload functionality verification
6. SEO optimization

## Testing
- Backend: 17 tests (100% pass) - `/app/backend/tests/test_phileon_api.py`
- Test reports: `/app/test_reports/iteration_3.json`
