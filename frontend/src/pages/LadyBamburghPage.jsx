import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import { useLivePrice, useLiveTierPrices } from "@/hooks/useLivePrice";

const LADY_BAMBURGH_IMG = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ulu0v463_1000146371.png";
const LADY_BAMBURGH_HERO_VIDEO = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/gjr06mge_hf_20260419_224240_b1b530d9-43a4-4ed4-b0d0-16f3cc8b1826.mp4";
const LADY_BAMBURGH_HERO_POSTER = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/9wkvhexa_1000147014.png";

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
  const tierPrices = useLiveTierPrices("ladyBamburgh");
  const { formatted: ctaPrice } = useLivePrice("ladyBamburgh", selectedTier, product.pricing[selectedTier]);

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
      price: tierPricesLive[selectedTier]?.price || product.pricing[selectedTier],
      productKey: "ladyBamburgh",
      tierKey: selectedTier,
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
        <video
          src={LADY_BAMBURGH_HERO_VIDEO}
          poster={LADY_BAMBURGH_HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover object-center"
          data-testid="lady-bamburgh-hero-video"
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

      {/* SIGNATURE SERIES EDITORIAL */}
      <section className="px-6 md:px-12 py-20 md:py-28 bg-black text-white border-t border-white/10">
        <div className="max-w-[900px] mx-auto">
          <p className="text-[11px] tracking-[0.35em] text-white/45 uppercase mb-5">
            Signature Series
          </p>

          <h2 className="text-3xl md:text-5xl font-serif leading-[1.08] max-w-[760px] mb-8">
            Lady Bamburgh is built to hold attention without asking for it.
          </h2>

          <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-[680px]">
            Dual center stones. Black depth. Gold authority. Every surface is designed
            to feel controlled, exact, and unapologetically present.
          </p>
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
            <p className="text-sm text-gray-400 mt-2">
              Presence without permission.
            </p>
          </div>

          {/* STORY */}
          <div className="text-white/45 text-[12px] leading-[1.7] whitespace-pre-line">
            {product.story}
          </div>

          {/* TIER SELECTOR */}
          <div>
            <label className="text-xs tracking-widest text-gray-500">
              SELECT TIER
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="mt-2 w-full border border-neutral-700 bg-black text-white p-3"
            >
              <option value="signature">Signature — {tierPrices.signature?.formatted || `$${product.pricing.signature.toLocaleString()}`} CAD (Most Popular)</option>
              <option value="foundation">Foundation — {tierPrices.foundation?.formatted || `$${product.pricing.foundation.toLocaleString()}`} CAD</option>
              <option value="heirloom">Heirloom — {tierPrices.heirloom?.formatted || `$${product.pricing.heirloom.toLocaleString()}`} CAD (Collector)</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              {product.tiers[selectedTier].description}
            </p>
          </div>

          {/* SIZE PROFILE */}
          <div>
            <label className="text-xs tracking-widest text-gray-500">
              SIZE PROFILE
            </label>
            <select
              value={sizeProfile}
              onChange={(e) => { setSizeProfile(e.target.value); setSelectedSize(""); }}
              className="mt-2 w-full border border-neutral-700 bg-black text-white p-3"
            >
              <option value="ladies">Ladies (4–9)</option>
              <option value="gents">Gents (6–12)</option>
            </select>
          </div>

          {/* RING SIZE */}
          <div>
            <label className="text-xs tracking-widest text-gray-500">
              RING SIZE
            </label>
            <input
              type="number"
              step="0.5"
              min={sizeProfile === "ladies" ? "4" : "6"}
              max={sizeProfile === "ladies" ? "9" : "12"}
              placeholder="Enter size (e.g. 7.5)"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="mt-2 w-full border border-neutral-700 bg-black text-white p-3 placeholder:text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-2">
              Sizes above 12 are custom.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={onAddToCart}
            disabled={isAdding || !selectedSize}
            className="w-full bg-[#D4AF37] text-black py-4 tracking-widest text-sm font-medium hover:bg-[#C19B2E] disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : `ADD TO BAG — ${ctaPrice} CAD`}
          </button>

          {/* PRODUCTION NOTE */}
          <p className="text-xs text-gray-500 text-center">
            Made to order &bull; 3–4 weeks &bull; Complimentary insured shipping within Canada
          </p>
          <p className="text-[9px] text-gray-600 text-center mt-1">
            Price adjusts automatically with the live precious metals market.
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
