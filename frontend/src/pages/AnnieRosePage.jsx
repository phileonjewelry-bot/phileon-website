import React from "react";
import RingProductPage from "../components/RingProductPage";
import { products } from "@/data/products";

// Get pricing from products.js
const annieRosePricing = products.annieRose.pricing;

// Annie Rose Product Data (Ironclad Schema)
const annieRoseProduct = {
  id: "annie-rose",
  name: "Annie Rose",
  category: "ring",
  sizeProfile: "ladies",
  collection: "Featured Drop",
  currency: "CAD",
  tagline: "Soft in tone. Strong in spirit.",
  
  tiers: {
    foundation: {
      name: "Foundation",
      metal: "10K Yellow Gold",
      price: annieRosePricing.lab.gold10k,
      badge: "",
      description: "10K gold with lab-grown diamonds. Ethical brilliance for everyday elegance."
    },
    signature: {
      name: "Signature",
      metal: "14K Yellow Gold",
      price: annieRosePricing.natural.gold14k,
      badge: "MOST POPULAR",
      description: "14K gold with natural diamonds. Balanced weight with elevated clarity."
    },
    heirloom: {
      name: "Heirloom",
      metal: "18K Yellow Gold",
      price: annieRosePricing.natural.gold18k,
      badge: "COLLECTOR",
      description: "18K gold with natural diamonds. Maximum richness and permanence."
    }
  },
  
  defaultTier: "signature",
  
  media: [
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg", 
      alt: "Annie Rose hero" 
    },
    { 
      type: "video", 
      src: "https://customer-assets.emergentagent.com/job_phileon-jewelry/artifacts/ppw8w9p8_AnnieRosevid1-1.mp4", 
      poster: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg",
      alt: "Annie Rose video" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/0yvpka9u_1000139046.png", 
      alt: "Annie Rose studio detail" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/fw381q3d_1000139289.png", 
      alt: "Annie Rose proposal moment" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/1sukhrao_1000139284.png", 
      alt: "Annie Rose on hand" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/kvn5m3ac_1000139303.jpg", 
      alt: "Annie Rose close-up" 
    }
  ],
  
  story: "Created in honor of my sister Andrea. Annie Rose captures the delicate balance between strength and softness — a ring that speaks to those who carry grace in every gesture. Each piece is crafted to preserve this spirit, designed for moments that matter.",
  
  specs: [
    "Center diamond setting",
    "Rose-inspired halo design",
    "Pavé diamond band",
    "High polish finish",
    "Handcrafted setting"
  ]
};

export default function AnnieRosePage() {
  return <RingProductPage product={annieRoseProduct} />;
}
