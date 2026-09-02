"""End-to-end Stripe TEST-mode session-create per destination.

Hits the RUNNING backend at REACT_APP_BACKEND_URL (supervisor-managed) so
STRIPE_SECRET_KEY is already loaded from backend/.env. Creates one Session
per zone against the live Stripe TEST API and verifies that the Session
actually carries the trusted single shipping option and locked
`allowed_countries`. No payment is executed.
"""
import os
import uuid
import pytest
import requests
import stripe


def _load_env(name):
    # Always parse the .env file directly — pytest doesn't inherit the
    # supervisor's env, and `os.environ` may hold a stale copy from a prior
    # test module import.
    try:
        with open("/app/backend/.env") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, val = line.split("=", 1)
                    if k.strip() == name:
                        return val.strip().strip('"')
    except FileNotFoundError:
        return None
    return None


STRIPE_KEY = _load_env("STRIPE_SECRET_KEY") or ""
BACKEND_URL = None
try:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BACKEND_URL = line.split("=", 1)[1].strip()
                break
except FileNotFoundError:
    pass


if not STRIPE_KEY.startswith("sk_test_") or not BACKEND_URL:
    pytest.skip("Stripe TEST key or REACT_APP_BACKEND_URL not configured", allow_module_level=True)


@pytest.fixture(autouse=True)
def _bind_stripe_key():
    """Re-bind stripe.api_key inside every test — other test modules mutate
    the module-level `stripe.api_key`, so a one-shot binding at import time
    is not durable across the full suite."""
    stripe.api_key = STRIPE_KEY
    yield


def _new_cart():
    return [{"product_id": "ribbon-regale-edition", "quantity": 1, "variant": "plated",
             "displayed_unit_amount_cents": 35000}]


@pytest.mark.parametrize("country,zone_cents,zone_display", [
    ("CA", 0,    "Standard Shipping — Canada"),
    ("US", 3500, "Standard Shipping — United States"),
    ("GB", 6500, "International Standard — Tier 1"),
    ("MX", 9500, "International Standard — Tier 2"),
])
def test_end_to_end_session_per_country(country, zone_cents, zone_display):
    idem = f"phi-audit-{country}-{uuid.uuid4().hex[:8]}"
    r = requests.post(f"{BACKEND_URL}/api/checkout/stripe/session", json={
        "items": _new_cart(),
        "customer_email": "phileon-audit-noop@phileon.com",
        "idempotency_key": idem,
        "price_move_acknowledged": False,
        "shipping_country": country,
    }, timeout=30)
    assert r.status_code == 200, r.text
    order_number = r.json()["order_number"]

    # Locate the just-created session in Stripe by metadata public_order_number.
    listing = stripe.checkout.Session.list(limit=10)
    match = next((s for s in listing.data
                  if (s.metadata or {}).get("public_order_number") == order_number), None)
    assert match is not None, f"session for {order_number} not found in recent list"

    assert match.get("mode") == "payment"
    assert match.get("payment_status") == "unpaid"
    assert match.get("currency") == "usd"

    # allowed_countries locked to the shopper's selected country.
    ac = (match.get("shipping_address_collection") or {}).get("allowed_countries")
    assert ac == [country], f"allowed_countries must equal [{country}], got {ac}"

    # Fetch resolved shipping_options via full retrieve.
    full = stripe.checkout.Session.retrieve(match.id, expand=["shipping_options"])
    opts_full = full.get("shipping_options") or []
    assert len(opts_full) == 1, f"expected exactly ONE shipping option, got {len(opts_full)}"
    opt = opts_full[0]
    sr_id = opt.get("shipping_rate")
    if sr_id:
        sr = stripe.ShippingRate.retrieve(sr_id if isinstance(sr_id, str) else sr_id["id"])
        assert sr.get("fixed_amount", {}).get("amount") == zone_cents
        assert sr.get("fixed_amount", {}).get("currency") == "usd"
        assert sr.get("display_name") == zone_display
    else:
        srd = opt.get("shipping_rate_data") or {}
        assert srd.get("fixed_amount", {}).get("amount") == zone_cents
        assert srd.get("fixed_amount", {}).get("currency") == "usd"
        assert srd.get("display_name") == zone_display


def test_session_rejects_unsupported_destination():
    idem = f"phi-audit-KP-{uuid.uuid4().hex[:8]}"
    r = requests.post(f"{BACKEND_URL}/api/checkout/stripe/session", json={
        "items": _new_cart(),
        "customer_email": "phileon-audit-noop@phileon.com",
        "idempotency_key": idem,
        "price_move_acknowledged": False,
        "shipping_country": "KP",
    }, timeout=30)
    assert r.status_code == 400
    assert r.json()["detail"]["code"] == "UNSUPPORTED_DESTINATION"


def test_client_cannot_inject_shipping_money_extra_fields():
    idem = f"phi-audit-inj-{uuid.uuid4().hex[:8]}"
    r = requests.post(f"{BACKEND_URL}/api/checkout/stripe/session", json={
        "items": _new_cart(),
        "customer_email": "phileon-audit-noop@phileon.com",
        "idempotency_key": idem,
        "price_move_acknowledged": False,
        "shipping_country": "CA",
        "shipping_amount": 99999,
        "rate_cents": 1,
        "zone_price": 42,
        "shipping_total": 12345,
        "carrier_price": 4321,
    }, timeout=30)
    assert r.status_code == 422


def test_session_requires_shipping_country():
    idem = f"phi-audit-nocountry-{uuid.uuid4().hex[:8]}"
    r = requests.post(f"{BACKEND_URL}/api/checkout/stripe/session", json={
        "items": _new_cart(),
        "customer_email": "phileon-audit-noop@phileon.com",
        "idempotency_key": idem,
        "price_move_acknowledged": False,
    }, timeout=30)
    assert r.status_code == 422


def test_orders_v2_shipping_cents_matches_trusted_zone_at_session_create():
    """Reads the freshly persisted OrderV2 to confirm `shipping_cents` was
    set to the trusted zone value BEFORE any webhook fires."""
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = _load_env("MONGO_URL")
    db_name = _load_env("DB_NAME")
    if not mongo_url or not db_name:
        pytest.skip("MONGO_URL / DB_NAME not configured")

    idem = f"phi-audit-us-{uuid.uuid4().hex[:8]}"
    r = requests.post(f"{BACKEND_URL}/api/checkout/stripe/session", json={
        "items": _new_cart(),
        "customer_email": "phileon-audit-noop@phileon.com",
        "idempotency_key": idem,
        "price_move_acknowledged": False,
        "shipping_country": "US",
    }, timeout=30)
    assert r.status_code == 200, r.text
    order_number = r.json()["order_number"]

    async def _read():
        c = AsyncIOMotorClient(mongo_url)
        db = c[db_name]
        doc = await db.orders_v2.find_one({"order_number": order_number}, {"_id": 0})
        c.close()
        return doc

    doc = asyncio.run(_read())
    assert doc is not None
    assert doc["shipping_cents"] == 3500
    assert doc["total_cents"] == doc["subtotal_cents"] + 3500 + doc.get("tax_cents", 0)
    assert doc["currency"] == "USD"
    assert (doc.get("shipping") or {}).get("zone_key") == "US"
    assert (doc.get("shipping") or {}).get("country") == "US"


def test_historical_order_phi_20260901_4cbc5c_untouched():
    """Historical CAD order must remain immutable throughout Phase 1 rollout."""
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = _load_env("MONGO_URL")
    db_name = _load_env("DB_NAME")

    async def _read():
        c = AsyncIOMotorClient(mongo_url)
        db = c[db_name]
        doc = await db.orders_v2.find_one({"order_number": "PHI-20260901-4CBC5C"}, {"_id": 0})
        c.close()
        return doc

    doc = asyncio.run(_read())
    assert doc is not None
    assert doc["currency"] == "CAD"
    assert doc["total_cents"] == 2265000
    assert doc["payment_status"] == "paid"
    # New shipping block absent — historical order was never migrated.
    assert doc.get("shipping") in (None, {})
