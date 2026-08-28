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
      'PHILEON shipping information — complimentary standard shipping within Canada, signature on high-value orders, US and international destinations, customs and duties, address accuracy and lost or damaged shipments.',
    intro:
      'A PHILEON piece is prepared with care before it leaves our atelier. The information below distinguishes production time from transit time and covers our delivery practice for Canada, the United States and international destinations.',
    lastReviewed: '2026-02',
    sections: [
      {
        title: 'Order Preparation',
        blocks: [
          { kind: 'p', text: 'PHILEON separates two timelines: (1) production and finishing time inside the atelier before a piece is ready to leave, and (2) carrier transit time from our door to yours. Production time is not shipping time — the two are quoted separately.' },
          { kind: 'owner', label: 'Production lead time for ready-to-ship pieces' },
          { kind: 'owner', label: 'Production lead time for made-to-order pieces' },
        ],
      },
      {
        title: 'Canada',
        blocks: [
          { kind: 'p', text: 'PHILEON offers complimentary standard shipping within Canada. All qualifying orders are shipped with tracking.' },
          { kind: 'p', text: 'Orders valued at C$1,000 or more require a signature upon delivery. High-value Fine Jewelry shipments are insured where supported by the selected carrier or service.' },
          { kind: 'owner', label: 'Canadian shipping carrier(s)' },
          { kind: 'owner', label: 'Standard transit estimate (Canada)' },
          { kind: 'owner', label: 'Whether all Canadian shipments are insured, or only qualifying high-value shipments' },
        ],
      },
      {
        title: 'United States',
        blocks: [
          { kind: 'p', text: 'Shipping to the United States is available. Shipping charges are the responsibility of the customer unless a specific promotion states otherwise.' },
          { kind: 'p', text: 'Tracking is provided where supported by the selected service. Orders valued at the equivalent of C$1,000 or more require a signature where supported.' },
          { kind: 'owner', label: 'US shipping carrier(s)' },
          { kind: 'owner', label: 'US shipping rate' },
          { kind: 'owner', label: 'Standard transit estimate (United States)' },
        ],
      },
      {
        title: 'International',
        blocks: [
          { kind: 'p', text: 'PHILEON may ship internationally to supported destinations. International shipping charges are the responsibility of the customer unless expressly stated otherwise.' },
          { kind: 'p', text: 'Customers are responsible for all applicable customs duties, import taxes, brokerage charges and local fees associated with delivery into their country. These charges are not included in the PHILEON product price unless explicitly stated otherwise.' },
          { kind: 'note', text: 'International customs clearance times can vary by destination and are outside PHILEON’s control. We do not guarantee international customs clearance timing.' },
          { kind: 'owner', label: 'Regions currently served internationally' },
          { kind: 'owner', label: 'International carrier(s)' },
          { kind: 'owner', label: 'International shipping rate' },
          { kind: 'owner', label: 'International transit estimate range' },
        ],
      },
      {
        title: 'High-Value Orders',
        blocks: [
          { kind: 'p', text: 'For higher-value Fine Jewelry — including any order valued at C$1,000 or more, or the international equivalent where supported — a signature is required on delivery. Where supported by the selected carrier or service, high-value shipments are insured.' },
        ],
      },
      {
        title: 'Address Accuracy',
        blocks: [
          { kind: 'p', text: 'Customers are responsible for providing a complete and accurate shipping address at checkout.' },
          { kind: 'p', text: 'If an address correction is required, please contact PHILEON as soon as possible. We cannot guarantee that an address can be changed once an order has entered production or shipment.' },
        ],
      },
      {
        title: 'Lost or Damaged Shipments',
        blocks: [
          { kind: 'p', text: 'Please contact PHILEON promptly if a shipment arrives damaged or appears to be lost. PHILEON will review the shipment and carrier information before determining the appropriate resolution. An immediate refund or replacement cannot be promised in advance of the carrier or insurance review.' },
        ],
      },
      {
        title: 'Your Rights',
        blocks: [
          { kind: 'note', text: 'Nothing in this policy limits any rights or remedies available to customers under applicable consumer-protection law.' },
        ],
      },
    ],
  },

  '/returns': {
    slug: 'returns',
    status: 'draft',
    eyebrow: 'PHILEON · Returns',
    h1: 'Returns',
    title: 'Returns | 30-Day Return Window on Eligible Gold Jewelry | PHILEON',
    description:
      'PHILEON returns policy — 30-day return window on eligible gold jewelry from the confirmed delivery date. Silver, custom / bespoke, engraved and resized pieces follow separate final-sale rules.',
    intro:
      'PHILEON offers a 30-day return window on eligible gold jewelry, beginning on the confirmed delivery date. Silver jewelry, custom and bespoke pieces, and altered or resized items follow separate rules described below.',
    lastReviewed: '2026-02',
    sections: [
      {
        title: 'Return Window & Condition',
        blocks: [
          { kind: 'p', text: 'The 30-day return window begins on the confirmed delivery date.' },
          { kind: 'p', text: 'Returned merchandise must be unworn, unused, unaltered and undamaged, and returned with its original packaging and included materials where applicable. PHILEON may inspect all returned jewelry before approving a refund.' },
        ],
      },
      {
        title: 'Gold Jewelry',
        blocks: [
          { kind: 'p', text: 'Eligible standard gold jewelry may be returned within 30 days of delivery, provided the piece remains in original saleable condition. Any item that has been worn, damaged or altered may be refused.' },
        ],
      },
      {
        title: 'Silver Jewelry',
        blocks: [
          { kind: 'p', text: 'Silver jewelry is final sale.' },
          { kind: 'p', text: 'Silver pieces are not eligible for change-of-mind returns or exchanges unless PHILEON determines that the item arrived defective, damaged or incorrect, or applicable law requires another remedy.' },
        ],
      },
      {
        title: 'Custom & Bespoke Jewelry',
        blocks: [
          { kind: 'p', text: 'Custom and bespoke jewelry is final sale. This includes pieces created or materially altered specifically for the customer — including custom designs, personalized pieces, engraved pieces, customer-selected modifications, special stone combinations, and customer-approved bespoke CAD designs.' },
          { kind: 'note', text: 'Standard gold pieces are not automatically classified as final sale simply because they are produced after purchase.' },
        ],
      },
      {
        title: 'Resized or Altered Jewelry',
        blocks: [
          { kind: 'p', text: 'Jewelry that has been resized, engraved or otherwise altered specifically at your request is treated as final sale unless otherwise approved by PHILEON.' },
        ],
      },
      {
        title: 'Return Shipping',
        blocks: [
          { kind: 'p', text: 'Customers are responsible for the cost of return shipping.' },
          { kind: 'p', text: 'PHILEON will cover reasonable return shipping where the return results from an incorrect item supplied by PHILEON, a verified manufacturing defect, or shipping damage attributable to the original shipment.' },
          { kind: 'p', text: 'PHILEON strongly recommends tracked and insured return shipping for valuable jewelry. Subject to applicable law, PHILEON is not responsible for customer return shipments that are lost before being received by PHILEON.' },
        ],
      },
      {
        title: 'Refunds',
        blocks: [
          { kind: 'p', text: 'Approved refunds are returned to the original payment method where practical. Refunds are not issued until the returned piece has been received and inspected.' },
          { kind: 'p', text: 'Original outbound shipping charges, international customs duties, import taxes and brokerage fees are not refundable unless PHILEON specifically approves them or applicable law requires reimbursement.' },
          { kind: 'owner', label: 'Refund processing timeframe once inspection is complete' },
        ],
      },
      {
        title: 'Your Rights',
        blocks: [
          { kind: 'note', text: 'Nothing in this policy limits any rights or remedies available to customers under applicable consumer-protection law.' },
        ],
      },
    ],
  },

  '/warranty': {
    slug: 'warranty',
    status: 'draft',
    eyebrow: 'PHILEON · Guarantee',
    h1: 'Warranty',
    title: 'Warranty | 12-Month Limited Manufacturing Warranty | PHILEON',
    description:
      'PHILEON’s 12-month limited warranty covers manufacturing and workmanship defects from the original delivery date. Normal wear, accidental damage, plating wear and third-party repairs are treated separately.',
    intro:
      'PHILEON provides a 12-month limited warranty against manufacturing defects, beginning from the original delivery date. The warranty is intended to cover defects attributable to the original manufacture or workmanship of the jewelry.',
    lastReviewed: '2026-02',
    sections: [
      {
        title: 'Potentially Covered',
        blocks: [
          { kind: 'p', text: 'Subject to inspection, warranty coverage may include:' },
          { kind: 'ul', items: [
            'manufacturing defects',
            'workmanship defects',
            'setting defects attributable to original manufacture',
            'structural issues attributable to original manufacture',
          ] },
          { kind: 'p', text: 'PHILEON determines warranty eligibility after inspection.' },
        ],
      },
      {
        title: 'Not Automatically Covered',
        blocks: [
          { kind: 'p', text: 'The warranty does not automatically cover:' },
          { kind: 'ul', items: [
            'normal wear and tear',
            'scratches, dents and bending',
            'accidental impact and misuse',
            'loss or theft',
            'improper storage',
            'chemical exposure',
            'damage caused by improper cleaning',
            'gradual finish wear, plating wear and blackened-finish wear',
            'enamel damage caused by impact or abrasion',
            'damage resulting from another jeweler modifying or repairing the piece',
          ] },
        ],
      },
      {
        title: 'Stone Loss',
        blocks: [
          { kind: 'p', text: 'Stone loss is not automatically covered simply because it occurs within the 12-month period.' },
          { kind: 'p', text: 'PHILEON will inspect the piece to determine whether the loss resulted from a manufacturing or setting defect, accidental impact, wear, damage, or outside modification.' },
          { kind: 'p', text: 'If PHILEON determines the loss resulted from a covered manufacturing defect, the repair may be covered under warranty.' },
        ],
      },
      {
        title: 'Resizing & Alterations',
        blocks: [
          { kind: 'p', text: 'Resizing and other alterations can affect fit, structural integrity and warranty coverage. Where alterations contributed to the problem, warranty coverage may not apply.' },
        ],
      },
      {
        title: 'Third-Party Repairs',
        blocks: [
          { kind: 'p', text: 'Repairs, alterations or resizing performed by a third party may affect warranty eligibility where that work contributed to the problem.' },
        ],
      },
      {
        title: 'Plating & Blackened Finishes',
        blocks: [
          { kind: 'p', text: 'Plated, oxidised and blackened surface finishes evolve with wear. Gradual finish change on high-contact areas is expected and is not treated as a manufacturing defect.' },
        ],
      },
      {
        title: 'Enamel',
        blocks: [
          { kind: 'p', text: 'Enamel is durable in normal wear but can chip or crack if struck. Damage caused by impact or abrasion is not automatically covered.' },
        ],
      },
      {
        title: 'Chains & Clasps',
        blocks: [
          { kind: 'p', text: 'Chain and clasp failure caused by a manufacturing defect may be reviewed under this warranty. Failure resulting from wear, impact or excessive load is not automatically covered.' },
        ],
      },
      {
        title: 'Warranty Claims',
        blocks: [
          { kind: 'p', text: 'To request warranty service, contact PHILEON with your order information, a description of the issue, and clear photographs where possible.' },
          { kind: 'p', text: 'PHILEON may require physical inspection before determining coverage. Shipping responsibility for warranty evaluation is determined case by case.' },
        ],
      },
      {
        title: 'Inspection & Maintenance',
        blocks: [
          { kind: 'p', text: 'Periodic inspection helps identify small issues before they become significant. Contact PHILEON to arrange an inspection.' },
          { kind: 'owner', label: 'Recommended inspection interval' },
          { kind: 'owner', label: 'Whether periodic inspection is required to maintain coverage' },
        ],
      },
      {
        title: 'Your Rights',
        blocks: [
          { kind: 'note', text: 'Nothing in this policy limits any rights or remedies available to customers under applicable consumer-protection law.' },
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
