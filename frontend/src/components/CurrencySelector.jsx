import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe2 } from "lucide-react";
import { usePresentment } from "../context/PresentmentContext";

/**
 * Header currency selector. Display-only.
 *   • Persists manual choice ~30 days (localStorage + cookie).
 *   • Never affects Stripe amount, shipping, tax, or trust boundary.
 */
export default function CurrencySelector({ compact = false }) {
  const { currency, supported, setCurrency, isApproximate } = usePresentment();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative" data-testid="currency-selector-root">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 text-[#C6A24A] hover:text-[#D4B45A] transition-colors ${compact ? "text-[10px]" : "text-xs"} tracking-[0.18em] uppercase font-medium`}
        aria-haspopup="listbox"
        aria-expanded={open}
        data-testid="currency-selector-trigger"
      >
        <Globe2 className="w-3.5 h-3.5" />
        <span data-testid="currency-selector-code">{currency}</span>
        {isApproximate && !compact && (
          <span className="text-white/40 text-[9px] tracking-[0.24em]">APPROX.</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[190px] bg-black border border-[#C6A24A]/20 shadow-xl py-2 z-50"
          role="listbox"
          data-testid="currency-selector-menu"
        >
          {(supported || []).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => { setCurrency(code); setOpen(false); }}
              className={`block w-full text-left px-4 py-2 text-[12px] tracking-[0.16em] uppercase transition-colors ${
                code === currency
                  ? "text-[#C6A24A] bg-white/5"
                  : "text-white/70 hover:text-[#C6A24A] hover:bg-white/5"
              }`}
              data-testid={`currency-option-${code}`}
              aria-selected={code === currency}
              role="option"
            >
              {code}
              {code === "USD" && (
                <span className="ml-2 text-white/35 text-[10px] tracking-[0.24em]">EXACT</span>
              )}
              {code !== "USD" && code === currency && (
                <span className="ml-2 text-white/35 text-[10px] tracking-[0.24em]">APPROX.</span>
              )}
            </button>
          ))}
          <p className="text-white/35 text-[10px] leading-relaxed px-4 pt-2 pb-1">
            Final local amount confirmed at secure checkout.
          </p>
        </div>
      )}
    </div>
  );
}
