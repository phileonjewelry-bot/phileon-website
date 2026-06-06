import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";

/**
 * STACKRATS — PHILEON Fine Jewelry
 *
 * Ladies · Bracelets/Bangles · Collective.
 * Three sisters (Dinah · Valerie · Dominique) across three metals
 * (Rose · White · Yellow), each available in two profiles
 * (Wide 10mm / Thin 7mm).
 *
 * Page architecture obeys the SITEWIDE PRODUCT PAGE ORDER RULE:
 *   1. Hero (editorial only — no CTA, no price)
 *   2. Editorial thesis
 *   3. The Archive
 *   4. Specifications (profile-aware)
 *   5. Configurator (character + profile)
 *   6. Dynamic price summary
 *   7. ADD TO BAG (single sitewide CTA)
 *   8. Full Stack offer
 *   9. Final Word
 *
 * Theme: warm ivory · champagne · soft gold. Quiet luxury, NOT loud.
 *
 * Namespace: .sr-
 */

const STACK_STILL =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/dgp6tl9l_1000156925.jpg";
const STACK_CIRCLES =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/e4vwqzj1_1000148384.jpg";

const CHARACTERS = {
  dinah: {
    id: "dinah",
    name: "Dinah",
    metal: "14K Rose Gold",
    accentText: "Rose",
    tagline:
      "She walked in and the room forgot what it was talking about.",
    composition:
      "14K rose gold. Micro-bead mesh surface. Donut-form hollow bangle. The warm flush of rose catches natural light and holds it like a secret. Dinah doesn't broadcast — she glows.",
    structure:
      "Tubular mesh construction over a seamless gold core. Slip-on, no clasp. She gets in how she fits.",
    craft:
      "Every micro-bead is set in continuous mesh weave — a technique that requires patience and a very steady hand. This is not fast jewelry.",
    finalWord: "Rose gold is not soft. Rose gold is fearless.",
    dot: "#C9837A",
    halo: "linear-gradient(135deg, #F2D6CD 0%, #E2B6AB 100%)",
  },
  valerie: {
    id: "valerie",
    name: "Valerie",
    metal: "14K White Gold",
    accentText: "White",
    tagline:
      "Cool. Unbothered. Already over whatever you just said.",
    composition:
      "14K white gold. Micro-bead mesh surface. Donut-form hollow bangle. Valerie runs cold in the best way — a silvered sheen that reads minimal until the light hits and suddenly it's anything but.",
    structure:
      "Same tubular mesh architecture as her sisters, but white gold gives the form a sharper edge. Slip-on, no clasp. She goes where she pleases.",
    craft:
      "White gold mesh is notoriously unforgiving — every seam visible, every imperfection exposed. Which is exactly why we do it. Valerie has nothing to hide.",
    finalWord: "The quietest one is always the most dangerous.",
    dot: "#C7C7CC",
    halo: "linear-gradient(135deg, #E9E9EE 0%, #C9C9D2 100%)",
  },
  dominique: {
    id: "dominique",
    name: "Dominique",
    metal: "18K Yellow Gold",
    accentText: "Yellow",
    tagline:
      "She's not the loudest one. She's the reason there's noise.",
    composition:
      "18K yellow gold. Micro-bead mesh surface. Donut-form hollow bangle. If rose gold glows and white gold gleams — Dominique burns. Pure yellow gold, ancient and loud, the colour of every culture that ever built something worth remembering.",
    structure:
      "18K gives the mesh a deeper warmth and heavier visual weight. The anchor. Stack her at the bottom and let her carry everything else.",
    craft:
      "18K yellow gold is the hardest of the three to work — softer metal, more demanding hands. More time. More pressure. More everything.",
    finalWord: "Gold doesn't explain itself. Neither does she.",
    dot: "#D4A520",
    halo: "linear-gradient(135deg, #EBD08A 0%, #C8A150 100%)",
  },
};

// Wide is the FEATURED default. Thin is approximately 75% of wide
// (less metal, lighter wrist read). Prices stay verbatim — hand-set,
// not auto-rounded.
const PRICES = {
  dinah: { wide: 2400, thin: 1800 },
  valerie: { wide: 2600, thin: 1950 },
  dominique: { wide: 2900, thin: 2200 },
};
const FULL_STACK_WIDE = 7500; // = 2400 + 2600 + 2900 - small bundle break
const FULL_STACK_THIN = 5700; // = 1800 + 1950 + 2200 - small bundle break

// Per-character / per-profile image catalog (the configurator is
// visual — clicking a bangle IS the selector).
const TILE_IMAGES = {
  dinah: {
    wide: "/stackrats/dinah-thin.png",
    thin: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/j910hw57_1000157125.jpg",
  },
  valerie: {
    wide: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/i82zaat0_1000157083.jpg",
    thin: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/aehzp06y_1000157078.jpg",
  },
  dominique: {
    wide: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/jj4t1672_1000157085.jpg",
    thin: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/4j1le8fx_1000157079.jpg",
  },
};

// Per-character weights are profile-aware: 14K girls share the same
// numbers, Dominique (18K) sits slightly heavier per the brief.
const WEIGHTS = {
  dinah:     { wide: "Approx. 21g", thin: "Approx. 15g" },
  valerie:   { wide: "Approx. 21g", thin: "Approx. 15g" },
  dominique: { wide: "Approx. 23g", thin: "Approx. 16g" },
};

const PROFILES = {
  wide: {
    id: "wide",
    name: "Wide",
    width: "10mm",
    blurb:
      "The signature profile. A substantial wrist read with the full mesh halo.",
    width_label: "10mm",
    inner_d: "Inner Ø ~62mm",
  },
  thin: {
    id: "thin",
    name: "Thin",
    width: "7mm",
    blurb:
      "Finer profile — slip onto the wrist as a pair, layer three for the full stack.",
    width_label: "7mm",
    inner_d: "Inner Ø ~62mm",
  },
};

const GALLERY = [
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/hhd9o4gw_1000157086.png",
    label: "The configuration matrix",
    alt: "STACKRATS — full configuration matrix on a warm ivory field: top row Wide 10mm, bottom row Thin 7mm; Dinah (14K rose gold), Valerie (14K white gold) and Dominique (18K yellow gold) across both profiles.",
  },
  {
    src: "/stackrats/separated.png",
    label: "The trio, separated",
    alt: "STACKRATS — the three bangles arranged side-by-side on a warm ivory studio sweep: Dinah in 14K rose gold (left), Valerie in 14K white gold (centre), Dominique in 18K yellow gold (right).",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/b4uwsq34_1000157076.jpg",
    label: "Mesh macro, rose",
    alt: "STACKRATS — extreme macro of the 14K rose-gold micro-bead mesh: continuous bead rows wrapping the donut form, the surface texture reading as a fine architecture up close.",
  },
  {
    src: STACK_STILL,
    label: "The stack, still life",
    alt: "STACKRATS — the three bangles stacked vertically: rose, white and yellow micro-bead mesh on warm ivory.",
  },
  {
    src: STACK_CIRCLES,
    label: "The trio, side-by-side",
    alt: "STACKRATS — the three bangles side-by-side as donut-form circles in yellow, white and rose gold.",
  },
];

const fmt = (n) => `$${n.toLocaleString("en-US")}`;
const fmtUsd = (n) => `${fmt(n)} USD`;
const skuFor = (cKey, pKey) =>
  `STACKRATS-${cKey.toUpperCase()}-${pKey.toUpperCase()}`;

export default function StackratsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedChar, setSelectedChar] = useState("dinah");
  const [selectedProfile, setSelectedProfile] = useState("wide");
  const [activeFrame, setActiveFrame] = useState(0);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const character = CHARACTERS[selectedChar];
  const profile = PROFILES[selectedProfile];
  const priceUsd = PRICES[selectedChar][selectedProfile];
  const sku = useMemo(
    () => skuFor(selectedChar, selectedProfile),
    [selectedChar, selectedProfile],
  );

  const onAddToCart = () => {
    const variant = `${character.name} · ${character.metal} · ${profile.name} ${profile.width}`;
    handleAddToCart(
      {
        id: `stackrats-${selectedChar}-${selectedProfile}`,
        name: `STACKRATS — ${character.name.toUpperCase()} — ${profile.name.toUpperCase()} ${profile.width.toUpperCase()}`,
        price: priceUsd,
        productKey: "stackrats",
        tierKey: `${selectedChar}_${selectedProfile}`,
        metal: character.metal,
        profile: `${profile.name} ${profile.width}`,
        sku,
        quantity: 1,
        image: STACK_STILL,
      },
      1,
      variant,
    );
  };

  const onAddStack = (profileKey) => {
    const p = PROFILES[profileKey];
    const totalUsd =
      profileKey === "wide" ? FULL_STACK_WIDE : FULL_STACK_THIN;
    handleAddToCart(
      {
        id: `stackrats-full-stack-${profileKey}`,
        name: `STACKRATS — THE FULL STACK — ${p.name.toUpperCase()} ${p.width.toUpperCase()}`,
        price: totalUsd,
        productKey: "stackrats",
        tierKey: `fullstack_${profileKey}`,
        metal: "Rose · White · Yellow",
        profile: `${p.name} ${p.width}`,
        sku: `SR-FULL-${profileKey.toUpperCase()}`,
        quantity: 1,
        image: STACK_STILL,
      },
      1,
      `The Full Stack · ${p.name} ${p.width} · Rose · White · Yellow`,
    );
  };

  return (
    <section
      className={`sr-room${isMounted ? " sr-loaded" : ""}`}
      data-page="stackrats"
      data-testid="stackrats-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .sr-room {
          --ivory:        #F6EFE2;
          --ivory-deep:   #ECE2CE;
          --champagne:    #E6D5B1;
          --gold:         #B8945B;
          --gold-soft:    rgba(184, 148, 91, 0.45);
          --gold-deeper:  #8C6E3A;
          --ink:          #2E2820;
          --ink-soft:     rgba(46, 40, 32, 0.62);
          --ink-muted:    rgba(46, 40, 32, 0.42);
          --rule:         rgba(184, 148, 91, 0.22);

          background:
            radial-gradient(ellipse 1100px 740px at 50% -8%,
              rgba(232, 211, 167, 0.45), transparent 70%),
            linear-gradient(180deg, #F6EFE2 0%, #EFE5CC 100%);

          color: var(--ink);
          min-height: 100vh;
          position: relative;
          opacity: 0;
          transition: opacity 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sr-loaded { opacity: 1; }

        .sr-back {
          position: absolute;
          top: 22px; left: 24px;
          z-index: 20;
          display: inline-flex; align-items: center; gap: 8px;
          color: var(--ink-muted);
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 280ms ease;
        }
        .sr-back:hover { color: var(--gold-deeper); }

        /* ── HERO ── */
        .sr-hero {
          padding: 120px 24px 80px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
          max-width: 1260px;
          margin: 0 auto;
        }
        @media (min-width: 980px) {
          .sr-hero {
            grid-template-columns: 1.05fr 1fr;
            padding: 140px 60px 110px;
            gap: 80px;
          }
        }
        .sr-hero-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: linear-gradient(180deg, #F2E7CE 0%, #E6D5B1 100%);
          border-radius: 4px;
          box-shadow: 0 36px 110px -40px rgba(110, 80, 30, 0.32);
        }
        .sr-hero-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 1600ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sr-hero-img-wrap:hover .sr-hero-img { transform: scale(1.02); }

        .sr-hero-text { max-width: 540px; }
        .sr-meta {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--ink-soft);
          margin: 0 0 22px;
          text-transform: uppercase;
        }
        .sr-eyebrow {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 13px;
          letter-spacing: 0.05em;
          color: var(--gold-deeper);
          margin: 0 0 26px;
        }
        .sr-title {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: clamp(2.6rem, 5vw, 4.4rem);
          letter-spacing: 0.08em;
          color: var(--ink);
          line-height: 1;
          margin: 0 0 14px;
        }
        .sr-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.15rem, 1.7vw, 1.4rem);
          letter-spacing: 0.01em;
          color: var(--ink-soft);
          margin: 0 0 36px;
        }
        .sr-hero-stanza {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.4vw, 1.2rem);
          line-height: 1.7;
          color: var(--ink);
          margin: 0 0 18px;
        }
        .sr-hero-stanza span { display: block; }

        /* ── EDITORIAL ── */
        .sr-editorial {
          padding: 100px 24px 80px;
          max-width: 1120px;
          margin: 0 auto;
          border-top: 1px solid var(--rule);
        }
        @media (min-width: 900px) { .sr-editorial { padding: 130px 60px 110px; } }
        .sr-editorial-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--ink-soft);
          margin: 0 0 50px;
          text-align: center;
          text-transform: uppercase;
        }
        .sr-editorial-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 56px;
        }
        @media (min-width: 800px) {
          .sr-editorial-grid { grid-template-columns: repeat(2, 1fr); gap: 70px 64px; }
        }
        .sr-editorial-cell h3 {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.4em;
          color: var(--gold-deeper);
          margin: 0 0 10px;
        }
        .sr-editorial-cell h4 {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1.5rem;
          letter-spacing: 0.01em;
          color: var(--ink);
          margin: 0 0 18px;
        }
        .sr-editorial-cell p {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.75;
          color: var(--ink-soft);
          margin: 0;
        }

        /* ── ARCHIVE ── */
        .sr-archive {
          padding: 90px 24px 80px;
          border-top: 1px solid var(--rule);
        }
        @media (min-width: 900px) { .sr-archive { padding: 110px 60px 100px; } }
        .sr-archive-head {
          max-width: 1120px;
          margin: 0 auto 40px;
          text-align: center;
        }
        .sr-archive-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--ink-soft);
          margin: 0 0 14px;
          text-transform: uppercase;
        }
        .sr-archive-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.4rem, 2.4vw, 1.9rem);
          letter-spacing: 0.01em;
          color: var(--ink);
          margin: 0;
        }
        .sr-archive-grid {
          max-width: 1260px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 720px) {
          .sr-archive-grid { grid-template-columns: repeat(2, 1fr); gap: 28px; }
        }
        .sr-archive-cell {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: linear-gradient(180deg, #F2E7CE 0%, #E6D5B1 100%);
          border-radius: 3px;
          cursor: zoom-in;
          border: none;
          padding: 0;
        }
        .sr-archive-cell img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 1200ms cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 600ms ease;
          opacity: 0.98;
        }
        .sr-archive-cell:hover img { transform: scale(1.02); opacity: 1; }

        /* ── SPECS ── */
        .sr-specs {
          padding: 90px 24px 80px;
          border-top: 1px solid var(--rule);
        }
        @media (min-width: 900px) { .sr-specs { padding: 110px 60px 100px; } }
        .sr-specs-inner { max-width: 920px; margin: 0 auto; }
        .sr-specs-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--ink-soft);
          margin: 0 0 40px;
          text-align: center;
          text-transform: uppercase;
        }
        .sr-specs-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 700px) {
          .sr-specs-list { grid-template-columns: repeat(2, 1fr); column-gap: 60px; }
        }
        .sr-specs-list li {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding: 14px 0;
          border-bottom: 1px solid var(--rule);
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1rem;
          color: var(--ink-soft);
        }
        .sr-specs-list li strong {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          color: var(--gold-deeper);
          text-transform: uppercase;
        }

        /* ── CONFIGURATOR ── */
        .sr-config {
          padding: 100px 24px 80px;
          border-top: 1px solid var(--rule);
        }
        @media (min-width: 900px) { .sr-config { padding: 120px 60px 110px; } }
        .sr-config-inner {
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
        }
        .sr-config-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--ink-soft);
          margin: 0 0 18px;
          text-transform: uppercase;
        }
        .sr-config-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.7rem, 3vw, 2.2rem);
          letter-spacing: 0.01em;
          color: var(--ink);
          margin: 0 0 38px;
        }
        .sr-section-label {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.4em;
          color: var(--gold-deeper);
          text-align: left;
          margin: 0 0 14px;
        }
        /* ── Visual tile grid ── two rows: WIDE then THIN
              The jewelry is the selector. ── */
        .sr-tilerow {
          margin: 0 0 56px;
          text-align: left;
        }
        .sr-tilerow:last-of-type { margin-bottom: 44px; }
        .sr-tilerow-label {
          display: flex;
          align-items: baseline;
          gap: 10px;
          justify-content: center;
          margin: 0 0 28px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--rule);
        }
        .sr-tilerow-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 12px;
          letter-spacing: 0.42em;
          color: var(--ink);
          text-transform: uppercase;
        }
        .sr-tilerow-width {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 16px;
          color: var(--gold-deeper);
        }
        .sr-tilerow-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        @media (max-width: 640px) {
          .sr-tilerow-grid { gap: 16px; }
        }
        .sr-tile {
          background: transparent;
          border: none;
          padding: 12px 8px 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
          color: var(--ink);
          transition:
            transform 250ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 250ms ease;
          position: relative;
        }
        .sr-tile-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border-radius: 6px;
          background:
            radial-gradient(ellipse 65% 55% at 50% 60%,
              rgba(232, 211, 167, 0.45), transparent 70%),
            linear-gradient(180deg, #FBF4E5 0%, #F2E7CE 100%);
          transition: box-shadow 280ms ease;
        }
        .sr-tile-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: center;
          transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sr-tile:hover { transform: scale(1.02); }
        .sr-tile.is-selected {
          transform: scale(1.03);
        }
        .sr-tile.is-selected .sr-tile-img-wrap {
          box-shadow:
            0 16px 36px -18px rgba(184, 148, 91, 0.55),
            0 0 0 1px rgba(184, 148, 91, 0.45),
            inset 0 0 40px rgba(232, 211, 167, 0.35);
        }
        .sr-tile.is-selected::after {
          content: "";
          position: absolute;
          left: 25%; right: 25%;
          bottom: 0;
          height: 1px;
          background: linear-gradient(to right,
            transparent,
            var(--gold-deeper),
            transparent);
        }
        .sr-tile-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 13px;
          letter-spacing: 0.28em;
          color: var(--ink);
          margin: 14px 0 0;
        }
        .sr-tile-metal {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 14px;
          color: var(--gold-deeper);
          margin: 0;
        }
        .sr-tile-width {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.32em;
          color: var(--ink-muted);
          margin: 4px 0 0;
          text-transform: uppercase;
        }

        /* Summary */
        .sr-summary {
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
          padding: 22px 4px;
          margin: 0 0 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }
        .sr-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 18px;
        }
        .sr-summary-row--price {
          padding-top: 6px;
          border-top: 1px dashed var(--rule);
        }
        .sr-summary-label {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.34em;
          color: var(--gold-deeper);
          text-transform: uppercase;
        }
        .sr-summary-value {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1rem;
          color: var(--ink);
          text-align: right;
        }
        .sr-summary-sku {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.22em;
          color: var(--ink-soft);
        }
        .sr-summary-price {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1.45rem;
          letter-spacing: 0.06em;
          color: var(--gold-deeper);
        }
        .sr-summary-pieceline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 16px;
          color: var(--ink);
        }

        .sr-cta {
          display: inline-block;
          width: 100%;
          max-width: 380px;
          padding: 18px 24px;
          background: var(--ink);
          color: var(--ivory);
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 11.5px;
          letter-spacing: 0.35em;
          border: none;
          cursor: pointer;
          transition: background 280ms ease, transform 280ms ease;
        }
        .sr-cta:hover:not(:disabled) {
          background: var(--gold-deeper);
          transform: translateY(-1px);
        }
        .sr-cta:disabled { opacity: 0.4; cursor: not-allowed; }
        .sr-cta-trust {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 13px;
          color: var(--gold-deeper);
          margin: 18px 0 0;
        }

        /* ── FULL STACK ── */
        .sr-stack {
          padding: 100px 24px 90px;
          border-top: 1px solid var(--rule);
          text-align: center;
        }
        @media (min-width: 900px) { .sr-stack { padding: 130px 60px 110px; } }
        .sr-stack-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--ink-soft);
          margin: 0 0 18px;
          text-transform: uppercase;
        }
        .sr-stack-title {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: clamp(2rem, 4.2vw, 3rem);
          letter-spacing: 0.08em;
          color: var(--ink);
          margin: 0 0 14px;
        }
        .sr-stack-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1.2rem;
          color: var(--ink-soft);
          margin: 0 auto 48px;
          max-width: 540px;
        }
        .sr-stack-grid {
          display: grid;
          grid-template-columns: 1fr;
          max-width: 1100px;
          margin: 0 auto 40px;
          gap: 14px;
        }
        @media (min-width: 800px) {
          .sr-stack-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; }
        }
        .sr-stack-card {
          padding: 28px 24px 32px;
          background: rgba(255, 250, 235, 0.65);
          border: 1px solid var(--gold-soft);
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sr-stack-card-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.22em;
          color: var(--ink);
        }
        .sr-stack-card-metal {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 9.5px;
          letter-spacing: 0.36em;
          color: var(--gold-deeper);
          text-transform: uppercase;
        }
        .sr-stack-card-line {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--ink-soft);
          margin: 8px 0 14px;
        }
        .sr-stack-card-dot {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.18);
        }
        .sr-stack-ctas {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 6px 0 0;
        }
        .sr-stack-cta {
          padding: 16px 28px;
          background: var(--ink);
          color: var(--ivory);
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.32em;
          border: none;
          cursor: pointer;
          transition: background 280ms ease, transform 280ms ease;
        }
        .sr-stack-cta--alt {
          background: transparent;
          color: var(--ink);
          border: 1px solid var(--gold-deeper);
        }
        .sr-stack-cta:hover:not(:disabled) {
          background: var(--gold-deeper);
          color: var(--ivory);
          transform: translateY(-1px);
        }
        .sr-stack-cta:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── FINAL WORD ── */
        .sr-final {
          padding: 120px 24px 140px;
          border-top: 1px solid var(--rule);
          text-align: center;
        }
        @media (min-width: 900px) { .sr-final { padding: 150px 60px 170px; } }
        .sr-final-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--ink-soft);
          margin: 0 0 30px;
          text-transform: uppercase;
        }
        .sr-final h2 {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.7rem, 3.2vw, 2.6rem);
          line-height: 1.3;
          color: var(--ink);
          margin: 0 auto;
          max-width: 640px;
        }
        .sr-final h2 span { display: block; }
        .sr-final-rule {
          margin: 30px auto 0;
          width: 60px; height: 1px;
          background: linear-gradient(to right,
            transparent,
            var(--gold-deeper),
            transparent);
        }
      `}</style>

      <Link
        to="/shop?category=bracelets&audience=ladies"
        className="sr-back"
        data-testid="sr-back-btn"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── 1. HERO ──────────────────────────────────────────── */}
      <section className="sr-hero" data-testid="sr-hero">
        <div className="sr-hero-img-wrap">
          <img
            src={STACK_STILL}
            alt="STACKRATS — the three bangles stacked vertically: rose, white and yellow micro-bead mesh on warm ivory."
            className="sr-hero-img"
            data-testid="sr-hero-img"
            loading="eager"
          />
        </div>
        <div className="sr-hero-text">
          <p className="sr-meta">PHILEON</p>
          <p className="sr-eyebrow">Ladies · Bangles · Collective</p>
          <h1 className="sr-title" data-testid="sr-title">STACKRATS</h1>
          <p className="sr-subtitle" data-testid="sr-subtitle">
            Three girls. One wrist.
          </p>
          <p className="sr-hero-stanza">
            <span>Rose. White. Yellow.</span>
            <span>The same architecture in three temperatures.</span>
          </p>
          <p className="sr-hero-stanza">
            <span>Worn alone, the room notices.</span>
            <span>Worn together, the room understands.</span>
          </p>
        </div>
      </section>

      {/* ─── 2. EDITORIAL THESIS ──────────────────────────────── */}
      <section className="sr-editorial" data-testid="sr-editorial">
        <p className="sr-editorial-eyebrow">THE PIECE</p>
        <div className="sr-editorial-grid">
          <div className="sr-editorial-cell" data-testid="sr-editorial-thesis">
            <h3>THESIS</h3>
            <h4>Three sisters, one architecture.</h4>
            <p>
              STACKRATS are a trio of donut-form bangles cast around a
              single micro-bead mesh skin. Each girl wears the same body,
              tuned to her own temperature. Stack them, or let one lead.
            </p>
          </div>
          <div className="sr-editorial-cell" data-testid="sr-editorial-composition">
            <h3>COMPOSITION</h3>
            <h4>Micro-bead mesh. Hollow core.</h4>
            <p>
              A seamless gold tube wrapped in continuous micro-bead mesh.
              The pebbled surface catches and holds the light differently
              from every angle — read as soft from a metre, structural up
              close.
            </p>
          </div>
          <div className="sr-editorial-cell" data-testid="sr-editorial-craft">
            <h3>CRAFT</h3>
            <h4>Patient and very steady.</h4>
            <p>
              Each bead is set into a continuous weave. The mesh is
              unforgiving — every seam, every imperfection visible. Which
              is precisely the point.
            </p>
          </div>
          <div className="sr-editorial-cell" data-testid="sr-editorial-wear">
            <h3>WEAR</h3>
            <h4>Slip on. No clasp.</h4>
            <p>
              Donut form means they sit close to the wrist with a soft
              hum of weight. Pair two, three, or wear one as the whole
              statement. Sleeves up.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. ARCHIVE ───────────────────────────────────────── */}
      <section className="sr-archive" data-testid="sr-archive">
        <div className="sr-archive-head">
          <p className="sr-archive-eyebrow">THE ARCHIVE</p>
          <p className="sr-archive-title">
            Five frames. Matrix, trio, mesh macro, stack, row.
          </p>
        </div>
        <div className="sr-archive-grid" data-testid="sr-archive-grid">
          {GALLERY.map((g, i) => (
            <button
              key={`${g.src}-${i}`}
              type="button"
              className="sr-archive-cell"
              data-testid={`sr-archive-cell-${i + 1}`}
              onClick={() => setActiveFrame(i)}
              aria-label={`Open frame ${i + 1} — ${g.label}`}
            >
              <img src={g.src} alt={g.alt} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </section>

      {/* ─── 4. SPECIFICATIONS ────────────────────────────────── */}
      <section className="sr-specs" data-testid="sr-specs">
        <div className="sr-specs-inner">
          <p className="sr-specs-eyebrow">
            SPECIFICATIONS · {profile.name.toUpperCase()} {profile.width.toUpperCase()}
          </p>
          <ul className="sr-specs-list" data-testid="sr-specs-list">
            <li><strong>Piece</strong><span>STACKRATS — {character.name}</span></li>
            <li><strong>Form</strong><span>Donut bangle · Hollow core</span></li>
            <li><strong>Surface</strong><span>Micro-bead mesh</span></li>
            <li><strong>Profile</strong><span data-testid="sr-spec-profile">{profile.name} · {profile.width}</span></li>
            <li><strong>Inner diameter</strong><span>{profile.inner_d.replace("Inner Ø ", "")}</span></li>
            <li><strong>Weight</strong><span data-testid="sr-spec-weight">{WEIGHTS[selectedChar][selectedProfile]} per bangle</span></li>
            <li><strong>Metal</strong><span>{character.metal}</span></li>
            <li><strong>Closure</strong><span>Slip-on — no clasp</span></li>
            <li><strong>Hallmark</strong><span>14K / 18K stamped</span></li>
            <li><strong>Fulfillment</strong><span>Made to order · 4–6 weeks</span></li>
          </ul>
        </div>
      </section>

      {/* ─── 5–7. CONFIGURATOR · VISUAL TILES · SUMMARY · CTA ── */}
      <section className="sr-config" data-testid="sr-configurator">
        <div className="sr-config-inner">
          <p className="sr-config-eyebrow">STACKRATS CONFIGURATOR</p>
          <h2 className="sr-config-title">
            Choose your girl. Choose your thickness.
          </h2>

          {Object.values(PROFILES).map((p) => (
            <div
              key={p.id}
              className="sr-tilerow"
              data-testid={`sr-tilerow-${p.id}`}
            >
              <p className="sr-tilerow-label">
                <span className="sr-tilerow-eyebrow">
                  {p.name.toUpperCase()}
                </span>
                <span className="sr-tilerow-width">· {p.width_label}</span>
              </p>
              <div
                className="sr-tilerow-grid"
                role="radiogroup"
                aria-label={`${p.name} ${p.width_label} characters`}
              >
                {Object.values(CHARACTERS).map((c) => {
                  const isSel =
                    selectedChar === c.id && selectedProfile === p.id;
                  return (
                    <button
                      key={`${c.id}-${p.id}`}
                      type="button"
                      role="radio"
                      aria-checked={isSel}
                      onClick={() => {
                        setSelectedChar(c.id);
                        setSelectedProfile(p.id);
                      }}
                      className={`sr-tile${isSel ? " is-selected" : ""}`}
                      data-testid={`sr-tile-${c.id}-${p.id}`}
                    >
                      <div className="sr-tile-img-wrap">
                        <img
                          src={TILE_IMAGES[c.id][p.id]}
                          alt={`${c.name} — ${c.metal} — ${p.width_label}`}
                          className="sr-tile-img"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <p className="sr-tile-name">{c.name.toUpperCase()}</p>
                      <p className="sr-tile-metal">{c.metal}</p>
                      <p className="sr-tile-width">{p.width_label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="sr-summary" data-testid="sr-summary">
            <div className="sr-summary-row">
              <span className="sr-summary-label">Selection</span>
              <span
                className="sr-summary-pieceline"
                data-testid="sr-summary-piece"
              >
                {character.name.toUpperCase()} — {profile.name.toUpperCase()}{" "}
                {profile.width.toUpperCase()}
              </span>
            </div>
            <div className="sr-summary-row">
              <span className="sr-summary-label">Metal</span>
              <span className="sr-summary-value">{character.metal}</span>
            </div>
            <div className="sr-summary-row">
              <span className="sr-summary-label">SKU</span>
              <span className="sr-summary-value sr-summary-sku">{sku}</span>
            </div>
            <div className="sr-summary-row sr-summary-row--price">
              <span className="sr-summary-label">Today's price</span>
              <span
                className="sr-summary-price"
                data-testid="sr-sku-price"
              >
                {fmtUsd(priceUsd)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="sr-cta"
            data-testid="sr-add-to-cart-btn"
          >
            {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO BAG"}
          </button>
          <p className="sr-cta-trust">
            Made to order · Allow 4–6 weeks · Complimentary insured shipping
          </p>

          <span aria-hidden="true" style={{ display: "none" }}>
            {activeFrame}
          </span>
        </div>
      </section>

      {/* ─── 8. FULL STACK OFFER ──────────────────────────────── */}
      <section className="sr-stack" data-testid="sr-fullstack">
        <p className="sr-stack-eyebrow">COMPLETE THE COLLECTION</p>
        <h2 className="sr-stack-title">THE FULL STACK</h2>
        <p className="sr-stack-sub">
          All three girls. One wrist. The way it was meant to be worn.
        </p>
        <div className="sr-stack-grid">
          {Object.values(CHARACTERS).map((c) => (
            <div
              key={c.id}
              className="sr-stack-card"
              data-testid={`sr-stack-card-${c.id}`}
            >
              <span className="sr-stack-card-name">{c.name.toUpperCase()}</span>
              <span className="sr-stack-card-metal">{c.metal}</span>
              <p className="sr-stack-card-line">{c.tagline}</p>
              <span
                className="sr-stack-card-dot"
                style={{ background: c.halo }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
        <div className="sr-stack-ctas">
          <button
            type="button"
            onClick={() => onAddStack("wide")}
            disabled={isAdding}
            className="sr-stack-cta"
            data-testid="sr-stack-buy-wide"
          >
            SHOP THE WIDE STACK — {fmt(FULL_STACK_WIDE)} USD
          </button>
          <button
            type="button"
            onClick={() => onAddStack("thin")}
            disabled={isAdding}
            className="sr-stack-cta sr-stack-cta--alt"
            data-testid="sr-stack-buy-thin"
          >
            SHOP THE THIN STACK — {fmt(FULL_STACK_THIN)} USD
          </button>
        </div>
      </section>

      {/* ─── 9. FINAL WORD ────────────────────────────────────── */}
      <section className="sr-final" data-testid="sr-final">
        <p className="sr-final-eyebrow">FINAL WORD</p>
        <h2 data-testid="sr-final-text">
          <span>{character.finalWord}</span>
        </h2>
        <div className="sr-final-rule" />
      </section>
    </section>
  );
}
