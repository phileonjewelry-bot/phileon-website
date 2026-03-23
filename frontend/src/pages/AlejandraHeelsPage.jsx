import React, { useState, useMemo, useEffect } from "react";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
} from "../components/ProductLayout";
import { useAddToCart } from "../hooks/useAddToCart";
import { Button } from "../components/ui/button";
import { products } from "../data/products";

export default function AlejandraHeelsPage() {
  const { isAdding, handleAddToCart: addWithAnimation, buttonText, buttonClass } = useAddToCart();

  // ========== METAL OPTIONS (7 variants) ==========
  const metalOptions = useMemo(() => [
    {
      id: 'silver',
      name: 'Silver',
      shortName: 'Silver',
      category: 'Silver',
      price: 1250,
      currency: 'CAD',
      swatchColor: '#C0C0C0', // Silver/neutral gray
      galleryIndex: 1, // Sterling Silver image
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/mbasaxj6_1000140441.jpg",
    },
    {
      id: 'white-10k',
      name: '10K White Gold',
      shortName: 'White 10K',
      category: '10K Gold',
      price: 2450,
      currency: 'CAD',
      swatchColor: '#F5F5F0', // White gold / soft champagne-white
      galleryIndex: 2, // White Gold image
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/q0cdb9tx_1000140440.jpg",
    },
    {
      id: 'rose-10k',
      name: '10K Rose Gold',
      shortName: 'Rose 10K',
      category: '10K Gold',
      price: 2450,
      currency: 'CAD',
      swatchColor: '#B76E79', // Rose gold
      galleryIndex: 4, // Rose Gold image
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/lghgq1oc_1000140403.jpg",
    },
    {
      id: 'yellow-10k',
      name: '10K Yellow Gold',
      shortName: 'Yellow 10K',
      category: '10K Gold',
      price: 2450,
      currency: 'CAD',
      swatchColor: '#D4AF37', // Yellow gold
      galleryIndex: 3, // Yellow Gold image
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ouebq651_1000140400.jpg",
    },
    {
      id: 'white-14k',
      name: '14K White Gold',
      shortName: 'White 14K',
      category: '14K Gold',
      price: 3250,
      currency: 'CAD',
      swatchColor: '#FAF9F6', // Slightly richer white tone
      galleryIndex: 2, // White Gold image
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/q0cdb9tx_1000140440.jpg",
    },
    {
      id: 'rose-14k',
      name: '14K Rose Gold',
      shortName: 'Rose 14K',
      category: '14K Gold',
      price: 3250,
      currency: 'CAD',
      swatchColor: '#C4756E', // Rose gold (slightly darker for 14K)
      galleryIndex: 4, // Rose Gold image
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/lghgq1oc_1000140403.jpg",
    },
    {
      id: 'yellow-14k',
      name: '14K Yellow Gold',
      shortName: 'Yellow 14K',
      category: '14K Gold',
      price: 3250,
      currency: 'CAD',
      swatchColor: '#CFB53B', // Yellow gold (slightly richer for 14K)
      galleryIndex: 3, // Yellow Gold image
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ouebq651_1000140400.jpg",
    },
  ], []);

  // State for selected metal (default: Silver)
  const [selectedMetalId, setSelectedMetalId] = useState('silver');
  
  // Get current selection
  const selectedMetal = metalOptions.find(m => m.id === selectedMetalId) || metalOptions[0];

  // Gallery items
  const galleryItems = useMemo(() => [
    {
      type: "video",
      src: "https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/7vzfuct9_phileon_video_web_compressed-2.mp4",
      alt: "Alejandra Heels Earrings - Product Video",
      objectFit: "contain",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/mbasaxj6_1000140441.jpg",
      alt: "Alejandra Heels Earrings - Sterling Silver",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/q0cdb9tx_1000140440.jpg",
      alt: "Alejandra Heels Earrings - White Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ouebq651_1000140400.jpg",
      alt: "Alejandra Heels Earrings - Yellow Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/lghgq1oc_1000140403.jpg",
      alt: "Alejandra Heels Earrings - Rose Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/cvvwbdch_1000140396.jpg",
      alt: "Alejandra Heels Earrings - Rose Gold Detail with Diamonds",
    },
  ], []);

  // Preload hero images for instant switching
  useEffect(() => {
    const preloadImages = metalOptions.map(m => m.heroImage).filter(Boolean);
    const uniqueImages = [...new Set(preloadImages)];
    
    uniqueImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [metalOptions]);

  // Format price
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    addWithAnimation({
      id: `alejandra-heels-${selectedMetal.id}`,
      name: 'Alejandra Heels Earrings',
      slug: 'alejandra-heels',
      price: selectedMetal.price,
      image: selectedMetal.heroImage,
      images: [selectedMetal.heroImage],
      materials: [selectedMetal.name]
    }, 1, selectedMetal.name);
  };

  // Group metals by category for display
  const silverOptions = metalOptions.filter(m => m.category === 'Silver');
  const gold10kOptions = metalOptions.filter(m => m.category === '10K Gold');
  const gold14kOptions = metalOptions.filter(m => m.category === '14K Gold');

  return (
    <div className="min-h-screen bg-black text-white">
      <ProductLayout
        gallery={<ProductGallery items={galleryItems} initialSlide={selectedMetal.galleryIndex} key={selectedMetal.id} />}
        purchasePanel={
          <>
            <ProductInfoSection
              titleTag="Statement Earrings"
              title="Alejandra Heels Earrings"
            >
              <p className="text-white/60 leading-relaxed">
                {products.alejandraHeels?.description || "Sculptural heel-inspired earrings that command attention with every step."}
              </p>

              <p className="text-[#C7A24B] text-lg font-light leading-relaxed mt-4">
                {products.alejandraHeels?.tagline || "Walk in elegance. Dance in light."}
              </p>
            </ProductInfoSection>

            <ProductInfoSection
              titleTag="Select Metal"
              title="Choose your finish"
            >
              {/* Price Display */}
              <div className="mb-6">
                <p className="text-3xl font-light text-[#C7A24B]" data-testid="product-price">
                  {formatPrice(selectedMetal.price, selectedMetal.currency)}
                </p>
              </div>

              {/* Visual Swatch Selector */}
              <div className="space-y-6" data-testid="swatch-selector">
                {/* Silver Group */}
                <div className="swatch-group">
                  <p className="text-[10px] tracking-[0.25em] text-white/40 uppercase mb-3">
                    Silver
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {silverOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedMetalId(option.id)}
                        className={`swatch-button ${selectedMetalId === option.id ? 'selected' : ''}`}
                        data-testid={`swatch-${option.id}`}
                        title={option.name}
                        aria-label={option.name}
                      >
                        <span 
                          className="swatch-color"
                          style={{ backgroundColor: option.swatchColor }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 10K Gold Group */}
                <div className="swatch-group">
                  <p className="text-[10px] tracking-[0.25em] text-white/40 uppercase mb-3">
                    10K Gold
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {gold10kOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedMetalId(option.id)}
                        className={`swatch-button ${selectedMetalId === option.id ? 'selected' : ''}`}
                        data-testid={`swatch-${option.id}`}
                        title={option.name}
                        aria-label={option.name}
                      >
                        <span 
                          className="swatch-color"
                          style={{ backgroundColor: option.swatchColor }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 14K Gold Group */}
                <div className="swatch-group">
                  <p className="text-[10px] tracking-[0.25em] text-white/40 uppercase mb-3">
                    14K Gold
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {gold14kOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedMetalId(option.id)}
                        className={`swatch-button ${selectedMetalId === option.id ? 'selected' : ''}`}
                        data-testid={`swatch-${option.id}`}
                        title={option.name}
                        aria-label={option.name}
                      >
                        <span 
                          className="swatch-color"
                          style={{ backgroundColor: option.swatchColor }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Metal Label */}
              <p className="mt-6 text-sm text-[#C7A24B] tracking-wide" data-testid="selected-metal-label">
                {selectedMetal.name}
              </p>
            </ProductInfoSection>

            {/* Add to Cart Button */}
            <div className="mt-8">
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`w-full bg-[#C7A24B] hover:bg-[#B8944A] text-black font-semibold py-6 rounded-sm tracking-wide transition-all duration-300 ${isAdding ? 'bg-green-600 hover:bg-green-600' : ''}`}
                data-testid="add-to-cart-button"
              >
                {buttonText}
              </Button>
            </div>
          </>
        }
        stickyOffset={36}
      />

      <style>{`
        /* Swatch Button Styles */
        .swatch-button {
          width: 44px;
          height: 44px;
          padding: 3px;
          background: transparent;
          border: 2px solid transparent;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .swatch-button:hover {
          border-color: rgba(199, 162, 75, 0.4);
        }

        .swatch-button.selected {
          border-color: #C7A24B;
        }

        .swatch-color {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: block;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(255, 255, 255, 0.1);
        }

        /* Mobile Centering */
        @media (max-width: 768px) {
          .swatch-group {
            text-align: center;
          }
          
          .swatch-group > div {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
