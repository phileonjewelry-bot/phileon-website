import React from "react";

export default function MonikaCouturePage() {
  return (
    <div className="bg-black text-white min-h-screen" data-testid="monika-couture-page">

      {/* Hero Image */}
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
            THE MONIKA COUTURE
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide">
            The Monika Couture Earrings
          </h2>

          <p className="mt-6 text-white/60 leading-relaxed">
            Inspired by the architecture of haute couture — a woven lattice silhouette shaped like a stiletto heel, reimagined as a statement earring.
          </p>

          <p className="mt-4 text-white/60 leading-relaxed">
            Available in Silver, Gold, and Rose Gold. Each pair is crafted to order.
          </p>

          <p className="mt-6 text-[#C6A24A] text-sm tracking-[0.4em] uppercase">
            #GetYourPhileon
          </p>
        </div>
      </section>

      {/* Media Gallery */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
            Up Close
          </p>
          <h2 className="mt-3 text-2xl md:text-4xl font-light tracking-wide">
            See the craft
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:col-span-2">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg"
                alt="Monika Couture Earrings — Silver, Gold, Rose Gold"
                className="w-full h-[360px] md:h-[520px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
            Available Options
          </p>
          <h2 className="mt-3 text-2xl md:text-4xl font-light tracking-wide">
            Choose your metal
          </h2>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/70">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Silver</p>
              <p className="mt-3 text-white text-lg font-light">Sterling Silver</p>
            </div>
            <div className="rounded-xl border border-[#C6A24A]/40 bg-[#C6A24A]/10 p-5 text-center">
              <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Gold</p>
              <p className="mt-3 text-white text-lg font-light">10K / 14K Gold</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Rose Gold</p>
              <p className="mt-3 text-white text-lg font-light">10K / 14K Rose Gold</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="/shop"
              className="bg-[#C6A24A] text-black px-8 py-4 rounded-md font-semibold tracking-wide text-center"
            >
              ADD TO CART
            </a>
            <a
              href="/custom"
              className="border border-white/50 text-white px-8 py-4 rounded-md font-semibold tracking-wide text-center"
            >
              CUSTOMIZE IT
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
