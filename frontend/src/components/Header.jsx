import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import LiveGoldPriceTicker from './LiveGoldPriceTicker';
import HeaderCartButton from './HeaderCartButton';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const location = useLocation();

  // Desktop navigation
  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { 
      name: 'Products', 
      path: '/shop',
      dropdown: [
        { name: 'La Marva Ring', path: '/products/la-marva' },
        { name: 'Annie Rose Ring', path: '/products/annie-rose' },
        { name: 'Monika Couture Earrings', path: '/products/monika-couture' },
        { name: 'Alejandra Heels Earrings', path: '/products/alejandra-heels' },
        { name: 'PTP Cuff', path: '/products/ptp-cuff' },
        { name: 'Rosaria Earrings', path: '/products/rosaria' },
      ]
    },
    { name: 'Collections', path: '/collections' },
    { name: 'Custom Design', path: '/custom-design' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Mobile navigation with categories
  const mobileCategories = [
    {
      name: 'Rings',
      products: [
        { name: 'La Marva', path: '/products/la-marva' },
      ]
    },
    {
      name: 'Earrings',
      products: [
        { name: 'Rosaria', path: '/products/rosaria' },
        { name: 'Monika Couture', path: '/products/monika-couture' },
        { name: 'Alejandra Heels', path: '/products/alejandra-heels' },
      ]
    },
    {
      name: 'Bracelets / Cuffs',
      products: [
        { name: 'PTP Cuff', path: '/products/ptp-cuff' },
      ]
    },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedCategory(null);
  }, [location.pathname]);

  // Toggle category expansion
  const toggleCategory = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  // Close menu and navigate
  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
    setExpandedCategory(null);
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
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                item.dropdown ? (
                  <div 
                    key={item.name}
                    className="relative group"
                    onMouseEnter={() => setProductsDropdownOpen(true)}
                    onMouseLeave={() => setProductsDropdownOpen(false)}
                  >
                    <Link
                      to={item.path}
                      className="text-gray-300 hover:text-yellow-500 font-medium transition-colors duration-300 text-sm uppercase tracking-wider"
                    >
                      {item.name}
                    </Link>
                    {productsDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-md shadow-xl py-2 z-50">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-yellow-500 hover:bg-gray-800 transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-gray-300 hover:text-yellow-500 font-medium transition-colors duration-300 text-sm uppercase tracking-wider"
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
                  
                  {/* Expandable Products List */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedCategory === category.name ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-4 space-y-3">
                      {category.products.map((product) => (
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
              
              {/* Contact Link */}
              <div className="pt-6">
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