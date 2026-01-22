import React from 'react';

const StockBadge = ({ stockStatus, isNew, isBestseller }) => {
  const getBadgeConfig = () => {
    if (stockStatus === 'sold_out') {
      return {
        text: 'SOLD OUT',
        bgColor: 'bg-gray-600',
        textColor: 'text-white',
        borderColor: 'border-gray-500'
      };
    }
    
    if (stockStatus === 'almost_sold_out') {
      return {
        text: 'ALMOST SOLD OUT',
        bgColor: 'bg-red-600',
        textColor: 'text-white',
        borderColor: 'border-red-500',
        pulse: true
      };
    }
    
    if (stockStatus === 'low_stock') {
      return {
        text: 'LOW STOCK',
        bgColor: 'bg-orange-500',
        textColor: 'text-white',
        borderColor: 'border-orange-400'
      };
    }
    
    if (stockStatus === 'coming_soon') {
      return {
        text: 'COMING SOON',
        bgColor: 'bg-purple-600',
        textColor: 'text-white',
        borderColor: 'border-purple-500'
      };
    }
    
    if (isNew) {
      return {
        text: 'NEW',
        bgColor: 'bg-green-600',
        textColor: 'text-white',
        borderColor: 'border-green-500',
        pulse: true
      };
    }
    
    if (isBestseller) {
      return {
        text: 'BESTSELLER',
        bgColor: 'bg-yellow-500',
        textColor: 'text-black',
        borderColor: 'border-yellow-400'
      };
    }
    
    return null;
  };

  const config = getBadgeConfig();
  
  if (!config) return null;

  return (
    <div
      className={`
        ${config.bgColor} 
        ${config.textColor} 
        ${config.borderColor}
        px-3 py-1 rounded-full text-xs font-bold border-2
        ${config.pulse ? 'animate-pulse' : ''}
      `}
    >
      {config.text}
    </div>
  );
};

export default StockBadge;