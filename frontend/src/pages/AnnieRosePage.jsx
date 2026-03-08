import React, { useState } from "react";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
  ProductActions,
} from "../components/ProductLayout";

export default function AnnieRosePage() {
  // State for selected metal
  const [selectedMetal, setSelectedMetal] = useState({
    name: "Sterling Silver",
    label: "Silver",
    price: 1250
  });

  // Metal options with pricing
  const metalOptions = [
    { name: "Sterling Silver", label: "Silver", price: 1250 },
    { name: "10K Gold", label: "10K", price: 2800 },
    { name: "14K Gold", label: "14K", price: 3400 },
    { name: "18K Gold", label: "18K", price: 4200 },
  ];

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
              title="Annie Rose"
            >
              <p className="text-white/60 leading-relaxed">
                Created in honor of my sister Andrea.
              </p>

              <p className="text-[#C6A24A] text-lg font-light leading-relaxed mt-4">
                Soft in tone. Strong in spirit.
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
              <p className="text-white/60 text-sm leading-relaxed mt-2">
                Each metal option preserves the Annie Rose design. Stone options (Cubic · Lab · Natural) available for all metals.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/70">
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
                    <p className="mt-2 text-[#C6A24A] text-base font-light">${metal.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </ProductInfoSection>

            <ProductActions
              primaryAction={{ 
                href: `mailto:contact@phileonjewelry.com?subject=Annie%20Rose%20Inquiry&body=Product:%20Annie%20Rose%0AMetal:%20${encodeURIComponent(selectedMetal.name)}%0APrice:%20$${selectedMetal.price.toLocaleString()}`, 
                label: "INQUIRE TO PURCHASE" 
              }}
            />
          </>
        }
        stickyOffset={36}
      />
    </div>
  );
}
