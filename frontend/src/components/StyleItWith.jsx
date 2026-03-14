import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';

// Styling suggestions data - can be expanded for different products
export const STYLE_SUGGESTIONS = {
  'desir-corset': [
    {
      id: 'rosaria',
      name: 'Rosaria Earrings',
      slug: 'rosaria',
      materialLine: 'Earrings · 10K & 14K Rose Gold',
      imageUrl: 'https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/uxgms0ee_1000098068.jpg',
      href: '/products/rosaria',
      price: 'From $2,950 CAD',
    }
  ],
  'rosaria': [
    {
      id: 'desir-corset',
      name: 'Désir Corset Pendant',
      slug: 'desir-corset',
      materialLine: 'Pendant · 10K Rose Gold',
      imageUrl: 'https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/sxr71rsz_1000141578.jpg',
      href: '/products/desir-corset',
      price: 'From $5,995 CAD',
    }
  ]
};

const StyleItWith = ({ productId }) => {
  const { toggle, has } = useWishlist();
  const suggestions = STYLE_SUGGESTIONS[productId] || [];

  if (suggestions.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 px-8 bg-black border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#C6A24A] text-xs tracking-[0.4em] uppercase mb-4">
            Complete the Look
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-white tracking-wide">
            Style it with
          </h2>
        </div>

        <div className={`grid gap-8 ${suggestions.length === 1 ? 'max-w-sm mx-auto' : suggestions.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {suggestions.map((product) => (
            <article 
              key={product.id}
              className="group relative bg-white/5 rounded-lg overflow-hidden transition-all duration-300 hover:bg-white/10"
            >
              <div className="relative">
                {/* Wishlist Heart Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle(product.id);
                  }}
                  className="absolute top-3 right-3 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                  title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart 
                    className={`w-4 h-4 ${has(product.id) ? 'fill-current text-red-400' : ''}`} 
                  />
                </button>
                
                <Link to={product.href} className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white text-sm tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-4 py-2 rounded-full">
                        View Product
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 text-center">
                    <h3 className="text-white font-medium tracking-wide text-lg mb-1">
                      {product.name}
                    </h3>
                    <p className="text-white/50 text-sm mb-3">
                      {product.materialLine}
                    </p>
                    <p className="text-[#C6A24A] font-medium">
                      {product.price}
                    </p>
                  </div>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StyleItWith;
