import React, { useState } from "react";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
  ProductActions,
} from "../components/ProductLayout";
import { useCart } from "../contexts/CartContext";
import { Button } from "../components/ui/button";
import { products } from "../data/products";

export default function MonikaCouturePage() {
  const { addToCart } = useCart();
  
  // Metal options with images and colors
  const metalOptions = [
    { 
      name: "Sterling Silver", 
      label: "Silver", 
      price: products.monikaCouture.pricing.silver,
      image: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/5zjvbk47_1000139953.jpg",
      color: "#C0C0C0", // Silver
    },
    { 
      name: "10K Yellow Gold", 
      label: "Yellow Gold", 
      price: products.monikaCouture.pricing.yellow10k,
      image: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/gqpaomuo_1000139951.jpg",
      color: "#FFD700", // Gold
    },
    { 
      name: "10K Rose Gold", 
      label: "Rose Gold", 
      price: products.monikaCouture.pricing.rose10k,
      image: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/jcswkfyo_1000139952.jpg",
      color: "#E0BFB8", // Rose Gold
    },
    { 
      name: "10K White Gold", 
      label: "White Gold", 
      price: products.monikaCouture.pricing.white10k,
      image: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg",
      color: "#F5F5F5", // White Gold / Platinum
    },
  ];
  
  // State for selected metal (default to first option)
  const [selectedMetal, setSelectedMetal] = useState(metalOptions[0]);

  // Handle add to cart
  const handleAddToCart = () => {
    const product = {
      id: "monika-couture",
      name: products.monikaCouture.name,
      slug: "monika-couture",
      price: selectedMetal.price,
      image: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg",
      images: ["https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg"],
      materials: [selectedMetal.name]
    };

    const variant = {
      metal: selectedMetal.name
    };

    addToCart(product, 1, variant);
  };

  // Gallery media items - memoized to prevent recreation
  const galleryItems = React.useMemo(() => [
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg",
      alt: "The Monika Couture Earrings",
    },
    {
      type: "video",
      src: "/videos/monika-couture.mp4",
      poster: "/images/thumbnails/monika-couture-thumb.jpg",
      alt: "Monika Couture video",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/n57dc44j_1000139957.jpg",
      alt: "Monika Couture worn in gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/16wydipm_1000139955.jpg",
      alt: "Monika Couture — Silver, Gold, Rose Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/5zjvbk47_1000139953.jpg",
      alt: "Monika Couture Silver",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/jcswkfyo_1000139952.jpg",
      alt: "Monika Couture Rose Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/gqpaomuo_1000139951.jpg",
      alt: "Monika Couture Yellow Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/s2t8dt8y_1000139942.jpg",
      alt: "Monika Couture packaging",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/gjmyama0_1000139948.jpg",
      alt: "Monika Couture detail",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/ttzpwg0u_1000139962.jpg",
      alt: "Monika Couture lifestyle",
    },
  ], []);

  return (
    <div className="bg-black text-white min-h-screen" data-testid="monika-couture-page">
      {/* Hero Section */}
      <section className="relative">
        <img
          src={selectedMetal.image}
          alt="The Monika Couture Earrings"
          className="w-full h-[50vh] md:h-[65vh] object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
            Earring Collection
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-light tracking-wide">
            MONIKA COUTURE EARRINGS
          </h1>
        </div>
      </section>

      {/* Product Layout with Gallery + Info */}
      <ProductLayout
        gallery={<ProductGallery items={galleryItems} />}
        productInfo={
          <>
            <ProductInfoSection
              titleTag="Earring Collection"
              title={products.monikaCouture.name}
            >
              <p className="text-white/60 leading-relaxed">
                A sculptural couture earring inspired by the architecture of high fashion.
                The Monika Couture design transforms the silhouette of a fashion heel into an open lattice structure that feels bold, elegant, and dramatic in movement.
              </p>

              <p className="text-white/50 text-sm">
                Weight: approximately {products.monikaCouture.weight}.
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
              title="Choose your metal"
            >
              {/* Metal Swatches */}
              <div className="mt-6 flex flex-wrap gap-4">
                {metalOptions.map((metal) => (
                  <button
                    key={metal.name}
                    onClick={() => setSelectedMetal(metal)}
                    className="flex flex-col items-center gap-2 group"
                    data-testid={`metal-swatch-${metal.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {/* Circular Swatch */}
                    <div
                      className={[
                        "w-12 h-12 rounded-full border-2 transition-all duration-300",
                        selectedMetal.name === metal.name
                          ? "border-[#C6A24A] scale-110 shadow-lg shadow-[#C6A24A]/30"
                          : "border-white/20 group-hover:border-white/40 group-hover:scale-105",
                      ].join(" ")}
                      style={{ 
                        backgroundColor: metal.color,
                        boxShadow: selectedMetal.name === metal.name 
                          ? `0 0 20px ${metal.color}40` 
                          : 'none'
                      }}
                    />
                    {/* Label */}
                    <span className={[
                      "text-xs tracking-wider transition-colors duration-300",
                      selectedMetal.name === metal.name
                        ? "text-[#C6A24A] font-medium"
                        : "text-white/60 group-hover:text-white/80"
                    ].join(" ")}>
                      {metal.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Metal Info */}
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white/50 text-xs tracking-widest uppercase">Selected</p>
                    <p className="text-white text-base mt-1">{selectedMetal.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs tracking-widest uppercase">Price</p>
                    <p className="text-[#C6A24A] text-xl font-light mt-1">${selectedMetal.price.toLocaleString()}</p>
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
