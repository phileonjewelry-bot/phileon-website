import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * MONACO — Inspiration Vault · $60 USD
 *
 * Pavé two-finger statement ring · bright white plated base metal · AAA CZ.
 * MONACO is a Vault-only archive edition. It must NEVER inherit copy from
 * ARCHITRAVE, be merged with any Fine Jewelry ring, or be listed in
 * Ladies First. No precious-metal or diamond claims.
 */

const HERO_VIDEO   = "/inspiration-vault/monaco/hero-film.mp4";
const HERO_POSTER  = "/inspiration-vault/monaco/hero-poster.jpg"; // NEW official on-hand hero (also cart thumb + og:image)
const STILL_GRANITE = "/inspiration-vault/monaco/still-01.jpg";   // moved to gallery only
const STILL_FLASH   = "/inspiration-vault/monaco/still-02.jpg";
const HAND_COOL     = "/inspiration-vault/monaco/hand-cool.jpg";
const HAND_WARM     = "/inspiration-vault/monaco/hand-warm.jpg";
const PRICE = 60;

const GALLERY = [
  { src: STILL_GRANITE, span: "half-portrait", alt: "MONACO — polished black granite editorial view showing the pavé octagonal frame, open centre, and three vertically stacked baguette-style cubic zirconia clusters." },
  { src: STILL_FLASH,   span: "half-portrait", alt: "MONACO — front-facing flash study revealing pavé brilliance and the extended two-finger band construction." },
  { src: HAND_COOL,     span: "half",          alt: "MONACO — the ring displayed on a white hand under cool light, showing true two-finger placement and scale." },
  { src: HAND_WARM,     span: "half",          alt: "MONACO — warm-lit hand study showing the ring under softer ambient light." },
];

export default function MonacoPage() {
  const { isAdding, handleAddToCart } = useAddToCart();
  const heroVideoRef = useRef(null);
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "MONACO | Pavé Two-Finger Statement Ring | PHILEON Inspiration Vault";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      'content',
      'MONACO is a pavé two-finger statement ring featuring an open octagonal frame and three vertically stacked baguette-style cubic zirconia clusters, preserved within the PHILEON Inspiration Vault.'
    );

    // Social / Open Graph — canonical hero image
    const ogImageUrl = `${window.location.origin}${HERO_POSTER}`;
    const upsertMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    upsertMeta('property', 'og:title', 'MONACO | Pavé Two-Finger Statement Ring | PHILEON Inspiration Vault');
    upsertMeta('property', 'og:image', ogImageUrl);
    upsertMeta('property', 'og:type', 'product');
    upsertMeta('name',     'twitter:card', 'summary_large_image');
    upsertMeta('name',     'twitter:image', ogImageUrl);
  }, []);

  // Autoplay reliability — force muted + attempt play
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    const p = v.play();
    if (p !== undefined) p.catch(() => { /* poster stays if blocked */ });
  }, []);

  const onAddToCart = () => {
    handleAddToCart(
      {
        id: "inspiration-vault-monaco",
        name: "MONACO — Pavé Two-Finger Statement Ring",
        price: PRICE,
        productKey: "inspirationVaultMonaco",
        tierKey: "default",
        sku: "IV-MC-2F",
        slug: "monaco",
        image: HERO_POSTER,
        materials: ["Bright White Plated Base Metal · Clear AAA Cubic Zirconia"],
        quantity: 1,
      },
      1,
      "Bright White Plated Base Metal · Clear AAA Cubic Zirconia"
    );
  };

  return (
    <div className="mc-page" data-testid="monaco-page">
      <LuxuryMotionStyles />
      <style>{`
        .mc-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .mc-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .mc-return:hover { color:var(--gold); gap:16px; }
        .mc-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .mc-section { max-width:1180px; margin:0 auto; padding:clamp(64px,7vw,120px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:mcFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes mcFade { to { opacity:1; transform:translateY(0); } }
        .mc-section.d1 { animation-delay:.12s; } .mc-section.d2 { animation-delay:.24s; }
        .mc-section.d3 { animation-delay:.36s; } .mc-section.d4 { animation-delay:.48s; }
        .mc-section.d5 { animation-delay:.60s; }
        .mc-desc { text-align:center; }
        .mc-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .mc-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .mc-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(32px,4vw,50px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 28px; text-transform:uppercase; letter-spacing:.018em; }
        .mc-list { list-style:none; padding:0; margin:0 auto; max-width:720px; text-align:left; }
        .mc-list li { position:relative; padding:9px 0 9px 24px; font-family:'Cormorant Garamond',serif;
          font-size:18px; line-height:1.6; color:var(--ink); }
        .mc-list li::before { content:''; position:absolute; left:0; top:18px; width:8px; height:1px; background:var(--gold); }

        /* HERO VIDEO — full frame, silent autoloop */
        .mc-hero-video-wrap {
          max-width:1180px; margin:0 auto; padding:clamp(20px,3vw,40px) clamp(20px,4vw,60px) 0;
        }
        .monaco-hero-video {
          display:block; width:100%; height:auto; max-width:100%;
          object-fit:contain; object-position:center; background:#000;
        }
        @media (max-width:768px) {
          .mc-hero-video-wrap {
            padding:0; width:calc(100vw - 24px);
            margin-left:calc(50% - 50vw + 12px); margin-right:calc(50% - 50vw + 12px);
          }
          .monaco-hero-video {
            width:100%; height:auto; max-height:none;
            object-fit:contain; object-position:center top;
          }
        }

        .mc-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .mc-gallery-cell { position:relative; aspect-ratio:1/1; overflow:hidden;
          background:var(--bg-deep); border:1px solid var(--rule-soft); }
        .mc-gallery-cell.half { aspect-ratio: 1 / 1; }
        .mc-gallery-cell.half-portrait { aspect-ratio: 3 / 4; }
        .mc-gallery-cell img { width:100%; height:100%; object-fit:contain; display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); background:#000; }
        .mc-gallery-cell:hover img { transform:scale(1.03); }
        @media (max-width:640px){
          .mc-gallery-grid { grid-template-columns:1fr; }
          .mc-gallery-cell.half, .mc-gallery-cell.half-portrait { grid-column:1 / -1; }
          .mc-gallery-cell.half { aspect-ratio: 1 / 1; }
          .mc-gallery-cell.half-portrait { aspect-ratio: 3 / 4; }
        }

        .mc-cta { text-align:center; }
        .mc-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .mc-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 30px; }
        .mc-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .mc-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .mc-add-btn:disabled { opacity:.6; cursor:wait; }

        .mc-philosophy { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); text-align:center; }
        .mc-question { font-family:'Playfair Display',serif; font-weight:400;
          font-size:clamp(26px,2.6vw,38px); color:var(--ink-strong); margin:32px auto 20px; letter-spacing:.01em; }
        .mc-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .mc-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .mc-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }

        @media (prefers-reduced-motion: reduce){
          .mc-section { animation:none; opacity:1; transform:none; }
          .mc-gallery-cell img { transition:none; }
          .mc-gallery-cell:hover img { transform:none; }
        }
      `}</style>

      <Link to="/inspiration-vault" className="mc-return" data-testid="mc-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_POSTER}
        prominent
        altText="MONACO bright white plated two-finger ring with a pavé octagonal frame and three vertically stacked baguette-style cubic zirconia clusters."
        eyebrow="Inspiration Vault"
        title="MONACO"
        subhead="Two fingers. Three stones. One statement."
      />

      {/* HERO VIDEO — silent, autoplay, loop, playsInline, no controls */}
      <div className="mc-hero-video-wrap" data-testid="mc-hero-video-wrap">
        <video
          ref={heroVideoRef}
          className="monaco-hero-video"
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
          aria-label="MONACO two-finger statement ring editorial film"
          data-testid="mc-hero-video"
        >
          Your browser does not support embedded video.
        </video>
      </div>

      {/* EDITORIAL DESCRIPTION */}
      <section className="mc-section mc-desc d1" data-testid="mc-desc">
        <p className="mc-eyebrow">Editorial</p>
        <div className="mc-desc-body">
          <p className="lead">A study in balance, proportion, and open space.</p>
          <p>MONACO is a study in balance, proportion, and open space.</p>
          <p>A pavé-set octagonal frame rises across two fingers, surrounding a vertical column of three baguette-style cubic zirconia clusters. The extended two-finger silhouette gives the ring presence without relying on excess weight, while the open centre keeps the composition light and architectural.</p>
          <p>The result is a statement ring built around contrast&mdash;structure and suspension, scale and transparency, geometry and light.</p>
          <p>Preserved exactly as discovered within the PHILEON Inspiration Vault.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="mc-section mc-cta d2" data-testid="mc-cta">
        <p className="mc-eyebrow">Vault Access</p>
        <p className="mc-price-display" data-testid="mc-price">${PRICE} USD</p>
        <p className="mc-price-note">Sold as one ring. Archive piece.</p>
        <ul className="mc-list" style={{ margin: "0 auto 40px" }}>
          <li>Bright White Plated Base Metal</li>
          <li>Clear AAA Cubic Zirconia</li>
          <li>Pavé Octagonal Frame</li>
          <li>Three Vertically Stacked Baguette-Style Clusters</li>
          <li>Two-Finger Band</li>
          <li>Openwork Statement Silhouette</li>
          <li>Sold Individually</li>
        </ul>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="mc-add-btn"
          data-testid="mc-add-to-cart"
          aria-label="Add MONACO to cart"
        >
          {isAdding ? "✓ ADDED" : "ADD TO CART"}
        </button>
      </section>

      {/* MATERIAL */}
      <section className="mc-section d3" data-testid="mc-materials">
        <p className="mc-eyebrow" style={{ textAlign: "center" }}>Material</p>
        <h2 className="mc-h2" style={{ textAlign: "center" }}>Bright white plating. Clear pavé.</h2>
        <div className="mc-desc-body" style={{ textAlign: "center" }}>
          <p>MONACO is finished in a bright white plated base metal and hand-set with clear AAA cubic zirconia. The result is a luminous, mirror-clean surface that lets every pavé line trace the octagonal frame and every baguette-style cluster hold its own light.</p>
        </div>
      </section>

      {/* GALLERY */}
      <section className="mc-section d4" data-testid="mc-study">
        <p className="mc-eyebrow" style={{ textAlign: "center" }}>Design Study</p>
        <h2 className="mc-h2" style={{ textAlign: "center" }}>Two fingers, held in geometry.</h2>
        <div className="mc-gallery-grid">
          {GALLERY.map((g, i) => (
            <div
              key={i}
              className={`mc-gallery-cell ${g.span} lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
              data-testid={`mc-gallery-cell-${i + 1}`}
            >
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="mc-section mc-philosophy d5" data-testid="mc-philosophy">
        <p className="mc-eyebrow">Design Philosophy</p>
        <div className="mc-desc-body">
          <p>For MONACO, the study began with a single question:</p>
        </div>
        <p className="mc-question">Can scale be worn without weight?</p>
        <div className="mc-desc-body">
          <p>By spanning two fingers and holding an openwork centre, MONACO trades mass for architecture. What remains is a statement built on contrast&mdash;structure and suspension, scale and transparency, geometry and light.</p>
        </div>
      </section>

      <VaultArchiveNotice />

      <section className="mc-final" data-testid="mc-final-quote">
        <p className="mc-final-line">
          &ldquo;Two fingers.<br />
          Three stones.<br />
          One statement.&rdquo;
        </p>
        <p className="mc-final-attr">— PHILEON Inspiration Vault</p>
      </section>
    </div>
  );
}
