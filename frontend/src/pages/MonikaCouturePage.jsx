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
            MONIKA COUTURE EARRINGS
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide">
            Monika Couture Earrings
          </h2>

          <p className="mt-6 text-white/60 leading-relaxed">
            A sculptural couture earring inspired by the architecture of high fashion.
          </p>

          <p className="mt-4 text-white/60 leading-relaxed">
            The Monika Couture design transforms the silhouette of a fashion heel into an open lattice structure that feels bold, elegant, and dramatic in movement. The airy mesh construction balances strength and lightness, creating a piece that captures runway attitude translated into statement jewelry.
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
            {/* Video */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:col-span-2">
              <video
                className="w-full h-[360px] md:h-[480px] object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/videos/monika-couture.mp4" type="video/mp4" />
              </video>
            </div>

            {/* On-ear gold */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/n57dc44j_1000139957.jpg"
                alt="Monika Couture worn in gold"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* All three metals */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/16wydipm_1000139955.jpg"
                alt="Monika Couture — Silver, Gold, Rose Gold"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* Silver pair */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/5zjvbk47_1000139953.jpg"
                alt="Monika Couture Silver"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* Rose Gold pair */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/jcswkfyo_1000139952.jpg"
                alt="Monika Couture Rose Gold"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* Yellow Gold pair */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:col-span-2">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/gqpaomuo_1000139951.jpg"
                alt="Monika Couture Yellow Gold"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* Packaging */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/s2t8dt8y_1000139942.jpg"
                alt="Monika Couture packaging"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* Detail shot */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/gjmyama0_1000139948.jpg"
                alt="Monika Couture detail"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* Lifestyle shot */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:col-span-2">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/ttzpwg0u_1000139962.jpg"
                alt="Monika Couture lifestyle"
                className="w-full h-[360px] md:h-[480px] object-cover"
              />
            </div>

            {/* Hero product shot */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:col-span-2">
              <img
                src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg"
                alt="Monika Couture Earrings — Silver, Gold, Rose Gold"
                className="w-full h-[360px] md:h-[520px] object-contain bg-black"
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

          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-white/70">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Silver</p>
              <p className="mt-3 text-white text-lg font-light">Sterling Silver</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <p className="text-white/50 text-xs tracking-[0.35em] uppercase">White Gold</p>
              <p className="mt-3 text-white text-lg font-light">10K White Gold</p>
            </div>
            <div className="rounded-xl border border-[#C6A24A]/40 bg-[#C6A24A]/10 p-5 text-center">
              <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Yellow Gold</p>
              <p className="mt-3 text-white text-lg font-light">10K Yellow Gold</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <p className="text-white/50 text-xs tracking-[0.35em] uppercase">Rose Gold</p>
              <p className="mt-3 text-white text-lg font-light">10K Rose Gold</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="/shop"
              className="bg-[#C6A24A] text-black px-8 py-4 rounded-md font-semibold tracking-wide text-center"
            >
              ADD TO CART
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
