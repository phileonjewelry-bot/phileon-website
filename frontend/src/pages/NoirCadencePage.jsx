import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO_VIDEO = "/inspiration-vault/noir-cadence/hero-video.mp4";
const HERO_POSTER = "/inspiration-vault/noir-cadence/hero.jpg";
const FRAME_IMG = "/inspiration-vault/noir-cadence/frame.jpg";
const LIFESTYLE_IMG = "/inspiration-vault/noir-cadence/lifestyle.jpg";
const PACKAGING_IMG = "/inspiration-vault/noir-cadence/packaging.jpg";
const PRODUCT_NAME = "Noir Cadence";
const PRICE = 100;

const GALLERY = [
  { src: HERO_POSTER,    span: "full", alt: "NOIR CADENCE — hero studio render against pure black background." },
  { src: FRAME_IMG,      span: "half", alt: "NOIR CADENCE — open hoop detail in clear-frame display case." },
  { src: LIFESTYLE_IMG,  span: "half", alt: "NOIR CADENCE — lifestyle portrait, woman in black turtleneck against velvet curtain." },
  { src: PACKAGING_IMG,  span: "full", alt: "NOIR CADENCE — Phileon dust bag presentation with cases." },
];

export default function NoirCadencePage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    document.title = "NOIR CADENCE — Inspiration Vault · PHILEON";
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-noir-cadence",
      name: "NOIR CADENCE — Black Pavé Hoops",
      price: PRICE,
      productKey: "inspirationVaultNoirCadence",
      tierKey: "default",
      metal: "Black Plated",
      sku: "IV-NC-BLK",
      quantity: 1,
      image: HERO_POSTER,
    }, 1, "Black Plated");
  };

  return (
    <div className="nc-page" data-testid="noir-cadence-page">
      <style>{`
        .nc-page {
          --bg:#0a0908;--bg-deep:#06050a;--ink:#cfc8be;--ink-strong:#f4ede0;
          --ink-muted:#7a716a;--accent:#c8a96a;--accent-deep:#8b7339;
          --rule:rgba(200,169,106,.34);--rule-soft:rgba(200,169,106,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#020100 100%);
          color:var(--ink);font-family:'Cormorant Garamond',serif;min-height:100vh;overflow-x:hidden;
        }
        .nc-page .nc-return {
          display:inline-flex;align-items:center;gap:10px;padding:18px 26px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-muted);text-decoration:none;text-transform:uppercase;
          transition:color 280ms ease,gap 280ms ease;
        }
        .nc-page .nc-return:hover { color:var(--accent);gap:16px; }
        .nc-page .nc-eyebrow {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.46em;
          color:var(--accent);text-transform:uppercase;margin:0 0 18px;
        }
        .nc-page .nc-h1 {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(48px,7.2vw,104px);line-height:.96;letter-spacing:.018em;
          color:var(--ink-strong);margin:0 0 22px;text-transform:uppercase;
        }
        .nc-page .nc-subhead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(20px,2vw,28px);color:var(--accent);margin:0;line-height:1.45;
        }
        .nc-section {
          max-width:1180px;margin:0 auto;padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0;transform:translateY(20px);
          animation:ncFade 1s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes ncFade { to { opacity:1;transform:translateY(0); } }
        .nc-section.d1 { animation-delay:.12s; } .nc-section.d2 { animation-delay:.24s; }
        .nc-section.d3 { animation-delay:.36s; } .nc-section.d4 { animation-delay:.48s; }
        /* HERO */
        .nc-hero {
          position:relative;padding:clamp(40px,6vw,90px) clamp(20px,4vw,60px) clamp(60px,8vw,120px);
          display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(48px,6vw,96px);
          align-items:center;max-width:1320px;margin:0 auto;
        }
        @media (max-width:880px){ .nc-hero { grid-template-columns:1fr;gap:48px; } }
        .nc-hero-media {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:#020100;
          border:1px solid var(--rule-soft);box-shadow:0 36px 100px -32px rgba(200,169,106,.35);
        }
        .nc-hero-media::after {
          content:'';position:absolute;inset:-60px;
          background:radial-gradient(60% 60% at 50% 50%,rgba(200,169,106,.32) 0%,transparent 70%);
          z-index:0;filter:blur(60px);pointer-events:none;
        }
        .nc-hero-video {
          position:relative;z-index:1;width:100%;height:100%;object-fit:cover;
          object-position:center;display:block;pointer-events:none;background:#02010a;
          animation:ncRise 1.6s cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes ncRise { from { transform:translateY(56px);opacity:0; } to { transform:translateY(0);opacity:1; } }
        /* DESCRIPTION */
        .nc-desc { text-align:center; }
        .nc-desc-body p {
          font-family:'Cormorant Garamond',serif;font-size:clamp(19px,1.55vw,24px);
          line-height:1.7;color:var(--ink);margin:0 auto 18px;max-width:720px;
        }
        .nc-desc-body p.lead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(22px,2.2vw,30px);color:var(--accent);margin-bottom:30px;
        }
        /* SPECS */
        .nc-specs { background:var(--bg-deep);border-top:1px solid var(--rule-soft);border-bottom:1px solid var(--rule-soft); }
        .nc-specs-grid {
          display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(40px,5vw,80px);align-items:start;
        }
        @media (max-width:880px){ .nc-specs-grid { grid-template-columns:1fr;gap:36px; } }
        .nc-specs-img-wrap {
          aspect-ratio:4/5;overflow:hidden;background:var(--bg);border:1px solid var(--rule-soft);
        }
        .nc-specs-img { width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .nc-specs-img-wrap:hover .nc-specs-img { transform:scale(1.02); }
        .nc-h2 {
          font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(34px,4.4vw,54px);
          line-height:1.05;color:var(--ink-strong);margin:0 0 32px;text-transform:uppercase;letter-spacing:.018em;
        }
        .nc-specs-list { list-style:none;padding:0;margin:24px 0 0; }
        .nc-specs-list li {
          display:grid;grid-template-columns:160px 1fr;gap:18px;padding:14px 0;
          border-bottom:1px solid var(--rule-soft);
        }
        .nc-specs-list dt {
          font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.36em;
          color:var(--accent);text-transform:uppercase;padding-top:2px;
        }
        .nc-specs-list dd { margin:0;font-size:17px;line-height:1.5;color:var(--ink); }
        /* GALLERY */
        .nc-gallery-grid {
          display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,1.8vw,24px);margin-top:36px;
        }
        .nc-gallery-cell {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:var(--bg-deep);
          border:1px solid var(--rule-soft);
        }
        .nc-gallery-cell.full { grid-column:1 / -1;aspect-ratio:16/10; }
        .nc-gallery-cell img {
          width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .nc-gallery-cell:hover img { transform:scale(1.02); }
        @media (max-width:640px){ .nc-gallery-grid { grid-template-columns:1fr; } .nc-gallery-cell.full { aspect-ratio:4/5; } }
        /* CTA */
        .nc-cta { text-align:center; }
        .nc-price-display {
          font-family:'Cinzel',serif;font-size:22px;letter-spacing:.32em;
          color:var(--ink-strong);margin:0 0 10px;
        }
        .nc-price-note {
          font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;
          color:var(--ink-muted);margin:0 0 38px;
        }
        .nc-add-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:12px;
          padding:18px 64px;border:1.5px solid var(--accent);background:transparent;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:.42em;
          color:var(--accent);text-transform:uppercase;cursor:pointer;
          transition:background 380ms ease,color 380ms ease,border-color 380ms ease,transform 280ms ease;
        }
        .nc-add-btn:hover { background:var(--accent);color:var(--bg-deep);transform:translateY(-2px); }
        .nc-add-btn:disabled { opacity:.6;cursor:wait; }
        /* FINAL */
        .nc-final {
          text-align:center;padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#020100;border-top:1px solid var(--rule);
        }
        .nc-final-line {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(24px,2.8vw,38px);line-height:1.5;color:var(--accent);
          max-width:720px;margin:0 auto;
        }
        @media (prefers-reduced-motion: reduce){
          .nc-section,.nc-hero-video { animation:none !important;transform:none !important;opacity:1 !important; }
        }
      `}</style>

      <Link to="/inspiration-vault" className="nc-return" data-testid="nc-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      {/* HERO with VIDEO */}
      <section className="nc-hero" data-testid="nc-hero" style={{ opacity: 0.5 + Math.max(0, 1 - scrollY / 600) * 0.5 }}>
        <div className="nc-hero-media">
          <video
            key="nc-hero-video"
            src={HERO_VIDEO}
            className="nc-hero-video"
            data-testid="nc-hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_POSTER}
            aria-label="NOIR CADENCE — looping product film"
            onLoadedMetadata={(e) => { e.currentTarget.play().catch(() => {}); }}
          />
        </div>
        <div>
          <p className="nc-eyebrow" data-testid="nc-eyebrow">Inspiration Vault</p>
          <h1 className="nc-h1" data-testid="nc-title">Noir Cadence</h1>
          <p className="nc-subhead" data-testid="nc-subhead">Black Stone Pavé-Set Hoop Earrings</p>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="nc-section nc-desc d1" data-testid="nc-desc">
        <p className="nc-eyebrow">Product Description</p>
        <div className="nc-desc-body">
          <p className="lead">Dark elegance with effortless attitude.</p>
          <p>NOIR CADENCE features black synthetic stones meticulously pavé-set across bold geometric hoops, creating a rich, light-catching surface that transitions effortlessly from day to night. Finished in black plating, these earrings deliver maximum impact while remaining surprisingly versatile.</p>
          <p><em>Designed to elevate everything from streetwear to evening looks.</em></p>
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section className="nc-section nc-specs d2" data-testid="nc-specs">
        <div className="nc-specs-grid">
          <div className="nc-specs-img-wrap">
            <img src={FRAME_IMG} alt="NOIR CADENCE — open hoop detail in clear-frame display case." className="nc-specs-img" loading="lazy" />
          </div>
          <div>
            <p className="nc-eyebrow">Specifications</p>
            <h2 className="nc-h2">Architecture. Cadence.</h2>
            <dl className="nc-specs-list">
              <li><dt>Finish</dt><dd>Black plated</dd></li>
              <li><dt>Stones</dt><dd>Black synthetic stones</dd></li>
              <li><dt>Surface</dt><dd>Full pavé-set</dd></li>
              <li><dt>Closure</dt><dd>Secure hinged hoop</dd></li>
              <li><dt>Comfort</dt><dd>Lightweight for daily wear</dd></li>
            </dl>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="nc-section d3" data-testid="nc-gallery">
        <p className="nc-eyebrow" style={{ textAlign:'center' }}>The Look</p>
        <h2 className="nc-h2" style={{ textAlign:'center' }}>Day to night.</h2>
        <div className="nc-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`nc-gallery-cell ${g.span === 'full' ? 'full' : ''}`} data-testid={`nc-gallery-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="nc-section nc-cta d4" data-testid="nc-cta">
        <p className="nc-eyebrow">Price</p>
        <p className="nc-price-display" data-testid="nc-price">${PRICE} USD</p>
        <p className="nc-price-note">Inspiration Vault · Available now</p>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="nc-add-btn"
          data-testid="nc-add-to-cart"
          aria-label="Add Noir Cadence to cart"
        >
          {buttonText || "ADD TO CART"}
        </button>
      </section>

      {/* FINAL */}
      <section className="nc-final" data-testid="nc-final-quote">
        <p className="nc-final-line">
          Bold. Minimal.<br />
          <em>Unapologetically modern.</em>
        </p>
      </section>
    </div>
  );
}
