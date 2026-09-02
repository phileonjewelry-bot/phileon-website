import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

/**
 * PHILEON — Presentment (display-only) currency context.
 *
 * Strict rules:
 *   • The trusted product catalog is USD end-to-end.
 *   • This context ONLY governs how canonical USD prices are DISPLAYED.
 *   • It NEVER supplies money values to Stripe, shipping, tax, or the cart.
 *   • Stripe Adaptive Pricing decides the actual customer-charged
 *     currency and amount at checkout.
 *
 * Persistence:
 *   • Manual currency choice persists ~30 days via localStorage
 *     (`phi_pres_currency` = code, `phi_pres_currency_expires` = epoch ms).
 *   • Geolocation-suggested default is used only when no unexpired manual
 *     choice exists.
 */

const CTX = createContext(null);
const API = process.env.REACT_APP_BACKEND_URL || "";

const CURRENCY_STORE_KEY = "phi_pres_currency";
const CURRENCY_EXPIRY_KEY = "phi_pres_currency_expires";
const PERSIST_MS = 30 * 24 * 60 * 60 * 1000; // ~30 days

const CURRENCY_LOCALE = {
  USD: "en-US",
  CAD: "en-CA",
  GBP: "en-GB",
  EUR: "en-IE",
  AUD: "en-AU",
  JPY: "ja-JP",
};

const CURRENCY_SYMBOL = {
  USD: "$",
  CAD: "C$",
  GBP: "£",
  EUR: "€",
  AUD: "A$",
  JPY: "¥",
};

const CURRENCY_MINOR_UNITS = { USD: 2, CAD: 2, GBP: 2, EUR: 2, AUD: 2, JPY: 0 };

function readPersistedCurrency() {
  try {
    if (typeof window === "undefined") return null;
    const expiry = Number(window.localStorage.getItem(CURRENCY_EXPIRY_KEY) || 0);
    if (!expiry || Date.now() > expiry) return null;
    const code = (window.localStorage.getItem(CURRENCY_STORE_KEY) || "").trim().toUpperCase();
    return code || null;
  } catch { return null; }
}

function persistCurrency(code) {
  try {
    if (typeof window === "undefined") return;
    const expiry = Date.now() + PERSIST_MS;
    window.localStorage.setItem(CURRENCY_STORE_KEY, code);
    window.localStorage.setItem(CURRENCY_EXPIRY_KEY, String(expiry));
    // Non-sensitive session cookie (best-effort; not required for correctness).
    const expiresDate = new Date(expiry).toUTCString();
    document.cookie = `${CURRENCY_STORE_KEY}=${encodeURIComponent(code)}; path=/; expires=${expiresDate}; SameSite=Lax`;
  } catch { /* ignore */ }
}

function clearPersistedCurrency() {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(CURRENCY_STORE_KEY);
    window.localStorage.removeItem(CURRENCY_EXPIRY_KEY);
    document.cookie = `${CURRENCY_STORE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  } catch { /* ignore */ }
}

export function PresentmentProvider({ children }) {
  const [supported, setSupported] = useState(["USD", "CAD", "GBP", "EUR", "AUD", "JPY"]);
  const [rates, setRates] = useState({ USD: 1 });
  const [rateSource, setRateSource] = useState("fallback");
  const [rateStale, setRateStale] = useState(false);
  const [rateFetchedAt, setRateFetchedAt] = useState(null);
  const [manualCurrency, setManualCurrency] = useState(() => readPersistedCurrency());
  const [suggestedCurrency, setSuggestedCurrency] = useState("USD");
  const [initialised, setInitialised] = useState(false);

  const activeCurrency = (manualCurrency || suggestedCurrency || "USD").toUpperCase();

  useEffect(() => {
    // Load supported currency list + FX snapshot in parallel with geo hint.
    let cancelled = false;
    const url = API || "";
    Promise.all([
      fetch(`${url}/api/i18n/currencies`).then((r) => r.json()).catch(() => null),
      fetch(`${url}/api/i18n/rates`).then((r) => r.json()).catch(() => null),
      fetch(`${url}/api/i18n/currency-preview`).then((r) => r.json()).catch(() => null),
    ]).then(([c, r, p]) => {
      if (cancelled) return;
      if (c && Array.isArray(c.currencies) && c.currencies.length) {
        setSupported(c.currencies.map((x) => x.toUpperCase()));
      }
      if (r && r.rates) {
        setRates(r.rates);
        setRateSource(r.source || "frankfurter");
        setRateStale(Boolean(r.is_stale));
        setRateFetchedAt(r.fetched_at || null);
      }
      if (p && p.suggested_currency) {
        setSuggestedCurrency(p.suggested_currency.toUpperCase());
      }
      setInitialised(true);
    });
    return () => { cancelled = true; };
  }, []);

  const setCurrency = useCallback((code) => {
    const c = (code || "").toUpperCase();
    if (!c || !supported.includes(c)) return;
    setManualCurrency(c);
    persistCurrency(c);
  }, [supported]);

  const resetCurrency = useCallback(() => {
    setManualCurrency(null);
    clearPersistedCurrency();
  }, []);

  const convertUsdCents = useCallback((usdCents) => {
    const cents = Number(usdCents);
    if (!Number.isFinite(cents) || cents < 0) return null;
    if (activeCurrency === "USD") return cents;
    const rate = rates[activeCurrency];
    if (!rate) return null;
    if (activeCurrency === "JPY") {
      // JPY has no minor units; storefront still stores integer "cents"
      // so ¥12,345 ↔ 1234500.
      return Math.round((cents / 100) * rate * 100);
    }
    return Math.round(cents * rate);
  }, [activeCurrency, rates]);

  const formatUsdCents = useCallback((usdCents, { withCode = true } = {}) => {
    const cents = Number(usdCents);
    if (!Number.isFinite(cents)) return "";
    const cur = activeCurrency;
    const minorUnits = CURRENCY_MINOR_UNITS[cur] ?? 2;
    const value = cur === "USD"
      ? cents / 100
      : (convertUsdCents(cents) ?? 0) / (cur === "JPY" ? 100 : 100);
    const locale = CURRENCY_LOCALE[cur] || "en-US";
    // Luxury display: integer amounts for large numbers, minor units when small.
    const formatter = new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: minorUnits === 0 ? 0 : 0,
    });
    const formatted = formatter.format(cur === "JPY" ? Math.round(value) : Math.round(value));
    const symbol = CURRENCY_SYMBOL[cur] || "$";
    return withCode ? `${symbol}${formatted} ${cur}` : `${symbol}${formatted}`;
  }, [activeCurrency, convertUsdCents]);

  const formatDollars = useCallback((usdDollars, opts) => {
    const cents = Math.round(Number(usdDollars || 0) * 100);
    return formatUsdCents(cents, opts);
  }, [formatUsdCents]);

  const isApproximate = activeCurrency !== "USD";

  const value = useMemo(() => ({
    initialised,
    supported,
    rates,
    rateSource,
    rateStale,
    rateFetchedAt,
    suggestedCurrency,
    manualCurrency,
    currency: activeCurrency,
    setCurrency,
    resetCurrency,
    isApproximate,
    convertUsdCents,
    formatUsdCents,
    formatDollars,
    approxPrefix: isApproximate ? "Approx. " : "",
    symbol: CURRENCY_SYMBOL[activeCurrency] || "$",
  }), [initialised, supported, rates, rateSource, rateStale, rateFetchedAt,
       suggestedCurrency, manualCurrency, activeCurrency, setCurrency,
       resetCurrency, isApproximate, convertUsdCents, formatUsdCents, formatDollars]);

  return <CTX.Provider value={value}>{children}</CTX.Provider>;
}

export function usePresentment() {
  const v = useContext(CTX);
  if (!v) {
    // Safe fallback so components can still render before the provider mounts.
    return {
      initialised: false,
      supported: ["USD"],
      rates: { USD: 1 },
      rateSource: "fallback",
      rateStale: false,
      rateFetchedAt: null,
      suggestedCurrency: "USD",
      manualCurrency: null,
      currency: "USD",
      setCurrency: () => {},
      resetCurrency: () => {},
      isApproximate: false,
      convertUsdCents: (c) => c,
      formatUsdCents: (c) => `$${Math.round((c || 0) / 100).toLocaleString("en-US")} USD`,
      formatDollars: (d) => `$${Math.round(d || 0).toLocaleString("en-US")} USD`,
      approxPrefix: "",
      symbol: "$",
    };
  }
  return v;
}

export default PresentmentProvider;
