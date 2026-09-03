import React from "react";
import { usePresentment } from "../context/PresentmentContext";
import { formatUsd } from "../lib/livePricing";

/**
 * PHILEON — presentment-aware price label.
 *
 * Renders a canonical USD dollar amount localized through the shared
 * `usePresentment()` layer. When the visitor's selected/geolocated display
 * currency is USD, output matches the legacy `formatUsd` exactly. For any
 * other supported display currency, the amount is rendered as
 *   "Approx. C$X,XXX CAD"
 *   "Approx. £X,XXX GBP"
 *   "Approx. €X,XXX EUR"
 *   "Approx. A$X,XXX AUD"
 *   "Approx. ¥X,XXX JPY"
 *
 * DISPLAY-ONLY. Never used to compute cart / trusted / Stripe amounts.
 *
 * Props:
 *   usdDollars           canonical USD dollar amount (integer or float, e.g. 17000)
 *   usdCents             alternative — canonical USD cents (integer, e.g. 1700000)
 *   className, style     forwarded to the outer <span>
 *   as                   optional wrapper tag override (default: 'span')
 *   showCanonical        when true, also renders a small "· $X,XXX USD" reference
 *                        beside the localized amount when in non-USD mode
 *   testId               data-testid on the outer element
 */
export default function PresentmentPrice({
  usdDollars,
  usdCents,
  className,
  style,
  as: Tag = "span",
  showCanonical = false,
  testId,
  children,
}) {
  const presentment = usePresentment();
  const dollars = typeof usdDollars === "number"
    ? usdDollars
    : (typeof usdCents === "number" ? usdCents / 100 : 0);

  if (!presentment.isApproximate) {
    return (
      <Tag className={className} style={style} data-testid={testId}>
        {formatUsd(dollars)}
        {children}
      </Tag>
    );
  }

  return (
    <Tag className={className} style={style} data-testid={testId}>
      Approx. {presentment.formatDollars(dollars)}
      {showCanonical && (
        <span style={{ opacity: 0.5, marginLeft: 8, fontSize: "0.8em" }}
              data-testid={testId ? `${testId}-canonical` : undefined}>
          · {formatUsd(dollars)}
        </span>
      )}
      {children}
    </Tag>
  );
}
