import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { products } from "@/data/products";

export default function GrandDamePage() {
  const product = products.theGrandDame;

  // Section fade-up + gallery active detection (mirrors Don Gorgon pattern)
  useEffect(() => {
    const sections = document.querySelectorAll("[data-gd-motion]");
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.18 }
    );
    sections.forEach((el) => sectionObserver.observe(el));

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
      sectionObserver.disconnect();
      galleryObserver.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white" data-testid="grand-dame-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        .gd-cinzel { font-family: 'Cinzel', serif; letter-spacing: 0.08em; }
        .gd-cormorant { font-family: 'Cormorant Garamond', serif; }

        /* Hero drift */
        @keyframes gdHeroDrift {
          from { transform: scale(1) translateY(0); }
          to   { transform: scale(1.04) translateY(-8px); }
        }
        .gd-hero-media {
          transform-origin: center center;
          animation: gdHeroDrift 16s ease-in-out infinite alternate;
          will-change: transform;
        }

        /* Hero text reveal */
        @keyframes gdTextReveal { to { opacity: 1; transform: translateY(0); } }
        .gd-hero-copy > * {
          opacity: 0;
          transform: translateY(10px);
          animation: gdTextReveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .gd-hero-copy > *:nth-child(1) { animation-delay: 0.20s; }
        .gd-hero-copy > *:nth-child(2) { animation-delay: 0.45s; }
        .gd-hero-copy > *:nth-child(3) { animation-delay: 0.75s; }

        /* Gallery momentum */
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

        /* Section pacing */
        .gd-motion-section {
          opacity: 0;
          transform: translateY(26px);
          transition:
            opacity 1000ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 1000ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gd-motion-section.is-visible { opacity: 1; transform: translateY(0); }

        @media (prefers-reduced-motion: reduce) {
          .gd-hero-media, .gd-hero-copy > *, .gd-gallery-item, .gd-motion-section {
            animation: none !important;
            transition-duration: 0.001ms !important;
          }
          .gd-hero-copy > * { opacity: 1 !important; transform: none !important; }
          .gd-motion-section { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative w-full bg-black overflow-hidden"
        style={{ height: "92vh", minHeight: "320px" }}
        data-testid="grand-dame-hero"
      >
        <img
          src={product.hero.poster}
          alt="The Grand Dame — cinematic hero"
          className="gd-hero-media absolute inset-0 w-full h-full object-cover"
        />

        <style>{`
          @media (max-width: 767px) {
            [data-testid="grand-dame-hero"] { height: 86vh !important; }
          }
        `}</style>

        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent" />

        <Link
          to="/shop?category=bracelets"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/55 text-[11px] tracking-[0.3em] hover:text-[#C6A86B] transition-colors"
          data-testid="grand-dame-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO BRACELETS</span>
        </Link>

        <div className="relative z-10 h-full flex items-center justify-center px-6 text-center text-white">
          <div className="gd-hero-copy">
            <p className="gd-cinzel text-[10px] md:text-[11px] tracking-[0.45em] text-white/75 mb-5">
              {product.heroText.eyebrow}
            </p>
            <h1
              className="gd-cinzel text-3xl md:text-5xl text-white"
              style={{ letterSpacing: "0.14em" }}
              data-testid="grand-dame-title"
            >
              {product.heroText.title}
            </h1>
            <p
              className="text-white italic tracking-wide text-sm mt-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              data-testid="grand-dame-subline"
            >
              {product.heroText.subline}
            </p>
          </div>
        </div>
      </section>

      {/* ─── INQUIRY BLOCK (pricingPending) ────────────────────────── */}
      <section className="gd-motion-section w-full py-14 md:py-20" data-gd-motion data-testid="grand-dame-inquiry">
        <div className="max-w-[860px] mx-auto px-6 md:px-8 text-center space-y-10">
          <div>
            <h2
              className="gd-cinzel text-2xl md:text-3xl text-white"
              style={{ letterSpacing: "0.18em" }}
              data-testid="grand-dame-title-2"
            >
              THE GRAND DAME
            </h2>
            <p className="gd-cormorant italic text-base md:text-lg text-white/65 mt-3">
              {product.subtitle}
            </p>
          </div>

          {/* Tier preview — names and material only, no prices */}
          <div data-testid="grand-dame-tiers">
            <p className="gd-cinzel text-[10px] tracking-[0.4em] text-white/45 mb-5">
              EDITIONS
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 text-left">
              {Object.values(product.metals.rose.tiers).map((t) => (
                <div
                  key={t.key}
                  data-testid={`grand-dame-tier-${t.key}`}
                  className="
                    relative rounded-2xl border border-white/15 bg-transparent
                    px-5 md:px-6 py-6 md:py-7
                  "
                >
                  <p className="gd-cinzel text-[14px] md:text-[15px] tracking-[0.22em] text-white/80">
                    {t.name.toUpperCase()}
                  </p>
                  <p className="gd-cormorant italic text-[14px] mt-3 text-white/60">
                    {t.description}
                  </p>
                  <p className="gd-cormorant text-xs text-[#C6A86B]/70 mt-5 tracking-[0.12em]">
                    PRICING ON INQUIRY
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Inquire CTA (no Add to Cart while pricingPending) */}
          <div className="pt-2 space-y-7">
            <p className="gd-cinzel text-[10px] tracking-[0.35em] text-white/45">
              ROSE GOLD · MADE TO ORDER
            </p>

            <a
              href="mailto:atelier@phileon.com?subject=The%20Grand%20Dame%20Cuff%20%E2%80%94%20Inquiry"
              data-testid="grand-dame-inquire-btn"
              className="
                gd-cinzel inline-block px-14 py-5
                bg-transparent border border-[#C6A86B] text-[#C6A86B]
                tracking-[0.3em] text-[12px]
                hover:bg-[#C6A86B] hover:text-black
                transition-colors duration-500
              "
            >
              INQUIRE
            </a>

            <p className="gd-cormorant text-sm text-white/45 italic">
              Made to order · Atelier consultation · Complimentary insured shipping
            </p>
          </div>
        </div>
      </section>

      {/* ─── GALLERY ──────────────────────────────────────────────── */}
      <section
        className="gd-motion-section w-full bg-black py-8 md:py-12"
        data-gd-motion
        data-testid="grand-dame-gallery"
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
      <section className="gd-motion-section w-full py-16 md:py-20" data-gd-motion data-testid="grand-dame-editorial">
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
      <section className="gd-motion-section w-full py-16 md:py-20" data-gd-motion data-testid="grand-dame-specifications">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <p className="gd-cinzel text-[11px] tracking-[0.4em] text-center text-white/55 mb-10">
            SPECIFICATIONS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {[
              { label: "FORM", lines: ["Sculptural open cuff.", "Oval profile.", "Architectural width."] },
              { label: "FINISH", lines: ["Polished rose gold.", "Fine mesh lattice.", "Bevelled outer edge."] },
              { label: "EDITIONS", lines: ["Foundation · 10K rose.", "Signature · 14K rose.", "Heirloom · 18K rose."] },
            ].map((spec) => (
              <div key={spec.label} className="text-center md:text-left">
                <div
                  aria-hidden
                  className="h-px w-10 mx-auto md:mx-0 mb-4"
                  style={{ backgroundColor: "rgba(198, 168, 107, 0.4)" }}
                />
                <p className="gd-cinzel text-[11px] tracking-[0.35em] text-[#C6A86B] mb-4">
                  {spec.label}
                </p>
                <div className="gd-cormorant text-[16px] md:text-[17px] leading-[1.55] text-white/70 space-y-1">
                  {spec.lines.map((ln, li) => (
                    <p key={li}>{ln}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL STATEMENT ─────────────────────────────────────── */}
      <section className="gd-motion-section w-full py-32 md:py-44" data-gd-motion data-testid="grand-dame-final-statement">
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
