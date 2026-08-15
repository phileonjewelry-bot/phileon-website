import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import LiveGoldPriceTicker from './LiveGoldPriceTicker';
import HeaderCartButton from './HeaderCartButton';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubCategory, setExpandedSubCategory] = useState(null);
  const location = useLocation();

  // Desktop navigation with new structure
  const navigation = [
    { 
      name: 'Ladies First', 
      path: '/shop',
      dropdown: [
        { name: 'Rings', path: '/shop?category=rings' },
        { name: 'Earrings', path: '/shop?category=earrings' },
        { name: 'Bracelets / Cuffs', path: '/shop?category=bracelets' },
        { name: 'Pendants', path: '/shop?category=pendants' },
      ]
    },
    { 
      name: "Gentleman's Club", 
      path: '/shop',
      dropdown: [
        { name: 'Rings', path: '/shop?category=mens-rings' },
        { name: 'Earrings', path: '/shop?category=mens-earrings' },
        { name: 'Bracelets / Cuffs', path: '/shop?category=mens-bracelets' },
        { name: 'Pendants', path: '/shop?category=mens-pendants' },
      ]
    },
    { 
      name: 'The Collective', 
      path: '/shop',
      dropdown: [
        { name: 'ROUGE SIREN', path: '/products/rouge-siren' },
        { name: 'H.E.R. — Her Eternal Reign', path: '/her-eternal-reign' },
        { name: 'FONDO CURVO', path: '/products/fondo-curvo' },
        { name: 'PARABOLA', path: '/products/parabola' },
        { name: 'PARABOLA HERITAGE', path: '/products/parabola-heritage' },
        { name: 'NEIGHBORHOOD NIP', path: '/tribute-series/neighborhood-nip' },
        { name: 'DRAPE', path: '/products/drape' },
        { name: 'PTP Cuff', path: '/products/ptp-cuff' },
        { name: 'Rosaria', path: '/products/rosaria' },
        { name: 'La Marva', path: '/products/la-marva' },
        { name: 'Monika Couture', path: '/products/monika-couture' },
        { name: 'Alejandra Heels', path: '/products/alejandra-heels' },
      ]
    },
    { name: 'The Inspiration Vault', path: '/vault' },
    { name: 'Contact', path: '/contact' },
  ];

  // Mobile navigation with new categories
  const mobileCategories = [
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
      name: "Gentleman's Club",
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
        { name: 'ROUGE SIREN', path: '/products/rouge-siren' },
        { name: 'H.E.R. — Her Eternal Reign', path: '/her-eternal-reign' },
        { name: 'FONDO CURVO', path: '/products/fondo-curvo' },
        { name: 'PARABOLA', path: '/products/parabola' },
        { name: 'PARABOLA HERITAGE', path: '/products/parabola-heritage' },
        { name: 'NEIGHBORHOOD NIP', path: '/tribute-series/neighborhood-nip' },
        { name: 'DRAPE', path: '/products/drape' },
        { name: 'PTP Cuff', path: '/products/ptp-cuff' },
        { name: 'Rosaria', path: '/products/rosaria' },
        { name: 'La Marva', path: '/products/la-marva' },
        { name: 'Monika Couture', path: '/products/monika-couture' },
        { name: 'Alejandra Heels', path: '/products/alejandra-heels' },
      ]
    },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedCategory(null);
    setExpandedSubCategory(null);
  }, [location.pathname]);

  // Toggle category expansion
  const toggleCategory = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
    setExpandedSubCategory(null);
  };

  // Close menu and navigate
  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
    setExpandedCategory(null);
    setExpandedSubCategory(null);
  };

  return (
    <>
      {/* Live Gold Price Ticker */}
      <LiveGoldPriceTicker />
      
      {/* Main Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="https://customer-assets.emergentagent.com/job_69cdf068-95a9-44ef-b008-a4c2998096d0/artifacts/7edat6ci_3D_TRANSPERENCY%20FILE_1-1.png"
                alt="Phileon"
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                item.dropdown ? (
                  <div 
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className="text-[#C6A24A] hover:text-[#D4B45A] font-medium transition-colors duration-300 text-sm uppercase tracking-wider flex items-center gap-1"
                    >
                      {item.name}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                    </button>
                    <div 
                      className={`absolute top-full left-0 mt-2 w-56 bg-black border border-[#C6A24A]/20 shadow-xl py-2 z-50 transition-all duration-200 ${
                        activeDropdown === item.name ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                      }`}
                    >
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className="block px-4 py-2.5 text-sm text-white/70 hover:text-[#C6A24A] hover:bg-white/5 transition-colors tracking-wide"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-[#C6A24A] hover:text-[#D4B45A] font-medium transition-colors duration-300 text-sm uppercase tracking-wider"
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              <Link 
                to="/wishlist"
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-white/25"
              >
                <Heart className="h-5 w-5 text-white/80" />
              </Link>
              
              <HeaderCartButton />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-[#C6A24A] hover:text-[#D4B45A] transition-colors p-2"
                aria-label="Toggle menu"
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Full Screen Overlay */}
        <div 
          className={`md:hidden fixed inset-0 top-[calc(2.5rem+5rem)] bg-black z-40 transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <nav className="h-full overflow-y-auto px-8 py-8">
            {/* Categories */}
            <div className="space-y-2">
              {mobileCategories.map((category) => (
                <div key={category.name} className="border-b border-white/10">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between py-4 text-left"
                    data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="text-[#C6A24A] text-lg tracking-[0.15em] uppercase font-medium">
                      {category.name}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 text-[#C6A24A] transition-transform duration-300 ${
                        expandedCategory === category.name ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {/* Expandable List - Products or Subcategories */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedCategory === category.name ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-4 space-y-3">
                      {/* For categories with subcategories (Ladies First, Gentleman's Club) */}
                      {category.subcategories && category.subcategories.map((subcat) => (
                        <Link
                          key={subcat.path}
                          to={subcat.path}
                          onClick={handleMobileNavClick}
                          className="block text-white/70 hover:text-[#C6A24A] text-base tracking-wide transition-colors duration-200"
                        >
                          {subcat.name}
                        </Link>
                      ))}
                      {/* For categories with direct products (The Collective) */}
                      {category.products && category.products.map((product) => (
                        <Link
                          key={product.path}
                          to={product.path}
                          onClick={handleMobileNavClick}
                          className="block text-white/70 hover:text-[#C6A24A] text-base tracking-wide transition-colors duration-200"
                        >
                          {product.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* The Inspiration Vault Link */}
              <div className="pt-6">
                <Link
                  to="/vault"
                  onClick={handleMobileNavClick}
                  className="block text-[#C6A24A] text-lg tracking-[0.15em] uppercase font-medium py-4 hover:text-[#D4B45A] transition-colors"
                  data-testid="mobile-vault-link"
                >
                  The Inspiration Vault
                </Link>
              </div>

              {/* Contact Link */}
              <div className="pt-2">
                <Link
                  to="/contact"
                  onClick={handleMobileNavClick}
                  className="block text-[#C6A24A] text-lg tracking-[0.15em] uppercase font-medium py-4 hover:text-[#D4B45A] transition-colors"
                  data-testid="mobile-contact-link"
                >
                  Contact
                </Link>
              </div>
            </div>
            
            {/* Bottom Tagline */}
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-white/30 text-xs tracking-[0.3em] uppercase text-center">
                #GetYourPhileon
              </p>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;