"""Shared pytest fixtures for tests that require the FastAPI app.

FastAPI TestClient combined with Motor (async MongoDB) binds the AsyncIO
event loop the first time it's created. Reusing the SAME TestClient across
all HTTP tests avoids the "Event loop is closed" RuntimeError when a
second test module tries to spin up its own client.
"""
import os
import sys
import pytest
from fastapi.testclient import TestClient

# Sentinel Stripe env so `_require_payment_config()` passes. Real Stripe
# calls are monkeypatched away per-test.
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_dummy_shared_fixture")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_dummy_shared_fixture")
os.environ.setdefault("STRIPE_MODE", "test")
sys.path.insert(0, "/app/backend")


@pytest.fixture(scope="session")
def app_client():
    """One TestClient instance for the entire pytest session."""
    from server import app
    with TestClient(app) as c:
        yield c
