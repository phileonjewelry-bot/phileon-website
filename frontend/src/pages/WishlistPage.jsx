import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import ProductActionButton from '@/components/ProductActionButton';
import StockBadge from '@/components/StockBadge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { items: wishlistIds, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchWishlistProducts();
  }, [wishlistIds]);

  const fetchWishlistProducts = async () => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch all products and filter by wishlist IDs
      const response = await axios.get(`${BACKEND_URL}/api/products`);
      const allProducts = response.data || [];
      
      const wishlistProducts = allProducts.filter(product => 
        wishlistIds.includes(product.id)
      );
      
      setProducts(wishlistProducts);
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wishlist products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const price = parseFloat(product.price_range?.split(' - ')[0]?.replace('$', '').replace(',', '') || '0');
    addToCart({
      id: product.id,
      name: product.name,
      price,
      images: product.images,
      slug: product.slug,
      materials: product.materials
    });
  };

  const handleShare = async (product) => {
    const url = `${window.location.origin}/piece/${product.slug || product.id}`;
    const title = `${product.name} - Phileon Jewelry`;
    const text = `Check out this beautiful piece: ${product.name}`;

    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        // Fallback to clipboard if share fails
        fallbackShare(url, product.name);
      }
    } else {
      fallbackShare(url, product.name);
    }
  };

  const fallbackShare = (url, productName) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: 'Link Copied!',
        description: `Link for ${productName} copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: 'Share',
        description: `Copy this link: ${url}`,
      });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24" data-testid="wishlist-page">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            Your Wishlist
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            {products.length === 0 
              ? "Your wishlist is empty. Add some beautiful pieces to save them for later."
              : `${products.length} piece${products.length !== 1 ? 's' : ''} saved for later`
            }
          </p>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-400 mb-4">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Browse our collections and save your favorite pieces by clicking the heart icon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/collections">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3">
                  Browse Collections
                </Button>
              </Link>
              <Link to="/shop-drop">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3">
                  Shop Drop
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-gray-400">
                {products.length} item{products.length !== 1 ? 's' : ''}
              </div>
              <Button
                onClick={clearWishlist}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-400 hover:bg-red-900/20 hover:border-red-600 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const inventoryCount = product.inventory_count || 0;
                const lowStockThreshold = product.low_stock_threshold || 2;
                const isSoldOut = inventoryCount === 0;
                const isLowStock = inventoryCount > 0 && inventoryCount <= lowStockThreshold;

                return (
                  <Card key={product.id} className="bg-gray-900 border-gray-800 hover:border-yellow-500/30 transition-all duration-300 group">
                    <CardContent className="p-0">
                      <div className="relative">
                        {/* Remove from Wishlist */}
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-red-600 text-red-400 hover:text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                          title="Remove from wishlist"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={() => handleShare(product)}
                          className="absolute top-3 left-3 z-20 p-2 bg-black/60 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                          title="Share this piece"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <Link to={`/piece/${product.slug || product.id}`}>
                          <div className="relative aspect-square overflow-hidden">
                            {/* Stock Badges */}
                            <div className="absolute top-12 left-3 z-10">
                              <StockBadge
                                inventoryCount={inventoryCount}
                                lowStockThreshold={lowStockThreshold}
                              />
                            </div>

                            {/* Sold Out Overlay - Keep visible for HYPE */}
                            {isSoldOut && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                <div className="bg-red-600/90 text-white px-4 py-2 rounded-lg font-bold backdrop-blur-sm">
                                  SOLD OUT
                                </div>
                              </div>
                            )}

                            <img
                              src={product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80'}
                              alt={product.name}
                              className={`w-full h-full object-cover transition-all duration-300 ${
                                isSoldOut ? 'grayscale group-hover:grayscale-0' : 'group-hover:scale-105'
                              }`}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </Link>

                        {/* Product Info */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="text-white font-semibold text-lg line-clamp-2 group-hover:text-yellow-400 transition-colors">
                              {product.name}
                            </h3>
                            {product.materials && (
                              <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                                {product.materials.join(' · ')}
                              </p>
                            )}
                          </div>

                          {product.price_range && (
                            <div className="text-yellow-500 font-bold text-lg">
                              {product.price_range}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <ProductActionButton
                              product={product}
                              onAddToCart={handleAddToCart}
                              size="sm"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;