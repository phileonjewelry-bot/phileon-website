import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { applySeoHead, buildBreadcrumbJsonLd, generateSeo } from '@/lib/seo';
import { getTrustPage, listApprovedTrustPages } from '@/data/trustPages';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Trust page shell (Phase 8).
//
// One shared component drives /shipping /returns /warranty /jewelry-care
// /materials. Content + publication state live in /data/trustPages.js.
//
// Approved pages (Jewelry Care, Materials today) render full editorial
// content and are index,follow. Draft pages render structural sections with
// an internal "OWNER DECISION REQUIRED" marker so we can preview the layout
// before policy copy is signed off — those stay noindex,follow.
// ─────────────────────────────────────────────────────────────────────────────

export default function TrustPage() {
  const { pathname } = useLocation();
  const cfg = getTrustPage(pathname);

  useEffect(() => {
    if (!cfg) return undefined;
    const isApproved = cfg.status === 'approved';
    const record = {
      slug: cfg.slug,
      name: cfg.h1,
      href: pathname,
      type: 'category',
      description: cfg.description,
      seo: { title: cfg.title, description: cfg.description, index: isApproved, follow: true },
    };
    const seo = generateSeo(record);
    return applySeoHead(seo, [buildBreadcrumbJsonLd(record)]);
  }, [cfg, pathname]);

  if (!cfg) return null;

  const isDraft = cfg.status !== 'approved';
  const related = listApprovedTrustPages().filter((p) => p.path !== pathname).slice(0, 4);

  return (
    <div style={styles.page} data-testid={`trust-${cfg.slug}`}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>{cfg.eyebrow}</p>
        <h1 style={styles.h1} data-testid={`${cfg.slug}-h1`}>{cfg.h1}</h1>
        {cfg.intro && <p style={styles.lede}>{cfg.intro}</p>}
        {isDraft && (
          <p style={styles.draftBadge} data-testid={`${cfg.slug}-draft-badge`}>
            Draft · policy text pending owner approval
          </p>
        )}
      </section>

      <article style={styles.body}>
        {cfg.sections.map((section, si) => (
          <section
            key={section.title}
            style={styles.section}
            data-testid={`${cfg.slug}-section-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          >
            <h2 style={styles.h2}>{section.title}</h2>
            <div style={styles.blocks}>
              {section.blocks.map((block, bi) => (
                <TrustBlock key={`${si}-${bi}`} block={block} draft={isDraft} />
              ))}
            </div>
          </section>
        ))}
      </article>

      <section style={styles.crossLinks}>
        <p style={styles.eyebrowCenter}>Related</p>
        <div style={styles.crossRow}>
          {related.map((r) => (
            <Link key={r.path} to={r.path} style={styles.crossLink} data-testid={`trust-related-${r.slug}`}>
              {r.h1} →
            </Link>
          ))}
          <Link to="/contact" style={styles.crossLink} data-testid="trust-related-contact">Contact PHILEON →</Link>
        </div>
      </section>
    </div>
  );
}

function TrustBlock({ block, draft }) {
  if (block.kind === 'p') {
    return <p style={styles.p}>{block.text}</p>;
  }
  if (block.kind === 'ul') {
    return (
      <ul style={styles.ul}>
        {block.items.map((item, i) => (
          <li key={i} style={styles.li}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.kind === 'note') {
    return <p style={styles.note}>{block.text}</p>;
  }
  if (block.kind === 'owner') {
    // On approved pages, owner-required markers are hidden from the public
    // rendering (they're purely a content-authoring cue). On draft pages,
    // they render as a subtle internal placeholder so the owner can see
    // exactly which fields still need approved copy.
    if (!draft) return null;
    return (
      <p style={styles.owner} data-testid="trust-owner-required">
        <span style={styles.ownerTag}>Pending</span>
        <span style={styles.ownerLabel}>{block.label}</span>
      </p>
    );
  }
  return null;
}

const rose = '#c48369';
const ink = '#f4e4dc';
const styles = {
  page: {
    background: '#0a0a0a',
    color: ink,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    minHeight: '100vh',
    paddingBottom: 96,
  },
  hero: {
    padding: '96px 24px 40px',
    textAlign: 'center',
    maxWidth: 780,
    margin: '0 auto',
  },
  eyebrow: {
    letterSpacing: '0.32em',
    fontSize: 11,
    color: rose,
    textTransform: 'uppercase',
    margin: '0 0 14px',
  },
  eyebrowCenter: {
    letterSpacing: '0.32em',
    fontSize: 11,
    color: rose,
    textTransform: 'uppercase',
    margin: '0 0 14px',
    textAlign: 'center',
  },
  h1: {
    fontSize: 'clamp(40px, 7vw, 76px)',
    fontWeight: 300,
    letterSpacing: '0.06em',
    margin: '0 0 24px',
  },
  h2: {
    fontSize: 'clamp(22px, 3vw, 30px)',
    fontWeight: 300,
    letterSpacing: '0.06em',
    margin: '32px 0 16px',
  },
  lede: {
    fontSize: 17,
    lineHeight: 1.7,
    color: 'rgba(244,228,220,0.85)',
    fontStyle: 'italic',
  },
  draftBadge: {
    marginTop: 24,
    display: 'inline-block',
    letterSpacing: '0.24em',
    fontSize: 10,
    color: 'rgba(196,131,105,0.75)',
    textTransform: 'uppercase',
    padding: '6px 14px',
    border: '1px solid rgba(196,131,105,0.28)',
    borderRadius: 999,
  },
  body: {
    maxWidth: 780,
    margin: '0 auto',
    padding: '32px 24px',
  },
  section: {
    padding: '28px 0',
    borderTop: '1px solid rgba(196,131,105,0.10)',
  },
  blocks: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  p: {
    fontSize: 16,
    lineHeight: 1.75,
    color: 'rgba(244,228,220,0.88)',
    margin: 0,
  },
  ul: {
    margin: '4px 0',
    paddingLeft: 20,
  },
  li: {
    fontSize: 16,
    lineHeight: 1.75,
    color: 'rgba(244,228,220,0.88)',
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    lineHeight: 1.7,
    color: 'rgba(244,228,220,0.68)',
    background: 'rgba(196,131,105,0.05)',
    borderLeft: `2px solid ${rose}`,
    padding: '12px 16px',
    margin: '4px 0',
    fontStyle: 'italic',
  },
  owner: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    background: 'rgba(196,131,105,0.04)',
    border: '1px dashed rgba(196,131,105,0.22)',
    padding: '10px 14px',
    margin: 0,
  },
  ownerTag: {
    letterSpacing: '0.24em',
    fontSize: 10,
    color: rose,
    textTransform: 'uppercase',
  },
  ownerLabel: {
    fontSize: 14,
    lineHeight: 1.7,
    color: 'rgba(244,228,220,0.7)',
    fontStyle: 'italic',
  },
  crossLinks: {
    padding: '48px 24px 96px',
    textAlign: 'center',
    borderTop: '1px solid rgba(196,131,105,0.12)',
    marginTop: 32,
  },
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
    minHeight: 44,
    padding: '12px 4px',
    display: 'inline-flex',
    alignItems: 'center',
  },
};
