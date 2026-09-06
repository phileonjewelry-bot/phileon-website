# PHILEON — LAUNCH DAY CHECKLIST

**Use this document on the day of the first LIVE customer transaction.**
Companion docs: `OPERATIONS.md` · `RECOVERY_RUNBOOK.md` · `ENVIRONMENT_REGISTRY.md`.

Print it. Tick it off. Do not skip.

---

## PRE-LAUNCH

Owner + on-call engineer walk through the list together. Do not proceed to LAUNCH
unless every box is either ticked or has an explicit written waiver.

**Infrastructure**
- [ ] Production domain `https://www.getyourphileon.com` resolves and loads the homepage.
- [ ] HTTPS certificate is valid and green in the browser (no cert warnings).
- [ ] Production backend health responds: `curl https://<prod-origin>/api/health` returns
      HTTP 200.
- [ ] `curl https://<prod-origin>/api/checkout/health` returns exactly **84** supported
      products and canonical currency **USD**.

**Catalog + pricing invariants**
- [ ] `PRODUCT_SLUGS = 73` (public product slugs — from
      `backend/services/pricing_engine_catalog.ALL_SLUGS`).
- [ ] `CHECKOUT_SUPPORTED_FAMILIES = 84` (checkout resolver entry points — from
      `tests/test_full_checkout_audit._SUPPORTED_SLUGS`).
- [ ] Canonical currency = **USD** (verified in a live PDP response and in one Stripe
      test Session).
- [ ] Shipping rates unchanged: **CA = 0**, **US = 3500**, **T1 = 6500**, **T2 = 9500**
      (USD cents).
- [ ] Signature threshold unchanged: **50 000** USD cents ($500).
- [ ] Tax **OFF**: `automatic_tax=false` on every Session, `tax_cents=0` on every order.

**Email + DNS**
- [ ] Resend PHILEON-owned sender domain shows **verified** (SPF + DKIM + return-path)
      in the Resend Dashboard.
- [ ] `PHILEON_FROM_EMAIL` in prod `.env` points at the verified sender.
- [ ] One TEST transactional email delivered end-to-end to an owner-controlled inbox in
      the last 24 hours.

**Stripe LIVE credentials**
- [ ] `STRIPE_MODE=live` in production `.env`.
- [ ] `STRIPE_SECRET_KEY` populated with `sk_live_…` matching the intended Stripe
      account.
- [ ] `STRIPE_WEBHOOK_SECRET` populated with the LIVE `whsec_…` from the LIVE webhook
      endpoint.
- [ ] LIVE webhook endpoint exists in Stripe Dashboard → Developers → Webhooks, points
      at `https://<prod-origin>/api/webhooks/stripe`, and subscribes to
      `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
      `checkout.session.async_payment_failed`, `payment_intent.payment_failed`, and
      `charge.refunded`.
- [ ] "Send test event" from the LIVE endpoint in the Stripe Dashboard returns HTTP 200
      and creates exactly one row in `webhook_events`.

**Adaptive Pricing**
- [ ] Adaptive Pricing **LIVE** toggle is **ON** in Stripe Dashboard → Settings →
      Payments → Adaptive Pricing → Live mode. (If OFF: LIVE Sessions will still succeed
      in USD; non-USD customers will not see local currency on the Stripe hosted page.)

**Order status link**
- [ ] `PHILEON_ORDER_STATUS_URL_BASE=https://www.getyourphileon.com` in production
      `.env`. It is NOT the preview URL. This is a hard pre-launch gate.

**Behavioral email**
- [ ] `PHILEON_BEHAVIORAL_LIVE=false` in production `.env`. It stays FALSE for launch.
- [ ] `PHILEON_BEHAVIORAL_FROM_EMAIL` is either unset OR configured to a dedicated
      verified subdomain sender (e.g. `dispatch@mail.getyourphileon.com`).
- [ ] Behavioral LIVE will NOT be flipped on launch day. Owner + engineer both
      acknowledge.

**Backup / recovery state**
- [ ] Latest Mongo snapshot timestamp is known and < 24 h old (OWNER TO VERIFY at
      Layer 2).
- [ ] Emergent deploy rollback point for both frontend and backend is identified.
- [ ] Stripe webhook endpoint URL is copied into the incident notes (in case it needs to
      be paused).
- [ ] `RECOVERY_RUNBOOK.md` is open in a browser tab / printed / accessible from a
      phone.
- [ ] `PHI-20260901-4CBC5C` verified in `orders_v2` with `currency=CAD`,
      `total_cents=2265000`, `payment_status=paid` — untouched.

**Emergency stop rehearsal (in TEST mode, before LIVE flip):**
- [ ] Owner has practiced pausing the Stripe webhook endpoint from the Dashboard once.
- [ ] Owner has practiced flipping `STRIPE_MODE=test` in `.env` and restarting the
      backend once.

---

## LAUNCH

Sequence to actually go live. Do this as a coordinated action, not piecemeal.

1. Confirm every PRE-LAUNCH box is ticked.
2. Deploy production frontend + backend from the same known-good commit.
3. Verify: `curl https://<prod-origin>/api/health` and
   `curl https://<prod-origin>/api/checkout/health` both return 200 and the expected
   values.
4. **Owner announces launch** on their own channels (social, email, etc.). Do this AFTER
   step 3, not before.
5. On-call engineer stays available for at least the FIRST TRANSACTION window.

---

## FIRST TRANSACTION

The first LIVE customer transaction must be an **owner-controlled** transaction. This
verifies every link in the chain in production before any real customer is exposed.

**Canonical safest first LIVE piece:**
> **RIBBON REGALE ÉDITION — Gold-Plated Sterling Silver — $350 USD canonical.**

Fixed price, non-metal-drift, non-signature-tier, small ring-size-independent SKU.
Owner-controlled recipient email, owner-controlled shipping address, owner-controlled
real card.

**Only proceed after explicit owner approval.** Do not run the first LIVE transaction
"just to see." Announce it, execute it, verify it, refund it.

**Steps:**
1. Owner opens `https://www.getyourphileon.com/products/ribbon-regale-edition` in an
   ordinary browser (not the admin panel).
2. Owner adds Gold-Plated Sterling Silver to cart. Displayed canonical: `$350 USD`.
3. Owner proceeds to `/checkout`. Shipping country: **US** (verifies the paid $35
   shipping path) OR **CA** (verifies the free-shipping path).
4. Owner completes Stripe hosted checkout with a **real owner-controlled card**.
5. Owner does NOT use a wallet (Apple Pay / Google Pay / Link) for the first transaction.
6. Owner is redirected to the success page.

Do NOT dispatch the physical product until POST-TRANSACTION verification is complete
and the owner explicitly says "ship it" (or, more likely, refunds it immediately).

---

## POST-TRANSACTION

Verify every side-effect. Every checkbox must be YES before declaring the launch a
success.

**Stripe side**
- [ ] Exactly **one** payment in Stripe Dashboard → Payments matching the transaction,
      with the correct canonical amount and currency (`$350.00 USD` for the RRE
      Gold-Plated path).
- [ ] Payment status = `succeeded`.
- [ ] Payment method type is `card` (or the exact method used).
- [ ] Exactly **one** `checkout.session.completed` event in Stripe Dashboard → Events.

**Database side (`orders_v2`)**
- [ ] Exactly **one** new `orders_v2` document with the correct `order_number`
      (`PHI-YYYYMMDD-XXXXXX` format).
- [ ] `currency=USD`, `subtotal_cents=35000`, `shipping_cents=3500` (US) or `0` (CA),
      `tax_cents=0`, `total_cents = subtotal + shipping + tax`.
- [ ] `payment_status=paid`.
- [ ] `provider_session_id` matches the Stripe Session ID.
- [ ] `provider_payment_intent_id` matches the Stripe PaymentIntent ID.
- [ ] `presentment` block is **absent** for a USD-only path (only present when Stripe
      reports a non-USD presentment).

**Shipping integrity**
- [ ] `orders_v2.shipping.zone_key` matches the country entered.
- [ ] `orders_v2.shipping.country` matches.
- [ ] `orders_v2.shipping.service_label` and `carrier_label` populated.
- [ ] Trusted zone rate ($0 CA or $3500 US) matches the shipping cents recorded.

**Presentment integrity**
- [ ] For USD path: `orders_v2.presentment_integrity_status` is `null` (or absent).
- [ ] No FX rate is present on a USD-only order (would be a bug).

**Email side (Resend delivery logs)**
- [ ] Exactly **one** customer paid email delivered to the owner-controlled inbox.
- [ ] Email is from `PHILEON_FROM_EMAIL` (verified sender), not
      `onboarding@resend.dev`.
- [ ] Email `Subject` matches PHILEON template ("Your order — paid" or equivalent).
- [ ] Email does NOT show a canonical-USD leak next to a non-USD total (USD path so
      this is trivially satisfied; still verify).
- [ ] Email contains a valid "VIEW ORDER STATUS →" CTA pointing at
      `https://www.getyourphileon.com/orders/PHI-…/status?token=…`.
- [ ] Clicking the CTA loads the order status page and displays the correct fields (no
      internal IDs, no FX metadata, no Stripe session ID).
- [ ] Exactly **one** internal paid email delivered to
      `PHILEON_CONCIERGE_NOTIFICATION_EMAIL` (owner's inbox).

**Webhook idempotency**
- [ ] `webhook_events` contains exactly **one** new row for the transaction's Stripe
      `event.id`.
- [ ] `orders_v2.paid_notification_sent=true` after the paid email is delivered.
- [ ] No duplicate webhook processing observed (would show as two rows for the same
      `event.id` — must be zero).

**Integrity holds (should be inactive on a healthy launch transaction)**
- [ ] `customer_notification_sent` remains `false` (this flag is for the integrity-hold
      pre-paid email path, not the paid path).
- [ ] `internal_review_notification_sent` remains `false` unless a legitimate integrity
      trigger fired.
- [ ] Order does NOT show `presentment_integrity_status=pending_review` unless a
      legitimate reconciliation defect was detected.

**Refund cleanup (recommended)**
- [ ] Owner issues a full refund from Stripe Dashboard → Payments → the transaction →
      Refund.
- [ ] `charge.refunded` webhook processes.
- [ ] `orders_v2.payment_status=refunded`.
- [ ] No second customer email was sent for the refund (refund emails are not currently
      an implemented feature — this is expected).
- [ ] Physical product is NOT dispatched.

---

## EMERGENCY STOP

If any of the following fails during launch or first-transaction verification, **halt
new checkouts immediately** (see `RECOVERY_RUNBOOK.md § 20`) and investigate.

**Payment / security / data integrity failure**
> Stop checkout. Then investigate.
- Wrong amount charged.
- Wrong currency charged.
- Duplicate charge.
- Missing `orders_v2` row for a completed Stripe payment.
- Any customer-visible response contains a plaintext secret, session ID, or
  webhook metadata.

**Webhook state is uncertain**
> Preserve Stripe payment truth. Stop fulfillment. Investigate before replay.
- `webhook_events` shows no new row for a completed Stripe payment.
- Stripe webhook endpoint is returning non-200 responses.
- `payment_status` on `orders_v2` disagrees with Stripe.

**Email fails**
> Do NOT resend blindly. Reconcile against Resend logs first.
- Customer paid email not delivered.
- Duplicate paid emails delivered.
- Email leaks internal fields.

**Database fails**
> Stop checkout. Preserve Stripe records. Restore or reconcile safely.
- `pymongo` connection errors.
- 500s from `/api/checkout/*` due to Mongo unavailability.
- Order documents come back with unexpected types or missing fields.

**Wrong price appears**
> Stop the affected checkout path. Verify the trusted resolver. Do NOT alter historical
> orders.
- On-site PDP shows a price that does not match
  `POST /api/validate-cart` or `services.catalog.resolve_line_item`.

---

## ROLLBACK

If the launch itself needs to be rolled back:

1. **Pause the Stripe LIVE webhook endpoint** (do NOT delete it).
   Stripe Dashboard → Developers → Webhooks → the endpoint → Pause.
2. **Disable LIVE payment methods** in Stripe Dashboard → Settings → Payments (or use
   the code-side `CHECKOUT_ENABLED=false` gate — see `RECOVERY_RUNBOOK.md § 20`).
3. **Flip `STRIPE_MODE=test`** in production `backend/.env`. Restart backend.
4. **Roll back backend** to the last-known-good commit (`RECOVERY_RUNBOOK.md § 2`).
5. **Roll back frontend** to the last-known-good commit (`RECOVERY_RUNBOOK.md § 1`).
6. **Reconcile any in-flight LIVE orders against Stripe** (`RECOVERY_RUNBOOK.md § 22`).
7. **Do not resurrect the launch** until the failing gate is fixed and the entire
   PRE-LAUNCH checklist is walked through again.

---

## OWNER SIGN-OFF

At the end of launch day, the owner records the following:

- Launch date + time: __________________________
- First transaction ID (Stripe PaymentIntent): __________________________
- First `orders_v2.order_number`: __________________________
- First transaction outcome: PASSED / FAILED (circle one)
- If failed → root cause + rollback timestamp: __________________________
- Refund of first transaction issued? YES / NO
- Physical product dispatched? YES / NO (should be NO on the very first transaction)
- Owner name + signature: __________________________
- On-call engineer name + signature: __________________________

---

## LOCKED INVARIANTS (re-confirmed on launch day)

* `PRODUCT_SLUGS = 73`
* `CHECKOUT_SUPPORTED_FAMILIES = 84`
* Canonical currency = **USD**
* RIBBON REGALE ÉDITION = **$350 / $1,100 / $1,400 / $1,800 USD**
* RETRO BRED = **$4,500 / $8,000 / $9,000 USD**
* Shipping = **CA 0 / US 3500 / T1 6500 / T2 9500** (USD cents)
* Signature threshold = **50 000** USD cents
* Tax = **OFF**
* `STRIPE_MODE = live` (from launch onwards) — until then, `test`.
* `PHILEON_BEHAVIORAL_LIVE = false` — not flipped on launch day.
* Historical order **`PHI-20260901-4CBC5C` UNTOUCHED**.
