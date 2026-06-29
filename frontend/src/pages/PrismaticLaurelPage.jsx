import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";

const HERO_IMG = "/inspiration-vault/prismatic-laurel/hero.jpg";
const HERO_VIDEO = "/inspiration-vault/prismatic-laurel/hero-video.mp4";
const STUDIO_WHITE_IMG = "/inspiration-vault/prismatic-laurel/studio-white.png";
const LIFESTYLE_IMG = "/inspiration-vault/prismatic-laurel/lifestyle.jpg";
const MACRO_IMG = "/inspiration-vault/prismatic-laurel/macro.jpg";
const PRODUCT_NAME = "Prismatic Laurel";
const PRICE = 70;

const GALLERY = [
  { src: HERO_IMG,         span: "full", alt: "PRISMATIC LAUREL — editorial studio hero, multicolour emerald-cut pavé sculptural drop earrings on a dark backdrop with prismatic light refraction." },
  { src: STUDIO_WHITE_IMG, span: "half", alt: "PRISMATIC LAUREL — clean white-background studio pair, top-down composition." },
  { src: LIFESTYLE_IMG,    span: "half", alt: "PRISMATIC LAUREL — lifestyle portrait, model in a black dress, warm interior dusk lighting." },
  { src: MACRO_IMG,        span: "full", alt: "PRISMATIC LAUREL — extreme macro detail of multicolour emerald-cut cubic zirconia and clear accent stones in pavé setting." },
];

export default function PrismaticLaurelPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    document.title = "PRISMATIC LAUREL — Inspiration Vault · PHILEON";
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-prismatic-laurel",
      name: "PRISMATIC LAUREL — Multicolour Emerald-Cut Sculptural Earrings",
      price: PRICE,
      productKey: "inspirationVaultPrismaticLaurel",
      tierKey: "default",
      metal: "Rhodium-Plated Alloy",
      sku: "IV-PL-RPA",
      quantity: 1,
      image: HERO_IMG,
    }, 1, "Rhodium-Plated Alloy");
  };

  return (
    <div className="pl-page" data-testid="prismatic-laurel-page">
      <style>{`
        .pl-page {
          --bg:#050505;--bg-deep:#020202;--ink:#cfc8be;--ink-strong:#f4ede0;
          --ink-muted:#7a716a;--gold:#c8a24a;--gold-deep:#8b7339;
          --rule:rgba(200,162,74,.34);--rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink);font-family:'Cormorant Garamond',serif;min-height:100vh;overflow-x:hidden;
        }
        .pl-page .pl-return {
          display:inline-flex;align-items:center;gap:10px;padding:18px 26px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-muted);text-decoration:none;text-transform:uppercase;
          transition:color 280ms ease,gap 280ms ease;
        }
        .pl-page .pl-return:hover { color:var(--gold);gap:16px; }
        .pl-eyebrow {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.46em;
          color:var(--gold);text-transform:uppercase;margin:0 0 18px;
        }
        .pl-h1 {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(48px,7vw,100px);line-height:.96;letter-spacing:.018em;
          color:var(--ink-strong);margin:0 0 22px;text-transform:uppercase;
        }
        .pl-subhead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(20px,2vw,28px);color:var(--gold);margin:0;line-height:1.45;
        }
        .pl-section {
          max-width:1180px;margin:0 auto;padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0;transform:translateY(20px);
          animation:plFade 1s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes plFade { to { opacity:1;transform:translateY(0); } }
        .pl-section.d1 { animation-delay:.12s; } .pl-section.d2 { animation-delay:.24s; }
        .pl-section.d3 { animation-delay:.36s; } .pl-section.d4 { animation-delay:.48s; }
        .pl-hero {
          position:relative;padding:clamp(40px,6vw,90px) clamp(20px,4vw,60px) clamp(60px,8vw,120px);
          display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(48px,6vw,96px);
          align-items:center;max-width:1320px;margin:0 auto;
        }
        @media (max-width:880px){ .pl-hero { grid-template-columns:1fr;gap:48px; } }
        .pl-hero-media {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:#020100;
          border:1px solid var(--rule-soft);box-shadow:0 36px 100px -32px rgba(200,162,74,.4);
        }
        .pl-hero-media::after {
          content:'';position:absolute;inset:-60px;
          background:radial-gradient(60% 60% at 50% 50%,rgba(200,162,74,.32) 0%,transparent 70%);
          z-index:0;filter:blur(60px);pointer-events:none;
        }
        .pl-hero-video {
          position:relative;z-index:1;width:100%;height:100%;object-fit:cover;
          object-position:center;display:block;
          animation:plRise 1.6s cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes plRise { from { transform:translateY(56px);opacity:0; } to { transform:translateY(0);opacity:1; } }
        .pl-desc { text-align:center; }
        .pl-desc-body p {
          font-family:'Cormorant Garamond',serif;font-size:clamp(19px,1.55vw,24px);
          line-height:1.7;color:var(--ink);margin:0 auto 18px;max-width:720px;
        }
        .pl-desc-body p.lead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(22px,2.2vw,30px);color:var(--gold);margin-bottom:30px;
        }
        .pl-specs { background:var(--bg-deep);border-top:1px solid var(--rule-soft);border-bottom:1px solid var(--rule-soft); }
        .pl-specs-grid {
          display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(40px,5vw,80px);align-items:start;
        }
        @media (max-width:880px){ .pl-specs-grid { grid-template-columns:1fr;gap:36px; } }
        .pl-specs-img-wrap {
          aspect-ratio:4/5;overflow:hidden;background:var(--bg);border:1px solid var(--rule-soft);
        }
        .pl-specs-img { width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .pl-specs-img-wrap:hover .pl-specs-img { transform:scale(1.02); }
        .pl-h2 {
          font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(34px,4.4vw,54px);
          line-height:1.05;color:var(--ink-strong);margin:0 0 32px;text-transform:uppercase;letter-spacing:.018em;
        }
        .pl-specs-list { list-style:none;padding:0;margin:24px 0 0; }
        .pl-specs-list li {
          display:grid;grid-template-columns:170px 1fr;gap:18px;padding:14px 0;
          border-bottom:1px solid var(--rule-soft);
        }
        .pl-specs-list dt {
          font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.36em;
          color:var(--gold);text-transform:uppercase;padding-top:2px;
        }
        .pl-specs-list dd { margin:0;font-size:17px;line-height:1.5;color:var(--ink); }
        .pl-gallery-grid {
          display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,1.8vw,24px);margin-top:36px;
        }
        .pl-gallery-cell {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:var(--bg-deep);
          border:1px solid var(--rule-soft);
        }
        .pl-gallery-cell.full { grid-column:1 / -1;aspect-ratio:16/10; }
        .pl-gallery-cell img {
          width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .pl-gallery-cell:hover img { transform:scale(1.03); }
        @media (max-width:640px){ .pl-gallery-grid { grid-template-columns:1fr; } .pl-gallery-cell.full { aspect-ratio:4/5; } }
        .pl-cta { text-align:center; }
        .pl-price-display {
          font-family:'Cinzel',serif;font-size:22px;letter-spacing:.32em;
          color:var(--ink-strong);margin:0 0 10px;
        }
        .pl-price-note {
          font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;
          color:var(--ink-muted);margin:0 0 38px;
        }
        .pl-add-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:12px;
          padding:18px 64px;border:1.5px solid var(--gold);background:transparent;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:.42em;
          color:var(--gold);text-transform:uppercase;cursor:pointer;
          transition:background 380ms ease,color 380ms ease,border-color 380ms ease,transform 280ms ease;
        }
        .pl-add-btn:hover { background:var(--gold);color:var(--bg-deep);transform:translateY(-2px); }
        .pl-add-btn:disabled { opacity:.6;cursor:wait; }
        .pl-final {
          text-align:center;padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000;border-top:1px solid var(--rule);
        }
        .pl-final-line {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(24px,2.8vw,38px);line-height:1.5;color:var(--gold);
          max-width:760px;margin:0 auto;
        }
        .pl-final-attr {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.46em;
          color:var(--ink-muted);text-transform:uppercase;margin-top:22px;
        }
        @media (prefers-reduced-motion: reduce){
          .pl-section,.pl-hero-video { animation:none !important;transform:none !important;opacity:1 !important; }
        }
      `}</style>

      <Link to="/inspiration-vault" className="pl-return" data-testid="pl-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      {/* HERO — universal Vault hero (image → 1.7s hold → crossfade → muted looping video) */}
      <VaultHero
        image={HERO_IMG}
        video={HERO_VIDEO}
        altText="PRISMATIC LAUREL — editorial studio hero, multicolour emerald-cut pavé sculptural drop earrings on a dark backdrop with prismatic light refraction."
        eyebrow="Inspiration Vault"
        title="Prismatic Laurel"
        subhead="A study in colour and balance."
      />

      {/* DESCRIPTION */}
      <section className="pl-section pl-desc d1" data-testid="pl-desc">
        <p className="pl-eyebrow">Editorial</p>
        <div className="pl-desc-body">
          <p className="lead">A study in colour and balance.</p>
          <p>Prismatic Laurel brings together sculptural curves and a vibrant arrangement of emerald-cut stones in a composition that feels both playful and composed.</p>
          <p>Curated from the Inspiration Vault, this piece reflects the discoveries that have shaped PHILEON&rsquo;s creative journey.</p>
          <p><em>It is presented as found&mdash;not created.</em></p>
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section className="pl-section pl-specs d2" data-testid="pl-specs">
        <div className="pl-specs-grid">
          <div className="pl-specs-img-wrap">
            <img src={LIFESTYLE_IMG} alt="PRISMATIC LAUREL — worn lifestyle portrait, model in a dim interior." className="pl-specs-img" loading="lazy" />
          </div>
          <div>
            <p className="pl-eyebrow">Specifications</p>
            <h2 className="pl-h2">Sculptural curves. Coloured light.</h2>
            <dl className="pl-specs-list">
              <li><dt>Material</dt><dd>Rhodium-Plated Alloy</dd></li>
              <li><dt>Stones</dt><dd>Multicolour Emerald-Cut Cubic Zirconia</dd></li>
              <li><dt>Accents</dt><dd>Clear Accent Stones</dd></li>
              <li><dt>Closure</dt><dd>Stud Back</dd></li>
              <li><dt>Construction</dt><dd>Lightweight</dd></li>
              <li><dt>Collection</dt><dd>Inspiration Vault</dd></li>
              <li><dt>Price</dt><dd>$70 USD</dd></li>
            </dl>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="pl-section d3" data-testid="pl-gallery">
        <p className="pl-eyebrow" style={{ textAlign:'center' }}>The Look</p>
        <h2 className="pl-h2" style={{ textAlign:'center' }}>From every angle.</h2>
        <div className="pl-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`pl-gallery-cell ${g.span === 'full' ? 'full' : ''}`} data-testid={`pl-gallery-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pl-section pl-cta d4" data-testid="pl-cta">
        <p className="pl-eyebrow">Price</p>
        <p className="pl-price-display" data-testid="pl-price">${PRICE} USD</p>
        <p className="pl-price-note">Inspiration Vault · In Stock</p>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="pl-add-btn"
          data-testid="pl-add-to-cart"
          aria-label="Add Prismatic Laurel to cart"
        >
          {buttonText || "ADD TO CART"}
        </button>
      </section>

      {/* FINAL */}
      <section className="pl-final" data-testid="pl-final-quote">
        <p className="pl-final-line">
          &ldquo;Every collection begins with a moment of inspiration.&rdquo;
        </p>
        <p className="pl-final-attr">— PHILEON</p>
      </section>
    </div>
  );
}
