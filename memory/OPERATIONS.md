# PHILEON — OPERATIONS

**Audience:** Owner (Phill Wilson) + any engineer picking up the platform.
**Status:** Read-only architecture + backup + source-of-truth reference. No secrets.
**Last read-only audit:** Feb 2026 — Pre-Launch Operational Maturity, Layer 1 of 8.

> This file describes HOW the platform is put together and WHERE the truth lives for each
> piece of the business. It does not contain passwords, API keys, or webhook secrets.
> For the incident playbook see `RECOVERY_RUNBOOK.md`. For env vars see
> `ENVIRONMENT_REGISTRY.md`. For launch-day steps see `LAUNCH_DAY_CHECKLIST.md`.

---

## 1. System architecture overview

PHILEON is a three-tier full-stack e-commerce platform:

| Tier | Technology | Responsibility |
|---|---|---|
| Frontend | React (Create React App), served via the Emergent platform | Cinematic editorial storefront, cart UI, checkout UI, admin panel UI, customer order status page |
| Backend | FastAPI (Python 3.11), served under `/api/*` via the Emergent platform | Authoritative money math, catalog, Stripe session creation, Stripe webhook processing, email dispatch, behavioral retention engine, admin JWT auth |
| Database | MongoDB (Emergent-managed instance in the same environment) | Persistent order records, customers, retention events, webhook idempotency, admin accounts |
| Payments | Stripe (currently TEST mode) | Authoritative source of payment truth |
| Transactional email | Resend | Delivers customer + internal emails (currently transactional only; behavioral is SIMULATION) |
| Display FX | api.frankfurter.dev (keyless) | Approximate local-currency display + trusted CAD BNPL lane conversion |

---

## 2. Frontend source and deployment location

- **Source:** `/app/frontend/`
- **Entry:** `frontend/src/App.js`
- **Product data:** `frontend/src/data/products.js`
- **PDP components:** `frontend/src/pages/*` and `frontend/src/components/*`
- **Currency layer:** `frontend/src/context/PresentmentContext.jsx`
- **Admin routes:** `/admin/login`, `/admin/shipments`, `/admin/retention`
- **Deploy channel:** Emergent-managed static deploy of `frontend/build/` behind the production origin.
- **All frontend API calls MUST go through `process.env.REACT_APP_BACKEND_URL`.** Nothing else is trusted.

## 3. Backend source and deployment location

- **Source:** `/app/backend/`
- **Entry:** `backend/server.py` (FastAPI app, registers all routers)
- **Routes:** `backend/routes/*.py`
- **Services (business logic):** `backend/services/*.py`
- **Data models:** `backend/models_orders.py`, `backend/models_retention.py`, `backend/models.py`
- **Trusted catalog + money math:** `backend/services/pricing_engine_catalog.py`, `backend/services/catalog.py`
- **Shipping money math:** `backend/services/shipping_zones.py`
- **Stripe webhook handler:** `backend/routes/webhooks_stripe.py`
- **Deploy channel:** Emergent-managed process manager, exposed on internal `0.0.0.0:8001` and reached externally via the `/api/*` ingress path.

## 4. Database location

- **Engine:** MongoDB.
- **Access:** `os.environ["MONGO_URL"]` from `backend/.env`, database name from `os.environ["DB_NAME"]`.
- **Physical location:** Managed inside the Emergent platform in the same environment as the backend.
- **Direct human access from outside the platform is not routinely provisioned.** Backup capabilities live at the platform layer — see the Backup Architecture section.

## 5. Object / file storage

- Product imagery, campaign videos, hero stills are served as **static assets** from
  the frontend build (`frontend/public/*` and `frontend/src/assets/*`).
- **No user-generated file uploads exist in the current app.** No S3/GCS bucket is required.
- If a future feature introduces user uploads (e.g. custom-order photo attachments),
  the correct integration is Emergent Object Storage — DO NOT store binary blobs in Mongo.

## 6. Domain / DNS ownership

- **Production customer origin (target):** `https://www.getyourphileon.com`
- **Preview / staging origin:** the Emergent-provided preview URL, currently
  `https://labete-gallery.preview.emergentagent.com`
- **DNS registrar / hosting-adjacent provider:** Bluehost (owner-controlled).
- **DNS is where Resend SPF/DKIM/return-path records are published** to enable customer
  email deliverability.
- **DMARC policy:** owner to verify current organizational-domain DMARC before scoping
  a subdomain policy for `mail.getyourphileon.com`. See RECOVERY_RUNBOOK.md § email.

## 7. Stripe role

Stripe is the **authoritative source of payment truth** for PHILEON.

- Every checkout is a **Stripe Checkout Session** created server-side by
  `POST /api/checkout/stripe/session`. The client never sees or supplies prices.
- The Session `currency` is canonical **USD**. Presentment currency (CAD/GBP/EUR/AUD/JPY)
  is decided by Stripe Adaptive Pricing OR by the CAD BNPL lane at Session-create.
- Webhook events (`checkout.session.completed`, `async_payment_*`, `charge.refunded`) are
  processed by `POST /api/webhooks/stripe` with **HMAC signature verification** and
  **event-ID deduplication** in the `webhook_events` collection.
- If Mongo state ever contradicts Stripe truth, **Stripe wins.** The database can be
  reconciled from Stripe events; Stripe cannot be reconciled from the database.

## 8. Resend role

Resend delivers customer- and owner-facing email.

- **Transactional email path** (paid confirmation, payment received / integrity hold,
  shipment confirmation, internal paid alert, internal integrity review):
  sender = `PHILEON_FROM_EMAIL` (currently `concierge@getyourphileon.com`).
- **Behavioral / lifecycle email path** (welcome, cart-abandonment, checkout-abandonment,
  browse-abandonment, wishlist-abandonment, post-purchase care):
  sender = `PHILEON_BEHAVIORAL_FROM_EMAIL` (dedicated subdomain — currently unset because
  behavioral is in SIMULATION mode).
- **Behavioral currently cannot send real email** because `PHILEON_BEHAVIORAL_LIVE=false`
  AND `PHILEON_BEHAVIORAL_FROM_EMAIL` is unset. Two independent gates.
- **Sender separation is enforced in code.** A misconfigured behavioral sender can never
  hijack the transactional sender (see `services/email.py::send_email`).

## 9. Production vs preview environments

| Aspect | Preview (current environment) | Production (target) |
|---|---|---|
| Frontend origin | Emergent preview URL | `https://www.getyourphileon.com` |
| Backend origin | Same preview URL, `/api/*` routed | Production Emergent deploy, same `/api/*` path |
| Database | Preview Mongo | Production Mongo (separate) |
| Stripe mode | `test` | `live` after Gate 6 |
| Behavioral email | SIMULATION | SIMULATION until owner separately approves LIVE |
| Adaptive Pricing | TEST toggle on | LIVE toggle: owner action in Stripe Dashboard |
| Resend sender domain | Sandbox / test | Verified PHILEON-owned domain |
| `PHILEON_ORDER_STATUS_URL_BASE` | preview URL (**pre-launch config gate**) | `https://www.getyourphileon.com` |

Preview must NEVER be treated as production and production must NEVER be treated as
preview. All URLs, keys, and Mongo instances are logically distinct.

---

## 10. Critical data inventory

Every collection currently in use, with its business meaning and criticality.

| Collection | What it stores | Business criticality | Loss consequence |
|---|---|---|---|
| `orders_v2` | Canonical PHILEON orders (order_number, items, canonical USD cents, shipping, payment_status, fulfillment_status, presentment snapshot, tokens) | **CRITICAL — HIGHEST** | Loss of order truth. Must be recoverable OR reconstructable from Stripe. |
| `webhook_events` | Stripe event IDs already processed (idempotency ledger) | **CRITICAL** | Restore without this can cause **duplicate email + duplicate side-effects** if webhooks are replayed. |
| `customers` | Customer records (email, addresses, marketing consent metadata, unsubscribe token) | HIGH | Loss = re-enter, but marketing eligibility and unsubscribe posture is regulatory-sensitive. |
| `marketing_consent` | Explicit affirmative opt-in rows (email, source, granted_at) | HIGH (regulatory) | Losing this row makes the customer **ineligible** for behavioral email — this is the safe default. |
| `email_suppression` | Unsubscribes (email, unsubscribed_at) | **CRITICAL (regulatory)** | Losing this can cause an already-unsubscribed customer to receive email again. Never blindly recover past this. |
| `behavior_events` | Anonymous + identified browse / wishlist / cart / checkout signals (30-day TTL for anonymous) | MEDIUM | Loss = retention engine restarts empty. Not customer-visible. |
| `retention_pending` | Queued behavioral email rows (email + product + intent_kind + earliest_send_at) | MEDIUM | Loss = re-queueing is safe because purchase suppression / caps still apply on next tick. |
| `behavior_send_log` | Simulated + live behavioral sends, one row per email (mode, email_type, product, created_at) | HIGH | This is the cap ledger. Losing it can cause frequency-cap re-flooding on a LIVE flip. |
| `session_identity` | Bind anonymous session_id → customer_email | LOW | Loss = anonymous events cannot be back-attributed. Non-critical. |
| `admins` | Admin usernames + password hashes | HIGH | Loss = re-seed from `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` env vars. |
| `customer_photos`, `inquiries`, `private_consultations`, `concierge_inquiries`, `testimonials`, `faqs`, `restock_list`, `site_settings`, `tryon_analytics`, `consultations`, `phileon_events`, `collections`, `products` | Legacy / low-traffic content and inquiry storage | LOW / LEGACY | Loss = re-enter or recreate. Not blocking checkout. |

**Notes**
- `orders_v2` is the **only** collection that MUST be aligned with Stripe on restore.
- `webhook_events` and `email_suppression` are the two "do-not-replay" ledgers.
- The retention collections are all built on **idempotency + cap ledgers**, so a full loss
  of retention collections is recoverable but requires care around `behavior_send_log`
  before flipping behavioral LIVE.

---

## 11. Authoritative source-of-truth map

| Domain | Source of truth | Never trust |
|---|---|---|
| Product prices (dynamic, e.g. Annie Rose, Rhythm Mesh) | `backend/services/pricing_engine_catalog.py` — server-side resolver, priced from a trusted metal-spot at resolve time | Any client-sent `price`, `unit_amount`, `subtotal_cents`, `total_cents` |
| Product prices (fixed, e.g. RIBBON REGALE, RETRO BRED) | Same file, `FIXED_PRODUCTS` block | Any client-sent price |
| Product catalog surface — public slugs | `ALL_SLUGS` in `services/pricing_engine_catalog.py` → **`PRODUCT_SLUGS = 73`** | Any hardcoded number in tests or PRD that treats 84 as "catalog count" |
| Checkout resolver surface — supported entry points | `_SUPPORTED_SLUGS` in `tests/test_full_checkout_audit.py` → **`CHECKOUT_SUPPORTED_FAMILIES = 84`** | Any code that treats 84 as "catalog count". Product slugs = 73, families = 84. They are different numbers. |
| Shipping money | `backend/services/shipping_zones.py` — canonical USD-cent rates | Any client-sent shipping cost |
| Payment status | Stripe (via signed webhook) + `webhook_events` idempotency ledger | The success-page redirect, `session_id` in URL, or client polling |
| Presentment currency / FX applied | Stripe (via `presentment_details` on Session / PaymentIntent) — persisted onto `orders_v2.presentment` | Any client-computed FX |
| Trusted CAD BNPL FX | `backend/services/fx_bnpl.py` at Session-create — snapshot recorded on the order | The display FX in `services/fx_display.py` (that is DISPLAY ONLY) |
| Display FX (approximate local prices only) | `backend/services/fx_display.py` via api.frankfurter.dev | Anything money-authoritative |
| Marketing consent | `marketing_consent` collection (explicit affirmative row) | `Customer.marketing_consent = True` legacy default (INSUFFICIENT — see PRD Q1=A) |
| Unsubscribe | `email_suppression` collection AND `customers.marketing_unsubscribed_at` | Anything cached client-side |
| Admin identity | `admins` collection + `JWT_SECRET` | `REACT_APP_ADMIN_*` env vars (frontend must not authenticate) |
| Order status token verification | `orders_v2.status_token_hash` (hash-only) | The plaintext token in URL or email (verified against hash) |
| Unsubscribe token verification | HMAC of `JWT_SECRET` over `<b64_email>.<b64_hmac>` | Anything not compared with `hmac.compare_digest` |
| Cron / scheduler authentication | `X-PHILEON-RETENTION-CRON` header vs `PHILEON_RETENTION_CRON_SECRET` (constant-time compare) | The admin JWT for scheduler use (works, but cron cred is scoped) |
| Historical CAD order `PHI-20260901-4CBC5C` | Persisted `orders_v2` document, canonical `currency=CAD total_cents=2265000 payment_status=paid` | Any migration to overwrite it |

---

## 12. Database backup architecture

**What the app itself contributes:**
- Every business-critical write is either **idempotent** (`orders_v2` updates keyed by
  `order_number` / `provider_session_id` / `provider_payment_intent_id`), or **guarded by
  a ledger** (`webhook_events` for Stripe, `behavior_send_log` for behavioral sends,
  `paid_notification_sent` / `shipping_notification_sent` / `customer_notification_sent`
  / `internal_review_notification_sent` flags for emails).
- There is **no destructive migration code** in the current codebase. Orders are
  append-only; updates are targeted; no `drop_collection` calls exist in production paths.
- The app **does not perform its own database backup**. Backup capability lives at the
  Emergent platform layer.

**What Emergent provides — OWNER TO VERIFY at Layer 2:**
The following capabilities cannot be proven from the project's own code and must be
confirmed with the Emergent platform:

- OWNER TO VERIFY — automatic Mongo snapshot **frequency** (daily? every N hours?).
- OWNER TO VERIFY — snapshot **retention period** (7 days? 30 days? longer?).
- OWNER TO VERIFY — whether **point-in-time restore** is available (vs snapshot-only).
- OWNER TO VERIFY — whether an **isolated restore** into a scratch database is supported
  (required for the safe "reconcile against Stripe truth before promoting" pattern).
- OWNER TO VERIFY — whether **deployment rollback** preserves environment secrets
  (`STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `JWT_SECRET`, `CUSTOMER_JWT_SECRET`,
  `PHILEON_RETENTION_CRON_SECRET`, `ADMIN_PASSWORD_HASH`).
- OWNER TO VERIFY — whether **static assets** shipped in `frontend/build/` are
  version-locked per deploy (needed so a code rollback also rolls back assets).

Until these are answered, treat backup coverage as **UNKNOWN** and rely on:
1. Stripe as the recoverable source of order truth.
2. Resend delivery logs as the recoverable source of email history.
3. `git log` on `/app` as the source of code truth.

## 13. Backup retention recommendation

Once Emergent capabilities are confirmed, target retention windows:

| Data class | Recommended retention floor | Rationale |
|---|---|---|
| `orders_v2` snapshots | **90 days** minimum, 1 year preferred | Refund / chargeback dispute windows (Stripe: up to 180 days; card networks: up to 540 days). |
| `webhook_events` snapshots | **90 days** minimum | Prevents duplicate processing during any restore. |
| `email_suppression` snapshots | **1 year** minimum | Regulatory / CAN-SPAM / CASL. |
| `marketing_consent` snapshots | **1 year** minimum | Regulatory: proof of opt-in. |
| Retention behavioral collections (`behavior_events`, `retention_pending`, `behavior_send_log`) | 30 days rolling is acceptable | 30-day anon TTL is enforced in-app already. |
| Environment secrets (owner-controlled) | Owner's password manager — indefinite | Not stored in-app. |

## 14. Backup ownership

- **Emergent platform** owns MongoDB and application snapshots (until verified otherwise
  in Layer 2).
- **The owner (Phill Wilson)** owns:
  - Stripe account backups (Stripe itself provides indefinite ledger of payments — this is
    the ultimate recovery source of truth for orders).
  - Resend account backups (delivery logs are retained by Resend per their plan).
  - Domain/DNS records (Bluehost — SPF/DKIM/return-path/DMARC).
  - Password manager (all real secrets, admin passwords, recovery codes).
  - Local copy of `/app` (if desired, via GitHub — direct users to the "Save to GitHub"
    feature in the platform).

## 15. Restore prerequisites

Before executing ANY restore:

1. **Freeze new writes.** In practice: pause the Stripe LIVE webhook endpoint in the
   Stripe Dashboard (do NOT delete it — pause) so no new `checkout.session.completed`
   events are consumed against a stale database.
2. **Snapshot the current (broken) database FIRST**, even if it is corrupted. Never
   overwrite the current state without keeping a copy. This is your rollback of the
   rollback.
3. **Restore into an isolated (scratch) Mongo instance**, not directly over production.
4. **Reconcile against Stripe** (see § 16) BEFORE promoting the restored data.
5. **Reconcile against Resend delivery logs** to know which customer emails already went
   out (see § 17).
6. **Re-arm the Stripe webhook endpoint** only after the restored database is at least as
   fresh as Stripe's view.

## 16. Order-safe recovery rules

> **Stripe remains authoritative for payment truth.**
> A restored database must NEVER be allowed to overwrite newer Stripe truth.

Rules:

1. If a Stripe payment exists but the restored DB has no matching `orders_v2` row,
   **do NOT create the row by replaying the webhook**. Instead, use the Single-Order
   Recovery Procedure in RECOVERY_RUNBOOK.md § "Single-order recovery" to insert a
   backfilled `orders_v2` row that preserves the original `order_number`,
   `provider_session_id`, `provider_payment_intent_id`, and canonical USD cents.
2. If the restored DB shows `payment_status=pending` but Stripe shows the payment
   succeeded, promote the DB row to match Stripe — never demote Stripe.
3. If the restored DB shows `payment_status=paid` but Stripe shows refunded, promote to
   `refunded` — never resurrect a refunded order as paid.
4. **NEVER delete historical orders as a rollback mechanism.**
5. Historical order `PHI-20260901-4CBC5C` (CAD, paid, Sep 1 2026) is a locked invariant.
   Any restore that would alter its `currency`, `total_cents`, or `payment_status` is
   invalid and must be halted.

## 17. Email-safe recovery rules

> **Never blindly replay all emails after a restore.**

Rules:

1. The `webhook_events` idempotency ledger is the primary firewall against duplicate
   customer emails. If it is intact after restore, replaying Stripe webhooks is safe.
2. If the ledger is lost, DO NOT let Stripe re-fire events. Instead, use the Webhook
   Recovery Plan (RECOVERY_RUNBOOK.md § webhook) to reconcile one order at a time.
3. The per-order idempotency flags (`paid_notification_sent`,
   `shipping_notification_sent`, `customer_notification_sent`,
   `internal_review_notification_sent`) are the second firewall. If they are intact
   after restore, `send_*_email` calls will be no-ops.
4. If all idempotency state is lost, **manually reconcile against Resend delivery logs**
   before re-arming the webhook. Set the four flags to `true` on any order for which
   Resend already delivered the corresponding email.
5. `email_suppression` MUST be re-hydrated before any email dispatch resumes. It is
   safer to send zero emails than to email an unsubscribed customer.

## 18. Behavioral-email recovery rules

> **Behavioral / lifecycle email is SIMULATION-only today.** These rules apply the moment
> `PHILEON_BEHAVIORAL_LIVE=true` is ever set.

Rules:

1. `behavior_send_log` counts BOTH `mode="simulated"` and `mode="live"` rows toward
   per-email frequency caps. This is intentional so a LIVE flip cannot cause a flood.
2. If `behavior_send_log` is lost during restore, DO NOT flip LIVE until the log is
   either restored OR the global launch cap (`PHILEON_BEHAVIORAL_GLOBAL_LAUNCH_CAP`,
   default 10 real sends per 24 h) is set to a very low number.
3. `retention_pending` rows are re-schedulable safely — they are gated by consent,
   suppression, and caps at tick time.
4. `marketing_consent` rows are the ONLY basis for behavioral eligibility. Legacy
   `Customer.marketing_consent = True` does not qualify.
5. **Never blindly run `/api/admin/retention/tick` after a restore** without verifying
   caps, suppression, and consent tables are intact.

## 19. Catalog / pricing source of truth

- Canonical catalog file: **`backend/services/pricing_engine_catalog.py`**.
- `PRICING_ENGINE_CATALOG` (dynamic metal-priced): **47** entries.
- `FIXED_PRODUCTS` (fixed USD): **24** entries.
- Specially-resolved products (`cresta-nera`, `her-eternal-reign`): **2** entries.
- **`PRODUCT_SLUGS = 73`** (public product slugs).
- **`CHECKOUT_SUPPORTED_FAMILIES = 84`** (checkout resolver entry points — includes the
  11 variant families that resolve to the same underlying slug).
- **Do not conflate these two numbers.** 73 ≠ 84. Each has a distinct meaning.
- Locked fixed prices (must not drift):
  - **RIBBON REGALE ÉDITION** — `$350 / $1,100 / $1,400 / $1,800 USD` (Plated / 10K / 14K / 18K).
  - **RETRO BRED** — `$4,500 / $8,000 / $9,000 USD` (Foundation / Signature / Heirloom).

## 20. Shipping source of truth

`backend/services/shipping_zones.py`. Canonical USD cents:

| Zone key | Countries | Rate (USD cents) |
|---|---|---|
| `CA` | Canada | `0` (complimentary) |
| `US` | United States | `3500` ($35) |
| `T1` | Tier-1 international (GB, DE, FR, JP, AU, …) | `6500` ($65) |
| `T2` | Tier-2 international (MX, BR, …) | `9500` ($95) |
| Signature-required threshold | Any country, when subtotal ≥ | `50000` USD cents ($500) |

Allowlist has 37 countries; Stripe `allowed_countries` on each Session matches the
selected destination only.

## 21. Tax status

- `automatic_tax=false` on every Stripe Session.
- `tax_cents=0` on every `orders_v2` document.
- Every catalog entry carries `tax_code = txcd_30060007` (Jewelry) for the future day
  when Stripe Tax is enabled.
- **GST / HST / VAT registration is a separate business-compliance track**, not an
  engineering blocker. Owner to decide before enabling Stripe Tax.

## 22. Current launch gates

The following gates are open (❌) or closed (✅). See STRIPE_LIVE_READINESS.md § 25 for
the full 26-row matrix.

- ✅ `STRIPE_MODE=test` in place.
- ✅ Adaptive Pricing TEST toggle on.
- ✅ CAD BNPL lane implemented (Option A, Frankfurter, trusted server-side).
- ✅ Idempotency ledgers in place (`webhook_events`, notification flags,
  `behavior_send_log`).
- ✅ Ring Size Guide, Order Status page, Admin Shipment UI, Admin Retention panel.
- ✅ Newsletter opt-in UI + explicit affirmative marketing consent.
- ✅ Behavioral engine complete + SIMULATION-locked.
- ✅ Lifecycle programs (welcome, browse, wishlist, cart, checkout, care) complete +
  SIMULATION-locked.
- ✅ Six-lifecycle preview artifacts rendered under
  `test_reports/retention_previews/`.
- ❌ `STRIPE_SECRET_KEY` LIVE — OWNER ACTION.
- ❌ `STRIPE_WEBHOOK_SECRET` LIVE — OWNER ACTION (create LIVE webhook endpoint).
- ❌ Adaptive Pricing **LIVE** toggle — OWNER ACTION in Stripe Dashboard.
- ❌ `CHECKOUT_SUCCESS_URL` / `CHECKOUT_CANCEL_URL` — production values.
- ❌ `REACT_APP_BACKEND_URL` — production origin.
- ❌ `PHILEON_ORDER_STATUS_URL_BASE` — currently preview URL; must be
  `https://www.getyourphileon.com` before any LIVE customer email.
- ❌ Resend PHILEON-owned sender domain with SPF + DKIM + return-path verified.
- ❌ `PHILEON_BEHAVIORAL_FROM_EMAIL` — dedicated behavioral subdomain sender.
- ❌ `PHILEON_BEHAVIORAL_LIVE=true` — hold until owner separately approves.
- ❌ Operational Maturity Layers 2–8.

## 23. Owner responsibilities vs engineering responsibilities

| Owner (Phill Wilson) | Engineering (E1 / future engineer) |
|---|---|
| Stripe Dashboard actions (keys, LIVE mode, Adaptive Pricing LIVE toggle, webhook endpoints, payment method eligibility) | Stripe SDK integration, Session-create logic, webhook signature verification, idempotency |
| Resend Dashboard actions (verify sender domain, SPF/DKIM DNS records, DMARC scoping) | Email template builders, sender separation, suppression enforcement |
| DNS records at Bluehost | — |
| Bluehost account | — |
| Emergent platform account (deploys, snapshots, rollback) | Deploy configuration in code, `/app/backend/.env` (structure only) |
| Password manager for ALL real secrets | Environment variable **names** documented in `ENVIRONMENT_REGISTRY.md` (no values) |
| MFA on every provider account | — |
| First LIVE transaction sign-off | Provide the run-book (see LAUNCH_DAY_CHECKLIST.md) |
| Refund decisions | Refund lifecycle handling in `charge.refunded` webhook |
| Business-compliance (GST/HST/VAT, sanctioned-country review) | Tax code metadata on every product, allowlist maintenance |
| Behavioral email LIVE approval | Behavioral engine correctness, LIVE-off default, global launch cap |

---

## APPENDIX A — quick file map

| Purpose | File |
|---|---|
| Backend entry | `backend/server.py` |
| Trusted catalog + resolver | `backend/services/pricing_engine_catalog.py`, `backend/services/catalog.py` |
| Money math (shipping) | `backend/services/shipping_zones.py` |
| Money math (BNPL FX) | `backend/services/fx_bnpl.py` |
| Display FX (approx only) | `backend/services/fx_display.py` |
| Order model | `backend/models_orders.py` |
| Retention model | `backend/models_retention.py` |
| Stripe webhook | `backend/routes/webhooks_stripe.py` |
| Stripe session create | `backend/routes/checkout.py` |
| Order emails (transactional) | `backend/services/order_emails.py` |
| Behavioral emails (lifecycle) | `backend/services/retention_emails.py` |
| Retention engine | `backend/services/retention_service.py` |
| Admin retention API | `backend/routes/admin_retention.py` |
| Admin orders API | `backend/routes/admin_orders.py` |
| Frontend entry / routes | `frontend/src/App.js` |
| Presentment / currency | `frontend/src/context/PresentmentContext.jsx` |
| Ring size guide | `frontend/src/components/SizeGuideModal.jsx` |
| Order status page | `frontend/src/pages/OrderStatusPage.jsx` |
| Admin shipments UI | `frontend/src/pages/admin/AdminShipments.jsx` |
| Admin retention UI | `frontend/src/pages/admin/AdminRetention.jsx` |

## APPENDIX B — what NOT to touch

- `PHI-20260901-4CBC5C` in `orders_v2`.
- `PRODUCT_SLUGS = 73`, `CHECKOUT_SUPPORTED_FAMILIES = 84`.
- Canonical USD.
- Locked prices: RIBBON REGALE (`350/1100/1400/1800`), RETRO BRED (`4500/8000/9000`).
- Shipping rates: `CA=0`, `US=3500`, `T1=6500`, `T2=9500` (USD cents).
- Signature threshold: `50000` USD cents.
- Tax OFF.
- `STRIPE_MODE=test` — until Gate 6 (LIVE activation) is explicitly authorized.
- `PHILEON_BEHAVIORAL_LIVE=false` — until behavioral LIVE is explicitly authorized.

---

## APPENDIX C — Fulfillment Operations (Layer 2)

Companion tables to the shipping / order sections above. Every rule here
is enforced server-side in `backend/routes/admin_orders.py` and the
`services/fulfillment.py` state machine — the admin panel is a
convenience surface, not a source of truth.

### C.1 — Canonical fulfillment state machine

The **operational** state lives on `orders_v2.fulfillment_status` (US
spelling, optional). It sits ON TOP of Stripe-truth `payment_status` and
the webhook-set `fulfilment_status` (BR spelling — untouched by admin).

```
                    ┌─────────────────┐
                    │ pending_review  │  ← Stripe webhook sets this OR
                    └────────┬────────┘     integrity holds keep it here
                             │
                     admin: /approve
                             ↓
              ┌───────────────────────────┐
              │ approved_for_fulfillment  │
              └───────────┬───────────────┘
                          │
                  admin: /prepare
                          ↓
                ┌─────────────────┐
                │  in_preparation │
                └────────┬────────┘
                          │
                  admin: /ready-to-ship
                          ↓
                ┌─────────────────┐
                │  ready_to_ship  │
                └────────┬────────┘
                          │
                  admin: /mark-shipped   (integrity-gated)
                          ↓
                ┌─────────────────┐
                │     shipped     │ ── admin: /correct-shipment (no email)
                └────────┬────────┘
                          │
                       (future — Layer 3)
                          ↓
                ┌─────────────────┐
                │    delivered    │  (terminal)
                └─────────────────┘

    ┌──────────┐  admin: /hold {reason}    ┌────────────┐
    │  any     │ ────────────────────────► │  on_hold   │
    │  active  │ ◄──────────────────────── │            │
    └──────────┘  admin: /release-hold    └────────────┘
                    (blocked if any integrity gate red)
```

### C.2 — Server-authoritative eligibility

`services.fulfillment.evaluate_eligibility()` is checked by every
state-advancing endpoint. An order is **eligible** iff **ALL** of:

- `payment_status ∈ {"paid", "authorized"}`
- `shipping_integrity_status ∈ {"", "ok"}`
- `presentment_integrity_status ∈ {"", "ok", None}`
- `payment_status` is not `failed / cancelled / refunded / partially_refunded / disputed`
- `fulfillment_status` is not `"on_hold"` and not `"cancelled"`
- `shipping.country` present AND (`shipping.service_label` OR `shipping.zone_key`) present

Missing any → **409 NOT_ELIGIBLE** with `reasons[]` and `requires{}` for
the admin panel to surface. **Owners cannot bypass an integrity hold
from the admin panel** — the two `*_integrity_status` fields are set by
the Stripe webhook only, and are resolved at the data source.

### C.3 — Admin fulfillment endpoints

| Endpoint | Purpose | Guards |
|---|---|---|
| `GET /api/admin/orders?status=…&q=…` | Fulfillment queue (needs_review / in_preparation / ready_to_ship / shipped / on_hold / cancelled / all) | JWT admin |
| `GET /api/admin/orders/{on}` | Order detail + eligibility verdict | JWT admin |
| `GET /api/admin/orders/{on}/audit` | Audit trail (newest first) | JWT admin |
| `POST /api/admin/orders/{on}/approve` | `→ approved_for_fulfillment` | eligibility + transition |
| `POST /api/admin/orders/{on}/prepare` | `approved → in_preparation` | eligibility + transition |
| `POST /api/admin/orders/{on}/ready-to-ship` | `in_preparation → ready_to_ship` | eligibility + transition |
| `POST /api/admin/orders/{on}/mark-shipped` | `→ shipped`, records carrier/tracking, sends email once | eligibility + payment paid + tracking sanitised |
| `POST /api/admin/orders/{on}/hold` | Manual `→ on_hold` with reason | payment paid + not shipped |
| `POST /api/admin/orders/{on}/release-hold` | `on_hold → pending_review` | eligibility (integrity green) |
| `POST /api/admin/orders/{on}/correct-shipment` | Owner correction post-ship, records prior + new values in audit | must be `shipped`, **never** re-sends email |

Every endpoint that mutates state writes an append-only row to the
`fulfillment_audit` collection with: order_number, action, previous
value, new value, actor, reason, timestamp, and a safety-filtered
`extra` block. **Money fields, Stripe IDs, tokens, and webhook event
IDs are stripped before audit insert.**

### C.4 — Double-shipment protection

`mark-shipped` uses `find_one_and_update({..., "shipping_notification_sent": {"$ne": True}}, ...)`.
Only the caller whose write flipped the flag sends the shipping
confirmation email. A duplicate call:

- returns `{ok: true, email_sent: false}`
- still updates the (idempotent) tracking metadata for support-case
  corrections
- writes an audit row with `action="mark_shipped_noop"`

### C.5 — Tracking URL helper

`services.fulfillment.build_tracking_url(carrier, tracking_number,
explicit_url=None)`:

1. If `explicit_url` starts with `http://` or `https://` → return it
   verbatim.
2. Else, canonical URL for known carriers: UPS, FedEx, DHL, Canada Post,
   USPS.
3. Else → `None` (UI shows the tracking number without a link).

`javascript:`, `data:`, `mailto:` explicit URLs are silently dropped —
`_size_label` / `_items_html` in `services/order_emails.py` provide the
same defense-in-depth on the email side.

### C.6 — Signature + insurance semantics

- `shipping.signature_required` — set at Session-create using the
  canonical USD subtotal against `SIGNATURE_REQUIRED_ABOVE_USD_CENTS =
  50 000`. Never recomputed from presentment currency.
- `shipping.insurance_required` — the fulfillment **requirement** (zone
  policy). NOT proof that insurance was purchased or that coverage is
  in force. The admin UI labels it as `REQUIRED · confirm at label
  purchase`. If proof-of-coverage tracking becomes necessary later, add
  an `insurance_confirmed_at` field — do NOT overload the existing flag.

### C.7 — Refund / cancellation interlock

- `payment_status ∈ {failed, cancelled, refunded, partially_refunded,
  disputed}` immediately fails eligibility.
- The webhook-side `charge.refunded` handler flips `payment_status →
  refunded / partially_refunded`. The next admin action then blocks
  automatically.
- **Do NOT** build a returns/RMA workflow in Layer 2 — that is Layer 3.

### C.8 — Daily fulfillment checklist (owner)

Read once per day, ideally at the start of the fulfillment window.

1. Open **Admin → Fulfillment** (`/admin/fulfillment`).
2. **Review new paid orders** — Needs Review tab.
3. **Check integrity holds** — orders with Shipping · Hold or
   Presentment · Hold pills. Resolve the underlying data issue in
   `orders_v2` / Stripe before any release.
4. **Confirm product / variant / size** against the order card.
5. **Confirm signature / insurance** requirement on the detail panel.
6. **Approve for Fulfillment** — advances to `approved_for_fulfillment`.
7. **Prepare** the jewelry at the bench. Click *In Preparation*.
8. **Pack**. Click *Ready to Ship*.
9. **Purchase / prepare shipment manually** — owner buys the label
   outside the system (no live carrier API in Layer 2).
10. **Enter carrier / tracking** on the Shipments page. The tracking
    URL is auto-built for UPS / FedEx / DHL / Canada Post / USPS.
11. **Mark Shipped**. Confirm the customer notification banner.
12. **Review held orders** — On Hold tab. Release only after root cause
    resolved.
13. **Close completed work** — Shipped tab reflects today's dispatch.

Every step above writes an audit row on the affected order. No step
requires the owner to touch money math, Stripe IDs, or webhook state.

### C.9 — What Layer 2 explicitly does NOT do

- No UPS / FedEx / DHL API integrations.
- No automatic label purchasing.
- No live carrier-rate shopping.
- No carrier delivery webhooks.
- No delivery-confirmation email.
- No return / RMA portal.
- No fraud scoring engine.
- No inventory allocation.
- No warehouse management.
- No VIP clienteling.

Those belong to Layer 3+ and MUST NOT be silently introduced through
Layer 2 changes.

---

## APPENDIX D — Returns / RMA / Refund Operations (Layer 3)

### D.1 — Locked return policy (owner-confirmed)

| Class | Rule |
|---|---|
| Eligible gold (10K / 14K / 18K / 22K / 24K / vermeil / gold-plated) | 30-day return window from confirmed delivery |
| Silver / Sterling Silver | **FINAL SALE** |
| Custom / bespoke / made-to-order | **FINAL SALE** |
| Engraved | **FINAL SALE** |
| Resized | **FINAL SALE** |
| Refund timing | 5–10 business days after inspection/approval |
| Non-refundable | outbound shipping · duties · taxes · brokerage/customs |
| Warranty | 12-month limited manufacturing warranty — SEPARATE from returns |

**Do not reinterpret these policies without owner approval.**

### D.2 — Canonical RMA state machine

```
             ┌─────────────┐
             │  requested  │  ← customer submitted (via order-status token)
             └──┬────────┬─┘
    admin:      │        │  admin: /authorize  →  authorized
    /deny       │        │
                ↓        ↓
             ┌───────┐  ┌────────────┐
             │denied │  │under_review│  ← warranty or unknown class
             └───────┘  └──┬────┬────┘
                            │    └─── admin: /verify-delivery { delivered_at }
                     admin: /authorize
                            ↓
                     ┌────────────┐
                     │ authorized │ ── admin: /deny → denied
                     └─────┬──────┘
                           │  admin: /receive
                           ↓
                     ┌───────────┐
                     │ received  │ ── admin: /inspect { pass|fail }
                     └─────┬─────┘
                           │
              ┌────────────┴────────────┐
              ↓                          ↓
   ┌────────────────────┐   ┌────────────────────┐
   │ inspection_passed  │   │ inspection_failed  │
   └───────┬────────────┘   └───┬────────────────┘
           │ admin: /refund      │ admin: /deny
           ↓                     ↓
   ┌───────────────────┐      ┌────────┐
   │ refund_approved   │      │ denied │
   └──────────┬────────┘      └────┬───┘
              │                     │
      Stripe charge.refunded        │
              ↓                     ↓
        ┌──────────┐          ┌────────┐
        │ refunded │──close──▶│ closed │
        └──────────┘          └────────┘
```

### D.3 — Server-authoritative eligibility

`services.returns_service.evaluate_item_eligibility()` returns
`(eligible, policy_class, reasons, owner_review_required,
return_window_expires_at)`. Rules:

1. `payment_status ∈ {paid, authorized}`, not `refunded`.
2. Policy class not in final-sale set (silver / custom / engraved / resized).
3. If policy class is `unknown` → `owner_review_required=true`,
   **never auto-denied**.
4. Delivery date (`delivered_at` or `shipped_at`) present. If missing →
   `owner_review_required=true` with reason `delivery_date_unverified`.
5. Now ≤ delivery + 30 days.

### D.4 — Policy classification (from order-item snapshot)

- `is_engraved` / `is_resized` / `is_custom` flags (if captured at order
  create) → those respective classes.
- Variant contains "custom / bespoke / atelier / made-to-order" → `custom`.
- Variant contains "silver / sterling" without gold hints → `silver`.
- Variant/karat/metal contains "gold / karat / 10K / 14K / 18K / 22K /
  24K / vermeil" → `eligible_gold`.
- Otherwise → `unknown` (routes to owner review).

**Missing metadata to capture in a future order-schema pass:**
- `is_engraved`, `is_resized`, `is_custom` at the line-item level.
- `delivered_at` (currently derived from `shipped_at`).

### D.5 — Customer flow (token-secured, no admin needed)

- `POST /api/returns/request { order_number, token, item_indices[], reason, note? }`
  — verifies the order's `status_token_hash`, creates one RMA case per
  active order (409 `ACTIVE_RMA_EXISTS` blocks duplicates), and routes
  warranty reasons (`arrived_damaged` / `suspected_defect`) to
  `under_review` automatically.
- `GET /api/returns/{rma}?order_number=…&token=…` — same token gate.
  Customer view surfaces only status, RMA number, item snapshot, and a
  human-readable message. **Never surfaces inspection notes, fraud
  flags, Stripe IDs, or admin identity.**

### D.6 — Admin endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/admin/returns?status=…&q=…` | Queue (new / under_review / authorized / received / inspection / refund / refunded / denied / closed / all) |
| `GET /api/admin/returns/{rma}` | Case detail + audit trail |
| `POST /api/admin/returns/{rma}/verify-delivery` | Owner records manually-verified delivery date; recomputes eligibility |
| `POST /api/admin/returns/{rma}/authorize` | `requested/under_review → authorized`, records optional return instructions |
| `POST /api/admin/returns/{rma}/deny { reason }` | Owner denies (from any pre-refund state) |
| `POST /api/admin/returns/{rma}/receive` | `authorized/in_transit → received` |
| `POST /api/admin/returns/{rma}/inspect { result:pass|fail, notes? }` | Records inspection outcome |
| `POST /api/admin/returns/{rma}/refund` | `inspection_passed → refund_approved`, computes trusted refund cents; Stripe execution deferred |
| `POST /api/admin/returns/{rma}/close` | Closes terminal or refunded case |

All admin endpoints require JWT. Every state-mutating call writes one
row to `returns_audit`. Money fields, Stripe IDs, tokens, and webhook
event IDs are stripped from `extra` before audit insert.

### D.7 — Refund calculation

`calculate_refund_cents(order, item_indices)` uses the ORIGINAL order
snapshot only. Never uses current catalog price, current FX, current
metal spot, or client-submitted amount. Covers merchandise only —
outbound shipping, tax, duties, brokerage are non-refundable per policy.

### D.8 — Stripe reconciliation

- `charge.refunded` webhook remains the single source of refund truth.
  Existing handler flips `payment_status → refunded / partially_refunded`
  idempotently via `webhook_event_ids`.
- Layer 3 addition: if any RMA case attached to the same order is in
  `refund_approved` or `refund_pending`, the webhook advances it to
  `refunded` and records `stripe_refund_id` + `stripe_refund_status` +
  `refund_confirmed_at`, plus a `webhook_refund_confirmed` audit row.
- **Admin never sets `payment_status = refunded`.** Only Stripe does,
  through the signed webhook.
- Historical order `PHI-20260901-4CBC5C` is refused with `409
  LOCKED_HISTORICAL_ORDER` if any admin attempts a refund against it.

### D.9 — Double-refund protection

- RMA state machine refuses `/refund` when `stripe_refund_id` is already
  set (409 `REFUND_ALREADY_ISSUED`).
- Webhook idempotency (`webhook_event_ids` compound index) prevents
  duplicate application of the same `charge.refunded` event.
- `email_sent` flags per case will gate future customer refund emails
  (email dispatch deferred to a hardened path).

### D.10 — Customer email templates (rendered only, not dispatched in Layer 3)

- `RETURN REQUEST RECEIVED` — status `requested`.
- `RETURN AUTHORIZED` — status `authorized`.
- `ITEM RECEIVED` — status `received`.
- `REFUND APPROVED` — status `refund_approved` (approval copy only).
- `REFUND ISSUED` — status `refunded` (only after Stripe-authoritative
  confirmation).
- `RETURN NOT ELIGIBLE / DENIED` — status `denied`.

Copy uses the locked 5–10 business-day refund window language. **No
promise of exact bank posting time.**

### D.11 — Daily return-management checklist (owner)

1. Open **Admin → Returns** (`/admin/returns`).
2. **New Requests** tab — review same-day submissions.
3. Cases needing **verified delivery date** — enter the carrier-confirmed
   date via the `Verify Delivery Date` control on the detail panel.
4. **Authorize** eligible returns and paste the current PHILEON return
   instructions (owner-configured).
5. When packages arrive → mark **Item Received**.
6. Perform inspection at the bench, record `PASS` or `FAIL` with notes.
7. On `PASS` → **Approve Refund** (Layer 3 records the trusted amount;
   Stripe execution is deferred).
8. On `FAIL` → **Deny** with clear reason.
9. Close cases once the `charge.refunded` webhook has confirmed
   Stripe-side or the denial has been communicated.

### D.12 — What Layer 3 explicitly does NOT do

- No automated return-label purchasing.
- No carrier return APIs.
- No automatic inspection.
- No automatic refund approval.
- No warranty repair-management system.
- No fraud scoring / chargeback evidence automation.
- No inventory restocking automation.
- No loyalty credits, store credit, or exchanges.
- No real customer emails (templates render only in this phase).
- No LIVE refund execution — Stripe stays TEST, and the refund endpoint
  refuses with `409 LIVE_REFUND_DISABLED_IN_LAYER_3` if `STRIPE_MODE`
  ever becomes live before a dedicated hardened refund pass.
