/* PHILEON — Layer 7 client analytics hook.

   Emits the four CLIENT-OBSERVED early-funnel events through the
   EXISTING /api/behavior/events pipeline. No new event authority, no
   separate analytics vendor. Server stamps `env` from PHILEON_ENV — the
   browser NEVER asserts environment.

   Contracts:
     PRODUCT_VIEWED    → fired once per (session, slug) within 30 s
     PRODUCT_LIKED     → fired on transition INTO the liked state (never on unlike)
     ADDED_TO_CART     → fired only on a successful add
     CHECKOUT_STARTED  → fired when the customer intentionally initiates
                         checkout (client-observed — distinct from the
                         server-authoritative CHECKOUT_SESSION_CREATED)

   Search:
     recordSearch(query, resultCount) → POST /api/search-events
*/
import { useCallback, useEffect, useMemo } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;
const DEDUPE_MS = 30_000;
const RECENT_KEY = 'phi_analytics_recent_v1';
const SESSION_KEY = 'phileon_session_id';
const CONSENT_KEY = 'phileon_privacy_consent_v1';

// Layer 8 §2 — optional analytics is OFF until the user accepts. The
// analytics session identifier MUST NOT exist for a fresh visitor or a
// rejector; it is created lazily only when we are about to send an
// event and consent is true. Withdrawing consent removes it.
function analyticsAllowed() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const p = JSON.parse(raw);
    return p && p.analytics === true;
  } catch (_e) {
    return false;
  }
}

function purgeAnalyticsStorage() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch (_e) { /* silent */ }
  try { sessionStorage.removeItem(RECENT_KEY); } catch (_e) { /* silent */ }
}

function readRecent() {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_e) {
    return {};
  }
}

function writeRecent(state) {
  try {
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(state));
  } catch (_e) {
    /* silent */
  }
}

function ensureSessionId() {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      const rand = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sid = `phi-${rand}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch (_e) {
    return 'phi-anon-fallback';
  }
}

function shouldDedupe(eventType, productSlug) {
  const state = readRecent();
  const key = `${eventType}:${productSlug || '*'}`;
  const last = state[key] || 0;
  const now = Date.now();
  if (now - last < DEDUPE_MS) return true;
  state[key] = now;
  // Trim old entries to keep sessionStorage bounded.
  const cutoff = now - 10 * 60_000;
  Object.keys(state).forEach((k) => {
    if (state[k] < cutoff) delete state[k];
  });
  writeRecent(state);
  return false;
}

async function post(url, body) {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (_e) {
    /* analytics failures never block the customer flow */
  }
}

export function useAnalytics() {
  // Layer 8 §2 — do NOT eagerly create the session id on mount. The
  // hook consumer receives the current (possibly-absent) value; a real
  // id is generated only if the user has accepted analytics AND we are
  // about to send an event.
  const sessionId = useMemo(() => {
    try { return sessionStorage.getItem(SESSION_KEY) || null; }
    catch (_e) { return null; }
  }, []);

  // On consent-withdrawal notifications, purge analytics-only storage.
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.analytics === false) purgeAnalyticsStorage();
    };
    window.addEventListener('phileon:privacy-choices', handler);
    return () => window.removeEventListener('phileon:privacy-choices', handler);
  }, []);

  const send = useCallback(async (eventType, productSlug, opts = {}) => {
    if (!productSlug) return;
    // Layer 8 §2 — respect user analytics consent AND lazily create the
    // session id only after consent (never merely to wait for it).
    if (!analyticsAllowed()) return;
    const sid = ensureSessionId();
    if (!opts.force && shouldDedupe(eventType, productSlug)) return;
    await post(`${API}/api/behavior/events`, {
      event_type: eventType,
      product_slug: String(productSlug),
      session_id: sid,
      source: opts.source || null,
    });
  }, []);

  const productViewed = useCallback(
    (slug, opts) => send('PRODUCT_VIEWED', slug, opts),
    [send],
  );

  const productLiked = useCallback(
    (slug, opts) => send('PRODUCT_LIKED', slug, opts),
    [send],
  );

  const addedToCart = useCallback(
    (slug, opts) => send('ADDED_TO_CART', slug, opts),
    [send],
  );

  const checkoutStarted = useCallback(
    (slug, opts) => send('CHECKOUT_STARTED', slug || 'cart', opts),
    [send],
  );

  const recordSearch = useCallback(async (query, resultCount) => {
    if (!query || !String(query).trim()) return;
    if (!analyticsAllowed()) return;
    const sid = ensureSessionId();
    await post(`${API}/api/search-events`, {
      query: String(query).slice(0, 200),
      result_count: Math.max(0, Number(resultCount) || 0),
      session_id: sid,
    });
  }, []);

  return {
    sessionId,
    productViewed,
    productLiked,
    addedToCart,
    checkoutStarted,
    recordSearch,
  };
}

export default useAnalytics;
