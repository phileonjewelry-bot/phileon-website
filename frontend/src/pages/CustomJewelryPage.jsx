import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  applySeoHead,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  generateSeo,
} from '@/lib/seo';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Custom Jewelry Canada / Toronto landing page.
//
// One canonical page consolidating overlapping custom-jewelry search intent:
//   • custom jewelry canada / toronto
//   • handmade/handcrafted jewelry canada
//   • custom rings / diamond jewelry / men's jewelry (Canada, Toronto)
//   • jewelry designer toronto / canada
//
// Craftsmanship terminology intentionally uses "hand-finished / bench-finished
// / made-to-order" — accurate for a CAD → cast → hand-set → bench-finished
// workflow. Owner should confirm before promoting any stronger claim like
// "100% handmade" or "Made in Canada" at product level.
// ─────────────────────────────────────────────────────────────────────────────

const TITLE = 'Custom Jewelry Canada | PHILEON Fine Jewelry';
const DESCRIPTION =
  'Custom fine jewelry from PHILEON — Canadian independent design, hand-set stones and made-to-order rings, pendants and statement pieces. Serving Toronto and shipping across Canada.';

export default function CustomJewelryPage() {
  useEffect(() => {
    const record = {
      slug: 'custom-jewelry-canada',
      name: 'Custom Jewelry',
      href: '/custom-jewelry-canada',
      type: 'category',
      description: DESCRIPTION,
      seo: { title: TITLE, description: DESCRIPTION },
    };
    const seo = generateSeo(record);
    return applySeoHead(seo, [
      buildOrganizationJsonLd(),
      buildBreadcrumbJsonLd(record),
    ]);
  }, []);

  return (
    <div style={styles.page} data-testid="custom-jewelry-page">
      <section style={styles.hero}>
        <p style={styles.eyebrow}>PHILEON · Custom Design</p>
        <h1 style={styles.h1} data-testid="custom-page-h1">Custom Jewelry Canada</h1>
        <p style={styles.lede}>
          Bespoke fine jewelry from an independent Canadian designer.
          Rings, pendants, sets and statement pieces designed, refined and finished for you.
        </p>
      </section>

      <section style={styles.processSection}>
        <div style={styles.narrow}>
          <p style={styles.eyebrowCenter}>The Process</p>
          <h2 style={styles.h2}>Design → CAD → Cast → Set → Finish</h2>
          {STEPS.map((s, i) => (
            <div key={s.title} style={styles.step} data-testid={`custom-step-${i}`}>
              <p style={styles.stepNum}>{String(i + 1).padStart(2, '0')}</p>
              <div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepBody}>{s.body}</p>
              </div>
            </div>
          ))}
          <p style={styles.footnote}>
            Every commission is quoted individually. Timeframes are confirmed once the concept,
            metal and stone selection are finalised — no fixed promise is made in advance.
          </p>
        </div>
      </section>

      <section style={styles.crossLinks}>
        <p style={styles.eyebrowCenter}>Explore</p>
        <div style={styles.crossRow}>
          <Link to="/black-owned-canadian-jewelry" style={styles.crossLink}>About PHILEON →</Link>
          <Link to="/fine-jewelry" style={styles.crossLink}>Fine Jewelry →</Link>
          <Link to="/mens-jewelry" style={styles.crossLink}>Men&apos;s Jewelry →</Link>
          <Link to="/ring-size-guide" style={styles.crossLink}>Ring Size Guide →</Link>
        </div>
      </section>
    </div>
  );
}

const STEPS = [
  {
    title: 'Concept',
    body:
      'Every commission opens with a private consultation. Reference imagery, silhouettes and stones are discussed. No obligation until the concept is agreed.',
  },
  {
    title: 'Design',
    body:
      'Sketches and precise geometry are developed. Proportions, band width, gallery height and stone-set architecture are finalised on paper first.',
  },
  {
    title: 'CAD',
    body:
      'Full three-dimensional CAD is produced for approval. Renderings are shared before any metal is cut so you see the finished proportions.',
  },
  {
    title: 'Stones',
    body:
      'Natural or lab-grown diamonds and coloured stones are selected against your approved specification. Only stones matching the design brief are used.',
  },
  {
    title: 'Cast + Set',
    body:
      'The piece is cast in solid gold and hand-set at the bench. Pavé, halo, tension and bezel setting are executed by hand where the design requires it.',
  },
  {
    title: 'Finish',
    body:
      'Bench-finished, hand-polished and quality-checked. Delivered in a PHILEON presentation box.',
  },
];

const rose = '#c48369';
const ink = '#f4e4dc';
const styles = {
  page: { background: '#0a0a0a', color: ink, fontFamily: "'Cormorant Garamond', Georgia, serif", paddingBottom: 96, minHeight: '100vh' },
  hero: { padding: '96px 24px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' },
  eyebrow: { letterSpacing: '0.32em', fontSize: 11, color: rose, textTransform: 'uppercase', margin: '0 0 14px' },
  eyebrowCenter: { letterSpacing: '0.32em', fontSize: 11, color: rose, textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' },
  h1: { fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 300, letterSpacing: '0.06em', margin: '0 0 24px' },
  h2: { fontSize: 'clamp(24px, 3.6vw, 34px)', fontWeight: 300, letterSpacing: '0.06em', margin: '0 0 40px', textAlign: 'center' },
  lede: { fontSize: 18, lineHeight: 1.7, color: 'rgba(244,228,220,0.85)', fontStyle: 'italic', maxWidth: 640, margin: '0 auto' },
  processSection: { padding: '56px 24px' },
  narrow: { maxWidth: 720, margin: '0 auto' },
  step: { display: 'grid', gridTemplateColumns: '60px 1fr', gap: 24, padding: '24px 0', borderTop: '1px solid rgba(196,131,105,0.12)' },
  stepNum: { letterSpacing: '0.22em', fontSize: 12, color: rose, margin: 0, paddingTop: 4 },
  stepTitle: { fontSize: 22, fontWeight: 400, margin: '0 0 8px', letterSpacing: '0.04em' },
  stepBody: { fontSize: 16, lineHeight: 1.7, color: 'rgba(244,228,220,0.8)', margin: 0 },
  footnote: { marginTop: 32, fontSize: 14, color: 'rgba(244,228,220,0.55)', fontStyle: 'italic', textAlign: 'center' },
  crossLinks: { padding: '48px 24px 96px', textAlign: 'center', borderTop: '1px solid rgba(196,131,105,0.12)' },
  crossRow: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 32, marginTop: 20 },
  crossLink: { color: rose, textDecoration: 'none', letterSpacing: '0.22em', fontSize: 12, textTransform: 'uppercase' },
};
