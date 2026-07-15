import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * NOVA — Inspiration Vault · Earrings · $80 USD
 *
 * Pavé Starburst Link Earrings — one pair.
 *
 * Materials (STRICT — no unsupported claims):
 *   Bright white plated base metal with clear AAA cubic zirconia.
 *   NO sterling, white-gold, platinum, solid-gold, or diamond claims.
 *
 * Hero: silent autoplay video (`hero-film.mp4`) with `hero-poster.jpg`
 *       as the poster + editorial VaultHero image. Vault index card
 *       remains STATIC IMAGE ONLY (per spec).
 *
 * Gallery: 5 items · 3 photographs + 2 silent films · no captions ·
 *          natural aspect ratios · object-fit: contain.
 */

const HERO_POSTER   = "/inspiration-vault/nova/hero-poster.jpg";
const HERO_VIDEO    = "/inspiration-vault/nova/hero-film.mp4";
const STILL_WARM    = "/inspiration-vault/nova/still-warm.jpg";
const STILL_SPARKLE = "/inspiration-vault/nova/still-sparkle.jpg";
const STILL_DETAIL  = "/inspiration-vault/nova/still-detail.jpg";
const FILM_01       = "/inspiration-vault/nova/film-01.mp4";
const FILM_02       = "/inspiration-vault/nova/film-02.mp4";
const PRICE = 80;

// Gallery order: warm boutique · film-01 · black sparkle · film-02 · physical detail
const GALLERY = [
  { type: "image", src: STILL_WARM,    alt: "NOVA pair on a white presentation stand against a warm boutique interior — bright white plated pavé starburst earrings with articulated circular link drops." },
  { type: "video", src: FILM_01,       alt: "NOVA — silent editorial film one, natural-light rotation of the pair." },
  { type: "image", src: STILL_SPARKLE, alt: "NOVA on black satin — sparkle portrait of a single earring showing the elongated pavé bar, radiating starburst centre and two articulated circular link drops." },
  { type: "video", src: FILM_02,       alt: "NOVA — silent editorial film two, close motion study of the articulated link drops." },
  { type: "image", src: STILL_DETAIL,  alt: "NOVA — physical detail of the pair on a reflective surface, revealing the full pavé coverage across the bar, starburst and links." },
];

export default function NovaPage() {
  const { isAdding, handleAddToCart } = useAddToCart();
  const heroVideoRef = useRef(null);
  const videoRefs = useRef([]);
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "NOVA | Pavé Starburst Link Earrings | PHILEON Inspiration Vault";
    const upsertMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    upsertMeta('name',     'description',
      'NOVA is a pavé statement drop earring featuring a radiating starburst centre and two articulated links, preserved within the PHILEON Inspiration Vault.');
    const ogImageUrl = `${window.location.origin}${HERO_POSTER}`;
    upsertMeta('property', 'og:title',      'NOVA | Pavé Starburst Link Earrings | PHILEON Inspiration Vault');
    upsertMeta('property', 'og:image',      ogImageUrl);
    upsertMeta('property', 'og:type',       'product');
    upsertMeta('name',     'twitter:card',  'summary_large_image');
    upsertMeta('name',     'twitter:image', ogImageUrl);
  }, []);

  // Hero video autoplay reliability
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    const p = v.play();
    if (p !== undefined) p.catch(() => { /* poster stays if blocked */ });
  }, []);

  // Gallery videos autoplay reliability
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
        id: "inspiration-vault-nova",
        name: "NOVA — Pavé Starburst Link Earrings",
        price: PRICE,
        productKey: "inspirationVaultNova",
        tierKey: "default",
        sku: "IV-NV-PR",
        slug: "nova",
        image: HERO_POSTER,
        materials: ["Bright White Plated Base Metal · Clear AAA Cubic Zirconia"],
        quantity: 1,
      },
      1,
      "Bright White Plated Base Metal · Clear AAA Cubic Zirconia"
    );
  };

  return (
    <div className="nova-page" data-testid="nova-page">
      <LuxuryMotionStyles />
      <style>{`
        .nova-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .nv-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .nv-return:hover { color:var(--gold); gap:16px; }
        .nv-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .nv-section { max-width:1180px; margin:0 auto; padding:clamp(64px,7vw,120px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:nvFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes nvFade { to { opacity:1; transform:translateY(0); } }
        .nv-section.d1 { animation-delay:.12s; } .nv-section.d2 { animation-delay:.24s; }
        .nv-section.d3 { animation-delay:.36s; } .nv-section.d4 { animation-delay:.48s; }
        .nv-section.d5 { animation-delay:.60s; }
        .nv-desc { text-align:center; }
        .nv-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .nv-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .nv-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(32px,4vw,50px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 28px; text-transform:uppercase; letter-spacing:.018em; }
        .nv-list { list-style:none; padding:0; margin:0 auto; max-width:720px; text-align:left; }
        .nv-list li { position:relative; padding:9px 0 9px 24px; font-family:'Cormorant Garamond',serif;
          font-size:18px; line-height:1.6; color:var(--ink); }
        .nv-list li::before { content:''; position:absolute; left:0; top:18px; width:8px; height:1px; background:var(--gold); }

        /* HERO VIDEO — silent autoplay, portrait-friendly */
        .nv-hero-video-wrap {
          max-width:1180px; margin:clamp(24px,3vw,44px) auto 0;
          padding:0 clamp(20px,4vw,60px);
        }
        .nova-hero-video {
          display:block; width:100%; height:auto; max-height:78vh;
          object-fit:contain; object-position:center; background:#000;
          border:1px solid var(--rule-soft);
        }

        /* GALLERY — 5 items · 2 col desktop · 1 col mobile · natural aspect · no crop · no captions */
        .nova-gallery {
          display:grid; grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:clamp(16px,1.8vw,24px); margin-top:36px;
        }
        .nova-gallery-cell {
          position:relative;
          width:100%; height:auto; min-height:0;
          overflow:hidden;
          background:#080808;
          border:1px solid var(--rule-soft);
          display:flex; align-items:center; justify-content:center;
        }
        .nova-gallery-cell.nova-gallery-cell--span2 { grid-column:1 / -1; }
        .nova-gallery-cell img,
        .nova-gallery-cell video {
          display:block;
          width:100%; height:auto; max-height:80vh;
          object-fit:contain; object-position:center;
          background:#000;
        }
        .nova-gallery-cell img { transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .nova-gallery-cell:hover img { transform:scale(1.02); }
        @media (max-width:768px){
          .nova-gallery { grid-template-columns:1fr; gap:20px; }
          .nova-gallery-cell.nova-gallery-cell--span2 { grid-column:1 / -1; }
          .nova-gallery-cell img,
          .nova-gallery-cell video { max-height:none; }
        }

        .nv-cta { text-align:center; }
        .nv-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .nv-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 30px; }
        .nv-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .nv-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .nv-add-btn:disabled { opacity:.6; cursor:wait; }

        .nv-philosophy { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); text-align:center; }
        .nv-question { font-family:'Playfair Display',serif; font-weight:400;
          font-size:clamp(26px,2.6vw,38px); color:var(--ink-strong); margin:32px auto 20px; letter-spacing:.01em; }
        .nv-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .nv-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .nv-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }

        @media (prefers-reduced-motion: reduce){
          .nv-section { animation:none; opacity:1; transform:none; }
          .nova-gallery-cell img { transition:none; }
          .nova-gallery-cell:hover img { transform:none; }
        }
      `}</style>

      <Link to="/inspiration-vault" className="nv-return" data-testid="nv-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_POSTER}
        prominent
        altText="NOVA bright white plated earrings with pavé starburst centres and two articulated circular drop links."
        eyebrow="Inspiration Vault"
        title="NOVA"
        subhead="One spark. Everything follows."
      />

      {/* HERO VIDEO — silent, autoplay, loop, playsInline, no controls */}
      <div className="nv-hero-video-wrap" data-testid="nv-hero-video-wrap">
        <video
          ref={heroVideoRef}
          className="nova-hero-video"
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
          aria-label="NOVA editorial hero film"
          data-testid="nv-hero-video"
        >
          Your browser does not support embedded video.
        </video>
      </div>

      {/* EDITORIAL DESCRIPTION */}
      <section className="nv-section nv-desc d1" data-testid="nv-desc">
        <p className="nv-eyebrow">Editorial</p>
        <div className="nv-desc-body">
          <p className="lead">One spark. Everything follows.</p>
          <p>NOVA begins at the point of impact.</p>
          <p>A radiating pavé burst anchors the composition, followed by two oversized articulated links that descend beneath it. Each section is fully stone-set, creating a continuous line of brilliance from the elongated upper bar through the starburst centre and into the suspended circular forms.</p>
          <p>The design balances explosive geometry with controlled articulation. Light spreads outward through the central burst, then travels downward through the interlocking links.</p>
          <p>The result is a statement earring built around energy, scale, and consequence.</p>
          <p>Preserved exactly as discovered within the PHILEON Inspiration Vault.</p>
        </div>
      </section>

      {/* PURCHASE / CTA */}
      <section className="nv-section nv-cta d2" data-testid="nv-cta">
        <p className="nv-eyebrow">Vault Access</p>
        <p className="nv-price-display" data-testid="nv-price">${PRICE} USD</p>
        <p className="nv-price-note">Sold as one pair. Archive piece.</p>
        <ul className="nv-list" style={{ margin: "0 auto 40px" }}>
          <li>Bright White Plated Base Metal</li>
          <li>Clear AAA Cubic Zirconia</li>
          <li>Pavé Starburst Centre</li>
          <li>Two Articulated Pavé Links</li>
          <li>Elongated Upper Bar</li>
          <li>Statement Drop Silhouette</li>
          <li>Secure Post Backs</li>
          <li>Sold as One Pair</li>
          <li>Archive Piece</li>
        </ul>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="nv-add-btn"
          data-testid="nv-add-to-cart"
          aria-label="Add NOVA earrings to cart"
        >
          {isAdding ? "✓ ADDED" : "ADD TO CART"}
        </button>
      </section>

      {/* MATERIAL */}
      <section className="nv-section d3" data-testid="nv-materials">
        <p className="nv-eyebrow" style={{ textAlign: "center" }}>Material</p>
        <h2 className="nv-h2" style={{ textAlign: "center" }}>Bright white plating. Clear pavé.</h2>
        <div className="nv-desc-body" style={{ textAlign: "center" }}>
          <p>NOVA is finished in a bright white plated base metal and hand-set with clear AAA cubic zirconia. The plating carries a mirror-clean luminosity so every pavé line traces the burst and the articulated links without visual interruption.</p>
        </div>
      </section>

      {/* GALLERY — 5 items · 3 photographs + 2 silent films · no captions */}
      <section className="nv-section d4" data-testid="nv-study">
        <p className="nv-eyebrow" style={{ textAlign: "center" }}>Design Study</p>
        <h2 className="nv-h2" style={{ textAlign: "center" }}>Everything descends from a spark.</h2>
        <div className="nova-gallery">
          {GALLERY.map((g, i) => {
            const isLastOddCell = (i === GALLERY.length - 1) && (GALLERY.length % 2 === 1);
            const cellClass = `nova-gallery-cell ${isLastOddCell ? 'nova-gallery-cell--span2' : ''} lm-cell-reveal lm-stagger-${(i % 9) + 1}`;
            if (g.type === "video") {
              return (
                <div key={i} className={cellClass} data-testid={`nv-gallery-cell-${i + 1}`}>
                  <video
                    ref={(el) => { videoRefs.current[i] = el; }}
                    className="nova-gallery-film"
                    src={g.src}
                    poster={HERO_POSTER}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    controls={false}
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    aria-label={g.alt}
                    data-testid={`nv-gallery-video-${i + 1}`}
                  >
                    Your browser does not support embedded video.
                  </video>
                </div>
              );
            }
            return (
              <div key={i} className={cellClass} data-testid={`nv-gallery-cell-${i + 1}`}>
                <img src={g.src} alt={g.alt} loading="lazy" data-testid={`nv-gallery-image-${i + 1}`} />
              </div>
            );
          })}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="nv-section nv-philosophy d5" data-testid="nv-philosophy">
        <p className="nv-eyebrow">Design Philosophy</p>
        <div className="nv-desc-body">
          <p>For NOVA, the study began with a single question:</p>
        </div>
        <p className="nv-question">What happens after the first flash of light?</p>
        <div className="nv-desc-body">
          <p>The bar delivers the spark. The starburst carries it outward. The links carry it down. What remains is a pair built on cause and consequence &mdash; one radiating centre answered by two articulated drops.</p>
        </div>
      </section>

      <VaultArchiveNotice />

      <section className="nv-final" data-testid="nv-final-quote">
        <p className="nv-final-line">
          &ldquo;One spark.<br />
          Everything follows.<br />
          One pair.&rdquo;
        </p>
        <p className="nv-final-attr">— PHILEON Inspiration Vault</p>
      </section>
    </div>
  );
}
