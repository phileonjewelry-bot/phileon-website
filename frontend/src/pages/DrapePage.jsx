import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { products } from '@/data/products';

export default function DrapePage() {
  const product = products.drape;
  const gallery = product.gallery || [];

  const [activeThumb, setActiveThumb] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = useCallback(
    (index) => {
      if (index === activeThumb || isTransitioning) return;
      setIsTransitioning(true);
      setActiveThumb(index);
      setTimeout(() => setIsTransitioning(false), 250);
    },
    [activeThumb, isTransitioning]
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back to Pendants */}
      <Link
        to="/shop?category=pendants&audience=ladies"
        className="fixed top-20 left-6 z-20 flex items-center gap-2 text-[11px] tracking-[0.3em] text-white/50 hover:text-[#D4AF37] transition-colors"
        data-testid="drape-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO PENDANTS</span>
      </Link>

      {/* DRAPE — Editorial Block */}
      <section
        className="w-full bg-black text-white py-16 md:py-20 px-6 md:px-12"
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
            {product.tagline}
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <section className="w-full" data-testid="drape-gallery">
        <div className="max-w-[520px] md:max-w-[640px] mx-auto px-3 md:px-5">
          <div className="w-full overflow-hidden rounded-[10px] bg-black mb-2">
            <img
              src={gallery[activeThumb]?.src}
              alt={gallery[activeThumb]?.alt}
              className={`w-full aspect-square object-contain transition-opacity duration-250 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>

          <div className="flex gap-[5px] overflow-x-auto pb-1 scrollbar-hide">
            {gallery.map((item, index) => (
              <button
                key={`t-${index}`}
                onClick={() => handleSelect(index)}
                data-testid={`drape-thumb-${index}`}
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

      {/* DRAPE — PRODUCT COPY */}
      <section className="py-16 md:py-24 px-6 md:px-12" data-testid="drape-copy">
        <div className="max-w-[720px] mx-auto space-y-10 text-white">

          {/* Title */}
          <div>
            <h1 className="text-2xl tracking-wide font-serif">DRAPE</h1>
          </div>

          {/* Intro */}
          <div className="space-y-4 text-sm leading-relaxed text-white/85">
            <p>Rose gold drawn into line.</p>
            <p>Eighty-five diamonds set along the hanger &mdash; the only addition it takes.</p>
            <p>Everything below is left open.</p>

            <p className="pt-2">Each curve holds its place.</p>
            <p>Each line meets where it should.</p>

            <p className="pt-2">Not inspired by clothing.</p>
            <p>Worn the same way.</p>
          </div>

          {/* Composition */}
          <div>
            <h2 className="text-xs tracking-[0.25em] mb-3 text-white/60">COMPOSITION</h2>
            <p className="text-sm leading-relaxed text-white/85">
              18k rose gold.<br />
              85 round brilliant diamonds.<br />
              Open framework.
            </p>
          </div>

          {/* Build */}
          <div>
            <h2 className="text-xs tracking-[0.25em] mb-3 text-white/60">BUILD</h2>
            <p className="text-sm leading-relaxed text-white/85">
              A corset reduced to line.<br />
              The bust, the waist, the fall &mdash; held in gold tubing.<br />
              Set from a pav&eacute; hanger that carries the piece.
            </p>
          </div>

          {/* Craft */}
          <div>
            <h2 className="text-xs tracking-[0.25em] mb-3 text-white/60">CRAFT</h2>
            <p className="text-sm leading-relaxed text-white/85">
              Nothing filled.<br />
              Nothing added.<br />
              <br />
              What&rsquo;s left open does the work.<br />
              The outline carries it.
            </p>
          </div>

          {/* Final Word */}
          <div>
            <h2 className="text-xs tracking-[0.25em] mb-3 text-white/60">FINAL WORD</h2>
            <p className="text-sm leading-relaxed text-white/85">
              Worn by those who don&rsquo;t need everything closed.
            </p>
          </div>

          {/* Grab Phrase */}
          <div className="pt-6">
            <p className="text-sm italic text-center text-white/70">
              &ldquo;The dress left. The bones remain.&rdquo;
            </p>
          </div>

        </div>
      </section>

      {/* DRAPE — SPEC IMAGE */}
      <section className="mt-20 mb-10 flex justify-center px-6 md:px-12" data-testid="drape-specs">
        <div className="w-full max-w-[520px]">
          <img
            src="https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/6aphx9ww_1000148055.png"
            alt="DRAPE specifications — diamond count, dimensions, and weight"
            className="w-full h-auto object-contain opacity-90 hover:opacity-100 transition duration-500"
            loading="lazy"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6 md:px-12">
        <div className="max-w-xl mx-auto text-center">
          <button
            disabled
            className="bg-[#C6A646] text-black px-8 py-4 text-sm tracking-wide opacity-50 cursor-not-allowed"
            data-testid="drape-cta-btn"
          >
            COMING SOON
          </button>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
