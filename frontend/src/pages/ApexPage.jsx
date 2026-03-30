import React, { useState, useRef } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

/* ═══════════════════════════════════════════════════════════════
   APEX — Pyramid Earrings
   Egypt to Santorini. Places turned into pieces.
   Hero Video + Product Gallery (No Model Shots)
═══════════════════════════════════════════════════════════════ */

const ApexPage = () => {
  const [selectedTier, setSelectedTier] = useState("signature");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const modelVideoRef = useRef(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  
  const handleVideoEnd = () => {
    setShowPlayButton(true);
    setIsPlaying(false);
  };
  
  const handlePlay = () => {
    const video = modelVideoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play();
      setShowPlayButton(false);
      setIsPlaying(true);
    }
  };

  // Get product data from products.js
  const apexProduct = products.apex;
  const pricing = apexProduct.pricing;
  const tierData = apexProduct.tiers;
  const specs = apexProduct.specs;

  const tiers = {
    signature: {
      ...tierData.signature,
      price: pricing.signature
    },
    foundation: {
      ...tierData.foundation,
      price: pricing.foundation
    },
    core: {
      ...tierData.core,
      price: pricing.core
    },
    heirloom: {
      ...tierData.heirloom,
      price: pricing.heirloom
    }
  };

  const currentTier = tiers[selectedTier];

  // Product gallery - NO MODEL SHOTS
  const gallery = {
    front: {
      src: apexProduct.imageUrl,
      alt: "APEX front-facing pair"
    },
    side: {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/4r7cqq3k_1000144050.webp",
      alt: "APEX side profile",
      label: "Structure"
    },
    back: {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/l4z0j4ao_1000144099.png",
      alt: "APEX back view",
      label: "Setting"
    },
    scale: {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/oqqz6xdt_1000144049.webp",
      alt: "APEX in-hand scale",
      label: "Scale"
    },
    macro: [
      {
        src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/j2xta4cw_1000144044.png",
        alt: "APEX diamond pavé macro"
      },
      {
        src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/b2ms8zjn_1000144043.png",
        alt: "APEX center sapphire macro"
      },
      {
        src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/sqpchza1_1000144042.png",
        alt: "APEX secondary pavé macro"
      }
    ],
    luxury: {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/7dyoz6wc_1000144038.png",
      alt: "APEX with reflection"
    }
  };

  const onAddToCart = () => {
    handleAddToCart({
      id: `apex-${selectedTier}`,
      name: `APEX — ${currentTier.name}`,
      price: currentTier.price,
      metal: currentTier.metal,
      image: gallery.front.src,
      quantity: 1
    });
  };

  // Zoom modal for macro images
  const ZoomModal = ({ image, onClose }) => (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center cursor-zoom-out"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition z-10"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img 
        src={image.src} 
        alt={image.alt} 
        className="max-w-[90vw] max-h-[90vh] object-contain product-image-hd"
        loading="eager"
        decoding="sync"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-phileon-ivory">
      
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO VIDEO (Full Screen with Text Overlay)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-screen bg-black overflow-hidden">
        <video
          src="/videos/apex.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover apex-hero-video"
          style={{ backfaceVisibility: "hidden" }}
          onCanPlay={(e) => e.target.play()}
        />
        
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white">
          <p className="text-xs tracking-[0.35em] mb-6 opacity-70 apex-hero-text">
            PHILEON — OBJECT SERIES
          </p>
          <h1 className="text-4xl md:text-6xl tracking-[0.2em] mb-6 font-light apex-hero-text">
            APEX
          </h1>
          <p className="text-sm md:text-base opacity-80 leading-relaxed max-w-md apex-hero-text">
            From Egypt to Santorini.<br />
            Places turned into pieces.
          </p>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[#C6A25D]/50 to-transparent animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: LUXURY REFLECTION SHOT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-black py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <img
            src={gallery.luxury.src}
            alt={gallery.luxury.alt}
            className="w-full h-auto object-contain product-image-hd"
            loading="eager"
            decoding="async"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: PRODUCT BREAKDOWN (Side, Back, Scale)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="group">
            <div className="bg-black overflow-hidden">
              <img
                src={gallery.side.src}
                alt={gallery.side.alt}
                className="w-full h-auto object-contain product-image-hd transition-transform duration-500 group-hover:scale-105"
                loading="eager"
                decoding="async"
              />
            </div>
            <p className="text-xs tracking-[0.2em] text-neutral-500 mt-4 uppercase text-center">
              {gallery.side.label}
            </p>
          </div>
          
          <div className="group">
            <div className="bg-black overflow-hidden">
              <img
                src={gallery.back.src}
                alt={gallery.back.alt}
                className="w-full h-auto object-contain product-image-hd transition-transform duration-500 group-hover:scale-105"
                loading="eager"
                decoding="async"
              />
            </div>
            <p className="text-xs tracking-[0.2em] text-neutral-500 mt-4 uppercase text-center">
              {gallery.back.label}
            </p>
          </div>
          
          <div className="group">
            <div className="bg-black overflow-hidden">
              <img
                src={gallery.scale.src}
                alt={gallery.scale.alt}
                className="w-full h-auto object-contain product-image-hd transition-transform duration-500 group-hover:scale-105"
                loading="eager"
                decoding="async"
              />
            </div>
            <p className="text-xs tracking-[0.2em] text-neutral-500 mt-4 uppercase text-center">
              {gallery.scale.label}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: MACRO DETAIL (with zoom on click)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <p className="text-xs tracking-[0.3em] text-neutral-500 mb-8 uppercase text-center">
          Detail
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {gallery.macro.map((item, index) => (
            <div 
              key={index} 
              className="bg-black overflow-hidden cursor-zoom-in"
              onClick={() => setZoomedImage(item)}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-auto object-contain product-image-hd transition-transform duration-500 hover:scale-110"
                loading="eager"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: MODEL VIDEO (Right before BUY section)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-black py-20 flex justify-center">
        <div className="w-full max-w-2xl relative">
          <video
            ref={modelVideoRef}
            src="/videos/apex-model.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            onTimeUpdate={(e) => {
              const video = e.target;
              if (video.duration && video.currentTime >= video.duration - 0.1) {
                handleVideoEnd();
              }
            }}
            className="w-full h-auto object-contain"
          />

          {showPlayButton && (
            <div 
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer z-10"
            >
              <div className="text-white text-sm tracking-widest border border-white px-6 py-3 bg-black/60 hover:bg-white hover:text-black transition-all">
                PLAY
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: BUY / PURCHASE SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          
          {/* LEFT - FRONT PRODUCT IMAGE */}
          <div className="w-full">
            <img
              src={gallery.front.src}
              alt={gallery.front.alt}
              className="w-full h-auto object-contain product-image-hd"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          {/* RIGHT - INFO */}
          <div className="flex flex-col gap-6">

            <div>
              <p className="text-xs tracking-[0.3em] text-neutral-400">
                {apexProduct.subtitle}
              </p>
              <h1 className="text-4xl md:text-5xl font-light tracking-wide mt-2">
                APEX
              </h1>
            </div>

            <div className="text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>From Egypt to Santorini.</p>
              <p>Places turned into pieces.</p>
              <p>I stood at the pyramids in Egypt.</p>
              <p>And swam in the ocean in Santorini.</p>
              <p>Both stayed with me.</p>
              <p>So I designed this.</p>
            </div>

            <div className="mt-4">
              <p className="text-3xl md:text-4xl font-light tracking-wide">
                ${currentTier.price.toLocaleString()}
                <span className="text-lg text-neutral-500 ml-2">CAD</span>
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {currentTier.metal} — {currentTier.stones}
              </p>
              <p className="text-xs text-neutral-500 mt-3">
                Made to order<br />
                Ships in 3–4 weeks
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs tracking-[0.2em] text-neutral-500 mb-4 uppercase">
                Select Tier
              </p>
              
              <div className="space-y-3">
                {Object.entries(tiers).map(([key, tier]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    className={`w-full text-left p-4 rounded-sm border transition-all ${
                      selectedTier === key
                        ? "border-[#C6A25D] bg-[#C6A25D]/10"
                        : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">{tier.name}</span>
                        {tier.badge && (
                          <span className="ml-2 text-[10px] tracking-wider text-[#C6A25D] uppercase">
                            {tier.badge}
                          </span>
                        )}
                        <p className="text-xs text-neutral-500 mt-1">{tier.metal}</p>
                      </div>
                      <span className="text-sm">
                        ${tier.price.toLocaleString()}
                        {key === 'heirloom' && '+'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onAddToCart}
              disabled={isAdding}
              data-testid="apex-add-to-cart"
              className="mt-6 w-full py-4 bg-[#C6A25D] hover:bg-[#B8944F] text-black font-medium tracking-wider uppercase text-sm transition-all disabled:opacity-50"
            >
              {buttonText}
            </button>
            
            <p className="text-xs text-neutral-500 text-center mt-3 tracking-wide">
              Crafted with precision. Worn with intent.
            </p>

            <div className="mt-8 pt-8 border-t border-neutral-800">
              <p className="text-xs tracking-[0.2em] text-neutral-500 mb-4 uppercase">
                Specifications
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Weight</p>
                  <p className="text-neutral-300">{specs.weight}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Dimensions</p>
                  <p className="text-neutral-300">{specs.dimensions}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-neutral-500">Diamonds</p>
                  <p className="text-neutral-300">{specs.diamonds}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-neutral-500">Sapphires</p>
                  <p className="text-neutral-300">{specs.sapphires}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Finish</p>
                  <p className="text-neutral-300">{specs.finish}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-500 mt-6">
              Complimentary insured shipping within Canada.
            </p>
          </div>
        </div>
      </section>

      {/* Zoom Modal */}
      {zoomedImage && (
        <ZoomModal image={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </div>
  );
};

export default ApexPage;
