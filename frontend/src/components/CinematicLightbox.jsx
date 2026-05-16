import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * LA MADONNA — Cinematic Lightbox
 * Saint Laurent campaign archive × museum presentation.
 * No generic e-commerce modal behaviour. Quiet, restrained, expensive.
 */

const EASE = [0.22, 1, 0.36, 1];
const FADE = 0.45;

export default function Lightbox({ items, openIndex, onClose, onChange, archiveLabel = "ARCHIVE" }) {
  const isOpen = openIndex !== null;
  const total = items.length;
  const active = isOpen ? items[openIndex] : null;
  const isPortraitFocus = isOpen && (openIndex === total - 1 || openIndex === total - 2);

  const touchStartX = useRef(null);
  const [hoverHalf, setHoverHalf] = useState(null); // 'left' | 'right' | null

  const goPrev = useCallback(() => {
    if (openIndex === null) return;
    onChange((openIndex - 1 + total) % total);
  }, [openIndex, total, onChange]);

  const goNext = useCallback(() => {
    if (openIndex === null) return;
    onChange((openIndex + 1) % total);
  }, [openIndex, total, onChange]);

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, goPrev, goNext, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Preload neighbours for smooth crossfades
  useEffect(() => {
    if (!isOpen) return;
    const next = items[(openIndex + 1) % total];
    const prev = items[(openIndex - 1 + total) % total];
    [next, prev].forEach((it) => {
      if (it.type === "video") return; // browser handles video preload via element
      const img = new Image();
      img.src = it.src;
    });
  }, [isOpen, openIndex, items, total]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 48) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const counter = isOpen
    ? `${String(openIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
    : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="lm-lightbox-root"
          className="lm-lightbox"
          data-testid="la-madonna-lightbox"
          data-portrait-focus={isPortraitFocus ? "true" : "false"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE, ease: EASE }}
          onClick={(e) => {
            // Click outside the image closes
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <style>{`
            .lm-lightbox {
              position: fixed; inset: 0; z-index: 9999;
              background: #000000;
              display: flex; align-items: center; justify-content: center;
              padding: 24px;
              user-select: none;
              -webkit-tap-highlight-color: transparent;
            }
            .lm-lightbox-stage {
              position: relative;
              max-width: 82vw; max-height: 88vh;
              display: flex; align-items: center; justify-content: center;
            }
            @media (max-width: 768px) {
              .lm-lightbox { padding: 12px; }
              .lm-lightbox-stage { max-width: 96vw; max-height: 72vh; }
            }
            .lm-lightbox-img {
              max-width: 82vw; max-height: 88vh;
              width: auto; height: auto;
              object-fit: contain;
              display: block;
              pointer-events: none;
              image-rendering: -webkit-optimize-contrast;
            }
            @media (max-width: 768px) {
              .lm-lightbox-img { max-width: 96vw; max-height: 72vh; }
            }

            /* Click zones — invisible left/right halves with custom gold arrow cursors */
            .lm-lightbox-zone {
              position: absolute; top: 0; bottom: 0; width: 50%;
              z-index: 2; background: transparent;
              border: none;
              transition: opacity ${FADE}s cubic-bezier(0.22,1,0.36,1);
            }
            .lm-lightbox-zone--left  { left: 0; }
            .lm-lightbox-zone--right { right: 0; }
            @media (hover: hover) {
              .lm-lightbox-zone--left {
                cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><path d='M25 8 L11 20 L25 32' stroke='%23E6CFA8' stroke-width='1.4' fill='none' stroke-linecap='square'/></svg>") 8 20, w-resize;
              }
              .lm-lightbox-zone--right {
                cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><path d='M15 8 L29 20 L15 32' stroke='%23E6CFA8' stroke-width='1.4' fill='none' stroke-linecap='square'/></svg>") 32 20, e-resize;
              }
            }

            .lm-lightbox-chrome {
              position: fixed; left: 0; right: 0;
              display: flex; align-items: center; justify-content: space-between;
              padding: 22px 32px; z-index: 5;
              font-family: 'Cinzel', serif;
              font-size: 10.5px; letter-spacing: 0.36em;
              color: rgba(214,178,116,0.7);
              pointer-events: none;
              transition: opacity ${FADE}s cubic-bezier(0.22,1,0.36,1);
            }
            .lm-lightbox-chrome > * { pointer-events: auto; }
            .lm-lightbox-chrome--top { top: 0; }
            .lm-lightbox-chrome--bottom { bottom: 0; padding-bottom: 18px; }
            @media (max-width: 768px) {
              .lm-lightbox-chrome { padding: 16px 18px; }
            }

            /* Portrait focus: dim chrome but never hide it completely */
            .lm-lightbox[data-portrait-focus="true"] .lm-lightbox-chrome {
              opacity: 0.45;
            }
            .lm-lightbox[data-portrait-focus="true"] .lm-lightbox-chrome:hover {
              opacity: 1;
            }

            .lm-lightbox-close {
              background: transparent; border: 1px solid rgba(214,178,116,0.35);
              color: rgba(244,221,177,0.92);
              width: 36px; height: 36px; border-radius: 999px;
              display: inline-flex; align-items: center; justify-content: center;
              cursor: pointer;
              transition: background ${FADE}s ease, border-color ${FADE}s ease;
            }
            .lm-lightbox-close:hover {
              background: rgba(214,178,116,0.12);
              border-color: rgba(214,178,116,0.7);
            }

            .lm-lightbox-counter {
              font-variant-numeric: tabular-nums;
            }
            .lm-lightbox-eyebrow {
              color: rgba(214,178,116,0.55);
            }

            /* Archive tick progress indicator */
            .lm-lightbox-ticks {
              position: fixed; left: 50%; transform: translateX(-50%);
              bottom: 102px;
              z-index: 6;
              display: flex; align-items: center; gap: 8px;
              padding: 6px 8px;
              transition: opacity ${FADE}s cubic-bezier(0.22,1,0.36,1);
            }
            @media (max-width: 768px) {
              .lm-lightbox-ticks { bottom: 80px; }
            }
            .lm-lightbox[data-portrait-focus="true"] .lm-lightbox-ticks {
              opacity: 0.4;
            }
            .lm-lightbox[data-portrait-focus="true"] .lm-lightbox-ticks:hover {
              opacity: 1;
            }
            .lm-lightbox-tick {
              padding: 6px 0;
              background: transparent; border: none; cursor: pointer;
              display: inline-flex; align-items: center;
            }
            .lm-lightbox-tick::after {
              content: "";
              display: block;
              width: 10px; height: 1px;
              background: rgba(212, 175, 55, 0.45);
              opacity: 0.22;
              transition:
                width 200ms ease,
                opacity 200ms ease,
                background-color 200ms ease;
            }
            .lm-lightbox-tick[aria-current="true"]::after {
              width: 26px;
              background: rgba(245, 214, 142, 0.95);
              opacity: 1;
            }

            /* Bottom thumbnail strip */
            .lm-lightbox-strip {
              position: fixed; left: 0; right: 0; bottom: 28px;
              z-index: 6;
              display: flex; gap: 8px;
              justify-content: center; align-items: center;
              padding: 0 32px;
              transition: opacity ${FADE}s cubic-bezier(0.22,1,0.36,1);
            }
            @media (max-width: 768px) {
              .lm-lightbox-strip {
                bottom: 16px;
                justify-content: flex-start;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
                padding: 0 14px;
              }
              .lm-lightbox-strip::-webkit-scrollbar { display: none; }
            }
            .lm-lightbox[data-portrait-focus="true"] .lm-lightbox-strip {
              opacity: 0.4;
            }
            .lm-lightbox[data-portrait-focus="true"] .lm-lightbox-strip:hover {
              opacity: 1;
            }
            .lm-lightbox-strip button {
              flex: 0 0 auto;
              width: 56px; height: 56px;
              padding: 0; background: #050505; border: 1px solid transparent;
              cursor: pointer; opacity: 0.4;
              transition: opacity ${FADE}s cubic-bezier(0.22,1,0.36,1),
                          border-color ${FADE}s cubic-bezier(0.22,1,0.36,1);
              scroll-snap-align: center;
              overflow: hidden;
            }
            .lm-lightbox-strip button:hover { opacity: 0.85; }
            .lm-lightbox-strip button[aria-current="true"] {
              opacity: 1;
              border-color: rgba(214,178,116,0.7);
            }
            .lm-lightbox-strip img {
              width: 100%; height: 100%;
              object-fit: cover; object-position: center;
              display: block;
            }
            @media (max-width: 768px) {
              .lm-lightbox-strip button { width: 48px; height: 48px; }
            }

            @media (prefers-reduced-motion: reduce) {
              .lm-lightbox, .lm-lightbox-img, .lm-lightbox-chrome, .lm-lightbox-strip,
              .lm-lightbox-strip button, .lm-lightbox-ticks, .lm-lightbox-tick::after {
                transition: none !important;
              }
            }
          `}</style>

          {/* TOP CHROME — counter + close */}
          <div className="lm-lightbox-chrome lm-lightbox-chrome--top" aria-hidden={false}>
            <span className="lm-lightbox-eyebrow" data-testid="la-madonna-lightbox-eyebrow">
              {archiveLabel}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close viewing room"
              className="lm-lightbox-close"
              data-testid="la-madonna-lightbox-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* IMAGE STAGE */}
          <div
            className="lm-lightbox-stage"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const half = e.clientX - r.left < r.width / 2 ? "left" : "right";
              if (half !== hoverHalf) setHoverHalf(half);
            }}
            onMouseLeave={() => setHoverHalf(null)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {active.type === "video" ? (
                <motion.video
                  key={active.src}
                  src={active.src}
                  poster={active.poster}
                  className="lm-lightbox-img"
                  data-testid="la-madonna-lightbox-img"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: FADE, ease: EASE }}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                />
              ) : (
                <motion.img
                  key={active.src}
                  src={active.src}
                  alt={active.alt}
                  className="lm-lightbox-img"
                  data-testid="la-madonna-lightbox-img"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: FADE, ease: EASE }}
                  draggable={false}
                />
              )}
            </AnimatePresence>

            {/* Click zones with gold arrow cursors */}
            <button
              type="button"
              className="lm-lightbox-zone lm-lightbox-zone--left"
              aria-label="Previous image"
              onClick={goPrev}
              data-testid="la-madonna-lightbox-prev"
            />
            <button
              type="button"
              className="lm-lightbox-zone lm-lightbox-zone--right"
              aria-label="Next image"
              onClick={goNext}
              data-testid="la-madonna-lightbox-next"
            />
          </div>

          {/* BOTTOM CHROME — counter + slot label */}
          <div className="lm-lightbox-chrome lm-lightbox-chrome--bottom">
            <span className="lm-lightbox-eyebrow" data-testid="la-madonna-lightbox-slot-label">
              {active.label}
            </span>
            <span className="lm-lightbox-counter" data-testid="la-madonna-lightbox-counter">
              {counter}
            </span>
          </div>

          {/* ARCHIVE TICK INDEX */}
          <div
            className="lm-lightbox-ticks"
            data-testid="la-madonna-lightbox-ticks"
            onClick={(e) => e.stopPropagation()}
            role="tablist"
            aria-label="Archive index"
          >
            {items.map((_, i) => (
              <button
                key={`tick-${i}`}
                type="button"
                className="lm-lightbox-tick"
                aria-label={`View image ${i + 1}`}
                aria-current={i === openIndex ? "true" : "false"}
                onClick={() => onChange(i)}
                data-testid={`la-madonna-lightbox-tick-${i + 1}`}
              />
            ))}
          </div>

          {/* THUMBNAIL STRIP */}
          <div
            className="lm-lightbox-strip"
            data-testid="la-madonna-lightbox-strip"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((it, i) => (
              <button
                key={it.src}
                type="button"
                aria-label={it.label}
                aria-current={i === openIndex ? "true" : "false"}
                onClick={() => onChange(i)}
                data-testid={`la-madonna-lightbox-thumb-${i + 1}`}
              >
                <img src={it.poster || it.src} alt="" loading="eager" decoding="async" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
