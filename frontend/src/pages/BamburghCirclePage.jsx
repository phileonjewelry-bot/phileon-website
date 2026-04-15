import { Link } from "react-router-dom";
import BamburghCollective from "@/components/BamburghCollective";

const BAMBURGH_PAIR = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/o7aw7ju4_1000146386.png";
const BAMBURGH_IMG = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/q1n5n1fg_1000146370.png";
const LADY_BAMBURGH_IMG = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ulu0v463_1000146371.png";

export default function BamburghCirclePage() {
  return (
    <div className="w-full bg-black text-white">

      {/* HERO */}
      <section className="relative h-[90vh] w-full overflow-hidden bg-black">
        <img
          src="https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/f48bt147_1000146368.png"
          alt="Bamburgh Ring"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 35%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full px-6 pb-12 md:px-12 md:pb-16">
          <p className="text-white/60 tracking-[0.35em] text-[11px] mb-3">
            BAMBURGH CIRCLE
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-serif tracking-wide mb-4">
            BAMBURGH
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-md leading-relaxed mb-6">
            For the ones who made it.<br />
            And the ones who made them better.
          </p>
          <Link
            to="/products/the-bamburgh"
            className="inline-flex items-center text-white text-sm tracking-wide border-b border-white/30 pb-1 hover:opacity-70 transition"
          >
            Enter Bamburgh &rarr;
          </Link>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="max-w-[800px] mx-auto px-6 py-16 text-center">
        <p className="text-lg md:text-xl leading-relaxed text-white/90">
          Built where we started.<br />
          Refined by who we became.
        </p>
        <p className="mt-8 text-white/70 leading-relaxed">
          Bamburgh isn&rsquo;t a place you pass through.<br />
          It&rsquo;s a place you carry.
        </p>
      </section>

      {/* THE CIRCLE */}
      <section className="max-w-[700px] mx-auto px-6 py-20 text-center">
        <p className="text-white/80 leading-relaxed mb-6">
          The Bamburgh Circle isn&rsquo;t open.
        </p>
        <p className="text-white/70 leading-relaxed">
          It&rsquo;s not applied for.<br />
          It&rsquo;s not given.<br /><br />
          It&rsquo;s earned.<br /><br />
          Through pressure.<br />
          Through growth.<br />
          Through becoming.
        </p>
      </section>

      {/* PRODUCTS */}
      <BamburghCollective />

      {/* EXIT */}
      <section className="text-center py-24">
        <p className="text-white/80 text-lg mb-4">
          Carry it forward.
        </p>
        <p className="text-white/50 tracking-[0.3em] text-sm">
          PHILEON
        </p>
      </section>

    </div>
  );
}
