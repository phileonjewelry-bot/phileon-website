"""Shared pytest fixtures for tests that require the FastAPI app.

FastAPI TestClient combined with Motor (async MongoDB) binds the AsyncIO
event loop the first time it's created. Reusing the SAME TestClient across
all HTTP tests avoids the "Event loop is closed" RuntimeError when a
second test module tries to spin up its own client.

DATABASE ISOLATION (fail-closed):
    Every pytest session rebinds `DB_NAME` to a disposable
    `<DB_NAME>_pytest_<hex>` database BEFORE `server` is imported, and drops
    it when the session ends. `server.py` additionally refuses to start under
    pytest unless the bound database name carries the `_pytest_` marker, so
    automated tests can never write into the persistent preview/production
    analytics collections again.
"""
import os
import sys
import uuid
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, "/app/backend")

# Sentinel Stripe env so `_require_payment_config()` passes. Real Stripe
# calls are monkeypatched away per-test.
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_dummy_shared_fixture")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_dummy_shared_fixture")
os.environ.setdefault("STRIPE_MODE", "test")

# ── Disposable database binding (must run before any `import server`) ──
try:
    from dotenv import load_dotenv
    load_dotenv("/app/backend/.env")
except Exception:  # pragma: no cover
    pass
PYTEST_DB_MARKER = "_pytest_"
_BASE_DB_NAME = os.environ.get("DB_NAME", "phileon")
if PYTEST_DB_MARKER not in _BASE_DB_NAME:
    os.environ["DB_NAME"] = f"{_BASE_DB_NAME}{PYTEST_DB_MARKER}{uuid.uuid4().hex[:8]}"
PYTEST_DB_NAME = os.environ["DB_NAME"]
# Persistent (preview/production) DB name — for read-only checks and opt-in live harnesses only.
os.environ["PHILEON_PERSISTENT_DB_NAME"] = _BASE_DB_NAME
# Live-server e2e harnesses write orders into the persistent DB; they stay OFF unless explicitly opted in.
LIVE_E2E_ALLOWED = os.environ.get("PHILEON_ALLOW_LIVE_E2E") == "1"
assert PYTEST_DB_MARKER in PYTEST_DB_NAME and PYTEST_DB_NAME != _BASE_DB_NAME


def pytest_sessionfinish(session, exitstatus):
    """Drop the disposable database so no fixture data persists anywhere."""
    url = os.environ.get("MONGO_URL")
    if not url or PYTEST_DB_MARKER not in PYTEST_DB_NAME:
        return
    try:
        from pymongo import MongoClient
        c = MongoClient(url, serverSelectionTimeoutMS=2000)
        for name in c.list_database_names():
            if name.startswith(f"{PYTEST_DB_NAME}"):
                c.drop_database(name)
        c.close()
    except Exception:  # pragma: no cover - never fail the run on cleanup
        pass


@pytest.fixture(scope="session")
def app_client():
    """One TestClient instance for the entire pytest session (disposable DB)."""
    from server import app, db
    assert PYTEST_DB_MARKER in db.name, "app bound to a non-disposable database"
    with TestClient(app) as c:
        yield c
