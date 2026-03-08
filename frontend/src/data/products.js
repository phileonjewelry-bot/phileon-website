export const products = {

  laMarva: {
    name: "La Marva",
    story: "Named in honor of Marva Wilson.",
    tribute: "Named in honor of Marva Wilson — a woman whose strength, grace, and quiet presence left a lasting imprint on all who knew her.",
    description: "La Marva is more than a ring. It is a tribute to legacy and devotion, crafted where structure meets softness, and power meets elegance.",
    baselineGoldUSD: 2650, // USD/oz when prices were locked
    pricing: {
      signature: 3400,
      foundation: 8000,
      heirloom14k: 18000,
      heirloom18k: 22000
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

  annieRose: {
    name: "Annie Rose",
    tribute: "Created in honor of my sister Andrea.",
    tagline: "Soft in tone. Strong in spirit.",
    metals: ["10K", "14K", "18K"],
    stones: ["Cubic", "Lab", "Natural"],
    pricing: {
      gold10k: 6400,
      gold14k: 7400,
      gold18k: 7900
    }
  },

  monikaCouture: {
    name: "Monika Couture Earrings",
    weight: "10g per pair",
    pricing: {
      silver: 1400,
      white10k: 3700,
      yellow10k: 3700,
      rose10k: 3700
    }
  }

};
