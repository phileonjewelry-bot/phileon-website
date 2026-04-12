import { useState, useCallback, useRef, useEffect } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

const COOGI_HERO_VIDEO = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ifs9jtbk_VIDEO_98d0aec8-1ca7-4b07-9e13-c0bb3baa740b.mp4";

export default function CoogiPage() {
  const product = products.coogiI;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const videoRef = useRef(null);

  const currentTier = product.tiers[selectedTier];

  // Single unified gallery: video first, then all images
  const gallery = [
    { type: "video", src: COOGI_HERO_VIDEO, poster: product.imageUrl, alt: "COOGI I hero video" },
    ...product.gallery
  ];

  const activeMedia = gallery[activeIndex];

  // Single video control — only one video element exists, pause/play on change
  useEffect(() => {
    if (videoRef.current) {
      if (activeMedia?.type === "video") {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [activeIndex, activeMedia?.type]);

  const handleSelect = useCallback((index) => {
    if (index === activeIndex || isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [activeIndex, isTransitioning]);

  const onAddToCart = () => {
    handleAddToCart({
      id: `coogi-i-${selectedTier}-${selectedSize}`,
      name: `COOGI I — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      price: product.pricing[selectedTier],
      metal: currentTier.metal,
      size: selectedSize,
      quantity: quantity,
      image: product.gallery[0].src,
    });
  };

  const sizeOptions = [];
  for (let i = 6; i <= 12; i++) {
    sizeOptions.push(i.toString());
    if (i < 12) sizeOptions.push(`${i}.5`);
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ═══════════════════════════════════════════════════════════════
          UNIFIED MEDIA — Single viewer, no duplicate videos
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full pt-2 md:pt-4">

        {/* MAIN MEDIA — full width feel */}
        <div className="w-full max-w-[900px] mx-auto px-3 md:px-6">
          <div className="aspect-square w-full overflow-hidden rounded-[12px] bg-black">
            {activeMedia.type === "video" ? (
              <video
                ref={videoRef}
                key={activeMedia.src}
                autoPlay
                muted
                loop
                playsInline
                poster={activeMedia.poster}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              >
                <source src={activeMedia.src} type="video/mp4" />
              </video>
            ) : (
              <img
                src={activeMedia.src}
                alt={activeMedia.alt || ""}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              />
            )}
          </div>
        </div>

        {/* THUMBNAILS — controlled width */}
        <div className="mt-3 max-w-[600px] mx-auto px-3">
          <div className="flex gap-[5px] overflow-x-auto pb-1 scrollbar-hide">
            {gallery.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={`t-${index}`}
                  onClick={() => handleSelect(index)}
                  className={`
                    w-[44px] h-[44px] md:w-[52px] md:h-[52px] flex-shrink-0 rounded-[4px] overflow-hidden
                    transition-all duration-150
                    ${isActive
                      ? "ring-1 ring-violet-500/60 opacity-100"
                      : "opacity-35 hover:opacity-70"}
                  `}
                >
                  {item.type === "video" ? (
                    <div className="relative w-full h-full bg-black">
                      <img src={item.poster} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2 text-black ml-px"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PRODUCT INFO — Below media
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-6 md:py-10">
        <div className="max-w-[600px] mx-auto px-5 md:px-8">

          {/* Title block */}
          <div className="mb-6">
            <p className="text-[8px] tracking-[0.35em] text-violet-400/60 mb-2">TRIBUTE SERIES</p>
            <h2 className="text-xl md:text-2xl font-serif text-white/90 mb-1">COOGI I</h2>
            <p className="text-white/50 text-[11px]">{product.tagline}</p>
          </div>

          {/* Story */}
          <div className="mb-6">
            <div className="text-white/45 text-[12px] leading-[1.7] whitespace-pre-line">
              {product.story}
            </div>
          </div>

          {/* Specifications */}
          <div className="mb-6">
            <p className="text-[8px] tracking-[0.35em] text-white/25 mb-3">SPECIFICATIONS</p>
            <div className="text-[11px] text-white/40 leading-relaxed space-y-1">
              <p>Top Width: 18 mm</p>
              <p>Band Thickness: 5 mm</p>
              <p>Profile: Tapered architectural signet</p>
            </div>
            <div className="mt-3 text-[11px] text-white/40 leading-relaxed space-y-1">
              <p className="text-white/25 text-[9px] mb-1.5">Est. Weight (Size 10)</p>
              <p>10K Gold: 15 g &middot; 14K Gold: 17 g &middot; 18K Gold: 19 g</p>
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.04]">
              <p className="text-white/25 text-[9px] mb-1.5">Stone Composition (~700 stones)</p>
              <p className="text-white/35 text-[10px]">White Diamonds &middot; Blue Sapphires &middot; Yellow Sapphires &middot; Red Rubies &middot; Orange Citrine &middot; Purple Amethyst</p>
            </div>
          </div>

          {/* Configuration */}
          <div className="mb-4">
            <p className="text-[8px] tracking-[0.35em] text-white/20 mb-2">SELECT CONFIGURATION</p>
            <div className="space-y-1.5">
              {Object.entries(product.tiers).map(([key, tier]) => {
                const isActive = selectedTier === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    className={`cursor-pointer rounded-md px-3 py-2 transition-all duration-200 ${isActive ? "bg-white/[0.02] border border-violet-500/30" : "border border-white/[0.04] hover:border-white/8"}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-[10px] tracking-[0.15em] ${isActive ? "text-white/65" : "text-white/30"}`}>{tier.label}</p>
                          {tier.badge && <span className="text-[7px] tracking-[0.1em] bg-violet-500/90 text-white px-1.5 py-0.5 rounded-full">{tier.badge}</span>}
                        </div>
                        <p className={`text-[11px] ${isActive ? "text-white/40" : "text-white/18"}`}>{tier.metal} &middot; {tier.stones}</p>
                      </div>
                      <p className={`text-[14px] ${isActive ? "text-white/70" : "text-white/30"}`}>${product.pricing[key].toLocaleString()} CAD</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Size & Qty */}
          <div className="flex gap-2.5 mb-4">
            <div className="flex-1">
              <p className="text-[8px] tracking-[0.35em] text-white/20 mb-1.5">SIZE</p>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-transparent border border-white/8 rounded-md px-2.5 py-2 text-[11px] text-white/55 focus:outline-none focus:border-violet-500/30 transition-colors"
              >
                <option value="" disabled className="bg-black">Select size (6-12)</option>
                {sizeOptions.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
              <p className="text-[8px] text-white/20 mt-1">Half sizes &middot; Custom above 12</p>
            </div>
            <div className="w-24">
              <p className="text-[8px] tracking-[0.35em] text-white/20 mb-1.5">QTY</p>
              <div className="flex items-center border border-white/8 rounded-md h-[36px]">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2.5 text-white/30 hover:text-white/50 transition-colors text-sm">-</button>
                <span className="flex-1 text-center text-[11px] text-white/55">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-2.5 text-white/30 hover:text-white/50 transition-colors text-sm">+</button>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={onAddToCart}
            disabled={isAdding || !selectedSize}
            className="w-full bg-violet-600 text-white rounded-md py-3 text-[10px] tracking-[0.2em] font-medium hover:bg-violet-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200 mb-3"
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "CLAIM YOURS"}
          </button>

          <p className="text-[8px] text-white/18 mb-6">Made to order &middot; Limited production &middot; Tribute Series</p>

          {/* Features */}
          <div className="border-t border-white/[0.04] pt-5">
            <p className="text-[8px] tracking-[0.35em] text-white/20 mb-3">FEATURES</p>
            <ul className="space-y-1.5">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[11px] text-white/35">
                  <span className="w-1 h-1 rounded-full bg-violet-500/50" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="py-10 md:py-14 border-t border-white/[0.03]">
        <div className="text-center max-w-[400px] mx-auto px-5">
          <p className="text-[13px] text-white/40 leading-relaxed mb-3">
            Not pattern for the sake of pattern.<br />
            Expression — under control.
          </p>
          <p className="text-[9px] tracking-[0.3em] text-violet-400/50">COOGI I — TRIBUTE SERIES</p>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
