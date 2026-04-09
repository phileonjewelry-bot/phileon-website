import { useState, useEffect, useRef } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

/* ═══════════════════════════════════════════════════════════════
   TRIBUTE: LA BÊTE — "The Beast"
   Bugatti-inspired white gold ring
   Full diamond pavé with horseshoe grille motif
   
   UNTOUCHABLE MODE — Cinematic Flagship Experience
═══════════════════════════════════════════════════════════════ */

export default function LaBetePage() {
  const product = products.labete;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(1);
  const [prevImage, setPrevImage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Scroll-linked motion refs
  const heroRef = useRef(null);
  const galleryRef = useRef(null);
  const titleRef = useRef(null);
  const craftRef = useRef(null);
  const closingRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [craftVisible, setCraftVisible] = useState(false);
  const [closingVisible, setClosingVisible] = useState(false);

  const currentPrice = product.pricing[selectedTier];
  const currentTier = product.tiers[selectedTier];
  const gallery = product.gallery;

  // Smooth image transition handler
  const handleImageChange = (newIndex) => {
    if (newIndex === activeImage || isTransitioning) return;
    setPrevImage(activeImage);
    setIsTransitioning(true);
    setActiveImage(newIndex);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  // Scroll physics - parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for reveal animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === galleryRef.current && entry.isIntersecting) {
          setGalleryVisible(true);
        }
        if (entry.target === titleRef.current && entry.isIntersecting) {
          setTitleVisible(true);
        }
        if (entry.target === craftRef.current && entry.isIntersecting) {
          setCraftVisible(true);
        }
        if (entry.target === closingRef.current && entry.isIntersecting) {
          setClosingVisible(true);
        }
      });
    }, observerOptions);

    if (galleryRef.current) observer.observe(galleryRef.current);
    if (titleRef.current) observer.observe(titleRef.current);
    if (craftRef.current) observer.observe(craftRef.current);
    if (closingRef.current) observer.observe(closingRef.current);

    return () => observer.disconnect();
  }, []);

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

  // Hero parallax calculation (subtle 12px range)
  const heroParallax = Math.min(scrollY * 0.04, 12);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO — Cinematic World Entry with Parallax
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full h-[50vh] md:h-[75vh] overflow-hidden">
        {/* Hero Image with subtle parallax */}
        <div 
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${heroParallax}px) scale(1.02)` }}
        >
          <img
            src={product.heroImage}
            alt="TRIBUTE: LA BÊTE hero"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Filmic atmosphere layers */}
        <div className="absolute inset-0 bg-black/25" />
        
        {/* Cool tone bias - very subtle blue in shadows */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 via-transparent to-transparent mix-blend-overlay" />
        
        {/* Vignette - darkening toward edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
        
        {/* CONTENT - Bottom left aligned */}
        <div className="relative z-10 flex flex-col justify-end h-full px-[6vw] pb-36 md:pb-48">
          <div className="w-full max-w-[520px] animate-[heroReveal_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards]">
            
            <p className="text-white/55 tracking-[0.35em] text-[10px] leading-none mb-2">
              PHILEON
            </p>
            
            <p className="text-white/45 tracking-[0.25em] text-[10px] leading-none mb-3">
              COLLECTIVE — GENTS
            </p>
            
            <h1 className="text-white font-serif text-[clamp(2rem,5vw,3.8rem)] tracking-[-0.01em] leading-[1.08] mb-2">
              TRIBUTE: LA BÊTE
            </h1>
            
            <p className="text-white/70 text-[clamp(0.85rem,1.3vw,1.1rem)] leading-[1.4] mb-3">
              Born in the showroom.<br />
              Built for the hand.
            </p>
            
            <p className="text-white/45 text-xs md:text-sm tracking-[0.1em]">
              From $7,400 CAD
            </p>
            
          </div>
        </div>
        
        {/* Strong cinematic fade — hero dissolves into black */}
        <div className="absolute bottom-0 left-0 w-full h-44 md:h-64 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          GALLERY — Floating Object Reveal (Mobile)
      ═══════════════════════════════════════════════════════════════ */}
      <section 
        ref={galleryRef}
        className={`
          relative z-10 -mt-32 md:-mt-44 md:hidden
          transition-all duration-700 ease-out
          ${galleryVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-8"}
        `}
      >
        <div className="mx-auto w-full max-w-[520px] px-4">
          {/* Main Image — floating on black with transition */}
          <div className="w-full h-[38vh] flex items-center justify-center relative">
            {/* Current image with smooth transition */}
            <img
              src={gallery[activeImage].src}
              alt={gallery[activeImage].alt || ""}
              className={`
                absolute max-w-full max-h-full object-contain
                transition-all duration-400 ease-out
                ${isTransitioning 
                  ? "opacity-100 scale-[1.02]" 
                  : "opacity-100 scale-[1.05]"}
              `}
              style={{
                filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))",
              }}
            />
          </div>
          
          {/* Thumbnails — subtle, secondary */}
          <div className="w-full mt-5 overflow-x-auto flex gap-2.5 justify-center">
            {gallery.map((item, index) => (
              <button
                key={`thumb-mobile-${index}`}
                onClick={() => handleImageChange(index)}
                className={`
                  flex-shrink-0 w-11 h-11 rounded-md overflow-hidden 
                  transition-all duration-300 ease-out
                  ${activeImage === index 
                    ? "opacity-100 ring-1 ring-white/40 scale-[1.08]" 
                    : "opacity-40"}
                `}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT - Desktop: Gallery + Purchase Panel
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-12 grid md:grid-cols-2 gap-8 md:gap-16">
        
        {/* LEFT - Gallery (Desktop only) */}
        <div className="hidden md:flex flex-col items-center">
          
          {/* Main Image with premium transition */}
          <div className="w-full max-w-[520px] h-[50vh] bg-[#050505] rounded-[12px] overflow-hidden relative">
            <img
              src={gallery[activeImage].src}
              alt={gallery[activeImage].alt || ""}
              className={`
                absolute inset-0 w-full h-full object-cover object-center
                transition-all duration-500 ease-out
                ${isTransitioning 
                  ? "opacity-92 scale-100" 
                  : "opacity-100 scale-[1.02]"}
              `}
            />
            {/* Subtle inner shadow for depth */}
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.3)] pointer-events-none" />
          </div>
          
          {/* Desktop Thumbnails — surgical precision */}
          <div className="w-full mt-5 overflow-x-auto flex gap-3 justify-center">
            {gallery.map((item, index) => (
              <button
                key={`thumb-desktop-${index}`}
                onClick={() => handleImageChange(index)}
                onMouseEnter={() => handleImageChange(index)}
                className={`
                  flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden 
                  transition-all duration-300 ease-out
                  ${activeImage === index 
                    ? "opacity-100 ring-1 scale-[1.06]" 
                    : "opacity-35 hover:opacity-60"}
                `}
                style={{
                  boxShadow: activeImage === index 
                    ? "0 0 0 1px rgba(212, 175, 125, 0.5), 0 0 20px rgba(212, 175, 125, 0.15)" 
                    : "none"
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT - Purchase Panel */}
        <div 
          ref={titleRef}
          className={`
            md:sticky md:top-20 h-fit
            transition-all duration-700 ease-out delay-100
            ${titleVisible 
              ? "opacity-100 translate-y-0" 
              : "md:opacity-0 md:translate-y-6 opacity-100 translate-y-0"}
          `}
        >
          
          {/* Category & Title */}
          <p className="text-xs tracking-[0.28em] text-white/50 mb-3">
            RING
          </p>
          <h2 className="text-4xl md:text-5xl tracking-[0.02em] font-light mb-2">
            LA BÊTE
          </h2>
          <p className="text-white/65 mb-6">{product.tagline}</p>

          {/* Tier Selection */}
          <div className="mb-6">
            <p className="text-xs tracking-[0.25em] opacity-45 mb-4">
              SELECT CONFIGURATION
            </p>
            <div className="space-y-3">
              {visibleTiers.map(([key, tier]) => {
                const isActive = selectedTier === key;
                
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    data-testid={`labete-tier-${key}`}
                    className={`
                      relative cursor-pointer rounded-xl p-4 
                      transition-all duration-300 ease-out
                      ${isActive 
                        ? "border border-white/80 bg-white/[0.03]" 
                        : "border border-white/8 hover:border-white/20"}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-xs tracking-[0.2em] transition-opacity duration-300 ${isActive ? "opacity-85" : "opacity-45"}`}>
                            {tier.label}
                          </p>
                          {tier.badge && (
                            <span className="text-[9px] tracking-[0.12em] bg-white text-black px-2 py-0.5 rounded-full">
                              {tier.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mb-1 transition-opacity duration-300 ${isActive ? "opacity-75" : "opacity-50"}`}>
                          {tier.metal} · {tier.stones}
                        </p>
                        {tier.description && (
                          <p className={`text-xs transition-opacity duration-300 ${isActive ? "opacity-50" : "opacity-30"}`}>
                            {tier.description}
                          </p>
                        )}
                      </div>
                      <p className={`text-lg ml-4 transition-all duration-300 ${isActive ? "text-white" : "opacity-60"}`}>
                        ${product.pricing[key].toLocaleString()} CAD
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="mb-4">
            <p className="text-xs tracking-[0.25em] opacity-45 mb-3">
              SIZE
            </p>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              data-testid="labete-size-select"
              className="w-full bg-black border border-white/12 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40 transition-all duration-300"
            >
              <option value="" disabled>Select your size</option>
              <option value="6">6</option>
              <option value="6.5">6.5</option>
              <option value="7">7</option>
              <option value="7.5">7.5</option>
              <option value="8">8</option>
              <option value="8.5">8.5</option>
              <option value="9">9</option>
              <option value="9.5">9.5</option>
              <option value="10">10</option>
              <option value="10.5">10.5</option>
              <option value="11">11</option>
              <option value="11.5">11.5</option>
              <option value="12">12</option>
              <option value="custom">Custom Size (Contact)</option>
            </select>
          </div>

          {/* QUANTITY SELECTOR */}
          <div className="mb-6">
            <p className="text-xs tracking-[0.25em] opacity-45 mb-3">
              QUANTITY
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-white/12 flex items-center justify-center hover:border-white/25 transition-all duration-300"
              >
                −
              </button>
              <span className="text-lg w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-white/12 flex items-center justify-center hover:border-white/25 transition-all duration-300"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            onClick={onAddToCart}
            disabled={isAdding || !selectedSize}
            data-testid="labete-add-to-cart"
            className="w-full bg-white text-black rounded-xl py-4 tracking-[0.12em] text-sm font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed mb-4"
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED!" : "CLAIM YOURS"}
          </button>

          {/* Order Info */}
          <div className="space-y-2 text-xs text-white/40">
            <p>Made to order. Please allow production time.</p>
            <p>Crafted to order in your selected configuration.</p>
            <p>Limited production. Built in small numbers.</p>
            <p>Final delivery timing confirmed after order review.</p>
          </div>

          {/* Divider */}
          <div className="border-t border-white/8 my-8" />

          {/* CRAFT Section */}
          <div 
            ref={craftRef}
            className={`
              transition-all duration-700 ease-out delay-200
              ${craftVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"}
            `}
          >
            <h3 className="text-sm tracking-[0.2em] text-white/55 mb-6">CRAFT</h3>
            
            <div className="space-y-6">
              {/* 01 FORMED */}
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-white/30 text-xs">01</span>
                  <span className="text-white/80 text-sm tracking-[0.15em]">FORMED</span>
                </div>
                <p className="text-white/55 text-sm leading-relaxed pl-8">
                  The grille is recast as a ring. Every curve kept deliberate. Every surface built to read with force.
                </p>
              </div>
              
              {/* 02 SET */}
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-white/30 text-xs">02</span>
                  <span className="text-white/80 text-sm tracking-[0.15em]">SET</span>
                </div>
                <p className="text-white/55 text-sm leading-relaxed pl-8">
                  Stone by stone, the face is tightened into a controlled field of light. Precision first. Excess, disciplined.
                </p>
              </div>
            </div>
            
            {/* Poetic transition */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-white/45 text-sm leading-relaxed italic">
                Chrome becomes gold.<br />
                Carbon becomes stone.
              </p>
              <p className="text-white/65 text-sm mt-4">
                The grille becomes TRIBUTE.
              </p>
            </div>
          </div>

          {/* Shipping */}
          <p className="mt-8 text-xs text-white/35">
            {product.shipping}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CLOSING STATEMENT
      ═══════════════════════════════════════════════════════════════ */}
      <section 
        ref={closingRef}
        className={`
          py-28 bg-black
          transition-all duration-1000 ease-out
          ${closingVisible 
            ? "opacity-100" 
            : "opacity-0"}
        `}
      >
        <div className="text-center max-w-xl mx-auto px-6">
          <p className={`
            text-xl md:text-2xl leading-relaxed text-white font-light
            transition-all duration-1000 ease-out delay-200
            ${closingVisible 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"}
          `}>
            Not driven.<br />
            Worn.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CINEMATIC MOTION STYLES
      ═══════════════════════════════════════════════════════════════ */}
      <style>{`
        /* Hero reveal - restrained fade up */
        @keyframes heroReveal {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Premium easing curve */
        .ease-out {
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Duration utilities */
        .duration-400 {
          transition-duration: 400ms;
        }
        
        /* Opacity fine control */
        .opacity-92 {
          opacity: 0.92;
        }
        
        /* Subtle metallic glow for active thumbnails */
        .ring-gold {
          box-shadow: 0 0 0 1px rgba(212, 175, 125, 0.4), 
                      0 0 16px rgba(212, 175, 125, 0.1);
        }
        
        /* Prevent layout shifts during transitions */
        .will-change-transform {
          will-change: transform;
        }
        
        /* Smooth scroll for the page */
        html {
          scroll-behavior: smooth;
        }
        
        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
