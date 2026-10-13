/* Growth OS — AI Growth Director tab (Claude Sonnet 5.5, evidence-grounded, clustered initiatives). */
import { useEffect, useState } from 'react';
import { Panel, Pill, Empty, Btn, fmtDate, useAsync, useGrowthApi } from './shared';

const STATUSES = ['new', 'accepted', 'in_progress', 'done', 'dismissed'];
const FILTERS = ['new', 'accepted', 'in_progress', 'done', 'dismissed', 'merged', 'invalidated', 'all'];
const QUALITY_PILL = { verified: 'operational', unverified: 'integration_required', test: 'error' };
const STRENGTH_PILL = { established: 'operational', indicative: 'configured', exploratory: 'integration_required' };

function Provenance({ p }) {
  return (
    <p className="text-[11px] text-white/45 break-words" data-testid={`gos-ev-prov-${p.id}`}>
      source {p.source} · {p.collection} · period {p.period} · env {p.env} · events {p.event_count ?? '—'}
      {p.distinct_sessions != null ? ` · sessions ${p.distinct_sessions}` : ''}
      {p.catalogue_match === false ? ' · NOT a PHILEON catalogue product' : ''}
    </p>
  );
}

function EvidenceSources() {
  const api = useGrowthApi();
  const [state, load] = useAsync(() => api('/evidence'), [api]);
  useEffect(() => { load(); }, [load]);
  const d = state.data || {};
  const s = d.summary || {};
  return (
    <Panel title={`Evidence sources · ${d.env || ''} · last ${d.period || '30d'}`} testId="gos-evidence"
           aside={<span className="text-[11px] text-white/50" data-testid="gos-evidence-summary">
             verified {s.verified ?? 0} · unverified {s.unverified ?? 0} · test {s.test ?? 0}</span>}>
      {state.loading && <p className="text-sm text-white/50">Loading…</p>}
      {!state.loading && (d.evidence || []).length === 0 && <p className="text-sm text-white/50" data-testid="gos-evidence-empty">No evidence collected yet.</p>}
      <ul className="divide-y divide-white/[0.06]">
        {(d.evidence || []).map((e) => (
          <li key={e.id} className="py-2.5 min-w-0" data-testid={`gos-ev-${e.id}`}>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-phileon-gold text-[11px]">[{e.id}]</span>
              <Pill value={QUALITY_PILL[e.quality] || 'inactive'} label={e.quality} testId={`gos-ev-quality-${e.id}`} />
              {e.excluded && <Pill value="error" label="excluded from director" />}
              <Pill value="configured" label={e.kind.replace(/_/g, ' ')} />
            </div>
            <p className="text-sm text-white/80 break-words">{e.text}</p>
            <p className="text-[11px] text-amber-300/90 break-words">{e.quality_reason}</p>
            <Provenance p={{ id: e.id, ...e.provenance }} />
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-white/40 mt-3 break-words">
        Rules: test data is excluded entirely; unverified evidence can only back exploratory, non-revenue hypotheses;
        fewer than {d.rules?.sufficient_events ?? 30} events is always exploratory. No customer personal data is shown.
      </p>
    </Panel>
  );
}

function Recommendation({ r, onStatus, onDraft }) {
  const [open, setOpen] = useState(false);
  const readOnly = r.status === 'merged' || r.status === 'invalidated';
  return (
    <li className="border border-white/10 p-3 sm:p-4 min-w-0" data-testid={`gos-rec-${r.id}`}>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <Pill value={r.priority} />
        <Pill value={STRENGTH_PILL[r.evidence_strength] || 'inactive'} label={r.evidence_strength ? `${r.evidence_strength} evidence` : 'unscored'} testId={`gos-rec-strength-${r.id}`} />
        <Pill value={QUALITY_PILL[r.evidence_quality] || 'inactive'} label={r.evidence_quality || 'quality n/a'} />
        <Pill value={r.channel} /><Pill value={r.market} />
        <Pill value={r.engine === 'deterministic' ? 'inactive' : 'operational'} label={r.engine} />
        {r.merged_variants > 0 && <Pill value="configured" label={`${r.merged_variants} variant${r.merged_variants > 1 ? 's' : ''} merged`} testId={`gos-rec-merged-${r.id}`} />}
        {r.status === 'invalidated' && <Pill value="error" label="invalidated · test data" testId={`gos-rec-invalidated-${r.id}`} />}
        {r.status === 'merged' && <Pill value="inactive" label="merged into initiative" />}
      </div>
      <p className="font-serif text-base sm:text-lg leading-snug break-words" data-testid={`gos-rec-title-${r.id}`}>{r.title}</p>
      {r.exploratory && <p className="text-[11px] uppercase tracking-[0.2em] text-amber-300 mt-1" data-testid={`gos-rec-exploratory-${r.id}`}>Exploratory hypothesis — limited or unverified evidence</p>}
      <p className="text-sm text-white/70 mt-1 break-words">{r.rationale}</p>
      <div className="mt-2">
        <p className="text-phileon-gold text-[10px] uppercase tracking-[0.22em]">Actions</p>
        <ul className="text-sm space-y-1 mt-1">
          {(r.actions || [r.action]).filter(Boolean).map((a, i) => <li key={i} className="break-words">· {a}</li>)}
        </ul>
      </div>
      {r.variant_titles?.length > 0 && (
        <p className="text-[11px] text-white/40 mt-2 break-words">Consolidated: {r.variant_titles.join(' · ')}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {!readOnly && (
          <select value={r.status} data-testid={`gos-rec-status-${r.id}`} onChange={(e) => onStatus(r.id, e.target.value)}
                  className="bg-black/40 border border-white/10 p-1.5 text-xs max-w-full">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        )}
        {!readOnly && <Btn testId={`gos-rec-draft-${r.id}`} onClick={() => onDraft(r)}>Draft content</Btn>}
        <Btn testId={`gos-rec-evidence-${r.id}`} onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Evidence'} ({r.evidence_ids?.length || 0})</Btn>
      </div>
      {open && (
        <ul className="mt-3 space-y-2 border-t border-white/[0.06] pt-3" data-testid={`gos-rec-evidence-list-${r.id}`}>
          {(r.evidence || []).map((e) => (
            <li key={e.id} className="text-[12px] text-white/60 break-words">
              <span className="text-phileon-gold mr-2">[{e.id}]</span>
              {e.quality && <Pill value={QUALITY_PILL[e.quality] || 'inactive'} label={e.quality} />} {e.text}
              {e.provenance && <Provenance p={{ id: `${r.id}-${e.id}`, ...e.provenance }} />}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-white/35 mt-2 break-words">
        score {r.score ?? '—'}/100 (deterministic: evidence quality · sufficiency · relevance · impact · effort)
        {r.impact ? ` · impact ${r.impact}` : ''}{r.effort ? ` · effort ${r.effort}` : ''}
        {r.evidence_events != null ? ` · ${r.evidence_events} events` : ''} · {fmtDate(r.created_at)} · seen {r.seen_count}×
      </p>
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
      const extras = [r.merged_existing ? `${r.merged_existing} existing merged` : null, r.invalidated ? `${r.invalidated} invalidated (test data)` : null].filter(Boolean).join(' · ');
      setMsg(r.reason === 'no_usable_evidence'
        ? `No verified or unverified evidence available — nothing generated. The Director never invents recommendations.${extras ? ` (${extras})` : ''}`
        : `${r.created} new initiative(s) · engine ${r.engine} · ${r.evidence_count} evidence items · cap ${r.limit}${r.reason ? ` · ${r.reason}` : ''}${extras ? ` · ${extras}` : ''}`);
      await load();
    } catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5 min-w-0" data-testid="gos-director">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)} data-testid={`gos-rec-filter-${s}`}
                  className={`text-[11px] uppercase tracking-[0.18em] px-2.5 py-1.5 border ${filter === s ? 'border-phileon-gold text-phileon-gold' : 'border-white/10 text-white/60'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Pill value={d.health?.status} label={d.health ? `Claude · ${d.health.status}` : null} testId="gos-director-claude-status" />
        <Btn tone="gold" onClick={generate} disabled={busy} testId="gos-director-generate">{busy ? 'Thinking…' : 'Generate initiatives'}</Btn>
      </div>
      {msg && <p className="text-xs text-amber-300 break-words" data-testid="gos-director-msg">{msg}</p>}
      {state.error && <p className="text-rose-300 text-sm" data-testid="gos-director-error">{state.error}</p>}
      <p className="text-[11px] text-white/40 break-words">
        One initiative per distinct opportunity: substantially equivalent actions are clustered, not repeated. Priority is a
        deterministic score — never an AI confidence percentage. Nothing is auto-published or sent.
      </p>

      {!state.loading && (d.recommendations || []).length === 0 && (
        <Empty title="No initiatives in this view" testId="gos-director-empty"
               body="Generate initiatives to have the Director analyse current evidence. Without verified or unverified evidence, nothing is produced." />
      )}
      <ul className="space-y-3">
        {(d.recommendations || []).map((r) => (
          <Recommendation key={r.id} r={r}
            onStatus={(id, status) => api(`/recommendations/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }).then(load)}
            onDraft={onDraftRequest} />
        ))}
      </ul>

      <EvidenceSources />
    </div>
  );
}
