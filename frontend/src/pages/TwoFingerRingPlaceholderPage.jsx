import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TWO-FINGER RING — WORKING CONCEPT · PHILEON Fine Jewelry
//
// Temporary holding page for a piece IN DEVELOPMENT. Final CAD, sizing, stone
// specs, weight, SKU, price, product name, production lead time and photography
// are all pending merchant + atelier sign-off.
//
// ENGINEERING RULE: every mutable value lives in the PRODUCT config below.
// When final data arrives, replace the fields — the page structure does not
// need to be rebuilt. Do NOT hard-code values inside the render tree.
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT = {
  // Public working title (may be renamed on final release).
  title: "TWO-FINGER RING",
  workingTag: "WORKING CONCEPT",
  subtitle: "PHILEON Fine Jewelry · In Development",

  // Editorial statement — customer-facing copy.
  statement:
    "Two stones. Two fingers. One piece.",
  statementBody:
    "A compact two-finger structure brings a baby-blue princess cut and vivid pink round brilliant into one continuous form. Alternating pink and white halos frame the centers while reptile-inspired engraving moves across the white-gold bridge and exterior shanks.",
  statementNote:
    "The final CAD is currently being refined for fit, comfort and manufacturing.",

  // Approved concept — the design language established so far. This is safe
  // to publish. Nothing here commits weights, dimensions, sizes or price.
  designDetails: [
    "10K white gold — final metal specification pending",
    "One integrated two-finger structure with two separate finger openings underneath",
    "Compact two-head architecture with a short sculptural bridge",
    "Large baby-blue princess-cut center stone (Head 1)",
    "Large pink round brilliant-cut center stone (Head 2)",
    "One halo around each center — alternating pink and white round stones",
    "Reptile / snakeskin-inspired engraved texture across bridge, outer shoulders and exterior shanks",
    "Smooth polished interior finger surfaces for wearability",
    "Open galleries beneath each center stone",
    "No pavé outside the halos — negative space kept intentional",
  ],

  // Purchase area — DO NOT enable. No fake $0.
  status: "COMING SOON",
  purchaseNote: "Final specifications and pricing pending CAD approval.",

  // Image slots — reserved editorial positions. Each field is null until
  // final photography is supplied. `alt` is populated now so screen-reader
  // context is preserved when images land.
  images: {
    hero:            { src: null, alt: "TWO-FINGER RING — hero on black background (image pending)." },
    frontThreeQuarter: { src: null, alt: "TWO-FINGER RING — front three-quarter view (image pending)." },
    topView:         { src: null, alt: "TWO-FINGER RING — top-down view showing both halos (image pending)." },
    onHand:          { src: null, alt: "TWO-FINGER RING — on-hand editorial view (image pending)." },
    rearUnderside:   { src: null, alt: "TWO-FINGER RING — rear / underside view showing open galleries (image pending)." },
    sideProfile:     { src: null, alt: "TWO-FINGER RING — side profile showing shank architecture (image pending)." },
    stoneMacro:      { src: null, alt: "TWO-FINGER RING — macro of the princess-cut and round brilliant centers (image pending)." },
    reptileTexture:  { src: null, alt: "TWO-FINGER RING — macro of the reptile-inspired engraved texture (image pending)." },
  },
};

// Ordered gallery — matches the eight approved slots. Keeps `key`s stable so
// image drop-ins do not shift positions.
const GALLERY_ORDER = [
  { key: "frontThreeQuarter", label: "Front · 3/4" },
  { key: "topView",           label: "Top View" },
  { key: "onHand",            label: "On-Hand" },
  { key: "rearUnderside",     label: "Rear · Underside" },
  { key: "sideProfile",       label: "Side Profile" },
  { key: "stoneMacro",        label: "Stone Macro" },
  { key: "reptileTexture",    label: "Reptile Texture" },
];

// ─── Placeholder tile ────────────────────────────────────────────────────────
function PlaceholderTile({ label, testid }) {
  return (
    <div style={styles.placeholderTile} data-testid={testid}>
      <div style={styles.placeholderInner}>
        <span style={styles.placeholderDot} aria-hidden="true" />
        <p style={styles.placeholderLabel}>Image Pending</p>
        {label && <p style={styles.placeholderSub}>{label}</p>}
      </div>
    </div>
  );
}

// ─── Media slot — renders image if present, otherwise placeholder tile ──────
function MediaSlot({ image, label, testid }) {
  if (image?.src) {
    return (
      <div style={styles.mediaSlot} data-testid={testid}>
        <img src={image.src} alt={image.alt} style={styles.mediaImg} />
      </div>
    );
  }
  return <PlaceholderTile label={label} testid={testid} />;
}

export default function TwoFingerRingPlaceholderPage() {
  return (
    <div style={styles.page} data-testid="tfr-page">
      <SeoHead />

      {/* Hero */}
      <section style={styles.hero} data-testid="tfr-hero">
        <div style={styles.heroMedia}>
          {PRODUCT.images.hero.src ? (
            <img src={PRODUCT.images.hero.src} alt={PRODUCT.images.hero.alt} style={styles.heroImg} data-testid="tfr-hero-image" />
          ) : (
            <PlaceholderTile label="Hero · Black Background" testid="tfr-hero-placeholder" />
          )}
        </div>
        <div style={styles.heroTitleWrap}>
          <p style={styles.eyebrow}>PHILEON FINE JEWELRY · IN DEVELOPMENT</p>
          <h1 style={styles.h1} data-testid="tfr-title">{PRODUCT.title}</h1>
          <p style={styles.workingTag} data-testid="tfr-working-tag">{PRODUCT.workingTag}</p>
        </div>
      </section>

      {/* Editorial statement */}
      <section style={styles.section} data-testid="tfr-statement">
        <div style={styles.narrow}>
          <p style={styles.statementLead}>{PRODUCT.statement}</p>
          <p style={styles.copy}>{PRODUCT.statementBody}</p>
          <p style={styles.copyEm}>{PRODUCT.statementNote}</p>
        </div>
      </section>

      {/* In Development status */}
      <section style={styles.statusSection} data-testid="tfr-status">
        <div style={styles.statusPill}>
          <span style={styles.statusDot} aria-hidden="true" />
          <span style={styles.statusText}>IN DEVELOPMENT</span>
        </div>
        <p style={styles.subtitle} data-testid="tfr-subtitle">{PRODUCT.subtitle}</p>
      </section>

      {/* Design details */}
      <section style={styles.section} data-testid="tfr-design-details">
        <div style={styles.narrow}>
          <p style={styles.eyebrowCenter}>APPROVED DESIGN CONCEPT</p>
          <h2 style={styles.h2}>Design Language</h2>
          <ul style={styles.list} data-testid="tfr-design-list">
            {PRODUCT.designDetails.map((line, i) => (
              <li key={i} style={styles.listItem} data-testid={`tfr-design-item-${i}`}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Gallery — reserved slots */}
      <section style={styles.section} data-testid="tfr-gallery">
        <div style={styles.narrow}>
          <p style={styles.eyebrowCenter}>EDITORIAL GALLERY</p>
          <h2 style={styles.h2}>Reserved for Final Photography</h2>
          <p style={styles.copyMuted}>
            Eight editorial positions have been reserved. Final renders replace each slot as the design locks.
          </p>
        </div>
        <div style={styles.galleryGrid} data-testid="tfr-gallery-grid">
          {GALLERY_ORDER.map(({ key, label }) => (
            <MediaSlot
              key={key}
              image={PRODUCT.images[key]}
              label={label}
              testid={`tfr-gallery-${key}`}
            />
          ))}
        </div>
      </section>

      {/* Purchase area — disabled */}
      <section style={styles.purchaseSection} data-testid="tfr-purchase">
        <div style={styles.purchaseCard}>
          <p style={styles.eyebrow}>Availability</p>
          <p style={styles.comingSoon} data-testid="tfr-status-line">{PRODUCT.status}</p>
          <p style={styles.purchaseNote} data-testid="tfr-purchase-note">{PRODUCT.purchaseNote}</p>
        </div>
      </section>
    </div>
  );
}

function SeoHead() {
  React.useEffect(() => {
    const prevTitle = document.title;
    document.title = "Two-Finger Ring — Working Concept | PHILEON Fine Jewelry";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute(
      "content",
      "A PHILEON Fine Jewelry two-finger statement ring in development — baby-blue princess cut and pink round brilliant with alternating halos and reptile-engraved white gold. Coming soon."
    );
    if (!meta.parentNode) document.head.appendChild(meta);
    // no-index while in development
    const robots = document.querySelector('meta[name="robots"]') || document.createElement("meta");
    robots.setAttribute("name", "robots");
    robots.setAttribute("content", "noindex,nofollow");
    if (!robots.parentNode) document.head.appendChild(robots);
    return () => { document.title = prevTitle; };
  }, []);
  return null;
}

// ─── Styles — matches the PHILEON Fine Jewelry editorial language ───────────
const rose = "#c48369";
const ink = "#f4e4dc";

const styles = {
  page: {
    background: "#0a0a0a",
    color: ink,
    fontFamily: "'Cormorant Garamond', 'Cormorant', 'Playfair Display', Georgia, serif",
    paddingBottom: 96,
  },
  hero: { position: "relative", width: "100%" },
  heroMedia: {
    width: "100%",
    aspectRatio: "4 / 5",
    maxHeight: "82vh",
    background: "#050505",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroImg: { width: "100%", height: "100%", objectFit: "contain" },
  heroTitleWrap: { padding: "40px 24px 8px", textAlign: "center" },
  eyebrow: { letterSpacing: "0.32em", fontSize: 11, color: rose, textTransform: "uppercase", margin: "0 0 14px" },
  eyebrowCenter: { letterSpacing: "0.32em", fontSize: 11, color: rose, textTransform: "uppercase", margin: "0 0 14px", textAlign: "center" },
  h1: { fontSize: "clamp(44px, 8vw, 88px)", fontWeight: 300, letterSpacing: "0.08em", margin: "0 0 12px" },
  h2: { fontSize: "clamp(28px, 4.4vw, 44px)", fontWeight: 300, letterSpacing: "0.06em", margin: "0 0 20px", textAlign: "center" },
  workingTag: { letterSpacing: "0.34em", fontSize: 12, color: rose, margin: 0, textTransform: "uppercase" },
  subtitle: { letterSpacing: "0.24em", fontSize: 12, color: "rgba(244,228,220,0.65)", margin: "16px 0 0", textTransform: "uppercase" },
  section: { padding: "56px 24px" },
  narrow: { maxWidth: 780, margin: "0 auto" },
  statementLead: {
    fontSize: "clamp(22px, 3vw, 30px)",
    lineHeight: 1.35,
    color: ink,
    textAlign: "center",
    margin: "0 0 20px",
    letterSpacing: "0.04em",
    fontStyle: "italic",
  },
  copy: { fontSize: 17, lineHeight: 1.7, color: "rgba(244,228,220,0.85)", margin: "0 0 14px", textAlign: "center" },
  copyEm: { fontSize: 16, lineHeight: 1.7, color: rose, fontStyle: "italic", margin: "16px 0 0", textAlign: "center" },
  copyMuted: { fontSize: 14, lineHeight: 1.7, color: "rgba(244,228,220,0.55)", margin: "0 0 32px", textAlign: "center" },

  statusSection: { padding: "24px 24px 40px", textAlign: "center" },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 22px",
    border: `1px solid rgba(196,131,105,0.4)`,
    borderRadius: 999,
    background: "rgba(196,131,105,0.06)",
  },
  statusDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: rose,
    boxShadow: `0 0 12px ${rose}`,
    animation: "tfr-pulse 2.4s ease-in-out infinite",
  },
  statusText: { letterSpacing: "0.32em", fontSize: 11, color: rose, textTransform: "uppercase" },

  list: { listStyle: "none", padding: 0, margin: 0, maxWidth: 640, marginInline: "auto" },
  listItem: {
    padding: "12px 0 12px 22px",
    borderBottom: "1px solid rgba(196,131,105,0.12)",
    fontSize: 16,
    lineHeight: 1.55,
    color: "rgba(244,228,220,0.86)",
    position: "relative",
  },

  galleryGrid: {
    display: "grid",
    gap: 12,
    maxWidth: 1160,
    margin: "24px auto 0",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  },
  mediaSlot: {
    background: "#050505",
    aspectRatio: "1 / 1",
    borderRadius: 2,
    overflow: "hidden",
    border: `1px solid rgba(196,131,105,0.10)`,
  },
  mediaImg: { width: "100%", height: "100%", objectFit: "contain" },

  placeholderTile: {
    background: "#0d0d0d",
    aspectRatio: "1 / 1",
    borderRadius: 2,
    border: `1px dashed rgba(196,131,105,0.22)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
    height: "100%",
  },
  placeholderInner: { textAlign: "center", padding: 24 },
  placeholderDot: {
    display: "block",
    width: 6, height: 6, borderRadius: "50%",
    background: rose, opacity: 0.5,
    margin: "0 auto 14px",
  },
  placeholderLabel: {
    letterSpacing: "0.32em",
    fontSize: 10,
    textTransform: "uppercase",
    color: rose,
    margin: 0,
  },
  placeholderSub: {
    letterSpacing: "0.18em",
    fontSize: 11,
    color: "rgba(244,228,220,0.55)",
    margin: "8px 0 0",
    textTransform: "uppercase",
  },

  purchaseSection: { padding: "24px 24px 8px", display: "flex", justifyContent: "center" },
  purchaseCard: {
    maxWidth: 520,
    width: "100%",
    padding: "36px 32px",
    background: "rgba(20,20,20,0.6)",
    border: `1px solid rgba(196,131,105,0.15)`,
    borderRadius: 2,
    textAlign: "center",
  },
  comingSoon: {
    fontSize: "clamp(22px, 3.4vw, 30px)",
    letterSpacing: "0.24em",
    color: ink,
    margin: "6px 0 12px",
    textTransform: "uppercase",
    fontWeight: 300,
  },
  purchaseNote: {
    fontSize: 13,
    letterSpacing: "0.14em",
    color: "rgba(244,228,220,0.55)",
    fontStyle: "italic",
    margin: 0,
    lineHeight: 1.6,
  },
};

// Keyframes injected once for the status dot pulse.
if (typeof document !== "undefined" && !document.getElementById("tfr-keyframes")) {
  const s = document.createElement("style");
  s.id = "tfr-keyframes";
  s.textContent = `@keyframes tfr-pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.55;transform:scale(0.85);} }`;
  document.head.appendChild(s);
}
