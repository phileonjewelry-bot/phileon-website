// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — SEO product & category registry (Phase 2).
//
// This module is the search-facing overlay. It never touches commerce logic.
// Commerce is authoritative in /data/products.js; that catalog is imported
// here and consulted as the auto-fallback data source.
//
//   1. AUTHORED_REGISTRY  — hand-tuned SEO for the highest-value products.
//                          Manual overrides always win over auto-generation.
//   2. CATEGORY_SEO       — SEO for major category / collection landing pages.
//   3. resolveSeoForRoute — accepts a pathname, returns the correct SEO source
//                          product record (authored → catalog → null).
// ─────────────────────────────────────────────────────────────────────────────

import { catalogProducts } from '@/data/products';
import { VAULT_PIECES } from '@/pages/InspirationVaultPage';

// ─── Authored high-signal SEO records ───────────────────────────────────────
// Each entry uses the shape consumed by `generateSeo()` in /lib/seo.js.
// `seo:{}` fields are hard overrides; everything else may be augmented by the
// auto-generator with values from the commerce catalog.

export const DRAPE_SEO = {
  slug: 'drape', name: 'DRAPE',
  productType: 'Diamond Statement Pendant',
  category: 'pendants', audience: ['ladies', 'fine-jewelry'],
  material: '10K / 14K White Gold with Diamonds',
  href: '/products/drape',
  description: 'Corset-inspired luxury diamond pendant translating tension and drape into precious metal.',
  seo: {
    keywords: ['diamond pendant','statement pendant','luxury pendant','corset pendant','dress inspired jewelry','PHILEON jewelry'],
  },
};

export const PRISE_DE_COURONNE_SEO = {
  slug: 'prise-de-couronne', name: 'PRISE DE COURONNE',
  productType: 'Black Gold Diamond Statement Ring',
  category: 'rings', audience: ['gents', 'fine-jewelry'],
  material: 'Black Rhodium 10K White Gold with White Diamonds', color: 'Black',
  href: '/products/prise-de-couronne',
  description: "A crown taken — men's black gold statement ring with pavé white diamonds arranged in a claimed-crown architecture.",
  seo: {
    keywords: ['black gold diamond ring',"men's black diamond ring",'luxury statement ring','black diamond jewelry',"designer men's ring"],
  },
};

export const BAJAN_JOE_SEO = {
  slug: 'bajan-joe', name: 'BAJAN JOE',
  productType: "Men's Luxury Signet Ring",
  category: 'rings', audience: ['gents', 'fine-jewelry'],
  material: '10K / 14K Yellow Gold with Reptile-Textured Shoulders',
  href: '/products/bajan-joe',
  description: "Signet architecture with reptile-engraved shoulders — PHILEON men's statement ring built for arrival.",
  seo: {
    keywords: ["men's statement ring","luxury men's ring","wide men's ring","designer men's jewelry",'signet ring'],
  },
};

export const RIBBON_REGALE_EDITION_SEO = {
  slug: 'ribbon-regale-edition', name: 'RIBBON REGALE ÉDITION',
  productType: 'Diamond Ribbon Statement Ring',
  category: 'rings', audience: ['ladies', 'fine-jewelry'],
  material: '10K / 14K White Gold with Diamonds',
  href: '/fine-jewelry/ribbon-regale-edition',
  description: 'A ribbon rendered in white gold and diamonds — architectural bow ring with tension-set diamond passages.',
  seo: {
    keywords: ['diamond ribbon ring','bow ring','luxury white gold ring','statement ring','PHILEON ribbon regale'],
  },
};

export const QUADRIGA_DOMINUS_SEO = {
  slug: 'quadriga-dominus', name: 'QUADRIGA DOMINUS',
  productType: "Men's Luxury Statement Ring",
  category: 'rings', audience: ['gents', 'fine-jewelry'],
  material: '10K / 14K Gold with Ruby, Black, Green and White Stones',
  href: '/products/quadriga-dominus',
  description: "Four-colorway men's statement ring — Red/Black, Black/Red, Green/Black, Black/Green. Substantial gold band, mixed-stone pavé.",
  seo: {
    keywords: ["men's statement ring",'quadriga','colorway ring',"ruby men's ring","designer men's jewelry"],
  },
};

export const GOLDEN_HOUR_CUFFS_SEO = {
  slug: 'golden-hour-cuffs', name: 'GOLDEN HOUR CUFFS',
  productType: 'Dubai-Style Gold Vermeil Cuff Set',
  category: 'bangles', audience: ['inspiration-vault'],
  material: 'Gold Vermeil',
  href: '/inspiration-vault/golden-hour-cuffs',
  priceAmount: 90, priceCurrency: 'USD', availability: 'InStock', sku: 'IV-GHC-CUFF',
  description: 'Dubai-style stacked cuff set in gold vermeil — ornate filigree and sculpted wave architecture from the PHILEON Inspiration Vault.',
  seo: {
    keywords: ['gold vermeil cuffs','dubai style cuffs','stacked bangles','filigree cuff','inspiration vault','PHILEON cuffs'],
  },
};

// Additional authored entries — kept concise; auto-generator fills anything
// not overridden. Uses only real catalog data (materials, categories, prices
// stay authoritative in /data/products.js).
export const CRESTA_NERA_SEO = {
  slug: 'cresta-nera', name: 'CRESTA NERA', productType: "Men's Luxury Black Gold Ring",
  category: 'rings', audience: ['gents', 'fine-jewelry'],
  href: '/products/cresta-nera',
  seo: { keywords: ["men's black ring","black gold ring","luxury men's ring","designer men's jewelry"] },
};

export const ROUGE_SIREN_SEO = {
  slug: 'rouge-siren', name: 'ROUGE SIREN', productType: "Women's Luxury Ruby Set",
  category: 'sets', audience: ['ladies', 'fine-jewelry'],
  href: '/fine-jewelry/rouge-siren',
  seo: { keywords: ['ruby jewelry set','luxury ruby set','statement ruby jewelry','designer ruby set','PHILEON rouge siren'] },
};

export const HER_ETERNAL_REIGN_SEO = {
  slug: 'her-eternal-reign', name: 'H.E.R. ETERNAL REIGN', productType: "Women's Luxury Diamond Ring",
  category: 'rings', audience: ['ladies', 'fine-jewelry'],
  href: '/fine-jewelry/her-eternal-reign',
  seo: { keywords: ["women's diamond ring",'luxury diamond ring','statement diamond ring','designer engagement ring','PHILEON H.E.R.'] },
};

export const VOLUTA_SEO = {
  slug: 'voluta', name: 'VOLUTA', productType: "Women's Luxury Statement Ring",
  category: 'rings', audience: ['ladies', 'fine-jewelry'],
  href: '/fine-jewelry/voluta',
  seo: { keywords: ["women's statement ring",'luxury ring','architectural ring','designer ring','PHILEON voluta'] },
};

export const SCACCO_MATTO_SEO = {
  slug: 'scacco-matto', name: 'SCACCO MATTO', productType: 'Luxury Chessboard Statement Ring',
  category: 'rings', audience: ['fine-jewelry'],
  href: '/fine-jewelry/scacco-matto',
  seo: { keywords: ['chessboard ring','luxury statement ring','designer ring','architectural ring','PHILEON scacco matto'] },
};

// ─── Registry (slug → authored record) ──────────────────────────────────────
export const SEO_REGISTRY = {
  drape: DRAPE_SEO,
  'prise-de-couronne': PRISE_DE_COURONNE_SEO,
  'bajan-joe': BAJAN_JOE_SEO,
  'ribbon-regale-edition': RIBBON_REGALE_EDITION_SEO,
  'quadriga-dominus': QUADRIGA_DOMINUS_SEO,
  'golden-hour-cuffs': GOLDEN_HOUR_CUFFS_SEO,
  'cresta-nera': CRESTA_NERA_SEO,
  'rouge-siren': ROUGE_SIREN_SEO,
  'her-eternal-reign': HER_ETERNAL_REIGN_SEO,
  voluta: VOLUTA_SEO,
  'scacco-matto': SCACCO_MATTO_SEO,
};

// ─── Category / collection landing SEO ──────────────────────────────────────
// The `type: 'category'` flag disables the Product JSON-LD emission (only
// BreadcrumbList is meaningful for a listing page). Absent pathname keys use
// the default site meta from index.html.

export const CATEGORY_SEO = {
  '/checkout': {
    type: 'category',
    name: 'Checkout',
    title: 'Checkout | PHILEON',
    description: 'Complete your PHILEON order securely.',
    href: '/checkout',
    seo: { index: false, follow: false },
  },
  '/checkout/success': {
    type: 'category',
    name: 'Order Received',
    title: 'Order Received | PHILEON',
    description: 'Thank you — your PHILEON order has been received.',
    href: '/checkout/success',
    seo: { index: false, follow: false },
  },
  '/checkout/cancel': {
    type: 'category',
    name: 'Checkout Cancelled',
    title: 'Checkout Cancelled | PHILEON',
    description: 'Your PHILEON checkout was cancelled — your cart is still saved.',
    href: '/checkout/cancel',
    seo: { index: false, follow: false },
  },
  '/shop': {
    type: 'category',
    name: 'Shop',
    title: 'Shop | PHILEON Fine Jewelry',
    description: 'Browse the full PHILEON catalog — fine jewelry, statement rings, pendants, earrings and Inspiration Vault releases.',
    href: '/shop',
    category: 'shop', audience: ['ladies'],
  },
  '/shop?collection=signature': {
    type: 'category',
    name: 'Fine Jewelry',
    title: 'Fine Jewelry | Statement Rings & Pendants | PHILEON',
    description: 'PHILEON Fine Jewelry — architectural statement rings, pendants and editorial releases in solid gold, white gold and rose gold.',
    href: '/shop?collection=signature',
    category: 'fine-jewelry', audience: ['fine-jewelry'],
  },
  '/shop?collection=collective': {
    type: 'category',
    name: 'The Collective',
    title: 'The Collective | Cross-Audience Editorial Pieces | PHILEON',
    description: 'The PHILEON Collective — cross-audience editorial pieces spanning fine jewelry, statement rings and pendants.',
    href: '/shop?collection=collective',
    category: 'collective',
  },
  '/shop?collection=editorial': {
    type: 'category',
    name: 'Editorial',
    title: 'Editorial | PHILEON Fine Jewelry',
    description: 'PHILEON Editorial — narrative-led jewelry releases from the atelier.',
    href: '/shop?collection=editorial',
    category: 'editorial',
  },
  '/inspiration-vault': {
    type: 'category',
    name: 'Inspiration Vault',
    title: 'Inspiration Vault | Editorial Jewelry Concepts | PHILEON',
    description: 'The PHILEON Inspiration Vault — editorial jewelry concepts and design studies. Non-fine-jewelry expressive pieces released in limited runs.',
    href: '/inspiration-vault',
    category: 'inspiration-vault', audience: ['inspiration-vault'],
  },
  '/atelier': {
    type: 'category', name: 'Atelier',
    title: 'The Atelier | Bespoke Design & Commissions | PHILEON',
    description: 'The PHILEON atelier — bespoke jewelry design, commissions, private consultations and made-to-order fine jewelry.',
    href: '/atelier',
  },
  '/craftsmanship': {
    type: 'category', name: 'Craftsmanship',
    title: 'Craftsmanship | Metalwork, Stones & Finishing | PHILEON',
    description: 'The PHILEON craftsmanship page — how each piece is designed, cast, stone-set and finished by hand in the atelier.',
    href: '/craftsmanship',
  },
  '/ring-size-guide': {
    type: 'category', name: 'Ring Size Guide',
    title: 'Ring Size Guide | Fit, Diameter & Circumference | PHILEON',
    description: 'PHILEON ring size guide — US ring sizes with diameter, circumference and fit guidance for statement rings and fine jewelry.',
    href: '/ring-size-guide',
  },
  '/': {
    type: 'category', name: 'Home',
    title: 'PHILEON | Black-Owned Canadian Fine Jewelry',
    description: 'PHILEON — Black-owned Canadian fine jewelry brand. Architectural statement rings, luxury pendants, custom design and editorial Inspiration Vault releases.',
    href: '/',
  },
};

// ─── Route → SEO resolver ───────────────────────────────────────────────────
// Extracts the product slug from any known route pattern and returns:
//   1. The authored SEO_REGISTRY entry if one exists.
//   2. Otherwise, the matching commerce catalog entry (auto-generator picks
//      up name / materialLine / category / audience / imageUrl / href /
//      subtitle / price_range / status).
//   3. Otherwise, null (falls through to the site-wide default meta).

const PRODUCT_ROUTE_PATTERNS = [
  /^\/products\/([a-z0-9\-]+)\/?$/i,
  /^\/inspiration-vault\/([a-z0-9\-]+)\/?$/i,
  /^\/fine-jewelry\/([a-z0-9\-]+)\/?$/i,
  /^\/ladies\/rings\/([a-z0-9\-]+)\/?$/i,
  /^\/gents\/rings\/([a-z0-9\-]+)\/?$/i,
  /^\/shop\/([a-z0-9\-]+)\/?$/i,
  /^\/([a-z0-9\-]+)\/?$/i, // vanity single-word aliases (last resort)
];

// Slugs excluded from vanity-alias matching (they'd steal SEO from the wrong
// page).
const VANITY_BLOCKLIST = new Set([
  'shop','ladies','gents','gentlemens-club','fine-jewelry','inspiration-vault',
  'about','contact','faq','privacy','terms','craftsmanship','atelier','wishlist',
  'checkout','cart','admin','drop','shop-drop','process','commission','custom',
  'custom-design','ring-try-on','size-guide','ring-size-guide','vault','drews-vault',
  'secret-drop','secretdrop','testimonials','collections','collections/chains-coming-soon',
  'tribute-series','homage','piece','katrina-cascata',
]);

function extractSlug(pathname) {
  for (const re of PRODUCT_ROUTE_PATTERNS) {
    const m = pathname.match(re);
    if (m) {
      const slug = m[1].toLowerCase();
      const isVanity = re === PRODUCT_ROUTE_PATTERNS[PRODUCT_ROUTE_PATTERNS.length - 1];
      if (isVanity && VANITY_BLOCKLIST.has(slug)) continue;
      return slug;
    }
  }
  return null;
}

// Map catalog fields (audience arrays, category arrays, materialLine) into the
// simpler shape the SEO generator wants.
function shapeFromCatalog(entry) {
  if (!entry) return null;
  const category = Array.isArray(entry.category) ? entry.category[0] : entry.category;
  return {
    slug: entry.slug,
    name: entry.name,
    href: entry.href,
    category,
    audience: entry.audience,
    material: entry.materialLine,
    image: entry.imageUrl,
    imageUrl: entry.imageUrl,
    subtitle: entry.subtitle,
    description: entry.description || entry.subtitle,
    price_range: entry.price_range,
    purchasable: entry.purchasable,
    status: entry.status,
    // Never propagate `price_range` as a numeric priceAmount — that field is
    // a marketing string ("FROM $4,395 USD") and would corrupt JSON-LD offers.
  };
}

export function resolveSeoForRoute(pathname, search = '') {
  if (!pathname) return null;
  const clean = pathname.replace(/\/$/, '') || '/';

  // 1. Category / collection landing pages (exact match, incl. query string).
  const withSearch = search ? `${clean}${search}` : clean;
  if (CATEGORY_SEO[withSearch]) return CATEGORY_SEO[withSearch];
  if (CATEGORY_SEO[clean]) return CATEGORY_SEO[clean];

  // 2. Product route → slug → authored or catalog.
  const slug = extractSlug(clean);
  if (!slug) return null;
  if (SEO_REGISTRY[slug]) return SEO_REGISTRY[slug];

  const catalog = catalogProducts.find((p) => p.slug === slug);
  if (catalog) return shapeFromCatalog(catalog);

  // Inspiration Vault piece — synthesize a minimal record from the vault
  // manifest. Vault pieces are non-fine-jewelry design studies.
  const vault = VAULT_PIECES.find((v) => v.slug === slug);
  if (vault) {
    return {
      slug: vault.slug,
      name: vault.title,
      href: vault.href,
      category: vault.category || 'inspiration-vault',
      audience: ['inspiration-vault'],
      image: vault.posterImage,
      subtitle: vault.subtitle,
      description: vault.subtitle,
      priceAmount: vault.price,
      priceCurrency: vault.price ? 'USD' : undefined,
    };
  }
  return null;
}

// Convenience for tests / audit script.
export function listAllPublicProducts() {
  return catalogProducts.filter((p) => p.status !== 'placeholder' && p.purchasable !== false);
}
