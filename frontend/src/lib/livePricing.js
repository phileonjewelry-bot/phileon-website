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

export function formatCad(value) {
  // Output format: "$X,XXX" — currency suffix " USD" appended at the
  // call site. Site-wide currency is USD; function name retained for
  // backward compatibility.
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
