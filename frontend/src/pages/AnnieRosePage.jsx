import React from "react";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
  ProductActions,
} from "../components/ProductLayout";

export default function AnnieRosePage() {
  // Gallery media items - memoized to prevent recreation
  const galleryItems = React.useMemo(() => [
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg",
      alt: "Annie Rose Ring",
    },
    {
      type: "video",
      src: "/videos/annierose-1.mp4",
      alt: "Annie Rose detail video",
    },
    {
      type: "video",
      src: "/videos/annierose-2.mp4",
      alt: "Annie Rose showcase video",
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
                A signature silhouette engineered for presence. Choose your metal, choose your stones — and make it yours.
              </p>

              <p className="text-white/60 leading-relaxed">
                Limited runs. Hand-finished. Built to be recognized.
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
              titleTag="Select Your Edition"
              title="Choose your level"
            >
              <div className="flex items-baseline gap-3 mt-4">
                <p className="text-white/70 text-sm tracking-wide">Starting at</p>
                <p className="text-3xl md:text-4xl font-light">
                  $1,250
                </p>
                <p className="text-white/50 text-sm">CAD</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-white/70">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Metals</p>
                  <p className="mt-2">Silver · 10K · 14K · 18K</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Stones</p>
                  <p className="mt-2">Cubic · Lab · Natural</p>
                </div>
              </div>
            </ProductInfoSection>

            <ProductActions
              primaryAction={{ href: "/shop", label: "SHOP THIS DROP" }}
              secondaryAction={{ href: "/custom", label: "CUSTOMIZE IT" }}
            />
          </>
        }
        stickyOffset={36}
      />
    </div>
  );
}
