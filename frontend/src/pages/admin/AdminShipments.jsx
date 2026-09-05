/* ==========================================================================
   PHILEON — ADMIN SHIPMENTS
   Authenticated admin-only shipment-management surface.
   Auth: reads `localStorage.phileon_admin_token` (JWT) — every backend call
   passes `Authorization: Bearer <token>`. Non-admin routes are guarded by
   the surrounding `<AdminLayout />` which redirects to /admin/login when
   no token is present.

   Backend contract (never duplicated here):
     GET  /api/admin/orders/{order_number}          → order summary
     POST /api/admin/orders/{order_number}/mark-shipped  { carrier, tracking_number, tracking_url? }

   Business rules ENFORCED SERVER-SIDE (single source of truth):
     • order must exist  (404 NOT_FOUND)
     • order must be paid/authorized  (409 NOT_PAID)
     • extra fields rejected  (422)
     • duplicate mark-shipped is idempotent — no duplicate emails
     • unsafe tracking URLs are stripped by the email builder

   UX safety:
     • Client-side pre-validation of carrier/tracking (belt & braces).
     • Client-side confirmation modal before submit to prevent double-taps.
     • Submit button disabled while an in-flight request is pending.
   ========================================================================== */
import React, { useEffect, useMemo, useState } from "react";
import { Search, Truck, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

function authHeaders() {
  const t = localStorage.getItem("phileon_admin_token") || "";
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function formatMoney(cents, currency) {
  if (typeof cents !== "number") return "—";
  const code = (currency || "USD").toUpperCase();
  const symbols = { USD: "$", CAD: "C$", GBP: "£", EUR: "€", AUD: "A$", JPY: "¥" };
  const sym = symbols[code] || "$";
  const isJpy = code === "JPY";
  const value = isJpy ? Math.round(cents / 100) : cents / 100;
  return `${sym}${value.toLocaleString("en-US", {
    minimumFractionDigits: isJpy ? 0 : (cents % 100 === 0 ? 0 : 2),
    maximumFractionDigits: isJpy ? 0 : 2,
  })} ${code}`;
}

function isSafeTrackingUrl(v) {
  if (!v) return true; // optional
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (!s) return true;
  return s.startsWith("http://") || s.startsWith("https://");
}

export default function AdminShipments() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);

  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // {ok, email_sent}
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    document.title = "PHILEON — Admin · Shipments";
  }, []);

  // Reset transient state when a different order is loaded (not on refresh
  // of the same order — success banner must survive the post-submit refresh).
  const [lastOrderNumber, setLastOrderNumber] = useState(null);
  useEffect(() => {
    const on = order?.order_number || null;
    if (on !== lastOrderNumber) {
      setCarrier("");
      setTrackingNumber("");
      setTrackingUrl("");
      setSubmitResult(null);
      setSubmitError("");
      setConfirmOpen(false);
      setLastOrderNumber(on);
    }
  }, [order?.order_number, lastOrderNumber]);

  const eligible = useMemo(() => {
    if (!order) return false;
    if (!["paid", "authorized"].includes((order.payment_status || "").toLowerCase())) return false;
    return true;
  }, [order]);

  const alreadyShipped = useMemo(() => {
    return !!order && (
      (order.fulfillment_status || "").toLowerCase() === "shipped" ||
      order.shipping_notification_sent === true
    );
  }, [order]);

  const validationError = useMemo(() => {
    if (!carrier.trim()) return "Carrier is required.";
    if (!trackingNumber.trim()) return "Tracking number is required.";
    if (trackingUrl && !isSafeTrackingUrl(trackingUrl))
      return "Tracking URL must start with http:// or https://";
    return "";
  }, [carrier, trackingNumber, trackingUrl]);

  const canSubmit = eligible && !validationError && !submitBusy && !alreadyShipped;

  async function fetchOrder(e) {
    e?.preventDefault?.();
    const on = orderNumber.trim();
    if (!on) return;
    setLookupBusy(true);
    setLookupError("");
    setOrder(null);
    setSubmitResult(null);
    setSubmitError("");
    try {
      const resp = await fetch(
        `${API}/api/admin/orders/${encodeURIComponent(on)}`,
        { headers: authHeaders() }
      );
      if (resp.status === 401 || resp.status === 403) {
        setLookupError("Your admin session has expired. Please log in again.");
        return;
      }
      if (resp.status === 404) {
        setLookupError(`Order ${on} was not found.`);
        return;
      }
      if (!resp.ok) {
        setLookupError("Unable to load this order. Please try again.");
        return;
      }
      const data = await resp.json();
      setOrder(data);
    } catch (_e) {
      setLookupError("Network error while loading this order.");
    } finally {
      setLookupBusy(false);
    }
  }

  async function submitShipment() {
    if (!order || !canSubmit) return;
    setSubmitBusy(true);
    setSubmitError("");
    try {
      const payload = {
        carrier: carrier.trim(),
        tracking_number: trackingNumber.trim(),
      };
      if (trackingUrl.trim()) payload.tracking_url = trackingUrl.trim();
      const resp = await fetch(
        `${API}/api/admin/orders/${encodeURIComponent(order.order_number)}/mark-shipped`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(payload),
        }
      );
      if (resp.status === 401 || resp.status === 403) {
        setSubmitError("Your admin session has expired. Please log in again.");
        return;
      }
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const code = data?.detail?.code || "ERROR";
        const msg = code === "NOT_PAID"
          ? "Order is not paid. Only paid or authorized orders can be shipped."
          : code === "NOT_FOUND"
          ? "Order no longer exists."
          : "Unable to mark shipped.";
        setSubmitError(msg);
        return;
      }
      setSubmitResult({ ok: true, email_sent: !!data.email_sent });
      setConfirmOpen(false);
      // Refresh the order card so the admin sees the new state.
      await fetchOrder();
    } catch (_e) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitBusy(false);
    }
  }

  return (
    <div className="admin-shipments" data-testid="admin-shipments-page">
      <style>{`
        .admin-shipments { color:#e8e0cf; font-family:'Inter',sans-serif; max-width:900px; }
        .as-title { font-family:'Cinzel',serif; letter-spacing:.24em;
          text-transform:uppercase; font-size:22px; color:#f4ecd6;
          margin:0 0 8px; }
        .as-sub { font-family:'Cormorant Garamond',serif; font-style:italic;
          color:rgba(232,224,207,.6); margin:0 0 28px; }
        .as-card { background:#0f0f14; border:1px solid #33322a; padding:24px;
          border-radius:6px; margin-bottom:20px; }
        .as-label { font-family:'Cinzel',serif; font-size:10px;
          letter-spacing:.4em; text-transform:uppercase; color:rgba(232,224,207,.55);
          display:block; margin-bottom:8px; }
        .as-input { width:100%; padding:12px 14px; background:#08070a;
          color:#e8e0cf; border:1px solid #33322a; font-size:14px;
          font-family:'Inter',sans-serif; outline:none; }
        .as-input:focus { border-color:#c8a24a; }
        .as-row { display:flex; gap:12px; align-items:end; }
        .as-btn {
          font-family:'Cinzel',serif; letter-spacing:.32em; font-size:11px;
          text-transform:uppercase; padding:12px 22px;
          background:#c8a24a; color:#08070a; border:none; cursor:pointer;
          transition:opacity 200ms ease, background 200ms ease;
        }
        .as-btn:hover:not(:disabled) { background:#e0b862; }
        .as-btn:disabled { opacity:.4; cursor:not-allowed; }
        .as-btn.ghost { background:transparent; color:#e8e0cf; border:1px solid #33322a; }
        .as-btn.ghost:hover:not(:disabled) { border-color:#c8a24a; color:#c8a24a; background:transparent; }
        .as-btn.danger { background:transparent; color:#c65b5b; border:1px solid #c65b5b; }
        .as-btn.danger:hover:not(:disabled) { background:#c65b5b; color:#08070a; }

        .as-meta { display:grid; grid-template-columns: 1fr 1fr; gap:14px 24px;
          margin:20px 0; }
        .as-meta-item p:first-child { margin:0 0 4px; font-family:'Cinzel',serif;
          font-size:10px; letter-spacing:.35em; text-transform:uppercase;
          color:rgba(232,224,207,.5); }
        .as-meta-item p:last-child { margin:0; font-size:14px; color:#f4ecd6; word-break:break-word; }

        .as-item { padding:10px 0; border-bottom:1px dotted #33322a; }
        .as-item:last-child { border-bottom:none; }
        .as-item-name { color:#f4ecd6; font-size:14px; margin:0; }
        .as-item-variant { color:rgba(232,224,207,.55); font-size:12.5px; font-style:italic; margin:2px 0 0; }

        .as-total { text-align:right; font-family:'Cinzel',serif; font-size:12px;
          letter-spacing:.24em; color:#c8a24a; margin-top:14px; padding-top:14px;
          border-top:1px solid #33322a; }

        .as-error { color:#e08282; font-size:13px; margin-top:8px; }
        .as-notice { color:#c8a24a; font-size:13px; margin-top:8px; }
        .as-success { background:#0f2010; border:1px solid #2e5a30; color:#c9e0c9;
          padding:16px; border-radius:4px; display:flex; gap:12px; align-items:flex-start;
          margin-bottom:20px; }
        .as-error-block { background:#20100f; border:1px solid #5a2e2e; color:#e0c9c9;
          padding:16px; border-radius:4px; display:flex; gap:12px; align-items:flex-start;
          margin-bottom:20px; }

        .as-ship-badge { display:inline-block; padding:4px 10px;
          font-family:'Cinzel',serif; font-size:10px; letter-spacing:.3em;
          text-transform:uppercase; background:#c8a24a; color:#08070a; }

        .as-tracking-link { color:#c8a24a; text-decoration:none;
          border-bottom:1px solid rgba(200,162,74,.35); padding-bottom:1px;
          font-size:13px; display:inline-flex; align-items:center; gap:6px; }
        .as-tracking-link:hover { color:#e8e0cf; }

        /* Confirmation modal */
        .as-modal-backdrop {
          position:fixed; inset:0; background:rgba(0,0,0,.72); z-index:200;
          display:flex; align-items:center; justify-content:center; padding:24px;
        }
        .as-modal {
          background:#0f0f14; border:1px solid #33322a; padding:32px;
          max-width:480px; width:100%; border-radius:6px;
        }
        .as-modal h3 { font-family:'Cinzel',serif; letter-spacing:.18em;
          text-transform:uppercase; color:#f4ecd6; margin:0 0 12px; font-size:16px; }
        .as-modal p { color:rgba(232,224,207,.75); font-size:14px; margin:0 0 8px; line-height:1.55; }
        .as-modal-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:24px; }
      `}</style>

      <h1 className="as-title">Shipments</h1>
      <p className="as-sub">Look up a paid order to record its carrier, tracking, and mark it shipped.</p>

      {/* ── LOOKUP ─────────────────────────────────────────────── */}
      <form onSubmit={fetchOrder} className="as-card" data-testid="admin-shipments-lookup-form">
        <label className="as-label" htmlFor="order-lookup">Order Number</label>
        <div className="as-row">
          <input
            id="order-lookup"
            className="as-input"
            placeholder="PHI-YYYYMMDD-XXXXXX"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            data-testid="admin-shipments-order-input"
          />
          <button
            type="submit"
            className="as-btn"
            disabled={lookupBusy || !orderNumber.trim()}
            data-testid="admin-shipments-lookup-btn"
          >
            <Search size={14} style={{ display:'inline', marginRight: 8 }} />
            {lookupBusy ? "Loading…" : "Load"}
          </button>
        </div>
        {lookupError ? (
          <p className="as-error" data-testid="admin-shipments-lookup-error">{lookupError}</p>
        ) : null}
      </form>

      {/* ── PERSISTENT POST-SUBMIT SUCCESS BANNER ────────────────
          Rendered OUTSIDE the shipment form so the confirmation
          (including "Customer notification sent.") remains visible
          after the follow-up fetch flips the order to already-shipped
          and the form-card unmounts. */}
      {submitResult?.ok && (
        <div className="as-success" data-testid="admin-shipments-success">
          <CheckCircle2 size={20} />
          <div>
            <p style={{ margin:'0 0 4px', fontWeight:600 }}>Order marked as SHIPPED.</p>
            <p style={{ margin:0, fontSize:13 }} data-testid="admin-shipments-notification-status">
              Customer notification {submitResult.email_sent ? "sent." : "not sent (no email configured or already sent previously)."}
            </p>
          </div>
        </div>
      )}

      {/* ── ORDER CARD ─────────────────────────────────────────── */}
      {order && (
        <div className="as-card" data-testid="admin-shipments-order-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <div>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.32em',
                          textTransform:'uppercase', color:'rgba(232,224,207,.55)', margin:'0 0 4px' }}>
                Order
              </p>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:20, letterSpacing:'.14em', color:'#f4ecd6', margin:0 }}
                 data-testid="admin-shipments-order-number">
                {order.order_number}
              </p>
            </div>
            {alreadyShipped ? (
              <span className="as-ship-badge" data-testid="admin-shipments-already-shipped">Shipped</span>
            ) : null}
          </div>

          <div className="as-meta">
            <div className="as-meta-item">
              <p>Customer</p>
              <p data-testid="admin-shipments-customer">{order.customer_email || "—"}</p>
            </div>
            <div className="as-meta-item">
              <p>Payment</p>
              <p data-testid="admin-shipments-payment-status">{order.payment_status || "—"}</p>
            </div>
            <div className="as-meta-item">
              <p>Fulfillment</p>
              <p data-testid="admin-shipments-fulfillment-status">
                {order.fulfillment_status || order.fulfilment_status || "—"}
              </p>
            </div>
            <div className="as-meta-item">
              <p>Destination</p>
              <p>{order.shipping?.country || "—"} · {order.shipping?.service_label || "—"}</p>
            </div>
          </div>

          <div>
            {(order.items || []).map((it, idx) => (
              <div key={idx} className="as-item" data-testid={`admin-shipments-item-${idx}`}>
                <p className="as-item-name">
                  {it.product_name}
                  {it.ring_size ? ` · Size ${it.ring_size}` : ""}
                </p>
                <p className="as-item-variant">
                  {it.variant} · Qty {it.quantity} · {formatMoney((it.unit_amount_cents || 0) * (it.quantity || 1), order.currency)}
                </p>
              </div>
            ))}
            <p className="as-total" data-testid="admin-shipments-total">
              TOTAL — {formatMoney(order.total_cents, order.currency)}
            </p>
          </div>

          {/* Existing shipment info, once shipped */}
          {alreadyShipped && (order.carrier || order.tracking_number) ? (
            <div className="as-meta" data-testid="admin-shipments-existing-tracking" style={{ marginTop:24 }}>
              <div className="as-meta-item">
                <p>Carrier</p>
                <p>{order.carrier || "—"}</p>
              </div>
              <div className="as-meta-item">
                <p>Tracking #</p>
                <p>{order.tracking_number || "—"}</p>
              </div>
              {order.shipped_at ? (
                <div className="as-meta-item">
                  <p>Shipped at</p>
                  <p>{new Date(order.shipped_at).toLocaleString()}</p>
                </div>
              ) : null}
              {order.tracking_url && isSafeTrackingUrl(order.tracking_url) ? (
                <div className="as-meta-item">
                  <p>Tracking Link</p>
                  <p>
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="as-tracking-link"
                      data-testid="admin-shipments-existing-tracking-link"
                    >
                      Open carrier <ExternalLink size={12} />
                    </a>
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {/* ── SHIPMENT FORM ───────────────────────────────────────── */}
      {order && !alreadyShipped ? (
        <div className="as-card" data-testid="admin-shipments-form-card">
          <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:14, letterSpacing:'.28em',
                       textTransform:'uppercase', color:'#c8a24a', margin:'0 0 20px' }}>
            <Truck size={14} style={{ display:'inline', marginRight:8 }} />
            Mark as Shipped
          </h2>

          {!eligible ? (
            <p className="as-error" data-testid="admin-shipments-not-eligible">
              This order is not eligible for shipment (payment status: {order.payment_status || "unknown"}).
            </p>
          ) : (
            <>
              {submitError ? (
                <div className="as-error-block" data-testid="admin-shipments-submit-error">
                  <AlertTriangle size={20} />
                  <div><p style={{ margin:0 }}>{submitError}</p></div>
                </div>
              ) : null}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label className="as-label" htmlFor="carrier">Carrier</label>
                  <input
                    id="carrier"
                    className="as-input"
                    placeholder="e.g. UPS, FedEx, Canada Post, DHL"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    maxLength={80}
                    data-testid="admin-shipments-carrier-input"
                  />
                </div>
                <div>
                  <label className="as-label" htmlFor="tracking-number">Tracking Number</label>
                  <input
                    id="tracking-number"
                    className="as-input"
                    placeholder="e.g. 1Z999AA10123456784"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    maxLength={120}
                    data-testid="admin-shipments-tracking-number-input"
                  />
                </div>
              </div>
              <div style={{ marginTop:16 }}>
                <label className="as-label" htmlFor="tracking-url">Tracking URL (optional)</label>
                <input
                  id="tracking-url"
                  className="as-input"
                  placeholder="https://…"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  maxLength={500}
                  data-testid="admin-shipments-tracking-url-input"
                />
                <p style={{ fontSize:12, color:'rgba(232,224,207,.5)', margin:'6px 0 0' }}>
                  Must start with http:// or https://. Others are stripped for customer safety.
                </p>
              </div>

              {validationError ? (
                <p className="as-error" data-testid="admin-shipments-validation-error" style={{ marginTop:14 }}>
                  {validationError}
                </p>
              ) : null}

              <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:24 }}>
                <button
                  className="as-btn"
                  onClick={() => setConfirmOpen(true)}
                  disabled={!canSubmit}
                  data-testid="admin-shipments-submit-btn"
                >
                  Mark as Shipped
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* ── CONFIRMATION MODAL ─────────────────────────────────── */}
      {confirmOpen && order && (
        <div
          className="as-modal-backdrop"
          onClick={() => (submitBusy ? null : setConfirmOpen(false))}
          data-testid="admin-shipments-confirm-backdrop"
        >
          <div className="as-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Shipment</h3>
            <p>You&apos;re about to mark <strong>{order.order_number}</strong> as SHIPPED.</p>
            <p>Carrier: <strong>{carrier}</strong></p>
            <p>Tracking: <strong>{trackingNumber}</strong></p>
            {trackingUrl ? <p>URL: <strong>{trackingUrl}</strong></p> : null}
            <p style={{ marginTop:16, color:'#c8a24a', fontSize:13 }}>
              The customer will receive a shipment confirmation email exactly once — repeated submissions do not resend.
            </p>
            <div className="as-modal-actions">
              <button
                className="as-btn ghost"
                onClick={() => setConfirmOpen(false)}
                disabled={submitBusy}
                data-testid="admin-shipments-confirm-cancel"
              >
                Cancel
              </button>
              <button
                className="as-btn"
                onClick={submitShipment}
                disabled={submitBusy}
                data-testid="admin-shipments-confirm-submit"
              >
                {submitBusy ? "Submitting…" : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
