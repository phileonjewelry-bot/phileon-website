"""PHILEON — first-time admin setup tests (gate · token · hashing · atomicity · login precedence · no secret echo)."""
import asyncio
import os
from datetime import datetime, timedelta, timezone

import bcrypt
import pytest

from services import admin_setup as S

TOKEN = "unit-test-owner-setup-token-0123456789abcdefghij"  # >= 32 chars


@pytest.fixture
def iso_db(monkeypatch):
    """Isolated database so tests never create a real preview admin account."""
    from motor.motor_asyncio import AsyncIOMotorClient
    from dotenv import load_dotenv
    load_dotenv('/app/backend/.env')
    loop = asyncio.new_event_loop()
    client = AsyncIOMotorClient(os.environ["MONGO_URL"], io_loop=loop)
    db = client[os.environ["DB_NAME"] + "_admin_setup_test"]

    async def _reset():
        await db.admins.delete_many({})
        await db.admin_setup_state.delete_many({})
    loop.run_until_complete(_reset())
    monkeypatch.delenv("PHILEON_ENV", raising=False)
    monkeypatch.setenv("ADMIN_SETUP_TOKEN", TOKEN)
    monkeypatch.setenv("ADMIN_SETUP_EXPIRES_AT", (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat())
    yield db, loop
    loop.run_until_complete(_reset())
    client.close()
    loop.close()


def _run(loop, coro):
    return loop.run_until_complete(coro)


def test_gate_open_only_when_all_conditions_hold(iso_db, monkeypatch):
    db, loop = iso_db
    assert _run(loop, S.setup_state(db))["open"] is True
    monkeypatch.setenv("PHILEON_ENV", "production")
    assert _run(loop, S.setup_state(db))["reason"] == "production_env"
    monkeypatch.delenv("PHILEON_ENV")
    monkeypatch.setenv("ADMIN_SETUP_TOKEN", "short")
    assert _run(loop, S.setup_state(db))["reason"] == "token_not_configured"
    monkeypatch.setenv("ADMIN_SETUP_TOKEN", TOKEN)
    monkeypatch.setenv("ADMIN_SETUP_EXPIRES_AT", "")
    assert _run(loop, S.setup_state(db))["reason"] == "window_not_opened"
    monkeypatch.setenv("ADMIN_SETUP_EXPIRES_AT", (datetime.now(timezone.utc) - timedelta(seconds=1)).isoformat())
    assert _run(loop, S.setup_state(db))["reason"] == "window_expired"


def test_complete_requires_token_and_strong_password(iso_db):
    db, loop = iso_db
    code, body = _run(loop, S.complete_setup(db, setup_token="wrong", username="admin", password="x" * 14, confirm="x" * 14))
    assert code == 403 and body["detail"] == "INVALID_SETUP_TOKEN"
    code, body = _run(loop, S.complete_setup(db, setup_token=TOKEN, username="admin", password="short", confirm="short"))
    assert code == 422 and body["detail"] == "PASSWORD_TOO_SHORT"
    code, body = _run(loop, S.complete_setup(db, setup_token=TOKEN, username="admin", password="a" * 14, confirm="b" * 14))
    assert code == 422 and body["detail"] == "PASSWORD_MISMATCH"
    code, body = _run(loop, S.complete_setup(db, setup_token=TOKEN, username="bad user!", password="a" * 14, confirm="a" * 14))
    assert code == 422 and body["detail"] == "USERNAME_INVALID"
    assert _run(loop, db.admins.count_documents({})) == 0


def test_complete_creates_single_bcrypt_account_and_closes(iso_db):
    db, loop = iso_db
    pw = "Correct-Horse-Battery-Staple-42"
    code, body = _run(loop, S.complete_setup(db, setup_token=TOKEN, username="admin", password=pw, confirm=pw))
    assert code == 201 and body == {"ok": True, "username": "admin", "login_path": "/admin/login"}
    doc = _run(loop, db.admins.find_one({"_id": S.OWNER_ADMIN_ID}))
    assert doc["password_hash"].startswith("$2b$12$") and pw not in str(doc)
    assert bcrypt.checkpw(pw.encode(), doc["password_hash"].encode())
    # Gate is now permanently closed; a second attempt (even with the token) is refused.
    assert _run(loop, S.setup_state(db))["open"] is False
    code, body = _run(loop, S.complete_setup(db, setup_token=TOKEN, username="other", password=pw, confirm=pw))
    assert code == 403 and body["detail"] == "SETUP_CLOSED"
    assert _run(loop, db.admins.count_documents({})) == 1
    # Token scrubbed from the running process.
    assert os.environ.get("ADMIN_SETUP_TOKEN") == ""


def test_concurrent_completion_has_single_winner(iso_db):
    db, loop = iso_db
    pw = "Concurrent-Setup-Password-99"

    async def _race():
        return await asyncio.gather(*[
            S.complete_setup(db, setup_token=TOKEN, username=f"admin{i}", password=pw, confirm=pw) for i in range(6)])
    results = _run(loop, _race())
    codes = sorted(c for c, _ in results)
    assert codes.count(201) == 1 and all(c in (201, 403, 409) for c in codes)
    assert _run(loop, db.admins.count_documents({})) == 1


def test_login_precedence_db_owner_over_env(iso_db, monkeypatch):
    db, loop = iso_db
    env_pw = "Legacy-Env-Password-123"
    monkeypatch.setenv("ADMIN_USERNAME", "admin")
    monkeypatch.setenv("ADMIN_PASSWORD_HASH", bcrypt.hashpw(env_pw.encode(), bcrypt.gensalt(4)).decode())
    # Zero DB admins → env credential path (production behaviour) works unchanged.
    assert _run(loop, S.authenticate_admin(db, username="admin", password=env_pw)) is True
    assert _run(loop, S.authenticate_admin(db, username="admin", password="nope-nope-nope")) is False
    # Owner creates account → DB wins and legacy env credential is no longer accepted.
    pw = "Owner-Chosen-Password-2026"
    assert _run(loop, S.complete_setup(db, setup_token=TOKEN, username="admin", password=pw, confirm=pw))[0] == 201
    assert _run(loop, S.authenticate_admin(db, username="admin", password=pw)) is True
    assert _run(loop, S.authenticate_admin(db, username="admin", password=env_pw)) is False
    assert _run(loop, S.authenticate_admin(db, username="someone", password=pw)) is False


# ── HTTP (live app DB — must never create an account) ──────────

def test_http_status_and_closed_paths_never_echo_secrets(app_client, monkeypatch):
    monkeypatch.setenv("ADMIN_SETUP_TOKEN", "")
    monkeypatch.setenv("ADMIN_SETUP_EXPIRES_AT", "")
    r = app_client.get("/api/admin/setup/status")
    assert r.status_code == 200 and r.json()["open"] is False
    assert "ADMIN_SETUP_TOKEN" not in r.text and TOKEN not in r.text
    secret_pw = "Should-Never-Echo-Back-77"
    r = app_client.post("/api/admin/setup/complete", json={"setup_token": "guess-token-value", "username": "admin",
                                                           "password": secret_pw, "password_confirm": secret_pw})
    assert r.status_code == 403 and r.json()["detail"] == "SETUP_CLOSED"
    assert secret_pw not in r.text and "guess-token-value" not in r.text
    r = app_client.post("/api/admin/setup/complete", json={"setup_token": 123})
    assert r.status_code == 400 and "123" not in r.text
    r = app_client.post("/api/admin/setup/complete", data="not json", headers={"Content-Type": "application/json"})
    assert r.status_code == 400


def test_http_setup_rate_limited(app_client, monkeypatch):
    monkeypatch.setenv("ADMIN_SETUP_TOKEN", "")
    hdr = {"X-Real-IP": "203.0.113.77"}
    codes = [app_client.post("/api/admin/setup/complete", json={}, headers=hdr).status_code for _ in range(7)]
    assert 429 in codes and codes[-1] == 429
