import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";

/**
 * DREW FACE™ — Drew's Vault inventory release #1
 *
 * NOT for the main storefront. Lives inside /vault/drew-face.
 *
 * Tone: hidden anime archive · masked character emblem · collector pendant ·
 * family-created artifact. Dark cinematic with sharper anime-inspired energy.
 * No luxury soft-talk. No childish framing.
 */

const PRICE_USD = 850; // collector-tier pendant pricing — adjust when finalized

const VAULT_DETAILS = [
  { label: "VAULT RELEASE",  value: "DREW FACE™" },
  { label: "CREATED BY",     value: "Andrew" },
  { label: "CATEGORY",       value: "Pendant" },
  { label: "STYLE",          value: "Anime-inspired character artifact" },
  { label: "FINISH",         value: "Polished gold with dark detail contrast" },
  { label: "AVAILABILITY",   value: "Drew's Vault exclusive" },
];

export default function DrewFacePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "drew-face",
      name: "DREW FACE™ — Drew's Vault",
      price: PRICE_USD,
      productKey: "drew-face",
      tierKey: "vault",
      quantity: 1,
      image: "/vault/drew-face/drew-face-hero.png",
    });
  };

  return (
    <div className={`df-room${isMounted ? " df-loaded" : ""}`} data-page="drew-face" data-testid="drew-face-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        .df-room {
          position: relative; min-height: 100vh;
          background: #050505;
          color: rgba(240,232,210,0.92);
          overflow-x: hidden;
          opacity: 0;
          transition: opacity 1.2s cubic-bezier(0.22,1,0.36,1);
          font-family: 'Space Grotesk', 'Inter', sans-serif;
        }
        .df-room.df-loaded { opacity: 1; }

        /* Grain noise overlay */
        .df-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
          opacity: 0.08; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='4'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>");
        }

        /* Crimson scanline accent */
        .df-scanline {
          position: fixed; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(214,52,52,0.6) 25%, rgba(228,178,60,0.6) 70%, transparent 100%);
          z-index: 4;
        }

        .df-back {
          position: absolute; top: 28px; left: 28px; z-index: 6;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Bebas Neue', sans-serif; font-size: 13px;
          letter-spacing: 0.36em; color: rgba(228,178,60,0.7);
          text-decoration: none; transition: color 300ms ease;
        }
        .df-back:hover { color: rgba(245,228,172,1); }

        .df-vault-tag {
          position: absolute; top: 32px; right: 32px; z-index: 6;
          font-family: 'Bebas Neue', sans-serif; font-size: 11px;
          letter-spacing: 0.4em; color: rgba(228,178,60,0.55);
        }
        .df-vault-tag::before {
          content: "● "; color: rgba(214,52,52,0.85);
          animation: dfPulse 1.6s ease-in-out infinite;
        }
        @keyframes dfPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

        /* ═════ HERO ═════════════════════════════════════════ */
        .df-hero {
          position: relative; min-height: 100vh;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: clamp(96px, 12vh, 140px) clamp(28px, 7vw, 96px) 80px;
          z-index: 2;
        }
        @media (max-width: 900px) {
          .df-hero { grid-template-columns: 1fr; gap: 40px; padding: 110px 22px 60px; }
        }

        .df-hero-vis {
          position: relative;
          width: 100%; aspect-ratio: 4/5;
          background:
            radial-gradient(ellipse at 50% 38%, rgba(228,178,60,0.18) 0%, rgba(228,178,60,0) 55%),
            radial-gradient(ellipse at 50% 75%, rgba(214,52,52,0.10) 0%, rgba(214,52,52,0) 60%),
            #0A0A0A;
          border: 1px solid rgba(228,178,60,0.18);
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .df-hero-vis::before {
          content: ""; position: absolute; inset: 0;
          background:
            linear-gradient(135deg, transparent 0%, transparent 49%, rgba(228,178,60,0.06) 50%, transparent 51%) 0 0/14px 14px;
          pointer-events: none;
        }
        .df-hero-vis::after {
          content: "DREW · 01";
          position: absolute; left: 18px; bottom: 14px;
          font-family: 'Bebas Neue', sans-serif; font-size: 10px;
          letter-spacing: 0.4em; color: rgba(228,178,60,0.5);
        }
        .df-hero-img {
          width: 100%; height: 100%; object-fit: contain;
          filter: drop-shadow(0 24px 32px rgba(0,0,0,0.65))
                  drop-shadow(0 0 24px rgba(228,178,60,0.18));
        }
        .df-hero-placeholder {
          width: 56%; height: 56%;
          border: 1px dashed rgba(228,178,60,0.35);
          display: flex; align-items: center; justify-content: center;
          color: rgba(228,178,60,0.55);
          font-family: 'Bebas Neue', sans-serif; font-size: 11px;
          letter-spacing: 0.42em; text-align: center;
        }

        .df-hero-copy {
          padding-left: clamp(0px, 4vw, 64px);
          display: flex; flex-direction: column; gap: 24px;
        }
        @media (max-width: 900px) { .df-hero-copy { padding-left: 0; } }

        .df-eyebrow {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 12px; letter-spacing: 0.5em;
          color: rgba(214,52,52,0.85);
          display: inline-flex; align-items: center; gap: 12px;
        }
        .df-eyebrow::after {
          content: ""; height: 1px; width: 48px;
          background: rgba(214,52,52,0.5);
        }

        .df-title {
          font-family: 'Bebas Neue', sans-serif; font-weight: 400;
          font-size: clamp(4rem, 9vw, 8rem);
          letter-spacing: 0.01em; line-height: 0.88;
          color: rgba(245,228,172,0.98);
          margin: 0;
        }
        .df-title sup {
          font-size: 0.22em; vertical-align: super; letter-spacing: 0.15em;
          color: rgba(228,178,60,0.6); margin-left: 6px;
        }

        .df-subtitle {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(14px, 1.05vw, 16px); font-weight: 400;
          color: rgba(240,232,210,0.55);
          letter-spacing: 0.04em; margin: 0;
        }

        .df-primary-line {
          font-family: 'Space Grotesk', sans-serif; font-weight: 300;
          font-size: clamp(18px, 1.6vw, 24px); line-height: 1.45;
          color: rgba(240,232,210,0.88);
          max-width: 480px; margin: 8px 0 0 0;
          padding: 18px 0 0 0;
          border-top: 1px solid rgba(228,178,60,0.18);
        }
        .df-primary-line em {
          font-style: normal; color: rgba(228,178,60,0.95);
        }

        /* ═════ SHARED SECTION ═══════════════════════════════ */
        .df-section {
          position: relative; z-index: 2;
          padding: clamp(80px, 11vh, 140px) clamp(28px, 7vw, 96px);
          max-width: 1280px; margin: 0 auto;
        }
        .df-section-eyebrow {
          font-family: 'Bebas Neue', sans-serif; font-size: 11px;
          letter-spacing: 0.46em; color: rgba(228,178,60,0.55);
          margin: 0 0 28px 0;
          display: inline-flex; align-items: center; gap: 14px;
        }
        .df-section-eyebrow::before {
          content: ""; width: 28px; height: 1px;
          background: rgba(228,178,60,0.45);
        }
        .df-section-heading {
          font-family: 'Bebas Neue', sans-serif; font-weight: 400;
          font-size: clamp(2.4rem, 4.4vw, 4rem);
          letter-spacing: 0.04em; line-height: 0.96;
          color: rgba(245,228,172,0.95);
          margin: 0 0 26px 0;
        }
        .df-section-body {
          font-family: 'Space Grotesk', sans-serif; font-weight: 300;
          font-size: clamp(16px, 1.2vw, 19px); line-height: 1.7;
          color: rgba(240,232,210,0.74);
          max-width: 720px; margin: 0;
        }

        .df-section--alt {
          background:
            linear-gradient(180deg, transparent 0%, rgba(228,178,60,0.025) 50%, transparent 100%);
          border-top: 1px solid rgba(228,178,60,0.07);
          border-bottom: 1px solid rgba(228,178,60,0.07);
          max-width: none;
        }
        .df-section--alt > * { max-width: 1280px; margin-left: auto; margin-right: auto; }

        /* ═════ VAULT DETAILS ════════════════════════════════ */
        .df-details-list {
          margin: 0; padding: 0; list-style: none;
          display: grid; gap: 0;
          border-top: 1px solid rgba(228,178,60,0.12);
        }
        .df-details-row {
          display: grid; grid-template-columns: 220px 1fr;
          gap: 24px; padding: 18px 0;
          border-bottom: 1px solid rgba(228,178,60,0.12);
        }
        @media (max-width: 640px) {
          .df-details-row { grid-template-columns: 1fr; gap: 4px; padding: 16px 0; }
        }
        .df-details-label {
          font-family: 'Bebas Neue', sans-serif; font-size: 11.5px;
          letter-spacing: 0.42em; color: rgba(228,178,60,0.6);
        }
        .df-details-value {
          font-family: 'Space Grotesk', sans-serif; font-weight: 400;
          font-size: clamp(15px, 1.1vw, 17px);
          color: rgba(240,232,210,0.88);
        }

        /* ═════ CTA ═══════════════════════════════════════════ */
        .df-cta-section {
          position: relative; z-index: 2;
          padding: clamp(80px, 11vh, 140px) clamp(28px, 7vw, 96px) 120px;
          text-align: center;
        }
        .df-cta-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(28px, 2.6vw, 38px);
          letter-spacing: 0.16em;
          color: rgba(245,228,172,0.98);
          margin: 0 0 8px 0;
          font-variant-numeric: tabular-nums;
        }
        .df-cta-meta {
          font-family: 'Space Grotesk', sans-serif; font-weight: 300;
          font-size: 13px; color: rgba(240,232,210,0.5);
          letter-spacing: 0.06em; margin: 0 0 32px 0;
        }
        .df-cta-btn {
          position: relative;
          font-family: 'Bebas Neue', sans-serif; font-size: 14px;
          letter-spacing: 0.5em; text-transform: uppercase;
          color: #0A0A0A;
          background: linear-gradient(135deg, #F1DA9E 0%, #D6A742 100%);
          border: 1px solid rgba(228,178,60,0.7);
          padding: 22px 56px;
          cursor: pointer;
          clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
          transition: transform 280ms cubic-bezier(0.22,1,0.36,1),
                      filter 280ms ease;
        }
        .df-cta-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05) drop-shadow(0 6px 14px rgba(228,178,60,0.35));
        }
        .df-cta-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .df-cta-note {
          margin: 24px 0 0 0;
          font-family: 'Space Grotesk', sans-serif; font-weight: 300;
          font-size: 12px; color: rgba(240,232,210,0.42);
          letter-spacing: 0.16em; text-transform: uppercase;
        }

        @media (prefers-reduced-motion: reduce) {
          .df-room { transition: none !important; opacity: 1 !important; }
          .df-vault-tag::before { animation: none !important; }
        }
      `}</style>

      <div className="df-grain" aria-hidden="true" />
      <div className="df-scanline" aria-hidden="true" />

      <Link to="/vault/drews-world" className="df-back" data-testid="drew-face-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO VAULT</span>
      </Link>
      <span className="df-vault-tag">DREW'S VAULT · LIVE</span>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="df-hero" data-testid="drew-face-hero">
        <div className="df-hero-vis">
          {/* Drop the real DREW FACE pendant render at /vault/drew-face/drew-face-hero.png */}
          <img
            src="/vault/drew-face/drew-face-hero.png"
            alt="DREW FACE — gold pendant by Andrew"
            className="df-hero-img"
            loading="eager"
            decoding="async"
            data-testid="drew-face-hero-img"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="df-hero-placeholder">AWAITING<br />HERO ASSET</div>
        </div>

        <div className="df-hero-copy">
          <span className="df-eyebrow">DREW'S VAULT · 01</span>
          <h1 className="df-title" data-testid="drew-face-title">
            DREW FACE<sup>™</sup>
          </h1>
          <p className="df-subtitle">Created by Andrew. Released from Drew's Vault.</p>
          <p className="df-primary-line">
            A face from the Vault. Drawn with instinct. <em>Cast into gold.</em>
          </p>
        </div>
      </section>

      {/* ─── ORIGIN ────────────────────────────────────────── */}
      <section className="df-section" data-testid="drew-face-origin">
        <p className="df-section-eyebrow">ORIGIN</p>
        <h2 className="df-section-heading">A FACE BEFORE IT WAS JEWELRY.</h2>
        <p className="df-section-body">
          DREW FACE™ began as Andrew's creation — a face with attitude, pressure,
          and expression before it ever became jewelry. The pendant keeps that
          original energy intact, translating a young imagination into a
          sculptural Vault release.
        </p>
      </section>

      {/* ─── CHARACTER ENERGY ──────────────────────────────── */}
      <section className="df-section df-section--alt" data-testid="drew-face-character">
        <div>
          <p className="df-section-eyebrow">CHARACTER ENERGY</p>
          <h2 className="df-section-heading">PART EMBLEM. PART WARNING.</h2>
          <p className="df-section-body">
            The expression carries the piece. Heavy eyes, compressed features,
            and a mask-like frame give DREW FACE™ the feeling of an anime
            emblem — part character, part symbol, part warning sign.
          </p>
        </div>
      </section>

      {/* ─── VAULT DETAILS ─────────────────────────────────── */}
      <section className="df-section" data-testid="drew-face-details">
        <p className="df-section-eyebrow">VAULT DETAILS</p>
        <h2 className="df-section-heading">FILE 01.</h2>
        <ul className="df-details-list">
          {VAULT_DETAILS.map((d) => (
            <li key={d.label} className="df-details-row" data-testid={`drew-face-detail-${d.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <span className="df-details-label">{d.label}</span>
              <span className="df-details-value">{d.value}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── ADD TO CART ───────────────────────────────────── */}
      <section className="df-cta-section" data-testid="drew-face-cta">
        <p className="df-cta-price" data-testid="drew-face-price">
          ${PRICE_USD.toLocaleString("en-US")} USD
        </p>
        <p className="df-cta-meta">Drew's Vault exclusive · Made to order</p>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isAdding}
          className="df-cta-btn"
          data-testid="drew-face-add-to-cart-btn"
        >
          {isAdding ? "ENTERING…" : buttonText === "Added!" ? "SECURED" : "ENTER THE VAULT"}
        </button>
        <p className="df-cta-note">FAMILY-CREATED · LIMITED RELEASE</p>
      </section>
    </div>
  );
}
