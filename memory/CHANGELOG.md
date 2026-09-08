# PHILEON — Implementation Changelog

Detailed log of completed work. Newest first. See `/app/memory/PRD.md` for the governing roadmap and design philosophy.

---

## 2026-02 — Pre-Launch Operational Maturity

### 2026-02-17 — Layer 6: Concierge / Customer-Service Operations ✓
Coordination surface for the owner — NOT a CRM / helpdesk / VIP tool.
- New `services/concierge_cases_service.py` + `routes/concierge_cases.py`.
- New `concierge_cases` collection with `CON-YYYY-XXXXXX` identifiers,
  server-enforced 6-state case machine
  (`new · open · waiting_on_customer · waiting_on_phileon · resolved · closed`),
  owner-only priority (`normal · attention · urgent`),
  `next_action`, `follow_up_at`, `waiting_on`, retry-dedupe (15 min),
  append-only `admin_notes` + `contact_log`, append-only
  `concierge_cases_audit`.
- Admin surface (13 endpoints, all `verify_admin`): list, detail with
  audit, create manual case, status/priority/next-action/follow-up/
  waiting-on/notes/contact-log mutations, Customer 360 aggregation,
  order timeline, static message previews (copy-only, never sends).
- Customer surface: `POST /api/concierge/order-support` (order-linked
  intake, rate-limited 6/5min per token, retry-dedupe, category
  whitelist), `GET /api/concierge/order-support` (customer-safe list —
  masks priority, notes, next_action, follow_up_at, audit).
- Contact-form bridge: `POST /api/inquiries` now also mirrors the
  submission into `concierge_cases` (source=`contact_form`,
  category mapped from `inquiry_type`). Bridge failures never break
  customer intake.
- Customer 360 aggregates orders / cases / RMAs / disputes / consent
  by normalized email — never collapses Gmail dots / plus aliases /
  unrelated addresses. Never surfaces `status_token_hash`,
  `email_status_token`, `provider_payment_intent_id`,
  `stripe_customer_id`, dispute evidence, or webhook payloads.
- Unified order timeline aggregates `orders_v2` + `fulfillment_audit`
  + `returns` + `dispute_cases` + `concierge_cases` — de-duplicates
  by `(event, iso_timestamp)`, sorts chronologically, fabricates
  nothing.
- Deep-link only: concierge NEVER duplicates a shipment / refund /
  fraud / inventory mutation control. Layer 2/3/4/5 authority
  untouched.
- Frontend: new `/admin/concierge-cases` page with tabs
  (NEW · OPEN · WAITING ON CUSTOMER · WAITING ON PHILEON ·
  RESOLVED · CLOSED · ALL), priority + source filters, search,
  manual-case creator, detail panel with status/priority/next-action/
  follow-up/waiting-on/notes/contact-log/message-previews/customer-360/
  timeline/audit. Mobile-safe (390×844 verified — zero overflow).
  Sidebar link added (LifeBuoy icon). Existing `/admin/concierge`
  (product intake inbox) preserved untouched.
- Frontend: new `components/OrderSupportCta.jsx` wired into
  `OrderStatusPage.jsx` — order-linked support intake below the
  return block, category dropdown + subject + message, customer-safe
  status pill on returning visits.
- 20 new Layer-6 tests all pass; 117-test focused Layer 3/4/5/6
  regression all green; 1286 full-suite tests pass (pre-existing 17
  test_phileon_api.py external-URL + 1 owner-accepted Annie Rose
  drift + 1 pre-existing adaptive-pricing external-URL, all unchanged
  from baseline).
- Files added: `backend/services/concierge_cases_service.py`,
  `backend/routes/concierge_cases.py`,
  `backend/tests/test_layer6_concierge_cases.py`,
  `frontend/src/pages/admin/AdminConciergeCases.jsx`,
  `frontend/src/components/OrderSupportCta.jsx`.
- Files modified: `backend/server.py`,
  `frontend/src/App.js`, `frontend/src/pages/OrderStatusPage.jsx`,
  `frontend/src/components/layout/AdminLayout.jsx`,
  `memory/OPERATIONS.md`, `memory/CHANGELOG.md`, `memory/PRD.md`.
- Locked invariants intact: PRODUCT_SLUGS=73,
  CHECKOUT_SUPPORTED_FAMILIES=84, USD, tax OFF, STRIPE_MODE=test,
  PHILEON_BEHAVIORAL_LIVE=false, `chargeback_lost` distinct from
  `refunded`, Vault stock untouched, PHI-20260901-4CBC5C untouched.
- No real payment. No real refund. No real customer email. No deploy.

### 2026-02-17 — Layer 5 STOCK-SAFETY CORRECTION: no implicit startup seed ✓
Enforced: normal server startup / deploy / DB restore NEVER creates
physical inventory.
- Removed automatic invocation of `initialize_vault_one_of_one()`
  from `server.py` startup path. Startup now only ensures indexes.
  A defensive comment in the startup block documents why the seed
  is NOT invoked.
- `initialize_vault_one_of_one()` kept as an explicit
  owner-authorized recovery/maintenance utility with a strong
  ⚠️ docstring warning against implicit invocation.
- The 14 already-initialized Vault records remain untouched; all
  still resolve `state=ready_to_ship` publicly.
- Missing / deleted / never-created Vault records fail closed to
  `state=unavailable` (CURRENTLY UNAVAILABLE) — a hypothetical
  future Vault slug added to the pricing catalog will NOT receive
  auto-stock.
- 5 new safety tests: source-level guard against re-attaching the
  seed to startup; missing-record fail-closed; sold-piece survives
  simulated restart (and second explicit seed attempt); future
  Vault slug never auto-stocked; deleted-record never
  auto-recreated by resolver/reservation reads.
- 44 Layer 5 tests all pass. 1277 full-suite tests pass (1
  pre-existing Annie Rose drift only).
- Files: `backend/server.py`,
  `backend/services/inventory_service.py`,
  `backend/tests/test_layer5_inventory.py`,
  `memory/OPERATIONS.md`, `memory/RECOVERY_RUNBOOK.md`,
  `memory/PRD.md`, `memory/CHANGELOG.md`.
- Locked invariants intact: PRODUCT_SLUGS=73,
  CHECKOUT_SUPPORTED_FAMILIES=84, USD, tax OFF, STRIPE_MODE=test,
  PHILEON_BEHAVIORAL_LIVE=false, `chargeback_lost` distinct from
  `refunded`, PHI-20260901-4CBC5C untouched.

### 2026-02-17 — Layer 5 FINAL OWNER-STOCK INITIALIZATION: one-of-one Vault ✓
Owner-authoritative physical inventory seeded.
- Every current Inspiration Vault piece is one-of-one physical stock:
  `stock_on_hand=1`, `stock_reserved=0`, `ready_to_ship`. No per-
  size/metal/karat sub-records — one canonical `inventory_key` per
  physical piece.
- New `services.inventory_service.initialize_vault_one_of_one()` +
  startup hook in `server.py`. Idempotent: only INSERTS when a
  canonical record is missing. Never overwrites existing stock,
  never resurrects a sold-out piece across restarts.
- 14 records seeded in production DB (verified). All 14 public URLs
  (canonical + aliases including `gold-theory-ribbon`→
  `iv-ribbon-regale`) resolve `state=ready_to_ship, available=true`.
- 6 new tests: seed correctness, seed idempotency + non-resurrection,
  sale flow (1→1/1→0/0 SOLD OUT), abandoned checkout flow (release
  restores READY TO SHIP), alias shares single stock pool,
  one-of-one concurrency (8 racers → 1 winner, 7 OUT_OF_STOCK).
  39 Layer 5 tests all pass. 1272 full-suite tests pass (1 pre-existing
  Annie Rose drift only).
- Locked invariants intact: PRODUCT_SLUGS=73,
  CHECKOUT_SUPPORTED_FAMILIES=84, USD, tax OFF, STRIPE_MODE=test,
  PHILEON_BEHAVIORAL_LIVE=false, `chargeback_lost` distinct from
  `refunded`, PHI-20260901-4CBC5C untouched.
- Files touched: `backend/services/inventory_service.py`,
  `backend/server.py`, `backend/tests/test_layer5_inventory.py`,
  `memory/OPERATIONS.md`, `memory/PRD.md`, `memory/CHANGELOG.md`.

### 2026-02-17 — Layer 5 FINAL COMPLETION PASS: Vault customer truth + PDP wiring ✓
Three customer-facing gaps closed:
- **Vault no-record → CURRENTLY UNAVAILABLE (never MADE TO ORDER).**
  `_derive_customer_state()` now takes `is_vault` and refuses the
  default "made_to_order" path for a Vault slug with no owner record;
  `try_reserve()` refuses the same case with `kind="unavailable"`,
  blocking checkout. Non-Vault behavior unchanged (`made_to_order`
  default).
- **Public URL slug → canonical `iv-*` mapping authority.** New
  `services.inventory_service.VAULT_PUBLIC_ALIASES` + `resolve_canonical_slug()`.
  `canonical_identity()` runs every incoming slug through the resolver
  before computing `inventory_key`, so `altar`, `iv-altar`,
  `ribbon-regale`, and `gold-theory-ribbon` all share their canonical
  stock pool. No duplicate inventory records possible.
- **AvailabilityBadge wired into every Vault PDP.** New
  `components/VaultRouteBadge.jsx` — route-aware, mounted once at the
  BrowserRouter root in `App.js`. Reads `pathname`, extracts the
  Vault alias, calls `POST /api/availability/resolve` with the alias
  (server resolves canonical), renders exactly one of READY TO SHIP /
  SOLD OUT / CURRENTLY UNAVAILABLE (never MADE TO ORDER for a Vault
  URL). All 14 canonical iv-* slugs mapped, plus `gold-theory-ribbon`
  legacy alias. Editorial-only Vault URLs without inventory identity
  are intentionally excluded.
- 8 new completion-pass tests; the previously-broken `test_A_default`
  was updated to reflect the new Vault semantics. 33 Layer 5 tests
  all pass. `test_full_checkout_audit` iv-* fixtures updated to
  expect the new `409 UNAVAILABLE`. 1266 full-suite tests pass (1
  pre-existing Annie Rose drift only).
- Files added: `frontend/src/components/VaultRouteBadge.jsx`.
- Files modified: `backend/services/inventory_service.py`,
  `backend/routes/availability.py`,
  `backend/tests/test_layer5_inventory.py`,
  `backend/tests/test_full_checkout_audit.py`,
  `frontend/src/App.js`,
  `frontend/src/components/AvailabilityBadge.jsx` (new
  `VaultAvailabilityGate` helper),
  `memory/OPERATIONS.md`, `memory/PRD.md`, `memory/CHANGELOG.md`.
- Locked invariants intact: PRODUCT_SLUGS=73,
  CHECKOUT_SUPPORTED_FAMILIES=84, USD, tax OFF, STRIPE_MODE=test,
  PHILEON_BEHAVIORAL_LIVE=false, `chargeback_lost` distinct from
  `refunded`, PHI-20260901-4CBC5C untouched.

### 2026-02-17 — Layer 5 COMPLETION PASS: Vault restriction + Admin UI ✓
Owner rule enforced: **The Inspiration Vault is the ONLY PHILEON
collection that may be `ready_to_ship`.**
- `services/inventory_service.py`: added `is_inspiration_vault_slug()`
  helper derived from `pricing_engine_catalog.FIXED_PRODUCTS` (`iv-*`
  prefix, 14 slugs). `upsert_inventory` refuses
  `mode=ready_to_ship` for non-Vault slugs with
  `READY_TO_SHIP_RESTRICTED_TO_INSPIRATION_VAULT`.
- `routes/admin_inventory.py`: surfaces the specific 409 code; adds
  `GET /api/admin/inventory/vault-slugs` and `?vault_only=true`
  filter; serializes `is_inspiration_vault` per row.
- `routes/availability.py`: public payload includes
  `is_inspiration_vault` metadata (already-public via URL / catalog).
- Frontend admin UI: new `/admin/inventory` page (AdminInventory.jsx)
  with All / Vault / Made to Order / Ready to Ship / Low Stock /
  Sold Out / Unavailable tabs; owner can upsert Vault pieces, adjust
  stock with mandatory reason, mark unavailable / re-enable, view
  audit history. Sidebar link added.
- Frontend customer UI: reusable `AvailabilityBadge` + `useAvailability`
  hook consuming `POST /api/availability/resolve`. Renders only
  MADE TO ORDER / READY TO SHIP / SOLD OUT / CURRENTLY UNAVAILABLE.
  Never exposes counts or fake scarcity. Ready to drop into any PDP.
- 10 new completion-pass tests (Vault membership authority, non-Vault
  ready_to_ship rejection, Vault sold_out derivation, no fabricated
  stock, customer API isolation, made-to-order return no-auto-Vault,
  etc.). 27 Layer 5 tests all pass. 1261 full-suite tests pass (1
  pre-existing owner-accepted Annie Rose drift).
- Docs: `OPERATIONS.md` Layer 5 chapter now names the 14 Vault slugs
  and documents the server-side restriction.
- Files touched: `backend/services/inventory_service.py`,
  `backend/routes/admin_inventory.py`, `backend/routes/availability.py`,
  `backend/tests/test_layer5_inventory.py`,
  `frontend/src/App.js`, `frontend/src/components/layout/AdminLayout.jsx`,
  `frontend/src/pages/admin/AdminInventory.jsx`,
  `frontend/src/components/AvailabilityBadge.jsx`,
  `memory/OPERATIONS.md`, `memory/PRD.md`, `memory/CHANGELOG.md`.
- Locked invariants intact: PRODUCT_SLUGS=73,
  CHECKOUT_SUPPORTED_FAMILIES=84, USD, tax OFF, STRIPE_MODE=test,
  PHILEON_BEHAVIORAL_LIVE=false, `chargeback_lost` distinct from
  `refunded`, PHI-20260901-4CBC5C untouched.

### 2026-02-17 — Layer 5: Inventory & Availability Control ✓
Server-authoritative inventory subsystem shipped.
- New `services/inventory_service.py` with deterministic
  `compute_inventory_key = sha256(canonical_identity)[:32]` over
  normalized (slug, variant, karat, metal_colour, ring_size).
- Atomic reservation via single-op Mongo `updateOne` guarded by
  `$expr:{$gte:[{$subtract:["$stock_on_hand","$stock_reserved"]}, qty]}`.
  Real concurrency test (8 concurrent reservers against stock=1)
  proves exactly-one-winner semantics under real Mongo.
- Reservation lifecycle `held → committed / released` wired to Stripe:
  `session.completed`+paid / `async_payment_succeeded` → commit;
  `async_payment_failed` / `session.expired` → release. New
  `checkout.session.expired` webhook handler added (was missing).
  `payment_intent.payment_failed` never auto-releases (Session may
  retry). `charge.refunded` and `charge.dispute.*` never touch stock.
- Admin API `/api/admin/inventory` (list/upsert/adjust/
  mark-unavailable/re-enable/audit/reconcile-stale) — JWT gated,
  audit-logged, idempotent.
- RMA restock bridge `POST /api/admin/returns/{rma}/restock` —
  the ONLY path that increases physical stock from a return. Refuses
  `custom/engraved/resized_final_sale`; idempotent per
  `(rma_number, item_ref)`.
- Customer availability API `POST /api/availability/resolve` public.
  Returns only `{slug, state, available, mode}` — never exposes
  counts, notes, reservation IDs, or session IDs.
- 17 new Layer 5 tests all pass; 1251 full-suite tests pass (1 owner-
  accepted historical drift).
- Docs: `OPERATIONS.md` Layer 5 chapter + owner daily checklist,
  `RECOVERY_RUNBOOK.md` inventory recovery / DB restore / suspected
  oversale.
- Files added: `backend/services/inventory_service.py`,
  `backend/routes/admin_inventory.py`, `backend/routes/availability.py`,
  `backend/tests/test_layer5_inventory.py`.
- Files modified: `backend/routes/checkout.py`,
  `backend/routes/webhooks_stripe.py`, `backend/routes/returns.py`,
  `backend/server.py`.
- Locked invariants intact: PRODUCT_SLUGS=73,
  CHECKOUT_SUPPORTED_FAMILIES=84, USD, tax OFF, STRIPE_MODE=test,
  PHILEON_BEHAVIORAL_LIVE=false, PHI-20260901-4CBC5C untouched,
  shipping / signature / adaptive pricing unchanged.

### 2026-02-17 — Layer 4 SEMANTIC CORRECTION ✓
Chargeback-loss ≠ merchant refund. A LOST Stripe dispute no longer
sets `payment_status = "refunded"`. New canonical state:
`payment_status = "chargeback_lost"`.
- `models_orders.py`: enum comment extended to include `chargeback_lost`.
- `services/fulfillment.py`: `chargeback_lost` added to
  `_TERMINAL_BAD_PAYMENT_STATES` — fulfillment is permanently blocked
  with reason `payment_chargeback_lost`.
- `services/returns_service.py`: return-eligibility now reports
  distinct reason `chargeback_lost_blocks_refund` (never
  `already_fully_refunded`).
- `routes/returns.py::approve_refund`: explicit
  `409 CHARGEBACK_LOST_BLOCKS_REFUND` guard.
- `routes/webhooks_stripe.py::charge.dispute.closed=lost` sets
  `payment_status="chargeback_lost"`. No `stripe_refund_id` is
  fabricated. No refund-issued email is emitted.
- 5 new tests (`test_layer4_completion.py`): eligibility block,
  return eligibility distinct reason, approve-refund guard, webhook
  branch invariant, customer payload projection isolation.
- 112 focused L2/L3/L4 tests pass. 1234 full-suite tests pass
  (2 owner-accepted pre-existing drifts unchanged).

### 2026-02-17 — Layer 4 FINAL SIGN-OFF PASS ✓
Three verification-driven regressions resolved before Layer 4 lock:
- Webhook (`charge.dispute.closed`) now reconciles `payment_status` on
  terminal outcomes: WON / `warning_closed` / `charge_dismissed` restore
  `payment_status="paid"` (funds returned to merchant); LOST sets
  `payment_status="refunded"` (chargeback reversed funds). Order-level
  `fraud_review_status` unchanged (`review_required` for WON,
  `blocked` for LOST). This is what lets a WON + owner-cleared order
  become fulfillment-eligible again under ordinary Layer 2 rules
  (Test I, Test M).
- `POST /api/admin/orders/{on}/clear-fraud-hold` now refuses with
  `409 LOST_DISPUTE_BLOCK` when the order carries a
  Stripe-authoritative LOST dispute. Same rejection added to
  `POST /api/admin/disputes/{case_id}/release-fraud-hold` (Test K).
- Added canonical `services.disputes_service.has_active_dispute(db, on)`
  helper (Section 7). ACTIVE = `needs_response`, `under_review`,
  `warning_needs_response`, `warning_under_review`. TERMINAL = `won`,
  `lost`, `warning_closed`, `charge_dismissed`, `charge_refunded`.
- RMA `/approve-refund` refactored to use `has_active_dispute()` as
  the primary interlock; `payment_status="disputed"` retained as
  defensive belt-and-suspenders check.
- 8 new/updated Layer 4 completion tests. 107 focused Layer 2/3/4
  tests pass. 1229 full-suite tests pass (2 owner-accepted historical
  drifts unchanged).
- Files: `backend/services/disputes_service.py`,
  `backend/routes/webhooks_stripe.py`,
  `backend/routes/admin_orders.py`,
  `backend/routes/admin_disputes.py`,
  `backend/routes/returns.py`,
  `backend/tests/test_layer4_completion.py`,
  `memory/OPERATIONS.md`.
- Locked invariants intact: PRODUCT_SLUGS=73, CHECKOUT_SUPPORTED_FAMILIES=84,
  USD canonical, tax OFF, STRIPE_MODE=test, PHILEON_BEHAVIORAL_LIVE unset (false),
  PHI-20260901-4CBC5C untouched.

---

## 2026-02 — Inspiration Vault & Shop Consolidation

### 2026-02-17 — Shop Catalog Consolidation (P1 ✓)
Moved `CORE_PRODUCTS` (~720 lines, 47 entries) from `ShopDropPage.jsx` into `/app/frontend/src/data/products.js` as `export const catalogProducts`. Added `getCatalogList({…})` helper for filtering. Deleted `formatPrice` helper and `DROP_PRODUCTS` placeholder array (Eclipse Ring, Celestial Band, Serpent Coil — random Unsplash teasers). Updated `useEffect` to source from `catalogProducts`. **Result**: ShopDropPage 1,454 → 689 lines (−53%). Single source of truth — adding a new shop product = one entry, one file. Backend `/api/products` left untouched per spec.

### 2026-02-17 — Viridian Teardrops hero correction + gallery label removal
Swapped `hero.jpg` ↔ `observation.jpg` to display the editorial two-earring shot on black instead of the single-earring close-up. Stripped all `№01 · Object` style caption pills from gallery cells (4 stills + Motion video cell). Vault index card poster auto-corrected via shared filename.

### 2026-02-17 — VIRIDIAN TEARDROPS · Vault piece (#06)
Editorial Film studio pair + 5-cell gallery (Object · Observation · Craft · Scale · Motion). Universal `VaultHero` template with looping hero video (H.264 720×720, 18s, 4.2MB, audio stripped). $120 USD · Rhodium-Plated Alloy · Pear-Cut CZ · Emerald Pavé · White CZ Halo. Routes `/viridian-teardrops` + `/inspiration-vault/viridian-teardrops`. Pricing synced across `products.js`, `livePricingConfig.js`, `pricing_engine.py`. Closing quote: *"Some pieces are worn. Others are remembered."*

### 2026-02-17 — Editorial Film badge + Vault scarcity line
**Badge**: small gold ▶ glyph + "Editorial Film" pill (Cinzel 9.5px, top-right) on Vault index cards with `heroVideo` (Viridian, Prismatic Laurel, Liaison, Noir Cadence). Default opacity .62 → 1.0 on hover. No pulse. **Scarcity**: "Available until the Vault closes." pill added to shared `VaultHero` — auto-renders on every Vault product page.

### 2026-02-17 — Vault index cards static-only
Replaced `heroVideo ? <video> : <img>` conditional with a single static `<img>`. Zero `<video>` elements on the index. `heroVideo` reserved exclusively for product detail page hero. Detail-page autoplay/loop/mute preserved.

### 2026-02-16/17 — Universal VaultHero + Category Navigation
Created `/app/frontend/src/components/VaultHero.jsx` — single source of truth for every Vault product hero. Image → 1.7s hold → 1.4s crossfade → muted looping video, with graceful image-only fallback. Museum sizing: `object-fit: contain`, `max-width: min(100%, 1200px)`, `max-height: 80vh`, 85vh stage, generous black negative space. All 5 (now 6) Vault product pages refactored to use it.
**Category nav** on `/inspiration-vault`: "EXPLORE THE ARCHIVE" pill rail (All · Earrings · Rings · Bangles & Bracelets · Pendants & Necklaces). Active pill = filled gold bg, dark text. Empty state for empty categories. Filter is `category` driven from the manifest — fully data-driven, no hardcoded slugs.

### 2026-02-16 — PRISMATIC LAUREL · Vault piece (#05)
Multicolour Emerald-Cut Sculptural Earrings. $70 USD · Rhodium-Plated Alloy · Stud Back · Lightweight. Hero video (H.264 720×720, 19.2s). 4-image gallery (editorial hero → white-bg pair → lifestyle portrait → macro). Closing quote: *"Every collection begins with a moment of inspiration."*

### 2026-02-15 — NOIR TIDE · Vault piece (#04)
Black & White Pavé Sculptural Earrings. $100 USD · White Rhodium Plated Brass · Black & White CZ. Image-only hero (no video). 5-image gallery. Closing quote: *"Contrast reveals brilliance."*

### 2026-02-14 — LIAISON · Vault piece (#03)
Infinity Link Earrings. $50 USD · Gold-Plated Brass. Hero video added (looping product film). 6-image gallery (editorial → lifestyle → in-box → packaging → bust → flat-lay).

### 2026-02-13 — Curator signature + intro copy update
Added quiet *"— Curated by Phill Wilson"* signature beneath the Vault intro. Updated intro body to the curatorial travel copy ("hand-picked pieces discovered while traveling through China, Tokyo, Greece, Dubai, Italy, Paris, and beyond. **None of these are PHILEON creations.** They're the pieces that inspired mine.").

### 2026-02-13 — Inspiration Vault as Chronological Archive
Restructured `/inspiration-vault` from a single product page to a permanent index/archive. Cards sorted newest-first by `releasedAt`.

### 2026-02-13 — NOIR CADENCE · Vault piece (#02)
Black Stone Pavé-Set Hoop Earrings. $100 USD. Hero video.

### 2026-02-13 — PRIMA WAVE · Vault piece (#01, formerly "First Discovery")
Rose Gold Vermeil Earrings. $75 USD. Initial Vault release — the woven chevron that later inspired COURONNE / Lady Boss Knot lineage. Renamed mid-stream from "First Discovery" to "Prima Wave" (route `/first-discovery` preserved as alias alongside new `/prima-wave`).

---

## 2026-02 — Lady Boss Knot & Boss Knot Pairing

### 2026-02-13 — KATRINA CASCATA · Real pricing + Custom Atelier
Replaced placeholder pricing with 2-metal configurator: Vermeil $495 + 10K Yellow Gold $2,950. Live swatch pills, gold-gradient dots. Craft spec list updated with **28.5 mm H × 16.8 mm W**. New **PHILEON Custom Atelier** section above Final Word explaining two-edition policy + bespoke CTA → `/contact?subject=Katrina%20Cascata%20Custom%20Atelier`.

### 2026-02-13 — KATRINA CASCATA · 2 lifestyle frames
Added joy-lit laughing portrait + grand staircase shot. Archive rhythm: 3 → 6 cells.

### 2026-02-13 — KATRINA CASCATA · New page
Bespoke `/katrina-cascata` page in soft sacred luxury palette (cream + warm gold + sand). Scripture lead *"Out of his heart will flow rivers of living water — John 7:38"*. Wired into `products.js`, `ShopDropPage.jsx`, `HomePage.jsx` carousel, `App.js` routes. Closing line: *"Some grace overflows. This one's gold."*

### 2026-02-13 — Gallery & Hero Video corrections
Moved 4 macros from Boss Knot → Lady Boss Knot. Moved hero campaign film from Boss Knot → Lady Boss Knot (revert to static `<img>` on Boss Knot). Lady Boss Knot gallery: 4 → 8 cells.

### 2026-02-13 — BOSS KNOT · 4 new gold archive frames
Added archive-15..18 (woven-knot macro, engraved chevron with sky bokeh, glass-shelf reflection, coiled product still). Cadence full/full/half/half. Gallery: 10 → 14 cells.

### 2026-02-13 — His & Hers Cross-Sell Pairing
Boss Knot ↔ Lady Boss Knot counterpart blocks placed above each Final Word. Two-column editorial (1.05fr / .95fr) with 4:5 portrait left, copy + CTA right. Boss Knot: *"HIS COUNTERPART · LADY BOSS KNOT"* → SHE WEARS IT TOO. Lady Boss Knot: *"HER COUNTERPART · BOSS KNOT"* → HE WEARS IT TOO.

### 2026-02-13 — LADY BOSS KNOT · Archive Gallery wired
"THE ARCHIVE" inserted between Intro and Composition. Stacked editorial: archive-1 full + archive-2 / archive-3 half/half.

---

## 2026-02 — Boss Knot Launch

### 2026-02-12 — BOSS KNOT · Hero metal pill + 200ms cross-fade
Luxury glass-blur pill *"CURRENTLY VIEWING · {METAL}"* fades in on metal click. 1px white/18 border, rgba(0,0,0,0.35), 10px blur, 999px radius, .18em tracking. Hero image, pill, gallery grid, archive eyebrow all cross-fade elegantly on swap via React `key` pattern. No layout shift.

### 2026-02-12 — BOSS KNOT · Final configurator (3 metals)
Sterling Silver $3,200 · 10K Yellow Gold $8,500 · 10K White Gold $8,500. Flat 3-button picker. Dynamic hero + gallery + metal badge per state. Yellow Gold → 10-frame gold gallery; Silver / 10K White Gold → 5-frame shared silver/white gallery (Black executive lifestyle leads). FE ↔ BE prices synced.

### 2026-02-12 — BOSS KNOT · Gallery expanded
5 new shots — 2 product macros + 1 close detail + 2 lifestyle/arrival.

### 2026-02-12 — BOSS KNOT launch
`/products/boss-knot`. 3 SKUs. Cascading configurator (Metal → Colour → Karat). 18" matching chain included. Woven mesh architecture, 70mm × 25mm. Added to homepage carousel + Signature grid + ShopDropPage CORE. `livePricingConfig.js` + `pricing_engine.py` synced.

---

## 2026-02 — Sitewide Sizing

### 2026-02-12 — Ring Size Guide
`/ring-size-guide` (alias `/size-guide`). Cinematic gold-on-black hero → warm-cream paper panel: step 1/step 2 illustrations, Common Phileon Sizes chart (US 5–13 ↔ 49.3–69.7mm), Before You Order checklist, Need Help block, "Not Jewelry. Identity." sign-off. Shared `SizeGuideContent` component used by modal in product pages.

---

## 2026-02 — Veyron Noir & Wynette's Palette

### 2026-02-11 — Veyron Noir archive expansion
Replaced archive-1 with 3/4 suede macro; added archive-11 (lounge/whiskey lifestyle) and archive-12 (Bugatti steering-wheel lifestyle). Total: 12 frames. Header copy: "Frames from the garage." Frames 5, 10, 11, 12 span full width; lifestyle frames use 16:9 / `object-fit: cover`.

### 2026-02-11 — Wynette's Palette & Veyron Noir launched
Bespoke pages added to catalog + homepage.

---

## Earlier
- STACKRATS image/configurator/hero-video fixes
- Pricing engine integration baseline (`POST /api/validate-cart` with CAD-base / USD-display + `round_luxury()` quantization + $100 tolerance)
