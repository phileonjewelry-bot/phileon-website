import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";

const HERO_IMG = "/inspiration-vault/orbit-lumiere/hero.jpg";
const MACRO_IMG = "/inspiration-vault/orbit-lumiere/macro.png";
const ON_EAR_IMG = "/inspiration-vault/orbit-lumiere/on-ear.jpg";
const ON_EAR_PROFILE_IMG = "/inspiration-vault/orbit-lumiere/on-ear-profile.jpg";
const LIFESTYLE_IMG = "/inspiration-vault/orbit-lumiere/lifestyle.jpg";
const PRICE = 175;

// Gallery: Object → Observation → Craft → Scale (per Blueprint).
// "Motion" cell omitted gracefully — no hero video provided yet. The hero
// will reveal it automatically when the manifest's heroVideo flips on.
const GALLERY = [
  { src: HERO_IMG,             span: "full", alt: "ORBIT LUMIÈRE — editorial studio pair, oversized pavé hoops on a black acrylic stand with mirror reflection." },
  { src: MACRO_IMG,             span: "full", alt: "ORBIT LUMIÈRE — macro detail of the pavé arcs and floating crystal spheres, 18K hallmark visible." },
  { src: ON_EAR_IMG,            span: "half", alt: "ORBIT LUMIÈRE — on-ear bust, 3/4 angle showing scale and silhouette." },
  { src: ON_EAR_PROFILE_IMG,    span: "half", alt: "ORBIT LUMIÈRE — on-ear bust, profile angle catching light through the open cage." },
  { src: LIFESTYLE_IMG,         span: "full", alt: "ORBIT LUMIÈRE — lifestyle portrait, worn in a softly lit boutique mirror." },
];

export default function OrbitLumierePage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "ORBIT LUMIÈRE — Inspiration Vault · PHILEON";
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-orbit-lumiere",
      name: "ORBIT LUMIÈRE — Oversized Architectural Pavé Hoop Earrings",
      price: PRICE,
      productKey: "inspirationVaultOrbitLumiere",
      tierKey: "default",
      metal: "Rhodium-Plated Alloy",
      sku: "IV-OL-RPA",
      quantity: 1,
      image: HERO_IMG,
    }, 1, "Rhodium-Plated Alloy");
  };

  return (
    <div className="ol-page" data-testid="orbit-lumiere-page">
      <style>{`
        .ol-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .ol-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .ol-return:hover { color:var(--gold); gap:16px; }
        .ol-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .ol-section { max-width:1180px; margin:0 auto; padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:olFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes olFade { to { opacity:1; transform:translateY(0); } }
        .ol-section.d1 { animation-delay:.12s; } .ol-section.d2 { animation-delay:.24s; }
        .ol-section.d3 { animation-delay:.36s; } .ol-section.d4 { animation-delay:.48s; }
        .ol-desc { text-align:center; }
        .ol-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .ol-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .ol-specs { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); }
        .ol-specs-grid { display:grid; grid-template-columns:.85fr 1.15fr; gap:clamp(40px,5vw,80px); align-items:start; }
        @media (max-width:880px){ .ol-specs-grid { grid-template-columns:1fr; gap:36px; } }
        .ol-specs-img-wrap { aspect-ratio:4/5; overflow:hidden; background:var(--bg); border:1px solid var(--rule-soft); }
        .ol-specs-img { width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .ol-specs-img-wrap:hover .ol-specs-img { transform:scale(1.02); }
        .ol-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(34px,4.4vw,54px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 32px; text-transform:uppercase; letter-spacing:.018em; }
        .ol-specs-list { list-style:none; padding:0; margin:24px 0 0; }
        .ol-specs-list li { display:grid; grid-template-columns:200px 1fr; gap:18px; padding:14px 0;
          border-bottom:1px solid var(--rule-soft); }
        .ol-specs-list dt { font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.36em;
          color:var(--gold); text-transform:uppercase; padding-top:2px; }
        .ol-specs-list dd { margin:0; font-size:17px; line-height:1.5; color:var(--ink); }
        .ol-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .ol-gallery-cell { position:relative; aspect-ratio:1/1; overflow:hidden;
          background:var(--bg-deep); border:1px solid var(--rule-soft); }
        .ol-gallery-cell.full { grid-column:1 / -1; aspect-ratio:16/10; }
        .ol-gallery-cell img { width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .ol-gallery-cell:hover img { transform:scale(1.03); }
        @media (max-width:640px){ .ol-gallery-grid { grid-template-columns:1fr; } .ol-gallery-cell.full { aspect-ratio:4/5; } }
        .ol-cta { text-align:center; }
        .ol-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .ol-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 38px; }
        .ol-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .ol-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .ol-add-btn:disabled { opacity:.6; cursor:wait; }
        .ol-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px); background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .ol-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .ol-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }
      `}</style>

      <Link to="/inspiration-vault" className="ol-return" data-testid="ol-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_IMG}
        video={null}
        altText="ORBIT LUMIÈRE — editorial studio pair, oversized pavé hoops on a black acrylic stand with mirror reflection."
        eyebrow="Inspiration Vault"
        title="Orbit Lumière"
        subhead="Light doesn't decorate the design. It completes it."
      />

      <section className="ol-section ol-desc d1" data-testid="ol-desc">
        <p className="ol-eyebrow">Editorial</p>
        <div className="ol-desc-body">
          <p className="lead">Motion through light.</p>
          <p>Orbit Lumière explores motion through light. Concentric pavé-set arcs surround floating crystal spheres, creating a sculptural silhouette that shifts with every movement.</p>
          <p>Bold in scale yet refined in execution, it transforms the classic hoop into wearable architecture designed to catch light from every angle.</p>
        </div>
      </section>

      <section className="ol-section ol-specs d2" data-testid="ol-specs">
        <div className="ol-specs-grid">
          <div className="ol-specs-img-wrap">
            <img src={ON_EAR_IMG} alt="ORBIT LUMIÈRE — worn for scale + silhouette." className="ol-specs-img" loading="lazy" />
          </div>
          <div>
            <p className="ol-eyebrow">Specifications</p>
            <h2 className="ol-h2">Architecture, on the ear.</h2>
            <dl className="ol-specs-list">
              <li><dt>Material</dt><dd>Rhodium-Plated Alloy</dd></li>
              <li><dt>Finish</dt><dd>White Pavé Crystal</dd></li>
              <li><dt>Form</dt><dd>Sculptural Open-Cage Design</dd></li>
              <li><dt>Detail</dt><dd>Floating Crystal Sphere Centres</dd></li>
              <li><dt>Scale</dt><dd>Oversized Statement Hoop</dd></li>
              <li><dt>Construction</dt><dd>Lightweight</dd></li>
              <li><dt>Closure</dt><dd>Hinged</dd></li>
              <li><dt>Collection</dt><dd>Inspiration Vault Exclusive</dd></li>
              <li><dt>Price</dt><dd>$175 USD</dd></li>
            </dl>
          </div>
        </div>
      </section>

      <section className="ol-section d3" data-testid="ol-gallery">
        <p className="ol-eyebrow" style={{ textAlign:'center' }}>The Look</p>
        <h2 className="ol-h2" style={{ textAlign:'center' }}>From every angle.</h2>
        <div className="ol-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`ol-gallery-cell ${g.span === 'full' ? 'full' : ''}`} data-testid={`ol-gallery-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="ol-section ol-cta d4" data-testid="ol-cta">
        <p className="ol-eyebrow">Price</p>
        <p className="ol-price-display" data-testid="ol-price">${PRICE} USD</p>
        <p className="ol-price-note">Inspiration Vault · In Stock</p>
        <button onClick={onAddToCart} disabled={isAdding} className="ol-add-btn"
          data-testid="ol-add-to-cart" aria-label="Add Orbit Lumière to cart">
          {buttonText || "ADD TO CART"}
        </button>
      </section>

      <section className="ol-final" data-testid="ol-final-quote">
        <p className="ol-final-line">&ldquo;Light doesn&rsquo;t decorate the design. It completes it.&rdquo;</p>
        <p className="ol-final-attr">— PHILEON</p>
      </section>
    </div>
  );
}
