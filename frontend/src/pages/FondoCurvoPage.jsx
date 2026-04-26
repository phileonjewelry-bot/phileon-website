import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { products } from '@/data/products';
import { useAddToCart } from '../hooks/useAddToCart';
import { useLivePrice, useLiveTierPrices } from '@/hooks/useLivePrice';

const FONDO_CURVO_HERO_VIDEO = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/c9wp52og_hf_20260423_204409_1bed0295-382d-413f-b10d-aaba1fb29825.mp4";
const FONDO_CURVO_HERO_POSTER = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/xo3lwkk2_1000147308.png";
const FONDO_CURVO_HERO = FONDO_CURVO_HERO_POSTER;

export default function FondoCurvoPage() {
  const product = products.fondoCurvo;
  const gallery = product.gallery || [];

  const [activeThumb, setActiveThumb] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedMetal, setSelectedMetal] = useState("silver");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const tierPrices = useLiveTierPrices("fondoCurvo");
  const { formatted: ctaPrice, price: ctaPriceNum } = useLivePrice(
    "fondoCurvo",
    selectedMetal,
    product.pricing[selectedMetal]
  );

  const handleSelect = useCallback((index) => {
    if (index === activeThumb || isTransitioning) return;
    setIsTransitioning(true);
    setActiveThumb(index);
    setTimeout(() => setIsTransitioning(false), 250);
  }, [activeThumb, isTransitioning]);

  const onAddToCart = () => {
    const tier = product.tiers[selectedMetal];
    const livePriceCad = ctaPriceNum || product.pricing[selectedMetal];
    const tierConfig = {
      silver:  { metalType: "925", weightGrams: 12.5 },
      gold10k: { metalType: "10K", weightGrams: 12.5 },
    }[selectedMetal];

    handleAddToCart({
      id: `fondo-curvo-${selectedMetal}`,
      name: `Fondo Curvo — ${tier.name}`,
      price: livePriceCad,
      productKey: "fondoCurvo",
      tierKey: selectedMetal,
      // Explicit fields for Fondo Curvo spec
      metalKey: selectedMetal,
      metalLabel: tier.name,
      metalType: tierConfig.metalType,
      weightGrams: tierConfig.weightGrams,
      lockedPriceCad: livePriceCad,
      metal: tier.metal,
      quantity: 1,
      image: FONDO_CURVO_HERO,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* FONDO CURVO — HERO */}
      <section
        className="w-screen h-[78vh] md:h-[88vh] bg-black relative overflow-hidden -mx-4 md:mx-0"
        data-testid="fondo-curvo-page"
      >
        {/* VIDEO */}
        <video
          className="absolute inset-0 w-full h-full object-cover scale-[0.81] md:scale-[0.74]"
          style={{ objectPosition: "center 35%" }}
          src={FONDO_CURVO_HERO_VIDEO}
          poster={FONDO_CURVO_HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          data-testid="fondo-curvo-hero-video"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/35" />

        {/* BACK LINK (LOCKED TO HERO) */}
        <Link
          to="/shop?category=earrings&audience=ladies"
          className="absolute top-6 left-6 z-20 text-white/50 text-xs tracking-[0.3em] hover:text-[#D4AF37] transition-colors flex items-center gap-2"
          data-testid="fondo-curvo-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO EARRINGS</span>
        </Link>

        {/* CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-4 text-center px-6 pointer-events-none">
          <p className="text-white/60 text-[10px] tracking-[0.4em] mb-3">
            PHILEON
          </p>

          <h1 className="text-white font-serif text-[36px] md:text-[61px] leading-[0.95] tracking-[0.06em] mb-2 whitespace-nowrap">
            FONDO CURVO
          </h1>

          <p className="text-white/70 text-[13px] md:text-[14px] leading-relaxed max-w-[306px]">
            Says everything to those who see it.<br />
            Says nothing to those who don&rsquo;t.
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <section className="w-full -mt-16 md:-mt-20 pt-4 md:pt-6" data-testid="fondo-curvo-gallery">
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

      {/* PRODUCT DETAILS */}
      <section className="py-10 md:py-14">
        <div className="max-w-[560px] mx-auto px-5 md:px-8 space-y-6 text-white">
          {/* TITLE */}
          <div>
            <h1
              className="font-serif text-3xl md:text-4xl tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              FONDO CURVO
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Curved base
            </p>
          </div>

          {/* METAL SELECTOR */}
          <div>
            <label className="text-xs tracking-widest text-white/45">
              METAL
            </label>

            <div className="mt-3 space-y-3">
              {[
                { key: "silver",  label: "Silver" },
                { key: "gold10k", label: "10K Gold" },
              ].map(({ key, label }) => {
                const isSelected = selectedMetal === key;
                const priceStr = tierPrices[key]?.formatted || `$${product.pricing[key].toLocaleString()}`;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedMetal(key)}
                    data-testid={`fondo-curvo-metal-${key}-btn`}
                    className={`w-full text-left p-4 border transition ${
                      isSelected
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{label}</span>
                      <span>{priceStr} CAD</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SPECS */}
          <div>
            <p className="text-xs tracking-widest text-white/45 mb-2">
              DETAILS
            </p>
            <p className="text-white/80 text-sm leading-relaxed">
              {product.specs}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={onAddToCart}
            disabled={isAdding}
            data-testid="fondo-curvo-add-to-bag-btn"
            className="w-full bg-[#D4AF37] text-black py-4 tracking-[0.2em] text-sm font-medium hover:bg-[#C19B2E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : `ADD TO BAG — ${ctaPrice} CAD`}
          </button>

          {/* MARKET NOTE */}
          <p className="text-[10px] text-white/35 text-center">
            Price adjusts automatically with the live precious metals market.
          </p>

          {/* MADE TO ORDER */}
          <p className="text-xs text-white/45 text-center">
            Made to order • 3–4 weeks • Complimentary insured shipping within Canada
          </p>
        </div>
      </section>

      {/* DETAIL · CRAFT · STRUCTURE · SPECIFICATIONS */}
      <section className="mt-16 md:mt-24" data-testid="fondo-curvo-editorial">
        <div className="max-w-[900px] mx-auto px-6 md:px-0 space-y-14">

          <div>
            <p className="text-[12px] tracking-[0.25em] text-neutral-500 mb-4">DETAIL</p>
            <p className="text-[15px] md:text-[16px] leading-7 text-neutral-200 max-w-[720px]">
              Fondo Curvo is built on contrast &mdash; black enamel against pav&eacute;-set brilliance, shaped into a continuous, controlled line.
            </p>
          </div>

          <div>
            <p className="text-[12px] tracking-[0.25em] text-neutral-500 mb-4">CRAFT</p>
            <p className="text-[15px] md:text-[16px] leading-7 text-neutral-200 max-w-[720px]">
              128 diamonds are set across a sculptural form, balancing precision with flow. Every surface is intentional.
            </p>
          </div>

          <div>
            <p className="text-[12px] tracking-[0.25em] text-neutral-500 mb-4">STRUCTURE</p>
            <p className="text-[15px] md:text-[16px] leading-7 text-neutral-200 max-w-[720px]">
              45mm drop. 18mm width. The form tapers through the descent, creating length without excess.
            </p>
          </div>

          <div>
            <p className="text-[12px] tracking-[0.25em] text-neutral-500 mb-6">SPECIFICATIONS</p>
            <img
              src="https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/wav6v8ma_1000147490.png"
              alt="Fondo Curvo specifications"
              className="w-full h-auto object-contain rounded-[8px]"
              loading="lazy"
            />
          </div>

        </div>
      </section>

      {/* CLOSING */}
      <section className="py-14 md:py-20 border-t border-white/[0.03]">
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
