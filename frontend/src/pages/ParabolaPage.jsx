import React from "react";
import RingProductPage from "../components/RingProductPage";
import { products } from "@/data/products";

/**
 * PARABOLA — Ladies First · Concave Statement Ring
 *
 * 22 mm face diameter, deep concave dish silhouette (not a dome).
 * Approx 15.5 mm total height. Approx 178 stones. Ring size 7 default.
 *
 * Metal selector (tier system) drives the gallery:
 *   • Sterling Silver + 10K White Gold  →  white-metal gallery
 *   • 10K Rose Gold                     →  rose-gold gallery (default)
 *
 * Pricing:
 *   • Sterling Silver : $1,250 USD
 *   • 10K White Gold  : $7,800 CAD
 *   • 10K Rose Gold   : $7,800 CAD (default)
 *
 * Add-to-cart captures product, selected metal, selected size, exact price,
 * and a variant SKU via `RingProductPage`'s standard cart wiring.
 */
const parabolaPricing = products.parabola.pricing;

/* Shared hero film — same asset used by PARABOLA ATELIER (Inspiration Vault).
   Referenced by path, never duplicated. Audio pre-stripped for silent autoplay. */
const HERO_FILM = {
  type: "video",
  src: "/inspiration-vault/parabola-atelier/hero-film.mp4",
  poster: "/inspiration-vault/parabola-atelier/hero-film-poster.jpg",
  alt: "PARABOLA — architectural concave dish hero film, silent autoplay preserving the full ring composition.",
};

/* Rose-gold gallery (default) — hero image + 4 supporting angles. */
const roseGoldGallery = [
  HERO_FILM,
  {
    type: "image",
    src: "/parabola/hero.png",
    alt: "PARABOLA — 3/4 studio portrait, the concave dish revealing pink sapphire rim, white and champagne diamond concentric fields, and rose gold shank.",
  },
  {
    type: "image",
    src: "/parabola/top-down.png",
    alt: "PARABOLA — top-down view, the sunken center reads as a bowl of light with pink sapphire rim, white diamond concentric rows, and champagne diamond core.",
  },
  {
    type: "image",
    src: "/parabola/profile.png",
    alt: "PARABOLA — profile view revealing the deep concave dish curvature, knife-edge outer rim, and clean minimalist shank.",
  },
  {
    type: "image",
    src: "/parabola/back.png",
    alt: "PARABOLA — reverse view showing the lightweight engineered pavé under-gallery and shank architecture.",
  },
  {
    type: "image",
    src: "/parabola/macro.png",
    alt: "PARABOLA — extreme macro of the pink sapphire outer rim into the white diamond and champagne diamond concentric pavé fields.",
  },
  {
    type: "image",
    src: "/parabola/lifestyle-hand.jpg",
    alt: "PARABOLA — on-hand studio shot, the 22 mm rose gold dish reading as a saucer of light across the finger, pink sapphire rim glowing warm against the skin.",
  },
];

/* White-metal gallery — Sterling Silver + 10K White Gold share this set. */
const whiteMetalGallery = [
  HERO_FILM,
  {
    type: "image",
    src: "/parabola/white-metal/wm-01.png",
    alt: "PARABOLA — white-metal 3/4 studio portrait, the concave dish resting on a polished silver shank, pink sapphire rim collecting the light.",
  },
  {
    type: "image",
    src: "/parabola/white-metal/wm-02.png",
    alt: "PARABOLA — white-metal front elevation, the pink sapphire outer band framing the white diamond field with a champagne diamond center.",
  },
  {
    type: "image",
    src: "/parabola/white-metal/wm-03.png",
    alt: "PARABOLA — white-metal reverse portrait, the engineered pavé under-gallery visible through the split shank.",
  },
  {
    type: "image",
    src: "/parabola/white-metal/wm-04.png",
    alt: "PARABOLA — white-metal macro of the shank rise and pavé under-gallery, revealing the concave dish support architecture.",
  },
  {
    type: "image",
    src: "/parabola/white-metal/wm-05.png",
    alt: "PARABOLA — white-metal top-down composition, the concentric fields reading as a bowl of light gathered inside the pink sapphire rim.",
  },
  {
    type: "image",
    src: "/parabola/white-metal/lifestyle-hand.jpg",
    alt: "PARABOLA — white-metal on-hand studio shot, the 22 mm dish resting across the finger, silvery bezel edge glinting under low light against the pink sapphire outer rim.",
  },
];

const parabolaProduct = {
  id: "parabola",
  name: "PARABOLA",
  slug: "parabola",
  category: "ring",
  sizeProfile: "ladies",
  collection: "Ladies First",
  tagline: "Some jewelry reflects light. PARABOLA collects it.",

  tiers: {
    sterling: {
      name: "Sterling",
      metal: "Sterling Silver",
      price: parabolaPricing.sterling,
      badge: "",
      description:
        "Sterling Silver setting with premium synthetic pink sapphires, premium synthetic white stones, and premium synthetic champagne stones. $1,250 USD.",
      media: whiteMetalGallery,
    },
    whiteGold10k: {
      name: "White Gold",
      metal: "10K White Gold",
      price: parabolaPricing.whiteGold10k,
      badge: "SIGNATURE",
      description:
        "10K White Gold with genuine pink sapphires, white diamonds, and champagne diamonds. $7,800 CAD.",
      media: whiteMetalGallery,
    },
    roseGold10k: {
      name: "Rose Gold",
      metal: "10K Rose Gold",
      price: parabolaPricing.roseGold10k,
      badge: "COLLECTOR",
      description:
        "10K Rose Gold with genuine pink sapphires, white diamonds, and champagne diamonds. $7,800 CAD.",
      media: roseGoldGallery,
    },
  },

  defaultTier: "sterling",

  // Prominent hero — enlarges the media column by ~18% for PARABOLA (Ladies
  // First) so the concave dish reads larger on first load. Never applied to
  // other products; PARABOLA HERITAGE and every other ring page remain
  // untouched.
  prominentHero: true,

  // Product-level fallback gallery (rose gold reads as the signature look
  // whenever the tier-scoped `media` is not resolved yet).
  media: roseGoldGallery,

  // Family cross-link — quiet editorial connector to the Gentleman's Club
  // expression of the same master architecture.
  crossLink: {
    to: "/parabola-heritage",
    label: "Discover the Heritage expression",
  },

  // Lineage caption — appears only when the hero video slot is active on
  // PARABOLA. Quiet gold, connects the production piece back to the
  // Inspiration Vault study that inspired it.
  lineageCaption: {
    to: "/parabola-atelier",
    label: "Discover the original study",
  },

  // PARABOLA family nav — renders the shared collection strip with this
  // page marked active. Only PARABOLA / PARABOLA HERITAGE / PARABOLA ATELIER
  // expose this key.
  parabolaFamily: "ladies-first",

  story:
    "Light does not simply strike its surface. It gathers within it. " +
    "PARABOLA curves inward instead of rising outward, forming a concave field of pink sapphires, white diamonds, and champagne diamonds. " +
    "The eye is drawn toward the sunken center, where the geometry becomes the signature. " +
    "Large in presence but engineered to feel light, PARABOLA transforms a simple curve into a PHILEON statement.",

  specs: [
    "22 mm face diameter",
    "Deep concave dish profile (not a dome)",
    "Approx. 15.5 mm total height",
    "Approx. 178 stones",
    "Concentric pavé rows",
    "Knife-edge outer rim",
    "Clean minimalist shank",
    "Lightweight engineered support",
    "Ring size 7 default",
  ],
};

export default function ParabolaPage() {
  return <RingProductPage product={parabolaProduct} />;
}
