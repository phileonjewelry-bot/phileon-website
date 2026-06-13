import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO_AMETHYST = "/uncle-jo/hero-amethyst.jpg";
const HERO_SAPPHIRE = "/uncle-jo/hero-sapphire.jpg";

const HERO_ALT = "UNCLE JO — sterling silver chain-link statement ring, emerald-cut bezel-set stone (Purple Amethyst shown).";

// 4 × 2 × 2 = 16 SKU permutations. Hand-set USD prices mirror
// lockedBasePriceCad in livePricingConfig + pricing_engine so the
// /api/validate-cart endpoint returns diff=0. CAD spec from atelier
// (1500/1650/1800/1950 silver → 5200/5800/6400/7200 18K).
const TIER_MATRIX = {
  silver: {
    amethyst: { synthetic: 1100, genuine: 1350 },
    sapphire: { synthetic: 1250, genuine: 1450 },
  },
  gold10k: {
    amethyst: { synthetic: 2100, genuine: 2550 },
    sapphire: { synthetic: 2350, genuine: 2950 },
  },
  gold14k: {
    amethyst: { synthetic: 2850, genuine: 3450 },
    sapphire: { synthetic: 3150, genuine: 3900 },
  },
  gold18k: {
    amethyst: { synthetic: 3900, genuine: 4800 },
    sapphire: { synthetic: 4350, genuine: 5400 },
  },
};

const METAL_OPTIONS = [
  { id: "silver",  label: "Sterling Silver", short: "SS",  tier: "ENTRY" },
  { id: "gold10k", label: "10K White Gold",  short: "10K", tier: "FOUNDATION" },
  { id: "gold14k", label: "14K White Gold",  short: "14K", tier: "SIGNATURE" },
  { id: "gold18k", label: "18K White Gold",  short: "18K", tier: "HEIRLOOM" },
];

const STONE_OPTIONS = [
  { id: "amethyst", label: "Purple Amethyst", short: "AMETHYST", swatch: "#5C2A6B" },
  { id: "sapphire", label: "Blue Sapphire",   short: "SAPPHIRE", swatch: "#1F3A8A" },
];

const QUALITY_OPTIONS = [
  { id: "synthetic", label: "Synthetic", short: "SYN" },
  { id: "genuine",   label: "Genuine",   short: "GEN" },
];

const RING_SIZES = ["8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13"];

const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;

const SPECS = [
  ["Collection", "PHILEON Fine Jewelry — Dedication Piece"],
  ["Piece", "Uncle Jo"],
  ["Dedicated To", "Joseph Wilson"],
  ["Metal", "Sterling Silver · 10K · 14K · 18K White Gold"],
  ["Stone Options", "Purple Amethyst · Blue Sapphire"],
  ["Setting", "Bezel Set"],
  ["Cut", "Emerald Cut"],
  ["Style", "Chain Link Statement Ring"],
  ["Origin", "Handcrafted by Phileon"],
  ["Availability", "Made To Order"],
  ["Lead Time", "3–4 Weeks"],
  ["Shipping", "Insured · Included"],
];

const GALLERY = [
  { src: HERO_AMETHYST, alt: "UNCLE JO — Purple Amethyst hero: rectangular emerald-cut stone in clean bezel above the four-row chain-linked shank." },
  { src: HERO_SAPPHIRE, alt: "UNCLE JO — Blue Sapphire hero: rectangular emerald-cut stone in clean bezel above the four-row chain-linked shank." },
];

export default function UncleJoPage() {
  const [scrollY, setScrollY] = useState(0);
  const [metalId, setMetalId] = useState("silver");
  const [stoneId, setStoneId] = useState("amethyst");
  const [qualityId, setQualityId] = useState("synthetic");
  const [ringSize, setRingSize] = useState("9.5");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "UNCLE JO — PHILEON Fine Jewelry · Dedication Piece";
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const currentMetal = METAL_OPTIONS.find((m) => m.id === metalId);
  const currentStone = STONE_OPTIONS.find((s) => s.id === stoneId);
  const currentQuality = QUALITY_OPTIONS.find((q) => q.id === qualityId);
  const priceUsd = TIER_MATRIX[metalId][stoneId][qualityId];
  const priceFormatted = formatUsd(priceUsd);
  const tierKey = `${metalId}_${stoneId}_${qualityId}`;
  const heroImage = stoneId === "sapphire" ? HERO_SAPPHIRE : HERO_AMETHYST;
  const heroParallax = Math.min(scrollY * 0.18, 120);

  const onAddToCart = () => {
    const variant = `${currentMetal.label} · ${currentStone.label} · ${currentQuality.label} · Size ${ringSize}`;
    handleAddToCart(
      {
        id: `uncle-jo-${tierKey}-${ringSize}`,
        name: `UNCLE JO — ${variant}`,
        price: priceUsd,
        productKey: "uncleJo",
        tierKey,
        metal: currentMetal.label,
        stone: currentStone.label,
        quality: currentQuality.label,
        ringSize,
        sku: `UNCLEJO-${currentMetal.short}-${currentStone.short}-${currentQuality.short}-${ringSize.replace(".", "")}`,
        quantity: 1,
        image: heroImage,
      },
      1,
      variant,
    );
  };

  return (
    <div className="uj-page" data-testid="uncle-jo-page">
      <style>{`
        .uj-page {
          --bg: #0a0a0c;
          --bg-deep: #050507;
          --ink: #e9e3d6;
          --ink-strong: #fbf6e9;
          --ink-muted: #8d8676;
          --silver: #c7c8cc;
          --silver-dim: #8e8f93;
          --amethyst: #6a3a7e;
          --sapphire: #2a4ea8;
          --rule: rgba(255,255,255,0.16);
          --rule-soft: rgba(255,255,255,0.08);

          background: var(--bg);
          color: var(--ink);
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          min-height: 100vh;
        }
        .uj-return {
          font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.35em;
          color: var(--ink-muted); text-decoration: none;
          display: inline-flex; align-items: center; gap: 10px;
          padding: 28px 0 14px 60px;
          transition: color 220ms ease;
        }
        .uj-return:hover { color: var(--silver); }
        @media (max-width: 720px) { .uj-return { padding: 24px 0 12px 20px; } }

        .uj-section {
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(56px, 8vw, 112px) clamp(20px, 4vw, 60px);
        }

        .uj-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.45em;
          color: var(--silver-dim); text-transform: uppercase;
          margin: 0 0 22px;
        }
        .uj-h2 {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          font-size: clamp(34px, 4.4vw, 56px);
          line-height: 1.08; letter-spacing: -0.01em;
          color: var(--ink-strong);
          margin: 0 0 28px;
        }
        .uj-p {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(17px, 1.45vw, 21px);
          line-height: 1.62;
          color: var(--ink);
          margin: 0 0 18px;
        }
        .uj-p em, .uj-p i { font-style: italic; color: var(--ink-strong); }

        /* ─── 1. HERO ──────────────────────────────────────────── */
        .uj-hero {
          position: relative;
          padding: 56px 0 104px;
          background: radial-gradient(ellipse 60% 50% at 50% 35%, rgba(106,58,126,0.06), transparent 70%), var(--bg-deep);
          overflow: hidden;
        }
        .uj-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(40px, 6vw, 96px);
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 60px);
          align-items: center;
        }
        @media (max-width: 880px) { .uj-hero-grid { grid-template-columns: 1fr; gap: 40px; } }
        .uj-hero-img-wrap {
          position: relative;
          aspect-ratio: 1 / 1;
          display: flex; align-items: center; justify-content: center;
          will-change: transform;
        }
        .uj-hero-img {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.9)) drop-shadow(0 0 24px rgba(255,255,255,0.05));
          transition: opacity 480ms ease;
        }
        @media (max-width: 768px) {
          .uj-hero-img-wrap { aspect-ratio: auto; min-height: 65vw; }
          .uj-hero-img { height: auto; transform: scale(1.25); transform-origin: center center; }
        }
        .uj-collection {
          font-family: 'Cinzel', serif;
          font-size: 10.5px; letter-spacing: 0.42em;
          color: var(--silver); text-transform: uppercase;
          margin: 0 0 16px;
        }
        .uj-hero-title {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          font-size: clamp(56px, 8vw, 104px);
          line-height: 0.94; letter-spacing: -0.02em;
          color: var(--ink-strong);
          margin: 0 0 14px;
        }
        .uj-dedication {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(14px, 1.2vw, 17px);
          line-height: 1.5;
          color: var(--silver-dim);
          margin: 0 0 18px;
          letter-spacing: 0.02em;
        }
        .uj-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(18px, 1.7vw, 24px);
          color: var(--ink);
          margin: 0 0 28px;
          line-height: 1.4;
        }
        .uj-hero-specs {
          display: grid;
          grid-template-columns: repeat(2, auto);
          gap: 18px 36px;
          margin-top: 28px;
          padding-top: 28px;
          border-top: 1px solid var(--rule-soft);
        }
        @media (max-width: 540px) { .uj-hero-specs { grid-template-columns: 1fr; } }
        .uj-hero-spec-k {
          font-family: 'Cinzel', serif;
          font-size: 10px; letter-spacing: 0.32em;
          color: var(--silver-dim); text-transform: uppercase;
          margin: 0 0 4px;
        }
        .uj-hero-spec-v {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          color: var(--ink-strong);
          margin: 0;
        }

        /* ─── EDITORIAL ────────────────────────────────────────── */
        .uj-editorial-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.45em;
          color: var(--silver); text-transform: uppercase;
          margin: 0 0 32px;
        }
        .uj-divider {
          width: 64px; height: 1px;
          background: var(--rule); margin: 56px 0;
        }

        /* ─── ARCHIVE GALLERY ──────────────────────────────────── */
        .uj-archive-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(16px, 2vw, 28px);
          margin-top: 28px;
        }
        .uj-archive-cell {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: var(--bg-deep);
          border: 1px solid var(--rule-soft);
        }
        .uj-archive-cell img {
          width: 100%; height: 100%;
          object-fit: contain;
          transition: transform 600ms ease, opacity 480ms ease;
        }
        .uj-archive-cell:hover img { transform: scale(1.02); }
        @media (max-width: 720px) {
          .uj-archive-grid { grid-template-columns: 1fr; }
        }

        /* ─── SPECS TABLE ──────────────────────────────────────── */
        .uj-specs-row {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 24px;
          padding: 18px 0;
          border-bottom: 1px solid var(--rule-soft);
        }
        .uj-specs-row:first-of-type { border-top: 1px solid var(--rule-soft); }
        @media (max-width: 640px) {
          .uj-specs-row { grid-template-columns: 1fr; gap: 4px; padding: 14px 0; }
        }
        .uj-specs-k {
          font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.32em;
          color: var(--silver-dim); text-transform: uppercase;
        }
        .uj-specs-v {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          color: var(--ink-strong);
        }

        /* ─── CONFIGURATOR ─────────────────────────────────────── */
        .uj-config {
          max-width: 880px;
          margin: 0 auto;
          padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 60px) clamp(48px, 6vw, 72px);
          text-align: center;
        }
        .uj-config-head { margin-bottom: 48px; }
        .uj-price-line {
          font-family: 'Cinzel', serif;
          font-size: clamp(20px, 2.2vw, 28px);
          letter-spacing: 0.22em;
          color: var(--silver);
          margin: 12px 0 0;
        }
        .uj-config-group { margin-top: 32px; text-align: left; }
        .uj-config-label {
          display: block;
          font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.38em;
          color: var(--silver-dim); text-transform: uppercase;
          margin-bottom: 14px;
        }

        .uj-opt-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .uj-opt-row.cols-2 { grid-template-columns: 1fr 1fr; }
        @media (max-width: 640px) {
          .uj-opt-row { grid-template-columns: 1fr 1fr; }
          .uj-opt-row.cols-2 { grid-template-columns: 1fr 1fr; }
        }
        .uj-opt {
          appearance: none;
          background: transparent;
          color: var(--ink-muted);
          border: 1px solid var(--rule-soft);
          padding: 16px 12px 14px;
          cursor: pointer;
          text-align: center;
          font-family: 'Cinzel', serif;
          transition: border-color 220ms ease, color 220ms ease, background 220ms ease;
        }
        .uj-opt:hover { border-color: var(--rule); color: var(--ink); }
        .uj-opt.is-active {
          border-color: var(--silver);
          color: var(--ink-strong);
          background: rgba(255,255,255,0.04);
          box-shadow: 0 0 0 1px var(--silver) inset;
        }
        .uj-opt-tier {
          font-size: 9.5px; letter-spacing: 0.38em;
          color: var(--silver-dim);
          margin: 0 0 6px;
        }
        .uj-opt-label {
          font-size: 11.5px; letter-spacing: 0.24em;
          color: inherit; margin: 0;
          text-transform: uppercase;
        }
        .uj-opt-stone {
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .uj-opt-swatch {
          width: 14px; height: 14px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.4);
        }

        .uj-size-select {
          width: 100%;
          appearance: none;
          background: transparent;
          color: var(--ink-strong);
          border: 1px solid var(--rule);
          padding: 16px 18px;
          font-family: 'Cinzel', serif;
          font-size: 13px; letter-spacing: 0.22em;
          cursor: pointer;
          background-image: linear-gradient(45deg, transparent 50%, var(--silver) 50%),
                            linear-gradient(135deg, var(--silver) 50%, transparent 50%);
          background-position: calc(100% - 22px) 50%, calc(100% - 16px) 50%;
          background-size: 6px 6px;
          background-repeat: no-repeat;
        }
        .uj-size-select option { background: var(--bg); color: var(--ink-strong); }

        .uj-purchase {
          margin-top: 56px;
          text-align: center;
          border-top: 1px solid var(--rule-soft);
          padding-top: 40px;
        }
        .uj-purchase-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 10.5px; letter-spacing: 0.46em;
          color: var(--silver-dim); margin: 0 0 6px;
        }
        .uj-purchase-lead {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 15px; color: var(--ink-muted); margin: 0 0 24px;
        }
        .uj-btn {
          font-family: 'Cinzel', serif;
          font-size: 12px; letter-spacing: 0.42em;
          color: var(--ink-strong);
          background: transparent;
          border: 1px solid var(--silver);
          padding: 18px 44px;
          cursor: pointer;
          text-transform: uppercase;
          transition: background 280ms ease, color 280ms ease, letter-spacing 280ms ease;
        }
        .uj-btn:hover { background: var(--silver); color: var(--bg-deep); letter-spacing: 0.48em; }
        .uj-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ─── FINAL WORD ───────────────────────────────────────── */
        .uj-final {
          background: var(--bg-deep);
          padding: clamp(72px, 9vw, 128px) clamp(20px, 4vw, 60px);
          text-align: center;
          border-top: 1px solid var(--rule-soft);
        }
        .uj-final-stanza {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(18px, 1.7vw, 24px);
          line-height: 1.7;
          color: var(--ink);
          max-width: 680px;
          margin: 0 auto 26px;
        }
        .uj-final-stanza strong {
          font-style: normal;
          font-family: 'Cinzel', serif;
          font-size: 14px;
          letter-spacing: 0.42em;
          color: var(--silver);
          display: block;
          margin-top: 12px;
        }
      `}</style>

      <Link to="/shop" className="uj-return" data-testid="uj-return"><ArrowLeft size={14} /> RETURN</Link>

      {/* 1. HERO */}
      <section className="uj-hero" data-testid="uj-hero">
        <div className="uj-hero-grid">
          <div className="uj-hero-img-wrap" style={{ transform: `translateY(${heroParallax * 0.25}px)` }}>
            <img
              src={heroImage}
              alt={HERO_ALT}
              className="uj-hero-img"
              data-testid="uj-hero-img"
              key={heroImage}
            />
          </div>
          <div>
            <p className="uj-collection">PHILEON FINE JEWELRY — DEDICATION PIECE</p>
            <h1 className="uj-hero-title" data-testid="uj-hero-title">UNCLE JO</h1>
            <p className="uj-dedication" data-testid="uj-dedication">Created for Joseph Wilson.</p>
            <p className="uj-tagline" data-testid="uj-tagline">"Made for Uncle Jo."</p>

            <div className="uj-hero-specs">
              <div>
                <p className="uj-hero-spec-k">Metal</p>
                <p className="uj-hero-spec-v">Sterling Silver</p>
              </div>
              <div>
                <p className="uj-hero-spec-k">Stone</p>
                <p className="uj-hero-spec-v">Selectable</p>
              </div>
              <div>
                <p className="uj-hero-spec-k">Setting</p>
                <p className="uj-hero-spec-v">Bezel Set</p>
              </div>
              <div>
                <p className="uj-hero-spec-k">Cut</p>
                <p className="uj-hero-spec-v">Emerald Cut</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OPENING EDITORIAL */}
      <section className="uj-section" data-testid="uj-opening">
        <p className="uj-editorial-eyebrow">THE PIECE</p>
        <p className="uj-p"><em>Sterling silver, woven into weight.</em></p>
        <p className="uj-p">A rectangular-cut stone sits above the chain-linked body, available in either Purple Amethyst or Blue Sapphire, held in a clean bezel and carried with the calm certainty of a man who never needed to announce himself.</p>
        <div className="uj-divider" />
        <p className="uj-p">This ring was created in honor of my uncle.</p>
        <p className="uj-p">One day he asked his nephew to make him something nice.</p>
        <p className="uj-p">What began as a simple request became a permanent piece of family history.</p>
        <p className="uj-p"><em>Made for Uncle Jo.</em></p>
        <p className="uj-p">Nothing more needed to be said.</p>
        <div className="uj-divider" />
        <p className="uj-p">This is not a loud ring.</p>
        <p className="uj-p">It is a familiar one.</p>
        <p className="uj-p">The kind of piece that feels like it has already lived a life before it reaches the hand.</p>
      </section>

      {/* 3. COMPOSITION */}
      <section className="uj-section" data-testid="uj-composition">
        <p className="uj-editorial-eyebrow">COMPOSITION</p>
        <h2 className="uj-h2">Sterling silver throughout.</h2>
        <p className="uj-p">The shank is built from four rows of interlocking chain link — woven wide, worn with quiet gravity.</p>
        <p className="uj-p">The stone sits above it in a clean bezel, held without flourish.</p>
        <p className="uj-p">Nothing is forced. Nothing is excessive. Every detail serves a purpose.</p>
      </section>

      {/* 4. STRUCTURE */}
      <section className="uj-section" data-testid="uj-structure">
        <p className="uj-editorial-eyebrow">STRUCTURE</p>
        <h2 className="uj-h2">The mesh carries the weight — literally and otherwise.</h2>
        <p className="uj-p">It is not decorative. It is foundational.</p>
        <p className="uj-p">Each linked row adds to something that does not need to raise its voice to be felt across a room.</p>
        <p className="uj-p">The ring wears like a piece that has already earned its place.</p>
      </section>

      {/* 5. CRAFT */}
      <section className="uj-section" data-testid="uj-craft">
        <p className="uj-editorial-eyebrow">CRAFT</p>
        <h2 className="uj-h2">The bezel is clean and deliberate.</h2>
        <p className="uj-p">No prongs. No reach. Just sterling silver calmly wrapping a rectangular stone.</p>
        <p className="uj-p">Whether chosen in Purple Amethyst or Blue Sapphire, the center stone is allowed to speak for itself.</p>
        <p className="uj-p">The setting does not compete. <em>It simply supports.</em></p>
      </section>

      {/* 6. ARCHIVE GALLERY */}
      <section className="uj-section" data-testid="uj-archive">
        <p className="uj-editorial-eyebrow">ARCHIVE</p>
        <h2 className="uj-h2">Two stones. One silhouette.</h2>
        <p className="uj-p">A chain-link body that does not change. A stone that does.</p>
        <div className="uj-archive-grid">
          {GALLERY.map((g, i) => (
            <div key={g.src} className="uj-archive-cell" data-testid={`uj-archive-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* 7. SPECIFICATIONS */}
      <section className="uj-section" data-testid="uj-specs">
        <p className="uj-editorial-eyebrow">SPECIFICATIONS</p>
        <h2 className="uj-h2">The record.</h2>
        <div>
          {SPECS.map(([k, v]) => (
            <div key={k} className="uj-specs-row">
              <div className="uj-specs-k">{k}</div>
              <div className="uj-specs-v">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CONFIGURATOR */}
      <section className="uj-config" data-testid="uj-configurator">
        <div className="uj-config-head">
          <p className="uj-eyebrow">CONFIGURE YOUR PIECE</p>
          <h2 className="uj-h2">Four metals. Two stones. Two qualities.</h2>
          <p className="uj-price-line" data-testid="uj-price">{priceFormatted}</p>
        </div>

        <div className="uj-config-group">
          <label className="uj-config-label">Metal</label>
          <div className="uj-opt-row" role="radiogroup" aria-label="Metal">
            {METAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={metalId === opt.id}
                className={`uj-opt${metalId === opt.id ? " is-active" : ""}`}
                data-testid={`uj-metal-${opt.id}`}
                onClick={() => setMetalId(opt.id)}
              >
                <p className="uj-opt-tier">{opt.tier}</p>
                <p className="uj-opt-label">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="uj-config-group">
          <label className="uj-config-label">Stone</label>
          <div className="uj-opt-row cols-2" role="radiogroup" aria-label="Stone">
            {STONE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={stoneId === opt.id}
                className={`uj-opt${stoneId === opt.id ? " is-active" : ""}`}
                data-testid={`uj-stone-${opt.id}`}
                onClick={() => setStoneId(opt.id)}
              >
                <div className="uj-opt-stone">
                  <span className="uj-opt-swatch" style={{ background: opt.swatch }} />
                  <span className="uj-opt-label">{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="uj-config-group">
          <label className="uj-config-label">Stone Quality</label>
          <div className="uj-opt-row cols-2" role="radiogroup" aria-label="Stone Quality">
            {QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={qualityId === opt.id}
                className={`uj-opt${qualityId === opt.id ? " is-active" : ""}`}
                data-testid={`uj-quality-${opt.id}`}
                onClick={() => setQualityId(opt.id)}
              >
                <p className="uj-opt-label">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="uj-config-group">
          <label htmlFor="uj-ring-size" className="uj-config-label">Ring Size</label>
          <select
            id="uj-ring-size"
            className="uj-size-select"
            data-testid="uj-ring-size"
            value={ringSize}
            onChange={(e) => setRingSize(e.target.value)}
          >
            {RING_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="uj-purchase">
          <p className="uj-purchase-eyebrow">MADE TO ORDER</p>
          <p className="uj-purchase-lead">Lead Time · 3–4 Weeks · Insured Shipping Included</p>
          <button
            type="button"
            className="uj-btn"
            data-testid="uj-add-to-cart"
            onClick={onAddToCart}
            disabled={isAdding}
          >
            {buttonText}
          </button>
        </div>
      </section>

      {/* 9. FINAL WORD */}
      <section className="uj-final" data-testid="uj-final-word">
        <p className="uj-final-stanza">There are men who are introduced.</p>
        <p className="uj-final-stanza">And there are men who simply arrive.</p>
        <p className="uj-final-stanza">Uncle Jo is the latter.</p>
        <p className="uj-final-stanza">
          This ring was made for him —<br />
          not to describe who he is,<br />
          but to confirm it.
        </p>
        <p className="uj-final-stanza">A nephew was asked to make something special. This is the result.</p>
        <p className="uj-final-stanza">
          <em>Made for Uncle Jo.</em>
          <strong>NOW IT'S ON THE RECORD.</strong>
        </p>
      </section>
    </div>
  );
}
