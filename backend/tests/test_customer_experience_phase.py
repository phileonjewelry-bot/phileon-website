"""PHILEON — Customer Experience Phase regression tests.

Covers:
  1. Ring-Size Guide default lead-time fallback exposed by the order-status endpoint.
  2. Admin shipment endpoint auth boundary (JWT required).
  3. Admin shipment endpoint idempotency — the customer shipment email
     fires exactly ONCE per shipment event even under duplicate calls.
  4. Order-status endpoint token boundary + fulfillment/tracking exposure.
  5. Shipment-email builder — includes carrier/tracking, excludes Stripe /
     webhook / FX / DB internals, unsafe tracking URLs stripped.
"""
import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest


# ────────────────────────  Shipment email builder  ─────────────────────────
def test_shipment_email_builder_includes_expected_fields():
    from services.order_emails import build_customer_shipment_email
    order = {
        "order_number": "PHI-TEST-SHIP-1",
        "currency": "USD",
        "total_cents": 350000,
        "items": [{"product_name": "SCACCO MATTO", "variant": "14K Yellow Gold · Size 7",
                   "quantity": 1, "unit_amount_cents": 350000}],
        "carrier": "UPS",
        "tracking_number": "1Z999AA10123456784",
        "tracking_url": "https://www.ups.com/track?tracknum=1Z999AA10123456784",
        "customer_email": "buyer@example.com",
    }
    out = build_customer_shipment_email(order)
    assert "Shipped" in out["subject"]
    assert "PHI-TEST-SHIP-1" in out["subject"]
    # Every required customer-visible fact is present.
    assert "PHI-TEST-SHIP-1" in out["html"]
    assert "SCACCO MATTO" in out["html"]
    assert "14K Yellow Gold · Size 7" in out["html"]
    assert "UPS" in out["html"]
    assert "1Z999AA10123456784" in out["html"]
    assert "https://www.ups.com/track?tracknum=1Z999AA10123456784" in out["html"]
    assert "$3,500.00 USD" in out["html"]


def test_shipment_email_excludes_internal_details():
    """Never leaks Stripe IDs, webhook metadata, FX rates, or DB identifiers."""
    from services.order_emails import build_customer_shipment_email
    order = {
        "order_number": "PHI-TEST-SHIP-2",
        "currency": "USD",
        "total_cents": 350000,
        "items": [{"product_name": "X", "variant": "v", "quantity": 1,
                   "unit_amount_cents": 350000}],
        "carrier": "FedEx",
        "tracking_number": "T-1",
        "tracking_url": "https://fedex.com/t/T-1",
        "customer_email": "buyer@example.com",
        # Simulated internal fields — MUST NOT leak into the outbound email.
        "provider_session_id": "cs_test_LEAK",
        "provider_payment_intent_id": "pi_LEAK",
        "id": "internal-uuid-LEAK",
        "presentment": {"fx_rate": 1.38, "fx_rate_source": "frankfurter",
                        "stripe_presentment_currency": "CAD"},
        "webhook_event_ids": ["evt_LEAK"],
        "status_token_hash": "STATUS_TOKEN_HASH_LEAK",
    }
    out = build_customer_shipment_email(order)
    banned = ["cs_test_LEAK", "pi_LEAK", "internal-uuid-LEAK",
              "frankfurter", "evt_LEAK", "STATUS_TOKEN_HASH_LEAK",
              "fx_rate", "webhook"]
    combined = out["html"] + out["text"] + out["subject"]
    for token in banned:
        assert token not in combined, f"Leak of {token!r} in shipment email"


def test_shipment_email_strips_unsafe_tracking_url():
    from services.order_emails import build_customer_shipment_email
    order = {
        "order_number": "PHI-TEST-SHIP-3",
        "currency": "USD",
        "total_cents": 10000,
        "items": [{"product_name": "X", "variant": "v", "quantity": 1,
                   "unit_amount_cents": 10000}],
        "carrier": "UPS",
        "tracking_number": "TN1",
        "tracking_url": "javascript:alert('x')",  # unsafe
        "customer_email": "buyer@example.com",
    }
    out = build_customer_shipment_email(order)
    assert "javascript:" not in out["html"]
    assert "TRACK YOUR SHIPMENT" not in out["html"]  # no anchor for unsafe href


# ────────────────────────  Admin shipment endpoint  ─────────────────────────
def test_admin_mark_shipped_requires_auth(app_client):
    """No token → 401/403. Never leaks whether the order exists."""
    resp = app_client.post(
        "/api/admin/orders/PHI-DOES-NOT-EXIST/mark-shipped",
        json={"carrier": "UPS", "tracking_number": "X"},
    )
    assert resp.status_code in (401, 403), resp.text


def test_admin_mark_shipped_rejects_bad_token(app_client):
    resp = app_client.post(
        "/api/admin/orders/PHI-DOES-NOT-EXIST/mark-shipped",
        json={"carrier": "UPS", "tracking_number": "X"},
        headers={"Authorization": "Bearer not-a-valid-jwt"},
    )
    assert resp.status_code == 401


def _admin_headers():
    """Mint a legit admin JWT the same way server.admin_login would."""
    from server import create_token
    return {"Authorization": f"Bearer {create_token('admin')}"}


def test_admin_mark_shipped_endpoint_registered(app_client):
    """With a valid admin token but no such order → 404 NOT_FOUND (not 401/403).
    Confirms the router is mounted under /api and auth passes."""
    resp = app_client.post(
        "/api/admin/orders/PHI-DOES-NOT-EXIST/mark-shipped",
        json={"carrier": "UPS", "tracking_number": "X"},
        headers=_admin_headers(),
    )
    assert resp.status_code == 404, resp.text
    body = resp.json()
    assert body.get("detail", {}).get("code") == "NOT_FOUND"


def test_admin_mark_shipped_rejects_extra_fields(app_client):
    """`extra="forbid"` on MarkShippedIn — no arbitrary field injection."""
    resp = app_client.post(
        "/api/admin/orders/PHI-DOES-NOT-EXIST/mark-shipped",
        json={"carrier": "UPS", "tracking_number": "X",
              "fulfillment_status": "delivered",  # not allowed on this route
              "total_cents": 1},
        headers=_admin_headers(),
    )
    assert resp.status_code == 422


# ────────────────  Admin shipment atomic transition + email  ────────────────
def _run(coro):
    return asyncio.run(coro)


class _FakeOrdersCollection:
    def __init__(self, doc):
        self.doc = dict(doc)
        self.email_calls = []

    async def find_one(self, q, projection=None):
        if q.get("order_number") == self.doc.get("order_number"):
            return dict(self.doc)
        return None

    async def find_one_and_update(self, filt, update, return_document=True):
        # Simulate exclusive gate — only match when flag hasn't been set.
        if "shipping_notification_sent" in filt:
            required_ne = filt["shipping_notification_sent"].get("$ne")
            if self.doc.get("shipping_notification_sent") == required_ne:
                return None
        # Apply $set and return post-update snapshot.
        for k, v in (update.get("$set") or {}).items():
            self.doc[k] = v
        return dict(self.doc)

    async def update_one(self, filt, update):
        for k, v in (update.get("$set") or {}).items():
            self.doc[k] = v

        class R: matched_count = 1
        return R()


def test_mark_shipped_first_call_sends_email_second_is_noop(monkeypatch):
    from routes import admin_orders as admin_orders_mod
    from services import order_emails as oe

    fake_orders = _FakeOrdersCollection({
        "id": "ord-A",
        "order_number": "PHI-TEST-SHIP-A",
        "payment_status": "paid",
        "shipping_notification_sent": False,
        "currency": "USD",
        "total_cents": 350000,
        "customer_email": "buyer@example.com",
        "items": [{"product_name": "X", "variant": "v", "quantity": 1,
                   "unit_amount_cents": 350000}],
    })

    async def _fake_send(to, subject, html, text):
        fake_orders.email_calls.append({"to": to, "subject": subject})
        return {"status": "sent", "id": f"mock-{len(fake_orders.email_calls)}"}

    monkeypatch.setattr(oe, "send_email", _fake_send)
    monkeypatch.setattr(admin_orders_mod, "db", SimpleNamespace(orders_v2=fake_orders))

    body = admin_orders_mod.MarkShippedIn(
        carrier="UPS",
        tracking_number="1Z999AA10123456784",
        tracking_url="https://ups.com/track/1Z999AA10123456784",
    )

    r1 = _run(admin_orders_mod.mark_shipped("PHI-TEST-SHIP-A", body, _admin="admin"))
    assert r1["ok"] is True and r1["email_sent"] is True
    assert fake_orders.doc["fulfillment_status"] == "shipped"
    assert fake_orders.doc["carrier"] == "UPS"
    assert fake_orders.doc["tracking_number"] == "1Z999AA10123456784"
    assert fake_orders.doc["shipping_notification_sent"] is True
    assert len(fake_orders.email_calls) == 1

    # Second call — atomic gate must block a duplicate email.
    r2 = _run(admin_orders_mod.mark_shipped("PHI-TEST-SHIP-A", body, _admin="admin"))
    assert r2["ok"] is True and r2["email_sent"] is False
    assert len(fake_orders.email_calls) == 1  # still exactly ONE email


def test_mark_shipped_rejects_unpaid_order(monkeypatch):
    from fastapi import HTTPException
    from routes import admin_orders as admin_orders_mod

    fake_orders = _FakeOrdersCollection({
        "order_number": "PHI-TEST-SHIP-B",
        "payment_status": "pending",
        "items": [], "currency": "USD", "total_cents": 0,
        "customer_email": "buyer@example.com",
    })
    monkeypatch.setattr(admin_orders_mod, "db", SimpleNamespace(orders_v2=fake_orders))

    body = admin_orders_mod.MarkShippedIn(carrier="UPS", tracking_number="X")
    with pytest.raises(HTTPException) as exc:
        _run(admin_orders_mod.mark_shipped("PHI-TEST-SHIP-B", body, _admin="admin"))
    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "NOT_PAID"


# ────────────────  Customer order-status endpoint  ────────────────
def test_order_status_rejects_missing_token(app_client):
    r = app_client.get("/api/checkout/order/PHI-DOES-NOT-EXIST/status")
    assert r.status_code == 422  # `token` is a required query param


def test_order_status_rejects_invalid_token(app_client):
    r = app_client.get("/api/checkout/order/PHI-DOES-NOT-EXIST/status?token=nope")
    # Never leaks whether the order exists — 404 for absent order is safe,
    # but if the order exists the token check returns 403.
    assert r.status_code in (403, 404)


def test_order_status_default_dispatch_estimate(monkeypatch):
    """When `dispatch_estimate` is unset on the order document, the endpoint
    surfaces the approved fallback copy — never invents a lead time."""
    import asyncio as _aio
    from routes import checkout as checkout_route
    from models_orders import hash_status_token

    token = "test-token-abc"
    fake_doc = {
        "order_number": "PHI-STATUS-1",
        "status_token_hash": hash_status_token(token),
        "payment_status": "paid",
        "currency": "USD",
        "total_cents": 350000,
        "items": [{"product_name": "X", "variant": "v", "quantity": 1,
                   "unit_amount_cents": 350000}],
        # No dispatch_estimate, no fulfillment_status, no tracking.
    }

    class _DB:
        class orders_v2:
            @staticmethod
            async def find_one(q, projection=None):
                if q.get("order_number") == fake_doc["order_number"]:
                    return dict(fake_doc)
                return None

    monkeypatch.setattr(checkout_route, "get_db", lambda: _DB)
    resp = _aio.run(checkout_route.order_status("PHI-STATUS-1", token))
    assert resp["dispatch_estimate"] == "Production timing confirmed after order."
    assert resp["carrier"] is None
    assert resp["tracking_number"] is None


def test_order_status_surfaces_tracking_when_shipped(monkeypatch):
    import asyncio as _aio
    from routes import checkout as checkout_route
    from models_orders import hash_status_token

    token = "another-token"
    fake_doc = {
        "order_number": "PHI-STATUS-2",
        "status_token_hash": hash_status_token(token),
        "payment_status": "paid",
        "currency": "USD",
        "total_cents": 350000,
        "fulfillment_status": "shipped",
        "carrier": "UPS",
        "tracking_number": "1Z999",
        "tracking_url": "https://ups.com/track/1Z999",
        "dispatch_estimate": "Shipped from Toronto",
        "items": [{"product_name": "X", "variant": "v", "quantity": 1,
                   "unit_amount_cents": 350000}],
    }

    class _DB:
        class orders_v2:
            @staticmethod
            async def find_one(q, projection=None):
                if q.get("order_number") == fake_doc["order_number"]:
                    return dict(fake_doc)
                return None

    monkeypatch.setattr(checkout_route, "get_db", lambda: _DB)
    resp = _aio.run(checkout_route.order_status("PHI-STATUS-2", token))
    assert resp["fulfillment_status"] == "shipped"
    assert resp["carrier"] == "UPS"
    assert resp["tracking_number"] == "1Z999"
    assert resp["tracking_url"] == "https://ups.com/track/1Z999"
    assert resp["dispatch_estimate"] == "Shipped from Toronto"
    # Never leaks internals.
    for banned in ("_id", "status_token_hash", "webhook_event_ids",
                   "provider_session_id", "provider_payment_intent_id",
                   "idempotency_key"):
        assert banned not in resp


def test_order_status_does_not_leak_internal_fields(monkeypatch):
    """Ensure Stripe, webhook, FX and DB internals never appear in the
    customer-facing response, even if present on the underlying document."""
    import asyncio as _aio
    from routes import checkout as checkout_route
    from models_orders import hash_status_token

    token = "leak-check-token"
    fake_doc = {
        "order_number": "PHI-STATUS-3",
        "status_token_hash": hash_status_token(token),
        "payment_status": "paid",
        "currency": "USD",
        "total_cents": 350000,
        "id": "internal-uuid",
        "idempotency_key": "shopper@example.com:cart-fp",
        "provider_session_id": "cs_test_ABC123",
        "provider_payment_intent_id": "pi_ABC123",
        "webhook_event_ids": ["evt_1", "evt_2"],
        "presentment": {"fx_rate": 1.38, "fx_rate_source": "frankfurter"},
        "items": [{"product_name": "X", "variant": "v", "quantity": 1,
                   "unit_amount_cents": 350000}],
    }

    class _DB:
        class orders_v2:
            @staticmethod
            async def find_one(q, projection=None):
                if q.get("order_number") == fake_doc["order_number"]:
                    return dict(fake_doc)
                return None

    monkeypatch.setattr(checkout_route, "get_db", lambda: _DB)
    resp = _aio.run(checkout_route.order_status("PHI-STATUS-3", token))
    banned_keys = {"id", "idempotency_key", "provider_session_id",
                   "provider_payment_intent_id", "webhook_event_ids",
                   "status_token_hash", "presentment", "fx_rate",
                   "fx_rate_source"}
    assert banned_keys.isdisjoint(resp.keys())
    # And check flattened value string does not leak Stripe IDs.
    import json as _json
    blob = _json.dumps(resp)
    assert "cs_test_" not in blob
    assert "pi_ABC" not in blob
    assert "evt_1" not in blob
    assert "frankfurter" not in blob
