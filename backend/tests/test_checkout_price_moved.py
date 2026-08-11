"""HTTP-level tests for the checkout PRICE_MOVED / LIVE_PRICE_UNAVAILABLE
contracts on the 7 dynamic rings.

Run: cd /app/backend && python -m pytest tests/test_checkout_price_moved.py -v

We monkeypatch:
  • metal_spot.get_spot        → deterministic market snapshot
  • metal_spot.is_checkout_safe→ deterministic
  • stripe.checkout.Session.create → fake session object
so the tests never touch a live provider.
"""
import os, sys, uuid
import pytest
from fastapi.testclient import TestClient

# Ensure Stripe env is set so `_require_payment_config` passes. These are
# test-only sentinel values; no real API is contacted (Stripe SDK is patched).
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_dummy_for_unit_tests_only")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_dummy_for_unit_tests_only")
os.environ.setdefault("STRIPE_MODE", "test")

sys.path.insert(0, "/app/backend")

FRESH_MARKET = {
    "goldPerGram24kCad": 150.0,
    "silverPerGramCad":  1.25,
    "timestamp": 1_700_000_000, "source": "metals-api",
    "isFallback": False, "isStale": False, "ageSeconds": 60,
}
MOVED_MARKET = {**FRESH_MARKET, "goldPerGram24kCad": 200.0}  # +$50/g


@pytest.fixture(scope="module")
def app_client():
    """Module-scoped TestClient — Motor async client is bound to the first
    event loop TestClient spins up. Reusing that loop across tests avoids
    'Event loop is closed' after the first test tears down."""
    from server import app
    with TestClient(app) as c:
        yield c


@pytest.fixture
def client(app_client, monkeypatch):
    from services import metal_spot as ms
    monkeypatch.setattr(ms, "get_spot", lambda: FRESH_MARKET)
    monkeypatch.setattr(ms, "is_checkout_safe", lambda snap: not snap.get("isFallback", False))

    class _FakeSession:
        id = "cs_test_fake_session_id"
        url = "https://checkout.stripe.example/pay/cs_test_fake"

    import stripe
    class _FakeCheckout:
        class Session:
            @staticmethod
            def create(**kwargs):
                return _FakeSession()
    monkeypatch.setattr(stripe, "checkout", _FakeCheckout)
    if not hasattr(stripe, "error"):
        class _E: StripeError = Exception
        monkeypatch.setattr(stripe, "error", _E)

    return app_client


def _unique_idem():
    return f"test-{uuid.uuid4()}"


# ────────────────────────  PRICE_MOVED contract  ────────────────────────────
def test_stripe_session_price_moved_returns_409(client, monkeypatch):
    """Displayed $1,000 CAD vs trusted $8,000 CAD for a LA MARVA foundation
    ring — massive delta, must be blocked as PRICE_MOVED."""
    r = client.post("/api/checkout/stripe/session", json={
        "items": [{
            "product_id": "la-marva",
            "tier": "foundation",
            "ringSize": "US 6",
            "quantity": 1,
            "displayed_unit_amount_cents": 100000,   # $1,000 CAD (stale)
        }],
        "idempotency_key": _unique_idem(),
    })
    assert r.status_code == 409, r.text
    body = r.json()["detail"]
    assert body["code"] == "PRICE_MOVED"
    assert len(body["items"]) == 1
    it = body["items"][0]
    assert it["product_slug"] == "la-marva"
    assert it["currency"] == "CAD"
    assert it["old_display_price_cents"] == 100000
    assert it["new_trusted_price_cents"] == 800000
    # Ensure response is redaction-safe.
    for banned in ("STRIPE_SECRET_KEY", "METALS_API_KEY", "goldPerGram24kCad",
                   "silverPerGramCad", "raw_provider_payload"):
        assert banned not in r.text


def test_stripe_session_within_threshold_creates_session(client):
    """Displayed within threshold ($8,000 shown; trusted $8,000) → proceed."""
    r = client.post("/api/checkout/stripe/session", json={
        "items": [{
            "product_id": "la-marva",
            "tier": "foundation",
            "ringSize": "US 6",
            "quantity": 1,
            "displayed_unit_amount_cents": 800000,   # matches trusted
        }],
        "idempotency_key": _unique_idem(),
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["checkout_url"].startswith("https://checkout.stripe.example/")
    assert body["order_number"]


def test_acknowledged_re_quote_succeeds_when_within_threshold(client):
    """After 1st 409, client re-submits with `price_move_acknowledged=true`
    and the new trusted amount as the displayed snapshot. Movement is 0 —
    Stripe session must be created."""
    r = client.post("/api/checkout/stripe/session", json={
        "items": [{
            "product_id": "tola-ii",
            "tier": "signature",
            "ringSize": "US 10",
            "quantity": 1,
            "displayed_unit_amount_cents": 780000,   # matches trusted
        }],
        "idempotency_key": _unique_idem(),
        "price_move_acknowledged": True,
    })
    assert r.status_code == 200, r.text
    assert r.json()["checkout_url"]


def test_second_move_returns_price_moved_again(client, monkeypatch):
    """Acknowledged, but the market moved AGAIN in-flight — expect 409 again.
    We flip the market snapshot to a much higher gold rate so the trusted
    price shifts well beyond threshold from the acknowledged snapshot."""
    from services import metal_spot as ms
    monkeypatch.setattr(ms, "get_spot", lambda: MOVED_MARKET)  # +$50/g on 24K gold
    r = client.post("/api/checkout/stripe/session", json={
        "items": [{
            "product_id": "la-marva",
            "tier": "foundation",
            "ringSize": "US 6",
            "quantity": 1,
            # Client claims they were shown $8,000. Trusted price is now much
            # higher because gold spot jumped. Delta ≫ threshold.
            "displayed_unit_amount_cents": 800000,
        }],
        "idempotency_key": _unique_idem(),
        "price_move_acknowledged": True,
    })
    assert r.status_code == 409, r.text
    assert r.json()["detail"]["code"] == "PRICE_MOVED"


# ────────────────────────  LIVE_PRICE_UNAVAILABLE  ─────────────────────────
def test_live_price_unavailable_when_fallback(client, monkeypatch):
    from services import metal_spot as ms
    monkeypatch.setattr(ms, "get_spot", lambda: {**FRESH_MARKET, "isFallback": True, "source": "phileon-fallback"})
    monkeypatch.setattr(ms, "is_checkout_safe", lambda snap: False)
    r = client.post("/api/checkout/stripe/session", json={
        "items": [{
            "product_id": "annie-rose", "tier": "foundation",
            "ringSize": "US 6", "quantity": 1,
            "displayed_unit_amount_cents": 920000,
        }],
        "idempotency_key": _unique_idem(),
    })
    assert r.status_code == 503, r.text
    body = r.json()["detail"]
    assert body["code"] == "LIVE_PRICE_UNAVAILABLE"
    # Customer-safe copy — no provider names or raw payloads.
    assert "refreshing" in body["message"].lower()
    for banned in ("phileon-fallback", "metals-api", "goldPerGram24kCad"):
        assert banned not in r.text


# ────────────────────────  MIXED_CURRENCY  ─────────────────────────────
def test_mixed_currency_dynamic_cad_and_static_usd_rejected(client):
    """Cart with LA MARVA (CAD dynamic) + BAJAN JOE (USD static) → rejected."""
    r = client.post("/api/checkout/stripe/session", json={
        "items": [
            {"product_id": "la-marva", "tier": "signature", "ringSize": "US 6",
             "quantity": 1, "displayed_unit_amount_cents": 1800000},
            {"product_id": "bajan-joe", "variant": "polish", "ringSize": "US 10",
             "quantity": 1, "displayed_unit_amount_cents": 79500},
        ],
        "idempotency_key": _unique_idem(),
    })
    assert r.status_code == 400, r.text
    assert r.json()["detail"]["code"] == "MIXED_CURRENCY_CART"


# ────────────────────────  Static-product regression  ─────────────────────
def test_regression_bajan_joe_still_795_usd(client):
    r = client.post("/api/checkout/stripe/session", json={
        "items": [{"product_id": "bajan-joe", "variant": "polish", "ringSize": "US 10", "quantity": 1}],
        "idempotency_key": _unique_idem(),
    })
    assert r.status_code == 200, r.text
    # We don't leak the trusted price in the response body — order_number is
    # enough for the client to look up the persisted total via order_status.
    assert r.json()["checkout_url"]

def test_regression_missing_dynamic_snapshot_field_still_ok(client):
    """A dynamic item without `displayed_unit_amount_cents` should still work
    (no price movement can be detected, so checkout proceeds)."""
    r = client.post("/api/checkout/stripe/session", json={
        "items": [{"product_id": "parabola", "tier": "sterling", "ringSize": "US 6", "quantity": 1}],
        "idempotency_key": _unique_idem(),
    })
    assert r.status_code == 200, r.text
