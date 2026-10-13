/* Growth OS — Growth Overview tab. */
import { Panel, Pill, Empty, Btn, fmtDate, useGrowthApi } from './shared';

const INTEGRATIONS = [
  ['growth_os', 'Growth OS module'],
  ['scheduler', 'Daily scheduler'],
  ['serpapi', 'SerpAPI · Google Trends'],
  ['claude', 'Claude Sonnet 5.5 · Director'],
  ['jev', 'Jev / TypeSafe · Priority scoring'],
];

function Stat({ label, value, testId }) {
  return (
    <div className="border border-white/10 p-4" data-testid={testId}>
      <p className="text-[10px] uppercase tracking-[0.26em] text-phileon-gold">{label}</p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
    </div>
  );
}

export default function GrowthOverview({ overview, reload }) {
  const api = useGrowthApi();
  const h = overview.health || {};
  const s = overview.schedule || {};
  const u = overview.serp_usage || {};
  const c = overview.counts || {};

  const onLimitChange = async (key, value) => {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return;
    await api('/settings', { method: 'PUT', body: JSON.stringify({ [key]: n }) });
    reload();
  };

  return (
    <div className="space-y-5" data-testid="gos-overview">
      <Panel title="Integration health" testId="gos-health">
        <ul className="divide-y divide-white/[0.06]">
          {INTEGRATIONS.map(([key, label]) => {
            const row = h[key] || {};
            return (
              <li key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5"
                  data-testid={`gos-health-${key}`}>
                <div>
                  <p className="text-sm">{label}</p>
                  <p className="text-[11px] text-white/45">
                    {row.reason || (row.flag ? `flag ${row.flag}` : '')}
                    {row.fallback ? ` · fallback: ${row.fallback}` : ''}
                    {row.model ? ` · ${row.model}` : ''}
                    {row.account?.plan_name ? ` · plan ${row.account.plan_name} · ${row.account.total_searches_left ?? '—'} searches left` : ''}
                  </p>
                </div>
                <Pill value={row.status} label={row.status === 'configured' ? 'configured · unverified' : null}
                      testId={`gos-health-${key}-status`} />
              </li>
            );
          })}
        </ul>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Daily refresh · 7:00 America/Toronto" testId="gos-schedule"
               aside={<Pill value={s.cron_enabled ? 'enabled' : 'disabled'} testId="gos-schedule-flag" />}>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between gap-4"><dt className="text-white/50">Next scheduled run</dt>
              <dd className="text-right" data-testid="gos-next-run">{fmtDate(s.next_run?.utc)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/50">Will execute</dt>
              <dd data-testid="gos-next-run-will-execute">{s.next_run_will_execute ? 'Yes' : 'No — armed only when scheduler + SerpAPI are active'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/50">Last successful run</dt>
              <dd className="text-right" data-testid="gos-last-success">{fmtDate(s.last_successful_run?.finished_at)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/50">Last run</dt>
              <dd className="text-right" data-testid="gos-last-run">
                {s.last_run ? `${fmtDate(s.last_run.started_at)} · ${s.last_run.status}${s.last_run.reason ? ` (${s.last_run.reason.replace(/_/g, ' ')})` : ''}` : '—'}
              </dd></div>
          </dl>
          <p className="text-[11px] text-white/40 mt-3 leading-relaxed">
            DST-aware. Platform cron <code>{s.next_run?.name}</code> · <code>{s.next_run?.cron}</code> · secret
            {s.cron_secret_configured ? ' configured' : ' MISSING'}. External research never runs until SerpAPI is
            configured and <code>GROWTH_OS_CRON_ENABLED=true</code>.
          </p>
        </Panel>

        <Panel title="SerpAPI query budget" testId="gos-budget">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/50 text-[11px] uppercase tracking-[0.2em]">Today</p>
              <p className="font-serif text-2xl" data-testid="gos-budget-daily">{u.daily_used ?? 0} / {u.daily_limit ?? 0}</p>
              <label className="block text-[11px] text-white/50 mt-2">Daily limit
                <input type="number" min="0" defaultValue={u.daily_limit} data-testid="gos-limit-daily"
                       onBlur={(e) => onLimitChange('serp_daily_limit', e.target.value)}
                       className="mt-1 w-full bg-black/40 border border-white/10 p-1.5 text-sm" />
              </label>
            </div>
            <div>
              <p className="text-white/50 text-[11px] uppercase tracking-[0.2em]">This month</p>
              <p className="font-serif text-2xl" data-testid="gos-budget-monthly">{u.monthly_used ?? 0} / {u.monthly_limit ?? 0}</p>
              <label className="block text-[11px] text-white/50 mt-2">Monthly limit
                <input type="number" min="0" defaultValue={u.monthly_limit} data-testid="gos-limit-monthly"
                       onBlur={(e) => onLimitChange('serp_monthly_limit', e.target.value)}
                       className="mt-1 w-full bg-black/40 border border-white/10 p-1.5 text-sm" />
              </label>
            </div>
          </div>
          <p className="text-[11px] text-white/40 mt-3">Cached snapshots (&lt; {overview.settings?.snapshot_ttl_hours}h) are never re-queried. TIMESERIES batches 5 terms per call.</p>
        </Panel>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Stat label="Keywords enabled" value={`${c.keywords_enabled ?? 0}/${c.keywords_total ?? 0}`} testId="gos-stat-keywords" />
        <Stat label="New discoveries" value={c.discoveries_new ?? 0} testId="gos-stat-discoveries" />
        <Stat label="New recommendations" value={c.recommendations_new ?? 0} testId="gos-stat-recs" />
        <Stat label="Content drafts" value={c.drafts ?? 0} testId="gos-stat-drafts" />
      </div>

      {h.serpapi?.status === 'integration_required' && (
        <Empty title="Customer Radar · Integration Required" testId="gos-serp-required"
               body="Add SERPAPI_API_KEY to the backend environment to activate Google Trends research for CA and US. No trends, discoveries or market opportunities are fabricated while the key is missing." />
      )}

      <Panel title="Guardrails" testId="gos-guardrails">
        <div className="flex flex-wrap gap-2">
          {(overview.guardrails || []).map((g) => <Pill key={g} value="configured" label={g.replace(/_/g, ' ')} />)}
        </div>
        <div className="mt-3"><Btn onClick={reload} testId="gos-overview-refresh">Refresh status</Btn></div>
      </Panel>
    </div>
  );
}
