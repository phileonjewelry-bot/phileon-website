import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
} from "../components/ProductLayout";
import { Button } from "../components/ui/button";
import { products } from "../data/products";
import { useCart } from "../contexts/CartContext";

export default function RosariaPage() {
  const product = products.rosaria;
  const { addItem } = useCart();
  
  // State for selected material - default to 14K Rose Gold
  const [selectedMaterial, setSelectedMaterial] = useState(product.materials[1]);

  // Handle material change
  const handleMaterialChange = (material) => {
    setSelectedMaterial(material);
  };

  // Format price with currency
  const formatPrice = (price, currency = "CAD") => {
    return `$${price.toLocaleString()} ${currency}`;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    addItem({
      id: `rosaria-${selectedMaterial.pricingKey}`,
      name: product.name,
      variant: selectedMaterial.name,
      price: selectedMaterial.price,
      currency: selectedMaterial.currency,
      image: product.images.hero,
      quantity: 1
    });
  };

  // Gallery media items - hero first
  const galleryItems = React.useMemo(() => [
    {
      type: "image",
      src: product.images.hero,
      alt: "Rosaria - Product shot",
    },
    {
      type: "image",
      src: product.images.modelProfile,
      alt: "Rosaria - Model profile shot",
    },
    {
      type: "image",
      src: product.images.detail,
      alt: "Rosaria - Detail close-up",
    },
    {
      type: "image",
      src: product.images.editorial,
      alt: "Rosaria - Editorial model shot",
    },
    {
      type: "image",
      src: product.images.champagne,
      alt: "Rosaria - Champagne lifestyle shot",
    },
  ], [product.images]);

  // Rosaria hero video URL
  const rosariaVideoUrl = "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/rpvoajo0_20260313_144354239.mp4";

  return (
    <div className="bg-black text-white min-h-screen" data-testid="rosaria-page">
      {/* Hero Section with Video */}
      <section className="bg-black py-12 sm:py-16 md:py-20">
        {/* Video Container */}
        <div className="flex justify-center items-center px-4 mb-8 sm:mb-12">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={product.images.onEar}
            className="w-full max-w-2xl h-auto object-contain"
            style={{ maxHeight: '60vh' }}
          >
            <source src={rosariaVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Text Stack */}
        <div className="text-center px-4 space-y-3 sm:space-y-4">
          <p className="text-[#C6A24A] text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.45em] uppercase">
            Earring Collection
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide sm:tracking-wider text-white">
            ROSARIA
          </h1>
          <p className="text-[#C6A24A] text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.25em] uppercase">
            Sculpted Roses in Rose Gold
          </p>
        </div>
      </section>

      {/* Product Layout with Gallery + Purchase Panel */}
      <ProductLayout
        gallery={<ProductGallery items={galleryItems} />}
        productInfo={
          <>
            <ProductInfoSection
              titleTag="Earring Collection"
              title={product.name}
            >
              <p className="text-[#C6A24A] text-sm tracking-[0.15em] uppercase">
                {product.subtitle}
              </p>
            </ProductInfoSection>
          </>
        }
        purchasePanel={
          <>
            <ProductInfoSection
              titleTag="Select Material"
              title="Rose Gold Options"
            >
              {/* Material Selection */}
              <div className="mt-6 space-y-3">
                {product.materials.map((material) => {
                  const isSelected = selectedMaterial.name === material.name;
                  
                  return (
                    <button
                      key={material.name}
                      onClick={() => handleMaterialChange(material)}
                      className={[
                        "w-full p-4 rounded-lg border text-left relative transition-all duration-300",
                        isSelected
                          ? "border-[#C6A24A] bg-[#C6A24A]/10 scale-[1.02]"
                          : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10",
                      ].join(" ")}
                      data-testid={`material-${material.pricingKey}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={[
                            "font-medium tracking-wide",
                            isSelected ? "text-[#C6A24A]" : "text-white"
                          ].join(" ")}>
                            {material.name}
                          </p>
                          <p className="text-white/50 text-sm mt-1">
                            {material.karat} Karat · {material.color} Gold
                          </p>
                        </div>
                        <div className="text-right">
                          {/* Price display */}
                          <p className={[
                            "font-medium",
                            isSelected ? "text-[#C6A24A]" : "text-white"
                          ].join(" ")}>
                            {formatPrice(material.price, material.currency)}
                          </p>
                          {/* Rose gold swatch */}
                          <div 
                            className={[
                              "w-5 h-5 rounded-full border-2 transition-all mt-1 ml-auto",
                              isSelected ? "border-[#C6A24A]" : "border-white/30"
                            ].join(" ")}
                            style={{ backgroundColor: '#B76E79' }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pricing Display */}
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-center">
                  <p className="text-white/50 text-xs tracking-widest uppercase mb-2">Selected</p>
                  <p className="text-white text-base">{selectedMaterial.name}</p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-[#C6A24A] text-2xl font-medium tracking-wide">
                      {formatPrice(selectedMaterial.price, selectedMaterial.currency)}
                    </p>
                    <p className="text-white/50 text-xs mt-2 tracking-wide">
                      Retail Price (CAD)
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mt-4 text-center">
                <p className="text-white/60 text-sm">
                  {product.shipping}
                </p>
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

      {/* Details & Dimensions Section */}
      <section className="py-24 lg:py-32 px-8 bg-black border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#C6A24A] text-xs tracking-[0.4em] uppercase mb-10">
            Details & Dimensions
          </p>
          
          {/* Dimension Image */}
          <div className="mb-12">
            <img 
              src="https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/2i93lke0_1000141447.jpg"
              alt="Rosaria Earrings - Front and Profile View with Measurements"
              className="w-full max-w-2xl mx-auto h-auto object-contain"
            />
          </div>
          
          {/* Specifications */}
          <div className="space-y-8 text-white">
            {/* Dimensions */}
            <div className="space-y-2">
              <p>Length: 32 mm</p>
              <p>Width: 20 mm</p>
              <p>Thickness: 6 mm</p>
            </div>
            
            {/* Weight */}
            <div className="space-y-1">
              <p className="font-medium">Weight:</p>
              <p>Approximately 8 grams per earring</p>
              <p className="text-white/70">(16 grams per pair)</p>
            </div>
            
            {/* Material */}
            <div className="space-y-1">
              <p className="font-medium">Material:</p>
              <p>Available in 10K Rose Gold</p>
              <p>Available in 14K Rose Gold</p>
            </div>
          </div>
        </div>
      </section>

      {/* Craft & Material Section */}
      <section className="py-24 lg:py-32 px-8 bg-black border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#C6A24A] text-xs tracking-[0.4em] uppercase mb-6">
            Craft & Material
          </p>
          
          <p className="text-white/60 leading-relaxed mb-8 max-w-2xl mx-auto">
            Each Rosaria earring is sculpted to capture the intricate layers of a rose in full bloom. 
            The cascading composition creates movement and depth, reflecting light across every petal.
          </p>
          
          <p className="text-white/50 text-sm tracking-wider uppercase mb-8">
            Available exclusively in:
          </p>
          
          <div className="space-y-6 max-w-md mx-auto">
            <div>
              <p className="text-[#C6A24A] font-medium tracking-wide">10K Rose Gold</p>
              <p className="text-white/50 text-sm mt-1">Warm rose hue with excellent durability.</p>
            </div>
            
            <div>
              <p className="text-[#C6A24A] font-medium tracking-wide">14K Rose Gold</p>
              <p className="text-white/50 text-sm mt-1">Richer rose tone for a premium finish.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Rosaria Section */}
      <section className="py-24 lg:py-32 px-8 bg-black border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#C6A24A] text-xs tracking-[0.4em] uppercase mb-6">
            About Rosaria
          </p>
          
          <h2 className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-white mb-10">
            {product.subtitle}
          </h2>
          
          <p className="text-white/60 leading-relaxed mb-8 max-w-2xl mx-auto">
            {product.description}
          </p>
          
          <p className="text-white/50 text-sm leading-relaxed max-w-xl mx-auto">
            {product.materialNote}
          </p>
          
          <p className="mt-12 text-[#C6A24A] text-sm tracking-[0.4em] uppercase">
            #GetYourPhileon
          </p>
        </div>
      </section>
    </div>
  );
}
