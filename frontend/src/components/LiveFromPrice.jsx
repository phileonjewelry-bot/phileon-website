import { useLiveFromPrice, useLivePrice } from "@/hooks/useLivePrice";
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
      ? (product.variants.find((v) => v.default) || product.variants[0])
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

  if (isFixedMultiMetal) {
    return <>{fixedFormatted} USD</>;
  }
  if (fixedVariant) {
    const formatted = `$${fixedVariant.price.toLocaleString("en-US")}`;
    return <>{formatted} USD</>;
  }
  if (isLive) {
    return <>{fromFormatted} USD</>;
  }
  return <>{fallback}</>;
}
