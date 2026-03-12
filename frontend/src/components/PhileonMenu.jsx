import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

// New navigation structure with categories
const menuCategories = [
  {
    name: 'Ladies First',
    subcategories: [
      { name: 'Rings', path: '/shop?category=rings' },
      { name: 'Earrings', path: '/shop?category=earrings' },
      { name: 'Bracelets / Cuffs', path: '/shop?category=bracelets' },
      { name: 'Pendants', path: '/shop?category=pendants' },
    ]
  },
  {
    name: "The Gentleman's Club",
    subcategories: [
      { name: 'Rings', path: '/shop?category=mens-rings' },
      { name: 'Earrings', path: '/shop?category=mens-earrings' },
      { name: 'Bracelets / Cuffs', path: '/shop?category=mens-bracelets' },
      { name: 'Pendants', path: '/shop?category=mens-pendants' },
    ]
  },
  {
    name: 'The Collective',
    products: [
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
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
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
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        {menuCategories.map((category) => (
          <div key={category.name} className="ph-menu__category">
            <button
              onClick={() => toggleCategory(category.name)}
              className="ph-menu__link"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                paddingRight: '1rem'
              }}
              data-testid={`menu-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span>{category.name}</span>
              <ChevronDown 
                className={`transition-transform duration-300 ${expandedCategory === category.name ? 'rotate-180' : ''}`}
                style={{ width: '1rem', height: '1rem', color: '#C6A24A' }}
              />
            </button>
            
            {/* Expandable submenu */}
            <div 
              style={{
                overflow: 'hidden',
                maxHeight: expandedCategory === category.name ? '400px' : '0',
                opacity: expandedCategory === category.name ? 1 : 0,
                transition: 'all 0.3s ease-in-out',
                paddingLeft: '1.5rem',
              }}
            >
              {/* Subcategories (Ladies First, Gentleman's Club) */}
              {category.subcategories && category.subcategories.map((subcat) => (
                <Link
                  key={subcat.path}
                  to={subcat.path}
                  className="ph-menu__sublink"
                  style={{
                    display: 'block',
                    padding: '0.6rem 0',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    letterSpacing: '0.1em',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#C6A24A'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                >
                  {subcat.name}
                </Link>
              ))}
              {/* Products (The Collective) */}
              {category.products && category.products.map((product) => (
                <Link
                  key={product.path}
                  to={product.path}
                  className="ph-menu__sublink"
                  style={{
                    display: 'block',
                    padding: '0.6rem 0',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    letterSpacing: '0.1em',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#C6A24A'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                >
                  {product.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
        
        {/* Contact link (always visible) */}
        <Link
          to="/contact"
          className="ph-menu__link"
          data-testid="menu-link-contact"
          style={{ marginTop: '1rem' }}
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
