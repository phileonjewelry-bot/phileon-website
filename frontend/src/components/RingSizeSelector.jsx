import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

/**
 * RingSizeSelector — sitewide ring size control for every ring product.
 *
 * Sitewide spec:
 *   - Uppercase label "RING SIZE", small tracking
 *   - Dark glass field, product-accent border, custom chevron
 *   - No native <select> styling
 *   - Sizes US 4 → US 12 in 0.5 increments + "Custom Above US 12" (18 total)
 *   - Default US 7
 *   - Sizing microcopy under the selector — calm, jeweler-led, no
 *     "book sizing appointment" language (online customers can't
 *     realistically use that)
 *   - Wide-band fit notice when bandWidthMm >= 10
 *   - When user picks "custom", show a small lead-time note
 *
 * Cart payload contract — helpers exported:
 *   - ringSizeLabel("7.5") → "US 7.5"
 *   - ringSizeLabel("custom") → "Custom Above US 12"
 *   - ringSizeIdToken("7.5") → "7-5"
 *   - ringSizeIdToken("custom") → "custom"
 *
 * Theming:
 *   - CSS custom properties: --ring-accent, --ring-bg, --ring-fg,
 *     --ring-muted. Defaults read as champagne gold on ink. Each page
 *     can override via inline style on the component.
 */

export const DEFAULT_RING_SIZES = [
  "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5",
  "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12",
  "custom",
];

export const DEFAULT_RING_SIZE = "7";

/** Returns the human-readable label for a size token. */
export function ringSizeLabel(value) {
  if (!value) return "";
  if (value === "custom") return "Custom Above US 12";
  return `US ${value}`;
}

/** URL-safe token for product ids: "7.5" → "7-5", "custom" → "custom". */
export function ringSizeIdToken(value) {
  if (!value) return "";
  if (value === "custom") return "custom";
  return String(value).replace(".", "-");
}

/** SKU-safe size token: "7.5" → "7_5", "custom" → "CUSTOM". */
export function ringSizeSkuToken(value) {
  if (!value) return "";
  if (value === "custom") return "CUSTOM";
  return String(value).replace(".", "_");
}

export default function RingSizeSelector({
  value,
  onChange,
  sizes = DEFAULT_RING_SIZES,
  label = "RING SIZE",
  placeholder = "Select your size",
  bandWidthMm = null,
  showSizingMicrocopy = true,
  hideWideBandWarning = false,
  invalid = false,
  errorMessage = "",
  testIdPrefix = "ring-size",
  className = "",
  style = {},
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isWideBand = typeof bandWidthMm === "number" && bandWidthMm >= 10;
  const isCustom = value === "custom";

  const handleSelect = (v) => {
    onChange?.(v);
    setOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className={`rss-root ${className}`}
      style={style}
      data-testid={`${testIdPrefix}-root`}
    >
      <style>{`
        .rss-root {
          --rss-accent: var(--ring-accent, #c6a24a);
          --rss-bg:     var(--ring-bg, rgba(10, 10, 14, 0.85));
          --rss-fg:     var(--ring-fg, #ece9e0);
          --rss-muted:  var(--ring-muted, rgba(236, 233, 224, 0.55));
          --rss-border: color-mix(in srgb, var(--rss-accent) 32%, transparent);
          --rss-border-hover: color-mix(in srgb, var(--rss-accent) 70%, transparent);
          font-family: 'Inter', sans-serif;
          position: relative;
          width: 100%;
        }
        .rss-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: var(--rss-muted);
          margin: 0 0 12px;
        }
        .rss-field {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 16px 18px;
          background: var(--rss-bg);
          color: var(--rss-fg);
          border: 1px solid var(--rss-border);
          font-family: 'Cinzel', serif;
          font-size: 0.98rem;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: border-color 280ms ease, background 280ms ease;
          backdrop-filter: blur(6px);
          text-align: left;
        }
        .rss-field:hover,
        .rss-field[aria-expanded="true"] { border-color: var(--rss-border-hover); }
        .rss-field-value { line-height: 1; }
        .rss-field-value.is-empty {
          color: var(--rss-muted);
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.18em;
        }
        .rss-chevron {
          width: 14px; height: 14px;
          color: var(--rss-accent);
          transition: transform 320ms ease;
          flex: 0 0 auto;
        }
        .rss-field[aria-expanded="true"] .rss-chevron { transform: rotate(180deg); }

        .rss-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          z-index: 40;
          max-height: 320px;
          overflow-y: auto;
          background: var(--rss-bg);
          border: 1px solid var(--rss-border-hover);
          backdrop-filter: blur(12px);
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.45);
          padding: 6px 0;
        }
        .rss-option {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: transparent;
          border: none;
          color: var(--rss-fg);
          font-family: 'Cinzel', serif;
          font-size: 0.92rem;
          letter-spacing: 0.06em;
          cursor: pointer;
          text-align: left;
          transition: background 200ms ease, color 200ms ease;
        }
        .rss-option:hover,
        .rss-option.is-selected {
          background: color-mix(in srgb, var(--rss-accent) 14%, transparent);
          color: #fff;
        }
        .rss-option.is-custom {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 1rem;
          letter-spacing: 0.02em;
          color: var(--rss-muted);
          border-top: 1px solid color-mix(in srgb, var(--rss-accent) 16%, transparent);
          margin-top: 4px;
        }
        .rss-option.is-custom.is-selected,
        .rss-option.is-custom:hover { color: var(--rss-fg); }
        .rss-option-mark {
          font-size: 0.7em;
          letter-spacing: 0.34em;
          color: var(--rss-accent);
          text-transform: uppercase;
        }

        .rss-custom-note {
          margin-top: 10px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--rss-muted);
        }

        .rss-help {
          margin-top: 14px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.92rem;
          line-height: 1.55;
          color: var(--rss-muted);
          max-width: 540px;
        }
        .rss-help p { margin: 0 0 6px; }
        .rss-help p:last-child { margin-bottom: 0; }

        .rss-wideband {
          margin-top: 16px;
          padding: 14px 16px;
          background: color-mix(in srgb, var(--rss-accent) 8%, transparent);
          border-left: 2px solid var(--rss-accent);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.92rem;
          line-height: 1.55;
          color: var(--rss-fg);
        }
        .rss-wideband-eyebrow {
          display: block;
          font-family: 'Inter', sans-serif;
          font-style: normal;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: var(--rss-accent);
          margin-bottom: 8px;
        }
        .rss-wideband p { margin: 0 0 6px; }
        .rss-wideband p:last-child { margin-bottom: 0; }

        /* Ring Size Guide CTA — auto-rendered for every ring product
         * (any product using RingSizeSelector is, by definition, a ring). */
        .rss-sizeguide-cta {
          margin-top: 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px 10px;
          align-items: baseline;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 0.92rem;
          color: var(--rss-muted);
        }
        .rss-sizeguide-cta-link {
          color: var(--rss-accent);
          font-family: 'Cinzel', serif;
          font-style: normal;
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid color-mix(in srgb, var(--rss-accent) 35%, transparent);
          padding-bottom: 2px;
          transition: color 220ms ease, border-color 220ms ease;
        }
        .rss-sizeguide-cta-link:hover {
          color: var(--rss-fg);
          border-color: var(--rss-accent);
        }
      `}</style>

      <label className="rss-label" htmlFor={`${testIdPrefix}-button`}>
        {label}
      </label>

      <button
        id={`${testIdPrefix}-button`}
        type="button"
        className="rss-field"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && errorMessage ? `${testIdPrefix}-error` : undefined}
        onClick={() => setOpen((o) => !o)}
        data-testid={`${testIdPrefix}-button`}
        style={invalid ? { borderColor: "#c65b5b" } : undefined}
      >
        <span className={`rss-field-value ${value ? "" : "is-empty"}`}>
          {value ? ringSizeLabel(value) : placeholder}
        </span>
        <ChevronDown className="rss-chevron" aria-hidden="true" />
      </button>

      {invalid && errorMessage ? (
        <p
          id={`${testIdPrefix}-error`}
          role="alert"
          data-testid={`${testIdPrefix}-error`}
          style={{
            marginTop: 10,
            fontFamily: "'Inter', sans-serif",
            fontSize: 12.5,
            letterSpacing: "0.02em",
            color: "#e08282",
          }}
        >
          {errorMessage}
        </p>
      ) : null}

      {open && (
        <div
          role="listbox"
          aria-label="Ring size"
          className="rss-menu"
          data-testid={`${testIdPrefix}-menu`}
        >
          {sizes.map((s) => {
            const isSel = value === s;
            const isCustomOpt = s === "custom";
            return (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={isSel}
                onClick={() => handleSelect(s)}
                className={`rss-option ${isCustomOpt ? "is-custom" : ""} ${isSel ? "is-selected" : ""}`}
                data-testid={`${testIdPrefix}-opt-${ringSizeIdToken(s)}`}
              >
                <span>{ringSizeLabel(s)}</span>
                {isSel && <span className="rss-option-mark">SELECTED</span>}
              </button>
            );
          })}
        </div>
      )}

      {isCustom && (
        <p className="rss-custom-note" data-testid={`${testIdPrefix}-custom-note`}>
          Custom sizes may require additional production time.
        </p>
      )}

      {/* Auto-rendered for every ring product using this selector. */}
      <div className="rss-sizeguide-cta" data-testid={`${testIdPrefix}-guide-cta`}>
        <span>Need help finding your size?</span>
        <Link
          to="/ring-size-guide"
          className="rss-sizeguide-cta-link"
          data-testid={`${testIdPrefix}-guide-link`}
        >
          View our Ring Size Guide <span aria-hidden="true">→</span>
        </Link>
      </div>

      {showSizingMicrocopy && (
        <div className="rss-help" data-testid={`${testIdPrefix}-help`}>
          <p>Not sure of your size?</p>
          <p>We recommend visiting a local jeweler to confirm your ring size before ordering.</p>
          <p>You may also compare your fit against an existing ring worn on the same finger.</p>
          <p>For wide-band rings, sizing up by 0.25–0.5 sizes is often recommended depending on desired fit.</p>
        </div>
      )}

      {isWideBand && !hideWideBandWarning && (
        <div className="rss-wideband" data-testid={`${testIdPrefix}-wideband-warning`}>
          <span className="rss-wideband-eyebrow">WIDE BAND FIT NOTICE</span>
          <p>Wide rings usually fit tighter than narrow bands due to increased skin contact across the finger.</p>
          <p>If you are between sizes, we generally recommend sizing slightly larger.</p>
        </div>
      )}
    </div>
  );
}
