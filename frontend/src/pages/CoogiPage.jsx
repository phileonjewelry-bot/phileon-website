import { useState, useCallback } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

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
  const gallery = product.gallery;

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

        {/* HERO IMAGE */}
        <div className="absolute inset-0 z-0">
          <img
            src={gallery[0]?.src}
            alt={gallery[0]?.alt}
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.9) contrast(1.05)" }}
          />
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
      <section className="py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          
          {/* Desktop Layout */}
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Left: Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-square mb-4 bg-black rounded-lg overflow-hidden">
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
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2">
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
                        w-16 h-16 flex-shrink-0 rounded overflow-hidden
                        transition-all duration-150
                        ${isActive 
                          ? "ring-1 ring-violet-500/50 opacity-100" 
                          : shouldDim 
                            ? "opacity-20" 
                            : "opacity-40 hover:opacity-80"}
                      `}
                    >
                      <img 
                        src={item.src} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />
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

              {/* Specifications */}
              <div className="mb-8 p-4 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                <p className="text-[8px] tracking-[0.35em] text-white/25 mb-3">SPECIFICATIONS</p>
                <div className="grid grid-cols-3 gap-4 text-[11px]">
                  <div>
                    <p className="text-white/30 mb-1">Top Width</p>
                    <p className="text-white/60">{product.specifications.topWidth}</p>
                  </div>
                  <div>
                    <p className="text-white/30 mb-1">Band Width</p>
                    <p className="text-white/60">{product.specifications.bandWidth}</p>
                  </div>
                  <div>
                    <p className="text-white/30 mb-1">Thickness</p>
                    <p className="text-white/60">{product.specifications.thickness}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.05]">
                  <p className="text-white/30 text-[10px] mb-1">Total Stones</p>
                  <p className="text-violet-400/80 text-[13px]">~{product.specifications.stones.total} stones</p>
                  <p className="text-white/25 text-[9px] mt-1">
                    White Diamonds · Blue · Yellow · Orange · Purple · Pink Sapphires
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
