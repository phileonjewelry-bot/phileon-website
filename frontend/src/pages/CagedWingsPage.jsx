import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * CAGED WINGS — Inspiration Vault · Earrings · $70 USD
 *
 * A pair of caged wing statement earrings preserved within the PHILEON
 * Inspiration Vault. Sold as one pair.
 *
 * Materials: Bright white plated base metal with clear AAA cubic zirconia.
 * NO precious-metal, sterling, white-gold, platinum, or diamond claims.
 *
 * Hero: TEMPORARY STATIC IMAGE (hero-poster.jpg). A final hero video will
 * be swapped in later — do NOT wire hero-film.mp4 yet.
 *
 * Gallery: 5 items · 2 photographs + 3 silent autoplay films.
 * No captions or overlays. Natural aspect ratios. object-fit: contain.
 */

const HERO_POSTER = "/inspiration-vault/caged-wings/hero-poster.jpg";
const STILL_01    = "/inspiration-vault/caged-wings/still-01.jpg";
const STILL_02    = "/inspiration-vault/caged-wings/still-02.jpg";
const FILM_01     = "/inspiration-vault/caged-wings/film-01.mp4";
const FILM_02     = "/inspiration-vault/caged-wings/film-02.mp4";
const FILM_03     = "/inspiration-vault/caged-wings/film-03.mp4";
const PRICE = 70;

// Order: still · film · still · film · film
const GALLERY = [
  { type: "image", src: STILL_01, alt: "CAGED WINGS — editorial still one, showcasing the pair of caged wing statement earrings in full profile." },
  { type: "video", src: FILM_01,  alt: "CAGED WINGS — silent editorial film one, rotating the pair to reveal the caged wing architecture." },
  { type: "image", src: STILL_02, alt: "CAGED WINGS — editorial still two, close view of the caged wing structure and pavé detail." },
  { type: "video", src: FILM_02,  alt: "CAGED WINGS — silent editorial film two, natural light study of the caged wing pair." },
  { type: "video", src: FILM_03,  alt: "CAGED WINGS — silent editorial film three, an on-the-ear study of scale and movement." },
];

export default function CagedWingsPage() {
  const { isAdding, handleAddToCart } = useAddToCart();
  const videoRefs = useRef([]);
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "CAGED WINGS | Statement Earrings | PHILEON Inspiration Vault";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      'content',
      'CAGED WINGS is a pair of statement caged-wing earrings in bright white plated base metal with clear AAA cubic zirconia, preserved within the PHILEON Inspiration Vault.'
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
    upsertMeta('property', 'og:title', 'CAGED WINGS | Statement Earrings | PHILEON Inspiration Vault');
    upsertMeta('property', 'og:image', ogImageUrl);
    upsertMeta('property', 'og:type', 'product');
    upsertMeta('name',     'twitter:card', 'summary_large_image');
    upsertMeta('name',     'twitter:image', ogImageUrl);
  }, []);

  // Autoplay reliability for the gallery films — force muted + attempt play on every ref
  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (!v) return;
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      const p = v.play();
      if (p !== undefined) p.catch(() => { /* poster stays if blocked */ });
    });
  }, []);

  const onAddToCart = () => {
    handleAddToCart(
      {
        id: "inspiration-vault-caged-wings",
        name: "CAGED WINGS — Statement Earrings",
        price: PRICE,
        productKey: "inspirationVaultCagedWings",
        tierKey: "default",
        sku: "IV-CW-PR",
        slug: "caged-wings",
        image: HERO_POSTER,
        materials: ["Bright White Plated Base Metal · Clear AAA Cubic Zirconia"],
        quantity: 1,
      },
      1,
      "Bright White Plated Base Metal · Clear AAA Cubic Zirconia"
    );
  };

  return (
    <div className="cw-page" data-testid="caged-wings-page">
      <LuxuryMotionStyles />
      <style>{`
        .cw-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .cw-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .cw-return:hover { color:var(--gold); gap:16px; }
        .cw-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .cw-section { max-width:1180px; margin:0 auto; padding:clamp(64px,7vw,120px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:cwFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes cwFade { to { opacity:1; transform:translateY(0); } }
        .cw-section.d1 { animation-delay:.12s; } .cw-section.d2 { animation-delay:.24s; }
        .cw-section.d3 { animation-delay:.36s; } .cw-section.d4 { animation-delay:.48s; }
        .cw-section.d5 { animation-delay:.60s; }
        .cw-desc { text-align:center; }
        .cw-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .cw-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .cw-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(32px,4vw,50px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 28px; text-transform:uppercase; letter-spacing:.018em; }
        .cw-list { list-style:none; padding:0; margin:0 auto; max-width:720px; text-align:left; }
        .cw-list li { position:relative; padding:9px 0 9px 24px; font-family:'Cormorant Garamond',serif;
          font-size:18px; line-height:1.6; color:var(--ink); }
        .cw-list li::before { content:''; position:absolute; left:0; top:18px; width:8px; height:1px; background:var(--gold); }

        /* GALLERY — 5 items · 2 cols desktop · 1 col mobile · natural aspect · no crop · no captions */
        .cw-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .cw-gallery-cell {
          position:relative;
          overflow:hidden;
          background:#000;
          border:1px solid var(--rule-soft);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        /* Fifth cell (odd-count final on 2-col grid) spans full width so it doesn't sit orphaned. */
        .cw-gallery-cell.cw-gallery-cell--span2 { grid-column:1 / -1; }
        .cw-gallery-cell img,
        .cw-gallery-cell video {
          display:block;
          width:100%;
          height:auto;
          max-height:80vh;
          object-fit:contain;
          object-position:center;
          background:#000;
        }
        .cw-gallery-cell img { transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .cw-gallery-cell:hover img { transform:scale(1.02); }
        @media (max-width:640px){
          .cw-gallery-grid { grid-template-columns:1fr; }
          .cw-gallery-cell.cw-gallery-cell--span2 { grid-column:1 / -1; }
          .cw-gallery-cell img,
          .cw-gallery-cell video { max-height:none; }
        }

        .cw-cta { text-align:center; }
        .cw-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .cw-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 30px; }
        .cw-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .cw-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .cw-add-btn:disabled { opacity:.6; cursor:wait; }

        .cw-philosophy { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); text-align:center; }
        .cw-question { font-family:'Playfair Display',serif; font-weight:400;
          font-size:clamp(26px,2.6vw,38px); color:var(--ink-strong); margin:32px auto 20px; letter-spacing:.01em; }
        .cw-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .cw-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .cw-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }

        @media (prefers-reduced-motion: reduce){
          .cw-section { animation:none; opacity:1; transform:none; }
          .cw-gallery-cell img { transition:none; }
          .cw-gallery-cell:hover img { transform:none; }
        }
      `}</style>

      <Link to="/inspiration-vault" className="cw-return" data-testid="cw-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      {/* HERO — TEMPORARY STATIC IMAGE. Final hero video will be swapped in later. */}
      <VaultHero
        image={HERO_POSTER}
        prominent
        altText="CAGED WINGS pair of statement earrings — bright white plated base metal with clear AAA cubic zirconia, presented as an editorial still."
        eyebrow="Inspiration Vault"
        title="CAGED WINGS"
        subhead="Structure, suspended. Light, contained."
      />

      {/* EDITORIAL DESCRIPTION */}
      <section className="cw-section cw-desc d1" data-testid="cw-desc">
        <p className="cw-eyebrow">Editorial</p>
        <div className="cw-desc-body">
          <p className="lead">Wings, held inside a cage of light.</p>
          <p>CAGED WINGS is a study in tension &mdash; structure that lifts, and pavé that catches every angle of light passing through it.</p>
          <p>Each earring hangs as an openwork wing, hand-set with clear AAA cubic zirconia across a bright white plated base metal frame. The silhouette moves with the wearer without ever losing its architecture.</p>
          <p>Sold as one pair. Preserved exactly as discovered within the PHILEON Inspiration Vault.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cw-section cw-cta d2" data-testid="cw-cta">
        <p className="cw-eyebrow">Vault Access</p>
        <p className="cw-price-display" data-testid="cw-price">${PRICE} USD</p>
        <p className="cw-price-note">Sold as one pair. Archive piece.</p>
        <ul className="cw-list" style={{ margin: "0 auto 40px" }}>
          <li>Bright White Plated Base Metal</li>
          <li>Clear AAA Cubic Zirconia</li>
          <li>Openwork Caged-Wing Silhouette</li>
          <li>Hand-Set Pavé Across Every Line</li>
          <li>Statement Scale · Editorial Movement</li>
          <li>Sold as One Pair</li>
        </ul>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="cw-add-btn"
          data-testid="cw-add-to-cart"
          aria-label="Add CAGED WINGS earrings to cart"
        >
          {isAdding ? "✓ ADDED" : "ADD TO CART"}
        </button>
      </section>

      {/* MATERIAL */}
      <section className="cw-section d3" data-testid="cw-materials">
        <p className="cw-eyebrow" style={{ textAlign: "center" }}>Material</p>
        <h2 className="cw-h2" style={{ textAlign: "center" }}>Bright white plating. Clear pavé.</h2>
        <div className="cw-desc-body" style={{ textAlign: "center" }}>
          <p>CAGED WINGS is finished in a bright white plated base metal and hand-set with clear AAA cubic zirconia. The plating carries a mirror-clean luminosity so every pavé line traces the wing&rsquo;s cage without visual interruption.</p>
        </div>
      </section>

      {/* GALLERY — 5 items · no captions · natural aspect · silent autoplay films */}
      <section className="cw-section d4" data-testid="cw-study">
        <p className="cw-eyebrow" style={{ textAlign: "center" }}>Design Study</p>
        <h2 className="cw-h2" style={{ textAlign: "center" }}>The wing, uncaged in light.</h2>
        <div className="cw-gallery-grid">
          {GALLERY.map((g, i) => {
            const isLastOddCell = (i === GALLERY.length - 1) && (GALLERY.length % 2 === 1);
            const cellClass = `cw-gallery-cell ${isLastOddCell ? 'cw-gallery-cell--span2' : ''} lm-cell-reveal lm-stagger-${(i % 9) + 1}`;
            if (g.type === "video") {
              return (
                <div key={i} className={cellClass} data-testid={`cw-gallery-cell-${i + 1}`}>
                  <video
                    ref={(el) => { videoRefs.current[i] = el; }}
                    src={g.src}
                    poster={HERO_POSTER}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    controls={false}
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    aria-label={g.alt}
                    data-testid={`cw-gallery-video-${i + 1}`}
                  >
                    Your browser does not support embedded video.
                  </video>
                </div>
              );
            }
            return (
              <div key={i} className={cellClass} data-testid={`cw-gallery-cell-${i + 1}`}>
                <img src={g.src} alt={g.alt} loading="lazy" data-testid={`cw-gallery-image-${i + 1}`} />
              </div>
            );
          })}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="cw-section cw-philosophy d5" data-testid="cw-philosophy">
        <p className="cw-eyebrow">Design Philosophy</p>
        <div className="cw-desc-body">
          <p>For CAGED WINGS, the study began with a single question:</p>
        </div>
        <p className="cw-question">Can weight be worn as light?</p>
        <div className="cw-desc-body">
          <p>The cage gives the wing its shape. The pavé gives the cage its life. What remains is a pair built on contrast &mdash; architecture and air, geometry and reflection, stillness and motion.</p>
        </div>
      </section>

      <VaultArchiveNotice />

      <section className="cw-final" data-testid="cw-final-quote">
        <p className="cw-final-line">
          &ldquo;Structure, suspended.<br />
          Light, contained.<br />
          One pair.&rdquo;
        </p>
        <p className="cw-final-attr">— PHILEON Inspiration Vault</p>
      </section>
    </div>
  );
}
