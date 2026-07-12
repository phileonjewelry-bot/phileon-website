import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * ARCHITRAVE — PHILEON Fine Jewelry
 *
 * 18K White Gold · 536 Diamonds Per Pair · Openwork Rose-Window Medallion
 * Made to Order · No retail price published until final CAD, gold weight,
 * and diamond parcel are confirmed.
 *
 * ARCHITRAVE is the elevated Fine Jewelry interpretation of the rose-window
 * openwork silhouette. It is a distinct product from the Inspiration Vault's
 * ORIEL (rhodium-plated nickel-free white metal · $40 · Archive Piece) and
 * MUST NOT inherit ORIEL's copy, materials, stone-count, pricing, cart data,
 * or Vault routing.
 *
 * Navigation: Ladies First → Earrings
 */

const HERO           = "/architrave/hero.jpg";              // pair on marble — atmospheric
const STILL_MANNEQ   = "/architrave/still-mannequin.jpg";   // Slot 1 — single earring on bust
const LIFESTYLE      = "/architrave/lifestyle-cafe.png";    // Slot 2 — worn at cafe (on-body scale)
const STILL_PAIR     = "/architrave/still-clean-pair.jpg";  // Slot 3 — pair front-and-angle, clean
const STILL_PHILEON  = "/architrave/still-phileon-box.png"; // Slot 4 — pair on PHILEON-branded stand

const INQUIRE_URL = "mailto:atelier@phileon.com?subject=ARCHITRAVE%20—%20Made-to-Order%20Inquiry&body=I%20am%20writing%20regarding%20ARCHITRAVE%20by%20PHILEON%20Fine%20Jewelry.%20Please%20share%20the%20current%20lead%20time%2C%20final%20carat%20weight%2C%20and%20investment%20range%20for%20a%20made-to-order%20commission.%0A%0A—";

const GALLERY = [
  { src: STILL_MANNEQ,  aspect: "portrait", caption: "ARCHITRAVE presented frontally, revealing the concentric pavé medallion and graduated three-station drop." },
  { src: LIFESTYLE,     aspect: "wide",     caption: "ARCHITRAVE worn at full scale, its openwork geometry suspended against the line of the neck." },
  { src: STILL_PAIR,    aspect: "square",   caption: "A front-and-angle study revealing the articulated links, dimensional setting work, and refined white-gold profile." },
  { src: STILL_PHILEON, aspect: "square",   caption: "The pair presented with PHILEON packaging, balancing architectural scale with fine-jewelry precision." },
  { src: STILL_PAIR,    aspect: "wide",     caption: "Two medallions in dialogue—radial geometry, open space, and diamond-set structure held in symmetry." },
];

export default function ArchitravePage() {
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "ARCHITRAVE | 18K White Gold Diamond Drop Earrings | PHILEON";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'ARCHITRAVE is an architectural diamond drop earring by PHILEON Fine Jewelry, featuring 536 diamonds per pair across graduated stations and an openwork radial medallion.');
  }, []);

  return (
    <div className="ar-page" data-testid="architrave-page">
      <LuxuryMotionStyles />
      <style>{`
        .ar-page {
          --ink:#e8e2d4;          /* ivory */
          --ink-strong:#f5efe1;
          --ink-dim:#8a827a;
          --steel:#a9adb4;        /* restrained steel-grey accent */
          --beam:rgba(233,226,212,.18);
          --bg:#050505;
          --bg-deep:#020202;
          --bg-panel:#0a0a0a;
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
          padding:clamp(80px,9vw,160px) clamp(20px,4vw,60px);
          opacity:0;transform:translateY(24px);
          animation:arFade 1.05s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes arFade { to { opacity:1;transform:translateY(0); } }
        .ar-section.d1 { animation-delay:.12s; } .ar-section.d2 { animation-delay:.24s; }
        .ar-section.d3 { animation-delay:.36s; } .ar-section.d4 { animation-delay:.48s; }
        .ar-section.d5 { animation-delay:.60s; } .ar-section.d6 { animation-delay:.72s; }
        .ar-section.d7 { animation-delay:.84s; }

        /* BEAM — the structural signature device */
        .ar-beam {
          display:block;height:1px;background:var(--beam);
          max-width:1280px;margin:0 auto;
        }
        .ar-beam-inline {
          display:inline-block;width:80px;height:1px;background:var(--beam);
          vertical-align:middle;margin:0 22px;
        }

        /* HERO */
        .ar-hero {
          position:relative;
          min-height:min(94vh,880px);
          padding:clamp(60px,7vw,110px) clamp(20px,4vw,60px) clamp(80px,9vw,140px);
          display:grid;grid-template-columns:1.15fr 1fr;gap:clamp(40px,5vw,90px);
          align-items:center;
          border-bottom:1px solid var(--rule);
        }
        .ar-hero-copy { position:relative;z-index:2; }
        .ar-hero-title {
          font-family:'Cinzel',serif;font-weight:400;
          font-size:clamp(56px,8vw,120px);line-height:.96;letter-spacing:.02em;
          color:var(--ink-strong);margin:0 0 26px;text-transform:uppercase;
        }
        .ar-hero-tagline {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(20px,2vw,28px);line-height:1.4;color:var(--ink);
          max-width:520px;margin:0 0 44px;
        }
        .ar-hero-detail {
          display:flex;flex-direction:column;gap:6px;
          padding:20px 0;border-top:1px solid var(--beam);border-bottom:1px solid var(--beam);
          max-width:440px;margin:0 0 42px;
        }
        .ar-hero-stone {
          font-family:'Cinzel',serif;font-size:clamp(18px,1.7vw,22px);letter-spacing:.35em;
          color:var(--ink-strong);text-transform:uppercase;
        }
        .ar-hero-stone-note {
          font-family:'Jost',sans-serif;font-size:12px;letter-spacing:.22em;
          color:var(--ink-dim);text-transform:uppercase;
        }
        .ar-hero-visual {
          position:relative;aspect-ratio:1/1;overflow:hidden;
          background:var(--bg-panel);border:1px solid var(--rule);
        }
        .ar-hero-visual img {
          width:100%;height:100%;object-fit:cover;object-position:center;
          display:block;
        }
        /* Inquire — primary CTA */
        .ar-inquire-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:14px;
          padding:20px 62px;border:1px solid var(--ink-strong);background:transparent;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:.5em;
          color:var(--ink-strong);text-transform:uppercase;cursor:pointer;
          text-decoration:none;
          transition:background 440ms ease,color 440ms ease,letter-spacing 380ms ease;
        }
        .ar-inquire-btn:hover {
          background:var(--ink-strong);color:var(--bg-deep);letter-spacing:.62em;
        }
        @media (max-width:900px){
          .ar-hero { grid-template-columns:1fr;min-height:auto; }
          .ar-hero-visual { aspect-ratio:4/5; order:-1; }
        }

        /* EDITORIAL INTRO */
        .ar-editorial p {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(19px,1.5vw,23px);line-height:1.7;
          color:var(--ink);max-width:720px;margin:0 0 22px;
        }
        .ar-editorial p:last-child { margin-bottom:0; }
        .ar-editorial .em {
          font-family:'Playfair Display',serif;font-style:italic;
          color:var(--ink-strong);
        }

        /* POWER SECTION */
        .ar-power {
          background:var(--bg-deep);
          border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);
        }
        .ar-power-title {
          font-family:'Cinzel',serif;font-weight:400;
          font-size:clamp(28px,3.4vw,44px);line-height:1.1;letter-spacing:.06em;
          color:var(--ink-strong);text-transform:uppercase;margin:0 0 36px;
          text-align:center;
        }
        .ar-power-intro {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(19px,1.5vw,23px);line-height:1.72;
          color:var(--ink);max-width:760px;margin:0 auto;text-align:center;
        }

        /* PRINCIPLES GRID */
        .ar-principles {
          display:grid;grid-template-columns:repeat(4,1fr);
          gap:clamp(40px,4vw,68px);margin-top:clamp(60px,7vw,100px);
        }
        .ar-principle {
          border-top:1px solid var(--beam);padding-top:26px;
        }
        .ar-principle-label {
          font-family:'Jost',sans-serif;font-size:11px;letter-spacing:.32em;
          color:var(--steel);text-transform:uppercase;margin:0 0 16px;
        }
        .ar-principle-title {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(22px,1.9vw,28px);line-height:1.2;
          color:var(--ink-strong);margin:0 0 14px;
        }
        .ar-principle-body {
          font-family:'Cormorant Garamond',serif;
          font-size:16px;line-height:1.65;color:var(--ink);margin:0;
        }
        @media (max-width:900px){
          .ar-principles { grid-template-columns:1fr 1fr; }
        }
        @media (max-width:560px){
          .ar-principles { grid-template-columns:1fr; }
        }

        /* SPECIFICATION BLOCK — engineering register */
        .ar-build {
          background:var(--bg-deep);
          border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);
        }
        .ar-build-inner {
          max-width:1080px;margin:0 auto;
          padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
        }
        .ar-build-title {
          font-family:'Cinzel',serif;font-weight:400;
          font-size:clamp(30px,3.6vw,48px);letter-spacing:.05em;
          color:var(--ink-strong);text-transform:uppercase;margin:0 0 48px;
          text-align:center;
        }
        .spec-row {
          display:grid;grid-template-columns:220px 1fr;gap:32px;
          padding:22px 0;border-bottom:1px solid var(--beam);
          align-items:baseline;
        }
        .spec-row:last-child { border-bottom:none; }
        .spec-label {
          font-family:'Jost',sans-serif;font-size:11.5px;letter-spacing:.36em;
          color:var(--steel);text-transform:uppercase;
        }
        .spec-value {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(18px,1.4vw,21px);line-height:1.5;color:var(--ink-strong);
        }
        .spec-value .accent {
          font-family:'Cinzel',serif;font-size:1.35em;letter-spacing:.06em;
          color:var(--ink-strong);margin-right:6px;
        }
        .spec-value small { font-family:'Jost',sans-serif; }
        @media (max-width:640px){
          .spec-row { grid-template-columns:1fr;gap:8px; }
        }

        /* GALLERY */
        .ar-gallery-grid {
          display:grid;grid-template-columns:repeat(6,1fr);gap:clamp(14px,1.8vw,24px);
        }
        .ar-cell {
          position:relative;overflow:hidden;background:var(--bg-panel);
          border:1px solid var(--rule);
        }
        .ar-cell img {
          width:100%;height:100%;object-fit:cover;object-position:center;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .ar-cell:hover img { transform:scale(1.03); }
        .ar-cell.portrait { grid-column:span 2;aspect-ratio:3/4; }
        .ar-cell.square   { grid-column:span 3;aspect-ratio:1/1; }
        .ar-cell.wide     { grid-column:span 4;aspect-ratio:16/9; }
        .ar-cell-caption {
          position:absolute;left:0;right:0;bottom:0;
          padding:20px 22px 18px;
          background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.82) 100%);
          font-family:'Cormorant Garamond',serif;font-style:italic;
          font-size:14.5px;line-height:1.45;color:var(--ink);
          opacity:0;transform:translateY(8px);
          transition:opacity 480ms ease,transform 480ms ease;
        }
        .ar-cell:hover .ar-cell-caption {
          opacity:1;transform:translateY(0);
        }
        @media (max-width:900px){
          .ar-gallery-grid { grid-template-columns:1fr 1fr; }
          .ar-cell.portrait, .ar-cell.square, .ar-cell.wide { grid-column:span 2;aspect-ratio:1/1; }
          .ar-cell.portrait { aspect-ratio:3/4; }
          .ar-cell.wide { aspect-ratio:16/9; }
          .ar-cell-caption { opacity:1;transform:none;font-size:13px; }
        }

        /* CLOSING */
        .ar-closing {
          text-align:center;
          padding:clamp(120px,14vw,220px) clamp(20px,4vw,60px);
          background:#000;
          border-top:1px solid var(--rule);
        }
        .ar-closing-title {
          font-family:'Cinzel',serif;font-weight:400;
          font-size:clamp(38px,5vw,72px);line-height:1;letter-spacing:.08em;
          color:var(--ink-strong);text-transform:uppercase;margin:0 0 44px;
        }
        .ar-closing-body p {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(19px,1.55vw,24px);line-height:1.72;
          color:var(--ink);max-width:720px;margin:0 auto 22px;
        }
        .ar-closing-body p:last-of-type { margin-bottom:52px; }
        .ar-closing-footer {
          margin-top:80px;padding-top:34px;border-top:1px solid var(--beam);
          font-family:'Jost',sans-serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-dim);text-transform:uppercase;
        }

        @media (prefers-reduced-motion: reduce){
          .ar-section { animation:none;opacity:1;transform:none; }
          .ar-cell img { transition:none; }
          .ar-cell:hover img { transform:none; }
        }
      `}</style>

      <Link to="/shop?category=earrings&audience=ladies" className="ar-return" data-testid="ar-return">
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
          <div className="ar-hero-detail">
            <span className="ar-hero-stone" data-testid="ar-stones">536 Diamonds Per Pair</span>
            <span className="ar-hero-stone-note">268 per earring</span>
          </div>
          <a href={INQUIRE_URL} className="ar-inquire-btn" data-testid="ar-inquire-hero" aria-label="Inquire about ARCHITRAVE">
            Inquire
          </a>
        </div>
        <div className="ar-hero-visual">
          <img
            src={HERO}
            alt="ARCHITRAVE diamond drop earrings in 18K white gold, featuring concentric pavé medallions suspended from graduated three-station drops."
            data-testid="ar-hero-image"
          />
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
          ARCHITRAVE is built on the same principle. A concentric arrangement of diamonds, set stone by stone, ring answering ring. Nothing is arbitrary. Every line contributes to the architecture.
        </p>
      </section>

      <div className="ar-beam" aria-hidden="true" />

      {/* POWER SECTION */}
      <section className="ar-section ar-power d2" data-testid="ar-power">
        <p className="ar-eyebrow" style={{ textAlign:"center" }}>The Principle</p>
        <h2 className="ar-power-title">Power That Doesn&rsquo;t Announce Itself</h2>
        <p className="ar-power-intro">
          In old-world architecture, the beam did not need a signature. The structure spoke instead—strength expressed quietly, without spectacle and without requesting recognition.
        </p>

        {/* PRINCIPLES GRID */}
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
            <h3 className="ar-principle-title">18K white gold, engineered to recede.</h3>
            <p className="ar-principle-body">
              18K white gold, selected for its permanence and its ability to recede beneath the brilliance of the diamonds.
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

      {/* THE BUILD — SPECIFICATION BLOCK */}
      <section className="ar-build d3" data-testid="ar-build">
        <div className="ar-build-inner">
          <p className="ar-eyebrow" style={{ textAlign:"center" }}>The Build</p>
          <h2 className="ar-build-title">Specification</h2>

          <div className="spec-row">
            <span className="spec-label">Material</span>
            <span className="spec-value">18K White Gold</span>
          </div>

          <div className="spec-row">
            <span className="spec-label">Stone Count</span>
            <span className="spec-value">
              <span className="accent">536</span> Diamonds Per Pair
              <br />
              <small style={{ fontSize: 14, color: 'var(--ink-dim)' }}>268 per earring</small>
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

          <div className="spec-row">
            <span className="spec-label">Production</span>
            <span className="spec-value">Made to Order</span>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="ar-section d4" data-testid="ar-gallery">
        <p className="ar-eyebrow" style={{ textAlign:"center" }}>The Study</p>
        <h2 className="ar-power-title" style={{ marginBottom: 60 }}>
          Five Views. One Architecture.
        </h2>
        <div className="ar-gallery-grid">
          {GALLERY.map((g, i) => (
            <figure
              key={i}
              className={`ar-cell ${g.aspect} lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
              data-testid={`ar-gallery-cell-${i + 1}`}
            >
              <img src={g.src} alt={`ARCHITRAVE 18K white-gold diamond drop earrings — ${g.caption}`} loading="lazy" />
              <figcaption className="ar-cell-caption">{g.caption}</figcaption>
            </figure>
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
            Concentric rings, open geometry, articulated links, and hundreds of diamonds combine in a composition engineered for presence, balance, and permanence.
          </p>
          <p>This is jewelry conceived to outlast the temporary.</p>
        </div>
        <a href={INQUIRE_URL} className="ar-inquire-btn" data-testid="ar-inquire-footer" aria-label="Inquire about ARCHITRAVE">
          Inquire
        </a>
        <p className="ar-closing-footer" data-testid="ar-footer-line">
          <span className="ar-beam-inline" aria-hidden="true" />
          PHILEON Fine Jewelry — Built, Not Made
          <span className="ar-beam-inline" aria-hidden="true" />
        </p>
      </section>
    </div>
  );
}
