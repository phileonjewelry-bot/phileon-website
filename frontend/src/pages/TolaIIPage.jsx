import React, { useEffect, useRef, useState } from "react";
import { useAddToCart } from '../hooks/useAddToCart';

export default function TolaIIPage() {
  const videoRef = useRef(null);
  const [selectedTier, setSelectedTier] = useState("signature");
  const [selectedSize, setSelectedSize] = useState(null);
  const [customSize, setCustomSize] = useState("");
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const tiers = {
    foundation: {
      name: "Foundation",
      metal: "10K Yellow Gold",
      price: 5200,
      badge: "",
      description: "10K yellow gold with black synthetic stones. Built for everyday presence."
    },
    signature: {
      name: "Signature",
      metal: "14K Yellow Gold",
      price: 6800,
      badge: "MOST POPULAR",
      description: "14K yellow gold with black lab-grown diamonds. Balanced weight and clarity."
    },
    heirloom: {
      name: "Heirloom",
      metal: "18K Yellow Gold",
      price: 9200,
      badge: "COLLECTOR",
      description: "18K yellow gold with natural black diamonds. Maximum richness and permanence."
    }
  };

  const media = [
    { 
      type: "video", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/29wd5jby_XiaoYing_Video_1774562301628.mp4", 
      poster: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png", 
      alt: "TOLA II hero" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/sm6c4t2r_1000143432.png", 
      alt: "TOLA II front" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/ipu9le7o_1000141790.png", 
      alt: "TOLA II side profile" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/m0g80wsc_1000143416.png", 
      alt: "TOLA II detail" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/1ta12tya_1000143385.png", 
      alt: "TOLA II lifestyle" 
    }
  ];

  const [activeMedia, setActiveMedia] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener("ended", handleEnded);

    const tryPlay = async () => {
      try {
        await video.play();
      } catch (err) {
        console.log("Autoplay blocked:", err);
      }
    };

    tryPlay();

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [activeMedia]);

  const isSizeValid =
    selectedSize &&
    (selectedSize !== "custom" || (customSize && customSize.trim().length > 0));

  const currentTier = tiers[selectedTier];

  // Handle add to cart
  const onAddToCart = () => {
    const sizeLabel = selectedSize === "custom" ? `Custom: ${customSize}` : `Size ${selectedSize}`;
    handleAddToCart({
      id: `tola-ii-${selectedTier}-${selectedSize === "custom" ? customSize : selectedSize}`,
      name: 'TOLA II',
      image: media[1].src,
      price: currentTier.price,
      slug: 'tola-ii',
      materials: [currentTier.metal],
      size: sizeLabel
    }, 1, `${currentTier.name} · ${currentTier.metal} · ${sizeLabel}`);
  };

  return (
    <div className="bg-black text-white min-h-screen" data-testid="tola-ii-page">
      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
        {/* LEFT SIDE */}
        <div>
          {/* HERO MEDIA */}
          <div className="w-full overflow-hidden rounded-2xl bg-black border border-[#1f1f1f]">
            {media[activeMedia].type === "video" ? (
              <video
                ref={videoRef}
                src={media[activeMedia].src}
                poster={media[activeMedia].poster}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onEnded={(e) => {
                  e.currentTarget.currentTime = 0;
                  e.currentTarget.play();
                }}
                className="w-full h-[500px] lg:h-[650px] object-cover"
              />
            ) : (
              <img
                src={media[activeMedia].src}
                alt={media[activeMedia].alt}
                className="w-full h-[500px] lg:h-[650px] object-cover"
              />
            )}
          </div>

          {/* THUMBNAILS */}
          <div className="grid grid-cols-6 gap-2 mt-4">
            {media.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveMedia(index)}
                className={`relative overflow-hidden rounded-lg border transition-all ${
                  activeMedia === index
                    ? "border-[#C6A25D]"
                    : "border-[#2a2a2a] hover:border-[#4a4a4a]"
                }`}
                data-testid={`thumbnail-${index}`}
              >
                {item.type === "video" ? (
                  <div className="relative">
                    <img
                      src={item.poster}
                      alt="TOLA II video thumbnail"
                      className="w-full h-16 lg:h-20 object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-black/70 flex items-center justify-center text-white text-xs lg:text-sm">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-16 lg:h-20 object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:sticky lg:top-24 self-start">
          <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-4">
            The TOLA Collection
          </p>

          <h1 className="text-4xl lg:text-5xl font-serif mb-3">TOLA II</h1>
          <p className="text-[#a0a0a0] italic text-lg lg:text-xl mb-6">
            Weight. Discipline. Presence.
          </p>

          <div className="text-[#C6A25D] text-4xl lg:text-5xl mb-3" data-testid="current-price">
            ${currentTier.price.toLocaleString()}
          </div>

          <p className="text-sm text-[#b5b5b5] mb-8 leading-relaxed">
            {currentTier.metal} with{" "}
            {selectedTier === "foundation"
              ? "black synthetic stones"
              : selectedTier === "signature"
              ? "black lab-grown diamonds"
              : "natural black diamonds"}
            .<br />
            {selectedTier === "foundation"
              ? "Built for everyday presence."
              : selectedTier === "signature"
              ? "Engineered for balance. Built for presence."
              : "Maximum richness. Built for permanence."}
          </p>

          {/* TIER SELECTION */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-3">
              Select Tier
            </p>

            <div className="space-y-3">
              {Object.entries(tiers).map(([key, tier]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  className={`w-full text-left rounded-xl border p-4 lg:p-5 transition-all ${
                    selectedTier === key
                      ? "border-[#C6A25D] bg-[#C6A25D]/10"
                      : "border-[#2a2a2a] bg-black hover:border-[#4a4a4a]"
                  }`}
                  data-testid={`tier-${key}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-xl lg:text-2xl font-medium">{tier.name}</div>
                      <div className="text-sm text-[#9d9d9d] mt-1">
                        {tier.metal}
                      </div>
                      <div className="text-[#C6A25D] text-2xl lg:text-3xl mt-3">
                        ${tier.price.toLocaleString()}
                      </div>
                    </div>

                    {tier.badge && (
                      <div className="text-[10px] lg:text-[11px] tracking-[0.2em] px-2 lg:px-3 py-1.5 lg:py-2 rounded-md bg-[#C6A25D] text-black font-semibold whitespace-nowrap">
                        {tier.badge}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SIZE SELECTION */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-3">
              Select Size
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 rounded-lg border text-sm transition-all duration-200 ${
                    selectedSize === size
                      ? "border-[#C6A25D] bg-[#C6A25D]/10 text-white"
                      : "border-[#2a2a2a] text-[#d0d0d0] hover:border-[#C6A25D]"
                  }`}
                  data-testid={`size-${size}`}
                >
                  {size}
                </button>
              ))}

              <button
                onClick={() => setSelectedSize("custom")}
                className={`col-span-4 py-3 rounded-lg border text-sm tracking-[0.15em] transition-all duration-200 ${
                  selectedSize === "custom"
                    ? "border-[#C6A25D] bg-[#C6A25D]/10 text-white"
                    : "border-[#2a2a2a] text-[#d0d0d0] hover:border-[#C6A25D]"
                }`}
                data-testid="size-custom"
              >
                CUSTOM SIZE
              </button>
            </div>

            {selectedSize === "custom" && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter your ring size (e.g. 13, 14.5)"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="w-full p-3 bg-black border border-[#2a2a2a] rounded-lg text-white text-sm focus:border-[#C6A25D] outline-none transition-colors"
                  data-testid="custom-size-input"
                />
                <p className="text-xs text-[#7f7f7f] mt-2">
                  Sizes above 12 are custom made and may require additional production time.
                </p>
              </div>
            )}

            {selectedSize && selectedSize !== "custom" && (
              <p className="text-xs text-[#7f7f7f] mt-3">
                Between sizes? Choose the half size for a more precise fit.
              </p>
            )}
          </div>

          {/* ADD TO CART */}
          <button
            disabled={!isSizeValid || isAdding}
            onClick={onAddToCart}
            className={`w-full py-4 rounded-xl tracking-[0.25em] text-sm font-semibold transition-all ${
              isSizeValid && !isAdding
                ? "bg-[#C6A25D] text-black hover:bg-[#b8944f]"
                : "bg-[#3a3a3a] text-[#8a8a8a] cursor-not-allowed"
            } ${isAdding ? "bg-green-600 text-white" : ""}`}
            data-testid="add-to-cart-button"
          >
            {isAdding ? buttonText : (isSizeValid ? "ADD TO CART" : "SELECT A SIZE")}
          </button>

          <p className="text-center text-sm text-[#7f7f7f] mt-4">
            Complimentary insured shipping within Canada
          </p>

          {/* STORY */}
          <div className="mt-14">
            <h2 className="text-2xl lg:text-3xl font-serif text-[#C6A25D] mb-6">
              The TOLA II Story
            </h2>
            <p className="text-[#d2d2d2] leading-7 lg:leading-8 text-base lg:text-lg">
              TOLA II is built on restraint and control. A structured gold form,
              anchored by a central chain and framed with precision-set black stones.
              Every surface is intentional. Every detail holds weight.
            </p>
          </div>

          {/* SPECIFICATIONS */}
          <div className="mt-14 pb-16">
            <h2 className="text-2xl lg:text-3xl font-serif text-[#C6A25D] mb-6">
              Specifications
            </h2>
            <ul className="space-y-4 lg:space-y-5 text-[#d2d2d2] text-sm lg:text-base">
              <li>— Approx. top width: 12–13mm</li>
              <li>— Approx. band width: 3–4mm</li>
              <li>— Structured pavé setting</li>
              <li>— High polish finish</li>
              <li>— Engineered gold weight for balance and presence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
