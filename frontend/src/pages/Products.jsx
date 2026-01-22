import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { products } from '../data/mockData';
import StockBadge from '../components/StockBadge';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const categories = [
    { id: 'all', name: 'All Jewelry' },
    { id: 'necklaces', name: 'Necklaces' },
    { id: 'rings', name: 'Rings' },
    { id: 'bracelets', name: 'Bracelets' },
    { id: 'earrings', name: 'Earrings' }
  ];

  let filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-white mb-4">Our Collection</h1>
          <p className="text-gray-400 text-lg">Discover handcrafted luxury jewelry</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 space-y-6">
            {/* Category Filter */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-yellow-500" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-yellow-500 text-black font-semibold'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-white font-semibold mb-4">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-yellow-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 text-gray-400">
              Showing {filteredProducts.length} products
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="bg-gray-900 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden aspect-square">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {product.bestseller && (
                          <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                            BESTSELLER
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="text-gray-400 text-sm ml-1">({product.reviews})</span>
                        </div>
                        <p className="text-yellow-500 font-bold text-xl">${product.price.toFixed(2)}</p>
                        <p className="text-gray-500 text-sm mt-2">{product.material}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;