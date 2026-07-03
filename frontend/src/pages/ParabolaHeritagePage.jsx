import React from "react";
import RingProductPage from "../components/RingProductPage";
import { products } from "@/data/products";

/**
 * PARABOLA HERITAGE — Gentleman's Club · Concave Statement Ring
 *
 * Same master ring architecture as PARABOLA:
 *   • 22 mm concave dish, deep dish profile, knife-edge rim
 *   • Concentric pavé rows, lightweight engineered gallery, clean shank
 *
 * Heritage stone palette (moves inward through the dish):
 *   • Outer field: red rubies
 *   • Second field: yellow stones
 *   • Third field: green emeralds
 *   • Center: black diamonds
 *
 * Metal selector drives the gallery:
 *   • Sterling Silver + 10K White Gold  →  white-metal Heritage gallery
 *   • 10K Yellow Gold                   →  yellow-gold Heritage gallery (default)
 *
 * Pricing (mirrors PARABOLA family):
 *   • Sterling Silver : $1,250 USD  (premium synthetic red / yellow / green / black stones)
 *   • 10K White Gold  : $7,800 CAD  (genuine rubies, yellow stones, emeralds, black diamonds)
 *   • 10K Yellow Gold : $7,800 CAD  (genuine rubies, yellow stones, emeralds, black diamonds) — default
 *
 * Default ring size: US 10. Add-to-cart captures product / metal / size /
 * exact price / SKU via `RingProductPage`'s standard wiring.
 */
const heritagePricing = products.parabolaHeritage.pricing;

/* Yellow-gold gallery (default) — hero, ceremonial front, on-hand, macro. */
const yellowGoldGallery = [
  {
    type: "image",
    src: "/parabola-heritage/img-03-front.png",
    alt: "PARABOLA HERITAGE — front-facing hand-held studio portrait, the concentric ruby / yellow / emerald / black diamond fields set into a warm yellow gold bezel.",
  },
  {
    type: "image",
    src: "/parabola-heritage/img-04-onhand.png",
    alt: "PARABOLA HERITAGE — on-hand lifestyle shot, the 22 mm dish sitting on the finger with the ruby outer band framing the ceremonial concentric field.",
  },
  {
    type: "image",
    src: "/parabola-heritage/img-05-macro.png",
    alt: "PARABOLA HERITAGE — extreme macro into the concave center, black diamonds gathering into the sunken well beneath the emerald, yellow, and ruby rings.",
  },
];

/* White-metal Heritage gallery — Sterling Silver + 10K White Gold share this set. */
const whiteMetalGallery = [
  {
    type: "image",
    src: "/parabola-heritage/img-01-profile.png",
    alt: "PARABOLA HERITAGE — 3/4 profile studio portrait, the concave dish set on a polished white-metal shank with the engineered gallery visible beneath.",
  },
  {
    type: "image",
    src: "/parabola-heritage/img-02-topdown.png",
    alt: "PARABOLA HERITAGE — top-down composition on a white-metal shank, revealing the ruby / yellow / emerald / black diamond concentric fields around the concave well.",
  },
  {
    type: "image",
    src: "/parabola-heritage/img-05-macro.png",
    alt: "PARABOLA HERITAGE — extreme macro into the concave center, black diamonds gathering into the sunken well beneath the emerald, yellow, and ruby rings.",
  },
];

const parabolaHeritageProduct = {
  id: "parabolaHeritage",
  name: "PARABOLA HERITAGE",
  slug: "parabola-heritage",
  category: "ring",
  sizeProfile: "gents",
  collection: "Gentleman's Club",
  tagline: "Built to outlast its first owner.",

  tiers: {
    sterling: {
      name: "Sterling",
      metal: "Sterling Silver",
      price: heritagePricing.sterling,
      badge: "",
      description:
        "Sterling Silver setting with premium synthetic red, yellow, green, and black stones. $1,250 USD.",
      media: whiteMetalGallery,
    },
    whiteGold10k: {
      name: "White Gold",
      metal: "10K White Gold",
      price: heritagePricing.whiteGold10k,
      badge: "SIGNATURE",
      description:
        "10K White Gold with genuine rubies, yellow stones, emeralds, and black diamonds. $7,800 CAD.",
      media: whiteMetalGallery,
    },
    yellowGold10k: {
      name: "Yellow Gold",
      metal: "10K Yellow Gold",
      price: heritagePricing.yellowGold10k,
      badge: "HERITAGE",
      description:
        "10K Yellow Gold with genuine rubies, yellow stones, emeralds, and black diamonds. $7,800 CAD.",
      media: yellowGoldGallery,
    },
  },

  defaultTier: "yellowGold10k",
  defaultRingSize: "10",

  // Product-level fallback gallery — yellow gold reads as the Heritage signature.
  media: yellowGoldGallery,

  story:
    "PARABOLA HERITAGE carries the same concave architecture as PARABOLA, but with a stronger ancestral palette.\n\n" +
    "Rubies, yellow stones, emeralds, and black diamonds move inward through the dish, creating a ceremonial field of color and shadow. " +
    "The ring keeps the same engineered lightness and architectural curve, but the presence is deeper, bolder, and more grounded.\n\n" +
    "This is not a separate shape. This is the Heritage expression of the PARABOLA family.",

  specs: [
    "22 mm face diameter",
    "Deep concave dish profile (not a dome)",
    "Same master architecture as PARABOLA",
    "Concentric pavé rows",
    "Ruby outer field · yellow second field · emerald third field · black diamond center",
    "Knife-edge outer rim",
    "Clean minimalist shank",
    "Lightweight engineered gallery",
    "Ring size 10 default",
  ],
};

export default function ParabolaHeritagePage() {
  return <RingProductPage product={parabolaHeritageProduct} />;
}
