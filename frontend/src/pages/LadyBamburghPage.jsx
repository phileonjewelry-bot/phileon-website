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
  const [sizeProfile, setSizeProfile] = useState("ladies");
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
        <div className="max-w-[560px] mx-auto px-5 md:px-8 space-y-6">

          {/* TITLE */}
          <div>
            <h1 className="text-3xl tracking-[0.2em] font-serif text-white">
              LADY BAMBURGH
            </h1>
            <p className="text-sm text-white/50 mt-2">
              Presence without permission.
            </p>
          </div>

          {/* STORY */}
          <div className="text-white/45 text-[12px] leading-[1.7] whitespace-pre-line">
            {product.story}
          </div>

          {/* TIER SELECT */}
          <div>
            <label className="text-xs tracking-widest text-white/40">
              SELECT TIER
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="mt-2 w-full bg-transparent border border-white/10 rounded-md p-3 text-[12px] text-white/70 focus:outline-none focus:border-white/25"
            >
              <option value="signature" className="bg-black">Signature — ${product.pricing.signature.toLocaleString()} CAD (Most Popular)</option>
              <option value="foundation" className="bg-black">Foundation — ${product.pricing.foundation.toLocaleString()} CAD</option>
              <option value="heirloom" className="bg-black">Heirloom — ${product.pricing.heirloom.toLocaleString()} CAD (Collector)</option>
            </select>
            <p className="text-[10px] text-white/30 mt-2">
              {product.tiers[selectedTier].description}
            </p>
          </div>

          {/* SIZE PROFILE */}
          <div>
            <label className="text-xs tracking-widest text-white/40">
              SIZE PROFILE
            </label>
            <select
              value={sizeProfile}
              onChange={(e) => { setSizeProfile(e.target.value); setSelectedSize(""); }}
              className="mt-2 w-full bg-transparent border border-white/10 rounded-md p-3 text-[12px] text-white/70 focus:outline-none focus:border-white/25"
            >
              <option value="ladies" className="bg-black">Ladies (4–9)</option>
              <option value="gents" className="bg-black">Gents (6–12)</option>
            </select>
          </div>

          {/* RING SIZE */}
          <div>
            <label className="text-xs tracking-widest text-white/40">
              RING SIZE
            </label>
            <input
              type="number"
              step="0.5"
              min={sizeProfile === "ladies" ? "4" : "6"}
              max={sizeProfile === "ladies" ? "9" : "12"}
              placeholder={sizeProfile === "ladies" ? "Enter size (e.g. 7.5)" : "Enter size (e.g. 10)"}
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="mt-2 w-full bg-transparent border border-white/10 rounded-md p-3 text-[12px] text-white/70 focus:outline-none focus:border-white/25 placeholder:text-white/25"
            />
            <p className="text-[10px] text-white/30 mt-2">
              Sizes above 12 are custom and will be confirmed after purchase.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={onAddToCart}
            disabled={isAdding || !selectedSize}
            className="w-full bg-[#D4AF37] text-black rounded-md py-4 text-sm tracking-wide font-medium hover:bg-[#C19B2E] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : `ADD TO BAG — $${product.pricing[selectedTier].toLocaleString()} CAD`}
          </button>

          <p className="text-[9px] text-white/20 text-center">
            Made to order &middot; Limited production &middot; Signature Series
          </p>

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
