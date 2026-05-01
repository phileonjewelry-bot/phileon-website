import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { useAddToCart } from "../hooks/useAddToCart";
import { useLivePrice } from "@/hooks/useLivePrice";
import SizeGuideModal from "@/components/SizeGuideModal";

// Scroll-reveal helper — subtle fade up as each section enters the viewport
const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function CocktailJessicaPage() {
  const product = products.cocktailJessica;
  const gallery = product.gallery || [];

  const [activeThumb, setActiveThumb] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const { formatted: ctaPrice, price: ctaPriceNum } = useLivePrice(
    "cocktailJessica",
    "standard",
    product.pricing.standard
  );

  const handleSelect = useCallback(
    (index) => {
      if (index === activeThumb || isTransitioning) return;
      setIsTransitioning(true);
      setActiveThumb(index);
      setTimeout(() => setIsTransitioning(false), 250);
    },
    [activeThumb, isTransitioning]
  );

  const onAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      alert("Please select a ring size");
      return;
    }
    setSizeError(false);
    const tier = product.tiers.standard;
    const livePriceCad = ctaPriceNum || product.pricing.standard;
    handleAddToCart({
      id: `cocktail-jessica-standard-${selectedSize}`,
      name: `Le Cocktail de Jessica (Size ${selectedSize})`,
      price: livePriceCad,
      productKey: "cocktailJessica",
      tierKey: "standard",
      metal: tier.metal,
      stones: tier.stones,
      size: selectedSize,
      lockedPriceCad: livePriceCad,
      quantity: 1,
      image: product.imageUrl,
    });
  };

  const sizeOptions = [];
  for (let i = 4; i <= 9; i++) {
    sizeOptions.push(i.toString());
    if (i < 9) sizeOptions.push(`${i}.5`);
  }

  return (
    <div className="min-h-screen cocktail-jessica-theme">
      {/* FONT IMPORTS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        .cocktail-jessica-theme {
          /* Warm dark background */
          background-color: #1a1410;
          color: #efe7da;
          --cj-warm-dark: #1a1410;
          --cj-warm-dark-2: #221a13;
          --cj-cream: #efe7da;
          --cj-muted: rgba(239, 231, 218, 0.55);
          --cj-muted-2: rgba(239, 231, 218, 0.35);
          --cj-accent: #c7a870;
        }
        .cocktail-jessica-theme .cj-head {
          font-family: 'Cinzel', serif;
          letter-spacing: 0.08em;
        }
        .cocktail-jessica-theme .cj-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
        }
        .cocktail-jessica-theme .cj-body-italic {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
        }
        .cj-label {
          font-family: 'Cinzel', serif;
          letter-spacing: 0.32em;
          font-size: 10.5px;
          color: var(--cj-muted);
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Back to Rings */}
      <Link
        to="/shop?category=rings&audience=ladies"
        className="fixed top-20 left-6 z-20 flex items-center gap-2 text-[11px] tracking-[0.3em] text-[rgba(239,231,218,0.55)] hover:text-[#c7a870] transition-colors"
        data-testid="cocktail-jessica-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO RINGS</span>
      </Link>

      {/* HERO — full-bleed video */}
      <section
        className="relative w-full h-[88vh] overflow-hidden"
        data-testid="cocktail-jessica-hero"
      >
        <video
          src="https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/iy56nc32_XiaoYing_Video_1777600131919_HD.mp4"
          poster={gallery[0]?.src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          data-testid="cocktail-jessica-hero-video"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />

        {/* Text */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center text-white px-6 w-full max-w-[620px]">
          <Reveal>
            <p className="text-[11px] tracking-[0.35em] mb-2 opacity-90 cj-head" data-testid="cocktail-jessica-title">
              PHILEON
            </p>

            <h1
              className="font-serif text-[28px] sm:text-[42px] leading-tight mb-5"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              LE COCKTAIL DE JESSICA
            </h1>

            <div
              className="cj-body text-[13px] sm:text-[15px] leading-relaxed space-y-2 opacity-90"
              data-testid="cocktail-jessica-tagline"
            >
              <p>Colours, painted. Cast in gold.</p>
              <p>A palette of her own.</p>
              <p className="italic">Not a story. An argument.</p>
              <p>She colors outside every line.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALLERY */}
      <section className="w-full py-14 md:py-20" data-testid="cocktail-jessica-gallery">
        <div className="max-w-[520px] md:max-w-[620px] mx-auto px-3 md:px-5">
          <Reveal>
            <div
              className="w-full overflow-hidden rounded-[10px] mb-2"
              style={{ backgroundColor: "#d9cab6" }}
            >
              <img
                src={gallery[activeThumb]?.src}
                alt={gallery[activeThumb]?.alt}
                className={`w-full aspect-square object-cover transition-opacity duration-250 ${
                  isTransitioning ? "opacity-0" : "opacity-100"
                }`}
              />
            </div>

            <div className="flex gap-[5px] overflow-x-auto pb-1 scrollbar-hide">
              {gallery.map((item, index) => (
                <button
                  key={`t-${index}`}
                  onClick={() => handleSelect(index)}
                  data-testid={`cocktail-jessica-thumb-${index}`}
                  className={`
                    w-[48px] h-[48px] md:w-[56px] md:h-[56px] flex-shrink-0 rounded-[3px] overflow-hidden
                    transition-all duration-150
                    ${
                      activeThumb === index
                        ? "ring-1 ring-[#c7a870]/60 opacity-100"
                        : "opacity-35 hover:opacity-70"
                    }
                  `}
                >
                  <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PURCHASE BLOCK */}
      <section className="py-10 md:py-14">
        <div className="max-w-[560px] mx-auto px-5 md:px-8 space-y-6">
          <Reveal>
            <div>
              <h2 className="cj-head text-white text-[26px] md:text-[32px] tracking-wide" data-testid="cocktail-jessica-purchase-title">
                LE COCKTAIL DE JESSICA
              </h2>
              <p className="cj-body-italic text-[var(--cj-cream)]/60 text-base mt-1">Cocktail Ring</p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div data-testid="cocktail-jessica-composition">
              <label className="cj-label">COMPOSITION</label>

              <div className="mt-4 cj-body text-[17px] text-[var(--cj-cream)]/90 leading-[1.65] space-y-1">
                <p>{product.composition.metal}</p>
                <p>{product.composition.weightGrams}</p>
                <p>{product.composition.caratsTotal}</p>
              </div>

              <div className="mt-6 flex items-baseline justify-between pb-4 border-b border-white/10">
                <span className="cj-body text-[var(--cj-cream)]/70 text-[14px]">Price</span>
                <span className="cj-head text-white text-[22px] tracking-wide" data-testid="cocktail-jessica-price">
                  {ctaPrice} CAD
                </span>
              </div>

              <p className="cj-body text-[13px] text-[var(--cj-cream)]/60 mt-4 leading-relaxed">
                {product.composition.details}<br />
                Made to order · 3–4 weeks<br />
                Complimentary insured shipping
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div data-testid="cocktail-jessica-size-block">
              <label className="cj-label">SIZE</label>
              <select
                value={selectedSize}
                onChange={(e) => { setSelectedSize(e.target.value); setSizeError(false); }}
                data-testid="cocktail-jessica-size-select"
                className={`mt-3 w-full px-4 py-3 text-[15px] cj-body bg-transparent text-white focus:outline-none transition-colors ${
                  sizeError ? "border border-red-400/60" : "border border-white/20 focus:border-[#c7a870]"
                }`}
              >
                <option value="" disabled className="bg-[#1a1410]">Select size</option>
                {sizeOptions.map((s) => (
                  <option key={s} value={s} className="bg-[#1a1410]">{s}</option>
                ))}
                <option value="custom" className="bg-[#1a1410]">Custom Size</option>
              </select>
              <p className="text-xs text-[var(--cj-cream)]/50 mt-2 cj-body">
                Need help?{' '}
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  data-testid="cocktail-jessica-size-guide-btn"
                  className="underline hover:text-[#c7a870] transition-colors cursor-pointer"
                >
                  View our size guide.
                </button>
              </p>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <button
              onClick={onAddToCart}
              disabled={isAdding}
              data-testid="cocktail-jessica-add-to-bag-btn"
              className="w-full bg-[#c7a870] hover:bg-[#b89a65] text-[#1a1410] py-4 tracking-[0.2em] text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isAdding
                ? "ADDING..."
                : buttonText === "Added!"
                ? "ADDED"
                : `ADD TO BAG — ${ctaPrice} CAD`}
            </button>

            <p className="text-[10px] text-[var(--cj-cream)]/35 text-center pt-4 cj-body">
              Price adjusts automatically with the live precious metals market.
            </p>
          </Reveal>
        </div>
      </section>

      {/* EDITORIAL — INTENT */}
      <section className="py-20 md:py-28" data-testid="cocktail-jessica-intent">
        <div className="max-w-[720px] mx-auto px-6 md:px-0">
          <Reveal>
            <p className="cj-label mb-5">INTENT</p>
            <div className="cj-body text-[19px] md:text-[21px] leading-[1.7] text-[var(--cj-cream)]/90 space-y-5">
              <p>Designed as a personal piece &mdash; not for symmetry, but for expression.</p>
              <p>Each stone reflects a different moment, a different tone. Together, they form a single identity.</p>
              <p>Nothing here is accidental.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* EDITORIAL — COMPOSITION */}
      <section className="pb-20 md:pb-28" data-testid="cocktail-jessica-composition">
        <div className="max-w-[720px] mx-auto px-6 md:px-0">
          <Reveal>
            <p className="cj-label mb-5">COMPOSITION</p>
            <div className="cj-body text-[19px] md:text-[21px] leading-[1.7] text-[var(--cj-cream)]/90 space-y-5">
              <p>A tri-colour ring formed as a single continuous piece.</p>
              <p>
                Each band carries its own tone, yet all resolve into one silhouette. The eye moves across
                the ring the way it moves across fabric &mdash; guided, not forced.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* IMAGE BREAK — full width white */}
      <section className="w-full bg-white" data-testid="cocktail-jessica-image-break">
        <Reveal>
          <div className="w-full max-h-[80vh] overflow-hidden">
            <img
              src={product.imageBreak}
              alt="Le Cocktail de Jessica — editorial break"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </Reveal>
      </section>

      {/* EDITORIAL — COLOUR STUDY */}
      <section className="py-20 md:py-28" data-testid="cocktail-jessica-colour-study">
        <div className="max-w-[720px] mx-auto px-6 md:px-0">
          <Reveal>
            <p className="cj-label mb-5">COLOUR STUDY</p>
            <div className="cj-body text-[19px] md:text-[21px] leading-[1.7] text-[var(--cj-cream)]/90 space-y-5">
              <p>A sapphire in deep blue anchors the composition.</p>
              <p>Yellow and pink stones introduce contrast without conflict.</p>
              <p>A diamond cluster softens the transition between tones.</p>
              <p className="cj-body-italic text-[var(--cj-cream)]/75">Nothing competes. Everything resolves.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* EDITORIAL — COMPOSITION LOGIC */}
      <section className="pb-20 md:pb-28" data-testid="cocktail-jessica-composition-logic">
        <div className="max-w-[720px] mx-auto px-6 md:px-0">
          <Reveal>
            <p className="cj-label mb-5">COMPOSITION LOGIC</p>
            <div className="cj-body text-[19px] md:text-[21px] leading-[1.7] text-[var(--cj-cream)]/90 space-y-5">
              <p>Three bands move in parallel, never touching yet never separate.</p>
              <p>White gold holds the center.</p>
              <p>Yellow introduces light.</p>
              <p>Rose carries warmth.</p>
              <p className="cj-body-italic text-[var(--cj-cream)]/75">The stones are not placed — they respond to one another.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* EDITORIAL — CRAFT */}
      <section className="pb-20 md:pb-28" data-testid="cocktail-jessica-craft">
        <div className="max-w-[720px] mx-auto px-6 md:px-0">
          <Reveal>
            <p className="cj-label mb-5">CRAFT</p>
            <div className="cj-body text-[19px] md:text-[21px] leading-[1.7] text-[var(--cj-cream)]/90 space-y-5">
              <p>Tri-colour gold construction.</p>
              <p>Mixed stone setting including sapphire, coloured stones, and diamonds.</p>
              <p>Balanced by hand to maintain flow across all three bands.</p>
              <p className="pt-2">Not stacked. Not separate.</p>
              <p className="cj-body-italic text-[var(--cj-cream)]/85">Composed.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CLOSING LINE */}
      <section className="pb-28 md:pb-40" data-testid="cocktail-jessica-closing">
        <Reveal>
          <div className="max-w-[520px] mx-auto text-center px-6">
            <p className="cj-body-italic text-[17px] text-[var(--cj-cream)]/70">
              Le Cocktail de Jessica &mdash; in rest.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Size Guide Modal */}
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
