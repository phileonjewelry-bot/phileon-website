import { Link } from 'react-router-dom';
import { listApprovedTrustPages } from '@/data/trustPages';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Fine Jewelry Confidence block (Phase 8).
//
// Reusable compact editorial component intended for Fine Jewelry product
// pages and Atelier surfaces. It only surfaces trust destinations that are
// currently `status: 'approved'` in /data/trustPages.js — draft policy
// pages are never publicly promoted here.
//
// Restrained by design — small labels, no icons, no card-wall aesthetic.
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_TILES = [
  { key: 'ring-size', href: '/ring-size-guide', label: 'Ring Size Guide' },
  { key: 'custom', href: '/custom-jewelry-canada', label: 'Custom Assistance' },
  { key: 'contact', href: '/contact', label: 'Contact Concierge' },
];

const APPROVED_LABEL = {
  materials: 'Materials',
  'jewelry-care': 'Jewelry Care',
  shipping: 'Shipping',
  returns: 'Returns',
  warranty: 'Warranty',
};

export default function FineJewelryConfidence({ testId = 'fj-confidence' }) {
  const approved = listApprovedTrustPages()
    .map((p) => ({ key: p.slug, href: p.path, label: APPROVED_LABEL[p.slug] || p.h1 }));

  const tiles = [...approved, ...STATIC_TILES];

  return (
    <section
      style={styles.wrap}
      data-testid={testId}
      aria-label="PHILEON customer confidence"
    >
      <p style={styles.eyebrow}>PHILEON · Assurance</p>
      <ul style={styles.grid}>
        {tiles.map((tile) => (
          <li key={tile.key} style={styles.item}>
            <Link
              to={tile.href}
              style={styles.link}
              data-testid={`${testId}-${tile.key}`}
            >
              {tile.label}
              <span style={styles.arrow} aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const rose = '#c48369';
const styles = {
  wrap: {
    marginTop: 32,
    padding: '22px 24px',
    border: '1px solid rgba(196,131,105,0.14)',
    background: 'rgba(196,131,105,0.03)',
  },
  eyebrow: {
    letterSpacing: '0.32em',
    fontSize: 10,
    color: rose,
    textTransform: 'uppercase',
    margin: '0 0 14px',
  },
  grid: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '2px 24px',
  },
  item: {
    borderTop: '1px solid rgba(196,131,105,0.08)',
    padding: 0,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 4px',
    minHeight: 44,
    color: 'rgba(244,228,220,0.86)',
    textDecoration: 'none',
    letterSpacing: '0.14em',
    fontSize: 12,
    textTransform: 'uppercase',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  arrow: {
    color: rose,
    marginLeft: 12,
    letterSpacing: 0,
  },
};
