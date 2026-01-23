import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LiveMetalTicker = () => {
  const [metals, setMetals] = useState([
    { symbol: 'GOLD', price: 2650.00, change: 0.00 },
    { symbol: 'SILVER', price: 31.50, change: 0.00 },
    { symbol: 'PLATINUM', price: 980.00, change: 0.00 },
    { symbol: 'PALLADIUM', price: 1050.00, change: 0.00 },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const tickerRef = useRef(null);

  const fetchMetalPrices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/metal-prices`);
      if (response.ok) {
        const data = await response.json();
        setMetals(data.prices);
      }
    } catch (error) {
      console.error('Error fetching metal prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetalPrices();
    // Update prices every 30 seconds
    const interval = setInterval(fetchMetalPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format price based on metal (gold/platinum in thousands, silver lower)
  const formatPrice = (symbol, price) => {
    if (symbol === 'SILVER') {
      return price.toFixed(2);
    }
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Duplicate metals for seamless infinite scroll
  const tickerItems = [...metals, ...metals, ...metals, ...metals];

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[60] bg-phileon-black border-b border-phileon-charcoal/40 overflow-hidden"
      data-testid="metal-price-ticker"
    >
      <div className="relative h-10 flex items-center">
        {/* Gradient edges for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-phileon-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-phileon-black to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling ticker */}
        <div 
          ref={tickerRef}
          className="flex animate-ticker whitespace-nowrap"
          style={{
            animation: 'ticker 40s linear infinite',
          }}
        >
          {tickerItems.map((metal, index) => {
            const isUp = metal.change > 0;
            const isDown = metal.change < 0;
            
            return (
              <div 
                key={`${metal.symbol}-${index}`}
                className="flex items-center gap-2 px-8 border-r border-phileon-charcoal/30 last:border-r-0"
              >
                {/* Metal Symbol */}
                <span className="text-phileon-gold text-xs font-medium tracking-[0.15em]">
                  {metal.symbol}
                </span>
                
                {/* Price */}
                <span className={`text-phileon-ivory font-medium tabular-nums text-sm transition-colors duration-500 ${
                  isLoading ? 'opacity-50' : ''
                }`}>
                  ${formatPrice(metal.symbol, metal.price)}
                </span>
                
                {/* Change indicator */}
                <span 
                  className={`flex items-center gap-0.5 text-xs tabular-nums transition-all duration-300 ${
                    isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-phileon-ivory-muted'
                  }`}
                >
                  {isUp && <TrendingUp size={12} />}
                  {isDown && <TrendingDown size={12} />}
                  <span>
                    {isUp ? '+' : ''}{metal.change.toFixed(2)}%
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Live indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-20 bg-phileon-black pl-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] text-phileon-ivory-muted/70 tracking-wider uppercase">Live</span>
        </div>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LiveMetalTicker;
