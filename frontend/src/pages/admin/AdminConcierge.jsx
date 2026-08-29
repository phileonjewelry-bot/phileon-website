import { useCallback, useEffect, useMemo, useState } from 'react';

// PHILEON — Admin Concierge Inbox (Phase 10). Requires the existing admin JWT.
const API = process.env.REACT_APP_BACKEND_URL;
const STATUSES = ['new', 'reviewing', 'consultation-requested', 'quote-in-progress', 'replied', 'closed'];
const STATUS_LABEL = {
  new: 'New',
  reviewing: 'Reviewing',
  'consultation-requested': 'Consultation Requested',
  'quote-in-progress': 'Quote in Progress',
  replied: 'Replied',
  closed: 'Closed',
};

function useAdminHeaders() {
  return useMemo(() => {
    const token = localStorage.getItem('phileon_admin_token');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` };
  }, []);
}

export default function AdminConcierge() {
  const headers = useAdminHeaders();
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ new: 0, total: 0 });
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [attachmentBlobs, setAttachmentBlobs] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const q = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
      const r = await fetch(`${API}/api/admin/concierge/inquiries${q}`, { headers });
      if (r.status === 401 || r.status === 403) throw new Error('Unauthorized — please log in as admin.');
      if (!r.ok) throw new Error(`Load failed (${r.status})`);
      const data = await r.json();
      setItems(data.items || []);
      setCounts(data.counts || { new: 0, total: 0 });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [headers, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const loadDetail = useCallback(async (reference) => {
    setDetail(null); setSelected(reference); setNoteDraft(''); setAttachmentBlobs({});
    try {
      const r = await fetch(`${API}/api/admin/concierge/inquiries/${reference}`, { headers });
      if (!r.ok) throw new Error(`Load failed (${r.status})`);
      const d = await r.json();
      setDetail(d);
      // Load attachment thumbnails via authenticated fetch → object URL
      const atts = d.attachments || [];
      const blobs = {};
      await Promise.all(atts.map(async (att) => {
        try {
          const rr = await fetch(`${API}/api/admin/concierge/attachments/${att.storagePath}`, { headers });
          if (rr.ok) blobs[att.storagePath] = URL.createObjectURL(await rr.blob());
        } catch (_e) { /* noop */ }
      }));
      setAttachmentBlobs(blobs);
    } catch (e) { setError(e.message); }
  }, [headers]);

  const updateStatus = async (ref, newStatus) => {
    // POST fallback because the platform ingress can strip PATCH.
    const r = await fetch(`${API}/api/admin/concierge/inquiries/${ref}/status`, {
      method: 'POST', headers, body: JSON.stringify({ status: newStatus }),
    });
    if (r.ok) { await load(); if (selected === ref) await loadDetail(ref); }
    else setError(`Status update failed (${r.status})`);
  };

  const addNote = async () => {
    const note = noteDraft.trim();
    if (!note || !selected) return;
    const r = await fetch(`${API}/api/admin/concierge/inquiries/${selected}/notes`, {
      method: 'POST', headers, body: JSON.stringify({ note }),
    });
    if (r.ok) { setNoteDraft(''); await loadDetail(selected); }
    else setError(`Note failed (${r.status})`);
  };

  return (
    <div className="p-6 lg:p-10 text-phileon-ivory" data-testid="admin-concierge">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-phileon-gold">PHILEON</p>
          <h1 className="text-3xl font-serif tracking-wide">Concierge Inbox</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span data-testid="admin-concierge-count-new">New: <strong>{counts.new}</strong></span>
          <span>Total: <strong>{counts.total}</strong></span>
          <button onClick={load} className="border border-phileon-gold text-phileon-gold px-4 py-2 tracking-[0.2em] text-xs uppercase">Refresh</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`text-xs uppercase tracking-[0.2em] px-3 py-2 border ${!statusFilter ? 'border-phileon-gold text-phileon-gold' : 'border-white/10 text-white/60'}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs uppercase tracking-[0.2em] px-3 py-2 border ${statusFilter === s ? 'border-phileon-gold text-phileon-gold' : 'border-white/10 text-white/60'}`}>{STATUS_LABEL[s]}</button>
        ))}
      </div>

      {error && <p className="text-rose-300 text-sm mb-4" data-testid="admin-concierge-error">{error}</p>}
      {loading && <p className="text-white/60">Loading…</p>}
      {!loading && items.length === 0 && <p className="text-white/60 italic" data-testid="admin-concierge-empty">No Concierge inquiries yet.</p>}

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.reference}>
                <button
                  onClick={() => loadDetail(it.reference)}
                  className={`w-full text-left border p-4 hover:border-phileon-gold transition ${selected === it.reference ? 'border-phileon-gold bg-white/[0.02]' : 'border-white/10'}`}
                  data-testid={`admin-concierge-row-${it.reference}`}
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-phileon-gold tracking-[0.2em] text-xs">{it.reference}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/60">{STATUS_LABEL[it.status] || it.status}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <strong>{it.customer?.name}</strong> · {it.customer?.email}
                  </div>
                  <div className="mt-1 text-xs text-white/70">
                    {it.product?.name || 'No product context'} · {(it.intent || '').replace(/-/g, ' ')} · {it.priority}
                  </div>
                  <div className="mt-1 text-xs text-white/50">{it.created_at?.slice(0, 19).replace('T', ' ')} · {it.attachments?.length || 0} image{(it.attachments?.length || 0) === 1 ? '' : 's'}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {!detail ? (
            <p className="text-white/50 italic">Select an inquiry to view details.</p>
          ) : (
            <div data-testid="admin-concierge-detail" className="border border-white/10 p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-phileon-gold tracking-[0.2em] text-xs">{detail.reference}</span>
                <select
                  value={detail.status}
                  onChange={(e) => updateStatus(detail.reference, e.target.value)}
                  className="bg-black border border-phileon-gold text-phileon-gold text-xs uppercase tracking-[0.2em] px-3 py-2"
                  data-testid="admin-concierge-status-select"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>

              <h3 className="mt-2 font-serif text-xl">{detail.customer?.name}</h3>
              <p className="text-sm text-white/70">{detail.customer?.email}{detail.customer?.phone ? ` · ${detail.customer.phone}` : ''} · prefer {detail.customer?.preferred_contact}</p>
              {detail.product?.name && <p className="text-sm mt-2">Piece: <strong>{detail.product.name}</strong>{detail.product?.variant ? ` — ${detail.product.variant}` : ''} · <a className="text-phileon-gold" href={detail.product?.url} target="_blank" rel="noreferrer">open</a></p>}
              <p className="text-xs mt-1 text-white/60">Intent: {detail.intent} · Priority: {detail.priority}</p>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Message</p>
                <blockquote className="border-l-2 border-phileon-gold pl-3 text-sm whitespace-pre-wrap">{detail.message}</blockquote>
              </div>

              {detail.optional_details && Object.entries(detail.optional_details).some(([, v]) => v) && (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Details</p>
                  <ul className="text-sm space-y-1">
                    {Object.entries(detail.optional_details).map(([k, v]) => v && <li key={k}><span className="text-white/60">{k.replace(/_/g, ' ')}:</span> {v}</li>)}
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Internal Summary</p>
                <pre className="text-xs whitespace-pre-wrap bg-white/[0.02] p-3 border border-white/5">{detail.internal_summary}</pre>
              </div>

              {(detail.attachments || []).length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Attachments ({detail.attachments.length})</p>
                  <div className="flex flex-wrap gap-2" data-testid="admin-concierge-attachments">
                    {detail.attachments.map((a) => (
                      <a key={a.storagePath} href={attachmentBlobs[a.storagePath] || '#'} target="_blank" rel="noreferrer" className="block w-20 h-20 border border-white/10 overflow-hidden">
                        {attachmentBlobs[a.storagePath]
                          ? <img src={attachmentBlobs[a.storagePath]} alt="" className="w-full h-full object-cover" />
                          : <span className="text-xs text-white/40 p-2 block">Loading…</span>}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Notifications</p>
                <p className="text-xs text-white/60">Customer ack: <strong>{detail.notifications?.customerAck?.status || '—'}</strong>{detail.notifications?.customerAck?.reason ? ` (${detail.notifications.customerAck.reason})` : ''}</p>
                <p className="text-xs text-white/60">Internal alert: <strong>{detail.notifications?.internalAlert?.status || '—'}</strong>{detail.notifications?.internalAlert?.reason ? ` (${detail.notifications.internalAlert.reason})` : ''}</p>
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Internal Notes</p>
                <ul className="space-y-2 mb-3">
                  {(detail.admin_notes || []).map((n, i) => (
                    <li key={i} className="text-sm border-l-2 border-phileon-gold pl-3">
                      <p className="whitespace-pre-wrap">{n.note}</p>
                      <p className="text-xs text-white/50 mt-1">{n.author} · {n.createdAt?.slice(0, 19).replace('T', ' ')}</p>
                    </li>
                  ))}
                  {(!detail.admin_notes || detail.admin_notes.length === 0) && <li className="text-xs italic text-white/50">No notes yet.</li>}
                </ul>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={2}
                  className="w-full bg-white/[0.02] border border-white/10 p-2 text-sm"
                  placeholder="Add internal note (not visible to customer)…"
                  data-testid="admin-concierge-note-input"
                />
                <button onClick={addNote} disabled={!noteDraft.trim()} className="mt-2 border border-phileon-gold text-phileon-gold px-4 py-2 tracking-[0.2em] text-xs uppercase disabled:opacity-40" data-testid="admin-concierge-note-add">Add Note</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
