import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import Lightbox from "../components/CinematicLightbox";
import { useLiveTierPrices } from "@/hooks/useLivePrice";
import RingSizeSelector, {
  DEFAULT_RING_SIZE,
  ringSizeLabel,
  ringSizeIdToken,
} from "../components/RingSizeSelector";

/**
 * LADY JAY — Tribute Series · 2026 Season Only
 *
 * PHILEON · Ladies · Rings · Tribute Series
 * Full wrap feather ring · white metal · blue sapphire + white diamond pavé.
 * Retired at season's end. No reissue.
 *
 * Namespace: .ladyjay-
 */

const TIERS = [
  {
    id: "foundation",
    sku: "LJ-SS",
    name: "Sterling Silver",
    subtitle: "Blue sapphire + diamond pavé",
    badge: "FOUNDATION",
    metal: "Sterling Silver",
    weight: "Approx. 10.5g",
    fallbackUsd: 4800,
  },
  {
    id: "signature",
    sku: "LJ-10W",
    name: "10K White Gold",
    subtitle: "Blue sapphire + diamond pavé",
    badge: "SIGNATURE",
    metal: "10K White Gold",
    weight: "Approx. 12.8g",
    fallbackUsd: 8500,
  },
  {
    id: "heirloom",
    sku: "LJ-14W",
    name: "14K White Gold",
    subtitle: "Blue sapphire + diamond pavé",
    badge: "HEIRLOOM",
    metal: "14K White Gold",
    weight: "Approx. 14.5g",
    fallbackUsd: 11000,
  },
  {
    id: "collector",
    sku: "LJ-18W",
    name: "18K White Gold",
    subtitle: "Blue sapphire + diamond pavé",
    badge: "COLLECTOR",
    metal: "18K White Gold",
    weight: "Approx. 17.2g",
    fallbackUsd: 14500,
  },
];

const RING_BAND_WIDTH_MM = 22; // LADY JAY — full feather wrap

const SPECS = [
  "Approx. 364 total stones",
  "Blue sapphires + white diamonds",
  "Approx. 45mm feather span",
  "Approx. 22mm width",
  "Approx. 2.5mm band thickness",
  "Open feather-wrap silhouette",
  "Mirror-polished white metal finish",
  "Hand-set pavé construction",
];

const MARQUEE_TEXT =
  "LADY JAY · TRIBUTE SERIES · 2026 SEASON ONLY · WHITE GOLD · BLUE SAPPHIRE · WHITE DIAMOND · NO REISSUE";

const GALLERY = [
  {
    src: "/lady-jay/lady-jay-12-toronto.png",
    label: "TORONTO",
    alt: "LADY JAY tribute portrait — the city, named",
  },
  {
    src: "/lady-jay/lady-jay-04-pave-detail.png",
    label: "PAVÉ DETAIL",
    alt: "LADY JAY blue sapphire and white diamond pavé, macro close-up",
  },
  {
    src: "/lady-jay/lady-jay-hero.png",
    label: "PORTRAIT",
    alt: "LADY JAY tribute series feather ring, full hand portrait",
  },
  {
    src: "/lady-jay/lady-jay-02-pair-macro.png",
    label: "PAIR · MACRO",
    alt: "LADY JAY twin-feather pavé set, macro detail on hand",
  },
  {
    src: "/lady-jay/lady-jay-05-on-body.png",
    label: "ON BODY",
    alt: "LADY JAY worn on the hand against the collarbone, soft daylight",
  },
  {
    src: "/lady-jay/lady-jay-10-provenance.png",
    label: "PROVENANCE",
    alt: "LADY JAY on navy velvet beside a worn baseball and a Phileon Tribute Series brass plate",
  },
  {
    src: "/lady-jay/lady-jay-11-velvet.png",
    label: "VELVET",
    alt: "LADY JAY worn at rest, model seated in a deep teal velvet chair in navy satin",
  },
  {
    src: "/lady-jay/lady-jay-08-tapestry.png",
    label: "TAPESTRY",
    alt: "LADY JAY worn over navy satin, heraldic tapestry backdrop",
  },
  {
    src: "/lady-jay/lady-jay-09-campaign-portrait.png",
    label: "CAMPAIGN · PORTRAIT",
    alt: "LADY JAY Phileon tribute campaign portrait, hand at the cheek",
  },
];

const RETIRE_DATE = new Date("2026-10-31T23:59:59-04:00"); // End of 2026 MLB season

function daysUntilRetire() {
  const now = new Date();
  const ms = RETIRE_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function LadyJayPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const [isMounted, setIsMounted] = useState(false);
  const [daysLeft, setDaysLeft] = useState(() => daysUntilRetire());
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [selectedTier, setSelectedTier] = useState("collector");
  const [selectedSize, setSelectedSize] = useState(DEFAULT_RING_SIZE);

  const tierPricesLive = useLiveTierPrices("ladyJay");
  const currentTier = TIERS.find((t) => t.id === selectedTier) || TIERS[3];
  const livePriceForTier = tierPricesLive[selectedTier]?.price;
  const displayPrice = livePriceForTier || currentTier.fallbackUsd;
  const formattedPrice = `$${displayPrice.toLocaleString("en-US")} USD`;

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  // Refresh countdown daily — no ticking, just a quiet recompute.
  useEffect(() => {
    const id = window.setInterval(() => setDaysLeft(daysUntilRetire()), 1000 * 60 * 60);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".ladyjay-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.18 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const onAddToCart = () => {
    const sizeIdToken = ringSizeIdToken(selectedSize);
    const sizeLabelText = ringSizeLabel(selectedSize);
    handleAddToCart({
      id: `lady-jay-${selectedTier}-size-${sizeIdToken}`,
      name: `LADY JAY — ${currentTier.name} · ${sizeLabelText}`,
      price: displayPrice,
      productKey: "ladyJay",
      tierKey: selectedTier,
      metal: `${currentTier.metal} · Blue Sapphire + White Diamond Pavé`,
      ringSize: selectedSize,
      ringSizeLabel: sizeLabelText,
      sku: `${currentTier.sku}-SZ${selectedSize === "custom" ? "CUSTOM" : selectedSize.replace(".", "_")}`,
      quantity: 1,
      image: "/lady-jay/lady-jay-hero.png",
    });
  };

  return (
    <section
      className={`ladyjay-room${isMounted ? " ladyjay-loaded" : ""}`}
      data-page="lady-jay"
      data-testid="lady-jay-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .ladyjay-room {
          position: relative;
          background: #060a14;
          color: #e4eaf2;
          overflow: hidden;
          opacity: 0;
          transition: opacity 900ms ease;
        }
        .ladyjay-room.ladyjay-loaded { opacity: 1; }
        .ladyjay-reveal { opacity: 0; transform: translateY(18px); transition: opacity 1100ms ease, transform 1100ms ease; }
        .ladyjay-reveal.visible { opacity: 1; transform: translateY(0); }

        .ladyjay-back {
          position: absolute; top: 28px; left: 28px; z-index: 30;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 11px;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(228, 234, 242, 0.65);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .ladyjay-back:hover { color: rgba(228, 234, 242, 0.95); }

        /* ─── MARQUEE ───────────────────────────────────────── */
        .ladyjay-marquee {
          position: relative;
          width: 100%;
          padding: 14px 0;
          background: rgba(15, 28, 56, 0.5);
          border-bottom: 1px solid rgba(99, 144, 220, 0.18);
          overflow: hidden;
        }
        .ladyjay-marquee-track {
          display: inline-flex;
          gap: 64px;
          white-space: nowrap;
          animation: ladyjayMarquee 32s linear infinite;
        }
        .ladyjay-marquee-track span {
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(180, 205, 240, 0.88);
        }
        @keyframes ladyjayMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ─── HERO ──────────────────────────────────────────── */
        .ladyjay-hero {
          position: relative;
          width: 100%;
          min-height: 92vh;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 60px;
          padding: 100px 56px 100px;
          background:
            radial-gradient(circle at 30% 40%, rgba(35, 60, 120, 0.32), transparent 55%),
            radial-gradient(circle at 80% 80%, rgba(15, 28, 56, 0.45), transparent 60%),
            #060a14;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .ladyjay-hero { grid-template-columns: 1fr; gap: 36px; padding: 70px 22px 60px; min-height: auto; }
        }
        .ladyjay-hero-img-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ladyjay-hero-img {
          max-width: 540px;
          width: 100%;
          height: auto;
          filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 40px rgba(60, 100, 180, 0.25));
        }
        .ladyjay-hero-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 20px 0;
        }
        .ladyjay-meta {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0 0 26px;
        }
        .ladyjay-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(3.4rem, 7vw, 5.6rem);
          line-height: 0.95;
          letter-spacing: 0.05em;
          color: #f0f4fb;
          margin: 0 0 22px;
        }
        .ladyjay-collection {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(180, 205, 240, 0.7);
          margin: 0 0 32px;
        }
        .ladyjay-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.2rem, 1.7vw, 1.55rem);
          line-height: 1.5;
          color: rgba(228, 234, 242, 0.92);
          margin: 0 0 36px;
          max-width: 520px;
        }
        .ladyjay-season {
          background: rgba(20, 38, 78, 0.5);
          border-left: 2px solid rgba(99, 144, 220, 0.7);
          padding: 18px 22px;
          margin: 0 0 38px;
          max-width: 480px;
        }
        .ladyjay-season p {
          margin: 0;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.98rem;
          line-height: 1.55;
          color: rgba(228, 234, 242, 0.85);
        }
        .ladyjay-season p + p { margin-top: 6px; color: rgba(180, 205, 240, 0.65); }
        .ladyjay-hero-cta {
          display: flex; flex-direction: column;
          align-items: flex-start; gap: 14px;
        }
        .ladyjay-price {
          font-family: 'Cinzel', serif;
          font-size: clamp(1.05rem, 1.4vw, 1.3rem);
          letter-spacing: 0.32em;
          color: #f0f4fb;
        }
        .ladyjay-btn {
          padding: 18px 56px;
          background: rgba(60, 100, 180, 0.92);
          color: #f0f4fb;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, letter-spacing 320ms ease;
        }
        .ladyjay-btn:hover { background: rgba(80, 130, 215, 1); letter-spacing: 0.48em; }
        .ladyjay-btn:disabled { opacity: 0.55; cursor: default; }
        .ladyjay-micro {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 0.92rem;
          color: rgba(180, 205, 240, 0.6);
          margin-top: 6px;
          max-width: 460px;
          line-height: 1.5;
        }

        /* ─── SPEC TABLE ───────────────────────────────────── */
        .ladyjay-spec {
          position: relative;
          padding: 110px 24px 110px;
          background: #07101f;
        }
        .ladyjay-spec-inner {
          max-width: 980px;
          margin: 0 auto;
        }
        .ladyjay-spec-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0 0 38px;
          text-align: center;
        }
        .ladyjay-spec-row {
          display: grid;
          grid-template-columns: 220px 1fr;
          padding: 22px 0;
          border-bottom: 1px solid rgba(99, 144, 220, 0.12);
          gap: 24px;
        }
        @media (max-width: 700px) {
          .ladyjay-spec-row { grid-template-columns: 1fr; gap: 6px; padding: 16px 0; }
        }
        .ladyjay-spec-k {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.65);
        }
        .ladyjay-spec-v {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1rem, 1.18vw, 1.2rem);
          color: rgba(228, 234, 242, 0.92);
          line-height: 1.55;
        }

        /* ─── FINAL WORD ──────────────────────────────────── */
        .ladyjay-final {
          position: relative;
          padding: 160px 24px 200px;
          background: linear-gradient(180deg, #060a14 0%, #04070d 100%);
          text-align: center;
          overflow: hidden;
        }
        .ladyjay-final::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 30%, rgba(40, 70, 140, 0.22), transparent 55%);
          pointer-events: none;
        }
        .ladyjay-final-eyebrow {
          position: relative;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0 0 32px;
        }
        .ladyjay-final-text {
          position: relative;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(1.5rem, 2.6vw, 2.4rem);
          line-height: 1.4;
          color: #f0f4fb;
          margin: 0 auto;
          max-width: 640px;
        }
        .ladyjay-final-text + .ladyjay-final-text { margin-top: 36px; }
        .ladyjay-final-attestation {
          font-style: normal;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: clamp(1.05rem, 1.5vw, 1.35rem);
          letter-spacing: 0.18em;
          color: rgba(180, 205, 240, 0.92);
        }
        .ladyjay-final-cadence {
          font-size: clamp(1.3rem, 2.1vw, 1.95rem);
          line-height: 1.55;
          color: rgba(228, 234, 242, 0.88);
        }
        .ladyjay-final-rule {
          position: relative;
          width: 0;
          height: 1px;
          margin: 44px auto 0;
          background: linear-gradient(90deg, rgba(99,144,220,0) 0%, rgba(150,190,240,0.85) 50%, rgba(99,144,220,0) 100%);
          animation: ladyjayFinalRule 3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.45s;
        }
        @keyframes ladyjayFinalRule {
          from { width: 0; opacity: 0; }
          to   { width: 200px; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ladyjay-marquee-track { animation: none !important; }
          .ladyjay-final-rule { animation: none !important; width: 200px; opacity: 1; }
        }

        /* ─── COUNTDOWN ─────────────────────────────────── */
        .ladyjay-countdown {
          display: flex;
          align-items: baseline;
          gap: 18px;
          margin: 0 0 32px;
          padding: 16px 22px 18px;
          max-width: 480px;
          border-top: 1px solid rgba(99, 144, 220, 0.18);
          border-bottom: 1px solid rgba(99, 144, 220, 0.18);
        }
        .ladyjay-countdown-num {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: clamp(1.7rem, 2.5vw, 2.3rem);
          letter-spacing: 0.04em;
          color: #e6eef9;
          line-height: 1;
          min-width: 56px;
        }
        .ladyjay-countdown-label {
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(150, 185, 230, 0.82);
          line-height: 1.4;
        }
        .ladyjay-countdown-label em {
          display: block;
          margin-top: 6px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 1rem;
          letter-spacing: 0.01em;
          text-transform: none;
          color: rgba(180, 205, 240, 0.65);
        }
        .ladyjay-countdown-closed {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 1rem;
          letter-spacing: 0.01em;
          text-transform: none;
          color: rgba(180, 205, 240, 0.7);
          line-height: 1.5;
        }

        /* ─── ARCHIVE ───────────────────────────────────── */
        .ladyjay-archive {
          position: relative;
          padding: 120px 24px 130px;
          background:
            radial-gradient(circle at 50% 0%, rgba(40, 70, 140, 0.18), transparent 55%),
            #060a14;
          border-top: 1px solid rgba(99, 144, 220, 0.08);
        }
        .ladyjay-archive-head {
          max-width: 1200px;
          margin: 0 auto 52px;
          text-align: center;
        }
        .ladyjay-archive-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0 0 18px;
        }
        .ladyjay-archive-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.4rem, 2vw, 2rem);
          color: rgba(228, 234, 242, 0.92);
          margin: 0;
        }
        .ladyjay-archive-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 900px) { .ladyjay-archive-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .ladyjay-archive-grid { grid-template-columns: 1fr; } }
        /* When a single cell is left dangling at the end of a 3-col row,
           center it in the middle column. Editorial closing frame. */
        @media (min-width: 901px) {
          .ladyjay-archive-cell:last-child:nth-child(3n+1) {
            grid-column: 2 / 3;
          }
          /* When two cells trail in the last row of a 3-col grid,
             nudge the pair right by half a column so they read centered. */
          .ladyjay-archive-cell:nth-last-child(2):nth-child(3n+1),
          .ladyjay-archive-cell:last-child:nth-child(3n+2) {
            transform: translateX(calc(50% + 9px));
          }
          .ladyjay-archive-cell:nth-last-child(2):nth-child(3n+1):hover,
          .ladyjay-archive-cell:last-child:nth-child(3n+2):hover {
            transform: translateX(calc(50% + 9px)) translateY(-3px);
          }
        }
        .ladyjay-archive-cell {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          background: #0a121f;
          border: 1px solid rgba(99, 144, 220, 0.14);
          cursor: pointer;
          padding: 0;
          transition: border-color 480ms ease, transform 480ms ease;
        }
        .ladyjay-archive-cell:hover {
          border-color: rgba(99, 144, 220, 0.45);
          transform: translateY(-3px);
        }
        .ladyjay-archive-cell img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 1200ms ease, filter 1200ms ease;
          filter: brightness(0.96) saturate(0.98);
        }
        .ladyjay-archive-cell:hover img { transform: scale(1.04); filter: brightness(1) saturate(1.05); }
        .ladyjay-archive-cell-label {
          position: absolute; bottom: 14px; left: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 9px; letter-spacing: 0.38em;
          color: rgba(228, 234, 242, 0.78);
          text-transform: uppercase;
          background: rgba(0, 0, 0, 0.45);
          padding: 6px 10px;
          backdrop-filter: blur(6px);
        }

        /* ─── HERO PRICE / CTA (refined) ───────────────────── */
        .ladyjay-price-usd {
          font-family: 'Inter', sans-serif;
          font-size: 0.55em;
          letter-spacing: 0.4em;
          color: rgba(180, 205, 240, 0.7);
          margin-left: 6px;
        }

        /* ─── CONFIGURATOR ─────────────────────────────────── */
        .ladyjay-config {
          position: relative;
          padding: 120px 28px 140px;
          background:
            radial-gradient(circle at 50% 0%, rgba(40, 70, 140, 0.18), transparent 55%),
            #060a14;
          border-top: 1px solid rgba(99, 144, 220, 0.10);
        }
        .ladyjay-config-inner {
          max-width: 1040px;
          margin: 0 auto;
        }
        .ladyjay-config-head { text-align: center; margin-bottom: 64px; }
        .ladyjay-config-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0 0 18px;
        }
        .ladyjay-config-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(2rem, 3.4vw, 3rem);
          letter-spacing: 0.04em;
          color: #f0f4fb;
          margin: 0 0 18px;
        }
        .ladyjay-config-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.4vw, 1.25rem);
          line-height: 1.5;
          color: rgba(228, 234, 242, 0.82);
          margin: 0 auto 22px;
          max-width: 560px;
        }
        .ladyjay-config-trust {
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(150, 185, 230, 0.7);
          margin: 0;
        }

        /* ─── METAL TIERS ──────────────────────────────────── */
        .ladyjay-tiers {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 0 0 64px;
        }
        @media (max-width: 980px) { .ladyjay-tiers { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .ladyjay-tiers { grid-template-columns: 1fr; } }
        .ladyjay-tier {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 26px 22px 24px;
          background: rgba(15, 28, 56, 0.32);
          border: 1px solid rgba(99, 144, 220, 0.18);
          color: inherit;
          cursor: pointer;
          transition: border-color 420ms ease, background 420ms ease, transform 420ms ease;
        }
        .ladyjay-tier:hover {
          border-color: rgba(99, 144, 220, 0.45);
          background: rgba(20, 38, 78, 0.45);
        }
        .ladyjay-tier.is-selected {
          border-color: rgba(150, 190, 240, 0.85);
          background: rgba(25, 48, 96, 0.55);
        }
        .ladyjay-tier.is-selected::before {
          content: ""; position: absolute; inset: -1px;
          border: 1px solid rgba(150, 190, 240, 0.4);
          pointer-events: none;
        }
        .ladyjay-tier-badge {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(150, 190, 240, 0.85);
          margin-bottom: 16px;
        }
        .ladyjay-tier-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1.05rem;
          letter-spacing: 0.06em;
          color: #f0f4fb;
          margin-bottom: 6px;
        }
        .ladyjay-tier-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.92rem;
          color: rgba(228, 234, 242, 0.72);
          margin-bottom: 14px;
          line-height: 1.4;
        }
        .ladyjay-tier-meta {
          font-family: 'Inter', sans-serif;
          font-size: 9.5px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.6);
          margin-bottom: 16px;
        }
        .ladyjay-tier-price {
          margin-top: auto;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1.1rem;
          letter-spacing: 0.06em;
          color: #f0f4fb;
        }

        /* ─── SIZE SELECTOR ────────────────────────────────── */
        .ladyjay-size-block { margin: 0 0 56px; }
        .ladyjay-size-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ladyjay-size-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0;
        }
        .ladyjay-size-hint {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.95rem;
          color: rgba(180, 205, 240, 0.7);
          margin: 0;
        }
        .ladyjay-sizes {
          display: grid;
          grid-template-columns: repeat(13, 1fr);
          gap: 8px;
        }
        @media (max-width: 900px) { .ladyjay-sizes { grid-template-columns: repeat(7, 1fr); } }
        @media (max-width: 520px) { .ladyjay-sizes { grid-template-columns: repeat(5, 1fr); } }
        .ladyjay-size {
          font-family: 'Cinzel', serif;
          font-size: 0.9rem;
          letter-spacing: 0.06em;
          padding: 12px 0;
          background: rgba(15, 28, 56, 0.32);
          border: 1px solid rgba(99, 144, 220, 0.18);
          color: rgba(228, 234, 242, 0.85);
          cursor: pointer;
          transition: border-color 280ms ease, background 280ms ease, color 280ms ease;
        }
        .ladyjay-size:hover { border-color: rgba(99, 144, 220, 0.5); color: #f0f4fb; }
        .ladyjay-size.is-selected {
          border-color: rgba(150, 190, 240, 0.85);
          background: rgba(25, 48, 96, 0.55);
          color: #f0f4fb;
        }

        /* ─── SUMMARY ──────────────────────────────────────── */
        .ladyjay-summary {
          margin: 0 0 32px;
          padding: 26px 28px 22px;
          background: rgba(10, 18, 35, 0.55);
          border-top: 1px solid rgba(99, 144, 220, 0.18);
          border-bottom: 1px solid rgba(99, 144, 220, 0.18);
        }
        .ladyjay-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          padding: 10px 0;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(180, 205, 240, 0.78);
        }
        .ladyjay-summary-row + .ladyjay-summary-row { border-top: 1px solid rgba(99, 144, 220, 0.10); }
        .ladyjay-summary-label { flex: 0 0 auto; color: rgba(140, 175, 220, 0.7); }
        .ladyjay-summary-value {
          flex: 1 1 auto;
          text-align: right;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 1rem;
          letter-spacing: 0.01em;
          text-transform: none;
          color: rgba(228, 234, 242, 0.92);
        }
        .ladyjay-summary-sku { font-family: 'Inter', sans-serif; font-style: normal; font-size: 11px; letter-spacing: 0.28em; }
        .ladyjay-summary-row--price { padding-top: 16px; padding-bottom: 4px; }
        .ladyjay-summary-price {
          font-family: 'Cinzel', serif;
          font-size: clamp(1.4rem, 2vw, 1.7rem);
          letter-spacing: 0.06em;
          color: #f0f4fb;
        }
        .ladyjay-market-note {
          margin: 14px 0 0;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.9rem;
          color: rgba(150, 185, 230, 0.65);
          text-align: right;
        }

        /* ─── ACTIONS ──────────────────────────────────────── */
        .ladyjay-actions {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 14px;
          margin: 0 0 72px;
        }
        @media (max-width: 700px) { .ladyjay-actions { grid-template-columns: 1fr; } }
        .ladyjay-cta-primary,
        .ladyjay-cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 20px 32px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 320ms ease, letter-spacing 320ms ease, color 320ms ease, border-color 320ms ease;
        }
        .ladyjay-cta-primary {
          background: rgba(60, 100, 180, 0.92);
          color: #f0f4fb;
        }
        .ladyjay-cta-primary:hover { background: rgba(80, 130, 215, 1); letter-spacing: 0.48em; }
        .ladyjay-cta-primary:disabled { opacity: 0.55; cursor: default; }
        .ladyjay-cta-secondary {
          background: transparent;
          color: rgba(228, 234, 242, 0.85);
          border: 1px solid rgba(150, 190, 240, 0.45);
        }
        .ladyjay-cta-secondary:hover {
          color: #f0f4fb;
          border-color: rgba(180, 205, 240, 0.85);
          letter-spacing: 0.48em;
        }

        /* ─── SPECS ────────────────────────────────────────── */
        .ladyjay-specs {
          margin: 0 0 72px;
          padding: 36px 0 0;
          border-top: 1px solid rgba(99, 144, 220, 0.10);
        }
        .ladyjay-specs-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0 0 24px;
        }
        .ladyjay-specs-list {
          list-style: none; padding: 0; margin: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px 32px;
        }
        @media (max-width: 700px) { .ladyjay-specs-list { grid-template-columns: 1fr; } }
        .ladyjay-specs-item {
          display: flex;
          align-items: baseline;
          gap: 12px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(0.95rem, 1.1vw, 1.08rem);
          color: rgba(228, 234, 242, 0.88);
          line-height: 1.5;
        }
        .ladyjay-specs-dot {
          flex: 0 0 5px;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(99, 144, 220, 0.7);
          transform: translateY(-2px);
        }

        /* ─── EDITORIAL NOTE ───────────────────────────────── */
        .ladyjay-note {
          padding: 40px 0 0;
          border-top: 1px solid rgba(99, 144, 220, 0.10);
        }
        .ladyjay-note-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(140, 175, 220, 0.78);
          margin: 0 0 22px;
        }
        .ladyjay-note-text {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.3vw, 1.25rem);
          line-height: 1.65;
          color: rgba(228, 234, 242, 0.92);
          margin: 0 0 14px;
          max-width: 720px;
        }
        .ladyjay-note-text--mute {
          color: rgba(180, 205, 240, 0.55);
          font-size: 0.95rem;
          margin-top: 22px;
        }

        @media (max-width: 700px) {
          .ladyjay-config { padding: 80px 22px 100px; }
          .ladyjay-config-head { margin-bottom: 44px; }
          .ladyjay-summary { padding: 22px 20px 18px; }
          .ladyjay-summary-row { font-size: 10px; }
        }
      `}</style>

      <Link to="/shop?category=rings&audience=ladies" className="ladyjay-back" data-testid="lady-jay-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── MARQUEE ──────────────────────────────────────── */}
      <div className="ladyjay-marquee" data-testid="lady-jay-marquee">
        <div className="ladyjay-marquee-track">
          {[0, 1, 2, 3].map((i) => (
            <span key={i}>{MARQUEE_TEXT}</span>
          ))}
        </div>
      </div>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="ladyjay-hero" data-testid="lady-jay-hero">
        <div className="ladyjay-hero-img-wrap">
          <img
            className="ladyjay-hero-img"
            src="/lady-jay/lady-jay-hero.png"
            alt="LADY JAY — Tribute Series feather ring in 18K white gold, blue sapphire and white diamond pavé, worn on hand"
            data-testid="lady-jay-hero-img"
          />
        </div>
        <div className="ladyjay-hero-text">
          <p className="ladyjay-meta" data-testid="lady-jay-meta">
            TRIBUTE SERIES — 2026 SEASON ONLY
          </p>
          <h1 className="ladyjay-title" data-testid="lady-jay-title">LADY JAY</h1>
          <p className="ladyjay-collection">PHILEON · LADIES · TRIBUTE SERIES</p>
          <p className="ladyjay-tagline" data-testid="lady-jay-tagline">
            The Blue Jay doesn't ask permission to be the most beautiful thing in the room.
          </p>

          <div className="ladyjay-season" data-testid="lady-jay-season">
            <p>Available for the 2026 season only.</p>
            <p>Retired at season's end. No reissue.</p>
          </div>

          <div className="ladyjay-countdown" data-testid="lady-jay-countdown">
            {daysLeft > 0 ? (
              <>
                <span className="ladyjay-countdown-num" data-testid="lady-jay-countdown-days">
                  {daysLeft}
                </span>
                <span className="ladyjay-countdown-label">
                  {daysLeft === 1 ? "Day remaining" : "Days remaining"}
                  <em>Closes October 31, 2026.</em>
                </span>
              </>
            ) : (
              <span className="ladyjay-countdown-closed" data-testid="lady-jay-countdown-closed">
                The 2026 season has closed. Lady Jay is retired.
              </span>
            )}
          </div>

          <div className="ladyjay-hero-cta">
            <p className="ladyjay-price" data-testid="lady-jay-price">
              From {formattedPrice.replace(/\s?USD$/, "")}<span className="ladyjay-price-usd"> USD</span>
            </p>
            <a href="#lady-jay-configurator" className="ladyjay-btn" data-testid="lady-jay-view-compositions-btn">
              VIEW COMPOSITIONS
            </a>
            <p className="ladyjay-micro">
              Available for the 2026 season only. When the season ends, Lady Jay retires.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CONFIGURATOR ─────────────────────────────────── */}
      <section
        id="lady-jay-configurator"
        className="ladyjay-config ladyjay-reveal"
        data-testid="lady-jay-configurator"
      >
        <div className="ladyjay-config-inner">
          <header className="ladyjay-config-head">
            <p className="ladyjay-config-eyebrow">THE COMPOSITION</p>
            <h2 className="ladyjay-config-title">Select your composition</h2>
            <p className="ladyjay-config-sub">
              A tribute in sapphire and diamond pavé.
              <br />
              Crafted to order in your chosen metal and size.
            </p>
            <p className="ladyjay-config-trust" data-testid="lady-jay-trust">
              Made to order · 4–6 weeks · Complimentary insured shipping
            </p>
          </header>

          {/* Metal selector */}
          <div className="ladyjay-tiers" role="radiogroup" aria-label="Metal selection" data-testid="lady-jay-tiers">
            {TIERS.map((tier) => {
              const live = tierPricesLive[tier.id]?.formatted;
              const display = live || `$${tier.fallbackUsd.toLocaleString("en-US")}`;
              const isSel = selectedTier === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`ladyjay-tier ${isSel ? "is-selected" : ""}`}
                  data-testid={`lady-jay-tier-${tier.id}`}
                >
                  <span className="ladyjay-tier-badge">{tier.badge}</span>
                  <span className="ladyjay-tier-name">{tier.name}</span>
                  <span className="ladyjay-tier-sub">{tier.subtitle}</span>
                  <span className="ladyjay-tier-meta">{tier.weight}</span>
                  <span className="ladyjay-tier-price">{display}</span>
                </button>
              );
            })}
          </div>

          {/* Size selector — sitewide reusable component */}
          <div className="ladyjay-size-block">
            <RingSizeSelector
              value={selectedSize}
              onChange={setSelectedSize}
              bandWidthMm={RING_BAND_WIDTH_MM}
              testIdPrefix="lady-jay-ringsize"
              style={{
                "--ring-accent": "#7fa8e6",
                "--ring-bg": "rgba(10, 18, 35, 0.65)",
                "--ring-fg": "#f0f4fb",
                "--ring-muted": "rgba(180, 205, 240, 0.6)",
              }}
            />
          </div>

          {/* Live price summary */}
          <div className="ladyjay-summary" data-testid="lady-jay-summary">
            <div className="ladyjay-summary-row">
              <span className="ladyjay-summary-label">Selection</span>
              <span className="ladyjay-summary-value">
                {currentTier.name} · {ringSizeLabel(selectedSize)}
              </span>
            </div>
            <div className="ladyjay-summary-row">
              <span className="ladyjay-summary-label">SKU</span>
              <span className="ladyjay-summary-value ladyjay-summary-sku">
                {currentTier.sku}-SZ{selectedSize === "custom" ? "CUSTOM" : selectedSize.replace(".", "_")}
              </span>
            </div>
            <div className="ladyjay-summary-row ladyjay-summary-row--price">
              <span className="ladyjay-summary-label">Today's price</span>
              <span className="ladyjay-summary-price" data-testid="lady-jay-summary-price">
                {formattedPrice}
              </span>
            </div>
            <p className="ladyjay-market-note" data-testid="lady-jay-market-note">
              Price adjusts automatically with the live precious metals market.
            </p>
          </div>

          {/* Buttons */}
          <div className="ladyjay-actions">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isAdding}
              className="ladyjay-cta-primary"
              data-testid="lady-jay-commission-btn"
            >
              {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "COMMISSION PIECE"}
            </button>
            <Link
              to="/consult/lady-jay"
              className="ladyjay-cta-secondary"
              data-testid="lady-jay-consult-btn"
            >
              BOOK PRIVATE CONSULTATION
            </Link>
          </div>

          {/* Specs */}
          <div className="ladyjay-specs" data-testid="lady-jay-specs">
            <p className="ladyjay-specs-eyebrow">PIECE DETAILS</p>
            <ul className="ladyjay-specs-list">
              {SPECS.map((s) => (
                <li key={s} className="ladyjay-specs-item">
                  <span className="ladyjay-specs-dot" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial note */}
          <div className="ladyjay-note" data-testid="lady-jay-editorial-note">
            <p className="ladyjay-note-eyebrow">EDITORIAL NOTE</p>
            <p className="ladyjay-note-text">
              LADY JAY carries the rhythm of a city, a season, and a devotion to blue.
            </p>
            <p className="ladyjay-note-text">
              Twin pavé feathers unfold across the hand while a wrapped sapphire quill coils
              between them — suspended somewhere between high jewelry and personal ritual.
            </p>
            <p className="ladyjay-note-text ladyjay-note-text--mute">
              Created as part of the Phileon Tribute Series.
            </p>
          </div>
        </div>
      </section>

      {/* ─── ARCHIVE GALLERY ─────────────────────────────── */}
      <section className="ladyjay-archive ladyjay-reveal" data-testid="lady-jay-archive">
        <div className="ladyjay-archive-head">
          <p className="ladyjay-archive-eyebrow">THE ARCHIVE</p>
          <p className="ladyjay-archive-title">
            Nine frames. One tribute.
          </p>
        </div>
        <div className="ladyjay-archive-grid" data-testid="lady-jay-archive-grid">
          {GALLERY.map((g, i) => (
            <button
              key={g.src}
              type="button"
              className="ladyjay-archive-cell"
              aria-label={`Open ${g.label}`}
              onClick={() => setLightboxIdx(i)}
              data-testid={`lady-jay-archive-cell-${i + 1}`}
            >
              <img
                src={g.src}
                alt={g.alt}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <span className="ladyjay-archive-cell-label">
                {String(i + 1).padStart(2, "0")} · {g.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <Lightbox
        items={GALLERY}
        openIndex={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onChange={(i) => setLightboxIdx(i)}
        archiveLabel="LADY JAY · ARCHIVE"
      />

      {/* ─── FINAL WORD ──────────────────────────────────── */}
      <section className="ladyjay-final ladyjay-reveal" data-testid="lady-jay-final">
        <p className="ladyjay-final-eyebrow">FINAL WORD</p>
        <p className="ladyjay-final-text" data-testid="lady-jay-final-text">
          Some pieces celebrate a moment.<br />
          Others become part of the memory that survives it.
        </p>
        <p className="ladyjay-final-text ladyjay-final-attestation" data-testid="lady-jay-final-attestation">
          LADY JAY was created for the latter.
        </p>
        <p className="ladyjay-final-text ladyjay-final-cadence" data-testid="lady-jay-final-cadence">
          For the city.<br />
          For the cold nights.<br />
          For the ones who stayed.
        </p>
        <div className="ladyjay-final-rule" aria-hidden="true" />
      </section>
    </section>
  );
}
