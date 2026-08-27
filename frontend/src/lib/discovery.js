// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Product Discovery Classification (Phase 4).
//
// Sits OUTSIDE the commerce catalog. Never touches /data/products.js. Never
// touches Stripe, live-metal pricing, SKU generation or cart snapshots.
//
// discovery: {
//   audience:       string[]  // ['men','women','unisex','inspiration-vault']
//   categories:     string[]  // ['rings','pendants','earrings','sets','bangles']
//   styles:         string[]  // ['statement','signet','pave','bow','minimal']
//   materials:      string[]  // ['gold','white-gold','rose-gold','silver','vermeil']
//   stones:         string[]  // ['diamond','ruby','peridot','opal','emerald']
//   searchIntents:  string[]  // ['mens-rings','statement-rings',...]
// }
//
// Two data paths:
//   1. `DISCOVERY_MAP[slug]` — hand-curated overrides (manual curation wins).
//   2. `autoClassify(product)` — best-effort inference from the commerce
//      catalog's existing audience / category / materialLine fields.
//
// Merged shape returned by `getDiscovery(slug)` = auto ∪ overrides.
// Never invents unisex, gender, provenance, stone facts or ratings.
// ─────────────────────────────────────────────────────────────────────────────

import { catalogProducts } from '@/data/products';

// Manual curation — used when auto-classification is insufficient or wrong.
export const DISCOVERY_MAP = {
  drape: {
    styles: ['statement', 'corset-inspired', 'diamond'],
    materials: ['white-gold'],
    stones: ['diamond'],
    searchIntents: ['pendants', 'fine-jewelry', 'womens-rings-pendants', 'gold-jewelry'],
  },
  'prise-de-couronne': {
    styles: ['statement', 'crown', 'pave'],
    materials: ['black-gold', 'white-gold'],
    stones: ['diamond'],
    searchIntents: ['mens-rings', 'mens-jewelry', 'statement-rings', 'fine-jewelry'],
  },
  'bajan-joe': {
    styles: ['signet', 'reptile-textured'],
    materials: ['yellow-gold'],
    searchIntents: ['mens-rings', 'mens-jewelry', 'statement-rings', 'fine-jewelry', 'gold-jewelry'],
  },
  'ribbon-regale-edition': {
    styles: ['ribbon', 'bow', 'diamond', 'statement'],
    materials: ['white-gold'],
    stones: ['diamond'],
    searchIntents: ['womens-rings', 'statement-rings', 'fine-jewelry', 'gold-jewelry'],
  },
  'quadriga-dominus': {
    styles: ['statement', 'colorway', 'pave'],
    materials: ['gold'],
    stones: ['ruby', 'diamond', 'onyx', 'emerald'],
    searchIntents: ['mens-rings', 'mens-jewelry', 'statement-rings', 'fine-jewelry'],
  },
  gravite: {
    styles: ['statement', 'pave', 'heart', 'peridot'],
    materials: ['rose-gold'],
    stones: ['peridot', 'diamond'],
    searchIntents: ['womens-rings', 'statement-rings', 'fine-jewelry'],
    // Non-purchasable/placeholder — still exposed to search filters but with
    // the noindex flag from Phase 2 SEO.
  },
  'rouge-siren': {
    styles: ['set', 'ruby', 'pave', 'statement'],
    materials: ['gold'],
    stones: ['ruby', 'diamond'],
    searchIntents: ['womens-rings', 'earrings', 'anklets', 'statement-rings', 'fine-jewelry'],
  },
  'her-eternal-reign': {
    styles: ['engagement', 'diamond', 'statement'],
    materials: ['white-gold'],
    stones: ['diamond'],
    searchIntents: ['womens-rings', 'statement-rings', 'fine-jewelry', 'gold-jewelry'],
  },
  'cresta-nera': {
    styles: ['statement', 'black-gold', 'architectural'],
    materials: ['black-gold'],
    searchIntents: ['mens-rings', 'mens-jewelry', 'statement-rings', 'fine-jewelry'],
  },
  voluta: {
    styles: ['architectural', 'statement'],
    materials: ['gold'],
    searchIntents: ['womens-rings', 'statement-rings', 'fine-jewelry'],
  },
  'scacco-matto': {
    styles: ['chessboard', 'statement'],
    materials: ['gold'],
    searchIntents: ['statement-rings', 'fine-jewelry', 'gold-jewelry'],
  },
};

// Search-intent surface → human-facing collection labels.
// Any surface not in this map falls back to a title-case slug.
export const SEARCH_INTENTS = {
  'mens-rings': "Men's Rings",
  'womens-rings': "Women's Rings",
  pendants: 'Pendants',
  earrings: 'Earrings',
  'fine-jewelry': 'Fine Jewelry',
  'mens-jewelry': "Men's Jewelry",
  'statement-rings': 'Statement Rings',
  'lab-grown-diamond-jewelry': 'Lab-Grown Diamond Jewelry',
  'gold-jewelry': 'Gold Jewelry',
  anklets: 'Anklets',
};

// ─── Auto-classifier — reads existing catalog fields safely ─────────────────
const has = (arr, key) => (Array.isArray(arr) ? arr.includes(key) : arr === key);
const materialText = (p) => (p.materialLine || '').toLowerCase();

function autoClassify(product) {
  const out = {
    audience: [],
    categories: [],
    styles: [],
    materials: [],
    stones: [],
    searchIntents: [],
  };
  const audience = product.audience;
  const category = product.category;
  const mtl = materialText(product);

  // Audience
  if (has(audience, 'gents') || has(audience, 'gentlemens-club')) out.audience.push('men');
  if (has(audience, 'ladies')) out.audience.push('women');
  if (has(audience, 'inspiration-vault')) out.audience.push('inspiration-vault');

  // Categories
  ['rings','pendants','earrings','anklets','sets','bangles','bracelets','chains','necklaces'].forEach((c) => {
    if (has(category, c)) out.categories.push(c);
  });

  // Materials — inferred from `materialLine` string only. No invention.
  if (/rose gold/.test(mtl)) out.materials.push('rose-gold');
  if (/white gold/.test(mtl)) out.materials.push('white-gold');
  if (/yellow gold/.test(mtl)) out.materials.push('yellow-gold');
  if (/\bgold\b/.test(mtl) && out.materials.length === 0) out.materials.push('gold');
  if (/black.*(gold|rhodium)/.test(mtl)) out.materials.push('black-gold');
  if (/vermeil/.test(mtl)) out.materials.push('vermeil');
  if (/sterling silver|silver/.test(mtl)) out.materials.push('silver');
  if (/platinum/.test(mtl)) out.materials.push('platinum');
  if (/lab[\s-]*grown/.test(mtl)) out.materials.push('lab-grown');

  // Search intents — layered on top.
  if (out.audience.includes('men') && has(category, 'rings')) out.searchIntents.push('mens-rings','mens-jewelry','statement-rings');
  if (out.audience.includes('women') && has(category, 'rings')) out.searchIntents.push('womens-rings','statement-rings');
  if (has(category, 'pendants')) out.searchIntents.push('pendants');
  if (has(category, 'earrings')) out.searchIntents.push('earrings');
  if (has(category, 'anklets')) out.searchIntents.push('anklets');
  if (has(audience, 'fine-jewelry')) out.searchIntents.push('fine-jewelry');
  if (out.materials.some((m) => m.includes('gold'))) out.searchIntents.push('gold-jewelry');
  if (out.materials.includes('lab-grown')) out.searchIntents.push('lab-grown-diamond-jewelry');

  // Rings default to statement-rings surface since every PHILEON ring is a
  // statement design — but only when we have no explicit override.
  if (has(category, 'rings') && !out.searchIntents.includes('statement-rings')) {
    out.searchIntents.push('statement-rings');
  }

  return out;
}

function mergeDiscovery(auto, manual = {}) {
  const merged = { ...auto };
  Object.keys(manual).forEach((k) => {
    if (Array.isArray(manual[k])) {
      merged[k] = Array.from(new Set([...(merged[k] || []), ...manual[k]]));
    } else if (manual[k] != null) {
      merged[k] = manual[k];
    }
  });
  return merged;
}

// ─── Public API ─────────────────────────────────────────────────────────────
export function getDiscovery(slugOrProduct) {
  const product = typeof slugOrProduct === 'string'
    ? catalogProducts.find((p) => p.slug === slugOrProduct)
    : slugOrProduct;
  if (!product) return null;
  const auto = autoClassify(product);
  const manual = DISCOVERY_MAP[product.slug] || {};
  return mergeDiscovery(auto, manual);
}

// Return every public catalog product whose merged discovery layer contains
// the given search intent. Skips placeholders and non-purchasable pieces.
export function productsForSearchIntent(intent) {
  return catalogProducts
    .filter((p) => p.status !== 'placeholder' && p.purchasable !== false)
    .map((p) => ({ product: p, discovery: getDiscovery(p) }))
    .filter(({ discovery }) => discovery && discovery.searchIntents.includes(intent))
    .map(({ product }) => product);
}

// Return every product's search intents — used by the Merchant Center feed
// generator to fill `product_type` breadcrumbs.
export function allDiscoveryIndex() {
  return catalogProducts
    .filter((p) => p.status !== 'placeholder' && p.purchasable !== false)
    .reduce((acc, p) => {
      acc[p.slug] = getDiscovery(p);
      return acc;
    }, {});
}
