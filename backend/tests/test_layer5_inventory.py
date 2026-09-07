"""PHILEON Layer 5 — Inventory & Availability tests.

Covers the full inventory test matrix (Section 37) A–Z:
    · identity determinism
    · atomic reservation (real concurrency against Mongo)
    · commit / release lifecycle
    · duplicate-webhook idempotency
    · variant/size isolation
    · manual unavailable + re-enable
    · admin restock (idempotency + non-resalable guards)
    · dispute/fraud isolation
    · customer payload isolation

The **concurrency test** uses `asyncio.gather` against a real MongoDB
instance (already required by the app). If MongoDB is unreachable the
DB-backed tests degrade gracefully via `pytest.skip`.
"""
from __future__ import annotations
import asyncio
import os
import uuid
import pytest


def _run(coro):
    """Session-safe async runner (matches the pattern used by other
    Layer tests in this suite)."""
    return asyncio.new_event_loop().run_until_complete(coro)


def with_db(async_test):
    """Decorator: creates an isolated Mongo DB, runs the async test with
    it, drops the DB. Skips gracefully if Mongo is unreachable."""
    def _wrapper():
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
        except Exception:
            pytest.skip("motor not available")
        # Load .env if MONGO_URL is not already in the pytest environment.
        if not os.environ.get("MONGO_URL"):
            try:
                from dotenv import load_dotenv
                load_dotenv("/app/backend/.env")
            except Exception:
                pass
        url = os.environ.get("MONGO_URL")
        if not url:
            pytest.skip("MONGO_URL not set")

        async def _driver():
            client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=1500)
            try:
                await client.admin.command("ping")
            except Exception:
                pytest.skip("MongoDB unreachable in test environment")
            dbname = f"phileon_layer5_test_{uuid.uuid4().hex[:8]}"
            db = client[dbname]
            from services.inventory_service import ensure_indexes
            await ensure_indexes(db)
            try:
                await async_test(db)
            finally:
                await client.drop_database(dbname)
                client.close()

        _run(_driver())
    _wrapper.__name__ = async_test.__name__
    return _wrapper


# ── Test items ─────────────────────────────────────────────────────

BASE_ITEM = {
    "product_id": "iv-altar",  # Vault slug — the only mode that can be ready_to_ship
    "variant": "default",
    "karat": None,
    "metal_colour": None,
    "ring_size": None,
}


# ── Identity determinism ───────────────────────────────────────────

def test_inventory_key_deterministic():
    from services.inventory_service import compute_inventory_key
    k1 = compute_inventory_key(BASE_ITEM)
    k2 = compute_inventory_key({
        "product_id": "iv-altar",
        "variant": " Default ",  # whitespace + case tolerated
        "karat": None,
        "metal_colour": None,
        "ring_size": None,
    })
    assert k1 == k2, "canonical normalization must produce the same key"
    assert len(k1) == 32


def test_inventory_key_variant_differs():
    from services.inventory_service import compute_inventory_key
    a = compute_inventory_key({**BASE_ITEM, "variant": "alt-variant-a"})
    b = compute_inventory_key({**BASE_ITEM, "variant": "alt-variant-b"})
    assert a != b


# ── Availability resolution ─────────────────────────────────────────

@with_db
async def test_A_made_to_order_default(db):
    """Matrix A (updated by completion pass): a Vault slug without an
    owner-confirmed record is CURRENTLY UNAVAILABLE (not made_to_order).
    Non-Vault default is verified in test_completion_A_non_vault_default_mto."""
    from services.inventory_service import resolve_availability, try_reserve
    r = await resolve_availability(db, BASE_ITEM)
    assert r["state"] == "unavailable"
    assert r["available"] is False
    ok, rid, kind = await try_reserve(db, item=BASE_ITEM, qty=1,
                                         reservation_group_id="g1")
    assert ok is False and rid is None and kind == "unavailable"
    # No reservation record created for a refused Vault checkout.
    assert await db.inventory_reservations.count_documents({}) == 0


@with_db
async def test_D_derived_sold_out(db):
    """Matrix D: ready_to_ship with 0 stock → derived sold_out → block."""
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 try_reserve,
                                                 resolve_availability)
    key = compute_inventory_key(BASE_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_ITEM),
                              mode="ready_to_ship", stock_on_hand=0)
    r = await resolve_availability(db, BASE_ITEM)
    assert r["state"] == "sold_out"
    ok, _, kind = await try_reserve(db, item=BASE_ITEM, qty=1,
                                       reservation_group_id="g")
    assert not ok
    assert kind == "OUT_OF_STOCK"


@with_db
async def test_E_unavailable_blocks(db):
    """Matrix E + T: manual_unavailable / mode=unavailable blocks."""
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 set_manual_unavailable,
                                                 try_reserve,
                                                 resolve_availability)
    key = compute_inventory_key(BASE_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_ITEM),
                              mode="ready_to_ship", stock_on_hand=3)
    await set_manual_unavailable(db, inventory_key=key, value=True)
    r = await resolve_availability(db, BASE_ITEM)
    assert r["state"] == "unavailable"
    ok, _, kind = await try_reserve(db, item=BASE_ITEM, qty=1,
                                       reservation_group_id="g")
    assert not ok and kind == "unavailable"


# ── Concurrency (real Mongo atomicity) ──────────────────────────────

@with_db
async def test_C_and_38_concurrent_reservation(db):
    """Matrix C + Section 38 — LAUNCH REQUIREMENT.

    Seed exactly one physical unit and fire multiple concurrent reservation
    attempts. Exactly one must succeed; all others must receive
    OUT_OF_STOCK. Committing the winner drives stock to zero. This test
    uses the same atomic $expr primitive used in production."""
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 try_reserve,
                                                 attach_session,
                                                 commit_by_session)
    key = compute_inventory_key(BASE_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_ITEM),
                              mode="ready_to_ship", stock_on_hand=1)

    N = 8

    async def _one(i: int):
        return await try_reserve(db, item=BASE_ITEM, qty=1,
                                    reservation_group_id=f"gr-{i}")

    results = await asyncio.gather(*[_one(i) for i in range(N)])
    successes = [r for r in results if r[0]]
    failures = [r for r in results if not r[0]]
    assert len(successes) == 1, f"expected exactly 1 winner, got {len(successes)} — inventory would oversell"
    assert all(r[2] == "OUT_OF_STOCK" for r in failures)

    # Immediately after reservations: stock_on_hand=1, stock_reserved=1.
    inv = await db.inventory.find_one({"inventory_key": key}, {"_id": 0})
    assert inv["stock_on_hand"] == 1
    assert inv["stock_reserved"] == 1

    # Attach a session to the winning group + commit exactly once.
    winner = successes[0]
    winner_group = None
    async for r in db.inventory_reservations.find({"reservation_id": winner[1]}):
        winner_group = r["reservation_group_id"]
    await attach_session(db, reservation_group_id=winner_group,
                            stripe_checkout_session_id="cs_test_winner")
    committed = await commit_by_session(db,
                                            stripe_checkout_session_id="cs_test_winner")
    assert committed == 1
    inv = await db.inventory.find_one({"inventory_key": key}, {"_id": 0})
    assert inv["stock_on_hand"] == 0
    assert inv["stock_reserved"] == 0


# ── Duplicate webhook idempotency ──────────────────────────────────

@with_db
async def test_I_duplicate_commit_no_double_decrement(db):
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 try_reserve, attach_session,
                                                 commit_by_session)
    key = compute_inventory_key(BASE_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_ITEM),
                              mode="ready_to_ship", stock_on_hand=2)
    ok, _, _ = await try_reserve(db, item=BASE_ITEM, qty=1,
                                     reservation_group_id="grp-A")
    assert ok
    await attach_session(db, reservation_group_id="grp-A",
                            stripe_checkout_session_id="cs_dup")
    n1 = await commit_by_session(db, stripe_checkout_session_id="cs_dup")
    n2 = await commit_by_session(db, stripe_checkout_session_id="cs_dup")
    assert n1 == 1 and n2 == 0
    inv = await db.inventory.find_one({"inventory_key": key}, {"_id": 0})
    assert inv["stock_on_hand"] == 1 and inv["stock_reserved"] == 0


@with_db
async def test_J_duplicate_expire_no_negative_reserved(db):
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 try_reserve, attach_session,
                                                 release_by_session)
    key = compute_inventory_key(BASE_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_ITEM),
                              mode="ready_to_ship", stock_on_hand=1)
    ok, _, _ = await try_reserve(db, item=BASE_ITEM, qty=1,
                                     reservation_group_id="grp-X")
    assert ok
    await attach_session(db, reservation_group_id="grp-X",
                            stripe_checkout_session_id="cs_exp")
    n1 = await release_by_session(db, stripe_checkout_session_id="cs_exp",
                                       reason="expired")
    n2 = await release_by_session(db, stripe_checkout_session_id="cs_exp",
                                       reason="expired")
    assert n1 == 1 and n2 == 0
    inv = await db.inventory.find_one({"inventory_key": key}, {"_id": 0})
    assert inv["stock_reserved"] == 0
    assert inv["stock_on_hand"] == 1  # release NEVER touches on_hand


# ── Variant/size isolation ─────────────────────────────────────────

@with_db
async def test_O_variant_isolation(db):
    """Matrix O: variant A sold out, variant B still available."""
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 try_reserve)
    a = {**BASE_ITEM, "variant": "variant-A"}
    b = {**BASE_ITEM, "variant": "variant-B"}
    ka = compute_inventory_key(a)
    kb = compute_inventory_key(b)
    await upsert_inventory(db, inventory_key=ka,
                              canonical=canonical_identity(a),
                              mode="ready_to_ship", stock_on_hand=0)
    await upsert_inventory(db, inventory_key=kb,
                              canonical=canonical_identity(b),
                              mode="ready_to_ship", stock_on_hand=2)
    ok_a, _, _ = await try_reserve(db, item=a, qty=1,
                                        reservation_group_id="ga")
    ok_b, _, _ = await try_reserve(db, item=b, qty=1,
                                        reservation_group_id="gb")
    assert not ok_a and ok_b


# ── Admin adjust guards ────────────────────────────────────────────

@with_db
async def test_S_manual_reduce_below_reserved_rejected(db):
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 try_reserve, adjust_stock)
    key = compute_inventory_key(BASE_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_ITEM),
                              mode="ready_to_ship", stock_on_hand=2)
    await try_reserve(db, item=BASE_ITEM, qty=1,
                          reservation_group_id="hold")
    with pytest.raises(ValueError):
        # Reducing on_hand by 2 would leave 0 < reserved 1 → reject.
        await adjust_stock(db, inventory_key=key, delta=-2,
                              reason="test overreach", actor="admin")


# ── Restock idempotency ────────────────────────────────────────────

@with_db
async def test_Q_R_restock_once_then_rejected(db):
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 restock_from_rma)
    key = compute_inventory_key(BASE_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_ITEM),
                              mode="ready_to_ship", stock_on_hand=0)
    doc = await restock_from_rma(db, inventory_key=key, qty=1,
                                     rma_number="RMA-Z", item_ref="item_0",
                                     actor="admin", note="ok")
    assert doc["stock_on_hand"] == 1
    with pytest.raises(ValueError):
        await restock_from_rma(db, inventory_key=key, qty=1,
                                   rma_number="RMA-Z", item_ref="item_0",
                                   actor="admin", note="dup")


# ── Customer payload isolation (Matrix W) ─────────────────────────

@with_db
async def test_W_customer_availability_no_internal_fields(db):
    """Matrix W: /availability/resolve returns no stock counts, reservation
    IDs, session IDs, or admin notes."""
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 resolve_availability)
    key = compute_inventory_key(BASE_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_ITEM),
                              mode="ready_to_ship", stock_on_hand=5,
                              owner_note="secret internal note")
    r = await resolve_availability(db, BASE_ITEM)
    for banned in ("stock_on_hand", "stock_reserved", "owner_note",
                    "reservation_id", "stripe_checkout_session_id",
                    "manual_unavailable", "created_at"):
        assert banned not in r, f"customer availability leaks {banned}"


# ── Restock non-resalable classes (route-level guard) ──────────────

def test_restock_non_resalable_policy_guard():
    """The route guard forbids custom/engraved/resized final-sale
    policy classes from being restocked. Verified at the route module
    level via source inspection to avoid a full FastAPI harness."""
    import inspect, routes.returns as rr
    src = inspect.getsource(rr)
    assert "NON_RESALABLE_POLICY_CLASS" in src
    assert "custom_final_sale" in src
    assert "engraved_final_sale" in src
    assert "resized_final_sale" in src


# ── U/V: re-enable does not fabricate quantity ────────────────────

@with_db
async def test_U_V_re_enable_no_fabricated_quantity(db):
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 set_manual_unavailable,
                                                 resolve_availability)
    key = compute_inventory_key(BASE_ITEM)
    # Seed with zero physical stock, mark unavailable, re-enable.
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_ITEM),
                              mode="ready_to_ship", stock_on_hand=0)
    await set_manual_unavailable(db, inventory_key=key, value=True)
    await set_manual_unavailable(db, inventory_key=key, value=False)
    r = await resolve_availability(db, BASE_ITEM)
    # Re-enabled ready_to_ship with zero stock → derived sold_out, NOT
    # a fabricated positive quantity.
    assert r["state"] == "sold_out"


# ── P: refund does not auto-restock (webhook code path assertion) ─

def test_P_refund_webhook_does_not_touch_inventory():
    """Section 25: charge.refunded must NEVER modify inventory. Source
    inspection ensures the webhook branch contains no inventory service
    calls."""
    import inspect, routes.webhooks_stripe as wh
    src = inspect.getsource(wh)
    # Find the `elif etype == "charge.refunded":` block and ensure it
    # does not import or call inventory_service commit/release/restock.
    idx = src.find('elif etype == "charge.refunded":')
    assert idx > 0
    block = src[idx: idx + 2500]
    for banned in ("inventory_service", "commit_by_session",
                    "release_by_session", "restock_from_rma",
                    "adjust_stock"):
        assert banned not in block, f"charge.refunded leaks call to {banned}"


# ── X, Y, Z: dispute + fraud isolation ─────────────────────────────

def test_XY_dispute_webhook_no_inventory_effect():
    """Sections 29/42: charge.dispute.* events do not touch inventory."""
    import inspect, routes.webhooks_stripe as wh
    src = inspect.getsource(wh)
    idx = src.find("charge.dispute")
    assert idx > 0
    block = src[idx: idx + 5000]
    for banned in ("commit_by_session", "release_by_session",
                    "restock_from_rma", "adjust_stock"):
        assert banned not in block, f"dispute branch leaks call to {banned}"


def test_Z_fraud_hold_does_not_release_inventory():
    """Section 29: manual fraud hold routes must not call inventory
    release."""
    import inspect
    from routes import admin_orders, admin_disputes
    for mod in (admin_orders, admin_disputes):
        src = inspect.getsource(mod)
        for banned in ("release_by_session", "commit_by_session",
                        "adjust_stock", "restock_from_rma"):
            assert banned not in src, f"{mod.__name__} contains {banned}"


# ═════════════════════════════════════════════════════════════════════
# Layer 5 COMPLETION PASS — Inspiration Vault restriction
# ═════════════════════════════════════════════════════════════════════

BASE_VAULT_ITEM = {
    "product_id": "iv-altar",
    "variant": "default",
    "karat": None,
    "metal_colour": None,
    "ring_size": None,
}


def test_vault_membership_authoritative_source():
    """Sections 1 + 2: authoritative Vault source is
    `pricing_engine_catalog.FIXED_PRODUCTS` (slugs starting with `iv-`).
    Membership is product-level."""
    from services.inventory_service import (is_inspiration_vault_slug,
                                                 _inspiration_vault_slugs)
    slugs = _inspiration_vault_slugs()
    assert len(slugs) >= 14
    assert all(s.startswith("iv-") for s in slugs)
    # Product-level: any variant of a Vault slug inherits membership.
    assert is_inspiration_vault_slug("iv-altar") is True
    assert is_inspiration_vault_slug("iv-caged-wings") is True
    # Non-Vault slugs are refused.
    assert is_inspiration_vault_slug("boss-knot") is False
    assert is_inspiration_vault_slug("annie-rose-foundation") is False
    assert is_inspiration_vault_slug(None) is False
    assert is_inspiration_vault_slug("") is False


# Test A — non-Vault + no record → made_to_order
@with_db
async def test_completion_A_non_vault_default_mto(db):
    from services.inventory_service import resolve_availability
    r = await resolve_availability(db, {"product_id": "boss-knot",
                                              "variant": "default"})
    assert r["state"] == "made_to_order"
    assert r["available"] is True


# Test B — non-Vault ready_to_ship upsert → 409
@with_db
async def test_completion_B_non_vault_ready_to_ship_rejected(db):
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity)
    item = {"product_id": "boss-knot", "variant": "default"}
    key = compute_inventory_key(item)
    canonical = canonical_identity(item)
    with pytest.raises(ValueError) as exc:
        await upsert_inventory(db, inventory_key=key, canonical=canonical,
                                   mode="ready_to_ship", stock_on_hand=1)
    assert "READY_TO_SHIP_RESTRICTED_TO_INSPIRATION_VAULT" in str(exc.value)


# Test C — Vault + owner qty 1 → ready_to_ship
@with_db
async def test_completion_C_vault_ready_to_ship_ok(db):
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 resolve_availability)
    key = compute_inventory_key(BASE_VAULT_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_VAULT_ITEM),
                              mode="ready_to_ship", stock_on_hand=1)
    r = await resolve_availability(db, BASE_VAULT_ITEM)
    assert r["state"] == "ready_to_ship"
    assert r["available"] is True


# Test D — Vault ready_to_ship stock=0 → sold_out
@with_db
async def test_completion_D_vault_sold_out(db):
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 resolve_availability)
    key = compute_inventory_key(BASE_VAULT_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_VAULT_ITEM),
                              mode="ready_to_ship", stock_on_hand=0)
    r = await resolve_availability(db, BASE_VAULT_ITEM)
    assert r["state"] == "sold_out"
    assert r["available"] is False


# Test E — Vault quantity unknown → no fabricated stock
def test_completion_E_no_fabricated_vault_stock():
    """Layer 5 does not seed Vault products with stock_on_hand=1 by
    default. Owner must explicitly enter physical quantity. Verified
    via source inspection of the service — no default stock is
    hard-coded anywhere."""
    import inspect
    from services import inventory_service
    src = inspect.getsource(inventory_service)
    # There must be no code path that upserts stock_on_hand=1 for a
    # Vault slug automatically (the module never writes stock outside
    # of owner-driven paths).
    lower = src.lower()
    for banned in ("default_stock", "seed_vault", "auto_stock",
                    "fabricate_quantity"):
        assert banned not in lower
    # Restock is idempotent per (rma, item_ref) and only fires from RMA.
    assert "restock_from_rma" in src
    assert "rma_number" in src


# Test G — non-Vault checkout writes no reservation
@with_db
async def test_completion_G_non_vault_no_reservation(db):
    from services.inventory_service import try_reserve
    ok, rid, kind = await try_reserve(db,
                                            item={"product_id": "boss-knot",
                                                   "variant": "default"},
                                            qty=1,
                                            reservation_group_id="g1")
    assert ok is True
    assert rid is None
    assert kind == "made_to_order"
    assert await db.inventory_reservations.count_documents({}) == 0


# Test H — non-Vault absent inventory never sold out
@with_db
async def test_completion_H_non_vault_never_sold_out(db):
    from services.inventory_service import resolve_availability
    r = await resolve_availability(db, {"product_id": "la-madonna",
                                              "variant": "10k-yellow"})
    assert r["state"] == "made_to_order"
    assert r["available"] is True


# Test K — returned made-to-order does not auto-Vault
def test_completion_K_returned_mto_not_auto_vaulted():
    """RMA restock service refuses non-ready_to_ship targets. Since a
    made-to-order slug can never legally reach ready_to_ship (Test B),
    a returned MTO piece can never be silently promoted to Vault
    inventory. Verified by inspecting the restock guard."""
    import inspect
    from services import inventory_service
    src = inspect.getsource(inventory_service.restock_from_rma)
    assert "MODE_READY_TO_SHIP" in src
    assert "RESTOCK_ONLY_READY_TO_SHIP" in src


# Test L — customer API isolation
@with_db
async def test_completion_L_customer_api_isolation(db):
    """Public availability payload never exposes internal fields even
    for a Vault ready_to_ship configuration with a note attached."""
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 resolve_availability)
    key = compute_inventory_key(BASE_VAULT_ITEM)
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical_identity(BASE_VAULT_ITEM),
                              mode="ready_to_ship", stock_on_hand=3,
                              owner_note="internal note")
    r = await resolve_availability(db, BASE_VAULT_ITEM)
    for banned in ("stock_on_hand", "stock_reserved", "owner_note",
                    "reservation_id", "stripe_checkout_session_id",
                    "manual_unavailable", "audit"):
        assert banned not in r


# ═════════════════════════════════════════════════════════════════════
# Layer 5 FINAL COMPLETION PASS
# Vault no-record = CURRENTLY UNAVAILABLE
# Public alias slug resolution
# ═════════════════════════════════════════════════════════════════════

def test_vault_public_alias_resolves_to_canonical():
    """G/H: public URL slugs like `parallax-drop-earrings` and legacy
    `gold-theory-ribbon` must resolve to the canonical iv-* identity."""
    from services.inventory_service import (resolve_canonical_slug,
                                                 is_inspiration_vault_slug,
                                                 compute_inventory_key)
    assert resolve_canonical_slug("parallax-drop-earrings") == "iv-parallax-drop-earrings"
    assert resolve_canonical_slug("altar") == "iv-altar"
    # Legacy editorial alias for iv-ribbon-regale.
    assert resolve_canonical_slug("gold-theory-ribbon") == "iv-ribbon-regale"
    assert resolve_canonical_slug("ribbon-regale") == "iv-ribbon-regale"
    # Non-Vault slugs pass through unchanged.
    assert resolve_canonical_slug("boss-knot") == "boss-knot"
    # Membership check accepts either the canonical or the alias.
    assert is_inspiration_vault_slug("parallax-drop-earrings") is True
    assert is_inspiration_vault_slug("gold-theory-ribbon") is True
    assert is_inspiration_vault_slug("iv-altar") is True
    # Same physical piece must have the same inventory_key regardless
    # of public alias vs canonical slug.
    ka = compute_inventory_key({"product_id": "gold-theory-ribbon", "variant": "default"})
    kb = compute_inventory_key({"product_id": "iv-ribbon-regale", "variant": "default"})
    kc = compute_inventory_key({"product_id": "ribbon-regale", "variant": "default"})
    assert ka == kb == kc, "aliases must not create separate stock pools"


# Test B — Vault + no record → CURRENTLY UNAVAILABLE (not made_to_order)
@with_db
async def test_final_B_vault_no_record_unavailable(db):
    """Owner rule: a Vault piece never displays MADE TO ORDER to a
    customer. Without an owner-confirmed record it is CURRENTLY
    UNAVAILABLE."""
    from services.inventory_service import resolve_availability, try_reserve
    # Every Vault piece (canonical + alias) resolves as unavailable
    # when no explicit record exists.
    for slug in ("iv-altar", "altar", "parallax-drop-earrings",
                    "gold-theory-ribbon"):
        r = await resolve_availability(db, {"product_id": slug,
                                                  "variant": "default"})
        assert r["state"] == "unavailable", f"{slug} should be unavailable"
        assert r["available"] is False
        assert r["is_inspiration_vault"] is True
        # Reservation must also refuse — never let a Vault piece slip
        # into checkout without an owner-confirmed record.
        ok, rid, kind = await try_reserve(
            db, item={"product_id": slug, "variant": "default"}, qty=1,
            reservation_group_id="grp-x",
        )
        assert ok is False
        assert rid is None
        assert kind == "unavailable"


# Test C — Vault + stock 1 → READY TO SHIP (via alias)
@with_db
async def test_final_C_vault_alias_ready_to_ship(db):
    from services.inventory_service import (compute_inventory_key,
                                                 upsert_inventory,
                                                 canonical_identity,
                                                 resolve_availability)
    # Upsert using ALIAS slug — canonical identity must still be `iv-*`.
    item = {"product_id": "altar", "variant": "default"}
    key = compute_inventory_key(item)
    canonical = canonical_identity(item)
    assert canonical["slug"] == "iv-altar"
    await upsert_inventory(db, inventory_key=key,
                              canonical=canonical,
                              mode="ready_to_ship", stock_on_hand=1)
    # Availability API called with the canonical slug must see the
    # same record — no duplicate stock pool.
    r_alias = await resolve_availability(db, {"product_id": "altar",
                                                    "variant": "default"})
    r_canon = await resolve_availability(db, {"product_id": "iv-altar",
                                                    "variant": "default"})
    assert r_alias["state"] == "ready_to_ship"
    assert r_canon["state"] == "ready_to_ship"
    assert r_alias["inventory_key"] == r_canon["inventory_key"]


# Test A — Non-Vault + no record still MADE TO ORDER
@with_db
async def test_final_A_non_vault_still_mto(db):
    from services.inventory_service import resolve_availability
    r = await resolve_availability(db, {"product_id": "boss-knot"})
    assert r["state"] == "made_to_order"
    assert r["available"] is True
    assert r["is_inspiration_vault"] is False


# Test frontend mapping covers all 14 Vault pieces
def test_frontend_route_map_covers_14_vault_pieces():
    """The route-aware badge component (VaultRouteBadge.jsx) must
    map every one of the 14 canonical iv-* slugs. Verified by source
    inspection so a future omission is caught at test time."""
    src = open("/app/frontend/src/components/VaultRouteBadge.jsx").read()
    from services.inventory_service import _inspiration_vault_slugs
    vault = _inspiration_vault_slugs()
    for slug in vault:
        assert slug in src, f"VaultRouteBadge missing {slug}"


# Test badge mount point exists in App.js
def test_vault_badge_mounted_in_app():
    src = open("/app/frontend/src/App.js").read()
    assert "VaultRouteBadge" in src
    assert "<VaultRouteBadge" in src


# ═════════════════════════════════════════════════════════════════════
# Layer 5 FINAL OWNER-STOCK INITIALIZATION — one-of-one Vault
# ═════════════════════════════════════════════════════════════════════

@with_db
async def test_vault_seed_creates_14_pieces_at_qty_1(db):
    """Seed initializes exactly 14 canonical iv-* records with
    stock_on_hand=1, stock_reserved=0, ready_to_ship. No per-variant
    or per-size sub-records."""
    from services.inventory_service import (initialize_vault_one_of_one,
                                                 _inspiration_vault_slugs)
    result = await initialize_vault_one_of_one(db)
    assert result["total"] == 14
    assert len(result["created"]) == 14
    assert len(result["skipped"]) == 0
    docs = [d async for d in db.inventory.find({}, {"_id": 0})]
    assert len(docs) == 14
    slugs = {d["product_slug"] for d in docs}
    assert slugs == _inspiration_vault_slugs()
    for d in docs:
        assert d["availability_mode"] == "ready_to_ship"
        assert d["stock_on_hand"] == 1
        assert d["stock_reserved"] == 0
        assert d["manual_unavailable"] is False


@with_db
async def test_vault_seed_is_idempotent_and_never_resurrects_sold(db):
    """Running the seed twice creates 14, then 0. If a piece has been
    committed to zero (sold), the second run must NOT resurrect it."""
    from services.inventory_service import (initialize_vault_one_of_one,
                                                 compute_inventory_key,
                                                 canonical_identity,
                                                 try_reserve,
                                                 attach_session,
                                                 commit_by_session)
    r1 = await initialize_vault_one_of_one(db)
    assert len(r1["created"]) == 14
    # Simulate a successful sale on one piece.
    item = {"product_id": "iv-altar"}
    ok, _, _ = await try_reserve(db, item=item, qty=1,
                                        reservation_group_id="grp-sold")
    assert ok
    await attach_session(db, reservation_group_id="grp-sold",
                            stripe_checkout_session_id="cs_sold")
    n = await commit_by_session(db, stripe_checkout_session_id="cs_sold")
    assert n == 1
    # Verify sold state.
    key = compute_inventory_key(item)
    doc = await db.inventory.find_one({"inventory_key": key}, {"_id": 0})
    assert doc["stock_on_hand"] == 0
    assert doc["stock_reserved"] == 0
    # Second seed run must skip everything — never resurrect the sold piece.
    r2 = await initialize_vault_one_of_one(db)
    assert len(r2["created"]) == 0
    assert len(r2["skipped"]) == 14
    doc2 = await db.inventory.find_one({"inventory_key": key}, {"_id": 0})
    assert doc2["stock_on_hand"] == 0, "sold piece must NEVER be resurrected"


@with_db
async def test_vault_one_of_one_sale_flow(db):
    """1 on hand → reserve → 1/1 → commit → 0/0 → state SOLD OUT."""
    from services.inventory_service import (initialize_vault_one_of_one,
                                                 compute_inventory_key,
                                                 resolve_availability,
                                                 try_reserve, attach_session,
                                                 commit_by_session)
    await initialize_vault_one_of_one(db)
    item = {"product_id": "iv-altar"}
    r0 = await resolve_availability(db, item)
    assert r0["state"] == "ready_to_ship" and r0["available"] is True
    ok, rid, kind = await try_reserve(db, item=item, qty=1,
                                            reservation_group_id="grp-A")
    assert ok and kind == "ready_to_ship"
    key = compute_inventory_key(item)
    doc = await db.inventory.find_one({"inventory_key": key}, {"_id": 0})
    assert doc["stock_on_hand"] == 1 and doc["stock_reserved"] == 1
    await attach_session(db, reservation_group_id="grp-A",
                            stripe_checkout_session_id="cs_x")
    await commit_by_session(db, stripe_checkout_session_id="cs_x")
    r1 = await resolve_availability(db, item)
    assert r1["state"] == "sold_out"
    assert r1["available"] is False


@with_db
async def test_vault_one_of_one_abandoned_checkout_flow(db):
    """1 on hand → reserve → 1/1 → session expires → release → 1/0 →
    state READY TO SHIP again. Not replenishment — same physical unit."""
    from services.inventory_service import (initialize_vault_one_of_one,
                                                 compute_inventory_key,
                                                 resolve_availability,
                                                 try_reserve, attach_session,
                                                 release_by_session)
    await initialize_vault_one_of_one(db)
    item = {"product_id": "iv-echelle"}
    ok, _, _ = await try_reserve(db, item=item, qty=1,
                                        reservation_group_id="grp-E")
    assert ok
    await attach_session(db, reservation_group_id="grp-E",
                            stripe_checkout_session_id="cs_exp")
    await release_by_session(db, stripe_checkout_session_id="cs_exp",
                                  reason="checkout.session.expired")
    r = await resolve_availability(db, item)
    assert r["state"] == "ready_to_ship"
    assert r["available"] is True


@with_db
async def test_vault_alias_shares_single_stock_pool(db):
    """Public URL alias must resolve to the same inventory record as
    the canonical iv-* slug — never create a second physical unit."""
    from services.inventory_service import (initialize_vault_one_of_one,
                                                 compute_inventory_key,
                                                 resolve_availability)
    await initialize_vault_one_of_one(db)
    canonical_item = {"product_id": "iv-ribbon-regale"}
    alias_item_a  = {"product_id": "ribbon-regale"}
    alias_item_b  = {"product_id": "gold-theory-ribbon"}
    ka = compute_inventory_key(canonical_item)
    kb = compute_inventory_key(alias_item_a)
    kc = compute_inventory_key(alias_item_b)
    assert ka == kb == kc
    total_ribbon_records = await db.inventory.count_documents(
        {"product_slug": "iv-ribbon-regale"})
    assert total_ribbon_records == 1, "aliases must not create duplicate physical units"
    r_alias = await resolve_availability(db, alias_item_b)
    r_canon = await resolve_availability(db, canonical_item)
    assert r_alias["inventory_key"] == r_canon["inventory_key"]
    assert r_alias["state"] == r_canon["state"] == "ready_to_ship"


@with_db
async def test_vault_one_of_one_concurrent_reservations(db):
    """One-of-one concurrency: 8 concurrent buyers, ONE succeeds, seven
    OUT_OF_STOCK. Uses the same atomic $expr primitive as production."""
    from services.inventory_service import (initialize_vault_one_of_one,
                                                 try_reserve)
    await initialize_vault_one_of_one(db)
    item = {"product_id": "iv-nova"}
    N = 8

    async def _one(i):
        return await try_reserve(db, item=item, qty=1,
                                    reservation_group_id=f"nova-{i}")

    results = await asyncio.gather(*[_one(i) for i in range(N)])
    successes = [r for r in results if r[0]]
    failures = [r for r in results if not r[0]]
    assert len(successes) == 1
    assert all(r[2] == "OUT_OF_STOCK" for r in failures)


# ═════════════════════════════════════════════════════════════════════
# Layer 5 STOCK-SAFETY CORRECTION
# Startup must NEVER auto-create physical inventory. Missing records
# fail closed to CURRENTLY UNAVAILABLE. One-of-one pieces never
# resurrect across restarts, DB restores, or code deploys.
# ═════════════════════════════════════════════════════════════════════

def test_server_startup_does_not_invoke_vault_seed():
    """The seed function must NOT be wired into normal server startup.
    Source inspection guards against a future regression that would
    re-attach it silently."""
    src = open("/app/backend/server.py").read()
    # The function name must exist as a comment reference explaining
    # why it is NOT called (defensive documentation), but it must NOT
    # appear inside an active call.
    assert "initialize_vault_one_of_one()" not in src or "initialize_vault_one_of_one(db)" not in src, \
        "server.py must not invoke initialize_vault_one_of_one at startup"
    # Explicit hard-check: no `await initialize_vault_one_of_one(` line.
    active_call_marker = "await initialize_vault_one_of_one("
    assert active_call_marker not in src, \
        "server.py has an active call to initialize_vault_one_of_one — remove it"


@with_db
async def test_missing_vault_record_falls_back_to_unavailable(db):
    """Fail-closed safety: a Vault piece with no owner-confirmed
    inventory record must resolve to CURRENTLY UNAVAILABLE — never
    READY TO SHIP, never auto-created."""
    from services.inventory_service import resolve_availability
    # No seed run — start from an empty inventory collection.
    assert await db.inventory.count_documents({}) == 0
    for slug in ("iv-altar", "iv-nova", "iv-roseline"):
        r = await resolve_availability(db, {"product_id": slug})
        assert r["state"] == "unavailable", f"{slug} must fail closed"
        assert r["available"] is False
    # And nothing was auto-created by the resolver.
    assert await db.inventory.count_documents({}) == 0


@with_db
async def test_sold_piece_survives_simulated_restart(db):
    """A sold-out one-of-one Vault piece must remain SOLD OUT across a
    simulated restart. The explicit seed utility must NOT resurrect
    it even if the owner runs it again for maintenance."""
    from services.inventory_service import (initialize_vault_one_of_one,
                                                 compute_inventory_key,
                                                 resolve_availability,
                                                 try_reserve, attach_session,
                                                 commit_by_session)
    # One-time explicit initialization (simulating the historical
    # owner-authorized seed).
    await initialize_vault_one_of_one(db)
    # Sell iv-altar.
    item = {"product_id": "iv-altar"}
    ok, _, _ = await try_reserve(db, item=item, qty=1,
                                        reservation_group_id="g-sold")
    assert ok
    await attach_session(db, reservation_group_id="g-sold",
                            stripe_checkout_session_id="cs_x")
    await commit_by_session(db, stripe_checkout_session_id="cs_x")
    r_sold = await resolve_availability(db, item)
    assert r_sold["state"] == "sold_out"
    # Simulate a restart: NO startup seed runs (that's the whole point
    # of this correction). Verify state persists.
    r_after = await resolve_availability(db, item)
    assert r_after["state"] == "sold_out"
    # Even if the owner accidentally invokes the explicit seed again,
    # it must skip the sold piece — never resurrect.
    result = await initialize_vault_one_of_one(db)
    assert "iv-altar" in result["skipped"]
    r_final = await resolve_availability(db, item)
    assert r_final["state"] == "sold_out", "sold one-of-one MUST NOT resurrect"
    key = compute_inventory_key(item)
    doc = await db.inventory.find_one({"inventory_key": key}, {"_id": 0})
    assert doc["stock_on_hand"] == 0


@with_db
async def test_future_vault_piece_never_auto_stocked(db):
    """A hypothetical FUTURE Vault slug added to the catalog must never
    automatically receive stock_on_hand=1. It resolves as CURRENTLY
    UNAVAILABLE until the owner explicitly creates the inventory
    record via /admin/inventory."""
    from services.inventory_service import (resolve_availability,
                                                 is_inspiration_vault_slug,
                                                 _inspiration_vault_slugs)
    # Simulate a future addition — use monkey-patch style: temporarily
    # extend the Vault slug set via a wrapper.
    real = _inspiration_vault_slugs()
    future_slug = "iv-future-hypothetical-piece"
    import services.inventory_service as inv_mod
    original = inv_mod._inspiration_vault_slugs
    inv_mod._inspiration_vault_slugs = lambda: real | {future_slug}
    try:
        assert is_inspiration_vault_slug(future_slug) is True
        r = await resolve_availability(db, {"product_id": future_slug})
        assert r["state"] == "unavailable"
        assert r["available"] is False
        # No stock was fabricated by the read.
        assert await db.inventory.count_documents(
            {"product_slug": future_slug}) == 0
    finally:
        inv_mod._inspiration_vault_slugs = original


@with_db
async def test_deleted_record_never_auto_recreated(db):
    """Test 7: simulate a Vault record being absent (e.g. after a
    partial DB corruption or an operator mistake) and confirm no
    automatic replacement is created. Public state fails closed to
    CURRENTLY UNAVAILABLE. Owner reconciliation is the only path
    back to READY TO SHIP."""
    from services.inventory_service import (initialize_vault_one_of_one,
                                                 compute_inventory_key,
                                                 resolve_availability,
                                                 try_reserve)
    await initialize_vault_one_of_one(db)
    key = compute_inventory_key({"product_id": "iv-monaco"})
    # Delete the record — simulates corruption / operator mistake.
    await db.inventory.delete_one({"inventory_key": key})
    # Multiple availability queries must NOT auto-recreate the record.
    for _ in range(3):
        r = await resolve_availability(db, {"product_id": "iv-monaco"})
        assert r["state"] == "unavailable"
    assert await db.inventory.count_documents(
        {"product_slug": "iv-monaco"}) == 0
    # A reservation attempt must also refuse.
    ok, _, kind = await try_reserve(db, item={"product_id": "iv-monaco"},
                                          qty=1, reservation_group_id="gm")
    assert ok is False and kind == "unavailable"
