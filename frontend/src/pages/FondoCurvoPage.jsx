import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { products } from '@/data/products';

const FONDO_CURVO_HERO = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/xo3lwkk2_1000147308.png";

export default function FondoCurvoPage() {
  const product = products.fondoCurvo;
  const gallery = product.gallery || [];

  const [activeThumb, setActiveThumb] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = useCallback((index) => {
    if (index === activeThumb || isTransitioning) return;
    setIsTransitioning(true);
    setActiveThumb(index);
    setTimeout(() => setIsTransitioning(false), 250);
  }, [activeThumb, isTransitioning]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back to Earrings */}
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
        <img
          src={FONDO_CURVO_HERO}
          alt="Phileon Fondo Curvo Earrings"
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/40" />

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

      {/* GALLERY */}
      <section className="w-full mt-2 md:mt-4" data-testid="fondo-curvo-gallery">
        <div className="max-w-[520px] md:max-w-[620px] mx-auto px-3 md:px-5">
          <div className="w-full overflow-hidden rounded-[10px] bg-black mb-2">
            <img
              src={gallery[activeThumb]?.src}
              alt={gallery[activeThumb]?.alt}
              className={`w-full aspect-square object-contain transition-opacity duration-250 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            />
          </div>

          <div className="flex gap-[5px] overflow-x-auto pb-1 scrollbar-hide">
            {gallery.map((item, index) => (
              <button
                key={`t-${index}`}
                onClick={() => handleSelect(index)}
                data-testid={`fondo-curvo-thumb-${index}`}
                className={`
                  w-[48px] h-[48px] md:w-[56px] md:h-[56px] flex-shrink-0 rounded-[3px] overflow-hidden
                  transition-all duration-150
                  ${activeThumb === index
                    ? "ring-1 ring-white/40 opacity-100"
                    : "opacity-30 hover:opacity-65"}
                `}
              >
                <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="py-14 md:py-20 border-t border-white/[0.03] mt-8">
        <div className="text-center max-w-[420px] mx-auto px-5">
          <p className="text-[13px] text-white/40 leading-relaxed italic mb-3">
            Black onyx. Pavé diamonds. White gold.
          </p>
          <p className="text-[9px] tracking-[0.3em] text-white/50">FONDO CURVO — PHILEON</p>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
