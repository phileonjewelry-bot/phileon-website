import { useState } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

/* ═══════════════════════════════════════════════════════════════
   TRIBUTE: LA BÊTE — "The Beast"
   Bugatti-inspired white gold ring
   Full diamond pavé with horseshoe grille motif
═══════════════════════════════════════════════════════════════ */

export default function LaBetePage() {
  const product = products.labete;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const currentPrice = product.pricing[selectedTier];
  const currentTier = product.tiers[selectedTier];

  const gallery = product.gallery;

  const onAddToCart = () => {
    handleAddToCart({
      id: `labete-${selectedTier}-${selectedSize}`,
      name: `LA BÊTE — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
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
          HERO — TRIBUTE: LA BÊTE
          Bottom-left aligned text with gradient overlay
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[68vh] md:h-[75vh] overflow-hidden bg-black">
        
        {/* Hero Image (Showroom shot with Bugatti) */}
        <img
          src={product.gallery[0].src}
          alt="TRIBUTE: LA BÊTE hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        
        {/* CONTENT - Bottom left aligned */}
        <div className="relative z-10 flex flex-col justify-end h-full px-[6vw] pb-14 md:pb-24 animate-[fadeInUp_1s_ease-out]">
          <div className="w-full max-w-[520px]">
            
            {/* BRAND */}
            <p className="text-white/60 tracking-[0.35em] text-[10px] leading-none mb-3">
              PHILEON
            </p>
            
            {/* COLLECTION */}
            <p className="text-white/50 tracking-[0.25em] text-[10px] leading-none mb-4">
              COLLECTIVE — GENTS
            </p>
            
            {/* TITLE */}
            <h1 className="text-white font-serif text-[clamp(2.8rem,5vw,4.2rem)] tracking-[-0.02em] leading-[1.05] mb-3">
              TRIBUTE: LA BÊTE
            </h1>
            
            {/* TAGLINE */}
            <p className="text-white/75 text-[clamp(1rem,1.4vw,1.2rem)] leading-[1.4]">
              Born in the showroom.<br />
              Built for the hand.
            </p>
            
          </div>
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
            LA BÊTE
          </h2>
          <p className="mt-3 text-white/85">{product.tagline}</p>

          {/* Tier Selection - 3 Column Grid */}
          <div className="mt-8">
            <p className="text-xs tracking-[0.25em] opacity-50 mb-4">
              SELECT CONFIGURATION
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.tiers).map(([key, tier]) => {
                const isActive = selectedTier === key;
                
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    data-testid={`labete-tier-${key}`}
                    className={`
                      relative cursor-pointer rounded-2xl p-5 transition-all duration-200
                      ${isActive 
                        ? "border border-white bg-white/[0.04] scale-[1.02] translate-y-[-2px]" 
                        : "border border-white/10 hover:border-white/30"}
                    `}
                  >
                    {/* MOST POPULAR TAG */}
                    {tier.badge && (
                      <span className="absolute top-3 right-3 text-[9px] tracking-[0.15em] bg-white text-black px-2 py-1 rounded-full">
                        {tier.badge}
                      </span>
                    )}
                    
                    {/* TITLE */}
                    <p className={`text-xs tracking-[0.25em] mb-2 ${isActive ? "opacity-90" : "opacity-50"}`}>
                      {tier.label}
                    </p>
                    
                    {/* DESCRIPTION */}
                    <p className={`text-sm whitespace-pre-line mb-4 ${isActive ? "opacity-80" : "opacity-60"}`}>
                      {tier.metal}{"\n"}{tier.stones}
                    </p>
                    
                    {/* PRICE */}
                    <p className={`text-xl ${isActive ? "text-white" : "opacity-80"}`}>
                      ${product.pricing[key].toLocaleString()}
                    </p>
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
              data-testid="labete-size-select"
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
              data-testid="labete-add-to-cart"
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
            <h3 className="text-sm tracking-[0.2em] text-white/60 mb-6">CRAFT</h3>
            
            <div className="space-y-8">
              {/* 01 Precision */}
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-white/40 text-xs">01</span>
                  <span className="text-white/90 text-sm tracking-[0.15em]">PRECISION</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed pl-8">
                  380+ diamonds.<br />
                  Each placed with automotive precision.<br />
                  Zero tolerance.
                </p>
              </div>
              
              {/* 02 Form */}
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-white/40 text-xs">02</span>
                  <span className="text-white/90 text-sm tracking-[0.15em]">FORM</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed pl-8">
                  Horseshoe grille.<br />
                  Sculpted curves.<br />
                  Built like the machine that inspired it.
                </p>
              </div>
            </div>
          </div>

          {/* Final Word */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-white/80 leading-7">
              Not worn.<br />
              Driven.
            </p>
            <p className="text-white/50 text-xs tracking-[0.2em] mt-6">
              TRIBUTE: LA BÊTE ✦ ONE OF ONE
            </p>
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
            The showroom is temporary.<br />
            The ring is forever.
          </p>

          <p className="text-sm tracking-widest text-neutral-400 mt-4">
            LA BÊTE
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
