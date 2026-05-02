import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import { useLivePrice, useLiveTierPrices } from "@/hooks/useLivePrice";

const HERO_IMG =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/acj6mi7n_1000148370.jpg";

const EDITORIAL_SECTIONS = [
  {
    title: "COMPOSITION",
    body: "A study in controlled curvature. Each segment follows a deliberate path, creating rhythm without repetition.",
  },
  {
    title: "STRUCTURE",
    body: "The form is held through tension and continuity. Nothing decorative. Every line contributes to the whole.",
  },
  {
    title: "SURFACE",
    body: "A mesh articulation that captures light in motion. Precision detailing across every plane.",
  },
  {
    title: "WEIGHT",
    body: "Engineered for presence without burden. The piece holds visually, but wears lightly.",
  },
  {
    title: "FINAL WORD",
    body: "Form is not imposed. It is resolved.",
  },
];

const SPECIFICATIONS = [
  { label: "ORIGIN", body: "Digitally modeled. Cast. Hand-finished." },
  { label: "METAL", body: "Available in 10K / 14K / 18K Gold" },
  { label: "CONSTRUCTION", body: "Segmented structural mesh with continuous curvature" },
];

// Lightweight scroll-fade-in (no external lib)
function FadeInOnScroll({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 900ms ease-out ${delay}ms, transform 900ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function NervaturaPage() {
  const product = products.nervatura;
  const gallery = product.gallery || [];
  const [galleryIndex, setGalleryIndex] = useState(0);
  const activeImage = gallery[galleryIndex] || gallery[0] || { src: HERO_IMG, alt: product.name };

  const [selectedTier, setSelectedTier] = useState(product.defaultTier || "signature");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const tierPrices = useLiveTierPrices("nervatura");
  const { formatted: ctaPrice, price: ctaPriceNum } = useLivePrice(
    "nervatura",
    selectedTier,
    product.pricing[selectedTier]
  );

  const onAcquire = () => {
    const tier = product.tiers[selectedTier];
    handleAddToCart({
      id: `nervatura-${selectedTier}`,
      name: `The Phileon Nervatura — ${tier.name} (${tier.metal})`,
      price: ctaPriceNum || product.pricing[selectedTier],
      productKey: "nervatura",
      tierKey: selectedTier,
      metal: tier.metal,
      quantity: 1,
      image: HERO_IMG,
    });
  };

  const tierOrder = [
    { key: "foundation", short: "10K" },
    { key: "signature",  short: "14K" },
    { key: "heirloom",   short: "18K" },
  ];

  return (
    <div className="min-h-screen bg-black text-white" data-testid="nervatura-page">
      {/* Page-scoped fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        .nervatura-cinzel { font-family: 'Cinzel', serif; letter-spacing: 0.08em; }
        .nervatura-cormorant { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      {/* ─── 1. HERO ───────────────────────────────────────────────── */}
      <section
        className="relative w-full h-[92vh] overflow-hidden bg-black"
        data-testid="nervatura-hero"
      >
        <img
          src={HERO_IMG}
          alt="The Phileon Nervatura — architectural drop earrings"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Subtle dual gradient (top + bottom) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/55 via-transparent to-black/65" />

        {/* Back link */}
        <Link
          to="/shop?category=earrings"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/55 text-[11px] tracking-[0.3em] hover:text-[#D4AF37] transition-colors"
          data-testid="nervatura-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO EARRINGS</span>
        </Link>

        {/* Centered overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p
            className="nervatura-cinzel text-[10px] md:text-[11px] tracking-[0.5em] text-white/85 mb-5"
            data-testid="nervatura-eyebrow"
          >
            PHILEON
          </p>
          <h1
            className="nervatura-cinzel text-4xl md:text-6xl text-white mb-3"
            style={{ letterSpacing: "0.18em" }}
            data-testid="nervatura-title"
          >
            NERVATURA
          </h1>
          <p
            className="nervatura-cormorant italic text-base md:text-lg text-white/75"
            data-testid="nervatura-subline"
          >
            Status has a structure.
          </p>
        </div>
      </section>

      {/* ─── 2. TRANSITION SPACE ───────────────────────────────────── */}
      <div className="h-[120px] md:h-[160px]" />

      {/* ─── 3. EDITORIAL BLOCK ────────────────────────────────────── */}
      <section
        className="relative w-full px-6 md:px-10 pb-24 md:pb-32"
        data-testid="nervatura-editorial"
      >
        <div className="max-w-[960px] mx-auto relative">
          {/* Vertical gold divider */}
          <div
            aria-hidden
            className="hidden md:block absolute top-0 bottom-0 w-px"
            style={{
              left: "calc(33% + 24px)",
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(212,175,55,0.45) 12%, rgba(212,175,55,0.45) 88%, transparent 100%)",
            }}
          />

          <div className="space-y-16 md:space-y-20">
            {EDITORIAL_SECTIONS.map((section, i) => (
              <FadeInOnScroll key={section.title} delay={i * 60}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
                  <div className="md:col-span-1">
                    <h3
                      className="nervatura-cinzel text-[12px] md:text-[13px] text-white/85"
                      style={{ letterSpacing: "0.32em" }}
                      data-testid={`nervatura-editorial-title-${i}`}
                    >
                      {section.title}
                    </h3>
                  </div>
                  <div className="md:col-span-2">
                    <p
                      className="nervatura-cormorant text-[18px] md:text-[20px] leading-[1.65] text-white/75"
                      data-testid={`nervatura-editorial-body-${i}`}
                    >
                      {section.body}
                    </p>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. GALLERY ────────────────────────────────────────────── */}
      <section
        className="w-full bg-black py-20 md:py-28"
        data-testid="nervatura-gallery"
      >
        <div className="max-w-[760px] mx-auto px-5 md:px-8">
          <FadeInOnScroll>
            {/* Main image */}
            <div
              className="w-full bg-black overflow-hidden mb-6"
              data-testid="nervatura-gallery-main"
            >
              <img
                key={activeImage.src}
                src={activeImage.src}
                alt={activeImage.alt}
                className="w-full h-auto object-contain transition-opacity duration-500"
                style={{ maxHeight: "78vh" }}
                loading="lazy"
              />
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
                {gallery.map((img, i) => {
                  const isActive = i === galleryIndex;
                  return (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => setGalleryIndex(i)}
                      data-testid={`nervatura-thumb-${i}`}
                      aria-label={`View ${img.alt}`}
                      className={`
                        relative w-16 h-16 md:w-20 md:h-20 overflow-hidden
                        transition-all duration-300
                        ${isActive
                          ? "ring-1 ring-[#D4AF37] opacity-100"
                          : "opacity-50 hover:opacity-90"}
                      `}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </FadeInOnScroll>
        </div>
      </section>

      {/* ─── 5. PURCHASE BLOCK ─────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24" data-testid="nervatura-purchase">
        <div className="max-w-[640px] mx-auto px-6 md:px-8 text-center space-y-10">
          <div>
            <h2
              className="nervatura-cinzel text-2xl md:text-3xl text-white"
              style={{ letterSpacing: "0.18em" }}
              data-testid="nervatura-purchase-title"
            >
              THE PHILEON NERVATURA
            </h2>
            <p className="nervatura-cormorant text-base md:text-lg text-white/65 mt-3 italic">
              Architectural drop earrings.
            </p>
          </div>

          {/* Karat selector */}
          <div>
            <p className="nervatura-cinzel text-[10px] tracking-[0.4em] text-white/45 mb-4">
              KARAT
            </p>
            <div className="inline-flex border border-white/15">
              {tierOrder.map(({ key, short }, idx) => {
                const isSelected = selectedTier === key;
                const tier = product.tiers[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTier(key)}
                    data-testid={`nervatura-tier-${key}-btn`}
                    className={`
                      relative px-7 md:px-10 py-4 transition-colors duration-300
                      nervatura-cinzel text-[12px] tracking-[0.25em]
                      ${idx > 0 ? "border-l border-white/15" : ""}
                      ${isSelected
                        ? "bg-[#D4AF37] text-black"
                        : "text-white/70 hover:text-white hover:bg-white/[0.04]"}
                    `}
                    aria-label={`${tier.name} — ${tier.metal}`}
                  >
                    {short}
                  </button>
                );
              })}
            </div>

            {/* Tier label + price summary */}
            <div className="mt-5 space-y-1">
              <p className="nervatura-cinzel text-[10px] tracking-[0.35em] text-white/55">
                {product.tiers[selectedTier].name.toUpperCase()}
                {product.tiers[selectedTier].badge
                  ? ` · ${product.tiers[selectedTier].badge}`
                  : ""}
              </p>
              <p className="nervatura-cormorant text-sm text-white/45">
                {product.tiers[selectedTier].metal}
              </p>
            </div>
          </div>

          {/* Live price */}
          <div>
            <p
              className="nervatura-cinzel text-3xl md:text-4xl text-white"
              style={{ letterSpacing: "0.06em" }}
              data-testid="nervatura-price"
            >
              {ctaPrice} CAD
            </p>
            <p className="text-[10px] tracking-[0.25em] text-white/35 mt-3">
              {tierPrices[selectedTier]?.formatted ? "PRICE ADJUSTS WITH THE LIVE METALS MARKET" : ""}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={onAcquire}
            disabled={isAdding}
            data-testid="nervatura-acquire-btn"
            className="
              nervatura-cinzel inline-block px-14 py-5
              bg-transparent border border-[#D4AF37] text-[#D4AF37]
              tracking-[0.4em] text-[12px]
              hover:bg-[#D4AF37] hover:text-black
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-500
            "
          >
            {isAdding ? "ACQUIRING..." : buttonText === "Added!" ? "ACQUIRED" : "ACQUIRE"}
          </button>

          {/* Trust line */}
          <p className="nervatura-cormorant text-sm text-white/45 italic">
            Made to order · 3–4 weeks · Complimentary insured shipping
          </p>
        </div>
      </section>

      {/* ─── 6. SPECIFICATIONS ─────────────────────────────────────── */}
      <section
        className="w-full py-20 md:py-28 border-t border-white/[0.06]"
        data-testid="nervatura-specifications"
      >
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <FadeInOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
              {SPECIFICATIONS.map((spec, i) => (
                <div key={spec.label} className="text-center md:text-left">
                  <p
                    className="nervatura-cinzel text-[11px] tracking-[0.35em] text-[#D4AF37]/85 mb-5"
                    data-testid={`nervatura-spec-label-${i}`}
                  >
                    {spec.label}
                  </p>
                  <p className="nervatura-cormorant text-[17px] md:text-[18px] leading-[1.6] text-white/75">
                    {spec.body}
                  </p>
                </div>
              ))}
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ─── 7. FINAL STATEMENT ────────────────────────────────────── */}
      <section
        className="w-full py-32 md:py-44 border-t border-white/[0.04]"
        data-testid="nervatura-final-statement"
      >
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <FadeInOnScroll>
            <p
              className="nervatura-cormorant italic text-3xl md:text-5xl text-white/85 leading-[1.4]"
              data-testid="nervatura-final-line"
            >
              "Structure, resolved."
            </p>
            <p className="nervatura-cinzel text-[10px] tracking-[0.4em] text-white/30 mt-12">
              THE PHILEON NERVATURA
            </p>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  );
}
