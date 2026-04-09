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
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
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
      quantity: quantity,
      image: product.gallery[0].src,
    });
  };

  // Filter out hidden tiers (silver)
  const visibleTiers = Object.entries(product.tiers).filter(([key, tier]) => !tier.hiddenFromHero);

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO — TRIBUTE: LA BÊTE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden">
        <img
          src={product.heroImage}
          alt="TRIBUTE: LA BÊTE hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* CONTENT - Bottom left aligned */}
        <div className="relative z-10 flex flex-col justify-end h-full px-[6vw] pb-12 md:pb-20 animate-[fadeInUp_1s_ease-out]">
          <div className="w-full max-w-[520px]">
            
            <p className="text-white/60 tracking-[0.35em] text-[10px] leading-none mb-3">
              PHILEON
            </p>
            
            <p className="text-white/50 tracking-[0.25em] text-[10px] leading-none mb-4">
              COLLECTIVE — GENTS
            </p>
            
            <h1 className="text-white font-serif text-[clamp(2.4rem,5vw,3.8rem)] tracking-[-0.01em] leading-[1.08] mb-3">
              TRIBUTE: LA BÊTE
            </h1>
            
            <p className="text-white/75 text-[clamp(0.9rem,1.3vw,1.1rem)] leading-[1.5] mb-4">
              Born in the showroom.<br />
              Built for the hand.
            </p>
            
            <p className="text-white/50 text-sm tracking-[0.1em]">
              From $7,400 CAD
            </p>
            
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-10 md:h-14" />

      {/* ═══════════════════════════════════════════════════════════════
          GALLERY - Full width on mobile, left column on desktop
      ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full px-4 md:hidden py-4">
        <div className="flex flex-col items-center">
          {/* Main Image */}
          <div className="w-full max-w-[520px] h-[32vh] bg-[#0a0a0a] rounded-[16px] overflow-hidden">
            <img
              src={gallery[activeImage].src}
              alt={gallery[activeImage].alt || ""}
              className="w-full h-full object-cover object-center rounded-[12px]"
            />
          </div>
          
          {/* Thumbnails */}
          <div className="w-full mt-3 overflow-x-auto flex gap-2 px-2 justify-center">
            {gallery.map((item, index) => (
              <button
                key={`thumb-mobile-${index}`}
                onClick={() => setActiveImage(index)}
                className={`
                  flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-200
                  ${activeImage === index 
                    ? "opacity-100 ring-2 ring-white/60" 
                    : "opacity-40 ring-1 ring-white/10"}
                `}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT - Desktop: Gallery + Purchase Panel side by side
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12 grid md:grid-cols-2 gap-10 md:gap-16">
        
        {/* LEFT - Gallery (Desktop only) */}
        <div className="hidden md:flex flex-col items-center">
          
          {/* Main Image */}
          <div className="w-full max-w-[520px] h-[50vh] bg-[#0a0a0a] rounded-[16px] overflow-hidden">
            <img
              src={gallery[activeImage].src}
              alt={gallery[activeImage].alt || ""}
              className="w-full h-full object-cover object-center rounded-[12px]"
            />
          </div>
          
          {/* Thumbnails */}
          <div className="w-full mt-4 overflow-x-auto flex gap-3 px-2 justify-center">
            {gallery.map((item, index) => (
              <button
                key={`thumb-desktop-${index}`}
                onClick={() => setActiveImage(index)}
                onMouseEnter={() => setActiveImage(index)}
                className={`
                  flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200
                  ${activeImage === index 
                    ? "opacity-100 ring-2 ring-white/60" 
                    : "opacity-40 hover:opacity-70 ring-1 ring-white/10"}
                `}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT - Purchase Panel */}
        <div className="md:sticky md:top-20 h-fit">
          
          {/* Category & Title */}
          <p className="text-xs tracking-[0.28em] text-white/60 mb-3">
            RING
          </p>
          <h2 className="text-4xl md:text-5xl tracking-[0.02em] font-light mb-2">
            LA BÊTE
          </h2>
          <p className="text-white/75 mb-6">{product.tagline}</p>

          {/* Tier Selection */}
          <div className="mb-6">
            <p className="text-xs tracking-[0.25em] opacity-50 mb-4">
              SELECT CONFIGURATION
            </p>
            <div className="space-y-3">
              {visibleTiers.map(([key, tier]) => {
                const isActive = selectedTier === key;
                
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    data-testid={`labete-tier-${key}`}
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
                        ${product.pricing[key].toLocaleString()} CAD
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="mb-4">
            <p className="text-xs tracking-[0.25em] opacity-50 mb-3">
              SIZE
            </p>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              data-testid="labete-size-select"
              className="w-full bg-black border border-white/15 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors"
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

          {/* QUANTITY SELECTOR */}
          <div className="mb-6">
            <p className="text-xs tracking-[0.25em] opacity-50 mb-3">
              QUANTITY
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center hover:border-white/30 transition-colors"
              >
                −
              </button>
              <span className="text-lg w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center hover:border-white/30 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            onClick={onAddToCart}
            disabled={isAdding || !selectedSize}
            data-testid="labete-add-to-cart"
            className="w-full bg-white text-black rounded-xl py-4 tracking-[0.12em] text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED!" : "CLAIM YOURS"}
          </button>

          {/* Order Info */}
          <div className="space-y-2 text-xs text-white/45">
            <p>Made to order. Please allow production time.</p>
            <p>Crafted to order in your selected configuration.</p>
            <p>Limited production. Built in small numbers.</p>
            <p>Final delivery timing confirmed after order review.</p>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-8" />

          {/* CRAFT Section */}
          <div>
            <h3 className="text-sm tracking-[0.2em] text-white/60 mb-6">CRAFT</h3>
            
            <div className="space-y-6">
              {/* 01 FORMED */}
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-white/35 text-xs">01</span>
                  <span className="text-white/85 text-sm tracking-[0.15em]">FORMED</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed pl-8">
                  The grille is recast as a ring. Every curve kept deliberate. Every surface built to read with force.
                </p>
              </div>
              
              {/* 02 SET */}
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-white/35 text-xs">02</span>
                  <span className="text-white/85 text-sm tracking-[0.15em]">SET</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed pl-8">
                  Stone by stone, the face is tightened into a controlled field of light. Precision first. Excess, disciplined.
                </p>
              </div>
            </div>
            
            {/* Poetic transition */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-white/50 text-sm leading-relaxed italic">
                Chrome becomes gold.<br />
                Carbon becomes stone.
              </p>
              <p className="text-white/70 text-sm mt-4">
                The grille becomes TRIBUTE.
              </p>
            </div>
          </div>

          {/* Shipping */}
          <p className="mt-8 text-xs text-white/40">
            {product.shipping}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CLOSING STATEMENT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-black">
        <div className="text-center max-w-xl mx-auto px-6">
          <p className="text-xl md:text-2xl leading-relaxed text-white font-light">
            Not driven.<br />
            Worn.
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
