/* ==========================================================================
   PHILEON — WRIST SIZE SELECTOR (shared, reusable for bracelets/bangles)
   Same visual language as RingSizeSelector but with wrist-appropriate copy
   and finished-inside-circumference values. First consumer: CRESTA NERA.
   ========================================================================== */
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const DEFAULT_WRIST_SIZES = [
  { value: "small", label: "Small",       mm: 180 },
  { value: "medium", label: "Medium",     mm: 190 },
  { value: "large", label: "Large",       mm: 200 },
  { value: "xl",    label: "Extra Large", mm: 210 },
];

export function wristSizeById(id, sizes = DEFAULT_WRIST_SIZES) {
  return sizes.find((s) => s.value === id) || null;
}

export function wristSizeLabel(id, sizes = DEFAULT_WRIST_SIZES) {
  const s = wristSizeById(id, sizes);
  return s ? `${s.label} · ${s.mm} mm` : "";
}

export default function WristSizeSelector({
  value,
  onChange,
  sizes = DEFAULT_WRIST_SIZES,
  label = "WRIST SIZE",
  placeholder = "SELECT WRIST SIZE",
  invalid = false,
  errorMessage = "",
  testIdPrefix = "wrist-size",
  onOpenSizeGuide,
  style = {},
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rss-root" data-testid={`${testIdPrefix}-root`} style={style}>
      <label className="rss-label" htmlFor={`${testIdPrefix}-button`}>{label}</label>

      <div className="rss-field-wrap" style={{ position: "relative" }}>
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
            {value ? wristSizeLabel(value, sizes) : placeholder}
          </span>
          <ChevronDown className="rss-chevron" aria-hidden="true" />
        </button>

        {open && (
          <div role="listbox" aria-label="Wrist size" className="rss-menu" data-testid={`${testIdPrefix}-menu`}>
            {sizes.map((s) => {
              const isSel = value === s.value;
              return (
                <button
                  key={s.value}
                  role="option"
                  aria-selected={isSel}
                  className={`rss-option ${isSel ? "is-selected" : ""}`}
                  data-testid={`${testIdPrefix}-opt-${s.value}`}
                  onClick={() => { onChange(s.value); setOpen(false); }}
                >
                  <span>{s.label} · {s.mm} mm</span>
                  {isSel && <span className="rss-option-mark">SELECTED</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

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

      {onOpenSizeGuide ? (
        <p style={{ marginTop: 12, fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>
          Need help?{" "}
          <button
            type="button"
            onClick={onOpenSizeGuide}
            data-testid={`${testIdPrefix}-guide-link`}
            style={{
              background: "none", border: "none", padding: 0,
              color: "#C6A25D", textDecoration: "underline", cursor: "pointer",
              font: "inherit", letterSpacing: "0.05em", textTransform: "uppercase",
            }}
          >
            View our bracelet-size guide
          </button>
        </p>
      ) : null}
    </div>
  );
}
