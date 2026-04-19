/* =====================================
   PHILEON — REUSABLE EARRINGS PRODUCT PAGE
   Use this component for ALL earring pages.
   NO size selector (earrings don't require sizing)
   Includes "Sold as a pair" note
   ===================================== */

import React, { useEffect, useRef, useState } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { useLiveTierPrices } from "../hooks/useLivePrice";
import { slugToProductKey } from "../components/LiveFromPrice";

export default function EarringsProductPage({ product }) {
  const videoRef = useRef(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const productKey = slugToProductKey(product.slug) || product.slug;
  const tierPricesLive = useLiveTierPrices(productKey);

  const [activeMedia, setActiveMedia] = useState(0);
  const [selectedTier, setSelectedTier] = useState(
    product.defaultTier || "signature"
  );

  const currentTier = product.tiers[selectedTier];

  // Video autoplay handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener("ended", handleEnded);

    const tryPlay = async () => {
      try {
        await video.play();
      } catch (err) {
        console.log("Autoplay blocked:", err);
      }
    };

    tryPlay();

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [activeMedia]);

  // Handle add to cart
  const onAddToCart = () => {
    const heroImage = product.media.find(m => m.type === "image")?.src || product.media[0]?.poster;
    
    handleAddToCart({
      id: `${product.id}-${selectedTier}`,
      name: product.name,
      image: heroImage,
      price: tierPricesLive[selectedTier]?.price || currentTier.price,
      productKey: productKey,
      tierKey: selectedTier,
      slug: product.id,
      materials: [currentTier.metal]
    }, 1, `${currentTier.name} · ${currentTier.metal}`);
  };

  // Format story with line breaks
  const formatStory = (story) => {
    return story.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < story.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden" data-testid={`${product.id}-page`}>
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10">
        {/* LEFT SIDE — GALLERY */}
        <div>
          {/* HERO MEDIA */}
          <div className="trace-gallery-wrap">
            <div className="trace-gallery-main aspect-square border border-[#1f1f1f]">
              {product.media[activeMedia].type === "video" ? (
                <video
                  ref={videoRef}
                  src={product.media[activeMedia].src}
                  poster={product.media[activeMedia].poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onEnded={(e) => {
                    e.currentTarget.currentTime = 0;
                    e.currentTarget.play();
                  }}
                />
              ) : (
                <img
                  src={product.media[activeMedia].src}
                  alt={product.media[activeMedia].alt}
                />
              )}
            </div>
          </div>

          {/* THUMBNAILS */}
          <div className="trace-thumbnails mt-4">
            {product.media.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveMedia(index)}
                className={`trace-thumbnail border transition-all ${
                  activeMedia === index
                    ? "border-[#C6A25D]"
                    : "border-[#2a2a2a] hover:border-[#4a4a4a]"
                }`}
                data-testid={`thumbnail-${index}`}
              >
                {item.type === "video" ? (
                  <div className="relative h-full w-full">
                    <img
                      src={item.poster}
                      alt={`${product.name} video thumbnail`}
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white text-[10px]">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full object-contain"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE — PRODUCT INFO */}
        <div className="lg:sticky lg:top-24 self-start">
          <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-4">
            {product.collectionLabel || product.collection || "PHILEON"}
          </p>

          <h1 className="text-5xl font-serif mb-2">{product.name}</h1>
          
          {/* French tagline */}
          <p className="text-[#a0a0a0] italic text-lg mb-1.5">
            {product.tagline}
          </p>
          
          {/* English translation */}
          {product.taglineTranslation && (
            <p className="text-white/40 text-xs italic mb-6">
              {product.taglineTranslation}
            </p>
          )}

          <div className="text-[#C6A25D] text-4xl lg:text-5xl mb-3" data-testid="current-price">
            {tierPricesLive[selectedTier]?.formatted || `$${currentTier.price.toLocaleString()}`}
          </div>

          <p className="text-sm text-white/70 mb-2">
            {currentTier.metal} — {currentTier.description}
          </p>

          {/* TIER SELECTION */}
          <div className="mb-8 mt-8">
            <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-3">
              Select Tier
            </p>

            <div className="space-y-3">
              {Object.entries(product.tiers).map(([key, tier]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  className={`w-full text-left rounded-xl border p-4 lg:p-5 transition-all ${
                    selectedTier === key
                      ? "border-[#C6A25D] bg-[#C6A25D]/10"
                      : "border-[#2a2a2a] bg-black hover:border-[#4a4a4a]"
                  }`}
                  data-testid={`tier-${key}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-xl lg:text-2xl font-medium">{tier.name}</div>
                      <div className="text-sm text-[#9d9d9d] mt-1">
                        {tier.metal}
                      </div>
                      <div className="text-[#C6A25D] text-2xl lg:text-3xl mt-3">
                        {tierPricesLive[key]?.formatted || `$${tier.price.toLocaleString()}`}
                      </div>
                    </div>

                    {tier.badge && (
                      <div className="text-[10px] lg:text-[11px] tracking-[0.2em] px-2 lg:px-3 py-1.5 lg:py-2 rounded-md bg-[#C6A25D] text-black font-semibold whitespace-nowrap">
                        {tier.badge}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            disabled={isAdding}
            onClick={onAddToCart}
            className={`w-full py-4 rounded-xl tracking-[0.25em] text-sm font-semibold transition-all ${
              !isAdding
                ? "bg-[#C6A25D] text-black hover:bg-[#b8944f]"
                : "bg-green-600 text-white"
            }`}
            data-testid="add-to-cart-button"
          >
            {isAdding ? buttonText : "ADD TO CART"}
          </button>

          <p className="text-center text-sm text-white/50 mt-3">
            Sold as a pair.
          </p>
          <p className="text-center text-sm text-white/50">
            Complimentary insured shipping within Canada.
          </p>

          {/* STORY */}
          <div className="mt-14">
            <h2 className="text-2xl lg:text-3xl font-serif text-[#C6A25D] mb-6">
              The Story
            </h2>
            <p className="text-[#d2d2d2] leading-7 lg:leading-8 text-base lg:text-lg whitespace-pre-line">
              {formatStory(product.story)}
            </p>
          </div>

          {/* SPECIFICATIONS */}
          <div className="mt-14 pb-8">
            <h2 className="text-2xl lg:text-3xl font-serif text-[#C6A25D] mb-6">
              Specifications
            </h2>
            <ul className="space-y-4 lg:space-y-5 text-[#d2d2d2] text-sm lg:text-base">
              {product.specs.map((spec, index) => (
                <li key={index}>— {spec}</li>
              ))}
            </ul>
          </div>

          {/* SPECS IMAGE (optional) */}
          {product.specsImage && (
            <section className="mt-20 pb-16 text-center">
              <img 
                src={product.specsImage} 
                alt={`${product.name} dimensions and weight`}
                className="trace-spec-image mx-auto max-w-sm opacity-90"
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
