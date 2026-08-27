import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

/**
 * WYNETTE'S PALETTE — PHILEON Fine Jewelry
 *
 * Collector cocktail ring. Black rose-cut center stone, multi-colour
 * gemstone halo, hand-engraved openwork gallery. Made to order.
 *
 * Page architecture obeys the SITEWIDE PRODUCT PAGE ORDER RULE:
 *   1. Hero (cinematic, black field, slow parallax + spotlight shimmer)
 *   2. Editorial thesis — The Woman
 *   3. The Palette
 *   4. The Garden
 *   5. After Sunset
 *   6. The Archive (five named frames)
 *   7. Composition · Specifications
 *   8. INQUIRE (price upon request, no add-to-cart)
 *   9. Final Word
 *
 * Namespace: .wp-
 */

const HERO_IMG = "/wynette/hero.jpg";

// Live cinematic unboxing video. 13.631 s total.
// Overlay phases keyed to absolute seconds inside the loop:
//   0.0 –  3.0 s : PHILEON
//   3.0 –  8.5 s : WYNETTE'S PALETTE
//   8.5 – 11.5 s : Every island brought a colour.
//  11.5 – 13.631 s : Some women wear colour. / Wynette collected it.
const HERO_VIDEO_SRC = "/wynette/hero.mp4";
const HERO_VIDEO_DURATION = 13.631;
const HERO_ALT =
  "WYNETTE'S PALETTE — collector cocktail ring with a rose-cut black centre stone surrounded by a halo of ruby, emerald, sapphire, amethyst, topaz, citrine and aquamarine; hand-engraved white-gold openwork gallery.";

// Archive editorial — ten frames of the piece itself, each named after
// a moment from Wynette's evenings.
const GALLERY = [
  {
    src: "/wynette/archive-1.png",
    label: "The garden party",
    alt: "WYNETTE'S PALETTE — side profile of the ring revealing the gem-encrusted shoulders, the multi-colour halo and the black rose-cut centre stone seen from the elevation; the architecture of the gallery is fully visible.",
  },
  {
    src: "/wynette/archive-2.png",
    label: "The last toast",
    alt: "WYNETTE'S PALETTE — three-quarter view from above, the rainbow halo of ruby, emerald, sapphire, amethyst, topaz, citrine and aquamarine circling the rose-cut black centre stone.",
  },
  {
    src: "/wynette/archive-3.png",
    label: "Moon over Barbados",
    alt: "WYNETTE'S PALETTE — rear view with the openwork gallery reflected beneath; light catching the engraved white-gold lacework like moonlight on the Atlantic.",
  },
  {
    src: "/wynette/archive-4.png",
    label: "Carnival royalty",
    alt: "WYNETTE'S PALETTE — extreme macro of the shoulder, a riot of ruby, emerald, sapphire and amethyst set into hand-engraved white gold.",
  },
  {
    src: "/wynette/archive-5.png",
    label: "After the music",
    alt: "WYNETTE'S PALETTE — direct top-down view of the perfect circular halo: a black rose-cut stone held by a ring of colour, quiet and complete.",
  },
  {
    src: "/wynette/archive-6.png",
    label: "The gallery",
    alt: "WYNETTE'S PALETTE — looking through the openwork architecture from beneath, the entire colour-set gallery visible through the dome.",
  },
  {
    src: "/wynette/archive-7.png",
    label: "The architecture",
    alt: "WYNETTE'S PALETTE — head-on elevation of the dome and shank, the layered tiers of colour-set white-gold openwork revealed in profile.",
  },
  {
    src: "/wynette/archive-8.png",
    label: "On the stone",
    alt: "WYNETTE'S PALETTE — the ring photographed resting on a carved stone surface, three-quarter view, evening light catching the rainbow halo around the black centre stone.",
  },
  {
    src: "/wynette/archive-9.png",
    label: "The crown",
    alt: "WYNETTE'S PALETTE — extreme macro of the gold prong setting around the black rose-cut centre, gem-set crown beads of ruby, citrine, topaz and emerald.",
  },
  {
    src: "/wynette/archive-10.jpg",
    label: "Wynette herself",
    alt: "WYNETTE'S PALETTE — lifestyle frame of a woman wearing the ring at a Caribbean garden party at dusk: string lights, palm shadow, a cocktail in her hand, laughter in the room.",
  },
];

const SPECS = [
  ["Piece", "Wynette's Palette"],
  ["Category", "Ladies Cocktail Ring"],
  ["Top Diameter", "Approx. 22mm"],
  ["Top Height", "Approx. 12mm"],
  ["Overall Face", "Approx. 22mm"],
];

// Hand-set USD prices · USD-mirrored convention (matches Veyron Noir,
// Uncle Jo, Battenti). lockedBasePriceCad in livePricingConfig +
// pricing_engine numerically mirrors priceUsd so /validate-cart returns
// diff=0. No live metal recalc (weightGrams=0).
const METAL_OPTIONS = [
  { id: "silver",  label: "Sterling Silver",   tierKey: "silver",  priceUsd: 2000 },
  { id: "gold10k", label: "10K White Gold",    tierKey: "gold10k", priceUsd: 6000 },
  { id: "gold14k", label: "14K White Gold",    tierKey: "gold14k", priceUsd: 8000 },
];
const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;
const RING_SIZES = ["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"];

export default function WynettePalettePage() {
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [metalId, setMetalId] = useState("gold14k");
  const [ringSize, setRingSize] = useState("7");

  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Slow floating parallax on the hero image
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(() => setLoaded(true), 0);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  // Hero parallax translate (small, slow)
  const heroParallax = Math.min(scrollY * 0.18, 120);

  const currentMetal = METAL_OPTIONS.find((m) => m.id === metalId) || METAL_OPTIONS[2];
  const priceUsd = currentMetal.priceUsd;
  const priceFormatted = formatUsd(priceUsd);

  const onAddToCart = () => {
    const variant = `${currentMetal.label} · Size ${ringSize}`;
    handleAddToCart(
      {
        id: `wynette-palette-${metalId}-${ringSize}`,
        name: `WYNETTE'S PALETTE — ${currentMetal.label} · Size ${ringSize}`,
        price: priceUsd,
        productKey: "wynettePalette",
        tierKey: currentMetal.tierKey,
        metal: currentMetal.label,
        ringSize,
        sku: `WP-${currentMetal.tierKey.toUpperCase()}-S${ringSize.replace(".", "")}`,
        quantity: 1,
        image: HERO_IMG,
      },
      1,
      variant,
    );
  };

  return (
    <div className={`wp-root${loaded ? " is-loaded" : ""}`} data-testid="wp-root">
      <style>{`
        .wp-root {
          --ink:           #ECE3D0;
          --ink-strong:    #F7F0DD;
          --ink-muted:     rgba(236, 227, 208, 0.62);
          --bg:            #07050A;
          --bg-deep:       #050309;
          --gold:          #C9A961;
          --gold-deeper:   #B08A3E;
          --rule:          rgba(201, 169, 97, 0.22);
          --ruby:          #B5384D;
          --emerald:       #2E7C5A;
          --sapphire:      #2E4F8A;
          --amethyst:      #6F4A8A;
          --citrine:       #C99A2E;
          --aqua:          #3F7FA0;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Cormorant Garamond', serif;
          overflow-x: hidden;
          min-height: 100vh;
        }
        .wp-return {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 28px 32px 0;
          color: var(--gold);
          font-family: 'Cinzel', serif;
          letter-spacing: 0.32em;
          font-size: 11px;
          text-decoration: none;
          opacity: 0.86;
          transition: opacity 200ms ease;
        }
        .wp-return:hover { opacity: 1; }

        /* ── HERO (full-bleed cinematic video) ── */
        .wp-hero {
          position: relative;
          width: 100%;
          min-height: 78vh;
          height: 78vh;
          background: #000;
          overflow: hidden;
          padding: 0;
          margin: 0;
        }
        @media (max-width: 880px) {
          .wp-hero { min-height: 68vh; height: 68vh; }
        }
        .wp-hero-bg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 0;
          background: #000;
        }
        .wp-hero-scrim {
          position: absolute; inset: 0;
          background: rgba(5, 3, 9, 0.25);
          pointer-events: none;
          z-index: 1;
        }
        .wp-hero-overlay {
          position: absolute; inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(24px, 5vw, 80px);
          z-index: 2;
          pointer-events: none;
        }
        .wp-hero-phase {
          position: absolute;
          left: 0; right: 0;
          margin: 0 auto;
          text-align: center;
          padding: 0 clamp(20px, 5vw, 80px);
          opacity: 0;
          color: var(--ink-strong);
          will-change: opacity;
          /* Each phase shares the same animation duration (= video duration).
             The keyframe set defines when each phase is visible. */
          animation-duration: 13.631s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          animation-fill-mode: both;
        }
        /* PHASE 1 — 0.0s → 3.0s (PHILEON) */
        .wp-hero-phase--1 { animation-name: wpPhase1; }
        @keyframes wpPhase1 {
          0%      { opacity: 0; }
          3.67%   { opacity: 1; }   /* 0.5s fade-in done */
          18.34%  { opacity: 1; }   /* hold until 2.5s */
          22.01%  { opacity: 0; }   /* fade-out done at 3.0s */
          100%    { opacity: 0; }
        }
        /* PHASE 2 — 3.0s → 8.5s (WYNETTE'S PALETTE) */
        .wp-hero-phase--2 { animation-name: wpPhase2; }
        @keyframes wpPhase2 {
          0%, 22.01%  { opacity: 0; }
          25.68%      { opacity: 1; }   /* 3.5s */
          58.69%      { opacity: 1; }   /* 8.0s */
          62.36%      { opacity: 0; }   /* 8.5s */
          100%        { opacity: 0; }
        }
        /* PHASE 3 — 8.5s → 11.5s (Every island brought a colour.) */
        .wp-hero-phase--3 { animation-name: wpPhase3; }
        @keyframes wpPhase3 {
          0%, 62.36%  { opacity: 0; }
          66.03%      { opacity: 1; }   /* 9.0s */
          80.70%      { opacity: 1; }   /* 11.0s */
          84.37%      { opacity: 0; }   /* 11.5s */
          100%        { opacity: 0; }
        }
        /* PHASE 4 — 11.5s → end (Some women wear colour. / Wynette collected it.) */
        .wp-hero-phase--4 { animation-name: wpPhase4; }
        @keyframes wpPhase4 {
          0%, 84.37%  { opacity: 0; }
          88.04%      { opacity: 1; }   /* 12.0s */
          96.33%      { opacity: 1; }   /* 13.131s */
          100%        { opacity: 0; }   /* 13.631s — fade to black before video loops */
        }

        .wp-hero-eyebrow {
          display: inline-block;
          font-family: 'Cinzel', serif;
          font-size: clamp(13px, 1.4vw, 18px);
          letter-spacing: 0.62em;
          color: var(--gold);
          text-shadow: 0 2px 12px rgba(0,0,0,0.85);
        }
        .wp-hero-title-overlay {
          display: inline-block;
          font-family: 'Playfair Display', serif;
          font-weight: 500;
          font-size: clamp(40px, 6.4vw, 96px);
          line-height: 0.96;
          letter-spacing: -0.005em;
          color: var(--ink-strong);
          text-shadow: 0 4px 24px rgba(0,0,0,0.9);
        }
        .wp-hero-tag-overlay {
          display: inline-block;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(20px, 2.2vw, 34px);
          color: var(--gold);
          text-shadow: 0 2px 16px rgba(0,0,0,0.9);
        }
        .wp-hero-final-overlay {
          display: block;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(18px, 2.0vw, 28px);
          color: var(--ink-strong);
          line-height: 1.6;
          text-shadow: 0 2px 16px rgba(0,0,0,0.9);
        }
        .wp-hero-final-overlay.gold { color: var(--gold); }

        /* ── 1B. OPENING STANZA ── */
        .wp-opening {
          padding: clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px);
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }
        .wp-hero-stanza {
          font-size: clamp(16px, 1.15vw, 18px);
          line-height: 1.78;
          color: var(--ink);
          margin: 0 0 14px;
          max-width: 520px;
        }
        .wp-hero-stanza.muted { color: var(--ink-muted); }

        /* ── EDITORIAL ── */
        .wp-editorial {
          padding: clamp(80px, 12vw, 160px) clamp(20px, 5vw, 80px);
          max-width: 880px;
          margin: 0 auto;
          text-align: center;
        }
        .wp-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          color: var(--gold);
          margin: 0 0 28px;
        }
        .wp-section-title {
          font-family: 'Playfair Display', serif;
          font-weight: 500;
          font-size: clamp(34px, 4vw, 52px);
          line-height: 1.08;
          color: var(--ink-strong);
          margin: 0 0 40px;
        }
        .wp-stanza {
          font-size: clamp(17px, 1.25vw, 19px);
          line-height: 1.85;
          color: var(--ink);
          margin: 0 0 18px;
        }
        .wp-stanza.dim { color: var(--ink-muted); }
        .wp-rule {
          width: 64px; height: 1px;
          background: var(--gold);
          opacity: 0.55;
          margin: 56px auto;
        }

        /* The Palette — colour swatch row */
        .wp-palette-row {
          display: flex;
          justify-content: center;
          gap: 18px;
          margin: 40px auto 24px;
          flex-wrap: wrap;
          max-width: 560px;
        }
        .wp-swatch {
          width: 56px; height: 56px;
          border-radius: 50%;
          border: 1px solid rgba(201,169,97,0.45);
          box-shadow:
            inset 0 -8px 18px rgba(0,0,0,0.45),
            0 6px 18px rgba(0,0,0,0.55);
        }
        .wp-swatch-label {
          font-family: 'Cinzel', serif;
          font-size: 9.5px;
          letter-spacing: 0.32em;
          color: var(--ink-muted);
          margin-top: 10px;
          text-align: center;
        }
        .wp-swatch-col { display: flex; flex-direction: column; align-items: center; }

        /* ── ARCHIVE ── */
        .wp-archive {
          padding: clamp(80px, 12vw, 140px) clamp(20px, 4vw, 60px);
          background: linear-gradient(180deg, #0A070D 0%, #07050A 100%);
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }
        .wp-archive-head {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 64px;
        }
        .wp-archive-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(20px, 3vw, 40px);
          max-width: 1240px;
          margin: 0 auto;
        }
        .wp-archive-grid > :nth-child(5) { grid-column: auto; }
        @media (max-width: 720px) {
          .wp-archive-grid { grid-template-columns: 1fr; }
          .wp-archive-grid > :nth-child(5) { grid-column: auto; }
        }
        .wp-archive-cell {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #0B080F;
          overflow: hidden;
          border: 1px solid rgba(201,169,97,0.10);
        }
        .wp-archive-cell img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: center;
          transition: transform 1400ms cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 600ms ease;
          opacity: 0.95;
        }
        .wp-archive-cell:hover img { transform: scale(1.025); opacity: 1; }
        .wp-archive-caption {
          position: absolute;
          left: 18px; bottom: 16px; right: 18px;
          font-family: 'Cinzel', serif;
          font-size: 10px;
          letter-spacing: 0.36em;
          color: var(--ink-strong);
          text-transform: uppercase;
          z-index: 2;
          pointer-events: none;
          text-shadow: 0 1px 6px rgba(0,0,0,0.85);
        }

        /* ── SPECS ── */
        .wp-specs {
          padding: clamp(80px, 12vw, 140px) clamp(20px, 4vw, 60px);
          max-width: 880px;
          margin: 0 auto;
        }
        .wp-spec-row {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 36px;
          padding: 18px 0;
          border-bottom: 1px solid var(--rule);
        }
        @media (max-width: 640px) {
          .wp-spec-row { grid-template-columns: 1fr; gap: 4px; }
        }
        .wp-spec-key {
          font-family: 'Cinzel', serif;
          font-size: 10.5px;
          letter-spacing: 0.36em;
          color: var(--gold);
          text-transform: uppercase;
        }
        .wp-spec-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          color: var(--ink);
        }

        /* ── INQUIRE ── */
        .wp-cta-block {
          padding: clamp(60px, 10vw, 120px) clamp(20px, 4vw, 60px);
          text-align: center;
          background:
            radial-gradient(ellipse 70% 60% at 50% 40%,
              rgba(201,169,97,0.06),
              transparent 70%),
            var(--bg-deep);
          border-top: 1px solid var(--rule);
        }
        .wp-cta-price {
          font-family: 'Cinzel', serif;
          font-size: 12px;
          letter-spacing: 0.42em;
          color: var(--gold);
          margin: 0 0 6px;
        }
        .wp-cta-sub {
          font-style: italic;
          color: var(--ink-muted);
          font-size: 16px;
          margin: 0 0 38px;
        }
        .wp-inquire-btn {
          display: inline-block;
          padding: 20px 64px;
          font-family: 'Cinzel', serif;
          font-size: 13px;
          letter-spacing: 0.48em;
          color: var(--ink-strong);
          background: transparent;
          border: 1px solid var(--gold);
          cursor: pointer;
          transition:
            background 260ms ease,
            color 260ms ease,
            letter-spacing 260ms ease,
            box-shadow 320ms ease;
        }
        .wp-inquire-btn:hover {
          background: var(--gold);
          color: #0A0708;
          letter-spacing: 0.52em;
          box-shadow: 0 12px 32px -10px rgba(201,169,97,0.55);
        }

        /* ── FINAL WORD ── */
        .wp-final {
          padding: clamp(100px, 14vw, 160px) clamp(20px, 4vw, 60px);
          text-align: center;
          max-width: 720px;
          margin: 0 auto;
        }
        .wp-final-line {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(24px, 2.4vw, 32px);
          line-height: 1.5;
          color: var(--ink-strong);
          margin: 0 0 14px;
        }
        .wp-final-line.gold { color: var(--gold); }

        /* Grain overlay for vintage Caribbean photo texture */
        .wp-grain {
          position: fixed; inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.06;
          background-image:
            radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px);
          background-size: 3px 3px, 5px 5px;
          background-position: 0 0, 1px 1px;
          mix-blend-mode: overlay;
        }
      `}</style>

      <Link to="/shop" className="wp-return" data-testid="wp-return">
        <ArrowLeft size={14} /> RETURN
      </Link>

      {/* ─── 1. HERO (full-bleed cinematic video) ──────────────── */}
      <section className="wp-hero wp-hero--video" data-testid="wp-hero">
        <video
          className="wp-hero-bg-video"
          data-testid="wp-hero-video"
          src={HERO_VIDEO_SRC}
          poster={HERO_IMG}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label={HERO_ALT}
          ref={(el) => {
            if (el) {
              el.muted = true;
              const tryPlay = () => el.play().catch(() => {});
              tryPlay();
              el.addEventListener("loadedmetadata", tryPlay, { once: true });
              el.addEventListener("canplay", tryPlay, { once: true });
            }
          }}
        />
        <div className="wp-hero-scrim" aria-hidden="true" />
        <div className="wp-hero-overlay" data-testid="wp-hero-overlay">
          <p className="wp-hero-phase wp-hero-phase--1" data-testid="wp-hero-phase-1">
            <span className="wp-hero-eyebrow">PHILEON</span>
          </p>
          <h1 className="wp-hero-phase wp-hero-phase--2" data-testid="wp-hero-phase-2" style={{ margin: 0, fontSize: 'inherit', lineHeight: 'inherit', fontWeight: 'inherit' }}>
            <span className="wp-hero-title-overlay">WYNETTE&apos;S PALETTE</span>
          </h1>
          <p className="wp-hero-phase wp-hero-phase--3" data-testid="wp-hero-phase-3">
            <em className="wp-hero-tag-overlay">Every island brought a colour.</em>
          </p>
          <p className="wp-hero-phase wp-hero-phase--4" data-testid="wp-hero-phase-4">
            <span className="wp-hero-final-overlay">Some women wear colour.</span>
            <span className="wp-hero-final-overlay gold">Wynette collected it.</span>
          </p>
        </div>
      </section>

      {/* ─── 1B. OPENING STANZA ─────────────────────────────── */}
      <section className="wp-opening" data-testid="wp-opening">
        <p className="wp-stanza">
          She never returned from an island with souvenirs.
        </p>
        <p className="wp-stanza">She returned with colour.</p>
        <p className="wp-stanza dim">Ruby from one memory.</p>
        <p className="wp-stanza dim">Emerald from another.</p>
        <p className="wp-stanza dim">
          Sapphire from somewhere she never spoke about.
        </p>
        <p className="wp-stanza">
          Years later they gathered around a black centre stone like
          stories around a table.
        </p>
        <p className="wp-stanza" style={{ marginTop: 24 }}>
          <em>Not matching.</em>
        </p>
        <p className="wp-stanza">
          <em style={{ color: "var(--gold)" }}>Belonging.</em>
        </p>
      </section>

      {/* ─── 2. THE WOMAN ─────────────────────────────────────── */}
      <section className="wp-editorial" data-testid="wp-the-woman">
        <p className="wp-eyebrow">THE WOMAN</p>
        <h2 className="wp-section-title">She was the room.</h2>
        <p className="wp-stanza">Wynette entertained like Caribbean royalty.</p>
        <p className="wp-stanza dim">Music drifted through the garden.</p>
        <p className="wp-stanza dim">Champagne chilled beneath the palms.</p>
        <p className="wp-stanza dim">Conversations lasted until sunrise.</p>
        <div className="wp-rule" />
        <p className="wp-stanza">Nobody remembered the menu.</p>
        <p className="wp-stanza" style={{ color: "var(--gold)" }}>
          <em>Everybody remembered Wynette.</em>
        </p>
      </section>

      {/* ─── 3. THE PALETTE ───────────────────────────────────── */}
      <section className="wp-editorial" data-testid="wp-the-palette" style={{ paddingTop: 0 }}>
        <p className="wp-eyebrow">THE PALETTE</p>
        <h2 className="wp-section-title">A spectrum of memory.</h2>
        <p className="wp-stanza">At the centre sits a monumental black stone.</p>
        <p className="wp-stanza dim">Deep as midnight over the Atlantic.</p>
        <p className="wp-stanza">Around it gathers a spectrum of colour.</p>

        <div className="wp-palette-row" aria-hidden="true">
          {[
            ["#B5384D", "RUBY"],
            ["#2E7C5A", "EMERALD"],
            ["#2E4F8A", "SAPPHIRE"],
            ["#6F4A8A", "AMETHYST"],
            ["#C99A2E", "TOPAZ"],
            ["#E0A02C", "CITRINE"],
            ["#3F7FA0", "AQUAMARINE"],
          ].map(([color, name]) => (
            <div key={name} className="wp-swatch-col">
              <div className="wp-swatch" style={{ background: color }} />
              <span className="wp-swatch-label">{name}</span>
            </div>
          ))}
        </div>

        <p className="wp-stanza dim" style={{ marginTop: 36 }}>
          Each stone chosen for contrast.
        </p>
        <p className="wp-stanza dim">Each colour given room to speak.</p>
        <p className="wp-stanza">
          Together they become a celebration of Caribbean abundance.
        </p>
      </section>

      {/* ─── 4. THE GARDEN ────────────────────────────────────── */}
      <section className="wp-editorial" data-testid="wp-the-garden" style={{ paddingTop: 0 }}>
        <p className="wp-eyebrow">THE GARDEN</p>
        <h2 className="wp-section-title">Not decorated. Planted.</h2>
        <p className="wp-stanza">Look closely.</p>
        <p className="wp-stanza">The ring is not decorated.</p>
        <p className="wp-stanza" style={{ color: "var(--gold)" }}>
          <em>It is planted.</em>
        </p>
        <div className="wp-rule" />
        <p className="wp-stanza dim">Vines travel through the gallery.</p>
        <p className="wp-stanza dim">Colour emerges from every direction.</p>
        <p className="wp-stanza">
          The architecture recalls tropical gardens where orchids,
          bougainvillea, hibiscus and birds of paradise compete for attention.
        </p>
        <p className="wp-stanza dim">Order and chaos living side by side.</p>
      </section>

      {/* ─── 5. AFTER SUNSET ─────────────────────────────────── */}
      <section className="wp-editorial" data-testid="wp-after-sunset" style={{ paddingTop: 0 }}>
        <p className="wp-eyebrow">AFTER SUNSET</p>
        <h2 className="wp-section-title">For rooms that gain guests.</h2>
        <p className="wp-stanza">
          This is not a ring for ordinary afternoons.
        </p>
        <p className="wp-stanza dim">It belongs beside silk.</p>
        <p className="wp-stanza dim">Beside laughter.</p>
        <p className="wp-stanza dim">Beside live music.</p>
        <p className="wp-stanza dim">
          Beside a table that somehow keeps gaining guests.
        </p>
        <div className="wp-rule" />
        <p className="wp-stanza" style={{ color: "var(--gold)" }}>
          <em>The larger the room, the more comfortable it becomes.</em>
        </p>
      </section>

      {/* ─── 6. THE ARCHIVE ──────────────────────────────────── */}
      <section className="wp-archive" data-testid="wp-archive">
        <div className="wp-archive-head">
          <p className="wp-eyebrow">THE ARCHIVE</p>
        <h2 className="wp-section-title">Ten frames from her evenings.</h2>
          <p className="wp-stanza dim">
            The garden party, the last toast, the moon over Barbados,
            carnival royalty, after the music, and Wynette herself — ten
            frames where colour, light and laughter held the room together.
          </p>
        </div>
        <div className="wp-archive-grid">
          {GALLERY.map((g, i) => (
            <figure
              key={i}
              className="wp-archive-cell"
              data-testid={`wp-archive-cell-${i + 1}`}
            >
              <img src={g.src} alt={g.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>

      {/* ─── 7. SPECIFICATIONS ───────────────────────────────── */}
      <section className="wp-specs" data-testid="wp-specs">
        <p className="wp-eyebrow" style={{ textAlign: "center" }}>COMPOSITION · SPECIFICATIONS</p>
        <h2 className="wp-section-title" style={{ textAlign: "center" }}>
          The piece, in detail.
        </h2>
        <p className="wp-stanza" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 28px" }}>
          A celebration of colour, memory, and movement. Wynette&apos;s Palette
          is built around a commanding black onyx centre surrounded by a
          spectrum of natural gemstones inspired by Caribbean gardens, evening
          gatherings, and moonlit coastlines.
        </p>
        <p className="wp-stanza dim" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          The openwork gallery carries colour throughout the piece, creating
          a ring that reveals something new from every angle.
        </p>
        <div style={{ marginTop: 56 }}>
          {SPECS.map(([k, v]) => (
            <div key={k} className="wp-spec-row">
              <div className="wp-spec-key">{k}</div>
              <div className="wp-spec-val">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7B. CONFIGURATOR + PURCHASE ─────────────────────── */}
      <section className="wp-configurator" data-testid="wp-configurator">
        <style>{`
          .wp-configurator {
            padding: clamp(60px, 9vw, 110px) clamp(20px, 4vw, 60px) clamp(40px, 6vw, 80px);
            max-width: 720px;
            margin: 0 auto;
          }
          .wp-config-head { text-align: center; margin-bottom: 56px; }
          .wp-live-price {
            margin: 28px 0 0;
            font-family: 'Playfair Display', serif;
            font-weight: 500;
            font-size: clamp(28px, 3.4vw, 44px);
            letter-spacing: -0.005em;
            color: var(--gold);
            line-height: 1;
            font-variant-numeric: tabular-nums;
            transition: opacity 320ms ease;
          }
          .wp-config-block { margin: 0 0 36px; }
          .wp-config-label {
            font-family: 'Cinzel', serif;
            font-size: 11px;
            letter-spacing: 0.42em;
            color: var(--gold);
            text-transform: uppercase;
            margin: 0 0 16px;
          }
          .wp-metal-row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }
          .wp-metal-opt {
            flex: 1 1 200px;
            min-width: 0;
            padding: 16px 20px;
            background: transparent;
            border: 1px solid var(--rule);
            color: var(--ink);
            font-family: 'Cinzel', serif;
            font-size: 12px;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            cursor: pointer;
            transition:
              border-color 220ms ease,
              color 220ms ease,
              background 220ms ease,
              letter-spacing 220ms ease;
          }
          .wp-metal-opt:hover {
            border-color: var(--gold-deeper);
            color: var(--ink-strong);
          }
          .wp-metal-opt.is-active {
            border-color: var(--gold);
            color: var(--gold);
            background: rgba(201,169,97,0.06);
            letter-spacing: 0.32em;
          }
          @media (max-width: 540px) {
            .wp-metal-row { flex-direction: column; }
            .wp-metal-opt { flex: 1 1 auto; width: 100%; }
          }
          .wp-size-select {
            width: 100%;
            padding: 16px 20px;
            background: transparent;
            border: 1px solid var(--rule);
            color: var(--ink-strong);
            font-family: 'Cinzel', serif;
            font-size: 14px;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            background-image:
              linear-gradient(45deg, transparent 50%, var(--gold) 50%),
              linear-gradient(135deg, var(--gold) 50%, transparent 50%);
            background-position:
              calc(100% - 22px) 50%,
              calc(100% - 14px) 50%;
            background-size: 8px 8px, 8px 8px;
            background-repeat: no-repeat;
            transition: border-color 220ms ease;
          }
          .wp-size-select:hover,
          .wp-size-select:focus { border-color: var(--gold); outline: none; }
          .wp-size-select option {
            background: var(--bg);
            color: var(--ink-strong);
          }

          .wp-purchase {
            margin-top: 48px;
            padding-top: 36px;
            border-top: 1px solid var(--rule);
            text-align: center;
          }
          .wp-purchase-eyebrow {
            font-family: 'Cinzel', serif;
            font-size: 12px;
            letter-spacing: 0.42em;
            color: var(--gold);
            margin: 0 0 4px;
          }
          .wp-purchase-lead {
            font-family: 'Cinzel', serif;
            font-size: 10.5px;
            letter-spacing: 0.32em;
            text-transform: uppercase;
            color: var(--ink-muted);
            margin: 0 0 24px;
          }
          .wp-purchase-copy {
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-size: 17px;
            line-height: 1.7;
            color: var(--ink);
            max-width: 520px;
            margin: 0 auto 14px;
          }
          .wp-purchase-copy.dim { color: var(--ink-muted); }
          .wp-quote-btn {
            margin-top: 36px;
            display: inline-block;
            padding: 20px 56px;
            font-family: 'Cinzel', serif;
            font-size: 13px;
            letter-spacing: 0.48em;
            color: var(--ink-strong);
            background: transparent;
            border: 1px solid var(--gold);
            cursor: pointer;
            transition:
              background 260ms ease,
              color 260ms ease,
              letter-spacing 260ms ease,
              box-shadow 320ms ease;
          }
          .wp-quote-btn:hover {
            background: var(--gold);
            color: #0A0708;
            letter-spacing: 0.52em;
            box-shadow: 0 12px 32px -10px rgba(201,169,97,0.55);
          }
          .wp-quote-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>

        <div className="wp-config-head">
          <p className="wp-eyebrow">CONFIGURE YOUR PIECE</p>
          <h2 className="wp-section-title">Three metals, one centre stone.</h2>
          <p className="wp-live-price" data-testid="wp-live-price">{priceFormatted}</p>
        </div>

        <div className="wp-config-block">
          <p className="wp-config-label">Metal</p>
          <div className="wp-metal-row" role="radiogroup" aria-label="Metal">
            {METAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={metalId === opt.id}
                className={`wp-metal-opt${metalId === opt.id ? " is-active" : ""}`}
                data-testid={`wp-metal-${opt.id}`}
                onClick={() => setMetalId(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="wp-config-block">
          <label htmlFor="wp-ring-size" className="wp-config-label">Ring Size</label>
          <select
            id="wp-ring-size"
            className="wp-size-select"
            data-testid="wp-ring-size"
            value={ringSize}
            onChange={(e) => setRingSize(e.target.value)}
          >
            {RING_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="wp-purchase" data-testid="wp-purchase">
          <p className="wp-purchase-eyebrow">MADE TO ORDER</p>
          <p className="wp-purchase-lead">Lead Time · 4–6 Weeks</p>
          <p className="wp-purchase-copy">
            Each Wynette&apos;s Palette ring is individually produced and
            finished to order.
          </p>
          <p className="wp-purchase-copy dim">
            Select your preferred metal and ring size.
          </p>
          <button
            type="button"
            className="wp-quote-btn"
            data-testid="wp-add-to-cart"
            onClick={onAddToCart}
            disabled={isAdding || !priceUsd}
          >
            {buttonText}
          </button>
        </div>
      </section>

      {/* ─── 7C. CRAFT ───────────────────────────────────────── */}
      <section className="wp-editorial" data-testid="wp-craft" style={{ paddingTop: 0 }}>
        <p className="wp-eyebrow">THE CRAFT</p>
        <h2 className="wp-section-title">Light moves through colour.</h2>
        <p className="wp-stanza">
          The elevated gallery is fully openworked, allowing light to move
          through the coloured stones from every direction.
        </p>
        <p className="wp-stanza dim">
          The broad 22mm face is balanced by a tapered shank, keeping the
          ring wearable while maintaining its dramatic presence.
        </p>
        <p className="wp-stanza">
          Every gemstone is individually set by hand throughout the crown
          and gallery.
        </p>
      </section>

      {/* ─── 9. FINAL WORD ───────────────────────────────────── */}
      <section className="wp-final" data-testid="wp-final-word">
        <p className="wp-final-line">Some women wear colour.</p>
        <p className="wp-final-line gold">Wynette collected it.</p>
      </section>

      <div className="wp-grain" aria-hidden="true" />
    </div>
  );
}
