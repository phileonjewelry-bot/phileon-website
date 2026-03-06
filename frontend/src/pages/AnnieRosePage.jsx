import React from "react";

export default function AnnieRosePage() {
  return (
    <div className="bg-black text-white min-h-screen" data-testid="annie-rose-page">

      {/* Hero Image */}
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

      {/* Story */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide">
            Annie Rose
          </h2>

          <p className="mt-6 text-white/60 leading-relaxed">
            A signature silhouette engineered for presence. Choose your metal, choose your stones — and make it yours.
          </p>

          <p className="mt-4 text-white/60 leading-relaxed">
            Limited runs. Hand-finished. Built to be recognized.
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
            {/* Video 1 */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <video
                className="w-full h-[360px] md:h-[480px] object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/videos/annierose-1.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Video 2 */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <video
                className="w-full h-[360px] md:h-[480px] object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/videos/annierose-2.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Product image */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:col-span-2">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg"
                alt="Annie Rose detail"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Studio product shot */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/0yvpka9u_1000139046.png"
                alt="Annie Rose studio detail"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* Proposal moment */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/fw381q3d_1000139289.png"
                alt="Annie Rose proposal moment"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* On-hand lifestyle */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/1sukhrao_1000139284.png"
                alt="Annie Rose on hand"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* Close-up detail */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/kvn5m3ac_1000139303.jpg"
                alt="Annie Rose close-up"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* In box */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/urhdvrly_1000139305.jpg"
                alt="Annie Rose in presentation box"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* Evening event */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:col-span-2">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/g2ufvk37_1000139307.jpg"
                alt="Annie Rose at evening event"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Pricing */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
            Select Your Edition
          </p>
          <h2 className="mt-3 text-2xl md:text-4xl font-light tracking-wide">
            Choose your level
          </h2>

          <div className="mt-8 flex items-baseline gap-3">
            <p className="text-white/70 text-sm tracking-wide">Starting at</p>
            <p className="text-3xl md:text-4xl font-light">
              $1,250
            </p>
            <p className="text-white/50 text-sm">CAD</p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4 text-sm text-white/70">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Metals</p>
              <p className="mt-2">Silver &middot; 10K &middot; 14K &middot; 18K</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Stones</p>
              <p className="mt-2">Cubic &middot; Lab &middot; Natural</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="/shop"
              className="bg-[#C6A24A] text-black px-8 py-4 rounded-md font-semibold tracking-wide text-center"
            >
              SHOP THIS DROP
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
