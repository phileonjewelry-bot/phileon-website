import React from "react";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">

      {/* Background Hero Image */}
      <div className="absolute inset-0 h-full w-full">
        <img 
          src="https://images.unsplash.com/photo-1616837874254-8d5aaa63e273?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBqZXdlbHJ5fGVufDB8fHx8MTc3MzA5NjI1MHww&ixlib=rb-4.1.0&q=85&w=1920"
          alt="PHILEON Luxury Jewelry"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      
      {/* Optional: Video overlay if available */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/phileon-opener.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center px-6">

        {/* Headline */}
        <h1 className="text-3xl md:text-5xl text-white font-light leading-tight tracking-wide">
          Not jewelry.<br />
          Identity.
        </h1>

        {/* Campaign */}
        <p className="mt-5 text-[#C6A24A] text-xs md:text-sm tracking-[0.45em] uppercase bg-black/25 px-6 py-2 rounded-full backdrop-blur-sm">
          #GetYourPhileon
        </p>

        {/* Buttons */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row w-full max-w-xs sm:max-w-none sm:w-auto">

          <a
            href="/shop"
            className="w-full sm:w-auto bg-[#C6A24A] text-black px-8 py-4 rounded-md font-semibold tracking-wide text-center"
          >
            GET YOUR PHILEON
          </a>

          <a
            href="/custom"
            className="w-full sm:w-auto border border-white/60 text-white px-8 py-4 rounded-md font-semibold tracking-wide text-center"
          >
            CREATE YOUR PHILEON
          </a>

        </div>
      </div>
    </section>
  );
}
