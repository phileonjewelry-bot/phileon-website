/**
 * Live Pricing Configuration
 * 
 * Each product tier stores:
 * - lockedBasePriceCad: the retail price at time of upload
 * - metalType: "10K" | "14K" | "18K" | "925"
 * - weightGrams: weight of metal in the piece
 * - lockedMetalReferenceCad: metal value at upload time (calculated at ~$150/g 24K gold, ~$1.25/g silver)
 * 
 * Reference rates at lock time:
 *   10K = 10/24 × 150 = $62.50/g
 *   14K = 14/24 × 150 = $87.50/g  
 *   18K = 18/24 × 150 = $112.50/g
 *   925 silver = 0.925 × 1.25 = $1.16/g
 */

const livePricingConfig = {

  // LA MARVA
  laMarva: {
    signature:   { lockedBasePriceCad: 3400,  metalType: "925",  weightGrams: 22,   lockedMetalReferenceCad: 25 },
    foundation:  { lockedBasePriceCad: 8000,  metalType: "10K",  weightGrams: 18,   lockedMetalReferenceCad: 1125 },
    heirloom14k: { lockedBasePriceCad: 18000, metalType: "14K",  weightGrams: 20,   lockedMetalReferenceCad: 1750 },
    heirloom18k: { lockedBasePriceCad: 22000, metalType: "18K",  weightGrams: 22,   lockedMetalReferenceCad: 2475 },
  },

  // ANNIE ROSE
  annieRose: {
    silver:     { lockedBasePriceCad: 6400, metalType: "925",  weightGrams: 35, lockedMetalReferenceCad: 41 },
    gold10k:    { lockedBasePriceCad: 9200, metalType: "10K",  weightGrams: 30, lockedMetalReferenceCad: 1875 },
  },

  // MONIKA COUTURE
  monikaCouture: {
    silver:    { lockedBasePriceCad: 1400, metalType: "925",  weightGrams: 12, lockedMetalReferenceCad: 14 },
    white10k:  { lockedBasePriceCad: 2400, metalType: "10K",  weightGrams: 10, lockedMetalReferenceCad: 625 },
    rose10k:   { lockedBasePriceCad: 2400, metalType: "10K",  weightGrams: 10, lockedMetalReferenceCad: 625 },
    yellow10k: { lockedBasePriceCad: 2400, metalType: "10K",  weightGrams: 10, lockedMetalReferenceCad: 625 },
  },

  // ALEJANDRA HEELS
  alejandraHeels: {
    default: { lockedBasePriceCad: 1250, metalType: "925", weightGrams: 8, lockedMetalReferenceCad: 9 },
  },

  // PTP CUFF
  ptpCuff: {
    foundation: { lockedBasePriceCad: 1050, metalType: "925",  weightGrams: 45, lockedMetalReferenceCad: 52 },
    signature:  { lockedBasePriceCad: 2800, metalType: "10K",  weightGrams: 38, lockedMetalReferenceCad: 2375 },
    heirloom:   { lockedBasePriceCad: 4200, metalType: "14K",  weightGrams: 42, lockedMetalReferenceCad: 3675 },
  },

  // ROSARIA
  rosaria: {
    foundation: { lockedBasePriceCad: 2950, metalType: "10K", weightGrams: 8, lockedMetalReferenceCad: 500 },
    signature:  { lockedBasePriceCad: 4200, metalType: "14K", weightGrams: 9, lockedMetalReferenceCad: 788 },
    heirloom:   { lockedBasePriceCad: 6800, metalType: "18K", weightGrams: 10, lockedMetalReferenceCad: 1125 },
  },

  // DESIR CORSET
  desirCorset: {
    pendant:   { lockedBasePriceCad: 5995, metalType: "10K", weightGrams: 12, lockedMetalReferenceCad: 750 },
    full:      { lockedBasePriceCad: 8995, metalType: "10K", weightGrams: 18, lockedMetalReferenceCad: 1125 },
  },

  // FORME CUFF
  formeCuff: {
    foundation: { lockedBasePriceCad: 695,  metalType: "925",  weightGrams: 30, lockedMetalReferenceCad: 35 },
    signature:  { lockedBasePriceCad: 1800, metalType: "10K",  weightGrams: 25, lockedMetalReferenceCad: 1563 },
  },

  // RHYTHM MESH RING
  rhythmMeshRing: {
    foundation: { lockedBasePriceCad: 1450, metalType: "925",  weightGrams: 14, lockedMetalReferenceCad: 16 },
    signature:  { lockedBasePriceCad: 2800, metalType: "10K",  weightGrams: 12, lockedMetalReferenceCad: 750 },
  },

  // TOLA II
  tolaII: {
    foundation: { lockedBasePriceCad: 5200,  metalType: "10K", weightGrams: 16, lockedMetalReferenceCad: 1000 },
    signature:  { lockedBasePriceCad: 7800,  metalType: "14K", weightGrams: 18, lockedMetalReferenceCad: 1575 },
    heirloom:   { lockedBasePriceCad: 11000, metalType: "18K", weightGrams: 20, lockedMetalReferenceCad: 2250 },
  },

  // GALATIANS 6:14
  galatians614: {
    foundation: { lockedBasePriceCad: 3800, metalType: "10K", weightGrams: 14, lockedMetalReferenceCad: 875 },
    signature:  { lockedBasePriceCad: 5600, metalType: "14K", weightGrams: 15, lockedMetalReferenceCad: 1313 },
  },

  // TRACE
  trace: {
    foundation: { lockedBasePriceCad: 900,  metalType: "925",  weightGrams: 10, lockedMetalReferenceCad: 12 },
    signature:  { lockedBasePriceCad: 2200, metalType: "10K",  weightGrams: 8,  lockedMetalReferenceCad: 500 },
  },

  // BOUND
  bound: {
    foundation: { lockedBasePriceCad: 12800, metalType: "10K", weightGrams: 22, lockedMetalReferenceCad: 1375 },
    signature:  { lockedBasePriceCad: 16800, metalType: "14K", weightGrams: 24, lockedMetalReferenceCad: 2100 },
    heirloom:   { lockedBasePriceCad: 22000, metalType: "18K", weightGrams: 26, lockedMetalReferenceCad: 2925 },
  },

  // APEX
  apex: {
    core:       { lockedBasePriceCad: 4800,  metalType: "10K", weightGrams: 14, lockedMetalReferenceCad: 875 },
    foundation: { lockedBasePriceCad: 6400,  metalType: "10K", weightGrams: 16, lockedMetalReferenceCad: 1000 },
    signature:  { lockedBasePriceCad: 9200,  metalType: "14K", weightGrams: 18, lockedMetalReferenceCad: 1575 },
    heirloom:   { lockedBasePriceCad: 14000, metalType: "18K", weightGrams: 20, lockedMetalReferenceCad: 2250 },
  },

  // HOMAGE
  homage: {
    foundation: { lockedBasePriceCad: 1400, metalType: "925",  weightGrams: 18, lockedMetalReferenceCad: 21 },
    signature:  { lockedBasePriceCad: 3200, metalType: "10K",  weightGrams: 15, lockedMetalReferenceCad: 938 },
  },

  // CYPHER
  cypher: {
    foundation: { lockedBasePriceCad: 4400,  metalType: "10K", weightGrams: 15, lockedMetalReferenceCad: 938 },
    signature:  { lockedBasePriceCad: 6800,  metalType: "14K", weightGrams: 17, lockedMetalReferenceCad: 1488 },
    heirloom:   { lockedBasePriceCad: 9600,  metalType: "18K", weightGrams: 19, lockedMetalReferenceCad: 2138 },
  },

  // IL MORSO DEL RE
  morso: {
    foundation: { lockedBasePriceCad: 6800,  metalType: "10K", weightGrams: 18, lockedMetalReferenceCad: 1125 },
    signature:  { lockedBasePriceCad: 9400,  metalType: "14K", weightGrams: 20, lockedMetalReferenceCad: 1750 },
    heirloom:   { lockedBasePriceCad: 13200, metalType: "18K", weightGrams: 22, lockedMetalReferenceCad: 2475 },
  },

  // LA BETE
  labete: {
    foundation: { lockedBasePriceCad: 7400,  metalType: "10K", weightGrams: 20, lockedMetalReferenceCad: 1250 },
    signature:  { lockedBasePriceCad: 10200, metalType: "14K", weightGrams: 22, lockedMetalReferenceCad: 1925 },
    heirloom:   { lockedBasePriceCad: 14800, metalType: "18K", weightGrams: 24, lockedMetalReferenceCad: 2700 },
  },

  // BLESSED
  blessed: {
    foundation: { lockedBasePriceCad: 880,  metalType: "925",  weightGrams: 12, lockedMetalReferenceCad: 14 },
    signature:  { lockedBasePriceCad: 2200, metalType: "10K",  weightGrams: 10, lockedMetalReferenceCad: 625 },
    heirloom:   { lockedBasePriceCad: 3800, metalType: "14K",  weightGrams: 11, lockedMetalReferenceCad: 963 },
  },

  // COOGI I
  coogiI: {
    foundation: { lockedBasePriceCad: 12800, metalType: "10K", weightGrams: 15, lockedMetalReferenceCad: 938 },
    signature:  { lockedBasePriceCad: 16800, metalType: "14K", weightGrams: 17, lockedMetalReferenceCad: 1488 },
    heirloom:   { lockedBasePriceCad: 22000, metalType: "18K", weightGrams: 19, lockedMetalReferenceCad: 2138 },
  },

  // THE BAMBURGH
  bamburgh: {
    foundation: { lockedBasePriceCad: 8200,  metalType: "14K", weightGrams: 16, lockedMetalReferenceCad: 1400 },
    signature:  { lockedBasePriceCad: 9600,  metalType: "14K", weightGrams: 18, lockedMetalReferenceCad: 1575 },
    heirloom:   { lockedBasePriceCad: 11000, metalType: "18K", weightGrams: 18, lockedMetalReferenceCad: 2025 },
  },

  // LADY BAMBURGH
  ladyBamburgh: {
    foundation: { lockedBasePriceCad: 11400, metalType: "14K", weightGrams: 12, lockedMetalReferenceCad: 1050 },
    signature:  { lockedBasePriceCad: 14800, metalType: "14K", weightGrams: 14.5, lockedMetalReferenceCad: 1269 },
    heirloom:   { lockedBasePriceCad: 18800, metalType: "18K", weightGrams: 15, lockedMetalReferenceCad: 1688 },
  },
};

export default livePricingConfig;
