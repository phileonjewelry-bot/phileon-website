import { useEffect, useMemo, useState } from 'react';

// PHILEON — Concierge Analytics section (Phase 1). Renders above the
// Concierge inbox on /admin/concierge. Data comes from
// GET /api/admin/concierge/analytics — aggregate only, no PII.
const API = process.env.REACT_APP_BACKEND_URL;
const PERIODS = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: 'all', label: 'ALL' },
];

const KIND_LABEL = {
  product: 'Product',
  journal: 'Journal',
  bespoke: 'Bespoke',
  other: 'Other',
};

function pct(n) {
  return `${Math.round((n || 0) * 1000) / 10}%`;
}

export default function ConciergeAnalytics() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => {
    const token = localStorage.getItem('phileon_admin_token');
    return { Authorization: `Bearer ${token || ''}` };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setData(null);
    fetch(`${API}/api/admin/concierge/analytics?period=${period}`, { headers })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) throw new Error('Unauthorized — please log in as admin.');
        if (!r.ok) throw new Error(`Load failed (${r.status})`);
        return r.json();
      })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, headers]);

  const total = data?.totals?.inquiries ?? 0;
  const opens = data?.totals?.concierge_opens;
  const conv = data?.totals?.conversion_rate;

  return (
    <section
      className="mb-10 border border-white/10 p-6"
      data-testid="admin-concierge-analytics"
      aria-label="Concierge source performance"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-phileon-gold">PHILEON · Concierge Analytics</p>
          <h2 className="text-xl font-serif tracking-wide mt-1">Source performance</h2>
        </div>
        <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              role="radio"
              aria-checked={period === p.key}
              onClick={() => setPeriod(p.key)}
              className={`text-[11px] uppercase tracking-[0.22em] px-3 py-2 border ${period === p.key ? 'border-phileon-gold text-phileon-gold' : 'border-white/10 text-white/60'}`}
              data-testid={`analytics-period-${p.key}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-rose-300 text-sm" data-testid="analytics-error">{error}</p>}
      {loading && <p className="text-white/60 text-sm">Loading analytics…</p>}

      {!loading && !error && data && (
        <>
          {/* Row 1 — summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
            <Metric label={`Inquiries · ${period.toUpperCase()}`} value={String(total)} testid="analytics-total" />
            <Metric label="Concierge opens" value={opens == null ? '—' : String(opens)} testid="analytics-opens" />
            <Metric
              label="Open → inquiry"
              value={conv == null ? '—' : pct(conv)}
              hint={conv == null ? (data.totals?.conversion_note || 'Open-to-inquiry conversion unavailable for this period') : null}
              testid="analytics-conversion"
            />
          </div>

          {data.open_tracking_since && (
            <p className="text-[11px] text-white/40 mb-6" data-testid="analytics-tracking-since">
              Open tracking began {new Date(data.open_tracking_since).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}.
              Conversion reflects tracked sessions from that date forward.
            </p>
          )}

          {/* Row 2 — top 3 sources */}
          <div className="mb-6">
            <p className="text-[10px] tracking-[0.28em] uppercase text-white/60 mb-3">Top sources</p>
            {total === 0 ? (
              <p className="text-white/60 italic text-sm">No Concierge inquiries recorded in the selected period.</p>
            ) : (
              <ol className="space-y-1" data-testid="analytics-top-sources">
                {data.top_sources.map((s, i) => (
                  <li key={s.key} className="flex items-baseline justify-between border-t border-white/5 py-2">
                    <span className="text-sm">
                      <span className="text-phileon-gold tracking-[0.22em] text-xs mr-3">{String(i + 1).padStart(2, '0')}</span>
                      <span className="mr-2">{s.label}</span>
                      <span className="text-white/50 text-xs">· {KIND_LABEL[s.kind] || s.kind}</span>
                    </span>
                    <span className="text-xs text-white/70">
                      {s.opens} open{s.opens === 1 ? '' : 's'} · {s.inquiries} inquir{s.inquiries === 1 ? 'y' : 'ies'}
                      {s.conversion_rate != null ? ` · ${pct(s.conversion_rate)}` : ''}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Row 3 — breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Breakdown title="Product pages" rows={data.products} kind="product" />
            <Breakdown title="Journal" rows={data.journal} kind="journal" />
          </div>

          {(data.bespoke?.length || 0) > 0 && (
            <div className="mt-6">
              <Breakdown title="Custom Jewelry" rows={data.bespoke} kind="bespoke" />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Metric({ label, value, hint, testid }) {
  return (
    <div className="border border-white/5 p-4" data-testid={testid}>
      <p className="text-[10px] tracking-[0.28em] uppercase text-white/50">{label}</p>
      <p className="text-3xl font-serif tracking-wide mt-2">{value}</p>
      {hint && <p className="text-[11px] text-white/40 mt-2">{hint}</p>}
    </div>
  );
}

function Breakdown({ title, rows, kind }) {
  return (
    <div data-testid={`analytics-breakdown-${kind}`}>
      <p className="text-[10px] tracking-[0.28em] uppercase text-white/60 mb-2">{title}</p>
      {(!rows || rows.length === 0) ? (
        <p className="text-white/50 italic text-sm">
          {kind === 'journal' ? 'No Journal-sourced inquiries in this period.'
            : kind === 'bespoke' ? 'No Custom Jewelry inquiries in this period.'
            : 'No inquiries in this category for this period.'}
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/50 text-[10px] uppercase tracking-[0.2em]">
              <th className="text-left py-1">Source</th>
              <th className="text-right py-1">Opens</th>
              <th className="text-right py-1">Inq.</th>
              <th className="text-right py-1">Conv.</th>
              <th className="text-right py-1">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-t border-white/5">
                <td className="py-2 pr-2">{r.label}</td>
                <td className="py-2 text-right">{r.opens ?? 0}</td>
                <td className="py-2 text-right">{r.inquiries}</td>
                <td className="py-2 text-right text-white/70">{r.conversion_rate == null ? '—' : pct(r.conversion_rate)}</td>
                <td className="py-2 text-right text-white/60">{pct(r.share)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
