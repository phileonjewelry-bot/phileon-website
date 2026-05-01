import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";
import { useLivePrice, useLiveTierPrices } from "@/hooks/useLivePrice";
import SizeGuideModal from "@/components/SizeGuideModal";

const HERO_IMG =
  "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/j97q3uqn_1000148293.png";

export default function CouronnePage() {
  const product = products.priseDeCouronne;
  const [selectedTier, setSelectedTier] = useState(product.defaultTier || "signature");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeThumb, setActiveThumb] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const currentTier = product.tiers[selectedTier];
  const gallery = product.gallery;
  const tierPrices = useLiveTierPrices("priseDeCouronne");
  const { formatted: ctaPrice, price: ctaPriceNum } = useLivePrice(
    "priseDeCouronne",
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

  const onAddToCart = () => {
    if (!selectedSize) return;
    handleAddToCart({
      id: `prise-de-couronne-${selectedTier}-${selectedSize}`,
      name: `Prise de Couronne — ${currentTier.name} (Size ${selectedSize})`,
      price: ctaPriceNum || product.pricing[selectedTier],
      productKey: "priseDeCouronne",
      tierKey: selectedTier,
      metal: currentTier.metal,
      size: selectedSize,
      quantity: 1,
      image: HERO_IMG,
    });
  };

  const sizeOptions = [];
  for (let i = 6; i <= 12; i++) {
    sizeOptions.push(i.toString());
    if (i < 12) sizeOptions.push(`${i}.5`);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section
        className="relative w-full h-[92vh] overflow-hidden bg-black"
        data-testid="couronne-hero"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_IMG}
          data-testid="couronne-hero-video-el"
        >
          <source
            src="https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/cuar4red_XiaoYing_Video_1777617586081_HD.mp4"
            type="video/mp4"
          />
        </video>

        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />

        {/* Back link */}
        <Link
          to="/shop?category=rings&audience=gentlemens-club"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/55 text-[11px] tracking-[0.3em] hover:text-[#D4AF37] transition-colors"
          data-testid="couronne-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO RINGS</span>
        </Link>

        {/* Text */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center text-white px-6">
          <p
            className="text-[10px] tracking-[0.4em] font-sans uppercase mb-3 opacity-80"
            data-testid="couronne-eyebrow"
          >
            PHILEON
          </p>

          <h1
            className="font-serif text-5xl md:text-6xl leading-tight tracking-[-0.02em] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
            data-testid="couronne-title"
          >
            PRISE DE COURONNE
          </h1>

          <p
            className="text-[10px] md:text-[11px] tracking-[0.35em] uppercase opacity-55 mb-5"
            data-testid="couronne-translation"
          >
            Taking of the Crown
          </p>

          <p
            className="font-serif italic text-sm opacity-90"
            style={{ fontFamily: "'Playfair Display', serif" }}
            data-testid="couronne-tagline"
          >
            The crown was never given.
            <br />
            It was taken.
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <section className="w-full -mt-12 md:-mt-16 pt-4 md:pt-6" data-testid="couronne-gallery">
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

          {gallery.length > 1 && (
            <div className="flex gap-[5px] overflow-x-auto pb-1 scrollbar-hide">
              {gallery.map((item, index) => (
                <button
                  key={`t-${index}`}
                  onClick={() => handleSelect(index)}
                  data-testid={`couronne-thumb-${index}`}
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
          )}
        </div>
      </section>

      {/* PURCHASE BLOCK */}
      <section className="py-10 md:py-14">
        <div className="max-w-[560px] mx-auto px-5 md:px-8 space-y-6 text-white">
          <div>
            <h2
              className="font-serif text-3xl md:text-4xl tracking-wide"
              data-testid="couronne-purchase-title"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              PRISE DE COURONNE
            </h2>
            <p className="text-white/60 text-sm mt-1">Signature Ring</p>
          </div>

          <div>
            <label className="text-xs tracking-widest text-white/45">METAL</label>

            <div className="mt-3 space-y-3">
              {[
                { key: "signature",  label: "Signature",  note: "Most Popular" },
                { key: "foundation", label: "Foundation", note: null },
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
                    data-testid={`couronne-tier-${key}-btn`}
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

          <div>
            <label className="text-xs tracking-widest text-white/45">RING SIZE</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="mt-2 w-full border border-white/10 bg-black text-white p-4"
              data-testid="couronne-size-select"
            >
              <option value="">Select size</option>
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  Size {s}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/45 mt-2">Sizes above 12 are custom.</p>
            <p className="text-xs text-white/45 mt-1">
              Need help?{' '}
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                data-testid="couronne-size-guide-btn"
                className="underline hover:text-[#D4AF37] transition-colors"
              >
                View our size guide.
              </button>
            </p>
          </div>

          <div>
            <p className="text-xs tracking-widest text-white/45 mb-2">DETAILS</p>
            <p className="text-white/80 text-sm leading-relaxed">{product.specs}</p>
          </div>

          <button
            onClick={onAddToCart}
            disabled={isAdding || !selectedSize}
            data-testid="couronne-add-to-bag-btn"
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

      {/* COMPOSITION */}
      <section
        className="py-20 md:py-28 border-t border-white/[0.04]"
        data-testid="couronne-composition"
      >
        <div className="max-w-[520px] mx-auto px-5 md:px-8 text-center">
          <p className="text-[10px] tracking-[0.4em] text-white/45 mb-8">
            COMPOSITION
          </p>
          <ul
            className="space-y-2.5 text-[14px] leading-relaxed text-white/80"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <li>925 silver or 10K gold, with black enamel.</li>
            <li>Black enamel field.</li>
            <li>Black diamond pavé.</li>
            <li>Five bezel-set white diamond crown points.</li>
            <li>Micro-pavé white diamond crown body.</li>
            <li>Wide band.</li>
          </ul>
        </div>
      </section>

      {/* DETAIL */}
      <section
        className="py-20 md:py-28 border-t border-white/[0.04]"
        data-testid="couronne-detail"
      >
        <div className="max-w-[560px] mx-auto px-5 md:px-8 text-center">
          <p className="text-[10px] tracking-[0.4em] text-white/45 mb-8">
            DETAIL
          </p>
          <div
            className="space-y-7 font-serif italic text-[16px] md:text-[17px] leading-[1.8] text-white/75"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <p>A field of black holds the crown in white.</p>
            <p>
              The band is wide by design.
              <br />
              Commanding. Unignorable.
            </p>
            <p>
              The crown does not sit on top.
              <br />
              It breaks through.
            </p>
          </div>
        </div>
      </section>

      {/* CRAFT */}
      <section
        className="py-20 md:py-28 border-t border-white/[0.04]"
        data-testid="couronne-craft"
      >
        <div className="max-w-[560px] mx-auto px-5 md:px-8 text-center">
          <p className="text-[10px] tracking-[0.4em] text-white/45 mb-8">
            CRAFT
          </p>
          <div
            className="space-y-7 font-serif italic text-[16px] md:text-[17px] leading-[1.8] text-white/75"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <p>
              Black enamel sits beneath the stone field, giving the darkness
              depth no metal finish can replicate.
            </p>
            <p>
              Black pavé absorbs the light.
              <br />
              White diamonds return it.
            </p>
          </div>
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section
        className="py-20 md:py-28 border-t border-white/[0.04]"
        data-testid="couronne-specifications"
      >
        <div className="max-w-[760px] mx-auto px-5 md:px-8 text-center">
          <p className="text-[10px] tracking-[0.4em] text-white/45 mb-10">
            SPECIFICATIONS
          </p>
          <div className="w-full flex justify-center">
            <img
              src="/images/prise-de-couronne-specifications.png"
              alt="Prise de Couronne ring specifications diagram"
              className="w-full max-w-[720px] h-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* FINAL WORD */}
      <section
        className="py-24 md:py-32 border-t border-white/[0.04]"
        data-testid="couronne-final-word"
      >
        <div className="max-w-[520px] mx-auto px-5 md:px-8 text-center">
          <p className="text-[10px] tracking-[0.4em] text-white/45 mb-10">
            FINAL WORD
          </p>
          <div
            className="space-y-6 font-serif italic text-[17px] md:text-[19px] leading-[1.8] text-white/85"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <p>
              Some wear a crown.
              <br />
              Some take one.
            </p>
            <p>Prise de Couronne was made for the latter.</p>
          </div>
          <p className="text-[9px] tracking-[0.3em] text-white/35 mt-14">
            PRISE DE COURONNE — PHILEON
          </p>
        </div>
      </section>

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
