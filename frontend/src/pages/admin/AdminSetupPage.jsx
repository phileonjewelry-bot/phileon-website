/* PHILEON — first-time admin setup (PREVIEW ONLY). Owner setup token + new credentials.
   Nothing here is stored client-side; the token and password are posted once over HTTPS. */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;

const REASONS = {
  production_env: 'First-time setup is disabled in production.',
  completed: 'Setup has already been completed. Please sign in.',
  account_exists: 'An administrator account already exists. Please sign in.',
  token_not_configured: 'The owner setup token has not been configured on the server.',
  window_not_opened: 'The setup window has not been opened. Ask the build agent to open a 10-minute window.',
  window_expired: 'The 10-minute setup window has expired. Ask the build agent to open a new window.',
};

const ERRORS = {
  SETUP_CLOSED: 'Setup is closed.',
  INVALID_SETUP_TOKEN: 'The owner setup token is incorrect.',
  USERNAME_INVALID: 'Username must be 3–32 characters: letters, numbers, dot, dash or underscore.',
  PASSWORD_TOO_SHORT: 'Password must be at least 12 characters.',
  PASSWORD_TOO_LONG: 'Password is too long (max 128).',
  PASSWORD_MISMATCH: 'The two passwords do not match.',
  PASSWORD_TOO_WEAK: 'Please choose a stronger password.',
  ACCOUNT_ALREADY_CREATED: 'An administrator account was just created. Please sign in.',
  MISSING_FIELDS: 'Please fill in every field.',
};

const field = 'w-full bg-phileon-near-black border border-phileon-charcoal px-4 py-3 text-phileon-ivory text-sm focus:outline-none focus:border-phileon-gold';

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [form, setForm] = useState({ setup_token: '', username: 'admin', password: '', password_confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/admin/setup/status`).then((r) => r.json()).then(setState)
      .catch(() => setState({ open: false, reason: 'unreachable' }));
  }, []);

  useEffect(() => {
    if (!state?.expires_at) return undefined;
    const tick = () => setRemaining(Math.max(0, Math.floor((new Date(state.expires_at) - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const r = await fetch(`${API}/api/admin/setup/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const body = await r.json().catch(() => ({}));
      if (r.status === 201) { setDone(true); setForm({ setup_token: '', username: '', password: '', password_confirm: '' }); return; }
      if (r.status === 429) { setError('Too many attempts. Please wait 15 minutes.'); return; }
      const d = typeof body.detail === 'string' ? body.detail : '';
      setError(ERRORS[d] || (d === 'SETUP_CLOSED' && REASONS[body.reason]) || 'Setup failed. Please try again.');
    } catch { setError('Network error. Please try again.'); }
    finally { setBusy(false); }
  };

  const closed = state && !state.open;
  const expired = remaining === 0;

  return (
    <div className="min-h-screen bg-phileon-black flex items-center justify-center px-6" data-testid="admin-setup-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl tracking-[0.2em] text-phileon-gold mb-2">PHILEON</h1>
          <p className="text-phileon-ivory-muted text-xs tracking-[0.3em] uppercase">First-time admin setup · preview</p>
        </div>

        {!state && <p className="text-center text-sm text-white/60">Checking setup status…</p>}

        {done && (
          <div className="border border-emerald-400/40 p-6 text-center" data-testid="admin-setup-success">
            <p className="text-sm text-emerald-300 uppercase tracking-[0.2em]">Administrator account created</p>
            <p className="text-xs text-white/60 mt-2">Setup is now permanently closed. Sign in with your new credentials.</p>
            <button onClick={() => navigate('/admin/login')} data-testid="admin-setup-go-login"
                    className="mt-5 border border-phileon-gold text-phileon-gold px-6 py-2 text-xs uppercase tracking-[0.2em] hover:bg-phileon-gold hover:text-black transition-colors">
              Go to sign in
            </button>
          </div>
        )}

        {!done && (closed || expired) && (
          <div className="border border-white/10 p-6 text-center" data-testid="admin-setup-closed">
            <p className="text-sm text-amber-300 uppercase tracking-[0.2em]">Setup closed</p>
            <p className="text-xs text-white/60 mt-2" data-testid="admin-setup-closed-reason">
              {expired ? REASONS.window_expired : (REASONS[state.reason] || 'Setup is unavailable.')}
            </p>
            <button onClick={() => navigate('/admin/login')} data-testid="admin-setup-closed-login"
                    className="mt-5 text-xs text-phileon-ivory-muted hover:text-phileon-gold uppercase tracking-[0.2em]">
              Go to sign in →
            </button>
          </div>
        )}

        {!done && state?.open && !expired && (
          <form onSubmit={submit} className="space-y-5" data-testid="admin-setup-form" autoComplete="off">
            <p className="text-center text-[11px] text-white/50" data-testid="admin-setup-countdown">
              Window closes in {Math.floor((remaining ?? 0) / 60)}:{String((remaining ?? 0) % 60).padStart(2, '0')}
            </p>
            <label className="block">
              <span className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">OWNER SETUP TOKEN</span>
              <input type="password" value={form.setup_token} onChange={(e) => setForm({ ...form, setup_token: e.target.value })}
                     className={field} data-testid="admin-setup-token" autoComplete="off" required />
              <span className="block text-[11px] text-white/40 mt-1">From ADMIN_SETUP_TOKEN in the backend environment (never shared in chat).</span>
            </label>
            <label className="block">
              <span className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">USERNAME</span>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                     className={field} data-testid="admin-setup-username" autoComplete="username" required />
            </label>
            <label className="block">
              <span className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">NEW PASSWORD (MIN 12 CHARACTERS)</span>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                     className={field} data-testid="admin-setup-password" autoComplete="new-password" required minLength={12} />
            </label>
            <label className="block">
              <span className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">CONFIRM PASSWORD</span>
              <input type="password" value={form.password_confirm} onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                     className={field} data-testid="admin-setup-confirm" autoComplete="new-password" required minLength={12} />
            </label>
            {error && <p className="text-rose-300 text-sm text-center" data-testid="admin-setup-error">{error}</p>}
            <button type="submit" disabled={busy} data-testid="admin-setup-submit"
                    className="w-full border border-phileon-gold text-phileon-gold py-3 text-xs uppercase tracking-[0.25em] hover:bg-phileon-gold hover:text-black transition-colors disabled:opacity-40">
              {busy ? 'Creating…' : 'Create administrator account'}
            </button>
            <p className="text-[11px] text-white/40 text-center">Only a bcrypt hash of your password is stored. This page locks itself after the first successful setup.</p>
          </form>
        )}
      </div>
    </div>
  );
}
