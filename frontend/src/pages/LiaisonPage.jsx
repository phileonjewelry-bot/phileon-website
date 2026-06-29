import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";

const HERO_IMG = "/inspiration-vault/liaison/hero.jpg";
const HERO_VIDEO = "/inspiration-vault/liaison/hero-video.mp4";
const LIFESTYLE_IMG = "/inspiration-vault/liaison/lifestyle.jpg";
const INBOX_IMG = "/inspiration-vault/liaison/in-box.jpg";
const PACKAGING_IMG = "/inspiration-vault/liaison/packaging.jpg";
const BUST_IMG = "/inspiration-vault/liaison/bust.jpg";
const FLATLAY_IMG = "/inspiration-vault/liaison/flatlay.jpg";
const PRODUCT_NAME = "Liaison";
const PRICE = 50;

const GALLERY = [
  { src: HERO_IMG,      span: "full", alt: "LIAISON — editorial studio hero render, gold infinity-link earrings against marble + black velvet." },
  { src: LIFESTYLE_IMG, span: "half", alt: "LIAISON — worn editorial, woman with curly hair smiling at a café table." },
  { src: INBOX_IMG,     span: "half", alt: "LIAISON — real product in black presentation box, top-down view." },
  { src: PACKAGING_IMG, span: "full", alt: "LIAISON — Phileon branded packaging with product alongside the logo box." },
  { src: BUST_IMG,      span: "half", alt: "LIAISON — black display bust showing the earrings worn at scale." },
  { src: FLATLAY_IMG,   span: "half", alt: "LIAISON — overhead flat-lay composition, infinity-link earrings staged with linen and warm light." },
];

export default function LiaisonPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    document.title = "LIAISON — Inspiration Vault · PHILEON";
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-liaison",
      name: "LIAISON — Infinity Link Earrings",
      price: PRICE,
      productKey: "inspirationVaultLiaison",
      tierKey: "default",
      metal: "Lead-Free Gold-Plated Brass",
      sku: "IV-LIA-GP",
      quantity: 1,
      image: HERO_IMG,
    }, 1, "Lead-Free Gold-Plated Brass");
  };

  return (
    <div className="lia-page" data-testid="liaison-page">
      <style>{`
        .lia-page {
          --bg:#0c0a07;--bg-deep:#06050a;--ink:#d3c8b4;--ink-strong:#f7eed8;
          --ink-muted:#8a7b62;--gold:#d8b86c;--gold-deep:#a18238;
          --rule:rgba(216,184,108,.34);--rule-soft:rgba(216,184,108,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#020100 100%);
          color:var(--ink);font-family:'Cormorant Garamond',serif;min-height:100vh;overflow-x:hidden;
        }
        .lia-page .lia-return {
          display:inline-flex;align-items:center;gap:10px;padding:18px 26px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-muted);text-decoration:none;text-transform:uppercase;
          transition:color 280ms ease,gap 280ms ease;
        }
        .lia-page .lia-return:hover { color:var(--gold);gap:16px; }
        .lia-eyebrow {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.46em;
          color:var(--gold);text-transform:uppercase;margin:0 0 18px;
        }
        .lia-h1 {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(48px,7.2vw,104px);line-height:.96;letter-spacing:.018em;
          color:var(--ink-strong);margin:0 0 22px;text-transform:uppercase;
        }
        .lia-subhead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(20px,2vw,28px);color:var(--gold);margin:0;line-height:1.45;
        }
        .lia-section {
          max-width:1180px;margin:0 auto;padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0;transform:translateY(20px);
          animation:liaFade 1s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes liaFade { to { opacity:1;transform:translateY(0); } }
        .lia-section.d1 { animation-delay:.12s; } .lia-section.d2 { animation-delay:.24s; }
        .lia-section.d3 { animation-delay:.36s; } .lia-section.d4 { animation-delay:.48s; }
        .lia-hero {
          position:relative;padding:clamp(40px,6vw,90px) clamp(20px,4vw,60px) clamp(60px,8vw,120px);
          display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(48px,6vw,96px);
          align-items:center;max-width:1320px;margin:0 auto;
        }
        @media (max-width:880px){ .lia-hero { grid-template-columns:1fr;gap:48px; } }
        .lia-hero-media {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:#020100;
          border:1px solid var(--rule-soft);box-shadow:0 36px 100px -32px rgba(216,184,108,.4);
        }
        .lia-hero-media::after {
          content:'';position:absolute;inset:-60px;
          background:radial-gradient(60% 60% at 50% 50%,rgba(216,184,108,.38) 0%,transparent 70%);
          z-index:0;filter:blur(60px);pointer-events:none;
        }
        .lia-hero-img {
          position:relative;z-index:1;width:100%;height:100%;object-fit:cover;
          object-position:center;display:block;
          animation:liaRise 1.6s cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes liaRise { from { transform:translateY(56px);opacity:0; } to { transform:translateY(0);opacity:1; } }
        .lia-desc { text-align:center; }
        .lia-desc-body p {
          font-family:'Cormorant Garamond',serif;font-size:clamp(19px,1.55vw,24px);
          line-height:1.7;color:var(--ink);margin:0 auto 18px;max-width:720px;
        }
        .lia-desc-body p.lead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(22px,2.2vw,30px);color:var(--gold);margin-bottom:30px;
        }
        .lia-specs { background:var(--bg-deep);border-top:1px solid var(--rule-soft);border-bottom:1px solid var(--rule-soft); }
        .lia-specs-grid {
          display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(40px,5vw,80px);align-items:start;
        }
        @media (max-width:880px){ .lia-specs-grid { grid-template-columns:1fr;gap:36px; } }
        .lia-specs-img-wrap {
          aspect-ratio:4/5;overflow:hidden;background:var(--bg);border:1px solid var(--rule-soft);
        }
        .lia-specs-img { width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .lia-specs-img-wrap:hover .lia-specs-img { transform:scale(1.02); }
        .lia-h2 {
          font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(34px,4.4vw,54px);
          line-height:1.05;color:var(--ink-strong);margin:0 0 32px;text-transform:uppercase;letter-spacing:.018em;
        }
        .lia-specs-list { list-style:none;padding:0;margin:24px 0 0; }
        .lia-specs-list li {
          display:grid;grid-template-columns:160px 1fr;gap:18px;padding:14px 0;
          border-bottom:1px solid var(--rule-soft);
        }
        .lia-specs-list dt {
          font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.36em;
          color:var(--gold);text-transform:uppercase;padding-top:2px;
        }
        .lia-specs-list dd { margin:0;font-size:17px;line-height:1.5;color:var(--ink); }
        .lia-gallery-grid {
          display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,1.8vw,24px);margin-top:36px;
        }
        .lia-gallery-cell {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:var(--bg-deep);
          border:1px solid var(--rule-soft);
        }
        .lia-gallery-cell.full { grid-column:1 / -1;aspect-ratio:16/10; }
        .lia-gallery-cell img {
          width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .lia-gallery-cell:hover img { transform:scale(1.03); }
        @media (max-width:640px){ .lia-gallery-grid { grid-template-columns:1fr; } .lia-gallery-cell.full { aspect-ratio:4/5; } }
        .lia-cta { text-align:center; }
        .lia-price-display {
          font-family:'Cinzel',serif;font-size:22px;letter-spacing:.32em;
          color:var(--ink-strong);margin:0 0 10px;
        }
        .lia-price-note {
          font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;
          color:var(--ink-muted);margin:0 0 38px;
        }
        .lia-add-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:12px;
          padding:18px 64px;border:1.5px solid var(--gold);background:transparent;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:.42em;
          color:var(--gold);text-transform:uppercase;cursor:pointer;
          transition:background 380ms ease,color 380ms ease,border-color 380ms ease,transform 280ms ease;
        }
        .lia-add-btn:hover { background:var(--gold);color:var(--bg-deep);transform:translateY(-2px); }
        .lia-add-btn:disabled { opacity:.6;cursor:wait; }
        .lia-final {
          text-align:center;padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#020100;border-top:1px solid var(--rule);
        }
        .lia-final-line {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(24px,2.8vw,38px);line-height:1.5;color:var(--gold);
          max-width:720px;margin:0 auto;
        }
        @media (prefers-reduced-motion: reduce){
          .lia-section,.lia-hero-img { animation:none !important;transform:none !important;opacity:1 !important; }
        }
      `}</style>

      <Link to="/inspiration-vault" className="lia-return" data-testid="lia-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      {/* HERO — universal Vault hero (image → 1.7s hold → crossfade → muted looping video) */}
      <VaultHero
        image={HERO_IMG}
        video={HERO_VIDEO}
        altText="LIAISON — editorial hero render, gold infinity-link earrings against marble and black velvet."
        eyebrow="Inspiration Vault"
        title="Liaison"
        subhead="Infinity Link Earrings"
      />

      {/* DESCRIPTION */}
      <section className="lia-section lia-desc d1" data-testid="lia-desc">
        <p className="lia-eyebrow">Description</p>
        <div className="lia-desc-body">
          <p className="lead">Simple lines. Endless connection.</p>
          <p>LIAISON transforms the classic chain link into a refined statement piece. Its polished silhouette catches the light from every angle while remaining effortlessly wearable from day to night.</p>
          <p><em>Crafted from lead-free gold-plated brass, it delivers elevated style at an accessible price.</em></p>
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section className="lia-section lia-specs d2" data-testid="lia-specs">
        <div className="lia-specs-grid">
          <div className="lia-specs-img-wrap">
            <img src={BUST_IMG} alt="LIAISON — worn on a matte-black display bust for scale and silhouette." className="lia-specs-img" loading="lazy" />
          </div>
          <div>
            <p className="lia-eyebrow">Specifications</p>
            <h2 className="lia-h2">Polished. Connected.</h2>
            <dl className="lia-specs-list">
              <li><dt>Material</dt><dd>Lead-Free Gold-Plated Brass</dd></li>
              <li><dt>Finish</dt><dd>High Polish Gold</dd></li>
              <li><dt>Style</dt><dd>Infinity Link Drop Earrings</dd></li>
              <li><dt>Collection</dt><dd>Inspiration Vault</dd></li>
              <li><dt>Price</dt><dd>$50 USD</dd></li>
            </dl>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="lia-section d3" data-testid="lia-gallery">
        <p className="lia-eyebrow" style={{ textAlign:'center' }}>The Look</p>
        <h2 className="lia-h2" style={{ textAlign:'center' }}>Day to night.</h2>
        <div className="lia-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`lia-gallery-cell ${g.span === 'full' ? 'full' : ''}`} data-testid={`lia-gallery-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lia-section lia-cta d4" data-testid="lia-cta">
        <p className="lia-eyebrow">Price</p>
        <p className="lia-price-display" data-testid="lia-price">${PRICE} USD</p>
        <p className="lia-price-note">Inspiration Vault · In Stock</p>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="lia-add-btn"
          data-testid="lia-add-to-cart"
          aria-label="Add Liaison to cart"
        >
          {buttonText || "ADD TO CART"}
        </button>
      </section>

      {/* FINAL */}
      <section className="lia-final" data-testid="lia-final-quote">
        <p className="lia-final-line">
          Simple lines.<br />
          <em>Endless connection.</em>
        </p>
      </section>
    </div>
  );
}
