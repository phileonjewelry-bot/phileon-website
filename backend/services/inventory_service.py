"""PHILEON Layer 5 — Inventory & Availability Service.

Canonical, server-authoritative inventory subsystem.

Design invariants (owner-locked):
    · Availability modes: `made_to_order`, `ready_to_ship`, `unavailable`.
      `sold_out` is a DERIVED customer-facing label when a
      `ready_to_ship` configuration has `available_quantity <= 0`.
    · No explicit inventory record → configuration is `made_to_order`.
      Inventory records exist ONLY when the owner explicitly configures
      an exact sellable configuration as `ready_to_ship` or `unavailable`.
    · Every reservation change is performed inside a single atomic Mongo
      operation using `$expr` — never read-then-write. Two concurrent
      reservations for the last unit must produce exactly one success.
    · Refunds NEVER auto-restock. Chargebacks NEVER auto-restock.
      Fraud/dispute events NEVER affect inventory. Only an explicit
      authorized owner action increases physical stock.
    · Customer-facing surfaces never expose stock_on_hand,
      stock_reserved, reservation IDs, session IDs, or admin notes.
"""

from __future__ import annotations

import hashlib
import json
import logging
import secrets
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("phileon.inventory")

# ── Canonical availability modes ─────────────────────────────────────
MODE_MADE_TO_ORDER = "made_to_order"
MODE_READY_TO_SHIP = "ready_to_ship"
MODE_UNAVAILABLE = "unavailable"
CANONICAL_MODES = {MODE_MADE_TO_ORDER, MODE_READY_TO_SHIP, MODE_UNAVAILABLE}

# ── Reservation states ───────────────────────────────────────────────
RES_HELD = "held"
RES_COMMITTED = "committed"
RES_RELEASED = "released"


# ── Identity ─────────────────────────────────────────────────────────

_NULL_SENTINEL = "-"


def _norm(value: Any) -> str:
    """Deterministic normalization for identity components.

    · None/empty → `_NULL_SENTINEL` (`"-"`).
    · strings → trimmed + lowercased.
    · anything else → repr-lowered.
    """
    if value is None:
        return _NULL_SENTINEL
    if isinstance(value, str):
        s = value.strip()
        return s.lower() if s else _NULL_SENTINEL
    return str(value).strip().lower() or _NULL_SENTINEL


def canonical_identity(item: Dict[str, Any]) -> Dict[str, str]:
    """Normalize a resolved cart/order item into the canonical identity
    tuple used everywhere for the inventory key.

    Never accepts display text. Only the trusted resolver fields:
        · product_id      (slug)
        · variant
        · karat
        · metal_colour
        · ring_size
    """
    return {
        "slug": _norm(item.get("product_id") or item.get("slug")),
        "variant": _norm(item.get("variant")),
        "karat": _norm(item.get("karat")),
        "metal_colour": _norm(item.get("metal_colour") or item.get("metalColour")),
        "ring_size": _norm(item.get("ring_size") or item.get("size")),
    }


def compute_inventory_key(item: Dict[str, Any]) -> str:
    """Deterministic SHA-256 of the canonical identity tuple, encoded as
    the first 32 hex characters (128 bits). Stable across server restarts,
    process boundaries, and Python versions.

    Persist the underlying `canonical_identity` alongside the key so an
    owner can always audit what a key represents.
    """
    ident = canonical_identity(item)
    payload = json.dumps(ident, sort_keys=True, ensure_ascii=False,
                          separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:32]


# ── DB accessors ────────────────────────────────────────────────────

async def get_inventory(db, inventory_key: str) -> Optional[Dict[str, Any]]:
    return await db.inventory.find_one({"inventory_key": inventory_key},
                                        {"_id": 0})


async def upsert_inventory(db, *, inventory_key: str,
                            canonical: Dict[str, str],
                            mode: str,
                            stock_on_hand: int = 0,
                            low_stock_threshold: Optional[int] = None,
                            owner_note: Optional[str] = None,
                            actor: str = "admin") -> Dict[str, Any]:
    """Owner-facing create-or-update. Never touches `stock_reserved` (that
    is only modified atomically by reservation flows)."""
    if mode not in CANONICAL_MODES:
        raise ValueError(f"invalid mode: {mode}")
    if stock_on_hand < 0:
        raise ValueError("stock_on_hand cannot be negative")
    now = datetime.now(timezone.utc)
    prev = await get_inventory(db, inventory_key) or {}
    prev_stock = int(prev.get("stock_on_hand") or 0)
    prev_reserved = int(prev.get("stock_reserved") or 0)
    # Cannot lower stock_on_hand below what's already reserved.
    if stock_on_hand < prev_reserved:
        raise ValueError(
            f"stock_on_hand ({stock_on_hand}) below reserved ({prev_reserved})")
    doc: Dict[str, Any] = {
        "inventory_key": inventory_key,
        "product_slug": canonical["slug"],
        "variant": canonical["variant"],
        "karat": canonical["karat"],
        "metal_colour": canonical["metal_colour"],
        "ring_size": canonical["ring_size"],
        "availability_mode": mode,
        "stock_on_hand": int(stock_on_hand),
        "manual_unavailable": bool(prev.get("manual_unavailable", False)),
        "low_stock_threshold": low_stock_threshold,
        "owner_note": owner_note,
        "updated_at": now,
    }
    if not prev:
        doc["created_at"] = now
    await db.inventory.update_one(
        {"inventory_key": inventory_key},
        {"$set": doc, "$setOnInsert": {"stock_reserved": 0}},
        upsert=True,
    )
    await _audit(db, inventory_key=inventory_key,
                 action="upsert", actor=actor,
                 delta=int(stock_on_hand) - prev_stock,
                 stock_before=prev_stock, stock_after=stock_on_hand,
                 reserved_before=prev_reserved,
                 reserved_after=prev_reserved,
                 reason=owner_note or "owner upsert",
                 canonical=canonical, mode=mode)
    return await get_inventory(db, inventory_key)  # type: ignore[return-value]


async def adjust_stock(db, *, inventory_key: str, delta: int, reason: str,
                       actor: str = "admin",
                       related_order: Optional[str] = None) -> Dict[str, Any]:
    """Owner manual +/- adjustment. Refuses any decrease that would push
    `stock_on_hand` below `stock_reserved` or below zero. Atomic."""
    if delta == 0:
        raise ValueError("delta must be non-zero")
    if not reason or not reason.strip():
        raise ValueError("reason is required for manual adjustment")
    now = datetime.now(timezone.utc)
    # For a NEGATIVE delta: require (stock_on_hand + delta) >= stock_reserved.
    if delta < 0:
        r = await db.inventory.update_one(
            {"inventory_key": inventory_key,
             "$expr": {"$gte": [
                 {"$add": ["$stock_on_hand", delta]},
                 "$stock_reserved",
             ]}},
            {"$inc": {"stock_on_hand": delta},
             "$set": {"updated_at": now}},
        )
    else:
        r = await db.inventory.update_one(
            {"inventory_key": inventory_key},
            {"$inc": {"stock_on_hand": delta},
             "$set": {"updated_at": now}},
        )
    if not r.matched_count:
        raise ValueError("ADJUSTMENT_REJECTED: would violate stock_reserved floor or key not found")
    doc = await get_inventory(db, inventory_key)
    await _audit(db, inventory_key=inventory_key,
                 action="adjust", actor=actor, delta=delta,
                 stock_before=int(doc["stock_on_hand"]) - delta,
                 stock_after=int(doc["stock_on_hand"]),
                 reserved_before=int(doc["stock_reserved"]),
                 reserved_after=int(doc["stock_reserved"]),
                 reason=reason, related_order=related_order,
                 canonical={k: doc.get(k) for k in
                             ("product_slug", "variant", "karat",
                              "metal_colour", "ring_size")},
                 mode=doc.get("availability_mode"))
    return doc


async def set_manual_unavailable(db, *, inventory_key: str, value: bool,
                                     reason: Optional[str] = None,
                                     actor: str = "admin") -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    r = await db.inventory.update_one(
        {"inventory_key": inventory_key},
        {"$set": {"manual_unavailable": bool(value), "updated_at": now}},
    )
    if not r.matched_count:
        raise ValueError("INVENTORY_KEY_NOT_FOUND")
    doc = await get_inventory(db, inventory_key)
    await _audit(db, inventory_key=inventory_key,
                 action="mark_unavailable" if value else "re_enable",
                 actor=actor, delta=0,
                 stock_before=int(doc["stock_on_hand"]),
                 stock_after=int(doc["stock_on_hand"]),
                 reserved_before=int(doc["stock_reserved"]),
                 reserved_after=int(doc["stock_reserved"]),
                 reason=reason or ("owner mark unavailable" if value else "owner re-enable"),
                 canonical={k: doc.get(k) for k in
                             ("product_slug", "variant", "karat",
                              "metal_colour", "ring_size")},
                 mode=doc.get("availability_mode"))
    return doc


# ── Availability resolution (customer + checkout) ─────────────────────

def _derive_customer_state(doc: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Public-safe availability payload. Never returns raw stock counts."""
    if not doc:
        return {"mode": MODE_MADE_TO_ORDER, "available": True, "state": "made_to_order"}
    if doc.get("manual_unavailable"):
        return {"mode": doc["availability_mode"], "available": False, "state": "unavailable"}
    mode = doc.get("availability_mode") or MODE_MADE_TO_ORDER
    if mode == MODE_UNAVAILABLE:
        return {"mode": mode, "available": False, "state": "unavailable"}
    if mode == MODE_READY_TO_SHIP:
        avail = int(doc.get("stock_on_hand", 0)) - int(doc.get("stock_reserved", 0))
        if avail <= 0:
            return {"mode": mode, "available": False, "state": "sold_out"}
        return {"mode": mode, "available": True, "state": "ready_to_ship"}
    # made_to_order
    return {"mode": mode, "available": True, "state": "made_to_order"}


async def resolve_availability(db, item: Dict[str, Any]) -> Dict[str, Any]:
    """Public read-only availability for one configuration."""
    key = compute_inventory_key(item)
    doc = await get_inventory(db, key)
    payload = _derive_customer_state(doc)
    payload["inventory_key"] = key
    return payload


# ── Atomic reservation flows ─────────────────────────────────────────

async def try_reserve(db, *, item: Dict[str, Any], qty: int,
                       reservation_group_id: str,
                       order_number: Optional[str] = None,
                       stripe_expires_at: Optional[datetime] = None) -> Tuple[bool, Optional[str], str]:
    """Attempt to reserve `qty` units for one item.

    Returns `(ok, reservation_id, reason)`.

    · If the resolved configuration has no inventory record → treated as
      `made_to_order` → returns `(True, None, "made_to_order")` with no
      reservation created.
    · If the record is `unavailable` or `manual_unavailable` → `(False,
      None, "unavailable")`.
    · If `ready_to_ship` → atomic `$expr` update tries to reserve. On
      success returns `(True, reservation_id, "ready_to_ship")`. On
      failure `(False, None, "OUT_OF_STOCK")`.
    """
    if qty <= 0:
        return False, None, "INVALID_QTY"
    key = compute_inventory_key(item)
    doc = await get_inventory(db, key)
    if not doc:
        return True, None, MODE_MADE_TO_ORDER
    if doc.get("manual_unavailable") or doc.get("availability_mode") == MODE_UNAVAILABLE:
        return False, None, "unavailable"
    if doc.get("availability_mode") == MODE_MADE_TO_ORDER:
        return True, None, MODE_MADE_TO_ORDER
    # ready_to_ship → atomic conditional $inc using $expr
    now = datetime.now(timezone.utc)
    r = await db.inventory.update_one(
        {
            "inventory_key": key,
            "availability_mode": MODE_READY_TO_SHIP,
            "manual_unavailable": {"$ne": True},
            "$expr": {"$gte": [
                {"$subtract": ["$stock_on_hand", "$stock_reserved"]},
                qty,
            ]},
        },
        {
            "$inc": {"stock_reserved": qty},
            "$set": {"updated_at": now},
        },
    )
    if not r.modified_count:
        return False, None, "OUT_OF_STOCK"
    # Create the reservation record.
    reservation_id = f"RSV-{secrets.token_hex(6).upper()}"
    await db.inventory_reservations.insert_one({
        "reservation_id": reservation_id,
        "reservation_group_id": reservation_group_id,
        "inventory_key": key,
        "product_slug": doc.get("product_slug"),
        "quantity": int(qty),
        "status": RES_HELD,
        "order_number": order_number,
        "stripe_checkout_session_id": None,
        "stripe_expires_at": stripe_expires_at,
        "created_at": now,
        "updated_at": now,
    })
    await _audit(db, inventory_key=key, action="reserve", actor="checkout",
                 delta=0,
                 stock_before=int(doc["stock_on_hand"]),
                 stock_after=int(doc["stock_on_hand"]),
                 reserved_before=int(doc["stock_reserved"]),
                 reserved_after=int(doc["stock_reserved"]) + qty,
                 reason=f"reservation {reservation_id} (qty={qty})",
                 related_order=order_number,
                 canonical={k: doc.get(k) for k in
                             ("product_slug", "variant", "karat",
                              "metal_colour", "ring_size")},
                 mode=MODE_READY_TO_SHIP,
                 reservation_id=reservation_id)
    return True, reservation_id, MODE_READY_TO_SHIP


async def attach_session(db, *, reservation_group_id: str,
                          stripe_checkout_session_id: str,
                          order_number: Optional[str] = None,
                          stripe_expires_at: Optional[datetime] = None) -> int:
    """Attach the Stripe Session ID to every reservation in a group after
    the Session is created. Returns number of reservations updated."""
    now = datetime.now(timezone.utc)
    set_doc: Dict[str, Any] = {
        "stripe_checkout_session_id": stripe_checkout_session_id,
        "updated_at": now,
    }
    if order_number:
        set_doc["order_number"] = order_number
    if stripe_expires_at:
        set_doc["stripe_expires_at"] = stripe_expires_at
    r = await db.inventory_reservations.update_many(
        {"reservation_group_id": reservation_group_id, "status": RES_HELD},
        {"$set": set_doc},
    )
    return r.modified_count


async def release_group(db, *, reservation_group_id: str,
                         reason: str = "session_creation_failed") -> int:
    """Release every HELD reservation in a group idempotently. Never
    touches committed or already-released reservations, never causes
    stock_reserved to go negative."""
    now = datetime.now(timezone.utc)
    reservations = [r async for r in db.inventory_reservations.find(
        {"reservation_group_id": reservation_group_id, "status": RES_HELD},
        {"_id": 0},
    )]
    released = 0
    for r in reservations:
        ok = await _atomic_release_one(db, r, reason=reason, now=now)
        if ok:
            released += 1
    return released


async def release_by_session(db, *, stripe_checkout_session_id: str,
                              reason: str) -> int:
    """Release every HELD reservation attached to a Stripe Session. Used
    by `checkout.session.expired` and `checkout.session.async_payment_failed`.
    Idempotent."""
    now = datetime.now(timezone.utc)
    reservations = [r async for r in db.inventory_reservations.find(
        {"stripe_checkout_session_id": stripe_checkout_session_id,
         "status": RES_HELD},
        {"_id": 0},
    )]
    released = 0
    for r in reservations:
        ok = await _atomic_release_one(db, r, reason=reason, now=now)
        if ok:
            released += 1
    return released


async def _atomic_release_one(db, reservation: Dict[str, Any], *,
                                 reason: str, now: datetime) -> bool:
    """Atomically:
       · flip reservation.status held → released (guard against race),
       · decrement inventory.stock_reserved by qty (guard ≥ 0).
    Returns True if this call was the effective releaser."""
    r = await db.inventory_reservations.update_one(
        {"reservation_id": reservation["reservation_id"], "status": RES_HELD},
        {"$set": {"status": RES_RELEASED, "released_reason": reason,
                    "updated_at": now, "released_at": now}},
    )
    if not r.modified_count:
        return False  # someone else already released/committed
    qty = int(reservation["quantity"])
    upd = await db.inventory.update_one(
        {"inventory_key": reservation["inventory_key"],
         "$expr": {"$gte": ["$stock_reserved", qty]}},
        {"$inc": {"stock_reserved": -qty},
         "$set": {"updated_at": now}},
    )
    if upd.modified_count:
        doc = await get_inventory(db, reservation["inventory_key"])
        await _audit(db, inventory_key=reservation["inventory_key"],
                     action="release", actor="webhook", delta=0,
                     stock_before=int(doc["stock_on_hand"]),
                     stock_after=int(doc["stock_on_hand"]),
                     reserved_before=int(doc["stock_reserved"]) + qty,
                     reserved_after=int(doc["stock_reserved"]),
                     reason=reason,
                     related_order=reservation.get("order_number"),
                     canonical=None, mode=doc.get("availability_mode"),
                     reservation_id=reservation["reservation_id"])
    return True


async def commit_by_session(db, *, stripe_checkout_session_id: str,
                              reason: str = "payment_succeeded") -> int:
    """Commit every HELD reservation attached to a Stripe Session, once.

    · flip status HELD → COMMITTED (idempotent — duplicate webhooks are
      no-op).
    · atomic $inc stock_on_hand -= qty AND stock_reserved -= qty guarded
      by (stock_on_hand ≥ qty) AND (stock_reserved ≥ qty).
    """
    now = datetime.now(timezone.utc)
    reservations = [r async for r in db.inventory_reservations.find(
        {"stripe_checkout_session_id": stripe_checkout_session_id,
         "status": RES_HELD},
        {"_id": 0},
    )]
    committed = 0
    for r in reservations:
        flip = await db.inventory_reservations.update_one(
            {"reservation_id": r["reservation_id"], "status": RES_HELD},
            {"$set": {"status": RES_COMMITTED,
                        "committed_at": now, "updated_at": now,
                        "committed_reason": reason}},
        )
        if not flip.modified_count:
            continue  # already committed by a concurrent webhook
        qty = int(r["quantity"])
        upd = await db.inventory.update_one(
            {"inventory_key": r["inventory_key"],
             "$expr": {"$and": [
                 {"$gte": ["$stock_on_hand", qty]},
                 {"$gte": ["$stock_reserved", qty]},
             ]}},
            {"$inc": {"stock_on_hand": -qty, "stock_reserved": -qty},
             "$set": {"updated_at": now}},
        )
        if upd.modified_count:
            doc = await get_inventory(db, r["inventory_key"])
            await _audit(db, inventory_key=r["inventory_key"],
                         action="commit", actor="webhook", delta=-qty,
                         stock_before=int(doc["stock_on_hand"]) + qty,
                         stock_after=int(doc["stock_on_hand"]),
                         reserved_before=int(doc["stock_reserved"]) + qty,
                         reserved_after=int(doc["stock_reserved"]),
                         reason=reason,
                         related_order=r.get("order_number"),
                         canonical=None, mode=doc.get("availability_mode"),
                         reservation_id=r["reservation_id"])
            committed += 1
        else:
            # Extremely rare: guard rejected. Roll back the status flip
            # so a subsequent, safer retry can re-commit.
            await db.inventory_reservations.update_one(
                {"reservation_id": r["reservation_id"],
                    "status": RES_COMMITTED},
                {"$set": {"status": RES_HELD, "updated_at": now}},
            )
    return committed


async def restock_from_rma(db, *, inventory_key: str, qty: int,
                              rma_number: str, item_ref: str,
                              actor: str, note: Optional[str]) -> Dict[str, Any]:
    """Owner-approved physical restock from an inspected RMA line. One
    (rma_number, item_ref) pair may restock at most once — idempotent.
    Refuses if the target configuration is not `ready_to_ship`."""
    if qty <= 0:
        raise ValueError("qty must be positive")
    now = datetime.now(timezone.utc)
    inv = await get_inventory(db, inventory_key)
    if not inv:
        raise ValueError("INVENTORY_KEY_NOT_FOUND")
    if inv.get("availability_mode") != MODE_READY_TO_SHIP:
        raise ValueError("RESTOCK_ONLY_READY_TO_SHIP")
    # Idempotency: unique (rma_number, item_ref) restock ref.
    dup = await db.inventory_audit.find_one({
        "action": "restock", "rma_number": rma_number,
        "item_ref": item_ref,
    })
    if dup:
        raise ValueError("ALREADY_RESTOCKED")
    r = await db.inventory.update_one(
        {"inventory_key": inventory_key,
         "availability_mode": MODE_READY_TO_SHIP},
        {"$inc": {"stock_on_hand": qty},
         "$set": {"updated_at": now}},
    )
    if not r.modified_count:
        raise ValueError("RESTOCK_FAILED")
    updated = await get_inventory(db, inventory_key)
    await _audit(db, inventory_key=inventory_key,
                 action="restock", actor=actor, delta=qty,
                 stock_before=int(inv["stock_on_hand"]),
                 stock_after=int(updated["stock_on_hand"]),
                 reserved_before=int(inv["stock_reserved"]),
                 reserved_after=int(updated["stock_reserved"]),
                 reason=note or f"RMA restock {rma_number}",
                 canonical={k: inv.get(k) for k in
                             ("product_slug", "variant", "karat",
                              "metal_colour", "ring_size")},
                 mode=MODE_READY_TO_SHIP,
                 rma_number=rma_number, item_ref=item_ref)
    return updated


# ── Audit log ────────────────────────────────────────────────────────

async def _audit(db, *, inventory_key: str, action: str, actor: str,
                  delta: int, stock_before: int, stock_after: int,
                  reserved_before: int, reserved_after: int,
                  reason: str, related_order: Optional[str] = None,
                  canonical: Optional[Dict[str, Any]] = None,
                  mode: Optional[str] = None,
                  reservation_id: Optional[str] = None,
                  rma_number: Optional[str] = None,
                  item_ref: Optional[str] = None) -> None:
    await db.inventory_audit.insert_one({
        "at": datetime.now(timezone.utc),
        "inventory_key": inventory_key,
        "action": action,
        "actor": actor,
        "delta": int(delta),
        "stock_before": int(stock_before),
        "stock_after": int(stock_after),
        "reserved_before": int(reserved_before),
        "reserved_after": int(reserved_after),
        "reason": reason,
        "related_order": related_order,
        "canonical_snapshot": canonical,
        "mode_at_audit": mode,
        "reservation_id": reservation_id,
        "rma_number": rma_number,
        "item_ref": item_ref,
    })


# ── Reconciliation helpers ──────────────────────────────────────────

async def stale_reservations(db, *, older_than: Optional[datetime] = None) -> List[Dict[str, Any]]:
    """Return HELD reservations whose Stripe session appears expired.
    Never releases anything — this is a read-only reconciliation feed
    for owner review."""
    now = older_than or datetime.now(timezone.utc)
    cursor = db.inventory_reservations.find(
        {"status": RES_HELD, "stripe_expires_at": {"$lt": now}},
        {"_id": 0},
    ).sort("stripe_expires_at", 1).limit(200)
    return [r async for r in cursor]


async def ensure_indexes(db) -> None:
    """Idempotent index creation for Layer 5 collections."""
    await db.inventory.create_index("inventory_key", unique=True)
    await db.inventory.create_index("product_slug")
    await db.inventory.create_index("availability_mode")
    await db.inventory_reservations.create_index("reservation_id", unique=True)
    await db.inventory_reservations.create_index("reservation_group_id")
    await db.inventory_reservations.create_index("stripe_checkout_session_id")
    await db.inventory_reservations.create_index("status")
    await db.inventory_reservations.create_index("stripe_expires_at")
    await db.inventory_audit.create_index([("inventory_key", 1), ("at", -1)])
    # Idempotency guard for RMA restocks.
    await db.inventory_audit.create_index(
        [("action", 1), ("rma_number", 1), ("item_ref", 1)],
        partialFilterExpression={"action": "restock",
                                    "rma_number": {"$exists": True}},
    )
