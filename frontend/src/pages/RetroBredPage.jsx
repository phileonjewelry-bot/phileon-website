import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// RETRO BRED — DREW'S VAULT · LIMITED RELEASE
// Inquiry-only collectible. No Add-to-Cart. No trusted checkout wiring.
const IMG_HERO   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/g0vtj6qb_1000170753.png";
const IMG_ANGLE  = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/74o3ydwm_1000170618.png";
const IMG_DEPTH  = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/wbk8eyb7_1000170754.png";
const IMG_JUMP   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/1g1vg86d_1000170620.png";
const IMG_TRI    = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/8odwy75b_1000170617.png";

const MARQUEE = [
  "DREW'S VAULT", "LIMITED RELEASE", "295 STONES",
  "BLACK & WHITE DIAMOND PAVÉ", "RUBY DETAIL", "45 MM",
  "COLLECTIBLE OBJECT", "ONE OF FEW",
];

const METALS = ["Rhodium-Plated Sterling Silver", "White Gold", "Yellow Gold"];
const LENGTHS = ["20\"", "22\"", "24\""];

export default function RetroBredPage() {
  const [metal, setMetal] = React.useState(METALS[0]);
  const [length, setLength] = React.useState(LENGTHS[1]);

  return (
    <div className="min-h-screen bg-black text-white" data-testid="retro-bred-page">
      {/* Marquee */}
      <div className="border-y border-white/10 overflow-hidden">
        <div className="flex gap-10 py-3 whitespace-nowrap animate-[marquee_38s_linear_infinite]">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="text-[10px] tracking-[0.42em] text-white/45">{t}</span>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-8 pb-24">
        <Link to="/drews-vault" className="inline-flex items-center gap-2 text-[9px] tracking-[0.42em] text-white/40 hover:text-white/80 uppercase" data-testid="retro-bred-back">
          <ArrowLeft size={14} /> Drew's Vault
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr,1fr] gap-14 mt-10">
          {/* Left — Hero */}
          <div>
            <div className="relative bg-black border border-white/[0.06] rounded-[2px] overflow-hidden">
              <img src={IMG_HERO} alt="RETRO BRED pendant on chain" loading="eager" className="w-full h-auto object-contain" data-testid="retro-bred-hero" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <img src={IMG_ANGLE} alt="Angle" loading="lazy" className="w-full h-auto object-contain bg-black border border-white/[0.06] rounded-[2px]" />
              <img src={IMG_DEPTH} alt="Depth" loading="lazy" className="w-full h-auto object-contain bg-black border border-white/[0.06] rounded-[2px]" />
              <img src={IMG_JUMP} alt="Jumpman ruby detail" loading="lazy" className="w-full h-auto object-contain bg-black border border-white/[0.06] rounded-[2px]" />
              <img src={IMG_TRI} alt="Pavé triangle detail" loading="lazy" className="w-full h-auto object-contain bg-black border border-white/[0.06] rounded-[2px]" />
            </div>
          </div>

          {/* Right — Editorial */}
          <div className="pt-2">
            <p className="text-[10px] tracking-[0.42em] text-white/45 uppercase" data-testid="retro-bred-eyebrow">
              DREW'S VAULT · LIMITED RELEASE
            </p>
            <h1 className="text-[42px] md:text-[54px] leading-[0.98] tracking-[0.01em] font-light text-white/95 mt-3" data-testid="retro-bred-title">
              RETRO <span className="text-[#d21b3d]">BRED</span>
            </h1>
            <p className="text-white/70 text-[16px] leading-relaxed mt-4 max-w-[540px]" data-testid="retro-bred-subline">
              The sole that built a religion, recast in stone.
            </p>
            <p className="text-white/45 text-[13px] mt-2 max-w-[540px]">
              Rubber wears down. Stone doesn't.
            </p>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-[9px] tracking-[0.42em] text-white/35 uppercase">Specifications</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                <div><dt className="text-white/40">Pendant</dt><dd className="text-white/85">45 mm × 18 mm</dd></div>
                <div><dt className="text-white/40">Total Stones</dt><dd className="text-white/85">295</dd></div>
                <div><dt className="text-white/40">Black Diamonds</dt><dd className="text-white/85">120 · 1.0–1.5 mm</dd></div>
                <div><dt className="text-white/40">White Diamonds</dt><dd className="text-white/85">150 · 1.0–1.5 mm</dd></div>
                <div><dt className="text-white/40">Rubies</dt><dd className="text-white/85">25 · 1.0–1.2 mm</dd></div>
                <div><dt className="text-white/40">Default Metal</dt><dd className="text-white/85">Rhodium-Plated Sterling Silver</dd></div>
              </dl>
            </div>

            {/* Inquiry selectors — captured for inquiry only, no pricing */}
            <div className="mt-10">
              <p className="text-[9px] tracking-[0.42em] text-white/35 uppercase">Metal</p>
              <div className="grid gap-2 mt-3">
                {METALS.map((m) => (
                  <button key={m} onClick={() => setMetal(m)}
                    className={`text-left px-4 py-3 border rounded-[2px] transition-colors ${metal === m ? "border-white/50 bg-white/[0.04] text-white/95" : "border-white/12 text-white/65 hover:border-white/30"}`}
                    data-testid={`retro-bred-metal-${m.toLowerCase().replace(/\W+/g, "-")}`}>
                    <span className="text-[13px] tracking-[0.02em]">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[9px] tracking-[0.42em] text-white/35 uppercase">Chain Length</p>
              <div className="flex gap-2 mt-3">
                {LENGTHS.map((L) => (
                  <button key={L} onClick={() => setLength(L)}
                    className={`px-5 py-3 border rounded-[2px] text-[13px] transition-colors ${length === L ? "border-white/50 bg-white/[0.04] text-white/95" : "border-white/12 text-white/65 hover:border-white/30"}`}
                    data-testid={`retro-bred-length-${L.replace(/\W+/g, "")}`}>
                    {L}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquiry CTA */}
            <a
              href={`mailto:atelier@phileon.com?subject=RETRO%20BRED%20-%20DREW%27S%20VAULT%20Inquiry&body=Metal:%20${encodeURIComponent(metal)}%0AChain:%20${encodeURIComponent(length)}%0A%0AI%20would%20like%20to%20inquire%20about%20RETRO%20BRED.`}
              className="mt-10 block w-full text-center bg-white text-black rounded-[2px] py-4 text-[10px] tracking-[0.28em] font-medium hover:bg-white/92 transition-colors"
              data-testid="retro-bred-inquire-cta"
            >
              INQUIRE — LIMITED RELEASE
            </a>
            <p className="text-white/40 text-[11px] mt-3 leading-relaxed">
              Once this run closes, it is not automatically recast.
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}`}</style>
    </div>
  );
}
