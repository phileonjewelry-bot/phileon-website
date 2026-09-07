# PHILEON — RECOVERY RUNBOOK

**Audience:** Owner (Phill Wilson) + on-call engineer during an incident.
**Read this BEFORE anything is on fire, not during.**
**Companion documents:** `OPERATIONS.md` · `ENVIRONMENT_REGISTRY.md` · `LAUNCH_DAY_CHECKLIST.md`

> **Golden rules (memorize these — every decision in this runbook derives from them):**
>
> 1. **Stripe remains authoritative for payment truth.** A restored database must never
>    be allowed to overwrite newer Stripe truth. Stripe wins every disagreement.
> 2. **Never blindly replay all emails or all webhooks after a restore.** Reconcile
>    against Stripe and Resend delivery logs first.
> 3. **Never delete historical orders as a rollback mechanism.** Historical order
>    `PHI-20260901-4CBC5C` is a locked invariant.
> 4. **When in doubt, stop new checkouts** (see § Emergency stop). Do not stop refunds.
> 5. **Every rollback keeps the "before" state.** Snapshot the broken thing first.

---

## 0. Incident severity model

Use these labels in every ticket / message. Higher severity = wider blast radius.

| Severity | Meaning | Examples | Response window |
|---|---|---|---|
| **SEV-1** | Total or partial customer money loss / duplicate charges / silent order loss / plaintext credential leak | Stripe webhook processing wrong customer → wrong shipment; duplicate paid emails w/ duplicate side-effects; leaked secret in a customer-visible response | **Minutes.** Halt checkout. Wake owner. |
| **SEV-2** | Storefront broken for a large fraction of customers OR data integrity risk without immediate customer loss | Backend down; database read/write failing; wrong price rendered but no checkout completed; email dispatch failing systemically | **≤ 30 minutes.** Halt checkout if any doubt about integrity. |
| **SEV-3** | Isolated defect, no money impact, checkout still works | Single email template misformats; admin panel bug; retention tick off-schedule; non-fatal 500 in a non-checkout route | **Same day.** Roll forward with a fix. |
| **SEV-4** | Cosmetic / editorial / minor UI | Typo, broken image alt text, gallery ordering | **Next scheduled release.** |

**Escalation defaults**
- Any SEV-1 or SEV-2 that involves **Stripe payments, webhooks, or the `orders_v2`
  collection** → default action is **Emergency Stop § 20** BEFORE investigation.
- Any incident that involves **PII / consent / suppression / unsubscribe** → treat as
  SEV-2 minimum until proven otherwise.
- Any incident that touches `PHI-20260901-4CBC5C` → **SEV-1 automatically**.

---

## 1. Frontend rollback

**When:** A frontend deploy makes the storefront visually broken, wrong-price-rendering,
or breaks checkout UI. No money loss yet.

Steps:
1. Confirm the last-known-good deploy in the Emergent platform's deploy history.
   (OWNER TO VERIFY that the deploy history is visible and each deploy is version-locked.)
2. Trigger the platform's **Rollback** action to the last-known-good frontend build.
3. Wait for the CDN / edge cache to invalidate (typically < 5 minutes).
4. Validate `/`, `/cart`, `/checkout`, one PDP (e.g. `/products/la-marva`),
   `/ring-size-guide`, `/orders/…/status?token=…` (deep-link only), `/admin/login`.
5. If validation passes → close incident.
6. If validation fails → roll one more step back and repeat.

**Never** hot-patch the production frontend by editing built assets in place.

## 2. Backend rollback

**When:** A backend deploy causes 5xx responses, wrong money math, webhook processing
errors, or database write errors.

Steps:
1. **Stop new checkouts first** if the deploy is affecting `/api/checkout/*` or
   `/api/webhooks/stripe`. See § 20 Emergency stop.
2. Confirm the last-known-good backend deploy in the Emergent deploy history.
3. Trigger platform **Rollback** to the last-known-good backend.
4. **Verify env survives** — after rollback, curl `/api/health` (or the equivalent) and
   confirm that:
   - `STRIPE_MODE` is the expected value.
   - `stripe_api_verified` is `true`.
   - Mongo is reachable.
   - Resend key is present.
   OWNER TO VERIFY that Emergent's rollback preserves env variables — see § 15.
5. Un-pause the Stripe webhook endpoint AFTER the rollback is validated (Stripe Dashboard
   → Developers → Webhooks → resume the endpoint).
6. Force Stripe to **replay any events that landed during the outage** — see § 8.
7. Close incident only after webhooks are drained and `webhook_events` shows the expected
   number of new event IDs.

## 3. Bad deployment recovery (frontend + backend rolled together)

**When:** A combined deploy is broken. Both tiers rolled back.

1. Emergency stop first if there is any doubt about money integrity (§ 20).
2. Roll back **backend** first (§ 2).
3. Roll back **frontend** second (§ 1).
4. If backend rollback restores health but frontend does not, investigate whether the
   broken frontend was calling a removed backend endpoint. NEVER re-deploy the frontend
   forward if the backend is on an older schema.
5. Reconcile: read the last hour of Stripe events (Dashboard → Events → filter by time)
   and confirm `orders_v2` has a matching row for each `checkout.session.completed`.

## 4. Database outage

**When:** Backend logs show `pymongo.errors.ServerSelectionTimeoutError`, or
`/api/health` reports Mongo unreachable.

1. **Emergency stop new checkouts** (§ 20). Card-holders must not be able to reach the
   Stripe hosted page with a Session that PHILEON's DB has not recorded.
2. Confirm the outage is on the Emergent Mongo instance, not a networking blip. Retry
   after 60 seconds; check the platform's status page.
3. If Mongo is truly down:
   - **Do NOT delete or truncate anything.** The database is the smaller problem;
     Stripe still holds the customer-money truth.
   - **Do NOT restart the backend into a state where it silently writes to a wrong
     `MONGO_URL`.** Leaving `MONGO_URL` unchanged and letting the backend retry is safe
     because writes will simply fail until Mongo returns.
4. Wait for platform recovery.
5. On restore: **reconcile against Stripe** for the outage window (§ 8, § 22).
6. Un-arm the emergency stop only after reconciliation is complete.

## 5. Database corruption

**When:** Documents come back with unexpected values (missing fields, wrong types,
`payment_status` inconsistent with Stripe), or an index is corrupt.

1. Emergency stop new checkouts (§ 20).
2. Do NOT run any `update_many`, `delete_many`, or `drop_index` command against the
   affected collection. This is the moment to slow down.
3. Snapshot the corrupted collection as-is:
   - OWNER TO VERIFY that Emergent supports on-demand snapshots (Layer 2).
   - As a fallback, `mongodump` the affected collection to a scratch location if
     platform tooling permits.
4. **Restore into an isolated Mongo instance** (§ 6). Never restore over production.
5. Compare, reconcile, then promote.

## 6. Isolated restore procedure

Never restore directly over the live database.

1. Provision (or request from the platform) a **scratch Mongo instance** in the same
   environment (OWNER TO VERIFY that Emergent supports this).
2. Restore the desired snapshot into the scratch instance.
3. Point a **read-only** copy of the backend at the scratch `MONGO_URL` via a
   throwaway env override (do NOT change production `.env`).
4. Reconcile the scratch data against Stripe (§ 8) and against Resend delivery logs (§ 12).
5. Only after reconciliation is complete, promote by pointing production at the scratch
   instance (or by copying reconciled collections into production).
6. Retain the pre-restore (broken) production database as-is for at least 30 days.

## 7. Single-order recovery procedure

**When:** Exactly one order has a mismatch (missing row in `orders_v2`, wrong
`payment_status`, missing shipment metadata) but everything else is fine.

1. Identify the order in Stripe (Dashboard → Payments → search by customer email,
   `payment_intent_id`, or `checkout_session_id`).
2. Read the canonical values from Stripe:
   - `amount_total` (in cents)
   - `currency`
   - `metadata.order_number` (if present) or `metadata.canonical_order_number`
   - `payment_status`
   - `shipping_details`
   - `presentment_details` (if non-USD)
3. Read the matching `orders_v2` row (if any) by `order_number` or
   `provider_session_id` or `provider_payment_intent_id`.
4. If missing → **backfill** the row using the canonical resolver
   (`services.catalog.resolve_line_item`) with the ORIGINAL items from the Session's
   `metadata`. Preserve `order_number`, `provider_session_id`,
   `provider_payment_intent_id`. Set `payment_status` to match Stripe. Set the four
   notification flags (`customer_notification_sent`, `internal_review_notification_sent`,
   `paid_notification_sent`, `shipping_notification_sent`) to `true` IF Resend logs show
   the email was already delivered; otherwise leave them `false` and allow the next
   webhook or admin action to trigger the email.
5. If present but stale → update in place. Never delete-and-recreate.
6. NEVER touch `PHI-20260901-4CBC5C`.

## 8. Stripe webhook outage

**When:** Stripe events are firing but the backend is not processing them (backend down,
database down, or webhook endpoint disabled).

1. Do NOT delete the webhook endpoint. Instead, **pause** it in Stripe Dashboard →
   Developers → Webhooks → the endpoint → pause. Stripe retries failed deliveries
   automatically with exponential backoff for up to ~3 days.
2. Fix the underlying issue (backend up, database up, correct webhook signature).
3. Un-pause the endpoint.
4. If necessary, **manually replay** missed events for the outage window (§ 9).
5. Confirm the `webhook_events` collection contains new event IDs after replay.

## 9. Stripe webhook replay

**When:** Some events were missed during an outage OR after an isolated restore.

Rules:

1. Idempotency ledger (`webhook_events`) MUST be intact before replay. If it is not,
   restore or rebuild it first — see § 12 for how to seed it from Resend delivery logs.
2. In Stripe Dashboard → Developers → Events → filter by date range → for each event,
   click "Resend to endpoint".
3. Prefer replaying **in chronological order** (oldest first) so `payment_status`
   transitions naturally: `pending → paid → refunded`.
4. Confirm each replay writes exactly one new `webhook_events` row per `event.id`.
5. NEVER hand-craft a fake webhook payload. Only Stripe-Dashboard-originated replays are
   allowed.

## 10. Webhook secret rotation

**When:** `STRIPE_WEBHOOK_SECRET` may be compromised OR you are moving from TEST to LIVE.

1. In Stripe Dashboard, on the target webhook endpoint, click "Roll signing secret" (or
   add a new endpoint and delete the old one after cut-over).
2. Update `STRIPE_WEBHOOK_SECRET` in `backend/.env`.
3. Restart the backend (`sudo supervisorctl restart backend`).
4. **Immediately fire a Stripe test event** ("Send test event" in the Dashboard) and
   confirm it processes with a 200 response.
5. Do not close the previous secret until the new one is confirmed working.

## 11. Email-provider outage (Resend)

**When:** Resend delivery is failing (bounces, timeouts, API 5xx).

1. This is **not** a checkout-stopping event by itself. Customers can still pay. The
   email is a side-effect gated by `paid_notification_sent`.
2. If email is critical to a specific transaction (integrity hold), the order still lives
   in `orders_v2` and can be manually notified later by re-triggering the send with the
   flag reset — see § 12.
3. Do NOT reset `paid_notification_sent`, `shipping_notification_sent`,
   `customer_notification_sent`, or `internal_review_notification_sent` in bulk.
4. If Resend is down > 4 hours, halt shipment notifications until it is back.

## 12. Duplicate-email prevention after restore

If notification flags are LOST during restore:

1. Do NOT let the webhook re-fire. Pause the Stripe endpoint.
2. Export Resend delivery logs for the same time window as the restored orders.
3. For each order in the restore window, set the corresponding flag to `true` if Resend
   logs show the email was delivered.
4. Un-pause the webhook only after the flags are seeded.
5. If Resend logs are incomplete (older than the plan retention), err on the side of
   `true` for older orders — over-suppressing an email is safer than double-sending.

## 13. Behavioral scheduler recovery
Behavioral email is SIMULATION-only today. This section applies the day it goes LIVE.

1. If `behavior_send_log` is lost, DO NOT run `/api/admin/retention/tick` until either
   the log is restored OR the `PHILEON_BEHAVIORAL_GLOBAL_LAUNCH_CAP` is set to a very
   small number (e.g. `1` or `2`) to prevent flood.
2. If `email_suppression` is lost, DO NOT run the tick until it is restored. Unsubscribed
   customers must never receive behavioral email.
3. `retention_pending` can be safely reconstructed from `behavior_events` on the next
   tick — the engine will re-schedule pending rows from live events. Purchase-suppression
   (`ORDER_PAID` from `webhooks_stripe.py`) will cancel stale rows.
4. If `PHILEON_RETENTION_CRON_SECRET` may be leaked, rotate it (§ 15) and update any
   external scheduler.

## 14. Environment-variable rollback

**When:** A `.env` change (e.g. `STRIPE_MODE`, `PHILEON_ORDER_STATUS_URL_BASE`,
`PHILEON_BEHAVIORAL_LIVE`) causes an incident.

1. Confirm the exact variable that changed.
2. Revert it in `backend/.env`.
3. `sudo supervisorctl restart backend`.
4. Validate `/api/health`.
5. For customer-facing URLs (order status base, success/cancel URLs), confirm one live
   email link resolves correctly BEFORE re-enabling any dispatch.

**Cheatsheet — instant "safe defaults":**

| Variable | Safe default | Effect |
|---|---|---|
| `STRIPE_MODE` | `test` | Switches session-create to TEST-only |
| `PHILEON_BEHAVIORAL_LIVE` | `false` | Behavioral tick is simulation-only |
| `PHILEON_BEHAVIORAL_GLOBAL_LAUNCH_CAP` | `0` (disables cap) or `1` (near-off) | Throttles LIVE behavioral sends |
| `PHILEON_ORDER_STATUS_URL_BASE` | preview URL (temporary) | Order-status CTAs point at preview until prod URL is fixed |

## 15. Secret rotation (owner action)

For each of the following, the rotation procedure is: generate a new value in the
provider, update `backend/.env` (production), restart backend, verify with a live TEST
transaction.

- `STRIPE_SECRET_KEY` — Stripe Dashboard → Developers → API keys → Roll.
- `STRIPE_WEBHOOK_SECRET` — see § 10.
- `RESEND_API_KEY` — Resend Dashboard → API keys.
- `JWT_SECRET` — regenerate a 64-char random string. **Rotating this invalidates admin
  sessions AND all outstanding unsubscribe tokens** (they are HMAC-signed with
  `JWT_SECRET`). Coordinate with the owner if any real email has been sent recently.
- `CUSTOMER_JWT_SECRET` — regenerate a 64-char random string. Invalidates customer
  session tokens.
- `ADMIN_PASSWORD_HASH` — regenerate via `bcrypt` and update the admin's password
  manager entry.
- `PHILEON_RETENTION_CRON_SECRET` — regenerate a 32+ char random string and update any
  external scheduler.

Never write the new value into a code file, a chat message, or a document. Always into
the owner's password manager first, then into `.env`.

## 16. Wrong-price incident

**When:** A customer report or an internal test shows a price rendered on-site does not
match the canonical resolver output.

1. **Emergency stop new checkouts for the affected SKU** (§ 20).
2. Verify the trusted resolver output with:
   `curl "$REACT_APP_BACKEND_URL/api/checkout/health"` — should show 84 supported
   products, canonical currency USD.
3. Compare against `backend/services/pricing_engine_catalog.py`. Fix the drift there,
   not in the frontend.
4. **Do NOT alter historical orders** to match the "correct" price. Historical orders
   record the price the customer actually paid at the moment of the Stripe Session.
5. Re-open checkout only after a new backend deploy proves the correct price for the
   affected SKU end-to-end.

## 17. Checkout outage

**When:** `POST /api/checkout/stripe/session` is returning 5xx or the Stripe hosted page
is unreachable.

1. If backend is up but Stripe is down: this is Stripe's incident. Announce a brief
   maintenance banner on `/checkout` (temporary manual edit is acceptable) and wait.
2. If backend is down: § 2 (backend rollback) or § 4 (database outage).
3. Do NOT switch off adaptive pricing or the BNPL lane during the incident. Both are
   fail-closed to canonical USD if the FX source is unavailable.
4. During the outage, all in-flight Sessions that Stripe already accepted will still
   complete. The webhook must still be received; if it fails, § 8.

## 18. Domain / DNS incident

**When:** `https://www.getyourphileon.com` does not resolve OR HTTPS certificate expires
OR SPF/DKIM records are altered.

1. HTTPS certificate expiring: this must be renewed by the platform / DNS provider. Track
   the renewal window. OWNER TO VERIFY that the platform auto-renews.
2. SPF/DKIM broken → **customer emails may go to spam or bounce.** Do not resend blindly.
   Halt behavioral dispatch immediately (`PHILEON_BEHAVIORAL_LIVE=false`) and fix the DNS.
3. Domain redirection changed → customer order status links may 404 or hijack. Fix DNS
   before re-enabling any email dispatch. `PHILEON_ORDER_STATUS_URL_BASE` should be
   temporarily reverted to the preview URL if the production origin is unreachable.

## 19. Rollback validation steps

After any rollback, this is the standard validation set. Every incident closes with this.

- [ ] `/` renders the homepage in < 2 seconds.
- [ ] `/cart` renders (empty state OK).
- [ ] One PDP renders with the correct trusted price (spot check `/products/la-marva`,
      `/products/scacco-matto`, `/products/ribbon-regale-edition`).
- [ ] `/ring-size-guide` renders.
- [ ] `/checkout` with an item renders and shows the correct shipping cost for CA / US.
- [ ] `curl $REACT_APP_BACKEND_URL/api/checkout/health` returns 84 supported products.
- [ ] `PHI-20260901-4CBC5C` in `orders_v2` still shows `currency=CAD total_cents=2265000
      payment_status=paid`.
- [ ] A random recent order (from Stripe TEST) still shows in `orders_v2` with matching
      canonical USD cents.
- [ ] `webhook_events` has at least one new event ID from the past 24 h (if any traffic
      occurred).
- [ ] Admin can log in at `/admin/login`.
- [ ] Admin retention panel shows `SIMULATION` mode.
- [ ] `PHILEON_BEHAVIORAL_LIVE=false`.
- [ ] `STRIPE_MODE=test` (or `live` post-Gate 6, whichever is authoritative for the
      current phase).

## 20. Emergency stop

Halting new customer checkouts while preserving Stripe payment truth.

**Fastest option (recommended — no code change required):**
1. In Stripe Dashboard → Payments → Payment methods, temporarily disable all payment
   methods in the target mode (TEST or LIVE). New Sessions will still be created but
   Stripe will reject them at method-collection.
2. This is instantly reversible.

**Code-side option (if the platform requires it):**
1. Add a temporary feature flag `CHECKOUT_ENABLED=false` in `backend/.env`.
2. Gate `create_stripe_session` on it (5-line edit to `backend/routes/checkout.py`).
3. Redeploy or restart.
4. Existing `OrderV2` records are untouched.

**What NOT to do:**
- Do NOT delete the Stripe webhook endpoint. Pause it if needed.
- Do NOT drop the `orders_v2` collection.
- Do NOT flip `STRIPE_MODE=test` if you are already LIVE — this creates a mode-mismatch
  where Stripe LIVE webhooks arrive at a TEST-configured backend and fail signature
  verification.
- Do NOT ship any behavioral email during an emergency stop.

## 21. Reopening checkout after an incident
Only after § 19 validation passes:

1. Un-pause the Stripe webhook endpoint (if paused).
2. Re-enable payment methods (if disabled).
3. Remove any `CHECKOUT_ENABLED=false` gate.
4. Restart backend, validate `/api/health`.
5. Fire one test transaction through the last-known-good path (see
   LAUNCH_DAY_CHECKLIST.md § "First transaction" — RIBBON REGALE ÉDITION Gold-Plated,
   $350 USD is the canonical safest piece).
6. Confirm exactly one `orders_v2` row, one customer email, one internal email.
7. Announce recovery.

## 22. Stripe-authoritative reconciliation (the master routine)
Use this any time Mongo and Stripe may disagree.

1. Pull the last N days of Stripe events (`Dashboard → Events`).
2. Build a set `stripe_ids = { event.id for event in events }`.
3. Build a set `mongo_ids = { row.event_id for row in webhook_events }`.
4. **In `stripe_ids − mongo_ids`** → events Stripe processed that Mongo did not know about.
   These are the ones to replay (§ 9).
5. **In `mongo_ids − stripe_ids`** → this should be **empty**. If it is not, Mongo has
   phantom events; investigate before doing anything.
6. For each `orders_v2` row in the incident window, confirm `payment_status` matches
   Stripe's latest state for that `provider_payment_intent_id`.
7. Update Mongo to Stripe. Never the other direction.

---

## 23. Fulfillment hold (Layer 2)

**When:** Owner needs to stop fulfillment on a paid order without touching
payment truth. Examples: address concern, customization clarification,
insurance issue, customer requested delay, fraud review.

Steps:
1. Open **Admin → Fulfillment** (`/admin/fulfillment`).
2. Select the order.
3. Enter a hold reason (≥ 3 chars) and click **Place on Hold**.
4. Order moves to `fulfillment_status = "on_hold"`. `payment_status` is
   untouched. An audit row is written with the reason.
5. To release: click **Release Hold**. This requires ALL integrity gates
   green (`shipping_integrity_status = ok`,
   `presentment_integrity_status ∈ {ok, null}`,
   `payment_status ∈ {paid, authorized}`). If any gate is red the API
   returns `409 NOT_ELIGIBLE` and the manual release is refused —
   resolve the underlying data issue first (see § 22).

**Manual hold is NEVER a substitute for an integrity hold.** The two are
separate: integrity holds are set by the Stripe webhook only and cannot
be cleared from the admin panel.

---

## 24. Dispute / chargeback recovery (Layer 4)

**When:** A `charge.dispute.created` webhook is missed, a duplicate arrives,
the webhook secret rotates during a dispute, or the DB is restored with
stale dispute state.

**Golden rule:** Stripe is authoritative for dispute existence, amount,
status, and result. Never trust stale local dispute state after a restore
or outage — re-fetch from Stripe first.

Steps:
1. **Pause the Stripe webhook endpoint** (do NOT delete) if webhook secret
   rotation is in progress.
2. In Stripe Dashboard → Disputes, list current open disputes for the
   affected window.
3. Compare against `dispute_cases` in Mongo.
4. For any Stripe dispute NOT in `dispute_cases` → **do NOT hand-craft the
   row.** Instead, in Stripe Dashboard use "Resend to endpoint" to replay
   `charge.dispute.created`. The idempotent webhook creates the mirror.
5. For any `dispute_cases` row NOT in Stripe → this should be empty. If
   not, the mirror is phantom; investigate before mutating.
6. **Do NOT release a `fraud_review_status="blocked"` hold** on an
   unshipped order without confirming Stripe status is `won` /
   `warning_closed` / `charge_dismissed`.
7. **Mistaken fulfillment during dispute:** if an order was shipped after
   `payment_status="disputed"`, do NOT rewrite shipping history. Add a
   factual owner note on the dispute case, retain the shipment evidence,
   and prepare the response for Stripe Dashboard submission.
8. Un-pause the webhook only after `dispute_cases` view matches Stripe.

**Never** submit dispute evidence to Stripe via the API in Layer 4. The
LIVE-submission path returns `409 LIVE_SUBMISSION_DISABLED_IN_LAYER_4`.
Owner submits through the Stripe Dashboard until a hardened path is
separately approved.

---



## APPENDIX A — do-not-do list
- Do NOT `db.orders_v2.drop()` for any reason.
- Do NOT `db.webhook_events.drop()` for any reason.
- Do NOT `db.email_suppression.drop()` for any reason.
- Do NOT delete `PHI-20260901-4CBC5C`.
- Do NOT modify historical order canonical amounts to "fix" a price bug.
- Do NOT replay Resend to unsubscribed emails.
- Do NOT enable `PHILEON_BEHAVIORAL_LIVE=true` during an incident. Ever.
- Do NOT change `STRIPE_MODE` on a live-affecting deploy without a webhook-secret
  rotation in the same commit.
- Do NOT write real secrets into any file in `/app` other than `backend/.env` and
  `frontend/.env`.

## APPENDIX B — one-line diagnostic curls

```
# Backend health
curl $REACT_APP_BACKEND_URL/api/health

# Checkout resolver surface
curl $REACT_APP_BACKEND_URL/api/checkout/health

# Order status (deep-link only, needs token)
curl "$REACT_APP_BACKEND_URL/api/checkout/order/PHI-XXXXXXXX-XXXXXX/status?token=..."

# I18N snapshot
curl $REACT_APP_BACKEND_URL/api/i18n/rates
```

## APPENDIX C — Emergent platform actions the owner may need

- Deploy history / rollback: OWNER TO VERIFY location in the Emergent panel.
- Mongo snapshot cadence: OWNER TO VERIFY.
- Env variable survival across rollback: OWNER TO VERIFY.
- On-demand snapshot: OWNER TO VERIFY.
- Isolated / scratch Mongo instance: OWNER TO VERIFY.

If any of these turns out to be unavailable, the fallback recovery source is Stripe
(for payment truth) + Resend delivery logs (for email history) + `git log` (for code
truth). The system is designed to be reconstructable from those three even if Mongo
is a complete loss — but that is a last resort, not a plan.
