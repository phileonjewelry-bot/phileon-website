/* ==========================================================================
   PHILEON — QUADRIGA DOMINUS
   Gents statement ring. Same ring architecture across four colorways
   (Red/Black, Black/Red, Green/Black, Black/Green). Same white metal body,
   same 188-pavé + 1-centre stone composition. Only the stone colorway
   changes. Two metal choices: 10K or 14K. Price = f(colorway, metal).

   Customer must choose:
     1. Colorway (visible switch cards)  — default: Red Centre / Black Pavé
     2. Metal (10K / 14K)                — no default
     3. Ring Size (US 7–15 half sizes)   — no default
   All three required before ADD TO CART is enabled.

   Reuses shared `RingSizeSelector` component (positioning + validation
   already solved sitewide). Substantial-band note reminds customers to
   size up if between sizes.
   ========================================================================== */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import RingSizeSelector, {
  ringSizeLabel,
  ringSizeIdToken,
  ringSizeSkuToken,
} from "../components/RingSizeSelector";
import { useAddToCart } from "../hooks/useAddToCart";

// --------------------------------------------------------------------------
// APPROVED ASSETS — one image per colorway. Do not swap or re-crop.
// --------------------------------------------------------------------------
const IMG_RED_BLACK   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/pvp203ps_1000169710.png"; // Red Centre / Black Pavé
const IMG_BLACK_RED   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/zbaof21l_1000169709.png"; // Black Centre / Red Pavé
const IMG_GREEN_BLACK = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ie5lwq3b_1000169940.png"; // Green Centre / Black Pavé
const IMG_BLACK_GREEN = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/8jgj6qm3_1000169939.png"; // Black Centre / Green Pavé

// Single persistent hero video — same clip plays for every colorway selection.
// Self-hosted, audio track stripped, faststart moov atom for reliable looping.
const HERO_VIDEO = "/quadriga/hero-video.mp4";
// Poster is a still frame extracted from the hero video itself (640×368,
// same aspect ratio as the video) — prevents layout shift between the
// fallback and the decoded playback.
const HERO_POSTER = "/quadriga/hero-poster.jpg";

// --------------------------------------------------------------------------
// COLORWAY MATRIX — price = pricing[metal] per colorway
// --------------------------------------------------------------------------
const COLORWAYS = [
  {
    id: "red-black",
    name: "Red Centre / Black Pavé",
    shortName: "Red / Black",
    image: IMG_RED_BLACK,
    alt: "QUADRIGA DOMINUS — red cushion centre stone framed by black pavé double halo",
    pricing: { "10K": 10495, "14K": 12250 },
    extras: [],
  },
  {
    id: "black-red",
    name: "Black Centre / Red Pavé",
    shortName: "Black / Red",
    image: IMG_BLACK_RED,
    alt: "QUADRIGA DOMINUS — black cushion centre stone framed by red pavé double halo",
    pricing: { "10K": 10995, "14K": 12750 },
    extras: [
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/535cb4aq_1000170348.png", alt: "QUADRIGA DOMINUS — black centre with ruby pavé, editorial three-quarter view on the polished white metal shank" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/oprujd38_1000170349.png", alt: "QUADRIGA DOMINUS — rear architectural view of the black centre framed by two rows of ruby pavé" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ufez5p5j_1000170350.png", alt: "QUADRIGA DOMINUS — top-down view of the black centre framed by the ruby double-halo pavé" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/i1r8nazd_1000170353.png", alt: "QUADRIGA DOMINUS — angled macro on the black cushion centre stone and ruby double halo" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/h8nksk83_1000170345.png", alt: "QUADRIGA DOMINUS — extreme macro of a prong holding the black centre against the ruby pavé bed" },
    ],
  },
  {
    id: "green-black",
    name: "Green Centre / Black Pavé",
    shortName: "Green / Black",
    image: IMG_GREEN_BLACK,
    alt: "QUADRIGA DOMINUS — green cushion centre stone framed by black pavé double halo",
    pricing: { "10K": 11495, "14K": 13250 },
    extras: [
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/7spgrpo4_1000170275.png", alt: "QUADRIGA DOMINUS — emerald centre editorial three-quarter view, standing on a soft grey studio surface" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/yj1t7qm1_1000170273.png", alt: "QUADRIGA DOMINUS — macro on the emerald centre stone framed by the black pavé double halo" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/81t2anc7_1000170270.png", alt: "QUADRIGA DOMINUS — top-down architectural view of the emerald centre and black pavé haloes" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/6i89pfb4_1000170279.png", alt: "QUADRIGA DOMINUS — emerald centre presented in the PHILEON navy-velvet box, held between fingers" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/2sip6c2p_1000170277.png", alt: "QUADRIGA DOMINUS — emerald centre worn on hand, editorial lifestyle" },
    ],
  },
  {
    id: "black-green",
    name: "Black Centre / Green Pavé",
    shortName: "Black / Green",
    image: IMG_BLACK_GREEN,
    alt: "QUADRIGA DOMINUS — black cushion centre stone framed by green pavé double halo",
    pricing: { "10K": 11995, "14K": 13750 },
    extras: [
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/f0zzmem0_1000170329.png", alt: "QUADRIGA DOMINUS — black centre with emerald pavé, editorial three-quarter view" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/qtlk2o66_1000170331.png", alt: "QUADRIGA DOMINUS — rear architectural view of the black centre framed by three rows of emerald pavé" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/jxjlkrds_1000170330.png", alt: "QUADRIGA DOMINUS — macro on the faceted black cushion and emerald pavé double halo" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/4ta316eq_1000170333.png", alt: "QUADRIGA DOMINUS — full ring profile with black centre and emerald pavé, standing on a soft neutral surface" },
      { src: "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/r9bh58qh_1000170334.png", alt: "QUADRIGA DOMINUS — top-down view of the black centre framed by three concentric rows of emerald pavé" },
    ],
  },
];

// Gents ring range — US 7–15 in half sizes.
const AVAILABLE_SIZES = [
  "7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15",
];

const METAL_OPTIONS = ["10K", "14K"];

function formatUsd(n) {
  return `$${Number(n).toLocaleString("en-US")}`;
}

// --------------------------------------------------------------------------
// COLORWAY SWATCH — decorative visual cue for each switch card. Uses CSS
// gradients so it stays crisp at any size and matches the actual stone
// balance of each variant.
// --------------------------------------------------------------------------
function ColorwaySwatch({ id }) {
  const styles = {
    "red-black":   { centre: "#B01E2E", halo: "#0a0a0a" },
    "black-red":   { centre: "#0a0a0a", halo: "#A61B2C" },
    "green-black": { centre: "#0F5A3A", halo: "#0a0a0a" },
    "black-green": { centre: "#0a0a0a", halo: "#0F5A3A" },
  };
  const c = styles[id] || styles["red-black"];
  return (
    <div
      aria-hidden="true"
      className="w-4 h-4 rounded-full border border-white/25 shrink-0"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${c.centre} 0 40%, ${c.halo} 42% 100%)`,
      }}
    />
  );
}

// --------------------------------------------------------------------------
// MAIN PAGE COMPONENT
// --------------------------------------------------------------------------
export default function QuadrigaDominusPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Persistent ref to the hero video so we can enforce muted-autoplay
  // aggressively across mount, viewport re-entry, and pause interference.
  const heroVideoRef = useRef(null);

  // Default colorway = Red Centre / Black Pavé.
  const [selectedColorwayId, setSelectedColorwayId] = useState("red-black");
  // Metal has NO default — customer must choose.
  const [selectedMetal, setSelectedMetal] = useState(null);
  // Ring size has NO default.
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [metalError, setMetalError] = useState(false);

  const activeColorway = useMemo(
    () => COLORWAYS.find((c) => c.id === selectedColorwayId) || COLORWAYS[0],
    [selectedColorwayId]
  );

  // -------------------------------------------------------------------
  // AUTOPLAY RELIABILITY
  // Force-mute + hard-play on mount, on viewport re-entry, and on any
  // stray pause event. This mirrors the pattern used elsewhere on the
  // site to defeat mobile browser autoplay throttling.
  // -------------------------------------------------------------------
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;

    const forcePlay = () => {
      try {
        v.muted = true;
        v.defaultMuted = true;
        v.volume = 0;
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch (_) { /* no-op */ }
    };

    forcePlay();

    const onPause = () => { if (!v.ended) forcePlay(); };
    v.addEventListener("pause", onPause);

    let observer;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) forcePlay();
        });
      }, { threshold: 0.05 });
      observer.observe(v);
    }

    return () => {
      v.removeEventListener("pause", onPause);
      if (observer) observer.disconnect();
    };
  }, []);

  const activePrice = selectedMetal ? activeColorway.pricing[selectedMetal] : null;
  const isReady = !!selectedMetal && !!selectedSize;

  const handleSelectColorway = (id) => {
    setSelectedColorwayId(id);
  };

  const handleSelectMetal = (metal) => {
    setSelectedMetal(metal);
    if (metalError) setMetalError(false);
  };

  const onAddToCart = () => {
    let hasError = false;
    if (!selectedMetal) { setMetalError(true); hasError = true; }
    if (!selectedSize) { setSizeError(true); hasError = true; }
    if (hasError) return;

    const sizeLabelText = ringSizeLabel(selectedSize);
    const sizeIdToken = ringSizeIdToken(selectedSize);
    const skuToken = ringSizeSkuToken(selectedSize);

    handleAddToCart(
      {
        id: `quadriga-dominus-${activeColorway.id}-${selectedMetal.toLowerCase()}-size-${sizeIdToken}`,
        name: `QUADRIGA DOMINUS — ${selectedMetal} · ${activeColorway.name} · ${sizeLabelText}`,
        image: activeColorway.image,
        price: activePrice,
        productKey: "quadrigaDominus",
        slug: "quadriga-dominus",
        materials: [`${selectedMetal} White Metal`, activeColorway.name],
        ringSize: selectedSize,
        ringSizeLabel: sizeLabelText,
        colorway: activeColorway.name,
        metal: selectedMetal,
        sku: `QUADD-${activeColorway.id.toUpperCase().replace(/-/g, "")}-${selectedMetal}-SZ${skuToken}`,
      },
      1,
      `${activeColorway.name} · ${selectedMetal} · ${sizeLabelText}`
    );
  };

  return (
    <div
      className="bg-black text-white min-h-screen overflow-x-hidden"
      data-testid="quadriga-dominus-page"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        {/* ================================================================
            LEFT — PERSISTENT HERO VIDEO (same clip for every colorway).
            Container has no fixed aspect ratio: the video fills width
            and takes its natural height up to a viewport-relative cap,
            so we avoid large empty black gaps above/below.
            ================================================================ */}
        <div>
          <div className="w-full max-w-full overflow-hidden">
            <div className="w-full max-w-full flex justify-center items-center overflow-hidden rounded-2xl bg-black border border-[#1f1f1f]" data-testid="quadriga-hero-frame">
              <video
                ref={heroVideoRef}
                src={HERO_VIDEO}
                poster={HERO_POSTER}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                preload="auto"
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                onContextMenu={(e) => e.preventDefault()}
                onLoadedMetadata={(e) => {
                  const el = e.currentTarget;
                  el.muted = true;
                  el.defaultMuted = true;
                  el.volume = 0;
                  const p = el.play();
                  if (p && typeof p.catch === "function") p.catch(() => {});
                }}
                onEnded={(e) => { e.currentTarget.currentTime = 0; e.currentTarget.play(); }}
                className="w-full h-auto max-h-[85vh] object-contain block bg-black"
                style={{ aspectRatio: "640 / 368" }}
                aria-label="QUADRIGA DOMINUS hero video"
                data-testid="quadriga-hero-video"
              />
            </div>
          </div>

          {/* Colorway thumbnail strip — mirrors switch cards, allows quick
              image scanning below the hero. */}
          <div className="grid grid-cols-4 gap-2 mt-4" data-testid="quadriga-thumbnail-strip">
            {COLORWAYS.map((cw) => (
              <button
                key={cw.id}
                type="button"
                onClick={() => handleSelectColorway(cw.id)}
                className={`relative overflow-hidden rounded-lg border transition-all ${
                  selectedColorwayId === cw.id
                    ? "border-[#C6A25D]"
                    : "border-[#2a2a2a] hover:border-[#4a4a4a]"
                }`}
                data-testid={`quadriga-thumbnail-${cw.id}`}
                aria-label={`View ${cw.name}`}
              >
                <img
                  src={cw.image}
                  alt={cw.alt}
                  className="w-full h-20 lg:h-24 object-cover"
                />
              </button>
            ))}
          </div>

          {/* Colorway-specific extras gallery — currently populated for the
              emerald (Green Centre / Black Pavé) colorway. Rendered only
              when the active colorway has extras; hidden otherwise so
              other colorways behave exactly as before. */}
          {activeColorway.extras && activeColorway.extras.length > 0 ? (
            <div
              className="mt-6"
              data-testid={`quadriga-extras-${activeColorway.id}`}
            >
              <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-3">
                {activeColorway.name} — Gallery
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {activeColorway.extras.map((img, idx) => (
                  <div
                    key={`${activeColorway.id}-extra-${idx}`}
                    className="relative overflow-hidden rounded-xl border border-[#1f1f1f] bg-black aspect-square"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      data-testid={`quadriga-extra-${activeColorway.id}-${idx}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* ================================================================
            RIGHT — PURCHASE BLOCK
            ================================================================ */}
        <div className="lg:sticky lg:top-24 self-start">
          {/* Collection eyebrow */}
          <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-4">
            PHILEON Fine Jewelry
          </p>

          {/* 1. Name */}
          <h1
            className="text-4xl lg:text-5xl font-serif mb-3"
            data-testid="quadriga-product-name"
          >
            QUADRIGA DOMINUS
          </h1>

          {/* 2. Subtitle */}
          <p className="text-[#a0a0a0] italic text-lg lg:text-xl mb-2">
            Genuine-Stone Statement Ring
          </p>

          {/* 3. Materials / stone line */}
          <p
            className="text-xs tracking-[0.24em] uppercase text-[#C6A25D]/80 mb-6"
            data-testid="quadriga-materials-line"
          >
            188 Pavé Stones + Centre Stone
          </p>

          {/* 4. Live price */}
          <div className="mb-2 min-h-[3.75rem] lg:min-h-[4.25rem]">
            {activePrice ? (
              <div
                className="text-[#C6A25D] text-4xl lg:text-5xl"
                data-testid="quadriga-current-price"
              >
                {formatUsd(activePrice)}
                <span className="text-sm lg:text-base tracking-[0.2em] text-[#8e8e8e] ml-3 align-middle">
                  USD
                </span>
              </div>
            ) : (
              <div
                className="text-sm text-[#8e8e8e] italic pt-4"
                data-testid="quadriga-price-placeholder"
              >
                Select a metal to see your price.
              </div>
            )}
          </div>

          {/* Selection confirmation line */}
          <p className="text-sm text-[#b5b5b5] mb-8 leading-relaxed">
            {activeColorway.name}
            {selectedMetal ? ` · ${selectedMetal} White Metal` : ""}
          </p>

          {/* 5–6. COLORWAY SWITCH CARDS */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-3">
              Select Your Colorway
            </p>
            <div
              className="grid grid-cols-2 gap-3"
              role="radiogroup"
              aria-label="Colorway"
              data-testid="quadriga-colorway-cards"
            >
              {COLORWAYS.map((cw) => {
                const isActive = selectedColorwayId === cw.id;
                return (
                  <button
                    key={cw.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => handleSelectColorway(cw.id)}
                    className={`text-left rounded-xl border overflow-hidden transition-all group ${
                      isActive
                        ? "border-[#C6A25D] bg-[#C6A25D]/10 ring-1 ring-[#C6A25D]/40"
                        : "border-[#2a2a2a] bg-black hover:border-[#5a5a5a]"
                    }`}
                    data-testid={`quadriga-colorway-${cw.id}`}
                  >
                    <div className="aspect-square bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                      <img
                        src={cw.image}
                        alt={cw.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="px-3 py-2.5 flex items-center gap-2">
                      <ColorwaySwatch id={cw.id} />
                      <span
                        className={`text-[11px] lg:text-xs leading-tight tracking-[0.06em] ${
                          isActive ? "text-white" : "text-[#c9c9c9]"
                        }`}
                      >
                        {cw.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. METAL SELECTOR */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-3">
              Select Your Metal
            </p>
            <div
              className="grid grid-cols-2 gap-3"
              role="radiogroup"
              aria-label="Metal"
              data-testid="quadriga-metal-selector"
            >
              {METAL_OPTIONS.map((m) => {
                const isActive = selectedMetal === m;
                const price = activeColorway.pricing[m];
                return (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => handleSelectMetal(m)}
                    className={`rounded-xl border p-4 lg:p-5 text-left transition-all ${
                      isActive
                        ? "border-[#C6A25D] bg-[#C6A25D]/10"
                        : metalError
                          ? "border-red-500/60 bg-black hover:border-red-400"
                          : "border-[#2a2a2a] bg-black hover:border-[#4a4a4a]"
                    }`}
                    data-testid={`quadriga-metal-${m.toLowerCase()}`}
                  >
                    <div className="text-xl lg:text-2xl font-medium">{m}</div>
                    <div className="text-xs text-[#9d9d9d] mt-1 tracking-[0.14em] uppercase">
                      White Metal
                    </div>
                    <div className="text-[#C6A25D] text-lg lg:text-xl mt-3">
                      {formatUsd(price)}
                    </div>
                  </button>
                );
              })}
            </div>
            {metalError && !selectedMetal ? (
              <p
                className="mt-2 text-xs text-red-400"
                data-testid="quadriga-metal-error"
              >
                Please select a metal before adding to bag.
              </p>
            ) : null}
          </div>

          {/* 8. RING SIZE SELECTOR (shared component) */}
          <div className="mb-4">
            <RingSizeSelector
              value={selectedSize}
              onChange={(v) => {
                setSelectedSize(v);
                if (sizeError) setSizeError(false);
              }}
              sizes={AVAILABLE_SIZES}
              placeholder="SELECT RING SIZE"
              invalid={sizeError}
              errorMessage={sizeError ? "Please select your ring size." : ""}
              testIdPrefix="quadriga-ringsize"
              hideWideBandWarning={true}
              style={{
                "--ring-accent": "#C6A25D",
                "--ring-bg": "rgba(0, 0, 0, 0.85)",
                "--ring-fg": "#ffffff",
                "--ring-muted": "rgba(255, 255, 255, 0.5)",
              }}
            />
          </div>

          {/* 9. SIZING INSTRUCTIONS + GUIDE CTA */}
          <div
            className="mb-8 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a] px-4 py-4 lg:px-5 lg:py-5 text-xs lg:text-[13px] leading-relaxed text-[#c9c9c9]"
            data-testid="quadriga-sizing-guidance"
          >
            <ul className="space-y-1.5 list-none">
              <li>— Select your usual ring size.</li>
              <li>— This ring has a substantial face and presence.</li>
              <li>— If you are between sizes, consider going up by half a size.</li>
            </ul>
            <p className="mt-3 text-xs text-[#a0a0a0]">
              This is a substantial gents ring. If you are between sizes, consider
              sizing up for a more comfortable fit.
            </p>
            <p className="mt-3 text-xs">
              Need help?{" "}
              <Link
                to="/ring-size-guide"
                className="text-[#C6A25D] hover:text-[#e0be7a] underline underline-offset-4 decoration-[#C6A25D]/50 hover:decoration-[#C6A25D]"
                data-testid="quadriga-size-guide-link"
              >
                View our size guide
              </Link>
              .
            </p>
          </div>

          {/* 10. ADD TO CART */}
          <button
            type="button"
            disabled={isAdding}
            onClick={onAddToCart}
            className={`w-full py-4 rounded-xl tracking-[0.25em] text-sm font-semibold transition-all ${
              isReady && !isAdding
                ? "bg-[#C6A25D] text-black hover:bg-[#b8944f] cursor-pointer"
                : "bg-[#3a3a3a] text-[#8a8a8a] cursor-pointer"
            } ${isAdding ? "bg-green-600 text-white" : ""}`}
            data-testid="quadriga-add-to-cart-button"
          >
            {isAdding
              ? buttonText
              : isReady
                ? "ADD TO CART"
                : !selectedMetal && !selectedSize
                  ? "SELECT METAL & SIZE"
                  : !selectedMetal
                    ? "SELECT A METAL"
                    : "SELECT A SIZE"}
          </button>

          <p className="text-center text-sm text-[#7f7f7f] mt-4">
            Complimentary insured shipping.
          </p>

          {/* 11. SHORT PRODUCT DESCRIPTION */}
          <div className="mt-10 mb-8">
            <h2 className="text-2xl lg:text-3xl font-serif text-[#C6A25D] mb-4">
              The QUADRIGA DOMINUS Story
            </h2>
            <p className="text-[#d2d2d2] leading-7 lg:leading-8 text-base lg:text-lg">
              QUADRIGA DOMINUS is built for presence. A substantial gents ring
              with a strong architectural face, genuine centre stone, and 188
              pavé stones surrounding the form, it delivers four distinct
              expressions without changing the authority of the design. Each
              version keeps the same commanding silhouette while shifting the
              balance of colour and power.
            </p>
          </div>

          {/* 12. ADDITIONAL DETAILS */}
          <div className="mb-16">
            <h3 className="text-lg lg:text-xl font-serif text-[#C6A25D] mb-4">
              Additional Details
            </h3>
            <ul className="space-y-3 text-[#d2d2d2] text-sm lg:text-base">
              <li>— Available in 10K and 14K</li>
              <li>— 188 pavé stones plus 1 genuine centre stone</li>
              <li>— 189 stones total</li>
              <li>— Four genuine-stone colorways</li>
              <li>— Reference size: US 11</li>
              <li>— Made to order</li>
              <li>— Sold individually</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
