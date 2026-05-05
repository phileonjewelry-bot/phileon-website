import { useMemo } from "react";
import { useMarketPricing } from "@/context/MarketPricingContext";
import { calculateMetalValueCad, calculateLiveDisplayPrice, formatCad } from "@/lib/livePricing";
import livePricingConfig from "@/data/livePricingConfig";
import { products } from "@/data/products";

// Map product slugs → productKey used in livePricingConfig / products.js
const SLUG_TO_KEY = Object.fromEntries(
  Object.entries(products).map(([key, p]) => [p.slug, key])
);

/**
 * Resolve a product. Accepts either an internal key ("theGrandDame") or a
 * slug ("the-grand-dame") and returns { key, product } or nulls.
 */
function resolveProduct(productIdOrSlug) {
  if (!productIdOrSlug) return { key: null, product: null };
  const key = products[productIdOrSlug]
    ? productIdOrSlug
    : SLUG_TO_KEY[productIdOrSlug];
  return { key, product: key ? products[key] : null };
}

/**
 * Normalise a tier argument. Accepts:
 *   - string: "signature" (legacy single-dimension)
 *   - object: { metal: "rose_gold", tier: "signature" } (multi-metal)
 * Returns a normalised tier key used to look up livePricingConfig and/or
 * products.metals[...].tiers[...].
 */
function normaliseTier(tierArg) {
  if (!tierArg) return { raw: null, metal: null, tier: null };
  if (typeof tierArg === "string") {
    return { raw: tierArg, metal: null, tier: tierArg };
  }
  // object form — strip trailing "_gold" for convenience so callers can pass
  // either "rose" or "rose_gold"
  const metal = (tierArg.metal || "").replace(/_gold$/, "");
  const tier = tierArg.tier || null;
  return { raw: `${metal}_${tier}`, metal: metal || null, tier };
}

/**
 * Returns the live-adjusted price for a product tier (or the fixed price,
 * if the product is marked pricingType: "fixed").
 *
 * @param {string} productIdOrSlug - internal key OR slug
 * @param {string|{metal:string,tier:string}} tierArg
 * @param {number} fallbackPrice
 * @returns {{ price: number, formatted: string, isLive: boolean }}
 */
export function useLivePrice(productIdOrSlug, tierArg, fallbackPrice = 0) {
  const { market } = useMarketPricing();

  return useMemo(() => {
    const { key, product } = resolveProduct(productIdOrSlug);
    const { raw: rawTier, metal, tier } = normaliseTier(tierArg);

    // ─ Fixed-price products: read directly from products.js metals tree ─
    if (product && product.pricingType === "fixed" && metal && tier) {
      const fixed = product.metals?.[metal]?.tiers?.[tier]?.price;
      if (typeof fixed === "number") {
        return { price: fixed, formatted: formatCad(fixed), isLive: false };
      }
    }

    // ─ Live-price flow (unchanged) ─
    const productConfig = key ? livePricingConfig[key] : null;
    if (!productConfig) {
      return { price: fallbackPrice, formatted: formatCad(fallbackPrice), isLive: false };
    }

    // Try the composite key first ("rose_signature"), then the plain tier key
    const tierConfig =
      (rawTier && productConfig[rawTier]) ||
      (tier && productConfig[tier]);
    if (!tierConfig) {
      return { price: fallbackPrice, formatted: formatCad(fallbackPrice), isLive: false };
    }

    const currentMetalValueCad = calculateMetalValueCad({
      weightGrams: tierConfig.weightGrams,
      metalType: tierConfig.metalType,
      market,
    });

    const displayPrice = calculateLiveDisplayPrice({
      lockedBasePriceCad: tierConfig.lockedBasePriceCad,
      lockedMetalReferenceCad: tierConfig.lockedMetalReferenceCad,
      currentMetalValueCad,
    });

    return { price: displayPrice, formatted: formatCad(displayPrice), isLive: true };
  }, [productIdOrSlug, tierArg, fallbackPrice, market]);
}

/**
 * Returns the "From" price for a product (lowest tier or signature default).
 * Used on cards, carousels, collection grids.
 * 
 * @param {string} productKey
 * @param {number} fallbackBasePrice
 * @returns {{ price: number, formatted: string, fromFormatted: string, isLive: boolean }}
 */
export function useLiveFromPrice(productKey, fallbackBasePrice = 0) {
  const { market } = useMarketPricing();

  return useMemo(() => {
    const productConfig = livePricingConfig[productKey];
    if (!productConfig) {
      return {
        price: fallbackBasePrice,
        formatted: formatCad(fallbackBasePrice),
        fromFormatted: `From ${formatCad(fallbackBasePrice)}`,
        isLive: false,
      };
    }

    // Find the lowest priced tier
    let lowestPrice = Infinity;
    for (const tierKey of Object.keys(productConfig)) {
      const tc = productConfig[tierKey];
      const currentMetal = calculateMetalValueCad({
        weightGrams: tc.weightGrams,
        metalType: tc.metalType,
        market,
      });
      const livePrice = calculateLiveDisplayPrice({
        lockedBasePriceCad: tc.lockedBasePriceCad,
        lockedMetalReferenceCad: tc.lockedMetalReferenceCad,
        currentMetalValueCad: currentMetal,
      });
      if (livePrice < lowestPrice) lowestPrice = livePrice;
    }

    return {
      price: lowestPrice,
      formatted: formatCad(lowestPrice),
      fromFormatted: `From ${formatCad(lowestPrice)}`,
      isLive: true,
    };
  }, [productKey, fallbackBasePrice, market]);
}

/**
 * Returns all tier prices for a product, live-adjusted.
 * 
 * @param {string} productKey
 * @returns {Object<string, { price: number, formatted: string }>}
 */
export function useLiveTierPrices(productKey) {
  const { market } = useMarketPricing();

  return useMemo(() => {
    const productConfig = livePricingConfig[productKey];
    if (!productConfig) return {};

    const result = {};
    for (const [tierKey, tc] of Object.entries(productConfig)) {
      const currentMetal = calculateMetalValueCad({
        weightGrams: tc.weightGrams,
        metalType: tc.metalType,
        market,
      });
      const livePrice = calculateLiveDisplayPrice({
        lockedBasePriceCad: tc.lockedBasePriceCad,
        lockedMetalReferenceCad: tc.lockedMetalReferenceCad,
        currentMetalValueCad: currentMetal,
      });
      result[tierKey] = { price: livePrice, formatted: formatCad(livePrice) };
    }
    return result;
  }, [productKey, market]);
}
