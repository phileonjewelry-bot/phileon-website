/* PHILEON — Admin Concierge Cases (Layer 6).

   Coordination surface for customer-service operations. This is NOT a
   duplicate authority for shipments / refunds / disputes / inventory —
   those Layers remain the source of truth. Cases deep-link out.

   Auth: reads `localStorage.phileon_admin_token` via AdminLayout.
   Endpoints:
     GET  /api/admin/concierge/cases?status=&priority=&source=&category=
                                    &order_number=&email=&q=
     GET  /api/admin/concierge/cases/{case_id}
     POST /api/admin/concierge/cases
     POST /api/admin/concierge/cases/{case_id}/status
     POST /api/admin/concierge/cases/{case_id}/priority
     POST /api/admin/concierge/cases/{case_id}/next-action
     POST /api/admin/concierge/cases/{case_id}/follow-up
     POST /api/admin/concierge/cases/{case_id}/waiting-on
     POST /api/admin/concierge/cases/{case_id}/notes
     POST /api/admin/concierge/cases/{case_id}/contact-log
     GET  /api/admin/concierge/customer-360?email=…
     GET  /api/admin/concierge/orders/{order}/timeline
     GET  /api/admin/concierge/message-previews
*/
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;

const TABS = [
  { key: 'new',                  label: 'NEW' },
  { key: 'open',                 label: 'OPEN' },
  { key: 'waiting_on_customer',  label: 'WAITING ON CUSTOMER' },
  { key: 'waiting_on_phileon',   label: 'WAITING ON PHILEON' },
  { key: 'resolved',             label: 'RESOLVED' },
  { key: 'closed',               label: 'CLOSED' },
  { key: '',                     label: 'ALL' },
];

const STATUS_ACTIONS = [
  'open', 'waiting_on_customer', 'waiting_on_phileon',
  'resolved', 'closed',
];

const PRIORITIES = ['normal', 'attention', 'urgent'];
const SOURCES = [
  'contact_form', 'order_support', 'return', 'warranty',
  'shipping', 'payment', 'manual_owner_case',
];
const CATEGORIES = [
  'order_status', 'shipping', 'return', 'warranty',
  'product_question', 'size_fit', 'customization',
  'payment', 'other',
];

const PRIORITY_STYLE = {
  urgent:    { bg: '#3a1218', bd: '#c8385a', fg: '#e0c9c9' },
  attention: { bg: '#3a2e12', bd: '#c8a24a', fg: '#f4ecd6' },
  normal:    { bg: '#0f0f12', bd: '#33322a', fg: 'rgba(232,224,207,.75)' },
};

function useAuthHeaders() {
  return useMemo(() => {
    const token = localStorage.getItem('phileon_admin_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    };
  }, []);
}

function fmt(dt) {
  if (!dt) return '—';
  const d = typeof dt === 'string' ? dt : dt;
  return String(d).slice(0, 19).replace('T', ' ');
}

function followUpFlag(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (t < now)               return { label: 'OVERDUE',        fg: '#c8385a' };
  if (t < now + 24 * 60 * 60 * 1000) return { label: 'FOLLOW UP TODAY', fg: '#c8a24a' };
  if (t < now + 7 * day)     return { label: 'UPCOMING',       fg: '#8db38a' };
  return { label: 'UPCOMING', fg: '#8db38a' };
}

export default function AdminConciergeCases() {
  const headers = useAuthHeaders();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('new');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailAudit, setDetailAudit] = useState([]);
  const [c360, setC360] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [contactDraft, setContactDraft] = useState({
    direction: 'inbound', channel: 'email', summary: '',
  });
  const [nextActionDraft, setNextActionDraft] = useState('');
  const [followUpDraft, setFollowUpDraft] = useState('');
  const [waitingOnDraft, setWaitingOnDraft] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState([]);
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    subject: '', customer_message: '', category: 'other',
    customer_email: '', customer_name: '', customer_phone: '',
    order_number: '', priority: 'normal',
  });

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const u = new URL(`${API}/api/admin/concierge/cases`);
    if (tab)              u.searchParams.set('status', tab);
    if (priorityFilter)   u.searchParams.set('priority', priorityFilter);
    if (sourceFilter)     u.searchParams.set('source', sourceFilter);
    if (search)           u.searchParams.set('q', search);
    try {
      const r = await fetch(u, { headers });
      if (r.status === 401 || r.status === 403) {
        throw new Error('Unauthorized — please log in as admin.');
      }
      if (!r.ok) throw new Error(`Load failed (${r.status})`);
      const data = await r.json();
      setItems(data.items || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [headers, tab, priorityFilter, sourceFilter, search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch(`${API}/api/admin/concierge/message-previews`, { headers })
      .then((r) => r.ok ? r.json() : { previews: [] })
      .then((d) => setPreviews(d.previews || []))
      .catch(() => {});
  }, [headers]);

  const loadDetail = useCallback(async (cid) => {
    setSelectedId(cid);
    setDetail(null); setDetailAudit([]); setC360(null); setTimeline(null);
    setNoteDraft(''); setContactDraft({
      direction: 'inbound', channel: 'email', summary: '',
    });
    setNextActionDraft(''); setFollowUpDraft(''); setWaitingOnDraft('');
    try {
      const r = await fetch(
        `${API}/api/admin/concierge/cases/${encodeURIComponent(cid)}`,
        { headers },
      );
      if (!r.ok) throw new Error(`Load failed (${r.status})`);
      const d = await r.json();
      setDetail(d.case);
      setDetailAudit(d.audit || []);
      setNextActionDraft(d.case?.next_action || '');
      setFollowUpDraft(d.case?.follow_up_at || '');
      setWaitingOnDraft(d.case?.waiting_on || '');

      if (d.case?.customer_email_normalized) {
        const cr = await fetch(
          `${API}/api/admin/concierge/customer-360?email=${
            encodeURIComponent(d.case.customer_email_normalized)
          }`,
          { headers },
        );
        if (cr.ok) setC360(await cr.json());
      }
      if (d.case?.order_number) {
        const tr = await fetch(
          `${API}/api/admin/concierge/orders/${
            encodeURIComponent(d.case.order_number)
          }/timeline`,
          { headers },
        );
        if (tr.ok) setTimeline(await tr.json());
      }
    } catch (e) { setError(e.message); }
  }, [headers]);

  const mutate = async (path, body) => {
    try {
      const r = await fetch(
        `${API}/api/admin/concierge/cases/${encodeURIComponent(selectedId)}${path}`,
        { method: 'POST', headers, body: JSON.stringify(body || {}) },
      );
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        setError(err?.detail?.message || `Update failed (${r.status})`);
        return null;
      }
      const d = await r.json();
      await load();
      await loadDetail(selectedId);
      return d;
    } catch (e) { setError(e.message); return null; }
  };

  const submitManual = async () => {
    setError(null);
    if (!manualForm.subject.trim() || !manualForm.customer_message.trim()) {
      setError('Subject and message are required.'); return;
    }
    try {
      const r = await fetch(`${API}/api/admin/concierge/cases`, {
        method: 'POST', headers, body: JSON.stringify(manualForm),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        setError(err?.detail?.message || `Create failed (${r.status})`);
        return;
      }
      const d = await r.json();
      setShowManual(false);
      setManualForm({
        subject: '', customer_message: '', category: 'other',
        customer_email: '', customer_name: '', customer_phone: '',
        order_number: '', priority: 'normal',
      });
      await load();
      await loadDetail(d.case_id);
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="p-4 lg:p-8 text-phileon-ivory" data-testid="admin-concierge-cases">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs tracking-[0.32em] uppercase text-phileon-gold">PHILEON · Layer 6</p>
          <h1 className="font-serif text-2xl md:text-3xl tracking-wide">Concierge Cases</h1>
          <p className="text-xs text-phileon-ivory-muted mt-1">
            Coordination surface. Shipments · refunds · fraud · inventory
            remain their own authority — deep-link only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowManual((v) => !v)}
            className="border border-phileon-gold text-phileon-gold px-4 py-2 tracking-[0.2em] text-xs uppercase"
            data-testid="cc-new-case-btn"
          >
            {showManual ? 'Close' : 'New Case'}
          </button>
          <button
            onClick={load}
            className="border border-white/10 text-phileon-ivory-muted px-4 py-2 tracking-[0.2em] text-xs uppercase"
            data-testid="cc-refresh"
          >
            Refresh
          </button>
        </div>
      </div>

      {showManual && (
        <div className="mb-6 border border-phileon-gold/40 p-4" data-testid="cc-manual-form">
          <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-3">
            Manual Owner Case
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <input value={manualForm.subject}
                   onChange={(e) => setManualForm({...manualForm, subject: e.target.value})}
                   placeholder="Subject *" className="bg-black/40 border border-white/10 p-2"
                   data-testid="cc-manual-subject" />
            <input value={manualForm.customer_email}
                   onChange={(e) => setManualForm({...manualForm, customer_email: e.target.value})}
                   placeholder="Customer email" className="bg-black/40 border border-white/10 p-2"
                   data-testid="cc-manual-email" />
            <input value={manualForm.customer_name}
                   onChange={(e) => setManualForm({...manualForm, customer_name: e.target.value})}
                   placeholder="Customer name" className="bg-black/40 border border-white/10 p-2" />
            <input value={manualForm.customer_phone}
                   onChange={(e) => setManualForm({...manualForm, customer_phone: e.target.value})}
                   placeholder="Customer phone" className="bg-black/40 border border-white/10 p-2" />
            <input value={manualForm.order_number}
                   onChange={(e) => setManualForm({...manualForm, order_number: e.target.value})}
                   placeholder="Order # (optional)" className="bg-black/40 border border-white/10 p-2" />
            <select value={manualForm.category}
                    onChange={(e) => setManualForm({...manualForm, category: e.target.value})}
                    className="bg-black/40 border border-white/10 p-2">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={manualForm.priority}
                    onChange={(e) => setManualForm({...manualForm, priority: e.target.value})}
                    className="bg-black/40 border border-white/10 p-2">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <textarea value={manualForm.customer_message}
                    onChange={(e) => setManualForm({...manualForm, customer_message: e.target.value})}
                    rows={4} placeholder="Message / context *"
                    className="mt-3 w-full bg-black/40 border border-white/10 p-2 text-sm"
                    data-testid="cc-manual-message" />
          <button onClick={submitManual}
                  className="mt-3 border border-phileon-gold text-phileon-gold px-4 py-2 tracking-[0.2em] text-xs uppercase"
                  data-testid="cc-manual-submit">
            Create Case
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4" data-testid="cc-tabs">
        {TABS.map((t) => (
          <button key={t.key || 'all'}
                  onClick={() => setTab(t.key)}
                  className={`text-xs uppercase tracking-[0.2em] px-3 py-2 border ${
                    tab === t.key
                      ? 'border-phileon-gold text-phileon-gold'
                      : 'border-white/10 text-white/60'
                  }`}
                  data-testid={`cc-tab-${t.key || 'all'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-2 mb-4 text-sm">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
               placeholder="Search case ID, order #, email, name, subject…"
               className="flex-1 bg-black/40 border border-white/10 p-2"
               data-testid="cc-search" />
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-black/40 border border-white/10 p-2"
                data-testid="cc-priority-filter">
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-black/40 border border-white/10 p-2"
                data-testid="cc-source-filter">
          <option value="">All sources</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {error && <p className="text-rose-300 text-sm mb-3" data-testid="cc-error">{error}</p>}
      {loading && <p className="text-white/60 text-sm">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-white/60 italic text-sm" data-testid="cc-empty">No cases match this view.</p>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Queue */}
        <div>
          <ul className="space-y-3">
            {items.map((it) => {
              const p = PRIORITY_STYLE[it.priority] || PRIORITY_STYLE.normal;
              const fu = followUpFlag(it.follow_up_at);
              return (
                <li key={it.case_id}>
                  <button
                    onClick={() => loadDetail(it.case_id)}
                    className={`w-full text-left border p-4 hover:border-phileon-gold transition ${
                      selectedId === it.case_id
                        ? 'border-phileon-gold bg-white/[0.02]'
                        : 'border-white/10'
                    }`}
                    data-testid={`cc-row-${it.case_id}`}
                  >
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-phileon-gold tracking-[0.2em] text-xs">{it.case_id}</span>
                      <span className="text-[10px] uppercase tracking-[0.28em]"
                            style={{background: p.bg, border: `1px solid ${p.bd}`, color: p.fg, padding: '2px 8px'}}>
                        {it.priority}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <strong>{it.subject}</strong>
                    </div>
                    <div className="mt-1 text-xs text-white/70">
                      {it.customer_name || '—'} · {it.customer_email_normalized || '—'}
                      {it.order_number ? ` · ${it.order_number}` : ''}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/50 flex justify-between">
                      <span>{it.status.replace(/_/g, ' ')} · {(it.source || '').replace(/_/g, ' ')} · {(it.category || '').replace(/_/g, ' ')}</span>
                      {fu ? <span style={{color: fu.fg}}>{fu.label}</span> : <span>{fmt(it.created_at)}</span>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Detail */}
        <div>
          {!detail ? (
            <p className="text-white/50 italic text-sm">
              Select a case to view context, timeline, notes, and next actions.
            </p>
          ) : (
            <CaseDetail
              detail={detail}
              audit={detailAudit}
              c360={c360}
              timeline={timeline}
              previews={previews}
              mutate={mutate}
              noteDraft={noteDraft}
              setNoteDraft={setNoteDraft}
              contactDraft={contactDraft}
              setContactDraft={setContactDraft}
              nextActionDraft={nextActionDraft}
              setNextActionDraft={setNextActionDraft}
              followUpDraft={followUpDraft}
              setFollowUpDraft={setFollowUpDraft}
              waitingOnDraft={waitingOnDraft}
              setWaitingOnDraft={setWaitingOnDraft}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CaseDetail({
  detail, audit, c360, timeline, previews, mutate,
  noteDraft, setNoteDraft, contactDraft, setContactDraft,
  nextActionDraft, setNextActionDraft,
  followUpDraft, setFollowUpDraft,
  waitingOnDraft, setWaitingOnDraft,
}) {
  return (
    <div className="border border-white/10 p-4" data-testid="cc-detail">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-phileon-gold tracking-[0.2em] text-xs">{detail.case_id}</span>
        <span className="text-xs uppercase tracking-[0.2em] text-white/60">
          {detail.status.replace(/_/g, ' ')}
        </span>
      </div>

      <h3 className="mt-2 font-serif text-lg">{detail.subject}</h3>
      <p className="text-xs text-white/60 mt-1">
        {detail.customer_name || '—'} · {detail.customer_email_normalized || '—'}
        {detail.customer_phone ? ` · ${detail.customer_phone}` : ''}
      </p>
      <p className="text-[10px] uppercase tracking-[0.28em] text-white/50 mt-1">
        Source: {(detail.source || '—').replace(/_/g, ' ')} · Category: {(detail.category || '—').replace(/_/g, ' ')}
      </p>

      {/* Message */}
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Message</p>
        <blockquote className="border-l-2 border-phileon-gold pl-3 text-sm whitespace-pre-wrap">
          {detail.customer_message}
        </blockquote>
      </div>

      {/* Status actions */}
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_ACTIONS.map((s) => (
            <button key={s}
                    onClick={() => mutate('/status', { status: s })}
                    className={`text-[10px] uppercase tracking-[0.24em] px-3 py-2 border ${
                      detail.status === s
                        ? 'border-phileon-gold text-phileon-gold'
                        : 'border-white/10 text-white/60'
                    }`}
                    data-testid={`cc-status-${s}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Priority (owner-only)</p>
        <div className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button key={p}
                    onClick={() => mutate('/priority', { priority: p })}
                    className={`text-[10px] uppercase tracking-[0.24em] px-3 py-2 border ${
                      detail.priority === p
                        ? 'border-phileon-gold text-phileon-gold'
                        : 'border-white/10 text-white/60'
                    }`}
                    data-testid={`cc-priority-${p}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Next action / Follow-up / Waiting-on */}
      <div className="mt-4 grid gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Next Action</p>
          <div className="flex gap-2">
            <input value={nextActionDraft}
                   onChange={(e) => setNextActionDraft(e.target.value)}
                   className="flex-1 bg-black/40 border border-white/10 p-2 text-sm"
                   placeholder="e.g. WAIT FOR CUSTOMER PHOTO"
                   data-testid="cc-next-action-input" />
            <button onClick={() => mutate('/next-action', { next_action: nextActionDraft })}
                    className="border border-phileon-gold text-phileon-gold px-3 py-2 text-[10px] uppercase tracking-[0.24em]"
                    data-testid="cc-next-action-save">
              Save
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Follow-up (owner)</p>
          <div className="flex gap-2">
            <input type="datetime-local"
                   value={followUpDraft ? followUpDraft.slice(0, 16) : ''}
                   onChange={(e) => setFollowUpDraft(e.target.value)}
                   className="flex-1 bg-black/40 border border-white/10 p-2 text-sm"
                   data-testid="cc-follow-up-input" />
            <button onClick={() => mutate('/follow-up', {
                      follow_up_at: followUpDraft
                        ? new Date(followUpDraft).toISOString()
                        : null
                    })}
                    className="border border-phileon-gold text-phileon-gold px-3 py-2 text-[10px] uppercase tracking-[0.24em]"
                    data-testid="cc-follow-up-save">
              Save
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Waiting on</p>
          <div className="flex gap-2">
            <input value={waitingOnDraft}
                   onChange={(e) => setWaitingOnDraft(e.target.value)}
                   className="flex-1 bg-black/40 border border-white/10 p-2 text-sm"
                   placeholder="e.g. carrier update, customer photo…"
                   data-testid="cc-waiting-on-input" />
            <button onClick={() => mutate('/waiting-on', { waiting_on: waitingOnDraft })}
                    className="border border-phileon-gold text-phileon-gold px-3 py-2 text-[10px] uppercase tracking-[0.24em]"
                    data-testid="cc-waiting-on-save">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Deep-links */}
      {detail.order_number && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Related Layers</p>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.24em]">
            <Link to="/admin/fulfillment" className="border border-white/10 px-3 py-2 text-phileon-ivory-muted hover:text-phileon-gold">Fulfillment →</Link>
            <Link to="/admin/shipments" className="border border-white/10 px-3 py-2 text-phileon-ivory-muted hover:text-phileon-gold">Shipments →</Link>
            <Link to="/admin/returns" className="border border-white/10 px-3 py-2 text-phileon-ivory-muted hover:text-phileon-gold">Returns →</Link>
            <Link to="/admin/disputes" className="border border-white/10 px-3 py-2 text-phileon-ivory-muted hover:text-phileon-gold">Disputes →</Link>
            <Link to="/admin/inventory" className="border border-white/10 px-3 py-2 text-phileon-ivory-muted hover:text-phileon-gold">Inventory →</Link>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Internal Notes (never customer-facing)</p>
        <ul className="space-y-2 mb-3">
          {(detail.admin_notes || []).map((n, i) => (
            <li key={i} className="text-sm border-l-2 border-phileon-gold pl-3">
              <p className="whitespace-pre-wrap">{n.note}</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/50 mt-1">
                {n.actor} · {fmt(n.at)}
              </p>
            </li>
          ))}
          {(!detail.admin_notes || detail.admin_notes.length === 0) && (
            <li className="text-xs italic text-white/50">No notes yet.</li>
          )}
        </ul>
        <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
                  rows={2} placeholder="Factual note…"
                  className="w-full bg-black/40 border border-white/10 p-2 text-sm"
                  data-testid="cc-note-input" />
        <button onClick={async () => {
                  if (!noteDraft.trim()) return;
                  await mutate('/notes', { note: noteDraft.trim() });
                  setNoteDraft('');
                }}
                disabled={!noteDraft.trim()}
                className="mt-2 border border-phileon-gold text-phileon-gold px-4 py-2 tracking-[0.2em] text-xs uppercase disabled:opacity-40"
                data-testid="cc-note-add">
          Add Note
        </button>
      </div>

      {/* Contact log */}
      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Contact Log</p>
        <ul className="space-y-2 mb-3">
          {(detail.contact_log || []).map((c, i) => (
            <li key={i} className="text-sm border-l-2 border-phileon-gold/40 pl-3">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/50">
                {c.direction} · {c.channel} · {c.actor} · {fmt(c.at)}
              </p>
              <p className="whitespace-pre-wrap">{c.summary}</p>
            </li>
          ))}
          {(!detail.contact_log || detail.contact_log.length === 0) && (
            <li className="text-xs italic text-white/50">No contact recorded.</li>
          )}
        </ul>
        <div className="grid md:grid-cols-3 gap-2">
          <select value={contactDraft.direction}
                  onChange={(e) => setContactDraft({...contactDraft, direction: e.target.value})}
                  className="bg-black/40 border border-white/10 p-2 text-sm"
                  data-testid="cc-contact-direction">
            <option value="inbound">inbound</option>
            <option value="outbound">outbound</option>
          </select>
          <select value={contactDraft.channel}
                  onChange={(e) => setContactDraft({...contactDraft, channel: e.target.value})}
                  className="bg-black/40 border border-white/10 p-2 text-sm"
                  data-testid="cc-contact-channel">
            <option value="email">email</option>
            <option value="phone">phone</option>
            <option value="website">website</option>
            <option value="other">other</option>
          </select>
        </div>
        <textarea value={contactDraft.summary}
                  onChange={(e) => setContactDraft({...contactDraft, summary: e.target.value})}
                  rows={2} placeholder="Summary of the contact…"
                  className="mt-2 w-full bg-black/40 border border-white/10 p-2 text-sm"
                  data-testid="cc-contact-summary" />
        <button onClick={async () => {
                  if (!contactDraft.summary.trim()) return;
                  await mutate('/contact-log', contactDraft);
                  setContactDraft({...contactDraft, summary: ''});
                }}
                disabled={!contactDraft.summary.trim()}
                className="mt-2 border border-phileon-gold text-phileon-gold px-4 py-2 tracking-[0.2em] text-xs uppercase disabled:opacity-40"
                data-testid="cc-contact-add">
          Record Contact
        </button>
      </div>

      {/* Message previews (copy-only) */}
      {previews.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">
            Message Previews (copy · no send)
          </p>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {previews.map((p) => (
              <div key={p.key} className="border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/60">{p.title}</p>
                <p className="mt-1 whitespace-pre-wrap">{p.body}</p>
                <button onClick={() => navigator.clipboard?.writeText(p.body)}
                        className="mt-2 text-[10px] uppercase tracking-[0.24em] text-phileon-gold"
                        data-testid={`cc-copy-${p.key}`}>
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer 360 */}
      {c360 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Customer 360</p>
          <div className="text-xs text-white/70">
            <p>Consent: {c360.consent?.marketing_consented ? 'CONSENTED' : 'NOT CONSENTED'}
               {c360.consent?.suppressed ? ' · SUPPRESSED' : ''}
               {c360.consent?.marketing_unsubscribed_at ? ' · UNSUBSCRIBED' : ''}
            </p>
            <p className="mt-1">Orders: {c360.orders?.length || 0}</p>
            <p>Prior cases: {c360.cases?.length || 0}</p>
            <p>Active/past RMAs: {c360.rma?.length || 0}</p>
            <p>Disputes: {c360.disputes?.length || 0}</p>
          </div>
          {(c360.orders || []).slice(0, 3).map((o) => (
            <div key={o.order_number} className="mt-2 border border-white/10 p-2 text-xs">
              <p className="text-phileon-gold">{o.order_number}</p>
              <p className="text-white/60">
                {(o.fulfillment_status || o.fulfilment_status || '—')} ·
                {' '}{o.currency} {(o.total_cents / 100).toFixed(2)}
                {o.carrier ? ` · ${o.carrier}` : ''}
              </p>
              <p className="text-white/50 italic">
                {(o.items || []).map((i) => `${i.product_name}${i.availability_mode ? ' (' + i.availability_mode.replace(/_/g, ' ') + ')' : ''}`).join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {timeline && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Order Timeline</p>
          {timeline.events?.length ? (
            <ol className="text-xs space-y-1">
              {timeline.events.map((e, i) => (
                <li key={i} className="flex justify-between border-b border-white/5 py-1">
                  <span className="text-phileon-ivory-muted">{fmt(e.at)}</span>
                  <span className="text-phileon-gold tracking-[0.16em]">{e.event}</span>
                  <span className="text-white/50">{(e.source || '').replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-white/50 italic text-xs">No events yet.</p>
          )}
        </div>
      )}

      {/* Audit */}
      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-phileon-gold mb-2">Case Audit</p>
        <ol className="text-xs space-y-1">
          {audit.length === 0 && <li className="text-white/50 italic">No audit rows.</li>}
          {audit.map((a, i) => (
            <li key={i} className="flex justify-between border-b border-white/5 py-1">
              <span className="text-phileon-ivory-muted">{fmt(a.at)}</span>
              <span className="text-white/70">{a.action}{a.previous ? ` (${a.previous} → ${a.new})` : ''}</span>
              <span className="text-white/50">{a.actor}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
