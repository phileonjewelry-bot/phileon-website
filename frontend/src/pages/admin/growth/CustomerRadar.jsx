/* Growth OS — Customer Radar tab (SerpAPI Google Trends · CA / US · keyword manager). */
import { useEffect, useState } from 'react';
import { Panel, Pill, Empty, Btn, fmtDate, useAsync, useGrowthApi } from './shared';
import TargetedRun from './TargetedRun';

const MARKETS = ['CA', 'US'];

function KeywordRow({ kw, onToggle, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ term: kw.term, category: kw.category, ca: kw.market_terms?.CA || kw.term,
                                     us: kw.market_terms?.US || kw.term, markets: kw.markets || MARKETS });
  const toggleMarket = (m) => setForm((f) => ({
    ...f, markets: f.markets.includes(m) ? f.markets.filter((x) => x !== m) : [...f.markets, m] }));

  if (editing) {
    return (
      <li className="py-3 border-b border-white/[0.06] space-y-2" data-testid={`gos-kw-edit-${kw.id}`}>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} placeholder="Keyword"
                 className="bg-black/40 border border-white/10 p-1.5 text-sm" data-testid="gos-kw-edit-term" />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category"
                 className="bg-black/40 border border-white/10 p-1.5 text-sm" data-testid="gos-kw-edit-category" />
          <input value={form.ca} onChange={(e) => setForm({ ...form, ca: e.target.value })} placeholder="CA query term"
                 className="bg-black/40 border border-white/10 p-1.5 text-sm" data-testid="gos-kw-edit-ca" />
          <input value={form.us} onChange={(e) => setForm({ ...form, us: e.target.value })} placeholder="US query term"
                 className="bg-black/40 border border-white/10 p-1.5 text-sm" data-testid="gos-kw-edit-us" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {MARKETS.map((m) => (
            <label key={m} className="text-[11px] text-white/60 flex items-center gap-1">
              <input type="checkbox" checked={form.markets.includes(m)} onChange={() => toggleMarket(m)} /> {m}
            </label>
          ))}
          <Btn tone="gold" testId="gos-kw-edit-save" onClick={async () => {
            await onSave(kw.id, { term: form.term, category: form.category, markets: form.markets,
                                  market_terms: { CA: form.ca, US: form.us } });
            setEditing(false);
          }}>Save</Btn>
          <Btn testId="gos-kw-edit-cancel" onClick={() => setEditing(false)}>Cancel</Btn>
        </div>
      </li>
    );
  }
  return (
    <li className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 border-b border-white/[0.06] min-w-0 ${kw.enabled ? '' : 'opacity-50'}`}
        data-testid={`gos-kw-${kw.id}`}>
      <div className="min-w-0">
        <p className="text-sm break-words">{kw.term}</p>
        <p className="text-[11px] text-white/45 break-words">
          CA “{kw.market_terms?.CA}” · US “{kw.market_terms?.US}” · {(kw.markets || []).join(', ')}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Pill value={kw.enabled ? 'enabled' : 'disabled'} testId={`gos-kw-status-${kw.id}`} />
        <Btn testId={`gos-kw-toggle-${kw.id}`} onClick={() => onToggle(kw.id)}>{kw.enabled ? 'Disable' : 'Enable'}</Btn>
        <Btn testId={`gos-kw-editbtn-${kw.id}`} onClick={() => setEditing(true)}>Edit</Btn>
        <Btn tone="danger" testId={`gos-kw-delete-${kw.id}`} onClick={() => onDelete(kw.id)}>Remove</Btn>
      </div>
    </li>
  );
}

function KeywordManager() {
  const api = useGrowthApi();
  const [state, load] = useAsync(() => api('/keywords'), [api]);
  const [draft, setDraft] = useState({ term: '', category: '' });
  const [err, setErr] = useState(null);
  useEffect(() => { load(); }, [load]);

  const act = async (fn) => { setErr(null); try { await fn(); await load(); } catch (e) { setErr(e.message); } };
  const kws = state.data?.keywords || [];
  const cats = state.data?.categories || [];

  return (
    <Panel title={`Research keywords · ${kws.filter((k) => k.enabled).length} enabled of ${kws.length}`} testId="gos-keywords">
      <form className="flex flex-col sm:flex-row gap-2 mb-3" onSubmit={(e) => {
        e.preventDefault();
        if (!draft.term.trim() || !draft.category.trim()) return;
        act(async () => { await api('/keywords', { method: 'POST', body: JSON.stringify(draft) }); setDraft({ term: '', category: '' }); });
      }}>
        <input value={draft.term} onChange={(e) => setDraft({ ...draft, term: e.target.value })} placeholder="New keyword (e.g. Custom gold signet)"
               className="flex-1 bg-black/40 border border-white/10 p-2 text-sm" data-testid="gos-kw-new-term" />
        <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Category" list="gos-cats"
               className="sm:w-60 bg-black/40 border border-white/10 p-2 text-sm" data-testid="gos-kw-new-category" />
        <datalist id="gos-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
        <Btn tone="gold" type="submit" testId="gos-kw-add">Add</Btn>
      </form>
      {err && <p className="text-rose-300 text-xs mb-2" data-testid="gos-kw-error">{err}</p>}
      {state.loading && <p className="text-white/50 text-sm">Loading…</p>}
      {cats.map((cat) => (
        <div key={cat} className="mb-4" data-testid={`gos-kw-cat-${cat.replace(/\W+/g, '-').toLowerCase()}`}>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/60 mb-1">{cat}</p>
          <ul>
            {kws.filter((k) => k.category === cat).map((kw) => (
              <KeywordRow key={kw.id} kw={kw}
                onToggle={(id) => act(() => api(`/keywords/${id}/toggle`, { method: 'POST' }))}
                onDelete={(id) => act(() => api(`/keywords/${id}`, { method: 'DELETE' }))}
                onSave={(id, patch) => act(() => api(`/keywords/${id}`, { method: 'PUT', body: JSON.stringify(patch) }))} />
            ))}
          </ul>
        </div>
      ))}
      <p className="text-[11px] text-white/40">US queries use “jewelry” spelling automatically; Canadian queries keep “jewellery”. Edit either term per keyword.</p>
    </Panel>
  );
}

export default function CustomerRadar() {
  const api = useGrowthApi();
  const [market, setMarket] = useState('ALL');
  const [state, load] = useAsync(() => api(`/radar${market !== 'ALL' ? `?market=${market}` : ''}`), [api, market]);
  useEffect(() => { load(); }, [load]);
  const d = state.data || {};

  return (
    <div className="space-y-5 min-w-0" data-testid="gos-radar">
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', ...MARKETS].map((m) => (
          <button key={m} onClick={() => setMarket(m)} data-testid={`gos-radar-market-${m}`}
                  className={`text-xs uppercase tracking-[0.2em] px-3 py-1.5 border ${market === m ? 'border-phileon-gold text-phileon-gold' : 'border-white/10 text-white/60'}`}>
            {m === 'ALL' ? 'All markets' : m === 'CA' ? 'Canada' : 'United States'}
          </button>
        ))}
        <Pill value={d.serpapi?.status} testId="gos-radar-serp-status" />
      </div>
      {state.error && <p className="text-rose-300 text-sm" data-testid="gos-radar-error">{state.error}</p>}

      {d.integration_required && (
        <Empty title="Integration Required · SerpAPI" testId="gos-radar-integration-required"
               body="Google Trends research is architected and ready. Configure SERPAPI_API_KEY in the backend environment to activate. The keywords below will be researched for Canada and the US separately, within the query budget." />
      )}

      <TargetedRun disabled={!!d.integration_required} onCompleted={load} />

      {!d.integration_required && (
        <>
          <Panel title="Interest over time · latest snapshot per keyword" testId="gos-radar-snapshots">
            {(d.snapshots || []).length === 0
              ? <p className="text-sm text-white/50">No snapshots yet. Run research or wait for the daily refresh.</p>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                      <tr><th className="text-left py-1">Keyword</th><th>Market</th><th>Avg</th><th>Latest</th><th>4-wk Δ</th><th className="text-right">Fetched</th></tr>
                    </thead>
                    <tbody>
                      {d.snapshots.map((s) => (
                        <tr key={s.id} className="border-t border-white/[0.06]" data-testid={`gos-snap-${s.id}`}>
                          <td className="py-1.5">{s.query_term}<span className="text-white/40 text-[11px]"> · {s.category}</span></td>
                          <td className="text-center">{s.market}</td><td className="text-center">{s.avg_interest}</td>
                          <td className="text-center">{s.latest_value}</td>
                          <td className={`text-center ${s.trend_delta_pct > 0 ? 'text-emerald-300' : s.trend_delta_pct < 0 ? 'text-rose-300' : ''}`}>{s.trend_delta_pct > 0 ? '+' : ''}{s.trend_delta_pct}%</td>
                          <td className="text-right text-[11px] text-white/50">{fmtDate(s.fetched_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </Panel>
          <Panel title="Rising queries · discoveries" testId="gos-radar-discoveries">
            {(d.discoveries || []).length === 0
              ? <p className="text-sm text-white/50">No discoveries recorded yet.</p>
              : (
                <ul>
                  {d.discoveries.map((x) => (
                    <li key={x.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-white/[0.06] min-w-0" data-testid={`gos-disc-${x.id}`}>
                      <div className="min-w-0">
                        <p className="text-sm break-words">“{x.query}” <span className="text-white/40 text-[11px]">· {x.market} · {x.value} · from “{x.source_keyword}”</span></p>
                        <p className="text-[11px] text-white/45">seen {x.seen_count}× · first {fmtDate(x.first_seen)} · priority by {x.priority_engine}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill value={x.priority} /><Pill value={x.status} />
                        <select value={x.status} data-testid={`gos-disc-status-${x.id}`}
                                onChange={(e) => api(`/discoveries/${x.id}/status`, { method: 'POST', body: JSON.stringify({ status: e.target.value }) }).then(load)}
                                className="bg-black/40 border border-white/10 p-1 text-xs">
                          {['new', 'watching', 'actioned', 'dismissed'].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </Panel>
        </>
      )}

      <KeywordManager />
    </div>
  );
}
