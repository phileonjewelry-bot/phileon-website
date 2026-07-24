import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";
import { useAddToCart } from "@/hooks/useAddToCart";

// ── ASSETS ──────────────────────────────────────────────────────────────────
const BASE = "/inspiration-vault/gold-theory-ribbon";
const HERO_PAIR_BLACK   = `${BASE}/hero-pair-black.png`;
const CAR_THREE_QUARTER = `${BASE}/car-three-quarter.png`;
const CAR_PROFILE       = `${BASE}/car-profile.png`;
const CAFE_LIFESTYLE    = `${BASE}/cafe-lifestyle.png`;
const MANNEQUIN_WORN    = `${BASE}/mannequin-worn.png`;
const PAIR_WHITE        = `${BASE}/pair-white.jpg`;
const VIDEO_1           = `${BASE}/video-1.mp4`;
const VIDEO_1_POSTER    = `${BASE}/video-1-poster.jpg`;
const VIDEO_2           = `${BASE}/video-2.mp4`;
const VIDEO_2_POSTER    = `${BASE}/video-2-poster.jpg`;

const PRICE = 30;

// Approved gallery order (updated 2026-07-24 — videos first, then stills):
// 1) Silent product video #1   2) Silent product video #2
// 3) Black-bg mirrored pair    4) Candid car three-quarter
// 5) Candid car profile        6) Café lifestyle
// 7) Black mannequin worn      8) White-bg pair
const GALLERY = [
  { type: "video", src: VIDEO_1, poster: VIDEO_1_POSTER, alt: "RIBBON REGALE silent product motion — study one" },
  { type: "video", src: VIDEO_2, poster: VIDEO_2_POSTER, alt: "RIBBON REGALE silent product motion — study two" },
  { type: "image", src: HERO_PAIR_BLACK,   alt: "RIBBON REGALE — mirrored pair on black with reflections" },
  { type: "image", src: CAR_THREE_QUARTER, alt: "RIBBON REGALE worn — candid three-quarter view in a car" },
  { type: "image", src: CAR_PROFILE,       alt: "RIBBON REGALE worn — candid profile view in a car" },
  { type: "image", src: CAFE_LIFESTYLE,    alt: "RIBBON REGALE worn — café lifestyle portrait" },
  { type: "image", src: MANNEQUIN_WORN,    alt: "RIBBON REGALE worn on a black mannequin bust" },
  { type: "image", src: PAIR_WHITE,        alt: "RIBBON REGALE — the pair on a white background" },
];

function GalleryMedia({ item }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || item.type !== "video") return;
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    v.playsInline = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
  }, [item]);

  if (item.type === "video") {
    return (
      <video
        ref={videoRef}
        src={item.src}
        poster={item.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        aria-label={item.alt}
        data-testid="rr-gallery-video"
      />
    );
  }
  return <img src={item.src} alt={item.alt} data-testid="rr-gallery-image" />;
}

export default function RibbonRegalePage() {
  useLuxuryMotionObserver();
  const [idx, setIdx] = useState(0);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    setIdx(0);
    document.title = "RIBBON REGALE | PHILEON Inspiration Vault";
    const upsert = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    upsert("name", "description",
      "RIBBON REGALE — sculptural gold-tone earrings from the PHILEON Inspiration Vault. A polished ribbon silhouette shaped into sweeping loops and crisp folds. Sold as a mirrored pair.");
    upsert("property", "og:title", "RIBBON REGALE | PHILEON Inspiration Vault");
    upsert("property", "og:image", `${window.location.origin}${HERO_PAIR_BLACK}`);
  }, []);

  const prev = () => setIdx((i) => (i - 1 + GALLERY.length) % GALLERY.length);
  const next = () => setIdx((i) => (i + 1) % GALLERY.length);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-gold-theory-ribbon",
      productName: "RIBBON REGALE",
      name: "RIBBON REGALE — Sculptural Earrings",
      category: "Inspiration Vault — Earrings",
      includes: "One Pair",
      price: PRICE,
      productKey: "inspirationVaultRibbonRegale",
      tierKey: "default",
      sku: "IV-RIBBON-REGALE",
      quantity: 1,
      image: HERO_PAIR_BLACK,
    }, 1, "One Pair");
  };

  // ── Swipe support (mobile) ────────────────────────────────────────────────
  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    touchStart.current = null;
  };

  return (
    <div className="rr-page" data-testid="ribbon-regale-page">
      <LuxuryMotionStyles />
      <style>{`
        .rr-page { background:#0a0908; color:#e8e0cf; font-family:'Cormorant Garamond',serif; min-height:100vh; }
        .rr-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em;
          color:rgba(232,224,207,.55); text-decoration:none; text-transform:uppercase;
          transition:color 220ms ease,gap 220ms ease; }
        .rr-return:hover { color:#c8a24a; gap:16px; }
        .rr-wrap { max-width:1180px; margin:0 auto; padding:32px clamp(20px,4vw,60px) 120px; }
        .rr-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.6em;
          color:#c8a24a; text-transform:uppercase; margin:0 0 16px; text-align:center; }
        .rr-title { font-family:'Cinzel',serif; font-weight:500;
          font-size:clamp(36px,5.6vw,72px); letter-spacing:.16em; text-align:center;
          margin:0 0 12px; color:#f4ecd6; text-transform:uppercase; }
        .rr-subtitle { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(18px,2vw,26px); text-align:center; color:#c8a24a;
          margin:0 0 40px; }

        /* GALLERY */
        .rr-gallery { position:relative; margin:0 auto 40px; max-width:900px; }
        .rr-main { position:relative; width:100%; aspect-ratio:1/1; background:#000;
          border:1px solid rgba(200,162,74,.22); display:flex; align-items:center; justify-content:center;
          overflow:hidden; touch-action:pan-y; }
        .rr-main img, .rr-main video { width:100%; height:100%; object-fit:contain; object-position:center;
          display:block; background:#000; pointer-events:none; }
        .rr-nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(10,9,8,.75);
          border:1px solid rgba(200,162,74,.35); color:#f4ecd6; width:44px; height:44px;
          display:flex; align-items:center; justify-content:center; cursor:pointer;
          transition:background 220ms ease,color 220ms ease; z-index:2; }
        .rr-nav:hover { background:#c8a24a; color:#0a0908; }
        .rr-nav.prev { left:12px; } .rr-nav.next { right:12px; }

        .rr-thumbs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr));
          gap:10px; margin-top:14px; }
        @media (max-width:520px){
          .rr-thumbs { grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; }
        }
        .rr-thumb { position:relative; border:1px solid rgba(200,162,74,.18); background:#000; padding:0;
          aspect-ratio:1/1; cursor:pointer; overflow:hidden;
          transition:border-color 220ms ease,transform 220ms ease; }
        .rr-thumb:hover { border-color:#c8a24a; transform:translateY(-2px); }
        .rr-thumb.active { border-color:#c8a24a; }
        .rr-thumb img { width:100%; height:100%; object-fit:contain; background:#000; }
        .rr-thumb .rr-video-badge {
          position:absolute; bottom:6px; right:6px;
          background:rgba(0,0,0,.7); border:1px solid rgba(200,162,74,.55);
          color:#c8a24a; font-family:'Cinzel',serif; font-size:8.5px; letter-spacing:.28em;
          padding:3px 6px; text-transform:uppercase;
          pointer-events:none;
        }

        /* BODY */
        .rr-body { max-width:720px; margin:56px auto 0; text-align:center; }
        .rr-body h2 { font-family:'Playfair Display',serif; font-size:clamp(24px,3vw,36px);
          margin:0 0 20px; color:#f4ecd6; }
        .rr-body p { font-size:clamp(17px,1.5vw,20px); line-height:1.7; color:#d6cdb6; margin:0 0 16px; }
        .rr-includes { display:inline-block; margin-top:24px; padding:12px 26px;
          border:1px solid rgba(200,162,74,.35);
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.34em;
          color:#c8a24a; text-transform:uppercase; }

        /* CTA */
        .rr-cta { text-align:center; max-width:520px; margin:56px auto 0;
          padding-top:44px; border-top:1px solid rgba(200,162,74,.18); }
        .rr-price { font-family:'Cinzel',serif; font-size:clamp(22px,2.4vw,32px);
          letter-spacing:.28em; color:#f4ecd6; margin:0 0 8px; }
        .rr-price-note { font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:14px; letter-spacing:.06em; color:rgba(232,224,207,.55); margin:0 0 26px; }
        .rr-add-btn { display:inline-flex; align-items:center; justify-content:center;
          padding:18px 64px; border:1.5px solid #c8a24a; background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:#f4ecd6; text-transform:uppercase; cursor:pointer;
          transition:background 320ms ease,color 320ms ease,transform 220ms ease; }
        .rr-add-btn:hover:not(:disabled) { background:#c8a24a; color:#0a0908; transform:translateY(-2px); }
        .rr-add-btn:disabled { opacity:.6; cursor:wait; }

        .rr-archive-tag { display:block; margin-top:20px;
          font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:.42em;
          color:rgba(200,162,74,.65); text-transform:uppercase; }
      `}</style>

      <Link to="/inspiration-vault?category=earrings" className="rr-return" data-testid="rr-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <div className="rr-wrap">
        <p className="rr-eyebrow">Inspiration Vault · Earrings</p>
        <h1 className="rr-title" data-testid="rr-title">RIBBON REGALE</h1>
        <p className="rr-subtitle">Sculptural Earrings</p>

        <div className="rr-gallery" data-testid="rr-gallery">
          <div
            className="rr-main"
            data-testid="rr-gallery-main"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <GalleryMedia key={idx} item={GALLERY[idx]} />
            <button type="button" className="rr-nav prev" onClick={prev} aria-label="Previous image" data-testid="rr-prev"><ChevronLeft size={20}/></button>
            <button type="button" className="rr-nav next" onClick={next} aria-label="Next image" data-testid="rr-next"><ChevronRight size={20}/></button>
          </div>

          <div className="rr-thumbs" data-testid="rr-gallery-thumbs">
            {GALLERY.map((g, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setIdx(i)}
                className={`rr-thumb ${i === idx ? "active" : ""}`}
                aria-label={`Show ${g.type === "video" ? "video" : "image"} ${i + 1}: ${g.alt}`}
                aria-pressed={i === idx}
                data-testid={`rr-thumb-${i + 1}`}
              >
                <img src={g.type === "video" ? g.poster : g.src} alt="" loading="lazy" />
                {g.type === "video" && <span className="rr-video-badge">Motion</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="rr-body">
          <h2>A polished ribbon silhouette, shaped into sweeping loops and crisp folds.</h2>
          <p>
            Its reflective gold-tone surface gives the pair a bold sculptural presence
            from every angle. Designed as a mirrored pair for a balanced statement.
          </p>
          <p><strong>Sold as a pair.</strong></p>
          <p className="rr-includes" data-testid="rr-includes">Includes · One Pair</p>
        </div>

        <div className="rr-cta" data-testid="rr-cta">
          <p className="rr-price" data-testid="rr-price">${PRICE} USD</p>
          <p className="rr-price-note">Inspiration Vault · Sold as one pair</p>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="rr-add-btn"
            aria-label="Add RIBBON REGALE to cart"
            data-testid="rr-add-to-cart"
          >
            {buttonText || "ADD TO CART"}
          </button>
          <span className="rr-archive-tag" data-testid="rr-archive-tag">Archive Piece</span>
        </div>
      </div>
    </div>
  );
}
