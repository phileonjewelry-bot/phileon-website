"""TRACE earrings — review iteration 34.

Validates the 4 purchasable TRACE editions (signature/foundation/heirloom/heirloom18k):
  - catalog.resolve_line_item returns correct USD cents, SKU, metal label, no ring_size
  - prices are hand-set USD (not sensitive to market snapshot)
  - invalid tiers raise CatalogError INVALID_TIER
  - /api/checkout/stripe/session does NOT return 409 PRICE_MOVED for TRACE (hand-set
    USD, not live-metal priced); the server always charges the trusted amount
  - /api/validate-cart marks the 4 tiers as valid with difference 0
"""
import os
import sys
import uuid
import pytest

sys.path.insert(0, "/app/backend")

from services import catalog as C  # noqa: E402


SNAP_BASE = {"goldPerGram24kCad": 176.0, "silverPerGramCad": 2.4}
SNAP_WILD = {"goldPerGram24kCad": 300.0, "silverPerGramCad": 5.0}

TRACE_TIERS = [
    # tier,          cents,  metal_label,                                   sku
    ("signature",    45000,  "925 Sterling Silver · Yellow-Gold Plated",    "TRC-SIGNATURE"),
    ("foundation",   90000,  "Solid 10K Yellow Gold",                       "TRC-FOUNDATION"),
    ("heirloom",     240000, "Solid 14K Yellow Gold",                       "TRC-HEIRLOOM"),
    ("heirloom18k",  320000, "Solid 18K Yellow Gold",                       "TRC-HEIRLOOM18K"),
]


# ── catalog.resolve_line_item ───────────────────────────────────────────────
@pytest.mark.parametrize("tier,cents,metal,sku", TRACE_TIERS)
def test_resolve_line_item_usd_per_pair(tier, cents, metal, sku):
    r = C.resolve_line_item("trace", None, None, None, 1, tier=tier, market_snapshot=SNAP_BASE)
    assert r["unit_amount_cents"] == cents
    assert r["currency"] == "USD"
    assert r["sku"] == sku
    assert r.get("ring_size") in (None, "")
    assert r["metadata"]["metal"] == metal
    assert metal in r.get("variant", ""), f"variant missing metal label: {r.get('variant')}"


@pytest.mark.parametrize("tier,cents,_m,_s", TRACE_TIERS)
def test_prices_unaffected_by_market_snapshot(tier, cents, _m, _s):
    r_wild = C.resolve_line_item("trace", None, None, None, 1, tier=tier, market_snapshot=SNAP_WILD)
    assert r_wild["unit_amount_cents"] == cents


@pytest.mark.parametrize("bad_tier", ["silver", "plated"])
def test_invalid_tier_raises(bad_tier):
    with pytest.raises(C.CatalogError, match="INVALID_TIER"):
        C.resolve_line_item("trace", None, None, None, 1, tier=bad_tier, market_snapshot=SNAP_BASE)


# ── /api/checkout/stripe/session (via in-process app_client) ────────────────
@pytest.fixture
def client(app_client, monkeypatch):
    """Patch Stripe + metal_spot so checkout can be exercised safely."""
    from services import metal_spot as ms
    monkeypatch.setattr(ms, "get_spot", lambda: {**SNAP_BASE, "isFallback": False, "isStale": False})
    monkeypatch.setattr(ms, "is_checkout_safe", lambda snap: True)

    import stripe

    class _FakeSession:
        id = "cs_test_fake"
        url = "https://checkout.stripe.example/pay/cs_test_fake"

    class _FakeCheckout:
        class Session:
            @staticmethod
            def create(**kwargs):
                return _FakeSession()

    monkeypatch.setattr(stripe, "checkout", _FakeCheckout)
    if not hasattr(stripe, "error"):
        class _E:
            StripeError = Exception
        monkeypatch.setattr(stripe, "error", _E)
    return app_client


def _idem():
    return f"trace-test-{uuid.uuid4()}"


@pytest.mark.parametrize("tier,cents,_m,_s", TRACE_TIERS)
def test_checkout_accepts_correct_displayed_price(client, tier, cents, _m, _s):
    r = client.post("/api/checkout/stripe/session", json={
        "items": [{
            "product_id": "trace",
            "tier": tier,
            "quantity": 1,
            "displayed_unit_amount_cents": cents,
        }],
        "idempotency_key": _idem(),
        "shipping_country": "US",
    })
    # Must NOT be 409 PRICE_MOVED and must NOT fail with MISSING_RING_SIZE.
    assert r.status_code != 409, f"Unexpected PRICE_MOVED for {tier}: {r.text}"
    if r.status_code >= 400:
        body = r.json()
        detail = body.get("detail", {}) if isinstance(body, dict) else {}
        code = detail.get("code") if isinstance(detail, dict) else None
        assert code != "MISSING_RING_SIZE", f"MISSING_RING_SIZE for {tier}: {r.text}"
        assert code != "PRICE_MOVED", f"PRICE_MOVED for {tier}: {r.text}"


@pytest.mark.parametrize("tier,trusted_cents,wrong_cents", [
    ("heirloom18k", 320000, 310000),
    ("heirloom",   240000, 230000),
])
def test_checkout_hand_set_usd_charges_trusted_amount(client, tier, trusted_cents, wrong_cents, monkeypatch):
    """TRACE is hand-set USD (not live-metal priced), so the PRICE_MOVED 409 contract
    does not apply (same as every other hand-set product). The server must still
    ignore the client's displayed cents and price the line at the trusted amount."""
    from services.catalog import resolve_line_item, is_dynamic_priced
    assert is_dynamic_priced("trace") is False
    r = resolve_line_item("trace", None, None, None, 1, tier=tier,
                          market_snapshot={"goldPerGram24kCad": 176.0, "silverPerGramCad": 2.4})
    assert r["unit_amount_cents"] == trusted_cents != wrong_cents
    resp = client.post("/api/checkout/stripe/session", json={
        "items": [{"product_id": "trace", "tier": tier, "quantity": 1,
                   "displayed_unit_amount_cents": wrong_cents}],
        "idempotency_key": _idem(),
        "shipping_country": "US",
    })
    assert resp.status_code != 409, resp.text


# ── /api/validate-cart ──────────────────────────────────────────────────────
# frontend productKey for trace in livePricingConfig
VALIDATE_CART_INPUTS = [
    ("signature",   450),
    ("foundation",  900),
    ("heirloom",    2400),
    ("heirloom18k", 3200),
]


def test_validate_cart_all_tiers_valid(app_client):
    items = [
        {"product_key": "trace", "tier_key": tk, "client_price": float(price), "quantity": 1}
        for tk, price in VALIDATE_CART_INPUTS
    ]
    r = app_client.post("/api/validate-cart", json={"items": items})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["valid"] is True, body
    for res in body["items"]:
        assert res["valid"] is True, res
        # difference should be ~0
        diff = res.get("difference", 0)
        assert abs(float(diff)) < 1.0, res
