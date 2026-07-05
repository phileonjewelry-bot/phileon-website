import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";
import ParabolaFamilyNav from "@/components/ParabolaFamilyNav";

/**
 * PARABOLA ATELIER — Inspiration Vault · $100 USD
 *
 * The original architectural study that gave rise to PARABOLA and
 * PARABOLA HERITAGE. Preserved as a design-study milestone, not a
 * production model. Vault-only piece — never added to shop, rings,
 * carousel, Ladies First, or Gentleman's Club.
 *
 * Assets live under /inspiration-vault/parabola-atelier/. Hero film
 * is silent (audio stripped via ffmpeg) for cross-browser autoplay.
 */

const HERO_VIDEO   = "/inspiration-vault/parabola-atelier/hero-film.mp4";
const HERO_POSTER  = "/inspiration-vault/parabola-atelier/hero-film-poster.jpg";
const STILL_01     = "/inspiration-vault/parabola-atelier/still-01-topdown.jpg";
const STILL_02     = "/inspiration-vault/parabola-atelier/still-02-tilted.jpg";
const STILL_03     = "/inspiration-vault/parabola-atelier/still-03-angle.jpg";
const STILL_04     = "/inspiration-vault/parabola-atelier/still-04-back.jpg";
const PRICE = 100;

// Gallery rhythm: object → tilted study → angled study → tension-ring reverse.
const GALLERY = [
  { type: "img", src: STILL_01, span: "full", alt: "PARABOLA ATELIER — top-down architectural study, the full concentric pavé field graduating from rose-gold outer rim to silver body to a yellow-gold center rosette." },
  { type: "img", src: STILL_02, span: "half", alt: "PARABOLA ATELIER — 3/4 tilted study revealing the concave dish curvature and rose-gold outer rim tension." },
  { type: "img", src: STILL_03, span: "half", alt: "PARABOLA ATELIER — angled front study, the concentric graduated pavé reading as a bowl of light above the adjustable shank." },
  { type: "img", src: STILL_04, span: "full", alt: "PARABOLA ATELIER — reverse view exposing the open-gallery tension ring construction: the concave dish floating above a lightweight adjustable band." },
];

export default function ParabolaAtelierPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "PARABOLA ATELIER — Inspiration Vault · PHILEON";
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-parabola-atelier",
      name: "PARABOLA ATELIER — Architectural Concave Study",
      price: PRICE,
      productKey: "inspirationVaultParabolaAtelier",
      tierKey: "default",
      metal: "Mixed-Metal Study (Silver · Rose · Yellow Gold)",
      sku: "IV-PA-STUDY",
      quantity: 1,
      image: HERO_POSTER,
    }, 1, "Mixed-Metal Study (Silver · Rose · Yellow Gold)");
  };

  return (
    <div className="pa-page" data-testid="parabola-atelier-page">
      <LuxuryMotionStyles />
      <style>{`
        .pa-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .pa-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .pa-return:hover { color:var(--gold); gap:16px; }
        .pa-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .pa-section { max-width:1180px; margin:0 auto; padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:paFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes paFade { to { opacity:1; transform:translateY(0); } }
        .pa-section.d1 { animation-delay:.12s; } .pa-section.d2 { animation-delay:.24s; }
        .pa-section.d3 { animation-delay:.36s; } .pa-section.d4 { animation-delay:.48s; }
        .pa-section.d5 { animation-delay:.60s; }
        .pa-desc { text-align:center; }
        .pa-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .pa-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .pa-desc-body p.question { font-family:'Playfair Display',serif; font-weight:400;
          font-size:clamp(24px,2.4vw,34px); color:var(--ink-strong); margin:34px auto 24px; letter-spacing:.01em; }
        .pa-specs { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); }
        .pa-specs-grid { display:grid; grid-template-columns:.85fr 1.15fr; gap:clamp(40px,5vw,80px); align-items:start; }
        @media (max-width:880px){ .pa-specs-grid { grid-template-columns:1fr; gap:36px; } }
        .pa-specs-img-wrap { aspect-ratio:4/5; overflow:hidden; background:var(--bg); border:1px solid var(--rule-soft); }
        .pa-specs-img { width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .pa-specs-img-wrap:hover .pa-specs-img { transform:scale(1.02); }
        .pa-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(34px,4.4vw,54px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 32px; text-transform:uppercase; letter-spacing:.018em; }
        .pa-specs-list { list-style:none; padding:0; margin:24px 0 0; }
        .pa-specs-list li { display:grid; grid-template-columns:200px 1fr; gap:18px; padding:14px 0;
          border-bottom:1px solid var(--rule-soft); }
        .pa-specs-list dt { font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.36em;
          color:var(--gold); text-transform:uppercase; padding-top:2px; }
        .pa-specs-list dd { margin:0; font-size:17px; line-height:1.5; color:var(--ink); }
        .pa-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .pa-gallery-cell { position:relative; aspect-ratio:1/1; overflow:hidden;
          background:var(--bg-deep); border:1px solid var(--rule-soft); }
        .pa-gallery-cell.full { grid-column:1 / -1; aspect-ratio:16/10; }
        .pa-gallery-cell img { width:100%; height:100%; object-fit:contain; display:block; padding:6%;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .pa-gallery-cell:hover img { transform:scale(1.02); }
        @media (max-width:640px){
          .pa-gallery-grid { grid-template-columns:1fr; }
          .pa-gallery-cell.full { aspect-ratio:4/5; }
        }
        .pa-includes { text-align:left; max-width:720px; margin:20px auto 0; }
        .pa-includes p { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--gold); text-transform:uppercase; margin:0 0 14px; }
        .pa-includes ul { list-style:none; padding:0; margin:0; }
        .pa-includes li { position:relative; padding:8px 0 8px 24px; font-family:'Cormorant Garamond',serif; font-size:18px; line-height:1.6; color:var(--ink); }
        .pa-includes li::before { content:''; position:absolute; left:0; top:17px; width:8px; height:1px; background:var(--gold); }
        .pa-cta { text-align:center; }
        .pa-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .pa-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 38px; }
        .pa-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .pa-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .pa-add-btn:disabled { opacity:.6; cursor:wait; }
        .pa-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .pa-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .pa-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }
      `}</style>

      <Link to="/inspiration-vault" className="pa-return" data-testid="pa-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_POSTER}
        video={HERO_VIDEO}
        altText="PARABOLA ATELIER — the earliest architectural study of the concave dish, hero film revealing the open-gallery tension ring floating above a lightweight adjustable band."
        eyebrow="Inspiration Vault"
        title="PARABOLA ATELIER"
        subhead="The idea before the icon."
      />

      {/* RECIPROCAL LINEAGE CAPTION — quiet forward-link from the Vault study
          to its production expression (PARABOLA · Ladies First). Small
          uppercase Cinzel, warm gold at 70% opacity, thin underline. No card,
          no badge, no animation, no layout shift. Does not replace the
          Archive notice or final quote below. */}
      <div className="text-center" style={{ padding: "clamp(20px,3vw,40px) clamp(20px,4vw,60px) 0" }}>
        <Link
          to="/parabola"
          data-testid="pa-lineage-caption"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10.5,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(200, 162, 74, 0.7)",
            borderBottom: "1px solid rgba(200, 162, 74, 0.25)",
            paddingBottom: 2,
            display: "inline-block",
            textDecoration: "none",
          }}
        >
          Now living in PARABOLA &middot; Ladies First <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <section className="pa-section pa-desc d1" data-testid="pa-desc">
        <p className="pa-eyebrow">Editorial</p>
        <div className="pa-desc-body">
          <p className="lead">Before PARABOLA became a collection, it existed as an experiment.</p>
          <p>PARABOLA ATELIER documents the earliest exploration of the concave architecture that would later define one of PHILEON&rsquo;s most recognizable silhouettes. Every curve, every concentric row, and every structural decision was studied with a single question:</p>
          <p className="question">How can light become architecture?</p>
          <p>The result was a sculptural form that draws the eye inward through perfectly graduated pav&eacute;, creating depth without unnecessary mass.</p>
          <p>At its heart is a sculptural tension ring architecture, suspending the concave dish above an open gallery that appears to float effortlessly while maintaining exceptional strength and everyday wearability.</p>
          <p>This piece remains preserved inside the Inspiration Vault as a milestone in the evolution of the PARABOLA family.</p>
        </div>
      </section>

      <section className="pa-section pa-specs d2" data-testid="pa-specs">
        <div className="pa-specs-grid">
          <div className="pa-specs-img-wrap">
            <img src={STILL_01} alt="PARABOLA ATELIER — top-down architectural study." className="pa-specs-img" loading="lazy" />
          </div>
          <div>
            <p className="pa-eyebrow">Design Study</p>
            <h2 className="pa-h2">Where the shape found its answer.</h2>
            <dl className="pa-specs-list">
              <li><dt>Form</dt><dd>22 mm Architectural Concave Dish</dd></li>
              <li><dt>Pavé Layout</dt><dd>Precision Graduated Concentric Rows</dd></li>
              <li><dt>Construction</dt><dd>Open-Gallery Tension Ring</dd></li>
              <li><dt>Framework</dt><dd>Lightweight Engineered Support</dd></li>
              <li><dt>Proportions</dt><dd>Studied for Maximum Depth and Light Return</dd></li>
              <li><dt>Status</dt><dd>Original Concept — Not a Production Model</dd></li>
              <li><dt>Legacy</dt><dd>The Study Behind PARABOLA &amp; PARABOLA HERITAGE</dd></li>
              <li><dt>Collection</dt><dd>Inspiration Vault Exclusive</dd></li>
              <li><dt>Price</dt><dd>$100 USD</dd></li>
            </dl>
          </div>
        </div>
      </section>

      <section className="pa-section d3" data-testid="pa-gallery">
        <p className="pa-eyebrow" style={{ textAlign:'center' }}>The Study</p>
        <h2 className="pa-h2" style={{ textAlign:'center' }}>Every angle, examined.</h2>
        <div className="pa-gallery-grid">
          {GALLERY.map((g, i) => (
            <div
              key={i}
              className={`pa-gallery-cell ${g.span || ""} lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
              data-testid={`pa-gallery-cell-${i + 1}`}
            >
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="pa-section pa-cta d4" data-testid="pa-cta">
        <p className="pa-eyebrow">Vault Access</p>
        <p className="pa-price-display" data-testid="pa-price">${PRICE} USD</p>
        <p className="pa-price-note">Inspiration Vault · Permanent Access</p>

        <div className="pa-includes" data-testid="pa-includes">
          <p>Your Vault Access Includes</p>
          <ul>
            <li>Full-resolution concept renders</li>
            <li>Original engineering drawings</li>
            <li>Technical specifications</li>
            <li>Design evolution studies</li>
            <li>Macro detail imagery</li>
            <li>Lifestyle presentation assets</li>
            <li>Permanent Inspiration Vault access</li>
          </ul>
        </div>

        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="pa-add-btn"
          data-testid="pa-add-to-cart"
          aria-label="Add PARABOLA ATELIER Vault access to cart"
          style={{ marginTop: 40 }}
        >
          {buttonText && buttonText !== "ADD TO CART" ? buttonText : "UNLOCK VAULT ACCESS"}
        </button>
      </section>

      <VaultArchiveNotice />

      <section className="pa-final" data-testid="pa-final-quote">
        <p className="pa-final-line">&ldquo;Every masterpiece begins as an idea. This is where PARABOLA began.&rdquo;</p>
        <p className="pa-final-attr">— PHILEON</p>
      </section>

      <ParabolaFamilyNav active="atelier" />
    </div>
  );
}
