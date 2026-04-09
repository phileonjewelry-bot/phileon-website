import { useState, useEffect, useRef } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

/* ═══════════════════════════════════════════════════════════════
   TRIBUTE: LA BÊTE — "The Beast"
   
   EDITORIAL CINEMA WITH A BUY BUTTON
   
   Sequence: WORLD → DESCENT → REVEAL → INSPECTION → ACQUISITION
   Not: hero / gallery / title / product info
═══════════════════════════════════════════════════════════════ */

export default function LaBetePage() {
  const product = products.labete;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Scroll state
  const [scrollY, setScrollY] = useState(0);
  const [hasRevealed, setHasRevealed] = useState(false);

  const currentPrice = product.pricing[selectedTier];
  const currentTier = product.tiers[selectedTier];
  const gallery = product.gallery;

  // Heavy, deliberate image transition
  const handleImageChange = (newIndex) => {
    if (newIndex === activeImage || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveImage(newIndex);
      setTimeout(() => setIsTransitioning(false), 500);
    }, 150);
  };

  // Scroll tracking for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (window.scrollY > 100 && !hasRevealed) {
        setHasRevealed(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasRevealed]);

  const onAddToCart = () => {
    handleAddToCart({
      id: `labete-${selectedTier}-${selectedSize}`,
      name: `LA BÊTE — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      price: currentPrice,
      metal: currentTier.metal,
      size: selectedSize,
      quantity: quantity,
      image: product.gallery[0].src,
    });
  };

  const visibleTiers = Object.entries(product.tiers).filter(([key, tier]) => !tier.hiddenFromHero);

  // Parallax calculation - subtle, engineered
  const heroParallax = Math.min(scrollY * 0.035, 14);
  const heroOpacity = Math.max(1 - scrollY * 0.0015, 0.3);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════
          PHASE 1: WORLD — The environment establishes
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[55vh] md:h-[80vh] overflow-hidden">
        
        {/* Hero image with parallax - dissolves into the void */}
        <div 
          className="absolute inset-0 will-change-transform"
          style={{ 
            transform: `translateY(${heroParallax}px) scale(1.03)`,
            opacity: heroOpacity
          }}
        >
          <img
            src={product.heroImage}
            alt="TRIBUTE: LA BÊTE"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Atmospheric layers - the world darkens as you descend */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
        
        {/* Title block - part of the world, not UI */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-[6vw] pb-40 md:pb-56">
          <div 
            className="w-full max-w-[480px]"
            style={{
              opacity: Math.max(1 - scrollY * 0.003, 0),
              transform: `translateY(${Math.min(scrollY * 0.15, 30)}px)`
            }}
          >
            <p className="text-white/40 tracking-[0.4em] text-[9px] leading-none mb-2">
              PHILEON
            </p>
            <p className="text-white/30 tracking-[0.3em] text-[9px] leading-none mb-4">
              COLLECTIVE — GENTS
            </p>
            <h1 className="text-white/90 font-serif text-[clamp(1.8rem,4.5vw,3.5rem)] tracking-[-0.01em] leading-[1.05] mb-3">
              TRIBUTE: LA BÊTE
            </h1>
            <p className="text-white/50 text-[clamp(0.8rem,1.2vw,1rem)] leading-[1.5]">
              Born in the showroom.<br />
              Built for the hand.
            </p>
          </div>
        </div>
        
        {/* THE DISSOLUTION — hero doesn't end, it dissolves into the chamber */}
        <div className="absolute bottom-0 left-0 w-full h-[55%] bg-gradient-to-b from-transparent via-black/60 to-black pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PHASE 2 & 3: DESCENT → REVEAL — The object emerges from darkness
          
          This is NOT a gallery section.
          This is the continuation of the same black chamber.
          The object was always here. You just moved closer.
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative -mt-32 md:-mt-48">
        
        {/* Mobile: Object suspended in the void */}
        <div className="md:hidden">
          <div className="relative mx-auto w-full max-w-[400px] px-4">
            
            {/* The object — not an image in a box, but a presence in the chamber */}
            <div 
              className={`
                relative h-[42vh] flex items-center justify-center
                transition-all duration-700
                ${hasRevealed ? "opacity-100" : "opacity-0 translate-y-4"}
              `}
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              <img
                src={gallery[activeImage].src}
                alt={gallery[activeImage].alt || ""}
                className={`
                  max-w-[92%] max-h-full object-contain
                  transition-all duration-600
                  ${isTransitioning ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"}
                `}
                style={{ 
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.8))"
                }}
              />
            </div>
            
            {/* Instrument panel — not a photo strip, precision controls */}
            <div 
              className={`
                flex justify-center gap-[6px] mt-3 mb-8
                transition-all duration-700 delay-200
                ${hasRevealed ? "opacity-60" : "opacity-0"}
              `}
            >
              {gallery.map((item, index) => (
                <button
                  key={`ctrl-${index}`}
                  onClick={() => handleImageChange(index)}
                  className={`
                    w-[7px] h-[7px] rounded-full
                    transition-all duration-400
                    ${activeImage === index 
                      ? "bg-white/70 scale-110" 
                      : "bg-white/20 hover:bg-white/30"}
                  `}
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  aria-label={`View ${item.alt}`}
                />
              ))}
            </div>
            
            {/* Thumbnail instrument strip — whisper quiet, only when needed */}
            <div 
              className={`
                flex justify-center gap-1.5 mb-6
                transition-all duration-700 delay-300
                ${hasRevealed ? "opacity-40" : "opacity-0"}
              `}
            >
              {gallery.slice(0, 6).map((item, index) => (
                <button
                  key={`thumb-${index}`}
                  onClick={() => handleImageChange(index)}
                  className={`
                    w-8 h-8 rounded overflow-hidden
                    transition-all duration-400
                    ${activeImage === index 
                      ? "opacity-80 ring-[0.5px] ring-white/30" 
                      : "opacity-25 hover:opacity-40"}
                  `}
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  <img
                    src={item.src}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            PHASE 4: INSPECTION — The details resolve
            
            This flows directly from the reveal.
            No section break. The next breath after seeing.
        ═══════════════════════════════════════════════════════════════ */}
        
        {/* Mobile: Inspection panel */}
        <div className="md:hidden px-5 max-w-[420px] mx-auto">
          
          {/* Product identity — not a header, a whisper */}
          <div className={`
            mb-5
            transition-all duration-700 delay-400
            ${hasRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}>
            <p className="text-[10px] tracking-[0.3em] text-white/35 mb-2">RING</p>
            <h2 className="text-2xl tracking-[0.03em] font-light text-white/90 mb-1">LA BÊTE</h2>
            <p className="text-white/40 text-sm">{product.tagline}</p>
          </div>

          {/* Configuration — precision selection */}
          <div className={`
            mb-5
            transition-all duration-700 delay-500
            ${hasRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}>
            <p className="text-[9px] tracking-[0.3em] text-white/30 mb-3">CONFIGURATION</p>
            <div className="space-y-2">
              {visibleTiers.map(([key, tier]) => {
                const isActive = selectedTier === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    className={`
                      relative cursor-pointer rounded-lg px-3 py-3
                      transition-all duration-400
                      ${isActive 
                        ? "bg-white/[0.03] border border-white/20" 
                        : "border border-white/[0.06] hover:border-white/10"}
                    `}
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-[10px] tracking-[0.2em] ${isActive ? "text-white/70" : "text-white/35"}`}>
                            {tier.label}
                          </p>
                          {tier.badge && (
                            <span className="text-[8px] tracking-[0.1em] bg-white/90 text-black px-1.5 py-0.5 rounded-full">
                              {tier.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${isActive ? "text-white/50" : "text-white/25"}`}>
                          {tier.metal}
                        </p>
                      </div>
                      <p className={`text-sm ${isActive ? "text-white/80" : "text-white/40"}`}>
                        ${product.pricing[key].toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Size & Quantity — minimal */}
          <div className={`
            flex gap-3 mb-5
            transition-all duration-700 delay-600
            ${hasRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}>
            <div className="flex-1">
              <p className="text-[9px] tracking-[0.3em] text-white/30 mb-2">SIZE</p>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-white/25 transition-colors duration-300"
              >
                <option value="" disabled className="bg-black">Select</option>
                {["6", "7", "8", "9", "10", "11", "12"].map(s => (
                  <option key={s} value={s} className="bg-black">{s}</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <p className="text-[9px] tracking-[0.3em] text-white/30 mb-2">QTY</p>
              <div className="flex items-center border border-white/10 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 text-white/40 hover:text-white/60">−</button>
                <span className="flex-1 text-center text-sm text-white/70">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 text-white/40 hover:text-white/60">+</button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              PHASE 5: ACQUISITION — The transaction
          ═══════════════════════════════════════════════════════════════ */}
          <button 
            onClick={onAddToCart}
            disabled={isAdding || !selectedSize}
            className={`
              w-full bg-white text-black rounded-lg py-3.5 
              text-[11px] tracking-[0.15em] font-medium
              hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-400 mb-4
              ${hasRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
            `}
            style={{ 
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "700ms"
            }}
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "CLAIM YOURS"}
          </button>

          {/* Order info — afterthought, not feature */}
          <p className={`
            text-[10px] text-white/25 leading-relaxed mb-8
            transition-all duration-700 delay-[800ms]
            ${hasRevealed ? "opacity-100" : "opacity-0"}
          `}>
            Made to order · Allow production time · Limited numbers
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            DESKTOP: Full inspection layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="hidden md:block max-w-6xl mx-auto px-8 pt-8">
          <div className="grid grid-cols-2 gap-16">
            
            {/* Left: The object in the chamber */}
            <div>
              {/* Main view — suspended in darkness */}
              <div className="relative h-[55vh] flex items-center justify-center mb-5">
                <img
                  src={gallery[activeImage].src}
                  alt={gallery[activeImage].alt || ""}
                  className={`
                    max-w-[90%] max-h-full object-contain
                    transition-all duration-600
                    ${isTransitioning ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"}
                  `}
                  style={{ 
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                    filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.7))"
                  }}
                />
              </div>
              
              {/* Instrument panel — surgical precision */}
              <div className="flex justify-center gap-2">
                {gallery.map((item, index) => (
                  <button
                    key={`dt-${index}`}
                    onClick={() => handleImageChange(index)}
                    onMouseEnter={() => handleImageChange(index)}
                    className={`
                      w-12 h-12 rounded overflow-hidden
                      transition-all duration-400
                      ${activeImage === index 
                        ? "opacity-70 ring-[0.5px] ring-white/25" 
                        : "opacity-20 hover:opacity-35"}
                    `}
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  >
                    <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Inspection panel */}
            <div className="pt-8">
              <p className="text-[10px] tracking-[0.35em] text-white/30 mb-3">RING</p>
              <h2 className="text-4xl tracking-[0.02em] font-light text-white/90 mb-2">LA BÊTE</h2>
              <p className="text-white/45 mb-8">{product.tagline}</p>

              {/* Configuration */}
              <p className="text-[9px] tracking-[0.3em] text-white/25 mb-4">SELECT CONFIGURATION</p>
              <div className="space-y-2.5 mb-8">
                {visibleTiers.map(([key, tier]) => {
                  const isActive = selectedTier === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedTier(key)}
                      className={`
                        cursor-pointer rounded-lg px-4 py-3.5
                        transition-all duration-400
                        ${isActive 
                          ? "bg-white/[0.025] border border-white/15" 
                          : "border border-white/[0.05] hover:border-white/10"}
                      `}
                      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={`text-[10px] tracking-[0.2em] ${isActive ? "text-white/65" : "text-white/30"}`}>
                              {tier.label}
                            </p>
                            {tier.badge && (
                              <span className="text-[8px] tracking-[0.1em] bg-white/90 text-black px-1.5 py-0.5 rounded-full">
                                {tier.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${isActive ? "text-white/45" : "text-white/20"}`}>
                            {tier.metal} · {tier.stones}
                          </p>
                          {tier.description && (
                            <p className={`text-[10px] mt-1 ${isActive ? "text-white/30" : "text-white/15"}`}>
                              {tier.description}
                            </p>
                          )}
                        </div>
                        <p className={`text-base ${isActive ? "text-white/75" : "text-white/35"}`}>
                          ${product.pricing[key].toLocaleString()} CAD
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Size & Quantity */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <p className="text-[9px] tracking-[0.3em] text-white/25 mb-2">SIZE</p>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-transparent border border-white/8 rounded-lg px-4 py-3 text-sm text-white/60 focus:outline-none focus:border-white/20 transition-colors"
                  >
                    <option value="" disabled className="bg-black">Select your size</option>
                    {["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"].map(s => (
                      <option key={s} value={s} className="bg-black">{s}</option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <p className="text-[9px] tracking-[0.3em] text-white/25 mb-2">QTY</p>
                  <div className="flex items-center border border-white/8 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-3 text-white/30 hover:text-white/50 transition-colors">−</button>
                    <span className="flex-1 text-center text-sm text-white/60">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-3 text-white/30 hover:text-white/50 transition-colors">+</button>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button 
                onClick={onAddToCart}
                disabled={isAdding || !selectedSize}
                className="w-full bg-white text-black rounded-lg py-4 text-[11px] tracking-[0.15em] font-medium hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 mb-5"
              >
                {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "CLAIM YOURS"}
              </button>

              {/* Order info */}
              <div className="text-[10px] text-white/20 leading-relaxed space-y-1 mb-10">
                <p>Made to order. Allow production time.</p>
                <p>Limited numbers. Delivery confirmed after review.</p>
              </div>

              {/* Craft — the final breath */}
              <div className="border-t border-white/[0.04] pt-8">
                <p className="text-[9px] tracking-[0.25em] text-white/25 mb-5">CRAFT</p>
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] text-white/40 mb-1">01 — FORMED</p>
                    <p className="text-xs text-white/30 leading-relaxed">
                      The grille is recast as a ring. Every curve deliberate.
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 mb-1">02 — SET</p>
                    <p className="text-xs text-white/30 leading-relaxed">
                      Stone by stone, the face tightens into controlled light.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-white/[0.03]">
                  <p className="text-xs text-white/25 italic leading-relaxed">
                    Chrome becomes gold. Carbon becomes stone.<br />
                    <span className="text-white/40 not-italic">The grille becomes TRIBUTE.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CLOSING — The seal
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32">
        <div className="text-center">
          <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed">
            Not driven.<br />
            <span className="text-white/70">Worn.</span>
          </p>
        </div>
      </section>

      {/* Motion language */}
      <style>{`
        .duration-400 { transition-duration: 400ms; }
        .duration-600 { transition-duration: 600ms; }
        .delay-400 { transition-delay: 400ms; }
        .delay-500 { transition-delay: 500ms; }
        .delay-600 { transition-delay: 600ms; }
      `}</style>
    </div>
  );
}
