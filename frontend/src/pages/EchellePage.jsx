import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * ÉCHELLE — Inspiration Vault · $115 USD
 *
 * Architectural three-tone hoop earrings — an exploration of movement,
 * negative space, and repetition. Vault-only archive piece; never added to
 * shop, earrings, carousel, or any production collection.
 */

const HERO_VIDEO  = "/inspiration-vault/echelle/hero-square.mp4";
const HERO_POSTER = "/inspiration-vault/echelle/hero-square-poster.jpg";
const STILL_01    = "/inspiration-vault/echelle/still-01-bust.jpg";
const STILL_02    = "/inspiration-vault/echelle/still-02-pair.jpg";
const GALLERY_VIDEO_A = "/inspiration-vault/echelle/hero-square.mp4";
const GALLERY_VIDEO_A_POSTER = "/inspiration-vault/echelle/hero-square-poster.jpg";
const GALLERY_VIDEO_B = "/inspiration-vault/echelle/gallery-2.mp4";
const GALLERY_VIDEO_B_POSTER = "/inspiration-vault/echelle/gallery-2-poster.jpg";
const PRICE = 115;

// Gallery order (preserved): existing 2 stills first, then the two motion cells appended.
const GALLERY = [
  { type: "img", src: STILL_01, span: "full", alt: "ÉCHELLE — editorial on-bust portrait, the alternating three-tone gold ribbons framing negative space against a dim boutique interior." },
  { type: "img", src: STILL_02, span: "full", alt: "ÉCHELLE — studio pair resting on black velvet, revealing the pavé density and open oval architecture of the rhythmic ribbon construction." },
  { type: "video", src: GALLERY_VIDEO_A, poster: GALLERY_VIDEO_A_POSTER, span: "half", alt: "ÉCHELLE — hero editorial film revealing alternating pavé bands moving through studio light." },
  { type: "video", src: GALLERY_VIDEO_B, poster: GALLERY_VIDEO_B_POSTER, span: "half", alt: "ÉCHELLE — supplementary editorial film exploring the open oval architecture from additional angles." },
];

export default function EchellePage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  useLuxuryMotionObserver();

  useEffect(() => { document.title = "ÉCHELLE — Inspiration Vault · PHILEON"; }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-echelle",
      name: "ÉCHELLE — Architectural Three-Tone Ribbon Hoops",
      price: PRICE,
      productKey: "inspirationVaultEchelle",
      tierKey: "default",
      metal: "Rhodium-Plated Brass · Three-Tone Gold",
      sku: "IV-EC-3TG",
      quantity: 1,
      image: HERO_POSTER,
    }, 1, "Rhodium-Plated Brass · Three-Tone Gold");
  };

  return (
    <div className="ec-page" data-testid="echelle-page">
      <LuxuryMotionStyles />
      <style>{`
        .ec-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .ec-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .ec-return:hover { color:var(--gold); gap:16px; }
        .ec-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .ec-section { max-width:1180px; margin:0 auto; padding:clamp(64px,7vw,120px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:ecFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes ecFade { to { opacity:1; transform:translateY(0); } }
        .ec-section.d1 { animation-delay:.12s; } .ec-section.d2 { animation-delay:.24s; }
        .ec-section.d3 { animation-delay:.36s; } .ec-section.d4 { animation-delay:.48s; }
        .ec-section.d5 { animation-delay:.60s; } .ec-section.d6 { animation-delay:.72s; }
        .ec-desc { text-align:center; }
        .ec-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .ec-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .ec-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(32px,4vw,50px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 28px; text-transform:uppercase; letter-spacing:.018em; }
        .ec-list { list-style:none; padding:0; margin:0 auto; max-width:720px; text-align:left; }
        .ec-list li { position:relative; padding:9px 0 9px 24px; font-family:'Cormorant Garamond',serif;
          font-size:18px; line-height:1.6; color:var(--ink); }
        .ec-list li::before { content:''; position:absolute; left:0; top:18px; width:8px; height:1px; background:var(--gold); }
        .ec-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .ec-gallery-cell { position:relative; aspect-ratio:1/1; overflow:hidden;
          background:var(--bg-deep); border:1px solid var(--rule-soft); }
        .ec-gallery-cell.full { grid-column:1 / -1; aspect-ratio:16/10; }
        .ec-gallery-cell img,
        .ec-gallery-cell video { width:100%; height:100%; object-fit:contain; display:block; padding:4%;
          background:#000;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .ec-gallery-cell:hover img,
        .ec-gallery-cell:hover video { transform:scale(1.02); }
        @media (max-width:640px){ .ec-gallery-grid { grid-template-columns:1fr; } .ec-gallery-cell.full { aspect-ratio:4/5; } }
        .ec-cta { text-align:center; }
        .ec-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .ec-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 30px; }
        .ec-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .ec-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .ec-add-btn:disabled { opacity:.6; cursor:wait; }
        .ec-philosophy { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); text-align:center; }
        .ec-question { font-family:'Playfair Display',serif; font-weight:400;
          font-size:clamp(26px,2.6vw,38px); color:var(--ink-strong); margin:32px auto 20px; letter-spacing:.01em; }
        .ec-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .ec-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .ec-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }
      `}</style>

      <Link to="/inspiration-vault" className="ec-return" data-testid="ec-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_POSTER}
        video={HERO_VIDEO}
        prominent
        altText="ÉCHELLE — architectural three-tone gold ribbon hoops, hero film revealing alternating pavé bands moving through studio light."
        eyebrow="Inspiration Vault"
        title="ÉCHELLE"
        subhead="Movement, captured in gold."
      />

      <section className="ec-section ec-desc d1" data-testid="ec-desc">
        <p className="ec-eyebrow">Editorial</p>
        <div className="ec-desc-body">
          <p className="lead">ÉCHELLE is an architectural study exploring rhythm through repetition.</p>
          <p>Rather than treating a hoop as a continuous circle, alternating ribbons of white, rose, and yellow gold weave around an open oval structure, allowing light to travel effortlessly through the design while preserving perfect visual balance from every angle.</p>
          <p>The uninterrupted pav&eacute; ribbons create the illusion of perpetual movement, transforming a familiar silhouette into a sculptural study of proportion, flow, and negative space.</p>
          <p>Preserved within the PHILEON Inspiration Vault, &Eacute;CHELLE represents an exploration of architectural motion&mdash;a design that celebrates the journey of creation before becoming a finished collection.</p>
        </div>
      </section>

      <section className="ec-section ec-cta d2" data-testid="ec-cta">
        <p className="ec-eyebrow">Vault Access</p>
        <p className="ec-price-display" data-testid="ec-price">${PRICE} USD</p>
        <p className="ec-price-note">Gain permanent access to the &Eacute;CHELLE archive, including:</p>
        <ul className="ec-list" style={{ margin: "0 auto 40px" }}>
          <li>High-resolution concept photography</li>
          <li>Complete editorial image gallery</li>
          <li>Multiple design angles</li>
          <li>Macro construction studies</li>
          <li>Design philosophy and creative notes</li>
          <li>Future archive updates for this concept</li>
          <li>Lifetime Inspiration Vault access</li>
        </ul>
        <button onClick={onAddToCart} disabled={isAdding} className="ec-add-btn"
          data-testid="ec-add-to-cart" aria-label="Add ÉCHELLE Vault access to cart">
          {buttonText && buttonText !== "ADD TO CART" ? buttonText : "UNLOCK VAULT ACCESS"}
        </button>
      </section>

      <section className="ec-section d3" data-testid="ec-materials">
        <p className="ec-eyebrow" style={{ textAlign:"center" }}>Materials</p>
        <h2 className="ec-h2" style={{ textAlign:"center" }}>Engineering meets illumination.</h2>
        <div className="ec-desc-body" style={{ textAlign:"center" }}>
          <p>&Eacute;CHELLE is built upon a sculptural architectural brass framework, finished in luminous rhodium-plated white, rose, and yellow gold. Each flowing ribbon is meticulously hand-set with AAA pav&eacute; cubic zirconia, transforming the open architecture into a continuous field of light with exceptional diamond-like brilliance.</p>
          <p>The result is an exploration of movement, contrast, and illumination&mdash;where engineering and artistry converge to create a piece worthy of the PHILEON Inspiration Vault.</p>
        </div>
      </section>

      <section className="ec-section d4" data-testid="ec-study">
        <p className="ec-eyebrow" style={{ textAlign:"center" }}>Design Study</p>
        <h2 className="ec-h2" style={{ textAlign:"center" }}>Repetition as architecture.</h2>
        <ul className="ec-list">
          <li>Sculptural open oval architecture</li>
          <li>Three-tone gold ribbon construction</li>
          <li>Luminous rhodium-plated white, rose, and yellow gold finish</li>
          <li>Precision hand-set AAA pav&eacute; cubic zirconia</li>
          <li>Continuous pav&eacute; ribbon design</li>
          <li>Open negative-space engineering</li>
          <li>Architectural balance through repetition</li>
          <li>Designed as an exploration of movement rather than symmetry</li>
        </ul>

        <div className="ec-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`ec-gallery-cell ${g.span || ""} lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
              data-testid={`ec-gallery-cell-${i + 1}`}>
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

      <section className="ec-section ec-philosophy d5" data-testid="ec-philosophy">
        <p className="ec-eyebrow">Design Philosophy</p>
        <div className="ec-desc-body">
          <p>Every collection begins with a question.</p>
          <p>For &Eacute;CHELLE, that question was:</p>
        </div>
        <p className="ec-question">Can movement exist without motion?</p>
        <div className="ec-desc-body">
          <p>By separating the ribbons and allowing light to travel freely through the architecture, the earrings appear to shift with every change in perspective. The design is never static; the eye continues to travel long after the piece has stopped moving.</p>
          <p>Rather than decorating a hoop, &Eacute;CHELLE reimagines its architecture.</p>
        </div>
      </section>

      <VaultArchiveNotice />

      <section className="ec-final" data-testid="ec-final-quote">
        <p className="ec-final-line">
          &ldquo;Some designs become collections.<br/>
          Others become the foundation that inspires them.&rdquo;
        </p>
        <p className="ec-final-attr">— PHILEON Inspiration Vault</p>
      </section>
    </div>
  );
}
