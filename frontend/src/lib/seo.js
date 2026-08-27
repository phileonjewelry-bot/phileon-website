// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Centralised SEO Generator
//
// Single source of truth for:
//   • SEO title / meta description
//   • canonical URL
//   • Open Graph + Twitter card metadata
//   • JSON-LD Product + BreadcrumbList schema
//   • image alt-text generation
//   • index / noindex control
//   • fallback generation from existing catalog fields
//
// Manual overrides ALWAYS win over generated defaults. The generator never
// invents specifications (prices, stones, weights, ratings, GTINs) that are
// not already stored in the catalog.
//
// Usage:
//   import { generateSeo, buildBreadcrumbs } from '@/lib/seo';
//   const seo = generateSeo({
//     slug: 'drape',
//     name: 'DRAPE',
//     productType: 'Diamond Statement Pendant',
//     category: 'pendants',
//     audience: ['ladies'],
//     image: DRAPE_HERO,
//     priceAmount: 4995, priceCurrency: 'USD',
//     availability: 'InStock',
//     material: '10K White Gold',
//     description: '…editorial line already used on page…',
//     override: { title: '…', description: '…' }, // wins
//   });
// ─────────────────────────────────────────────────────────────────────────────

const BRAND = 'PHILEON';
const SITE_ORIGIN = 'https://phileon.com';
const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/logo.png`;

// Site-wide category → SEO product-type fallback dictionary. Used when a
// catalog entry does not carry an explicit `productType`.
const CATEGORY_TO_TYPE = {
  rings: 'Statement Ring',
  pendants: 'Statement Pendant',
  earrings: 'Statement Earrings',
  anklets: 'Anklet',
  bangles: 'Bangle',
  bracelets: 'Bracelet',
  sets: 'Jewelry Set',
  chains: 'Chain',
  necklaces: 'Necklace',
};

// Audience label injected into product type when a piece is clearly gendered.
const AUDIENCE_LABEL = {
  gents: "Men's",
  'gentlemens-club': "Men's",
  ladies: "Women's",
};

// ─── Utilities ──────────────────────────────────────────────────────────────
const clean = (s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : '');
const truncate = (s, max) => (s && s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s);

function pickCategory(product) {
  if (Array.isArray(product.category)) return product.category[0];
  return product.category || null;
}

function pickAudience(product) {
  if (Array.isArray(product.audience)) {
    for (const key of ['gents', 'gentlemens-club', 'ladies']) {
      if (product.audience.includes(key)) return key;
    }
    return product.audience[0] || null;
  }
  return product.audience || null;
}

// ─── Product Type Inference ─────────────────────────────────────────────────
export function inferProductType(product) {
  if (product.productType) return product.productType;
  if (product.seo?.productType) return product.seo.productType;

  const category = pickCategory(product);
  const audience = pickAudience(product);
  const base = CATEGORY_TO_TYPE[category] || 'Jewelry';
  const genderLabel = AUDIENCE_LABEL[audience];
  return genderLabel ? `${genderLabel} ${base}` : base;
}

// ─── SEO Title ──────────────────────────────────────────────────────────────
// Format: [PRODUCT NAME] | [TYPE] | PHILEON
export function generateTitle(product, overrideTitle) {
  if (overrideTitle) return clean(overrideTitle);
  const name = clean(product.name || product.title || '').toUpperCase();
  const type = inferProductType(product);
  return `${name} | ${type} | ${BRAND}`;
}

// ─── Meta Description ───────────────────────────────────────────────────────
// Target ~140–160 chars. Never uses banned generic phrases.
const BANNED_PHRASES = [
  /stunning collection/i, /elevate your style/i, /perfect for every occasion/i,
];
function isBanned(text) { return BANNED_PHRASES.some((rx) => rx.test(text)); }

export function generateDescription(product, override) {
  if (override && !isBanned(override)) return clean(override);
  const name = clean(product.name || '');
  const type = inferProductType(product);
  const material = clean(product.material || product.materialLine || '');
  const editorialSeed = clean(product.description || product.subtitle || '');
  const parts = [`${name} by ${BRAND}`, `${type.toLowerCase()}`];
  if (material) parts.push(material);
  if (editorialSeed) parts.push(editorialSeed);
  let out = parts.filter(Boolean).join(' · ');
  if (out.length > 160) out = truncate(out, 160);
  return out;
}

// ─── Canonical URL ──────────────────────────────────────────────────────────
export function canonicalFor(product, overrideCanonical) {
  if (overrideCanonical) {
    return overrideCanonical.startsWith('http') ? overrideCanonical : `${SITE_ORIGIN}${overrideCanonical}`;
  }
  const path = product.href || (product.slug ? `/products/${product.slug}` : '/');
  return path.startsWith('http') ? path : `${SITE_ORIGIN}${path}`;
}

// ─── Image Alt Text ─────────────────────────────────────────────────────────
export function generateAlt(product, imageContext) {
  if (imageContext?.alt) return clean(imageContext.alt);
  const name = clean(product.name || '');
  const type = inferProductType(product).toLowerCase();
  const view = imageContext?.view; // e.g. 'side profile', 'hero', 'macro'
  const base = `${name} — ${type} by ${BRAND}`;
  return view ? `${base} · ${view}` : base;
}

// ─── Keywords (internal SEO field) ──────────────────────────────────────────
// Kept as a data field for future use (e.g. search relevance, related-product
// suggestions). Not emitted as a <meta name="keywords"> tag — Google ignores
// that tag and it can incur spam signals.
export function generateKeywords(product, overrideKeywords) {
  if (Array.isArray(overrideKeywords) && overrideKeywords.length) return overrideKeywords;
  const name = clean(product.name || '').toLowerCase();
  const type = inferProductType(product).toLowerCase();
  const category = pickCategory(product);
  const audience = pickAudience(product);
  const list = new Set([
    type,
    category ? `${category} jewelry` : null,
    audience === 'gents' || audience === 'gentlemens-club' ? "men's jewelry" : null,
    audience === 'ladies' ? "women's jewelry" : null,
    `${BRAND.toLowerCase()} jewelry`,
    name ? `${name} ${BRAND.toLowerCase()}` : null,
  ]);
  return [...list].filter(Boolean);
}

// ─── Breadcrumbs ────────────────────────────────────────────────────────────
export function buildBreadcrumbs(product) {
  const list = [{ name: 'Home', url: `${SITE_ORIGIN}/` }];
  const audience = pickAudience(product);
  const category = pickCategory(product);
  const isVault = Array.isArray(product.audience)
    ? product.audience.includes('inspiration-vault')
    : product.audience === 'inspiration-vault';

  if (isVault || (product.href || '').startsWith('/inspiration-vault')) {
    list.push({ name: 'Inspiration Vault', url: `${SITE_ORIGIN}/inspiration-vault` });
  } else if (audience === 'gents' || audience === 'gentlemens-club') {
    list.push({ name: "Gentleman's Club", url: `${SITE_ORIGIN}/gentlemens-club` });
    if (category) list.push({ name: capitalize(category), url: `${SITE_ORIGIN}/shop?category=${category}&audience=gentlemens-club` });
  } else if (audience === 'fine-jewelry' || (Array.isArray(product.audience) && product.audience.includes('fine-jewelry'))) {
    list.push({ name: 'Fine Jewelry', url: `${SITE_ORIGIN}/shop?collection=signature` });
    if (category) list.push({ name: capitalize(category), url: `${SITE_ORIGIN}/shop?category=${category}` });
  } else if (audience === 'ladies') {
    list.push({ name: 'Ladies', url: `${SITE_ORIGIN}/ladies` });
    if (category) list.push({ name: capitalize(category), url: `${SITE_ORIGIN}/shop?category=${category}&audience=ladies` });
  }
  list.push({
    name: clean(product.name || '').toUpperCase(),
    url: canonicalFor(product),
  });
  return list;
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// ─── JSON-LD ────────────────────────────────────────────────────────────────
export function buildProductJsonLd(product, seo) {
  const url = seo.canonical;
  const image = seo.socialImage || product.image || product.imageUrl;
  const material = product.material || product.materialLine;
  const availability = product.availability
    || (product.purchasable === false ? 'PreOrder' : 'InStock');
  const priceAmount = product.priceAmount ?? product.price;
  const priceCurrency = product.priceCurrency || product.currency;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: seo.description,
    brand: { '@type': 'Brand', name: BRAND },
    url,
  };
  if (image) jsonLd.image = Array.isArray(image) ? image : [image];
  if (product.sku) jsonLd.sku = product.sku;
  if (material) jsonLd.material = material;
  if (product.color) jsonLd.color = product.color;
  if (product.category) jsonLd.category = Array.isArray(product.category)
    ? product.category.join(', ')
    : product.category;

  // Only emit offers when we have BOTH price + currency (never invent a $0).
  if (priceAmount != null && priceCurrency) {
    jsonLd.offers = {
      '@type': 'Offer',
      url,
      priceCurrency,
      price: String(priceAmount),
      availability: `https://schema.org/${availability}`,
      seller: { '@type': 'Organization', name: BRAND },
    };
  }

  // Variant offers (e.g. GRAVITÉ 10K + 14K) — accurate metal-tier structure.
  if (Array.isArray(product.offerVariants) && product.offerVariants.length) {
    jsonLd.offers = product.offerVariants.map((v) => ({
      '@type': 'Offer',
      url,
      priceCurrency: v.priceCurrency,
      price: String(v.priceAmount),
      availability: `https://schema.org/${v.availability || availability}`,
      itemOffered: v.name ? { '@type': 'Product', name: v.name } : undefined,
      seller: { '@type': 'Organization', name: BRAND },
    }));
  }
  return jsonLd;
}

export function buildBreadcrumbJsonLd(product) {
  const crumbs = buildBreadcrumbs(product);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

// ─── Master generator ───────────────────────────────────────────────────────
// Returns a normalised SEO object. Any fields present in `product.seo` or in
// an explicit `overrides` argument win over generated defaults.
export function generateSeo(product, overrides = {}) {
  const merged = { ...(product.seo || {}), ...overrides };
  const title = generateTitle(product, merged.title);
  const description = generateDescription(product, merged.description);
  const canonical = canonicalFor(product, merged.canonical);
  const socialImage = merged.socialImage
    || product.image
    || product.imageUrl
    || DEFAULT_SOCIAL_IMAGE;

  // Index/noindex — placeholders + in-development pieces default to noindex.
  const isPlaceholder = product.status === 'placeholder'
    || product.purchasable === false
    || product.inDevelopment === true;
  const index = merged.index != null ? merged.index : !isPlaceholder;
  const follow = merged.follow != null ? merged.follow : true;

  return {
    title,
    description,
    productType: inferProductType(product),
    canonical,
    socialTitle: merged.socialTitle || title,
    socialDescription: merged.socialDescription || description,
    socialImage,
    keywords: generateKeywords(product, merged.keywords),
    imageAlt: generateAlt(product, { alt: merged.imageAlt }),
    index, follow,
  };
}

// ─── HEAD injection ─────────────────────────────────────────────────────────
// Idempotent — updates existing tags in place if they exist, otherwise creates
// them. Cleans up any tags it created when the component unmounts.
export function applySeoHead(seo, jsonLdObjects = []) {
  if (typeof document === 'undefined') return () => {};
  const owned = [];
  const setMeta = (attrKey, attrValue, content, tagName = 'meta') => {
    if (!content) return;
    let el = document.head.querySelector(`${tagName}[${attrKey}="${attrValue}"]`);
    if (!el) {
      el = document.createElement(tagName);
      el.setAttribute(attrKey, attrValue);
      document.head.appendChild(el);
      owned.push(el);
    }
    if (tagName === 'link') el.setAttribute('href', content);
    else el.setAttribute('content', content);
  };
  const prevTitle = document.title;
  document.title = seo.title;

  setMeta('name', 'description', seo.description);
  const robots = [seo.index ? 'index' : 'noindex', seo.follow ? 'follow' : 'nofollow'].join(',');
  setMeta('name', 'robots', robots);

  setMeta('rel', 'canonical', seo.canonical, 'link');

  setMeta('property', 'og:title', seo.socialTitle);
  setMeta('property', 'og:description', seo.socialDescription);
  setMeta('property', 'og:image', seo.socialImage);
  setMeta('property', 'og:url', seo.canonical);
  setMeta('property', 'og:type', 'product');
  setMeta('property', 'og:site_name', BRAND);

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', seo.socialTitle);
  setMeta('name', 'twitter:description', seo.socialDescription);
  setMeta('name', 'twitter:image', seo.socialImage);

  // JSON-LD blocks
  const scripts = [];
  jsonLdObjects.filter(Boolean).forEach((json, i) => {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.dataset.phileonSeo = String(i);
    s.textContent = JSON.stringify(json);
    document.head.appendChild(s);
    scripts.push(s);
  });

  return () => {
    document.title = prevTitle;
    owned.forEach((el) => el.parentNode && el.parentNode.removeChild(el));
    scripts.forEach((el) => el.parentNode && el.parentNode.removeChild(el));
  };
}

export const SEO_CONSTANTS = { BRAND, SITE_ORIGIN };
