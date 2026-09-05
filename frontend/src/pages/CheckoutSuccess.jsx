/* ==========================================================================
   PHILEON — CHECKOUT SUCCESS
   Editorial Fine Jewelry presentation. Ivory on charcoal, restrained gold
   accents, generous spacing, no ecommerce green-checkmark styling.

   Local safety:
     • Missing `order` / `session_id` params never crash the page
     • No secret keys, session IDs, webhook secrets or backend debug data
       are rendered to the customer
     • Pricing is displayed ONLY from the trusted backend order payload —
       never from URL params
     • Currency is derived from the resolved backend order data, not
       hard-coded, so RRE (CAD), QUADRIGA / SCACCO (USD) all format
       correctly
   ========================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API = process.env.REACT_APP_BACKEND_URL;

// Currency-aware money formatter. Never hard-codes USD.
function formatMoney(cents, currency) {
  if (typeof cents !== "number" || isNaN(cents)) return "—";
  const code = (currency || "USD").toString().toUpperCase();
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} ${code}`;
}

// Any product slug we know is made to order. Used only to display the
// production-window note when the backend order contains such an item.
const MADE_TO_ORDER_SLUGS = new Set([
  "ribbon-regale-edition",
  "quadriga-dominus",
  "scacco-matto",
]);

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderNumber = params.get("order");
  // session_id is preserved in the URL for backend architecture, but never
  // rendered prominently to the customer.
  const [order, setOrder] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const pollRef = useRef(null);

  useEffect(() => {
    // Fail-soft when order / token missing — do NOT crash the page.
    if (!orderNumber) return;
    const token = sessionStorage.getItem(`phi_order_${orderNumber}`);
    if (!token) return;

    const poll = async () => {
      try {
        const resp = await fetch(
          `${API}/api/checkout/order/${encodeURIComponent(orderNumber)}/status?token=${encodeURIComponent(token)}`
        );
        if (!resp.ok) { setFetchError("status_unavailable"); return; }
        const data = await resp.json();
        setOrder(data);
        const terminal = ["paid", "failed", "refunded", "partially_refunded", "cancelled", "disputed"];
        if (terminal.includes(data.payment_status)) {
          if (pollRef.current) clearInterval(pollRef.current);
          if (data.payment_status === "paid") {
            try { localStorage.removeItem("phileon_cart"); } catch (_e) { /* noop */ }
          }
        }
      } catch (_e) {
        // transient network — keep polling
      }
    };
    poll();
    pollRef.current = setInterval(poll, 3000);
    const stopAfter = setTimeout(() => { if (pollRef.current) clearInterval(pollRef.current); }, 60000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); clearTimeout(stopAfter); };
  }, [orderNumber]);

  // ── Derived status wording (never fake "Paid") ────────────────────────────
  const paymentStatus = order?.payment_status || null;
  const statusLine = (() => {
    if (paymentStatus === "paid") return "Payment confirmation received";
    if (paymentStatus === "failed" || paymentStatus === "cancelled") return "Payment not completed";
    if (paymentStatus === "refunded" || paymentStatus === "partially_refunded") return "Refund processed";
    if (paymentStatus === "disputed") return "Payment under review";
    if (paymentStatus) return "Payment confirmation pending";
    // No verified backend state available yet.
    return orderNumber ? "Order submitted" : "Order submitted";
  })();

  // Currency for money formatting — comes from the trusted backend order.
  // Prefer the actual charged currency (BNPL CAD / Adaptive Pricing) when
  // present; fall back to canonical USD.
  const currency = order?.charged_currency || order?.currency || "USD";
  const displayTotalCents = (typeof order?.charged_amount_cents === "number")
    ? order.charged_amount_cents
    : order?.total_cents;
  const hasMadeToOrder =
    Array.isArray(order?.items) &&
    order.items.some((i) => MADE_TO_ORDER_SLUGS.has(i.product_slug || i.internal_product_id));

  return (
    <div className="ps-page" data-testid="checkout-success-page">
      <style>{`
        .ps-page { background:#08070a; color:#e8e0cf;
          font-family:'Cormorant Garamond',serif; min-height:100vh;
          padding:clamp(48px,8vw,120px) clamp(20px,4vw,60px) 96px; }
        .ps-wrap { max-width:720px; margin:0 auto; text-align:center; }

        .ps-eyebrow { font-family:'Cinzel',serif; font-size:10.5px;
          letter-spacing:.7em; text-transform:uppercase;
          color:#c8a24a; margin:0 0 28px; }
        .ps-heading { font-family:'Cinzel',serif; font-weight:400;
          font-size:clamp(36px,6vw,72px); letter-spacing:.14em; line-height:1.1;
          margin:0 0 18px; color:#f4ecd6; text-transform:uppercase; }
        .ps-support { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(17px,1.8vw,22px); letter-spacing:.02em;
          color:rgba(232,224,207,.7); margin:0 0 48px; }

        .ps-meta { display:grid; grid-template-columns:1fr 1fr; gap:36px;
          max-width:480px; margin:0 auto 40px;
          padding:26px 24px;
          border-top:1px solid rgba(200,162,74,.18);
          border-bottom:1px solid rgba(200,162,74,.18);
          text-align:left; }
        @media (max-width:480px){ .ps-meta { grid-template-columns:1fr; gap:20px; text-align:center; } }
        .ps-meta-label { font-family:'Cinzel',serif; font-size:9.5px;
          letter-spacing:.5em; text-transform:uppercase;
          color:rgba(232,224,207,.5); margin:0 0 8px; }
        .ps-meta-value { font-family:'Cinzel',serif; font-size:14px;
          letter-spacing:.22em; text-transform:uppercase; color:#f4ecd6; margin:0; }

        .ps-intention { max-width:600px; margin:0 auto 20px;
          font-size:clamp(15px,1.5vw,17px); line-height:1.7; color:#d6cdb6; }
        .ps-mto { max-width:600px; margin:0 auto 44px;
          font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(14px,1.4vw,16px); color:rgba(232,224,207,.6);
          line-height:1.65; letter-spacing:.02em; }

        /* Summary — only rendered when trusted order data is present */
        .ps-summary { max-width:520px; margin:8px auto 48px;
          padding:24px 22px;
          border:1px solid rgba(200,162,74,.18);
          text-align:left; }
        .ps-summary-heading { font-family:'Cinzel',serif; font-size:10px;
          letter-spacing:.5em; text-transform:uppercase;
          color:#c8a24a; margin:0 0 18px; }
        .ps-line { display:flex; justify-content:space-between; gap:16px;
          align-items:baseline; padding:10px 0; border-bottom:1px dotted rgba(200,162,74,.14); }
        .ps-line:last-of-type { border-bottom:none; }
        .ps-line-name { font-family:'Cormorant Garamond',serif; font-size:15px;
          color:#f4ecd6; margin:0; letter-spacing:.02em; }
        .ps-line-variant { font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:13px; color:rgba(232,224,207,.55); margin:2px 0 0; }
        .ps-line-amount { font-family:'Cinzel',serif; font-size:12px;
          letter-spacing:.22em; color:#e8e0cf; white-space:nowrap; }
        .ps-total { margin-top:14px; padding-top:14px;
          border-top:1px solid rgba(200,162,74,.22); }
        .ps-total .ps-total-label { font-family:'Cinzel',serif; font-size:10.5px;
          letter-spacing:.5em; text-transform:uppercase; color:rgba(232,224,207,.55); }
        .ps-total .ps-total-amount { font-family:'Cinzel',serif; font-size:14px;
          letter-spacing:.26em; color:#c8a24a; }

        /* Actions */
        .ps-actions { display:flex; flex-direction:column; align-items:center;
          gap:14px; margin-top:12px; }
        .ps-btn { display:inline-flex; align-items:center; justify-content:center;
          min-width:260px; padding:18px 44px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.5em;
          text-transform:uppercase; text-decoration:none;
          transition:background 320ms ease,color 320ms ease,letter-spacing 320ms ease,border-color 320ms ease; }
        .ps-btn.primary { color:#f4ecd6; border:1.5px solid #c8a24a; background:transparent; }
        .ps-btn.primary:hover { background:#c8a24a; color:#08070a; letter-spacing:.6em; }
        .ps-btn.secondary { color:rgba(232,224,207,.6); border:none; padding:14px 32px;
          font-size:10px; letter-spacing:.42em; }
        .ps-btn.secondary:hover { color:#c8a24a; }
      `}</style>

      <div className="ps-wrap">
        <p className="ps-eyebrow">PHILEON · Checkout</p>
        <h1 className="ps-heading" data-testid="checkout-heading">ORDER RECEIVED.</h1>
        <p className="ps-support">Your PHILEON piece is now in motion.</p>

        {/* Order + status meta — always rendered, safe fallbacks */}
        <div className="ps-meta" data-testid="checkout-meta">
          <div>
            <p className="ps-meta-label">Order</p>
            <p className="ps-meta-value" data-testid="checkout-order-identifier">
              {orderNumber || "Pending assignment"}
            </p>
          </div>
          <div>
            <p className="ps-meta-label">Status</p>
            <p className="ps-meta-value" data-testid="checkout-status-line">{statusLine}</p>
          </div>
        </div>

        {/* Intention copy — required verbatim */}
        <p className="ps-intention" data-testid="checkout-intention-copy">
          Every PHILEON piece is prepared with intention. You&apos;ll receive
          confirmation and fulfillment updates as your order moves through
          production and dispatch.
        </p>

        {/* Made-to-order note — only when the order actually contains an MTO item */}
        {hasMadeToOrder ? (
          <p className="ps-mto" data-testid="checkout-mto-note">
            Made-to-order timelines vary by piece. Your order confirmation will
            include the production window associated with your selection.
          </p>
        ) : null}

        {/* Order summary — only if trusted order data is available */}
        {order && Array.isArray(order.items) && order.items.length > 0 ? (
          <div className="ps-summary" data-testid="checkout-order-summary">
            <p className="ps-summary-heading">Your Selection</p>
            {order.items.map((i, idx) => (
              <div key={idx} className="ps-line" data-testid={`checkout-line-${idx}`}>
                <div>
                  <p className="ps-line-name">{i.product_name}</p>
                  <p className="ps-line-variant">
                    {i.variant}
                    {typeof i.quantity === "number" ? ` · Qty ${i.quantity}` : ""}
                  </p>
                </div>
                <p className="ps-line-amount">
                  {formatMoney(i.unit_amount_cents * (i.quantity || 1), currency)}
                </p>
              </div>
            ))}
            <div className="ps-line ps-total">
              <span className="ps-total-label">Total</span>
              <span className="ps-total-amount" data-testid="checkout-total">
                {formatMoney(displayTotalCents, currency)}
              </span>
            </div>
          </div>
        ) : null}

        <div className="ps-actions">
          {orderNumber && sessionStorage.getItem(`phi_order_${orderNumber}`) ? (
            <Link
              to={`/orders/${encodeURIComponent(orderNumber)}/status?token=${encodeURIComponent(sessionStorage.getItem(`phi_order_${orderNumber}`))}`}
              className="ps-btn primary"
              data-testid="checkout-view-order-status"
            >
              View Order Status
            </Link>
          ) : null}
          <Link to="/shop" className="ps-btn primary" data-testid="checkout-continue-exploring">
            Continue Exploring
          </Link>
          <Link
            to="/shop?category=rings"
            className="ps-btn secondary"
            data-testid="checkout-view-fine-jewelry"
          >
            View Fine Jewelry
          </Link>
        </div>

        {/* Non-blocking soft error surface — used only to signal that live
            status could not be retrieved. Never exposes backend detail. */}
        {fetchError ? (
          <p style={{
            marginTop: 32, fontFamily: "'Playfair Display', serif",
            fontStyle: "italic", fontSize: 13, color: "rgba(232,224,207,.4)",
            letterSpacing: ".02em",
          }} data-testid="checkout-status-soft-notice">
            We&apos;ll email you the moment your status is confirmed.
          </p>
        ) : null}
      </div>
    </div>
  );
}
