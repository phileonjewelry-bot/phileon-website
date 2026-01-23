# Phileon Jewelry Website - PRD

## Project Overview
Phileon is a luxury custom jewelry brand website with dark theme, gold accents, and premium features.

## Implemented Features (Jan 2026)

### ✅ Live Gold Price Ticker
- Pinned at top of every page (z-index 60)
- Shows real-time GOLD, SILVER, PLATINUM prices
- Percentage change with trend indicators (green up, red down)
- "Live" indicator with pulsing green dot
- Updates every 60 seconds

### ✅ Ring Try-On with MediaPipe Hands
- Uses free MediaPipe Hands library (no paid API)
- Camera-based hand detection
- Ring overlay on selected finger (index, middle, ring, pinky)
- Adjustable ring size via slider
- Save photo functionality
- Available on ring product detail pages

### ✅ Logo in Header
- Left side of header, clickable to home
- Falls back to "PHILEON" text if logo.png not found
- Place logo at: `/app/frontend/public/logo.png`

### Core Pages
- Home with hero section
- Collections listing and detail
- Product detail with inquiry modal
- Custom Design with inquiry form
- Process (step-by-step)
- About / Our Story
- Testimonials
- Contact with inquiry + consultation booking
- FAQ with categories
- Craftsmanship / Care Guide

### Admin Panel (/admin)
- Dashboard with stats
- Collections CRUD
- Products CRUD
- Inquiries management
- Consultations management
- Testimonials CRUD
- FAQ CRUD
- Site Settings

## Tech Stack
- Frontend: React 19, Tailwind CSS, shadcn/ui, MediaPipe
- Backend: FastAPI, MongoDB
- Design: Cormorant Garamond + Montserrat fonts, dark luxury theme

## Admin Credentials
- URL: /admin/login
- Username: admin
- Password: phileon2024

## To Add Your Logo
1. Upload your logo image (PNG/SVG preferred)
2. Place it at: `/app/frontend/public/logo.png`
3. Recommended size: 150-200px wide, transparent background

## Next Steps
- Upload logo image
- Add sample collections and products via admin panel
- Populate testimonials and FAQs
- Configure contact email in settings
