import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { useAddToCart } from "../hooks/useAddToCart";

export default function CarapacePage() {
  const product = products.theCarapace;
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Default metal from variants[].default === true
  const defaultVariant = product.variants.find((v) => v.default) || product.variants[0];
  const [variantKey, setVariantKey] = useState(defaultVariant.key);
  const variant = product.variants.find((v) => v.key === variantKey) || defaultVariant;
  const formattedPrice = `$${variant.price.toLocaleString("en-US")} USD`;

  const onAddToCart = () => {
    handleAddToCart({
      id: `theCarapace-${variant.key}`,
      name: `The Carapace — ${variant.metal}`,
      price: variant.price,
      productKey: "theCarapace",
      tierKey: variant.key,
      metal: variant.metal,
      quantity: 1,
      image: product.gallery[0]?.src,
    });
  };

  useEffect(() => {
    const revealEls = document.querySelectorAll(".cp-reveal, .cp-section");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.18 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    const galleryRoot = document.querySelector("[data-cp-gallery-scroller]");
    const galleryItems = document.querySelectorAll(".cp-gallery-item");
    const galleryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-active", entry.intersectionRatio >= 0.65);
        });
      },
      { root: galleryRoot, threshold: [0, 0.65, 1] }
    );
    galleryItems.forEach((item) => galleryObserver.observe(item));

    return () => {
      revealObserver.disconnect();
      galleryObserver.disconnect();
    };
  }, []);

  const specs = product.detailedSpecs;

  return (
    <div className="min-h-screen bg-black text-white" data-testid="carapace-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        .cp-cinzel { font-family: 'Cinzel', serif; letter-spacing: 0.08em; }
        .cp-cormorant { font-family: 'Cormorant Garamond', serif; }

        @keyframes cpHeroDrift {
          from { transform: scale(1) translateY(0); }
          to   { transform: scale(1.04) translateY(-8px); }
        }
        .cp-hero-media {
          transform-origin: center center;
          animation: cpHeroDrift 16s ease-in-out infinite alternate;
          will-change: transform;
        }

        .cp-reveal {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cp-reveal.visible { opacity: 1; transform: translateY(0); }
        .cp-delay-1 { transition-delay: 0.2s; }
        .cp-delay-2 { transition-delay: 0.5s; }
        .cp-delay-3 { transition-delay: 0.8s; }

        .cp-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cp-section.visible { opacity: 1; transform: translateY(0); }

        .cp-gallery-item {
          scroll-snap-align: center;
          opacity: 0.55;
          transform: scale(0.96);
          filter: brightness(0.75);
          transition:
            opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cp-gallery-item.is-active { opacity: 1; transform: scale(1); filter: brightness(1); }

        @media (max-width: 767px) {
          [data-testid="carapace-hero"] { height: 86vh !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cp-hero-media, .cp-reveal, .cp-section, .cp-gallery-item {
            animation: none !important;
            transition-duration: 0.001ms !important;
          }
          .cp-reveal, .cp-section { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative w-full bg-black overflow-hidden"
        style={{ height: "92vh", minHeight: "320px" }}
        data-testid="carapace-hero"
      >
        <img
          src={product.hero.poster}
          alt="The Carapace — cinematic hero"
          className="cp-hero-media absolute inset-0 w-full h-full object-cover"
        />

        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent" />

        <Link
          to="/shop?category=rings"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/55 text-[11px] tracking-[0.3em] hover:text-[#C6A86B] transition-colors"
          data-testid="carapace-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO RINGS</span>
        </Link>

        <div className="relative z-10 h-full flex items-center justify-center px-6 text-center text-white">
          <div>
            <p className="cp-reveal cp-delay-1 cp-cinzel text-[10px] md:text-[11px] tracking-[0.45em] text-white/75 mb-5">
              {product.heroText.eyebrow}
            </p>
            <h1
              className="cp-reveal cp-delay-2 cp-cinzel text-3xl md:text-5xl text-white"
              style={{ letterSpacing: "0.14em" }}
              data-testid="carapace-title"
            >
              {product.heroText.title}
            </h1>
            <p
              className="cp-reveal cp-delay-3 text-white italic tracking-wide text-sm mt-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              data-testid="carapace-subline"
            >
              {product.heroText.subline}
            </p>
          </div>
        </div>
      </section>

      {/* ─── PURCHASE BLOCK ──────────────────────────────────────── */}
      <section className="cp-section w-full py-14 md:py-20" data-testid="carapace-purchase">
        <div className="max-w-[860px] mx-auto px-6 md:px-8 space-y-10">
          <div className="text-center">
            <h2
              className="cp-cinzel text-2xl md:text-3xl text-white"
              style={{ letterSpacing: "0.18em" }}
              data-testid="carapace-title-2"
            >
              THE CARAPACE
            </h2>
            <p className="cp-cormorant italic text-base md:text-lg text-white/65 mt-3">
              {product.tagline}
            </p>
            <p
              className="cp-cinzel text-3xl md:text-4xl text-white mt-6"
              style={{ letterSpacing: "0.06em" }}
              data-testid="carapace-price"
            >
              {formattedPrice}
            </p>
          </div>

          {/* SELECT METAL */}
          <div data-testid="carapace-step-metal">
            <p className="cp-cinzel text-[10px] tracking-[0.4em] text-white/45 mb-5 text-center">
              SELECT METAL
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {product.variants.map((v) => {
                const isSel = variantKey === v.key;
                return (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setVariantKey(v.key)}
                    aria-pressed={isSel}
                    data-testid={`carapace-variant-${v.key}-btn`}
                    className={`
                      relative rounded-2xl border bg-transparent
                      transition-all duration-500 ease-out
                      px-5 md:px-5 py-6 md:py-7 text-left
                      ${isSel
                        ? "border-[#C6A86B] bg-[#C6A86B]/[0.06] shadow-[inset_0_0_0_1px_rgba(198,168,107,0.18)]"
                        : "border-white/20 hover:border-[#C6A86B] hover:bg-[#C6A86B]/[0.04]"}
                    `}
                  >
                    {v.pave && (
                      <span
                        className="absolute top-4 right-4 cp-cinzel text-[9px] tracking-[0.18em] text-[#C6A86B] border border-[#C6A86B]/40 rounded-full px-2 py-0.5"
                        data-testid={`carapace-variant-${v.key}-pave-badge`}
                      >
                        PAVÉ
                      </span>
                    )}
                    <p className={`cp-cinzel text-[13px] md:text-[14px] tracking-[0.18em] ${isSel ? "text-white" : "text-white/80"}`}>
                      {v.metal.toUpperCase()}
                    </p>
                    <p className={`cp-cormorant italic text-[14px] mt-3 ${isSel ? "text-white/80" : "text-white/55"}`}>
                      {v.description}
                    </p>
                    <p className={`cp-cinzel text-[16px] mt-5 ${isSel ? "text-white" : "text-white/70"}`}>
                      ${v.price.toLocaleString("en-US")} USD
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUMMARY + ADD TO BAG */}
          <div className="text-center pt-2 space-y-7">
            <p className="cp-cinzel text-[10px] tracking-[0.35em] text-white/55">
              {variant.metal.toUpperCase()}
            </p>

            <button
              onClick={onAddToCart}
              disabled={isAdding}
              data-testid="carapace-add-to-cart-btn"
              className="
                cp-cinzel inline-block px-14 py-5
                bg-transparent border border-[#C6A86B] text-[#C6A86B]
                tracking-[0.3em] text-[12px]
                hover:bg-[#C6A86B] hover:text-black
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors duration-500
              "
            >
              {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "ADD TO BAG"}
            </button>

            <p className="cp-cormorant text-sm text-white/45 italic">
              Made to order · 2–3 weeks · Complimentary insured shipping
            </p>
          </div>
        </div>
      </section>

      {/* ─── GALLERY ──────────────────────────────────────────────── */}
      <section className="cp-section w-full bg-black py-8 md:py-12" data-testid="carapace-gallery">
        <div
          className="
            flex overflow-x-auto gap-3 md:gap-4 px-4 md:px-10 pb-4
            snap-x snap-mandatory
          "
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(198,168,107,0.4) transparent",
            scrollBehavior: "smooth",
          }}
          data-cp-gallery-scroller
        >
          {product.gallery.map((img, i) => (
            <div
              key={img.src}
              className="
                cp-gallery-item
                relative flex-shrink-0
                w-[78vw] sm:w-[52vw] md:w-[36vw] lg:w-[30vw]
                aspect-square bg-black overflow-hidden
              "
              data-testid={`carapace-gallery-item-${i}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── EDITORIAL ────────────────────────────────────────────── */}
      <section className="cp-section w-full py-16 md:py-20" data-testid="carapace-editorial">
        <div className="max-w-[640px] mx-auto px-6 text-center">
          <p className="cp-cormorant italic text-xl md:text-2xl text-white/80 leading-[1.6]">
            Not a ring, a reputation.
          </p>
          <p className="cp-cormorant italic text-lg md:text-xl text-white/55 leading-[1.6] mt-4">
            An exoskeleton in polished gold. Worn where the world can see it —
            and understand.
          </p>
        </div>
      </section>

      {/* ─── SPECIFICATIONS ──────────────────────────────────────── */}
      <section className="cp-section w-full py-16 md:py-20" data-testid="carapace-specifications">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <p className="cp-cinzel text-[11px] tracking-[0.4em] text-center text-white/55 mb-10">
            SPECIFICATIONS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            <div className="text-center md:text-left">
              <div aria-hidden className="h-px w-10 mx-auto md:mx-0 mb-4" style={{ backgroundColor: "rgba(198, 168, 107, 0.4)" }} />
              <p className="cp-cinzel text-[11px] tracking-[0.35em] text-[#C6A86B] mb-4">DIMENSIONS</p>
              <div className="cp-cormorant text-[16px] md:text-[17px] leading-[1.55] text-white/70 space-y-1">
                <p>Weight · {specs.weight}</p>
                <p>Fit · {specs.fit}</p>
              </div>
            </div>
            <div className="text-center md:text-left">
              <div aria-hidden className="h-px w-10 mx-auto md:mx-0 mb-4" style={{ backgroundColor: "rgba(198, 168, 107, 0.4)" }} />
              <p className="cp-cinzel text-[11px] tracking-[0.35em] text-[#C6A86B] mb-4">MATERIAL</p>
              <div className="cp-cormorant text-[16px] md:text-[17px] leading-[1.55] text-white/70 space-y-1">
                <p>{specs.material}</p>
                <p>{specs.finish}</p>
              </div>
            </div>
            <div className="text-center md:text-left">
              <div aria-hidden className="h-px w-10 mx-auto md:mx-0 mb-4" style={{ backgroundColor: "rgba(198, 168, 107, 0.4)" }} />
              <p className="cp-cinzel text-[11px] tracking-[0.35em] text-[#C6A86B] mb-4">CONSTRUCTION</p>
              <div className="cp-cormorant text-[16px] md:text-[17px] leading-[1.55] text-white/70 space-y-1">
                <p>{specs.construction}</p>
                <p>{specs.form}</p>
              </div>
            </div>
          </div>
          <p
            className="cp-cormorant italic text-sm text-white/45 text-center mt-12"
            data-testid="carapace-lead-time"
          >
            {specs.leadTime}
          </p>
        </div>
      </section>

      {/* ─── BOTTOM CTA ECHO ─────────────────────────────────────── */}
      <section className="cp-section w-full py-20 md:py-28" data-testid="carapace-bottom-cta">
        <div className="max-w-[640px] mx-auto px-6 text-center space-y-7">
          <h3
            className="cp-cinzel text-2xl md:text-3xl text-white"
            style={{ letterSpacing: "0.18em" }}
          >
            THE CARAPACE
          </h3>
          <p className="cp-cormorant italic text-base md:text-lg text-white/65">
            Not a ring, a reputation.
          </p>
          <p
            className="cp-cinzel text-3xl md:text-4xl text-white"
            style={{ letterSpacing: "0.06em" }}
            data-testid="carapace-price-bottom"
          >
            {formattedPrice}
          </p>
          <button
            onClick={onAddToCart}
            disabled={isAdding}
            data-testid="carapace-add-to-cart-btn-bottom"
            className="
              cp-cinzel inline-block px-14 py-5
              bg-transparent border border-[#C6A86B] text-[#C6A86B]
              tracking-[0.3em] text-[12px]
              hover:bg-[#C6A86B] hover:text-black
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-500
            "
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "ADD TO BAG"}
          </button>
          <p className="cp-cormorant text-sm text-white/45 italic">
            Made to order · 2–3 weeks · Complimentary insured shipping
          </p>
        </div>
      </section>
    </div>
  );
}
