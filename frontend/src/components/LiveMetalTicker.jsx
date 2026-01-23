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
