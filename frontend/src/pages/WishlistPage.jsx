import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { publicApi } from '@/lib/api';
import { toast } from 'sonner';

const WishlistPage = () => {
  const { ids: wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch all products and filter by wishlist IDs
        const response = await publicApi.getProducts();
        const wishlistProducts = response.data.filter(product => 
          wishlistIds.includes(product.id)
        );
        setProducts(wishlistProducts);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
        toast.error('Failed to load wishlist products');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  const handleAddToCart = (product) => {
    const soldOut = Number(product.inventory_count) <= 0;
    if (!soldOut) {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-phileon-black text-phileon-ivory">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-phileon-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-phileon-ivory/70">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-phileon-black text-phileon-ivory">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl tracking-[0.08em] text-phileon-ivory mb-4">
            Your Wishlist
          </h1>
          <div className="w-12 h-px bg-phileon-gold mx-auto mb-6" />
          <p className="text-phileon-ivory/70 max-w-2xl mx-auto">
            {products.length > 0 
              ? `${products.length} beautiful piece${products.length > 1 ? 's' : ''} you've saved for later`
              : 'Your wishlist is empty'
            }
          </p>
        </div>

        {products.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-phileon-gold/30 mx-auto mb-6" />
            <h3 className="text-xl font-light text-phileon-ivory mb-4">
              No items in your wishlist yet
            </h3>
            <p className="text-phileon-ivory/60 mb-8 max-w-md mx-auto">
              Browse our collection and save your favorite pieces for later.
            </p>
            <Link
              to="/shop-drop"
              className="inline-block px-8 py-3 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-phileon-gold/90 transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => {
              const soldOut = Number(product.inventory_count) <= 0;
              
              return (
                <div key={product.id} className="group relative">
                  {/* Product Card */}
                  <div className="bg-phileon-charcoal/20 border border-phileon-gold/10 rounded-lg overflow-hidden transition-all duration-300 hover:border-phileon-gold/30">
                    {/* Product Image */}
                    <div className="relative aspect-square">
                      <Link to={`/piece/${product.slug}`}>
                        <img
                          src={product.images?.[0] || '/placeholder-jewelry.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-3 right-3 p-2 bg-phileon-black/60 text-phileon-gold hover:bg-phileon-gold/20 rounded-full transition-all"
                        title="Remove from wishlist"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>

                      {/* Badges */}
                      {soldOut && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-red-600/80 text-white text-xs font-medium rounded backdrop-blur-sm">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                      {product.is_bestseller && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-phileon-gold/80 text-phileon-black text-xs font-medium rounded backdrop-blur-sm">
                            BESTSELLER
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link to={`/piece/${product.slug}`}>
                        <h3 className="font-light text-phileon-ivory text-lg mb-2 hover:text-phileon-gold transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-phileon-ivory/60 text-sm mb-3 line-clamp-2">
                        {product.short_description || product.description}
                      </p>

                      <p className="text-phileon-gold font-light mb-4">
                        {product.price_range || 'Inquiry Only'}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {!soldOut ? (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 px-4 py-2 bg-phileon-gold text-phileon-black text-xs tracking-wider uppercase font-medium hover:bg-phileon-gold/90 transition-colors flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 px-4 py-2 bg-gray-600 text-gray-300 text-xs tracking-wider uppercase font-medium cursor-not-allowed"
                          >
                            Sold Out
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;