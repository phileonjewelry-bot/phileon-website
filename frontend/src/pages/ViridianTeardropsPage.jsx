import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";

const HERO_IMG = "/inspiration-vault/viridian-teardrops/hero.jpg";
const HERO_VIDEO = "/inspiration-vault/viridian-teardrops/hero-video.mp4";
const OBSERVATION_IMG = "/inspiration-vault/viridian-teardrops/observation.jpg";
const CRAFT_IMG = "/inspiration-vault/viridian-teardrops/craft.jpg";
const SCALE_IMG = "/inspiration-vault/viridian-teardrops/scale.png";
const PRODUCT_NAME = "Viridian Teardrops";
const PRICE = 120;

// Gallery order per spec:
//   1. Object · editorial studio pair (hero image)
//   2. Observation · macro of pear-cut + emerald pavé
//   3. Craft · on-ear mannequin bust
//   4. Scale · lifestyle triptych portrait
//   5. Motion · the hero video, looped silent in-place
const GALLERY_STILLS = [
  { src: HERO_IMG,        label: "Object",      span: "full", alt: "VIRIDIAN TEARDROPS — editorial studio pair, pear-cut centre with emerald pavé and clear halo, dark backdrop." },
  { src: OBSERVATION_IMG, label: "Observation", span: "half", alt: "VIRIDIAN TEARDROPS — macro of pear-cut centre stone framed by emerald pavé field and brilliant halo." },
  { src: CRAFT_IMG,       label: "Craft",       span: "half", alt: "VIRIDIAN TEARDROPS — on-ear mannequin bust showing scale and drop silhouette against white." },
  { src: SCALE_IMG,       label: "Scale",       span: "full", alt: "VIRIDIAN TEARDROPS — lifestyle triptych, model wearing the earring across three angles." },
];

export default function ViridianTeardropsPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "VIRIDIAN TEARDROPS — Inspiration Vault · PHILEON";
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-viridian-teardrops",
      name: "VIRIDIAN TEARDROPS — Emerald Pavé Pear-Cut Drop Earrings",
      price: PRICE,
      productKey: "inspirationVaultViridianTeardrops",
      tierKey: "default",
      metal: "Rhodium-Plated Alloy",
      sku: "IV-VT-RPA",
      quantity: 1,
      image: HERO_IMG,
    }, 1, "Rhodium-Plated Alloy");
  };

  return (
    <div className="vt-page" data-testid="viridian-teardrops-page">
      <style>{`
        .vt-page {
          --bg:#050505;--bg-deep:#020202;--ink:#cfc8be;--ink-strong:#f4ede0;
          --ink-muted:#7a716a;--gold:#c8a24a;--gold-deep:#8b7339;
          --rule:rgba(200,162,74,.34);--rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink);font-family:'Cormorant Garamond',serif;min-height:100vh;overflow-x:hidden;
        }
        .vt-page .vt-return {
          display:inline-flex;align-items:center;gap:10px;padding:18px 26px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-muted);text-decoration:none;text-transform:uppercase;
          transition:color 280ms ease,gap 280ms ease;
        }
        .vt-page .vt-return:hover { color:var(--gold);gap:16px; }
        .vt-eyebrow {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.46em;
          color:var(--gold);text-transform:uppercase;margin:0 0 18px;
        }
        .vt-section {
          max-width:1180px;margin:0 auto;padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0;transform:translateY(20px);
          animation:vtFade 1s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes vtFade { to { opacity:1;transform:translateY(0); } }
        .vt-section.d1 { animation-delay:.12s; } .vt-section.d2 { animation-delay:.24s; }
        .vt-section.d3 { animation-delay:.36s; } .vt-section.d4 { animation-delay:.48s; }
        .vt-desc { text-align:center; }
        .vt-desc-body p {
          font-family:'Cormorant Garamond',serif;font-size:clamp(19px,1.55vw,24px);
          line-height:1.7;color:var(--ink);margin:0 auto 18px;max-width:720px;
        }
        .vt-desc-body p.lead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(22px,2.2vw,30px);color:var(--gold);margin-bottom:30px;
        }
        .vt-specs { background:var(--bg-deep);border-top:1px solid var(--rule-soft);border-bottom:1px solid var(--rule-soft); }
        .vt-specs-grid {
          display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(40px,5vw,80px);align-items:start;
        }
        @media (max-width:880px){ .vt-specs-grid { grid-template-columns:1fr;gap:36px; } }
        .vt-specs-img-wrap {
          aspect-ratio:4/5;overflow:hidden;background:var(--bg);border:1px solid var(--rule-soft);
        }
        .vt-specs-img { width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .vt-specs-img-wrap:hover .vt-specs-img { transform:scale(1.02); }
        .vt-h2 {
          font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(34px,4.4vw,54px);
          line-height:1.05;color:var(--ink-strong);margin:0 0 32px;text-transform:uppercase;letter-spacing:.018em;
        }
        .vt-specs-list { list-style:none;padding:0;margin:24px 0 0; }
        .vt-specs-list li {
          display:grid;grid-template-columns:200px 1fr;gap:18px;padding:14px 0;
          border-bottom:1px solid var(--rule-soft);
        }
        .vt-specs-list dt {
          font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.36em;
          color:var(--gold);text-transform:uppercase;padding-top:2px;
        }
        .vt-specs-list dd { margin:0;font-size:17px;line-height:1.5;color:var(--ink); }
        .vt-gallery-grid {
          display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,1.8vw,24px);margin-top:36px;
        }
        .vt-gallery-cell {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:var(--bg-deep);
          border:1px solid var(--rule-soft);
        }
        .vt-gallery-cell.full { grid-column:1 / -1;aspect-ratio:16/10; }
        .vt-gallery-cell img,
        .vt-gallery-cell video {
          width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .vt-gallery-cell:hover img { transform:scale(1.03); }
        .vt-gallery-label {
          position:absolute;left:14px;bottom:12px;
          font-family:'Cinzel',serif;font-size:10px;letter-spacing:.4em;
          color:var(--gold);text-transform:uppercase;
          background:rgba(0,0,0,.55);padding:6px 10px;backdrop-filter:blur(6px);
          pointer-events:none;z-index:2;
        }
        @media (max-width:640px){ .vt-gallery-grid { grid-template-columns:1fr; } .vt-gallery-cell.full { aspect-ratio:4/5; } }
        .vt-cta { text-align:center; }
        .vt-price-display {
          font-family:'Cinzel',serif;font-size:22px;letter-spacing:.32em;
          color:var(--ink-strong);margin:0 0 10px;
        }
        .vt-price-note {
          font-family:'Cormorant Garamond',serif;font-style:italic;font-size:15px;
          color:var(--ink-muted);margin:0 0 38px;
        }
        .vt-add-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:12px;
          padding:18px 64px;border:1.5px solid var(--gold);background:transparent;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:.42em;
          color:var(--gold);text-transform:uppercase;cursor:pointer;
          transition:background 380ms ease,color 380ms ease,border-color 380ms ease,transform 280ms ease;
        }
        .vt-add-btn:hover { background:var(--gold);color:var(--bg-deep);transform:translateY(-2px); }
        .vt-add-btn:disabled { opacity:.6;cursor:wait; }
        .vt-final {
          text-align:center;padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000;border-top:1px solid var(--rule);
        }
        .vt-final-line {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(24px,2.8vw,38px);line-height:1.5;color:var(--gold);
          max-width:760px;margin:0 auto;
        }
        .vt-final-attr {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.46em;
          color:var(--ink-muted);text-transform:uppercase;margin-top:22px;
        }
      `}</style>

      <Link to="/inspiration-vault" className="vt-return" data-testid="vt-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      {/* HERO — universal Vault hero (image → 1.7s hold → crossfade → muted looping video) */}
      <VaultHero
        image={HERO_IMG}
        video={HERO_VIDEO}
        altText="VIRIDIAN TEARDROPS — editorial studio pair, pear-cut centre with emerald pavé field and brilliant clear-CZ halo on dark backdrop."
        eyebrow="Inspiration Vault"
        title="Viridian Teardrops"
        subhead="Grace takes shape in a single silhouette."
      />

      {/* DESCRIPTION */}
      <section className="vt-section vt-desc d1" data-testid="vt-desc">
        <p className="vt-eyebrow">Editorial</p>
        <div className="vt-desc-body">
          <p className="lead">Grace takes shape in a single silhouette.</p>
          <p>Viridian Teardrops pair luminous pear-cut stones with a rich emerald pavé field, framed by a brilliant halo that catches light with quiet confidence.</p>
          <p>Curated from the Inspiration Vault, this piece reflects the discoveries that have influenced PHILEON&rsquo;s creative journey.</p>
          <p><em>Presented as found—not created.</em></p>
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section className="vt-section vt-specs d2" data-testid="vt-specs">
        <div className="vt-specs-grid">
          <div className="vt-specs-img-wrap">
            <img src={CRAFT_IMG} alt="VIRIDIAN TEARDROPS — worn on a mannequin bust for scale and silhouette." className="vt-specs-img" loading="lazy" />
          </div>
          <div>
            <p className="vt-eyebrow">Specifications</p>
            <h2 className="vt-h2">Pear-cut centre. Emerald field.</h2>
            <dl className="vt-specs-list">
              <li><dt>Material</dt><dd>Rhodium-Plated Alloy</dd></li>
              <li><dt>Centre Stone</dt><dd>Pear-Cut Cubic Zirconia</dd></li>
              <li><dt>Pavé Field</dt><dd>Emerald Green Cubic Zirconia</dd></li>
              <li><dt>Halo</dt><dd>White Cubic Zirconia</dd></li>
              <li><dt>Closure</dt><dd>Stud Back</dd></li>
              <li><dt>Construction</dt><dd>Lightweight</dd></li>
              <li><dt>Collection</dt><dd>Inspiration Vault</dd></li>
              <li><dt>Price</dt><dd>$120 USD</dd></li>
            </dl>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="vt-section d3" data-testid="vt-gallery">
        <p className="vt-eyebrow" style={{ textAlign:'center' }}>The Look</p>
        <h2 className="vt-h2" style={{ textAlign:'center' }}>Five movements.</h2>
        <div className="vt-gallery-grid">
          {GALLERY_STILLS.map((g, i) => (
            <div key={i} className={`vt-gallery-cell ${g.span === 'full' ? 'full' : ''}`} data-testid={`vt-gallery-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
              <span className="vt-gallery-label">{`№0${i + 1} · ${g.label}`}</span>
            </div>
          ))}
          {/* Motion — gallery cell #5 = the hero video, looping silently in-frame */}
          <div className="vt-gallery-cell full" data-testid="vt-gallery-cell-5">
            <video
              src={HERO_VIDEO}
              poster={HERO_IMG}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              aria-label="VIRIDIAN TEARDROPS — motion study, looped silent product film"
              onLoadedMetadata={(e) => { e.currentTarget.play().catch(() => {}); }}
            />
            <span className="vt-gallery-label">№05 · Motion</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vt-section vt-cta d4" data-testid="vt-cta">
        <p className="vt-eyebrow">Price</p>
        <p className="vt-price-display" data-testid="vt-price">${PRICE} USD</p>
        <p className="vt-price-note">Inspiration Vault · In Stock</p>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="vt-add-btn"
          data-testid="vt-add-to-cart"
          aria-label="Add Viridian Teardrops to cart"
        >
          {buttonText || "ADD TO CART"}
        </button>
      </section>

      {/* FINAL */}
      <section className="vt-final" data-testid="vt-final-quote">
        <p className="vt-final-line">
          &ldquo;Some pieces are worn. Others are remembered.&rdquo;
        </p>
        <p className="vt-final-attr">— PHILEON</p>
      </section>
    </div>
  );
}
