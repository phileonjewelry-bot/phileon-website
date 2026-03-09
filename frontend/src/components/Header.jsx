import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import LiveGoldPriceTicker from './LiveGoldPriceTicker';
import HeaderCartButton from './HeaderCartButton';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const location = useLocation();

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
      ]
    },
    { name: 'Collections', path: '/collections' },
    { name: 'Custom Design', path: '/custom-design' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

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
                className="md:hidden text-gray-300 hover:text-yellow-500 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <nav className="px-6 py-4 space-y-4">
              {navigation.map((item) => (
                item.dropdown ? (
                  <div key={item.name} className="space-y-2">
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-gray-300 hover:text-yellow-500 font-medium transition-colors duration-300"
                    >
                      {item.name}
                    </Link>
                    <div className="pl-4 space-y-2">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-sm text-gray-400 hover:text-yellow-500 transition-colors duration-300"
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
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-300 hover:text-yellow-500 font-medium transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;