import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
} from "../components/ProductLayout";
import { Button } from "../components/ui/button";
import { products } from "../data/products";

export default function RosariaPage() {
  const product = products.rosaria;
  
  // State for selected material
  const [selectedMaterial, setSelectedMaterial] = useState(product.materials[0]);

  // Handle material change
  const handleMaterialChange = (material) => {
    setSelectedMaterial(material);
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
      src: product.images.detail,
      alt: "Rosaria - Detail close-up",
    },
    {
      type: "image",
      src: product.images.onEar,
      alt: "Rosaria - On-ear model shot",
    },
    {
      type: "image",
      src: product.images.editorial,
      alt: "Rosaria - Editorial model shot",
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
                        {/* Rose gold swatch */}
                        <div 
                          className={[
                            "w-6 h-6 rounded-full border-2 transition-all",
                            isSelected ? "border-[#C6A24A]" : "border-white/30"
                          ].join(" ")}
                          style={{ backgroundColor: '#B76E79' }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pricing Notice */}
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-center">
                  <p className="text-white/50 text-xs tracking-widest uppercase mb-2">Selected</p>
                  <p className="text-white text-base">{selectedMaterial.name}</p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-[#C6A24A] text-sm tracking-wide">
                      Pricing available upon request.
                    </p>
                  </div>
                </div>
              </div>
            </ProductInfoSection>

            <div className="mt-6">
              <Link to="/contact">
                <Button
                  className="w-full bg-[#C6A24A] hover:bg-[#B8944A] text-black font-semibold py-6 rounded-md tracking-wide"
                  data-testid="request-pricing-button"
                >
                  REQUEST PRICING
                </Button>
              </Link>
            </div>
          </>
        }
        stickyOffset={36}
      />

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
