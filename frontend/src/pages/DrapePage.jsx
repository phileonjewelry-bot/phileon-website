import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function DrapePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back to Shop */}
      <Link
        to="/"
        className="fixed top-20 left-6 z-20 flex items-center gap-2 text-[11px] tracking-[0.3em] text-white/50 hover:text-[#D4AF37] transition-colors"
        data-testid="drape-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO SHOP</span>
      </Link>

      {/* DRAPE — Placeholder Block */}
      <section
        className="w-full bg-black text-white py-24 px-6 md:px-12"
        data-testid="drape-page"
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Eyebrow */}
          <p className="text-xs tracking-[0.35em] text-neutral-400 mb-6">
            PHILEON
          </p>

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-6xl tracking-wide mb-6">
            DRAPE
          </h1>

          {/* Statement */}
          <p className="text-neutral-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-12">
            Form in motion.
          </p>

          {/* Placeholder Visual */}
          <div className="w-full aspect-[4/5] bg-neutral-900 rounded-lg flex items-center justify-center mb-12">
            <span className="text-neutral-500 text-sm tracking-widest">
              IMAGE / VIDEO COMING SOON
            </span>
          </div>

          {/* Description */}
          <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-10">
            DRAPE is a study in movement and tension — sculpted lines wrapped in black enamel, traced in diamond. Designed to follow the body, not sit on it.
          </p>

          {/* CTA (disabled for now) */}
          <button
            disabled
            className="bg-[#C6A646] text-black px-8 py-4 text-sm tracking-wide opacity-50 cursor-not-allowed"
            data-testid="drape-cta-btn"
          >
            COMING SOON
          </button>
        </div>
      </section>
    </div>
  );
}
