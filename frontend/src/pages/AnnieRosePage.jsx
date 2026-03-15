import React, { useState } from "react";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
  ProductActions,
} from "../components/ProductLayout";
import { useAddToCart } from "../hooks/useAddToCart";
import { Button } from "../components/ui/button";
import { products } from "../data/products";

export default function AnnieRosePage() {
  const { isAdding, handleAddToCart: addWithAnimation, buttonText, buttonClass } = useAddToCart();
  
  // Metal options
  const metalOptions = [
    { name: "10K Gold", label: "10K", key: "gold10k" },
    { name: "14K Gold", label: "14K", key: "gold14k" },
    { name: "18K Gold", label: "18K", key: "gold18k" },
  ];

  // Stone options from products.js
  const stoneOptions = [
    { name: "Lab-Grown Diamonds", label: "Lab", key: "lab" },
    { name: "Natural Diamonds", label: "Natural", key: "natural" },
  ];
  
  // State for selections (default to first options)
  const [selectedMetal, setSelectedMetal] = useState(metalOptions[0]);
  const [selectedStone, setSelectedStone] = useState(stoneOptions[0]);

  // Calculate price based on both selections
  const currentPrice = products.annieRose.pricing[selectedStone.key][selectedMetal.key];

  // Handle add to cart with micro-interaction
  const handleAddToCart = () => {
    addWithAnimation({
      id: "annie-rose",
      name: `${products.annieRose.name} - ${selectedMetal.name}`,
      slug: "annie-rose",
      price: currentPrice,
      image: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg",
      images: ["https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg"],
      materials: [selectedMetal.name, selectedStone.name]
    }, 1, `${selectedMetal.name} / ${selectedStone.name}`);
  };

  // Gallery media items - memoized to prevent recreation
  const galleryItems = React.useMemo(() => [
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg",
      alt: "Annie Rose Ring",
    },
    {
      type: "video",
      src: "https://customer-assets.emergentagent.com/job_phileon-jewelry/artifacts/ppw8w9p8_AnnieRosevid1-1.mp4",
      poster: "/images/thumbnails/annierose1-thumb.jpg",
      alt: "Annie Rose video 1",
    },
    {
      type: "video",
      src: "https://customer-assets.emergentagent.com/job_phileon-jewelry/artifacts/2ad9rttz_AnnieRosevid2.mp4",
      poster: "/images/thumbnails/annierose2-thumb.jpg",
      alt: "Annie Rose video 2",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/0yvpka9u_1000139046.png",
      alt: "Annie Rose studio detail",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/fw381q3d_1000139289.png",
      alt: "Annie Rose proposal moment",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/1sukhrao_1000139284.png",
      alt: "Annie Rose on hand",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/kvn5m3ac_1000139303.jpg",
      alt: "Annie Rose close-up",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/urhdvrly_1000139305.jpg",
      alt: "Annie Rose in presentation box",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/g2ufvk37_1000139307.jpg",
      alt: "Annie Rose at evening event",
    },
  ], []);

  return (
    <div className="bg-black text-white min-h-screen" data-testid="annie-rose-page">
      {/* Hero Section */}
      <section className="relative">
        <img
          src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg"
          alt="Annie Rose Ring"
          className="w-full h-[50vh] md:h-[65vh] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
            Featured Drop
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-light tracking-wide">
            ANNIE ROSE
          </h1>
        </div>
      </section>

      {/* Product Layout with Gallery + Info */}
      <ProductLayout
        gallery={<ProductGallery items={galleryItems} />}
        productInfo={
          <>
            <ProductInfoSection
              titleTag="Featured Drop"
              title={products.annieRose.name}
            >
              <p className="text-white/60 leading-relaxed">
                {products.annieRose.tribute}
              </p>

              <p className="text-[#C6A24A] text-lg font-light leading-relaxed mt-4">
                {products.annieRose.tagline}
              </p>

              <p className="mt-6 text-[#C6A24A] text-sm tracking-[0.4em] uppercase">
                #GetYourPhileon
              </p>
            </ProductInfoSection>
          </>
        }
        purchasePanel={
          <>
            <ProductInfoSection
              titleTag="Available Options"
              title="Configure your ring"
            >
              <p className="text-white/60 text-sm leading-relaxed mt-2">
                Choose your metal and diamond type. Each combination is crafted to preserve the {products.annieRose.name} design.
              </p>

              {/* Metal Selector */}
              <div className="mt-6">
                <p className="text-white/70 text-sm tracking-wide mb-3">Step 1: Choose your metal</p>
                <div className="grid grid-cols-3 gap-3 text-sm text-white/70">
                  {metalOptions.map((metal) => (
                    <button
                      key={metal.name}
                      onClick={() => setSelectedMetal(metal)}
                      className={[
                        "rounded-xl border p-4 text-center transition-all cursor-pointer",
                        selectedMetal.name === metal.name
                          ? "border-[#C6A24A]/70 bg-[#C6A24A]/10"
                          : "border-white/10 bg-white/5 hover:border-white/30",
                      ].join(" ")}
                    >
                      <p className="text-white/50 text-xs tracking-[0.35em] uppercase">{metal.label}</p>
                      <p className="mt-2 text-white text-base font-light">{metal.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stone Type Selector */}
              <div className="mt-6">
                <p className="text-white/70 text-sm tracking-wide mb-3">Step 2: Choose your diamond type</p>
                <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
                  {stoneOptions.map((stone) => (
                    <button
                      key={stone.name}
                      onClick={() => setSelectedStone(stone)}
                      className={[
                        "rounded-xl border p-4 text-center transition-all cursor-pointer",
                        selectedStone.name === stone.name
                          ? "border-[#C6A24A]/70 bg-[#C6A24A]/10"
                          : "border-white/10 bg-white/5 hover:border-white/30",
                      ].join(" ")}
                    >
                      <p className="text-white/50 text-xs tracking-[0.35em] uppercase">{stone.label}</p>
                      <p className="mt-2 text-white text-base font-light">{stone.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Display */}
              <div className="mt-6 rounded-xl border border-[#C6A24A]/30 bg-[#C6A24A]/5 p-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Your Configuration</p>
                    <p className="mt-1 text-white/80 text-sm">{selectedMetal.name} · {selectedStone.name}</p>
                  </div>
                  <p className="text-2xl font-light text-[#C6A24A]">${currentPrice.toLocaleString()}</p>
                </div>
              </div>
            </ProductInfoSection>

            <div className="mt-6">
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`w-full text-black font-semibold py-6 rounded-md tracking-wide ${buttonClass}`}
                data-testid="add-to-cart-button"
              >
                {buttonText}
              </Button>
            </div>
          </>
        }
        stickyOffset={36}
      />
    </div>
  );
}
