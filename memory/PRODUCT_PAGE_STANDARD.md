# PHILEON — Product Page Standard

> **Source of truth** for every NEW product page added to the site. Reference page: `CouronnePage.jsx` (PRISE DE COURONNE).

## Required page order

1. **Hero** — image or video, full-bleed (typical: `h-[92vh]`)
2. **PHILEON title block** — small uppercase eyebrow ("PHILEON") + serif product name + optional small uppercase translation line + italic tagline. Either overlaid on hero OR in a separate centered block below — whichever fits the piece's tone.
3. **Editorial sections** in this exact order:
   - `COMPOSITION` — bulleted material spec
   - `DETAIL` — italic prose blocks (the *what*)
   - `CRAFT` — italic prose blocks (the *how*)
   - `FINAL WORD` — closing statement (slightly larger italic)
4. **Gallery** — bespoke gallery component for the piece (thumbnails + main viewer)
5. **Lifestyle / motion section** — only if strong asset is available; skip otherwise
6. **Specifications image** — only if a diagram is available; skip otherwise
7. **Purchase block** — tier selection, size selection (if applicable), Add to Bag with live price
8. **Market note / trust line** — "Price adjusts automatically with the live precious metals market." + "Made to order • 3–4 weeks • Complimentary insured shipping within Canada."

## Rules

- **Do not** force all products into a single shared component (yet). Each new piece is its own bespoke page.
- **Do not** rewrite existing pages unless the user explicitly requests it.
- Keep the rhythm consistent (`border-t border-white/[0.04]` separators, dark `bg-black` palette, Playfair Display serif, small `tracking-[0.4em]` eyebrow labels).
- Each piece keeps its own voice in the editorial copy. Voice keys:
  - **Prise de Couronne** = dominance
  - **La Marva** = structure
  - **Annie Rose** = refinement
  - **Le Cocktail de Jessica** = expression
  - **DRAPE** = couture object
- Hero media must match the piece's character (close-up macro for jewelry-first, lifestyle for editorial pieces). Do not apply a universal style.
- Purchase logic remains product-specific (tiers, sizing, single-SKU vs. multi-tier — driven by `products.js`, `livePricingConfig.js`, `pricing_engine.py`).

## Live pricing wiring checklist (every NEW tier requires all three)

1. `/app/frontend/src/data/products.js` → `pricing` map + `tiers` config
2. `/app/frontend/src/data/livePricingConfig.js` → locked base + metal reference
3. `/app/backend/pricing_engine.py` → mirror of above for cart validation

## Asset rules

- All `<video>` elements MUST include `autoPlay`, `muted`, `loop`, `playsInline`, `preload="auto"`, `poster={...}`, and an `onEnded` JS fallback (resets `currentTime` and re-`play()`) so loop is gapless across browsers.
- Posters prevent black frames in headless tools / slow connections.
- No `controls` attribute — keep video controls-free for luxury feel.
- Local `/videos/*.mp4` and `/images/*-hero-poster.jpg` paths only work if the file is uploaded to `/app/frontend/public/`. When the user provides assets via the artifact uploader, use the public artifact URL directly.

## Reference

- Canonical page: `/app/frontend/src/pages/CouronnePage.jsx`
- This standard applies to every NEW product page added to the site.
