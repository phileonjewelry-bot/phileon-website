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
