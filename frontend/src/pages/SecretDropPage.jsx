/* =========================
   PHILEON SECRET DROP PAGE
   Hidden exclusive drop - invitation only
   ========================= */

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './SecretDrop.module.css';

export default function SecretDropPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [shake, setShake] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  // Secret code to unlock
  const SECRET_CODE = 'PHILEON';

  // Glitch effect on page load
  useEffect(() => {
    setGlitchActive(true);
    const timer = setTimeout(() => setGlitchActive(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Handle code submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (code.toUpperCase() === SECRET_CODE) {
      setGlitchActive(true);
      setTimeout(() => {
        setUnlocked(true);
        setGlitchActive(false);
      }, 800);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [code]);

  // Trigger blue pulse
  const triggerPulse = () => {
    const el = document.createElement('div');
    el.className = styles.bluePulse;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  };

  return (
    <main className={styles.page}>
      {/* Animated background */}
      <div className={styles.bgGrid} />
      <div className={styles.bgNoise} />
      <div className={styles.bgGlow} />

      {/* Glitch overlay */}
      {glitchActive && (
        <div className={styles.glitchOverlay}>
          <div className={styles.scanline} />
          <div className={styles.chromatic} />
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMono}>P</span>
          <span className={styles.brandWord}>PHILEON</span>
        </Link>
        <span className={styles.headerMicro}>SECRET ACCESS</span>
      </header>

      {!unlocked ? (
        /* Locked State */
        <section className={styles.lockSection}>
          <div className={styles.lockIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1"/>
            </svg>
          </div>

          <h1 className={styles.title}>CLASSIFIED</h1>
          <p className={styles.subtitle}>This drop requires an access code.</p>

          <form onSubmit={handleSubmit} className={styles.codeForm}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ENTER CODE"
              className={`${styles.codeInput} ${shake ? styles.shake : ''}`}
              autoComplete="off"
              spellCheck="false"
              data-testid="secret-code-input"
            />
            <button 
              type="submit" 
              className={styles.submitBtn}
              onClick={triggerPulse}
              data-testid="secret-submit-btn"
            >
              UNLOCK
            </button>
          </form>

          <p className={styles.hint}>
            Hint: The brand name unlocks everything.
          </p>
        </section>
      ) : (
        /* Unlocked State */
        <section className={styles.unlockedSection}>
          <div className={styles.badge}>
            <span className={styles.badgeText}>ACCESS GRANTED</span>
          </div>

          <h1 className={styles.dropTitle}>SECRET DROP</h1>
          <p className={styles.dropCode}>DROP_X_001</p>

          <div className={styles.productFrame}>
            <div className={styles.productImageWrap}>
              <img 
                src="https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80"
                alt="Secret Drop Piece"
                className={styles.productImage}
              />
              <div className={styles.cornerTL} />
              <div className={styles.cornerBR} />
            </div>

            <div className={styles.productInfo}>
              <div className={styles.goldLine} />
              <h2 className={styles.productName}>The Phantom Ring</h2>
              <p className={styles.productMeta}>
                Black Rhodium / VS1 Black Diamonds / Hand-forged
              </p>
              <p className={styles.productDesc}>
                An object that doesn't exist in any catalog. 
                Released only to those who found this page.
              </p>
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.claimBtn}
                onClick={() => {
                  triggerPulse();
                  alert('Claim request submitted. You will be contacted directly.');
                }}
                data-testid="secret-claim-btn"
              >
                CLAIM THIS DROP
              </button>
              <button 
                className={styles.detailsBtn}
                data-testid="secret-details-btn"
              >
                VIEW DETAILS
              </button>
            </div>
          </div>

          <div className={styles.stampWrap}>
            <div className={styles.stamp}>
              <div className={styles.stampMark}>P</div>
              <div className={styles.stampText}>
                <div className={styles.stampWord}>PHILEON</div>
                <div className={styles.stampTag}>INVITATION ONLY</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <span>This page doesn't exist.</span>
      </footer>
    </main>
  );
}
