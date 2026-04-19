import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import PhileonCarousel from "@/components/PhileonCarousel";

const LADY_BAMBURGH_IMG = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ulu0v463_1000146371.png";

export default function LadyBamburghPage() {
  const product = products.ladyBamburgh;
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const currentTier = product.tiers[selectedTier];
  const gallery = product.gallery;

  const handleSelect = useCallback((index) => {
    if (index === activeThumb || isTransitioning) return;
    setIsTransitioning(true);
    setActiveThumb(index);
    setTimeout(() => setIsTransitioning(false), 250);
  }, [activeThumb, isTransitioning]);

  const onAddToCart = () => {
    handleAddToCart({
      id: `lady-bamburgh-${selectedTier}-${selectedSize}`,
      name: `Lady Bamburgh — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      price: product.pricing[selectedTier],
      metal: currentTier.metal,
      size: selectedSize,
      quantity: quantity,
      image: LADY_BAMBURGH_IMG,
    });
  };

  const sizeOptions = [];
  for (let i = 5; i <= 10; i++) {
    sizeOptions.push(i.toString());
    if (i < 10) sizeOptions.push(`${i}.5`);
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="relative w-full h-[90vh] overflow-hidden bg-black">
        <img
          src={LADY_BAMBURGH_IMG}
          alt="Lady Bamburgh Ring"
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/70" />
        <div className="relative z-10 h-full flex items-end px-6 md:px-16 pb-14">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.35em] text-white/60 mb-3">
              PHILEON
            </p>
            <h1 className="text-4xl md:text-6xl font-serif tracking-wide text-white mb-4">
              LADY BAMBURGH
            </h1>
            <p className="text-white/75 text-base md:text-lg leading-relaxed mb-8">
              Presence without permission. Built for the woman who doesn&rsquo;t wait to be seen.
            </p>
            <Link
              to="/products/lady-bamburgh"
              className="inline-block px-8 py-4 text-black text-sm tracking-wide font-medium rounded-md bg-[#D4AF37] hover:bg-[#C19B2E] transition-all duration-300"
            >
              Enter Bamburgh &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY */}
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
                  w-[44px] h-[44px] md:w-[50px] md:h-[50px] flex-shrink-0 rounded-[3px] overflow-hidden
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

      {/* PRODUCT DETAILS */}
      <section className="py-6 md:py-10">
        <div className="max-w-[560px] mx-auto px-5 md:px-8">

          <div className="mb-6">
            <p className="text-[8px] tracking-[0.35em] text-white/50 mb-2">SIGNATURE SERIES</p>
            <h2 className="text-xl md:text-2xl font-serif text-white/90 mb-1">LADY BAMBURGH</h2>
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
              <p>Profile: Round brilliant dual-center signet</p>
              <p>Metal: Two-tone rose gold &amp; white gold</p>
              <p>Stones: Round brilliant diamonds, black diamond borders</p>
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
                        ${product.pricing[key].toLocaleString()} CAD
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
                <option value="" disabled className="bg-black">Select size (5-10)</option>
                {sizeOptions.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
              <p className="text-[8px] text-white/20 mt-1">Half sizes &middot; Custom above 10</p>
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
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "CLAIM YOURS"}
          </button>

          <p className="text-[8px] text-white/18 mb-6">Made to order &middot; Limited production &middot; Signature Series</p>
        </div>
      </section>

      {/* CLOSING */}
      <section className="py-10 md:py-14 border-t border-white/[0.03]">
        <div className="text-center max-w-[400px] mx-auto px-5">
          <p className="text-[13px] text-white/40 leading-relaxed mb-3">
            Command, in form.
          </p>
          <p className="text-[9px] tracking-[0.3em] text-white/50">LADY BAMBURGH — PHILEON</p>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
