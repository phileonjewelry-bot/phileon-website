import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import { useLivePrice } from "@/hooks/useLivePrice";

// Stable, scoped utility for Don Gorgon pricing key shape
const buildSkuKey = (metal, tier, variant) => `${metal}_${tier}_${variant}`;

// Compute the locked base price for the current selection
function getLockedPrice(product, metal, tier, variant) {
  const baseTier = product.metals[metal]?.tiers?.[tier];
  if (!baseTier) return 0;
  const adj = product.variants[variant]?.adjustment || 0;
  return baseTier.price + adj;
}

export default function DonGorgonPage() {
  const product = products.theDonGorgon;
  const heroRef = useRef(null);
  const dualHeroRef = useRef(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const defaults = product.defaultSelection;
  const [variant, setVariant] = useState(defaults.variant);
  const [metal, setMetal] = useState(defaults.metal);
  const [tier, setTier] = useState(defaults.tier);

  // If user switches to silver, lock tier to foundation (silver only has one tier)
  useEffect(() => {
    if (metal === "silver" && tier !== "foundation") {
      setTier("foundation");
    }
  }, [metal, tier]);

  const skuKey = buildSkuKey(metal, tier, variant);
  const lockedPrice = getLockedPrice(product, metal, tier, variant);
  const { formatted: ctaPrice, price: ctaPriceNum } = useLivePrice("theDonGorgon", skuKey, lockedPrice);

  const onAddToCart = () => {
    const variantObj = product.variants[variant];
    const tierObj = product.metals[metal].tiers[tier];
    handleAddToCart({
      id: `theDonGorgon-${skuKey}`,
      name: `The Don Gorgon — ${variantObj.name} (${product.metals[metal].name} · ${tierObj.name})`,
      price: ctaPriceNum || lockedPrice,
      productKey: "theDonGorgon",
      tierKey: skuKey,
      metal: product.metals[metal].name,
      variant: variantObj.name,
      quantity: 1,
      image: product.gallery[variant][0]?.src,
    });
  };

  const variantGallery = product.gallery[variant] || [];
  const variantObj = product.variants[variant];
  const metalObj = product.metals[metal];
  const tierObj = metalObj?.tiers?.[tier];

  // Hero — video if provided, otherwise poster image
  const hasHeroVideo = !!product.hero?.videoSrc;

  // ─── Hero loop watcher (only when video) ─────────────────────────
  useEffect(() => {
    if (!hasHeroVideo) return;
    const v = heroRef.current;
    if (!v) return;
    const onTimeUpdate = () => {
      if (!isFinite(v.duration) || v.duration === 0) return;
      if (v.duration - v.currentTime < 0.15) {
        v.currentTime = 0;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      }
    };
    const onEnded = () => {
      v.currentTime = 0;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    };
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);
    const initial = v.play();
    if (initial && initial.catch) initial.catch(() => {});
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
    };
  }, [hasHeroVideo]);

  // ─── Dual-state video hero loop watcher (always present) ────────
  useEffect(() => {
    const v = dualHeroRef.current;
    if (!v) return;
    const onTimeUpdate = () => {
      if (!isFinite(v.duration) || v.duration === 0) return;
      if (v.duration - v.currentTime < 0.15) {
        v.currentTime = 0;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      }
    };
    const onEnded = () => {
      v.currentTime = 0;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    };
    const onPause = () => {
      // Defensive: some browsers (iOS Safari) pause autoplaying video on
      // visibility change. Resume silently when we regain focus.
      if (document.visibilityState === "visible") {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      }
    };
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);
    v.addEventListener("pause", onPause);
    const initial = v.play();
    if (initial && initial.catch) initial.catch(() => {});
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  // ─── Section fade-up + gallery active detection ─────────────────
  useEffect(() => {
    const sections = document.querySelectorAll("[data-dg-motion]");
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.18 }
    );
    sections.forEach((el) => sectionObserver.observe(el));

    const galleryRoot = document.querySelector("[data-dg-gallery-scroller]");
    const galleryItems = document.querySelectorAll(".dg-gallery-item");
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
      sectionObserver.disconnect();
      galleryObserver.disconnect();
    };
  }, [variant]);

  // Compute effective price summary line for each metal (for the metal selector cards)
  const silverFromPrice = useMemo(
    () => getLockedPrice(product, "silver", "foundation", variant),
    [product, variant]
  );
  const goldFromPrice = useMemo(
    () => getLockedPrice(product, "gold", "foundation", variant),
    [product, variant]
  );

  return (
    <div className="min-h-screen bg-black text-white" data-testid="don-gorgon-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        .dg-cinzel { font-family: 'Cinzel', serif; letter-spacing: 0.08em; }
        .dg-cormorant { font-family: 'Cormorant Garamond', serif; }

        /* ─── Luxury pacing system (scoped to Don Gorgon page) ─── */
        .dg-ease { transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }

        /* 1. Hero drift — barely-noticeable cinematic zoom */
        @keyframes dgHeroDrift {
          from { transform: scale(1) translateY(0); }
          to   { transform: scale(1.04) translateY(-8px); }
        }
        .dg-hero-media {
          transform-origin: center center;
          animation: dgHeroDrift 16s ease-in-out infinite alternate;
          will-change: transform;
        }

        /* 2. Hero text reveal */
        @keyframes dgTextReveal {
          to { opacity: 1; transform: translateY(0); }
        }
        .dg-hero-copy > * {
          opacity: 0;
          transform: translateY(10px);
          animation: dgTextReveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .dg-hero-copy > *:nth-child(1) { animation-delay: 0.20s; }
        .dg-hero-copy > *:nth-child(2) { animation-delay: 0.45s; }
        .dg-hero-copy > *:nth-child(3) { animation-delay: 0.75s; }

        /* 3. Variant image — "light change" feel (opacity + filter + micro scale) */
        .dg-variant-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition:
            opacity 650ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 650ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .dg-variant-image.is-active { opacity: 1; transform: scale(1); filter: brightness(1) contrast(1); }
        .dg-variant-image.is-inactive { opacity: 0; transform: scale(1.015); filter: brightness(0.85) contrast(1.08); }
        /* HOME active: darker & heavier. AWAY active: cleaner & brighter. */
        .dg-variant-image.is-active[data-variant="home"] { filter: brightness(0.98) contrast(1.05); }
        .dg-variant-image.is-active[data-variant="away"] { filter: brightness(1.02) contrast(1.0); }

        /* 4. Gallery momentum */
        .dg-gallery-item {
          scroll-snap-align: center;
          opacity: 0.55;
          transform: scale(0.96);
          filter: brightness(0.75);
          transition:
            opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .dg-gallery-item.is-active {
          opacity: 1;
          transform: scale(1);
          filter: brightness(1);
        }

        /* 6. Ruby-rail glint — subtle, 6.5s cadence, only applied to ruby-macro slot */
        @keyframes dgRubySweep {
          0%   { transform: translateX(-120%); }
          35%  { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }
        .dg-ruby-glint { position: relative; overflow: hidden; }
        .dg-ruby-glint::after {
          content: "";
          position: absolute; inset: 0;
          transform: translateX(-120%);
          background: linear-gradient(
            110deg,
            transparent 0%,
            rgba(255,255,255,0.08) 42%,
            rgba(255,255,255,0.32) 50%,
            rgba(255,255,255,0.08) 58%,
            transparent 100%
          );
          animation: dgRubySweep 6.5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          pointer-events: none;
        }

        /* 7. Section pacing — fade-up on intersect */
        .dg-motion-section {
          opacity: 0;
          transform: translateY(26px);
          transition:
            opacity 1000ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 1000ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .dg-motion-section.is-visible { opacity: 1; transform: translateY(0); }

        /* 9. Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .dg-hero-media,
          .dg-hero-copy > *,
          .dg-variant-image,
          .dg-gallery-item,
          .dg-ruby-glint::after,
          .dg-motion-section {
            animation: none !important;
            transition-duration: 0.001ms !important;
          }
          .dg-hero-copy > * { opacity: 1 !important; transform: none !important; }
          .dg-motion-section { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* ─── 0. DUAL-STATE VIDEO HERO (sits above the variant hero) ── */}
      <section
        className="relative w-full bg-black overflow-hidden"
        style={{ height: "92vh", minHeight: "320px" }}
        data-testid="don-gorgon-dual-hero"
      >
        <video
          key="don-gorgon-dual-hero-video"
          ref={dualHeroRef}
          className="dg-hero-media absolute inset-0 w-full h-full object-cover"
          src="/videos/the-don-gorgon-dual-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/don-gorgon/home/01_hero.png"
          onEnded={(e) => {
            e.currentTarget.currentTime = 0;
            e.currentTarget.play().catch(() => {});
          }}
          data-testid="don-gorgon-dual-hero-video-el"
          style={{
            // mobile height override
            height: "100%",
          }}
        />

        {/* mobile height tweak (86vh) handled via CSS variable below */}
        <style>{`
          @media (max-width: 767px) {
            [data-testid="don-gorgon-dual-hero"] { height: 86vh !important; }
          }
        `}</style>

        {/* Bottom gradient for text readability */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent" />

        <Link
          to="/shop?category=rings"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/55 text-[11px] tracking-[0.3em] hover:text-[#C6A86B] transition-colors"
          data-testid="don-gorgon-dual-hero-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO RINGS</span>
        </Link>

        <div className="relative z-10 h-full flex items-center justify-center px-6 text-center text-white">
          <div className="dg-hero-copy">
            <p className="dg-cinzel text-[10px] md:text-[11px] tracking-[0.45em] text-white/75 mb-5">
              PHILEON
            </p>
            <h1
              className="dg-cinzel text-3xl md:text-5xl text-white"
              style={{ letterSpacing: "0.14em" }}
              data-testid="don-gorgon-dual-hero-title"
            >
              THE DON GORGON
            </h1>
            <p
              className="text-white italic tracking-wide text-sm mt-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              data-testid="don-gorgon-dual-hero-subline"
            >
              Two sides of the same authority.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 1. HERO ───────────────────────────────────────────────── */}
      <section
        className="relative w-full h-[92vh] bg-black overflow-hidden"
        data-testid="don-gorgon-hero"
      >
        {hasHeroVideo ? (
          <video
            key="don-gorgon-hero-video"
            ref={heroRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={product.hero.videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={product.hero.poster}
            onEnded={(e) => {
              e.currentTarget.currentTime = 0;
              e.currentTarget.play().catch(() => {});
            }}
            data-testid="don-gorgon-hero-video-el"
          />
        ) : (
          <div className="dg-hero-media absolute inset-0">
            {/* Crossfade + filter shift: HOME (black) ⇄ AWAY (white) */}
            <img
              src={product.gallery.home[0]?.src}
              alt="The Don Gorgon — HOME (black pavé)"
              data-testid="don-gorgon-hero-img-home"
              data-variant="home"
              className={`dg-variant-image ${variant === "home" ? "is-active" : "is-inactive"}`}
            />
            <img
              src={product.gallery.away[0]?.src}
              alt="The Don Gorgon — AWAY (white pavé)"
              data-testid="don-gorgon-hero-img-away"
              data-variant="away"
              className={`dg-variant-image ${variant === "away" ? "is-active" : "is-inactive"}`}
            />
          </div>
        )}

        {/* Bottom gradient for text readability */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/55 to-transparent" />
        {/* Light vignette around overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent" />

        <div className="relative z-10 h-full flex items-center justify-center px-6 text-center text-white">
          <div className="dg-hero-copy">
            <p className="dg-cinzel text-[10px] md:text-[11px] tracking-[0.45em] text-white/75 mb-5">
              {product.heroText.eyebrow}
            </p>
            <h1
              className="dg-cinzel text-3xl md:text-5xl text-white"
              style={{ letterSpacing: "0.14em" }}
              data-testid="don-gorgon-title"
            >
              {product.heroText.title}
            </h1>
            <p
              className="text-white italic tracking-wide text-sm mt-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              data-testid="don-gorgon-subline"
            >
              {product.heroText.subline}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. PURCHASE BLOCK (progressive flow) ──────────────────── */}
      <section className="dg-motion-section w-full py-14 md:py-20" data-dg-motion data-testid="don-gorgon-purchase">
        <div className="max-w-[960px] mx-auto px-6 md:px-8 space-y-12">
          <div className="text-center">
            <h2
              className="dg-cinzel text-2xl md:text-3xl text-white"
              style={{ letterSpacing: "0.18em" }}
              data-testid="don-gorgon-purchase-title"
            >
              THE DON GORGON
            </h2>
            <p className="dg-cormorant italic text-base md:text-lg text-white/65 mt-3">
              {product.subtitle}
            </p>
          </div>

          {/* STEP 1 — VARIANT */}
          <div data-testid="don-gorgon-step-variant">
            <p className="dg-cinzel text-[10px] tracking-[0.4em] text-white/45 mb-5 text-center">
              STEP 1 · CHOOSE YOUR SIDE
            </p>
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              {Object.values(product.variants).map((v) => {
                const isSel = variant === v.key;
                return (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setVariant(v.key)}
                    aria-pressed={isSel}
                    data-testid={`don-gorgon-variant-${v.key}-btn`}
                    className={`
                      relative rounded-2xl border bg-transparent
                      transition-all duration-500 ease-out
                      px-5 md:px-6 py-7 md:py-8 text-left
                      ${isSel
                        ? "border-[#C6A86B] bg-[#C6A86B]/[0.06] shadow-[inset_0_0_0_1px_rgba(198,168,107,0.18)]"
                        : "border-white/20 hover:border-[#C6A86B] hover:bg-[#C6A86B]/[0.04]"}
                    `}
                  >
                    <p className={`dg-cinzel text-[15px] md:text-[16px] tracking-[0.22em] ${isSel ? "text-white" : "text-white/80"}`}>
                      {v.name}
                    </p>
                    <p className={`dg-cormorant text-sm mt-1 ${isSel ? "text-white/75" : "text-white/55"}`}>
                      {v.label}
                    </p>
                    <p className={`dg-cormorant italic text-[15px] mt-3 ${isSel ? "text-white/85" : "text-white/55"}`}>
                      {v.description}
                    </p>
                    {v.adjustment > 0 && (
                      <p className="dg-cormorant text-xs text-[#C6A86B]/80 mt-3">
                        +${v.adjustment.toLocaleString("en-CA")} CAD
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2 — METAL */}
          <div data-testid="don-gorgon-step-metal">
            <p className="dg-cinzel text-[10px] tracking-[0.4em] text-white/45 mb-5 text-center">
              STEP 2 · SELECT METAL
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {Object.values(product.metals).map((m) => {
                const isSel = metal === m.key;
                const fromPrice = m.key === "silver" ? silverFromPrice : goldFromPrice;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMetal(m.key)}
                    aria-pressed={isSel}
                    data-testid={`don-gorgon-metal-${m.key}-btn`}
                    className={`
                      relative rounded-2xl border bg-transparent
                      transition-all duration-500 ease-out
                      px-5 md:px-6 py-6 md:py-7 text-left
                      ${isSel
                        ? "border-[#C6A86B] bg-[#C6A86B]/[0.06] shadow-[inset_0_0_0_1px_rgba(198,168,107,0.18)]"
                        : "border-white/20 hover:border-[#C6A86B] hover:bg-[#C6A86B]/[0.04]"}
                    `}
                  >
                    <p className={`dg-cinzel text-[14px] md:text-[15px] tracking-[0.22em] ${isSel ? "text-white" : "text-white/80"}`}>
                      {m.name.toUpperCase()}
                    </p>
                    {m.note ? (
                      <p className={`dg-cormorant italic text-[14px] mt-2 ${isSel ? "text-white/75" : "text-white/55"}`}>
                        {m.note}
                      </p>
                    ) : null}
                    <p className={`dg-cormorant text-sm mt-3 ${isSel ? "text-white/80" : "text-white/55"}`}>
                      From ${fromPrice.toLocaleString("en-CA")} CAD
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3 — TIER (only when gold) */}
          {metal === "gold" && (
            <div data-testid="don-gorgon-step-tier">
              <p className="dg-cinzel text-[10px] tracking-[0.4em] text-white/45 mb-5 text-center">
                STEP 3 · SELECT TIER
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {Object.values(product.metals.gold.tiers).map((t) => {
                  const isSel = tier === t.key;
                  const isFoundation = t.key === "foundation";
                  const isHeirloom = t.key === "heirloom";
                  const adj = product.variants[variant]?.adjustment || 0;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTier(t.key)}
                      aria-pressed={isSel}
                      data-testid={`don-gorgon-tier-${t.key}-btn`}
                      className={`
                        relative rounded-2xl border bg-transparent
                        transition-all duration-500 ease-out
                        px-5 md:px-6 py-6 md:py-7 text-left
                        ${isSel
                          ? "border-[#C6A86B] bg-[#C6A86B]/[0.06] shadow-[inset_0_0_0_1px_rgba(198,168,107,0.18)]"
                          : "border-white/20 hover:border-[#C6A86B] hover:bg-[#C6A86B]/[0.04]"}
                      `}
                    >
                      {isFoundation && (
                        <span className="absolute top-4 right-4 bg-black text-white uppercase tracking-[0.18em] rounded-full text-[9px] px-2 py-1">
                          Most Chosen
                        </span>
                      )}
                      {isHeirloom && (
                        <span className="absolute top-4 right-4 bg-black text-white uppercase tracking-[0.18em] rounded-full text-[9px] px-2 py-1">
                          Collector
                        </span>
                      )}
                      <p className={`dg-cinzel text-[14px] md:text-[15px] tracking-[0.22em] ${isSel ? "text-white" : "text-white/80"}`}>
                        {t.name.toUpperCase()}
                      </p>
                      <p className={`dg-cormorant italic text-[14px] mt-3 ${isSel ? "text-white/80" : "text-white/55"}`}>
                        {t.description}
                      </p>
                      <p className={`dg-cinzel text-[16px] mt-5 ${isSel ? "text-white" : "text-white/70"}`}>
                        ${(t.price + adj).toLocaleString("en-CA")} CAD
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUMMARY + LIVE PRICE + CTA */}
          <div className="text-center pt-6 space-y-7">
            <div>
              <p className="dg-cinzel text-[10px] tracking-[0.35em] text-white/55">
                {variantObj.name} · {metalObj.name.toUpperCase()} · {tierObj?.name?.toUpperCase()}
              </p>
              <p
                className="dg-cinzel text-3xl md:text-4xl text-white mt-3"
                style={{ letterSpacing: "0.06em" }}
                data-testid="don-gorgon-price"
              >
                {ctaPrice} CAD
              </p>
              <p className="text-[10px] tracking-[0.25em] text-white/35 mt-2">
                PRICE ADJUSTS WITH THE LIVE METALS MARKET
              </p>
            </div>

            <button
              onClick={onAddToCart}
              disabled={isAdding}
              data-testid="don-gorgon-add-to-cart-btn"
              className="
                dg-cinzel inline-block px-14 py-5
                bg-transparent border border-[#C6A86B] text-[#C6A86B]
                tracking-[0.3em] text-[12px]
                hover:bg-[#C6A86B] hover:text-black
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors duration-500
              "
            >
              {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
            </button>

            <p className="dg-cormorant text-sm text-white/45 italic">
              Made to order · 3–4 weeks · Complimentary insured shipping
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. GALLERY (per-variant with crossfade on first slot) ── */}
      <section
        className="dg-motion-section w-full bg-black py-8 md:py-12"
        data-dg-motion
        data-testid="don-gorgon-gallery"
      >
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
          data-dg-gallery-scroller
        >
          {/* First slot: layered HOME + AWAY with light-change crossfade */}
          <div
            className="
              dg-gallery-item
              relative flex-shrink-0
              w-[78vw] sm:w-[52vw] md:w-[36vw] lg:w-[30vw]
              aspect-square bg-black overflow-hidden
            "
            data-testid="don-gorgon-gallery-item-0"
          >
            <img
              src={product.gallery.home[0]?.src}
              alt={product.gallery.home[0]?.alt || "The Don Gorgon — HOME"}
              data-testid="don-gorgon-gallery-img-home"
              data-variant="home"
              className={`dg-variant-image ${variant === "home" ? "is-active" : "is-inactive"}`}
              loading="lazy"
            />
            <img
              src={product.gallery.away[0]?.src}
              alt={product.gallery.away[0]?.alt || "The Don Gorgon — AWAY"}
              data-testid="don-gorgon-gallery-img-away"
              data-variant="away"
              className={`dg-variant-image ${variant === "away" ? "is-active" : "is-inactive"}`}
              loading="lazy"
            />
          </div>

          {/* Remaining slots: additional per-variant imagery (index >= 1) */}
          {variantGallery.slice(1).map((img, i) => {
            const altLower = (img.alt || "").toLowerCase();
            const isRubyMacro = altLower.includes("ruby rail") || altLower.includes("macro, ruby");
            return (
              <div
                key={img.src}
                className={`
                  dg-gallery-item
                  relative flex-shrink-0
                  w-[78vw] sm:w-[52vw] md:w-[36vw] lg:w-[30vw]
                  aspect-square bg-black overflow-hidden
                  ${isRubyMacro ? "dg-ruby-glint" : ""}
                `}
                data-testid={`don-gorgon-gallery-item-${i + 1}`}
              >
                <img
                  src={img.src}
                  alt={img.alt || `The Don Gorgon — ${variantObj.name} view ${i + 2}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            );
          })}

          {/* "Additional imagery coming soon" helper when only one photo per variant */}
          {variantGallery.length === 1 && (
            <div className="flex-shrink-0 self-center px-6 max-w-[280px] dg-cormorant italic text-sm text-white/45 text-center">
              Additional {variantObj.name.toLowerCase()} imagery coming soon.
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. COMPACT EDITORIAL ──────────────────────────────────── */}
      <section className="dg-motion-section w-full py-16 md:py-20" data-dg-motion data-testid="don-gorgon-editorial">
        <div className="max-w-[640px] mx-auto px-6 text-center">
          <p className="dg-cormorant italic text-xl md:text-2xl text-white/80 leading-[1.6]">
            One form. Two states.
          </p>
          <p className="dg-cormorant italic text-lg md:text-xl text-white/55 leading-[1.6] mt-4">
            Authority is not a moment. It is a choice, made twice.
          </p>
        </div>
      </section>

      {/* ─── 5. SPECIFICATIONS ─────────────────────────────────────── */}
      <section className="dg-motion-section w-full py-16 md:py-20" data-dg-motion data-testid="don-gorgon-specifications">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <p className="dg-cinzel text-[11px] tracking-[0.4em] text-center text-white/55 mb-10">
            SPECIFICATIONS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {[
              { label: "FORM", lines: ["3/4 pavé structure.", "Wide band.", "Domed crown."] },
              { label: "STONES", lines: ["12-stone ruby rail.", "Pavé pattern across face.", "Black diamonds (HOME).", "White diamonds (AWAY)."] },
              { label: "METALS", lines: ["925 silver (White Series).", "10K / 14K / 18K gold.", "Made to order."] },
            ].map((spec) => (
              <div key={spec.label} className="text-center md:text-left">
                <div
                  aria-hidden
                  className="h-px w-10 mx-auto md:mx-0 mb-4"
                  style={{ backgroundColor: "rgba(198, 168, 107, 0.4)" }}
                />
                <p className="dg-cinzel text-[11px] tracking-[0.35em] text-[#C6A86B] mb-4">
                  {spec.label}
                </p>
                <div className="dg-cormorant text-[16px] md:text-[17px] leading-[1.55] text-white/70 space-y-1">
                  {spec.lines.map((ln, li) => (
                    <p key={li}>{ln}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. FINAL STATEMENT ────────────────────────────────────── */}
      <section className="dg-motion-section w-full py-32 md:py-44" data-dg-motion data-testid="don-gorgon-final-statement">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <p
            className="dg-cormorant italic text-3xl md:text-5xl text-white/85 leading-[1.4]"
            data-testid="don-gorgon-final-line"
          >
            "Choose your side."
          </p>
          <p className="dg-cinzel text-[10px] tracking-[0.4em] text-white/30 mt-12">
            THE DON GORGON — PHILEON
          </p>
        </div>
      </section>
    </div>
  );
}
