/* Growth OS — Content Opportunities tab (DRAFT ONLY · never published). */
import { useEffect, useState } from 'react';
import { Panel, Pill, Empty, Btn, fmtDate, useAsync, useGrowthApi } from './shared';

function Draft({ d, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(d.body);
  return (
    <li className="border border-white/10 p-4" data-testid={`gos-draft-${d.id}`}>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Pill value={d.status === 'draft' ? 'integration_required' : d.status} label={d.status} testId={`gos-draft-status-${d.id}`} />
        <Pill value="configured" label={d.format.replace(/_/g, ' ')} />
        <Pill value="disabled" label="not published" />
        <span className="text-[11px] text-white/40 ml-auto">{fmtDate(d.created_at)}</span>
      </div>
      <p className="font-serif text-lg">{d.title}</p>
      {editing
        ? <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} data-testid={`gos-draft-body-${d.id}`}
                    className="w-full mt-2 bg-black/40 border border-white/10 p-2 text-sm leading-relaxed" />
        : <pre className="whitespace-pre-wrap font-sans text-sm text-white/75 mt-2 leading-relaxed" data-testid={`gos-draft-text-${d.id}`}>{d.body}</pre>}
      <div className="flex flex-wrap gap-2 mt-3">
        {editing
          ? <><Btn tone="gold" testId={`gos-draft-save-${d.id}`} onClick={async () => { await onSave(d.id, { body }); setEditing(false); }}>Save draft</Btn>
               <Btn onClick={() => { setBody(d.body); setEditing(false); }}>Cancel</Btn></>
          : <Btn testId={`gos-draft-edit-${d.id}`} onClick={() => setEditing(true)}>Edit</Btn>}
        <select value={d.status} data-testid={`gos-draft-setstatus-${d.id}`} onChange={(e) => onSave(d.id, { status: e.target.value })}
                className="bg-black/40 border border-white/10 p-1 text-xs">
          {['draft', 'reviewed', 'archived'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Btn testId={`gos-draft-copy-${d.id}`} onClick={() => navigator.clipboard?.writeText(d.body)}>Copy</Btn>
        <Btn tone="danger" testId={`gos-draft-delete-${d.id}`} onClick={() => onDelete(d.id)}>Delete</Btn>
      </div>
    </li>
  );
}

export default function ContentOpportunities({ draftSource, clearDraftSource }) {
  const api = useGrowthApi();
  const [state, load] = useAsync(() => api('/content-drafts'), [api]);
  const [recs, loadRecs] = useAsync(() => api('/recommendations'), [api]);
  const [form, setForm] = useState({ recommendation_id: '', format: 'instagram_caption', notes: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => { load(); loadRecs(); }, [load, loadRecs]);
  useEffect(() => {
    if (draftSource) { setForm((f) => ({ ...f, recommendation_id: draftSource.id })); clearDraftSource?.(); }
  }, [draftSource, clearDraftSource]);

  const d = state.data || {};
  const formats = d.formats || {};
  const recList = recs.data?.recommendations || [];

  const generate = async () => {
    if (!form.recommendation_id) { setMsg('Choose a recommendation first.'); return; }
    setBusy(true); setMsg(null);
    try { await api('/content-drafts/generate', { method: 'POST', body: JSON.stringify(form) }); setMsg('Draft created. It is NOT published.'); await load(); }
    catch (e) { setMsg(e.message.startsWith('CLAUDE_') ? `Claude unavailable (${e.message}). No draft was invented.` : e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5" data-testid="gos-content">
      <Panel title="Create a draft from a recommendation" testId="gos-content-create"
             aside={<Pill value="disabled" label="draft only · no publishing" testId="gos-content-publish-lock" />}>
        <div className="grid gap-2 md:grid-cols-3">
          <select value={form.recommendation_id} onChange={(e) => setForm({ ...form, recommendation_id: e.target.value })}
                  className="bg-black/40 border border-white/10 p-2 text-sm md:col-span-2" data-testid="gos-content-rec">
            <option value="">— choose a recommendation —</option>
            {recList.map((r) => <option key={r.id} value={r.id}>[{r.priority}] {r.title}</option>)}
          </select>
          <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
                  className="bg-black/40 border border-white/10 p-2 text-sm" data-testid="gos-content-format">
            {Object.keys(formats).map((k) => <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>)}
          </select>
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Owner notes for the writer (optional)"
                 className="bg-black/40 border border-white/10 p-2 text-sm md:col-span-3" data-testid="gos-content-notes" />
        </div>
        <p className="text-[11px] text-white/40 mt-2">{formats[form.format]}</p>
        <div className="mt-3 flex items-center gap-3">
          <Btn tone="gold" onClick={generate} disabled={busy} testId="gos-content-generate">{busy ? 'Writing…' : 'Generate draft'}</Btn>
          {msg && <span className="text-xs text-amber-300" data-testid="gos-content-msg">{msg}</span>}
        </div>
      </Panel>

      {state.error && <p className="text-rose-300 text-sm">{state.error}</p>}
      {!state.loading && (d.drafts || []).length === 0 && (
        <Empty title="No drafts yet" testId="gos-content-empty" body="Drafts are written by Claude Sonnet 5.5 from a recommendation's evidence, in PHILEON's editorial voice. They stay here until you copy them out — nothing is posted, sent or advertised automatically." />
      )}
      <ul className="space-y-3">
        {(d.drafts || []).map((x) => (
          <Draft key={x.id} d={x}
            onSave={(id, patch) => api(`/content-drafts/${id}`, { method: 'PUT', body: JSON.stringify(patch) }).then(load)}
            onDelete={(id) => api(`/content-drafts/${id}`, { method: 'DELETE' }).then(load)} />
        ))}
      </ul>
    </div>
  );
}
