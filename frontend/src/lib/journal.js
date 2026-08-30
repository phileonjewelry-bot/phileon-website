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
    slug: 'jewelry-setting-styles',
    title: 'Jewelry Setting Styles Explained: Prong, Bezel, Pavé, Channel and More',
    seoTitle: 'Jewelry Setting Styles Explained: Prong, Bezel, Pavé & More | PHILEON',
    seoDescription:
      'Understand the differences between prong, bezel, pavé, channel, halo, flush and other jewelry setting styles — and how each affects appearance, protection, profile and wear.',
    excerpt:
      'A setting controls far more than appearance. Learn how prongs, bezels, pavé, channels and other systems affect stone exposure, profile, protection and wear.',
    heroImage: null,
    author: 'PHILEON Atelier',
    publishedAt: '2026-02-29',
    updatedAt: '2026-02-29',
    category: 'Setting Guide',
    tags: ['setting styles', 'diamonds', 'design', 'bespoke'],
    relatedProductSlugs: ['drape', 'bajan-joe', 'quadriga-dominus'],
    body: [
      { type: 'p', text: 'The setting decides how a stone meets the world.' },
      { type: 'p', text: 'It determines how much of the stone is visible, how high it sits, how light enters it, how exposed its edges are and how the entire piece feels on the hand or body.' },
      { type: 'p', text: 'A delicate claw can make a stone appear almost suspended. A bezel can frame it as part of the metal architecture. Pavé can turn a surface into light. Channel setting can make a line of stones feel built into the object rather than placed on top of it.' },
      { type: 'p', text: 'There is no single "best" setting.' },
      { type: 'p', text: 'The right choice depends on the stone, the design, the wearer and what the piece needs to do.' },

      { type: 'h2', text: 'What is a jewelry setting?' },
      { type: 'p', text: 'A setting is the metal structure that secures a gemstone within a piece of jewelry.' },
      { type: 'p', text: 'Different setting systems influence:' },
      { type: 'ul', items: [
        'Stone exposure',
        'Profile height',
        'Protection',
        'Visual emphasis',
        'Cleaning access',
        'Snag potential',
        'Repair complexity',
        'Resizing flexibility',
        'How much metal is visible around the stone',
      ] },
      { type: 'p', text: 'Security comes from the combination of setting type, execution, metal condition, stone shape and ongoing maintenance.' },

      { type: 'h2', text: 'Prong and claw settings' },
      { type: 'p', text: 'Prong settings use small metal projections to hold a stone in position.' },
      { type: 'p', text: 'Terminology varies. "Prong" is the broad term; "claw" often describes a more tapered or pointed prong shape. Design language varies among jewellers.' },
      { type: 'ul', items: [
        'Exposes a large portion of the stone',
        'Allows relatively little metal to cover the stone face',
        'Commonly used for centre stones',
        'Can produce a lighter, more open visual effect',
        'Requires well-shaped, correctly positioned prongs',
        'Prongs can wear over time and should be inspected',
      ] },
      { type: 'note', label: 'Best suited to', text: 'Designs where the stone should remain visually dominant and relatively exposed.' },

      { type: 'h2', text: 'Four-prong vs six-prong' },
      { type: 'p', text: 'Four-prong settings generally leave more of the stone perimeter visible. Six-prong settings introduce additional contact points around the stone.' },
      { type: 'h3', text: 'Four prongs' },
      { type: 'ul', items: [
        'More open appearance',
        'Less metal around the perimeter',
        'Commonly used for many shapes and styles',
      ] },
      { type: 'h3', text: 'Six prongs' },
      { type: 'ul', items: [
        'More metal contact points',
        'Can create a more enclosed or classic appearance',
        'Particularly associated with round centre stones in many traditional designs',
      ] },
      { type: 'p', text: 'Prong count is only one part of setting security. Prong thickness, placement, wear and workmanship matter just as much.' },

      { type: 'h2', text: 'Bezel settings' },
      { type: 'p', text: 'A bezel uses a rim or wall of metal around all or part of the stone perimeter.' },
      { type: 'ul', items: [
        'A full bezel surrounds most or all of the stone edge',
        'A partial bezel leaves selected areas exposed',
        'Can visually integrate the stone into the metal architecture',
        'Often gives vulnerable stone edges more coverage than an open prong setting',
        'Can create a lower-profile, smooth-edged appearance',
        'May show more visible metal around the stone',
      ] },
      { type: 'note', label: 'Best suited to', text: 'Customers who like a more architectural metal presence, smoother edges or additional perimeter coverage.' },

      { type: 'h2', text: 'Half bezel and partial bezel' },
      { type: 'p', text: 'Partial bezels secure the stone at selected sections of its perimeter rather than enclosing it fully.' },
      { type: 'ul', items: [
        'Retains some of the architectural protection of a bezel',
        'Exposes more of the stone edge',
        'Produces a more open contemporary look',
        'Requires careful design around the stone\u2019s shape and stress points',
      ] },
      { type: 'p', text: 'Not every stone shape is equally suited to a partial bezel.' },

      { type: 'h2', text: 'Pavé settings' },
      { type: 'p', text: 'Pavé refers to many small stones set closely together so that the surface appears covered with gemstones.' },
      { type: 'ul', items: [
        'Stones are individually seated into the metal',
        'Small beads or prongs (or shared metal) hold them',
        'Metal visibility can be minimized',
        'Common on shoulders, bands, halos and sculptural surfaces',
        'Provides continuous sparkle rather than emphasizing one isolated stone',
        'Requires precise spacing and sufficient supporting metal',
      ] },
      { type: 'quote', text: 'Pavé is a surface system. Its strength depends on the structure underneath it.' },

      { type: 'h2', text: 'Micro-pavé' },
      { type: 'p', text: '"Micro-pavé" generally refers to very fine pavé using small melee and close-set techniques.' },
      { type: 'ul', items: [
        'Creates a refined, highly detailed surface',
        'Often reduces the visual prominence of metal',
        'Requires precision setting',
        'Can be more maintenance-sensitive than a plain polished surface',
        'Resizing can be more complex if pavé extends around the shank',
      ] },

      { type: 'h2', text: 'Shared-prong settings' },
      { type: 'p', text: 'Shared-prong setting allows adjacent stones to share portions of the metal that secures them.' },
      { type: 'p', text: 'Common in eternity bands, diamond rows, halos and wedding bands.' },
      { type: 'h3', text: 'Visual effect' },
      { type: 'ul', items: [
        'Minimal metal between stones',
        'Continuous line of gemstones',
        'Open appearance',
      ] },
      { type: 'h3', text: 'Trade-offs' },
      { type: 'p', text: 'Because the stones are closely linked, a damaged or worn shared prong can affect neighboring stones. Regular inspection and maintenance matter.' },

      { type: 'h2', text: 'Channel settings' },
      { type: 'p', text: 'Channel-set stones sit between two continuous metal walls.' },
      { type: 'ul', items: [
        'Often used for rows of small stones',
        'Stones generally do not require individual prongs between each stone',
        'Creates a clean uninterrupted line',
        'Metal edges can help shield stone girdles from some direct contact',
        'Common in bands and structured geometric designs',
        'Precise stone sizing and channel geometry are important',
      ] },
      { type: 'p', text: 'Resizing a channel-set ring can be more complicated, especially when stones extend far around the circumference.' },

      { type: 'h2', text: 'Flush or gypsy settings' },
      { type: 'p', text: 'In a flush setting, a stone is seated into the metal so its upper surface sits close to the surrounding surface. "Gypsy setting" is a traditional trade term; we prefer "flush setting" as the primary terminology.' },
      { type: 'ul', items: [
        'Minimal projection above the metal',
        'Clean, integrated appearance',
        'Often used in bands and substantial rings',
        'Fewer raised components to catch compared with tall settings',
        'Requires adequate metal thickness around and beneath the stone',
      ] },
      { type: 'note', label: 'Best suited to', text: 'Designs where the stone should feel embedded into the form rather than elevated above it.' },

      { type: 'h2', text: 'Halo settings' },
      { type: 'p', text: 'A halo uses a border of smaller stones surrounding a centre stone.' },
      { type: 'ul', items: [
        'Increases visual spread around the centre',
        'Can create contrast through color or stone type',
        'May use pavé, shared prong, bezel or other techniques within the halo',
        'Halo geometry can follow or contrast with the centre-stone shape',
        'Adds additional settings that require maintenance',
      ] },
      { type: 'quote', text: 'A halo changes visual scale, not the physical size of the centre stone itself.' },

      { type: 'h2', text: 'Double halos and multi-level halos' },
      { type: 'p', text: 'Additional halo rows can increase overall spread and surface sparkle.' },
      { type: 'ul', items: [
        'More stones mean more setting points',
        'Design can become visually heavier',
        'Height may increase depending on construction',
        'Cleaning access may become more complex',
      ] },

      { type: 'h2', text: 'Tension-style settings' },
      { type: 'p', text: 'A true tension setting holds the stone using engineered pressure between metal sections. Some designs merely look tension-set while actually using concealed supports or partial settings.' },
      { type: 'p', text: 'True tension settings are highly engineering-dependent and should not be treated as a generic style that can simply be applied to any stone or ring.' },
      { type: 'ul', items: [
        'Highly open visual appearance',
        'Exposes significant portions of the stone',
        'Relies heavily on metal properties and precise construction',
        'Resizing can be particularly design-sensitive',
      ] },

      { type: 'h2', text: 'Bar settings' },
      { type: 'p', text: 'Bar settings secure stones between vertical metal bars, often creating a repeated architectural rhythm.' },
      { type: 'p', text: 'Common in bands, geometric ring designs and linear stone arrangements.' },
      { type: 'ul', items: [
        'More metal definition than shared-prong rows',
        'Stones remain visually separated',
        'Strong linear structure',
      ] },
      { type: 'p', text: 'Bar setting is not the same as channel setting.' },

      { type: 'h2', text: 'Invisible settings' },
      { type: 'p', text: 'Invisible setting is a specialized technique where stones are arranged so little or no metal is visible between them from the face. It is often used with calibrated stones.' },
      { type: 'ul', items: [
        'Creates continuous fields of gemstones',
        'Requires precisely cut stones and specialized setting geometry',
        'Repairs can be technically demanding',
        'Should not be generalized as suitable for every design',
      ] },

      { type: 'h2', text: 'Which settings protect a stone the most?' },
      { type: 'quote', text: 'More metal coverage can reduce exposure, but no setting makes a gemstone impact-proof.' },
      { type: 'p', text: 'A full bezel generally covers more of a stone\u2019s perimeter than a minimal prong setting. A flush setting can keep the stone close to the metal surface. But protection also depends on:' },
      { type: 'ul', items: [
        'Stone hardness and toughness',
        'Stone shape',
        'Exposed corners',
        'Setting height',
        'Metal thickness',
        'Wear habits',
        'Craftsmanship',
        'Maintenance',
      ] },
      { type: 'p', text: 'Hardness and toughness are not the same property. A very hard stone can still chip along a vulnerable cleavage plane if impacted the wrong way.' },

      { type: 'h2', text: 'Stone shape changes the setting decision' },
      { type: 'p', text: 'Certain shapes have vulnerable points or corners — pear, marquise, princess, emerald cut and heart, among others.' },
      { type: 'p', text: 'Prongs, V-prongs, bezels or protective architecture may be used strategically around points and corners.' },
      { type: 'p', text: 'The setting should respond to the geometry of the stone, not force every stone into the same solution.' },

      { type: 'h2', text: 'Setting height and profile' },
      { type: 'p', text: 'Setting style affects how high a stone sits above the finger or body.' },
      { type: 'h3', text: 'Higher-profile designs may' },
      { type: 'ul', items: [
        'Create dramatic presence',
        'Allow more space beneath certain stone arrangements',
        'Feel more exposed during daily activity',
      ] },
      { type: 'h3', text: 'Lower-profile designs may' },
      { type: 'ul', items: [
        'Sit closer to the hand',
        'Feel more integrated',
        'Reduce projection',
      ] },
      { type: 'p', text: 'Low profile does not automatically mean safer.' },

      { type: 'h2', text: 'How setting style affects cleaning' },
      { type: 'p', text: 'Open galleries and exposed undersides may make it easier to access some areas for cleaning. Closed or highly intricate designs can trap residue in different areas.' },
      { type: 'p', text: 'Pavé, halos and multi-stone arrangements create more crevices than plain metal. For piece-specific care, follow the PHILEON Jewelry Care guidance rather than generic online advice.' },

      { type: 'h2', text: 'How setting style affects resizing' },
      { type: 'p', text: 'The setting system can determine how much flexibility a ring has for resizing. More complex to resize may include:' },
      { type: 'ul', items: [
        'Full eternity styles',
        'Channel-set sections',
        'Pavé extending far down the shank',
        'Continuous engraving',
        'Enamel',
        'Structural multi-stone designs',
        'Tension-engineered rings',
      ] },
      { type: 'quote', text: 'Resizing feasibility belongs to the specific ring, not the setting name alone.' },

      { type: 'h2', text: 'Setting style and daily wear' },
      { type: 'p', text: 'Someone working frequently with their hands may prefer a setting with lower projection or more perimeter coverage. Someone prioritizing maximum stone visibility may prefer a more open setting. Someone choosing a sculptural statement ring may intentionally accept a more dramatic profile.' },
      { type: 'p', text: 'The right setting should match how the piece will actually be worn.' },

      { type: 'h2', text: 'What setting does PHILEON recommend?' },
      { type: 'quote', text: 'There is no default PHILEON setting. The setting is chosen as part of the architecture.' },
      { type: 'p', text: 'A centre stone may need openness. A vulnerable corner may need protection. A pavé shoulder may need enough underlying metal to remain structurally sound. A bezel may become part of the visual language instead of simply functioning as a stone holder.' },
      { type: 'p', text: 'The decision depends on stone shape, scale, wear, metal, profile, movement, surrounding stones and the overall object.' },
      { type: 'p', text: 'The goal is not to apply the most fashionable setting. The goal is to build the setting that belongs to the design.' },

      { type: 'h2', text: 'Quick comparison' },
      { type: 'table', headers: ['Setting', 'Visual character', 'Stone exposure', 'Typical design effect'], rows: [
        ['Prong / claw', 'Open', 'High', 'Stone-forward'],
        ['Bezel', 'Architectural', 'Lower perimeter exposure', 'Integrated / framed'],
        ['Pavé', 'Continuous sparkle', 'Many small stones exposed', 'Surface-driven'],
        ['Channel', 'Linear / clean', 'Moderate', 'Structured stone row'],
        ['Flush', 'Minimal / embedded', 'Low projection', 'Integrated'],
        ['Halo', 'Expanded visual spread', 'Centre + surrounding melee', 'Framed / amplified'],
        ['Shared prong', 'Open stone row', 'High', 'Continuous gemstone line'],
        ['Bar', 'Structured / geometric', 'Moderate', 'Rhythmic separation'],
      ] },

      { type: 'cta', heading: 'Not sure which setting suits your piece? Ask PHILEON.', text: 'Send us the stone or PHILEON piece you\u2019re considering and tell us how you expect to wear it. We can help you think through setting style, profile, stone exposure and design character in context.', buttonLabel: 'ASK PHILEON' },

      { type: 'links', heading: 'Explore PHILEON Fine Jewelry', items: [
        { label: 'Fine Jewelry', href: '/fine-jewelry' },
        { label: "Men's Rings", href: '/mens-rings' },
        { label: "Women's Rings", href: '/womens-rings' },
        { label: 'Statement Rings', href: '/statement-rings' },
        { label: 'Pendants', href: '/pendants' },
        { label: 'Custom Jewelry', href: '/custom-jewelry-canada' },
      ] },
    ],
    faq: [
      { q: 'Which jewelry setting is the most secure?', a: 'There is no universal answer. Settings with more metal coverage, such as bezels, may reduce stone-edge exposure, but actual security depends on the design, workmanship, stone shape, metal condition and maintenance.' },
      { q: 'Does a bezel make a diamond look smaller?', a: 'A bezel places more visible metal around the stone perimeter than an open prong setting, which changes how the stone is visually framed. Whether it appears larger or smaller depends on the overall proportions and design.' },
      { q: 'Is pavé suitable for everyday wear?', a: 'It can be. Well-designed pavé is widely used in fine jewelry, but it contains many small individually set stones and benefits from appropriate care and inspection.' },
      { q: 'Are prongs better than bezels?', a: 'Neither is universally better. Prongs generally expose more of the stone, while bezels provide more perimeter coverage and a stronger visible metal frame. The correct choice depends on the design and wearer.' },
      { q: 'Can a channel-set ring be resized?', a: 'Sometimes. The answer depends on how far the stones extend around the ring, the channel geometry, metal, size change required and overall construction.' },
    ],
  },
  {
    slug: 'ring-sizing-guide',
    title: 'Ring Sizing 101: How to Find the Right Fit',
    seoTitle: 'Ring Sizing Guide: How to Find the Right Fit | PHILEON',
    seoDescription:
      'Learn how ring sizing works, why finger size changes, how width affects fit, when home measurements help, and when to have your finger professionally sized.',
    excerpt:
      'Finger size is only part of the equation. Learn how band width, knuckles, temperature and ring architecture affect the way a ring actually fits.',
    heroImage: null,
    author: 'PHILEON Atelier',
    publishedAt: '2026-02-29',
    updatedAt: '2026-02-29',
    category: 'Fit Guide',
    tags: ['ring sizing', 'fit', 'materials', 'bespoke'],
    relatedProductSlugs: ['drape', 'bajan-joe', 'quadriga-dominus'],
    body: [
      { type: 'p', text: 'A ring can be the correct numerical size and still feel wrong.' },
      { type: 'p', text: 'Finger shape, band width, temperature, time of day, dominant hand, knuckle size and the architecture of the ring all influence fit.' },
      { type: 'p', text: 'That is why PHILEON treats sizing as part of the design process rather than a final dropdown selection.' },
      { type: 'p', text: 'A good fit should feel secure without feeling restrictive, pass over the knuckle with reasonable resistance, and sit comfortably once in position.' },
      { type: 'p', text: 'This guide explains how to get as close as possible before ordering — and when it is worth having your finger measured professionally.' },

      { type: 'h2', text: 'What does a ring size actually measure?' },
      { type: 'p', text: 'Ring sizing systems represent the internal dimensions of the finished ring. In North America, PHILEON primarily works with US ring sizes.' },
      { type: 'ul', items: [
        'A ring size corresponds to an internal diameter and circumference range',
        'Half sizes represent smaller increments between full sizes',
        'Other countries use different sizing systems',
        'Conversions between systems should be treated as approximate unless verified against a proper sizing standard',
      ] },

      { type: 'h2', text: 'What should a properly fitted ring feel like?' },
      { type: 'p', text: 'A well-fitted ring should:' },
      { type: 'ul', items: [
        'Slide over the knuckle with light to moderate resistance',
        'Feel secure once seated at the base of the finger',
        'Not spin excessively during normal wear',
        'Not leave the finger numb, painful or deeply indented',
        'Not feel as though it could slide off with a casual hand movement',
      ] },
      { type: 'quote', text: 'Secure does not mean tight.' },
      { type: 'p', text: 'A slight impression after wearing a ring can be normal. Persistent pain, tingling, discoloration or significant swelling is not a desirable fit.' },

      { type: 'h2', text: 'Why your finger size changes' },
      { type: 'p', text: 'Fingers are not dimensionally static.' },
      { type: 'ul', items: [
        'Heat can make fingers swell',
        'Cold can make fingers temporarily smaller',
        'Hydration can affect swelling',
        'Physical activity can temporarily increase finger volume',
        'Morning and evening measurements can differ',
        'Dominant-hand fingers may differ from the opposite hand',
        'Individual fingers are not necessarily the same size on both hands',
      ] },
      { type: 'note', label: 'Recommendation', text: 'Measure more than once, under normal conditions, before committing to a size.' },

      { type: 'h2', text: 'Band width changes how a ring fits' },
      { type: 'p', text: 'A wider ring places more metal against the finger than a narrow band. As a result, wider rings can feel tighter even when their internal diameter is technically the same.' },
      { type: 'ul', items: [
        'Narrow bands often tolerate a more exact measured size',
        'Substantial bands may require additional fit allowance',
        'Very wide rings or multi-finger structures need to be evaluated as designs, not just numeric sizes',
        'Interior profile matters too',
      ] },
      { type: 'p', text: 'Width adjustments should be made according to the actual ring architecture, not a one-size-fits-all formula.' },

      { type: 'h2', text: 'Comfort fit vs standard fit' },
      { type: 'p', text: 'Standard-fit bands typically have a flatter interior profile. Comfort-fit rings generally use a more rounded interior contour, reducing the amount of metal contacting the finger at the edges. This can make a substantial ring feel easier to wear.' },
      { type: 'p', text: 'However:' },
      { type: 'ul', items: [
        'Comfort-fit geometry varies by manufacturer and design',
        'It does not eliminate the need for accurate sizing',
        'The same nominal size may feel different between two rings with different internal profiles',
      ] },
      { type: 'p', text: 'If a specific PHILEON piece is designed with a comfort-fit interior, that product-specific detail should guide the sizing decision.' },

      { type: 'h2', text: 'The knuckle matters' },
      { type: 'p', text: 'Some wearers have a knuckle significantly wider than the base of the finger.' },
      { type: 'ul', items: [
        'If a ring is sized only for the base, it may not pass the knuckle',
        'If sized only for the knuckle, it may spin once seated',
      ] },
      { type: 'p', text: 'Balancing those dimensions may require careful sizing, interior sizing features where appropriate, design-specific adjustment, or professional consultation.' },
      { type: 'quote', text: 'The correct size is sometimes a compromise between getting over the knuckle and remaining stable at the base of the finger.' },

      { type: 'h2', text: 'How to measure your ring size at home' },
      { type: 'h3', text: 'Method 1 — Measure a ring that already fits' },
      { type: 'p', text: 'This is the best home method when it is available.' },
      { type: 'ol', items: [
        'Choose a ring that fits the intended finger properly',
        'Confirm it is worn on the same hand and finger',
        'Measure the internal diameter across the widest inside point — do not include the metal walls',
        'Measure in millimetres with a precise ruler or caliper if available',
        'Compare the measurement with a reputable US ring-size chart, or provide the measurement directly to PHILEON',
      ] },
      { type: 'note', label: 'Important', text: 'Do not measure from a screenshot or a printed chart whose scale cannot be verified. Browser and printer scaling can distort a chart enough to change the size.' },

      { type: 'h3', text: 'Method 2 — Paper or non-stretch strip' },
      { type: 'p', text: 'A narrow strip of paper can provide a rough finger circumference estimate.' },
      { type: 'ol', items: [
        'Wrap it around the intended finger',
        'Keep it snug but not tight',
        'Mark where the ends meet',
        'Lay it flat and measure the length in millimetres',
      ] },
      { type: 'p', text: 'This method is less reliable than measuring a properly fitting ring or using professional ring gauges. String, in particular, can stretch or compress and should not be presented as precision sizing.' },

      { type: 'h2', text: 'When should you measure?' },
      { type: 'p', text: 'Measure:' },
      { type: 'ul', items: [
        'When hands are at a comfortable, normal temperature',
        'After the body has returned to normal after strenuous activity',
        'More than once',
        'Ideally at different times of day',
      ] },
      { type: 'p', text: 'Avoid measuring when:' },
      { type: 'ul', items: [
        'Hands are extremely cold',
        'Fingers are visibly swollen',
        'Immediately after intense exercise',
        'Immediately after significant temperature exposure',
      ] },

      { type: 'h2', text: 'Which hand are you sizing?' },
      { type: 'p', text: 'Measure the exact finger and exact hand where the ring will be worn.' },
      { type: 'p', text: 'Do not assume that the left ring finger matches the right, that index fingers match, or that dominant and non-dominant hands are identical.' },
      { type: 'quote', text: 'A size from another finger is a clue, not a measurement.' },

      { type: 'h2', text: 'What about statement rings?' },
      { type: 'quote', text: 'Statement rings need more sizing attention, not less.' },
      { type: 'p', text: 'A substantial head, broad shoulders, heavier mass or wide shank can change perceived fit. For PHILEON pieces with large top architecture, wide shanks, sculptural shoulders, heavy heads or asymmetrical construction, fit should consider both circumference and stability.' },
      { type: 'p', text: 'A ring that is technically large enough but constantly rotates may not be properly sized for the design.' },

      { type: 'h2', text: 'What about two-finger rings?' },
      { type: 'p', text: 'A two-finger ring cannot be sized like two unrelated single rings.' },
      { type: 'p', text: 'The important relationships include:' },
      { type: 'ul', items: [
        'Size of each finger',
        'Spacing between the fingers',
        'Angle between the openings',
        'Bridge width',
        'Relative finger height',
        'Interior geometry',
      ] },
      { type: 'p', text: 'For a true two-finger structure, both fingers should be measured and the relationship between them should be considered during CAD and fit development.' },

      { type: 'h2', text: 'Should you size up for a wide band?' },
      { type: 'p', text: 'Sometimes, but not automatically.' },
      { type: 'p', text: 'Wide bands can feel tighter because more surface area contacts the finger. However, the correct adjustment depends on width, internal contour, finger shape, knuckle size, design and desired fit.' },
      { type: 'p', text: 'Do not automatically add a half size or a full size without considering the actual ring.' },

      { type: 'h2', text: 'Can a finished ring be resized?' },
      { type: 'quote', text: 'Many rings can be resized. Some should not be.' },
      { type: 'p', text: 'Resizing feasibility depends on:' },
      { type: 'ul', items: [
        'Metal',
        'Stone placement',
        'Pavé',
        'Channel setting',
        'Engraving',
        'Enamel',
        'Continuous patterns',
        'Structural architecture',
        'How much size change is required',
      ] },
      { type: 'p', text: 'Some designs may tolerate only a narrow adjustment range. Where product-specific resizing information exists, that information should control.' },

      { type: 'h2', text: 'Eternity bands, pavé and complex designs' },
      { type: 'p', text: 'Rings with stones or design features extending around much of the circumference may be more difficult to resize because altering the shank can disrupt stone spacing, setting geometry, engraving, repeating patterns and finish continuity.' },
      { type: 'p', text: 'Customers buying these designs should prioritize accurate sizing before production.' },

      { type: 'h2', text: 'Surprise rings and gifts' },
      { type: 'p', text: 'If someone is buying a ring as a surprise, potential clues include an existing ring worn on the same finger, discreet assistance from someone close to the recipient, or professional measurement of an existing ring.' },
      { type: 'p', text: 'If exact sizing cannot be established, choose a design whose resizing options are understood before purchase.' },

      { type: 'h2', text: 'Ring size conversion charts' },
      { type: 'p', text: 'Different regions use different systems, including US and Canadian numeric sizing, UK letter sizing, and European circumference-based sizing.' },
      { type: 'p', text: 'Online conversion charts can be useful references, but small discrepancies exist between charts and manufacturing standards.' },
      { type: 'note', label: 'Recommendation', text: 'Whenever possible, provide PHILEON with the original size system or an actual internal diameter or circumference measurement, rather than repeatedly converting between systems.' },

      { type: 'h2', text: 'The most reliable method' },
      { type: 'p', text: 'For an important ring, the most reliable method is still a professional sizing with physical ring gauges.' },
      { type: 'p', text: 'A jeweller can assess base-of-finger fit, knuckle clearance, wide-band fit, dominant-hand differences and design-specific considerations. For bespoke PHILEON work, sizing can be addressed during the design conversation rather than treated as an afterthought.' },

      { type: 'h2', text: 'PHILEON sizing philosophy' },
      { type: 'quote', text: 'The number is the beginning. The fit is the decision.' },
      { type: 'p', text: 'PHILEON considers ring size alongside width, weight, architecture, interior profile and how the piece is intended to sit on the hand.' },
      { type: 'p', text: 'A delicate band and a substantial sculptural ring may both be marked with the same numeric size and still require different fit decisions. For that reason, sizing guidance should follow the actual object.' },

      { type: 'h2', text: 'Quick guide' },
      { type: 'table', headers: ['Situation', 'Best approach'], rows: [
        ['You already own a ring that fits', 'Measure its internal diameter'],
        ['Buying a narrow everyday band', 'Professional gauge or accurate existing-ring measurement'],
        ['Buying a wide or substantial ring', 'Confirm sizing with the specific design in mind'],
        ['Large knuckle / smaller finger base', 'Professional fitting recommended'],
        ['Two-finger ring', 'Measure both fingers and design relationship'],
        ['Bespoke piece', 'Confirm sizing during consultation'],
        ['Surprise gift', 'Measure a correctly fitting existing ring if possible'],
        ['Unsure between two sizes', 'Ask PHILEON before production'],
      ] },

      { type: 'cta', heading: 'Not sure about your size? Ask PHILEON.', text: 'Send us the piece you\u2019re considering, the finger it will be worn on and any sizing information you already have. For substantial, wide or sculptural rings, we can help you think about fit in the context of the design.', buttonLabel: 'ASK PHILEON' },

      { type: 'links', heading: 'Explore PHILEON Rings', items: [
        { label: "Men's Rings", href: '/mens-rings' },
        { label: "Women's Rings", href: '/womens-rings' },
        { label: 'Statement Rings', href: '/statement-rings' },
        { label: 'Fine Jewelry', href: '/fine-jewelry' },
        { label: 'Custom Jewelry', href: '/custom-jewelry-canada' },
      ] },
    ],
    faq: [
      { q: 'Should a ring be slightly tight?', a: 'A ring should feel secure but not restrictive. It should normally require some resistance to pass over the knuckle while remaining comfortable once seated.' },
      { q: 'Is your ring size the same on both hands?', a: 'Not necessarily. Corresponding fingers on opposite hands can differ in size, so measure the exact hand and finger where the ring will be worn.' },
      { q: 'Do wide rings fit tighter?', a: 'They often can because more metal contacts the finger. The amount of adjustment required depends on the width and internal geometry of the specific ring.' },
      { q: 'Is measuring with string accurate?', a: 'It can provide a rough estimate, but stretch and compression make string less reliable than a properly fitting ring, physical ring gauges or professional sizing.' },
      { q: 'Can PHILEON resize a ring later?', a: 'It depends on the design, metal, stone setting and amount of adjustment required. Confirm resizing options for the specific piece before relying on future resizing.' },
    ],
  },
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
