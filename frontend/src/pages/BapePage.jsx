import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Lightbox from "../components/CinematicLightbox";
import { useAddToCart } from "../hooks/useAddToCart";

/**
 * BAPE™ — TRIBUTE SERIES
 * "Not collaboration. Recognition."
 *
 * Full-screen bright luxury environment. Deliberately breaks the dark
 * PHILEON system — this is a cultural artifact presented as fine jewelry,
 * staged like an Art Basel object.
 */

/* USD prices derived from CAD * 0.75, rounded to nearest $500 per
   PHILEON sitewide luxury rounding rule. Sitewide USD lock — customer-
   facing UI never shows CAD. */
const VARIANTS = [
  {
    id: "10k-yellow",
    metal: "10K Yellow Gold",
    sublabel: "FOUNDATION",
    priceUsd: 9500,
    priceCad: 12500,
    weight: "14g–15g",
    description: "Entry tribute configuration. Full cultural presence with optimized gold weight and custom stone layout.",
    badge: "",
  },
  {
    id: "14k-yellow",
    metal: "14K Yellow Gold",
    sublabel: "SIGNATURE",
    priceUsd: 12500,
    priceCad: 16500,
    weight: "15g finished",
    description: "Signature configuration. Balanced luxury weight, full pavé architecture, calibrated custom stone arrangement.",
    badge: "MOST POPULAR",
  },
  {
    id: "18k-yellow",
    metal: "18K Yellow Gold",
    sublabel: "HEIRLOOM",
    priceUsd: 17000,
    priceCad: 22500,
    weight: "16g–17g",
    description: "Collector-grade configuration. Higher gold density, warmer tone, elevated finishing and archive-level execution.",
    badge: "COLLECTOR",
  },
];

const SPECS = [
  { label: "STONE COUNT",  value: "217 stones" },
  { label: "CONSTRUCTION", value: "Custom pavé signet" },
  { label: "MATERIALS",    value: "White Diamonds · Black Diamonds · Blue Sapphires · Yellow Sapphires · Ruby Stones" },
  { label: "FINISH",       value: "High polish mirror finish" },
  { label: "PRODUCTION",   value: "Made to order" },
  { label: "LEAD TIME",    value: "4–6 weeks" },
  { label: "SHIPPING",     value: "Complimentary insured worldwide shipping" },
];

const GALLERY = [
  { src: "/homage/bape-ring.webp",          label: "01 — SPOTLIGHTS",    alt: "BAPE — under spotlights with mirror reflection" },
  { src: "/homage/bape-01-front.png",       label: "02 — FRONT",         alt: "BAPE — front product shot on white" },
  { src: "/homage/bape-02-angled.png",      label: "03 — THREE QUARTER", alt: "BAPE — three-quarter angle on black" },
  { src: "/homage/bape-04-top.png",         label: "04 — OVERHEAD",      alt: "BAPE — top-down architecture on black" },
  { src: "/homage/bape-05-stone-macro.png", label: "05 — STONE FIELD",   alt: "BAPE — macro detail of the multi-color stone composition" },
  { src: "/homage/bape-03-side-enamel.png", label: "06 — ENAMEL FLAG",   alt: "BAPE — macro detail of the side enamel panel" },
  { src: "/homage/bape-06-palm.png",        label: "07 — IN HAND",       alt: "BAPE — resting in an open palm, intimate scale" },
  { src: "/homage/bape-07-worn-knuckle.png", label: "08 — WORN",          alt: "BAPE — worn across the knuckles" },
  { src: "/homage/bape-08-campaign-fist.png", label: "09 — RECOGNITION",  alt: "BAPE — editorial campaign, fist forward in BAPE hoodie" },
  { src: "/homage/bape-09-campaign-camo.png", label: "10 — LINEAGE",      alt: "BAPE — campaign portrait in original camo, prismatic gallery" },
  { src: "/homage/bape-motion.mp4",           label: "11 — IN MOTION",    alt: "BAPE — living editorial: ring on pedestal, poster figure in motion", type: "video", poster: "/homage/bape-ring.webp" },
];

export default function BapePage() {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState("14k-yellow");
  const [selectedRingSize, setSelectedRingSize] = useState("9");
  const [isMounted, setIsMounted] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const selectedVariant = VARIANTS.find((v) => v.id === selectedVariantId) || VARIANTS[1];

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const onAddToCart = () => {
    const sizeLabel = selectedRingSize === "custom" ? "Custom (Above US 12)" : `US ${selectedRingSize}`;
    handleAddToCart({
      id: `bape-${selectedVariant.id}-size-${selectedRingSize}`,
      name: `BAPE — ${selectedVariant.metal} · ${sizeLabel}`,
      price: selectedVariant.priceUsd,
      productKey: "bape",
      tierKey: selectedVariant.id,
      metal: selectedVariant.metal,
      ringSize: selectedRingSize,
      image: "/homage/bape-ring.webp",
    });
  };

  const priceText = `$${selectedVariant.priceUsd.toLocaleString("en-US")} USD`;

  return (
    <div className={`bp-room${isMounted ? " bp-loaded" : ""}`} data-page="bape" data-testid="bape-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@400;500&display=swap');

        .bp-room {
          position: relative;
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 50% 25%, #FFFFFF 0%, #F4F1EC 38%, #E6E0D6 70%, #C9C1B3 100%);
          color: #1A1815;
          overflow: hidden;
          opacity: 0;
          transition: opacity 1.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bp-room.bp-loaded { opacity: 1; }

        /* Soft particle field */
        .bp-particles {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background:
            radial-gradient(circle at 18% 32%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 1.6%),
            radial-gradient(circle at 78% 22%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 1.2%),
            radial-gradient(circle at 64% 78%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 0.9%),
            radial-gradient(circle at 32% 86%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 0.7%),
            radial-gradient(circle at 88% 64%, rgba(255,255,255,0.5)  0%, rgba(255,255,255,0) 0.6%),
            radial-gradient(circle at 12% 60%, rgba(255,255,255,0.6)  0%, rgba(255,255,255,0) 0.8%);
          animation: bpDrift 22s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes bpDrift {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(-12px, 8px, 0) scale(1.02); }
        }

        /* Stone glow accents (red, gold, blue from the BAPE setting) */
        .bp-glow {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background:
            radial-gradient(ellipse 40% 30% at 38% 58%, rgba(228, 178, 60, 0.18) 0%, rgba(228,178,60,0) 60%),
            radial-gradient(ellipse 30% 22% at 62% 52%, rgba(190, 38, 92, 0.14)  0%, rgba(190,38,92,0)  60%),
            radial-gradient(ellipse 26% 22% at 48% 64%, rgba(44, 64, 140, 0.12)  0%, rgba(44,64,140,0)  60%);
          mix-blend-mode: multiply;
        }

        .bp-back {
          position: absolute; top: 28px; left: 28px; z-index: 6;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Cinzel', serif; font-size: 10.5px; letter-spacing: 0.36em;
          color: rgba(26,24,21,0.55); text-decoration: none;
          transition: color 400ms ease;
        }
        .bp-back:hover { color: rgba(26,24,21,0.9); }

        /* ═════ EDITORIAL HEADER ═════════════════════════════ */
        .bp-header {
          position: relative; z-index: 4;
          max-width: 1200px; margin: 0 auto;
          padding: 96px clamp(20px, 6vw, 96px) 0;
          display: flex; flex-direction: column; gap: 14px;
          text-align: left;
        }
        @media (max-width: 768px) {
          .bp-header { padding: 84px 18px 0; gap: 10px; }
        }
        .bp-header-eyebrow {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 10.5px; letter-spacing: 0.42em;
          color: rgba(26,24,21,0.45); text-transform: uppercase;
          margin: 0;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        @media (max-width: 480px) {
          .bp-header-eyebrow { font-size: 9.5px; letter-spacing: 0.32em; }
        }
        .bp-header-title {
          font-family: 'Cinzel', serif; font-weight: 400;
          font-size: clamp(1.5rem, 2.6vw, 2rem);
          letter-spacing: 0.18em;
          color: #1A1815;
          margin: 0; text-transform: uppercase;
        }

        /* ═════ STAGE ═════════════════════════════════════════ */
        .bp-stage {
          position: relative; z-index: 3;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 32px 80px;
          text-align: center;
        }
        @media (max-width: 768px) { .bp-stage { padding: 32px 18px 60px; } }

        .bp-collection {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 11px; letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(26,24,21,0.55);
          margin: 0 0 24px 0;
        }

        .bp-ring-wrap {
          position: relative;
          width: 100%; max-width: 720px;
          aspect-ratio: 1/1;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto;
        }
        @media (max-width: 768px) { .bp-ring-wrap { max-width: 88vw; } }

        .bp-ring {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
          display: block;
          filter: drop-shadow(0 28px 32px rgba(0,0,0,0.18));
          animation: bpBreath 14s ease-in-out infinite alternate;
          will-change: transform, filter;
        }
        @keyframes bpBreath {
          0%   { transform: translateY(-4px) scale(1); }
          100% { transform: translateY(4px) scale(1.012); }
        }

        .bp-title {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: clamp(3.4rem, 7vw, 6rem);
          letter-spacing: -0.02em; line-height: 0.92;
          color: #1A1815;
          margin: 28px 0 0 0;
        }
        .bp-title sup {
          font-size: 0.32em; vertical-align: super; letter-spacing: 0.1em;
          color: rgba(26,24,21,0.55);
          margin-left: 6px;
        }

        .bp-sub {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-weight: 300; font-size: clamp(15px, 1.25vw, 19px);
          color: rgba(26,24,21,0.6);
          letter-spacing: 0.012em; line-height: 1.55;
          margin: 16px 0 0 0;
        }

        .bp-recognition {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 11.5px; letter-spacing: 0.42em;
          color: rgba(26,24,21,0.7); text-transform: uppercase;
          margin: 38px 0 0 0; position: relative; display: inline-block;
          padding-top: 22px;
        }
        .bp-recognition::before {
          content: ""; position: absolute; top: 0; left: 50%;
          transform: translateX(-50%);
          width: 36px; height: 1px;
          background: rgba(26,24,21,0.4);
        }

        .bp-status {
          margin-top: 56px;
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 11px; letter-spacing: 0.5em;
          color: rgba(26,24,21,0.55); text-transform: uppercase;
          padding: 14px 28px;
          border: 1px solid rgba(26,24,21,0.18);
          display: inline-block;
        }

        /* ═════ RECOGNITION SECTION (standalone) ═══════════ */
        .bp-recognition-section {
          position: relative; z-index: 3;
          display: flex; align-items: center; justify-content: center;
          padding: clamp(56px, 9vh, 110px) clamp(20px, 6vw, 96px);
          text-align: center;
        }
        .bp-recognition-section .bp-recognition {
          margin: 0;
        }

        /* ═════ VARIANTS BLOCK ═══════════════════════════════ */
        .bp-variants {
          position: relative; z-index: 3;
          padding: clamp(56px, 9vh, 110px) clamp(20px, 6vw, 96px);
          background:
            radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%),
            rgba(255,255,255,0.4);
          border-top: 1px solid rgba(26,24,21,0.07);
        }
        .bp-variants-inner { max-width: 1100px; margin: 0 auto; text-align: center; }
        .bp-variants-eyebrow {
          font-family: 'Cinzel', serif; font-weight: 500; font-size: 11px;
          letter-spacing: 0.42em; text-transform: uppercase;
          color: rgba(26,24,21,0.55); margin: 0;
        }
        .bp-variants-grid {
          margin: 44px 0 0 0;
          display: grid; gap: 18px;
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 900px) { .bp-variants-grid { grid-template-columns: 1fr; gap: 14px; } }

        .bp-variant {
          position: relative;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(26,24,21,0.12);
          padding: 28px 24px 26px;
          text-align: left;
          cursor: pointer;
          transition:
            border-color 360ms cubic-bezier(0.22,1,0.36,1),
            background-color 360ms cubic-bezier(0.22,1,0.36,1),
            transform 360ms cubic-bezier(0.22,1,0.36,1),
            box-shadow 360ms cubic-bezier(0.22,1,0.36,1);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        .bp-variant:hover {
          border-color: rgba(26,24,21,0.32);
          background: rgba(255,255,255,0.75);
        }
        .bp-variant.is-selected {
          border-color: rgba(166, 124, 50, 0.9);
          background: rgba(255,255,255,0.82);
          box-shadow: 0 8px 24px rgba(166,124,50,0.16);
          transform: translateY(-2px);
        }
        .bp-variant-badge {
          position: absolute; top: -10px; left: 24px;
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 9px; letter-spacing: 0.36em;
          color: #1A1815;
          background: linear-gradient(180deg, #EEDFB5 0%, #D8B976 100%);
          padding: 5px 10px;
        }
        .bp-variant-sublabel {
          font-family: 'Cinzel', serif; font-weight: 500; font-size: 10px;
          letter-spacing: 0.36em; color: rgba(26,24,21,0.5);
          text-transform: uppercase; margin: 0;
        }
        .bp-variant-metal {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: clamp(18px, 1.4vw, 22px);
          letter-spacing: -0.005em; color: #1A1815;
          margin: 8px 0 0 0;
        }
        .bp-variant-price {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: clamp(20px, 1.6vw, 26px);
          letter-spacing: 0.04em; color: #1A1815;
          margin: 16px 0 0 0;
          font-variant-numeric: tabular-nums;
        }
        .bp-variant-weight {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-weight: 300; font-size: 13px;
          color: rgba(26,24,21,0.6); margin: 4px 0 0 0;
        }
        .bp-variant-desc {
          margin: 20px 0 0 0; padding-top: 18px;
          border-top: 1px solid rgba(26,24,21,0.1);
          font-family: 'Cormorant Garamond', serif; font-weight: 300;
          font-size: 14px; color: rgba(26,24,21,0.7); line-height: 1.55;
        }

        /* ═════ RING SIZE BLOCK ═══════════════════════════ */
        .bape-size-block {
          display: flex; flex-direction: column; gap: 10px;
          margin: 36px auto 8px;
          max-width: 360px;
          text-align: left;
        }
        .bape-size-label {
          font-size: 11px; letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.58);
          font-family: 'Inter', sans-serif;
        }
        .bape-size-select {
          width: 100%; height: 54px;
          padding: 0 18px;
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(212,175,55,0.22);
          color: #111;
          font-size: 14px; letter-spacing: 0.04em;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition:
            border-color 220ms ease,
            background 220ms ease,
            box-shadow 220ms ease;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          appearance: none;
          -webkit-appearance: none;
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%23A67C32' stroke-width='1.2' fill='none' stroke-linecap='square'/></svg>"),
            linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.72) 100%);
          background-repeat: no-repeat;
          background-position: right 18px center, 0 0;
          padding-right: 44px;
        }
        .bape-size-select:hover { border-color: rgba(212,175,55,0.4); }
        .bape-size-select:focus {
          border-color: rgba(212,175,55,0.7);
          background: rgba(255,255,255,0.82);
          box-shadow: 0 0 0 1px rgba(212,175,55,0.14);
        }

        /* CTA */
        .bp-cta {
          margin: 48px 0 0 0;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .bp-cta-price {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: clamp(20px, 1.8vw, 26px);
          letter-spacing: 0.18em; color: #1A1815;
          font-variant-numeric: tabular-nums; margin: 0;
        }
        .bp-cta-lead {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-weight: 300; font-size: 14px;
          color: rgba(26,24,21,0.55); margin: 0;
        }
        .bp-cta-button {
          margin-top: 18px;
          font-family: 'Cinzel', serif; font-weight: 500; font-size: 11px;
          letter-spacing: 0.42em; text-transform: uppercase;
          color: #FFFFFF;
          background: #1A1815;
          border: 1px solid #1A1815;
          padding: 18px 56px; cursor: pointer;
          transition: background 320ms ease, color 320ms ease,
                      border-color 320ms ease, transform 320ms ease;
        }
        .bp-cta-button:hover {
          background: #2A2723; border-color: #2A2723; transform: translateY(-1px);
        }
        .bp-cta-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* ═════ SPECIFICATIONS ═════════════════════════════ */
        .bp-specs {
          position: relative; z-index: 3;
          padding: clamp(56px, 9vh, 110px) clamp(20px, 6vw, 96px);
          background: rgba(255,255,255,0.35);
          border-top: 1px solid rgba(26,24,21,0.07);
        }
        .bp-specs-inner {
          max-width: 980px; margin: 0 auto;
          display: grid; grid-template-columns: 220px 1fr; gap: 56px;
        }
        @media (max-width: 768px) {
          .bp-specs-inner { grid-template-columns: 1fr; gap: 32px; }
        }
        .bp-specs-table { display: grid; row-gap: 18px; }
        .bp-spec-row {
          display: grid; grid-template-columns: 200px 1fr; gap: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(26,24,21,0.08);
        }
        @media (max-width: 768px) {
          .bp-spec-row { grid-template-columns: 1fr; gap: 6px; }
        }
        .bp-spec-label {
          font-family: 'Cinzel', serif; font-weight: 500; font-size: 10.5px;
          letter-spacing: 0.36em; color: rgba(26,24,21,0.55); text-transform: uppercase;
        }
        .bp-spec-value {
          font-family: 'Cormorant Garamond', serif; font-weight: 300;
          font-size: clamp(14px, 1.05vw, 17px);
          color: rgba(26,24,21,0.85); line-height: 1.55;
        }

        /* ═════ DETAIL ARCHIVE GALLERY ═══════════════════════ */
        .bp-archive {
          position: relative; z-index: 3;
          background: #050505;
          padding: clamp(80px, 12vh, 140px) clamp(20px, 6vw, 96px);
          color: rgba(230,207,168,0.85);
        }
        .bp-archive-eyebrow {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase;
          color: rgba(214,178,116,0.55);
          padding-top: 22px; position: relative; display: inline-block;
          margin: 0 0 36px 0;
        }
        .bp-archive-eyebrow::before {
          content: ""; position: absolute; top: 0; left: 0;
          width: 32px; height: 1px; background: rgba(214,178,116,0.4);
        }
        .bp-archive-intro {
          max-width: 540px; margin: 0 0 48px 0;
          font-family: 'Cormorant Garamond', serif; font-weight: 300;
          font-style: italic; font-size: clamp(15px, 1.15vw, 18px);
          color: rgba(230,207,168,0.6); line-height: 1.7;
        }
        .bp-archive-grid {
          display: grid; gap: 18px;
          grid-template-columns: repeat(3, 1fr);
          max-width: 1300px; margin: 0 auto;
        }
        @media (max-width: 1024px) { .bp-archive-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 540px)  { .bp-archive-grid { grid-template-columns: 1fr; } }

        .bp-archive-cell {
          aspect-ratio: 1/1;
          background: #050505;
          border: 1px solid rgba(214,178,116,0.08);
          padding: 0; cursor: zoom-in;
          overflow: hidden; position: relative;
          transition: border-color 360ms cubic-bezier(0.22,1,0.36,1);
        }
        .bp-archive-cell:hover { border-color: rgba(214,178,116,0.4); }
        .bp-archive-cell img,
        .bp-archive-cell video {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          display: block;
          transition: transform 600ms cubic-bezier(0.22,1,0.36,1),
                      opacity 360ms ease;
          opacity: 0.92;
        }
        .bp-archive-cell:hover img,
        .bp-archive-cell:hover video { transform: scale(1.02); opacity: 1; }
        .bp-archive-cell-label {
          position: absolute; left: 12px; bottom: 10px;
          font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 0.32em;
          color: rgba(214,178,116,0.6); text-transform: uppercase;
          pointer-events: none;
          mix-blend-mode: difference;
        }

        /* ═════ BOTTOM TAGLINE ═══════════════════════════════ */
        .bp-tagline {
          position: relative; z-index: 3;
          padding: 60px 32px 80px;
          text-align: center;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(26,24,21,0.04) 100%);
        }
        .bp-tagline-text {
          font-family: 'Cinzel', serif; font-weight: 500;
          font-size: clamp(1.4rem, 2.4vw, 2rem);
          letter-spacing: -0.01em;
          color: #1A1815; margin: 0;
        }
        .bp-tagline-text em {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-weight: 300; color: rgba(26,24,21,0.65);
        }

        @media (prefers-reduced-motion: reduce) {
          .bp-room, .bp-particles, .bp-ring {
            animation: none !important; transition: none !important;
            opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      <div className="bp-particles" aria-hidden="true" />
      <div className="bp-glow" aria-hidden="true" />

      <Link to="/" className="bp-back" data-testid="bape-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      <header className="bp-header" data-testid="bape-header">
        <p className="bp-header-eyebrow">PHILEON · TRIBUTE SERIES</p>
        <h1 className="bp-header-title" data-testid="bape-collection">TRIBUTE SERIES</h1>
      </header>

      <section className="bp-stage" data-testid="bape-stage">

        <div className="bp-ring-wrap">
          <img
            src="/homage/bape-ring.webp"
            alt="BAPE — multi-stone signet ring under spotlights with reflection"
            className="bp-ring"
            loading="eager"
            decoding="async"
            data-testid="bape-hero-img"
          />
        </div>

        <h2 className="bp-title" data-testid="bape-title">
          BAPE<sup>™</sup>
        </h2>
        <p className="bp-sub">For the ones who were really there.</p>
      </section>

      {/* ─── TRIBUTE ARCHIVE ─────────────────────────────────── */}
      <section className="bp-archive" data-testid="bape-archive">
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <p className="bp-archive-eyebrow">TRIBUTE ARCHIVE</p>
          <p className="bp-archive-intro">
            Ten images. One era. One in motion. For the ones who were really there.
            <br /><br />
            Click any image to view the full archive.
          </p>
        </div>
        <div className="bp-archive-grid" data-testid="bape-archive-grid">
          {GALLERY.map((g, i) => (
            <button
              key={g.src}
              type="button"
              className="bp-archive-cell"
              aria-label={g.label}
              onClick={() => setLightboxIdx(i)}
              data-testid={`bape-archive-cell-${i + 1}`}
            >
              {g.type === "video" ? (
                <video
                  src={g.src}
                  poster={g.poster}
                  autoPlay muted loop playsInline preload="auto"
                  aria-label={g.alt}
                />
              ) : (
                <img src={g.src} alt={g.alt} loading="eager" decoding="async" />
              )}
              <span className="bp-archive-cell-label">{g.label.split("—")[0].trim()}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── RECOGNITION ─────────────────────────────────────── */}
      <section className="bp-recognition-section" data-testid="bape-recognition-section">
        <p className="bp-recognition" data-testid="bape-recognition">Recognition.</p>
      </section>

      {/* ─── VARIANT SELECTOR + ADD TO CART ───────────────── */}
      <section className="bp-variants" data-testid="bape-variants">
        <div className="bp-variants-inner">
          <p className="bp-variants-eyebrow">SELECT METAL</p>

          <div className="bp-variants-grid" role="radiogroup" aria-label="Select metal">
            {VARIANTS.map((v) => {
              const isSelected = v.id === selectedVariantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`bp-variant${isSelected ? " is-selected" : ""}`}
                  data-testid={`bape-variant-${v.id}`}
                >
                  {v.badge && <span className="bp-variant-badge">{v.badge}</span>}
                  <p className="bp-variant-sublabel">{v.sublabel}</p>
                  <h3 className="bp-variant-metal">{v.metal}</h3>
                  <p className="bp-variant-price">${v.priceUsd.toLocaleString("en-US")} USD</p>
                  <p className="bp-variant-weight">{v.weight}</p>
                  <p className="bp-variant-desc">{v.description}</p>
                </button>
              );
            })}
          </div>

          <div className="bape-size-block">
            <label htmlFor="bape-size-select" className="bape-size-label">
              RING SIZE
            </label>
            <select
              id="bape-size-select"
              value={selectedRingSize}
              onChange={(e) => setSelectedRingSize(e.target.value)}
              className="bape-size-select"
              data-testid="bape-ring-size-select"
            >
              <option value="6">US 6</option>
              <option value="6.5">US 6.5</option>
              <option value="7">US 7</option>
              <option value="7.5">US 7.5</option>
              <option value="8">US 8</option>
              <option value="8.5">US 8.5</option>
              <option value="9">US 9</option>
              <option value="9.5">US 9.5</option>
              <option value="10">US 10</option>
              <option value="10.5">US 10.5</option>
              <option value="11">US 11</option>
              <option value="11.5">US 11.5</option>
              <option value="12">US 12</option>
              <option value="custom">Custom Above 12</option>
            </select>
          </div>

          <div className="bp-cta">
            <p className="bp-cta-price" data-testid="bape-active-price">{priceText}</p>
            <p className="bp-cta-lead">Made to order · 4–6 weeks · Complimentary insured worldwide shipping</p>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isAdding}
              className="bp-cta-button"
              data-testid="bape-add-to-cart-btn"
            >
              {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
            </button>
          </div>
        </div>
      </section>

      {/* ─── SPECIFICATIONS ────────────────────────────────── */}
      <section className="bp-specs" data-testid="bape-specs">
        <div className="bp-specs-inner">
          <div>
            <p className="bp-variants-eyebrow">SPECIFICATIONS</p>
          </div>
          <div className="bp-specs-table">
            {SPECS.map((s) => (
              <div key={s.label} className="bp-spec-row" data-testid={`bape-spec-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <p className="bp-spec-label">{s.label}</p>
                <p className="bp-spec-value">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bp-tagline" data-testid="bape-tagline">
        <p className="bp-tagline-text">
          Not collaboration. <em>Recognition.</em>
        </p>
      </section>

      <Lightbox
        items={GALLERY}
        openIndex={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onChange={(i) => setLightboxIdx(i)}
        archiveLabel="BAPE · TRIBUTE SERIES"
      />
    </div>
  );
}
