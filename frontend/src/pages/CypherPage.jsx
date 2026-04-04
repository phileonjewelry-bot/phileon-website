import { useState } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

/* ═══════════════════════════════════════════════════════════════
   CYPHER — Men's Statement Ring
   Drama on your finger.
   Emeralds, Yellow Sapphires, Princess-Cut Diamonds
═══════════════════════════════════════════════════════════════ */

export default function CypherPage() {
  const product = products.cypher;
  const [selectedTier, setSelectedTier] = useState("signature");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const currentPrice = product.pricing[selectedTier];
  const currentTier = product.tiers[selectedTier];

  const onAddToCart = () => {
    handleAddToCart({
      id: `cypher-${selectedTier}`,
      name: `CYPHER — ${currentTier.name}`,
      price: currentPrice,
      metal: currentTier.metal,
      image: product.gallery[0].src,
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION - Full Screen with Toronto Skyline
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden bg-black">
        <img
          src={product.gallery[0].src}
          alt="CYPHER hero"
          className="absolute inset-0 w-full h-full object-cover product-image-hd"
          style={{ filter: "brightness(0.9)" }}
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 text-center px-6">
          <h1 
            className="text-5xl md:text-7xl tracking-[0.08em] font-light"
            style={{ animation: "fadeInUp 1s ease-out 0.3s both" }}
          >
            CYPHER
          </h1>
          <p 
            className="mt-3 text-base md:text-lg text-white/75"
            style={{ animation: "fadeInUp 1s ease-out 0.5s both" }}
          >
            {product.tagline}
          </p>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/40 to-transparent animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT - Scrolling Gallery + Sticky Sidebar
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-2 gap-12">
        
        {/* LEFT - Scrolling Gallery */}
        <div className="space-y-4">
          {product.gallery.map((item, index) => (
            <div 
              key={`${item.alt}-${index}`} 
              className="bg-black rounded-2xl overflow-hidden"
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
          <h2 className="text-4xl md:text-5xl tracking-[0.06em] font-light">
            {product.name}
          </h2>
          <p className="mt-3 text-white/75">{product.tagline}</p>

          {/* Tier Selection */}
          <div className="mt-8">
            <p className="text-sm tracking-[0.2em] text-white/60 mb-3">TIER</p>
            <div className="space-y-3">
              {Object.entries(product.tiers).map(([key, tier]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  data-testid={`cypher-tier-${key}`}
                  className={`w-full text-left border rounded-xl px-4 py-4 transition-all duration-200 ${
                    selectedTier === key
                      ? "border-white bg-white text-black"
                      : "border-white/15 bg-transparent text-white hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm tracking-wide">{tier.label}</div>
                      <div className={`${selectedTier === key ? "text-black/70" : "text-white/60"} text-xs mt-1`}>
                        {tier.metal} · {tier.stones}
                      </div>
                    </div>
                    <div className="text-right">
                      {tier.badge && (
                        <div className={`text-[10px] tracking-[0.18em] mb-1 ${selectedTier === key ? "text-black/70" : "text-white/50"}`}>
                          {tier.badge}
                        </div>
                      )}
                      <div className="text-lg">
                        ${product.pricing[key].toLocaleString()} CAD
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
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
              <li>{product.specs.weight}</li>
              <li>{product.specs.centerStones}</li>
              <li>{product.specs.cluster}</li>
              <li>{product.specs.pave}</li>
              <li>{product.specs.band}</li>
              <li>{product.specs.finish}</li>
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
