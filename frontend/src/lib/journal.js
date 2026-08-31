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
    slug: 'coloured-gemstones-explained',
    title: 'Coloured Gemstones Explained: Sapphire, Ruby, Emerald, Spinel, Tourmaline & More',
    seoTitle: 'Coloured Gemstones Explained: A Buying & Design Guide | PHILEON',
    seoDescription:
      'Explore sapphire, ruby, emerald, spinel, tourmaline, aquamarine, garnet, peridot and amethyst — including colour, treatments, inclusions, durability and design considerations.',
    excerpt:
      'Colour is only the beginning. Learn how gemstone identity, hue, treatments, inclusions, durability and setting considerations shape the stone you actually wear.',
    heroImage: null,
    author: 'PHILEON Atelier',
    publishedAt: '2026-02-29',
    updatedAt: '2026-02-29',
    category: 'Gemstone Guide',
    tags: ['coloured gemstones', 'sapphire', 'ruby', 'emerald', 'bespoke'],
    relatedProductSlugs: ['drape', 'bajan-joe', 'quadriga-dominus'],
    body: [
      { type: 'p', text: 'Colour changes the conversation.' },
      { type: 'p', text: 'With diamonds, buyers often begin with familiar grading language. Coloured gemstones ask different questions.' },
      { type: 'p', text: 'How strong is the colour? Is it too dark? Too light? Is the colour evenly distributed? What does the stone look like in different light? Has it been heated or otherwise treated? Are its inclusions part of its character, or do they affect how the stone should be set?' },
      { type: 'p', text: 'A sapphire, ruby, emerald, spinel or tourmaline is not defined by its name alone. The material matters. The colour matters. The cut matters. The treatment history matters. And once the stone becomes jewelry, the setting and intended wear matter too.' },

      { type: 'diagram', variant: 'decisions',
        title: 'A gem name can describe a species or a variety',
        center: 'GEM NAMING IS LAYERED',
        branches: [
          { label: 'Corundum', items: ['Ruby', 'Sapphire'] },
          { label: 'Beryl', items: ['Emerald', 'Aquamarine', 'Other beryl varieties'] },
          { label: 'Tourmaline group', items: ['Multiple coloured varieties and trade descriptions'] },
          { label: 'Garnet group', items: ['Multiple species and varieties'] },
          { label: 'Named by material', items: ['Spinel', 'Peridot (olivine)', 'Amethyst (quartz variety)'] },
        ],
        caption: 'Conceptual illustration — selected relationships only, not a complete mineralogical taxonomy. Some familiar gem names are varieties within a broader mineral species or group.',
      },

      { type: 'h2', text: 'Gemstone species vs variety' },
      { type: 'p', text: 'A gem species describes a mineral or material with a particular chemical and crystal identity. A variety is a recognized appearance or gemological category within that material.' },
      { type: 'ul', items: ['Corundum → ruby / sapphire', 'Beryl → emerald / aquamarine', 'Quartz → amethyst'] },
      { type: 'quote', text: 'The trade name may be familiar. The underlying material explains why different gems can share physical properties while looking completely different.' },

      { type: 'h2', text: 'Natural, laboratory-grown and simulant are not the same thing' },
      { type: 'h3', text: 'Natural' }, { type: 'p', text: 'Formed through geological processes.' },
      { type: 'h3', text: 'Laboratory-grown / lab-created' }, { type: 'p', text: 'Created in a controlled environment with essentially the same material identity as its natural counterpart.' },
      { type: 'h3', text: 'Simulant' }, { type: 'p', text: 'A different material used to imitate another gem\u2019s appearance.' },
      { type: 'quote', text: 'Origin and identity are different questions. Synthetic or lab-grown does not mean simulant.' },

      { type: 'h2', text: 'Colour is more than the colour name' },
      { type: 'p', text: 'Gem colour is commonly understood through hue, tone and saturation. "Blue sapphire" still leaves a great deal unanswered.' },

      { type: 'diagram', variant: 'flow',
        title: 'Colour is not one variable',
        steps: [
          { label: 'Hue', question: 'What colour family are we seeing?' },
          { label: 'Tone', question: 'How light or dark does the colour appear?' },
          { label: 'Saturation', question: 'How weak or vivid does the colour appear?' },
        ],
        caption: 'Conceptual illustration only — not a grading scale. Hue, tone and saturation work together; two gemstones described by the same colour word can look dramatically different.',
      },

      { type: 'h2', text: 'Hue' },
      { type: 'p', text: 'Hue is the basic colour impression. A gemstone may show one dominant hue, modifying secondary hues, or a different appearance under different lighting.' },
      { type: 'h2', text: 'Tone' },
      { type: 'p', text: 'Tone describes relative lightness or darkness. A stone can become visually too dark for a given design even if its colour is highly saturated. Medium tone is not universally superior.' },
      { type: 'h2', text: 'Saturation' },
      { type: 'p', text: 'Saturation describes the strength or intensity of colour. More saturated is not automatically more appropriate for every design.' },

      { type: 'h2', text: 'Lighting changes what you see' },
      { type: 'p', text: 'Gemstones can appear different under daylight, warm indoor light, cool artificial light and directional jewelry lighting.' },
      { type: 'quote', text: 'Evaluate important coloured stones in more than one lighting environment whenever practical.' },

      { type: 'h2', text: 'Cut matters differently in coloured gemstones' },
      { type: 'p', text: 'Cut influences brightness, extinction, windowing, colour distribution, symmetry and overall face-up character. Coloured-stone cutting may sometimes prioritize retaining desirable colour or rough weight alongside optical performance. Coloured stones do not follow the same cut-grading system as round brilliant diamonds. See Stone Shapes (/journal/engagement-ring-stone-shapes) for shape context.' },

      { type: 'h2', text: 'What is windowing?' },
      { type: 'p', text: 'A window is an area where the viewer can see through the stone more than intended because of the relationship between pavilion geometry and refractive behaviour. Not every visible light area is a window.' },
      { type: 'h2', text: 'What is extinction?' },
      { type: 'p', text: 'Extinction describes dark areas where little light returns to the viewer. Some contrast is part of normal faceting; excessive darkness may affect appearance.' },

      { type: 'h2', text: 'Inclusions are not automatically defects' },
      { type: 'p', text: 'Coloured gemstones commonly contain inclusions. Their importance depends on gemstone type, visibility, location, effect on appearance, effect on durability, and whether treatment is involved.' },
      { type: 'quote', text: 'Clarity expectations should be appropriate to the gemstone, not imported blindly from diamond buying.' },

      { type: 'h2', text: 'Treatments matter' },
      { type: 'p', text: 'Many coloured gemstones may be treated to improve or alter appearance. Categories can include heating, fracture filling, diffusion, oil or resin filling, irradiation and other recognized processes depending on material. The issue is not simply whether treatment exists — it is whether it is understood, appropriately disclosed and considered in valuation and care.' },
      { type: 'h2', text: 'Why disclosure matters' },
      { type: 'p', text: 'Treatment can affect value, rarity, care and repair considerations. Where documentation exists, it should accurately describe material and known treatment information. For downstream care implications, see Jewelry Care (/jewelry-care).' },

      { type: 'h2', text: 'Sapphire' },
      { type: 'p', text: 'Sapphire belongs to corundum and exists in many colours, with blue being the most familiar. Colour can vary widely, cutting changes light return, zoning may be visible, treatment history matters, and the setting should respond to actual stone geometry.' },
      { type: 'quote', text: '"Sapphire" describes the material. The individual stone still has to be judged.' },

      { type: 'h2', text: 'Ruby' },
      { type: 'p', text: 'Ruby is the red variety of corundum. Colour is central to visual character, inclusions are common, and treatment history can be important. Origin should not be inferred from appearance alone, and geographic-origin premiums should not be assumed without verified evidence.' },

      { type: 'h2', text: 'Emerald' },
      { type: 'p', text: 'Emerald is a green variety of beryl. Inclusions are common; fissures can be relevant to durability; clarity enhancement is common in the trade; care and setting may require additional consideration. Emerald is a useful example of why hardness alone does not describe how a gemstone behaves in jewelry.' },

      { type: 'h2', text: 'Spinel' },
      { type: 'p', text: 'Spinel is a distinct gemstone material, not a type of ruby or sapphire. It occurs in multiple colours. Historically, some famous red spinels were confused with ruby before modern gemology distinguished them.' },
      { type: 'quote', text: 'Spinel should not be framed merely as a ruby alternative.' },

      { type: 'h2', text: 'Tourmaline' },
      { type: 'p', text: 'Tourmaline represents a complex group with a very broad colour range — vivid pink, green, blue, bi-colour and multi-colour stones. Certain geographic or trade descriptors have specific gemological and commercial implications and should not be applied casually.' },

      { type: 'h2', text: 'Aquamarine' },
      { type: 'p', text: 'Aquamarine is a blue to blue-green variety of beryl. Visual character often includes a lighter tone, transparency, long geometric cuts and a clean, open appearance — but individual stones vary.' },

      { type: 'h2', text: 'Garnet' },
      { type: 'p', text: '"Garnet" refers to a broader group rather than a single red gemstone identity. Garnets can appear in red, orange, green and other colours. The word describes more diversity than the traditional dark-red stereotype suggests.' },

      { type: 'h2', text: 'Peridot' },
      { type: 'p', text: 'Peridot is the gem variety of olivine, known for green colour that can range in tone and saturation. Individual colour, clarity, cutting and setting/wear context all matter.' },

      { type: 'h2', text: 'Amethyst' },
      { type: 'p', text: 'Amethyst is the purple variety of quartz. Colour can vary from pale to medium to deep purple, sometimes with visible zoning. Deeper colour does not automatically equal objectively better.' },

      { type: 'h2', text: 'What about opal, pearl and other gem materials?' },
      { type: 'p', text: 'Not all gems behave like crystalline faceted stones. Opal, pearl, turquoise and other organic or porous materials can demand very different wear and care decisions. Gemstone is a broader category than faceted mineral crystal.' },

      { type: 'h2', text: 'Hardness is not the same as durability' },
      { type: 'h3', text: 'Hardness' }, { type: 'p', text: 'Resistance to scratching.' },
      { type: 'h3', text: 'Toughness' }, { type: 'p', text: 'Resistance to breaking, chipping or fracture.' },
      { type: 'h3', text: 'Stability' }, { type: 'p', text: 'How a material responds to heat, light, chemicals and environmental changes.' },
      { type: 'quote', text: 'A hard stone can still chip. A softer stone can still perform well when the design and wear expectations suit it.' },

      { type: 'diagram', variant: 'matrix',
        title: '"Durable" is not one measurement',
        items: [
          'Hardness — resistance to scratching',
          'Toughness — resistance to breaking',
          'Stability — resistance to environmental change',
          'Setting',
          'Stone condition',
          'Treatment',
          'Wear pattern',
          'Maintenance',
        ],
        center: 'JEWELRY DURABILITY',
        caption: 'Conceptual illustration — no single number tells you whether a gemstone is appropriate for a particular piece of jewelry. The material and the design have to be considered together.',
      },

      { type: 'h2', text: 'The Mohs scale: useful but limited' },
      { type: 'p', text: 'The Mohs scale compares relative scratch resistance. It does not measure toughness, fracture resistance, thermal stability, setting security or whether a ring is suitable for a specific customer.' },

      { type: 'h2', text: 'Everyday wear is a design question' },
      { type: 'p', text: '"Can I wear this every day?" is not answered by the gem name alone. It depends on the material, inclusions, fractures, treatments, setting, exposure, ring profile, wear habits and maintenance.' },

      { type: 'h2', text: 'Setting coloured gemstones' },
      { type: 'p', text: 'Considerations include prong placement, bezel protection, pointed corners, existing fissures, stone depth, pavilion geometry, fragile edges and visual colour interaction with surrounding metal. See Setting Styles Explained (/journal/jewelry-setting-styles).' },

      { type: 'h2', text: 'Metal colour changes the presentation' },
      { type: 'p', text: 'Yellow, white and rose metal can change the perceived relationship around a coloured stone. See 10K vs 14K vs 18K Gold (/journal/10k-vs-14k-vs-18k-gold).' },
      { type: 'quote', text: 'The stone stays the stone. The surrounding colour changes how the composition is read.' },

      { type: 'h2', text: 'Coloured stones and side stones' },
      { type: 'p', text: 'Side stones can amplify colour, introduce contrast, create a gradient, frame a centre stone or change the perceived scale. No rigid pairing rules apply.' },

      { type: 'h2', text: 'Natural inclusions vs damage' },
      { type: 'p', text: 'Not every internal feature visible in a gemstone is damage, but cracks, chips or surface-reaching features may warrant professional evaluation. A photograph may reveal a feature; it cannot always tell you what that feature means.' },

      { type: 'h2', text: 'Certificates and laboratory reports' },
      { type: 'p', text: 'A reputable independent gemological report may provide identification, natural / laboratory-grown origin where applicable, detectable treatments, weight, measurements, and sometimes geographic origin where the laboratory provides that service and evidence supports it. Not every coloured gemstone requires a report.' },

      { type: 'h2', text: 'Geographic origin' },
      { type: 'p', text: 'Origin can affect market perception, rarity and value, but origin determination is specialized and should not be guessed visually. Country of origin should be supported by appropriate evidence when represented as a material value factor.' },

      { type: 'h2', text: 'Why two sapphires can have completely different prices' },
      { type: 'p', text: 'Price may vary because of colour, size, transparency, clarity, cut, treatment, natural vs laboratory-grown origin, established provenance, rarity and market conditions.' },
      { type: 'quote', text: 'Gemstone pricing is multidimensional because the stones themselves are multidimensional.' },

      { type: 'h2', text: 'Natural vs laboratory-grown coloured gemstones' },
      { type: 'p', text: 'Lab-grown versions exist for several coloured gemstone materials and may share the same fundamental material identity while differing in origin. Disclosure matters. See Lab-Grown vs Natural Diamonds (/journal/lab-grown-vs-natural-diamonds) for a parallel discussion.' },
      { type: 'quote', text: 'Origin is one attribute of the stone, not a complete quality judgment.' },

      { type: 'h2', text: 'What should you inspect in person?' },
      { type: 'ul', items: ['Colour in several lighting conditions', 'Face-up appearance', 'Transparency', 'Inclusions', 'Cut', 'Windowing and extinction', 'Dimensions', 'Treatment and disclosure information', 'How the stone interacts with the intended metal'] },
      { type: 'p', text: 'The actual stone matters more than the category description attached to it. Not every online purchase requires physical inspection.' },

      { type: 'h2', text: 'Photographs are not the stone' },
      { type: 'p', text: 'White balance, camera sensor, lighting, editing, screen calibration, background colour and magnification all affect what an image shows. A digital image can communicate character but cannot guarantee exact colour reproduction, treatment status, origin or structural condition.' },

      { type: 'h2', text: 'Dimensions matter' },
      { type: 'p', text: 'For design work, relevant information can include length, width, depth, outline and orientation. Carat weight alone does not define setting geometry. See The Bespoke Jewelry Design Process (/journal/bespoke-jewelry-design-process) for how dimensions feed into design.' },

      { type: 'h2', text: 'Designing around colour' },
      { type: 'p', text: 'Colour can become the organizing principle for metal choice, accent stones, setting geometry, negative space, contrast, scale and visual rhythm. A coloured stone can be the centre of a design without the rest of the piece becoming decoration around it.' },

      { type: 'diagram', variant: 'journey',
        title: 'The stone changes the design problem',
        steps: [
          'Gem material — species, variety, natural or lab-grown, treatment',
          'Visible character — hue, tone, saturation, inclusions, cut',
          'Physical character — dimensions, geometry, hardness, toughness, stability',
          'Setting decisions — protection, exposure, profile, prong / bezel / other',
          'Design decisions — metal, side stones, scale, proportion, intended wear',
          'Finished jewelry',
        ],
        caption: 'Conceptual illustration. The gemstone is not an isolated purchase. Once it enters a piece of jewelry, its optical and physical characteristics become design inputs.',
      },

      { type: 'h2', text: 'Which coloured gemstone is best?' },
      { type: 'quote', text: 'There is no universally best coloured gemstone.' },
      { type: 'p', text: 'The useful questions are: what visual character do you want, how will the piece be worn, what scale and setting are planned, what treatment history is acceptable to you, what material and origin characteristics matter to you, and what budget is being designed around.' },

      { type: 'h2', text: 'What does PHILEON recommend?' },
      { type: 'quote', text: 'Choose the stone in front of you, not the gemstone name in your head.' },
      { type: 'p', text: '"Sapphire", "Emerald" and "Tourmaline" are categories. The design has to work with one actual stone.' },
      { type: 'p', text: 'Look at its colour, its proportions, its dimensions, its inclusions, its treatment history, its physical characteristics, the way it behaves in light, and the object you intend to build around it.' },
      { type: 'quote', text: 'A gemstone becomes part of the design when its individual characteristics stop being variables and start becoming decisions.' },

      { type: 'h2', text: 'Quick gemstone guide' },
      { type: 'table', headers: ['Gemstone', 'Material relationship', 'Visual/design note'], rows: [
        ['Sapphire', 'Corundum', 'Broad colour range; evaluate actual colour and treatment'],
        ['Ruby', 'Red corundum', 'Colour central; inclusions and treatment can be important'],
        ['Emerald', 'Green beryl', 'Inclusions and enhancement require nuanced evaluation'],
        ['Spinel', 'Distinct mineral', 'Broad colour range; should not be treated merely as a substitute'],
        ['Tourmaline', 'Mineral group', 'Exceptionally broad colour range'],
        ['Aquamarine', 'Beryl variety', 'Blue to blue-green; often open, transparent visual character'],
        ['Garnet', 'Mineral group', 'Much broader colour range than traditional red stereotype'],
        ['Peridot', 'Olivine variety', 'Characteristic green range'],
        ['Amethyst', 'Quartz variety', 'Purple colour varies widely in tone and saturation'],
      ] },
      { type: 'note', label: 'Note', text: 'This table is an orientation guide, not a quality or durability ranking.' },

      { type: 'cta', heading: 'Choosing a coloured gemstone? Ask PHILEON.', text: 'Send us the gemstone, laboratory report, measurements or reference you\u2019re considering. We can help you think through colour, proportion, setting, metal and how the stone could influence the finished piece.', buttonLabel: 'ASK PHILEON' },

      { type: 'links', heading: 'Continue the PHILEON Journal', items: [
        { label: 'Choosing between lab-grown and natural diamonds', href: '/journal/lab-grown-vs-natural-diamonds' },
        { label: 'Understanding stone shapes', href: '/journal/engagement-ring-stone-shapes' },
        { label: 'Understanding setting styles', href: '/journal/jewelry-setting-styles' },
        { label: 'Understanding ring anatomy', href: '/journal/engagement-ring-anatomy' },
        { label: 'Choosing gold karat', href: '/journal/10k-vs-14k-vs-18k-gold' },
        { label: 'Understanding the bespoke process', href: '/journal/bespoke-jewelry-design-process' },
        { label: 'PHILEON Jewelry Care', href: '/jewelry-care' },
      ] },

      { type: 'links', heading: 'Explore PHILEON', items: [
        { label: 'Fine Jewelry', href: '/fine-jewelry' },
        { label: "Women's Rings", href: '/womens-rings' },
        { label: "Men's Rings", href: '/mens-rings' },
        { label: 'Statement Rings', href: '/statement-rings' },
        { label: 'Custom Jewelry', href: '/custom-jewelry-canada' },
      ] },
    ],
    faq: [
      { q: 'What is the best coloured gemstone for an engagement ring?', a: 'There is no universal best choice. Suitability depends on the actual gemstone, its condition and treatment, how the ring will be designed, and how the wearer expects to use it.' },
      { q: 'Is sapphire more durable than emerald?', a: 'They differ in several physical properties, but reducing durability to a single ranking can be misleading. Hardness, toughness, stability, inclusions, treatment, setting and wear all matter.' },
      { q: 'Are laboratory-grown sapphires and rubies real gemstones?', a: 'Laboratory-grown sapphire and ruby can have essentially the same material identity as their natural counterparts while having a different origin. They should be accurately disclosed as laboratory-grown.' },
      { q: 'Does a darker gemstone mean better quality?', a: 'No. Tone is only one part of colour. Hue, saturation, transparency, cutting, treatment, personal preference and the specific gem variety all affect the result.' },
      { q: 'Do all coloured gemstones need a certificate?', a: 'No. Whether an independent gemological report is warranted depends on the material, value, treatment or origin questions, transaction, and the level of documentation required.' },
    ],
  },
  {
    slug: 'engagement-ring-stone-shapes',
    title: 'Engagement Ring Stone Shapes Explained: Round, Oval, Pear, Emerald, Princess & More',
    seoTitle: 'Engagement Ring Stone Shapes Explained | PHILEON',
    seoDescription:
      'Compare round, oval, pear, marquise, emerald, princess, cushion, radiant and heart-shaped stones — including proportions, visual spread, settings and design considerations.',
    excerpt:
      'Round, oval, pear, marquise, emerald, princess, cushion, radiant and heart shapes all change the architecture of a ring. Learn how proportion, spread, setting and geometry work together.',
    heroImage: null,
    author: 'PHILEON Atelier',
    publishedAt: '2026-02-29',
    updatedAt: '2026-02-29',
    category: 'Stone Guide',
    tags: ['stone shapes', 'engagement rings', 'diamonds', 'bespoke'],
    relatedProductSlugs: ['drape', 'bajan-joe', 'quadriga-dominus'],
    body: [
      { type: 'p', text: 'The centre stone changes the ring before the metal is even drawn.' },
      { type: 'p', text: 'A round stone creates one kind of balance. An emerald cut introduces long architectural lines. A pear creates direction. A marquise stretches the composition. A cushion softens it. A princess introduces corners and geometry.' },
      { type: 'p', text: 'That outline influences the setting, shoulders, halo, side stones and even how the ring appears across the finger.' },
      { type: 'p', text: 'Choosing a stone shape is therefore not just choosing what the stone looks like. It is choosing the geometry the rest of the ring has to answer.' },

      // DIAGRAM 1 — Silhouette family
      { type: 'diagram', variant: 'silhouettes',
        title: 'The major stone shapes at a glance',
        groups: [
          { label: 'Curved', items: [
            { label: 'Round', shape: 'round' },
            { label: 'Oval', shape: 'oval' },
            { label: 'Pear', shape: 'pear' },
            { label: 'Marquise', shape: 'marquise' },
            { label: 'Cushion', shape: 'cushion' },
            { label: 'Heart', shape: 'heart' },
          ] },
          { label: 'Geometric', items: [
            { label: 'Emerald', shape: 'emerald' },
            { label: 'Princess', shape: 'princess' },
            { label: 'Radiant', shape: 'radiant' },
          ] },
        ],
        caption: 'Conceptual illustration — not to scale. The outline changes how the stone occupies space, but shape alone does not tell you carat weight, depth, cut quality or value. The Curved / Geometric grouping is visual, not gemological.',
      },

      { type: 'h2', text: 'Shape vs cut: what is the difference?' },
      { type: 'p', text: 'Shape describes the stone\u2019s face-up outline or general form. Cut quality describes how proportions, facet arrangement, symmetry, polish and optical performance have been executed within that shape.' },
      { type: 'ul', items: [
        'Round = shape · round brilliant = a common cutting style associated with that shape',
        'Emerald = an outline commonly associated with step-cut faceting',
        'Radiant = a shape combined with a brilliant-style facet approach',
      ] },
      { type: 'quote', text: 'A diamond can be oval in shape and still be well cut or poorly cut. Shape tells you the outline. It does not by itself tell you quality.' },

      { type: 'h2', text: 'Carat weight does not tell you face-up size' },
      { type: 'p', text: 'Carat measures weight, not width. Two stones of the same carat can have different length, width, depth, face-up area and proportions.' },
      { type: 'quote', text: 'A one-carat stone is not a standardized physical diameter across all shapes.' },

      { type: 'h2', text: 'Face-up spread' },
      { type: 'p', text: 'Face-up spread refers informally to how much visible surface area a stone occupies when viewed from above. Elongated shapes may create different visual coverage than compact shapes of similar weight, but spread depends on length, width, depth, proportions and stone shape together.' },
      { type: 'p', text: 'Visual spread is a relationship between carat weight and geometry, not a guarantee attached to a shape name.' },

      // DIAGRAM 2 — Same weight, different geometry
      { type: 'diagram', variant: 'silhouettes',
        title: 'Same weight does not mean same outline',
        groups: [
          { label: 'Same carat weight — conceptual', items: [
            { label: 'Compact', shape: 'compact' },
            { label: 'Elongated', shape: 'elongated' },
            { label: 'Deeper profile', shape: 'deep' },
          ] },
        ],
        caption: 'Conceptual illustration — not to scale. Carat is weight. Length, width and depth determine how that weight is distributed, which is why two stones with the same carat weight can look different from above.',
      },

      { type: 'h2', text: 'Round' },
      { type: 'p', text: 'Round stones create rotational symmetry and a balanced outline.' },
      { type: 'ul', items: [
        'Symmetrical from all directions',
        'Works with many setting styles',
        'Easy to centre visually',
        'Pairs naturally with straight or symmetrical shoulders',
        'Halos can follow the circular outline or deliberately contrast it',
      ] },
      { type: 'p', text: 'For diamonds, round brilliant is one of the most common faceting styles. That does not automatically make a round diamond more brilliant than every fancy shape.' },
      { type: 'note', label: 'Best suited to', text: 'Customers who want a visually balanced, highly adaptable centre-stone geometry.' },

      { type: 'h2', text: 'Oval' },
      { type: 'p', text: 'Oval stones elongate the round outline.' },
      { type: 'ul', items: [
        'Elongated face-up appearance',
        'Can visually extend along the finger',
        'Retains curved edges',
        'Works with prongs, bezels and halos',
        'Orientation is normally lengthwise but design can intentionally vary',
      ] },
      { type: 'p', text: 'Oval diamonds can display a bow-tie effect to varying degrees. Not every bow tie is a defect, and not every oval should have none.' },
      { type: 'quote', text: 'An oval is not simply a stretched round. Its proportions strongly affect its character.' },

      { type: 'h2', text: 'Pear' },
      { type: 'p', text: 'Pear shape combines a rounded end with a tapered point, creating directional asymmetry.' },
      { type: 'ul', items: [
        'Orientation matters',
        'The point may require deliberate protection',
        'Halo geometry must follow the directional form',
        'Shoulders may respond asymmetrically or symmetrically',
      ] },
      { type: 'p', text: 'The point can be protected by appropriate setting architecture such as a V-prong or bezel approach where suitable.' },
      { type: 'quote', text: 'A pear has a front and a direction. The ring has to decide what to do with both.' },

      { type: 'h2', text: 'Marquise' },
      { type: 'p', text: 'Marquise stones are elongated with pointed ends.' },
      { type: 'ul', items: [
        'Strong directional silhouette',
        'Long finger coverage',
        'Symmetrical lengthwise geometry',
        'Pointed tips require setting consideration',
      ] },
      { type: 'quote', text: 'The marquise creates extension. That length becomes part of the ring\u2019s architecture.' },

      { type: 'h2', text: 'Emerald cut' },
      { type: 'p', text: 'Emerald-cut stones typically use a rectangular or elongated outline, clipped corners and step-cut faceting.' },
      { type: 'ul', items: [
        'Broad flashes',
        'Geometric symmetry',
        'Visible internal architecture',
        'Less "crushed ice" appearance than many brilliant-style fancy shapes',
      ] },
      { type: 'quote', text: 'Emerald cut is less about hiding structure and more about revealing it.' },

      { type: 'h2', text: 'Princess' },
      { type: 'p', text: 'Princess-cut stones typically have a square or near-square outline, pointed corners and brilliant-style faceting.' },
      { type: 'ul', items: [
        'Corners influence prong and setting decisions',
        'Geometric outline works naturally with architectural rings',
        'Halo geometry may stay square or soften around the corners',
      ] },
      { type: 'p', text: 'The corners are part of the identity — and part of what the setting must account for.' },

      { type: 'h2', text: 'Cushion' },
      { type: 'p', text: 'Cushion-shaped stones generally combine square or rectangular overall proportions with rounded corners and a softer perimeter. Cushion facet patterns and proportions vary substantially.' },
      { type: 'quote', text: 'Cushion is a family of proportions rather than one exact outline.' },
      { type: 'p', text: 'Potential character: softer than princess, more structured than round, adaptable to vintage-inspired or contemporary architecture.' },

      { type: 'h2', text: 'Radiant' },
      { type: 'p', text: 'Radiant-cut stones often combine a rectangular or square outline with clipped corners and brilliant-style faceting, creating a geometric outline with a different optical character from an emerald cut.' },
      { type: 'quote', text: 'Radiant and emerald cuts can share a similar perimeter while behaving very differently visually.' },

      { type: 'h2', text: 'Heart' },
      { type: 'p', text: 'Heart-shaped stones have a cleft at the top, central symmetry and a pointed lower tip.' },
      { type: 'ul', items: [
        'Symmetry matters strongly',
        'Point protection',
        'Cleft definition',
        'Orientation',
        'Halo shape',
      ] },
      { type: 'quote', text: 'The symbolism is obvious. The geometry still has to work.' },

      { type: 'h2', text: 'Other shapes' },
      { type: 'p', text: 'Many additional shapes exist — asscher, trillion, kite, hexagonal, shield, portrait cuts and custom or fantasy cuts among them. The nine shapes in this guide are common starting points, not the limits of jewelry design.' },

      { type: 'h2', text: 'Asscher vs emerald' },
      { type: 'h3', text: 'Asscher' },
      { type: 'p', text: 'Generally square or near-square, cropped corners, step-cut visual character.' },
      { type: 'h3', text: 'Emerald' },
      { type: 'p', text: 'Generally rectangular, elongated step-cut architecture.' },

      { type: 'h2', text: 'Length-to-width ratio' },
      { type: 'p', text: 'Length-to-width ratio describes the relationship between a stone\u2019s length and width. It affects whether a stone feels compact, balanced or elongated, and is particularly relevant for oval, pear, marquise, emerald, radiant and cushion shapes.' },
      { type: 'quote', text: 'Ratio is a design preference within technical limits, not a universal beauty score.' },

      // DIAGRAM 3 — Length-to-width concept
      { type: 'diagram', variant: 'silhouettes',
        title: 'One shape can have several personalities',
        groups: [
          { label: 'The same shape at three ratios', items: [
            { label: 'Compact', shape: 'compact' },
            { label: 'Balanced', shape: 'balanced' },
            { label: 'Elongated', shape: 'elongated' },
          ] },
        ],
        caption: 'Conceptual illustration — not to scale. Changing length relative to width can significantly alter the character of the same stone shape. There is no single proportion that is automatically correct for every design.',
      },

      { type: 'h2', text: 'How stone shape changes finger coverage' },
      { type: 'p', text: 'Elongated stones can draw the eye vertically along the finger. Wider or compact shapes may create stronger lateral presence. But appearance depends on actual stone dimensions, halo, shoulders, side stones, finger proportions and ring scale.' },
      { type: 'p', text: 'This guide does not prescribe which shape "flatters" any particular hand.' },

      { type: 'h2', text: 'Shape and setting work together' },
      { type: 'ul', items: [
        'Round — prong, bezel, halo',
        'Pear — setting must respond to the point',
        'Princess — corners influence setting geometry',
        'Emerald — setting may emphasize long architectural lines',
      ] },
      { type: 'p', text: 'For a fuller discussion of setting families, see Jewelry Setting Styles Explained (/journal/jewelry-setting-styles).' },
      { type: 'quote', text: 'The setting should respond to the stone\u2019s geometry rather than forcing every shape into the same framework.' },

      { type: 'h2', text: 'Vulnerable points and corners' },
      { type: 'p', text: 'Certain stones — pear, marquise, princess, heart — have pointed corners or tips that deserve design consideration. Potential setting responses include V-prongs, protective prongs, bezels or structural surrounding metal.' },
      { type: 'quote', text: 'A point is not a defect. It is a structural feature that the setting must acknowledge.' },

      { type: 'h2', text: 'Shape and halo design' },
      { type: 'p', text: 'Halo geometry can mirror the centre-stone outline, soften it, exaggerate it, or create a contrasting outer form — round around round, cushion halo around round, geometric halo around emerald, asymmetric treatment around pear.' },
      { type: 'p', text: 'Halos are one option, not a requirement for any shape.' },

      { type: 'h2', text: 'Shape and side stones' },
      { type: 'p', text: 'Side stones can echo the centre shape, contrast it, extend width, create taper or introduce asymmetry — emerald centre with tapered baguettes, round centre with pears, oval centre with rounds, or unconventional combinations.' },

      { type: 'h2', text: 'Shape and ring anatomy' },
      { type: 'p', text: 'The centre-stone outline influences the head, basket, gallery, shoulder transition and overall width. Stone geometry propagates through the rest of the ring — see Engagement Ring Anatomy (/journal/engagement-ring-anatomy) for a full walkthrough.' },

      { type: 'h2', text: 'Shape and wedding-band pairing' },
      { type: 'p', text: 'A stone shape itself does not determine wedding-band fit. Head height, basket, halo, bridge and shoulder projection matter more than the outline of the centre stone.' },
      { type: 'p', text: 'See Wedding Band Pairing Guide (/journal/wedding-band-pairing-guide) for the full pairing framework.' },

      { type: 'h2', text: 'Shape and ring sizing' },
      { type: 'p', text: 'The stone shape does not change the finger measurement itself, but a large elongated or wide centre architecture can affect balance, rotation, perceived scale and overall wear experience.' },
      { type: 'p', text: 'Ring Sizing 101 (/journal/ring-sizing-guide) covers how width, temperature and knuckles affect fit.' },

      { type: 'h2', text: 'Natural vs lab-grown and shape availability' },
      { type: 'p', text: 'Both natural and lab-grown diamonds can be cut into many shapes. Availability and pricing can vary by shape, size, quality, current inventory and market conditions.' },
      { type: 'p', text: 'For the natural / lab-grown decision itself, see Lab-Grown vs Natural Diamonds (/journal/lab-grown-vs-natural-diamonds).' },

      { type: 'h2', text: 'Which shape gives the most sparkle?' },
      { type: 'p', text: 'Optical performance depends on facet design, proportions, symmetry, polish and material quality — not shape name alone. Brilliant-style cuts produce many small, numerous flashes; step cuts produce broader, more architectural flashes. Both are valid visual languages.' },

      { type: 'h2', text: 'Brilliant-style vs step-cut character' },
      { type: 'h3', text: 'Brilliant-style examples' },
      { type: 'p', text: 'Round brilliant, many ovals, pears, marquise, princess, radiant and many cushions.' },
      { type: 'h3', text: 'Step-cut examples' },
      { type: 'p', text: 'Emerald and asscher.' },
      { type: 'quote', text: 'Brilliant and step-cut styles organize light differently. The preference is visual, not simply numerical.' },

      { type: 'h2', text: 'Bow-tie effects' },
      { type: 'p', text: 'Some elongated brilliant-style shapes — commonly oval, pear and marquise — can show darker "bow-tie" areas across the centre. Visibility and severity vary from stone to stone.' },
      { type: 'quote', text: 'Judge the actual stone, not the shape category.' },

      { type: 'h2', text: 'Symmetry' },
      { type: 'p', text: 'Symmetry can matter visually, especially for pear, heart, oval, marquise and square or rectangular geometry.' },
      { type: 'p', text: 'This article is not a substitute for professional grading.' },

      { type: 'h2', text: 'Choosing shape from photographs' },
      { type: 'p', text: 'Online images can distort perception due to camera angle, focal length, magnification, cropping, lighting and screen scale. A photograph can show character. It cannot reliably tell you physical scale without dimensions.' },

      { type: 'h2', text: 'Choosing shape from dimensions' },
      { type: 'p', text: 'Actual length, width and depth measurements are more useful than carat alone when understanding scale. For bespoke design, useful inputs may include exact length, width, depth, shape and orientation.' },

      { type: 'h2', text: 'Should the stone shape match the wearer?' },
      { type: 'quote', text: 'The stone should match the design intent, not a rule about what a particular hand is "supposed" to wear.' },
      { type: 'p', text: 'Personal preference, ring architecture and intended visual character matter more than generic flattering rules. This guide does not use "short fingers should…" / "wide fingers should…" language.' },

      { type: 'h2', text: 'Choosing a shape for bespoke work' },
      { type: 'p', text: 'A bespoke project may start with a shape already loved, an existing stone, an emotional motif, an overall ring concept or a proportion rather than a shape name. Sometimes the stone drives the ring. Sometimes the ring concept determines the stone.' },
      { type: 'p', text: 'See The Bespoke Jewelry Design Process (/journal/bespoke-jewelry-design-process) and PHILEON Custom Jewelry (/custom-jewelry-canada) for how the design conversation typically develops.' },

      // DIAGRAM 4 — Shape → Ring architecture
      { type: 'diagram', variant: 'decisions',
        title: 'Change the shape, change the ring',
        center: 'STONE SHAPE',
        branches: [
          { label: 'Setting', items: ['Prong', 'Bezel', 'Halo', 'Other'] },
          { label: 'Profile', items: ['Low', 'Elevated', 'Sculptural'] },
          { label: 'Shoulders', items: ['Straight', 'Tapered', 'Split', 'Asymmetrical'] },
          { label: 'Side stones', items: ['None', 'Matching', 'Contrasting', 'Graduated'] },
          { label: 'Band relationship', items: ['Independent', 'Flush-capable', 'Contoured pairing', 'Custom relationship'] },
        ],
        caption: 'Conceptual illustration — not to scale. The stone shape does not determine every decision, but it changes the design problem every other part of the ring has to solve. These branches ultimately converge on the final ring architecture.',
      },

      { type: 'h2', text: 'How should you choose?' },
      { type: 'p', text: 'Instead of "what shape is best?", ask:' },
      { type: 'ul', items: [
        'Do I want symmetry or direction?',
        'Curved or geometric?',
        'Compact or elongated?',
        'Open brilliant character or architectural step-cut character?',
        'Minimal setting or metal-forward setting?',
        'Will the stone lead the design or integrate into a larger composition?',
      ] },
      { type: 'quote', text: 'Choose the stone that creates the right design problem for the ring you want to make.' },

      { type: 'h2', text: 'What does PHILEON recommend?' },
      { type: 'quote', text: 'Start with the outline, then design everything that has to answer it.' },
      { type: 'p', text: 'A stone should not be selected because a chart says it is the most flattering, or because one shape is currently fashionable.' },
      { type: 'p', text: 'Look at actual proportions, actual dimensions, facet character, setting, scale and the architecture that will surround it.' },
      { type: 'quote', text: 'The strongest choice is the one that gives the whole piece somewhere coherent to go.' },

      { type: 'h2', text: 'Quick shape guide' },
      { type: 'table', headers: ['Shape', 'Visual character', 'Key design consideration'], rows: [
        ['Round', 'Balanced / rotational', 'Highly adaptable geometry'],
        ['Oval', 'Elongated / curved', 'Proportion and bow-tie evaluation'],
        ['Pear', 'Directional / asymmetrical', 'Point protection and orientation'],
        ['Marquise', 'Long / pointed', 'Tip protection and proportion'],
        ['Emerald', 'Architectural / step-cut', 'Clarity of geometry and proportion'],
        ['Princess', 'Square / sharp', 'Corner protection'],
        ['Cushion', 'Soft geometric', 'Wide variation in proportions and faceting'],
        ['Radiant', 'Geometric / brilliant-style', 'Balance of outline and facet character'],
        ['Heart', 'Symbolic / directional', 'Symmetry, cleft and point geometry'],
      ] },
      { type: 'note', label: 'Note', text: 'These are design observations, not quality rankings.' },

      { type: 'cta', heading: 'Choosing a stone shape? Ask PHILEON.', text: 'Send us the shape, stone, certificate, dimensions or reference you\u2019re considering. We can help you think through proportion, setting, orientation and how that stone could influence the architecture of the finished piece.', buttonLabel: 'ASK PHILEON' },

      { type: 'links', heading: 'Continue the PHILEON Journal', items: [
        { label: 'Choosing between lab-grown and natural diamonds', href: '/journal/lab-grown-vs-natural-diamonds' },
        { label: 'Understanding setting styles', href: '/journal/jewelry-setting-styles' },
        { label: 'Understanding engagement-ring anatomy', href: '/journal/engagement-ring-anatomy' },
        { label: 'Finding the right ring size', href: '/journal/ring-sizing-guide' },
        { label: 'Pairing an engagement ring and wedding band', href: '/journal/wedding-band-pairing-guide' },
        { label: 'Understanding the bespoke process', href: '/journal/bespoke-jewelry-design-process' },
      ] },

      { type: 'links', heading: 'Explore PHILEON Rings', items: [
        { label: "Women's Rings", href: '/womens-rings' },
        { label: "Men's Rings", href: '/mens-rings' },
        { label: 'Statement Rings', href: '/statement-rings' },
        { label: 'Fine Jewelry', href: '/fine-jewelry' },
        { label: 'Custom Jewelry', href: '/custom-jewelry-canada' },
      ] },
    ],
    faq: [
      { q: 'Which diamond shape looks the largest?', a: 'There is no universal answer. Face-up appearance depends on the stone\u2019s actual length, width, depth and proportions, not just its shape or carat weight.' },
      { q: 'What is the most popular engagement-ring stone shape?', a: 'Popularity changes over time and by market. This guide does not recommend choosing a shape based on trend ranking; the better question is which geometry suits the design you want.' },
      { q: 'Are oval diamonds better than round diamonds?', a: 'No. They create different proportions and visual effects. Quality depends on the individual stone and how it is cut, graded, proportioned and set.' },
      { q: 'Are pointed shapes more fragile?', a: 'Points and corners can be more exposed than rounded edges and should be considered in the setting design, but the overall durability of a ring depends on the stone, setting, construction and wear.' },
      { q: 'Does carat weight tell me how big a diamond will look?', a: 'Not by itself. Carat measures weight. Face-up dimensions and proportions determine how much visual area the stone occupies.' },
    ],
  },
  {
    slug: 'bespoke-jewelry-design-process',
    title: 'The Bespoke Jewelry Design Process: From Idea to Finished Piece',
    seoTitle: 'Bespoke Jewelry Design Process: From Idea to Finished Piece | PHILEON',
    seoDescription:
      'See how a bespoke jewelry idea develops from initial conversation and design direction through stones, metal, sizing, CAD, refinement, production and final finishing.',
    excerpt:
      'From the first idea to metal, stones, fit, CAD, refinement and production, see how a bespoke piece develops into one resolved object.',
    heroImage: null,
    author: 'PHILEON Atelier',
    publishedAt: '2026-02-29',
    updatedAt: '2026-02-29',
    category: 'Bespoke Guide',
    tags: ['bespoke', 'custom jewelry', 'design process', 'CAD'],
    relatedProductSlugs: ['drape', 'bajan-joe', 'quadriga-dominus'],
    body: [
      { type: 'p', text: 'A bespoke piece rarely begins with a finished drawing. It begins with a reason.' },
      { type: 'p', text: 'It may start with a stone, a memory, an existing piece of jewelry, a reference image, a shape, a person, a phrase or simply the feeling that nothing already available is quite right.' },
      { type: 'p', text: 'From there, the work is not to copy the reference. The work is to determine what the piece should become.' },
      { type: 'p', text: 'Metal, stones, proportion, fit, setting, structure and finish all have to resolve into one object that can actually be worn. That is the difference between choosing options from a product page and developing a bespoke piece.' },
      { type: 'p', text: 'This guide explains how that process typically moves from first conversation to finished jewelry — and why the decisions before production matter just as much as the production itself.' },

      // DIAGRAM 1
      { type: 'diagram', variant: 'journey',
        title: 'The bespoke journey at a glance',
        steps: [
          'Conversation',
          'Design Direction',
          'Metal & Stone Decisions',
          'Size & Wear',
          'Technical Development / CAD',
          'Review & Refinement',
          'Approved Design',
          'Production',
          'Setting & Finishing',
          'Final Review & Delivery',
        ],
        caption: 'A typical bespoke project moves through these stages, but the exact path depends on the piece. Some decisions happen together, and complex designs may require additional technical development.',
      },

      { type: 'h2', text: 'It starts with the reason for the piece' },
      { type: 'p', text: 'The first useful question is not "what style do you want?" It is: why is this piece being made?' },
      { type: 'p', text: 'Possible starting points:' },
      { type: 'ul', items: [
        'Engagement', 'Wedding', 'Anniversary', 'Memorial or tribute', 'Milestone',
        'Heirloom', 'Redesign', 'Personal statement', 'Gift',
        'A stone already owned', 'A design idea that does not exist commercially',
      ] },
      { type: 'p', text: 'Purpose affects design choices. A daily-wear ring and an occasional sculptural piece may require different decisions even when the visual inspiration is similar.' },

      { type: 'h2', text: 'The first conversation' },
      { type: 'p', text: 'An initial bespoke conversation may establish:' },
      { type: 'ul', items: [
        'Type of piece', 'Intended wearer', 'Intended use', 'General design direction',
        'Preferred metal', 'Stone ideas', 'Approximate scale', 'Ring size where relevant',
        'Timing requirements where relevant', 'Budget context where the customer chooses to provide it',
      ] },
      { type: 'p', text: 'Not every customer needs to arrive with every field decided. Custom Jewelry (/custom-jewelry-canada) is where PHILEON begins that conversation.' },

      { type: 'h2', text: 'References are a starting point, not a tracing template' },
      { type: 'p', text: 'Customers may bring screenshots, existing jewelry, architecture, clothing, art, symbols, family pieces, gemstones, sketches or photographs.' },
      { type: 'quote', text: 'A reference should explain what is resonating — not become an instruction to copy another designer\u2019s work.' },
      { type: 'p', text: 'The useful discussion asks: is it the proportion, the shape, the movement, the metal texture, the stone arrangement, the colour, the era or the emotional association?' },

      { type: 'h2', text: 'Design direction comes before detail' },
      { type: 'p', text: 'Jumping immediately into prong shape, melee size, engraving or exact stone count can be premature if the main form is unresolved.' },
      { type: 'quote', text: 'Resolve the object first. Resolve the details inside the object second.' },
      { type: 'p', text: 'Design direction covers overall silhouette, scale, symmetry or asymmetry, visual weight, orientation and proportion.' },

      // DIAGRAM 2
      { type: 'diagram', variant: 'decisions',
        title: 'What actually shapes a bespoke piece?',
        center: 'BESPOKE PIECE',
        branches: [
          { label: 'Purpose', items: ['Everyday', 'Statement', 'Ceremonial', 'Heirloom', 'Gift'] },
          { label: 'Form', items: ['Ring', 'Pendant', 'Earrings', 'Bracelet / cuff', 'Other'] },
          { label: 'Material', items: ['Metal', 'Karat', 'Finish'] },
          { label: 'Stones', items: ['Type', 'Shape', 'Size', 'Colour', 'Origin where relevant'] },
          { label: 'Wear', items: ['Size / fit', 'Profile', 'Movement', 'Contact', 'Maintenance'] },
          { label: 'Structure', items: ['Setting', 'Gallery', 'Shank / body', 'Support', 'Construction'] },
        ],
        caption: 'These decisions influence one another. Changing the stone can change the setting. Changing the setting can change the profile. Changing the width can change the fit. Bespoke design is iterative because the object is a system.',
      },

      { type: 'h2', text: 'Choosing the metal' },
      { type: 'p', text: 'The decision may include gold karat, yellow / white / rose gold, platinum or other materials where appropriate, finish, surface texture and structural requirements.' },
      { type: 'p', text: 'See 10K vs 14K vs 18K Gold (/journal/10k-vs-14k-vs-18k-gold) for how karat itself changes the alloy.' },
      { type: 'quote', text: 'The highest karat is not automatically the correct choice. Metal should respond to the design and how it will be worn.' },

      { type: 'h2', text: 'Choosing the stones' },
      { type: 'p', text: 'Decisions may include natural vs lab-grown diamond, coloured gemstone, centre vs accent stones, shape, proportion, colour, clarity where relevant, stone availability and budget.' },
      { type: 'p', text: 'For the natural / lab-grown decision specifically, see Lab-Grown vs Natural Diamonds (/journal/lab-grown-vs-natural-diamonds). Stone availability depends on the market; a specific piece may require sourcing rather than pulling from inventory.' },

      { type: 'h2', text: 'Designing around an existing stone' },
      { type: 'p', text: 'When a client already owns a gemstone, the stone becomes a fixed technical input. The design must respond to its actual dimensions, shape, depth, condition, orientation, vulnerable corners or points and setting requirements.' },
      { type: 'quote', text: 'Carat weight alone is not enough information to design a setting. Actual stone dimensions matter.' },

      { type: 'h2', text: 'Selecting the setting' },
      { type: 'p', text: 'The setting is not chosen independently of the rest of the ring. Approaches include prong / claw, bezel, pavé, channel, flush, halo, shared-prong or combinations.' },
      { type: 'p', text: 'For deeper detail see Jewelry Setting Styles Explained (/journal/jewelry-setting-styles).' },
      { type: 'quote', text: 'The setting should belong to the stone and the object around it.' },

      { type: 'h2', text: 'Proportion is where the piece starts becoming real' },
      { type: 'p', text: 'Relationships to consider include centre stone to halo, head to shank, pendant to chain, earring size to movement, stone size to metal mass and shoulder width to centre architecture.' },
      { type: 'p', text: 'A technically possible arrangement is not automatically a resolved design.' },

      { type: 'h2', text: 'Size and fit are design inputs' },
      { type: 'p', text: 'For rings, size influences circumference, shank proportions, stone distribution, engraving, pavé layout and overall visual balance. Wide or sculptural designs may require fit consideration beyond the nominal number.' },
      { type: 'p', text: 'See Ring Sizing 101 (/journal/ring-sizing-guide) for how width, temperature and knuckles affect fit.' },

      { type: 'h2', text: 'Designing for how the piece will be worn' },
      { type: 'ul', items: [
        'Daily or occasional?',
        'High or low profile?',
        'Does it need to stack?',
        'Will a pendant move freely?',
        'Are earrings intended to sit close or move?',
        'Are surfaces likely to make frequent contact?',
      ] },
      { type: 'quote', text: 'Wearability is not something added after the design. It should influence the design from the beginning.' },

      { type: 'h2', text: 'When the design moves into technical development' },
      { type: 'p', text: 'Once the design direction is sufficiently resolved, it can move into technical development. This may involve measured drawings, CAD, stone-layout planning, construction planning, setting development and dimensional review.' },
      { type: 'p', text: 'Not every project uses identical software or workflow; the tools serve the design rather than dictate it.' },

      { type: 'h2', text: 'What CAD actually does' },
      { type: 'p', text: 'CAD can help define dimensions, geometry, stone positions, setting architecture, thickness relationships, internal clearances, overall volume and manufacturing-ready geometry.' },
      { type: 'quote', text: 'CAD is a tool for resolving the design. It is not the design itself.' },

      // DIAGRAM 3
      { type: 'diagram', variant: 'flow',
        title: 'CAD is one stage, not the beginning',
        steps: [
          { label: 'Reference / Idea', question: 'What matters?' },
          { label: 'Design Interpretation', question: 'What should the object become?' },
          { label: 'Proportion & Material Decisions', question: 'How should it work?' },
          { label: 'Technical Development / CAD', question: 'Can the geometry be resolved?' },
          { label: 'Review & Refinement', question: 'Does the design still do what it was meant to do?' },
          { label: 'Approved Design → Production' },
        ],
        caption: 'Starting in CAD before the concept is resolved can make an unresolved idea look deceptively finished. Technical precision does not replace design direction.',
      },

      { type: 'h2', text: 'A render is not the finished jewelry' },
      { type: 'p', text: 'A render uses digital lighting, digital metal and digital gemstones. The finished object exists in real metal, real stones, real weight, real light and real movement, on real screens or the real body — none of which behave the way a computer image does.' },
      { type: 'quote', text: 'A render is a communication tool. The finished object exists in metal, stone, weight, light and movement.' },

      { type: 'h2', text: 'Review and refinement' },
      { type: 'p', text: 'Review may address proportion, profile, stone orientation, setting character, width, fit, visual balance and technical feasibility. The appropriate number of rounds depends on the project and the agreed scope.' },
      { type: 'quote', text: 'Refinement should solve the piece, not endlessly redesign it.' },

      { type: 'h2', text: 'What happens when one decision changes?' },
      { type: 'p', text: 'A larger centre stone may affect head dimensions, prong placement, gallery, shoulder transition and overall ring balance. A wider shank may affect fit, weight, pavé layout and proportion. A different metal may affect colour, material behaviour and cost.' },
      { type: 'p', text: 'This is why bespoke design is treated as a system rather than a checklist.' },

      { type: 'h2', text: 'Approval means the design is ready to move forward' },
      { type: 'p', text: 'Approval should confirm the agreed design direction before production begins. Depending on project type, that may involve the final design representation, selected materials, confirmed stone direction, size and key specifications. The specifics of any commission belong to that commission\u2019s terms.' },

      { type: 'h2', text: 'Production' },
      { type: 'p', text: 'Production method depends on the piece and may involve different jewelry manufacturing techniques. PHILEON does not claim a single universal process for every piece — the approved design determines the appropriate production path.' },
      { type: 'p', text: 'Where public product data specifies a process for a particular piece, that specific information controls there rather than this general guide.' },

      { type: 'h2', text: 'Stone setting' },
      { type: 'p', text: 'Stone setting comes after the metal structure is appropriately prepared. Depending on the design, setting may include centre stones, side stones, halos, pavé, channels, flush-set accents or other structures.' },

      { type: 'h2', text: 'Finishing' },
      { type: 'p', text: 'Finishing stages may include polishing, satin or matte treatment, texture, engraving, cleaning and final surface refinement. Not every piece uses every finishing method.' },
      { type: 'quote', text: 'Finish changes how the same geometry is read.' },

      // DIAGRAM 4
      { type: 'diagram', variant: 'matrix',
        title: 'The finished piece is the intersection of eight decisions',
        items: ['Design', 'Proportion', 'Material', 'Stone', 'Setting', 'Fit', 'Wearability', 'Finish'],
        center: 'THE FINISHED OBJECT',
        caption: 'A bespoke piece succeeds when these decisions reinforce one another rather than competing for attention.',
      },

      { type: 'h2', text: 'Final review' },
      { type: 'p', text: 'A completed piece should be reviewed for the attributes relevant to that design — finish, stone security, visual alignment, size, construction and agreed specifications. This article does not describe any specific inspection or certification procedure.' },

      { type: 'h2', text: 'How long does bespoke jewelry take?' },
      { type: 'p', text: 'There is no universal bespoke timeline. Timing depends on design complexity, CAD development, client decisions, stone availability, sourcing, manufacturing complexity, setting, finishing and required revisions.' },
      { type: 'p', text: 'If a specific deadline matters, it should be discussed before production begins rather than treated as a guarantee afterwards.' },

      { type: 'h2', text: 'What affects bespoke pricing?' },
      { type: 'p', text: 'Pricing can depend on metal, metal weight, karat, stones, stone size and type, setting complexity, design complexity, production, finishing and customization.' },
      { type: 'quote', text: 'Two pieces of similar visual size can require very different amounts of material and work.' },

      { type: 'h2', text: 'Bespoke vs customization' },
      { type: 'h3', text: 'Customization' },
      { type: 'p', text: 'Modifies an existing design. Examples may include metal, finish, stone selection, size or limited details.' },
      { type: 'h3', text: 'Bespoke' },
      { type: 'p', text: 'Begins with a design problem or concept and develops the object around it.' },
      { type: 'quote', text: 'Customization changes an existing answer. Bespoke begins with the question.' },

      { type: 'h2', text: 'Redesigning existing jewelry' },
      { type: 'p', text: 'A bespoke project may begin with an existing piece — to reuse stones, preserve sentimental material, change style, improve wearability or create a new object from an old one.' },
      { type: 'quote', text: 'Sentimental value does not remove technical limits. Existing materials still have to be suitable for the new design.' },

      { type: 'h2', text: 'Heirloom pieces' },
      { type: 'p', text: 'An heirloom-focused design may prioritize longevity of visual language, repairability, material selection, stone security, symbolic meaning and documentation.' },
      { type: 'p', text: 'Heirloom intent influences design decisions; it does not make jewelry immune to wear. For related context on marks and provenance, see Jewelry Hallmarks & Stamps Explained (/journal/jewelry-hallmarks-stamps).' },

      { type: 'h2', text: 'What should you bring to a bespoke conversation?' },
      { type: 'ul', items: [
        'Reference images',
        'Intended piece type',
        'Metal preference',
        'Stones already owned',
        'Ring size if known',
        'Photos of existing jewelry if being redesigned',
        'Important symbols or details',
        'Intended use',
        'Timing requirement if one exists',
        'Budget context if the customer wishes to establish one',
      ] },
      { type: 'quote', text: 'You do not need to know the answer before starting the conversation.' },

      { type: 'h2', text: 'What if you only have an idea?' },
      { type: 'p', text: 'That is enough to begin. A useful bespoke conversation can begin with "I want something based on…", "I have this stone.", "I want to redesign this.", "I know how I want it to feel." or "I cannot find the ring I have in my head."' },

      { type: 'h2', text: 'What PHILEON protects during the process' },
      { type: 'p', text: 'The process should protect the reason for the piece, originality, proportion, wearability, structural logic, material honesty and customer intent.' },
      { type: 'quote', text: 'The goal is not to add more detail at every stage. The goal is to remove the decisions that do not belong.' },

      { type: 'h2', text: "PHILEON\u2019s bespoke philosophy" },
      { type: 'quote', text: 'Bespoke is not freedom from constraints. It is the ability to make the constraints belong to the piece.' },
      { type: 'p', text: 'The stone has dimensions. The finger has a size. The metal has properties. The object has to be worn.' },
      { type: 'p', text: 'Those realities do not restrict the design. They give the design something to answer.' },
      { type: 'p', text: 'PHILEON\u2019s role is to bring those decisions into one coherent object — one that could not have been reached by simply choosing from a list of options.' },

      { type: 'h2', text: 'Quick process guide' },
      { type: 'table', headers: ['Stage', 'Core question'], rows: [
        ['Conversation', 'Why is the piece being made?'],
        ['Design direction', 'What should the object become?'],
        ['Metal & stones', 'What materials belong to it?'],
        ['Fit / wear', 'How will it live on the body?'],
        ['Technical development', 'How should the geometry work?'],
        ['CAD / representation', 'Has the design been resolved clearly?'],
        ['Review', 'What still needs refinement?'],
        ['Approval', 'Is the design ready for production?'],
        ['Production', 'How is the approved object made?'],
        ['Setting & finishing', 'How is the final surface and stone work resolved?'],
        ['Final review', 'Does the completed piece match the agreed design?'],
      ] },
      { type: 'note', label: 'Note', text: 'The exact sequence can vary by project.' },

      { type: 'cta', heading: 'Have an idea? Start with PHILEON.', text: 'You do not need a finished drawing. Send us the idea, stone, reference or existing piece you want to build from. Tell us what matters about it, and we can start the design conversation from there.', buttonLabel: 'START A BESPOKE CONVERSATION' },

      { type: 'links', heading: 'Explore PHILEON Bespoke', items: [
        { label: 'PHILEON Custom Jewelry', href: '/custom-jewelry-canada' },
      ] },

      { type: 'links', heading: 'Continue the PHILEON Journal', items: [
        { label: 'Choosing your gold', href: '/journal/10k-vs-14k-vs-18k-gold' },
        { label: 'Choosing between lab-grown and natural diamonds', href: '/journal/lab-grown-vs-natural-diamonds' },
        { label: 'Finding the right ring size', href: '/journal/ring-sizing-guide' },
        { label: 'Understanding setting styles', href: '/journal/jewelry-setting-styles' },
        { label: 'Understanding ring anatomy', href: '/journal/engagement-ring-anatomy' },
        { label: 'Understanding jewelry hallmarks', href: '/journal/jewelry-hallmarks-stamps' },
        { label: 'Pairing an engagement ring and wedding band', href: '/journal/wedding-band-pairing-guide' },
      ] },

      { type: 'links', heading: 'Explore PHILEON', items: [
        { label: 'Custom Jewelry', href: '/custom-jewelry-canada' },
        { label: 'Fine Jewelry', href: '/fine-jewelry' },
        { label: "Men's Rings", href: '/mens-rings' },
        { label: "Women's Rings", href: '/womens-rings' },
        { label: 'Statement Rings', href: '/statement-rings' },
      ] },
    ],
    faq: [
      { q: 'Do I need a finished sketch before starting a bespoke jewelry project?', a: 'No. References, a stone, a general idea or even the purpose of the piece can be enough to begin a design conversation.' },
      { q: 'Does every bespoke piece require CAD?', a: 'Not necessarily. Technical development depends on the design and production method. CAD is common for complex modern jewelry, but it should support the design rather than define the process automatically.' },
      { q: 'Can I use stones from jewelry I already own?', a: 'Possibly. Existing stones need to be assessed for dimensions, condition and suitability before reuse can be confirmed.' },
      { q: 'How many revisions are included in bespoke design?', a: 'The appropriate review process depends on the project and the agreed scope. Do not assume unlimited revisions or a universal number without confirming the terms of that specific commission.' },
      { q: 'How long does bespoke jewelry take?', a: 'Timing depends on design complexity, approvals, stone availability, production and finishing. If a specific deadline matters, it should be discussed before production begins.' },
    ],
  },
  {
    slug: 'wedding-band-pairing-guide',
    title: 'Wedding Band Pairing: How to Match Your Engagement Ring',
    seoTitle: 'Wedding Band Pairing Guide: How to Match Your Engagement Ring | PHILEON',
    seoDescription:
      'Learn how to pair an engagement ring with a wedding band — from flush vs gapped fits to curved bands, metal matching, width, stone settings and custom-fit options.',
    excerpt:
      'Flush fit, intentional gap, curved band or custom contour — learn how profile, clearance, metal, width and setting determine whether two rings truly work together.',
    heroImage: null,
    author: 'PHILEON Atelier',
    publishedAt: '2026-02-29',
    updatedAt: '2026-02-29',
    category: 'Band Guide',
    tags: ['wedding bands', 'engagement rings', 'stacking', 'bespoke'],
    relatedProductSlugs: ['drape', 'bajan-joe', 'quadriga-dominus'],
    body: [
      { type: 'p', text: 'Two rings can look perfect separately and still fight each other on the hand.' },
      { type: 'p', text: 'A wedding band may sit flush beneath one engagement ring and leave a deliberate gap beside another. A straight band may disappear cleanly under a raised setting, while a low basket or projecting gallery may require a curved or open design.' },
      { type: 'p', text: 'The right pairing is not determined by matching metal alone. It comes from understanding how the two ring architectures meet.' },
      { type: 'p', text: 'A strong pairing should feel intentional from the top, side and inside — whether the goal is seamless stacking, visible separation or a completely custom relationship between the two pieces.' },

      { type: 'h2', text: 'What does "flush fit" mean?' },
      { type: 'p', text: 'A flush fit means the wedding band can sit directly beside the engagement ring with little or no visible gap between the two shanks.' },
      { type: 'p', text: 'Whether this is possible depends on:' },
      { type: 'ul', items: [
        'Head height',
        'Bridge clearance',
        'Gallery shape',
        'Protruding prongs',
        'Halo diameter',
        'Side stones',
        'Shoulder architecture',
      ] },
      { type: 'quote', text: 'Flush fit is an architectural outcome, not a quality ranking.' },

      { type: 'h2', text: 'Is a gap between rings a problem?' },
      { type: 'p', text: 'No.' },
      { type: 'p', text: 'A visible gap may be unavoidable because of the engagement-ring architecture, intentionally designed, visually desirable, or useful for allowing each ring to read independently.' },
      { type: 'quote', text: 'A gap can be part of the composition. It is not automatically a fit defect.' },

      { type: 'h2', text: 'Straight wedding bands' },
      { type: 'p', text: 'A straight band has a conventional continuous circular profile without a deliberate contour around the engagement ring.' },
      { type: 'h3', text: 'Best suited when' },
      { type: 'ul', items: [
        'Engagement ring has sufficient bridge clearance',
        'Setting sits high enough for the band to pass beneath',
        'Side architecture does not protrude into the band path',
      ] },
      { type: 'p', text: 'Effect: simple, architectural, independent and easy to wear separately. Straight bands do not always sit flush — that depends on the specific engagement-ring geometry.' },

      { type: 'h2', text: 'Curved or contoured wedding bands' },
      { type: 'p', text: 'A curved band changes its front profile so it can follow around the shape of the engagement-ring head or setting.' },
      { type: 'p', text: 'It may:' },
      { type: 'ul', items: [
        'Create closer visual contact',
        'Follow a halo',
        'Wrap around a low centre setting',
        'Accommodate projecting shoulders or side stones',
      ] },
      { type: 'quote', text: 'A contour should respond to the actual ring geometry, not to a generic engagement-ring outline.' },

      { type: 'h2', text: 'Open wedding bands' },
      { type: 'p', text: 'An open band leaves a deliberate gap or break at the front.' },
      { type: 'p', text: 'This can allow a centre setting to occupy the open space, unusual ring architecture to nest between the ends, or a more sculptural stacking relationship.' },
      { type: 'h3', text: 'Considerations' },
      { type: 'ul', items: [
        'Open ends must be proportioned carefully',
        'Alignment matters',
        'Rotation on the finger can affect appearance',
      ] },

      { type: 'h2', text: 'Shadow bands and fitted bands' },
      { type: 'p', text: 'A fitted or shadow band is designed specifically to follow the outline of an engagement ring. It may be curved, asymmetrical, notched, sculptural, stone-set or plain.' },
      { type: 'quote', text: 'The closer the fit, the more important it becomes to design the two rings as a system.' },
      { type: 'p', text: 'Not every fitted band can be worn attractively on its own.' },

      { type: 'h2', text: 'When a custom wedding band makes sense' },
      { type: 'p', text: 'Custom-fit design can make sense when the engagement ring has:' },
      { type: 'ul', items: [
        'A low basket',
        'An unusual halo',
        'An asymmetrical head',
        'Large side stones',
        'Sculptural shoulders',
        'Multi-finger or unconventional architecture',
        'Projecting gallery details',
      ] },
      { type: 'p', text: 'A custom band is not automatically necessary. It becomes useful when standard geometry cannot respond cleanly to the engagement ring. Our Custom Jewelry service (/custom-jewelry-canada) can help develop a band around an existing piece.' },

      { type: 'h2', text: 'Setting height changes the pairing' },
      { type: 'p', text: 'Higher centre settings may create more vertical clearance for a straight band. Lower settings may bring the stone or basket closer to the finger, leaving less space beside the shank.' },
      { type: 'ul', items: [
        'High profile does not guarantee flush fit',
        'Low profile does not automatically require a curved band',
        'Bridge and gallery geometry still matter',
      ] },
      { type: 'p', text: 'For a full anatomy walkthrough, see Engagement Ring Anatomy (/journal/engagement-ring-anatomy).' },

      { type: 'h2', text: 'The bridge matters' },
      { type: 'p', text: 'The bridge beneath the engagement-ring head is one of the most important pairing zones.' },
      { type: 'p', text: 'If the bridge is raised, recessed, narrow, projecting, decorated or stone-set, it can affect whether another ring can sit beside it.' },
      { type: 'quote', text: 'Wedding-band compatibility often depends on what happens under the centre stone, not what is visible from the top.' },

      { type: 'h2', text: 'Halos and wedding bands' },
      { type: 'p', text: 'Halo rings can create pairing challenges depending on halo diameter, underside height, gallery projection, the lower halo edge and shoulder width.' },
      { type: 'p', text: 'Possible solutions include a straight band with sufficient clearance, a curved band, a fitted band, or an intentional gap. Not all halo rings require a contoured band.' },

      { type: 'h2', text: 'Side-stone engagement rings' },
      { type: 'p', text: 'Side stones may extend the width of the engagement-ring head and influence how closely a wedding band can sit.' },
      { type: 'p', text: 'Potential issues include contact between stone settings, differing heights, visual crowding and asymmetric gaps.' },
      { type: 'quote', text: 'The more width the engagement ring occupies across the finger, the more important proportional balance becomes.' },

      { type: 'h2', text: 'Pavé and stone-set bands' },
      { type: 'p', text: 'A stone-set wedding band can visually connect to a pavé engagement ring, but matching stone coverage exactly is not always necessary.' },
      { type: 'p', text: 'Consider stone size, setting style, metal exposure, height, edge contact and shared visual rhythm. The rings do not need matching pavé to work.' },

      { type: 'h2', text: 'Plain wedding bands' },
      { type: 'p', text: 'A plain band can create contrast beside a highly detailed engagement ring.' },
      { type: 'ul', items: [
        'Visual rest',
        'Simpler maintenance',
        'Stronger metal presence',
        'Independent wear',
      ] },
      { type: 'quote', text: 'Contrast can make the engagement ring read more clearly rather than less cohesively.' },

      { type: 'h2', text: 'Matching metals' },
      { type: 'p', text: 'Using the same metal creates continuity — for example, 14K yellow with 14K yellow, or 18K white with 18K white.' },
      { type: 'p', text: 'But exact appearance can still differ because of alloy recipe, finish, age, wear or rhodium plating where applicable. Same karat does not always mean an exact colour match.' },
      { type: 'p', text: 'For karat-level differences, see 10K vs 14K vs 18K Gold (/journal/10k-vs-14k-vs-18k-gold).' },

      { type: 'h2', text: 'Mixing metals' },
      { type: 'p', text: 'Mixed-metal wedding sets can be intentional — a yellow-gold engagement ring with a white-gold band, a rose-gold band with a white-gold engagement ring, or a tri-colour stack.' },
      { type: 'p', text: 'Consider contrast, long-term finish and whether the rings are meant to read separately or as one composition. Mixed metal is a design decision, not a compromise.' },

      { type: 'h2', text: 'Does the karat need to match?' },
      { type: 'p', text: 'No, but understand the implications.' },
      { type: 'p', text: 'Different karats can differ in colour, hardness, wear behavior and material value. When rings rub together continuously, differences in hardness and surface finish may influence wear patterns.' },
      { type: 'quote', text: 'Matching karat simplifies material behavior, but it is not an absolute requirement for a successful pairing.' },

      { type: 'h2', text: 'Band width and proportion' },
      { type: 'p', text: 'Wedding-band width influences how the combined set reads.' },
      { type: 'h3', text: 'A narrow band can' },
      { type: 'ul', items: [
        'Keep the engagement ring visually dominant',
        'Add subtle definition',
      ] },
      { type: 'h3', text: 'A wider band can' },
      { type: 'ul', items: [
        'Create stronger visual balance',
        'Make the overall stack feel more substantial',
      ] },
      { type: 'p', text: 'Width should respond to the engagement ring, finger and intended visual weight rather than a universal millimetre rule.' },

      { type: 'h2', text: 'Matching widths vs contrasting widths' },
      { type: 'p', text: 'Matching band widths can create continuity. Contrasting widths can create intentional hierarchy — a narrow engagement shank with a wider wedding band, or a substantial engagement ring with a slim wedding band.' },
      { type: 'p', text: 'Symmetry is not automatically better.' },

      { type: 'h2', text: 'Ring profile and thickness' },
      { type: 'p', text: 'The side profile of both rings matters. Two rings may have similar visible width but very different thickness, edge shape, comfort profile or height off the finger.' },
      { type: 'p', text: 'These differences affect contact, movement and visual alignment. For related fit implications, see Ring Sizing 101 (/journal/ring-sizing-guide).' },

      { type: 'h2', text: 'Should the setting styles match?' },
      { type: 'p', text: 'Not necessarily. A pavé engagement ring can pair with a pavé band, a channel-set band, a plain metal band, a bezel-set band or another complementary architecture.' },
      { type: 'quote', text: 'The setting styles should relate, not necessarily repeat.' },
      { type: 'p', text: 'For deeper detail on setting families, see Jewelry Setting Styles Explained (/journal/jewelry-setting-styles).' },

      { type: 'h2', text: 'Matching stone shapes' },
      { type: 'p', text: 'A wedding band may use stones that match the engagement-ring centre shape, echo side stones, contrast deliberately, or use simple round melee regardless of centre shape. Matching cuts is not a requirement.' },

      { type: 'h2', text: 'Shared prong, channel and bezel-set wedding bands' },
      { type: 'h3', text: 'Shared prong' },
      { type: 'ul', items: [
        'Open gemstone line',
        'Minimal visible metal',
        'Continuous sparkle',
      ] },
      { type: 'h3', text: 'Channel' },
      { type: 'ul', items: [
        'Structured stone row',
        'Stronger metal boundaries',
        'Clean linear appearance',
      ] },
      { type: 'h3', text: 'Bezel' },
      { type: 'ul', items: [
        'Individual framed stones',
        'More visible metal',
        'Architectural rhythm',
      ] },
      { type: 'p', text: 'No setting family is universally more durable; the correct choice depends on the specific band, stones and daily wear.' },

      { type: 'h2', text: 'Eternity vs partial-eternity bands' },
      { type: 'h3', text: 'Full eternity' },
      { type: 'ul', items: [
        'Stones around the full circumference',
        'Continuous visual effect',
        'Resizing can be more limited or complex',
      ] },
      { type: 'h3', text: 'Partial eternity' },
      { type: 'ul', items: [
        'Stones across only part of the ring',
        'Leaves more plain metal',
        'May allow greater flexibility depending on design',
      ] },
      { type: 'p', text: 'Resizing feasibility belongs to the specific ring, not the eternity style alone.' },

      { type: 'h2', text: 'How the rings touch each other' },
      { type: 'p', text: 'When two rings sit together, their edges may contact during wear. Over time this can result in surface polishing, scratches, wear at contact points, or interaction with prongs or stone settings.' },
      { type: 'quote', text: 'Two rings worn together should be evaluated as moving metal objects, not static display pieces.' },

      { type: 'h2', text: 'Protecting exposed prongs and stones' },
      { type: 'p', text: 'If a wedding band presses directly against prongs, pavé edges, stone girdles or delicate gallery work, that contact deserves closer evaluation. The goal is to avoid designing constant hard contact into vulnerable areas where practical — the specific spacing depends on the rings involved.' },

      { type: 'h2', text: 'Wedding band + halo interaction' },
      { type: 'p', text: 'A halo can sometimes overhang the shank. A straight band may contact the halo underside, lower prongs, gallery or pavé edge.' },
      { type: 'p', text: 'A fitted contour may solve that, or an intentional gap may be preferable. No single solution is always right.' },

      { type: 'h2', text: 'What about asymmetrical engagement rings?' },
      { type: 'p', text: 'Asymmetrical heads or shoulder layouts often pair poorly with generic symmetrical contour bands.' },
      { type: 'p', text: 'Possible approaches include a custom asymmetrical band, a straight band with an intentional gap, an open band, or a visually independent band.' },
      { type: 'quote', text: 'The wedding band should respond to the actual composition, not force symmetry where the engagement ring does not have it.' },

      { type: 'h2', text: 'Stacking more than one wedding band' },
      { type: 'p', text: 'Some customers stack a wedding band with an anniversary band, two matching bands around an engagement ring, mixed-width bands or mixed-metal bands.' },
      { type: 'p', text: 'Consider total stack width, finger coverage, movement, spacing and visual hierarchy. There is no fixed maximum.' },

      { type: 'h2', text: 'Ring jackets and guards' },
      { type: 'p', text: 'Ring jackets or guards are structures designed to frame or surround an engagement ring. They may use two-sided bands, open centre space, decorative stone rows or sculptural framing.' },
      { type: 'p', text: 'They do not fit universally; a jacket should be matched to actual engagement-ring dimensions.' },

      { type: 'h2', text: 'Should the engagement ring and wedding band be designed together?' },
      { type: 'p', text: 'Sometimes that is ideal, but not mandatory.' },
      { type: 'h3', text: 'Benefits of designing together' },
      { type: 'ul', items: [
        'Flush-fit decisions can be made early',
        'Proportion can be controlled',
        'Curves can be coordinated',
        'Stone-setting relationships can be planned',
      ] },
      { type: 'p', text: 'That said, many existing engagement rings can still be paired successfully later.' },
      { type: 'quote', text: 'Designing the two together gives control. Designing the band later requires response. Both can work.' },

      { type: 'h2', text: 'Can you wear the wedding band alone?' },
      { type: 'p', text: 'Consider whether the band should function independently.' },
      { type: 'p', text: 'A strongly contoured band may look unusual alone. A straight or gently curved band may be easier to wear separately. Independent wearability is a preference, not a requirement.' },

      { type: 'h2', text: 'Which ring goes on first?' },
      { type: 'p', text: 'Many people traditionally wear the wedding band closer to the base of the finger, with the engagement ring above it. But personal, cultural and practical preferences vary.' },
      { type: 'quote', text: 'There is no PHILEON rule that requires one wearing order.' },

      { type: 'h2', text: 'When should you size the two rings together?' },
      { type: 'p', text: 'If two substantial rings will be worn together, combined width can change perceived fit. A wide stack may feel tighter than either ring alone.' },
      { type: 'p', text: 'There is no universal "size up" rule; fit should be evaluated for the stack you intend to wear, not only each ring in isolation. See Ring Sizing 101 (/journal/ring-sizing-guide) for how width, temperature and knuckles affect fit.' },

      { type: 'h2', text: 'What does PHILEON recommend?' },
      { type: 'quote', text: 'Pair the architecture, not just the metal.' },
      { type: 'p', text: 'The engagement ring and wedding band should relate through proportion, clearance, profile, movement, visual weight, setting, metal and fit.' },
      { type: 'p', text: 'A perfect colour match cannot fix two structures that collide. And a deliberate gap can be more successful than forcing two rings into an artificial flush fit.' },
      { type: 'quote', text: 'The right pairing is the one that makes the two rings feel intentional together.' },

      { type: 'h2', text: 'Quick pairing guide' },
      { type: 'table', headers: ['Engagement-ring situation', 'Wedding-band direction to consider'], rows: [
        ['Raised head with clear bridge', 'Straight band may fit flush'],
        ['Low basket / projecting gallery', 'Curved or fitted band may help'],
        ['Large halo', 'Contour, fitted band or intentional gap'],
        ['Wide side stones', 'Proportionally balanced or custom-fit band'],
        ['Pavé engagement ring', 'Pavé or contrasting plain band'],
        ['Asymmetrical ring', 'Custom asymmetrical, open or independent band'],
        ['Want band wearable alone', 'Straight or gently contoured design'],
        ['Wide combined stack', 'Evaluate sizing as a complete stack'],
      ] },
      { type: 'note', label: 'Note', text: 'These are design directions, not universal rules.' },

      { type: 'cta', heading: 'Need help pairing your rings? Ask PHILEON.', text: 'Send us your engagement ring, the PHILEON piece you\u2019re considering, or a clear reference image. We can help you think through flush fit, contour, width, metal, setting and overall proportion before you choose the band.', buttonLabel: 'ASK PHILEON' },

      { type: 'links', heading: 'Continue the PHILEON Journal', items: [
        { label: 'Understanding ring anatomy', href: '/journal/engagement-ring-anatomy' },
        { label: 'Understanding setting styles', href: '/journal/jewelry-setting-styles' },
        { label: 'Finding the right ring size', href: '/journal/ring-sizing-guide' },
        { label: 'Choosing gold karat', href: '/journal/10k-vs-14k-vs-18k-gold' },
      ] },

      { type: 'links', heading: 'Explore PHILEON Rings', items: [
        { label: "Men's Rings", href: '/mens-rings' },
        { label: "Women's Rings", href: '/womens-rings' },
        { label: 'Statement Rings', href: '/statement-rings' },
        { label: 'Fine Jewelry', href: '/fine-jewelry' },
        { label: 'Custom Jewelry', href: '/custom-jewelry-canada' },
      ] },
    ],
    faq: [
      { q: 'Does my wedding band need to sit flush with my engagement ring?', a: 'No. Some rings are designed to sit flush, while others naturally create a gap. Either can be intentional and visually successful.' },
      { q: 'Do the engagement ring and wedding band need to be the same metal?', a: 'No. Matching metals create continuity, while mixed metals create contrast. Consider colour, karat, finish and how the rings will wear together.' },
      { q: 'Should I size up when wearing two rings together?', a: 'Not automatically. A wider combined stack can feel tighter, but the correct size depends on the rings, finger and overall width. Evaluate the intended stack rather than using a universal size adjustment.' },
      { q: 'Can a straight wedding band fit with a halo engagement ring?', a: "Sometimes. It depends on the halo's underside, gallery, bridge and setting height. Some halo rings accept straight bands while others pair better with contoured or fitted bands." },
      { q: 'When is a custom wedding band worth it?', a: 'A custom band can be useful when the engagement ring has unusual geometry, low clearance, asymmetry, large side stones or architectural details that standard bands do not accommodate well.' },
    ],
  },
  {
    slug: 'jewelry-hallmarks-stamps',
    title: 'Jewelry Hallmarks & Stamps Explained: What Those Marks Actually Mean',
    seoTitle: 'Jewelry Hallmarks & Stamps Explained | PHILEON',
    seoDescription:
      'Learn what common jewelry stamps such as 10K, 14K, 18K, 417, 585 and 750 generally mean, how maker\u2019s marks differ from hallmarks, and why a stamp alone does not prove authenticity.',
    excerpt:
      'From 10K and 585 to maker\u2019s marks and assay stamps, learn what common jewelry marks can tell you — and why a stamp alone does not prove authenticity.',
    heroImage: null,
    author: 'PHILEON Atelier',
    publishedAt: '2026-02-29',
    updatedAt: '2026-02-29',
    category: 'Hallmark Guide',
    tags: ['hallmarks', 'jewelry stamps', 'gold', 'authentication'],
    relatedProductSlugs: ['drape', 'bajan-joe', 'quadriga-dominus'],
    body: [
      { type: 'p', text: 'The smallest detail on a piece of jewelry can carry some of its most important information.' },
      { type: 'p', text: 'Inside a ring, behind a pendant or near the clasp of a chain, you may find marks such as 10K, 14K, 18K, 417, 585 or 750.' },
      { type: 'p', text: 'You may also find letters, logos, assay symbols, date marks or other tiny stamps.' },
      { type: 'p', text: 'Some identify metal fineness. Some identify the maker or responsible business. Some belong to formal hallmarking systems. Others may be internal manufacturing marks with little meaning to the customer.' },
      { type: 'p', text: 'The important part is knowing what a mark can reasonably tell you — and what it cannot.' },

      { type: 'h2', text: 'What is a jewelry stamp?' },
      { type: 'p', text: 'A jewelry stamp is any mark applied to a piece that communicates information about the object.' },
      { type: 'p', text: 'It may indicate:' },
      { type: 'ul', items: [
        'Metal fineness',
        'Maker or manufacturer',
        'Sponsor or responsible party',
        'Assay office',
        'Date',
        'Location',
        'Patent or design information',
        'Internal manufacturing reference',
      ] },
      { type: 'quote', text: '"Stamp" is a broad term. "Hallmark" has a more specific meaning in many jurisdictions.' },

      { type: 'h2', text: 'What is a fineness mark?' },
      { type: 'p', text: 'A fineness mark identifies the claimed proportion of precious metal in an alloy.' },
      { type: 'p', text: 'For gold, common karat marks include 10K, 14K and 18K. Common millesimal fineness marks include 417, 585 and 750.' },
      { type: 'ul', items: [
        '417 corresponds approximately to 41.7% gold',
        '585 corresponds approximately to 58.5% gold',
        '750 corresponds to 75.0% gold',
      ] },
      { type: 'p', text: 'For a detailed comparison of the three most common karats, see 10K vs 14K vs 18K Gold (/journal/10k-vs-14k-vs-18k-gold).' },
      { type: 'p', text: 'The mark communicates a claim about the alloy — it does not, by itself, independently verify it.' },

      { type: 'h2', text: 'Why do some pieces say 585 instead of 14K?' },
      { type: 'p', text: 'Different markets commonly use different fineness conventions.' },
      { type: 'p', text: 'North American consumers often encounter karat marks such as 10K, 14K and 18K. Many international markets use millesimal fineness — 417, 585 and 750.' },
      { type: 'quote', text: 'These systems express the same underlying idea — precious-metal content — in different numerical formats.' },

      { type: 'h2', text: 'What do 417, 585 and 750 mean?' },
      { type: 'table', headers: ['Mark', 'Approximate gold content', 'Common equivalent'], rows: [
        ['417', '41.7%', '10K'],
        ['585', '58.5%', '14K'],
        ['750', '75.0%', '18K'],
      ] },
      { type: 'p', text: 'These are common equivalences. Actual legal tolerances, marking rules and permitted standards vary by jurisdiction, and nothing here should be read as legal advice.' },

      { type: 'h2', text: 'What is a hallmark?' },
      { type: 'p', text: 'In many jurisdictions, a hallmark refers to an official or formally recognized set of marks applied under a regulated precious-metal testing or assay system.' },
      { type: 'p', text: 'Depending on the country, a hallmark may identify:' },
      { type: 'ul', items: [
        'Fineness',
        'Assay office',
        'Sponsor or maker',
        'Date or year',
        'Other regulated information',
      ] },
      { type: 'quote', text: 'Not every purity stamp is a formal hallmark.' },
      { type: 'p', text: 'A piece stamped "14K" may carry a fineness mark without participating in a formal assay-office hallmarking system.' },

      { type: 'h2', text: 'Hallmark vs fineness mark' },
      { type: 'h3', text: 'Fineness mark' },
      { type: 'p', text: 'Typically communicates claimed precious-metal content. Examples: 10K, 14K, 18K, 585, 750.' },
      { type: 'h3', text: 'Hallmark' },
      { type: 'p', text: 'May refer to a broader regulated mark or set of marks associated with an official hallmarking system.' },
      { type: 'quote', text: 'A fineness mark tells you what the metal is claimed to be. A formal hallmark may also tell you who tested or takes responsibility for that claim, depending on the jurisdiction.' },

      { type: 'h2', text: "What is a maker's mark?" },
      { type: 'p', text: "A maker's mark identifies the maker, manufacturer, designer or responsible production entity where that system is used." },
      { type: 'p', text: 'It may be initials, letters, a symbol, a logo or a registered mark.' },
      { type: 'p', text: "A maker's mark identifies responsibility or origin within a marking system; it does not by itself tell you metal purity, and the specifics of any given mark should be confirmed against current production documentation rather than assumed." },

      { type: 'h2', text: "What is a sponsor's mark?" },
      { type: 'p', text: "In some hallmarking systems, the responsible party may be identified through a sponsor's mark rather than a literal bench jeweller's signature." },
      { type: 'p', text: 'That party may be the manufacturer, importer, retailer, designer or another registered business. One country\u2019s legal definition should not be generalized globally.' },

      { type: 'h2', text: 'Assay office marks' },
      { type: 'p', text: 'In formal hallmarking jurisdictions, an assay office may test precious-metal items and apply its own identifying mark. Different countries have different systems.' },
      { type: 'quote', text: 'An assay-office mark can indicate that the piece passed through a recognized testing system, but the exact meaning belongs to the legal system that issued it.' },

      { type: 'h2', text: 'Date letters and date marks' },
      { type: 'p', text: 'Some hallmarking systems have historically used date letters or symbols to indicate when a piece was hallmarked.' },
      { type: 'ul', items: [
        'Systems vary',
        'Date-letter cycles can repeat',
        'Not every jurisdiction uses them',
        'Not every piece carries one',
      ] },

      { type: 'h2', text: 'Why does my ring have several stamps?' },
      { type: 'p', text: 'Multiple marks can coexist because each may communicate a different piece of information — fineness, maker or sponsor, assay office, date, brand or manufacturing code.' },
      { type: 'quote', text: 'Several marks do not necessarily mean conflicting information. They may form a marking system.' },

      { type: 'h2', text: 'Can a stamp prove gold is real?' },
      { type: 'quote', text: 'A stamp is evidence of a claim, not absolute proof.' },
      { type: 'p', text: 'Stamps can be genuine, incorrect, worn, misread, added later or counterfeit.' },
      { type: 'p', text: 'Actual metal verification may require:' },
      { type: 'ul', items: [
        'Professional inspection',
        'Electronic testing',
        'Acid testing',
        'XRF analysis',
        'Other appropriate methods',
      ] },
      { type: 'note', label: 'Important', text: 'Metal testing should be performed by a qualified professional. This article does not provide DIY testing instructions.' },

      { type: 'h2', text: 'Can fake jewelry be stamped 14K or 18K?' },
      { type: 'p', text: 'Counterfeit or misrepresented jewelry can carry false marks.' },
      { type: 'p', text: 'Therefore:' },
      { type: 'ul', items: [
        'Buy from reputable sellers',
        'Obtain documentation where appropriate',
        'Have important pieces professionally evaluated if authenticity is uncertain',
      ] },

      { type: 'h2', text: 'What if there is no stamp?' },
      { type: 'p', text: 'A missing stamp does not automatically prove that a piece is not precious metal.' },
      { type: 'p', text: 'Possible reasons include:' },
      { type: 'ul', items: [
        'Age',
        'Wear',
        'Resizing',
        'Repair',
        'Handmade or small-production context',
        'Jurisdictional differences',
        'A mark located somewhere difficult to see',
      ] },
      { type: 'quote', text: 'No mark is not proof of fake metal, and a mark is not proof of genuine metal. Testing resolves uncertainty.' },

      { type: 'h2', text: 'Can resizing remove a hallmark?' },
      { type: 'p', text: 'Depending on where the marks are located, resizing can affect them. Resizing may involve cutting the lower shank, adding or removing metal, refinishing or polishing — and a mark in the sizing area could be altered as a result.' },
      { type: 'p', text: 'This does not happen every time. For how sizing works and where a sizing area is typically located, see Ring Sizing 101 (/journal/ring-sizing-guide).' },

      { type: 'h2', text: 'Can polishing make stamps harder to read?' },
      { type: 'p', text: 'Repeated polishing and refinishing can soften shallow marks over time. Other factors include general wear, abrasion, repair work and the original casting or finishing quality.' },
      { type: 'p', text: 'Polishing does not automatically destroy hallmarks, but it can reduce their crispness over the life of the piece.' },

      { type: 'h2', text: 'White gold, rose gold and yellow gold marks' },
      { type: 'p', text: 'The karat and fineness mark relate to gold purity, not necessarily colour.' },
      { type: 'p', text: 'A 14K yellow-gold piece and a 14K rose-gold piece can both carry a 14K or 585 fineness mark even though their alloying metals differ.' },
      { type: 'p', text: 'For how the karat itself changes the alloy, see 10K vs 14K vs 18K Gold (/journal/10k-vs-14k-vs-18k-gold).' },
      { type: 'quote', text: 'Karat tells you how much gold is present. It does not tell you the full alloy recipe.' },

      { type: 'h2', text: 'What about platinum stamps?' },
      { type: 'p', text: 'Platinum has its own fineness-marking conventions, often expressed in parts per thousand. Specific standards and legal requirements vary by market; any example should be treated as common rather than universal.' },

      { type: 'h2', text: 'What about sterling silver?' },
      { type: 'p', text: 'Sterling silver is commonly associated with the mark "925," which generally refers to 92.5% silver.' },
      { type: 'ul', items: [
        '925 is a fineness mark',
        'It is not automatically an official hallmark',
        'Jurisdictional requirements still vary',
      ] },

      { type: 'h2', text: 'What does GP, GEP or plated mean?' },
      { type: 'p', text: 'Common commercial abbreviations may indicate plated constructions. Terminology and legal labeling requirements can vary.' },
      { type: 'ul', items: [
        'GP — gold plated',
        'GEP — gold electroplated',
      ] },
      { type: 'quote', text: 'A plated mark describes a surface treatment or construction, not solid-gold purity.' },

      { type: 'h2', text: 'Gold-filled and rolled-gold marks' },
      { type: 'p', text: 'Gold-filled and rolled-gold products use mechanically bonded layers of gold alloy over a base metal. They are not the same construction as solid gold or ordinary thin electroplating.' },
      { type: 'p', text: 'The mark should be interpreted as a construction description, not as a solid-gold fineness claim.' },

      { type: 'h2', text: 'Vermeil marks' },
      { type: 'p', text: 'Vermeil generally refers to gold applied over sterling silver under defined standards that vary by jurisdiction.' },
      { type: 'quote', text: 'Vermeil is not solid gold; it is a precious-metal-over-silver construction.' },

      { type: 'h2', text: 'Are hallmarks the same worldwide?' },
      { type: 'p', text: 'No. Different countries can differ on:' },
      { type: 'ul', items: [
        'Mandatory vs voluntary marking',
        'Minimum fineness standards',
        'Tolerance rules',
        'Assay systems',
        'Sponsor registration',
        'Marking exemptions',
        'Terminology',
      ] },
      { type: 'quote', text: 'A hallmark should always be interpreted in the context of the jurisdiction that issued it.' },

      { type: 'h2', text: 'Canadian jewelry marks' },
      { type: 'p', text: 'PHILEON operates in Canada. Canadian precious-metal marking and advertising are governed by Canadian law, and specific compliance requirements can depend on how a piece is represented and sold.' },
      { type: 'p', text: 'This article does not summarize those statutory requirements and does not describe any PHILEON marking practice that is not documented in current production.' },

      { type: 'h2', text: 'US jewelry marks' },
      { type: 'p', text: 'US precious-metal marking practices differ from formal hallmarking systems used in some other countries. Not all US jewelry participates in assay-office marking, and the treatment above should not be read as legal advice for any specific market.' },

      { type: 'h2', text: 'UK and European hallmarking' },
      { type: 'p', text: 'Some European jurisdictions, including the UK, have long-established formal hallmarking systems. However, requirements vary substantially by country.' },
      { type: 'quote', text: 'European jewelry may carry more complex groups of marks than North American customers are accustomed to seeing.' },

      { type: 'h2', text: 'Vintage and antique jewelry' },
      { type: 'p', text: 'Older jewelry can require more careful interpretation because:' },
      { type: 'ul', items: [
        'Marks may use obsolete standards',
        'Maker registrations change',
        'Countries and assay systems change',
        'Repairs may alter marks',
        'Marks may be worn',
      ] },
      { type: 'quote', text: 'A vintage stamp should be researched in its historical context rather than interpreted only through modern conventions.' },

      { type: 'h2', text: 'Why placement varies' },
      { type: 'p', text: 'Marks may appear inside a ring shank, on a pendant bail, on the back of a pendant, on a bracelet clasp, on a chain tag, on an earring post or back, or on the underside of a setting.' },
      { type: 'p', text: 'Placement depends on design, available space, manufacturing process and legal or industry practice. No single placement is mandatory globally.' },

      { type: 'h2', text: 'Laser marks vs struck stamps' },
      { type: 'p', text: 'Marks may be applied through different techniques such as mechanical stamping, laser marking, casting-in or engraving. The application method does not automatically determine authenticity.' },
      { type: 'quote', text: 'How a mark was applied matters less than whether the mark is accurate and legitimately associated with the piece.' },

      { type: 'h2', text: 'What should you check when buying fine jewelry?' },
      { type: 'ul', items: [
        'A clear metal description from the seller',
        'Fineness or karat information',
        'Consistent invoice and product description',
        'Reputable seller identity',
        'Stone documentation where relevant',
        'Return and warranty information',
        'A hallmark or stamp where applicable',
        'Professional testing if material authenticity is uncertain',
      ] },
      { type: 'p', text: 'A stamp is helpful, but its absence is not automatically a red flag in every context.' },

      { type: 'h2', text: 'What should you ask PHILEON?' },
      { type: 'p', text: 'When evaluating a PHILEON piece or discussing a bespoke design, useful questions include:' },
      { type: 'ul', items: [
        'What metal and karat is specified?',
        'Is the piece solid gold, plated, vermeil or another construction?',
        'What stones are being used?',
        'What documentation accompanies the piece?',
        'What sizing or finishing considerations apply?',
      ] },

      { type: 'h2', text: "PHILEON\u2019s hallmark philosophy" },
      { type: 'quote', text: 'A mark should support the object, not substitute for trust in the object.' },
      { type: 'p', text: 'The karat, alloy, stones, construction and documentation should agree with one another. A stamp can be useful evidence — the piece itself, and the integrity of how it is represented, matters more.' },

      { type: 'h2', text: 'Quick mark guide' },
      { type: 'table', headers: ['Mark / term', 'Generally indicates'], rows: [
        ['10K', 'Approximately 41.7% gold'],
        ['14K', 'Approximately 58.5% gold'],
        ['18K', '75% gold'],
        ['417', 'Approximately 41.7% gold'],
        ['585', 'Approximately 58.5% gold'],
        ['750', '75% gold'],
        ['925', 'Sterling-silver fineness'],
        ["Maker's mark", 'Maker or responsible entity'],
        ['Assay mark', 'Assay office or formal testing system where applicable'],
        ['GP / plated', 'Gold-plated construction'],
      ] },
      { type: 'note', label: 'Note', text: 'Exact legal meaning and marking requirements vary by jurisdiction.' },

      { type: 'cta', heading: 'Have a question about a jewelry mark? Ask PHILEON.', text: 'If you\u2019re considering a PHILEON piece or trying to understand a stamp on a piece you already own, send us the mark and the context. We can help explain what the mark generally indicates and when professional metal testing may be the better next step.', buttonLabel: 'ASK PHILEON' },

      { type: 'links', heading: 'Continue the PHILEON Journal', items: [
        { label: 'Understanding gold karat', href: '/journal/10k-vs-14k-vs-18k-gold' },
        { label: 'Understanding engagement-ring anatomy', href: '/journal/engagement-ring-anatomy' },
        { label: 'Understanding setting styles', href: '/journal/jewelry-setting-styles' },
        { label: 'Finding the right ring fit', href: '/journal/ring-sizing-guide' },
      ] },

      { type: 'links', heading: 'Explore PHILEON Fine Jewelry', items: [
        { label: 'Fine Jewelry', href: '/fine-jewelry' },
        { label: "Men's Rings", href: '/mens-rings' },
        { label: "Women's Rings", href: '/womens-rings' },
        { label: 'Pendants', href: '/pendants' },
        { label: 'Custom Jewelry', href: '/custom-jewelry-canada' },
      ] },
    ],
    faq: [
      { q: 'Does 585 mean real gold?', a: '585 is a common fineness mark corresponding to approximately 58.5% gold, commonly associated with 14K. The presence of the mark is evidence of a claimed fineness, but professional testing may be required if authenticity is uncertain.' },
      { q: 'Is 750 the same as 18K?', a: 'Yes. 750 indicates 750 parts gold per thousand, equivalent to 75% gold, which corresponds to 18K.' },
      { q: 'Does every real gold ring have a stamp?', a: 'Not necessarily. Marking requirements and practices vary by jurisdiction, age and production context, and marks can also be lost during wear or repair.' },
      { q: 'Can a fake ring have a 14K stamp?', a: 'Yes. A false stamp can be applied to non-gold or lower-purity material. A stamp alone should not be treated as definitive proof.' },
      { q: "What is the difference between a hallmark and a maker's mark?", a: "A hallmark may be part of a formal precious-metal verification system, while a maker's or sponsor's mark identifies the responsible maker or business within the relevant system. Exact definitions vary by jurisdiction." },
    ],
  },
  {
    slug: 'engagement-ring-anatomy',
    title: 'Engagement Ring Anatomy: Every Part Explained',
    seoTitle: 'Engagement Ring Anatomy: Every Part Explained | PHILEON',
    seoDescription:
      'Learn the parts of an engagement ring — centre stone, setting, prongs, basket, gallery, shoulders, shank, halo and more — and how each element affects fit, profile, wear and design.',
    excerpt:
      'From the centre stone and setting to the basket, gallery, shoulders and shank, learn how every part of an engagement ring works together.',
    heroImage: null,
    author: 'PHILEON Atelier',
    publishedAt: '2026-02-29',
    updatedAt: '2026-02-29',
    category: 'Ring Guide',
    tags: ['engagement rings', 'ring anatomy', 'design', 'bespoke'],
    relatedProductSlugs: ['drape', 'bajan-joe', 'quadriga-dominus'],
    body: [
      { type: 'p', text: 'An engagement ring is read from the top, but it is engineered from every direction.' },
      { type: 'p', text: 'The centre stone may attract the eye first, but the structure beneath it determines how high it sits, how it is supported, how the ring balances on the finger and how the design transitions into the shank.' },
      { type: 'p', text: 'Prongs, baskets, galleries, shoulders and bands are not background details. They are part of the architecture.' },
      { type: 'p', text: 'Understanding those parts makes it easier to compare rings, discuss a bespoke design and recognize why two rings with similar stones can feel completely different on the hand.' },

      { type: 'h2', text: 'The centre stone' },
      { type: 'p', text: 'The centre stone is the primary focal gemstone in many engagement-ring designs. It may be a diamond, sapphire, ruby, emerald or another natural or lab-grown gemstone.' },
      { type: 'p', text: 'The centre stone influences:' },
      { type: 'ul', items: [
        'Setting type',
        'Head size',
        'Ring profile',
        'Visual balance',
        'Surrounding-stone proportions',
        'Protection requirements',
      ] },
      { type: 'p', text: 'Not every engagement ring requires a centre stone. Some designs deliberately use pavé fields, sculptural metalwork or clustered arrangements instead.' },
      { type: 'quote', text: 'The centre stone may lead the composition, but the ring still has to be designed around it.' },
      { type: 'p', text: 'For a full discussion of natural and lab-grown centre stones, see our companion guide on Lab-Grown vs Natural Diamonds (/journal/lab-grown-vs-natural-diamonds).' },

      { type: 'h2', text: 'The head' },
      { type: 'p', text: 'The head is the upper structural portion of the ring that supports and secures the centre stone or primary stone arrangement.' },
      { type: 'p', text: 'Depending on the design, the head may include:' },
      { type: 'ul', items: [
        'Prongs',
        'Basket',
        'Bezel',
        'Halo',
        'Under-gallery',
        'Supporting rails',
        'Accent stones',
      ] },
      { type: 'p', text: 'Not every jeweller uses the term "head" identically, but it generally refers to the stone-holding upper structure. Some rings use a discrete prefabricated head; others integrate the upper structure directly into the sculptural body.' },

      { type: 'h2', text: 'The setting' },
      { type: 'p', text: 'The setting is the system that physically secures the gemstone. Examples include prong / claw, bezel, pavé, channel, flush, shared-prong and halo-based arrangements.' },
      { type: 'quote', text: 'The setting is the connection between stone and structure.' },
      { type: 'p', text: 'For a deeper look at each setting family, see our Jewelry Setting Styles Explained guide (/journal/jewelry-setting-styles).' },

      { type: 'h2', text: 'Prongs and claws' },
      { type: 'p', text: 'Prongs are small metal projections that hold the stone in place. Claws are commonly a more tapered or pointed prong style.' },
      { type: 'p', text: 'Prongs influence:' },
      { type: 'ul', items: [
        'How much stone perimeter is exposed',
        'How much metal is visible',
        'The character of the setting',
        'Access for cleaning',
        'Maintenance needs',
      ] },
      { type: 'p', text: 'A well-designed prong should secure the stone without becoming the visual subject of the ring unless the design intentionally makes it one.' },

      { type: 'h2', text: 'The basket' },
      { type: 'p', text: 'A basket is a framework beneath and around the centre stone that connects the prongs or upper setting to the ring structure.' },
      { type: 'h3', text: 'Typical functions' },
      { type: 'ul', items: [
        'Supports the setting',
        'Positions the stone',
        'Links prongs together',
        'Helps control profile height',
        'Can contribute to lateral stability',
      ] },
      { type: 'p', text: 'A basket may be open, sculptural, minimal or highly structured. Basket geometry is a design decision — not every prong-set ring uses the same one.' },

      { type: 'h2', text: 'The gallery' },
      { type: 'p', text: 'The gallery is the visible side structure beneath the centre stone or head. It is often one of the most overlooked parts of a ring because it is seen from the side rather than the top.' },
      { type: 'p', text: 'The gallery may:' },
      { type: 'ul', items: [
        'Create open space beneath a stone',
        'Connect the head to the shoulders',
        'Carry decorative motifs',
        'Support accent stones',
        'Influence overall height and silhouette',
      ] },
      { type: 'quote', text: 'The gallery is where engineering often becomes design.' },

      { type: 'h2', text: 'The gallery rail' },
      { type: 'p', text: 'A gallery rail is a horizontal or perimeter support element that can connect prongs and help stabilize the upper setting. It can also create a visual line around the stone.' },
      { type: 'p', text: 'Not every basket or setting uses a gallery rail, and its presence alone is not a guarantee of security.' },

      { type: 'h2', text: 'The bridge' },
      { type: 'p', text: 'The bridge is the structural area beneath the head that spans or connects the upper setting to the shank. Terminology varies between ring styles.' },
      { type: 'p', text: 'It can:' },
      { type: 'ul', items: [
        'Support the centre structure',
        'Influence how low or high the ring sits',
        'Affect whether another band can sit flush beside the engagement ring',
      ] },
      { type: 'quote', text: 'The space beneath the centre stone often determines how the engagement ring interacts with a wedding band.' },
      { type: 'p', text: 'Flush stacking with a straight wedding band should be confirmed for the specific ring rather than assumed as a general outcome.' },

      { type: 'h2', text: 'The shoulders' },
      { type: 'p', text: 'The shoulders are the upper portions of the shank as they rise toward the head. They create the transition from the band into the focal area.' },
      { type: 'p', text: 'Shoulders may be plain, tapered, split, pavé-set, channel-set, engraved, sculptural or asymmetrical.' },
      { type: 'p', text: 'They influence:' },
      { type: 'ul', items: [
        'Visual width',
        'Structural transition',
        'Perceived head size',
        'How substantial the ring feels',
      ] },
      { type: 'quote', text: 'Shoulders control the transition between the ring you wear and the stone you see.' },

      { type: 'h2', text: 'Split shoulders and split shank' },
      { type: 'p', text: 'A split shank divides into two or more visible branches as it approaches the head.' },
      { type: 'p', text: 'This can:' },
      { type: 'ul', items: [
        'Increase visual width near the centre',
        'Create negative space',
        'Support a larger head visually',
        'Provide additional surfaces for stones or metal detailing',
      ] },
      { type: 'p', text: 'Split shanks are not automatically stronger. Strength depends on proportions and construction.' },

      { type: 'h2', text: 'The shank' },
      { type: 'p', text: 'The shank is the main circular or near-circular body of the ring that wraps around the finger. This is what most people casually call the "band."' },
      { type: 'p', text: 'The shank influences fit, weight, durability, resizing potential, comfort and overall visual scale. Shanks are not uniform — width, thickness and profile change from design to design.' },

      { type: 'h2', text: 'Shank width' },
      { type: 'p', text: 'Width refers to how broad the band appears across the finger.' },
      { type: 'h3', text: 'A wider shank can' },
      { type: 'ul', items: [
        'Feel more substantial',
        'Affect perceived fit',
        'Visually balance a larger head',
        'Provide more surface for engraving or stones',
      ] },
      { type: 'h3', text: 'A narrower shank can' },
      { type: 'ul', items: [
        'Make the centre appear more dominant',
        'Feel lighter visually',
        'Create a more delicate profile',
      ] },
      { type: 'p', text: 'Width interacts with fit; our Ring Sizing 101 guide (/journal/ring-sizing-guide) explains how wider bands can feel tighter than a narrow band at the same nominal size.' },

      { type: 'h2', text: 'Shank thickness' },
      { type: 'p', text: 'Thickness refers to the metal depth or cross-section rather than visual width. It contributes to structural mass, wear life, weight, comfort and resizing behavior.' },
      { type: 'quote', text: 'A ring can look substantial from above and still be underbuilt in cross-section. Visual width and structural thickness are not the same thing.' },

      { type: 'h2', text: 'Taper' },
      { type: 'p', text: 'A tapered shank changes width as it moves around the finger or approaches the head.' },
      { type: 'ul', items: [
        'It may widen toward the centre',
        'It may narrow toward the centre',
        'It may taper toward the bottom',
        'It may combine multiple transitions',
      ] },
      { type: 'p', text: 'Taper influences visual balance and comfort. No single taper direction is universally better; the right choice belongs to the design.' },

      { type: 'h2', text: 'Cathedral shoulders' },
      { type: 'p', text: 'Cathedral-style shoulders rise upward toward the centre stone, creating an elevated structural transition.' },
      { type: 'p', text: 'The visual effect can:' },
      { type: 'ul', items: [
        'Make the setting feel integrated into the band',
        'Create height',
        'Frame the centre stone from the side',
      ] },
      { type: 'quote', text: 'Cathedral describes the rising architecture, not a guarantee of durability.' },

      { type: 'h2', text: 'The halo' },
      { type: 'p', text: 'A halo is a border of smaller stones around the centre stone.' },
      { type: 'p', text: 'It can increase visual spread, introduce contrast, change the centre stone\u2019s apparent scale and create another layer of setting detail.' },
      { type: 'p', text: 'A halo can be round, geometric, cushion-shaped, floral, offset or double-layered. A halo changes visual scale — it does not change the physical carat weight of the centre stone.' },
      { type: 'p', text: 'See Jewelry Setting Styles Explained (/journal/jewelry-setting-styles) for how halo geometry interacts with pavé, shared prong and bezel techniques.' },

      { type: 'h2', text: 'Hidden halo' },
      { type: 'p', text: 'A hidden halo places small accent stones around the side or lower perimeter of the centre setting rather than forming a visible top-down halo. It is typically seen from oblique or side angles.' },
      { type: 'p', text: 'It can add detail without substantially changing the face-up outline. Hidden-halo constructions vary by design — they are not all structurally identical.' },

      { type: 'h2', text: 'Side stones' },
      { type: 'p', text: 'Side stones flank the centre stone. They may be matching, contrasting, tapered, geometric, graduated or asymmetrical.' },
      { type: 'p', text: 'Side stones influence visual width, centre-stone emphasis, overall proportion and setting complexity.' },
      { type: 'quote', text: 'In a well-balanced design, side stones are part of the composition rather than secondary decoration.' },

      { type: 'h2', text: 'Accent stones' },
      { type: 'p', text: 'Accent stones are smaller stones used throughout the ring to support the design. They may appear on the shoulders, shank, halo, basket, gallery, bridge or hidden details.' },
      { type: 'p', text: 'Accent stones can be pavé-set, channel-set, flush-set or secured by other methods. Not every small stone is pavé.' },

      { type: 'h2', text: 'The under-gallery' },
      { type: 'p', text: 'The under-gallery is the lower structure beneath the visible stone arrangement. It may be open, pierced, enclosed, decorative or highly structural.' },
      { type: 'p', text: 'Functions can include:' },
      { type: 'ul', items: [
        'Supporting the upper setting',
        'Creating space for the stone pavilion',
        'Reducing unnecessary mass',
        'Contributing to airflow and cleaning access',
        'Carrying visual detail',
      ] },
      { type: 'p', text: 'An open gallery is a design and cleaning consideration; it is not, by itself, a claim about brilliance.' },

      { type: 'h2', text: 'The pavilion clearance' },
      { type: 'p', text: 'The pavilion is the lower portion of many faceted gemstones. The ring must allow adequate space so the stone is seated correctly and not forced against underlying metal inappropriately.' },
      { type: 'quote', text: 'Stone depth must be accounted for in the structure beneath the setting.' },

      { type: 'h2', text: 'The seat' },
      { type: 'p', text: 'The seat is the precisely prepared area in the setting where the gemstone physically rests.' },
      { type: 'p', text: 'In prong setting, this may involve cuts or notches prepared to fit the stone. In bezel or other settings, the geometry differs. The seat must correspond to the actual stone and should be prepared by a trained setter — this is not a DIY process.' },

      { type: 'h2', text: 'The culet area' },
      { type: 'p', text: 'The culet is the lowest point or small facet at the bottom of some gemstone cuts. The setting should provide appropriate space beneath the pavilion and culet area.' },
      { type: 'p', text: 'Not all diamonds have a visibly faceted culet, and required clearance depends on the specific stone geometry.' },

      { type: 'h2', text: 'The inside of the shank' },
      { type: 'p', text: 'The interior surface affects comfort and fit. It may be flatter, rounded, comfort-fit or sculpted.' },
      { type: 'p', text: 'Internal profile can change how the same nominal size feels — see Ring Sizing 101 (/journal/ring-sizing-guide) for the fit implications.' },

      { type: 'h2', text: 'The sizing area' },
      { type: 'p', text: 'Many rings preserve a relatively plain section at the lower shank to make future sizing or maintenance more practical.' },
      { type: 'p', text: 'However, some rings use full pavé, continuous engraving, eternity stones or structural patterns, which can make resizing more complex. A sizing area is not present on every ring.' },

      { type: 'h2', text: 'The hallmark' },
      { type: 'p', text: 'A hallmark or quality mark can identify metal fineness or other legally relevant information depending on jurisdiction and manufacturing context. Fineness marks may include values such as 10K, 14K or 18K.' },
      { type: 'p', text: 'The exact legal meaning of a hallmark differs by country and system; a full guide to hallmarking may be covered separately in a future Journal article.' },
      { type: 'p', text: 'For karat differences alone, see 10K vs 14K vs 18K Gold (/journal/10k-vs-14k-vs-18k-gold).' },

      { type: 'h2', text: "The maker's mark" },
      { type: 'p', text: "A maker's mark identifies the manufacturer, designer, sponsor or responsible entity where used. The specifics of any given maker's mark should be confirmed against current production practice rather than assumed." },

      { type: 'h2', text: 'How the parts work together' },
      { type: 'quote', text: 'The quality of a ring cannot be judged by one part in isolation.' },
      { type: 'p', text: 'A beautiful centre stone can feel unstable if the setting is poorly proportioned. A strong shank can still feel uncomfortable if the interior profile is wrong. A technically secure setting can still feel visually heavy if the shoulders and gallery do not support the composition.' },
      { type: 'p', text: 'A refined engagement ring is an integration of:' },
      { type: 'ul', items: [
        'Stone',
        'Setting',
        'Head',
        'Gallery',
        'Shoulders',
        'Shank',
        'Proportions',
        'Fit',
        'Finish',
      ] },
      { type: 'p', text: 'The anatomy only works when the parts behave as one object.' },

      { type: 'h2', text: 'How ring anatomy affects daily wear' },
      { type: 'p', text: 'For daily wear, consider:' },
      { type: 'ul', items: [
        'Profile height',
        'Stone exposure',
        'Shank width',
        'Balance on the finger',
        'Prong projection',
        'Ease of cleaning',
        'Wedding-band compatibility',
        'Stone placement',
        'Resizing flexibility',
      ] },
      { type: 'quote', text: 'The ring should be designed for the life it is expected to live.' },

      { type: 'h2', text: 'How ring anatomy affects wedding-band fit' },
      { type: 'p', text: 'Whether a wedding band sits flush depends on head height, basket shape, bridge structure, protruding gallery elements, shank geometry and the wedding-band shape itself.' },
      { type: 'p', text: 'Some engagement rings are designed for a straight band to sit flush. Others intentionally require contour bands, curved bands, open bands or custom matching bands.' },
      { type: 'quote', text: 'A gap can be a design choice. Flush stacking is not automatically the better architecture.' },

      { type: 'h2', text: 'How ring anatomy affects resizing' },
      { type: 'p', text: 'Resizing is influenced by shank material, sizing area, pavé extent, channel settings, continuous engraving, side stones, structural geometry and the amount of size change required.' },
      { type: 'p', text: 'Resizing feasibility belongs to the specific ring. Our Ring Sizing 101 guide (/journal/ring-sizing-guide) covers how to think about fit before ordering.' },

      { type: 'h2', text: 'What does PHILEON look at first?' },
      { type: 'quote', text: 'The ring is designed from the object outward, not from a checklist inward.' },
      { type: 'p', text: 'PHILEON considers the centre stone, but also how the setting sits, how the gallery transitions, how the shoulders carry the composition, how the shank balances the weight and how the entire piece behaves on the hand.' },
      { type: 'p', text: 'The question is not: which head, which shank, which halo. The question is: what does this ring need to become one coherent object?' },

      { type: 'h2', text: 'Quick anatomy guide' },
      { type: 'table', headers: ['Part', 'Primary role'], rows: [
        ['Centre stone', 'Main focal gemstone'],
        ['Head', 'Upper stone-supporting structure'],
        ['Setting', 'Secures the gemstone'],
        ['Prongs / claws', 'Hold exposed stone edges'],
        ['Basket', 'Supports and positions the centre setting'],
        ['Gallery', 'Side structure beneath the centre'],
        ['Shoulders', 'Transition from shank to head'],
        ['Shank', 'Main ring body around the finger'],
        ['Halo', 'Border of smaller stones around centre'],
        ['Side stones', 'Flank and visually support centre stone'],
        ['Under-gallery', 'Structure beneath upper stone arrangement'],
        ['Bridge', 'Structural connection beneath head'],
        ['Sizing area', 'Lower-shank area that may permit adjustment'],
      ] },

      { type: 'cta', heading: 'Designing a ring? Ask PHILEON.', text: 'If you\u2019re comparing engagement-ring designs or planning a bespoke piece, send us the stone, reference or PHILEON piece you\u2019re considering. We can help you think through the architecture — from the centre setting to the gallery, shoulders, shank and overall fit.', buttonLabel: 'ASK PHILEON' },

      { type: 'links', heading: 'Continue the PHILEON Journal', items: [
        { label: 'Choosing the metal', href: '/journal/10k-vs-14k-vs-18k-gold' },
        { label: 'Choosing the diamond', href: '/journal/lab-grown-vs-natural-diamonds' },
        { label: 'Finding the right fit', href: '/journal/ring-sizing-guide' },
        { label: 'Understanding the setting', href: '/journal/jewelry-setting-styles' },
      ] },

      { type: 'links', heading: 'Explore PHILEON Rings', items: [
        { label: "Men's Rings", href: '/mens-rings' },
        { label: "Women's Rings", href: '/womens-rings' },
        { label: 'Statement Rings', href: '/statement-rings' },
        { label: 'Fine Jewelry', href: '/fine-jewelry' },
        { label: 'Custom Jewelry', href: '/custom-jewelry-canada' },
      ] },
    ],
    faq: [
      { q: 'What is the band of an engagement ring called?', a: 'The main portion that wraps around the finger is called the shank. "Band" is commonly used in everyday conversation, but shank is the more specific jewelry term.' },
      { q: 'What is the basket on an engagement ring?', a: 'The basket is the framework beneath and around the centre stone that supports the setting and connects it to the ring structure.' },
      { q: 'What is the difference between the gallery and the basket?', a: 'The terms sometimes overlap in trade usage. The basket generally refers to the supporting framework around the stone, while the gallery often describes the side-view structure beneath the head. Exact terminology can vary by design and jeweller.' },
      { q: 'What are the shoulders of a ring?', a: 'The shoulders are the upper portions of the shank as they transition toward the centre setting or head.' },
      { q: 'Why does the anatomy of a ring matter?', a: 'Because each part affects other parts. Setting height, shank width, shoulder design, gallery geometry and stone placement all influence appearance, fit, balance, maintenance and wear.' },
    ],
  },
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
