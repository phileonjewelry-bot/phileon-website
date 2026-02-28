import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ==========================================
// PRICING ENGINE
// Baseline gold price when retail was set.
// If gold moves > 5%, prices scale proportionally.
// Otherwise, hold.
// ==========================================
const BASELINE_GOLD_USD = 2650; // USD/oz when prices were locked

const BASE_TIERS = [
  {
    name: "Foundation Edition",
    material: "10K Gold + lab-grown stones",
    basePrice: 10500,
    tag: "Most Popular",
    highlight: true,
    isHeirloom: false,
    consultation: false,
    specs: [
      "Lab-grown princess-cut center diamonds",
      "Lab-grown emerald-cut side diamonds",
      "Genuine pink sapphire pavé",
    ],
    finish: null,
    caratWeight: "Approx. 3.8 – 4.5 carats",
    diamondQuality: "VS clarity, F–G color",
    note: "Modern fine jewelry with ethical sourcing and premium brilliance.",
  },
  {
    name: "Signature Edition",
    material: "Silver + precision-set stones",
    basePrice: 3800,
    tag: "",
    highlight: false,
    isHeirloom: false,
    consultation: false,
    specs: [
      "Precision-cut simulated center stones",
      "Synthetic pink sapphire pavé",
    ],
    finish: "High-polish luxury finish",
    caratWeight: "Approx. 2.8 – 3.2 carats (simulated)",
    diamondQuality: null,
    note: "Entry luxury with the full La Marva design aesthetic.",
  },
  {
    name: "Heirloom Edition (14K)",
    material: "14K Gold + natural diamonds",
    basePrice: 49500,
    tag: "Atelier",
    highlight: false,
    isHeirloom: true,
    consultation: true,
    specs: [
      "Natural princess-cut center diamonds",
      "Natural emerald-cut side diamonds",
      "Pink sapphire and natural diamond pavé",
    ],
    finish: null,
    caratWeight: "Approx. 4.5 – 5.5 carats",
    diamondQuality: "VS clarity, E–F color",
    note: "Collector-grade luxury with exceptional color and brilliance.",
  },
  {
    name: "Heirloom Edition (18K)",
    material: "18K Gold + natural diamonds",
    basePrice: 58000,
    tag: "Atelier",
    highlight: false,
    isHeirloom: true,
    consultation: true,
    specs: [
      "Natural princess-cut center diamonds",
      "Natural emerald-cut side diamonds",
      "Pink sapphire and natural diamond pavé",
    ],
    finish: null,
    caratWeight: "Approx. 4.5 – 5.5 carats",
    diamondQuality: "VS clarity, E–F color",
    note: "Collector-grade luxury with exceptional color and brilliance.",
  },
];

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

  return (
    <div className="bg-black text-white min-h-screen" data-testid="la-marva-page">

      {/* Hero Image */}
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

      {/* Story */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide">
            La Marva
          </h2>

          <p className="mt-6 text-white/60 leading-relaxed">
            La Marva is named in honor of a woman whose strength, grace, and quiet presence left a lasting imprint.
          </p>

          <p className="mt-4 text-white/60 leading-relaxed">
            Created as a tribute to legacy and devotion, the design reflects both structure and softness — a balance of power, elegance, and enduring beauty.
          </p>

          <p className="mt-4 text-white/60 leading-relaxed">
            Each piece is crafted to order and intended to be worn as a symbol of what matters most: love, memory, and the stories that shape us.
          </p>

          <p className="mt-6 text-[#C6A24A] text-sm tracking-[0.4em] uppercase">
            #GetYourPhileon
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
            Select Your Edition
          </p>
          <h2 className="mt-3 text-2xl md:text-4xl font-light tracking-wide">
            Choose your level
          </h2>
          <p className="mt-4 text-white/60 text-sm leading-relaxed max-w-2xl">
            Each edition preserves the full La Marva design. Materials and craftsmanship vary to suit different preferences while maintaining the integrity of the original form.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={[
                  "rounded-2xl border p-5 transition",
                  tier.highlight
                    ? "border-[#C6A24A]/70 bg-[#C6A24A]/10"
                    : "border-white/10 bg-white/5",
                ].join(" ")}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs tracking-[0.35em] uppercase text-white/60">
                      {tier.name}
                      {tier.tag && (
                        <span className="ml-2 text-[#C6A24A] normal-case tracking-normal">
                          — {tier.tag}
                        </span>
                      )}
                    </p>

                    <h3 className="mt-2 text-lg md:text-2xl font-light">
                      {tier.material}
                    </h3>

                    <p className="mt-2 text-white/60 text-sm">
                      {tier.consultation ? "Available by consultation" : tier.note}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-white/50">
                      {tier.isHeirloom ? "By consultation" : "Retail"}
                    </p>

                    {!tier.isHeirloom ? (
                      <p className="text-xl md:text-3xl font-light">
                        {tier.price}
                        <span className="ml-1 text-xs md:text-sm text-white/50">CAD</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-sm md:text-xl font-light text-white/80">
                        Consultation required
                      </p>
                    )}
                  </div>
                </div>

                {/* Materials */}
                <div className="mt-4 text-sm text-white/60 space-y-1">
                  {tier.specs.map((spec, i) => (
                    <p key={i}>{spec}</p>
                  ))}
                  {tier.finish && (
                    <p>{tier.finish}</p>
                  )}
                </div>

                {/* Diamond Quality & Carat Weight */}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/50">
                  {tier.diamondQuality && (
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
                      {tier.diamondQuality}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
                    {tier.caratWeight}
                  </span>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  {!tier.isHeirloom ? (
                    <>
                      <a
                        href="/shop"
                        className={[
                          "px-6 py-3 rounded-md font-semibold tracking-wide text-center",
                          tier.highlight
                            ? "bg-[#C6A24A] text-black"
                            : "border border-white/30 text-white",
                        ].join(" ")}
                      >
                        Select
                      </a>

                      <a
                        href="/custom"
                        className="px-6 py-3 rounded-md font-semibold tracking-wide text-center border border-white/20 text-white/90"
                      >
                        Select finger size
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        href="/custom"
                        className="bg-[#C6A24A] text-black px-6 py-3 rounded-md font-semibold tracking-wide text-center"
                      >
                        Request Consultation
                      </a>

                      <a
                        href="/custom"
                        className="px-6 py-3 rounded-md font-semibold tracking-wide text-center border border-white/30 text-white"
                      >
                        Speak to Atelier
                      </a>
                    </>
                  )}
                </div>

                {tier.isHeirloom && (
                  <p className="mt-4 text-white/50 text-xs tracking-wide">
                    Natural diamond pieces are crafted by consultation only. Pricing reflects estimated retail.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
