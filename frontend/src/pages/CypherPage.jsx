import { useState } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import { useLivePrice, useLiveTierPrices } from "@/hooks/useLivePrice";

/* ═══════════════════════════════════════════════════════════════
   CYPHER — Men's Statement Ring
   Drama on your finger.
   VIDEO HERO + IRONCLAD GALLERY STRUCTURE
═══════════════════════════════════════════════════════════════ */

export default function CypherPage() {
  const product = products.cypher;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const currentPrice = product.pricing[selectedTier];
  const currentTier = product.tiers[selectedTier];
  const tierPrices = useLiveTierPrices("cypher");
  const { formatted: ctaPrice } = useLivePrice("cypher", selectedTier, currentPrice);

  // Gallery uses product.gallery directly (already in correct order)
  const gallery = product.gallery;

  const onAddToCart = () => {
    handleAddToCart({
      id: `cypher-${selectedTier}-${selectedSize}`,
      name: `CYPHER — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      price: tierPrices[selectedTier]?.price || currentPrice,
      metal: currentTier.metal,
      size: selectedSize,
      image: product.gallery[1].src, // Use angled black for cart
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION - CONTROLLED HEIGHT VIDEO
          65vh mobile / 75vh desktop
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden">
        {/* Hero Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={product.imageUrl}
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.1]"
        >
          <source src={product.heroVideo} type="video/mp4" />
        </video>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-white text-4xl md:text-6xl tracking-[0.2em]">
            CYPHER
          </h1>
          <p className="text-white/80 mt-4 text-sm md:text-base">
            Keep your finger in CYPHER.<br />
            It defines presence.
          </p>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-12 md:h-16" />

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT - Scrolling Gallery + Sticky Sidebar
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-2 gap-12">
        
        {/* LEFT - Scrolling Gallery (IMAGES ONLY) */}
        <div className="space-y-4">
          {gallery.map((item, index) => (
            <div 
              key={`gallery-${index}`} 
              className={`bg-black overflow-hidden ${index === 0 ? "" : "rounded-2xl"}`}
            >
              <img
                src={item.src}
                alt={`${product.name} - ${item.alt}`}
                className="w-full h-auto object-contain product-image-hd"
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}
        </div>

        {/* RIGHT - Sticky Info Panel */}
        <div className="md:sticky md:top-24 h-fit">
          
          {/* Category & Title */}
          <p className="text-xs tracking-[0.28em] text-white/60 mb-3">
            {product.subtitle}
          </p>
          <h2 className="text-4xl md:text-5xl tracking-[0.04em] font-light">
            {product.name}
          </h2>
          <p className="mt-3 text-white/85">{product.tagline}</p>

          {/* Tier Selection */}
          <div className="mt-8">
            <p className="text-xs tracking-[0.25em] opacity-50 mb-4">
              SELECT CONFIGURATION
            </p>
            <div className="space-y-3">
              {Object.entries(product.tiers).map(([key, tier]) => {
                const isActive = selectedTier === key;
                
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    data-testid={`cypher-tier-${key}`}
                    className={`
                      relative cursor-pointer rounded-xl p-4 transition-all duration-200
                      ${isActive 
                        ? "border border-white bg-white/[0.04]" 
                        : "border border-white/10 hover:border-white/25"}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-xs tracking-[0.2em] ${isActive ? "opacity-90" : "opacity-50"}`}>
                            {tier.label}
                          </p>
                          {tier.badge && (
                            <span className="text-[9px] tracking-[0.12em] bg-white text-black px-2 py-0.5 rounded-full">
                              {tier.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mb-1 ${isActive ? "opacity-80" : "opacity-55"}`}>
                          {tier.metal} · {tier.stones}
                        </p>
                        {tier.description && (
                          <p className={`text-xs ${isActive ? "opacity-55" : "opacity-35"}`}>
                            {tier.description}
                          </p>
                        )}
                      </div>
                      <p className={`text-lg ml-4 ${isActive ? "text-white" : "opacity-70"}`}>
                        {tierPrices[key]?.formatted || `$${product.pricing[key].toLocaleString()}`} CAD
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="mt-6">
            <p className="text-xs tracking-widest text-neutral-400 mb-3">
              SIZE
            </p>

            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              data-testid="cypher-size-select"
              className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white"
            >
              <option value="" disabled>Select your size</option>

              {/* Standard Gents Sizes */}
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

              {/* Custom */}
              <option value="custom">Custom Size (Contact)</option>
            </select>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <button 
              onClick={onAddToCart}
              disabled={isAdding}
              data-testid="cypher-add-to-cart"
              className="w-full bg-white text-black rounded-xl py-4 tracking-[0.12em] text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED!" : "CLAIM YOURS"}
            </button>
          </div>

          {/* Composition */}
          <div className="mt-10">
            <h3 className="text-sm tracking-[0.2em] text-white/60 mb-3">COMPOSITION</h3>
            <p className="text-white/80 leading-7 whitespace-pre-line">{product.story}</p>
          </div>

          {/* Structure / Specs */}
          <div className="mt-10">
            <h3 className="text-sm tracking-[0.2em] text-white/60 mb-3">STRUCTURE</h3>
            <ul className="space-y-2 text-white/80">
              <li>Approx. 18–22g depending on size</li>
              <li>Dual emerald cabochons</li>
              <li>9-stone princess-cut diamond cluster</li>
              <li>Multi-density yellow sapphire pavé field</li>
              <li>Signature rhythm mesh band</li>
              <li>High-polish white gold construction</li>
            </ul>
          </div>

          {/* Craft */}
          <div className="mt-10">
            <h3 className="text-sm tracking-[0.2em] text-white/60 mb-3">CRAFT</h3>
            <p className="text-white/80 leading-7 whitespace-pre-line">{product.craft}</p>
          </div>

          {/* Final Word */}
          <div className="mt-10">
            <h3 className="text-sm tracking-[0.2em] text-white/60 mb-3">FINAL WORD</h3>
            <p className="text-white/80 leading-7 whitespace-pre-line">{product.closing}</p>
          </div>

          {/* Shipping */}
          <p className="mt-8 text-xs text-white/50">
            {product.shipping}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CLOSING STATEMENT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-black">
        <div className="mt-16 text-center max-w-xl mx-auto px-6">
          <p className="text-lg md:text-xl leading-relaxed text-white">
            Keep your finger in CYPHER.
          </p>

          <p className="text-sm tracking-widest text-neutral-400 mt-4">
            It defines presence.
          </p>
        </div>
      </section>

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
}
