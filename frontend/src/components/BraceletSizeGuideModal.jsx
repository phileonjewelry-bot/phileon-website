/* ==========================================================================
   PHILEON — BRACELET SIZE GUIDE (shared, reusable for future bracelets/bangles)
   Accessible modal: ESC + backdrop close, focus trap on the close button,
   returns focus to the launcher on close.
   ========================================================================== */
import React, { useEffect, useRef } from "react";

const CHART = [
  { label: "Small",       mm: 180, range: "160 – 170 mm" },
  { label: "Medium",      mm: 190, range: "170 – 180 mm" },
  { label: "Large",       mm: 200, range: "180 – 190 mm" },
  { label: "Extra Large", mm: 210, range: "190 – 200 mm" },
];

export default function BraceletSizeGuideModal({
  open,
  onClose,
  productNote = null, // optional product-specific fit line
  returnFocusRef = null,
}) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => closeRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      returnFocusRef?.current?.focus?.();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bracelet-guide-title"
      onClick={onClose}
      data-testid="bracelet-size-guide"
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.86)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "clamp(16px, 4vw, 48px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0e0e0e", color: "#fff",
          maxWidth: 720, width: "100%", maxHeight: "88vh",
          overflowY: "auto",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 4,
          padding: "clamp(28px, 5vw, 56px)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.24em", color: "#C6A25D", marginBottom: 6 }}>PHILEON FINE JEWELRY</p>
            <h2 id="bracelet-guide-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, letterSpacing: "0.02em", margin: 0 }}>
              Bracelet Size Guide
            </h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close size guide"
            data-testid="bracelet-size-guide-close"
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", fontSize: 22, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >×</button>
        </div>

        <h3 style={{ fontSize: 11, letterSpacing: "0.24em", color: "#C6A25D", marginTop: 12, marginBottom: 12 }}>HOW TO FIND YOUR WRIST SIZE</h3>
        <ol style={{ fontSize: 14, lineHeight: 1.7, color: "#e2e2e2", paddingLeft: 20, margin: 0 }}>
          <li>Wrap a flexible measuring tape around the wrist where the bangle will sit.</li>
          <li>Keep the tape comfortably against the skin without pulling it tight.</li>
          <li>Record the wrist measurement in millimetres.</li>
          <li>Select the finished bracelet size that provides the desired amount of ease.</li>
          <li>Because CRESTA NERA opens with a hinge and latch, it is sized to the wrist and does not need to pass over the hand.</li>
        </ol>

        <h3 style={{ fontSize: 11, letterSpacing: "0.24em", color: "#C6A25D", marginTop: 32, marginBottom: 12 }}>FIT GUIDANCE</h3>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#e2e2e2", margin: "0 0 10px 0" }}><strong>For a close fit:</strong> choose a finished inside circumference approximately 5–10 mm larger than the wrist measurement.</p>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#e2e2e2", margin: "0 0 10px 0" }}><strong>For a comfortable fit:</strong> choose a finished inside circumference approximately 10–15 mm larger than the wrist measurement.</p>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#e2e2e2", margin: "0 0 18px 0" }}><strong>For a relaxed fit:</strong> choose a finished inside circumference approximately 15–20 mm larger than the wrist measurement.</p>

        {productNote ? (
          <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#c9c9c9", padding: 16, background: "rgba(198,162,93,0.06)", border: "1px solid rgba(198,162,93,0.2)", borderRadius: 3, margin: "0 0 18px 0" }}>
            {productNote}
          </p>
        ) : null}

        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#c9c9c9", margin: "0 0 8px 0" }}>Measure the exact wrist on which the bangle will be worn.</p>
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#c9c9c9", margin: "0 0 24px 0" }}>Measure when the wrist is at its normal size and not unusually swollen.</p>

        <h3 style={{ fontSize: 11, letterSpacing: "0.24em", color: "#C6A25D", marginTop: 24, marginBottom: 14 }}>SIZE CHART</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 0, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ padding: "10px 14px", fontSize: 11, letterSpacing: "0.14em", color: "#8a8a8a", background: "rgba(255,255,255,0.03)" }}>SIZE</div>
          <div style={{ padding: "10px 14px", fontSize: 11, letterSpacing: "0.14em", color: "#8a8a8a", background: "rgba(255,255,255,0.03)" }}>FINISHED I.C.</div>
          <div style={{ padding: "10px 14px", fontSize: 11, letterSpacing: "0.14em", color: "#8a8a8a", background: "rgba(255,255,255,0.03)" }}>RECOMMENDED WRIST</div>
          {CHART.map((row) => (
            <React.Fragment key={row.label}>
              <div style={{ padding: "12px 14px", fontSize: 14, color: "#fff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>{row.label}</div>
              <div style={{ padding: "12px 14px", fontSize: 14, color: "#fff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>{row.mm} mm</div>
              <div style={{ padding: "12px 14px", fontSize: 14, color: "#c9c9c9", borderTop: "1px solid rgba(255,255,255,0.06)" }}>approx. {row.range}</div>
            </React.Fragment>
          ))}
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: "#8a8a8a", fontStyle: "italic" }}>
          Recommendations are presented as general fit guidance, not a guarantee.
        </p>
      </div>
    </div>
  );
}
