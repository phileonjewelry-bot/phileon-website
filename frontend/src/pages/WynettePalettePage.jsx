import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
const HERO_ALT =
  "WYNETTE'S PALETTE — collector cocktail ring with a rose-cut black centre stone surrounded by a halo of ruby, emerald, sapphire, amethyst, topaz, citrine and aquamarine; hand-engraved white-gold openwork gallery.";

// Temporary archive — same hero asset as placeholder across five named
// frames per current creative direction. Will be replaced by bespoke
// editorial shoots (garden party, last toast, moon over Barbados,
// carnival royalty, after the music).
const GALLERY = [
  { src: HERO_IMG, label: "The garden party", alt: HERO_ALT },
  { src: HERO_IMG, label: "The last toast", alt: HERO_ALT },
  { src: HERO_IMG, label: "Moon over Barbados", alt: HERO_ALT },
  { src: HERO_IMG, label: "Carnival royalty", alt: HERO_ALT },
  { src: HERO_IMG, label: "After the music", alt: HERO_ALT },
];

const SPECS = [
  ["Collection", "PHILEON"],
  ["Piece", "Wynette's Palette"],
  ["Category", "Collector Cocktail Ring"],
  ["Metal", "18K White Gold"],
  ["Centre Stone", "Black Rose-Cut Stone"],
  ["Accent Stones", "Multi-Colour Gemstone Halo"],
  ["Gallery", "Hand-Engraved Openwork Architecture"],
  ["Availability", "Made To Order"],
  ["Lead Time", "4–6 Weeks"],
  ["Price", "Price upon request"],
];

export default function WynettePalettePage() {
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

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

  const handleInquire = () => {
    const subject = encodeURIComponent(
      "Inquiry — Wynette's Palette (Collector Cocktail Ring)"
    );
    const body = encodeURIComponent(
      "Hello PHILEON,\n\nI'm interested in commissioning Wynette's Palette. " +
        "Could you share availability, pricing and lead time for my ring size?\n\n" +
        "Thank you."
    );
    window.location.href = `mailto:atelier@phileon.com?subject=${subject}&body=${body}`;
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

        /* ── HERO ── */
        .wp-hero {
          position: relative;
          width: 100%;
          background: var(--bg-deep);
          padding: 48px 0 96px;
          overflow: hidden;
        }
        .wp-hero::before,
        .wp-hero::after {
          content: "";
          position: absolute; inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .wp-hero::before {
          background:
            radial-gradient(ellipse 60% 55% at 50% 48%,
              rgba(201, 169, 97, 0.10) 0%,
              transparent 65%),
            radial-gradient(ellipse 80% 60% at 50% 100%,
              rgba(46, 79, 138, 0.08),
              transparent 70%);
        }
        .wp-hero::after {
          /* slow spotlight shimmer */
          background: radial-gradient(
            circle 240px at var(--shimmer-x, 50%) var(--shimmer-y, 38%),
            rgba(247, 240, 221, 0.10) 0%,
            transparent 70%
          );
          mix-blend-mode: screen;
          animation: wpShimmer 9s ease-in-out infinite alternate;
        }
        @keyframes wpShimmer {
          0%   { --shimmer-x: 38%; --shimmer-y: 34%; opacity: 0.65; }
          50%  { --shimmer-x: 56%; --shimmer-y: 42%; opacity: 0.95; }
          100% { --shimmer-x: 46%; --shimmer-y: 38%; opacity: 0.55; }
        }

        .wp-hero-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(40px, 6vw, 96px);
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 60px);
          align-items: center;
        }
        @media (max-width: 880px) {
          .wp-hero-grid { grid-template-columns: 1fr; gap: 48px; }
        }
        .wp-hero-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }
        .wp-hero-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          filter: drop-shadow(0 40px 80px rgba(0, 0, 0, 0.85));
          transform: translateY(0);
          transition: transform 1400ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .is-loaded .wp-hero-img { animation: wpFloat 14s ease-in-out infinite alternate; }
        @keyframes wpFloat {
          0%   { transform: translateY(0) scale(1.00); }
          100% { transform: translateY(-14px) scale(1.012); }
        }

        .wp-hero-text { color: var(--ink); }
        .wp-collection {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          color: var(--gold);
          margin: 0 0 20px;
        }
        .wp-hero-title {
          font-family: 'Playfair Display', serif;
          font-weight: 500;
          font-size: clamp(48px, 6.2vw, 84px);
          line-height: 0.96;
          letter-spacing: -0.005em;
          margin: 0 0 14px;
          color: var(--ink-strong);
        }
        .wp-tagline {
          font-style: italic;
          font-weight: 300;
          font-size: clamp(20px, 1.6vw, 24px);
          color: var(--gold);
          margin: 0 0 36px;
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
        .wp-archive-grid > :nth-child(5) { grid-column: 1 / -1; }
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

      {/* ─── 1. HERO ─────────────────────────────────────────── */}
      <section className="wp-hero" data-testid="wp-hero">
        <div className="wp-hero-grid">
          <div
            className="wp-hero-img-wrap"
            ref={heroRef}
            style={{ transform: `translateY(${heroParallax * 0.3}px)` }}
          >
            <img
              src={HERO_IMG}
              alt={HERO_ALT}
              className="wp-hero-img"
              data-testid="wp-hero-img"
              loading="eager"
            />
          </div>
          <div className="wp-hero-text" data-testid="wp-hero-text">
            <p className="wp-collection">PHILEON</p>
            <h1 className="wp-hero-title" data-testid="wp-hero-title">
              WYNETTE&apos;S<br />PALETTE
            </h1>
            <p className="wp-tagline">Every island brought a colour.</p>
            <p className="wp-hero-stanza">
              She never returned from an island with souvenirs.
            </p>
            <p className="wp-hero-stanza">She returned with colour.</p>
            <p className="wp-hero-stanza muted">Ruby from one memory.</p>
            <p className="wp-hero-stanza muted">Emerald from another.</p>
            <p className="wp-hero-stanza muted">
              Sapphire from somewhere she never spoke about.
            </p>
            <p className="wp-hero-stanza">
              Years later they gathered around a black centre stone like
              stories around a table.
            </p>
            <p className="wp-hero-stanza" style={{ marginTop: 24 }}>
              <em>Not matching.</em>
            </p>
            <p className="wp-hero-stanza">
              <em style={{ color: "var(--gold)" }}>Belonging.</em>
            </p>
          </div>
        </div>
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
          <h2 className="wp-section-title">Five frames from her evenings.</h2>
          <p className="wp-stanza dim">
            The garden party, the last toast, the moon over Barbados, carnival
            royalty, and after the music — five frames where colour, light and
            laughter held the room together.
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
              <figcaption className="wp-archive-caption">{g.label}</figcaption>
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
        <div style={{ marginTop: 40 }}>
          {SPECS.map(([k, v]) => (
            <div key={k} className="wp-spec-row">
              <div className="wp-spec-key">{k}</div>
              <div className="wp-spec-val">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 8. INQUIRE ──────────────────────────────────────── */}
      <section className="wp-cta-block" data-testid="wp-cta-block">
        <p className="wp-cta-price" data-testid="wp-price">PRICE UPON REQUEST</p>
        <p className="wp-cta-sub">Created individually for each collector.</p>
        <button
          type="button"
          className="wp-inquire-btn"
          data-testid="wp-inquire-btn"
          onClick={handleInquire}
        >
          INQUIRE
        </button>
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
