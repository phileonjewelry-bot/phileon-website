import { usePresentment } from "../context/PresentmentContext";

/**
 * Return a component-scoped `formatUsd(n)` function that localizes the
 * canonical USD dollar amount `n` through the current presentment layer.
 *
 *   - Active currency == USD → returns "$X,XXX USD" (canonical).
 *   - Any other supported currency → returns "Approx. C$X,XXX CAD" etc.
 *
 * DISPLAY-ONLY. Do NOT use this hook's output to build cart items, Stripe
 * amounts, or any trusted money value. All trusted paths continue to
 * consume canonical USD cents.
 */
export function useLocalizedUsdFormatter() {
  const p = usePresentment();
  return (n) => {
    const dollars = Number(n || 0);
    if (!p || !p.isApproximate) {
      return `$${Math.round(dollars).toLocaleString("en-US")} USD`;
    }
    return `Approx. ${p.formatDollars(dollars)}`;
  };
}

export default useLocalizedUsdFormatter;
