import { createContext, useContext, useEffect, useMemo, useState } from "react";

const MarketPricingContext = createContext(null);

export function MarketPricingProvider({ children }) {
  const [market, setMarket] = useState({
    goldPerGram24kCad: 150,
    silverPerGramCad: 1.25,
    updatedAt: null,
  });

  useEffect(() => {
    let isMounted = true;
    const API_URL = process.env.REACT_APP_BACKEND_URL || "";

    async function fetchMarketPrices() {
      try {
        const res = await fetch(`${API_URL}/api/market-prices`);
        const data = await res.json();
        if (!isMounted) return;
        setMarket({
          goldPerGram24kCad: data.goldPerGram24kCad,
          silverPerGramCad: data.silverPerGramCad,
          updatedAt: data.updatedAt,
        });
      } catch (error) {
        console.error("Market price fetch failed:", error);
      }
    }

    fetchMarketPrices();
    const interval = setInterval(fetchMarketPrices, 15 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const value = useMemo(() => ({ market }), [market]);

  return (
    <MarketPricingContext.Provider value={value}>
      {children}
    </MarketPricingContext.Provider>
  );
}

export function useMarketPricing() {
  const context = useContext(MarketPricingContext);
  if (!context) {
    throw new Error("useMarketPricing must be used inside MarketPricingProvider");
  }
  return context;
}
