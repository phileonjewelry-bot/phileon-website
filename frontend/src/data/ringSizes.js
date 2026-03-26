/* =========================================================
   PHILEON — SITE-WIDE RING PRODUCT STANDARD (IRONCLAD)
   Apply this to ALL ring pages only.
   Do NOT use for cuffs, earrings, pendants, or chains.
   ========================================================= */

/* =========================
   1) GLOBAL SIZE PROFILES
   ========================= */

export const ringSizeProfiles = {
  ladies: {
    label: "Ladies",
    sizes: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9],
    customRule:
      "Sizes below 4 or above 9 are custom made and may require additional production time."
  },
  gents: {
    label: "Gents",
    sizes: [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    customRule:
      "Sizes below 6 or above 12 are custom made and may require additional production time."
  }
};

/* =========================================================
   2) EVERY RING PRODUCT MUST INCLUDE THESE FIELDS
   Add these to each ring in products.js / product data.
   =========================================================

{
  id: "tola-ii",
  name: "TOLA II",
  category: "ring",
  sizeProfile: "gents", // "gents" or "ladies"
  tagline: "Weight. Discipline. Presence.",
  tiers: {
    foundation: {
      name: "Foundation",
      metal: "10K Yellow Gold",
      price: 5200,
      badge: "",
      description: "10K yellow gold with black synthetic stones. Built for everyday presence."
    },
    signature: {
      name: "Signature",
      metal: "14K Yellow Gold",
      price: 6800,
      badge: "MOST POPULAR",
      description: "14K yellow gold with black lab-grown diamonds. Balanced weight and clarity."
    },
    heirloom: {
      name: "Heirloom",
      metal: "18K Yellow Gold",
      price: 9200,
      badge: "COLLECTOR",
      description: "18K yellow gold with natural black diamonds. Maximum richness and permanence."
    }
  },
  defaultTier: "signature",
  media: [
    { type: "video", src: "/videos/tola-ii.mp4", poster: "/images/tola-hero.jpg" },
    { type: "image", src: "/images/tola-hero.jpg", alt: "TOLA II hero" },
    { type: "image", src: "/images/tola-front-black.jpg", alt: "TOLA II front" },
    { type: "image", src: "/images/tola-side.jpg", alt: "TOLA II side profile" },
    { type: "image", src: "/images/tola-detail.jpg", alt: "TOLA II detail" },
    { type: "image", src: "/images/tola-lifestyle.jpg", alt: "TOLA II lifestyle" }
  ],
  story:
    "TOLA II is built on restraint and control. A structured gold form, anchored by a central chain and framed with precision-set black stones. Every surface is intentional. Every detail holds weight.",
  specs: [
    "Approx. top width: 12–13mm",
    "Approx. band width: 3–4mm",
    "Structured pavé setting",
    "High polish finish",
    "Engineered gold weight for balance and presence"
  ]
}

========================================================= */
