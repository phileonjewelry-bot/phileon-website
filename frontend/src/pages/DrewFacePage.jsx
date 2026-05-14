import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";

/**
 * DREW FACE™ — Drew's Vault inventory release #1
 *
 * NOT for the main storefront. Lives inside /vault/drew-face.
 *
 * Tone: hidden anime archive · masked character emblem · collector pendant ·
 * family-created artifact. Dark cinematic with sharper anime-inspired energy.
 * No luxury soft-talk. No childish framing.
 */

const PRICE_USD = 850; // collector-tier pendant pricing — adjust when finalized

const VAULT_DETAILS = [
  { label: "VAULT RELEASE",  value: "DREW FACE™" },
  { label: "CREATED BY",     value: "Andrew" },
  { label: "CATEGORY",       value: "Pendant" },
  { label: "STYLE",          value: "Anime-inspired character artifact" },
  { label: "FINISH",         value: "Polished gold with dark detail contrast" },
  { label: "AVAILABILITY",   value: "Drew's Vault exclusive" },
];

export default function DrewFacePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  // Slow parallax: blueprint wrapper drifts at ~70% of scroll speed
  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        const stage = document.querySelector("[data-testid='drew-face-blueprint-stage']");
        const wrap = stage?.querySelector(".df-blueprint-img-wrap");
        if (stage && wrap) {
          const rect = stage.getBoundingClientRect();
          const vh = window.innerHeight;
          if (rect.bottom > -200 && rect.top < vh + 200) {
            const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
            const offset = Math.max(-40, Math.min(40, progress * -24));
            wrap.style.transform = `translate3d(0, ${offset}px, 0)`;
          }
        }
        rafId = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "drew-face",
      name: "DREW FACE™ — Drew's Vault",
      price: PRICE_USD,
      productKey: "drew-face",
      tierKey: "vault",
      quantity: 1,
      image: "/vault/drew-face/drew-face-hero.png",
    });
  };

  return (
    <div className={`df-room${isMounted ? " df-loaded" : ""}`} data-page="drew-face" data-testid="drew-face-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        .df-room {
          position: relative; min-height: 100vh;
          background: #050505;
          color: rgba(240,232,210,0.92);
          overflow-x: hidden;
          opacity: 0;
          transition: opacity 1.2s cubic-bezier(0.22,1,0.36,1);
          font-family: 'Space Grotesk', 'Inter', sans-serif;
        }
        .df-room.df-loaded { opacity: 1; }

        /* Grain noise overlay */
        .df-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
          opacity: 0.08; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='4'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>");
        }

        /* Crimson scanline accent */
        .df-scanline {
          position: fixed; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(214,52,52,0.6) 25%, rgba(228,178,60,0.6) 70%, transparent 100%);
          z-index: 4;
        }

        .df-back {
          position: absolute; top: 28px; left: 28px; z-index: 6;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Bebas Neue', sans-serif; font-size: 13px;
          letter-spacing: 0.36em; color: rgba(228,178,60,0.7);
          text-decoration: none; transition: color 300ms ease;
        }
        .df-back:hover { color: rgba(245,228,172,1); }

        .df-vault-tag {
          position: absolute; top: 32px; right: 32px; z-index: 6;
          font-family: 'Bebas Neue', sans-serif; font-size: 11px;
          letter-spacing: 0.4em; color: rgba(228,178,60,0.55);
        }
        .df-vault-tag::before {
          content: "● "; color: rgba(214,52,52,0.85);
          animation: dfPulse 1.6s ease-in-out infinite;
        }
        @keyframes dfPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

        /* ═════ HERO ═════════════════════════════════════════ */
        .df-hero {
          position: relative; min-height: 100vh;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: clamp(96px, 12vh, 140px) clamp(28px, 7vw, 96px) 80px;
          z-index: 2;
        }
        @media (max-width: 900px) {
          .df-hero { grid-template-columns: 1fr; gap: 40px; padding: 110px 22px 60px; }
        }

        .df-hero-vis {
          position: relative;
          width: 100%; aspect-ratio: 4/5;
          background:
            radial-gradient(ellipse at 50% 38%, rgba(228,178,60,0.18) 0%, rgba(228,178,60,0) 55%),
            radial-gradient(ellipse at 50% 75%, rgba(214,52,52,0.10) 0%, rgba(214,52,52,0) 60%),
            #0A0A0A;
          border: 1px solid rgba(228,178,60,0.18);
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .df-hero-vis::before {
          content: ""; position: absolute; inset: 0;
          background:
            linear-gradient(135deg, transparent 0%, transparent 49%, rgba(228,178,60,0.06) 50%, transparent 51%) 0 0/14px 14px;
          pointer-events: none;
        }
        .df-hero-vis::after {
          content: "DREW · 01";
          position: absolute; left: 18px; bottom: 14px;
          font-family: 'Bebas Neue', sans-serif; font-size: 10px;
          letter-spacing: 0.4em; color: rgba(228,178,60,0.5);
        }
        .df-hero-img {
          width: 100%; height: 100%; object-fit: cover;
          filter: drop-shadow(0 24px 32px rgba(0,0,0,0.65))
                  drop-shadow(0 0 24px rgba(228,178,60,0.18));
          transform: scale(1);
          animation: dfHeroBreath 22s ease-in-out infinite alternate;
          will-change: transform, filter;
        }
        @keyframes dfHeroBreath {
          0%   { transform: scale(1)    translateY(0px); filter: drop-shadow(0 24px 32px rgba(0,0,0,0.65)) drop-shadow(0 0 22px rgba(228,178,60,0.15)); }
          100% { transform: scale(1.04) translateY(-6px); filter: drop-shadow(0 28px 38px rgba(0,0,0,0.7))  drop-shadow(0 0 32px rgba(228,178,60,0.28)); }
        }
        .df-hero-placeholder {
          width: 56%; height: 56%;
          border: 1px dashed rgba(228,178,60,0.35);
          display: flex; align-items: center; justify-content: center;
          color: rgba(228,178,60,0.55);
          font-family: 'Bebas Neue', sans-serif; font-size: 11px;
          letter-spacing: 0.42em; text-align: center;
        }

        .df-hero-copy {
          padding-left: clamp(0px, 4vw, 64px);
          display: flex; flex-direction: column; gap: 24px;
        }
        @media (max-width: 900px) { .df-hero-copy { padding-left: 0; } }

        .df-eyebrow {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 12px; letter-spacing: 0.5em;
          color: rgba(214,52,52,0.85);
          display: inline-flex; align-items: center; gap: 12px;
        }
        .df-eyebrow::after {
          content: ""; height: 1px; width: 48px;
          background: rgba(214,52,52,0.5);
        }

        .df-title {
          font-family: 'Bebas Neue', sans-serif; font-weight: 400;
          font-size: clamp(4rem, 9vw, 8rem);
          letter-spacing: 0.01em; line-height: 0.88;
          color: rgba(245,228,172,0.98);
          margin: 0;
        }
        .df-title sup {
          font-size: 0.22em; vertical-align: super; letter-spacing: 0.15em;
          color: rgba(228,178,60,0.6); margin-left: 6px;
        }

        .df-subtitle {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(14px, 1.05vw, 16px); font-weight: 400;
          color: rgba(240,232,210,0.55);
          letter-spacing: 0.04em; margin: 0;
        }

        .df-primary-line {
          font-family: 'Space Grotesk', sans-serif; font-weight: 300;
          font-size: clamp(18px, 1.6vw, 24px); line-height: 1.45;
          color: rgba(240,232,210,0.88);
          max-width: 480px; margin: 8px 0 0 0;
          padding: 18px 0 0 0;
          border-top: 1px solid rgba(228,178,60,0.18);
        }
        .df-primary-line em {
          font-style: normal; color: rgba(228,178,60,0.95);
        }

        /* ═════ SHARED SECTION ═══════════════════════════════ */
        .df-section {
          position: relative; z-index: 2;
          padding: clamp(80px, 11vh, 140px) clamp(28px, 7vw, 96px);
          max-width: 1280px; margin: 0 auto;
        }
        .df-section-eyebrow {
          font-family: 'Bebas Neue', sans-serif; font-size: 11px;
          letter-spacing: 0.46em; color: rgba(228,178,60,0.55);
          margin: 0 0 28px 0;
          display: inline-flex; align-items: center; gap: 14px;
        }
        .df-section-eyebrow::before {
          content: ""; width: 28px; height: 1px;
          background: rgba(228,178,60,0.45);
        }
        .df-section-heading {
          font-family: 'Bebas Neue', sans-serif; font-weight: 400;
          font-size: clamp(2.4rem, 4.4vw, 4rem);
          letter-spacing: 0.04em; line-height: 0.96;
          color: rgba(245,228,172,0.95);
          margin: 0 0 26px 0;
        }
        .df-section-body {
          font-family: 'Space Grotesk', sans-serif; font-weight: 300;
          font-size: clamp(16px, 1.2vw, 19px); line-height: 1.7;
          color: rgba(240,232,210,0.74);
          max-width: 720px; margin: 0;
        }

        .df-section--alt {
          background:
            linear-gradient(180deg, transparent 0%, rgba(228,178,60,0.025) 50%, transparent 100%);
          border-top: 1px solid rgba(228,178,60,0.07);
          border-bottom: 1px solid rgba(228,178,60,0.07);
          max-width: none;
        }
        .df-section--alt > * { max-width: 1280px; margin-left: auto; margin-right: auto; }

        /* ═════ VAULT DETAILS ════════════════════════════════ */
        .df-details-list {
          margin: 0; padding: 0; list-style: none;
          display: grid; gap: 0;
          border-top: 1px solid rgba(228,178,60,0.12);
        }
        .df-details-row {
          display: grid; grid-template-columns: 220px 1fr;
          gap: 24px; padding: 18px 0;
          border-bottom: 1px solid rgba(228,178,60,0.12);
        }
        @media (max-width: 640px) {
          .df-details-row { grid-template-columns: 1fr; gap: 4px; padding: 16px 0; }
        }
        .df-details-label {
          font-family: 'Bebas Neue', sans-serif; font-size: 11.5px;
          letter-spacing: 0.42em; color: rgba(228,178,60,0.6);
        }
        .df-details-value {
          font-family: 'Space Grotesk', sans-serif; font-weight: 400;
          font-size: clamp(15px, 1.1vw, 17px);
          color: rgba(240,232,210,0.88);
        }

        /* ═════ CTA ═══════════════════════════════════════════ */
        .df-cta-section {
          position: relative; z-index: 2;
          padding: clamp(80px, 11vh, 140px) clamp(28px, 7vw, 96px) 120px;
          text-align: center;
        }
        .df-cta-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(28px, 2.6vw, 38px);
          letter-spacing: 0.16em;
          color: rgba(245,228,172,0.98);
          margin: 0 0 8px 0;
          font-variant-numeric: tabular-nums;
        }
        .df-cta-meta {
          font-family: 'Space Grotesk', sans-serif; font-weight: 300;
          font-size: 13px; color: rgba(240,232,210,0.5);
          letter-spacing: 0.06em; margin: 0 0 32px 0;
        }
        .df-cta-btn {
          position: relative;
          font-family: 'Bebas Neue', sans-serif; font-size: 14px;
          letter-spacing: 0.5em; text-transform: uppercase;
          color: #0A0A0A;
          background: linear-gradient(135deg, #F1DA9E 0%, #D6A742 100%);
          border: 1px solid rgba(228,178,60,0.7);
          padding: 22px 56px;
          cursor: pointer;
          clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
          transition: transform 280ms cubic-bezier(0.22,1,0.36,1),
                      filter 280ms ease;
        }
        .df-cta-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05) drop-shadow(0 6px 14px rgba(228,178,60,0.35));
        }
        .df-cta-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .df-cta-note {
          margin: 24px 0 0 0;
          font-family: 'Space Grotesk', sans-serif; font-weight: 300;
          font-size: 12px; color: rgba(240,232,210,0.42);
          letter-spacing: 0.16em; text-transform: uppercase;
        }

        @media (prefers-reduced-motion: reduce) {
          .df-room { transition: none !important; opacity: 1 !important; }
          .df-vault-tag::before { animation: none !important; }
          .df-hero-img, .df-blueprint-img,
          .df-blueprint-scan, .df-blueprint-glow, .df-blueprint-grain,
          .df-blueprint-tag, .df-blueprint-corner, .df-blueprint-stamp {
            animation: none !important;
          }
        }

        /* ═════ VAULT BLUEPRINT ═══════════════════════════════ */
        .df-blueprint {
          position: relative; z-index: 2;
          padding: clamp(80px, 11vh, 140px) clamp(20px, 5vw, 64px) 140px;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(228,178,60,0.05) 0%, transparent 60%),
            #050505;
          border-top: 1px solid rgba(228,178,60,0.12);
          overflow: hidden;
        }
        .df-blueprint-header {
          max-width: 1280px; margin: 0 auto 40px;
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
        }
        .df-blueprint-titlewrap { display: flex; flex-direction: column; gap: 8px; }
        .df-blueprint-eyebrow {
          font-family: 'Bebas Neue', sans-serif; font-size: 10.5px;
          letter-spacing: 0.5em; color: rgba(214,52,52,0.85);
          margin: 0;
          display: inline-flex; align-items: center; gap: 12px;
        }
        .df-blueprint-eyebrow::before {
          content: ""; width: 24px; height: 1px;
          background: rgba(214,52,52,0.65);
        }
        .df-blueprint-title {
          font-family: 'Bebas Neue', sans-serif; font-weight: 400;
          font-size: clamp(2.4rem, 4.6vw, 4.2rem);
          letter-spacing: 0.03em; line-height: 0.96;
          color: rgba(245,228,172,0.96); margin: 0;
        }
        .df-blueprint-subtitle {
          font-family: 'Space Grotesk', sans-serif; font-weight: 300;
          font-size: 14px; color: rgba(240,232,210,0.55);
          letter-spacing: 0.04em; margin: 0;
        }

        .df-blueprint-metarow {
          display: flex; gap: 24px; flex-wrap: wrap;
          font-family: 'Bebas Neue', sans-serif; font-size: 10.5px;
          letter-spacing: 0.34em; color: rgba(228,178,60,0.55);
          align-items: center;
        }
        .df-blueprint-metarow span { display: inline-flex; align-items: center; gap: 8px; }
        .df-blueprint-metarow span::before {
          content: ""; width: 6px; height: 6px;
          background: rgba(228,178,60,0.6); transform: rotate(45deg);
        }

        /* STAGE */
        .df-blueprint-stage {
          position: relative;
          max-width: 1280px; margin: 0 auto;
          aspect-ratio: 1240/1240;
          background: #050505;
          border: 1px solid rgba(228,178,60,0.22);
          overflow: hidden;
          cursor: zoom-in;
        }
        /* Vault frame corners */
        .df-blueprint-corner {
          position: absolute; width: 28px; height: 28px;
          border: 1px solid rgba(228,178,60,0.55);
          z-index: 5;
          animation: dfCornerBreath 5.2s ease-in-out infinite alternate;
        }
        @keyframes dfCornerBreath {
          0%   { opacity: 0.55; }
          100% { opacity: 0.95; }
        }
        .df-blueprint-corner.tl { top: 12px; left: 12px;  border-right: none; border-bottom: none; }
        .df-blueprint-corner.tr { top: 12px; right: 12px; border-left: none;  border-bottom: none; animation-delay: 1.3s; }
        .df-blueprint-corner.bl { bottom: 12px; left: 12px;  border-right: none; border-top: none; animation-delay: 2.6s; }
        .df-blueprint-corner.br { bottom: 12px; right: 12px; border-left: none;  border-top: none; animation-delay: 3.9s; }

        /* Coordinate ticks along edges */
        .df-blueprint-ticks {
          position: absolute; pointer-events: none;
          color: rgba(228,178,60,0.32);
          font-family: 'Bebas Neue', sans-serif; font-size: 9px;
          letter-spacing: 0.18em;
        }
        .df-blueprint-ticks.top    { top: 46px;    left: 60px; right: 60px; display: flex; justify-content: space-between; }
        .df-blueprint-ticks.bottom { bottom: 46px; left: 60px; right: 60px; display: flex; justify-content: space-between; }
        .df-blueprint-ticks.left   { top: 60px; bottom: 60px; left: 18px;  display: flex; flex-direction: column; justify-content: space-between; }
        .df-blueprint-ticks.right  { top: 60px; bottom: 60px; right: 18px; display: flex; flex-direction: column; justify-content: space-between; }

        /* The actual blueprint image */
        .df-blueprint-img-wrap {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          z-index: 2;
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }
        .df-blueprint-img {
          width: 92%; height: 92%; object-fit: contain;
          filter: drop-shadow(0 0 18px rgba(228,178,60,0.08));
          transform: scale(1);
          will-change: transform, filter;
          transition:
            transform 700ms cubic-bezier(0.22,1,0.36,1),
            filter 700ms cubic-bezier(0.22,1,0.36,1);
        }
        .df-blueprint-stage:hover .df-blueprint-img {
          transform: scale(1.025);
          filter:
            drop-shadow(0 0 22px rgba(228,178,60,0.22))
            saturate(1.08)
            contrast(1.04);
        }

        /* Ambient gold glow that breathes */
        .df-blueprint-glow {
          position: absolute; inset: -20%; z-index: 1;
          background:
            radial-gradient(circle at 50% 55%, rgba(228,178,60,0.10) 0%, transparent 55%),
            radial-gradient(circle at 16% 28%, rgba(228,178,60,0.06) 0%, transparent 35%),
            radial-gradient(circle at 84% 72%, rgba(228,178,60,0.06) 0%, transparent 35%);
          pointer-events: none;
          animation: dfGlowBreath 9s ease-in-out infinite alternate;
        }
        @keyframes dfGlowBreath {
          0%   { opacity: 0.55; transform: scale(1); }
          100% { opacity: 1;    transform: scale(1.06); }
        }

        /* Scan line sweep — soft horizontal pass every 7s */
        .df-blueprint-scan {
          position: absolute; inset: 0; z-index: 4;
          pointer-events: none;
          background: linear-gradient(180deg,
            transparent 0%,
            transparent 48%,
            rgba(228,178,60,0.18) 50%,
            transparent 52%,
            transparent 100%);
          background-size: 100% 220%;
          background-position: 0 -110%;
          mix-blend-mode: screen;
          opacity: 0.55;
          animation: dfScan 7s linear infinite;
        }
        @keyframes dfScan {
          0%   { background-position: 0 -110%; opacity: 0; }
          12%  { opacity: 0.7; }
          50%  { background-position: 0  110%; opacity: 0.7; }
          62%  { opacity: 0; }
          100% { background-position: 0  110%; opacity: 0; }
        }

        /* Moving grain texture */
        .df-blueprint-grain {
          position: absolute; inset: -10%; z-index: 4;
          pointer-events: none; opacity: 0.07;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' seed='7'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          animation: dfGrainShift 1.8s steps(6) infinite;
        }
        @keyframes dfGrainShift {
          0%   { transform: translate(0, 0); }
          20%  { transform: translate(-8px, 4px); }
          40%  { transform: translate(6px, -6px); }
          60%  { transform: translate(-4px, -2px); }
          80%  { transform: translate(8px, 6px); }
          100% { transform: translate(0, 0); }
        }

        /* Faint grid lines */
        .df-blueprint-grid {
          position: absolute; inset: 36px; z-index: 1;
          pointer-events: none; opacity: 0.05;
          background-image:
            linear-gradient(90deg, rgba(228,178,60,1) 1px, transparent 1px),
            linear-gradient(180deg, rgba(228,178,60,1) 1px, transparent 1px);
          background-size: 80px 80px;
        }

        /* Floating tags */
        .df-blueprint-tag {
          position: absolute; z-index: 5;
          font-family: 'Bebas Neue', sans-serif; font-size: 10px;
          letter-spacing: 0.36em; color: rgba(228,178,60,0.75);
          background: rgba(8,8,8,0.6);
          border: 1px solid rgba(228,178,60,0.35);
          padding: 6px 10px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: dfTagDrift 7s ease-in-out infinite alternate;
          will-change: transform, opacity;
        }
        @keyframes dfTagDrift {
          0%   { transform: translate(0, 0);     opacity: 0.85; }
          100% { transform: translate(2px, -2px); opacity: 1; }
        }
        .df-blueprint-tag.tl { top: 56px; left: 40px; }
        .df-blueprint-tag.tr { top: 56px; right: 40px; animation-delay: 1.4s; }
        .df-blueprint-tag.bl { bottom: 56px; left: 40px; animation-delay: 2.8s; }
        .df-blueprint-tag.br { bottom: 56px; right: 40px; animation-delay: 4.2s; }
        @media (max-width: 640px) {
          .df-blueprint-tag { font-size: 8.5px; padding: 5px 8px; letter-spacing: 0.28em; }
          .df-blueprint-tag.tl, .df-blueprint-tag.tr { top: 30px; }
          .df-blueprint-tag.bl, .df-blueprint-tag.br { bottom: 30px; }
        }

        /* Center bottom stamp */
        .df-blueprint-stamp {
          position: absolute; left: 50%; bottom: 22px;
          transform: translateX(-50%);
          z-index: 5;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Bebas Neue', sans-serif; font-size: 9.5px;
          letter-spacing: 0.42em; color: rgba(228,178,60,0.55);
          animation: dfStampPulse 4.6s ease-in-out infinite alternate;
        }
        .df-blueprint-stamp::before {
          content: ""; width: 6px; height: 6px;
          background: rgba(214,52,52,0.85); border-radius: 50%;
          animation: dfPulse 1.6s ease-in-out infinite;
        }
        @keyframes dfStampPulse {
          0%   { opacity: 0.55; }
          100% { opacity: 1; }
        }

        /* Footer microbar */
        .df-blueprint-footer {
          max-width: 1280px; margin: 36px auto 0;
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;
          padding-top: 20px;
          border-top: 1px solid rgba(228,178,60,0.18);
        }
        @media (max-width: 720px) { .df-blueprint-footer { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .df-blueprint-footer { grid-template-columns: 1fr; } }
        .df-blueprint-foot-cell {
          font-family: 'Space Grotesk', sans-serif;
          color: rgba(240,232,210,0.6);
        }
        .df-blueprint-foot-cell strong {
          display: block;
          font-family: 'Bebas Neue', sans-serif; font-size: 10px;
          letter-spacing: 0.42em; color: rgba(228,178,60,0.55);
          margin-bottom: 4px; font-weight: 400;
        }
        .df-blueprint-foot-cell span { font-size: 13px; letter-spacing: 0.04em; }
      `}</style>

      <div className="df-grain" aria-hidden="true" />
      <div className="df-scanline" aria-hidden="true" />

      <Link to="/vault/drews-world" className="df-back" data-testid="drew-face-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO VAULT</span>
      </Link>
      <span className="df-vault-tag">DREW'S VAULT · LIVE</span>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="df-hero" data-testid="drew-face-hero">
        <div className="df-hero-vis">
          {/* Drop the real DREW FACE pendant render at /vault/drew-face/drew-face-hero.png */}
          <img
            src="/vault/drew-face/drew-face-hero.png"
            alt="DREW FACE — gold pendant by Andrew"
            className="df-hero-img"
            loading="eager"
            decoding="async"
            data-testid="drew-face-hero-img"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="df-hero-placeholder">AWAITING<br />HERO ASSET</div>
        </div>

        <div className="df-hero-copy">
          <span className="df-eyebrow">DREW'S VAULT · 01</span>
          <h1 className="df-title" data-testid="drew-face-title">
            DREW FACE<sup>™</sup>
          </h1>
          <p className="df-subtitle">Created by Andrew. Released from Drew's Vault.</p>
          <p className="df-primary-line">
            A face from the Vault. Drawn with instinct. <em>Cast into gold.</em>
          </p>
        </div>
      </section>

      {/* ─── ORIGIN ────────────────────────────────────────── */}
      <section className="df-section" data-testid="drew-face-origin">
        <p className="df-section-eyebrow">ORIGIN</p>
        <h2 className="df-section-heading">A FACE BEFORE IT WAS JEWELRY.</h2>
        <p className="df-section-body">
          DREW FACE™ began as Andrew's creation — a face with attitude, pressure,
          and expression before it ever became jewelry. The pendant keeps that
          original energy intact, translating a young imagination into a
          sculptural Vault release.
        </p>
      </section>

      {/* ─── CHARACTER ENERGY ──────────────────────────────── */}
      <section className="df-section df-section--alt" data-testid="drew-face-character">
        <div>
          <p className="df-section-eyebrow">CHARACTER ENERGY</p>
          <h2 className="df-section-heading">PART EMBLEM. PART WARNING.</h2>
          <p className="df-section-body">
            The expression carries the piece. Heavy eyes, compressed features,
            and a mask-like frame give DREW FACE™ the feeling of an anime
            emblem — part character, part symbol, part warning sign.
          </p>
        </div>
      </section>

      {/* ─── VAULT DETAILS ─────────────────────────────────── */}
      <section className="df-section" data-testid="drew-face-details">
        <p className="df-section-eyebrow">VAULT DETAILS</p>
        <h2 className="df-section-heading">FILE 01.</h2>
        <ul className="df-details-list">
          {VAULT_DETAILS.map((d) => (
            <li key={d.label} className="df-details-row" data-testid={`drew-face-detail-${d.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <span className="df-details-label">{d.label}</span>
              <span className="df-details-value">{d.value}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── ADD TO CART ───────────────────────────────────── */}
      <section className="df-cta-section" data-testid="drew-face-cta">
        <p className="df-cta-price" data-testid="drew-face-price">
          ${PRICE_USD.toLocaleString("en-US")} USD
        </p>
        <p className="df-cta-meta">Drew's Vault exclusive · Made to order</p>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isAdding}
          className="df-cta-btn"
          data-testid="drew-face-add-to-cart-btn"
        >
          {isAdding ? "ENTERING…" : buttonText === "Added!" ? "SECURED" : "ENTER THE VAULT"}
        </button>
        <p className="df-cta-note">FAMILY-CREATED · LIMITED RELEASE</p>
      </section>
      {/* ─── VAULT BLUEPRINT ───────────────────────────────── */}
      <section className="df-blueprint" data-testid="drew-face-blueprint">
        <div className="df-blueprint-header">
          <div className="df-blueprint-titlewrap">
            <p className="df-blueprint-eyebrow">CLASSIFIED RELEASE</p>
            <h2 className="df-blueprint-title">VAULT BLUEPRINT</h2>
            <p className="df-blueprint-subtitle">Archived technical drawing — DREW FACE™</p>
          </div>
          <div className="df-blueprint-metarow">
            <span>SCAN ID: DF-001</span>
            <span>CREATOR: DREW BREEZY</span>
            <span>VAULT FILE ACTIVE</span>
          </div>
        </div>

        <div className="df-blueprint-stage" data-testid="drew-face-blueprint-stage">
          {/* Layered depth */}
          <div className="df-blueprint-glow" aria-hidden="true" />
          <div className="df-blueprint-grid" aria-hidden="true" />

          {/* Coordinate ticks */}
          <div className="df-blueprint-ticks top" aria-hidden="true">
            <span>00</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span>
          </div>
          <div className="df-blueprint-ticks bottom" aria-hidden="true">
            <span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span>
          </div>
          <div className="df-blueprint-ticks left" aria-hidden="true">
            <span>I</span><span>II</span><span>III</span><span>IV</span><span>V</span>
          </div>
          <div className="df-blueprint-ticks right" aria-hidden="true">
            <span>01</span><span>02</span><span>03</span><span>04</span><span>05</span>
          </div>

          {/* Vault frame corners */}
          <span className="df-blueprint-corner tl" aria-hidden="true" />
          <span className="df-blueprint-corner tr" aria-hidden="true" />
          <span className="df-blueprint-corner bl" aria-hidden="true" />
          <span className="df-blueprint-corner br" aria-hidden="true" />

          {/* Floating tags */}
          <span className="df-blueprint-tag tl">DREW'S VAULT // ARCHIVE</span>
          <span className="df-blueprint-tag tr">DF-001</span>
          <span className="df-blueprint-tag bl">CREATOR: DREW BREEZY</span>
          <span className="df-blueprint-tag br">CLASSIFIED RELEASE</span>

          {/* Blueprint */}
          <div className="df-blueprint-img-wrap">
            <img
              src="/vault/drew-face/drew-face-blueprint.png"
              alt="DREW FACE — archived technical drawing with measurements, stone breakdown, side and back views"
              className="df-blueprint-img"
              loading="lazy"
              decoding="async"
              data-testid="drew-face-blueprint-img"
            />
          </div>

          {/* Motion layers (on top) */}
          <div className="df-blueprint-grain" aria-hidden="true" />
          <div className="df-blueprint-scan" aria-hidden="true" />

          {/* Center stamp */}
          <span className="df-blueprint-stamp">SCANNING ARCHIVE · ENCRYPTED DATA LOCK</span>
        </div>

        <div className="df-blueprint-footer">
          <div className="df-blueprint-foot-cell">
            <strong>VAULT STATUS</strong><span>File Active · Encrypted</span>
          </div>
          <div className="df-blueprint-foot-cell">
            <strong>ACCESS LEVEL</strong><span>Private · Authorized Only</span>
          </div>
          <div className="df-blueprint-foot-cell">
            <strong>ARCHIVE SYSTEM</strong><span>Drew's Vault // DF-001</span>
          </div>
        </div>
      </section>
    </div>
  );
}
