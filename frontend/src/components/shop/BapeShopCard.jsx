import { Link } from "react-router-dom";

/**
 * BapeShopCard — Homage Series cultural artifact card
 *
 * Deliberately breaks the dark PHILEON shop system.
 * Bright luxury / glossy acrylic / reflective / collectible-object energy.
 *
 * Drops straight into the `/shop` grid as a single CORE_PRODUCTS entry.
 * Renders its own visual world rather than using the standard card chrome.
 */

export default function BapeShopCard() {
  return (
    <Link
      to="/homage/bape"
      className="bape-card"
      data-testid="bape-shop-card"
      aria-label="BAPE — Homage Series — Coming Soon"
    >
      <style>{`
        .bape-card {
          position: relative;
          display: block;
          aspect-ratio: 4/5;
          width: 100%;
          background:
            radial-gradient(ellipse at 50% 30%, #FFFFFF 0%, #F4F1EC 42%, #E2DCD0 78%, #C6BEAE 100%);
          overflow: hidden;
          text-decoration: none;
          color: #1A1815;
          isolation: isolate;
          transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
        }
        .bape-card::before {
          content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background:
            radial-gradient(circle at 22% 28%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 1.4%),
            radial-gradient(circle at 78% 22%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 1.0%),
            radial-gradient(circle at 64% 78%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 0.8%),
            radial-gradient(circle at 32% 86%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 0.7%),
            radial-gradient(circle at 12% 60%, rgba(255,255,255,0.5)  0%, rgba(255,255,255,0) 0.6%);
          opacity: 0.85;
          transition: opacity 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bape-card::after {
          content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 2;
          background:
            radial-gradient(ellipse 40% 28% at 38% 58%, rgba(228, 178, 60, 0.20) 0%, rgba(228,178,60,0) 60%),
            radial-gradient(ellipse 30% 22% at 62% 52%, rgba(190, 38, 92, 0.16)  0%, rgba(190,38,92,0)  60%),
            radial-gradient(ellipse 26% 22% at 48% 64%, rgba(44, 64, 140, 0.14)  0%, rgba(44,64,140,0)  60%);
          mix-blend-mode: multiply;
          opacity: 0.7;
          transition: opacity 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .bape-card__ring-wrap {
          position: absolute; inset: 0; z-index: 3;
          display: flex; align-items: center; justify-content: center;
        }
        .bape-card__ring {
          width: 78%; height: auto;
          object-fit: contain;
          filter: drop-shadow(0 16px 18px rgba(0,0,0,0.18));
          transform: translateY(0) scale(1);
          transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
                      filter 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .bape-card__chrome {
          position: absolute; left: 22px; right: 22px; bottom: 20px; z-index: 4;
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 14px;
        }
        .bape-card__copy {
          display: flex; flex-direction: column; gap: 4px;
        }
        .bape-card__series {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 9.5px; letter-spacing: 0.42em;
          color: rgba(26,24,21,0.55); text-transform: uppercase; margin: 0;
        }
        .bape-card__title {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: clamp(20px, 1.6vw, 28px);
          letter-spacing: -0.01em; line-height: 1;
          color: #1A1815; margin: 0;
        }
        .bape-card__title sup {
          font-size: 0.4em; vertical-align: super; letter-spacing: 0.08em;
          color: rgba(26,24,21,0.5); margin-left: 4px;
        }
        .bape-card__status {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 9px; letter-spacing: 0.4em;
          color: rgba(26,24,21,0.55); text-transform: uppercase;
          padding: 8px 12px;
          border: 1px solid rgba(26,24,21,0.18);
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          white-space: nowrap;
        }

        .bape-card__recognition {
          position: absolute; left: 22px; bottom: 64px; z-index: 4;
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 9.5px; letter-spacing: 0.42em;
          color: rgba(26,24,21,0.7); text-transform: uppercase;
          opacity: 0; transform: translateY(4px);
          transition: opacity 320ms cubic-bezier(0.22,1,0.36,1),
                      transform 320ms cubic-bezier(0.22,1,0.36,1);
          pointer-events: none;
        }

        /* HOVER STATES */
        @media (hover: hover) {
          .bape-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 18px 36px rgba(0,0,0,0.16);
          }
          .bape-card:hover::before { opacity: 1; }
          .bape-card:hover::after {
            opacity: 1;
            animation: bapePulseGlow 2.6s ease-in-out infinite alternate;
          }
          .bape-card:hover .bape-card__ring {
            transform: translateY(-3px) scale(1.025);
            filter: drop-shadow(0 22px 26px rgba(0,0,0,0.24));
          }
          .bape-card:hover .bape-card__recognition {
            opacity: 1; transform: translateY(0);
          }
        }
        @keyframes bapePulseGlow {
          0%   { opacity: 0.8; }
          100% { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bape-card, .bape-card::before, .bape-card::after,
          .bape-card__ring, .bape-card__recognition {
            transition: none !important; animation: none !important;
          }
        }
      `}</style>

      <div className="bape-card__ring-wrap">
        <img
          src="/homage/bape-ring.webp"
          alt="BAPE — multi-stone signet ring with mirror reflection"
          className="bape-card__ring"
          loading="eager"
          decoding="async"
        />
      </div>

      <p className="bape-card__recognition" data-testid="bape-card-recognition">
        RECOGNITION.
      </p>

      <div className="bape-card__chrome">
        <div className="bape-card__copy">
          <p className="bape-card__series">HOMAGE SERIES</p>
          <h3 className="bape-card__title">
            BAPE<sup>™</sup>
          </h3>
        </div>
        <span className="bape-card__status">COMING SOON</span>
      </div>
    </Link>
  );
}
