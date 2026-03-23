import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistItems(wishlist);
  };

  const removeItem = (id) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    toast({
      title: 'Removed from Wishlist',
      description: 'Item has been removed from your wishlist.',
    });
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-24 h-24 text-gray-700 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-400 mb-8">Save your favorite pieces for later</p>
          <Link to="/products">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4">
              Explore Collection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Heart className="w-10 h-10 text-yellow-500" />
          My Wishlist
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wishlistItems.map(item => (
            <Card key={item.id} className="bg-gray-900 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 group">
              <CardContent className="p-0">
                <Link to={`/product/${item.id}`}>
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/products/${item.slug || item.id}`}>
                    <h3 className="text-white font-semibold mb-2 hover:text-yellow-500 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-yellow-500 font-bold text-xl mb-4">${item.price.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <Link to={`/products/${item.slug || item.id}`} className="flex-1">
                      <Button
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                      >
                        View Product
                      </Button>
                    </Link>
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="outline"
                      className="border-gray-700 text-gray-400 hover:bg-red-500 hover:text-white hover:border-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;