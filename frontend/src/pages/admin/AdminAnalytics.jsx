/* PHILEON — Admin Analytics (Layer 7).

   Owner-only baseline. Six sections:
     OVERVIEW · FUNNEL · PRODUCTS · COUNTRIES & CURRENCIES · LIFECYCLE · OPERATIONS

   Environment: server-authoritative. Admin can switch env via the
   selector but the current server env is the default.

   KPI definitions are surfaced inline via `/api/admin/analytics/kpi-definitions`.
*/
import { useCallback, useEffect, useMemo, useState } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: '7d',    label: 'Last 7 days' },
  { key: '30d',   label: 'Last 30 days' },
  { key: '90d',   label: 'Last 90 days' },
];

const SECTIONS = [
  { key: 'overview',    label: 'Overview' },
  { key: 'funnel',      label: 'Funnel' },
  { key: 'products',    label: 'Products' },
  { key: 'currencies',  label: 'Countries & Currencies' },
  { key: 'lifecycle',   label: 'Lifecycle' },
  { key: 'operations',  label: 'Operations' },
  { key: 'search',      label: 'Search' },
];

const ENVS = ['production', 'preview', 'test'];

function useAuthHeaders() {
  return useMemo(() => {
    const t = localStorage.getItem('phileon_admin_token');
    return { Authorization: `Bearer ${t || ''}` };
  }, []);
}

function fmtMoney(cents, currency = 'USD') {
  const val = (Number(cents) || 0) / 100;
  return new Intl.NumberFormat('en-US',
    { style: 'currency', currency }).format(val);
}
function fmtNum(n) { return new Intl.NumberFormat('en-US').format(Number(n) || 0); }

export default function AdminAnalytics() {
  const headers = useAuthHeaders();
  const [section, setSection] = useState('overview');
  const [period, setPeriod] = useState('30d');
  const [env, setEnv] = useState(null);
  const [serverEnv, setServerEnv] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiDefs, setKpiDefs] = useState({});

  useEffect(() => {
    fetch(`${API}/api/admin/analytics/kpi-definitions`, { headers })
      .then((r) => r.ok ? r.json() : { definitions: {}, server_env: null })
      .then((d) => {
        setKpiDefs(d.definitions || {});
        setServerEnv(d.server_env || null);
        if (!env) setEnv(d.server_env || 'production');
      })
      .catch(() => {});
  }, [headers, env]);

  const load = useCallback(async () => {
    if (!env) return;
    setLoading(true); setError(null); setData(null);
    const url = new URL(`${API}/api/admin/analytics/${section}`);
    url.searchParams.set('period', period);
    url.searchParams.set('env', env);
    try {
      const r = await fetch(url, { headers });
      if (r.status === 401 || r.status === 403) {
        throw new Error('Unauthorized — please log in as admin.');
      }
      if (!r.ok) throw new Error(`Load failed (${r.status})`);
      setData(await r.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [headers, section, period, env]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-4 lg:p-8 text-phileon-ivory" data-testid="admin-analytics">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs tracking-[0.32em] uppercase text-phileon-gold">PHILEON · Layer 7</p>
          <h1 className="font-serif text-2xl md:text-3xl tracking-wide">Analytics</h1>
          <p className="text-xs text-phileon-ivory-muted mt-1">
            Owner-only. Server-authoritative environment ·{' '}
            <span className="text-phileon-gold">{serverEnv || '—'}</span>.
            Never fabricate opens or revenue.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
                  className="bg-black/40 border border-white/10 p-2 text-sm"
                  data-testid="al-period">
            {PERIODS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select value={env || ''} onChange={(e) => setEnv(e.target.value)}
                  className="bg-black/40 border border-white/10 p-2 text-sm"
                  data-testid="al-env">
            {ENVS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <button onClick={load}
                  className="border border-white/10 text-phileon-ivory-muted px-4 py-2 tracking-[0.2em] text-xs uppercase"
                  data-testid="al-refresh">
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6" data-testid="al-tabs">
        {SECTIONS.map((s) => (
          <button key={s.key} onClick={() => setSection(s.key)}
                  className={`text-xs uppercase tracking-[0.2em] px-3 py-2 border ${
                    section === s.key
                      ? 'border-phileon-gold text-phileon-gold'
                      : 'border-white/10 text-white/60'
                  }`}
                  data-testid={`al-tab-${s.key}`}>
            {s.label}
          </button>
        ))}
      </div>

      {error && <p className="text-rose-300 text-sm mb-3" data-testid="al-error">{error}</p>}
      {loading && <p className="text-white/60 text-sm">Loading…</p>}

      {!loading && data && (
        <>
          {section === 'overview'   && <Overview data={data} kpiDefs={kpiDefs} />}
          {section === 'funnel'     && <Funnel data={data} kpiDefs={kpiDefs} />}
          {section === 'products'   && <ProductsSection data={data} />}
          {section === 'currencies' && <Currencies data={data} />}
          {section === 'lifecycle'  && <Lifecycle data={data} />}
          {section === 'operations' && <Operations data={data} />}
          {section === 'search'     && <SearchSection data={data} />}
        </>
      )}
    </div>
  );
}

function KpiCard({ title, value, hint, testId, defn }) {
  return (
    <div className="border border-white/10 p-4" data-testid={testId}>
      <p className="text-[10px] uppercase tracking-[0.28em] text-phileon-gold">{title}</p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
      {hint ? <p className="text-[11px] text-white/50 mt-1">{hint}</p> : null}
      {defn ? <p className="text-[10px] text-white/40 mt-2 italic leading-relaxed">{defn}</p> : null}
    </div>
  );
}

function Overview({ data, kpiDefs }) {
  const c = data.client_observed;
  const s = data.server_authoritative;
  const o = data.operations;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="PDP Views (client)" value={fmtNum(c.product_viewed.total)}
               hint={`${fmtNum(c.product_viewed.unique_sessions)} unique sessions`}
               testId="al-kpi-views" defn={kpiDefs.PRODUCT_VIEWED} />
      <KpiCard title="Added to Cart (client)" value={fmtNum(c.added_to_cart.total)}
               hint={`${fmtNum(c.added_to_cart.unique_sessions)} unique sessions`}
               testId="al-kpi-adds" defn={kpiDefs.ADDED_TO_CART} />
      <KpiCard title="Checkout Started (client)" value={fmtNum(c.checkout_started.total)}
               testId="al-kpi-checkout-started" defn={kpiDefs.CHECKOUT_STARTED} />
      <KpiCard title="Checkout Sessions (server)" value={fmtNum(s.checkout_session_created)}
               testId="al-kpi-sessions" defn={kpiDefs.CHECKOUT_SESSION_CREATED} />
      <KpiCard title="Paid Orders (server)" value={fmtNum(s.paid_orders)}
               testId="al-kpi-paid" defn={kpiDefs.PAID_ORDER} />
      <KpiCard title="Canonical Revenue (USD)"
               value={fmtMoney(s.canonical_revenue_cents, 'USD')}
               testId="al-kpi-revenue" defn={kpiDefs.CANONICAL_REVENUE} />
      <KpiCard title="Refunds Confirmed"
               value={`${fmtNum(s.refunds_count)} · ${fmtMoney(s.refunds_cents, 'USD')}`}
               testId="al-kpi-refunds" defn={kpiDefs.REFUND_CONFIRMED} />
      <KpiCard title="Chargeback Lost" value={fmtNum(s.chargeback_lost)}
               hint="Distinct from refunded"
               testId="al-kpi-chargeback" defn={kpiDefs.CHARGEBACK_LOST} />
      <KpiCard title="New Concierge Cases" value={fmtNum(o.new_concierge_cases)}
               testId="al-kpi-concierge" />
      <KpiCard title="New RMAs" value={fmtNum(o.new_rma)} testId="al-kpi-rma" />
    </div>
  );
}

function Funnel({ data, kpiDefs }) {
  const max = Math.max(1, ...data.steps.map((s) => Number(s.count) || 0));
  return (
    <div className="space-y-3" data-testid="al-funnel">
      {data.steps.map((s) => (
        <div key={s.stage} className="border border-white/10 p-4">
          <div className="flex justify-between items-baseline">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold">{s.stage}</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/50 mt-1">
                {s.authority === 'server' ? 'SERVER-AUTHORITATIVE' : 'CLIENT-OBSERVED'}
              </p>
            </div>
            <p className="font-serif text-2xl">{fmtNum(s.count)}</p>
          </div>
          <div className="h-1 bg-white/[0.05] mt-3">
            <div className="h-1 bg-phileon-gold"
                 style={{ width: `${Math.max(2, (Number(s.count) / max) * 100)}%` }} />
          </div>
          {s.unique_sessions != null && (
            <p className="text-[11px] text-white/50 mt-2">
              {fmtNum(s.unique_sessions)} unique sessions
            </p>
          )}
          {s.canonical_revenue_cents != null && (
            <p className="text-[11px] text-white/50 mt-1">
              {fmtMoney(s.canonical_revenue_cents, 'USD')} canonical revenue
            </p>
          )}
          {kpiDefs[s.stage] && (
            <p className="text-[10px] text-white/40 mt-2 italic">{kpiDefs[s.stage]}</p>
          )}
        </div>
      ))}
      <p className="text-[11px] text-white/50 mt-3" data-testid="al-funnel-note">
        Conversion (paid ÷ unique view sessions):{' '}
        <span className="text-phileon-gold">
          {data.conversion_rate_paid_over_view_sessions == null
            ? '—'
            : `${(data.conversion_rate_paid_over_view_sessions * 100).toFixed(2)}%`}
        </span>. Denominator = {data.denominator_note}
      </p>
    </div>
  );
}

function ProductsSection({ data }) {
  return (
    <div className="border border-white/10" data-testid="al-products">
      <div className="grid grid-cols-6 text-[10px] uppercase tracking-[0.24em] text-white/50 border-b border-white/10 p-3">
        <span className="col-span-2">Product</span>
        <span>Views</span>
        <span>Adds</span>
        <span>Paid</span>
        <span>Revenue (USD)</span>
      </div>
      {(data.products || []).map((p) => (
        <div key={p.product_slug}
             className="grid grid-cols-6 text-sm border-b border-white/[0.04] p-3"
             data-testid={`al-product-${p.product_slug}`}>
          <span className="col-span-2">
            <span className="text-phileon-gold">{p.product_slug}</span>
            {p.is_vault && (
              <span className="ml-2 text-[9px] tracking-[0.28em] text-phileon-gold border border-phileon-gold px-1">VAULT</span>
            )}
          </span>
          <span>{fmtNum(p.views)}</span>
          <span>{fmtNum(p.adds)}</span>
          <span>{fmtNum(p.paid_orders)}</span>
          <span>{fmtMoney(p.revenue_cents, 'USD')}</span>
        </div>
      ))}
      {(data.products || []).length === 0 && (
        <p className="p-4 text-white/50 italic text-sm">No product activity yet.</p>
      )}
    </div>
  );
}

function Currencies({ data }) {
  return (
    <div className="grid md:grid-cols-2 gap-6" data-testid="al-currencies">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-3">Shipping countries (paid)</p>
        <ul className="space-y-1 text-sm">
          {(data.countries || []).map((c) => (
            <li key={c.country || 'unknown'} className="flex justify-between border-b border-white/[0.04] py-1">
              <span>{c.country || '—'}</span>
              <span>{fmtNum(c.paid_orders)} · {fmtMoney(c.canonical_revenue_cents, 'USD')}</span>
            </li>
          ))}
          {(data.countries || []).length === 0 && (
            <li className="italic text-white/50">No paid orders yet.</li>
          )}
        </ul>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-3">
          Presentment currency (Stripe authoritative)
        </p>
        <ul className="space-y-1 text-sm">
          {(data.presentment || []).map((p) => (
            <li key={p.presentment_currency || 'USD'}
                className="flex justify-between border-b border-white/[0.04] py-1">
              <span>{p.presentment_currency || 'USD'}</span>
              <span>{fmtNum(p.paid_orders)} · {fmtMoney(p.presentment_total_cents, p.presentment_currency || 'USD')}</span>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-white/40 mt-3 italic leading-relaxed">
          {data.note}
        </p>
      </div>
    </div>
  );
}

function Lifecycle({ data }) {
  const modeColor = data.behavioral_mode === 'LIVE' ? '#8db38a' : '#c8a24a';
  return (
    <div className="space-y-4" data-testid="al-lifecycle">
      <p className="text-xs uppercase tracking-[0.24em] mb-1">Behavioral mode: <span style={{color: modeColor}}>{data.behavioral_mode}</span></p>
      <div className="grid md:grid-cols-4 gap-3">
        {Object.entries(data.period_pending_eligibility).map(([k, v]) => (
          <KpiCard key={k} title={k} value={fmtNum(v)}
                   testId={`al-lifecycle-eligible-${k}`} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-2">Sends — Simulated</p>
          <ul className="space-y-1 text-sm">
            {Object.entries(data.period_sends.simulated || {}).map(([k, v]) => (
              <li key={k} className="flex justify-between border-b border-white/[0.04] py-1">
                <span>{k}</span><span>{fmtNum(v)}</span>
              </li>
            ))}
            {Object.keys(data.period_sends.simulated || {}).length === 0 && (
              <li className="italic text-white/50">No simulated sends in period.</li>
            )}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-2">Sends — Live</p>
          <ul className="space-y-1 text-sm">
            {Object.entries(data.period_sends.live || {}).map(([k, v]) => (
              <li key={k} className="flex justify-between border-b border-white/[0.04] py-1">
                <span>{k}</span><span>{fmtNum(v)}</span>
              </li>
            ))}
            {Object.keys(data.period_sends.live || {}).length === 0 && (
              <li className="italic text-white/50">No live sends. PHILEON_BEHAVIORAL_LIVE=false.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <KpiCard title="Consent rows" value={fmtNum(data.consent.marketing_consent_rows)}
                 testId="al-consent-rows" />
        <KpiCard title="Currently consented" value={fmtNum(data.consent.marketing_consented_active)}
                 testId="al-consent-active" />
        <KpiCard title="Suppressed" value={fmtNum(data.consent.email_suppression_rows)}
                 testId="al-suppression" />
      </div>
      <p className="text-[10px] text-white/40 italic leading-relaxed">{data.note}</p>
    </div>
  );
}

function Operations({ data }) {
  return (
    <div className="space-y-6" data-testid="al-operations">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-2">Returns / RMA (Layer 3)</p>
        <div className="grid md:grid-cols-5 gap-3">
          <KpiCard title="New" value={fmtNum(data.returns.new)} testId="al-rma-new" />
          <KpiCard title="Approved" value={fmtNum(data.returns.approved)} testId="al-rma-approved" />
          <KpiCard title="Denied" value={fmtNum(data.returns.denied)} testId="al-rma-denied" />
          <KpiCard title="Refund Approved" value={fmtNum(data.returns.refund_approved)} testId="al-rma-refund-approved" />
          <KpiCard title="Refund Confirmed" value={fmtNum(data.returns.refund_confirmed)} testId="al-rma-refund-confirmed" />
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-2">Disputes (Layer 4)</p>
        <div className="grid md:grid-cols-4 gap-3">
          <KpiCard title="New" value={fmtNum(data.disputes.new)} testId="al-disp-new" />
          <KpiCard title="Needs Response" value={fmtNum(data.disputes.needs_response)} testId="al-disp-nr" />
          <KpiCard title="Won" value={fmtNum(data.disputes.won)} testId="al-disp-won" />
          <KpiCard title="Chargeback Lost" value={fmtNum(data.disputes.chargeback_lost)}
                   hint="Distinct from refunded" testId="al-disp-cb" />
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-2">Fulfillment (Layer 2)</p>
        <ul className="space-y-1 text-sm">
          {Object.entries(data.fulfillment || {}).map(([k, v]) => (
            <li key={k} className="flex justify-between border-b border-white/[0.04] py-1">
              <span className="uppercase tracking-[0.16em]">{(k || '').replace(/_/g, ' ')}</span>
              <span>{fmtNum(v)}</span>
            </li>
          ))}
          {Object.keys(data.fulfillment || {}).length === 0 && (
            <li className="italic text-white/50">No orders in the period.</li>
          )}
        </ul>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-2">Concierge (Layer 6)</p>
        <div className="grid md:grid-cols-4 gap-3">
          <KpiCard title="New" value={fmtNum(data.concierge.new)} testId="al-con-new" />
          <KpiCard title="Resolved" value={fmtNum(data.concierge.resolved)} testId="al-con-resolved" />
          <KpiCard title="Waiting on PHILEON" value={fmtNum(data.concierge.waiting_on_phileon)} testId="al-con-waiting" />
          <KpiCard title="Overdue follow-ups" value={fmtNum(data.concierge.overdue_follow_ups)} testId="al-con-overdue" />
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-2">Inventory (Layer 5)</p>
        <div className="grid md:grid-cols-2 gap-3">
          <KpiCard title="Vault sold-out rows" value={fmtNum(data.inventory.vault_sold_out)} testId="al-inv-sold-out" />
          <div className="border border-white/10 p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-phileon-gold">By availability mode</p>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.entries(data.inventory.by_availability_mode || {}).map(([mode, v]) => (
                <li key={mode} className="flex justify-between">
                  <span>{(mode || '—').replace(/_/g, ' ')}</span>
                  <span>{fmtNum(v.rows)} rows · {fmtNum(v.on_hand)} on-hand · {fmtNum(v.reserved)} reserved</span>
                </li>
              ))}
              {Object.keys(data.inventory.by_availability_mode || {}).length === 0 && (
                <li className="italic text-white/50">No inventory rows.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-white/40 italic leading-relaxed">{data.note}</p>
    </div>
  );
}

function SearchSection({ data }) {
  return (
    <div className="grid md:grid-cols-2 gap-6" data-testid="al-search">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-2">
          Top searches ({fmtNum(data.total_searches)} total)
        </p>
        <ul className="space-y-1 text-sm">
          {(data.top_searches || []).map((s, i) => (
            <li key={i} className="flex justify-between border-b border-white/[0.04] py-1">
              <span>{s.query}</span>
              <span>{fmtNum(s.count)} · avg {s.avg_results} results</span>
            </li>
          ))}
          {(data.top_searches || []).length === 0 && (
            <li className="italic text-white/50">No searches in period.</li>
          )}
        </ul>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-phileon-gold mb-2">Zero-result searches</p>
        <ul className="space-y-1 text-sm">
          {(data.zero_result_searches || []).map((s, i) => (
            <li key={i} className="flex justify-between border-b border-white/[0.04] py-1">
              <span>{s.query}</span><span>{fmtNum(s.count)}</span>
            </li>
          ))}
          {(data.zero_result_searches || []).length === 0 && (
            <li className="italic text-white/50">No zero-result searches.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
