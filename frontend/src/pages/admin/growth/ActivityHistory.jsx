/* Growth OS — Activity History tab (runs · API ledger · schedule). */
import { useEffect } from 'react';
import { Panel, Pill, fmtDate, useAsync, useGrowthApi } from './shared';

const RUN_PILL = { success: 'operational', partial: 'configured', running: 'configured', skipped: 'inactive', failed: 'error', duplicate: 'inactive' };

export default function ActivityHistory() {
  const api = useGrowthApi();
  const [state, load] = useAsync(() => api('/activity'), [api]);
  useEffect(() => { load(); }, [load]);
  const d = state.data || {};
  const s = d.schedule || {};

  return (
    <div className="space-y-5" data-testid="gos-activity">
      <div className="grid gap-3 md:grid-cols-3 text-sm">
        <Panel title="Next scheduled run" testId="gos-act-next"><p data-testid="gos-act-next-value">{fmtDate(s.next_run?.utc)}</p>
          <p className="text-[11px] text-white/45 mt-1">{s.next_run_will_execute ? 'Armed' : 'Will be skipped (scheduler off or SerpAPI missing)'}</p></Panel>
        <Panel title="Last successful run" testId="gos-act-last"><p>{fmtDate(s.last_successful_run?.finished_at)}</p></Panel>
        <Panel title="SerpAPI usage" testId="gos-act-usage"><p>{d.usage?.daily_used ?? 0}/{d.usage?.daily_limit ?? 0} today · {d.usage?.monthly_used ?? 0}/{d.usage?.monthly_limit ?? 0} month</p></Panel>
      </div>

      <Panel title="Runs" testId="gos-act-runs">
        {state.error && <p className="text-rose-300 text-sm">{state.error}</p>}
        {(d.runs || []).length === 0 && !state.loading && <p className="text-sm text-white/50" data-testid="gos-act-runs-empty">No runs recorded yet.</p>}
        <ul className="divide-y divide-white/[0.06]">
          {(d.runs || []).map((r) => (
            <li key={r.run_id} className="py-2.5" data-testid={`gos-run-${r.run_id}`}>
              <div className="flex flex-wrap items-center gap-2">
                <Pill value={RUN_PILL[r.status] || 'inactive'} label={r.status} />
                <Pill value="configured" label={r.trigger} />
                <span className="text-sm">{r.run_id}</span>
                <span className="text-[11px] text-white/45 ml-auto">{fmtDate(r.started_at)}</span>
              </div>
              {r.reason ? <p className="text-[11px] text-amber-300 mt-1">{String(r.reason).replace(/_/g, ' ')}</p> : null}
              {(r.steps || []).length > 0 && (
                <ul className="mt-1 text-[11px] text-white/50">{r.steps.map((st, i) => <li key={i}>· {st}</li>)}</ul>
              )}
              {r.counters && (
                <p className="text-[11px] text-white/40 mt-1">
                  {Object.entries(r.counters).map(([k, v]) => `${k.replace(/_/g, ' ')} ${v}`).join(' · ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="External API ledger (SerpAPI)" testId="gos-act-ledger">
        {(d.ledger || []).length === 0
          ? <p className="text-sm text-white/50" data-testid="gos-act-ledger-empty">No external API calls recorded. SerpAPI has not been queried.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                  <tr><th className="text-left py-1">When</th><th>Kind</th><th>Market</th><th>Terms</th><th>Billable</th><th>OK</th></tr>
                </thead>
                <tbody>
                  {d.ledger.map((l) => (
                    <tr key={l.id} className="border-t border-white/[0.06]">
                      <td className="py-1 text-[12px]">{fmtDate(l.at)}</td><td className="text-center">{l.kind}</td>
                      <td className="text-center">{l.market || '—'}</td><td className="text-center">{l.terms}</td>
                      <td className="text-center">{l.billable ? 'yes' : 'no'}</td><td className="text-center">{l.ok ? 'yes' : 'no'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Panel>
    </div>
  );
}
