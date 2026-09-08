/* ==========================================================================
   PHILEON — CUSTOMER ORDER STATUS
   Secure, token-protected. Deep-link ONLY.
   Route: /orders/:orderNumber/status?token=<one-time-status-token>

   Trust rules:
     • Never renders the token in visible content, alt text, tab title, or
       analytics beacons — it lives ONLY in the URL query and Authorization
       to the backend.
     • Never surfaces Stripe IDs, webhook metadata, database IDs, FX metadata
       or any internal-only field.
     • Backend endpoint /api/checkout/order/{order_number}/status is the
       single source of truth (see backend/routes/checkout.py::order_status).
     • Missing or invalid token → generic "Unable to verify" message, never
       leaks whether the order exists.
   ========================================================================== */
import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import OrderSupportCta from "@/components/OrderSupportCta";

const API = process.env.REACT_APP_BACKEND_URL;

function formatMoney(cents, currency) {
  if (typeof cents !== "number" || isNaN(cents)) return "—";
  const code = (currency || "USD").toString().toUpperCase();
  const isJpy = code === "JPY";
  const symbols = { USD: "$", CAD: "C$", GBP: "£", EUR: "€", AUD: "A$", JPY: "¥" };
  const sym = symbols[code] || "$";
  const value = isJpy ? Math.round(cents / 100) : cents / 100;
  return `${sym}${value.toLocaleString("en-US", {
    minimumFractionDigits: isJpy ? 0 : (cents % 100 === 0 ? 0 : 2),
    maximumFractionDigits: isJpy ? 0 : 2,
  })} ${code}`;
}

function paymentLine(paymentStatus) {
  if (paymentStatus === "paid") return "Payment confirmed";
  if (paymentStatus === "authorized") return "Payment authorized";
  if (paymentStatus === "failed") return "Payment not completed";
  if (paymentStatus === "cancelled") return "Payment cancelled";
  if (paymentStatus === "refunded") return "Refunded";
  if (paymentStatus === "partially_refunded") return "Partially refunded";
  if (paymentStatus === "disputed") return "Under review";
  if (paymentStatus === "requires_action") return "Awaiting confirmation";
  return "Pending confirmation";
}

function fulfillmentLine(order) {
  const f = (order?.fulfillment_status || "").toLowerCase();
  if (f === "shipped") return "Shipped";
  if (f === "delivered") return "Delivered";
  if (f === "ready_to_ship") return "Ready to ship";
  if (f === "in_production") return "In production";
  if (f === "processing") return "Processing";
  if (f === "cancelled") return "Cancelled";
  // Fall back to the legacy fulfilment_status if present.
  const legacy = (order?.fulfilment_status || "").toLowerCase();
  if (legacy === "pending_review") return "Under concierge review";
  if (order?.payment_status === "paid") return "Processing";
  return "Awaiting payment";
}

function isValidHttpUrl(u) {
  if (!u || typeof u !== "string") return false;
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_e) {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  ReturnCta — customer-facing return/warranty entry point.
    Never renders admin data. Uses only the order + customer-safe
    RMA state fetched with the same token as the OrderStatusPage.    */
/* ------------------------------------------------------------------ */

const _FINAL_SALE_HINT = /\b(silver|sterling|custom|bespoke|atelier)\b/i;

function classifyForCtaHint(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  if (items.length === 0) return "unknown";
  let anyFinal = false;
  let anyGold = false;
  for (const it of items) {
    const s = `${it.product_name || ""} ${it.variant || ""} ${it.karat || ""} ${it.metal_colour || ""}`;
    if (_FINAL_SALE_HINT.test(s)) anyFinal = true;
    if (/\b(gold|karat|10K|14K|18K|22K|24K|vermeil)\b/i.test(s)) anyGold = true;
  }
  if (anyFinal && !anyGold) return "final_sale";
  if (anyGold) return "eligible_gold";
  return "unknown";
}

const REASON_OPTIONS = [
  { value: "changed_mind",         label: "Changed my mind" },
  { value: "size_fit",             label: "Size / fit" },
  { value: "appearance_style",     label: "Appearance / style" },
  { value: "arrived_damaged",      label: "Item arrived damaged" },
  { value: "suspected_defect",     label: "Suspected manufacturing defect" },
  { value: "wrong_item_received",  label: "Wrong item received" },
  { value: "other",                label: "Other" },
];

function ReturnCta({ order, showForm, onOpen, reason, onReason,
                      note, onNote, busy, error, onSubmit }) {
  const payment = (order?.payment_status || "").toLowerCase();
  if (!["paid", "authorized"].includes(payment)) return null;
  const hint = classifyForCtaHint(order);

  return (
    <div data-testid="return-cta">
      <p className="os-eyebrow" style={{ textAlign: "left", margin: 0 }}>
        Return / Warranty Help
      </p>
      {hint === "final_sale" ? (
        <p style={{ marginTop: 12, color: "rgba(232,224,207,.75)",
                    fontFamily: "'Cormorant Garamond',serif",
                    fontStyle: "italic", fontSize: 15.5 }}
           data-testid="return-final-sale">
          Some pieces on this order (silver, custom, engraved or resized) are
          FINAL SALE. For a suspected defect or warranty claim, please
          contact <a href="mailto:concierge@getyourphileon.com"
                       style={{ color: "#c8a24a" }}>
            concierge@getyourphileon.com
          </a>.
        </p>
      ) : null}
      {!showForm ? (
        <button onClick={onOpen}
                data-testid="return-open-form-btn"
                style={{
                  marginTop: 14, fontFamily: "'Cinzel',serif",
                  fontSize: 11, letterSpacing: ".32em",
                  textTransform: "uppercase", padding: "12px 22px",
                  background: "transparent", color: "#c8a24a",
                  border: "1px solid #c8a24a", cursor: "pointer",
                  transition: "background 200ms, color 200ms",
                }}>
          {hint === "final_sale" ? "Warranty / Support Help" : "Request a Return"}
        </button>
      ) : (
        <div style={{ marginTop: 14 }} data-testid="return-form">
          <label style={{ display: "block", marginBottom: 6,
                            fontFamily: "'Cinzel',serif", fontSize: 10.5,
                            letterSpacing: ".32em", textTransform: "uppercase",
                            color: "rgba(232,224,207,.55)" }}>Reason</label>
          <select value={reason} onChange={(e) => onReason(e.target.value)}
                  data-testid="return-reason-select"
                  style={{ width: "100%", padding: "10px 12px",
                            background: "#08070a", color: "#e8e0cf",
                            border: "1px solid #33322a", fontFamily: "inherit",
                            fontSize: 15 }}>
            <option value="">Choose one…</option>
            {REASON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <label style={{ display: "block", margin: "14px 0 6px",
                            fontFamily: "'Cinzel',serif", fontSize: 10.5,
                            letterSpacing: ".32em", textTransform: "uppercase",
                            color: "rgba(232,224,207,.55)" }}>
            Note (optional)
          </label>
          <textarea rows={4} value={note} onChange={(e) => onNote(e.target.value)}
                    maxLength={1000}
                    data-testid="return-note-input"
                    style={{ width: "100%", padding: "10px 12px",
                              background: "#08070a", color: "#e8e0cf",
                              border: "1px solid #33322a",
                              fontFamily: "inherit", fontSize: 15, resize: "vertical" }} />
          {error ? (
            <p style={{ margin: "10px 0 0", color: "#e0c9c9", fontSize: 13.5 }}
               data-testid="return-form-error">{error}</p>
          ) : null}
          <button onClick={onSubmit} disabled={busy || !reason}
                  data-testid="return-submit-btn"
                  style={{ marginTop: 14, fontFamily: "'Cinzel',serif",
                            fontSize: 11, letterSpacing: ".32em",
                            textTransform: "uppercase", padding: "12px 22px",
                            background: "#c8a24a", color: "#08070a",
                            border: "1px solid #c8a24a",
                            cursor: busy || !reason ? "not-allowed" : "pointer",
                            opacity: busy || !reason ? 0.5 : 1 }}>
            {busy ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrderStatusPage() {
  const { orderNumber } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null); // "unauthorized" | "not_found" | "network"
  const [loading, setLoading] = useState(true);
  // Return / RMA state — token-secured lookup via /api/returns
  const [rmaCase, setRmaCase] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [returnBusy, setReturnBusy] = useState(false);
  const [returnError, setReturnError] = useState("");

  useEffect(() => {
    // Keep the token out of the browser tab title.
    document.title = orderNumber
      ? `PHILEON — Order ${orderNumber}`
      : "PHILEON — Order Status";
    window.scrollTo(0, 0);
  }, [orderNumber]);

  useEffect(() => {
    if (!orderNumber) { setError("not_found"); setLoading(false); return; }
    if (!token) { setError("unauthorized"); setLoading(false); return; }

    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(
          `${API}/api/checkout/order/${encodeURIComponent(orderNumber)}/status?token=${encodeURIComponent(token)}`
        );
        if (cancelled) return;
        if (resp.status === 403) { setError("unauthorized"); setLoading(false); return; }
        if (resp.status === 404) { setError("not_found"); setLoading(false); return; }
        if (!resp.ok) { setError("network"); setLoading(false); return; }
        const data = await resp.json();
        if (cancelled) return;
        setOrder(data);
        setLoading(false);
        // Silent RMA lookup — token already verified above; safe to reuse.
        try {
          const rr = await fetch(
            `${API}/api/returns?order_number=${encodeURIComponent(orderNumber)}&token=${encodeURIComponent(token)}`
          );
          if (!cancelled && rr.ok) {
            const rd = await rr.json();
            setRmaCase(rd?.case || null);
          }
        } catch (_e) { /* non-fatal */ }
      } catch (_e) {
        if (cancelled) return;
        setError("network");
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderNumber, token]);

  const currency = order?.charged_currency || "USD";
  const total = typeof order?.charged_amount_cents === "number"
    ? order.charged_amount_cents : 0;
  const trackingHref = isValidHttpUrl(order?.tracking_url)
    ? order.tracking_url : null;

  return (
    <div className="os-page" data-testid="order-status-page">
      <style>{`
        .os-page {
          background:#08070a; color:#e8e0cf;
          font-family:'Cormorant Garamond',serif; min-height:100vh;
          padding: clamp(48px, 8vw, 120px) clamp(20px, 4vw, 60px) 96px;
        }
        .os-wrap { max-width: 720px; margin: 0 auto; }
        .os-eyebrow {
          font-family:'Cinzel',serif; font-size:10.5px;
          letter-spacing:.7em; text-transform:uppercase;
          color:#c8a24a; margin:0 0 24px; text-align:center;
        }
        .os-heading {
          font-family:'Cinzel',serif; font-weight:400;
          font-size:clamp(32px,5.5vw,60px); letter-spacing:.14em;
          line-height:1.1; margin:0 0 16px; color:#f4ecd6;
          text-align:center; text-transform:uppercase;
        }
        .os-support {
          font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(16px,1.6vw,20px); letter-spacing:.02em;
          color:rgba(232,224,207,.7); text-align:center; margin:0 0 48px;
        }

        .os-block {
          border-top:1px solid rgba(200,162,74,.18);
          padding-top:26px; margin-top:26px;
        }
        .os-row {
          display:flex; justify-content:space-between; gap:16px;
          align-items:baseline; padding:10px 0;
          border-bottom:1px dotted rgba(200,162,74,.12);
        }
        .os-row:last-child { border-bottom:none; }
        .os-label {
          font-family:'Cinzel',serif; font-size:10.5px;
          letter-spacing:.42em; text-transform:uppercase;
          color:rgba(232,224,207,.55);
        }
        .os-value {
          font-family:'Cinzel',serif; font-size:12.5px;
          letter-spacing:.16em; color:#f4ecd6; text-align:right;
          word-break: break-word;
        }
        .os-value.plain {
          font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:15px; letter-spacing:.02em; color:#e8e0cf;
        }
        .os-value a { color:#c8a24a; text-decoration:none;
          border-bottom:1px solid rgba(200,162,74,.35); padding-bottom:1px; }
        .os-value a:hover { color:#f4ecd6; border-color:#c8a24a; }

        .os-summary { margin-top: 8px; }
        .os-line {
          display:flex; justify-content:space-between; gap:18px;
          padding:14px 0; border-bottom:1px dotted rgba(200,162,74,.14);
        }
        .os-line:last-of-type { border-bottom:none; }
        .os-line-name { font-size:15.5px; color:#f4ecd6; letter-spacing:.02em; margin:0; }
        .os-line-variant {
          font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:13px; color:rgba(232,224,207,.55); margin:2px 0 0;
        }
        .os-line-amount {
          font-family:'Cinzel',serif; font-size:12px;
          letter-spacing:.22em; color:#e8e0cf; white-space:nowrap;
        }
        .os-total-row {
          margin-top:16px; padding-top:16px;
          border-top:1px solid rgba(200,162,74,.22);
          display:flex; justify-content:space-between;
        }
        .os-total-label {
          font-family:'Cinzel',serif; font-size:10.5px;
          letter-spacing:.5em; text-transform:uppercase;
          color:rgba(232,224,207,.55);
        }
        .os-total-amount {
          font-family:'Cinzel',serif; font-size:14px;
          letter-spacing:.26em; color:#c8a24a;
        }

        .os-error {
          max-width:520px; margin:60px auto 0;
          padding:32px 28px; border:1px solid rgba(200,162,74,.22);
          text-align:center;
        }
        .os-error p { color:rgba(232,224,207,.72); margin:0 0 8px; }
        .os-actions {
          display:flex; flex-direction:column; align-items:center;
          gap:14px; margin-top:64px;
        }
        .os-btn {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:220px; padding:16px 40px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.5em;
          text-transform:uppercase; text-decoration:none;
          color:#f4ecd6; border:1.5px solid #c8a24a; background:transparent;
          transition:background 320ms ease,color 320ms ease,letter-spacing 320ms ease;
        }
        .os-btn:hover { background:#c8a24a; color:#08070a; letter-spacing:.6em; }
        .os-btn.secondary {
          color:rgba(232,224,207,.6); border:none; padding:12px 30px;
          font-size:10px; letter-spacing:.42em;
        }
        .os-btn.secondary:hover { color:#c8a24a; background:transparent; }

        .os-skel {
          height:14px; background:linear-gradient(90deg,rgba(200,162,74,.06),rgba(200,162,74,.14),rgba(200,162,74,.06));
          background-size:200% 100%; animation:osShimmer 1400ms linear infinite; border-radius:2px;
        }
        @keyframes osShimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
      `}</style>

      <div className="os-wrap">
        <p className="os-eyebrow">PHILEON · Order Status</p>
        <h1 className="os-heading" data-testid="order-status-heading">
          {order?.order_number ? `ORDER ${order.order_number}` : "Order Status"}
        </h1>
        <p className="os-support">A private view of your PHILEON order.</p>

        {loading && (
          <div data-testid="order-status-loading">
            <div className="os-skel" style={{ width: "60%", margin: "0 auto 14px" }} />
            <div className="os-skel" style={{ width: "80%", margin: "0 auto 14px" }} />
            <div className="os-skel" style={{ width: "40%", margin: "0 auto" }} />
          </div>
        )}

        {!loading && error === "unauthorized" && (
          <div className="os-error" data-testid="order-status-unauthorized">
            <p>We were unable to verify this order link.</p>
            <p>Please open the link from your confirmation email, or contact our concierge team.</p>
          </div>
        )}
        {!loading && error === "not_found" && (
          <div className="os-error" data-testid="order-status-not-found">
            <p>This order could not be located.</p>
            <p>Please open the link from your confirmation email, or contact our concierge team.</p>
          </div>
        )}
        {!loading && error === "network" && (
          <div className="os-error" data-testid="order-status-network-error">
            <p>Order status is temporarily unavailable.</p>
            <p>Please try again shortly.</p>
          </div>
        )}

        {!loading && !error && order && (
          <>
            {/* Status */}
            <div className="os-block" data-testid="order-status-block">
              <div className="os-row">
                <span className="os-label">Payment</span>
                <span className="os-value" data-testid="order-payment-status">
                  {paymentLine(order.payment_status)}
                </span>
              </div>
              <div className="os-row">
                <span className="os-label">Fulfillment</span>
                <span className="os-value" data-testid="order-fulfillment-status">
                  {fulfillmentLine(order)}
                </span>
              </div>
              <div className="os-row">
                <span className="os-label">Production Timing</span>
                <span className="os-value plain" data-testid="order-dispatch-estimate">
                  {order.dispatch_estimate || "Production timing confirmed after order."}
                </span>
              </div>
            </div>

            {/* Shipping / Tracking */}
            <div className="os-block" data-testid="order-shipping-block">
              <div className="os-row">
                <span className="os-label">Destination</span>
                <span className="os-value" data-testid="order-ship-country">
                  {order.shipping?.country || "—"}
                </span>
              </div>
              <div className="os-row">
                <span className="os-label">Service</span>
                <span className="os-value plain" data-testid="order-ship-service">
                  {order.shipping?.service_label || "Assigned before dispatch"}
                </span>
              </div>
              {order.carrier ? (
                <div className="os-row">
                  <span className="os-label">Carrier</span>
                  <span className="os-value" data-testid="order-carrier">
                    {order.carrier}
                  </span>
                </div>
              ) : null}
              {order.tracking_number ? (
                <div className="os-row">
                  <span className="os-label">Tracking #</span>
                  <span className="os-value" data-testid="order-tracking-number">
                    {order.tracking_number}
                  </span>
                </div>
              ) : null}
              {trackingHref ? (
                <div className="os-row">
                  <span className="os-label">Track Shipment</span>
                  <span className="os-value">
                    <a
                      href={trackingHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="order-tracking-link"
                    >
                      OPEN CARRIER →
                    </a>
                  </span>
                </div>
              ) : null}
            </div>

            {/* Items + Total */}
            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="os-block os-summary" data-testid="order-items-block">
                {order.items.map((i, idx) => (
                  <div key={idx} className="os-line" data-testid={`order-line-${idx}`}>
                    <div>
                      <p className="os-line-name">{i.product_name}</p>
                      <p className="os-line-variant">
                        {i.variant}
                        {typeof i.quantity === "number" ? ` · Qty ${i.quantity}` : ""}
                      </p>
                    </div>
                    <span className="os-line-amount">
                      {formatMoney((i.unit_amount_cents || 0) * (i.quantity || 1), order.canonical_currency)}
                    </span>
                  </div>
                ))}
                <div className="os-total-row">
                  <span className="os-total-label">Total</span>
                  <span className="os-total-amount" data-testid="order-total">
                    {formatMoney(total, currency)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Layer 3 — Return / Warranty block. Visible only for paid
            orders. When an RMA exists it shows the customer-safe status;
            otherwise it shows the appropriate CTA (or a "final sale"
            message for silver/custom/engraved/resized).
            The RMA case is fetched via token-secured GET /api/returns.
            Submission uses the same token via POST /api/returns/request. */}
        {order && !error ? (
          <div className="os-block" data-testid="return-block">
            {rmaCase ? (
              <div data-testid="return-status-panel">
                <p className="os-eyebrow" style={{ textAlign: "left", margin: 0 }}>
                  Return / Warranty
                </p>
                <div className="os-row">
                  <span className="os-label">RMA</span>
                  <span className="os-value" data-testid="return-rma-number">
                    {rmaCase.rma_number}
                  </span>
                </div>
                <div className="os-row">
                  <span className="os-label">Status</span>
                  <span className="os-value" data-testid="return-status">
                    {(rmaCase.status || "").replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
                {rmaCase.customer_message ? (
                  <p style={{
                    marginTop: 12, padding: "12px 14px",
                    background: "rgba(200,162,74,.06)",
                    borderLeft: "2px solid #c8a24a",
                    color: "rgba(232,224,207,.85)",
                    fontFamily: "'Cormorant Garamond',serif",
                    fontStyle: "italic", fontSize: 15,
                  }} data-testid="return-customer-message">
                    {rmaCase.customer_message}
                  </p>
                ) : null}
                {rmaCase.return_instructions && rmaCase.status === "authorized" ? (
                  <div style={{ marginTop: 12, padding: "12px 14px",
                                 background: "#08070a",
                                 border: "1px solid rgba(200,162,74,.18)",
                                 color: "#e8e0cf", fontSize: 14.5,
                                 whiteSpace: "pre-wrap" }}
                       data-testid="return-instructions">
                    <strong style={{ color: "#c8a24a",
                                      fontFamily: "'Cinzel',serif",
                                      fontSize: 11, letterSpacing: ".28em" }}>
                      RETURN INSTRUCTIONS
                    </strong>
                    <br />{rmaCase.return_instructions}
                  </div>
                ) : null}
              </div>
            ) : (
              <ReturnCta
                order={order}
                showForm={showReturnForm}
                onOpen={() => setShowReturnForm(true)}
                reason={returnReason}
                onReason={setReturnReason}
                note={returnNote}
                onNote={setReturnNote}
                busy={returnBusy}
                error={returnError}
                onSubmit={async () => {
                  if (!returnReason) {
                    setReturnError("Please select a reason.");
                    return;
                  }
                  setReturnBusy(true);
                  setReturnError("");
                  try {
                    const r = await fetch(`${API}/api/returns/request`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        order_number: orderNumber,
                        token,
                        reason: returnReason,
                        note: returnNote || undefined,
                      }),
                    });
                    const data = await r.json().catch(() => ({}));
                    if (!r.ok) {
                      const code = data?.detail?.code || "ERROR";
                      const msg = code === "ACTIVE_RMA_EXISTS"
                        ? "A return case already exists for this order."
                        : code === "INVALID_TOKEN"
                          ? "This link is no longer valid."
                          : "Unable to submit. Please email concierge@getyourphileon.com.";
                      setReturnError(msg);
                    } else {
                      setRmaCase(data);
                      setShowReturnForm(false);
                    }
                  } catch (_e) {
                    setReturnError("Network error. Please try again.");
                  } finally {
                    setReturnBusy(false);
                  }
                }}
              />
            )}
          </div>
        ) : null}

        <div className="os-actions">
          {order && !error ? (
            <div className="os-block" data-testid="order-support-block">
              <OrderSupportCta orderNumber={orderNumber} token={token} />
            </div>
          ) : null}
          <Link to="/contact" className="os-btn" data-testid="order-contact-btn">
            Contact Concierge
          </Link>
          <Link to="/shop" className="os-btn secondary" data-testid="order-continue-btn">
            Continue Exploring
          </Link>
        </div>
      </div>
    </div>
  );
}
