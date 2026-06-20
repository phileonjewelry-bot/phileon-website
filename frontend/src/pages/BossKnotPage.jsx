import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO_ALT = "BOSS KNOT — woven mesh executive pendant, 70mm × 25mm, 18\" matching chain included.";

// Imagery pending upload — page uses a typographic placeholder until BOSS KNOT shots arrive.
const HAS_IMAGERY = false;

// 3 metal tiers · Hand-set USD prices · USD-mirrored convention.
// SKU keys must mirror livePricingConfig.js + pricing_engine.py.
const PRICE_MATRIX = {
  silver:         3200,
  gold10k_yellow: 8500,
  gold10k_white:  8500,
};

// Cascading configurator: metal → (if Gold) colour + karat.
const METAL_CHOICES = [
  { id: "silver", label: "Sterling Silver" },
  { id: "gold",   label: "Gold" },
];
const COLOUR_CHOICES = [
  { id: "yellow", label: "Yellow Gold" },
  { id: "white",  label: "White Gold" },
];
const KARAT_CHOICES = [
  { id: "10K", label: "10K" },
];

const SKU_FOR = (metal, colour) => {
  if (metal === "silver") return "silver";
  if (metal === "gold" && colour === "yellow") return "gold10k_yellow";
  if (metal === "gold" && colour === "white")  return "gold10k_white";
  return "silver";
};

const LABEL_FOR = {
  silver:         "Sterling Silver",
  gold10k_yellow: "10K Yellow Gold",
  gold10k_white:  "10K White Gold",
};
const SHORT_FOR = {
  silver:         "SLV",
  gold10k_yellow: "10Y",
  gold10k_white:  "10W",
};

const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;

const SPECS = [
  ["Collection", "The Collective"],
  ["Category", "Gentlemen → Pendants"],
  ["Style", "Executive Pendant · Statement Piece"],
  ["Construction", "Woven Mesh Architecture"],
  ["Profile", "Three-Dimensional Sculptural Form"],
  ["Pendant Length", "70 mm"],
  ["Pendant Width", "25 mm"],
  ["Weight · Sterling Silver", "36–38 g"],
  ["Weight · 10K Yellow Gold", "37.48 g"],
  ["Weight · 10K White Gold", "36.50 g"],
  ["Chain", "18\" Matching Chain · Included"],
  ["Finish", "High Polish"],
  ["Inspiration", "Tailored Formalwear · Executive Presence"],
  ["Occasion", "Galas · Boardrooms · Private Events · Corporate · Travel"],
  ["Availability", "Made To Order"],
  ["Lead Time", "3–4 Weeks"],
  ["Shipping", "Insured · Included"],
  ["Presentation", "Luxury Presentation Box · Included"],
];

const GALLERY = []; // Imagery pending upload — gallery hidden until BOSS KNOT shots arrive.

export default function BossKnotPage() {
  const [scrollY, setScrollY] = useState(0);
  const [metalChoice,  setMetalChoice]  = useState("gold");
  const [colourChoice, setColourChoice] = useState("yellow");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "BOSS KNOT — PHILEON · The Collective";
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const tierKey = useMemo(() => SKU_FOR(metalChoice, colourChoice), [metalChoice, colourChoice]);
  const priceUsd = PRICE_MATRIX[tierKey];
  const priceFormatted = formatUsd(priceUsd);
  const heroParallax = Math.min(scrollY * 0.18, 120);
  const colourDisabled = metalChoice === "silver";

  const onAddToCart = () => {
    const variant = LABEL_FOR[tierKey];
    handleAddToCart(
      {
        id: `boss-knot-${tierKey}`,
        name: `BOSS KNOT — ${variant}`,
        price: priceUsd,
        productKey: "bossKnot",
        tierKey,
        metal: variant,
        sku: `BSK-${SHORT_FOR[tierKey]}`,
        quantity: 1,
        image: null,
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

        /* HERO — typographic placeholder (no imagery yet) */
        .bsk-hero-placeholder {
          width: 100%; aspect-ratio: 1/1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 32px; text-align: center;
          background: radial-gradient(ellipse at center, rgba(212,175,55,0.10), transparent 70%), var(--bg-deep);
          border: 1px solid var(--rule-soft);
          position: relative; overflow: hidden;
        }
        .bsk-hero-placeholder::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(212,175,55,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.05) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
        }
        .bsk-hero-placeholder-line { font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.45em; color: var(--gold-dim); text-transform: uppercase; position: relative; }
        .bsk-hero-placeholder-mono { font-family: 'Playfair Display', serif; font-weight: 400;
          font-size: clamp(48px,7.5vw,96px); letter-spacing: 0.06em; line-height: 0.95;
          color: var(--gold-light); text-transform: uppercase; position: relative;
          text-shadow: 0 0 24px rgba(212,175,55,0.25); }
        @media (max-width: 768px) {
          .bsk-hero-placeholder { aspect-ratio: auto; min-height: 65vw; padding: 56px 24px; }
        }

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
        .bsk-specs-row { display: grid; grid-template-columns: 260px 1fr; gap: 24px;
          padding: 18px 0; border-bottom: 1px solid var(--rule-soft); }
        .bsk-specs-row:first-of-type { border-top: 1px solid var(--rule-soft); }
        @media (max-width: 640px) { .bsk-specs-row { grid-template-columns: 1fr; gap: 4px; padding: 14px 0; } }
        .bsk-specs-k { font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.32em; color: var(--ink-muted); text-transform: uppercase; }
        .bsk-specs-v { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: var(--ink-strong); }

        /* INCLUDED LIST */
        .bsk-included { display: grid; grid-template-columns: 1fr 1fr;
          gap: 14px 32px; margin-top: 24px; max-width: 720px; }
        @media (max-width: 640px) { .bsk-included { grid-template-columns: 1fr; } }
        .bsk-included li { list-style: none; font-family: 'Cormorant Garamond', serif;
          font-size: 16px; color: var(--ink); display: flex; gap: 12px; align-items: baseline; }
        .bsk-included li::before { content: '✓'; color: var(--gold);
          font-family: 'Cinzel', serif; font-size: 14px; flex-shrink: 0; }

        /* CONFIG */
        .bsk-config { max-width: 880px; margin: 0 auto;
          padding: clamp(56px,8vw,96px) clamp(20px,4vw,60px) clamp(48px,6vw,72px);
          text-align: center; }
        .bsk-config-head { margin-bottom: 48px; }
        .bsk-price-line { font-family: 'Cinzel', serif; font-size: clamp(20px,2.2vw,28px);
          letter-spacing: 0.22em; color: var(--gold); margin: 12px 0 0; }
        .bsk-price-sub { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: 13px; color: var(--ink-muted); margin: 8px 0 0; }
        .bsk-config-group { margin-top: 32px; text-align: left; }
        .bsk-config-label { display: block; font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.38em; color: var(--ink-muted);
          text-transform: uppercase; margin-bottom: 14px; }
        .bsk-opt-row { display: grid; gap: 12px; }
        .bsk-opt-row.cols-2 { grid-template-columns: 1fr 1fr; }
        .bsk-opt-row.cols-1 { grid-template-columns: 1fr; }
        @media (max-width: 640px) { .bsk-opt-row { grid-template-columns: 1fr !important; } }
        .bsk-opt { appearance: none; background: transparent; color: var(--ink-muted);
          border: 1px solid var(--rule-soft); padding: 18px 14px 16px; cursor: pointer;
          text-align: center; font-family: 'Cinzel', serif;
          transition: border-color 220ms ease, color 220ms ease, background 220ms ease; }
        .bsk-opt:hover:not(:disabled) { border-color: var(--rule); color: var(--ink); }
        .bsk-opt.is-active { border-color: var(--gold); color: var(--ink-strong);
          background: rgba(212,175,55,0.06);
          box-shadow: 0 0 0 1px var(--gold) inset, 0 12px 32px -16px rgba(212,175,55,0.5); }
        .bsk-opt:disabled { opacity: 0.32; cursor: not-allowed; }
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

        /* BILLIONAIRES CLUB SECTION */
        .bsk-club { background: var(--bg-deep);
          padding: clamp(80px,10vw,144px) clamp(20px,4vw,60px);
          border-top: 1px solid var(--rule-soft);
          border-bottom: 1px solid var(--rule-soft);
          text-align: center; }
        .bsk-club-inner { max-width: 760px; margin: 0 auto; }
        .bsk-club p { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(18px,1.7vw,24px); line-height: 1.7; color: var(--ink); margin: 0 0 18px; }
        .bsk-club p.solid { font-style: normal; color: var(--ink-strong); }

        /* FINAL WORD */
        .bsk-final { background: var(--bg-deep);
          padding: clamp(72px,9vw,128px) clamp(20px,4vw,60px);
          text-align: center; }
        .bsk-final-stanza { font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(20px,2vw,28px); line-height: 1.55; color: var(--ink);
          max-width: 720px; margin: 0 auto 22px; }
        .bsk-final-stanza strong { font-style: normal; font-family: 'Cinzel', serif;
          font-size: 14px; letter-spacing: 0.42em; color: var(--gold);
          display: block; margin-top: 14px; }
      `}</style>

      <Link to="/shop" className="bsk-return" data-testid="bsk-return"><ArrowLeft size={14} /> RETURN</Link>

      {/* HERO */}
      <section className="bsk-hero" data-testid="bsk-hero">
        <div className="bsk-hero-grid">
          <div className="bsk-hero-img-wrap" style={{ transform: `translateY(${heroParallax * 0.25}px)` }}>
            <div className="bsk-hero-placeholder" data-testid="bsk-hero-placeholder" aria-label={HERO_ALT}>
              <span className="bsk-hero-placeholder-line">PHILEON</span>
              <span className="bsk-hero-placeholder-mono">BOSS<br />KNOT</span>
              <span className="bsk-hero-placeholder-line">THE COLLECTIVE</span>
            </div>
          </div>
          <div>
            <p className="bsk-collection">THE COLLECTIVE</p>
            <h1 className="bsk-hero-title" data-testid="bsk-hero-title">BOSS KNOT</h1>
            <p className="bsk-subtitle" data-testid="bsk-subtitle">Executive Pendant · 18&quot; Chain Included</p>
            <p className="bsk-tagline" data-testid="bsk-tagline">For those who don&apos;t get out often. But when they do, they arrive.</p>
            <p className="bsk-tagline" style={{ marginTop: 12, fontSize: 'clamp(15px,1.3vw,18px)', color: 'var(--ink-muted)' }}>
              The necktie, translated into precious metal.
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
        <h2 className="bsk-h2">For those who don&apos;t get out often — but when they do, they arrive.</h2>
        <p className="bsk-p">Inspired by formalwear, influence, and the quiet confidence of people who no longer need introductions, Boss Knot transforms the language of the necktie into precious metal.</p>
        <p className="bsk-p"><em>A woven architecture of metal forms a sculptural pendant that speaks to occasion, presence, and access.</em></p>
        <div className="bsk-divider" />
        <p className="bsk-p">It is not designed for every day.</p>
        <p className="bsk-p"><em>It is designed for the days that matter.</em></p>
        <p className="bsk-p">The boardroom. The gala. The celebration. The invitation that cannot be purchased.</p>
        <p className="bsk-p" style={{ marginTop: 28 }}>Some people wear jewelry.</p>
        <p className="bsk-p"><em>Others wear arrival.</em></p>
      </section>

      {/* GALLERY — hidden until BOSS KNOT imagery is uploaded */}
      {HAS_IMAGERY && GALLERY.length > 0 && (
        <section className="bsk-section" data-testid="bsk-archive">
          <p className="bsk-eyebrow">ARCHIVE</p>
          <h2 className="bsk-h2">Woven mesh. Sculpted presence.</h2>
          <div className="bsk-archive-grid">
            {GALLERY.map((g, i) => (
              <div key={g.src} className="bsk-archive-cell" data-testid={`bsk-archive-cell-${i + 1}`}>
                <img src={g.src} alt={g.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMPOSITION */}
      <section className="bsk-section" data-testid="bsk-composition">
        <p className="bsk-eyebrow">COMPOSITION</p>
        <h2 className="bsk-h2">Four notes. One arrival.</h2>
        <div className="bsk-comp-grid">
          <div data-testid="bsk-comp-1">
            <p className="bsk-comp-num">01</p>
            <p className="bsk-comp-h">Construction</p>
            <p className="bsk-comp-p">Woven mesh architecture forming a three-dimensional sculptural pendant. 70mm × 25mm.</p>
          </div>
          <div data-testid="bsk-comp-2">
            <p className="bsk-comp-num">02</p>
            <p className="bsk-comp-h">Inspiration</p>
            <p className="bsk-comp-p">Tailored formalwear translated into precious metal. The necktie reimagined as object.</p>
          </div>
          <div data-testid="bsk-comp-3">
            <p className="bsk-comp-num">03</p>
            <p className="bsk-comp-h">Metal</p>
            <p className="bsk-comp-p">Solid Sterling Silver, 10K Yellow Gold, or 10K White Gold. Cast, hand-finished, high polish.</p>
          </div>
          <div data-testid="bsk-comp-4">
            <p className="bsk-comp-num">04</p>
            <p className="bsk-comp-h">Chain</p>
            <p className="bsk-comp-p">Matching 18&quot; chain included with every Boss Knot. No upcharge. No add-on.</p>
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
          <p className="bsk-eyebrow">CRAFT YOUR BOSS KNOT</p>
          <h2 className="bsk-h2">Three options. One verdict.</h2>
          <p className="bsk-price-line" data-testid="bsk-price">{priceFormatted}</p>
          <p className="bsk-price-sub">Includes matching 18&quot; chain</p>
        </div>

        {/* METAL */}
        <div className="bsk-config-group">
          <label className="bsk-config-label">Metal</label>
          <div className="bsk-opt-row cols-2" role="radiogroup" aria-label="Metal">
            {METAL_CHOICES.map((opt) => (
              <button key={opt.id} type="button" role="radio" aria-checked={metalChoice === opt.id}
                className={`bsk-opt${metalChoice === opt.id ? " is-active" : ""}`}
                data-testid={`bsk-metal-${opt.id}`}
                onClick={() => setMetalChoice(opt.id)}>
                <p className="bsk-opt-label">{opt.label}</p>
                <p className="bsk-opt-price">
                  {opt.id === "silver" ? formatUsd(PRICE_MATRIX.silver) : `From ${formatUsd(PRICE_MATRIX.gold10k_yellow)}`}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* COLOUR (gold only) */}
        <div className="bsk-config-group">
          <label className="bsk-config-label">Colour</label>
          <div className="bsk-opt-row cols-2" role="radiogroup" aria-label="Colour">
            {COLOUR_CHOICES.map((opt) => (
              <button key={opt.id} type="button" role="radio" aria-checked={!colourDisabled && colourChoice === opt.id}
                className={`bsk-opt${!colourDisabled && colourChoice === opt.id ? " is-active" : ""}`}
                data-testid={`bsk-colour-${opt.id}`}
                disabled={colourDisabled}
                onClick={() => setColourChoice(opt.id)}>
                <p className="bsk-opt-label">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* KARAT (gold only) */}
        <div className="bsk-config-group">
          <label className="bsk-config-label">Karat</label>
          <div className="bsk-opt-row cols-1" role="radiogroup" aria-label="Karat">
            {KARAT_CHOICES.map((opt) => (
              <button key={opt.id} type="button" role="radio" aria-checked={!colourDisabled}
                className={`bsk-opt${!colourDisabled ? " is-active" : ""}`}
                data-testid={`bsk-karat-${opt.id}`}
                disabled={colourDisabled}>
                <p className="bsk-opt-label">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* INCLUDED */}
        <div className="bsk-config-group">
          <label className="bsk-config-label">Included</label>
          <ul className="bsk-included" data-testid="bsk-included">
            <li>Matching 18&quot; Chain</li>
            <li>Made To Order</li>
            <li>Insured Shipping</li>
            <li>Luxury Presentation Box</li>
            <li>3–4 Week Production</li>
            <li>Lifetime Atelier Service</li>
          </ul>
        </div>

        <div className="bsk-purchase">
          <p className="bsk-purchase-eyebrow">MADE TO ORDER</p>
          <p className="bsk-purchase-lead">Lead Time · 3–4 Weeks · Insured Shipping · Luxury Box Included</p>
          <button type="button" className="bsk-btn" data-testid="bsk-add-to-cart"
            onClick={onAddToCart} disabled={isAdding}>
            {buttonText}
          </button>
        </div>
      </section>

      {/* THE BILLIONAIRES CLUB */}
      <section className="bsk-club" data-testid="bsk-club">
        <div className="bsk-club-inner">
          <p className="bsk-eyebrow" style={{ marginBottom: 24 }}>THE BILLIONAIRES CLUB</p>
          <p className="solid">The difference between wealth and status is visibility.</p>
          <p>Wealth can be accumulated.</p>
          <p><em>Status must be earned.</em></p>
          <p style={{ marginTop: 32 }}>Boss Knot was created for the people who understand that distinction.</p>
          <p>Not everyone receives the invitation.</p>
          <p>Not everyone belongs in the room.</p>
          <p>Not everyone gets access.</p>
          <p style={{ marginTop: 32 }} className="solid">But when the doors open — presence matters.</p>
          <p><em>Boss Knot was designed for that moment.</em></p>
        </div>
      </section>

      {/* FINAL WORD */}
      <section className="bsk-final" data-testid="bsk-final-word">
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '0.45em',
          color: 'var(--gold)', textTransform: 'uppercase', margin: '0 0 22px' }}>FINAL WORD</p>
        <h2 className="bsk-h2" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>
          Some people chase attention.
        </h2>
        <p className="bsk-final-stanza"><em>Others command it.</em></p>
        <p className="bsk-final-stanza">
          For those who don&apos;t get out often.<br />
          But when they do —<br />
          <em>they arrive.</em>
          <strong>BOSS KNOT</strong>
        </p>
      </section>
    </div>
  );
}
