import React, { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

/* ═══════════════════════════════════════════════════════════════
   HOMAGE — Fan Earrings
   The art once carried, now worn.
   Two variants: FULL (72 stones) and CORE (24 stones)
═══════════════════════════════════════════════════════════════ */

// Product Carousel Component
function ProductCarousel({ items, productName }) {
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

  const scrollTo = useCallback(
    (index) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

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
                    alt={`${productName} ${index + 1}`}
                    className="max-h-[70vh] w-full object-contain product-image-hd"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
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

      {/* Thumbnails */}
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
    </div>
  );
}

const HomagePage = () => {
  const [selectedVariant, setSelectedVariant] = useState("core");
  const [selectedTier, setSelectedTier] = useState("signature");
  const [zoomedImage, setZoomedImage] = useState(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const product = products.homage;
  const variants = product.variants;
  const tierData = product.tiers;
  const specs = product.specs;
  
  // Remove duplicate gallery items
  const gallery = product.gallery.filter(
    (item, index, self) =>
      index === self.findIndex((i) => i.src === item.src)
  );

  const currentVariant = variants[selectedVariant];
  const currentTier = tierData[selectedTier];
  const currentPrice = currentVariant.pricing[selectedTier];

  const onAddToCart = () => {
    handleAddToCart({
      id: `homage-${selectedVariant}-${selectedTier}`,
      name: `HOMAGE ${currentVariant.label} — ${currentTier.name}`,
      price: currentPrice,
      metal: currentTier.metal,
      variant: currentVariant.label,
      image: product.imageUrl,
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
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-screen bg-black overflow-hidden">
        <img
          src={gallery[0].src}
          alt={gallery[0].alt || product.name}
          className="w-full h-full object-contain product-image-hd"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs tracking-[0.35em] mb-4 opacity-70">
            PHILEON — OBJECT SERIES
          </p>
          <h1 className="text-4xl md:text-6xl tracking-[0.2em] mb-4 font-light">
            HOMAGE
          </h1>
          <p className="text-sm md:text-base opacity-80">
            {product.tagline}
          </p>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
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
          GALLERY CAROUSEL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <ProductCarousel items={gallery} productName={product.name} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BUY SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          
          {/* LEFT - MAIN IMAGE */}
          <div className="w-full">
            <div className="w-full flex justify-center bg-black rounded-2xl overflow-hidden">
              <img
                src={gallery[0].src}
                alt={gallery[0].alt || product.name}
                className="w-full max-w-[700px] mx-auto object-contain product-image-hd cursor-zoom-in"
                onClick={() => setZoomedImage(gallery[0])}
              />
            </div>
          </div>

          {/* RIGHT - INFO */}
          <div className="flex flex-col gap-6">

            <div>
              <p className="text-xs tracking-[0.3em] text-neutral-400">
                {product.subtitle}
              </p>
              <h1 className="text-4xl md:text-5xl font-light tracking-wide mt-2">
                {product.name}
              </h1>
              <p className="text-sm text-neutral-400 mt-2">{product.tagline}</p>
            </div>

            {/* Price */}
            <div className="mt-4">
              <p className="text-3xl md:text-4xl font-light tracking-wide">
                ${currentPrice.toLocaleString()}
                <span className="text-lg text-neutral-500 ml-2">CAD</span>
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {currentVariant.label} · {currentTier.metal} — {currentTier.stones}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {currentVariant.totalStones} stones total ({currentVariant.stoneCountPerEarring} per earring)
              </p>
              <p className="text-xs text-neutral-500 mt-3">
                Made to order<br />
                Ships in 3–4 weeks
              </p>
            </div>

            {/* Variant Selection */}
            <div className="mt-6">
              <p className="text-xs tracking-[0.2em] text-neutral-500 mb-4 uppercase">
                Select Model
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variants).map(([key, variant]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedVariant(key)}
                    className={`text-left p-4 rounded-sm border transition-all ${
                      selectedVariant === key
                        ? "border-[#C6A25D] bg-[#C6A25D]/10"
                        : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    <span className="text-sm font-medium tracking-wider">{variant.label}</span>
                    <p className="text-xs text-neutral-500 mt-1">{variant.totalStones} stones</p>
                    <p className="text-xs text-neutral-400 mt-1">{variant.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Selection */}
            <div className="mt-4">
              <p className="text-xs tracking-[0.2em] text-neutral-500 mb-4 uppercase">
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
                      <span className="text-sm">${currentVariant.pricing[key].toLocaleString()}</span>
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

            {/* Specs */}
            <div className="mt-8 pt-8 border-t border-neutral-800">
              <p className="text-xs tracking-[0.2em] text-neutral-500 mb-4 uppercase">
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

export default HomagePage;
