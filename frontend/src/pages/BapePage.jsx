import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * BAPE™ — TRIBUTE SERIES
 * "Not collaboration. Recognition."
 *
 * Full-screen bright luxury environment. Deliberately breaks the dark
 * PHILEON system — this is a cultural artifact presented as fine jewelry,
 * staged like an Art Basel object.
 */

export default function BapePage() {
  useEffect(() => {
    const root = document.querySelector("[data-page='bape']");
    if (!root) return;
    const t = window.setTimeout(() => root.classList.add("bp-loaded"), 60);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="bp-room" data-page="bape" data-testid="bape-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        .bp-room {
          position: relative;
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 50% 25%, #FFFFFF 0%, #F4F1EC 38%, #E6E0D6 70%, #C9C1B3 100%);
          color: #1A1815;
          overflow: hidden;
          opacity: 0;
          transition: opacity 1.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bp-room.bp-loaded { opacity: 1; }

        /* Soft particle field */
        .bp-particles {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background:
            radial-gradient(circle at 18% 32%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 1.6%),
            radial-gradient(circle at 78% 22%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 1.2%),
            radial-gradient(circle at 64% 78%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 0.9%),
            radial-gradient(circle at 32% 86%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 0.7%),
            radial-gradient(circle at 88% 64%, rgba(255,255,255,0.5)  0%, rgba(255,255,255,0) 0.6%),
            radial-gradient(circle at 12% 60%, rgba(255,255,255,0.6)  0%, rgba(255,255,255,0) 0.8%);
          animation: bpDrift 22s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes bpDrift {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(-12px, 8px, 0) scale(1.02); }
        }

        /* Stone glow accents (red, gold, blue from the BAPE setting) */
        .bp-glow {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background:
            radial-gradient(ellipse 40% 30% at 38% 58%, rgba(228, 178, 60, 0.18) 0%, rgba(228,178,60,0) 60%),
            radial-gradient(ellipse 30% 22% at 62% 52%, rgba(190, 38, 92, 0.14)  0%, rgba(190,38,92,0)  60%),
            radial-gradient(ellipse 26% 22% at 48% 64%, rgba(44, 64, 140, 0.12)  0%, rgba(44,64,140,0)  60%);
          mix-blend-mode: multiply;
        }

        .bp-back {
          position: absolute; top: 28px; left: 28px; z-index: 6;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Cinzel', serif; font-size: 10.5px; letter-spacing: 0.36em;
          color: rgba(26,24,21,0.55); text-decoration: none;
          transition: color 400ms ease;
        }
        .bp-back:hover { color: rgba(26,24,21,0.9); }

        .bp-eyebrow-fixed {
          position: absolute; top: 30px; right: 32px; z-index: 6;
          font-family: 'Cinzel', serif; font-size: 10.5px; letter-spacing: 0.42em;
          color: rgba(26,24,21,0.45); text-transform: uppercase;
        }

        /* ═════ STAGE ═════════════════════════════════════════ */
        .bp-stage {
          position: relative; z-index: 3;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 32px 80px;
          text-align: center;
        }
        @media (max-width: 768px) { .bp-stage { padding: 110px 18px 60px; } }

        .bp-collection {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 11px; letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(26,24,21,0.55);
          margin: 0 0 24px 0;
        }

        .bp-ring-wrap {
          position: relative;
          width: 100%; max-width: 720px;
          aspect-ratio: 1/1;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto;
        }
        @media (max-width: 768px) { .bp-ring-wrap { max-width: 88vw; } }

        .bp-ring {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
          display: block;
          filter: drop-shadow(0 28px 32px rgba(0,0,0,0.18));
          animation: bpBreath 14s ease-in-out infinite alternate;
          will-change: transform, filter;
        }
        @keyframes bpBreath {
          0%   { transform: translateY(-4px) scale(1); }
          100% { transform: translateY(4px) scale(1.012); }
        }

        .bp-title {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: clamp(3.4rem, 7vw, 6rem);
          letter-spacing: -0.02em; line-height: 0.92;
          color: #1A1815;
          margin: 28px 0 0 0;
        }
        .bp-title sup {
          font-size: 0.32em; vertical-align: super; letter-spacing: 0.1em;
          color: rgba(26,24,21,0.55);
          margin-left: 6px;
        }

        .bp-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-weight: 300; font-size: clamp(15px, 1.25vw, 19px);
          color: rgba(26,24,21,0.6);
          letter-spacing: 0.012em; line-height: 1.55;
          margin: 16px 0 0 0;
        }

        .bp-recognition {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 11.5px; letter-spacing: 0.42em;
          color: rgba(26,24,21,0.7); text-transform: uppercase;
          margin: 38px 0 0 0; position: relative; display: inline-block;
          padding-top: 22px;
        }
        .bp-recognition::before {
          content: ""; position: absolute; top: 0; left: 50%;
          transform: translateX(-50%);
          width: 36px; height: 1px;
          background: rgba(26,24,21,0.4);
        }

        .bp-status {
          margin-top: 56px;
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 11px; letter-spacing: 0.5em;
          color: rgba(26,24,21,0.55); text-transform: uppercase;
          padding: 14px 28px;
          border: 1px solid rgba(26,24,21,0.18);
          display: inline-block;
        }

        /* ═════ BOTTOM TAGLINE ═══════════════════════════════ */
        .bp-tagline {
          position: relative; z-index: 3;
          padding: 60px 32px 80px;
          text-align: center;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(26,24,21,0.04) 100%);
        }
        .bp-tagline-text {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: clamp(1.4rem, 2.4vw, 2rem);
          letter-spacing: -0.01em;
          color: #1A1815; margin: 0;
        }
        .bp-tagline-text em {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-weight: 300; color: rgba(26,24,21,0.65);
        }

        @media (prefers-reduced-motion: reduce) {
          .bp-room, .bp-particles, .bp-ring {
            animation: none !important; transition: none !important;
            opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      <div className="bp-particles" aria-hidden="true" />
      <div className="bp-glow" aria-hidden="true" />

      <Link to="/" className="bp-back" data-testid="bape-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      <span className="bp-eyebrow-fixed">PHILEON · TRIBUTE SERIES</span>

      <section className="bp-stage" data-testid="bape-stage">
        <p className="bp-collection" data-testid="bape-collection">TRIBUTE SERIES</p>

        <div className="bp-ring-wrap">
          <img
            src="/homage/bape-ring.webp"
            alt="BAPE — multi-stone signet ring under spotlights with reflection"
            className="bp-ring"
            loading="eager"
            decoding="async"
            data-testid="bape-hero-img"
          />
        </div>

        <h1 className="bp-title" data-testid="bape-title">
          BAPE<sup>™</sup>
        </h1>
        <p className="bp-sub">For the ones who were really there.</p>

        <p className="bp-recognition" data-testid="bape-recognition">Recognition.</p>

        <span className="bp-status" data-testid="bape-status">COMING SOON</span>
      </section>

      <section className="bp-tagline" data-testid="bape-tagline">
        <p className="bp-tagline-text">
          Not collaboration. <em>Recognition.</em>
        </p>
      </section>
    </div>
  );
}
