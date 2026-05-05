import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { useAddToCart } from "../hooks/useAddToCart";

export default function GrandDamePage() {
  const product = products.theGrandDame;
  const heroVideoRef = useRef(null);
  const hasHeroVideo = !!product.hero?.videoSrc;
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const [metal, setMetal] = useState(product.defaultSelection.metal);
  const [tier, setTier] = useState(product.defaultSelection.tier);

  const metalObj = product.metals[metal];
  const tierObj = metalObj?.tiers?.[tier];
  const price = tierObj?.price || 0;
  const formattedPrice = `$${price.toLocaleString("en-US")} USD`;

  const onAddToCart = () => {
    handleAddToCart({
      id: `theGrandDame-${metal}-${tier}`,
      name: `The Grand Dame Cuff — ${metalObj.name} · ${tierObj.name}`,
      price,
      productKey: "theGrandDame",
      tierKey: `${metal}_${tier}`,
      metal: metalObj.name,
      quantity: 1,
      image: product.gallery[0]?.src,
    });
  };

  // Hero video loop watcher (triple-redundant: timeupdate near-end + ended + pause-resume on visibility)
  useEffect(() => {
    if (!hasHeroVideo) return;
    const v = heroVideoRef.current;
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
  }, [hasHeroVideo]);

  // IntersectionObserver — fades in .gd-reveal / .gd-section + gallery active state
  useEffect(() => {
    const revealEls = document.querySelectorAll(".gd-reveal, .gd-section");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.18 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    const galleryRoot = document.querySelector("[data-gd-gallery-scroller]");
    const galleryItems = document.querySelectorAll(".gd-gallery-item");
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
    <div className="min-h-screen bg-black text-white" data-testid="grand-dame-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        .gd-cinzel { font-family: 'Cinzel', serif; letter-spacing: 0.08em; }
        .gd-cormorant { font-family: 'Cormorant Garamond', serif; }

        @keyframes gdHeroDrift {
          from { transform: scale(1) translateY(0); }
          to   { transform: scale(1.04) translateY(-8px); }
        }
        .gd-hero-media {
          transform-origin: center center;
          animation: gdHeroDrift 16s ease-in-out infinite alternate;
          will-change: transform;
        }
        /* When the hero is a video, no scale drift — let the footage breathe */
        video.gd-hero-media { animation: none; }

        .gd-reveal {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gd-reveal.visible { opacity: 1; transform: translateY(0); }
        .gd-delay-1 { transition-delay: 0.2s; }
        .gd-delay-2 { transition-delay: 0.5s; }
        .gd-delay-3 { transition-delay: 0.8s; }

        .gd-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gd-section.visible { opacity: 1; transform: translateY(0); }

        .gd-gallery-item {
          scroll-snap-align: center;
          opacity: 0.55;
          transform: scale(0.96);
          filter: brightness(0.75);
          transition:
            opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gd-gallery-item.is-active { opacity: 1; transform: scale(1); filter: brightness(1); }

        @media (max-width: 767px) {
          [data-testid="grand-dame-hero"] { height: 86vh !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .gd-hero-media, .gd-reveal, .gd-section, .gd-gallery-item {
            animation: none !important;
            transition-duration: 0.001ms !important;
          }
          .gd-reveal, .gd-section { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative w-full bg-black overflow-hidden gd-hero"
        style={{ height: "90vh", minHeight: "320px" }}
        data-testid="grand-dame-hero"
      >
        {hasHeroVideo ? (
          <video
            key="gd-hero-video"
            ref={heroVideoRef}
            className="gd-hero-video gd-hero-media absolute inset-0 w-full h-full object-cover"
            src={product.hero.videoSrc}
            poster={product.hero.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onEnded={(e) => {
              e.currentTarget.currentTime = 0;
              e.currentTarget.play().catch(() => {});
            }}
            data-testid="grand-dame-hero-video"
            style={{ filter: "brightness(0.9) contrast(1.05)" }}
          />
        ) : (
          <img
            src={product.hero.poster}
            alt="The Grand Dame — cinematic hero"
            className="gd-hero-media absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Bottom-left text-readability gradient (video amplifies it) */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent" />

        <Link
          to="/shop?category=bracelets"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/55 text-[11px] tracking-[0.3em] hover:text-[#C6A86B] transition-colors"
          data-testid="grand-dame-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO BRACELETS</span>
        </Link>

        {hasHeroVideo ? (
          /* Bottom-left overlay (per video hero spec) */
          <div
            className="gd-hero-overlay absolute z-10 text-white"
            style={{ bottom: "8%", left: "6%" }}
          >
            <p className="gd-reveal gd-delay-1 gd-cinzel text-[10px] md:text-[11px] tracking-[0.45em] text-white/70 mb-3">
              {product.heroText.eyebrow}
            </p>
            <h1
              className="gd-reveal gd-delay-2 gd-cinzel text-2xl md:text-[2.2rem] text-white font-normal"
              style={{ letterSpacing: "0.12em" }}
              data-testid="grand-dame-title"
            >
              {product.heroText.title}
            </h1>
            <p
              className="gd-reveal gd-delay-3 text-white/70 mt-2 text-[0.95rem]"
              style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.08em" }}
              data-testid="grand-dame-subline"
            >
              {product.heroText.subline}
            </p>
          </div>
        ) : (
          /* Centered overlay (still hero fallback) */
          <div className="relative z-10 h-full flex items-center justify-center px-6 text-center text-white">
            <div>
              <p className="gd-reveal gd-delay-1 gd-cinzel text-[10px] md:text-[11px] tracking-[0.45em] text-white/75 mb-5">
                {product.heroText.eyebrow}
              </p>
              <h1
                className="gd-reveal gd-delay-2 gd-cinzel text-3xl md:text-5xl text-white"
                style={{ letterSpacing: "0.14em" }}
                data-testid="grand-dame-title"
              >
                {product.heroText.title}
              </h1>
              <p
                className="gd-reveal gd-delay-3 text-white italic tracking-wide text-sm mt-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                data-testid="grand-dame-subline"
              >
                {product.heroText.subline}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ─── PURCHASE BLOCK ──────────────────────────────────────── */}
      <section className="gd-section w-full py-14 md:py-20" data-testid="grand-dame-purchase">
        <div className="max-w-[860px] mx-auto px-6 md:px-8 space-y-10">
          {/* Title + tagline + price */}
          <div className="text-center">
            <h2
              className="gd-cinzel text-2xl md:text-3xl text-white"
              style={{ letterSpacing: "0.18em" }}
              data-testid="grand-dame-title-2"
            >
              THE GRAND DAME
            </h2>
            <p className="gd-cormorant italic text-base md:text-lg text-white/65 mt-3">
              {product.tagline}
            </p>
            <p
              className="gd-cinzel text-3xl md:text-4xl text-white mt-6"
              style={{ letterSpacing: "0.06em" }}
              data-testid="grand-dame-price"
            >
              {formattedPrice}
            </p>
          </div>

          {/* SELECT METAL */}
          <div data-testid="grand-dame-step-metal">
            <p className="gd-cinzel text-[10px] tracking-[0.4em] text-white/45 mb-5 text-center">
              SELECT METAL
            </p>
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              {Object.values(product.metals).map((m) => {
                const isSel = metal === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMetal(m.key)}
                    aria-pressed={isSel}
                    data-testid={`grand-dame-metal-${m.key}-btn`}
                    className={`
                      relative rounded-2xl border bg-transparent
                      transition-all duration-500 ease-out
                      px-5 md:px-6 py-6 md:py-7 text-center
                      ${isSel
                        ? "border-[#C6A86B] bg-[#C6A86B]/[0.06] shadow-[inset_0_0_0_1px_rgba(198,168,107,0.18)]"
                        : "border-white/20 hover:border-[#C6A86B] hover:bg-[#C6A86B]/[0.04]"}
                    `}
                  >
                    <p className={`gd-cinzel text-[14px] md:text-[15px] tracking-[0.22em] ${isSel ? "text-white" : "text-white/80"}`}>
                      {m.name.toUpperCase()}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECT STANDARD */}
          <div data-testid="grand-dame-step-tier">
            <p className="gd-cinzel text-[10px] tracking-[0.4em] text-white/45 mb-5 text-center">
              SELECT STANDARD
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {Object.values(metalObj.tiers).map((t) => {
                const isSel = tier === t.key;
                const isSig = t.key === "signature";
                const isHeir = t.key === "heirloom";
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTier(t.key)}
                    aria-pressed={isSel}
                    data-testid={`grand-dame-tier-${t.key}-btn`}
                    className={`
                      relative rounded-2xl border bg-transparent
                      transition-all duration-500 ease-out
                      px-5 md:px-6 py-6 md:py-7 text-left
                      ${isSel
                        ? "border-[#C6A86B] bg-[#C6A86B]/[0.06] shadow-[inset_0_0_0_1px_rgba(198,168,107,0.18)]"
                        : "border-white/20 hover:border-[#C6A86B] hover:bg-[#C6A86B]/[0.04]"}
                    `}
                  >
                    {isSig && (
                      <span className="absolute top-4 right-4 bg-black text-white uppercase tracking-[0.18em] rounded-full text-[9px] px-2 py-1">
                        Most Chosen
                      </span>
                    )}
                    {isHeir && (
                      <span className="absolute top-4 right-4 bg-black text-white uppercase tracking-[0.18em] rounded-full text-[9px] px-2 py-1">
                        Atelier
                      </span>
                    )}
                    <p className={`gd-cinzel text-[14px] md:text-[15px] tracking-[0.22em] ${isSel ? "text-white" : "text-white/80"}`}>
                      {t.name.toUpperCase()}
                    </p>
                    <p className={`gd-cormorant italic text-[14px] mt-3 ${isSel ? "text-white/80" : "text-white/55"}`}>
                      {t.description}
                    </p>
                    <p className={`gd-cinzel text-[16px] mt-5 ${isSel ? "text-white" : "text-white/70"}`}>
                      ${t.price.toLocaleString("en-US")} USD
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUMMARY + ADD TO BAG */}
          <div className="text-center pt-2 space-y-7">
            <p className="gd-cinzel text-[10px] tracking-[0.35em] text-white/55">
              {metalObj.name.toUpperCase()} · {tierObj.name.toUpperCase()}
            </p>

            <button
              onClick={onAddToCart}
              disabled={isAdding}
              data-testid="grand-dame-add-to-cart-btn"
              className="
                gd-cinzel inline-block px-14 py-5
                bg-transparent border border-[#C6A86B] text-[#C6A86B]
                tracking-[0.3em] text-[12px]
                hover:bg-[#C6A86B] hover:text-black
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors duration-500
              "
            >
              {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "ADD TO BAG"}
            </button>

            <p className="gd-cormorant text-sm text-white/45 italic">
              Made to order · Atelier consultation · Complimentary insured shipping
            </p>
          </div>
        </div>
      </section>

      {/* ─── GALLERY ──────────────────────────────────────────────── */}
      <section className="gd-section w-full bg-black py-8 md:py-12" data-testid="grand-dame-gallery">
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
          data-gd-gallery-scroller
        >
          {product.gallery.map((img, i) => (
            <div
              key={img.src}
              className="
                gd-gallery-item
                relative flex-shrink-0
                w-[78vw] sm:w-[52vw] md:w-[36vw] lg:w-[30vw]
                aspect-square bg-black overflow-hidden
              "
              data-testid={`grand-dame-gallery-item-${i}`}
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
      <section className="gd-section w-full py-16 md:py-20" data-testid="grand-dame-editorial">
        <div className="max-w-[640px] mx-auto px-6 text-center">
          <p className="gd-cormorant italic text-xl md:text-2xl text-white/80 leading-[1.6]">
            Old money never speaks first.
          </p>
          <p className="gd-cormorant italic text-lg md:text-xl text-white/55 leading-[1.6] mt-4">
            Presence over performance. Restraint over ornament. The Grand Dame
            is the answer to the question no one had to ask.
          </p>
        </div>
      </section>

      {/* ─── SPECIFICATIONS ──────────────────────────────────────── */}
      <section className="gd-section w-full py-16 md:py-20" data-testid="grand-dame-specifications">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <p className="gd-cinzel text-[11px] tracking-[0.4em] text-center text-white/55 mb-10">
            SPECIFICATIONS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            <div className="text-center md:text-left">
              <div aria-hidden className="h-px w-10 mx-auto md:mx-0 mb-4" style={{ backgroundColor: "rgba(198, 168, 107, 0.4)" }} />
              <p className="gd-cinzel text-[11px] tracking-[0.35em] text-[#C6A86B] mb-4">DIMENSIONS</p>
              <div className="gd-cormorant text-[16px] md:text-[17px] leading-[1.55] text-white/70 space-y-1">
                <p>Width · {specs.width}</p>
                <p>Inner span · {specs.innerSpan}</p>
                <p>Opening gap · {specs.openingGap}</p>
                <p>Weight · {specs.weight}</p>
              </div>
            </div>

            <div className="text-center md:text-left">
              <div aria-hidden className="h-px w-10 mx-auto md:mx-0 mb-4" style={{ backgroundColor: "rgba(198, 168, 107, 0.4)" }} />
              <p className="gd-cinzel text-[11px] tracking-[0.35em] text-[#C6A86B] mb-4">MATERIAL</p>
              <div className="gd-cormorant text-[16px] md:text-[17px] leading-[1.55] text-white/70 space-y-1">
                <p>{specs.material}</p>
                <p>{specs.finish}</p>
              </div>
            </div>

            <div className="text-center md:text-left">
              <div aria-hidden className="h-px w-10 mx-auto md:mx-0 mb-4" style={{ backgroundColor: "rgba(198, 168, 107, 0.4)" }} />
              <p className="gd-cinzel text-[11px] tracking-[0.35em] text-[#C6A86B] mb-4">CONSTRUCTION</p>
              <div className="gd-cormorant text-[16px] md:text-[17px] leading-[1.55] text-white/70 space-y-1">
                <p>{specs.construction}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ECHO ─────────────────────────────────────── */}
      <section className="gd-section w-full py-20 md:py-28" data-testid="grand-dame-bottom-cta">
        <div className="max-w-[640px] mx-auto px-6 text-center space-y-7">
          <h3
            className="gd-cinzel text-2xl md:text-3xl text-white"
            style={{ letterSpacing: "0.18em" }}
          >
            THE GRAND DAME
          </h3>
          <p className="gd-cormorant italic text-base md:text-lg text-white/65">
            Old money never speaks first.
          </p>
          <p
            className="gd-cinzel text-3xl md:text-4xl text-white"
            style={{ letterSpacing: "0.06em" }}
            data-testid="grand-dame-price-bottom"
          >
            {formattedPrice}
          </p>
          <button
            onClick={onAddToCart}
            disabled={isAdding}
            data-testid="grand-dame-add-to-cart-btn-bottom"
            className="
              gd-cinzel inline-block px-14 py-5
              bg-transparent border border-[#C6A86B] text-[#C6A86B]
              tracking-[0.3em] text-[12px]
              hover:bg-[#C6A86B] hover:text-black
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-500
            "
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "ADD TO BAG"}
          </button>
          <p className="gd-cormorant text-sm text-white/45 italic">
            Made to order · Atelier consultation · Complimentary insured shipping
          </p>
        </div>
      </section>

      {/* ─── FINAL STATEMENT ─────────────────────────────────────── */}
      <section className="gd-section w-full py-24 md:py-32" data-testid="grand-dame-final-statement">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <p
            className="gd-cormorant italic text-3xl md:text-5xl text-white/85 leading-[1.4]"
            data-testid="grand-dame-final-line"
          >
            "Quietly. Always quietly."
          </p>
          <p className="gd-cinzel text-[10px] tracking-[0.4em] text-white/30 mt-12">
            THE GRAND DAME — PHILEON
          </p>
        </div>
      </section>
    </div>
  );
}
