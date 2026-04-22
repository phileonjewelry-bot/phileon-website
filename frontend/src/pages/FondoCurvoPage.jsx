import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Replace with the final hero asset when ready
const FONDO_CURVO_HERO = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/qig3s1in_1000147255.png";

export default function FondoCurvoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back to Shop */}
      <Link
        to="/"
        className="fixed top-20 left-6 z-20 flex items-center gap-2 text-[11px] tracking-[0.3em] text-white/50 hover:text-[#D4AF37] transition-colors"
        data-testid="fondo-curvo-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO SHOP</span>
      </Link>

      {/* FONDO CURVO — HERO */}
      <section
        className="w-full h-[90vh] bg-black text-white flex items-center justify-center relative overflow-hidden"
        data-testid="fondo-curvo-page"
      >
        {/* Image */}
        {FONDO_CURVO_HERO ? (
          <img
            src={FONDO_CURVO_HERO}
            alt="Phileon Fondo Curvo Earrings"
            className="absolute inset-0 w-full h-full object-contain md:object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-black to-neutral-900" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <p className="text-xs tracking-[0.35em] text-neutral-400 mb-4">
            PHILEON
          </p>

          <div className="text-center mt-6">
            <h1
              className="font-serif text-4xl md:text-6xl tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              FONDO CURVO
            </h1>

            <p className="text-neutral-400 text-sm md:text-base mt-4 max-w-md mx-auto leading-relaxed">
              Says everything to those who see it. Says nothing to those who don&rsquo;t.
            </p>
          </div>

          <button
            className="mt-10 bg-[#C6A646] text-black px-8 py-4 text-sm tracking-wide hover:bg-[#D4AF37] transition-colors"
            data-testid="fondo-curvo-enter-btn"
          >
            ENTER
          </button>
        </div>
      </section>
    </div>
  );
}
