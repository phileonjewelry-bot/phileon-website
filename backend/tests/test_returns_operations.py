"""PHILEON — Returns / RMA / Refund (Layer 3) regression tests."""
from __future__ import annotations
import asyncio
from datetime import datetime, timezone, timedelta
from types import SimpleNamespace

import pytest


def _run(coro):
    return asyncio.run(coro)


# ────────────────────────────────────────────────────────────────
# UNIT: policy classification
# ────────────────────────────────────────────────────────────────

def test_classify_gold_variants():
    from services.returns_service import classify_item_policy
    assert classify_item_policy({"variant": "10K Yellow Gold"}) == "eligible_gold"
    assert classify_item_policy({"variant": "18K White Gold"}) == "eligible_gold"
    assert classify_item_policy({"karat": "14K", "metal_colour": "Yellow"}) == "eligible_gold"
    assert classify_item_policy({"variant": "Gold-Plated Vermeil"}) == "eligible_gold"


def test_classify_silver_final_sale():
    from services.returns_service import classify_item_policy
    assert classify_item_policy({"variant": "Sterling Silver"}) == "silver"
    assert classify_item_policy({"variant": "silver"}) == "silver"


def test_classify_custom_and_flags():
    from services.returns_service import classify_item_policy
    assert classify_item_policy({"variant": "Custom Atelier"}) == "custom"
    assert classify_item_policy({"variant": "10K Yellow Gold", "is_custom": True}) == "custom"
    assert classify_item_policy({"variant": "10K Gold", "is_engraved": True}) == "engraved"
    assert classify_item_policy({"variant": "10K Gold", "is_resized": True}) == "resized"


def test_classify_unknown_when_insufficient_metadata():
    from services.returns_service import classify_item_policy
    assert classify_item_policy({"product_name": "X"}) == "unknown"
    assert classify_item_policy({"variant": ""}) == "unknown"


# ────────────────────────────────────────────────────────────────
# UNIT: eligibility engine
# ────────────────────────────────────────────────────────────────

def _gold_order(**overrides):
    d = {
        "payment_status": "paid",
        "delivered_at": datetime.now(timezone.utc) - timedelta(days=10),
        "items": [{"product_name": "LA MARVA", "variant": "14K Yellow Gold",
                    "quantity": 1, "unit_amount_cents": 350000}],
    }
    d.update(overrides)
    return d


def test_eligibility_happy_path_within_window():
    from services.returns_service import evaluate_item_eligibility
    order = _gold_order()
    v = evaluate_item_eligibility(order, order["items"][0])
    assert v.eligible is True
    assert v.policy_class == "eligible_gold"


def test_eligibility_outside_window():
    from services.returns_service import evaluate_item_eligibility
    order = _gold_order(delivered_at=datetime.now(timezone.utc) - timedelta(days=31))
    v = evaluate_item_eligibility(order, order["items"][0])
    assert v.eligible is False
    assert "outside_return_window" in v.reasons


def test_eligibility_silver_final_sale():
    from services.returns_service import evaluate_item_eligibility
    order = _gold_order()
    v = evaluate_item_eligibility(order, {"variant": "Sterling Silver",
                                            "quantity": 1, "unit_amount_cents": 32000})
    assert v.eligible is False
    assert any(r.startswith("final_sale:silver") for r in v.reasons)


def test_eligibility_delivery_date_unverified_routes_owner_review():
    from services.returns_service import evaluate_item_eligibility
    order = _gold_order(delivered_at=None)
    v = evaluate_item_eligibility(order, order["items"][0])
    assert v.eligible is False
    assert v.owner_review_required is True
    assert "delivery_date_unverified" in v.reasons


def test_eligibility_shipped_at_is_NOT_a_delivery_date_substitute():
    """Layer 3 completion pass — PHILEON policy is 30 days from DELIVERY,
    never from SHIPMENT. `shipped_at` must never start the return clock.
    """
    from services.returns_service import evaluate_item_eligibility
    order = _gold_order(delivered_at=None,
                         shipped_at=datetime.now(timezone.utc) - timedelta(days=10))
    v = evaluate_item_eligibility(order, order["items"][0])
    assert v.eligible is False, "shipped_at MUST NOT satisfy delivery date"
    assert v.owner_review_required is True
    assert "delivery_date_unverified" in v.reasons


def test_eligibility_owner_verified_delivery_at_supersedes_missing_delivered_at():
    from services.returns_service import evaluate_item_eligibility
    order = _gold_order(delivered_at=None,
                         shipped_at=datetime.now(timezone.utc) - timedelta(days=25),
                         owner_verified_delivery_at=datetime.now(timezone.utc) - timedelta(days=10))
    v = evaluate_item_eligibility(order, order["items"][0])
    assert v.eligible is True
    assert v.policy_class == "eligible_gold"


def test_eligibility_unpaid_blocks():
    from services.returns_service import evaluate_item_eligibility
    order = _gold_order(payment_status="pending")
    v = evaluate_item_eligibility(order, order["items"][0])
    assert v.eligible is False
    assert "payment_not_paid" in v.reasons


def test_eligibility_already_refunded_blocks():
    from services.returns_service import evaluate_item_eligibility
    order = _gold_order(payment_status="refunded")
    v = evaluate_item_eligibility(order, order["items"][0])
    assert v.eligible is False


# ────────────────────────────────────────────────────────────────
# UNIT: refund calculation
# ────────────────────────────────────────────────────────────────

def test_refund_calculation_uses_original_snapshot():
    from services.returns_service import calculate_refund_cents
    order = {"currency": "USD",
             "items": [{"quantity": 1, "unit_amount_cents": 350000},
                        {"quantity": 2, "unit_amount_cents": 32000}]}
    cents, cur = calculate_refund_cents(order, [0])
    assert cents == 350000 and cur == "USD"
    cents, _ = calculate_refund_cents(order, [1])
    assert cents == 64000
    cents, _ = calculate_refund_cents(order, [0, 1])
    assert cents == 414000
    # Out-of-range indices ignored.
    cents, _ = calculate_refund_cents(order, [99])
    assert cents == 0


# ────────────────────────────────────────────────────────────────
# UNIT: reason routing
# ────────────────────────────────────────────────────────────────

def test_warranty_reasons_route_to_warranty():
    from services.returns_service import request_type_for_reason
    assert request_type_for_reason("arrived_damaged") == "warranty"
    assert request_type_for_reason("suspected_defect") == "warranty"
    assert request_type_for_reason("changed_mind") == "return"
    assert request_type_for_reason("bogus") == "other_support"


# ────────────────────────────────────────────────────────────────
# UNIT: state machine
# ────────────────────────────────────────────────────────────────

def test_state_machine_transitions():
    from services.returns_service import can_transition
    assert can_transition(None, "requested")
    assert can_transition("requested", "authorized")
    assert can_transition("authorized", "received")
    assert can_transition("received", "inspection_passed")
    assert can_transition("inspection_passed", "refund_approved")
    assert can_transition("refund_approved", "refunded")
    assert can_transition("refunded", "closed")
    # Illegal
    assert not can_transition("closed", "requested")
    assert not can_transition("refunded", "denied")
    assert not can_transition("denied", "authorized")
    assert not can_transition(None, "authorized")


# ────────────────────────────────────────────────────────────────
# UNIT: RMA number
# ────────────────────────────────────────────────────────────────

def test_rma_number_format_and_uniqueness():
    from services.returns_service import new_rma_number
    a = new_rma_number()
    b = new_rma_number()
    yr = str(datetime.now(timezone.utc).year)
    assert a.startswith(f"RMA-{yr}-") and len(a) == len(f"RMA-{yr}-") + 6
    assert a != b


# ────────────────────────────────────────────────────────────────
# ADMIN ROUTE — FakeDb-driven integration tests
# ────────────────────────────────────────────────────────────────

class _FakeColl:
    def __init__(self, docs=None, key="rma_number"):
        self.key = key
        self.docs = list(docs or [])

    async def find_one(self, filt, projection=None):
        for d in self.docs:
            if all(d.get(k) == v for k, v in filt.items()
                   if not (isinstance(v, dict) and "$nin" in v or isinstance(v, dict) and "$in" in v)):
                # Also honor $nin and $in
                ok = True
                for k, v in filt.items():
                    if isinstance(v, dict):
                        if "$nin" in v and d.get(k) in v["$nin"]:
                            ok = False; break
                        if "$in" in v and d.get(k) not in v["$in"]:
                            ok = False; break
                    elif d.get(k) != v:
                        ok = False; break
                if ok:
                    return dict(d)
        return None

    async def insert_one(self, doc):
        self.docs.append(dict(doc))
        class R: inserted_id = "x"
        return R()

    async def update_one(self, filt, update):
        for i, d in enumerate(self.docs):
            if all(d.get(k) == v for k, v in filt.items()
                   if not isinstance(v, dict)):
                for k, v in (update.get("$set") or {}).items():
                    d[k] = v
                self.docs[i] = d
                class R: matched_count = 1
                return R()
        class R: matched_count = 0
        return R()

    def find(self, filt, projection=None):
        parent = self
        class _C:
            def sort(self, *a, **k): return self
            def limit(self, n):
                self._n = n
                return self
            def __aiter__(self):
                items = list(parent.docs)
                async def gen():
                    for x in items:
                        yield dict(x)
                return gen()
        return _C()


def _install_fake_db(monkeypatch, orders=None, returns=None):
    from routes import returns as mod
    fake = SimpleNamespace(
        orders_v2=_FakeColl(orders or [], key="order_number"),
        returns=_FakeColl(returns or [], key="rma_number"),
        returns_audit=_FakeColl([], key="rma_number"),
    )
    monkeypatch.setattr(mod, "db", fake)
    return fake, mod


# Fixture: paid gold order with hashable token
def _paid_gold_order():
    from services.returns_service import RETURN_WINDOW_DAYS  # noqa
    import hashlib
    tok = "customer-token-plaintext-abc123"
    return {
        "order_number": "PHI-TEST-RTN-1",
        "status_token_hash": hashlib.sha256(tok.encode()).hexdigest(),
        "customer_email": "buyer@example.com",
        "payment_status": "paid",
        "delivered_at": datetime.now(timezone.utc) - timedelta(days=10),
        "items": [{"product_name": "LA MARVA", "variant": "14K Yellow Gold",
                    "ring_size": "US 7", "quantity": 1, "unit_amount_cents": 350000}],
        "currency": "USD", "total_cents": 350000,
    }, tok


def test_customer_request_creates_case(monkeypatch):
    from routes import returns as mod
    order, tok = _paid_gold_order()
    _install_fake_db(monkeypatch, orders=[order])
    body = mod.ReturnRequestIn(order_number=order["order_number"], token=tok,
                                 reason="changed_mind", note="Wrong style")
    r = _run(mod.customer_request_return(body))
    assert r["order_number"] == order["order_number"]
    assert r["status"] == "requested"
    assert r["rma_number"].startswith("RMA-")
    assert "customer_message" in r


def test_customer_request_invalid_token_403(monkeypatch):
    from fastapi import HTTPException
    from routes import returns as mod
    order, _ = _paid_gold_order()
    _install_fake_db(monkeypatch, orders=[order])
    body = mod.ReturnRequestIn(order_number=order["order_number"],
                                 token="WRONG-TOKEN", reason="changed_mind")
    with pytest.raises(HTTPException) as exc:
        _run(mod.customer_request_return(body))
    assert exc.value.status_code == 403


def test_customer_request_warranty_routes_to_review(monkeypatch):
    from routes import returns as mod
    order, tok = _paid_gold_order()
    _install_fake_db(monkeypatch, orders=[order])
    body = mod.ReturnRequestIn(order_number=order["order_number"], token=tok,
                                 reason="suspected_defect")
    r = _run(mod.customer_request_return(body))
    assert r["status"] == "under_review"
    assert r["request_type"] == "warranty"


def test_customer_request_duplicate_active_rma_blocked(monkeypatch):
    from fastapi import HTTPException
    from routes import returns as mod
    order, tok = _paid_gold_order()
    existing = {"rma_number": "RMA-2026-AAAAAA",
                "order_number": order["order_number"], "status": "authorized"}
    _install_fake_db(monkeypatch, orders=[order], returns=[existing])
    body = mod.ReturnRequestIn(order_number=order["order_number"], token=tok,
                                 reason="changed_mind")
    with pytest.raises(HTTPException) as exc:
        _run(mod.customer_request_return(body))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "ACTIVE_RMA_EXISTS"


def test_customer_request_silver_denied_immediately(monkeypatch):
    from routes import returns as mod
    order, tok = _paid_gold_order()
    order["items"] = [{"product_name": "X", "variant": "Sterling Silver",
                        "quantity": 1, "unit_amount_cents": 32000}]
    _install_fake_db(monkeypatch, orders=[order])
    body = mod.ReturnRequestIn(order_number=order["order_number"], token=tok,
                                 reason="changed_mind")
    r = _run(mod.customer_request_return(body))
    assert r["status"] == "denied"


def test_admin_authorize_flow(monkeypatch):
    from routes import returns as mod
    order, tok = _paid_gold_order()
    _install_fake_db(monkeypatch, orders=[order])
    body = mod.ReturnRequestIn(order_number=order["order_number"], token=tok,
                                 reason="changed_mind")
    created = _run(mod.customer_request_return(body))
    rma = created["rma_number"]
    r = _run(mod.authorize(rma, mod.AuthorizeIn(return_instructions="Send to PO Box 123"),
                             _admin="admin"))
    assert r["status"] == "authorized"
    assert r["return_instructions"] == "Send to PO Box 123"


def test_admin_full_happy_path(monkeypatch):
    from routes import returns as mod
    order, tok = _paid_gold_order()
    _install_fake_db(monkeypatch, orders=[order])
    body = mod.ReturnRequestIn(order_number=order["order_number"], token=tok,
                                 reason="changed_mind")
    c = _run(mod.customer_request_return(body))
    rma = c["rma_number"]
    _run(mod.authorize(rma, mod.AuthorizeIn(), _admin="admin"))
    _run(mod.receive(rma, mod.ReceiveIn(condition_note="Box intact"),
                       _admin="admin"))
    _run(mod.inspect(rma, mod.InspectIn(result="pass"), _admin="admin"))
    refunded = _run(mod.approve_refund(rma, mod.RefundIn(), _admin="admin"))
    assert refunded["status"] == "refund_approved"
    assert refunded["refund_amount_base_cents"] == 350000
    assert refunded["refund_currency_base"] == "USD"


def test_admin_deny_flow(monkeypatch):
    from routes import returns as mod
    order, tok = _paid_gold_order()
    _install_fake_db(monkeypatch, orders=[order])
    c = _run(mod.customer_request_return(mod.ReturnRequestIn(
        order_number=order["order_number"], token=tok, reason="changed_mind")))
    r = _run(mod.deny(c["rma_number"], mod.DenyIn(reason="outside policy"),
                        _admin="admin"))
    assert r["status"] == "denied"


def test_admin_inspect_fail_then_deny(monkeypatch):
    from routes import returns as mod
    order, tok = _paid_gold_order()
    _install_fake_db(monkeypatch, orders=[order])
    c = _run(mod.customer_request_return(mod.ReturnRequestIn(
        order_number=order["order_number"], token=tok, reason="changed_mind")))
    rma = c["rma_number"]
    _run(mod.authorize(rma, mod.AuthorizeIn(), _admin="admin"))
    _run(mod.receive(rma, mod.ReceiveIn(), _admin="admin"))
    r = _run(mod.inspect(rma, mod.InspectIn(result="fail", notes="Signs of wear"),
                           _admin="admin"))
    assert r["status"] == "inspection_failed"
    r2 = _run(mod.deny(rma, mod.DenyIn(reason="Failed inspection: wear"),
                         _admin="admin"))
    assert r2["status"] == "denied"


def test_refund_blocked_on_historical_order(monkeypatch):
    from fastapi import HTTPException
    from routes import returns as mod
    from services.returns_service import new_rma_number
    order, _ = _paid_gold_order()
    order["order_number"] = "PHI-20260901-4CBC5C"
    case = {"rma_number": new_rma_number(),
            "order_number": "PHI-20260901-4CBC5C",
            "status": "inspection_passed",
            "items_snapshot": [{"index": 0, "eligible": True, "policy_class": "eligible_gold"}]}
    _install_fake_db(monkeypatch, orders=[order], returns=[case])
    with pytest.raises(HTTPException) as exc:
        _run(mod.approve_refund(case["rma_number"], mod.RefundIn(), _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "LOCKED_HISTORICAL_ORDER"


def test_refund_wrong_state_blocked(monkeypatch):
    from fastapi import HTTPException
    from routes import returns as mod
    from services.returns_service import new_rma_number
    order, _ = _paid_gold_order()
    case = {"rma_number": new_rma_number(),
            "order_number": order["order_number"],
            "status": "requested",
            "items_snapshot": [{"index": 0, "eligible": True, "policy_class": "eligible_gold"}]}
    _install_fake_db(monkeypatch, orders=[order], returns=[case])
    with pytest.raises(HTTPException) as exc:
        _run(mod.approve_refund(case["rma_number"], mod.RefundIn(), _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "INVALID_TRANSITION"


def test_double_refund_protection(monkeypatch):
    from fastapi import HTTPException
    from routes import returns as mod
    from services.returns_service import new_rma_number
    order, _ = _paid_gold_order()
    case = {"rma_number": new_rma_number(),
            "order_number": order["order_number"],
            "status": "inspection_passed",
            "stripe_refund_id": "re_test_ALREADY",
            "items_snapshot": [{"index": 0, "eligible": True, "policy_class": "eligible_gold"}]}
    _install_fake_db(monkeypatch, orders=[order], returns=[case])
    with pytest.raises(HTTPException) as exc:
        _run(mod.approve_refund(case["rma_number"], mod.RefundIn(), _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "REFUND_ALREADY_ISSUED"


def test_verify_delivery_recomputes_eligibility(monkeypatch):
    from routes import returns as mod
    order, tok = _paid_gold_order()
    order["delivered_at"] = None  # forces owner_review
    _install_fake_db(monkeypatch, orders=[order])
    c = _run(mod.customer_request_return(mod.ReturnRequestIn(
        order_number=order["order_number"], token=tok, reason="changed_mind")))
    assert c["status"] == "under_review"
    d = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
    r = _run(mod.verify_delivery(c["rma_number"], mod.VerifyDeliveryIn(delivered_at=d),
                                    _admin="admin"))
    # After verification eligibility should be true for the gold item
    assert any(s.get("eligible") for s in (r.get("items_snapshot") or []))


def test_admin_get_returns_case_and_audit(monkeypatch):
    from routes import returns as mod
    order, tok = _paid_gold_order()
    _install_fake_db(monkeypatch, orders=[order])
    c = _run(mod.customer_request_return(mod.ReturnRequestIn(
        order_number=order["order_number"], token=tok, reason="changed_mind")))
    r = _run(mod.admin_get_return(c["rma_number"], _admin="admin"))
    assert r["rma_number"] == c["rma_number"]
    assert isinstance(r.get("audit"), list) and len(r["audit"]) >= 1


def test_admin_list_invalid_status_400(monkeypatch):
    from fastapi import HTTPException
    from routes import returns as mod
    _install_fake_db(monkeypatch)
    with pytest.raises(HTTPException) as exc:
        _run(mod.admin_list_returns(status="bogus", limit=10, q=None,
                                       _admin="admin"))
    assert exc.value.status_code == 400


def test_admin_list_returns_serialization_omits_secrets(monkeypatch):
    from routes import returns as mod
    order, tok = _paid_gold_order()
    _install_fake_db(monkeypatch, orders=[order])
    _run(mod.customer_request_return(mod.ReturnRequestIn(
        order_number=order["order_number"], token=tok, reason="changed_mind")))
    r = _run(mod.admin_list_returns(status="all", limit=10, q=None,
                                       _admin="admin"))
    body = str(r)
    for banned in ("status_token_hash", "email_status_token",
                    "webhook_event_ids", "provider_session_id"):
        assert banned not in body


def test_forbid_extra_fields():
    from routes.returns import ReturnRequestIn, AuthorizeIn, DenyIn, InspectIn, RefundIn
    with pytest.raises(Exception):
        ReturnRequestIn(order_number="x", token="y", reason="changed_mind",
                         total_cents=1)
    with pytest.raises(Exception):
        AuthorizeIn(note="ok", stripe_refund_id="re_LEAK")
    with pytest.raises(Exception):
        DenyIn(reason="x", fulfillment_status="shipped")
    with pytest.raises(Exception):
        RefundIn(amount_cents=1)
