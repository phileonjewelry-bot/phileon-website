import React from "react";
import PendantProductPage from "../components/PendantProductPage";

// GALATIANS 6:14 Product Data (Ironclad Schema for Pendants)
const galatians614Product = {
  id: "galatians-614",
  name: "GALATIANS 6:14",
  category: "pendant",
  collectionLabel: "PHILEON",

  tagline: "Faith, Worn With Intention.",
  subline: "Built on Belief.",

  defaultTier: "signature",

  tiers: {
    foundation: {
      name: "Foundation",
      metal: "10K Yellow Gold",
      price: 3800,
      badge: "",
      description: "10K yellow gold. Built for everyday presence."
    },
    signature: {
      name: "Signature",
      metal: "14K Yellow Gold",
      price: 4800,
      badge: "MOST POPULAR",
      description: "14K yellow gold. Balanced weight and clarity."
    },
    heirloom: {
      name: "Heirloom",
      metal: "18K Yellow Gold",
      price: 6400,
      badge: "COLLECTOR",
      description: "18K yellow gold. Maximum richness and permanence."
    }
  },

  // Media with actual uploaded images
  media: [
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/dx5ms8j2_1000143661.png", 
      alt: "GALATIANS 6:14 Hero" 
    },
    { 
      type: "image", 
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/cks161k0_1000143667.png", 
      alt: "GALATIANS 6:14 Macro detail" 
    }
  ],

  story: `This piece is anchored in Galatians 6:14.

Not for display.
Not for approval.

The cross stands as a reminder of what is carried, not what is shown.

Every detail is intentional.
Every surface holds meaning.

Built on belief.`,

  specs: [
    "Solid gold construction",
    "High polish center cross",
    "Engraved texture detailing",
    "High polish finish",
    "Designed for centered wear"
  ]
};

export default function Galatians614Page() {
  return <PendantProductPage product={galatians614Product} />;
}
