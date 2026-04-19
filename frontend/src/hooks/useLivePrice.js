import { useMemo } from "react";
import { useMarketPricing } from "@/context/MarketPricingContext";
import { calculateMetalValueCad, calculateLiveDisplayPrice, formatCad } from "@/lib/livePricing";
import livePricingConfig from "@/data/livePricingConfig";

/**
 * Returns the live-adjusted price for a product tier.
 * Falls back to the locked base price if no config exists.
 * 
 * @param {string} productKey - key in livePricingConfig (e.g. "ladyBamburgh")
 * @param {string} tierKey - tier key (e.g. "signature")
 * @param {number} fallbackPrice - static price to use if no live config
 * @returns {{ price: number, formatted: string, isLive: boolean }}
 */
export function useLivePrice(productKey, tierKey, fallbackPrice = 0) {
  const { market } = useMarketPricing();

  return useMemo(() => {
    const productConfig = livePricingConfig[productKey];
    if (!productConfig) {
      return { price: fallbackPrice, formatted: formatCad(fallbackPrice), isLive: false };
    }

    const tierConfig = productConfig[tierKey];
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
  }, [productKey, tierKey, fallbackPrice, market]);
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
