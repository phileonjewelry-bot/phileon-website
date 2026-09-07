/* PHILEON — Admin Disputes / Chargeback Queue (Layer 4) */
import React, { useEffect, useState } from "react";
import { AlertTriangle, ChevronRight, Loader, ShieldAlert, PauseCircle, PlayCircle } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;
const auth = () => {
  const t = localStorage.getItem("phileon_admin_token") || "";
  return t ? { Authorization: `Bearer ${t}` } : {};
};
const TABS = ["new", "needs_response", "evidence_ready", "submitted",
               "under_review", "won", "lost", "closed", "all"];

export default function AdminDisputes() {
  const [tab, setTab] = useState("new");
  const [cases, setCases] = useState([]);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [actionErr, setActionErr] = useState("");
  const [holdReason, setHoldReason] = useState("");
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => { document.title = "PHILEON — Admin · Disputes"; }, []);

  async function load() {
    setBusy(true);
    const r = await fetch(`${API}/api/admin/disputes?status=${tab}`, { headers: auth() });
    if (r.ok) setCases((await r.json()).cases || []);
    setBusy(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  async function loadDetail(id) {
    setSelected(id); setDetail(null); setActionErr(""); setHoldReason(""); setNoteInput("");
    const r = await fetch(`${API}/api/admin/disputes/${encodeURIComponent(id)}`, { headers: auth() });
    if (r.ok) setDetail(await r.json());
  }

  async function act(path, body) {
    if (!selected) return;
    setActionErr("");
    const r = await fetch(`${API}/api/admin/disputes/${encodeURIComponent(selected)}${path}`, {
      method: "POST", headers: { "Content-Type": "application/json", ...auth() },
      body: JSON.stringify(body || {}),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setActionErr(d?.detail?.code || "ERROR");
      return;
    }
    await loadDetail(selected); await load();
  }

  return (
    <div data-testid="admin-disputes-page" style={{
      color: "#e8e0cf", fontFamily: "'Inter',sans-serif", maxWidth: 1200,
    }}>
      <h1 style={{ fontFamily: "'Cinzel',serif", letterSpacing: ".24em",
                    textTransform: "uppercase", fontSize: 22, color: "#f4ecd6",
                    margin: "0 0 8px" }}>Disputes / Chargebacks</h1>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
                   color: "rgba(232,224,207,.6)", margin: "0 0 28px" }}>
        Stripe remains authoritative — PHILEON mirrors an operational case.
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16,
                     borderBottom: "1px solid #33322a", paddingBottom: 12 }}
           data-testid="dsp-tabs">
        {TABS.map((k) => (
          <button key={k} onClick={() => setTab(k)}
                  data-testid={`dsp-tab-${k}`}
                  style={{
                    background: tab === k ? "#c8a24a" : "transparent",
                    color: tab === k ? "#08070a" : "#e8e0cf",
                    border: "1px solid " + (tab === k ? "#c8a24a" : "#33322a"),
                    padding: "8px 14px", fontFamily: "'Cinzel',serif",
                    fontSize: 10, letterSpacing: ".28em",
                    textTransform: "uppercase", cursor: "pointer",
                  }}>{k.replace(/_/g, " ")}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#0f0f14", border: "1px solid #33322a", padding: 20 }}
             data-testid="dsp-list">
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11,
                       letterSpacing: ".32em", textTransform: "uppercase",
                       color: "rgba(232,224,207,.55)", margin: "0 0 12px" }}>
            {busy ? "Loading…" : `${cases.length} case${cases.length === 1 ? "" : "s"}`}
          </p>
          {cases.length === 0 && !busy ? (
            <p data-testid="dsp-list-empty" style={{ color: "rgba(232,224,207,.5)", fontStyle: "italic" }}>
              No cases in this queue.
            </p>
          ) : cases.map((c) => (
            <div key={c.case_id} onClick={() => loadDetail(c.case_id)}
                 data-testid={`dsp-row-${c.case_id}`}
                 style={{
                   padding: "12px 0", borderBottom: "1px dotted #33322a", cursor: "pointer",
                   background: selected === c.case_id ? "rgba(200,162,74,.12)" : "transparent",
                   display: "flex", justifyContent: "space-between", alignItems: "center",
                 }}>
              <div>
                <p style={{ margin: 0, fontFamily: "'Cinzel',serif", fontSize: 13, color: "#f4ecd6" }}>
                  {c.case_id}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "rgba(232,224,207,.55)" }}>
                  {c.order_number} · {c.reason || "—"} · {c.status}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 10.5, letterSpacing: ".2em",
                             textTransform: "uppercase", color:
                             c.urgency === "urgent" || c.urgency === "overdue" ? "#e0c9c9" :
                             c.urgency === "attention" ? "#e0d3c9" : "rgba(232,224,207,.5)" }}>
                  {c.urgency}
                </p>
              </div>
              <ChevronRight size={16} />
            </div>
          ))}
        </div>
        <div>
          {detail ? (
            <>
              <div style={{ background: "#0f0f14", border: "1px solid #33322a", padding: 20, marginBottom: 16 }}
                   data-testid="dsp-detail-card">
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: "#f4ecd6", margin: 0 }}
                   data-testid="dsp-detail-case-id">{detail.case_id}</p>
                <p style={{ margin: "8px 0", color: "rgba(232,224,207,.7)", fontSize: 13 }}>
                  Order: <strong>{detail.order_number}</strong> · Reason: {detail.reason || "—"}
                </p>
                <p style={{ margin: "8px 0", fontSize: 12 }}>
                  <span data-testid="dsp-status" style={{ padding: "2px 8px",
                          background: "#0f1a20", border: "1px solid #2e4a5a",
                          fontFamily: "'Cinzel',serif", fontSize: 9.5,
                          letterSpacing: ".28em", textTransform: "uppercase",
                          color: "#c9dae0", marginRight: 6 }}>
                    Stripe: {detail.status}
                  </span>
                  <span data-testid="dsp-response" style={{ padding: "2px 8px",
                          background: "#0f1a20", border: "1px solid #2e4a5a",
                          fontFamily: "'Cinzel',serif", fontSize: 9.5,
                          letterSpacing: ".28em", textTransform: "uppercase",
                          color: "#c9dae0", marginRight: 6 }}>
                    Op: {detail.response_status}
                  </span>
                  <span data-testid="dsp-fraud" style={{ padding: "2px 8px",
                          background: detail.fraud_review_status === "blocked" ? "#20100f" : "#0f2010",
                          border: "1px solid " + (detail.fraud_review_status === "blocked" ? "#5a2e2e" : "#2e5a30"),
                          fontFamily: "'Cinzel',serif", fontSize: 9.5,
                          letterSpacing: ".28em", textTransform: "uppercase",
                          color: detail.fraud_review_status === "blocked" ? "#e0c9c9" : "#c9e0c9" }}>
                    Fraud: {detail.fraud_review_status || "clear"}
                  </span>
                </p>
                {actionErr && (
                  <div data-testid="dsp-action-error"
                       style={{ background: "#20100f", border: "1px solid #5a2e2e",
                                 color: "#e0c9c9", padding: 12, margin: "10px 0",
                                 fontSize: 13 }}>
                    <AlertTriangle size={14} style={{ display: "inline", marginRight: 6 }} />
                    {actionErr}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                  {detail.fraud_review_status !== "blocked" ? (
                    <>
                      <input value={holdReason} onChange={(e) => setHoldReason(e.target.value)}
                              data-testid="dsp-hold-reason-input"
                              placeholder="Fraud hold reason (≥3 chars)"
                              style={{ padding: "8px 10px", background: "#08070a", color: "#e8e0cf",
                                        border: "1px solid #33322a", flex: 1, minWidth: 200 }} />
                      <button data-testid="dsp-fraud-hold-btn"
                              disabled={holdReason.trim().length < 3}
                              onClick={() => act("/fraud-hold", { reason: holdReason })}
                              style={{ fontFamily: "'Cinzel',serif", fontSize: 10,
                                        letterSpacing: ".28em", textTransform: "uppercase",
                                        padding: "9px 16px", border: "1px solid #c65b5b",
                                        color: "#c65b5b", background: "transparent",
                                        cursor: holdReason.trim().length < 3 ? "not-allowed" : "pointer",
                                        opacity: holdReason.trim().length < 3 ? 0.4 : 1 }}>
                        <PauseCircle size={12} style={{ display: "inline", marginRight: 6 }} />
                        Fraud Hold
                      </button>
                    </>
                  ) : (
                    <button data-testid="dsp-release-fraud-hold-btn"
                            onClick={() => act("/release-fraud-hold", {})}
                            style={{ fontFamily: "'Cinzel',serif", fontSize: 10,
                                      letterSpacing: ".28em", textTransform: "uppercase",
                                      padding: "9px 16px", background: "#c8a24a",
                                      color: "#08070a", border: "1px solid #c8a24a", cursor: "pointer" }}>
                      <PlayCircle size={12} style={{ display: "inline", marginRight: 6 }} />
                      Release Fraud Hold
                    </button>
                  )}
                </div>
              </div>

              <div style={{ background: "#0f0f14", border: "1px solid #33322a", padding: 20 }}
                   data-testid="dsp-evidence-packet">
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11,
                             letterSpacing: ".32em", textTransform: "uppercase",
                             color: "#c8a24a", margin: "0 0 12px" }}>
                  Evidence Packet (preview)
                </p>
                <pre style={{ fontSize: 11, lineHeight: 1.5,
                                color: "#e8e0cf", overflow: "auto",
                                maxHeight: 400, whiteSpace: "pre-wrap",
                                background: "#08070a", padding: 12,
                                border: "1px solid rgba(200,162,74,.18)" }}
                      data-testid="dsp-evidence-json">
                  {JSON.stringify(detail.evidence_packet, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div style={{ background: "#0f0f14", border: "1px solid #33322a", padding: 20,
                          color: "rgba(232,224,207,.5)", fontStyle: "italic" }}>
              Select a case to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
