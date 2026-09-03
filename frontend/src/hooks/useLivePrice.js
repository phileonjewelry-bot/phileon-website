import { useMemo } from "react";
import { useMarketPricing } from "@/context/MarketPricingContext";
import { usePresentment } from "@/context/PresentmentContext";
import {
  calculateMetalValueCad,
  calculateLiveDisplayPrice,
  formatUsd,
  cadToUsdLuxury,
} from "@/lib/livePricing";
import livePricingConfig from "@/data/livePricingConfig";
import { products } from "@/data/products";

// Map product slugs → productKey used in livePricingConfig / products.js
const SLUG_TO_KEY = Object.fromEntries(
  Object.entries(products).map(([key, p]) => [p.slug, key])
);

/** Localize a canonical USD dollar amount through the presentment context.
 * Returns the `.formatted` string with an "Approx. " prefix when non-USD.
 * When USD is active, delegates to the legacy `formatUsd` so exact matching
 * output is preserved end-to-end.
 */
function localizeUsdDollars(usdDollars, presentment) {
  if (!presentment || !presentment.isApproximate) return `${formatUsd(usdDollars)} USD`;
  return `Approx. ${presentment.formatDollars(usdDollars)}`;
}

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
  const presentment = usePresentment();

  return useMemo(() => {
    const { key, product } = resolveProduct(productIdOrSlug);
    const { raw: rawTier, metal, tier } = normaliseTier(tierArg);

    // ─ Fixed-price products: read directly from products.js metals tree ─
    if (product && product.pricingType === "fixed" && metal && tier) {
      const fixed = product.metals?.[metal]?.tiers?.[tier]?.price;
      if (typeof fixed === "number") {
        return { price: fixed, formatted: localizeUsdDollars(fixed, presentment), isLive: false };
      }
    }

    // ─ Live-price flow (unchanged) ─
    const productConfig = key ? livePricingConfig[key] : null;
    if (!productConfig) {
      return { price: fallbackPrice, formatted: localizeUsdDollars(fallbackPrice, presentment), isLive: false };
    }

    // Try the composite key first ("rose_signature"), then the plain tier key
    const tierConfig =
      (rawTier && productConfig[rawTier]) ||
      (tier && productConfig[tier]);
    if (!tierConfig) {
      return { price: fallbackPrice, formatted: localizeUsdDollars(fallbackPrice, presentment), isLive: false };
    }

    const currentMetalValueCad = calculateMetalValueCad({
      weightGrams: tierConfig.weightGrams,
      metalType: tierConfig.metalType,
      market,
    });

    const cadPrice = calculateLiveDisplayPrice({
      lockedBasePriceCad: tierConfig.lockedBasePriceCad,
      lockedMetalReferenceCad: tierConfig.lockedMetalReferenceCad,
      currentMetalValueCad,
    });

    // PHILEON USD pricing rule: convert internal CAD → USD with luxury rounding
    const displayPrice = cadToUsdLuxury(cadPrice);

    return { price: displayPrice, formatted: localizeUsdDollars(displayPrice, presentment), isLive: true };
  }, [productIdOrSlug, tierArg, fallbackPrice, market, presentment]);
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
  const presentment = usePresentment();

  return useMemo(() => {
    const productConfig = livePricingConfig[productKey];
    if (!productConfig) {
      return {
        price: fallbackBasePrice,
        formatted: localizeUsdDollars(fallbackBasePrice, presentment),
        fromFormatted: localizeUsdDollars(fallbackBasePrice, presentment),
        isLive: false,
      };
    }

    // Find the lowest priced tier (CAD), then apply USD luxury rounding
    let lowestCad = Infinity;
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
      if (livePrice < lowestCad) lowestCad = livePrice;
    }
    const lowestPrice = cadToUsdLuxury(lowestCad);

    return {
      price: lowestPrice,
      formatted: localizeUsdDollars(lowestPrice, presentment),
      fromFormatted: localizeUsdDollars(lowestPrice, presentment),
      isLive: true,
    };
  }, [productKey, fallbackBasePrice, market, presentment]);
}

/**
 * Returns all tier prices for a product, live-adjusted.
 * 
 * @param {string} productKey
 * @returns {Object<string, { price: number, formatted: string }>}
 */
export function useLiveTierPrices(productKey) {
  const { market } = useMarketPricing();
  const presentment = usePresentment();

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
      const livePriceCad = calculateLiveDisplayPrice({
        lockedBasePriceCad: tc.lockedBasePriceCad,
        lockedMetalReferenceCad: tc.lockedMetalReferenceCad,
        currentMetalValueCad: currentMetal,
      });
      // PHILEON USD pricing rule: convert internal CAD → USD with luxury rounding
      const livePrice = cadToUsdLuxury(livePriceCad);
      result[tierKey] = { price: livePrice, formatted: localizeUsdDollars(livePrice, presentment) };
    }
    return result;
  }, [productKey, market, presentment]);
}
