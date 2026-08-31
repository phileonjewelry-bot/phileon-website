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
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const bySlug = Object.fromEntries(journalArticles.map((a) => [a.slug, a]));

  const paths = [
    {
      id: 'shopping',
      label: "I\u2019m shopping",
      copy: 'Compare the choices that change how a piece looks, fits and wears before you decide what belongs on your hand.',
      cta: null,
      guides: [
        { slug: 'engagement-ring-stone-shapes',    descriptor: 'Compare round, oval, pear, emerald, princess and other shapes through proportion, setting and overall ring architecture.' },
        { slug: 'coloured-gemstones-explained',    descriptor: 'Understand colour, treatments, inclusions, durability and design considerations across sapphire, ruby, emerald and other coloured stones.' },
        { slug: 'lab-grown-vs-natural-diamonds',   descriptor: 'Understand what actually differs — and what does not — when choosing between lab-grown and natural diamonds.' },
        { slug: '10k-vs-14k-vs-18k-gold',          descriptor: 'Compare gold purity, colour, wear considerations and how karat affects the finished piece.' },
        { slug: 'ring-sizing-guide',               descriptor: 'Understand why the number is only the beginning and how width, profile and design affect fit.' },
        { slug: 'wedding-band-pairing-guide',      descriptor: 'Learn how flush fit, intentional gaps, contour, width and setting geometry affect a two-ring stack.' },
      ],
    },
    {
      id: 'designing',
      label: "I\u2019m designing",
      copy: 'Understand how an idea becomes a wearable object — from the centre stone and setting to proportion, fit, CAD and the relationship between every part.',
      cta: {
        heading: 'Have something specific in mind?',
        copy: 'If you already have a stone, reference, existing piece or idea, you do not need to finish the design before starting the conversation.',
        buttonLabel: 'START A BESPOKE CONVERSATION',
        secondary: { label: 'Explore PHILEON Bespoke', href: '/custom-jewelry-canada' },
      },
      guides: [
        { slug: 'bespoke-jewelry-design-process',  descriptor: 'Follow the path from initial idea through design direction, materials, technical development and production.' },
        { slug: 'engagement-ring-anatomy',         descriptor: 'Learn how the head, basket, gallery, shoulders, shank and setting work together as one structure.' },
        { slug: 'jewelry-setting-styles',          descriptor: 'Compare prong, bezel, pavé, channel and other setting approaches without treating one as universally superior.' },
        { slug: 'engagement-ring-stone-shapes',    descriptor: 'See how changing the centre-stone outline changes the geometry the rest of the ring must answer.' },
        { slug: 'coloured-gemstones-explained',    descriptor: 'See how gemstone colour, physical characteristics, dimensions and treatment history become inputs to the setting and finished design.' },
        { slug: 'wedding-band-pairing-guide',      descriptor: 'Design the relationship between an engagement ring and wedding band rather than treating them as separate objects.' },
      ],
    },
    {
      id: 'learning',
      label: "I\u2019m learning",
      copy: "Build the vocabulary behind fine jewelry — metal, stone, structure, setting and the marks that tell part of an object's story.",
      cta: null,
      guides: [
        { slug: 'jewelry-hallmarks-stamps',        descriptor: "Understand 10K, 14K, 18K, 417, 585, 750, maker's marks and why a stamp alone does not prove authenticity." },
        { slug: 'coloured-gemstones-explained',    descriptor: 'Learn how gemstone species, colour, treatments, inclusions, hardness, toughness and stability differ.' },
        { slug: '10k-vs-14k-vs-18k-gold',          descriptor: 'Understand how gold content changes alloy composition, appearance and design considerations.' },
        { slug: 'lab-grown-vs-natural-diamonds',   descriptor: 'Separate origin from appearance, grading and the other factors that determine what a diamond actually is.' },
        { slug: 'engagement-ring-anatomy',         descriptor: 'Learn the terminology behind the structure of a ring rather than seeing only the centre stone.' },
        { slug: 'jewelry-setting-styles',          descriptor: 'Understand the structural and visual differences between common stone-setting approaches.' },
      ],
    },
  ];

  useEffect(() => {
    const record = {
      slug: 'journal', name: 'Journal', href: '/journal', type: 'category',
      seo: {
        title: 'The PHILEON Journal | Fine Jewelry Guides & Education',
        description: 'Explore PHILEON guides on diamonds, gold, ring sizing, settings, stone shapes, wedding bands, hallmarks and bespoke jewelry design.',
      },
    };
    const seo = generateSeo(record);
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: journalArticles.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${seo.canonical.replace(/\/journal$/, '')}/journal/${a.slug}`,
        name: a.title,
      })),
    };
    return applySeoHead(seo, [buildBreadcrumbJsonLd(record), itemList]);
  }, []);

  // ConciergeAgent fires the concierge_open beacon internally when it
  // transitions closed→open with a source prop, so we do not duplicate it here.

  return (
    <div style={styles.page} data-testid="journal-index">
      <style>{HUB_CSS}</style>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>DESIGN · MATERIAL · CRAFT · KNOWLEDGE</p>
        <h1 style={styles.h1}>The PHILEON Journal</h1>
        <p style={styles.lede}>Fine jewelry becomes easier to understand when you know what you are actually looking at. The PHILEON Journal breaks down the decisions behind the object — stones, metals, settings, proportion, fit and design — so you can shop with more context, develop a bespoke piece with greater clarity or simply understand jewelry beyond the surface.</p>
        <p style={styles.lede}>Start with what you are trying to do.</p>
      </section>

      <section className="phileon-hub" aria-labelledby="journal-start-here" data-testid="journal-start-here">
        <div className="phileon-hub__header">
          <h2 id="journal-start-here" className="phileon-hub__title">Start here</h2>
          <p className="phileon-hub__sub">Choose the path closest to what brought you here.</p>
        </div>
        <div className="phileon-hub__paths">
          {paths.map((p) => (
            <section key={p.id} id={p.id} className="phileon-hub__path" data-testid={`journal-path-${p.id}`}
              aria-labelledby={`path-h-${p.id}`}>
              <h3 id={`path-h-${p.id}`} className="phileon-hub__pathLabel">{p.label}</h3>
              <p className="phileon-hub__pathCopy">{p.copy}</p>
              <ol className="phileon-hub__guides">
                {p.guides.map((g) => {
                  const a = bySlug[g.slug];
                  if (!a) return null;
                  return (
                    <li key={g.slug} className="phileon-hub__guide">
                      <Link to={`/journal/${a.slug}`} className="phileon-hub__guideLink"
                        data-testid={`journal-path-${p.id}-guide-${a.slug}`}>
                        <p className="phileon-hub__guideTitle">{a.title} <span aria-hidden="true">→</span></p>
                        <p className="phileon-hub__guideDesc">{g.descriptor}</p>
                      </Link>
                    </li>
                  );
                })}
              </ol>
              {p.cta && (
                <div className="phileon-hub__cta">
                  <p className="phileon-hub__ctaHead">{p.cta.heading}</p>
                  <p className="phileon-hub__ctaCopy">{p.cta.copy}</p>
                  <button type="button" onClick={() => setConciergeOpen(true)}
                    className="phileon-hub__ctaBtn"
                    data-testid="journal-hub-concierge-open-designing">
                    {p.cta.buttonLabel}
                  </button>
                  {p.cta.secondary && (
                    <Link to={p.cta.secondary.href} className="phileon-hub__ctaSecondary"
                      data-testid="journal-hub-bespoke-link">
                      {p.cta.secondary.label} <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      </section>

      <section aria-labelledby="journal-latest">
        <div className="phileon-hub__latestHead">
          <h2 id="journal-latest" className="phileon-hub__title">Latest from the PHILEON Journal</h2>
          <p className="phileon-hub__sub">All guides, newest first.</p>
        </div>
        {journalArticles.length === 0 ? (
          <div style={styles.emptyState} data-testid="journal-empty">
            <p style={styles.emptyLabel}>Guides in production</p>
            <p style={styles.emptyCopy}>New guides on gold karats, lab-grown diamonds, ring sizing and setting styles are being authored in the atelier.</p>
          </div>
        ) : (
          <div style={styles.grid} data-testid="journal-grid">
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
          </div>
        )}
      </section>

      <ConciergeAgent open={conciergeOpen} onClose={() => setConciergeOpen(false)} source="journal:hub-designing" />
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
      <style>{DIAGRAM_CSS}</style>
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
            case 'diagram':
              return (
                <figure
                  key={i}
                  className={`phileon-diagram phileon-diagram--${block.variant || 'journey'}`}
                  data-testid={`journal-diagram-${block.variant || 'journey'}-${i}`}
                >
                  {block.title && <figcaption className="phileon-diagram__title">{block.title}</figcaption>}
                  {block.variant === 'journey' && (
                    <ol className="phileon-diagram__journey">
                      {(block.steps || []).map((s, j) => (
                        <li key={j} className="phileon-diagram__journey-row">
                          <span className="phileon-diagram__num" aria-hidden="true">{String(j + 1).padStart(2, '0')}</span>
                          <span className="phileon-diagram__step">{s}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {block.variant === 'decisions' && (
                    <div className="phileon-diagram__decisions">
                      <div className="phileon-diagram__center" aria-hidden="true">{block.center || 'BESPOKE PIECE'}</div>
                      <div className="phileon-diagram__branches">
                        {(block.branches || []).map((br, j) => (
                          <div key={j} className="phileon-diagram__branch">
                            <p className="phileon-diagram__branchLabel">{br.label}</p>
                            <ul className="phileon-diagram__branchList">
                              {(br.items || []).map((it, k) => <li key={k}>{it}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {block.variant === 'flow' && (
                    <ol className="phileon-diagram__flow">
                      {(block.steps || []).map((s, j) => (
                        <li key={j} className="phileon-diagram__flowRow">
                          <p className="phileon-diagram__flowLabel">{s.label}</p>
                          {s.question && <p className="phileon-diagram__flowQ">&ldquo;{s.question}&rdquo;</p>}
                        </li>
                      ))}
                    </ol>
                  )}
                  {block.variant === 'matrix' && (
                    <div className="phileon-diagram__matrix">
                      {(block.items || []).map((it, j) => (
                        <div key={j} className="phileon-diagram__matrixCell">{it}</div>
                      ))}
                      <div className="phileon-diagram__matrixCenter" aria-hidden="true">{block.center || 'THE FINISHED OBJECT'}</div>
                    </div>
                  )}
                  {block.variant === 'silhouettes' && (
                    <div className="phileon-diagram__silhouettes">
                      {(block.groups || [{ label: null, items: block.items || [] }]).map((g, gi) => (
                        <div key={gi} className="phileon-diagram__silGroup">
                          {g.label && <p className="phileon-diagram__silGroupLabel">{g.label}</p>}
                          <div className="phileon-diagram__silGrid">
                            {(g.items || []).map((it, k) => (
                              <figure key={k} className="phileon-diagram__silCell">
                                <svg viewBox="0 0 60 60" className="phileon-diagram__silSvg" role="img" aria-label={it.label}>
                                  <title>{it.label}</title>
                                  <ShapeOutline shape={it.shape} />
                                </svg>
                                <figcaption className="phileon-diagram__silLabel">{it.label}</figcaption>
                              </figure>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {block.caption && (
                    <p className="phileon-diagram__caption">{block.caption}</p>
                  )}
                </figure>
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

// ────────────────────────────────────────────────────────────────
// Editorial diagram CSS — used only when an article body includes
// a { type: 'diagram' } block. Palette matches the Journal styles
// object above (rose #c48369 · ink #f4e4dc · dark background).
// ────────────────────────────────────────────────────────────────

// Reusable stone-shape outlines used by the `silhouettes` diagram variant.
// Single-stroke geometry only, no fill, restrained rose-gold hairlines.
const SHAPE_PATHS = {
  round:     <circle cx="30" cy="30" r="20" />,
  oval:      <ellipse cx="30" cy="30" rx="14" ry="20" />,
  pear:      <path d="M30 10 C40 22, 44 34, 30 50 C16 34, 20 22, 30 10 Z" />,
  marquise:  <path d="M30 8 C42 20, 42 40, 30 52 C18 40, 18 20, 30 8 Z" />,
  emerald:   <path d="M18 12 L42 12 L48 20 L48 40 L42 48 L18 48 L12 40 L12 20 Z" />,
  princess:  <rect x="12" y="12" width="36" height="36" />,
  cushion:   <path d="M18 10 L42 10 Q50 10 50 18 L50 42 Q50 50 42 50 L18 50 Q10 50 10 42 L10 18 Q10 10 18 10 Z" />,
  radiant:   <path d="M20 10 L40 10 L48 18 L48 42 L40 50 L20 50 L12 42 L12 18 Z" />,
  heart:     <path d="M30 50 C18 40, 8 30, 12 20 C15 12, 24 12, 30 20 C36 12, 45 12, 48 20 C52 30, 42 40, 30 50 Z" />,
  compact:   <rect x="15" y="18" width="30" height="24" rx="2" />,
  balanced:  <rect x="10" y="18" width="40" height="24" rx="2" />,
  elongated: <rect x="6" y="20" width="48" height="20" rx="2" />,
  deep:      <rect x="18" y="10" width="24" height="40" rx="2" />,
};
const ShapeOutline = ({ shape }) => SHAPE_PATHS[shape] || null;

const DIAGRAM_CSS = `
.phileon-diagram { margin: 48px 0; padding: 0; }
.phileon-diagram__title {
  letter-spacing: 0.22em; font-size: 11px; text-transform: uppercase;
  color: #c48369; margin: 0 0 18px; padding-bottom: 10px;
  border-bottom: 1px solid rgba(196,131,105,0.24);
}
.phileon-diagram__caption {
  font-size: 13px; line-height: 1.6; color: rgba(244,228,220,0.6);
  font-style: italic; margin: 18px 0 0; max-width: 640px;
}

/* Journey — numbered vertical sequence */
.phileon-diagram__journey { list-style: none; margin: 0; padding: 0; }
.phileon-diagram__journey-row {
  display: grid; grid-template-columns: 56px 1fr;
  align-items: center; gap: 20px;
  padding: 18px 0; border-top: 1px solid rgba(196,131,105,0.14);
}
.phileon-diagram__journey-row:first-child { border-top: none; }
.phileon-diagram__num {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 28px; color: #c48369; letter-spacing: 0.04em;
}
.phileon-diagram__step {
  font-size: 16px; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(244,228,220,0.9);
}

/* Decision map — center + branches */
.phileon-diagram__decisions {
  border: 1px solid rgba(196,131,105,0.2); padding: 28px 20px;
}
.phileon-diagram__center {
  text-align: center; letter-spacing: 0.32em; text-transform: uppercase;
  font-size: 12px; color: #c48369; padding: 14px 0; margin-bottom: 24px;
  border-bottom: 1px solid rgba(196,131,105,0.18);
}
.phileon-diagram__branches {
  display: grid; grid-template-columns: 1fr; gap: 24px;
}
@media (min-width: 640px) {
  .phileon-diagram__branches { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 900px) {
  .phileon-diagram__branches { grid-template-columns: repeat(3, 1fr); }
}
.phileon-diagram__branch {
  padding: 12px 0;
  border-top: 1px solid rgba(196,131,105,0.14);
}
.phileon-diagram__branchLabel {
  letter-spacing: 0.24em; text-transform: uppercase; font-size: 11px;
  color: #c48369; margin: 0 0 8px;
}
.phileon-diagram__branchList {
  list-style: none; margin: 0; padding: 0;
  font-size: 14px; line-height: 1.75; color: rgba(244,228,220,0.82);
}
.phileon-diagram__branchList li { padding: 2px 0; }

/* Flow — linear transformation with question annotation */
.phileon-diagram__flow { list-style: none; margin: 0; padding: 0; }
.phileon-diagram__flowRow {
  padding: 20px 0; border-top: 1px solid rgba(196,131,105,0.14);
}
.phileon-diagram__flowRow:first-child { border-top: none; }
.phileon-diagram__flowLabel {
  letter-spacing: 0.24em; text-transform: uppercase; font-size: 12px;
  color: rgba(244,228,220,0.92); margin: 0 0 6px;
}
.phileon-diagram__flowQ {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic; font-size: 17px; line-height: 1.5;
  color: #c48369; margin: 0;
}

/* Matrix — 8 decisions converging on a centre cell */
.phileon-diagram__matrix {
  display: grid; grid-template-columns: 1fr; gap: 0;
  border: 1px solid rgba(196,131,105,0.2);
}
@media (min-width: 640px) {
  .phileon-diagram__matrix { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 900px) {
  .phileon-diagram__matrix { grid-template-columns: repeat(3, 1fr); }
}
.phileon-diagram__matrixCell {
  padding: 22px 20px; text-align: center;
  letter-spacing: 0.24em; text-transform: uppercase; font-size: 12px;
  color: rgba(244,228,220,0.88);
  border-top: 1px solid rgba(196,131,105,0.14);
  border-left: 1px solid rgba(196,131,105,0.08);
}
@media (min-width: 900px) {
  .phileon-diagram__matrixCell:nth-child(-n+3) { border-top: none; }
}
.phileon-diagram__matrixCenter {
  padding: 26px 20px; text-align: center;
  letter-spacing: 0.28em; text-transform: uppercase; font-size: 13px;
  color: #c48369; grid-column: 1 / -1;
  background: rgba(196,131,105,0.06);
  border-top: 1px solid rgba(196,131,105,0.24);
}

/* Silhouettes — labeled outline grid */
.phileon-diagram__silhouettes {
  border: 1px solid rgba(196,131,105,0.2);
  padding: 24px 16px;
}
.phileon-diagram__silGroup + .phileon-diagram__silGroup {
  margin-top: 28px; padding-top: 24px;
  border-top: 1px solid rgba(196,131,105,0.14);
}
.phileon-diagram__silGroupLabel {
  letter-spacing: 0.28em; text-transform: uppercase;
  font-size: 11px; color: #c48369;
  margin: 0 0 18px; text-align: center;
}
.phileon-diagram__silGrid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 20px 12px;
}
@media (min-width: 520px) {
  .phileon-diagram__silGrid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 900px) {
  .phileon-diagram__silGrid { grid-template-columns: repeat(6, 1fr); }
}
.phileon-diagram__silCell {
  margin: 0; display: flex; flex-direction: column;
  align-items: center; gap: 10px;
}
.phileon-diagram__silSvg {
  width: 60px; height: 60px;
  stroke: #c48369; stroke-width: 1.2; fill: none;
  overflow: visible;
}
.phileon-diagram__silLabel {
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(244,228,220,0.88); text-align: center;
}
`;

// ────────────────────────────────────────────────────────────────
// Journal hub CSS — Start Here + intent-path columns.
// ────────────────────────────────────────────────────────────────
const HUB_CSS = `
.phileon-hub { margin: 48px 0 64px; }
.phileon-hub__header, .phileon-hub__latestHead {
  margin: 0 0 32px; padding-bottom: 16px;
  border-bottom: 1px solid rgba(196,131,105,0.18);
}
.phileon-hub__latestHead { margin-top: 24px; }
.phileon-hub__title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 28px; font-weight: 400; letter-spacing: 0.02em;
  color: #f4e4dc; margin: 0 0 8px;
}
.phileon-hub__sub {
  font-size: 13px; color: rgba(244,228,220,0.6); margin: 0;
  letter-spacing: 0.04em;
}
.phileon-hub__paths {
  display: grid; grid-template-columns: 1fr; gap: 40px;
}
@media (min-width: 720px) { .phileon-hub__paths { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1080px) { .phileon-hub__paths { grid-template-columns: repeat(3, 1fr); } }
.phileon-hub__path { padding: 4px 0; }
.phileon-hub__pathLabel {
  letter-spacing: 0.28em; text-transform: uppercase;
  font-size: 12px; color: #c48369;
  margin: 0 0 12px; padding-bottom: 12px;
  border-bottom: 1px solid rgba(196,131,105,0.24);
  font-family: inherit; font-weight: 500;
}
.phileon-hub__pathCopy {
  font-size: 14px; line-height: 1.65;
  color: rgba(244,228,220,0.72); margin: 0 0 22px;
}
.phileon-hub__guides { list-style: none; margin: 0; padding: 0; counter-reset: guide; }
.phileon-hub__guide { padding: 16px 0; border-top: 1px solid rgba(196,131,105,0.12); counter-increment: guide; }
.phileon-hub__guide:first-child { border-top: none; padding-top: 0; }
.phileon-hub__guideLink {
  display: block; text-decoration: none; color: inherit;
}
.phileon-hub__guideLink:hover .phileon-hub__guideTitle { color: #c48369; }
.phileon-hub__guideLink:focus-visible {
  outline: 1px solid #c48369; outline-offset: 4px;
}
.phileon-hub__guideTitle {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 17px; line-height: 1.35; margin: 0 0 6px;
  color: rgba(244,228,220,0.94);
  transition: color 0.2s ease;
}
.phileon-hub__guideDesc {
  font-size: 13px; line-height: 1.6;
  color: rgba(244,228,220,0.6); margin: 0;
}
.phileon-hub__cta {
  margin-top: 28px; padding: 24px 20px;
  border: 1px solid rgba(196,131,105,0.24);
}
.phileon-hub__ctaHead {
  letter-spacing: 0.24em; text-transform: uppercase;
  font-size: 11px; color: #c48369; margin: 0 0 10px;
}
.phileon-hub__ctaCopy {
  font-size: 13px; line-height: 1.6;
  color: rgba(244,228,220,0.78); margin: 0 0 18px;
}
.phileon-hub__ctaBtn {
  display: inline-block; width: 100%;
  background: #c48369; color: #0a0806; border: 0; cursor: pointer;
  padding: 14px 20px;
  font: inherit; letter-spacing: 0.28em; text-transform: uppercase;
  font-size: 11px; font-weight: 500;
  transition: background 0.2s ease;
}
.phileon-hub__ctaBtn:hover { background: #d4967c; }
.phileon-hub__ctaBtn:focus-visible { outline: 1px solid #f4e4dc; outline-offset: 2px; }
.phileon-hub__ctaSecondary {
  display: inline-block; margin-top: 14px;
  font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;
  color: #c48369; text-decoration: none;
}
.phileon-hub__ctaSecondary:hover { text-decoration: underline; }
`;
