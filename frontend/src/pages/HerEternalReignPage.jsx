import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

// H.E.R. — HER ETERNAL REIGN · Ladies Fine Jewelry ring · CAD
const IMG_HERO = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/her_hero.jpg";
const IMG_CIRCLE = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/her_circle.jpg";
const IMG_CROWNS = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/her_crowns.jpg";
const IMG_TOP    = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/her_top.jpg";
const IMG_LINE   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/her_lineup.jpg";
const IMG_PTP    = "/products/ptp-cuff/hero.jpg";

// Server-authoritative — mirror of backend HER_SIZE_TO_FIGURES.
const SIZE_FIGURES = {
  "6": 17, "6.5": 17, "7": 17,
  "7.5": 18, "8": 18,
  "8.5": 19, "9": 19,
  "9.5": 20, "10": 20,
};
const SIZES = ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"];
const TIERS = [
  { key: "10k", name: "FOUNDATION", metal: "10K Yellow Gold", stones: "Lab-Created & Synthetic Gemstones", base: 6995, per: 300, most: false },
  { key: "14k", name: "SIGNATURE",  metal: "14K Yellow Gold", stones: "Genuine Gemstones",                  base: 8995, per: 350, most: true  },
  { key: "18k", name: "HEIRLOOM",   metal: "18K Yellow Gold", stones: "Genuine Gemstones",                  base: 10495, per: 400, most: false },
];

const GEM_IDENTITIES = [
  { name: "Diamond",           color: "#f5f5f5" },
  { name: "Blue Sapphire",     color: "#1e3a8a" },
  { name: "Ruby",              color: "#c8102e" },
  { name: "Emerald",           color: "#046a38" },
  { name: "Amethyst",          color: "#7b3f9f" },
  { name: "Citrine",           color: "#e6a817" },
  { name: "Garnet",            color: "#7a1c1c" },
  { name: "Aquamarine",        color: "#7ec8d0" },
  { name: "Black Diamond",     color: "#101010" },
  { name: "Champagne Diamond", color: "#c9a26b" },
  { name: "Morganite",         color: "#f4b8b0" },
  { name: "Tanzanite",         color: "#5b4b8a" },
  { name: "Peridot",           color: "#a4b95a" },
  { name: "Pink Sapphire",     color: "#e0669a" },
  { name: "Topaz",             color: "#6ea3d5" },
  { name: "Spinel",            color: "#a5304f" },
  { name: "Yellow Sapphire",   color: "#e4b823" },
  { name: "White Sapphire",    color: "#ecefe8" },
  { name: "Fire Opal",         color: "#e26123" },
  { name: "Green Tourmaline",  color: "#3d8a5d" },
];

export default function HerEternalReignPage() {
  const { addToCart } = useCart();
  const [size, setSize] = useState("7");
  const [tierKey, setTierKey] = useState("14k");

  const figures = SIZE_FIGURES[size];
  const stones = figures * 3;
  const tier = TIERS.find((t) => t.key === tierKey);
  const price = tier.base + (figures - 17) * tier.per;
  const sku = `HER-${tierKey.toUpperCase()}-F${figures}-SZ${size.replace(".", "-")}`;
  const activeGems = useMemo(() => GEM_IDENTITIES.slice(0, figures), [figures]);

  const handleAdd = () => {
    addToCart({
      id: `her-eternal-reign-${tierKey}-${size.replace(".", "-")}`,
      name: `H.E.R. — ${tier.metal} · US ${size}`,
      image: IMG_HERO, price, currency: "CAD",
      productKey: "her-eternal-reign", slug: "her-eternal-reign",
      tierKey, karat: tierKey.toUpperCase(),
      ringSize: size, ringSizeLabel: `US ${size}`,
      materials: [tier.metal, tier.stones],
      sku,
    }, 1, `${tier.metal} · US ${size} · ${figures} Figures`);
  };

  return (
    <div className="min-h-screen bg-[#0a0806] text-[#efe6d5]" data-testid="her-page" style={{ fontFamily: 'ui-serif, "Cormorant Garamond", Georgia, serif' }}>
      {/* Hero */}
      <section className="relative border-b border-[#3d2f1a]/40">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-[10px] tracking-[0.52em] text-[#c8a25f] uppercase" data-testid="her-eyebrow">PHILEON Fine Jewelry</p>
            <h1 className="mt-4 text-[72px] md:text-[104px] leading-[0.9] tracking-[0.06em] text-[#f2e6c8]" data-testid="her-title">H.E.R.</h1>
            <p className="mt-2 text-[13px] md:text-[15px] tracking-[0.42em] text-[#c8a25f] uppercase">Her Eternal Reign</p>
            <div className="mt-10 max-w-[480px] space-y-4">
              <p className="text-[22px] md:text-[26px] leading-[1.25] tracking-[0.02em] text-[#efe6d5]">NO QUEEN STANDS ALONE.</p>
              <p className="text-[19px] md:text-[22px] leading-[1.35] tracking-[0.02em] text-[#efe6d5]/85">EVERY WOMAN IN THE CIRCLE<br/>WEARS HER OWN CROWN.</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img src={IMG_HERO} alt="H.E.R. sculptural ring — procession of crowned female figures" className="w-full h-auto object-cover rounded-[2px]" loading="eager" />
          </div>
        </div>
      </section>

      {/* The Circle */}
      <section className="border-b border-[#3d2f1a]/40">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-14 items-center">
          <img src={IMG_LINE} alt="Procession of crowned figures — H.E.R. macro" className="w-full h-auto object-cover rounded-[2px]" loading="lazy" />
          <div>
            <p className="text-[10px] tracking-[0.52em] text-[#c8a25f] uppercase">The Circle</p>
            <h2 className="mt-3 text-[36px] md:text-[44px] leading-[1.05] tracking-[0.02em] text-[#f2e6c8]">A procession of women.<br/>A different crown for every one.<br/>One unbroken reign.</h2>
            <p className="mt-6 text-[15px] leading-[1.7] text-[#efe6d5]/75 max-w-[520px]">A continuous procession of crowned women cast into gold. Each figure holds her own position. Each crown carries its own color. No woman disappears into the pattern.</p>
            <p className="mt-4 text-[13px] tracking-[0.12em] text-[#c8a25f]/85 uppercase">Different by design. United by the circle.</p>
          </div>
        </div>
      </section>

      {/* Editorial statement */}
      <section className="border-b border-[#3d2f1a]/40 bg-[#080604]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-24 text-center">
          <p className="text-[13px] tracking-[0.42em] text-[#c8a25f] uppercase">No queen stands alone.</p>
          <h2 className="mt-6 text-[38px] md:text-[56px] leading-[1.1] tracking-[0.02em] text-[#f2e6c8]">EVERY WOMAN IN THE CIRCLE<br/>WEARS HER OWN CROWN.</h2>
        </div>
      </section>

      {/* Stone story */}
      <section className="border-b border-[#3d2f1a]/40">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
          <p className="text-[10px] tracking-[0.52em] text-[#c8a25f] uppercase">Her Own Crown</p>
          <h2 className="mt-3 text-[32px] md:text-[42px] leading-[1.1] tracking-[0.02em] text-[#f2e6c8]">3 Stones Per Crown · <span className="text-[#c8a25f]" data-testid="her-total-stones">{stones}</span> Stones</h2>
          <p className="mt-3 text-[13px] tracking-[0.16em] text-[#efe6d5]/60 uppercase">US {size} · {figures} Crowned Figures</p>
          <div className="mt-10 flex flex-wrap gap-3" data-testid="her-gem-rail">
            {activeGems.map((g, i) => (
              <div key={g.name} className="flex items-center gap-2 border border-[#3d2f1a]/60 rounded-full px-3 py-1.5 bg-black/40" data-testid={`her-gem-${i}`}>
                <span className="w-3.5 h-3.5 rounded-full border border-[#c8a25f]/40" style={{ background: g.color }} />
                <span className="text-[11px] tracking-[0.16em] text-[#efe6d5]/85 uppercase">{String(i+1).padStart(2,"0")} · {g.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purchase */}
      <section className="border-b border-[#3d2f1a]/40 bg-[#0c0906]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-[1fr,1.05fr] gap-14 items-start">
          <img src={IMG_CROWNS} alt="H.E.R. crown detail — ruby, sapphire and diamond stones" className="w-full h-auto object-cover rounded-[2px]" loading="lazy" />
          <div>
            <p className="text-[10px] tracking-[0.52em] text-[#c8a25f] uppercase">Configure</p>
            <h2 className="mt-3 text-[32px] md:text-[38px] leading-[1.05] tracking-[0.02em] text-[#f2e6c8]">H.E.R. — Her Eternal Reign</h2>

            {/* Ring size */}
            <div className="mt-10">
              <p className="text-[10px] tracking-[0.42em] text-[#c8a25f] uppercase">1 · Select Ring Size</p>
              <div className="mt-3 flex flex-wrap gap-2" data-testid="her-size-selector">
                {SIZES.map((s) => (
                  <button key={s} onClick={() => setSize(s)} data-testid={`her-size-${s.replace(".","-")}`}
                    className={`px-4 py-2.5 border rounded-[2px] text-[13px] tracking-[0.06em] transition-colors ${size===s ? "border-[#c8a25f] bg-[#c8a25f]/10 text-[#f2e6c8]" : "border-[#3d2f1a]/70 text-[#efe6d5]/70 hover:border-[#c8a25f]/60"}`}
                    aria-pressed={size===s}>
                    US {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Metal */}
            <div className="mt-8">
              <p className="text-[10px] tracking-[0.42em] text-[#c8a25f] uppercase">2 · Select Metal</p>
              <div className="mt-3 grid gap-2" data-testid="her-tier-selector">
                {TIERS.map((t) => (
                  <button key={t.key} onClick={() => setTierKey(t.key)} data-testid={`her-tier-${t.key}`}
                    className={`text-left px-5 py-4 border rounded-[2px] transition-colors ${tierKey===t.key ? "border-[#c8a25f] bg-[#c8a25f]/[0.08] text-[#f2e6c8]" : "border-[#3d2f1a]/70 text-[#efe6d5]/75 hover:border-[#c8a25f]/60"}`}
                    aria-pressed={tierKey===t.key}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <p className="text-[11px] tracking-[0.32em] uppercase">{t.name}{t.most && <span className="ml-3 text-[9px] tracking-[0.32em] text-[#c8a25f]">MOST CHOSEN</span>}</p>
                        <p className="text-[13px] text-[#efe6d5]/70 mt-1">{t.metal} · {t.stones}</p>
                      </div>
                      <p className="text-[15px] text-[#f2e6c8] whitespace-nowrap">${(t.base + (figures - 17) * t.per).toLocaleString("en-CA")} CAD</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-10 border-t border-[#3d2f1a]/50 pt-6" data-testid="her-summary">
              <div className="flex items-baseline justify-between">
                <div className="text-[13px] tracking-[0.06em] text-[#efe6d5]/85">
                  <p>US {size}</p>
                  <p>{figures} Crowned Figures</p>
                  <p>{stones} Stones · 3 Per Crown</p>
                  <p>{tier.metal}</p>
                  <p className="text-[#efe6d5]/55 text-[12px] mt-1">{tier.stones}</p>
                </div>
                <p className="text-[26px] md:text-[30px] text-[#f2e6c8]" data-testid="her-price">${price.toLocaleString("en-CA")} CAD</p>
              </div>
            </div>

            <button onClick={handleAdd} data-testid="her-add-to-cart"
              className="mt-6 w-full bg-[#c8a25f] text-[#0a0806] rounded-[2px] py-4 text-[11px] tracking-[0.32em] font-medium hover:bg-[#d4b070] transition-colors">
              ADD TO CART · ${price.toLocaleString("en-CA")} CAD
            </button>
            <p className="mt-3 text-[11px] tracking-[0.06em] text-[#efe6d5]/45">SKU {sku}</p>
          </div>
        </div>
      </section>

      {/* Size 7 reference specs */}
      <section className="border-b border-[#3d2f1a]/40">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-20">
          <p className="text-[10px] tracking-[0.52em] text-[#c8a25f] uppercase">The Size 7 Reference</p>
          <h2 className="mt-3 text-[30px] md:text-[38px] leading-[1.05] tracking-[0.02em] text-[#f2e6c8]">Reference Specifications</h2>
          <dl className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-4 text-[14px]">
            {[
              ["Ring Size", "US 7"],
              ["Crowned Figures", "17"],
              ["Stones", "51 total"],
              ["Stones Per Crown", "3"],
              ["Est. Finished Weight", "~ 18.5 g"],
              ["Ring Height", "12.5 mm"],
              ["Overall Width", "24.0 mm"],
              ["Band Thickness", "3.2 mm"],
              ["Material", "Solid Yellow Gold"],
            ].map(([k, v]) => (
              <div key={k}><dt className="text-[#efe6d5]/45 text-[11px] tracking-[0.16em] uppercase">{k}</dt><dd className="text-[#f2e6c8] mt-1">{v}</dd></div>
            ))}
          </dl>
          <p className="mt-8 text-[13px] leading-[1.75] text-[#efe6d5]/60 max-w-[720px]">Dimensions, figure count, stone count and finished weight vary with selected ring size. Exact finished weight is confirmed during production.</p>
          <p className="mt-6 text-[13px] leading-[1.75] text-[#efe6d5]/70 max-w-[720px]">H.E.R. is constructed as a continuous sculptural procession. Larger finger sizes are not created by stretching the figures. Additional figures are introduced to preserve proportion, spacing and continuity around the ring. Every figure carries three stones in her crown.</p>
        </div>
      </section>

      {/* PTP pairing */}
      <section className="bg-[#080604]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[10px] tracking-[0.52em] text-[#c8a25f] uppercase">Wear With</p>
            <h2 className="mt-3 text-[32px] md:text-[42px] leading-[1.05] tracking-[0.02em] text-[#f2e6c8]">THE PTP BANGLE</h2>
            <p className="mt-4 text-[16px] leading-[1.55] text-[#efe6d5]/80 max-w-[440px]">H.E.R. carries the procession.<br/>PTP brings the structure.</p>
            <Link to="/products/ptp-cuff" data-testid="her-explore-ptp"
              className="inline-block mt-8 border border-[#c8a25f] text-[#c8a25f] rounded-[2px] px-8 py-3 text-[11px] tracking-[0.32em] hover:bg-[#c8a25f] hover:text-[#0a0806] transition-colors">
              EXPLORE THE PTP BANGLE
            </Link>
          </div>
          <img src={IMG_PTP} alt="PTP Bangle — suggested pairing" className="w-full h-auto object-cover rounded-[2px]" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
      </section>
    </div>
  );
}
