// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Site Search v1 (client-side, ranked, synonym-aware).
//
// No external service. Indexes:
//   • catalogProducts (name, materialLine, subtitle, category, audience)
//   • discovery layer (styles, materials, stones, searchIntents, designInfluence)
//   • authored SEO product types
//   • collection landings (SEARCH_INTENTS)
//   • brand-discovery landings (BRAND_SEARCH_INTENTS)
// Skips placeholder / non-purchasable products.
// ─────────────────────────────────────────────────────────────────────────────

import { catalogProducts } from '@/data/products';
import {
  getDiscovery,
  SEARCH_INTENTS,
  BRAND_SEARCH_INTENTS,
  resolveBrandSearchIntent,
} from '@/lib/discovery';
import { SEO_REGISTRY } from '@/lib/seoProducts';

// Controlled synonym layer. Each key → array of accepted alternates.
export const SYNONYMS = {
  "men's": ['mens', 'men', 'gentleman', 'gents', 'gentlemens', 'guys'],
  "women's": ['womens', 'women', 'ladies', 'lady', 'her'],
  'lab-grown diamond': ['lab diamond', 'lab-grown', 'lab grown', 'lgd'],
  'rose gold': ['pink gold'],
  pendant: ['necklace pendant', 'pendants'],
  earrings: ['earring', 'studs', 'drops'],
  ring: ['rings'],
  'black-owned': ['black owned', 'black-owned', 'blackowned'],
  caribbean: ['west indian', 'west-indian', 'west indies'],
  bajan: ['barbadian', 'barbados'],
  european: ['europe', 'european-inspired'],
  canadian: ['canada', 'canadian-made', 'made in canada'],
  black: ['dark', 'onyx'],
  ruby: ['red stone'],
  peridot: ['green stone', 'lime stone'],
  diamond: ['diamonds', 'brilliant'],
};

// Expand a raw query into a set of normalized tokens, applying synonyms both
// directions so "mens ring" matches an indexed "Men's Ring".
export function expandQuery(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = new Set([q]);
  q.split(/\s+/).forEach((t) => tokens.add(t));
  for (const [canonical, alts] of Object.entries(SYNONYMS)) {
    const all = [canonical, ...alts];
    for (const term of all) {
      if (q.includes(term)) all.forEach((t) => tokens.add(t));
    }
  }
  return [...tokens];
}

// Build a stable haystack for one product covering every searchable field.
function buildHaystack(p) {
  const d = getDiscovery(p) || {};
  const seo = SEO_REGISTRY[p.slug];
  const parts = [
    p.name, p.subtitle, p.materialLine,
    Array.isArray(p.category) ? p.category.join(' ') : p.category,
    Array.isArray(p.audience) ? p.audience.join(' ') : p.audience,
    (d.styles || []).join(' '),
    (d.materials || []).join(' '),
    (d.stones || []).join(' '),
    (d.searchIntents || []).join(' '),
    (d.designInfluence?.aesthetics || []).join(' '),
    (d.designInfluence?.cultures || []).join(' '),
    (d.designInfluence?.regions || []).join(' '),
    seo?.productType || '',
    (seo?.seo?.keywords || []).join(' '),
  ];
  return parts.filter(Boolean).join(' · ').toLowerCase();
}

// Ranked search. Higher score = better match.
//   +100  exact product-name match
//   +60   category / style exact
//   +40   authored search-intent match
//   +30   material / stone match
//   +20   audience / brand-identity match
//   +5    fuzzy substring in haystack
export function searchProducts(query, { limit = 12 } = {}) {
  const tokens = expandQuery(query);
  if (tokens.length === 0) return [];
  const pool = catalogProducts.filter(
    (p) => p.status !== 'placeholder' && p.purchasable !== false,
  );

  const results = pool
    .map((p) => {
      const name = (p.name || '').toLowerCase();
      const haystack = buildHaystack(p);
      const d = getDiscovery(p) || {};
      let score = 0;
      for (const t of tokens) {
        if (!t) continue;
        if (name === t) score += 100;
        else if (name.includes(t)) score += 30;
        if ((d.categories || []).includes(t) || (d.styles || []).includes(t)) score += 60;
        if ((d.searchIntents || []).includes(t)) score += 40;
        if ((d.materials || []).some((m) => m.includes(t) || t.includes(m))) score += 30;
        if ((d.stones || []).some((s) => s.includes(t) || t.includes(s))) score += 30;
        if ((d.audience || []).includes(t)) score += 20;
        if (haystack.includes(t)) score += 5;
      }
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => ({
      kind: 'product',
      slug: r.product.slug,
      name: r.product.name,
      href: r.product.href || `/products/${r.product.slug}`,
      image: r.product.imageUrl,
      subtitle: r.product.subtitle || r.product.materialLine,
      price: r.product.price_range,
      score: r.score,
    }));

  return results;
}

// Also surface collection + brand-discovery pages when they clearly match.
export function searchPages(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const out = [];
  for (const [intent, label] of Object.entries(SEARCH_INTENTS)) {
    if (intent.replace(/-/g, ' ').includes(q) || q.includes(intent.replace(/-/g, ' '))) {
      out.push({ kind: 'collection', name: label, href: `/${intent}`, subtitle: 'PHILEON Collection' });
    }
  }
  const brand = resolveBrandSearchIntent(q);
  if (brand) {
    out.push({
      kind: 'brand',
      name: brand.intent === 'custom-jewelry-canada' ? 'Custom Jewelry' : 'Black-Owned Canadian Jewelry',
      href: brand.canonicalPath,
      subtitle: 'PHILEON',
    });
  }
  // Dedup by href
  const seen = new Set();
  return out.filter((r) => (seen.has(r.href) ? false : seen.add(r.href)));
}

export function search(query, opts) {
  return { pages: searchPages(query), products: searchProducts(query, opts) };
}

// ─── Local search analytics (privacy-safe) ──────────────────────────────────
// Stores {query, results, clicked, ts} in localStorage under a rolling key.
// No PII. No external analytics vendor. Owner can inspect via DevTools or
// future admin view. Capped at 200 entries.
const ANALYTICS_KEY = 'phileon:search:analytics:v1';

export function logSearch({ query, resultCount }) {
  if (typeof window === 'undefined') return;
  try {
    const list = JSON.parse(window.localStorage.getItem(ANALYTICS_KEY) || '[]');
    list.push({ q: query, n: resultCount, ts: Date.now(), zero: resultCount === 0 });
    window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(list.slice(-200)));
  } catch (_e) { /* noop */ }
}

export function logSearchClick({ query, href }) {
  if (typeof window === 'undefined') return;
  try {
    const list = JSON.parse(window.localStorage.getItem(ANALYTICS_KEY) || '[]');
    const last = list[list.length - 1];
    if (last && last.q === query) last.clicked = href;
    window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(list.slice(-200)));
  } catch (_e) { /* noop */ }
}
