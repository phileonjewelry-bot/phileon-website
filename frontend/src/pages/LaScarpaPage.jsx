import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import Lightbox from "../components/CinematicLightbox";

/**
 * LA SCARPA DELLA REGINA — Full Editorial Product Page
 *
 * "La corona fu data. La scarpa fu guadagnata."
 * "The crown was given. The shoe was earned."
 *
 * PHILEON Signature Objects · $9,000 USD (internal: $12,000 CAD).
 * Rose-silk regal palette. Cormorant Garamond italics. Bright luxury
 * editorial. Single CinematicLightbox shared with LA MADONNA / BAPE.
 *
 * Namespace: .scarpa-  (no class bleed)
 */

const GALLERY = [
  { src: "/la-scarpa/scarpa-portrait.jpg",         label: "01 — CAMPAIGN",       alt: "LA SCARPA DELLA REGINA — campaign portrait, model wearing the rose-gold stiletto pendant in baroque diamond frame" },
  { src: "/la-scarpa/scarpa-08-in-hand.png",       label: "02 — INTIMACY",       alt: "LA SCARPA — pendant cradled in a manicured hand against ivory silk" },
  { src: "/la-scarpa/scarpa-04-velvet-box.png",    label: "03 — ARCHIVE OBJECT", alt: "LA SCARPA — pendant on velvet presentation tray" },
  { src: "/la-scarpa/scarpa-02-marble.png",        label: "04 — LIFESTYLE",      alt: "LA SCARPA — pendant on Carrara marble" },
  { src: "/la-scarpa/scarpa-03-glass-table.png",   label: "05 — REFLECTION",     alt: "LA SCARPA — pendant on glass surface, mirrored reflection" },
  { src: "/la-scarpa/scarpa-pendant.png",          label: "06 — FRAME",          alt: "LA SCARPA — rose-gold stiletto pendant in baroque diamond frame, front detail" },
  { src: "/la-scarpa/scarpa-05-heel-macro.png",    label: "07 — DETAIL",         alt: "LA SCARPA — macro of the sculpted stiletto heel and diamond field" },
  { src: "/la-scarpa/scarpa-01-three-quarter.png", label: "08 — PROFILE",        alt: "LA SCARPA — pendant three-quarter side angle" },
  { src: "/la-scarpa/scarpa-09-la-regina.png",     label: "09 — LA REGINA",      alt: "LA SCARPA — owner in emerald silk holding the pendant within a vanity-room interior" },
];

const PRICE_USD = 9000;

const EDITORIAL_BLOCKS = [
  {
    title: "COMPOSITION",
    body:
      "La Scarpa della Regina transforms a symbol of elegance into a framed object of permanence. Sculpted in 18K rose gold and suspended within an ornamental architectural border, the pendant merges couture femininity with collectible design.",
  },
  {
    title: "STRUCTURE",
    body:
      "The silhouette is suspended against a hand-set diamond field designed to mimic cut crystal reflections. The framed composition creates the feeling of a preserved icon — less accessory, more artifact.",
  },
  {
    title: "CRAFT",
    body:
      "Every surface is mirror-polished to amplify the liquid warmth of rose gold. The stiletto form is intentionally elongated and tensioned, creating a sculptural balance between delicacy and precision.",
  },
  {
    title: "FINAL WORD",
    body: "Every great room has a woman in it worth remembering.",
  },
];

const SPECS = [
  { label: "METAL",        value: "18K Rose Gold" },
  { label: "STONES",       value: "Hand-set diamond field · 0.85ct total" },
  { label: "WEIGHT",       value: "Approx. 15.5g gold weight" },
  { label: "CONSTRUCTION", value: "Mirror-polished sculptural stiletto suspended within ornamental architectural frame." },
  { label: "PRODUCTION",   value: "Made to order · individually finished by hand." },
  { label: "LEAD TIME",    value: "4–6 weeks" },
];

const INCLUDED = [
  "Complimentary insured worldwide shipping",
  "Couture presentation packaging",
  "Certificate of authenticity",
  "Private client handling",
];

export default function LaScarpaPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const galleryRef = useRef(null);

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  // Reveal observer for editorial sections
  useEffect(() => {
    const els = document.querySelectorAll(".scarpa-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.18 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "la-scarpa-della-regina",
      name: "LA SCARPA DELLA REGINA",
      price: PRICE_USD,
      productKey: "la-scarpa-della-regina",
      tierKey: "18k-rose",
      metal: "18K Rose Gold",
      quantity: 1,
      image: GALLERY[0].src,
    });
  };

  const formattedPrice = `$${PRICE_USD.toLocaleString("en-US")} USD`;

  return (
    <section
      className={`scarpa-room${isMounted ? " scarpa-loaded" : ""}`}
      data-page="la-scarpa"
      data-testid="la-scarpa-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .scarpa-room {
          position: relative;
          background: #f6f1eb;
          overflow: hidden;
          opacity: 0;
          transition: opacity 900ms ease;
        }
        .scarpa-room.scarpa-loaded { opacity: 1; }

        .scarpa-reveal { opacity: 0; transform: translateY(18px); transition: opacity 1100ms ease, transform 1100ms ease; }
        .scarpa-reveal.visible { opacity: 1; transform: translateY(0); }

        .scarpa-cormorant { font-family: 'Cormorant Garamond', serif; }
        .scarpa-cinzel    { font-family: 'Cinzel', serif; }
        .scarpa-inter     { font-family: 'Inter', sans-serif; }

        .scarpa-portrait-frame {
          animation: scarpaFrameBreath 18s ease-in-out infinite alternate;
          will-change: transform, filter;
        }
        @keyframes scarpaFrameBreath {
          0%   { transform: scale(1)      translateY(0px);   filter: drop-shadow(0 36px 64px rgba(0,0,0,0.16)); }
          100% { transform: scale(1.012)  translateY(-4px);  filter: drop-shadow(0 44px 78px rgba(0,0,0,0.22)); }
        }

        .scarpa-back {
          position: absolute; top: 28px; left: 28px; z-index: 20;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 11px;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(95, 46, 46, 0.6);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .scarpa-back:hover { color: rgba(95, 46, 46, 0.95); }

        /* ─── HERO STACK ──────────────────────────────────── */
        .scarpa-hero-cta {
          margin-top: 56px;
          display: flex; flex-direction: column; align-items: flex-start;
          gap: 14px;
        }
        .scarpa-hero-price {
          font-family: 'Cinzel', serif;
          font-size: clamp(1.05rem, 1.4vw, 1.35rem);
          letter-spacing: 0.32em;
          color: #5f2e2e;
        }
        .scarpa-hero-leadtime {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(95, 46, 46, 0.55);
        }
        .scarpa-cta-btn {
          margin-top: 8px;
          padding: 18px 56px;
          background: #5f2e2e;
          color: #f6e4e2;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, transform 320ms ease, letter-spacing 320ms ease;
        }
        .scarpa-cta-btn:hover {
          background: #4a2222;
          letter-spacing: 0.48em;
        }
        .scarpa-cta-btn:disabled { opacity: 0.55; cursor: default; }

        /* ─── EDITORIAL BLOCKS ────────────────────────────── */
        .scarpa-editorial {
          position: relative; z-index: 10;
          padding: 120px 24px 100px;
          background:
            radial-gradient(circle at 20% 30%, rgba(244, 214, 216, 0.45), transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(232, 182, 187, 0.4), transparent 55%),
            #faf3ed;
        }
        .scarpa-editorial-grid {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          column-gap: 80px; row-gap: 70px;
        }
        .scarpa-editorial-block .scarpa-block-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px; letter-spacing: 0.48em;
          color: rgba(95, 46, 46, 0.7);
          text-transform: uppercase;
          margin-bottom: 22px;
          display: inline-block;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(95, 46, 46, 0.18);
        }
        .scarpa-editorial-block .scarpa-block-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.25vw, 1.3rem);
          line-height: 1.7;
          color: rgba(67, 33, 30, 0.88);
          font-style: italic;
        }

        /* ─── ARCHIVE GALLERY ─────────────────────────────── */
        .scarpa-archive {
          position: relative;
          padding: 120px 24px 120px;
          background:
            linear-gradient(180deg, #2a1418 0%, #3a1c20 100%);
        }
        .scarpa-archive::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle at 50% 0%, rgba(212, 154, 164, 0.18), transparent 60%);
        }
        .scarpa-archive-head { position: relative; max-width: 1300px; margin: 0 auto 60px; text-align: center; }
        .scarpa-archive-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px; letter-spacing: 0.5em;
          color: rgba(232, 182, 187, 0.7);
          text-transform: uppercase;
          margin-bottom: 22px;
        }
        .scarpa-archive-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.5rem, 2vw, 2rem);
          color: rgba(245, 220, 215, 0.92);
          letter-spacing: 0.03em;
        }
        .scarpa-archive-grid {
          position: relative;
          max-width: 1300px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 900px) { .scarpa-archive-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .scarpa-archive-grid { grid-template-columns: 1fr; } }

        .scarpa-archive-cell {
          position: relative;
          overflow: hidden;
          aspect-ratio: 4 / 5;
          background: #1a0c0f;
          border: 1px solid rgba(212, 154, 164, 0.12);
          cursor: pointer;
          padding: 0;
          transition: border-color 480ms ease, transform 480ms ease;
        }
        .scarpa-archive-cell:hover {
          border-color: rgba(232, 182, 187, 0.42);
          transform: translateY(-3px);
        }
        .scarpa-archive-cell img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 1200ms ease, filter 1200ms ease;
          filter: brightness(0.92) saturate(0.95);
        }
        .scarpa-archive-cell:hover img { transform: scale(1.04); filter: brightness(1) saturate(1.05); }
        .scarpa-archive-cell-label {
          position: absolute; bottom: 14px; left: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 9px; letter-spacing: 0.38em;
          color: rgba(245, 220, 215, 0.7);
          text-transform: uppercase;
          background: rgba(26, 12, 15, 0.55);
          padding: 6px 10px;
          backdrop-filter: blur(6px);
        }

        /* ─── SPEC BLOCK ─────────────────────────────────── */
        .scarpa-spec {
          padding: 120px 24px;
          background: #faf3ed;
        }
        .scarpa-spec-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px;
        }
        @media (max-width: 900px) { .scarpa-spec-inner { grid-template-columns: 1fr; gap: 60px; } }
        .scarpa-section-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px; letter-spacing: 0.5em;
          color: rgba(95, 46, 46, 0.7);
          text-transform: uppercase;
        }
        .scarpa-spec-table { margin-top: 32px; }
        .scarpa-spec-row {
          padding: 20px 0;
          border-bottom: 1px solid rgba(95, 46, 46, 0.12);
        }
        .scarpa-spec-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px; letter-spacing: 0.42em;
          color: rgba(95, 46, 46, 0.55);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .scarpa-spec-value {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1rem, 1.15vw, 1.18rem);
          color: rgba(67, 33, 30, 0.88);
          line-height: 1.55;
        }

        /* ─── ACQUIRE BLOCK ──────────────────────────────── */
        .scarpa-acquire {
          padding: 120px 24px 100px;
          background:
            radial-gradient(circle at 50% 100%, rgba(212, 154, 164, 0.4), transparent 65%),
            #f6f1eb;
          text-align: center;
        }
        .scarpa-acquire-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3vw, 2.8rem);
          color: #5f2e2e;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .scarpa-acquire-price {
          margin-top: 18px;
          font-family: 'Cinzel', serif;
          font-size: clamp(1.1rem, 1.45vw, 1.4rem);
          letter-spacing: 0.32em;
          color: #5f2e2e;
        }
        .scarpa-acquire-lead {
          margin-top: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 11px; letter-spacing: 0.32em;
          color: rgba(95, 46, 46, 0.6);
          text-transform: uppercase;
        }

        /* ─── SIGNATURE ──────────────────────────────────── */
        .scarpa-sig {
          padding: 100px 24px 140px;
          background: #2a1418;
          text-align: center;
        }
        .scarpa-sig-italian {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.4rem, 2.4vw, 2.2rem);
          color: rgba(232, 182, 187, 0.92);
          letter-spacing: 0.04em;
        }
        .scarpa-sig-english {
          margin-top: 24px;
          font-family: 'Inter', sans-serif;
          font-size: 11px; letter-spacing: 0.5em;
          color: rgba(232, 182, 187, 0.5);
          text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .scarpa-editorial-grid { grid-template-columns: 1fr; gap: 60px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .scarpa-portrait-frame { animation: none !important; }
          .scarpa-archive-cell img { transition: none !important; }
        }
      `}</style>

      <Link to="/shop?category=pendants&audience=ladies" className="scarpa-back" data-testid="la-scarpa-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* Rose silk atmosphere */}
      <div className="absolute inset-0 opacity-90 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 left-[-10%] h-[520px] w-[140%] rotate-[-8deg] bg-gradient-to-r from-[#f4d6d8] via-[#e8b6bb] to-[#f6e4e2] blur-3xl opacity-70" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[420px] w-[120%] rotate-[6deg] bg-gradient-to-r from-[#b76e79] via-[#d49aa4] to-[#f1d4d8] blur-3xl opacity-40" />
      </div>

      {/* Silk folds */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none" aria-hidden="true">
        <div className="absolute left-[-10%] top-[15%] h-[2px] w-[140%] rotate-[-8deg] bg-white blur-sm" />
        <div className="absolute left-[-10%] top-[28%] h-[2px] w-[140%] rotate-[-6deg] bg-white blur-sm" />
        <div className="absolute left-[-10%] top-[42%] h-[2px] w-[140%] rotate-[-7deg] bg-white blur-sm" />
        <div className="absolute left-[-10%] top-[58%] h-[2px] w-[140%] rotate-[-5deg] bg-white blur-sm" />
      </div>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:py-32">
        {/* LEFT — editorial copy */}
        <div className="order-2 flex flex-col items-start text-left lg:order-1">
          <span
            className="mb-6 tracking-[0.45em] text-[#9b6b62] text-xs uppercase"
            data-testid="la-scarpa-eyebrow"
          >
            PHILEON SIGNATURE OBJECTS
          </span>

          <h1
            className="text-[#5f2e2e] uppercase leading-[0.88] tracking-[0.06em]"
            style={{
              fontSize: "clamp(3rem, 7.5vw, 7rem)",
              fontFamily: "'Cormorant Garamond', serif",
            }}
            data-testid="la-scarpa-title"
          >
            LA SCARPA
            <br />
            DELLA REGINA
          </h1>

          <p
            className="mt-5 tracking-[0.35em] uppercase text-[#9b6b62]"
            style={{
              fontSize: "clamp(0.75rem, 1vw, 0.9rem)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            THE QUEEN'S SHOE
          </p>

          <div className="my-8 h-px w-40 bg-gradient-to-r from-transparent via-[#b9877d] to-[#b9877d]" />

          <div className="space-y-4">
            <p
              className="text-[#5f2e2e] italic"
              style={{
                fontSize: "clamp(1.05rem, 1.6vw, 1.5rem)",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              Non chiede la stanza.
              <br />
              La stanza si riorganizza intorno a lei.
            </p>

            <p
              className="max-w-2xl text-[#6a4b45] leading-relaxed"
              style={{
                fontSize: "clamp(0.95rem, 1.3vw, 1.15rem)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              A queen does not ask for the room.
              <br />
              The room rearranges itself.
            </p>
          </div>

          {/* PRICE + ACQUIRE inline CTA */}
          <div className="scarpa-hero-cta" data-testid="la-scarpa-hero-cta">
            <p className="scarpa-hero-price" data-testid="la-scarpa-hero-price">
              {formattedPrice}
            </p>
            <p className="scarpa-hero-leadtime">Made to order · 4–6 weeks</p>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isAdding}
              className="scarpa-cta-btn"
              data-testid="la-scarpa-acquire-btn"
            >
              {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
            </button>
          </div>
        </div>

        {/* RIGHT — portrait hero */}
        <div className="order-1 relative w-full lg:order-2">
          <div className="absolute inset-0 rounded-[36px] bg-[#f0c8c1] blur-[120px] opacity-50" aria-hidden="true" />
          <img
            src="/la-scarpa/scarpa-portrait.jpg"
            alt="LA SCARPA DELLA REGINA — model wearing the rose-gold stiletto pendant in baroque diamond frame"
            className="scarpa-portrait-frame relative z-10 mx-auto block w-full max-w-[640px] rounded-[6px] object-cover cursor-pointer"
            loading="eager"
            decoding="async"
            onClick={() => setLightboxIdx(0)}
            data-testid="la-scarpa-portrait"
          />
        </div>
      </div>

      {/* ─── ARTIFACT — pendant render ─────────────────────── */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-32 text-center scarpa-reveal">
        <p
          className="mb-6 tracking-[0.42em] text-[#9b6b62] text-[11px] uppercase"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          The Artifact
        </p>
        <div className="relative w-full max-w-[520px] mx-auto">
          <div className="absolute inset-0 rounded-full bg-[#f0c8c1] blur-[100px] opacity-40" aria-hidden="true" />
          <img
            src="/la-scarpa/scarpa-pendant.png"
            alt="LA SCARPA DELLA REGINA — rose-gold stiletto pendant detail"
            className="relative z-10 mx-auto w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.18)] cursor-pointer"
            loading="lazy"
            decoding="async"
            onClick={() => setLightboxIdx(5)}
            data-testid="la-scarpa-pendant"
          />
        </div>
      </div>

      {/* ─── EDITORIAL BLOCKS ──────────────────────────────── */}
      <section className="scarpa-editorial scarpa-reveal" data-testid="la-scarpa-editorial">
        <div className="scarpa-editorial-grid">
          {EDITORIAL_BLOCKS.map((b) => (
            <div
              key={b.title}
              className="scarpa-editorial-block"
              data-testid={`la-scarpa-editorial-${b.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <p className="scarpa-block-eyebrow">{b.title}</p>
              <p className="scarpa-block-body">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── ARCHIVE GALLERY ───────────────────────────────── */}
      <section className="scarpa-archive scarpa-reveal" data-testid="la-scarpa-archive" ref={galleryRef}>
        <div className="scarpa-archive-head">
          <p className="scarpa-archive-eyebrow">LA SCARPA · ARCHIVE</p>
          <p className="scarpa-archive-title">Nine frames. One artifact.<br />Click any image to enter the viewing room.</p>
        </div>
        <div className="scarpa-archive-grid" data-testid="la-scarpa-archive-grid">
          {GALLERY.map((g, i) => (
            <button
              key={g.src}
              type="button"
              className="scarpa-archive-cell"
              aria-label={g.label}
              onClick={() => setLightboxIdx(i)}
              data-testid={`la-scarpa-archive-cell-${i + 1}`}
            >
              <img src={g.src} alt={g.alt} loading="eager" decoding="async" />
              <span className="scarpa-archive-cell-label">{g.label.split("—")[1]?.trim() || g.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── CINEMATIC LIGHTBOX ────────────────────────────── */}
      <Lightbox
        items={GALLERY}
        openIndex={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onChange={(i) => setLightboxIdx(i)}
        archiveLabel="LA SCARPA · ARCHIVE"
      />

      {/* ─── SPECIFICATIONS ────────────────────────────────── */}
      <section className="scarpa-spec scarpa-reveal" data-testid="la-scarpa-spec">
        <div className="scarpa-spec-inner">
          <div>
            <p className="scarpa-section-eyebrow">SPECIFICATION</p>
            <div className="scarpa-spec-table">
              {SPECS.map((s) => (
                <div
                  key={s.label}
                  className="scarpa-spec-row"
                  data-testid={`la-scarpa-spec-${s.label.toLowerCase()}`}
                >
                  <p className="scarpa-spec-label">{s.label}</p>
                  <p className="scarpa-spec-value">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="scarpa-section-eyebrow">INCLUDED WITH ACQUISITION</p>
            <ul
              style={{
                marginTop: 32, padding: 0, listStyle: "none",
                display: "flex", flexDirection: "column", gap: 18,
              }}
            >
              {INCLUDED.map((line) => (
                <li
                  key={line}
                  className="scarpa-cormorant"
                  style={{
                    fontSize: "clamp(15px, 1.15vw, 18px)",
                    color: "rgba(67, 33, 30, 0.85)",
                    fontStyle: "italic", fontWeight: 300,
                    paddingBottom: 14,
                    borderBottom: "1px solid rgba(95, 46, 46, 0.12)",
                  }}
                >
                  {line}
                </li>
              ))}
            </ul>
            <p
              className="scarpa-cormorant"
              style={{
                marginTop: 36, fontSize: 14, fontStyle: "italic",
                color: "rgba(95, 46, 46, 0.55)", lineHeight: 1.7,
              }}
            >
              Acquisitions are processed privately. A member of our atelier
              will follow up to confirm specifications and finalise delivery.
            </p>
          </div>
        </div>
      </section>

      {/* ─── ACQUIRE BLOCK ─────────────────────────────────── */}
      <section className="scarpa-acquire scarpa-reveal" data-testid="la-scarpa-acquire">
        <p className="scarpa-section-eyebrow">ACQUISITION</p>
        <h2 className="scarpa-acquire-title" data-testid="la-scarpa-acquire-title" style={{ marginTop: 24 }}>
          LA SCARPA DELLA REGINA
        </h2>
        <p className="scarpa-acquire-price" data-testid="la-scarpa-price">{formattedPrice}</p>
        <p className="scarpa-acquire-lead">Made to order · 4–6 weeks · Complimentary insured worldwide shipping</p>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isAdding}
          className="scarpa-cta-btn"
          style={{ marginTop: 36 }}
          data-testid="la-scarpa-begin-commission-btn"
        >
          {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
        </button>
      </section>

      {/* ─── SIGNATURE CLOSER ──────────────────────────────── */}
      <section className="scarpa-sig scarpa-reveal" data-testid="la-scarpa-signature">
        <p className="scarpa-sig-italian">
          La corona fu data. La scarpa fu guadagnata.
        </p>
        <p className="scarpa-sig-english">
          The crown was given. The shoe was earned.
        </p>
      </section>

      {/* Bottom shimmer */}
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#c58c84] to-transparent opacity-60 pointer-events-none" aria-hidden="true" />
    </section>
  );
}
