import React from "react";
import { Link } from "react-router-dom";

export default function MonikaCoutureDrop() {
  return (
    <section className="bg-black text-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <Link
          to="/products/monika-couture"
          className="group block relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          data-testid="monika-couture-card"
        >
          <img
            src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg"
            alt="The Monika Couture Earrings"
            className="w-full h-[480px] md:h-[600px] object-contain bg-black transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-3xl md:text-5xl font-light tracking-wide">
              MONIKA COUTURE EARRINGS
            </h2>
          </div>
        </Link>
      </div>
    </section>
  );
}
