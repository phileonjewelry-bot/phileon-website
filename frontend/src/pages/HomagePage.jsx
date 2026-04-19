import React, { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import { useLiveTierPrices } from "@/hooks/useLivePrice";

/* ═══════════════════════════════════════════════════════════════
   HOMAGE — Fan Earrings
   The art once carried, now worn.
   Two models: FULL (144 stones) and CORE (48 stones)
   Multiple finish options
═══════════════════════════════════════════════════════════════ */

// Product Carousel Component
function ProductCarousel({ items, productName, onSlideChange }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    dragFree: false
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // Reset carousel when items change
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0);
    setSelectedIndex(0);
  }, [items, emblaApi]);

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  if (!items || items.length === 0) {
    return <div className="text-center text-neutral-500">No images available</div>;
  }

  return (
    <div className="w-full relative">
      {/* Main Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              className="min-w-0 flex-[0_0_100%] px-4"
            >
              <div className="w-full flex justify-center bg-black rounded-2xl overflow-hidden">
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    poster={item.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="max-h-[70vh] w-full object-contain"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt || `${productName} ${index + 1}`}
                    className="max-h-[70vh] w-full object-contain product-image-hd"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => emblaApi && emblaApi.scrollPrev()}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition"
          >
            ‹
          </button>
          <button
            onClick={() => emblaApi && emblaApi.scrollNext()}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition"
          >
            ›
          </button>
        </>
      )}

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-3 overflow-x-auto px-4">
          {items.map((item, index) => (
            <button
              key={`${item.src}-thumb-${index}`}
              onClick={() => scrollTo(index)}
              className={`shrink-0 rounded-lg overflow-hidden border-2 transition ${
                selectedIndex === index
                  ? "border-[#C6A25D]"
                  : "border-white/10 opacity-60 hover:opacity-100"
              }`}
            >
              {item.type === "video" ? (
                <video
                  src={item.src}
                  poster={item.poster}
                  muted
                  playsInline
                  className="w-16 h-16 object-cover"
                />
              ) : (
                <img
                  src={item.src}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-16 h-16 object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const HomagePage = () => {
  const [selectedModel, setSelectedModel] = useState("core");
  const [selectedFinish, setSelectedFinish] = useState("all-silver");
  const [selectedTier, setSelectedTier] = useState("signature");
  const [zoomedImage, setZoomedImage] = useState(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const product = products.homage;
  const variants = product.variants;
  const tierData = product.tiers;
  const finishes = product.finishes;
  const specs = product.specs;
  
  // Get current variant based on model
  const currentVariant = variants[selectedModel];
  const currentTier = tierData[selectedTier];
  const currentFinish = finishes.find(f => f.id === selectedFinish);
  const currentPrice = currentVariant.pricing[selectedTier];
  const tierPricesLive = useLiveTierPrices("homage");
  
  // Get the correct image based on variant and finish
  const getCurrentImage = () => {
    const variantImages = currentVariant.images;
    if (variantImages[selectedFinish]) {
      return variantImages[selectedFinish];
    }
    return variantImages.default;
  };
  const currentImage = getCurrentImage();
  
  // Build gallery items from current selection
  const galleryItems = [
    { type: "image", src: currentImage.src, alt: currentImage.alt }
  ];
  
  // Remove duplicate gallery items from general gallery
  const generalGallery = product.gallery.filter(
    (item, index, self) =>
      index === self.findIndex((i) => i.src === item.src)
  );

  const onAddToCart = () => {
    handleAddToCart({
      id: `homage-${selectedModel}-${selectedFinish}-${selectedTier}`,
      name: `HOMAGE ${currentVariant.label} — ${currentTier.name}`,
      price: tierPricesLive[selectedTier]?.price || currentPrice,
      metal: currentTier.metal,
      variant: currentVariant.label,
      finish: currentFinish.label,
      image: currentImage.src,
      quantity: 1
    });
  };

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
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-phileon-ivory">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO VIDEO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[100vh] overflow-hidden bg-black">
        
        {/* VIDEO - Optimized for clarity and quality */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/homage-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster={product.imageUrl || product.heroImage}
          preload="auto"
          style={{
            filter: 'contrast(1.05) brightness(1.02)',
            imageRendering: 'auto',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        />

        {/* Subtle vignette overlay for contrast enhancement */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)'
          }}
        />

        {/* OVERLAY (subtle dark for readability) */}
        <div className="absolute inset-0 bg-black/30" />

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 animate-fadeIn">
          
          <p className="text-[10px] md:text-xs tracking-[0.3em] text-white/70 mb-3">
            EARRINGS
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-[0.06em] text-white mb-3">
            HOMAGE
          </h1>

          <p className="text-base md:text-lg text-white/65 tracking-wide">
            {product.tagline}
          </p>

        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[#C6A25D]/50 to-transparent animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STORY SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-sm md:text-base text-neutral-300 leading-relaxed whitespace-pre-line">
          {product.story}
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          INTERACTIVE GALLERY + CONFIGURATION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        
        {/* Model Selection Buttons */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setSelectedModel("full")}
            className={`px-6 py-3 border text-sm tracking-wider transition-all ${
              selectedModel === "full"
                ? "border-white bg-white text-black"
                : "border-white/30 text-white hover:border-white/50"
            }`}
          >
            FULL — 144 STONES
          </button>

          <button
            onClick={() => setSelectedModel("core")}
            className={`px-6 py-3 border text-sm tracking-wider transition-all ${
              selectedModel === "core"
                ? "border-white bg-white text-black"
                : "border-white/30 text-white hover:border-white/50"
            }`}
          >
            CORE — 48 STONES
          </button>
        </div>

        {/* Finish Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {finishes.map((finish) => (
            <button
              key={finish.id}
              onClick={() => setSelectedFinish(finish.id)}
              className={`px-4 py-2 text-xs tracking-wider transition-all ${
                selectedFinish === finish.id
                  ? "ring-2 ring-[#C6A25D] bg-[#C6A25D]/10 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {finish.label}
            </button>
          ))}
        </div>

        {/* Product Image Display */}
        <div className="w-full flex justify-center bg-black rounded-2xl overflow-hidden mb-4">
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-h-[70vh] w-full object-contain product-image-hd cursor-zoom-in"
            onClick={() => setZoomedImage(currentImage)}
          />
        </div>
        
        <p className="text-center text-xs text-neutral-500 tracking-wider">
          {currentVariant.label} — {currentVariant.totalStones} STONES · {currentFinish?.label}
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          GENERAL GALLERY CAROUSEL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <p className="text-xs tracking-[0.2em] text-neutral-500 mb-8 uppercase text-center">
          Gallery
        </p>
        <ProductCarousel items={generalGallery} productName={product.name} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BUY SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-24">
        <div className="flex flex-col gap-6">

          <div className="text-center">
            <p className="text-xs tracking-[0.3em] text-neutral-400">
              {product.subtitle}
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide mt-2">
              {product.name}
            </h2>
          </div>

          {/* Price */}
          <div className="text-center mt-4">
            <p className="text-4xl md:text-5xl font-light tracking-wide">
              {tierPricesLive[selectedTier]?.formatted || `$${currentPrice.toLocaleString()}`}
              <span className="text-lg text-neutral-500 ml-2">CAD</span>
            </p>
            <p className="text-sm text-neutral-400 mt-2">
              {currentVariant.label} · {currentTier.metal} — {currentTier.stones}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {currentVariant.totalStones} stones · {currentFinish?.label}
            </p>
          </div>

          {/* Tier Selection */}
          <div className="mt-6">
            <p className="text-xs tracking-[0.2em] text-neutral-500 mb-4 uppercase text-center">
              Select Tier
            </p>
            
            <div className="space-y-3">
              {Object.entries(tierData).map(([key, tier]) => (
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
                      <span className="text-xs tracking-wider font-medium">{tier.label}</span>
                      {tier.badge && (
                        <span className="ml-2 text-[10px] tracking-wider text-[#C6A25D] uppercase">
                          {tier.badge}
                        </span>
                      )}
                      <p className="text-xs text-neutral-500 mt-1">{tier.metal}</p>
                    </div>
                    <span className="text-sm">{tierPricesLive[key]?.formatted || `$${currentVariant.pricing[key].toLocaleString()}`}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={onAddToCart}
            disabled={isAdding}
            data-testid="homage-add-to-cart"
            className="mt-6 w-full py-4 bg-[#C6A25D] hover:bg-[#B8944F] text-black font-medium tracking-wider uppercase text-sm transition-all disabled:opacity-50"
          >
            {buttonText}
          </button>
          <p className="text-[9px] text-neutral-600 text-center mt-2">
            Price adjusts automatically with the live precious metals market.
          </p>
          <div className="mt-8 pt-8 border-t border-neutral-800">

          {/* Specs */}
            <p className="text-xs tracking-[0.2em] text-neutral-500 mb-4 uppercase text-center">
              Specifications
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500">Height</p>
                <p className="text-neutral-300">{specs.height}</p>
              </div>
              <div>
                <p className="text-neutral-500">Width</p>
                <p className="text-neutral-300">{specs.width}</p>
              </div>
              <div>
                <p className="text-neutral-500">Weight</p>
                <p className="text-neutral-300">{specs.weight}</p>
              </div>
              <div>
                <p className="text-neutral-500">Closure</p>
                <p className="text-neutral-300">{specs.closure}</p>
              </div>
              <div className="col-span-2">
                <p className="text-neutral-500">Finish</p>
                <p className="text-neutral-300">{specs.finish}</p>
              </div>
              <div className="col-span-2">
                <p className="text-neutral-500">Setting</p>
                <p className="text-neutral-300">{specs.setting}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-500 mt-6 text-center">
            Made to order · Ships in 3–4 weeks<br />
            Complimentary insured shipping within Canada.
          </p>
        </div>
      </section>

      {/* Zoom Modal */}
      {zoomedImage && (
        <ZoomModal image={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </div>
  );
};

export default HomagePage;
