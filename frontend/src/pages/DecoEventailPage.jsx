import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

const HERO_IMG = "/inspiration-vault/deco-eventail/hero.jpg";
const HERO_VIDEO = "/inspiration-vault/deco-eventail/hero.mp4";
const HAND_SILK_IMG   = "/inspiration-vault/deco-eventail/hand-silk.jpg";
const HAND_BLACK_IMG  = "/inspiration-vault/deco-eventail/hand-black.jpg";
const HAND_BOXES_IMG  = "/inspiration-vault/deco-eventail/hand-boxes.jpg";
const MACRO_HAND_IMG  = "/inspiration-vault/deco-eventail/macro-hand.jpg";
const MOTION_01_VIDEO = "/inspiration-vault/deco-eventail/motion-01.mp4";
const MOTION_02_VIDEO = "/inspiration-vault/deco-eventail/motion-02.mp4";
const PRICE = 60;

// Gallery: Object → Worn → Lifestyle → Macro → Motion (per Blueprint rhythm).
// Video cells: silent, muted, autoloop — same discipline as VaultHero.
const GALLERY = [
  { type: "img",   src: HERO_IMG,        span: "full",          alt: "DECO ÉVENTAIL — Art Deco fan cocktail ring, cinematic studio portrait against deep black with soft lens flares." },
  { type: "img",   src: HAND_SILK_IMG,   span: "half",          alt: "DECO ÉVENTAIL — worn against dark silk, catching soft directional light along the pavé arcs." },
  { type: "img",   src: HAND_BLACK_IMG,  span: "half",          alt: "DECO ÉVENTAIL — worn on the hand, deep black backdrop revealing the open-fan geometry." },
  { type: "img",   src: HAND_BOXES_IMG,  span: "full",          alt: "DECO ÉVENTAIL — lifestyle capture, held between fingers with velvet jewellery boxes softly out of focus behind." },
  { type: "img",   src: MACRO_HAND_IMG,  span: "full",          alt: "DECO ÉVENTAIL — extreme macro across the fingers, revealing pavé density and the negative-space fan cutouts." },
  { type: "video", src: MOTION_01_VIDEO, span: "full-square",   alt: "DECO ÉVENTAIL — motion study, the fan silhouette rotating slowly in editorial studio light." },
  { type: "video", src: MOTION_02_VIDEO, span: "full-portrait", alt: "DECO ÉVENTAIL — motion study, portrait handheld capture of the ring worn." },
];

export default function DecoEventailPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "DECO ÉVENTAIL — Inspiration Vault · PHILEON";
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-deco-eventail",
      name: "DECO ÉVENTAIL — Art Deco Fan Cocktail Ring",
      price: PRICE,
      productKey: "inspirationVaultDecoEventail",
      tierKey: "default",
      metal: "Rhodium-Plated Alloy",
      sku: "IV-DE-RPA",
      quantity: 1,
      image: HERO_IMG,
    }, 1, "Rhodium-Plated Alloy");
  };

  return (
    <div className="de-page" data-testid="deco-eventail-page">
      <LuxuryMotionStyles />
      <style>{`
        .de-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .de-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .de-return:hover { color:var(--gold); gap:16px; }
        .de-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .de-section { max-width:1180px; margin:0 auto; padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:deFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes deFade { to { opacity:1; transform:translateY(0); } }
        .de-section.d1 { animation-delay:.12s; } .de-section.d2 { animation-delay:.24s; }
        .de-section.d3 { animation-delay:.36s; } .de-section.d4 { animation-delay:.48s; }
        .de-desc { text-align:center; }
        .de-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .de-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .de-specs { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); }
        .de-specs-grid { display:grid; grid-template-columns:.85fr 1.15fr; gap:clamp(40px,5vw,80px); align-items:start; }
        @media (max-width:880px){ .de-specs-grid { grid-template-columns:1fr; gap:36px; } }
        .de-specs-img-wrap { aspect-ratio:4/5; overflow:hidden; background:var(--bg); border:1px solid var(--rule-soft); }
        .de-specs-img { width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .de-specs-img-wrap:hover .de-specs-img { transform:scale(1.02); }
        .de-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(34px,4.4vw,54px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 32px; text-transform:uppercase; letter-spacing:.018em; }
        .de-specs-list { list-style:none; padding:0; margin:24px 0 0; }
        .de-specs-list li { display:grid; grid-template-columns:200px 1fr; gap:18px; padding:14px 0;
          border-bottom:1px solid var(--rule-soft); }
        .de-specs-list dt { font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.36em;
          color:var(--gold); text-transform:uppercase; padding-top:2px; }
        .de-specs-list dd { margin:0; font-size:17px; line-height:1.5; color:var(--ink); }
        .de-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .de-gallery-cell { position:relative; aspect-ratio:1/1; overflow:hidden;
          background:var(--bg-deep); border:1px solid var(--rule-soft); }
        .de-gallery-cell.full          { grid-column:1 / -1; aspect-ratio:16/10; }
        .de-gallery-cell.full-square   { grid-column:1 / -1; aspect-ratio:1/1;  max-width:820px; margin:0 auto; }
        .de-gallery-cell.full-portrait { grid-column:1 / -1; aspect-ratio:9/16; max-width:520px; margin:0 auto; }
        .de-gallery-cell img,
        .de-gallery-cell video { width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .de-gallery-cell:hover img { transform:scale(1.03); }
        @media (max-width:640px){
          .de-gallery-grid { grid-template-columns:1fr; }
          .de-gallery-cell.full          { aspect-ratio:4/5; }
          .de-gallery-cell.full-square   { max-width:100%; }
          .de-gallery-cell.full-portrait { max-width:100%; aspect-ratio:9/16; }
        }
        .de-cta { text-align:center; }
        .de-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .de-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 38px; }
        .de-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .de-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .de-add-btn:disabled { opacity:.6; cursor:wait; }
        .de-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px); background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .de-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .de-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }
      `}</style>

      <Link to="/inspiration-vault" className="de-return" data-testid="de-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_IMG}
        video={HERO_VIDEO}
        altText="DECO ÉVENTAIL — Art Deco fan cocktail ring, cinematic studio portrait against deep black with soft lens flares."
        eyebrow="Inspiration Vault"
        title="Deco Éventail"
        subhead="Some pieces inspire what comes next."
      />

      <section className="de-section de-desc d1" data-testid="de-desc">
        <p className="de-eyebrow">Editorial</p>
        <div className="de-desc-body">
          <p className="lead">A study in symmetry and light.</p>
          <p>Deco Éventail explores the elegance of Art Deco through geometric fan architecture, open negative space, and brilliant pavé detailing.</p>
          <p>Chosen for the Inspiration Vault as a celebration of timeless design language rather than a PHILEON original.</p>
        </div>
      </section>

      <section className="de-section de-specs d2" data-testid="de-specs">
        <div className="de-specs-grid">
          <div className="de-specs-img-wrap">
            <img src={HERO_IMG} alt="DECO ÉVENTAIL — studio detail." className="de-specs-img" loading="lazy" />
          </div>
          <div>
            <p className="de-eyebrow">Specifications</p>
            <h2 className="de-h2">Geometry, in miniature.</h2>
            <dl className="de-specs-list">
              <li><dt>Material</dt><dd>Rhodium-Plated Alloy</dd></li>
              <li><dt>Finish</dt><dd>White Pavé Crystal</dd></li>
              <li><dt>Form</dt><dd>Art Deco Fan Architecture</dd></li>
              <li><dt>Detail</dt><dd>Open Negative Space · Geometric Motifs</dd></li>
              <li><dt>Silhouette</dt><dd>Cocktail Statement</dd></li>
              <li><dt>Construction</dt><dd>Lightweight</dd></li>
              <li><dt>Collection</dt><dd>Inspiration Vault Exclusive</dd></li>
              <li><dt>Price</dt><dd>$60 USD</dd></li>
            </dl>
          </div>
        </div>
      </section>

      <section className="de-section d3" data-testid="de-gallery">
        <p className="de-eyebrow" style={{ textAlign:'center' }}>The Look</p>
        <h2 className="de-h2" style={{ textAlign:'center' }}>Symmetry, unfolding.</h2>
        <div className="de-gallery-grid">
          {GALLERY.map((g, i) => {
            const spanClass = g.span || "";
            return (
              <div
                key={i}
                className={`de-gallery-cell ${spanClass} lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
                data-testid={`de-gallery-cell-${i + 1}`}
              >
                {g.type === "video" ? (
                  <video
                    src={g.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={g.alt}
                    data-testid={`de-gallery-cell-${i + 1}-video`}
                  />
                ) : (
                  <img src={g.src} alt={g.alt} loading="lazy" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="de-section de-cta d4" data-testid="de-cta">
        <p className="de-eyebrow">Price</p>
        <p className="de-price-display" data-testid="de-price">${PRICE} USD</p>
        <p className="de-price-note">Inspiration Vault · In Stock</p>
        <button onClick={onAddToCart} disabled={isAdding} className="de-add-btn"
          data-testid="de-add-to-cart" aria-label="Add Deco Éventail to cart">
          {buttonText || "ADD TO CART"}
        </button>
      </section>

      <VaultArchiveNotice />

      <section className="de-final" data-testid="de-final-quote">
        <p className="de-final-line">&ldquo;Some pieces inspire what comes next.&rdquo;</p>
        <p className="de-final-attr">— PHILEON</p>
      </section>
    </div>
  );
}
