import { useState, useCallback, useEffect, useRef } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

/* ═══════════════════════════════════════════════════════════════
   BLESSED — DEUTERONOMY 28:3
   
   WORD MADE METAL
   
   A collective piece. Not gendered.
   The verse becomes the ring.
═══════════════════════════════════════════════════════════════ */

// Hero video URLs
const HERO_VIDEOS = {
  primary: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/8mh5jbyb_VIDEO_398c4647-aa45-4a23-a38b-7563f10405db.mp4", // Human + Product
  secondary: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/9bziac3p_VIDEO_02370714-7685-4aa0-a520-708e6a501478.mp4" // Product-only
};

export default function BlessedPage() {
  const product = products.blessed;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredThumb, setHoveredThumb] = useState(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  
  // Hero video rotation state
  const [activeVideo, setActiveVideo] = useState('primary');
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  const primaryVideoRef = useRef(null);
  const secondaryVideoRef = useRef(null);

  const currentTier = product.tiers[selectedTier];
  const gallery = product.gallery;

  // Video rotation effect - swap every 7 seconds
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setActiveVideo(prev => prev === 'primary' ? 'secondary' : 'primary');
    }, 7000);
    
    return () => clearInterval(rotationInterval);
  }, []);

  // Handle video playback on swap
  useEffect(() => {
    const activeRef = activeVideo === 'primary' ? primaryVideoRef : secondaryVideoRef;
    const inactiveRef = activeVideo === 'primary' ? secondaryVideoRef : primaryVideoRef;
    
    if (activeRef.current) {
      activeRef.current.currentTime = 0;
      activeRef.current.play().catch(() => {});
    }
    if (inactiveRef.current) {
      inactiveRef.current.pause();
    }
  }, [activeVideo]);

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
      id: `blessed-${selectedTier}-${selectedSize}`,
      name: `BLESSED — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      price: product.pricing[selectedTier],
      metal: currentTier.metal,
      size: selectedSize,
      quantity: quantity,
      image: product.gallery[0].src,
    });
  };

  // Generate size options (4-12 with half sizes)
  const sizeOptions = [];
  for (let i = 4; i <= 12; i++) {
    sizeOptions.push(i.toString());
    if (i < 12) sizeOptions.push(`${i}.5`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO — Word Made Metal
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-8 md:pt-28 md:pb-12">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          
          {/* Label */}
          <p className="text-[9px] tracking-[0.4em] text-amber-500/60 mb-3">
            COLLECTIVE PIECE
          </p>
          
          {/* Title Block */}
          <p className="text-[10px] tracking-[0.35em] text-white/30 mb-2">
            WORD MADE METAL
          </p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-serif text-white/90 tracking-[-0.01em] leading-[1.1] mb-2">
            BLESSED
          </h1>
          <p className="text-[13px] md:text-[14px] text-white/40 tracking-wide mb-4">
            DEUTERONOMY 28:3
          </p>
          <p className="text-white/50 text-[14px] md:text-[15px] leading-relaxed max-w-[400px] mb-3">
            You don't wear the verse... you wear the result.
          </p>
          <p className="text-white/30 text-[13px]">
            From $880 CAD
          </p>
        </div>
        
        {/* Hero Video Section */}
        <div className="mt-10 md:mt-16 max-w-[900px] mx-auto px-5 md:px-8">
          <div className="relative aspect-[16/9] md:aspect-[2/1] rounded-lg overflow-hidden bg-black">
            {/* Primary Video (Human + Product) */}
            <video
              ref={primaryVideoRef}
              autoPlay
              muted
              loop
              playsInline
              poster={gallery[0]?.src}
              className={`
                absolute inset-0 w-full h-full object-cover
                transition-opacity duration-700 ease-out
                ${activeVideo === 'primary' ? 'opacity-100 z-10' : 'opacity-0 z-0'}
              `}
            >
              <source src={HERO_VIDEOS.primary} type="video/mp4" />
            </video>
            
            {/* Secondary Video (Product-only) - Lazy loaded */}
            <video
              ref={secondaryVideoRef}
              muted
              loop
              playsInline
              preload="metadata"
              poster={gallery[0]?.src}
              onLoadedData={() => setSecondaryLoaded(true)}
              className={`
                absolute inset-0 w-full h-full object-cover
                transition-opacity duration-700 ease-out
                ${activeVideo === 'secondary' && secondaryLoaded ? 'opacity-100 z-10' : 'opacity-0 z-0'}
              `}
            >
              <source src={HERO_VIDEOS.secondary} type="video/mp4" />
            </video>
            
            {/* Subtle vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-20" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT — Gallery + Configuration
      ═══════════════════════════════════════════════════════════════ */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          
          {/* Mobile Layout */}
          <div className="md:hidden">
            
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
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {gallery.map((item, index) => (
                <button
                  key={`mthumb-${index}`}
                  onClick={() => handleImageChange(index)}
                  className={`
                    w-16 h-16 flex-shrink-0 rounded overflow-hidden
                    transition-all duration-150
                    ${activeImage === index 
                      ? "ring-1 ring-amber-500/50 opacity-100" 
                      : "opacity-40 hover:opacity-70"}
                  `}
                >
                  <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
            
            {/* Product Description */}
            <div className="mb-8">
              <p className="text-[9px] tracking-[0.35em] text-white/25 mb-4">DEUTERONOMY 28:3</p>
              <div className="text-white/50 text-[13px] leading-[1.8] whitespace-pre-line mb-6">
                {product.story}
              </div>
              <p className="text-amber-500/40 text-[12px] italic leading-relaxed">
                {product.verse}
              </p>
            </div>
            
            {/* Configuration */}
            <div className="mb-6">
              <p className="text-[8px] tracking-[0.35em] text-white/25 mb-3">SELECT CONFIGURATION</p>
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
                          ? "bg-white/[0.03] border border-amber-500/20" 
                          : "border border-white/[0.05] hover:border-white/10"}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={`text-[10px] tracking-[0.15em] ${isActive ? "text-white/70" : "text-white/35"}`}>
                              {tier.label}
                            </p>
                            {tier.badge && (
                              <span className="text-[7px] tracking-[0.1em] bg-amber-500/90 text-black px-1.5 py-0.5 rounded-full">
                                {tier.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] ${isActive ? "text-white/45" : "text-white/20"}`}>
                            {tier.metal} · {tier.stones}
                          </p>
                        </div>
                        <p className={`text-[13px] ${isActive ? "text-white/70" : "text-white/30"}`}>
                          ${product.pricing[key].toLocaleString()}
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
                <p className="text-[8px] tracking-[0.35em] text-white/25 mb-2">SIZE</p>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-white/60 focus:outline-none focus:border-amber-500/30"
                >
                  <option value="" disabled className="bg-[#0a0a0a]">Select size</option>
                  {sizeOptions.map(s => (
                    <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>
                  ))}
                </select>
                <p className="text-[9px] text-white/20 mt-1">Custom sizing on request</p>
              </div>
              <div className="w-24">
                <p className="text-[8px] tracking-[0.35em] text-white/25 mb-2">QTY</p>
                <div className="flex items-center border border-white/10 rounded-lg h-[42px]">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 text-white/30 hover:text-white/50">−</button>
                  <span className="flex-1 text-center text-[12px] text-white/60">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 text-white/30 hover:text-white/50">+</button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <button 
              onClick={onAddToCart}
              disabled={isAdding || !selectedSize}
              className="w-full bg-amber-500 text-black rounded-lg py-3.5 text-[10px] tracking-[0.2em] font-medium hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 mb-4"
            >
              {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "CLAIM YOURS"}
            </button>

            <p className="text-[9px] text-white/20 text-center mb-10">
              Made to order · Limited production
            </p>
            
            {/* Craft Section */}
            <div className="border-t border-white/[0.05] pt-8 mb-10">
              <p className="text-[9px] tracking-[0.35em] text-white/25 mb-6">CRAFT</p>
              <div className="space-y-6">
                {product.craft.map((item, idx) => (
                  <div key={idx}>
                    <p className="text-[10px] text-amber-500/50 mb-1">{item.number} — {item.title}</p>
                    <p className="text-[12px] text-white/35 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/[0.03]">
                <p className="text-[11px] text-white/25 italic mb-2">Not read.</p>
                <p className="text-[11px] text-white/40">Worn.</p>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-12">
            
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
              <div className="flex gap-2">
                {gallery.map((item, index) => {
                  const isActive = activeImage === index;
                  const isHovered = hoveredThumb === index;
                  const shouldDim = hoveredThumb !== null && !isHovered && !isActive;
                  
                  return (
                    <button
                      key={`dthumb-${index}`}
                      onClick={() => handleImageChange(index)}
                      onMouseEnter={() => {
                        setHoveredThumb(index);
                        handleImageChange(index);
                      }}
                      onMouseLeave={() => setHoveredThumb(null)}
                      className={`
                        w-16 h-16 rounded overflow-hidden
                        transition-all duration-150
                        ${isActive 
                          ? "ring-1 ring-amber-500/50 opacity-100" 
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
                <p className="text-[9px] tracking-[0.35em] text-white/25 mb-4">DEUTERONOMY 28:3</p>
                <div className="text-white/50 text-[13px] leading-[1.8] whitespace-pre-line mb-6">
                  {product.story}
                </div>
                <p className="text-amber-500/40 text-[12px] italic leading-relaxed">
                  {product.verse}
                </p>
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
                            ? "bg-white/[0.02] border border-amber-500/20" 
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
                                <span className="text-[7px] tracking-[0.1em] bg-amber-500/90 text-black px-1.5 py-0.5 rounded-full">
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
                    className="w-full bg-transparent border border-white/8 rounded-lg px-3 py-2.5 text-[12px] text-white/55 focus:outline-none focus:border-amber-500/30 transition-colors"
                  >
                    <option value="" disabled className="bg-[#0a0a0a]">Select your size (4–12)</option>
                    {sizeOptions.map(s => (
                      <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-white/20 mt-1.5">Half sizes available · Custom sizing on request</p>
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
                className="w-full bg-amber-500 text-black rounded-lg py-3.5 text-[10px] tracking-[0.2em] font-medium hover:bg-amber-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200 mb-4"
              >
                {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "CLAIM YOURS"}
              </button>

              <p className="text-[9px] text-white/18 mb-10">
                Made to order · Limited production
              </p>

              {/* Craft Section */}
              <div className="border-t border-white/[0.04] pt-8">
                <p className="text-[9px] tracking-[0.35em] text-white/20 mb-5">CRAFT</p>
                <div className="space-y-5">
                  {product.craft.map((item, idx) => (
                    <div key={idx}>
                      <p className="text-[10px] text-amber-500/50 mb-1">{item.number} — {item.title}</p>
                      <p className="text-[12px] text-white/30 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-5 border-t border-white/[0.03]">
                  <p className="text-[11px] text-white/20 italic mb-1">Not read.</p>
                  <p className="text-[11px] text-white/35">Worn.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CLOSING — The Seal
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 border-t border-white/[0.03]">
        <div className="text-center max-w-[400px] mx-auto px-5">
          <p className="text-[14px] md:text-[16px] text-white/40 leading-relaxed mb-6 whitespace-pre-line">
            {product.closing}
          </p>
          <p className="text-[10px] tracking-[0.3em] text-amber-500/40">
            DEUTERONOMY 28:3 ✦ WORD MADE METAL
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
