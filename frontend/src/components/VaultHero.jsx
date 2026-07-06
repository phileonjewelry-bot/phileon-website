import { useEffect, useRef, useState } from "react";

/**
 * VaultHero — universal cinematic hero for every Inspiration Vault product page.
 *
 * Flow:
 *   1. Hero image renders immediately on first load (museum exhibition piece).
 *   2. After ~1.7s hold, if a hero-video is provided, smooth crossfade into the video.
 *   3. Video autoplays, muted, looped, no controls — pure ambient motion.
 *   4. If no video provided, gracefully falls back to image only (no empty container,
 *      no broken controls, no console errors).
 *
 * Sizing rules (apply to every current and future Vault product page):
 *   - object-fit: contain (entire artwork visible)
 *   - max-width: min(100%, 1200px) · max-height: 80vh
 *   - centered horizontally + vertically
 *   - generous black negative space
 *   - never crop, never zoom, never overflow viewport
 */
export default function VaultHero({ image, video = null, altText = "", eyebrow = null, title = null, subhead = null, prominent = false }) {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);

  // Trigger the image-to-video crossfade after a 1.7s hold (within the 1.5–2s spec window).
  useEffect(() => {
    if (!video) return;
    const t = setTimeout(() => setShowVideo(true), 1700);
    return () => clearTimeout(t);
  }, [video]);

  // Best-effort play kick (covers Safari/iOS where autoplay can be blocked until metadata).
  const onLoadedMetadata = (e) => {
    const el = e.currentTarget;
    el.play().catch(() => { /* graceful no-op — muted+playsInline normally handle this */ });
  };

  return (
    <section className={`iv-product-hero${prominent ? " iv-product-hero-prominent" : ""}`} data-testid="iv-product-hero">
      <style>{`
        .iv-product-hero {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 85vh;
          background: #000;
          overflow: hidden;
          padding: 4rem 2rem;
          position: relative;
          gap: clamp(28px, 3.6vw, 56px);
        }
        .iv-product-hero::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(85%, 1100px);
          height: 70%;
          transform: translate(-50%, -50%);
          background: radial-gradient(50% 50% at 50% 50%, rgba(200,162,74,.10) 0%, transparent 70%);
          filter: blur(70px);
          pointer-events: none;
          z-index: 0;
        }
        .iv-product-hero-stage {
          position: relative;
          width: 100%;
          max-width: 1200px;
          height: min(80vh, 78vh);
          margin: 0 auto;
          z-index: 1;
        }
        .iv-product-hero-image,
        .iv-product-hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          max-width: min(100%, 1200px);
          max-height: 80vh;
          object-fit: contain;
          object-position: center;
          display: block;
          margin: 0 auto;
          transition: opacity 1.4s cubic-bezier(.22,.61,.36,1);
        }
        .iv-product-hero-image {
          animation: ivHeroRise 1.4s cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes ivHeroRise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .iv-product-hero-media-shown   { opacity: 1; pointer-events: auto; }
        .iv-product-hero-media-hidden  { opacity: 0; pointer-events: none; }

        /* Prominent + square-optimized variant — opt-in per Vault page.
           Renders a strict 1:1 stage sized around 992px on a 1080p desktop
           viewport, which is roughly +18 percent linear over the standard
           1:1 rendering (842px) in the default hero. object-fit stays as
           contain on the media so no crop is possible; the square container
           clips only its own black background against the page background.
           Ignored unless the page passes the prominent flag as true. */
        .iv-product-hero-prominent { padding: 3rem 1.5rem; }
        .iv-product-hero-prominent .iv-product-hero-stage {
          width: min(92vh, 992px);
          height: min(92vh, 992px);
          max-width: min(92vh, 992px);
          aspect-ratio: 1 / 1;
        }
        .iv-product-hero-prominent .iv-product-hero-image,
        .iv-product-hero-prominent .iv-product-hero-video {
          width: 100%;
          height: 100%;
          max-width: none;
          max-height: none;
          object-fit: contain;
        }
        @media (max-width: 880px) {
          .iv-product-hero { min-height: 70vh; padding: 2.5rem 1.25rem; }
          .iv-product-hero-stage { height: min(60vh, 60vh); }
          .iv-product-hero-image,
          .iv-product-hero-video { max-height: 60vh; }
        }
        .iv-product-hero-titles {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 920px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(14px);
          animation: ivHeroTitleFade 1.4s cubic-bezier(.22,.61,.36,1) .2s forwards;
        }
        @keyframes ivHeroTitleFade {
          to { opacity: 1; transform: translateY(0); }
        }
        .iv-product-hero-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: .46em;
          color: #c8a24a;
          text-transform: uppercase;
          margin: 0 0 14px;
        }
        .iv-product-hero-title {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          font-size: clamp(40px, 6.2vw, 88px);
          line-height: .98;
          letter-spacing: .018em;
          color: #f4ede0;
          margin: 0 0 14px;
          text-transform: uppercase;
        }
        .iv-product-hero-subhead {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(18px, 1.9vw, 26px);
          color: #c8a24a;
          margin: 0;
          line-height: 1.45;
        }
        .iv-product-hero-scarcity {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 18px auto 0;
          padding: 7px 14px;
          border: 1px solid rgba(200,162,74,.32);
          font-family: 'Cinzel', serif;
          font-size: 10px;
          letter-spacing: .42em;
          color: rgba(200,162,74,.78);
          text-transform: uppercase;
          background: rgba(0,0,0,.35);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        .iv-product-hero-scarcity::before {
          content: '';
          width: 6px; height: 6px; border-radius: 50%;
          background: #c8a24a;
          box-shadow: 0 0 8px rgba(200,162,74,.6);
        }
        @media (prefers-reduced-motion: reduce) {
          .iv-product-hero-image { animation: none; }
          .iv-product-hero-image,
          .iv-product-hero-video { transition: none; }
        }
      `}</style>

      <div className="iv-product-hero-stage">
        <img
          src={image}
          alt={altText}
          className={`iv-product-hero-image ${showVideo ? 'iv-product-hero-media-hidden' : 'iv-product-hero-media-shown'}`}
          data-testid="iv-product-hero-image"
          decoding="async"
        />
        {video ? (
          <video
            ref={videoRef}
            src={video}
            className={`iv-product-hero-video ${showVideo ? 'iv-product-hero-media-shown' : 'iv-product-hero-media-hidden'}`}
            data-testid="iv-product-hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            poster={image}
            aria-hidden="true"
            onLoadedMetadata={onLoadedMetadata}
          />
        ) : null}
      </div>

      {(eyebrow || title || subhead) && (
        <div className="iv-product-hero-titles" data-testid="iv-product-hero-titles">
          {eyebrow && <p className="iv-product-hero-eyebrow" data-testid="iv-product-hero-eyebrow">{eyebrow}</p>}
          {title && <h1 className="iv-product-hero-title" data-testid="iv-product-hero-title">{title}</h1>}
          {subhead && <p className="iv-product-hero-subhead" data-testid="iv-product-hero-subhead">{subhead}</p>}
          <div>
            <span className="iv-product-hero-scarcity" data-testid="iv-product-hero-scarcity">
              Available until the Vault closes.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
