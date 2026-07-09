import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * ALTAR — Inspiration Vault · $40 USD
 *
 * Gold-plated stainless-steel architectural cross cuff. Vault-only archive
 * piece; never added to shop, bracelets collection, carousel, or any
 * production line.
 */

const HERO_VIDEO      = "/inspiration-vault/altar/hero-film.mp4";
const HERO_POSTER     = "/inspiration-vault/altar/img-05.png";   // lifestyle still (used only as video poster)
const STILL_FRONT_A   = "/inspiration-vault/altar/img-03.jpg";   // studio front
const STILL_FRONT_B   = "/inspiration-vault/altar/img-04.jpg";   // studio front, cuff standing
const STILL_TOPDOWN   = "/inspiration-vault/altar/img-02.jpg";   // top view looking into the cuff
const STILL_WRIST_A   = "/inspiration-vault/altar/img-01.jpg";   // front phone shot
const PRICE = 40;

// Gallery contains only images that do NOT duplicate the hero video's
// lifestyle poster. Four unique product studies flanking the film.
const GALLERY = [
  { type: "img", src: STILL_FRONT_A, span: "half",          alt: "ALTAR — studio front shot, the mirror-polish gold cuff isolated on white with the architectural cross cutout centered." },
  { type: "img", src: STILL_FRONT_B, span: "half",          alt: "ALTAR — alternate studio front shot, the cuff standing tall to reveal the precision of the cross cutout and the polished shoulder." },
  { type: "img", src: STILL_TOPDOWN, span: "half-portrait", alt: "ALTAR — top-down product view looking into the cuff, revealing the mirror-polish interior and the sculpted opening of the band." },
  { type: "img", src: STILL_WRIST_A, span: "half-portrait", alt: "ALTAR — closer front portrait, capturing the depth of the polished gold surface and the crisp geometry of the cross window." },
];

export default function AltarPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  useLuxuryMotionObserver();

  useEffect(() => { document.title = "ALTAR — Inspiration Vault · PHILEON"; }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-altar",
      name: "ALTAR — Architectural Cross Cuff",
      price: PRICE,
      productKey: "inspirationVaultAltar",
      tierKey: "default",
      metal: "Gold-Plated Stainless Steel · Mirror Polish",
      sku: "IV-AL-CRX",
      quantity: 1,
      image: HERO_POSTER,
    }, 1, "Gold-Plated Stainless Steel · Mirror Polish");
  };

  return (
    <div className="al-page" data-testid="altar-page">
      <LuxuryMotionStyles />
      <style>{`
        .al-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .al-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .al-return:hover { color:var(--gold); gap:16px; }
        .al-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .al-section { max-width:1180px; margin:0 auto; padding:clamp(64px,7vw,120px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:alFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes alFade { to { opacity:1; transform:translateY(0); } }
        .al-section.d1 { animation-delay:.12s; } .al-section.d2 { animation-delay:.24s; }
        .al-section.d3 { animation-delay:.36s; } .al-section.d4 { animation-delay:.48s; }
        .al-section.d5 { animation-delay:.60s; } .al-section.d6 { animation-delay:.72s; }
        .al-desc { text-align:center; }
        .al-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .al-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .al-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(32px,4vw,50px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 28px; text-transform:uppercase; letter-spacing:.018em; }
        .al-list { list-style:none; padding:0; margin:0 auto; max-width:720px; text-align:left; }
        .al-list li { position:relative; padding:9px 0 9px 24px; font-family:'Cormorant Garamond',serif;
          font-size:18px; line-height:1.6; color:var(--ink); }
        .al-list li::before { content:''; position:absolute; left:0; top:18px; width:8px; height:1px; background:var(--gold); }
        .al-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .al-gallery-cell { position:relative; aspect-ratio:1/1; overflow:hidden;
          background:var(--bg-deep); border:1px solid var(--rule-soft); }
        .al-gallery-cell.full { grid-column:1 / -1; aspect-ratio:1/1; }
        /* Half-width square cell (studio front shots, 1024×1024). */
        .al-gallery-cell.half { aspect-ratio: 1 / 1; }
        /* Half-width portrait cell (phone shots, ~934×2000 ≈ 7:15). */
        .al-gallery-cell.half-portrait { aspect-ratio: 7 / 15; }
        .al-gallery-cell img { width:100%; height:100%; object-fit:contain; display:block; padding:4%;
          background:#000;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .al-gallery-cell:hover img { transform:scale(1.02); }
        @media (max-width:640px){
          .al-gallery-grid { grid-template-columns:1fr; }
          .al-gallery-cell.full { aspect-ratio:4/5; }
          .al-gallery-cell.half { grid-column:1 / -1; aspect-ratio: 1 / 1; }
          .al-gallery-cell.half-portrait { grid-column:1 / -1; aspect-ratio: 7 / 15; }
        }
        .al-cta { text-align:center; }
        .al-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .al-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 30px; }
        .al-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .al-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .al-add-btn:disabled { opacity:.6; cursor:wait; }
        .al-philosophy { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); text-align:center; }
        .al-question { font-family:'Playfair Display',serif; font-weight:400;
          font-size:clamp(26px,2.6vw,38px); color:var(--ink-strong); margin:32px auto 20px; letter-spacing:.01em; }
        .al-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .al-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .al-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }
      `}</style>

      <Link to="/inspiration-vault" className="al-return" data-testid="al-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_POSTER}
        video={HERO_VIDEO}
        prominent
        altText="ALTAR — architectural gold cross cuff, editorial film revealing the mirror-polish and cross cutout under soft studio light."
        eyebrow="Inspiration Vault"
        title="ALTAR"
        subhead="Built with purpose. Worn with conviction."
      />

      <section className="al-section al-desc d1" data-testid="al-desc">
        <p className="al-eyebrow">Editorial</p>
        <div className="al-desc-body">
          <p className="lead">ALTAR transforms a timeless cuff into an architectural study of devotion and balance.</p>
          <p>Its sculptural silhouette is interrupted by a precisely cut cross, allowing light to become part of the composition itself. Bold in form yet restrained in execution, ALTAR proves that simplicity can carry extraordinary presence.</p>
          <p>Designed as an archive piece, it celebrates thoughtful design before precious materials.</p>
        </div>
      </section>

      <section className="al-section al-cta d2" data-testid="al-cta">
        <p className="al-eyebrow">Vault Access</p>
        <p className="al-price-display" data-testid="al-price">${PRICE} USD</p>
        <p className="al-price-note">Gain permanent access to the ALTAR archive, including:</p>
        <ul className="al-list" style={{ margin: "0 auto 40px" }}>
          <li>High-resolution concept photography</li>
          <li>Complete editorial image gallery</li>
          <li>Multiple design angles</li>
          <li>Macro construction studies</li>
          <li>Design philosophy and creative notes</li>
          <li>Future archive updates for this concept</li>
          <li>Lifetime Inspiration Vault access</li>
        </ul>
        <button onClick={onAddToCart} disabled={isAdding} className="al-add-btn"
          data-testid="al-add-to-cart" aria-label="Add ALTAR Vault access to cart">
          {buttonText && buttonText !== "ADD TO CART" ? buttonText : "ADD TO CART"}
        </button>
      </section>

      <section className="al-section d3" data-testid="al-materials">
        <p className="al-eyebrow" style={{ textAlign:"center" }}>Materials</p>
        <h2 className="al-h2" style={{ textAlign:"center" }}>Everyday devotion, engineered.</h2>
        <div className="al-desc-body" style={{ textAlign:"center" }}>
          <p>ALTAR is built from gold-plated stainless steel and finished to a mirror polish. The architectural cross is precision-cut through the shoulder of the cuff, opening a window in the metal so light itself becomes part of the design.</p>
          <p>The result is a piece engineered for daily wear&mdash;lightweight, adjustable, and quietly resolute.</p>
        </div>
      </section>

      <section className="al-section d4" data-testid="al-study">
        <p className="al-eyebrow" style={{ textAlign:"center" }}>Design Study</p>
        <h2 className="al-h2" style={{ textAlign:"center" }}>The cross, engineered as light.</h2>
        <ul className="al-list">
          <li>Gold-plated stainless steel</li>
          <li>Mirror-polish finish</li>
          <li>Architectural cross cutout</li>
          <li>Adjustable open cuff</li>
          <li>Lightweight everyday wear</li>
        </ul>

        <div className="al-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`al-gallery-cell ${g.span || ""} lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
              data-testid={`al-gallery-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="al-section al-philosophy d5" data-testid="al-philosophy">
        <p className="al-eyebrow">Design Philosophy</p>
        <div className="al-desc-body">
          <p>Not every archive piece begins with rare materials.</p>
          <p>For ALTAR, the study began with a single question:</p>
        </div>
        <p className="al-question">Can meaning be worn as architecture?</p>
        <div className="al-desc-body">
          <p>By cutting the cross through the shoulder of the cuff rather than applying it on top, ALTAR trades ornament for intention. What remains is a piece that says everything without asking to be noticed&mdash;bold in form, restrained in execution, worn with conviction.</p>
        </div>
      </section>

      <VaultArchiveNotice />

      <section className="al-final" data-testid="al-final-quote">
        <p className="al-final-line">
          &ldquo;Some pieces are decorated.<br/>
          Others carry meaning built into their form.&rdquo;
        </p>
        <p className="al-final-attr">— PHILEON Inspiration Vault</p>
      </section>
    </div>
  );
}
