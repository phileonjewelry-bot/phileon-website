import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { products, catalogProducts } from '@/data/products';
import FineJewelryConfidence from '@/components/FineJewelryConfidence';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — PDP Concierge footer injection (Phase 10.2 Part B).
//
// Sitewide rollout of the "Ask PHILEON" Concierge CTA. Renders the
// FineJewelryConfidence block (with the Concierge button embedded) at the
// bottom of every eligible Fine Jewelry PDP.
//
// Eligibility (data-driven — no per-page edits):
//   INCLUDED  · path matches /products/:slug AND slug resolves to a real
//               product entry in /data/products.js.
//   EXCLUDED  · product has `purchasable: false` (placeholders like GRAVITÉ,
//               TWO-FINGER RING, ROUGE SIREN) or `status: 'placeholder'`.
//   EXCLUDED  · path is on the manual-pilot list below (pages that already
//               render FineJewelryConfidence inline — prevents duplicate
//               injection).
//
// If we don't have a product for the slug we render nothing — the surface
// falls back to the site's existing Contact / Custom Assistance surfaces.
// ─────────────────────────────────────────────────────────────────────────────

// Pages that still render FineJewelryConfidence inline. The layout must
// NOT inject a second copy on these routes. Kept small on purpose — every
// other page is covered by the layout injection.
const INLINE_PILOT_PATHS = new Set([
  '/custom-jewelry-canada',
]);

function slugFromPath(pathname) {
  const m = pathname.match(/^\/products\/([a-z0-9-]+)\/?$/i);
  return m ? m[1].toLowerCase() : null;
}

// Build a single { slug → product } lookup from both data sources.
function buildProductIndex() {
  const idx = new Map();
  for (const p of Object.values(products || {})) {
    if (p && typeof p.slug === 'string') idx.set(p.slug.toLowerCase(), p);
  }
  for (const p of catalogProducts || []) {
    if (p && typeof p.slug === 'string' && !idx.has(p.slug.toLowerCase())) {
      idx.set(p.slug.toLowerCase(), p);
    }
  }
  return idx;
}

const PRODUCT_INDEX = buildProductIndex();

function isExcluded(product) {
  if (!product) return true;
  if (product.purchasable === false) return true;
  if (product.status === 'placeholder') return true;
  return false;
}

export default function PhileonPdpFooter() {
  const { pathname } = useLocation();

  const productContext = useMemo(() => {
    if (INLINE_PILOT_PATHS.has(pathname)) return null;
    const slug = slugFromPath(pathname);
    if (!slug) return null;
    const product = PRODUCT_INDEX.get(slug);
    if (isExcluded(product)) return null;
    return {
      name: product.name || slug.toUpperCase(),
      slug,
      url: `/products/${slug}`,
      imageUrl: product.imageUrl || product.image || null,
    };
  }, [pathname]);

  if (!productContext) return null;

  return (
    <div
      style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 56px' }}
      data-testid={`pdp-footer-${productContext.slug}`}
    >
      <FineJewelryConfidence
        testId={`pdp-${productContext.slug}-confidence`}
        productContext={productContext}
      />
    </div>
  );
}
