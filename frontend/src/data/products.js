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
    basePrice: 3400,
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
    basePrice: 6400,
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
    basePrice: 1400,
    
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
    basePrice: 1250,
    
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
    basePrice: 1050,
    
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
    slug: "rosaria",
    category: "earrings",
    audience: "ladies",
    subtitle: "The Rosaria Earrings",
    categoryType: "Earrings",
    tagline: "Sculpted Roses in Rose Gold",
    description: "Rosaria captures the beauty of a rose in full bloom, transformed into wearable sculpture. Each rose is sculpted in precious metal and arranged in a cascading composition that moves gracefully with the wearer. The design preserves the elegance of a flower in gold — a tribute to love, celebration, and permanence.",
    materialNote: "Available exclusively in 10K and 14K rose gold.",
    basePrice: 2950,
    
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
    slug: "desir-corset",
    category: "pendants",
    audience: "ladies",
    subtitle: "Wearable Architecture",
    categoryType: "Pendants",
    tagline: "Sculptural Form Meets Fine Jewelry",
    description: "Inspired by the structure of couture corsetry, the Désir Corset Pendant transforms sculpted form into wearable architecture. Fine mesh panels create depth and texture within a polished rose gold frame, forming a tapered waist and sculpted cup structure that echo the lines of high fashion tailoring. Designed to sit naturally against the chest, the pendant features subtle curvature and balanced proportions that allow the piece to hang elegantly from a delicate chain. A statement piece that blends sculpture, fashion, and fine jewelry.",
    basePrice: 5995,
    
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
    basePrice: 695,

    // Metal options with images (prepared for unique images per variant)
    metalOptions: {
      solidGold: [
        {
          id: "yellow-10k",
          name: "10K Yellow Gold",
          shortName: "Yellow 10K",
          price: 2850,
          currency: "CAD",
          image: "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png"
        },
        {
          id: "rose-10k",
          name: "10K Rose Gold",
          shortName: "Rose 10K",
          price: 2850,
          currency: "CAD",
          image: "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png"
        }
      ],
      platedSilver: [
        {
          id: "plated-yellow",
          name: "Gold Plated Silver (Yellow)",
          shortName: "Yellow Plated",
          price: 695,
          currency: "CAD",
          image: "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png"
        },
        {
          id: "plated-rose",
          name: "Gold Plated Silver (Rose)",
          shortName: "Rose Plated",
          price: 695,
          currency: "CAD",
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
    description: "Structured motion. Captured in metal.",
    basePrice: 1450,
    
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
    tagline: "Weight. Discipline. Presence.",
    description: "TOLA II is built on restraint and control. A structured gold form, anchored by a central chain and framed with precision-set black stones. Every surface is intentional. Every detail holds weight.",
    basePrice: 5200,
    
    // Hero image for shop cards
    imageUrl: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png",
    
    // Pricing Configuration (Ironclad Rules: Yellow Gold Only)
    dynamicPricing: false,
    currency: "CAD",
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
    tagline: "Faith, Worn With Intention.",
    subline: "Built on Belief.",
    basePrice: 3800,
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "CAD",
    
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
    tagline: "Lines of Movement.",
    basePrice: 900,
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "CAD",
    
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
    tagline: "Sculptural. Structural. Unapologetically Statement.",
    basePrice: 12800,
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "CAD",
    
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
    tagline: "From Egypt to Santorini. Places turned into pieces.",
    basePrice: 4800,
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "CAD",
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
    currency: "CAD",
    collections: ["ladies-earrings", "collective"],
    defaultVariant: "core",
    defaultTier: "signature",
    basePrice: 1400,
    priceFrom: "From $1,400 CAD",
    
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
    priceFrom: "From $4,400 CAD",
    basePrice: 4400,
    
    // Hero image for shop cards
    imageUrl: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/fvt6nsns_1000144990.png",
    
    // Pricing Configuration
    dynamicPricing: false,
    currency: "CAD",
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
        badge: ""
      },
      signature: {
        label: "SIGNATURE",
        name: "Signature",
        metal: "14K White Gold",
        stones: "Lab / mid-grade natural mix",
        badge: "MOST POPULAR"
      },
      heirloom: {
        label: "HEIRLOOM",
        name: "Heirloom",
        metal: "18K White Gold",
        stones: "Natural stones (upgraded quality)",
        badge: "COLLECTOR"
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
  }

};
