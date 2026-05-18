import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import Lightbox from "../components/CinematicLightbox";

/**
 * LA SCARPA DELLA REGINA — Full Editorial Product Page
 *
 * "La corona fu data. La scarpa fu guadagnata."
 * "The crown was given. The shoe was earned."
 *
 * PHILEON Signature Objects · $9,000 USD (internal: $12,000 CAD).
 * Rose-silk regal palette. Cormorant Garamond italics. Bright luxury
 * editorial. Single CinematicLightbox shared with LA MADONNA / BAPE.
 *
 * Namespace: .scarpa-  (no class bleed)
 */

const GALLERY = [
  { src: "/la-scarpa/scarpa-portrait.jpg",         label: "01 — CAMPAIGN",       alt: "LA SCARPA DELLA REGINA — campaign portrait, model wearing the rose-gold stiletto pendant in baroque diamond frame" },
  { src: "/la-scarpa/scarpa-08-in-hand.png",       label: "02 — INTIMACY",       alt: "LA SCARPA — pendant cradled in a manicured hand against ivory silk" },
  { src: "/la-scarpa/scarpa-04-velvet-box.png",    label: "03 — ARCHIVE OBJECT", alt: "LA SCARPA — pendant on velvet presentation tray" },
  { src: "/la-scarpa/scarpa-02-marble.png",        label: "04 — LIFESTYLE",      alt: "LA SCARPA — pendant on Carrara marble" },
  { src: "/la-scarpa/scarpa-03-glass-table.png",   label: "05 — REFLECTION",     alt: "LA SCARPA — pendant on glass surface, mirrored reflection" },
  { src: "/la-scarpa/scarpa-pendant.png",          label: "06 — FRAME",          alt: "LA SCARPA — rose-gold stiletto pendant in baroque diamond frame, front detail" },
  { src: "/la-scarpa/scarpa-05-heel-macro.png",    label: "07 — DETAIL",         alt: "LA SCARPA — macro of the sculpted stiletto heel and diamond field" },
  { src: "/la-scarpa/scarpa-01-three-quarter.png", label: "08 — PROFILE",        alt: "LA SCARPA — pendant three-quarter side angle" },
  { src: "/la-scarpa/scarpa-09-la-regina.png",     label: "09 — LA REGINA",      alt: "LA SCARPA — owner in emerald silk holding the pendant within a vanity-room interior" },
];

const PRICE_USD = 9000;

const EDITORIAL_BLOCKS = [
  {
    title: "COMPOSITION",
    body:
      "La Scarpa della Regina transforms a symbol of elegance into a framed object of permanence. Sculpted in 18K rose gold and suspended within an ornamental architectural border, the pendant merges couture femininity with collectible design.",
  },
  {
    title: "STRUCTURE",
    body:
      "The silhouette is suspended against a hand-set diamond field designed to mimic cut crystal reflections. The framed composition creates the feeling of a preserved icon — less accessory, more artifact.",
  },
  {
    title: "CRAFT",
    body:
      "Every surface is mirror-polished to amplify the liquid warmth of rose gold. The stiletto form is intentionally elongated and tensioned, creating a sculptural balance between delicacy and precision.",
  },
];

const FINAL_WORD = "Every great room has a woman in it worth remembering.";

const SPECS = [
  { label: "METAL",        value: "18K Rose Gold" },
  { label: "STONES",       value: "Hand-set diamond field · 0.85ct total" },
  { label: "WEIGHT",       value: "Approx. 15.5g gold weight" },
  { label: "CONSTRUCTION", value: "Mirror-polished sculptural stiletto suspended within ornamental architectural frame." },
  { label: "PRODUCTION",   value: "Made to order · individually finished by hand." },
  { label: "LEAD TIME",    value: "4–6 weeks" },
];

const INCLUDED = [
  "Complimentary insured worldwide shipping",
  "Couture presentation packaging",
  "Certificate of authenticity",
  "Private client handling",
];

export default function LaScarpaPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const galleryRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  // Force hero video to autoplay + loop reliably across mobile browsers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    let cancelled = false;
    const attemptPlay = () => {
      if (cancelled) return;
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Browser blocked autoplay — retry on next user interaction
          // eslint-disable-next-line no-console
          // console.log("autoplay blocked, will retry on interaction");
        });
      }
    };

    // 1. Try immediately
    attemptPlay();
    // 2. Try once metadata loads (some mobile browsers ignore the autoplay
    //    attribute if the file hasn't initialised yet).
    const onMeta = () => attemptPlay();
    // 3. If anything pauses the video that wasn't user-initiated, restart.
    const onPause = () => {
      if (!video.ended) attemptPlay();
    };
    // 4. Defensive loop — covers browsers that strip native `loop`.
    const onEnded = () => {
      video.currentTime = 0;
      attemptPlay();
    };
    // 5. Retry on first user interaction (iOS low-power mode safety net).
    const onUserGesture = () => {
      attemptPlay();
      document.removeEventListener("touchstart", onUserGesture);
      document.removeEventListener("click", onUserGesture);
    };

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    document.addEventListener("touchstart", onUserGesture, { passive: true });
    document.addEventListener("click", onUserGesture);

    // Watchdog — every 1.5s, if the video is paused mid-stream, restart it.
    const watchdog = window.setInterval(() => {
      if (!cancelled && video.paused && !video.ended) attemptPlay();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(watchdog);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      document.removeEventListener("touchstart", onUserGesture);
      document.removeEventListener("click", onUserGesture);
    };
  }, []);

  // Reveal observer for editorial sections
  useEffect(() => {
    const els = document.querySelectorAll(".scarpa-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.18 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "la-scarpa-della-regina",
      name: "LA SCARPA DELLA REGINA",
      price: PRICE_USD,
      productKey: "la-scarpa-della-regina",
      tierKey: "18k-rose",
      metal: "18K Rose Gold",
      quantity: 1,
      image: GALLERY[0].src,
    });
  };

  const formattedPrice = `$${PRICE_USD.toLocaleString("en-US")} USD`;

  return (
    <section
      className={`scarpa-room${isMounted ? " scarpa-loaded" : ""}`}
      data-page="la-scarpa"
      data-testid="la-scarpa-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .scarpa-room {
          position: relative;
          background: #f6f1eb;
          overflow: hidden;
          opacity: 0;
          transition: opacity 900ms ease;
        }
        .scarpa-room.scarpa-loaded { opacity: 1; }

        .scarpa-reveal { opacity: 0; transform: translateY(18px); transition: opacity 1100ms ease, transform 1100ms ease; }
        .scarpa-reveal.visible { opacity: 1; transform: translateY(0); }

        .scarpa-cormorant { font-family: 'Cormorant Garamond', serif; }
        .scarpa-cinzel    { font-family: 'Cinzel', serif; }
        .scarpa-inter     { font-family: 'Inter', sans-serif; }

        .scarpa-back {
          position: absolute; top: 28px; left: 28px; z-index: 30;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 11px;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(255, 246, 240, 0.78);
          text-decoration: none;
          mix-blend-mode: difference;
          transition: color 320ms ease, opacity 320ms ease;
        }
        .scarpa-back:hover { color: rgba(255, 246, 240, 0.98); }

        /* ─── HERO — CINEMATIC VIDEO ──────────────────────── */
        .scarpa-hero-video {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #0a0606;
        }
        .scarpa-hero-video-el {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          z-index: 1;
        }
        /* Soft cinematic grain (SVG noise, very low opacity) */
        .scarpa-hero-grain {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          opacity: 0.13;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95  0 0 0 0 0.86  0 0 0 0 0.72  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          background-size: 240px 240px;
        }
        /* Warm champagne bloom — top-right corner */
        .scarpa-hero-bloom {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background:
            radial-gradient(circle at 75% 18%, rgba(245, 214, 153, 0.18), transparent 55%),
            radial-gradient(circle at 18% 80%, rgba(212, 174, 145, 0.12), transparent 60%);
          mix-blend-mode: soft-light;
        }
        /* Subtle vignette for editorial weight */
        .scarpa-hero-vignette {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background:
            radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.32) 100%),
            linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 22%, transparent 70%, rgba(0,0,0,0.35) 100%);
        }

        /* ─── HERO TEXT OVERLAYS ──────────────────────────── */
        .scarpa-hero-eyebrow {
          position: absolute;
          top: 44px;
          left: 44px;
          z-index: 10;
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: rgba(255, 246, 240, 0.82);
          text-shadow: 0 1px 12px rgba(0,0,0,0.45);
        }

        .scarpa-hero-center {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 32px;
          pointer-events: none;
        }
        .scarpa-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(2.2rem, 6vw, 5.4rem);
          line-height: 1.02;
          letter-spacing: 0.04em;
          color: #fff6f0;
          text-transform: uppercase;
          text-shadow: 0 2px 28px rgba(0,0,0,0.45);
          margin: 0;
          max-width: 22ch;
        }
        .scarpa-hero-sub {
          margin-top: 22px;
          font-family: 'Inter', sans-serif;
          font-size: 0.74rem;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: rgba(255, 246, 240, 0.78);
          text-shadow: 0 1px 14px rgba(0,0,0,0.45);
        }
        .scarpa-hero-rule {
          width: 0;
          height: 1px;
          margin: 30px auto 30px;
          background: linear-gradient(90deg,
            rgba(212, 168, 92, 0) 0%,
            rgba(245, 214, 153, 0.85) 50%,
            rgba(212, 168, 92, 0) 100%
          );
          animation: scarpaHeroRule 3.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 1.65s;
        }
        @keyframes scarpaHeroRule {
          from { width: 0;     opacity: 0; }
          to   { width: 180px; opacity: 1; }
        }
        .scarpa-hero-statement {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1rem, 1.5vw, 1.4rem);
          line-height: 1.55;
          color: rgba(255, 246, 240, 0.88);
          text-shadow: 0 1px 18px rgba(0,0,0,0.5);
          margin: 0;
          max-width: 540px;
        }
        .scarpa-hero-stamp {
          position: absolute;
          bottom: 44px;
          right: 44px;
          z-index: 10;
          font-family: 'Inter', sans-serif;
          font-size: 9.5px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: rgba(255, 246, 240, 0.62);
          text-shadow: 0 1px 12px rgba(0,0,0,0.5);
        }

        /* ─── HERO FADE SEQUENCE ──────────────────────────── */
        .scarpa-hero-fade {
          opacity: 0;
          animation: scarpaHeroFade 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes scarpaHeroFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .scarpa-hero-fade-1 { animation-delay: 0.45s; }
        .scarpa-hero-fade-2 { animation-delay: 0.9s;  }
        .scarpa-hero-fade-3 { animation-delay: 1.4s;  }
        .scarpa-hero-fade-4 { animation-delay: 2.0s;  }

        @media (max-width: 768px) {
          .scarpa-hero-video {
            position: relative;
            height: 46vh !important;
            min-height: 420px !important;
            max-height: 520px !important;
            overflow: hidden;
          }
          .scarpa-hero-video-el {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            transform: scale(1.12);
          }
          .scarpa-hero-center {
            justify-content: center !important;
            padding-top: 20px !important;
            padding-bottom: 20px !important;
          }
          .scarpa-hero-eyebrow  { top: 76px; left: 22px; font-size: 9.5px; letter-spacing: 0.4em; }
          .scarpa-hero-stamp    { bottom: 18px; right: 22px; font-size: 8.5px; letter-spacing: 0.38em; }
          .scarpa-hero-title {
            font-size: clamp(2.4rem, 9.5vw, 4rem) !important;
            line-height: 0.9 !important;
            letter-spacing: -0.03em !important;
            margin-bottom: 14px !important;
            max-width: 14ch;
          }
          .scarpa-hero-sub {
            font-size: 0.78rem !important;
            letter-spacing: 0.34em !important;
            margin-bottom: 16px !important;
            margin-top: 0 !important;
          }
          .scarpa-hero-rule { margin: 0 auto 10px; }
          .scarpa-hero-statement {
            font-size: 1rem !important;
            line-height: 1.55 !important;
            max-width: 280px;
            margin-inline: auto;
            margin-top: 4px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .scarpa-hero-fade { opacity: 1 !important; animation: none !important; }
          .scarpa-hero-rule { width: 180px; opacity: 1; animation: none !important; }
        }

        /* ─── HERO STACK ──────────────────────────────────── */
        .scarpa-hero-cta {
          margin-top: 56px;
          display: flex; flex-direction: column; align-items: flex-start;
          gap: 14px;
        }
        .scarpa-hero-price {
          font-family: 'Cinzel', serif;
          font-size: clamp(1.05rem, 1.4vw, 1.35rem);
          letter-spacing: 0.32em;
          color: #5f2e2e;
        }
        .scarpa-hero-leadtime {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(95, 46, 46, 0.55);
        }
        .scarpa-cta-btn {
          margin-top: 8px;
          padding: 18px 56px;
          background: #5f2e2e;
          color: #f6e4e2;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, transform 320ms ease, letter-spacing 320ms ease;
        }
        .scarpa-cta-btn:hover {
          background: #4a2222;
          letter-spacing: 0.48em;
        }
        .scarpa-cta-btn:disabled { opacity: 0.55; cursor: default; }

        /* ─── EDITORIAL BLOCKS ────────────────────────────── */
        .scarpa-editorial {
          position: relative; z-index: 10;
          padding: 120px 24px 100px;
          background:
            radial-gradient(circle at 20% 30%, rgba(244, 214, 216, 0.45), transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(232, 182, 187, 0.4), transparent 55%),
            #faf3ed;
        }
        .scarpa-editorial-grid {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          column-gap: 80px; row-gap: 70px;
        }
        .scarpa-editorial-block .scarpa-block-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px; letter-spacing: 0.48em;
          color: rgba(95, 46, 46, 0.7);
          text-transform: uppercase;
          margin-bottom: 22px;
          display: inline-block;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(95, 46, 46, 0.18);
        }
        .scarpa-editorial-block .scarpa-block-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.25vw, 1.3rem);
          line-height: 1.7;
          color: rgba(67, 33, 30, 0.88);
          font-style: italic;
        }

        /* ─── ARCHIVE — HORIZONTAL SWIPE SLIDER ───────────── */
        .scarpa-archive-slider-section {
          width: 100%;
          padding: 110px 0 130px;
          background: #f6f1eb;
          overflow: hidden;
        }
        .scarpa-archive-header {
          padding: 0 24px 34px;
          text-align: center;
        }
        .scarpa-archive-header span {
          display: block;
          margin-bottom: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 0.76rem;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(92, 48, 47, 0.62);
        }
        .scarpa-archive-header p {
          margin: 0;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.5rem, 3vw, 2.6rem);
          font-style: italic;
          color: #5f2e2e;
        }
        .scarpa-archive-slider {
          display: flex;
          gap: 22px;
          overflow-x: auto;
          overscroll-behavior-x: contain;
          scroll-snap-type: x mandatory;
          scroll-padding-left: 24px;
          padding: 0 24px 22px;
          -webkit-overflow-scrolling: touch;
        }
        .scarpa-archive-slider::-webkit-scrollbar { height: 4px; }
        .scarpa-archive-slider::-webkit-scrollbar-track {
          background: rgba(95, 46, 46, 0.08);
        }
        .scarpa-archive-slider::-webkit-scrollbar-thumb {
          background: rgba(137, 83, 75, 0.45);
          border-radius: 999px;
        }
        .scarpa-archive-slide {
          position: relative;
          flex: 0 0 min(78vw, 460px);
          aspect-ratio: 4 / 5;
          border: 1px solid rgba(137, 83, 75, 0.22);
          border-radius: 24px;
          overflow: hidden;
          padding: 0;
          background: #1c0d0f;
          cursor: pointer;
          scroll-snap-align: center;
          box-shadow: 0 28px 80px rgba(73, 34, 31, 0.14);
        }
        .scarpa-archive-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.01);
          transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1),
                      filter 900ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .scarpa-archive-slide:hover img {
          transform: scale(1.045);
          filter: brightness(1.04) saturate(1.04);
        }
        .scarpa-slide-label {
          position: absolute;
          left: 18px; right: 18px; bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 16px;
          border: 1px solid rgba(245, 214, 153, 0.22);
          border-radius: 999px;
          background: rgba(30, 12, 14, 0.48);
          backdrop-filter: blur(14px);
        }
        .scarpa-slide-label span,
        .scarpa-slide-label p {
          margin: 0;
          font-family: 'Inter', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(255, 246, 240, 0.78);
        }
        @media (max-width: 768px) {
          .scarpa-archive-slider-section { padding: 82px 0 96px; }
          .scarpa-archive-slider {
            gap: 16px;
            padding: 0 18px 20px;
            scroll-padding-left: 18px;
          }
          .scarpa-archive-slide { flex-basis: 82vw; border-radius: 20px; }
          .scarpa-slide-label {
            left: 12px; right: 12px; bottom: 12px;
            padding: 12px 14px;
          }
        }

        /* ─── SPEC BLOCK ─────────────────────────────────── */
        .scarpa-spec {
          padding: 120px 24px;
          background: #faf3ed;
        }
        .scarpa-spec-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px;
        }
        @media (max-width: 900px) { .scarpa-spec-inner { grid-template-columns: 1fr; gap: 60px; } }
        .scarpa-section-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px; letter-spacing: 0.5em;
          color: rgba(95, 46, 46, 0.7);
          text-transform: uppercase;
        }
        .scarpa-spec-table { margin-top: 32px; }
        .scarpa-spec-row {
          padding: 20px 0;
          border-bottom: 1px solid rgba(95, 46, 46, 0.12);
        }
        .scarpa-spec-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px; letter-spacing: 0.42em;
          color: rgba(95, 46, 46, 0.55);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .scarpa-spec-value {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1rem, 1.15vw, 1.18rem);
          color: rgba(67, 33, 30, 0.88);
          line-height: 1.55;
        }

        /* ─── ACQUIRE BLOCK ──────────────────────────────── */
        .scarpa-acquire {
          padding: 120px 24px 100px;
          background:
            radial-gradient(circle at 50% 100%, rgba(212, 154, 164, 0.4), transparent 65%),
            #f6f1eb;
          text-align: center;
        }
        .scarpa-acquire-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3vw, 2.8rem);
          color: #5f2e2e;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .scarpa-acquire-price {
          margin-top: 18px;
          font-family: 'Cinzel', serif;
          font-size: clamp(1.1rem, 1.45vw, 1.4rem);
          letter-spacing: 0.32em;
          color: #5f2e2e;
        }
        .scarpa-acquire-lead {
          margin-top: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 11px; letter-spacing: 0.32em;
          color: rgba(95, 46, 46, 0.6);
          text-transform: uppercase;
        }

        /* ─── FINAL WORD ─────────────────────────────────── */
        .scarpa-final-word {
          position: relative;
          background: linear-gradient(180deg, #4a1f24 0%, #341317 100%);
          padding: 180px 24px;
          overflow: hidden;
        }
        .scarpa-final-word-inner {
          max-width: 980px;
          margin: 0 auto;
          text-align: center;
        }
        .scarpa-final-eyebrow {
          display: block;
          margin-bottom: 32px;
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: rgba(255, 240, 228, 0.68);
        }
        .scarpa-final-text {
          margin: 0 auto;
          max-width: 760px;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.4rem, 5vw, 4.8rem);
          line-height: 1.08;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: #fff6f0;
        }
        .scarpa-signature-line {
          width: 0%;
          height: 1px;
          margin: 54px auto 0 auto;
          background: linear-gradient(
            90deg,
            rgba(212, 168, 92, 0) 0%,
            rgba(245, 214, 153, 0.95) 50%,
            rgba(212, 168, 92, 0) 100%
          );
          animation: scarpaSignatureDraw 3.5s ease-out forwards;
          animation-delay: 0.45s;
        }
        @keyframes scarpaSignatureDraw {
          from { width: 0%;   opacity: 0; }
          to   { width: 240px; opacity: 1; }
        }

        @media (max-width: 900px) {
          .scarpa-editorial-grid { grid-template-columns: 1fr; gap: 60px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .scarpa-archive-cell img { transition: none !important; }
        }

        /* ─── FINAL MOBILE HERO LOCK ────────────────────────
           Highest-specificity override. Must remain at the very
           bottom of the stylesheet so it wins the cascade. */
        @media (max-width: 1024px) {
          section.scarpa-hero.scarpa-hero-compact {
            height: 320px !important;
            min-height: 320px !important;
            max-height: 320px !important;
            overflow: hidden !important;
            position: relative !important;
          }
          section.scarpa-hero.scarpa-hero-compact video,
          section.scarpa-hero.scarpa-hero-compact .scarpa-hero-video-el,
          section.scarpa-hero.scarpa-hero-compact .hero-video,
          section.scarpa-hero.scarpa-hero-compact img {
            height: 320px !important;
            width: 100% !important;
            object-fit: cover !important;
            object-position: center center !important;
            transform: scale(1.02) !important;
            inset: 0 !important;
          }
          section.scarpa-hero.scarpa-hero-compact .hero-content,
          section.scarpa-hero.scarpa-hero-compact .scarpa-hero-content,
          section.scarpa-hero.scarpa-hero-compact .scarpa-hero-center {
            height: 320px !important;
            min-height: 320px !important;
            max-height: 320px !important;
            padding: 56px 18px 20px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
          }
          section.scarpa-hero.scarpa-hero-compact h1,
          section.scarpa-hero.scarpa-hero-compact .hero-title,
          section.scarpa-hero.scarpa-hero-compact .scarpa-hero-title {
            font-size: clamp(1.8rem, 7vw, 2.7rem) !important;
            line-height: 0.9 !important;
            letter-spacing: -0.03em !important;
            margin-bottom: 10px !important;
            max-width: 260px !important;
          }
          section.scarpa-hero.scarpa-hero-compact .hero-subtitle,
          section.scarpa-hero.scarpa-hero-compact .scarpa-hero-subtitle,
          section.scarpa-hero.scarpa-hero-compact .scarpa-hero-sub {
            font-size: 0.6rem !important;
            letter-spacing: 0.28em !important;
          }
          section.scarpa-hero.scarpa-hero-compact .hero-statement,
          section.scarpa-hero.scarpa-hero-compact .scarpa-hero-statement {
            font-size: 0.85rem !important;
            line-height: 1.4 !important;
            margin-top: 10px !important;
            max-width: 260px !important;
          }
        }
      `}</style>

      <Link to="/shop?category=pendants&audience=ladies" className="scarpa-back" data-testid="la-scarpa-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── HERO — CINEMATIC VIDEO ─────────────────────────── */}
      <section className="scarpa-hero scarpa-hero-compact scarpa-hero-video" data-testid="la-scarpa-hero">
        <video
          ref={videoRef}
          className="scarpa-hero-video-el"
          src="/videos/la-scarpa-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5"
          disablePictureInPicture
          aria-hidden="true"
          data-testid="la-scarpa-hero-video"
        />

        {/* Cinematic atmosphere — grain · bloom · vignette */}
        <div className="scarpa-hero-grain" aria-hidden="true" />
        <div className="scarpa-hero-bloom" aria-hidden="true" />
        <div className="scarpa-hero-vignette" aria-hidden="true" />

        {/* Top-left — house mark */}
        <span className="scarpa-hero-eyebrow scarpa-hero-fade scarpa-hero-fade-1" data-testid="la-scarpa-eyebrow">
          PHILEON SIGNATURE OBJECTS
        </span>

        {/* Centered editorial stack */}
        <div className="scarpa-hero-center">
          <h1
            className="scarpa-hero-title scarpa-hero-fade scarpa-hero-fade-2"
            data-testid="la-scarpa-title"
          >
            LA SCARPA DELLA REGINA
          </h1>
          <p className="scarpa-hero-sub scarpa-hero-fade scarpa-hero-fade-3" data-testid="la-scarpa-subtitle">
            THE QUEEN'S SHOE
          </p>

          <div className="scarpa-hero-rule scarpa-hero-fade scarpa-hero-fade-3" aria-hidden="true" />

          <p className="scarpa-hero-statement scarpa-hero-fade scarpa-hero-fade-4" data-testid="la-scarpa-statement">
            She does not ask for the room.
            <br />
            The room rearranges itself.
          </p>
        </div>

        {/* Bottom-right — transmission stamp */}
        <span className="scarpa-hero-stamp scarpa-hero-fade scarpa-hero-fade-4" data-testid="la-scarpa-transmission">
          PHILEON PRIVATE TRANSMISSION
        </span>
      </section>

      {/* ─── ARCHIVE — HORIZONTAL SWIPE SLIDER ─────────────── */}
      <section className="scarpa-archive-slider-section scarpa-reveal" data-testid="la-scarpa-archive" ref={galleryRef}>
        <div className="scarpa-archive-header">
          <span>THE ARCHIVE</span>
          <p>Nine frames. One artifact.</p>
        </div>

        <div className="scarpa-archive-slider" aria-label="LA SCARPA gallery slider" data-testid="la-scarpa-archive-grid">
          {GALLERY.map((g, i) => (
            <button
              key={g.src}
              type="button"
              className="scarpa-archive-slide"
              onClick={() => setLightboxIdx(i)}
              aria-label={`Open ${g.label}`}
              data-testid={`la-scarpa-archive-cell-${i + 1}`}
            >
              <img
                src={g.src}
                alt={g.alt}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <div className="scarpa-slide-label">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{g.label.split("—")[1]?.trim() || g.label}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─── CINEMATIC LIGHTBOX ────────────────────────────── */}
      <Lightbox
        items={GALLERY}
        openIndex={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onChange={(i) => setLightboxIdx(i)}
        archiveLabel="LA SCARPA · ARCHIVE"
      />

      {/* ─── EDITORIAL BLOCKS ──────────────────────────────── */}
      <section className="scarpa-editorial scarpa-reveal" data-testid="la-scarpa-editorial">
        <div className="scarpa-editorial-grid">
          {EDITORIAL_BLOCKS.map((b) => (
            <div
              key={b.title}
              className="scarpa-editorial-block"
              data-testid={`la-scarpa-editorial-${b.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <p className="scarpa-block-eyebrow">{b.title}</p>
              <p className="scarpa-block-body">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SPECIFICATIONS ────────────────────────────────── */}
      <section className="scarpa-spec scarpa-reveal" data-testid="la-scarpa-spec">
        <div className="scarpa-spec-inner">
          <div>
            <p className="scarpa-section-eyebrow">SPECIFICATION</p>
            <div className="scarpa-spec-table">
              {SPECS.map((s) => (
                <div
                  key={s.label}
                  className="scarpa-spec-row"
                  data-testid={`la-scarpa-spec-${s.label.toLowerCase()}`}
                >
                  <p className="scarpa-spec-label">{s.label}</p>
                  <p className="scarpa-spec-value">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="scarpa-section-eyebrow">INCLUDED WITH ACQUISITION</p>
            <ul
              style={{
                marginTop: 32, padding: 0, listStyle: "none",
                display: "flex", flexDirection: "column", gap: 18,
              }}
            >
              {INCLUDED.map((line) => (
                <li
                  key={line}
                  className="scarpa-cormorant"
                  style={{
                    fontSize: "clamp(15px, 1.15vw, 18px)",
                    color: "rgba(67, 33, 30, 0.85)",
                    fontStyle: "italic", fontWeight: 300,
                    paddingBottom: 14,
                    borderBottom: "1px solid rgba(95, 46, 46, 0.12)",
                  }}
                >
                  {line}
                </li>
              ))}
            </ul>
            <p
              className="scarpa-cormorant"
              style={{
                marginTop: 36, fontSize: 14, fontStyle: "italic",
                color: "rgba(95, 46, 46, 0.55)", lineHeight: 1.7,
              }}
            >
              Acquisitions are processed privately. A member of our atelier
              will follow up to confirm specifications and finalise delivery.
            </p>
          </div>
        </div>
      </section>

      {/* ─── ACQUIRE BLOCK ─────────────────────────────────── */}
      <section className="scarpa-acquire scarpa-reveal" data-testid="la-scarpa-acquire">
        <p className="scarpa-section-eyebrow">ACQUISITION</p>
        <h2 className="scarpa-acquire-title" data-testid="la-scarpa-acquire-title" style={{ marginTop: 24 }}>
          LA SCARPA DELLA REGINA
        </h2>
        <p className="scarpa-acquire-price" data-testid="la-scarpa-price">{formattedPrice}</p>
        <p className="scarpa-acquire-lead">Made to order · 4–6 weeks · Complimentary insured worldwide shipping</p>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isAdding}
          className="scarpa-cta-btn"
          style={{ marginTop: 36 }}
          data-testid="la-scarpa-begin-commission-btn"
        >
          {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
        </button>
      </section>

      {/* ─── FINAL WORD — closer ───────────────────────────── */}
      <section className="scarpa-final-word scarpa-reveal" data-testid="la-scarpa-final-word">
        <div className="scarpa-final-word-inner">
          <span className="scarpa-final-eyebrow" data-testid="la-scarpa-final-word-eyebrow">
            FINAL WORD
          </span>
          <h2 className="scarpa-final-text" data-testid="la-scarpa-final-word-body">
            {FINAL_WORD}
          </h2>
          <div className="scarpa-signature-line" aria-hidden="true" />
        </div>
      </section>

      {/* Bottom shimmer */}
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#c58c84] to-transparent opacity-60 pointer-events-none" aria-hidden="true" />
    </section>
  );
}
