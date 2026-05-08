import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { useAddToCart } from "../hooks/useAddToCart";

export default function MidweekPage() {
  const product = products.midweek;
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const heroVideoRef = useRef(null);

  const defaultVariant = product.variants.find((v) => v.default) || product.variants[0];
  const [variantKey] = useState(defaultVariant.key);
  const variant = product.variants.find((v) => v.key === variantKey) || defaultVariant;
  const formattedPrice = `$${variant.price.toLocaleString("en-US")} USD`;

  const onAddToCart = () => {
    handleAddToCart({
      id: `midweek-${variant.key}`,
      name: `MIDWEEK — ${variant.metal}`,
      price: variant.price,
      productKey: "midweek",
      tierKey: variant.key,
      metal: variant.metal,
      quantity: 1,
      image: product.gallery[0]?.src,
    });
  };

  useEffect(() => {
    const revealEls = document.querySelectorAll(".mw-reveal, .mw-section");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.16 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    const galleryRoot = document.querySelector("[data-mw-gallery-scroller]");
    const galleryItems = document.querySelectorAll(".mw-gallery-item");
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

  // ─── HERO VIDEO — NATIVE LOOP ONLY ───────────────────────────────
  // Source video has been trimmed to remove the fade-to-black tail
  // (loop seam delta = 7.5 luminance, imperceptible). With a clean
  // source, the browser's native `loop` is seamless on its own.
  // We keep ONLY the autoplay kickstart listeners — no manual reseek,
  // no `pause` handler. Per project pattern.
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const forcePlay = () => {
      video.play().catch(() => {});
    };

    video.addEventListener("loadedmetadata", forcePlay);
    video.addEventListener("canplay", forcePlay);

    forcePlay();

    return () => {
      video.removeEventListener("loadedmetadata", forcePlay);
      video.removeEventListener("canplay", forcePlay);
    };
  }, []);

  const specs = product.detailedSpecs;

  // Custom silver cursor — scoped to the Midweek page wrapper only.
  // 16x16 SVG: hollow polished-silver dot.
  const silverCursorSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="6" fill="none" stroke="rgba(220,225,232,0.95)" stroke-width="1.2"/><circle cx="10" cy="10" r="1.6" fill="rgba(220,225,232,0.95)"/></svg>`
  );

  return (
    <div
      className="min-h-screen bg-black text-white"
      data-testid="midweek-page"
      data-page="midweek"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        .mw-bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }
        .mw-cormorant { font-family: 'Cormorant Garamond', serif; }

        /* Custom silver cursor — scoped to Midweek wrapper only */
        [data-page="midweek"],
        [data-page="midweek"] * {
          cursor: url('data:image/svg+xml;utf8,${silverCursorSvg}') 10 10, auto;
        }
        [data-page="midweek"] a,
        [data-page="midweek"] button,
        [data-page="midweek"] [role="button"] {
          cursor: url('data:image/svg+xml;utf8,${silverCursorSvg}') 10 10, pointer;
        }

        /* ════ MIDWEEK HARD-FIX HERO BLOCK ════════════════════════════════
           object-fit: contain (full editorial composition, no crop)
           static, no transforms, no animations on the video element.
           ────────────────────────────────────────────────────────────────── */
        .midweek-video-hero {
          position: relative;
          width: 100%;
          height: 78vh;
          min-height: 560px;
          max-height: 780px;
          overflow: hidden;
          background: #050505;
        }
        .midweek-video-hero-media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          background: #050505;
          transform: none !important;
          animation: none !important;
          scale: 1 !important;
        }
        @media (max-width: 768px) {
          .midweek-video-hero {
            height: 68vh;
            min-height: 480px;
            max-height: 620px;
          }
          .midweek-video-hero-media {
            object-fit: contain;
            object-position: center center;
          }
        }

        .midweek-video-overlay {
          position: absolute;
          left: 72px;
          bottom: 64px;
          z-index: 2;
          color: white;
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .midweek-video-overlay {
            left: 24px;
            bottom: 36px;
          }
        }

        .midweek-video-eyebrow {
          font-size: 12px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(220, 225, 232, 0.82);
          margin: 0 0 18px 0;
        }
        .midweek-video-title {
          font-size: clamp(72px, 12vw, 184px);
          line-height: 0.9;
          letter-spacing: 0.04em;
          color: #FFFFFF;
          margin: 0;
        }
        .midweek-video-tagline {
          margin: 18px 0 0 0;
          font-size: clamp(15px, 1.4vw, 20px);
          color: rgba(220, 225, 232, 0.78);
          font-style: italic;
          letter-spacing: 0.005em;
        }
        /* ════ END HARD-FIX HERO BLOCK ═══════════════════════════════════ */
        /* Active gallery slide image still uses the original drift */
        @keyframes mwGalleryDrift {
          0%   { transform: translateY(-10px) scale(1); }
          100% { transform: translateY(10px) scale(1.03); }
        }
        @keyframes mwGalleryDriftMobile {
          0%   { transform: translateY(-6px) scale(1); }
          100% { transform: translateY(6px) scale(1.02); }
        }
        .mw-gallery-item.is-active img {
          animation: mwGalleryDrift 14s ease-in-out infinite alternate;
          transform-origin: center center;
          will-change: transform;
        }
        .mw-gallery-item:not(.is-active) img {
          animation: none;
          transform: none;
        }

        /* Sharper image rendering */
        .mw-gallery-item img,
        .mw-split-img img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: high-quality;
          backface-visibility: hidden;
        }

        .mw-reveal {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mw-reveal.visible { opacity: 1; transform: translateY(0); }
        .mw-delay-1 { transition-delay: 0.18s; }
        .mw-delay-2 { transition-delay: 0.45s; }
        .mw-delay-3 { transition-delay: 0.75s; }

        .mw-section {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mw-section.visible { opacity: 1; transform: translateY(0); }

        .mw-gallery-item {
          scroll-snap-align: center;
          opacity: 0.78;
          transition: opacity 200ms ease;
        }
        .mw-gallery-item.is-active { opacity: 1; }

        /* Subtle "Tuesday-night" silver accent */
        .mw-silver { color: #DCE1E8; }
        .mw-silver-soft { color: rgba(220, 225, 232, 0.65); }

        @media (max-width: 767px) {
          .mw-gallery-item.is-active img {
            animation: mwGalleryDriftMobile 14s ease-in-out infinite alternate;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mw-reveal, .mw-section, .mw-gallery-item,
          .mw-gallery-item.is-active img {
            animation: none !important;
            transition-duration: 0.001ms !important;
            transform: none !important;
          }
          .mw-reveal, .mw-section { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* ─── HERO — HARD-FIX VIDEO BLOCK (full editorial composition, no crop) ── */}
      <section
        className="midweek-video-hero"
        data-testid="midweek-hero"
      >
        <video
          ref={heroVideoRef}
          className="midweek-video-hero-media"
          src="/videos/midweek-hero.mp4"
          poster="/midweek/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          aria-hidden="true"
          data-testid="midweek-hero-video"
        />

        <Link
          to="/shop?category=bracelets"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 mw-silver-soft text-[11px] tracking-[0.3em] hover:mw-silver transition-colors"
          data-testid="midweek-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="mw-bebas">BACK TO BRACELETS</span>
        </Link>

        <div className="midweek-video-overlay" data-testid="midweek-hero-textblock">
          <p
            className="midweek-video-eyebrow mw-bebas"
            data-testid="midweek-eyebrow"
          >
            PHILEON
          </p>
          <h1
            className="mw-bebas midweek-video-title"
            data-testid="midweek-title"
          >
            MIDWEEK
          </h1>
          <p
            className="mw-cormorant midweek-video-tagline"
            data-testid="midweek-subline"
          >
            Two on the wrist. One on the table.
          </p>
        </div>
      </section>

      {/* ─── INTRO — split: copy left, image right ─────────────────── */}
      <section
        className="mw-section w-full py-20 md:py-28 bg-black"
        data-testid="midweek-intro"
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-7">
            <p className="mw-bebas text-[11px] tracking-[0.4em] mw-silver-soft">
              CHAPTER ONE — THE NIGHT
            </p>
            <h2
              className="mw-bebas text-white text-4xl md:text-5xl lg:text-6xl"
              style={{ letterSpacing: "0.04em", lineHeight: "1.05" }}
            >
              TUESDAY DOESN'T<br />NEED A REASON.
            </h2>
            <div className="space-y-5 mw-cormorant text-[17px] md:text-[19px] leading-[1.6] text-white/80">
              <p>
                It's the night between obligations. The cue chalk on his thumb,
                the second pour in the glass, the slow turn of a conversation
                that doesn't need to land anywhere.
              </p>
              <p>
                <span className="italic mw-silver">MIDWEEK</span> is built for
                that hour — when the room has settled and the only sound is
                silver against a wrist, low and steady. Three black-diamond
                barrels. No declarations. Just presence.
              </p>
            </div>
          </div>

          <div
            className="mw-split-img relative aspect-square w-full overflow-hidden bg-neutral-900"
            data-testid="midweek-intro-img"
          >
            <img
              src={product.gallery[1]?.src || product.gallery[0]?.src}
              alt="MIDWEEK — single cuff on green felt"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* ─── PULL QUOTE — full-width dark break ────────────────────── */}
      <section
        className="mw-section w-full py-28 md:py-36 bg-black border-y border-white/10"
        data-testid="midweek-pullquote"
      >
        <div className="max-w-[920px] mx-auto px-6 text-center">
          <p
            className="mw-cormorant italic text-white"
            style={{
              fontSize: "clamp(28px, 4.5vw, 56px)",
              lineHeight: "1.18",
              letterSpacing: "0.005em",
            }}
            data-testid="midweek-pullquote-text"
          >
            "He didn't come to impress anyone."
          </p>
          <div
            aria-hidden
            className="mx-auto mt-10 h-px w-12"
            style={{ backgroundColor: "rgba(220,225,232,0.5)" }}
          />
        </div>
      </section>

      {/* ─── SPECS GRID — 6 panels ─────────────────────────────────── */}
      <section
        className="mw-section w-full py-20 md:py-28 bg-black"
        data-testid="midweek-specs"
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <p className="mw-bebas text-[11px] tracking-[0.4em] mw-silver-soft text-center mb-14">
            CONSTRUCTION &amp; ORIGIN
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {[
              { label: "METAL",        value: specs.material },
              { label: "STONES",       value: specs.stones },
              { label: "BUILD",        value: specs.construction },
              { label: "WEIGHT",       value: specs.weight },
              { label: "WEARABILITY",  value: specs.wearability },
              { label: "ORIGIN",       value: specs.origin },
            ].map((panel) => (
              <div
                key={panel.label}
                className="bg-black p-8 md:p-10 min-h-[180px] flex flex-col justify-between"
                data-testid={`midweek-spec-${panel.label.toLowerCase()}`}
              >
                <p className="mw-bebas text-[11px] tracking-[0.4em] mw-silver mb-6">
                  {panel.label}
                </p>
                <p className="mw-cormorant text-[18px] md:text-[20px] leading-[1.4] text-white/85">
                  {panel.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GALLERY — horizontal scroll-snap, 5 frames ─────────────── */}
      <section
        className="mw-section w-full bg-black py-8 md:py-12"
        data-testid="midweek-gallery"
      >
        <div
          className="
            flex overflow-x-auto gap-3 md:gap-4 px-4 md:px-10 pb-4
            snap-x snap-mandatory
          "
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(220,225,232,0.4) transparent",
            scrollBehavior: "smooth",
          }}
          data-mw-gallery-scroller
        >
          {product.gallery.map((img, i) => (
            <div
              key={img.src}
              className="
                mw-gallery-item
                relative flex-shrink-0
                w-[78vw] sm:w-[52vw] md:w-[36vw] lg:w-[30vw]
                aspect-square bg-black overflow-hidden
              "
              data-testid={`midweek-gallery-item-${i}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── STACK SECTION — navy bg ───────────────────────────────── */}
      <section
        className="mw-section w-full py-24 md:py-32"
        style={{ backgroundColor: "#0B1220" }}
        data-testid="midweek-stack"
      >
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <p className="mw-bebas text-[11px] tracking-[0.4em] mw-silver-soft">
              CHAPTER TWO — STACK
            </p>
            <h3
              className="mw-bebas text-white"
              style={{
                fontSize: "clamp(40px, 6vw, 84px)",
                lineHeight: "0.96",
                letterSpacing: "0.04em",
              }}
            >
              TWO ON THE WRIST.<br />
              <span className="mw-silver">ONE ON THE TABLE.</span>
            </h3>
            <p className="mw-cormorant text-[17px] md:text-[19px] leading-[1.6] text-white/75 max-w-[480px]">
              MIDWEEK was designed to be doubled. One alone reads as restraint —
              two reads as commitment. The mesh weave holds the silhouette;
              the black-diamond barrels click softly when the second piece
              joins the first.
            </p>
            <p className="mw-cormorant italic text-sm mw-silver-soft pt-2">
              {product.purchaseNote}
            </p>
          </div>

          <div className="order-1 lg:order-2 relative aspect-[4/5] w-full overflow-hidden bg-black/30">
            <img
              src={product.gallery[3]?.src || product.gallery[0]?.src}
              alt="MIDWEEK — two cuffs stacked on a Black man's wrist at the billiard table"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* ─── CTA / ACQUIRE ──────────────────────────────────────────── */}
      <section
        className="mw-section w-full py-28 md:py-36 bg-black"
        data-testid="midweek-acquire"
      >
        <div className="max-w-[720px] mx-auto px-6 text-center space-y-9">
          <p className="mw-bebas text-[11px] tracking-[0.5em] mw-silver-soft">
            ACQUIRE
          </p>
          <h3
            className="mw-bebas text-white"
            style={{
              fontSize: "clamp(40px, 6vw, 76px)",
              lineHeight: "0.96",
              letterSpacing: "0.06em",
            }}
            data-testid="midweek-acquire-title"
          >
            MIDWEEK
          </h3>
          <p className="mw-cormorant italic mw-silver text-base md:text-lg">
            {product.tagline}
          </p>

          <div className="pt-2">
            <p
              className="mw-bebas text-white"
              style={{ fontSize: "clamp(34px, 4.4vw, 56px)", letterSpacing: "0.04em" }}
              data-testid="midweek-price"
            >
              {formattedPrice}
            </p>
            <p className="mw-cormorant italic text-sm mw-silver-soft mt-2">
              Sterling silver · Hand-set black diamonds · {specs.weight}
            </p>
          </div>

          <button
            onClick={onAddToCart}
            disabled={isAdding}
            data-testid="midweek-add-to-cart-btn"
            className="
              mw-bebas inline-block px-14 py-5 mt-2
              bg-transparent border tracking-[0.32em] text-[12px]
              transition-colors duration-500
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            style={{
              borderColor: "rgba(220,225,232,0.85)",
              color: "rgba(220,225,232,0.95)",
            }}
            onMouseEnter={(e) => {
              if (isAdding) return;
              e.currentTarget.style.backgroundColor = "rgba(220,225,232,0.95)";
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              if (isAdding) return;
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(220,225,232,0.95)";
            }}
          >
            {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO BAG"}
          </button>

          <p
            className="mw-cormorant italic text-sm mw-silver-soft pt-4"
            data-testid="midweek-leadtime"
          >
            {specs.leadTime}
          </p>
        </div>
      </section>
    </div>
  );
}
