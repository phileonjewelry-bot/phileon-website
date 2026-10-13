/* PHILEON Growth OS — Phase 1 admin surface.
   Five tabs: Growth Overview · Customer Radar · AI Growth Director · Content Opportunities · Activity History.
   Feature-flagged (PHILEON_GROWTH_OS_ENABLED). Admin-only. Draft-only output. */
import { useCallback, useEffect, useState } from 'react';
import { Empty, Pill, useAsync, useGrowthApi } from './growth/shared';
import GrowthOverview from './growth/GrowthOverview';
import CustomerRadar from './growth/CustomerRadar';
import GrowthDirector from './growth/GrowthDirector';
import ContentOpportunities from './growth/ContentOpportunities';
import ActivityHistory from './growth/ActivityHistory';

const TABS = [
  { key: 'overview', label: 'Growth Overview' },
  { key: 'radar', label: 'Customer Radar' },
  { key: 'director', label: 'AI Growth Director' },
  { key: 'content', label: 'Content Opportunities' },
  { key: 'activity', label: 'Activity History' },
];

export default function AdminGrowthOS() {
  const api = useGrowthApi();
  const [tab, setTab] = useState('overview');
  const [draftSource, setDraftSource] = useState(null);
  const [state, load] = useAsync(() => api('/overview'), [api]);
  useEffect(() => { load(); }, [load]);
  const clearDraftSource = useCallback(() => setDraftSource(null), []);
  const ov = state.data;

  return (
    <div className="p-4 lg:p-8 text-phileon-ivory" data-testid="admin-growth-os">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs tracking-[0.32em] uppercase text-phileon-gold">PHILEON · Growth OS · Phase 1</p>
          <h1 className="font-serif text-2xl md:text-3xl tracking-wide">Growth Intelligence</h1>
          <p className="text-xs text-phileon-ivory-muted mt-1">
            Owner-only. Evidence-grounded. Draft-only output — nothing is published, messaged or advertised automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ov && <Pill value={ov.enabled ? 'enabled' : 'disabled'} label={`module ${ov.enabled ? 'enabled' : 'disabled'}`} testId="gos-module-flag" />}
          {ov?.health?.serpapi && <Pill value={ov.health.serpapi.status} label={`SerpAPI ${ov.health.serpapi.status.replace(/_/g, ' ')}`} testId="gos-serp-flag" />}
        </div>
      </div>

      {state.error && <p className="text-rose-300 text-sm mb-3" data-testid="gos-error">{state.error}</p>}
      {state.loading && !ov && <p className="text-white/60 text-sm">Loading…</p>}

      {ov && !ov.enabled && (
        <Empty title="Growth OS is disabled in this environment" testId="gos-disabled"
               body="Set PHILEON_GROWTH_OS_ENABLED=true in the backend environment to enable the admin dashboard. The scheduler is a separate flag (GROWTH_OS_CRON_ENABLED) and stays off by default." />
      )}

      {ov?.enabled && (
        <>
          <div className="flex flex-wrap gap-2 mb-6" data-testid="gos-tabs">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} data-testid={`gos-tab-${t.key}`}
                      className={`text-xs uppercase tracking-[0.2em] px-3 py-2 border transition-colors ${
                        tab === t.key ? 'border-phileon-gold text-phileon-gold' : 'border-white/10 text-white/60 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'overview' && <GrowthOverview overview={ov} reload={load} />}
          {tab === 'radar' && <CustomerRadar />}
          {tab === 'director' && <GrowthDirector onDraftRequest={(r) => { setDraftSource(r); setTab('content'); }} />}
          {tab === 'content' && <ContentOpportunities draftSource={draftSource} clearDraftSource={clearDraftSource} />}
          {tab === 'activity' && <ActivityHistory />}
        </>
      )}
    </div>
  );
}
