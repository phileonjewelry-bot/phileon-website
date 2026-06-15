import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO_IMG = "/uncle-jo/hero.png";
const HERO_ALT = "UNCLE JO — sterling silver chain-link statement ring, four-row woven band, solid metal, no stones.";

// Hand-set USD prices · USD-mirrored convention (matches Veyron Noir,
// Wynette's Palette, Battenti). lockedBasePriceCad numerically mirrors
// priceUsd so server_price == client_price on /validate-cart.
const METAL_OPTIONS = [
  { id: "silver",  label: "Sterling Silver", short: "SS",  tierKey: "silver",  priceUsd: 1100 },
  { id: "gold10k", label: "10K White Gold",  short: "10K", tierKey: "gold10k", priceUsd: 2800 },
];

const RING_SIZES = ["8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13"];

const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;

const SPECS = [
  ["Collection", "Gentlemen"],
  ["Piece", "Uncle Jo"],
  ["Category", "Gentlemen's Ring"],
  ["Metal Options", "Sterling Silver · 10K White Gold"],
  ["Style", "Chain Link Statement Ring"],
  ["Origin", "Handcrafted by Phileon"],
  ["Availability", "Made To Order"],
  ["Lead Time", "3–4 Weeks"],
  ["Shipping", "Insured · Included"],
];

const GALLERY = [
  { src: "/uncle-jo/archive-1.png", alt: "UNCLE JO — three-quarter view of the four-row chain-link band in sterling silver." },
  { src: "/uncle-jo/archive-2.png", alt: "UNCLE JO — top view, looking through the opening of the chain-link band." },
  { src: "/uncle-jo/archive-3.png", alt: "UNCLE JO — alternate profile, woven chain rows across the full circumference." },
  { src: "/uncle-jo/archive-4.png", alt: "UNCLE JO — presentation shot, the ring resting in its box." },
  { src: "/uncle-jo/archive-5.png", alt: "UNCLE JO — close detail of the chain-mesh weave and the polished gold rim." },
];

export default function UncleJoPage() {
  const [scrollY, setScrollY] = useState(0);
  const [metalId, setMetalId] = useState("gold10k");
  const [ringSize, setRingSize] = useState("10");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "UNCLE JO — PHILEON · Gentlemen's Collection";
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const currentMetal = METAL_OPTIONS.find((m) => m.id === metalId) || METAL_OPTIONS[1];
  const priceUsd = currentMetal.priceUsd;
  const priceFormatted = formatUsd(priceUsd);
  const heroParallax = Math.min(scrollY * 0.18, 120);

  const onAddToCart = () => {
    const variant = `${currentMetal.label} · Size ${ringSize}`;
    handleAddToCart(
      {
        id: `uncle-jo-${metalId}-${ringSize}`,
        name: `UNCLE JO — ${variant}`,
        price: priceUsd,
        productKey: "uncleJo",
        tierKey: currentMetal.tierKey,
        metal: currentMetal.label,
        ringSize,
        sku: `UNCLEJO-${currentMetal.short}-${ringSize.replace(".", "")}`,
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
          --bg: #0a0a0c;
          --bg-deep: #050507;
          --ink: #e9e3d6;
          --ink-strong: #fbf6e9;
          --ink-muted: #8d8676;
          --silver: #c7c8cc;
          --silver-dim: #8e8f93;
          --rule: rgba(255,255,255,0.16);
          --rule-soft: rgba(255,255,255,0.08);

          background: var(--bg);
          color: var(--ink);
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
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(56px, 8vw, 112px) clamp(20px, 4vw, 60px);
        }

        .uj-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.45em;
          color: var(--silver-dim); text-transform: uppercase;
          margin: 0 0 22px;
        }
        .uj-h2 {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          font-size: clamp(34px, 4.4vw, 56px);
          line-height: 1.08; letter-spacing: -0.01em;
          color: var(--ink-strong);
          margin: 0 0 28px;
        }
        .uj-p {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(17px, 1.45vw, 21px);
          line-height: 1.62;
          color: var(--ink);
          margin: 0 0 18px;
        }
        .uj-p em, .uj-p i { font-style: italic; color: var(--ink-strong); }

        /* 1. HERO */
        .uj-hero {
          position: relative;
          padding: 56px 0 104px;
          background: radial-gradient(ellipse 60% 50% at 50% 35%, rgba(199,200,204,0.06), transparent 70%), var(--bg-deep);
          overflow: hidden;
        }
        .uj-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(40px, 6vw, 96px);
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 60px);
          align-items: center;
        }
        @media (max-width: 880px) { .uj-hero-grid { grid-template-columns: 1fr; gap: 40px; } }
        .uj-hero-img-wrap {
          position: relative;
          aspect-ratio: 1 / 1;
          display: flex; align-items: center; justify-content: center;
          will-change: transform;
        }
        .uj-hero-img {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.9)) drop-shadow(0 0 24px rgba(255,255,255,0.05));
        }
        @media (max-width: 768px) {
          .uj-hero-img-wrap { aspect-ratio: auto; min-height: 65vw; }
          .uj-hero-img { height: auto; transform: scale(1.25); transform-origin: center center; }
        }
        .uj-collection {
          font-family: 'Cinzel', serif;
          font-size: 10.5px; letter-spacing: 0.42em;
          color: var(--silver); text-transform: uppercase;
          margin: 0 0 16px;
        }
        .uj-hero-title {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          font-size: clamp(56px, 8vw, 104px);
          line-height: 0.94; letter-spacing: -0.02em;
          color: var(--ink-strong);
          margin: 0 0 14px;
        }
        .uj-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(18px, 1.7vw, 24px);
          color: var(--ink);
          margin: 0 0 28px;
          line-height: 1.4;
        }

        /* EDITORIAL */
        .uj-editorial-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.45em;
          color: var(--silver); text-transform: uppercase;
          margin: 0 0 32px;
        }
        .uj-divider { width: 64px; height: 1px; background: var(--rule); margin: 56px 0; }

        /* ARCHIVE GALLERY */
        .uj-archive-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(16px, 2vw, 28px);
          margin-top: 28px;
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
        .uj-archive-grid > :nth-child(5) { grid-column: 1 / -1; }
        @media (max-width: 720px) {
          .uj-archive-grid { grid-template-columns: 1fr; }
          .uj-archive-grid > :nth-child(5) { grid-column: auto; }
        }

        /* SPECS */
        .uj-specs-row {
          display: grid; grid-template-columns: 220px 1fr; gap: 24px;
          padding: 18px 0; border-bottom: 1px solid var(--rule-soft);
        }
        .uj-specs-row:first-of-type { border-top: 1px solid var(--rule-soft); }
        @media (max-width: 640px) {
          .uj-specs-row { grid-template-columns: 1fr; gap: 4px; padding: 14px 0; }
        }
        .uj-specs-k {
          font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.32em; color: var(--silver-dim); text-transform: uppercase;
        }
        .uj-specs-v { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: var(--ink-strong); }

        /* CONFIGURATOR */
        .uj-config {
          max-width: 880px; margin: 0 auto;
          padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 60px) clamp(48px, 6vw, 72px);
          text-align: center;
        }
        .uj-config-head { margin-bottom: 48px; }
        .uj-price-line {
          font-family: 'Cinzel', serif;
          font-size: clamp(20px, 2.2vw, 28px);
          letter-spacing: 0.22em;
          color: var(--silver);
          margin: 12px 0 0;
        }
        .uj-config-group { margin-top: 32px; text-align: left; }
        .uj-config-label {
          display: block; font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.38em;
          color: var(--silver-dim); text-transform: uppercase;
          margin-bottom: 14px;
        }
        .uj-metal-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .uj-metal-opt {
          appearance: none; background: transparent; color: var(--ink-muted);
          border: 1px solid var(--rule-soft); padding: 18px 14px 16px;
          cursor: pointer; text-align: center;
          font-family: 'Cinzel', serif;
          transition: border-color 220ms ease, color 220ms ease, background 220ms ease;
        }
        .uj-metal-opt:hover { border-color: var(--rule); color: var(--ink); }
        .uj-metal-opt.is-active {
          border-color: var(--silver); color: var(--ink-strong);
          background: rgba(255,255,255,0.04);
          box-shadow: 0 0 0 1px var(--silver) inset;
        }
        .uj-metal-label { font-size: 12px; letter-spacing: 0.28em; margin: 0; text-transform: uppercase; }

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

      {/* 1. HERO */}
      <section className="uj-hero" data-testid="uj-hero">
        <div className="uj-hero-grid">
          <div className="uj-hero-img-wrap" style={{ transform: `translateY(${heroParallax * 0.25}px)` }}>
            <img src={HERO_IMG} alt={HERO_ALT} className="uj-hero-img" data-testid="uj-hero-img" />
          </div>
          <div>
            <p className="uj-collection">PHILEON FINE JEWELRY</p>
            <p className="uj-collection" style={{ marginTop: '-8px', marginBottom: '16px' }}>GENTLEMEN'S COLLECTION</p>
            <h1 className="uj-hero-title" data-testid="uj-hero-title">UNCLE JO</h1>
            <p className="uj-tagline" data-testid="uj-tagline">"Made for Uncle Jo."</p>
          </div>
        </div>
      </section>

      {/* 2. OPENING EDITORIAL */}
      <section className="uj-section" data-testid="uj-opening">
        <p className="uj-editorial-eyebrow">THE PIECE</p>
        <p className="uj-p">Some men don't need a centerpiece.</p>
        <p className="uj-p"><em>They are the centerpiece.</em></p>
        <p className="uj-p">UNCLE JO is built from solid metal and presence alone.</p>
        <p className="uj-p">No stones. No distractions. No ornament pretending to be authority.</p>
        <p className="uj-p">Just weight. Just structure. <em>Just the confidence of a ring that has nothing to prove.</em></p>
        <div className="uj-divider" />
        <p className="uj-p">Created for a man who asked for something nice.</p>
        <p className="uj-p">Built by his nephew.</p>
      </section>

      {/* 3. COMPOSITION */}
      <section className="uj-section" data-testid="uj-composition">
        <p className="uj-editorial-eyebrow">COMPOSITION</p>
        <h2 className="uj-h2">Available in Sterling Silver or 10K White Gold.</h2>
        <p className="uj-p">UNCLE JO relies entirely on form, proportion, and metalwork.</p>
        <p className="uj-p">Every surface contributes to the identity of the piece.</p>
        <p className="uj-p">Nothing is hidden behind ornament. Nothing competes for attention.</p>
        <p className="uj-p"><em>The metal carries the entire conversation.</em></p>
      </section>

      {/* 4. STRUCTURE */}
      <section className="uj-section" data-testid="uj-structure">
        <p className="uj-editorial-eyebrow">STRUCTURE</p>
        <h2 className="uj-h2">Broad. Confident. Purposeful.</h2>
        <p className="uj-p">The ring wears with the same quiet certainty as the man it was created for.</p>
        <p className="uj-p">The profile is substantial without becoming excessive.</p>
        <p className="uj-p"><em>Every line exists because it belongs there.</em></p>
      </section>

      {/* 5. CRAFT */}
      <section className="uj-section" data-testid="uj-craft">
        <p className="uj-editorial-eyebrow">CRAFT</p>
        <h2 className="uj-h2">Without ornament, every detail becomes visible.</h2>
        <p className="uj-p">The finish. The edges. The proportions. The transitions.</p>
        <p className="uj-p">UNCLE JO is an exercise in restraint.</p>
        <p className="uj-p"><em>A ring that earns attention without asking for it.</em></p>
      </section>

      {/* 6. ARCHIVE GALLERY */}
      <section className="uj-section" data-testid="uj-archive">
        <p className="uj-editorial-eyebrow">ARCHIVE</p>
        <h2 className="uj-h2">Frames from the workshop.</h2>
        <div className="uj-archive-grid">
          {GALLERY.map((g, i) => (
            <div key={g.src} className="uj-archive-cell" data-testid={`uj-archive-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* 7. SPECIFICATIONS */}
      <section className="uj-section" data-testid="uj-specs">
        <p className="uj-editorial-eyebrow">SPECIFICATIONS</p>
        <h2 className="uj-h2">The record.</h2>
        <div>
          {SPECS.map(([k, v]) => (
            <div key={k} className="uj-specs-row">
              <div className="uj-specs-k">{k}</div>
              <div className="uj-specs-v">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CONFIGURATOR */}
      <section className="uj-config" data-testid="uj-configurator">
        <div className="uj-config-head">
          <p className="uj-eyebrow">CONFIGURE YOUR PIECE</p>
          <h2 className="uj-h2">Two metals. One silhouette.</h2>
          <p className="uj-price-line" data-testid="uj-price">{priceFormatted}</p>
        </div>

        <div className="uj-config-group">
          <label className="uj-config-label">Metal</label>
          <div className="uj-metal-row" role="radiogroup" aria-label="Metal">
            {METAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={metalId === opt.id}
                className={`uj-metal-opt${metalId === opt.id ? " is-active" : ""}`}
                data-testid={`uj-metal-${opt.id}`}
                onClick={() => setMetalId(opt.id)}
              >
                <p className="uj-metal-label">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="uj-config-group">
          <label htmlFor="uj-ring-size" className="uj-config-label">Ring Size</label>
          <select
            id="uj-ring-size"
            className="uj-size-select"
            data-testid="uj-ring-size"
            value={ringSize}
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

      {/* 9. FINAL WORD */}
      <section className="uj-final" data-testid="uj-final-word">
        <p className="uj-final-stanza">There are men who spend their lives becoming someone.</p>
        <p className="uj-final-stanza">And there are men who simply <em>are</em>.</p>
        <p className="uj-final-stanza">UNCLE JO belongs to the second group.</p>
        <p className="uj-final-stanza">Created for a man who asked for something nice.</p>
        <p className="uj-final-stanza">Built with respect.</p>
        <p className="uj-final-stanza">
          <em>Made for Uncle Jo.</em>
          <strong>ON THE RECORD.</strong>
        </p>
      </section>
    </div>
  );
}
