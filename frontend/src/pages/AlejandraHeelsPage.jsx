import React, { useState } from "react";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
} from "../components/ProductLayout";
import { useCart } from "../contexts/CartContext";
import { Button } from "../components/ui/button";
import { products } from "../data/products";

export default function AlejandraHeelsPage() {
  const { addToCart } = useCart();
  
  // Metal color to gradient swatch mapping
  const metalSwatchGradients = {
    Silver: "linear-gradient(135deg, #d9d9d9 0%, #9f9f9f 100%)",
    White: "linear-gradient(135deg, #f5f5f5 0%, #cfcfcf 100%)",
    Yellow: "linear-gradient(135deg, #f0d36a 0%, #b88918 100%)",
    Rose: "linear-gradient(135deg, #e6b1a7 0%, #b76e79 100%)"
  };

  // Metal color to gallery index mapping (video is index 0, images start at 1)
  const metalGalleryIndex = {
    Silver: 1,
    White: 2,
    Yellow: 3,
    Rose: 4
  };

  // Configuration options
  const metalOptions = {
    silver: [
      { name: "Sterling Silver", key: "silver", color: "Silver", price: products.alejandraHeels.pricing.silver.cubic }
    ],
    plated: [
      { name: "Yellow Gold Plated Silver", key: "platedYellow", color: "Yellow", price: products.alejandraHeels.pricing.plated.yellowCubic },
      { name: "Rose Gold Plated Silver", key: "platedRose", color: "Rose", price: products.alejandraHeels.pricing.plated.roseCubic }
    ],
    solid10k: [
      { name: "10K White Gold", key: "solid10kWhite", color: "White", price: products.alejandraHeels.pricing.solid10k.whiteLab },
      { name: "10K Yellow Gold", key: "solid10kYellow", color: "Yellow", price: products.alejandraHeels.pricing.solid10k.yellowLab },
      { name: "10K Rose Gold", key: "solid10kRose", color: "Rose", price: products.alejandraHeels.pricing.solid10k.roseLab }
    ],
    solid14k: [
      { name: "14K White Gold", key: "solid14kWhite", color: "White", price: products.alejandraHeels.pricing.solid14k.whiteLab },
      { name: "14K Yellow Gold", key: "solid14kYellow", color: "Yellow", price: products.alejandraHeels.pricing.solid14k.yellowLab },
      { name: "14K Rose Gold", key: "solid14kRose", color: "Rose", price: products.alejandraHeels.pricing.solid14k.roseLab }
    ]
  };

  const stoneOptions = [
    { name: "Cubic Zirconia", label: "Cubic", key: "cubic", tiers: ["silver", "plated"] },
    { name: "Lab Diamonds", label: "Lab Diamonds", key: "lab", tiers: ["solid10k", "solid14k"] }
  ];

  // State
  const [selectedStone, setSelectedStone] = useState(stoneOptions[0]); // Default: Cubic
  const [selectedTier, setSelectedTier] = useState("silver"); // Default tier for Cubic
  const [selectedMetal, setSelectedMetal] = useState(metalOptions.silver[0]); // Default: Sterling Silver
  const [currentSlide, setCurrentSlide] = useState(1); // Track current gallery slide (start at 1, silver image)

  // Calculate current price
  const currentPrice = selectedMetal.price;

  // Handle stone type change
  const handleStoneChange = (stone) => {
    setSelectedStone(stone);
    // Switch to appropriate tier
    const defaultTier = stone.tiers[0];
    setSelectedTier(defaultTier);
    const newMetal = metalOptions[defaultTier][0];
    setSelectedMetal(newMetal);
    // Switch to corresponding gallery image
    const galleryIndex = metalGalleryIndex[newMetal.color];
    setCurrentSlide(galleryIndex);
  };

  // Handle tier change (for solid gold: 10K vs 14K)
  const handleTierChange = (tier) => {
    setSelectedTier(tier);
    const newMetal = metalOptions[tier][0];
    setSelectedMetal(newMetal);
    // Switch to corresponding gallery image
    const galleryIndex = metalGalleryIndex[newMetal.color];
    setCurrentSlide(galleryIndex);
  };

  // Handle metal change within tier
  const handleMetalChange = (metal) => {
    setSelectedMetal(metal);
    // Switch to corresponding gallery image
    const galleryIndex = metalGalleryIndex[metal.color];
    setCurrentSlide(galleryIndex);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const product = {
      id: "alejandra-heels",
      name: products.alejandraHeels.name,
      slug: "alejandra-heels",
      price: currentPrice,
      image: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ctwrb3no_1000140403.jpg",
      images: ["https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ctwrb3no_1000140403.jpg"],
      materials: [selectedMetal.name, selectedStone.name]
    };

    const variant = {
      metal: selectedMetal.name,
      stone: selectedStone.name
    };

    addToCart(product, 1, variant);
  };

  // Gallery items
  const galleryItems = React.useMemo(() => [
    {
      type: "video",
      src: "https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/7vzfuct9_phileon_video_web_compressed-2.mp4",
      alt: "Alejandra Heels - Product Video",
      objectFit: "contain", // Use contain to show full product without cropping
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/mbasaxj6_1000140441.jpg",
      alt: "Alejandra Heels - Sterling Silver",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/q0cdb9tx_1000140440.jpg",
      alt: "Alejandra Heels - White Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ouebq651_1000140400.jpg",
      alt: "Alejandra Heels - Yellow Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/lghgq1oc_1000140403.jpg",
      alt: "Alejandra Heels - Rose Gold",
    },
  ], []);

  return (
    <div className="min-h-screen bg-black text-white">
      <ProductLayout
        gallery={<ProductGallery items={galleryItems} initialSlide={currentSlide} />}
        purchasePanel={
          <>
            <ProductInfoSection
              titleTag="Heel Earrings"
              title={products.alejandraHeels.name}
            >
              <p className="text-white/60 leading-relaxed">
                {products.alejandraHeels.description}
              </p>

              <p className="text-[#C6A24A] text-lg font-light leading-relaxed mt-4">
                {products.alejandraHeels.tagline}
              </p>
            </ProductInfoSection>

            <ProductInfoSection
              titleTag="Available Options"
              title="Configure your earrings"
            >
              <p className="text-white/60 text-sm leading-relaxed mt-2">
                Choose your stone type, then select your metal finish.
              </p>

              {/* Stone Type Selector */}
              <div className="mt-6">
                <p className="text-white/70 text-sm tracking-wide mb-3">Step 1: Choose your stone type</p>
                <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
                  {stoneOptions.map((stone) => (
                    <button
                      key={stone.key}
                      onClick={() => handleStoneChange(stone)}
                      className={[
                        "rounded-xl border p-4 text-center transition-all cursor-pointer",
                        selectedStone.key === stone.key
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

              {/* Karat Selector (for Solid Gold only) */}
              {selectedStone.key === "lab" && (
                <div className="mt-6">
                  <p className="text-white/70 text-sm tracking-wide mb-3">Step 2: Choose your gold karat</p>
                  <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
                    <button
                      onClick={() => handleTierChange("solid10k")}
                      className={[
                        "rounded-xl border p-4 text-center transition-all cursor-pointer",
                        selectedTier === "solid10k"
                          ? "border-[#C6A24A]/70 bg-[#C6A24A]/10"
                          : "border-white/10 bg-white/5 hover:border-white/30",
                      ].join(" ")}
                    >
                      <p className="text-white/50 text-xs tracking-[0.35em] uppercase">10 Karat</p>
                      <p className="mt-2 text-white text-base font-light">10K Gold</p>
                    </button>
                    <button
                      onClick={() => handleTierChange("solid14k")}
                      className={[
                        "rounded-xl border p-4 text-center transition-all cursor-pointer",
                        selectedTier === "solid14k"
                          ? "border-[#C6A24A]/70 bg-[#C6A24A]/10"
                          : "border-white/10 bg-white/5 hover:border-white/30",
                      ].join(" ")}
                    >
                      <p className="text-white/50 text-xs tracking-[0.35em] uppercase">14 Karat</p>
                      <p className="mt-2 text-white text-base font-light">14K Gold</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Metal Color Selector with Swatches */}
              <div className="mt-6">
                <p className="text-white/70 text-sm tracking-wide mb-4">
                  {selectedStone.key === "lab" ? "Step 3: Choose your gold color" : "Step 2: Choose your finish"}
                </p>
                
                {/* Circular Metal Swatches */}
                <div className="flex flex-wrap gap-4">
                  {metalOptions[selectedTier].map((metal) => (
                    <button
                      key={metal.key}
                      onClick={() => handleMetalChange(metal)}
                      className="flex flex-col items-center gap-2 group"
                      data-testid={`metal-swatch-${metal.color.toLowerCase()}`}
                    >
                      {/* Circular Gradient Swatch */}
                      <div
                        className={[
                          "w-7 h-7 rounded-full border-2 transition-all duration-300",
                          selectedMetal.key === metal.key
                            ? "border-[#C6A24A] scale-110 shadow-lg shadow-[#C6A24A]/40"
                            : "border-white/30 group-hover:border-white/50 group-hover:scale-105",
                        ].join(" ")}
                        style={{ 
                          background: metalSwatchGradients[metal.color],
                        }}
                      />
                      {/* Label */}
                      <span className={[
                        "text-xs tracking-wider transition-colors duration-300 text-center",
                        selectedMetal.key === metal.key
                          ? "text-[#C6A24A] font-medium"
                          : "text-white/60 group-hover:text-white/80"
                      ].join(" ")}>
                        {metal.color}
                      </span>
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
                className="w-full bg-[#C6A24A] hover:bg-[#B8944A] text-black font-semibold py-6 rounded-md tracking-wide"
                data-testid="add-to-cart-button"
              >
                ADD TO CART
              </Button>
            </div>
          </>
        }
        stickyOffset={36}
      />
    </div>
  );
}
