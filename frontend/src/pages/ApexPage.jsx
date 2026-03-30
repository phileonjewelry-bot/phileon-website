import React, { useState } from "react";
import { useAddToCart } from "../hooks/useAddToCart";
import { products } from "@/data/products";

/* ═══════════════════════════════════════════════════════════════
   APEX — Pyramid Earrings
   Egypt to Santorini. Places turned into pieces.
═══════════════════════════════════════════════════════════════ */

const ApexPage = () => {
  const [selectedTier, setSelectedTier] = useState("signature"); // Default to Signature (Silver)
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Get product data from products.js
  const apexProduct = products.apex;
  const pricing = apexProduct.pricing;
  const tierData = apexProduct.tiers;
  const specs = apexProduct.specs;

  const tiers = {
    signature: {
      ...tierData.signature,
      price: pricing.signature
    },
    foundation: {
      ...tierData.foundation,
      price: pricing.foundation
    },
    core: {
      ...tierData.core,
      price: pricing.core
    },
    heirloom: {
      ...tierData.heirloom,
      price: pricing.heirloom
    }
  };

  const currentTier = tiers[selectedTier];

  // Gallery images
  const media = [
    {
      src: apexProduct.imageUrl,
      alt: "APEX front-facing pair"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/7dyoz6wc_1000144038.png",
      alt: "APEX front view with reflection"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/4r7cqq3k_1000144050.webp",
      alt: "APEX side profile showing clasp"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/l4z0j4ao_1000144099.png",
      alt: "APEX back view showing setting"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/oqqz6xdt_1000144049.webp",
      alt: "APEX in-hand detail"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/j2xta4cw_1000144044.png",
      alt: "APEX macro diamond detail"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/b2ms8zjn_1000144043.png",
      alt: "APEX macro sapphire center"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/sqpchza1_1000144042.png",
      alt: "APEX macro pavé angle"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/xy782uqf_1000144048.webp",
      alt: "APEX flat lay with reflection"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/zoc5rl6c_3529fadd-d014-4602-99f9-c9d9bc433022-1_all_63914.jpg",
      alt: "APEX on model front"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/oakwivwy_1000144055.png",
      alt: "APEX on model side profile"
    }
  ];

  const [activeImage, setActiveImage] = useState(0);

  const onAddToCart = () => {
    handleAddToCart({
      id: `apex-${selectedTier}`,
      name: `APEX — ${currentTier.name}`,
      price: currentTier.price,
      metal: currentTier.metal,
      image: media[0].src,
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-phileon-ivory">
      {/* Main Product Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          
          {/* LEFT - IMAGE */}
          <div className="w-full">
            <img
              src={media[activeImage].src}
              alt={media[activeImage].alt}
              className="w-full h-auto object-contain"
            />
            
            {/* Thumbnail row (when more images available) */}
            {media.length > 1 && (
              <div className="flex gap-3 mt-6">
                {media.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-sm transition-all ${
                      activeImage === index
                        ? "ring-2 ring-[#C6A25D]"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - INFO */}
          <div className="flex flex-col gap-6">

            {/* Header */}
            <div>
              <p className="text-xs tracking-[0.3em] text-neutral-400">
                {apexProduct.subtitle}
              </p>

              <h1 className="text-4xl md:text-5xl font-light tracking-wide mt-2">
                APEX
              </h1>
            </div>

            {/* Story */}
            <div className="text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>From Egypt to Santorini.</p>
              <p>Places turned into pieces.</p>
              <p>I stood at the pyramids in Egypt.</p>
              <p>And swam in the ocean in Santorini.</p>
              <p>Both stayed with me.</p>
              <p>So I designed this.</p>
            </div>

            {/* Price Display */}
            <div className="mt-4">
              <p className="text-3xl md:text-4xl font-light tracking-wide">
                ${currentTier.price.toLocaleString()}
                <span className="text-lg text-neutral-500 ml-2">CAD</span>
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {currentTier.metal} — {currentTier.stones}
              </p>
              <p className="text-xs text-neutral-500 mt-3">
                Made to order<br />
                Ships in 3–4 weeks
              </p>
            </div>

            {/* Tier Selection */}
            <div className="mt-6">
              <p className="text-xs tracking-[0.2em] text-neutral-500 mb-4 uppercase">
                Select Tier
              </p>
              
              <div className="space-y-3">
                {Object.entries(tiers).map(([key, tier]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    className={`w-full text-left p-4 rounded-sm border transition-all ${
                      selectedTier === key
                        ? "border-[#C6A25D] bg-[#C6A25D]/10"
                        : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">{tier.name}</span>
                        {tier.badge && (
                          <span className="ml-2 text-[10px] tracking-wider text-[#C6A25D] uppercase">
                            {tier.badge}
                          </span>
                        )}
                        <p className="text-xs text-neutral-500 mt-1">{tier.metal}</p>
                      </div>
                      <span className="text-sm">
                        ${tier.price.toLocaleString()}
                        {key === 'heirloom' && '+'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={onAddToCart}
              disabled={isAdding}
              className="mt-6 w-full py-4 bg-[#C6A25D] hover:bg-[#B8944F] text-black font-medium tracking-wider uppercase text-sm transition-all disabled:opacity-50"
            >
              {buttonText}
            </button>
            
            <p className="text-xs text-neutral-500 text-center mt-3 tracking-wide">
              Crafted with precision. Worn with intent.
            </p>

            {/* Specs */}
            <div className="mt-8 pt-8 border-t border-neutral-800">
              <p className="text-xs tracking-[0.2em] text-neutral-500 mb-4 uppercase">
                Specifications
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Weight</p>
                  <p className="text-neutral-300">{specs.weight}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Dimensions</p>
                  <p className="text-neutral-300">{specs.dimensions}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-neutral-500">Diamonds</p>
                  <p className="text-neutral-300">{specs.diamonds}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-neutral-500">Sapphires</p>
                  <p className="text-neutral-300">{specs.sapphires}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Finish</p>
                  <p className="text-neutral-300">{specs.finish}</p>
                </div>
              </div>
            </div>

            {/* Shipping note */}
            <p className="text-xs text-neutral-500 mt-6">
              Complimentary insured shipping within Canada.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApexPage;
