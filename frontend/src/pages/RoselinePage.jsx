import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * ROSELINE — Inspiration Vault · $50 USD
 *
 * Rose-gold safety-pin-inspired pavé open cuff bangle. Vault-only archive
 * piece; never added to shop, bracelets collection, carousel, or any
 * production line.
 */

const HERO_VIDEO   = "/inspiration-vault/roseline/hero-film.mp4";
const HERO_POSTER  = "/inspiration-vault/roseline/hero-still.jpg";
const STILL_01     = "/inspiration-vault/roseline/hero-still.jpg";
const GALLERY_VIDEO_A = "/inspiration-vault/roseline/gallery-1.mp4";
const GALLERY_VIDEO_A_POSTER = "/inspiration-vault/roseline/gallery-1-poster.jpg";
const PRICE = 50;

// Gallery order: editorial still first, then the supplementary portrait film.
// The hero film already anchors the top of the page.
const GALLERY = [
  { type: "img", src: STILL_01, span: "full", alt: "ROSELINE — editorial pedestal portrait, the rose-gold safety-pin cuff resting on polished black stone with the pavé head catching soft warm light." },
  { type: "video", src: GALLERY_VIDEO_A, poster: GALLERY_VIDEO_A_POSTER, span: "full-portrait", alt: "ROSELINE — supplementary editorial film revealing the pavé head and open-cuff silhouette from a rotating angle." },
];

export default function RoselinePage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  useLuxuryMotionObserver();

  useEffect(() => { document.title = "ROSELINE — Inspiration Vault · PHILEON"; }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-roseline",
      name: "ROSELINE — Rose-Gold Pavé Safety-Pin Cuff",
      price: PRICE,
      productKey: "inspirationVaultRoseline",
      tierKey: "default",
      metal: "Rose-Gold Plated Brass · Pavé Head",
      sku: "IV-RL-RG",
      quantity: 1,
      image: HERO_POSTER,
    }, 1, "Rose-Gold Plated Brass · Pavé Head");
  };

  return (
    <div className="rl-page" data-testid="roseline-page">
      <LuxuryMotionStyles />
      <style>{`
        .rl-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .rl-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .rl-return:hover { color:var(--gold); gap:16px; }
        .rl-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .rl-section { max-width:1180px; margin:0 auto; padding:clamp(64px,7vw,120px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:rlFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes rlFade { to { opacity:1; transform:translateY(0); } }
        .rl-section.d1 { animation-delay:.12s; } .rl-section.d2 { animation-delay:.24s; }
        .rl-section.d3 { animation-delay:.36s; } .rl-section.d4 { animation-delay:.48s; }
        .rl-section.d5 { animation-delay:.60s; } .rl-section.d6 { animation-delay:.72s; }
        .rl-desc { text-align:center; }
        .rl-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .rl-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .rl-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(32px,4vw,50px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 28px; text-transform:uppercase; letter-spacing:.018em; }
        .rl-list { list-style:none; padding:0; margin:0 auto; max-width:720px; text-align:left; }
        .rl-list li { position:relative; padding:9px 0 9px 24px; font-family:'Cormorant Garamond',serif;
          font-size:18px; line-height:1.6; color:var(--ink); }
        .rl-list li::before { content:''; position:absolute; left:0; top:18px; width:8px; height:1px; background:var(--gold); }
        .rl-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .rl-gallery-cell { position:relative; aspect-ratio:1/1; overflow:hidden;
          background:var(--bg-deep); border:1px solid var(--rule-soft); }
        .rl-gallery-cell.full { grid-column:1 / -1; aspect-ratio:1/1; }
        /* Portrait-video cell matches the 9:16 hero film aspect exactly so
           object-fit:contain fills edge-to-edge with zero letterboxing. */
        .rl-gallery-cell.full-portrait {
          grid-column: 1 / -1;
          aspect-ratio: 9 / 16;
          height: min(92vh, 1120px);
          width: auto;
          max-width: 100%;
          justify-self: center;
          margin: 0 auto;
        }
        .rl-gallery-cell img,
        .rl-gallery-cell video { width:100%; height:100%; object-fit:contain; display:block; padding:4%;
          background:#000;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .rl-gallery-cell.full-portrait video { padding: 0; }
        .rl-gallery-cell:hover img,
        .rl-gallery-cell:hover video { transform:scale(1.02); }
        @media (max-width:640px){
          .rl-gallery-grid { grid-template-columns:1fr; }
          .rl-gallery-cell.full { aspect-ratio:4/5; }
          .rl-gallery-cell.full-portrait { height:min(88vh, 780px); aspect-ratio: 9 / 16; }
        }
        .rl-cta { text-align:center; }
        .rl-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .rl-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 30px; }
        .rl-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .rl-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .rl-add-btn:disabled { opacity:.6; cursor:wait; }
        .rl-philosophy { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); text-align:center; }
        .rl-question { font-family:'Playfair Display',serif; font-weight:400;
          font-size:clamp(26px,2.6vw,38px); color:var(--ink-strong); margin:32px auto 20px; letter-spacing:.01em; }
        .rl-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .rl-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .rl-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }
      `}</style>

      <Link to="/inspiration-vault" className="rl-return" data-testid="rl-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_POSTER}
        video={HERO_VIDEO}
        prominent
        altText="ROSELINE — rose-gold pavé safety-pin cuff bangle, hero film revealing the sculpted silhouette under soft editorial lighting."
        eyebrow="Inspiration Vault"
        title="ROSELINE"
        subhead="Elegance, anchored with intention."
      />

      <section className="rl-section rl-desc d1" data-testid="rl-desc">
        <p className="rl-eyebrow">Editorial</p>
        <div className="rl-desc-body">
          <p className="lead">ROSELINE reimagines the familiar safety pin as an object of quiet refinement.</p>
          <p>A graceful open silhouette, finished in radiant rose gold, is crowned with a pav&eacute;-set head that introduces brilliance with restraint. Familiar in inspiration yet transformed through proportion and craftsmanship, it celebrates the beauty found in simplicity.</p>
        </div>
      </section>

      <section className="rl-section rl-cta d2" data-testid="rl-cta">
        <p className="rl-eyebrow">Vault Access</p>
        <p className="rl-price-display" data-testid="rl-price">${PRICE} USD</p>
        <p className="rl-price-note">Gain permanent access to the ROSELINE archive, including:</p>
        <ul className="rl-list" style={{ margin: "0 auto 40px" }}>
          <li>High-resolution concept photography</li>
          <li>Complete editorial image gallery</li>
          <li>Multiple design angles</li>
          <li>Macro construction studies</li>
          <li>Design philosophy and creative notes</li>
          <li>Future archive updates for this concept</li>
          <li>Lifetime Inspiration Vault access</li>
        </ul>
        <button onClick={onAddToCart} disabled={isAdding} className="rl-add-btn"
          data-testid="rl-add-to-cart" aria-label="Add ROSELINE Vault access to cart">
          {buttonText && buttonText !== "ADD TO CART" ? buttonText : "UNLOCK VAULT ACCESS"}
        </button>
      </section>

      <section className="rl-section d3" data-testid="rl-materials">
        <p className="rl-eyebrow" style={{ textAlign:"center" }}>Materials</p>
        <h2 className="rl-h2" style={{ textAlign:"center" }}>Warmth, finished with restraint.</h2>
        <div className="rl-desc-body" style={{ textAlign:"center" }}>
          <p>Premium brass, finished in radiant rose gold plating and meticulously hand-set with AAA pav&eacute; cubic zirconia. A polished architectural finish enhances the soft warmth of the rose gold while allowing each pav&eacute; surface to catch the light with understated brilliance.</p>
        </div>
      </section>

      <section className="rl-section d4" data-testid="rl-study">
        <p className="rl-eyebrow" style={{ textAlign:"center" }}>Design Study</p>
        <h2 className="rl-h2" style={{ textAlign:"center" }}>The familiar, refined.</h2>
        <ul className="rl-list">
          <li>Contemporary safety-pin-inspired architecture</li>
          <li>Premium brass construction</li>
          <li>Radiant rose gold plating</li>
          <li>Precision hand-set AAA pav&eacute; cubic zirconia</li>
          <li>High-polish finish</li>
          <li>Lightweight open-cuff silhouette</li>
        </ul>

        <div className="rl-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`rl-gallery-cell ${g.span || ""} lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
              data-testid={`rl-gallery-cell-${i + 1}`}>
              {g.type === "video" ? (
                <video
                  src={g.src}
                  poster={g.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  disableRemotePlayback
                  controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                  onContextMenu={(e) => e.preventDefault()}
                  aria-label={g.alt}
                />
              ) : (
                <img src={g.src} alt={g.alt} loading="lazy" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rl-section rl-philosophy d5" data-testid="rl-philosophy">
        <p className="rl-eyebrow">Design Philosophy</p>
        <div className="rl-desc-body">
          <p>The most familiar forms often hold the greatest potential for reinvention.</p>
        </div>
        <p className="rl-question">Can the ordinary become quietly extraordinary?</p>
        <div className="rl-desc-body">
          <p>ROSELINE transforms an everyday object into a refined expression of contemporary jewelry, balancing delicate proportions with architectural simplicity. Every curve is intentional, proving that elegance is found not in excess, but in thoughtful design.</p>
        </div>
      </section>

      <VaultArchiveNotice />

      <section className="rl-final" data-testid="rl-final-quote">
        <p className="rl-final-line">
          &ldquo;Elegance begins with the simplest idea.&rdquo;
        </p>
        <p className="rl-final-attr">— PHILEON Inspiration Vault</p>
      </section>
    </div>
  );
}
