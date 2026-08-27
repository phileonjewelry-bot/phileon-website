import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { search, logSearch, logSearchClick } from '@/lib/search';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Site Search Overlay + trigger button (Phase 5).
//
// Global overlay: opens on trigger button click, `/` keypress (when not
// inside an input), or Cmd/Ctrl+K. Closes on Escape / backdrop tap.
// Type-ahead results (200ms debounce). Full-width on mobile, centered on
// desktop. Zero external deps. Zero fake prices — only real `price_range`
// strings render. Editorial voice preserved: dark bg, rose-gold accents,
// Cormorant serif.
// ─────────────────────────────────────────────────────────────────────────────

export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const active = document.activeElement;
      const inField = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      if (!open && (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !inField) {
        e.preventDefault();
        setOpen(true);
      } else if (open && e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQ('');
    }
  }, [open]);

  const { pages, products } = useMemo(() => {
    if (!q.trim()) return { pages: [], products: [] };
    return search(q, { limit: 10 });
  }, [q]);

  // Debounced analytics ping — only after the user stops typing.
  useEffect(() => {
    if (!q.trim()) return undefined;
    const t = setTimeout(() => logSearch({ query: q, resultCount: pages.length + products.length }), 500);
    return () => clearTimeout(t);
  }, [q, pages.length, products.length]);

  const handleResultClick = (href) => {
    logSearchClick({ query: q, href });
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={styles.trigger}
        data-testid="site-search-trigger"
        aria-label="Open site search"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="20" y1="20" x2="16.5" y2="16.5" />
        </svg>
      </button>

      {open && (
        <div style={styles.backdrop} onClick={() => setOpen(false)} data-testid="site-search-overlay">
          <div style={styles.panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search PHILEON">
            <div style={styles.inputWrap}>
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search rings, pendants, materials, stones, Black-owned Canadian jewelry…"
                style={styles.input}
                data-testid="site-search-input"
                autoComplete="off"
                spellCheck="false"
              />
              <button type="button" onClick={() => setOpen(false)} style={styles.close} data-testid="site-search-close" aria-label="Close search">
                ×
              </button>
            </div>

            <div style={styles.results} data-testid="site-search-results">
              {!q.trim() && (
                <div style={styles.empty}>
                  <p style={styles.emptyLabel}>Try</p>
                  <div style={styles.tagRow}>
                    {['black ring','rose gold','pink stone','pendant','statement rings','Caribbean','Black-owned','custom jewelry'].map((suggestion) => (
                      <button key={suggestion} type="button" style={styles.tag} onClick={() => setQ(suggestion)} data-testid={`search-suggestion-${suggestion.replace(/\s+/g,'-')}`}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {q.trim() && pages.length === 0 && products.length === 0 && (
                <p style={styles.zero} data-testid="search-zero-results">No matches for &ldquo;{q}&rdquo;. Try a material, stone or category.</p>
              )}

              {pages.length > 0 && (
                <section style={styles.section}>
                  <p style={styles.sectionLabel}>Collections</p>
                  {pages.map((r) => (
                    <Link key={r.href} to={r.href} onClick={() => handleResultClick(r.href)} style={styles.rowLink} data-testid={`search-page-${r.href}`}>
                      <div style={styles.rowText}>
                        <span style={styles.rowName}>{r.name}</span>
                        <span style={styles.rowSub}>{r.subtitle}</span>
                      </div>
                      <span style={styles.rowArrow}>→</span>
                    </Link>
                  ))}
                </section>
              )}

              {products.length > 0 && (
                <section style={styles.section}>
                  <p style={styles.sectionLabel}>Products</p>
                  {products.map((r) => (
                    <Link key={r.slug} to={r.href} onClick={() => handleResultClick(r.href)} style={styles.rowLink} data-testid={`search-product-${r.slug}`}>
                      <div style={styles.thumb}>
                        {r.image && <img src={r.image} alt={r.name} style={styles.thumbImg} loading="lazy" />}
                      </div>
                      <div style={styles.rowText}>
                        <span style={styles.rowName}>{r.name}</span>
                        <span style={styles.rowSub}>{r.subtitle}</span>
                      </div>
                      {r.price && <span style={styles.rowPrice}>{r.price}</span>}
                    </Link>
                  ))}
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const rose = '#c48369';
const ink = '#f4e4dc';
const styles = {
  trigger: {
    position: 'fixed', top: 84, right: 24, zIndex: 200,
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(20,20,20,0.8)', color: ink, border: `1px solid rgba(196,131,105,0.28)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    pointerEvents: 'auto',
  },
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
    zIndex: 100, padding: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  },
  panel: {
    background: '#0a0a0a', width: '100%', maxWidth: 720, marginTop: '8vh',
    border: '1px solid rgba(196,131,105,0.18)', borderRadius: 4, overflow: 'hidden',
    fontFamily: "'Cormorant Garamond', Georgia, serif", color: ink,
    display: 'flex', flexDirection: 'column', maxHeight: '80vh',
  },
  inputWrap: { display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(196,131,105,0.15)' },
  input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '20px 22px', fontSize: 18, color: ink, fontFamily: 'inherit', letterSpacing: '0.02em' },
  close: { background: 'transparent', border: 'none', color: rose, fontSize: 28, padding: '0 22px', cursor: 'pointer' },
  results: { overflow: 'auto', flex: 1 },
  empty: { padding: '32px 22px' },
  emptyLabel: { letterSpacing: '0.32em', fontSize: 11, color: rose, textTransform: 'uppercase', margin: '0 0 16px' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  tag: { background: 'transparent', color: ink, border: '1px solid rgba(196,131,105,0.24)', padding: '8px 16px', borderRadius: 999, fontSize: 12, letterSpacing: '0.14em', cursor: 'pointer', textTransform: 'uppercase' },
  zero: { padding: '40px 22px', color: 'rgba(244,228,220,0.6)', fontStyle: 'italic', textAlign: 'center' },
  section: { padding: '16px 0', borderTop: '1px solid rgba(196,131,105,0.08)' },
  sectionLabel: { letterSpacing: '0.32em', fontSize: 10, color: rose, textTransform: 'uppercase', margin: '0 22px 8px' },
  rowLink: { display: 'flex', alignItems: 'center', gap: 16, padding: '12px 22px', color: ink, textDecoration: 'none', minHeight: 56 },
  thumb: { width: 48, height: 48, background: '#050505', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  thumbImg: { width: '100%', height: '100%', objectFit: 'contain' },
  rowText: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  rowName: { letterSpacing: '0.14em', fontSize: 14, textTransform: 'uppercase' },
  rowSub: { letterSpacing: '0.1em', fontSize: 11, color: 'rgba(244,228,220,0.55)', textTransform: 'uppercase' },
  rowPrice: { letterSpacing: '0.14em', fontSize: 11, color: rose, textTransform: 'uppercase' },
  rowArrow: { color: rose, letterSpacing: '0.14em' },
};
