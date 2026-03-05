import React from "react";
import { Link } from "react-router-dom";

export default function FeaturedDrop() {
  return (
    <section className="bg-black text-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
              Featured Drop
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-light tracking-wide">
              The Statement Piece
            </h2>
            <p className="mt-4 text-white/70 max-w-xl">
              Limited runs. Hand-finished. Built to be recognized.
            </p>
          </div>

          <a
            href="/shop"
            className="hidden sm:inline-flex border border-white/25 px-5 py-2 rounded-md text-sm tracking-wide hover:border-white/50 transition"
          >
            View All
          </a>
        </div>

        {/* Card */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <Link to="/products/annie-rose" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 block">
            <img
              src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg"
              alt="Annie Rose — Phileon Featured Drop"
              className="h-[360px] md:h-[520px] w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <p className="text-lg tracking-[0.3em] uppercase text-white font-light">
                Annie Rose
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-black/40 border border-white/15">
                Limited
              </span>
            </div>
          </Link>

          {/* Copy */}
          <div>
            <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
              Drop 001
            </p>

            <h3 className="mt-3 text-3xl md:text-5xl font-light tracking-wide leading-tight">
              ANNIE ROSE
            </h3>

            <p className="mt-5 text-white/70 leading-relaxed">
              A signature silhouette engineered for presence. Choose your metal,
              choose your stones — and make it yours.
            </p>

            {/* Pricing */}
            <div className="mt-8 flex items-baseline gap-3">
              <p className="text-white/70 text-sm tracking-wide">Starting at</p>
              <p className="text-3xl md:text-4xl font-light">
                $1,250
              </p>
              <p className="text-white/50 text-sm">
                CAD
              </p>
            </div>

            {/* Specs */}
            <div className="mt-7 grid grid-cols-2 gap-4 text-sm text-white/70">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-white/50 text-xs tracking-[0.35em] uppercase">
                  Metals
                </p>
                <p className="mt-2">Silver • 10K • 14K • 18K</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-white/50 text-xs tracking-[0.35em] uppercase">
                  Stones
                </p>
                <p className="mt-2">Cubic • Lab • Natural</p>
              </div>
            </div>

            {/* CTAs */}
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

            <a
              href="/shop"
              className="mt-6 inline-flex sm:hidden border border-white/25 px-5 py-2 rounded-md text-sm tracking-wide"
            >
              View All
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
