import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

// RETRO BRED — DREW'S VAULT · PRIVATE RELEASE
// Private CAD collectible. Access-gated: only reachable after the customer
// unlocks Drew's Vault via the /secret-drop passphrase experience.
// No third-party brand names ANYWHERE. Robots noindex/nofollow.
const IMG_HERO  = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/g0vtj6qb_1000170753.png";
const IMG_ANGLE = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/74o3ydwm_1000170618.png";
const IMG_DEPTH = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/wbk8eyb7_1000170754.png";
const IMG_FIG   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/1g1vg86d_1000170620.png";
const IMG_TRI   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/8odwy75b_1000170617.png";

const MARQUEE = [
  "DREW'S VAULT", "PRIVATE RELEASE", "293 STONES",
  "BLACK & WHITE PAVÉ", "RUBY-SET CENTRAL FIGURE", "45 × 18 MM",
  "LIMITED RUN", "ONE OF FEW",
];

const TIERS = [
  { key: "foundation", name: "FOUNDATION", metal: "Sterling Silver", stones: "Synthetic Stones", price: 5995, most: false },
  { key: "signature",  name: "SIGNATURE",  metal: "10K Gold",        stones: "Lab-Grown Stones", price: 10495, most: true  },
  { key: "heirloom",   name: "HEIRLOOM",   metal: "14K Gold",        stones: "Lab-Grown Stones", price: 11795, most: false },
];
const CHAIN_LENGTHS = ["20\"", "22\"", "24\""];

// Vault-unlock check — reuses the existing /secret-drop unlock event.
function isVaultUnlocked() {
  try {
    const events = JSON.parse(localStorage.getItem("phileon_events") || "[]");
    return events.some((e) => e && e.type === "unlock_success");
  } catch (_e) { return false; }
}

// noindex/nofollow — inject at mount, clean up on unmount.
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = "Private Release · PHILEON";
    return () => { document.head.removeChild(meta); document.title = prevTitle; };
  }, []);
}

export default function RetroBredPage() {
  useNoIndex();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [tierKey, setTierKey] = useState("signature");
  const [chain, setChain] = useState(CHAIN_LENGTHS[1]);

  // Access gate — redirect unlocked=false visitors to /secret-drop.
  useEffect(() => {
    if (!isVaultUnlocked()) {
      const t = setTimeout(() => navigate("/secret-drop", { replace: true }), 150);
      return () => clearTimeout(t);
    }
  }, [navigate]);

  if (!isVaultUnlocked()) {
    return (
      <div className="min-h-screen bg-black text-white/50 flex items-center justify-center text-[10px] tracking-[0.42em]" data-testid="retro-bred-locked-notice">
        VAULT ACCESS REQUIRED
      </div>
    );
  }

  const currentTier = TIERS.find((t) => t.key === tierKey);

  const handleAddToCart = () => {
    addToCart({
      id: `retro-bred-${tierKey}`,
      name: `RETRO BRED — ${currentTier.name} · ${currentTier.metal}`,
      image: IMG_HERO,
      price: currentTier.price,
      currency: "CAD",
      productKey: "retro-bred",
      slug: "retro-bred",
      tierKey,
      // Backend field mapping — resolves via FIXED_PRODUCTS entry.
      materials: [currentTier.metal, currentTier.stones],
      sku: `RB-${currentTier.key === "foundation" ? "FND-925" : currentTier.key === "signature" ? "SIG-10K" : "HRL-14K"}`,
    }, 1, `${currentTier.name} · ${currentTier.metal}`);
  };

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
          {/* Left — Editorial imagery */}
          <div>
            <div className="relative bg-black border border-white/[0.06] rounded-[2px] overflow-hidden">
              <img src={IMG_HERO} alt="RETRO BRED pavé pendant front view" loading="eager" className="w-full h-auto object-contain" data-testid="retro-bred-hero" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <img src={IMG_ANGLE} alt="RETRO BRED pendant angle view" loading="lazy" className="w-full h-auto object-contain bg-black border border-white/[0.06] rounded-[2px]" />
              <img src={IMG_DEPTH} alt="RETRO BRED depth and setting" loading="lazy" className="w-full h-auto object-contain bg-black border border-white/[0.06] rounded-[2px]" />
              <img src={IMG_FIG} alt="Macro detail of ruby-set central silhouette" loading="lazy" className="w-full h-auto object-contain bg-black border border-white/[0.06] rounded-[2px]" />
              <img src={IMG_TRI} alt="Black and white pavé detail" loading="lazy" className="w-full h-auto object-contain bg-black border border-white/[0.06] rounded-[2px]" />
            </div>
          </div>

          {/* Right — Editorial + Purchase panel */}
          <div className="pt-2">
            <p className="text-[10px] tracking-[0.42em] text-white/45 uppercase" data-testid="retro-bred-eyebrow">
              DREW'S VAULT · PRIVATE RELEASE
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
            <p className="text-white/55 text-[13px] mt-4 max-w-[540px] leading-relaxed">
              A familiar court-era silhouette, reconstructed as a PHILEON collectible.
            </p>

            {/* Central figure section */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-[10px] tracking-[0.42em] text-white/45 uppercase">One Silhouette, Cut in Ruby</p>
              <p className="text-white/60 text-[13px] mt-2 leading-relaxed max-w-[520px]">
                The only warm note on the piece — a ruby-set figure suspended against the black pavé field.
              </p>
            </div>

            {/* Specs */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-[9px] tracking-[0.42em] text-white/35 uppercase">Specifications</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                <div><dt className="text-white/40">Pendant Body</dt><dd className="text-white/85">45 mm × 18 mm</dd></div>
                <div><dt className="text-white/40">Thickness</dt><dd className="text-white/85">4.5 mm</dd></div>
                <div><dt className="text-white/40">Finished Weight (Silver)</dt><dd className="text-white/85">~12.5 g</dd></div>
                <div><dt className="text-white/40">Total Stones</dt><dd className="text-white/85">293</dd></div>
                <div><dt className="text-white/40">Black Stones</dt><dd className="text-white/85">120</dd></div>
                <div><dt className="text-white/40">White Stones</dt><dd className="text-white/85">150</dd></div>
                <div><dt className="text-white/40">Rubies</dt><dd className="text-white/85">23</dd></div>
              </dl>
            </div>

            {/* Tier selector — 3 approved variants */}
            <div className="mt-10">
              <p className="text-[9px] tracking-[0.42em] text-white/35 uppercase">Select Tier</p>
              <div className="grid gap-2 mt-3">
                {TIERS.map((t) => (
                  <button key={t.key} onClick={() => setTierKey(t.key)}
                    className={`text-left px-4 py-4 border rounded-[2px] transition-colors ${tierKey === t.key ? "border-white/50 bg-white/[0.04] text-white/95" : "border-white/12 text-white/70 hover:border-white/30"}`}
                    data-testid={`retro-bred-tier-${t.key}`}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <p className="text-[11px] tracking-[0.32em] uppercase">{t.name}{t.most && <span className="ml-3 text-[9px] tracking-[0.32em] text-[#d21b3d]">MOST CHOSEN</span>}</p>
                        <p className="text-[13px] text-white/60 mt-1">{t.metal} · {t.stones}</p>
                      </div>
                      <p className="text-[15px] text-white/95 whitespace-nowrap">${t.price.toLocaleString("en-CA")} CAD</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chain — sold separately */}
            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <p className="text-[9px] tracking-[0.42em] text-white/35 uppercase">Chain Length</p>
                <p className="text-[9px] tracking-[0.32em] text-white/40 uppercase">Sold Separately</p>
              </div>
              <div className="flex gap-2 mt-3">
                {CHAIN_LENGTHS.map((L) => (
                  <button key={L} onClick={() => setChain(L)}
                    className={`px-5 py-3 border rounded-[2px] text-[13px] transition-colors ${chain === L ? "border-white/50 bg-white/[0.04] text-white/95" : "border-white/12 text-white/65 hover:border-white/30"}`}
                    data-testid={`retro-bred-chain-${L.replace(/\W+/g, "")}`}>
                    {L}
                  </button>
                ))}
              </div>
              <p className="text-white/35 text-[11px] mt-3">Chain price is not included in the pendant price.</p>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="mt-10 block w-full bg-white text-black rounded-[2px] py-4 text-[10px] tracking-[0.28em] font-medium hover:bg-white/92 transition-colors"
              data-testid="retro-bred-add-btn"
            >
              ADD TO CART — ${currentTier.price.toLocaleString("en-CA")} CAD
            </button>

            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-[10px] tracking-[0.42em] text-white/50 uppercase">Private Release · Limited Run</p>
              <p className="text-white/40 text-[11px] mt-2 leading-relaxed">
                When this run closes, it closes. Not automatically recast.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}`}</style>
    </div>
  );
}
