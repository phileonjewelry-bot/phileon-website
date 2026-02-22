import React from "react";

export default function LaMarvaDrop() {
  const TIERS = [
    {
      name: "Foundation",
      material: "Silver + Cubic",
      price: "$895",
      note: "Entry into the collection",
      highlight: false,
    },
    {
      name: "Signature",
      material: "10K / 14K + Lab",
      price: "$1,850",
      note: "Most popular",
      highlight: true,
    },
    {
      name: "Prestige",
      material: "14K / 18K + Natural",
      price: "$3,450",
      note: "Flagship level",
      highlight: false,
    },
  ];

  return (
    <section className="bg-black text-white py-16">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
          Tiered Collection
        </p>

        <h2 className="mt-3 text-3xl md:text-5xl font-light tracking-wide">
          LA MARVA
        </h2>

        <p className="mt-6 text-white/70 max-w-2xl leading-relaxed">
          Built on strength. Designed with grace.
        </p>

        <p className="mt-4 text-white/50 max-w-2xl leading-relaxed text-sm">
          La Marva is named in honor of my mother — a woman whose strength, resilience, and quiet confidence shaped who I am.
          She carries power without force and presence without noise. This piece reflects that same balance.
          A structured grid of precision-set stones represents strength and stability, while the flowing pavé band adds warmth, elegance, and movement.
        </p>

        <p className="mt-4 text-white/60 max-w-2xl leading-relaxed text-sm italic">
          La Marva is not delicate. It is composed. Grounded. Intentional.
        </p>

        <p className="mt-4 text-white/50 max-w-2xl leading-relaxed text-sm">
          More than a design, this piece represents the strength behind the name — and the foundation it was built on.
        </p>

        {/* Layout */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* Product Image */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img
              src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg"
              alt="Phileon La Marva Ring"
              className="w-full h-[420px] md:h-[520px] object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
              <p className="text-xs tracking-[0.4em] uppercase text-white/80">
                #GetYourPhileon
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-black/40 border border-white/20">
                Core Collection
              </span>
            </div>
          </div>

          {/* Tier Cards */}
          <div>
            <p className="text-white/60 text-sm tracking-wide">
              Choose your level
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4">
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
                  <div className="flex justify-between items-start gap-6">
                    <div>
                      <p className="text-xs tracking-[0.35em] uppercase text-white/60">
                        {tier.name}
                      </p>

                      <h3 className="mt-2 text-xl md:text-2xl font-light">
                        {tier.material}
                      </h3>

                      <p className="mt-2 text-white/60 text-sm">
                        {tier.note}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-white/50">From</p>
                      <p className="text-2xl md:text-3xl font-light">
                        {tier.price}
                        <span className="ml-2 text-sm text-white/50">CAD</span>
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <a
                      href="/shop"
                      className={[
                        "px-6 py-3 rounded-md font-semibold tracking-wide text-center",
                        tier.highlight
                          ? "bg-[#C6A24A] text-black"
                          : "border border-white/30 text-white",
                      ].join(" ")}
                    >
                      Select {tier.name}
                    </a>

                    <a
                      href="/custom"
                      className="px-6 py-3 rounded-md font-semibold tracking-wide text-center border border-white/20 text-white/70 hover:border-white/40 transition"
                    >
                      Customize
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
