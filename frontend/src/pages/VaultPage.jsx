import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const VaultPage = () => {
  // Placeholder exclusive drops
  const exclusiveDrops = [
    { id: 1, name: 'Coming Soon', status: 'unreleased' },
    { id: 2, name: 'Coming Soon', status: 'unreleased' },
    { id: 3, name: 'Coming Soon', status: 'unreleased' },
  ];

  return (
    <div className="vault-page" data-testid="vault-page">
      {/* Back Navigation */}
      <Link to="/" className="vault-back-btn" data-testid="vault-back-btn">
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Shop</span>
      </Link>

      {/* Vault Header */}
      <header className="vault-header">
        <p className="vault-eyebrow">SECRET ACCESS</p>
        <h1 className="vault-title">THE PHILEON VAULT</h1>
        <p className="vault-subtitle">DREW'S WORLD</p>
        <div className="vault-divider" />
        <p className="vault-tagline">Exclusive drops live here.</p>
      </header>

      {/* Exclusive Drops Section */}
      <section className="vault-drops-section">
        <h2 className="vault-section-title">Exclusive Drops</h2>
        
        <div className="vault-drops-grid">
          {exclusiveDrops.map((drop) => (
            <div key={drop.id} className="vault-drop-card">
              <div className="vault-drop-inner">
                <div className="vault-drop-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <p className="vault-drop-name">{drop.name}</p>
                <span className="vault-drop-badge">UNRELEASED</span>
              </div>
            </div>
          ))}
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
          padding: 24px;
          padding-top: 100px;
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

        .vault-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 80px;
          animation: fadeInUp 0.6s ease-out;
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
          font-size: clamp(32px, 8vw, 56px);
          font-weight: 400;
          letter-spacing: 0.12em;
          color: #C7A24B;
          margin-bottom: 12px;
          line-height: 1.1;
        }

        .vault-subtitle {
          font-size: 14px;
          letter-spacing: 0.35em;
          color: rgba(199, 162, 75, 0.9);
          text-transform: uppercase;
          margin-bottom: 24px;
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

        .vault-drops-section {
          max-width: 900px;
          margin: 0 auto 80px;
          animation: fadeInUp 0.6s ease-out 0.2s both;
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

        .vault-footer {
          text-align: center;
          padding: 40px 24px 60px;
          animation: fadeInUp 0.6s ease-out 0.4s both;
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

        @media (max-width: 640px) {
          .vault-page {
            padding: 16px;
            padding-top: 90px;
          }

          .vault-back-btn {
            top: 70px;
            left: 16px;
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
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default VaultPage;
