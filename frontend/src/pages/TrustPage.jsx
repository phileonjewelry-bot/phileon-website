import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { applySeoHead, buildBreadcrumbJsonLd, generateSeo } from '@/lib/seo';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Trust page shell (Phase 5).
//
// Structure is shipped; policy TEXT is owner-required. Placeholder sections
// render a clear "Owner content required" marker instead of invented policy.
// One shared component drives /shipping /returns /warranty /jewelry-care
// /materials so structure stays consistent when copy lands.
// ─────────────────────────────────────────────────────────────────────────────

const PAGES = {
  '/shipping': {
    slug: 'shipping', h1: 'Shipping', eyebrow: 'PHILEON · Delivery',
    title: 'Shipping | PHILEON Fine Jewelry',
    description: 'PHILEON shipping information — regions served, tracking, insurance and production vs transit times.',
    sections: ['Regions served', 'Production time vs transit time', 'Tracking & insurance', 'Signature on delivery', 'International customs & duties'],
  },
  '/returns': {
    slug: 'returns', h1: 'Returns', eyebrow: 'PHILEON · Returns Policy',
    title: 'Returns | PHILEON Fine Jewelry',
    description: 'PHILEON returns policy — stock pieces, made-to-order, customized, engraved and final-sale distinctions.',
    sections: ['Stock pieces', 'Made-to-order pieces', 'Customized & engraved pieces', 'Resized pieces', 'Final sale items'],
  },
  '/warranty': {
    slug: 'warranty', h1: 'Warranty', eyebrow: 'PHILEON · Guarantee',
    title: 'Warranty | PHILEON Fine Jewelry',
    description: 'PHILEON warranty coverage — manufacturing, stone-set integrity, plating and inspection guidance.',
    sections: ['Manufacturing defects', 'Stone-loss coverage', 'Wear & tear', 'Plating and blackened finishes', 'Resizing terms', 'Inspection requirements'],
  },
  '/jewelry-care': {
    slug: 'jewelry-care', h1: 'Jewelry Care', eyebrow: 'PHILEON · Atelier Notes',
    title: 'Jewelry Care | PHILEON Fine Jewelry',
    description: 'PHILEON jewelry care guidance — gold, sterling silver, diamonds, coloured stones, pavé, enamel, blackened finishes, storage and cleaning.',
    sections: ['Gold pieces', 'Sterling silver', 'Diamonds & coloured stones', 'Pavé & fine settings', 'Enamel and blackened finishes', 'Storage', 'Cleaning at home', 'Ultrasonic cleaner cautions'],
  },
  '/materials': {
    slug: 'materials', h1: 'Materials', eyebrow: 'PHILEON · Materials Reference',
    title: 'Materials | PHILEON Fine Jewelry',
    description: 'PHILEON materials reference — 10K / 14K / 18K gold, sterling silver, lab-grown and natural diamonds, coloured gemstones, enamel and plating.',
    sections: ['10K Gold', '14K Gold', '18K Gold', 'Sterling Silver', 'Lab-Grown Diamonds', 'Natural Diamonds', 'Coloured Gemstones', 'Enamel', 'Plating & Blackened Finishes'],
  },
};

export default function TrustPage() {
  const { pathname } = useLocation();
  const cfg = PAGES[pathname];

  useEffect(() => {
    if (!cfg) return undefined;
    const record = {
      slug: cfg.slug, name: cfg.h1, href: pathname,
      type: 'category', description: cfg.description,
      seo: { title: cfg.title, description: cfg.description, index: false, follow: true },
    };
    const seo = generateSeo(record);
    return applySeoHead(seo, [buildBreadcrumbJsonLd(record)]);
  }, [cfg, pathname]);

  if (!cfg) return null;

  return (
    <div style={styles.page} data-testid={`trust-${cfg.slug}`}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>{cfg.eyebrow}</p>
        <h1 style={styles.h1} data-testid={`${cfg.slug}-h1`}>{cfg.h1}</h1>
        <p style={styles.lede}>{cfg.description}</p>
      </section>

      <section style={styles.body}>
        {cfg.sections.map((s) => (
          <div key={s} style={styles.section} data-testid={`${cfg.slug}-section-${s.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>
            <h2 style={styles.h2}>{s}</h2>
            <div style={styles.pending}>
              <p style={styles.pendingLabel}>Owner content required</p>
              <p style={styles.pendingBody}>Approved PHILEON policy text pending for this section. Structure and SEO metadata are live so this page can accept copy without a code change.</p>
            </div>
          </div>
        ))}
      </section>

      <section style={styles.crossLinks}>
        <p style={styles.eyebrowCenter}>Explore</p>
        <div style={styles.crossRow}>
          <Link to="/black-owned-canadian-jewelry" style={styles.crossLink}>About PHILEON →</Link>
          <Link to="/custom-jewelry-canada" style={styles.crossLink}>Custom Jewelry →</Link>
          <Link to="/ring-size-guide" style={styles.crossLink}>Ring Size Guide →</Link>
        </div>
      </section>
    </div>
  );
}

const rose = '#c48369';
const ink = '#f4e4dc';
const styles = {
  page: { background: '#0a0a0a', color: ink, fontFamily: "'Cormorant Garamond', Georgia, serif", minHeight: '100vh', paddingBottom: 96 },
  hero: { padding: '96px 24px 40px', textAlign: 'center', maxWidth: 780, margin: '0 auto' },
  eyebrow: { letterSpacing: '0.32em', fontSize: 11, color: rose, textTransform: 'uppercase', margin: '0 0 14px' },
  eyebrowCenter: { letterSpacing: '0.32em', fontSize: 11, color: rose, textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' },
  h1: { fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 300, letterSpacing: '0.06em', margin: '0 0 24px' },
  h2: { fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 300, letterSpacing: '0.06em', margin: '32px 0 16px' },
  lede: { fontSize: 17, lineHeight: 1.7, color: 'rgba(244,228,220,0.85)', fontStyle: 'italic' },
  body: { maxWidth: 780, margin: '0 auto', padding: '32px 24px' },
  section: { padding: '20px 0', borderTop: '1px solid rgba(196,131,105,0.10)' },
  pending: { padding: '20px 24px', background: 'rgba(196,131,105,0.04)', border: '1px dashed rgba(196,131,105,0.22)' },
  pendingLabel: { letterSpacing: '0.24em', fontSize: 11, color: rose, textTransform: 'uppercase', margin: '0 0 8px' },
  pendingBody: { fontSize: 14, lineHeight: 1.7, color: 'rgba(244,228,220,0.65)', margin: 0, fontStyle: 'italic' },
  crossLinks: { padding: '48px 24px 96px', textAlign: 'center', borderTop: '1px solid rgba(196,131,105,0.12)' },
  crossRow: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 32, marginTop: 20 },
  crossLink: { color: rose, textDecoration: 'none', letterSpacing: '0.22em', fontSize: 12, textTransform: 'uppercase' },
};
