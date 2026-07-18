import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import { cadToUsdLuxury } from "@/lib/livePricing";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * REBELLE — PHILEON Fine Jewelry · Ladies First · Earrings
 *
 * Black Pavé Helix Stiletto Earrings — sold as one pair · Made to Order.
 *
 * Three purchasable editions (all sold as a pair):
 *   1. Sterling Silver · Black Cubic Zirconia (base — $4,950 CAD)
 *   2. 10K White Gold · Lab-Grown Black Diamonds ($11,250 CAD)
 *   3. 14K White Gold · Lab-Grown Black Diamonds ($12,350 CAD) ← DEFAULT
 *
 * Internal costing stays in CAD (`basePriceCAD`). Public prices are
 * computed via the shared `cadToUsdLuxury()` and displayed in USD only.
 * CAD values are never rendered publicly.
 *
 * Confirmed spec — do NOT display anything else:
 *   - 264 stones per pair (only approved stone count)
 *   - Approximately 25 g per pair (only approved weight)
 *   - 65 mm overall drop · 15 mm stud · 18 mm max width
 *   - Secure Posts with Butterfly Backs
 *
 * Hero: silent autoplay **video** (`hero-film.mp4`, h264 640×368, 15.12 s,
 * 0 audio streams — ffprobe verified). `hero-poster.jpg` remains as the
 * video poster fallback and canonical cart / OG / Twitter image.
 */

const HERO_POSTER = "/rebelle/hero-poster.jpg";
const HERO_VIDEO  = "/rebelle/hero-film.mp4";
const SHOP_CARD   = "/rebelle/shop-card.jpg";
const STILL_SIDE  = "/rebelle/still-01-side.jpg";
const STILL_MACRO = "/rebelle/still-02-stiletto-macro.jpg";
const STILL_ALT   = "/rebelle/still-03-side-alt.jpg";

// ── EDITIONS ────────────────────────────────────────────────────────────────
// Internal costing stays in CAD. NEVER expose basePriceCAD publicly;
// only usdPrice is shown & passed to cart.
const EDITIONS_INTERNAL = [
  {
    key: "silver-black-cz",
    sku: "rebelle-silver-black-cz",
    label: "Sterling Silver",
    material: "Sterling Silver · Black Rhodium Finish · AAA Black Cubic Zirconia",
    stones: "264 AAA Black Cubic Zirconia Stones Per Pair",
    basePriceCAD: 4950,
  },
  {
    key: "10k-white-black-lab",
    sku: "rebelle-10k-white-black-lab",
    label: "10K White Gold",
    material: "10K White Gold · Black Rhodium Finish · Lab-Grown Black Diamonds",
    stones: "264 Lab-Grown Black Diamonds Per Pair",
    basePriceCAD: 11250,
  },
  {
    key: "14k-white-black-lab",
    sku: "rebelle-14k-white-black-lab",
    label: "14K White Gold",
    material: "14K White Gold · Black Rhodium Finish · Lab-Grown Black Diamonds",
    stones: "264 Lab-Grown Black Diamonds Per Pair",
    basePriceCAD: 12350,
  },
];
const EDITIONS = EDITIONS_INTERNAL.map((e) => ({
  ...e,
  usdPrice: cadToUsdLuxury(e.basePriceCAD),
  currency: "USD",
}));
const DEFAULT_EDITION_KEY = "14k-white-black-lab";

const fmtUSD = (n) => `$${Number(n).toLocaleString("en-US")} USD`;

// Gallery — 3 approved product stills (no model portraits supplied yet).
// Hero image is NOT duplicated in the gallery. No visible captions.
const GALLERY = [
  { type: "image", src: STILL_SIDE,  alt: "REBELLE black pavé double-helix stiletto earrings — side view on a dark plinth revealing the concentric stud, dimensional double helix, and stiletto silhouette with secure butterfly-back closures." },
  { type: "image", src: STILL_MACRO, alt: "REBELLE — dramatic macro of the pavé stiletto silhouettes on a dark reflective surface, showing the sculptural pointed toe and narrow heel." },
  { type: "image", src: STILL_ALT,   alt: "REBELLE — side profile pair on a soft neutral surface, revealing the open double-helix construction and the pointed pavé stiletto." },
];

export default function RebellePage() {
  useLuxuryMotionObserver();
  const { isAdding, handleAddToCart } = useAddToCart();
  const [editionKey, setEditionKey] = useState(DEFAULT_EDITION_KEY);
  const edition = EDITIONS.find((e) => e.key === editionKey) || EDITIONS[2];
  const heroVideoRef = useRef(null);

  // Hero video autoplay reliability — force-mute + attempt play; keep poster if blocked.
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    const p = v.play();
    if (p !== undefined) p.catch(() => { /* poster stays if blocked */ });
  }, []);

  useEffect(() => {
    document.title = "REBELLE | Black Pavé Helix Stiletto Earrings | PHILEON Fine Jewelry";
    const upsertMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    upsertMeta('name', 'description',
      'REBELLE is a sculptural black pavé earring featuring a concentric stud, dimensional double helix, and stiletto silhouette. Available in sterling silver, 10K white gold, and 14K white gold.');
    const ogImage = `${window.location.origin}${HERO_POSTER}`;
    upsertMeta('property', 'og:title',      'REBELLE | Black Pavé Helix Stiletto Earrings | PHILEON Fine Jewelry');
    upsertMeta('property', 'og:image',      ogImage);
    upsertMeta('property', 'og:type',       'product');
    upsertMeta('name',     'twitter:card',  'summary_large_image');
    upsertMeta('name',     'twitter:image', ogImage);
  }, []);

  const onAddToCart = () => {
    handleAddToCart(
      {
        id: edition.sku,
        name: `REBELLE — ${edition.label}`,
        price: edition.usdPrice,   // Public USD (converted). NEVER CAD.
        currency: "USD",
        sku: edition.sku,
        productKey: "rebelle",
        tierKey: edition.key,
        slug: "rebelle",
        image: HERO_POSTER,
        images: [HERO_POSTER],
        materials: [edition.material],
        soldAs: "pair",
      },
      1,
      edition.material
    );
  };

  return (
    <div className="rb-page" data-testid="rebelle-page">
      <LuxuryMotionStyles />
      <style>{`
        .rb-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .rb-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .rb-return:hover { color:var(--gold); gap:16px; }
        .rb-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }

        /* HERO — static image + purchase block (side-by-side on desktop, stacked on mobile) */
        .rb-hero { max-width:1240px; margin:0 auto; padding:clamp(28px,4vw,56px) clamp(20px,4vw,60px);
          display:grid; grid-template-columns:1fr; gap:clamp(32px,4vw,56px); align-items:start; }
        @media (min-width:1024px){ .rb-hero { grid-template-columns:1.05fr 1fr; align-items:center; } }
        .rb-hero-visual { width:100%; background:#000; border:1px solid var(--rule-soft); }
        .rebelle-hero-image,
        .rebelle-hero-video { display:block; width:100%; height:auto; max-height:82vh;
          object-fit:contain; object-position:center; background:#000; }
        .rb-hero-copy { padding:8px 0; }
        .rb-hero-title { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(38px,5vw,62px);
          line-height:1.02; color:var(--ink-strong); margin:0 0 14px; letter-spacing:.01em; text-transform:uppercase; }
        .rb-hero-sub { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(18px,1.7vw,22px); color:var(--gold); margin:0 0 26px; }
        .rb-hero-body { font-family:'Cormorant Garamond',serif; font-size:clamp(17px,1.35vw,20px);
          line-height:1.7; color:var(--ink); margin:0 0 26px; max-width:560px; }
        .rb-hero-spec-row { display:flex; flex-wrap:wrap; gap:22px 34px; margin:0 0 30px;
          font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.34em; text-transform:uppercase; color:var(--ink-muted); }
        .rb-hero-spec-row strong { display:block; color:var(--ink-strong); font-family:'Playfair Display',serif;
          font-weight:400; font-size:20px; letter-spacing:.02em; margin-top:6px; }

        /* PURCHASE BLOCK — edition selector */
        .rb-buy { border-top:1px solid var(--rule-soft); padding-top:26px; }
        .rb-editions { list-style:none; padding:0; margin:0 0 22px; display:flex; flex-direction:column; gap:12px; }
        .rb-edition { width:100%; display:flex; align-items:center; justify-content:space-between;
          gap:20px; padding:16px 20px; background:transparent; border:1px solid var(--rule-soft);
          font-family:'Cormorant Garamond',serif; font-size:17px; color:var(--ink); text-align:left;
          cursor:pointer; transition:border-color 260ms ease, background 260ms ease; }
        .rb-edition:hover { border-color:var(--gold); }
        .rb-edition[aria-checked="true"] { border-color:var(--gold); background:rgba(200,162,74,.06); }
        .rb-edition-label { display:block; font-family:'Cinzel',serif; font-size:12px; letter-spacing:.32em;
          color:var(--ink-strong); text-transform:uppercase; margin-bottom:4px; }
        .rb-edition-material { display:block; font-family:'Cormorant Garamond',serif; font-size:15px;
          color:var(--ink-muted); font-style:italic; }
        .rb-edition-price { font-family:'Cinzel',serif; font-size:13px; letter-spacing:.28em;
          color:var(--gold); text-transform:uppercase; white-space:nowrap; }
        .rb-availability { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 22px; }
        .rb-add-btn { display:inline-flex; align-items:center; justify-content:center; width:100%;
          padding:18px 40px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .rb-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .rb-add-btn:disabled { opacity:.6; cursor:wait; }

        /* SECTION SCAFFOLD */
        .rb-section { max-width:1180px; margin:0 auto; padding:clamp(64px,7vw,120px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:rbFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes rbFade { to { opacity:1; transform:translateY(0); } }
        .rb-section.d1 { animation-delay:.12s; } .rb-section.d2 { animation-delay:.24s; }
        .rb-section.d3 { animation-delay:.36s; } .rb-section.d4 { animation-delay:.48s; }
        .rb-section.d5 { animation-delay:.60s; }
        .rb-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(32px,4vw,50px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 28px; text-transform:uppercase; letter-spacing:.018em; }
        .rb-body { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; text-align:center; }
        .rb-body.italic { font-style:italic; color:var(--gold); font-family:'Playfair Display',serif; }
        .rb-body-left { text-align:left; }

        /* SPEC TABLE */
        .rb-specs { display:grid; grid-template-columns:1fr; gap:0; max-width:820px; margin:0 auto;
          border-top:1px solid var(--rule-soft); }
        @media (min-width:640px){ .rb-specs { grid-template-columns:1fr 1fr; } }
        .rb-spec-row { display:flex; justify-content:space-between; gap:22px; padding:20px 8px;
          border-bottom:1px solid var(--rule-soft); font-family:'Cormorant Garamond',serif; font-size:17px; }
        .rb-spec-key { font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.34em;
          text-transform:uppercase; color:var(--ink-muted); flex-shrink:0; }
        .rb-spec-val { color:var(--ink-strong); text-align:right; }

        /* GALLERY */
        .rebelle-gallery { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .rebelle-gallery-cell { position:relative; width:100%; height:auto; min-height:0;
          overflow:hidden; background:#080808; border:1px solid var(--rule-soft);
          display:flex; align-items:center; justify-content:center; }
        .rebelle-gallery-cell.rebelle-gallery-cell--span2 { grid-column:1 / -1; }
        .rebelle-gallery-cell img {
          display:block; width:100%; height:auto; max-height:80vh;
          object-fit:contain; object-position:center; background:#000;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .rebelle-gallery-cell:hover img { transform:scale(1.02); }
        @media (max-width:768px){
          .rebelle-gallery { grid-template-columns:1fr; gap:20px; }
          .rebelle-gallery-cell.rebelle-gallery-cell--span2 { grid-column:1 / -1; }
          .rebelle-gallery-cell img { max-height:none; }
        }

        .rb-philosophy { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); text-align:center; }
        .rb-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .rb-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .rb-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }

        @media (prefers-reduced-motion: reduce){
          .rb-section { animation:none; opacity:1; transform:none; }
          .rebelle-gallery-cell img { transition:none; }
          .rebelle-gallery-cell:hover img { transform:none; }
        }
      `}</style>

      <Link to="/collections/ladies-first" className="rb-return" data-testid="rb-return">
        <ArrowLeft size={14} /> BACK TO LADIES FIRST
      </Link>

      {/* HERO — static image + editorial + purchase block */}
      <section className="rb-hero" data-testid="rb-hero">
        <div className="rb-hero-visual" data-testid="rb-hero-visual">
          <video
            ref={heroVideoRef}
            className="rebelle-hero-video"
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
            aria-label="REBELLE cinematic product film — silent autoplay loop."
            data-testid="rb-hero-video"
          >
            Your browser does not support embedded video.
          </video>
        </div>

        <div className="rb-hero-copy">
          <p className="rb-eyebrow">Ladies First · Fine Jewelry</p>
          <h1 className="rb-hero-title">REBELLE</h1>
          <p className="rb-hero-sub">Black Pavé Helix Stiletto Earrings</p>
          <p className="rb-hero-body">
            Elegance was never meant to behave. A concentric black pavé stud anchors two
            dimensional bands that twist through an open double-helix and resolve in a
            sharp stiletto silhouette. Sculptural. Feminine. Unapologetically loud.
          </p>

          <div className="rb-hero-spec-row" aria-label="Key REBELLE specifications">
            <div>Stones<strong>264 Per Pair</strong></div>
            <div>Drop<strong>65 mm</strong></div>
            <div>Stud<strong>15 mm</strong></div>
            <div>Weight<strong>~25 g Per Pair</strong></div>
          </div>

          {/* PURCHASE BLOCK */}
          <div className="rb-buy" data-testid="rb-buy">
            <ul className="rb-editions" role="radiogroup" aria-label="Choose REBELLE edition">
              {EDITIONS.map((ed) => (
                <li key={ed.key}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={editionKey === ed.key}
                    aria-pressed={editionKey === ed.key}
                    className="rb-edition"
                    onClick={() => setEditionKey(ed.key)}
                    data-testid={`rb-edition-${ed.key}`}
                  >
                    <span>
                      <span className="rb-edition-label">{ed.label}</span>
                      <span className="rb-edition-material">{ed.material}</span>
                    </span>
                    <span className="rb-edition-price" data-testid={`rb-edition-${ed.key}-price`}>
                      {fmtUSD(ed.usdPrice)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="rb-availability" data-testid="rb-availability">
              Made to order. &nbsp;·&nbsp; Sold as one pair.
            </p>
            <button
              type="button"
              className="rb-add-btn"
              onClick={onAddToCart}
              disabled={isAdding}
              data-testid="rb-add-to-cart"
              aria-label={`Add REBELLE ${edition.label} to cart`}
            >
              {isAdding ? "✓ ADDED" : "ADD TO CART"}
            </button>
          </div>
        </div>
      </section>

      {/* EDITORIAL — elegance was never meant to behave */}
      <section className="rb-section d1" data-testid="rb-editorial-one">
        <p className="rb-eyebrow" style={{ textAlign: "center" }}>Editorial</p>
        <h2 className="rb-h2" style={{ textAlign: "center" }}>Elegance Was Never Meant To Behave</h2>
        <p className="rb-body italic">REBELLE begins with discipline.</p>
        <p className="rb-body">A concentric circle establishes order before two black pavé lines descend, cross, separate, and return through a dimensional helix.</p>
        <p className="rb-body">Then the structure breaks character.</p>
        <p className="rb-body">The twisting lines resolve in the unmistakable point of a stiletto &mdash; sharp, feminine, and entirely unwilling to disappear politely.</p>
        <p className="rb-body">The circle introduces control. The helix challenges it. The heel refuses it.</p>
        <p className="rb-body italic">This is elegance with its own agenda.</p>
      </section>

      {/* SPECIFICATIONS PANEL */}
      <section className="rb-section d2" data-testid="rb-specs-section">
        <p className="rb-eyebrow" style={{ textAlign: "center" }}>The Build</p>
        <h2 className="rb-h2" style={{ textAlign: "center" }}>Specifications</h2>
        <div className="rb-specs">
          <div className="rb-spec-row"><span className="rb-spec-key">Material</span><span className="rb-spec-val" data-testid="rb-spec-material">{edition.label}</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Finish</span><span className="rb-spec-val">Black Rhodium</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Stone Count</span><span className="rb-spec-val" data-testid="rb-spec-stones">264 Stones Per Pair</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Setting</span><span className="rb-spec-val">Pavé</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Format</span><span className="rb-spec-val">Concentric Stud · Double Helix · Stiletto Drop</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Overall Drop</span><span className="rb-spec-val" data-testid="rb-spec-drop">65 mm</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Stud Diameter</span><span className="rb-spec-val" data-testid="rb-spec-stud">15 mm</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Maximum Width</span><span className="rb-spec-val" data-testid="rb-spec-width">18 mm</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Total Weight</span><span className="rb-spec-val" data-testid="rb-spec-weight">Approximately 25 g Per Pair</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Closure</span><span className="rb-spec-val">Secure Posts with Butterfly Backs</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Production</span><span className="rb-spec-val">Made to Order</span></div>
          <div className="rb-spec-row"><span className="rb-spec-key">Sold As</span><span className="rb-spec-val">One Pair</span></div>
        </div>
      </section>

      {/* GALLERY — 3 approved product stills, no captions */}
      <section className="rb-section d3" data-testid="rb-gallery-section">
        <p className="rb-eyebrow" style={{ textAlign: "center" }}>Design Study</p>
        <h2 className="rb-h2" style={{ textAlign: "center" }}>Structure, Then Refusal.</h2>
        <div className="rebelle-gallery">
          {GALLERY.map((g, i) => {
            const isLastOdd = (i === GALLERY.length - 1) && (GALLERY.length % 2 === 1);
            const cellClass = `rebelle-gallery-cell ${isLastOdd ? 'rebelle-gallery-cell--span2' : ''} lm-cell-reveal lm-stagger-${(i % 9) + 1}`;
            return (
              <div key={i} className={cellClass} data-testid={`rb-gallery-cell-${i + 1}`}>
                <img src={g.src} alt={g.alt} loading="lazy" data-testid={`rb-gallery-image-${i + 1}`} />
              </div>
            );
          })}
        </div>
      </section>

      {/* SECOND EDITORIAL — built to disobey */}
      <section className="rb-section rb-philosophy d4" data-testid="rb-editorial-two">
        <p className="rb-eyebrow">Design Philosophy</p>
        <h2 className="rb-h2">Built To Disobey</h2>
        <p className="rb-body">From a distance, REBELLE reads as a long black line against the body.</p>
        <p className="rb-body">Closer, the line divides into pavé, polished borders, open space, crossings, circles, and the final pointed silhouette.</p>
        <p className="rb-body">The design changes as the viewer approaches.</p>
        <p className="rb-body italic">Its attitude does not.</p>
      </section>

      {/* CLOSING — the final word */}
      <section className="rb-section d5" data-testid="rb-final-section">
        <p className="rb-eyebrow" style={{ textAlign: "center" }}>The Final Word</p>
        <h2 className="rb-h2" style={{ textAlign: "center" }}>The Final Word</h2>
        <p className="rb-body">REBELLE does not ask for permission to occupy the frame.</p>
        <p className="rb-body">It arrives composed, precise, and entirely certain of itself.</p>
      </section>

      <section className="rb-final" data-testid="rb-final-quote">
        <p className="rb-final-line">
          &ldquo;Not jewelry. Identity.&rdquo;
        </p>
        <p className="rb-final-attr">— PHILEON Fine Jewelry · Ladies First</p>
      </section>
    </div>
  );
}
