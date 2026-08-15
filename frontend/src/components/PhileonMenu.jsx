import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';

// Navigation structure with categories and audiences
const menuCategories = [
  {
    name: 'Ladies First',
    items: [
      { name: 'Rings', path: '/shop?category=rings&audience=ladies' },
      { name: 'Earrings', path: '/shop?category=earrings&audience=ladies' },
      { name: 'Bracelets / Cuffs', path: '/shop?category=bracelets&audience=ladies' },
      { name: 'Pendants', path: '/shop?category=pendants&audience=ladies' },
    ]
  },
  {
    name: "Gentleman's Club",
    items: [
      { name: 'Rings', path: '/shop?category=rings&audience=gentlemens-club' },
      { name: 'Earrings', path: '/shop?category=earrings&audience=gentlemens-club' },
      { name: 'Bracelets / Cuffs', path: '/shop?category=bracelets&audience=gentlemens-club' },
      { name: 'Pendants', path: '/shop?category=pendants&audience=gentlemens-club' },
    ]
  },
  {
    name: 'The Collective',
    items: [
      { name: 'ROUGE SIREN', path: '/products/rouge-siren' },
      { name: 'H.E.R. — Her Eternal Reign', path: '/her-eternal-reign' },
      { name: 'FONDO CURVO', path: '/products/fondo-curvo' },
      { name: 'PARABOLA', path: '/products/parabola' },
      { name: 'PARABOLA HERITAGE', path: '/products/parabola-heritage' },
      { name: 'NEIGHBORHOOD NIP', path: '/tribute-series/neighborhood-nip' },
      { name: 'DRAPE', path: '/products/drape' },
      { name: 'Forme Cuff', path: '/products/forme-cuff' },
      { name: 'La Marva', path: '/products/la-marva' },
      { name: 'PTP Cuff', path: '/products/ptp-cuff' },
      { name: 'Rhythm Mesh™ Ring', path: '/products/rhythm-mesh-ring' },
      { name: 'CYPHER', path: '/products/cypher' },
      { name: 'IL MORSO DEL RE', path: '/products/morso' },
      { name: 'LA BÊTE', path: '/products/labete' },
      { name: 'THE BAMBURGH', path: '/products/the-bamburgh' },
      { name: 'LADY BAMBURGH', path: '/products/lady-bamburgh' },
    ]
  },
];

const PhileonMenu = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Close on route change - only when pathname actually changes while menu is open
  useEffect(() => {
    // Only close if menu is currently open and we navigated
    if (isOpen) {
      onClose();
      setExpandedCategory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Intentionally exclude isOpen/onClose to only trigger on navigation

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

  // Toggle category
  const toggleCategory = (name) => {
    setExpandedCategory(prev => prev === name ? null : name);
  };

  // Handle link click
  const handleLinkClick = () => {
    setExpandedCategory(null);
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.98)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          color: '#C6A24A',
          cursor: 'pointer',
          padding: '10px',
          zIndex: 100000,
        }}
        aria-label="Close menu"
      >
        <X size={32} />
      </button>

      {/* Menu content */}
      <nav style={{
        padding: '80px 30px 40px',
        maxWidth: '500px',
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Brand */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '50px',
          color: '#C6A24A',
          fontSize: '28px',
          letterSpacing: '0.3em',
          fontFamily: "'Playfair Display', serif",
        }}>
          PHILEON
        </div>

        {/* Categories */}
        {menuCategories.map((category) => (
          <div key={category.name} style={{ marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => toggleCategory(category.name)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 0',
                background: 'none',
                border: 'none',
                color: '#C6A24A',
                fontSize: '18px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: "'Playfair Display', serif",
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{category.name}</span>
              <ChevronDown 
                size={20}
                style={{
                  transform: expandedCategory === category.name ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s ease',
                }}
              />
            </button>
            
            {/* Submenu */}
            {expandedCategory === category.name && (
              <div style={{ paddingLeft: '20px', paddingBottom: '15px' }}>
                {category.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    style={{
                      display: 'block',
                      padding: '10px 0',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '15px',
                      letterSpacing: '0.1em',
                      textDecoration: 'none',
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Bamburgh Circle */}
        <Link
          to="/bamburgh-circle"
          onClick={handleLinkClick}
          className="block text-white text-[18px] tracking-wide py-3"
        >
          Bamburgh Circle
        </Link>

        {/* The Inspiration Vault — standalone (not nested under any category) */}
        <Link
          to="/vault"
          onClick={handleLinkClick}
          data-testid="menu-vault-link"
          style={{
            display: 'block',
            padding: '18px 0',
            color: '#a47433',
            fontSize: '18px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: "'Playfair Display', serif",
            textDecoration: 'none',
            borderTop: '1px solid rgba(164,116,51,0.18)',
            marginTop: '8px',
          }}
        >
          The Inspiration Vault
        </Link>

        {/* Contact */}
        <Link
          to="/contact"
          onClick={handleLinkClick}
          style={{
            display: 'block',
            padding: '18px 0',
            color: '#C6A24A',
            fontSize: '18px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: "'Playfair Display', serif",
            textDecoration: 'none',
          }}
        >
          Contact
        </Link>

        {/* Footer */}
        <div style={{
          marginTop: '50px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          #GetYourPhileon
        </div>
      </nav>
    </div>
  );
};

export default PhileonMenu;
