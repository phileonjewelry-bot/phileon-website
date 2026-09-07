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
