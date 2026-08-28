// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Trust page content + publication state (Phase 8)
//
// Two categories of content live here:
//
//   1. Factually neutral content (Jewelry Care, Materials) — publishable
//      because the guidance is generic material/care information, not a
//      PHILEON policy promise. status: 'approved'.
//
//   2. Policy-sensitive content (Shipping, Returns, Warranty) — kept as
//      draft with structured sections and OWNER-REQUIRED markers. Owner
//      must supply approved copy before we flip status to 'approved'.
//
// Only `approved` pages are:
//   • surfaced in the sitemap
//   • indexed (index,follow)
//   • findable via site search
//   • linked from the public footer
//
// `draft` pages remain reachable at their URL (so we can preview the
// structure) but are noindex,follow and never linked publicly.
// ─────────────────────────────────────────────────────────────────────────────

// Reusable text block types.
//   { kind: 'p', text: '...' }
//   { kind: 'ul', items: ['...', '...'] }
//   { kind: 'note', text: '...' }           // rendered as a subtle inline note
//   { kind: 'owner', label: '...' }         // OWNER DECISION REQUIRED marker (draft only)

export const TRUST_PAGES = {
  '/shipping': {
    slug: 'shipping',
    status: 'draft',
    eyebrow: 'PHILEON · Delivery',
    h1: 'Shipping',
    title: 'Shipping | PHILEON Fine Jewelry',
    description:
      'PHILEON shipping information — production time, transit estimates, tracking, insurance and customs guidance for Canada, the United States and international destinations.',
    intro:
      'A PHILEON piece is prepared with care before it leaves our atelier. The information below distinguishes production time from transit time so you can plan around each release with confidence.',
    lastReviewed: null,
    sections: [
      {
        title: 'Order Preparation',
        blocks: [
          { kind: 'p', text: 'PHILEON separates two timelines: (1) production/finishing time inside the atelier before a piece is ready to leave, and (2) carrier transit time from our door to yours.' },
          { kind: 'owner', label: 'Production lead time for ready-to-ship pieces' },
          { kind: 'owner', label: 'Production lead time for made-to-order pieces' },
        ],
      },
      {
        title: 'Canada',
        blocks: [
          { kind: 'owner', label: 'Domestic carrier(s)' },
          { kind: 'owner', label: 'Standard transit estimate' },
          { kind: 'owner', label: 'Tracking policy' },
          { kind: 'owner', label: 'Insurance coverage' },
          { kind: 'owner', label: 'Signature-on-delivery threshold' },
          { kind: 'owner', label: 'Shipping cost / free-shipping threshold (if any)' },
        ],
      },
      {
        title: 'United States',
        blocks: [
          { kind: 'owner', label: 'US carrier(s)' },
          { kind: 'owner', label: 'Standard transit estimate' },
          { kind: 'owner', label: 'Tracking policy' },
          { kind: 'owner', label: 'Insurance coverage' },
          { kind: 'owner', label: 'Signature-on-delivery threshold' },
          { kind: 'owner', label: 'Shipping cost / free-shipping threshold (if any)' },
        ],
      },
      {
        title: 'International',
        blocks: [
          { kind: 'owner', label: 'Regions served' },
          { kind: 'owner', label: 'International carrier(s)' },
          { kind: 'owner', label: 'Transit estimate range' },
          { kind: 'owner', label: 'Tracking, insurance and signature policy' },
        ],
      },
      {
        title: 'Customs & Duties',
        blocks: [
          { kind: 'owner', label: 'Who is responsible for duties/taxes on international orders (PHILEON vs recipient)' },
        ],
      },
      {
        title: 'High-Value Orders',
        blocks: [
          { kind: 'p', text: 'For higher-value Fine Jewelry pieces, PHILEON may apply additional protection.' },
          { kind: 'owner', label: 'Threshold for enhanced insurance / signature requirement' },
          { kind: 'owner', label: 'Delivery verification steps' },
        ],
      },
      {
        title: 'Address Changes',
        blocks: [
          { kind: 'owner', label: 'Window for changing a shipping address after order confirmation' },
        ],
      },
      {
        title: 'Lost or Damaged Shipments',
        blocks: [
          { kind: 'owner', label: 'PHILEON process for lost / damaged shipments and liability' },
        ],
      },
    ],
  },

  '/returns': {
    slug: 'returns',
    status: 'draft',
    eyebrow: 'PHILEON · Returns',
    h1: 'Returns',
    title: 'Returns | PHILEON Fine Jewelry',
    description:
      'PHILEON returns policy — ready-to-ship pieces, made-to-order Fine Jewelry, custom / bespoke commissions, engraved and resized items each have their own terms.',
    intro:
      'Return terms depend on how a piece was produced. Ready-to-ship jewelry, made-to-order Fine Jewelry and custom / bespoke commissions are each handled separately.',
    lastReviewed: null,
    sections: [
      {
        title: 'Ready-to-Ship Pieces',
        blocks: [
          { kind: 'owner', label: 'Return eligibility for stock/ready-to-ship pieces' },
          { kind: 'owner', label: 'Return window (days)' },
          { kind: 'owner', label: 'Condition requirements (unworn, original packaging, etc.)' },
          { kind: 'owner', label: 'Return authorization / RMA process' },
          { kind: 'owner', label: 'Return shipping responsibility' },
          { kind: 'owner', label: 'Refund destination, timing and treatment of shipping fees' },
        ],
      },
      {
        title: 'Made-to-Order Fine Jewelry',
        blocks: [
          { kind: 'p', text: 'Made-to-order Fine Jewelry is produced against a customer’s specifications (size, metal, stone variant). Return terms differ from ready-to-ship pieces.' },
          { kind: 'owner', label: 'Return eligibility for made-to-order pieces' },
          { kind: 'owner', label: 'Return window (if any)' },
          { kind: 'owner', label: 'Restocking / cancellation fee (if any)' },
        ],
      },
      {
        title: 'Custom & Bespoke Commissions',
        blocks: [
          { kind: 'p', text: 'Bespoke commissions are designed to individual specification, with CAD review and stone selection. They are typically not treated the same as stock returns.' },
          { kind: 'owner', label: 'Return / cancellation policy for bespoke commissions' },
          { kind: 'owner', label: 'Deposit treatment on cancellation (if applicable)' },
        ],
      },
      {
        title: 'Engraved or Personalized Pieces',
        blocks: [
          { kind: 'owner', label: 'Return policy for engraved / personalized pieces' },
        ],
      },
      {
        title: 'Resized Rings',
        blocks: [
          { kind: 'owner', label: 'Return policy for rings that have been resized' },
        ],
      },
      {
        title: 'Inspiration Vault Pieces',
        blocks: [
          { kind: 'owner', label: 'Return policy for Inspiration Vault pieces' },
        ],
      },
      {
        title: 'Earrings & Hygienic Items',
        blocks: [
          { kind: 'owner', label: 'Return policy for pierced earrings (hygiene rules)' },
        ],
      },
    ],
  },

  '/warranty': {
    slug: 'warranty',
    status: 'draft',
    eyebrow: 'PHILEON · Guarantee',
    h1: 'Warranty',
    title: 'Warranty | PHILEON Fine Jewelry',
    description:
      'PHILEON warranty overview — manufacturing defects, stone-setting integrity, plating, resizing, third-party repairs and periodic inspection.',
    intro:
      'PHILEON stands behind the way its Fine Jewelry is made. Warranty coverage differs by cause — manufacturing versus normal wear versus accidental damage — and by finish type.',
    lastReviewed: null,
    sections: [
      {
        title: 'Manufacturing Defects',
        blocks: [
          { kind: 'owner', label: 'Warranty duration for manufacturing defects' },
          { kind: 'owner', label: 'What qualifies as a manufacturing defect' },
        ],
      },
      {
        title: 'Stone & Setting Integrity',
        blocks: [
          { kind: 'owner', label: 'Coverage for lost / dislodged stones' },
          { kind: 'owner', label: 'Melee stone replacement policy' },
        ],
      },
      {
        title: 'Normal Wear',
        blocks: [
          { kind: 'p', text: 'Everyday jewelry accumulates surface wear over time. Coverage for cosmetic wear differs from coverage for structural failure.' },
          { kind: 'owner', label: 'What counts as normal wear vs. structural issue' },
        ],
      },
      {
        title: 'Accidental Damage',
        blocks: [
          { kind: 'owner', label: 'Accidental damage policy' },
          { kind: 'owner', label: 'Whether accidental damage is covered, repaired at cost, or excluded' },
        ],
      },
      {
        title: 'Resizing & Alterations',
        blocks: [
          { kind: 'owner', label: 'Effect of resizing on warranty coverage' },
          { kind: 'owner', label: 'Alteration requirements (must be done by PHILEON, etc.)' },
        ],
      },
      {
        title: 'Plating & Blackened Finishes',
        blocks: [
          { kind: 'p', text: 'Plated and blackened surface finishes evolve with wear. Their coverage typically differs from solid-metal jewelry.' },
          { kind: 'owner', label: 'Coverage for plated / vermeil pieces' },
          { kind: 'owner', label: 'Coverage for blackened / patinated finishes' },
        ],
      },
      {
        title: 'Enamel',
        blocks: [
          { kind: 'owner', label: 'Coverage for enamel chips / wear' },
        ],
      },
      {
        title: 'Chains & Clasps',
        blocks: [
          { kind: 'owner', label: 'Coverage for chain / clasp failure' },
        ],
      },
      {
        title: 'Third-Party Repairs',
        blocks: [
          { kind: 'owner', label: 'Effect of third-party jeweler repair on warranty' },
        ],
      },
      {
        title: 'Inspection & Maintenance',
        blocks: [
          { kind: 'owner', label: 'Recommended inspection interval' },
          { kind: 'owner', label: 'Whether periodic inspection is required to maintain coverage' },
          { kind: 'owner', label: 'Shipping responsibility for warranty repairs' },
        ],
      },
    ],
  },

  '/jewelry-care': {
    slug: 'jewelry-care',
    status: 'approved',
    eyebrow: 'PHILEON · Atelier Notes',
    h1: 'Jewelry Care',
    title: 'Jewelry Care | Gold, Silver, Diamonds, Pavé & Enamel | PHILEON',
    description:
      'How to care for PHILEON Fine Jewelry — safe cleaning guidance for 10K, 14K and 18K gold, sterling silver, diamonds, coloured stones, pavé settings, enamel, plated pieces and blackened finishes.',
    intro:
      'A few careful habits keep a PHILEON piece looking the way it left our atelier. The guidance below is intentionally conservative — when a piece combines stones, plating or enamel, always err on the side of the most delicate component.',
    lastReviewed: '2026-02',
    sections: [
      {
        title: 'Gold — 10K, 14K, 18K',
        blocks: [
          { kind: 'p', text: 'Higher karat gold contains more pure gold and is warmer in colour but softer to the touch; lower karat gold contains more alloy metal and is more resistant to everyday wear. Neither is universally “better” — they are engineered for different priorities.' },
          { kind: 'p', text: 'Wipe with a soft lint-free cloth after wear to remove oils. For a deeper clean, use lukewarm water with a small amount of mild soap, a soft brush around settings, then rinse gently and dry with a lint-free cloth. Avoid chlorine, harsh household chemicals and abrasive polishes.' },
        ],
      },
      {
        title: 'Sterling Silver',
        blocks: [
          { kind: 'p', text: 'Sterling silver tarnishes over time by reacting with air and moisture. Store PHILEON sterling silver pieces in a dry, sealed pouch or lined box, ideally with an anti-tarnish strip.' },
          { kind: 'p', text: 'Gentle wear actually keeps silver bright. For cleaning, use a dedicated silver polishing cloth or lukewarm water with a small amount of mild soap. Rinse thoroughly and dry immediately. Avoid dips and abrasive polishes on plated / oxidised areas — they can strip finish detail.' },
        ],
      },
      {
        title: 'Diamonds',
        blocks: [
          { kind: 'p', text: 'Diamonds are the hardest gemstone in normal wear but can still chip if struck sharply on a hard edge. For routine cleaning, soak briefly in lukewarm water with mild soap, brush gently around the setting with a soft brush, rinse and dry.' },
          { kind: 'note', text: 'Ultrasonic and steam cleaners are not universally safe. Setting style, stone treatment, small side-stones (melee) and any adjacent enamel or plating change what is appropriate. If in doubt, contact PHILEON before ultrasonic cleaning.' },
        ],
      },
      {
        title: 'Lab-Grown vs Natural Diamonds',
        blocks: [
          { kind: 'p', text: 'Lab-grown diamonds share the crystal structure, hardness and optical behaviour of natural diamonds and are cared for the same way. Origin does not change day-to-day care. Grading (cut, colour, clarity) is what determines quality — origin is a separate attribute we disclose clearly on any piece where it applies.' },
        ],
      },
      {
        title: 'Coloured Gemstones',
        blocks: [
          { kind: 'p', text: 'Coloured stones vary in hardness and are often treated for colour or clarity, so we default to conservative care: room-temperature water and mild soap only, soft brush, gentle drying. Avoid heat, ultrasonic cleaning, steam and household chemicals unless we have confirmed the specific stone tolerates them.' },
        ],
      },
      {
        title: 'Pavé & Fine Settings',
        blocks: [
          { kind: 'p', text: 'Pavé settings hold many small stones with fine metal beads. Snags, sharp impacts and aggressive brushing can loosen a bead. Clean pavé with a soft brush only, and store paved pieces separately so nothing knocks against them.' },
        ],
      },
      {
        title: 'Enamel',
        blocks: [
          { kind: 'p', text: 'Enamel is durable in normal wear but can chip if struck. Clean enamel surfaces with a soft cloth only — no abrasives, no ultrasonic cleaner, no chemical solvents.' },
        ],
      },
      {
        title: 'Plated & Vermeil Pieces',
        blocks: [
          { kind: 'p', text: 'Plated finishes (including gold vermeil over sterling silver) are a surface layer over a base metal. That layer wears over time, especially on high-contact areas such as the underside of rings. Extend the finish by removing plated pieces before hand-washing, swimming, sleeping and exercising, and by wiping the piece with a soft dry cloth after wear.' },
        ],
      },
      {
        title: 'Blackened & Patinated Finishes',
        blocks: [
          { kind: 'p', text: 'Blackened, oxidised and darkened metal finishes are a surface treatment. Depending on the process and the piece, they can lighten with wear or on high-friction areas. This evolution is part of the character of the finish — it is not damage. Clean gently with a soft cloth; avoid polishing cloths or abrasive cleaners, which will lift the finish.' },
        ],
      },
      {
        title: 'Storage',
        blocks: [
          { kind: 'p', text: 'Store each piece separately in its PHILEON pouch or a soft-lined compartment to prevent scratches. Keep away from direct sunlight, humidity and heat sources. If a piece has a black rhodium or oxidised finish, keep it in a sealed pouch to slow atmospheric wear.' },
        ],
      },
      {
        title: 'When to Ask',
        blocks: [
          { kind: 'p', text: 'If a piece feels loose, a stone rattles, a clasp catches, or a finish looks unexpectedly different, contact PHILEON before continuing to wear it. Small issues addressed early stay small.' },
        ],
      },
    ],
  },

  '/materials': {
    slug: 'materials',
    status: 'approved',
    eyebrow: 'PHILEON · Materials',
    h1: 'Materials',
    title: 'Materials | 10K, 14K, 18K Gold · Sterling Silver · Diamonds | PHILEON',
    description:
      'The materials PHILEON works with — 10K, 14K and 18K gold in yellow, white and rose; sterling silver; natural and lab-grown diamonds; coloured gemstones; enamel; and plated / blackened finishes.',
    intro:
      'PHILEON works in a controlled palette of metals and stones. The reference below explains what each material is, how it behaves in wear, and when we use it — so you can choose confidently between options on a piece that supports more than one.',
    lastReviewed: '2026-02',
    sections: [
      {
        title: '10K Gold',
        blocks: [
          { kind: 'p', text: '10K gold is 41.7% pure gold alloyed with harder metals. The higher alloy content makes it the most durable of the karats we work with — a practical choice for everyday rings, statement pieces and finishes that see contact.' },
          { kind: 'p', text: 'Its colour is slightly lighter than 14K or 18K. Where PHILEON offers a piece in more than one karat, 10K is generally the most wear-resistant option.' },
        ],
      },
      {
        title: '14K Gold',
        blocks: [
          { kind: 'p', text: '14K gold is 58.3% pure gold. It is the balance point our atelier uses most often — richer in colour than 10K, more resilient than 18K. It suits Fine Jewelry that will be worn regularly, including pavé and stone-set pieces.' },
        ],
      },
      {
        title: '18K Gold',
        blocks: [
          { kind: 'p', text: '18K gold is 75% pure gold. It carries the deepest colour, particularly in yellow, and is what many high-jewelry houses use. It is softer than 10K or 14K, so it shows surface wear sooner on high-contact pieces. We use it where colour and heritage feel matter most.' },
          { kind: 'note', text: 'Higher karat is not automatically better. It is the right choice for some pieces and the wrong choice for others. If a design is offered in more than one karat, we describe the trade-off on the product page itself.' },
        ],
      },
      {
        title: 'Yellow, White and Rose Gold',
        blocks: [
          { kind: 'p', text: 'The colour of gold is set by the alloy metals mixed with pure gold. Yellow gold is alloyed with silver and copper; white gold is alloyed with palladium or nickel and typically rhodium-plated for a bright cool finish; rose gold is alloyed with a higher proportion of copper for a warm pink tone.' },
          { kind: 'p', text: 'White gold with rhodium plating may need re-plating over time to keep its brightest finish. Rose gold does not fade — the pink comes from the alloy itself, not a surface treatment.' },
        ],
      },
      {
        title: 'Sterling Silver',
        blocks: [
          { kind: 'p', text: 'Sterling silver is 92.5% pure silver alloyed with copper for structural strength. It is the metal behind several PHILEON pieces, including signet forms. Its natural finish is a bright, mirror-capable cool white; over time and exposure to air it develops a warmer patina.' },
        ],
      },
      {
        title: 'Natural Diamonds',
        blocks: [
          { kind: 'p', text: 'Natural diamonds form under geological pressure and are graded on cut, colour, clarity and carat. Where a PHILEON piece is set with natural diamonds we disclose the grading range or the specific stone(s) on the product page.' },
        ],
      },
      {
        title: 'Lab-Grown Diamonds',
        blocks: [
          { kind: 'p', text: 'Lab-grown diamonds share the same crystal structure, hardness and optical properties as natural diamonds. They are graded on the same scale. We treat origin as a separate disclosure from quality — a lab-grown diamond and a natural diamond of the same grade behave the same in wear.' },
        ],
      },
      {
        title: 'Cubic Zirconia',
        blocks: [
          { kind: 'p', text: 'Cubic zirconia (CZ) is a different material from diamond. It is a lab-created stone that we may use in specific pieces, and we identify it clearly as CZ on the product page whenever it appears. CZ is never described as diamond.' },
        ],
      },
      {
        title: 'Coloured Gemstones',
        blocks: [
          { kind: 'p', text: 'Where a PHILEON design uses coloured stones — for example rubies, emeralds, sapphires or peridot — the stone type is identified on the product page. Hardness and treatment vary by stone type, which is why care guidance stays conservative.' },
        ],
      },
      {
        title: 'Enamel',
        blocks: [
          { kind: 'p', text: 'Enamel is a fired coloured surface applied to metal. It gives us access to saturated tones that plating and stones cannot produce, and it holds its colour indefinitely under normal wear. It can chip if struck sharply, so we treat enamel-bearing pieces like any other stone-set piece.' },
        ],
      },
      {
        title: 'Gold Plating & Vermeil',
        blocks: [
          { kind: 'p', text: 'Gold plating is a thin gold surface applied over a base metal. Gold vermeil is a specific form of plating where the base is sterling silver and the plating is a defined minimum thickness of at least 10K gold. Where PHILEON uses vermeil we identify it clearly. Plated finishes wear over time — they are a design choice, not a substitute for solid gold.' },
        ],
      },
      {
        title: 'Blackened Metal',
        blocks: [
          { kind: 'p', text: 'Blackened, oxidised and dark-plated finishes are surface treatments applied over a base metal. They give a piece a distinctive matte or shadowed look. Depending on the process and the piece, the finish can evolve — often lighter on high-contact edges — with wear. That evolution is part of the finish rather than damage.' },
        ],
      },
    ],
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export function listApprovedTrustPages() {
  return Object.entries(TRUST_PAGES)
    .filter(([, p]) => p.status === 'approved')
    .map(([path, p]) => ({ path, ...p }));
}

export function listTrustPages() {
  return Object.entries(TRUST_PAGES).map(([path, p]) => ({ path, ...p }));
}

export function getTrustPage(path) {
  return TRUST_PAGES[path] || null;
}
