import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { journalArticles, getArticle } from '@/lib/journal';
import { applySeoHead, generateSeo, buildBreadcrumbJsonLd } from '@/lib/seo';
import ConciergeAgent from '@/components/ConciergeAgent';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Journal index + article routes (Phase 4 scaffold + Article #1).
//
// Renderer supports: p, h2, h3, ul, ol, table, note, quote, cta, links.
// Article JSON-LD + FAQPage JSON-LD are emitted per article when applicable.
// ─────────────────────────────────────────────────────────────────────────────

export function JournalIndexPage() {
  useEffect(() => {
    const record = {
      slug: 'journal', name: 'Journal', href: '/journal', type: 'category',
      seo: {
        title: 'Journal | PHILEON Guides & Editorial',
        description: 'PHILEON journal — atelier guides on gold, diamonds, ring sizing, custom process and craftsmanship. Editorial from the workshop.',
      },
    };
    const seo = generateSeo(record);
    return applySeoHead(seo, [buildBreadcrumbJsonLd(record)]);
  }, []);

  return (
    <div style={styles.page} data-testid="journal-index">
      <section style={styles.hero}>
        <p style={styles.eyebrow}>PHILEON · Journal</p>
        <h1 style={styles.h1}>The Journal</h1>
        <p style={styles.lede}>Atelier guides, material notes and process pieces. Written by the workshop.</p>
      </section>
      {journalArticles.length === 0 ? (
        <section style={styles.emptyState} data-testid="journal-empty">
          <p style={styles.emptyLabel}>Guides in production</p>
          <p style={styles.emptyCopy}>New guides on gold karats, lab-grown diamonds, ring sizing and setting styles are being authored in the atelier.</p>
        </section>
      ) : (
        <section style={styles.grid} data-testid="journal-grid">
          {journalArticles.map((a) => (
            <Link key={a.slug} to={`/journal/${a.slug}`} style={styles.card} data-testid={`journal-card-${a.slug}`}>
              {a.heroImage ? (
                <img src={a.heroImage} alt={a.title} style={styles.cardImg} loading="lazy" />
              ) : (
                <div style={styles.cardTypo} aria-hidden="true">
                  <p style={styles.cardTypoEyebrow}>{a.category || 'Journal'}</p>
                  <p style={styles.cardTypoMark}>PHILEON</p>
                </div>
              )}
              <div style={styles.cardBody}>
                <p style={styles.cardDate}>
                  {a.publishedAt}
                  {a.category ? <span style={styles.cardCat}> · {a.category}</span> : null}
                </p>
                <h2 style={styles.cardTitle}>{a.title}</h2>
                <p style={styles.cardExcerpt}>{a.excerpt}</p>
                <span style={styles.cardCta}>Read Article →</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

export function JournalArticlePage() {
  const { slug } = useParams();
  const article = getArticle(slug);
  const [conciergeOpen, setConciergeOpen] = useState(false);

  useEffect(() => {
    if (!article) return undefined;
    const record = {
      slug: article.slug,
      name: article.title,
      href: `/journal/${article.slug}`,
      type: 'category',
      description: article.seoDescription || article.excerpt,
      seo: {
        title: article.seoTitle || `${article.title} | PHILEON`,
        description: article.seoDescription || article.excerpt,
      },
    };
    const seo = generateSeo(record);
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      ...(article.heroImage ? { image: article.heroImage } : {}),
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: { '@type': 'Organization', name: article.author || 'PHILEON Atelier' },
      publisher: { '@type': 'Organization', name: 'PHILEON' },
      mainEntityOfPage: seo.canonical,
      url: seo.canonical,
    };
    const extras = [articleLd, buildBreadcrumbJsonLd(record)];
    if (Array.isArray(article.faq) && article.faq.length) {
      extras.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      });
    }
    return applySeoHead(seo, extras);
  }, [article]);

  if (!article) {
    return (
      <div style={styles.page} data-testid="journal-404">
        <section style={styles.emptyState}>
          <p style={styles.emptyLabel}>Article not found</p>
          <Link to="/journal" style={styles.backLink}>Back to Journal</Link>
        </section>
      </div>
    );
  }

  return (
    <article style={styles.page} data-testid={`journal-article-${article.slug}`}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>
          PHILEON JOURNAL{article.category ? ` · ${article.category.toUpperCase()}` : ''}
        </p>
        <h1 style={styles.h1}>{article.title}</h1>
        {article.excerpt && <p style={styles.lede}>{article.excerpt}</p>}
        <p style={styles.byline}>
          <span>{article.author || 'PHILEON Atelier'}</span>
          <span style={styles.bylineDot}>·</span>
          <time dateTime={article.publishedAt}>{article.publishedAt}</time>
        </p>
      </section>

      {article.heroImage && (
        <img src={article.heroImage} alt={article.title} style={styles.articleHero} loading="eager" />
      )}

      <section style={styles.body}>
        {(article.body || []).map((block, i) => {
          switch (block.type) {
            case 'h2':
              return <h2 key={i} style={styles.h2}>{block.text}</h2>;
            case 'h3':
              return <h3 key={i} style={styles.h3}>{block.text}</h3>;
            case 'quote':
              return <blockquote key={i} style={styles.quote}>{block.text}</blockquote>;
            case 'ul':
              return (
                <ul key={i} style={styles.ul}>
                  {block.items.map((t, j) => <li key={j} style={styles.li}>{t}</li>)}
                </ul>
              );
            case 'ol':
              return (
                <ol key={i} style={styles.ul}>
                  {block.items.map((t, j) => <li key={j} style={styles.li}>{t}</li>)}
                </ol>
              );
            case 'table':
              return (
                <div key={i} style={styles.tableWrap} role="region" aria-label="Comparison table" tabIndex={0}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {block.headers.map((h, j) => <th key={j} style={styles.th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, r) => (
                        <tr key={r}>
                          {row.map((c, ci) => <td key={ci} style={styles.td}>{c}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            case 'note':
              return (
                <p key={i} style={styles.note}>
                  <span style={styles.noteLabel}>{block.label}:</span> {block.text}
                </p>
              );
            case 'cta':
              return (
                <aside key={i} style={styles.cta} data-testid={`journal-cta-${article.slug}`}>
                  <h2 style={styles.ctaHeading}>{block.heading}</h2>
                  <p style={styles.ctaBody}>{block.text}</p>
                  <button
                    type="button"
                    onClick={() => setConciergeOpen(true)}
                    style={styles.ctaButton}
                    data-testid={`journal-concierge-open-${article.slug}`}
                  >
                    {block.buttonLabel || 'ASK PHILEON'} <span aria-hidden="true">→</span>
                  </button>
                </aside>
              );
            case 'links':
              return (
                <section key={i} style={styles.linkGrid} aria-labelledby={`links-h-${i}`}>
                  <h2 id={`links-h-${i}`} style={styles.linkGridHeading}>{block.heading}</h2>
                  <ul style={styles.linkList}>
                    {block.items.map((it, j) => (
                      <li key={j} style={styles.linkItem}>
                        <Link to={it.href} style={styles.linkAnchor} data-testid={`journal-link-${it.href.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')}`}>
                          {it.label} <span aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            default:
              return <p key={i} style={styles.p}>{block.text}</p>;
          }
        })}

        {Array.isArray(article.faq) && article.faq.length > 0 && (
          <section style={styles.faq} data-testid="journal-faq" aria-labelledby="faq-heading">
            <h2 id="faq-heading" style={styles.h2}>Frequently asked questions</h2>
            {article.faq.map((item, i) => (
              <div key={i} style={styles.faqItem}>
                <h3 style={styles.faqQ}>{item.q}</h3>
                <p style={styles.faqA}>{item.a}</p>
              </div>
            ))}
          </section>
        )}

        <p style={styles.backRow}>
          <Link to="/journal" style={styles.backLink} data-testid="journal-back">← Back to Journal</Link>
        </p>
      </section>

      <ConciergeAgent
        open={conciergeOpen}
        onClose={() => setConciergeOpen(false)}
        source={`journal:${article.slug}`}
        bespoke={false}
      />
    </article>
  );
}

const rose = '#c48369';
const ink = '#f4e4dc';
const styles = {
  page: {
    background: '#0a0a0a',
    color: ink,
    minHeight: '100vh',
    fontFamily: "'Cormorant Garamond', 'Cormorant', Georgia, serif",
    paddingBottom: 96,
  },
  hero: { padding: '96px 24px 40px', textAlign: 'center', maxWidth: 780, margin: '0 auto' },
  eyebrow: { letterSpacing: '0.32em', fontSize: 11, color: rose, textTransform: 'uppercase', margin: '0 0 14px' },
  h1: { fontSize: 'clamp(38px, 7vw, 74px)', fontWeight: 300, letterSpacing: '0.04em', margin: '0 0 24px', lineHeight: 1.05 },
  h2: { fontSize: 'clamp(22px, 3.4vw, 30px)', fontWeight: 400, letterSpacing: '0.03em', margin: '56px 0 14px' },
  h3: { fontSize: 'clamp(18px, 2.4vw, 22px)', fontWeight: 500, letterSpacing: '0.02em', margin: '28px 0 10px', color: 'rgba(244,228,220,0.95)' },
  lede: { fontSize: 17, lineHeight: 1.7, color: 'rgba(244,228,220,0.85)', fontStyle: 'italic' },
  byline: { fontSize: 12, letterSpacing: '0.22em', color: 'rgba(244,228,220,0.55)', textTransform: 'uppercase', marginTop: 22 },
  bylineDot: { margin: '0 10px', color: rose },
  body: { maxWidth: 720, margin: '0 auto', padding: '32px 24px' },
  p: { fontSize: 17, lineHeight: 1.85, color: 'rgba(244,228,220,0.88)', margin: '0 0 20px' },
  ul: { paddingLeft: 22, margin: '0 0 24px', color: 'rgba(244,228,220,0.88)' },
  li: { fontSize: 17, lineHeight: 1.75, margin: '6px 0' },
  tableWrap: { overflowX: 'auto', margin: '20px 0 28px', border: '1px solid rgba(196,131,105,0.18)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 15 },
  th: { textAlign: 'left', padding: '12px 14px', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 11, color: rose, borderBottom: '1px solid rgba(196,131,105,0.24)', background: 'rgba(196,131,105,0.04)' },
  td: { padding: '12px 14px', borderTop: '1px solid rgba(196,131,105,0.08)', color: 'rgba(244,228,220,0.88)', lineHeight: 1.5 },
  quote: { fontSize: 22, lineHeight: 1.5, fontStyle: 'italic', color: rose, borderLeft: `2px solid ${rose}`, padding: '4px 0 4px 22px', margin: '36px 0' },
  note: { fontSize: 15, lineHeight: 1.7, color: 'rgba(244,228,220,0.72)', borderLeft: `1px solid ${rose}`, padding: '4px 0 4px 14px', margin: '0 0 24px' },
  noteLabel: { color: rose, letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 11, marginRight: 6 },
  cta: { marginTop: 56, padding: '28px 24px', border: '1px solid rgba(196,131,105,0.22)', background: 'rgba(196,131,105,0.04)', textAlign: 'center' },
  ctaHeading: { fontSize: 24, fontWeight: 400, letterSpacing: '0.03em', margin: '0 0 12px', color: ink },
  ctaBody: { fontSize: 16, lineHeight: 1.75, color: 'rgba(244,228,220,0.82)', margin: '0 auto 20px', maxWidth: 560 },
  ctaButton: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: rose, border: `1px solid ${rose}`, padding: '12px 22px', minHeight: 44, fontFamily: 'inherit', letterSpacing: '0.24em', fontSize: 11, textTransform: 'uppercase', cursor: 'pointer' },
  linkGrid: { marginTop: 56 },
  linkGridHeading: { fontSize: 20, fontWeight: 400, letterSpacing: '0.03em', margin: '0 0 14px', color: ink },
  linkList: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '2px 24px', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' },
  linkItem: { borderTop: '1px solid rgba(196,131,105,0.14)' },
  linkAnchor: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 4px', minHeight: 44, color: 'rgba(244,228,220,0.9)', textDecoration: 'none', letterSpacing: '0.14em', fontSize: 12, textTransform: 'uppercase' },
  faq: { marginTop: 56 },
  faqItem: { padding: '16px 0', borderTop: '1px solid rgba(196,131,105,0.14)' },
  faqQ: { fontSize: 17, fontWeight: 500, letterSpacing: '0.02em', margin: '0 0 6px', color: ink },
  faqA: { fontSize: 16, lineHeight: 1.7, color: 'rgba(244,228,220,0.8)', margin: 0 },
  backRow: { marginTop: 56, textAlign: 'center' },
  articleHero: { width: '100%', maxWidth: 1200, display: 'block', margin: '0 auto', height: 'auto' },
  emptyState: { textAlign: 'center', padding: '80px 24px', maxWidth: 640, margin: '0 auto' },
  emptyLabel: { letterSpacing: '0.32em', fontSize: 12, color: rose, textTransform: 'uppercase', margin: '0 0 16px' },
  emptyCopy: { fontSize: 16, lineHeight: 1.7, color: 'rgba(244,228,220,0.65)' },
  grid: { display: 'grid', gap: 32, maxWidth: 1160, margin: '0 auto', padding: '32px 24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' },
  card: { display: 'block', color: ink, textDecoration: 'none' },
  cardImg: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' },
  cardTypo: { width: '100%', aspectRatio: '4/3', background: 'linear-gradient(180deg, rgba(196,131,105,0.08), rgba(196,131,105,0.02))', border: '1px solid rgba(196,131,105,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  cardTypoEyebrow: { letterSpacing: '0.32em', fontSize: 10, color: rose, textTransform: 'uppercase', margin: '0 0 12px' },
  cardTypoMark: { fontSize: 28, letterSpacing: '0.28em', color: 'rgba(244,228,220,0.65)', margin: 0 },
  cardBody: { padding: '20px 0' },
  cardDate: { letterSpacing: '0.22em', fontSize: 11, color: rose, margin: '0 0 12px', textTransform: 'uppercase' },
  cardCat: { color: 'rgba(244,228,220,0.55)' },
  cardTitle: { fontSize: 26, fontWeight: 400, margin: '0 0 12px' },
  cardExcerpt: { fontSize: 15, lineHeight: 1.6, color: 'rgba(244,228,220,0.7)' },
  cardCta: { display: 'inline-block', marginTop: 12, letterSpacing: '0.22em', fontSize: 11, color: rose, textTransform: 'uppercase' },
  backLink: { color: rose, textDecoration: 'underline', letterSpacing: '0.18em', fontSize: 12, textTransform: 'uppercase' },
};
