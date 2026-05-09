import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * LA MADONNA — Editorial Coming-Soon Holding Page
 *
 * Feels like a museum room waiting to open, not a product waiting to launch.
 * Dangerous luxury · ceremonial · haute couture relic · dark romance.
 *
 * Namespace: .lm- (fresh, no bleed from MIDWEEK / CARAPACE / GRAND DAME)
 *
 * The corset image is currently a Nano Banana placeholder. Swap when the
 * authentic studio capture is delivered:
 *   /app/frontend/public/la-madonna/corset_placeholder.png
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
          min-height: 100vh;
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
           Two stacked diagonal moiré gradients drift very slowly along
           opposite axes. Combined opacity stays under 6% — almost
           imperceptible, but adds the "fabric in low light" sense. */
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

        /* ─── Page composition ───────────────────────────────────────── */
        .lm-stage {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          padding: 12vh 24px 9vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(40px, 6vh, 72px);
        }

        /* ─── Product frame (corset) ────────────────────────────────── */
        .lm-frame {
          position: relative;
          width: auto;
          max-width: 82vw;
          max-height: 56vh;
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .lm-frame {
            max-width: clamp(280px, 36vw, 520px);
            max-height: 56vh;
          }
        }

        /* Soft restrained gold aura — breathes very slowly behind the corset */
        .lm-aura {
          position: absolute;
          inset: -22%;
          z-index: 0;
          background: radial-gradient(
            ellipse at center,
            rgba(214, 178, 116, 0.32) 0%,
            rgba(214, 178, 116, 0.16) 28%,
            rgba(214, 178, 116, 0.06) 52%,
            rgba(0, 0, 0, 0) 78%
          );
          filter: blur(28px);
          animation: lmAuraBreath 9s ease-in-out infinite alternate;
          will-change: opacity, transform;
        }
        @keyframes lmAuraBreath {
          0%   { opacity: 0.78; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.04); }
        }

        .lm-corset-wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lm-corset {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          /* subtle vignette-on-image edge */
          filter:
            drop-shadow(0 24px 48px rgba(0, 0, 0, 0.7))
            drop-shadow(0 6px 14px rgba(0, 0, 0, 0.5));
          transition: filter 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* Optional luxury-restraint hover sweep on the edge framing */
        .lm-corset-wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid rgba(214, 178, 116, 0.0);
          pointer-events: none;
          transition: border-color 800ms cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 800ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lm-corset-wrap:hover::after {
          border-color: rgba(214, 178, 116, 0.32);
          box-shadow: 0 0 32px rgba(214, 178, 116, 0.18) inset;
        }
        .lm-corset-wrap:hover .lm-corset {
          filter:
            drop-shadow(0 24px 48px rgba(0, 0, 0, 0.7))
            drop-shadow(0 6px 14px rgba(0, 0, 0, 0.5))
            drop-shadow(0 0 18px rgba(214, 178, 116, 0.22));
        }

        /* ─── Title block ──────────────────────────────────────────── */
        .lm-text {
          text-align: center;
          max-width: 760px;
          padding: 0 16px;
        }

        .lm-title {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: clamp(40px, 7vw, 96px);
          line-height: 1.04;
          margin: 0;
          background: linear-gradient(
            180deg,
            #F4DDB1 0%,
            #D6B274 38%,
            #A07E3B 78%,
            #7A5C26 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          /* Subtle inner glow so the gradient reads cleanly on pure black */
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
        }

        .lm-subline {
          margin-top: clamp(22px, 3vh, 30px);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(17px, 1.5vw, 22px);
          color: #E6CFA8;
          letter-spacing: 0.01em;
          line-height: 1.5;
        }

        .lm-status {
          margin-top: clamp(38px, 5vh, 56px);
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.46em;
          color: rgba(214, 178, 116, 0.55);
          padding-top: 22px;
          position: relative;
        }
        .lm-status::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
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
          .lm-room, .lm-silk, .lm-aura {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      {/* Subtle moving silk texture — under 6% opacity */}
      <div className="lm-silk" aria-hidden="true" />

      <Link to="/" className="lm-back" data-testid="la-madonna-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      <div className="lm-stage">
        {/* Product image — gold corset, ceremonial */}
        <div className="lm-frame" data-testid="la-madonna-frame">
          <div className="lm-aura" aria-hidden="true" />
          <div className="lm-corset-wrap">
            <img
              src="/la-madonna/corset_placeholder.png"
              alt="LA MADONNA — ceremonial gold corset (placeholder)"
              className="lm-corset"
              loading="eager"
              decoding="async"
              fetchpriority="high"
              data-testid="la-madonna-corset"
            />
          </div>
        </div>

        {/* Title + subline + status */}
        <div className="lm-text">
          <h1 className="lm-title" data-testid="la-madonna-title">
            LA MADONNA
          </h1>
          <p className="lm-subline" data-testid="la-madonna-subline">
            "She took the corset off. Then she put it back on. In gold."
          </p>
          <p className="lm-status" data-testid="la-madonna-status">
            EDITORIAL EXPERIENCE ARRIVING SOON
          </p>
        </div>
      </div>
    </div>
  );
}
