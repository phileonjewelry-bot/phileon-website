/* Growth OS — Targeted research run: pick keywords + market, estimate, explicitly confirm, then report actual usage. */
import { useEffect, useState } from 'react';
import { Panel, Pill, Btn, useAsync, useGrowthApi } from './shared';

const MARKET_OPTS = [['CA', 'Canada only'], ['US', 'United States only'], ['BOTH', 'Canada + United States']];

export default function TargetedRun({ disabled, onCompleted }) {
  const api = useGrowthApi();
  const [kwState, loadKw] = useAsync(() => api('/keywords'), [api]);
  const [selected, setSelected] = useState([]);
  const [market, setMarket] = useState('CA');
  const [maxReq, setMaxReq] = useState(2);
  const [estimate, setEstimate] = useState(null);
  const [run, setRun] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { loadKw(); }, [loadKw]);

  const keywords = (kwState.data?.keywords || []).filter((k) => k.enabled);
  const markets = market === 'BOTH' ? ['CA', 'US'] : [market];
  const scope = { keyword_ids: selected, markets, max_requests: Number(maxReq) || null };
  const invalidate = () => { setEstimate(null); setRun(null); setMsg(null); };

  const doEstimate = async () => {
    if (!selected.length) { setMsg('Select at least one keyword.'); return; }
    setBusy(true); setMsg(null);
    try { setEstimate(await api('/radar/estimate', { method: 'POST', body: JSON.stringify(scope) })); }
    catch (e) { setMsg(e.message); }
    finally { setBusy(false); }
  };

  const doRun = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await api('/radar/refresh', { method: 'POST', body: JSON.stringify({ ...scope, confirm: true }) });
      setRun({ run_id: r.run_id, status: 'running', estimated: r.estimated_requests });
      let tries = 0;
      const poll = async () => {
        const st = await api(`/radar/runs/${r.run_id}`);
        if (st.status && st.status !== 'running' && st.status !== 'pending') { setRun(st); onCompleted?.(); return; }
        if (tries++ < 40) setTimeout(poll, 3000); else setRun({ ...st, status: 'timeout' });
      };
      setTimeout(poll, 3000);
    } catch (e) {
      setMsg(e.message.startsWith('ESTIMATE_EXCEEDS_MAX') ? `Refused: ${e.message.replace('ESTIMATE_EXCEEDS_MAX:', 'estimate ')} requests exceeds your maximum.`
        : e.message === 'BUDGET_INSUFFICIENT' ? 'Refused: not enough SerpAPI budget remaining today/this month.'
        : e.message === 'CONFIRMATION_REQUIRED' ? 'Explicit confirmation is required.' : e.message);
    } finally { setBusy(false); }
  };

  const overMax = estimate && maxReq && estimate.estimated_requests > Number(maxReq);
  const canRun = estimate && estimate.estimated_requests > 0 && !overMax && estimate.within_budget && !run;

  return (
    <Panel title="Targeted research run · quota-consuming" testId="gos-targeted"
           aside={<Pill value={disabled ? 'integration_required' : 'operational'} label={disabled ? 'SerpAPI required' : 'SerpAPI ready'} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 mb-1">Keywords ({selected.length} selected)</p>
          <div className="max-h-48 overflow-y-auto border border-white/10 p-2 space-y-1" data-testid="gos-targeted-keywords">
            {keywords.map((k) => (
              <label key={k.id} className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" checked={selected.includes(k.id)} data-testid={`gos-targeted-kw-${k.id}`}
                       onChange={() => { invalidate(); setSelected((s) => s.includes(k.id) ? s.filter((x) => x !== k.id) : [...s, k.id]); }} />
                <span className="break-words">{k.term} <span className="text-white/40 text-[11px]">· {k.category}</span></span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-3 min-w-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 mb-1">Market</p>
            <div className="flex flex-wrap gap-2">
              {MARKET_OPTS.map(([v, label]) => (
                <button key={v} onClick={() => { invalidate(); setMarket(v); }} data-testid={`gos-targeted-market-${v}`}
                        className={`text-[11px] uppercase tracking-[0.18em] px-2.5 py-1.5 border ${market === v ? 'border-phileon-gold text-phileon-gold' : 'border-white/10 text-white/60'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-[11px] text-white/60">Maximum SerpAPI requests for this run
            <input type="number" min="1" max="100" value={maxReq} data-testid="gos-targeted-max"
                   onChange={(e) => { invalidate(); setMaxReq(e.target.value); }}
                   className="mt-1 w-28 block bg-black/40 border border-white/10 p-1.5 text-sm" />
          </label>
          <div className="flex flex-wrap gap-2">
            <Btn onClick={doEstimate} disabled={busy || disabled || !selected.length} testId="gos-targeted-estimate">Estimate (no API calls)</Btn>
          </div>
        </div>
      </div>

      {msg && <p className="text-xs text-rose-300 mt-3 break-words" data-testid="gos-targeted-msg">{msg}</p>}

      {estimate && (
        <div className="mt-4 border border-phileon-gold/40 p-3 text-sm space-y-1" data-testid="gos-targeted-summary">
          <p className="text-[10px] uppercase tracking-[0.26em] text-phileon-gold">Before you confirm</p>
          {estimate.breakdown.map((b) => (
            <p key={b.market} className="break-words" data-testid={`gos-targeted-summary-${b.market}`}>
              <span className="text-white/60">{b.market === 'CA' ? 'Canada' : 'United States'}:</span>{' '}
              {b.keywords.map((k) => `“${k.term}”`).join(', ') || '—'}{' '}
              <span className="text-white/50">· {b.timeseries_calls} interest + {b.related_calls} related-queries call(s)
                {b.cached_timeseries || b.cached_related ? ` · ${b.cached_timeseries + b.cached_related} served from cache` : ''}</span>
            </p>
          ))}
          <p className="font-serif text-lg" data-testid="gos-targeted-estimate-count">
            Estimated SerpAPI requests: {estimate.estimated_requests}
            <span className="text-sm text-white/50"> · max {maxReq || '∞'} · budget left today {estimate.usage.daily_remaining}, this month {estimate.usage.monthly_remaining}</span>
          </p>
          {overMax && <p className="text-xs text-rose-300" data-testid="gos-targeted-overmax">Estimate exceeds your maximum — the run will be refused.</p>}
          {!estimate.within_budget && <p className="text-xs text-rose-300">Not enough budget remaining.</p>}
          {estimate.estimated_requests === 0 && <p className="text-xs text-amber-300">Everything is cached — nothing to research right now.</p>}
          <p className="text-[11px] text-white/45">Google Trends measures public search interest — it is not customer enquiries or confirmed buyers.</p>
          <div className="pt-1">
            <Btn tone="gold" onClick={doRun} disabled={busy || !canRun} testId="gos-targeted-confirm">
              Confirm &amp; run · consume up to {estimate.estimated_requests} request{estimate.estimated_requests === 1 ? '' : 's'}
            </Btn>
          </div>
        </div>
      )}

      {run && (
        <div className="mt-4 border border-white/10 p-3 text-sm" data-testid="gos-targeted-result">
          <div className="flex flex-wrap items-center gap-2">
            <Pill value={run.status === 'success' ? 'operational' : run.status === 'running' ? 'configured' : run.status === 'partial' ? 'integration_required' : 'error'} label={run.status} testId="gos-targeted-run-status" />
            <span className="text-white/60 break-all">{run.run_id}</span>
          </div>
          {run.counters && (
            <p className="mt-2" data-testid="gos-targeted-actual">
              Actual SerpAPI requests consumed: <span className="font-serif text-lg text-phileon-gold">{run.counters.serp_calls}</span>
              <span className="text-white/50"> · snapshots {run.counters.snapshots} · new discoveries {run.counters.new_discoveries} · cache hits {run.counters.cache_hits}</span>
            </p>
          )}
          {run.reason && <p className="text-xs text-amber-300 mt-1">{String(run.reason).replace(/_/g, ' ')}</p>}
          {run.status === 'running' && <p className="text-xs text-white/50 mt-1">Running… this panel updates automatically.</p>}
        </div>
      )}
    </Panel>
  );
}
