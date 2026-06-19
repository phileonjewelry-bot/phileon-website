import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO_IMG = "/boss-knot/hero.png";
const HERO_ALT = "BOSS KNOT — gold lattice tie pendant on cable chain, hand-finished woven mesh knot.";

// 3 metal tiers · Hand-set USD prices · USD-mirrored convention.
const PRICE_MATRIX = {
  silver:        750,
  gold10k_white: 1800,
  gold10k_yellow: 1800,
};

const METAL_OPTIONS = [
  { id: "silver",         label: "Sterling Silver",  short: "SLV", sub: "925 · Solid Cast" },
  { id: "gold10k_white",  label: "10K White Gold",   short: "10W", sub: "Solid · High Polish" },
  { id: "gold10k_yellow", label: "10K Yellow Gold",  short: "10Y", sub: "Solid · Hand-Finished" },
];

const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;

const SPECS = [
  ["Collection", "The Collective · Gentleman's Club"],
  ["Category", "Gentlemen → Pendants"],
  ["Construction", "Open Lattice · Woven Knot"],
  ["Motif", "Tie Silhouette"],
  ["Finish", "Hand-Polished · Bevelled Edge"],
  ["Metal Options", "Sterling Silver · 10K White Gold · 10K Yellow Gold"],
  ["Chain", "Short Cable Chain · Lobster Clasp · Included"],
  ["Fit", "Unisex · Sits at the Collar"],
  ["Availability", "Made To Order"],
  ["Lead Time", "3–4 Weeks"],
  ["Shipping", "Insured · Included"],
];

const GALLERY = [
  { src: "/boss-knot/archive-1.png", alt: "BOSS KNOT — front-on pendant view: gold lattice tie on black." },
  { src: "/boss-knot/archive-2.png", alt: "BOSS KNOT — three-quarter angle: bevelled edge catching light." },
  { src: "/boss-knot/archive-3.png", alt: "BOSS KNOT — knot detail: hand-woven mesh structure." },
  { src: "/boss-knot/archive-4.jpg", alt: "BOSS KNOT — lifestyle: pendant worn over open collar." },
  { src: "/boss-knot/archive-5.jpg", alt: "BOSS KNOT — lifestyle: gold catching evening light." },
  { src: "/boss-knot/archive-6.jpg", alt: "BOSS KNOT — macro: lattice texture and chain clasp." },
  { src: "/boss-knot/archive-7.jpg", alt: "BOSS KNOT — editorial: held in the hand showing scale." },
];

export default function BossKnotPage() {
  const [scrollY, setScrollY] = useState(0);
  const [metalId, setMetalId] = useState("gold10k_yellow");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "BOSS KNOT — PHILEON · Gentleman's Club";
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const currentMetal = METAL_OPTIONS.find((m) => m.id === metalId);
  const priceUsd = PRICE_MATRIX[metalId];
  const priceFormatted = formatUsd(priceUsd);
  const heroParallax = Math.min(scrollY * 0.18, 120);

  const onAddToCart = () => {
    const variant = currentMetal.label;
    handleAddToCart(
      {
        id: `boss-knot-${metalId}`,
        name: `BOSS KNOT — ${variant}`,
        price: priceUsd,
        productKey: "bossKnot",
        tierKey: metalId,
        metal: currentMetal.label,
        sku: `BSK-${currentMetal.short}`,
        quantity: 1,
        image: HERO_IMG,
      },
      1,
      variant,
    );
  };

  return (
    <div className="bsk-page" data-testid="boss-knot-page">
      <style>{`
        .bsk-page {
          --bg: #050505; --bg-deep: #020202;
          --ink: #e8e3d8; --ink-strong: #faf2eb; --ink-muted: #8a8378;
          --gold: #d4af37; --gold-light: #f0d98c; --gold-dim: #8a7027;
          --rule: rgba(212,175,55,0.22); --rule-soft: rgba(212,175,55,0.08);
          background: var(--bg); color: var(--ink);
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          min-height: 100vh;
        }
        .bsk-return { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.35em;
          color: var(--ink-muted); text-decoration: none; display: inline-flex; align-items: center; gap: 10px;
          padding: 28px 0 14px 60px; transition: color 220ms ease; }
        .bsk-return:hover { color: var(--gold); }
        @media (max-width: 720px) { .bsk-return { padding: 24px 0 12px 20px; } }
        .bsk-section { max-width: 1180px; margin: 0 auto;
          padding: clamp(56px,8vw,112px) clamp(20px,4vw,60px); }
        .bsk-eyebrow { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.45em;
          color: var(--gold); text-transform: uppercase; margin: 0 0 22px; }
        .bsk-h2 { font-family: 'Playfair Display', serif; font-weight: 400;
          font-size: clamp(34px,4.4vw,56px); line-height: 1.08; letter-spacing: -0.01em;
          color: var(--ink-strong); margin: 0 0 28px; }
        .bsk-p { font-family: 'Cormorant Garamond', serif; font-size: clamp(17px,1.45vw,21px);
          line-height: 1.62; color: var(--ink); margin: 0 0 18px; }
        .bsk-p em { font-style: italic; color: var(--ink-strong); }
        .bsk-divider { width: 64px; height: 1px; background: var(--rule); margin: 56px 0; }

        /* HERO */
        .bsk-hero { position: relative; padding: 56px 0 104px;
          background: radial-gradient(ellipse 60% 50% at 50% 35%, rgba(212,175,55,0.08), transparent 70%), var(--bg-deep);
          overflow: hidden; }
        .bsk-hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(40px,6vw,96px); max-width: 1380px; margin: 0 auto;
          padding: 0 clamp(20px,4vw,60px); align-items: center; }
        @media (max-width: 880px) { .bsk-hero-grid { grid-template-columns: 1fr; gap: 40px; } }
        .bsk-hero-img-wrap { position: relative; aspect-ratio: 1/1; display: flex;
          align-items: center; justify-content: center; will-change: transform; }
        .bsk-hero-img { width: 100%; height: 100%; object-fit: contain; object-position: center;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.85)) drop-shadow(0 0 24px rgba(212,175,55,0.18)); }
        @media (max-width: 768px) {
          .bsk-hero-img-wrap { aspect-ratio: auto; min-height: 65vw; }
          .bsk-hero-img { height: auto; transform: scale(1.20); transform-origin: center center; }
        }
        .bsk-collection { font-family: 'Cinzel', serif; font-size: 10.5px; letter-spacing: 0.42em;
          color: var(--gold); text-transform: uppercase; margin: 0 0 14px; }
        .bsk-hero-title { font-family: 'Playfair Display', serif; font-weight: 400;
          font-size: clamp(46px,7vw,88px); line-height: 0.98; letter-spacing: 0.04em;
          color: var(--gold-light); margin: 0 0 14px; text-transform: uppercase; }
        .bsk-subtitle { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.34em;
          color: var(--ink-muted); text-transform: uppercase; margin: 0 0 18px; }
        .bsk-tagline { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(18px,1.7vw,24px); color: var(--ink); margin: 0; line-height: 1.4; }

        /* GALLERY */
        .bsk-archive-grid { display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(16px,2vw,28px); margin-top: 28px; }
        .bsk-archive-cell { position: relative; aspect-ratio: 1/1; overflow: hidden;
          background: var(--bg-deep); border: 1px solid var(--rule-soft); }
        .bsk-archive-cell img { width: 100%; height: 100%; object-fit: cover;
          transition: transform 600ms ease; }
        .bsk-archive-cell:hover img { transform: scale(1.02); }
        .bsk-archive-grid > :nth-child(5) { grid-column: 1 / -1; aspect-ratio: 16/9; }
        @media (max-width: 720px) {
          .bsk-archive-grid { grid-template-columns: 1fr; }
          .bsk-archive-grid > :nth-child(5) { grid-column: auto; aspect-ratio: 1/1; }
        }

        /* HIM-HER PANELS */
        .bsk-himher { display: grid; grid-template-columns: 1fr 1fr;
          border-top: 1px solid var(--rule-soft); border-bottom: 1px solid var(--rule-soft);
          margin: clamp(40px,6vw,80px) 0 0; }
        .bsk-himher-panel { padding: clamp(56px,7vw,96px) clamp(28px,4vw,60px); text-align: center; }
        .bsk-himher-panel.him { border-right: 1px solid var(--rule-soft); }
        @media (max-width: 720px) {
          .bsk-himher { grid-template-columns: 1fr; }
          .bsk-himher-panel.him { border-right: none; border-bottom: 1px solid var(--rule-soft); }
        }
        .bsk-himher-label { font-family: 'Cinzel', serif; font-size: 13px;
          letter-spacing: 0.5em; color: var(--gold); margin-bottom: 22px; }
        .bsk-himher-text { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(17px,1.5vw,21px); line-height: 1.65; color: var(--ink); max-width: 380px; margin: 0 auto; }

        /* COMPOSITION */
        .bsk-comp-grid { display: grid; grid-template-columns: repeat(4, 1fr);
          gap: clamp(28px,3.5vw,50px); margin-top: 28px; }
        @media (max-width: 880px) { .bsk-comp-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px) { .bsk-comp-grid { grid-template-columns: 1fr; } }
        .bsk-comp-num { font-family: 'Cinzel', serif; font-size: 11px;
          color: var(--gold-dim); letter-spacing: 0.32em; margin-bottom: 16px; }
        .bsk-comp-h { font-family: 'Cinzel', serif; font-size: 14px; letter-spacing: 0.28em;
          color: var(--gold-light); margin-bottom: 14px; font-weight: 500; text-transform: uppercase; }
        .bsk-comp-p { font-family: 'Cormorant Garamond', serif; font-size: 16px;
          line-height: 1.7; color: var(--ink-muted); margin: 0; }

        /* SPECS */
        .bsk-specs-row { display: grid; grid-template-columns: 220px 1fr; gap: 24px;
          padding: 18px 0; border-bottom: 1px solid var(--rule-soft); }
        .bsk-specs-row:first-of-type { border-top: 1px solid var(--rule-soft); }
        @media (max-width: 640px) { .bsk-specs-row { grid-template-columns: 1fr; gap: 4px; padding: 14px 0; } }
        .bsk-specs-k { font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.32em; color: var(--ink-muted); text-transform: uppercase; }
        .bsk-specs-v { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: var(--ink-strong); }

        /* CONFIG */
        .bsk-config { max-width: 880px; margin: 0 auto;
          padding: clamp(56px,8vw,96px) clamp(20px,4vw,60px) clamp(48px,6vw,72px);
          text-align: center; }
        .bsk-config-head { margin-bottom: 48px; }
        .bsk-price-line { font-family: 'Cinzel', serif; font-size: clamp(20px,2.2vw,28px);
          letter-spacing: 0.22em; color: var(--gold); margin: 12px 0 0; }
        .bsk-config-group { margin-top: 32px; text-align: left; }
        .bsk-config-label { display: block; font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.38em; color: var(--ink-muted);
          text-transform: uppercase; margin-bottom: 14px; }
        .bsk-opt-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) { .bsk-opt-row { grid-template-columns: 1fr; } }
        .bsk-opt { appearance: none; background: transparent; color: var(--ink-muted);
          border: 1px solid var(--rule-soft); padding: 18px 14px 16px; cursor: pointer;
          text-align: center; font-family: 'Cinzel', serif;
          transition: border-color 220ms ease, color 220ms ease, background 220ms ease; }
        .bsk-opt:hover { border-color: var(--rule); color: var(--ink); }
        .bsk-opt.is-active { border-color: var(--gold); color: var(--ink-strong);
          background: rgba(212,175,55,0.06);
          box-shadow: 0 0 0 1px var(--gold) inset, 0 12px 32px -16px rgba(212,175,55,0.5); }
        .bsk-opt-label { font-size: 12px; letter-spacing: 0.28em; margin: 0; text-transform: uppercase; }
        .bsk-opt-sub { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 12px; color: var(--ink-muted); margin: 6px 0 0; }
        .bsk-opt-price { font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.18em; color: var(--gold); margin: 8px 0 0; }
        .bsk-purchase { margin-top: 56px; text-align: center;
          border-top: 1px solid var(--rule-soft); padding-top: 40px; }
        .bsk-purchase-eyebrow { font-family: 'Cinzel', serif; font-size: 10.5px;
          letter-spacing: 0.46em; color: var(--ink-muted); margin: 0 0 6px; }
        .bsk-purchase-lead { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 15px; color: var(--ink-muted); margin: 0 0 24px; }
        .bsk-btn { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.42em;
          color: var(--ink-strong); background: transparent;
          border: 1px solid var(--gold); padding: 18px 44px; cursor: pointer;
          text-transform: uppercase;
          transition: background 280ms ease, color 280ms ease, letter-spacing 280ms ease; }
        .bsk-btn:hover { background: var(--gold); color: var(--bg-deep); letter-spacing: 0.48em; }
        .bsk-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* FINAL WORD */
        .bsk-final { background: var(--bg-deep);
          padding: clamp(72px,9vw,128px) clamp(20px,4vw,60px);
          text-align: center; border-top: 1px solid var(--rule-soft); }
        .bsk-final-stanza { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(20px,2vw,28px); line-height: 1.55; color: var(--ink);
          max-width: 720px; margin: 0 auto 26px; }
        .bsk-final-stanza strong { font-style: normal; font-family: 'Cinzel', serif;
          font-size: 14px; letter-spacing: 0.42em; color: var(--gold);
          display: block; margin-top: 14px; }
      `}</style>

      <Link to="/shop" className="bsk-return" data-testid="bsk-return"><ArrowLeft size={14} /> RETURN</Link>

      {/* HERO */}
      <section className="bsk-hero" data-testid="bsk-hero">
        <div className="bsk-hero-grid">
          <div className="bsk-hero-img-wrap" style={{ transform: `translateY(${heroParallax * 0.25}px)` }}>
            <img src={HERO_IMG} alt={HERO_ALT} className="bsk-hero-img" data-testid="bsk-hero-img" />
          </div>
          <div>
            <p className="bsk-collection">PHILEON · TRIBUTE TO POWER</p>
            <h1 className="bsk-hero-title" data-testid="bsk-hero-title">BOSS KNOT</h1>
            <p className="bsk-subtitle" data-testid="bsk-subtitle">Gold Lattice Tie Pendant · Unisex</p>
            <p className="bsk-tagline" data-testid="bsk-tagline">From the boardroom to the ballroom.</p>
            <p className="bsk-tagline" style={{ marginTop: 12, fontSize: 'clamp(15px,1.3vw,18px)', color: 'var(--ink-muted)' }}>
              A tie cast in metal. Woven like fabric. Worn like a verdict.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
              <button type="button" className="bsk-btn" data-testid="bsk-hero-craft"
                onClick={() => document.querySelector('[data-testid="bsk-configurator"]')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '14px 32px', fontSize: 11 }}>CRAFT YOURS</button>
              <button type="button" className="bsk-btn" data-testid="bsk-hero-details"
                onClick={() => document.querySelector('[data-testid="bsk-specs"]')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '14px 32px', fontSize: 11, borderColor: 'var(--rule)', color: 'var(--ink-muted)' }}>VIEW DETAILS</button>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL — THE PIECE */}
      <section className="bsk-section" data-testid="bsk-opening">
        <p className="bsk-eyebrow">THE PIECE</p>
        <p className="bsk-p">A tie is supposed to mean <em>obligation.</em></p>
        <p className="bsk-p"><em>This one means the opposite.</em></p>
        <p className="bsk-p">Cast in solid metal, woven like fabric, worn like a verdict. Not assigned by a dress code — declared by whoever puts it on.</p>
        <div className="bsk-divider" />
        <p className="bsk-p">Designed for the man who arrives quietly and leaves remembered.</p>
        <p className="bsk-p"><em>Worn at the collar by him. Worn over silk by her. Same authority.</em></p>
      </section>

      {/* GALLERY */}
      <section className="bsk-section" data-testid="bsk-archive">
        <p className="bsk-eyebrow">ARCHIVE</p>
        <h2 className="bsk-h2">The weave catches the room.</h2>
        <div className="bsk-archive-grid">
          {GALLERY.map((g, i) => (
            <div key={g.src} className="bsk-archive-cell" data-testid={`bsk-archive-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* HIM · HER */}
      <section className="bsk-section" data-testid="bsk-himher" style={{ paddingTop: 0 }}>
        <div className="bsk-himher">
          <div className="bsk-himher-panel him">
            <p className="bsk-himher-label">HIM</p>
            <p className="bsk-himher-text">Boardroom by nine. Somewhere louder by nine PM. No wardrobe change required — the gold does the translating.</p>
          </div>
          <div className="bsk-himher-panel her">
            <p className="bsk-himher-label">HER</p>
            <p className="bsk-himher-text">Worn over silk, not under a collar. She broke the dress code on purpose — and the host noticed first.</p>
          </div>
        </div>
      </section>

      {/* COMPOSITION */}
      <section className="bsk-section" data-testid="bsk-composition">
        <p className="bsk-eyebrow">COMPOSITION</p>
        <h2 className="bsk-h2">Four notes. One verdict.</h2>
        <div className="bsk-comp-grid">
          <div data-testid="bsk-comp-1">
            <p className="bsk-comp-num">01</p>
            <p className="bsk-comp-h">Material</p>
            <p className="bsk-comp-p">Solid Sterling Silver, 10K White Gold, or 10K Yellow Gold. Cast, never plated.</p>
          </div>
          <div data-testid="bsk-comp-2">
            <p className="bsk-comp-num">02</p>
            <p className="bsk-comp-h">Structure</p>
            <p className="bsk-comp-p">Open lattice tie silhouette with hand-woven knot detail and bevelled edge.</p>
          </div>
          <div data-testid="bsk-comp-3">
            <p className="bsk-comp-num">03</p>
            <p className="bsk-comp-h">Craft</p>
            <p className="bsk-comp-p">Designed in Rhino, hand-finished by master goldsmiths. One-of-one weave on every piece.</p>
          </div>
          <div data-testid="bsk-comp-4">
            <p className="bsk-comp-num">04</p>
            <p className="bsk-comp-h">Fit</p>
            <p className="bsk-comp-p">Unisex. Short cable chain sits at the collar. His-and-hers · same authority.</p>
          </div>
        </div>
      </section>

      {/* SPECS */}
      <section className="bsk-section" data-testid="bsk-specs">
        <p className="bsk-eyebrow">SPECIFICATIONS</p>
        <h2 className="bsk-h2">The record.</h2>
        <div>
          {SPECS.map(([k, v]) => (
            <div key={k} className="bsk-specs-row">
              <div className="bsk-specs-k">{k}</div>
              <div className="bsk-specs-v">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONFIGURATOR */}
      <section className="bsk-config" data-testid="bsk-configurator">
        <div className="bsk-config-head">
          <p className="bsk-eyebrow">CHOOSE YOUR BOSS KNOT</p>
          <h2 className="bsk-h2">Three metals. One silhouette.</h2>
          <p className="bsk-price-line" data-testid="bsk-price">{priceFormatted}</p>
        </div>

        <div className="bsk-config-group">
          <label className="bsk-config-label">Metal</label>
          <div className="bsk-opt-row" role="radiogroup" aria-label="Metal">
            {METAL_OPTIONS.map((opt) => (
              <button key={opt.id} type="button" role="radio" aria-checked={metalId === opt.id}
                className={`bsk-opt${metalId === opt.id ? " is-active" : ""}`}
                data-testid={`bsk-metal-${opt.id}`} onClick={() => setMetalId(opt.id)}>
                <p className="bsk-opt-label">{opt.label}</p>
                <p className="bsk-opt-sub">{opt.sub}</p>
                <p className="bsk-opt-price">{formatUsd(PRICE_MATRIX[opt.id])}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bsk-purchase">
          <p className="bsk-purchase-eyebrow">MADE TO ORDER</p>
          <p className="bsk-purchase-lead">Lead Time · 3–4 Weeks · Insured Shipping · Chain Included</p>
          <button type="button" className="bsk-btn" data-testid="bsk-add-to-cart"
            onClick={onAddToCart} disabled={isAdding}>
            {buttonText}
          </button>
        </div>
      </section>

      {/* FINAL WORD */}
      <section className="bsk-final" data-testid="bsk-final-word">
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '0.45em',
          color: 'var(--gold)', textTransform: 'uppercase', margin: '0 0 22px' }}>FINAL WORD</p>
        <h2 className="bsk-h2" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>Not every room deserves a reaction.</h2>
        <p className="bsk-final-stanza"><em>This one always gets one.</em></p>
        <p className="bsk-final-stanza">
          <strong>FROM THE BOARDROOM TO THE BALLROOM.</strong>
        </p>
      </section>
    </div>
  );
}
