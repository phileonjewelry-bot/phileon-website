/* PHILEON — ADMIN RETENTION PANEL
   Authenticated admin-only surface. Backend is the SINGLE source of
   truth: this UI never duplicates retention business logic.

   Backend contract:
     GET  /api/admin/retention/config       — live/simulated + caps + counters
     GET  /api/admin/retention/pending?status=…
     GET  /api/admin/retention/send-log
     GET  /api/admin/retention/preview/{id}
     POST /api/admin/retention/tick

   Never renders raw JWTs, session_id, HMAC unsub tokens, Stripe IDs,
   DB IDs, or webhook metadata.
*/
import React, { useEffect, useMemo, useState } from "react";
import { Play, Eye, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

function authHeaders() {
  const t = localStorage.getItem("phileon_admin_token") || "";
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function fmtDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

const STATUS_LABEL = {
  pending: "Pending",
  cancelled: "Cancelled",
  sent: "Sent",
  suppressed: "Suppressed",
  expired: "Expired",
};

export default function AdminRetention() {
  const [cfg, setCfg] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [items, setItems] = useState([]);
  const [sendLog, setSendLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [tickReport, setTickReport] = useState(null);
  const [preview, setPreview] = useState(null); // {pending, preview}
  const [error, setError] = useState("");

  useEffect(() => { document.title = "PHILEON — Admin · Retention"; }, []);

  async function loadAll() {
    setBusy(true); setError("");
    try {
      const [c, p, s] = await Promise.all([
        fetch(`${API}/api/admin/retention/config`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`${API}/api/admin/retention/pending?status=${statusFilter}&limit=200`,
              { headers: authHeaders() }).then(r => r.json()),
        fetch(`${API}/api/admin/retention/send-log?limit=100`,
              { headers: authHeaders() }).then(r => r.json()),
      ]);
      setCfg(c);
      setItems(p.items || []);
      setSendLog(s.items || []);
    } catch (_e) {
      setError("Failed to load retention data.");
    } finally { setBusy(false); }
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [statusFilter]);

  async function runTick() {
    setBusy(true); setError(""); setTickReport(null);
    try {
      const r = await fetch(`${API}/api/admin/retention/tick`, {
        method: "POST",
        headers: { "content-type": "application/json", ...authHeaders() },
        body: JSON.stringify({}),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.detail || "Tick failed");
      setTickReport(data);
      await loadAll();
    } catch (_e) { setError("Tick failed."); }
    finally { setBusy(false); }
  }

  async function openPreview(id) {
    setPreview(null); setError("");
    try {
      const r = await fetch(`${API}/api/admin/retention/preview/${id}`,
                            { headers: authHeaders() });
      const data = await r.json();
      if (!r.ok) throw new Error();
      setPreview(data);
    } catch (_e) { setError("Preview unavailable."); }
  }

  const liveBadge = useMemo(() => {
    if (!cfg) return null;
    if (cfg.live_requested && cfg.behavioral_sender_configured && !cfg.global_launch_cap_hit) {
      return { label: "LIVE ARMED", tone: "warn" };
    }
    if (cfg.live_requested && !cfg.behavioral_sender_configured) {
      return { label: "LIVE REFUSED · sender missing", tone: "blocked" };
    }
    if (cfg.live_requested && cfg.global_launch_cap_hit) {
      return { label: "LIVE HALTED · launch cap hit", tone: "blocked" };
    }
    return { label: "SIMULATION", tone: "safe" };
  }, [cfg]);

  return (
    <div className="admin-retention" data-testid="admin-retention-page">
      <style>{`
        .admin-retention { color:#e8e0cf; font-family:'Inter',sans-serif; max-width:1100px; }
        .ar-title { font-family:'Cinzel',serif; letter-spacing:.24em;
          text-transform:uppercase; font-size:22px; color:#f4ecd6; margin:0 0 8px; }
        .ar-sub { font-family:'Cormorant Garamond',serif; font-style:italic;
          color:rgba(232,224,207,.6); margin:0 0 24px; }
        .ar-card { background:#0f0f14; border:1px solid #33322a; padding:20px;
          border-radius:6px; margin-bottom:16px; }
        .ar-badge { display:inline-block; padding:4px 10px; margin-left:12px;
          font-family:'Cinzel',serif; font-size:10px; letter-spacing:.3em;
          text-transform:uppercase; vertical-align:middle; }
        .ar-badge.safe    { background:#c8a24a; color:#08070a; }
        .ar-badge.warn    { background:#f0a13f; color:#08070a; }
        .ar-badge.blocked { background:#c65b5b; color:#f4ecd6; }
        .ar-meta { display:grid; grid-template-columns:repeat(4, 1fr); gap:14px 24px; margin:12px 0 4px; }
        .ar-meta-item p:first-child { margin:0; font-family:'Cinzel',serif;
          font-size:10px; letter-spacing:.35em; text-transform:uppercase;
          color:rgba(232,224,207,.5); }
        .ar-meta-item p:last-child { margin:2px 0 0; font-size:14px; color:#f4ecd6; }
        .ar-actions { display:flex; gap:10px; margin:12px 0 16px; flex-wrap:wrap; }
        .ar-btn { font-family:'Cinzel',serif; letter-spacing:.28em; font-size:11px;
          text-transform:uppercase; padding:10px 18px;
          background:#c8a24a; color:#08070a; border:none; cursor:pointer;
          display:inline-flex; align-items:center; gap:8px; }
        .ar-btn:disabled { opacity:.4; cursor:not-allowed; }
        .ar-btn.ghost { background:transparent; color:#e8e0cf; border:1px solid #33322a; }
        .ar-select { background:#08070a; color:#e8e0cf; border:1px solid #33322a;
          padding:8px 10px; font-family:'Inter',sans-serif; font-size:13px; }
        .ar-tbl { width:100%; border-collapse:collapse; font-size:13px; }
        .ar-tbl th { text-align:left; font-family:'Cinzel',serif; font-size:10px;
          letter-spacing:.3em; text-transform:uppercase; color:rgba(232,224,207,.55);
          padding:10px 12px; border-bottom:1px solid #33322a; }
        .ar-tbl td { padding:10px 12px; border-bottom:1px dotted #22221a;
          color:#e8e0cf; vertical-align:top; }
        .ar-tbl .status { font-family:'Cinzel',serif; font-size:10px;
          letter-spacing:.2em; text-transform:uppercase; }
        .ar-tbl .status.pending    { color:#c8a24a; }
        .ar-tbl .status.sent       { color:#7fbf7f; }
        .ar-tbl .status.cancelled  { color:rgba(232,224,207,.4); }
        .ar-tbl .status.suppressed { color:#c65b5b; }
        .ar-tbl .mode { font-family:'Cinzel',serif; font-size:10px;
          letter-spacing:.2em; text-transform:uppercase; }
        .ar-tbl .mode.simulated { color:#a89f89; }
        .ar-tbl .mode.live { color:#e0b862; }
        .ar-cell-btn { background:transparent; border:1px solid #33322a; color:#e8e0cf;
          padding:6px 10px; font-family:'Cinzel',serif; font-size:10px;
          letter-spacing:.24em; cursor:pointer; }
        .ar-cell-btn:hover { border-color:#c8a24a; color:#c8a24a; }
        .ar-modal-bd { position:fixed; inset:0; background:rgba(0,0,0,.72);
          z-index:200; display:flex; align-items:center; justify-content:center;
          padding:24px; }
        .ar-modal { background:#0f0f14; border:1px solid #33322a;
          max-width:700px; width:100%; max-height:80vh; overflow:auto; padding:24px; }
        .ar-modal h3 { font-family:'Cinzel',serif; letter-spacing:.24em;
          text-transform:uppercase; color:#f4ecd6; margin:0 0 12px; font-size:14px; }
        .ar-error { color:#e08282; font-size:13px; margin:8px 0; }
        .ar-empty { color:rgba(232,224,207,.55); padding:20px; text-align:center;
          font-style:italic; font-family:'Playfair Display',Georgia,serif; }
      `}</style>

      <h1 className="ar-title">
        Retention
        {liveBadge ? (
          <span className={`ar-badge ${liveBadge.tone}`} data-testid="retention-live-badge">
            {liveBadge.label}
          </span>
        ) : null}
      </h1>
      <p className="ar-sub">Behavioral customer retention. Backend is source of truth. LIVE sends require a dedicated behavioral sender AND owner activation.</p>

      {error ? <p className="ar-error">{error}</p> : null}

      {/* ── CONFIG ─────────────────────────────────────────── */}
      {cfg && (
        <div className="ar-card" data-testid="retention-config-card">
          <div className="ar-meta">
            <div className="ar-meta-item">
              <p>Live requested</p>
              <p data-testid="cfg-live-requested">{cfg.live_requested ? "yes" : "no"}</p>
            </div>
            <div className="ar-meta-item">
              <p>Behavioral sender</p>
              <p data-testid="cfg-sender-configured">
                {cfg.behavioral_sender_configured ? (
                  <span style={{color:'#7fbf7f'}}><ShieldCheck size={12} style={{display:'inline'}}/> configured</span>
                ) : (
                  <span style={{color:'#c65b5b'}}><ShieldAlert size={12} style={{display:'inline'}}/> not configured</span>
                )}
              </p>
            </div>
            <div className="ar-meta-item">
              <p>Global launch cap (24h)</p>
              <p data-testid="cfg-global-cap">
                {cfg.live_sends_last_24h} / {cfg.caps.global_launch_24h}
                {cfg.global_launch_cap_hit ? " · REACHED" : ""}
              </p>
            </div>
            <div className="ar-meta-item">
              <p>Per-customer caps</p>
              <p>{cfg.caps.daily}/24h · {cfg.caps.weekly}/7d</p>
            </div>
            <div className="ar-meta-item">
              <p>Browse window</p>
              <p>{cfg.windows.browse_min} min</p>
            </div>
            <div className="ar-meta-item">
              <p>Wishlist window</p>
              <p>{cfg.windows.wishlist_min} min</p>
            </div>
            <div className="ar-meta-item">
              <p>Cart window</p>
              <p>{cfg.windows.cart_min} min</p>
            </div>
            <div className="ar-meta-item">
              <p>Checkout window</p>
              <p>{cfg.windows.checkout_min} min</p>
            </div>
          </div>

          <div className="ar-actions">
            <button
              className="ar-btn"
              onClick={runTick}
              disabled={busy}
              data-testid="retention-run-tick"
            >
              <Play size={12} /> {busy ? "Ticking…" : "Run Tick"}
            </button>
            <button className="ar-btn ghost" onClick={loadAll} disabled={busy}
                    data-testid="retention-refresh">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {tickReport ? (
            <div style={{marginTop:12, fontSize:13, color:'rgba(232,224,207,.85)'}}
                 data-testid="retention-tick-report">
              Last tick — mode: <b>{tickReport.mode}</b> · evaluated: {tickReport.evaluated}
              {" · "}sent: {tickReport.sent?.length ?? 0}
              {" · "}per-customer cap: {tickReport.eligible_but_capped?.length ?? 0}
              {tickReport.global_launch_cap_hit ? " · GLOBAL CAP HIT" : ""}
              {tickReport.live_requested && !tickReport.behavioral_sender_configured
                ? " · LIVE REFUSED (no sender)" : ""}
            </div>
          ) : null}
        </div>
      )}

      {/* ── PENDING ────────────────────────────────────────── */}
      <div className="ar-card">
        <div style={{display:'flex', justifyContent:'space-between',
                      alignItems:'center', marginBottom:12}}>
          <h2 style={{fontFamily:"'Cinzel',serif", fontSize:14,
                       letterSpacing:'.28em', textTransform:'uppercase',
                       color:'#c8a24a', margin:0}}>Retention Queue</h2>
          <select className="ar-select" value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  data-testid="retention-status-filter">
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="cancelled">Cancelled</option>
            <option value="suppressed">Suppressed</option>
            <option value="all">All</option>
          </select>
        </div>
        {items.length === 0 ? (
          <div className="ar-empty" data-testid="retention-empty">
            No {statusFilter} rows.
          </div>
        ) : (
          <table className="ar-tbl" data-testid="retention-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Intent</th>
                <th>Earliest send</th>
                <th>Status</th>
                <th style={{width:120}}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} data-testid={`retention-row-${r.id}`}>
                  <td>{r.customer_email}</td>
                  <td>{r.product_slug}</td>
                  <td>{r.intent_kind}</td>
                  <td>{fmtDate(r.earliest_send_at)}</td>
                  <td>
                    <span className={`status ${r.status}`}>
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                    {r.cancelled_reason ? (
                      <div style={{fontSize:11, color:'rgba(232,224,207,.5)',
                                    fontStyle:'italic', marginTop:2}}>
                        {r.cancelled_reason}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <button className="ar-cell-btn"
                            onClick={() => openPreview(r.id)}
                            data-testid={`retention-preview-${r.id}`}>
                      <Eye size={11} style={{display:'inline', marginRight:4}}/>
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── SEND LOG ───────────────────────────────────────── */}
      <div className="ar-card" data-testid="retention-send-log-card">
        <h2 style={{fontFamily:"'Cinzel',serif", fontSize:14,
                     letterSpacing:'.28em', textTransform:'uppercase',
                     color:'#c8a24a', margin:'0 0 12px'}}>Send Log</h2>
        {sendLog.length === 0 ? (
          <div className="ar-empty">No sends yet.</div>
        ) : (
          <table className="ar-tbl">
            <thead>
              <tr>
                <th>When</th>
                <th>Email</th>
                <th>Type</th>
                <th>Product</th>
                <th>Mode</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              {sendLog.map((r) => (
                <tr key={r.id}>
                  <td>{fmtDate(r.created_at)}</td>
                  <td>{r.email}</td>
                  <td>{r.email_type}</td>
                  <td>{r.product_slug}</td>
                  <td><span className={`mode ${r.mode}`}>{r.mode}</span></td>
                  <td style={{color:'rgba(232,224,207,.7)'}}>{r.subject_preview}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── PREVIEW MODAL ──────────────────────────────────── */}
      {preview && (
        <div className="ar-modal-bd" onClick={() => setPreview(null)}
             data-testid="retention-preview-modal">
          <div className="ar-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{preview.preview?.subject}</h3>
            <p style={{fontSize:12, color:'rgba(232,224,207,.55)', margin:'0 0 12px'}}>
              To: {preview.pending?.customer_email} · Product: {preview.pending?.product_slug} · Kind: {preview.pending?.intent_kind}
            </p>
            <div style={{background:'#08070a', border:'1px solid #22221a',
                         padding:16, borderRadius:4, maxHeight:400, overflow:'auto'}}
                 data-testid="retention-preview-html"
                 dangerouslySetInnerHTML={{ __html: preview.preview?.html || "" }} />
            <div style={{marginTop:16, textAlign:'right'}}>
              <button className="ar-btn ghost" onClick={() => setPreview(null)}
                      data-testid="retention-preview-close">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
