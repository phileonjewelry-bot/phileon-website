/* ==========================================================================
   PHILEON — CRESTA NERA HINGED BANGLE
   Gentleman's hinged bangle · sterling-set metal in 10K or 14K Yellow Gold
   with 66 black diamonds set in 22 pavé triangle clusters. Price varies by
   both metal AND wrist size. Both selectors are required before Add to Cart.
   ========================================================================== */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAddToCart } from "../hooks/useAddToCart";
import WristSizeSelector, { DEFAULT_WRIST_SIZES, wristSizeById, wristSizeLabel } from "../components/WristSizeSelector";
import BraceletSizeGuideModal from "../components/BraceletSizeGuideModal";

// ---- Approved assets ------------------------------------------------------
const HERO_VIDEO = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/fhzlvkvw_XiaoYing_Video_1786029702565_HD.mp4";
const IMG_FRONT_STACK = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/el5elc8u_1000169400.jpg";
const IMG_ANGLED_STACK = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/rijb3os1_1000169378.jpg";
const IMG_VERTICAL = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/otm0wfwp_1000169382.jpg";
const IMG_HINGE_CIRCLE = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/5iyfpswg_1000169380.jpg";

// ---- Price matrix ---------------------------------------------------------
// [metal][wristSize] → USD price. Trusted server matrix (merchant Feb 2026).
// Do not display internal costs.
const PRICE_MATRIX = {
  "10k-yellow-gold": { small: 10495, medium: 10745, large: 10995, xl: 11245 },
  "14k-yellow-gold": { small: 11795, medium: 12045, large: 12295, xl: 12545 },
};

const METAL_OPTIONS = [
  { id: "10k-yellow-gold", label: "10K Yellow Gold", from: 10495 },
  { id: "14k-yellow-gold", label: "14K Yellow Gold", from: 11795 },
];

const MEDIA = [
  { type: "video", src: HERO_VIDEO, poster: IMG_VERTICAL, alt: "CRESTA NERA hinged yellow-gold bangle — looping hero" },
  { type: "image", src: IMG_VERTICAL, alt: "CRESTA NERA yellow-gold hinged bangle — hero" },
  { type: "image", src: IMG_FRONT_STACK, alt: "CRESTA NERA yellow-gold hinged bangle — front view" },
  { type: "image", src: IMG_ANGLED_STACK, alt: "CRESTA NERA yellow-gold hinged bangle — three-quarter angle" },
  { type: "image", src: IMG_HINGE_CIRCLE, alt: "CRESTA NERA yellow-gold hinged bangle — hinge and latch profile" },
];

const usd = (n) => `$${n.toLocaleString("en-US")} USD`;

export default function CrestaNeraBanglePage() {
  const videoRef = useRef(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const [activeMedia, setActiveMedia] = useState(0);
  const [selectedMetal, setSelectedMetal] = useState(null); // no default
  const [selectedWrist, setSelectedWrist] = useState(null); // no default
  const [metalError, setMetalError] = useState(false);
  const [wristError, setWristError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const metalRef = useRef(null);
  const wristRef = useRef(null);
  const guideLinkRef = useRef(null);

  // Clear inline errors as soon as the user makes a selection.
  useEffect(() => { if (selectedMetal && metalError) setMetalError(false); }, [selectedMetal, metalError]);
  useEffect(() => { if (selectedWrist && wristError) setWristError(false); }, [selectedWrist, wristError]);

  // Force video loop watchdog
  useEffect(() => {
    const v = videoRef.current;
    if (!v || MEDIA[activeMedia]?.type !== "video") return;
    const onEnded = () => { v.currentTime = 0; v.play(); };
    v.addEventListener("ended", onEnded);
    v.play().catch(() => {});
    return () => v.removeEventListener("ended", onEnded);
  }, [activeMedia]);

  // Fade-in the hero video on mount
  const [heroMounted, setHeroMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setHeroMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const hasHeroVideo = MEDIA[0]?.type === "video";

  const currentPrice = useMemo(() => {
    if (!selectedMetal || !selectedWrist) return null;
    return PRICE_MATRIX[selectedMetal]?.[selectedWrist] ?? null;
  }, [selectedMetal, selectedWrist]);

  const isValid = !!selectedMetal && !!selectedWrist;

  const onAddToCart = () => {
    if (!selectedMetal) {
      setMetalError(true);
      metalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!selectedWrist) {
      setWristError(true);
      wristRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const metal = METAL_OPTIONS.find((m) => m.id === selectedMetal);
    const wrist = wristSizeById(selectedWrist);
    const price = PRICE_MATRIX[selectedMetal][selectedWrist];

    handleAddToCart({
      id: `cresta-nera-${selectedMetal}-${selectedWrist}`,
      name: `CRESTA NERA — ${metal.label} · ${wrist.label} · ${wrist.mm} mm`,
      image: IMG_VERTICAL,
      price,
      currency: "USD",
      productKey: "cresta-nera",
      slug: "cresta-nera",
      // Transmit machine-readable ids so the trusted server can validate.
      variant: selectedMetal,           // "10k-yellow-gold" | "14k-yellow-gold"
      wristSizeId: selectedWrist,       // "small" | "medium" | "large" | "xl"
      materials: [metal.label, "Black Diamond"],
      wristSize: wrist.label,
      wristSizeMm: wrist.mm,
      sku: `CRESTA-${selectedMetal.startsWith("10k") ? "10K" : "14K"}-${selectedWrist === "xl" ? "XL" : selectedWrist.charAt(0).toUpperCase()}`,
    }, 1, `${metal.label} · ${wrist.label} · ${wrist.mm} mm`);
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden" data-testid="cresta-nera-page">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 gap-10 py-8 lg:grid-cols-[1.2fr_0.8fr]">

        {/* LEFT — GALLERY */}
        <div>
          <div className="product-media-wrap w-full max-w-full overflow-hidden">
            <div className="product-media-main w-full max-w-full aspect-square flex justify-center items-center overflow-hidden rounded-2xl bg-black border border-[#1f1f1f]">
              {MEDIA[activeMedia].type === "video" ? (
                <video
                  ref={videoRef}
                  src={MEDIA[activeMedia].src}
                  poster={MEDIA[activeMedia].poster}
                  autoPlay muted loop playsInline preload="auto"
                  disablePictureInPicture disableRemotePlayback
                  controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                  onContextMenu={(e) => e.preventDefault()}
                  onEnded={(e) => { e.currentTarget.currentTime = 0; e.currentTarget.play(); }}
                  className={`w-full h-full max-w-full object-contain block scale-[1.03] transition-transform duration-[6000ms] ${
                    hasHeroVideo ? `transition-opacity ease-out duration-[1200ms] ${heroMounted ? "opacity-100" : "opacity-0"}` : ""
                  }`}
                  data-testid="hero-video"
                />
              ) : (
                <img
                  src={MEDIA[activeMedia].src}
                  alt={MEDIA[activeMedia].alt}
                  className="w-full h-full max-w-full object-contain block scale-[1.03] transition-transform duration-[6000ms]"
                  data-testid="hero-image"
                />
              )}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-2 mt-3">
            {MEDIA.map((m, i) => (
              <button
                key={i}
                onClick={() => setActiveMedia(i)}
                data-testid={`thumbnail-${i}`}
                className={`aspect-square overflow-hidden rounded-lg border ${
                  activeMedia === i ? "border-[#C6A25D]" : "border-[#1f1f1f]"
                } bg-black`}
                aria-label={m.type === "video" ? "Play hero video" : m.alt}
              >
                <img
                  src={m.type === "video" ? m.poster : m.src}
                  alt={m.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — PURCHASE */}
        <div>
          <p className="text-[11px] tracking-[0.28em] text-[#C6A25D] mb-3">PHILEON FINE JEWELRY</p>
          <h1 className="font-serif text-5xl leading-tight tracking-wide mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            CRESTA NERA
          </h1>
          <p className="italic text-[#c9c9c9] mb-1">Black Diamond Granulated Gold Bangle</p>
          <p className="text-xs tracking-[0.24em] text-[#8a8a8a] mb-6">BUILT, NOT MADE.</p>

          {/* Price */}
          <div className="mb-6" data-testid="cresta-nera-price">
            {currentPrice ? (
              <p className="text-3xl font-light" data-testid="current-price">{usd(currentPrice)}</p>
            ) : (
              <p className="text-3xl font-light text-[#c9c9c9]" data-testid="current-price-from">From {usd(10495)}</p>
            )}
            <p className="text-xs text-[#8a8a8a] mt-2">Select metal and wrist size to confirm your price.</p>
          </div>

          {/* Metal selector */}
          <div className="mb-6" ref={metalRef} data-testid="cresta-metal-root">
            <p className="text-[11px] tracking-[0.24em] text-[#8a8a8a] mb-3">METAL</p>
            {!selectedMetal ? (
              <p className="text-sm text-[#c9c9c9] mb-3 italic">SELECT METAL</p>
            ) : null}
            <div className="grid gap-3">
              {METAL_OPTIONS.map((m) => {
                const active = selectedMetal === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMetal(m.id)}
                    data-testid={`cresta-metal-${m.id}`}
                    aria-invalid={metalError || undefined}
                    aria-describedby={metalError ? "cresta-metal-error" : undefined}
                    className={`text-left px-5 py-4 rounded-xl border transition-all ${
                      active
                        ? "border-[#C6A25D] bg-[rgba(198,162,93,0.06)]"
                        : "border-[#2a2a2a] hover:border-[#4a4a4a]"
                    } ${metalError && !selectedMetal ? "border-[#c65b5b]" : ""}`}
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-medium">{m.label}</span>
                      <span className="text-sm text-[#c9c9c9]">From {usd(m.from)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {metalError && !selectedMetal ? (
              <p id="cresta-metal-error" role="alert" data-testid="cresta-metal-error"
                 className="mt-3 text-[12.5px] tracking-wide text-[#e08282]">
                Please select your metal.
              </p>
            ) : null}
          </div>

          {/* Wrist size selector */}
          <div className="mb-6" ref={wristRef}>
            <WristSizeSelector
              value={selectedWrist}
              onChange={setSelectedWrist}
              invalid={wristError}
              errorMessage={wristError ? "Please select your wrist size." : ""}
              onOpenSizeGuide={() => setGuideOpen(true)}
              testIdPrefix="cresta-wrist"
              style={{
                "--ring-accent": "#C6A25D",
                "--ring-bg": "rgba(0, 0, 0, 0.85)",
                "--ring-fg": "#ffffff",
                "--ring-muted": "rgba(255, 255, 255, 0.5)",
              }}
            />
            <p className="mt-3 text-xs text-[#8a8a8a] italic">
              CRESTA NERA is a substantial 7 mm hinged bangle. Customers between sizes should generally choose the larger size.
            </p>
            <p className="mt-1 text-xs text-[#8a8a8a] italic">
              CAD reference: Men&apos;s Medium · 190 mm finished inside circumference.
            </p>
          </div>

          {/* Add to cart */}
          <button
            onClick={onAddToCart}
            disabled={isAdding}
            data-testid="add-to-cart-button"
            className={`w-full py-4 rounded-xl tracking-[0.25em] text-sm font-semibold transition-all ${
              isValid && !isAdding
                ? "bg-[#C6A25D] text-black hover:bg-[#b8944f]"
                : "bg-[#3a3a3a] text-[#8a8a8a]"
            } ${isAdding ? "bg-green-600 text-white" : "cursor-pointer"}`}
          >
            {isAdding ? buttonText : "ADD TO CART"}
          </button>

          <p className="mt-4 text-xs text-[#8a8a8a] leading-relaxed">
            Single-band hinged bangle with secure latch closure. Sold individually.
          </p>

          {/* Story + specs */}
          <div className="mt-10 border-t border-[#1f1f1f] pt-8">
            <h2 className="text-[11px] tracking-[0.28em] text-[#C6A25D] mb-4">THE STORY</h2>
            <p className="text-sm leading-relaxed text-[#e2e2e2] mb-4">
              CRESTA NERA is built around contrast. A substantial yellow-gold hinged bangle carries a full-circumference rhythm of granulated gold points and black-diamond pavé triangles. The engineered closure keeps the silhouette clean, while the alternating surface treatment gives the piece its weight, tension and authority.
            </p>
            <p className="text-sm leading-relaxed text-[#c9c9c9] italic">One band. One continuous register.</p>
            <p className="text-sm leading-relaxed text-[#c9c9c9] italic mb-2">Built, not made.</p>
            <p className="text-xs text-[#8a8a8a]">Sold individually.</p>

            <h2 className="text-[11px] tracking-[0.28em] text-[#C6A25D] mt-8 mb-3">SPECIFICATIONS</h2>
            <ul className="text-sm text-[#e2e2e2] space-y-2">
              <li>10K or 14K Yellow Gold · Black Diamonds</li>
              <li>Granulated Gold · 22 Pavé Triangle Clusters</li>
              <li>66 Black Diamonds (approx. 3.30 ct total)</li>
              <li>Band width approx. 7 mm · Hinged with secure latch closure</li>
              <li>Men&apos;s Wrist Sizes · 180 – 210 mm finished inside circumference</li>
              <li className="text-xs text-[#8a8a8a] italic pt-1">
                Larger wrist sizes require additional gold weight; pricing adjusts accordingly.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <BraceletSizeGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        returnFocusRef={guideLinkRef}
        productNote="CRESTA NERA is a substantial 7 mm hinged bangle. Customers between sizes should generally choose the larger size."
      />
    </div>
  );
}
