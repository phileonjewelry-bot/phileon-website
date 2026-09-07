/* ==========================================================================
   PHILEON — ADMIN RETURNS QUEUE  (Layer 3)
   Auth: reads localStorage.phileon_admin_token via AdminLayout.
   Backend contracts:
     GET  /api/admin/returns?status=<tab>&q=<search>
     GET  /api/admin/returns/{rma}                            → detail + audit
     POST /api/admin/returns/{rma}/verify-delivery { delivered_at }
     POST /api/admin/returns/{rma}/authorize      { note?, return_instructions? }
     POST /api/admin/returns/{rma}/deny           { reason }
     POST /api/admin/returns/{rma}/receive        { condition_note? }
     POST /api/admin/returns/{rma}/inspect        { result:pass|fail, notes? }
     POST /api/admin/returns/{rma}/refund         { note? }
     POST /api/admin/returns/{rma}/close          { note? }
   ========================================================================== */
import React, { useEffect, useState } from "react";
import {
  Search, ChevronRight, ShieldAlert, ClipboardCheck, PackageCheck,
  RefreshCcw, CircleCheck, CircleX, AlertTriangle, Loader,
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

function auth() {
  const t = localStorage.getItem("phileon_admin_token") || "";
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function money(cents, currency) {
  if (typeof cents !== "number") return "—";
  const code = (currency || "USD").toUpperCase();
  const sym = { USD: "$", CAD: "C$", GBP: "£", EUR: "€", AUD: "A$", JPY: "¥" }[code] || "$";
  const isJpy = code === "JPY";
  return `${sym}${(isJpy ? Math.round(cents / 100) : cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: isJpy ? 0 : 2, maximumFractionDigits: isJpy ? 0 : 2,
  })} ${code}`;
}

const TABS = [
  { key: "new",          label: "New",          icon: ShieldAlert },
  { key: "under_review", label: "Under Review", icon: ClipboardCheck },
  { key: "authorized",   label: "Authorized",   icon: RefreshCcw },
  { key: "received",     label: "Received",     icon: PackageCheck },
  { key: "inspection",   label: "Inspection",   icon: ClipboardCheck },
  { key: "refund",       label: "Refund",       icon: RefreshCcw },
  { key: "refunded",     label: "Refunded",     icon: CircleCheck },
  { key: "denied",       label: "Denied",       icon: CircleX },
  { key: "closed",       label: "Closed",       icon: CircleCheck },
];

export default function AdminReturns() {
  const [tab, setTab] = useState("new");
  const [q, setQ] = useState("");
  const [cases, setCases] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [denyReason, setDenyReason] = useState("");
  const [inspectNotes, setInspectNotes] = useState("");
  const [returnInstructions, setReturnInstructions] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => { document.title = "PHILEON — Admin · Returns"; }, []);

  async function loadList() {
    setBusy(true); setError("");
    try {
      const u = new URL(`${API}/api/admin/returns`);
      u.searchParams.set("status", tab);
      if (q.trim()) u.searchParams.set("q", q.trim());
      const r = await fetch(u.toString(), { headers: auth() });
      if (r.status === 401 || r.status === 403) {
        setError("Your admin session has expired. Please log in again."); return;
      }
      if (!r.ok) { setError("Unable to load queue."); return; }
      setCases((await r.json()).cases || []);
    } catch (_e) { setError("Network error while loading queue."); }
    finally { setBusy(false); }
  }
  useEffect(() => { loadList(); /* eslint-disable-next-line */ }, [tab]);

  async function loadDetail(rma) {
    setSelected(rma); setDetail(null); setActionError("");
    setDenyReason(""); setInspectNotes(""); setReturnInstructions(""); setDeliveryDate("");
    try {
      const r = await fetch(`${API}/api/admin/returns/${encodeURIComponent(rma)}`, { headers: auth() });
      if (r.ok) setDetail(await r.json());
    } catch (_e) { setActionError("Network error loading case."); }
  }

  async function act(path, body) {
    if (!selected) return;
    setActionBusy(true); setActionError("");
    try {
      const r = await fetch(`${API}/api/admin/returns/${encodeURIComponent(selected)}${path}`, {
        method: "POST", headers: { "Content-Type": "application/json", ...auth() },
        body: JSON.stringify(body || {}),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const c = data?.detail?.code || "ERROR";
        setActionError(c);
        return;
      }
      await loadDetail(selected); await loadList();
    } catch (_e) { setActionError("Network error."); }
    finally { setActionBusy(false); }
  }

  const st = detail?.status;

  return (
    <div className="ar" data-testid="admin-returns-page">
      <style>{`
        .ar { color:#e8e0cf; font-family:'Inter',sans-serif; max-width:1200px; }
        .ar-title { font-family:'Cinzel',serif; letter-spacing:.24em;
          text-transform:uppercase; font-size:22px; color:#f4ecd6; margin:0 0 8px; }
        .ar-sub { font-family:'Cormorant Garamond',serif; font-style:italic;
          color:rgba(232,224,207,.6); margin:0 0 28px; }
        .ar-tabs { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px;
          border-bottom:1px solid #33322a; padding-bottom:12px; }
        .ar-tab { display:inline-flex; align-items:center; gap:8px;
          background:transparent; border:1px solid #33322a; color:#e8e0cf;
          padding:8px 14px; font-family:'Cinzel',serif; font-size:10px;
          letter-spacing:.28em; text-transform:uppercase; cursor:pointer; }
        .ar-tab:hover { border-color:#c8a24a; color:#c8a24a; }
        .ar-tab.active { background:#c8a24a; color:#08070a; border-color:#c8a24a; }
        .ar-search { display:flex; gap:8px; margin-bottom:16px; }
        .ar-search input { flex:1; padding:10px 12px; background:#08070a;
          color:#e8e0cf; border:1px solid #33322a; font-size:14px; outline:none; }
        .ar-search input:focus { border-color:#c8a24a; }
        .ar-search button { font-family:'Cinzel',serif; font-size:11px;
          letter-spacing:.32em; text-transform:uppercase; padding:10px 18px;
          background:#c8a24a; color:#08070a; border:none; cursor:pointer; }
        .ar-layout { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media (max-width: 900px) { .ar-layout { grid-template-columns:1fr; } }
        .ar-card { background:#0f0f14; border:1px solid #33322a; padding:20px;
          border-radius:4px; margin-bottom:16px; }
        .ar-row { display:flex; justify-content:space-between; align-items:center;
          padding:12px 0; border-bottom:1px dotted #33322a; cursor:pointer; }
        .ar-row:hover { background:rgba(200,162,74,.05); }
        .ar-row.selected { background:rgba(200,162,74,.12); }
        .ar-empty { color:rgba(232,224,207,.5); font-style:italic; padding:20px 0; }
        .ar-pill { display:inline-block; padding:2px 8px; font-family:'Cinzel',serif;
          font-size:9.5px; letter-spacing:.28em; text-transform:uppercase; margin-right:6px; }
        .ar-pill-ok { background:#0f2010; border:1px solid #2e5a30; color:#c9e0c9; }
        .ar-pill-bad { background:#20100f; border:1px solid #5a2e2e; color:#e0c9c9; }
        .ar-pill-warn { background:#201a0f; border:1px solid #5a4a2e; color:#e0d3c9; }
        .ar-pill-info { background:#0f1a20; border:1px solid #2e4a5a; color:#c9dae0; }
        .ar-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:16px; }
        .ar-btn { font-family:'Cinzel',serif; letter-spacing:.28em; font-size:10px;
          text-transform:uppercase; padding:9px 16px; border:1px solid #33322a;
          background:transparent; color:#e8e0cf; cursor:pointer;
          transition:border-color 200ms, color 200ms, background 200ms; }
        .ar-btn:hover:not(:disabled) { border-color:#c8a24a; color:#c8a24a; }
        .ar-btn:disabled { opacity:.35; cursor:not-allowed; }
        .ar-btn.primary { background:#c8a24a; color:#08070a; border-color:#c8a24a; }
        .ar-btn.primary:hover:not(:disabled) { background:#e0b862; }
        .ar-btn.danger { border-color:#c65b5b; color:#c65b5b; }
        .ar-btn.danger:hover:not(:disabled) { background:#c65b5b; color:#08070a; }
        .ar-in { width:100%; padding:8px 10px; background:#08070a; color:#e8e0cf;
          border:1px solid #33322a; font-size:13px; margin-top:6px; }
        .ar-err { background:#20100f; border:1px solid #5a2e2e; color:#e0c9c9;
          padding:12px; margin:10px 0; font-size:13px; display:flex; gap:10px; align-items:flex-start; }
        .ar-audit-row { padding:6px 0; border-bottom:1px dotted #33322a;
          font-size:12.5px; color:rgba(232,224,207,.75); }
        .ar-audit-row:last-child { border-bottom:none; }
        .ar-meta { display:grid; grid-template-columns:1fr 1fr; gap:10px 20px; margin:14px 0; }
        .ar-meta > div p:first-child { margin:0 0 3px; font-family:'Cinzel',serif;
          font-size:9.5px; letter-spacing:.32em; text-transform:uppercase;
          color:rgba(232,224,207,.5); }
        .ar-meta > div p:last-child { margin:0; font-size:13px; color:#f4ecd6; word-break:break-word; }
      `}</style>

      <h1 className="ar-title">Returns / RMA</h1>
      <p className="ar-sub">Every return, warranty, or refund case flows through here.</p>

      <div className="ar-tabs" data-testid="ar-tabs">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`ar-tab ${tab === key ? "active" : ""}`}
                  onClick={() => setTab(key)} data-testid={`ar-tab-${key}`}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      <div className="ar-search">
        <input value={q} onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadList()}
                placeholder="Search RMA, order number, or customer email…"
                data-testid="ar-search-input" />
        <button onClick={loadList} data-testid="ar-search-btn">
          <Search size={12} style={{ display: "inline", marginRight: 6 }} />Search
        </button>
      </div>

      {error && <div className="ar-err" data-testid="ar-list-error"><AlertTriangle size={18} /><div>{error}</div></div>}

      <div className="ar-layout">
        <div className="ar-card" data-testid="ar-list">
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".32em",
                       textTransform: "uppercase", color: "rgba(232,224,207,.55)", margin: "0 0 12px" }}>
            {busy ? "Loading…" : `${cases.length} case${cases.length === 1 ? "" : "s"}`}
          </p>
          {!busy && cases.length === 0
            ? <p className="ar-empty" data-testid="ar-list-empty">No cases in this queue.</p>
            : cases.map((c) => (
                <div key={c.rma_number}
                     className={`ar-row ${selected === c.rma_number ? "selected" : ""}`}
                     onClick={() => loadDetail(c.rma_number)}
                     data-testid={`ar-row-${c.rma_number}`}>
                  <div>
                    <p style={{ margin: 0, fontFamily: "'Cinzel',serif", fontSize: 13,
                                  letterSpacing: ".14em", color: "#f4ecd6" }}>{c.rma_number}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "rgba(232,224,207,.55)" }}>
                      {c.order_number} · {c.customer_email || "—"} · {c.reason_code || "—"}
                    </p>
                    <p style={{ margin: "4px 0 0" }}>
                      <span className={`ar-pill ar-pill-info`}>{c.status}</span>
                      {c.owner_review_required
                        ? <span className="ar-pill ar-pill-warn">Owner Review</span>
                        : null}
                      {c.request_type === "warranty"
                        ? <span className="ar-pill ar-pill-warn">Warranty</span>
                        : null}
                    </p>
                  </div>
                  <ChevronRight size={16} />
                </div>
              ))}
        </div>

        <div>
          {detail ? (
            <>
              <div className="ar-card" data-testid="ar-detail-card">
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 18, letterSpacing: ".14em",
                             color: "#f4ecd6", margin: 0 }} data-testid="ar-detail-rma">
                  {detail.rma_number}
                </p>
                <p style={{ margin: "6px 0 12px", color: "rgba(232,224,207,.6)", fontSize: 13 }}>
                  Order <strong style={{ color: "#f4ecd6" }}>{detail.order_number}</strong>{" "}
                  · Reason: {detail.reason_code || "—"}
                </p>
                <div>
                  <span className={`ar-pill ar-pill-info`}>Status: {detail.status}</span>
                  <span className={`ar-pill ar-pill-info`}>Policy: {detail.policy_class || "—"}</span>
                  {detail.owner_review_required && <span className="ar-pill ar-pill-warn">Owner Review</span>}
                  {detail.request_type === "warranty" && <span className="ar-pill ar-pill-warn">Warranty</span>}
                </div>

                <div className="ar-meta">
                  <div><p>Customer</p><p>{detail.customer_email || "—"}</p></div>
                  <div><p>Requested</p><p>{detail.requested_at ? new Date(detail.requested_at).toLocaleString() : "—"}</p></div>
                  <div><p>Return window</p><p>{detail.return_window_expires_at ? new Date(detail.return_window_expires_at).toLocaleDateString() : "—"}</p></div>
                  <div><p>Refund amount</p><p>{detail.refund_amount_base_cents ? money(detail.refund_amount_base_cents, detail.refund_currency_base) : "—"}</p></div>
                </div>

                {detail.customer_note && (
                  <div style={{ padding: 10, background: "rgba(200,162,74,.05)", borderLeft: "2px solid #c8a24a", margin: "10px 0", fontSize: 13, color: "rgba(232,224,207,.75)" }}>
                    <em>“{detail.customer_note}”</em>
                  </div>
                )}

                <div style={{ marginTop: 10 }}>
                  {(detail.items_snapshot || []).map((it, idx) => (
                    <div key={idx} style={{ padding: "8px 0", borderBottom: "1px dotted #33322a", fontSize: 13 }}>
                      <p style={{ margin: 0, color: "#f4ecd6" }}>
                        {it.product_name}{it.ring_size ? ` · ${it.ring_size}` : ""}
                      </p>
                      <p style={{ margin: "2px 0 0", color: "rgba(232,224,207,.6)", fontStyle: "italic" }}>
                        {it.variant} · Qty {it.quantity} · {money(it.unit_amount_cents, detail.refund_currency_base || "USD")}
                        {" · "}<span className={`ar-pill ${it.eligible ? "ar-pill-ok" : "ar-pill-bad"}`}>{it.policy_class}</span>
                      </p>
                    </div>
                  ))}
                </div>

                {actionError && <div className="ar-err" data-testid="ar-action-error"><AlertTriangle size={16} /><div>{actionError}</div></div>}

                <div className="ar-actions">
                  {(st === "under_review" && detail.owner_review_required) && (
                    <>
                      <input type="datetime-local" className="ar-in" style={{ maxWidth: 240 }}
                             value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                             data-testid="ar-delivery-date-input" />
                      <button className="ar-btn"
                              disabled={actionBusy || !deliveryDate}
                              onClick={() => act("/verify-delivery", { delivered_at: new Date(deliveryDate).toISOString() })}
                              data-testid="ar-verify-delivery-btn">
                        Verify Delivery Date
                      </button>
                    </>
                  )}
                  {(st === "requested" || st === "under_review") && (
                    <>
                      <input className="ar-in" style={{ maxWidth: 320 }}
                             placeholder="Return instructions (optional)"
                             value={returnInstructions}
                             onChange={(e) => setReturnInstructions(e.target.value)}
                             data-testid="ar-return-instructions" />
                      <button className="ar-btn primary" disabled={actionBusy}
                              onClick={() => act("/authorize", { return_instructions: returnInstructions || undefined })}
                              data-testid="ar-authorize-btn">
                        Authorize Return
                      </button>
                    </>
                  )}
                  {(st === "authorized" || st === "in_transit") && (
                    <button className="ar-btn primary" disabled={actionBusy}
                            onClick={() => act("/receive", {})} data-testid="ar-receive-btn">
                      Mark Item Received
                    </button>
                  )}
                  {(st === "received" || st === "inspection_pending") && (
                    <>
                      <input className="ar-in" style={{ maxWidth: 320 }}
                             placeholder="Inspection notes"
                             value={inspectNotes} onChange={(e) => setInspectNotes(e.target.value)}
                             data-testid="ar-inspect-notes" />
                      <button className="ar-btn primary" disabled={actionBusy}
                              onClick={() => act("/inspect", { result: "pass", notes: inspectNotes || undefined })}
                              data-testid="ar-inspect-pass-btn">Inspection PASS</button>
                      <button className="ar-btn danger" disabled={actionBusy}
                              onClick={() => act("/inspect", { result: "fail", notes: inspectNotes || undefined })}
                              data-testid="ar-inspect-fail-btn">Inspection FAIL</button>
                    </>
                  )}
                  {(st === "inspection_passed") && (
                    <button className="ar-btn primary" disabled={actionBusy}
                            onClick={() => act("/refund", {})} data-testid="ar-approve-refund-btn">
                      Approve Refund
                    </button>
                  )}
                  {(st !== "denied" && st !== "refunded" && st !== "closed") && (
                    <>
                      <input className="ar-in" style={{ maxWidth: 320 }}
                             placeholder="Reason (≥ 3 chars)"
                             value={denyReason} onChange={(e) => setDenyReason(e.target.value)}
                             data-testid="ar-deny-reason" />
                      <button className="ar-btn danger" disabled={actionBusy || denyReason.trim().length < 3}
                              onClick={() => act("/deny", { reason: denyReason })}
                              data-testid="ar-deny-btn">Deny</button>
                    </>
                  )}
                  {(st === "denied" || st === "refunded" || st === "inspection_failed" || st === "refund_approved") && (
                    <button className="ar-btn" disabled={actionBusy}
                            onClick={() => act("/close", {})} data-testid="ar-close-btn">
                      Close Case
                    </button>
                  )}
                </div>
              </div>

              <div className="ar-card" data-testid="ar-audit">
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".32em",
                             textTransform: "uppercase", color: "rgba(232,224,207,.55)", margin: "0 0 12px" }}>
                  Audit Trail
                </p>
                {(detail.audit || []).length === 0 ? <p className="ar-empty">No events yet.</p>
                  : (detail.audit || []).map((a, i) => (
                      <div key={i} className="ar-audit-row" data-testid={`ar-audit-row-${i}`}>
                        <strong style={{ color: "#f4ecd6" }}>{a.action}</strong> ·{" "}
                        {a.previous || "—"} → {a.new || "—"} ·{" "}
                        <span style={{ color: "rgba(232,224,207,.5)" }}>
                          {a.at ? new Date(a.at).toLocaleString() : ""}
                        </span>
                        {a.reason && <p style={{ margin: "3px 0 0", fontStyle: "italic", color: "rgba(232,224,207,.6)" }}>“{a.reason}”</p>}
                      </div>
                    ))}
              </div>
            </>
          ) : (
            <div className="ar-card"><p className="ar-empty">Select a case to view details.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
