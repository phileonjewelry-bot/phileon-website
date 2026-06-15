import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Lock } from "lucide-react";

// Empty archive for now — populated by atelier as pieces are released.
// Each item, when added, should follow this shape:
//   { id, name, kind, era, material, story, priceUsd, image }
// Inventory rules per brief: limited quantities, no restocks, no
// reproductions; once sold, removed permanently.
const ARCHIVE_ITEMS = [];

const VAULT_CATEGORIES = [
  "Early Prototypes",
  "Design Studies",
  "Trade Show Samples",
  "Retired Concepts",
  "Experimental Pieces",
  "One-of-One Creations",
  "Alternative Material Versions",
  "Unreleased Designs",
];

const VAULT_RULES = [
  "Limited quantities",
  "No restocks",
  "No reproductions",
  "Once sold, removed permanently",
  "Archive inventory changes regularly",
];

export default function InspirationVaultPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    document.title = "The Inspiration Vault — PHILEON";
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const heroParallax = Math.min(scrollY * 0.18, 120);

  return (
    <div className="iv-page" data-testid="vault-page">
      <style>{`
        .iv-page {
          --bg: #050507;
          --bg-deep: #020203;
          --ink: #dcd5c4;
          --ink-strong: #f5efe1;
          --ink-muted: #7f7866;
          --ember: #a47433;
          --ember-dim: #6e4d22;
          --rule: rgba(255,255,255,0.10);
          --rule-soft: rgba(255,255,255,0.05);
          background: var(--bg);
          color: var(--ink);
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }
        /* Grain texture overlay */
        .iv-page::before {
          content: '';
          position: fixed; inset: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
          opacity: 0.22;
          z-index: 100;
        }
        .iv-return {
          font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.35em;
          color: var(--ink-muted); text-decoration: none;
          display: inline-flex; align-items: center; gap: 10px;
          padding: 28px 0 14px 60px;
          transition: color 220ms ease;
        }
        .iv-return:hover { color: var(--ember); }
        @media (max-width: 720px) { .iv-return { padding: 24px 0 12px 20px; } }
        .iv-section {
          max-width: 1180px; margin: 0 auto;
          padding: clamp(56px, 8vw, 112px) clamp(20px, 4vw, 60px);
          position: relative; z-index: 1;
        }
        .iv-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.45em;
          color: var(--ember); text-transform: uppercase;
          margin: 0 0 22px;
        }
        .iv-h1 {
          font-family: 'Playfair Display', serif; font-weight: 400;
          font-size: clamp(48px, 7vw, 96px);
          line-height: 0.94; letter-spacing: -0.02em;
          color: var(--ink-strong); margin: 0 0 28px;
        }
        .iv-h2 {
          font-family: 'Playfair Display', serif; font-weight: 400;
          font-size: clamp(30px, 3.8vw, 48px);
          line-height: 1.08; letter-spacing: -0.01em;
          color: var(--ink-strong); margin: 0 0 28px;
        }
        .iv-p {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(17px, 1.45vw, 21px);
          line-height: 1.62; color: var(--ink);
          margin: 0 0 18px;
        }
        .iv-p em, .iv-p i { font-style: italic; color: var(--ink-strong); }
        .iv-divider {
          width: 64px; height: 1px;
          background: var(--rule); margin: 56px 0;
        }

        /* ─── HERO ───────────────────────────────────────────── */
        .iv-hero {
          position: relative;
          padding: clamp(80px, 12vw, 160px) clamp(20px, 4vw, 60px) clamp(56px, 8vw, 96px);
          background: radial-gradient(ellipse 80% 60% at 50% 25%, rgba(164,116,51,0.10), transparent 60%),
                      radial-gradient(ellipse 50% 40% at 50% 90%, rgba(164,116,51,0.05), transparent 60%),
                      var(--bg-deep);
          overflow: hidden;
        }
        .iv-hero-inner {
          max-width: 980px; margin: 0 auto;
          text-align: center;
          position: relative; z-index: 2;
        }
        .iv-keyhole {
          width: 56px; height: 56px;
          margin: 0 auto 28px;
          border-radius: 50%;
          border: 1px solid var(--ember);
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--ember);
          opacity: 0.72;
          box-shadow: 0 0 24px rgba(164,116,51,0.18);
        }
        .iv-hero-tag {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(18px, 1.7vw, 22px);
          color: var(--ink); margin: 12px 0 0;
          letter-spacing: 0.02em;
        }
        /* Floating sketches in hero backdrop */
        .iv-sketch {
          position: absolute;
          opacity: 0.14;
          color: var(--ember);
          pointer-events: none;
          filter: blur(0.4px);
          z-index: 1;
        }
        .iv-sketch--tl { top: 12%; left: 5%; transform: rotate(-8deg); }
        .iv-sketch--tr { top: 18%; right: 6%; transform: rotate(11deg); }
        .iv-sketch--bl { bottom: 14%; left: 9%; transform: rotate(6deg); }
        .iv-sketch--br { bottom: 12%; right: 8%; transform: rotate(-13deg); }
        @media (max-width: 720px) {
          .iv-sketch--tl, .iv-sketch--tr { opacity: 0.08; }
          .iv-sketch--bl, .iv-sketch--br { display: none; }
        }

        /* ─── ARCHIVE GRID (empty state) ─────────────────────── */
        .iv-archive-empty {
          margin-top: 40px;
          border: 1px dashed var(--rule);
          padding: clamp(40px, 6vw, 80px) clamp(24px, 4vw, 48px);
          text-align: center;
          background: linear-gradient(135deg, rgba(164,116,51,0.04), transparent 70%);
        }
        .iv-archive-empty-icon {
          width: 64px; height: 64px;
          margin: 0 auto 22px;
          color: var(--ember-dim);
          opacity: 0.6;
        }
        .iv-archive-cat-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px 28px;
          margin-top: 32px;
          padding-top: 28px;
          border-top: 1px solid var(--rule-soft);
          text-align: left;
        }
        .iv-archive-cat {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 15px;
          color: var(--ink);
          padding-left: 18px;
          position: relative;
        }
        .iv-archive-cat::before {
          content: "·";
          position: absolute;
          left: 0; top: -2px;
          color: var(--ember);
          font-size: 22px;
        }

        /* ─── RULES BLOCK ────────────────────────────────────── */
        .iv-rules {
          background: var(--bg-deep);
          padding: clamp(56px, 7vw, 96px) clamp(20px, 4vw, 60px);
          border-top: 1px solid var(--rule-soft);
          border-bottom: 1px solid var(--rule-soft);
        }
        .iv-rules-grid {
          max-width: 1080px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1.2fr;
          gap: clamp(40px, 5vw, 80px); align-items: start;
        }
        @media (max-width: 720px) { .iv-rules-grid { grid-template-columns: 1fr; gap: 40px; } }
        .iv-rules-list { list-style: none; padding: 0; margin: 0; }
        .iv-rules-list li {
          font-family: 'Cinzel', serif;
          font-size: 12px; letter-spacing: 0.28em;
          color: var(--ink); text-transform: uppercase;
          padding: 16px 0;
          border-bottom: 1px solid var(--rule-soft);
        }
        .iv-rules-list li:last-child { border-bottom: none; }
        .iv-rules-list li::before {
          content: "—"; color: var(--ember); margin-right: 14px;
        }

        /* ─── PHILOSOPHY ────────────────────────────────────── */
        .iv-philosophy {
          text-align: center; max-width: 720px;
          margin: 0 auto;
        }
        .iv-philosophy .iv-p { font-size: clamp(19px, 1.7vw, 24px); }

        /* ─── BANNER ────────────────────────────────────────── */
        .iv-banner {
          background: linear-gradient(135deg, var(--bg-deep) 0%, rgba(164,116,51,0.08) 50%, var(--bg-deep) 100%);
          border-top: 1px solid var(--rule-soft);
          border-bottom: 1px solid var(--rule-soft);
          padding: clamp(56px, 7vw, 96px) clamp(20px, 4vw, 60px);
          text-align: center;
        }
        .iv-banner-eyebrow {
          font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.45em; color: var(--ember);
          text-transform: uppercase; margin: 0 0 16px;
        }
        .iv-banner-line {
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-size: clamp(18px, 1.6vw, 22px);
          color: var(--ink); margin: 0 0 22px;
        }
      `}</style>

      <Link to="/" className="iv-return" data-testid="iv-return"><ArrowLeft size={14} /> RETURN</Link>

      {/* 1. HERO */}
      <section className="iv-hero" data-testid="iv-hero">
        {/* Floating technical-sketch icons */}
        <svg className="iv-sketch iv-sketch--tl" width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" />
          <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="0.8" />
          <path d="M60 20 L60 100 M20 60 L100 60" stroke="currentColor" strokeWidth="0.5" />
        </svg>
        <svg className="iv-sketch iv-sketch--tr" width="100" height="140" viewBox="0 0 100 140" fill="none">
          <rect x="20" y="30" width="60" height="80" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 2" />
          <path d="M30 50 L70 50 M30 70 L70 70 M30 90 L70 90" stroke="currentColor" strokeWidth="0.4" />
        </svg>
        <svg className="iv-sketch iv-sketch--bl" width="140" height="100" viewBox="0 0 140 100" fill="none">
          <ellipse cx="70" cy="50" rx="55" ry="30" stroke="currentColor" strokeWidth="0.7" strokeDasharray="4 3" />
          <path d="M40 50 Q70 30 100 50" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
        <svg className="iv-sketch iv-sketch--br" width="110" height="110" viewBox="0 0 110 110" fill="none">
          <polygon points="55,15 95,85 15,85" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 4" />
          <circle cx="55" cy="65" r="14" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        <div className="iv-hero-inner" style={{ transform: `translateY(${heroParallax * 0.2}px)` }}>
          <div className="iv-keyhole" aria-hidden="true"><Lock size={20} /></div>
          <p className="iv-eyebrow">PHILEON · PRIVATE ARCHIVE</p>
          <h1 className="iv-h1" data-testid="iv-title">The Inspiration Vault</h1>
          <p className="iv-hero-tag" data-testid="iv-tag">The ideas before the icons.</p>
        </div>
      </section>

      {/* 2. INTRO */}
      <section className="iv-section" data-testid="iv-intro">
        <p className="iv-eyebrow">A WORD</p>
        <p className="iv-p">Before a collection exists, there are sketches.</p>
        <p className="iv-p">Before a signature piece exists, there are experiments.</p>
        <p className="iv-p"><em>The Inspiration Vault contains prototypes, samples, retired concepts, one-off creations, and design studies from the Phileon archive.</em></p>
        <div className="iv-divider" />
        <p className="iv-p">Some were made in alternative materials.</p>
        <p className="iv-p">Some were never released.</p>
        <p className="iv-p">Some helped shape what came next.</p>
        <p className="iv-p">Others simply deserved a second chance to be discovered.</p>
        <div className="iv-divider" />
        <p className="iv-p">These are not part of the permanent collection.</p>
        <p className="iv-p"><em>They are fragments of the journey.</em></p>
        <p className="iv-p">Once removed from the Vault, they do not return.</p>
      </section>

      {/* 3. WHAT YOU MAY FIND + ARCHIVE GRID */}
      <section className="iv-section" data-testid="iv-archive">
        <p className="iv-eyebrow">WHAT YOU MAY FIND</p>
        <h2 className="iv-h2">Every piece has a story.</h2>
        <p className="iv-p"><em>Not every story became a collection.</em></p>

        {ARCHIVE_ITEMS.length === 0 ? (
          <div className="iv-archive-empty" data-testid="iv-archive-empty">
            <Search className="iv-archive-empty-icon" size={64} />
            <p className="iv-eyebrow" style={{ margin: '0 0 14px' }}>VAULT INVENTORY UPDATES REGULARLY</p>
            <p className="iv-p" style={{ maxWidth: 560, margin: '0 auto 8px' }}>
              The atelier curates this archive by hand. New pieces enter the vault, and once they leave, they do not return.
            </p>
            <p className="iv-p" style={{ fontStyle: 'italic', color: 'var(--ink-muted)' }}>The first releases are coming soon.</p>

            <div className="iv-archive-cat-list">
              {VAULT_CATEGORIES.map((c) => (
                <div key={c} className="iv-archive-cat" data-testid={`iv-cat-${c.toLowerCase().replace(/\s+/g, '-')}`}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div data-testid="iv-archive-grid">{/* future inventory cards */}</div>
        )}
      </section>

      {/* 4. PRICING */}
      <section className="iv-section" data-testid="iv-pricing">
        <p className="iv-eyebrow">PRICING</p>
        <h2 className="iv-h2">Starting at $50 USD.</h2>
        <p className="iv-p">Most pieces range between <em>$50 — $200 USD</em>.</p>
        <p className="iv-p">Occasional archive pieces may exceed this range.</p>
      </section>

      {/* 5. VAULT RULES */}
      <section className="iv-rules" data-testid="iv-rules">
        <div className="iv-rules-grid">
          <div>
            <p className="iv-eyebrow">THE VAULT RULES</p>
            <h2 className="iv-h2">Once it leaves, it's gone.</h2>
          </div>
          <ul className="iv-rules-list">
            {VAULT_RULES.map((rule) => (
              <li key={rule} data-testid={`iv-rule-${rule.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}`}>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. PHILOSOPHY */}
      <section className="iv-section" data-testid="iv-philosophy">
        <div className="iv-philosophy">
          <p className="iv-eyebrow">BRAND PHILOSOPHY</p>
          <p className="iv-p">The Inspiration Vault exists to celebrate the creative process.</p>
          <p className="iv-p"><em>It allows collectors to own a piece of the journey.</em></p>
          <div className="iv-divider" style={{ margin: '40px auto' }} />
          <p className="iv-p">Not every design becomes an icon.</p>
          <p className="iv-p"><em>But every icon begins somewhere.</em></p>
        </div>
      </section>

      {/* 7. BANNER FOOTER */}
      <section className="iv-banner" data-testid="iv-banner">
        <p className="iv-banner-eyebrow">THE INSPIRATION VAULT</p>
        <h2 className="iv-h2" style={{ margin: '0 0 14px' }}>The ideas before the icons.</h2>
        <p className="iv-banner-line">Archive pieces, prototypes, and one-off creations.</p>
        <p className="iv-banner-line" style={{ color: 'var(--ember)', fontStyle: 'normal', fontFamily: "'Cinzel', serif", fontSize: 14, letterSpacing: '0.42em' }}>FROM $50 USD</p>
      </section>
    </div>
  );
}
