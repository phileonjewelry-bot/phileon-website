import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import { useLivePrice, useLiveTierPrices } from "@/hooks/useLivePrice";

const HERO_IMG =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/acj6mi7n_1000148370.jpg";

// Image atlas for the editorial progression (sections 4–10)
const IMG_PRIMARY_LIFESTYLE =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/7mytqo56_1000148497.png"; // front-facing campaign
const IMG_SECONDARY_LIFESTYLE =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/kun0nd6x_1000148492.png"; // softer, slight smile
const IMG_PROFILE_STRUCTURE =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/mllm098y_1000148444.png"; // ¾ angle pair — full drop length
const IMG_CRAFT_MACRO =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/mng5l3vy_1000148443.png"; // close-up mesh
const IMG_FULL_PRODUCT =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/acj6mi7n_1000148370.jpg"; // clean flat-lay
const IMG_PACKAGING =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/d05l53mk_1000148507.png"; // black velvet box

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
  {
    label: "ORIGIN",
    lines: ["Digitally modeled.", "Cast.", "Hand-finished."],
  },
  {
    label: "METAL",
    lines: ["10K / 14K / 18K Gold.", "Made to order."],
  },
  {
    label: "CONSTRUCTION",
    lines: [
      "Segmented structural mesh.",
      "Continuous curvature.",
      "Lightweight wear.",
    ],
  },
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
        className="relative w-full h-[92vh] bg-black overflow-hidden"
        data-testid="nervatura-hero"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/o98pvuwa_1000148503.png"
          onEnded={(e) => {
            e.currentTarget.currentTime = 0;
            e.currentTarget.play().catch(() => {});
          }}
          data-testid="nervatura-hero-video-el"
        >
          <source
            src="https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/c1o4fupk_XiaoYing_Video_1777699475543_1080HD.mp4"
            type="video/mp4"
          />
        </video>

        {/* Subtle dual gradient (top + bottom) for text readability */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/25 via-black/10 to-black/35" />

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
        <div className="relative z-10 h-full flex items-center justify-center px-6 text-center text-white">
          <div>
            <p
              className="nervatura-cinzel text-[10px] md:text-[11px] tracking-[0.45em] text-white/75 mb-5"
              data-testid="nervatura-eyebrow"
            >
              PHILEON
            </p>
            <h1
              className="nervatura-cinzel text-4xl md:text-6xl text-white"
              style={{ letterSpacing: "0.12em" }}
              data-testid="nervatura-title"
            >
              NERVATURA
            </h1>
            <p
              className="nervatura-cormorant italic text-base md:text-lg text-white/75 mt-5"
              data-testid="nervatura-subline"
            >
              Status has a structure.
            </p>
          </div>
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

      {/* ─── 4. PRIMARY LIFESTYLE IMAGE ────────────────────────────── */}
      <section
        className="w-full bg-black pt-4 pb-24 md:pb-32"
        data-testid="nervatura-primary-lifestyle"
      >
        <div className="w-full flex justify-center px-3 md:px-6">
          <FadeInOnScroll className="w-full max-w-[960px]">
            <img
              src={IMG_PRIMARY_LIFESTYLE}
              alt="The Phileon Nervatura — front-facing campaign portrait"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </FadeInOnScroll>
        </div>
      </section>

      {/* ─── 5. SECONDARY LIFESTYLE ────────────────────────────────── */}
      <section
        className="w-full bg-black pb-24 md:pb-32"
        data-testid="nervatura-secondary-lifestyle"
      >
        <div className="w-full flex justify-center px-3 md:px-6">
          <FadeInOnScroll className="w-full max-w-[880px]">
            <img
              src={IMG_SECONDARY_LIFESTYLE}
              alt="The Phileon Nervatura — angled portrait"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </FadeInOnScroll>
        </div>
      </section>

      {/* ─── 6. PROFILE / STRUCTURE SHOT ───────────────────────────── */}
      <section
        className="w-full bg-black pb-24 md:pb-32"
        data-testid="nervatura-profile-structure"
      >
        <div className="w-full flex justify-center px-3 md:px-6">
          <FadeInOnScroll className="w-full max-w-[820px]">
            <img
              src={IMG_PROFILE_STRUCTURE}
              alt="The Phileon Nervatura — full drop length, structural silhouette"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </FadeInOnScroll>
        </div>
      </section>

      {/* ─── 7. CRAFT / MACRO DETAIL ───────────────────────────────── */}
      <section
        className="w-full bg-black pb-24 md:pb-32"
        data-testid="nervatura-craft-macro"
      >
        <div className="w-full flex justify-center px-3 md:px-6">
          <FadeInOnScroll className="w-full max-w-[820px]">
            <img
              src={IMG_CRAFT_MACRO}
              alt="The Phileon Nervatura — close-up mesh detail"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </FadeInOnScroll>
        </div>
      </section>

      {/* ─── 8. FULL PRODUCT IMAGE ─────────────────────────────────── */}
      <section
        className="w-full bg-black pb-24 md:pb-32"
        data-testid="nervatura-full-product"
      >
        <div className="w-full flex justify-center px-3 md:px-6">
          <FadeInOnScroll className="w-full max-w-[820px]">
            <img
              src={IMG_FULL_PRODUCT}
              alt="The Phileon Nervatura — full pair on clean surface"
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </FadeInOnScroll>
        </div>
      </section>

      {/* ─── 9. SPECIFICATIONS ─────────────────────────────────────── */}
      <section
        className="w-full py-20 md:py-28"
        data-testid="nervatura-specifications"
      >
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <FadeInOnScroll>
            {/* Section title */}
            <p
              className="nervatura-cinzel text-[11px] tracking-[0.4em] text-center text-white/55 mb-14"
              data-testid="nervatura-spec-section-title"
            >
              SPECIFICATIONS
            </p>

            {/* 3-col grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-16">
              {SPECIFICATIONS.map((spec, i) => (
                <div
                  key={spec.label}
                  className="text-center md:text-left"
                  data-testid={`nervatura-spec-col-${i}`}
                >
                  {/* Soft champagne divider */}
                  <div
                    aria-hidden
                    className="h-px w-12 mx-auto md:mx-0 mb-5"
                    style={{ backgroundColor: "rgba(198, 168, 107, 0.4)" }}
                  />
                  <p
                    className="nervatura-cinzel text-[11px] tracking-[0.35em] text-[#C6A86B] mb-5"
                    data-testid={`nervatura-spec-label-${i}`}
                  >
                    {spec.label}
                  </p>
                  <div className="nervatura-cormorant text-[17px] md:text-[18px] leading-[1.6] text-white/70 space-y-1.5">
                    {spec.lines.map((ln, li) => (
                      <p key={li}>{ln}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ─── 10. PACKAGING / OWNERSHIP IMAGE ───────────────────────── */}
      <section
        className="w-full bg-black py-20 md:py-28"
        data-testid="nervatura-packaging"
      >
        <div className="w-full flex justify-center px-3 md:px-6">
          <FadeInOnScroll className="w-full max-w-[780px]">
            <img
              src={IMG_PACKAGING}
              alt="The Phileon Nervatura — in the presentation box"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </FadeInOnScroll>
        </div>
      </section>

      {/* ─── 11. PURCHASE BLOCK ────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24" data-testid="nervatura-purchase">
        <div className="max-w-[960px] mx-auto px-6 md:px-8 text-center space-y-10">
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

          {/* Tier cards — Cartier style */}
          <div>
            <p className="nervatura-cinzel text-[10px] tracking-[0.4em] text-white/45 mb-6">
              SELECT YOUR TIER
            </p>

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 text-left"
              data-testid="nervatura-tier-cards"
            >
              {tierOrder.map(({ key }) => {
                const tier = product.tiers[key];
                const isSelected = selectedTier === key;
                const livePriceFormatted = tierPrices[key]?.formatted;
                const basePriceFormatted = `$${product.pricing[key].toLocaleString("en-CA")} CAD`;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTier(key)}
                    data-testid={`nervatura-tier-${key}-btn`}
                    aria-pressed={isSelected}
                    aria-label={`${tier.name} — ${tier.metal}`}
                    className={`
                      relative rounded-2xl border bg-transparent
                      transition-all duration-500 ease-out
                      px-5 md:px-6 py-6 md:py-7
                      text-left w-full
                      ${isSelected
                        ? "border-[#C6A86B] bg-[#C6A86B]/[0.06] shadow-[inset_0_0_0_1px_rgba(198,168,107,0.18)]"
                        : "border-white/20 hover:border-[#C6A86B] hover:bg-[#C6A86B]/[0.04]"}
                    `}
                  >
                    {/* Badge */}
                    {tier.badge ? (
                      <span
                        className="
                          absolute top-4 right-4
                          bg-black text-white uppercase
                          tracking-[0.18em] rounded-full
                          text-[9px] px-2 py-1
                        "
                      >
                        {tier.badge}
                      </span>
                    ) : null}

                    {/* Name */}
                    <p
                      className={`
                        nervatura-cinzel text-[14px] md:text-[15px] tracking-[0.22em]
                        transition-colors duration-500 ease-out
                        ${isSelected ? "text-white" : "text-white/80"}
                      `}
                    >
                      {tier.name.toUpperCase()}
                    </p>

                    {/* Metal */}
                    <p
                      className={`
                        nervatura-cormorant text-sm mt-1
                        transition-colors duration-500 ease-out
                        ${isSelected ? "text-white/80" : "text-white/55"}
                      `}
                    >
                      {tier.metal}
                    </p>

                    {/* Descriptor */}
                    <p
                      className={`
                        nervatura-cormorant italic text-[15px] mt-4
                        transition-colors duration-500 ease-out
                        ${isSelected ? "text-white/80" : "text-white/55"}
                      `}
                    >
                      {tier.description}
                    </p>

                    {/* Price */}
                    <p
                      className={`
                        nervatura-cinzel text-[16px] md:text-[17px] mt-5
                        tracking-[0.05em]
                        transition-colors duration-500 ease-out
                        ${isSelected ? "text-white" : "text-white/70"}
                      `}
                    >
                      {livePriceFormatted ? `${livePriceFormatted} CAD` : basePriceFormatted}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live price (selected) */}
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

      {/* ─── 6. SPECIFICATIONS ─── REMOVED (moved up to section 9) ─── */}

      {/* ─── 12. FINAL STATEMENT ────────────────────────────────────── */}
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
              "Built, not made."
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
