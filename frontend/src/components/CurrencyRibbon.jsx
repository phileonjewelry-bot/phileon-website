import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { usePresentment } from "../context/PresentmentContext";

/**
 * PHILEON — First-visit international currency ribbon.
 *
 * Rendered site-wide via PublicLayout. Displays only when:
 *   (1) presentment.isApproximate     → geolocation/selection is non-USD
 *   (2) manualCurrency is null        → visitor hasn't manually picked yet
 *   (3) not previously dismissed within the 30-day window
 *
 * Copy: "Viewing estimated prices in {CURRENCY} · Final local amount
 *         confirmed at checkout"
 *
 * Dismissible; dismissal persists ~30 days via localStorage. Visually
 * understated, top-of-page, PHILEON-consistent.
 */
const DISMISS_KEY = "phi_currency_ribbon_dismissed_until";
const DISMISS_MS = 30 * 24 * 60 * 60 * 1000; // ~30 days

export default function CurrencyRibbon() {
  const p = usePresentment();
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid FOUC

  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (until && Date.now() < until) {
        setDismissed(true);
        return;
      }
      setDismissed(false);
    } catch {
      setDismissed(false);
    }
  }, []);

  // Only show for auto-detected international visitors who haven't picked yet.
  if (dismissed) return null;
  if (!p || !p.initialised) return null;
  if (!p.isApproximate) return null;
  if (p.manualCurrency) return null;

  const onDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS));
    } catch { /* ignore */ }
    setDismissed(true);
  };

  return (
    <div
      className="w-full bg-black/85 border-b border-[#C6A24A]/15 text-[11px] tracking-[0.14em]"
      data-testid="currency-ribbon-root"
    >
      <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center justify-center gap-3 text-white/60">
        <span data-testid="currency-ribbon-text" className="text-center">
          Viewing estimated prices in {p.currency}
          <span className="mx-2 text-white/25">·</span>
          <span className="text-white/45">Final local amount confirmed at checkout</span>
        </span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss currency notice"
          className="ml-2 text-white/40 hover:text-[#C6A24A] transition-colors"
          data-testid="currency-ribbon-dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
