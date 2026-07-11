import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * ORIEL — Inspiration Vault · $40 USD
 *
 * Rhodium-plated nickel-free openwork drop earrings with AAA pavé cubic
 * zirconia. Vault-only archive edition. ORIEL is distinct from ARCHITRAVE
 * (the PHILEON Fine Jewelry diamond & white-gold evolution) and must never
 * inherit ARCHITRAVE's copy, materials, stone-count, or pricing.
 */

const HERO_IMAGE   = "/inspiration-vault/oriel/still-01.png";  // ear-worn portrait
const STILL_SPARK  = "/inspiration-vault/oriel/still-02.png";  // pair on hammered black bangle with prismatic sparkle
const STILL_PAIR   = "/inspiration-vault/oriel/still-03.jpg";  // clean pair on hammered black bangle
const STILL_MIRROR = "/inspiration-vault/oriel/still-04.jpg";  // top-down mirror composition
const STILL_BOWL   = "/inspiration-vault/oriel/still-05.jpg";  // curved white bowl portrait
const PRICE = 40;

const GALLERY = [
  { src: STILL_SPARK,  span: "half",          alt: "ORIEL — the pair captured with prismatic sparkle rays, the rose-window openwork medallion catching light against a hammered black cuff." },
  { src: STILL_PAIR,   span: "half",          alt: "ORIEL — clean editorial pair shot on hammered black metal and dark cloth, revealing the graduated three-station drop and pavé medallion." },
  { src: STILL_MIRROR, span: "half",          alt: "ORIEL — top-down mirror composition, the two openwork medallions and their reflections forming a symmetrical study in circular geometry." },
  { src: STILL_BOWL,   span: "half-portrait", alt: "ORIEL — the pair resting inside a curved white bowl, the openwork medallion isolated against soft neutral light." },
];

export default function OrielPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "ORIEL | Rhodium-Plated Openwork Drop Earrings | Inspiration Vault";
    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'An architectural study in light, proportion, and brilliance. Rhodium-plated nickel-free openwork drop earrings with AAA pavé cubic zirconia, preserved exclusively within the PHILEON Inspiration Vault.');
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-oriel",
      name: "ORIEL — Rhodium-Plated Openwork Drop Earrings",
      price: PRICE,
      productKey: "inspirationVaultOriel",
      tierKey: "default",
      metal: "Rhodium-Plated Nickel-Free White Metal · AAA Pavé Cubic Zirconia",
      sku: "IV-OR-RSW",
      quantity: 1,
      image: HERO_IMAGE,
    }, 1, "Rhodium-Plated Nickel-Free White Metal · AAA Pavé Cubic Zirconia");
  };

  return (
    <div className="or-page" data-testid="oriel-page">
      <LuxuryMotionStyles />
      <style>{`
        .or-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .or-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .or-return:hover { color:var(--gold); gap:16px; }
        .or-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .or-section { max-width:1180px; margin:0 auto; padding:clamp(64px,7vw,120px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:orFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes orFade { to { opacity:1; transform:translateY(0); } }
        .or-section.d1 { animation-delay:.12s; } .or-section.d2 { animation-delay:.24s; }
        .or-section.d3 { animation-delay:.36s; } .or-section.d4 { animation-delay:.48s; }
        .or-section.d5 { animation-delay:.60s; } .or-section.d6 { animation-delay:.72s; }
        .or-desc { text-align:center; }
        .or-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .or-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .or-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(32px,4vw,50px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 28px; text-transform:uppercase; letter-spacing:.018em; }
        .or-list { list-style:none; padding:0; margin:0 auto; max-width:720px; text-align:left; }
        .or-list li { position:relative; padding:9px 0 9px 24px; font-family:'Cormorant Garamond',serif;
          font-size:18px; line-height:1.6; color:var(--ink); }
        .or-list li::before { content:''; position:absolute; left:0; top:18px; width:8px; height:1px; background:var(--gold); }
        .or-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .or-gallery-cell { position:relative; aspect-ratio:1/1; overflow:hidden;
          background:var(--bg-deep); border:1px solid var(--rule-soft); }
        .or-gallery-cell.full { grid-column:1 / -1; aspect-ratio:16/10; }
        .or-gallery-cell.half { aspect-ratio: 1 / 1; }
        .or-gallery-cell.half-portrait { aspect-ratio: 3 / 4; }
        .or-gallery-cell img { width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .or-gallery-cell:hover img { transform:scale(1.03); }
        @media (max-width:640px){
          .or-gallery-grid { grid-template-columns:1fr; }
          .or-gallery-cell.full { aspect-ratio:4/5; }
          .or-gallery-cell.half { grid-column:1 / -1; aspect-ratio: 1 / 1; }
          .or-gallery-cell.half-portrait { grid-column:1 / -1; aspect-ratio: 3 / 4; }
        }
        .or-cta { text-align:center; }
        .or-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .or-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 30px; }
        .or-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .or-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .or-add-btn:disabled { opacity:.6; cursor:wait; }
        .or-philosophy { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); text-align:center; }
        .or-question { font-family:'Playfair Display',serif; font-weight:400;
          font-size:clamp(26px,2.6vw,38px); color:var(--ink-strong); margin:32px auto 20px; letter-spacing:.01em; }
        .or-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .or-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .or-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }
      `}</style>

      <Link to="/inspiration-vault" className="or-return" data-testid="or-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_IMAGE}
        prominent
        altText="ORIEL — rhodium-plated openwork drop earring worn against the ear, the pavé rose-window medallion catching studio light."
        eyebrow="Inspiration Vault"
        title="ORIEL"
        subhead="Light deserves a frame."
      />

      <section className="or-section or-desc d1" data-testid="or-desc">
        <p className="or-eyebrow">Editorial</p>
        <div className="or-desc-body">
          <p className="lead">An architectural study in light, proportion, and brilliance.</p>
          <p>ORIEL is defined by a graduated three-station drop leading into an intricate openwork medallion inspired by the geometry of a cathedral rose window. Pavé surfaces trace the circular framework, allowing light to pass through the design while preserving its commanding scale.</p>
          <p>Crafted from a premium nickel-free white metal and finished in a brilliant rhodium plating, ORIEL is meticulously hand-set with AAA pavé cubic zirconia. The luminous finish enhances the architectural openwork while allowing every pavé surface to reflect light with exceptional brilliance.</p>
          <p>The result is a study in precision, proportion, and light&mdash;preserved exactly as discovered within the PHILEON Inspiration Vault.</p>
        </div>
      </section>

      <section className="or-section or-cta d2" data-testid="or-cta">
        <p className="or-eyebrow">Vault Access</p>
        <p className="or-price-display" data-testid="or-price">${PRICE} USD</p>
        <p className="or-price-note">Gain permanent access to the ORIEL archive, including:</p>
        <ul className="or-list" style={{ margin: "0 auto 40px" }}>
          <li>High-resolution concept photography</li>
          <li>Complete editorial image gallery</li>
          <li>Multiple design angles</li>
          <li>Macro construction studies</li>
          <li>Design philosophy and creative notes</li>
          <li>Future archive updates for this concept</li>
          <li>Lifetime Inspiration Vault access</li>
        </ul>
        <button onClick={onAddToCart} disabled={isAdding} className="or-add-btn"
          data-testid="or-add-to-cart" aria-label="Add ORIEL Vault access to cart">
          {buttonText && buttonText !== "ADD TO CART" ? buttonText : "ADD TO CART"}
        </button>
      </section>

      <section className="or-section d3" data-testid="or-materials">
        <p className="or-eyebrow" style={{ textAlign:"center" }}>Materials</p>
        <h2 className="or-h2" style={{ textAlign:"center" }}>Rhodium light, held in geometry.</h2>
        <div className="or-desc-body" style={{ textAlign:"center" }}>
          <p>ORIEL is built from a premium nickel-free white metal, finished in a brilliant rhodium plating that delivers a luminous, mirror-clean surface. Every station of the drop and every ring of the medallion is hand-set with AAA pavé cubic zirconia&mdash;a jeweler-grade stone chosen for its precision cut and unwavering brilliance.</p>
          <p>The openwork is not decoration&mdash;it is architecture. Light passes through the medallion the way daylight passes through a rose window, turning the earring into a small cathedral of its own.</p>
        </div>
      </section>

      <section className="or-section d4" data-testid="or-study">
        <p className="or-eyebrow" style={{ textAlign:"center" }}>Design Study</p>
        <h2 className="or-h2" style={{ textAlign:"center" }}>The rose window, engineered to be worn.</h2>
        <ul className="or-list">
          <li>Premium Nickel-Free White Metal</li>
          <li>Brilliant Rhodium Finish</li>
          <li>AAA Pavé Cubic Zirconia</li>
          <li>Lightweight Drop Earrings</li>
          <li>Secure Post Backs</li>
          <li>Sold as a Pair</li>
        </ul>

        <div className="or-gallery-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`or-gallery-cell ${g.span || ""} lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
              data-testid={`or-gallery-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="or-section or-philosophy d5" data-testid="or-philosophy">
        <p className="or-eyebrow">Design Philosophy</p>
        <div className="or-desc-body">
          <p>Not every archive piece is defined by rarity of material.</p>
          <p>For ORIEL, the study began with a single question:</p>
        </div>
        <p className="or-question">Can a window of light be worn?</p>
        <div className="or-desc-body">
          <p>By carving the medallion as openwork rather than a solid disc, ORIEL trades weight for luminosity. What remains is a piece that behaves like a small stained-glass frame&mdash;architectural in scale, generous in brilliance, precise in every graduated station.</p>
        </div>
      </section>

      <VaultArchiveNotice />

      <section className="or-final" data-testid="or-final-quote">
        <p className="or-final-line">
          &ldquo;Some pieces are ornaments.<br/>
          Others are windows built to hold the light.&rdquo;
        </p>
        <p className="or-final-attr">— PHILEON Inspiration Vault</p>
      </section>
    </div>
  );
}
