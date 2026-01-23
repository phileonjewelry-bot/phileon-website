import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Collections', path: '/collections' },
  { name: 'Custom Design', path: '/custom-design' },
  { name: 'Our Story', path: '/about' },
  { name: 'Craftsmanship', path: '/craftsmanship' },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-phileon-black/95 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-serif text-2xl lg:text-3xl tracking-[0.2em] text-phileon-ivory hover:text-phileon-gold transition-colors"
            data-testid="logo-link"
          >
            PHILEON
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                  location.pathname === link.path
                    ? 'text-phileon-gold'
                    : 'text-phileon-ivory-muted hover:text-phileon-gold'
                }`}
                data-testid={`nav-${link.name.toLowerCase().replace(' ', '-')}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-phileon-ivory p-2"
            data-testid="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden fixed inset-0 top-20 bg-phileon-black z-40 transition-transform duration-500 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-lg tracking-[0.2em] uppercase transition-colors ${
                  location.pathname === link.path
                    ? 'text-phileon-gold'
                    : 'text-phileon-ivory hover:text-phileon-gold'
                }`}
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
    <footer className="bg-phileon-near-black border-t border-phileon-charcoal">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-serif text-3xl tracking-[0.2em] text-phileon-ivory">
              PHILEON
            </Link>
            <p className="mt-6 text-sm text-phileon-ivory-muted leading-relaxed max-w-md">
              Crafting timeless jewelry that tells your story. Each piece is a 
              testament to exceptional craftsmanship and the enduring power of 
              meaningful design.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm tracking-[0.2em] text-phileon-gold mb-6">
              EXPLORE
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Collections', path: '/collections' },
                { name: 'Custom Design', path: '/custom-design' },
                { name: 'Our Process', path: '/process' },
                { name: 'Testimonials', path: '/testimonials' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-phileon-ivory-muted hover:text-phileon-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-serif text-sm tracking-[0.2em] text-phileon-gold mb-6">
              SUPPORT
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Contact Us', path: '/contact' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Care Guide', path: '/craftsmanship' },
                { name: 'About Us', path: '/about' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-phileon-ivory-muted hover:text-phileon-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-phileon-charcoal flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-phileon-ivory-muted tracking-wider">
            © {new Date().getFullYear()} PHILEON. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <span className="text-xs text-phileon-ivory-muted tracking-wider">
              Crafted with intention
            </span>
          </div>
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
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
