import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import RingSizeSelector, {
  DEFAULT_RING_SIZE,
  ringSizeLabel,
  ringSizeIdToken,
  ringSizeSkuToken,
} from "@/components/RingSizeSelector";

/**
 * GENT — PHILEON Gentlemen's Club · Architectural Signet
 *
 * Oversized architectural signet ring in sculpted yellow gold with
 * woven lattice construction and elevated GENT typography.
 *
 * Four metal tiers, hand-set prices (not auto-rounded). Mirrors
 * livePricingConfig.gent + pricing_engine.gent for cart validation.
 *
 * Page architecture — SITEWIDE PRODUCT PAGE ORDER RULE:
 *   1. Hero (editorial only — no CTA, no price)
 *   2. Editorial thesis
 *   3. The Archive
 *   4. Composition · Specifications
 *   5. Metal selector + ring size
 *   6. Dynamic price summary
 *   7. ADD TO BAG (single CTA, sitewide)
 *   8. Final Word
 *
 * Namespace: .gent-
 */

const HERO_IMG =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/87u8o3vp_1000156494.jpg";
const HERO_ALT =
  "GENT — PHILEON architectural signet ring in yellow gold, oversized elevated GENT typography over a deep woven lattice body.";

// Production archive — 5 delivered editorial frames, sequenced as a
// campaign arc: identity → typography scale → fashion drama →
// atmospheric wear → lifestyle / on-hand. Additional frames can be
// appended to this array as the campaign expands.
const GALLERY = [
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ekuji1ql_1000156546.jpg",
    label: "Museum identity",
    alt: "GENT — museum-grade front-on identity frame: oversized raised GENT lettering against a deep black mirror surface with full reflection.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/85zdaqq3_1000156589.png",
    label: "Letterform macro",
    alt: "GENT — extreme macro of the cast block letters, showing the raised G and E topography over the woven gold lattice base.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/j6u5vtn9_1000156566.png",
    label: "Lattice macro",
    alt: "GENT — extreme macro of the woven lattice sidewall meeting the polished block-letter top architecture, hand-finished gold catching the light.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/qd0g5ruk_1000156542.png",
    label: "Typography macro",
    alt: "GENT — macro of the raised GENT typography and woven lattice on a dark wood surface, soft whiskey-glass bokeh in the background.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/vj5430dl_1000156545.jpg",
    label: "Leather, in hand",
    alt: "GENT held in a black leather-gloved hand against a black void — high-fashion editorial frame showing the interior PHILEON stamp.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/6tmtekjl_1000156537.png",
    label: "By the fire",
    alt: "GENT resting on dark wood beside a crystal whiskey glass, fireplace and Chesterfield leather in the background.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/tq008flf_3529fadd-d014-4602-99f9-c9d9bc433022-1_all_70434.jpg",
    label: "Cigar lounge, on-hand",
    alt: "GENT worn on-hand in an elite cigar lounge, gentlemen in tailoring seated in the background, hand resting beside a crystal whiskey on dark wood.",
  },
];

const EDITORIAL = [
  {
    head: "THESIS",
    sub: "Designed to Announce",
    body: "There are rings designed to accessorize. And there are rings designed to announce. GENT belongs to the second category — exaggerated proportions, woven-metal architecture and elevated typography turn the object into something closer to industrial sculpture than conventional jewelry.",
  },
  {
    head: "COMPOSITION",
    sub: "Architecture, Not Ornament",
    body: "Solid yellow gold construction. Oversized elevated GENT typography integrated directly into the top architecture. An open interior gallery engineered for balance and wearability despite the mass of the silhouette. Deep woven lattice body inspired by Italian metalwork and architectural grille systems.",
  },
  {
    head: "LANGUAGE",
    sub: "Luxury Industrial · Runway Masculinity",
    body: "Mirror-polished surfaces play against dimensional shadow channels. Every surface is built to catch shadow. Every angle exists for recognition. The proportions are intentionally excessive. The typography intentionally confrontational.",
  },
  {
    head: "WEAR",
    sub: "Not Inherited. Claimed.",
    body: "Equally at home beside tailoring, black lacquer interiors and runway lighting. Worn alone — never stacked. GENT must dominate the hand. The ring is not asking for attention. It assumes it already has it.",
  },
];

const SPECS = [
  ["Piece", "GENT"],
  ["Type", "Architectural Signet Ring"],
  ["Silhouette", "Oversized · Open interior gallery"],
  ["Top Architecture", "Integrated sculptural GENT typography"],
  ["Body", "Woven lattice construction"],
  ["Finish", "Mirror-polished · Dimensional shadow channels"],
  ["Origin", "PHILEON · Gentlemen's Club"],
  ["Hallmark", "925 / 925 Vermeil / 10K / 14K"],
  ["Fulfillment", "Made to order"],
  ["Timeline", "4–6 weeks"],
  ["Shipping", "Complimentary insured"],
  ["Stacking", "Worn alone — must dominate the hand"],
];

// Four hand-set metal tiers (mirrored exactly in livePricingConfig.gent
// and pricing_engine.gent so backend /api/validate-cart returns diff=$0).
const METAL_TIERS = [
  {
    id: "silver",
    sku: "GNT-925",
    badge: "FOUNDATION",
    name: "Sterling Silver",
    priceUsd: 1850,
    description:
      "Solid 925 sterling silver · Architectural lattice body · Mirror-polished GENT typography.",
  },
  {
    id: "vermeil",
    sku: "GNT-925V",
    badge: "SIGNATURE",
    name: "Vermeil",
    priceUsd: 2400,
    description:
      "Warm gold vermeil over sterling silver · House-finish gilt tone · Deep shadow channels through the lattice.",
  },
  {
    id: "gold10k",
    sku: "GNT-10Y",
    badge: "HEIRLOOM",
    name: "10K Yellow Gold",
    priceUsd: 4800,
    description:
      "Solid 10K yellow gold · Substantial everyday luxury weight · Open interior gallery · Mirror-polished surfaces.",
  },
  {
    id: "gold14k",
    sku: "GNT-14Y",
    badge: "COLLECTOR",
    name: "14K Yellow Gold",
    featured: true,
    priceUsd: 6800,
    description:
      "Solid 14K yellow gold · Full house-spec edition · Elevated richness and density · The piece as it was always intended.",
  },
];

const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;

export default function GentPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);
  const [selectedTier, setSelectedTier] = useState("gold14k");
  const [selectedSize, setSelectedSize] = useState(DEFAULT_RING_SIZE);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const currentTier =
    METAL_TIERS.find((t) => t.id === selectedTier) || METAL_TIERS[3];
  const priceUsd = currentTier.priceUsd;
  const priceDisplay = formatUsd(priceUsd);

  const sku = useMemo(() => {
    const token = ringSizeSkuToken(selectedSize);
    return `${currentTier.sku}-SZ${token}`;
  }, [currentTier.sku, selectedSize]);

  const onAddToCart = () => {
    const sizeLabelText = ringSizeLabel(selectedSize);
    const idToken = ringSizeIdToken(selectedSize);
    const variant = `${currentTier.name} · ${sizeLabelText}`;
    handleAddToCart(
      {
        id: `gent-${currentTier.id}-size-${idToken}`,
        name: `GENT — ${currentTier.name} · ${sizeLabelText}`,
        price: priceUsd,
        productKey: "gent",
        tierKey: currentTier.id,
        metal: currentTier.name,
        ringSize: selectedSize,
        ringSizeLabel: sizeLabelText,
        sku,
        quantity: 1,
        image: HERO_IMG,
      },
      1,
      variant,
    );
  };

  return (
    <section
      className={`gent-room${isMounted ? " gent-loaded" : ""}`}
      data-page="gent"
      data-testid="gent-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');

        .gent-room {
          --ink:        #050403;
          --ink-deep:   #020201;
          --espresso:   #0d0a07;
          --text:       rgba(245, 240, 226, 0.92);
          --text-dim:   rgba(220, 184, 110, 0.75);
          --gold:       rgba(228, 190, 110, 0.95);
          --gold-soft:  rgba(200, 162, 80, 0.60);
          --gold-deep:  rgba(160, 122, 50, 0.85);
          --limestone:  rgba(248, 240, 220, 0.92);

          background:
            radial-gradient(ellipse 1200px 800px at 50% -5%,
              rgba(120, 88, 38, 0.16), transparent 70%),
            radial-gradient(ellipse 800px 600px at 50% 110%,
              rgba(95, 65, 25, 0.10), transparent 70%),
            linear-gradient(180deg, #050403 0%, #020201 100%);

          color: var(--text);
          min-height: 100vh;
          position: relative;
          opacity: 0;
          transition: opacity 800ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gent-loaded { opacity: 1; }

        /* ── BACK LINK ── */
        .gent-back {
          position: absolute;
          top: 22px; left: 24px;
          z-index: 20;
          display: inline-flex; align-items: center; gap: 8px;
          color: rgba(232, 205, 152, 0.55);
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 280ms ease;
        }
        .gent-back:hover { color: var(--gold); }

        /* ── HERO ── editorial split, image left, type right ── */
        .gent-hero {
          padding: 120px 24px 80px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (min-width: 980px) {
          .gent-hero {
            grid-template-columns: 1.05fr 1fr;
            padding: 140px 60px 110px;
            gap: 80px;
          }
        }
        .gent-hero-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background:
            radial-gradient(ellipse 70% 60% at 50% 50%,
              rgba(80, 50, 18, 0.35), transparent 70%),
            linear-gradient(180deg, #0a0805 0%, #060403 60%, #020201 100%);
          border: 1px solid rgba(220, 184, 110, 0.12);
          box-shadow:
            0 36px 110px -30px rgba(0, 0, 0, 0.9),
            inset 0 0 80px rgba(220, 184, 110, 0.04);
        }
        .gent-hero-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: center;
          filter: saturate(1.10) contrast(1.05);
          transition: transform 1600ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gent-hero-img-wrap:hover .gent-hero-img { transform: scale(1.02); }

        .gent-hero-text { max-width: 540px; }
        .gent-meta {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 22px;
          text-transform: uppercase;
        }
        .gent-club {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 13px;
          letter-spacing: 0.05em;
          color: var(--gold-soft);
          margin: 0 0 26px;
        }
        .gent-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(3rem, 7vw, 5.2rem);
          letter-spacing: 0.08em;
          color: var(--limestone);
          line-height: 1.02;
          margin: 0 0 14px;
        }
        .gent-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.1rem, 1.5vw, 1.3rem);
          letter-spacing: 0.02em;
          color: var(--text-dim);
          margin: 0 0 36px;
        }
        .gent-hero-stanza {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.4vw, 1.2rem);
          line-height: 1.7;
          color: rgba(245, 240, 226, 0.84);
          margin: 0 0 24px;
        }
        .gent-hero-stanza span { display: block; }
        .gent-hero-stanza--break {
          padding-top: 14px;
          margin-top: 14px;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
          color: rgba(220, 184, 110, 0.78);
          font-style: italic;
        }

        /* ── EDITORIAL THESIS ── */
        .gent-editorial {
          padding: 100px 24px 80px;
          max-width: 1120px;
          margin: 0 auto;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
        }
        @media (min-width: 900px) { .gent-editorial { padding: 130px 60px 110px; } }
        .gent-editorial-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 50px;
          text-align: center;
          text-transform: uppercase;
        }
        .gent-editorial-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 56px;
        }
        @media (min-width: 800px) {
          .gent-editorial-grid { grid-template-columns: repeat(2, 1fr); gap: 72px 64px; }
        }
        .gent-editorial-cell h3 {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.4em;
          color: var(--gold);
          margin: 0 0 10px;
        }
        .gent-editorial-cell h4 {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1.5rem;
          letter-spacing: 0.01em;
          color: var(--limestone);
          margin: 0 0 18px;
        }
        .gent-editorial-cell p {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.75;
          color: rgba(245, 240, 226, 0.78);
          margin: 0;
        }

        /* ── ARCHIVE ── */
        .gent-archive {
          padding: 90px 24px 80px;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
        }
        @media (min-width: 900px) { .gent-archive { padding: 110px 60px 100px; } }
        .gent-archive-head {
          max-width: 1120px;
          margin: 0 auto 40px;
          text-align: center;
        }
        .gent-archive-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 14px;
          text-transform: uppercase;
        }
        .gent-archive-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.4rem, 2.4vw, 1.9rem);
          letter-spacing: 0.01em;
          color: var(--limestone);
          margin: 0;
        }
        .gent-archive-grid {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 700px) {
          .gent-archive-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (min-width: 1024px) {
          .gent-archive-grid { grid-template-columns: repeat(3, 1fr); gap: 28px; }
        }
        .gent-archive-cell {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background:
            radial-gradient(ellipse 70% 60% at 50% 50%,
              rgba(80, 50, 18, 0.35), transparent 70%),
            linear-gradient(180deg, #0a0805 0%, #060403 60%, #020201 100%);
          border: 1px solid rgba(220, 184, 110, 0.10);
          cursor: zoom-in;
          padding: 0;
        }
        .gent-archive-cell img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: center;
          transition:
            transform 1200ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 600ms ease;
          opacity: 0.96;
          filter: saturate(1.08) contrast(1.03);
        }
        .gent-archive-cell:hover img {
          transform: scale(1.02);
          opacity: 1;
        }

        /* ── SPECS ── */
        .gent-specs {
          padding: 90px 24px 80px;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
        }
        @media (min-width: 900px) { .gent-specs { padding: 110px 60px 100px; } }
        .gent-specs-inner {
          max-width: 920px;
          margin: 0 auto;
        }
        .gent-specs-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 40px;
          text-align: center;
          text-transform: uppercase;
        }
        .gent-specs-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          row-gap: 0;
        }
        @media (min-width: 700px) {
          .gent-specs-list { grid-template-columns: repeat(2, 1fr); column-gap: 60px; }
        }
        .gent-specs-list li {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(220, 184, 110, 0.10);
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1rem;
          color: rgba(245, 240, 226, 0.80);
        }
        .gent-specs-list li strong {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          color: var(--gold-soft);
          text-transform: uppercase;
        }

        /* ── CONFIGURATOR ── */
        .gent-config {
          padding: 100px 24px 80px;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
        }
        @media (min-width: 900px) { .gent-config { padding: 120px 60px 110px; } }
        .gent-config-inner {
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }
        .gent-config-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 18px;
          text-transform: uppercase;
        }
        .gent-config-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.7rem, 3vw, 2.2rem);
          letter-spacing: 0.01em;
          color: var(--limestone);
          margin: 0 0 38px;
        }
        /* tier grid */
        .gent-tiers {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin: 0 0 38px;
          text-align: left;
        }
        @media (min-width: 760px) {
          .gent-tiers { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        }
        .gent-tier {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 22px 22px 24px;
          background: rgba(220, 184, 110, 0.025);
          border: 1px solid rgba(220, 184, 110, 0.18);
          color: var(--text);
          cursor: pointer;
          text-align: left;
          transition:
            border-color 320ms ease,
            background 320ms ease,
            transform 320ms ease;
          font-family: 'Cinzel', serif;
        }
        .gent-tier:hover {
          border-color: rgba(220, 184, 110, 0.45);
          background: rgba(220, 184, 110, 0.05);
        }
        .gent-tier.is-selected {
          border-color: var(--gold);
          background: rgba(220, 184, 110, 0.09);
          transform: translateY(-1px);
        }
        .gent-tier-featured {
          position: absolute;
          top: 14px; right: 16px;
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 9px;
          letter-spacing: 0.32em;
          color: #1a1106;
          background: var(--gold);
          padding: 3px 8px;
        }
        .gent-tier-badge {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 9.5px;
          letter-spacing: 0.36em;
          color: var(--gold-soft);
          margin-bottom: 4px;
        }
        .gent-tier.is-selected .gent-tier-badge { color: var(--gold); }
        .gent-tier-name {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.18em;
          color: var(--limestone);
        }
        .gent-tier-desc {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 14px;
          line-height: 1.55;
          color: rgba(245, 240, 226, 0.65);
          margin: 4px 0 8px;
        }
        .gent-tier-price {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 1.05rem;
          letter-spacing: 0.06em;
          color: var(--gold);
        }
        /* size + summary */
        .gent-size-label {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 10.5px;
          letter-spacing: 0.4em;
          color: var(--gold-soft);
          margin: 0 0 14px;
          text-transform: uppercase;
          text-align: left;
        }
        .gent-size-wrap { text-align: left; margin: 0 0 32px; }
        .gent-size-note {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 13.5px;
          line-height: 1.6;
          color: rgba(220, 184, 110, 0.55);
          margin: 12px 0 0;
        }
        .gent-summary {
          border-top: 1px solid rgba(220, 184, 110, 0.18);
          border-bottom: 1px solid rgba(220, 184, 110, 0.18);
          padding: 22px 4px;
          margin: 0 0 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }
        .gent-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 18px;
        }
        .gent-summary-row--price {
          padding-top: 6px;
          border-top: 1px dashed rgba(220, 184, 110, 0.18);
        }
        .gent-summary-label {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 10px;
          letter-spacing: 0.34em;
          color: var(--gold-soft);
          text-transform: uppercase;
        }
        .gent-summary-value {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1rem;
          color: rgba(245, 240, 226, 0.85);
          text-align: right;
        }
        .gent-summary-sku {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.22em;
          color: var(--text-dim);
        }
        .gent-summary-price {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 1.4rem;
          letter-spacing: 0.06em;
          color: var(--gold);
        }
        /* CTA */
        .gent-cta {
          display: inline-block;
          width: 100%;
          max-width: 380px;
          padding: 18px 24px;
          background: var(--gold);
          color: #1a1106;
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 11.5px;
          letter-spacing: 0.35em;
          border: none;
          cursor: pointer;
          transition: background 280ms ease, transform 280ms ease;
        }
        .gent-cta:hover:not(:disabled) {
          background: var(--limestone);
          transform: translateY(-1px);
        }
        .gent-cta:disabled { opacity: 0.4; cursor: not-allowed; }
        .gent-cta-trust {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 13px;
          color: var(--gold-soft);
          margin: 18px 0 0;
        }

        /* ── FINAL WORD ── */
        .gent-final {
          padding: 120px 24px 140px;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
          text-align: center;
        }
        @media (min-width: 900px) { .gent-final { padding: 150px 60px 170px; } }
        .gent-final-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 30px;
          text-transform: uppercase;
        }
        .gent-final h2 {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.7rem, 3.2vw, 2.6rem);
          line-height: 1.3;
          color: var(--limestone);
          margin: 0 auto;
          max-width: 640px;
        }
        .gent-final h2 span { display: block; }
        .gent-final-rule {
          margin: 30px auto 0;
          width: 60px; height: 1px;
          background: linear-gradient(to right,
            transparent,
            rgba(220, 184, 110, 0.55),
            transparent);
        }
        .gent-final-mark {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 9.5px;
          letter-spacing: 0.5em;
          color: var(--text-dim);
          margin: 38px 0 0;
          text-transform: uppercase;
        }
      `}</style>

      <Link
        to="/shop?category=rings&audience=gentlemens-club"
        className="gent-back"
        data-testid="gent-back-btn"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── 1. HERO (editorial only — no CTA / no price) ───────── */}
      <section className="gent-hero" data-testid="gent-hero">
        <div className="gent-hero-img-wrap">
          <img
            src={HERO_IMG}
            alt={HERO_ALT}
            className="gent-hero-img"
            data-testid="gent-hero-img"
            loading="eager"
          />
        </div>
        <div className="gent-hero-text">
          <p className="gent-meta">PHILEON</p>
          <p className="gent-club">Gentlemen's Club · House Artifact</p>
          <h1 className="gent-title" data-testid="gent-title">GENT</h1>
          <p className="gent-subtitle" data-testid="gent-subtitle">
            Architectural Signet Ring
          </p>
          <p className="gent-hero-stanza">
            <span>Weight in shadow.</span>
            <span>Authority in gold.</span>
          </p>
          <p className="gent-hero-stanza">
            <span>Architectural mesh.</span>
            <span>Monumental typography.</span>
            <span>A signet built like a private emblem.</span>
          </p>
          <p className="gent-hero-stanza gent-hero-stanza--break">
            <span>Not inherited.</span>
            <span>Claimed.</span>
          </p>
        </div>
      </section>

      {/* ─── 2. EDITORIAL THESIS ──────────────────────────────── */}
      <section className="gent-editorial" data-testid="gent-editorial">
        <p className="gent-editorial-eyebrow">THE PIECE</p>
        <div className="gent-editorial-grid">
          {EDITORIAL.map((cell) => (
            <div
              key={cell.head}
              className="gent-editorial-cell"
              data-testid={`gent-editorial-${cell.head.toLowerCase()}`}
            >
              <h3>{cell.head}</h3>
              <h4>{cell.sub}</h4>
              <p>{cell.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. ARCHIVE ───────────────────────────────────────── */}
      <section className="gent-archive" data-testid="gent-archive">
        <div className="gent-archive-head">
          <p className="gent-archive-eyebrow">THE ARCHIVE</p>
          <p className="gent-archive-title">
            Seven frames. Architectural mesh under museum-object light.
          </p>
        </div>
        <div className="gent-archive-grid" data-testid="gent-archive-grid">
          {GALLERY.map((g, i) => (
            <button
              key={`${g.src}-${i}`}
              type="button"
              className="gent-archive-cell"
              data-testid={`gent-archive-cell-${i + 1}`}
              onClick={() => setActiveFrame(i)}
              aria-label={`Open frame ${i + 1} — ${g.label}`}
            >
              <img src={g.src} alt={g.alt} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </section>

      {/* ─── 4. SPECIFICATIONS ────────────────────────────────── */}
      <section className="gent-specs" data-testid="gent-specs">
        <div className="gent-specs-inner">
          <p className="gent-specs-eyebrow">SPECIFICATIONS</p>
          <ul className="gent-specs-list">
            {SPECS.map(([k, v]) => (
              <li key={k}>
                <strong>{k}</strong>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── 5. METAL SELECTOR + RING SIZE
            6. DYNAMIC PRICE SUMMARY
            7. ADD TO BAG (single CTA) ──────────────────────── */}
      <section className="gent-config" data-testid="gent-configurator">
        <div className="gent-config-inner">
          <p className="gent-config-eyebrow">SELECT MATERIAL</p>
          <h2 className="gent-config-title">Four weights of the same insignia.</h2>

          <div
            className="gent-tiers"
            role="radiogroup"
            aria-label="Metal selection"
            data-testid="gent-tiers"
          >
            {METAL_TIERS.map((t) => {
              const isSel = selectedTier === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => setSelectedTier(t.id)}
                  className={`gent-tier${isSel ? " is-selected" : ""}`}
                  data-testid={`gent-tier-${t.id}`}
                >
                  {t.featured && (
                    <span className="gent-tier-featured">FEATURED</span>
                  )}
                  <span className="gent-tier-badge">{t.badge}</span>
                  <span className="gent-tier-name">{t.name}</span>
                  <span className="gent-tier-desc">{t.description}</span>
                  <span className="gent-tier-price">{formatUsd(t.priceUsd)}</span>
                </button>
              );
            })}
          </div>

          <div className="gent-size-wrap">
            <RingSizeSelector
              value={selectedSize}
              onChange={setSelectedSize}
              bandWidthMm={14}
              hideWideBandWarning={true}
              testIdPrefix="gent-size"
            />
            <p className="gent-size-note">
              GENT carries an oversized architectural profile. Due to the
              width and interior lattice, collectors between sizes should
              size upward by 0.5 for a relaxed fit.
            </p>
          </div>

          <div className="gent-summary" data-testid="gent-summary">
            <div className="gent-summary-row">
              <span className="gent-summary-label">Selection</span>
              <span className="gent-summary-value">
                {currentTier.name} · {ringSizeLabel(selectedSize)}
              </span>
            </div>
            <div className="gent-summary-row">
              <span className="gent-summary-label">SKU</span>
              <span className="gent-summary-value gent-summary-sku">{sku}</span>
            </div>
            <div className="gent-summary-row gent-summary-row--price">
              <span className="gent-summary-label">Today's price</span>
              <span className="gent-summary-price" data-testid="gent-sku-price">
                {priceDisplay}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="gent-cta"
            data-testid="gent-add-to-cart-btn"
          >
            {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO BAG"}
          </button>
          <p className="gent-cta-trust">
            Made to order · Allow 4–6 weeks · Complimentary insured shipping
          </p>

          <span aria-hidden="true" style={{ display: "none" }}>
            {activeFrame}
          </span>
        </div>
      </section>

      {/* ─── 8. FINAL WORD ────────────────────────────────────── */}
      <section className="gent-final" data-testid="gent-final">
        <p className="gent-final-eyebrow">FINAL WORD</p>
        <h2>
          <span>Some jewelry finishes a look.</span>
          <span>GENT becomes the look.</span>
        </h2>
        <div className="gent-final-rule" />
        <p className="gent-final-mark">
          PHILEON · THE MARK OF THE GENTLEMEN'S CLUB
        </p>
      </section>
    </section>
  );
}
