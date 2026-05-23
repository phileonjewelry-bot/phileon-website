import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * RingSizeSelector — sitewide ring size control for every ring product.
 *
 * UX requirements (per spec):
 *   - Uppercase label "RING SIZE", small tracking
 *   - Dark glass field, product-accent border, custom chevron
 *   - No default browser <select> styling
 *   - Sizes US 4 → US 12 in 0.5 increments + "Custom Above US 12"
 *   - Sizing microcopy directly under the selector
 *   - Optional wide-band warning when bandWidthMm >= 10
 *
 * Cart payload contract:
 *   - value: string size token, e.g. "7.5" or "custom"
 *   - labelFor(value) helper exposes the display label
 *     (e.g. "US 7.5", "Custom Above US 12") — exported so cart line
 *     titles + product ids stay consistent across all ring pages.
 *
 * Visual theming:
 *   - The selector inherits color via CSS custom properties
 *     (`--ring-accent`, `--ring-bg`, `--ring-fg`) which each page can
 *     override inline via a `style` prop. Defaults read as "champagne
 *     gold on deep ink" so it ships sensibly on any product page.
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

/** Returns a URL-safe token for product ids: "7.5" → "7-5", "custom" → "custom". */
export function ringSizeIdToken(value) {
  if (!value) return "";
  if (value === "custom") return "custom";
  return String(value).replace(".", "-");
}

export default function RingSizeSelector({
  value,
  onChange,
  sizes = DEFAULT_RING_SIZES,
  label = "RING SIZE",
  bandWidthMm = null,
  showSizingMicrocopy = true,
  onOpenSizeGuide = null,
  onBookSizingAppointment = null,
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
        .rss-field-value.is-empty { color: var(--rss-muted); font-family: 'Inter', sans-serif; font-size: 0.85rem; letter-spacing: 0.18em; }
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

        .rss-help {
          margin-top: 14px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.92rem;
          line-height: 1.55;
          color: var(--rss-muted);
          max-width: 520px;
        }
        .rss-help p { margin: 0 0 6px; }
        .rss-help-actions {
          margin-top: 6px;
          font-family: 'Inter', sans-serif;
          font-style: normal;
          font-size: 10px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
        }
        .rss-help-actions button,
        .rss-help-actions a {
          background: none; border: none; padding: 0;
          color: var(--rss-accent);
          cursor: pointer;
          font: inherit;
          letter-spacing: inherit;
          text-decoration: none;
          border-bottom: 1px solid color-mix(in srgb, var(--rss-accent) 40%, transparent);
          transition: color 240ms ease, border-color 240ms ease;
        }
        .rss-help-actions button:hover,
        .rss-help-actions a:hover { color: #fff; border-color: var(--rss-accent); }
        .rss-help-actions .rss-divider {
          display: inline-block;
          margin: 0 10px;
          color: var(--rss-muted);
          border: none;
          letter-spacing: 0;
        }

        .rss-wideband {
          margin-top: 14px;
          padding: 12px 14px;
          background: color-mix(in srgb, var(--rss-accent) 8%, transparent);
          border-left: 2px solid var(--rss-accent);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.92rem;
          line-height: 1.5;
          color: var(--rss-fg);
        }
        .rss-wideband strong {
          font-family: 'Inter', sans-serif;
          font-style: normal;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: var(--rss-accent);
          display: block;
          margin-bottom: 4px;
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
        onClick={() => setOpen((o) => !o)}
        data-testid={`${testIdPrefix}-button`}
      >
        <span className={`rss-field-value ${value ? "" : "is-empty"}`}>
          {value ? ringSizeLabel(value) : "Select your size"}
        </span>
        <ChevronDown className="rss-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Ring size"
          className="rss-menu"
          data-testid={`${testIdPrefix}-menu`}
        >
          {sizes.map((s) => {
            const isSel = value === s;
            const isCustom = s === "custom";
            return (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={isSel}
                onClick={() => handleSelect(s)}
                className={`rss-option ${isCustom ? "is-custom" : ""} ${isSel ? "is-selected" : ""}`}
                data-testid={`${testIdPrefix}-opt-${ringSizeIdToken(s)}`}
              >
                <span>{ringSizeLabel(s)}</span>
                {isSel && <span className="rss-option-mark">SELECTED</span>}
              </button>
            );
          })}
        </div>
      )}

      {showSizingMicrocopy && (
        <div className="rss-help" data-testid={`${testIdPrefix}-help`}>
          <p>Not sure of your size?</p>
          <p>
            Book a sizing appointment or request our sizing guide before ordering.
          </p>
          <p>
            For wide bands, we recommend sizing up by 0.25–0.5 depending on fit preference.
          </p>
          {(onOpenSizeGuide || onBookSizingAppointment) && (
            <p className="rss-help-actions">
              {onBookSizingAppointment && (
                <button
                  type="button"
                  onClick={onBookSizingAppointment}
                  data-testid={`${testIdPrefix}-book-sizing-btn`}
                >
                  BOOK SIZING APPOINTMENT
                </button>
              )}
              {onBookSizingAppointment && onOpenSizeGuide && (
                <span className="rss-divider" aria-hidden="true">·</span>
              )}
              {onOpenSizeGuide && (
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  data-testid={`${testIdPrefix}-view-guide-btn`}
                >
                  VIEW SIZE GUIDE
                </button>
              )}
            </p>
          )}
        </div>
      )}

      {isWideBand && (
        <div className="rss-wideband" data-testid={`${testIdPrefix}-wideband-warning`}>
          <strong>WIDE BAND</strong>
          This is a wide-band ring. Wider rings usually fit tighter than narrow bands —
          we recommend sizing up by 0.25–0.5.
        </div>
      )}
    </div>
  );
}
