export const products = {

  // ==========================================
  // LA MARVA
  // Flagship ring with dynamic gold pricing
  // Pricing keys: signature, foundation, heirloom14k, heirloom18k
  // ==========================================
  laMarva: {
    name: "La Marva",
    story: "Named in honor of Marva Wilson.",
    tribute: "Named in honor of Marva Wilson — a woman whose strength, grace, and quiet presence left a lasting imprint on all who knew her.",
    description: "La Marva is more than a ring. It is a tribute to legacy and devotion, crafted where structure meets softness, and power meets elegance.",
    
    // Dynamic Pricing Configuration
    baselineGoldUSD: 2650, // USD/oz when prices were locked
    adjustmentThresholdPct: 5, // Only adjust if gold moves > 5%
    dynamicPricing: true, // Enable dynamic gold-based pricing
    
    pricing: {
      signature: 3400,     // Silver + simulated stones
      foundation: 8000,    // 10K Gold + lab-grown stones
      heirloom14k: 18000,  // 14K Gold + natural diamonds
      heirloom18k: 22000   // 18K Gold + natural diamonds
    },
    tiers: [
      {
        name: "Foundation Edition",
        material: "10K Gold + lab-grown stones",
        pricingKey: "foundation",
        tag: "Most Popular",
        highlight: true,
        isHeirloom: false,
        consultation: false,
        specs: [
          "Lab-grown princess-cut center diamonds",
          "Lab-grown emerald-cut side diamonds",
          "Genuine pink sapphire pavé",
        ],
        finish: null,
        caratWeight: "Approx. 3.8 – 4.5 carats",
        diamondQuality: "VS clarity, F–G color",
        note: "Modern fine jewelry with ethical sourcing and premium brilliance.",
      },
      {
        name: "Signature Edition",
        material: "Silver + precision-set stones",
        pricingKey: "signature",
        tag: "",
        highlight: false,
        isHeirloom: false,
        consultation: false,
        specs: [
          "Precision-cut simulated center stones",
          "Synthetic pink sapphire pavé",
        ],
        finish: "High-polish luxury finish",
        caratWeight: "Approx. 2.8 – 3.2 carats (simulated)",
        diamondQuality: null,
        note: "Entry luxury with the full La Marva design aesthetic.",
      },
      {
        name: "Heirloom Edition (14K)",
        material: "14K Gold + natural diamonds",
        pricingKey: "heirloom14k",
        tag: "Atelier",
        highlight: false,
        isHeirloom: true,
        consultation: true,
        specs: [
          "Natural princess-cut center diamonds",
          "Natural emerald-cut side diamonds",
          "Pink sapphire and natural diamond pavé",
        ],
        finish: null,
        caratWeight: "Approx. 4.5 – 5.5 carats",
        diamondQuality: "VS clarity, E–F color",
        note: "Collector-grade luxury with exceptional color and brilliance.",
      },
      {
        name: "Heirloom Edition (18K)",
        material: "18K Gold + natural diamonds",
        pricingKey: "heirloom18k",
        tag: "Atelier",
        highlight: false,
        isHeirloom: true,
        consultation: true,
        specs: [
          "Natural princess-cut center diamonds",
          "Natural emerald-cut side diamonds",
          "Pink sapphire and natural diamond pavé",
        ],
        finish: null,
        caratWeight: "Approx. 4.5 – 5.5 carats",
        diamondQuality: "VS clarity, E–F color",
        note: "Collector-grade luxury with exceptional color and brilliance.",
      },
    ]
  },

  // ==========================================
  // ANNIE ROSE
  // Two-tier pricing: metal × stone type
  // Fixed pricing (no dynamic gold adjustments)
  // Pricing keys: lab.gold10k, lab.gold14k, lab.gold18k, natural.gold10k, natural.gold14k, natural.gold18k
  // ==========================================
  annieRose: {
    name: "Annie Rose",
    tribute: "Created in honor of my sister Andrea.",
    tagline: "Soft in tone. Strong in spirit.",
    metals: ["10K", "14K", "18K"],
    stones: ["Lab", "Natural"],
    
    // Pricing Configuration
    dynamicPricing: false, // Fixed pricing, no gold adjustments
    
    pricing: {
      lab: {
        gold10k: 6400,   // 10K Gold + Lab-Grown Diamonds
        gold14k: 7400,   // 14K Gold + Lab-Grown Diamonds
        gold18k: 8400    // 18K Gold + Lab-Grown Diamonds
      },
      natural: {
        gold10k: 8900,   // 10K Gold + Natural Diamonds
        gold14k: 10400,  // 14K Gold + Natural Diamonds
        gold18k: 12200   // 18K Gold + Natural Diamonds
      }
    }
  },

  // ==========================================
  // MONIKA COUTURE
  // Single-tier pricing by metal type
  // Fixed pricing (no dynamic gold adjustments)
  // Pricing keys: silver, white10k, yellow10k, rose10k
  // ==========================================
  monikaCouture: {
    name: "Monika Couture Earrings",
    weight: "10g per pair",
    
    // Pricing Configuration
    dynamicPricing: false, // Fixed pricing, no gold adjustments
    
    pricing: {
      silver: 1400,      // Sterling Silver
      white10k: 3700,    // 10K White Gold
      yellow10k: 3700,   // 10K Yellow Gold
      rose10k: 3700      // 10K Rose Gold
    }
  },

  // ==========================================
  // ALEJANDRA HEELS
  // Sculptural heel earrings with three-tier pricing
  // Fixed pricing (no dynamic gold adjustments)
  // Pricing keys: silver.cubic, plated.cubic, solid10k.lab, solid14k.lab
  // ==========================================
  alejandraHeels: {
    name: "Alejandra Heels",
    category: "Heel Earrings",
    description: "Sculptural miniature heels cast in precious metal and finished with a pavé strap.",
    tagline: "A playful couture design created to capture the spirit of fashion, movement, and confidence.",
    
    // Pricing Configuration
    dynamicPricing: false, // Fixed pricing, no gold adjustments
    
    // Material tiers
    tiers: ["Silver", "Gold Plated", "Solid Gold"],
    stones: ["Cubic", "Lab Diamonds"],
    
    pricing: {
      // Tier 1: Sterling Silver + Cubic Zirconia
      silver: {
        cubic: 1250
      },
      // Tier 2: Gold Plated Silver + Cubic Zirconia
      plated: {
        yellowCubic: 1450,
        roseCubic: 1450
      },
      // Tier 3: Solid Gold + Lab Diamonds
      solid10k: {
        whiteLab: 4800,
        yellowLab: 4800,
        roseLab: 4800
      },
      solid14k: {
        whiteLab: 5300,
        yellowLab: 5300,
        roseLab: 5300
      }
    }
  },

  // ==========================================
  // PTP CUFF
  // Power To The People - Sculptural cuff bracelet
  // Three edition tiers with fixed pricing (CAD)
  // Pricing keys: movement, signature, heirloom
  // ==========================================
  ptpCuff: {
    name: "PTP Cuff",
    subtitle: "PTP — Power To The People",
    category: "Cuff Bracelet",
    description: "The PTP Cuff transforms a universal symbol of unity into wearable sculpture. A procession of raised fists encircles the band — each one a tribute to collective strength and the power of people moving together.",
    tagline: "Bold, sculptural, and unapologetically symbolic, the cuff is designed to feel substantial on the wrist while maintaining a refined luxury finish.",
    
    // Pricing Configuration
    dynamicPricing: false, // Fixed pricing, no gold adjustments
    currency: "CAD",
    
    // Edition tiers
    editions: ["Movement", "Signature", "Heirloom"],
    
    pricing: {
      movement: 1050,    // Gold Vermeil (Sterling Silver base with heavy gold plating)
      signature: 4400,   // 10K Solid Gold
      heirloom: 8400     // 14K Solid Gold
    },
    
    // Edition details
    tiers: [
      {
        name: "Movement Edition",
        material: "Gold Vermeil",
        materialDetail: "Sterling silver base with heavy gold plating.",
        positioning: "Entry into the PTP design.",
        pricingKey: "movement",
        tag: "",
        highlight: false
      },
      {
        name: "Signature Edition",
        material: "10K Solid Gold",
        materialDetail: "Solid 10-karat gold construction.",
        positioning: "Best balance of weight and value.",
        pricingKey: "signature",
        tag: "Most Popular",
        highlight: true
      },
      {
        name: "Heirloom Edition",
        material: "14K Solid Gold",
        materialDetail: "Solid 14-karat gold for lasting legacy.",
        positioning: "Collector-level edition.",
        pricingKey: "heirloom",
        tag: "Collector",
        highlight: false
      }
    ],
    
    // Gallery images
    images: {
      hero: "https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/n1f04383_1000140851.jpg",
      angled: "https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/zxaoj5g6_1000140884.jpg",
      detail: "https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/1666v1g8_1000140951.jpg",
      lifestyle: "https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/5y6bu9xr_1000140979.jpg"
    }
  },

  // ==========================================
  // ROSARIA
  // Sculpted rose earrings in rose gold
  // Pricing pending - awaiting gram weight confirmation
  // ==========================================
  rosaria: {
    name: "Rosaria",
    subtitle: "The Rosaria Earrings",
    category: "Earrings",
    tagline: "Sculpted Roses in Rose Gold",
    description: "Rosaria captures the beauty of a rose in full bloom, transformed into wearable sculpture. Each rose is sculpted in precious metal and arranged in a cascading composition that moves gracefully with the wearer. The design preserves the elegance of a flower in gold — a tribute to love, celebration, and permanence.",
    materialNote: "Available exclusively in 10K and 14K rose gold.",
    
    // Pricing Configuration
    dynamicPricing: false,
    pricingPending: false,
    
    // Weight info
    weight: {
      perEarring: 8,
      perPair: 16,
      unit: "grams"
    },
    
    // Material options with fixed pricing (CAD)
    materials: [
      {
        name: "10K Rose Gold",
        karat: "10K",
        color: "Rose",
        pricingKey: "rose10k",
        price: 2950,
        currency: "CAD"
      },
      {
        name: "14K Rose Gold",
        karat: "14K",
        color: "Rose",
        pricingKey: "rose14k",
        price: 3250,
        currency: "CAD"
      }
    ],
    
    // Shipping info
    shipping: "Complimentary insured shipping within Canada.",
    
    // Gallery images
    images: {
      hero: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/uxgms0ee_1000098068.jpg",
      modelProfile: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/b2ssoabd_1000141452.jpg",
      onEar: "https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/8aqkuvvr_VideoCapture_20260312-012104.jpg",
      editorial: "https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/x1hffp1h_VideoCapture_20260312-012145.jpg",
      detail: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/eanzb6ck_1000141167.jpg",
      champagne: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/ujo9etr9_VideoCapture_20260313-195716.jpg"
    }
  },

  // ==========================================
  // DÉSIR CORSET PENDANT
  // Sculptural corset pendant in rose gold
  // ==========================================
  desirCorset: {
    name: "Désir Corset Pendant",
    subtitle: "Wearable Architecture",
    category: "Pendants",
    tagline: "Sculptural Form Meets Fine Jewelry",
    description: "Inspired by the structure of couture corsetry, the Désir Corset Pendant transforms sculpted form into wearable architecture. Fine mesh panels create depth and texture within a polished rose gold frame, forming a tapered waist and sculpted cup structure that echo the lines of high fashion tailoring. Designed to sit naturally against the chest, the pendant features subtle curvature and balanced proportions that allow the piece to hang elegantly from a delicate chain. A statement piece that blends sculpture, fashion, and fine jewelry.",
    
    // Pricing Configuration
    dynamicPricing: false,
    pricingPending: false,
    
    // Product specs
    specs: {
      height: "45 mm",
      width: "38 mm",
      weight: "12.5 grams",
      metal: "10K Rose Gold",
      construction: "Mesh corset architecture with sculpted frame",
      finish: "Hand polished and hand finished",
      chain: "Optional"
    },
    
    // Purchase options with chain variants
    options: [
      {
        name: "Pendant Only",
        pricingKey: "pendant-only",
        price: 5995,
        currency: "CAD",
        description: "Pendant without chain"
      },
      {
        name: "Pendant + 18\" Chain",
        pricingKey: "pendant-18-chain",
        price: 6990,
        currency: "CAD",
        description: "Includes 18 inch rose gold chain"
      },
      {
        name: "Pendant + 20\" Chain",
        pricingKey: "pendant-20-chain",
        price: 7090,
        currency: "CAD",
        description: "Includes 20 inch rose gold chain"
      }
    ],
    
    // Shipping info
    shipping: "Complimentary insured shipping within Canada.",
    
    // Gallery images
    images: {
      hero: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/sxr71rsz_1000141578.jpg",
      wornPortrait: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/p8urv2ow_1000141576.jpg",
      angledMannequin: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/ggmujqbm_1000141580.jpg",
      macroDetail1: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/rhmtewoy_1000141582.jpg",
      macroDetail2: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/um8j2fx0_1000141584.jpg",
      palmShot: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/4tdsmcrf_1000141598.jpg",
      inHand: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/4jwyuqgb_1000141600.jpg",
      rooftopLifestyle: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/9rl746mk_1000141602.jpg"
    }
  }

};
