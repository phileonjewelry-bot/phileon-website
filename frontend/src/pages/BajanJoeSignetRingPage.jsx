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

// Approved BAJAN JOE assets (public artifact URLs, unmodified).
const HERO_VIDEO   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/u0p08dq0_VID-20260803-WA00241.mp4";
const RENDER_FRONT = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/p0nvtaur_1000168342.png";
const RENDER_ANGLE = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/mb9ie3g5_1000168343.png";
const RENDER_ALT   = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/o8yxeh08_1000168344.png";

const bajanJoeProduct = {
  id: "bajan-joe",
  slug: "bajan-joe",
  name: "BAJAN JOE",
  tagline: "Black Spinel Reptile Signet.",
  collection: "PHILEON Fine Jewelry",
  sizeProfile: "gents",
  defaultTier: "polish",

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
  return <RingProductPage product={bajanJoeProduct} />;
}
