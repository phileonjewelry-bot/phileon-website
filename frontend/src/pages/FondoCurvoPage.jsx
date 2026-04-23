import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const FONDO_CURVO_HERO = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/l43g78jv_1000147430.png";

export default function FondoCurvoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back to Shop */}
      <Link
        to="/shop?category=earrings&audience=ladies"
        className="fixed top-20 left-6 z-20 flex items-center gap-2 text-[11px] tracking-[0.3em] text-white/50 hover:text-[#D4AF37] transition-colors"
        data-testid="fondo-curvo-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO EARRINGS</span>
      </Link>

      {/* FONDO CURVO — HERO */}
      <section
        className="relative w-full h-[90vh] bg-black flex items-center justify-center overflow-hidden"
        data-testid="fondo-curvo-page"
      >
        {/* Hero Image — preserve full silhouette (studs → taper) */}
        <img
          src={FONDO_CURVO_HERO}
          alt="Phileon Fondo Curvo Earrings"
          className="w-full h-full object-contain"
        />

        {/* Subtle vignette for luxury depth */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/40" />

        {/* Bottom-centered editorial caption */}
        <div className="absolute bottom-10 md:bottom-14 left-1/2 -translate-x-1/2 text-center px-6 z-10">
          <p className="text-[11px] tracking-[0.4em] text-white/50 mb-3">
            PHILEON
          </p>
          <h1
            className="text-white text-2xl md:text-3xl tracking-[0.25em] font-light"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            FONDO CURVO
          </h1>
          <p className="text-white/60 text-xs md:text-sm mt-3 max-w-[520px] mx-auto leading-relaxed">
            Says everything to those who see it. Says nothing to those who don&rsquo;t.
          </p>
        </div>
      </section>
    </div>
  );
}
