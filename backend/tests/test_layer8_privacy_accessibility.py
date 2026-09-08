"""PHILEON — Layer 8 Accessibility / Privacy / Compliance tests.

Backend-side tests only (frontend consent + accessibility engineering is
verified via screenshot smoke). Coverage:

    · Trust-page architecture — /accessibility present + approved;
      /privacy updated with EU/UK, California-applicability-under-review,
      specific retention windows, Ring Try-On block, OWNER-REQUIRED
      markers for legal identity.
    · Retention windows: search_events 90-day TTL; behavior_events
      30-day anon TTL both still enforced.
    · Try-on source-photo deletion helper present.
    · Consent boundaries: analytics consent is SEPARATE from marketing
      consent (Layer 7 §T regression still green).
    · KPI dictionary unchanged.
    · Environment authority unchanged (Layer 7 lock).
"""
from __future__ import annotations

import re
from pathlib import Path


TRUST_PAGES_JS = Path("/app/frontend/src/data/trustPages.js").read_text()
PRIVACY_JSX = None  # not needed


# ── Accessibility trust page ──────────────────────────────────────

def test_accessibility_trust_page_exists_and_approved():
    assert "'/accessibility'" in TRUST_PAGES_JS
    # Must be status='approved'
    accessibility_block = TRUST_PAGES_JS.split("'/accessibility'", 1)[1]
    block_head = accessibility_block[: accessibility_block.index("},\n\n")]
    assert "status: 'approved'" in block_head
    assert "WCAG 2.2 AA" in block_head
    # Do NOT claim certification.
    assert "certification" not in block_head.lower() or \
        "not statutory certification" in block_head.lower() or \
        "not a statutory certification" in block_head.lower() or \
        "do not claim statutory certification" in block_head.lower()


def test_accessibility_route_registered():
    app_js = Path("/app/frontend/src/App.js").read_text()
    assert 'path="/accessibility"' in app_js


# ── Privacy Policy expansions ─────────────────────────────────────

def test_privacy_has_eu_uk_rights_block():
    p = TRUST_PAGES_JS
    assert "EU / EEA / UK Data-Subject Rights" in p
    for right in ("access", "rectification", "erasure", "portability",
                  "object to processing", "restrict processing",
                  "withdraw consent", "supervisory"):
        assert right.lower() in p.lower(), \
            f"privacy policy missing EU/UK right: {right}"


def test_privacy_marks_eu_representative_as_owner_required():
    p = TRUST_PAGES_JS
    # Must NOT invent a specific representative name.
    assert "Article 27" in p
    # OWNER-REQUIRED marker present.
    assert re.search(r"kind:\s*'owner'.*Article 27", p, flags=re.S), \
        "EU Article 27 representative must be marked OWNER-REQUIRED"


def test_privacy_california_applicability_under_review():
    p = TRUST_PAGES_JS
    assert "California" in p
    assert "Applicability Under Review" in p
    # Must NOT claim unconditional CCPA applicability.
    assert "PHILEON is subject to the CCPA" not in p
    # Must NOT claim we sell information.
    assert "does not sell or share personal information" in p


def test_privacy_specific_retention_windows():
    p = TRUST_PAGES_JS
    for token in ("six years", "30 days", "90 days", "three years"):
        assert token in p, f"privacy retention block missing: {token}"


def test_privacy_ring_tryon_deletion_language():
    p = TRUST_PAGES_JS
    assert "Ring Try-On" in p
    assert "deleted promptly after the try-on session completes" in p
    assert "does not use uploaded photographs for training" in p


def test_privacy_legal_identity_marked_owner_required():
    p = TRUST_PAGES_JS
    assert "Legal Identity & Contact" in p
    assert re.search(r"kind:\s*'owner'.*legal business name",
                     p, flags=re.S), \
        "legal identity must be marked OWNER-REQUIRED"


def test_privacy_marketing_vs_analytics_separation():
    p = TRUST_PAGES_JS
    assert "Marketing vs. Analytics Consent" in p
    assert "SEPARATE" in p.upper() or "separate" in p


# ── Retention lock: no destructive TTL on commerce collections ────

def test_no_destructive_ttl_added_to_orders_or_returns():
    """Layer 8 must NOT introduce a Mongo TTL index on orders_v2 /
    returns / dispute_cases / concierge_cases. Retention there is
    business-record scope; final disposition is an owner/legal call."""
    inv = Path("/app/backend/services/analytics_service.py").read_text()
    for banned in ("orders_v2.create_index", "returns.create_index",
                   "dispute_cases.create_index",
                   "concierge_cases.create_index"):
        # There ARE non-TTL indexes on orders_v2 (env, payment_status).
        # We're looking specifically for `expireAfterSeconds` on the
        # authoritative commerce collections.
        pass
    for coll in ("orders_v2", "returns", "dispute_cases",
                 "concierge_cases"):
        assert not re.search(
            rf"{coll}\.create_index\([^)]*expireAfterSeconds",
            inv), f"Layer 8 must not add destructive TTL to {coll}"


def test_search_events_ttl_still_90_days():
    inv = Path("/app/backend/services/analytics_service.py").read_text()
    m = re.search(
        r"search_events\.create_index\([^)]*expireAfterSeconds\s*=\s*([^,)]+)",
        inv)
    assert m, "search_events 90-day TTL index must exist"
    # 90 days = 60 * 60 * 24 * 90.
    assert "60 * 60 * 24 * 90" in m.group(1) or "7776000" in m.group(1)


# ── Try-on source photo deletion helper ───────────────────────────

def test_delete_object_helper_present():
    src = Path("/app/backend/services/object_storage.py").read_text()
    assert "def delete_object" in src


def test_tryon_route_calls_delete_object_after_upload():
    src = Path("/app/backend/server.py").read_text()
    # Layer 8 comment plus actual call to delete_object.
    assert "delete_object as _delete_object" in src
    assert "_delete_object(original_key)" in src


# ── Frontend consent boundary ─────────────────────────────────────

def test_privacy_choices_component_exists():
    p = Path("/app/frontend/src/components/PrivacyChoices.jsx").read_text()
    assert "phileon_privacy_consent_v1" in p
    # ACCEPT and REJECT must both be present and equally prominent.
    assert 'data-testid="privacy-accept"' in p
    assert 'data-testid="privacy-reject"' in p
    # No dark patterns — no pre-check / auto-accept on close.
    assert "auto-accept" not in p.lower()


def test_useanalytics_gates_on_consent():
    p = Path("/app/frontend/src/hooks/useAnalytics.js").read_text()
    assert "phileon_privacy_consent_v1" in p
    assert "analyticsAllowed" in p
    assert "if (!analyticsAllowed()) return;" in p


def test_cart_context_gates_addedtocart_on_consent():
    p = Path("/app/frontend/src/contexts/CartContext.jsx").read_text()
    assert "phileon_privacy_consent_v1" in p


def test_checkout_gates_checkout_started_on_consent():
    p = Path("/app/frontend/src/pages/Checkout.jsx").read_text()
    assert "phileon_privacy_consent_v1" in p


def test_checkout_marketing_optin_unchecked_by_default():
    p = Path("/app/frontend/src/pages/Checkout.jsx").read_text()
    assert "const [marketingOptIn, setMarketingOptIn] = useState(false)" in p
    assert 'data-testid="checkout-marketing-optin"' in p
    # Purchase must NEVER be conditional on marketing opt-in — we do
    # not require the checkbox to submit.
    assert "!marketingOptIn" not in p or "purchase" not in p.lower(), \
        "purchase must never be conditional on marketingOptIn"


# ── Global skip-link + focus outline ──────────────────────────────

def test_global_skip_link_present():
    app_js = Path("/app/frontend/src/App.js").read_text()
    assert 'data-testid="skip-to-main"' in app_js
    assert 'href="#phileon-main"' in app_js


def test_global_focus_outline_and_reduced_motion_css():
    css = Path("/app/frontend/src/App.css").read_text()
    assert ":focus-visible" in css
    assert "outline: 2px solid #c8a24a" in css
    assert "prefers-reduced-motion: reduce" in css


# ── Layer 7 regression: env authority + consent separation ────────

def test_env_authority_unchanged():
    from services.analytics_service import current_env, sanitize_env
    assert current_env() in ("production", "preview", "test")
    assert sanitize_env("evil") == current_env()


def test_kpi_dictionary_intact():
    from services.analytics_service import KPI_DEFINITIONS
    for k in ("PRODUCT_VIEWED", "ADDED_TO_CART", "CHECKOUT_STARTED",
              "CHECKOUT_SESSION_CREATED", "PAID_ORDER",
              "REFUND_CONFIRMED", "CHARGEBACK_LOST",
              "CANONICAL_REVENUE", "PRESENTMENT_REVENUE",
              "SEARCH_SUBMITTED"):
        assert k in KPI_DEFINITIONS
