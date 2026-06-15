import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO_IMG = "/uncle-jo/hero.jpg";
const HERO_ALT = "UNCLE JO — sterling silver handwoven mesh statement ring held between fingers.";

// 2 metals × 3 product selections = 6 SKUs. USD-mirrored convention
// (matches Veyron Noir, Wynette's Palette, Battenti). lockedBasePriceCad
// numerically mirrors priceUsd so /validate-cart returns diff=0.
const PRICE_MATRIX = {
  silver:  { ring: 1100, cuff: 2200, set: 3000 },
  gold10k: { ring: 2800, cuff: 5500, set: 7800 },
};

const METAL_OPTIONS = [
  { id: "silver",  label: "Sterling Silver", short: "SS"  },
  { id: "gold10k", label: "10K White Gold",  short: "10K" },
];

const SELECTION_OPTIONS = [
  { id: "ring", label: "Ring Only",     short: "RING", cartLabel: "Ring" },
  { id: "cuff", label: "Cuff Only",     short: "CUFF", cartLabel: "Cuff" },
  { id: "set",  label: "Signature Set", short: "SET",  cartLabel: "Set"  },
];

const RING_SIZES = ["8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13"];

const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;

const SPECS_RING = [
  ["Collection", "Signature Mesh Collection"],
  ["Construction", "Handwoven Mesh Architecture"],
  ["Finish", "High Polish"],
  ["Profile", "Wide"],
  ["Metal Options", "Sterling Silver · 10K White Gold"],
];

const SPECS_CUFF = [
  ["Construction", "Handwoven Mesh Architecture"],
  ["Finish", "High Polish"],
  ["Metal Options", "Sterling Silver · 10K White Gold"],
];

const GALLERY = [
  { src: "/uncle-jo/archive-1.jpg", alt: "UNCLE JO — hero close-up of the woven mesh ring held between fingers." },
  { src: "/uncle-jo/archive-2.jpg", alt: "UNCLE JO — matching cuff detail, mesh weave under polished sterling silver rails." },
  { src: "/uncle-jo/archive-3.jpg", alt: "UNCLE JO — ring and cuff together, the Signature Mesh set as one composition." },
  { src: "/uncle-jo/archive-4.jpg", alt: "UNCLE JO — lifestyle: the cuff worn at the wrist, the ring at hand." },
];

export default function UncleJoPage() {
  const [scrollY, setScrollY] = useState(0);
  const [metalId, setMetalId] = useState("silver");
  const [selectionId, setSelectionId] = useState("ring");
  const [ringSize, setRingSize] = useState("9.5");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "UNCLE JO — PHILEON · Signature Mesh Collection";
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const currentMetal = METAL_OPTIONS.find((m) => m.id === metalId) || METAL_OPTIONS[0];
  const currentSelection = SELECTION_OPTIONS.find((s) => s.id === selectionId) || SELECTION_OPTIONS[0];
  const priceUsd = PRICE_MATRIX[metalId][selectionId];
  const priceFormatted = formatUsd(priceUsd);
  const tierKey = `${metalId}_${selectionId}`;
  const heroParallax = Math.min(scrollY * 0.18, 120);
  const needsSize = selectionId !== "cuff";

  const onAddToCart = () => {
    const sizeFrag = needsSize ? ` · Size ${ringSize}` : "";
    const skuSize = needsSize ? `-${ringSize.replace(".", "")}` : "";
    const variant = `${currentMetal.label} · ${currentSelection.cartLabel}${sizeFrag}`;
    handleAddToCart(
      {
        id: `uncle-jo-${tierKey}${needsSize ? "-" + ringSize : ""}`,
        name: `UNCLE JO — ${variant}`,
        price: priceUsd,
        productKey: "uncleJo",
        tierKey,
        metal: currentMetal.label,
        selection: currentSelection.cartLabel,
        ringSize: needsSize ? ringSize : null,
        sku: `UNCLEJO-${currentMetal.short}-${currentSelection.short}${skuSize}`,
        quantity: 1,
        image: HERO_IMG,
      },
      1,
      variant,
    );
  };

  return (
    <div className="uj-page" data-testid="uncle-jo-page">
      <style>{`
        .uj-page {
          --bg: #0a0a0c; --bg-deep: #050507;
          --ink: #e9e3d6; --ink-strong: #fbf6e9; --ink-muted: #8d8676;
          --silver: #c7c8cc; --silver-dim: #8e8f93;
          --rule: rgba(255,255,255,0.16); --rule-soft: rgba(255,255,255,0.08);
          background: var(--bg); color: var(--ink);
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          min-height: 100vh;
        }
        .uj-return {
          font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.35em;
          color: var(--ink-muted); text-decoration: none;
          display: inline-flex; align-items: center; gap: 10px;
          padding: 28px 0 14px 60px;
          transition: color 220ms ease;
        }
        .uj-return:hover { color: var(--silver); }
        @media (max-width: 720px) { .uj-return { padding: 24px 0 12px 20px; } }
        .uj-section {
          max-width: 1180px; margin: 0 auto;
          padding: clamp(56px, 8vw, 112px) clamp(20px, 4vw, 60px);
        }
        .uj-eyebrow {
          font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.45em;
          color: var(--silver-dim); text-transform: uppercase; margin: 0 0 22px;
        }
        .uj-h2 {
          font-family: 'Playfair Display', serif; font-weight: 400;
          font-size: clamp(34px, 4.4vw, 56px);
          line-height: 1.08; letter-spacing: -0.01em;
          color: var(--ink-strong); margin: 0 0 28px;
        }
        .uj-h3 {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 13px; letter-spacing: 0.32em;
          color: var(--silver); text-transform: uppercase;
          margin: 48px 0 18px;
        }
        .uj-p {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(17px, 1.45vw, 21px); line-height: 1.62;
          color: var(--ink); margin: 0 0 18px;
        }
        .uj-p em, .uj-p i { font-style: italic; color: var(--ink-strong); }

        /* HERO — ring image dominates ~70% of stage */
        .uj-hero {
          position: relative;
          padding: 56px 0 104px;
          background: radial-gradient(ellipse 60% 50% at 50% 35%, rgba(199,200,204,0.06), transparent 70%), var(--bg-deep);
          overflow: hidden;
        }
        .uj-hero-grid {
          display: grid;
          grid-template-columns: 1.4fr 0.85fr;
          gap: clamp(40px, 6vw, 96px);
          max-width: 1380px; margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 60px);
          align-items: center;
        }
        @media (max-width: 880px) { .uj-hero-grid { grid-template-columns: 1fr; gap: 40px; } }
        .uj-hero-img-wrap {
          position: relative; aspect-ratio: 1 / 1;
          display: flex; align-items: center; justify-content: center;
          will-change: transform;
        }
        .uj-hero-img {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.9)) drop-shadow(0 0 24px rgba(255,255,255,0.05));
        }
        @media (max-width: 768px) {
          .uj-hero-img-wrap { aspect-ratio: auto; min-height: 70vw; }
          .uj-hero-img { height: auto; transform: scale(1.25); transform-origin: center center; }
        }
        .uj-collection {
          font-family: 'Cinzel', serif; font-size: 10.5px; letter-spacing: 0.42em;
          color: var(--silver); text-transform: uppercase; margin: 0 0 14px;
        }
        .uj-hero-title {
          font-family: 'Playfair Display', serif; font-weight: 400;
          font-size: clamp(56px, 8vw, 104px);
          line-height: 0.94; letter-spacing: -0.02em;
          color: var(--ink-strong); margin: 0 0 14px;
        }
        .uj-subtitle {
          font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.34em;
          color: var(--silver-dim); text-transform: uppercase;
          margin: 0 0 18px;
        }
        .uj-tagline {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(18px, 1.7vw, 24px);
          color: var(--ink); margin: 0; line-height: 1.4;
        }

        /* EDITORIAL */
        .uj-divider { width: 64px; height: 1px; background: var(--rule); margin: 56px 0; }

        /* ARCHIVE GALLERY */
        .uj-archive-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(16px, 2vw, 28px); margin-top: 28px;
        }
        .uj-archive-cell {
          position: relative; aspect-ratio: 1 / 1; overflow: hidden;
          background: var(--bg-deep); border: 1px solid var(--rule-soft);
        }
        .uj-archive-cell img {
          width: 100%; height: 100%; object-fit: contain;
          transition: transform 600ms ease;
        }
        .uj-archive-cell:hover img { transform: scale(1.02); }
        @media (max-width: 720px) { .uj-archive-grid { grid-template-columns: 1fr; } }

        /* SPECS */
        .uj-specs-row {
          display: grid; grid-template-columns: 220px 1fr; gap: 24px;
          padding: 18px 0; border-bottom: 1px solid var(--rule-soft);
        }
        .uj-specs-row:first-of-type { border-top: 1px solid var(--rule-soft); }
        @media (max-width: 640px) { .uj-specs-row { grid-template-columns: 1fr; gap: 4px; padding: 14px 0; } }
        .uj-specs-k { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.32em; color: var(--silver-dim); text-transform: uppercase; }
        .uj-specs-v { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: var(--ink-strong); }

        /* CONFIGURATOR */
        .uj-config {
          max-width: 880px; margin: 0 auto;
          padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 60px) clamp(48px, 6vw, 72px);
          text-align: center;
        }
        .uj-config-head { margin-bottom: 48px; }
        .uj-price-line {
          font-family: 'Cinzel', serif; font-size: clamp(20px, 2.2vw, 28px);
          letter-spacing: 0.22em; color: var(--silver); margin: 12px 0 0;
        }
        .uj-config-group { margin-top: 32px; text-align: left; }
        .uj-config-label {
          display: block; font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.38em;
          color: var(--silver-dim); text-transform: uppercase; margin-bottom: 14px;
        }
        .uj-opt-row { display: grid; gap: 12px; }
        .uj-opt-row.cols-2 { grid-template-columns: 1fr 1fr; }
        .uj-opt-row.cols-3 { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 640px) {
          .uj-opt-row.cols-3 { grid-template-columns: 1fr; }
        }
        .uj-opt {
          appearance: none; background: transparent; color: var(--ink-muted);
          border: 1px solid var(--rule-soft); padding: 18px 14px 16px;
          cursor: pointer; text-align: center; font-family: 'Cinzel', serif;
          transition: border-color 220ms ease, color 220ms ease, background 220ms ease;
        }
        .uj-opt:hover { border-color: var(--rule); color: var(--ink); }
        .uj-opt.is-active {
          border-color: var(--silver); color: var(--ink-strong);
          background: rgba(255,255,255,0.04);
          box-shadow: 0 0 0 1px var(--silver) inset;
        }
        .uj-opt-label { font-size: 11.5px; letter-spacing: 0.24em; margin: 0; text-transform: uppercase; }
        .uj-opt-sub { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 12px; color: var(--ink-muted); margin: 6px 0 0; letter-spacing: 0.02em; }

        .uj-size-select {
          width: 100%; appearance: none; background: transparent;
          color: var(--ink-strong); border: 1px solid var(--rule);
          padding: 16px 18px;
          font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.22em;
          cursor: pointer;
          background-image: linear-gradient(45deg, transparent 50%, var(--silver) 50%),
                            linear-gradient(135deg, var(--silver) 50%, transparent 50%);
          background-position: calc(100% - 22px) 50%, calc(100% - 16px) 50%;
          background-size: 6px 6px;
          background-repeat: no-repeat;
        }
        .uj-size-select:disabled { opacity: 0.4; cursor: not-allowed; }
        .uj-size-select option { background: var(--bg); color: var(--ink-strong); }

        .uj-purchase {
          margin-top: 56px; text-align: center;
          border-top: 1px solid var(--rule-soft); padding-top: 40px;
        }
        .uj-purchase-eyebrow {
          font-family: 'Cinzel', serif; font-size: 10.5px;
          letter-spacing: 0.46em; color: var(--silver-dim); margin: 0 0 6px;
        }
        .uj-purchase-lead {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 15px; color: var(--ink-muted); margin: 0 0 24px;
        }
        .uj-btn {
          font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.42em;
          color: var(--ink-strong); background: transparent;
          border: 1px solid var(--silver); padding: 18px 44px;
          cursor: pointer; text-transform: uppercase;
          transition: background 280ms ease, color 280ms ease, letter-spacing 280ms ease;
        }
        .uj-btn:hover { background: var(--silver); color: var(--bg-deep); letter-spacing: 0.48em; }
        .uj-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* FINAL WORD */
        .uj-final {
          background: var(--bg-deep);
          padding: clamp(72px, 9vw, 128px) clamp(20px, 4vw, 60px);
          text-align: center; border-top: 1px solid var(--rule-soft);
        }
        .uj-final-stanza {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(18px, 1.7vw, 24px); line-height: 1.7;
          color: var(--ink); max-width: 680px; margin: 0 auto 26px;
        }
        .uj-final-stanza strong {
          font-style: normal; font-family: 'Cinzel', serif;
          font-size: 14px; letter-spacing: 0.42em; color: var(--silver);
          display: block; margin-top: 12px;
        }
      `}</style>

      <Link to="/shop" className="uj-return" data-testid="uj-return"><ArrowLeft size={14} /> RETURN</Link>

      {/* 1. HERO — ring held between fingers, dominant left, copy supporting right */}
      <section className="uj-hero" data-testid="uj-hero">
        <div className="uj-hero-grid">
          <div className="uj-hero-img-wrap" style={{ transform: `translateY(${heroParallax * 0.25}px)` }}>
            <img src={HERO_IMG} alt={HERO_ALT} className="uj-hero-img" data-testid="uj-hero-img" />
          </div>
          <div>
            <p className="uj-collection">PHILEON</p>
            <h1 className="uj-hero-title" data-testid="uj-hero-title">UNCLE JO</h1>
            <p className="uj-subtitle" data-testid="uj-subtitle">Signature Mesh Collection</p>
            <p className="uj-tagline" data-testid="uj-tagline">"Built for the man who never needed an introduction."</p>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL INTRO */}
      <section className="uj-section" data-testid="uj-opening">
        <p className="uj-eyebrow">THE PIECE</p>
        <p className="uj-p">Created in honor of my Uncle Jo.</p>
        <p className="uj-p">When he asked his nephew to make him something nice, the goal wasn't to create jewelry.</p>
        <p className="uj-p"><em>The goal was to create something that felt like him.</em></p>
        <p className="uj-p">Solid. Dependable. Understated. Strong without trying.</p>
        <div className="uj-divider" />
        <p className="uj-p">The result became a matching ring and cuff built from the same woven mesh architecture.</p>
        <p className="uj-p">No stones. No distractions.</p>
        <p className="uj-p"><em>Just metal, weight, texture, and presence.</em></p>
      </section>

      {/* 3. ARCHIVE GALLERY — collection reveal */}
      <section className="uj-section" data-testid="uj-archive">
        <p className="uj-eyebrow">ARCHIVE</p>
        <h2 className="uj-h2">A ring. A matching cuff. One architecture.</h2>
        <p className="uj-p">A ring commissioned for one man. A matching cuff created from the same weave. A complete signature set.</p>
        <div className="uj-archive-grid">
          {GALLERY.map((g, i) => (
            <div key={g.src} className="uj-archive-cell" data-testid={`uj-archive-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* 4. SPECIFICATIONS */}
      <section className="uj-section" data-testid="uj-specs">
        <p className="uj-eyebrow">SPECIFICATIONS</p>
        <h2 className="uj-h2">The record.</h2>

        <h3 className="uj-h3">Ring</h3>
        <div>
          {SPECS_RING.map(([k, v]) => (
            <div key={`r-${k}`} className="uj-specs-row">
              <div className="uj-specs-k">{k}</div>
              <div className="uj-specs-v">{v}</div>
            </div>
          ))}
        </div>

        <h3 className="uj-h3">Matching Cuff</h3>
        <div>
          {SPECS_CUFF.map(([k, v]) => (
            <div key={`c-${k}`} className="uj-specs-row">
              <div className="uj-specs-k">{k}</div>
              <div className="uj-specs-v">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CONFIGURATOR */}
      <section className="uj-config" data-testid="uj-configurator">
        <div className="uj-config-head">
          <p className="uj-eyebrow">CONFIGURE YOUR PIECE</p>
          <h2 className="uj-h2">One architecture. Two metals. Three ways to wear it.</h2>
          <p className="uj-price-line" data-testid="uj-price">{priceFormatted}</p>
        </div>

        <div className="uj-config-group">
          <label className="uj-config-label">Metal</label>
          <div className="uj-opt-row cols-2" role="radiogroup" aria-label="Metal">
            {METAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={metalId === opt.id}
                className={`uj-opt${metalId === opt.id ? " is-active" : ""}`}
                data-testid={`uj-metal-${opt.id}`}
                onClick={() => setMetalId(opt.id)}
              >
                <p className="uj-opt-label">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="uj-config-group">
          <label className="uj-config-label">Product Selection</label>
          <div className="uj-opt-row cols-3" role="radiogroup" aria-label="Product Selection">
            {SELECTION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selectionId === opt.id}
                className={`uj-opt${selectionId === opt.id ? " is-active" : ""}`}
                data-testid={`uj-selection-${opt.id}`}
                onClick={() => setSelectionId(opt.id)}
              >
                <p className="uj-opt-label">{opt.label}</p>
                <p className="uj-opt-sub">{formatUsd(PRICE_MATRIX[metalId][opt.id])}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="uj-config-group">
          <label htmlFor="uj-ring-size" className="uj-config-label">
            Ring Size {!needsSize && <span style={{ fontStyle: 'italic', letterSpacing: '0.02em', color: '#666' }}>· not required for Cuff Only</span>}
          </label>
          <select
            id="uj-ring-size"
            className="uj-size-select"
            data-testid="uj-ring-size"
            value={ringSize}
            disabled={!needsSize}
            onChange={(e) => setRingSize(e.target.value)}
          >
            {RING_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="uj-purchase">
          <p className="uj-purchase-eyebrow">MADE TO ORDER</p>
          <p className="uj-purchase-lead">Lead Time · 3–4 Weeks · Insured Shipping Included</p>
          <button
            type="button"
            className="uj-btn"
            data-testid="uj-add-to-cart"
            onClick={onAddToCart}
            disabled={isAdding}
          >
            {buttonText}
          </button>
        </div>
      </section>

      {/* 6. FINAL WORD */}
      <section className="uj-final" data-testid="uj-final-word">
        <p className="uj-final-stanza">Some pieces are designed.</p>
        <p className="uj-final-stanza"><em>Others are requested.</em></p>
        <p className="uj-final-stanza">Uncle Jo began with a simple ask from an uncle to his nephew.</p>
        <p className="uj-final-stanza"><em>Make me something nice.</em></p>
        <p className="uj-final-stanza">The result became a matching ring and cuff built to be worn every day and remembered for much longer.</p>
        <p className="uj-final-stanza">No stones. No symbols. No explanation required.</p>
        <p className="uj-final-stanza">
          <em>Just presence.</em>
          <strong>MADE FOR UNCLE JO.</strong>
        </p>
      </section>
    </div>
  );
}
