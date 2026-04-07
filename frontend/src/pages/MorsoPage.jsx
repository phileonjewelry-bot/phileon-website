import { useState } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

/* ═══════════════════════════════════════════════════════════════
   IL MORSO DEL RE — "The Bite of the King"
   Grillz-inspired statement ring
   Yellow gold with diamond pavé teeth motif
═══════════════════════════════════════════════════════════════ */

export default function MorsoPage() {
  const product = products.morso;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const currentPrice = product.pricing[selectedTier];
  const currentTier = product.tiers[selectedTier];

  const gallery = product.gallery;

  const onAddToCart = () => {
    handleAddToCart({
      id: `morso-${selectedTier}-${selectedSize}`,
      name: `IL MORSO DEL RE — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
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
          HERO SECTION - Static Image (Video placeholder)
          Using front_black image until hero video is provided
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden">
        
        {/* Hero Image (replace with video when available) */}
        <img
          src={product.gallery[2].src}
          alt="IL MORSO DEL RE hero"
          className="absolute inset-0 w-full h-full object-cover object-[50%_40%] scale-[1.1]"
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />
        
        {/* Hero text */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          
          {/* Brand */}
          <div className="text-white/70 tracking-[0.35em] text-xs md:text-sm mb-2">
            PHILEON
          </div>
          
          {/* Category */}
          <div className="text-white/50 tracking-[0.25em] text-[10px] md:text-xs mb-6">
            COLLECTIVE — GENTS
          </div>
          
          {/* Name */}
          <h1 className="text-white font-serif tracking-[0.18em] text-3xl md:text-5xl leading-tight">
            IL MORSO DEL RE
          </h1>
          
          {/* Subline */}
          <p className="text-white/70 mt-3 text-sm md:text-base tracking-[0.08em]">
            The Bite of the King
          </p>
          
          {/* Spec line */}
          <p className="text-white/50 mt-4 text-xs tracking-[0.12em]">
            14mm Sculpted Gold Form · 256 Lab-Grown Diamonds
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
            <label className="block text-xs tracking-widest text-neutral-400 mb-3">
              TIER
            </label>
            <div className="space-y-3">
              {Object.entries(product.tiers).map(([key, tier]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  data-testid={`morso-tier-${key}`}
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
              data-testid="morso-size-select"
              className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white"
            >
              <option value="" disabled>Select your size</option>
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
              <option value="custom">Custom Size (Contact)</option>
            </select>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <button 
              onClick={onAddToCart}
              disabled={isAdding}
              data-testid="morso-add-to-cart"
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
              <li>{product.specs.diamonds}</li>
              <li>{product.specs.caratWeight}</li>
              <li>{product.specs.width}</li>
              <li>{product.specs.weight}</li>
              <li>{product.specs.material}</li>
            </ul>
            <p className="text-white/50 text-xs mt-4">{product.specs.note}</p>
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
            The crown is optional.<br />
            The bite is not.
          </p>

          <p className="text-sm tracking-widest text-neutral-400 mt-4">
            IL MORSO DEL RE
          </p>
        </div>
      </section>

    </div>
  );
}
