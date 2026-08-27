import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  generateSeo,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  applySeoHead,
} from '@/lib/seo';
import { resolveSeoForRoute } from '@/lib/seoProducts';

// ─────────────────────────────────────────────────────────────────────────────
// <RouteSeoInjector />
//
// Mounted once inside <BrowserRouter>. On every route change:
//   • extracts the correct SEO source record (authored → catalog → null)
//   • runs the generator
//   • injects <title>, meta, canonical, OG, Twitter and JSON-LD into <head>
//   • cleans up prior injections before re-injecting
//
// This provides catalog-wide SEO coverage without touching individual pages.
// Any per-page <ProductSeo /> mounted from Phase 1 still runs — it's just a
// component-level override that fires later in the effect order.
// ─────────────────────────────────────────────────────────────────────────────
export default function RouteSeoInjector() {
  const location = useLocation();
  useEffect(() => {
    const record = resolveSeoForRoute(location.pathname, location.search);
    if (!record) return undefined;

    const seo = generateSeo(record);
    const jsonLd = [];
    // Category pages only emit BreadcrumbList — no Product schema.
    if (record.type !== 'category') {
      jsonLd.push(buildProductJsonLd(record, seo));
    }
    jsonLd.push(buildBreadcrumbJsonLd(record));
    return applySeoHead(seo, jsonLd);
  }, [location.pathname, location.search]);
  return null;
}
