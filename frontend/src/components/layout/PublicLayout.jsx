import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import LiveMetalTicker from '@/components/LiveMetalTicker';
import PhileonMenu from '@/components/PhileonMenu';
import IntentFlashProvider from '@/components/GoldPulseProvider';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import '@/styles/phileon-header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);
  const { getTotalItems, setIsOpen: setCartOpen } = useCart();
  const { getTotalWishlistItems } = useWishlist();

  // Mobile gesture gate: 7 taps on Phileon logo within 3 seconds
  const handleLogoTap = (e) => {
    // Check if device is mobile (more comprehensive check)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0) ||
                     window.innerWidth <= 768;
    
    console.log('Logo tapped:', { 
      isMobile, 
      userAgent: navigator.userAgent.substring(0, 50) + '...', 
      windowWidth: window.innerWidth,
      touchSupport: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints
    });
    
    if (isMobile) {
      // Prevent default navigation only on mobile when we're counting taps
      e.preventDefault();
      e.stopPropagation();
      
      tapCountRef.current += 1;
      console.log(`Tap count: ${tapCountRef.current}/7`);
      
      // Clear existing timer and start new one
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
      
      // Reset tap count after 3 seconds
      tapTimerRef.current = setTimeout(() => {
        console.log('Tap timer expired, resetting count');
        tapCountRef.current = 0;
      }, 3000);
      
      // Check if 7 taps reached
      if (tapCountRef.current >= 7) {
        console.log('🎉 7 taps reached! Navigating to secret-drop');
        tapCountRef.current = 0; // Reset counter
        if (tapTimerRef.current) {
          clearTimeout(tapTimerRef.current);
        }
        navigate('/secret-drop');
        return false; // Prevent any navigation
      }
      
      return false; // Prevent normal navigation while counting
    } else {
      console.log('Desktop detected, allowing normal navigation');
      // Allow normal navigation on desktop
    }
  };

  return (
    <>
      <header className="ph-header">
        <div className="ph-header-inner">
          {/* LEFT - Logo icon */}
          <div className="ph-left">
            <a href="/" aria-label="Phileon home">
              <img 
                src="/logo.png" 
                alt="Phileon" 
                className="h-9 w-9 object-contain rounded-lg"
                style={{ boxShadow: '0 0 0 1px rgba(201,162,77,0.25)' }}
              />
            </a>
          </div>

          {/* CENTER LOGO (always centered) */}
          <div className="ph-center">
            <a href="/" className="ph-logo" aria-label="Phileon home">
              <div 
                className="brand-text text-phileon-gold font-bold text-xl tracking-widest cursor-pointer"
                onClick={handleLogoTap}
                onTouchStart={handleLogoTap}
                data-testid="brand-text"
              >
                PHILEON
              </div>
            </a>
          </div>

          {/* RIGHT ICONS (inline row) */}
          <div className="ph-right">
            <Link
              to="/wishlist"
              className="ph-icon-btn ph-desktop-only"
              aria-label="Wishlist"
              data-testid="wishlist-button"
            >
              <Heart className="w-5 h-5" />
              {getTotalWishlistItems() > 0 && (
                <span className="ph-badge">{getTotalWishlistItems()}</span>
              )}
            </Link>

            <button 
              className="ph-icon-btn ph-desktop-only" 
              aria-label="Cart" 
              onClick={() => setCartOpen(true)}
              data-testid="cart-button"
            >
              <ShoppingBag className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="ph-badge">{getTotalItems()}</span>
              )}
            </button>

            <button 
              className="ph-icon-btn" 
              aria-label="Menu" 
              onClick={() => setIsMenuOpen(true)}
              data-testid="mobile-menu-toggle"
            >
              <div className="menu-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Vault Reveal Menu */}
      <PhileonMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
    </>
  );
};

const Footer = () => {
  return (
    <footer className="bg-phileon-near-black border-t border-phileon-charcoal/50">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/logo.png" alt="Phileon" className="h-10 w-10 object-contain" />
              <span className="font-serif text-lg tracking-[0.3em] text-phileon-gold">PHILEON</span>
            </Link>
            <p className="mt-6 text-sm text-phileon-ivory-muted leading-relaxed max-w-sm">
              Timeless elegance, crafted for you.
            </p>
          </div>

          {/* Links - Minimal */}
          <div className="md:col-span-3">
            <ul className="space-y-4">
              <li>
                <Link to="/contact" className="text-sm text-phileon-ivory-muted hover:text-phileon-gold transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/custom-design" className="text-sm text-phileon-ivory-muted hover:text-phileon-gold transition-colors">
                  Custom Jewelry
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal - Quiet */}
          <div className="md:col-span-4">
            <ul className="space-y-4">
              <li>
                <Link to="/privacy" className="text-sm text-phileon-ivory-muted hover:text-phileon-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-phileon-ivory-muted hover:text-phileon-gold transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/houseofphileon?igsh=ZHA2Y2c2dXVuazBp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-phileon-ivory-muted hover:text-phileon-gold transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom - Minimal */}
        <div className="mt-16 pt-8 border-t border-phileon-charcoal/30">
          <p className="text-xs text-phileon-ivory-muted/60 tracking-wider">
            © {new Date().getFullYear()} Phileon
          </p>
        </div>
      </div>
    </footer>
  );
};

const PublicLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <IntentFlashProvider>
      <div className="min-h-screen flex flex-col">
        {/* Live Metal Price Ticker - Fixed at very top */}
        <LiveMetalTicker />
        
        {/* Header */}
        <Header />
        
        {/* Main content - account for ticker height */}
        <main className="flex-grow pt-[36px]">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </IntentFlashProvider>
  );
};

export default PublicLayout;
