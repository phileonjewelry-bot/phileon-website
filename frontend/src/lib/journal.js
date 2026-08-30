// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Journal manifest (Phase 4 scaffold + Article #1).
//
// Each article is hand-authored. No AI-generated filler is ever added.
//
// Article shape:
//   {
//     slug, title, excerpt, heroImage?, author, publishedAt, updatedAt,
//     tags, relatedProductSlugs, category,
//     body:  [ block, ... ],
//     faq:   [ { q, a }, ... ] (optional — emits FAQPage JSON-LD if present)
//   }
//
// Block types supported by JournalPage.jsx renderer:
//   { type: 'p',     text }
//   { type: 'h2',    text }
//   { type: 'h3',    text }
//   { type: 'ul',    items: [text, ...] }
//   { type: 'ol',    items: [text, ...] }
//   { type: 'table', headers: [text, ...], rows: [[text, ...], ...] }
//   { type: 'note',  label, text }            // "Best suited to:" / callouts
//   { type: 'quote', text }
//   { type: 'cta',   heading, text, buttonLabel }  // Ask PHILEON — Concierge
//   { type: 'links', heading, items: [{label, href}] }  // product discovery
// ─────────────────────────────────────────────────────────────────────────────

export const journalArticles = [
  {
    slug: 'lab-grown-vs-natural-diamonds',
    title: 'Lab-Grown vs Natural Diamonds: How to Choose',
    excerpt:
      'Lab-grown and natural diamonds are chemically identical but tell very different stories. A neutral, practical guide to origin, grading, appearance, pricing, resale and which route may suit different buyers.',
    heroImage: null,
    author: 'PHILEON Atelier',
    publishedAt: '2026-02-29',
    updatedAt: '2026-02-29',
    category: 'Diamond Guide',
    tags: ['diamonds', 'lab-grown', 'natural', 'materials'],
    relatedProductSlugs: ['drape', 'bajan-joe', 'quadriga-dominus'],
    body: [
      { type: 'p', text: 'Lab-grown and natural diamonds are both real diamonds. They share the same crystal structure, the same core physical and optical properties, and the same grading language. What separates them is origin, availability, price behaviour and the story each carries.' },
      { type: 'p', text: 'Neither is universally better. The right choice depends on the piece, the wearer, the intent behind the gift, and how the diamond will be lived with over time.' },
      { type: 'p', text: 'At PHILEON, both options are approached as materials — chosen alongside metal, setting and design — rather than as a moral position.' },
      { type: 'p', text: 'This guide is a neutral, practical breakdown of the differences so you can decide with clarity.' },

      { type: 'h2', text: 'What is a natural diamond?' },
      { type: 'p', text: 'A natural diamond is a diamond formed geologically deep in the Earth over long timescales under extreme heat and pressure, then brought closer to the surface by geological processes and eventually mined.' },
      { type: 'ul', items: [
        'Origin: geological, formed within the Earth',
        'Composition: crystalline carbon',
        'Supply: finite — dependent on discovery, extraction and long-established supply chains',
        'Grading language: the same 4Cs used across the industry (cut, colour, clarity, carat weight)',
      ] },

      { type: 'h2', text: 'What is a lab-grown diamond?' },
      { type: 'p', text: 'A lab-grown diamond is a diamond produced in a controlled setting, most commonly by one of two methods: high-pressure/high-temperature (HPHT) or chemical vapour deposition (CVD). The output is a real diamond — crystalline carbon — not a simulant.' },
      { type: 'ul', items: [
        'Origin: produced in a laboratory or specialised facility',
        'Composition: crystalline carbon — same as natural',
        'Supply: producible at scale; not constrained by geological rarity',
        'Grading language: graded using the same 4Cs as natural diamonds by major grading bodies',
      ] },
      { type: 'p', text: 'A cubic zirconia or a moissanite is not a lab-grown diamond — those are different materials. Lab-grown diamonds are diamonds.' },

      { type: 'h2', text: 'Are they chemically the same?' },
      { type: 'p', text: 'For practical purposes: yes. Lab-grown and natural diamonds share the same crystal structure, hardness, refractive index and thermal properties. To the unaided eye, well-cut examples of each are indistinguishable.' },
      { type: 'p', text: 'Confirming whether a specific stone is lab-grown or natural requires specialised gemological equipment — not a jeweller\u2019s loupe alone.' },

      { type: 'h2', text: 'Grading' },
      { type: 'p', text: 'Both lab-grown and natural diamonds are graded using the same core language of the 4Cs. Certificates from recognised grading bodies typically state:' },
      { type: 'ul', items: [
        'Cut — proportion, symmetry and polish',
        'Colour — where the stone sits on the colour scale',
        'Clarity — the size and position of inclusions',
        'Carat weight — the weight of the stone',
      ] },
      { type: 'p', text: 'Certificates for lab-grown stones will state that the stone is laboratory-grown. Certificates for natural stones will state a natural origin. Read the certificate itself rather than relying on verbal descriptions.' },

      { type: 'h2', text: 'Appearance' },
      { type: 'p', text: 'A well-cut lab-grown diamond and a well-cut natural diamond can be visually indistinguishable. Cut quality — how the stone returns light — usually has more day-to-day influence on how a diamond looks than whether it is lab-grown or natural.' },
      { type: 'ul', items: [
        'Colour and clarity ranges are directly comparable across both categories',
        'Fluorescence, fancy colour and inclusion patterns exist in both',
        'Two diamonds of the same 4C grade can still look different in the same piece — cut and setting matter',
      ] },

      { type: 'h2', text: 'Rarity' },
      { type: 'p', text: 'This is where the two diverge meaningfully.' },
      { type: 'ul', items: [
        'Natural diamonds are formed geologically over long timescales and are finite. Larger, higher-colour, higher-clarity examples are meaningfully rarer.',
        'Lab-grown diamonds are producible at scale. Supply is not constrained by geology and has grown substantially over recent years.',
      ] },
      { type: 'p', text: 'If rarity is part of what the diamond is meant to represent — an heirloom, a milestone marker, a piece intended to carry a specific story — the origin story of a natural stone is part of that value. If the priority is a larger or higher-grade stone at a given budget, lab-grown may allow a step up in size or quality.' },

      { type: 'h2', text: 'Pricing considerations' },
      { type: 'p', text: 'At any given moment, lab-grown diamonds typically trade at a lower per-carat price than comparably-graded natural diamonds. The gap has widened over time as lab-grown production has scaled. Specific pricing depends on:' },
      { type: 'ul', items: [
        'Size and grade of the individual stone',
        'Cut quality and finish',
        'Certification and origin documentation',
        'The specific vendor, market and moment of purchase',
      ] },
      { type: 'p', text: 'PHILEON does not publish universal price differentials because the honest answer changes with the market. Any promise of an exact "percentage saving" without a specific stone in front of you should be treated with caution.' },

      { type: 'h2', text: 'Resale considerations' },
      { type: 'p', text: 'Resale is a real consideration for both categories and deserves honesty rather than marketing.' },
      { type: 'ul', items: [
        'Natural diamonds have a long-established secondary market. Resale value depends heavily on the specific stone, current market conditions and how it is sold — resale is rarely at the original retail price for either category.',
        'Lab-grown diamonds have a shorter secondary-market history, and their resale behaviour is still evolving as supply grows.',
      ] },
      { type: 'p', text: 'Neither category should be purchased primarily as an investment. Both should be purchased because the piece is right for the wearer.' },

      { type: 'h2', text: 'A note on environmental and sourcing claims' },
      { type: 'p', text: 'Both categories carry active marketing around sustainability and ethics. Some claims are well-supported; some are not.' },
      { type: 'ul', items: [
        'Natural-diamond sourcing quality varies significantly by supplier. Look for clear origin documentation and adherence to recognised responsible-sourcing frameworks.',
        'Lab-grown diamond production has energy requirements that vary by facility, method and energy source. "Sustainable" claims should be checked against the specific producer, not the category as a whole.',
      ] },
      { type: 'p', text: 'PHILEON does not make blanket environmental claims about either category. If sourcing is important to you, ask about the specific stone and the specific supply chain — not the marketing.' },

      { type: 'h2', text: 'Which one is right for you?' },
      { type: 'h3', text: 'Lab-grown may suit you if' },
      { type: 'ul', items: [
        'You want a larger or higher-grade diamond at a given budget',
        'You are drawn to the piece and design more than to geological origin',
        'You are comfortable with a shorter secondary-market history',
        'You value clear documentation of a laboratory origin',
      ] },
      { type: 'h3', text: 'Natural may suit you if' },
      { type: 'ul', items: [
        'The geological origin is part of what the diamond is meant to represent',
        'You are creating a piece intended as a long-held heirloom',
        'You prefer the established secondary-market history that natural diamonds carry',
        'The rarity of a specific natural stone is part of the story of the piece',
      ] },
      { type: 'p', text: 'Both are real diamonds. Both can be beautifully cut, beautifully set, and beautifully worn.' },

      { type: 'h2', text: 'The PHILEON approach' },
      { type: 'p', text: 'There is no single PHILEON stone. The correct diamond depends on the piece, the wearer and the intent.' },
      { type: 'p', text: 'A piece designed as a substantial statement may make sense with a larger lab-grown centre so scale and design can be pursued together. A piece designed as a long-held heirloom may make sense with a smaller, well-cut natural stone whose provenance is part of its meaning.' },
      { type: 'quote', text: 'The question is not "which is better." The question is "which is right for this piece, for this wearer."' },

      { type: 'h2', text: 'Quick comparison' },
      { type: 'table', headers: ['', 'Lab-grown diamonds', 'Natural diamonds'], rows: [
        ['Origin', 'Grown in a lab (HPHT or CVD)', 'Formed geologically within the Earth'],
        ['Composition', 'Crystalline carbon', 'Crystalline carbon'],
        ['Grading', 'Same 4Cs (cut, colour, clarity, carat)', 'Same 4Cs (cut, colour, clarity, carat)'],
        ['Appearance', 'Visually indistinguishable to the eye', 'Visually indistinguishable to the eye'],
        ['Rarity', 'Producible at scale', 'Finite geological supply'],
        ['Per-carat pricing', 'Generally lower at comparable grade', 'Generally higher at comparable grade'],
        ['Secondary market', 'Shorter history, still evolving', 'Long-established, stone- and market-dependent'],
        ['Typical use', 'Scale, design flexibility, value', 'Heirloom, provenance, long-held pieces'],
      ] },

      { type: 'cta', heading: 'Choosing a stone? Ask PHILEON.', text: 'The right diamond depends on the piece it belongs to. Tell us what you are considering — a specific PHILEON design, a size target, a colour or clarity preference, or a story you want the piece to carry — and we\u2019ll walk you through the trade-offs honestly.', buttonLabel: 'ASK PHILEON' },

      { type: 'links', heading: 'Explore PHILEON Fine Jewelry', items: [
        { label: 'Fine Jewelry', href: '/fine-jewelry' },
        { label: "Men's Rings", href: '/mens-rings' },
        { label: "Women's Rings", href: '/womens-rings' },
        { label: 'Pendants', href: '/pendants' },
        { label: 'Gold Jewelry', href: '/gold-jewelry' },
        { label: 'Custom Jewelry', href: '/custom-jewelry-canada' },
      ] },
    ],
    faq: [
      { q: 'Are lab-grown diamonds real diamonds?', a: 'Yes. Lab-grown diamonds are diamonds — the same crystalline carbon, with the same core physical and optical properties as natural diamonds. They are not simulants such as cubic zirconia or moissanite.' },
      { q: 'Can a jeweller tell the difference by looking?', a: 'Not reliably. Well-cut lab-grown and natural diamonds are visually indistinguishable to the unaided eye. Confirming origin requires specialised gemological equipment and, ideally, a certificate from a recognised grading body.' },
      { q: 'Which one holds value better?', a: 'Neither should be purchased as an investment. Natural diamonds have a longer secondary-market history, but resale for either category rarely matches original retail and depends heavily on the specific stone, current conditions and how it is sold.' },
      { q: 'Are lab-grown diamonds more sustainable?', a: 'It depends on the specific producer, method and energy source — not the category as a whole. Broad "sustainable" claims about either category should be verified against the specific supply chain.' },
      { q: 'Do lab-grown and natural diamonds use the same grading system?', a: 'Yes. Both are graded using the 4Cs — cut, colour, clarity and carat weight — by major grading bodies. Certificates for lab-grown stones will state that the stone is laboratory-grown.' },
    ],
  },
  {
    slug: '10k-vs-14k-vs-18k-gold',
    title: '10K vs 14K vs 18K Gold: Which Is Right for You?',
    excerpt:
      'Gold karat is a design decision, not a ranking. A practical guide to purity, colour, durability and which karat makes sense for your jewelry.',
    heroImage: null, // no invented imagery — typography-led card
    author: 'PHILEON Atelier',
    publishedAt: '2026-02-29',
    updatedAt: '2026-02-29',
    category: 'Gold Guide',
    tags: ['gold', 'materials', '10k', '14k', '18k'],
    relatedProductSlugs: ['drape', 'bajan-joe', 'quadriga-dominus'],
    body: [
      { type: 'p', text: 'Gold karat is not a ranking from “bad” to “good.” It is a design decision.' },
      { type: 'p', text: '10K, 14K and 18K gold each balance purity, colour, durability, weight, maintenance and price differently. The right choice depends on how the piece will be worn, how you want the metal to look, and what matters most to you over time.' },
      { type: 'p', text: 'At PHILEON, karat is treated as part of the architecture of a piece — not simply a number stamped inside the band.' },
      { type: 'p', text: 'This guide breaks down the practical differences so you can choose with confidence.' },

      { type: 'h2', text: 'What does gold karat actually mean?' },
      { type: 'p', text: 'Pure gold is 24 karat. A karat number tells you how much of the metal alloy is pure gold.' },
      { type: 'table', headers: ['Gold type', 'Pure gold content', 'Approximate percentage'], rows: [
        ['10K', '10 / 24', '41.7%'],
        ['14K', '14 / 24', '58.5%'],
        ['18K', '18 / 24', '75.0%'],
      ] },
      { type: 'p', text: 'The remaining percentage is made up of other metals used to create strength, colour and working characteristics. Those alloying metals vary depending on whether the finished metal is yellow, white or rose gold.' },

      { type: 'h2', text: '10K gold' },
      { type: 'p', text: 'For broadly comparable alloy families, 10K gold is generally harder and more resistant to deformation than 14K or 18K because it contains a higher proportion of alloying metals.' },
      { type: 'ul', items: [
        '41.7% pure gold',
        'Generally harder and more resistant to scratching and deformation than higher-karat gold',
        'More restrained gold colour in yellow gold',
        'A strong choice for rings, bracelets and pieces expected to take regular wear',
        'Typically the most accessible price point among the three',
        'Lower gold content does not mean poor quality when the piece is properly designed and manufactured',
      ] },
      { type: 'note', label: 'Best suited to', text: 'customers who prioritize durability, daily wear and value.' },

      { type: 'h2', text: '14K gold' },
      { type: 'p', text: '14K gold sits between 10K and 18K in both purity and physical character.' },
      { type: 'ul', items: [
        '58.5% pure gold',
        'Stronger gold colour than 10K',
        'Still durable enough for regular wear',
        'Commonly chosen for fine jewelry because it balances purity, appearance and resilience',
        'Softer than 10K but harder than 18K',
        'Often a practical choice for engagement rings, bands, pendants, earrings and statement pieces',
      ] },
      { type: 'note', label: 'Best suited to', text: 'customers who want a richer gold presence without moving all the way to 18K.' },

      { type: 'h2', text: '18K gold' },
      { type: 'p', text: '18K gold places more emphasis on gold itself.' },
      { type: 'ul', items: [
        '75% pure gold',
        'Richer and more saturated yellow-gold colour',
        'Typically heavier and softer than comparable lower-karat alloys',
        'More susceptible to scratching and surface wear',
        'Often chosen for heirloom, luxury and collector-focused jewelry',
        'Higher intrinsic gold content generally means higher material cost',
      ] },
      { type: 'note', label: 'Best suited to', text: 'customers who prioritize gold purity, richness of colour and a more traditional high-gold luxury feel.' },

      { type: 'h2', text: 'Which one is more durable?' },
      { type: 'p', text: 'For broadly comparable designs and alloy families:' },
      { type: 'ul', items: [
        '10K → generally hardest',
        '14K → balanced',
        '18K → generally softer',
      ] },
      { type: 'p', text: 'Durability is not determined by karat alone. A ring with poor proportions, thin walls, weak prongs or an unsuitable setting can fail regardless of karat.' },
      { type: 'p', text: 'Real durability also depends on design, thickness, stone setting, alloy formulation, wear habits, maintenance, and whether the piece is a ring, pendant, earring, cuff or another form.' },

      { type: 'h2', text: 'Which one looks the most “gold”?' },
      { type: 'p', text: 'For yellow gold, higher karat generally produces a richer, warmer and more saturated gold colour.' },
      { type: 'ul', items: [
        '10K: lighter, more alloy-influenced',
        '14K: warmer and more visibly gold',
        '18K: richest traditional yellow-gold tone of the three',
      ] },
      { type: 'h3', text: 'White gold' },
      { type: 'p', text: 'White gold appearance depends heavily on alloy composition and finishing. Some white-gold pieces may use rhodium plating depending on the specific finish and alloy.' },
      { type: 'h3', text: 'Rose gold' },
      { type: 'p', text: 'Copper content contributes to the rose tone, and exact colour varies by alloy recipe.' },

      { type: 'h2', text: 'Does higher karat mean heavier?' },
      { type: 'p', text: 'If the exact same design is produced at the exact same volume, different alloys can have different densities. However, final piece weight also depends on CAD volume, dimensions, hollow vs solid construction, stone layout, gallery design, shank thickness and finishing.' },
      { type: 'p', text: 'A piece produced in 18K is not automatically heavier than the same silhouette in 10K — the design controls the outcome as much as the alloy does.' },

      { type: 'h2', text: 'What about skin sensitivity?' },
      { type: 'p', text: 'Gold purity can influence how much alloying metal is present, but skin sensitivity depends on the specific alloy composition and the individual wearer. Someone sensitive to certain metals may react to one alloy and not another.' },
      { type: 'p', text: 'If you have known metal sensitivities, ask what alloy is being used rather than relying on karat alone.' },

      { type: 'h2', text: 'Which karat should you choose?' },
      { type: 'h3', text: 'Choose 10K if' },
      { type: 'ul', items: [
        'You expect frequent everyday wear',
        'Durability is a priority',
        'You want real gold at a lower material cost',
        'You prefer a slightly more restrained gold tone',
      ] },
      { type: 'h3', text: 'Choose 14K if' },
      { type: 'ul', items: [
        'You want a balance between richness and durability',
        'You want a stronger gold presence than 10K',
        'The piece will be worn regularly',
        'You want a traditional fine-jewelry middle ground',
      ] },
      { type: 'h3', text: 'Choose 18K if' },
      { type: 'ul', items: [
        'Purity and gold colour matter most',
        'You prefer a richer luxury finish',
        'You are comfortable with a softer metal',
        'The piece is heirloom, collector-focused or intentionally high-gold',
      ] },

      { type: 'h2', text: 'What does PHILEON recommend?' },
      { type: 'p', text: 'There is no single PHILEON karat. The correct metal depends on the piece.' },
      { type: 'p', text: 'A substantial men’s ring may make excellent sense in 10K. A refined heirloom piece may call for 18K. A design that needs a balance of colour, durability and everyday wear may land naturally in 14K.' },
      { type: 'p', text: 'PHILEON selects metal as part of the design system — based on form, scale, wear, setting, finish and intended use.' },
      { type: 'quote', text: 'The goal is not to choose the highest number. The goal is to choose the right material for the object.' },

      { type: 'h2', text: 'Quick comparison' },
      { type: 'table', headers: ['', '10K Gold', '14K Gold', '18K Gold'], rows: [
        ['Pure gold', '41.7%', '58.5%', '75%'],
        ['Relative hardness', 'Highest of the three', 'Balanced', 'Softer'],
        ['Yellow-gold richness', 'More restrained', 'Rich', 'Richest'],
        ['Everyday durability', 'Strong', 'Strong balance', 'More care recommended'],
        ['Material cost', 'Generally lowest', 'Middle', 'Generally highest'],
        ['Typical use', 'Daily wear / substantial pieces', 'Broad fine-jewelry use', 'Heirloom / high-gold luxury'],
      ] },

      { type: 'cta', heading: 'Still deciding? Ask PHILEON.', text: 'Choosing gold is easier when the metal is considered alongside the design itself. If you’re deciding between 10K, 14K or 18K for a PHILEON piece, send us the piece you’re considering and how you plan to wear it.', buttonLabel: 'ASK PHILEON' },

      { type: 'links', heading: 'Explore PHILEON Fine Jewelry', items: [
        { label: 'Fine Jewelry', href: '/fine-jewelry' },
        { label: "Men's Rings", href: '/mens-rings' },
        { label: "Women's Rings", href: '/womens-rings' },
        { label: 'Pendants', href: '/pendants' },
        { label: 'Gold Jewelry', href: '/gold-jewelry' },
        { label: 'Custom Jewelry', href: '/custom-jewelry-canada' },
      ] },
    ],
    faq: [
      { q: 'Is 10K gold real gold?', a: 'Yes. 10K gold is a legally recognized gold alloy containing 41.7% pure gold.' },
      { q: 'Is 14K better than 10K?', a: 'Not inherently. 14K contains more pure gold, while 10K is generally harder. The better choice depends on the design and how the piece will be worn.' },
      { q: 'Is 18K too soft for rings?', a: 'No, but it is softer than 10K and 14K. Proper design, stone setting and maintenance matter significantly.' },
      { q: 'Can white gold be 10K, 14K or 18K?', a: 'Yes. White gold can be produced at different karats. Its colour and physical properties depend on the alloy recipe and finish.' },
      { q: 'Which karat is best for everyday wear?', a: '10K and 14K are often strong choices for frequent wear, but construction and design matter just as much as karat.' },
    ],
  },
];

export function getArticle(slug) {
  return journalArticles.find((a) => a.slug === slug) || null;
}
