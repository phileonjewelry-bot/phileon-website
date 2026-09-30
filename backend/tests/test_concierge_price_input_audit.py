"""PHILEON Concierge — Dynamic Price Input Audit.

Read-only deterministic test. NO OpenAI calls. NO pricing changes.

RULE (from ownership audit brief):
    If price can materially change based on an input the customer has NOT
    supplied, the concierge must NOT present that value as the customer's
    exact product price or use it as definitive under-budget evidence.

Acceptable outcomes per slug:
    (A) There is a canonical customer-facing default/starting price on the
        storefront that requires no size / tier / metal selection. The
        concierge may return this exact value as `price_source` other
        than "unavailable".
    (B) Exact price requires a selection the customer has NOT supplied.
        The concierge must return `price_usd = None` and
        `price_source = "unavailable"`.

This test iterates every product visible to the concierge and asserts the
rule holds for what the concierge's `_resolve_authoritative_price` /
`_product_price_view` actually returns.
"""
from __future__ import annotations

import pytest

from services.pricing_engine_catalog import (
    FIXED_PRODUCTS,
    PRICING_ENGINE_CATALOG,
)
from services.phileon_concierge import (
    _all_products,
    _resolve_authoritative_price,
    _product_price_view,
)


# ─────────────────────────────────────────────────────────────────
# 1. What the concierge passes into `pec_resolve` today
#    (see services/phileon_concierge.py::_resolve_authoritative_price)
# ─────────────────────────────────────────────────────────────────
#   pec_resolve(slug,
#               tier_key=None,          # ← DEFAULTED, customer never supplied
#               ring_size=candidate,    # ← DEFAULTED "7" then None
#               quantity=1,             # ← DEFAULTED
#               market_snapshot=snap)   # ← server-canonical spot
#   wrist_size is NEVER passed (defaults to None inside resolve()).
#
# For FIXED_PRODUCTS the concierge short-circuits earlier and returns
# `variants["default"].price_usd` if a "default" variant exists; else
# `unavailable`. It never calls the resolver for FIXED_PRODUCTS.


DEFAULTED_ARGS = {
    "tier_key":       None,   # concierge always defaults this
    "ring_size":      "7",    # concierge tries "7" then None
    "wrist_size":     None,   # concierge never passes this
    "quantity":       1,      # concierge always defaults this
}


def _price_can_vary_with_customer_input(slug: str, rec: dict) -> str:
    """Return a short description of which customer inputs the price
    depends on. Empty string means no meaningful dependence."""
    variants = rec.get("variants") or {}
    deps = []
    # FIXED_PRODUCTS: multi-variant → tier selection changes price.
    if slug in FIXED_PRODUCTS:
        if isinstance(variants, dict) and len(variants) > 1:
            deps.append("tier")
        if rec.get("needs_size"):
            deps.append("ring_size")
        return "+".join(deps)
    # PRICING_ENGINE_CATALOG: tier is required by resolver; some
    # products also require ring size; convert_usd_luxury+weightGrams>0
    # items also fluctuate with metal spot.
    if slug in PRICING_ENGINE_CATALOG:
        deps.append("tier")  # every PEC product requires tier_key
        if rec.get("needs_size"):
            deps.append("ring_size")
        if rec.get("convert_usd_luxury"):
            deps.append("metal_spot")
        return "+".join(deps)
    return ""


# ─────────────────────────────────────────────────────────────────
# 2. The audit itself
# ─────────────────────────────────────────────────────────────────


def test_every_slug_has_deterministic_outcome():
    """Every slug the concierge can return must resolve to either
    outcome A (authoritative, invariant to un-supplied inputs) or
    outcome B (price None, source 'unavailable').

    No slug may return a non-null price whose value materially depends
    on an input the concierge did not supply.
    """
    products = _all_products()
    assert products, "concierge product universe is empty"

    violations: list[str] = []
    for slug, rec in sorted(products.items()):
        price, source = _resolve_authoritative_price(slug, rec)
        deps = _price_can_vary_with_customer_input(slug, rec)

        if price is None:
            # Outcome B — safe.
            assert source == "unavailable", (
                f"{slug}: price is null but source is {source!r} "
                f"(expected 'unavailable')"
            )
            continue

        # Outcome A candidate: an authoritative price was returned.
        # It is only legal if none of the price-varying inputs are
        # meaningful for THIS record (i.e. single-variant fixed
        # products with a `variants["default"]` key).
        variants = rec.get("variants") or {}
        default = variants.get("default") if isinstance(variants, dict) else None
        is_single_tier_default = (
            isinstance(variants, dict)
            and len(variants) == 1
            and default is not None
            and isinstance(default.get("price_usd"), (int, float))
        )
        needs_size = bool(rec.get("needs_size"))

        # For an authoritative price to be safe:
        #   * product must have a single-tier "default" variant, AND
        #   * product must not require ring size / wrist size, AND
        #   * source must be "static_catalog" (never "live_phileon_pricing"
        #     because that involves a defaulted ring_size / market spot).
        if not (is_single_tier_default and not needs_size
                and source == "static_catalog"):
            violations.append(
                f"{slug}: got authoritative price ${price:.2f} from "
                f"{source!r} but price depends on [{deps}] and concierge "
                f"did not supply those inputs "
                f"(single_tier_default={is_single_tier_default}, "
                f"needs_size={needs_size})"
            )

    assert not violations, (
        "Concierge presented a size/tier-dependent price as authoritative "
        "without receiving those inputs:\n  - " + "\n  - ".join(violations)
    )


def test_concierge_never_calls_resolver_with_customer_inputs():
    """Sanity check on the audited call-site: the concierge's
    `_resolve_authoritative_price` passes ONLY defaulted values to
    the pricing resolver. If this ever changes, the audit assumptions
    must be revisited."""
    import inspect
    src = inspect.getsource(_resolve_authoritative_price)
    # These are the exact positional-keyword arguments the resolver is
    # called with today. Any deviation is a red flag for this audit.
    assert "tier_key=None" in src, (
        "Concierge started passing a real tier_key into pec_resolve — "
        "the audit's Outcome-B assumption for PEC items no longer holds "
        "automatically; re-run the audit."
    )
    assert "quantity=1" in src
    # ring_size candidate list; the current code loops ("7", None).
    assert 'candidate_size in ("7", None)' in src, (
        "Concierge's ring_size defaulting behaviour changed. The audit "
        "assumed candidates ('7', None); re-verify no dynamic-priced "
        "record leaks an authoritative price."
    )


def test_dynamic_priced_pec_items_return_null():
    """Every PRICING_ENGINE_CATALOG item requires a tier selection.
    Since the concierge never supplies one, ALL PEC items must resolve
    to `price_usd = None, price_source = "unavailable"`.
    """
    offenders = []
    for slug, rec in PRICING_ENGINE_CATALOG.items():
        pv = _product_price_view(rec, slug=slug)
        if pv["price_usd"] is not None or pv["price_source"] != "unavailable":
            offenders.append(
                f"{slug}: price_usd={pv['price_usd']!r} "
                f"source={pv['price_source']!r}"
            )
    assert not offenders, (
        "PRICING_ENGINE_CATALOG slugs must all resolve to "
        "unavailable/None for the concierge; violations:\n  - "
        + "\n  - ".join(offenders)
    )


def test_multi_variant_fixed_products_return_null():
    """FIXED_PRODUCTS with more than one variant (bape, lisa,
    the-carapace, neighborhood-nip, retro-bred, the-grand-dame) must
    return `price_usd = None`. The concierge cannot pick a variant."""
    offenders = []
    for slug, rec in FIXED_PRODUCTS.items():
        if len(rec.get("variants") or {}) <= 1:
            continue
        pv = _product_price_view(rec, slug=slug)
        if pv["price_usd"] is not None:
            offenders.append(
                f"{slug} (variants={list(rec['variants'].keys())}) "
                f"leaked price_usd={pv['price_usd']!r}"
            )
    assert not offenders, "\n  - ".join(["Multi-variant leaks:"] + offenders)


def test_single_variant_fixed_products_without_default_return_null():
    """Single-variant fixed products whose sole variant is not keyed
    'default' (drew-face → 'vault', la-madonna → '10k-yellow',
    la-scarpa-della-regina → '18k-rose', midweek → 'silver-black-dia')
    must ALSO return `price_usd = None`, because the concierge only
    reads `variants['default']` — it never picks a non-default key.
    This is documented behaviour, not a bug: those pieces still have
    an authoritative page price on the storefront, but the concierge
    does not surface it in v1."""
    NON_DEFAULT_SINGLES = {
        "drew-face", "la-madonna", "la-scarpa-della-regina", "midweek",
    }
    for slug in NON_DEFAULT_SINGLES:
        rec = FIXED_PRODUCTS[slug]
        assert len(rec["variants"]) == 1, f"{slug}: expected single variant"
        assert "default" not in rec["variants"], (
            f"{slug}: variant key is not 'default' — audit assumption"
        )
        pv = _product_price_view(rec, slug=slug)
        assert pv["price_usd"] is None, (
            f"{slug} unexpectedly returned price_usd={pv['price_usd']!r}"
        )
        assert pv["price_source"] == "unavailable"


def test_iv_default_variant_prices_match_static_catalog():
    """Inspiration Vault FIXED_PRODUCTS entries that carry a
    `variants['default']` key DO return an authoritative price. Verify:
        * the returned price equals `variants['default'].price_usd`
        * `price_source == 'static_catalog'`
        * these slugs are all `iv-*` (guaranteed vault-excluded by the
          concierge's default search filter)
    This is Outcome A: a single storefront price, invariant to any
    input the customer might supply.
    """
    for slug, rec in FIXED_PRODUCTS.items():
        default = (rec.get("variants") or {}).get("default")
        if not default:
            continue
        pv = _product_price_view(rec, slug=slug)
        assert pv["price_source"] == "static_catalog", (
            f"{slug}: expected static_catalog, got {pv['price_source']!r}"
        )
        assert pv["price_usd"] == float(default["price_usd"]), (
            f"{slug}: price {pv['price_usd']!r} != default "
            f"{default['price_usd']!r}"
        )
        assert slug.startswith("iv-"), (
            f"{slug} has default variant but is NOT iv-*; vault-exclusion "
            f"filter will not hide it from generic searches — audit "
            f"assumption failed."
        )


def test_cresta_nera_and_her_are_invisible_to_concierge():
    """cresta-nera and her-eternal-reign both have price matrices that
    materially change with wrist size / ring size / tier. Because the
    concierge never passes wrist_size and never passes tier_key, these
    products must be UNREACHABLE via `_all_products` (i.e. the concierge
    cannot list them at all). If they ever get added to
    PRICING_ENGINE_CATALOG or FIXED_PRODUCTS they must resolve to
    `unavailable`.
    """
    products = _all_products()
    assert "cresta-nera" not in products, (
        "cresta-nera is now visible to the concierge; its price depends "
        "on wrist_size (Small/Medium/Large/XL) AND metal (10K/14K Yellow "
        "Gold). Neither is supplied by the concierge — audit must be "
        "re-run against Rule B."
    )
    assert "her-eternal-reign" not in products, (
        "her-eternal-reign is now visible to the concierge; its price "
        "depends on tier (10K/14K/18K) AND ring size (which drives "
        "figure count). Neither is supplied — audit must be re-run."
    )
