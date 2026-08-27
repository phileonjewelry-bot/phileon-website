import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  applySeoHead,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  generateSeo,
} from '@/lib/seo';
import { productsForSearchIntent } from '@/lib/discovery';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Black-Owned Canadian Jewelry brand-discovery page.
//
// One canonical landing page consolidating overlapping search intent:
//   • black-owned jewelry brand / business / canadian
//   • black jewelry designer
//   • canadian jewelry designer / brand / independent
//
// No thin duplicate keyword pages. Genuine editorial content anchored to
// PHILEON's confirmed brand facts. Featured pieces surface from the existing
// discovery classification — no separate curation to maintain.
// ─────────────────────────────────────────────────────────────────────────────

const TITLE = 'Black-Owned Canadian Fine Jewelry | PHILEON';
const DESCRIPTION =
  "PHILEON — a Black-owned, independent Canadian fine jewelry brand. Statement rings, luxury pendants and custom-designed pieces from an independent designer.";

export default function BlackOwnedJewelryPage() {
  const featuredMens = productsForSearchIntent('mens-jewelry').slice(0, 4);
  const featuredFine = productsForSearchIntent('fine-jewelry').slice(0, 4);

  useEffect(() => {
    const record = {
      slug: 'black-owned-canadian-jewelry',
      name: 'Black-Owned Canadian Jewelry',
      href: '/black-owned-canadian-jewelry',
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
    <div style={styles.page} data-testid="black-owned-canadian-jewelry-page">
      <section style={styles.hero}>
        <p style={styles.eyebrow}>PHILEON · Independent Design</p>
        <h1 style={styles.h1} data-testid="brand-page-h1">Black-Owned Canadian Jewelry</h1>
        <p style={styles.lede}>
          PHILEON is an independent Black-owned Canadian jewelry brand built around identity,
          proportion and statement design. From custom rings to sculptural pendants and fine
          jewelry, each piece is designed to carry its own presence.
        </p>
      </section>

      <section style={styles.body}>
        <div style={styles.narrow}>
          <p style={styles.eyebrowCenter}>The Brand</p>
          <h2 style={styles.h2}>Independent. Canadian. Designed with Intention.</h2>
          <p style={styles.copy}>
            PHILEON works in solid gold, natural and lab-grown diamonds and hand-set stones.
            Every piece is bench-finished, hand-set where the design calls for it, and produced
            through the atelier&apos;s design → CAD → cast → finish workflow.
          </p>
          <p style={styles.copy}>
            The design vocabulary moves between European architectural references and Caribbean
            cultural influence — carried into rings, pendants, earrings and custom commissions.
          </p>
        </div>
      </section>

      {featuredFine.length > 0 && (
        <section style={styles.grid} data-testid="brand-page-fine-grid">
          <p style={styles.eyebrowCenter}>Fine Jewelry</p>
          <div style={styles.cards}>
            {featuredFine.map((p) => (
              <Link key={p.slug} to={p.href || `/products/${p.slug}`} style={styles.card} data-testid={`brand-fine-${p.slug}`}>
                <div style={styles.cardMedia}>
                  {p.imageUrl && <img src={p.imageUrl} alt={`${p.name} — PHILEON fine jewelry`} style={styles.cardImg} loading="lazy" />}
                </div>
                <p style={styles.cardName}>{p.name}</p>
                <p style={styles.cardSub}>{p.materialLine || ''}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredMens.length > 0 && (
        <section style={styles.grid} data-testid="brand-page-mens-grid">
          <p style={styles.eyebrowCenter}>Men&apos;s Jewelry</p>
          <div style={styles.cards}>
            {featuredMens.map((p) => (
              <Link key={p.slug} to={p.href || `/products/${p.slug}`} style={styles.card} data-testid={`brand-mens-${p.slug}`}>
                <div style={styles.cardMedia}>
                  {p.imageUrl && <img src={p.imageUrl} alt={`${p.name} — PHILEON men's jewelry`} style={styles.cardImg} loading="lazy" />}
                </div>
                <p style={styles.cardName}>{p.name}</p>
                <p style={styles.cardSub}>{p.materialLine || ''}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={styles.crossLinks}>
        <p style={styles.eyebrowCenter}>Explore</p>
        <div style={styles.crossRow}>
          <Link to="/fine-jewelry" style={styles.crossLink}>Fine Jewelry →</Link>
          <Link to="/mens-jewelry" style={styles.crossLink}>Men&apos;s Jewelry →</Link>
          <Link to="/custom-jewelry-canada" style={styles.crossLink}>Custom Jewelry →</Link>
          <Link to="/statement-rings" style={styles.crossLink}>Statement Rings →</Link>
        </div>
      </section>
    </div>
  );
}

const rose = '#c48369';
const ink = '#f4e4dc';
const styles = {
  page: { background: '#0a0a0a', color: ink, fontFamily: "'Cormorant Garamond', Georgia, serif", paddingBottom: 96, minHeight: '100vh' },
  hero: { padding: '96px 24px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' },
  eyebrow: { letterSpacing: '0.32em', fontSize: 11, color: rose, textTransform: 'uppercase', margin: '0 0 14px' },
  eyebrowCenter: { letterSpacing: '0.32em', fontSize: 11, color: rose, textTransform: 'uppercase', margin: '0 0 14px', textAlign: 'center' },
  h1: { fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 300, letterSpacing: '0.06em', margin: '0 0 24px', lineHeight: 1.05 },
  h2: { fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 300, letterSpacing: '0.04em', margin: '0 0 24px', textAlign: 'center' },
  lede: { fontSize: 18, lineHeight: 1.7, color: 'rgba(244,228,220,0.85)', maxWidth: 680, margin: '0 auto', fontStyle: 'italic' },
  body: { padding: '56px 24px' },
  narrow: { maxWidth: 720, margin: '0 auto', textAlign: 'center' },
  copy: { fontSize: 17, lineHeight: 1.8, color: 'rgba(244,228,220,0.85)', margin: '0 0 20px' },
  grid: { padding: '32px 24px' },
  cards: { display: 'grid', gap: 24, maxWidth: 1160, margin: '20px auto 0', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' },
  card: { display: 'block', color: ink, textDecoration: 'none' },
  cardMedia: { width: '100%', aspectRatio: '1/1', background: '#050505', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardImg: { width: '100%', height: '100%', objectFit: 'contain' },
  cardName: { letterSpacing: '0.18em', fontSize: 13, margin: '16px 0 6px', textTransform: 'uppercase' },
  cardSub: { letterSpacing: '0.14em', fontSize: 11, color: 'rgba(244,228,220,0.55)', margin: 0, textTransform: 'uppercase' },
  crossLinks: { padding: '48px 24px 96px', textAlign: 'center', borderTop: '1px solid rgba(196,131,105,0.12)' },
  crossRow: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 32, marginTop: 20 },
  crossLink: { color: rose, textDecoration: 'none', letterSpacing: '0.22em', fontSize: 12, textTransform: 'uppercase' },
};
