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
  const [selectedSize, setSelectedSize] = useState("");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const currentPrice = product.pricing[selectedTier];
  const currentTier = product.tiers[selectedTier];

  // CYPHER GALLERY ORDER (9 IMAGES — FINAL)
  // 1. toronto-hero (Establish identity — cinematic entry)
  // 2. cypher-black-angled (Power shot — depth, gold reflections, dominance)
  // 3. cypher-clean-white (Clarity — full product read, customer confidence)
  // 4. cypher-finger (Scale + lifestyle — "this is how it sits")
  // 5. cypher-macro-diamonds (Craft focus — princess cluster detail)
  // 6. cypher-macro-emerald (Color + material richness — emerald cabochons)
  // 7. cypher-box (Luxury context — ownership moment)
  // 8. cypher-glove (Craftsmanship — handling, finishing, care)
  // 9. cypher-silk (Soft landing — elegance, final impression)
  const reorderedGallery = [
    product.gallery[0], // 1. Toronto hero
    product.gallery[1], // 2. Black angled
    product.gallery[2], // 3. Clean white
    product.gallery[7], // 4. Finger shot
    product.gallery[3], // 5. Macro diamonds
    product.gallery[4], // 6. Macro emerald
    product.gallery[5], // 7. Box shot
    product.gallery[6], // 8. Glove shot
    product.gallery[8], // 9. Silk
  ];

  const onAddToCart = () => {
    handleAddToCart({
      id: `cypher-${selectedTier}-${selectedSize}`,
      name: `CYPHER — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      price: currentPrice,
      metal: currentTier.metal,
      size: selectedSize,
      image: product.gallery[0].src,
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION - Full Screen with Toronto Skyline
          Ring raised 10-15%, enhanced typography
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden bg-black">
        <img
          src={product.gallery[0].src}
          alt="CYPHER hero"
          className="absolute inset-0 w-full h-full object-cover product-image-hd"
          style={{ 
            filter: "brightness(0.85)",
            objectPosition: "center 40%", // Raise the ring ~10-15%
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Slight blur on background behind text */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.3) 70%)"
          }}
        />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 translate-y-[-5%]">
          <h1 
            className="text-6xl md:text-8xl tracking-[0.04em] font-light"
            style={{ animation: "fadeInUp 1s ease-out 0.3s both" }}
          >
            CYPHER
          </h1>
          <p 
            className="text-sm md:text-base text-neutral-300 mt-4"
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
          {reorderedGallery.map((item, index) => (
            <div 
              key={`${item.alt}-${index}`} 
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
            <label className="block text-xs tracking-widest text-neutral-400 mb-3">
              TIER
            </label>
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
