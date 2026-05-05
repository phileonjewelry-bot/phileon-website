const KARAT_MULTIPLIERS = {
  "10K": 10 / 24,
  "14K": 14 / 24,
  "18K": 18 / 24,
  "925": 0.925,
};

const DEFAULT_MARKET = {
  goldPerGram24kCad: 150,
  silverPerGramCad: 1.25,
};

function roundLuxury(value) {
  return Math.round(value / 50) * 50;
}

export function getSpotPerGramCad(metalType, market = DEFAULT_MARKET) {
  if (metalType === "925") return market.silverPerGramCad;
  return market.goldPerGram24kCad;
}

export function calculateMetalValueCad({ weightGrams, metalType, market }) {
  const spot = getSpotPerGramCad(metalType, market);
  const multiplier = KARAT_MULTIPLIERS[metalType] || 1;
  return spot * multiplier * weightGrams;
}

export function calculateLiveDisplayPrice({
  lockedBasePriceCad,
  lockedMetalReferenceCad,
  currentMetalValueCad,
  rounding = true,
}) {
  const metalAdjustmentCad = currentMetalValueCad - lockedMetalReferenceCad;
  const raw = lockedBasePriceCad + metalAdjustmentCad;
  return rounding ? roundLuxury(raw) : raw;
}

export function formatUsd(value) {
  // Output format: "$X,XXX" — currency suffix " USD" appended at the
  // call site. Site-wide currency is USD.
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// Backwards-compatible alias — internal name retained so older imports keep
// working until they're swept. New code should import formatUsd.
export const formatCad = formatUsd;

/**
 * PHILEON USD pricing rule.
 *
 * Internal pricing is stored in CAD. Storefront display must convert to USD
 * via FX 0.75 and round to luxury-clean numbers:
 *   - nearest $50 for prices < $2,000
 *   - nearest $500 for prices >= $2,000
 *
 * Examples from spec:
 *   $480 CAD → $350 USD
 *   $1,450 CAD → $1,100 USD
 *   $12,800 CAD → $9,500 USD
 *   $22,800 CAD → $17,000 USD
 */
const PHILEON_FX = 0.75;

export function cadToUsdLuxury(cadValue) {
  if (typeof cadValue !== "number" || !isFinite(cadValue) || cadValue <= 0) {
    return 0;
  }
  const raw = cadValue * PHILEON_FX;
  const step = raw < 2000 ? 50 : 500;
  return Math.round(raw / step) * step;
}
