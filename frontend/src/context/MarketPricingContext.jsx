import { createContext, useContext, useEffect, useMemo, useState } from "react";

const MarketPricingContext = createContext(null);

const FALLBACK_MARKET = {
  goldPerGram24kCad: 150,
  silverPerGramCad: 1.25,
  updatedAt: null,
};

const CACHE_KEY = "phileon_market_prices";

function getCachedMarket() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Only use cache if less than 1 hour old
      if (parsed.updatedAt) {
        const age = Date.now() - new Date(parsed.updatedAt).getTime();
        if (age < 60 * 60 * 1000) return parsed;
      }
    }
  } catch (e) { /* ignore */ }
  return FALLBACK_MARKET;
}

function setCachedMarket(market) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(market));
  } catch (e) { /* ignore */ }
}

export function MarketPricingProvider({ children }) {
  const [market, setMarket] = useState(getCachedMarket);

  useEffect(() => {
    let isMounted = true;
    const API_URL = process.env.REACT_APP_BACKEND_URL || "";

    async function fetchMarketPrices() {
      try {
        const res = await fetch(`${API_URL}/api/market-prices`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Validate the response has valid numbers
        if (typeof data.goldPerGram24kCad !== "number" || data.goldPerGram24kCad <= 0) throw new Error("Invalid gold price");
        if (typeof data.silverPerGramCad !== "number" || data.silverPerGramCad <= 0) throw new Error("Invalid silver price");

        if (!isMounted) return;

        const newMarket = {
          goldPerGram24kCad: data.goldPerGram24kCad,
          silverPerGramCad: data.silverPerGramCad,
          updatedAt: data.updatedAt,
        };
        setMarket(newMarket);
        setCachedMarket(newMarket);
      } catch (error) {
        console.error("Market price fetch failed, using cached/fallback:", error);
        // State preserves the last good value automatically
      }
    }

    fetchMarketPrices();
    // Refresh every 10 minutes while the app is active.
    const interval = setInterval(fetchMarketPrices, 10 * 60 * 1000);

    // Refresh when the tab returns to foreground after >10 minutes hidden.
    let lastFetch = Date.now();
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        const age = Date.now() - lastFetch;
        if (age > 10 * 60 * 1000) { fetchMarketPrices(); lastFetch = Date.now(); }
      }
    };
    const wrappedFetch = async () => { lastFetch = Date.now(); await fetchMarketPrices(); };
    document.addEventListener("visibilitychange", onVisibility);
    // Fire a refresh when checkout begins (any page dispatches this event).
    window.addEventListener("phileon:refresh-market", wrappedFetch);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("phileon:refresh-market", wrappedFetch);
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
