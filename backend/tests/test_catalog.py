"""Trusted catalog unit tests.
Run:  cd /app/backend && python -m pytest tests/test_catalog.py -v
These do NOT require Stripe secrets or the FastAPI app to be running.
"""
import pytest
from services.catalog import (
    resolve_line_item, compute_totals, is_supported, CatalogError, _SUPPORTED_SLUGS,
)


# ────────────────────────────────  is_supported  ────────────────────────────────
def test_is_supported_expanded():
    assert is_supported("scacco-matto")
    assert is_supported("ribbon-regale-edition")
    assert is_supported("quadriga-dominus")

def test_is_supported_rejects_unknown():
    assert not is_supported("cresta-nera")
    assert not is_supported("uncle-jo")
    assert not is_supported("")

def test_supported_slugs_set_frozen():
    assert _SUPPORTED_SLUGS == {
        "scacco-matto", "ribbon-regale-edition", "quadriga-dominus", "bajan-joe",
        "la-marva", "annie-rose", "rhythm-mesh-ring", "tola-ii",
        "parabola", "parabola-heritage", "ovation",
    }


# ────────────────────────────  BAJAN JOE (USD)  ────────────────────────────
@pytest.mark.parametrize("tier, expected_sku_prefix", [
    ("polish", "BJ-POL-925"),
    ("matte",  "BJ-MAT-925"),
])
def test_bajan_joe_both_tiers_same_price(tier, expected_sku_prefix):
    r = resolve_line_item("bajan-joe", None, None, "US 10", 1, variant=tier)
    assert r["product_id"] == "bajan-joe"
    assert r["unit_amount_cents"] == 79500
    assert r["currency"] == "USD"
    assert r["sku"] == f"{expected_sku_prefix}-SZ10"
    assert r["metadata"]["tier"] == tier

def test_bajan_joe_lowest_size_us7():
    r = resolve_line_item("bajan-joe", None, None, "US 7", 1, variant="polish")
    assert r["sku"] == "BJ-POL-925-SZ7"
    assert r["ring_size"] == "US 7"

def test_bajan_joe_highest_size_us15():
    r = resolve_line_item("bajan-joe", None, None, "US 15", 1, variant="matte")
    assert r["sku"] == "BJ-MAT-925-SZ15"
    assert r["ring_size"] == "US 15"

def test_bajan_joe_half_size_supported():
    r = resolve_line_item("bajan-joe", None, None, "US 10.5", 1, variant="polish")
    assert r["sku"] == "BJ-POL-925-SZ10-5"

def test_bajan_joe_accepts_tier_via_karat_field():
    # Frontend payload compatibility — some pages send tier in `karat` slot
    r = resolve_line_item("bajan-joe", "polish", None, "US 11", 1)
    assert r["unit_amount_cents"] == 79500
    assert r["metadata"]["tier"] == "polish"

def test_bajan_joe_invalid_tier_rejected():
    with pytest.raises(CatalogError, match="INVALID_TIER"):
        resolve_line_item("bajan-joe", None, None, "US 10", 1, variant="brushed")

def test_bajan_joe_missing_tier_rejected():
    with pytest.raises(CatalogError, match="MISSING_TIER"):
        resolve_line_item("bajan-joe", None, None, "US 10", 1)

def test_bajan_joe_invalid_size_rejected():
    # US 6 not in the gents 7-15 range
    with pytest.raises(CatalogError, match="INVALID_RING_SIZE"):
        resolve_line_item("bajan-joe", None, None, "US 6", 1, variant="polish")

def test_bajan_joe_missing_size_rejected():
    with pytest.raises(CatalogError, match="MISSING_RING_SIZE"):
        resolve_line_item("bajan-joe", None, None, None, 1, variant="polish")

def test_bajan_joe_client_supplied_price_ignored():
    # The resolver takes NO price input from the request. Only slug + tier + size.
    # Even if a caller mocked a `price` field, it cannot influence the result.
    r = resolve_line_item("bajan-joe", None, None, "US 10", 1, variant="polish")
    assert r["unit_amount_cents"] == 79500  # trusted server value, never client-driven


# ────────────────────────  RIBBON REGALE ÉDITION (CAD)  ────────────────────────
@pytest.mark.parametrize("variant, expected_cents, expected_sku", [
    ("plated", 49500,  "RRED-GPSS"),
    ("10k",    149500, "RRED-10KYG"),
    ("14k",    189500, "RRED-14KYG"),
    ("18k",    239500, "RRED-18KYG"),
])
def test_rre_all_four_variants_resolve_correctly(variant, expected_cents, expected_sku):
    r = resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant=variant)
    assert r["product_id"] == "ribbon-regale-edition"
    assert r["product_name"] == "RIBBON REGALE ÉDITION"
    assert r["unit_amount_cents"] == expected_cents
    assert r["sku"] == expected_sku
    assert r["currency"] == "CAD"
    assert r["quantity"] == 1

def test_rre_variant_accepts_karat_field_as_tierkey():
    # Frontend uses `karat` field to carry the tier key ("plated"/"10k"/"14k"/"18k")
    r = resolve_line_item("ribbon-regale-edition", "18k", None, None, 1)
    assert r["unit_amount_cents"] == 239500
    assert r["sku"] == "RRED-18KYG"

def test_rre_case_insensitive_variant():
    r = resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant="PLATED")
    assert r["sku"] == "RRED-GPSS"

def test_rre_missing_variant_rejected():
    with pytest.raises(CatalogError, match="MISSING_VARIANT"):
        resolve_line_item("ribbon-regale-edition", None, None, None, 1)

def test_rre_invalid_variant_rejected():
    with pytest.raises(CatalogError, match="INVALID_VARIANT"):
        resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant="24k")

def test_rre_metadata_marks_plated_correctly():
    r = resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant="plated")
    md = r["metadata"]
    assert md["product_slug"] == "ribbon-regale-edition"
    assert md["sku"] == "RRED-GPSS"
    assert md["is_solid_gold"] == "false"
    assert md["base_metal"] == "Sterling Silver"
    assert md["finish"] == "18K Yellow Gold Plated"

def test_rre_metadata_marks_solid_gold_correctly():
    r = resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant="14k")
    md = r["metadata"]
    assert md["is_solid_gold"] == "true"
    assert md["karat"] == "14K"
    assert md["base_metal"] == ""
    assert md["finish"] == ""


# ────────────────────────────  QUADRIGA DOMINUS (USD)  ────────────────────────────
def test_quadriga_verified_case_14k_red_black_us11():
    r = resolve_line_item("quadriga-dominus", "14K", "red-black", "US 11", 1)
    assert r["product_id"] == "quadriga-dominus"
    assert r["unit_amount_cents"] == 1225000
    assert r["currency"] == "USD"
    assert r["variant"] == "14K · Red Centre / Black Pavé · US 11"

@pytest.mark.parametrize("karat, colorway, cents", [
    # Full 4×2 matrix verified against frontend source of truth
    ("10K", "red-black",   1049500),
    ("14K", "red-black",   1225000),
    ("10K", "black-red",   1099500),
    ("14K", "black-red",   1275000),
    ("10K", "green-black", 1149500),
    ("14K", "green-black", 1325000),
    ("10K", "black-green", 1199500),
    ("14K", "black-green", 1375000),
])
def test_quadriga_pricing_matrix(karat, colorway, cents):
    r = resolve_line_item("quadriga-dominus", karat, None, "US 11", 1, colorway=colorway)
    assert r["unit_amount_cents"] == cents
    assert r["currency"] == "USD"

def test_quadriga_accepts_colorway_via_metal_colour_field():
    # Frontend may send colorway in metal_colour slot depending on payload shape
    r = resolve_line_item("quadriga-dominus", "10K", "black-green", "US 12", 1)
    assert r["unit_amount_cents"] == 1199500

def test_quadriga_invalid_karat_rejected():
    with pytest.raises(CatalogError, match="INVALID_KARAT"):
        resolve_line_item("quadriga-dominus", "18K", "red-black", "US 11", 1)

def test_quadriga_invalid_colorway_rejected():
    with pytest.raises(CatalogError, match="INVALID_COLORWAY|MISSING_COLORWAY"):
        resolve_line_item("quadriga-dominus", "14K", "purple-diamond", "US 11", 1)

def test_quadriga_invalid_ring_size_rejected():
    # US 6.5 is not a gents QUADRIGA size (range starts US 7)
    with pytest.raises(CatalogError, match="INVALID_RING_SIZE"):
        resolve_line_item("quadriga-dominus", "14K", "red-black", "US 6.5", 1)

def test_quadriga_missing_ring_size_rejected():
    with pytest.raises(CatalogError, match="MISSING_RING_SIZE"):
        resolve_line_item("quadriga-dominus", "14K", "red-black", None, 1)

def test_quadriga_sku_shape():
    r = resolve_line_item("quadriga-dominus", "14K", "black-green", "US 10.5", 1)
    assert r["sku"] == "QUADD-BLACKGREEN-14K-SZ10-5"

def test_quadriga_metadata_included():
    r = resolve_line_item("quadriga-dominus", "14K", "red-black", "US 11", 1)
    md = r["metadata"]
    assert md["product_slug"] == "quadriga-dominus"
    assert md["karat"] == "14K"
    assert md["colorway"] == "Red Centre / Black Pavé"
    assert md["ring_size"] == "US 11"


# ─────────────────────────────  SCACCO MATTO regression  ─────────────────────────
def test_scacco_still_works_10k_yellow():
    r = resolve_line_item("scacco-matto", "10K", "Yellow Gold", "US 7", 1)
    assert r["product_id"] == "scacco-matto"
    assert r["unit_amount_cents"] == 390000
    assert r["currency"] == "USD"
    assert r["sku"] == "SM-10K-YELLOW-7"

def test_scacco_still_works_14k_white():
    r = resolve_line_item("scacco-matto", "14K", "White Gold", "US 8.5", 1)
    assert r["unit_amount_cents"] == 450000
    assert r["currency"] == "USD"

def test_scacco_invalid_karat_still_rejected():
    with pytest.raises(CatalogError, match="INVALID_KARAT"):
        resolve_line_item("scacco-matto", "18K", "Yellow Gold", "US 7", 1)


# ─────────────────────────────  UNSUPPORTED / INVALID  ─────────────────────────
def test_unsupported_product_rejected():
    with pytest.raises(CatalogError, match="UNSUPPORTED_PRODUCT"):
        resolve_line_item("cresta-nera", None, None, None, 1)

def test_quantity_bounds():
    with pytest.raises(CatalogError, match="INVALID_QUANTITY"):
        resolve_line_item("ribbon-regale-edition", None, None, None, 0, variant="14k")
    with pytest.raises(CatalogError, match="INVALID_QUANTITY"):
        resolve_line_item("ribbon-regale-edition", None, None, None, 6, variant="14k")


# ──────────────────────────  compute_totals: currency & mix  ────────────────────
def test_compute_totals_rre_cad():
    r14 = resolve_line_item("ribbon-regale-edition", None, None, None, 2, variant="14k")
    t = compute_totals([r14])
    assert t["currency"] == "CAD"
    assert t["subtotal_cents"] == 189500 * 2
    assert t["total_cents"] == 189500 * 2

def test_compute_totals_quadriga_usd():
    r = resolve_line_item("quadriga-dominus", "14K", "red-black", "US 11", 1)
    t = compute_totals([r])
    assert t["currency"] == "USD"
    assert t["total_cents"] == 1225000

def test_compute_totals_scacco_usd_preserved():
    r = resolve_line_item("scacco-matto", "10K", "Yellow Gold", "US 7", 1)
    t = compute_totals([r])
    assert t["currency"] == "USD"

def test_compute_totals_mixed_currency_rejected():
    rre  = resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant="14k")
    quad = resolve_line_item("quadriga-dominus", "14K", "red-black", "US 11", 1)
    with pytest.raises(CatalogError, match="MIXED_CURRENCY_CART"):
        compute_totals([rre, quad])

def test_compute_totals_same_currency_multi_item_ok():
    # Two RRE items — same currency, must succeed
    a = resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant="plated")
    b = resolve_line_item("ribbon-regale-edition", None, None, None, 1, variant="18k")
    t = compute_totals([a, b])
    assert t["currency"] == "CAD"
    assert t["subtotal_cents"] == 49500 + 239500

def test_compute_totals_empty_cart_rejected():
    with pytest.raises(CatalogError, match="EMPTY_CART"):
        compute_totals([])
