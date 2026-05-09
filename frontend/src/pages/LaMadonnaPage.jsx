import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";

/**
 * LA MADONNA — Full Editorial Product Page
 *
 * "She took the corset off. Then she put it back on. In gold."
 *
 * 6-slot couture archive gallery. Generous spacing. Slow fade transitions.
 * Reluctantly purchasable — no urgency UI, no countdowns, no commerce noise.
 *
 * Pricing: PHILEON site-wide USD lock. Internal CAD = 38,000 → USD = 28,500.
 * Namespace: .lm-  (no class bleed)
 */

const GALLERY = [
  { src: "/la-madonna/la-madonna-01-hero-front.png",   label: "01 — HERO FRONT",         alt: "LA MADONNA — straight-on hero front" },
  { src: "/la-madonna/la-madonna-02-three-quarter.png", label: "02 — THREE QUARTER",      alt: "LA MADONNA — three-quarter pedestal" },
  { src: "/la-madonna/la-madonna-03-cup-detail.png",   label: "03 — CUP DETAIL",         alt: "LA MADONNA — upper cup macro" },
  { src: "/la-madonna/la-madonna-04-top-view.png",     label: "04 — TOP VIEW",           alt: "LA MADONNA — overhead architectural" },
  { src: "/la-madonna/la-madonna-05-pedestal-crop.png", label: "05 — PEDESTAL CROP",      alt: "LA MADONNA — pedestal editorial pacing" },
  { src: "/la-madonna/la-madonna-06-angled-detail.png", label: "06 — ANGLED DETAIL",      alt: "LA MADONNA — angled gold-piping detail" },
];

const PRICE_USD = 28500;

const SPECS = [
  { label: "METAL",        value: "10K Yellow Gold" },
  { label: "CONSTRUCTION", value: "Semi-hollow couture mesh cuff with polished structural ribs, corset-inspired architecture, reinforced perimeter edging, and sculpted interior framework." },
  { label: "DIMENSIONS",   value: "Height 6 cm · Cuff Width 6 cm · Wrist Circumference 17 cm · Base Diameter 8 cm" },
  { label: "WEIGHT",       value: "Approx. 110g" },
  { label: "PRODUCTION",   value: "Each piece is made-to-order and individually finished by hand. Due to the sculptural construction and mesh architecture, slight variations in finish and contour may occur naturally during fabrication." },
  { label: "LEAD TIME",    value: "8–12 weeks" },
];

const INCLUDED = [
  "International insured shipping",
  "Couture presentation packaging",
  "Certificate of authenticity",
  "Private client handling",
];

export default function LaMadonnaPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const [activeIdx, setActiveIdx] = useState(0);
  const galleryRef = useRef(null);

  useEffect(() => {
    const fadeRoot = document.querySelector("[data-page='la-madonna']");
    if (!fadeRoot) return;
    const t = window.setTimeout(() => fadeRoot.classList.add("lm-loaded"), 60);
    return () => window.clearTimeout(t);
  }, []);

  // Reveal observer for editorial sections
  useEffect(() => {
    const els = document.querySelectorAll(".lm-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.18 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "la-madonna",
      name: "LA MADONNA",
      price: PRICE_USD,
      productKey: "la-madonna",
      tierKey: "10k-yellow",
      metal: "10K Yellow Gold",
      quantity: 1,
      image: GALLERY[0].src,
    });
  };

  const formattedPrice = `$${PRICE_USD.toLocaleString("en-US")} USD`;
  const activeImg = GALLERY[activeIdx];

  return (
    <div
      className="lm-room"
      data-testid="la-madonna-page"
      data-page="la-madonna"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        .lm-room {
          position: relative;
          background: #050505;
          color: #FFFFFF;
          overflow: hidden;
          opacity: 0;
          transition: opacity 1.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lm-room.lm-loaded { opacity: 1; }
        .lm-cinzel { font-family: 'Cinzel', serif; }
        .lm-cormorant { font-family: 'Cormorant Garamond', serif; }

        .lm-silk {
          position: absolute; inset: -10%; pointer-events: none; z-index: 0;
          opacity: 0.05; mix-blend-mode: screen;
          background:
            repeating-linear-gradient(108deg, rgba(214,178,116,0) 0%, rgba(214,178,116,0.45) 18%, rgba(214,178,116,0) 36%),
            repeating-linear-gradient(-72deg, rgba(255,235,198,0) 0%, rgba(255,235,198,0.32) 22%, rgba(255,235,198,0) 44%);
          background-size: 220% 220%, 240% 240%;
          animation: lmSilkDrift 84s linear infinite;
          will-change: background-position;
        }
        @keyframes lmSilkDrift {
          0%   { background-position: 0% 0%, 0% 0%; }
          100% { background-position: 220% 220%, -240% 240%; }
        }

        /* ═════ HERO ═════════════════════════════════════════════════ */
        .lm-hero { position: relative; width: 100%; height: 92vh; min-height: 560px; background: #050505; overflow: hidden; z-index: 1; }
        @media (max-width: 768px) { .lm-hero { height: 78vh; min-height: 520px; } }

        .lm-hero-media {
          position: absolute; left: 50%; bottom: 0; transform: translateX(-50%);
          max-width: 92vw; max-height: 68vh; width: auto; height: 68vh;
          object-fit: contain; object-position: center bottom; background: transparent;
          animation: lmHeroDrift 18s ease-in-out infinite alternate;
          will-change: transform; transform-origin: center bottom;
        }
        @keyframes lmHeroDrift {
          0%   { transform: translateX(-50%) translateY(-6px) scale(1); }
          100% { transform: translateX(-50%) translateY(6px) scale(1.018); }
        }
        @keyframes lmHeroDriftMobile {
          0%   { transform: translateX(-50%) translateY(-3.6px) scale(1); }
          100% { transform: translateX(-50%) translateY(3.6px) scale(1.011); }
        }
        @media (max-width: 768px) {
          .lm-hero-media { max-width: 76vw; max-height: 60vh; height: 60vh; animation: lmHeroDriftMobile 18s ease-in-out infinite alternate; }
        }

        .lm-hero-vignette {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background:
            radial-gradient(ellipse at center, rgba(214,178,116,0.05) 0%, rgba(0,0,0,0) 45%),
            radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%);
        }

        .lm-hero-overlay {
          position: absolute; z-index: 2;
          left: 56px; bottom: 96px; max-width: 460px; color: #FFFFFF; pointer-events: none;
        }
        @media (max-width: 768px) {
          .lm-hero-overlay { left: 18px; right: 18px; bottom: 64px; max-width: none; }
        }

        .lm-hero-title {
          font-family: 'Cinzel', serif; font-weight: 500; text-transform: uppercase;
          letter-spacing: -0.04em; font-size: clamp(5rem, 9vw, 8rem); line-height: 0.88;
          margin: 0; color: #E6CFA8; opacity: 0.92;
        }
        @media (max-width: 768px) {
          .lm-hero-title { font-size: clamp(3rem, 13.5vw, 4.6rem); line-height: 0.92; letter-spacing: -0.035em; }
        }

        .lm-hero-subline {
          font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
          font-size: clamp(15px, 1.25vw, 19px); color: rgba(214,178,116,0.78); opacity: 0.78;
          letter-spacing: 0.012em; line-height: 1.65; max-width: 420px; margin: 26px 0 0 0;
        }
        .lm-hero-subline span { display: block; }

        .lm-back {
          position: absolute; top: 28px; left: 28px; z-index: 5;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Cinzel', serif; font-size: 10.5px; letter-spacing: 0.36em;
          color: rgba(214,178,116,0.55); text-decoration: none; transition: color 400ms ease;
        }
        .lm-back:hover { color: rgba(244,221,177,0.95); }

        /* ═════ EDITORIAL SECTIONS ═══════════════════════════════════ */
        .lm-reveal { opacity: 0; transform: translateY(18px); transition: opacity 1.4s cubic-bezier(0.22,1,0.36,1), transform 1.4s cubic-bezier(0.22,1,0.36,1); }
        .lm-reveal.visible { opacity: 1; transform: translateY(0); }

        .lm-section-eyebrow {
          font-family: 'Cinzel', serif; font-weight: 500; font-size: 11px;
          letter-spacing: 0.42em; text-transform: uppercase; color: rgba(214,178,116,0.55);
          padding-top: 22px; position: relative; display: inline-block;
        }
        .lm-section-eyebrow::before {
          content: ""; position: absolute; top: 0; left: 0; width: 32px; height: 1px;
          background: rgba(214,178,116,0.4);
        }

        /* ═════ POSITIONING / EDITORIAL BLOCK ════════════════════════ */
        .lm-position { padding: clamp(80px, 12vh, 140px) clamp(20px, 6vw, 96px); position: relative; z-index: 2; }
        .lm-position-inner {
          max-width: 760px; margin: 0 auto; text-align: center;
        }
        .lm-position-quote {
          font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
          font-size: clamp(22px, 2vw, 30px); color: rgba(230,207,168,0.92);
          line-height: 1.55; margin: 28px 0 0 0;
        }
        .lm-position-body {
          font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(16px, 1.2vw, 19px);
          color: rgba(230,207,168,0.7); line-height: 1.85; margin: 36px 0 0 0;
        }

        /* ═════ GALLERY — couture archive ════════════════════════════ */
        .lm-gallery {
          padding: clamp(60px, 8vh, 120px) 0;
          background: #050505;
          position: relative; z-index: 2;
        }
        .lm-gallery-stage {
          width: 100%;
          padding: 0 clamp(24px, 6vw, 96px);
          display: flex; align-items: center; justify-content: center;
        }
        .lm-gallery-active {
          width: 100%; max-width: 1100px; aspect-ratio: 4/5;
          background: #050505;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .lm-gallery-active img {
          max-width: 100%; max-height: 100%;
          object-fit: contain; object-position: center center;
          /* Slow fade across change */
          transition: opacity 300ms ease;
        }
        .lm-gallery-active img.is-out { opacity: 0; }

        .lm-gallery-thumbs {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 32px;
          padding: clamp(36px, 6vh, 72px) clamp(24px, 6vw, 96px) 0;
          max-width: 1300px; margin: 0 auto;
        }
        @media (max-width: 768px) {
          .lm-gallery-thumbs { grid-template-columns: repeat(3, 1fr); gap: 18px; padding: 36px 18px 0; }
        }
        .lm-thumb {
          background: #050505; border: none; padding: 0; cursor: pointer;
          aspect-ratio: 1/1; overflow: hidden; position: relative;
          transition: opacity 300ms ease, transform 450ms cubic-bezier(0.22,1,0.36,1);
          opacity: 0.45;
        }
        .lm-thumb:hover { opacity: 0.85; transform: scale(1.01); }
        .lm-thumb.is-active { opacity: 1; }
        .lm-thumb img { width: 100%; height: 100%; object-fit: contain; object-position: center center; background: #050505; }
        .lm-thumb-label {
          position: absolute; bottom: 6px; left: 8px;
          font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 0.28em;
          color: rgba(214,178,116,0.55); pointer-events: none;
        }

        /* ═════ SPECIFICATION BLOCK ═════════════════════════════════ */
        .lm-spec {
          padding: clamp(80px, 12vh, 140px) clamp(20px, 6vw, 96px);
          position: relative; z-index: 2;
        }
        .lm-spec-inner {
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(40px, 6vw, 96px);
          max-width: 1180px; margin: 0 auto;
        }
        @media (max-width: 768px) { .lm-spec-inner { grid-template-columns: 1fr; gap: 56px; } }

        .lm-spec-table { display: grid; row-gap: 28px; }
        .lm-spec-row {
          display: grid; grid-template-columns: 160px 1fr; gap: 28px;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(214,178,116,0.12);
        }
        @media (max-width: 768px) { .lm-spec-row { grid-template-columns: 1fr; gap: 8px; } }

        .lm-spec-label {
          font-family: 'Cinzel', serif; font-size: 10.5px; letter-spacing: 0.36em;
          text-transform: uppercase; color: rgba(214,178,116,0.6); font-weight: 500;
        }
        .lm-spec-value {
          font-family: 'Cormorant Garamond', serif; font-size: clamp(15px, 1.15vw, 18px);
          color: rgba(230,207,168,0.88); line-height: 1.65; font-weight: 300;
        }

        /* ═════ ACQUIRE BLOCK ═══════════════════════════════════════ */
        .lm-acquire {
          padding: clamp(80px, 12vh, 140px) clamp(20px, 6vw, 96px);
          background: #050505; position: relative; z-index: 2;
          text-align: center; border-top: 1px solid rgba(214,178,116,0.12);
        }
        .lm-acquire-inner { max-width: 540px; margin: 0 auto; }
        .lm-acquire-title {
          font-family: 'Cinzel', serif; font-weight: 500; font-size: clamp(2.4rem, 4.2vw, 3.6rem);
          letter-spacing: -0.02em; line-height: 0.92; color: #E6CFA8;
          margin: 32px 0 0 0; opacity: 0.92;
        }
        .lm-acquire-price {
          font-family: 'Cinzel', serif; font-weight: 500; font-size: clamp(1.4rem, 1.8vw, 1.8rem);
          letter-spacing: 0.18em; color: rgba(244,221,177,0.95);
          margin: 28px 0 6px 0;
        }
        .lm-acquire-leadtime {
          font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
          color: rgba(214,178,116,0.6); font-size: 14px; margin: 0 0 36px 0;
        }
        .lm-acquire-button {
          display: inline-block;
          font-family: 'Cinzel', serif; font-weight: 500; font-size: 11px;
          letter-spacing: 0.42em; text-transform: uppercase;
          color: rgba(244,221,177,0.95);
          background: transparent;
          border: 1px solid rgba(214,178,116,0.6);
          padding: 18px 56px; cursor: pointer;
          transition: background 600ms ease, color 600ms ease, border-color 600ms ease;
        }
        .lm-acquire-button:hover {
          background: rgba(214,178,116,0.92);
          color: #050505;
          border-color: rgba(214,178,116,0.92);
        }
        .lm-acquire-button:disabled { opacity: 0.4; cursor: not-allowed; }

        .lm-acquire-included {
          margin: 56px 0 0 0; padding-top: 36px;
          border-top: 1px solid rgba(214,178,116,0.12);
        }
        .lm-acquire-included ul {
          list-style: none; padding: 0; margin: 24px 0 0 0;
          display: flex; flex-direction: column; gap: 10px;
          font-family: 'Cormorant Garamond', serif; font-size: 14px;
          color: rgba(230,207,168,0.7); font-style: italic;
        }

        @media (prefers-reduced-motion: reduce) {
          .lm-room, .lm-silk, .lm-hero-media, .lm-reveal, .lm-thumb {
            animation: none !important; transition: none !important;
            opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      <div className="lm-silk" aria-hidden="true" />

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="lm-hero" data-testid="la-madonna-hero">
        <img
          src="/la-madonna/la-madonna-hero.png"
          alt="LA MADONNA — ceremonial gold corset on velvet pedestal"
          className="lm-hero-media"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          data-testid="la-madonna-hero-img"
        />
        <div className="lm-hero-vignette" aria-hidden="true" />

        <Link to="/" className="lm-back" data-testid="la-madonna-back-btn">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN</span>
        </Link>

        <div className="lm-hero-overlay" data-testid="la-madonna-hero-overlay">
          <h1 className="lm-hero-title" data-testid="la-madonna-title">LA MADONNA</h1>
          <p className="lm-hero-subline" data-testid="la-madonna-subline">
            <span>"She took the corset off.</span>
            <span>Then she put it back on.</span>
            <span>In gold."</span>
          </p>
        </div>
      </section>

      {/* ─── EDITORIAL POSITIONING ────────────────────────────── */}
      <section className="lm-position lm-reveal" data-testid="la-madonna-position">
        <div className="lm-position-inner">
          <p className="lm-section-eyebrow">EDITORIAL POSITIONING</p>
          <p className="lm-position-quote">
            LA MADONNA was not designed as conventional jewelry.<br/>
            It was built as wearable architecture —<br/>
            a corset recast in gold.
          </p>
        </div>
      </section>

      {/* ─── GALLERY ──────────────────────────────────────────── */}
      <section className="lm-gallery" data-testid="la-madonna-gallery" ref={galleryRef}>
        <div className="lm-gallery-stage lm-reveal">
          <div className="lm-gallery-active" data-testid="la-madonna-gallery-active">
            <img
              key={activeImg.src}
              src={activeImg.src}
              alt={activeImg.alt}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        <div className="lm-gallery-thumbs lm-reveal" data-testid="la-madonna-gallery-thumbs">
          {GALLERY.map((g, i) => (
            <button
              key={g.src}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`lm-thumb${i === activeIdx ? " is-active" : ""}`}
              aria-label={g.label}
              data-testid={`la-madonna-thumb-${i + 1}`}
            >
              <img src={g.src} alt={g.alt} loading="lazy" decoding="async" />
              <span className="lm-thumb-label">{g.label.split("—")[0].trim()}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── SPECIFICATION BLOCK ──────────────────────────────── */}
      <section className="lm-spec lm-reveal" data-testid="la-madonna-spec">
        <div className="lm-spec-inner">
          <div>
            <p className="lm-section-eyebrow">SPECIFICATION</p>
            <div className="lm-spec-table" style={{ marginTop: 32 }}>
              {SPECS.map((s) => (
                <div key={s.label} className="lm-spec-row" data-testid={`la-madonna-spec-${s.label.toLowerCase()}`}>
                  <p className="lm-spec-label">{s.label}</p>
                  <p className="lm-spec-value">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="lm-section-eyebrow">INCLUDED WITH ACQUISITION</p>
            <ul style={{
              marginTop: 32, padding: 0, listStyle: "none",
              display: "flex", flexDirection: "column", gap: 18,
            }}>
              {INCLUDED.map((line) => (
                <li
                  key={line}
                  className="lm-cormorant"
                  style={{
                    fontSize: "clamp(15px, 1.15vw, 18px)",
                    color: "rgba(230,207,168,0.82)",
                    fontStyle: "italic", fontWeight: 300,
                    paddingBottom: 14, borderBottom: "1px solid rgba(214,178,116,0.10)",
                  }}
                >
                  {line}
                </li>
              ))}
            </ul>
            <p className="lm-cormorant" style={{
              marginTop: 36, fontSize: 14, fontStyle: "italic",
              color: "rgba(214,178,116,0.55)", lineHeight: 1.7,
            }}>
              Acquisitions are processed privately. A member of our atelier
              will follow up to confirm specifications and finalise delivery.
            </p>
          </div>
        </div>
      </section>

      {/* ─── ACQUIRE ──────────────────────────────────────────── */}
      <section className="lm-acquire lm-reveal" data-testid="la-madonna-acquire">
        <div className="lm-acquire-inner">
          <p className="lm-section-eyebrow">ACQUIRE</p>
          <h2 className="lm-acquire-title" data-testid="la-madonna-acquire-title">LA MADONNA</h2>
          <p className="lm-acquire-price" data-testid="la-madonna-price">{formattedPrice}</p>
          <p className="lm-acquire-leadtime">Made-to-order · 8–12 weeks</p>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="lm-acquire-button"
            data-testid="la-madonna-add-to-cart-btn"
          >
            {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ACQUIRE"}
          </button>
        </div>
      </section>
    </div>
  );
}
