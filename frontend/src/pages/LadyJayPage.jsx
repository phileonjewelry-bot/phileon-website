import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";

/**
 * LADY JAY — Tribute Series · 2026 Season Only
 *
 * PHILEON · Ladies · Rings · Tribute Series
 * Full wrap feather ring · 18K white gold · blue sapphire + white diamond pavé.
 * Retired at season's end. No reissue.
 *
 * Namespace: .ladyjay-
 */

const PRICE_USD = 14500;

const SPECS = [
  { k: "Metal",         v: "18K White Gold" },
  { k: "Stones",        v: "Blue Sapphire Pavé + White Diamond Pavé" },
  { k: "Form",          v: "Full wrap feather ring" },
  { k: "Series",        v: "Tribute Series" },
  { k: "Availability",  v: "Available for the 2026 season only — retired at season's end, no reissue" },
];

const MARQUEE_TEXT =
  "LADY JAY · TRIBUTE SERIES · 2026 SEASON ONLY · WHITE GOLD · BLUE SAPPHIRE · WHITE DIAMOND · NO REISSUE";

export default function LadyJayPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".ladyjay-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.18 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const formattedPrice = `$${PRICE_USD.toLocaleString("en-US")} USD`;

  const onAddToCart = () => {
    handleAddToCart({
      id: "lady-jay",
      name: "LADY JAY",
      price: PRICE_USD,
      productKey: "lady-jay",
      tierKey: "tribute-2026",
      metal: "18K White Gold · Blue Sapphire + White Diamond",
      quantity: 1,
      image: "/lady-jay/lady-jay-hero.png",
    });
  };

  return (
    <section
      className={`ladyjay-room${isMounted ? " ladyjay-loaded" : ""}`}
      data-page="lady-jay"
      data-testid="lady-jay-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .ladyjay-room {
          position: relative;
          background: #060a14;
          color: #e4eaf2;
          overflow: hidden;
          opacity: 0;
          transition: opacity 900ms ease;
        }
        .ladyjay-room.ladyjay-loaded { opacity: 1; }
        .ladyjay-reveal { opacity: 0; transform: translateY(18px); transition: opacity 1100ms ease, transform 1100ms ease; }
        .ladyjay-reveal.visible { opacity: 1; transform: translateY(0); }

        .ladyjay-back {
          position: absolute; top: 28px; left: 28px; z-index: 30;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 11px;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(228, 234, 242, 0.65);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .ladyjay-back:hover { color: rgba(228, 234, 242, 0.95); }

        /* ─── MARQUEE ───────────────────────────────────────── */
        .ladyjay-marquee {
          position: relative;
          width: 100%;
          padding: 14px 0;
          background: rgba(15, 28, 56, 0.5);
          border-bottom: 1px solid rgba(99, 144, 220, 0.18);
          overflow: hidden;
        }
        .ladyjay-marquee-track {
          display: inline-flex;
          gap: 64px;
          white-space: nowrap;
          animation: ladyjayMarquee 32s linear infinite;
        }
        .ladyjay-marquee-track span {
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(180, 205, 240, 0.88);
        }
        @keyframes ladyjayMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ─── HERO ──────────────────────────────────────────── */
        .ladyjay-hero {
          position: relative;
          width: 100%;
          min-height: 92vh;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 60px;
          padding: 100px 56px 100px;
          background:
            radial-gradient(circle at 30% 40%, rgba(35, 60, 120, 0.32), transparent 55%),
            radial-gradient(circle at 80% 80%, rgba(15, 28, 56, 0.45), transparent 60%),
            #060a14;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .ladyjay-hero { grid-template-columns: 1fr; gap: 36px; padding: 70px 22px 60px; min-height: auto; }
        }
        .ladyjay-hero-img-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ladyjay-hero-img {
          max-width: 540px;
          width: 100%;
          height: auto;
          filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 40px rgba(60, 100, 180, 0.25));
        }
        .ladyjay-hero-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 20px 0;
        }
        .ladyjay-meta {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0 0 26px;
        }
        .ladyjay-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(3.4rem, 7vw, 5.6rem);
          line-height: 0.95;
          letter-spacing: 0.05em;
          color: #f0f4fb;
          margin: 0 0 22px;
        }
        .ladyjay-collection {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(180, 205, 240, 0.7);
          margin: 0 0 32px;
        }
        .ladyjay-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.2rem, 1.7vw, 1.55rem);
          line-height: 1.5;
          color: rgba(228, 234, 242, 0.92);
          margin: 0 0 36px;
          max-width: 520px;
        }
        .ladyjay-season {
          background: rgba(20, 38, 78, 0.5);
          border-left: 2px solid rgba(99, 144, 220, 0.7);
          padding: 18px 22px;
          margin: 0 0 38px;
          max-width: 480px;
        }
        .ladyjay-season p {
          margin: 0;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.98rem;
          line-height: 1.55;
          color: rgba(228, 234, 242, 0.85);
        }
        .ladyjay-season p + p { margin-top: 6px; color: rgba(180, 205, 240, 0.65); }
        .ladyjay-hero-cta {
          display: flex; flex-direction: column;
          align-items: flex-start; gap: 14px;
        }
        .ladyjay-price {
          font-family: 'Cinzel', serif;
          font-size: clamp(1.05rem, 1.4vw, 1.3rem);
          letter-spacing: 0.32em;
          color: #f0f4fb;
        }
        .ladyjay-btn {
          padding: 18px 56px;
          background: rgba(60, 100, 180, 0.92);
          color: #f0f4fb;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, letter-spacing 320ms ease;
        }
        .ladyjay-btn:hover { background: rgba(80, 130, 215, 1); letter-spacing: 0.48em; }
        .ladyjay-btn:disabled { opacity: 0.55; cursor: default; }
        .ladyjay-micro {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 0.92rem;
          color: rgba(180, 205, 240, 0.6);
          margin-top: 6px;
          max-width: 460px;
          line-height: 1.5;
        }

        /* ─── SPEC TABLE ───────────────────────────────────── */
        .ladyjay-spec {
          position: relative;
          padding: 110px 24px 110px;
          background: #07101f;
        }
        .ladyjay-spec-inner {
          max-width: 980px;
          margin: 0 auto;
        }
        .ladyjay-spec-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0 0 38px;
          text-align: center;
        }
        .ladyjay-spec-row {
          display: grid;
          grid-template-columns: 220px 1fr;
          padding: 22px 0;
          border-bottom: 1px solid rgba(99, 144, 220, 0.12);
          gap: 24px;
        }
        @media (max-width: 700px) {
          .ladyjay-spec-row { grid-template-columns: 1fr; gap: 6px; padding: 16px 0; }
        }
        .ladyjay-spec-k {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.65);
        }
        .ladyjay-spec-v {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1rem, 1.18vw, 1.2rem);
          color: rgba(228, 234, 242, 0.92);
          line-height: 1.55;
        }

        /* ─── FINAL WORD ──────────────────────────────────── */
        .ladyjay-final {
          position: relative;
          padding: 160px 24px 200px;
          background: linear-gradient(180deg, #060a14 0%, #04070d 100%);
          text-align: center;
          overflow: hidden;
        }
        .ladyjay-final::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 30%, rgba(40, 70, 140, 0.22), transparent 55%);
          pointer-events: none;
        }
        .ladyjay-final-eyebrow {
          position: relative;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0 0 32px;
        }
        .ladyjay-final-text {
          position: relative;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(1.5rem, 2.6vw, 2.4rem);
          line-height: 1.4;
          color: #f0f4fb;
          margin: 0 auto;
          max-width: 640px;
        }
        .ladyjay-final-rule {
          position: relative;
          width: 0;
          height: 1px;
          margin: 44px auto 0;
          background: linear-gradient(90deg, rgba(99,144,220,0) 0%, rgba(150,190,240,0.85) 50%, rgba(99,144,220,0) 100%);
          animation: ladyjayFinalRule 3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.45s;
        }
        @keyframes ladyjayFinalRule {
          from { width: 0; opacity: 0; }
          to   { width: 200px; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ladyjay-marquee-track { animation: none !important; }
          .ladyjay-final-rule { animation: none !important; width: 200px; opacity: 1; }
        }
      `}</style>

      <Link to="/shop?category=rings&audience=ladies" className="ladyjay-back" data-testid="lady-jay-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── MARQUEE ──────────────────────────────────────── */}
      <div className="ladyjay-marquee" data-testid="lady-jay-marquee">
        <div className="ladyjay-marquee-track">
          {[0, 1, 2, 3].map((i) => (
            <span key={i}>{MARQUEE_TEXT}</span>
          ))}
        </div>
      </div>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="ladyjay-hero" data-testid="lady-jay-hero">
        <div className="ladyjay-hero-img-wrap">
          <img
            className="ladyjay-hero-img"
            src="/lady-jay/lady-jay-hero.png"
            alt="LADY JAY — Tribute Series feather ring in 18K white gold, blue sapphire and white diamond pavé, worn on hand"
            data-testid="lady-jay-hero-img"
          />
        </div>
        <div className="ladyjay-hero-text">
          <p className="ladyjay-meta" data-testid="lady-jay-meta">
            TRIBUTE SERIES — 2026 SEASON ONLY
          </p>
          <h1 className="ladyjay-title" data-testid="lady-jay-title">LADY JAY</h1>
          <p className="ladyjay-collection">PHILEON · LADIES · TRIBUTE SERIES</p>
          <p className="ladyjay-tagline" data-testid="lady-jay-tagline">
            The Blue Jay doesn't ask permission to be the most beautiful thing in the room.
          </p>

          <div className="ladyjay-season" data-testid="lady-jay-season">
            <p>Available for the 2026 season only.</p>
            <p>Retired at season's end. No reissue.</p>
          </div>

          <div className="ladyjay-hero-cta">
            <p className="ladyjay-price" data-testid="lady-jay-price">{formattedPrice}</p>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isAdding}
              className="ladyjay-btn"
              data-testid="lady-jay-add-to-cart-btn"
            >
              {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
            </button>
            <p className="ladyjay-micro">
              Available for the 2026 season only. When the season ends, Lady Jay retires.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SPECIFICATION ───────────────────────────────── */}
      <section className="ladyjay-spec ladyjay-reveal" data-testid="lady-jay-spec">
        <div className="ladyjay-spec-inner">
          <p className="ladyjay-spec-eyebrow">SPECIFICATION</p>
          {SPECS.map((s) => (
            <div key={s.k} className="ladyjay-spec-row" data-testid={`lady-jay-spec-${s.k.toLowerCase()}`}>
              <span className="ladyjay-spec-k">{s.k}</span>
              <span className="ladyjay-spec-v">{s.v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL WORD ──────────────────────────────────── */}
      <section className="ladyjay-final ladyjay-reveal" data-testid="lady-jay-final">
        <p className="ladyjay-final-eyebrow">FINAL WORD</p>
        <p className="ladyjay-final-text" data-testid="lady-jay-final-text">
          The Blue Jay doesn't migrate.<br />
          It stays through the cold.<br />
          So does this ring.
        </p>
        <div className="ladyjay-final-rule" aria-hidden="true" />
      </section>
    </section>
  );
}
