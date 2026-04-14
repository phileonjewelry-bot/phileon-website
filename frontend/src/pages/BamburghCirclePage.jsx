import { Link } from "react-router-dom";

const BAMBURGH_PAIR = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/o7aw7ju4_1000146386.png";
const BAMBURGH_IMG = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/q1n5n1fg_1000146370.png";
const LADY_BAMBURGH_IMG = "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ulu0v463_1000146371.png";

export default function BamburghCirclePage() {
  return (
    <div className="w-full bg-black text-white">

      {/* HERO */}
      <section className="w-full flex justify-center py-20">
        <div className="relative w-full max-w-[900px] px-4">
          <img
            src={BAMBURGH_PAIR}
            alt="Bamburgh Circle"
            className="w-full aspect-[4/5] object-cover rounded-[14px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-[14px]" />
          <div className="absolute left-6 bottom-10 md:left-12 md:bottom-14 max-w-[60%]">
            <p className="text-[10px] tracking-[0.35em] text-white/60 uppercase mb-3">
              Bamburgh Circle
            </p>
            <h1 className="text-3xl md:text-5xl leading-[1.05] mb-4">
              BAMBURGH
            </h1>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              For the ones who made it.<br />
              And the ones who made them better.
            </p>
            <p className="mt-4 text-white/70 text-sm tracking-wide">
              Enter Bamburgh &rarr;
            </p>
          </div>
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
      <section className="max-w-[1000px] mx-auto px-6 py-20 grid md:grid-cols-2 gap-10">

        <Link to="/products/bamburgh" className="group">
          <div className="relative rounded-[14px] overflow-hidden bg-[#0a0a0a]">
            <img
              src={BAMBURGH_IMG}
              alt="The Bamburgh"
              className="w-full aspect-square object-cover group-hover:scale-[1.03] transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="text-sm tracking-wide">THE BAMBURGH</p>
              <p className="text-white/70 text-sm mt-1">A monument, not jewelry.</p>
              <p className="mt-2 text-white/60 text-xs">Enter &rarr;</p>
            </div>
          </div>
        </Link>

        <Link to="/products/bamburgh" className="group">
          <div className="relative rounded-[14px] overflow-hidden bg-[#0a0a0a]">
            <img
              src={LADY_BAMBURGH_IMG}
              alt="Lady Bamburgh"
              className="w-full aspect-square object-cover group-hover:scale-[1.03] transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="text-sm tracking-wide">LADY BAMBURGH</p>
              <p className="text-white/70 text-sm mt-1">Command, in form.</p>
              <p className="mt-2 text-white/60 text-xs">Enter &rarr;</p>
            </div>
          </div>
        </Link>

      </section>

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
