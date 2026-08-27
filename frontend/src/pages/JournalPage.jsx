import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { journalArticles, getArticle } from '@/lib/journal';
import { applySeoHead, generateSeo, buildBreadcrumbJsonLd } from '@/lib/seo';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Journal index + article routes (Phase 4 scaffold).
//
// The index renders the current authored article list (empty until content
// exists). The article route renders a single article and emits Article
// JSON-LD. No AI-generated filler is ever rendered — if there are no
// articles, the index shows a quiet "Guides in production" state.
// ─────────────────────────────────────────────────────────────────────────────

export function JournalIndexPage() {
  useEffect(() => {
    const record = {
      slug: 'journal', name: 'Journal', href: '/journal',
      type: 'category',
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
              {a.heroImage && <img src={a.heroImage} alt={a.title} style={styles.cardImg} loading="lazy" />}
              <div style={styles.cardBody}>
                <p style={styles.cardDate}>{a.publishedAt}</p>
                <h2 style={styles.cardTitle}>{a.title}</h2>
                <p style={styles.cardExcerpt}>{a.excerpt}</p>
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

  useEffect(() => {
    if (!article) return undefined;
    const record = {
      slug: article.slug,
      name: article.title,
      href: `/journal/${article.slug}`,
      type: 'category',
      description: article.excerpt,
      seo: {
        title: `${article.title} | PHILEON Journal`,
        description: article.excerpt,
      },
    };
    const seo = generateSeo(record);
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      image: article.heroImage,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: { '@type': 'Organization', name: article.author || 'PHILEON Atelier' },
      publisher: { '@type': 'Organization', name: 'PHILEON' },
      url: seo.canonical,
    };
    return applySeoHead(seo, [articleLd, buildBreadcrumbJsonLd(record)]);
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
        <p style={styles.eyebrow}>{article.publishedAt}</p>
        <h1 style={styles.h1}>{article.title}</h1>
        {article.excerpt && <p style={styles.lede}>{article.excerpt}</p>}
      </section>
      {article.heroImage && (
        <img src={article.heroImage} alt={article.title} style={styles.articleHero} loading="eager" />
      )}
      <section style={styles.body}>
        {(article.body || []).map((block, i) => {
          if (block.type === 'h2') return <h2 key={i} style={styles.h2}>{block.text}</h2>;
          if (block.type === 'quote') return <blockquote key={i} style={styles.quote}>{block.text}</blockquote>;
          return <p key={i} style={styles.p}>{block.text}</p>;
        })}
      </section>
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
  h1: { fontSize: 'clamp(44px, 8vw, 88px)', fontWeight: 300, letterSpacing: '0.06em', margin: '0 0 24px' },
  h2: { fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 400, letterSpacing: '0.04em', margin: '48px 0 16px' },
  lede: { fontSize: 17, lineHeight: 1.7, color: 'rgba(244,228,220,0.85)', fontStyle: 'italic' },
  body: { maxWidth: 720, margin: '0 auto', padding: '32px 24px' },
  p: { fontSize: 17, lineHeight: 1.8, color: 'rgba(244,228,220,0.88)', margin: '0 0 20px' },
  quote: { fontSize: 20, lineHeight: 1.5, fontStyle: 'italic', color: rose, borderLeft: `2px solid ${rose}`, paddingLeft: 20, margin: '32px 0' },
  articleHero: { width: '100%', maxWidth: 1200, display: 'block', margin: '0 auto', height: 'auto' },
  emptyState: { textAlign: 'center', padding: '80px 24px', maxWidth: 640, margin: '0 auto' },
  emptyLabel: { letterSpacing: '0.32em', fontSize: 12, color: rose, textTransform: 'uppercase', margin: '0 0 16px' },
  emptyCopy: { fontSize: 16, lineHeight: 1.7, color: 'rgba(244,228,220,0.65)' },
  grid: { display: 'grid', gap: 32, maxWidth: 1160, margin: '0 auto', padding: '32px 24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' },
  card: { display: 'block', color: ink, textDecoration: 'none' },
  cardImg: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' },
  cardBody: { padding: '20px 0' },
  cardDate: { letterSpacing: '0.22em', fontSize: 11, color: rose, margin: '0 0 12px', textTransform: 'uppercase' },
  cardTitle: { fontSize: 26, fontWeight: 400, margin: '0 0 12px' },
  cardExcerpt: { fontSize: 15, lineHeight: 1.6, color: 'rgba(244,228,220,0.7)' },
  backLink: { color: rose, textDecoration: 'underline', letterSpacing: '0.18em', fontSize: 12, textTransform: 'uppercase' },
};
