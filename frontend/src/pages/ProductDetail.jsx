import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Badge, Shield, Award, Scan } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { products } from '../data/mockData';
import { useToast } from '../hooks/use-toast';
import VirtualTryOn from '../components/VirtualTryOn';

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedMediaType, setSelectedMediaType] = useState('image'); // 'image' or 'video'
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [showTryOn, setShowTryOn] = useState(false);

  // Combine images and videos for gallery
  const hasVideos = product?.videos && product.videos.length > 0;

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product not found</h2>
          <Link to="/products">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const addToWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!wishlist.find(item => item.id === product.id)) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      toast({
        title: 'Added to Wishlist',
        description: `${product.name} has been added to your wishlist.`,
      });
    } else {
      toast({
        title: 'Already in Wishlist',
        description: `${product.name} is already in your wishlist.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="text-gray-400 text-sm mb-8">
          <Link to="/" className="hover:text-yellow-500">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-yellow-500">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="relative overflow-hidden rounded-lg aspect-square mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.bestseller && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-black text-sm font-bold px-4 py-2 rounded-full">
                  BESTSELLER
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative overflow-hidden rounded-lg aspect-square border-2 transition-all duration-300 ${
                    selectedImage === index ? 'border-yellow-500' : 'border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Try-On Button */}
            <Button
              onClick={() => setShowTryOn(true)}
              className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-6 text-lg"
            >
              <Scan className="w-5 h-5 mr-2" />
              Try On with AR Camera
            </Button>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400">({product.reviews} reviews)</span>
            </div>

            <p className="text-5xl font-bold text-yellow-500 mb-6">${product.price.toFixed(2)}</p>

            <p className="text-gray-300 text-lg mb-8">{product.description}</p>

            {/* Product Specifications */}
            <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
              <h3 className="text-white font-semibold text-lg mb-4">Specifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Material:</span>
                  <span className="text-white font-medium">{product.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weight:</span>
                  <span className="text-white font-medium">{product.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Certification:</span>
                  <span className="text-yellow-500 font-medium flex items-center gap-1">
                    <Badge className="w-4 h-4" />
                    {product.certification}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Availability:</span>
                  <span className="text-green-500 font-medium">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Lifetime Warranty</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Certified</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <Badge className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Authentic</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={addToCart}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-6 text-lg transition-all duration-300 hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={addToWishlist}
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black py-6 px-6 transition-all duration-300"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Try-On Modal */}
      {showTryOn && (
        <VirtualTryOn
          product={product}
          onClose={() => setShowTryOn(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;