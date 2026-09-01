/* ==========================================================================
   RIBBON REGALE ÉDITION — PHILEON Fine Jewelry
   -------------------------------------------------------------------------
   Full editorial redesign. Immersive dark gallery, single horizontal
   thumbnail rail, campaign-scale brass/gold statement, refined metal
   configurator. Original Inspiration Vault page (`RibbonRegalePage.jsx`)
   is untouched.
   ========================================================================== */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";
import { useAddToCart } from "@/hooks/useAddToCart";
import ProductSeo from "@/components/ProductSeo";
import { RIBBON_REGALE_EDITION_SEO } from "@/lib/seoProducts";

// ── ASSETS (shared with the original archive piece — same photography) ─────
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

// ── PRICES (USD · direct fixed, owner-approved) ─────────────────────────────
// Historical CAD anchors ($495 / $1,495 / $1,895 / $2,395 CAD) were converted
// once via the sitewide luxury USD rule and locked in as the permanent USD
// selling prices. No runtime FX conversion is applied to these values.
const PRICE_GOLD_PLATED_STERLING_SILVER_USD = 350;
const PRICE_10K_SOLID_YELLOW_GOLD_USD       = 1100;
const PRICE_14K_SOLID_YELLOW_GOLD_USD       = 1400;
const PRICE_18K_SOLID_YELLOW_GOLD_USD       = 1800;
const CURRENCY_CODE = "USD";

const METAL_OPTIONS = [
  {
    id: "plated",
    shortLabel: "Gold Plated",
    label: "GOLD PLATED STERLING SILVER",
    cartMetalLabel: "18K Yellow Gold Plated Sterling Silver",
    price: PRICE_GOLD_PLATED_STERLING_SILVER_USD,
    sku: "RRED-GPSS",
    baseMetal: "Sterling Silver",
    finish: "18K Yellow Gold Plated",
    isSolidGold: false,
  },
  {
    id: "10k",
    shortLabel: "10K",
    label: "10K YELLOW GOLD",
    cartMetalLabel: "10K Solid Yellow Gold",
    price: PRICE_10K_SOLID_YELLOW_GOLD_USD,
    sku: "RRED-10KYG",
    karat: "10K",
    isSolidGold: true,
  },
  {
    id: "14k",
    shortLabel: "14K",
    label: "14K YELLOW GOLD",
    cartMetalLabel: "14K Solid Yellow Gold",
    price: PRICE_14K_SOLID_YELLOW_GOLD_USD,
    sku: "RRED-14KYG",
    karat: "14K",
    isSolidGold: true,
  },
  {
    id: "18k",
    shortLabel: "18K",
    label: "18K YELLOW GOLD",
    cartMetalLabel: "18K Solid Yellow Gold",
    price: PRICE_18K_SOLID_YELLOW_GOLD_USD,
    sku: "RRED-18KYG",
    karat: "18K",
    isSolidGold: true,
  },
];

const DEFAULT_METAL_ID = "plated";

const GALLERY = [
  { type: "video", src: VIDEO_1, poster: VIDEO_1_POSTER, alt: "RIBBON REGALE ÉDITION silent product motion — study one" },
  { type: "video", src: VIDEO_2, poster: VIDEO_2_POSTER, alt: "RIBBON REGALE ÉDITION silent product motion — study two" },
  { type: "image", src: HERO_PAIR_BLACK,   alt: "RIBBON REGALE ÉDITION — mirrored pair on black with reflections" },
  { type: "image", src: CAR_THREE_QUARTER, alt: "RIBBON REGALE ÉDITION worn — candid three-quarter view in a car" },
  { type: "image", src: CAR_PROFILE,       alt: "RIBBON REGALE ÉDITION worn — candid profile view in a car" },
  { type: "image", src: CAFE_LIFESTYLE,    alt: "RIBBON REGALE ÉDITION worn — café lifestyle portrait" },
  { type: "image", src: MANNEQUIN_WORN,    alt: "RIBBON REGALE ÉDITION worn on a black mannequin bust" },
  { type: "image", src: PAIR_WHITE,        alt: "RIBBON REGALE ÉDITION — the pair on a white background" },
];

function formatUsd(n) {
  return `$${Number(n).toLocaleString("en-US")} ${CURRENCY_CODE}`;
}

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
        data-testid="rre-gallery-video"
      />
    );
  }
  return <img src={item.src} alt={item.alt} data-testid="rre-gallery-image" />;
}

export default function RibbonRegaleEditionPage() {
  useLuxuryMotionObserver();
  const [idx, setIdx] = useState(0);
  const [selectedMetalId, setSelectedMetalId] = useState(DEFAULT_METAL_ID);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const thumbRailRef = useRef(null);

  useEffect(() => {
    document.title = "RIBBON REGALE ÉDITION | PHILEON Fine Jewelry";
    const upsert = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    upsert("name", "description",
      "RIBBON REGALE ÉDITION — the Fine Jewelry reissue of the sculptural ribbon earrings. Available in 18K yellow-gold plated sterling silver or solid 10K, 14K and 18K yellow gold. Sold as a mirrored pair.");
    upsert("property", "og:title", "RIBBON REGALE ÉDITION | PHILEON Fine Jewelry");
    upsert("property", "og:image", `${window.location.origin}${HERO_PAIR_BLACK}`);
  }, []);

  // Keep the active thumbnail in view when the customer paginates the main
  // slide (chevron, swipe, or dot click).
  useEffect(() => {
    const rail = thumbRailRef.current;
    if (!rail) return;
    const active = rail.querySelector(`[data-thumb-idx="${idx}"]`);
    if (active && typeof active.scrollIntoView === "function") {
      active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [idx]);

  const prev = () => setIdx((i) => (i - 1 + GALLERY.length) % GALLERY.length);
  const next = () => setIdx((i) => (i + 1) % GALLERY.length);

  const activeMetal = METAL_OPTIONS.find((m) => m.id === selectedMetalId) || METAL_OPTIONS[0];
  const activePrice = activeMetal.price;
  const canPurchase = typeof activePrice === "number" && activePrice > 0;

  const onAddToCart = () => {
    if (!canPurchase) return;
    handleAddToCart({
      id: `ribbon-regale-edition-${activeMetal.id}`,
      productName: "RIBBON REGALE ÉDITION",
      name: `RIBBON REGALE ÉDITION — ${activeMetal.cartMetalLabel} · One Pair`,
      category: "PHILEON Fine Jewelry — Earrings",
      includes: "One Pair",
      price: activePrice,
      currency: CURRENCY_CODE,
      productKey: "ribbonRegaleEdition",
      tierKey: activeMetal.id,
      metal: activeMetal.cartMetalLabel,
      karat: activeMetal.karat || null,
      baseMetal: activeMetal.baseMetal || null,
      finish: activeMetal.finish || null,
      isSolidGold: activeMetal.isSolidGold,
      slug: "ribbon-regale-edition",
      sku: activeMetal.sku,
      quantity: 1,
      image: HERO_PAIR_BLACK,
      materials: [activeMetal.cartMetalLabel],
    }, 1, `${activeMetal.cartMetalLabel} · One Pair`);
  };

  // ── Swipe support ─────────────────────────────────────────────────────────
  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    touchStart.current = null;
  };

  const activeItem = GALLERY[idx];
  const activeIsLightBg = activeItem.type === "image" && activeItem.src.includes("pair-white");

  return (
    <div className="rre-page" data-testid="ribbon-regale-edition-page">
      <ProductSeo product={RIBBON_REGALE_EDITION_SEO} />
      <LuxuryMotionStyles />
      <style>{`
        /* ───────────────────────  BASE  ─────────────────────── */
        .rre-page { background:#08070a; color:#e8e0cf;
          font-family:'Cormorant Garamond',serif; min-height:100vh;
          overflow-x:hidden; }
        .rre-return { display:inline-flex; align-items:center; gap:10px;
          padding:22px clamp(20px,4vw,60px);
          font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.5em;
          color:rgba(232,224,207,.5); text-decoration:none; text-transform:uppercase;
          transition:color 220ms ease,gap 220ms ease; }
        .rre-return:hover { color:#c8a24a; gap:16px; }

        /* ───────────────────  EDITORIAL HEADER  ─────────────────── */
        .rre-header { text-align:center; padding:8px clamp(20px,4vw,60px) 40px; }
        .rre-eyebrow { font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.7em;
          color:#c8a24a; text-transform:uppercase; margin:0 0 20px; }
        .rre-title { font-family:'Cinzel',serif; font-weight:400;
          font-size:clamp(38px,6.4vw,92px); letter-spacing:.14em; line-height:1.05;
          margin:0 0 14px; color:#f4ecd6; text-transform:uppercase; }
        .rre-subtitle { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(15px,1.7vw,20px); letter-spacing:.06em;
          color:rgba(232,224,207,.7); margin:0; }

        /* ───────────────────  IMMERSIVE GALLERY  ─────────────────── */
        .rre-gallery-stage { position:relative; width:100%;
          background:#08070a; margin:16px auto 0; }
        .rre-stage-inner { position:relative;
          width:min(1200px,100%); margin:0 auto;
          aspect-ratio:5/6;
          overflow:hidden; touch-action:pan-y; }
        @media (min-width:1024px){ .rre-stage-inner { aspect-ratio:4/3; } }
        .rre-stage-inner img, .rre-stage-inner video {
          position:absolute; inset:0; width:100%; height:100%;
          object-fit:cover; display:block;
          transition:opacity 520ms ease; pointer-events:none;
          background:#08070a;
        }
        /* White-bg product still gets contained without a giant white card */
        .rre-stage-inner.light-bg { background:#f6f2ea; }
        .rre-stage-inner.light-bg img { object-fit:contain; background:#f6f2ea; padding:6% 4%; }

        /* Subtle chevrons — desktop only, understated */
        .rre-chev { position:absolute; top:50%; transform:translateY(-50%);
          width:44px; height:44px; display:flex; align-items:center; justify-content:center;
          background:transparent; border:none; color:rgba(244,236,214,.65);
          cursor:pointer; z-index:3; padding:0;
          transition:color 220ms ease,transform 220ms ease; }
        .rre-chev:hover { color:#f4ecd6; }
        .rre-chev.prev { left:clamp(4px,1.5vw,20px); }
        .rre-chev.next { right:clamp(4px,1.5vw,20px); }
        .rre-chev.next:hover { transform:translateY(-50%) translateX(4px); }
        .rre-chev.prev:hover { transform:translateY(-50%) translateX(-4px); }
        @media (max-width:520px){
          .rre-chev { width:36px; height:36px; opacity:0; pointer-events:none; }
        }

        /* Pagination dots (mobile-primary, desktop-secondary cue) */
        .rre-dots { position:absolute; bottom:14px; left:0; right:0;
          display:flex; align-items:center; justify-content:center; gap:6px;
          pointer-events:none; z-index:3; }
        .rre-dot { width:6px; height:6px; border-radius:50%;
          background:rgba(255,255,255,.35);
          transition:background 220ms ease,width 220ms ease; }
        .rre-dot.active { background:#c8a24a; width:18px; border-radius:3px; }

        /* Horizontal thumbnail rail — single row, scrollable, subtle */
        .rre-thumb-rail { display:flex; gap:10px; overflow-x:auto;
          padding:18px clamp(20px,4vw,60px) 6px;
          scroll-snap-type:x mandatory;
          scrollbar-width:none;
        }
        .rre-thumb-rail::-webkit-scrollbar { display:none; }
        .rre-thumb { flex:0 0 auto;
          width:clamp(80px,22vw,110px);
          aspect-ratio:1/1;
          background:#0a0908;
          border:1px solid transparent;
          overflow:hidden; padding:0; cursor:pointer;
          scroll-snap-align:center;
          transition:border-color 260ms ease,opacity 260ms ease,transform 260ms ease;
          opacity:.6;
        }
        .rre-thumb:hover { opacity:.9; transform:translateY(-2px); }
        .rre-thumb.active { opacity:1; border-color:#c8a24a; }
        .rre-thumb img { width:100%; height:100%; object-fit:cover; display:block; }

        /* ───────────────────  CAMPAIGN STATEMENT  ─────────────────── */
        .rre-campaign { padding:clamp(72px,10vw,140px) clamp(20px,4vw,60px);
          background:#08070a; text-align:center; margin-top:24px; }
        .rre-campaign-line { font-family:'Cinzel',serif;
          font-size:clamp(28px,5.6vw,68px); letter-spacing:.16em; line-height:1.15;
          text-transform:uppercase; margin:0; color:rgba(232,224,207,.55);
          font-weight:400; }
        .rre-campaign-line.dominant { color:#c8a24a; font-weight:500;
          font-size:clamp(34px,7.4vw,92px);
          margin-top:.35em; letter-spacing:.14em; }

        /* ───────────────────  PURCHASE BLOCK  ─────────────────── */
        .rre-purchase { max-width:900px; margin:0 auto;
          padding:64px clamp(20px,4vw,60px) 40px; }
        .rre-material-quote { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(18px,1.8vw,24px); text-align:center;
          color:#c8a24a; margin:0 0 26px; letter-spacing:.02em; }
        .rre-material-list { font-family:'Cormorant Garamond',serif;
          font-size:clamp(16px,1.6vw,20px); text-align:center;
          line-height:1.65; color:#d6cdb6; max-width:640px;
          margin:0 auto 44px; }

        /* Metal selector — refined pills */
        .rre-metals-heading { font-family:'Cinzel',serif; font-size:10px;
          letter-spacing:.5em; text-align:center;
          color:rgba(232,224,207,.5); text-transform:uppercase;
          margin:0 0 18px; }
        .rre-metal-row { display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px;
          margin:0 auto 22px; max-width:820px; }
        @media (max-width:900px){ .rre-metal-row { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (max-width:400px){ .rre-metal-row { grid-template-columns:1fr; } }
        .rre-metal-pill { display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:18px 12px;
          background:transparent;
          border:1px solid rgba(200,162,74,.25);
          color:#e8e0cf; cursor:pointer; text-align:center;
          transition:border-color 240ms ease,background 240ms ease,color 240ms ease,transform 240ms ease; }
        .rre-metal-pill:hover { border-color:rgba(200,162,74,.55); transform:translateY(-2px); }
        .rre-metal-pill.active {
          background:rgba(200,162,74,.08);
          border-color:#c8a24a;
          color:#f4ecd6;
        }
        .rre-metal-pill .metal-name {
          font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.22em;
          text-transform:uppercase; line-height:1.35;
        }
        .rre-metal-pill .metal-price {
          font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:14px; color:#c8a24a; margin-top:10px; letter-spacing:.02em;
        }

        /* Material disclosure — clean, no heavy box */
        .rre-disclosure { max-width:640px; margin:0 auto;
          text-align:center; padding:22px 0 32px;
          border-top:1px solid rgba(200,162,74,.14); }
        .rre-disclosure-title { font-family:'Cinzel',serif; font-size:10px;
          letter-spacing:.5em; text-transform:uppercase;
          color:rgba(232,224,207,.6); margin:0 0 12px; }
        .rre-disclosure p { font-family:'Cormorant Garamond',serif;
          font-size:16px; letter-spacing:.02em; color:#e8e0cf; margin:0 0 6px; }
        .rre-disclosure p strong { color:#f4ecd6; font-weight:600; letter-spacing:.04em; }
        .rre-disclosure .note { font-style:italic; color:rgba(232,224,207,.65);
          font-size:14px; margin-top:10px; }

        /* Dynamic material confirmation line — sits between disclosure and provenance */
        .rre-material-confirm { text-align:center; margin:20px auto 0;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.36em;
          text-transform:uppercase; color:#c8a24a; }

        /* Provenance / assurance row */
        .rre-provenance { max-width:640px; margin:44px auto 0;
          padding:32px 0 12px; text-align:center;
          border-top:1px solid rgba(200,162,74,.14); }
        .rre-provenance-heading { font-family:'Cinzel',serif; font-size:10.5px;
          letter-spacing:.7em; text-transform:uppercase;
          color:#c8a24a; margin:0 0 14px; }
        .rre-provenance-line { font-family:'Cormorant Garamond',serif;
          font-style:italic; font-size:15px; letter-spacing:.02em;
          color:rgba(232,224,207,.7); line-height:1.6; margin:0;
          padding:0 clamp(0px,2vw,20px); }
        @media (max-width:520px){
          .rre-provenance-line { font-size:14px; }
        }

        /* Price + CTA */
        .rre-cta { text-align:center; margin:28px auto 0; max-width:520px; }
        .rre-price { font-family:'Cinzel',serif;
          font-size:clamp(24px,3vw,36px); letter-spacing:.28em;
          color:#f4ecd6; margin:0 0 8px; }
        .rre-price-note { font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:13px; letter-spacing:.06em;
          color:rgba(232,224,207,.5); margin:0 0 26px; }
        .rre-add-btn { display:inline-flex; align-items:center; justify-content:center;
          min-width:280px; padding:20px 56px;
          border:1.5px solid #c8a24a; background:transparent;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.5em;
          color:#f4ecd6; text-transform:uppercase; cursor:pointer;
          transition:background 320ms ease,color 320ms ease,transform 220ms ease,letter-spacing 320ms ease; }
        .rre-add-btn:hover:not(:disabled) { background:#c8a24a; color:#08070a;
          transform:translateY(-2px); letter-spacing:.6em; }
        .rre-add-btn:disabled { opacity:.55; cursor:not-allowed; }

        /* Editorial body/story */
        .rre-story { max-width:700px; margin:56px auto 0;
          padding:0 clamp(20px,4vw,60px) 96px; text-align:center; }
        .rre-story h2 { font-family:'Playfair Display',serif;
          font-size:clamp(24px,3.4vw,40px); color:#f4ecd6;
          margin:0 0 22px; line-height:1.25; }
        .rre-story p { font-size:clamp(17px,1.5vw,20px); line-height:1.75;
          color:#c9c1ac; margin:0 0 16px; }
        .rre-story .dims { font-family:'Cinzel',serif; font-size:10.5px;
          letter-spacing:.4em; text-transform:uppercase;
          color:rgba(232,224,207,.55); margin-top:26px; display:block; }
      `}</style>

      <Link
        to="/shop?audience=ladies&category=earrings"
        className="rre-return"
        data-testid="rre-return"
      >
        <ArrowLeft size={14} /> RETURN
      </Link>

      {/* ────────────────  EDITORIAL HEADER  ──────────────── */}
      <header className="rre-header">
        <p className="rre-eyebrow">PHILEON Fine Jewelry · Earrings</p>
        <h1 className="rre-title" data-testid="rre-title">RIBBON REGALE ÉDITION</h1>
        <p className="rre-subtitle">Sculptural Earrings — Precious Metal Edition</p>
      </header>

      {/* ────────────────  IMMERSIVE GALLERY  ──────────────── */}
      <section className="rre-gallery-stage" aria-label="RIBBON REGALE ÉDITION gallery">
        <div
          className={`rre-stage-inner ${activeIsLightBg ? "light-bg" : ""}`}
          data-testid="rre-gallery-main"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <GalleryMedia key={idx} item={activeItem} />
          <button type="button" className="rre-chev prev" onClick={prev} aria-label="Previous image" data-testid="rre-prev">
            <ChevronLeft size={22} strokeWidth={1.4} />
          </button>
          <button type="button" className="rre-chev next" onClick={next} aria-label="Next image" data-testid="rre-next">
            <ChevronRight size={22} strokeWidth={1.4} />
          </button>
          <div className="rre-dots" aria-hidden="true">
            {GALLERY.map((_, i) => (
              <span key={i} className={`rre-dot ${i === idx ? "active" : ""}`} />
            ))}
          </div>
        </div>

        {/* Single horizontal thumbnail rail — scrolls on mobile */}
        <div
          className="rre-thumb-rail"
          data-testid="rre-gallery-thumbs"
          ref={thumbRailRef}
        >
          {GALLERY.map((g, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setIdx(i)}
              className={`rre-thumb ${i === idx ? "active" : ""}`}
              aria-label={`Show ${g.type === "video" ? "video" : "image"} ${i + 1}`}
              aria-pressed={i === idx}
              data-thumb-idx={i}
              data-testid={`rre-thumb-${i + 1}`}
            >
              <img src={g.type === "video" ? g.poster : g.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      {/* ────────────────  CAMPAIGN STATEMENT  ──────────────── */}
      <section
        className="rre-campaign"
        aria-label="PHILEON campaign statement"
        data-testid="rre-campaign-statement"
      >
        <p className="rre-campaign-line">THEY SELL IT IN BRASS.</p>
        <p className="rre-campaign-line dominant">WE MAKE IT IN GOLD.</p>
      </section>

      {/* ────────────────  PURCHASE BLOCK  ──────────────── */}
      <section className="rre-purchase" data-testid="rre-purchase-block">
        <p className="rre-material-quote" data-testid="rre-reissue-statement">
          An original PHILEON design, reissued in precious metal.
        </p>
        <p className="rre-material-list" data-testid="rre-material-statement">
          RIBBON REGALE ÉDITION is available in 18K yellow-gold plated
          sterling silver or solid 10K, 14K and 18K yellow gold.
        </p>

        <p className="rre-metals-heading">Select Your Metal</p>
        <div className="rre-metal-row" role="radiogroup" aria-label="Metal" data-testid="rre-metal-selector">
          {METAL_OPTIONS.map((m) => {
            const isActive = selectedMetalId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setSelectedMetalId(m.id)}
                className={`rre-metal-pill ${isActive ? "active" : ""}`}
                data-testid={`rre-metal-${m.id}`}
              >
                <span className="metal-name">{m.label}</span>
                <span className="metal-price">{formatUsd(m.price)}</span>
              </button>
            );
          })}
        </div>

        <div className="rre-disclosure" data-testid="rre-material-disclosure">
          {activeMetal.isSolidGold ? (
            <>
              <p className="rre-disclosure-title">Material — {activeMetal.karat} Solid Yellow Gold</p>
              <p>Crafted in <strong>{activeMetal.karat} Solid Yellow Gold</strong>. Not plated.</p>
            </>
          ) : (
            <>
              <p className="rre-disclosure-title">Material — 18K Yellow Gold Plated Sterling Silver</p>
              <p>Base Metal: <strong>Sterling Silver</strong></p>
              <p>Finish: <strong>18K Yellow Gold Plated</strong></p>
              <p className="note">
                This is the plated entry option. It is <strong>not</strong> solid gold.
                Choose 10K, 14K or 18K above for the solid-gold versions.
              </p>
            </>
          )}
        </div>

        {/* Dynamic material confirmation — mirrors the currently active metal. */}
        <p className="rre-material-confirm" data-testid="rre-material-confirm">
          {activeMetal.isSolidGold
            ? `Solid ${activeMetal.karat} Yellow Gold`
            : "Sterling Silver · 18K Yellow Gold Plated"}
        </p>

        {/* PHILEON Fine Jewelry provenance / assurance row */}
        <section
          className="rre-provenance"
          aria-label="PHILEON Fine Jewelry assurance"
          data-testid="rre-provenance-row"
        >
          <p className="rre-provenance-heading">PHILEON FINE JEWELRY</p>
          <p className="rre-provenance-line">
            Precious-metal construction · Karat-specific finishing · Made in limited production
          </p>
        </section>

        <div className="rre-cta" data-testid="rre-cta">
          <p className="rre-price" data-testid="rre-price">{formatUsd(activePrice)}</p>
          <p className="rre-price-note">
            PHILEON Fine Jewelry · Sold as one pair · Prices in {CURRENCY_CODE}
          </p>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding || !canPurchase}
            className="rre-add-btn"
            aria-label="Add RIBBON REGALE ÉDITION to cart"
            data-testid="rre-add-to-cart"
          >
            {isAdding ? (buttonText || "ADDING…") : "ADD TO CART"}
          </button>
        </div>
      </section>

      {/* ────────────────  STORY  ──────────────── */}
      <section className="rre-story">
        <h2>A polished ribbon silhouette, shaped into sweeping loops and crisp folds.</h2>
        <p>
          The Fine Jewelry expression of RIBBON REGALE. Its sculptural
          silhouette is carried into precious metal — the same sweeping
          architecture, now rendered with heirloom-grade weight and
          provenance. Designed as a mirrored pair for a balanced statement.
        </p>
        <p><strong>Sold as a pair.</strong></p>
        <span className="dims">Approx. 20 mm × 20 mm · 0.40 mm thickness</span>
      </section>
    </div>
  );
}
