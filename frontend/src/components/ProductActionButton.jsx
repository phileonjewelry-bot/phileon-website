import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Bell, AlertTriangle, Package, Share2 } from 'lucide-react';
import StockBadge from './StockBadge';
import RestockNotificationModal from './RestockNotificationModal';

const ProductActionButton = ({ 
  product, 
  onAddToCart,
  className = '',
  size = 'default',
  showShare = false
}) => {
  const [showRestockModal, setShowRestockModal] = useState(false);
  const { toast } = useToast();

  const inventoryCount = product.inventory_count || product.stock || 0;
  const lowStockThreshold = product.low_stock_threshold || 2;
  
  // DROP MODE logic
  const isSoldOut = inventoryCount === 0;
  const isLowStock = inventoryCount > 0 && inventoryCount <= lowStockThreshold;
  const isInStock = inventoryCount > lowStockThreshold;

  const handleAddToCart = () => {
    if (isSoldOut) {
      // This shouldn't happen as button should be replaced
      toast({
        title: 'Out of Stock',
        description: 'This item is currently sold out.',
        variant: 'destructive'
      });
      return;
    }

    if (isLowStock) {
      toast({
        title: 'Added to Cart!',
        description: `Only ${inventoryCount - 1} left after this one!`,
      });
    } else {
      toast({
        title: 'Added to Cart!',
        description: 'Item successfully added to your cart.',
      });
    }

    onAddToCart(product);
  };

  const handleJoinRestockList = () => {
    setShowRestockModal(true);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/piece/${product.slug || product.id}`;
    const title = `${product.name} - Phileon Jewelry`;
    const text = `Check out this beautiful piece: ${product.name}`;

    // Use navigator.share on mobile devices
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title, text, url });
        toast({
          title: 'Shared!',
          description: 'Link shared successfully',
        });
      } catch (error) {
        // User cancelled or error occurred, fallback to clipboard
        if (error.name !== 'AbortError') {
          fallbackShare(url);
        }
      }
    } else {
      // Fallback to clipboard copy
      fallbackShare(url);
    }
  };

  const fallbackShare = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: 'Link Copied!',
        description: 'Product link copied to clipboard',
      });
    }).catch(() => {
      toast({
        title: 'Share Link',
        description: `Copy this link: ${url}`,
        variant: 'default'
      });
    });
  };

  // Button size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Stock Status Badge */}
      <StockBadge 
        inventoryCount={inventoryCount}
        lowStockThreshold={lowStockThreshold}
        className="mb-2"
      />

      {/* Action Button */}
      {isSoldOut ? (
        <Button
          onClick={handleJoinRestockList}
          className={`w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all duration-300 ${sizeClasses[size]}`}
          data-testid="join-restock-list-btn"
        >
          <Bell className="w-5 h-5 mr-2" />
          Join Restock List
        </Button>
      ) : (
        <Button
          onClick={handleAddToCart}
          className={`w-full font-semibold transition-all duration-300 ${
            isLowStock 
              ? 'bg-orange-500 hover:bg-orange-600 text-white animate-pulse' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-black hover:scale-105'
          } ${sizeClasses[size]}`}
          data-testid="add-to-cart-btn"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {isLowStock ? `Add to Cart - Only ${inventoryCount} Left!` : 'Add to Cart'}
        </Button>
      )}

      {/* Share Button */}
      {showShare && (
        <Button
          onClick={handleShare}
          variant="outline"
          size={size}
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      )}

      {/* Low Stock Warning */}
      {isLowStock && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                {inventoryCount === 1 ? 'Last One!' : 'Almost Gone!'}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {inventoryCount === 1 
                  ? 'This is the last piece available. Order now!' 
                  : `Only ${inventoryCount} pieces left. Don't miss out!`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sold Out Message */}
      {isSoldOut && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Package className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">Currently Sold Out</p>
              <p className="text-xs text-gray-600 mt-1">
                Join our restock list to be the first to know when this piece becomes available again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      <RestockNotificationModal
        isOpen={showRestockModal}
        onClose={() => setShowRestockModal(false)}
        productId={product.id}
        productName={product.name}
        productImage={product.images?.[0]}
      />
    </div>
  );
};

export default ProductActionButton;