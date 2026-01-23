import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LiveMetalTicker from '@/components/LiveMetalTicker';

// Navigation: Shop, Custom Jewelry, About, Contact (minimal, no icons)
const navLinks = [
  { name: 'Shop', path: '/collections' },
  { name: 'Custom Jewelry', path: '/custom-design' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

// Phileon Logo - generous padding, no stretch/distort
const PhileonLogo = () => (
  <div className="p-2">
    <img 
      src="/logo.png" 
      alt="Phileon"
      className="h-10 lg:h-12 w-auto object-contain"
      style={{ maxWidth: '48px' }}
    />
  </div>
);

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
      className={`fixed top-[40px] left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-phileon-black shadow-lg shadow-black/20' 
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-8 lg:px-16">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo - Top left, generous padding, links to home */}
          <Link 
            to="/" 
            className="flex items-center transition-transform duration-300 hover:scale-105"
            data-testid="logo-link"
            aria-label="Phileon Home"
          >
            <PhileonLogo />
          </Link>

          {/* Desktop Navigation - Minimal, no icons */}
          <div className="hidden lg:flex items-center space-x-14">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs tracking-[0.18em] uppercase transition-colors duration-300 ${
                  location.pathname === link.path || location.pathname.startsWith(link.path + '/')
                    ? 'text-phileon-gold'
                    : 'text-phileon-ivory-muted hover:text-phileon-gold'
                }`}
                data-testid={`nav-${link.name.toLowerCase().replace(' ', '-')}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-phileon-ivory p-3 hover:text-phileon-gold transition-colors"
            data-testid="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation - Smooth open */}
        <div
          className={`lg:hidden fixed inset-0 top-[104px] bg-phileon-black z-40 transition-all duration-500 ease-in-out ${
            isMenuOpen 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full space-y-10">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xl tracking-[0.2em] uppercase transition-all duration-500 ${
                  location.pathname === link.path
                    ? 'text-phileon-gold'
                    : 'text-phileon-ivory hover:text-phileon-gold'
                }`}
                style={{ 
                  transitionDelay: isMenuOpen ? `${index * 80}ms` : '0ms',
                  opacity: isMenuOpen ? 1 : 0,
                  transform: isMenuOpen ? 'translateY(0)' : 'translateY(20px)'
                }}
                data-testid={`mobile-nav-${link.name.toLowerCase().replace(' ', '-')}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
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
            <Link to="/" className="inline-block">
              <PhileonLogo />
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
