import { useEffect } from 'react';
import { X } from 'lucide-react';

const VaultModal = ({ isOpen, onClose }) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Placeholder drops for the vault
  const placeholderDrops = [
    { id: 1, status: 'coming-soon' },
    { id: 2, status: 'coming-soon' },
    { id: 3, status: 'coming-soon' },
  ];

  return (
    <div
      className="vault-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-testid="vault-modal"
    >
      <div className="vault-modal-content">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="vault-close-btn"
          aria-label="Close vault"
          data-testid="vault-close-btn"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Vault Header */}
        <div className="vault-header">
          <p className="vault-eyebrow">SECRET ACCESS</p>
          <h1 className="vault-title">THE PHILEON VAULT</h1>
          <p className="vault-subtitle">DREW'S WORLD</p>
          <p className="vault-supporting">Exclusive drops live here.</p>
        </div>

        {/* Vault Content */}
        <div className="vault-content">
          <p className="vault-section-title">Exclusive Drops</p>
          
          <div className="vault-drops-grid">
            {placeholderDrops.map((drop) => (
              <div key={drop.id} className="vault-drop-card">
                <div className="vault-drop-placeholder">
                  <div className="vault-drop-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <p className="vault-drop-status">Coming Soon</p>
                </div>
              </div>
            ))}
          </div>

          <p className="vault-footer-text">
            Reserved for those who seek what others overlook.
          </p>
        </div>
      </div>

      <style>{`
        .vault-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: vaultFadeIn 300ms ease-out;
        }

        @keyframes vaultFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .vault-modal-content {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 100vw;
          max-height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 24px 48px;
        }

        .vault-close-btn {
          position: fixed;
          top: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(199, 162, 75, 0.1);
          border: 1px solid rgba(199, 162, 75, 0.3);
          color: #C7A24B;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 200ms ease;
          z-index: 10;
        }

        .vault-close-btn:hover {
          background: rgba(199, 162, 75, 0.2);
          border-color: rgba(199, 162, 75, 0.5);
          transform: scale(1.05);
        }

        .vault-header {
          text-align: center;
          margin-bottom: 64px;
          animation: vaultSlideUp 400ms ease-out 100ms both;
        }

        @keyframes vaultSlideUp {
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
          color: rgba(199, 162, 75, 0.7);
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        .vault-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 6vw, 48px);
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #C7A24B;
          margin-bottom: 12px;
        }

        .vault-subtitle {
          font-size: 14px;
          letter-spacing: 0.3em;
          color: rgba(199, 162, 75, 0.9);
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .vault-supporting {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }

        .vault-content {
          width: 100%;
          max-width: 800px;
          animation: vaultSlideUp 400ms ease-out 200ms both;
        }

        .vault-section-title {
          font-size: 11px;
          letter-spacing: 0.35em;
          color: rgba(199, 162, 75, 0.6);
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 32px;
        }

        .vault-drops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .vault-drop-card {
          aspect-ratio: 1;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(199, 162, 75, 0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 300ms ease;
        }

        .vault-drop-card:hover {
          border-color: rgba(199, 162, 75, 0.3);
          background: rgba(199, 162, 75, 0.05);
        }

        .vault-drop-placeholder {
          text-align: center;
        }

        .vault-drop-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          color: rgba(199, 162, 75, 0.3);
        }

        .vault-drop-icon svg {
          width: 100%;
          height: 100%;
        }

        .vault-drop-status {
          font-size: 11px;
          letter-spacing: 0.2em;
          color: rgba(199, 162, 75, 0.5);
          text-transform: uppercase;
        }

        .vault-footer-text {
          text-align: center;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.3);
          font-style: italic;
        }

        @media (max-width: 640px) {
          .vault-modal-content {
            padding: 72px 16px 32px;
          }

          .vault-close-btn {
            top: 16px;
            right: 16px;
            width: 44px;
            height: 44px;
          }

          .vault-header {
            margin-bottom: 48px;
          }

          .vault-drops-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default VaultModal;
