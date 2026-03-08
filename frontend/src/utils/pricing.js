/**
 * PHILEON Pricing Utility
 * 
 * Centralized pricing logic for all products.
 * Uses products.js as the single source of truth.
 * Supports dynamic gold-based pricing with controlled adjustments.
 * 
 * Features:
 * - Dynamic gold pricing with threshold-based adjustments
 * - Graceful fallback to base pricing on API failure
 * - Per-product configuration
 * - Agent-proof architecture
 */

/**
 * Calculate adjusted price based on live gold movement
 * 
 * Enhanced with two protections:
 * 1. Slow Adjustment Curve - Only applies 40% of gold movement (dampening factor)
 * 2. Maximum Adjustment Cap - Limits price changes to ±50%
 * 
 * @param {number} basePrice - Base price in CAD
 * @param {number} currentGoldUSD - Current gold spot price (USD/oz)
 * @param {number} baselineGoldUSD - Baseline gold price when pricing was set (USD/oz)
 * @param {number} thresholdPct - Threshold percentage for adjustment (e.g., 5 for 5%)
 * @param {boolean} dynamicPricing - Whether to apply dynamic pricing
 * @returns {Object} - { adjustedPrice, percentMove, adjustedMovePct, isAdjusted, currentGoldUSD }
 */
export function calculateGoldAdjustedPrice(
  basePrice,
  currentGoldUSD,
  baselineGoldUSD,
  thresholdPct = 5,
  dynamicPricing = false
) {
  // If dynamic pricing is disabled, return base price
  if (!dynamicPricing) {
    return {
      adjustedPrice: basePrice,
      percentMove: 0,
      isAdjusted: false,
      currentGoldUSD: baselineGoldUSD,
    };
  }

  // If no valid current gold price, return base price
  if (!currentGoldUSD || currentGoldUSD <= 0) {
    return {
      adjustedPrice: basePrice,
      percentMove: 0,
      isAdjusted: false,
      currentGoldUSD: baselineGoldUSD,
      error: 'Invalid gold price',
    };
  }

  // Calculate percentage move from baseline
  const percentMove = ((currentGoldUSD - baselineGoldUSD) / baselineGoldUSD) * 100;

  // If move is below threshold, return base price
  if (Math.abs(percentMove) < thresholdPct) {
    return {
      adjustedPrice: basePrice,
      percentMove,
      isAdjusted: false,
      currentGoldUSD,
    };
  }

  // ==========================================
  // ENHANCED ADJUSTMENT ENGINE
  // Protection 1: Slow Adjustment Curve (40% dampening)
  // Protection 2: Maximum Adjustment Cap (±50%)
  // ==========================================
  
  // Configuration
  const adjustmentFactor = 0.40;  // Only apply 40% of gold movement
  const maxAdjustmentPct = 50;    // Cap price changes at ±50%
  
  // Calculate gold move percentage
  const goldMovePct = percentMove;
  
  // Apply slow adjustment curve (dampening factor)
  let adjustedMovePct = goldMovePct * adjustmentFactor;
  
  // Apply maximum adjustment cap
  if (adjustedMovePct > maxAdjustmentPct) {
    adjustedMovePct = maxAdjustmentPct;
  }
  if (adjustedMovePct < -maxAdjustmentPct) {
    adjustedMovePct = -maxAdjustmentPct;
  }
  
  // Calculate final adjusted price
  const adjustedPrice = Math.round(basePrice * (1 + adjustedMovePct / 100));

  return {
    adjustedPrice,
    percentMove,
    adjustedMovePct,  // Actual applied adjustment after dampening and cap
    isAdjusted: true,
    currentGoldUSD,
  };
}

/**
 * Calculate adjusted prices for all tiers of a product
 * 
 * @param {Object} productConfig - Product configuration from products.js
 * @param {number|null} currentGoldUSD - Current gold spot price (USD/oz), null if API failed
 * @returns {Object} - { tiers, goldPricing }
 */
export function calculateProductPricing(productConfig, currentGoldUSD = null) {
  const {
    pricing,
    tiers = [],
    baselineGoldUSD,
    adjustmentThresholdPct = 5,
    dynamicPricing = false,
  } = productConfig;

  // If no tiers, it's a simple pricing structure (like Annie Rose or Monika Couture)
  if (tiers.length === 0) {
    return {
      pricing, // Return as-is
      goldPricing: null,
    };
  }

  // Calculate adjusted prices for each tier
  const adjustedTiers = tiers.map((tier) => {
    const basePrice = pricing[tier.pricingKey];
    
    if (!basePrice) {
      console.error(`Missing pricing for tier: ${tier.pricingKey}`);
      return tier;
    }

    const result = calculateGoldAdjustedPrice(
      basePrice,
      currentGoldUSD || baselineGoldUSD,
      baselineGoldUSD,
      adjustmentThresholdPct,
      dynamicPricing
    );

    return {
      ...tier,
      basePrice,
      adjustedPrice: result.adjustedPrice,
      isAdjusted: result.isAdjusted,
    };
  });

  // Calculate gold pricing metadata
  const firstTier = adjustedTiers[0];
  const goldPricing = firstTier ? {
    currentGoldUSD: currentGoldUSD || baselineGoldUSD,
    baselineGoldUSD,
    percentMove: firstTier.isAdjusted 
      ? ((currentGoldUSD - baselineGoldUSD) / baselineGoldUSD) * 100 
      : 0,
    isAdjusted: firstTier.isAdjusted,
    status: currentGoldUSD ? 'live' : 'fallback',
  } : null;

  return {
    tiers: adjustedTiers,
    goldPricing,
  };
}

/**
 * Format price for display
 * 
 * @param {number} price - Price in CAD
 * @param {boolean} includeCurrency - Whether to include " CAD" suffix
 * @returns {string} - Formatted price (e.g., "$12,200" or "$12,200 CAD")
 */
export function formatPrice(price, includeCurrency = false) {
  const formatted = `$${price.toLocaleString()}`;
  return includeCurrency ? `${formatted} CAD` : formatted;
}

/**
 * Fetch live gold price from backend
 * 
 * @param {string} apiUrl - Backend API URL
 * @returns {Promise<number|null>} - Gold price in USD/oz, or null if failed
 */
export async function fetchLiveGoldPrice(apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/api/metals`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Extract gold price from response
    // Expected format: { gold_usd_oz: 5174.0, status: "live", ... }
    if (data.status === 'live' && data.gold_usd_oz && data.gold_usd_oz > 0) {
      return data.gold_usd_oz;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to fetch live gold price:', error.message);
    return null;
  }
}

/**
 * Hook-friendly pricing calculator
 * Use this in React components
 * 
 * @param {Object} productConfig - Product configuration from products.js
 * @param {number|null} liveGoldPrice - Live gold price from API
 * @returns {Object} - Calculated pricing data
 */
export function usePricingCalculation(productConfig, liveGoldPrice = null) {
  return calculateProductPricing(productConfig, liveGoldPrice);
}
