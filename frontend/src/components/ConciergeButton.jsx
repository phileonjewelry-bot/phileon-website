import { useState } from 'react';
import ConciergeAgent from './ConciergeAgent';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Concierge trigger (Phase 9).
//
// Restrained contextual CTA that opens the Concierge Agent modal. Meant to
// live on Fine Jewelry PDPs beside (never competing with) Add to Cart, or
// as a primary action on custom/bespoke surfaces.
// ─────────────────────────────────────────────────────────────────────────────

export default function ConciergeButton({
  productContext,
  source = 'concierge',
  bespoke = false,
  label,
  testId = 'concierge-open',
  variant = 'secondary',
}) {
  const [open, setOpen] = useState(false);

  const defaultLabel = bespoke ? 'Start a Bespoke Conversation' : 'Ask PHILEON';
  const supportLine = bespoke
    ? 'Design consultation, references and a piece made specifically for you.'
    : 'Questions about sizing, stones, metals or custom options?';

  const isPrimary = variant === 'primary';

  return (
    <div style={styles.wrap}>
      <p style={styles.support}>{supportLine}</p>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          try {
            const events = JSON.parse(localStorage.getItem('phileon_events') || '[]');
            events.push({ t: Date.now(), name: 'concierge_open', source, hasProduct: !!productContext?.slug });
            localStorage.setItem('phileon_events', JSON.stringify(events.slice(-200)));
          } catch (_e) { /* noop */ }
        }}
        style={isPrimary ? { ...styles.btn, ...styles.primary } : styles.btn}
        data-testid={testId}
      >
        {label || defaultLabel}
        <span style={styles.arrow} aria-hidden="true"> →</span>
      </button>
      <ConciergeAgent
        open={open}
        onClose={() => setOpen(false)}
        productContext={productContext}
        source={source}
        bespoke={bespoke}
      />
    </div>
  );
}

const rose = '#c48369';
const styles = {
  wrap: { margin: '18px 0 4px' },
  support: {
    fontSize: 13, lineHeight: 1.55, color: 'rgba(244,228,220,0.68)',
    fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic',
    margin: '0 0 10px',
  },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'transparent', color: rose, border: `1px solid ${rose}`,
    padding: '12px 22px', minHeight: 44,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    letterSpacing: '0.24em', fontSize: 11, textTransform: 'uppercase',
    cursor: 'pointer',
  },
  primary: {
    background: rose, color: '#0a0a0a', border: `1px solid ${rose}`,
  },
  arrow: { letterSpacing: 0 },
};
