import React from "react";

const TIERS = [
  {
    name: "Foundation — Essential Edition",
    material: "10K Gold",
    price: "$3,400",
    note: "Entry luxury with the full La Marva design aesthetic.",
    highlight: false,
    isHeirloom: false,
    specs: [
      "Precision-cut simulated center stones",
      "Synthetic pink sapphire pavé",
    ],
    finish: "High-polish luxury finish",
    caratWeight: "Approx. 2.8 – 3.2 carats (simulated)",
    diamondQuality: null,
  },
  {
    name: "Signature — Lab Diamond Edition",
    material: "14K Gold",
    price: "$5,200",
    note: "Modern fine jewelry with ethical sourcing and premium brilliance.",
    highlight: true,
    isHeirloom: false,
    specs: [
      "Lab-grown princess-cut center diamonds",
      "Lab-grown emerald-cut side diamonds",
      "Genuine pink sapphire pavé",
    ],
    finish: null,
    caratWeight: "Approx. 3.8 – 4.5 carats",
    diamondQuality: "VS clarity, F–G color",
  },
  {
    name: "Heirloom — Natural Diamond Edition (14K)",
    material: "14K Gold",
    price: "$56,000",
    note: "Collector-grade luxury with exceptional color and brilliance.",
    highlight: false,
    isHeirloom: true,
    specs: [
      "Natural princess-cut center diamonds",
      "Natural emerald-cut side diamonds",
      "Pink sapphire and natural diamond pavé",
    ],
    finish: null,
    caratWeight: "Approx. 4.5 – 5.5 carats",
    diamondQuality: "VS clarity, E–F color",
  },
  {
    name: "Heirloom — Natural Diamond Edition (18K)",
    material: "18K Gold",
    price: "$58,000",
    note: "Collector-grade luxury with exceptional color and brilliance.",
    highlight: false,
    isHeirloom: true,
    specs: [
      "Natural princess-cut center diamonds",
      "Natural emerald-cut side diamonds",
      "Pink sapphire and natural diamond pavé",
    ],
    finish: null,
    caratWeight: "Approx. 4.5 – 5.5 carats",
    diamondQuality: "VS clarity, E–F color",
  },
];

export default function LaMarvaPage() {
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
            Tiered Collection
          </p>
          <h2 className="mt-3 text-2xl md:text-4xl font-light tracking-wide">
            Choose your level
          </h2>

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
                    </p>

                    <h3 className="mt-2 text-lg md:text-2xl font-light">
                      {tier.material}
                    </h3>

                    <p className="mt-2 text-white/60 text-sm">
                      {tier.note}
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
