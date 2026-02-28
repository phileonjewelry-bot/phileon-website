import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Fade ticker on scroll (slides up and fades out)
function useTickerFadeAfterScroll(thresholdPx = 60) {
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
    { label: 'GOLD', price: 2662.30, changePct: -0.06 },
    { label: 'SILVER', price: 31.42, changePct: -0.14 },
    { label: 'PLATINUM', price: 925.10, changePct: 0.22 },
    { label: 'PALLADIUM', price: 1012.90, changePct: -0.31 },
  ]);

  // Enable fade on scroll
  useTickerFadeAfterScroll(60);

  const fetchMetalPrices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/metals`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (data.status === "live" && data.gold_usd_oz > 0) {
          setMetals(prev => [
            { label: 'GOLD', price: data.gold_usd_oz, changePct: prev[0]?.changePct || 0 },
            { label: 'SILVER', price: data.silver_usd_oz, changePct: prev[1]?.changePct || 0 },
            ...prev.slice(2),
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching metal prices:', error);
    }
  };

  useEffect(() => {
    fetchMetalPrices();
    const interval = setInterval(fetchMetalPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Format price
  const formatPrice = (price) => {
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
  const tickerItems = [...metals, ...metals, ...metals, ...metals];

  return (
    <div className="phileon-ticker" data-testid="metal-price-ticker">
      <div className="phileon-ticker__track">
        {/* LIVE indicator first */}
        <span className="phileon-ticker__live">
          <span className="phileon-ticker__dot">●</span>LIVE
        </span>
        
        {/* Metal prices */}
        {tickerItems.map((m, idx) => {
          const isUp = m.changePct >= 0;
          return (
            <span className="phileon-ticker__item" key={`${m.label}-${idx}`}>
              <span className="phileon-ticker__metal">{m.label}</span>
              {' '}
              <span className="phileon-ticker__price">${formatPrice(m.price)}</span>
              {' '}
              <span className={`phileon-ticker__chg ${isUp ? 'is-up' : 'is-down'}`}>
                {formatPct(m.changePct)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default LiveMetalTicker;
