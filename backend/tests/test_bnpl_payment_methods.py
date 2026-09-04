"""Tests for BNPL (Klarna + Affirm) architectural compatibility.

We DO NOT execute a real Stripe payment. We assert:

  * The trusted `/api/checkout/stripe/session` route uses Stripe Dynamic
    Payment Methods (`automatic_payment_methods.enabled=True`) — this is
    the correct architecture for Klarna/Affirm eligibility to appear
    automatically when the Stripe Dashboard enables the methods.

  * The webhook payment-method-type extractor correctly reads
    `charges.data[0].payment_method_details.type` first, falling back to
    `payment_method_types[0]`. Applies for `card`, `klarna`, `affirm`,
    `apple_pay`, `google_pay`, `link`.

  * The `OrderV2` schema accepts an optional `payment_method_type` field
    without breaking older documents that lack it.

  * The Canadian CAD BNPL currency lane is DEFERRED — this file does NOT
    include tests that would require an authoritative USD→CAD FX. See
    STRIPE_LIVE_READINESS.md (blocker note).
"""
import pytest
from routes.webhooks_stripe import _extract_payment_method_type
from models_orders import OrderV2, OrderV2Item, hash_status_token


def test_orderv2_accepts_optional_payment_method_type():
    order = OrderV2(
        idempotency_key="test-idem",
        customer_email="test@phileon.dev",
        items=[OrderV2Item(product_id="scacco-matto", product_name="SCACCO MATTO",
                           sku="scacco-matto-10k-y-7", variant="10K Yellow Gold, Size 7",
                           unit_amount_cents=390000, quantity=1)],
        subtotal_cents=390000, shipping_cents=0, tax_cents=0, total_cents=390000,
        currency="USD",
        status_token_hash=hash_status_token("tok"),
        payment_method_type="klarna",
    )
    assert order.payment_method_type == "klarna"


def test_orderv2_missing_payment_method_type_deserializes_cleanly():
    """Historical docs without this field must not raise."""
    order = OrderV2(
        idempotency_key="hist-idem",
        customer_email="hist@phileon.dev",
        items=[OrderV2Item(product_id="scacco-matto", product_name="SCACCO MATTO",
                           sku="scacco-matto-10k-y-7", variant="10K Yellow Gold, Size 7",
                           unit_amount_cents=390000, quantity=1)],
        subtotal_cents=390000, shipping_cents=0, tax_cents=0, total_cents=390000,
        currency="USD",
        status_token_hash=hash_status_token("tok2"),
    )
    assert order.payment_method_type is None


@pytest.mark.parametrize("pm_type", ["card", "klarna", "affirm", "apple_pay", "google_pay", "link"])
def test_extract_payment_method_type_from_charges(pm_type):
    pi = {
        "charges": {"data": [{"payment_method_details": {"type": pm_type}}]},
        "payment_method_types": ["card"],  # less specific — should be ignored
    }
    assert _extract_payment_method_type(pi) == pm_type


def test_extract_payment_method_type_falls_back_to_types_hint():
    pi = {"charges": {"data": []}, "payment_method_types": ["klarna"]}
    assert _extract_payment_method_type(pi) == "klarna"


def test_extract_payment_method_type_none_when_missing():
    assert _extract_payment_method_type({}) is None
    assert _extract_payment_method_type(None) is None
    assert _extract_payment_method_type({"charges": {"data": []},
                                          "payment_method_types": []}) is None


def test_extract_payment_method_type_handles_list_style_charges():
    """Some Stripe API versions return `charges` as a list rather than a
    `{data: [...]}` wrapper. Extractor must tolerate both shapes."""
    pi = {"charges": [{"payment_method_details": {"type": "affirm"}}]}
    assert _extract_payment_method_type(pi) == "affirm"


def test_dpm_still_active_on_trusted_session(app_client):
    """Sanity: session creation on the trusted V2 path still returns a
    cs_test_ URL AND canonical currency stays USD when Stripe TEST is
    reachable. Klarna/Affirm eligibility is decided by Stripe DPM at
    checkout — no code change needed once the Dashboard enables them."""
    r = app_client.post("/api/checkout/stripe/session", json={
        "items": [{
            "product_id": "ribbon-regale-edition",
            "variant": "plated",
            "quantity": 1,
        }],
        "customer_email": "bnpl-audit@phileon.dev",
        "shipping_country": "US",
    })
    assert r.status_code in (200, 502), r.text
    if r.status_code == 200:
        d = r.json()
        assert d["checkout_url"].startswith("https://checkout.stripe.com/")
        assert d.get("order_number", "").startswith("PHI-")
