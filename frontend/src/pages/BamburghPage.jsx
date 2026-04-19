import { useState, useCallback } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import PhileonCarousel from "@/components/PhileonCarousel";
import { useLivePrice, useLiveTierPrices } from "@/hooks/useLivePrice";

const BAMBURGH_IMG = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/q1n5n1fg_1000146370.png";
const LADY_BAMBURGH_IMG = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ulu0v463_1000146371.png";

export default function BamburghPage() {
  const product = products.bamburgh;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const currentTier = product.tiers[selectedTier];

  const gallery = product.gallery;
  const tierPrices = useLiveTierPrices("bamburgh");
  const { formatted: ctaPrice, price: ctaPriceNum } = useLivePrice("bamburgh", selectedTier, product.pricing[selectedTier]);

  const handleSelect = useCallback((index) => {
    if (index === activeThumb || isTransitioning) return;
    setIsTransitioning(true);
    setActiveThumb(index);
    setTimeout(() => setIsTransitioning(false), 250);
  }, [activeThumb, isTransitioning]);

  const onAddToCart = () => {
    handleAddToCart({
      id: `bamburgh-${selectedTier}-${selectedSize}`,
      name: `Bamburgh — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      price: tierPrices[selectedTier]?.price || product.pricing[selectedTier],
      metal: currentTier.metal,
      size: selectedSize,
      quantity: quantity,
      image: BAMBURGH_IMG,
    });
  };

  const sizeOptions = [];
  for (let i = 6; i <= 12; i++) {
    sizeOptions.push(i.toString());
    if (i < 12) sizeOptions.push(`${i}.5`);
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ═══════════════════════════════════════════════════════
          1. HERO — Pair editorial with floating product
      ═══════════════════════════════════════════════════════ */}
      <section className="w-full py-6 md:py-10 bg-black flex justify-center">
        <div className="w-full max-w-[640px] px-4">
          <div className="relative w-full aspect-[4/5] rounded-[14px] overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-black flex items-center justify-center">

            <img
              src="https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/o7aw7ju4_1000146386.png"
              alt="Bamburgh & Lady Bamburgh"
              className="w-[70%] object-contain"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />

            <div className="absolute left-6 bottom-10 md:left-12 md:bottom-14 max-w-[45%] z-10">
              <p className="text-[10px] tracking-[0.35em] text-white/60 uppercase mb-3">
                Signature Series
              </p>
              <h1 className="text-3xl md:text-5xl text-white leading-[1.05] mb-4">
                THE BAMBURGH
              </h1>
              <p className="text-white/80 text-sm md:text-base mb-5 leading-relaxed">
                A monument, not jewelry.
              </p>
              <p className="text-white/60 text-xs tracking-[0.2em]">
                PHILEON
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. GALLERY — Image browser
      ═══════════════════════════════════════════════════════ */}
      <section className="w-full mt-2 md:mt-4">
        <div className="max-w-[420px] md:max-w-[520px] mx-auto px-3 md:px-5">

          <div className="w-full overflow-hidden rounded-[10px] bg-black mb-2">
            <img
              src={gallery[activeThumb].src}
              alt={gallery[activeThumb].alt}
              className={`w-full aspect-square object-contain transition-opacity duration-250 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            />
          </div>

          <div className="flex gap-[5px] overflow-x-auto pb-1 scrollbar-hide">
            {gallery.map((item, index) => (
              <button
                key={`t-${index}`}
                onClick={() => handleSelect(index)}
                className={`
                  w-[52px] h-[52px] md:w-[58px] md:h-[58px] flex-shrink-0 rounded-[4px] overflow-hidden
                  transition-all duration-150
                  ${activeThumb === index
                    ? "ring-1 ring-white/40 opacity-100"
                    : "opacity-30 hover:opacity-65"}
                `}
              >
                <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COLLECTION CAROUSEL
      ═══════════════════════════════════════════════════════ */}
      <PhileonCarousel />

      {/* ═══════════════════════════════════════════════════════
          3. PRODUCT DETAILS
      ═══════════════════════════════════════════════════════ */}
      <section className="py-6 md:py-10">
        <div className="max-w-[560px] mx-auto px-5 md:px-8">

          <div className="mb-6">
            <p className="text-[8px] tracking-[0.35em] text-white/50 mb-2">SIGNATURE SERIES</p>
            <h2 className="text-xl md:text-2xl font-serif text-white/90 mb-1">THE BAMBURGH</h2>
            <p className="text-white/50 text-[11px]">{product.tagline}</p>
          </div>

          <div className="mb-6">
            <div className="text-white/45 text-[12px] leading-[1.7] whitespace-pre-line">
              {product.story}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[8px] tracking-[0.35em] text-white/25 mb-3">SPECIFICATIONS</p>
            <div className="text-[11px] text-white/40 leading-relaxed space-y-1">
              <p>Profile: Dual-stone architectural signet</p>
              <p>Metal: Two-tone rose gold &amp; white gold</p>
              <p>Gold Weight: 18 grams</p>
              <p>White Diamonds: 83 stones</p>
              <p>Black Diamonds: 75 stones</p>
              <p>Total Stones: 158</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[8px] tracking-[0.35em] text-white/20 mb-2">SELECT CONFIGURATION</p>
            <div className="space-y-1.5">
              {Object.entries(product.tiers).map(([key, tier]) => {
                const isActive = selectedTier === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    className={`cursor-pointer rounded-md px-3 py-2 transition-all duration-200 ${
                      isActive ? "bg-white/[0.02] border border-white/20" : "border border-white/[0.04] hover:border-white/8"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-[10px] tracking-[0.15em] ${isActive ? "text-white/65" : "text-white/30"}`}>{tier.label}</p>
                          {tier.badge && <span className="text-[7px] tracking-[0.1em] bg-white/90 text-black px-1.5 py-0.5 rounded-full">{tier.badge}</span>}
                        </div>
                        <p className={`text-[11px] ${isActive ? "text-white/40" : "text-white/18"}`}>{tier.metal} &middot; {tier.stones}</p>
                      </div>
                      <p className={`text-[14px] ${isActive ? "text-white/70" : "text-white/30"}`}>
                        {tierPrices[key]?.formatted || `$${product.pricing[key].toLocaleString()}`} CAD
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2.5 mb-4">
            <div className="flex-1">
              <p className="text-[8px] tracking-[0.35em] text-white/20 mb-1.5">SIZE</p>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-transparent border border-white/8 rounded-md px-2.5 py-2 text-[11px] text-white/55 focus:outline-none focus:border-white/20"
              >
                <option value="" disabled className="bg-black">Select size (6-12)</option>
                {sizeOptions.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
              <p className="text-[8px] text-white/20 mt-1">Half sizes &middot; Custom above 12</p>
            </div>
            <div className="w-24">
              <p className="text-[8px] tracking-[0.35em] text-white/20 mb-1.5">QTY</p>
              <div className="flex items-center border border-white/8 rounded-md h-[36px]">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2.5 text-white/30 hover:text-white/50 text-sm">-</button>
                <span className="flex-1 text-center text-[11px] text-white/55">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-2.5 text-white/30 hover:text-white/50 text-sm">+</button>
              </div>
            </div>
          </div>

          <button
            onClick={onAddToCart}
            disabled={isAdding || !selectedSize}
            className="w-full bg-white text-black rounded-md py-3 text-[10px] tracking-[0.2em] font-medium hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200 mb-3"
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : `ADD TO BAG — ${ctaPrice} CAD`}
          </button>

          <p className="text-[8px] text-white/18 mb-4">Made to order &middot; Limited production &middot; Signature Series</p>
          <p className="text-[8px] text-white/15 text-center">Price adjusts automatically with the live precious metals market.</p>
        </div>
      </section>

      {/* CLOSING */}
      <section className="py-10 md:py-14 border-t border-white/[0.03]">
        <div className="text-center max-w-[400px] mx-auto px-5">
          <p className="text-[13px] text-white/40 leading-relaxed mb-3">
            For the ones who made it.<br />
            And the ones who made them better.
          </p>
          <p className="text-[9px] tracking-[0.3em] text-white/50">BAMBURGH &amp; LADY BAMBURGH — PHILEON</p>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
