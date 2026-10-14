/* Growth OS — Content Opportunities tab (DRAFT ONLY · never published). */
import { useEffect, useState } from 'react';
import { Panel, Pill, Empty, Btn, fmtDate, useAsync, useGrowthApi } from './shared';

function Draft({ d, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [showEv, setShowEv] = useState(false);
  const [body, setBody] = useState(d.body);
  return (
    <li className="border border-white/10 p-3 sm:p-4 min-w-0" data-testid={`gos-draft-${d.id}`}>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Pill value={d.status === 'draft' ? 'integration_required' : d.status} label={d.status} testId={`gos-draft-status-${d.id}`} />
        <Pill value="configured" label={d.format.replace(/_/g, ' ')} />
        {d.version && <Pill value="configured" label={`v${d.version}`} testId={`gos-draft-version-${d.id}`} />}
        <Pill value="disabled" label="not published" />
        <span className="text-[11px] text-white/40 ml-auto">{fmtDate(d.created_at)}</span>
      </div>
      <p className="font-serif text-base sm:text-lg break-words">{d.title}</p>
      {editing
        ? <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} data-testid={`gos-draft-body-${d.id}`}
                    className="w-full mt-2 bg-black/40 border border-white/10 p-2 text-sm leading-relaxed" />
        : <pre className="whitespace-pre-wrap break-words font-sans text-sm text-white/75 mt-2 leading-relaxed" data-testid={`gos-draft-text-${d.id}`}>{d.body}</pre>}
      {d.notes && <p className="text-[11px] text-white/40 mt-2 break-words">Owner notes: {d.notes}</p>}
      <p className="text-[11px] text-white/40 mt-1 break-words" data-testid={`gos-draft-pieces-${d.id}`}>
        Pieces referenced: {(d.products_referenced || []).length ? d.products_referenced.map((p) => p.name).join(' · ') : 'none (no product named)'}
      </p>
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
        {(d.evidence || []).length > 0 && <Btn testId={`gos-draft-evidence-${d.id}`} onClick={() => setShowEv(!showEv)}>{showEv ? 'Hide' : 'Evidence'} ({d.evidence.length})</Btn>}
        <Btn tone="danger" testId={`gos-draft-delete-${d.id}`} onClick={() => onDelete(d.id)}>Delete</Btn>
      </div>
      {showEv && (
        <ul className="mt-3 space-y-1 border-t border-white/[0.06] pt-3" data-testid={`gos-draft-evidence-list-${d.id}`}>
          {d.evidence.map((e) => (
            <li key={e.id} className="text-[12px] text-white/60 break-words"><span className="text-phileon-gold mr-2">[{e.id}]</span>{e.text}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

const FORMAT_KEYS = ['instagram_caption', 'blog_outline', 'email_concept', 'product_story', 'landing_copy'];
const SOURCE_ERRORS = {
  SOURCE_NOT_FOUND: 'That initiative no longer exists.',
  SOURCE_SUPERSEDED: 'That initiative was merged into a canonical initiative — draft from the canonical one.',
  SOURCE_SYNTHETIC_TEST_DATA: 'That initiative rests only on synthetic test data and cannot be drafted from.',
  SOURCE_NOT_ACTIVE: 'That initiative is dismissed or archived.',
};

export default function ContentOpportunities({ draftRecId = '' }) {
  const api = useGrowthApi();
  const [state, load] = useAsync(() => api('/content-drafts'), [api]);
  const [form, setForm] = useState({ recommendation_id: draftRecId, format: 'instagram_caption', notes: '' });
  const [excluded, setExcluded] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (draftRecId) setForm((f) => ({ ...f, recommendation_id: draftRecId })); }, [draftRecId]);
  useEffect(() => { setExcluded([]); }, [form.recommendation_id]);

  const d = state.data || {};
  const formats = d.formats || {};
  const formatKeys = Object.keys(formats).length ? Object.keys(formats) : FORMAT_KEYS;
  const sources = d.sources || [];
  const linkedMissing = Boolean(draftRecId && d.sources && !sources.some((s) => s.id === draftRecId));
  const selected = sources.find((s) => s.id === form.recommendation_id);
  const pieces = selected?.products || [];
  const chosenSlugs = pieces.map((p) => p.slug).filter((s) => !excluded.includes(s));

  const generate = async () => {
    if (!form.recommendation_id) { setMsg('Choose an initiative first.'); return; }
    if (!selected) { setMsg('The linked initiative is not eligible for drafting — choose another from the list.'); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await api('/content-drafts/generate', { method: 'POST', body: JSON.stringify({ ...form, product_slugs: chosenSlugs }) });
      setMsg(`Draft v${r.version} saved. It is NOT published.`); await load();
    } catch (e) {
      const m = e.message;
      setMsg(m.startsWith('CLAUDE_') ? `Claude unavailable (${m}). No draft was invented.` : SOURCE_ERRORS[m] || m);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5 min-w-0" data-testid="gos-content">
      <Panel title="Create a draft from an initiative" testId="gos-content-create"
             aside={<Pill value="disabled" label="draft only · no publishing" testId="gos-content-publish-lock" />}>
        {linkedMissing && (
          <p className="text-xs text-amber-300 mb-3 break-words" data-testid="gos-content-linked-missing">
            The initiative you arrived from is not available for drafting (missing, merged, invalidated or dismissed). Choose one below.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 min-w-0 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">Initiative</span>
            <select value={selected ? form.recommendation_id : ''} onChange={(e) => setForm({ ...form, recommendation_id: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 p-2 text-sm text-phileon-ivory" data-testid="gos-content-rec">
              <option value="">— choose an initiative —</option>
              {sources.map((r) => <option key={r.id} value={r.id}>[{r.priority}] {r.title}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">Content format</span>
            <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 p-2 text-sm text-phileon-ivory" data-testid="gos-content-format">
              {formatKeys.map((k) => <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Owner notes for the writer (optional)"
                 className="w-full bg-black/40 border border-white/10 p-2 text-sm md:col-span-3" data-testid="gos-content-notes" />
        </div>
        {selected && (
          <p className="text-[11px] text-white/50 mt-2 break-words" data-testid="gos-content-selected">
            Selected: {selected.title} · {selected.status.replace('_', ' ')} · {selected.evidence_quality || 'quality n/a'} evidence
            {selected.merged_variants > 0 ? ` · ${selected.merged_variants} variant(s) consolidated` : ''}
          </p>
        )}
        {selected && (
          <div className="mt-3" data-testid="gos-content-pieces">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">Verified pieces Claude may reference</p>
            {pieces.length === 0
              ? <p className="text-[11px] text-white/40 mt-1">None matched this initiative — the draft will name no product.</p>
              : <ul className="mt-1 space-y-1">
                  {pieces.map((p) => (
                    <li key={p.slug}>
                      <label className="flex items-start gap-2 text-[12px] text-white/70 break-words">
                        <input type="checkbox" className="mt-0.5 accent-[#c9a961]" checked={!excluded.includes(p.slug)} data-testid={`gos-content-piece-${p.slug}`}
                               onChange={(e) => setExcluded((x) => e.target.checked ? x.filter((s) => s !== p.slug) : [...x, p.slug])} />
                        <span><span className="text-phileon-ivory">{p.name}</span> · {(p.categories || []).join('/')} · {String(p.availability || '').replace(/_/g, ' ')}</span>
                      </label>
                    </li>
                  ))}
                </ul>}
          </div>
        )}
        <p className="text-[11px] text-white/40 mt-1">{formats[form.format]}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Btn tone="gold" onClick={generate} disabled={busy || state.loading} testId="gos-content-generate">{busy ? 'Writing…' : 'Generate draft'}</Btn>
          {msg && <span className="text-xs text-amber-300 break-words" data-testid="gos-content-msg">{msg}</span>}
        </div>
        {!state.loading && d.sources && sources.length === 0 && (
          <p className="text-xs text-white/50 mt-3" data-testid="gos-content-no-sources">No eligible initiatives yet — generate initiatives in the AI Growth Director first.</p>
        )}
      </Panel>

      {state.error && <p className="text-rose-300 text-sm break-words" data-testid="gos-content-error">{state.error}</p>}
      {!state.loading && !state.error && (d.drafts || []).length === 0 && (
        <Empty title="No drafts yet" testId="gos-content-empty" body="Drafts are written by Claude Sonnet 5.5 from an initiative's evidence, in PHILEON's editorial voice. They stay here until you copy them out — nothing is posted, sent or advertised automatically." />
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
