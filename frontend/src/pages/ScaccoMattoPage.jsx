import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import RingSizeSelector, { ringSizeLabel, ringSizeSkuToken } from "@/components/RingSizeSelector";
import { useAddToCart } from "@/hooks/useAddToCart";

/**
 * SCACCO MATTO — PHILEON Fine Jewelry → Rings (Unisex).
 * Visual language: LA BÊTE reference — black background, restrained low-opacity
 * typography, small square thumbnails, minimal controls. USD pricing only.
 */

const BASE = "/fine-jewelry/scacco-matto";
const GALLERY = [
  { src: `${BASE}/hero-three-quarter.png`,        alt: "SCACCO MATTO upright three-quarter view" },
  { src: `${BASE}/macro-square-circle.png`,       alt: "SCACCO MATTO macro of a blue square sapphire beside a yellow circular sapphire" },
  { src: `${BASE}/stations-frontal-closeup.png`,  alt: "SCACCO MATTO frontal close-up of square and circular stations" },
  { src: `${BASE}/rear-opening.png`,              alt: "SCACCO MATTO straight rear view of the full ring opening" },
  { src: `${BASE}/top-down.png`,                  alt: "SCACCO MATTO elevated top-down view" },
  { src: `${BASE}/lifestyle-cafe-window.jpg`,     alt: "SCACCO MATTO worn — café window portrait" },
  { src: `${BASE}/lifestyle-cafe-coffee.png`,     alt: "SCACCO MATTO worn — resting hand around a coffee cup" },
  { src: `${BASE}/lifestyle-hands-outdoor.png`,   alt: "SCACCO MATTO worn — outdoor café hands" },
];

// USD price map — public storefront only. No CAD, no internal costing.
const PRICE_MAP = {
  "10K|yellow": 8100,
  "14K|yellow": 8500,
  "10K|white":  8300,
  "14K|white":  8700,
};
const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;
const SIZE_OPTIONS = ["4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","custom"];

export default function ScaccoMattoPage() {
  const [karat, setKarat] = useState("10K");
  const [colour, setColour] = useState("yellow");
  const [size, setSize] = useState("");
  const [idx, setIdx] = useState(0);
  const [hoveredThumb, setHoveredThumb] = useState(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const priceUsd = PRICE_MAP[`${karat}|${colour}`] ?? PRICE_MAP[`${karat}|yellow`];
  const isValid = Boolean(karat) && colour === "yellow" && Boolean(size);

  useEffect(() => {
    document.title = "SCACCO MATTO | PHILEON Fine Jewelry";
  }, []);

  // Karat change resets gallery to slot 1
  useEffect(() => { setIdx(0); }, [karat]);

  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) {
      dx < 0 ? setIdx((i)=>(i+1)%GALLERY.length) : setIdx((i)=>(i-1+GALLERY.length)%GALLERY.length);
    }
    touchStart.current = null;
  };

  const chooseColour = (id) => { if (id === "white") return; setColour(id); };

  const onAddToCart = () => {
    if (!isValid) return;
    const variant = `${karat} · Yellow Gold · ${ringSizeLabel(size)}`;
    handleAddToCart({
      id: `scacco-matto-${karat.toLowerCase()}-${colour}-${ringSizeSkuToken(size)}`,
      name: "SCACCO MATTO — Geometric Gemstone Band",
      productName: "SCACCO MATTO",
      subtitle: "Geometric Gemstone Band",
      category: "PHILEON Fine Jewelry — Rings",
      price: priceUsd,
      currency: "USD",
      productKey: "scaccoMatto",
      tierKey: `${karat}_${colour}`,
      sku: `SM-${karat}-${colour.toUpperCase()}-${ringSizeSkuToken(size)}`,
      quantity: 1,
      slug: "scacco-matto",
      image: GALLERY[0].src,
      materials: ["Natural Blue Sapphires", "Natural Yellow Sapphires", `${karat} Yellow Gold`],
      karat,
      metalColour: "Yellow Gold",
      ringSize: ringSizeLabel(size),
    }, 1, variant);
  };

  const karatBtnClass = (id) => `px-4 py-2 rounded-md text-[11px] tracking-[0.18em] border transition-all duration-200 ${karat === id ? "bg-white/[0.04] border-white/22 text-white/85" : "border-white/[0.06] text-white/40 hover:border-white/12 hover:text-white/60"}`;
  const colourBtnClass = (id, disabled) => `px-4 py-2 rounded-md text-[11px] tracking-[0.18em] border transition-all duration-200 ${disabled ? "border-white/[0.05] text-white/22 cursor-not-allowed" : colour === id ? "bg-white/[0.04] border-white/22 text-white/85" : "border-white/[0.06] text-white/40 hover:border-white/12 hover:text-white/60"}`;
  const thumbClass = (i, small) => {
    const isActive = idx === i;
    const isHovered = hoveredThumb === i;
    const shouldDim = hoveredThumb !== null && !isHovered && !isActive;
    return `${small ? "w-[38px] h-[38px]" : "w-11 h-11"} flex-shrink-0 rounded-sm overflow-hidden transition-all duration-150 ${isActive ? "opacity-70 ring-[0.5px] ring-white/30" : shouldDim ? "opacity-10" : "opacity-25 hover:opacity-55"}`;
  };
  const renderThumb = (i, small=false) => (
    <button
      key={i}
      type="button"
      onClick={() => setIdx(i)}
      onMouseEnter={() => setHoveredThumb(i)}
      onMouseLeave={() => setHoveredThumb(null)}
      className={thumbClass(i, small)}
      data-testid={`sm-thumb-${i + 1}`}
      aria-label={`View image ${i + 1}`}
      aria-pressed={idx === i}
    >
      <img
        src={GALLERY[i].src}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
        style={{ filter: (idx === i || hoveredThumb === i) ? "brightness(1.05)" : "brightness(0.9)" }}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" data-testid="scacco-matto-page">
      {/* Return */}
      <div className="max-w-[1100px] mx-auto px-5 md:px-8 pt-6">
        <Link
          to="/shop?category=rings"
          className="inline-flex items-center gap-2 text-[9px] tracking-[0.42em] text-white/30 hover:text-white/60 transition-colors uppercase"
          data-testid="sm-return"
        >
          <span aria-hidden="true">←</span> Return to Fine Jewelry
        </Link>
      </div>

      {/* MOBILE */}
      <div className="md:hidden pt-4 pb-16">
        <div className="max-w-[400px] mx-auto px-5">
          {/* Gallery main */}
          <div
            className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            data-testid="sm-gallery-main"
          >
            <img
              src={GALLERY[idx].src}
              alt={GALLERY[idx].alt}
              className="max-w-[92%] max-h-full object-contain"
              style={{ filter: "brightness(1.02) drop-shadow(0 22px 44px rgba(0,0,0,0.7))" }}
              data-testid="sm-gallery-image"
            />
          </div>

          {/* Thumbs */}
          <div className="flex gap-1 mt-4 overflow-x-auto flex-nowrap" data-testid="sm-gallery-thumbs">
            {GALLERY.map((_, i) => renderThumb(i, true))}
          </div>

          {/* Identity */}
          <div className="mt-8">
            <p className="text-[9px] tracking-[0.35em] text-white/30 mb-1.5">RING</p>
            <h1 className="text-[22px] tracking-[0.02em] font-light text-white/90 mb-1" data-testid="sm-title">SCACCO MATTO</h1>
            <p className="text-white/40 text-[13px]" data-testid="sm-subtitle">Geometric Gemstone Band</p>
            <p className="text-white/35 text-[13px] mt-1" data-testid="sm-materials">Natural Blue &amp; Yellow Sapphires</p>
          </div>

          {/* Price */}
          <div className="mt-6">
            <p className="text-[32px] tracking-[0.015em] font-light text-white/90" data-testid="sm-price">{formatUsd(priceUsd)}</p>
          </div>

          {/* Karat */}
          <div className="mt-6">
            <p className="text-[8px] tracking-[0.35em] text-white/25 mb-2.5">SELECT YOUR GOLD</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setKarat("10K")} className={karatBtnClass("10K")} data-testid="sm-karat-10k">10K</button>
              <button type="button" onClick={() => setKarat("14K")} className={karatBtnClass("14K")} data-testid="sm-karat-14k">14K</button>
            </div>
          </div>

          {/* Colour */}
          <div className="mt-5">
            <p className="text-[8px] tracking-[0.35em] text-white/25 mb-2.5">SELECT YOUR COLOUR</p>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => chooseColour("yellow")} className={colourBtnClass("yellow", false)} data-testid="sm-colour-yellow">Yellow Gold</button>
              <button
                type="button"
                onClick={() => chooseColour("white")}
                disabled
                aria-disabled="true"
                tabIndex={-1}
                onKeyDown={(e)=>{ if(e.key==="Enter"||e.key===" ") e.preventDefault(); }}
                className={colourBtnClass("white", true)}
                data-testid="sm-colour-white"
              >
                White Gold
                <span className="ml-2 text-[8px] tracking-[0.28em] text-white/35">COMING SOON</span>
              </button>
            </div>
          </div>

          {/* Ring size */}
          <div className="mt-5">
            <p className="text-[8px] tracking-[0.35em] text-white/25 mb-2.5">SELECT YOUR RING SIZE</p>
            <RingSizeSelector
              value={size}
              onChange={setSize}
              sizes={SIZE_OPTIONS}
              label=""
              showSizingMicrocopy={false}
              testIdPrefix="sm-ring-size"
            />
          </div>

          {/* Add to cart */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!isValid || isAdding}
            className="w-full bg-white text-black rounded-md py-3 mt-6 text-[10px] tracking-[0.18em] font-medium hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-300"
            data-testid="sm-add-to-cart"
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
          </button>
          {!isValid && (
            <p className="text-[10px] text-white/30 mt-3 leading-relaxed" data-testid="sm-validation-hint">
              Choose your gold, colour and ring size to add SCACCO MATTO to your cart.
            </p>
          )}

          {/* Description */}
          <div className="mt-10 space-y-4">
            <p className="text-[15px] text-white/60 leading-[1.6]">
              SCACCO MATTO brings natural blue and yellow sapphires together in a continuous sequence of square and circular stations. Each gemstone is framed in gold, creating a repeating pattern that carries around the entire band.
            </p>
            <p className="text-[15px] text-white/60 leading-[1.6]">
              Cool blue and golden-yellow tones meet through bold geometry, open-sided detailing and a composition designed to be seen from every angle.
            </p>
            <p className="text-[13px] text-white/45 leading-[1.6] italic">
              Available in 10K and 14K yellow gold. White gold coming soon.
            </p>
          </div>

          <p className="text-[9px] text-white/22 mt-6 leading-relaxed">Made to order · Ships from the PHILEON Atelier</p>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block max-w-[1100px] mx-auto px-8 pt-6 pb-24">
        <div className="grid grid-cols-2 gap-14">
          {/* Left: Gallery */}
          <div>
            <div className="relative h-[58vh] flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-black" />
              <img
                src={GALLERY[idx].src}
                alt={GALLERY[idx].alt}
                className="relative z-10 max-w-[88%] max-h-full object-contain"
                style={{ filter: "brightness(1.025) contrast(1.015) drop-shadow(0 45px 90px rgba(0,0,0,0.8))" }}
                data-testid="sm-gallery-image-desktop"
              />
            </div>
            <div className="flex justify-center gap-1.5">
              {GALLERY.map((_, i) => renderThumb(i, false))}
            </div>
          </div>

          {/* Right: Purchase */}
          <div className="pt-4">
            <p className="text-[9px] tracking-[0.4em] text-white/25 mb-2">RING</p>
            <h1 className="text-[32px] tracking-[0.015em] font-light text-white/90 mb-1">SCACCO MATTO</h1>
            <p className="text-white/40 text-[14px]">Geometric Gemstone Band</p>
            <p className="text-white/35 text-[13px] mt-1">Natural Blue &amp; Yellow Sapphires</p>

            <p className="text-[34px] tracking-[0.015em] font-light text-white/90 mt-6">{formatUsd(priceUsd)}</p>

            <div className="mt-8">
              <p className="text-[8px] tracking-[0.35em] text-white/20 mb-3">SELECT YOUR GOLD</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setKarat("10K")} className={karatBtnClass("10K")} data-testid="sm-karat-10k-desktop">10K</button>
                <button type="button" onClick={() => setKarat("14K")} className={karatBtnClass("14K")} data-testid="sm-karat-14k-desktop">14K</button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[8px] tracking-[0.35em] text-white/20 mb-3">SELECT YOUR COLOUR</p>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => chooseColour("yellow")} className={colourBtnClass("yellow", false)} data-testid="sm-colour-yellow-desktop">Yellow Gold</button>
                <button
                  type="button"
                  onClick={() => chooseColour("white")}
                  disabled
                  aria-disabled="true"
                  tabIndex={-1}
                  onKeyDown={(e)=>{ if(e.key==="Enter"||e.key===" ") e.preventDefault(); }}
                  className={colourBtnClass("white", true)}
                  data-testid="sm-colour-white-desktop"
                >
                  White Gold
                  <span className="ml-2 text-[8px] tracking-[0.28em] text-white/35">COMING SOON</span>
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[8px] tracking-[0.35em] text-white/20 mb-3">SELECT YOUR RING SIZE</p>
              <RingSizeSelector
                value={size}
                onChange={setSize}
                sizes={SIZE_OPTIONS}
                label=""
                showSizingMicrocopy={false}
                testIdPrefix="sm-ring-size-desktop"
              />
            </div>

            <button
              type="button"
              onClick={onAddToCart}
              disabled={!isValid || isAdding}
              className="w-full bg-white text-black rounded-md py-3.5 mt-8 text-[10px] tracking-[0.18em] font-medium hover:bg-white/92 disabled:opacity-22 disabled:cursor-not-allowed transition-all duration-300"
              data-testid="sm-add-to-cart-desktop"
            >
              {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
            </button>

            <p className="text-[9px] text-white/18 leading-relaxed mt-4">Made to order · Ships from the PHILEON Atelier</p>

            <div className="mt-8 border-t border-white/[0.04] pt-6 space-y-3">
              <p className="text-[13px] text-white/55 leading-[1.65]">
                SCACCO MATTO brings natural blue and yellow sapphires together in a continuous sequence of square and circular stations. Each gemstone is framed in gold, creating a repeating pattern that carries around the entire band.
              </p>
              <p className="text-[13px] text-white/55 leading-[1.65]">
                Cool blue and golden-yellow tones meet through bold geometry, open-sided detailing and a composition designed to be seen from every angle.
              </p>
              <p className="text-[12px] text-white/40 leading-[1.65] italic">Available in 10K and 14K yellow gold. White gold coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
