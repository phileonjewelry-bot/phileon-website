import React from "react";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/phileon-opener-poster.jpg"
      >
        <source src="/videos/phileon-opener.webm" type="video/webm" />
        <source src="/videos/phileon-opener.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl md:text-7xl tracking-[0.35em] text-white font-light">
          PHILEON
        </h1>

        <p className="mt-6 max-w-xl text-lg text-white/80">
          Crafted for presence.
        </p>

        {/* Hybrid CTAs */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/shop"
            className="rounded-md bg-[#C6A24A] px-8 py-3 font-semibold tracking-wide text-black"
            data-testid="hero-shop-btn"
          >
            SHOP DROP
          </a>

          <a
            href="/custom"
            className="rounded-md border border-white/70 px-8 py-3 font-semibold tracking-wide text-white"
            data-testid="hero-custom-btn"
          >
            CREATE YOUR PHILEON
          </a>
        </div>
      </div>
    </section>
  );
}
