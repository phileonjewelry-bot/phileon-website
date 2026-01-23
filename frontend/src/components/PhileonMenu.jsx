import { useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { name: 'Shop', path: '/shop' },
  { name: 'Custom Jewelry', path: '/custom-design' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const PhileonMenu = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    if (isOpen) onClose();
  }, [location.pathname]);

  // ESC closes menu
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Click backdrop to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className={`ph-menu ${isOpen ? 'is-open' : ''}`}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      {/* Watermark monogram */}
      <div className="ph-menu__wm">P.</div>
      
      {/* Gold vault lines */}
      <div className="ph-menu__lines"></div>

      {/* Brand block */}
      <div className="ph-menu__brand">
        <img src="/logo.png" alt="Phileon" />
        <div>
          <div className="name">PHILEON</div>
          <div className="tag">Get Your Phileon</div>
        </div>
      </div>

      {/* Close button */}
      <button 
        className="ph-menu__close" 
        onClick={onClose}
        aria-label="Close menu"
        data-testid="menu-close-btn"
      >
        ✕
      </button>

      {/* Navigation panel */}
      <div 
        className="ph-menu__panel" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Site menu"
      >
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="ph-menu__link"
            data-testid={`menu-link-${link.name.toLowerCase().replace(' ', '-')}`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <div className="ph-menu__foot">Crafted in limited quantities.</div>
    </div>
  );
};

export default PhileonMenu;
