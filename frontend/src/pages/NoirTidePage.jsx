import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";

const HERO_IMG = "/inspiration-vault/noir-tide/hero.jpg";
const STUDIO_BLACK_IMG = "/inspiration-vault/noir-tide/studio-black.jpg";
const ON_EAR_IMG = "/inspiration-vault/noir-tide/on-ear.jpg";
const LIFESTYLE_IMG = "/inspiration-vault/noir-tide/lifestyle.jpg";
const MACRO_IMG = "/inspiration-vault/noir-tide/macro.jpg";
const PRODUCT_NAME = "Noir Tide";
const PRICE = 100;

// Gallery order requested:
// 1. Editorial Hero (studio pair) — full
// 2. Black Background Studio Pair — half
// 3. On-Ear Bust — half
// 4. Lifestyle Portrait — full
// 5. Macro Detail — half (centered via second cell empty? — use full to keep grid clean)
const GALLERY = [
  { src: HERO_IMG,         span: "full", alt: "NOIR TIDE — editorial studio render, sculptural black & white pavé drop earrings on dark backdrop." },
  { src: STUDIO_BLACK_IMG, span: "half", alt: "NOIR TIDE — both earrings flat on a pure black velvet background." },
  { src: ON_EAR_IMG,       span: "half", alt: "NOIR TIDE — single earring worn on a black mannequin bust, scale + silhouette." },
  { src: LIFESTYLE_IMG,    span: "full", alt: "NOIR TIDE — lifestyle portrait, woman in black halter top against city dusk light." },
  { src: MACRO_IMG,        span: "full", alt: "NOIR TIDE — extreme macro of black and white cubic zirconia pavé bands woven together." },
];

export default function NoirTidePage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    document.title = "NOIR TIDE — Inspiration Vault · PHILEON";
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-noir-tide",
      name: "NOIR TIDE — Black & White Pavé Sculptural Earrings",
      price: PRICE,
      productKey: "inspirationVaultNoirTide",
      tierKey: "default",
      metal: "White Rhodium Plated Brass",
      sku: "IV-NT-WRP",
      quantity: 1,
      image: HERO_IMG,
    }, 1, "White Rhodium Plated Brass");
  };

  return (
    <div className="nt-page" data-testid="noir-tide-page">
      <style>{`
        .nt-page {
          --bg:#050505;--bg-deep:#020202;--ink:#cfc8be;--ink-strong:#f4ede0;
          --ink-muted:#7a716a;--gold:#c8a24a;--gold-deep:#8b7339;
          --rule:rgba(200,162,74,.34);--rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink);font-family:'Cormorant Garamond',serif;min-height:100vh;overflow-x:hidden;
        }
        .nt-page .nt-return {
          display:inline-flex;align-items:center;gap:10px;padding:18px 26px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-muted);text-decoration:none;text-transform:uppercase;
          transition:color 280ms ease,gap 280ms ease;
        }
        .nt-page .nt-return:hover { color:var(--gold);gap:16px; }
        .nt-eyebrow {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.46em;
          color:var(--gold);text-transform:uppercase;margin:0 0 18px;
        }
        .nt-h1 {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(48px,7.2vw,104px);line-height:.96;letter-spacing:.018em;
          color:var(--ink-strong);margin:0 0 22px;text-transform:uppercase;
        }
        .nt-subhead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(20px,2vw,28px);color:var(--gold);margin:0;line-height:1.45;
        }
        .nt-section {
          max-width:1180px;margin:0 auto;padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0;transform:translateY(20px);
          animation:ntFade 1s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes ntFade { to { opacity:1;transform:translateY(0); } }
        .nt-section.d1 { animation-delay:.12s; } .nt-section.d2 { animation-delay:.24s; }
        .nt-section.d3 { animation-delay:.36s; } .nt-section.d4 { animation-delay:.48s; }
        .nt-hero {
          position:relative;padding:clamp(40px,6vw,90px) clamp(20px,4vw,60px) clamp(60px,8vw,120px);
          display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(48px,6vw,96px);
          align-items:center;max-width:1320px;margin:0 auto;
        }
        @media (max-width:880px){ .nt-hero { grid-template-columns:1fr;gap:48px; } }
        .nt-hero-media {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:#020100;
          border:1px solid var(--rule-soft);box-shadow:0 36px 100px -32px rgba(200,162,74,.4);
        }
        .nt-hero-media::after {
          content:'';position:absolute;inset:-60px;
          background:radial-gradient(60% 60% at 50% 50%,rgba(200,162,74,.32) 0%,transparent 70%);
          z-index:0;filter:blur(60px);pointer-events:none;
        }
        .nt-hero-img {
          position:relative;z-index:1;width:100%;height:100%;object-fit:cover;
          object-position:center;display:block;
          animation:ntRise 1.6s cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes ntRise { from { transform:translateY(56px);opacity:0; } to { transform:translateY(0);opacity:1; } }
        .nt-desc { text-align:center; }
        .nt-desc-body p {
          font-family:'Cormorant Garamond',serif;font-size:clamp(19px,1.55vw,24px);
          line-height:1.7;color:var(--ink);margin:0 auto 18px;max-width:720px;
        }
        .nt-desc-body p.lead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(22px,2.2vw,30px);color:var(--gold);margin-bottom:30px;
        }
        .nt-specs { background:var(--bg-deep);border-top:1px solid var(--rule-soft);border-bottom:1px solid var(--rule-soft); }
        .nt-specs-grid {
          display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(40px,5vw,80px);align-items:start;
        }
        @media (max-width:880px){ .nt-specs-grid { grid-template-columns:1fr;gap:36px; } }
        .nt-specs-img-wrap {
          aspect-ratio:4/5;overflow:hidden;background:var(--bg);border:1px solid var(--rule-soft);
        }
        .nt-specs-img { width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .nt-specs-img-wrap:hover .nt-specs-img { transform:scale(1.02); }
        .nt-h2 {
          font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(34px,4.4vw,54px);
          line-height:1.05;color:var(--ink-strong);margin:0 0 32px;text-transform:uppercase;letter-spacing:.018em;
        }
        .nt-specs-list { list-style:none;padding:0;margin:24px 0 0; }
        .nt-specs-list li {
          display:grid;grid-template-columns:160px 1fr;gap:18px;padding:14px 0;
          border-bottom:1px solid var(--rule-soft);
        }
        .nt-specs-list dt {
          font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.36em;
          color:var(--gold);text-transform:uppercase;padding-top:2px;
        }
        .nt-specs-list dd { margin:0;font-size:17px;line-height:1.5;color:var(--ink); }
        .nt-gallery-grid {
          display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,1.8vw,24px);margin-top:36px;
        }
        .nt-gallery-cell {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:var(--bg-deep);
          border:1px solid var(--rule-soft);
        }
        .nt-gallery-cell.full { grid-column:1 / -1;aspect-ratio:16/10; }
        .nt-gallery-cell img {
          width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .nt-gallery-cell:hover img { transform:scale(1.03); }
        @media (max-width:640px){ .nt-gallery-grid { grid-template-columns:1fr; } .nt-gallery-cell.full { aspect-ratio:4/5; } }
        .nt-cta { text-align:center; }
        .nt-price-display {
          font-family:'Cinzel',serif;font-size:22px;letter-spacing:.32em;
          color:var(--ink-strong);margin:0 0 10px;
        }
        .nt-price-note {
          font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;
          color:var(--ink-muted);margin:0 0 38px;
        }
        .nt-add-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:12px;
          padding:18px 64px;border:1.5px solid var(--gold);background:transparent;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:.42em;
          color:var(--gold);text-transform:uppercase;cursor:pointer;
          transition:background 380ms ease,color 380ms ease,border-color 380ms ease,transform 280ms ease;
        }
        .nt-add-btn:hover { background:var(--gold);color:var(--bg-deep);transform:translateY(-2px); }
        .nt-add-btn:disabled { opacity:.6;cursor:wait; }
        .nt-final {
          text-align:center;padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000;border-top:1px solid var(--rule);
        }
        .nt-final-line {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(24px,2.8vw,38px);line-height:1.5;color:var(--gold);
          max-width:720px;margin:0 auto;
        }
        .nt-final-attr {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.46em;
          color:var(--ink-muted);text-transform:uppercase;margin-top:22px;
        }
        @media (prefers-reduced-motion: reduce){
          .nt-section,.nt-hero-img { animation:none !important;transform:none !important;opacity:1 !important; }
        }
      `}</style>

      <Link to="/inspiration-vault" className="nt-return" data-testid="nt-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      {/* HERO — universal Vault hero (image only — no video) */}
      <VaultHero
        image={HERO_IMG}
        video={null}
        altText="NOIR TIDE — editorial studio render, sculptural black & white pavé drop earrings on a dark backdrop."
        eyebrow="Inspiration Vault"
        title="Noir Tide"
        subhead="Light and shadow, spiraling."
      />

      {/* DESCRIPTION */}
      <section className="nt-section nt-desc d1" data-testid="nt-desc">
        <p className="nt-eyebrow">Description</p>
        <div className="nt-desc-body">
          <p className="lead">Light and shadow spiral together in a sculptural silhouette.</p>
          <p>Designed as a study in movement, contrast, and endless flow — NOIR TIDE answers brilliance with depth, weaving black and white cubic zirconia through woven rhodium-plated ribbons that twist into a drop shaped like a tide.</p>
          <p><em>A piece built for the moment a room turns to look.</em></p>
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section className="nt-section nt-specs d2" data-testid="nt-specs">
        <div className="nt-specs-grid">
          <div className="nt-specs-img-wrap">
            <img src={ON_EAR_IMG} alt="NOIR TIDE — worn on a black mannequin bust for scale and silhouette." className="nt-specs-img" loading="lazy" />
          </div>
          <div>
            <p className="nt-eyebrow">Specifications</p>
            <h2 className="nt-h2">Contrast. Movement. Light.</h2>
            <dl className="nt-specs-list">
              <li><dt>Material</dt><dd>White Rhodium Plated Brass</dd></li>
              <li><dt>Stones</dt><dd>Black &amp; White Cubic Zirconia</dd></li>
              <li><dt>Style</dt><dd>Sculptural Drop Earrings</dd></li>
              <li><dt>Collection</dt><dd>Inspiration Vault</dd></li>
              <li><dt>Price</dt><dd>$100 USD</dd></li>
              <li><dt>Availability</dt><dd>Inspiration Vault · In Stock</dd></li>
            </dl>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="nt-section d3" data-testid="nt-gallery">
        <p className="nt-eyebrow" style={{ textAlign:'center' }}>The Look</p>
        <h2 className="nt-h2" style={{ textAlign:'center' }}>From every angle.</h2>
        <div className="nt-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`nt-gallery-cell ${g.span === 'full' ? 'full' : ''}`} data-testid={`nt-gallery-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="nt-section nt-cta d4" data-testid="nt-cta">
        <p className="nt-eyebrow">Price</p>
        <p className="nt-price-display" data-testid="nt-price">${PRICE} USD</p>
        <p className="nt-price-note">Inspiration Vault · In Stock</p>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="nt-add-btn"
          data-testid="nt-add-to-cart"
          aria-label="Add Noir Tide to cart"
        >
          {buttonText || "ADD TO CART"}
        </button>
      </section>

      {/* ARCHIVE NOTICE */}
      <VaultArchiveNotice />

      {/* FINAL */}
      <section className="nt-final" data-testid="nt-final-quote">
        <p className="nt-final-line">
          “Contrast reveals brilliance.”
        </p>
        <p className="nt-final-attr">— PHILEON</p>
      </section>
    </div>
  );
}
