import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * LA SCARPA DELLA REGINA — placeholder/holding page.
 *
 * Hero: split editorial — portrait on the right, regal Italian dual-language
 * editorial copy on the left. Rose-silk atmosphere, mirrors LA MADONNA's
 * holding-page pattern.
 */

export default function LaScarpaPage() {
  return (
    <section
      className="relative overflow-hidden bg-[#f6f1eb]"
      data-page="la-scarpa"
      data-testid="la-scarpa-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap');

        .scarpa-portrait-frame {
          animation: scarpaFrameBreath 18s ease-in-out infinite alternate;
          will-change: transform, filter;
        }
        @keyframes scarpaFrameBreath {
          0%   { transform: scale(1)      translateY(0px);   filter: drop-shadow(0 36px 64px rgba(0,0,0,0.16)); }
          100% { transform: scale(1.012)  translateY(-4px);  filter: drop-shadow(0 44px 78px rgba(0,0,0,0.22)); }
        }

        .scarpa-back {
          position: absolute; top: 28px; left: 28px; z-index: 20;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 11px;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(95, 46, 46, 0.6);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .scarpa-back:hover { color: rgba(95, 46, 46, 0.95); }

        @media (prefers-reduced-motion: reduce) {
          .scarpa-portrait-frame { animation: none !important; }
        }
      `}</style>

      <Link to="/shop?category=pendants&audience=ladies" className="scarpa-back" data-testid="la-scarpa-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* Rose silk atmosphere */}
      <div className="absolute inset-0 opacity-90 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 left-[-10%] h-[520px] w-[140%] rotate-[-8deg] bg-gradient-to-r from-[#f4d6d8] via-[#e8b6bb] to-[#f6e4e2] blur-3xl opacity-70" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[420px] w-[120%] rotate-[6deg] bg-gradient-to-r from-[#b76e79] via-[#d49aa4] to-[#f1d4d8] blur-3xl opacity-40" />
      </div>

      {/* Silk folds */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none" aria-hidden="true">
        <div className="absolute left-[-10%] top-[15%] h-[2px] w-[140%] rotate-[-8deg] bg-white blur-sm" />
        <div className="absolute left-[-10%] top-[28%] h-[2px] w-[140%] rotate-[-6deg] bg-white blur-sm" />
        <div className="absolute left-[-10%] top-[42%] h-[2px] w-[140%] rotate-[-7deg] bg-white blur-sm" />
        <div className="absolute left-[-10%] top-[58%] h-[2px] w-[140%] rotate-[-5deg] bg-white blur-sm" />
      </div>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:py-32">
        {/* LEFT — editorial copy */}
        <div className="order-2 flex flex-col items-start text-left lg:order-1">
          <span
            className="mb-6 tracking-[0.45em] text-[#9b6b62] text-xs uppercase"
            data-testid="la-scarpa-eyebrow"
          >
            Phileon · Regal Collection
          </span>

          <h1
            className="text-[#5f2e2e] uppercase leading-[0.88] tracking-[0.06em]"
            style={{
              fontSize: "clamp(3rem, 7.5vw, 7rem)",
              fontFamily: "'Cormorant Garamond', serif",
            }}
            data-testid="la-scarpa-title"
          >
            LA SCARPA
            <br />
            DELLA REGINA
          </h1>

          <p
            className="mt-5 tracking-[0.35em] uppercase text-[#9b6b62]"
            style={{
              fontSize: "clamp(0.75rem, 1vw, 0.9rem)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            THE QUEEN'S SHOE
          </p>

          <div className="my-8 h-px w-40 bg-gradient-to-r from-transparent via-[#b9877d] to-[#b9877d]" />

          <div className="space-y-4">
            <p
              className="text-[#5f2e2e] italic"
              style={{
                fontSize: "clamp(1.05rem, 1.6vw, 1.5rem)",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              Una regina non cammina piano.
              <br />
              Lascia un'impressione.
            </p>

            <p
              className="max-w-2xl text-[#6a4b45] leading-relaxed"
              style={{
                fontSize: "clamp(0.95rem, 1.3vw, 1.15rem)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              A queen does not walk softly.
              <br />
              She leaves an impression.
            </p>
          </div>

          <div className="mt-14 space-y-3">
            <p
              className="tracking-[0.2em] uppercase text-[#7d544d]"
              style={{
                fontSize: "0.78rem",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              La corona fu data.
              <br />
              La scarpa fu guadagnata.
            </p>
            <p className="tracking-[0.35em] text-[#8d655d] text-[10px] uppercase">
              The crown was given.
              <br />
              The shoe was earned.
            </p>
          </div>
        </div>

        {/* RIGHT — portrait hero */}
        <div className="order-1 relative w-full lg:order-2">
          <div className="absolute inset-0 rounded-[36px] bg-[#f0c8c1] blur-[120px] opacity-50" aria-hidden="true" />
          <img
            src="/la-scarpa/scarpa-portrait.jpg"
            alt="LA SCARPA DELLA REGINA — model wearing the rose-gold stiletto pendant in baroque diamond frame"
            className="scarpa-portrait-frame relative z-10 mx-auto block w-full max-w-[640px] rounded-[6px] object-cover"
            loading="eager"
            decoding="async"
            data-testid="la-scarpa-portrait"
          />
        </div>
      </div>

      {/* ─── ARTIFACT — pendant render ─────────────────────── */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-32 text-center">
        <p
          className="mb-6 tracking-[0.42em] text-[#9b6b62] text-[11px] uppercase"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          The Artifact
        </p>
        <div className="relative w-full max-w-[520px] mx-auto">
          <div className="absolute inset-0 rounded-full bg-[#f0c8c1] blur-[100px] opacity-40" aria-hidden="true" />
          <img
            src="/la-scarpa/scarpa-pendant.png"
            alt="LA SCARPA DELLA REGINA — rose-gold stiletto pendant detail"
            className="relative z-10 mx-auto w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.18)]"
            loading="lazy"
            decoding="async"
            data-testid="la-scarpa-pendant"
          />
        </div>
      </div>

      {/* Bottom shimmer */}
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#c58c84] to-transparent opacity-60 pointer-events-none" aria-hidden="true" />
    </section>
  );
}
