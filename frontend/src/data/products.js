export const products = {

  // ==========================================
  // LA MARVA
  // Flagship ring with dynamic gold pricing
  // Pricing keys: signature, foundation, heirloom14k, heirloom18k
  // ==========================================
  laMarva: {
    name: "La Marva",
    slug: "la-marva",
    category: "rings",
    audience: "ladies",
    basePrice: 2500,
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
    slug: "annie-rose",
    category: "rings",
    audience: "ladies",
    basePrice: 5000,
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
    slug: "monika-couture",
    category: "earrings",
    audience: "ladies",
    weight: "10g per pair",
    basePrice: 1050,
    
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
    slug: "alejandra-heels",
    category: "earrings",
    audience: "ladies",
    categoryType: "Heel Earrings",
    description: "Sculptural miniature heels cast in precious metal and finished with a pavé strap.",
    tagline: "A playful couture design created to capture the spirit of fashion, movement, and confidence.",
    basePrice: 950,
    
    // Hero image for carousel and shop cards
    imageUrl: "https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/0y3jefc5_1000140400.jpg",
    images: {
      hero: "https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/0y3jefc5_1000140400.jpg"
    },
    
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
    slug: "ptp-cuff",
    category: "bracelets",
    audience: "gentlemens-club",
    subtitle: "PTP — Power To The People",
    categoryType: "Cuff Bracelet",
    description: "The PTP Cuff transforms a universal symbol of unity into wearable sculpture. A procession of raised fists encircles the band — each one a tribute to collective strength and the power of people moving together.",
    tagline: "Bold, sculptural, and unapologetically symbolic, the cuff is designed to feel substantial on the wrist while maintaining a refined luxury finish.",
    basePrice: 800,
    
    // Pricing Configuration
    dynamicPricing: false, // Fixed pricing, no gold adjustments
    currency: "USD",
    
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
    slug: "rosaria",
    category: "earrings",
    audience: "ladies",
    subtitle: "The Rosaria Earrings",
    categoryType: "Earrings",
    shopMaterialLine: "Statement Earrings · 10K & 14K Rose Gold",
    tagline: "Sculpted Roses in Rose Gold",
    description: "Rosaria captures the beauty of a rose in full bloom, transformed into wearable sculpture. Each rose is sculpted in precious metal and arranged in a cascading composition that moves gracefully with the wearer. The design preserves the elegance of a flower in gold — a tribute to love, celebration, and permanence.",
    materialNote: "Available exclusively in 10K and 14K rose gold.",
    basePrice: 2000,
    
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
        currency: "USD"
      },
      {
        name: "14K Rose Gold",
        karat: "14K",
        color: "Rose",
        pricingKey: "rose14k",
        price: 3250,
        currency: "USD"
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
    slug: "desir-corset",
    category: "pendants",
    audience: "ladies",
    subtitle: "Wearable Architecture",
    categoryType: "Pendants",
    shopMaterialLine: "Pendant · 10K Rose Gold",
    tagline: "Sculptural Form Meets Fine Jewelry",
    description: "Inspired by the structure of couture corsetry, the Désir Corset Pendant transforms sculpted form into wearable architecture. Fine mesh panels create depth and texture within a polished rose gold frame, forming a tapered waist and sculpted cup structure that echo the lines of high fashion tailoring. Designed to sit naturally against the chest, the pendant features subtle curvature and balanced proportions that allow the piece to hang elegantly from a delicate chain. A statement piece that blends sculpture, fashion, and fine jewelry.",
    basePrice: 4500,
    
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
        currency: "USD",
        description: "Pendant without chain"
      },
      {
        name: "Pendant + 18\" Chain",
        pricingKey: "pendant-18-chain",
        price: 6990,
        currency: "USD",
        description: "Includes 18 inch rose gold chain"
      },
      {
        name: "Pendant + 20\" Chain",
        pricingKey: "pendant-20-chain",
        price: 7090,
        currency: "USD",
        description: "Includes 20 inch rose gold chain"
      }
    ],
    
    // Shipping info
    shipping: "Complimentary insured shipping within Canada.",
    
    // Gallery images
    images: {
      hero: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/w3d4u3hw_1000141618.jpg",
      wornPortrait: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/p8urv2ow_1000141576.jpg",
      angledMannequin: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/ggmujqbm_1000141580.jpg",
      macroDetail1: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/rhmtewoy_1000141582.jpg",
      macroDetail2: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/um8j2fx0_1000141584.jpg",
      palmShot: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/4tdsmcrf_1000141598.jpg",
      inHand: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/4jwyuqgb_1000141600.jpg",
      rooftopLifestyle: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/9rl746mk_1000141602.jpg",
      specSheet: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/f6438iha_1000141530.jpg",
      heroVideo: "https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/lxv7l80r_XiaoYing_Video_1773537193144.mp4"
    }
  },

  // ==========================================
  // FORME CUFF
  // Sculptural cuff bracelet with human form silhouettes
  // Available in solid gold and gold-plated silver
  // ==========================================
  formeCuff: {
    name: "Forme Cuff",
    slug: "forme-cuff",
    category: "bracelets",
    audience: "ladies",
    subtitle: "Shaped by the curve. Held in form.",
    categoryType: "Cuff Bracelet",
    description: "The Forme Cuff captures the elegance of the human form in motion — figures intertwined, dancing along the curve of the wrist. Each silhouette is precision-cut from solid gold, creating a play of light and shadow that shifts with every gesture.",
    tagline: "A celebration of movement, connection, and the beauty of the body in balance.",
    materialNote: "Offered in solid gold and gold-plated silver — without compromise in form.",
    basePrice: 500,

    // Metal options with images (prepared for unique images per variant)
    metalOptions: {
      solidGold: [
        {
          id: "yellow-10k",
          name: "10K Yellow Gold",
          shortName: "Yellow 10K",
          price: 2850,
          currency: "USD",
          image: "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png"
        },
        {
          id: "rose-10k",
          name: "10K Rose Gold",
          shortName: "Rose 10K",
          price: 2850,
          currency: "USD",
          image: "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png"
        }
      ],
      platedSilver: [
        {
          id: "plated-yellow",
          name: "Gold Plated Silver (Yellow)",
          shortName: "Yellow Plated",
          price: 695,
          currency: "USD",
          image: "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png"
        },
        {
          id: "plated-rose",
          name: "Gold Plated Silver (Rose)",
          shortName: "Rose Plated",
          price: 695,
          currency: "USD",
          image: "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png"
        }
      ]
    },

    // Default selection
    defaultMetal: "yellow-10k",

    // Shipping info
    shipping: "Complimentary insured shipping within Canada.",

    // Media assets
    images: {
      hero: "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png",
      video: "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/26vbm4f4_XiaoYing_Video_1774098119024.mp4"
    }
  },

  // ==========================================
  // RHYTHM MESH RING
  // Unisex statement ring
  // ==========================================
  rhythmMeshRing: {
    name: "Rhythm Mesh™ Ring",
    slug: "rhythm-mesh-ring",
    category: "rings",
    audience: "unisex",
    shopMaterialLine: "Statement Ring · Silver & 10K White Gold",
    description: "Structured motion. Captured in metal.",
    basePrice: 1100,
    
    // Default card image for Collective
    imageUrl: "https://customer-assets.emergentagent.com/job_b18523eb-3184-4ba4-8ef3-cdebf4fafd5f/artifacts/nl2vulxg_1000143088.jpg",
    
    // Audience-specific card images
    audienceImages: {
      ladies: "https://customer-assets.emergentagent.com/job_b18523eb-3184-4ba4-8ef3-cdebf4fafd5f/artifacts/skzja828_1000143123.png",
      gentlemensClub: "https://customer-assets.emergentagent.com/job_b18523eb-3184-4ba4-8ef3-cdebf4fafd5f/artifacts/dptf24st_1000143315.png"
    },
    
    // Pricing
    pricing: {
      silver: 1450,
      white10k: 4800,
      white14k: 6400
    },
    
    // Shipping info
    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // TOLA II
  // Bold men's ring with Cuban chain and black diamonds
  // Ironclad Rules: 10K/14K/18K Yellow Gold tiers
  // ==========================================
  tolaII: {
    name: "TOLA II",
    slug: "tola-ii",
    category: "rings",
    audience: "gentlemens-club",
    shopMaterialLine: "Statement Ring · 10K-18K Yellow Gold",
    tagline: "Weight. Discipline. Presence.",
    description: "TOLA II is built on restraint and control. A structured gold form, anchored by a central chain and framed with precision-set black stones. Every surface is intentional. Every detail holds weight.",
    basePrice: 4000,
    
    // Hero image for shop cards
    imageUrl: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png",
    
    // Pricing Configuration (Ironclad Rules: Yellow Gold Only)
    dynamicPricing: false,
    currency: "USD",
    defaultMetal: "10K Yellow Gold",
    metals: ["10K Yellow Gold", "14K Yellow Gold", "18K Yellow Gold"],
    
    // Tier-based pricing
    pricing: {
      foundation: 5200,
      signature: 6800,
      heirloom: 9200
    },
    
    tiers: [
      {
        id: "foundation",
        name: "Foundation",
        metal: "10K Yellow Gold",
        pricingKey: "foundation",
        price: 5200,
        tag: "",
        highlight: false,
        description: "10K yellow gold with black stones. Built for everyday presence."
      },
      {
        id: "signature",
        name: "Signature",
        metal: "14K Yellow Gold",
        pricingKey: "signature",
        price: 6800,
        tag: "Most Popular",
        highlight: true,
        description: "14K yellow gold with black lab-grown diamonds. Balanced weight and clarity."
      },
      {
        id: "heirloom",
        name: "Heirloom",
        metal: "18K Yellow Gold",
        pricingKey: "heirloom",
        price: 9200,
        tag: "Collector",
        highlight: false,
        description: "18K yellow gold with natural black diamonds. Maximum richness and permanence."
      }
    ],
    
    // Specs
    specs: [
      "Approx. top width: 12–13mm",
      "Approx. band width: 3–4mm",
      "Approx. weight: 15g (10K), 17g (14K), 21g (18K)",
      "60 black stones total",
      "High polish finish with structured pavé setting"
    ],
    
    // Gallery media (video first, then images)
    media: [
      { type: "video", src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/29wd5jby_XiaoYing_Video_1774562301628.mp4" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/sm6c4t2r_1000143432.png" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/ipu9le7o_1000141790.png" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/m0g80wsc_1000143416.png" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/1ta12tya_1000143385.png" }
    ],
    
    // Legacy image references
    images: {
      hero: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png",
      front: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/sm6c4t2r_1000143432.png",
      side: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/ipu9le7o_1000141790.png",
      detail: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/m0g80wsc_1000143416.png",
      lifestyle: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/1ta12tya_1000143385.png"
    },
    
    // Shipping info
    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // GALATIANS 6:14
  // Cross pendant with three-tier pricing
  // ==========================================
  galatians614: {
    name: "GALATIANS 6:14",
    slug: "galatians-614",
    category: "pendants",
    audience: "gentlemens-club",
    shopMaterialLine: "Cross Pendant · 10K-18K Yellow Gold",
    tagline: "Faith, Worn With Intention.",
    subline: "Built on Belief.",
    basePrice: 3000,
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "USD",
    
    pricing: {
      foundation: 3800,  // 10K Yellow Gold
      signature: 4800,   // 14K Yellow Gold
      heirloom: 6400     // 18K Yellow Gold
    }
  },

  // ==========================================
  // TRACE
  // Earrings with gold plated to solid gold options
  // ==========================================
  trace: {
    name: "TRACE",
    slug: "trace",
    category: "earrings",
    audience: "ladies",
    shopMaterialLine: "Earrings · 10K Gold Plated - 14K Yellow Gold",
    tagline: "Lines of Movement.",
    basePrice: 700,
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "USD",
    
    pricing: {
      plated: 900,       // 10K Gold Plated
      solid10k: 2400,    // 10K Yellow Gold
      solid14k: 3200     // 14K Yellow Gold
    }
  },

  // ==========================================
  // BOUND
  // The Bustier Bangle - Flagship bangle
  // NO SILVER - Gold only (10K/14K/18K)
  // ==========================================
  bound: {
    name: "BOUND",
    slug: "bound",
    category: "bracelets",
    audience: "ladies",
    subtitle: "The Bustier Bangle",
    shopMaterialLine: "The Bustier Bangle · 10K-18K Yellow Gold",
    tagline: "Sculptural. Structural. Unapologetically Statement.",
    basePrice: 9500,
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "USD",
    
    pricing: {
      foundation: 12800,  // 10K Yellow Gold
      signature: 18400,   // 14K Yellow Gold
      heirloom: 24600     // 18K Yellow Gold
    }
  },

  // ==========================================
  // APEX
  // Pyramid earrings with sapphires and diamonds
  // Egypt to Santorini inspiration
  // ==========================================
  apex: {
    name: "APEX",
    slug: "apex",
    category: "earrings",
    audience: "ladies",
    subtitle: "PHILEON — OBJECT SERIES",
    shopMaterialLine: "Pyramid Earrings · Silver to 18K White Gold",
    tagline: "From Egypt to Santorini. Places turned into pieces.",
    basePrice: 3500,
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "USD",
    defaultTier: "core",
    
    // Hero image
    imageUrl: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/jphlogf7_1000144036.webp",
    
    pricing: {
      signature: 4800,    // Silver with CZ + lab sapphires
      foundation: 10800,  // 10K White Gold with lab diamonds + natural sapphires
      core: 14000,        // 14K White Gold with lab diamonds + natural sapphires
      heirloom: 18200     // 18K White Gold with lab diamonds + natural sapphires
    },
    
    // Tier details
    tiers: {
      signature: {
        name: "Signature",
        metal: "Sterling Silver",
        stones: "Cubic Zirconia + Lab Sapphires",
        description: "Entry into the object. Same design, same proportions."
      },
      foundation: {
        name: "Foundation",
        metal: "10K White Gold",
        stones: "Lab Diamonds + Natural Sapphires",
        description: "Solid gold foundation with precious stones."
      },
      core: {
        name: "Core",
        metal: "14K White Gold",
        stones: "Lab Diamonds + Natural Sapphires",
        badge: "Most Chosen",
        description: "Balanced weight and lasting brilliance."
      },
      heirloom: {
        name: "Heirloom",
        metal: "18K White Gold",
        stones: "Lab Diamonds + Natural Sapphires",
        badge: "HEIRLOOM",
        description: "Maximum gold purity. Museum-grade finish."
      }
    },
    
    // Specs
    specs: {
      weight: "8.5g per earring (17g pair)",
      dimensions: "35mm × 16mm",
      diamonds: "120 round pavé diamonds per earring (1.0mm–1.2mm)",
      sapphires: "4 blue sapphires per earring (3 round ~5mm, 1 oval ~7×5mm)",
      finish: "High polish"
    }
  },

  // ==========================================
  // HOMAGE
  // The art once carried, now worn.
  // Fan-shaped radial earrings
  // ==========================================
  homage: {
    name: "HOMAGE",
    slug: "homage",
    subtitle: "Earrings",
    tagline: "Structure. Light. Memory.",
    category: "earrings",
    audience: "ladies",
    currency: "USD",
    collections: ["ladies-earrings", "collective"],
    defaultVariant: "core",
    defaultTier: "signature",
    basePrice: 1050,
    priceFrom: "$1,050 USD",
    
    // Hero image
    imageUrl: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/mmqzzrsg_1000144453.png",
    
    // Two variants: FULL and CORE
    variants: {
      full: {
        model: "FULL",
        label: "FULL",
        stoneCountPerEarring: 72,
        totalStones: 144,
        description: "Maximum presence. Fully set.",
        pricing: {
          foundation: 2600,
          signature: 4600,
          heirloom: 6800
        },
        images: {
          default: { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/y8zkizsg_1000144762.png", alt: "HOMAGE FULL - 144 stones - Silver" },
          "silver-rose-inlay": { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/27ylt6jj_1000144777.png", alt: "HOMAGE FULL - 144 stones - Silver / Rose Inlay" },
          "white-rose-inlay": { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/27ylt6jj_1000144777.png", alt: "HOMAGE FULL - 144 stones - White / Rose Inlay" },
          "rose-plated-silver": { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/73ih8d0q_1000144473.png", alt: "HOMAGE FULL - 144 stones - Rose Gold / White Inlay" },
          "rose-white-inlay": { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/73ih8d0q_1000144473.png", alt: "HOMAGE FULL - 144 stones - Rose / White Inlay" },
          "all-rose": { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/r4217a7k_1000144772.png", alt: "HOMAGE FULL - 144 stones - All Rose" }
        }
      },
      core: {
        model: "CORE",
        label: "CORE",
        stoneCountPerEarring: 24,
        totalStones: 48,
        description: "Refined structure. Reduced weight.",
        pricing: {
          foundation: 1400,
          signature: 2600,
          heirloom: 4600
        },
        images: {
          default: { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/ctsdt2t8_1000144763.png", alt: "HOMAGE CORE - 48 stones - Silver" },
          "silver-rose-inlay": { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/xtkfhqcs_1000144776.jpg", alt: "HOMAGE CORE - 48 stones - Silver / Rose Inlay" },
          "white-rose-inlay": { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/xtkfhqcs_1000144776.jpg", alt: "HOMAGE CORE - 48 stones - White / Rose Inlay" },
          "rose-plated-silver": { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/1i9m2092_1000144500.png", alt: "HOMAGE CORE - 48 stones - Rose Gold / White Inlay" },
          "rose-white-inlay": { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/1i9m2092_1000144500.png", alt: "HOMAGE CORE - 48 stones - Rose / White Inlay" },
          "all-rose": { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/iy7wosha_1000144771.png", alt: "HOMAGE CORE - 48 stones - All Rose" }
        }
      }
    },
    
    // Finish options
    finishes: [
      { id: "all-silver", label: "All Silver" },
      { id: "silver-rose-plated", label: "All Silver / Rose Gold Plated" },
      { id: "silver-rose-inlay", label: "Silver / Rose Inlay (Plated)" },
      { id: "rose-plated-silver", label: "Rose Gold Plated / Silver" },
      { id: "all-white", label: "All White" },
      { id: "white-rose-inlay", label: "White / Rose Inlay" },
      { id: "all-rose", label: "All Rose" },
      { id: "rose-white-inlay", label: "Rose / White Inlay" }
    ],
    
    tiers: {
      foundation: {
        name: "Foundation",
        label: "FOUNDATION",
        metal: "925 Sterling Silver",
        stones: "Cubic Zirconia"
      },
      signature: {
        name: "Signature",
        label: "SIGNATURE",
        metal: "10K Gold",
        stones: "Lab-grown diamonds",
        badge: "MOST POPULAR"
      },
      heirloom: {
        name: "Heirloom",
        label: "HEIRLOOM",
        metal: "14K / 18K Gold",
        stones: "Natural diamonds",
        badge: "COLLECTOR"
      }
    },
    
    specs: {
      height: "45mm",
      width: "22mm",
      weight: "Approx. 6g per pair",
      closure: "Hook",
      finish: "High polish + satin contrast",
      setting: "Radial pavé"
    },
    
    gallery: [
      { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/mmqzzrsg_1000144453.png", alt: "HOMAGE front view" },
      { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/wy1fs7ps_1000144448.png", alt: "HOMAGE angle with PHILEON branding" },
      { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/95yhcg9y_1000144456.png", alt: "HOMAGE white background" },
      { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/lm6ijegv_1000144473.png", alt: "HOMAGE two-tone detail" },
      { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/ot3ftrqu_1000144441.png", alt: "HOMAGE stacked view" },
      { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/8y7chzue_1000144513.png", alt: "HOMAGE silver with reflection" },
      { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/69bgz1ce_1000144511.png", alt: "HOMAGE gold pair with reflection" },
      { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/otcxo0dl_1000144472.png", alt: "HOMAGE silver on white" },
      { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/1qkzeecx_1000144466.png", alt: "HOMAGE silver flat lay" },
      { src: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/ghwo9yk7_1000144462.png", alt: "HOMAGE macro detail" }
    ],
    
    story: `The art once carried,
now worn.

Not for every moment.

For the right one.`
  },

  // ==========================================
  // CYPHER
  // Men's statement ring with emeralds, yellow sapphires, and princess-cut diamonds
  // Bold luxury for the Gentleman's Club collection
  // ==========================================
  cypher: {
    name: "CYPHER",
    slug: "cypher",
    category: "rings",
    audience: "gentlemens-club",
    collections: ["rings", "collective", "gentlemens-club"],
    subtitle: "RING",
    tagline: "Drama on your finger.",
    priceFrom: "$3,500 USD",
    basePrice: 3500,
    
    // Hero image for shop cards
    imageUrl: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/fvt6nsns_1000144990.png",
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "USD",
    defaultTier: "signature",
    
    // Tier-based pricing
    pricing: {
      foundation: 4400,
      signature: 7200,
      heirloom: 10800
    },
    
    tiers: {
      foundation: {
        label: "FOUNDATION",
        sublabel: "Entry",
        name: "Foundation",
        metal: "10K White Gold",
        stones: "Cubic / lower-grade stones",
        badge: "",
        description: "The entry into CYPHER. Bold form. Full presence."
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K White Gold",
        stones: "Lab / mid-grade natural mix",
        badge: "MOST POPULAR",
        description: "The definitive expression. Balanced brilliance."
      },
      heirloom: {
        label: "HEIRLOOM",
        name: "Heirloom",
        metal: "18K White Gold",
        stones: "Natural stones (upgraded quality)",
        badge: "COLLECTOR",
        description: "Collector level. Maximum density. Maximum legacy."
      }
    },
    
    // Specs
    specs: {
      weight: "Approx. 18–22g depending on size",
      centerStones: "Dual emerald cabochons",
      cluster: "9-stone princess diamond cluster",
      pave: "Multi-density yellow sapphire pavé",
      band: "Rhythm mesh band",
      finish: "High polish white gold"
    },
    
    // Story copy
    story: `White gold structure.
Emerald cabochons.
Princess-cut diamond cluster.
Yellow sapphire field.`,
    
    craft: `Every surface considered.
Every stone placed with intent.`,
    
    closing: `Not worn.
Claimed.`,
    
    // Gallery media - IMAGES ONLY (video is hero-only)
    // 1. angled_black (authority / first impression)
    // 2. front_black (clarity / confirmation)
    // 3. hand (scale / human context)
    // 4. macro_diamond (precision)
    // 5. macro_emerald (richness)
    // 6. box (ownership moment)
    // 7. glove (craftsmanship)
    // 8. silk (emotional finish)
    heroVideo: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/ynnmu3mi_VIDEO_b9adff2b-fdf3-48c9-b88b-a3b16690a828.mp4",
    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/9kgcwx4j_1000145085.png", alt: "Angled black" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/gsx17hv1_1000145084.png", alt: "Front black" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/ug3fwnn7_1000144949.png", alt: "Hand" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/krjduain_1000144981.png", alt: "Macro diamond" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/waq6e0d8_1000144984.png", alt: "Macro emerald" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/tvh92fpy_1000144991.png", alt: "Box" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/sle5xnfp_1000144951.webp", alt: "Glove" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/wj7ctw8v_1000144950.webp", alt: "Silk" }
    ],
    
    // Size profile
    sizeProfile: {
      type: "ring",
      min: 6,
      max: 12,
      halfSizes: true,
      customAbove: 12
    },
    
    // Shipping info
    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // IL MORSO DEL RE
  // "The Bite of the King" - Grillz-inspired statement ring
  // Yellow gold with diamond pavé teeth motif
  // ==========================================
  morso: {
    name: "IL MORSO DEL RE",
    slug: "morso",
    category: "rings",
    audience: "gentlemens-club",
    collections: ["rings", "collective", "gentlemens-club"],
    subtitle: "RING",
    tagline: "The Bite of the King.",
    priceFrom: "$5,000 USD",
    basePrice: 5000,
    
    // Hero image for shop cards
    imageUrl: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/1to4q64f_1000145276.png",
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "USD",
    defaultTier: "signature",
    
    // Tier-based pricing (2 tiers only)
    pricing: {
      foundation: 6800,
      signature: 9800
    },
    
    tiers: {
      foundation: {
        label: "FOUNDATION",
        sublabel: "Entry",
        name: "Foundation",
        metal: "10K Gold",
        stones: "Lab-Grown Diamonds",
        badge: "",
        description: "The entry into IL MORSO. Solid gold. Full bite."
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K Gold",
        stones: "Lab-Grown Diamonds",
        badge: "MOST POPULAR",
        description: "The king's choice. Maximum presence. Maximum statement."
      }
    },
    
    // Specs
    specs: {
      diamonds: "Set with 256 Round Brilliant Lab-Grown Diamonds",
      caratWeight: "Total Diamond Weight: 2.50 Carats",
      width: "Width: 14mm",
      weight: "Weight: 28.5 Grams",
      material: "Material: Solid Gold",
      note: "Specifications may vary slightly by size."
    },
    
    // Story copy
    story: `Yellow gold structure.
Diamond-encrusted teeth.
Double-row grillz motif.
Statement without words.`,
    
    craft: `Every tooth hand-set.
Every diamond placed with precision.`,
    
    closing: `Not worn.
Crowned.`,
    
    // Hero video
    heroVideo: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/ccwj01h1_VIDEO_2607eeb0-ad14-4d1f-b415-41bb1bd728f8.mp4",
    
    // Gallery media - IMAGES ONLY
    // 1. front_reflection (Authority - HOOK)
    // 2. angled_warm (Emotion - PULL)
    // 3. front_black (Clarity - CONFIRM)
    // 4. three_quarter (Form - UNDERSTAND)
    // 5. macro_diamond (Detail - TRUST)
    // 6. hand_hold (Scale - REALITY)
    // 7. on_finger (Wear - CONTEXT)
    // 8. full_hand (Presence - IMPACT)
    // 9. interior (Construction - CLOSURE)
    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/v0p4yi5r_1000145269.jpg", alt: "Front reflection" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/lq8adcpf_1000145384.png", alt: "Angled warm" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/1to4q64f_1000145276.png", alt: "Front black" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/es0bpegd_1000145385.png", alt: "Three quarter" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/o4669mvn_1000145279.png", alt: "Macro diamond" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/bdcqijmx_1000145296.png", alt: "Hand hold" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/nunosao8_1000145306.png", alt: "On finger" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/5g9jnk9q_1000145367.png", alt: "Full hand" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/7v4c11rj_1000145274.jpg", alt: "Interior" }
    ],
    
    // Size profile
    sizeProfile: {
      type: "ring",
      min: 6,
      max: 12,
      halfSizes: true,
      customAbove: 12
    },
    
    // Shipping info
    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // TRIBUTE: LA BÊTE
  // "The Beast" - Bugatti-inspired white gold ring
  // Full diamond pavé with horseshoe grille motif
  // ==========================================
  labete: {
    name: "TRIBUTE: LA BÊTE",
    slug: "labete",
    category: "rings",
    audience: "gentlemens-club",
    collections: ["rings", "collective", "gentlemens-club"],
    subtitle: "RING",
    tagline: "Born in the showroom. Built for the hand.",
    priceFrom: "$5,500 USD",
    basePrice: 5500,
    
    // Collection/grid card image (showroom - hook/world-building)
    imageUrl: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/6jm0dy9d_1000145555.png",
    
    // Hero image for product page (cinematic showroom)
    heroImage: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/6jm0dy9d_1000145555.png",
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "USD",
    defaultTier: "signature",
    
    // Tier-based pricing (4 tiers)
    pricing: {
      silver: 3200,
      foundation: 7400,
      signature: 11200,
      heirloom: 15800
    },
    
    tiers: {
      silver: {
        label: "SILVER",
        sublabel: "Entry",
        name: "Silver",
        metal: "Sterling Silver",
        stones: "Cubic stones",
        badge: "",
        description: "Entry interpretation of LA BÊTE.",
        hiddenFromHero: true
      },
      foundation: {
        label: "FOUNDATION",
        sublabel: "Entry",
        name: "Foundation",
        metal: "10K Gold",
        stones: "Precision-set stones",
        badge: "",
        description: "The entry into LA BÊTE. Solid gold. Full presence."
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K Gold",
        stones: "Lab-grown diamonds",
        badge: "MOST POPULAR",
        description: "Balance of strength and brilliance. The definitive expression.",
        defaultSelected: true
      },
      heirloom: {
        label: "HEIRLOOM",
        name: "Heirloom",
        metal: "18K Gold",
        stones: "Natural diamonds",
        badge: "",
        description: "Collector level. Maximum density. Maximum legacy."
      }
    },
    
    // Specs
    specs: {
      diamonds: "Set with 380+ Round Brilliant Lab-Grown Diamonds",
      caratWeight: "Total Diamond Weight: 3.20 Carats",
      width: "Width: 16mm",
      weight: "Weight: 32g",
      material: "Material: Solid White Gold",
      note: "Specifications may vary slightly by size."
    },
    
    // Story copy
    story: `White gold structure.
Full diamond pavé.
Horseshoe grille motif.
Automotive precision.`,
    
    craft: `Every curve considered.
Every diamond placed with intention.`,
    
    closing: `Not worn.
Driven.`,
    
    // Gallery media - IMAGES ONLY (9 total - FINAL ORDER)
    // 1. showroom (HOOK)
    // 2. front_black (CLARITY)
    // 3. three_quarter (FORM)
    // 4. side_profile (STRUCTURE)
    // 5. macro_clean (TRUST)
    // 6. interior (CRAFT)
    // 7. hand_relaxed (CONTEXT)
    // 8. fist (IMPACT)
    // 9. box_black (OWNERSHIP)
    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/6jm0dy9d_1000145555.png", alt: "LA BÊTE showroom hero", intent: "HOOK" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_f5f99e21-5104-439c-96b9-543eaba47da6/artifacts/z47ib7so_1000145636.jpg", alt: "LA BÊTE front view", intent: "CLARITY" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/mc3l4ayn_1000145539.png", alt: "LA BÊTE three quarter angle", intent: "FORM" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/h2x7mhvv_1000145601.png", alt: "LA BÊTE side profile", intent: "STRUCTURE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/vsia8rex_1000145544.png", alt: "LA BÊTE diamond macro detail", intent: "TRUST" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/038hslrd_1000145504.png", alt: "LA BÊTE interior construction", intent: "CRAFT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/pi0196eb_1000145565.png", alt: "LA BÊTE worn on hand", intent: "CONTEXT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/wvvb9qff_1000145550.png", alt: "LA BÊTE power shot", intent: "IMPACT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/7z0biff7_1000145603.png", alt: "LA BÊTE in presentation box", intent: "OWNERSHIP" }
    ],
    
    // Size profile
    sizeProfile: {
      type: "ring",
      min: 6,
      max: 12,
      halfSizes: true,
      customAbove: 12
    },
    
    // Shipping info
    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // BLESSED — DEUTERONOMY 28:3
  // "Word Made Metal" - Woven gold scripture ring
  // Collective piece (gender-neutral)
  // ==========================================
  blessed: {
    name: "BLESSED",
    slug: "blessed",
    category: "rings",
    audience: ["gentlemens-club", "ladies", "collective"],
    collections: ["rings", "collective", "gentlemens-club", "ladies"],
    subtitle: "DEUTERONOMY 28:3",
    tagline: "Word Made Metal.",
    priceFrom: "$650 USD",
    basePrice: 650,
    
    // Hero image for shop cards
    imageUrl: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/kodh0p8l_1000145889.jpg",
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "USD",
    defaultTier: "signature",
    
    // Tier-based pricing (CAD)
    pricing: {
      foundation: 880,
      signature: 5200,
      heirloom: 6800
    },
    
    tiers: {
      foundation: {
        label: "FOUNDATION",
        name: "Foundation",
        metal: "Gold Plated Sterling Silver",
        stones: "Woven form",
        badge: "",
        description: "The entry into BLESSED. Premium plated finish. Full weave."
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K Yellow Gold",
        stones: "Refined weave",
        badge: "MOST POPULAR",
        description: "The definitive expression. Solid gold. Balanced weight."
      },
      heirloom: {
        label: "HEIRLOOM",
        name: "Heirloom",
        metal: "18K Yellow Gold",
        stones: "Full density weave",
        badge: "",
        description: "Collector level. Maximum density. Maximum legacy."
      }
    },
    
    // Story copy
    story: `Before it became a ring, it was a promise.

Cast in gold with two distinct weaves —
a tight mesh band and a heavy rope braid that builds each letter from the metal up.

Every detail preserved.
Every strand accountable.

The same ring.
The same standard.
Every time.`,
    
    verse: `Blessed shall you be in the city,
and blessed shall you be in the field.`,
    
    craft: [
      {
        number: "01",
        title: "WOVEN",
        description: "Gold is treated like thread. Each strand interlocks to form structure, not surface."
      },
      {
        number: "02",
        title: "CONTINUOUS",
        description: "The form does not begin or end. It moves as one — unbroken, intentional."
      }
    ],
    
    closing: `Not decoration.
Covenant.`,
    
    // Gallery media - IMAGES ONLY
    // 1. front (identity)
    // 2. angle (signature)
    // 3. editorial (clean - dark fabric)
    // 4. side (structure)
    // 5. back (detail)
    // LUXURY EDITORIAL SEQUENCE (LOCKED)
    // 1. HERO (object) - clean front product
    // 2. SECONDARY HERO (presence) - best angle
    // 3. HUMAN ENTRY (wearability) - strongest hand shot
    // 4. BALANCE (collective) - opposite energy hand
    // 5. INTIMACY (closer human) - holding/detail
    // 6. CRAFT MACRO 1 (craftsmanship) - weave detail
    // 7. CRAFT MACRO 2 (abstract) - texture
    // 8. ARCHITECTURE (form) - structural angle
    // 9. TRUST (interior) - inner band
    // 10. MEANING (context) - bible
    // 11. OWNERSHIP (box) - retail-ready
    // 12. CAMPAIGN (brand) - editorial/attitude
    // 13. OPTIONAL (residual) - extra editorial
    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/kodh0p8l_1000145889.jpg", alt: "BLESSED front view", intent: "HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/11mc2nl9_1000145880.png", alt: "BLESSED angle view", intent: "SECONDARY_HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/2xwsea8c_1000145892.png", alt: "BLESSED on finger female", intent: "HUMAN_ENTRY" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/fj8mqlmr_1000145897.png", alt: "BLESSED on finger male", intent: "BALANCE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/opsqs7w5_1000145895.png", alt: "BLESSED hand holding", intent: "INTIMACY" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/b86n5xq7_1000145900.png", alt: "BLESSED arch lettering", intent: "CRAFT_ARCH" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/rnpdum9t_1000145893.png", alt: "BLESSED weave macro", intent: "CRAFT_MACRO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/4j183z9v_1000145876.png", alt: "BLESSED side view", intent: "ARCHITECTURE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/npft298a_1000145899.png", alt: "BLESSED interior construction", intent: "TRUST" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/5xr9wsl4_1000145894.png", alt: "BLESSED on bible", intent: "MEANING" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/uzkhjgjn_1000145898.png", alt: "BLESSED in box", intent: "OWNERSHIP" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/3yi78vya_1000145890.png", alt: "BLESSED editorial face", intent: "CAMPAIGN" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/mzbxk33m_1000145877.png", alt: "BLESSED editorial dark", intent: "OPTIONAL" }
    ],
    
    // Size profile
    sizeProfile: {
      type: "ring",
      min: 4,
      max: 12,
      halfSizes: true,
      customAbove: 12
    },
    
    // Shipping info
    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // COOGI I — Tribute Series
  // "Chaos, disciplined."
  // Multi-stone pavé composition
  // ==========================================
  coogiI: {
    name: "COOGI I",
    slug: "coogi-i",
    category: "rings",
    audience: ["gentlemens-club", "ladies", "collective"],
    collections: ["rings", "gentlemens-club", "ladies", "collective", "tribute-series"],
    collection: "Tribute Series",
    subtitle: "Pattern made power.",
    tagline: "Chaos, disciplined.",
    priceFrom: "$9,500 USD",
    basePrice: 9500,
    
    // Hero image for shop cards
    imageUrl: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/cvsbyxpn_1000146038.png",
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "USD",
    defaultTier: "signature",
    
    // Tier-based pricing (CAD)
    pricing: {
      foundation: 12800,
      signature: 18400,
      heirloom: 24600
    },
    
    tiers: {
      foundation: {
        label: "FOUNDATION",
        name: "Foundation",
        metal: "10K Gold (Yellow or White)",
        stones: "~700 stones",
        badge: "",
        description: "Full pavé composition. Estimated 15g."
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K Gold (Yellow or White)",
        stones: "Lab-Grown Stones · ~700",
        badge: "MOST POPULAR",
        description: "Balanced density. Lab-grown sapphires. Estimated 17g."
      },
      heirloom: {
        label: "HEIRLOOM",
        name: "Heirloom",
        metal: "18K Gold (Yellow or White)",
        stones: "Natural Gemstones · ~700",
        badge: "COLLECTOR",
        description: "Natural gemstones. Maximum density. Estimated 19g."
      }
    },
    
    // Product description
    description: `A controlled eruption of color and structure. Inspired by COOGI's unapologetic identity, refined through PHILEON discipline. Every stone placed with intent. Every curve engineered. Chaos, resolved.`,
    
    // Story copy
    story: `COOGI I is not pattern for the sake of pattern.

It is structure disguised as chaos.

Every stone is placed with intention.
Every division creates order.

What appears loud is calculated.
What appears free is engineered.

This is expression — under control.`,
    
    // Specifications
    specifications: {
      topWidth: "18 mm",
      bandThickness: "5 mm",
      profile: "Tapered architectural signet",
      weights: {
        "10K": "15 g",
        "14K": "17 g",
        "18K": "19 g"
      },
      stones: {
        whiteDiamonds: true,
        blueSapphires: true,
        yellowSapphires: true,
        redRubies: true,
        orangeCitrine: true,
        purpleAmethyst: true,
        total: "~700"
      }
    },
    
    // Features
    features: [
      "Multi-stone pavé composition",
      "Architectural segmented structure",
      "Full-surface gemstone setting",
      "High-polish interior comfort fit",
      "Tribute Series execution"
    ],
    
    // LUXURY EDITORIAL SEQUENCE GALLERY
    // 1. HERO - 2. SECONDARY HERO - 3. HUMAN ENTRY - 4. BALANCE - 5. CRAFT MACRO - 6. ARCHITECTURE - 7. CRAFT DETAIL - 8. GOLD VERSION - 9. TRUST - 10. TRUST ALT - 11. COMPOSITION MAP
    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/cvsbyxpn_1000146038.png", alt: "COOGI I front view with reflection", intent: "HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/z4vp2nhf_1000146046.png", alt: "COOGI I angled moody lighting", intent: "SECONDARY_HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ffbp4ebg_1000146062.png", alt: "COOGI I on hand female", intent: "HUMAN_ENTRY" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/uej19zsp_1000146061.png", alt: "COOGI I on hand male", intent: "BALANCE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/jac8uhki_1000146049.png", alt: "COOGI I gemstone detail macro", intent: "CRAFT_MACRO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/7qxrfifl_1000146034.png", alt: "COOGI I structural side angle", intent: "ARCHITECTURE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/zybvbxgq_1000146047.png", alt: "COOGI I diamond divider detail", intent: "CRAFT_DETAIL" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/wfn0w8cl_1000146045.png", alt: "COOGI I gold version hero", intent: "GOLD_VERSION" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/2sgdq1bu_1000146036.png", alt: "COOGI I interior PHILEON engraving", intent: "TRUST" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/rjndiqvb_1000146042.png", alt: "COOGI I gold interior engraving", intent: "TRUST_ALT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/431eto6p_1000146189.png", alt: "COOGI I gemstone composition map", intent: "COMPOSITION_MAP" }
    ],
    
    // Size profile
    sizeProfile: {
      type: "ring",
      audience: "gents",
      min: 6,
      max: 12,
      halfSizes: true,
      customAbove: 12
    },
    
    // Shipping info
    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // THE BAMBURGH & LADY BAMBURGH
  // Signature Series — His & Hers pair
  // Two-tone rose gold & white gold with black & white diamonds
  // ==========================================
  bamburgh: {
    name: "THE BAMBURGH & LADY BAMBURGH",
    slug: "bamburgh",
    category: "rings",
    audience: ["gentlemens-club", "ladies", "collective"],
    collections: ["rings", "gentlemens-club", "ladies", "collective", "signature-series"],
    collection: "Signature Series",
    subtitle: "His & Hers",
    tagline: "For the ones who made it. And the ones who made them better.",
    priceFrom: "$6,000 USD",
    basePrice: 6000,

    imageUrl: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/q1n5n1fg_1000146370.png",

    dynamicPricing: false,
    currency: "USD",
    defaultTier: "signature",

    pricing: {
      foundation: 8200,
      signature: 9600,
      heirloom: 11000
    },

    tiers: {
      foundation: {
        label: "FOUNDATION",
        name: "Foundation",
        metal: "14K Gold",
        stones: "White diamonds, black diamonds",
        badge: "",
        description: "14K gold, white diamonds, black diamonds"
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K Gold",
        stones: "Upgraded diamond quality",
        badge: "MOST POPULAR",
        description: "14K gold, upgraded diamond quality"
      },
      heirloom: {
        label: "HEIRLOOM",
        name: "Heirloom",
        metal: "18K Gold",
        stones: "Premium diamond selection",
        badge: "",
        description: "18K gold, premium diamond selection"
      }
    },

    story: `The Bamburgh is not jewelry. It is a monument. Built from discipline, pressure, and purpose — a reflection of legacy forged, not given.`,

    features: [
      "Two-tone rose gold & white gold construction",
      "83 white diamonds, 75 black diamonds — 158 total stones",
      "18 grams gold weight",
      "Hand-finished filigree side panels",
      "Made to order in Canada"
    ],

    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/q1n5n1fg_1000146370.png", alt: "The Bamburgh — front view", intent: "HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/v23no28z_1000146363.png", alt: "The Bamburgh — three quarter view with reflection", intent: "SECONDARY_HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ccqo2yvg_1000146367.png", alt: "The Bamburgh — angled top view", intent: "BALANCE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/f48bt147_1000146368.png", alt: "The Bamburgh — side profile filigree detail", intent: "ARCHITECTURE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/1nx3wfi3_1000146365.webp", alt: "The Bamburgh — macro diamond pavé detail", intent: "CRAFT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/k6wi1bme_1000146364.png", alt: "The Bamburgh — macro stone composition", intent: "INTIMACY" }
    ],

    sizeProfile: {
      type: "ring",
      min: 6,
      max: 12,
      halfSizes: true,
      customAbove: 12
    },

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // LADY BAMBURGH
  // Signature Series — Ladies
  // Two-tone rose gold & white gold, round brilliant centers
  // ==========================================
  ladyBamburgh: {
    name: "LADY BAMBURGH",
    slug: "lady-bamburgh",
    category: "rings",
    audience: ["ladies", "collective"],
    collections: ["rings", "ladies", "collective", "signature-series"],
    collection: "Signature Series",
    subtitle: "Command, in form.",
    tagline: "Command, in form.",
    priceFrom: "$8,500 USD",
    basePrice: 8500,

    imageUrl: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ulu0v463_1000146371.png",

    dynamicPricing: false,
    currency: "USD",
    defaultTier: "signature",

    pricing: {
      foundation: 11400,
      signature: 14800,
      heirloom: 18800
    },

    tiers: {
      foundation: {
        label: "FOUNDATION",
        name: "Foundation",
        metal: "10K Two-Tone Gold",
        stones: "Lab-grown diamonds",
        badge: "",
        description: "Entry into the Lady Bamburgh. Solid two-tone gold."
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K Two-Tone Gold",
        stones: "Natural black & white diamonds",
        badge: "MOST POPULAR",
        description: "The definitive expression. Round brilliant centers."
      },
      heirloom: {
        label: "HEIRLOOM",
        name: "Heirloom",
        metal: "18K Two-Tone Gold",
        stones: "Natural diamonds, filigree hand-finished",
        badge: "",
        description: "Collector level. Maximum brilliance. Maximum legacy."
      }
    },

    story: `Presence without announcement.\n\nRound brilliant centers framed in gold, balanced by the same black and white contrast as the Bamburgh.\n\nDifferent in form. Identical in weight.\n\nDesigned to be worn apart.\nMeant to be understood together.`,

    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ulu0v463_1000146371.png", alt: "Lady Bamburgh — front view", intent: "HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/pe9iwhc7_1000147023.png", alt: "Lady Bamburgh — three quarter angled dark", intent: "SECONDARY_HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/cb4smiy2_ultra-realistic-3-4-angle-macro-product-_lSqxihLTSiW-Luh5r1owmw_8dIGE8gVR7GOSHzetGRX6Q_cover_hd.png", alt: "Lady Bamburgh — three quarter filigree side", intent: "BALANCE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/nstuifus_1000146995.png", alt: "Lady Bamburgh — macro diamond centers detail", intent: "INTIMACY" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/9wkvhexa_1000147014.png", alt: "Lady Bamburgh — three quarter dark moody", intent: "TRUST" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/2b4y3bxf_1000147020.png", alt: "Lady Bamburgh — on hand lifestyle bokeh", intent: "HUMAN_ENTRY" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/na9exni8_1000146993.png", alt: "Lady Bamburgh — in ring box presentation", intent: "OWNERSHIP" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/0z67imtp_introduce-subtle-micro-reflection-variat_YBjs3cIdSPydnzrUdv6LhQ_T1VVaQpJQw6FGCHCla3Xog_cover_hd.png", alt: "Lady Bamburgh — front elevated with band visible", intent: "ARCHITECTURE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/xxka96h8_ultra-realistic-macro-refinement-pass-of_3gYXM17JQ0Gi-NSCit0jvQ_o4WeSSWAThuidtWPU5mKig_hd.png", alt: "Lady Bamburgh — ultra macro diamond brilliance", intent: "CRAFT" }
    ],

    features: [
      "Two-tone rose gold & white gold construction",
      "Round brilliant center diamonds",
      "Black & white diamond borders",
      "Hand-finished filigree accents",
      "Made to order in Canada"
    ],

    sizeProfile: {
      type: "ring",
      min: 5,
      max: 10,
      halfSizes: true,
      customAbove: 10
    },

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // FONDO CURVO
  // Ladies Earrings — Black onyx + pavé diamonds
  // ==========================================
  fondoCurvo: {
    name: "FONDO CURVO",
    slug: "fondo-curvo",
    category: "earrings",
    audience: "ladies",
    subtitle: "Earrings",
    categoryType: "Earrings",
    shopMaterialLine: "Statement Earrings · Silver / 10K White Gold",
    tagline: "Says everything to those who see it. Says nothing to those who don't.",
    collections: ["ladies-earrings", "collective"],
    currency: "USD",
    priceFrom: "$2,000 USD",
    basePrice: 2000,
    dynamicPricing: true,
    pricingPending: false,
    defaultTier: "silver",
    pricing: {
      silver: 2950,
      gold10k: 5400,
    },
    tiers: {
      silver:  { label: "SILVER",   name: "Silver",   metal: "925 Sterling Silver", stones: "128 pavé diamonds" },
      gold10k: { label: "10K GOLD", name: "10K Gold", metal: "10K White Gold",      stones: "128 pavé diamonds" },
    },
    specs: "400 Diamonds • 45mm Drop • 18mm Width • 12.5g",
    imageUrl: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/xo3lwkk2_1000147308.png",
    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/xo3lwkk2_1000147308.png", alt: "Fondo Curvo — diorama shadowbox presentation", intent: "HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/l43g78jv_1000147430.png", alt: "Fondo Curvo — front pair on black", intent: "SECONDARY_HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/w8g7e5nh_1000147364.png", alt: "Fondo Curvo — backlit pair on grey", intent: "CAMPAIGN" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/gaucyj76_1000147307.png", alt: "Fondo Curvo — in presentation case", intent: "OWNERSHIP" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/biqvi79f_1000147448.jpg", alt: "Fondo Curvo — three-quarter on dark silk", intent: "CAMPAIGN" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/mokhgmfq_1000147444.png", alt: "Fondo Curvo — studio front on near-black", intent: "ARCHITECTURE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/05gfllx4_1000147257.png", alt: "Fondo Curvo — macro top swirl detail", intent: "CRAFT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/vqnumpky_1000147438.png", alt: "Fondo Curvo — ultra macro spiral", intent: "INTIMACY" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/1asv31lw_1000147323.jpg", alt: "Fondo Curvo — side profile full length", intent: "ARCHITECTURE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/xsx4gpod_1000147445.png", alt: "Fondo Curvo — macro head with diamond studs", intent: "CRAFT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/erfkp6qf_1000147260.jpg", alt: "Fondo Curvo — ultra macro diamond ribbon pavé", intent: "CRAFT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/dihq2qgl_1000147311.png", alt: "Fondo Curvo — bottom spiral twist detail", intent: "INTIMACY" }
    ],
    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // 1 CORINTHIANS 15:14
  // Sacred Collection — Ladies Ring
  // Domed pavé head with three crosses (white / pink / white)
  // ==========================================
  corinthians1514: {
    name: "1 CORINTHIANS 15:14",
    slug: "corinthians-15-14",
    category: "rings",
    audience: "ladies",
    subtitle: "Sacred Collection",
    categoryType: "Ring",
    shopMaterialLine: "Sacred Collection · 10K / 14K / 18K White Gold",
    tagline: "This is not ornament alone. This is doctrine carried in form.",
    collections: ["ladies-rings", "sacred-collection", "collective"],
    collection: "Sacred Collection",
    currency: "USD",
    priceFrom: "$3,000 USD",
    basePrice: 3000,
    dynamicPricing: true,
    pricingPending: false,
    defaultTier: "signature",

    imageUrl: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/e8d03p9o_1000147798.png",

    pricing: {
      foundation: 4200,
      signature: 5900,
      heirloom: 8800,
    },

    tiers: {
      foundation: {
        label: "FOUNDATION",
        name: "Foundation",
        metal: "10K White Gold",
        stones: "Black & white diamonds, pink sapphires, multicolor sapphire channel",
        badge: "",
        description: "Entry into the Sacred Collection. Solid 10K white gold.",
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K White Gold",
        stones: "Black & white diamonds, pink sapphires, multicolor sapphire channel",
        badge: "MOST POPULAR",
        description: "The definitive expression. Hand-set 14K white gold.",
      },
      heirloom: {
        label: "HEIRLOOM",
        name: "Heirloom",
        metal: "18K White Gold",
        stones: "Black & white diamonds, pink sapphires, multicolor sapphire channel",
        badge: "",
        description: "Collector level. Maximum density. 18K white gold.",
      },
    },

    specs: "400 Diamonds • Black diamonds · white diamonds · pink sapphires · multicolor sapphire channel",

    story: `If Christ has not been raised,\nour preaching is useless\nand so is your faith.\n\n— 1 Corinthians 15:14\n\nA domed field of black pavé holds three crosses.\n\nTwo remain in white. The center rises in pink.\n\nIt is not balanced. It is intentional.\n\nThe center is not equal. It is everything.`,

    direction: {
      detail:
        "A domed field of black pavé holds three crosses. Two remain in white. The center rises in pink.",
      craft:
        "It is not balanced. It is intentional. Every stone is set deliberately, every contrast is doctrine.",
      structure:
        "The center is not equal. It is everything. A multicolor sapphire channel ribbons the dome, set into a substantial white gold band.",
    },

    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/e8d03p9o_1000147798.png", alt: "1 Corinthians 15:14 — front view, three crosses on domed pavé", intent: "HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/iguoeyhd_1000147761.png", alt: "1 Corinthians 15:14 — finished ring vertical orientation on dark surface", intent: "CAMPAIGN" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/hnsrnjtv_1000147838.jpg", alt: "1 Corinthians 15:14 — held between fingers, editorial campaign on white fur", intent: "EDITORIAL" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/hl1zphud_1000147799.png", alt: "1 Corinthians 15:14 — on hand, lifestyle wear", intent: "HUMAN_ENTRY" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/mg9a9we1_1000147795.png", alt: "1 Corinthians 15:14 — three quarter angle with band", intent: "ARCHITECTURE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/wv3ccfdc_1000147794.png", alt: "1 Corinthians 15:14 — angled top with crosses and band", intent: "BALANCE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/kwyao8nf_1000147796.png", alt: "1 Corinthians 15:14 — macro center pink cross", intent: "INTIMACY" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/npl9kn7j_1000147793.png", alt: "1 Corinthians 15:14 — macro multicolor sapphire channel", intent: "CRAFT" }
    ],

    sizeProfile: {
      type: "ring",
      min: 4,
      max: 10,
      halfSizes: true,
      customAbove: 10,
    },

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // DRAPE
  // Sculptural Pendant — Rose Gold Corset on Hanger
  // ==========================================
  drape: {
    name: "DRAPE",
    slug: "drape",
    category: "pendants",
    audience: ["ladies", "collective"],
    isFeatured: true,
    isNew: true,
    displayOrder: 1,
    subtitle: "Sculptural Pendant",
    categoryType: "Pendant",
    shopMaterialLine: "Sculptural Pendant · Silver / 10K / 14K / 18K Rose Gold",
    tagline: "The dress left. The bones remain.",
    collections: ["ladies-pendants", "editorial", "collective"],
    currency: "USD",
    priceFrom: "$1,450 USD",
    basePrice: 1450,
    dynamicPricing: true,
    pricingPending: false,
    defaultTier: "signature",

    pricing: {
      silver:     1950,
      foundation: 5200,
      signature:  6800,
      heirloom:   9200,
    },

    tiers: {
      silver: {
        label: "ENTRY",
        name: "Sterling Silver · Rose Gold Plated",
        metal: "925 Sterling Silver",
        finish: "Rose Gold Plated",
        stones: "Synthetic",
        badge: "ENTRY",
        description: "Sterling silver with rose gold plating. Chain sold separately.",
      },
      foundation: {
        label: "FOUNDATION",
        name: "Foundation",
        metal: "10K Rose Gold",
        finish: "Solid 10K Rose Gold",
        stones: "Synthetic Stones",
        badge: "",
        description: "Solid 10K rose gold with synthetic stones. Chain sold separately.",
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K Rose Gold",
        finish: "Solid 14K Rose Gold",
        stones: "Lab Diamonds",
        badge: "MOST POPULAR",
        description: "Solid 14K rose gold with lab-grown diamonds. Chain sold separately.",
      },
      heirloom: {
        label: "HEIRLOOM",
        name: "Heirloom",
        metal: "18K Rose Gold",
        finish: "Solid 18K Rose Gold",
        stones: "Natural Diamonds",
        badge: "COLLECTOR",
        description: "Solid 18K rose gold with natural diamonds. Chain sold separately.",
      },
    },

    specs: "85 round brilliant diamonds • 45mm × 30mm • 12.5g • 18K rose gold (Heirloom)",

    imageUrl: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/wbw4wgvu_1000147936.png",
    onBodyImage: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/xijy29y5_1000148062.png",

    description:
      "DRAPE is a study in movement and tension — sculpted lines wrapped in rose gold, traced in pavé. A corset suspended on its hanger, designed to follow the body, not sit on it.",

    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/wbw4wgvu_1000147936.png", alt: "Drape — front view, full piece on pavé hanger", intent: "HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/xijy29y5_1000148062.png", alt: "Drape — worn on body, hand resting against pendant", intent: "HUMAN_ENTRY" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/tf3tuzp5_1000147940.png", alt: "Drape — full silhouette, suspended", intent: "ARCHITECTURE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/12kne70r_1000147935.png", alt: "Drape — three quarter angle, corset profile", intent: "MOVEMENT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/bp6a0gd9_1000147934.png", alt: "Drape — macro pavé hanger and bail", intent: "CRAFT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/kgiqf7lv_1000147941.png", alt: "Drape — macro hanger with corset wires", intent: "INTIMACY" }
    ],

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // LE COCKTAIL DE JESSICA
  // Ladies Cocktail Ring — Tri-colour gold, mixed stones
  // ==========================================
  cocktailJessica: {
    name: "LE COCKTAIL DE JESSICA",
    slug: "le-cocktail-de-jessica",
    category: "rings",
    audience: ["ladies", "collective"],
    subtitle: "Cocktail Ring",
    categoryType: "Ring",
    shopMaterialLine: "Cocktail Ring · 10K Tri-Colour Gold · Natural Stones",
    tagline: "Composed in colour.",
    collections: ["ladies-rings", "editorial", "collective"],
    currency: "USD",
    priceFrom: "$6,500 USD",
    basePrice: 6500,
    dynamicPricing: true,
    pricingPending: false,
    defaultTier: "standard",
    isFeatured: true,
    isNew: true,
    displayOrder: 2,
    showInHomepageCarousel: true,

    imageUrl:
      "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/9erkjubh_1000148134.png",
    hoverImage:
      "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/84gb9vxf_1000148149.png",

    pricing: {
      standard: 8500,
    },

    tiers: {
      standard: {
        label: "STANDARD",
        name: "Standard",
        metal: "10K Tri-Colour Gold",
        stones: "Natural Stones",
        description: "Made to order · 3–4 weeks · Complimentary insured shipping",
      },
    },

    specs: "Tri-colour gold · ~18.5 grams · ~3.90 carats total · 10K gold · Natural stones",

    composition: {
      metal: "Tri-colour gold",
      weightGrams: "~18.5 grams",
      caratsTotal: "~3.90 carats total",
      price: "$8,500 USD",
      details: "10K gold · Natural stones",
    },

    // Gallery — real product photography (7 slots)
    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/9erkjubh_1000148134.png", alt: "Le Cocktail de Jessica — hero, ring on cream cushion", intent: "HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/84gb9vxf_1000148149.png", alt: "Le Cocktail de Jessica — clean product on cream", intent: "PRODUCT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/b226smnl_1000148156.png", alt: "Le Cocktail de Jessica — architectural view, three bands from below", intent: "ARCHITECTURE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/h0rmqpqm_1000148139.png", alt: "Le Cocktail de Jessica — three-quarter angle", intent: "ANGLE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/m3929xbd_1000148138.png", alt: "Le Cocktail de Jessica — reverse angle, band geometry", intent: "MOVEMENT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/8wfuz0yl_1000148154.png", alt: "Le Cocktail de Jessica — macro detail", intent: "MACRO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/www6zbc8_1000148150.png", alt: "Le Cocktail de Jessica — on cream leather cushion, lifestyle", intent: "LIFESTYLE" }
    ],

    // Image break (full-width editorial)
    imageBreak:
      "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/www6zbc8_1000148150.png",

    sizeProfile: {
      type: "ring",
      min: 4,
      max: 10,
      halfSizes: true,
      customAbove: 10,
    },

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // PRISE DE COURONNE
  // Gents Ring — Pavé crown band
  // ==========================================
  priseDeCouronne: {
    name: "PRISE DE COURONNE",
    slug: "prise-de-couronne",
    category: "rings",
    audience: ["gentlemens-club", "collective"],
    subtitle: "Signature Ring",
    categoryType: "Ring",
    shopMaterialLine: "Signature Ring · Pavé Crown Band · Black Enamel",
    tagline: "The crown was never given. It was taken.",
    collections: ["gents-rings", "signature", "collective"],
    currency: "USD",
    priceFrom: "$2,000 USD",
    basePrice: 2000,
    dynamicPricing: true,
    pricingPending: false,
    defaultTier: "signature",
    isFeatured: true,
    isNew: true,
    displayOrder: 3,
    showInHomepageCarousel: true,

    imageUrl:
      "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/j97q3uqn_1000148293.png",

    pricing: {
      foundation: 2800,
      signature:  6200,
    },

    tiers: {
      foundation: {
        label: "FOUNDATION",
        name: "Foundation",
        metal: "925 Silver · Black Enamel",
        stones: "High-Impact Stones",
        badge: "",
        description: "925 silver with black enamel. High-impact stones.",
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "10K Gold · Black Enamel",
        stones: "Lab Diamonds",
        badge: "MOST POPULAR",
        description: "10K gold with black enamel. Lab diamonds.",
      },
    },

    specs: "Pavé crown band · Black enamel · Wide band",

    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/j97q3uqn_1000148293.png", alt: "Prise de Couronne — pavé crown band", intent: "HERO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/xkmsgrlo_1000148292.png", alt: "Prise de Couronne — three-quarter angle", intent: "ANGLE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/01qfiair_1000148278.png", alt: "Prise de Couronne — side profile", intent: "SIDE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/ql06bws0_1000148294.png", alt: "Prise de Couronne — alternate angle", intent: "ANGLE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/d1dv4hty_1000148306.png", alt: "Prise de Couronne — detail", intent: "DETAIL" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/7povm3wv_1000148305.png", alt: "Prise de Couronne — crown macro", intent: "MACRO" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/zl21l19o_1000148314.png", alt: "Prise de Couronne — worn on the hand", intent: "WORN" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/kmn0a2fj_1000148318.png", alt: "Prise de Couronne — editorial portrait", intent: "EDITORIAL" }
    ],

    sizeProfile: {
      type: "ring",
      min: 6,
      max: 12,
      halfSizes: true,
      customAbove: 12,
    },

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // THE PHILEON NERVATURA
  // Architectural drop earrings — structural, controlled
  // ==========================================
  nervatura: {
    name: "THE PHILEON NERVATURA",
    slug: "nervatura",
    category: "earrings",
    audience: ["ladies", "collective"],
    subtitle: "Architectural Drop Earrings",
    categoryType: "Earrings",
    shopMaterialLine: "Architectural Drop Earrings · 10K / 14K / 18K Gold",
    tagline: "The line carries the form.",
    collections: ["ladies-earrings", "editorial", "collective"],
    currency: "USD",
    priceFrom: "$900 USD",
    basePrice: 900,
    dynamicPricing: true,
    pricingPending: false,
    defaultTier: "foundation",
    isFeatured: true,
    isNew: true,
    displayOrder: 4,
    showInHomepageCarousel: false,

    imageUrl:
      "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/acj6mi7n_1000148370.jpg",

    pricing: {
      foundation: 1200,
      signature:  1800,
      heirloom:   2600,
    },

    tiers: {
      foundation: {
        label: "FOUNDATION",
        name: "Foundation",
        metal: "10K Gold",
        badge: "Most Chosen",
        description: "Essential structure.",
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K Gold",
        badge: "",
        description: "Elevated tone and weight.",
      },
      heirloom: {
        label: "HEIRLOOM",
        name: "Heirloom",
        metal: "18K Gold",
        badge: "Collector",
        description: "Full density expression.",
      },
    },

    specs: "Architectural drop earrings · Structural mesh · 10K / 14K / 18K Gold",

    gallery: [
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/acj6mi7n_1000148370.jpg", alt: "The Phileon Nervatura — clean product flat-lay", intent: "PRODUCT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/mllm098y_1000148444.png", alt: "Nervatura — three-quarter angle pair", intent: "ANGLE" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/7mytqo56_1000148497.png", alt: "Nervatura — editorial close-up", intent: "EDITORIAL" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/kun0nd6x_1000148492.png", alt: "Nervatura — worn on the model", intent: "WORN" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/o98pvuwa_1000148503.png", alt: "Nervatura — close portrait", intent: "PORTRAIT" },
      { type: "image", src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/mng5l3vy_1000148443.png", alt: "Nervatura — macro mesh detail", intent: "MACRO" }
    ],

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // THE DON GORGON
  // Dual-state ring (HOME black / AWAY white pavé), ruby rail
  // Multi-metal (Silver / Gold) with tiered pricing on Gold only
  // ==========================================
  theDonGorgon: {
    name: "THE DON GORGON",
    slug: "the-don-gorgon",
    category: "rings",
    audience: ["gentlemens-club", "collective"],
    subtitle: "Dual-State Ring",
    categoryType: "Ring",
    shopMaterialLine: "Dual-State Ring · Black / White Pavé · Ruby Rail",
    tagline: "Two sides of the same authority.",
    collections: ["gentlemens-club", "collective"],
    currency: "USD",
    priceFrom: "$2,500 USD",
    basePrice: 2500,
    dynamicPricing: true,
    pricingPending: false,
    isFeatured: true,
    isNew: true,
    displayOrder: 5,
    showInHomepageCarousel: true,

    // Default product card image — FORCE HOME HERO (cinematic black pavé shot)
    imageUrl: "/don-gorgon/home/01_hero.png",

    // Two colorways
    variants: {
      home: {
        key: "home",
        name: "HOME",
        label: "Black",
        description: "Authority, held.",
        adjustment: 300,
      },
      away: {
        key: "away",
        name: "AWAY",
        label: "White",
        description: "Control, expressed.",
        adjustment: 0,
      },
    },

    // Metal × Tier matrix
    metals: {
      silver: {
        key: "silver",
        name: "Silver (White Series)",
        note: "White Series — entry without compromise.",
        tiers: {
          foundation: { key: "foundation", name: "Foundation", price: 2800, description: "Entry expression. Nothing removed." },
        },
      },
      gold: {
        key: "gold",
        name: "Gold",
        tiers: {
          foundation: { key: "foundation", name: "Foundation", price: 6800, description: "The full expression. Nothing removed." },
          signature:  { key: "signature",  name: "Signature",  price: 9200, description: "Elevated weight and tone." },
          heirloom:   { key: "heirloom",   name: "Heirloom",   price: 14500, description: "Maximum density. Lasting." },
        },
      },
    },

    defaultSelection: {
      variant: "home",
      metal: "gold",
      tier: "foundation",
    },

    // Per-variant gallery — AWAY fully populated (6 photos), HOME pending additional shots
    gallery: {
      home: [
        { src: "/don-gorgon/home/01_hero.png",            alt: "The Don Gorgon — HOME (3/4 hero, black pavé)" },
        { src: "/don-gorgon/home/02_front.png",           alt: "The Don Gorgon — HOME (clean product, cream cushion)" },
        { src: "/don-gorgon/home/04_low_front.png",       alt: "The Don Gorgon — HOME (alternate angle, architectural)" },
        { src: "/don-gorgon/home/07_on_finger_hero.png",  alt: "The Don Gorgon — HOME (on-finger, lifestyle)" },
        { src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/d58fgb99_1000148811.png", alt: "The Don Gorgon — HOME (authenticated product, white gold)" },
        { src: "/don-gorgon/home/08_on_finger_macro.png", alt: "The Don Gorgon — HOME (on-finger, macro)" },
        { src: "/don-gorgon/home/05_macro_ruby.png",      alt: "The Don Gorgon — HOME (macro, ruby rail)" },
        { src: "/don-gorgon/home/06_macro_pave.png",      alt: "The Don Gorgon — HOME (macro, black pavé texture)" },
        { src: "/don-gorgon/home/09_box_moment.png",      alt: "The Don Gorgon — HOME (ownership / box)" },
        { src: "/don-gorgon/home/10_carousel.png",        alt: "The Don Gorgon — HOME (editorial carousel)" },
        { src: "/don-gorgon/home/03_topdown.png",         alt: "The Don Gorgon — HOME (top-down)" },
      ],
      away: [
        { src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/dvsar5to_1000148718.png", alt: "The Don Gorgon — AWAY (3/4 hero, white pavé)" },
        { src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/djgex5cm_1000148722.png", alt: "The Don Gorgon — AWAY (clean product, cream cushion)" },
        { src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/9vimli6r_1000148724.png", alt: "The Don Gorgon — AWAY (alternate angle)" },
        { src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/tvyum380_1000148750.png", alt: "The Don Gorgon — AWAY (on-finger)" },
        { src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/8it7op3p_1000148738.png", alt: "The Don Gorgon — AWAY (macro, ruby rail)" },
        { src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/5q24m209_1000148728.png", alt: "The Don Gorgon — AWAY (macro, pavé texture)" },
        { src: "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/8en7jk9g_1000147731.png", alt: "The Don Gorgon — AWAY (studio)" },
      ],
    },

    // Hero — until /videos/the-don-gorgon.mp4 is uploaded, page falls back to the HOME cinematic hero
    hero: {
      videoSrc: null,
      poster: "/don-gorgon/home/01_hero.png",
    },

    heroText: {
      eyebrow: "PHILEON",
      title: "THE DON GORGON",
      subline: "Two sides of the same authority.",
    },

    microCopy: {
      silver: "White Series — entry without compromise.",
      foundation: "The full expression. Nothing removed.",
    },

    specs: "3/4 pavé structure · 12-stone ruby rail · Multi-metal · Dual-state",

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // THE GRAND DAME (Cuff)
  // Sculptural open cuff — Rose Gold / Yellow Gold, 3 tiers
  // FIXED PRICING (live metals market disabled per spec)
  // ==========================================
  theGrandDame: {
    name: "The Grand Dame Cuff",
    slug: "the-grand-dame",
    category: "bracelets",
    audience: ["ladies"],
    type: "cuff",
    subtitle: "Sculptural Open Cuff",
    categoryType: "Cuff Bracelet",
    shopMaterialLine: "Sculptural Open Cuff · Rose / Yellow Gold · Mesh Lattice",
    tagline: "Old money never speaks first.",
    collections: ["ladies"],
    currency: "USD",
    priceFrom: "$12,500 USD",
    basePrice: 12500,
    pricingType: "fixed",
    livePricing: false,
    dynamicPricing: false,
    pricingPending: false,
    isFeatured: true,
    isNew: true,
    displayOrder: 6,
    showInHomepageCarousel: false,

    // Default product card image — cinematic 3/4 hero
    imageUrl: "/grand-dame/01_hero.png",

    // Two metals, three tiers each (parity pricing across metals)
    metals: {
      rose: {
        key: "rose",
        name: "Rose Gold",
        note: "Polished rose gold mesh — old money restraint.",
        tiers: {
          foundation: { key: "foundation", name: "Foundation", price: 9500,  description: "Entry expression. Polished rose gold mesh." },
          signature:  { key: "signature",  name: "Signature",  price: 12500, description: "Elevated weight and structure." },
          heirloom:   { key: "heirloom",   name: "Heirloom",   price: 17000, description: "Maximum density. Lasting." },
        },
      },
      yellow: {
        key: "yellow",
        name: "Yellow Gold",
        note: "Polished yellow gold mesh — heritage warmth.",
        tiers: {
          foundation: { key: "foundation", name: "Foundation", price: 9500,  description: "Entry expression. Polished yellow gold mesh." },
          signature:  { key: "signature",  name: "Signature",  price: 12500, description: "Elevated weight and structure." },
          heirloom:   { key: "heirloom",   name: "Heirloom",   price: 17000, description: "Maximum density. Lasting." },
        },
      },
    },

    defaultSelection: {
      metal: "rose",
      tier: "signature",
    },

    // 9-slot editorial narrative
    gallery: [
      { src: "/grand-dame/01_hero.png",          alt: "The Grand Dame — hero (authority)" },
      { src: "/grand-dame/02_front.png",         alt: "The Grand Dame — front view, structure clarity" },
      { src: "/grand-dame/04_side_profile.png",  alt: "The Grand Dame — 3/4 angle, form and curvature" },
      { src: "/grand-dame/05_macro.png",         alt: "The Grand Dame — macro, lattice craftsmanship" },
      { src: "/grand-dame/09_on_wrist_real.png", alt: "The Grand Dame — on wrist, primary lifestyle" },
      { src: "/grand-dame/03_topdown.png",       alt: "The Grand Dame — opening detail, top-down" },
      { src: "/grand-dame/11_in_hand_real.png",  alt: "The Grand Dame — in hand, scale reference" },
      { src: "/grand-dame/10_on_wrist_real.png", alt: "The Grand Dame — on wrist, editorial" },
      { src: "/grand-dame/06_on_surface.png",    alt: "The Grand Dame — final cinematic close" },
    ],

    hero: {
      videoSrc: "/videos/grand-dame-hero.mp4",
      poster: "/grand-dame/01_hero.png",
    },

    heroText: {
      eyebrow: "PHILEON",
      title: "THE GRAND DAME",
      subline: "Old money never speaks first.",
    },

    specs: "Sculptural open cuff · Solid gold (10K / 14K / 18K) · Fine mesh lattice · Made to order",

    // Detailed specifications (rendered on the page)
    detailedSpecs: {
      width: "15 mm",
      innerSpan: "60 mm",
      openingGap: "30 mm",
      weight: "45 grams",
      material: "Solid Gold (10K / 14K / 18K depending on selection)",
      finish: "High polish exterior with lattice structure",
      construction: "Open cuff, engineered for balance and tension",
    },

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // THE CARAPACE (Statement Ring)
  // STRICT IMAGE CONTROL — gallery is FIXED to 5 approved frames.
  // Do NOT auto-generate, regenerate, or add new angles. Image set is final.
  // ==========================================
  theCarapace: {
    name: "The Carapace",
    slug: "the-carapace",
    category: "rings",
    subcategory: "statement",
    audience: ["ladies", "gentlemens-club", "collective"],
    type: "ring",
    subtitle: "Sculptural Lattice Dome Ring",
    categoryType: "Statement Ring",
    shopMaterialLine: "Sculptural Lattice Dome · Vermeil · 10K Gold",
    tagline: "Not a ring, a reputation.",
    collections: ["collective"],
    currency: "USD",
    priceFrom: "$1,100 USD",
    basePrice: 1100,
    pricingType: "fixed",
    livePricing: false,
    dynamicPricing: false,
    pricingPending: false,
    isFeatured: true,
    isNew: true,
    displayOrder: 7,
    showInHomepageCarousel: false,

    imageUrl: "/carapace/13_hero_v2.png",

    hasVariants: true,
    variantType: "metal",
    variants: [
      { key: "vermeil",       metal: "Vermeil",       price: 350,  default: false, pave: false, imageSet: "base", description: "Gilt silver foundation." },
      { key: "vermeil-pave",  metal: "Vermeil Pavé",  price: 600,  default: false, pave: true,  imageSet: "pave", description: "Cubic-zirconia pavé set into the lattice." },
      { key: "10k",           metal: "10K Gold",      price: 1100, default: true,  pave: false, imageSet: "base", description: "Solid 10K gold exoskeleton." },
      { key: "10k-pave",      metal: "10K Pavé",      price: 1450, default: false, pave: true,  imageSet: "pave", description: "Lab-grown diamond pavé inside the 10K lattice." },
    ],

    defaultSelection: {
      metal: "10k",
    },

    shopDisplay: {
      showFromPrice: false,
      showExactPrice: true,
    },

    specs: "Sculptural lattice dome · Open exoskeleton · High-polish · Vermeil / 10K Gold",
    detailedSpecs: {
      weight: "8.5 grams",
      material: "Vermeil / 10K Gold",
      construction: "Open lattice structure",
      form: "Sculptural dome profile",
      finish: "High polish",
      fit: "Standard ring sizing",
      leadTime: "Made to order · 2–3 weeks · Complimentary insured shipping",
    },

    // STRICT IMAGE CONTROL — fully locked 5-frame set, ALL authentic photography.
    // 1. Hero front-facing (real)   2. Top-down (real)
    // 3. Side profile + band (real)   4. Macro detail (real)
    // 5. On-hand (real)
    gallery: [
      { src: "/carapace/13_hero_v2.png",     alt: "The Carapace — hero front-facing (elongated oval shield)" },
      { src: "/carapace/07_top_real.png",    alt: "The Carapace — top-down view (oval domed geometry)" },
      { src: "/carapace/14_side_real.png",   alt: "The Carapace — side profile and band" },
      { src: "/carapace/15_macro_real.png",  alt: "The Carapace — macro detail (lattice structure)" },
      { src: "/carapace/12_on_hand_v2.png",  alt: "The Carapace — on-hand (finger placement)" },
    ],

    // PAVÉ IMAGE SET — used when variant.imageSet === "pave"
    // (Vermeil Pavé and 10K Pavé). Order locked per spec:
    //   1. Black-background pavé hero (silhouette clarity)
    //   2. Editorial portrait (campaign emotion)
    //   3. Interaction shot — hand adjusting (ownership psychology)
    //   4. Macro detail (craftsmanship + stone integration)
    //   5. Structure / wearable clarity (dome depth, band visibility)
    paveGallery: [
      { src: "/carapace-pave/01_hero.png",        alt: "The Carapace Pavé — black-background hero (oval shield silhouette)" },
      { src: "/carapace-pave/02_editorial.png",   alt: "The Carapace Pavé — editorial portrait" },
      { src: "/carapace-pave/03_interaction.png", alt: "The Carapace Pavé — hand adjusting the ring" },
      { src: "/carapace-pave/04_macro.png",       alt: "The Carapace Pavé — macro lattice and pavé detail" },
      { src: "/carapace-pave/05_structure.png",   alt: "The Carapace Pavé — wearable clarity, dome and band" },
    ],
    paveHero: "/carapace-pave/01_hero.png",

    hero: {
      videoSrc: null,
      poster: "/carapace/13_hero_v2.png",
    },

    heroText: {
      eyebrow: "PHILEON",
      title: "THE CARAPACE",
      subline: "Not a ring, a reputation.",
    },

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // MIDWEEK — Sterling Silver mesh cuff with black-diamond pavé barrels.
  // Gentlemen's Club edition. Single price, single variant.
  // ==========================================
  midweek: {
    name: "MIDWEEK",
    slug: "midweek",
    category: "bracelets",
    subcategory: "cuff",
    audience: ["gentlemens-club", "collective"],
    type: "bracelet",
    subtitle: "Sterling Silver Mesh Cuff",
    categoryType: "Cuff Bracelet",
    shopMaterialLine: "Woven Sterling Silver · Black Diamond Pavé",
    tagline: "Two on the wrist. One on the table.",
    collections: ["gentlemens-club", "collective"],
    currency: "USD",
    priceFrom: "$850 USD",
    basePrice: 850,
    pricingType: "fixed",
    livePricing: false,
    dynamicPricing: false,
    pricingPending: false,
    isFeatured: true,
    isNew: true,
    displayOrder: 8,
    showInHomepageCarousel: true,

    imageUrl: "/midweek/01_hero.png",

    hasVariants: true,
    variantType: "metal",
    variants: [
      {
        key: "silver-black-dia",
        metal: "Sterling Silver + Black Diamonds",
        price: 850,
        default: true,
        pave: false,
        imageSet: "base",
        description: "Sterling silver mesh cuff with two pavé black-diamond barrels on the front.",
      },
    ],

    defaultSelection: {
      metal: "silver-black-dia",
    },

    shopDisplay: {
      showFromPrice: false,
      showExactPrice: true,
    },

    purchaseNote: "Includes one MIDWEEK cuff. Styled stacked throughout the campaign imagery.",

    specs: "Woven sterling silver · Black diamond pavé · 28.4g · Made to order",
    detailedSpecs: {
      weight: "28.4 grams",
      material: "Sterling Silver",
      stones: "Black Diamonds",
      construction: "Woven architectural cuff",
      form: "Round mesh weave with three barrel pavé stations",
      finish: "High polish",
      fit: "Designed for daily and evening wear",
      wearability: "Designed for daily and evening wear",
      origin: "Made to order",
      leadTime: "Made to order · 2–3 weeks · Complimentary insured shipping",
    },

    // STRICT CAMPAIGN LOCK — 5 approved slides, exact order:
    // DESIGN: CLOSED slide-on bangle (continuous loop) with EXACTLY TWO black-
    //         diamond pavé barrels on the FRONT, close together. Plain silver
    //         mesh on the back and sides.
    // 1. HERO STACK         — two bangles on pool table (user's authentic photo)
    // 2. EDITORIAL PORTRAIT — full body, fedora, navy shirt, holding cue (real photo)
    // 3. ON-WRIST ENV       — environmental on-wrist with billiard table + cue (real photo)
    // 4. ON-WRIST WHISKEY   — close on-wrist with whiskey glass blurred (real photo)
    // 5. MACRO DETAIL       — close-up of one black-diamond barrel meeting the weave
    gallery: [
      { src: "/midweek/01_hero.png",            alt: "MIDWEEK — hero stack on pool table" },
      { src: "/midweek/10_editorial_pool.png",  alt: "MIDWEEK — editorial portrait at the pool table" },
      { src: "/midweek/11_wrist_env.png",       alt: "MIDWEEK — two stacked bangles on wrist (environmental)" },
      { src: "/midweek/12_wrist_whiskey.png",   alt: "MIDWEEK — two stacked bangles on wrist (whiskey lounge)" },
      { src: "/midweek/05_macro.png",           alt: "MIDWEEK — macro detail (black-diamond barrel)" },
    ],

    hero: {
      videoSrc: "/midweek/hero.mp4",
      poster: "/midweek/01_hero.png",
    },

    heroText: {
      eyebrow: "PHILEON · GENTLEMEN'S CLUB",
      title: "MIDWEEK",
      subline: "For the night that didn't ask permission.",
    },

    shipping: "Complimentary insured shipping within Canada."
  },

  // ==========================================
  // WYNETTE'S PALETTE
  // Collector Cocktail Ring — black rose-cut centre stone,
  // multi-colour gemstone halo, hand-engraved white-gold gallery.
  // Made to order. From $2,000 USD (Sterling Silver tier).
  // ==========================================
  wynettePalette: {
    name: "WYNETTE'S PALETTE",
    slug: "wynette-palette",
    category: "rings",
    audience: ["ladies", "collective"],
    collections: ["rings", "collective", "ladies"],
    subtitle: "Collector Cocktail Ring",
    tagline: "Every island brought a colour.",
    priceFrom: "From $2,000 USD",
    basePrice: 2000,

    // Hero image for shop cards & carousel
    imageUrl: "/wynette/hero.jpg",

    // Pricing Configuration
    dynamicPricing: true,
    currency: "USD",
  },

  // ==========================================
  // VEYRON NOIR — PHILEON Tribute Series
  // Gentlemen's cocktail signet. Black diamond pavé, ruby horizon,
  // Bugatti-inspired grille architecture. 4 metal tiers
  // (Sterling Silver · 10K · 14K · 18K White Gold). Made to order.
  // From $1,450 USD (Sterling Silver Entry tier).
  // ==========================================
  veyronNoir: {
    name: "VEYRON NOIR",
    slug: "veyron-noir",
    category: "rings",
    audience: ["gentlemens-club", "collective"],
    collections: ["rings", "tribute", "collective", "gentlemens-club"],
    subtitle: "Tribute Series · 4 Metal Tiers",
    tagline: "Not every tribute is a memory. Some are machines.",
    priceFrom: "From $1,450 USD",
    basePrice: 1450,

    imageUrl: "/veyron-noir/hero.png",

    dynamicPricing: true,
    currency: "USD",
  },

  // ==========================================
  // UNCLE JO — PHILEON · Signature Mesh Collection
  // Handwoven mesh statement ring + matching cuff. Solid metal, no stones.
  // 2 metals × 3 selections (Ring/Cuff/Set) = 6 SKUs.
  // From $1,100 USD (Sterling Silver · Ring Only).
  // ==========================================
  uncleJo: {
    name: "UNCLE JO",
    slug: "uncle-jo",
    category: "rings",
    audience: ["gentlemens-club"],
    collections: ["rings", "gentlemen", "gentlemens-club", "signature-mesh", "new-arrivals", "featured"],
    subtitle: "Signature Mesh Collection",
    tagline: "Built for the man who never needed an introduction.",
    priceFrom: "From $1,100 USD",
    basePrice: 1100,
    featured: true,
    newArrival: true,
    imageUrl: "/uncle-jo/hero.jpg",
    dynamicPricing: true,
    currency: "USD",
  },

  // ==========================================
  // ROSE OF SHARON — Sacred Collection · Floral Cross Pendant
  // 10K or 14K Rose Gold · Small (28×18mm) or Signature (40×25mm).
  // From $950 USD. Chain sold separately.
  // ==========================================
  roseOfSharon: {
    name: "ROSE OF SHARON",
    slug: "rose-of-sharon",
    category: "pendants",
    audience: ["ladies-first", "collective"],
    collections: ["pendants", "ladies", "collective", "ladies-first", "new-arrivals", "featured"],
    subtitle: "Floral Cross Pendant · 10K & 14K Rose Gold",
    tagline: "A cross formed entirely from blooming roses, climbing vines, and sculpted petals.",
    priceFrom: "From $2,800 USD",
    basePrice: 2800,
    featured: true,
    newArrival: true,
    displayOrder: 1,
    showOnHomepage: true,
    showInCarousel: true,
    showInCollective: true,
    seoDescription: "Rose of Sharon is a floral cross pendant handcrafted in 10K and 14K rose gold. Sculpted roses, climbing vines, and openwork architecture create a symbolic piece celebrating faith, beauty, remembrance, and devotion.",
    imageUrl: "/rose-of-sharon/hero.png",
    dynamicPricing: true,
    currency: "USD",
  },

  // ==========================================
  // BOSS KNOT — Gentleman's Club · Executive Pendant · The Collective
  // Woven mesh architecture · 70mm × 25mm · 18" matching chain included.
  // 3 SKUs: Sterling Silver $3,200 · 10K Yellow Gold $8,500 · 10K White Gold $8,500.
  // ==========================================
  bossKnot: {
    name: "BOSS KNOT",
    slug: "boss-knot",
    category: "pendants",
    audience: ["gentlemens-club", "collective"],
    collections: ["pendants", "gentlemen", "gentlemens-club", "collective", "the-collective", "new-arrivals", "featured"],
    subtitle: "Executive Pendant · 18\" Chain Included",
    tagline: "For those who don't get out often. But when they do, they arrive.",
    priceFrom: "From $3,200 USD",
    basePrice: 3200,
    featured: true,
    newArrival: true,
    displayOrder: 2,
    showOnHomepage: true,
    showInCarousel: true,
    showInCollective: true,
    seoDescription: "BOSS KNOT is an executive pendant — woven mesh architecture translating the necktie into precious metal. Sterling Silver, 10K Yellow Gold, or 10K White Gold. 18\" matching chain included. Made for arrival.",
    imageUrl: "/boss-knot/hero.png",
    dynamicPricing: true,
    currency: "USD",
  }

};
