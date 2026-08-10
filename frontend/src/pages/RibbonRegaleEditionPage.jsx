/* ==========================================================================
   RIBBON REGALE ÉDITION — PHILEON Fine Jewelry
   -------------------------------------------------------------------------
   This page is the SOLID GOLD Fine Jewelry counterpart to the original
   RIBBON REGALE archive piece housed in the Inspiration Vault.

   The original file (`RibbonRegalePage.jsx`) and its route
   (`/inspiration-vault/ribbon-regale`) remain untouched. This file is a
   clone with the following surgical differences:
     • Metal selector — 10K / 14K / 18K SOLID Yellow Gold (no silver,
       plated, vermeil, gold-tone, white-gold or rose-gold)
     • Karat-specific pricing — three placeholder-safe fields at the top
       of this file, awaiting real prices (see PRICES block)
     • Copy — Fine Jewelry material statement, no plated / archive tags
     • Product route + cart identifiers use `ribbon-regale-edition`
   ========================================================================== */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";
import { useAddToCart } from "@/hooks/useAddToCart";

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

// ── PRICES ─────────────────────────────────────────────────────────────────
// NOTE (Feb 2026): three karat-specific prices have not yet been supplied
// by the merchant. Fill these three numeric USD values in and the metal
// selector + Add-to-Cart will activate automatically. Leave as `null` to
// keep the Fine Jewelry edition marked as "Pricing pending".
const PRICE_10K_YELLOW_GOLD_USD = null; // TODO: awaiting price input
const PRICE_14K_YELLOW_GOLD_USD = null; // TODO: awaiting price input
const PRICE_18K_YELLOW_GOLD_USD = null; // TODO: awaiting price input

const METAL_OPTIONS = [
  { id: "10k", karat: "10K", label: "10K YELLOW GOLD", cartMetalLabel: "10K Solid Yellow Gold", price: PRICE_10K_YELLOW_GOLD_USD, sku: "RRED-10KYG" },
  { id: "14k", karat: "14K", label: "14K YELLOW GOLD", cartMetalLabel: "14K Solid Yellow Gold", price: PRICE_14K_YELLOW_GOLD_USD, sku: "RRED-14KYG" },
  { id: "18k", karat: "18K", label: "18K YELLOW GOLD", cartMetalLabel: "18K Solid Yellow Gold", price: PRICE_18K_YELLOW_GOLD_USD, sku: "RRED-18KYG" },
];

// Approved gallery order — mirrors the original archive piece.
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
  return `$${Number(n).toLocaleString("en-US")} USD`;
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
  const [selectedMetalId, setSelectedMetalId] = useState(null);
  const [metalError, setMetalError] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    setIdx(0);
    document.title = "RIBBON REGALE ÉDITION | PHILEON Fine Jewelry";
    const upsert = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    upsert("name", "description",
      "RIBBON REGALE ÉDITION — the solid-gold Fine Jewelry expression of the sculptural ribbon earrings. Crafted in solid yellow gold and available in 10K, 14K and 18K. Sold as a mirrored pair.");
    upsert("property", "og:title", "RIBBON REGALE ÉDITION | PHILEON Fine Jewelry");
    upsert("property", "og:image", `${window.location.origin}${HERO_PAIR_BLACK}`);
  }, []);

  const prev = () => setIdx((i) => (i - 1 + GALLERY.length) % GALLERY.length);
  const next = () => setIdx((i) => (i + 1) % GALLERY.length);

  const activeMetal = METAL_OPTIONS.find((m) => m.id === selectedMetalId) || null;
  const activePrice = activeMetal && typeof activeMetal.price === "number" ? activeMetal.price : null;
  const canPurchase = !!activeMetal && typeof activeMetal.price === "number" && activeMetal.price > 0;

  const handleSelectMetal = (id) => {
    setSelectedMetalId(id);
    if (metalError) setMetalError(false);
  };

  const onAddToCart = () => {
    if (!activeMetal) { setMetalError(true); return; }
    if (!canPurchase) return; // Price not set yet — do not add to cart

    handleAddToCart({
      id: `ribbon-regale-edition-${activeMetal.id}`,
      productName: "RIBBON REGALE ÉDITION",
      name: `RIBBON REGALE ÉDITION — ${activeMetal.cartMetalLabel} · One Pair`,
      category: "PHILEON Fine Jewelry — Earrings",
      includes: "One Pair",
      price: activePrice,
      productKey: "ribbonRegaleEdition",
      tierKey: activeMetal.id,
      metal: activeMetal.cartMetalLabel,
      karat: activeMetal.karat,
      slug: "ribbon-regale-edition",
      sku: activeMetal.sku,
      quantity: 1,
      image: HERO_PAIR_BLACK,
      materials: [activeMetal.cartMetalLabel],
    }, 1, `${activeMetal.cartMetalLabel} · One Pair`);
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
    <div className="rre-page" data-testid="ribbon-regale-edition-page">
      <LuxuryMotionStyles />
      <style>{`
        .rre-page { background:#0a0908; color:#e8e0cf; font-family:'Cormorant Garamond',serif; min-height:100vh; }
        .rre-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em;
          color:rgba(232,224,207,.55); text-decoration:none; text-transform:uppercase;
          transition:color 220ms ease,gap 220ms ease; }
        .rre-return:hover { color:#c8a24a; gap:16px; }
        .rre-wrap { max-width:1180px; margin:0 auto; padding:32px clamp(20px,4vw,60px) 120px; }
        .rre-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.6em;
          color:#c8a24a; text-transform:uppercase; margin:0 0 16px; text-align:center; }
        .rre-title { font-family:'Cinzel',serif; font-weight:500;
          font-size:clamp(36px,5.6vw,72px); letter-spacing:.16em; text-align:center;
          margin:0 0 12px; color:#f4ecd6; text-transform:uppercase; }
        .rre-subtitle { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(18px,2vw,26px); text-align:center; color:#c8a24a;
          margin:0 0 40px; }

        /* GALLERY */
        .rre-gallery { position:relative; margin:0 auto 40px; max-width:900px; }
        .rre-main { position:relative; width:100%; aspect-ratio:1/1; background:#000;
          border:1px solid rgba(200,162,74,.22); display:flex; align-items:center; justify-content:center;
          overflow:hidden; touch-action:pan-y; }
        .rre-main img, .rre-main video { width:100%; height:100%; object-fit:contain; object-position:center;
          display:block; background:#000; pointer-events:none; }
        .rre-nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(10,9,8,.75);
          border:1px solid rgba(200,162,74,.35); color:#f4ecd6; width:44px; height:44px;
          display:flex; align-items:center; justify-content:center; cursor:pointer;
          transition:background 220ms ease,color 220ms ease; z-index:2; }
        .rre-nav:hover { background:#c8a24a; color:#0a0908; }
        .rre-nav.prev { left:12px; } .rre-nav.next { right:12px; }

        .rre-thumbs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr));
          gap:10px; margin-top:14px; }
        @media (max-width:520px){
          .rre-thumbs { grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; }
        }
        .rre-thumb { position:relative; border:1px solid rgba(200,162,74,.18); background:#000; padding:0;
          aspect-ratio:1/1; cursor:pointer; overflow:hidden;
          transition:border-color 220ms ease,transform 220ms ease; }
        .rre-thumb:hover { border-color:#c8a24a; transform:translateY(-2px); }
        .rre-thumb.active { border-color:#c8a24a; }
        .rre-thumb img { width:100%; height:100%; object-fit:contain; background:#000; }
        .rre-thumb .rre-video-badge {
          position:absolute; bottom:6px; right:6px;
          background:rgba(0,0,0,.7); border:1px solid rgba(200,162,74,.55);
          color:#c8a24a; font-family:'Cinzel',serif; font-size:8.5px; letter-spacing:.28em;
          padding:3px 6px; text-transform:uppercase;
          pointer-events:none;
        }

        /* BODY */
        .rre-body { max-width:720px; margin:56px auto 0; text-align:center; }
        .rre-body h2 { font-family:'Playfair Display',serif; font-size:clamp(24px,3vw,36px);
          margin:0 0 20px; color:#f4ecd6; }
        .rre-body p { font-size:clamp(17px,1.5vw,20px); line-height:1.7; color:#d6cdb6; margin:0 0 16px; }
        .rre-material-statement { display:inline-block; margin-top:24px; padding:12px 26px;
          border:1px solid rgba(200,162,74,.35);
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.34em;
          color:#c8a24a; text-transform:uppercase; }

        /* METAL SELECTOR */
        .rre-metals { max-width:640px; margin:56px auto 0; }
        .rre-metals-heading { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em;
          text-align:center; color:rgba(232,224,207,.55); text-transform:uppercase;
          margin:0 0 18px; }
        .rre-metal-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
        @media (max-width:520px){ .rre-metal-grid { grid-template-columns:1fr; } }
        .rre-metal-btn { display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:18px 12px; background:transparent; border:1.5px solid rgba(200,162,74,.35);
          color:#e8e0cf; font-family:'Cinzel',serif; font-size:12px; letter-spacing:.24em;
          text-transform:uppercase; cursor:pointer; text-align:center;
          transition:background 220ms ease,color 220ms ease,border-color 220ms ease,transform 220ms ease; }
        .rre-metal-btn:hover { background:rgba(200,162,74,.08); border-color:#c8a24a; transform:translateY(-2px); }
        .rre-metal-btn.active { background:rgba(200,162,74,.15); border-color:#c8a24a; color:#f4ecd6; }
        .rre-metal-price { display:block; margin-top:8px; font-family:'Cormorant Garamond',serif;
          font-style:italic; letter-spacing:.04em; color:#c8a24a; font-size:14px; text-transform:none; }
        .rre-metal-price.pending { color:rgba(232,224,207,.45); }
        .rre-metal-error { font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.28em;
          text-transform:uppercase; color:#e67373; text-align:center; margin:14px 0 0; }

        /* CTA */
        .rre-cta { text-align:center; max-width:520px; margin:56px auto 0;
          padding-top:44px; border-top:1px solid rgba(200,162,74,.18); }
        .rre-price { font-family:'Cinzel',serif; font-size:clamp(22px,2.4vw,32px);
          letter-spacing:.28em; color:#f4ecd6; margin:0 0 8px; }
        .rre-price.pending { color:rgba(232,224,207,.55); font-style:italic; letter-spacing:.14em;
          font-family:'Cormorant Garamond',serif; }
        .rre-price-note { font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:14px; letter-spacing:.06em; color:rgba(232,224,207,.55); margin:0 0 26px; }
        .rre-add-btn { display:inline-flex; align-items:center; justify-content:center;
          padding:18px 64px; border:1.5px solid #c8a24a; background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:#f4ecd6; text-transform:uppercase; cursor:pointer;
          transition:background 320ms ease,color 320ms ease,transform 220ms ease; }
        .rre-add-btn:hover:not(:disabled) { background:#c8a24a; color:#0a0908; transform:translateY(-2px); }
        .rre-add-btn:disabled { opacity:.55; cursor:not-allowed; }
      `}</style>

      <Link to="/shop?audience=ladies&category=earrings" className="rre-return" data-testid="rre-return">
        <ArrowLeft size={14} /> RETURN
      </Link>

      <div className="rre-wrap">
        <p className="rre-eyebrow">PHILEON Fine Jewelry · Earrings</p>
        <h1 className="rre-title" data-testid="rre-title">RIBBON REGALE ÉDITION</h1>
        <p className="rre-subtitle">Sculptural Earrings — Solid Gold</p>

        <div className="rre-gallery" data-testid="rre-gallery">
          <div
            className="rre-main"
            data-testid="rre-gallery-main"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <GalleryMedia key={idx} item={GALLERY[idx]} />
            <button type="button" className="rre-nav prev" onClick={prev} aria-label="Previous image" data-testid="rre-prev"><ChevronLeft size={20}/></button>
            <button type="button" className="rre-nav next" onClick={next} aria-label="Next image" data-testid="rre-next"><ChevronRight size={20}/></button>
          </div>

          <div className="rre-thumbs" data-testid="rre-gallery-thumbs">
            {GALLERY.map((g, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setIdx(i)}
                className={`rre-thumb ${i === idx ? "active" : ""}`}
                aria-label={`Show ${g.type === "video" ? "video" : "image"} ${i + 1}: ${g.alt}`}
                aria-pressed={i === idx}
                data-testid={`rre-thumb-${i + 1}`}
              >
                <img src={g.type === "video" ? g.poster : g.src} alt="" loading="lazy" />
                {g.type === "video" && <span className="rre-video-badge">Motion</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="rre-body">
          <h2>A polished ribbon silhouette, shaped into sweeping loops and crisp folds.</h2>
          <p>
            The Fine Jewelry expression of RIBBON REGALE. Its sculptural silhouette is
            carried into solid gold — the same sweeping architecture, now rendered in
            weightier, heirloom material. Designed as a mirrored pair for a balanced statement.
          </p>
          <p><strong>Sold as a pair.</strong></p>
          <p className="rre-material-statement" data-testid="rre-material-statement">
            Crafted in solid yellow gold and available in 10K, 14K and 18K.
          </p>
        </div>

        {/* METAL SELECTOR */}
        <div className="rre-metals" data-testid="rre-metal-selector">
          <p className="rre-metals-heading">Select Your Karat</p>
          <div className="rre-metal-grid">
            {METAL_OPTIONS.map((m) => {
              const isActive = selectedMetalId === m.id;
              const hasPrice = typeof m.price === "number" && m.price > 0;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => handleSelectMetal(m.id)}
                  className={`rre-metal-btn ${isActive ? "active" : ""}`}
                  data-testid={`rre-metal-${m.id}`}
                >
                  <span>{m.label}</span>
                  <span className={`rre-metal-price ${hasPrice ? "" : "pending"}`}>
                    {hasPrice ? formatUsd(m.price) : "Pricing pending"}
                  </span>
                </button>
              );
            })}
          </div>
          {metalError && !selectedMetalId ? (
            <p className="rre-metal-error" data-testid="rre-metal-error">
              Please select a karat before adding to cart.
            </p>
          ) : null}
        </div>

        <div className="rre-cta" data-testid="rre-cta">
          {canPurchase ? (
            <p className="rre-price" data-testid="rre-price">{formatUsd(activePrice)}</p>
          ) : (
            <p className="rre-price pending" data-testid="rre-price">
              {activeMetal ? "Pricing pending — please contact us" : "Select a karat to see your price"}
            </p>
          )}
          <p className="rre-price-note">PHILEON Fine Jewelry · Sold as one pair</p>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding || !canPurchase}
            className="rre-add-btn"
            aria-label="Add RIBBON REGALE ÉDITION to cart"
            data-testid="rre-add-to-cart"
          >
            {isAdding
              ? (buttonText || "ADDING…")
              : canPurchase
                ? "ADD TO CART"
                : !selectedMetalId
                  ? "SELECT A KARAT"
                  : "PRICING PENDING"}
          </button>
        </div>
      </div>
    </div>
  );
}
