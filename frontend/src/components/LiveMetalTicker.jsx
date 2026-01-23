import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Fade ticker after scroll
function useTickerFadeAfterScroll(thresholdPx = 24) {
  useEffect(() => {
    const el = document.querySelector('.phileon-ticker');
    if (!el) return;

    const onScroll = () => {
      const shouldFade = window.scrollY > thresholdPx;
      el.classList.toggle('phileon-ticker--faded', shouldFade);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [thresholdPx]);
}

const LiveMetalTicker = () => {
  const [metals, setMetals] = useState([
    { label: 'GOLD', price: 2650.00, changePct: 0.00 },
    { label: 'SILVER', price: 31.50, changePct: 0.00 },
    { label: 'PLATINUM', price: 980.00, changePct: 0.00 },
    { label: 'PALLADIUM', price: 1050.00, changePct: 0.00 },
  ]);

  // Enable fade on scroll
  useTickerFadeAfterScroll(24);

  const fetchMetalPrices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/metal-prices`);
      if (response.ok) {
        const data = await response.json();
        setMetals(data.prices.map(p => ({
          label: p.symbol,
          price: p.price,
          changePct: p.change
        })));
      }
    } catch (error) {
      console.error('Error fetching metal prices:', error);
    }
  };

  useEffect(() => {
    fetchMetalPrices();
    const interval = setInterval(fetchMetalPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format price in USD
  const formatPriceUSD = (price) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format percentage
  const formatPct = (pct) => {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  };

  // Duplicate for seamless loop
  const liveTickerList = [...metals, ...metals, ...metals, ...metals];

  return (
    <div 
      className="phileon-ticker"
      data-testid="metal-price-ticker"
    >
      <div className="phileon-ticker__track">
        {liveTickerList.map((m, idx) => {
          const up = m.changePct >= 0;

          return (
            <div className="phileon-ticker__item" key={`${m.label}-${idx}`}>
              <span className="phileon-ticker__metal">
                {m.label}
              </span>

              <span className="phileon-ticker__price">
                ${formatPriceUSD(m.price)}
              </span>

              <span className={`phileon-ticker__chg ${up ? 'is-up' : 'is-down'}`}>
                {up ? <TrendingUp size={12} className="inline mr-1" /> : <TrendingDown size={12} className="inline mr-1" />}
                {formatPct(m.changePct)}
              </span>

              <span className="phileon-ticker__live">
                <span className="phileon-ticker__dot" /> LIVE
              </span>

              <span className="phileon-ticker__sep">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveMetalTicker;
