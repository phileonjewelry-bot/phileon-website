import { useEffect } from 'react';
import {
  generateSeo,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  applySeoHead,
} from '@/lib/seo';

// ─────────────────────────────────────────────────────────────────────────────
// <ProductSeo product={product} overrides={{...}} />
//
// Drop-in component that injects title, meta description, canonical, Open
// Graph, Twitter Card, JSON-LD Product schema and JSON-LD BreadcrumbList
// schema into <head> for the lifetime of the mounted product page.
//
// This does NOT touch any visible copy. Editorial voice is preserved.
// Renders nothing.
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductSeo({ product, overrides }) {
  useEffect(() => {
    if (!product) return undefined;
    const seo = generateSeo(product, overrides || {});
    const jsonLd = [
      buildProductJsonLd(product, seo),
      buildBreadcrumbJsonLd(product),
    ];
    return applySeoHead(seo, jsonLd);
  }, [product, overrides]);
  return null;
}
