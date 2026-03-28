import React from "react";
import RingProductPage from "../components/RingProductPage";
import { products } from "@/data/products";

// Get pricing from products.js
const lamarvaPricing = products.laMarva.pricing;

// La Marva Product Data (Ironclad Schema)
const laMarvaProduct = {
  id: "la-marva",
  name: "La Marva",
  category: "ring",
  sizeProfile: "ladies",
  collection: "Core Collection",
  tagline: "Soft in tone. Strong in spirit.",
  
  tiers: {
    foundation: {
      name: "Foundation",
      metal: "10K Yellow Gold",
      price: lamarvaPricing.foundation,
      badge: "",
      description: "10K gold with lab-grown princess-cut diamonds and genuine pink sapphire pavé."
    },
    signature: {
      name: "Signature",
      metal: "14K Yellow Gold",
      price: lamarvaPricing.heirloom14k,
      badge: "MOST POPULAR",
      description: "14K gold with natural princess-cut diamonds and pink sapphire pavé. Collector-grade clarity."
    },
    heirloom: {
      name: "Heirloom",
      metal: "18K Yellow Gold",
      price: lamarvaPricing.heirloom18k,
      badge: "COLLECTOR",
      description: "18K gold with natural diamonds. Maximum brilliance and lasting legacy."
    }
  },
  
  defaultTier: "signature",
  
  media: [
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg", 
      alt: "La Marva hero" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/c78rhhdk_Lamarva6.png", 
      alt: "La Marva close-up detail" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/2mmmt7rp_LaMarva8.png", 
      alt: "La Marva on hand" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/s5mgzzh2_Lamarva7.png", 
      alt: "La Marva side angle" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/x1l682uf_Lamarva5.jpeg", 
      alt: "La Marva underside detail" 
    }
  ],
  
  story: "La Marva is more than a ring. It is a tribute to legacy and devotion, crafted where structure meets softness, and power meets elegance. Named in honor of Marva Wilson — a woman whose strength, grace, and quiet presence left a lasting imprint on all who knew her. Every detail speaks to what endures: love, memory, and the stories that shape us.",
  
  specs: [
    "Princess-cut center diamonds",
    "Tapered emerald-cut side diamonds",
    "Pink sapphire pavé accent",
    "High polish finish",
    "Handcrafted setting"
  ]
};

export default function LaMarvaPage() {
  return <RingProductPage product={laMarvaProduct} />;
}
