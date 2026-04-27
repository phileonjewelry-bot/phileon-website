import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import { useLivePrice, useLiveTierPrices } from "@/hooks/useLivePrice";

const HERO_IMG =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/e8d03p9o_1000147798.png";

export default function CorinthiansPage() {
  const product = products.corinthians1514;
  const [selectedTier, setSelectedTier] = useState(product.defaultTier || "signature");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeThumb, setActiveThumb] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const currentTier = product.tiers[selectedTier];
  const gallery = product.gallery;
  const tierPrices = useLiveTierPrices("corinthians1514");
  const { formatted: ctaPrice, price: ctaPriceNum } = useLivePrice(
    "corinthians1514",
    selectedTier,
    product.pricing[selectedTier]
  );

  const handleSelect = useCallback(
    (index) => {
      if (index === activeThumb || isTransitioning) return;
      setIsTransitioning(true);
      setActiveThumb(index);
      setTimeout(() => setIsTransitioning(false), 250);
    },
    [activeThumb, isTransitioning]
  );

  const heroAddToCart = () => {
    handleAddToCart({
      id: `corinthians-1514-${selectedTier}-${selectedSize || "default"}`,
      name: `1 Corinthians 15:14 — ${currentTier.name}${selectedSize ? ` (Size ${selectedSize})` : ""}`,
      price: ctaPriceNum || product.pricing[selectedTier],
      productKey: "corinthians1514",
      tierKey: selectedTier,
      metal: currentTier.metal,
      size: selectedSize,
      quantity: 1,
      image: HERO_IMG,
    });
  };

  const onAddToCart = () => {
    if (!selectedSize) return;
    heroAddToCart();
  };

  const sizeOptions = [];
  for (let i = 4; i <= 10; i++) {
    sizeOptions.push(i.toString());
    if (i < 10) sizeOptions.push(`${i}.5`);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section
        className="w-screen h-[78vh] md:h-[88vh] bg-black relative overflow-hidden -mx-4 md:mx-0"
        data-testid="corinthians-hero"
      >
        <img
          src={HERO_IMG}
          alt="1 Corinthians 15:14"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 40%" }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Back link */}
        <Link
          to="/shop?category=rings&audience=ladies"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/55 text-xs tracking-[0.3em] hover:text-[#D4AF37] transition-colors"
          data-testid="corinthians-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO RINGS</span>
        </Link>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <p className="text-white/55 text-[10px] tracking-[0.4em] mb-3">
            PHILEON — SACRED COLLECTION
          </p>

          <h1
            className="text-white font-serif leading-[0.95] tracking-[0.04em] mb-5 product-hero-title text-center mx-auto"
            data-testid="corinthians-title"
          >
            1 CORINTHIANS 15:14
          </h1>

          <p className="text-white/75 italic text-[14px] md:text-[16px] leading-relaxed max-w-[480px] mb-8">
            If Christ has not been raised,
            <br />
            our preaching is useless
            <br />
            and so is your faith.
          </p>

          <button
            onClick={heroAddToCart}
            disabled={isAdding}
            data-testid="corinthians-hero-cta"
            className="px-8 py-4 bg-[#D4AF37] hover:bg-[#C19B2E] text-black text-[12px] tracking-[0.25em] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : "ADD TO BAG"}
          </button>
        </div>
      </section>

      {/* GALLERY */}
      <section className="w-full -mt-12 md:-mt-16 pt-4 md:pt-6" data-testid="corinthians-gallery">
        <div className="max-w-[460px] md:max-w-[560px] mx-auto px-3 md:px-5">
          <div className="w-full overflow-hidden rounded-[10px] bg-black mb-2">
            <img
              src={gallery[activeThumb].src}
              alt={gallery[activeThumb].alt}
              className={`w-full aspect-square object-contain transition-opacity duration-250 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>

          <div className="flex gap-[5px] overflow-x-auto pb-1 scrollbar-hide">
            {gallery.map((item, index) => (
              <button
                key={`t-${index}`}
                onClick={() => handleSelect(index)}
                data-testid={`corinthians-thumb-${index}`}
                className={`
                  w-[48px] h-[48px] md:w-[56px] md:h-[56px] flex-shrink-0 rounded-[3px] overflow-hidden
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

      {/* PURCHASE BLOCK */}
      <section className="py-10 md:py-14">
        <div className="max-w-[560px] mx-auto px-5 md:px-8 space-y-6 text-white">
          {/* Title */}
          <div>
            <h2
              className="font-serif text-3xl md:text-4xl tracking-wide"
              data-testid="corinthians-purchase-title"
            >
              1 CORINTHIANS 15:14
            </h2>
            <p className="text-white/60 text-sm mt-1">Sacred Collection</p>
          </div>

          {/* Metal selector */}
          <div>
            <label className="text-xs tracking-widest text-white/45">METAL</label>

            <div className="mt-3 space-y-3">
              {[
                { key: "signature",  label: "Signature",  note: "Most Popular" },
                { key: "foundation", label: "Foundation", note: null },
                { key: "heirloom",   label: "Heirloom",   note: "Collector" },
              ].map(({ key, label, note }) => {
                const isSelected = selectedTier === key;
                const priceStr =
                  tierPrices[key]?.formatted || `$${product.pricing[key].toLocaleString()}`;
                const tier = product.tiers[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTier(key)}
                    data-testid={`corinthians-tier-${key}-btn`}
                    className={`w-full text-left p-4 transition border ${
                      isSelected
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={isSelected ? "text-white tracking-wide" : "text-white/80"}>
                        {label}
                      </span>
                      <span className={isSelected ? "text-white" : "text-white/80"}>
                        {priceStr} CAD
                      </span>
                    </div>
                    <p className="text-[11px] text-white/55 mt-1">
                      {tier.metal}
                      {note ? ` · ${note}` : ""}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size profile */}
          <div>
            <label className="text-xs tracking-widest text-white/45">RING SIZE</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="mt-2 w-full border border-white/10 bg-black text-white p-4"
              data-testid="corinthians-size-select"
            >
              <option value="">Select size</option>
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  Size {s}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/45 mt-2">Sizes above 10 are custom.</p>
          </div>

          {/* Details */}
          <div>
            <p className="text-xs tracking-widest text-white/45 mb-2">DETAILS</p>
            <p className="text-white/80 text-sm leading-relaxed">{product.specs}</p>
          </div>

          {/* CTA */}
          <button
            onClick={onAddToCart}
            disabled={isAdding || !selectedSize}
            data-testid="corinthians-add-to-bag-btn"
            className="w-full bg-[#D4AF37] text-black py-4 tracking-[0.2em] text-sm font-medium hover:bg-[#C19B2E] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isAdding ? "ADDING..." : buttonText === "Added!" ? "ADDED" : `ADD TO BAG — ${ctaPrice} CAD`}
          </button>

          <p className="text-[10px] text-white/35 text-center">
            Price adjusts automatically with the live precious metals market.
          </p>

          <p className="text-xs text-white/45 text-center">
            Made to order • 3–4 weeks • Complimentary insured shipping within Canada
          </p>
        </div>
      </section>

      {/* DETAIL · CRAFT · STRUCTURE */}
      <section className="mt-10 md:mt-16" data-testid="corinthians-editorial">
        <div className="max-w-[900px] mx-auto px-6 md:px-0 space-y-14">
          <div>
            <p className="text-[12px] tracking-[0.25em] text-neutral-500 mb-4">DETAIL</p>
            <p className="text-[15px] md:text-[16px] leading-7 text-neutral-200 max-w-[720px]">
              {product.direction.detail}
            </p>
          </div>

          <div>
            <p className="text-[12px] tracking-[0.25em] text-neutral-500 mb-4">CRAFT</p>
            <p className="text-[15px] md:text-[16px] leading-7 text-neutral-200 max-w-[720px]">
              {product.direction.craft}
            </p>
          </div>

          <div>
            <p className="text-[12px] tracking-[0.25em] text-neutral-500 mb-4">STRUCTURE</p>
            <p className="text-[15px] md:text-[16px] leading-7 text-neutral-200 max-w-[720px]">
              {product.direction.structure}
            </p>
          </div>

          <div>
            <p className="text-[12px] tracking-[0.25em] text-neutral-500 mb-4">SPECIFICATIONS</p>
            <p className="text-[15px] md:text-[16px] leading-7 text-neutral-200 max-w-[720px]">
              {product.specs}
            </p>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="py-16 md:py-24 mt-8 border-t border-white/[0.04]">
        <div className="text-center max-w-[520px] mx-auto px-5">
          <p className="text-[14px] text-white/45 leading-relaxed italic mb-5">
            This is not ornament alone. <br />
            This is doctrine carried in form.
          </p>
          <p className="text-[9px] tracking-[0.3em] text-white/45">
            1 CORINTHIANS 15:14 — PHILEON SACRED COLLECTION
          </p>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .product-hero-title {
          font-size: clamp(2.4rem, 11vw, 3.75rem);
          line-height: 0.95;
          max-width: calc(100vw - 32px);
          overflow-wrap: normal;
          white-space: normal;
          text-align: center;
          margin-left: auto;
          margin-right: auto;
          padding-left: 16px;
          padding-right: 16px;
        }

        @media (min-width: 768px) {
          .product-hero-title {
            font-size: 60px;
            line-height: 1.05;
            letter-spacing: 0.05em;
            padding-left: 0;
            padding-right: 0;
          }
        }

        @media (max-width: 480px) {
          .product-hero-title {
            font-size: clamp(1.85rem, 9vw, 2.6rem);
            letter-spacing: -0.01em;
          }
        }
      `}</style>
    </div>
  );
}
