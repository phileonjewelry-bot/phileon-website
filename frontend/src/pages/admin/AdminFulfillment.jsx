/* ==========================================================================
   PHILEON — ADMIN FULFILLMENT QUEUE
   Owner-facing operational view of every paid order that needs review,
   preparation, or shipping.

   Auth: reads `localStorage.phileon_admin_token` (JWT) via AdminLayout.
   Backend contracts (single source of truth — never duplicated here):
     GET  /api/admin/orders?status=<queue>&q=<search>
     GET  /api/admin/orders/{order_number}
     POST /api/admin/orders/{order_number}/approve
     POST /api/admin/orders/{order_number}/prepare
     POST /api/admin/orders/{order_number}/ready-to-ship
     POST /api/admin/orders/{order_number}/hold           { reason }
     POST /api/admin/orders/{order_number}/release-hold
     GET  /api/admin/orders/{order_number}/audit
   ========================================================================== */
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, ShieldAlert, PauseCircle, PlayCircle,
  CheckCircle2, Package, Truck, AlertTriangle, Loader,
  ChevronRight, Ban,
} from "lucide-react";

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

const QUEUE_TABS = [
  { key: "needs_review",   label: "Needs Review",   icon: ShieldAlert },
  { key: "in_preparation", label: "In Preparation", icon: Package },
  { key: "ready_to_ship",  label: "Ready to Ship",  icon: Truck },
  { key: "on_hold",        label: "On Hold",        icon: PauseCircle },
  { key: "shipped",        label: "Shipped",        icon: CheckCircle2 },
  { key: "cancelled",      label: "Cancelled",      icon: Ban },
];

function IntegrityPill({ status, label }) {
  const bad = (status || "").toLowerCase() === "pending_review";
  const cls = bad
    ? "af-pill af-pill-bad"
    : "af-pill af-pill-ok";
  return <span className={cls} data-testid={`af-integrity-${label}`}>{label}: {status || "ok"}</span>;
}

export default function AdminFulfillment() {
  const [tab, setTab] = useState("needs_review");
  const [q, setQ] = useState("");
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Detail panel
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [audit, setAudit] = useState([]);
  const [detailBusy, setDetailBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [holdReason, setHoldReason] = useState("");

  useEffect(() => {
    document.title = "PHILEON — Admin · Fulfillment";
  }, []);

  async function loadList() {
    setBusy(true);
    setError("");
    try {
      const url = new URL(`${API}/api/admin/orders`);
      url.searchParams.set("status", tab);
      if (q.trim()) url.searchParams.set("q", q.trim());
      const r = await fetch(url.toString(), { headers: authHeaders() });
      if (r.status === 401 || r.status === 403) {
        setError("Your admin session has expired. Please log in again.");
        return;
      }
      if (!r.ok) {
        setError("Unable to load queue.");
        return;
      }
      const data = await r.json();
      setOrders(data.orders || []);
    } catch (_e) {
      setError("Network error while loading queue.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { loadList(); /* eslint-disable-next-line */ }, [tab]);

  async function loadDetail(order_number) {
    setSelected(order_number);
    setDetail(null);
    setAudit([]);
    setActionError("");
    setHoldReason("");
    setDetailBusy(true);
    try {
      const [dr, ar] = await Promise.all([
        fetch(`${API}/api/admin/orders/${encodeURIComponent(order_number)}`, { headers: authHeaders() }),
        fetch(`${API}/api/admin/orders/${encodeURIComponent(order_number)}/audit`, { headers: authHeaders() }),
      ]);
      if (dr.ok) setDetail(await dr.json());
      if (ar.ok) {
        const a = await ar.json();
        setAudit(a.audit || []);
      }
    } catch (_e) {
      setActionError("Network error loading order.");
    } finally {
      setDetailBusy(false);
    }
  }

  async function transition(path, body) {
    if (!selected) return;
    setActionBusy(true);
    setActionError("");
    try {
      const r = await fetch(
        `${API}/api/admin/orders/${encodeURIComponent(selected)}${path}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(body || {}),
        }
      );
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const code = data?.detail?.code || "ERROR";
        const reasons = data?.detail?.reasons || [];
        setActionError(reasons.length ? `${code}: ${reasons.join(", ")}` : code);
        return;
      }
      await loadDetail(selected);
      await loadList();
    } catch (_e) {
      setActionError("Network error.");
    } finally {
      setActionBusy(false);
    }
  }

  const eligible = detail?.eligibility?.eligible;
  const currentStatus = (detail?.fulfillment_status || "").toLowerCase();
  const shipIntegrity = detail?.shipping_integrity_status;
  const presIntegrity = detail?.presentment_integrity_status;
  const paymentPaid = ["paid", "authorized"].includes((detail?.payment_status || "").toLowerCase());

  return (
    <div className="admin-fulfillment" data-testid="admin-fulfillment-page">
      <style>{`
        .admin-fulfillment { color:#e8e0cf; font-family:'Inter',sans-serif; max-width:1200px; }
        .af-title { font-family:'Cinzel',serif; letter-spacing:.24em;
          text-transform:uppercase; font-size:22px; color:#f4ecd6; margin:0 0 8px; }
        .af-sub { font-family:'Cormorant Garamond',serif; font-style:italic;
          color:rgba(232,224,207,.6); margin:0 0 28px; }
        .af-tabs { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px;
          border-bottom:1px solid #33322a; padding-bottom:12px; }
        .af-tab { display:inline-flex; align-items:center; gap:8px;
          background:transparent; border:1px solid #33322a; color:#e8e0cf;
          padding:8px 14px; font-family:'Cinzel',serif; font-size:11px;
          letter-spacing:.28em; text-transform:uppercase; cursor:pointer; }
        .af-tab:hover { border-color:#c8a24a; color:#c8a24a; }
        .af-tab.active { background:#c8a24a; color:#08070a; border-color:#c8a24a; }
        .af-search { display:flex; gap:8px; margin-bottom:16px; }
        .af-search input { flex:1; padding:10px 12px; background:#08070a;
          color:#e8e0cf; border:1px solid #33322a; font-size:14px; font-family:'Inter',sans-serif; outline:none; }
        .af-search input:focus { border-color:#c8a24a; }
        .af-search button { font-family:'Cinzel',serif; font-size:11px;
          letter-spacing:.32em; text-transform:uppercase; padding:10px 18px;
          background:#c8a24a; color:#08070a; border:none; cursor:pointer; }
        .af-layout { display:grid; grid-template-columns: 1fr 1fr; gap:16px; }
        @media (max-width: 900px) { .af-layout { grid-template-columns: 1fr; } }
        .af-card { background:#0f0f14; border:1px solid #33322a; padding:20px;
          border-radius:4px; margin-bottom:16px; }
        .af-empty { color:rgba(232,224,207,.5); font-style:italic; padding:20px 0; }
        .af-row { display:flex; justify-content:space-between; align-items:center;
          padding:12px 0; border-bottom:1px dotted #33322a; cursor:pointer; }
        .af-row:hover { background:rgba(200,162,74,.05); }
        .af-row.selected { background:rgba(200,162,74,.12); }
        .af-row-title { color:#f4ecd6; font-family:'Cinzel',serif;
          letter-spacing:.14em; font-size:13px; }
        .af-row-meta { color:rgba(232,224,207,.55); font-size:12.5px; margin-top:2px; }
        .af-row-right { display:flex; align-items:center; gap:8px; color:rgba(232,224,207,.55); }
        .af-pill { display:inline-block; padding:2px 8px; font-family:'Cinzel',serif;
          font-size:9.5px; letter-spacing:.28em; text-transform:uppercase; margin-right:6px; }
        .af-pill-ok { background:#0f2010; border:1px solid #2e5a30; color:#c9e0c9; }
        .af-pill-bad { background:#20100f; border:1px solid #5a2e2e; color:#e0c9c9; }
        .af-pill-warn { background:#201a0f; border:1px solid #5a4a2e; color:#e0d3c9; }
        .af-pill-info { background:#0f1a20; border:1px solid #2e4a5a; color:#c9dae0; }
        .af-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:16px; }
        .af-btn { font-family:'Cinzel',serif; letter-spacing:.28em; font-size:10px;
          text-transform:uppercase; padding:9px 16px; border:1px solid #33322a;
          background:transparent; color:#e8e0cf; cursor:pointer;
          transition:border-color 200ms, color 200ms, background 200ms; }
        .af-btn:hover:not(:disabled) { border-color:#c8a24a; color:#c8a24a; }
        .af-btn:disabled { opacity:.35; cursor:not-allowed; }
        .af-btn.primary { background:#c8a24a; color:#08070a; border-color:#c8a24a; }
        .af-btn.primary:hover:not(:disabled) { background:#e0b862; border-color:#e0b862; color:#08070a; }
        .af-btn.danger { border-color:#c65b5b; color:#c65b5b; }
        .af-btn.danger:hover:not(:disabled) { background:#c65b5b; color:#08070a; }
        .af-hold-input { width:100%; padding:8px 10px; background:#08070a;
          color:#e8e0cf; border:1px solid #33322a; font-size:13px; margin-top:8px; }
        .af-audit-row { padding:8px 0; border-bottom:1px dotted #33322a;
          font-size:12.5px; color:rgba(232,224,207,.75); }
        .af-audit-row:last-child { border-bottom:none; }
        .af-meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 20px; margin:14px 0; }
        .af-meta-item p:first-child { margin:0 0 3px; font-family:'Cinzel',serif;
          font-size:9.5px; letter-spacing:.32em; text-transform:uppercase; color:rgba(232,224,207,.5); }
        .af-meta-item p:last-child { margin:0; font-size:13px; color:#f4ecd6; word-break:break-word; }
        .af-error-block { background:#20100f; border:1px solid #5a2e2e;
          color:#e0c9c9; padding:12px; border-radius:4px; margin:10px 0;
          font-size:13px; display:flex; gap:10px; align-items:flex-start; }
      `}</style>

      <h1 className="af-title">Fulfillment Queue</h1>
      <p className="af-sub">Every paid PHILEON order flows through here before it ships.</p>

      <div className="af-tabs" data-testid="af-tabs">
        {QUEUE_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`af-tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
            data-testid={`af-tab-${key}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="af-search">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by order number or customer email…"
          onKeyDown={(e) => e.key === "Enter" && loadList()}
          data-testid="af-search-input"
        />
        <button onClick={loadList} data-testid="af-search-btn">
          <Search size={12} style={{ display: "inline", marginRight: 6 }} />
          Search
        </button>
      </div>

      {error ? (
        <div className="af-error-block" data-testid="af-list-error">
          <AlertTriangle size={18} /><div>{error}</div>
        </div>
      ) : null}

      <div className="af-layout">
        {/* LIST */}
        <div className="af-card" data-testid="af-list">
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".32em",
                      textTransform: "uppercase", color: "rgba(232,224,207,.55)", margin: "0 0 12px" }}>
            {busy ? "Loading…" : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
          </p>
          {!busy && orders.length === 0 ? (
            <p className="af-empty" data-testid="af-list-empty">No orders in this queue.</p>
          ) : (
            orders.map((o) => (
              <div
                key={o.order_number}
                className={`af-row ${selected === o.order_number ? "selected" : ""}`}
                onClick={() => loadDetail(o.order_number)}
                data-testid={`af-row-${o.order_number}`}
              >
                <div>
                  <p className="af-row-title">{o.order_number}</p>
                  <p className="af-row-meta">
                    {o.customer_email || "—"} · {o.shipping?.country || "—"} ·{" "}
                    {formatMoney(o.total_cents, o.currency)}
                  </p>
                  <p style={{ margin: "4px 0 0" }}>
                    {o.shipping_integrity_status === "pending_review" ? (
                      <span className="af-pill af-pill-bad">Shipping · Hold</span>
                    ) : null}
                    {o.presentment_integrity_status === "pending_review" ? (
                      <span className="af-pill af-pill-bad">Presentment · Hold</span>
                    ) : null}
                    {o.fulfillment_status === "on_hold" ? (
                      <span className="af-pill af-pill-warn">Manual Hold</span>
                    ) : null}
                    {o.shipping?.signature_required ? (
                      <span className="af-pill af-pill-info">Signature</span>
                    ) : null}
                  </p>
                </div>
                <div className="af-row-right">
                  <ChevronRight size={16} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* DETAIL */}
        <div>
          {detailBusy && !detail ? (
            <div className="af-card"><Loader size={16} /> Loading…</div>
          ) : detail ? (
            <>
              <div className="af-card" data-testid="af-detail-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <p style={{ fontFamily: "'Cinzel',serif", fontSize: 18, letterSpacing: ".14em",
                              color: "#f4ecd6", margin: 0 }} data-testid="af-detail-order-number">
                    {detail.order_number}
                  </p>
                  <Link to="/admin/shipments" className="af-btn" style={{ fontSize: 9 }}>
                    Shipments →
                  </Link>
                </div>
                <div style={{ margin: "8px 0 12px" }}>
                  <IntegrityPill status={detail.shipping_integrity_status || "ok"} label="Shipping" />
                  <IntegrityPill status={detail.presentment_integrity_status || "ok"} label="Presentment" />
                  <span className={`af-pill ${paymentPaid ? "af-pill-ok" : "af-pill-bad"}`}>
                    Payment: {detail.payment_status || "—"}
                  </span>
                  <span className="af-pill af-pill-info" data-testid="af-detail-fulfillment-status">
                    Op: {detail.fulfillment_status || "pending_review"}
                  </span>
                </div>

                <div className="af-meta-grid">
                  <div className="af-meta-item">
                    <p>Customer</p><p>{detail.customer_email || "—"}</p>
                  </div>
                  <div className="af-meta-item">
                    <p>Destination</p>
                    <p>{detail.shipping?.country || "—"} · {detail.shipping?.service_label || "—"}</p>
                  </div>
                  <div className="af-meta-item">
                    <p>Signature</p>
                    <p data-testid="af-detail-signature">
                      {detail.shipping?.signature_required ? "REQUIRED" : "Not required"}
                    </p>
                  </div>
                  <div className="af-meta-item">
                    <p>Insurance</p>
                    <p data-testid="af-detail-insurance">
                      {detail.shipping?.insurance_required ? "REQUIRED · confirm at label purchase" : "Not required"}
                    </p>
                  </div>
                </div>

                <div>
                  {(detail.items || []).map((it, idx) => (
                    <div key={idx} style={{ padding: "8px 0", borderBottom: "1px dotted #33322a" }}>
                      <p style={{ margin: 0, color: "#f4ecd6", fontSize: 13 }}>
                        {it.product_name}{it.ring_size ? ` · Size ${it.ring_size}` : ""}
                      </p>
                      <p style={{ margin: "2px 0 0", color: "rgba(232,224,207,.6)",
                                   fontSize: 12, fontStyle: "italic" }}>
                        {it.variant} · Qty {it.quantity}
                      </p>
                    </div>
                  ))}
                  <p style={{ marginTop: 10, textAlign: "right", fontFamily: "'Cinzel',serif",
                              fontSize: 11, letterSpacing: ".24em", color: "#c8a24a" }}>
                    TOTAL — {formatMoney(detail.total_cents, detail.currency)}
                  </p>
                </div>

                {detail.fulfillment_hold_reason ? (
                  <div className="af-error-block" data-testid="af-detail-hold-reason">
                    <PauseCircle size={16} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>ON HOLD</p>
                      <p style={{ margin: "2px 0 0" }}>{detail.fulfillment_hold_reason}</p>
                    </div>
                  </div>
                ) : null}

                {actionError ? (
                  <div className="af-error-block" data-testid="af-action-error">
                    <AlertTriangle size={16} /><div>{actionError}</div>
                  </div>
                ) : null}

                <div className="af-actions">
                  <button
                    className="af-btn primary"
                    onClick={() => transition("/approve")}
                    disabled={actionBusy || !eligible || !["", null, undefined, "pending_review"].includes(currentStatus)}
                    data-testid="af-approve-btn"
                  >
                    Approve for Fulfillment
                  </button>
                  <button
                    className="af-btn"
                    onClick={() => transition("/prepare")}
                    disabled={actionBusy || currentStatus !== "approved_for_fulfillment"}
                    data-testid="af-prepare-btn"
                  >
                    In Preparation
                  </button>
                  <button
                    className="af-btn"
                    onClick={() => transition("/ready-to-ship")}
                    disabled={actionBusy || currentStatus !== "in_preparation"}
                    data-testid="af-ready-btn"
                  >
                    Ready to Ship
                  </button>
                  {currentStatus === "on_hold" ? (
                    <button
                      className="af-btn primary"
                      onClick={() => transition("/release-hold")}
                      disabled={actionBusy}
                      data-testid="af-release-hold-btn"
                    >
                      <PlayCircle size={12} style={{ display: "inline", marginRight: 6 }} />
                      Release Hold
                    </button>
                  ) : null}
                </div>

                {currentStatus !== "on_hold" && currentStatus !== "shipped" && currentStatus !== "cancelled" ? (
                  <div style={{ marginTop: 16, borderTop: "1px dotted #33322a", paddingTop: 12 }}>
                    <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10,
                                letterSpacing: ".32em", textTransform: "uppercase",
                                color: "rgba(232,224,207,.55)", margin: "0 0 8px" }}>
                      Place on Manual Hold
                    </p>
                    <input
                      className="af-hold-input"
                      placeholder="Reason (address concern, customization, fraud, etc.)"
                      value={holdReason}
                      onChange={(e) => setHoldReason(e.target.value)}
                      maxLength={500}
                      data-testid="af-hold-reason-input"
                    />
                    <button
                      className="af-btn danger"
                      style={{ marginTop: 8 }}
                      onClick={() => transition("/hold", { reason: holdReason })}
                      disabled={actionBusy || holdReason.trim().length < 3}
                      data-testid="af-hold-btn"
                    >
                      <PauseCircle size={12} style={{ display: "inline", marginRight: 6 }} />
                      Place on Hold
                    </button>
                  </div>
                ) : null}
              </div>

              {/* AUDIT TRAIL */}
              <div className="af-card" data-testid="af-audit-trail">
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11,
                            letterSpacing: ".32em", textTransform: "uppercase",
                            color: "rgba(232,224,207,.55)", margin: "0 0 12px" }}>
                  Audit Trail
                </p>
                {audit.length === 0 ? (
                  <p className="af-empty">No fulfillment events yet.</p>
                ) : (
                  audit.map((a, idx) => (
                    <div key={idx} className="af-audit-row" data-testid={`af-audit-row-${idx}`}>
                      <strong style={{ color: "#f4ecd6" }}>{a.action}</strong>
                      {" · "}
                      {a.previous || "—"} → {a.new || "—"}
                      {" · "}
                      <span style={{ color: "rgba(232,224,207,.5)" }}>
                        {a.at ? new Date(a.at).toLocaleString() : ""}
                      </span>
                      {a.reason ? (
                        <p style={{ margin: "3px 0 0", fontStyle: "italic",
                                    color: "rgba(232,224,207,.6)" }}>
                          "{a.reason}"
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="af-card">
              <p className="af-empty">Select an order to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
