import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import Lightbox from "../components/CinematicLightbox";

/**
 * LISA — Phileon Signature Object
 *
 * Natural emerald · 18K white gold · graduated dome band.
 * Two configurations under one architecture: SMALL (quiet saturation)
 * and BOLD (deep field). Restrained dark-luxury jewel page.
 *
 * Namespace: .lisa-  (no class bleed)
 */

const GALLERY_BASE = [
  { src: "/lisa/lisa-bold-hero.jpg",  label: "01 — HERO",         alt: "LISA — 18K white gold dome band, model in hand presentation" },
  { src: "/lisa/lisa-02-in-hand.png", label: "02 — PROOF",        alt: "LISA — held in hand, PHILEON 18K engraving visible inside the band" },
  { src: "/lisa/lisa-03-front.png",   label: "03 — FRONT",        alt: "LISA — front render of the graduated emerald dome on white studio ground" },
  { src: "/lisa/lisa-04-macro.png",   label: "04 — MACRO",        alt: "LISA — extreme macro of the emerald field showing crown, milgrain rails, and prong-set crystals" },
  { src: "/lisa/lisa-05-inside.png",  label: "05 — INSIDE TRACK", alt: "LISA — interior view showing the inset emerald track on the inside of the band" },
  { src: "/lisa/lisa-06-top.png",     label: "06 — TOP",          alt: "LISA — top-down angle showing the full sculptural dome and saturation" },
];

const CAMPAIGN_BY_VARIANT = {
  "lisa-small": {
    src: "/lisa/lisa-07-campaign-small.png",
    label: "08 — CAMPAIGN",
    alt: "LISA SMALL — campaign portrait, model in emerald fur hood, ring worn on hand veiling her face",
  },
  "lisa-bold": {
    src: "/lisa/lisa-07-campaign-bold.png",
    label: "07 — CAMPAIGN",
    alt: "LISA BOLD — campaign portrait, model in Sergio Tacchini green velour against art-deco backdrop, ring worn on hand at temple",
  },
};

// Variant-only frames inserted just before the closing CAMPAIGN slot.
const EXTRA_BY_VARIANT = {
  "lisa-small": [
    {
      src: "/lisa/lisa-08-on-body-small.png",
      label: "07 — WORN",
      alt: "LISA SMALL — worn on hand, model resting hand against neutral upholstery with green-ombré stiletto nails, stacked rings on the other hand",
    },
  ],
  "lisa-bold": [],
};

function buildGallery(variantId) {
  const id = CAMPAIGN_BY_VARIANT[variantId] ? variantId : "lisa-bold";
  const extras = EXTRA_BY_VARIANT[id] || [];
  return [...GALLERY_BASE, ...extras, CAMPAIGN_BY_VARIANT[id]];
}

const VARIANTS = [
  {
    id: "lisa-small",
    badge: "QUIET",
    label: "LISA SMALL",
    name: "QUIET SATURATION",
    description:
      "Smaller emeralds set tighter together, creating a finer surface of green. More intimate. More controlled. The softer expression of the same architecture.",
    priceUsd: 5500,
    priceRange: "From $5,000 USD",
    specs: [
      { k: "Stone Size",      v: "~1.2 mm" },
      { k: "Stone Count",     v: "~120 Emeralds" },
      { k: "Band Width",      v: "12–14 mm" },
      { k: "Estimated Price", v: "From $5,000 USD" },
    ],
  },
  {
    id: "lisa-bold",
    badge: "DEEP",
    label: "LISA BOLD",
    name: "DEEP FIELD",
    description:
      "Larger emeralds spread across the dome with heavier visual impact. The piece reads darker, richer, and more territorial on the hand.",
    priceUsd: 9000,
    priceRange: "From $8,000 USD",
    specs: [
      { k: "Stone Size",      v: "~2.5 mm" },
      { k: "Stone Count",     v: "~75 Emeralds" },
      { k: "Band Width",      v: "12–14 mm" },
      { k: "Estimated Price", v: "From $8,000 USD" },
    ],
  },
];

export default function LisaPage({ forceVariantId, audienceLabel, returnHref }) {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const initial = forceVariantId || "lisa-bold";
  const [selectedId, setSelectedId] = useState(initial);
  const [isMounted, setIsMounted] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const isSingleVariant = !!forceVariantId;
  const lockedId = forceVariantId || selectedId;
  const otherVariant = VARIANTS.find((v) => v.id !== lockedId);
  const GALLERY = useMemo(() => buildGallery(lockedId), [lockedId]);

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".lisa-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.18 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const selected = VARIANTS.find((v) => v.id === lockedId);
  const formattedPrice = `$${selected.priceUsd.toLocaleString("en-US")} USD`;

  // Cross-link target (kept dynamic so the page reflects URL context)
  const otherHref = otherVariant?.id === "lisa-small"
    ? "/ladies/rings/lisa-small"
    : "/gents/rings/lisa-bold";
  const otherLabel = otherVariant?.label || "";
  const crossLinkCopy = lockedId === "lisa-small"
    ? "Prefer a heavier expression?"
    : "Prefer a finer grain?";

  const onAddToCart = () => {
    handleAddToCart({
      id: selected.id,
      name: `LISA — ${selected.label.replace("LISA ", "")}`,
      price: selected.priceUsd,
      productKey: "lisa",
      tierKey: selected.id,
      metal: "18K White Gold · Natural Emerald",
      quantity: 1,
      image: "/lisa/lisa-bold-hero.jpg",
    });
  };

  // Only show variants relevant to current page; default mode shows both
  const visibleVariants = isSingleVariant
    ? VARIANTS.filter((v) => v.id === forceVariantId)
    : VARIANTS;

  return (
    <section
      className={`lisa-room${isMounted ? " lisa-loaded" : ""}`}
      data-page="lisa"
      data-testid="lisa-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .lisa-room {
          position: relative;
          background: #050606;
          color: #e8e6df;
          overflow: hidden;
          opacity: 0;
          transition: opacity 900ms ease;
        }
        .lisa-room.lisa-loaded { opacity: 1; }

        .lisa-reveal { opacity: 0; transform: translateY(18px); transition: opacity 1100ms ease, transform 1100ms ease; }
        .lisa-reveal.visible { opacity: 1; transform: translateY(0); }

        .lisa-back {
          position: absolute; top: 28px; left: 28px; z-index: 30;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 11px;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(232, 230, 223, 0.62);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .lisa-back:hover { color: rgba(232, 230, 223, 0.95); }

        /* ─── HERO ─────────────────────────────────────────── */
        .lisa-hero {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 40%, #0e1f1a 0%, #060807 60%, #030404 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lisa-hero-glow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 55%, rgba(20, 95, 70, 0.35), transparent 50%),
            radial-gradient(circle at 60% 80%, rgba(10, 60, 45, 0.22), transparent 55%);
          pointer-events: none;
          z-index: 1;
        }
        .lisa-hero-ring {
          position: relative;
          z-index: 2;
          max-width: 760px;
          width: 90%;
          opacity: 0;
          transform: scale(0.96);
          transition: opacity 1500ms cubic-bezier(0.22, 1, 0.36, 1), transform 1500ms cubic-bezier(0.22, 1, 0.36, 1);
          filter: drop-shadow(0 40px 80px rgba(0, 0, 0, 0.55))
                  drop-shadow(0 0 60px rgba(20, 95, 70, 0.18));
        }
        .lisa-hero-ring.in { opacity: 1; transform: scale(1); }
        .lisa-hero-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
          background:
            radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%),
            linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 18%, transparent 72%, rgba(0,0,0,0.4) 100%);
        }

        /* HERO TEXT */
        .lisa-hero-text {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          padding: 0 24px 88px;
          text-align: center;
          pointer-events: none;
        }
        .lisa-hero-text > * { pointer-events: auto; }
        .lisa-kicker {
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: rgba(232, 230, 223, 0.62);
          margin-bottom: 18px;
        }
        .lisa-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(4rem, 11vw, 9rem);
          line-height: 0.9;
          letter-spacing: 0.06em;
          color: #f0ede4;
          margin: 0 0 22px;
          text-shadow: 0 2px 32px rgba(0, 0, 0, 0.45);
        }
        .lisa-line {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1rem, 1.55vw, 1.4rem);
          line-height: 1.55;
          color: rgba(232, 230, 223, 0.78);
          margin: 0 0 36px;
          max-width: 520px;
        }
        .lisa-cta {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .lisa-btn-e, .lisa-btn-g {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          padding: 16px 38px;
          text-decoration: none;
          transition: background 320ms ease, color 320ms ease, letter-spacing 320ms ease;
          cursor: pointer;
          border: none;
        }
        .lisa-btn-e {
          background: rgba(20, 95, 70, 0.95);
          color: #f0ede4;
        }
        .lisa-btn-e:hover { background: rgba(28, 120, 90, 1); letter-spacing: 0.48em; }
        .lisa-btn-g {
          background: transparent;
          color: rgba(232, 230, 223, 0.85);
          border: 1px solid rgba(232, 230, 223, 0.32);
        }
        .lisa-btn-g:hover { color: rgba(232, 230, 223, 1); border-color: rgba(232, 230, 223, 0.6); letter-spacing: 0.48em; }

        /* ─── INTRO STRIP ─────────────────────────────────── */
        .lisa-intro-strip {
          position: relative;
          padding: 140px 24px 120px;
          background: #07090a;
        }
        .lisa-intro-inner {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 100px;
        }
        @media (max-width: 900px) {
          .lisa-intro-inner { grid-template-columns: 1fr; gap: 60px; }
        }
        .lisa-tag {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.48em;
          text-transform: uppercase;
          color: rgba(54, 158, 118, 0.78);
          margin-bottom: 28px;
          display: inline-block;
        }
        .lisa-heading {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: clamp(1.7rem, 2.5vw, 2.6rem);
          line-height: 1.18;
          color: #f0ede4;
          letter-spacing: 0.01em;
          margin: 0;
        }
        .lisa-pq {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.4rem, 2.1vw, 2rem);
          line-height: 1.42;
          color: rgba(232, 230, 223, 0.96);
          margin: 0 0 44px;
          padding-bottom: 32px;
          border-bottom: 1px solid rgba(232, 230, 223, 0.1);
        }
        .lisa-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1.02rem, 1.18vw, 1.18rem);
          line-height: 1.78;
          color: rgba(232, 230, 223, 0.78);
        }
        .lisa-body p { margin: 0 0 20px; }
        .lisa-body em {
          font-style: italic;
          color: rgba(54, 158, 118, 0.95);
        }

        /* ─── DUAL CONFIG ─────────────────────────────────── */
        .lisa-dual {
          position: relative;
          padding: 100px 24px 140px;
          background:
            linear-gradient(180deg, #07090a 0%, #050706 100%);
        }
        .lisa-dual-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        @media (max-width: 900px) {
          .lisa-dual-inner { grid-template-columns: 1fr; gap: 32px; }
        }
        .lisa-config {
          position: relative;
          padding: 64px 48px 56px;
          background: rgba(14, 18, 17, 0.5);
          border: 1px solid rgba(54, 158, 118, 0.18);
          border-radius: 2px;
          transition: border-color 480ms ease, transform 480ms ease, background 480ms ease;
        }
        .lisa-config.is-selected {
          background: rgba(20, 30, 26, 0.7);
          border-color: rgba(54, 158, 118, 0.55);
          transform: translateY(-3px);
        }
        .lisa-config:hover { border-color: rgba(54, 158, 118, 0.4); }
        .lisa-config-index {
          position: absolute;
          top: 28px;
          right: 32px;
          font-family: 'Cinzel', serif;
          font-size: 16px;
          letter-spacing: 0.3em;
          color: rgba(54, 158, 118, 0.6);
        }
        .lisa-config-for {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: rgba(54, 158, 118, 0.85);
          margin: 0 0 14px;
        }
        .lisa-config-name {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(1.7rem, 2.3vw, 2.4rem);
          line-height: 1;
          color: #f0ede4;
          margin: 0 0 22px;
          letter-spacing: 0.02em;
        }
        .lisa-config-desc {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-style: italic;
          font-size: clamp(1rem, 1.15vw, 1.12rem);
          line-height: 1.7;
          color: rgba(232, 230, 223, 0.7);
          margin: 0 0 36px;
        }
        .lisa-config-spec { margin-top: 28px; }
        .lisa-cs-row {
          display: flex;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid rgba(232, 230, 223, 0.08);
        }
        .lisa-cs-k {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          color: rgba(232, 230, 223, 0.55);
        }
        .lisa-cs-v {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 14px;
          color: rgba(232, 230, 223, 0.92);
        }
        .lisa-config-pick {
          margin-top: 32px;
          width: 100%;
          padding: 14px 0;
          background: transparent;
          color: rgba(54, 158, 118, 0.95);
          border: 1px solid rgba(54, 158, 118, 0.4);
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 320ms ease, color 320ms ease;
        }
        .lisa-config-pick:hover {
          background: rgba(54, 158, 118, 0.15);
        }
        .lisa-config.is-selected .lisa-config-pick {
          background: rgba(54, 158, 118, 0.9);
          color: #f0ede4;
          border-color: rgba(54, 158, 118, 0.9);
        }

        /* ─── ACQUISITION ────────────────────────────────── */
        .lisa-acquire {
          position: relative;
          padding: 110px 24px 110px;
          background: #050706;
          text-align: center;
          border-top: 1px solid rgba(54, 158, 118, 0.12);
        }
        .lisa-acquire-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(54, 158, 118, 0.7);
          margin-bottom: 20px;
        }
        .lisa-acquire-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3vw, 2.8rem);
          color: #f0ede4;
          letter-spacing: 0.04em;
          margin: 0;
        }
        .lisa-acquire-price {
          margin-top: 18px;
          font-family: 'Cinzel', serif;
          font-size: clamp(1.1rem, 1.45vw, 1.4rem);
          letter-spacing: 0.32em;
          color: rgba(232, 230, 223, 0.92);
        }
        .lisa-acquire-lead {
          margin-top: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.32em;
          color: rgba(232, 230, 223, 0.6);
          text-transform: uppercase;
        }
        .lisa-acquire-btn {
          margin-top: 36px;
          padding: 18px 56px;
          background: rgba(54, 158, 118, 0.95);
          color: #f0ede4;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, letter-spacing 320ms ease;
        }
        .lisa-acquire-btn:hover {
          background: rgba(28, 120, 90, 1);
          letter-spacing: 0.48em;
        }
        .lisa-acquire-btn:disabled { opacity: 0.55; cursor: default; }

        /* ─── FINAL WORD ──────────────────────────────────── */
        .lisa-final {
          position: relative;
          padding: 160px 24px 200px;
          background: #030404;
          text-align: center;
        }
        .lisa-final-stamp {
          font-family: 'Cinzel', serif;
          font-size: clamp(6rem, 12vw, 11rem);
          color: rgba(54, 158, 118, 0.15);
          letter-spacing: 0.04em;
          line-height: 1;
          margin-bottom: 24px;
        }
        .lisa-final-text {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.4rem, 2.4vw, 2.2rem);
          line-height: 1.4;
          color: rgba(232, 230, 223, 0.92);
          margin: 0 auto 44px;
          max-width: 620px;
        }
        .lisa-final-attr {
          font-family: 'Inter', sans-serif;
          font-size: 9.5px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: rgba(232, 230, 223, 0.4);
        }

        /* ─── LISA SMALL EDITORIAL PAUSE ──────────────────── */
        .lisa-essay {
          position: relative;
          padding: 140px 24px 130px;
          background: #050706;
          overflow: hidden;
        }
        .lisa-essay::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 30%, rgba(20, 95, 70, 0.16), transparent 55%);
          pointer-events: none;
        }
        .lisa-essay-inner {
          position: relative;
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }
        .lisa-essay-eyebrow {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(54, 158, 118, 0.72);
          margin-bottom: 38px;
        }
        .lisa-essay-headline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(2.2rem, 4.2vw, 3.8rem);
          line-height: 1.06;
          letter-spacing: 0.005em;
          color: #f0ede4;
          margin: 0 0 38px;
        }
        .lisa-essay-couplet {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.3rem, 2vw, 1.8rem);
          line-height: 1.5;
          color: rgba(232, 230, 223, 0.78);
          margin: 0 0 50px;
        }
        .lisa-essay-rule {
          width: 0;
          height: 1px;
          margin: 0 auto 46px;
          background: linear-gradient(
            90deg,
            rgba(54, 158, 118, 0) 0%,
            rgba(120, 200, 160, 0.55) 50%,
            rgba(54, 158, 118, 0) 100%
          );
          animation: lisaEssayRule 2.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.4s;
        }
        @keyframes lisaEssayRule {
          from { width: 0; opacity: 0; }
          to   { width: 140px; opacity: 1; }
        }
        .lisa-essay-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.3vw, 1.22rem);
          line-height: 1.78;
          color: rgba(232, 230, 223, 0.66);
          max-width: 560px;
          margin: 0 auto;
        }
        @media (prefers-reduced-motion: reduce) {
          .lisa-essay-rule { animation: none !important; width: 140px; opacity: 1; }
        }

        /* ─── ARCHIVE ─────────────────────────────────────── */
        .lisa-archive {
          position: relative;
          padding: 100px 24px 110px;
          background:
            radial-gradient(circle at 50% 0%, rgba(20, 95, 70, 0.14), transparent 55%),
            #050706;
        }
        .lisa-archive-head {
          max-width: 1200px;
          margin: 0 auto 50px;
          text-align: center;
        }
        .lisa-archive-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(54, 158, 118, 0.78);
          margin-bottom: 18px;
        }
        .lisa-archive-title {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.5rem, 2vw, 2rem);
          color: rgba(232, 230, 223, 0.92);
        }
        .lisa-archive-hallmark {
          margin-top: 22px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(0.92rem, 1.05vw, 1.05rem);
          color: rgba(232, 230, 223, 0.6);
          letter-spacing: 0.01em;
        }
        .lisa-archive-hallmark-mark {
          font-family: 'Cinzel', serif;
          font-style: normal;
          font-weight: 500;
          font-size: 0.78em;
          letter-spacing: 0.32em;
          color: rgba(54, 158, 118, 0.95);
          padding: 0 4px;
        }
        .lisa-archive-grid {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 900px) { .lisa-archive-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .lisa-archive-grid { grid-template-columns: 1fr; } }
        .lisa-archive-cell {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          background: #0c0f0e;
          border: 1px solid rgba(54, 158, 118, 0.14);
          cursor: pointer;
          padding: 0;
          transition: border-color 480ms ease, transform 480ms ease;
        }
        .lisa-archive-cell:hover {
          border-color: rgba(54, 158, 118, 0.42);
          transform: translateY(-3px);
        }
        .lisa-archive-cell img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 1200ms ease, filter 1200ms ease;
          filter: brightness(0.96) saturate(0.98);
        }
        .lisa-archive-cell:hover img { transform: scale(1.04); filter: brightness(1) saturate(1.05); }
        .lisa-archive-cell-label {
          position: absolute; bottom: 14px; left: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 9px; letter-spacing: 0.38em;
          color: rgba(232, 230, 223, 0.75);
          text-transform: uppercase;
          background: rgba(0, 0, 0, 0.45);
          padding: 6px 10px;
          backdrop-filter: blur(6px);
        }

        /* ─── CROSS-LINK ─────────────────────────────────── */
        .lisa-crosslink {
          padding: 80px 24px 100px;
          background: #050706;
          text-align: center;
          border-top: 1px solid rgba(54, 158, 118, 0.08);
        }
        .lisa-crosslink-eyebrow {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.1rem, 1.6vw, 1.5rem);
          color: rgba(232, 230, 223, 0.7);
          margin: 0 0 26px;
        }
        .lisa-crosslink-cta {
          display: inline-block;
          padding: 16px 36px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(54, 158, 118, 0.95);
          border: 1px solid rgba(54, 158, 118, 0.5);
          text-decoration: none;
          transition: background 320ms ease, color 320ms ease, letter-spacing 320ms ease;
        }
        .lisa-crosslink-cta:hover {
          background: rgba(54, 158, 118, 0.15);
          color: rgba(232, 230, 223, 1);
          letter-spacing: 0.48em;
        }

        @media (max-width: 768px) {
          .lisa-hero { min-height: 92vh; }
          .lisa-hero-text { padding-bottom: 56px; }
          .lisa-hero-ring { width: 78%; }
          .lisa-config { padding: 48px 28px 40px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lisa-hero-ring { transition: none !important; opacity: 1; transform: none; }
        }
      `}</style>

      <Link to={returnHref || "/shop?category=rings"} className="lisa-back" data-testid="lisa-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="lisa-hero" data-testid="lisa-hero">
        <div className="lisa-hero-glow" aria-hidden="true" />
        <img
          className="lisa-hero-ring"
          src="/lisa/lisa-bold-hero.jpg"
          alt="LISA — Phileon, 18K white gold band set with natural emerald dome"
          onLoad={(e) => e.currentTarget.classList.add("in")}
          data-testid="lisa-hero-ring"
        />
        <div className="lisa-hero-vignette" aria-hidden="true" />

        <div className="lisa-hero-text">
          <p className="lisa-kicker" data-testid="lisa-kicker">
            {audienceLabel || "PHILEON SIGNATURE OBJECTS"}
          </p>
          <h1 className="lisa-title" data-testid="lisa-title">
            {isSingleVariant ? selected.label : "LISA"}
          </h1>
          <p className="lisa-line" data-testid="lisa-line">
            Quiet seduction.<br />
            Saturation held under control.
          </p>
          <div className="lisa-cta">
            <a href="#acquisition" className="lisa-btn-e" data-testid="lisa-hero-cta-add">ADD TO CART</a>
            <a href="#story" className="lisa-btn-g" data-testid="lisa-hero-cta-discover">DISCOVER</a>
          </div>
        </div>
      </section>

      {/* ─── INTRO STRIP ─────────────────────────────────── */}
      <section className="lisa-intro-strip lisa-reveal" id="story" data-testid="lisa-intro">
        <div className="lisa-intro-inner">
          <div>
            <span className="lisa-tag">COMPOSITION</span>
            <h2 className="lisa-heading">
              18K White Gold<br />
              Natural Emerald<br />
              Graduated Dome Band
            </h2>
          </div>
          <div>
            <p className="lisa-pq">
              It does not ask for attention.<br />
              It changes the temperature of the room.
            </p>
            <div className="lisa-body">
              <p>
                Lisa is built as a continuous emerald field — five graduated rows pulled across
                a domed surface and restrained by hand-milled rails in white gold.
              </p>
              <p>
                The architecture is identical across both expressions:
                {" "}<em>LISA SMALL</em> and <em>LISA BOLD.</em> Only the scale changes.
              </p>
              <p>
                Smaller stones create a tighter grain of green — quieter, closer, more intimate.
                Larger stones create weight, depth, and a stronger visual pull from distance.
              </p>
              <p>The effect remains the same: controlled desire.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LISA SMALL — EDITORIAL PAUSE (small-only) ───── */}
      {forceVariantId === "lisa-small" && (
        <section className="lisa-essay lisa-reveal" data-testid="lisa-small-essay">
          <div className="lisa-essay-inner">
            <span className="lisa-essay-eyebrow">LISA SMALL</span>
            <h2 className="lisa-essay-headline">
              A hundred small emeralds.
            </h2>
            <p className="lisa-essay-couplet">
              Like a room full of eyes<br />
              pretending not to look.
            </p>
            <div className="lisa-essay-rule" aria-hidden="true" />
            <p className="lisa-essay-body">
              The tighter stone field changes the behavior of light entirely.
              Nothing flashes at once. Everything moves in fragments.
            </p>
          </div>
        </section>
      )}

      {/* ─── ARCHIVE GALLERY ─────────────────────────────── */}
      <section className="lisa-archive lisa-reveal" data-testid="lisa-archive">
        <div className="lisa-archive-head">
          <p className="lisa-archive-eyebrow">THE ARCHIVE</p>
          <p className="lisa-archive-title">
            {GALLERY.length === 8 ? "Eight frames. One dome." : "Seven frames. One dome."}
          </p>
          <p className="lisa-archive-hallmark" data-testid="lisa-archive-hallmark">
            Frame 02 — internal <span className="lisa-archive-hallmark-mark">PHILEON 18K</span> hallmark visible.
          </p>
        </div>
        <div className="lisa-archive-grid" data-testid="lisa-archive-grid">
          {GALLERY.map((g, i) => (
            <button
              key={g.src}
              type="button"
              className="lisa-archive-cell"
              aria-label={`Open ${g.label}`}
              onClick={() => setLightboxIdx(i)}
              data-testid={`lisa-archive-cell-${i + 1}`}
            >
              <img src={g.src} alt={g.alt} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
              <span className="lisa-archive-cell-label">
                {String(i + 1).padStart(2, "0")}
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
        archiveLabel="LISA · ARCHIVE"
      />

      {/* ─── DUAL CONFIG ─────────────────────────────────── */}
      <section className="lisa-dual lisa-reveal" data-testid="lisa-dual">
        <div
          className="lisa-dual-inner"
          style={isSingleVariant ? { gridTemplateColumns: "1fr", maxWidth: 720 } : undefined}
        >
          {visibleVariants.map((v, idx) => {
            const isSelected = v.id === lockedId;
            const trueIdx = VARIANTS.findIndex((x) => x.id === v.id);
            return (
              <div
                key={v.id}
                className={`lisa-config${isSelected ? " is-selected" : ""}`}
                data-testid={`lisa-config-${v.id}`}
              >
                <div className="lisa-config-index">{trueIdx === 0 ? "I" : "II"}</div>
                <p className="lisa-config-for">{v.label}</p>
                <h3 className="lisa-config-name">{v.name}</h3>
                <p className="lisa-config-desc">{v.description}</p>
                <div className="lisa-config-spec">
                  {v.specs.map((s) => (
                    <div key={s.k} className="lisa-cs-row">
                      <span className="lisa-cs-k">{s.k}</span>
                      <span className="lisa-cs-v">{s.v}</span>
                    </div>
                  ))}
                </div>
                {!isSingleVariant && (
                  <button
                    type="button"
                    onClick={() => setSelectedId(v.id)}
                    className="lisa-config-pick"
                    data-testid={`lisa-pick-${v.id}`}
                  >
                    {isSelected ? "SELECTED" : "SELECT"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── CROSS-LINK ─────────────────────────────────── */}
      {isSingleVariant && otherVariant && (
        <section className="lisa-crosslink lisa-reveal" data-testid="lisa-crosslink">
          <p className="lisa-crosslink-eyebrow">{crossLinkCopy}</p>
          <Link to={otherHref} className="lisa-crosslink-cta" data-testid="lisa-crosslink-cta">
            View {otherLabel} <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}

      {/* ─── ACQUISITION ─────────────────────────────────── */}
      <section className="lisa-acquire lisa-reveal" id="acquisition" data-testid="lisa-acquire">
        <p className="lisa-acquire-eyebrow">ACQUISITION</p>
        <h2 className="lisa-acquire-title" data-testid="lisa-acquire-title">
          LISA — {selected.label.replace("LISA ", "")}
        </h2>
        <p className="lisa-acquire-price" data-testid="lisa-acquire-price">{formattedPrice}</p>
        <p className="lisa-acquire-lead">Made to order · 6–8 weeks · Complimentary insured worldwide shipping</p>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isAdding}
          className="lisa-acquire-btn"
          data-testid="lisa-add-to-cart-btn"
        >
          {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
        </button>
      </section>

      {/* ─── FINAL WORD ──────────────────────────────────── */}
      <section className="lisa-final lisa-reveal" data-testid="lisa-final">
        <div className="lisa-final-stamp" aria-hidden="true">195</div>
        <p className="lisa-final-text" data-testid="lisa-final-text">
          Desire rarely arrives loudly.<br />
          Sometimes it arrives in green.
        </p>
        <p className="lisa-final-attr">PHILEON — LISA — NATURAL EMERALD — 18K WHITE GOLD</p>
      </section>
    </section>
  );
}
