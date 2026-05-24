import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";

/**
 * THE TRUE VINE — PHILEON Sacred Objects · Pendant
 *
 * Finished object. Direct purchase, no consultation flow.
 * Open mesh arch · raised cross · vine relief.
 *
 * Hardcoded CAD pricing per brief — no live metals recalculation.
 * Cart payload posts CAD price; sitewide cart handles currency display.
 *
 * Namespace: .vine-
 */

const HERO_IMG = "/the-true-vine/the-true-vine-hero.jpg";

const METAL_TIERS = [
  {
    id: "foundation",
    sku: "TV-SS",
    name: "Sterling Silver Vermeil",
    subtitle: "Sterling Silver + heavy yellow gold plating",
    badge: "FOUNDATION",
    metal: "Sterling Silver Vermeil",
    pendantCad: 2200,
  },
  {
    id: "signature",
    sku: "TV-10Y",
    name: "10K Yellow Gold",
    subtitle: "Solid 10K yellow gold",
    badge: "SIGNATURE",
    metal: "10K Yellow Gold",
    pendantCad: 4200,
  },
  {
    id: "heirloom",
    sku: "TV-14Y",
    name: "14K Yellow Gold",
    subtitle: "Solid 14K yellow gold",
    badge: "HEIRLOOM",
    metal: "14K Yellow Gold",
    pendantCad: 5200,
  },
  {
    id: "collector",
    sku: "TV-18Y",
    name: "18K Yellow Gold",
    subtitle: "Solid 18K yellow gold",
    badge: "COLLECTOR",
    metal: "18K Yellow Gold",
    pendantCad: 6800,
  },
];

// Chain add-ons by tier id → addCad
const CHAIN_OPTIONS = [
  {
    id: "pendant-only",
    label: "Pendant Only",
    short: "No chain",
    addCad: { foundation: 0, signature: 0, heirloom: 0, collector: 0 },
  },
  {
    id: "rope-20",
    label: '20" Rope Chain',
    short: "20 inches",
    addCad: { foundation: 450, signature: 650, heirloom: 850, collector: 1200 },
  },
  {
    id: "rope-22",
    label: '22" Rope Chain',
    short: "22 inches",
    addCad: { foundation: 550, signature: 750, heirloom: 950, collector: 1350 },
  },
  {
    id: "rope-24",
    label: '24" Rope Chain',
    short: "24 inches",
    addCad: { foundation: 650, signature: 900, heirloom: 1100, collector: 1500 },
  },
];

const SPECS = [
  "Approx. 35mm × 20mm",
  "Estimated 18K weight: 12.5g",
  "Open mesh arch silhouette",
  "Raised cross with vine relief",
  "Hand-finished bail",
  "Made to order · 3–4 weeks",
];

const CRAFT_NOTES = [
  {
    head: "THE ARCH",
    body: "The open mesh arch is hand-built before the cross is set. Each cell of the lattice is finished individually — the negative space carries as much craft as the metal.",
  },
  {
    head: "THE VINE",
    body: "The vine relief is sculpted directly into the cross, not applied over it. Six leaves climb from the base to the crown, each cut by hand before polish.",
  },
  {
    head: "THE COMPOSITION",
    body: "The cross does not float inside the arch — it carries it. A single sacred object, not an ornament on a frame.",
  },
];

const fmtCad = (n) => `$${n.toLocaleString("en-CA")} CAD`;

export default function TrueVinePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Default per brief: 14K Yellow Gold · 22" Rope Chain
  const [selectedTier, setSelectedTier] = useState("heirloom");
  const [selectedChain, setSelectedChain] = useState("rope-22");

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const currentTier = METAL_TIERS.find((t) => t.id === selectedTier) || METAL_TIERS[2];
  const currentChain = CHAIN_OPTIONS.find((c) => c.id === selectedChain) || CHAIN_OPTIONS[2];
  const chainAdd = currentChain.addCad[selectedTier] || 0;
  const totalCad = currentTier.pendantCad + chainAdd;

  const sku = useMemo(() => {
    const chainToken =
      selectedChain === "pendant-only"
        ? "PO"
        : selectedChain.replace("rope-", "R");
    return `${currentTier.sku}-${chainToken}`;
  }, [currentTier.sku, selectedChain]);

  const onAddToCart = () => {
    handleAddToCart({
      id: `the-true-vine-${selectedTier}-${selectedChain}`,
      name: `THE TRUE VINE — ${currentTier.metal} · ${currentChain.label}`,
      price: totalCad,
      currency: "CAD",
      productKey: "theTrueVine",
      tierKey: selectedTier,
      metal: currentTier.metal,
      chain: currentChain.label,
      sku,
      quantity: 1,
      image: HERO_IMG,
    });
  };

  return (
    <section
      className={`vine-room${isMounted ? " vine-loaded" : ""}`}
      data-page="the-true-vine"
      data-testid="true-vine-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .vine-room {
          background: #0c0a07;
          color: #ece5d2;
          min-height: 100vh;
          opacity: 0;
          transition: opacity 900ms ease;
          font-family: 'Inter', sans-serif;
        }
        .vine-room.vine-loaded { opacity: 1; }

        .vine-back {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 22px 24px;
          font-size: 11px; letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(236, 229, 210, 0.55);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .vine-back:hover { color: rgba(236, 229, 210, 0.95); }

        /* HERO */
        .vine-hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          padding: 0 0 60px;
          background:
            radial-gradient(circle at 50% 30%, rgba(110, 84, 36, 0.22), transparent 65%),
            #0c0a07;
        }
        @media (min-width: 900px) {
          .vine-hero {
            grid-template-columns: 1fr 1fr;
            min-height: min(86vh, 820px);
            align-items: center;
            padding: 0 60px 80px;
            gap: 60px;
          }
        }

        .vine-hero-img-wrap {
          position: relative;
          padding: 40px 24px 24px;
          display: flex; align-items: center; justify-content: center;
        }
        @media (min-width: 900px) { .vine-hero-img-wrap { padding: 0; } }
        .vine-hero-img {
          max-width: 100%;
          max-height: 540px;
          object-fit: contain;
          filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.55));
        }
        @media (min-width: 900px) { .vine-hero-img { max-height: 680px; } }

        .vine-hero-text {
          padding: 0 28px;
          display: flex; flex-direction: column; justify-content: center;
        }
        @media (min-width: 900px) { .vine-hero-text { padding: 0; } }

        .vine-meta {
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 18px;
        }
        .vine-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: clamp(2.6rem, 7vw, 4.6rem);
          letter-spacing: 0.02em;
          line-height: 0.98;
          color: #f5efdf;
          margin: 0 0 22px;
        }
        .vine-scripture {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.95rem;
          letter-spacing: 0.04em;
          color: rgba(198, 168, 107, 0.85);
          margin: 0 0 22px;
        }
        .vine-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.4vw, 1.25rem);
          line-height: 1.55;
          color: rgba(236, 229, 210, 0.85);
          margin: 0 0 32px;
          max-width: 480px;
        }
        .vine-trust {
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.6);
          margin: 0;
        }

        /* EDITORIAL CRAFT NOTES */
        .vine-craft {
          padding: 80px 24px 90px;
          border-top: 1px solid rgba(198, 168, 107, 0.12);
        }
        @media (min-width: 900px) { .vine-craft { padding: 100px 60px 110px; } }
        .vine-craft-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 36px;
        }
        @media (min-width: 800px) { .vine-craft-grid { grid-template-columns: repeat(3, 1fr); gap: 44px; } }
        .vine-craft-cell h4 {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 16px;
        }
        .vine-craft-cell p {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgba(236, 229, 210, 0.85);
          margin: 0;
        }

        /* SPECS */
        .vine-specs {
          padding: 60px 24px 90px;
          border-top: 1px solid rgba(198, 168, 107, 0.10);
        }
        @media (min-width: 900px) { .vine-specs { padding: 80px 60px 110px; } }
        .vine-specs-inner { max-width: 1100px; margin: 0 auto; }
        .vine-specs-eyebrow {
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 24px;
        }
        .vine-specs-list {
          list-style: none; padding: 0; margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px 36px;
        }
        @media (min-width: 700px) { .vine-specs-list { grid-template-columns: repeat(2, 1fr); } }
        .vine-specs-list li {
          position: relative; padding-left: 18px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.6;
          color: rgba(236, 229, 210, 0.85);
        }
        .vine-specs-list li::before {
          content: "•"; position: absolute; left: 4px;
          color: rgba(198, 168, 107, 0.7);
        }

        /* CONFIGURATOR */
        .vine-config {
          padding: 80px 24px 110px;
          background:
            radial-gradient(circle at 50% 0%, rgba(110, 84, 36, 0.16), transparent 60%),
            #0c0a07;
          border-top: 1px solid rgba(198, 168, 107, 0.12);
        }
        @media (min-width: 900px) { .vine-config { padding: 100px 60px 130px; } }
        .vine-config-inner { max-width: 980px; margin: 0 auto; }
        .vine-config-head { text-align: center; margin-bottom: 56px; }
        .vine-config-eyebrow {
          font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 18px;
        }
        .vine-config-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          letter-spacing: 0.04em;
          color: #f5efdf;
          margin: 0 0 16px;
        }
        .vine-config-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: clamp(1rem, 1.3vw, 1.15rem);
          color: rgba(236, 229, 210, 0.78);
          max-width: 460px;
          margin: 0 auto 18px;
        }
        .vine-config-trust {
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.6);
        }

        .vine-section-label {
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.78);
          margin: 0 0 18px;
        }

        /* Metal cards */
        .vine-tiers {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin: 0 0 48px;
        }
        @media (min-width: 900px) { .vine-tiers { grid-template-columns: repeat(4, 1fr); } }
        .vine-tier {
          position: relative;
          display: flex; flex-direction: column; align-items: flex-start;
          padding: 22px 18px 20px;
          background: rgba(18, 14, 8, 0.65);
          border: 1px solid rgba(198, 168, 107, 0.18);
          color: inherit;
          cursor: pointer;
          text-align: left;
          transition: border-color 380ms ease, background 380ms ease;
        }
        .vine-tier:hover { border-color: rgba(198, 168, 107, 0.5); background: rgba(28, 22, 12, 0.75); }
        .vine-tier.is-selected {
          border-color: rgba(220, 190, 130, 0.85);
          background: rgba(36, 28, 14, 0.82);
        }
        .vine-tier.is-selected::before {
          content: ""; position: absolute; inset: -1px;
          border: 1px solid rgba(220, 190, 130, 0.4);
          pointer-events: none;
        }
        .vine-tier-badge {
          font-size: 9px;
          letter-spacing: 0.42em; text-transform: uppercase;
          color: rgba(220, 190, 130, 0.85);
          margin-bottom: 12px;
        }
        .vine-tier-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 0.98rem;
          letter-spacing: 0.06em;
          color: #f5efdf;
          margin-bottom: 4px;
        }
        .vine-tier-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.88rem;
          color: rgba(236, 229, 210, 0.65);
          margin-bottom: 14px;
          line-height: 1.4;
        }
        .vine-tier-price {
          margin-top: auto;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 1rem;
          letter-spacing: 0.06em;
          color: #f5efdf;
        }

        /* Chain cards */
        .vine-chains {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin: 0 0 36px;
        }
        @media (min-width: 900px) { .vine-chains { grid-template-columns: repeat(4, 1fr); } }
        .vine-chain {
          padding: 18px 16px;
          background: rgba(18, 14, 8, 0.55);
          border: 1px solid rgba(198, 168, 107, 0.16);
          color: inherit;
          cursor: pointer;
          text-align: left;
          transition: border-color 320ms ease, background 320ms ease;
        }
        .vine-chain:hover { border-color: rgba(198, 168, 107, 0.45); }
        .vine-chain.is-selected {
          border-color: rgba(220, 190, 130, 0.85);
          background: rgba(36, 28, 14, 0.7);
        }
        .vine-chain-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 0.92rem;
          letter-spacing: 0.06em;
          color: #f5efdf;
          margin: 0 0 6px;
        }
        .vine-chain-add {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.9rem;
          color: rgba(220, 190, 130, 0.78);
        }
        .vine-chain-free {
          color: rgba(236, 229, 210, 0.5);
        }

        /* Summary */
        .vine-summary {
          margin: 0 0 28px;
          padding: 24px 26px 20px;
          background: rgba(14, 10, 6, 0.55);
          border-top: 1px solid rgba(198, 168, 107, 0.32);
          border-bottom: 1px solid rgba(198, 168, 107, 0.32);
        }
        .vine-summary-row {
          display: flex; justify-content: space-between; align-items: baseline;
          gap: 14px; padding: 9px 0;
          font-size: 10.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.72);
        }
        .vine-summary-row + .vine-summary-row { border-top: 1px solid rgba(198, 168, 107, 0.10); }
        .vine-summary-label { color: rgba(198, 168, 107, 0.6); }
        .vine-summary-value {
          flex: 1; text-align: right;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1rem;
          letter-spacing: 0.01em;
          text-transform: none;
          color: rgba(236, 229, 210, 0.92);
        }
        .vine-summary-sku {
          font-family: 'Inter', sans-serif;
          font-style: normal; font-size: 11px;
          letter-spacing: 0.28em;
        }
        .vine-summary-row--price { padding-top: 14px; }
        .vine-summary-price {
          font-family: 'Cinzel', serif;
          font-size: clamp(1.35rem, 2vw, 1.65rem);
          letter-spacing: 0.06em;
          color: #f5efdf;
        }
        .vine-summary-note {
          margin: 12px 0 0;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 0.92rem;
          color: rgba(198, 168, 107, 0.6);
          text-align: right;
        }

        /* Add to Cart */
        .vine-cta {
          width: 100%;
          padding: 22px 32px;
          background: rgba(220, 190, 130, 0.92);
          color: #0c0a07;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, letter-spacing 320ms ease;
        }
        .vine-cta:hover {
          background: rgba(232, 205, 152, 1);
          letter-spacing: 0.52em;
        }
        .vine-cta:disabled { opacity: 0.55; cursor: default; letter-spacing: 0.46em !important; }
      `}</style>

      <Link to="/shop?category=pendants" className="vine-back" data-testid="vine-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN</span>
      </Link>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="vine-hero" data-testid="vine-hero">
        <div className="vine-hero-img-wrap">
          <img
            src={HERO_IMG}
            alt="THE TRUE VINE pendant in yellow gold with open mesh arch, raised cross, and vine relief."
            className="vine-hero-img"
            data-testid="vine-hero-img"
          />
        </div>
        <div className="vine-hero-text">
          <p className="vine-meta">PHILEON · SACRED OBJECTS</p>
          <h1 className="vine-title" data-testid="vine-title">THE TRUE VINE</h1>
          <p className="vine-scripture">John 15:1</p>
          <p className="vine-tagline" data-testid="vine-tagline">
            The vine does not decorate the cross. It claims it.
          </p>
          <p className="vine-trust">
            Made to order · 3–4 weeks · Complimentary insured shipping
          </p>
        </div>
      </section>

      {/* ─── CRAFT NOTES ────────────────────────────────────── */}
      <section className="vine-craft" data-testid="vine-craft">
        <div className="vine-craft-grid">
          {CRAFT_NOTES.map((c) => (
            <div key={c.head} className="vine-craft-cell">
              <h4>{c.head}</h4>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SPECS ──────────────────────────────────────────── */}
      <section className="vine-specs" data-testid="vine-specs">
        <div className="vine-specs-inner">
          <p className="vine-specs-eyebrow">PIECE DETAILS</p>
          <ul className="vine-specs-list">
            {SPECS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── CONFIGURATOR ───────────────────────────────────── */}
      <section className="vine-config" data-testid="vine-configurator">
        <div className="vine-config-inner">
          <header className="vine-config-head">
            <p className="vine-config-eyebrow">SELECT COMPOSITION</p>
            <h2 className="vine-config-title">Select your composition</h2>
            <p className="vine-config-sub">
              Choose your metal and chain. We make each piece to order.
            </p>
            <p className="vine-config-trust">
              MADE TO ORDER · 3–4 WEEKS · COMPLIMENTARY INSURED SHIPPING
            </p>
          </header>

          {/* Metal */}
          <p className="vine-section-label">METAL</p>
          <div className="vine-tiers" role="radiogroup" aria-label="Metal selection" data-testid="vine-tiers">
            {METAL_TIERS.map((t) => {
              const isSel = selectedTier === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => setSelectedTier(t.id)}
                  className={`vine-tier ${isSel ? "is-selected" : ""}`}
                  data-testid={`vine-tier-${t.id}`}
                >
                  <span className="vine-tier-badge">{t.badge}</span>
                  <span className="vine-tier-name">{t.name}</span>
                  <span className="vine-tier-sub">{t.subtitle}</span>
                  <span className="vine-tier-price">{fmtCad(t.pendantCad)}</span>
                </button>
              );
            })}
          </div>

          {/* Chain */}
          <p className="vine-section-label">CHAIN</p>
          <div className="vine-chains" role="radiogroup" aria-label="Chain selection" data-testid="vine-chains">
            {CHAIN_OPTIONS.map((c) => {
              const isSel = selectedChain === c.id;
              const add = c.addCad[selectedTier] || 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => setSelectedChain(c.id)}
                  className={`vine-chain ${isSel ? "is-selected" : ""}`}
                  data-testid={`vine-chain-${c.id}`}
                >
                  <p className="vine-chain-name">{c.label}</p>
                  <p className={`vine-chain-add ${add === 0 ? "vine-chain-free" : ""}`}>
                    {add === 0 ? "Included" : `+ ${fmtCad(add)}`}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Summary */}
          <div className="vine-summary" data-testid="vine-summary">
            <div className="vine-summary-row">
              <span className="vine-summary-label">Selection</span>
              <span className="vine-summary-value">
                {currentTier.name} · {currentChain.label}
              </span>
            </div>
            <div className="vine-summary-row">
              <span className="vine-summary-label">SKU</span>
              <span className="vine-summary-value vine-summary-sku">{sku}</span>
            </div>
            <div className="vine-summary-row vine-summary-row--price">
              <span className="vine-summary-label">Today's price</span>
              <span className="vine-summary-price" data-testid="vine-summary-price">
                {fmtCad(totalCad)}
              </span>
            </div>
            <p className="vine-summary-note">
              All prices in Canadian Dollars · pendant {fmtCad(currentTier.pendantCad)}
              {chainAdd > 0 ? ` + chain ${fmtCad(chainAdd)}` : ""}
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="vine-cta"
            data-testid="vine-add-to-cart-btn"
          >
            {isAdding ? "ADDING…" : buttonText === "Added!" ? "ADDED" : "ADD TO CART"}
          </button>
        </div>
      </section>
    </section>
  );
}
