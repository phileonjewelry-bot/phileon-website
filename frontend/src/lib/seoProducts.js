// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — SEO product registry (pilot rollout).
//
// Explicit SEO product data for the six pilot pages. This is intentionally
// separate from the commerce catalog in /data/products.js — the commerce
// catalog remains the source of truth for prices, inventory, checkout. This
// registry is a search-facing layer that never touches commerce logic.
//
// New products may be added here at any time. Manual `seo` overrides always
// win over the auto-generator defaults.
// ─────────────────────────────────────────────────────────────────────────────

export const DRAPE_SEO = {
  slug: 'drape',
  name: 'DRAPE',
  productType: 'Diamond Statement Pendant',
  category: 'pendants',
  audience: ['ladies', 'fine-jewelry'],
  material: '10K / 14K White Gold with Diamonds',
  href: '/products/drape',
  description: 'Corset-inspired luxury diamond pendant translating tension and drape into precious metal.',
  seo: {
    keywords: [
      'diamond pendant',
      'statement pendant',
      'luxury pendant',
      'corset pendant',
      'dress inspired jewelry',
      'PHILEON jewelry',
    ],
  },
};

export const PRISE_DE_COURONNE_SEO = {
  slug: 'prise-de-couronne',
  name: 'PRISE DE COURONNE',
  productType: 'Black Gold Diamond Statement Ring',
  category: 'rings',
  audience: ['gents', 'fine-jewelry'],
  material: 'Black Rhodium 10K White Gold with White Diamonds',
  color: 'Black',
  href: '/products/prise-de-couronne',
  description: "A crown taken — men's black gold statement ring with pavé white diamonds arranged in a claimed-crown architecture.",
  seo: {
    keywords: [
      'black gold diamond ring',
      "men's black diamond ring",
      'luxury statement ring',
      'black diamond jewelry',
      "designer men's ring",
    ],
  },
};

export const BAJAN_JOE_SEO = {
  slug: 'bajan-joe',
  name: 'BAJAN JOE',
  productType: "Men's Signet Statement Ring",
  category: 'rings',
  audience: ['gents', 'fine-jewelry'],
  material: '10K / 14K Yellow Gold with Reptile-Textured Shoulders',
  href: '/products/bajan-joe',
  description: "Signet architecture with reptile-engraved shoulders — PHILEON men's statement ring built for arrival.",
  seo: {
    keywords: [
      "men's statement ring",
      "luxury men's ring",
      "wide men's ring",
      "designer men's jewelry",
      'signet ring',
    ],
  },
};

export const RIBBON_REGALE_EDITION_SEO = {
  slug: 'ribbon-regale-edition',
  name: 'RIBBON REGALE ÉDITION',
  productType: 'Diamond Ribbon Statement Ring',
  category: 'rings',
  audience: ['ladies', 'fine-jewelry'],
  material: '10K / 14K White Gold with Diamonds',
  href: '/fine-jewelry/ribbon-regale-edition',
  description: 'A ribbon rendered in white gold and diamonds — architectural bow ring with tension-set diamond passages.',
  seo: {
    keywords: [
      'diamond ribbon ring',
      'bow ring',
      'luxury white gold ring',
      'statement ring',
      'PHILEON ribbon regale',
    ],
  },
};

export const QUADRIGA_DOMINUS_SEO = {
  slug: 'quadriga-dominus',
  name: 'QUADRIGA DOMINUS',
  productType: "Men's Colorway Statement Ring",
  category: 'rings',
  audience: ['gents', 'fine-jewelry'],
  material: '10K / 14K Gold with Ruby, Black, Green and White Stones',
  href: '/quadriga-dominus',
  description: "Four-colorway men's statement ring — Red/Black, Black/Red, Green/Black, Black/Green. Substantial gold band, mixed-stone pavé.",
  seo: {
    keywords: [
      "men's statement ring",
      'quadriga',
      'colorway ring',
      "ruby men's ring",
      "designer men's jewelry",
    ],
  },
};

export const GOLDEN_HOUR_CUFFS_SEO = {
  slug: 'golden-hour-cuffs',
  name: 'GOLDEN HOUR CUFFS',
  productType: 'Dubai-Style Gold Vermeil Cuff Set',
  category: 'bangles',
  audience: ['inspiration-vault'],
  material: 'Gold Vermeil',
  href: '/inspiration-vault/golden-hour-cuffs',
  priceAmount: 90,
  priceCurrency: 'USD',
  availability: 'InStock',
  sku: 'IV-GHC-CUFF',
  description: 'Dubai-style stacked cuff set in gold vermeil — ornate filigree and sculpted wave architecture from the PHILEON Inspiration Vault.',
  seo: {
    keywords: [
      'gold vermeil cuffs',
      'dubai style cuffs',
      'stacked bangles',
      'filigree cuff',
      'inspiration vault',
      'PHILEON cuffs',
    ],
  },
};
