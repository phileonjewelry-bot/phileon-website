import React from "react";
import RingProductPage from "../components/RingProductPage";
import { products } from "@/data/products";

/**
 * PARABOLA — Ladies First · Concave Statement Ring
 *
 * 22 mm face diameter, deep concave dish silhouette (not a dome).
 * Approx 15.5 mm total height. Approx 178 stones. Ring size 7 default.
 *
 * Hero: video (autoplay, loop, muted, playsInline, no controls, object-contain).
 * `RingProductPage` already renders the hero video with the exact discipline
 * we need — see `<video autoPlay muted loop playsInline>` at line ~97 with
 * `object-contain` so the full dish + rim + shank are preserved (never cropped).
 *
 * If a hero video is not yet available, comment out the first `media` entry
 * and the top-down image becomes the primary hero automatically.
 */
const parabolaPricing = products.parabola.pricing;

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
    },
    whiteGold10k: {
      name: "White Gold",
      metal: "10K White Gold",
      price: parabolaPricing.whiteGold10k,
      badge: "SIGNATURE",
      description:
        "10K White Gold with genuine pink sapphires, white diamonds, and champagne diamonds. $7,800 CAD.",
    },
    roseGold10k: {
      name: "Rose Gold",
      metal: "10K Rose Gold",
      price: parabolaPricing.roseGold10k,
      badge: "COLLECTOR",
      description:
        "10K Rose Gold with genuine pink sapphires, white diamonds, and champagne diamonds. $7,800 CAD.",
    },
  },

  defaultTier: "whiteGold10k",

  // Hero media — video first (autoplay/muted/loop/playsInline handled by
  // RingProductPage). Poster falls back to the 3/4-angle hero image so the
  // full ring reads immediately before the video decodes.
  media: [
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
  ],

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
