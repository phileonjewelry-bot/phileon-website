import React from "react";
import EarringsProductPage from "../components/EarringsProductPage";

// TRACE Earrings Product Data
const traceProduct = {
  id: "trace",
  name: "TRACE",
  category: "earrings",
  collectionLabel: "PHILEON",

  tagline: "La trace de son corps",
  taglineTranslation: "The trace of her body",

  defaultTier: "signature",

  tiers: {
    foundation: {
      name: "Foundation",
      metal: "10K Gold Plated",
      price: 900,
      badge: "",
      description: "Gold plated over base metal."
    },
    signature: {
      name: "Signature",
      metal: "10K Yellow Gold",
      price: 2600,
      badge: "MOST POPULAR",
      description: "Refined form."
    },
    heirloom: {
      name: "Heirloom",
      metal: "14K Yellow Gold",
      price: 3200,
      badge: "COLLECTOR",
      description: "Elevated density and finish."
    }
  },

  media: [
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/1owcvzg5_1000143757.png",
      alt: "TRACE earrings - model front"
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rmlc16hn_1000143760.png",
      alt: "TRACE earrings - model profile"
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/s9no0imj_1000143769.png",
      alt: "TRACE earrings - angled"
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/7tyc41kp_1000143768.png",
      alt: "TRACE earrings - pair on black"
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/ti2k1273_1000143767.png",
      alt: "TRACE earrings - single on grey"
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/n8ykgvhb_1000143764.png",
      alt: "TRACE earrings - single on dark"
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/nt7j2fwd_1000143773.png",
      alt: "TRACE earrings - ear wire detail"
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/hl61ok5r_1000143771.png",
      alt: "TRACE earrings - macro detail"
    }
  ],

  story: `A form remembered in motion.
Not drawn — felt.

TRACE captures the natural lines of the body, suspended in space.
Light passes through it. Shape defines it.

Nothing added. Nothing forced.
Only what remains.`,

  specs: [
    "Approx. 45mm x 21–22mm",
    "5.5–6.5g (pair)",
    "High polish finish",
    "Open wireframe construction",
    "French hook ear wire with jump ring connection"
  ],

  specsImage: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/xxhobbp3_1000143831.png"
};

export default function TracePage() {
  return <EarringsProductPage product={traceProduct} />;
}
