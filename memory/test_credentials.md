# PHILEON — Test Credentials

Existing admin credentials, used across sessions for admin-only flows.

## Admin (JWT-based)

- Login URL: /admin/login
- Username: `admin`
- Password: `phileon2024`

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

## Resend (Phase 10 email)

- `RESEND_API_KEY` — currently empty in `.env` (deferred to owner)
- `PHILEON_FROM_EMAIL` — currently empty (defaults to `onboarding@resend.dev`
  when unset, which is fine only for dev testing)
- `PHILEON_CONCIERGE_NOTIFICATION_EMAIL` — currently empty (owner inbox)

When these are unset, email delivery short-circuits to
`{"status": "skipped", "reason": "no_api_key"}` and Concierge intake still
succeeds — email is notification, not the source of truth.
