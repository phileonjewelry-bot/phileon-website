import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

/**
 * VEYRON NOIR — PHILEON Tribute Series
 * Gentleman's collector signet. 14K white gold · black diamond pavé · ruby horizon.
 * Page order: Hero → Editorial (Composition / Structure / Tribute / Craft)
 * → Archive → Specifications → Configurator/Purchase → Final Word.
 */

const HERO_IMG = "/veyron-noir/hero.png";
const HERO_ALT =
  "VEYRON NOIR — gentleman's tribute signet ring in 14K white gold with black diamond pavé shoulders, a sculptural horseshoe grille bed of black diamonds at centre, and a single ruby pavé horizon beneath the band.";

const GALLERY = [
  { src: HERO_IMG, label: "The grille", caption: "Macro of the centre grille and black diamond field." },
  { src: HERO_IMG, label: "The ruby horizon", caption: "Close-up of the red pavé line beneath the band." },
  { src: HERO_IMG, label: "Carbon field", caption: "Side / shoulder detail showing black diamond pavé." },
  { src: HERO_IMG, label: "Midnight machine", caption: "Full ring beauty shot." },
  { src: HERO_IMG, label: "On the hand", caption: "Lifestyle frame. Black tie, late hour." },
];

const SPECS = [
  ["Collection", "Tribute Series"],
  ["Piece", "Veyron Noir"],
  ["Category", "Gentlemen Statement Ring"],
  ["Metal", "14K White Gold"],
  ["Stones", "Black Diamond Pavé"],
  ["Accent", "Ruby Pavé Horizon"],
  ["Design", "Bugatti-Inspired Grille Architecture"],
  ["Finish", "High Polish White Gold"],
  ["Availability", "Made To Order"],
  ["Lead Time", "4–6 Weeks"],
];

const RING_SIZES = ["8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13"];

export default function VeyronNoirPage() {
  const [scrollY, setScrollY] = useState(0);
  const [ringSize, setRingSize] = useState("9.5");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroParallax = Math.min(scrollY * 0.18, 120);

  const onAddToCart = () => {
    const variant = `14K White Gold · Size ${ringSize}`;
    handleAddToCart(
      {
        id: `veyron-noir-gold14k-${ringSize}`,
        name: `VEYRON NOIR — 14K White Gold · Size ${ringSize}`,
        price: 0,
        productKey: "veyronNoir",
        tierKey: "gold14k",
        metal: "14K White Gold",
        ringSize,
        sku: `VN-14K-S${ringSize.replace(".", "")}`,
        quantity: 1,
        image: HERO_IMG,
      },
      1,
      variant,
    );
  };

  return (
    <div className="vn-root" data-testid="vn-root">
      <style>{`
        .vn-root {
          --ink: #ECE3D0;
          --ink-strong: #FFFFFF;
          --ink-muted: rgba(236, 227, 208, 0.55);
          --bg: #050306;
          --bg-deep: #020103;
          --carbon: #0D0B10;
          --gold: #C9A961;
          --ruby: #C0142E;
          --ruby-deep: #7A0817;
          --rule: rgba(192, 20, 46, 0.22);
          --rule-soft: rgba(255,255,255,0.08);
          background: var(--bg);
          color: var(--ink);
          font-family: 'Cormorant Garamond', serif;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .vn-return {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 28px 32px 0;
          color: var(--gold);
          font-family: 'Cinzel', serif;
          letter-spacing: 0.32em;
          font-size: 11px;
          text-decoration: none;
          opacity: 0.86;
        }
        .vn-return:hover { opacity: 1; }

        .vn-hero {
          position: relative;
          padding: 56px 0 104px;
          background: radial-gradient(ellipse 70% 60% at 50% 35%, rgba(192,20,46,0.05), transparent 70%), var(--bg-deep);
          overflow: hidden;
        }
        .vn-hero::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: 96px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--ruby), transparent);
          opacity: 0.55;
        }
        .vn-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(40px, 6vw, 96px);
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 60px);
          align-items: center;
        }
        @media (max-width: 880px) { .vn-hero-grid { grid-template-columns: 1fr; gap: 48px; } }
        .vn-hero-img-wrap {
          position: relative;
          aspect-ratio: 1 / 1;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 60%);
          will-change: transform;
        }
        .vn-hero-img {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.9)) drop-shadow(0 0 24px rgba(192,20,46,0.18));
        }
        .vn-collection {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          color: var(--gold);
          margin: 0 0 12px;
        }
        .vn-eyebrow-2 {
          font-family: 'Cinzel', serif;
          font-size: 10.5px;
          letter-spacing: 0.5em;
          color: var(--ruby);
          margin: 0 0 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--rule);
          display: inline-block;
        }
        .vn-hero-title {
          font-family: 'Playfair Display', serif;
          font-weight: 500;
          font-size: clamp(48px, 6vw, 80px);
          line-height: 0.96;
          letter-spacing: -0.005em;
          color: var(--ink-strong);
          margin: 0 0 20px;
        }
        .vn-tagline {
          font-style: italic;
          font-size: clamp(18px, 1.4vw, 22px);
          color: var(--ink);
          margin: 0 0 32px;
          max-width: 480px;
        }
        .vn-spec-chip {
          display: inline-block;
          font-family: 'Cinzel', serif;
          font-size: 10.5px;
          letter-spacing: 0.3em;
          color: var(--ink-muted);
          padding: 7px 14px;
          border: 1px solid var(--rule-soft);
          margin: 0 8px 8px 0;
        }
        .vn-cta-row { margin-top: 32px; display: flex; gap: 16px; flex-wrap: wrap; }
        .vn-btn {
          padding: 18px 44px;
          font-family: 'Cinzel', serif;
          font-size: 12px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: var(--ink-strong);
          background: transparent;
          border: 1px solid var(--ruby);
          cursor: pointer;
          transition: background 240ms ease, color 240ms ease, letter-spacing 240ms ease, box-shadow 320ms ease;
        }
        .vn-btn:hover { background: var(--ruby); letter-spacing: 0.48em; box-shadow: 0 12px 32px -10px rgba(192,20,46,0.55); }
        .vn-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .vn-section {
          padding: clamp(80px, 12vw, 140px) clamp(20px, 5vw, 80px);
          max-width: 880px;
          margin: 0 auto;
        }
        .vn-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 0.5em;
          color: var(--ruby);
          margin: 0 0 24px;
          text-align: center;
        }
        .vn-h2 {
          font-family: 'Playfair Display', serif;
          font-weight: 500;
          font-size: clamp(34px, 4vw, 50px);
          color: var(--ink-strong);
          margin: 0 0 40px;
          text-align: center;
          line-height: 1.08;
        }
        .vn-p { font-size: clamp(17px, 1.25vw, 19px); line-height: 1.85; color: var(--ink); margin: 0 0 18px; text-align: center; }
        .vn-p.dim { color: var(--ink-muted); }
        .vn-rule { width: 64px; height: 1px; background: var(--ruby); opacity: 0.6; margin: 48px auto; }

        .vn-archive {
          padding: clamp(80px, 12vw, 140px) clamp(20px, 4vw, 60px);
          background: linear-gradient(180deg, var(--carbon) 0%, var(--bg) 100%);
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }
        .vn-archive-head { text-align: center; max-width: 760px; margin: 0 auto 56px; }
        .vn-archive-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: clamp(20px, 3vw, 40px);
          max-width: 1240px; margin: 0 auto;
        }
        .vn-archive-grid > :nth-child(5) { grid-column: 1 / -1; }
        @media (max-width: 720px) {
          .vn-archive-grid { grid-template-columns: 1fr; }
          .vn-archive-grid > :nth-child(5) { grid-column: auto; }
        }
        .vn-archive-cell {
          position: relative;
          aspect-ratio: 1 / 1;
          background: #07050A;
          border: 1px solid var(--rule-soft);
          overflow: hidden;
        }
        .vn-archive-cell img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: contain;
        }
        .vn-archive-cap {
          position: absolute; left: 18px; right: 18px; bottom: 14px;
          font-family: 'Cinzel', serif;
          font-size: 10px; letter-spacing: 0.36em;
          color: var(--ink-strong);
          text-transform: uppercase;
          text-shadow: 0 1px 6px rgba(0,0,0,0.85);
          z-index: 2;
        }

        .vn-specs { padding: clamp(80px, 12vw, 140px) clamp(20px, 4vw, 60px); max-width: 920px; margin: 0 auto; }
        .vn-spec-row {
          display: grid; grid-template-columns: 220px 1fr; gap: 36px;
          padding: 16px 0;
          border-bottom: 1px solid var(--rule-soft);
        }
        @media (max-width: 640px) { .vn-spec-row { grid-template-columns: 1fr; gap: 4px; } }
        .vn-spec-k {
          font-family: 'Cinzel', serif;
          font-size: 10.5px;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          color: var(--ruby);
        }
        .vn-spec-v { font-size: 17px; color: var(--ink); }

        .vn-config { padding: clamp(60px, 9vw, 110px) clamp(20px, 4vw, 60px); max-width: 720px; margin: 0 auto; }
        .vn-config-head { text-align: center; margin-bottom: 48px; }
        .vn-price-line {
          margin-top: 24px;
          font-family: 'Cinzel', serif;
          font-size: clamp(18px, 2.0vw, 24px);
          letter-spacing: 0.32em;
          color: var(--ruby);
          text-transform: uppercase;
        }
        .vn-config-label {
          font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.42em; color: var(--ruby);
          text-transform: uppercase;
          display: block;
          margin: 0 0 16px;
        }
        .vn-size-select {
          width: 100%;
          padding: 16px 20px;
          background: transparent;
          color: var(--ink-strong);
          border: 1px solid var(--rule);
          font-family: 'Cinzel', serif;
          font-size: 14px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          background-image:
            linear-gradient(45deg, transparent 50%, var(--ruby) 50%),
            linear-gradient(135deg, var(--ruby) 50%, transparent 50%);
          background-position: calc(100% - 22px) 50%, calc(100% - 14px) 50%;
          background-size: 8px 8px, 8px 8px;
          background-repeat: no-repeat;
        }
        .vn-size-select option { background: var(--bg); color: var(--ink-strong); }
        .vn-purchase {
          margin-top: 48px; padding-top: 32px;
          border-top: 1px solid var(--rule);
          text-align: center;
        }
        .vn-purchase-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 12px; letter-spacing: 0.42em; color: var(--ruby);
          margin: 0 0 6px;
        }
        .vn-purchase-lead {
          font-family: 'Cinzel', serif;
          font-size: 10.5px; letter-spacing: 0.32em;
          color: var(--ink-muted); text-transform: uppercase;
          margin: 0 0 20px;
        }
        .vn-final {
          padding: clamp(100px, 14vw, 160px) clamp(20px, 4vw, 60px);
          text-align: center;
          max-width: 760px; margin: 0 auto;
        }
        .vn-final p {
          font-family: 'Playfair Display', serif;
          font-style: italic; font-weight: 400;
          font-size: clamp(20px, 2vw, 28px);
          line-height: 1.55;
          color: var(--ink-strong);
          margin: 0 0 12px;
        }
        .vn-final p.ruby { color: var(--ruby); }
        .vn-grain {
          position: fixed; inset: 0;
          pointer-events: none; z-index: 100;
          opacity: 0.05;
          background-image:
            radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px),
            radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px);
          background-size: 3px 3px, 5px 5px;
          background-position: 0 0, 1px 1px;
          mix-blend-mode: overlay;
        }
      `}</style>

      <Link to="/shop" className="vn-return" data-testid="vn-return">
        <ArrowLeft size={14} /> RETURN
      </Link>

      {/* 1. HERO */}
      <section className="vn-hero" data-testid="vn-hero">
        <div className="vn-hero-grid">
          <div className="vn-hero-img-wrap" style={{ transform: `translateY(${heroParallax * 0.25}px)` }}>
            <img src={HERO_IMG} alt={HERO_ALT} className="vn-hero-img" data-testid="vn-hero-img" />
          </div>
          <div>
            <p className="vn-collection">PHILEON</p>
            <p className="vn-eyebrow-2">TRIBUTE SERIES</p>
            <h1 className="vn-hero-title" data-testid="vn-hero-title">VEYRON NOIR</h1>
            <p className="vn-tagline">Not every tribute is a memory. Some are machines.</p>
            <div>
              <span className="vn-spec-chip">14K WHITE GOLD</span>
              <span className="vn-spec-chip">BLACK DIAMOND PAVÉ</span>
              <span className="vn-spec-chip">RUBY ACCENT HORIZON</span>
            </div>
            <div className="vn-cta-row">
              <button type="button" className="vn-btn" data-testid="vn-hero-cta" onClick={onAddToCart} disabled={isAdding}>
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OPENING EDITORIAL */}
      <section className="vn-section" data-testid="vn-opening">
        <p className="vn-p">
          Forged in 14K white gold and consumed by black diamonds, Veyron
          Noir is a study in performance, precision, and presence.
        </p>
        <p className="vn-p dim">
          A field of black stones stretches across the surface while a deep
          ruby horizon cuts beneath the grille — a restrained reminder that
          speed leaves a trail long after it disappears.
        </p>
        <p className="vn-p">At the centre stands the unmistakable silhouette that inspired it.</p>
        <p className="vn-p" style={{ marginTop: 24 }}><em>Not copied.</em></p>
        <p className="vn-p" style={{ color: "var(--ruby)" }}><em>Honoured.</em></p>
      </section>

      {/* 3. COMPOSITION */}
      <section className="vn-section" data-testid="vn-composition" style={{ paddingTop: 0 }}>
        <p className="vn-eyebrow">COMPOSITION</p>
        <h2 className="vn-h2">Carbon under low light.</h2>
        <p className="vn-p">14K white gold forms the frame.</p>
        <p className="vn-p dim">Black diamonds move across the face and shoulders like carbon under low light.</p>
        <p className="vn-p">A sculptural grille rises at the centre, built from polished white gold rails over a bed of black stones.</p>
        <p className="vn-p dim">Along the lower edge, ruby pavé forms a single red horizon.</p>
        <div className="vn-rule" />
        <p className="vn-p"><em>Not decoration.</em></p>
        <p className="vn-p" style={{ color: "var(--ruby)" }}><em>Signature.</em></p>
      </section>

      {/* 4. STRUCTURE */}
      <section className="vn-section" data-testid="vn-structure" style={{ paddingTop: 0 }}>
        <p className="vn-eyebrow">STRUCTURE</p>
        <h2 className="vn-h2">A horseshoe arch.</h2>
        <p className="vn-p">
          The face is built around a horseshoe arch — a tribute to one of
          the most recognisable automotive silhouettes ever made.
        </p>
        <p className="vn-p dim">The shoulders widen with authority, carrying black diamond pavé from edge to edge.</p>
        <p className="vn-p">Four vertical grille bars divide the centre field with mechanical precision.</p>
        <p className="vn-p dim">The ruby line beneath the ring is intentionally low and restrained.</p>
        <div className="vn-rule" />
        <p className="vn-p"><em>A detail most people will miss.</em></p>
        <p className="vn-p" style={{ color: "var(--ruby)" }}><em>A detail the wearer will never forget.</em></p>
      </section>

      {/* 5. THE TRIBUTE */}
      <section className="vn-section" data-testid="vn-tribute" style={{ paddingTop: 0 }}>
        <p className="vn-eyebrow">THE TRIBUTE</p>
        <h2 className="vn-h2">Engineering, rewritten.</h2>
        <p className="vn-p">Some machines become legends because they are beautiful.</p>
        <p className="vn-p dim">Others because they change what people believe is possible.</p>
        <p className="vn-p">Veyron Noir belongs to the second idea.</p>
        <p className="vn-p" style={{ marginTop: 24 }}><em>It is not a replica.</em></p>
        <p className="vn-p" style={{ color: "var(--ruby)" }}><em>It is a translation.</em></p>
        <p className="vn-p dim" style={{ marginTop: 24 }}>
          Engineering language rewritten in 14K white gold, black diamond,
          and ruby.
        </p>
      </section>

      {/* 6. CRAFT */}
      <section className="vn-section" data-testid="vn-craft" style={{ paddingTop: 0 }}>
        <p className="vn-eyebrow">CRAFT</p>
        <h2 className="vn-h2">Power arrives without sound.</h2>
        <p className="vn-p">The contrast is deliberate.</p>
        <p className="vn-p dim">White gold catches the light.</p>
        <p className="vn-p dim">Black diamonds absorb it, then return it in flashes.</p>
        <p className="vn-p">
          The grille is raised from the pavé bed, creating depth, shadow,
          and machine-like structure.
        </p>
        <p className="vn-p dim">The ruby horizon adds a single controlled interruption.</p>
        <div className="vn-rule" />
        <p className="vn-p"><em>Power does not need to shout.</em></p>
        <p className="vn-p" style={{ color: "var(--ruby)" }}><em>It only needs to arrive.</em></p>
      </section>

      {/* 7. ARCHIVE */}
      <section className="vn-archive" data-testid="vn-archive">
        <div className="vn-archive-head">
          <p className="vn-eyebrow">THE ARCHIVE</p>
          <h2 className="vn-h2">Five frames from the garage.</h2>
        </div>
        <div className="vn-archive-grid">
          {GALLERY.map((g, i) => (
            <figure key={i} className="vn-archive-cell" data-testid={`vn-archive-cell-${i + 1}`}>
              <img src={g.src} alt={`${g.label} — ${g.caption}`} loading="lazy" />
              <figcaption className="vn-archive-cap">{g.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 8. SPECS */}
      <section className="vn-specs" data-testid="vn-specs">
        <p className="vn-eyebrow">COMPOSITION · SPECIFICATIONS</p>
        <h2 className="vn-h2">The piece, in detail.</h2>
        <div style={{ marginTop: 40 }}>
          {SPECS.map(([k, v]) => (
            <div key={k} className="vn-spec-row">
              <div className="vn-spec-k">{k}</div>
              <div className="vn-spec-v">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. CONFIGURATOR */}
      <section className="vn-config" data-testid="vn-configurator">
        <div className="vn-config-head">
          <p className="vn-eyebrow">CONFIGURE YOUR PIECE</p>
          <h2 className="vn-h2">14K white gold. One configuration.</h2>
          <p className="vn-price-line" data-testid="vn-price">PRICE COMING SOON</p>
        </div>
        <div>
          <label htmlFor="vn-ring-size" className="vn-config-label">Ring Size</label>
          <select
            id="vn-ring-size"
            className="vn-size-select"
            data-testid="vn-ring-size"
            value={ringSize}
            onChange={(e) => setRingSize(e.target.value)}
          >
            {RING_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="vn-purchase">
          <p className="vn-purchase-eyebrow">MADE TO ORDER</p>
          <p className="vn-purchase-lead">Lead Time · 4–6 Weeks</p>
          <button
            type="button"
            className="vn-btn"
            data-testid="vn-add-to-cart"
            onClick={onAddToCart}
            disabled={isAdding}
          >
            {buttonText}
          </button>
        </div>
      </section>

      {/* 10. FINAL WORD */}
      <section className="vn-final" data-testid="vn-final-word">
        <p>Some collect automobiles.</p>
        <p>Some collect moments.</p>
        <p>Some collect symbols.</p>
        <p className="ruby" style={{ marginTop: 24 }}>
          VEYRON NOIR was created for those who understand the difference.
        </p>
      </section>

      <div className="vn-grain" aria-hidden="true" />
    </div>
  );
}
