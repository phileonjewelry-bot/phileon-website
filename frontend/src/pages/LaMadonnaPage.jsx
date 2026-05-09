import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * LA MADONNA — Editorial Coming-Soon Hero Page
 *
 * Image roles:
 *   /la-madonna/la-madonna-hero.png      — WITH hand (hero / carousel)
 *   /la-madonna/la-madonna-category.png  — WITHOUT hand (category / shop tile)
 *
 * Mood: dangerous luxury · ceremonial · haute couture relic · dark romance.
 * Namespace: .lm-  (no class bleed from other product pages)
 */
export default function LaMadonnaPage() {
  useEffect(() => {
    const fadeRoot = document.querySelector("[data-page='la-madonna']");
    if (!fadeRoot) return;
    const t = window.setTimeout(() => fadeRoot.classList.add("lm-loaded"), 60);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="lm-room"
      data-testid="la-madonna-page"
      data-page="la-madonna"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        /* ════ LA MADONNA — fresh .lm- namespace ════════════════════════ */
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

        /* ─── Procedural silk overlay (no asset, no JS) ─────────────────
           Two stacked diagonal moiré gradients drift very slowly. Combined
           opacity stays under 6% — almost imperceptible, but adds the
           "fabric in low light" sense. */
        .lm-silk {
          position: absolute;
          inset: -10%;
          pointer-events: none;
          z-index: 1;
          opacity: 0.05;
          mix-blend-mode: screen;
          background:
            repeating-linear-gradient(
              108deg,
              rgba(214, 178, 116, 0) 0%,
              rgba(214, 178, 116, 0.45) 18%,
              rgba(214, 178, 116, 0) 36%
            ),
            repeating-linear-gradient(
              -72deg,
              rgba(255, 235, 198, 0) 0%,
              rgba(255, 235, 198, 0.32) 22%,
              rgba(255, 235, 198, 0) 44%
            );
          background-size: 220% 220%, 240% 240%;
          background-position: 0% 0%, 0% 0%;
          animation: lmSilkDrift 84s linear infinite;
          will-change: background-position;
        }
        @keyframes lmSilkDrift {
          0%   { background-position: 0% 0%, 0% 0%; }
          100% { background-position: 220% 220%, -240% 240%; }
        }

        /* ─── HERO SECTION — full-bleed product image ──────────────── */
        .lm-hero {
          position: relative;
          width: 100%;
          height: 92vh;
          min-height: 560px;
          background: #050505;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .lm-hero {
            height: 78vh;
            min-height: 520px;
          }
        }

        .lm-hero-media {
          /* Centered, contained — does NOT fill the section. The hero
             section stays 92vh but the image breathes inside it,
             anchored to bottom so the corset / pedestal stay the focus. */
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          max-width: 92vw;
          max-height: 68vh;
          width: auto;
          height: 68vh;
          object-fit: contain;
          object-position: center bottom;
          background: transparent;
          /* Cinematic drift — scale 1→1.018 + translateY -6→6 over 18s */
          animation: lmHeroDrift 18s ease-in-out infinite alternate;
          will-change: transform;
          transform-origin: center bottom;
        }
        @keyframes lmHeroDrift {
          0%   { transform: translateX(-50%) translateY(-6px) scale(1); }
          100% { transform: translateX(-50%) translateY(6px) scale(1.018); }
        }
        /* Mobile: reduce motion ~40% + tighter image scale */
        @keyframes lmHeroDriftMobile {
          0%   { transform: translateX(-50%) translateY(-3.6px) scale(1); }
          100% { transform: translateX(-50%) translateY(3.6px) scale(1.011); }
        }
        @media (max-width: 768px) {
          .lm-hero-media {
            max-width: 76vw;
            max-height: 60vh;
            height: 60vh;
            animation: lmHeroDriftMobile 18s ease-in-out infinite alternate;
          }
        }

        /* Subtle vignette + restrained gold aura */
        .lm-hero-vignette {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(ellipse at center,
              rgba(214, 178, 116, 0.05) 0%,
              rgba(0, 0, 0, 0) 45%),
            radial-gradient(ellipse at center,
              rgba(0, 0, 0, 0) 55%,
              rgba(0, 0, 0, 0.45) 100%);
        }

        /* ─── Bottom-left overlay typography ──────────────────────── */
        .lm-hero-overlay {
          position: absolute;
          z-index: 2;
          left: 56px;
          bottom: 96px;
          max-width: 460px;
          color: #FFFFFF;
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .lm-hero-overlay {
            left: 18px;
            right: 18px;
            bottom: 64px;
            max-width: none;
          }
        }

        .lm-hero-title {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: -0.04em;
          font-size: clamp(5rem, 9vw, 8rem);
          line-height: 0.88;
          margin: 0;
          color: #E6CFA8;        /* warm champagne matte */
          opacity: 0.92;
        }
        @media (max-width: 768px) {
          .lm-hero-title {
            font-size: clamp(3rem, 13.5vw, 4.6rem);
            line-height: 0.92;
            letter-spacing: -0.035em;
          }
        }

        .lm-hero-subline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(15px, 1.25vw, 19px);
          color: rgba(214, 178, 116, 0.78);   /* faded gold, not bright white */
          opacity: 0.78;
          letter-spacing: 0.012em;
          line-height: 1.65;
          max-width: 420px;
          margin: 26px 0 0 0;
        }
        .lm-hero-subline span { display: block; }

        .lm-hero-status {
          margin-top: 36px;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.46em;
          color: rgba(214, 178, 116, 0.55);
          padding-top: 22px;
          position: relative;
          display: inline-block;
        }
        .lm-hero-status::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 32px;
          height: 1px;
          background: rgba(214, 178, 116, 0.4);
        }

        /* ─── Top-left back link ──────────────────────────────────── */
        .lm-back {
          position: absolute;
          top: 28px;
          left: 28px;
          z-index: 5;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Cinzel', serif;
          font-size: 10.5px;
          letter-spacing: 0.36em;
          color: rgba(214, 178, 116, 0.55);
          text-decoration: none;
          transition: color 400ms ease;
        }
        .lm-back:hover { color: rgba(244, 221, 177, 0.95); }

        @media (prefers-reduced-motion: reduce) {
          .lm-room, .lm-silk, .lm-hero-media {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <section className="lm-hero" data-testid="la-madonna-hero">
        {/* Full-bleed hero image — WITH hand for narrative tension */}
        <img
          src="/la-madonna/la-madonna-hero.png"
          alt="LA MADONNA — ceremonial gold corset on velvet pedestal"
          className="lm-hero-media"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          data-testid="la-madonna-hero-img"
        />

        {/* Subtle moving silk texture — under 6% opacity */}
        <div className="lm-silk" aria-hidden="true" />

        {/* Restrained vignette + gold aura wash */}
        <div className="lm-hero-vignette" aria-hidden="true" />

        {/* Top-left return */}
        <Link to="/" className="lm-back" data-testid="la-madonna-back-btn">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN</span>
        </Link>

        {/* Bottom-left overlay */}
        <div className="lm-hero-overlay" data-testid="la-madonna-hero-overlay">
          <h1 className="lm-hero-title" data-testid="la-madonna-title">
            LA MADONNA
          </h1>
          <p className="lm-hero-subline" data-testid="la-madonna-subline">
            <span>"She took the corset off.</span>
            <span>Then she put it back on.</span>
            <span>In gold."</span>
          </p>
          <p className="lm-hero-status" data-testid="la-madonna-status">
            EDITORIAL EXPERIENCE ARRIVING SOON
          </p>
        </div>
      </section>
    </div>
  );
}
