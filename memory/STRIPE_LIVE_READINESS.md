# PHILEON — SHIPPING-COUNTRY PREFILL + STRIPE LIVE READINESS AUDIT

Date: **Sep 3, 2026**  
Scope: One UX enhancement (shipping-country prefill) + read-only Stripe LIVE audit.  
LIVE remained OFF throughout. No real payment. No real customer email.

--------------------------------------------------------------------

## PART A — SHIPPING-COUNTRY PREFILL — RESULTS

### 1. Files changed
- `frontend/src/context/PresentmentContext.jsx` — expose `suggestedCountry` from the same `/api/i18n/currency-preview` response used for currency suggestion.
- `frontend/src/pages/Checkout.jsx` — new one-shot prefill effect: fires when `!shippingCountry && allowedCountries.length && presentment.initialised` and `suggestedCountry ∈ allowedCountries`. Manual selection always wins (source-of-truth).

No backend files changed. No new geo vendor added. Trusted shipping authority (`services/shipping_zones.py`) untouched.

### 2. Prefill smoke matrix (Playwright, `/api/i18n/currency-preview` mocked with geo)

| Geo | Prefilled `shipping_country` | Trusted quote (CAD-display example) |
|---|---|---|
| CA | `CA` | `Shipping — Complimentary · Standard Shipping — Canada` |
| US | `US` | `Shipping — Approx. C$49 CAD · Standard Shipping — United States` (canonical $35 USD) |
| GB | `GB` | `Shipping — Approx. C$91 CAD · International Standard — Tier 1` (canonical $65 USD) |
| MX | `MX` | `Shipping — Approx. C$132 CAD · International Standard — Tier 2` (canonical $95 USD) |
| BR | `BR` | Tier 2 (`$95 USD` canonical) |
| KP (not on allowlist) | *empty — user must pick manually* | none |

### 3. Manual override
Geo CA → prefilled CA → shopper manually selects US → shipping resolves US ($35 USD canonical). Currency stays CAD. No mutation to SKU, quantity, variant, canonical cents.

### 4. Currency / shipping independence
Verified in a single session: `currency=CAD` while `shipping_country` toggled US → CA → GB → MX. Currency never auto-changed. Shipping never auto-derived from currency.

### 5. Regression
`test_fx_display + test_i18n_routes + test_stripe_presentment_extractor + test_display_currency_trust_boundary + test_shipping_zones + test_shipping_quote_endpoint` — **120 pass / 0 fail**.

**PHILEON Shipping UX Phase 1 — LOCKED.**

--------------------------------------------------------------------

## PART B — STRIPE LIVE READINESS AUDIT (READ-ONLY)

### 10. Stripe LIVE credential readiness

| Field | Status | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` (test) | PRESENT | prefix `sk_test_…`, 107 chars |
| `STRIPE_PUBLISHABLE_KEY` (test) | **MISSING** | Not currently required — Checkout Session redirect flow does not use it. When Elements/PaymentSheet are introduced, publishable key becomes required. |
| `STRIPE_WEBHOOK_SECRET` (test) | PRESENT | prefix `whsec_…`, 38 chars |
| `STRIPE_MODE` | `test` | Enforced end-to-end |
| `stripe_api_verified` (health) | `true` | Live handshake with Stripe TEST works. |

**Owner actions to add later (all Dashboard-side):**
1. Generate `sk_live_…` LIVE secret key.
2. Generate `pk_live_…` LIVE publishable key (only if a Elements/Embedded flow is introduced; not required for current Checkout Session flow).
3. Create a LIVE webhook endpoint pointing at `{PROD_BACKEND}/api/webhooks/stripe`, obtain new `whsec_…` LIVE webhook secret.
4. Populate `.env` LIVE keys and flip `STRIPE_MODE=live` at the same commit as the LIVE credentials.

### 11. Adaptive Pricing LIVE status
- Adaptive Pricing **TEST = ON** (verified via `adaptive_pricing={"enabled": True}` on every `stripe.checkout.Session.create` — Stripe SDK 14.1.0 · API `2025-12-15.clover`).
- Adaptive Pricing **LIVE = OWNER DASHBOARD ACTION REQUIRED.** Stripe requires the LIVE-mode Adaptive Pricing toggle to be independently enabled on `Dashboard → Settings → Payments → Adaptive Pricing → Live mode`.
- Code path is version-tolerant: `InvalidRequestError` containing `"adaptive_pricing"` triggers a retry without the flag (LIVE session still creates in canonical USD if the toggle is off). No engineering blocker.

### 12. Production URL readiness

| URL | Current value | LIVE readiness |
|---|---|---|
| `success_url` | `_cfg("CHECKOUT_SUCCESS_URL", "https://labete-gallery.preview.emergentagent.com/checkout/success")` | **`CHECKOUT_SUCCESS_URL` env unset** — falls back to preview domain. **Must set to prod domain before LIVE.** |
| `cancel_url` | `_cfg("CHECKOUT_CANCEL_URL", "https://labete-gallery.preview.emergentagent.com/checkout/cancel")` | Same as above — set `CHECKOUT_CANCEL_URL` to prod. |
| Webhook callback | `POST {BACKEND}/api/webhooks/stripe` | Path is stable. Owner must create a LIVE endpoint in Stripe Dashboard pointing to prod domain. |
| `REACT_APP_BACKEND_URL` (frontend) | `https://labete-gallery.preview.emergentagent.com` | Preview URL. Prod deployment must use the prod origin. |
| HTTPS | ✅ preview URL is HTTPS; prod must be too | LIVE Adaptive Pricing + Apple Pay require HTTPS. |

No `localhost` embedded in any LIVE code path.

### 13. Webhook readiness

| Property | Status |
|---|---|
| Stripe signature verification | ✅ `stripe.Webhook.construct_event(...)` with `STRIPE_WEBHOOK_SECRET` |
| Event dedupe (idempotency) | ✅ `webhook_event_ids` compound-index on `orders_v2` guarantees single-apply |
| `checkout.session.completed` | ✅ handled (paid + integrity + shipping/presentment reconciliation) |
| `checkout.session.async_payment_succeeded` | ✅ handled — flips `paid` and dispatches `paid_notification` atomically |
| `checkout.session.async_payment_failed` / `payment_intent.payment_failed` | ✅ handled — records failure, no email |
| `charge.refunded` | ✅ handled — `payment_status → refunded / partially_refunded` |
| Shipping reconciliation | ✅ `_build_shipping_reconciliation` |
| Presentment reconciliation | ✅ `_build_presentment_block` (Stripe truth only) |
| Duplicate email prevention | ✅ Separate `customer_notification_sent`, `internal_review_notification_sent`, `paid_notification_sent` flags, all set via `find_one_and_update` with `modified_count` gating |
| Historical order immunity | ✅ Orders updated only by `order_number` OR `provider_session_id` OR `provider_payment_intent_id`. `PHI-20260901-4CBC5C` (CAD, paid, sept 1 2026) verified still `currency=CAD total_cents=2265000 payment_status=paid`. |

**Structurally LIVE-ready.** Owner action: add LIVE webhook endpoint in Dashboard, rotate `STRIPE_WEBHOOK_SECRET` to LIVE `whsec_…`.

### 14. Order creation readiness (would-be LIVE)
Every new session persists an `OrderV2` with:

| Field | Guaranteed value |
|---|---|
| `currency` | `USD` (canonical) |
| `subtotal_cents` | canonical resolver output |
| `shipping_cents` | trusted zone rate (0 / 3500 / 6500 / 9500) |
| `tax_cents` | `0` |
| `total_cents` | `subtotal + shipping + tax` |
| `shipping.zone_key/country/service_label/carrier_label/signature_required/insurance_required` | populated at session create |
| `presentment.*` | populated on webhook ONLY when Stripe reports a non-USD presentment |
| `payment_status` | `pending → paid / refunded / failed` |
| `customer_notification_sent` / `internal_review_notification_sent` / `paid_notification_sent` | idempotent booleans |
| `presentment_integrity_status` | `null` unless a genuine like-for-like reconciliation defect is detected |
| Historical orders (no presentment block) | deserialize cleanly |

### 15. Shipping LIVE readiness
- Zones locked: `CA=0`, `US=3500`, `T1=6500`, `T2=9500` USD cents.
- Signature threshold `SIGNATURE_REQUIRED_ABOVE_USD_CENTS=50000` — unchanged.
- `insurance_required` semantics — unchanged.
- `allowed_countries` allowlist has 37 entries (`CA`, `US`, `GB`, `DE`, `FR`, `MX`, `BR`, `JP`, `AU`, …).
- Session creation always sends exactly **one** trusted `shipping_option`; Stripe `allowed_countries=[shipping_country]` matches selected destination.
- No client-authoritative shipping. Money-injection fields (`fx_rate`, `presentment_amount`, `localized_unit_amount`, `localized_total`, `localized_shipping`, `conversion_amount`) rejected 422 by `extra="forbid"`.

### 16. Local currency LIVE readiness
- Six approved display currencies: **USD, CAD, GBP, EUR, AUD, JPY**.
- Server-side FX (`api.frankfurter.dev`, 6h fresh / 48h stale / canonical-USD final fallback) never blocks checkout.
- Non-USD display always labeled **`Approx. …`**. USD renders exact canonical.
- Stripe Adaptive Pricing is payment-authoritative; storefront FX is never consumed for money math.
- Currency selector persists 30 days (`phi_pres_currency` + `phi_pres_currency_expires` + `SameSite=Lax` cookie).
- First-visit ribbon appears only for auto-detected non-USD visitors who haven't manually chosen and haven't dismissed for 30 days.

**Owner Dashboard action required BEFORE international LIVE localization works:** enable **Adaptive Pricing → Live mode** in the Stripe Dashboard. Until then, non-USD LIVE customers still see Stripe presentment in USD (Approx local prices remain correct on-site, but Stripe Hosted Checkout will not offer local currency).

### 17. Tax status
- `automatic_tax=false` on every session (enforced).
- `tax_cents=0` on every order (enforced).
- PHILEON currently **unregistered for GST/HST** — flagged as a **separate business-compliance gate**, not an engineering blocker unless legally required before LIVE launch.
- All 84 canonical catalog entries carry `tax_code = txcd_30060007` (Jewelry) for the future day when Stripe Tax is enabled.

### 18. Email readiness

| Field | Status |
|---|---|
| `RESEND_API_KEY` | PRESENT (`re_…`, 36 chars) |
| `PHILEON_FROM_EMAIL` | **MISSING** — falls back to `onboarding@resend.dev` (Resend's shared sandbox sender). Fine for TEST; **must be replaced with a PHILEON-owned verified sender domain before LIVE.** |
| `PHILEON_CONCIERGE_NOTIFICATION_EMAIL` | PRESENT (`phileon.jewelry@gmail.com`) — internal recipient. |
| `PHILEON_ORDER_NOTIFICATION_EMAIL` | MISSING — falls through to concierge email; that's the desired behavior in code. |
| Customer paid email | ✅ `build_customer_paid_email` — TOTAL PAID uses Stripe authoritative presentment when available; canonical USD reference shown when Adaptive Pricing applied. |
| Customer PAYMENT RECEIVED (integrity hold) | ✅ `build_customer_payment_received_email` gated by `customer_notification_sent` |
| Internal paid notification | ✅ `build_internal_paid_notification` — shows both `Customer paid: C$X CAD` + `Canonical PHILEON order: $X USD` + ship-to + zone. |
| Internal REVIEW notification | ✅ `build_internal_integrity_review_notification` gated by `internal_review_notification_sent` |
| Sender-domain DNS status | **UNVERIFIED for prod.** Owner must add a PHILEON-owned domain (e.g. `orders@getyourphileon.com`) to Resend, complete SPF + DKIM DNS records, then set `PHILEON_FROM_EMAIL` accordingly. Without DKIM, LIVE customer receipts risk landing in spam. |

### 19. Payment methods
- `automatic_payment_methods={"enabled": True, "allow_redirects": "always"}` on every Session — Stripe auto-selects eligible methods (Card, Apple Pay, Google Pay, Link, Klarna, Afterpay, Affirm, …) based on Dashboard configuration and customer country/browser.
- Legacy fallback: retries with `payment_method_types=["card","apple_pay","google_pay"]` if API version rejects `automatic_payment_methods`.
- **Owner action:** verify LIVE-mode payment method eligibility on `Dashboard → Settings → Payments → Payment methods`. Same list works — no engineering change.

### 20. Checkout security posture

| Threat | Guard |
|---|---|
| Client injecting product price | Canonical resolver `services.catalog.resolve_line_item` re-derives every line-item amount server-side; client-sent `price` is ignored. |
| Client injecting shipping money | `ShippingQuoteIn` / `StripeSessionIn` are `extra="forbid"`; the client can only pass non-monetary `shipping_country`. Zone → rate is server-side. |
| Client injecting FX / presentment | Same `extra="forbid"` blocks `fx_rate`, `presentment_amount`, `localized_*`, `conversion_amount` (422). Optional `display_currency` is validated against 6-currency allowlist; unknown → 400 `INVALID_DISPLAY_CURRENCY`. |
| Client injecting tax | `tax_cents=0` hardcoded; `automatic_tax=false`. |
| Unsupported shipping country | Server rejects at both `shipping-quote` and `stripe/session` endpoints. |
| Webhook metadata tampering | Money never trusted from `metadata`; only `provider_session_id` / `provider_payment_intent_id` used for lookups. Reconciliation derives amounts from `session.amount_total`, `session.shipping_cost`, `presentment_details`. |
| Historical order mutation | Update queries filter by `order_number` OR `provider_session_id` OR `provider_payment_intent_id`. `PHI-20260901-4CBC5C` remains untouched. |
| Idempotency | Mongo unique index on `idempotency_key`; Stripe idempotency headers on session create. Webhook events deduped by ID + `find_one_and_update.modified_count`. |

### 21. Catalog / product integrity

| Check | Value |
|---|---|
| `services.catalog._SUPPORTED_SLUGS` count | **84** ✅ |
| RIBBON REGALE ÉDITION | Plated `$350` / 10K `$1,100` / 14K `$1,400` / 18K `$1,800` USD ✅ |
| RETRO BRED | Foundation `$4,500` / Signature `$8,000` / Heirloom `$9,000` USD ✅ |
| All 84 canonical product currencies | `USD` ✅ |
| No product accidentally excluded | `/api/checkout/health.supported_products` returns 84 slugs |

### 22. Customer-facing trust / policy pages
| Page | Status |
|---|---|
| Shipping | Rates page still mentions display in USD — consistent with canonical. Consider adding one line: "International shoppers may see local-currency approximate pricing; final local amount is confirmed at Stripe checkout." (Advisory, not a blocker.) |
| Returns / Warranty / Privacy / Terms | No material conflicts with checkout behavior. |
| Checkout disclosures | Adaptive Pricing note "Prices shown in {CUR} are approximate. Final local amount confirmed at secure checkout." is present on `/checkout` when non-USD. ✅ |

No policy rewrites recommended without explicit owner approval.

### 23. FIRST LIVE TRANSACTION PLAN — RECOMMENDED (DO NOT EXECUTE)

**Safest first-live piece:** `SCACCO MATTO — 10K Yellow Gold, Size 7` — canonical USD **$3,900**.  Rationale: fixed-price (no live-metal drift), single-metal SKU, in-stock, wide ring-size coverage, non-signature-tier (<$500), avoids high-value inventory risk. (If owner prefers a smaller test, the **RIBBON REGALE ÉDITION — Gold-Plated Silver** at `$350 USD` is even safer.)

Suggested run-book:
1. Owner-controlled recipient email (e.g. `orders@getyourphileon.com` alias) and owner-controlled physical shipping address.
2. Currency: **USD** (do not test with Adaptive Pricing until Dashboard LIVE toggle is confirmed).
3. Shipping country: **CA** (Complimentary — verifies free-zone path) OR **US** (verifies `$35` paid-shipping path).
4. Payment: an **owner-controlled real card** — no third-party wallet on first attempt.
5. Expected outcomes:
   - Stripe Session in LIVE mode with `currency=usd`, `amount_total = subtotal_cents + shipping_cents + 0`.
   - Webhook `checkout.session.completed` → `OrderV2.payment_status=paid`, `paid_notification_sent=true`, one customer email, one internal email.
   - `presentment` block remains absent (USD-only path).
6. **Verification pass:** inspect `orders_v2` document, Resend delivery logs (customer + internal), Stripe Dashboard payment record, shipping label creation flow.
7. **Optional refund cleanup:** issue a full refund from the Stripe Dashboard; webhook `charge.refunded` → `payment_status=refunded`. Do NOT ship the product physically.

### 24. ROLLBACK PLAN

| Action | Command / place |
|---|---|
| Disable LIVE checkout entirely | Set `STRIPE_MODE=test` in `backend/.env`, restart backend. Session creation immediately switches to TEST-only. Frontend needs no change. |
| Disable LIVE Adaptive Pricing | Dashboard → Payments → Adaptive Pricing → Live mode → OFF. Existing sessions unaffected. New LIVE sessions still succeed; Stripe presents in USD. |
| Roll back to TEST-only credentials | Revert `.env` LIVE keys, restart backend. Preserve LIVE webhook endpoint disabled/paused rather than deleted. |
| Halt new checkouts without deleting orders | Add a feature-flag `CHECKOUT_ENABLED=false` in `.env` and gate `create_stripe_session` on it (5-line addition; not shipped in this pass). Existing `OrderV2` records untouched. |
| Emergency data safety | `orders_v2` collection is append-only + idempotent; no destructive migrations planned. Historical `PHI-20260901-4CBC5C` and any other historical CAD orders remain untouched. |

--------------------------------------------------------------------

## 25. FINAL GO / NO-GO MATRIX

| # | Item | Status | GO / NO-GO | Owner action required | Engineering action required |
|---|---|---|---|---|---|
| 1 | Stripe TEST keys configured | ✅ | GO | – | – |
| 2 | Stripe LIVE secret + webhook keys | ❌ MISSING | **NO-GO** | Generate `sk_live_`, `whsec_` LIVE, populate `.env` | Restart backend |
| 3 | `stripe_api_verified` in TEST | ✅ | GO | – | – |
| 4 | Adaptive Pricing TEST | ✅ ON | GO | – | – |
| 5 | Adaptive Pricing LIVE | ⚠ Dashboard toggle | **NO-GO** | Enable in Stripe Dashboard (Live) | – |
| 6 | LIVE webhook endpoint | ❌ | **NO-GO** | Create in Dashboard, capture LIVE `whsec_` | – |
| 7 | Production `success_url` / `cancel_url` | ⚠ preview-domain fallbacks | **NO-GO** | Set `CHECKOUT_SUCCESS_URL` + `CHECKOUT_CANCEL_URL` to prod HTTPS | – |
| 8 | `REACT_APP_BACKEND_URL` for prod | ⚠ preview | **NO-GO** | Point at prod backend origin | – |
| 9 | Order creation schema | ✅ | GO | – | – |
| 10 | Shipping rates + allowlist | ✅ locked | GO | – | – |
| 11 | Shipping-country prefill (this pass) | ✅ | GO | – | – |
| 12 | Local currency (USD/CAD/GBP/EUR/AUD/JPY) display | ✅ | GO | – | – |
| 13 | Tax disabled | ✅ | GO (LIVE) | Registration is separate business gate | – |
| 14 | Resend TEST | ✅ | GO | – | – |
| 15 | Resend LIVE sender domain (`PHILEON_FROM_EMAIL`, SPF/DKIM) | ❌ | **NO-GO** | Verify PHILEON-owned domain in Resend; set `PHILEON_FROM_EMAIL` | – |
| 16 | Internal recipient (`PHILEON_CONCIERGE_NOTIFICATION_EMAIL`) | ✅ | GO | – | – |
| 17 | Payment methods (card/Apple/Google/Link/BNPL) | ✅ auto | GO | Verify Dashboard LIVE-mode payment method eligibility | – |
| 18 | Checkout security (money injection blocked) | ✅ | GO | – | – |
| 19 | Idempotency (session + webhook) | ✅ | GO | – | – |
| 20 | Notification idempotency (3 flags) | ✅ | GO | – | – |
| 21 | Integrity holds (shipping + presentment) | ✅ | GO | – | – |
| 22 | Historical orders immune | ✅ (`PHI-20260901-4CBC5C` verified) | GO | – | – |
| 23 | Catalog count = 84 | ✅ | GO | – | – |
| 24 | RRE + RETRO BRED canonical prices | ✅ | GO | – | – |
| 25 | Rollback plan documented | ✅ | GO | – | – |
| 26 | First-live-transaction plan | ✅ documented | Owner-approved when ready | – | – |

**Overall: STAY IN TEST until items 2, 5, 6, 7, 8, 15 are cleared.** All engineering blockers cleared; remaining gates are Dashboard / DNS / prod-config owner actions only.

--------------------------------------------------------------------

## 26. EXACT REMAINING OWNER ACTIONS BEFORE LIVE ACTIVATION

1. **Stripe Dashboard (LIVE mode)**
   1. Generate `sk_live_…` (Developers → API keys → LIVE). Store in `backend/.env` as `STRIPE_SECRET_KEY`.
   2. Enable **Adaptive Pricing → Live mode**.
   3. Verify LIVE **Payment methods** (Card + wallets + BNPL as desired).
   4. Create a LIVE **Webhook endpoint** at `POST {PROD_BACKEND}/api/webhooks/stripe`. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `payment_intent.payment_failed`, `charge.refunded`. Capture new `whsec_…` and set as `STRIPE_WEBHOOK_SECRET`.
2. **Environment configuration**
   1. Set `STRIPE_MODE=live`.
   2. Set `CHECKOUT_SUCCESS_URL=https://{prod-domain}/checkout/success`.
   3. Set `CHECKOUT_CANCEL_URL=https://{prod-domain}/checkout/cancel`.
   4. Set `REACT_APP_BACKEND_URL=https://{prod-backend-domain}`.
3. **Resend / DNS**
   1. Add PHILEON-owned sender domain (e.g. `getyourphileon.com`) in Resend.
   2. Publish SPF + DKIM records at your DNS provider.
   3. Set `PHILEON_FROM_EMAIL=orders@getyourphileon.com` (or the verified alias).
4. **First LIVE run-book** (see section 23) — with real-card, real-address, real-currency verification. Owner-controlled. Refund immediately after inspection.
5. **Business-compliance (separate track, not engineering-blocking):**
   - GST / HST / VAT registration decisions before enabling Stripe Tax.
   - Sanctioned-country review of the 37-country shipping allowlist.

--------------------------------------------------------------------

## LOCKED INVARIANTS RE-CONFIRMED
* Trusted catalog **84**
* Canonical currency **USD**
* Stripe mode **TEST**  ·  Stripe LIVE **OFF**
* Tax **OFF**
* Shipping CA `$0` · US `$35` · T1 `$65` · T2 `$95` USD cents
* Signature threshold `$500 USD cents = 50000`
* RRE `$350 / $1,100 / $1,400 / $1,800 USD`
* RETRO BRED `$4,500 / $8,000 / $9,000 USD`
* Historical order **`PHI-20260901-4CBC5C` UNTOUCHED** (`currency=CAD`, `total_cents=2265000`, `payment_status=paid`)

No real payment. No real customer email. Stripe LIVE was not enabled.
