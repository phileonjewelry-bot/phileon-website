import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <img
              src="https://customer-assets.emergentagent.com/job_69cdf068-95a9-44ef-b008-a4c2998096d0/artifacts/7edat6ci_3D_TRANSPERENCY%20FILE_1-1.png"
              alt="Phileon"
              className="h-16 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm mb-4">
              Crafting timeless elegance with certified luxury jewelry since 2024.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/houseofphileon?igsh=ZHA2Y2c2dXVuazBp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors"
                title="Follow @houseofphileon on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=necklaces" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link to="/products?category=rings" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm">
                  Rings
                </Link>
              </li>
              <li>
                <Link to="/products?category=bracelets" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link to="/products?category=earrings" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm">
                  Earrings
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm" data-testid="footer-link-contact">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/ring-size-guide" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm" data-testid="footer-link-ring-size">
                  Ring Size Guide
                </Link>
              </li>
              <li>
                <Link to="/materials" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm" data-testid="footer-link-materials">
                  Materials
                </Link>
              </li>
              <li>
                <Link to="/jewelry-care" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm" data-testid="footer-link-jewelry-care">
                  Jewelry Care
                </Link>
              </li>
              <li>
                <Link to="/custom-jewelry-canada" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm" data-testid="footer-link-custom">
                  Custom Jewelry
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>123 Luxury Avenue, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-5 h-5 text-yellow-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-5 h-5 text-yellow-500" />
                <span>contact@getyourphileon.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 Get Your Phileon. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm" data-testid="footer-link-privacy">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm" data-testid="footer-link-terms">
              Terms of Service
            </Link>
            <Link to="/admin" className="text-gray-600 hover:text-yellow-500 transition-colors text-sm">
              Admin
            </Link>
          </div>
        </div>

        {/* Currency note */}
        <p
          className="text-gray-500 text-xs text-center mt-6 italic"
          data-testid="footer-currency-note"
        >
          Prices shown in USD. Your bank may apply currency conversion if applicable.
        </p>
      </div>
    </footer>
  );
};

export default Footer;