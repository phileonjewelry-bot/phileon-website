import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import LiveMetalTicker from '@/components/LiveMetalTicker';

// Navigation: Shop, Custom Jewelry, About, Contact
const navLinks = [
  { name: 'Shop', path: '/collections' },
  { name: 'Custom Jewelry', path: '/custom-design' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header
      id="site-header"
      className={`fixed top-[40px] left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-phileon-black' : 'bg-transparent'
      }`}
    >
      <div className="header-inner">
        {/* Left: Logo Icon */}
        <div className="header-left">
          <Link to="/" data-testid="logo-link" aria-label="Phileon Home">
            <img 
              src="/logo.png" 
              alt="Phileon Logo" 
              className="logo-icon"
            />
          </Link>
        </div>

        {/* Center: Brand Name */}
        <div className="header-center">
          <Link to="/" className="brand-name" data-testid="brand-text">
            PHILEON
          </Link>
        </div>

        {/* Right: Menu Button */}
        <div className="header-right">
          <button 
            className="menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Navigation Overlay */}
      <div
        className={`nav-overlay ${isMenuOpen ? 'is-open' : ''}`}
      >
        <nav className="nav-menu">
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'is-active' : ''}`}
              style={{ animationDelay: isMenuOpen ? `${index * 80}ms` : '0ms' }}
              data-testid={`nav-${link.name.toLowerCase().replace(' ', '-')}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
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
                  href="https://instagram.com/phileon" 
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
    <div className="min-h-screen flex flex-col">
      {/* Live Metal Price Ticker - Fixed at very top, sticky on scroll */}
      <LiveMetalTicker />
      
      {/* Header */}
      <Header />
      
      {/* Main content - account for ticker height (40px) */}
      <main className="flex-grow pt-[40px]">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicLayout;
