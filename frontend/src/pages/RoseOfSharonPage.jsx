import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO_IMG = "/rose-of-sharon/hero.png";
const HERO_ALT = "ROSE OF SHARON — three-dimensional floral cross pendant in 14K rose gold with raised central rose cluster and openwork vine structure.";

// 2 sizes × 2 metals = 4 SKUs. Hand-set USD prices · USD-mirrored.
const PRICE_MATRIX = {
  small:     { gold10k: 950,  gold14k: 1250 },
  signature: { gold10k: 1350, gold14k: 1750 },
};
const SIZE_OPTIONS = [
  { id: "small",     label: "Small",     short: "SM",  dims: "28mm × 18mm" },
  { id: "signature", label: "Signature", short: "SIG", dims: "40mm × 25mm" },
];
const METAL_OPTIONS = [
  { id: "gold10k", label: "10K Rose Gold", short: "10K" },
  { id: "gold14k", label: "14K Rose Gold", short: "14K" },
];
const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;

const SPECS = [
  ["Collection", "Sacred Collection"],
  ["Category", "Ladies → Pendants"],
  ["Metal Options", "10K Rose Gold · 14K Rose Gold"],
  ["Construction", "Three-dimensional floral architecture · openwork vine structure"],
  ["Center", "Raised central rose cluster"],
  ["Finish", "High Polish · decorative engraved bail"],
  ["Sizes", "Small (28mm × 18mm) · Signature (40mm × 25mm)"],
  ["Availability", "Made To Order"],
  ["Lead Time", "3–4 Weeks"],
  ["Shipping", "Insured · Included"],
  ["Note", "Chain Sold Separately"],
];

const GALLERY = [
  { src: "/rose-of-sharon/archive-1.png", alt: "ROSE OF SHARON — studio hero: full pendant on black, every rose and vine catching light." },
  { src: "/rose-of-sharon/archive-2.jpg", alt: "ROSE OF SHARON — chain detail on linen, the engraved bail and rose cluster in directional light." },
  { src: "/rose-of-sharon/archive-3.jpg", alt: "ROSE OF SHARON — held between fingers, scale revealed against the hand." },
  { src: "/rose-of-sharon/archive-4.jpg", alt: "ROSE OF SHARON — resting in an open palm, full silhouette on warm wood." },
  { src: "/rose-of-sharon/archive-5.jpg", alt: "ROSE OF SHARON — worn at the décolletage, the cross blooming through everyday wear." },
];

export default function RoseOfSharonPage() {
  const [scrollY, setScrollY] = useState(0);
  const [sizeId, setSizeId] = useState("signature");
  const [metalId, setMetalId] = useState("gold14k");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "ROSE OF SHARON — PHILEON · Sacred Collection";
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const currentSize = SIZE_OPTIONS.find((s) => s.id === sizeId);
  const currentMetal = METAL_OPTIONS.find((m) => m.id === metalId);
  const priceUsd = PRICE_MATRIX[sizeId][metalId];
  const priceFormatted = formatUsd(priceUsd);
  const tierKey = `${sizeId}_${metalId}`;
  const heroParallax = Math.min(scrollY * 0.18, 120);

  const onAddToCart = () => {
    const variant = `${currentSize.label} · ${currentMetal.label}`;
    handleAddToCart(
      {
        id: `rose-of-sharon-${tierKey}`,
        name: `ROSE OF SHARON — ${variant}`,
        price: priceUsd,
        productKey: "roseOfSharon",
        tierKey,
        size: currentSize.label,
        metal: currentMetal.label,
        sku: `ROS-${currentSize.short}-${currentMetal.short}`,
        quantity: 1,
        image: HERO_IMG,
      },
      1,
      variant,
    );
  };

  return (
    <div className="ros-page" data-testid="rose-of-sharon-page">
      <style>{`
        .ros-page {
          --bg: #0a0709; --bg-deep: #050306;
          --ink: #ede1d8; --ink-strong: #faf2eb; --ink-muted: #a0867a;
          --rose: #d3a085; --rose-dim: #8e6b5c;
          --rule: rgba(255,220,210,0.14); --rule-soft: rgba(255,220,210,0.06);
          background: var(--bg); color: var(--ink);
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          min-height: 100vh;
        }
        .ros-return { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.35em;
          color: var(--ink-muted); text-decoration: none; display: inline-flex; align-items: center; gap: 10px;
          padding: 28px 0 14px 60px; transition: color 220ms ease; }
        .ros-return:hover { color: var(--rose); }
        @media (max-width: 720px) { .ros-return { padding: 24px 0 12px 20px; } }
        .ros-section { max-width: 1180px; margin: 0 auto;
          padding: clamp(56px,8vw,112px) clamp(20px,4vw,60px); }
        .ros-eyebrow { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.45em;
          color: var(--rose); text-transform: uppercase; margin: 0 0 22px; }
        .ros-h2 { font-family: 'Playfair Display', serif; font-weight: 400;
          font-size: clamp(34px,4.4vw,56px); line-height: 1.08; letter-spacing: -0.01em;
          color: var(--ink-strong); margin: 0 0 28px; }
        .ros-p { font-family: 'Cormorant Garamond', serif; font-size: clamp(17px,1.45vw,21px);
          line-height: 1.62; color: var(--ink); margin: 0 0 18px; }
        .ros-p em { font-style: italic; color: var(--ink-strong); }
        .ros-divider { width: 64px; height: 1px; background: var(--rule); margin: 56px 0; }
        /* HERO */
        .ros-hero { position: relative; padding: 56px 0 104px;
          background: radial-gradient(ellipse 60% 50% at 50% 35%, rgba(211,160,133,0.10), transparent 70%), var(--bg-deep);
          overflow: hidden; }
        .ros-hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(40px,6vw,96px); max-width: 1380px; margin: 0 auto;
          padding: 0 clamp(20px,4vw,60px); align-items: center; }
        @media (max-width: 880px) { .ros-hero-grid { grid-template-columns: 1fr; gap: 40px; } }
        .ros-hero-img-wrap { position: relative; aspect-ratio: 1/1; display: flex;
          align-items: center; justify-content: center; will-change: transform; }
        .ros-hero-img { width: 100%; height: 100%; object-fit: contain; object-position: center;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.85)) drop-shadow(0 0 24px rgba(211,160,133,0.16)); }
        @media (max-width: 768px) {
          .ros-hero-img-wrap { aspect-ratio: auto; min-height: 65vw; }
          .ros-hero-img { height: auto; transform: scale(1.25); transform-origin: center center; }
        }
        .ros-collection { font-family: 'Cinzel', serif; font-size: 10.5px; letter-spacing: 0.42em;
          color: var(--rose); text-transform: uppercase; margin: 0 0 14px; }
        .ros-hero-title { font-family: 'Playfair Display', serif; font-weight: 400;
          font-size: clamp(46px,6.6vw,84px); line-height: 0.98; letter-spacing: -0.02em;
          color: var(--ink-strong); margin: 0 0 14px; }
        .ros-subtitle { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.34em;
          color: var(--ink-muted); text-transform: uppercase; margin: 0 0 18px; }
        .ros-tagline { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(18px,1.7vw,24px); color: var(--ink); margin: 0; line-height: 1.4; }
        /* GALLERY */
        .ros-archive-grid { display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(16px,2vw,28px); margin-top: 28px; }
        .ros-archive-cell { position: relative; aspect-ratio: 1/1; overflow: hidden;
          background: var(--bg-deep); border: 1px solid var(--rule-soft); }
        .ros-archive-cell img { width: 100%; height: 100%; object-fit: contain;
          transition: transform 600ms ease; }
        .ros-archive-cell:hover img { transform: scale(1.02); }
        .ros-archive-grid > :nth-child(5) { grid-column: 1 / -1; aspect-ratio: 16/9; }
        .ros-archive-grid > :nth-child(5) img { object-fit: cover; }
        @media (max-width: 720px) {
          .ros-archive-grid { grid-template-columns: 1fr; }
          .ros-archive-grid > :nth-child(5) { grid-column: auto; aspect-ratio: 1/1; }
          .ros-archive-grid > :nth-child(5) img { object-fit: contain; }
        }
        /* SPECS */
        .ros-specs-row { display: grid; grid-template-columns: 220px 1fr; gap: 24px;
          padding: 18px 0; border-bottom: 1px solid var(--rule-soft); }
        .ros-specs-row:first-of-type { border-top: 1px solid var(--rule-soft); }
        @media (max-width: 640px) { .ros-specs-row { grid-template-columns: 1fr; gap: 4px; padding: 14px 0; } }
        .ros-specs-k { font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.32em; color: var(--ink-muted); text-transform: uppercase; }
        .ros-specs-v { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: var(--ink-strong); }
        /* CONFIG */
        .ros-config { max-width: 880px; margin: 0 auto;
          padding: clamp(56px,8vw,96px) clamp(20px,4vw,60px) clamp(48px,6vw,72px);
          text-align: center; }
        .ros-config-head { margin-bottom: 48px; }
        .ros-price-line { font-family: 'Cinzel', serif; font-size: clamp(20px,2.2vw,28px);
          letter-spacing: 0.22em; color: var(--rose); margin: 12px 0 0; }
        .ros-config-group { margin-top: 32px; text-align: left; }
        .ros-config-label { display: block; font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.38em; color: var(--ink-muted);
          text-transform: uppercase; margin-bottom: 14px; }
        .ros-opt-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ros-opt { appearance: none; background: transparent; color: var(--ink-muted);
          border: 1px solid var(--rule-soft); padding: 18px 14px 16px; cursor: pointer;
          text-align: center; font-family: 'Cinzel', serif;
          transition: border-color 220ms ease, color 220ms ease, background 220ms ease; }
        .ros-opt:hover { border-color: var(--rule); color: var(--ink); }
        .ros-opt.is-active { border-color: var(--rose); color: var(--ink-strong);
          background: rgba(211,160,133,0.06);
          box-shadow: 0 0 0 1px var(--rose) inset, 0 12px 32px -16px rgba(211,160,133,0.5); }
        .ros-opt-label { font-size: 12px; letter-spacing: 0.28em; margin: 0; text-transform: uppercase; }
        .ros-opt-sub { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 12px; color: var(--ink-muted); margin: 6px 0 0; }
        .ros-purchase { margin-top: 56px; text-align: center;
          border-top: 1px solid var(--rule-soft); padding-top: 40px; }
        .ros-purchase-eyebrow { font-family: 'Cinzel', serif; font-size: 10.5px;
          letter-spacing: 0.46em; color: var(--ink-muted); margin: 0 0 6px; }
        .ros-purchase-lead { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 15px; color: var(--ink-muted); margin: 0 0 24px; }
        .ros-btn { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.42em;
          color: var(--ink-strong); background: transparent;
          border: 1px solid var(--rose); padding: 18px 44px; cursor: pointer;
          text-transform: uppercase;
          transition: background 280ms ease, color 280ms ease, letter-spacing 280ms ease; }
        .ros-btn:hover { background: var(--rose); color: var(--bg-deep); letter-spacing: 0.48em; }
        .ros-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .ros-final { background: var(--bg-deep);
          padding: clamp(72px,9vw,128px) clamp(20px,4vw,60px);
          text-align: center; border-top: 1px solid var(--rule-soft); }
        .ros-final-stanza { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(18px,1.7vw,24px); line-height: 1.7; color: var(--ink);
          max-width: 680px; margin: 0 auto 26px; }
        .ros-final-stanza strong { font-style: normal; font-family: 'Cinzel', serif;
          font-size: 14px; letter-spacing: 0.42em; color: var(--rose);
          display: block; margin-top: 12px; }
      `}</style>

      <Link to="/shop" className="ros-return" data-testid="ros-return"><ArrowLeft size={14} /> RETURN</Link>

      {/* HERO */}
      <section className="ros-hero" data-testid="ros-hero">
        <div className="ros-hero-grid">
          <div className="ros-hero-img-wrap" style={{ transform: `translateY(${heroParallax * 0.25}px)` }}>
            <img src={HERO_IMG} alt={HERO_ALT} className="ros-hero-img" data-testid="ros-hero-img" />
          </div>
          <div>
            <p className="ros-collection">PHILEON · SACRED COLLECTION</p>
            <h1 className="ros-hero-title" data-testid="ros-hero-title">ROSE OF SHARON</h1>
            <p className="ros-subtitle" data-testid="ros-subtitle">Floral Cross Pendant</p>
            <p className="ros-tagline" data-testid="ros-tagline">Faith does not bloom despite the thorns. Faith blooms through them.</p>
          </div>
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="ros-section" data-testid="ros-opening">
        <p className="ros-eyebrow">THE PIECE</p>
        <p className="ros-p">Some crosses are worn as symbols.</p>
        <p className="ros-p"><em>Others become stories.</em></p>
        <p className="ros-p">Rose of Sharon was designed as a living cross — a piece where faith and beauty grow together. Vines climb through the structure. Roses bloom from every arm. At its center, a single blossom anchors the entire composition.</p>
        <div className="ros-divider" />
        <p className="ros-p">The cross remains.</p>
        <p className="ros-p"><em>But life grows through it.</em></p>
        <p className="ros-p">Inspired by the biblical Rose of Sharon, this piece speaks to grace, perseverance, beauty, and devotion. Every flower represents growth. Every vine represents the journey. Every detail serves the story.</p>
      </section>

      {/* GALLERY */}
      <section className="ros-section" data-testid="ros-archive">
        <p className="ros-eyebrow">ARCHIVE</p>
        <h2 className="ros-h2">Vines climb. Roses bloom.</h2>
        <div className="ros-archive-grid">
          {GALLERY.map((g, i) => (
            <div key={g.src} className="ros-archive-cell" data-testid={`ros-archive-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* SPECS */}
      <section className="ros-section" data-testid="ros-specs">
        <p className="ros-eyebrow">SPECIFICATIONS</p>
        <h2 className="ros-h2">The record.</h2>
        <div>
          {SPECS.map(([k, v]) => (
            <div key={k} className="ros-specs-row">
              <div className="ros-specs-k">{k}</div>
              <div className="ros-specs-v">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONFIGURATOR */}
      <section className="ros-config" data-testid="ros-configurator">
        <div className="ros-config-head">
          <p className="ros-eyebrow">CHOOSE YOUR ROSE OF SHARON</p>
          <h2 className="ros-h2">Two sizes. Two metals.</h2>
          <p className="ros-price-line" data-testid="ros-price">{priceFormatted}</p>
        </div>

        <div className="ros-config-group">
          <label className="ros-config-label">Size</label>
          <div className="ros-opt-row" role="radiogroup" aria-label="Size">
            {SIZE_OPTIONS.map((opt) => (
              <button key={opt.id} type="button" role="radio" aria-checked={sizeId === opt.id}
                className={`ros-opt${sizeId === opt.id ? " is-active" : ""}`}
                data-testid={`ros-size-${opt.id}`} onClick={() => setSizeId(opt.id)}>
                <p className="ros-opt-label">{opt.label}</p>
                <p className="ros-opt-sub">{opt.dims}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="ros-config-group">
          <label className="ros-config-label">Metal</label>
          <div className="ros-opt-row" role="radiogroup" aria-label="Metal">
            {METAL_OPTIONS.map((opt) => (
              <button key={opt.id} type="button" role="radio" aria-checked={metalId === opt.id}
                className={`ros-opt${metalId === opt.id ? " is-active" : ""}`}
                data-testid={`ros-metal-${opt.id}`} onClick={() => setMetalId(opt.id)}>
                <p className="ros-opt-label">{opt.label}</p>
                <p className="ros-opt-sub">{formatUsd(PRICE_MATRIX[sizeId][opt.id])}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="ros-purchase">
          <p className="ros-purchase-eyebrow">MADE TO ORDER</p>
          <p className="ros-purchase-lead">Lead Time · 3–4 Weeks · Insured Shipping · Chain Sold Separately</p>
          <button type="button" className="ros-btn" data-testid="ros-add-to-cart"
            onClick={onAddToCart} disabled={isAdding}>
            {buttonText}
          </button>
        </div>
      </section>

      {/* FINAL WORD */}
      <section className="ros-final" data-testid="ros-final-word">
        <p className="ros-final-stanza">There are crosses that remind us what we believe.</p>
        <p className="ros-final-stanza"><em>And there are crosses that remind us why.</em></p>
        <p className="ros-final-stanza">Rose of Sharon was created for those who understand that faith is not merely carried through life — it grows through it.</p>
        <p className="ros-final-stanza">Every rose blooms because it endured.</p>
        <p className="ros-final-stanza">Every vine climbs because it continues.</p>
        <p className="ros-final-stanza">
          <em>And every prayer leaves something beautiful behind.</em>
          <strong>BLOOM THROUGH.</strong>
        </p>
      </section>
    </div>
  );
}
