import React, { useState } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

/* ═══════════════════════════════════════════════════════════════
   CYPHER — Men's Statement Ring
   Decode the Moment.
   Emeralds, Yellow Sapphires, Princess-Cut Diamonds
═══════════════════════════════════════════════════════════════ */

const CypherPage = () => {
  const [selectedTier, setSelectedTier] = useState("signature");
  const [zoomedImage, setZoomedImage] = useState(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Get product data from products.js
  const cypherProduct = products.cypher;
  const pricing = cypherProduct.pricing;
  const tierData = cypherProduct.tiers;
  const specs = cypherProduct.specs;

  const tiers = {
    foundation: {
      ...tierData.foundation,
      price: pricing.foundation
    },
    signature: {
      ...tierData.signature,
      price: pricing.signature
    },
    heirloom: {
      ...tierData.heirloom,
      price: pricing.heirloom
    }
  };

  const currentTier = tiers[selectedTier];

  // Product gallery
  const gallery = cypherProduct.images;

  const onAddToCart = () => {
    handleAddToCart({
      id: `cypher-${selectedTier}`,
      name: `CYPHER — ${currentTier.name}`,
      price: currentTier.price,
      metal: currentTier.metal,
      image: gallery.hero,
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
    <div className="min-h-screen bg-black text-phileon-ivory">
      
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO (Full Screen with Hero Image)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center">
        {/* Background image with vignette */}
        <div className="absolute inset-0">
          <img
            src={gallery.hero}
            alt="CYPHER hero"
            className="w-full h-full object-cover product-image-hd"
            style={{ 
              filter: "brightness(0.85) contrast(1.1)",
              transform: "scale(1.02)"
            }}
          />
          {/* Vignette overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)"
            }}
          />
          {/* Bottom gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        </div>
        
        {/* Text overlay */}
        <div className="absolute bottom-16 md:bottom-24 left-0 right-0 flex flex-col items-center text-center px-6 text-white z-10">
          <p 
            className="text-xs tracking-[0.4em] mb-4 opacity-60"
            style={{ animation: "fadeInUp 1s ease-out 0.3s both" }}
          >
            {cypherProduct.subtitle}
          </p>
          <h1 
            className="text-5xl md:text-7xl tracking-[0.25em] mb-4 font-light"
            style={{ animation: "fadeInUp 1s ease-out 0.5s both" }}
          >
            CYPHER
          </h1>
          <p 
            className="text-sm md:text-base opacity-70 tracking-wider"
            style={{ animation: "fadeInUp 1s ease-out 0.7s both" }}
          >
            {cypherProduct.tagline}
          </p>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[#C6A25D]/50 to-transparent animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: LIFESTYLE CITYSCAPE SHOT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-black py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <img
            src={gallery.lifestyle}
            alt="CYPHER lifestyle with Toronto skyline"
            className="w-full h-auto object-contain product-image-hd"
            loading="eager"
            decoding="async"
          />
          <p className="text-center text-xs tracking-[0.3em] text-neutral-500 mt-8 uppercase">
            Toronto. After hours.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: PRODUCT STORY
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-20 md:py-32 text-center">
        <p className="text-xs tracking-[0.4em] text-[#C6A25D] mb-8 uppercase">
          The Story
        </p>
        <p className="text-lg md:text-xl text-neutral-300 leading-relaxed max-w-2xl mx-auto">
          {cypherProduct.description}
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: WHITE BACKGROUND PRODUCT SHOT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-neutral-100 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <img
            src={gallery.white}
            alt="CYPHER on white background"
            className="w-full h-auto object-contain product-image-hd"
            loading="eager"
            decoding="async"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: MACRO DETAIL (with zoom on click)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24 bg-black">
        <p className="text-xs tracking-[0.3em] text-neutral-500 mb-12 uppercase text-center">
          Precision Detail
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Macro: Princess-Cut Diamonds */}
          <div 
            className="bg-black overflow-hidden cursor-zoom-in group"
            onClick={() => setZoomedImage({ src: gallery.macroDiamonds, alt: "Princess-cut diamond cluster" })}
          >
            <img
              src={gallery.macroDiamonds}
              alt="Princess-cut diamond cluster"
              className="w-full h-auto object-contain product-image-hd transition-transform duration-700 group-hover:scale-110"
              loading="eager"
              decoding="async"
            />
            <p className="text-xs tracking-[0.2em] text-neutral-500 mt-6 uppercase text-center">
              9 Princess-Cut Diamonds
            </p>
          </div>
          
          {/* Macro: Emeralds */}
          <div 
            className="bg-black overflow-hidden cursor-zoom-in group"
            onClick={() => setZoomedImage({ src: gallery.macroEmeralds, alt: "Colombian emerald cabochons" })}
          >
            <img
              src={gallery.macroEmeralds}
              alt="Colombian emerald cabochons"
              className="w-full h-auto object-contain product-image-hd transition-transform duration-700 group-hover:scale-110"
              loading="eager"
              decoding="async"
            />
            <p className="text-xs tracking-[0.2em] text-neutral-500 mt-6 uppercase text-center">
              Colombian Emerald Cabochons
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: BUY / PURCHASE SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          
          {/* LEFT - HERO PRODUCT IMAGE */}
          <div className="w-full bg-black p-8">
            <img
              src={gallery.hero}
              alt="CYPHER product"
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
                {cypherProduct.subtitle}
              </p>
              <h1 className="text-4xl md:text-5xl font-light tracking-wide mt-2">
                CYPHER
              </h1>
            </div>

            <div className="text-sm text-neutral-300 leading-relaxed">
              <p>{cypherProduct.tagline}</p>
              <p className="mt-3 text-neutral-500">
                Emeralds. Yellow Sapphires. Princess-Cut Diamonds.<br />
                One ring. Every element in balance.
              </p>
            </div>

            <div className="mt-4">
              <p className="text-3xl md:text-4xl font-light tracking-wide">
                ${currentTier.price.toLocaleString()}
                <span className="text-lg text-neutral-500 ml-2">CAD</span>
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {currentTier.metal}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {currentTier.stones}
              </p>
              <p className="text-xs text-neutral-500 mt-3">
                Made to order<br />
                Ships in 4–6 weeks
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
                    data-testid={`cypher-tier-${key}`}
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
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onAddToCart}
              disabled={isAdding}
              data-testid="cypher-add-to-cart"
              className="mt-6 w-full py-4 bg-[#C6A25D] hover:bg-[#B8944F] text-black font-medium tracking-wider uppercase text-sm transition-all disabled:opacity-50"
            >
              {buttonText}
            </button>
            
            <p className="text-xs text-neutral-500 text-center mt-3 tracking-wide">
              Built for presence. Worn with intent.
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
                  <p className="text-neutral-500">Face</p>
                  <p className="text-neutral-300">{specs.topDimensions}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Band</p>
                  <p className="text-neutral-300">{specs.bandWidth}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Finish</p>
                  <p className="text-neutral-300">{specs.finish}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-neutral-500">Emeralds</p>
                  <p className="text-neutral-300">{specs.emeralds}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-neutral-500">Sapphires</p>
                  <p className="text-neutral-300">{specs.sapphires}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-neutral-500">Diamonds</p>
                  <p className="text-neutral-300">{specs.diamonds}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-500 mt-6">
              {cypherProduct.shipping}
            </p>
          </div>
        </div>
      </section>

      {/* Zoom Modal */}
      {zoomedImage && (
        <ZoomModal image={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CypherPage;
