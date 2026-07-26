import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import RingSizeSelector, { ringSizeLabel, ringSizeSkuToken, ringSizeIdToken } from "@/components/RingSizeSelector";
import { useAddToCart } from "@/hooks/useAddToCart";

/**
 * SCACCO MATTO — PHILEON Fine Jewelry → Rings (Unisex).
 * Slug: scacco-matto. Route: /scacco-matto (+ /fine-jewelry/scacco-matto alias).
 *
 * All styling in this file is scoped under `.sm-page` and must not leak
 * to any other product. Prices are approved CAD strings — never converted
 * to USD, never derived from cadToUsdLuxury().
 */

// ── ASSETS ──────────────────────────────────────────────────────────────────
const BASE = "/fine-jewelry/scacco-matto";
const HERO_THREE_QUARTER = `${BASE}/hero-three-quarter.png`;
const MACRO_SQ_CIRCLE    = `${BASE}/macro-square-circle.png`;
const STATIONS_CLOSEUP   = `${BASE}/stations-frontal-closeup.png`;
const REAR_OPENING       = `${BASE}/rear-opening.png`;
const TOP_DOWN           = `${BASE}/top-down.png`;

// Gallery (approved order). Slots 6, 7, 8 are reserved — the "additional
// square-sapphire macro", "additional yellow-and-blue close-up", and
// "overhead lifestyle Black male model" images have not yet been supplied.
// When they arrive, insert them here in these named slots. No stand-ins.
const GALLERY = [
  { src: HERO_THREE_QUARTER, alt: "SCACCO MATTO upright three-quarter view of the full geometric band on a dark background" },
  { src: MACRO_SQ_CIRCLE,    alt: "SCACCO MATTO extreme macro of a bezel-set square blue sapphire beside a bezel-set circular yellow sapphire" },
  { src: STATIONS_CLOSEUP,   alt: "SCACCO MATTO frontal close-up of one square blue-sapphire station and one circular yellow-sapphire station" },
  { src: REAR_OPENING,       alt: "SCACCO MATTO straight rear circular view showing the full ring opening and open-sided architecture" },
  { src: TOP_DOWN,           alt: "SCACCO MATTO elevated circular product view — full ring seen top-down" },
];

// ── PRICING (APPROVED CAD ONLY — DO NOT CONVERT) ───────────────────────────
const CONFIG = {
  karats:  [{ id: "10K", label: "10K" }, { id: "14K", label: "14K" }],
  colours: [
    { id: "yellow", label: "Yellow Gold",              available: true  },
    { id: "white",  label: "White Gold — Coming Soon", available: false },
  ],
};
const PRICE_MAP = {
  "10K|yellow": 11400,
  "14K|yellow": 12000,
  "10K|white":  11650, // disabled — never selectable
  "14K|white":  12200, // disabled — never selectable
};
const formatCad = (n) => `$${n.toLocaleString("en-US")} CAD`;

// ── SIZE PROFILE (unisex — full site-wide range) ───────────────────────────
const SIZE_OPTIONS = [
  "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5",
  "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12",
  "custom",
];

export default function ScaccoMattoPage() {
  const [karat,  setKarat]  = useState("10K");
  const [colour, setColour] = useState("yellow");
  const [size,   setSize]   = useState("");
  const [idx,    setIdx]    = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const { isAdding, handleAddToCart } = useAddToCart();

  const priceCad = PRICE_MAP[`${karat}|${colour}`] ?? PRICE_MAP[`${karat}|yellow`];
  const isValid  = Boolean(karat) && colour === "yellow" && Boolean(size);

  useEffect(() => {
    document.title = "SCACCO MATTO | PHILEON Fine Jewelry";
    const upsert = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    upsert("name", "description",
      "SCACCO MATTO — Geometric Gemstone Band. Natural blue and yellow sapphires in alternating square and circular stations. 10K and 14K yellow gold. White gold coming soon.");
    upsert("property", "og:title", "SCACCO MATTO | PHILEON Fine Jewelry");
    upsert("property", "og:image", `${window.location.origin}${HERO_THREE_QUARTER}`);
  }, []);

  // Reset gallery to slot 1 whenever the karat changes.
  useEffect(() => { setIdx(0); }, [karat]);

  // Mobile swipe
  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) { dx < 0 ? setIdx((i)=>(i+1)%GALLERY.length) : setIdx((i)=>(i-1+GALLERY.length)%GALLERY.length); }
    touchStart.current = null;
  };

  const chooseColour = (id) => {
    const opt = CONFIG.colours.find(c => c.id === id);
    if (!opt || !opt.available) return; // white gold locked
    setColour(id);
    if (showValidation) setShowValidation(false);
  };

  const chooseKarat = (id) => {
    setKarat(id);
    if (showValidation) setShowValidation(false);
  };

  const chooseSize = (v) => {
    setSize(v);
    if (showValidation && v) setShowValidation(false);
  };

  const onAddToCart = () => {
    if (!isValid) { setShowValidation(true); return; }
    const colourLabel = "Yellow Gold";
    const variant = `${karat} · ${colourLabel} · ${ringSizeLabel(size)}`;
    handleAddToCart({
      id: `scacco-matto-${karat.toLowerCase()}-${colour}-${ringSizeIdToken(size)}`,
      name: "SCACCO MATTO — Geometric Gemstone Band",
      productName: "SCACCO MATTO",
      subtitle: "Geometric Gemstone Band",
      category: "PHILEON Fine Jewelry — Rings",
      currency: "CAD",
      price: priceCad,               // CAD numeric — cart uses this directly
      lockedPriceCad: priceCad,
      productKey: "scaccoMatto",
      tierKey: `${karat}_${colour}`,
      sku: `SM-${karat}-${colour.toUpperCase()}-${ringSizeSkuToken(size)}`,
      quantity: 1,
      slug: "scacco-matto",
      image: HERO_THREE_QUARTER,
      materials: ["Natural Blue Sapphires", "Natural Yellow Sapphires", `${karat} Yellow Gold`],
      karat,
      metalColour: colourLabel,
      ringSize: ringSizeLabel(size),
    }, 1, variant);
  };

  const gallerySlot = GALLERY[idx];
  const nextSlot = () => setIdx((i) => (i + 1) % GALLERY.length);
  const prevSlot = () => setIdx((i) => (i - 1 + GALLERY.length) % GALLERY.length);

  return (
    <div className="sm-page" data-testid="scacco-matto-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

        /* ──────────────────── SCACCO MATTO — SCOPED PAGE ─────────────────
           All rules below live under .sm-page and MUST NOT leak globally.
           Palette: cream / marigold / burnt orange / avocado / cobalt /
           brown / paper. Typography: Baloo 2 headings, Quicksand body,
           scoped exclusively to this page. Global PHILEON typography stays
           untouched.
           ────────────────────────────────────────────────────────────── */
        .sm-page {
          --cream:   #FBF3DE;
          --marigld: #F3C012;
          --orange:  #E6672E;
          --avocado: #7C8A4E;
          --cobalt:  #2E5A8C;
          --brown:   #3A2B1E;
          --paper:   #FFFBF0;
          --ink:     #2c1c10;

          background:
            radial-gradient(1200px 700px at 12% -10%, rgba(243,192,18,.14), transparent 55%),
            radial-gradient(900px 600px at 105% 15%, rgba(46,90,140,.09), transparent 55%),
            var(--cream);
          color: var(--brown);
          font-family: 'Quicksand', 'Inter', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .sm-page ::selection { background: var(--marigld); color: var(--brown); }

        .sm-return {
          display:inline-flex; align-items:center; gap:10px;
          padding:22px 28px;
          font-family:'Quicksand', sans-serif; font-weight:600;
          font-size:11px; letter-spacing:.32em; text-transform:uppercase;
          color:var(--cobalt); text-decoration:none;
          transition:color 220ms ease, gap 220ms ease;
        }
        .sm-return:hover { color:var(--orange); gap:16px; }

        .sm-wrap { max-width:1240px; margin:0 auto; padding:16px clamp(20px,4vw,60px) 120px; }

        .sm-eyebrow {
          display:inline-block;
          padding:6px 14px 5px;
          border-radius:999px;
          background:var(--cobalt); color:var(--paper);
          font-family:'Quicksand', sans-serif; font-weight:700;
          font-size:10.5px; letter-spacing:.32em; text-transform:uppercase;
          margin-bottom:22px;
          box-shadow: 3px 3px 0 rgba(58,43,30,.14);
        }

        .sm-hero-head { text-align:left; margin-bottom:22px; }
        .sm-title {
          font-family:'Baloo 2', 'Quicksand', sans-serif; font-weight:800;
          font-size:clamp(46px, 8vw, 110px);
          line-height:.94; letter-spacing:-.01em;
          color:var(--brown); margin:0;
          text-shadow: 3px 3px 0 rgba(243,192,18,.42);
        }
        .sm-subtitle {
          font-family:'Baloo 2', sans-serif; font-weight:600;
          font-size:clamp(18px, 2vw, 26px);
          color:var(--orange); margin:10px 0 0;
          letter-spacing:.02em;
        }

        /* ──────── LAYOUT (gallery + purchase) ──────── */
        .sm-grid {
          display:grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          gap:56px; margin-top:36px;
        }
        @media (max-width:960px){ .sm-grid { grid-template-columns:1fr; gap:36px; } }

        /* ──────── GALLERY ──────── */
        .sm-gallery { position:relative; }
        .sm-main {
          position:relative;
          width:100%; aspect-ratio:1/1;
          background:var(--paper);
          border-radius:28px;
          border:2px solid var(--brown);
          overflow:hidden;
          box-shadow: 8px 8px 0 rgba(58,43,30,.14);
          display:flex; align-items:center; justify-content:center;
          touch-action:pan-y;
        }
        .sm-main img {
          width:100%; height:100%;
          object-fit:contain; object-position:center;
          background:transparent;
          display:block;
          pointer-events:none;
        }
        .sm-nav {
          position:absolute; top:50%; transform:translateY(-50%);
          width:44px; height:44px; border-radius:999px;
          background:var(--paper); color:var(--brown);
          border:2px solid var(--brown);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer;
          transition:background 220ms ease, transform 220ms ease;
          z-index:3;
        }
        .sm-nav:hover { background:var(--marigld); transform:translateY(-50%) scale(1.06); }
        .sm-nav.prev { left:14px; }
        .sm-nav.next { right:14px; }

        .sm-thumbs {
          display:grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap:10px; margin-top:16px;
        }
        @media (max-width:520px){ .sm-thumbs { grid-template-columns: repeat(5, minmax(0, 1fr)); gap:8px; } }
        .sm-thumb {
          background:var(--paper);
          border:2px solid var(--brown);
          border-radius:16px;
          padding:0; overflow:hidden;
          aspect-ratio:1/1;
          cursor:pointer;
          transition:transform 220ms ease, box-shadow 220ms ease;
        }
        .sm-thumb img { width:100%; height:100%; object-fit:contain; }
        .sm-thumb:hover { transform:translateY(-2px); box-shadow:3px 3px 0 rgba(58,43,30,.16); }
        .sm-thumb.active { background:var(--marigld); box-shadow:3px 3px 0 var(--cobalt); }

        /* Small checker divider under gallery */
        .sm-divider {
          display:flex; align-items:center; justify-content:flex-start;
          gap:8px; margin-top:22px;
        }
        .sm-divider i {
          display:inline-block; width:14px; height:14px;
          background:var(--cobalt);
        }
        .sm-divider i:nth-child(2) { background:var(--marigld); border-radius:999px; }
        .sm-divider i:nth-child(3) { background:var(--orange); }
        .sm-divider i:nth-child(4) { background:var(--avocado); border-radius:999px; }
        .sm-divider i:nth-child(5) { background:var(--cobalt); }

        /* ──────── PURCHASE BLOCK ──────── */
        .sm-buy { position:relative; }
        .sm-buy .sm-materials {
          font-family:'Quicksand', sans-serif; font-weight:600;
          font-size:12px; letter-spacing:.28em; text-transform:uppercase;
          color:var(--avocado); margin:0 0 22px;
        }
        .sm-price {
          font-family:'Baloo 2', sans-serif; font-weight:800;
          font-size:clamp(30px, 4vw, 48px);
          color:var(--brown); margin:0 0 6px;
          transition: color 220ms ease;
        }
        .sm-price-note {
          font-family:'Quicksand', sans-serif; font-weight:500;
          font-size:14px; color:rgba(58,43,30,.55); margin:0 0 30px;
        }

        .sm-desc {
          font-family:'Quicksand', sans-serif;
          font-size:16px; line-height:1.7; color:var(--brown);
          margin:0 0 34px; max-width:52ch;
        }
        .sm-desc + .sm-desc { margin-top:-24px; }
        .sm-desc strong { color:var(--cobalt); font-weight:700; }

        /* Selectors group */
        .sm-selector { margin:0 0 26px; }
        .sm-selector-label {
          font-family:'Quicksand', sans-serif; font-weight:700;
          font-size:11px; letter-spacing:.36em; text-transform:uppercase;
          color:var(--brown); margin:0 0 12px;
          display:flex; align-items:center; gap:10px;
        }
        .sm-selector-label::before {
          content:""; display:inline-block;
          width:10px; height:10px; background:var(--marigld);
          border:2px solid var(--brown);
        }
        .sm-selector-label.round::before { border-radius:999px; background:var(--cobalt); }

        .sm-pills { display:flex; flex-wrap:wrap; gap:10px; }
        .sm-pill {
          appearance:none; -webkit-appearance:none;
          font-family:'Baloo 2', sans-serif; font-weight:700;
          font-size:15px; letter-spacing:.02em;
          padding:12px 22px; border-radius:999px;
          background:var(--paper); color:var(--brown);
          border:2px solid var(--brown);
          cursor:pointer;
          transition: background 220ms ease, color 220ms ease, transform 220ms ease, box-shadow 220ms ease;
          display:inline-flex; align-items:center; gap:8px;
        }
        .sm-pill:hover:not(.disabled) { background:var(--marigld); transform:translateY(-2px); box-shadow:3px 3px 0 rgba(58,43,30,.18); }
        .sm-pill.active {
          background:var(--cobalt); color:var(--paper);
          border-color:var(--cobalt);
          box-shadow:3px 3px 0 var(--marigld);
        }
        .sm-pill.disabled {
          background:repeating-linear-gradient(45deg, var(--paper), var(--paper) 6px, rgba(58,43,30,.06) 6px, rgba(58,43,30,.06) 12px);
          color:rgba(58,43,30,.42);
          border-color:rgba(58,43,30,.42);
          cursor:not-allowed;
          position:relative;
        }
        .sm-pill.disabled::after {
          content:"COMING SOON";
          position:absolute; top:-10px; right:-6px;
          font-family:'Quicksand', sans-serif; font-weight:700;
          font-size:8.5px; letter-spacing:.24em;
          background:var(--orange); color:var(--paper);
          padding:3px 7px; border-radius:999px;
          box-shadow:2px 2px 0 var(--brown);
        }

        /* Ring size selector — millennial theme override via CSS vars */
        .sm-ring-size {
          --ring-accent: ${'#'}E6672E;
          --ring-bg:     ${'#'}FFFBF0;
          --ring-fg:     ${'#'}3A2B1E;
          --ring-muted:  rgba(58,43,30,.55);
        }
        .sm-ring-size .rss-field {
          border-radius:14px !important;
          border-width:2px !important;
          font-family:'Baloo 2', sans-serif !important;
          font-weight:700;
        }
        .sm-ring-size .rss-menu { border-radius:14px !important; border-width:2px !important; }
        .sm-ring-size .rss-option { font-family:'Baloo 2', sans-serif !important; font-weight:600; }
        .sm-ring-size .rss-label { color:var(--brown) !important; font-family:'Quicksand', sans-serif; font-weight:700; }

        .sm-size-hint {
          margin-top:12px; padding:12px 16px;
          background:var(--paper);
          border:2px solid var(--brown);
          border-radius:14px;
          font-family:'Quicksand', sans-serif; font-size:14px; line-height:1.55;
          color:var(--brown);
          box-shadow: 3px 3px 0 rgba(58,43,30,.10);
        }
        .sm-size-hint strong { color:var(--cobalt); }

        /* Validation */
        .sm-validation {
          margin-top:16px; padding:12px 16px;
          background:var(--orange); color:var(--paper);
          border:2px solid var(--brown);
          border-radius:14px;
          font-family:'Baloo 2', sans-serif; font-weight:600; font-size:14px;
          box-shadow: 3px 3px 0 var(--brown);
        }

        /* CTA */
        .sm-cta {
          margin-top:36px;
          display:flex; flex-direction:column; gap:10px;
          border-top:1px dashed rgba(58,43,30,.28);
          padding-top:28px;
        }
        .sm-add-btn {
          appearance:none;
          font-family:'Baloo 2', sans-serif; font-weight:800;
          font-size:15px; letter-spacing:.14em;
          padding:18px 32px; border-radius:999px;
          background:var(--brown); color:var(--paper);
          border:2px solid var(--brown);
          cursor:pointer;
          transition: transform 220ms ease, background 220ms ease, box-shadow 220ms ease;
          box-shadow: 6px 6px 0 var(--marigld);
          text-transform:uppercase;
          width:100%;
        }
        .sm-add-btn:hover:not(:disabled) { transform:translateY(-3px); box-shadow: 8px 10px 0 var(--marigld); background:var(--cobalt); border-color:var(--cobalt); }
        .sm-add-btn:disabled {
          background:rgba(58,43,30,.22);
          border-color:rgba(58,43,30,.22);
          color:rgba(255,251,240,.72);
          box-shadow:none; cursor:not-allowed;
        }

        .sm-hint {
          font-family:'Quicksand', sans-serif; font-size:13px;
          color:rgba(58,43,30,.6); margin:0;
        }

        /* Sizing instruction shared image (fine jewelry sizing card) */
        .sm-sizing-card {
          margin:56px 0 0;
          background:var(--paper);
          border:2px solid var(--brown);
          border-radius:20px;
          padding:22px;
          box-shadow: 6px 6px 0 rgba(58,43,30,.14);
        }
        .sm-sizing-card h3 {
          margin:0 0 14px;
          font-family:'Baloo 2', sans-serif; font-weight:700;
          font-size:20px; color:var(--brown);
        }
        .sm-sizing-card p {
          font-family:'Quicksand', sans-serif; font-size:14px; line-height:1.6;
          color:rgba(58,43,30,.75); margin:0 0 12px;
        }
        .sm-sizing-card ol {
          font-family:'Quicksand', sans-serif; font-size:14px; line-height:1.6;
          color:var(--brown); margin:0 0 8px; padding-left:22px;
        }
        .sm-sizing-card ol li { margin:0 0 6px; }
        .sm-sizing-card a {
          font-family:'Baloo 2', sans-serif; font-weight:700;
          color:var(--cobalt); text-decoration:none;
          border-bottom:2px solid var(--marigld);
          padding-bottom:2px;
        }
        .sm-sizing-card a:hover { color:var(--orange); border-color:var(--cobalt); }

        /* Sticker-like "unisex" note */
        .sm-audience-note {
          display:inline-block;
          margin-top:18px; padding:5px 12px;
          background:var(--avocado); color:var(--paper);
          font-family:'Quicksand', sans-serif; font-weight:700;
          font-size:10.5px; letter-spacing:.28em; text-transform:uppercase;
          border-radius:999px;
          box-shadow: 2px 2px 0 rgba(58,43,30,.24);
          transform: rotate(-1.2deg);
        }
      `}</style>

      <Link to="/shop?category=rings" className="sm-return" data-testid="sm-return">
        <ArrowLeft size={14} /> Return to Fine Jewelry
      </Link>

      <div className="sm-wrap">
        <div className="sm-hero-head">
          <span className="sm-eyebrow" data-testid="sm-eyebrow">PHILEON Fine Jewelry · Rings</span>
          <h1 className="sm-title" data-testid="sm-title">SCACCO MATTO</h1>
          <p className="sm-subtitle" data-testid="sm-subtitle">Geometric Gemstone Band</p>
          <span className="sm-audience-note" data-testid="sm-audience-note">Unisex</span>
        </div>

        <div className="sm-grid">
          {/* GALLERY */}
          <div className="sm-gallery" data-testid="sm-gallery">
            <div
              className="sm-main"
              data-testid="sm-gallery-main"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <img src={gallerySlot.src} alt={gallerySlot.alt} data-testid="sm-gallery-image" />
              <button type="button" className="sm-nav prev" onClick={prevSlot} aria-label="Previous image" data-testid="sm-gallery-prev">
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button type="button" className="sm-nav next" onClick={nextSlot} aria-label="Next image" data-testid="sm-gallery-next">
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div className="sm-thumbs" data-testid="sm-gallery-thumbs">
              {GALLERY.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`sm-thumb ${i === idx ? "active" : ""}`}
                  aria-label={`Show image ${i + 1}: ${g.alt}`}
                  aria-pressed={i === idx}
                  data-testid={`sm-thumb-${i + 1}`}
                >
                  <img src={g.src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <div className="sm-divider" aria-hidden="true">
              <i /><i /><i /><i /><i />
            </div>
          </div>

          {/* PURCHASE BLOCK */}
          <div className="sm-buy" data-testid="sm-buy">
            <p className="sm-materials" data-testid="sm-materials">Natural Blue &amp; Yellow Sapphires</p>
            <p className="sm-price" data-testid="sm-price">{formatCad(priceCad)}</p>
            <p className="sm-price-note">Approved storefront price · CAD</p>

            <p className="sm-desc">
              SCACCO MATTO brings natural blue and yellow sapphires together in a continuous sequence
              of square and circular stations. Each gemstone is framed in gold, creating a repeating
              pattern that carries around the entire band.
            </p>
            <p className="sm-desc">
              Cool blue and golden-yellow tones meet through bold geometry, open-sided detailing and
              a composition designed to be seen from every angle.
            </p>
            <p className="sm-desc">
              <strong>Available in 10K and 14K yellow gold. White gold coming soon.</strong>
            </p>

            {/* KARAT */}
            <div className="sm-selector" data-testid="sm-selector-karat">
              <div className="sm-selector-label">Select Your Gold</div>
              <div className="sm-pills" role="radiogroup" aria-label="Select your gold karat">
                {CONFIG.karats.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    role="radio"
                    aria-checked={karat === k.id}
                    className={`sm-pill ${karat === k.id ? "active" : ""}`}
                    onClick={() => chooseKarat(k.id)}
                    data-testid={`sm-karat-${k.id.toLowerCase()}`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOUR */}
            <div className="sm-selector" data-testid="sm-selector-colour">
              <div className="sm-selector-label round">Select Your Colour</div>
              <div className="sm-pills" role="radiogroup" aria-label="Select your gold colour">
                {CONFIG.colours.map((c) => {
                  const disabled = !c.available;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={colour === c.id && !disabled}
                      aria-disabled={disabled}
                      tabIndex={disabled ? -1 : 0}
                      disabled={disabled}
                      className={`sm-pill ${colour === c.id && !disabled ? "active" : ""} ${disabled ? "disabled" : ""}`}
                      onClick={() => chooseColour(c.id)}
                      onKeyDown={(e) => { if (disabled && (e.key === "Enter" || e.key === " ")) e.preventDefault(); }}
                      data-testid={`sm-colour-${c.id}`}
                    >
                      {disabled ? c.label.replace(" — Coming Soon","") : c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RING SIZE */}
            <div className="sm-selector" data-testid="sm-selector-size">
              <div className="sm-selector-label">Select Your Ring Size</div>
              <div className="sm-ring-size">
                <RingSizeSelector
                  value={size}
                  onChange={chooseSize}
                  sizes={SIZE_OPTIONS}
                  label=""
                  showSizingMicrocopy={false}
                  testIdPrefix="sm-ring-size"
                />
              </div>
              <div className="sm-size-hint" data-testid="sm-size-hint">
                Choose your usual <strong>US ring size</strong> before adding SCACCO MATTO to your cart.
              </div>
            </div>

            {showValidation && !isValid && (
              <div className="sm-validation" role="alert" data-testid="sm-validation">
                {!size ? "Please select a ring size before adding SCACCO MATTO to your cart."
                       : "Please review your selections and try again."}
              </div>
            )}

            {/* CTA */}
            <div className="sm-cta">
              <button
                type="button"
                onClick={onAddToCart}
                disabled={!isValid || isAdding}
                className="sm-add-btn"
                aria-label="Add SCACCO MATTO to cart"
                data-testid="sm-add-to-cart"
              >
                {isAdding ? "✓ Added" : "Add to Cart"}
              </button>
              <p className="sm-hint">Ships from the PHILEON Atelier · Made to order · CAD pricing</p>
            </div>
          </div>
        </div>

        {/* Sizing instruction card */}
        <div className="sm-sizing-card" data-testid="sm-sizing-card">
          <h3>How to measure your ring size at home</h3>
          <p>Follow these three steps or drop into any local jeweler to confirm your size.</p>
          <ol>
            <li>Wrap a strip of paper snugly around the base of the finger you want to wear the ring on.</li>
            <li>Mark where the paper overlaps and measure the length in millimetres — that is your finger circumference.</li>
            <li>Match your measurement to a US ring size using our <Link to="/ring-size-guide" data-testid="sm-sizing-card-guide-link">Ring Size Guide</Link>. If you fall between sizes, size up by half.</li>
          </ol>
          <p>For a comfortable everyday fit, measure at the end of the day when your fingers are warmest.</p>
        </div>
      </div>
    </div>
  );
}
