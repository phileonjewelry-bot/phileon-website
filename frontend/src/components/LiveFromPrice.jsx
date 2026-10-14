import { useLiveFromPrice, useLivePrice } from "@/hooks/useLivePrice";
import { useLocalizedUsdFormatter } from "@/hooks/useLocalizedUsdFormatter";
import { products } from "@/data/products";

// Maps product slug to livePricingConfig key
const SLUG_TO_KEY = {
  "la-marva": "laMarva",
  "annie-rose": "annieRose",
  "monika-couture": "monikaCouture",
  "alejandra-heels": "alejandraHeels",
  "ptp-cuff": "ptpCuff",
  "rosaria": "rosaria",
  "desir-corset": "desirCorset",
  "forme-cuff": "formeCuff",
  "rhythm-mesh-ring": "rhythmMeshRing",
  "tola-ii": "tolaII",
  "galatians-614": "galatians614",
  "trace": "trace",
  "bound": "bound",
  "apex": "apex",
  "homage": "homage",
  "cypher": "cypher",
  "morso": "morso",
  "labete": "labete",
  "blessed": "blessed",
  "coogi-i": "coogiI",
  "bamburgh": "bamburgh",
  "the-bamburgh": "bamburgh",
  "lady-bamburgh": "ladyBamburgh",
  "wynette-palette": "wynettePalette",
  "veyron-noir": "veyronNoir",
  "parabola": "parabola",
  // Storefront slug → live config key, mirroring backend pricing_engine_catalog.product_key
  "corinthians-15-14": "corinthians1514",
  "fondo-curvo": "fondoCurvo",
  "drape": "drape",
  "le-cocktail-de-jessica": "cocktailJessica",
  "prise-de-couronne": "priseDeCouronne",
  "nervatura": "nervatura",
  "the-don-gorgon": "theDonGorgon",
  "lady-jay": "ladyJay",
  "the-true-vine": "theTrueVine",
  "porta-aurea": "portaAurea",
  "coogi-dna-tag": "coogiDnaTag",
  "battenti-della-villa": "battentiDellaVilla",
  "gent": "gent",
  "stackrats": "stackrats",
  "rose-of-sharon": "roseOfSharon",
  "boss-knot": "bossKnot",
  "lady-boss-knot": "ladyBossKnot",
  "uncle-jo": "uncleJo",
  "katrina-cascata": "katrinaCascata",
};

export function slugToProductKey(slug) {
  return SLUG_TO_KEY[slug] || null;
}

// Finds the products.js productKey for a given slug by walking the products map
function productKeyBySlug(slug) {
  for (const [key, p] of Object.entries(products)) {
    if (p.slug === slug) return key;
  }
  return null;
}

/**
 * Renders a luxury card price label.
 *
 * Behaviour:
 * - Fixed-price products with defaultSelection → show that fixed price
 *   (e.g. Grand Dame → Rose Gold · Signature · $16,800 USD).
 * - Live-pricing products → "From $X,XXX USD" via useLiveFromPrice.
 * - Fallback → static price_range string from the product card data.
 */
export function LiveFromPrice({ slug, fallback }) {
  const productKey = productKeyBySlug(slug);
  const product = productKey ? products[productKey] : null;

  const isFixedMultiMetal =
    !!product &&
    product.pricingType === "fixed" &&
    !!product.defaultSelection?.metal &&
    !!product.defaultSelection?.tier;

  // Fixed-price products that use the simpler variants[] shape (no tiers)
  // e.g. THE CARAPACE → two metal variants, one marked default: true.
  const fixedVariant =
    !!product &&
    product.pricingType === "fixed" &&
    Array.isArray(product.variants) &&
    product.variants.length > 0
      ? [...product.variants].filter((v) => v.price > 0 && v.available !== false).sort((a, b) => a.price - b.price)[0]
      : null;

  // Hook calls must be unconditional — give stable args either way.
  const fixedTierArg = isFixedMultiMetal
    ? { metal: product.defaultSelection.metal, tier: product.defaultSelection.tier }
    : null;
  const { formatted: fixedFormatted } = useLivePrice(
    productKey || slug,
    fixedTierArg,
    0
  );

  const liveKey = SLUG_TO_KEY[slug] || null;
  const { fromFormatted, isLive } = useLiveFromPrice(liveKey, 0);
  const _localizedUsd = useLocalizedUsdFormatter();

  if (isFixedMultiMetal) {
    // Hooks already format with " USD" or "Approx. C$… CAD" — no double suffix.
    return <>{fixedFormatted}</>;
  }
  if (fixedVariant) {
    return <>From {_localizedUsd(fixedVariant.price)}</>;
  }
  if (isLive) {
    return <>From {fromFormatted}</>;
  }
  return <>{fallback}</>;
}
