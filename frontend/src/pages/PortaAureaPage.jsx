import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { useLiveTierPrices } from "@/hooks/useLivePrice";
import RingSizeSelector, {
  ringSizeLabel,
  ringSizeIdToken,
  ringSizeSkuToken,
} from "@/components/RingSizeSelector";

/**
 * PORTA AUREA — PHILEON Signet Objects · Ring
 *
 * Finished collector signet. Direct purchase, no consultation flow.
 * Square emerald-cut ruby · Greek key bezel · Byzantine scale shank.
 *
 * 3 metal tiers (10K / 14K / 18K Yellow Gold) wired into
 *   livePricingConfig.portaAurea + pricing_engine.LIVE_PRICING_CONFIG.
 *
 * Stone selector toggles "Lab Ruby" (default, in-stock pricing) vs
 * "Natural Ruby" (same UI, atelier confirms natural-stone variance
 *  at fulfillment — no enquire/consult gate per brief).
 *
 * Namespace: .porta-
 */

const HERO_IMG = "/porta-aurea/porta-aurea-hero.jpg";
const HERO_ALT =
  "PORTA AUREA gold square signet ring with emerald-cut ruby, Greek key bezel, scroll engraving, and Byzantine scale shank.";

const METAL_TIERS = [
  {
    id: "signature",
    sku: "PA-10Y",
    badge: "SIGNATURE",
    name: "10K Yellow Gold",
    description:
      "Scaled Byzantine shank, Greek key bezel architecture, hand-finished scroll engraving.",
    specs: [
      "Approx. 23g gold weight",
      "Lab ruby centre",
      "Raised tiered bezel",
      "Wide signet profile",
      "Made to order",
    ],
  },
  {
    id: "heirloom",
    sku: "PA-14Y",
    badge: "HEIRLOOM",
    name: "14K Yellow Gold",
    featured: true,
    description:
      "The intended Porta Aurea configuration. Balanced weight, richer tone, deeper contrast across engraving.",
    specs: [
      "Approx. 25.5g gold weight",
      "Lab ruby centre",
      "Greek key crown border",
      "Hand-finished texture work",
      "Made to order",
    ],
  },
  {
    id: "collector",
    sku: "PA-18Y",
    badge: "COLLECTOR",
    name: "18K Yellow Gold",
    description:
      "Maximum gold saturation with elevated warmth and density throughout the architecture.",
    specs: [
      "Approx. 27.5g gold weight",
      "Lab ruby centre",
      "Highest gold purity option",
      "Museum-weight feel",
      "Made to order",
    ],
  },
];

const STONE_OPTIONS = [
  { id: "lab", label: "Lab Ruby", short: "Standard configuration" },
  { id: "natural", label: "Natural Ruby", short: "Atelier-confirmed at fulfillment" },
];

const COMPOSITION = [
  {
    head: "COMPOSITION",
    body: "A 12 × 10mm emerald-cut ruby seated within a raised tiered bezel framed by a Greek key crown. The ruby reads as the gate itself — square, centred, deliberate.",
  },
  {
    head: "STRUCTURE",
    body: "A Byzantine scale shank rises into the signet face in a single architectural sweep. The lattice does not ornament the band — it carries it.",
  },
  {
    head: "CRAFT",
    body: "Each scale of the shank is cut and finished individually. The scroll engraving along the gallery is hand-worked before the stone is set, so the texture sits beneath the ruby's reflection, not beside it.",
  },
];

const SPECS = [
  "Face dimensions: 18mm × 18mm",
  "Total height: 28mm",
  "Band width: 6.5mm",
  "Centre stone: 12 × 10 emerald-cut ruby",
  "Greek key crown border",
  "Hand-finished scroll engraving",
  "Byzantine scale shank",
  "Made to order · 4–6 weeks",
];

export default function PortaAureaPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { isAdding, handleAddToCart } = useAddToCart();
  const tierPricesLive = useLiveTierPrices("portaAurea");

  // Defaults per brief: 14K HEIRLOOM, US 9, Lab Ruby.
  const [selectedTier, setSelectedTier] = useState("heirloom");
  const [selectedSize, setSelectedSize] = useState("9");
  const [selectedStone, setSelectedStone] = useState("lab");

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const currentTier =
    METAL_TIERS.find((t) => t.id === selectedTier) || METAL_TIERS[1];
  const currentStone =
    STONE_OPTIONS.find((s) => s.id === selectedStone) || STONE_OPTIONS[0];

  const displayPrice = tierPricesLive?.[selectedTier]?.price || 0;
  const formattedPrice = displayPrice
    ? `$${displayPrice.toLocaleString("en-US")} USD`
    : "—";

  const sku = useMemo(() => {
    const sizeToken = ringSizeSkuToken(selectedSize);
    const stoneToken = selectedStone === "natural" ? "NAT" : "LAB";
    return `${currentTier.sku}-${stoneToken}-SZ${sizeToken}`;
  }, [currentTier.sku, selectedSize, selectedStone]);

  const onAddToCart = () => {
    const sizeLabelText = ringSizeLabel(selectedSize);
    const idToken = ringSizeIdToken(selectedSize);
    const variant = `${currentStone.label} · ${sizeLabelText}`;
    handleAddToCart(
      {
        id: `porta-aurea-${selectedTier}-${selectedStone}-size-${idToken}`,
        name: `PORTA AUREA — ${currentTier.name} · ${currentStone.label} · ${sizeLabelText}`,
        price: displayPrice,
        productKey: "portaAurea",
        tierKey: selectedTier,
        metal: currentTier.name,
        stone: currentStone.label,
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
      className={`porta-room${isMounted ? " porta-loaded" : ""}`}
      data-page="porta-aurea"
      data-testid="porta-aurea-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .porta-room {
          --text:       rgba(238, 230, 210, 0.92);
          --text-dim:   rgba(201, 168, 76, 0.78);
          --gold:       rgba(220, 184, 110, 0.92);
          --gold-light: rgba(232, 205, 152, 1);
          --gold-soft:  rgba(201, 168, 76, 0.62);
          --ink:        #0a0807;
          --ink-deep:   #07050300;

          background:
            radial-gradient(circle at 50% 0%, rgba(140, 92, 24, 0.12), transparent 55%),
            #0a0806;
          color: var(--text);
          min-height: 100vh;
          opacity: 0;
          transition: opacity 900ms ease;
          font-family: 'Inter', sans-serif;
        }
        .porta-room.porta-loaded { opacity: 1; }

        .porta-back {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 22px 24px;
          font-size: 11px; letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(238, 230, 210, 0.55);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .porta-back:hover { color: rgba(238, 230, 210, 0.95); }

        /* ── HERO ── */
        .porta-hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          padding: 0 0 60px;
        }
        @media (min-width: 900px) {
          .porta-hero {
            grid-template-columns: 1fr 1fr;
            min-height: min(88vh, 860px);
            align-items: center;
            padding: 0 60px 80px;
            gap: 70px;
          }
        }
        .porta-hero-img-wrap {
          position: relative;
          padding: 40px 24px 24px;
          display: flex; align-items: center; justify-content: center;
        }
        @media (min-width: 900px) { .porta-hero-img-wrap { padding: 0; } }
        .porta-hero-img {
          max-width: 100%;
          max-height: 580px;
          object-fit: contain;
          filter: drop-shadow(0 40px 60px rgba(0, 0, 0, 0.55));
        }
        @media (min-width: 900px) { .porta-hero-img { max-height: 700px; } }

        .porta-hero-text {
          padding: 0 28px;
          display: flex; flex-direction: column; justify-content: center;
        }
        @media (min-width: 900px) { .porta-hero-text { padding: 0; } }

        .porta-meta {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin: 0 0 18px;
        }
        .porta-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: clamp(2.6rem, 7vw, 4.8rem);
          letter-spacing: 0.02em;
          line-height: 0.98;
          color: #f5efdf;
          margin: 0 0 14px;
        }
        .porta-translation {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(0.95rem, 1.2vw, 1.1rem);
          letter-spacing: 0.04em;
          color: rgba(220, 184, 110, 0.85);
          margin: 0 0 22px;
        }
        .porta-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.4vw, 1.3rem);
          line-height: 1.55;
          color: var(--text);
          margin: 0 0 32px;
          max-width: 460px;
        }
        .porta-trust {
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--gold-soft);
          margin: 0;
        }

        /* ── ARCHIVE ── */
        .porta-archive {
          padding: 70px 24px 60px;
          border-top: 1px solid rgba(201, 168, 76, 0.10);
        }
        @media (min-width: 900px) { .porta-archive { padding: 100px 60px 90px; } }
        .porta-archive-head { max-width: 1100px; margin: 0 auto 32px; }
        .porta-archive-eyebrow {
          font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase;
          color: var(--text-dim);
          margin: 0 0 12px;
        }
        .porta-archive-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.5rem, 2.6vw, 2.2rem);
          line-height: 1.15;
          color: rgba(238, 230, 210, 0.92);
          margin: 0;
        }
        .porta-archive-grid {
          max-width: 1100px; margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 700px) { .porta-archive-grid { grid-template-columns: repeat(2, 1fr); gap: 22px; } }
        .porta-archive-cell {
          position: relative;
          margin: 0;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #0a0805;
          border: 1px solid rgba(201, 168, 76, 0.14);
        }
        .porta-archive-cell img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 1200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease;
          opacity: 0.92;
        }
        .porta-archive-cell:hover img { transform: scale(1.025); opacity: 1; }
        .porta-archive-empty {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          color: rgba(201, 168, 76, 0.45);
          font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase;
        }

        /* ── EDITORIAL (Composition · Structure · Craft) ── */
        .porta-editorial {
          padding: 80px 24px 90px;
          border-top: 1px solid rgba(201, 168, 76, 0.10);
        }
        @media (min-width: 900px) { .porta-editorial { padding: 110px 60px 120px; } }
        .porta-editorial-grid {
          max-width: 1100px; margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 36px;
        }
        @media (min-width: 800px) { .porta-editorial-grid { grid-template-columns: repeat(3, 1fr); gap: 48px; } }
        .porta-editorial-cell h4 {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin: 0 0 16px;
        }
        .porta-editorial-cell p {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.65;
          color: var(--text);
          margin: 0;
        }

        /* ── SPECS ── */
        .porta-specs {
          padding: 60px 24px 90px;
          border-top: 1px solid rgba(201, 168, 76, 0.10);
        }
        @media (min-width: 900px) { .porta-specs { padding: 80px 60px 110px; } }
        .porta-specs-inner { max-width: 1100px; margin: 0 auto; }
        .porta-specs-eyebrow {
          font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase;
          color: var(--text-dim);
          margin: 0 0 24px;
        }
        .porta-specs-list {
          list-style: none; padding: 0; margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px 36px;
        }
        @media (min-width: 700px) { .porta-specs-list { grid-template-columns: repeat(2, 1fr); } }
        .porta-specs-list li {
          position: relative; padding-left: 18px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text);
        }
        .porta-specs-list li::before {
          content: "•"; position: absolute; left: 4px;
          color: rgba(220, 184, 110, 0.7);
        }

        /* ── CONFIGURATOR ── */
        .porta-config {
          padding: 80px 24px 110px;
          background:
            radial-gradient(circle at 50% 0%, rgba(140, 92, 24, 0.14), transparent 60%),
            #0a0806;
          border-top: 1px solid rgba(201, 168, 76, 0.14);
        }
        @media (min-width: 900px) { .porta-config { padding: 110px 60px 140px; } }
        .porta-config-inner { max-width: 980px; margin: 0 auto; }
        .porta-config-head { text-align: center; margin-bottom: 56px; }
        .porta-config-eyebrow {
          font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase;
          color: var(--text-dim);
          margin: 0 0 18px;
        }
        .porta-config-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          letter-spacing: 0.04em;
          color: #f5efdf;
          margin: 0 0 16px;
        }
        .porta-config-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1rem, 1.3vw, 1.15rem);
          color: rgba(238, 230, 210, 0.78);
          max-width: 480px;
          margin: 0 auto 18px;
        }

        .porta-section-label {
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin: 0 0 18px;
        }

        /* Metal cards */
        .porta-tiers {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin: 0 0 44px;
        }
        @media (min-width: 700px) { .porta-tiers { grid-template-columns: repeat(3, 1fr); } }
        .porta-tier {
          position: relative;
          display: flex; flex-direction: column; align-items: flex-start;
          padding: 22px 18px 22px;
          background: rgba(18, 14, 8, 0.65);
          border: 1px solid rgba(201, 168, 76, 0.18);
          color: inherit;
          cursor: pointer;
          text-align: left;
          transition: border-color 380ms ease, background 380ms ease;
        }
        .porta-tier:hover { border-color: rgba(201, 168, 76, 0.5); background: rgba(28, 22, 12, 0.78); }
        .porta-tier.is-selected {
          border-color: rgba(220, 184, 110, 0.85);
          background: rgba(36, 26, 12, 0.82);
        }
        .porta-tier-featured {
          position: absolute; top: -10px; right: 12px;
          padding: 4px 10px;
          font-size: 9px;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          color: #0a0806;
          background: rgba(220, 184, 110, 0.95);
        }
        .porta-tier-badge {
          font-size: 9px;
          letter-spacing: 0.42em; text-transform: uppercase;
          color: rgba(220, 184, 110, 0.85);
          margin-bottom: 12px;
        }
        .porta-tier-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 0.98rem;
          letter-spacing: 0.06em;
          color: #f5efdf;
          margin-bottom: 8px;
        }
        .porta-tier-desc {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.92rem;
          color: rgba(238, 230, 210, 0.7);
          margin: 0 0 18px;
          line-height: 1.55;
        }
        .porta-tier-price {
          margin-top: auto;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1.05rem;
          letter-spacing: 0.06em;
          color: #f5efdf;
        }

        /* Stone cards */
        .porta-stones {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin: 0 0 12px;
        }
        .porta-stone {
          padding: 18px 16px;
          background: rgba(18, 14, 8, 0.55);
          border: 1px solid rgba(201, 168, 76, 0.16);
          color: inherit;
          cursor: pointer;
          text-align: left;
          transition: border-color 320ms ease, background 320ms ease;
        }
        .porta-stone:hover { border-color: rgba(201, 168, 76, 0.45); }
        .porta-stone.is-selected {
          border-color: rgba(220, 184, 110, 0.85);
          background: rgba(36, 26, 12, 0.7);
        }
        .porta-stone-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 0.92rem;
          letter-spacing: 0.08em;
          color: #f5efdf;
          margin: 0 0 6px;
        }
        .porta-stone-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.9rem;
          color: rgba(238, 230, 210, 0.6);
          margin: 0;
        }
        .porta-natural-note {
          margin: 8px 4px 36px;
          padding-top: 8px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.92rem;
          color: var(--gold-soft);
        }

        /* Ring size + sizing note */
        .porta-size-wrap {
          margin: 0 0 36px;
          --ring-accent: rgba(220, 184, 110, 0.85);
          --ring-bg: rgba(18, 14, 8, 0.65);
          --ring-fg: #f5efdf;
          --ring-muted: rgba(238, 230, 210, 0.55);
        }

        .porta-sizing-note {
          margin-top: 22px;
          padding: 22px 24px;
          border: 1px solid rgba(201, 168, 76, 0.16);
          background: rgba(201, 168, 76, 0.03);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .porta-sizing-note p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          line-height: 1.7;
          color: var(--text);
          margin: 0;
        }
        .porta-sizing-note ul {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .porta-sizing-note li {
          font-family: 'Cinzel', serif;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-dim);
        }
        .porta-sizing-warning {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-style: italic;
          color: var(--gold-light);
          line-height: 1.6;
        }

        /* Summary */
        .porta-summary {
          margin: 36px 0 28px;
          padding: 24px 26px 20px;
          background: rgba(12, 9, 5, 0.55);
          border-top: 1px solid rgba(220, 184, 110, 0.32);
          border-bottom: 1px solid rgba(220, 184, 110, 0.32);
        }
        .porta-summary-row {
          display: flex; justify-content: space-between; align-items: baseline;
          gap: 14px; padding: 9px 0;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(201, 168, 76, 0.72);
        }
        .porta-summary-row + .porta-summary-row { border-top: 1px solid rgba(201, 168, 76, 0.10); }
        .porta-summary-label { color: rgba(201, 168, 76, 0.6); }
        .porta-summary-value {
          flex: 1; text-align: right;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1rem;
          text-transform: none;
          color: rgba(238, 230, 210, 0.92);
        }
        .porta-summary-sku {
          font-family: 'Inter', sans-serif;
          font-style: normal; font-size: 11px;
          letter-spacing: 0.28em;
        }
        .porta-summary-row--price { padding-top: 14px; }
        .porta-summary-price {
          font-family: 'Cinzel', serif;
          font-size: clamp(1.35rem, 2vw, 1.65rem);
          letter-spacing: 0.06em;
          color: #f5efdf;
        }
        .porta-summary-note {
          margin: 12px 0 0;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.92rem;
          color: var(--gold-soft);
          text-align: right;
        }

        /* CTA */
        .porta-cta {
          width: 100%;
          padding: 22px 32px;
          background: rgba(220, 184, 110, 0.92);
          color: #0a0806;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, letter-spacing 320ms ease;
        }
        .porta-cta:hover {
          background: rgba(232, 205, 152, 1);
          letter-spacing: 0.52em;
        }
        .porta-cta:disabled { opacity: 0.55; cursor: default; letter-spacing: 0.46em !important; }

        .porta-trust-line {
          margin: 14px 0 0;
          text-align: center;
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--gold-soft);
        }

        /* ── FINAL WORD ── */
        .porta-final {
          padding: 100px 24px 120px;
          text-align: center;
          background: radial-gradient(circle at 50% 0%, rgba(140, 92, 24, 0.10), transparent 65%), #07050300;
          border-top: 1px solid rgba(201, 168, 76, 0.12);
        }
        @media (min-width: 900px) { .porta-final { padding: 130px 60px 150px; } }
        .porta-final-eyebrow {
          font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase;
          color: var(--text-dim);
          margin: 0 0 18px;
        }
        .porta-final h2 {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.8rem, 3.4vw, 2.8rem);
          line-height: 1.25;
          color: rgba(238, 230, 210, 0.92);
          margin: 0 auto;
          max-width: 720px;
        }
        .porta-final-rule {
          margin: 26px auto 0;
          width: 60px; height: 1px;
          background: linear-gradient(to right, transparent, rgba(220, 184, 110, 0.55), transparent);
        }
      `}</style>

      <Link to="/shop?category=rings" className="porta-back" data-testid="porta-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="porta-hero" data-testid="porta-hero">
        <div className="porta-hero-img-wrap">
          <img
            src={HERO_IMG}
            alt={HERO_ALT}
            className="porta-hero-img"
            data-testid="porta-hero-img"
          />
        </div>
        <div className="porta-hero-text">
          <p className="porta-meta">PHILEON · SIGNET OBJECTS</p>
          <h1 className="porta-title" data-testid="porta-title">PORTA AUREA</h1>
          <p className="porta-translation">The Golden Gate</p>
          <p className="porta-tagline" data-testid="porta-tagline">
            Some doors open for everyone. This one doesn't.
          </p>
          <p className="porta-trust">
            Made to order · 4–6 weeks · Complimentary insured shipping
          </p>
        </div>
      </section>

      {/* ─── ARCHIVE GALLERY ──────────────────────────────────── */}
      <section className="porta-archive" data-testid="porta-archive">
        <div className="porta-archive-head">
          <p className="porta-archive-eyebrow">THE ARCHIVE</p>
          <h2 className="porta-archive-title">The signet, studied.</h2>
        </div>
        <div className="porta-archive-grid">
          <figure className="porta-archive-cell">
            <img src={HERO_IMG} alt={HERO_ALT} loading="lazy" />
          </figure>
          <figure className="porta-archive-cell">
            <div className="porta-archive-empty">ADDITIONAL FRAMES · PENDING</div>
          </figure>
        </div>
      </section>

      {/* ─── COMPOSITION · STRUCTURE · CRAFT ─────────────────── */}
      <section className="porta-editorial" data-testid="porta-editorial">
        <div className="porta-editorial-grid">
          {COMPOSITION.map((c) => (
            <div key={c.head} className="porta-editorial-cell">
              <h4>{c.head}</h4>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SPECIFICATIONS ──────────────────────────────────── */}
      <section className="porta-specs" data-testid="porta-specs">
        <div className="porta-specs-inner">
          <p className="porta-specs-eyebrow">SPECIFICATIONS</p>
          <ul className="porta-specs-list">
            {SPECS.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </section>

      {/* ─── CONFIGURATOR ────────────────────────────────────── */}
      <section className="porta-config" data-testid="porta-configurator">
        <div className="porta-config-inner">
          <header className="porta-config-head">
            <p className="porta-config-eyebrow">SELECT COMPOSITION</p>
            <h2 className="porta-config-title">Acquire Porta Aurea</h2>
            <p className="porta-config-sub">
              Three weights of yellow gold, hand-built around a single emerald-cut ruby.
            </p>
          </header>

          {/* Metal */}
          <p className="porta-section-label">METAL</p>
          <div className="porta-tiers" role="radiogroup" aria-label="Metal selection" data-testid="porta-tiers">
            {METAL_TIERS.map((t) => {
              const isSel = selectedTier === t.id;
              const tierUsd = tierPricesLive?.[t.id]?.price || 0;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => setSelectedTier(t.id)}
                  className={`porta-tier ${isSel ? "is-selected" : ""}`}
                  data-testid={`porta-tier-${t.id}`}
                >
                  {t.featured && <span className="porta-tier-featured">FEATURED</span>}
                  <span className="porta-tier-badge">{t.badge}</span>
                  <span className="porta-tier-name">{t.name}</span>
                  <span className="porta-tier-desc">{t.description}</span>
                  <span className="porta-tier-price">
                    {tierUsd ? `$${tierUsd.toLocaleString("en-US")} USD` : "—"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stone */}
          <p className="porta-section-label">STONE</p>
          <div className="porta-stones" role="radiogroup" aria-label="Stone selection" data-testid="porta-stones">
            {STONE_OPTIONS.map((s) => {
              const isSel = selectedStone === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => setSelectedStone(s.id)}
                  className={`porta-stone ${isSel ? "is-selected" : ""}`}
                  data-testid={`porta-stone-${s.id}`}
                >
                  <p className="porta-stone-name">{s.label}</p>
                  <p className="porta-stone-sub">{s.short}</p>
                </button>
              );
            })}
          </div>
          <p className="porta-natural-note" data-testid="porta-natural-note">
            Natural ruby available by custom quote.
          </p>

          {/* Ring size + custom sizing note */}
          <p className="porta-section-label">RING SIZE</p>
          <div className="porta-size-wrap">
            <RingSizeSelector
              value={selectedSize}
              onChange={setSelectedSize}
              bandWidthMm={6.5}
              hideWideBandWarning={true}
              testIdPrefix="porta-size"
            />
            <div className="porta-sizing-note" data-testid="porta-sizing-note">
              <p>
                Porta Aurea carries a wide architectural profile designed to sit with substantial presence on the hand.
              </p>
              <ul>
                <li>Face dimensions: 18mm × 18mm</li>
                <li>Total height: 28mm</li>
                <li>Band width: 6.5mm</li>
                <li>Wide-band fit profile</li>
                <li>Recommended: size up by 0.5 for a relaxed fit</li>
              </ul>
              <span className="porta-sizing-warning">
                Due to the width and interior texture, collectors between sizes should size upward.
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="porta-summary" data-testid="porta-summary">
            <div className="porta-summary-row">
              <span className="porta-summary-label">Selection</span>
              <span className="porta-summary-value">
                {currentTier.name} · {currentStone.label} · {ringSizeLabel(selectedSize)}
              </span>
            </div>
            <div className="porta-summary-row">
              <span className="porta-summary-label">SKU</span>
              <span className="porta-summary-value porta-summary-sku">{sku}</span>
            </div>
            <div className="porta-summary-row porta-summary-row--price">
              <span className="porta-summary-label">Today's price</span>
              <span className="porta-summary-price" data-testid="porta-summary-price">
                {formattedPrice}
              </span>
            </div>
            <p className="porta-summary-note">
              Prices reflect today's metals market · made to order in 4–6 weeks
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding || !displayPrice}
            className="porta-cta"
            data-testid="porta-add-to-cart-btn"
          >
            {isAdding ? "ADDING…" : "ADD TO CART"}
          </button>
          <p className="porta-trust-line">
            Made to order · 4–6 weeks · Complimentary insured shipping
          </p>
        </div>
      </section>

      {/* ─── FINAL WORD ──────────────────────────────────────── */}
      <section className="porta-final" data-testid="porta-final">
        <p className="porta-final-eyebrow">FINAL WORD</p>
        <h2>
          A gate is not a door. It does not invite. It decides.
        </h2>
        <div className="porta-final-rule" />
      </section>
    </section>
  );
}
