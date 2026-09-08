/* PHILEON — Tier A privacy-minimised aggregate telemetry (client).

   These fires happen for EVERY visitor including rejectors. They MUST
   NEVER create/read a session identifier, cookie, or fingerprint. They
   must never write to localStorage / sessionStorage. Failure is silent.

   Consent gate does NOT apply here — no identity is created and no
   free-text query is sent. See /privacy for the disclosure.
*/
const API = process.env.REACT_APP_BACKEND_URL;

async function send(payload) {
  try {
    await fetch(`${API}/api/telemetry/aggregate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (_e) {
    /* silent — never blocks the customer flow */
  }
}

export function bumpPdpView(slug) {
  if (!slug) return;
  send({ event_type: 'PDP_VIEW_COUNT', product_slug: String(slug) });
}

export function bumpProductLike(slug) {
  if (!slug) return;
  send({ event_type: 'PRODUCT_LIKE_COUNT', product_slug: String(slug) });
}

export function bumpAddToCart(slug) {
  if (!slug) return;
  send({ event_type: 'ADD_TO_CART_COUNT', product_slug: String(slug) });
}

export function bumpCheckoutStart(slug) {
  send({ event_type: 'CHECKOUT_START_COUNT',
         product_slug: slug ? String(slug) : null });
}

// Search: NEVER send the raw query — only a coarse result bucket.
export function bumpSearch(resultCount) {
  const n = Number(resultCount) || 0;
  const bucket = n <= 0 ? 'none' : (n < 5 ? 'few' : 'many');
  send({ event_type: 'SEARCH_COUNT', result_bucket: bucket });
  if (n <= 0) {
    send({ event_type: 'ZERO_RESULT_SEARCH_COUNT', result_bucket: 'none' });
  }
}
