import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { useAddToCart } from "../hooks/useAddToCart";
import { useLivePrice, useLiveTierPrices } from "@/hooks/useLivePrice";

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
  const [selectedTier, setSelectedTier] = useState(product.defaultTier || "signature");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const tierPrices = useLiveTierPrices("cocktailJessica");
  const { formatted: ctaPrice, price: ctaPriceNum } = useLivePrice(
    "cocktailJessica",
    selectedTier,
    product.pricing[selectedTier]
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
    const tier = product.tiers[selectedTier];
    const livePriceCad = ctaPriceNum || product.pricing[selectedTier];
    handleAddToCart({
      id: `cocktail-jessica-${selectedTier}`,
      name: `Le Cocktail de Jessica — ${tier.name}`,
      price: livePriceCad,
      productKey: "cocktailJessica",
      tierKey: selectedTier,
      metal: tier.metal,
      finish: tier.finish,
      stones: tier.stones,
      lockedPriceCad: livePriceCad,
      quantity: 1,
      image: product.imageUrl,
    });
  };

  const tierOrder = [
    { key: "silver",     label: "Sterling Silver · Rose Gold Plated", note: "Entry" },
    { key: "foundation", label: "Foundation — 10K Gold · Mixed Stones", note: null },
    { key: "signature",  label: "Signature — 14K Gold · Mixed Stones", note: "Most Popular" },
    { key: "heirloom",   label: "Heirloom — 18K Gold · Natural Stones", note: "Collector" },
  ];

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

      {/* HERO — split layout (image left, text right on desktop; stacked on mobile) */}
      <section
        className="w-full grid grid-cols-1 md:grid-cols-2 min-h-[78vh] md:min-h-[88vh]"
        data-testid="cocktail-jessica-hero"
      >
        {/* Image side — soft beige studio */}
        <div
          className="relative flex items-center justify-center min-h-[55vh] md:min-h-[88vh]"
          style={{
            background:
              "linear-gradient(135deg, #d9cab6 0%, #c8b79e 60%, #b7a187 100%)",
          }}
        >
          <img
            src={gallery[0]?.src}
            alt="Le Cocktail de Jessica"
            className="w-[70%] md:w-[75%] max-h-[70vh] object-contain"
          />
        </div>

        {/* Text side */}
        <div className="relative flex items-center justify-center px-8 md:px-16 py-14 md:py-0 bg-[var(--cj-warm-dark)]">
          <Reveal>
            <div className="max-w-[440px]">
              <h1
                className="cj-head text-white text-[28px] md:text-[32px] mb-2"
                style={{ letterSpacing: "0.2em" }}
                data-testid="cocktail-jessica-title"
              >
                PHILEON
              </h1>
              <h2
                className="text-white font-serif text-[34px] md:text-[42px] leading-[1.1] mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                LE COCKTAIL DE JESSICA
              </h2>
              <p
                className="cj-body-italic text-[18px] md:text-[20px] text-[var(--cj-cream)]/80"
                data-testid="cocktail-jessica-tagline"
              >
                In rest.
              </p>
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
            <div>
              <label className="cj-label">METAL</label>

              <div className="mt-3 space-y-3">
                {tierOrder.map(({ key, label, note }) => {
                  const isSelected = selectedTier === key;
                  const priceStr =
                    tierPrices[key]?.formatted || `$${product.pricing[key].toLocaleString()}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedTier(key)}
                      data-testid={`cocktail-jessica-tier-${key}-btn`}
                      className={`w-full text-left p-4 transition border cj-body ${
                        isSelected
                          ? "border-[#c7a870] bg-[#c7a870]/10"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <span
                          className={`text-[17px] leading-snug ${
                            isSelected ? "text-white" : "text-[var(--cj-cream)]/80"
                          }`}
                        >
                          {label}
                        </span>
                        <span
                          className={`text-[17px] whitespace-nowrap ${
                            isSelected ? "text-white" : "text-[var(--cj-cream)]/80"
                          }`}
                        >
                          {priceStr} CAD
                        </span>
                      </div>
                      {note && (
                        <p className="text-[11px] text-[var(--cj-cream)]/55 mt-1 tracking-wider uppercase">
                          {note}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
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

            <p className="cj-body text-[13px] text-[var(--cj-cream)]/50 mt-3">
              {product.tiers[selectedTier].description}
            </p>

            <p className="text-[10px] text-[var(--cj-cream)]/35 text-center pt-4 cj-body">
              Price adjusts automatically with the live precious metals market.
            </p>

            <p className="text-xs text-[var(--cj-cream)]/45 text-center cj-body">
              Made to order • 3–4 weeks • Complimentary insured shipping within Canada
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
    </div>
  );
}
