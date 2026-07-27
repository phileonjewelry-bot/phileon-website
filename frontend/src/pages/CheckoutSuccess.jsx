import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API = process.env.REACT_APP_BACKEND_URL;

const formatUsd = (cents) => `$${(cents / 100).toLocaleString("en-US")} USD`;

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderNumber = params.get("order");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!orderNumber) { setError("Missing order reference."); return; }
    const token = sessionStorage.getItem(`phi_order_${orderNumber}`);
    if (!token) { setError("Missing secure order token. If you completed a payment, we will still process it on the next signed provider event."); return; }

    const poll = async () => {
      try {
        const resp = await fetch(`${API}/api/checkout/order/${encodeURIComponent(orderNumber)}/status?token=${encodeURIComponent(token)}`);
        if (!resp.ok) { setError(`Unable to retrieve order status (HTTP ${resp.status}).`); return; }
        const data = await resp.json();
        setOrder(data);
        setAttempts((a) => a + 1);
        const terminal = ["paid", "failed", "refunded", "partially_refunded", "cancelled", "disputed"];
        if (terminal.includes(data.payment_status)) {
          if (pollRef.current) clearInterval(pollRef.current);
          try { localStorage.removeItem("phileon_cart"); } catch (_e) { /* ignore */ }
        }
      } catch (_e) {
        // transient network — keep polling
      }
    };
    poll();
    pollRef.current = setInterval(poll, 3000);
    // stop polling after ~60 seconds regardless
    const stopAfter = setTimeout(() => { if (pollRef.current) clearInterval(pollRef.current); }, 60000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); clearTimeout(stopAfter); };
  }, [orderNumber]);

  const status = order?.payment_status || "pending";
  const isPaid = status === "paid";
  const isFailed = ["failed", "cancelled"].includes(status);

  return (
    <div className="min-h-screen bg-black text-white" data-testid="checkout-success-page">
      <div className="max-w-[640px] mx-auto px-6 md:px-8 pt-16 pb-24 text-center">
        <p className="text-[9px] tracking-[0.42em] text-white/30 mb-3">CHECKOUT · CONFIRMATION</p>

        {!order && !error && (
          <>
            <h1 className="text-[28px] md:text-[36px] tracking-[0.015em] font-light text-white/90">Order received</h1>
            <p className="text-white/50 text-[14px] mt-3" data-testid="checkout-status-confirming">Confirming payment with your bank…</p>
          </>
        )}

        {order && !isPaid && !isFailed && (
          <>
            <h1 className="text-[28px] md:text-[36px] tracking-[0.015em] font-light text-white/90">Order received</h1>
            <p className="text-white/50 text-[14px] mt-3" data-testid="checkout-status-processing">
              Confirming payment. Some financing and bank-redirect payments can take a moment to finalize — you&apos;ll receive a confirmation email as soon as it settles.
            </p>
          </>
        )}

        {isPaid && (
          <>
            <h1 className="text-[28px] md:text-[36px] tracking-[0.015em] font-light text-white/90" data-testid="checkout-status-paid">Payment confirmed</h1>
            <p className="text-white/50 text-[14px] mt-3">Thank you. A confirmation is on its way to your inbox.</p>
          </>
        )}

        {isFailed && (
          <>
            <h1 className="text-[28px] md:text-[36px] tracking-[0.015em] font-light text-red-200" data-testid="checkout-status-failed">Payment not completed</h1>
            <p className="text-white/50 text-[14px] mt-3">Your card was not charged. Please try again or use a different method.</p>
          </>
        )}

        {error && (
          <div className="mt-6 text-orange-300 text-[13px] border border-orange-800/40 bg-orange-950/20 rounded-md px-4 py-3" data-testid="checkout-success-error">{error}</div>
        )}

        {order && (
          <div className="mt-10 text-left border border-white/10 rounded-md p-6" data-testid="checkout-order-summary">
            <div className="flex justify-between text-[12px] tracking-[0.28em] text-white/40 uppercase">
              <span>Order</span>
              <span data-testid="checkout-order-number">{order.order_number}</span>
            </div>
            <div className="mt-4 space-y-3">
              {order.items?.map((i, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <p className="text-white/85 text-[14px]">{i.product_name}</p>
                    <p className="text-white/45 text-[12px]">{i.variant} · Qty {i.quantity}</p>
                  </div>
                  <p className="text-white/70 text-[13px]">{formatUsd(i.unit_amount_cents * i.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between">
              <span className="text-white/50 text-[13px]">Total</span>
              <span className="text-white/90 text-[16px]" data-testid="checkout-total">{formatUsd(order.total_cents)}</span>
            </div>
            <p className="text-white/25 text-[10px] mt-3">Status: <span data-testid="checkout-payment-status">{order.payment_status}</span> · Attempts: {attempts}</p>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3">
          <Link to="/" className="text-[10px] tracking-[0.28em] text-white/50 hover:text-white/80 uppercase" data-testid="checkout-return-home">Return to PHILEON</Link>
          <Link to="/shop?category=rings" className="text-[10px] tracking-[0.28em] text-white/30 hover:text-white/60 uppercase">Continue browsing Fine Jewelry</Link>
        </div>
      </div>
    </div>
  );
}
