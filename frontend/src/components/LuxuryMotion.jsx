import { useEffect } from "react";

/**
 * LuxuryMotion — the PHILEON shared motion system (lm-*).
 *
 * Per BLUEPRINT.md: "Quiet motion over loud animation. Reusable architecture
 * over one-off solutions." This module is the canonical implementation. Any
 * new page that wants museum-quality motion should:
 *
 *   1. Render <LuxuryMotionStyles /> once near the top of its JSX.
 *   2. Call useLuxuryMotionObserver() in the component body.
 *   3. Apply these classes to elements that should animate:
 *        .lm-hero-media          → slow 16s drift on the hero image/video
 *        .lm-reveal              → opacity-0 + translateY-8px, fades on viewport entry
 *        .lm-reveal.lm-delay-1   → +200ms transition-delay (stack 1/2/3/4)
 *        .lm-section             → opacity-0 + translateY-20px (section-level)
 *        .lm-gallery-item        → scroll-snap activation pattern (use with a parent
 *                                  carrying [data-lm-gallery-scroller])
 *        .lm-cell-reveal         → subtle 800ms fade + 6px lift for gallery cells,
 *                                  pair with .lm-stagger-1..9 for sequential entry
 *                                  (100ms between cells). Opt-in per page.
 *
 * All effects are auto-disabled when prefers-reduced-motion is reduce.
 */

export function LuxuryMotionStyles() {
  return (
    <style>{`
      @keyframes lmHeroDrift {
        from { transform: scale(1) translateY(0); }
        to   { transform: scale(1.04) translateY(-8px); }
      }
      .lm-hero-media {
        transform-origin: center center;
        animation: lmHeroDrift 16s ease-in-out infinite alternate;
        will-change: transform;
      }
      /* Footage breathes on its own — no scale drift on hero videos. */
      video.lm-hero-media { animation: none; }

      .lm-reveal {
        opacity: 0;
        transform: translateY(8px);
        transition:
          opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1),
          transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .lm-reveal.visible { opacity: 1 !important; transform: translateY(0) !important; }
      .lm-delay-1 { transition-delay: 0.2s; }
      .lm-delay-2 { transition-delay: 0.5s; }
      .lm-delay-3 { transition-delay: 0.8s; }
      .lm-delay-4 { transition-delay: 1.1s; }

      .lm-section {
        opacity: 0;
        transform: translateY(20px);
        transition:
          opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1),
          transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .lm-section.visible { opacity: 1 !important; transform: translateY(0) !important; }

      .lm-gallery-item {
        scroll-snap-align: center;
        opacity: 0.55;
        transform: scale(0.96);
        filter: brightness(0.75);
        transition:
          opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
          transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
          filter 700ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .lm-gallery-item.is-active {
        opacity: 1; transform: scale(1); filter: brightness(1);
      }

      /* Subtle sequential reveal for gallery cells. Opt-in per page.
         Duration 800ms · 6px lift · 100ms stagger between cells. */
      .lm-cell-reveal {
        opacity: 0;
        transform: translateY(6px);
        transition:
          opacity 800ms cubic-bezier(0.22, 1, 0.36, 1),
          transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
        will-change: opacity, transform;
      }
      .lm-cell-reveal.visible { opacity: 1 !important; transform: translateY(0) !important; }
      .lm-cell-reveal.lm-stagger-1 { transition-delay: 0ms; }
      .lm-cell-reveal.lm-stagger-2 { transition-delay: 100ms; }
      .lm-cell-reveal.lm-stagger-3 { transition-delay: 200ms; }
      .lm-cell-reveal.lm-stagger-4 { transition-delay: 300ms; }
      .lm-cell-reveal.lm-stagger-5 { transition-delay: 400ms; }
      .lm-cell-reveal.lm-stagger-6 { transition-delay: 500ms; }
      .lm-cell-reveal.lm-stagger-7 { transition-delay: 600ms; }
      .lm-cell-reveal.lm-stagger-8 { transition-delay: 700ms; }
      .lm-cell-reveal.lm-stagger-9 { transition-delay: 800ms; }

      @media (prefers-reduced-motion: reduce) {
        .lm-hero-media, .lm-reveal, .lm-section, .lm-gallery-item, .lm-cell-reveal {
          animation: none !important;
          transition-duration: 0.001ms !important;
          transition-delay: 0ms !important;
        }
        .lm-reveal, .lm-section, .lm-cell-reveal {
          opacity: 1 !important;
          transform: none !important;
        }
        .lm-gallery-item {
          opacity: 1 !important; transform: none !important; filter: none !important;
        }
      }
    `}</style>
  );
}

/**
 * useLuxuryMotionObserver — wires the IntersectionObserver that toggles
 * .visible on .lm-reveal / .lm-section / .lm-cell-reveal and .is-active
 * on .lm-gallery-item. Call it once near the top of a page component.
 *
 * @param {any[]} deps  Optional dependency list — pass state values (e.g. an
 *   active filter/category) that cause new .lm-* nodes to mount, so the
 *   observer re-attaches to the fresh DOM.
 */
export function useLuxuryMotionObserver(deps = []) {
  useEffect(() => {
    const revealEls = document.querySelectorAll(".lm-reveal, .lm-section, .lm-cell-reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    const galleryRoot = document.querySelector("[data-lm-gallery-scroller]");
    const galleryItems = document.querySelectorAll(".lm-gallery-item");
    const galleryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-active", entry.intersectionRatio >= 0.65);
        });
      },
      { root: galleryRoot, threshold: [0, 0.65, 1] }
    );
    galleryItems.forEach((item) => galleryObserver.observe(item));

    return () => {
      revealObserver.disconnect();
      galleryObserver.disconnect();
    };
  }, deps);
}
