import { useState, useCallback, useRef } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

// COOGI I hero video URL
const COOGI_HERO_VIDEO = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ifs9jtbk_VIDEO_98d0aec8-1ca7-4b07-9e13-c0bb3baa740b.mp4";

/* ═══════════════════════════════════════════════════════════════
   COOGI I — Tribute Series
   
   CHAOS, DISCIPLINED.
   
   Multi-stone pavé composition
   Structure disguised as chaos
═══════════════════════════════════════════════════════════════ */

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
  const galleryVideoRef = useRef(null);
  
  // Hero video as FIRST gallery item, then all product images
  const gallery = [
    { type: "video", src: COOGI_HERO_VIDEO, poster: product.imageUrl, alt: "COOGI I hero video" },
    ...product.gallery
  ];

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
          HERO — Cinematic Full-Viewport
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-black">

        {/* HERO VIDEO */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={product.imageUrl}
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.9) contrast(1.05)" }}
          >
            <source src={COOGI_HERO_VIDEO} type="video/mp4" />
          </video>
          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* TEXT OVERLAY (CREDITS STYLE) */}
        <div className="relative z-10 h-full flex items-end">
          <div className="px-6 pb-10 md:pb-16 max-w-xl">

            <p className="text-[10px] tracking-[0.25em] text-violet-400 mb-3">
              TRIBUTE SERIES
            </p>

            <p className="text-sm tracking-[0.2em] text-white/60 mb-4">
              PATTERN MADE POWER
            </p>

            <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">
              COOGI I
            </h1>

            <p className="text-white/70 text-sm mb-2">
              {product.tagline}
            </p>

            <p className="text-white/80 text-sm md:text-base mb-4">
              Structure disguised as chaos. Every stone placed with intent.
            </p>

            <p className="text-violet-400 text-lg font-medium">
              From ${product.pricing.foundation.toLocaleString()} CAD
            </p>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT — Gallery + Configuration
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          
          {/* Desktop Layout */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            
            {/* Left: Gallery - Tighter, more refined */}
            <div className="max-w-[480px] mx-auto md:mx-0">
              {/* Main Image/Video */}
              <div className="relative aspect-square mb-3 bg-black rounded overflow-hidden">
                {gallery[activeImage]?.type === "video" ? (
                  <video
                    ref={galleryVideoRef}
                    autoPlay
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
              
              {/* Thumbnails - Smaller, neater */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
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
                        w-11 h-11 flex-shrink-0 rounded-sm overflow-hidden
                        transition-all duration-150
                        ${isActive 
                          ? "ring-1 ring-violet-500/50 opacity-100" 
                          : shouldDim 
                            ? "opacity-20" 
                            : "opacity-40 hover:opacity-80"}
                      `}
                    >
                      {item.type === "video" ? (
                        <div className="relative w-full h-full bg-black">
                          <video muted playsInline preload="metadata" poster={item.poster} className="w-full h-full object-cover pointer-events-none">
                            <source src={item.src} type="video/mp4" />
                          </video>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                            <div className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2 text-black ml-px">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={item.src} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="pt-2">
              
              {/* Product Description */}
              <div className="mb-8">
                <p className="text-[9px] tracking-[0.35em] text-violet-400/60 mb-4">TRIBUTE SERIES</p>
                <div className="text-white/50 text-[13px] leading-[1.8] whitespace-pre-line mb-6">
                  {product.story}
                </div>
              </div>

              {/* Specifications - Clean text block */}
              <div className="mb-8">
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
                    A complex pavé composition of over 700 hand-set gemstones, arranged in a continuous flowing pattern:
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
              
              {/* Configuration */}
              <div className="mb-6">
                <p className="text-[8px] tracking-[0.35em] text-white/20 mb-3">SELECT CONFIGURATION</p>
                <div className="space-y-2">
                  {Object.entries(product.tiers).map(([key, tier]) => {
                    const isActive = selectedTier === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedTier(key)}
                        className={`
                          cursor-pointer rounded-lg px-4 py-3
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

              {/* Size & Qty */}
              <div className="flex gap-3 mb-5">
                <div className="flex-1">
                  <p className="text-[8px] tracking-[0.35em] text-white/20 mb-2">SIZE</p>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-transparent border border-white/8 rounded-lg px-3 py-2.5 text-[12px] text-white/55 focus:outline-none focus:border-violet-500/30 transition-colors"
                  >
                    <option value="" disabled className="bg-black">Select your size (6–12)</option>
                    {sizeOptions.map(s => (
                      <option key={s} value={s} className="bg-black">{s}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-white/20 mt-1.5">Half sizes available · Custom sizing above 12</p>
                </div>
                <div className="w-28">
                  <p className="text-[8px] tracking-[0.35em] text-white/20 mb-2">QTY</p>
                  <div className="flex items-center border border-white/8 rounded-lg h-[42px]">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 text-white/30 hover:text-white/50 transition-colors">−</button>
                    <span className="flex-1 text-center text-[12px] text-white/55">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 text-white/30 hover:text-white/50 transition-colors">+</button>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <button 
                onClick={onAddToCart}
                disabled={isAdding || !selectedSize}
                className="w-full bg-violet-600 text-white rounded-lg py-3.5 text-[10px] tracking-[0.2em] font-medium hover:bg-violet-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200 mb-4"
              >
                {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "CLAIM YOURS"}
              </button>

              <p className="text-[9px] text-white/18 mb-10">
                Made to order · Limited production · Tribute Series
              </p>

              {/* Features */}
              <div className="border-t border-white/[0.04] pt-8">
                <p className="text-[9px] tracking-[0.35em] text-white/20 mb-5">FEATURES</p>
                <ul className="space-y-2">
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

      {/* ═══════════════════════════════════════════════════════════════
          CLOSING — The Seal
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 border-t border-white/[0.03]">
        <div className="text-center max-w-[500px] mx-auto px-5">
          <p className="text-[14px] md:text-[16px] text-white/40 leading-relaxed mb-6">
            Not pattern for the sake of pattern.<br />
            Expression — under control.
          </p>
          <p className="text-[10px] tracking-[0.3em] text-violet-400/50">
            COOGI I ✦ TRIBUTE SERIES
          </p>
        </div>
      </section>

      {/* Custom styles */}
      <style>{`
        .duration-400 { transition-duration: 400ms; }
      `}</style>
    </div>
  );
}
