import React, { useState } from "react";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
} from "../components/ProductLayout";
import { Button } from "../components/ui/button";
import { products } from "../data/products";
import { useCart } from "../contexts/CartContext";
import StyleItWith from "../components/StyleItWith";

export default function DesirCorsetPage() {
  const product = products.desirCorset;
  const { addItem } = useCart();
  
  // State for selected option - default to Pendant Only
  const [selectedOption, setSelectedOption] = useState(product.options[0]);

  // Handle option change
  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  // Format price with currency
  const formatPrice = (price, currency = "CAD") => {
    return `$${price.toLocaleString()} ${currency}`;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    addItem({
      id: `desir-corset-${selectedOption.pricingKey}`,
      name: product.name,
      variant: selectedOption.name,
      price: selectedOption.price,
      currency: selectedOption.currency,
      image: product.images.hero,
      quantity: 1
    });
  };

  // Gallery media items
  const galleryItems = React.useMemo(() => [
    {
      type: "image",
      src: product.images.hero,
      alt: "Désir Corset Pendant - Black mannequin hero",
    },
    {
      type: "image",
      src: product.images.wornPortrait,
      alt: "Désir Corset Pendant - Worn portrait close-up",
    },
    {
      type: "image",
      src: product.images.angledMannequin,
      alt: "Désir Corset Pendant - Angled black mannequin",
    },
    {
      type: "image",
      src: product.images.macroDetail1,
      alt: "Désir Corset Pendant - Macro detail",
    },
    {
      type: "image",
      src: product.images.macroDetail2,
      alt: "Désir Corset Pendant - Macro detail",
    },
    {
      type: "image",
      src: product.images.inHand,
      alt: "Désir Corset Pendant - In-hand lifestyle",
    },
    {
      type: "image",
      src: product.images.palmShot,
      alt: "Désir Corset Pendant - Palm shot",
    },
    {
      type: "image",
      src: product.images.rooftopLifestyle,
      alt: "Désir Corset Pendant - Rooftop lifestyle",
    },
  ], [product.images]);

  return (
    <div className="bg-black text-white min-h-screen" data-testid="desir-corset-page">
      {/* Motion Hero Section */}
      <section className="bg-[#000000] py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Hero Media Container - Video with image fallback */}
        <div className="flex justify-center items-center px-4 mb-8 sm:mb-12">
          <div className="relative w-full max-w-2xl">
            {/* Hero Video - Looping */}
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={product.images.hero}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '60vh' }}
            >
              <source src={product.images.heroVideo} type="video/mp4" />
              {/* Fallback to image if video fails */}
              <img
                src={product.images.hero}
                alt="Désir Corset Pendant"
                className="w-full h-auto object-contain"
              />
            </video>
          </div>
        </div>

        {/* Text Stack */}
        <div className="text-center px-4 space-y-3 sm:space-y-4">
          <p className="text-[#C6A24A] text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.45em] uppercase">
            Pendant Collection
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide sm:tracking-wider text-white">
            DÉSIR CORSET
          </h1>
          <p className="text-[#C6A24A] text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.25em] uppercase">
            {product.tagline}
          </p>
        </div>
      </section>

      {/* Product Layout with Gallery + Purchase Panel */}
      <ProductLayout
        gallery={<ProductGallery items={galleryItems} />}
        productInfo={
          <>
            <ProductInfoSection
              titleTag="Pendant Collection"
              title="Désir Corset Pendant"
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
              title="Désir Corset Pendant"
            >
              {/* Option Selection */}
              <div className="mt-6 space-y-3">
                {product.options.map((option) => {
                  const isSelected = selectedOption.name === option.name;
                  
                  return (
                    <button
                      key={option.name}
                      onClick={() => handleOptionChange(option)}
                      className={[
                        "w-full p-4 rounded-lg border text-left relative transition-all duration-300",
                        isSelected
                          ? "border-[#C6A24A] bg-[#C6A24A]/10 scale-[1.02]"
                          : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10",
                      ].join(" ")}
                      data-testid={`option-${option.pricingKey}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={[
                            "font-medium tracking-wide",
                            isSelected ? "text-[#C6A24A]" : "text-white"
                          ].join(" ")}>
                            {option.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={[
                            "font-medium",
                            isSelected ? "text-[#C6A24A]" : "text-white"
                          ].join(" ")}>
                            {formatPrice(option.price, option.currency)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Product Details */}
              <div className="mt-6 space-y-2 text-center text-white/70 text-sm">
                <p>10K Rose Gold</p>
                <p>Approx. 12.5g</p>
                <p>Hand Polished & Hand Finished</p>
              </div>

              {/* Shipping Info */}
              <div className="mt-6 text-center">
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

      {/* Description Section */}
      <section className="py-24 lg:py-32 px-8 bg-black border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#C6A24A] text-xs tracking-[0.4em] uppercase mb-10">
            About This Piece
          </p>
          
          <p className="text-white/70 leading-relaxed mb-6 max-w-2xl mx-auto">
            Inspired by the structure of couture corsetry, the Désir Corset Pendant transforms sculpted form into wearable architecture.
          </p>
          
          <p className="text-white/70 leading-relaxed mb-6 max-w-2xl mx-auto">
            Fine mesh panels create depth and texture within a polished rose gold frame, forming a tapered waist and sculpted cup structure that echo the lines of high fashion tailoring.
          </p>
          
          <p className="text-white/70 leading-relaxed mb-6 max-w-2xl mx-auto">
            Designed to sit naturally against the chest, the pendant features subtle curvature and balanced proportions that allow the piece to hang elegantly from a delicate chain.
          </p>
          
          <p className="text-white/60 text-sm tracking-wide mt-8">
            A statement piece that blends sculpture, fashion, and fine jewelry.
          </p>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-24 lg:py-32 px-8 bg-black border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#C6A24A] text-xs tracking-[0.4em] uppercase mb-10">
            Product Details
          </p>
          
          {/* Specifications */}
          <div className="space-y-6 text-white">
            <div className="space-y-1">
              <p className="text-white/50 text-xs uppercase tracking-widest">Metal</p>
              <p>{product.specs.metal}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-white/50 text-xs uppercase tracking-widest">Height</p>
              <p>{product.specs.height}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-white/50 text-xs uppercase tracking-widest">Width</p>
              <p>{product.specs.width}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-white/50 text-xs uppercase tracking-widest">Weight</p>
              <p>Approximately {product.specs.weight}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-white/50 text-xs uppercase tracking-widest">Construction</p>
              <p>{product.specs.construction}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-white/50 text-xs uppercase tracking-widest">Finish</p>
              <p>{product.specs.finish}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-white/50 text-xs uppercase tracking-widest">Chain</p>
              <p>{product.specs.chain}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specification Graphic Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-8 bg-black border-t border-white/10">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#C6A24A] text-xs tracking-[0.4em] uppercase mb-8 text-center">
            Dimensions
          </p>
          <div className="bg-white/5 rounded-lg p-4 sm:p-8">
            <img 
              src={product.images.specSheet}
              alt="Désir Corset Pendant Specifications - Height: 45mm, Width: 38mm, Weight: 12.5 grams"
              className="w-full h-auto object-contain rounded"
            />
          </div>
        </div>
      </section>

      {/* Style it with Section */}
      <StyleItWith productId="desir-corset" />

      {/* Closing Line */}
      <section className="py-24 lg:py-32 px-8 bg-black border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-xl sm:text-2xl md:text-3xl text-white/80 italic tracking-wide leading-relaxed">
            Wearable architecture — where sculpture meets skin.
          </p>
          
          <p className="mt-12 text-[#C6A24A] text-sm tracking-[0.4em] uppercase">
            #GetYourPhileon
          </p>
        </div>
      </section>
    </div>
  );
}
