import React from "react";
import RingProductPage from "../components/RingProductPage";
import { products } from "@/data/products";

// Get pricing from products.js
const tolaIIPricing = products.tolaII.pricing;

// TOLA II Product Data (Ironclad Schema)
const tolaIIProduct = {
  id: "tola-ii",
  name: "TOLA II",
  category: "ring",
  sizeProfile: "gents",
  collection: "The TOLA Collection",
  currency: "CAD",
  tagline: "Weight. Discipline. Presence.",
  
  tiers: {
    foundation: {
      name: "Foundation",
      metal: "10K Yellow Gold",
      price: tolaIIPricing.foundation,
      badge: "",
      description: "10K yellow gold with black synthetic stones. Built for everyday presence."
    },
    signature: {
      name: "Signature",
      metal: "14K Yellow Gold",
      price: tolaIIPricing.signature,
      badge: "MOST POPULAR",
      description: "14K yellow gold with black lab-grown diamonds. Balanced weight and clarity."
    },
    heirloom: {
      name: "Heirloom",
      metal: "18K Yellow Gold",
      price: tolaIIPricing.heirloom,
      badge: "COLLECTOR",
      description: "18K yellow gold with natural black diamonds. Maximum richness and permanence."
    }
  },
  
  defaultTier: "signature",
  
  media: [
    { 
      type: "video", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/29wd5jby_XiaoYing_Video_1774562301628.mp4", 
      poster: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png", 
      alt: "TOLA II hero" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/sm6c4t2r_1000143432.png", 
      alt: "TOLA II front" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/ipu9le7o_1000141790.png", 
      alt: "TOLA II side profile" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/m0g80wsc_1000143416.png", 
      alt: "TOLA II detail" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/1ta12tya_1000143385.png", 
      alt: "TOLA II lifestyle" 
    }
  ],
  
  story: "TOLA II is built on restraint and control. A structured gold form, anchored by a central chain and framed with precision-set black stones. Every surface is intentional. Every detail holds weight.",
  
  specs: [
    "Approx. top width: 12–13mm",
    "Approx. band width: 3–4mm",
    "Structured pavé setting",
    "High polish finish",
    "Engineered gold weight for balance and presence"
  ]
};

export default function TolaIIPage() {
  return <RingProductPage product={tolaIIProduct} />;
}
