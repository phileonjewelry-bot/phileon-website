import { useState, useCallback, useRef, useEffect } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

// COOGI I hero video URL
const COOGI_HERO_VIDEO = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ifs9jtbk_VIDEO_98d0aec8-1ca7-4b07-9e13-c0bb3baa740b.mp4";

export default function CoogiPage() {
  const product = products.coogiI;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredThumb, setHoveredThumb] = useState(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const currentTier = product.tiers[selectedTier];
  const heroVideoRef = useRef(null);
  const galleryVideoRef = useRef(null);

  // Hero video as FIRST gallery item, then all product images
  const gallery = [
    { type: "video", src: COOGI_HERO_VIDEO, poster: product.imageUrl, alt: "COOGI I hero video" },
    ...product.gallery
  ];

  // ── SINGLE ACTIVE MEDIA STATE ──
  // When gallery selection changes, pause ALL videos, then play only the active one
  useEffect(() => {
    // Pause hero
    if (heroVideoRef.current) {
      heroVideoRef.current.pause();
    }
    // Pause gallery video
    if (galleryVideoRef.current) {
      galleryVideoRef.current.pause();
    }

    // If active item is the video (index 0), play only the gallery video
    if (activeImage === 0 && galleryVideoRef.current) {
      galleryVideoRef.current.currentTime = 0;
      galleryVideoRef.current.play().catch(() => {});
    }
    // If active item is NOT the video, resume hero as ambient background
    if (activeImage !== 0 && heroVideoRef.current) {
      heroVideoRef.current.play().catch(() => {});
    }
  }, [activeImage]);

  // Image transition handler
  const handleImageChange = useCallback((newIndex) => {
    if (newIndex === activeImage || isTransitioning) return;
    setIsTransitioning(true);
    requestAnimationFrame(() => {
      setActiveImage(newIndex);
      setTimeout(() => setIsTransitioning(false), 400);
    });
  }, [activeImage, isTransitioning]);

  const onAddToCart = () => {
    handleAddToCart({
      id: `coogi-i-${selectedTier}-${selectedSize}`,
      name: `COOGI I — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      price: product.pricing[selectedTier],
      metal: currentTier.metal,
      size: selectedSize,
      quantity: quantity,
      image: product.gallery[0].src,
    });
  };

  // Generate size options (6-12 with half sizes)
  const sizeOptions = [];
  for (let i = 6; i <= 12; i++) {
    sizeOptions.push(i.toString());
    if (i < 12) sizeOptions.push(`${i}.5`);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO — Constrained cinematic preview
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full bg-black">
        <div className="max-w-[520px] md:max-w-[720px] mx-auto px-4 pt-4 md:pt-6">
          <div className="relative h-[55vh] md:h-[65vh] overflow-hidden rounded-[10px]">
            {/* HERO VIDEO */}
            <video
              ref={heroVideoRef}
              autoPlay
              muted
              loop
              playsInline
              poster={product.imageUrl}
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ filter: "brightness(0.9) contrast(1.05)" }}
            >
              <source src={COOGI_HERO_VIDEO} type="video/mp4" />
            </video>
            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent rounded-[10px]" />

            {/* TEXT OVERLAY */}
            <div className="absolute inset-0 z-10 flex items-end">
              <div className="px-5 pb-6 md:pb-8">
                <p className="text-[9px] tracking-[0.25em] text-violet-400 mb-1.5">TRIBUTE SERIES</p>
                <p className="text-[10px] tracking-[0.2em] text-white/60 mb-2">PATTERN MADE POWER</p>
                <h1 className="text-2xl md:text-4xl font-serif text-white mb-2">COOGI I</h1>
                <p className="text-white/70 text-[11px] mb-1">{product.tagline}</p>
                <p className="text-white/80 text-[11px] md:text-xs mb-2">Structure disguised as chaos. Every stone placed with intent.</p>
                <p className="text-violet-400 text-sm font-medium">From ${product.pricing.foundation.toLocaleString()} CAD</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT — Gallery + Configuration
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-5 md:py-8">
        <div className="max-w-[520px] md:max-w-[720px] mx-auto px-4 md:px-6">
          
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            
            {/* Left: Gallery — constrained */}
            <div>
              {/* Main Image/Video */}
              <div className="relative aspect-square mb-1.5 bg-black rounded-lg overflow-hidden">
                {gallery[activeImage]?.type === "video" ? (
                  <video
                    ref={galleryVideoRef}
                    muted
                    loop
                    playsInline
                    poster={gallery[activeImage].poster}
                    className={`
                      w-full h-full object-cover
                      transition-all duration-400
                      ${isTransitioning ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"}
                    `}
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  >
                    <source src={gallery[activeImage].src} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={gallery[activeImage].src}
                    alt={gallery[activeImage].alt || ""}
                    className={`
                      w-full h-full object-contain
                      transition-all duration-400
                      ${isTransitioning ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"}
                    `}
                    style={{ 
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      filter: "brightness(1.02) contrast(1.01)"
                    }}
                  />
                )}
              </div>
              
              {/* Thumbnails — 48px, tight gap */}
              <div className="flex gap-[6px] overflow-x-auto pb-1">
                {gallery.map((item, index) => {
                  const isActive = activeImage === index;
                  const isHovered = hoveredThumb === index;
                  const shouldDim = hoveredThumb !== null && !isHovered && !isActive;
                  
                  return (
                    <button
                      key={`thumb-${index}`}
                      onClick={() => handleImageChange(index)}
                      onMouseEnter={() => {
                        setHoveredThumb(index);
                        handleImageChange(index);
                      }}
                      onMouseLeave={() => setHoveredThumb(null)}
                      className={`
                        w-[48px] h-[48px] flex-shrink-0 rounded-[3px] overflow-hidden
                        transition-all duration-150
                        ${isActive 
                          ? "ring-[0.5px] ring-violet-500/50 opacity-100" 
                          : shouldDim 
                            ? "opacity-20" 
                            : "opacity-40 hover:opacity-80"}
                      `}
                    >
                      {item.type === "video" ? (
                        <div className="relative w-full h-full bg-black">
                          <img src={item.poster} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                            <div className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2 text-black ml-px">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="pt-0">
              
              <div className="mb-5">
                <p className="text-[8px] tracking-[0.35em] text-violet-400/60 mb-3">TRIBUTE SERIES</p>
                <div className="text-white/50 text-[12px] leading-[1.7] whitespace-pre-line mb-4">
                  {product.story}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[8px] tracking-[0.35em] text-white/25 mb-4">SPECIFICATIONS</p>
                <div className="text-[11px] text-white/40 leading-relaxed space-y-1">
                  <p>Top Width: 18 mm</p>
                  <p>Band Thickness: 5 mm</p>
                  <p>Profile: Tapered architectural signet</p>
                </div>
                <div className="mt-4 text-[11px] text-white/40 leading-relaxed space-y-1">
                  <p className="text-white/25 text-[9px] mb-2">Est. Weight (Size 10)</p>
                  <p>10K Gold: 15 g</p>
                  <p>14K Gold: 17 g</p>
                  <p>18K Gold: 19 g</p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                  <p className="text-white/25 text-[9px] mb-2">Stone Composition</p>
                  <p className="text-white/40 text-[11px] leading-relaxed mb-3">
                    A complex pav&#233; composition of over 700 hand-set gemstones, arranged in a continuous flowing pattern:
                  </p>
                  <div className="text-[10px] text-white/35 leading-relaxed space-y-0.5">
                    <p>White Diamonds</p>
                    <p>Blue Sapphires</p>
                    <p>Yellow Sapphires</p>
                    <p>Red Rubies</p>
                    <p>Orange Citrine</p>
                    <p>Purple Amethyst</p>
                  </div>
                  <p className="text-white/25 text-[9px] mt-3 italic">
                    Each stone is individually set to follow the natural movement of the design.
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-[8px] tracking-[0.35em] text-white/20 mb-2">SELECT CONFIGURATION</p>
                <div className="space-y-1.5">
                  {Object.entries(product.tiers).map(([key, tier]) => {
                    const isActive = selectedTier === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedTier(key)}
                        className={`
                          cursor-pointer rounded-md px-3 py-2
                          transition-all duration-200
                          ${isActive 
                            ? "bg-white/[0.02] border border-violet-500/30" 
                            : "border border-white/[0.04] hover:border-white/8"}
                        `}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className={`text-[10px] tracking-[0.15em] ${isActive ? "text-white/65" : "text-white/30"}`}>
                                {tier.label}
                              </p>
                              {tier.badge && (
                                <span className="text-[7px] tracking-[0.1em] bg-violet-500/90 text-white px-1.5 py-0.5 rounded-full">
                                  {tier.badge}
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] ${isActive ? "text-white/40" : "text-white/18"}`}>
                              {tier.metal} · {tier.stones}
                            </p>
                            {tier.description && (
                              <p className={`text-[9px] mt-1 ${isActive ? "text-white/25" : "text-white/12"}`}>
                                {tier.description}
                              </p>
                            )}
                          </div>
                          <p className={`text-[14px] ${isActive ? "text-white/70" : "text-white/30"}`}>
                            ${product.pricing[key].toLocaleString()} CAD
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2.5 mb-4">
                <div className="flex-1">
                  <p className="text-[8px] tracking-[0.35em] text-white/20 mb-1.5">SIZE</p>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-transparent border border-white/8 rounded-md px-2.5 py-2 text-[11px] text-white/55 focus:outline-none focus:border-violet-500/30 transition-colors"
                  >
                    <option value="" disabled className="bg-black">Select size (6-12)</option>
                    {sizeOptions.map(s => (
                      <option key={s} value={s} className="bg-black">{s}</option>
                    ))}
                  </select>
                  <p className="text-[8px] text-white/20 mt-1">Half sizes · Custom above 12</p>
                </div>
                <div className="w-24">
                  <p className="text-[8px] tracking-[0.35em] text-white/20 mb-1.5">QTY</p>
                  <div className="flex items-center border border-white/8 rounded-md h-[36px]">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2.5 text-white/30 hover:text-white/50 transition-colors text-sm">-</button>
                    <span className="flex-1 text-center text-[11px] text-white/55">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-2.5 text-white/30 hover:text-white/50 transition-colors text-sm">+</button>
                  </div>
                </div>
              </div>

              <button 
                onClick={onAddToCart}
                disabled={isAdding || !selectedSize}
                className="w-full bg-violet-600 text-white rounded-md py-3 text-[10px] tracking-[0.2em] font-medium hover:bg-violet-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200 mb-3"
              >
                {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "CLAIM YOURS"}
              </button>

              <p className="text-[8px] text-white/18 mb-6">
                Made to order · Limited production · Tribute Series
              </p>

              <div className="border-t border-white/[0.04] pt-5">
                <p className="text-[8px] tracking-[0.35em] text-white/20 mb-3">FEATURES</p>
                <ul className="space-y-1.5">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[11px] text-white/35">
                      <span className="w-1 h-1 rounded-full bg-violet-500/50" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="py-10 md:py-16 border-t border-white/[0.03]">
        <div className="text-center max-w-[420px] mx-auto px-5">
          <p className="text-[13px] md:text-[14px] text-white/40 leading-relaxed mb-4">
            Not pattern for the sake of pattern.<br />
            Expression — under control.
          </p>
          <p className="text-[9px] tracking-[0.3em] text-violet-400/50">
            COOGI I — TRIBUTE SERIES
          </p>
        </div>
      </section>

      <style>{`
        .duration-400 { transition-duration: 400ms; }
      `}</style>
    </div>
  );
}
