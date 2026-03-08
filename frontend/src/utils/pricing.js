/**
 * PHILEON Pricing Utility
 * 
 * Centralized pricing logic for all products.
 * Uses products.js as the single source of truth.
 * Supports dynamic gold-based pricing with controlled adjustments.
 * 
 * Features:
 * - Dynamic gold pricing with threshold-based adjustments
 * - Slow adjustment curve (40% dampening)
 * - Maximum adjustment cap (±50%)
 * - 24-hour price stability window (daily pricing updates only)
 * - Graceful fallback to base pricing on API failure
 * - Per-product configuration
 * - Agent-proof architecture
 */

// ==========================================
// DAILY PRICE STABILITY - 24-HOUR CACHE
// ==========================================

const CACHE_KEY = 'phileon_pricing_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached pricing data from localStorage
 * @returns {Object|null} Cached data or null if not found/expired
 */
function getCachedPricing() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (less than 24 hours old)
    if (now - data.timestamp < CACHE_DURATION_MS) {
      return data;
    }
    
    // Cache expired
    return null;
  } catch (error) {
    console.warn('Failed to read pricing cache:', error);
    return null;
  }
}

/**
 * Save pricing data to localStorage cache
 * @param {number} goldPrice - Live gold spot price
 * @param {Object} pricingData - Calculated pricing data
 */
function setCachedPricing(goldPrice, pricingData) {
  try {
    const cacheData = {
      goldPrice,
      pricingData,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save pricing cache:', error);
  }
}

/**
 * Get last valid cached pricing (even if expired)
 * Used as fallback when API fails
 * @returns {Object|null} Last cached data or null
 */
function getLastValidCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch (error) {
    return null;
  }
}

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
 * Fetch live gold price with 24-hour caching
 * 
 * Behavior:
 * - Returns cached price if less than 24 hours old
 * - Fetches fresh data if cache expired or missing
 * - Falls back to last valid cache on API failure
 * - Returns null only if no cache and API fails
 * 
 * @param {string} apiUrl - Backend API URL
 * @returns {Promise<Object>} - { goldPrice: number, fromCache: boolean } or null
 */
export async function fetchLiveGoldPrice(apiUrl) {
  // Check cache first
  const cached = getCachedPricing();
  if (cached) {
    console.log('Using cached gold price (updated:', new Date(cached.timestamp).toLocaleString(), ')');
    return {
      goldPrice: cached.goldPrice,
      fromCache: true,
      timestamp: cached.timestamp,
    };
  }

  // Cache miss or expired - fetch fresh data
  try {
    const response = await fetch(`${apiUrl}/api/metals`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Extract gold price from response
    if (data.status === 'live' && data.gold_usd_oz && data.gold_usd_oz > 0) {
      console.log('Fetched fresh gold price:', data.gold_usd_oz);
      return {
        goldPrice: data.gold_usd_oz,
        fromCache: false,
      };
    }
    
    throw new Error('Invalid gold price data');
  } catch (error) {
    console.warn('Failed to fetch live gold price:', error.message);
    
    // Try to use last valid cache as fallback (even if expired)
    const lastValid = getLastValidCache();
    if (lastValid) {
      console.log('Using last valid cached price as fallback');
      return {
        goldPrice: lastValid.goldPrice,
        fromCache: true,
        fallback: true,
        timestamp: lastValid.timestamp,
      };
    }
    
    // No cache available at all
    return null;
  }
}

/**
 * Pricing calculator with daily stability (not a React hook)
 * Use this in React components
 * 
 * Automatically handles 24-hour caching for stable daily pricing
 * 
 * @param {Object} productConfig - Product configuration from products.js
 * @param {Object|null} liveGoldData - Live gold data from fetchLiveGoldPrice()
 * @returns {Object} - Calculated pricing data with cache status
 */
export function calculatePricingWithCache(productConfig, liveGoldData = null) {
  // If we have cached data, check if we should use it
  if (liveGoldData && liveGoldData.fromCache) {
    const cached = getCachedPricing();
    if (cached && cached.pricingData) {
      console.log('Using cached pricing calculations');
      return {
        ...cached.pricingData,
        fromCache: true,
        cacheAge: Date.now() - cached.timestamp,
      };
    }
  }

  // Calculate fresh pricing
  const goldPrice = liveGoldData ? liveGoldData.goldPrice : null;
  const pricingData = calculateProductPricing(productConfig, goldPrice);
  
  // Cache the results if we have fresh data
  if (liveGoldData && !liveGoldData.fromCache && goldPrice) {
    setCachedPricing(goldPrice, pricingData);
    console.log('Cached fresh pricing data');
  }
  
  return {
    ...pricingData,
    fromCache: false,
  };
}
