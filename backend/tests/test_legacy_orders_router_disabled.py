"""Legacy /api/orders/* endpoints must be permanently disabled with HTTP 410."""
from fastapi.testclient import TestClient
import pytest

from server import app

client = TestClient(app)


@pytest.mark.parametrize("method,path", [
    ("POST", "/api/orders"),
    ("POST", "/api/orders/calculate-shipping"),
    ("GET",  "/api/orders"),
    ("GET",  "/api/orders/some-id"),
    ("PUT",  "/api/orders/some-id/status"),
])
def test_legacy_orders_endpoints_return_410(method, path):
    if method == "GET":
        r = client.get(path)
    elif method == "POST":
        r = client.post(path, json={})
    else:
        r = client.put(path, json={})
    assert r.status_code == 410, f"{method} {path} → {r.status_code}"
    body = r.json()
    assert body["detail"]["code"] == "LEGACY_ENDPOINT_DISABLED"


def test_legacy_orders_router_has_no_shipping_logic():
    """No client-trusted shipping math must remain in the legacy file."""
    src = open("/app/backend/routes/orders.py").read()
    assert "EasyPost" not in src
    assert "if subtotal >= 100" not in src
    assert "shipping_cost = 15.0" not in src
    assert "shipping_cost = 35.0" not in src
    # 410 pattern present:
    assert "LEGACY_ENDPOINT_DISABLED" in src
    assert "status_code=410" in src
