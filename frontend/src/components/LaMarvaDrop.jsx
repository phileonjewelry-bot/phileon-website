import React from "react";
import { Link } from "react-router-dom";

export default function LaMarvaDrop() {
  return (
    <section className="bg-black text-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <Link
          to="/products/la-marva"
          className="group block relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          data-testid="la-marva-card"
        >
          <img
            src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg"
            alt="Phileon La Marva Ring"
            className="w-full h-[480px] md:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide">
              LA MARVA
            </h2>
          </div>
        </Link>
      </div>
    </section>
  );
}
