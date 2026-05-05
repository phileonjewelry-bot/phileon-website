import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import LiveMetalTicker from '@/components/LiveMetalTicker';
import PhileonMenu from '@/components/PhileonMenu';
import VaultUnlockSequence from '@/components/VaultUnlockSequence';
import IntentFlashProvider from '@/components/GoldPulseProvider';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import '@/styles/phileon-header.css';

const Header = ({ onVaultOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoGlow, setLogoGlow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);
  const lastTapTimeRef = useRef(0);
  const { getTotalItems, setIsOpen: setCartOpen } = useCart();
  const { getTotalWishlistItems } = useWishlist();

  // Logo easter egg: 7 taps within 2 seconds triggers vault modal
  // Single tap navigates home immediately (unless already home)
  const handleLogoTap = (e) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    
    // Prevent double-counting from rapid events
    if (timeSinceLastTap < 50) {
      return;
    }
    
    // Check if this is a continuation of rapid tapping (within 400ms)
    const isRapidTap = timeSinceLastTap < 400 && tapCountRef.current > 0;
    
    lastTapTimeRef.current = now;
    
    // Increment tap count
    tapCountRef.current += 1;
    
    // Clear existing reset timer
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }
    
    // Reset tap count after 2 seconds of inactivity
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
    
    // Check if 7 taps reached - open vault
    if (tapCountRef.current >= 7) {
      e.preventDefault();
      e.stopPropagation();
      
      tapCountRef.current = 0;
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
      
      onVaultOpen();
      return;
    }
    
    // Subtle gold pulse feedback (only after 2nd tap to stay hidden)
    if (tapCountRef.current >= 2) {
      setLogoGlow(true);
      setTimeout(() => setLogoGlow(false), 180);
      
      // Light haptic on supported devices (very subtle)
      if (navigator.vibrate && tapCountRef.current >= 5) {
        navigator.vibrate(8);
      }
      return; // Don't navigate during easter egg attempt
    }
    
    // First tap: navigate home immediately (if not already there)
    if (tapCountRef.current === 1 && !isRapidTap) {
      if (location.pathname !== '/') {
        navigate('/');
      }
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
                className="h-11 w-11 object-contain rounded-lg"
                style={{ boxShadow: '0 0 0 1px rgba(201,162,77,0.25)' }}
              />
            </a>
          </div>

          {/* CENTER LOGO (always centered) */}
          <div className="ph-center">
            <div 
              className="ph-logo cursor-pointer" 
              onClick={(e) => {
                // If not triggering easter egg (less than 7 taps), navigate home
                handleLogoTap(e);
              }}
              role="button"
              tabIndex={0}
              aria-label="Phileon home"
            >
              <div 
                className={`brand-text ph-brand-text text-phileon-gold font-bold select-none ${logoGlow ? 'ph-logo-glow' : ''}`}
                data-testid="brand-text"
              >
                PHILEON
              </div>
            </div>
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
              className="ph-icon-btn" 
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(true);
              }}
              data-testid="mobile-menu-toggle"
              type="button"
            >
              <div className="menu-icon" aria-hidden="true">
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
        <div className="mt-16 pt-8 border-t border-phileon-charcoal/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-phileon-ivory-muted/60 tracking-wider">
            © {new Date().getFullYear()} Phileon
          </p>
          <p
            className="text-xs text-phileon-ivory-muted/50 tracking-wide italic"
            data-testid="footer-currency-note"
          >
            Prices shown in USD. Your bank may apply currency conversion if applicable.
          </p>
        </div>
      </div>
    </footer>
  );
};

const PublicLayout = () => {
  const location = useLocation();
  const [isUnlockSequenceActive, setIsUnlockSequenceActive] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Handle vault unlock trigger
  const handleVaultTrigger = () => {
    setIsUnlockSequenceActive(true);
  };

  // Handle unlock complete - sequence will redirect to vault page
  const handleUnlockComplete = () => {
    setIsUnlockSequenceActive(false);
  };

  return (
    <IntentFlashProvider>
      <div className="min-h-screen flex flex-col">
        {/* Live Metal Price Ticker - Fixed at very top */}
        <LiveMetalTicker />
        
        {/* Header */}
        <Header onVaultOpen={handleVaultTrigger} />
        
        {/* Main content - account for ticker height */}
        <main className="flex-grow pt-[36px]">
          <Outlet />
        </main>
        
        <Footer />
        
        {/* Vault Unlock Sequence - Glitch + Video + Redirect */}
        <VaultUnlockSequence 
          isActive={isUnlockSequenceActive}
          onComplete={handleUnlockComplete}
        />
      </div>
    </IntentFlashProvider>
  );
};

export default PublicLayout;
