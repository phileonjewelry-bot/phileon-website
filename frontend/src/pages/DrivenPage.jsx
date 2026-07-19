import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * DRIVEN — Inspiration Vault · Bracelets · $75 USD
 *
 * Black Pavé Nail-Wrap Bracelet — one bracelet.
 *
 * Materials (STRICT — no unsupported claims):
 *   Blackened plated base metal with black cubic zirconia.
 *   NO sterling, black-gold, white-gold, platinum, solid-gold, or diamond claims.
 *
 * Hero: static image only (`hero-poster.jpg` — sculptural hand on black
 *       background). Vault index card also static image only.
 *
 * Gallery: 4 photographs · natural aspect ratios · object-fit: contain ·
 *          no captions or overlays. When the remaining 2 photographs and
 *          2 silent films arrive, they will slot in without any code
 *          restructure (add to GALLERY array with the correct type key).
 */

const HERO_POSTER      = "/inspiration-vault/driven/hero-poster.jpg";
const HERO_VIDEO       = "/inspiration-vault/driven/hero-film.mp4";
const STILL_FRONT      = "/inspiration-vault/driven/still-01-front.jpg";
const STILL_TQ         = "/inspiration-vault/driven/still-02-three-quarter.jpg";
const STILL_NAILHEAD   = "/inspiration-vault/driven/still-03-nailhead-macro.jpg";
const STILL_ARCH       = "/inspiration-vault/driven/still-04-arch-profile.jpg";
const STILL_OPEN_CUFF  = "/inspiration-vault/driven/still-05-open-cuff.jpg";
const FILM_01          = "/inspiration-vault/driven/film-01.mp4";
const PRICE = 75;

// Gallery order — front → film-01 → three-quarter → nail-head macro → arch profile → open-cuff top-down
const GALLERY = [
  { type: "image", src: STILL_FRONT,    alt: "DRIVEN — front view on white showing the triple-wrap open cuff, circular nail-head terminal, and pointed pavé tip in blackened plated base metal with black cubic zirconia." },
  { type: "video", src: FILM_01,        alt: "DRIVEN — silent editorial film, motion study of the triple-wrap open cuff on a sculptural hand." },
  { type: "image", src: STILL_TQ,       alt: "DRIVEN — front three-quarter product view revealing the pointed pavé terminal and the layered pavé construction across all three bands." },
  { type: "image", src: STILL_NAILHEAD, alt: "DRIVEN — macro detail of the circular nail-head terminal and the three parallel black pavé bands." },
  { type: "image", src: STILL_ARCH,     alt: "DRIVEN — side arch profile study showing the open cuff silhouette in blackened plated base metal." },
  { type: "image", src: STILL_OPEN_CUFF, alt: "DRIVEN — open-cuff top-down study on a soft neutral surface, showing both terminals in a single continuous line: the pointed pavé tip meeting the circular nail-head across three parallel black pavé bands." },
];

export default function DrivenPage() {
  const { isAdding, handleAddToCart } = useAddToCart();
  const heroVideoRef = useRef(null);
  const videoRefs = useRef([]);
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "DRIVEN | Black Pavé Nail-Wrap Bracelet | PHILEON Inspiration Vault";
    const upsertMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    upsertMeta('name', 'description',
      'DRIVEN is a black pavé triple-wrap bracelet with a circular nail-head terminal and pointed tip, preserved within the PHILEON Inspiration Vault.');
    const ogImageUrl = `${window.location.origin}${HERO_POSTER}`;
    upsertMeta('property', 'og:title',      'DRIVEN | Black Pavé Nail-Wrap Bracelet | PHILEON Inspiration Vault');
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
        id: "inspiration-vault-driven",
        name: "DRIVEN — Black Pavé Nail-Wrap Bracelet",
        price: PRICE,
        productKey: "inspirationVaultDriven",
        tierKey: "default",
        sku: "IV-DR-01",
        slug: "driven",
        image: HERO_POSTER,
        materials: ["Blackened Plated Base Metal · Black Cubic Zirconia"],
        quantity: 1,
      },
      1,
      "Blackened Plated Base Metal · Black Cubic Zirconia"
    );
  };

  return (
    <div className="dr-page" data-testid="driven-page">
      <LuxuryMotionStyles />
      <style>{`
        .dr-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .dr-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .dr-return:hover { color:var(--gold); gap:16px; }
        .dr-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .dr-section { max-width:1180px; margin:0 auto; padding:clamp(64px,7vw,120px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:drFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes drFade { to { opacity:1; transform:translateY(0); } }
        .dr-section.d1 { animation-delay:.12s; } .dr-section.d2 { animation-delay:.24s; }
        .dr-section.d3 { animation-delay:.36s; } .dr-section.d4 { animation-delay:.48s; }
        .dr-section.d5 { animation-delay:.60s; }
        .dr-desc { text-align:center; }
        .dr-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .dr-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .dr-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(32px,4vw,50px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 28px; text-transform:uppercase; letter-spacing:.018em; }
        .dr-list { list-style:none; padding:0; margin:0 auto; max-width:720px; text-align:left; }
        .dr-list li { position:relative; padding:9px 0 9px 24px; font-family:'Cormorant Garamond',serif;
          font-size:18px; line-height:1.6; color:var(--ink); }
        .dr-list li::before { content:''; position:absolute; left:0; top:18px; width:8px; height:1px; background:var(--gold); }

        /* HERO VIDEO — silent autoplay, portrait-friendly */
        .dr-hero-video-wrap {
          max-width:1180px; margin:clamp(24px,3vw,44px) auto 0;
          padding:0 clamp(20px,4vw,60px);
        }
        .driven-hero-video {
          display:block; width:100%; height:auto; max-height:78vh;
          object-fit:contain; object-position:center; background:#000;
          border:1px solid var(--rule-soft);
        }

        /* GALLERY — natural aspect · 2 col desktop · 1 col mobile · no captions */
        .driven-gallery {
          display:grid; grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:clamp(16px,1.8vw,24px); margin-top:36px;
        }
        .driven-gallery-cell {
          position:relative;
          width:100%; height:auto; min-height:0;
          overflow:hidden;
          background:#080808;
          border:1px solid var(--rule-soft);
          display:flex; align-items:center; justify-content:center;
        }
        .driven-gallery-cell img,
        .driven-gallery-cell video {
          display:block;
          width:100%; height:auto; max-height:80vh;
          object-fit:contain; object-position:center;
          background:#000;
        }
        .driven-gallery-cell img { transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .driven-gallery-cell:hover img { transform:scale(1.02); }
        @media (max-width:768px){
          .driven-gallery { grid-template-columns:1fr; gap:20px; }
          .driven-gallery-cell img,
          .driven-gallery-cell video { max-height:none; }
        }

        .dr-cta { text-align:center; }
        .dr-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .dr-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 30px; }
        .dr-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .dr-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .dr-add-btn:disabled { opacity:.6; cursor:wait; }

        .dr-philosophy { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); text-align:center; }
        .dr-question { font-family:'Playfair Display',serif; font-weight:400;
          font-size:clamp(26px,2.6vw,38px); color:var(--ink-strong); margin:32px auto 20px; letter-spacing:.01em; }
        .dr-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .dr-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .dr-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }

        @media (prefers-reduced-motion: reduce){
          .dr-section { animation:none; opacity:1; transform:none; }
          .driven-gallery-cell img { transition:none; }
          .driven-gallery-cell:hover img { transform:none; }
        }
      `}</style>

      <Link to="/inspiration-vault" className="dr-return" data-testid="dr-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO_POSTER}
        prominent
        altText="DRIVEN blackened plated wrap bracelet with black cubic zirconia, circular nail-head terminal, and pointed pavé tip, wrapped around a sculptural neutral hand against black."
        eyebrow="Inspiration Vault"
        title="DRIVEN"
        subhead="Pressure made visible."
      />

      {/* HERO VIDEO — silent, autoplay, loop, playsInline, no controls */}
      <div className="dr-hero-video-wrap" data-testid="dr-hero-video-wrap">
        <video
          ref={heroVideoRef}
          className="driven-hero-video"
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
          aria-label="DRIVEN editorial hero film"
          data-testid="dr-hero-video"
        >
          Your browser does not support embedded video.
        </video>
      </div>

      {/* EDITORIAL DESCRIPTION */}
      <section className="dr-section dr-desc d1" data-testid="dr-desc">
        <p className="dr-eyebrow">Editorial</p>
        <div className="dr-desc-body">
          <p className="lead">Pressure made visible.</p>
          <p>DRIVEN is built around pressure, repetition, and resolve.</p>
          <p>Three dark pavé bands wrap the wrist in a continuous open composition, meeting at a circular nail-head terminal and a sharply pointed opposing tip. The layered construction creates depth without closing the bracelet into a conventional cuff.</p>
          <p>Its dark finish absorbs light while the black cubic zirconia releases it in controlled flashes across every curve.</p>
          <p>The result is a bracelet that feels deliberate, unyielding, and composed.</p>
          <p>Preserved exactly as discovered within the PHILEON Inspiration Vault.</p>
        </div>
      </section>

      {/* PURCHASE / CTA */}
      <section className="dr-section dr-cta d2" data-testid="dr-cta">
        <p className="dr-eyebrow">Vault Access</p>
        <p className="dr-price-display" data-testid="dr-price">${PRICE} USD</p>
        <p className="dr-price-note">Sold as one bracelet. Archive piece.</p>
        <ul className="dr-list" style={{ margin: "0 auto 40px" }}>
          <li>Blackened Plated Base Metal</li>
          <li>Black Cubic Zirconia</li>
          <li>Triple-Wrap Open Cuff</li>
          <li>Circular Nail-Head Terminal</li>
          <li>Pointed Pavé Tip</li>
          <li>Layered Pavé Construction</li>
          <li>Open Bracelet Silhouette</li>
          <li>Sold Individually</li>
          <li>Archive Piece</li>
        </ul>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="dr-add-btn"
          data-testid="dr-add-to-cart"
          aria-label="Add DRIVEN bracelet to cart"
        >
          {isAdding ? "✓ ADDED" : "ADD TO CART"}
        </button>
      </section>

      {/* MATERIAL */}
      <section className="dr-section d3" data-testid="dr-materials">
        <p className="dr-eyebrow" style={{ textAlign: "center" }}>Material</p>
        <h2 className="dr-h2" style={{ textAlign: "center" }}>Dark plating. Black pavé.</h2>
        <div className="dr-desc-body" style={{ textAlign: "center" }}>
          <p>DRIVEN is finished in a blackened plated base metal and hand-set with black cubic zirconia. The finish absorbs ambient light while the stones release it in controlled flashes across every curve of the triple-wrap silhouette.</p>
        </div>
      </section>

      {/* GALLERY — natural aspect · no captions */}
      <section className="dr-section d4" data-testid="dr-study">
        <p className="dr-eyebrow" style={{ textAlign: "center" }}>Design Study</p>
        <h2 className="dr-h2" style={{ textAlign: "center" }}>Three bands. One resolve.</h2>
        <div className="driven-gallery">
          {GALLERY.map((g, i) => {
            const cellClass = `driven-gallery-cell lm-cell-reveal lm-stagger-${(i % 9) + 1}`;
            if (g.type === "video") {
              return (
                <div key={i} className={cellClass} data-testid={`dr-gallery-cell-${i + 1}`}>
                  <video
                    ref={(el) => { videoRefs.current[i] = el; }}
                    className="driven-gallery-film"
                    src={g.src}
                    poster={HERO_POSTER}
                    autoPlay muted loop playsInline
                    preload="metadata"
                    controls={false}
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    aria-label={g.alt}
                    data-testid={`dr-gallery-video-${i + 1}`}
                  >
                    Your browser does not support embedded video.
                  </video>
                </div>
              );
            }
            return (
              <div key={i} className={cellClass} data-testid={`dr-gallery-cell-${i + 1}`}>
                <img src={g.src} alt={g.alt} loading="lazy" data-testid={`dr-gallery-image-${i + 1}`} />
              </div>
            );
          })}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="dr-section dr-philosophy d5" data-testid="dr-philosophy">
        <p className="dr-eyebrow">Design Philosophy</p>
        <div className="dr-desc-body">
          <p>For DRIVEN, the study began with a single question:</p>
        </div>
        <p className="dr-question">What if pressure could be worn?</p>
        <div className="dr-desc-body">
          <p>The bracelet answers by wrapping three parallel pavé lines around the wrist. Not one, not two &mdash; three. Repetition becomes weight. Weight becomes resolve. Resolve becomes silhouette.</p>
        </div>
      </section>

      <VaultArchiveNotice />

      <section className="dr-final" data-testid="dr-final-quote">
        <p className="dr-final-line">
          &ldquo;Three bands.<br />
          One resolve.<br />
          Worn as pressure.&rdquo;
        </p>
        <p className="dr-final-attr">— PHILEON Inspiration Vault</p>
      </section>
    </div>
  );
}
