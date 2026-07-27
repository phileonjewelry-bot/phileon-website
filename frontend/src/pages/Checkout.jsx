import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

/**
 * PHILEON Checkout — Phase 1 pilot (SCACCO MATTO only).
 *
 * The frontend NEVER sends prices, subtotals, currencies or unit amounts.
 * It sends only product_id + quantity + karat + metalColour + ringSize
 * (+ customer email + idempotency key). The backend is the sole authority
 * for pricing.
 */
const API = process.env.REACT_APP_BACKEND_URL;
const CHECKOUT_ENDPOINT = `${API}/api/checkout/stripe/session`;

const isSupportedItem = (i) => {
  const pid = (i.product_id || "").toString();
  return pid.startsWith("scacco-matto") || i.productKey === "scaccoMatto" || i.slug === "scacco-matto";
};

const formatUsd = (cents) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD`;

export default function Checkout() {
  const navigate = useNavigate();
  const { items: cart } = useCart();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirectPending, setRedirectPending] = useState(false);

  useEffect(() => {
    // Give the CartContext a beat to hydrate from localStorage before redirecting.
    const t = setTimeout(() => {
      if (!cart || cart.length === 0) setRedirectPending(true);
    }, 400);
    return () => clearTimeout(t);
  }, [cart]);

  useEffect(() => {
    if (redirectPending && (!cart || cart.length === 0)) navigate("/cart");
  }, [redirectPending, cart, navigate]);

  const supported = (cart || []).filter(isSupportedItem);
  const unsupported = (cart || []).filter((i) => !isSupportedItem(i));
  const hasUnsupported = unsupported.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (hasUnsupported) { setError("Please remove non-SCACCO MATTO items from your cart to continue with online checkout."); return; }
    if (!supported.length) { setError("Your cart is empty."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Please enter a valid email address."); return; }

    setSubmitting(true);
    try {
      // Frontend sends configuration only — never prices.
      const items = supported.map((i) => ({
        product_id: (i.product_id || "scacco-matto").replace(/^scacco-matto-.*/, "scacco-matto"),
        quantity: i.qty || i.quantity || 1,
        karat: i.karat,
        metalColour: i.metalColour,
        ringSize: i.ringSize,
      }));
      // Stable idempotency key survives duplicate button clicks.
      const idempotency_key = `${email.trim().toLowerCase()}:${JSON.stringify(items)}`;
      const resp = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotency_key },
        body: JSON.stringify({ items, customer_email: email.trim(), idempotency_key }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        const msg = (data?.detail?.message) || (data?.detail?.code) || `Checkout error (HTTP ${resp.status})`;
        setError(msg);
        setSubmitting(false);
        return;
      }
      // Persist the one-time status token so the success page can look up the order.
      if (data.status_token && data.order_number) {
        sessionStorage.setItem(`phi_order_${data.order_number}`, data.status_token);
      }
      window.location.href = data.checkout_url;
    } catch (err) {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  };

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
                <p className="text-white/85 text-[15px]">{i.name || i.productName || "SCACCO MATTO"}</p>
                <p className="text-white/45 text-[12px] mt-1">{i.variant || `${i.karat || ""} · ${i.metalColour || ""} · ${i.ringSize || ""}`}</p>
                <p className="text-white/30 text-[11px] mt-1">Qty {i.qty || i.quantity || 1}</p>
                {!isSupportedItem(i) && (
                  <p className="text-orange-300 text-[11px] mt-2" data-testid={`checkout-item-unsupported-${idx}`}>
                    Not available for online checkout yet — please remove to continue.
                  </p>
                )}
              </div>
              <p className="text-white/75 text-[14px]">{formatUsd((i.unit_amount_cents || 0) * (i.qty || i.quantity || 1))}</p>
            </div>
          ))}
        </div>

        {/* Email */}
        <form onSubmit={handleSubmit} className="mt-8">
          <label className="block">
            <span className="text-[9px] tracking-[0.42em] text-white/30 uppercase">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full bg-transparent border border-white/15 rounded-md px-4 py-3 text-white/90 text-[15px] focus:outline-none focus:border-white/40 transition-colors"
              data-testid="checkout-email"
            />
          </label>
          <p className="text-white/25 text-[11px] mt-2">Order confirmation and shipping updates go here.</p>

          {error && (
            <div className="mt-4 border border-red-800/40 bg-red-950/30 rounded-md px-4 py-3 text-red-200 text-[13px]" role="alert" data-testid="checkout-error">
              {error}
            </div>
          )}

          {hasUnsupported && (
            <div className="mt-4 border border-orange-800/40 bg-orange-950/20 rounded-md px-4 py-3 text-orange-200 text-[13px]" data-testid="checkout-mixed-cart-notice">
              Online checkout is currently available for <strong>SCACCO MATTO</strong> only during this launch. Please remove the other items from your cart to continue.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || hasUnsupported}
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
          </div>
        </form>
      </div>
    </div>
  );
}
