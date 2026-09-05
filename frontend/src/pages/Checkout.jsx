import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { usePresentment } from "@/context/PresentmentContext";

/**
 * PHILEON Secure Checkout.
 *
 * The frontend NEVER sends prices, subtotals, currencies or unit amounts as
 * authoritative values. It sends only:
 *   product_id + qty + tier/variant/karat/metalColour/ringSize/colorway
 *   + displayed_unit_amount_cents (informational snapshot for PRICE_MOVED
 *     detection only — the server always recomputes the true price).
 *
 * The server is the SOLE authority for currency and payment amount.
 */
const API = process.env.REACT_APP_BACKEND_URL;
const CHECKOUT_ENDPOINT = `${API}/api/checkout/stripe/session`;

// Every server-supported slug for the trusted checkout catalog. Kept in
// sync with services/catalog.py `_SUPPORTED_SLUGS` + pricing_engine_catalog.
// If a cart line's slug is not in this set, it cannot be paid for online yet.
const SUPPORTED_SLUGS = new Set([
  // Original 4 static + 7 dynamic rings
  "scacco-matto", "ribbon-regale-edition", "quadriga-dominus", "bajan-joe",
  "la-marva", "annie-rose", "rhythm-mesh-ring", "tola-ii",
  "parabola", "parabola-heritage", "ovation",
  // Full-catalog migration wave 2 — hand-set USD products
  "boss-knot", "lady-boss-knot", "veyron-noir", "wynette-palette", "uncle-jo",
  "rose-of-sharon", "battenti-della-villa", "gent", "stackrats", "coogi-dna-tag",
  "katrina-cascata", "true-vine",
  // Inspiration Vault fixed USD
  "iv-first-discovery", "iv-noir-cadence", "iv-liaison", "iv-noir-tide",
  "iv-prismatic-laurel", "iv-viridian-teardrops", "iv-orbit-lumiere", "iv-deco-eventail",
  // Dynamic-CAD converted to USD (live-priced)
  "bamburgh", "lady-bamburgh", "blessed", "apex", "bound", "morso", "la-bete",
  "cypher", "coogi-i", "homage", "corinthians-15-14", "trace", "galatians-6-14",
  "drape", "fondo-curvo", "prise-de-couronne", "nervatura", "the-don-gorgon",
  "lady-jay", "porta-aurea", "monika-couture", "cocktail-jessica", "rosaria",
  "alejandra-heels", "desir-corset", "forme-cuff", "ptp-cuff",
  // Full-catalog migration wave 3 — Inspiration Vault fixed USD + re-audit
  "iv-altar", "iv-caged-wings", "iv-driven", "iv-echelle", "iv-lucent",
  "iv-monaco", "iv-nova", "iv-oriel", "iv-parabola-atelier",
  "iv-parallax-drop-earrings", "iv-ribbon-regale", "iv-roseline",
  "iv-stampede-set", "iv-nightfang-set",
  "drew-face", "la-madonna", "la-scarpa-della-regina", "midweek",
  "bape", "lisa", "the-carapace", "neighborhood-nip",
  // Wave 4 — Grand Dame (page publishes final USD pricing; stale
  // pricing_engine entry retained but deprecated for checkout).
  "the-grand-dame",
  // Wave 5 — CRESTA NERA (merchant-signed 2 metals × 4 wrist sizes).
  "cresta-nera",
  // Drew's Vault — RETRO BRED · Private Release · CAD (chain sold separately).
  "retro-bred",
  // H.E.R. — HER ETERNAL REIGN · Ladies Fine Jewelry ring · CAD
  "her-eternal-reign",
]);
const DYNAMIC_SLUGS = new Set([
  "la-marva", "annie-rose", "rhythm-mesh-ring", "tola-ii",
  "parabola", "parabola-heritage", "ovation",
]);

// Resolve the base product slug from a cart item. RingProductPage stores it
// on `slug`; some legacy items encode it in `product_id`.
const baseSlug = (i) => (i.slug || i.product_id || "").toString().split(/[?#]/)[0];

const isSupportedItem = (i) => SUPPORTED_SLUGS.has(baseSlug(i));

const formatMoney = (cents, currency = "USD") =>
  `${(cents / 100).toLocaleString(currency === "CAD" ? "en-CA" : "en-US", {
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  })}`;

// Turn one cart item into the API payload row.
const toPayloadItem = (i) => {
  const slug = baseSlug(i);
  const qty = i.qty || i.quantity || 1;
  const displayed_unit_amount_cents = Number.isFinite(i.unit_amount_cents)
    ? Math.round(i.unit_amount_cents)
    : null;
  const row = {
    product_id: slug,
    quantity: qty,
    karat: i.karat || null,
    metalColour: i.metalColour || null,
    ringSize: i.ringSizeLabel || i.ringSize || null,
    variant: i.variant || null,
    colorway: i.colorway || null,
    tier: i.tierKey || null,
    // Cresta Nera + any future bangle uses `wristSizeId` (machine key).
    wristSize: i.wristSizeId || null,
    displayed_unit_amount_cents,
  };
  return row;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items: cart } = useCart();
  const presentment = usePresentment();
  const isApprox = presentment.isApproximate;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirectPending, setRedirectPending] = useState(false);

  // Destination selector state — CLIENT-SUPPLIED but NON-MONETARY.
  // The trusted `rate_cents` comes back from the backend and is display-only.
  const [shippingCountry, setShippingCountry] = useState("");
  const [allowedCountries, setAllowedCountries] = useState([]);
  const [shippingQuote, setShippingQuote] = useState(null);
  const [shippingQuoteError, setShippingQuoteError] = useState("");
  const [shippingQuoteLoading, setShippingQuoteLoading] = useState(false);

  // PRICE_MOVED / LIVE_PRICE_UNAVAILABLE UX state.
  const [priceMoved, setPriceMoved] = useState(null);
  const [liveUnavailable, setLiveUnavailable] = useState(false);

  // ── Trusted CAD BNPL lane state. Server-side authority only.
  const [bnplQuote, setBnplQuote] = useState(null);
  const [useCadBnplLane, setUseCadBnplLane] = useState(false);
  const [bnplQuoteError, setBnplQuoteError] = useState("");
  const [bnplQuoteLoading, setBnplQuoteLoading] = useState(false);

  useEffect(() => {
    // Refresh live market pricing when the checkout page mounts so the
    // Order Summary reflects the freshest quote before the customer submits.
    try { window.dispatchEvent(new Event("phileon:refresh-market")); } catch (_e) { /* noop */ }
    const t = setTimeout(() => { if (!cart || cart.length === 0) setRedirectPending(true); }, 400);
    return () => clearTimeout(t);
  }, [cart]);

  // Load the trusted shipping-country allowlist from the backend authority.
  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/checkout/shipping-countries`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setAllowedCountries(d?.allowed_countries || []); })
      .catch(() => { /* selector still usable; server re-validates on session-create */ });
    return () => { cancelled = true; };
  }, []);

  // UX-only prefill of the shipping-country selector from the same geo signal
  // the storefront already uses to suggest display currency. Fires ONCE, only
  // when:
  //   - the shopper has not already picked a country (`!shippingCountry`)
  //   - the allowlist has loaded
  //   - the suggested country is on the approved allowlist
  // Manual selection ALWAYS wins — subsequent `setShippingCountry(...)` calls
  // are the source of truth and NEVER get overwritten by this effect.
  // Never inferred from the display currency. Never used for money math.
  const [prefillAttempted, setPrefillAttempted] = useState(false);
  useEffect(() => {
    if (prefillAttempted) return;
    if (shippingCountry) return;
    if (!allowedCountries.length) return;
    if (!presentment?.initialised) return;
    const geo = presentment.suggestedCountry;
    if (geo && allowedCountries.includes(geo)) {
      setShippingCountry(geo);
    }
    setPrefillAttempted(true);
  }, [allowedCountries, presentment?.initialised, presentment?.suggestedCountry,
      shippingCountry, prefillAttempted]);

  // Refresh the trusted shipping quote whenever the shopper picks a country.
  useEffect(() => {
    if (!shippingCountry) { setShippingQuote(null); setShippingQuoteError(""); return; }
    let cancelled = false;
    setShippingQuoteLoading(true);
    setShippingQuoteError("");
    fetch(`${API}/api/checkout/shipping-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: shippingCountry }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok) {
          setShippingQuote(null);
          setShippingQuoteError(d?.detail?.message || d?.detail?.code || "Shipping quote unavailable.");
        } else {
          setShippingQuote(d);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setShippingQuote(null);
        setShippingQuoteError("Network error — please try again.");
      })
      .finally(() => { if (!cancelled) setShippingQuoteLoading(false); });
    return () => { cancelled = true; };
  }, [shippingCountry]);

  useEffect(() => {
    if (redirectPending && (!cart || cart.length === 0)) navigate("/cart");
  }, [redirectPending, cart, navigate]);

  // ── Trusted server-side BNPL CAD quote. Fires only when shipping is CA
  //    AND the cart is non-empty. Fail-closed: if it errors, useCadBnplLane
  //    stays false and the toggle disappears — normal USD flow continues.
  useEffect(() => {
    setBnplQuote(null);
    setBnplQuoteError("");
    if (!shippingCountry || shippingCountry !== "CA") {
      setUseCadBnplLane(false);
      return;
    }
    if (!cart || cart.length === 0) return;
    let cancelled = false;
    setBnplQuoteLoading(true);
    fetch(`${API}/api/checkout/bnpl-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map(toPayloadItem).map(({ displayed_unit_amount_cents, ...rest }) => rest),
        shipping_country: shippingCountry,
      }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok) {
          setBnplQuote(null);
          setBnplQuoteError(d?.detail?.message || d?.detail?.code || "Financing unavailable.");
          setUseCadBnplLane(false);
        } else {
          setBnplQuote(d);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setBnplQuote(null);
        setBnplQuoteError("Financing unavailable.");
        setUseCadBnplLane(false);
      })
      .finally(() => { if (!cancelled) setBnplQuoteLoading(false); });
    return () => { cancelled = true; };
  }, [shippingCountry, cart]);

  const supported = useMemo(() => (cart || []).filter(isSupportedItem), [cart]);
  const unsupported = useMemo(() => (cart || []).filter((i) => !isSupportedItem(i)), [cart]);
  const hasUnsupported = unsupported.length > 0;
  const cartCurrency = useMemo(() => {
    const currencies = new Set(supported.map((i) => (i.currency || "USD").toUpperCase()));
    return currencies.size === 1 ? Array.from(currencies)[0] : (Array.from(currencies)[0] || "USD");
  }, [supported]);

  const postCheckout = async ({ items, price_move_acknowledged = false, idempotency_key }) => {
    const resp = await fetch(CHECKOUT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idempotency_key },
      body: JSON.stringify({
        items,
        customer_email: email.trim(),
        idempotency_key,
        price_move_acknowledged,
        shipping_country: shippingCountry,
        display_currency: presentment.currency || null,
        use_cad_bnpl_lane: !!useCadBnplLane,
      }),
    });
    const data = await resp.json().catch(() => ({}));
    return { resp, data };
  };

  const submitCheckout = async ({ overrideItems = null, price_move_acknowledged = false } = {}) => {
    setError("");
    setLiveUnavailable(false);
    if (hasUnsupported) {
      setError("Please remove items that are not yet available for online checkout.");
      return;
    }
    if (!supported.length) { setError("Your cart is empty."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Please enter a valid email address."); return; }
    if (!shippingCountry) { setError("Please select your shipping destination."); return; }
    if (!shippingQuote) { setError("Please wait for the shipping quote to load."); return; }

    setSubmitting(true);
    try {
      const items = overrideItems || supported.map(toPayloadItem);
      const idempotency_key = `${email.trim().toLowerCase()}:${JSON.stringify(items)}:${price_move_acknowledged ? "ack" : "new"}`;
      const { resp, data } = await postCheckout({ items, price_move_acknowledged, idempotency_key });

      if (resp.status === 409 && data?.detail?.code === "PRICE_MOVED") {
        setPriceMoved({ items: data.detail.items || [], sourceItems: items });
        setSubmitting(false);
        return;
      }
      if (resp.status === 503 && data?.detail?.code === "LIVE_PRICE_UNAVAILABLE") {
        setLiveUnavailable(true);
        setSubmitting(false);
        return;
      }
      if (!resp.ok) {
        // Polished fallback for unexpected 5xx / opaque failures. Never
        // leak Stripe/backend jargon; preserve mapped errors already
        // handled above (PRICE_MOVED / LIVE_PRICE_UNAVAILABLE).
        const code = data?.detail?.code;
        const msg = data?.detail?.message;
        if (code && msg) {
          setError(msg);
        } else {
          setError("Something interrupted checkout. Your bag has been saved. Try again or contact concierge@getyourphileon.com.");
        }
        setSubmitting(false);
        return;
      }
      if (data.status_token && data.order_number) {
        sessionStorage.setItem(`phi_order_${data.order_number}`, data.status_token);
      }
      window.location.href = data.checkout_url;
    } catch (err) {
      setError("Something interrupted checkout. Your bag has been saved. Try again or contact concierge@getyourphileon.com.");
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); setPriceMoved(null); submitCheckout(); };

  // "CONTINUE AT UPDATED PRICE" — resubmit with the NEW trusted price as the
  // displayed snapshot and the price_move_acknowledged flag. The backend will
  // re-fetch the live market and re-verify before creating the Stripe session.
  const handleAcceptUpdatedPrice = () => {
    if (!priceMoved) return;
    const movedBySlug = new Map(priceMoved.items.map((m) => [m.product_slug, m]));
    const updatedItems = priceMoved.sourceItems.map((row) => {
      const m = movedBySlug.get(row.product_id);
      return m ? { ...row, displayed_unit_amount_cents: m.new_trusted_price_cents } : row;
    });
    setPriceMoved(null);
    submitCheckout({ overrideItems: updatedItems, price_move_acknowledged: true });
  };

  const handleRetryLive = () => { setLiveUnavailable(false); submitCheckout(); };

  return (
    <div className="min-h-screen bg-black text-white" data-testid="checkout-page">
      <div className="max-w-[720px] mx-auto px-6 md:px-8 pt-8 pb-24">
        <Link to="/cart" className="inline-flex items-center gap-2 text-[9px] tracking-[0.42em] text-white/40 hover:text-white/70 uppercase" data-testid="checkout-back-to-cart">
          <ArrowLeft size={14} /> Return to Cart
        </Link>

        <div className="mt-8">
          <p className="text-[9px] tracking-[0.42em] text-white/30 mb-2">SECURE CHECKOUT</p>
          <h1 className="text-[28px] md:text-[36px] tracking-[0.015em] font-light text-white/90">Complete Your Order</h1>
          <p className="text-white/45 text-[13px] mt-2">Flexible payment options may be available at checkout, subject to eligibility.</p>
        </div>

        {/* Order summary */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-[9px] tracking-[0.42em] text-white/30 mb-4">ORDER SUMMARY</p>
          {(cart || []).map((i, idx) => (
            <div key={idx} className="flex justify-between items-start py-3 border-b border-white/[0.04]" data-testid={`checkout-item-${idx}`}>
              <div className="flex-1">
                <p className="text-white/85 text-[15px]">{i.name || i.productName || baseSlug(i).toUpperCase()}</p>
                <p className="text-white/45 text-[12px] mt-1">
                  {i.variant || `${i.karat || ""} · ${i.metalColour || ""} · ${i.ringSizeLabel || i.ringSize || ""}`}
                </p>
                <p className="text-white/30 text-[11px] mt-1">Qty {i.qty || i.quantity || 1}</p>
                {!isSupportedItem(i) && (
                  <p className="text-orange-300 text-[11px] mt-2" data-testid={`checkout-item-unsupported-${idx}`}>
                    Not available for online checkout yet — please remove to continue.
                  </p>
                )}
              </div>
              <p className="text-white/75 text-[14px]" data-testid={`checkout-item-price-${idx}`}>
                {(() => {
                  const cents = (i.unit_amount_cents || 0) * (i.qty || i.quantity || 1);
                  if (isApprox && cents) return `Approx. ${presentment.formatUsdCents(cents)}`;
                  return `$${formatMoney(cents, (i.currency || "USD").toUpperCase())} ${(i.currency || "USD").toUpperCase()}`;
                })()}
              </p>
            </div>
          ))}
          <div className="flex justify-between items-baseline py-3 border-b border-white/[0.04]" data-testid="checkout-shipping-row">
            <p className="text-white/60 text-[13px]">Shipping</p>
            <p className="text-white/75 text-[13px]" data-testid="checkout-shipping-amount">
              {shippingQuote
                ? (shippingQuote.rate_cents === 0
                    ? "Complimentary"
                    : (isApprox
                        ? `Approx. ${presentment.formatUsdCents(shippingQuote.rate_cents)}`
                        : `$${(shippingQuote.rate_cents / 100).toLocaleString("en-US")} USD`))
                : "Calculated by destination"}
            </p>
          </div>
        </div>

        {/* Email */}
        <form onSubmit={handleSubmit} className="mt-8">
          {/* Shipping destination selector — server-authoritative quote */}
          <div className="mb-6" data-testid="checkout-shipping-block">
            <span className="block text-[9px] tracking-[0.42em] text-white/30 uppercase">Shipping destination</span>
            <select
              value={shippingCountry}
              onChange={(e) => setShippingCountry(e.target.value)}
              className="mt-2 w-full bg-transparent border border-white/15 rounded-md px-4 py-3 text-white/90 text-[15px] focus:outline-none focus:border-white/40 transition-colors appearance-none"
              data-testid="shipping-country-select"
            >
              <option value="" className="bg-black">Select destination…</option>
              {allowedCountries.map((c) => (
                <option key={c} value={c} className="bg-black">{c}</option>
              ))}
            </select>
            <p className="text-white/25 text-[11px] mt-2">
              Your full shipping address will be entered securely at checkout.
            </p>
            <div className="mt-3 min-h-[24px]" data-testid="shipping-quote-display">
              {!shippingCountry && (
                <p className="text-white/40 text-[13px]">Shipping calculated by destination</p>
              )}
              {shippingCountry && shippingQuoteLoading && (
                <p className="text-white/40 text-[13px]">Loading trusted quote…</p>
              )}
              {shippingCountry && shippingQuote && !shippingQuoteLoading && (
                <p className="text-white/85 text-[13px]" data-testid="shipping-quote-line">
                  {shippingQuote.rate_cents === 0
                    ? "Shipping — Complimentary"
                    : (isApprox
                        ? `Shipping — Approx. ${presentment.formatUsdCents(shippingQuote.rate_cents)}`
                        : `Shipping — $${(shippingQuote.rate_cents / 100).toLocaleString("en-US")} USD`)}
                  <span className="text-white/40"> · {shippingQuote.service_label}</span>
                </p>
              )}
              {shippingCountry && shippingQuoteError && !shippingQuoteLoading && (
                <p className="text-orange-300 text-[12px]" data-testid="shipping-quote-error">
                  {shippingQuoteError}
                </p>
              )}
            </div>
          </div>

          <label className="block">
            <span className="text-[9px] tracking-[0.42em] text-white/30 uppercase">Email</span>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full bg-transparent border border-white/15 rounded-md px-4 py-3 text-white/90 text-[15px] focus:outline-none focus:border-white/40 transition-colors"
              data-testid="checkout-email"
            />
          </label>
          <p className="text-white/25 text-[11px] mt-2">Order confirmation and shipping updates go here.</p>

          {error && (
            <div className="mt-4 border border-white/15 bg-black/40 rounded-md px-4 py-3 text-white/80 text-[13px]" role="alert" data-testid="checkout-error">
              {error}
            </div>
          )}

          {hasUnsupported && (
            <div className="mt-4 border border-white/12 bg-black/40 rounded-md px-4 py-3 text-white/70 text-[13px]" data-testid="checkout-mixed-cart-notice">
              One or more items in your cart are not yet available for online checkout. Please remove them to continue.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || hasUnsupported || !shippingCountry || !shippingQuote}
            className="w-full bg-white text-black rounded-md py-4 mt-6 text-[10px] tracking-[0.18em] font-medium hover:bg-white/92 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-300"
            data-testid="checkout-continue-btn"
          >
            {submitting ? "REDIRECTING TO STRIPE…" : "PAY WITH CARD OR FINANCING"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-white/22 text-[10px] leading-relaxed">
              Payments are securely processed by Stripe. Card details never touch PHILEON servers.<br/>
              Flexible payment options (Affirm, Klarna, Afterpay, Apple Pay, Google Pay) may appear at checkout when eligible.
            </p>
            {isApprox && (
              <p className="text-white/40 text-[10px] tracking-[0.14em] mt-3" data-testid="checkout-adaptive-note">
                Prices shown in {presentment.currency} are approximate. Final local amount confirmed at secure checkout.
              </p>
            )}
          </div>

          {/* Trusted CAD BNPL lane — Klarna / Affirm Canada eligibility */}
          {shippingCountry === "CA" && bnplQuote && (
            <div
              className="mt-6 border border-[#C6A24A]/25 bg-black/40 p-4 rounded-[2px]"
              data-testid="checkout-bnpl-cad-block"
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCadBnplLane}
                  onChange={(e) => setUseCadBnplLane(e.target.checked)}
                  className="mt-1 accent-[#C6A24A]"
                  data-testid="checkout-bnpl-cad-toggle"
                />
                <div>
                  <p className="text-[#C6A24A] text-[12px] tracking-[0.22em] uppercase">
                    Pay in CAD with Klarna or Affirm
                  </p>
                  <p className="text-white/60 text-[12px] mt-1" data-testid="checkout-bnpl-cad-amount">
                    Charged in CAD · Approx.
                    {" "}C${(bnplQuote.presentment_total_cents / 100).toLocaleString("en-CA", {maximumFractionDigits:0})} CAD
                    <span className="text-white/40"> · canonical ${(bnplQuote.canonical_total_cents/100).toLocaleString("en-US")} USD</span>
                  </p>
                  <p className="text-white/35 text-[10px] leading-relaxed mt-1">
                    Financing eligibility, approval, and installment amounts are decided by Stripe / Klarna / Affirm at checkout.
                  </p>
                </div>
              </label>
            </div>
          )}
          {shippingCountry === "CA" && !bnplQuote && !bnplQuoteLoading && bnplQuoteError && (
            <p className="text-white/40 text-[10px] mt-3" data-testid="checkout-bnpl-cad-unavailable">
              Financing options are temporarily unavailable — you can still complete checkout with card.
            </p>
          )}
        </form>
      </div>

      {/* PRICE_MOVED overlay — cinematic PHILEON re-quote confirmation. */}
      {priceMoved && (
        <PriceMovedOverlay
          moved={priceMoved.items}
          onAccept={handleAcceptUpdatedPrice}
          onReturnToCart={() => { setPriceMoved(null); navigate("/cart"); }}
        />
      )}

      {/* LIVE_PRICE_UNAVAILABLE overlay */}
      {liveUnavailable && (
        <LivePriceUnavailableOverlay
          onRetry={handleRetryLive}
          onReturnToCart={() => { setLiveUnavailable(false); navigate("/cart"); }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICE_MOVED — PHILEON Fine Jewelry cinematic re-quote screen.
//   NOT alert()/confirm() and NOT red marketplace-style warnings.
// ─────────────────────────────────────────────────────────────────────────────
function PriceMovedOverlay({ moved, onAccept, onReturnToCart }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center px-6" data-testid="price-moved-overlay">
      <div className="max-w-[560px] w-full border border-white/12 bg-black/70 rounded-[2px] px-8 md:px-10 py-10 shadow-[0_40px_120px_-30px_rgba(255,255,255,0.08)]">
        <p className="text-[10px] tracking-[0.42em] text-white/40 uppercase" data-testid="price-moved-eyebrow">LIVE GOLD PRICE UPDATED</p>
        <h2 className="text-white/92 tracking-[0.015em] font-light text-[26px] md:text-[30px] mt-3 leading-snug">
          Your quote has been refreshed.
        </h2>
        <p className="text-white/55 text-[13px] mt-3 leading-relaxed">
          Precious-metal pricing changed while this piece was in your cart. Please review the updated amount before we continue to secure payment.
        </p>

        <div className="mt-8 divide-y divide-white/[0.06] border-y border-white/10">
          {moved.map((m, idx) => (
            <div key={idx} className="py-5 flex items-baseline justify-between gap-6" data-testid={`price-moved-item-${idx}`}>
              <div>
                <p className="text-white/80 text-[15px] uppercase tracking-[0.02em]">{m.product_slug.replace(/-/g, " ")}</p>
                <p className="text-white/45 text-[12px] mt-1">{m.variant}</p>
              </div>
              <div className="text-right">
                <p className="text-white/35 text-[10px] tracking-[0.32em] uppercase">Previous</p>
                <p className="text-white/45 text-[13px] line-through">
                  ${(m.old_display_price_cents / 100).toLocaleString("en-CA")} {m.currency}
                </p>
                <p className="text-white/35 text-[10px] tracking-[0.32em] uppercase mt-3">Updated</p>
                <p className="text-white/95 text-[16px] tracking-[0.015em]" data-testid={`price-moved-new-${idx}`}>
                  ${(m.new_trusted_price_cents / 100).toLocaleString("en-CA")} {m.currency}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onAccept}
          className="w-full bg-white text-black rounded-[2px] py-4 mt-8 text-[10px] tracking-[0.28em] font-medium hover:bg-white/92 transition-colors duration-300"
          data-testid="price-moved-accept-btn"
        >
          CONTINUE AT UPDATED PRICE
        </button>
        <button
          onClick={onReturnToCart}
          className="w-full border border-white/15 text-white/75 rounded-[2px] py-4 mt-3 text-[10px] tracking-[0.28em] font-medium hover:border-white/35 hover:text-white/95 transition-colors duration-300"
          data-testid="price-moved-return-btn"
        >
          RETURN TO CART
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE_PRICE_UNAVAILABLE — deterministic, provider-agnostic notice.
// ─────────────────────────────────────────────────────────────────────────────
function LivePriceUnavailableOverlay({ onRetry, onReturnToCart }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center px-6" data-testid="live-price-unavailable-overlay">
      <div className="max-w-[520px] w-full border border-white/12 bg-black/70 rounded-[2px] px-8 md:px-10 py-10">
        <p className="text-[10px] tracking-[0.42em] text-white/40 uppercase">CURRENT METAL PRICE REFRESHING</p>
        <h2 className="text-white/92 tracking-[0.015em] font-light text-[24px] md:text-[28px] mt-3 leading-snug">
          One moment, please.
        </h2>
        <p className="text-white/55 text-[13px] mt-3 leading-relaxed">
          We’re refreshing current precious-metal pricing. Please try again shortly.
        </p>
        <button
          onClick={onRetry}
          className="w-full bg-white text-black rounded-[2px] py-4 mt-8 text-[10px] tracking-[0.28em] font-medium hover:bg-white/92 transition-colors duration-300"
          data-testid="live-price-retry-btn"
        >
          TRY AGAIN
        </button>
        <button
          onClick={onReturnToCart}
          className="w-full border border-white/15 text-white/75 rounded-[2px] py-4 mt-3 text-[10px] tracking-[0.28em] font-medium hover:border-white/35 hover:text-white/95 transition-colors duration-300"
          data-testid="live-price-return-btn"
        >
          RETURN TO CART
        </button>
      </div>
    </div>
  );
}
