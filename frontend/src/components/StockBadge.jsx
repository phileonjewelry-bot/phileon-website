import React from 'react';
import { AlertTriangle, Package, Clock } from 'lucide-react';

const StockBadge = ({ inventoryCount, lowStockThreshold = 2, className = '' }) => {
  // DROP MODE logic
  const isSoldOut = inventoryCount === 0;
  const isLowStock = inventoryCount > 0 && inventoryCount <= lowStockThreshold;
  const isInStock = inventoryCount > lowStockThreshold;

  if (isSoldOut) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-800 text-sm font-medium ${className}`}>
        <Package className="w-4 h-4" />
        <span>Sold Out</span>
      </div>
    );
  }

  if (isLowStock) {
    const urgency = inventoryCount === 1 ? 'high' : 'medium';
    const bgColor = urgency === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${bgColor} text-sm font-medium animate-pulse ${className}`}>
        <AlertTriangle className="w-4 h-4" />
        <span>Only {inventoryCount} left!</span>
      </div>
    );
  }

  if (isInStock) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-800 text-sm font-medium ${className}`}>
        <Clock className="w-4 h-4" />
        <span>In Stock</span>
      </div>
    );
  }

  return null;
};

export default StockBadge;