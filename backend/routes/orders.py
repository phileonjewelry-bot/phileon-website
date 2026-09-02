"""Legacy orders router — DISABLED (Phase 1 shipping migration, Feb 2026).

All endpoints previously mounted at `/api/orders/*` are replaced by the
trusted Stripe-hosted checkout flow at `/api/checkout/*` and the
server-authoritative shipping zone service at `services/shipping_zones.py`.

Every endpoint returns HTTP 410 `LEGACY_ENDPOINT_DISABLED` — matching the
disposition pattern already used in `routes/stripe_routes.py`. This
prevents any second shipping authority from re-entering the system.
"""
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/orders", tags=["orders-legacy-disabled"])

_LEGACY_DETAIL = {
    "code": "LEGACY_ENDPOINT_DISABLED",
    "message": (
        "This legacy orders endpoint has been permanently removed. "
        "Use POST /api/checkout/stripe/session for new orders."
    ),
}


def _gone() -> None:
    raise HTTPException(status_code=410, detail=_LEGACY_DETAIL)


@router.post("")
async def legacy_create_order():
    _gone()


@router.get("")
async def legacy_list_orders():
    _gone()


@router.get("/{order_id}")
async def legacy_get_order(order_id: str):  # noqa: ARG001
    _gone()


@router.put("/{order_id}/status")
async def legacy_update_order_status(order_id: str):  # noqa: ARG001
    _gone()


@router.post("/calculate-shipping")
async def legacy_calculate_shipping():
    _gone()
