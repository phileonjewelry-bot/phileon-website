import { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LiveGoldPriceTicker = () => {
  const [goldPrice, setGoldPrice] = useState({ price: 2650.00, change: 0, loading: true });
  const prevPriceRef = useRef(2650.00);

  const fetchGoldPrice = useCallback(async () => {
    try {
      // Route through the same-origin backend proxy so we (a) stay inside
      // our strict CSP `connect-src` allowlist, and (b) reuse the trusted
      // provider chain already serving /api/metals.
      const response = await fetch(`${API_URL}/api/metals`, { cache: "no-store" });

      if (response.ok) {
        const data = await response.json();
        const newPrice = parseFloat(Number(data?.gold_usd_oz).toFixed(2));
        if (isFinite(newPrice) && newPrice > 0) {
          const prev = prevPriceRef.current || newPrice;
          const change = ((newPrice - prev) / prev * 100).toFixed(2);
          prevPriceRef.current = newPrice;
          setGoldPrice({ price: newPrice, change: parseFloat(change), loading: false });
          return;
        }
      }

      // Provider unavailable — hold the last known value.
      setGoldPrice(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setGoldPrice(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchGoldPrice();
    const interval = setInterval(fetchGoldPrice, 60000);
    return () => clearInterval(interval);
  }, [fetchGoldPrice]);

  const isUp = goldPrice.change > 0;
  const isDown = goldPrice.change < 0;

  // Format price as $X,XXX.XX
  const formattedPrice = goldPrice.price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[60] bg-phileon-near-black/95 backdrop-blur-sm border-b border-phileon-charcoal/50"
      data-testid="gold-price-ticker"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center">
        <div className="flex items-center gap-3">
          {/* GOLD label */}
          <span className="text-phileon-gold text-xs font-medium tracking-[0.15em]">
            GOLD
          </span>
          
          {/* Price with smooth transition */}
          <span 
            className="text-phileon-ivory font-medium tabular-nums transition-all duration-500 ease-out"
            style={{ minWidth: '100px' }}
          >
            {goldPrice.loading ? '...' : `$${formattedPrice}`}
          </span>
          
          {/* Arrow and change - green up, red down */}
          {!goldPrice.loading && (
            <span 
              className={`flex items-center gap-1 text-xs transition-all duration-500 ${
                isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-phileon-ivory-muted'
              }`}
            >
              {isUp && <TrendingUp size={14} className="transition-transform duration-300" />}
              {isDown && <TrendingDown size={14} className="transition-transform duration-300" />}
              <span className="tabular-nums">
                {isUp ? '+' : ''}{goldPrice.change.toFixed(2)}%
              </span>
            </span>
          )}
          
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 ml-3">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-phileon-ivory-muted/70">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveGoldPriceTicker;
