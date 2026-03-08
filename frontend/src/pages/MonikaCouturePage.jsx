import React, { useState } from "react";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
  ProductActions,
} from "../components/ProductLayout";

export default function MonikaCouturePage() {
  // State for selected metal
  const [selectedMetal, setSelectedMetal] = useState({
    name: "Sterling Silver",
    label: "Silver",
    price: 1400
  });

  // Metal options
  const metalOptions = [
    { name: "Sterling Silver", label: "Silver", price: 1400 },
    { name: "10K White Gold", label: "White Gold", price: 3700 },
    { name: "10K Yellow Gold", label: "Yellow Gold", price: 3700 },
    { name: "10K Rose Gold", label: "Rose Gold", price: 3700 },
  ];
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
          src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg"
          alt="The Monika Couture Earrings"
          className="w-full h-[50vh] md:h-[65vh] object-cover"
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
              title="Monika Couture Earrings"
            >
              <p className="text-white/60 leading-relaxed">
                A sculptural couture earring inspired by the architecture of high fashion.
                The Monika Couture design transforms the silhouette of a fashion heel into an open lattice structure that feels bold, elegant, and dramatic in movement.
              </p>

              <p className="text-white/50 text-sm">
                Weight: approximately 10 grams per pair.
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
                href: `mailto:contact@phileonjewelry.com?subject=Monika%20Couture%20Earrings%20Inquiry&body=Product:%20Monika%20Couture%20Earrings%0AMetal:%20${encodeURIComponent(selectedMetal.name)}%0APrice:%20$${selectedMetal.price.toLocaleString()}`, 
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
