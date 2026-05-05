import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
} from "../components/ProductLayout";
import { Button } from "../components/ui/button";
import { products } from "../data/products";
import { useAddToCart } from "../hooks/useAddToCart";
import StyleItWith from "../components/StyleItWith";
import { useLiveTierPrices } from "../hooks/useLivePrice";

export default function RosariaPage() {
  const product = products.rosaria;
  const { isAdding, handleAddToCart, buttonText, buttonClass } = useAddToCart();
  const tierPricesLive = useLiveTierPrices("rosaria");
  
  // State for selected material - default to 14K Rose Gold
  const [selectedMaterial, setSelectedMaterial] = useState(product.materials[1]);

  // Handle material change
  const handleMaterialChange = (material) => {
    setSelectedMaterial(material);
  };

  // Format price with currency — uses live pricing if available
  const formatPrice = (price, currency = 'USD', pricingKey) => {
    if (pricingKey && tierPricesLive[pricingKey]) {
      return `${tierPricesLive[pricingKey].formatted} ${currency}`;
    }
    return `$${price.toLocaleString()} ${currency}`;
  };

  // Handle add to cart with micro-interaction
  const onAddToCart = () => {
    handleAddToCart({
      id: `rosaria-${selectedMaterial.pricingKey}`,
      name: `${product.name} - ${selectedMaterial.name}`,
      image: product.images.hero,
      price: selectedMaterial.price,
      slug: 'rosaria',
      materials: [selectedMaterial.name]
    }, 1, selectedMaterial.name);
  };

  // Gallery media items - 4 slides as specified
  const galleryItems = React.useMemo(() => [
    {
      type: "image",
      src: product.images.hero,
      alt: "Rosaria - Clean black background product shot",
    },
    {
      type: "image",
      src: product.images.modelProfile,
      alt: "Rosaria - Model wearing Rosaria",
    },
    {
      type: "image",
      src: product.images.detail,
      alt: "Rosaria - Jewelry box detail shot",
    },
    {
      type: "image",
      src: product.images.champagne,
      alt: "Rosaria - Champagne plunge shot",
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
            poster={product.images.hero}
            className="w-full max-w-2xl h-auto object-contain"
            style={{ maxHeight: '60vh' }}
          >
            <source src={rosariaVideoUrl} type="video/mp4" />
            {/* Fallback to image if video fails */}
            <img
              src={product.images.hero}
              alt="Rosaria Earrings"
              className="w-full h-auto object-contain"
            />
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
        gallery={<ProductGallery items={galleryItems} productType="earrings" />}
        productInfo={
          <>
            <ProductInfoSection
              titleTag="Earring Collection"
              title="Rosaria"
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
              titleTag=""
              title="Rosaria"
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
                        </div>
                        <div className="text-right">
                          <p className={[
                            "font-medium",
                            isSelected ? "text-[#C6A24A]" : "text-white"
                          ].join(" ")}>
                            {formatPrice(material.price, material.currency, material.pricingKey)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Product Details */}
              <div className="mt-6 space-y-2 text-center text-white/70 text-sm">
                <p>Solid Rose Gold Construction</p>
                <p>Approx. 16g Per Pair</p>
                <p>Individually Hand Finished</p>
              </div>

              {/* Shipping Info */}
              <div className="mt-6 text-center">
                <p className="text-white/60 text-sm">
                  Complimentary insured shipping within Canada.
                </p>
              </div>
            </ProductInfoSection>

            <div className="mt-6">
              <Button
                onClick={onAddToCart}
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
              <p className="font-medium">Weight</p>
              <p>Approximately 8 grams per earring</p>
              <p className="text-white/70">(16 grams per pair)</p>
            </div>
            
            {/* Material */}
            <div className="space-y-1">
              <p className="font-medium">Material</p>
              <p>10K Rose Gold</p>
              <p>14K Rose Gold</p>
            </div>
          </div>
        </div>
      </section>

      {/* Craft & Material Section */}
      <section className="py-24 lg:py-32 px-8 bg-black border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#C6A24A] text-xs tracking-[0.4em] uppercase mb-10">
            Craft & Material
          </p>
          
          <p className="text-white/70 leading-relaxed mb-6 max-w-2xl mx-auto">
            Rosaria is sculpted as a cluster of blooming roses, cast in solid rose gold and finished by hand.
          </p>
          
          <p className="text-white/70 leading-relaxed mb-6 max-w-2xl mx-auto">
            Each piece is polished to a mirror finish, allowing the sculpted petals to catch light from every angle.
          </p>
          
          <p className="text-white/60 text-sm tracking-wide">
            Available in 10K or 14K rose gold.
          </p>
        </div>
      </section>

      {/* Style it with Section */}
      <StyleItWith productId="rosaria" />

      {/* Closing Line */}
      <section className="py-24 lg:py-32 px-8 bg-black border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-xl sm:text-2xl md:text-3xl text-white/80 italic tracking-wide leading-relaxed">
            A sculptural rose cast in gold — designed to bloom in motion.
          </p>
          
          <p className="mt-12 text-[#C6A24A] text-sm tracking-[0.4em] uppercase">
            #GetYourPhileon
          </p>
        </div>
      </section>
    </div>
  );
}
