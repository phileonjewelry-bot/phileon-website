import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductActionButton from '@/components/ProductActionButton';
import StockBadge from '@/components/StockBadge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProductDetailWithDropMode = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/products/${slug}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price_range.split(' - ')[0].replace('$', '').replace(',', '')),
      images: product.images,
      quantity: 1
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-400">{error || 'The requested product could not be found.'}</p>
        </div>
      </div>
    );
  }

  const inventoryStatus = product.inventory_status || {};
  const inventoryCount = product.inventory_count || 0;
  const lowStockThreshold = product.low_stock_threshold || 2;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {product.images && product.images.length > 0 ? (
              <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}

            {/* Additional Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-900 rounded overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
              
              {/* Stock Status - DROP MODE */}
              <div className="flex items-center gap-3 mb-4">
                <StockBadge 
                  inventoryCount={inventoryCount}
                  lowStockThreshold={lowStockThreshold}
                />
                
                {product.is_bestseller && (
                  <Badge className="bg-yellow-500 text-black font-semibold">
                    Bestseller
                  </Badge>
                )}
              </div>

              <div className="text-3xl font-bold text-yellow-500 mb-6">
                {product.price_range}
              </div>
            </div>

            <Separator className="bg-gray-800" />

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Description</h3>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Materials */}
            {product.materials && product.materials.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material, index) => (
                    <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-gray-800" />

            {/* DROP MODE Action Button */}
            <ProductActionButton
              product={product}
              onAddToCart={handleAddToCart}
              size="lg"
              className="w-full"
            />

            {/* Additional Details */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Product Details</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between">
                    <span>Availability:</span>
                    <span className="capitalize text-yellow-500">{product.availability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collection:</span>
                    <span className="text-yellow-500">{product.collection_name || 'N/A'}</span>
                  </div>
                  
                  {/* DROP MODE Inventory Info */}
                  <div className="flex justify-between">
                    <span>Stock Status:</span>
                    <span className={
                      inventoryStatus.status === 'sold_out' ? 'text-red-500' :
                      inventoryStatus.status === 'low_stock' ? 'text-orange-500' :
                      'text-green-500'
                    }>
                      {inventoryStatus.message}
                    </span>
                  </div>
                  
                  {inventoryStatus.status !== 'sold_out' && (
                    <div className="flex justify-between">
                      <span>Available Units:</span>
                      <span className="text-yellow-500">{inventoryCount}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailWithDropMode;

// Example usage in existing product detail pages:
// Simply replace your existing "Add to Cart" button with:
// 
// <ProductActionButton
//   product={product}
//   onAddToCart={handleAddToCart}
//   size="lg"
// />
//
// And optionally add the stock badge:
// 
// <StockBadge 
//   inventoryCount={product.inventory_count}
//   lowStockThreshold={product.low_stock_threshold}
// />