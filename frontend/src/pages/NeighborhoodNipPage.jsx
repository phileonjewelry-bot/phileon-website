import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";
import RingSizeSelector, { ringSizeLabel, ringSizeSkuToken } from "@/components/RingSizeSelector";
import { useAddToCart } from "@/hooks/useAddToCart";
import { cadToUsdLuxury, formatUsd } from "@/lib/livePricing";

/**
 * NEIGHBORHOOD NIP — PHILEON Tribute Series (purchasable)
 *
 * A commercial Tribute Series ring.
 *
 * Configuration (single edition):
 *   14K White Gold · Princess-Cut Blue Sapphires · Black and White Diamonds
 *   No sterling / 10K / 18K / yellow / rose / lab / natural / CZ claims.
 *
 * Pricing:
 *   basePriceCAD: 19950 (internal only, never rendered)
 *   Public USD = cadToUsdLuxury(19950) — displayed via formatUsd()
 *
 * Sizes:  US 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13
 *   Size 10 is the reference size but NOT preselected. Customer must
 *   pick a size before ADD TO CART.
 */

const HERO_IMAGE = "/tribute-series/neighborhood-nip/hero-front.png";
const BASE_PRICE_CAD = 19950;
const CUSTOM_FEE_CAD = 1000;
const NIP_SIZES = ["8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13"];

// Original Victory Lap Patch — approved arrangement (6 white + 6 black).
// Serialized row-by-row: WWB/BWB/BWB/BWW
const VICTORY_PATTERN = [
  ["W", "W", "B"],
  ["B", "W", "B"],
  ["B", "W", "B"],
  ["B", "W", "W"],
];

const PATCH_ROWS = 4;
const PATCH_COLS = 3;
const REQUIRED_WHITE = 6;
const REQUIRED_BLACK = 6;

const serializePattern = (grid) =>
  grid.map((row) => row.join("")).join("/");

const countStones = (grid) => {
  let w = 0, b = 0;
  for (const row of grid) for (const c of row) {
    if (c === "W") w++;
    else if (c === "B") b++;
  }
  return { w, b };
};

const isPatternValid = (grid) => {
  const { w, b } = countStones(grid);
  return w === REQUIRED_WHITE && b === REQUIRED_BLACK && (w + b) === (PATCH_ROWS * PATCH_COLS);
};

const cloneGrid = (grid) => grid.map((r) => r.slice());

// Ordered gallery — eight angles supplied to date. Additional angles slot
// in here without any structural change.
const GALLERY = [
  { src: "/tribute-series/neighborhood-nip/gallery-07-hand-on-book.jpg",       alt: "NEIGHBORHOOD NIP — worn on the hand, resting on a leather-bound volume. 14K white gold cushion-square face set with invisible-set princess-cut blue sapphires and the black-and-white diamond Victory Patch." },
  { src: "/tribute-series/neighborhood-nip/gallery-08-four-panel.jpg",         alt: "NEIGHBORHOOD NIP — four editorial angles: three-quarter view, top-down face, front elevation, and side profile of the 14K white gold sapphire signet." },
  { src: "/tribute-series/neighborhood-nip/gallery-01-front.png",              alt: "NEIGHBORHOOD NIP — head-on front view showing the pavé sapphire face and central Victory Lap flag and N tribute motif." },
  { src: "/tribute-series/neighborhood-nip/gallery-02-front-tight.png",        alt: "NEIGHBORHOOD NIP — tight front view emphasizing the cushion-square silhouette and mosaic sapphire grid." },
  { src: "/tribute-series/neighborhood-nip/gallery-03-motif-macro.png",        alt: "NEIGHBORHOOD NIP — macro of the Victory Lap flag and N tribute motif set in black and white diamonds against the sapphire field." },
  { src: "/tribute-series/neighborhood-nip/gallery-04-side-macro.png",         alt: "NEIGHBORHOOD NIP — side macro showing the invisible-set princess-cut sapphires and 14K white gold framing." },
  { src: "/tribute-series/neighborhood-nip/gallery-05-motif-extreme-macro.png",alt: "NEIGHBORHOOD NIP — extreme macro of the tribute motif; princess-cut white diamonds and black diamonds forming the N and checkered field." },
  { src: "/tribute-series/neighborhood-nip/gallery-06-three-quarter.png",      alt: "NEIGHBORHOOD NIP — three-quarter angle on white showing the wide-band cushion-square profile in 14K white gold." },
];

export default function NeighborhoodNipPage() {
  useLuxuryMotionObserver();
  const [selectedSize, setSelectedSize] = useState(null);
  const [patchType, setPatchType] = useState("original"); // "original" | "custom"
  const [customGrid, setCustomGrid] = useState(() => cloneGrid(VICTORY_PATTERN));
  const [gridHistory, setGridHistory] = useState([]); // stack of prior grids for undo
  const { isAdding, handleAddToCart } = useAddToCart();
  const makeYourMarkRef = useRef(null);

  const basePriceUsd = useMemo(() => cadToUsdLuxury(BASE_PRICE_CAD), []);
  const customFeeUsd = useMemo(() => cadToUsdLuxury(CUSTOM_FEE_CAD), []);
  const currentPriceUsd = patchType === "custom" ? basePriceUsd + customFeeUsd : basePriceUsd;
  const priceUsdLabel = `${formatUsd(currentPriceUsd)} USD`;
  const customFeeLabel = `${formatUsd(customFeeUsd)} USD`;

  const { w: whiteCount, b: blackCount } = countStones(customGrid);
  const totalCells = whiteCount + blackCount;
  const customValid = isPatternValid(customGrid);
  const patternIncomplete = totalCells < PATCH_ROWS * PATCH_COLS;

  const patchPatternStr = patchType === "custom" ? serializePattern(customGrid) : serializePattern(VICTORY_PATTERN);
  const patchLabel = patchType === "custom" ? "Custom Black-and-White Diamond Layout" : "Original Victory Patch";

  useEffect(() => {
    document.title = "NEIGHBORHOOD NIP | Tribute Series | PHILEON";
    const upsertMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    upsertMeta("name", "description",
      "NEIGHBORHOOD NIP — architectural tribute ring in 14K white gold, princess-cut blue sapphires, and black and white diamonds. Customize your Victory Patch. PHILEON Tribute Series. Made to order.");
    const ogImage = `${window.location.origin}${HERO_IMAGE}`;
    upsertMeta("property", "og:title",     "NEIGHBORHOOD NIP | Tribute Series | PHILEON");
    upsertMeta("property", "og:image",     ogImage);
    upsertMeta("property", "og:type",      "product");
    upsertMeta("name",     "twitter:card", "summary_large_image");
    upsertMeta("name",     "twitter:image", ogImage);
  }, []);

  // ── Grid Editor Handlers ────────────────────────────────────────────
  const pushHistory = (grid) => {
    setGridHistory((h) => [...h.slice(-49), cloneGrid(grid)]); // keep last 50
  };

  const toggleCell = (rowIdx, colIdx) => {
    pushHistory(customGrid);
    setCustomGrid((prev) => {
      const next = cloneGrid(prev);
      next[rowIdx][colIdx] = prev[rowIdx][colIdx] === "W" ? "B" : "W";
      return next;
    });
  };

  const resetToOriginal = () => {
    pushHistory(customGrid);
    setCustomGrid(cloneGrid(VICTORY_PATTERN));
  };

  const invertColours = () => {
    pushHistory(customGrid);
    setCustomGrid((prev) => prev.map((row) => row.map((c) => (c === "W" ? "B" : "W"))));
  };

  const undoLast = () => {
    if (gridHistory.length === 0) return;
    const prev = gridHistory[gridHistory.length - 1];
    setGridHistory((h) => h.slice(0, -1));
    setCustomGrid(cloneGrid(prev));
  };

  const scrollToCustomization = (e) => {
    e?.preventDefault();
    makeYourMarkRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Cart handler ────────────────────────────────────────────────────
  const onAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a ring size.");
      return;
    }
    if (patchType === "custom") {
      if (patternIncomplete) {
        toast.error("Complete all 12 positions in your custom patch.");
        return;
      }
      if (!customValid) {
        toast.error("Use exactly 6 white diamonds and 6 black diamonds.");
        return;
      }
    }

    const sizeLabel = ringSizeLabel(selectedSize);
    const sizeToken = ringSizeSkuToken(selectedSize);
    const sku = `neighborhood-nip-14k-white-size-${String(selectedSize).replace(".", "-")}`;
    const isCustom = patchType === "custom";
    const patchNameForCart = isCustom ? "Custom" : "Original";
    const variantParts = [
      `Blue Sapphires · Black and White Diamonds`,
      `Ring Size: ${sizeLabel}`,
      `Victory Patch: ${patchNameForCart}`,
    ];
    if (isCustom) variantParts.push(`Pattern: ${patchPatternStr}`);

    handleAddToCart(
      {
        id: `neighborhood-nip-14k-white-size-${sizeToken}-patch-${isCustom ? patchPatternStr.replace(/\//g, "-") : "original"}`,
        name: `NEIGHBORHOOD NIP — 14K White Gold · ${sizeLabel}`,
        price: currentPriceUsd,
        productKey: "neighborhoodNip",
        tierKey: `14k-white-size-${sizeToken}`,
        metal: "14K White Gold",
        ringSize: selectedSize,
        ringSizeLabel: sizeLabel,
        sku,
        slug: "neighborhood-nip",
        image: HERO_IMAGE,
        materials: ["14K White Gold · Princess-Cut Blue Sapphires · Black and White Diamonds"],
        // Custom-patch metadata (line-item only — SKU is unchanged)
        patchType,
        patchPattern: patchPatternStr,
        patchLabel,
        whiteDiamondCount: isCustom ? whiteCount : REQUIRED_WHITE,
        blackDiamondCount: isCustom ? blackCount : REQUIRED_BLACK,
        customFeeUsd: isCustom ? customFeeUsd : 0,
        quantity: 1,
      },
      1,
      variantParts.join(" · ")
    );
  };

  // ── ADD-TO-CART enablement (spec: block when invalid) ───────────────
  const addDisabled = isAdding
    || !selectedSize
    || (patchType === "custom" && (!customValid || patternIncomplete));

  return (
    <div className="nip-page" data-testid="neighborhood-nip-page">
      <LuxuryMotionStyles />
      <style>{`
        .nip-page {
          --asphalt:#03060C;
          --sapphire-deep:#071B46;
          --victory:#123E8A;
          --electric:#2D63C8;
          --ink:#c5d2ea;
          --ink-strong:#eef2fb;
          --ink-muted:#6a7ba0;
          --rule-soft:rgba(45,99,200,.16);
          --rule-strong:rgba(45,99,200,.34);
          background:
            radial-gradient(circle at 20% 0%, rgba(18,62,138,.18), transparent 55%),
            radial-gradient(circle at 80% 100%, rgba(45,99,200,.10), transparent 60%),
            linear-gradient(180deg, var(--asphalt) 0%, #05091a 60%, var(--asphalt) 100%);
          color:var(--ink);
          font-family:'Cormorant Garamond', serif;
          min-height:100vh;
          overflow-x:hidden;
        }

        .nip-return {
          display:inline-flex; align-items:center; gap:10px;
          padding:18px 26px;
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.42em;
          color:var(--ink-muted); text-decoration:none; text-transform:uppercase;
          transition:color 280ms ease, gap 280ms ease;
        }
        .nip-return:hover { color:var(--electric); gap:16px; }

        .nip-eyebrow {
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.5em;
          color:var(--electric); text-transform:uppercase; margin:0 0 18px;
        }

        .nip-section {
          max-width:1180px; margin:0 auto;
          padding:clamp(64px, 7vw, 120px) clamp(20px, 4vw, 60px);
          opacity:0; transform:translateY(20px);
          animation:nipFade 1s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes nipFade { to { opacity:1; transform:translateY(0); } }
        .nip-section.d1 { animation-delay:.12s; }
        .nip-section.d2 { animation-delay:.24s; }
        .nip-section.d3 { animation-delay:.36s; }
        .nip-section.d4 { animation-delay:.48s; }
        .nip-section.d5 { animation-delay:.60s; }
        .nip-section.d6 { animation-delay:.72s; }

        /* ── HERO ─────────────────────────────────────────────────────── */
        .nip-hero-wrap {
          max-width:1180px; margin:clamp(12px, 2vw, 24px) auto 0;
          padding:0 clamp(20px, 4vw, 60px);
        }
        .nip-hero-panel {
          position:relative;
          width:100%;
          background:
            radial-gradient(circle at 50% 40%, rgba(45,99,200,.22), transparent 60%),
            linear-gradient(180deg, var(--sapphire-deep) 0%, #04102b 100%);
          border:1px solid var(--rule-strong);
          display:flex; align-items:center; justify-content:center;
          aspect-ratio:1 / 1;
          max-height:82vh;
        }
        .nip-hero-panel img {
          display:block;
          width:100%; height:100%;
          object-fit:contain; object-position:center;
        }
        .nip-hero-caption {
          max-width:1180px; margin:clamp(24px, 3vw, 42px) auto 0;
          padding:0 clamp(20px, 4vw, 60px);
          text-align:center;
        }
        .nip-hero-eyebrow {
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.6em;
          color:var(--electric); text-transform:uppercase; margin:0 0 18px;
        }
        .nip-hero-title {
          font-family:'Cinzel', serif; font-weight:500;
          font-size:clamp(30px, 5.6vw, 78px);
          letter-spacing:.16em; color:var(--ink-strong);
          margin:0 0 18px; text-transform:uppercase;
        }
        @media (max-width:420px){
          .nip-hero-title { font-size:28px; letter-spacing:.08em; }
        }
        .nip-hero-sub {
          font-family:'Playfair Display', serif; font-style:italic; font-weight:400;
          font-size:clamp(20px, 2vw, 28px);
          color:var(--electric); margin:0;
        }

        /* ── PURCHASE BLOCK ───────────────────────────────────────────── */
        .nip-purchase {
          max-width:820px; margin:0 auto;
          padding:clamp(40px, 5vw, 72px) clamp(20px, 4vw, 60px) clamp(48px, 6vw, 96px);
          text-align:center;
        }
        .nip-buy-subtitle {
          font-family:'Playfair Display', serif; font-style:italic;
          font-size:clamp(18px, 1.8vw, 24px);
          color:var(--ink); margin:0 0 22px;
        }
        .nip-buy-price {
          font-family:'Cinzel', serif; font-size:clamp(22px, 2.2vw, 30px);
          letter-spacing:.28em; color:var(--ink-strong);
          margin:0 0 22px;
        }
        .nip-buy-material {
          font-family:'Cormorant Garamond', serif;
          font-size:clamp(16px, 1.4vw, 20px);
          line-height:1.65; color:var(--ink);
          margin:0 0 24px;
        }
        .nip-buy-details {
          list-style:none; padding:0; margin:0 auto 32px;
          max-width:520px; text-align:left;
          display:grid; grid-template-columns:1fr 1fr;
          gap:6px 24px;
        }
        .nip-buy-details li {
          font-family:'Cormorant Garamond', serif;
          font-size:16px; color:var(--ink); line-height:1.55;
          padding:6px 0;
          border-bottom:1px solid var(--rule-soft);
        }
        @media (max-width:520px){
          .nip-buy-details { grid-template-columns:1fr; }
        }

        .nip-size-wrap {
          max-width:520px; margin:0 auto 24px;
          text-align:left;
        }

        .nip-sizing-block {
          max-width:520px; margin:24px auto 32px;
          text-align:left;
          padding:20px 22px;
          background:color-mix(in srgb, var(--electric) 6%, transparent);
          border-left:2px solid var(--electric);
        }
        .nip-sizing-eyebrow {
          font-family:'Cinzel', serif; font-size:10px; letter-spacing:.44em;
          color:var(--electric); text-transform:uppercase; margin:0 0 12px;
        }
        .nip-sizing-lead {
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:15px; line-height:1.6; color:var(--ink);
          margin:0 0 12px;
        }
        .nip-sizing-list {
          list-style:none; padding:0; margin:0;
        }
        .nip-sizing-list li {
          position:relative;
          padding:5px 0 5px 18px;
          font-family:'Cormorant Garamond', serif;
          font-size:15px; line-height:1.55; color:var(--ink);
        }
        .nip-sizing-list li::before {
          content:'';
          position:absolute; left:0; top:14px;
          width:8px; height:1px; background:var(--electric);
        }

        .nip-add-btn {
          display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px;
          border:1.5px solid var(--electric); background:transparent;
          font-family:'Cinzel', serif; font-size:12px; letter-spacing:.42em;
          color:var(--ink-strong); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease, color 380ms ease, transform 280ms ease;
        }
        .nip-add-btn:hover {
          background:var(--electric); color:#03060C; transform:translateY(-2px);
        }
        .nip-add-btn:disabled { opacity:.6; cursor:wait; }

        /* ── EDITORIAL BLOCKS ─────────────────────────────────────────── */
        .nip-h2 {
          font-family:'Playfair Display', serif; font-weight:400;
          font-size:clamp(30px, 4vw, 50px);
          line-height:1.05; color:var(--ink-strong);
          margin:0 0 28px; text-transform:uppercase; letter-spacing:.02em;
          text-align:center;
        }
        .nip-body {
          max-width:720px; margin:0 auto; text-align:center;
        }
        .nip-body p {
          font-family:'Cormorant Garamond', serif;
          font-size:clamp(19px, 1.55vw, 24px);
          line-height:1.75; color:var(--ink); margin:0 auto 18px;
        }
        .nip-body p.lead {
          font-family:'Playfair Display', serif; font-style:italic;
          font-size:clamp(22px, 2.2vw, 30px);
          color:var(--electric); margin-bottom:30px;
        }

        /* ── SPECS ────────────────────────────────────────────────────── */
        .nip-specs {
          background:linear-gradient(180deg, rgba(7,27,70,.55) 0%, rgba(3,6,12,.85) 100%);
          border-top:1px solid var(--rule-soft);
          border-bottom:1px solid var(--rule-soft);
        }
        .nip-specs-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:clamp(20px, 2.4vw, 36px) clamp(28px, 3.4vw, 56px);
          max-width:820px; margin:0 auto;
        }
        .nip-spec-row {
          display:flex; flex-direction:column; gap:6px;
          padding:14px 0;
          border-bottom:1px solid var(--rule-soft);
        }
        .nip-spec-label {
          font-family:'Cinzel', serif; font-size:10px; letter-spacing:.44em;
          color:var(--ink-muted); text-transform:uppercase;
        }
        .nip-spec-value {
          font-family:'Cormorant Garamond', serif; font-size:18px;
          color:var(--ink-strong); line-height:1.45;
        }
        @media (max-width:640px){
          .nip-specs-grid { grid-template-columns:1fr; }
        }

        /* ── TRIBUTE NOTICE ───────────────────────────────────────────── */
        .nip-notice {
          text-align:center;
          padding:clamp(64px, 7vw, 110px) clamp(20px, 4vw, 60px);
          background:var(--asphalt);
          border-top:1px solid var(--rule-strong);
        }
        .nip-notice-title {
          font-family:'Cinzel', serif; font-size:12px; letter-spacing:.5em;
          color:var(--electric); text-transform:uppercase; margin:0 0 22px;
        }
        .nip-notice-body {
          max-width:720px; margin:0 auto;
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:clamp(16px, 1.4vw, 20px);
          line-height:1.7; color:var(--ink-muted);
        }

        /* ── FINAL LINE ───────────────────────────────────────────────── */
        .nip-final {
          text-align:center;
          padding:clamp(80px, 9vw, 140px) clamp(20px, 4vw, 60px);
          background:#020408;
          border-top:1px solid var(--rule-soft);
        }
        .nip-final-line {
          font-family:'Playfair Display', serif; font-style:italic;
          font-size:clamp(24px, 2.8vw, 38px);
          line-height:1.55; color:var(--electric);
          max-width:760px; margin:0 auto;
        }
        .nip-final-attr {
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px;
        }

        /* ── GALLERY ─────────────────────────────────────────────────── */
        .nip-gallery {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:clamp(16px, 1.8vw, 24px);
          margin-top:36px;
        }
        .nip-gallery-cell {
          position:relative; width:100%; height:auto; min-height:0;
          overflow:hidden; background:var(--asphalt);
          border:1px solid var(--rule-soft);
          display:flex; align-items:center; justify-content:center;
        }
        .nip-gallery-cell img {
          display:block; width:100%; height:auto; max-height:80vh;
          object-fit:contain; object-position:center;
          background:var(--asphalt);
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .nip-gallery-cell:hover img { transform:scale(1.02); }
        @media (max-width:768px){
          .nip-gallery { grid-template-columns:1fr; gap:20px; }
          .nip-gallery-cell img { max-height:none; }
        }

        @media (prefers-reduced-motion: reduce){
          .nip-section { animation:none; opacity:1; transform:none; }
          .nip-gallery-cell img { transition:none; }
          .nip-gallery-cell:hover img { transform:none; }
        }

        /* ── PATCH SUMMARY (inside purchase block) ────────────────────── */
        .nip-patch-summary {
          max-width:520px; margin:20px auto 24px;
          display:flex; align-items:center; justify-content:space-between;
          gap:16px; flex-wrap:wrap;
          padding:14px 18px;
          background:rgba(3, 6, 12, 0.55);
          border:1px solid var(--rule-soft);
        }
        .nip-patch-summary-row {
          display:flex; flex-direction:column; gap:4px; text-align:left; min-width:0;
        }
        .nip-patch-summary-label {
          font-family:'Cinzel', serif; font-size:10px; letter-spacing:.44em;
          color:var(--ink-muted); text-transform:uppercase;
        }
        .nip-patch-summary-value {
          font-family:'Cormorant Garamond', serif; font-size:16px;
          color:var(--ink-strong); line-height:1.35;
        }
        .nip-patch-summary-fee {
          font-style:italic; color:var(--electric); font-size:14px;
        }
        .nip-patch-summary-cta {
          font-family:'Cinzel', serif; font-size:10px; letter-spacing:.42em;
          color:var(--electric); text-transform:uppercase; text-decoration:none;
          padding:8px 4px; white-space:nowrap;
          transition:color 220ms ease, letter-spacing 220ms ease;
        }
        .nip-patch-summary-cta:hover { color:var(--ink-strong); letter-spacing:.5em; }

        .nip-inline-error {
          margin:16px auto 0; max-width:520px;
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:14px; color:#ff9ea6; text-align:center;
        }

        /* ── CUSTOMIZATION SECTION ────────────────────────────────────── */
        .nip-customize-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:clamp(28px, 3.4vw, 56px);
          align-items:start;
          max-width:1080px; margin:0 auto;
        }
        @media (max-width:900px){
          .nip-customize-grid {
            grid-template-columns:1fr;
            gap:32px;
          }
          /* Mobile order: heading, selector, preview, editor, counters, controls, note */
          .nip-customize-right { order:1; }
          .nip-customize-left { order:2; }
        }

        /* ── Original / Custom toggle ────────────────────────────────── */
        .nip-patch-toggle {
          display:grid; grid-template-columns:1fr 1fr; gap:12px;
          margin-bottom:28px;
        }
        @media (max-width:520px){
          .nip-patch-toggle { grid-template-columns:1fr; }
        }
        .nip-patch-toggle-btn {
          display:flex; flex-direction:column; gap:6px;
          padding:16px 18px; text-align:left;
          background:rgba(3, 6, 12, 0.55);
          border:1px solid var(--rule-soft);
          color:var(--ink); cursor:pointer;
          transition:border-color 220ms ease, background 220ms ease, transform 220ms ease;
        }
        .nip-patch-toggle-btn:hover { border-color:var(--electric); transform:translateY(-1px); }
        .nip-patch-toggle-btn.is-active {
          border-color:var(--electric);
          background:linear-gradient(180deg, rgba(45,99,200,.14) 0%, rgba(7,27,70,.55) 100%);
        }
        .nip-patch-toggle-title {
          font-family:'Cinzel', serif; font-size:12px; letter-spacing:.34em;
          color:var(--ink-strong); text-transform:uppercase;
        }
        .nip-patch-toggle-sub {
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:14px; color:var(--ink-muted);
        }

        /* ── Editor ──────────────────────────────────────────────────── */
        .nip-editor {
          margin-top:8px;
          padding:20px;
          background:rgba(3, 6, 12, 0.55);
          border:1px solid var(--rule-soft);
        }
        .nip-editor-instructions {
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:14px; color:var(--ink-muted); line-height:1.6;
          margin-bottom:16px;
        }
        .nip-editor-grid {
          display:grid;
          grid-template-columns:repeat(${PATCH_COLS}, minmax(0, 1fr));
          grid-template-rows:repeat(${PATCH_ROWS}, minmax(0, 1fr));
          gap:8px;
          aspect-ratio:${PATCH_COLS} / ${PATCH_ROWS};
          max-width:min(340px, 100%);
          margin:0 auto;
        }
        .nip-editor-cell {
          position:relative;
          display:flex; align-items:center; justify-content:center;
          aspect-ratio:1 / 1;
          border-radius:3px;
          cursor:pointer;
          transition:transform 180ms ease, box-shadow 220ms ease;
          padding:0;
        }
        .nip-editor-cell:hover { transform:scale(1.05); }
        .nip-editor-cell:focus-visible {
          outline:2px solid var(--electric); outline-offset:3px;
        }
        .nip-editor-cell.is-white {
          background:
            radial-gradient(circle at 30% 25%, rgba(255,255,255,.95) 0%, #e8ebf3 45%, #b6bccf 100%);
          border:1px solid rgba(255,255,255,.6);
          box-shadow: inset 0 0 6px rgba(255,255,255,.7), 0 0 0 1px rgba(197,210,234,.35);
        }
        .nip-editor-cell.is-black {
          background:
            radial-gradient(circle at 30% 25%, rgba(80,84,98,.75) 0%, #16171f 45%, #05050a 100%);
          border:1px solid rgba(80,84,98,.35);
          box-shadow: inset 0 0 5px rgba(0,0,0,.7), 0 0 0 1px rgba(45,99,200,.18);
        }
        .nip-editor-cell-marker {
          font-family:'Cinzel', serif;
          font-size:11px; letter-spacing:.06em;
          font-weight:600;
        }
        .nip-editor-cell.is-white .nip-editor-cell-marker { color:rgba(3,6,12,.55); }
        .nip-editor-cell.is-black .nip-editor-cell-marker { color:rgba(255,255,255,.55); }

        .nip-editor-counters {
          display:flex; justify-content:center; gap:24px; flex-wrap:wrap;
          margin-top:20px;
        }
        .nip-counter {
          font-family:'Cormorant Garamond', serif;
          font-size:15px; letter-spacing:.02em;
          color:var(--ink);
        }
        .nip-counter b { font-family:'Cinzel', serif; font-weight:500; letter-spacing:.06em; }
        .nip-counter.is-ok { color:#8fd7a3; }
        .nip-counter.is-warn { color:#ffb884; }

        .nip-editor-error {
          margin-top:14px; text-align:center;
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:14px; color:#ff9ea6;
        }

        .nip-editor-controls {
          display:flex; justify-content:center; gap:10px; flex-wrap:wrap;
          margin-top:22px;
        }
        .nip-editor-ctrl {
          padding:10px 18px;
          background:transparent;
          border:1px solid var(--rule-strong);
          color:var(--ink); cursor:pointer;
          font-family:'Cinzel', serif; font-size:10px; letter-spacing:.32em;
          text-transform:uppercase;
          transition:background 220ms ease, color 220ms ease, border-color 220ms ease;
        }
        .nip-editor-ctrl:hover:not(:disabled) {
          background:var(--electric); color:#03060C; border-color:var(--electric);
        }
        .nip-editor-ctrl:disabled { opacity:.45; cursor:not-allowed; }

        /* ── Live Preview ────────────────────────────────────────────── */
        .nip-preview-frame {
          position:relative;
          width:100%;
          max-width:420px;
          margin:0 auto;
          aspect-ratio:1 / 1;
          background:linear-gradient(180deg, var(--sapphire-deep) 0%, #04102b 100%);
          border:1px solid var(--rule-strong);
          overflow:hidden;
          display:flex; align-items:center; justify-content:center;
        }
        .nip-preview-sapphire-field {
          position:absolute; inset:0;
          display:grid;
          grid-template-columns:repeat(5, 1fr);
          grid-template-rows:repeat(5, 1fr);
          gap:2px; padding:8px;
          opacity:.82;
        }
        .nip-preview-sapphire-tile {
          background:linear-gradient(135deg, #1d4ea2 0%, #123e8a 55%, #061a44 100%);
          border-radius:2px;
        }
        .nip-preview-gold-border {
          position:relative;
          padding:6px;
          background:linear-gradient(180deg, #e8ebf3 0%, #b6bccf 45%, #7d8299 100%);
          box-shadow: 0 8px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.4);
          border-radius:4px;
          width:min(58%, 240px);
        }
        .nip-preview-grid {
          display:grid;
          grid-template-columns:repeat(${PATCH_COLS}, minmax(0, 1fr));
          grid-template-rows:repeat(${PATCH_ROWS}, minmax(0, 1fr));
          gap:3px;
          aspect-ratio:${PATCH_COLS} / ${PATCH_ROWS};
          background:rgba(3,6,12,.6);
        }
        .nip-preview-stone {
          aspect-ratio:1 / 1;
          border-radius:2px;
        }
        .nip-preview-stone.is-white {
          background:
            radial-gradient(circle at 30% 25%, rgba(255,255,255,.98) 0%, #ecf0f7 45%, #b6bccf 100%);
          box-shadow: inset 0 0 4px rgba(255,255,255,.7);
        }
        .nip-preview-stone.is-black {
          background:
            radial-gradient(circle at 30% 25%, rgba(90,94,108,.65) 0%, #14151d 45%, #050509 100%);
          box-shadow: inset 0 0 4px rgba(0,0,0,.75);
        }
        .nip-preview-note {
          max-width:420px; margin:16px auto 0;
          text-align:center;
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:13px; line-height:1.55; color:var(--ink-muted);
        }
      `}</style>

      <Link to="/tribute-series" className="nip-return" data-testid="nip-return">
        <ArrowLeft size={14} /> RETURN TO TRIBUTE SERIES
      </Link>

      {/* HERO — static, uncropped, no overlay text on image */}
      <div className="nip-hero-wrap" data-testid="nip-hero">
        <div className="nip-hero-panel">
          <img
            src={HERO_IMAGE}
            alt="NEIGHBORHOOD NIP tribute ring — front view. Architectural cushion-square signet in 14K white gold with princess-cut blue sapphires and a central Victory Lap flag and N tribute motif in black and white diamonds."
            data-testid="nip-hero-image"
          />
        </div>
      </div>

      {/* HERO TYPOGRAPHY */}
      <div className="nip-hero-caption" data-testid="nip-hero-caption">
        <p className="nip-hero-eyebrow">PHILEON · Tribute Series</p>
        <h1 className="nip-hero-title" data-testid="nip-hero-title">NEIGHBORHOOD NIP</h1>
        <p className="nip-hero-sub">A blueprint carved in blue.</p>
      </div>

      {/* PURCHASE BLOCK */}
      <section className="nip-purchase" data-testid="nip-purchase-block">
        <p className="nip-eyebrow" style={{ textAlign:"center" }}>Tribute Series</p>
        <p className="nip-buy-subtitle">14K White Gold Sapphire and Diamond Tribute Ring</p>
        <p className="nip-buy-price" data-testid="nip-buy-price">{priceUsdLabel}</p>
        <p className="nip-buy-material">
          14K White Gold · Princess-Cut Blue Sapphires · Black and White Diamonds
        </p>

        <ul className="nip-buy-details" data-testid="nip-buy-details">
          <li>200 Stones</li>
          <li>Approximately 18 g</li>
          <li>Approximately 15 mm Band Width</li>
          <li>Approximately 3 mm Band Thickness</li>
          <li>Made to Order</li>
          <li>Reference Size: US 10</li>
        </ul>

        <div
          className="nip-size-wrap"
          style={{
            "--ring-accent": "#2D63C8",
            "--ring-bg": "rgba(3, 6, 12, 0.82)",
            "--ring-fg": "#eef2fb",
            "--ring-muted": "rgba(197, 210, 234, 0.62)",
          }}
        >
          <RingSizeSelector
            value={selectedSize}
            onChange={setSelectedSize}
            sizes={NIP_SIZES}
            label="RING SIZE"
            bandWidthMm={15}
            showSizingMicrocopy={false}
            hideWideBandWarning={true}
            testIdPrefix="nip-ring-size"
          />
        </div>

        {/* COMPACT PATCH SUMMARY */}
        <div className="nip-patch-summary" data-testid="nip-patch-summary">
          <div className="nip-patch-summary-row">
            <span className="nip-patch-summary-label">Victory Patch</span>
            <span className="nip-patch-summary-value" data-testid="nip-patch-summary-value">
              {patchLabel}
              {patchType === "custom" && (
                <em className="nip-patch-summary-fee"> · +{customFeeLabel}</em>
              )}
            </span>
          </div>
          <a href="#make-your-mark" onClick={scrollToCustomization} className="nip-patch-summary-cta" data-testid="nip-patch-edit-link">
            EDIT PATCH →
          </a>
        </div>

        {/* RING SIZING CUSTOMER INSTRUCTIONS */}
        <div className="nip-sizing-block" data-testid="nip-sizing-block">
          <p className="nip-sizing-eyebrow">Ring Sizing</p>
          <p className="nip-sizing-lead">
            NEIGHBORHOOD NIP is a substantial wide-band ring. Wide bands can feel tighter
            than narrow rings, so accurate sizing is important.
          </p>
          <p className="nip-sizing-lead" style={{ margin: "0 0 8px" }}>For the best fit:</p>
          <ul className="nip-sizing-list">
            <li>Measure the finger on which the ring will be worn.</li>
            <li>Measure near the end of the day, when fingers are at their normal size.</li>
            <li>Do not measure when the hands are unusually cold or swollen.</li>
            <li>Use the PHILEON Ring Size Guide before placing the order.</li>
            <li>When between two sizes, select the larger size for this wide-band construction.</li>
          </ul>
        </div>

        <button
          type="button"
          className="nip-add-btn"
          onClick={onAddToCart}
          disabled={addDisabled}
          aria-label="Add NEIGHBORHOOD NIP to cart"
          data-testid="nip-add-to-cart"
        >
          {isAdding ? "✓ ADDED" : "ADD TO CART"}
        </button>

        {patchType === "custom" && !customValid && !isAdding && (
          <p className="nip-inline-error" data-testid="nip-patch-inline-error">
            {patternIncomplete
              ? "Complete all 12 positions in your custom patch."
              : "Use exactly 6 white diamonds and 6 black diamonds."}
          </p>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CUSTOMIZATION — MAKE YOUR MARK
          Two-column on desktop, single-column on mobile.
          Left: heading, copy, selector, editor, counters, controls.
          Right (desktop) / Above editor (mobile): live preview + note.
      ═══════════════════════════════════════════════════════════════ */}
      <section
        id="make-your-mark"
        ref={makeYourMarkRef}
        className="nip-section nip-customize d6"
        data-testid="nip-customize-section"
      >
        <p className="nip-eyebrow" style={{ textAlign: "center" }}>Customization</p>
        <h2 className="nip-h2">Make Your Mark</h2>
        <p className="nip-body" style={{ marginBottom: 44 }}>
          <span
            style={{
              display: "block",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "clamp(20px, 2vw, 26px)",
              color: "var(--electric)",
              marginBottom: 20,
            }}
          >
            Reconfigure the black-and-white diamond Victory Patch.
          </span>
          At the centre of NEIGHBORHOOD NIP sits a twelve-stone black-and-white diamond patch. Choose the original Victory Lap configuration or arrange the same six white diamonds and six black diamonds into a custom pattern of your own. The sapphire field remains unchanged. The stone count remains unchanged.
        </p>

        <div className="nip-customize-grid" data-testid="nip-customize-grid-layout">
          {/* LEFT COLUMN — controls */}
          <div className="nip-customize-left">
            {/* Original / Custom Selector */}
            <div
              className="nip-patch-toggle"
              role="tablist"
              aria-label="Patch selection"
              data-testid="nip-patch-toggle"
            >
              <button
                type="button"
                role="tab"
                aria-selected={patchType === "original"}
                className={`nip-patch-toggle-btn ${patchType === "original" ? "is-active" : ""}`}
                onClick={() => setPatchType("original")}
                data-testid="nip-patch-toggle-original"
              >
                <span className="nip-patch-toggle-title">Original Victory Patch</span>
                <span className="nip-patch-toggle-sub">Approved arrangement · No additional charge</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={patchType === "custom"}
                className={`nip-patch-toggle-btn ${patchType === "custom" ? "is-active" : ""}`}
                onClick={() => setPatchType("custom")}
                data-testid="nip-patch-toggle-custom"
              >
                <span className="nip-patch-toggle-title">Custom Patch</span>
                <span className="nip-patch-toggle-sub">Arrange your own 6 + 6 · +{customFeeLabel}</span>
              </button>
            </div>

            {/* Grid editor (only when Custom selected) */}
            {patchType === "custom" && (
              <div className="nip-editor" data-testid="nip-patch-editor">
                <div className="nip-editor-instructions">
                  Tap each stone to toggle between White Diamond and Black Diamond.
                  Use exactly six of each.
                </div>

                <div
                  className="nip-editor-grid"
                  role="grid"
                  aria-label="Custom diamond patch — 3 columns by 4 rows"
                  data-testid="nip-editor-grid"
                >
                  {customGrid.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      const isWhite = cell === "W";
                      const rowNum = rIdx + 1;
                      const colNum = cIdx + 1;
                      const label = `Row ${rowNum}, Column ${colNum} — ${isWhite ? "White" : "Black"} Diamond. Press Enter or Space to toggle.`;
                      return (
                        <button
                          key={`${rIdx}-${cIdx}`}
                          type="button"
                          role="gridcell"
                          aria-label={label}
                          aria-pressed={isWhite}
                          className={`nip-editor-cell ${isWhite ? "is-white" : "is-black"}`}
                          onClick={() => toggleCell(rIdx, cIdx)}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              toggleCell(rIdx, cIdx);
                            }
                          }}
                          data-testid={`nip-editor-cell-r${rowNum}c${colNum}`}
                        >
                          <span className="nip-editor-cell-marker" aria-hidden="true">
                            {isWhite ? "W" : "B"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Counters */}
                <div className="nip-editor-counters" data-testid="nip-editor-counters">
                  <span
                    className={`nip-counter ${whiteCount === REQUIRED_WHITE ? "is-ok" : "is-warn"}`}
                    data-testid="nip-counter-white"
                  >
                    White Diamonds: <b>{whiteCount} / {REQUIRED_WHITE}</b>
                  </span>
                  <span
                    className={`nip-counter ${blackCount === REQUIRED_BLACK ? "is-ok" : "is-warn"}`}
                    data-testid="nip-counter-black"
                  >
                    Black Diamonds: <b>{blackCount} / {REQUIRED_BLACK}</b>
                  </span>
                </div>

                {!customValid && (
                  <p className="nip-editor-error" role="alert" data-testid="nip-editor-error">
                    {patternIncomplete
                      ? "Complete all 12 positions in your custom patch."
                      : "Use exactly 6 white diamonds and 6 black diamonds."}
                  </p>
                )}

                {/* Controls */}
                <div className="nip-editor-controls" data-testid="nip-editor-controls">
                  <button
                    type="button"
                    className="nip-editor-ctrl"
                    onClick={resetToOriginal}
                    data-testid="nip-editor-reset"
                  >
                    Reset to Original
                  </button>
                  <button
                    type="button"
                    className="nip-editor-ctrl"
                    onClick={invertColours}
                    data-testid="nip-editor-invert"
                  >
                    Invert Colours
                  </button>
                  <button
                    type="button"
                    className="nip-editor-ctrl"
                    onClick={undoLast}
                    disabled={gridHistory.length === 0}
                    data-testid="nip-editor-undo"
                  >
                    Undo Last Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Live Preview */}
          <div className="nip-customize-right">
            <div className="nip-preview-frame" data-testid="nip-patch-preview">
              <div className="nip-preview-sapphire-field" aria-hidden="true">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span key={i} className="nip-preview-sapphire-tile" />
                ))}
              </div>
              <div className="nip-preview-gold-border">
                <div
                  className="nip-preview-grid"
                  role="img"
                  aria-label={`Live preview of the ${patchLabel.toLowerCase()}`}
                >
                  {(patchType === "custom" ? customGrid : VICTORY_PATTERN).map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                      <span
                        key={`p-${rIdx}-${cIdx}`}
                        className={`nip-preview-stone ${cell === "W" ? "is-white" : "is-black"}`}
                        data-testid={`nip-preview-stone-r${rIdx + 1}c${cIdx + 1}`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
            <p className="nip-preview-note" data-testid="nip-preview-note">
              Digital preview represents stone placement only. Final colour,
              brilliance, and hand-setting may vary slightly.
            </p>
          </div>
        </div>
      </section>

      {/* THE BLOCK BECAME THE BLUEPRINT */}
      <section className="nip-section d1" data-testid="nip-block-blueprint">
        <p className="nip-eyebrow" style={{ textAlign:"center" }}>I</p>
        <h2 className="nip-h2">The Block Became the Blueprint</h2>
        <div className="nip-body">
          <p className="lead">A street became a discipline. A discipline became a shape.</p>
          <p>NEIGHBORHOOD NIP is a signet drawn with architectural restraint. Its lines answer to a corner, a curb, a doorway &mdash; the ordinary geometry of a neighborhood taken seriously enough to be measured.</p>
          <p>Nothing about the piece is decorative. Each edge is a decision. Each surface is a plane held to a straight edge. The ring reads as a plan drawing set into metal &mdash; a blueprint you can wear.</p>
        </div>
      </section>

      {/* THE BLUE MEANS EVERYTHING */}
      <section className="nip-section d2" data-testid="nip-blue-means-everything">
        <p className="nip-eyebrow" style={{ textAlign:"center" }}>II</p>
        <h2 className="nip-h2">The Blue Means Everything</h2>
        <div className="nip-body">
          <p className="lead">Not a color choice. A commitment.</p>
          <p>The palette is drawn from four blues, held in strict order:</p>
          <p>Midnight Asphalt for the ground the ring stands on. Deep Sapphire for the volume of the shank. Victory Blue for the field at the crown. Electric Sapphire for the light that runs across every polished edge.</p>
          <p>Read together, they are not decoration. They are the neighborhood at four different hours of the same night.</p>
        </div>
      </section>

      {/* THE VICTORY LAP */}
      <section className="nip-section d3" data-testid="nip-victory-lap">
        <p className="nip-eyebrow" style={{ textAlign:"center" }}>III</p>
        <h2 className="nip-h2">The Victory Lap</h2>
        <div className="nip-body">
          <p className="lead">The center is not an emblem. It is a finish line.</p>
          <p>At the crown of the ring is the Victory Lap flag and N tribute motif &mdash; a single, contained mark placed exactly on the axis of the piece.</p>
          <p>It is not a badge. It is not a logo. It is a small architectural moment: a checkered field held inside a raised frame, aligned to the geometry of the shank so that the whole ring reads as a single continuous idea.</p>
          <p>The mark is a period at the end of a long sentence. A quiet way of saying: the work was finished.</p>
        </div>
      </section>

      {/* THE BUILD — Technical Specification */}
      <section className="nip-section nip-specs d4" data-testid="nip-specs">
        <p className="nip-eyebrow" style={{ textAlign:"center" }}>The Build</p>
        <h2 className="nip-h2">Drawn, then Built.</h2>
        <div className="nip-specs-grid" data-testid="nip-specs-grid">
          <div className="nip-spec-row">
            <span className="nip-spec-label">Material</span>
            <span className="nip-spec-value">14K White Gold</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Primary Stones</span>
            <span className="nip-spec-value">Princess-Cut Blue Sapphires</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Accent Stones</span>
            <span className="nip-spec-value">Black and White Diamonds</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Central Detail</span>
            <span className="nip-spec-value" data-testid="nip-spec-central-detail">
              {patchType === "custom"
                ? "Custom 12-Stone Black-and-White Diamond Patch"
                : "Victory Lap Flag and \u201CN\u201D Tribute Motif"}
            </span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Total Stone Count</span>
            <span className="nip-spec-value">200 Stones</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Setting</span>
            <span className="nip-spec-value">Architectural Mosaic Grid</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Silhouette</span>
            <span className="nip-spec-value">Wide Cushion-Square Statement Ring</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Reference Ring Size</span>
            <span className="nip-spec-value">US Size 10</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Band Width</span>
            <span className="nip-spec-value">Approximately 15 mm</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Band Thickness</span>
            <span className="nip-spec-value">Approximately 3 mm</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Estimated Metal Weight</span>
            <span className="nip-spec-value">Approximately 18 g</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Production</span>
            <span className="nip-spec-value">Made to Order</span>
          </div>
        </div>
      </section>

      {/* INDEPENDENT TRIBUTE NOTICE */}
      <section className="nip-notice" data-testid="nip-tribute-notice">
        <p className="nip-notice-title">Independent Tribute</p>
        <p className="nip-notice-body">
          NEIGHBORHOOD NIP is an independent design tribute created by PHILEON.
          It is not affiliated with, endorsed by, or licensed by any estate,
          brand, or organization. No likenesses, logos, or protected marks are
          used. The piece is offered as an architectural study &mdash; a work
          of respect, made to order in a single edition.
        </p>
      </section>

      {/* GALLERY */}
      <section className="nip-section d5" data-testid="nip-gallery-section">
        <p className="nip-eyebrow" style={{ textAlign:"center" }}>Study</p>
        <h2 className="nip-h2">Eight Angles. One Idea.</h2>
        <div className="nip-gallery" data-testid="nip-gallery">
          {GALLERY.map((g, i) => (
            <div key={i} className="nip-gallery-cell" data-testid={`nip-gallery-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" data-testid={`nip-gallery-image-${i + 1}`} />
            </div>
          ))}
        </div>
      </section>

      {/* FINAL LINE */}
      <section className="nip-final" data-testid="nip-final">
        <p className="nip-final-line">
          &ldquo;The block became the blueprint.<br />
          The blueprint became the ring.&rdquo;
        </p>
        <p className="nip-final-attr">— PHILEON Tribute Series</p>
      </section>
    </div>
  );
}
