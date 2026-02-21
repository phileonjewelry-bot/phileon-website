import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductActionButton from './ProductActionButton';

const ProductCard = ({ 
  product, 
  onAddToCart, 
  showActionButton = true, 
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

  return (
    <div className={`product-card ${className} ${cardSizeClasses[size]} ${isSoldOut ? 'product-card--sold-out' : ''}`}>
      <div className="relative group bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
          }}
          className="absolute top-3 right-3 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
          title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart 
            className={`w-4 h-4 ${has(product.id) ? 'fill-current text-red-400' : ''}`} 
          />
        </button>

        <Link to={`/piece/${product.slug || product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden">
            {/* DROP MODE BADGES - Prominent Position */}
            <div className="absolute top-3 left-3 z-10 space-y-2">
              {/* SOLD OUT - Highest Priority */}
              {isSoldOut && (
                <div className="badge badge-soldout bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                  SOLD OUT
                </div>
              )}
              
              {/* LOW STOCK */}
              {isLowStock && !isSoldOut && (
                <div className="badge badge-warning bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                  ONLY {inventoryCount} LEFT
                </div>
              )}
              
              {/* BESTSELLER */}
              {product.is_bestseller && (
                <div className="badge badge-gold bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-sm">
                  BESTSELLER
                </div>
              )}
            </div>

            {/* Sold Out Overlay for HYPE */}
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
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

            {/* Hover Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 ${
              isSoldOut ? 'from-red-900/60' : ''
            }`}>
              <span className="text-white font-semibold text-sm px-4 py-2 bg-black/40 rounded-full backdrop-blur-sm">
                {isSoldOut ? 'Join Restock List' : 'View Details'}
              </span>
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className={`font-bold text-lg leading-tight line-clamp-2 ${
              isSoldOut ? 'text-gray-300' : 'text-white'
            }`}>
              {product.name}
            </h3>
            <p className={`text-sm mt-1 line-clamp-1 ${
              isSoldOut ? 'text-gray-400' : 'text-gray-300'
            }`}>
              {product.materials?.join(' · ') || product.materialLine || product.description}
            </p>
          </div>

          {/* Price */}
          {product.price_range && (
            <div className="text-yellow-500 font-bold text-lg">
              {product.price_range}
            </div>
          )}

          {/* DROP MODE Action Button */}
          {showActionButton && (
            <ProductActionButton
              product={product}
              onAddToCart={onAddToCart}
              size="sm"
              className="w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;