import React, { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// GRAVITÉ — PHILEON FINE JEWELRY. Product #4 of 6. PRE-CAD placeholder.
// Not wired into trusted backend checkout (backend product count remains 84).
// Two metal expressions:
//   • FOUNDATION — 10K Rose Gold — $5,995 CAD
//   • SIGNATURE  — 14K Rose Gold — $7,495 CAD (default, MOST CHOSEN)
// Ring sizes US 5 – US 10 in 0.5 steps. Price is FLAT across sizes.
// ─────────────────────────────────────────────────────────────────────────────

const ART = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts";
const G = {
  // The four unique approved GRAVITÉ renders. Two of the five supplied
  // assets were byte-identical duplicates; four unique compositions remain.
  hero:      `${ART}/8y43t0ml_1000171945.jpg`, // strongest 3/4 — hero + Fine Jewelry + Collective card
  front:     `${ART}/azx2ln7g_1000171941.jpg`, // wider 3/4 — Ladies → Rings card + gallery #2
  opp:       `${ART}/cfef8i4i_1000171943.jpg`, // opposite 3/4 angle — gallery #3
  rear:      `${ART}/u60bkgkg_1000171928.jpg`, // rear / structural view — gallery #5
};

// Gallery order per merchant spec: hero, front-collection, opp 3/4, hero-structure, rear/detail.
// We reuse `hero` for slot 4 (structure) so shank + head geometry stays consistent.
const GALLERY = [
  { src: G.hero,  alt: "GRAVITÉ 3/4 hero — three natural pear-cut peridots in rose gold with heart-engraved sphere and mixed green + white pavé shoulders" },
  { src: G.front, alt: "GRAVITÉ front collection view — asymmetrical peridot cluster and full pavé shoulders" },
  { src: G.opp,   alt: "GRAVITÉ opposite 3/4 — cluster overlap, pavé, and heart sphere" },
  { src: G.hero,  alt: "GRAVITÉ full ring — shoulder taper into polished rose-gold shank" },
  { src: G.rear,  alt: "GRAVITÉ rear / open gallery — setting depth and shank structure" },
];

const METALS = {
  "10k-rose": {
    id: "10k-rose",
    label: "10K ROSE GOLD",
    tier: "FOUNDATION",
    price: "$5,995 CAD",
    priceNumeric: 5995,
    badge: null,
  },
  "14k-rose": {
    id: "14k-rose",
    label: "14K ROSE GOLD",
    tier: "SIGNATURE",
    price: "$7,495 CAD",
    priceNumeric: 7495,
    badge: "MOST CHOSEN",
  },
};

const RING_SIZES = [
  { us: "5",   diameter: "15.7 mm", circumference: "49.3 mm" },
  { us: "5.5", diameter: "16.1 mm", circumference: "50.6 mm" },
  { us: "6",   diameter: "16.5 mm", circumference: "51.9 mm" },
  { us: "6.5", diameter: "16.9 mm", circumference: "53.1 mm" },
  { us: "7",   diameter: "17.3 mm", circumference: "54.4 mm" },
  { us: "7.5", diameter: "17.7 mm", circumference: "55.7 mm" },
  { us: "8",   diameter: "18.1 mm", circumference: "57.0 mm" },
  { us: "8.5", diameter: "18.5 mm", circumference: "58.3 mm" },
  { us: "9",   diameter: "18.9 mm", circumference: "59.5 mm" },
  { us: "9.5", diameter: "19.4 mm", circumference: "60.8 mm" },
  { us: "10",  diameter: "19.8 mm", circumference: "62.1 mm" },
];

export default function GravitePage() {
  const [metalId, setMetalId]     = useState("14k-rose"); // 14K default per merchant
  const [ringSize, setRingSize]   = useState("7");        // US 7 default
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const metal = METALS[metalId];
  const gallery = GALLERY;

  return (
    <div style={styles.page} data-testid="gravite-page">
      {/* Hero — full-bleed image, editorial title stack below */}
      <section style={styles.hero} data-testid="gravite-hero">
        <div style={styles.heroMedia}>
          <img
            src={gallery[galleryIdx].src}
            alt={gallery[galleryIdx].alt}
            style={styles.heroImg}
            data-testid="gravite-hero-image"
            loading="eager"
            fetchPriority="high"
            draggable={false}
          />
        </div>
        <div style={styles.heroTitle}>
          <p style={styles.eyebrow}>PHILEON FINE JEWELRY</p>
          <h1 style={styles.h1} data-testid="gravite-name">GRAVITÉ</h1>
          <p style={styles.tag} data-testid="gravite-tagline">THREE STONES. ONE PULL.</p>
        </div>
      </section>

      {/* Editorial introduction */}
      <section style={styles.section}>
        <div style={styles.narrow}>
          <p style={styles.copy}>
            GRAVITÉ holds three pear-cut peridots in deliberate imbalance —
            drawn together around a heart-marked sphere and anchored by rose gold.
          </p>
          <p style={styles.copy}>
            Green and white pavé move down the shoulders without repetition,
            giving the ring a sense of motion even at rest.
          </p>
          <p style={styles.copyEm}>Nothing is centered by accident.</p>
        </div>
      </section>

      {/* Gallery — thumbnails select the hero */}
      <section style={styles.section} data-testid="gravite-gallery">
        <div style={styles.gallery}>
          {gallery.map((g, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setGalleryIdx(i)}
              aria-label={`View gallery image ${i + 1}`}
              data-testid={`gravite-gallery-thumb-${i}`}
              style={{
                ...styles.thumb,
                border: galleryIdx === i ? "1px solid rgba(196,131,105,0.85)" : "1px solid rgba(196,131,105,0.15)",
              }}
            >
              <img src={g.src} alt={g.alt} style={styles.thumbImg} draggable={false} />
            </button>
          ))}
        </div>
      </section>

      {/* Purchase selector — order: name → tagline → price → metal → ring size + guide → material summary → CTA */}
      <section style={styles.section} data-testid="gravite-selector">
        <div style={styles.selectorWrap}>
          <p style={styles.eyebrow}>PHILEON FINE JEWELRY</p>
          <h2 style={styles.h2}>GRAVITÉ</h2>
          <p style={styles.tag}>THREE STONES. ONE PULL.</p>

          {/* Selected price */}
          <div style={styles.priceRow}>
            <span style={styles.priceLabel}>{metal.tier}</span>
            <span style={styles.price} data-testid="gravite-selected-price">{metal.price}</span>
          </div>

          {/* Metal selector */}
          <div style={{ marginTop: 20 }}>
            <p style={styles.smallLabel}>METAL</p>
            <div style={styles.metalGrid}>
              {Object.values(METALS).map((m) => {
                const selected = metalId === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMetalId(m.id)}
                    aria-pressed={selected}
                    data-testid={`gravite-metal-${m.id}`}
                    style={{
                      ...styles.metalBtn,
                      borderColor: selected ? "rgba(196,131,105,0.95)" : "rgba(196,131,105,0.25)",
                      background: selected ? "rgba(196,131,105,0.10)" : "transparent",
                    }}
                  >
                    <span style={styles.metalLabel}>{m.label}</span>
                    <span style={styles.metalPrice}>{m.price}</span>
                    {m.badge && <span style={styles.badge} data-testid={`gravite-badge-${m.id}`}>{m.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ring size selector */}
          <div style={{ marginTop: 24 }}>
            <div style={styles.sizeHeaderRow}>
              <p style={styles.smallLabel}>RING SIZE</p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                data-testid="gravite-size-guide-open"
                style={styles.sizeGuideLink}
              >
                SIZE GUIDE
              </button>
            </div>
            <div style={styles.sizeGrid}>
              {RING_SIZES.map((s) => {
                const selected = ringSize === s.us;
                return (
                  <button
                    type="button"
                    key={s.us}
                    onClick={() => setRingSize(s.us)}
                    aria-pressed={selected}
                    data-testid={`gravite-size-${s.us.replace(".", "_")}`}
                    style={{
                      ...styles.sizeBtn,
                      borderColor: selected ? "rgba(196,131,105,0.95)" : "rgba(196,131,105,0.25)",
                      background: selected ? "rgba(196,131,105,0.10)" : "transparent",
                      color: selected ? "#f4e4dc" : "#c48369",
                    }}
                  >
                    US {s.us}
                  </button>
                );
              })}
            </div>
            <p style={styles.sizeNote}>
              Because GRAVITÉ has substantial shoulders, if you fall directly between two sizes,
              select the larger size or contact PHILEON before ordering.
            </p>
          </div>

          {/* Short material summary */}
          <div style={styles.matSummary}>
            <p style={styles.matLine}>{metal.label} · NATURAL PEAR-CUT PERIDOT</p>
            <p style={styles.matSub}>Selected size: US {ringSize} · Price is flat across ring sizes</p>
          </div>

          {/* Purchase / availability button */}
          <button
            type="button"
            disabled
            data-testid="gravite-cta"
            style={styles.cta}
          >
            CAD FINALIZATION IN PROGRESS
          </button>
          <p style={styles.ctaSub}>
            GRAVITÉ is in final development. Add to Cart will open when production CAD is approved.
          </p>
        </div>
      </section>

      {/* THREE STONES. ONE PULL. */}
      <section style={styles.section} data-testid="gravite-three-stones">
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>THE CLUSTER</p>
          <h3 style={styles.h3}>THREE STONES. ONE PULL.</h3>
          <p style={styles.copy}>
            Three natural pear-cut peridots are set in deliberate asymmetry —
            drawn toward one another around the rose-gold sphere and locked by tapered claw prongs.
            The arrangement is intentionally off-center: no two stones sit at the same angle,
            no two shoulders carry the same weight.
          </p>
          <div style={styles.stoneGrid}>
            <div style={styles.stoneCard}>
              <p style={styles.stoneNo}>STONE 1</p>
              <p style={styles.stoneDim}>12.00 × 8.00 mm</p>
              <p style={styles.stoneKind}>Natural Peridot</p>
            </div>
            <div style={styles.stoneCard}>
              <p style={styles.stoneNo}>STONE 2</p>
              <p style={styles.stoneDim}>11.00 × 7.00 mm</p>
              <p style={styles.stoneKind}>Natural Peridot</p>
            </div>
            <div style={styles.stoneCard}>
              <p style={styles.stoneNo}>STONE 3</p>
              <p style={styles.stoneDim}>11.00 × 7.00 mm</p>
              <p style={styles.stoneKind}>Natural Peridot</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Heart in the Pull — heart-sphere macro */}
      <section style={styles.section} data-testid="gravite-heart-sphere">
        <div style={styles.splitRow}>
          <div style={styles.splitMedia}>
            <img src={G.rear} alt="Heart-engraved rose-gold sphere macro" style={styles.splitImg} draggable={false} />
          </div>
          <div style={styles.splitBody}>
            <p style={styles.eyebrow}>THE HEART IN THE PULL</p>
            <h3 style={styles.h3}>A quiet gesture at the center of the tension.</h3>
            <p style={styles.copy}>
              A small engraved sphere sits inside the tension of the cluster —
              intimate, almost hidden, and visible only when the ring is studied closely.
            </p>
            <ul style={styles.list}>
              <li style={styles.li}>Approx. 6 mm rose-gold sphere</li>
              <li style={styles.li}>Shallow engraved heart motifs — not pierced, not pavé</li>
              <li style={styles.li}>Positioned between the upper peridot and the pavé shoulder</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mixed pavé shoulders */}
      <section style={styles.section} data-testid="gravite-pave">
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>THE SHOULDERS</p>
          <h3 style={styles.h3}>Mixed green + white pavé. No repeating pattern.</h3>
          <p style={styles.copy}>
            Approximately three irregular rows of green and white melee run down both shoulders —
            placed without repetition, stripes, or gradient. The pavé field extends roughly three-quarters
            of the way down each side, giving way to a lower polished rose-gold shank.
          </p>
          <div style={styles.paveGrid}>
            <div>
              <p style={styles.smallLabel}>GREEN MELEE</p>
              <p style={styles.copy}>Lab-created green sapphire · approx. 1.2–1.4 mm</p>
            </div>
            <div>
              <p style={styles.smallLabel}>WHITE MELEE</p>
              <p style={styles.copy}>Lab-grown white diamond · approx. 1.2–1.4 mm</p>
            </div>
            <div>
              <p style={styles.smallLabel}>SIDE STONE COUNT</p>
              <p style={styles.copy}>Approx. 70 mixed pavé stones · exact count subject to final production CAD</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section style={styles.section} data-testid="gravite-specs">
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>SPECIFICATIONS</p>
          <h3 style={styles.h3}>Made to be studied.</h3>
          <dl style={styles.specList}>
            {[
              ["NAME", "GRAVITÉ"],
              ["CATEGORY", "Ladies Ring"],
              ["METAL", "10K or 14K Rose Gold"],
              ["MAIN GEMSTONES", "Three Natural Pear-Cut Peridots"],
              ["MAIN STONE DIMENSIONS", "12.00 × 8.00 mm · 11.00 × 7.00 mm · 11.00 × 7.00 mm"],
              ["SETTING", "Tapered Claw Setting"],
              ["GALLERY", "Open"],
              ["ACCENT DETAIL", "Approx. 6 mm heart-engraved rose-gold sphere"],
              ["SHOULDERS", "Mixed green + white pavé"],
              ["SIDE STONES", "Approx. 70 total · final count subject to CAD"],
              ["REFERENCE SIZE", "US 7"],
              ["FINISHED WEIGHT", "TBD after CAD"],
            ].map(([k, v]) => (
              <div key={k} style={styles.specRow}>
                <dt style={styles.specKey}>{k}</dt>
                <dd style={styles.specVal}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Size Guide inline reference */}
      <section style={styles.section} data-testid="gravite-size-guide-section">
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>SIZE GUIDE</p>
          <h3 style={styles.h3}>Find your size.</h3>
          <p style={styles.copy}>
            GRAVITÉ has a substantial sculptural top and pavé shoulders. A precise fit is recommended.
          </p>
          <div style={styles.sgMethods}>
            <div>
              <p style={styles.smallLabel}>BEST METHOD</p>
              <p style={styles.copy}>Have your finger measured professionally by a jeweller using a standard US ring sizer.</p>
            </div>
            <div>
              <p style={styles.smallLabel}>EXISTING RING METHOD</p>
              <p style={styles.copy}>Measure the inside diameter of a ring that already fits and compare with the chart below.</p>
            </div>
          </div>
          <div style={styles.sizeChart}>
            <div style={styles.sizeChartHead}>
              <span>US</span>
              <span>Inside diameter</span>
              <span>Inside circumference</span>
            </div>
            {RING_SIZES.map((s) => (
              <div key={s.us} style={styles.sizeChartRow}>
                <span>US {s.us}</span>
                <span>{s.diameter}</span>
                <span>{s.circumference}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Size guide modal — opened by SIZE GUIDE button next to size selector */}
      {sizeGuideOpen && (
        <div style={styles.modalScrim} role="dialog" aria-modal="true" data-testid="gravite-size-guide-modal" onClick={() => setSizeGuideOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHead}>
              <h4 style={styles.h4}>FIND YOUR SIZE</h4>
              <button type="button" onClick={() => setSizeGuideOpen(false)} data-testid="gravite-size-guide-close" style={styles.modalClose}>CLOSE</button>
            </div>
            <p style={styles.copy}>
              GRAVITÉ has a substantial sculptural top and pavé shoulders. A precise fit is recommended.
            </p>
            <div style={styles.sizeChart}>
              <div style={styles.sizeChartHead}>
                <span>US</span>
                <span>Inside diameter</span>
                <span>Inside circumference</span>
              </div>
              {RING_SIZES.map((s) => (
                <div key={s.us} style={styles.sizeChartRow}>
                  <span>US {s.us}</span>
                  <span>{s.diameter}</span>
                  <span>{s.circumference}</span>
                </div>
              ))}
            </div>
            <p style={styles.sizeNote}>
              If you fall directly between two sizes, select the larger size or contact PHILEON before ordering.
            </p>
          </div>
        </div>
      )}

      {/* SEO */}
      <SeoHead />
    </div>
  );
}

function SeoHead() {
  React.useEffect(() => {
    const prevTitle = document.title;
    document.title = "GRAVITÉ | Peridot & Rose Gold Statement Ring | PHILEON";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute(
      "content",
      "Discover GRAVITÉ by PHILEON — three natural pear-cut peridots set asymmetrically in rose gold with mixed green and white pavé shoulders and a signature heart-engraved sphere."
    );
    if (!meta.parentNode) document.head.appendChild(meta);
    return () => { document.title = prevTitle; };
  }, []);
  return null;
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  page: {
    background: "#0a0a0a",
    color: "#f4e4dc",
    fontFamily: "'Cormorant Garamond', 'Cormorant', 'Playfair Display', Georgia, serif",
    paddingBottom: 96,
  },
  hero: { position: "relative", width: "100%" },
  heroMedia: {
    width: "100%",
    aspectRatio: "4 / 5",
    maxHeight: "88vh",
    background: "#050505",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroImg: { width: "100%", height: "100%", objectFit: "contain" },
  heroTitle: { padding: "32px 24px 8px", textAlign: "center" },
  eyebrow: { letterSpacing: "0.32em", fontSize: 11, color: "#c48369", textTransform: "uppercase", margin: "0 0 12px" },
  h1: { fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 300, letterSpacing: "0.08em", margin: "0 0 8px" },
  h2: { fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 300, letterSpacing: "0.08em", margin: "0 0 8px" },
  h3: { fontSize: "clamp(22px, 3.4vw, 34px)", fontWeight: 300, letterSpacing: "0.06em", margin: "0 0 16px" },
  h4: { fontSize: 18, fontWeight: 300, letterSpacing: "0.24em", margin: 0, textTransform: "uppercase" },
  tag: { letterSpacing: "0.32em", fontSize: 13, color: "#c48369", margin: "0 0 4px", textTransform: "uppercase" },
  section: { padding: "56px 24px" },
  narrow: { maxWidth: 780, margin: "0 auto" },
  copy: { fontSize: 17, lineHeight: 1.7, color: "rgba(244,228,220,0.85)", margin: "0 0 14px" },
  copyEm: { fontSize: 18, lineHeight: 1.7, color: "#c48369", fontStyle: "italic", margin: "8px 0 0" },
  gallery: {
    display: "grid",
    gap: 12,
    maxWidth: 1160,
    margin: "0 auto",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  },
  thumb: {
    padding: 0,
    background: "#050505",
    borderRadius: 2,
    cursor: "pointer",
    aspectRatio: "1 / 1",
    overflow: "hidden",
    transition: "border-color 220ms ease",
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "contain" },
  selectorWrap: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "32px 28px",
    background: "rgba(20,20,20,0.6)",
    border: "1px solid rgba(196,131,105,0.15)",
    borderRadius: 2,
  },
  priceRow: {
    marginTop: 8,
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(196,131,105,0.15)",
    borderBottom: "1px solid rgba(196,131,105,0.15)",
    padding: "14px 0",
  },
  priceLabel: { letterSpacing: "0.24em", fontSize: 12, color: "#c48369" },
  price: { fontSize: 24, letterSpacing: "0.08em" },
  smallLabel: { letterSpacing: "0.24em", fontSize: 11, color: "#c48369", margin: "0 0 10px", textTransform: "uppercase" },
  metalGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 },
  metalBtn: {
    position: "relative",
    padding: "18px 14px",
    borderRadius: 2,
    border: "1px solid rgba(196,131,105,0.25)",
    color: "#f4e4dc",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    transition: "border-color 200ms ease, background-color 200ms ease",
  },
  metalLabel: { letterSpacing: "0.16em", fontSize: 12, textTransform: "uppercase" },
  metalPrice: { fontSize: 16, letterSpacing: "0.06em", color: "rgba(244,228,220,0.9)" },
  badge: {
    position: "absolute",
    top: -9,
    right: 10,
    background: "#c48369",
    color: "#0a0a0a",
    fontSize: 9,
    letterSpacing: "0.28em",
    padding: "3px 8px",
    borderRadius: 1,
    fontWeight: 600,
  },
  sizeHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  sizeGuideLink: {
    background: "transparent",
    border: "none",
    color: "#c48369",
    letterSpacing: "0.24em",
    fontSize: 10,
    cursor: "pointer",
    textDecoration: "underline",
    textUnderlineOffset: 4,
    textTransform: "uppercase",
  },
  sizeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(58px, 1fr))", gap: 6 },
  sizeBtn: {
    padding: "10px 6px",
    borderRadius: 2,
    border: "1px solid rgba(196,131,105,0.25)",
    background: "transparent",
    color: "#c48369",
    letterSpacing: "0.14em",
    fontSize: 12,
    cursor: "pointer",
    transition: "all 180ms ease",
  },
  sizeNote: { fontSize: 12, color: "rgba(244,228,220,0.55)", marginTop: 12, lineHeight: 1.6, fontStyle: "italic" },
  matSummary: { marginTop: 22, borderTop: "1px solid rgba(196,131,105,0.15)", paddingTop: 14 },
  matLine: { letterSpacing: "0.14em", fontSize: 12, color: "#f4e4dc", margin: "0 0 4px", textTransform: "uppercase" },
  matSub: { fontSize: 11, color: "rgba(244,228,220,0.55)", margin: 0, letterSpacing: "0.08em" },
  cta: {
    width: "100%",
    marginTop: 22,
    padding: "16px 20px",
    background: "rgba(30,30,30,0.9)",
    border: "1px solid rgba(196,131,105,0.4)",
    color: "#c48369",
    letterSpacing: "0.28em",
    fontSize: 12,
    cursor: "not-allowed",
    textTransform: "uppercase",
  },
  ctaSub: { fontSize: 11, color: "rgba(244,228,220,0.55)", margin: "10px 0 0", textAlign: "center", lineHeight: 1.5, letterSpacing: "0.06em" },
  stoneGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 22 },
  stoneCard: {
    padding: "18px 16px",
    background: "rgba(20,20,20,0.5)",
    border: "1px solid rgba(196,131,105,0.15)",
    borderRadius: 2,
  },
  stoneNo: { letterSpacing: "0.24em", fontSize: 10, color: "#c48369", margin: "0 0 8px" },
  stoneDim: { fontSize: 18, letterSpacing: "0.08em", margin: "0 0 6px" },
  stoneKind: { fontSize: 12, color: "rgba(244,228,220,0.65)", margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" },
  splitRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 32,
    maxWidth: 1120,
    margin: "0 auto",
    alignItems: "center",
  },
  splitMedia: { background: "#050505", borderRadius: 2, overflow: "hidden", aspectRatio: "4 / 3" },
  splitImg: { width: "100%", height: "100%", objectFit: "contain" },
  splitBody: {},
  list: { paddingLeft: 18, margin: "12px 0 0", color: "rgba(244,228,220,0.85)" },
  li: { fontSize: 15, lineHeight: 1.9, letterSpacing: "0.02em" },
  paveGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginTop: 22 },
  specList: { margin: 0, padding: 0 },
  specRow: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 24,
    padding: "14px 0",
    borderBottom: "1px solid rgba(196,131,105,0.12)",
  },
  specKey: { letterSpacing: "0.24em", fontSize: 11, color: "#c48369", textTransform: "uppercase", margin: 0 },
  specVal: { fontSize: 15, color: "rgba(244,228,220,0.85)", margin: 0, letterSpacing: "0.02em" },
  sgMethods: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, margin: "18px 0 22px" },
  sizeChart: { border: "1px solid rgba(196,131,105,0.15)", borderRadius: 2 },
  sizeChartHead: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 2fr",
    padding: "12px 16px",
    background: "rgba(196,131,105,0.06)",
    letterSpacing: "0.2em",
    fontSize: 10,
    color: "#c48369",
    textTransform: "uppercase",
  },
  sizeChartRow: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 2fr",
    padding: "12px 16px",
    borderTop: "1px solid rgba(196,131,105,0.10)",
    fontSize: 14,
    color: "rgba(244,228,220,0.85)",
    letterSpacing: "0.06em",
  },
  modalScrim: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.78)",
    zIndex: 90,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    background: "#111",
    color: "#f4e4dc",
    maxWidth: 640,
    width: "100%",
    padding: 28,
    border: "1px solid rgba(196,131,105,0.25)",
    borderRadius: 2,
    maxHeight: "85vh",
    overflowY: "auto",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  modalHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  modalClose: {
    background: "transparent",
    border: "1px solid rgba(196,131,105,0.35)",
    color: "#c48369",
    letterSpacing: "0.24em",
    fontSize: 10,
    padding: "6px 12px",
    cursor: "pointer",
    textTransform: "uppercase",
  },
};
