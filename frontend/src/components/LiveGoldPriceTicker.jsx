import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const LiveGoldPriceTicker = () => {
  const [goldPrice, setGoldPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchGoldPrice();
    
    // Update every 5 minutes
    const interval = setInterval(() => {
      fetchGoldPrice();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const fetchGoldPrice = async () => {
    try {
      // Using metals-api.com (free tier: 50 requests/month)
      // Alternative: goldapi.io, metals.live
      const response = await fetch(
        'https://api.metals.live/v1/spot/gold'
      );
      
      if (response.ok) {
        const data = await response.json();
        const currentPrice = data[0].price;
        
        if (goldPrice) {
          const change = ((currentPrice - goldPrice) / goldPrice) * 100;
          setPriceChange(change);
        }
        
        setGoldPrice(currentPrice);
        setLastUpdate(new Date());
        setLoading(false);
      } else {
        // Fallback to mock data if API fails
        setGoldPrice(2063.45);
        setPriceChange(0.23);
        setLoading(false);
      }
    } catch (error) {
      console.error('Gold price fetch error:', error);
      // Use mock data on error
      setGoldPrice(2063.45);
      setPriceChange(0.23);
      setLoading(false);
    }
  };

  const getTrendIcon = () => {
    if (priceChange > 0) return <TrendingUp className="w-4 h-4" />;
    if (priceChange < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (priceChange > 0) return 'text-green-500';
    if (priceChange < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="bg-black border-b border-gray-800 py-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-gray-400 text-sm">
          <div className="animate-pulse">Loading gold prices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border-b border-gray-800 py-2 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          {/* Gold Price */}
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 font-semibold">GOLD (XAU/USD):</span>
            <span className="text-white font-bold">${goldPrice?.toFixed(2)}</span>
            <span className={`flex items-center gap-1 ${getTrendColor()} font-semibold`}>
              {getTrendIcon()}
              {Math.abs(priceChange).toFixed(2)}%
            </span>
          </div>

          {/* Silver Price (optional) */}
          <div className="hidden md:flex items-center gap-2 text-gray-400">
            <span>SILVER:</span>
            <span className="text-white">$24.35</span>
            <span className="text-green-500">+0.15%</span>
          </div>

          {/* Platinum Price (optional) */}
          <div className="hidden lg:flex items-center gap-2 text-gray-400">
            <span>PLATINUM:</span>
            <span className="text-white">$945.20</span>
            <span className="text-red-500">-0.08%</span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-gray-500 text-xs hidden sm:block">
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default LiveGoldPriceTicker;