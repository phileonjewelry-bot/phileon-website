import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

// Navigation structure with categories
const menuCategories = [
  {
    name: 'Ladies First',
    items: [
      { name: 'Rings', path: '/shop?category=rings' },
      { name: 'Earrings', path: '/shop?category=earrings' },
      { name: 'Bracelets / Cuffs', path: '/shop?category=bracelets' },
      { name: 'Pendants', path: '/shop?category=pendants' },
    ]
  },
  {
    name: "The Gentleman's Club",
    items: [
      { name: 'Rings', path: '/shop?category=mens-rings' },
      { name: 'Earrings', path: '/shop?category=mens-earrings' },
      { name: 'Bracelets / Cuffs', path: '/shop?category=mens-bracelets' },
      { name: 'Pendants', path: '/shop?category=mens-pendants' },
    ]
  },
  {
    name: 'The Collective',
    items: [
      { name: 'PTP Cuff', path: '/products/ptp-cuff' },
      { name: 'Rosaria', path: '/products/rosaria' },
      { name: 'La Marva', path: '/products/la-marva' },
      { name: 'Monika Couture', path: '/products/monika-couture' },
      { name: 'Alejandra Heels', path: '/products/alejandra-heels' },
    ]
  },
];

const PhileonMenu = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
      setExpandedCategory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Toggle category expansion
  const toggleCategory = (categoryName) => {
    setExpandedCategory(prev => prev === categoryName ? null : categoryName);
  };

  // Handle link click - close menu
  const handleLinkClick = () => {
    setExpandedCategory(null);
    onClose();
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
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close menu"
        data-testid="menu-close-btn"
      >
        ✕
      </button>

      {/* Navigation panel with categories */}
      <div 
        className="ph-menu__panel" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Site menu"
      >
        {menuCategories.map((category, idx) => (
          <div key={category.name} className="ph-menu__category-wrapper">
            {/* Category header button */}
            <button
              onClick={() => toggleCategory(category.name)}
              className="ph-menu__link ph-menu__category-btn"
              data-testid={`menu-category-${idx}`}
            >
              <span>{category.name}</span>
              <ChevronDown 
                className={`ph-menu__chevron ${expandedCategory === category.name ? 'ph-menu__chevron--open' : ''}`}
              />
            </button>
            
            {/* Expandable items */}
            <div className={`ph-menu__submenu ${expandedCategory === category.name ? 'ph-menu__submenu--open' : ''}`}>
              {category.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className="ph-menu__sublink"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
        
        {/* Contact link (always visible) */}
        <Link
          to="/contact"
          onClick={handleLinkClick}
          className="ph-menu__link"
          data-testid="menu-link-contact"
        >
          Contact
        </Link>
      </div>

      {/* Footer note */}
      <div className="ph-menu__foot">Crafted in limited quantities.</div>
    </div>
  );
};

export default PhileonMenu;
