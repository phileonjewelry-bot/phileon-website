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
  const heroVideoRef = useRef(null);

  const [selectedTier, setSelectedTier] = useState(product.defaultTier || "signature");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Belt-and-suspenders loop watcher for the hero video.
  // Some browsers (especially Safari/iOS, and Chrome under certain HW codec paths)
  // can stall on the loop boundary when the native `loop` attribute alone is used.
  // We force-restart playback both on `ended` (handled inline on the element) and
  // proactively just before the duration boundary via `timeupdate`.
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;

    const onTimeUpdate = () => {
      if (!isFinite(v.duration) || v.duration === 0) return;
      // Restart slightly before the absolute end to avoid the stall window.
      if (v.duration - v.currentTime < 0.15) {
        v.currentTime = 0;
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
    };

    const onEnded = () => {
      v.currentTime = 0;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const onPause = () => {
      // If the page is still visible and the video paused unexpectedly (loop
      // boundary stall), kick it back into play.
      if (!document.hidden && !v.ended) {
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
    };

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);
    v.addEventListener("pause", onPause);
    // Try to start playback immediately on mount (covers cases where autoplay
    // didn't fire because the element was off-screen during initial layout).
    const initialPlay = v.play();
    if (initialPlay && typeof initialPlay.catch === "function") {
      initialPlay.catch(() => {});
    }

    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("pause", onPause);
    };
  }, []);

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
          key="nervatura-hero-video"
          ref={heroVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/r9udxjr3_XiaoYing_Video_1777699475543_1080HD.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/acj6mi7n_1000148370.jpg"
          onEnded={(e) => {
            e.currentTarget.currentTime = 0;
            e.currentTarget.play().catch(() => {});
          }}
          data-testid="nervatura-hero-video-el"
        />


        {/* Bottom gradient for text readability */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/40 to-transparent" />

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
              className="text-white italic tracking-wide text-sm mt-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              data-testid="nervatura-subline"
            >
              Status has a structure.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. HORIZONTAL GALLERY ─────────────────────────────────── */}
      <section
        className="w-full bg-black py-8 md:py-12"
        data-testid="nervatura-gallery"
      >
        <div
          className="
            flex overflow-x-auto gap-3 md:gap-4 px-4 md:px-10 pb-4
            snap-x snap-mandatory
            scrollbar-thin
          "
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(198,168,107,0.4) transparent",
          }}
        >
          {(product.gallery || []).map((img, i) => (
            <div
              key={img.src}
              className="
                relative flex-shrink-0
                snap-center
                w-[78vw] sm:w-[52vw] md:w-[32vw] lg:w-[26vw]
                aspect-[3/4]
                bg-black overflow-hidden
              "
              data-testid={`nervatura-gallery-item-${i}`}
            >
              <img
                src={img.src}
                alt={img.alt || `The Phileon Nervatura — view ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. PURCHASE BLOCK ─────────────────────────────────────── */}
      <section className="w-full py-14 md:py-20" data-testid="nervatura-purchase">
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
                    {tier.badge ? (
                      <span className="absolute top-4 right-4 bg-black text-white uppercase tracking-[0.18em] rounded-full text-[9px] px-2 py-1">
                        {tier.badge}
                      </span>
                    ) : null}

                    <p
                      className={`
                        nervatura-cinzel text-[14px] md:text-[15px] tracking-[0.22em]
                        transition-colors duration-500 ease-out
                        ${isSelected ? "text-white" : "text-white/80"}
                      `}
                    >
                      {tier.name.toUpperCase()}
                    </p>

                    <p
                      className={`
                        nervatura-cormorant text-sm mt-1
                        transition-colors duration-500 ease-out
                        ${isSelected ? "text-white/80" : "text-white/55"}
                      `}
                    >
                      {tier.metal}
                    </p>

                    <p
                      className={`
                        nervatura-cormorant italic text-[15px] mt-4
                        transition-colors duration-500 ease-out
                        ${isSelected ? "text-white/80" : "text-white/55"}
                      `}
                    >
                      {tier.description}
                    </p>

                    <p
                      className={`
                        nervatura-cinzel text-[16px] md:text-[17px] mt-5 tracking-[0.05em]
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
            data-testid="nervatura-add-to-cart-btn"
            className="
              nervatura-cinzel inline-block px-14 py-5
              bg-transparent border border-[#C6A86B] text-[#C6A86B]
              tracking-[0.3em] text-[12px]
              hover:bg-[#C6A86B] hover:text-black
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-500
            "
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
          </button>

          <p className="nervatura-cormorant text-sm text-white/45 italic">
            Made to order · 3–4 weeks · Complimentary insured shipping
          </p>
        </div>
      </section>

      {/* ─── 4. COMPACT EDITORIAL ──────────────────────────────────── */}
      <section
        className="w-full py-16 md:py-20"
        data-testid="nervatura-editorial"
      >
        <div className="max-w-[640px] mx-auto px-6 text-center">
          <FadeInOnScroll>
            <p
              className="nervatura-cormorant italic text-xl md:text-2xl text-white/80 leading-[1.6]"
              data-testid="nervatura-editorial-line-1"
            >
              Controlled curvature. Continuous structure.
            </p>
            <p
              className="nervatura-cormorant italic text-lg md:text-xl text-white/55 leading-[1.6] mt-4"
              data-testid="nervatura-editorial-line-2"
            >
              Form is not imposed. It is resolved.
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ─── 5. SPECIFICATIONS (compact) ───────────────────────────── */}
      <section
        className="w-full py-16 md:py-20"
        data-testid="nervatura-specifications"
      >
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <FadeInOnScroll>
            <p
              className="nervatura-cinzel text-[11px] tracking-[0.4em] text-center text-white/55 mb-10"
              data-testid="nervatura-spec-section-title"
            >
              SPECIFICATIONS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              {SPECIFICATIONS.map((spec, i) => (
                <div
                  key={spec.label}
                  className="text-center md:text-left"
                  data-testid={`nervatura-spec-col-${i}`}
                >
                  <div
                    aria-hidden
                    className="h-px w-10 mx-auto md:mx-0 mb-4"
                    style={{ backgroundColor: "rgba(198, 168, 107, 0.4)" }}
                  />
                  <p
                    className="nervatura-cinzel text-[11px] tracking-[0.35em] text-[#C6A86B] mb-4"
                    data-testid={`nervatura-spec-label-${i}`}
                  >
                    {spec.label}
                  </p>
                  <div className="nervatura-cormorant text-[16px] md:text-[17px] leading-[1.55] text-white/70 space-y-1">
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

      {/* ─── 6. PACKAGING (optional) ───────────────────────────────── */}
      <section
        className="w-full bg-black py-16 md:py-20"
        data-testid="nervatura-packaging"
      >
        <div className="w-full flex justify-center px-3 md:px-6">
          <FadeInOnScroll className="w-full max-w-[720px]">
            <img
              src={IMG_PACKAGING}
              alt="The Phileon Nervatura — in the presentation box"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
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
