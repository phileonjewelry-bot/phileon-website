// Seasonal availability windows (mirrors backend pricing_engine_catalog `season` config).
// Retirement is seasonal, never a permanent discontinuation; reopening needs owner authorization.
export const SEASONAL_PRODUCTS = {
  "lady-jay": {
    closesAt: new Date("2026-11-01T00:00:00-04:00"), // 2026-11-01 00:00 America/Toronto
    reopensAt: null,
    retiredMessage: "Retired until the opening of the 2027 Jays season.",
    retiredSubline: "Returning for the 2027 season.",
  },
};

export function seasonalState(slug, now = new Date()) {
  const s = SEASONAL_PRODUCTS[slug];
  if (!s) return { seasonal: false, retired: false, message: null };
  const open = now < s.closesAt || (s.reopensAt && now >= s.reopensAt);
  return { seasonal: true, retired: !open, message: open ? null : s.retiredMessage, subline: open ? null : s.retiredSubline };
}
