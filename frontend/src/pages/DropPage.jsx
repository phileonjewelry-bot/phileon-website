/* =========================
   PHILEON DROP PAGE (DESKTOP ONLY SURPRISE DROP)
   ========================= */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Sketchbook background component
const SketchbookBG = () => (
  <div className="drop-sketchbook-bg">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(201,162,77,0.06)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

// Unlock Glitch Hero component
const UnlockGlitchHero = ({ src, alt }) => {
  const [revealed, setRevealed] = useState(false);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    // Auto-reveal after a delay with glitch effect
    const timer = setTimeout(() => {
      setGlitching(true);
      setTimeout(() => {
        setRevealed(true);
        setGlitching(false);
      }, 800);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`drop-hero-image ${glitching ? 'is-glitching' : ''} ${revealed ? 'is-revealed' : ''}`}>
      {!revealed && (
        <div className="drop-hero-locked">
          <div className="drop-hero-lock-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p className="drop-hero-lock-text">UNLOCKING DROP...</p>
        </div>
      )}
      <img 
        src={src || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"} 
        alt={alt}
        className={`drop-hero-img ${revealed ? 'visible' : ''}`}
      />
      {glitching && (
        <div className="drop-glitch-overlay">
          <div className="drop-glitch-line" style={{ top: '20%' }} />
          <div className="drop-glitch-line" style={{ top: '45%' }} />
          <div className="drop-glitch-line" style={{ top: '70%' }} />
        </div>
      )}
    </div>
  );
};

export default function DropPage() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Mobile fallback
  if (!isDesktop) {
    return (
      <main className="drop-mobile-fallback" data-testid="drop-mobile">
        <div className="drop-mobile-card">
          <h1 className="drop-mobile-title">This drop is desktop-only.</h1>
          <p className="drop-mobile-sub">Open on a laptop/desktop to unlock it.</p>
          <Link to="/shop" className="drop-mobile-cta">
            Browse Shop Instead
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="drop-page" data-testid="drop-desktop">
      <SketchbookBG />

      {/* Top editorial bar */}
      <header className="drop-top-bar">
        <Link to="/" className="drop-brand-stamp">
          <span className="drop-brand-mono">P</span>
          <span className="drop-brand-word">PHILEON</span>
        </Link>
        <span className="drop-micro">DROP 001 — CHECKER PAVÉ SET</span>
      </header>

      {/* Hero Section */}
      <section className="drop-hero">
        <div className="drop-hero-frame">
          <UnlockGlitchHero
            src="/images/drop-001.png"
            alt="Phileon Drop 001"
          />
          
          <div className="drop-caption-wrap">
            <div className="drop-gold-line" />
            <p className="drop-caption">
              White diamonds / Black diamonds / Hand-set / Architectural finish
            </p>
          </div>

          <div className="drop-actions">
            <button className="drop-primary-btn" data-testid="claim-drop-btn">
              CLAIM THIS DROP
            </button>
            <button className="drop-secondary-btn" data-testid="view-details-btn">
              VIEW DETAILS
            </button>
          </div>

          {/* Bottom right stamp */}
          <div className="drop-stamp">
            <div className="drop-stamp-mark">P</div>
            <div className="drop-stamp-text">
              <div className="drop-stamp-word">PHILEON</div>
              <div className="drop-stamp-tag">GET YOUR PHILEON</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer micro text */}
      <footer className="drop-footer">
        <span>Limited quantity. When it's gone, it's archived.</span>
      </footer>
    </main>
  );
}
