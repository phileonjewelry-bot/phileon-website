import React from "react";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">

      {/* Background Video or Image */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src="/videos/phileon-opener.mp4"
          type="video/mp4"
        />
      </video>

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center px-6">

        {/* Message (NO duplicate PHILEON) */}
        <h1 className="text-3xl md:text-5xl text-white font-light tracking-wide">
          Not jewelry. Identity.
        </h1>

        {/* Campaign Tag */}
        <p className="mt-4 bg-black/40 px-5 py-2 rounded-full text-[#C6A24A] text-xs md:text-sm tracking-[0.4em] uppercase">
          #GetYourPhileon
        </p>

        {/* Hybrid CTAs */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">

          <a
            href="/shop"
            className="bg-[#C6A24A] text-black px-8 py-3 rounded-md font-semibold tracking-wide"
          >
            GET YOUR PHILEON
          </a>

          <a
            href="/custom"
            className="border border-white/70 text-white px-8 py-3 rounded-md font-semibold tracking-wide"
          >
            CREATE YOUR PHILEON
          </a>

        </div>
      </div>
    </section>
  );
}
