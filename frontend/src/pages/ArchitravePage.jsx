import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import { cadToUsdLuxury } from "@/lib/livePricing";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * ARCHITRAVE — PHILEON Fine Jewelry
 *
 * Available in three editions (all Made to Order, sold as a pair):
 *   • Sterling Silver · AAA Cubic Zirconia          $8,950 CAD
 *   • 10K White Gold · Lab-Grown Diamonds           $9,750 CAD
 *   • 14K White Gold · Lab-Grown Diamonds (default) $9,950 CAD
 *
 * ARCHITRAVE is distinct from the Inspiration Vault's ORIEL. Do NOT merge,
 * rename, or share ORIEL's copy, materials, pricing, or Vault routing.
 * Navigation: Ladies First → Earrings.
 */

// ── ASSETS ──────────────────────────────────────────────────────────────────
const HERO_IMAGE     = "/architrave/still-clean-pair.jpg";  // hero poster (also cart image)
const HERO_VIDEO     = "/architrave/hero-film.mp4";         // silent, autoplay, loop (product page only)
const HERO_POSTER    = "/architrave/still-clean-pair.jpg";  // static fallback until video paints
const GALLERY_FILM   = "/architrave/gallery-film.mp4";      // silent portrait film — gallery only
const IMG_MANNEQ     = "/architrave/still-mannequin.jpg";
const IMG_LIFESTYLE  = "/architrave/lifestyle-cafe.png";
const IMG_PAIR       = "/architrave/still-clean-pair.jpg";
const IMG_PHILEON    = "/architrave/still-phileon-box.png";
const IMG_MARBLE     = "/architrave/hero.jpg";

// ── EDITIONS ────────────────────────────────────────────────────────────────
// Internal costing stays in CAD (basePriceCAD).
// Public storefront prices are derived via the shared cadToUsdLuxury() rule
// (CAD × 0.75, rounded to nearest $50 <$2k, nearest $500 ≥$2k).
// NEVER expose basePriceCAD publicly; only usdPrice is shown & passed to cart.
const EDITIONS_INTERNAL = [
  {
    key: "silver-cz",
    sku: "architrave-silver-cz",
    label: "Sterling Silver",
    material: "Sterling Silver · AAA Cubic Zirconia",
    stones: "536 AAA Cubic Zirconia Stones Per Pair",
    basePriceCAD: 8950,
  },
  {
    key: "10k-white-lab",
    sku: "architrave-10k-white-lab",
    label: "10K White Gold",
    material: "10K White Gold · Lab-Grown Diamonds",
    stones: "536 Lab-Grown Diamonds Per Pair",
    basePriceCAD: 9750,
  },
  {
    key: "14k-white-lab",
    sku: "architrave-14k-white-lab",
    label: "14K White Gold",
    material: "14K White Gold · Lab-Grown Diamonds",
    stones: "536 Lab-Grown Diamonds Per Pair",
    basePriceCAD: 9950,
  },
];
// Materialise the USD-facing view once, using the shared PHILEON conversion.
const EDITIONS = EDITIONS_INTERNAL.map((e) => ({
  ...e,
  usdPrice: cadToUsdLuxury(e.basePriceCAD),
  currency: "USD",
}));
const DEFAULT_EDITION_KEY = "14k-white-lab";

const fmtUSD = (n) => `$${Number(n).toLocaleString("en-US")} USD`;

// Gallery order — image-only cells + one silent portrait film. No visible captions.
// Alt text preserved for a11y.
const GALLERY = [
  { type: "image", src: IMG_LIFESTYLE, alt: "A woman smiling in daylight, wearing ARCHITRAVE — the openwork medallion catching sunlight at true scale against the line of the neck." },
  { type: "image", src: IMG_MANNEQ,    alt: "ARCHITRAVE presented on a sculptural black bust, revealing the graduated three-station drop and full openwork medallion." },
  { type: "video", src: GALLERY_FILM,  alt: "ARCHITRAVE cinematic close study — silent, looping product film." },
  { type: "image", src: IMG_PHILEON,   alt: "ARCHITRAVE presented on a PHILEON-branded stand alongside PHILEON packaging, showing scale and finish." },
  { type: "image", src: IMG_PAIR,      alt: "A front-and-angle view of the ARCHITRAVE pair on a clean neutral background, revealing articulated links and refined white-metal profile." },
  { type: "image", src: IMG_MARBLE,    alt: "A close front-facing view of the ARCHITRAVE pair on a soft grey stone surface — two medallions in symmetry." },
];

export default function ArchitravePage() {
  useLuxuryMotionObserver();
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const [editionKey, setEditionKey] = useState(DEFAULT_EDITION_KEY);
  const edition = EDITIONS.find((e) => e.key === editionKey) || EDITIONS[2];
  const heroVideoRef = useRef(null);
  const galleryVideoRef = useRef(null);

  // Autoplay reliability — force-mute + attempt play; keep poster if blocked.
  useEffect(() => {
    for (const v of [heroVideoRef.current, galleryVideoRef.current]) {
      if (!v) continue;
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      const p = v.play();
      if (p !== undefined) {
        p.catch(() => { /* browser blocked — poster stays visible */ });
      }
    }
  }, []);

  useEffect(() => {
    document.title = "ARCHITRAVE | Diamond & CZ Drop Earrings | PHILEON";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      'content',
      'ARCHITRAVE is an architectural drop earring by PHILEON Fine Jewelry, featuring 536 stones per pair across graduated stations and an openwork radial medallion. Available in Sterling Silver, 10K White Gold, and 14K White Gold.'
    );
  }, []);

  const onAddToCart = () => {
    handleAddToCart(
      {
        id: edition.sku,
        name: `ARCHITRAVE — ${edition.label}`,
        price: edition.usdPrice,   // Public storefront USD (converted). NEVER CAD.
        currency: "USD",
        sku: edition.sku,
        productKey: "architrave",
        tierKey: edition.key,
        slug: "architrave",
        image: HERO_IMAGE,
        images: [HERO_IMAGE],
        materials: [edition.material],
        soldAs: "pair",
      },
      1,
      edition.material
    );
  };

  return (
    <div className="ar-page" data-testid="architrave-page">
      <LuxuryMotionStyles />
      <style>{`
        .ar-page {
          --ink:#e8e2d4; --ink-strong:#f5efe1; --ink-dim:#8a827a;
          --steel:#a9adb4;
          --beam:rgba(233,226,212,.18);
          --bg:#050505; --bg-deep:#020202; --bg-panel:#0a0a0a;
          --rule:rgba(233,226,212,.08);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 55%,#000 100%);
          color:var(--ink);
          font-family:'Cormorant Garamond',serif;
          min-height:100vh;
          overflow-x:hidden;
        }

        /* NAV */
        .ar-return {
          display:inline-flex;align-items:center;gap:10px;
          padding:20px 30px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-dim);text-decoration:none;text-transform:uppercase;
          transition:color 280ms ease,gap 280ms ease;
        }
        .ar-return:hover { color:var(--ink-strong);gap:16px; }

        /* SHARED */
        .ar-eyebrow {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5em;
          color:var(--steel);text-transform:uppercase;margin:0 0 22px;
        }
        .ar-section {
          max-width:1280px;margin:0 auto;
          padding:clamp(70px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0;transform:translateY(24px);
          animation:arFade 1.05s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes arFade { to { opacity:1;transform:translateY(0); } }
        .ar-section.d1 { animation-delay:.12s; } .ar-section.d2 { animation-delay:.24s; }
        .ar-section.d3 { animation-delay:.36s; } .ar-section.d4 { animation-delay:.48s; }
        .ar-section.d5 { animation-delay:.60s; }

        /* BEAM — structural signature */
        .ar-beam { display:block;height:1px;background:var(--beam);max-width:1280px;margin:0 auto; }
        .ar-beam-inline {
          display:inline-block;width:60px;height:1px;background:var(--beam);
          vertical-align:middle;margin:0 18px;
        }

        /* HERO — image renders at natural aspect; NO forced crop */
        .ar-hero {
          max-width:1280px;margin:0 auto;
          padding:clamp(40px,6vw,90px) clamp(20px,4vw,60px) clamp(60px,7vw,110px);
          display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(36px,5vw,80px);
          align-items:center;
          border-bottom:1px solid var(--rule);
        }
        .ar-hero-copy { position:relative;z-index:2;min-width:0; }
        .ar-hero-title {
          font-family:'Cinzel',serif;font-weight:400;
          font-size:clamp(46px,6.5vw,108px);line-height:.96;letter-spacing:.015em;
          color:var(--ink-strong);margin:0 0 26px;text-transform:uppercase;
          word-break:normal;overflow-wrap:normal;white-space:nowrap;
        }
        .ar-hero-tagline {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(19px,1.9vw,26px);line-height:1.4;color:var(--ink);
          max-width:520px;margin:0 0 34px;
        }
        .ar-hero-stones {
          padding:18px 0;border-top:1px solid var(--beam);border-bottom:1px solid var(--beam);
          max-width:460px;margin:0 0 34px;
        }
        .ar-hero-stone-line {
          font-family:'Cinzel',serif;font-size:clamp(16px,1.55vw,20px);letter-spacing:.32em;
          color:var(--ink-strong);text-transform:uppercase;display:block;
        }
        .ar-hero-stone-note {
          font-family:'Jost',sans-serif;font-size:12px;letter-spacing:.22em;
          color:var(--ink-dim);text-transform:uppercase;display:block;margin-top:6px;
        }
        .ar-hero-visual {
          position:relative;overflow:visible;background:var(--bg-panel);
          border:1px solid var(--rule);padding:14px;
        }
        .ar-hero-visual img,
        .ar-hero-visual .architrave-hero-video {
          width:100%;height:auto;display:block;object-fit:contain;
        }
        .architrave-hero-video {
          display:block;
          width:100%;
          height:auto;
          max-width:100%;
          object-fit:contain;
          object-position:center;
          background:#000;
        }
        @media (max-width:768px){
          .architrave-hero-video {
            width:100%;
            height:auto;
            max-height:none;
            object-fit:contain;
            object-position:center top;
          }
        }
        /* Gallery video mirrors the still-image cell — silent autoloop */
        .ar-gallery-cell video {
          width:100%;height:auto;object-fit:contain;display:block;background:#000;
        }

        /* EDITION SELECTOR + CART */
        .ar-buy {
          margin-top:8px;
        }
        .ar-editions {
          display:flex;flex-direction:column;gap:10px;margin:0 0 22px;padding:0;
          list-style:none;
        }
        .ar-edition {
          appearance:none;background:transparent;
          border:1px solid var(--beam);
          padding:16px 18px;text-align:left;cursor:pointer;
          display:grid;grid-template-columns:1fr auto;gap:18px;align-items:baseline;
          color:var(--ink);
          transition:border-color 320ms ease,background 320ms ease;
          font-family:inherit;
        }
        .ar-edition:hover { border-color:var(--ink-dim); }
        .ar-edition[aria-pressed="true"] {
          border-color:var(--ink-strong);
          background:rgba(233,226,212,.045);
        }
        .ar-edition-material {
          font-family:'Cormorant Garamond',serif;font-size:17px;line-height:1.35;
          color:var(--ink-strong);
        }
        .ar-edition-label {
          font-family:'Jost',sans-serif;font-size:10.5px;letter-spacing:.32em;
          color:var(--steel);text-transform:uppercase;margin-bottom:4px;display:block;
        }
        .ar-edition-price {
          font-family:'Cinzel',serif;font-size:14.5px;letter-spacing:.14em;
          color:var(--ink-strong);white-space:nowrap;
        }
        .ar-availability {
          font-family:'Jost',sans-serif;font-size:11px;letter-spacing:.28em;
          color:var(--ink-dim);text-transform:uppercase;margin:0 0 22px;
        }
        .ar-add-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:12px;
          width:100%;max-width:460px;
          padding:20px 44px;border:1px solid var(--ink-strong);background:transparent;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:.5em;
          color:var(--ink-strong);text-transform:uppercase;cursor:pointer;
          transition:background 440ms ease,color 440ms ease;
        }
        .ar-add-btn:hover:not(:disabled) {
          background:var(--ink-strong);color:var(--bg-deep);
        }
        .ar-add-btn:disabled { opacity:.7;cursor:wait; }

        /* MOBILE HERO — title must fit inside viewport, ALL earrings visible */
        @media (max-width:900px){
          .ar-hero {
            grid-template-columns:1fr;
            padding:24px 16px 48px;
            gap:34px;
          }
          .ar-hero-visual {
            order:-1;
            padding:8px;
          }
          .ar-hero-title {
            font-size:clamp(38px,10vw,58px);
            letter-spacing:.008em;
            line-height:1;
            margin:0 0 18px;
          }
          .ar-add-btn { max-width:none; }
        }
        @media (max-width:420px){
          .ar-hero-title {
            font-size:clamp(30px,9.2vw,44px);
            letter-spacing:.004em;
          }
        }

        /* EDITORIAL */
        .ar-editorial p {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(19px,1.5vw,23px);line-height:1.7;
          color:var(--ink);max-width:720px;margin:0 0 22px;
        }
        .ar-editorial p:last-child { margin-bottom:0; }
        .ar-editorial .em {
          font-family:'Playfair Display',serif;font-style:italic;color:var(--ink-strong);
        }

        /* POWER */
        .ar-power { background:var(--bg-deep);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule); }
        .ar-power-title {
          font-family:'Cinzel',serif;font-weight:400;
          font-size:clamp(26px,3.2vw,42px);line-height:1.1;letter-spacing:.05em;
          color:var(--ink-strong);text-transform:uppercase;margin:0 0 32px;text-align:center;
        }
        .ar-power-intro {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(19px,1.5vw,23px);line-height:1.72;
          color:var(--ink);max-width:760px;margin:0 auto;text-align:center;
        }
        .ar-principles {
          display:grid;grid-template-columns:repeat(4,1fr);
          gap:clamp(32px,3.5vw,60px);margin-top:clamp(52px,6vw,90px);
        }
        .ar-principle { border-top:1px solid var(--beam);padding-top:24px; }
        .ar-principle-label {
          font-family:'Jost',sans-serif;font-size:11px;letter-spacing:.32em;
          color:var(--steel);text-transform:uppercase;margin:0 0 14px;
        }
        .ar-principle-title {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(20px,1.8vw,26px);line-height:1.22;
          color:var(--ink-strong);margin:0 0 12px;
        }
        .ar-principle-body {
          font-family:'Cormorant Garamond',serif;
          font-size:16px;line-height:1.65;color:var(--ink);margin:0;
        }
        @media (max-width:900px){ .ar-principles { grid-template-columns:1fr 1fr; } }
        @media (max-width:560px){ .ar-principles { grid-template-columns:1fr; } }

        /* BUILD / SPECIFICATION */
        .ar-build { background:var(--bg-deep);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule); }
        .ar-build-inner {
          max-width:1080px;margin:0 auto;
          padding:clamp(70px,8vw,130px) clamp(20px,4vw,60px);
        }
        .ar-build-title {
          font-family:'Cinzel',serif;font-weight:400;
          font-size:clamp(28px,3.4vw,44px);letter-spacing:.05em;
          color:var(--ink-strong);text-transform:uppercase;margin:0 0 40px;text-align:center;
        }
        .spec-row {
          display:grid;grid-template-columns:220px 1fr;gap:32px;
          padding:20px 0;border-bottom:1px solid var(--beam);
          align-items:baseline;
        }
        .spec-row:last-child { border-bottom:none; }
        .spec-label {
          font-family:'Jost',sans-serif;font-size:11.5px;letter-spacing:.36em;
          color:var(--steel);text-transform:uppercase;
        }
        .spec-value {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(17px,1.4vw,21px);line-height:1.5;color:var(--ink-strong);
        }
        .spec-value .accent {
          font-family:'Cinzel',serif;font-size:1.3em;letter-spacing:.06em;
          color:var(--ink-strong);margin-right:6px;
        }
        @media (max-width:640px){ .spec-row { grid-template-columns:1fr;gap:8px; } }

        /* GALLERY — two-column desktop, one-column mobile, natural aspect */
        .ar-gallery-grid {
          display:grid;grid-template-columns:1fr 1fr;
          gap:clamp(16px,2vw,28px);align-items:start;
        }
        .ar-gallery-cell {
          background:var(--bg-panel);border:1px solid var(--rule);padding:10px;
          overflow:visible;
        }
        .ar-gallery-cell img {
          width:100%;height:auto;object-fit:contain;display:block;
        }
        @media (max-width:820px){
          .ar-gallery-grid { grid-template-columns:1fr; }
        }

        /* CLOSING */
        .ar-closing {
          text-align:center;
          padding:clamp(110px,13vw,200px) clamp(20px,4vw,60px);
          background:#000;
          border-top:1px solid var(--rule);
        }
        .ar-closing-title {
          font-family:'Cinzel',serif;font-weight:400;
          font-size:clamp(36px,5vw,72px);line-height:1;letter-spacing:.07em;
          color:var(--ink-strong);text-transform:uppercase;margin:0 0 40px;
        }
        .ar-closing-body p {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(19px,1.55vw,24px);line-height:1.72;
          color:var(--ink);max-width:720px;margin:0 auto 22px;
        }
        .ar-closing-body p:last-of-type { margin-bottom:48px; }
        .ar-closing-footer {
          margin-top:74px;padding-top:32px;border-top:1px solid var(--beam);
          font-family:'Jost',sans-serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-dim);text-transform:uppercase;
        }

        @media (prefers-reduced-motion: reduce){
          .ar-section { animation:none;opacity:1;transform:none; }
        }
      `}</style>

      <Link
        to="/shop?category=earrings&audience=ladies"
        className="ar-return"
        data-testid="ar-return"
      >
        <ArrowLeft size={14} /> LADIES FIRST · EARRINGS
      </Link>

      {/* HERO */}
      <section className="ar-hero" data-testid="ar-hero" aria-label="ARCHITRAVE hero">
        <div className="ar-hero-copy">
          <p className="ar-eyebrow" data-testid="ar-eyebrow">PHILEON Fine Jewelry</p>
          <h1 className="ar-hero-title" data-testid="ar-title">ARCHITRAVE</h1>
          <p className="ar-hero-tagline" data-testid="ar-tagline">
            Old world structure, worn in the modern register.
          </p>
          <div className="ar-hero-stones" data-testid="ar-hero-stones">
            <span className="ar-hero-stone-line" data-testid="ar-stones">
              536 Stones Per Pair
            </span>
            <span className="ar-hero-stone-note">268 per earring</span>
          </div>

          {/* BUY BLOCK */}
          <div className="ar-buy" data-testid="ar-buy">
            <ul className="ar-editions" role="radiogroup" aria-label="Choose ARCHITRAVE edition">
              {EDITIONS.map((ed) => (
                <li key={ed.key}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={editionKey === ed.key}
                    aria-pressed={editionKey === ed.key}
                    className="ar-edition"
                    onClick={() => setEditionKey(ed.key)}
                    data-testid={`ar-edition-${ed.key}`}
                  >
                    <span>
                      <span className="ar-edition-label">{ed.label}</span>
                      <span className="ar-edition-material">{ed.material}</span>
                    </span>
                    <span className="ar-edition-price" data-testid={`ar-edition-${ed.key}-price`}>
                      {fmtUSD(ed.usdPrice)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="ar-availability" data-testid="ar-availability">
              Made to order. &nbsp;·&nbsp; Sold as a pair.
            </p>
            <button
              type="button"
              className="ar-add-btn"
              onClick={onAddToCart}
              disabled={isAdding}
              data-testid="ar-add-to-cart"
              aria-label={`Add ARCHITRAVE ${edition.label} to cart`}
            >
              {isAdding ? "✓ Added" : "Add to Cart"}
            </button>
          </div>
        </div>

        <div className="ar-hero-visual">
          <video
            ref={heroVideoRef}
            className="architrave-hero-video"
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            aria-label="ARCHITRAVE cinematic product film"
            data-testid="ar-hero-video"
          >
            Your browser does not support embedded video.
          </video>
        </div>
      </section>

      {/* EDITORIAL INTRODUCTION */}
      <section className="ar-section ar-editorial d1" data-testid="ar-editorial">
        <p className="ar-eyebrow">Editorial</p>
        <p>
          Before the frieze. Before the cornice. Before ornament is permitted to speak, there is the <span className="em">architrave</span>—the beam spanning column to column, establishing the order of everything above it.
        </p>
        <p>Remove it, and the composition loses its authority.</p>
        <p>
          ARCHITRAVE is built on the same principle. A concentric arrangement of stones, set stone by stone, ring answering ring. Nothing is arbitrary. Every line contributes to the architecture.
        </p>
      </section>

      <div className="ar-beam" aria-hidden="true" />

      {/* POWER */}
      <section className="ar-section ar-power d2" data-testid="ar-power">
        <p className="ar-eyebrow" style={{ textAlign: "center" }}>The Principle</p>
        <h2 className="ar-power-title">Power That Doesn&rsquo;t Announce Itself</h2>
        <p className="ar-power-intro">
          In old-world architecture, the beam did not need a signature. The structure spoke instead—strength expressed quietly, without spectacle and without requesting recognition.
        </p>

        <div className="ar-principles" data-testid="ar-principles">
          <div className="ar-principle">
            <p className="ar-principle-label">The Grid</p>
            <h3 className="ar-principle-title">Radial architecture, drawn from a single centre.</h3>
            <p className="ar-principle-body">
              A radial architecture of concentric rings, drawn outward from a single centre—the same visual logic that gives a rose window its order, balance, and permanence.
            </p>
          </div>
          <div className="ar-principle">
            <p className="ar-principle-label">The Drop</p>
            <h3 className="ar-principle-title">Three graduated stations. One controlled descent.</h3>
            <p className="ar-principle-body">
              Three graduated stations descend toward the medallion, establishing rhythm, proportion, and a controlled transition into the larger circular form.
            </p>
          </div>
          <div className="ar-principle">
            <p className="ar-principle-label">The Material</p>
            <h3 className="ar-principle-title">Chosen to recede beneath the brilliance of the stones.</h3>
            <p className="ar-principle-body">
              Available in Sterling Silver, 10K White Gold, and 14K White Gold—each selected for its permanence and its ability to recede beneath the brilliance of the stones.
            </p>
          </div>
          <div className="ar-principle">
            <p className="ar-principle-label">The Principle</p>
            <h3 className="ar-principle-title">Geometry is not applied. It is the piece.</h3>
            <p className="ar-principle-body">
              Nothing is placed without intention. The geometry is not applied to the piece; it is the piece. Built, not made.
            </p>
          </div>
        </div>
      </section>

      {/* BUILD / SPECIFICATION */}
      <section className="ar-build d3" data-testid="ar-build">
        <div className="ar-build-inner">
          <p className="ar-eyebrow" style={{ textAlign: "center" }}>The Build</p>
          <h2 className="ar-build-title">Specification</h2>

          <div className="spec-row" data-testid="spec-material">
            <span className="spec-label">Material</span>
            <span className="spec-value">
              Available in Sterling Silver, 10K White Gold, and 14K White Gold
            </span>
          </div>

          <div className="spec-row" data-testid="spec-stones">
            <span className="spec-label">Stones</span>
            <span className="spec-value">
              <span className="accent">536</span> Stones Per Pair
              <br />
              <small style={{ fontFamily: "'Jost',sans-serif", fontSize: 13.5, color: "var(--ink-dim)", letterSpacing: ".14em" }}>
                268 per earring · AAA Cubic Zirconia (Silver) or Lab-Grown Diamonds (10K &amp; 14K)
              </small>
            </span>
          </div>

          <div className="spec-row">
            <span className="spec-label">Setting</span>
            <span className="spec-value">Pavé &amp; Prong</span>
          </div>

          <div className="spec-row">
            <span className="spec-label">Format</span>
            <span className="spec-value">Graduated Three-Station Drop</span>
          </div>

          <div className="spec-row">
            <span className="spec-label">Silhouette</span>
            <span className="spec-value">Openwork Medallion · Radial Architecture</span>
          </div>

          <div className="spec-row">
            <span className="spec-label">Dimensions</span>
            <span className="spec-value">Approx. 55 mm Overall · 30 mm Medallion</span>
          </div>

          <div className="spec-row">
            <span className="spec-label">Closure</span>
            <span className="spec-value">Secure Post &amp; Earring Back</span>
          </div>

          <div className="spec-row" data-testid="spec-production">
            <span className="spec-label">Production</span>
            <span className="spec-value">Made to Order · Sold as a Pair</span>
          </div>
        </div>
      </section>

      {/* GALLERY — image only, no captions, no crop */}
      <section className="ar-section d4" data-testid="ar-gallery">
        <p className="ar-eyebrow" style={{ textAlign: "center" }}>The Study</p>
        <h2 className="ar-power-title" style={{ marginBottom: 44 }}>
          Five Views. One Architecture.
        </h2>
        <div className="ar-gallery-grid">
          {GALLERY.map((g, i) => (
            <div
              key={i}
              className={`ar-gallery-cell lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
              data-testid={`ar-gallery-cell-${i + 1}`}
            >
              {g.type === "video" ? (
                <video
                  ref={i === 2 ? galleryVideoRef : undefined}
                  src={g.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  controls={false}
                  disablePictureInPicture
                  controlsList="nodownload nofullscreen noremoteplayback"
                  aria-label={g.alt}
                  data-testid={`ar-gallery-video-${i + 1}`}
                >
                  Your browser does not support embedded video.
                </video>
              ) : (
                <img src={g.src} alt={g.alt} loading="lazy" />
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="ar-beam" aria-hidden="true" />

      {/* CLOSING */}
      <section className="ar-closing d5" data-testid="ar-closing">
        <p className="ar-eyebrow">The Statement</p>
        <h2 className="ar-closing-title">Not Made. Built.</h2>
        <div className="ar-closing-body">
          <p>
            ARCHITRAVE does not simply ask to be looked at. It asks to be understood—the way architecture is understood by standing beneath it.
          </p>
          <p>
            Concentric rings, open geometry, articulated links, and hundreds of stones combine in a composition engineered for presence, balance, and permanence.
          </p>
          <p>This is jewelry conceived to outlast the temporary.</p>
        </div>
        <button
          type="button"
          className="ar-add-btn"
          onClick={onAddToCart}
          disabled={isAdding}
          data-testid="ar-add-to-cart-footer"
          aria-label={`Add ARCHITRAVE ${edition.label} to cart`}
          style={{ maxWidth: 420 }}
        >
          {isAdding ? "✓ Added" : "Add to Cart"}
        </button>
        <p className="ar-closing-footer">
          <span className="ar-beam-inline" aria-hidden="true" />
          PHILEON Fine Jewelry — Built, Not Made
          <span className="ar-beam-inline" aria-hidden="true" />
        </p>
      </section>
    </div>
  );
}
