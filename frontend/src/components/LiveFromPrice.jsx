import { useLiveFromPrice } from "@/hooks/useLivePrice";

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

/**
 * Renders a live "From $X,XXX CAD" price label.
 * Falls back to the static price_range string if no live config.
 */
export function LiveFromPrice({ slug, fallback }) {
  const productKey = slugToProductKey(slug);
  const { fromFormatted, isLive } = useLiveFromPrice(productKey, 0);

  if (isLive) {
    return <>{fromFormatted} CAD</>;
  }
  return <>{fallback}</>;
}
