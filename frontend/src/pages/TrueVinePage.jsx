import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { useLiveTierPrices } from "@/hooks/useLivePrice";

/**
 * THE TRUE VINE — PHILEON Sacred Objects · Pendant
 *
 * Finished object. Direct purchase, no consultation flow.
 * Open mesh arch · raised cross · vine relief.
 *
 * 4 metal tiers × 4 chain options = 16 compound SKUs in livePricingConfig.theTrueVine.
 * SKU key format: "{tier}__{chain}" (e.g. "heirloom__rope-22").
 * Displayed prices are USD via cadToUsdLuxury (sitewide USD lock).
 *
 * Namespace: .vine-
 */

const HERO_IMG = "/the-true-vine/the-true-vine-hero.jpg";

// 5-frame editorial archive — front · three-quarter · vine macro · on-body · in-hand
const GALLERY = [
  { src: "/the-true-vine/tv-02-front.jpg",          label: "01 · FRONT",         alt: "THE TRUE VINE front view — open mesh arch with raised cross and vine relief." },
  { src: "/the-true-vine/tv-03-three-quarter.jpg",  label: "02 · THREE-QUARTER", alt: "THE TRUE VINE three-quarter view showing depth of the mesh arch and dimensional bail." },
  { src: "/the-true-vine/tv-04-vine-macro.png",     label: "03 · VINE · MACRO",  alt: "Macro view of the sculpted vine relief and ivy leaves climbing the cross." },
  { src: "/the-true-vine/tv-05-on-body.png",        label: "04 · ON BODY",       alt: "THE TRUE VINE worn on a 22-inch rope chain over a dark hoodie." },
  { src: "/the-true-vine/tv-06-in-hand.png",        label: "05 · IN HAND",       alt: "THE TRUE VINE pendant held to reveal its scale and finishing." },
];

// Inscription rules — uppercase serif/sans only, archival, restrained.
const ENGRAVING_PRICE_USD = 250;
const ENGRAVING_MAX_CHARS = 40;
const ENGRAVING_ALLOWED = /^[A-Z0-9 :./-]*$/;
const ENGRAVING_PLACEHOLDERS = [
  "JOHN 15:1",
  "ABIDE IN ME",
  "PSALM 91",
  "IN HIS NAME",
  "FOR THE ONES WHO STAYED",
];

const METAL_TIERS = [
  {
    id: "foundation",
    sku: "TV-SS",
    name: "Sterling Silver Vermeil",
    subtitle: "Sterling Silver + heavy yellow gold plating",
    badge: "FOUNDATION",
    metal: "Sterling Silver Vermeil",
  },
  {
    id: "signature",
    sku: "TV-10Y",
    name: "10K Yellow Gold",
    subtitle: "Solid 10K yellow gold",
    badge: "SIGNATURE",
    metal: "10K Yellow Gold",
  },
  {
    id: "heirloom",
    sku: "TV-14Y",
    name: "14K Yellow Gold",
    subtitle: "Solid 14K yellow gold",
    badge: "HEIRLOOM",
    metal: "14K Yellow Gold",
  },
  {
    id: "collector",
    sku: "TV-18Y",
    name: "18K Yellow Gold",
    subtitle: "Solid 18K yellow gold",
    badge: "COLLECTOR",
    metal: "18K Yellow Gold",
  },
];

const CHAIN_OPTIONS = [
  { id: "pendant-only", label: "Pendant Only", short: "No chain" },
  { id: "rope-20",      label: '20" Rope Chain', short: "20 inches" },
  { id: "rope-22",      label: '22" Rope Chain', short: "22 inches" },
  { id: "rope-24",      label: '24" Rope Chain', short: "24 inches" },
];

const SPECS = [
  "Approx. 35mm × 20mm",
  "Estimated 18K weight: 12.5g",
  "Open mesh arch silhouette",
  "Raised cross with vine relief",
  "Hand-finished bail",
  "Made to order · 3–4 weeks",
];

const CRAFT_NOTES = [
  {
    head: "THE ARCH",
    body: "The open mesh arch is hand-built before the cross is set. Each cell of the lattice is finished individually — the negative space carries as much craft as the metal.",
  },
  {
    head: "THE VINE",
    body: "The vine relief is sculpted directly into the cross, not applied over it. Six leaves climb from the base to the crown, each cut by hand before polish.",
  },
  {
    head: "THE COMPOSITION",
    body: "The cross does not float inside the arch — it carries it. A single sacred object, not an ornament on a frame.",
  },
];

const fmtUsd = (n) => `$${Number(n || 0).toLocaleString("en-US")} USD`;

export default function TrueVinePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const tierPricesLive = useLiveTierPrices("theTrueVine");

  // Default per brief: 14K Yellow Gold · 22" Rope Chain
  const [selectedTier, setSelectedTier] = useState("heirloom");
  const [selectedChain, setSelectedChain] = useState("rope-22");
  const [engravingEnabled, setEngravingEnabled] = useState(false);
  const [engravingText, setEngravingText] = useState("");
  const [engravingPlaceholder] = useState(
    () => ENGRAVING_PLACEHOLDERS[Math.floor(Math.random() * ENGRAVING_PLACEHOLDERS.length)]
  );

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const currentTier = METAL_TIERS.find((t) => t.id === selectedTier) || METAL_TIERS[2];
  const currentChain = CHAIN_OPTIONS.find((c) => c.id === selectedChain) || CHAIN_OPTIONS[2];

  // Compound SKU key for backend pricing config lookup
  const compoundTierKey = `${selectedTier}__${selectedChain}`;
  const pendantOnlyKey = `${selectedTier}__pendant-only`;

  // USD price for current combo, falling back to pendant-only if hook not yet ready
  const baseUsd = tierPricesLive?.[compoundTierKey]?.price || 0;
  const pendantUsd = tierPricesLive?.[pendantOnlyKey]?.price || 0;
  const engravingUsd = engravingEnabled ? ENGRAVING_PRICE_USD : 0;
  const totalUsd = baseUsd + engravingUsd;

  // Trimmed, uppercased inscription text (what we actually engrave / pass to cart)
  const sanitizedEngraving = engravingText
    .toUpperCase()
    .replace(/[^A-Z0-9 :./-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, ENGRAVING_MAX_CHARS);

  const handleEngravingChange = (e) => {
    const raw = e.target.value.toUpperCase();
    // Strip disallowed characters live so the field never holds bad input.
    const cleaned = raw.replace(/[^A-Z0-9 :./-]/g, "").slice(0, ENGRAVING_MAX_CHARS);
    setEngravingText(cleaned);
  };

  const sku = useMemo(() => {
    const chainToken =
      selectedChain === "pendant-only"
        ? "PO"
        : selectedChain.replace("rope-", "ROPE");
    const base = `${currentTier.sku}-${chainToken}`;
    return engravingEnabled ? `${base}-ENGRAVED` : base;
  }, [currentTier.sku, selectedChain, engravingEnabled]);

  const onAddToCart = () => {
    const engravingFinal = engravingEnabled ? sanitizedEngraving : "";
    // Cart drawer renders `variant` as a human-readable line. We keep
    // the structured engraving fields on the product payload itself
    // (they're propagated through CartContext spread for downstream
    // order processing).
    const variant = engravingEnabled
      ? `Laser engraved: ${engravingFinal || "(awaiting text)"}`
      : null;
    handleAddToCart(
      {
        id: `the-true-vine-${selectedTier}-${selectedChain}${engravingEnabled ? "-engraved" : ""}`,
        name: `THE TRUE VINE — ${currentTier.metal} · ${currentChain.label}${engravingEnabled ? ` · Engraved "${engravingFinal}"` : ""}`,
        price: totalUsd,
        productKey: "theTrueVine",
        tierKey: compoundTierKey,
        metal: currentTier.metal,
        chain: currentChain.label,
        sku,
        engravingEnabled,
        engravingMethod: engravingEnabled ? "laser" : null,
        engravingText: engravingFinal,
        quantity: 1,
        image: HERO_IMG,
      },
      1,
      variant,
    );
  };

  return (
    <section
      className={`vine-room${isMounted ? " vine-loaded" : ""}`}
      data-page="the-true-vine"
      data-testid="true-vine-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .vine-room {
          background: #0c0a07;
          color: #ece5d2;
          min-height: 100vh;
          opacity: 0;
          transition: opacity 900ms ease;
          font-family: 'Inter', sans-serif;
        }
        .vine-room.vine-loaded { opacity: 1; }

        .vine-back {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 22px 24px;
          font-size: 11px; letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(236, 229, 210, 0.55);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .vine-back:hover { color: rgba(236, 229, 210, 0.95); }

        /* HERO */
        .vine-hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          padding: 0 0 60px;
          background:
            radial-gradient(circle at 50% 30%, rgba(110, 84, 36, 0.22), transparent 65%),
            #0c0a07;
        }
        @media (min-width: 900px) {
          .vine-hero {
            grid-template-columns: 1fr 1fr;
            min-height: min(86vh, 820px);
            align-items: center;
            padding: 0 60px 80px;
            gap: 60px;
          }
        }

        .vine-hero-img-wrap {
          position: relative;
          padding: 40px 24px 24px;
          display: flex; align-items: center; justify-content: center;
        }
        @media (min-width: 900px) { .vine-hero-img-wrap { padding: 0; } }
        .vine-hero-img {
          max-width: 100%;
          max-height: 540px;
          object-fit: contain;
          filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.55));
        }
        @media (min-width: 900px) { .vine-hero-img { max-height: 680px; } }

        .vine-hero-text {
          padding: 0 28px;
          display: flex; flex-direction: column; justify-content: center;
        }
        @media (min-width: 900px) { .vine-hero-text { padding: 0; } }

        .vine-meta {
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 18px;
        }
        .vine-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: clamp(2.6rem, 7vw, 4.6rem);
          letter-spacing: 0.02em;
          line-height: 0.98;
          color: #f5efdf;
          margin: 0 0 22px;
        }
        .vine-scripture {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.95rem;
          letter-spacing: 0.04em;
          color: rgba(198, 168, 107, 0.85);
          margin: 0 0 22px;
        }
        .vine-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.4vw, 1.25rem);
          line-height: 1.55;
          color: rgba(236, 229, 210, 0.85);
          margin: 0 0 32px;
          max-width: 480px;
        }
        .vine-trust {
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.6);
          margin: 0;
        }

        /* EDITORIAL CRAFT NOTES */
        .vine-craft {
          padding: 80px 24px 90px;
          border-top: 1px solid rgba(198, 168, 107, 0.12);
        }
        @media (min-width: 900px) { .vine-craft { padding: 100px 60px 110px; } }
        .vine-craft-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 36px;
        }
        @media (min-width: 800px) { .vine-craft-grid { grid-template-columns: repeat(3, 1fr); gap: 44px; } }
        .vine-craft-cell h4 {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 16px;
        }
        .vine-craft-cell p {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgba(236, 229, 210, 0.85);
          margin: 0;
        }

        /* SPECS */
        .vine-specs {
          padding: 60px 24px 90px;
          border-top: 1px solid rgba(198, 168, 107, 0.10);
        }
        @media (min-width: 900px) { .vine-specs { padding: 80px 60px 110px; } }
        .vine-specs-inner { max-width: 1100px; margin: 0 auto; }
        .vine-specs-eyebrow {
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 24px;
        }
        .vine-specs-list {
          list-style: none; padding: 0; margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px 36px;
        }
        @media (min-width: 700px) { .vine-specs-list { grid-template-columns: repeat(2, 1fr); } }
        .vine-specs-list li {
          position: relative; padding-left: 18px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.6;
          color: rgba(236, 229, 210, 0.85);
        }
        .vine-specs-list li::before {
          content: "•"; position: absolute; left: 4px;
          color: rgba(198, 168, 107, 0.7);
        }

        /* CONFIGURATOR */
        .vine-config {
          padding: 80px 24px 110px;
          background:
            radial-gradient(circle at 50% 0%, rgba(110, 84, 36, 0.16), transparent 60%),
            #0c0a07;
          border-top: 1px solid rgba(198, 168, 107, 0.12);
        }
        @media (min-width: 900px) { .vine-config { padding: 100px 60px 130px; } }
        .vine-config-inner { max-width: 980px; margin: 0 auto; }
        .vine-config-head { text-align: center; margin-bottom: 56px; }
        .vine-config-eyebrow {
          font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 18px;
        }
        .vine-config-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          letter-spacing: 0.04em;
          color: #f5efdf;
          margin: 0 0 16px;
        }
        .vine-config-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1rem, 1.3vw, 1.15rem);
          color: rgba(236, 229, 210, 0.78);
          max-width: 460px;
          margin: 0 auto 18px;
        }
        .vine-config-trust {
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.6);
        }

        .vine-section-label {
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 18px;
        }

        /* Metal cards */
        .vine-tiers {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin: 0 0 48px;
        }
        @media (min-width: 900px) { .vine-tiers { grid-template-columns: repeat(4, 1fr); } }
        .vine-tier {
          position: relative;
          display: flex; flex-direction: column; align-items: flex-start;
          padding: 22px 18px 20px;
          background: rgba(18, 14, 8, 0.65);
          border: 1px solid rgba(198, 168, 107, 0.18);
          color: inherit;
          cursor: pointer;
          text-align: left;
          transition: border-color 380ms ease, background 380ms ease;
        }
        .vine-tier:hover { border-color: rgba(198, 168, 107, 0.5); background: rgba(28, 22, 12, 0.75); }
        .vine-tier.is-selected {
          border-color: rgba(220, 190, 130, 0.85);
          background: rgba(36, 28, 14, 0.82);
        }
        .vine-tier.is-selected::before {
          content: ""; position: absolute; inset: -1px;
          border: 1px solid rgba(220, 190, 130, 0.4);
          pointer-events: none;
        }
        .vine-tier-badge {
          font-size: 9px;
          letter-spacing: 0.42em; text-transform: uppercase;
          color: rgba(220, 190, 130, 0.85);
          margin-bottom: 12px;
        }
        .vine-tier-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 0.98rem;
          letter-spacing: 0.06em;
          color: #f5efdf;
          margin-bottom: 4px;
        }
        .vine-tier-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.88rem;
          color: rgba(236, 229, 210, 0.65);
          margin-bottom: 14px;
          line-height: 1.4;
        }
        .vine-tier-price {
          margin-top: auto;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1rem;
          letter-spacing: 0.06em;
          color: #f5efdf;
        }

        /* Chain cards */
        .vine-chains {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin: 0 0 36px;
        }
        @media (min-width: 900px) { .vine-chains { grid-template-columns: repeat(4, 1fr); } }
        .vine-chain {
          padding: 18px 16px;
          background: rgba(18, 14, 8, 0.55);
          border: 1px solid rgba(198, 168, 107, 0.16);
          color: inherit;
          cursor: pointer;
          text-align: left;
          transition: border-color 320ms ease, background 320ms ease;
        }
        .vine-chain:hover { border-color: rgba(198, 168, 107, 0.45); }
        .vine-chain.is-selected {
          border-color: rgba(220, 190, 130, 0.85);
          background: rgba(36, 28, 14, 0.7);
        }
        .vine-chain-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 0.92rem;
          letter-spacing: 0.06em;
          color: #f5efdf;
          margin: 0 0 6px;
        }
        .vine-chain-add {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.9rem;
          color: rgba(220, 190, 130, 0.78);
        }
        .vine-chain-free {
          color: rgba(236, 229, 210, 0.5);
        }

        /* Summary */
        .vine-summary {
          margin: 0 0 28px;
          padding: 24px 26px 20px;
          background: rgba(14, 10, 6, 0.55);
          border-top: 1px solid rgba(198, 168, 107, 0.32);
          border-bottom: 1px solid rgba(198, 168, 107, 0.32);
        }
        .vine-summary-row {
          display: flex; justify-content: space-between; align-items: baseline;
          gap: 14px; padding: 9px 0;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.72);
        }
        .vine-summary-row + .vine-summary-row { border-top: 1px solid rgba(198, 168, 107, 0.10); }
        .vine-summary-label { color: rgba(198, 168, 107, 0.6); }
        .vine-summary-value {
          flex: 1; text-align: right;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1rem;
          letter-spacing: 0.01em;
          text-transform: none;
          color: rgba(236, 229, 210, 0.92);
        }
        .vine-summary-sku {
          font-family: 'Inter', sans-serif;
          font-style: normal; font-size: 11px;
          letter-spacing: 0.28em;
        }
        .vine-summary-row--price { padding-top: 14px; }
        .vine-summary-price {
          font-family: 'Cinzel', serif;
          font-size: clamp(1.35rem, 2vw, 1.65rem);
          letter-spacing: 0.06em;
          color: #f5efdf;
        }
        .vine-summary-note {
          margin: 12px 0 0;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.92rem;
          color: rgba(198, 168, 107, 0.6);
          text-align: right;
        }

        /* Add to Cart */
        .vine-cta {
          width: 100%;
          padding: 22px 32px;
          background: rgba(220, 190, 130, 0.92);
          color: #0c0a07;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, letter-spacing 320ms ease;
        }
        .vine-cta:hover {
          background: rgba(232, 205, 152, 1);
          letter-spacing: 0.52em;
        }
        .vine-cta:disabled { opacity: 0.55; cursor: default; letter-spacing: 0.46em !important; }

        /* GALLERY */
        .vine-gallery {
          padding: 80px 24px 70px;
          border-top: 1px solid rgba(198, 168, 107, 0.10);
        }
        @media (min-width: 900px) { .vine-gallery { padding: 110px 60px 90px; } }
        .vine-gallery-head { max-width: 1100px; margin: 0 auto 36px; }
        @media (min-width: 900px) { .vine-gallery-head { margin-bottom: 48px; } }
        .vine-gallery-eyebrow {
          font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 12px;
        }
        .vine-gallery-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1.5rem, 2.6vw, 2.2rem);
          line-height: 1.15;
          color: rgba(236, 229, 210, 0.92);
          margin: 0;
        }
        .vine-gallery-grid {
          max-width: 1100px; margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 700px) { .vine-gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }
        @media (min-width: 1024px) { .vine-gallery-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
        .vine-gallery-cell {
          position: relative;
          margin: 0;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #0a0805;
          border: 1px solid rgba(198, 168, 107, 0.12);
        }
        .vine-gallery-cell img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 1200ms cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 600ms ease;
          opacity: 0.92;
        }
        .vine-gallery-cell:hover img { transform: scale(1.025); opacity: 1; }
        .vine-gallery-cell figcaption {
          position: absolute; left: 14px; bottom: 12px;
          padding: 6px 10px;
          font-size: 9.5px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(236, 229, 210, 0.92);
          background: rgba(12, 10, 7, 0.55);
          border: 1px solid rgba(198, 168, 107, 0.22);
          backdrop-filter: blur(8px);
        }

        /* SACRED INSCRIPTION */
        .vine-engraving-subtext {
          margin: -4px 0 22px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.98rem;
          color: rgba(236, 229, 210, 0.7);
        }
        .vine-engraving { margin: 0 0 40px; }
        .vine-engraving-toggle {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 20px;
          background: rgba(18, 14, 8, 0.55);
          border: 1px solid rgba(198, 168, 107, 0.18);
          cursor: pointer;
          transition: border-color 320ms ease, background 320ms ease;
        }
        .vine-engraving-toggle:hover { border-color: rgba(198, 168, 107, 0.45); }
        .vine-engraving-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
        .vine-engraving-box {
          flex: 0 0 18px;
          width: 18px; height: 18px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid rgba(220, 190, 130, 0.55);
          background: rgba(8, 6, 3, 0.5);
          transition: border-color 220ms ease, background 220ms ease;
        }
        .vine-engraving-tick {
          display: block;
          width: 8px; height: 8px;
          background: transparent;
          transition: background 220ms ease;
        }
        .vine-engraving-toggle input:checked ~ .vine-engraving-box {
          border-color: rgba(220, 190, 130, 0.95);
          background: rgba(28, 20, 8, 0.85);
        }
        .vine-engraving-toggle input:checked ~ .vine-engraving-box .vine-engraving-tick {
          background: rgba(220, 190, 130, 0.95);
        }
        .vine-engraving-toggle input:focus-visible ~ .vine-engraving-box {
          outline: 2px solid rgba(220, 190, 130, 0.7);
          outline-offset: 2px;
        }
        .vine-engraving-toggle-label {
          flex: 1;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 0.95rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #f5efdf;
        }
        .vine-engraving-toggle-price {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1rem;
          color: rgba(220, 190, 130, 0.85);
        }
        .vine-engraving-helper {
          margin: 10px 4px 0;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.58);
        }
        .vine-engraving-field {
          margin-top: 22px;
          padding: 22px 22px 20px;
          background: rgba(10, 8, 5, 0.62);
          border: 1px solid rgba(198, 168, 107, 0.18);
          animation: vineFadeIn 420ms ease both;
        }
        @keyframes vineFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vine-engraving-field-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 12px;
        }
        .vine-engraving-textarea {
          width: 100%;
          background: rgba(4, 3, 2, 0.55);
          border: 1px solid rgba(198, 168, 107, 0.22);
          color: #f5efdf;
          padding: 14px 16px;
          font-family: 'Cormorant Garamond', 'Times New Roman', serif;
          font-weight: 400;
          font-size: clamp(1.05rem, 1.4vw, 1.25rem);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          line-height: 1.4;
          resize: vertical;
          min-height: 56px;
          transition: border-color 280ms ease, background 280ms ease;
        }
        .vine-engraving-textarea::placeholder {
          color: rgba(236, 229, 210, 0.32);
          letter-spacing: 0.16em;
          font-style: italic;
        }
        .vine-engraving-textarea:focus {
          outline: none;
          border-color: rgba(220, 190, 130, 0.7);
          background: rgba(8, 6, 3, 0.75);
        }
        .vine-engraving-meta {
          margin-top: 10px;
          display: flex; justify-content: space-between; align-items: baseline;
          gap: 14px;
          flex-wrap: wrap;
        }
        .vine-engraving-rules {
          margin: 0;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.55);
          line-height: 1.7;
        }
        .vine-engraving-count {
          margin: 0;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.28em;
          color: rgba(220, 190, 130, 0.65);
          font-variant-numeric: tabular-nums;
        }
        .vine-engraving-production {
          margin: 14px 0 0;
          padding-top: 12px;
          border-top: 1px solid rgba(198, 168, 107, 0.10);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.92rem;
          color: rgba(236, 229, 210, 0.6);
        }

        /* Summary inscription text */
        .vine-summary-inscription {
          font-family: 'Cormorant Garamond', 'Times New Roman', serif;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-style: normal;
        }
        .vine-summary-inscription-empty {
          font-style: italic;
          letter-spacing: 0.04em;
          text-transform: none;
          color: rgba(236, 229, 210, 0.5);
        }
      `}</style>

      <Link to="/shop?category=pendants" className="vine-back" data-testid="vine-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="vine-hero" data-testid="vine-hero">
        <div className="vine-hero-img-wrap">
          <img
            src={HERO_IMG}
            alt="THE TRUE VINE pendant in yellow gold with open mesh arch, raised cross, and vine relief."
            className="vine-hero-img"
            data-testid="vine-hero-img"
          />
        </div>
        <div className="vine-hero-text">
          <p className="vine-meta">PHILEON · SACRED OBJECTS</p>
          <h1 className="vine-title" data-testid="vine-title">THE TRUE VINE</h1>
          <p className="vine-scripture">John 15:1</p>
          <p className="vine-tagline" data-testid="vine-tagline">
            The vine does not decorate the cross. It claims it.
          </p>
          <p className="vine-trust">
            Made to order · 3–4 weeks · Complimentary insured shipping
          </p>
        </div>
      </section>

      {/* ─── ARCHIVE GALLERY ────────────────────────────────── */}
      <section className="vine-gallery" data-testid="vine-gallery" aria-label="The True Vine archive">
        <div className="vine-gallery-head">
          <p className="vine-gallery-eyebrow">THE ARCHIVE</p>
          <h2 className="vine-gallery-title">Five frames. One sacred object.</h2>
        </div>
        <div className="vine-gallery-grid">
          {GALLERY.map((g) => (
            <figure key={g.src} className="vine-gallery-cell">
              <img src={g.src} alt={g.alt} loading="lazy" />
              <figcaption>{g.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ─── CRAFT NOTES ────────────────────────────────────── */}
      <section className="vine-craft" data-testid="vine-craft">
        <div className="vine-craft-grid">
          {CRAFT_NOTES.map((c) => (
            <div key={c.head} className="vine-craft-cell">
              <h4>{c.head}</h4>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SPECS ──────────────────────────────────────────── */}
      <section className="vine-specs" data-testid="vine-specs">
        <div className="vine-specs-inner">
          <p className="vine-specs-eyebrow">PIECE DETAILS</p>
          <ul className="vine-specs-list">
            {SPECS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── CONFIGURATOR ───────────────────────────────────── */}
      <section className="vine-config" data-testid="vine-configurator">
        <div className="vine-config-inner">
          <header className="vine-config-head">
            <p className="vine-config-eyebrow">SELECT COMPOSITION</p>
            <h2 className="vine-config-title">Select your composition</h2>
            <p className="vine-config-sub">
              Choose your metal and chain. We make each piece to order.
            </p>
            <p className="vine-config-trust">
              MADE TO ORDER · 3–4 WEEKS · COMPLIMENTARY INSURED SHIPPING
            </p>
          </header>

          {/* Metal */}
          <p className="vine-section-label">METAL</p>
          <div className="vine-tiers" role="radiogroup" aria-label="Metal selection" data-testid="vine-tiers">
            {METAL_TIERS.map((t) => {
              const isSel = selectedTier === t.id;
              const tierPendantUsd = tierPricesLive?.[`${t.id}__pendant-only`]?.price || 0;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => setSelectedTier(t.id)}
                  className={`vine-tier ${isSel ? "is-selected" : ""}`}
                  data-testid={`vine-tier-${t.id}`}
                >
                  <span className="vine-tier-badge">{t.badge}</span>
                  <span className="vine-tier-name">{t.name}</span>
                  <span className="vine-tier-sub">{t.subtitle}</span>
                  <span className="vine-tier-price">{fmtUsd(tierPendantUsd)}</span>
                </button>
              );
            })}
          </div>

          {/* Chain */}
          <p className="vine-section-label">CHAIN</p>
          <div className="vine-chains" role="radiogroup" aria-label="Chain selection" data-testid="vine-chains">
            {CHAIN_OPTIONS.map((c) => {
              const isSel = selectedChain === c.id;
              const comboUsd = tierPricesLive?.[`${selectedTier}__${c.id}`]?.price || 0;
              const addUsd = Math.max(0, comboUsd - pendantUsd);
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => setSelectedChain(c.id)}
                  className={`vine-chain ${isSel ? "is-selected" : ""}`}
                  data-testid={`vine-chain-${c.id}`}
                >
                  <p className="vine-chain-name">{c.label}</p>
                  <p className={`vine-chain-add ${addUsd === 0 ? "vine-chain-free" : ""}`}>
                    {addUsd === 0 ? "Included" : `+ ${fmtUsd(addUsd)}`}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Sacred Inscription */}
          <p className="vine-section-label">SACRED INSCRIPTION</p>
          <p className="vine-engraving-subtext">
            Optional laser engraving on the reverse side of the pendant.
          </p>

          <div className="vine-engraving" data-testid="vine-engraving">
            <label className="vine-engraving-toggle" data-testid="vine-engraving-toggle">
              <input
                type="checkbox"
                checked={engravingEnabled}
                onChange={(e) => setEngravingEnabled(e.target.checked)}
                data-testid="vine-engraving-checkbox"
              />
              <span className="vine-engraving-box" aria-hidden="true">
                <span className="vine-engraving-tick" />
              </span>
              <span className="vine-engraving-toggle-label">
                Sacred Inscription
              </span>
              <span className="vine-engraving-toggle-price">+ $250 USD</span>
            </label>
            <p className="vine-engraving-helper">
              Up to {ENGRAVING_MAX_CHARS} characters.
            </p>

            {engravingEnabled && (
              <div className="vine-engraving-field" data-testid="vine-engraving-field">
                <label htmlFor="vine-engraving-input" className="vine-engraving-field-label">
                  Inscription
                </label>
                <textarea
                  id="vine-engraving-input"
                  className="vine-engraving-textarea"
                  rows={2}
                  value={engravingText}
                  onChange={handleEngravingChange}
                  placeholder={engravingPlaceholder}
                  maxLength={ENGRAVING_MAX_CHARS}
                  spellCheck={false}
                  autoCapitalize="characters"
                  data-testid="vine-engraving-input"
                  aria-describedby="vine-engraving-rules vine-engraving-count"
                />
                <div className="vine-engraving-meta">
                  <p id="vine-engraving-rules" className="vine-engraving-rules">
                    Uppercase only. Permitted characters: A–Z · 0–9 · space · : . - /
                  </p>
                  <p id="vine-engraving-count" className="vine-engraving-count" data-testid="vine-engraving-count">
                    {sanitizedEngraving.length} / {ENGRAVING_MAX_CHARS}
                  </p>
                </div>
                <p className="vine-engraving-production">
                  Laser engraved on the reverse side of the pendant before final finishing.
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="vine-summary" data-testid="vine-summary">
            <div className="vine-summary-row">
              <span className="vine-summary-label">Selection</span>
              <span className="vine-summary-value">
                {currentTier.name} · {currentChain.label}
              </span>
            </div>
            {engravingEnabled && (
              <>
                <div className="vine-summary-row" data-testid="vine-summary-engraving-line">
                  <span className="vine-summary-label">Sacred Inscription</span>
                  <span className="vine-summary-value">+ $250 USD</span>
                </div>
                <div className="vine-summary-row">
                  <span className="vine-summary-label">Inscription</span>
                  <span className="vine-summary-value vine-summary-inscription" data-testid="vine-summary-inscription-text">
                    {sanitizedEngraving ? `"${sanitizedEngraving}"` : <em className="vine-summary-inscription-empty">— add text above —</em>}
                  </span>
                </div>
              </>
            )}
            <div className="vine-summary-row">
              <span className="vine-summary-label">SKU</span>
              <span className="vine-summary-value vine-summary-sku">{sku}</span>
            </div>
            <div className="vine-summary-row vine-summary-row--price">
              <span className="vine-summary-label">Today's price</span>
              <span className="vine-summary-price" data-testid="vine-summary-price">
                {fmtUsd(totalUsd)}
              </span>
            </div>
            <p className="vine-summary-note">
              Prices reflect today's metals market · made to order in 3–4 weeks
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="vine-cta"
            data-testid="vine-add-to-cart-btn"
          >
            {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
          </button>
        </div>
      </section>
    </section>
  );
}
