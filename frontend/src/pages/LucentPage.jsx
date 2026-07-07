import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * LUCENT — Inspiration Vault · $130 USD
 *
 * Pavé-set articulated chain-link hoop earrings — a study of chain reimagined
 * as continuous illumination. Vault-only archive piece; never added to shop,
 * earrings collection, carousel, or any production line.
 */

const HERO_VIDEO  = "/inspiration-vault/lucent/hero-film.mp4";
const HERO_POSTER = "/inspiration-vault/lucent/still-02-pair.jpg";
const STILL_01    = "/inspiration-vault/lucent/still-01-bust.jpg";
const STILL_02    = "/inspiration-vault/lucent/still-02-pair.jpg";
const STILL_03    = "/inspiration-vault/lucent/still-03-lifestyle.jpg";
const PRICE = 130;

// Gallery order: two editorial stills first, then the lifestyle still, then
// the portrait hero film to close the study.
const GALLERY = [
  { type: "img", src: STILL_01, span: "full", alt: "LUCENT — editorial on-model portrait, articulated pavé chain-link hoops framing the jawline in cool white light." },
  { type: "img", src: STILL_02, span: "full", alt: "LUCENT — studio pair, revealing the sculpted link geometry and continuous pavé density from a straight-on angle." },
  { type: "img", src: STILL_03, span: "full", alt: "LUCENT — lifestyle vignette catching the earrings against skin and fabric, isolating the interplay between weight and luminosity." },
  { type: "video", src: HERO_VIDEO, poster: HERO_POSTER, span: "full-portrait", alt: "LUCENT — hero editorial film revealing the articulated chain-links catching light as the earrings rotate." },
];

export default function LucentPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  useLuxuryMotionObserver();

  useEffect(() => { document.title = "LUCENT — Inspiration Vault · PHILEON"; }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-lucent",
      name: "LUCENT — Articulated Pavé Chain-Link Hoops",
      price: PRICE,
      productKey: "inspirationVaultLucent",
      tierKey: "default",
      metal: "Rhodium-Plated Brass · Continuous Pavé",
      sku: "IV-LC-CHN",
      quantity: 1,
      image: HERO_POSTER,
    }, 1, "Rhodium-Plated Brass · Continuous Pavé");
  };

  return (
    <div className="lc-page" data-testid="lucent-page">
      <LuxuryMotionStyles />
      <style>{`
        .lc-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .lc-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .lc-return:hover { color:var(--gold); gap:16px; }
        .lc-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .lc-section { max-width:1180px; margin:0 auto; padding:clamp(64px,7vw,120px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:lcFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes lcFade { to { opacity:1; transform:translateY(0); } }
        .lc-section.d1 { animation-delay:.12s; } .lc-section.d2 { animation-delay:.24s; }
        .lc-section.d3 { animation-delay:.36s; } .lc-section.d4 { animation-delay:.48s; }
        .lc-section.d5 { animation-delay:.60s; } .lc-section.d6 { animation-delay:.72s; }
        .lc-desc { text-align:center; }
        .lc-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .lc-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .lc-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(32px,4vw,50px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 28px; text-transform:uppercase; letter-spacing:.018em; }
        .lc-list { list-style:none; padding:0; margin:0 auto; max-width:720px; text-align:left; }
        .lc-list li { position:relative; padding:9px 0 9px 24px; font-family:'Cormorant Garamond',serif;
          font-size:18px; line-height:1.6; color:var(--ink); }
        .lc-list li::before { content:''; position:absolute; left:0; top:18px; width:8px; height:1px; background:var(--gold); }
        .lc-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .lc-gallery-cell { position:relative; aspect-ratio:1/1; overflow:hidden;
          background:var(--bg-deep); border:1px solid var(--rule-soft); }
        .lc-gallery-cell.full { grid-column:1 / -1; aspect-ratio:16/10; }
        /* Portrait-video cell: matches the 9:16 hero film aspect exactly so
           object-fit:contain fills edge-to-edge with zero letterboxing. */
        .lc-gallery-cell.full-portrait {
          grid-column: 1 / -1;
          aspect-ratio: 9 / 16;
          height: min(92vh, 1120px);
          width: auto;
          max-width: 100%;
          justify-self: center;
          margin: 0 auto;
        }
        .lc-gallery-cell img,
        .lc-gallery-cell video { width:100%; height:100%; object-fit:contain; display:block; padding:4%;
          background:#000;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .lc-gallery-cell.full-portrait video { padding: 0; }
        .lc-gallery-cell:hover img,
        .lc-gallery-cell:hover video { transform:scale(1.02); }
        @media (max-width:640px){
          .lc-gallery-grid { grid-template-columns:1fr; }
          .lc-gallery-cell.full { aspect-ratio:4/5; }
          .lc-gallery-cell.full-portrait { height:min(88vh, 780px); aspect-ratio: 9 / 16; }
        }
        .lc-cta { text-align:center; }
        .lc-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .lc-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 30px; }
        .lc-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .lc-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .lc-add-btn:disabled { opacity:.6; cursor:wait; }
        .lc-philosophy { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); text-align:center; }
        .lc-question { font-family:'Playfair Display',serif; font-weight:400;
          font-size:clamp(26px,2.6vw,38px); color:var(--ink-strong); margin:32px auto 20px; letter-spacing:.01em; }
        .lc-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .lc-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .lc-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }
      `}</style>

      <Link to="/inspiration-vault" className="lc-return" data-testid="lc-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_POSTER}
        video={HERO_VIDEO}
        prominent
        altText="LUCENT — articulated pavé chain-link hoop earrings, hero film rotating slowly through cool white studio light."
        eyebrow="Inspiration Vault"
        title="LUCENT"
        subhead="Chain, remembered as light."
      />

      <section className="lc-section lc-desc d1" data-testid="lc-desc">
        <p className="lc-eyebrow">Editorial</p>
        <div className="lc-desc-body">
          <p className="lead">LUCENT reimagines the chain as a continuous field of illumination.</p>
          <p>Rather than treating the hoop as a smooth, uninterrupted circle, each earring is built from articulated links&mdash;heavy, sculpted, and precise&mdash;then dressed edge-to-edge in dense pav&eacute;. The industrial vocabulary of the chain is softened, then rewritten, into an unbroken current of light.</p>
          <p>Every link answers the one before it. The geometry stays legible, but the surface never rests: light travels around the hoop the way a whisper travels down a corridor&mdash;continuous, deliberate, and unmistakably present.</p>
          <p>Preserved within the PHILEON Inspiration Vault, LUCENT represents a study of how weight can be worn as luminosity&mdash;a piece that trades softness for structure without ever surrendering elegance.</p>
        </div>
      </section>

      <section className="lc-section lc-cta d2" data-testid="lc-cta">
        <p className="lc-eyebrow">Vault Access</p>
        <p className="lc-price-display" data-testid="lc-price">${PRICE} USD</p>
        <p className="lc-price-note">Gain permanent access to the LUCENT archive, including:</p>
        <ul className="lc-list" style={{ margin: "0 auto 40px" }}>
          <li>High-resolution concept photography</li>
          <li>Complete editorial image gallery</li>
          <li>Multiple design angles</li>
          <li>Macro construction studies</li>
          <li>Design philosophy and creative notes</li>
          <li>Future archive updates for this concept</li>
          <li>Lifetime Inspiration Vault access</li>
        </ul>
        <button onClick={onAddToCart} disabled={isAdding} className="lc-add-btn"
          data-testid="lc-add-to-cart" aria-label="Add LUCENT Vault access to cart">
          {buttonText && buttonText !== "ADD TO CART" ? buttonText : "UNLOCK VAULT ACCESS"}
        </button>
      </section>

      <section className="lc-section d3" data-testid="lc-materials">
        <p className="lc-eyebrow" style={{ textAlign:"center" }}>Materials</p>
        <h2 className="lc-h2" style={{ textAlign:"center" }}>Weight, translated into light.</h2>
        <div className="lc-desc-body" style={{ textAlign:"center" }}>
          <p>LUCENT is built upon a sculptural articulated brass framework, finished in luminous rhodium-plated white gold. Every link is individually contoured and hand-set with AAA pav&eacute; cubic zirconia&mdash;prong-minimal, edge-to-edge&mdash;to erase the boundary between metal and stone.</p>
          <p>The result is architecture dressed as illumination: cool, precise, and unmistakably present. The chain-link vocabulary is honoured; the surface is rewritten. What remains is a continuous, refractive current that catches every register of studio light.</p>
        </div>
      </section>

      <section className="lc-section d4" data-testid="lc-study">
        <p className="lc-eyebrow" style={{ textAlign:"center" }}>Design Study</p>
        <h2 className="lc-h2" style={{ textAlign:"center" }}>The chain, rewritten as brilliance.</h2>
        <ul className="lc-list">
          <li>Articulated sculptural chain-link architecture</li>
          <li>Continuous edge-to-edge pav&eacute; surface</li>
          <li>Rhodium-plated white gold finish over solid brass framework</li>
          <li>Precision hand-set AAA pav&eacute; cubic zirconia</li>
          <li>Prong-minimal setting for uninterrupted light travel</li>
          <li>Hinged post-back construction for flush earlobe wear</li>
          <li>Substantial weight tuned for balance rather than drag</li>
          <li>Designed as a study of chain reimagined as light</li>
        </ul>

        <div className="lc-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`lc-gallery-cell ${g.span || ""} lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
              data-testid={`lc-gallery-cell-${i + 1}`}>
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

      <section className="lc-section lc-philosophy d5" data-testid="lc-philosophy">
        <p className="lc-eyebrow">Design Philosophy</p>
        <div className="lc-desc-body">
          <p>Every collection begins with a question.</p>
          <p>For LUCENT, that question was:</p>
        </div>
        <p className="lc-question">Can a chain be worn as light?</p>
        <div className="lc-desc-body">
          <p>By articulating each link and dressing it edge-to-edge in pav&eacute;, the earring loses its industrial memory. The geometry survives; the material register does not. What was once a symbol of weight becomes a vocabulary of illumination.</p>
          <p>Rather than decorating a chain, LUCENT rewrites what a chain is allowed to be.</p>
        </div>
      </section>

      <VaultArchiveNotice />

      <section className="lc-final" data-testid="lc-final-quote">
        <p className="lc-final-line">
          &ldquo;Some pieces are worn.<br/>
          Others rewrite the vocabulary of what wearing means.&rdquo;
        </p>
        <p className="lc-final-attr">— PHILEON Inspiration Vault</p>
      </section>
    </div>
  );
}
