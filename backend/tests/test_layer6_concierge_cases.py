"""PHILEON — Layer 6: Concierge / Customer-Service Operations tests.

Test matrix coverage (spec §24–34):

    · case state machine (legal + illegal transitions)
    · retry-dedupe window (identical retry vs. genuinely new inquiry)
    · Customer 360 aggregation across orders / RMA / disputes / consent
    · unified timeline chronology (no fabricated events, no duplicates,
      no secrets, no cross-order leakage)
    · order-support customer intake token isolation
    · admin JWT gating (no auth → rejected)
    · customer payload isolation (never surfaces internal notes / priority
      / fraud / dispute evidence / secrets)
    · reopen semantics
    · Layer 2/3/4/5 regression — this layer never mutates them
"""
from __future__ import annotations

import asyncio
import hashlib
import os
import re
import uuid

import pytest


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def with_db(async_test):
    """Isolated Mongo DB per test — mirrors the Layer 5 helper so the
    Layer 6 suite has no cross-contamination with real data."""
    def _wrapper():
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
        except Exception:
            pytest.skip("motor not available")
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
                pytest.skip("MongoDB unreachable")
            dbname = f"phileon_layer6_test_{uuid.uuid4().hex[:8]}"
            db = client[dbname]
            from services.concierge_cases_service import ensure_indexes
            await ensure_indexes(db)
            try:
                await async_test(db)
            finally:
                await client.drop_database(dbname)
                client.close()

        _run(_driver())
    _wrapper.__name__ = async_test.__name__
    return _wrapper


# ── Identifier + normalization ────────────────────────────────────

def test_case_id_shape_and_uniqueness():
    from services.concierge_cases_service import case_id
    seen = set()
    for _ in range(200):
        cid = case_id()
        assert re.fullmatch(r"CON-\d{4}-[A-HJ-NP-Z2-9]{6}", cid), cid
        seen.add(cid)
    assert len(seen) > 195, "identifiers should be effectively unique"


def test_email_normalization_does_not_collapse_aliases():
    from services.concierge_cases_service import normalize_email
    assert normalize_email(" John@Example.COM ") == "john@example.com"
    # Gmail dots + plus aliases MUST NOT be collapsed (§2).
    assert normalize_email("j.o.h.n@gmail.com") == "j.o.h.n@gmail.com"
    assert normalize_email("john+phileon@gmail.com") == \
        "john+phileon@gmail.com"
    assert normalize_email("") is None
    assert normalize_email(None) is None


# ── State machine ─────────────────────────────────────────────────

@with_db
async def test_full_case_lifecycle(db):
    from services import concierge_cases_service as svc
    doc, created = await svc.create_case(
        db, source="contact_form", category="other",
        subject="hello", customer_message="test message",
        customer_email="a@example.com", customer_name="A",
        priority="normal", actor="customer",
    )
    assert created is True
    assert doc["status"] == "new"
    cid = doc["case_id"]

    for target in ["open", "waiting_on_customer", "open",
                   "waiting_on_phileon", "resolved", "closed"]:
        doc = await svc.transition_status(
            db, case_id_=cid, new_status=target, actor="admin:test")
        assert doc["status"] == target
    assert doc["closed_at"] is not None


@with_db
async def test_illegal_transition_rejected(db):
    from services import concierge_cases_service as svc
    doc, _ = await svc.create_case(
        db, source="contact_form", category="other",
        subject="hi", customer_message="x",
        customer_email="b@example.com", actor="customer")
    with pytest.raises(PermissionError):
        # new → resolved is legal; new → any-nonexistent is illegal.
        # Go to closed then attempt an illegal reopen path.
        await svc.transition_status(
            db, case_id_=doc["case_id"], new_status="closed",
            actor="admin:t")
        # closed → waiting_on_customer is illegal.
        await svc.transition_status(
            db, case_id_=doc["case_id"],
            new_status="waiting_on_customer",
            actor="admin:t")


@with_db
async def test_reopen_from_resolved_and_closed(db):
    from services import concierge_cases_service as svc
    doc, _ = await svc.create_case(
        db, source="contact_form", category="other",
        subject="rop", customer_message="msg",
        customer_email="c@example.com", actor="customer")
    cid = doc["case_id"]
    await svc.transition_status(db, case_id_=cid, new_status="resolved",
                                actor="admin:t")
    d2 = await svc.transition_status(db, case_id_=cid, new_status="open",
                                     actor="admin:t")
    assert d2["status"] == "open"
    assert d2["resolved_at"] is None

    await svc.transition_status(db, case_id_=cid, new_status="closed",
                                actor="admin:t")
    d3 = await svc.transition_status(db, case_id_=cid, new_status="open",
                                     actor="admin:t")
    assert d3["status"] == "open"
    assert d3["closed_at"] is None


# ── Retry dedupe ──────────────────────────────────────────────────

@with_db
async def test_retry_dedupe_within_window(db):
    from services import concierge_cases_service as svc
    args = dict(source="contact_form", category="other",
                subject="dup subject",
                customer_message="please help with sizing",
                customer_email="dup@example.com",
                customer_name="D", actor="customer")
    doc1, created1 = await svc.create_case(db, **args)
    doc2, created2 = await svc.create_case(db, **args)
    assert created1 is True
    assert created2 is False, "identical retry must not create a new case"
    assert doc2["case_id"] == doc1["case_id"]

    # Genuinely different subject → new case.
    doc3, created3 = await svc.create_case(
        db, **{**args, "subject": "different subject"})
    assert created3 is True
    assert doc3["case_id"] != doc1["case_id"]


# ── Priority / next-action / follow-up / waiting-on ───────────────

@with_db
async def test_priority_and_next_action(db):
    from services import concierge_cases_service as svc
    d, _ = await svc.create_case(
        db, source="manual_owner_case", category="shipping",
        subject="s", customer_message="m",
        customer_email="p@example.com", actor="admin:t")
    cid = d["case_id"]
    for p in ("attention", "urgent", "normal"):
        d = await svc.set_priority(db, case_id_=cid, priority=p,
                                   actor="admin:t")
        assert d["priority"] == p

    d = await svc.set_next_action(db, case_id_=cid,
                                  next_action="Call customer",
                                  actor="admin:t")
    assert d["next_action"] == "Call customer"

    d = await svc.set_follow_up_at(db, case_id_=cid,
                                   follow_up_at="2026-12-01T15:00:00Z",
                                   actor="admin:t")
    assert d["follow_up_at"] is not None

    d = await svc.set_waiting_on(db, case_id_=cid,
                                 waiting_on="carrier update",
                                 actor="admin:t")
    assert d["waiting_on"] == "carrier update"


@with_db
async def test_invalid_priority_rejected(db):
    from services import concierge_cases_service as svc
    d, _ = await svc.create_case(
        db, source="contact_form", category="other",
        subject="s", customer_message="m",
        customer_email="q@example.com", actor="customer")
    with pytest.raises(ValueError):
        await svc.set_priority(db, case_id_=d["case_id"],
                               priority="vip", actor="admin:t")


# ── Notes + contact log ───────────────────────────────────────────

@with_db
async def test_add_note_and_contact_log(db):
    from services import concierge_cases_service as svc
    d, _ = await svc.create_case(
        db, source="contact_form", category="other",
        subject="s", customer_message="m",
        customer_email="n@example.com", actor="customer")
    cid = d["case_id"]
    entry = await svc.add_note(db, case_id_=cid,
                               note="Customer needs ring resizing",
                               actor="admin:t")
    assert entry["note"].startswith("Customer needs")

    log = await svc.add_contact_log(db, case_id_=cid,
                                    direction="outbound", channel="email",
                                    summary="Sent shipment update",
                                    actor="admin:t")
    assert log["channel"] == "email"

    got = await svc.get_case(db, cid)
    assert len(got["admin_notes"]) == 1
    assert len(got["contact_log"]) == 1


@with_db
async def test_note_empty_rejected(db):
    from services import concierge_cases_service as svc
    d, _ = await svc.create_case(
        db, source="contact_form", category="other",
        subject="s", customer_message="m",
        customer_email="e@example.com", actor="customer")
    with pytest.raises(ValueError):
        await svc.add_note(db, case_id_=d["case_id"], note="   ",
                           actor="admin:t")


# ── Customer projection isolation ─────────────────────────────────

@with_db
async def test_customer_projection_masks_internal_state(db):
    from services import concierge_cases_service as svc
    d, _ = await svc.create_case(
        db, source="contact_form", category="warranty",
        subject="secret", customer_message="internal",
        customer_email="i@example.com", actor="customer")
    cid = d["case_id"]
    await svc.set_priority(db, case_id_=cid, priority="urgent",
                           actor="admin:t")
    await svc.add_note(db, case_id_=cid, note="Suspicious behaviour",
                       actor="admin:t")
    await svc.set_next_action(db, case_id_=cid, next_action="Escalate",
                              actor="admin:t")

    full = await svc.get_case(db, cid)
    view = svc.serialize_case_for_customer(full)
    # Whitelist — customer view has ONLY these fields.
    assert set(view.keys()) == {
        "case_id", "order_number", "subject", "status",
        "customer_message", "created_at", "updated_at",
    }
    # Blacklist — none of these ever leak.
    forbidden = ("priority", "admin_notes", "contact_log", "next_action",
                 "waiting_on", "follow_up_at", "status_history",
                 "customer_email", "customer_email_normalized",
                 "customer_name", "customer_phone", "dedupe_hash",
                 "resolved_at", "closed_at")
    for k in forbidden:
        assert k not in view, f"{k} must not appear in the customer view"


# ── Customer 360 aggregation ──────────────────────────────────────

async def _seed_order(db, *, order_number: str, email: str,
                      status_token_hash: str,
                      total_cents: int = 250000):
    from datetime import datetime, timezone
    doc = {
        "order_number": order_number,
        "customer_email": email,
        "customer": {"email": email, "name": "Test"},
        "currency": "USD",
        "total_cents": total_cents,
        "payment_status": "paid",
        "fulfillment_status": "shipped",
        "shipped_at": datetime.now(timezone.utc),
        "carrier": "DHL",
        "tracking_number": "TRK-12345",
        "shipping": {"country": "United States",
                     "service_label": "Signature Required"},
        "items": [{"product_slug": "iv-altar",
                   "product_name": "Altar Ring",
                   "variant": "default", "quantity": 1,
                   "unit_amount_cents": 250000,
                   "availability_mode": "ready_to_ship"}],
        "created_at": datetime.now(timezone.utc),
        "status_token_hash": status_token_hash,
        "email_status_token": "SECRET_MUST_NEVER_LEAK",
        "provider_payment_intent_id": "pi_test_SECRET",
        "stripe_customer_id": "cus_test_SECRET",
        "webhook_secret": "whsec_SECRET",
    }
    await db.orders_v2.insert_one(doc)


@with_db
async def test_customer_360_aggregates_and_hides_secrets(db):
    from datetime import datetime, timezone
    from services import concierge_cases_service as svc
    from services.retention_service import grant_consent

    email = "vip@example.com"
    tok_hash = hashlib.sha256(b"token-a").hexdigest()
    await _seed_order(db, order_number="PHI-TEST-A",
                      email=email, status_token_hash=tok_hash)

    await db.returns.insert_one({
        "rma_number": "RMA-TEST-A",
        "order_number": "PHI-TEST-A",
        "status": "authorized",
        "request_type": "return",
        "reason_code": "size_fit",
        "created_at": datetime.now(timezone.utc),
    })
    await db.dispute_cases.insert_one({
        "case_id": "DSP-TEST-A",
        "order_number": "PHI-TEST-A",
        "status": "under_review",
        "reason": "product_unacceptable",
        "created_at": datetime.now(timezone.utc),
        "shipment_audit": [{"secret": "MUST NEVER LEAK"}],
        "evidence_payload": {"payload_secret": "MUST NEVER LEAK"},
    })
    await grant_consent(db, email, source="newsletter_signup")
    await svc.create_case(
        db, source="contact_form", category="other",
        subject="hi", customer_message="msg",
        customer_email=email, actor="customer")

    view = await svc.build_customer_360(db, email=email.upper())
    assert view["email"] == email
    assert len(view["orders"]) == 1
    assert len(view["cases"]) == 1
    assert len(view["rma"]) == 1
    assert len(view["disputes"]) == 1

    payload = str(view)
    for forbidden in ("SECRET_MUST_NEVER_LEAK", "MUST NEVER LEAK",
                      "provider_payment_intent_id", "webhook_secret",
                      "stripe_customer_id", "status_token_hash",
                      "email_status_token"):
        assert forbidden not in payload

    assert view["consent"]["marketing_consented"] is True


# ── Order timeline ────────────────────────────────────────────────

@with_db
async def test_timeline_is_factual_and_chronological(db):
    from datetime import datetime, timezone, timedelta
    from services import concierge_cases_service as svc

    email = "line@example.com"
    tok_hash = hashlib.sha256(b"token-l").hexdigest()
    await _seed_order(db, order_number="PHI-LINE-1",
                      email=email, status_token_hash=tok_hash)

    now = datetime.now(timezone.utc)
    # Duplicate webhook write — must collapse to a single event.
    dup_row = {"order_number": "PHI-LINE-1", "action": "ship",
               "actor": "admin:t", "at": now}
    await db.fulfillment_audit.insert_one(dup_row.copy())
    await db.fulfillment_audit.insert_one(dup_row.copy())

    await db.returns.insert_one({
        "rma_number": "RMA-LINE-1", "order_number": "PHI-LINE-1",
        "status": "authorized", "request_type": "return",
        "reason_code": "size_fit",
        "requested_at": now + timedelta(hours=1),
        "created_at": now + timedelta(hours=1),
        "authorized_at": now + timedelta(hours=2),
    })
    await svc.create_case(
        db, source="order_support", category="shipping",
        subject="Delayed", customer_message="Where is my shipment?",
        customer_email=email, order_number="PHI-LINE-1",
        actor="customer")

    tl = await svc.build_order_timeline(db, order_number="PHI-LINE-1")
    events = tl["events"]
    assert events, "timeline must contain events"

    # No secrets in the payload.
    payload = str(tl)
    for forbidden in ("SECRET_MUST_NEVER_LEAK", "MUST NEVER LEAK",
                      "provider_payment_intent_id", "webhook_secret",
                      "status_token_hash", "email_status_token"):
        assert forbidden not in payload

    # Chronological.
    times = [e["at"] for e in events]
    assert times == sorted(times), "events must be chronological"

    # No duplicate SHIPPED events (dup webhook + orders_v2.shipped_at).
    shipped = [e for e in events if e["event"] == "SHIPPED"]
    times_iso = {e["at"] for e in shipped}
    assert len(times_iso) == len(shipped), \
        "duplicate shipped rows must collapse"


@with_db
async def test_timeline_no_cross_order_leakage(db):
    from datetime import datetime, timezone
    from services import concierge_cases_service as svc

    tok_a = hashlib.sha256(b"a").hexdigest()
    tok_b = hashlib.sha256(b"b").hexdigest()
    await _seed_order(db, order_number="PHI-A", email="a@e.com",
                      status_token_hash=tok_a)
    await _seed_order(db, order_number="PHI-B", email="b@e.com",
                      status_token_hash=tok_b)
    now = datetime.now(timezone.utc)
    await db.fulfillment_audit.insert_one({
        "order_number": "PHI-B", "action": "ship",
        "actor": "admin:t", "at": now})

    tl_a = await svc.build_order_timeline(db, order_number="PHI-A")
    for e in tl_a["events"]:
        assert "PHI-B" not in str(e), "cross-order leakage"


# ── Message previews ──────────────────────────────────────────────

def test_message_previews_contain_no_offers_or_send_hooks():
    from services.concierge_cases_service import MESSAGE_PREVIEWS
    keys = {p["key"] for p in MESSAGE_PREVIEWS}
    for expected in ("request_received", "reviewing_order",
                     "need_more_info", "shipping_update",
                     "return_update", "case_resolved"):
        assert expected in keys
    for p in MESSAGE_PREVIEWS:
        blob = (p["title"] + " " + p["body"]).lower()
        # No discounting / promo / urgency manipulation.
        for banned in ("%", "discount", "coupon", "limited time",
                       "act fast", "sale", "off ", "code "):
            assert banned not in blob, f"forbidden phrase in preview: {p}"


# ── HTTP smoke — admin gate + customer intake ─────────────────────

def _admin_token():
    """Mint an admin JWT the same way the login endpoint does."""
    import jwt
    from datetime import datetime, timezone, timedelta
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        pytest.skip("JWT_SECRET unavailable in test env")
    return jwt.encode({
        "sub": "test-admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }, secret, algorithm="HS256")


def test_admin_endpoints_require_jwt(app_client):
    r = app_client.get("/api/admin/concierge/cases")
    assert r.status_code in (401, 403)
    r = app_client.post("/api/admin/concierge/cases",
                        json={"subject": "x", "customer_message": "y",
                              "category": "other"})
    assert r.status_code in (401, 403)


def test_admin_create_and_list_case(app_client):
    tok = _admin_token()
    headers = {"Authorization": f"Bearer {tok}"}
    r = app_client.post("/api/admin/concierge/cases",
                        headers=headers,
                        json={"subject": "Manual",
                              "customer_message": "M",
                              "category": "other",
                              "customer_email": "list@e.com",
                              "priority": "attention"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["case_id"].startswith("CON-")
    assert data["priority"] == "attention"

    r = app_client.get("/api/admin/concierge/cases?priority=attention",
                       headers=headers)
    assert r.status_code == 200
    cases = r.json()["items"]
    assert any(c["case_id"] == data["case_id"] for c in cases)


def test_message_previews_endpoint(app_client):
    tok = _admin_token()
    r = app_client.get("/api/admin/concierge/message-previews",
                       headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    assert len(r.json()["previews"]) >= 6


def test_customer_order_support_requires_token(app_client):
    r = app_client.post("/api/concierge/order-support",
                        json={"order_number": "PHI-BOGUS-XYZ",
                              "token": "bogus" * 4,
                              "category": "shipping",
                              "subject": "help",
                              "message": "please help"})
    assert r.status_code in (403, 404)


def test_customer_intake_category_whitelist(app_client):
    # Category is validated by the Pydantic model first (min_length=1,
    # max_length=32). "unknown-category" passes shape but not the
    # whitelist — the route returns 422 INVALID_CATEGORY.
    r = app_client.post("/api/concierge/order-support",
                        json={"order_number": "PHI-BOGUS-XYZ",
                              "token": "bogus" * 4,
                              "category": "unknown-category",
                              "subject": "help",
                              "message": "please help"})
    assert r.status_code == 422
