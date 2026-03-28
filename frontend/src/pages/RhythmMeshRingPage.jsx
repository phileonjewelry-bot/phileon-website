import React from "react";
import RingProductPage from "../components/RingProductPage";
import { products } from "@/data/products";

// Get pricing from products.js
const rhythmPricing = products.rhythmMeshRing.pricing;

// Rhythm Mesh Ring Product Data (Ironclad Schema)
// Note: This is a unisex ring, using gents size profile as default
const rhythmMeshProduct = {
  id: "rhythm-mesh-ring",
  name: "Rhythm Mesh",
  category: "ring",
  sizeProfile: "gents", // Unisex ring, gents sizes as default
  collection: "Unisex Collection",
  tagline: "Structured motion. Captured in metal.",
  
  tiers: {
    foundation: {
      name: "Foundation",
      metal: "Sterling Silver",
      price: rhythmPricing.silver,
      badge: "",
      description: "Sterling silver with emerald-cut citrine. Entry into the Rhythm Mesh aesthetic."
    },
    signature: {
      name: "Signature",
      metal: "10K White Gold",
      price: rhythmPricing.white10k,
      badge: "MOST POPULAR",
      description: "10K white gold with emerald-cut citrine. Balanced weight with elevated finish."
    },
    heirloom: {
      name: "Heirloom",
      metal: "14K White Gold",
      price: 6400,
      badge: "COLLECTOR",
      description: "14K white gold with emerald-cut citrine. Maximum presence and permanence."
    }
  },
  
  defaultTier: "signature",
  
  media: [
    { 
      type: "video", 
      src: "https://customer-assets.emergentagent.com/job_b18523eb-3184-4ba4-8ef3-cdebf4fafd5f/artifacts/9qioc0r2_XiaoYing_Video_1774325825434.mp4",
      poster: "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/nhkjujpb_1000143088.jpg",
      alt: "Rhythm Mesh video" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/nhkjujpb_1000143088.jpg", 
      alt: "Rhythm Mesh hero" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/fkn1jc4h_1000143079.jpg", 
      alt: "Rhythm Mesh angled view" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/5sgfwfn0_1000143092.jpg", 
      alt: "Rhythm Mesh detail" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/xjxr3blo_1000143315.png", 
      alt: "Rhythm Mesh lifestyle" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_b18523eb-3184-4ba4-8ef3-cdebf4fafd5f/artifacts/gjwk27lz_1000143314.png", 
      alt: "Rhythm Mesh drink lifestyle" 
    }
  ],
  
  story: "Rhythm Mesh captures the essence of structured motion — an intricate mesh-textured band crowned with a stunning emerald-cut citrine. The architectural pattern creates a captivating interplay of light and shadow, while micro-pavé prongs secure the centerpiece with precision elegance. Designed for those who move with intention.",
  
  specs: [
    "Emerald-cut citrine center stone",
    "Architectural mesh band texture",
    "Micro-pavé prong setting",
    "High polish finish",
    "Unisex sizing available"
  ]
};

export default function RhythmMeshRingPage() {
  return <RingProductPage product={rhythmMeshProduct} />;
}
