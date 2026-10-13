/* Growth OS — AI Growth Director tab (Claude Sonnet 5.5, evidence-grounded). */
import { useEffect, useState } from 'react';
import { Panel, Pill, Empty, Btn, fmtDate, useAsync, useGrowthApi } from './shared';

const STATUSES = ['new', 'accepted', 'in_progress', 'done', 'dismissed'];

function Recommendation({ r, onStatus, onDraft }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border border-white/10 p-4" data-testid={`gos-rec-${r.id}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Pill value={r.priority} /><Pill value={r.channel} /><Pill value={r.market} />
            <Pill value={r.engine === 'deterministic' ? 'inactive' : 'operational'} label={r.engine} />
          </div>
          <p className="font-serif text-lg leading-snug" data-testid={`gos-rec-title-${r.id}`}>{r.title}</p>
          <p className="text-sm text-white/70 mt-1">{r.rationale}</p>
          <p className="text-sm mt-2"><span className="text-phileon-gold text-[10px] uppercase tracking-[0.22em] mr-2">Action</span>{r.action}</p>
        </div>
        <div className="flex md:flex-col items-end gap-2 shrink-0">
          <select value={r.status} data-testid={`gos-rec-status-${r.id}`} onChange={(e) => onStatus(r.id, e.target.value)}
                  className="bg-black/40 border border-white/10 p-1.5 text-xs">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <Btn testId={`gos-rec-draft-${r.id}`} onClick={() => onDraft(r)}>Draft content</Btn>
          <Btn testId={`gos-rec-evidence-${r.id}`} onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Evidence'} ({r.evidence_ids?.length || 0})</Btn>
        </div>
      </div>
      {open && (
        <ul className="mt-3 space-y-1 border-t border-white/[0.06] pt-3" data-testid={`gos-rec-evidence-list-${r.id}`}>
          {(r.evidence || []).map((e) => (
            <li key={e.id} className="text-[12px] text-white/60"><span className="text-phileon-gold mr-2">[{e.id}]</span>{e.text}</li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-white/35 mt-2">confidence {Math.round((r.confidence || 0) * 100)}% · {fmtDate(r.created_at)} · seen {r.seen_count}×</p>
    </li>
  );
}

export default function GrowthDirector({ onDraftRequest }) {
  const api = useGrowthApi();
  const [filter, setFilter] = useState('new');
  const [state, load] = useAsync(() => api(`/recommendations${filter !== 'all' ? `?status=${filter}` : ''}`), [api, filter]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => { load(); }, [load]);
  const d = state.data || {};

  const generate = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await api('/director/generate', { method: 'POST' });
      setMsg(r.reason === 'no_evidence'
        ? 'No evidence available — nothing generated. The Director never invents recommendations.'
        : `${r.created} new recommendation(s) · engine ${r.engine} · ${r.evidence_count} evidence items${r.reason ? ` · ${r.reason}` : ''}`);
      await load();
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5" data-testid="gos-director">
      <div className="flex flex-wrap items-center gap-2">
        {['new', 'accepted', 'in_progress', 'done', 'dismissed', 'all'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} data-testid={`gos-rec-filter-${s}`}
                  className={`text-xs uppercase tracking-[0.2em] px-3 py-1.5 border ${filter === s ? 'border-phileon-gold text-phileon-gold' : 'border-white/10 text-white/60'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
        <span className="flex-1" />
        <Pill value={d.health?.status} label={d.health ? `Claude · ${d.health.status}` : null} testId="gos-director-claude-status" />
        <Btn tone="gold" onClick={generate} disabled={busy} testId="gos-director-generate">{busy ? 'Thinking…' : 'Generate recommendations'}</Btn>
      </div>
      {msg && <p className="text-xs text-amber-300" data-testid="gos-director-msg">{msg}</p>}
      {state.error && <p className="text-rose-300 text-sm" data-testid="gos-director-error">{state.error}</p>}
      <p className="text-[11px] text-white/40">Every recommendation cites evidence from the Radar and on-site analytics. Claude Sonnet 5.5 drafts; if unavailable, a deterministic rule engine over internal evidence is used and labelled. Nothing is auto-published or sent.</p>

      {!state.loading && (d.recommendations || []).length === 0 && (
        <Empty title="No recommendations in this view" testId="gos-director-empty"
               body="Generate recommendations to have the Director analyse current evidence. Without evidence, nothing is produced." />
      )}
      <ul className="space-y-3">
        {(d.recommendations || []).map((r) => (
          <Recommendation key={r.id} r={r}
            onStatus={(id, status) => api(`/recommendations/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }).then(load)}
            onDraft={onDraftRequest} />
        ))}
      </ul>
      <Panel title="Note" testId="gos-director-note">
        <p className="text-xs text-white/55">Recommendations are de-duplicated by title · market · channel across runs. Repeat sightings increment the “seen” count instead of creating duplicates.</p>
      </Panel>
    </div>
  );
}
