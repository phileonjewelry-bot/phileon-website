import React, { useState, useRef, useEffect } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import { useLivePrice, useLiveTierPrices } from "@/hooks/useLivePrice";

/* ═══════════════════════════════════════════════════════════════
   BOUND — THE BUSTIER BANGLE
   Luxury Editorial Product Page
   Cartier-level cinematic experience
═══════════════════════════════════════════════════════════════ */

const BoundPage = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedTier, setSelectedTier] = useState("signature");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const galleryRef = useRef(null);
  const videoRef = useRef(null);
  const modalVideoRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Get pricing from products.js
  const boundPricing = products.bound.pricing;
  const tierPrices = useLiveTierPrices("bound");
  const { formatted: ctaPrice } = useLivePrice("bound", selectedTier, boundPricing[selectedTier]);

  // Close modal and stop video
  const closeVideoModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.currentTime = 0;
    }
    setIsVideoModalOpen(false);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVideoModalOpen) {
        closeVideoModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVideoModalOpen]);

  // Trigger hero load animation
  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const tiers = {
    foundation: {
      name: "Foundation",
      metal: "10K Yellow Gold",
      price: boundPricing.foundation,
      description: "Built for presence."
    },
    signature: {
      name: "Signature",
      metal: "14K Yellow Gold",
      price: boundPricing.signature,
      badge: "SIGNATURE",
      description: "Balanced weight and clarity."
    },
    heirloom: {
      name: "Heirloom",
      metal: "18K Yellow Gold",
      price: boundPricing.heirloom,
      badge: "HEIRLOOM",
      description: "Maximum richness and permanence."
    }
  };

  // Complete gallery with ALL images in correct order (video first, no duplicate hero)
  const media = [
    {
      src: "/videos/bound-hero.mp4",
      poster: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/5j1sg8o1_1000144008.png",
      alt: "BOUND product video",
      type: "video"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_66f130cc-5570-4637-a9c3-d393428997f1/artifacts/px6jqw9c_1000143911.png",
      alt: "BOUND editorial wrist black dress",
      type: "image"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/xrcki9ji_1000143865.png",
      alt: "BOUND clean product front",
      type: "image"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_66f130cc-5570-4637-a9c3-d393428997f1/artifacts/4ujxm427_1000143869.png",
      alt: "BOUND angle product shot",
      type: "image"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/4ha15kss_1000143886.webp",
      alt: "BOUND sculptural floating shot",
      type: "image"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_66f130cc-5570-4637-a9c3-d393428997f1/artifacts/fs69juit_1000143873.webp",
      alt: "BOUND macro diamond mesh detail",
      type: "image"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_66f130cc-5570-4637-a9c3-d393428997f1/artifacts/zwzt7f6l_1000143874.webp",
      alt: "BOUND collection group display",
      type: "image"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/k09vug5v_1000143894.png",
      alt: "BOUND lifestyle champagne setting",
      type: "image"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/videj0m3_1000143867.png",
      alt: "BOUND back interior structure",
      type: "image"
    }
  ];

  const currentTier = tiers[selectedTier];

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageChange = (index) => {
    if (index === activeImage) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveImage(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  // Mobile swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && activeImage < media.length - 1) {
        handleImageChange(activeImage + 1);
      } else if (diff < 0 && activeImage > 0) {
        handleImageChange(activeImage - 1);
      }
    }
  };

  const onAddToCart = () => {
    handleAddToCart({
      id: `bound-bustier-bangle-${selectedTier}`,
      name: "BOUND — The Bustier Bangle",
      image: media[0].src,
      price: tierPrices[selectedTier]?.price || currentTier.price,
      slug: "bound",
      materials: [currentTier.metal]
    }, 1, `${currentTier.name} · ${currentTier.metal}`);
  };

  return (
    <div className="bound-page bg-[#0a0a0a] text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO INTRO SECTION
          Editorial model image - tightened to 85vh
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-hero relative w-full h-[85vh] overflow-hidden bg-black flex items-center justify-center">
        {/* Hero model image - red carpet editorial */}
        <img
          src="https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/dxi7r360_1000143892.png"
          alt="BOUND — The Bustier Bangle"
          className="w-full h-full object-cover object-[center_35%] product-image-hd"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setHeroLoaded(true)}
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0a0a0a]/30 via-transparent to-[#0a0a0a]/30 pointer-events-none" />
        
        {/* Hero text with staged fade-in */}
        <div className="absolute bottom-0 left-0 right-0 pb-16 md:pb-24 lg:pb-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <p className={`hero-text-1 text-[#C6A25D]/60 text-[10px] tracking-[0.5em] uppercase mb-4 ${heroLoaded ? 'loaded' : ''}`}>
              PHILEON — OBJECT SERIES
            </p>
            <h1 className={`hero-text-2 font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-[0.02em] text-white/90 font-light ${heroLoaded ? 'loaded' : ''}`}>
              BOUND
            </h1>
            <p className={`hero-text-3 text-white/40 text-base sm:text-lg md:text-xl tracking-[0.15em] mt-2 font-light ${heroLoaded ? 'loaded' : ''}`}>
              The Bustier Bangle
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`hero-text-3 absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 ${heroLoaded ? 'loaded' : ''}`}>
          <div className="w-[1px] h-10 md:h-12 bg-gradient-to-b from-transparent via-[#C6A25D]/40 to-transparent animate-bounce" />
        </div>
      </section>

      {/* Hero to gallery transition fade */}
      <div className="h-24 md:h-32 bg-gradient-to-b from-[#0a0a0a] to-[#0a0a0a]" />

      {/* ═══════════════════════════════════════════════════════════════
          MAIN PRODUCT SECTION
          2-column layout: Gallery LEFT, Info RIGHT (sticky)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-product py-8 md:py-16 scroll-reveal">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-20">
            
            {/* LEFT — Gallery */}
            <div ref={galleryRef}>
              {/* Main Image/Video with crossfade transition */}
              <div 
                className="bound-gallery-main relative aspect-square overflow-hidden bg-[#0a0a0a] rounded-sm"
                onMouseEnter={() => media[activeImage].type !== 'video' && setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Video item */}
                {media[activeImage].type === 'video' ? (
                  <div 
                    onClick={() => setIsVideoModalOpen(true)} 
                    className="relative w-full h-full cursor-pointer group"
                  >
                    {/* Thumbnail Image */}
                    <img
                      src={media[activeImage].poster}
                      alt={media[activeImage].alt}
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Dark Overlay (subtle) */}
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition" />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center transition group-hover:scale-110">
                        <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
                      </div>
                    </div>
                    
                    {/* Hover Text */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs tracking-widest text-white/70 opacity-0 group-hover:opacity-100 transition uppercase">
                      Play Film
                    </div>
                  </div>
                ) : (
                  /* Image item */
                  <img
                    src={media[activeImage].src}
                    alt={media[activeImage].alt}
                    className={`w-full h-full object-contain product-image-hd transition-all duration-300 ease-out cursor-zoom-in ${
                      isTransitioning ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
                    }`}
                    loading="eager"
                    decoding="async"
                    style={{
                      transform: isZoomed ? `scale(1.8)` : 'scale(1)',
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transition: isZoomed ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out, opacity 0.3s ease, scale 0.3s ease'
                    }}
                  />
                )}
                {/* Mobile swipe indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden">
                  {media.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeImage ? 'bg-[#C6A25D] w-4' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Thumbnails - Full gallery, no limits */}
              <div className="bound-thumbnails flex gap-2 md:gap-3 mt-4 md:mt-6 overflow-x-auto pb-2 px-1">
                {media.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-sm transition-all duration-300 relative ${
                      activeImage === index
                        ? "ring-2 ring-[#C6A25D] shadow-[0_0_12px_rgba(198,162,93,0.4)] brightness-110 scale-105"
                        : "brightness-95 contrast-105 hover:brightness-110 hover:scale-105"
                    }`}
                  >
                    <img
                      src={item.type === 'video' ? item.poster : item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                    {/* Play icon overlay for video thumbnail */}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[6px] border-l-black border-y-[4px] border-y-transparent ml-0.5" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT — Product Info (Sticky) */}
            <div className="lg:sticky lg:top-32 self-start">
              <div className="bound-info">
                <p className="text-[#C6A25D]/50 text-[10px] tracking-[0.4em] uppercase mb-6">
                  PHILEON
                </p>

                <h2 className="font-serif text-4xl md:text-5xl tracking-[0.02em] text-white/90 font-light">
                  BOUND
                </h2>
                <p className="text-white/50 text-lg tracking-[0.1em] mt-1 font-light">
                  The Bustier Bangle
                </p>

                <div className="mt-6 space-y-1">
                  <p className="text-white/40 text-sm italic tracking-wide">
                    La maîtrise du corps
                  </p>
                  <p className="text-white/25 text-xs italic">
                    The discipline of form
                  </p>
                </div>

                <div className="text-[#C6A25D] text-4xl mt-8 tracking-wide font-light">
                  {tierPrices[selectedTier]?.formatted || `$${currentTier.price.toLocaleString()}`} <span className="text-lg text-white/30">CAD</span>
                </div>

                <p className="text-white/50 text-sm mt-2">
                  {currentTier.metal} — {currentTier.description}
                </p>

                {/* Tier Selection */}
                <div className="mt-10">
                  <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4">
                    Select Tier
                  </p>
                  <div className="space-y-3">
                    {Object.entries(tiers).map(([key, tier]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTier(key)}
                        className={`w-full text-left p-5 rounded-sm transition-all duration-300 ${
                          selectedTier === key
                            ? "bg-[#C6A25D]/10 border border-[#C6A25D]/40"
                            : "bg-white/[0.02] border border-white/[0.05] hover:border-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white/80 text-lg tracking-wide">{tier.name}</p>
                            <p className="text-white/30 text-xs mt-1">{tier.metal}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#C6A25D] text-xl">{tierPrices[key]?.formatted || `$${tier.price.toLocaleString()}`}</p>
                            {tier.badge && (
                              <span className="text-[9px] tracking-[0.2em] text-[#C6A25D]/60 uppercase">
                                {tier.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-10 space-y-4">
                  <p className="text-white/60 text-sm leading-relaxed tracking-wide">
                    Form, held in tension.
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    A study in restraint and release —<br />
                    engineered to move with the body,<br />
                    yet command the eye.
                  </p>
                  <div className="text-white/50 text-sm leading-relaxed space-y-0">
                    <p>Balanced.</p>
                    <p>Controlled.</p>
                    <p>Unapologetically intentional.</p>
                  </div>
                  <p className="text-[#C6A25D]/40 text-[10px] tracking-[0.3em] uppercase mt-6">
                    PHILEON — OBJECT SERIES
                  </p>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={onAddToCart}
                  disabled={isAdding}
                  className={`bound-btn w-full mt-10 py-5 text-sm tracking-[0.3em] uppercase transition-all duration-200 ${
                    isAdding
                      ? "bg-green-600 text-white scale-100"
                      : "bg-transparent border border-white/20 text-white/80 hover:scale-[1.02] hover:border-[#C6A25D]/60 hover:shadow-[0_0_20px_rgba(198,162,93,0.25)] hover:text-white active:scale-[0.98]"
                  }`}
                >
                  {isAdding ? buttonText : "ADD TO CART"}
                </button>

                <div className="mt-6 space-y-1 text-center">
                  <p className="text-white/30 text-xs tracking-wide">Sold as a single piece</p>
                  <p className="text-white/20 text-xs">Complimentary insured shipping within Canada</p>
                  <p className="text-white/15 text-[9px] mt-1">Price adjusts automatically with the live precious metals market.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STORY SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-story py-32 md:py-48 scroll-reveal">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h3 className="font-serif text-3xl md:text-4xl text-[#C6A25D]/80 tracking-wide font-light">
            Form that follows you.
          </h3>
          <div className="mt-10 space-y-4 text-white/40 text-lg leading-relaxed">
            <p>Designed to move with the body, not against it.</p>
            <p>Every curve exists with intention.</p>
            <p>Every line holds its place.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DETAIL SECTION — Editorial wrist shot
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-detail scroll-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="aspect-square lg:aspect-auto overflow-hidden">
            <img
              src={media[1].src}
              alt="BOUND worn elegantly"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[6s] ease-out"
            />
          </div>
          <div className="flex items-center justify-center p-12 md:p-20 lg:p-32 bg-[#0a0a0a]">
            <div className="max-w-md">
              <h3 className="font-serif text-2xl md:text-3xl text-[#C6A25D]/80 tracking-wide font-light">
                Felt before it's seen.
              </h3>
              <div className="mt-8 space-y-4 text-white/40 text-base leading-relaxed">
                <p>A surface that softens against the skin.</p>
                <p>A structure that holds without force.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LIFESTYLE SECTION — Collection display
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-lifestyle scroll-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="flex items-center justify-center p-12 md:p-20 lg:p-32 bg-[#0a0a0a] order-2 lg:order-1">
            <div className="max-w-md">
              <h3 className="font-serif text-2xl md:text-3xl text-[#C6A25D]/80 tracking-wide font-light">
                Worn without effort.
              </h3>
              <div className="mt-8 space-y-4 text-white/40 text-base leading-relaxed">
                <p>Not reserved for moments—</p>
                <p>but made to define them.</p>
              </div>
            </div>
          </div>
          <div className="aspect-square lg:aspect-auto order-1 lg:order-2 overflow-hidden">
            <img
              src={media[6].src}
              alt="BOUND in collection"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[6s] ease-out"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CRAFT SECTION — Sculptural angle
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-craft scroll-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="aspect-square lg:aspect-auto overflow-hidden">
            <img
              src={media[3].src}
              alt="BOUND craft detail"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[6s] ease-out"
            />
          </div>
          <div className="flex items-center justify-center p-12 md:p-20 lg:p-32 bg-[#0a0a0a]">
            <div className="max-w-md">
              <h3 className="font-serif text-2xl md:text-3xl text-[#C6A25D]/80 tracking-wide font-light">
                Precision in every line.
              </h3>
              <div className="mt-8 space-y-4 text-white/40 text-base leading-relaxed">
                <p>Each curve engineered.</p>
                <p>Each intersection deliberate.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STRUCTURE SECTION — Back view
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-structure scroll-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="flex items-center justify-center p-12 md:p-20 lg:p-32 bg-[#0a0a0a] order-2 lg:order-1">
            <div className="max-w-md">
              <h3 className="font-serif text-2xl md:text-3xl text-[#C6A25D]/80 tracking-wide font-light">
                Architecture of intention.
              </h3>
              <div className="mt-8 space-y-4 text-white/40 text-base leading-relaxed">
                <p>Every angle considered.</p>
                <p>Every joint resolved.</p>
              </div>
            </div>
          </div>
          <div className="aspect-square lg:aspect-auto order-1 lg:order-2 overflow-hidden">
            <img
              src={media[8].src}
              alt="BOUND structure"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[6s] ease-out"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MACRO SECTION — Diamond mesh detail (Full width)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-macro relative scroll-reveal">
        <div className="aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden">
          <img
            src={media[5].src}
            alt="BOUND macro detail"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-[8s] ease-out"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 md:p-20 text-center">
          <h3 className="font-serif text-2xl md:text-4xl text-white/90 tracking-wide font-light">
            The language of detail.
          </h3>
          <p className="text-white/40 text-base mt-4 tracking-wide">
            Hand-set diamonds. Woven gold mesh. Generations of craft.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SCULPTURAL SECTION — Artistic angle
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-sculptural py-32 md:py-48 scroll-reveal">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-[#C6A25D]/50 text-[10px] tracking-[0.4em] uppercase mb-6">
                THE FORM
              </p>
              <h3 className="font-serif text-3xl md:text-4xl text-white/90 tracking-wide font-light">
                Sculpture, not jewelry.
              </h3>
              <div className="mt-8 space-y-4 text-white/40 text-base leading-relaxed">
                <p>The bustier silhouette reimagined as wearable architecture.</p>
                <p>A piece that exists in three dimensions, demanding attention from every angle.</p>
                <p>Gold mesh breathes. Diamond borders define. The wrist becomes art.</p>
              </div>
            </div>
            <div className="order-1 lg:order-2 overflow-hidden rounded-sm">
              <img
                src={media[4].src}
                alt="BOUND sculptural"
                className="w-full h-auto product-image-hd hover:scale-105 transition-transform duration-[6s] ease-out"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SPEC SECTION — Clean product centered
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-spec py-32 md:py-48 bg-[#050505] scroll-reveal">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[#C6A25D]/50 text-[10px] tracking-[0.4em] uppercase mb-10">
            SPECIFICATIONS
          </p>
          <img
            src={media[2].src}
            alt="BOUND specifications"
            className="w-full h-auto product-image-hd"
            loading="eager"
            decoding="async"
          />
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-[#C6A25D] text-2xl font-serif">18K</p>
              <p className="text-white/30 text-xs tracking-widest uppercase mt-2">Available Gold</p>
            </div>
            <div>
              <p className="text-[#C6A25D] text-2xl font-serif">Mesh</p>
              <p className="text-white/30 text-xs tracking-widest uppercase mt-2">Weave Pattern</p>
            </div>
            <div>
              <p className="text-[#C6A25D] text-2xl font-serif">VS+</p>
              <p className="text-white/30 text-xs tracking-widest uppercase mt-2">Diamond Clarity</p>
            </div>
            <div>
              <p className="text-[#C6A25D] text-2xl font-serif">1</p>
              <p className="text-white/30 text-xs tracking-widest uppercase mt-2">Size · Adjustable</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-final-cta py-32 md:py-48 text-center scroll-reveal">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-[#C6A25D]/40 text-[10px] tracking-[0.5em] uppercase mb-6">
            PHILEON
          </p>
          <h2 className="font-serif text-4xl md:text-6xl tracking-[0.02em] text-white/90 font-light">
            BOUND
          </h2>
          <p className="text-white/40 text-lg tracking-[0.15em] mt-2 font-light">
            The Bustier Bangle
          </p>

          <div className="text-[#C6A25D] text-3xl mt-10 tracking-wide font-light">
            From {tierPrices.foundation?.formatted || `$${tiers.foundation.price.toLocaleString()}`} USD
          </div>

          <button
            onClick={onAddToCart}
            disabled={isAdding}
            className={`bound-btn mt-10 px-16 py-5 text-sm tracking-[0.3em] uppercase transition-all duration-200 ${
              isAdding
                ? "bg-green-600 text-white scale-100"
                : "bg-transparent border border-white/20 text-white/80 hover:scale-[1.02] hover:border-[#C6A25D]/60 hover:shadow-[0_0_20px_rgba(198,162,93,0.25)] hover:text-white active:scale-[0.98]"
            }`}
          >
            {isAdding ? buttonText : "ADD TO CART"}
          </button>

          <p className="text-white/20 text-xs mt-8 tracking-wide">
            Complimentary insured shipping within Canada
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STYLES — Hero motion, load-in, scroll reveal, gallery transitions
      ═══════════════════════════════════════════════════════════════ */}
      <style>{`
        .bound-page {
          font-family: 'Playfair Display', serif;
        }

        /* Hero slow zoom animation */
        .hero-image-wrapper {
          opacity: 0;
          transform: scale(1);
          transition: opacity 1.2s ease-out;
        }
        
        .hero-image-wrapper.loaded {
          opacity: 1;
        }
        
        .hero-image {
          animation: heroZoom 12s ease-in-out infinite alternate;
        }
        
        @keyframes heroZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.06);
          }
        }

        /* Hero text staged fade-in */
        .hero-text-1,
        .hero-text-2,
        .hero-text-3 {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .hero-text-1.loaded {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.6s;
        }

        .hero-text-2.loaded {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.9s;
        }

        .hero-text-3.loaded {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 1.2s;
        }

        /* Scroll reveal animations */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* Gallery main area */
        .bound-gallery-main {
          background: linear-gradient(145deg, #0a0a0a 0%, #0f0f0f 100%);
        }

        /* Thumbnail scrollbar */
        .bound-thumbnails::-webkit-scrollbar {
          height: 4px;
        }

        .bound-thumbnails::-webkit-scrollbar-thumb {
          background: rgba(198, 162, 93, 0.3);
          border-radius: 999px;
        }

        .bound-thumbnails::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 999px;
        }

        /* Button press animation */
        .bound-btn:active {
          transform: scale(0.98) !important;
          transition: transform 0.1s ease-out !important;
        }

        /* Mobile hero adjustments */
        @media (max-width: 768px) {
          .bound-hero {
            min-height: 100svh;
          }
          
          .hero-image-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 0 1rem;
          }
          
          .hero-image {
            max-height: 70vh;
            width: auto;
            object-fit: contain;
          }
          
          @keyframes heroZoom {
            0% {
              transform: scale(1);
            }
            100% {
              transform: scale(1.03);
            }
          }
        }

        /* Macro section overlay */
        .bound-macro {
          position: relative;
        }

        /* Touch device gallery swipe hint */
        @media (hover: none) {
          .bound-gallery-main {
            cursor: grab;
          }
          .bound-gallery-main:active {
            cursor: grabbing;
          }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════
          VIDEO LIGHTBOX MODAL
          Fullscreen dark luxury video player
      ═══════════════════════════════════════════════════════════════ */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={closeVideoModal}
        >
          {/* Close button */}
          <button
            onClick={closeVideoModal}
            className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 group z-10"
            aria-label="Close video"
          >
            <svg 
              className="w-5 h-5 text-white/80 group-hover:text-white transition" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Video container */}
          <div 
            className="relative w-full max-w-5xl mx-4 md:mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={modalVideoRef}
              controls
              muted
              playsInline
              preload="metadata"
              className="w-full h-auto max-h-[90vh] object-contain"
            >
              <source src="/videos/bound-hero.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Subtle branding */}
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-white/30 uppercase">
            Bound — The Bustier Bangle
          </p>
        </div>
      )}
    </div>
  );
};

export default BoundPage;
