import { useState, useEffect, useRef, useCallback } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import { useLivePrice, useLiveTierPrices } from "@/hooks/useLivePrice";

/* ═══════════════════════════════════════════════════════════════
   TRIBUTE: LA BÊTE — "The Beast"
   
   UNTOUCHABLE TERRITORY
   
   Not a page. A controlled reveal.
   The user doesn't scroll. They are brought closer.
═══════════════════════════════════════════════════════════════ */

export default function LaBetePage() {
  const product = products.labete;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredThumb, setHoveredThumb] = useState(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const galleryVideoRef = useRef(null);

  // Perception control
  const [scrollY, setScrollY] = useState(0);
  const [galleryLocked, setGalleryLocked] = useState(false);
  const [titleReady, setTitleReady] = useState(false);

  const currentPrice = product.pricing[selectedTier];
  const currentTier = product.tiers[selectedTier];
  const tierPricesLive = useLiveTierPrices("labete");
  const { formatted: ctaPrice } = useLivePrice("labete", selectedTier, currentPrice);
  
  // Hero video as FIRST gallery item, followed by all product images
  const gallery = [
    { type: "video", src: "/videos/labete-hero.mp4", poster: product.heroImage, alt: "LA BÊTE hero video" },
    ...product.gallery
  ];

  // Heavy, deliberate image transition - instant switch feel
  const handleImageChange = useCallback((newIndex) => {
    if (newIndex === activeImage || isTransitioning) return;
    setIsTransitioning(true);
    // Instant response for thumbnails
    requestAnimationFrame(() => {
      setActiveImage(newIndex);
      setTimeout(() => setIsTransitioning(false), 450);
    });
  }, [activeImage, isTransitioning]);

  // Scroll physics - pulled, not scrolled
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      
      // Gallery lock point - tension → catch → settle
      if (y > 120 && !galleryLocked) {
        setGalleryLocked(true);
        // Controlled tension: delay title by 150ms
        setTimeout(() => setTitleReady(true), 150);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [galleryLocked]);

  const onAddToCart = () => {
    handleAddToCart({
      id: `labete-${selectedTier}-${selectedSize}`,
      name: `LA BÊTE — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      price: tierPricesLive[selectedTier]?.price || currentPrice,
      metal: currentTier.metal,
      size: selectedSize,
      quantity: quantity,
      image: product.gallery[0].src,    });
  };

  const visibleTiers = Object.entries(product.tiers).filter(([key, tier]) => !tier.hiddenFromHero);

  // Descent physics - hero fades faster, gallery rises slower
  const heroFade = Math.max(1 - scrollY * 0.0025, 0.15); // Faster fade
  const heroShift = Math.min(scrollY * 0.03, 12);
  const galleryRise = galleryLocked ? 0 : Math.min(scrollY * 0.08, 20); // Slower rise

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════
          WORLD — The environment. Already exists before you arrive.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[52vh] md:h-[70vh] overflow-hidden">
        
        {/* Hero Video - dissolves as you descend */}
        <div 
          className="absolute inset-0 will-change-transform"
          style={{ 
            transform: `translateY(${heroShift}px) scale(1.02)`,
            opacity: heroFade
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={product.heroImage}
            className="absolute inset-0 w-full h-full object-cover object-center"
          >
            <source src="/videos/labete-hero.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Subtle gradient overlay - preserves showroom brightness */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none" />
        
        {/* Title - part of the world */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-10 px-[6vw] pb-36 md:pb-52"
          style={{
            opacity: Math.max(1 - scrollY * 0.004, 0),
            transform: `translateY(${Math.min(scrollY * 0.12, 25)}px)`
          }}
        >
          <div className="w-full max-w-[460px]">
            <p className="text-white/35 tracking-[0.4em] text-[9px] leading-none mb-1.5">PHILEON</p>
            <p className="text-white/25 tracking-[0.3em] text-[9px] leading-none mb-3">COLLECTIVE — GENTS</p>
            <h1 className="text-white/85 font-serif text-[clamp(1.75rem,4.2vw,3.2rem)] tracking-[-0.01em] leading-[1.05] mb-2">
              TRIBUTE: LA BÊTE
            </h1>
            <p className="text-white/45 text-[clamp(0.78rem,1.1vw,0.95rem)] leading-[1.5]">
              Born in the showroom.<br />Built for the hand.
            </p>
          </div>
        </div>
        
        {/* The dissolution - bottom fade to black */}
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          REVEAL — The object was always here. You moved closer.
      ═══════════════════════════════════════════════════════════════ */}
      <div 
        className="relative -mt-28 md:-mt-44"
        style={{
          transform: `translateY(${galleryRise}px)`,
          transition: galleryLocked ? 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
      >
        
        {/* MOBILE: Object in the chamber */}
        <div className="md:hidden">
          <div className="relative mx-auto w-full max-w-[380px] px-4">
            
            {/* The object - presence amplification on active */}
            <div 
              className={`
                relative h-[44vh] flex items-center justify-center
                transition-all duration-700
                ${galleryLocked ? "opacity-100" : "opacity-0 translate-y-6"}
              `}
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              {/* Depth layer - dead black behind object */}
              <div className="absolute inset-0 bg-black" />
              
              {/* The object itself - video or image */}
              {gallery[activeImage]?.type === "video" ? (
                <video
                  ref={galleryVideoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={gallery[activeImage].poster}
                  className={`
                    relative z-10 w-full h-full object-cover
                    transition-all duration-500
                    ${isTransitioning 
                      ? "opacity-0 scale-[0.97]" 
                      : "opacity-100 scale-100"}
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
                    relative z-10 max-w-[94%] max-h-full object-contain
                    transition-all duration-500
                    ${isTransitioning 
                      ? "opacity-0 scale-[0.97]" 
                      : "opacity-100 scale-100"}
                  `}
                  style={{ 
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                    filter: isTransitioning 
                      ? "brightness(0.95) contrast(1)" 
                      : "brightness(1.03) contrast(1.02) drop-shadow(0 35px 70px rgba(0,0,0,0.85))"
                  }}
                />
              )}
            </div>
            <div 
              className={`
                flex justify-center gap-[5px] mt-2 mb-6
                transition-all duration-600
                ${galleryLocked ? "opacity-50" : "opacity-0"}
              `}
              style={{ transitionDelay: "100ms" }}
            >
              {gallery.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={() => handleImageChange(index)}
                  className={`
                    w-[6px] h-[6px] rounded-full
                    transition-all duration-200
                    ${activeImage === index 
                      ? "bg-white/80 scale-[1.2]" 
                      : "bg-white/20"}
                  `}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Thumbnail strip - quiet, intelligent */}
            <div 
              className={`
                flex gap-1 mb-5 overflow-x-auto flex-nowrap justify-start px-2
                transition-all duration-600
                ${galleryLocked ? "opacity-100" : "opacity-0"}
              `}
              style={{ transitionDelay: "50ms" }}
            >
              {gallery.map((item, index) => (
                <button
                  key={`mthumb-${index}`}
                  onClick={() => handleImageChange(index)}
                  className={`
                    w-[38px] h-[38px] flex-shrink-0 rounded-sm overflow-hidden
                    transition-all duration-150
                    ${activeImage === index 
                      ? "opacity-75 ring-[0.5px] ring-white/35" 
                      : "opacity-20"}
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
                    <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* ═══════════════════════════════════════════════════════════════
              INSPECTION — Title arrives after gallery settles (150ms delay)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="px-5 max-w-[400px] mx-auto">
            
            {/* Identity - whisper */}
            <div className={`
              mb-4 transition-all duration-600
              ${titleReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
            `}>
              <p className="text-[9px] tracking-[0.35em] text-white/30 mb-1.5">RING</p>
              <h2 className="text-[22px] tracking-[0.02em] font-light text-white/90 mb-0.5">LA BÊTE</h2>
              <p className="text-white/40 text-[13px]">{product.tagline}</p>
            </div>

            {/* Configuration - precision */}
            <div className={`
              mb-4 transition-all duration-600
              ${titleReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
            `} style={{ transitionDelay: "50ms" }}>
              <p className="text-[8px] tracking-[0.35em] text-white/25 mb-2.5">CONFIGURATION</p>
              <div className="space-y-1.5">
                {visibleTiers.map(([key, tier]) => {
                  const isActive = selectedTier === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedTier(key)}
                      className={`
                        cursor-pointer rounded-md px-3 py-2.5
                        transition-all duration-250
                        ${isActive 
                          ? "bg-white/[0.025] border border-white/18" 
                          : "border border-white/[0.04] hover:border-white/10"}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className={`text-[9px] tracking-[0.2em] ${isActive ? "text-white/65" : "text-white/30"}`}>
                              {tier.label}
                            </p>
                            {tier.badge && (
                              <span className="text-[7px] tracking-[0.1em] bg-white/90 text-black px-1.5 py-0.5 rounded-full">
                                {tier.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] ${isActive ? "text-white/45" : "text-white/22"}`}>
                            {tier.metal}
                          </p>
                        </div>
                        <p className={`text-[13px] ${isActive ? "text-white/75" : "text-white/35"}`}>
                          {tierPricesLive[key]?.formatted || `$${product.pricing[key].toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Size & Qty - minimal */}
            <div className={`
              flex gap-2.5 mb-4 transition-all duration-600
              ${titleReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
            `} style={{ transitionDelay: "100ms" }}>
              <div className="flex-1">
                <p className="text-[8px] tracking-[0.35em] text-white/25 mb-1.5">SIZE</p>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-transparent border border-white/8 rounded-md px-2.5 py-2 text-[12px] text-white/60 focus:outline-none focus:border-white/20"
                >
                  <option value="" disabled className="bg-black">Select</option>
                  {["6", "7", "8", "9", "10", "11", "12"].map(s => (
                    <option key={s} value={s} className="bg-black">{s}</option>
                  ))}
                </select>
              </div>
              <div className="w-20">
                <p className="text-[8px] tracking-[0.35em] text-white/25 mb-1.5">QTY</p>
                <div className="flex items-center border border-white/8 rounded-md h-[36px]">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 text-white/35 hover:text-white/55 text-sm">−</button>
                  <span className="flex-1 text-center text-[12px] text-white/60">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-2 text-white/35 hover:text-white/55 text-sm">+</button>
                </div>
              </div>
            </div>

            {/* ACQUISITION */}
            <button 
              onClick={onAddToCart}
              disabled={isAdding || !selectedSize}
              className={`
                w-full bg-white text-black rounded-md py-3 
                text-[10px] tracking-[0.18em] font-medium
                hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed
                transition-all duration-400 mb-3
                ${titleReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
              `}
              style={{ transitionDelay: "150ms" }}
            >
              {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "CLAIM YOURS"}
            </button>

            <p className={`
              text-[9px] text-white/20 leading-relaxed mb-6
              transition-all duration-600
              ${titleReady ? "opacity-100" : "opacity-0"}
            `} style={{ transitionDelay: "200ms" }}>
              Made to order · Limited production
            </p>
            <p className="text-[8px] text-white/12" style={{ transitionDelay: "250ms" }}>
              Price adjusts automatically with the live precious metals market.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            DESKTOP: Full inspection environment
        ═══════════════════════════════════════════════════════════════ */}
        <div className="hidden md:block max-w-[1100px] mx-auto px-8 pt-6">
          <div className="grid grid-cols-2 gap-14">
            
            {/* Left: Object chamber */}
            <div>
              {/* Main view - object presence */}
              <div className="relative h-[58vh] flex items-center justify-center mb-4">
                {/* Depth: dead black */}
                <div className="absolute inset-0 bg-black" />
                
                {/* Object with presence amplification - video or image */}
                {gallery[activeImage]?.type === "video" ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={gallery[activeImage].poster}
                    className={`
                      relative z-10 w-full h-full object-cover
                      transition-all duration-500
                      ${isTransitioning 
                        ? "opacity-0 scale-[0.97]" 
                        : "opacity-100 scale-100"}
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
                      relative z-10 max-w-[88%] max-h-full object-contain
                      transition-all duration-500
                      ${isTransitioning 
                        ? "opacity-0 scale-[0.97]" 
                        : "opacity-100 scale-100"}
                    `}
                    style={{ 
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      filter: isTransitioning 
                        ? "brightness(0.96) contrast(1)" 
                        : "brightness(1.025) contrast(1.015) drop-shadow(0 45px 90px rgba(0,0,0,0.8))"
                    }}
                  />
                )}
              </div>
              <div className="flex justify-center gap-1.5">
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
                        w-11 h-11 rounded-sm overflow-hidden
                        transition-all duration-150
                        ${isActive 
                          ? "opacity-65 ring-[0.5px] ring-white/30" 
                          : shouldDim 
                            ? "opacity-10" 
                            : "opacity-18 hover:opacity-45"}
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
                          style={{
                            filter: isActive || isHovered ? "brightness(1.05)" : "brightness(0.9)"
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Inspection panel - no section breaks */}
            <div className="pt-4">
              <p className="text-[9px] tracking-[0.4em] text-white/25 mb-2">RING</p>
              <h2 className="text-[32px] tracking-[0.015em] font-light text-white/90 mb-1">LA BÊTE</h2>
              <p className="text-white/40 text-[14px] mb-6">{product.tagline}</p>

              <p className="text-[8px] tracking-[0.35em] text-white/20 mb-3">SELECT CONFIGURATION</p>
              <div className="space-y-2 mb-6">
                {visibleTiers.map(([key, tier]) => {
                  const isActive = selectedTier === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedTier(key)}
                      className={`
                        cursor-pointer rounded-lg px-3.5 py-3
                        transition-all duration-300
                        ${isActive 
                          ? "bg-white/[0.02] border border-white/15" 
                          : "border border-white/[0.04] hover:border-white/8"}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className={`text-[9px] tracking-[0.2em] ${isActive ? "text-white/60" : "text-white/28"}`}>
                              {tier.label}
                            </p>
                            {tier.badge && (
                              <span className="text-[7px] tracking-[0.1em] bg-white/90 text-black px-1.5 py-0.5 rounded-full">
                                {tier.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] ${isActive ? "text-white/40" : "text-white/18"}`}>
                            {tier.metal} · {tier.stones}
                          </p>
                          {tier.description && (
                            <p className={`text-[9px] mt-0.5 ${isActive ? "text-white/25" : "text-white/12"}`}>
                              {tier.description}
                            </p>
                          )}
                        </div>
                        <p className={`text-[14px] ${isActive ? "text-white/70" : "text-white/30"}`}>
                          {tierPricesLive[key]?.formatted || `$${product.pricing[key].toLocaleString()}`} USD
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Size & Qty */}
              <div className="flex gap-3 mb-5">
                <div className="flex-1">
                  <p className="text-[8px] tracking-[0.35em] text-white/20 mb-2">SIZE</p>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-transparent border border-white/6 rounded-md px-3 py-2.5 text-[12px] text-white/55 focus:outline-none focus:border-white/15 transition-colors"
                  >
                    <option value="" disabled className="bg-black">Select your size</option>
                    {["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"].map(s => (
                      <option key={s} value={s} className="bg-black">{s}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <p className="text-[8px] tracking-[0.35em] text-white/20 mb-2">QTY</p>
                  <div className="flex items-center border border-white/6 rounded-md h-[38px]">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2.5 text-white/28 hover:text-white/45 transition-colors">−</button>
                    <span className="flex-1 text-center text-[12px] text-white/55">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-2.5 text-white/28 hover:text-white/45 transition-colors">+</button>
                  </div>
                </div>
              </div>

              <button 
                onClick={onAddToCart}
                disabled={isAdding || !selectedSize}
                className="w-full bg-white text-black rounded-md py-3.5 text-[10px] tracking-[0.18em] font-medium hover:bg-white/92 disabled:opacity-22 disabled:cursor-not-allowed transition-all duration-300 mb-4"
              >
                {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "CLAIM YOURS"}
              </button>

              <p className="text-[9px] text-white/18 leading-relaxed mb-8">
                Made to order · Allow production time · Limited numbers
              </p>

              {/* Craft - the seal */}
              <div className="border-t border-white/[0.03] pt-6">
                <p className="text-[8px] tracking-[0.3em] text-white/20 mb-4">CRAFT</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] text-white/35 mb-0.5">01 — FORMED</p>
                    <p className="text-[11px] text-white/25 leading-relaxed">The grille is recast as a ring. Every curve deliberate.</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/35 mb-0.5">02 — SET</p>
                    <p className="text-[11px] text-white/25 leading-relaxed">Stone by stone, the face tightens into controlled light.</p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/[0.02]">
                  <p className="text-[10px] text-white/20 italic leading-relaxed">
                    Chrome becomes gold. Carbon becomes stone.<br />
                    <span className="text-white/35 not-italic">The grille becomes TRIBUTE.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE SEAL */}
      <section className="py-20 md:py-28">
        <div className="text-center">
          <p className="text-[15px] md:text-[17px] text-white/45 font-light leading-relaxed">
            Not driven.<br />
            <span className="text-white/65">Worn.</span>
          </p>
        </div>
      </section>

      {/* Perception control styles */}
      <style>{`
        .duration-150 { transition-duration: 150ms; }
        .duration-200 { transition-duration: 200ms; }
        .duration-250 { transition-duration: 250ms; }
        .duration-400 { transition-duration: 400ms; }
        .duration-500 { transition-duration: 500ms; }
        .duration-600 { transition-duration: 600ms; }
        .duration-700 { transition-duration: 700ms; }
        .opacity-18 { opacity: 0.18; }
        .opacity-22 { opacity: 0.22; }
      `}</style>
    </div>
  );
}
