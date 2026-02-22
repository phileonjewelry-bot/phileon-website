import React from "react";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/phileon-opener.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl md:text-7xl tracking-[0.35em] text-white font-light">
          PHILEON
        </h1>

        <p className="mt-6 text-white/80 text-lg">
          Crafted for presence.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/shop"
            className="bg-[#C6A24A] text-black px-8 py-3 rounded-md font-semibold"
          >
            SHOP DROP
          </a>

          <a
            href="/custom"
            className="border border-white/70 text-white px-8 py-3 rounded-md font-semibold"
          >
            CREATE YOUR PHILEON
          </a>
        </div>
      </div>
    </section>
  );
}
