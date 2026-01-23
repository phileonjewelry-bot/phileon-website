/* =========================
   PHILEON DROP PAGE (DESKTOP ONLY SURPRISE DROP)
   Light sketchbook aesthetic with unlock glitch effect
   ========================= */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

/* ===== Sketchbook Background ===== */
function SketchbookBG() {
  return (
    <div aria-hidden="true" style={styles.bgWrap}>
      <div style={styles.grid} />
      <div style={styles.hatch1} />
      <div style={styles.hatch2} />
      <div style={styles.paperNoise} />
    </div>
  );
}

/* ===== Hero with "unlock" glitch effect ===== */
function UnlockGlitchHero({ src, alt }) {
  const [on, setOn] = useState(false);
  const blue = "#2F6BFF";

  const trigger = () => {
    setOn(true);
    window.setTimeout(() => setOn(false), 650);
  };

  const imgStyle = useMemo(
    () => ({
      width: "100%",
      height: "auto",
      display: "block",
      borderRadius: 18,
      boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
      transform: on ? "translateZ(0) scale(1.004)" : "translateZ(0) scale(1)",
      transition: "transform 300ms ease",
    }),
    [on]
  );

  return (
    <div style={styles.heroMedia} onClick={trigger} onMouseEnter={trigger}>
      <img 
        src={src || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80"} 
        alt={alt} 
        style={imgStyle}
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80";
        }}
      />

      {/* Scanline */}
      <div
        style={{
          ...styles.scanline,
          opacity: on ? 1 : 0,
          background: `linear-gradient(180deg, transparent, rgba(47,107,255,0.45), transparent)`,
          animation: on ? "scan 650ms ease-out forwards" : "none",
        }}
      />

      {/* Chromatic shift (blue only) */}
      <div
        style={{
          ...styles.chromatic,
          opacity: on ? 1 : 0,
          boxShadow: `0 0 0 2px rgba(47,107,255,0.18), 0 0 60px rgba(47,107,255,0.12)`,
        }}
      />

      {/* Corner UI glitch markers */}
      <div style={{ ...styles.cornerTL, borderColor: on ? blue : "rgba(0,0,0,0.12)" }} />
      <div style={{ ...styles.cornerBR, borderColor: on ? blue : "rgba(0,0,0,0.12)" }} />
    </div>
  );
}

/* ===== Main Drop Page Component ===== */
export default function DropPage() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      setIsDesktop(!isMobile);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Mobile fallback
  if (!isDesktop) {
    return (
      <main style={styles.baseWrap} data-testid="drop-mobile-fallback">
        <SketchbookBG />
        <div style={styles.card}>
          <h1 style={styles.title}>This drop is desktop-only.</h1>
          <p style={styles.sub}>Open on a laptop/desktop to unlock it.</p>
          <Link to="/m-drop" style={styles.cta}>Go to mobile drop</Link>
        </div>
        <style>{globalStyles}</style>
      </main>
    );
  }

  return (
    <main style={styles.baseWrap} data-testid="drop-desktop">
      <SketchbookBG />

      {/* Top editorial bar */}
      <header style={styles.topBar}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={styles.brandStamp}>
            <span style={styles.mono}>P</span>
            <span style={styles.brandWord}>PHILEON</span>
          </div>
        </Link>
        <span style={styles.micro}>DROP 001 — CHECKER PAVÉ SET</span>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroFrame}>
          <UnlockGlitchHero
            src="/images/drop-001.png"
            alt="Phileon Drop 001"
          />
          
          <div style={styles.captionWrap}>
            <div style={styles.goldLine} />
            <p style={styles.caption}>
              White diamonds / Black diamonds / Hand-set / Architectural finish
            </p>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.primaryBtn}
              onClick={() => alert("Drop action goes here (checkout / claim).")}
              data-testid="claim-drop-btn"
            >
              CLAIM THIS DROP
            </button>
            <button
              style={styles.secondaryBtn}
              onClick={() => alert("Open details modal / page.")}
              data-testid="view-details-btn"
            >
              VIEW DETAILS
            </button>
          </div>

          {/* Bottom right stamp */}
          <div style={styles.stampBottomRight}>
            <div style={styles.stampMark}>P</div>
            <div style={styles.stampText}>
              <div style={styles.stampWord}>PHILEON</div>
              <div style={styles.stampTag}>GET YOUR PHILEON</div>
            </div>
          </div>
        </div>
      </section>

      <style>{globalStyles}</style>
    </main>
  );
}

/* ===== Global Styles (injected) ===== */
const globalStyles = `
  @keyframes scan {
    0% { top: -40%; opacity: 0; }
    10% { opacity: 1; }
    100% { top: 140%; opacity: 0; }
  }
`;

/* ===== Inline Styles Object ===== */
const styles = {
  baseWrap: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background: "#f4f2ee",
    color: "#111",
  },

  bgWrap: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  },

  grid: {
    position: "absolute",
    inset: 0,
    opacity: 0.25,
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
  },

  hatch1: {
    position: "absolute",
    left: "-10%",
    top: "15%",
    width: "65%",
    height: "45%",
    transform: "rotate(-8deg)",
    opacity: 0.12,
    backgroundImage:
      "repeating-linear-gradient(135deg, rgba(0,0,0,0.20) 0px, rgba(0,0,0,0.20) 1px, transparent 1px, transparent 8px)",
  },

  hatch2: {
    position: "absolute",
    right: "-12%",
    bottom: "10%",
    width: "70%",
    height: "50%",
    transform: "rotate(10deg)",
    opacity: 0.10,
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 9px)",
  },

  paperNoise: {
    position: "absolute",
    inset: 0,
    opacity: 0.18,
    backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)",
    backgroundSize: "3px 3px",
    mixBlendMode: "multiply",
  },

  topBar: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px 0",
  },

  brandStamp: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
  },

  mono: {
    display: "inline-flex",
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #d1b15f, #8d6e2b)",
    color: "#111",
    fontWeight: 800,
    letterSpacing: 1,
    fontSize: 14,
  },

  brandWord: {
    fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
    letterSpacing: "0.36em",
    fontSize: 14,
    opacity: 0.9,
  },

  micro: {
    fontSize: 12,
    letterSpacing: "0.22em",
    opacity: 0.7,
  },

  hero: {
    position: "relative",
    zIndex: 2,
    padding: "36px 28px 60px",
    display: "flex",
    justifyContent: "center",
  },

  heroFrame: {
    width: "min(980px, 100%)",
    position: "relative",
    padding: "22px",
    borderRadius: 24,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(244,242,238,0.60)",
    backdropFilter: "blur(6px)",
  },

  heroMedia: {
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
    cursor: "pointer",
  },

  scanline: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "-40%",
    height: "40%",
    pointerEvents: "none",
  },

  chromatic: {
    position: "absolute",
    inset: 0,
    borderRadius: 18,
    transition: "opacity 180ms ease",
    pointerEvents: "none",
  },

  cornerTL: {
    position: "absolute",
    left: 14,
    top: 14,
    width: 18,
    height: 18,
    borderLeft: "2px solid rgba(0,0,0,0.12)",
    borderTop: "2px solid rgba(0,0,0,0.12)",
    borderRadius: 4,
    pointerEvents: "none",
    transition: "border-color 200ms ease",
  },

  cornerBR: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 18,
    height: 18,
    borderRight: "2px solid rgba(0,0,0,0.12)",
    borderBottom: "2px solid rgba(0,0,0,0.12)",
    borderRadius: 4,
    pointerEvents: "none",
    transition: "border-color 200ms ease",
  },

  captionWrap: {
    marginTop: 18,
  },

  goldLine: {
    width: 86,
    height: 2,
    background: "linear-gradient(90deg, #d1b15f, #8d6e2b)",
    borderRadius: 2,
    opacity: 0.9,
    marginBottom: 10,
  },

  caption: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    letterSpacing: "0.06em",
    opacity: 0.8,
  },

  actions: {
    marginTop: 18,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  primaryBtn: {
    padding: "14px 18px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "linear-gradient(180deg, #d1b15f, #a88338)",
    color: "#111",
    letterSpacing: "0.14em",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  secondaryBtn: {
    padding: "14px 18px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "transparent",
    color: "#111",
    letterSpacing: "0.14em",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  stampBottomRight: {
    position: "absolute",
    right: 18,
    bottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 10,
    opacity: 0.85,
  },

  stampMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    letterSpacing: 1,
    fontSize: 14,
  },

  stampText: { 
    lineHeight: 1.1 
  },

  stampWord: {
    fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
    letterSpacing: "0.34em",
    fontSize: 12,
  },

  stampTag: {
    letterSpacing: "0.22em",
    fontSize: 10,
    opacity: 0.75,
  },

  card: {
    maxWidth: 560,
    margin: "12vh auto 0",
    padding: 22,
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(244,242,238,0.86)",
    position: "relative",
    zIndex: 2,
    textAlign: "center",
  },

  title: {
    margin: 0,
    fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
    letterSpacing: "0.10em",
    fontSize: 24,
  },

  sub: {
    margin: "10px 0 0",
    opacity: 0.75,
    lineHeight: 1.6,
  },

  cta: {
    display: "inline-block",
    marginTop: 16,
    padding: "12px 16px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.15)",
    textDecoration: "none",
    letterSpacing: "0.12em",
    fontWeight: 700,
    color: "#111",
    background: "transparent",
  },
};
