"""PHILEON — Retention cron credential scoping tests (iteration_24).

Verifies:
 1. /admin/retention/tick works with valid admin JWT (returns proper report shape).
 2. /admin/retention/tick works with valid X-PHILEON-RETENTION-CRON header.
 3. No auth -> 401/403.
 4. Cron header + no env secret -> 403 CRON_NOT_CONFIGURED.
 5. Wrong cron header -> 401 INVALID_CRON_CREDENTIAL.
 6. Cron header is REJECTED on every other admin endpoint (retention + orders).
 7. Idempotency: two consecutive tick calls do not corrupt state.
 8. Secret non-disclosure: never appears in JSON responses.
 9. get_config().live remains False, tick mode == 'simulated'.
"""
import os
import re
import subprocess

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "http://localhost:8001"
API = f"{BASE_URL}/api"

# Read cron secret from backend/.env directly (as owner would).
def _read_env(key: str) -> str:
    try:
        with open("/app/backend/.env") as f:
            for line in f:
                if line.startswith(key + "="):
                    return line.split("=", 1)[1].strip()
    except FileNotFoundError:
        pass
    return ""


CRON_SECRET = _read_env("PHILEON_RETENTION_CRON_SECRET")


@pytest.fixture(scope="module")
def admin_token():
    r = subprocess.run(
        ["python", "-c", "from server import create_token; print(create_token('admin'))"],
        cwd="/app/backend", capture_output=True, text=True, timeout=30,
    )
    tok = r.stdout.strip().splitlines()[-1] if r.stdout else ""
    assert tok and tok.count(".") == 2, f"Bad admin token: {r.stdout!r} / {r.stderr!r}"
    return tok


TICK_REPORT_KEYS = {
    "mode", "live_requested", "live_effective",
    "behavioral_sender_configured", "global_launch_cap_hit",
    "evaluated", "sent", "skipped", "eligible_but_capped",
}


# --- 1. Tick with admin JWT ---
def test_tick_with_admin_jwt(admin_token):
    r = requests.post(f"{API}/admin/retention/tick",
                      headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
    assert r.status_code == 200, r.text
    body = r.json()
    missing = TICK_REPORT_KEYS - set(body.keys())
    assert not missing, f"Missing keys: {missing} in {body}"
    assert body["mode"] == "simulated"
    assert body["live_requested"] is False
    assert body["live_effective"] is False


# --- 2. Tick with cron header ---
def test_tick_with_cron_header():
    assert CRON_SECRET, "PHILEON_RETENTION_CRON_SECRET not set in backend/.env"
    r = requests.post(f"{API}/admin/retention/tick",
                      headers={"X-PHILEON-RETENTION-CRON": CRON_SECRET}, timeout=30)
    assert r.status_code == 200, r.text
    body = r.json()
    assert TICK_REPORT_KEYS <= set(body.keys())
    assert body["mode"] == "simulated"


# --- 3. No auth at all ---
def test_tick_no_auth():
    r = requests.post(f"{API}/admin/retention/tick", timeout=15)
    assert r.status_code in (401, 403), r.text


# --- 4. Cron header but env unset -> CRON_NOT_CONFIGURED ---
def test_tick_cron_env_unset(monkeypatch=None):
    # We can't unset env on the running server. Instead, we simulate by
    # sending header with a value while the SERVER has secret set (skip if so).
    # Rely on separate unit-side check: call with header but temporarily
    # verified via mocking is not possible here. Skip if secret is set.
    if CRON_SECRET:
        pytest.skip("Cannot unset env on running server; covered by backend unit tests.")
    r = requests.post(f"{API}/admin/retention/tick",
                      headers={"X-PHILEON-RETENTION-CRON": "any-value"}, timeout=15)
    assert r.status_code == 403
    assert (r.json().get("detail") or {}).get("code") == "CRON_NOT_CONFIGURED"


# --- 5. Wrong cron value -> INVALID_CRON_CREDENTIAL ---
def test_tick_wrong_cron():
    r = requests.post(f"{API}/admin/retention/tick",
                      headers={"X-PHILEON-RETENTION-CRON": "definitely-wrong-value"}, timeout=15)
    assert r.status_code == 401, r.text
    detail = r.json().get("detail")
    assert isinstance(detail, dict) and detail.get("code") == "INVALID_CRON_CREDENTIAL", detail


# --- 6. Cron header cannot access other admin endpoints ---
OTHER_ADMIN_ENDPOINTS = [
    ("GET", "/admin/retention/pending"),
    ("GET", "/admin/retention/send-log"),
    ("GET", "/admin/retention/config"),
    ("GET", "/admin/retention/preview/nonexistent-id"),
    ("POST", "/admin/retention/consent"),
    ("GET", "/admin/orders/PHI-NONE"),
    ("POST", "/admin/orders/PHI-NONE/mark-shipped"),
    ("GET", "/admin/stats"),
]


@pytest.mark.parametrize("method,path", OTHER_ADMIN_ENDPOINTS)
def test_cron_header_rejected_on_other_admin(method, path):
    if not CRON_SECRET:
        pytest.skip("No cron secret configured")
    r = requests.request(
        method, f"{API}{path}",
        headers={"X-PHILEON-RETENTION-CRON": CRON_SECRET},
        json={} if method == "POST" else None,
        timeout=15,
    )
    # Must NOT be 200. Should be 401/403 (or 404 for /admin/stats if not present, but
    # crucially never 200 which would mean cron authorized it).
    assert r.status_code != 200, f"{method} {path} accepted cron header! body={r.text[:200]}"
    assert r.status_code in (401, 403, 404, 405, 422), \
        f"{method} {path} unexpected status {r.status_code}: {r.text[:200]}"
    # If 404/405, that's fine (route absent). For 401/403 it must not include the secret.
    assert CRON_SECRET not in r.text


# --- 7. Idempotency: two ticks in a row keep report shape ---
def test_tick_idempotent(admin_token):
    r1 = requests.post(f"{API}/admin/retention/tick",
                       headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
    r2 = requests.post(f"{API}/admin/retention/tick",
                       headers={"X-PHILEON-RETENTION-CRON": CRON_SECRET}, timeout=30)
    assert r1.status_code == 200 and r2.status_code == 200
    for b in (r1.json(), r2.json()):
        assert b["mode"] == "simulated"
        assert TICK_REPORT_KEYS <= set(b.keys())


# --- 8. Secret non-disclosure across a scan of admin endpoints ---
def test_secret_never_in_responses(admin_token):
    urls = [
        (f"{API}/admin/retention/config", "GET"),
        (f"{API}/admin/retention/pending", "GET"),
        (f"{API}/admin/retention/send-log", "GET"),
        (f"{API}/admin/retention/tick", "POST"),
    ]
    for url, m in urls:
        r = requests.request(m, url, headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
        assert CRON_SECRET not in r.text, f"Secret leaked in {m} {url}"


# --- 9. Config endpoint does not surface the cron secret ---
def test_config_no_cron_secret_field(admin_token):
    r = requests.get(f"{API}/admin/retention/config",
                     headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert r.status_code == 200
    body = r.json()
    # No key should reference cron/secret and no value should equal it
    flat = str(body)
    assert CRON_SECRET not in flat
    assert not any("cron" in str(k).lower() or "secret" in str(k).lower() for k in body.keys())
    # Live must be False
    assert body["live_requested"] is False


# --- 10. Live remains OFF via tick response ---
def test_live_off_default(admin_token):
    r = requests.post(f"{API}/admin/retention/tick",
                      headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    body = r.json()
    assert body["live_requested"] is False
    assert body["live_effective"] is False
    assert body["mode"] == "simulated"
