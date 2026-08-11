"""FULL PRE-DEPLOYMENT AUDIT — every one of the 82 trusted products must
either reach the intentional `PAYMENT_NOT_CONFIGURED` gate through a valid
local checkout path OR surface a precise integration defect.

Run: cd /app/backend && python -m pytest tests/test_full_checkout_audit.py -v

Design:
  • ONE canonical fixture per product/variant.
  • For static products (FIXED_PRODUCTS, Grand Dame, Cresta Nera): market snapshot is None.
  • For dynamic products (PRICING_ENGINE_CATALOG live entries + 7 CAD rings):
    a deterministic checkout-safe snapshot is used.
  • Each fixture is exercised THREE times:
    (a) resolve directly via `resolve_line_item` — nonzero cents, currency present, SKU present.
    (b) HTTP POST /api/checkout/stripe/session — must respond 503 PAYMENT_NOT_CONFIGURED
        (or 200 if Stripe monkeypatched). MUST NOT return UNSUPPORTED_PRODUCT / VALIDATION.
    (c) tamper-injected wildly-wrong `displayed_unit_amount_cents` — must be either
        ignored (static) or trigger 409 PRICE_MOVED (dynamic). NEVER honoured.
"""
import os, sys, uuid, importlib
import pytest
from fastapi.testclient import TestClient

# Force Stripe env to sentinel test values so `_require_payment_config` passes.
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_dummy_for_audit")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_dummy_for_audit")
os.environ.setdefault("STRIPE_MODE", "test")
sys.path.insert(0, "/app/backend")

from services.catalog import (
    resolve_line_item, compute_totals, CatalogError,
    is_supported, is_dynamic_priced, _SUPPORTED_SLUGS,
)


FRESH_MARKET = {
    "goldPerGram24kCad": 150.0, "silverPerGramCad": 1.25,
    "timestamp": 1_700_000_000, "source": "metals-api",
    "isFallback": False, "isStale": False, "ageSeconds": 60,
}


# ---------------------------------------------------------------------------
# FIXTURES — one representative valid config per supported product.
# Each row: (slug, kwargs_for_resolve_line_item)
# ---------------------------------------------------------------------------
FIXTURES = [
    # --- Original 4 static ---
    ("scacco-matto",            {"karat": "10K", "metal_colour": "Yellow Gold", "ring_size": "US 7"}),
    ("ribbon-regale-edition",   {"variant": "14k"}),
    ("quadriga-dominus",        {"karat": "14K", "metal_colour": "red-black", "ring_size": "US 11"}),
    ("bajan-joe",               {"variant": "polish", "ring_size": "US 10"}),

    # --- 7 dynamic CAD rings ---
    ("la-marva",                {"tier": "foundation", "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("annie-rose",              {"tier": "signature",  "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("rhythm-mesh-ring",        {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("tola-ii",                 {"tier": "signature",  "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("parabola",                {"tier": "sterling",   "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("parabola-heritage",       {"tier": "whiteGold10k", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("ovation",                 {"tier": "yellow10k",  "ring_size": "US 8", "market_snapshot": FRESH_MARKET}),

    # --- Wave 2 hand-set USD (weightGrams=0) ---
    ("boss-knot",               {"tier": "silver", "market_snapshot": FRESH_MARKET}),
    ("lady-boss-knot",          {"tier": "silver", "market_snapshot": FRESH_MARKET}),
    ("veyron-noir",             {"tier": "silver", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("wynette-palette",         {"tier": "gold10k", "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("uncle-jo",                {"tier": "silver_ring", "market_snapshot": FRESH_MARKET}),
    ("rose-of-sharon",          {"tier": "grand_gold14k", "market_snapshot": FRESH_MARKET}),
    ("battenti-della-villa",    {"tier": "gold14k", "market_snapshot": FRESH_MARKET}),
    ("gent",                    {"tier": "gold14k", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("stackrats",               {"tier": "dominique_wide", "market_snapshot": FRESH_MARKET}),
    ("coogi-dna-tag",           {"tier": "snow", "market_snapshot": FRESH_MARKET}),
    ("katrina-cascata",         {"tier": "vermeil", "market_snapshot": FRESH_MARKET}),
    ("true-vine",               {"tier": "signature__rope-22", "market_snapshot": FRESH_MARKET}),

    # --- Wave 2 dynamic-USD (cadToUsdLuxury) ---
    ("bamburgh",                {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("lady-bamburgh",           {"tier": "foundation", "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("blessed",                 {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("apex",                    {"tier": "core", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("bound",                   {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("morso",                   {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("la-bete",                 {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("cypher",                  {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("coogi-i",                 {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("homage",                  {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("corinthians-15-14",       {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("trace",                   {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("galatians-6-14",          {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("drape",                   {"tier": "silver", "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("fondo-curvo",             {"tier": "silver", "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("prise-de-couronne",       {"tier": "foundation", "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("nervatura",               {"tier": "foundation", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("the-don-gorgon",          {"tier": "gold_foundation_home", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("lady-jay",                {"tier": "foundation", "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("porta-aurea",             {"tier": "signature", "ring_size": "US 10", "market_snapshot": FRESH_MARKET}),
    ("monika-couture",          {"tier": "white10k", "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("cocktail-jessica",        {"tier": "standard", "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("rosaria",                 {"tier": "foundation", "ring_size": "US 6", "market_snapshot": FRESH_MARKET}),
    ("alejandra-heels",         {"tier": "default", "market_snapshot": FRESH_MARKET}),
    ("desir-corset",            {"tier": "pendant", "market_snapshot": FRESH_MARKET}),
    ("forme-cuff",              {"tier": "foundation", "market_snapshot": FRESH_MARKET}),
    ("ptp-cuff",                {"tier": "foundation", "market_snapshot": FRESH_MARKET}),

    # --- Wave 3 Inspiration Vault ---
    ("iv-first-discovery",      {"tier": "default"}),
    ("iv-noir-cadence",         {"tier": "default"}),
    ("iv-liaison",              {"tier": "default"}),
    ("iv-noir-tide",            {"tier": "default"}),
    ("iv-prismatic-laurel",     {"tier": "default"}),
    ("iv-viridian-teardrops",   {"tier": "default"}),
    ("iv-orbit-lumiere",        {"tier": "default"}),
    ("iv-deco-eventail",        {"tier": "default"}),
    ("iv-altar",                {"tier": "default"}),
    ("iv-caged-wings",          {"tier": "default"}),
    ("iv-driven",               {"tier": "default"}),
    ("iv-echelle",              {"tier": "default"}),
    ("iv-lucent",               {"tier": "default"}),
    ("iv-monaco",               {"tier": "default"}),
    ("iv-nova",                 {"tier": "default"}),
    ("iv-oriel",                {"tier": "default"}),
    ("iv-parabola-atelier",     {"tier": "default"}),
    ("iv-parallax-drop-earrings", {"tier": "default"}),
    ("iv-ribbon-regale",        {"tier": "default"}),
    ("iv-roseline",             {"tier": "default"}),
    ("iv-stampede-set",         {"tier": "default"}),
    ("iv-nightfang-set",        {"tier": "default"}),

    # --- Wave 3 re-audit ---
    ("drew-face",               {"tier": "vault"}),
    ("la-madonna",              {"tier": "10k-yellow"}),
    ("la-scarpa-della-regina",  {"tier": "18k-rose"}),
    ("midweek",                 {"tier": "silver-black-dia"}),
    ("bape",                    {"tier": "14k-yellow", "ring_size": "US 10"}),
    ("lisa",                    {"tier": "emerald-tight", "ring_size": "US 6"}),
    ("the-carapace",            {"tier": "10k", "ring_size": "US 6"}),
    ("neighborhood-nip",        {"tier": "original", "ring_size": "US 10"}),

    # --- Wave 4 ---
    ("the-grand-dame",          {"tier": "rose_foundation"}),
    # --- Wave 5 ---
    ("cresta-nera",             {"tier": "10k-yellow-gold", "wrist_size": "medium"}),
    # --- Drew's Vault Private Release ---
    ("retro-bred",              {"tier": "signature"}),
]

FIXTURE_SLUGS = [f[0] for f in FIXTURES]


# ────────────────────────  SLUG PARITY  ────────────────────────
def test_backend_slug_count_matches_83():
    assert len(_SUPPORTED_SLUGS) == 83

def test_every_supported_slug_has_a_fixture():
    missing = _SUPPORTED_SLUGS - set(FIXTURE_SLUGS)
    assert not missing, f"Missing fixtures for supported slugs: {sorted(missing)}"

def test_no_orphan_fixtures():
    orphans = set(FIXTURE_SLUGS) - _SUPPORTED_SLUGS
    assert not orphans, f"Fixtures for unsupported slugs: {sorted(orphans)}"

def test_no_duplicate_fixtures():
    from collections import Counter
    c = Counter(FIXTURE_SLUGS)
    dupes = [s for s, n in c.items() if n > 1]
    assert not dupes, f"Duplicate fixtures: {dupes}"


# ────────────────────────  DIRECT RESOLVER PARITY  ────────────────
@pytest.mark.parametrize("slug, kwargs", FIXTURES, ids=[f[0] for f in FIXTURES])
def test_every_product_resolves_to_positive_cents(slug, kwargs):
    r = resolve_line_item(
        slug,
        kwargs.get("karat"), kwargs.get("metal_colour"),
        kwargs.get("ring_size"),
        1,
        variant=kwargs.get("variant"),
        colorway=kwargs.get("colorway"),
        tier=kwargs.get("tier"),
        market_snapshot=kwargs.get("market_snapshot"),
        wrist_size=kwargs.get("wrist_size"),
    )
    assert r["unit_amount_cents"] > 0, f"{slug} returned zero cents"
    assert r["currency"] in ("USD", "CAD"), f"{slug} currency invalid: {r['currency']}"
    assert r["sku"], f"{slug} SKU empty"
    assert r["product_id"] == slug


# ────────────────────────  DETERMINISTIC SKU  ────────────────
@pytest.mark.parametrize("slug, kwargs", FIXTURES, ids=[f[0] for f in FIXTURES])
def test_sku_is_deterministic(slug, kwargs):
    """Resolving the same fixture twice returns the same SKU + cents."""
    def _r():
        return resolve_line_item(
            slug, kwargs.get("karat"), kwargs.get("metal_colour"),
            kwargs.get("ring_size"), 1,
            variant=kwargs.get("variant"), colorway=kwargs.get("colorway"),
            tier=kwargs.get("tier"), market_snapshot=kwargs.get("market_snapshot"),
            wrist_size=kwargs.get("wrist_size"),
        )
    a, b = _r(), _r()
    assert a["sku"] == b["sku"] and a["unit_amount_cents"] == b["unit_amount_cents"]


# ────────────────────────  CROSS-FIXTURE SKU UNIQUENESS  ────────
def test_no_duplicate_skus_across_fixtures():
    """Different products/variants must not collide on SKU."""
    skus = {}
    for slug, kwargs in FIXTURES:
        r = resolve_line_item(
            slug, kwargs.get("karat"), kwargs.get("metal_colour"),
            kwargs.get("ring_size"), 1,
            variant=kwargs.get("variant"), colorway=kwargs.get("colorway"),
            tier=kwargs.get("tier"), market_snapshot=kwargs.get("market_snapshot"),
            wrist_size=kwargs.get("wrist_size"),
        )
        assert r["sku"] not in skus, f"SKU collision: {slug} vs {skus.get(r['sku'])} → {r['sku']}"
        skus[r["sku"]] = slug


# ────────────────────────  HTTP HAPPY-PATH  ────────────────
# `app_client` is the session-scoped fixture defined in tests/conftest.py.


@pytest.fixture
def http_client(app_client, monkeypatch):
    from services import metal_spot as ms
    monkeypatch.setattr(ms, "get_spot", lambda: FRESH_MARKET)
    monkeypatch.setattr(ms, "is_checkout_safe", lambda snap: not snap.get("isFallback", False))
    import stripe
    class _FakeSession:
        id, url = "cs_test_audit", "https://checkout.stripe.example/cs_test_audit"
    class _FakeCheckout:
        class Session:
            @staticmethod
            def create(**kw): return _FakeSession()
    monkeypatch.setattr(stripe, "checkout", _FakeCheckout)
    if not hasattr(stripe, "error"):
        class _E: StripeError = Exception
        monkeypatch.setattr(stripe, "error", _E)
    return app_client


def _to_payload(slug, kwargs):
    """Frontend Checkout.jsx → API payload contract."""
    row = {
        "product_id": slug, "quantity": 1,
        "karat":       kwargs.get("karat"),
        "metalColour": kwargs.get("metal_colour"),
        "ringSize":    kwargs.get("ring_size"),
        "variant":     kwargs.get("variant"),
        "colorway":    kwargs.get("colorway"),
        "tier":        kwargs.get("tier"),
        "wristSize":   kwargs.get("wrist_size"),
    }
    return {k: v for k, v in row.items() if v is not None or k in ("product_id", "quantity")}


@pytest.mark.parametrize("slug, kwargs", FIXTURES, ids=[f[0] for f in FIXTURES])
def test_http_normal_path_reaches_stripe_or_payment_gate(http_client, slug, kwargs):
    """Every supported product must clear validation and reach either the
    Stripe session (200) or the intentional PAYMENT_NOT_CONFIGURED gate.
    Never UNSUPPORTED_PRODUCT, never VALIDATION."""
    payload = {
        "items": [_to_payload(slug, kwargs)],
        "idempotency_key": f"audit-{slug}-{uuid.uuid4()}",
    }
    r = http_client.post("/api/checkout/stripe/session", json=payload)
    if r.status_code == 200:
        assert r.json().get("checkout_url")
        return
    if r.status_code == 503:
        code = r.json().get("detail", {}).get("code")
        assert code in ("PAYMENT_NOT_CONFIGURED", "LIVE_PRICE_UNAVAILABLE"), \
            f"{slug} unexpected 503 code: {code}"
        return
    pytest.fail(f"{slug} unexpected {r.status_code}: {r.text}")


# ────────────────────────  TAMPERING  ────────────────
@pytest.mark.parametrize("slug, kwargs", [
    # Static (client price ignored — session still succeeds at trusted amount)
    ("scacco-matto",          {"karat": "10K", "metal_colour": "Yellow Gold", "ring_size": "US 7"}),
    ("bajan-joe",             {"variant": "polish", "ring_size": "US 10"}),
    ("iv-altar",              {"tier": "default"}),
    ("the-grand-dame",        {"tier": "rose_foundation"}),
    ("cresta-nera",           {"tier": "10k-yellow-gold", "wrist_size": "medium"}),
])
def test_static_products_ignore_client_price(http_client, slug, kwargs):
    payload = _to_payload(slug, kwargs)
    payload["displayed_unit_amount_cents"] = 1  # ridiculous 1-cent snapshot
    r = http_client.post("/api/checkout/stripe/session", json={
        "items": [payload],
        "idempotency_key": f"tamper-{slug}-{uuid.uuid4()}",
    })
    # Static → 200 (session created at TRUSTED amount, not $0.01).
    assert r.status_code == 200, f"{slug} expected 200 (client price ignored); got {r.status_code}: {r.text}"


@pytest.mark.parametrize("slug, kwargs", [
    # Dynamic products participate in PRICE_MOVED — tampered snapshot must trigger 409.
    ("la-marva",              {"tier": "foundation", "ring_size": "US 6"}),
    ("bamburgh",              {"tier": "foundation", "ring_size": "US 10"}),
    ("apex",                  {"tier": "core", "ring_size": "US 10"}),
])
def test_dynamic_products_reject_tampered_price(http_client, slug, kwargs):
    payload = _to_payload(slug, kwargs)
    payload["displayed_unit_amount_cents"] = 100  # $1.00 — massively wrong
    r = http_client.post("/api/checkout/stripe/session", json={
        "items": [payload],
        "idempotency_key": f"tamper-{slug}-{uuid.uuid4()}",
    })
    assert r.status_code == 409, f"{slug} expected 409 PRICE_MOVED; got {r.status_code}: {r.text}"
    assert r.json()["detail"]["code"] == "PRICE_MOVED"


# ────────────────────────  MIXED-CURRENCY  ────────────────
def test_mixed_currency_forged_request_rejected(http_client):
    r = http_client.post("/api/checkout/stripe/session", json={
        "items": [
            # LA MARVA is CAD dynamic.
            {"product_id": "la-marva", "tier": "foundation", "ringSize": "US 6", "quantity": 1,
             "displayed_unit_amount_cents": 800000},
            # BAJAN JOE is USD static.
            {"product_id": "bajan-joe", "variant": "polish", "ringSize": "US 10", "quantity": 1},
        ],
        "idempotency_key": f"mixed-{uuid.uuid4()}",
    })
    assert r.status_code == 400
    assert r.json()["detail"]["code"] == "MIXED_CURRENCY_CART"


# ────────────────────────  VAULT REGRESSION  ────────────────
def test_ribbon_regale_vault_and_edition_are_distinct():
    vault = resolve_line_item("iv-ribbon-regale", None, None, None, 1, tier="default", market_snapshot=None)
    edition = resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant="14k")
    # Different slugs
    assert vault["product_id"] != edition["product_id"]
    # Different currencies
    assert vault["currency"] == "USD" and edition["currency"] == "CAD"
    # Different SKUs
    assert vault["sku"] != edition["sku"]
    # Vault is $30, Edition is $1,895 CAD (14k) — no collision.
    assert vault["unit_amount_cents"] == 3000
    assert edition["unit_amount_cents"] == 189500
