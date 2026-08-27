import React, { useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Factual Details block (Phase 4)
//
// Drop-in structured product details for Fine Jewelry pages. Sits ALONGSIDE
// existing editorial copy — never replaces it. Only renders fields that
// contain real data; unknown fields are silently skipped. No invented specs.
//
// Usage:
//   <FactualDetails
//     data-testid="drape-facts"
//     materials={{ metal: '10K/14K White Gold', karat: '10K/14K', finish: 'High polish' }}
//     stones={[{ type: 'Diamond', cut: 'Round Brilliant', tcw: '1.20 TCW' }]}
//     fit={{ size: 'US 5 – US 10', width: '3 mm shank' }}
//     production={{ madeToOrder: true, timeframe: '6–8 weeks' }}
//     included={{ packaging: 'PHILEON presentation box', certificate: 'Diamond certificate on request' }}
//     faq={[{ q: 'Is this piece made to order?', a: 'Yes — cast, set and finished per order.' }]}
//   />
//
// If `faq` is provided, a matching FAQPage JSON-LD block is injected. Google
// no longer displays FAQ rich results for most retailers, so structured data
// is emitted only when explicitly requested to remain accurate to policy.
// ─────────────────────────────────────────────────────────────────────────────

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  );
}

function Section({ title, children, testid }) {
  const hasChildren = React.Children.toArray(children).some(Boolean);
  if (!hasChildren) return null;
  return (
    <div style={styles.section} data-testid={testid}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <div style={styles.rows}>{children}</div>
    </div>
  );
}

export default function FactualDetails({
  materials,
  stones,
  fit,
  production,
  included,
  faq,
  ...rest
}) {
  useEffect(() => {
    if (!Array.isArray(faq) || faq.length === 0) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.phileonFaq = 'true';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
    document.head.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [faq]);

  const hasAnything =
    materials || (stones && stones.length) || fit || production || included || (faq && faq.length);
  if (!hasAnything) return null;

  return (
    <section style={styles.container} {...rest}>
      <Section title="Materials" testid="fd-materials">
        {materials && (
          <>
            <Row label="Metal" value={materials.metal} />
            <Row label="Karat" value={materials.karat} />
            <Row label="Finish" value={materials.finish} />
            <Row label="Color" value={materials.color} />
          </>
        )}
      </Section>

      {Array.isArray(stones) && stones.length > 0 && (
        <Section title="Stones" testid="fd-stones">
          {stones.map((s, i) => (
            <React.Fragment key={i}>
              <Row label="Type" value={s.type} />
              <Row label="Cut" value={s.cut} />
              <Row label="Color" value={s.color} />
              <Row label="Clarity" value={s.clarity} />
              <Row label="Total Weight" value={s.tcw} />
              <Row label="Origin" value={s.origin} />
            </React.Fragment>
          ))}
        </Section>
      )}

      <Section title="Fit" testid="fd-fit">
        {fit && (
          <>
            <Row label="Size range" value={fit.size} />
            <Row label="Width" value={fit.width} />
            <Row label="Dimensions" value={fit.dimensions} />
            <Row label="Fit notes" value={fit.notes} />
          </>
        )}
      </Section>

      <Section title="Production" testid="fd-production">
        {production && (
          <>
            <Row label="Made to order" value={production.madeToOrder ? 'Yes' : production.madeToOrder === false ? 'No' : undefined} />
            <Row label="Timeframe" value={production.timeframe} />
            <Row label="Customization" value={production.customization} />
          </>
        )}
      </Section>

      <Section title="Included" testid="fd-included">
        {included && (
          <>
            <Row label="Chain" value={included.chain} />
            <Row label="Packaging" value={included.packaging} />
            <Row label="Certificate" value={included.certificate} />
          </>
        )}
      </Section>

      {Array.isArray(faq) && faq.length > 0 && (
        <div style={styles.section} data-testid="fd-faq">
          <h3 style={styles.sectionTitle}>Questions</h3>
          <div>
            {faq.map((f, i) => (
              <details key={i} style={styles.faqItem} data-testid={`fd-faq-item-${i}`}>
                <summary style={styles.faqQ}>{f.q}</summary>
                <p style={styles.faqA}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const rose = '#c48369';
const ink = '#f4e4dc';
const styles = {
  container: {
    background: '#0a0a0a',
    padding: '48px 24px',
    maxWidth: 780,
    margin: '32px auto 0',
    fontFamily: "'Cormorant Garamond', 'Cormorant', Georgia, serif",
    color: ink,
  },
  section: { padding: '20px 0', borderBottom: '1px solid rgba(196,131,105,0.12)' },
  sectionTitle: {
    letterSpacing: '0.32em',
    fontSize: 11,
    color: rose,
    margin: '0 0 20px',
    textTransform: 'uppercase',
  },
  rows: { display: 'grid', gap: 10 },
  row: { display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20 },
  rowLabel: {
    letterSpacing: '0.18em',
    fontSize: 11,
    textTransform: 'uppercase',
    color: 'rgba(244,228,220,0.55)',
    lineHeight: 1.8,
  },
  rowValue: { fontSize: 15, lineHeight: 1.7, color: ink },
  faqItem: {
    borderTop: '1px solid rgba(196,131,105,0.08)',
    padding: '16px 0',
  },
  faqQ: {
    cursor: 'pointer',
    letterSpacing: '0.14em',
    fontSize: 13,
    color: ink,
    listStyle: 'none',
  },
  faqA: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 1.7,
    color: 'rgba(244,228,220,0.75)',
    fontStyle: 'italic',
  },
};
