import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';

const ProductCard = ({ 
  product, 
  className = '',
  size = 'default' 
}) => {
  const { has, toggle } = useWishlist();
  
  const inventoryCount = product.inventory_count || product.stock || 0;
  const lowStockThreshold = product.low_stock_threshold || 2;
  const isSoldOut = inventoryCount === 0;
  const isLowStock = inventoryCount > 0 && inventoryCount <= lowStockThreshold;

  const cardSizeClasses = {
    sm: 'w-full max-w-sm',
    default: 'w-full max-w-md',
    lg: 'w-full max-w-lg'
  };

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <div 
      className={`product-card relative ${className} ${cardSizeClasses[size]} ${isSoldOut ? 'product-card--sold-out' : ''}`}
      data-testid={`product-card-${product.slug || product.id}`}
    >
      {/* Wishlist Button - positioned outside Link */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(product.id);
        }}
        className="absolute top-3 right-3 z-30 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
        title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart 
          className={`w-4 h-4 ${has(product.id) ? 'fill-current text-red-400' : ''}`} 
        />
      </button>

      {/* ENTIRE CARD IS A LINK */}
      <Link to={productUrl} className="block group bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-square overflow-hidden">
          {/* Badges - pointer-events none */}
          <div className="absolute top-3 left-3 z-10 space-y-2 pointer-events-none">
            {isSoldOut && (
              <div className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                SOLD OUT
              </div>
            )}
            {isLowStock && !isSoldOut && (
              <div className="bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                ONLY {inventoryCount} LEFT
              </div>
            )}
            {product.is_bestseller && (
              <div className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-sm">
                BESTSELLER
              </div>
            )}
          </div>

          {/* Sold Out Overlay - pointer-events none */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 pointer-events-none">
              <div className="bg-red-600/90 text-white px-6 py-3 rounded-lg font-bold text-lg backdrop-blur-sm transform rotate-12">
                SOLD OUT
              </div>
            </div>
          )}

          {/* Product Image */}
          <img 
            src={product.images?.[0] || product.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'} 
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isSoldOut ? 'grayscale group-hover:grayscale-0' : 'group-hover:scale-105'
            }`}
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <h3 className={`font-bold text-lg leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-yellow-500 ${
            isSoldOut ? 'text-gray-300' : 'text-white'
          }`}>
            {product.name}
          </h3>
          <p className={`text-sm line-clamp-1 ${
            isSoldOut ? 'text-gray-400' : 'text-gray-300'
          }`}>
            {product.materials?.join(' · ') || product.materialLine || product.description}
          </p>

          {/* Price */}
          {product.price_range && (
            <div className="text-yellow-500 font-bold text-lg">
              {product.price_range}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
