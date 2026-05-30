import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";

/**
 * BATTENTI DELLA VILLA — PHILEON Fine Jewelry
 *
 * Villa Door Knocker Earrings · 18K Yellow Gold · Single SKU.
 * Cast like the hardware of an old-world estate. Quiet aristocratic
 * Mediterranean luxury — not urban, not trend-led, not costume.
 *
 * Page architecture obeys the SITEWIDE PRODUCT PAGE ORDER RULE:
 *   1. Hero
 *   2. Editorial thesis (Composition · Structure · Craft · Wear)
 *   3. Archive gallery
 *   4. Specifications
 *   5. Configurator (single SKU)
 *   6. Add to Cart
 *   7. Final word
 *
 * Namespace: .bdv-
 */

const HERO_IMG =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/cutpv1k0_1000156263.jpg";
const HERO_ALT =
  "BATTENTI DELLA VILLA — pair of yellow gold villa door knocker earrings with rope-twist treccia body and omega closure.";

// Production archive — 6 frames, sequenced front-on → atelier study →
// form study → detail macro → boutique context → provenance reveal.
const GALLERY = [
  {
    src: HERO_IMG,
    label: "Pair, front-on",
    alt: "BATTENTI DELLA VILLA pair, photographed front-on on a clean studio field.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/3y5q48g9_1000156321.png",
    label: "Atelier sketch",
    alt: "BATTENTI DELLA VILLA pair resting on the original atelier sketch with rulers and pencil.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/crkypfpc_1000156335.png",
    label: "Form study",
    alt: "Mirrored reflection of a single Battenti drop, four-way form study of the rope-twist silhouette.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/riqmkzri_1000156325.png",
    label: "Omega closure detail",
    alt: "Macro of the textured omega top suspending the polished link into the rope-twist body.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/kzk3m7gb_1000156318.png",
    label: "Boutique reveal",
    alt: "BATTENTI DELLA VILLA pair set in a black velvet boutique display.",
  },
  {
    src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/0bzh1n34_1000156313.png",
    label: "Provenance",
    alt: "Single Battenti earring lifted into a cream provenance box by a white-gloved hand.",
  },
];

const EDITORIAL = [
  {
    head: "COMPOSITION",
    sub: "Gold That Moves Like Water",
    body: "Cast in the alloy of your choice, each earring is a study in controlled opulence. Warmth deepens the rope-twist texture, catching light at every coil and shifting with every turn of the head. This is gold that does not simply sit on the ear. It lives there.",
  },
  {
    head: "STRUCTURE",
    sub: "The Weight of Arrival",
    body: "A textured omega top suspends a polished link — smooth gold against braided gold — which feeds into the villa-knocker form below. The contrast is deliberate: polish against texture, stillness against movement. The silhouette carries the memory of old doors, private gates, and rooms entered without asking.",
  },
  {
    head: "CRAFT",
    sub: "Rope Twist at This Scale",
    body: "The treccia weave running the full body of the drop requires precision. Each twisted segment must remain uniform, continuous, and clean as it wraps around the curve. No stones are needed. The gold is the architecture.",
  },
  {
    head: "WEAR",
    sub: "For the Villa. For the Rooftop. For Wherever You Choose to Be Seen.",
    body: "These earrings were made for whitewashed walls, warm evenings, cobblestone approaches, and last-light dinners. Paired with nothing else, they are enough. That is the point.",
  },
];

const SPECS = [
  ["Piece", "Battenti della Villa"],
  ["Type", "Drop Earrings — Pair"],
  ["Dimensions", "45mm × 30mm"],
  ["Total Weight", "Approx. 25g"],
  ["Texture", "Rope Twist / Treccia"],
  ["Closure", "Omega Back"],
  ["Finish", "High Polish + Textured"],
  ["Origin", "PHILEON Fine Jewelry"],
  ["Hallmark", "925 / 10K / 14K / 750 (18K)"],
  ["Fulfillment", "Made to order"],
  ["Timeline", "4–6 weeks"],
  ["Shipping", "Complimentary insured"],
];

// Four hand-set metal tiers. Prices render verbatim — they do not pass
// through the sitewide luxury rounding (the user has hand-priced this
// piece outside the $500-step rule).
const METAL_TIERS = [
  {
    id: "silver",
    sku: "BDV-925",
    badge: "FOUNDATION",
    name: "Sterling Silver",
    priceUsd: 2800,
    description: "925 sterling, high-polish + textured. The piece in its quietest voice.",
  },
  {
    id: "gold10k",
    sku: "BDV-10Y",
    badge: "SIGNATURE",
    name: "10K Yellow Gold",
    priceUsd: 5800,
    description: "Solid 10K yellow. Warmer tone, lasting weight on the ear.",
  },
  {
    id: "gold14k",
    sku: "BDV-14Y",
    badge: "HEIRLOOM",
    name: "14K Yellow Gold",
    priceUsd: 7200,
    description: "Richer hue, deeper saturation. The Mediterranean read.",
  },
  {
    id: "gold18k",
    sku: "BDV-18Y",
    badge: "COLLECTOR",
    name: "18K Yellow Gold",
    featured: true,
    priceUsd: 7800,
    description: "Maximum gold density. The villa hardware as it was always intended.",
  },
];

const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;

export default function BattentiDellaVillaPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);
  // Default to 18K — the piece as it was always intended.
  const [selectedTier, setSelectedTier] = useState("gold18k");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const currentTier =
    METAL_TIERS.find((t) => t.id === selectedTier) || METAL_TIERS[3];
  const priceUsd = currentTier.priceUsd;
  const priceDisplay = formatUsd(priceUsd);

  const onAddToCart = () => {
    handleAddToCart(
      {
        id: `battenti-della-villa-${currentTier.id}`,
        name: `BATTENTI DELLA VILLA — ${currentTier.name}`,
        price: priceUsd,
        productKey: "battentiDellaVilla",
        tierKey: currentTier.id,
        metal: currentTier.name,
        sku: currentTier.sku,
        quantity: 1,
        image: HERO_IMG,
      },
      1,
      `${currentTier.name} · Pair · Omega Back`,
    );
  };

  return (
    <section
      className={`bdv-room${isMounted ? " bdv-loaded" : ""}`}
      data-page="battenti-della-villa"
      data-testid="battenti-della-villa-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .bdv-room {
          --ink:        #07050300;
          --ink-deep:   #0a0807;
          --text:       rgba(238, 230, 210, 0.92);
          --text-dim:   rgba(232, 205, 152, 0.78);
          --gold:       rgba(220, 184, 110, 0.95);
          --gold-soft:  rgba(201, 168, 76, 0.55);
          --gold-deep:  rgba(184, 144, 70, 0.85);
          --limestone:  rgba(245, 236, 215, 0.92);

          background:
            radial-gradient(ellipse 1100px 720px at 50% -10%,
              rgba(120, 88, 38, 0.18), transparent 70%),
            linear-gradient(180deg, #0a0807 0%, #060403 100%);

          color: var(--text);
          min-height: 100vh;
          position: relative;
          opacity: 0;
          transition: opacity 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bdv-loaded { opacity: 1; }

        /* ── BACK LINK ── */
        .bdv-back {
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
        .bdv-back:hover { color: var(--gold); }

        /* ── HERO ── split layout: image left, editorial right ── */
        .bdv-hero {
          padding: 120px 24px 80px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
          max-width: 1240px;
          margin: 0 auto;
        }
        @media (min-width: 980px) {
          .bdv-hero {
            grid-template-columns: 1.05fr 1fr;
            padding: 140px 60px 110px;
            gap: 80px;
          }
        }

        .bdv-hero-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background:
            radial-gradient(ellipse 70% 60% at 50% 55%,
              rgba(228, 198, 138, 0.10), transparent 70%),
            linear-gradient(180deg, #f6efe1 0%, #ece1ca 50%, #d9c8a4 100%);
          border-radius: 4px;
          box-shadow: 0 30px 90px -30px rgba(0, 0, 0, 0.5);
        }
        .bdv-hero-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: center;
          filter: saturate(1.05) contrast(1.02);
          transition: transform 1400ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bdv-hero-img-wrap:hover .bdv-hero-img {
          transform: scale(1.02);
        }

        .bdv-hero-text { max-width: 520px; }
        .bdv-meta {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 22px;
          text-transform: uppercase;
        }
        .bdv-place {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 13px;
          letter-spacing: 0.05em;
          color: var(--gold-soft);
          margin: 0 0 26px;
        }
        .bdv-title {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: clamp(2.3rem, 4.8vw, 3.6rem);
          letter-spacing: 0.06em;
          color: var(--limestone);
          line-height: 1.08;
          margin: 0 0 14px;
        }
        .bdv-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.15rem, 1.6vw, 1.35rem);
          letter-spacing: 0.02em;
          color: var(--text-dim);
          margin: 0 0 36px;
        }
        .bdv-hero-stanza {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.4vw, 1.2rem);
          line-height: 1.65;
          color: rgba(238, 230, 210, 0.82);
          margin: 0 0 36px;
        }
        .bdv-hero-stanza span { display: block; }

        .bdv-hero-price {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1.5rem;
          letter-spacing: 0.08em;
          color: var(--gold);
          margin: 0 0 6px;
        }
        .bdv-hero-material {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin: 0 0 28px;
        }
        .bdv-hero-cta {
          display: inline-block;
          padding: 16px 36px;
          background: var(--gold);
          color: #1a1106;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.32em;
          border: none;
          cursor: pointer;
          transition: background 280ms ease, transform 280ms ease;
        }
        .bdv-hero-cta:hover:not(:disabled) {
          background: var(--limestone);
          transform: translateY(-1px);
        }
        .bdv-hero-cta:disabled { opacity: 0.4; cursor: not-allowed; }
        .bdv-hero-trust {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 13px;
          color: var(--gold-soft);
          margin: 14px 0 0;
        }

        /* ── EDITORIAL THESIS ── */
        .bdv-editorial {
          padding: 100px 24px 80px;
          max-width: 1100px;
          margin: 0 auto;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
        }
        @media (min-width: 900px) { .bdv-editorial { padding: 130px 60px 110px; } }

        .bdv-editorial-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 50px;
          text-align: center;
          text-transform: uppercase;
        }
        .bdv-editorial-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 56px;
        }
        @media (min-width: 800px) {
          .bdv-editorial-grid { grid-template-columns: repeat(2, 1fr); gap: 70px 64px; }
        }

        .bdv-editorial-cell h3 {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.4em;
          color: var(--gold);
          margin: 0 0 10px;
        }
        .bdv-editorial-cell h4 {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1.5rem;
          letter-spacing: 0.01em;
          color: var(--limestone);
          margin: 0 0 18px;
        }
        .bdv-editorial-cell p {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.75;
          color: rgba(238, 230, 210, 0.78);
          margin: 0;
        }

        /* ── ARCHIVE ── */
        .bdv-archive {
          padding: 90px 24px 80px;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
        }
        @media (min-width: 900px) { .bdv-archive { padding: 110px 60px 100px; } }
        .bdv-archive-head {
          max-width: 1100px;
          margin: 0 auto 40px;
          text-align: center;
        }
        .bdv-archive-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 14px;
          text-transform: uppercase;
        }
        .bdv-archive-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.4rem, 2.4vw, 1.9rem);
          letter-spacing: 0.01em;
          color: var(--limestone);
          margin: 0;
        }
        .bdv-archive-sub {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1rem;
          color: rgba(232, 205, 152, 0.55);
          margin: 10px 0 0;
        }
        .bdv-archive-grid {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 700px) {
          .bdv-archive-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (min-width: 1024px) {
          .bdv-archive-grid { grid-template-columns: repeat(3, 1fr); gap: 28px; }
        }
        .bdv-archive-cell {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background:
            linear-gradient(180deg, #f6efe1 0%, #ece1ca 50%, #d9c8a4 100%);
          border-radius: 3px;
          cursor: zoom-in;
          border: none;
          padding: 0;
        }
        .bdv-archive-cell img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: center;
          transition: transform 1200ms cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 600ms ease;
          opacity: 0.96;
        }
        .bdv-archive-cell:hover img {
          transform: scale(1.02);
          opacity: 1;
        }
        .bdv-archive-cell-label {
          position: absolute;
          left: 14px; bottom: 12px;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 9px;
          letter-spacing: 0.3em;
          color: rgba(40, 28, 12, 0.55);
          text-transform: uppercase;
          background: rgba(245, 236, 215, 0.6);
          padding: 4px 8px;
          backdrop-filter: blur(2px);
        }

        /* ── SPECS ── */
        .bdv-specs {
          padding: 90px 24px 80px;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
        }
        @media (min-width: 900px) { .bdv-specs { padding: 110px 60px 100px; } }
        .bdv-specs-inner {
          max-width: 900px;
          margin: 0 auto;
        }
        .bdv-specs-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 40px;
          text-align: center;
          text-transform: uppercase;
        }
        .bdv-specs-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          row-gap: 0;
        }
        @media (min-width: 700px) {
          .bdv-specs-list { grid-template-columns: repeat(2, 1fr); column-gap: 60px; }
        }
        .bdv-specs-list li {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(220, 184, 110, 0.10);
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1rem;
          color: rgba(238, 230, 210, 0.78);
        }
        .bdv-specs-list li strong {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          color: var(--gold-soft);
          text-transform: uppercase;
        }

        /* ── CONFIGURATOR ── */
        .bdv-config {
          padding: 100px 24px 80px;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
        }
        @media (min-width: 900px) { .bdv-config { padding: 120px 60px 110px; } }
        .bdv-config-inner {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }
        .bdv-config-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 18px;
          text-transform: uppercase;
        }
        .bdv-config-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.7rem, 3vw, 2.2rem);
          letter-spacing: 0.01em;
          color: var(--limestone);
          margin: 0 0 38px;
        }
        /* ── Tier radiogroup ── */
        .bdv-tiers {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin: 0 0 32px;
          text-align: left;
        }
        @media (min-width: 760px) {
          .bdv-tiers { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        }
        .bdv-tier {
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
        .bdv-tier:hover {
          border-color: rgba(220, 184, 110, 0.45);
          background: rgba(220, 184, 110, 0.05);
        }
        .bdv-tier.is-selected {
          border-color: var(--gold);
          background: rgba(220, 184, 110, 0.08);
          transform: translateY(-1px);
        }
        .bdv-tier-featured {
          position: absolute;
          top: 14px; right: 16px;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 9px;
          letter-spacing: 0.32em;
          color: #1a1106;
          background: var(--gold);
          padding: 3px 8px;
        }
        .bdv-tier-badge {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 9.5px;
          letter-spacing: 0.36em;
          color: var(--gold-soft);
          margin-bottom: 4px;
        }
        .bdv-tier.is-selected .bdv-tier-badge { color: var(--gold); }
        .bdv-tier-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 13px;
          letter-spacing: 0.18em;
          color: var(--limestone);
        }
        .bdv-tier-desc {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 14px;
          line-height: 1.55;
          color: rgba(238, 230, 210, 0.65);
          margin: 4px 0 8px;
        }
        .bdv-tier-price {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1.05rem;
          letter-spacing: 0.06em;
          color: var(--gold);
        }
        /* ── Summary card above CTA ── */
        .bdv-summary {
          border-top: 1px solid rgba(220, 184, 110, 0.18);
          border-bottom: 1px solid rgba(220, 184, 110, 0.18);
          padding: 22px 4px;
          margin: 0 0 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }
        .bdv-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 18px;
        }
        .bdv-summary-row--price {
          padding-top: 6px;
          border-top: 1px dashed rgba(220, 184, 110, 0.18);
        }
        .bdv-summary-label {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.34em;
          color: var(--gold-soft);
          text-transform: uppercase;
        }
        .bdv-summary-value {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1rem;
          color: rgba(238, 230, 210, 0.85);
          text-align: right;
        }
        .bdv-summary-sku {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.22em;
          color: var(--text-dim);
        }
        .bdv-summary-price {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1.4rem;
          letter-spacing: 0.06em;
          color: var(--gold);
        }
        .bdv-cta {
          display: inline-block;
          width: 100%;
          max-width: 360px;
          padding: 18px 24px;
          background: var(--gold);
          color: #1a1106;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 11.5px;
          letter-spacing: 0.35em;
          border: none;
          cursor: pointer;
          transition: background 280ms ease, transform 280ms ease;
        }
        .bdv-cta:hover:not(:disabled) {
          background: var(--limestone);
          transform: translateY(-1px);
        }
        .bdv-cta:disabled { opacity: 0.4; cursor: not-allowed; }
        .bdv-cta-trust {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 13px;
          color: var(--gold-soft);
          margin: 18px 0 0;
        }

        /* ── FINAL WORD ── */
        .bdv-final {
          padding: 120px 24px 140px;
          border-top: 1px solid rgba(220, 184, 110, 0.10);
          text-align: center;
        }
        @media (min-width: 900px) { .bdv-final { padding: 150px 60px 170px; } }
        .bdv-final-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 10.5px;
          letter-spacing: 0.45em;
          color: var(--text-dim);
          margin: 0 0 30px;
          text-transform: uppercase;
        }
        .bdv-final h2 {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.7rem, 3.2vw, 2.6rem);
          line-height: 1.3;
          color: var(--limestone);
          margin: 0 auto;
          max-width: 640px;
        }
        .bdv-final h2 span { display: block; }
        .bdv-final-rule {
          margin: 30px auto 0;
          width: 60px; height: 1px;
          background: linear-gradient(to right,
            transparent,
            rgba(220, 184, 110, 0.55),
            transparent);
        }
      `}</style>

      <Link
        to="/shop?category=earrings"
        className="bdv-back"
        data-testid="bdv-back-btn"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── 1. HERO ──────────────────────────────────────────── */}
      <section className="bdv-hero" data-testid="bdv-hero">
        <div className="bdv-hero-img-wrap">
          <img
            src={HERO_IMG}
            alt={HERO_ALT}
            className="bdv-hero-img"
            data-testid="bdv-hero-img"
            loading="eager"
          />
        </div>
        <div className="bdv-hero-text">
          <p className="bdv-meta">PHILEON</p>
          <p className="bdv-place">Portofino, Italia</p>
          <h1 className="bdv-title" data-testid="bdv-title">
            BATTENTI DELLA VILLA
          </h1>
          <p className="bdv-subtitle" data-testid="bdv-subtitle">
            Villa Door Knocker Earrings
          </p>
          <p className="bdv-hero-stanza">
            <span>Cast like the hardware of an old world estate.</span>
            <span>Weighted curves.</span>
            <span>Twisted gold.</span>
            <span>Silence in sunlight.</span>
          </p>
          <p className="bdv-hero-price" data-testid="bdv-hero-price">
            {priceDisplay}
          </p>
          <p className="bdv-hero-material" data-testid="bdv-hero-material">
            {currentTier.name}
          </p>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="bdv-hero-cta"
            data-testid="bdv-hero-cta"
          >
            {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO BAG"}
          </button>
          <p className="bdv-hero-trust">
            Made to order · Allow 4–6 weeks · Complimentary insured shipping
          </p>
        </div>
      </section>

      {/* ─── 2. EDITORIAL THESIS ──────────────────────────────── */}
      <section className="bdv-editorial" data-testid="bdv-editorial">
        <p className="bdv-editorial-eyebrow">THE PIECE</p>
        <div className="bdv-editorial-grid">
          {EDITORIAL.map((cell) => (
            <div
              key={cell.head}
              className="bdv-editorial-cell"
              data-testid={`bdv-editorial-${cell.head.toLowerCase()}`}
            >
              <h3>{cell.head}</h3>
              <h4>{cell.sub}</h4>
              <p>{cell.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. ARCHIVE GALLERY ───────────────────────────────── */}
      <section className="bdv-archive" data-testid="bdv-archive">
        <div className="bdv-archive-head">
          <p className="bdv-archive-eyebrow">THE VILLA ARCHIVE</p>
          <p className="bdv-archive-title">
            Gold, photographed like old hardware in afternoon light.
          </p>
          <p className="bdv-archive-sub">
            Sequence to be completed as production frames arrive.
          </p>
        </div>
        <div className="bdv-archive-grid" data-testid="bdv-archive-grid">
          {GALLERY.map((g, i) => (
            <button
              key={`${g.src}-${i}`}
              type="button"
              className="bdv-archive-cell"
              data-testid={`bdv-archive-cell-${i + 1}`}
              onClick={() => setActiveFrame(i)}
              aria-label={`Open ${g.label}`}
            >
              <img src={g.src} alt={g.alt} loading="lazy" decoding="async" />
              <span className="bdv-archive-cell-label">
                {String(i + 1).padStart(2, "0")} · {g.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── 4. SPECIFICATIONS ────────────────────────────────── */}
      <section className="bdv-specs" data-testid="bdv-specs">
        <div className="bdv-specs-inner">
          <p className="bdv-specs-eyebrow">SPECIFICATIONS</p>
          <ul className="bdv-specs-list">
            {SPECS.map(([k, v]) => (
              <li key={k}>
                <strong>{k}</strong>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── 5. CONFIGURATOR ──────────────────────────────────── */}
      {/* ─── 6. ADD TO CART (within configurator block) ───────── */}
      <section className="bdv-config" data-testid="bdv-configurator">
        <div className="bdv-config-inner">
          <p className="bdv-config-eyebrow">SELECT METAL</p>
          <h2 className="bdv-config-title">Four weights of the same villa.</h2>

          <div
            className="bdv-tiers"
            role="radiogroup"
            aria-label="Metal selection"
            data-testid="bdv-tiers"
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
                  className={`bdv-tier${isSel ? " is-selected" : ""}`}
                  data-testid={`bdv-tier-${t.id}`}
                >
                  {t.featured && (
                    <span className="bdv-tier-featured">FEATURED</span>
                  )}
                  <span className="bdv-tier-badge">{t.badge}</span>
                  <span className="bdv-tier-name">{t.name}</span>
                  <span className="bdv-tier-desc">{t.description}</span>
                  <span className="bdv-tier-price">{formatUsd(t.priceUsd)}</span>
                </button>
              );
            })}
          </div>

          <div className="bdv-summary" data-testid="bdv-summary">
            <div className="bdv-summary-row">
              <span className="bdv-summary-label">Selection</span>
              <span className="bdv-summary-value">
                {currentTier.name} · Pair · Omega Back
              </span>
            </div>
            <div className="bdv-summary-row">
              <span className="bdv-summary-label">SKU</span>
              <span className="bdv-summary-value bdv-summary-sku">
                {currentTier.sku}
              </span>
            </div>
            <div className="bdv-summary-row bdv-summary-row--price">
              <span className="bdv-summary-label">Today's price</span>
              <span className="bdv-summary-price" data-testid="bdv-sku-price">
                {priceDisplay}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="bdv-cta"
            data-testid="bdv-add-to-cart-btn"
          >
            {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO BAG"}
          </button>
          <p className="bdv-cta-trust">
            Made to order · Allow 4–6 weeks · Complimentary insured shipping
          </p>

          {/* Active frame is reserved for a future inline preview (unused for now). */}
          <span aria-hidden="true" style={{ display: "none" }}>
            {activeFrame}
          </span>
        </div>
      </section>

      {/* ─── 7. FINAL WORD ────────────────────────────────────── */}
      <section className="bdv-final" data-testid="bdv-final">
        <p className="bdv-final-eyebrow">FINAL WORD</p>
        <h2>
          <span>Every villa has a gate.</span>
          <span>Not every gate has a knocker like this.</span>
        </h2>
        <div className="bdv-final-rule" />
      </section>
    </section>
  );
}
