# PHILEON — ENVIRONMENT REGISTRY

**Purpose:** Non-secret registry of every environment variable + owner-controlled account
provider used by PHILEON. Values live in the owner's password manager and in
`backend/.env` / `frontend/.env`. **This document holds names, purposes, and posture —
never actual secrets.**

**Companion docs:** `OPERATIONS.md` · `RECOVERY_RUNBOOK.md` · `LAUNCH_DAY_CHECKLIST.md`

---

## PART 1 — Environment variable registry

Legend:
- **Component** — where the variable is read.
- **Secret?** — whether the value must NEVER appear in a code file, log, or JSON
  response.
- **Owner-controlled?** — whether the owner (not engineering) originates the value.
- **Required before LIVE launch?** — Gate for Layer 2+ launch gates.
- **Rotation sensitivity** — impact of rotating this value on live customers.

### 1.1 Stripe

| Variable | Component | Secret? | Owner? | Required before LIVE? | Rotation sensitivity | Current non-secret state |
|---|---|---|---|---|---|---|
| `STRIPE_MODE` | backend | no | no | yes (must be `live`) | Restart backend; new Sessions immediately follow. | **`test`** |
| `STRIPE_SECRET_KEY` | backend | **YES** | yes | **YES** (LIVE `sk_live_…`) | Restart backend. Existing Sessions are unaffected (Stripe already accepted them). | TEST prefix `sk_test_…` present |
| `STRIPE_WEBHOOK_SECRET` | backend | **YES** | yes | **YES** (LIVE `whsec_…`) | Restart backend. Fire a test event immediately after to confirm. | TEST prefix `whsec_…` present |
| `STRIPE_PUBLISHABLE_KEY` | backend (unused directly today) | no (public by design) | yes | Only if Elements / PaymentSheet is added | — | not currently required by backend |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | frontend | no (public by design) | yes | required for on-site BNPL messaging + Elements when introduced | Rebuild frontend. | TEST `pk_test_…` present |

### 1.2 Checkout URLs

| Variable | Component | Secret? | Owner? | Required before LIVE? | Rotation sensitivity | Current non-secret state |
|---|---|---|---|---|---|---|
| `CHECKOUT_SUCCESS_URL` | backend | no | yes | **YES** (must be prod HTTPS) | Restart backend. New Sessions redirect to the new URL. | preview-URL fallback (must swap to prod) |
| `CHECKOUT_CANCEL_URL` | backend | no | yes | **YES** (must be prod HTTPS) | Restart backend. | preview-URL fallback (must swap to prod) |
| `REACT_APP_BACKEND_URL` | frontend | no | yes | **YES** (must be prod HTTPS) | Rebuild frontend. Preview + prod use distinct values. | preview URL |
| `FRONTEND_URL` | backend (optional fallback for order-status link builder) | no | yes | recommended | Restart backend. | not set (falls back cleanly) |

### 1.3 Email — Resend

| Variable | Component | Secret? | Owner? | Required before LIVE? | Rotation sensitivity | Current non-secret state |
|---|---|---|---|---|---|---|
| `RESEND_API_KEY` | backend | **YES** | yes | **YES** | Restart backend. Immediately send one TEST email to confirm. | present (Resend test/sandbox capability) |
| `PHILEON_FROM_EMAIL` | backend | no | yes | **YES** (verified PHILEON-owned domain with SPF + DKIM) | Restart backend. Deliverability depends on DNS. | `concierge@getyourphileon.com` |
| `PHILEON_CONCIERGE_NOTIFICATION_EMAIL` | backend | no | yes | yes (owner-controlled internal recipient) | Restart backend. | `phileon.jewelry@gmail.com` |
| `PHILEON_ORDER_NOTIFICATION_EMAIL` | backend (optional; falls back to concierge) | no | yes | optional | Restart backend. | not set (falls through) |
| `PHILEON_BEHAVIORAL_FROM_EMAIL` | backend | no | yes | required only when `PHILEON_BEHAVIORAL_LIVE=true` (dedicated subdomain sender) | Restart backend. LIVE-refused if unset. | not set (behavioral is SIMULATION) |

### 1.4 Order status link builder

| Variable | Component | Secret? | Owner? | Required before LIVE? | Rotation sensitivity | Current non-secret state |
|---|---|---|---|---|---|---|
| `PHILEON_ORDER_STATUS_URL_BASE` | backend | no | yes | **YES** (must be `https://www.getyourphileon.com` before first LIVE email) | Restart backend. Only new outbound emails are affected; already-sent links keep pointing at the base that was live when the email was sent. | **preview URL** (pre-launch config gate) |

### 1.5 Behavioral retention engine

All optional — safe defaults are built into the code.

| Variable | Component | Secret? | Owner? | Required before LIVE? | Rotation sensitivity | Current non-secret state |
|---|---|---|---|---|---|---|
| `PHILEON_BEHAVIORAL_LIVE` | backend | no | yes | Must remain `false` until owner separately approves | Restart backend. LIVE flip requires `PHILEON_BEHAVIORAL_FROM_EMAIL` to also be set, else falls back to SIMULATION. | **`false`** (default) |
| `PHILEON_BEHAVIORAL_DAILY_CAP` | backend | no | no | no | Restart backend. | default `1` (per-customer / 24 h) |
| `PHILEON_BEHAVIORAL_WEEKLY_CAP` | backend | no | no | no | Restart backend. | default `2` (per-customer / 7 d, marketing lane only) |
| `PHILEON_BEHAVIORAL_GLOBAL_LAUNCH_CAP` | backend | no | yes | recommended for the first 30 days LIVE | Restart backend. Simulated sends never count against this cap. | default `10` real LIVE sends / rolling 24 h |
| `PHILEON_BEHAVIORAL_ANON_TTL_DAYS` | backend | no | no | no | Restart backend. Applies only to newly-inserted anonymous events; existing TTL rows keep their previous expiry. | default `30` |
| `PHILEON_RETENTION_CRON_SECRET` | backend | **YES** | yes | **YES** (must be a strong random string before any external scheduler is armed) | Restart backend + update external scheduler in the same window. Constant-time compare. | TEST value present in `.env` (must rotate before LIVE cron) |
| `PHILEON_RETENTION_BROWSE_MIN` | backend | no | no | no | Restart backend. | default `360` minutes (6 h) |
| `PHILEON_RETENTION_BROWSE_COOLDOWN_H` | backend | no | no | no | Restart backend. | default `72` hours |
| `PHILEON_RETENTION_WISHLIST_MIN` | backend | no | no | no | Restart backend. | default `1440` minutes (24 h) |
| `PHILEON_RETENTION_CART_MIN` | backend | no | no | no | Restart backend. | default `180` minutes (3 h) |
| `PHILEON_RETENTION_CHECKOUT_MIN` | backend | no | no | no | Restart backend. | default `90` minutes |
| `PHILEON_RETENTION_CARE_DAYS` | backend | no | no | no | Restart backend. | default `7` days |
| `PHILEON_TEST_CUSTOMER_EMAIL` | backend (internal test/dev only) | no | no | no | — | present (test-only address) |

### 1.6 Auth

| Variable | Component | Secret? | Owner? | Required before LIVE? | Rotation sensitivity | Current non-secret state |
|---|---|---|---|---|---|---|
| `JWT_SECRET` | backend | **YES** | yes | **YES** (must be a strong random string) | Restart backend. **Invalidates admin sessions AND every outstanding unsubscribe token.** | present |
| `CUSTOMER_JWT_SECRET` | backend | **YES** | yes | **YES** (must be a strong random string) | Restart backend. Invalidates customer session tokens. | present |
| `ADMIN_USERNAME` | backend | no (but treat as sensitive) | yes | yes | Restart backend. Seed script re-hydrates the admin row. | `admin` (owner may customize) |
| `ADMIN_PASSWORD_HASH` | backend | **YES** (hashed, but treat as sensitive) | yes | **YES** (rotate to owner-chosen password hash) | Restart backend. Existing admin JWTs remain valid until expiry. | bcrypt hash present |

### 1.7 Mongo / database

| Variable | Component | Secret? | Owner? | Required before LIVE? | Rotation sensitivity | Current non-secret state |
|---|---|---|---|---|---|---|
| `MONGO_URL` | backend | **YES** (contains cluster credentials) | yes (Emergent-controlled) | **YES** (production Mongo URL) | Restart backend. Wrong `MONGO_URL` at boot = silent data separation → do NOT deploy without validation. | `mongodb://localhost:27017` (preview) |
| `DB_NAME` | backend | no | no | no (fixed value) | Restart backend. **Do NOT change post-launch** — would silently orphan every historical order. | `phileon_db` |

### 1.8 Miscellaneous

| Variable | Component | Secret? | Owner? | Required before LIVE? | Rotation sensitivity | Current non-secret state |
|---|---|---|---|---|---|---|
| `CORS_ORIGINS` | backend | no | no | recommended to tighten to prod origin | Restart backend. Wrong CORS = frontend can't reach backend from prod origin. | `*` (preview) |
| `EMERGENT_LLM_KEY` | backend | **YES** | Emergent-managed | no (not on the customer-money path) | Restart backend. | present |
| `METALS_API_KEY` | backend | **YES** | yes | recommended (fallback: hard-coded USD/CAD mirror) | Restart backend. Metal-spot drift falls back to a safe path. | present or unset (owner-controlled) |
| `REACT_APP_ADMIN_EMAIL` | frontend | no (must not be used for auth) | no | no | Rebuild frontend. **Not used for authentication** — only for UI display convenience. Real admin auth is server-side JWT. | present |
| `REACT_APP_ADMIN_PASSWORD` | frontend | ⚠ MISUSE RISK — the frontend must **never** authenticate on password | no | no | Rebuild frontend. | present (legacy — do not extend usage) |
| `REACT_APP_BOOKING_URL` | frontend | no | yes | no | Rebuild frontend. | present (concierge / booking link) |

### 1.9 Legacy / unused / do not extend

The following are **read by legacy code paths only** and should not be added to for new
features:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PASSWORD`, `SMTP_FROM`,
  `ADMIN_EMAIL`, `ALERT_EMAIL_TO` — legacy SMTP fallback; Resend is the canonical email
  provider.
- `EASYPOST_API_KEY` — legacy shipping-label integration; not on the current checkout path.
- `INTEGRATION_PROXY_URL` — legacy proxy integration; not on the current checkout path.

Do NOT delete them from `.env` if they are already present (may still be read by a
legacy code branch), but do not rely on them and do not introduce dependencies on them.

---

## PART 2 — Owner Account Register

Real credentials belong in the owner's password manager (recommended: 1Password,
Bitwarden, or similar). NEVER in this document. NEVER in `/app/memory/*`. NEVER in
GitHub commit history.

### 2.1 Bluehost

- **Provider:** Bluehost.
- **Purpose:** Domain registration and DNS for `getyourphileon.com`. Where SPF, DKIM,
  return-path, and DMARC records are published.
- **Owner / admin identity:** Phill Wilson.
- **MFA status:** OWNER TO VERIFY.
- **Recovery method documented?:** OWNER TO VERIFY (Bluehost account recovery email +
  backup code).
- **Credential storage:** Owner's password manager.

### 2.2 Emergent

- **Provider:** Emergent Labs (this platform).
- **Purpose:** Hosting of frontend + backend + MongoDB. Deploys, rollback, environment
  variables, application snapshots (capabilities OWNER TO VERIFY at Layer 2).
- **Owner / admin identity:** Phill Wilson (the account that received this chat).
- **MFA status:** OWNER TO VERIFY.
- **Recovery method documented?:** OWNER TO VERIFY.
- **Credential storage:** Owner's password manager.

### 2.3 Stripe

- **Provider:** Stripe, Inc.
- **Purpose:** Authoritative payment processing. Test mode active; LIVE gated.
- **Owner / admin identity:** Phill Wilson (PHILEON legal entity).
- **MFA status:** OWNER TO VERIFY.
- **Recovery method documented?:** OWNER TO VERIFY (Stripe backup codes + backup admin
  email).
- **Credential storage:** Owner's password manager. **API keys must be read from the
  Stripe Dashboard, not stored anywhere except `backend/.env` in production.**

### 2.4 Resend

- **Provider:** Resend.
- **Purpose:** Transactional email delivery. Behavioral email will use a separate
  verified sender subdomain (`mail.getyourphileon.com`) when LIVE-authorized.
- **Owner / admin identity:** Phill Wilson.
- **MFA status:** OWNER TO VERIFY.
- **Recovery method documented?:** OWNER TO VERIFY.
- **Credential storage:** Owner's password manager.

### 2.5 Mongo / database platform

- **Provider:** MongoDB — currently Emergent-managed instance in the same environment as
  the backend (no separate cloud account).
- **Purpose:** Persistent order + retention + customer + admin data.
- **Owner / admin identity:** Phill Wilson (via Emergent account).
- **MFA status:** N/A (inherits Emergent auth).
- **Recovery method documented?:** OWNER TO VERIFY (Emergent snapshot / restore
  capability — Layer 2).
- **Credential storage:** `MONGO_URL` in `backend/.env` (production). Owner's password
  manager for any external Mongo GUI tool.

### 2.6 Object storage

- **Not currently used.** Static assets ship inside the frontend build. If a future
  feature introduces user uploads, add Emergent Object Storage credentials here at that
  time.

### 2.7 PHILEON email inbox

- **Provider:** Google (Gmail) — `phileon.jewelry@gmail.com` is the internal
  concierge/order notification recipient. `concierge@getyourphileon.com` is the
  outbound transactional sender (routed via Bluehost/Google Workspace — OWNER TO
  VERIFY which is the mail-hosting stack).
- **Purpose:** Receive internal paid-order alerts, integrity-review alerts, customer
  concierge inquiries.
- **Owner / admin identity:** Phill Wilson.
- **MFA status:** OWNER TO VERIFY (Gmail 2FA is strongly recommended — this is the
  channel through which the owner learns of every paid order).
- **Recovery method documented?:** OWNER TO VERIFY.
- **Credential storage:** Owner's password manager.

### 2.8 Future analytics / observability provider

- **Not yet in use.** If Plausible, PostHog, Segment, GA4, Sentry, or similar is added
  post-launch, register it here with the same fields (provider, purpose, owner identity,
  MFA status, recovery, credential storage).

---

## PART 3 — Cross-reference: which secret unlocks which capability?

| Capability | Secret required | Fail-closed behavior when absent |
|---|---|---|
| Create a Stripe Checkout Session | `STRIPE_SECRET_KEY` matching `STRIPE_MODE` | Session-create returns 5xx. New checkouts halt. Existing orders untouched. |
| Verify Stripe webhook signature | `STRIPE_WEBHOOK_SECRET` matching mode | Webhook returns 400 `INVALID_SIGNATURE`. `orders_v2` is NOT updated. Stripe will retry for up to ~3 days. |
| Send any customer email | `RESEND_API_KEY` + `PHILEON_FROM_EMAIL` (or Resend sandbox fallback) | Email dispatch fails; notification flags remain `false` so future retries are safe. |
| Admin panel login | `JWT_SECRET`, `ADMIN_PASSWORD_HASH`, admins collection seed | 401 on all admin routes. |
| Customer order status page | (no shared secret — per-order plaintext token verified against per-order hash) | 403 `INVALID_TOKEN` on the status endpoint. |
| Unsubscribe link | `JWT_SECRET` (HMAC signer) | 403 on unsubscribe. **Do not rotate JWT_SECRET immediately after sending behavioral emails** — it invalidates every outstanding unsubscribe token. |
| External behavioral scheduler | `PHILEON_RETENTION_CRON_SECRET` | 401 on `POST /api/admin/retention/tick`; behavioral queue does not advance. |
| CAD BNPL FX quote | (no shared secret — `services/fx_bnpl.py` uses keyless Frankfurter) | 503 `BNPL_FX_UNAVAILABLE`; normal USD checkout still works. |
| Adaptive Pricing presentment | Stripe Dashboard toggle (per mode) + `STRIPE_SECRET_KEY` | Session still creates in USD; customer sees USD on Stripe hosted page. |

---

## PART 4 — Confirmation of what this file does NOT contain

- ❌ No actual `STRIPE_SECRET_KEY` value.
- ❌ No actual `STRIPE_WEBHOOK_SECRET` value.
- ❌ No actual `RESEND_API_KEY` value.
- ❌ No actual `JWT_SECRET` value.
- ❌ No actual `CUSTOMER_JWT_SECRET` value.
- ❌ No actual `ADMIN_PASSWORD_HASH` value.
- ❌ No actual `PHILEON_RETENTION_CRON_SECRET` value.
- ❌ No actual `MONGO_URL` (production) value.
- ❌ No actual `METALS_API_KEY` value.
- ❌ No admin password.
- ❌ No Stripe backup codes, Resend backup codes, Bluehost password, Emergent password,
      or Gmail password.
- ❌ No Stripe test card numbers past the point they are considered "public test data" by
      Stripe (and even those are not stored here).
