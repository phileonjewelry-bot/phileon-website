import React from "react";
import RingProductPage from "../components/RingProductPage";
import { products } from "@/data/products";

// Approved OVATION assets — yellow-gold ribbed stackable rings.
// Same visual language used across every metal tier until dedicated white-gold
// and silver assets are supplied.
const HERO = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/pl6at891_1000166845.png"; // 3-ring leaning stack on light marble
const IMG_DARK_STACK = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/tf63q0bx_1000166838.jpg"; // stack on dark stone
const IMG_HAND = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/whnl770o_1000166839.png"; // worn stack on finger
const IMG_SINGLE = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/dkvs1fm4_1000166780.png"; // single ribbed ring on wood
// Black-marble editorial series — single ring, four angles
const IMG_BLACK_ANGLE = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ohlxhee8_1000167004.png"; // 3/4 angle, interior visible
const IMG_BLACK_PROFILE = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/atkej09z_1000167002.png"; // profile with reflection
const IMG_BLACK_TOP = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/1sm493bw_1000167001.png"; // overhead top-down
const IMG_BLACK_MACRO = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/d21b2emv_1000167003.png"; // macro close-up

const ovationPricing = products.ovationRibbedRing.pricing;

// Fine-Jewelry ring product data — 7 metal/karat tiers mirroring the sitewide
// metal + karat selector pattern already used by other multi-tier rings.
// Ring size is required at Add-to-Cart via the shared RingSizeSelector.
const ovationProduct = {
  id: "ovation",
  slug: "ovation",
  name: "OVATION",
  bandWidthMm: 8, // 7–9 mm range — pricing reference width ~8 mm
  category: "ring",
  sizeProfile: "unisex", // stackable ring, unisex sizing
  collection: "PHILEON Fine Jewelry",
  tagline: "One was never the point.",

  tiers: {
    silver: {
      name: "Sterling Silver",
      metal: "Sterling Silver",
      price: ovationPricing.silver,
      badge: "",
      description: "Sterling silver with high-polish exterior and hollow comfort-fit interior.",
    },
    yellow10k: {
      name: "10K Yellow Gold",
      metal: "10K Yellow Gold",
      price: ovationPricing.yellow10k,
      badge: "MOST POPULAR",
      description: "10K yellow gold — the everyday-luxury stacking weight.",
    },
    white10k: {
      name: "10K White Gold",
      metal: "10K White Gold",
      price: ovationPricing.white10k,
      badge: "",
      description: "10K white gold with cool-tone brilliance and comfort-fit interior.",
    },
    yellow14k: {
      name: "14K Yellow Gold",
      metal: "14K Yellow Gold",
      price: ovationPricing.yellow14k,
      badge: "",
      description: "14K yellow gold — richer warmth and denser hand-feel while remaining stackable.",
    },
    white14k: {
      name: "14K White Gold",
      metal: "14K White Gold",
      price: ovationPricing.white14k,
      badge: "",
      description: "14K white gold — brighter surface with heirloom-grade durability.",
    },
    yellow18k: {
      name: "18K Yellow Gold",
      metal: "18K Yellow Gold",
      price: ovationPricing.yellow18k,
      badge: "COLLECTOR",
      description: "18K yellow gold — highest gold content, deepest warmth, maximum presence.",
    },
    white18k: {
      name: "18K White Gold",
      metal: "18K White Gold",
      price: ovationPricing.white18k,
      badge: "COLLECTOR",
      description: "18K white gold — the definitive white-gold finish for the OVATION stack.",
    },
  },

  defaultTier: "yellow10k",

  media: [
    { type: "image", src: HERO, alt: "Three OVATION ribbed yellow-gold rings styled in a leaning stack on light marble — hero" },
    { type: "image", src: IMG_HAND, alt: "OVATION ribbed rings worn stacked on the finger — scale and stacking" },
    { type: "image", src: IMG_BLACK_ANGLE, alt: "Single OVATION ribbed ring, three-quarter angle on black marble" },
    { type: "image", src: IMG_BLACK_PROFILE, alt: "Single OVATION ribbed ring, upright profile on black marble" },
    { type: "image", src: IMG_BLACK_TOP, alt: "Single OVATION ribbed ring, top-down view on black marble" },
    { type: "image", src: IMG_BLACK_MACRO, alt: "Single OVATION ribbed ring, close-up ribbed macro on black marble" },
    { type: "image", src: IMG_DARK_STACK, alt: "OVATION ribbed rings stacked on dark stone with reflection" },
    { type: "image", src: IMG_SINGLE, alt: "Single OVATION ribbed ring, craftsmanship macro on wood workbench" },
  ],

  story:
    "OVATION turns repetition into presence. A wide, polished ribbed band shaped to stand confidently on its own or build into a stronger stacked statement. Its hollow construction preserves the sculptural volume while creating a lighter feel on the hand. Wear one as punctuation. Stack another for the response. Sold individually.",

  specs: [
    "Approx. band width: 7–9 mm (pricing reference ~8 mm)",
    "Approx. maximum profile height: 4 mm",
    "Approx. hollow wall thickness: 0.9 mm",
    "Smooth comfort-fit interior",
    "High-polish exterior",
    "No stones — hollow construction for substantial appearance with lighter feel",
    "Sold individually — the hero shows three rings as styling only",
  ],
};

export default function OvationRibbedRingPage() {
  return <RingProductPage product={ovationProduct} />;
}
