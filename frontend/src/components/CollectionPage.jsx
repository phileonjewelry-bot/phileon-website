import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productsForSearchIntent, SEARCH_INTENTS } from '@/lib/discovery';
import {
  applySeoHead,
  buildBreadcrumbJsonLd,
  generateSeo,
} from '@/lib/seo';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Search-intent Collection Page
//
// One reusable component that renders any of the Phase-4 collection routes.
// Loads products for a given search intent from the discovery layer, applies
// full SEO (title, description, canonical, OG, Twitter, BreadcrumbList +
// CollectionPage / ItemList JSON-LD), and renders an editorial hero + product
// grid + adjacent-collection links. Commerce logic is untouched.
// ─────────────────────────────────────────────────────────────────────────────

const CROSS_LINKS = {
  'mens-rings': [
    { intent: 'mens-jewelry', label: "Men's Jewelry" },
    { intent: 'statement-rings', label: 'Statement Rings' },
    { intent: 'fine-jewelry', label: 'Fine Jewelry' },
  ],
  'womens-rings': [
    { intent: 'pendants', label: 'Pendants' },
    { intent: 'earrings', label: 'Earrings' },
    { intent: 'fine-jewelry', label: 'Fine Jewelry' },
  ],
  pendants: [
    { intent: 'earrings', label: 'Earrings' },
    { intent: 'fine-jewelry', label: 'Fine Jewelry' },
    { intent: 'gold-jewelry', label: 'Gold Jewelry' },
  ],
  earrings: [
    { intent: 'pendants', label: 'Pendants' },
    { intent: 'fine-jewelry', label: 'Fine Jewelry' },
  ],
  'fine-jewelry': [
    { intent: 'statement-rings', label: 'Statement Rings' },
    { intent: 'pendants', label: 'Pendants' },
    { intent: 'gold-jewelry', label: 'Gold Jewelry' },
  ],
  'mens-jewelry': [
    { intent: 'mens-rings', label: "Men's Rings" },
    { intent: 'statement-rings', label: 'Statement Rings' },
  ],
  'statement-rings': [
    { intent: 'mens-rings', label: "Men's Rings" },
    { intent: 'womens-rings', label: "Women's Rings" },
    { intent: 'fine-jewelry', label: 'Fine Jewelry' },
  ],
  'gold-jewelry': [
    { intent: 'fine-jewelry', label: 'Fine Jewelry' },
    { intent: 'statement-rings', label: 'Statement Rings' },
    { intent: 'pendants', label: 'Pendants' },
  ],
  'lab-grown-diamond-jewelry': [
    { intent: 'fine-jewelry', label: 'Fine Jewelry' },
    { intent: 'womens-rings', label: "Women's Rings" },
  ],
};

// SEO copy per intent — concise, PHILEON-voice, no keyword stuffing.
const COLLECTION_META = {
  'mens-rings': {
    h1: "Men's Rings",
    lede: "PHILEON men's rings are built around proportion, structure and presence. From architectural signets to diamond-heavy statement pieces, each design carries its own identity.",
    title: "Men's Rings | PHILEON Fine Jewelry",
    description: "PHILEON men's rings — architectural signets, diamond statement rings and designer men's jewelry in solid gold, black gold and white gold.",
  },
  'womens-rings': {
    h1: "Women's Rings",
    lede: "Diamond passages, tension-set architecture, ribbon and bow motifs — PHILEON women's rings translate structure and story into precious metal.",
    title: "Women's Rings | PHILEON Fine Jewelry",
    description: "PHILEON women's rings — diamond statement rings, engagement rings and architectural fine jewelry designs.",
  },
  pendants: {
    h1: 'Pendants',
    lede: 'From corset-inspired drape to sculptural monograms, PHILEON pendants translate garment and architecture into precious metal.',
    title: 'Pendants | PHILEON Fine Jewelry',
    description: 'PHILEON pendants — luxury diamond pendants, statement designs and editorial fine jewelry from the atelier.',
  },
  earrings: {
    h1: 'Earrings',
    lede: 'Architectural drops, sculpted studs and long silhouettes — PHILEON earrings carry motion and form.',
    title: 'Earrings | PHILEON Fine Jewelry',
    description: 'PHILEON earrings — sculptural drops, diamond studs and designer fine jewelry earrings.',
  },
  'fine-jewelry': {
    h1: 'Fine Jewelry',
    lede: 'Solid gold, natural and lab-grown diamonds, hand-set stones and made-to-order fabrication — PHILEON Fine Jewelry is the atelier line.',
    title: 'Fine Jewelry | Statement Rings & Pendants | PHILEON',
    description: 'PHILEON Fine Jewelry — architectural statement rings, luxury pendants, earrings and made-to-order pieces in solid gold and diamonds.',
  },
  'mens-jewelry': {
    h1: "Men's Jewelry",
    lede: "PHILEON men's jewelry — statement rings, signet architecture and diamond-set designs built for arrival.",
    title: "Men's Jewelry | Statement Rings & Signets | PHILEON",
    description: "PHILEON men's jewelry — statement rings, signet rings, black gold diamond rings and designer men's pieces from the atelier.",
  },
  'statement-rings': {
    h1: 'Statement Rings',
    lede: 'Every PHILEON ring is a statement ring. Architecture, weight, structure and stone-set drama — each design speaks first.',
    title: 'Statement Rings | Architectural Design | PHILEON',
    description: 'PHILEON statement rings — architectural men\'s and women\'s designs in solid gold with diamonds, rubies, peridot and hand-set stones.',
  },
  'gold-jewelry': {
    h1: 'Gold Jewelry',
    lede: 'Yellow gold, white gold, rose gold, black gold — PHILEON works in solid metals with hand-finished surfaces.',
    title: 'Gold Jewelry | Solid Gold Fine Jewelry | PHILEON',
    description: 'PHILEON gold jewelry — solid yellow, white, rose and black gold statement rings, pendants and fine jewelry.',
  },
  'lab-grown-diamond-jewelry': {
    h1: 'Lab-Grown Diamond Jewelry',
    lede: 'Lab-grown diamonds meet PHILEON architecture — same brilliance, chosen origin.',
    title: 'Lab-Grown Diamond Jewelry | PHILEON Fine Jewelry',
    description: 'PHILEON lab-grown diamond jewelry — statement rings, pendants and fine jewelry with certified lab-grown diamond stones.',
  },
};

export default function CollectionPage({ intent }) {
  const meta = COLLECTION_META[intent] || {
    h1: SEARCH_INTENTS[intent] || intent,
    lede: '',
    title: `${SEARCH_INTENTS[intent] || intent} | PHILEON`,
    description: `PHILEON ${(SEARCH_INTENTS[intent] || intent).toLowerCase()} collection.`,
  };

  const products = useMemo(() => productsForSearchIntent(intent), [intent]);
  const href = `/${intent}`;
  const canonicalName = SEARCH_INTENTS[intent] || meta.h1;

  useEffect(() => {
    const seoRecord = {
      slug: intent,
      name: canonicalName,
      href,
      category: intent,
      audience: [],
      type: 'category',
      description: meta.description,
      seo: { title: meta.title, description: meta.description },
    };
    const seo = generateSeo(seoRecord);
    // CollectionPage + ItemList JSON-LD
    const collectionLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: canonicalName,
      description: meta.description,
      url: seo.canonical,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.slice(0, 24).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://phileon.com${p.href || `/products/${p.slug}`}`,
          name: p.name,
        })),
      },
    };
    return applySeoHead(seo, [collectionLd, buildBreadcrumbJsonLd(seoRecord)]);
  }, [intent, products, href, canonicalName, meta.title, meta.description]);

  return (
    <div className="min-h-screen bg-black text-white" data-testid={`collection-${intent}`}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>PHILEON · Collection</p>
        <h1 style={styles.h1} data-testid="collection-h1">{meta.h1}</h1>
        <p style={styles.lede}>{meta.lede}</p>
      </section>

      <section style={styles.gridSection} data-testid="collection-grid">
        {products.length === 0 ? (
          <p style={styles.emptyState}>New pieces are being added to this collection.</p>
        ) : (
          <div style={styles.grid}>
            {products.map((p) => (
              <Link
                key={p.slug}
                to={p.href || `/products/${p.slug}`}
                style={styles.card}
                data-testid={`collection-card-${p.slug}`}
              >
                <div style={styles.cardMedia}>
                  {p.imageUrl && <img src={p.imageUrl} alt={`${p.name} — ${SEARCH_INTENTS[intent] || 'PHILEON'}`} style={styles.cardImg} loading="lazy" />}
                </div>
                <div style={styles.cardMeta}>
                  <p style={styles.cardName}>{p.name}</p>
                  <p style={styles.cardSub}>{p.materialLine || p.subtitle || ''}</p>
                  {p.price_range && <p style={styles.cardPrice}>{p.price_range}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section style={styles.crossLinks} data-testid="collection-cross-links">
        <p style={styles.eyebrow}>Explore</p>
        <div style={styles.crossRow}>
          {(CROSS_LINKS[intent] || []).map((c) => (
            <Link key={c.intent} to={`/${c.intent}`} style={styles.crossLink} data-testid={`cross-link-${c.intent}`}>
              {c.label} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

const rose = '#c48369';
const ink = '#f4e4dc';
const styles = {
  hero: { padding: '96px 24px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' },
  eyebrow: { letterSpacing: '0.32em', fontSize: 11, color: rose, textTransform: 'uppercase', margin: '0 0 14px' },
  h1: {
    fontSize: 'clamp(44px, 8vw, 88px)',
    fontWeight: 300,
    letterSpacing: '0.06em',
    margin: '0 0 24px',
    fontFamily: "'Cormorant Garamond', 'Cormorant', Georgia, serif",
  },
  lede: {
    fontSize: 17,
    lineHeight: 1.7,
    color: 'rgba(244,228,220,0.85)',
    maxWidth: 640,
    margin: '0 auto',
    fontFamily: "'Cormorant Garamond', 'Cormorant', Georgia, serif",
    fontStyle: 'italic',
  },
  gridSection: { padding: '32px 24px 80px' },
  grid: {
    display: 'grid',
    gap: 24,
    maxWidth: 1280,
    margin: '0 auto',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  },
  card: {
    display: 'block',
    background: '#0d0d0d',
    color: ink,
    textDecoration: 'none',
    border: '1px solid rgba(196,131,105,0.08)',
    transition: 'border-color 0.3s ease',
  },
  cardMedia: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: '#050505',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardImg: { width: '100%', height: '100%', objectFit: 'contain' },
  cardMeta: { padding: '20px 20px 24px' },
  cardName: {
    letterSpacing: '0.18em',
    fontSize: 14,
    margin: '0 0 8px',
    textTransform: 'uppercase',
    color: ink,
  },
  cardSub: {
    letterSpacing: '0.14em',
    fontSize: 11,
    color: 'rgba(244,228,220,0.55)',
    margin: '0 0 10px',
    textTransform: 'uppercase',
  },
  cardPrice: { letterSpacing: '0.16em', fontSize: 12, color: rose, margin: 0, textTransform: 'uppercase' },
  emptyState: { textAlign: 'center', color: 'rgba(244,228,220,0.55)', fontSize: 14, letterSpacing: '0.18em' },
  crossLinks: { padding: '48px 24px 96px', textAlign: 'center', borderTop: '1px solid rgba(196,131,105,0.12)' },
  crossRow: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 32,
    marginTop: 20,
  },
  crossLink: {
    color: rose,
    textDecoration: 'none',
    letterSpacing: '0.22em',
    fontSize: 12,
    textTransform: 'uppercase',
  },
};
