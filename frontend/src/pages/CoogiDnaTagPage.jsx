import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { useLiveTierPrices } from "@/hooks/useLivePrice";

/**
 * COOGI DNA TAG — PHILEON × COOGI · Tribute Series · Pendant
 *
 * Finished tribute object. Two static variants — Snow (10K white gold)
 * and Sand (10K rose gold) — each with a multi-stone baguette field
 * and pavé diamond border. Hand-set, identical to spec.
 *
 * 2 metal tiers wired into livePricingConfig.coogiDnaTag +
 *   pricing_engine.LIVE_PRICING_CONFIG. Both 10K, both same CAD base
 *   ($13,334) → $10,000 USD via cadToUsdLuxury.
 *
 * Namespace: .coogi-
 */

const HERO_IMG = "/coogi-dna/coogi-dna-hero.png";
const HERO_ALT =
  "COOGI DNA Tag — Snow & Sand. Two dog-tag pendants set with vertical multi-stone baguette columns inside a pavé diamond border. Left: 10K white gold (Snow). Right: 10K rose gold (Sand).";

const VARIANTS = [
  {
    id: "snow",
    name: "Snow",
    metal: "10K White Gold",
    sku: "CDT-SNOW-10W",
    accent: "rgba(203, 213, 224, 0.85)",
    image: "/coogi-dna/coogi-dna-snow.png",
    imageAlt:
      "COOGI DNA Tag — Snow. 10K white gold dog-tag pendant with cold-spectrum baguette columns (sapphire, amethyst, citrine, turquoise) framed by a pavé diamond border, photographed nestled in fresh snow.",
    archive: [
      { src: "/coogi-dna/coogi-dna-snow-pair.png",    alt: "COOGI DNA Tag — Snow & Sand together on rose ball chain, white gold Snow leading the composition against dark velvet." },
      { src: "/coogi-dna/coogi-dna-snow-front.png",   alt: "COOGI DNA Tag — Snow front-on study. The full architecture: pavé diamond border framing two vertical multi-stone baguette columns split by a central diamond gallery." },
      { src: "/coogi-dna/coogi-dna-snow-tilt.png",    alt: "COOGI DNA Tag — Snow tilted angle, exposing the depth of the baguette columns and the rise of the diamond pavé border." },
      { src: "/coogi-dna/coogi-dna-snow-bail.png",    alt: "COOGI DNA Tag — Snow bail study. The pavé-set diamond bail at the top of the pendant, seen from a low angle." },
      { src: "/coogi-dna/coogi-dna-snow-macro.png",   alt: "COOGI DNA Tag — Snow macro. Extreme close detail of the pavé diamond bail meeting the multi-stone field, photographed against black for absolute focus on craft." },
      { src: "/coogi-dna/coogi-dna-snow-back.png",    alt: "COOGI DNA Tag — Snow reverse. The polished 10K white gold back face — a clean canvas, the architecture turned inward." },
      { src: "/coogi-dna/coogi-dna-snow-atelier.png", alt: "COOGI DNA Tag — Snow at the atelier. The white gold pendant hanging on a fine chain inside a private viewing room, soft daylight." },
      { src: "/coogi-dna/coogi-dna-snow-box.png",     alt: "COOGI DNA Tag — Snow at provenance. 10K white gold pendant resting in a dark ebony presentation box on black velvet." },
    ],
    descriptor: "White gold · Lab diamonds + synthetic stones · Cold spectrum",
    body:
      "Phileon's tribute to the house that dressed a generation. Snow renders the full COOGI spectrum — ruby, sapphire, amethyst, citrine, emerald, turquoise — set in vertical baguette columns across a white gold dog tag, diamond-bordered and built to last. This is not nostalgia. This is inheritance.",
    compareBody:
      "White gold. Every colour COOGI ever wore. The cold metal pulls the stones toward ice and electricity — sapphire reads deeper, turquoise reads sharper. The diamond halo disappears into the setting. The colour becomes the piece.",
    stones: [
      "Ruby", "Sapphire", "Amethyst", "Citrine",
      "Emerald", "Turquoise", "Diamond Pavé",
    ],
  },
  {
    id: "sand",
    name: "Sand",
    metal: "10K Rose Gold",
    sku: "CDT-SAND-10R",
    accent: "rgba(212, 149, 106, 0.9)",
    image: "/coogi-dna/coogi-dna-sand.png",
    imageAlt:
      "COOGI DNA Tag — Sand. 10K rose gold dog-tag pendant with warm-spectrum baguette columns (ruby, garnet, citrine, emerald, amethyst, onyx) framed by a pavé diamond border, photographed half-submerged in golden sand.",
    archive: [
      { src: "/coogi-dna/coogi-dna-sand-pair.png",     alt: "COOGI DNA Tag — Sand & Snow together on yellow curb chain, rose gold Sand leading the composition against dark velvet." },
      { src: "/coogi-dna/coogi-dna-sand-tilt.png",     alt: "COOGI DNA Tag — Sand tilted study. The full architecture suspended in cream studio light: rose gold frame, pavé diamond border, vertical baguette columns of ruby, amethyst, citrine, garnet, emerald, onyx, split by a central diamond gallery." },
      { src: "/coogi-dna/coogi-dna-sand-macro.png",    alt: "COOGI DNA Tag — Sand macro. Extreme close angle on the warm-spectrum baguette field, exposing the depth of each column and the rose-gold prong work between stones." },
      { src: "/coogi-dna/coogi-dna-sand-diamonds.png", alt: "COOGI DNA Tag — Sand central gallery. Vertical macro of the round-diamond column running between the two baguette columns, every prong cut and finished by hand in rose gold." },
      { src: "/coogi-dna/coogi-dna-sand-back.png",     alt: "COOGI DNA Tag — Sand reverse. The polished 10K rose gold back face — a clean canvas, the architecture turned inward." },
      { src: "/coogi-dna/coogi-dna-sand-prop.png",     alt: "COOGI DNA Tag — Sand leaning. The rose gold pendant resting against a neutral display block inside the atelier, soft warm daylight." },
      { src: "/coogi-dna/coogi-dna-sand-atelier.png",  alt: "COOGI DNA Tag — Sand at the atelier. The rose gold pendant suspended on a fine rose chain inside a private viewing room." },
      { src: "/coogi-dna/coogi-dna-sand-on-body.png",  alt: "COOGI DNA Tag — Sand worn. A gentleman in charcoal suit and open white shirt at golden hour beside a reflecting pool, the rose gold pendant catching the desert light against his chest." },
      { src: "/coogi-dna/coogi-dna-sand-box.png",      alt: "COOGI DNA Tag — Sand at provenance. 10K rose gold pendant resting in a gold-framed presentation box on black velvet." },
    ],
    descriptor: "Rose gold · Lab diamonds + synthetic stones · Warm spectrum",
    body:
      "Sand runs the same genetic code — ruby, garnet, citrine, emerald, amethyst, onyx — but rose gold shifts the warmth beneath every stone. The tribute holds the same weight. Phileon made two because COOGI never had just one season.",
    compareBody:
      "Rose gold. The warmth beneath the colour. Ruby, garnet, citrine, emerald, amethyst, onyx — the same genetic code, but the metal shifts everything toward heat. Phileon made two because COOGI never had just one season.",
    stones: [
      "Ruby", "Garnet", "Citrine", "Emerald",
      "Amethyst", "Onyx", "Diamond Pavé",
    ],
  },
];

// Sitewide stone palette (used for both chip rows so colours read consistently).
const STONE_COLOR = {
  Ruby:        { fg: "#c0392b", border: "rgba(192,57,43,0.45)" },
  Sapphire:    { fg: "#2980b9", border: "rgba(41,128,185,0.45)" },
  Amethyst:    { fg: "#9b59b6", border: "rgba(155,89,182,0.45)" },
  Citrine:     { fg: "#f39c12", border: "rgba(243,156,18,0.45)" },
  Emerald:     { fg: "#27ae60", border: "rgba(39,174,96,0.45)" },
  Turquoise:   { fg: "#1abc9c", border: "rgba(26,188,156,0.45)" },
  Garnet:      { fg: "#922b21", border: "rgba(146,43,33,0.55)" },
  Onyx:        { fg: "#bdc3c7", border: "rgba(189,195,199,0.45)" },
  "Diamond Pavé": { fg: "#e8d6a8", border: "rgba(232,214,168,0.55)" },
};

export default function CoogiDnaTagPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { isAdding, handleAddToCart } = useAddToCart();
  const tierPricesLive = useLiveTierPrices("coogiDnaTag");

  const [selectedVariant, setSelectedVariant] = useState("snow");

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const current =
    VARIANTS.find((v) => v.id === selectedVariant) || VARIANTS[0];
  const displayPrice = tierPricesLive?.[selectedVariant]?.price || 0;
  const formattedPrice = displayPrice
    ? `$${displayPrice.toLocaleString("en-US")} USD`
    : "—";

  // Union of stones across both variants for the Composition mosaic.
  const allStones = useMemo(() => {
    const s = new Set();
    VARIANTS.forEach((v) => v.stones.forEach((stone) => s.add(stone)));
    return Array.from(s);
  }, []);

  const onAddToCart = () => {
    handleAddToCart(
      {
        id: `coogi-dna-tag-${current.id}`,
        name: `COOGI DNA TAG — ${current.name} · ${current.metal}`,
        price: displayPrice,
        productKey: "coogiDnaTag",
        tierKey: current.id,
        metal: current.metal,
        sku: current.sku,
        quantity: 1,
        image: current.image,
      },
      1,
      `${current.name} · ${current.metal}`,
    );
  };

  return (
    <section
      className={`coogi-room${isMounted ? " coogi-loaded" : ""}`}
      data-page="coogi-dna-tag"
      data-testid="coogi-dna-tag-page"
      data-variant={current.id}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .coogi-room {
          --ink:        #0a0a0a;
          --ink-mid:    #111111;
          --ink-soft:   #1a1a1a;
          --gold:       #c9a84c;
          --gold-light: #e2c97e;
          --gold-dim:   rgba(201, 168, 76, 0.62);
          --cream:      #f5f0e8;
          --cream-dim:  #d4c9b0;
          --text-mid:   #9a9080;
          --snow:       rgba(203, 213, 224, 0.95);
          --sand:       rgba(212, 149, 106, 0.95);

          background: var(--ink);
          color: var(--cream);
          min-height: 100vh;
          opacity: 0;
          transition: opacity 900ms ease;
          font-family: 'Inter', sans-serif;
        }
        .coogi-room.coogi-loaded { opacity: 1; }

        .coogi-back {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 22px 24px;
          font-size: 11px; letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(245, 240, 232, 0.55);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .coogi-back:hover { color: rgba(245, 240, 232, 0.95); }

        /* ── HERO ── */
        .coogi-hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          padding: 0 0 60px;
        }
        @media (min-width: 900px) {
          .coogi-hero {
            grid-template-columns: 1.05fr 1fr;
            min-height: min(88vh, 880px);
            align-items: center;
            padding: 0 0 80px;
            gap: 0;
          }
        }

        .coogi-hero-img-wrap {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          padding: 60px 24px 24px;
          background:
            radial-gradient(ellipse at center, rgba(201, 168, 76, 0.05) 0%, transparent 70%),
            var(--ink-mid);
        }
        @media (min-width: 900px) { .coogi-hero-img-wrap { padding: 0; min-height: min(88vh, 880px); } }

        .coogi-hero-img {
          width: 86%;
          max-width: 560px;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 40px 80px rgba(0, 0, 0, 0.7));
          animation: coogiHeroFade 700ms ease both;
        }
        @keyframes coogiHeroFade {
          from { opacity: 0.3; transform: scale(0.985); }
          to   { opacity: 1;   transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .coogi-hero-img { animation: none; }
        }

        .coogi-hero-text {
          padding: 80px 28px;
          display: flex; flex-direction: column; justify-content: center;
          position: relative;
        }
        @media (min-width: 900px) {
          .coogi-hero-text {
            padding: 60px 64px 60px 60px;
            border-left: 1px solid rgba(201, 168, 76, 0.10);
          }
        }

        .coogi-tribute-label {
          font-family: 'Cinzel', serif;
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 26px;
        }
        .coogi-title {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: clamp(2.2rem, 5.2vw, 3.6rem);
          letter-spacing: 0.04em;
          line-height: 1.05;
          color: var(--cream);
          margin: 0 0 10px;
        }
        .coogi-subtitle {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.95rem, 1.4vw, 1.2rem);
          letter-spacing: 0.18em;
          color: var(--gold);
          text-transform: uppercase;
          margin: 0 0 28px;
        }
        .coogi-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.1rem, 1.6vw, 1.4rem);
          line-height: 1.55;
          color: var(--cream-dim);
          margin: 0 0 40px;
          max-width: 460px;
        }

        /* Variant toggle */
        .coogi-variant-toggle {
          display: inline-flex;
          margin: 0 0 28px;
          border: 1px solid rgba(201, 168, 76, 0.22);
        }
        .coogi-variant-btn {
          font-family: 'Cinzel', serif;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          padding: 13px 28px;
          background: transparent;
          border: none;
          color: var(--text-mid);
          cursor: pointer;
          position: relative;
          transition: color 320ms ease, background 320ms ease;
        }
        .coogi-variant-btn + .coogi-variant-btn {
          border-left: 1px solid rgba(201, 168, 76, 0.22);
        }
        .coogi-variant-btn:hover { color: var(--cream); }
        .coogi-variant-btn.is-selected {
          color: var(--cream);
          background: rgba(201, 168, 76, 0.08);
        }
        .coogi-variant-btn.is-selected::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: -1px;
          height: 1px; background: var(--gold);
        }

        .coogi-variant-descriptor {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1rem;
          letter-spacing: 0.04em;
          color: var(--text-mid);
          margin: 0 0 32px;
          min-height: 24px;
          transition: opacity 320ms ease;
        }

        .coogi-price-row {
          display: flex; align-items: baseline; gap: 24px;
          margin: 0 0 24px;
          flex-wrap: wrap;
        }
        .coogi-price {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1.45rem;
          letter-spacing: 0.08em;
          color: var(--gold);
        }
        .coogi-price-note {
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--text-mid);
        }

        .coogi-cta {
          display: block;
          width: 100%;
          max-width: 320px;
          padding: 20px 32px;
          background: var(--gold);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, letter-spacing 320ms ease;
        }
        .coogi-cta:hover {
          background: var(--gold-light);
          letter-spacing: 0.52em;
        }
        .coogi-cta:disabled { opacity: 0.55; cursor: default; letter-spacing: 0.46em !important; }

        .coogi-trust {
          margin: 14px 0 0;
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--gold-dim);
        }

        .coogi-divider {
          width: 60px; height: 1px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
          margin: 36px 0;
        }

        .coogi-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.85;
          color: var(--cream-dim);
          max-width: 480px;
          margin: 0;
        }

        /* ── SPEC STRIP ── */
        .coogi-spec-strip {
          background: var(--ink-soft);
          border-top: 1px solid rgba(201, 168, 76, 0.10);
          border-bottom: 1px solid rgba(201, 168, 76, 0.10);
          padding: 36px 24px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px 24px;
        }
        @media (min-width: 800px) {
          .coogi-spec-strip {
            grid-template-columns: repeat(4, 1fr);
            padding: 44px 80px;
            gap: 40px;
          }
        }
        .coogi-spec-item { text-align: center; }
        .coogi-spec-label {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: var(--gold-dim);
          display: block;
          margin: 0 0 10px;
        }
        .coogi-spec-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          letter-spacing: 0.04em;
          color: var(--cream);
        }

        /* ── COPY SECTIONS ── */
        .coogi-copy {
          max-width: 1000px;
          margin: 0 auto;
          padding: 90px 24px;
        }
        @media (min-width: 900px) { .coogi-copy { padding: 120px 48px; } }

        .coogi-section-label {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 22px;
          display: flex; align-items: center; gap: 16px;
        }
        .coogi-section-label::after {
          content: "";
          flex: 1; height: 1px;
          background: linear-gradient(to right, rgba(201, 168, 76, 0.3), transparent);
        }

        .coogi-section-heading {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: clamp(1.5rem, 3vw, 2.4rem);
          line-height: 1.25;
          color: var(--cream);
          margin: 0 0 26px;
        }
        .coogi-section-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.1rem;
          line-height: 1.85;
          color: var(--cream-dim);
          max-width: 720px;
          margin: 0;
        }

        /* ── STONE MOSAIC ── */
        .coogi-stones {
          display: flex; flex-wrap: wrap; gap: 10px;
          margin: 44px 0 0;
        }
        .coogi-stone-chip {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          padding: 8px 14px;
          border: 1px solid;
          background: rgba(10, 10, 10, 0.4);
          transition: transform 220ms ease, background 220ms ease;
        }
        .coogi-stone-chip:hover {
          transform: translateY(-1px);
          background: rgba(20, 20, 20, 0.7);
        }

        /* ── VARIANT COMPARE ── */
        .coogi-compare-wrap {
          background: var(--ink-soft);
          padding: 0 24px 90px;
        }
        @media (min-width: 900px) { .coogi-compare-wrap { padding: 0 48px 110px; } }
        .coogi-compare-inner { max-width: 1100px; margin: 0 auto; }
        .coogi-compare-inner > .coogi-section-label { padding-top: 90px; }

        .coogi-compare {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2px;
          background: rgba(201, 168, 76, 0.10);
          margin: 50px 0 0;
        }
        @media (min-width: 800px) {
          .coogi-compare { grid-template-columns: 1fr 1fr; }
        }
        .coogi-compare-panel {
          position: relative;
          background: var(--ink-mid);
          padding: 40px 28px;
          overflow: hidden;
        }
        @media (min-width: 800px) { .coogi-compare-panel { padding: 48px 40px; } }
        .coogi-compare-panel::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(to right, transparent, currentColor, transparent);
          opacity: 0.55;
        }
        .coogi-compare-panel[data-variant="snow"] { color: var(--snow); }
        .coogi-compare-panel[data-variant="sand"] { color: var(--sand); }
        .coogi-compare-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1.15rem;
          letter-spacing: 0.06em;
          margin: 0 0 8px;
        }
        .coogi-compare-metal {
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--text-mid);
          margin: 0 0 22px;
        }
        .coogi-compare-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1rem;
          line-height: 1.85;
          color: var(--cream-dim);
          margin: 0;
        }

        /* ── STANDARDIZED BUILD ── */
        .coogi-standard {
          background: var(--ink);
          padding: 80px 24px 70px;
          border-bottom: 1px solid rgba(201, 168, 76, 0.10);
        }
        @media (min-width: 900px) { .coogi-standard { padding: 110px 48px 90px; } }
        .coogi-standard-inner { max-width: 880px; margin: 0 auto; }
        .coogi-standard-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1rem, 1.4vw, 1.2rem);
          line-height: 1.85;
          color: var(--cream-dim);
          max-width: 720px;
          margin: 0;
        }
        .coogi-standard-divider {
          width: 48px; height: 1px;
          background: linear-gradient(to right, var(--gold), transparent);
          margin: 36px 0 30px;
        }
        .coogi-standard-rule {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: clamp(1rem, 1.4vw, 1.2rem);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--cream);
          margin: 0 0 14px;
        }
        .coogi-thermal-bar {
          width: 140px;
          height: 1px;
          margin: 18px 0 28px;
          background: linear-gradient(
            90deg,
            rgba(203, 213, 224, 0.75),
            rgba(201, 168, 76, 0.55),
            rgba(212, 149, 106, 0.75)
          );
          opacity: 0.55;
          transform-origin: center;
          animation: coogiTemperatureBreath 8s ease-in-out infinite;
        }
        @media (min-width: 700px) { .coogi-thermal-bar { width: 180px; } }
        @media (prefers-reduced-motion: reduce) {
          .coogi-thermal-bar { animation: none; opacity: 0.55; transform: none; }
        }
        @keyframes coogiTemperatureBreath {
          0%, 100% { opacity: 0.42; transform: scaleX(0.96); }
          50%      { opacity: 0.68; transform: scaleX(1); }
        }
        .coogi-standard-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 700px) {
          .coogi-standard-row { grid-template-columns: 1fr 1fr; gap: 20px; }
        }
        .coogi-standard-cell {
          padding: 22px 24px;
          background: var(--ink-mid);
          border-left: 2px solid;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .coogi-standard-cell[data-variant="snow"] { border-left-color: var(--snow); }
        .coogi-standard-cell[data-variant="sand"] { border-left-color: var(--sand); }
        .coogi-standard-cell-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1.1rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--cream);
        }
        .coogi-standard-cell[data-variant="snow"] .coogi-standard-cell-name { color: var(--snow); }
        .coogi-standard-cell[data-variant="sand"] .coogi-standard-cell-name { color: var(--sand); }
        .coogi-standard-cell-desc {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.98rem;
          letter-spacing: 0.04em;
          color: var(--text-mid);
        }

        /* ── GALLERY (per-variant archive, variable length) ── */
        .coogi-gallery {
          background: var(--ink);
          padding: 0 24px 70px;
        }
        @media (min-width: 900px) { .coogi-gallery { padding: 0 48px 90px; } }
        .coogi-gallery-grid {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 700px) {
          .coogi-gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        /* Archives of 3+ frames go 3-col on large screens for editorial rhythm. */
        @media (min-width: 1024px) {
          .coogi-gallery-grid[data-archive-count="2"]   { grid-template-columns: repeat(2, 1fr); }
          .coogi-gallery-grid[data-archive-count="3"],
          .coogi-gallery-grid[data-archive-count="4"],
          .coogi-gallery-grid[data-archive-count="5"],
          .coogi-gallery-grid[data-archive-count="6"],
          .coogi-gallery-grid[data-archive-count="7"],
          .coogi-gallery-grid[data-archive-count="8"],
          .coogi-gallery-grid[data-archive-count="9"]   { grid-template-columns: repeat(3, 1fr); gap: 28px; }
        }
        .coogi-gallery-frame {
          margin: 0;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #0a0805;
          border: 1px solid rgba(201, 168, 76, 0.10);
          position: relative;
        }
        .coogi-gallery-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          animation: coogiHeroFade 800ms ease both;
          transition: transform 1200ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .coogi-gallery-frame:hover img { transform: scale(1.025); }

        /* ── FINAL WORD ── */
        .coogi-final {
          position: relative;
          text-align: center;
          padding: 110px 24px 130px;
          background: var(--ink-soft);
          border-top: 1px solid rgba(201, 168, 76, 0.10);
          overflow: hidden;
        }
        .coogi-final::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(ellipse at center bottom, rgba(201, 168, 76, 0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .coogi-final-quote {
          position: relative;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.8rem, 3.6vw, 3rem);
          line-height: 1.35;
          color: var(--cream);
          max-width: 720px;
          margin: 0 auto 26px;
        }
        .coogi-final-attribution {
          position: relative;
          font-family: 'Cinzel', serif;
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0;
        }
        .coogi-final-cta-block {
          position: relative;
          margin: 56px auto 0;
          max-width: 340px;
          display: flex; flex-direction: column; align-items: center; gap: 18px;
        }
      `}</style>

      <Link to="/shop?category=pendants" className="coogi-back" data-testid="coogi-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="coogi-hero" data-testid="coogi-hero">
        <div className="coogi-hero-img-wrap">
          <img
            src={current.image}
            alt={current.imageAlt}
            className="coogi-hero-img"
            data-testid="coogi-hero-img"
            key={current.id}
          />
        </div>
        <div className="coogi-hero-text">
          <p className="coogi-tribute-label">PHILEON × COOGI · TRIBUTE SERIES</p>
          <h1 className="coogi-title" data-testid="coogi-title">COOGI DNA Tag</h1>
          <p className="coogi-subtitle">Snow &amp; Sand</p>
          <p className="coogi-tagline" data-testid="coogi-tagline">The pattern remembers.</p>

          {/* Variant toggle */}
          <div className="coogi-variant-toggle" role="radiogroup" aria-label="Variant selection" data-testid="coogi-variant-toggle">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={selectedVariant === v.id}
                onClick={() => setSelectedVariant(v.id)}
                className={`coogi-variant-btn ${selectedVariant === v.id ? "is-selected" : ""}`}
                data-testid={`coogi-variant-${v.id}`}
              >
                {v.name}
              </button>
            ))}
          </div>

          <p className="coogi-variant-descriptor" data-testid="coogi-variant-descriptor">
            {current.descriptor}
          </p>

          <div className="coogi-price-row">
            <span className="coogi-price" data-testid="coogi-price">{formattedPrice}</span>
            <span className="coogi-price-note">{current.metal} · Lab Diamonds + Synthetic Stones</span>
          </div>

          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding || !displayPrice}
            className="coogi-cta"
            data-testid="coogi-add-to-cart-btn"
          >
            {isAdding ? "ADDING…" : "ADD TO CART"}
          </button>
          <p className="coogi-trust">
            Made to order · 3–5 weeks · Complimentary insured shipping
          </p>

          <div className="coogi-divider" />

          <p className="coogi-body" data-testid="coogi-body">{current.body}</p>
        </div>
      </section>

      {/* ─── SPEC STRIP ───────────────────────────────────────── */}
      <div className="coogi-spec-strip" data-testid="coogi-spec-strip">
        <div className="coogi-spec-item">
          <span className="coogi-spec-label">Metal</span>
          <span className="coogi-spec-value" data-testid="coogi-spec-metal">{current.metal}</span>
        </div>
        <div className="coogi-spec-item">
          <span className="coogi-spec-label">Stones</span>
          <span className="coogi-spec-value">Lab Diamonds + Synthetic Stones</span>
        </div>
        <div className="coogi-spec-item">
          <span className="coogi-spec-label">Setting</span>
          <span className="coogi-spec-value">Baguette Column · Pavé Halo</span>
        </div>
        <div className="coogi-spec-item">
          <span className="coogi-spec-label">Form</span>
          <span className="coogi-spec-value">Dog Tag Pendant</span>
        </div>
      </div>

      {/* ─── STANDARDIZED BUILD ──────────────────────────────── */}
      <section className="coogi-standard" data-testid="coogi-standard">
        <div className="coogi-standard-inner">
          <p className="coogi-section-label">STANDARDIZED BUILD</p>
          <p className="coogi-standard-body">
            Both variants share identical dimensions, identical stone count,
            identical gold weight, and identical construction. ~15g of 10K
            gold, lab-grown diamonds, synthetic coloured stones.
          </p>
          <div className="coogi-standard-divider" />
          <p className="coogi-standard-rule">The difference is temperature.</p>
          <div className="coogi-thermal-bar" aria-hidden="true" data-testid="coogi-thermal-bar" />
          <div className="coogi-standard-row">
            <div className="coogi-standard-cell" data-variant="snow">
              <span className="coogi-standard-cell-name">Snow</span>
              <span className="coogi-standard-cell-desc">Cold spectrum</span>
            </div>
            <div className="coogi-standard-cell" data-variant="sand">
              <span className="coogi-standard-cell-name">Sand</span>
              <span className="coogi-standard-cell-desc">Warm spectrum</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GALLERY (per-variant archive) ───────────────────── */}
      <section className="coogi-gallery" data-testid="coogi-gallery" aria-label={`COOGI DNA Tag — ${current.name} archive`}>
        <div className="coogi-gallery-grid" data-archive-count={current.archive.length}>
          {current.archive.map((frame, idx) => (
            <figure key={`${current.id}-${idx}-${frame.src}`} className="coogi-gallery-frame">
              <img
                src={frame.src}
                alt={frame.alt}
                loading="lazy"
                data-testid={`coogi-gallery-img-${idx}`}
              />
            </figure>
          ))}
        </div>
      </section>

      {/* ─── COMPOSITION ──────────────────────────────────────── */}
      <section className="coogi-copy" data-testid="coogi-composition">
        <p className="coogi-section-label">COMPOSITION</p>
        <h2 className="coogi-section-heading">Every colour COOGI ever wore.</h2>
        <p className="coogi-section-body">
          The COOGI DNA Tag is Phileon's act of preservation — the knit translated
          into stone. Where COOGI ran colour in horizontal ribs across wool,
          Phileon runs it in vertical baguette columns across gold. The geometry
          shifts. The chromatic density holds.
        </p>
        <div className="coogi-stones" data-testid="coogi-stones">
          {allStones.map((stone) => {
            const c = STONE_COLOR[stone] || { fg: "#fff", border: "rgba(255,255,255,0.3)" };
            return (
              <span
                key={stone}
                className="coogi-stone-chip"
                style={{ color: c.fg, borderColor: c.border }}
                data-testid={`coogi-stone-${stone.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {stone}
              </span>
            );
          })}
        </div>
      </section>

      {/* ─── THE TWO RUNS ─────────────────────────────────────── */}
      <div className="coogi-compare-wrap" data-testid="coogi-compare-wrap">
        <div className="coogi-compare-inner">
          <p className="coogi-section-label">THE TWO RUNS</p>
          <div className="coogi-compare">
            {VARIANTS.map((v) => (
              <div
                key={v.id}
                className="coogi-compare-panel"
                data-variant={v.id}
                data-testid={`coogi-compare-${v.id}`}
              >
                <p className="coogi-compare-name">{v.name}</p>
                <p className="coogi-compare-metal">{v.metal}</p>
                <p className="coogi-compare-body">{v.compareBody}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CRAFT ────────────────────────────────────────────── */}
      <section className="coogi-copy" data-testid="coogi-craft">
        <p className="coogi-section-label">CRAFT</p>
        <h2 className="coogi-section-heading">Cast. Set. Finished.</h2>
        <p className="coogi-section-body">
          Each COOGI DNA Tag is cast to identical specification. The baguette
          columns are set by hand — stone by stone, colour by colour — against
          a pavé diamond border. Every piece leaves the bench identical to the
          last. There is no custom. There is no variation. There is only the
          standard.
        </p>
      </section>

      {/* ─── FINAL WORD ───────────────────────────────────────── */}
      <div className="coogi-final" data-testid="coogi-final">
        <p className="coogi-final-quote">"The pattern remembers."</p>
        <p className="coogi-final-attribution">Phileon Fine Jewelry — Tribute Series</p>
        <div className="coogi-final-cta-block">
          <div className="coogi-variant-toggle" role="radiogroup" aria-label="Variant selection (footer)">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={selectedVariant === v.id}
                onClick={() => setSelectedVariant(v.id)}
                className={`coogi-variant-btn ${selectedVariant === v.id ? "is-selected" : ""}`}
                data-testid={`coogi-variant-footer-${v.id}`}
              >
                {v.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding || !displayPrice}
            className="coogi-cta"
            data-testid="coogi-add-to-cart-footer-btn"
          >
            {isAdding ? "ADDING…" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </section>
  );
}
