/* PHILEON Growth OS — shared admin UI primitives. */
import { useCallback, useMemo, useState } from 'react';

export const API = process.env.REACT_APP_BACKEND_URL;

export function useGrowthApi() {
  const headers = useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('phileon_admin_token') || ''}`,
    'Content-Type': 'application/json',
  }), []);
  return useCallback(async (path, opts = {}) => {
    const r = await fetch(`${API}/api/admin/growth-os${path}`, { ...opts, headers });
    if (r.status === 401 || r.status === 403) throw new Error('Unauthorized — please log in as admin.');
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const d = body.detail;
      throw new Error(typeof d === 'string' ? d : `Request failed (${r.status})`);
    }
    return body;
  }, [headers]);
}

export function useAsync(fn, deps) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try { setState({ loading: false, data: await fn(), error: null }); }
    catch (e) { setState({ loading: false, data: null, error: e.message }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return [state, run];
}

const PILL = {
  operational: 'border-emerald-400/50 text-emerald-300',
  enabled: 'border-emerald-400/50 text-emerald-300',
  configured: 'border-sky-400/50 text-sky-300',
  integration_required: 'border-amber-400/60 text-amber-300',
  disabled: 'border-white/15 text-white/50',
  inactive: 'border-white/15 text-white/50',
  error: 'border-rose-400/60 text-rose-300',
  HIGH: 'border-phileon-gold text-phileon-gold',
  MEDIUM: 'border-sky-400/50 text-sky-300',
  LOW: 'border-white/15 text-white/50',
};

export function Pill({ value, label, testId }) {
  const key = String(value || '').toLowerCase();
  const cls = PILL[value] || PILL[key] || 'border-white/15 text-white/60';
  return (
    <span className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] ${cls}`}
          data-testid={testId}>
      {label || String(value || '—').replace(/_/g, ' ')}
    </span>
  );
}

export function Panel({ title, children, testId, aside }) {
  return (
    <section className="border border-white/10 p-3 sm:p-4 md:p-5 min-w-0" data-testid={testId}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <p className="text-[10px] uppercase tracking-[0.28em] text-phileon-gold">{title}</p>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Btn({ children, onClick, disabled, testId, tone = 'ghost', type = 'button' }) {
  const tones = {
    ghost: 'border-white/15 text-phileon-ivory-muted hover:border-phileon-gold hover:text-phileon-gold',
    gold: 'border-phileon-gold text-phileon-gold hover:bg-phileon-gold hover:text-black',
    danger: 'border-rose-400/40 text-rose-300 hover:border-rose-300',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} data-testid={testId}
            className={`border px-2.5 sm:px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${tones[tone]}`}>
      {children}
    </button>
  );
}

export function Empty({ title, body, testId }) {
  return (
    <div className="border border-dashed border-amber-400/40 p-5 text-center" data-testid={testId}>
      <p className="text-xs uppercase tracking-[0.26em] text-amber-300">{title}</p>
      {body ? <p className="text-xs text-white/55 mt-2 leading-relaxed max-w-xl mx-auto">{body}</p> : null}
    </div>
  );
}

export function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-CA', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Toronto',
    }).format(new Date(iso)) + ' (Toronto)';
  } catch { return iso; }
}
