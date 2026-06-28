import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO_IMG = "/inspiration-vault/first-discovery/hero.jpg";
const WORN_IMG = "/inspiration-vault/first-discovery/worn.jpg";
const STUDIO_IMG = "/inspiration-vault/first-discovery/studio.jpg";
const PRODUCT_NAME = "Prima Wave";
const PRICE = 75;

export default function FirstDiscoveryPage() {
  const [scrollY, setScrollY] = useState(0);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "PRIMA WAVE — Inspiration Vault · PHILEON";
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-first-discovery",
      name: "PRIMA WAVE — Rose Gold Vermeil",
      price: PRICE,
      productKey: "inspirationVaultFirstDiscovery",
      tierKey: "default",
      metal: "Rose Gold Vermeil",
      sku: "IV-FD-RGV",
      quantity: 1,
      image: HERO_IMG,
    }, 1, "Rose Gold Vermeil");
  };

  const heroParallax = Math.max(0, 1 - scrollY / 600);

  return (
    <div className="iv-page" data-testid="inspiration-vault-page">
      <style>{`
        .iv-page {
          --bg:#f9f1e6;--bg-deep:#f1e3cf;--ivory:#fcf6ec;--champagne:#e8d4b3;
          --ink:#3d2f24;--ink-strong:#1f140d;--ink-muted:#a08868;
          --rose:#b87355;--rose-light:#d8a890;--rose-deep:#8e4f33;
          --rule:rgba(184,115,85,.32);--rule-soft:rgba(184,115,85,.14);
          background:linear-gradient(180deg,var(--ivory) 0%,var(--bg) 38%,var(--bg-deep) 100%);
          color:var(--ink);font-family:'Cormorant Garamond',serif;min-height:100vh;overflow-x:hidden;
        }
        .iv-page .iv-return {
          display:inline-flex;align-items:center;gap:10px;padding:18px 26px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-muted);text-decoration:none;text-transform:uppercase;
          transition:color 280ms ease,gap 280ms ease;
        }
        .iv-page .iv-return:hover { color:var(--rose-deep);gap:16px; }
        .iv-page .iv-eyebrow {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.46em;
          color:var(--rose-deep);text-transform:uppercase;margin:0 0 18px;
        }
        .iv-page .iv-h1 {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(48px,7.2vw,100px);line-height:.98;letter-spacing:.018em;
          color:var(--ink-strong);margin:0 0 22px;text-transform:uppercase;
        }
        .iv-page .iv-subhead {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(20px,2vw,28px);color:var(--rose-deep);margin:0;line-height:1.45;
        }
        .iv-section {
          max-width:1180px;margin:0 auto;padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0;transform:translateY(20px);animation:ivFade 1s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes ivFade { to { opacity:1;transform:translateY(0); } }
        .iv-section.d1 { animation-delay:.15s; } .iv-section.d2 { animation-delay:.28s; }
        .iv-section.d3 { animation-delay:.4s; }  .iv-section.d4 { animation-delay:.52s; }
        .iv-hero {
          position:relative;padding:clamp(40px,6vw,90px) clamp(20px,4vw,60px) clamp(60px,8vw,120px);
          display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(48px,6vw,96px);
          align-items:center;max-width:1320px;margin:0 auto;
        }
        @media (max-width:880px){ .iv-hero { grid-template-columns:1fr;gap:48px; } }
        .iv-hero-img-wrap {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:#0a0807;
          border:1px solid var(--rule-soft);box-shadow:0 36px 100px -32px rgba(184,115,85,.4);
        }
        .iv-hero-img-wrap::after {
          content:'';position:absolute;inset:-50px;
          background:radial-gradient(60% 60% at 50% 50%,rgba(216,168,144,.5) 0%,transparent 70%);
          z-index:0;filter:blur(50px);pointer-events:none;
        }
        .iv-hero-img {
          position:relative;z-index:1;width:100%;height:100%;object-fit:cover;display:block;
          animation:ivRise 1.6s cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes ivRise { from{transform:translateY(56px);opacity:0;} to{transform:translateY(0);opacity:1;} }
        .iv-intro { text-align:center; }
        .iv-intro-body p {
          font-family:'Cormorant Garamond',serif;font-size:clamp(19px,1.55vw,24px);
          line-height:1.7;color:var(--ink);margin:0 auto 18px;max-width:720px;
        }
        .iv-intro-body p.lead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(22px,2.2vw,30px);color:var(--rose-deep);margin-bottom:30px;
        }
        .iv-intro-tagline {
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:.42em;
          color:var(--ink-muted);text-transform:uppercase;margin-top:36px;line-height:2;
        }
        .iv-featured {
          background:linear-gradient(180deg,var(--bg) 0%,var(--ivory) 100%);
          border-top:1px solid var(--rule-soft);border-bottom:1px solid var(--rule-soft);
        }
        .iv-featured-grid {
          display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,5vw,80px);align-items:center;
        }
        @media (max-width:880px){ .iv-featured-grid { grid-template-columns:1fr;gap:36px; } }
        .iv-featured-img-wrap {
          aspect-ratio:3/4;overflow:hidden;background:var(--ivory);border:1px solid var(--rule-soft);
          box-shadow:0 28px 60px -28px rgba(184,115,85,.25);
        }
        .iv-featured-img { width:100%;height:100%;object-fit:cover;display:block;transition:transform 1.2s cubic-bezier(.22,.61,.36,1); }
        .iv-featured-img-wrap:hover .iv-featured-img { transform:scale(1.02); }
        .iv-featured-meta {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--rose-deep);text-transform:uppercase;margin-bottom:14px;
        }
        .iv-h2 {
          font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(34px,4.6vw,58px);
          line-height:1.05;color:var(--ink-strong);margin:0 0 12px;text-transform:uppercase;letter-spacing:.018em;
        }
        .iv-featured-sub {
          font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(18px,1.6vw,22px);
          color:var(--ink-muted);margin:0 0 28px;
        }
        .iv-story-body p {
          font-family:'Cormorant Garamond',serif;font-size:clamp(18px,1.5vw,22px);
          line-height:1.72;color:var(--ink);margin:0 0 22px;max-width:680px;
        }
        .iv-story-body p em { font-style:italic;color:var(--ink-strong); }
        .iv-details { background:var(--ivory);border-top:1px solid var(--rule-soft); }
        .iv-details-grid {
          display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(40px,5vw,80px);align-items:start;
        }
        @media (max-width:880px){ .iv-details-grid { grid-template-columns:1fr;gap:36px; } }
        .iv-details-img-wrap {
          aspect-ratio:4/5;overflow:hidden;background:var(--bg-deep);border:1px solid var(--rule-soft);
        }
        .iv-details-img { width:100%;height:100%;object-fit:cover;display:block; }
        .iv-details-list { list-style:none;padding:0;margin:24px 0 0; }
        .iv-details-list li {
          display:grid;grid-template-columns:140px 1fr;gap:18px;padding:14px 0;
          border-bottom:1px solid var(--rule-soft);
        }
        .iv-details-list dt {
          font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.36em;
          color:var(--rose-deep);text-transform:uppercase;padding-top:2px;
        }
        .iv-details-list dd { margin:0;font-size:17px;line-height:1.5;color:var(--ink); }
        .iv-cta { text-align:center; }
        .iv-price-display {
          font-family:'Cinzel',serif;font-size:22px;letter-spacing:.32em;
          color:var(--ink-strong);margin:0 0 10px;
        }
        .iv-price-note {
          font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;
          color:var(--ink-muted);margin:0 0 38px;
        }
        .iv-add-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:12px;
          padding:18px 64px;border:1.5px solid var(--rose);background:transparent;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:.42em;
          color:var(--rose-deep);text-transform:uppercase;cursor:pointer;
          transition:background 380ms ease,color 380ms ease,border-color 380ms ease,transform 280ms ease;
        }
        .iv-add-btn:hover { background:var(--rose);color:var(--ivory);transform:translateY(-2px); }
        .iv-add-btn:disabled { opacity:.6;cursor:wait; }
        .iv-final {
          text-align:center;padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:var(--ivory);border-top:1px solid var(--rule);
        }
        .iv-final-line {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(24px,2.8vw,38px);line-height:1.5;color:var(--rose-deep);
          max-width:720px;margin:0 auto;
        }
        @media (prefers-reduced-motion: reduce){
          .iv-section,.iv-hero-img { animation:none !important;transform:none !important;opacity:1 !important; }
        }
      `}</style>

      <Link to="/" className="iv-return" data-testid="iv-return">
        <ArrowLeft size={14} /> RETURN
      </Link>

      {/* HERO */}
      <section className="iv-hero" data-testid="iv-hero" style={{ opacity: 0.5 + heroParallax * 0.5 }}>
        <div className="iv-hero-img-wrap">
          <img src={HERO_IMG} alt="PRIMA WAVE — woven rose-gold vermeil drop earrings on dark studio backdrop." className="iv-hero-img" data-testid="iv-hero-img" />
        </div>
        <div>
          <p className="iv-eyebrow" data-testid="iv-eyebrow">Inspiration Vault</p>
          <h1 className="iv-h1" data-testid="iv-title">Prima Wave</h1>
          <p className="iv-subhead" data-testid="iv-subhead">The first movement.</p>
        </div>
      </section>

      {/* INTRO */}
      <section className="iv-section iv-intro d1" data-testid="iv-intro">
        <p className="iv-eyebrow">Introduction</p>
        <div className="iv-intro-body">
          <p className="lead">An elegant composition of flowing woven forms.</p>
          <p>Prima Wave captures the beauty of continuous motion through sculptural design. Every curve transitions effortlessly into the next, creating a silhouette that feels soft, modern, and timeless.</p>
          <p>Finished in warm Rose Gold Vermeil, Prima Wave brings everyday elegance to the Inspiration Vault — designed to inspire, created to be worn.</p>
        </div>
        <p className="iv-intro-tagline">Designed to inspire.<br />Created to be worn.</p>
      </section>

      {/* FEATURED PIECE */}
      <section className="iv-section iv-featured d2" data-testid="iv-featured">
        <div className="iv-featured-grid">
          <div className="iv-featured-img-wrap">
            <img src={WORN_IMG} alt="PRIMA WAVE — worn editorial portrait, warm side-light through linen curtains." className="iv-featured-img" loading="lazy" />
          </div>
          <div>
            <p className="iv-featured-meta">Featured Piece · Inspiration Vault</p>
            <h2 className="iv-h2" data-testid="iv-featured-title">{PRODUCT_NAME}</h2>
            <p className="iv-featured-sub">Rose Gold Vermeil Earrings — Woven Drop Silhouette.</p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'19px', lineHeight:1.7, color:'var(--ink)', margin:0 }}>
              A study in continuous motion. Every curve transitions effortlessly into the next — soft, modern, and timeless.
            </p>
          </div>
        </div>
      </section>

      {/* INSPIRATION STORY */}
      <section className="iv-section d3" data-testid="iv-story">
        <p className="iv-eyebrow">Inspiration Story</p>
        <h2 className="iv-h2">The first movement.</h2>
        <div className="iv-story-body">
          <p>Every collection begins with a single idea. <em>Prima Wave is ours.</em></p>
          <p>An elegant composition of flowing woven forms, Prima Wave captures the beauty of continuous motion through sculptural design. Every curve transitions effortlessly into the next, creating a silhouette that feels soft, modern, and timeless.</p>
          <p>Finished in warm Rose Gold Vermeil, Prima Wave brings everyday elegance to the Inspiration Vault — designed to inspire, created to be worn.</p>
          <p><em>The first wave. The first movement. The beginning of the archive.</em></p>
        </div>
      </section>

      {/* PRODUCT DETAILS */}
      <section className="iv-section iv-details d4" data-testid="iv-details">
        <div className="iv-details-grid">
          <div className="iv-details-img-wrap">
            <img src={STUDIO_IMG} alt="PRIMA WAVE — clean studio top-down detail." className="iv-details-img" loading="lazy" />
          </div>
          <div>
            <p className="iv-eyebrow">Specifications</p>
            <h2 className="iv-h2">A study in motion.</h2>
            <dl className="iv-details-list">
              <li><dt>Material</dt><dd>Rose Gold Vermeil</dd></li>
              <li><dt>Finish</dt><dd>High Polish</dd></li>
              <li><dt>Style</dt><dd>Woven Drop Earrings</dd></li>
              <li><dt>Collection</dt><dd>Inspiration Vault</dd></li>
              <li><dt>Price</dt><dd>$75 USD</dd></li>
            </dl>
          </div>
        </div>
      </section>

      {/* PRICING + ADD TO CART */}
      <section className="iv-section iv-cta" data-testid="iv-cta">
        <p className="iv-eyebrow">Pricing</p>
        <p className="iv-price-display" data-testid="iv-price">${PRICE} USD</p>
        <p className="iv-price-note">An Inspiration Vault release — accessible, intentional, timeless.</p>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="iv-add-btn"
          data-testid="iv-add-to-cart"
          aria-label="Add Prima Wave to cart"
        >
          {buttonText || "ADD TO CART"}
        </button>
      </section>

      {/* FINAL EDITORIAL QUOTE */}
      <section className="iv-final" data-testid="iv-final-quote">
        <p className="iv-final-line">
          The first wave is always the one you remember.<br />
          <em>Prima Wave is ours.</em>
        </p>
      </section>
    </div>
  );
}
