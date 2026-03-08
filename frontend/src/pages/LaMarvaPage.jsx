import React, { useState, useEffect } from "react";
import ProductGallery from "../components/ProductGallery";
import ProductLayout, {
  ProductInfoSection,
  ProductSpecs,
  ProductPrice,
  ProductActions,
} from "../components/ProductLayout";
import { products } from "../data/products";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ==========================================
// PRICING ENGINE
// Baseline gold price when retail was set.
// If gold moves > 5%, prices scale proportionally.
// Otherwise, hold.
// ==========================================
const BASELINE_GOLD_USD = products.laMarva.baselineGoldUSD;

// Base tiers from products.js with pricing
const BASE_TIERS = products.laMarva.tiers.map(tier => ({
  ...tier,
  basePrice: products.laMarva.pricing[tier.pricingKey]
}));

function useGoldPricing() {
  const [goldPrice, setGoldPrice] = useState(null);
  const [adjusted, setAdjusted] = useState(false);
  const [changePct, setChangePct] = useState(0);

  useEffect(() => {
    async function fetchGold() {
      try {
        const res = await fetch(`${API_URL}/api/metals`, { cache: "no-store" });
        const data = await res.json();
        if (data.status === "live" && data.gold_usd_oz > 0) {
          setGoldPrice(data.gold_usd_oz);
          const pct = ((data.gold_usd_oz - BASELINE_GOLD_USD) / BASELINE_GOLD_USD) * 100;
          setChangePct(pct);
          setAdjusted(Math.abs(pct) > 5);
        }
      } catch (e) {
        // hold pricing on error
      }
    }
    fetchGold();
    const t = setInterval(fetchGold, 60000);
    return () => clearInterval(t);
  }, []);

  const tiers = BASE_TIERS.map((tier) => {
    if (adjusted && !tier.consultation) {
      const multiplier = goldPrice / BASELINE_GOLD_USD;
      const newPrice = Math.round(tier.basePrice * multiplier / 100) * 100;
      return {
        ...tier,
        price: `$${newPrice.toLocaleString()}`,
        priceAdjusted: true,
      };
    }
    const prefix = tier.consultation ? "Starting at " : "";
    return {
      ...tier,
      price: `${prefix}$${tier.basePrice.toLocaleString()}`,
      priceAdjusted: false,
    };
  });

  return { tiers, goldPrice, adjusted, changePct };
}

export default function LaMarvaPage() {
  const { tiers, goldPrice, adjusted, changePct } = useGoldPricing();

  // Gallery media items - memoized to prevent recreation on every render
  const galleryItems = React.useMemo(() => [
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg",
      alt: "Phileon La Marva Ring",
    },
    {
      type: "video",
      src: "/videos/lamarva-detail.mp4",
      poster: "/images/thumbnails/lamarva-detail-thumb.jpg",
      alt: "La Marva detail video",
    },
    {
      type: "video",
      src: "/videos/lamarva-showcase.mp4",
      poster: "/images/thumbnails/lamarva-showcase-thumb.jpg",
      alt: "La Marva showcase video",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/c78rhhdk_Lamarva6.png",
      alt: "La Marva close-up detail",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/2mmmt7rp_LaMarva8.png",
      alt: "La Marva on hand",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/s5mgzzh2_Lamarva7.png",
      alt: "La Marva side angle",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/x1l682uf_Lamarva5.jpeg",
      alt: "La Marva underside detail",
    },
  ], []);

  return (
    <div className="bg-black text-white min-h-screen" data-testid="la-marva-page">
      {/* Hero Section */}
      <section className="relative">
        <img
          src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg"
          alt="Phileon La Marva Ring"
          className="w-full h-[50vh] md:h-[65vh] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
            Core Collection
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-light tracking-wide">
            LA MARVA
          </h1>
        </div>
      </section>

      {/* Product Layout with Gallery + Info */}
      <ProductLayout
        gallery={<ProductGallery items={galleryItems} />}
        productInfo={
          <>
            <ProductInfoSection
              titleTag="Core Collection"
              title={products.laMarva.name}
            >
              <p className="text-white/60 leading-relaxed">
                {products.laMarva.tribute}
              </p>

              <p className="text-white/60 leading-relaxed">
                {products.laMarva.description} Every detail speaks to what endures: <span className="text-white font-medium">love, memory, and the stories that shape us.</span>
              </p>
            </ProductInfoSection>

            <div className="border-t border-white/10 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-2xl font-light text-white">2ct</p>
                  <p className="text-white/50 text-xs tracking-wide">Princess Cut Diamonds</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-light text-white">0.50ct</p>
                  <p className="text-white/50 text-xs tracking-wide">Tapered Baguettes</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-light text-white">3.50ct</p>
                  <p className="text-white/50 text-xs tracking-wide">Pink Sapphires</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-light text-white">0.64ct</p>
                  <p className="text-white/50 text-xs tracking-wide">Pavé White Diamonds</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              <p className="text-white/60 leading-relaxed">
                Whether she's walking down the aisle or commanding every room she enters — <span className="text-white font-medium">La Marva ensures she will never go unnoticed.</span>
              </p>

              <p className="text-white/50 text-sm italic">
                Each piece is crafted to order.
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <p className="text-white/40 text-sm italic">
                Phileon. Worn by those who carry someone with them.
              </p>
              <p className="mt-4 text-[#C6A24A] text-sm tracking-[0.4em] uppercase">
                #GetYourPhileon
              </p>
            </div>
          </>
        }
        purchasePanel={
          <>
            <ProductInfoSection
              titleTag="Select Your Edition"
              title="Choose your level"
            >
              <p className="text-white/60 text-sm leading-relaxed">
                Each edition preserves the full La Marva design. Materials and craftsmanship vary to suit different preferences while maintaining the integrity of the original form.
              </p>

              {/* Gold price status */}
              {goldPrice && (
                <div className="mt-4 flex items-center gap-3 text-xs text-white/40">
                  <span>Gold spot: ${goldPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}/oz</span>
                  <span className="text-white/25">|</span>
                  {adjusted ? (
                    <span className="text-[#C6A24A]">
                      Prices adjusted ({changePct > 0 ? '+' : ''}{changePct.toFixed(1)}% gold move)
                    </span>
                  ) : (
                    <span>Prices held (gold within 5% of baseline)</span>
                  )}
                </div>
              )}
            </ProductInfoSection>

            <div className="space-y-4 mt-6">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={[
                    "rounded-xl border p-4 transition",
                    tier.highlight
                      ? "border-[#C6A24A]/70 bg-[#C6A24A]/10"
                      : "border-white/10 bg-white/5",
                  ].join(" ")}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs tracking-[0.35em] uppercase text-white/60">
                        {tier.name}
                        {tier.tag && (
                          <span className="ml-2 text-[#C6A24A] normal-case tracking-normal">
                            — {tier.tag}
                          </span>
                        )}
                      </p>

                      <h3 className="mt-2 text-base md:text-lg font-light">
                        {tier.material}
                      </h3>

                      <p className="mt-2 text-white/60 text-xs">
                        {tier.consultation ? "Available by consultation" : tier.note}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-white/50">
                        {tier.isHeirloom ? "By consultation" : "Retail"}
                      </p>

                      {!tier.isHeirloom ? (
                        <p className="text-lg md:text-xl font-light">
                          {tier.price}
                          <span className="ml-1 text-xs text-white/50">CAD</span>
                          {tier.priceAdjusted && (
                            <span className="ml-2 text-xs text-[#C6A24A]/70">*</span>
                          )}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm font-light text-white/80">
                          Consultation required
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Materials */}
                  <div className="mt-3 text-xs text-white/60 space-y-1">
                    {tier.specs.map((spec, i) => (
                      <p key={i}>{spec}</p>
                    ))}
                    {tier.finish && (
                      <p>{tier.finish}</p>
                    )}
                  </div>

                  {/* Diamond Quality & Carat Weight */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/50">
                    {tier.diamondQuality && (
                      <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                        {tier.diamondQuality}
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                      {tier.caratWeight}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    {tier.consultation ? (
                      <a
                        href="mailto:contact@phileonjewelry.com?subject=La%20Marva%20Consultation%20Request"
                        className="bg-[#C6A24A] text-black px-4 py-2 rounded-md font-semibold tracking-wide text-center text-sm"
                      >
                        Request Consultation
                      </a>
                    ) : (
                      <a
                        href="mailto:contact@phileonjewelry.com?subject=La%20Marva%20Purchase%20Inquiry"
                        className={[
                          "px-4 py-2 rounded-md font-semibold tracking-wide text-center text-sm",
                          tier.highlight
                            ? "bg-[#C6A24A] text-black"
                            : "border border-white/30 text-white",
                        ].join(" ")}
                      >
                        Inquire to Purchase
                      </a>
                    )}
                  </div>

                  {tier.isHeirloom && (
                    <p className="mt-3 text-white/50 text-xs tracking-wide">
                      Natural diamond pieces are crafted by consultation only. Pricing reflects estimated retail.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        }
        stickyOffset={36}
      />
    </div>
  );
}
