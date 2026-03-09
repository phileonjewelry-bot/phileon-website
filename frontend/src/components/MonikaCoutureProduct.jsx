import React, { useState } from "react";

export default function MonikaCoutureProduct() {
  const metalOptions = [
    {
      name: "Silver — $1,400",
      value: "silver",
      image: "/products/monika-couture-silver.jpg",
    },
    {
      name: "10K White Gold — $3,700",
      value: "10k-white",
      image: "/products/monika-couture-white.jpg",
    },
    {
      name: "10K Yellow Gold — $3,700",
      value: "10k-yellow",
      image: "/products/monika-couture-yellow.jpg",
    },
    {
      name: "10K Rose Gold — $3,700",
      value: "10k-rose",
      image: "/products/monika-couture-rose.jpg",
    },
  ];

  const [selectedMetal, setSelectedMetal] = useState(metalOptions[2]);

  return (
    <section className="bg-black text-white py-16">
      <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        
        {/* Product Image */}
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <img
            src={selectedMetal.image}
            alt="Monika Couture Earrings"
            className="w-full h-auto object-cover transition-all duration-300"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl md:text-5xl font-light tracking-wide">
            MONIKA COUTURE EARRINGS
          </h1>

          <p className="mt-6 text-white/70 leading-relaxed">
            A sculptural couture earring inspired by the architecture of high fashion.
            The Monika Couture design transforms the silhouette of a fashion heel into
            an open lattice structure that feels bold, elegant, and dramatic in movement.
          </p>

          <p className="mt-4 text-white/60 text-sm">
            Weight: approximately 10 grams per pair.
          </p>

          {/* Metal Tabs */}
          <div className="mt-8 flex flex-col gap-3">
            <p className="text-white/50 text-xs tracking-[0.35em] uppercase">
              Select Metal
            </p>
            {metalOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedMetal(option)}
                className={[
                  "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200",
                  selectedMetal.value === option.value
                    ? "border-[#C6A24A]/70 bg-[#C6A24A]/10 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/25",
                ].join(" ")}
              >
                {option.name}
              </button>
            ))}
          </div>

          {/* Add to Cart */}
          <div className="mt-8">
            <a
              href="/shop"
              className="block w-full bg-[#C6A24A] text-black px-8 py-4 rounded-md font-semibold tracking-wide text-center"
            >
              ADD TO CART
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
