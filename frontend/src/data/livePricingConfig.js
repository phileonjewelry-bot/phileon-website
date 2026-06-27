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

  // WYNETTE'S PALETTE — Collector cocktail ring (black onyx + multi-colour halo)
  // Hand-set USD prices · USD-mirrored convention (matches Veyron Noir,
  // Uncle Jo, Battenti). lockedBasePriceCad numerically mirrors priceUsd
  // so /validate-cart returns diff=0. weightGrams=0 disables live metal
  // recalc — Wynette pricing is locked, not market-tracked.
  wynettePalette: {
    silver:    { lockedBasePriceCad: 2000, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k:   { lockedBasePriceCad: 6000, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold14k:   { lockedBasePriceCad: 8000, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
  },
  // VEYRON NOIR — Tribute Series cocktail signet · 4 metal tiers
  // Entry (Sterling Silver · synthetic), Foundation (10K WG · lab),
  // Signature (14K WG · lab · default), Heirloom (18K WG · natural).
  // Hand-set USD prices per atelier brief. lockedBasePriceCad numerically
  // mirrors USD display value so server_price == client_price on
  // /validate-cart (weightGrams=0 disables live metal recalc).
  // User CAD-spec → USD-mirrored: $1,950→$1,450 · $4,800→$3,500
  // · $6,800→$5,000 · $9,500→$7,000 (cadToUsdLuxury rounding).
  veyronNoir: {
    silver:  { lockedBasePriceCad: 1450, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k: { lockedBasePriceCad: 3500, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold14k: { lockedBasePriceCad: 5000, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold18k: { lockedBasePriceCad: 7000, metalType: "18K", weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // UNCLE JO — Signature Mesh Collection · Gentlemen's Ring + matching Cuff
  // 2 metals × 3 product selections (ring/cuff/set) = 6 SKUs.
  // Hand-set USD prices · USD-mirrored convention.
  // lockedBasePriceCad mirrors priceUsd so /validate-cart returns diff=0.
  uncleJo: {
    silver_ring:  { lockedBasePriceCad: 1100, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    silver_cuff:  { lockedBasePriceCad: 2200, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    silver_set:   { lockedBasePriceCad: 3000, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k_ring: { lockedBasePriceCad: 2800, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k_cuff: { lockedBasePriceCad: 5500, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k_set:  { lockedBasePriceCad: 7800, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // ROSE OF SHARON — The Collective · Floral Cross Pendant
  // 2 sizes (Classic/Grand) × 2 rose-gold metals = 4 SKUs · USD-mirrored.
  roseOfSharon: {
    classic_gold10k: { lockedBasePriceCad: 2800, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    classic_gold14k: { lockedBasePriceCad: 3800, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    grand_gold10k:   { lockedBasePriceCad: 4200, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    grand_gold14k:   { lockedBasePriceCad: 5600, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // BOSS KNOT — Gentleman's Club · Tribute to Power · Pendant
  // 3 metal tiers (Sterling Silver / 10K Yellow / 10K White).
  // Hand-set USD prices · USD-mirrored (weightGrams=0 disables live metal recalc).
  // lockedBasePriceCad numerically mirrors priceUsd so /validate-cart returns diff=0.
  bossKnot: {
    silver:         { lockedBasePriceCad: 3200, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k_yellow: { lockedBasePriceCad: 8500, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k_white:  { lockedBasePriceCad: 8500, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // LADY BOSS KNOT — Ladies First · Executive Statement Pendant
  // Same 3-metal matrix · feminine counterpart to BOSS KNOT.
  ladyBossKnot: {
    silver:         { lockedBasePriceCad: 3200, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k_yellow: { lockedBasePriceCad: 8500, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k_white:  { lockedBasePriceCad: 8500, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // KATRINA CASCATA — tribute earrings (Vermeil + 10K Yellow Gold)
  katrinaCascata: {
    vermeil:         { lockedBasePriceCad: 495,  metalType: "Vermeil", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10kYellow:   { lockedBasePriceCad: 2950, metalType: "10K",     weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // INSPIRATION VAULT — FIRST DISCOVERY (limited release, plated)
  inspirationVaultFirstDiscovery: {
    default: { lockedBasePriceCad: 75, metalType: "Vermeil", weightGrams: 0, lockedMetalReferenceCad: 0 },
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
  fondoCurvo: {
    silver:  { lockedBasePriceCad: 2950, metalType: "925", weightGrams: 12.5, lockedMetalReferenceCad: 14 },
    gold10k: { lockedBasePriceCad: 5400, metalType: "10K", weightGrams: 12.5, lockedMetalReferenceCad: 781 },
  },
  corinthians1514: {
    foundation: { lockedBasePriceCad: 4200, metalType: "10K", weightGrams: 16, lockedMetalReferenceCad: 1000 },
    signature:  { lockedBasePriceCad: 5900, metalType: "14K", weightGrams: 17, lockedMetalReferenceCad: 1488 },
    heirloom:   { lockedBasePriceCad: 8800, metalType: "18K", weightGrams: 18, lockedMetalReferenceCad: 2025 },
  },
  drape: {
    silver:     { lockedBasePriceCad: 1950, metalType: "925", weightGrams: 12.5, lockedMetalReferenceCad: 14 },
    foundation: { lockedBasePriceCad: 5200, metalType: "10K", weightGrams: 12.5, lockedMetalReferenceCad: 781 },
    signature:  { lockedBasePriceCad: 6800, metalType: "14K", weightGrams: 12.5, lockedMetalReferenceCad: 1094 },
    heirloom:   { lockedBasePriceCad: 9200, metalType: "18K", weightGrams: 12.5, lockedMetalReferenceCad: 1406 },
  },
  cocktailJessica: {
    standard: { lockedBasePriceCad: 8500, metalType: "10K", weightGrams: 18.5, lockedMetalReferenceCad: 1156 },
  },
  priseDeCouronne: {
    foundation: { lockedBasePriceCad: 2800, metalType: "925", weightGrams: 22, lockedMetalReferenceCad: 25 },
    signature:  { lockedBasePriceCad: 6200, metalType: "10K", weightGrams: 22, lockedMetalReferenceCad: 1375 },
  },
  nervatura: {
    foundation: { lockedBasePriceCad: 1200, metalType: "10K", weightGrams: 16, lockedMetalReferenceCad: 1000 },
    signature:  { lockedBasePriceCad: 1800, metalType: "14K", weightGrams: 16, lockedMetalReferenceCad: 1400 },
    heirloom:   { lockedBasePriceCad: 2600, metalType: "18K", weightGrams: 16, lockedMetalReferenceCad: 1800 },
  },
  // THE DON GORGON — dual-state ring. SKU key = `${metal}_${tier}_${variant}`.
  // HOME variant carries +$300 vs AWAY (priceAdjustments.home = +300).
  theDonGorgon: {
    silver_foundation_home: { lockedBasePriceCad: 3100, metalType: "925", weightGrams: 14, lockedMetalReferenceCad: 18 },
    silver_foundation_away: { lockedBasePriceCad: 2800, metalType: "925", weightGrams: 14, lockedMetalReferenceCad: 18 },
    gold_foundation_home:   { lockedBasePriceCad: 7100, metalType: "10K", weightGrams: 14, lockedMetalReferenceCad: 875 },
    gold_foundation_away:   { lockedBasePriceCad: 6800, metalType: "10K", weightGrams: 14, lockedMetalReferenceCad: 875 },
    gold_signature_home:    { lockedBasePriceCad: 9500, metalType: "14K", weightGrams: 14, lockedMetalReferenceCad: 1225 },
    gold_signature_away:    { lockedBasePriceCad: 9200, metalType: "14K", weightGrams: 14, lockedMetalReferenceCad: 1225 },
    gold_heirloom_home:     { lockedBasePriceCad: 14800, metalType: "18K", weightGrams: 14, lockedMetalReferenceCad: 1575 },
    gold_heirloom_away:     { lockedBasePriceCad: 14500, metalType: "18K", weightGrams: 14, lockedMetalReferenceCad: 1575 },
  },

  // LADY JAY — Tribute Series (4 metal tiers, white metal, sapphire + diamond pavé)
  // CAD bases reverse-calculated so cadToUsdLuxury produces the target USD:
  //   $4,800 / $8,500 / $11,000 / $14,500
  ladyJay: {
    foundation: { lockedBasePriceCad: 6400,  metalType: "925", weightGrams: 10.5, lockedMetalReferenceCad: 12 },
    signature:  { lockedBasePriceCad: 11334, metalType: "10K", weightGrams: 12.8, lockedMetalReferenceCad: 800 },
    heirloom:   { lockedBasePriceCad: 14667, metalType: "14K", weightGrams: 14.5, lockedMetalReferenceCad: 1269 },
    collector:  { lockedBasePriceCad: 19334, metalType: "18K", weightGrams: 17.2, lockedMetalReferenceCad: 1935 },
  },

  // THE TRUE VINE — PHILEON Sacred Objects · Pendant
  // 4 metal tiers × 4 chain options = 16 SKUs. Tier key format: "{metal}__{chain}".
  // weightGrams: 0 disables metal recalc (chain logic is hand-priced, not metals-driven).
  // Compound CAD = pendant base + chain add-on per the brief.
  theTrueVine: {
    // FOUNDATION · Sterling Silver Vermeil ($2,200 pendant)
    "foundation__pendant-only": { lockedBasePriceCad: 2200, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "foundation__rope-20":      { lockedBasePriceCad: 2650, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "foundation__rope-22":      { lockedBasePriceCad: 2750, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "foundation__rope-24":      { lockedBasePriceCad: 2850, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    // SIGNATURE · 10K Yellow Gold ($4,200 pendant)
    "signature__pendant-only":  { lockedBasePriceCad: 4200, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "signature__rope-20":       { lockedBasePriceCad: 4850, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "signature__rope-22":       { lockedBasePriceCad: 4950, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "signature__rope-24":       { lockedBasePriceCad: 5100, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    // HEIRLOOM · 14K Yellow Gold ($5,200 pendant)
    "heirloom__pendant-only":   { lockedBasePriceCad: 5200, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "heirloom__rope-20":        { lockedBasePriceCad: 6050, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "heirloom__rope-22":        { lockedBasePriceCad: 6150, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "heirloom__rope-24":        { lockedBasePriceCad: 6300, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    // COLLECTOR · 18K Yellow Gold ($6,800 pendant)
    "collector__pendant-only":  { lockedBasePriceCad: 6800, metalType: "18K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "collector__rope-20":       { lockedBasePriceCad: 8000, metalType: "18K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "collector__rope-22":       { lockedBasePriceCad: 8150, metalType: "18K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    "collector__rope-24":       { lockedBasePriceCad: 8300, metalType: "18K", weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // PORTA AUREA — PHILEON Signet Objects · Ring
  // 3 metal tiers (10K / 14K / 18K Yellow Gold), square emerald-cut ruby centre.
  // CAD bases per brief. cadToUsdLuxury produces $5,500 / $7,000 / $8,500 USD.
  portaAurea: {
    signature: { lockedBasePriceCad: 7200,  metalType: "10K", weightGrams: 23,   lockedMetalReferenceCad: 1438 },
    heirloom:  { lockedBasePriceCad: 9000,  metalType: "14K", weightGrams: 25.5, lockedMetalReferenceCad: 2231 },
    collector: { lockedBasePriceCad: 11500, metalType: "18K", weightGrams: 27.5, lockedMetalReferenceCad: 3094 },
  },

  // COOGI DNA TAG — PHILEON × COOGI · Tribute Series · Pendant
  // Two static variants, both 10K with multi-stone baguette field + pavé
  // diamond border. Standardized build: ~15g gold, lab diamonds + synthetic
  // coloured stones, identical architecture across Snow & Sand.
  // CAD base $11,334 → cadToUsdLuxury produces $8,500 USD each.
  coogiDnaTag: {
    snow: { lockedBasePriceCad: 11334, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    sand: { lockedBasePriceCad: 11334, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // BATTENTI DELLA VILLA — Ladies Earrings · 4 Metal Tiers
  // Villa Door Knocker Earrings · 45×30mm · ~25g · Omega back.
  // Prices are hand-set (do not pass through cadToUsdLuxury rounding).
  // lockedBasePriceCad mirrors USD display value so backend /validate-cart
  // returns diff=0 against the client_price the page sends.
  battentiDellaVilla: {
    silver:   { lockedBasePriceCad: 2800, metalType: "925", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k:  { lockedBasePriceCad: 4800, metalType: "10K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold14k:  { lockedBasePriceCad: 6200, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold18k:  { lockedBasePriceCad: 7800, metalType: "18K", weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // GENT — Gentlemen's Club · Architectural Signet Ring
  // Oversized architectural signet · woven lattice · elevated GENT typography.
  // 4 hand-set metal tiers (Sterling Silver, Vermeil, 10K, 14K — no 18K).
  gent: {
    silver:   { lockedBasePriceCad: 1850, metalType: "925",         weightGrams: 0, lockedMetalReferenceCad: 0 },
    vermeil:  { lockedBasePriceCad: 2400, metalType: "925-vermeil", weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold10k:  { lockedBasePriceCad: 4800, metalType: "10K",         weightGrams: 0, lockedMetalReferenceCad: 0 },
    gold14k:  { lockedBasePriceCad: 6800, metalType: "14K",         weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // STACKRATS — Ladies · Bangles · Collective
  // Three characters × two profiles = 6 single-piece tiers, plus two
  // Full Stack bundles. Hand-set USD prices (weightGrams=0 so server
  // mirrors client exactly on /validate-cart).
  stackrats: {
    dinah_wide:     { lockedBasePriceCad: 2400, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    dinah_thin:     { lockedBasePriceCad: 1800, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    valerie_wide:   { lockedBasePriceCad: 2600, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    valerie_thin:   { lockedBasePriceCad: 1950, metalType: "14K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    dominique_wide: { lockedBasePriceCad: 2900, metalType: "18K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    dominique_thin: { lockedBasePriceCad: 2200, metalType: "18K", weightGrams: 0, lockedMetalReferenceCad: 0 },
    fullstack_wide: { lockedBasePriceCad: 7500, metalType: "mixed", weightGrams: 0, lockedMetalReferenceCad: 0 },
    fullstack_thin: { lockedBasePriceCad: 5700, metalType: "mixed", weightGrams: 0, lockedMetalReferenceCad: 0 },
  },

  // THE GRAND DAME — Cuff (rose gold, 3 tiers)
  // pricingPending: lockedBasePriceCad placeholders below are NOT shown on the
  // page (page renders "Pricing on Inquiry") but the structure must exist so
  // cart validation works once prices are unlocked.
  theGrandDame: {
    foundation: { lockedBasePriceCad: 0, metalType: "10K", weightGrams: 45, lockedMetalReferenceCad: 2813 },
    signature:  { lockedBasePriceCad: 0, metalType: "14K", weightGrams: 50, lockedMetalReferenceCad: 4375 },
    heirloom:   { lockedBasePriceCad: 0, metalType: "18K", weightGrams: 55, lockedMetalReferenceCad: 6188 },
  },
};

export default livePricingConfig;
