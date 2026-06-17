import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO_IMG = "/rose-of-sharon/hero.png";
const HERO_ALT = "ROSE OF SHARON — three-dimensional floral cross pendant in 14K rose gold with raised central rose cluster and openwork vine structure.";

// 2 sizes × 2 metals = 4 SKUs. Hand-set USD prices · USD-mirrored.
const PRICE_MATRIX = {
  classic: { gold10k: 2800, gold14k: 3800 },
  grand:   { gold10k: 4200, gold14k: 5600 },
};
const SIZE_OPTIONS = [
  { id: "classic", label: "Classic", short: "CLA", dims: "28mm × 18mm",
    desc: "A delicate interpretation of Rose of Sharon designed for everyday wear." },
  { id: "grand",   label: "Grand",   short: "GRD", dims: "40mm × 25mm",
    desc: "An enlarged statement version allowing every rose, vine, leaf, and petal to be experienced in greater detail." },
];
const METAL_OPTIONS = [
  { id: "gold10k", label: "10K Rose Gold", short: "10K" },
  { id: "gold14k", label: "14K Rose Gold", short: "14K" },
];
const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;

const SPECS = [
  ["Collection", "The Collective"],
  ["Category", "Ladies → Pendants"],
  ["Construction", "Openwork Floral Architecture"],
  ["Motif", "Rose Cross"],
  ["Finish", "High Polish"],
  ["Metal Options", "10K Rose Gold · 14K Rose Gold"],
  ["Size Options", "Classic (28mm × 18mm) · Grand (40mm × 25mm)"],
  ["Availability", "Made To Order"],
  ["Lead Time", "3–4 Weeks"],
  ["Shipping", "Insured · Included"],
  ["Note", "Chain Sold Separately · Crafted in Rose Gold"],
];

const GALLERY = [
  { src: "/rose-of-sharon/archive-1.png", title: "The Bloom",
    desc: "The first encounter. A floral cross sculpted entirely from roses, vines, and petals.",
    alt: "ROSE OF SHARON — hero on black background: full pendant catching directional light." },
  { src: "/rose-of-sharon/archive-2.jpg", title: "Light Across Gold",
    desc: "Soft light reveals the depth of every bloom and the architecture hidden within the cross.",
    alt: "ROSE OF SHARON — editorial on fabric: rose-gold detail glowing under soft light." },
  { src: "/rose-of-sharon/archive-3.jpg", title: "Scale",
    desc: "Held in the hand, Rose of Sharon reveals the precision of its construction and the delicacy of its proportions.",
    alt: "ROSE OF SHARON — held between fingers showing scale and precision." },
  { src: "/rose-of-sharon/archive-4.jpg", title: "Suspended",
    desc: "Viewed in motion, the pendant reveals the openness of the design and the movement of the climbing vines.",
    alt: "ROSE OF SHARON — suspended from chain, full silhouette visible." },
  { src: "/rose-of-sharon/archive-5.jpg", title: "Worn",
    desc: "Designed to rest naturally at the center of the chest, becoming both adornment and statement.",
    alt: "ROSE OF SHARON — worn at the décolletage in everyday context." },
  { src: "/rose-of-sharon/archive-6.png", title: "Climbing Grace",
    desc: "Every vine, bud, and leaf is individually sculpted into the structure of the cross, creating movement while allowing light to pass through the design.",
    alt: "ROSE OF SHARON — vine cluster macro at the base of the cross." },
  { src: "/rose-of-sharon/archive-7.png", title: "At The Center",
    desc: "The central rose serves as the heart of the piece. Layered petals rise above the surrounding blooms, creating depth and giving the cross its unmistakable identity.",
    alt: "ROSE OF SHARON — central rose cluster macro, layered petals in rose gold." },
];

export default function RoseOfSharonPage() {
  const [scrollY, setScrollY] = useState(0);
  const [sizeId, setSizeId] = useState("grand");
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
            <p className="ros-collection">THE COLLECTIVE</p>
            <h1 className="ros-hero-title" data-testid="ros-hero-title">ROSE OF SHARON</h1>
            <p className="ros-subtitle" data-testid="ros-subtitle">Floral Cross Pendant</p>
            <p className="ros-tagline" data-testid="ros-tagline">A cross formed entirely from blooming roses, climbing vines, and sculpted petals.</p>
            <p className="ros-tagline" style={{ marginTop: 12, fontSize: 'clamp(15px,1.3vw,18px)', color: 'var(--ink-muted)' }}>
              Created in rose gold and designed as a symbol of faith, beauty, remembrance, and devotion. Available in two sizes.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
              <button type="button" className="ros-btn" data-testid="ros-hero-craft"
                onClick={() => document.querySelector('[data-testid="ros-configurator"]')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '14px 32px', fontSize: 11 }}>CRAFT YOURS</button>
              <button type="button" className="ros-btn" data-testid="ros-hero-details"
                onClick={() => document.querySelector('[data-testid="ros-specs"]')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '14px 32px', fontSize: 11, borderColor: 'var(--rule)', color: 'var(--ink-muted)' }}>VIEW DETAILS</button>
            </div>
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
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                padding: '14px 18px',
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.75) 70%)',
                color: 'var(--ink)',
              }}>
                <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: 10.5,
                  letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--rose)' }}>
                  Archive {i + 1} · {g.title}
                </p>
                <p style={{ margin: '6px 0 0', fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic', fontSize: 14, lineHeight: 1.4, color: 'var(--ink-strong)' }}>
                  {g.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THE MAKING OF A BLOOMING CROSS */}
      <section className="ros-section" data-testid="ros-making">
        <p className="ros-eyebrow">THE MAKING</p>
        <h2 className="ros-h2">The making of a blooming cross.</h2>
        <p className="ros-p">Most crosses begin with lines.</p>
        <p className="ros-p"><em>Rose of Sharon begins with a flower.</em></p>
        <p className="ros-p">The design grows outward from a sculpted central rose, surrounded by additional blooms, climbing vines, leaves, and buds.</p>
        <p className="ros-p">Rather than placing flowers onto a cross, the flowers <em>become</em> the cross itself.</p>
        <p className="ros-p">The result is a piece that feels both symbolic and alive.</p>
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

      {/* FINAL WORD — The Rose Endures */}
      <section className="ros-final" data-testid="ros-final-word">
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '0.45em',
          color: 'var(--rose)', textTransform: 'uppercase', margin: '0 0 22px' }}>FINAL WORD</p>
        <h2 className="ros-h2" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>The Rose Endures.</h2>
        <p className="ros-final-stanza">The Rose of Sharon has long symbolized beauty, renewal, and devotion.</p>
        <p className="ros-final-stanza"><em>Here, those ideas are translated into gold.</em></p>
        <p className="ros-final-stanza">Every bloom, every vine, and every petal contributes to a cross that speaks quietly yet carries meaning far beyond its size.</p>
        <p className="ros-final-stanza">
          <em>Designed to be worn. Created to be remembered.</em>
          <strong>BLOOM THROUGH.</strong>
        </p>
      </section>

      {/* THE GIVING — the final chapter */}
      <section className="ros-giving" data-testid="ros-giving">
        <style>{`
          .ros-giving {
            background: var(--bg-deep);
            padding: clamp(72px,10vw,144px) clamp(20px,4vw,60px);
            border-top: 1px solid var(--rule-soft);
          }
          .ros-giving-grid {
            max-width: 1180px; margin: 0 auto;
            display: grid; grid-template-columns: 1.05fr 0.95fr;
            gap: clamp(40px,6vw,96px); align-items: center;
          }
          @media (max-width: 880px) { .ros-giving-grid { grid-template-columns: 1fr; gap: 48px; } }
          .ros-giving-img {
            width: 100%; height: auto; display: block;
            filter: drop-shadow(0 30px 60px rgba(0,0,0,0.85));
          }
          .ros-giving-eyebrow {
            font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.45em;
            color: var(--rose); text-transform: uppercase; margin: 0 0 22px;
          }
          .ros-giving-h2 {
            font-family: 'Playfair Display', serif; font-weight: 400;
            font-size: clamp(30px,3.6vw,46px); line-height: 1.1;
            letter-spacing: -0.01em; color: var(--ink-strong); margin: 0 0 28px;
          }
          .ros-giving-line {
            font-family: 'Cormorant Garamond', serif; font-style: italic;
            font-size: clamp(17px,1.4vw,21px); line-height: 1.6;
            color: var(--ink); margin: 0 0 14px;
          }
          .ros-giving-coda {
            margin-top: 28px; padding-top: 24px;
            border-top: 1px solid var(--rule-soft);
            font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.32em;
            color: var(--ink-muted); line-height: 1.9; text-transform: uppercase;
          }
        `}</style>
        <div className="ros-giving-grid">
          <div>
            <img src="/rose-of-sharon/giving.png" alt="ROSE OF SHARON — the giving: a hand holding open a black velvet jewelry box revealing the rose-gold cross, warm window light." className="ros-giving-img" loading="lazy" />
          </div>
          <div>
            <p className="ros-giving-eyebrow">THE FINAL CHAPTER</p>
            <h2 className="ros-giving-h2">The final chapter is not the making. It is the giving.</h2>
            <p className="ros-giving-line">A bloom cast in gold.</p>
            <p className="ros-giving-line">A cross shaped by roses.</p>
            <p className="ros-giving-line">A keepsake intended to outlive the moment it was given.</p>
            <div className="ros-giving-coda">
              MADE TO ORDER<br />
              CRAFTED IN ROSE GOLD<br />
              CREATED TO BE TREASURED
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
