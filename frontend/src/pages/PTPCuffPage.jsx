import React, { useState } from "react";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
  ProductActions,
} from "../components/ProductLayout";
import { useCart } from "../contexts/CartContext";
import { Button } from "../components/ui/button";
import { products } from "../data/products";

export default function PTPCuffPage() {
  const { addToCart } = useCart();
  const product = products.ptpCuff;
  
  // Edition options
  const editionOptions = product.tiers.map((tier) => ({
    name: tier.name,
    material: tier.material,
    materialDetail: tier.materialDetail,
    price: product.pricing[tier.pricingKey],
    tag: tier.tag,
    highlight: tier.highlight,
    pricingKey: tier.pricingKey
  }));
  
  // State for selected edition (default to Signature - most popular)
  const [selectedEdition, setSelectedEdition] = useState(editionOptions[1]);

  // Handle edition change
  const handleEditionChange = (edition) => {
    setSelectedEdition(edition);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const cartProduct = {
      id: "ptp-cuff",
      name: product.name,
      slug: "ptp-cuff",
      price: selectedEdition.price,
      image: product.images.hero,
      images: [product.images.hero],
      materials: [selectedEdition.material]
    };

    const variant = {
      edition: selectedEdition.name,
      material: selectedEdition.material
    };

    addToCart(cartProduct, 1, variant);
  };

  // Gallery media items
  const galleryItems = React.useMemo(() => [
    {
      type: "image",
      src: product.images.hero,
      alt: "PTP Cuff - Front hero reflection shot",
    },
    {
      type: "image",
      src: product.images.angled,
      alt: "PTP Cuff - Angled sculptural shot",
    },
    {
      type: "image",
      src: product.images.detail,
      alt: "PTP Cuff - Macro detail of raised fists",
    },
    {
      type: "image",
      src: product.images.lifestyle,
      alt: "PTP Cuff - On-wrist lifestyle image",
    },
  ], [product.images]);

  return (
    <div className="bg-black text-white min-h-screen" data-testid="ptp-cuff-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative w-full h-[50vh] md:h-[65vh]">
          <img
            src={product.images.hero}
            alt="The PTP Cuff"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
            Cuff Collection
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-light tracking-wide">
            THE PTP CUFF
          </h1>
          <p className="mt-2 text-white/70 text-sm tracking-[0.2em] uppercase">
            Power To The People
          </p>
        </div>
      </section>

      {/* Product Layout with Gallery + Info */}
      <ProductLayout
        gallery={<ProductGallery items={galleryItems} />}
        productInfo={
          <>
            <ProductInfoSection
              titleTag="Cuff Collection"
              title={product.name}
            >
              <p className="text-[#C6A24A] text-sm tracking-[0.15em] uppercase mb-4">
                {product.subtitle}
              </p>
              
              <p className="text-white/60 leading-relaxed">
                {product.description}
              </p>

              <p className="text-white/50 text-sm mt-4 leading-relaxed">
                {product.tagline}
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
              titleTag="Select Edition"
              title="Choose your tier"
            >
              {/* Edition Selection */}
              <div className="mt-6 space-y-3">
                {editionOptions.map((edition) => (
                  <button
                    key={edition.name}
                    onClick={() => handleEditionChange(edition)}
                    className={[
                      "w-full p-4 rounded-lg border transition-all duration-300 text-left relative",
                      selectedEdition.name === edition.name
                        ? "border-[#C6A24A] bg-[#C6A24A]/10"
                        : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10",
                    ].join(" ")}
                    data-testid={`edition-${edition.pricingKey}`}
                  >
                    {/* Tag Badge */}
                    {edition.tag && (
                      <span className={[
                        "absolute -top-2 right-3 px-2 py-0.5 text-[10px] tracking-wider uppercase rounded",
                        edition.highlight 
                          ? "bg-[#C6A24A] text-black font-semibold"
                          : "bg-white/20 text-white/80"
                      ].join(" ")}>
                        {edition.tag}
                      </span>
                    )}
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={[
                          "font-medium tracking-wide",
                          selectedEdition.name === edition.name
                            ? "text-[#C6A24A]"
                            : "text-white"
                        ].join(" ")}>
                          {edition.name}
                        </p>
                        <p className="text-white/50 text-sm mt-1">
                          {edition.material}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">
                          {edition.materialDetail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={[
                          "text-lg font-light",
                          selectedEdition.name === edition.name
                            ? "text-[#C6A24A]"
                            : "text-white/80"
                        ].join(" ")}>
                          ${edition.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Edition Summary */}
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white/50 text-xs tracking-widest uppercase">Selected</p>
                    <p className="text-white text-base mt-1">{selectedEdition.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{selectedEdition.material}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs tracking-widest uppercase">Price</p>
                    <p className="text-[#C6A24A] text-xl font-light mt-1">${selectedEdition.price.toLocaleString()}</p>
                  </div>
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
