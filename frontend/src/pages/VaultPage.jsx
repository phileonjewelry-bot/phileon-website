import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const VaultPage = () => {
  // Placeholder exclusive drops
  const exclusiveDrops = [
    {
      id: 'drew-face',
      name: 'DREW FACE™',
      status: 'live',
      href: '/vault/drew-face',
      badge: 'LIVE',
      tagline: 'A face drawn from sketch to gold.',
      image: '/vault/drew-face/drew-face-teaser.webp',
    },
    { id: 2, name: 'Coming Soon', status: 'unreleased' },
    { id: 3, name: 'Coming Soon', status: 'unreleased' },
  ];

  // Hero image URL
  const heroImageUrl = "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/pj7qgxix_1000141809.png";

  return (
    <div className="vault-page" data-testid="vault-page">
      {/* Back Navigation */}
      <Link to="/" className="vault-back-btn" data-testid="vault-back-btn">
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Shop</span>
      </Link>

      {/* Animated Hero Header */}
      <section className="vault-hero">
        <div className="vault-hero-glow" />
        <div className="vault-hero-image-container">
          <img 
            src={heroImageUrl} 
            alt="PHILEON X Drew's World" 
            className="vault-hero-image"
          />
          <div className="vault-hero-shimmer" />
        </div>
        <div className="vault-hero-particles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="vault-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </section>

      {/* Vault Header Text */}
      <header className="vault-header">
        <p className="vault-eyebrow">SECRET ACCESS</p>
        <h1 className="vault-title">THE PHILEON VAULT</h1>
        <div className="vault-divider" />
        <p className="vault-tagline">Exclusive drops live here.</p>
      </header>

      {/* Exclusive Drops Section */}
      <section className="vault-drops-section">
        <h2 className="vault-section-title">Exclusive Drops</h2>
        
        <div className="vault-drops-grid">
          {exclusiveDrops.map((drop) => {
            const isLive = drop.status === 'live';
            const hasImage = !!drop.image;

            const inner = hasImage ? (
              <div className="vault-drop-teaser">
                <div className="vault-drop-teaser-img-wrap">
                  <img
                    src={drop.image}
                    alt={drop.name}
                    className="vault-drop-teaser-img"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <div className="vault-drop-teaser-copy">
                  <div className="vault-drop-teaser-headline">
                    <h3 className="vault-drop-teaser-name">{drop.name}</h3>
                    {drop.tagline && <p className="vault-drop-teaser-tagline">{drop.tagline}</p>}
                  </div>
                  <span className="vault-drop-teaser-cta" aria-hidden="true">
                    ENTER <span className="vault-drop-teaser-arrow">→</span>
                  </span>
                </div>
                <span className={`vault-drop-badge vault-drop-badge--live vault-drop-badge--floating`}>
                  {drop.badge || 'LIVE'}
                </span>
              </div>
            ) : (
              <div className="vault-drop-inner">
                <div className="vault-drop-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <p className="vault-drop-name">{drop.name}</p>
                {drop.byline && <p className="vault-drop-byline">{drop.byline}</p>}
                <span className={`vault-drop-badge${isLive ? ' vault-drop-badge--live' : ''}`}>
                  {drop.badge || 'UNRELEASED'}
                </span>
              </div>
            );

            return isLive ? (
              <Link
                to={drop.href}
                key={drop.id}
                className={`vault-drop-card vault-drop-card--live${hasImage ? ' vault-drop-card--teaser' : ''}`}
                data-testid={`vault-drop-${drop.id}`}
              >
                {inner}
              </Link>
            ) : (
              <div key={drop.id} className="vault-drop-card">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Message */}
      <footer className="vault-footer">
        <p className="vault-footer-text">
          Reserved for those who seek what others overlook.
        </p>
        <p className="vault-footer-sub">
          Check back for exclusive releases.
        </p>
      </footer>

      <style>{`
        .vault-page {
          min-height: 100vh;
          background: #000;
          color: #fff;
          padding-bottom: 60px;
          overflow-x: hidden;
        }

        .vault-back-btn {
          position: fixed;
          top: 80px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(199, 162, 75, 0.7);
          font-size: 12px;
          letter-spacing: 0.1em;
          text-decoration: none;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .vault-back-btn:hover {
          color: #C7A24B;
        }

        /* ========== ANIMATED HERO ========== */
        .vault-hero {
          position: relative;
          width: 100%;
          padding-top: 60px;
          margin-bottom: 40px;
          overflow: hidden;
        }

        .vault-hero-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120%;
          height: 120%;
          background: radial-gradient(
            ellipse at center,
            rgba(199, 162, 75, 0.15) 0%,
            rgba(199, 162, 75, 0.05) 40%,
            transparent 70%
          );
          animation: glowPulse 4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        .vault-hero-image-container {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .vault-hero-image {
          width: 100%;
          height: auto;
          display: block;
          animation: heroFloat 6s ease-in-out infinite, heroReveal 1s ease-out;
          filter: drop-shadow(0 0 30px rgba(199, 162, 75, 0.3));
        }

        @keyframes heroFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.01); }
        }

        @keyframes heroReveal {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95);
            filter: blur(10px) drop-shadow(0 0 30px rgba(199, 162, 75, 0.3));
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            filter: blur(0) drop-shadow(0 0 30px rgba(199, 162, 75, 0.3));
          }
        }

        .vault-hero-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmerMove 4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes shimmerMove {
          0%, 100% { left: -100%; }
          50% { left: 150%; }
        }

        .vault-hero-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .vault-particle {
          position: absolute;
          bottom: -10px;
          width: 4px;
          height: 4px;
          background: rgba(199, 162, 75, 0.6);
          border-radius: 50%;
          animation: particleRise linear infinite;
          box-shadow: 0 0 6px rgba(199, 162, 75, 0.8);
        }

        @keyframes particleRise {
          0% { 
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateY(-400px) scale(0);
            opacity: 0;
          }
        }

        /* ========== VAULT HEADER ========== */
        .vault-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 80px;
          padding: 0 24px;
          animation: fadeInUp 0.6s ease-out 0.3s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .vault-eyebrow {
          font-size: 10px;
          letter-spacing: 0.4em;
          color: rgba(199, 162, 75, 0.6);
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        .vault-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 7vw, 48px);
          font-weight: 400;
          letter-spacing: 0.12em;
          color: #C7A24B;
          margin-bottom: 24px;
          line-height: 1.1;
        }

        .vault-divider {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(199, 162, 75, 0.5), transparent);
          margin: 0 auto 24px;
        }

        .vault-tagline {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
        }

        /* ========== DROPS SECTION ========== */
        .vault-drops-section {
          max-width: 900px;
          margin: 0 auto 80px;
          padding: 0 24px;
          animation: fadeInUp 0.6s ease-out 0.5s both;
        }

        .vault-section-title {
          font-size: 11px;
          letter-spacing: 0.35em;
          color: rgba(199, 162, 75, 0.5);
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 40px;
        }

        .vault-drops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .vault-drop-card {
          aspect-ratio: 1;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(199, 162, 75, 0.12);
          border-radius: 8px;
          transition: all 0.3s ease;
          cursor: default;
        }

        .vault-drop-card:hover {
          border-color: rgba(199, 162, 75, 0.25);
          background: rgba(199, 162, 75, 0.03);
          transform: translateY(-4px);
        }

        .vault-drop-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          text-align: center;
        }

        .vault-drop-icon {
          width: 56px;
          height: 56px;
          margin-bottom: 20px;
          color: rgba(199, 162, 75, 0.25);
        }

        .vault-drop-icon svg {
          width: 100%;
          height: 100%;
        }

        .vault-drop-name {
          font-size: 14px;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .vault-drop-badge {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: rgba(199, 162, 75, 0.5);
          padding: 6px 12px;
          border: 1px solid rgba(199, 162, 75, 0.2);
          border-radius: 2px;
        }

        .vault-drop-card--live { text-decoration: none; cursor: pointer; }
        .vault-drop-card--live .vault-drop-name { color: rgba(245, 228, 172, 0.98); }
        .vault-drop-card--live:hover { border-color: rgba(199, 162, 75, 0.65); }
        .vault-drop-card--live:hover .vault-drop-icon { color: rgba(245, 228, 172, 1); }

        /* ═════ TEASER VARIANT ═════════════════════════════ */
        .vault-drop-card--teaser {
          aspect-ratio: auto;
          background: #050505;
          border: 1px solid rgba(199, 162, 75, 0.22);
          overflow: hidden;
          position: relative;
          border-radius: 8px;
          min-height: 540px;
        }
        @media (max-width: 768px) {
          .vault-drop-card--teaser { min-height: 460px; }
        }
        .vault-drop-card--teaser:hover {
          border-color: rgba(199, 162, 75, 0.65);
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.55);
        }
        .vault-drop-teaser {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
        }
        .vault-drop-teaser-img-wrap {
          position: relative;
          flex: 1 1 auto;
          min-height: 420px;
          overflow: hidden;
          background: #050505;
          display: flex; align-items: center; justify-content: center;
        }
        @media (max-width: 768px) {
          .vault-drop-teaser-img-wrap { min-height: 320px; }
        }
        .vault-drop-teaser-img-wrap::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 70%, rgba(5,5,5,0.45) 100%);
          pointer-events: none;
        }
        .vault-drop-teaser-img {
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: center center;
          display: block;
          transition:
            transform 700ms cubic-bezier(0.22,1,0.36,1),
            filter 700ms cubic-bezier(0.22,1,0.36,1);
        }
        .vault-drop-card--teaser:hover .vault-drop-teaser-img {
          transform: scale(1.03);
          filter: brightness(1.06) saturate(1.06);
        }
        .vault-drop-teaser-copy {
          position: relative;
          padding: 22px 24px 22px;
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 16px;
          background: linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.9) 100%);
        }
        .vault-drop-teaser-headline { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .vault-drop-teaser-name {
          margin: 0;
          font-family: 'Bebas Neue', 'Cinzel', serif; font-weight: 500;
          font-size: 22px; letter-spacing: 0.04em;
          color: rgba(245, 228, 172, 0.98);
          text-transform: uppercase;
        }
        .vault-drop-teaser-tagline {
          margin: 0;
          font-family: 'Cormorant Garamond', serif; font-style: italic;
          font-weight: 300; font-size: 13px;
          color: rgba(240, 232, 210, 0.6);
          line-height: 1.35;
        }
        .vault-drop-teaser-cta {
          flex-shrink: 0;
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Bebas Neue', sans-serif; font-size: 11.5px;
          letter-spacing: 0.36em; color: rgba(199, 162, 75, 0.85);
          padding-top: 6px;
          transition: color 320ms ease, gap 320ms cubic-bezier(0.22,1,0.36,1);
        }
        .vault-drop-card--teaser:hover .vault-drop-teaser-cta {
          color: rgba(245, 228, 172, 1);
          gap: 14px;
        }
        .vault-drop-teaser-arrow {
          display: inline-block;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1);
        }
        .vault-drop-card--teaser:hover .vault-drop-teaser-arrow {
          transform: translateX(4px);
        }
        .vault-drop-badge--floating {
          position: absolute; top: 14px; right: 14px;
          background: rgba(8,8,8,0.6);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }

        .vault-drop-byline {
          margin: 4px 0 12px 0;
          font-size: 11px; letter-spacing: 0.1em;
          color: rgba(199, 162, 75, 0.55);
          font-style: italic;
        }

        .vault-drop-badge--live {
          color: rgba(245, 228, 172, 1);
          border-color: rgba(199, 162, 75, 0.7);
          background: rgba(199, 162, 75, 0.08);
        }
        .vault-drop-badge--live::before {
          content: "● ";
          color: rgba(214, 52, 52, 0.95);
          animation: vaultLivePulse 1.6s ease-in-out infinite;
        }
        @keyframes vaultLivePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

        /* ========== FOOTER ========== */
        .vault-footer {
          text-align: center;
          padding: 40px 24px 60px;
          animation: fadeInUp 0.6s ease-out 0.7s both;
        }

        .vault-footer-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.3);
          font-style: italic;
          margin-bottom: 12px;
        }

        .vault-footer-sub {
          font-size: 11px;
          letter-spacing: 0.15em;
          color: rgba(199, 162, 75, 0.4);
          text-transform: uppercase;
        }

        /* ========== MOBILE ========== */
        @media (max-width: 640px) {
          .vault-back-btn {
            top: 70px;
            left: 16px;
          }

          .vault-hero {
            padding-top: 50px;
            margin-bottom: 24px;
          }

          .vault-hero-image-container {
            padding: 0 12px;
          }

          .vault-header {
            margin-bottom: 60px;
          }

          .vault-drops-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .vault-drop-card {
            aspect-ratio: auto;
            min-height: 180px;
          }
        }
      `}</style>
    </div>
  );
};

export default VaultPage;
