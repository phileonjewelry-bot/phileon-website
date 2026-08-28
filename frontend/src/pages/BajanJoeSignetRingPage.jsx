/* ==========================================================================
   PHILEON — BAJAN JOE SIGNET RING
   Gents signet ring, sterling silver, princess-cut black spinel, reptile
   texture. One price ($795 USD) across two finishes: High Polish and Matte.
   Uses the shared RingProductPage template; the "tier" selector displays
   the two finishes as ring-size-agnostic variants at a single price point.
   Hero: autoplay-muted-loop BAJAN JOE video with the clean front render as
   both poster (before playback) and fallback (autoplay-blocked / reduced
   motion). Product card in the Fine Jewelry grid uses the same front render.
   ========================================================================== */

import React from "react";
import RingProductPage from "../components/RingProductPage";
import ProductSeo from "@/components/ProductSeo";
import { BAJAN_JOE_SEO } from "@/lib/seoProducts";
import FineJewelryConfidence from "@/components/FineJewelryConfidence";

// Approved BAJAN JOE assets (public artifact URLs, unmodified).
const HERO_VIDEO   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ua7fhqo0_hf_20260808_045211_0c2ba646-60ce-406a-b04b-979db1d45083.mp4";
const RENDER_FRONT = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/p0nvtaur_1000168342.png";
const RENDER_ANGLE = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/mb9ie3g5_1000168343.png";
const RENDER_ALT   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/o8yxeh08_1000168344.png";
// New: reptile-detail profile + gents lifestyle
const RENDER_PROFILE = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/nyc3lac7_1000168349.png"; // side profile — reptile shank fully visible
const LIFESTYLE_HAND = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/qv537c0a_1000167362.png"; // hand model wearing the ring on middle finger
const LIFESTYLE_EDIT = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/qg4ncofo_1000167663.png"; // full-body editorial at bar
const LIFESTYLE_BAR_HAND = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/5d9xqw5d_1000168910.png"; // intimate bar hand — warm bokeh on marble
const PRESENTATION_BOX = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/p84yjqh9_1000169938.png"; // top-down on white ring pillow in red presentation box

const bajanJoeProduct = {
  id: "bajan-joe",
  slug: "bajan-joe",
  name: "BAJAN JOE",
  tagline: "Black Spinel Reptile Signet.",
  collection: "PHILEON Fine Jewelry",
  sizeProfile: "gents",
  defaultTier: "polish",

  // ------------------------------------------------------------------
  // BAJAN JOE OPT-IN FEATURES (do not enable on other products):
  //   - noDefaultSize: no size preselected, placeholder "SELECT RING SIZE"
  //   - showSizeValidationOnAdd: inline error + focus on selector when the
  //       customer presses Add to Cart before choosing a size
  //   - sizePlaceholder: exact copy required for BAJAN JOE
  //   - zoomableGallery: full-screen zoom overlay so shoppers can inspect
  //       the reptile-scale texture up close
  //   - bandWidthMm 11.5 triggers the shared wide-band fit notice
  //   - customFitNote: BAJAN JOE-specific fit guidance
  // ------------------------------------------------------------------
  noDefaultSize: true,
  showSizeValidationOnAdd: true,
  sizePlaceholder: "SELECT RING SIZE",
  zoomableGallery: true,
  bandWidthMm: 11.5,
  // BAJAN JOE size range — gents 7 → 15 in half sizes (17 sizes, no custom).
  availableSizes: [
    "7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15",
  ],
  customFitNote:
    "Because BAJAN JOE has a wide, substantial shank, customers between sizes should generally choose the next half size up. Measure at the end of the day when fingers are at their normal size. The left and right hands may measure differently — measure the exact finger on which the ring will be worn.",

  // Two finishes, one price. Both variants ship as sterling silver with the
  // same 8×8mm princess-cut black spinel. High Polish is default.
  tiers: {
    polish: {
      name: "High Polish",
      metal: "Sterling Silver — High Polish",
      description:
        "Mirror-bright silver. Stronger reflection across the reptile texture, deeper contrast against the black spinel.",
      price: 795,
      badge: "SIGNATURE",
    },
    matte: {
      name: "Matte",
      metal: "Sterling Silver — Matte",
      description:
        "Softened silver with a quieter surface. Controlled, matte presence — the spinel becomes the single point of light.",
      price: 795,
    },
  },

  // HERO MEDIA ORDER (per product brief):
  //   1. Autoplaying muted BAJAN JOE hero video
  //   2. Approved clean product render (front)
  //   3. Additional approved renders as gallery angles
  media: [
    {
      type: "video",
      src: HERO_VIDEO,
      poster: RENDER_FRONT,
      alt: "BAJAN JOE sterling-silver reptile signet ring with princess-cut black spinel — looping hero",
    },
    {
      type: "image",
      src: RENDER_FRONT,
      alt: "BAJAN JOE sterling-silver reptile signet ring with princess-cut black spinel — front view",
    },
    {
      type: "image",
      src: RENDER_ANGLE,
      alt: "BAJAN JOE sterling-silver reptile signet ring — three-quarter angle",
    },
    {
      type: "image",
      src: RENDER_ALT,
      alt: "BAJAN JOE sterling-silver reptile signet ring — front detail",
    },
    {
      type: "image",
      src: RENDER_PROFILE,
      alt: "BAJAN JOE — side profile showing the full reptile-textured shank",
    },
    {
      type: "image",
      src: LIFESTYLE_HAND,
      alt: "BAJAN JOE worn on the middle finger — close macro showing the ring in scale",
    },
    {
      type: "image",
      src: LIFESTYLE_BAR_HAND,
      alt: "BAJAN JOE worn at the bar — intimate hand rest on dark marble with warm bokeh",
    },
    {
      type: "image",
      src: LIFESTYLE_EDIT,
      alt: "BAJAN JOE styled with a black suit — full-body editorial",
    },
    {
      type: "image",
      src: PRESENTATION_BOX,
      alt: "BAJAN JOE presented top-down on a white ring pillow inside the PHILEON red presentation box",
    },
  ],

  story:
    "BAJAN JOE carries the authority of a traditional signet through a sharper PHILEON language. A substantial sterling-silver profile is wrapped in an all-over reptile texture and anchored by a deep black princess-cut spinel. Choose a high-polish finish for stronger reflection or matte silver for a quieter, more controlled presence. Heavy in appearance. Deliberate in detail. Sold individually.",

  specs: [
    "Sterling Silver · Black Spinel",
    "Reptile Texture · High Polish or Matte",
    "8 × 8 mm Princess-Cut Black Spinel (approx. 3.21 ct)",
    "Approx. 27.5 g · Size 11 Reference",
    "Weight and measurements are approximate and may vary according to ring size and normal production tolerances.",
    "Top length approx. 20.39 mm · Top width approx. 11.50 mm · Lower shank approx. 7.22 mm",
    "Sold individually",
  ],
};

export default function BajanJoeSignetRingPage() {
  return (
    <>
      <ProductSeo product={BAJAN_JOE_SEO} />
      <RingProductPage product={bajanJoeProduct} />
      <section
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '0 24px 96px',
        }}
      >
        <FineJewelryConfidence testId="bajan-joe-confidence" />
      </section>
    </>
  );
}
