# PHILEON — Test Credentials

## Admin (JWT-based)

- Login URL: /admin/login
- Username: `admin`
- Password: **Not stored in this file.**

Current admin credentials are stored outside tracked project files. Do not
place real admin passwords in the repository or in memory documentation.
Rotate via `ADMIN_PASSWORD_HASH` (bcrypt) in `/app/backend/.env` and record
the plaintext only in a local untracked file.

The token is stored client-side under `localStorage.phileon_admin_token`
and passed as `Authorization: Bearer <token>` to every `/api/admin/*`
endpoint.

## Concierge (Phase 10)

- Admin inbox: `/admin/concierge` (requires the admin JWT above)
- Backend list: `GET /api/admin/concierge/inquiries`
- Backend detail: `GET /api/admin/concierge/inquiries/{reference}`
- Status POST fallback: `POST /api/admin/concierge/inquiries/{reference}/status`
  (PATCH also registered; POST is required because the platform ingress
  strips PATCH in production requests)
- Notes: `POST /api/admin/concierge/inquiries/{reference}/notes`
- Attachment: `GET /api/admin/concierge/attachments/phileon/concierge/{...}`

## Emergent Object Storage

Uses `EMERGENT_LLM_KEY` from `/app/backend/.env`. No customer-facing
credential required.

## Resend (Phase 10 email — currently disabled-safe)

- `RESEND_API_KEY` — empty in `/app/backend/.env`
- `PHILEON_FROM_EMAIL` — empty (must be a verified sender on a verified
  PHILEON domain before activation)
- `PHILEON_CONCIERGE_NOTIFICATION_EMAIL` — empty (internal PHILEON inbox)

With these unset, the email helper short-circuits and returns
`{"status": "skipped", "reason": "no_api_key"}`. Concierge intake still
succeeds — email is notification, not the source of truth.

## Growth OS (Phase 1) — admin surface

- UI: `/admin/growth-os` (requires the admin JWT above in
  `localStorage.phileon_admin_token`).
- Backend: `/api/admin/growth-os/*` (verify_admin). Cron intake:
  `POST /api/growth-os/cron/daily-refresh` with
  `Authorization: Bearer $WEBHOOK_CRON_SECRET` (value lives ONLY in
  `/app/backend/.env`; never in frontend, logs or crons.yml).
- Preview-only test token: a short-lived admin JWT can be minted with
  `JWT_SECRET` from `/app/backend/.env` (`{"sub":"admin","exp":...}`, HS256)
  — the same approach `tests/test_layer7_analytics.py::_admin_token` uses.
- Flags: `PHILEON_GROWTH_OS_ENABLED=true` (preview), `GROWTH_OS_CRON_ENABLED=false`,
  `SERPAPI_API_KEY=` (blank → Radar shows "Integration Required").

## Admin first-time setup (PREVIEW ONLY) — Oct 13, 2026

- Page: `/admin/setup` · API: `GET /api/admin/setup/status`, `POST /api/admin/setup/complete`.
- Gate (all required): env != production · `ADMIN_SETUP_TOKEN` (>=32 chars) · `ADMIN_SETUP_EXPIRES_AT`
  in the future (10-min window) · zero docs in `db.admins` · no completion marker.
- Arm/disarm (never prints the token): `python /app/backend/scripts/admin_setup_window.py arm|disarm|status`
  then `sudo supervisorctl restart backend`. Owner reads the token from `/app/backend/.env`
  via the platform Code (VS Code) viewer — NOT via chat.
- Login precedence: once an owner admin exists in `db.admins`, the legacy env credential
  (`ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`) is no longer accepted in that environment.
  Production (zero DB admins) keeps the env path unchanged.
- Passwords/tokens are intentionally NOT recorded here.
