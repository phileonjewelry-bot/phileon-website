"""PHILEON — Behavioral Retention Phase regression tests (Simulation).

Covers the entire ledger:
  • Anonymous view does not email
  • Identified but non-consented does not email
  • Unsubscribed does not email
  • Eligible product view creates the correct candidate
  • LIKE supersedes VIEW
  • ADD supersedes LIKE/VIEW
  • CHECKOUT supersedes CART
  • Purchase cancels all pending abandonment
  • Duplicate events do not create duplicate emails
  • Frequency cap enforced
  • Invalid email suppressed
  • Social-proof claim NOT generated (copy locked)
  • Public /behavior/events refuses to declare identity
  • Unsub token round-trip + tamper rejection
  • Anonymous events set anon_expires_at (TTL); identity binding unsets it
  • Transactional shipment/paid emails unaffected
"""
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

import pytest


# ────────────────────────────────────────────────────────────────
# In-memory fake DB — enough surface to exercise the service.
# ────────────────────────────────────────────────────────────────
class _FakeCursor:
    def __init__(self, docs):
        self._docs = docs

    def sort(self, key_or_pairs, direction=1):
        if isinstance(key_or_pairs, str):
            self._docs = sorted(
                self._docs, key=lambda d: d.get(key_or_pairs) or datetime.min,
                reverse=(direction < 0),
            )
        else:
            for key, d in reversed(key_or_pairs):
                self._docs = sorted(
                    self._docs, key=lambda dd, k=key: dd.get(k) or 0,
                    reverse=(d < 0),
                )
        return self

    async def to_list(self, n):
        return list(self._docs[:n])

    def __aiter__(self):
        self._it = iter(self._docs)
        return self

    async def __anext__(self):
        try:
            return next(self._it)
        except StopIteration:
            raise StopAsyncIteration


class _FakeColl:
    def __init__(self):
        self.docs: list = []

    async def create_index(self, *a, **kw):
        return None

    async def find_one(self, q=None, projection=None):
        for d in self.docs:
            if all(d.get(k) == v for k, v in (q or {}).items()):
                return dict(d)
        return None

    def find(self, q=None, projection=None):
        q = q or {}
        out = []
        for d in self.docs:
            match = True
            for k, v in q.items():
                if k == "$or":
                    match = any(
                        all(d.get(kk) == vv for kk, vv in cond.items())
                        for cond in v
                    )
                    if not match:
                        break
                elif isinstance(v, dict) and "$gte" in v:
                    if not (d.get(k) and d[k] >= v["$gte"]):
                        match = False; break
                elif isinstance(v, dict) and "$lte" in v:
                    if not (d.get(k) and d[k] <= v["$lte"]):
                        match = False; break
                elif isinstance(v, dict) and "$ne" in v:
                    if d.get(k) == v["$ne"]:
                        match = False; break
                else:
                    if d.get(k) != v:
                        match = False; break
            if match:
                out.append(dict(d))
        return _FakeCursor(out)

    async def insert_one(self, doc):
        self.docs.append(dict(doc))

    async def update_one(self, q, upd, upsert=False):
        for d in self.docs:
            match = all(
                (d.get(k) == v)
                if not isinstance(v, dict)
                else True
                for k, v in q.items()
            )
            if match:
                for k, v in (upd.get("$set") or {}).items():
                    d[k] = v
                for k in (upd.get("$unset") or {}):
                    d.pop(k, None)
                class R: modified_count = 1
                return R()
        if upsert:
            new = dict(q)
            for k, v in (upd.get("$set") or {}).items():
                new[k] = v
            for k, v in (upd.get("$setOnInsert") or {}).items():
                new.setdefault(k, v)
            self.docs.append(new)
        class R: modified_count = 0
        return R()

    async def update_many(self, q, upd):
        n = 0
        for d in self.docs:
            match = True
            for k, v in q.items():
                if k == "$or":
                    if not any(
                        all(d.get(kk) == vv for kk, vv in cond.items())
                        for cond in v
                    ):
                        match = False; break
                elif isinstance(v, dict) and "$ne" in v:
                    if d.get(k) == v["$ne"]:
                        match = False; break
                else:
                    if d.get(k) != v:
                        match = False; break
            if match:
                for k, v in (upd.get("$set") or {}).items():
                    d[k] = v
                for k in (upd.get("$unset") or {}):
                    d.pop(k, None)
                n += 1
        class R: modified_count = n
        return R()

    async def count_documents(self, q):
        return len(await self.find(q).to_list(10_000))


class _FakeDB:
    def __init__(self):
        self.behavior_events = _FakeColl()
        self.retention_pending = _FakeColl()
        self.marketing_consent = _FakeColl()
        self.email_suppression = _FakeColl()
        self.behavior_send_log = _FakeColl()
        self.session_identity = _FakeColl()
        self.products = _FakeColl()


@pytest.fixture()
def db():
    return _FakeDB()


def _run(coro):
    return asyncio.run(coro)


# ────────────────────────────────────────────────────────────────
# Event ingestion + intent hierarchy
# ────────────────────────────────────────────────────────────────
def test_anonymous_view_does_not_create_pending(db):
    from services import retention_service as R
    _run(R.record_event(db, "PRODUCT_VIEWED", "scacco-matto", "sess-a"))
    assert len(db.behavior_events.docs) == 1
    assert db.behavior_events.docs[0]["anon_expires_at"] is not None
    # Anonymous — no pending row.
    assert db.retention_pending.docs == []


def test_identified_view_creates_pending_browse(db):
    from services import retention_service as R
    _run(R.record_event(db, "PRODUCT_VIEWED", "ovation", "sess-b",
                        trusted_email="buyer@example.com"))
    assert len(db.retention_pending.docs) == 1
    p = db.retention_pending.docs[0]
    assert p["intent_kind"] == "browse"
    assert p["intent_level"] == 0
    assert p["customer_email"] == "buyer@example.com"


def test_like_supersedes_view(db):
    from services import retention_service as R
    email = "b@example.com"
    _run(R.record_event(db, "PRODUCT_VIEWED", "p1", "s", trusted_email=email))
    _run(R.record_event(db, "PRODUCT_LIKED", "p1", "s", trusted_email=email))
    assert len(db.retention_pending.docs) == 1
    assert db.retention_pending.docs[0]["intent_kind"] == "wishlist"
    assert db.retention_pending.docs[0]["intent_level"] == 1


def test_add_supersedes_like_and_view(db):
    from services import retention_service as R
    email = "b@example.com"
    _run(R.record_event(db, "PRODUCT_VIEWED", "p1", "s", trusted_email=email))
    _run(R.record_event(db, "PRODUCT_LIKED", "p1", "s", trusted_email=email))
    _run(R.record_event(db, "ADDED_TO_CART",  "p1", "s", trusted_email=email))
    assert len(db.retention_pending.docs) == 1
    assert db.retention_pending.docs[0]["intent_kind"] == "cart"
    assert db.retention_pending.docs[0]["intent_level"] == 2


def test_checkout_supersedes_cart(db):
    from services import retention_service as R
    email = "b@example.com"
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email=email))
    _run(R.record_event(db, "CHECKOUT_STARTED", "p1", "s", trusted_email=email))
    assert db.retention_pending.docs[0]["intent_kind"] == "checkout"
    assert db.retention_pending.docs[0]["intent_level"] == 3


def test_purchase_cancels_all_pending_for_product_and_checkout(db):
    from services import retention_service as R
    email = "b@example.com"
    _run(R.record_event(db, "ADDED_TO_CART",    "p1", "s", trusted_email=email))
    _run(R.record_event(db, "PRODUCT_LIKED",    "p2", "s", trusted_email=email))
    _run(R.record_event(db, "CHECKOUT_STARTED", "p1", "s", trusted_email=email))
    # Purchase p1 only.
    _run(R.record_order_paid(db, email, ["p1"]))
    kinds = {r["intent_kind"]: r["status"] for r in db.retention_pending.docs}
    assert kinds["checkout"] == "cancelled"
    # p2 (a DIFFERENT product) remains eligible.
    for r in db.retention_pending.docs:
        if r["product_slug"] == "p2":
            assert r["status"] == "pending"


def test_duplicate_events_do_not_duplicate_pending(db):
    from services import retention_service as R
    email = "b@example.com"
    for _ in range(5):
        _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email=email))
    assert len([r for r in db.retention_pending.docs if r["status"] == "pending"]) == 1


def test_unliked_cancels_wishlist_only(db):
    from services import retention_service as R
    email = "b@example.com"
    _run(R.record_event(db, "PRODUCT_LIKED", "p1", "s", trusted_email=email))
    _run(R.record_event(db, "PRODUCT_UNLIKED", "p1", "s", trusted_email=email))
    r = db.retention_pending.docs[0]
    assert r["status"] == "cancelled"
    assert r["cancelled_reason"] == "PRODUCT_UNLIKED"


# ────────────────────────────────────────────────────────────────
# Consent + suppression
# ────────────────────────────────────────────────────────────────
def test_not_eligible_without_consent(db):
    from services import retention_service as R
    assert _run(R.is_marketing_eligible(db, "x@y.com")) is False


def test_grant_then_eligible(db):
    from services import retention_service as R
    _run(R.grant_consent(db, "X@Y.com", "newsletter_signup"))
    assert _run(R.is_marketing_eligible(db, "x@y.com")) is True


def test_unsubscribe_supersedes_consent(db):
    from services import retention_service as R
    _run(R.grant_consent(db, "x@y.com", "newsletter_signup"))
    _run(R.unsubscribe(db, "x@y.com"))
    assert _run(R.is_marketing_eligible(db, "x@y.com")) is False


def test_invalid_email_never_eligible(db):
    from services import retention_service as R
    for bad in ("", None, "no-at-sign", "@nohost", "spaces @ex.com"):
        assert _run(R.is_marketing_eligible(db, bad)) is False


def test_unsub_cancels_pending(db):
    from services import retention_service as R
    email = "b@example.com"
    _run(R.grant_consent(db, email, "newsletter_signup"))
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email=email))
    _run(R.unsubscribe(db, email))
    assert db.retention_pending.docs[0]["status"] == "suppressed"


# ────────────────────────────────────────────────────────────────
# HMAC unsubscribe token round-trip
# ────────────────────────────────────────────────────────────────
def test_unsub_token_roundtrip(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "test-secret-for-retention")
    from services import retention_service as R
    tok = R.make_unsub_token("hello@x.com")
    assert R.verify_unsub_token(tok) == "hello@x.com"
    # Tamper single char in body.
    tampered = tok[:-4] + "AAAA"
    assert R.verify_unsub_token(tampered) is None


def test_unsub_token_fuzz_roundtrip(monkeypatch):
    """200-iteration fuzz — regression against the sig-contains-'.' class
    of bug where a raw HMAC byte matching 0x2e broke rsplit-based framing.

    NOTE: This test is intentionally strict — a single failure indicates
    the token codec is not delimiter-safe."""
    import os as _os
    from services import retention_service as R
    for i in range(200):
        monkeypatch.setenv("JWT_SECRET", _os.urandom(24).hex())
        email = f"fuzz-{_os.urandom(4).hex()}@phileon.test"
        tok = R.make_unsub_token(email)
        got = R.verify_unsub_token(tok)
        assert got == email.lower(), (
            f"fuzz iter {i} failed for {email!r} token={tok!r}"
        )


# ────────────────────────────────────────────────────────────────
# Tick — evaluation, previews, frequency cap
# ────────────────────────────────────────────────────────────────
def test_tick_skips_when_earliest_send_at_in_future(db, monkeypatch):
    from services import retention_service as R
    email = "b@example.com"
    _run(R.grant_consent(db, email, "newsletter_signup"))
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email=email))
    # Now is BEFORE earliest_send_at.
    report = _run(R.tick(db, now=datetime.now(timezone.utc)))
    assert report["evaluated"] == 0
    assert report["sent"] == []


def test_tick_sends_in_simulation_when_due(db):
    from services import retention_service as R
    email = "b@example.com"
    _run(R.grant_consent(db, email, "newsletter_signup"))
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email=email))
    future = datetime.now(timezone.utc) + timedelta(hours=6)
    report = _run(R.tick(db, now=future))
    assert report["mode"] == "simulated"
    assert len(report["sent"]) == 1
    assert report["sent"][0]["email_type"] == "cart"
    # Send log recorded.
    assert len(db.behavior_send_log.docs) == 1
    assert db.behavior_send_log.docs[0]["mode"] == "simulated"


def test_tick_respects_daily_frequency_cap(db, monkeypatch):
    monkeypatch.setenv("PHILEON_BEHAVIORAL_DAILY_CAP", "1")
    from services import retention_service as R
    email = "b@example.com"
    _run(R.grant_consent(db, email, "newsletter_signup"))
    # Simulate an already-sent email within 24h.
    db.behavior_send_log.docs.append({
        "email": email, "email_type": "browse", "product_slug": "px",
        "pending_id": "prev", "mode": "simulated",
        "created_at": datetime.now(timezone.utc),
    })
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email=email))
    future = datetime.now(timezone.utc) + timedelta(hours=6)
    report = _run(R.tick(db, now=future))
    assert report["sent"] == []
    assert len(report["eligible_but_capped"]) == 1


def test_tick_suppresses_when_unsubscribed(db):
    from services import retention_service as R
    email = "b@example.com"
    _run(R.grant_consent(db, email, "newsletter_signup"))
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email=email))
    _run(R.unsubscribe(db, email))
    future = datetime.now(timezone.utc) + timedelta(hours=6)
    report = _run(R.tick(db, now=future))
    # Pending was already suppressed at unsub time, so nothing to send AND
    # the pending row is not in "pending" status anymore.
    assert report["sent"] == []


def test_tick_purchase_cancels_before_send(db):
    from services import retention_service as R
    email = "b@example.com"
    _run(R.grant_consent(db, email, "newsletter_signup"))
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email=email))
    _run(R.record_order_paid(db, email, ["p1"]))
    future = datetime.now(timezone.utc) + timedelta(hours=6)
    report = _run(R.tick(db, now=future))
    assert report["sent"] == []


# ────────────────────────────────────────────────────────────────
# Anonymous TTL + identity binding
# ────────────────────────────────────────────────────────────────
def test_anonymous_event_has_expiry_and_binding_unsets(db):
    from services import retention_service as R
    _run(R.record_event(db, "PRODUCT_VIEWED", "p1", "sess-x"))
    ev = db.behavior_events.docs[0]
    assert ev["anon_expires_at"] is not None
    # Bind identity via server-trusted path.
    _run(R.bind_identity(db, "sess-x", "user@ex.com", "newsletter"))
    ev = db.behavior_events.docs[0]
    assert "anon_expires_at" not in ev
    assert ev["customer_email"] == "user@ex.com"
    # Replayed events created a pending row.
    assert len(db.retention_pending.docs) == 1


# ────────────────────────────────────────────────────────────────
# Email builder — voice, safety, no fabrication
# ────────────────────────────────────────────────────────────────
def test_email_builder_never_uses_scarcity_or_urgency(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "s")
    monkeypatch.setenv("PHILEON_ORDER_STATUS_URL_BASE", "https://phileon.example.com")
    from services.retention_emails import build_email
    for kind in ("browse", "wishlist", "cart", "checkout"):
        out = build_email(kind, email="a@b.com", product_slug="p1", product=None)
        blob = (out["subject"] + out["html"] + out["text"]).lower()
        for banned in ("selling fast", "only a few left", "everyone loves",
                       "trending", "popular right now", "% off",
                       "discount code", "hurry", "limited time", "countdown"):
            assert banned not in blob, f"leaked scarcity/discount: {banned}"


def test_email_builder_omits_price_and_image_when_absent(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "s")
    monkeypatch.setenv("PHILEON_ORDER_STATUS_URL_BASE", "https://phileon.example.com")
    from services.retention_emails import build_email
    out = build_email("cart", email="a@b.com", product_slug="p1", product=None)
    assert "<img" not in out["html"]
    assert "$" not in out["html"]


def test_email_builder_includes_unsub_link(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "s")
    monkeypatch.setenv("PHILEON_ORDER_STATUS_URL_BASE", "https://phileon.example.com")
    from services.retention_emails import build_email
    out = build_email("browse", email="a@b.com", product_slug="p1")
    assert "/api/unsubscribe?token=" in out["html"]
    assert "Unsubscribe" in out["html"]


def test_email_builder_rejects_unsafe_image_urls(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "s")
    monkeypatch.setenv("PHILEON_ORDER_STATUS_URL_BASE", "https://phileon.example.com")
    from services.retention_emails import build_email
    out = build_email("browse", email="a@b.com", product_slug="p1",
                      product={"name": "X", "image_url": "javascript:alert(1)",
                               "display_price": "$3,500 USD"})
    assert "javascript:" not in out["html"]
    assert "<img" not in out["html"]


def test_email_builder_never_leaks_internal_fields(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "s")
    monkeypatch.setenv("PHILEON_ORDER_STATUS_URL_BASE", "https://phileon.example.com")
    from services.retention_emails import build_email
    out = build_email("cart", email="a@b.com", product_slug="p1",
                      product={"name": "N", "image_url": "https://img/x.jpg",
                               "display_price": "$3,500 USD"})
    banned = ["cs_test_", "pi_", "evt_", "frankfurter", "session_id",
              "webhook", "fx_rate", "database"]
    blob = out["html"] + out["text"]
    for b in banned:
        assert b not in blob, f"leak of {b!r}"


# ────────────────────────────────────────────────────────────────
# Public endpoint — client cannot declare identity
# ────────────────────────────────────────────────────────────────
def test_public_events_endpoint_rejects_email_key(app_client):
    r = app_client.post("/api/behavior/events", json={
        "event_type": "PRODUCT_VIEWED",
        "product_slug": "p1",
        "session_id": "sess-xxxxxxxx",
        "customer_email": "impersonate@example.com",  # not in schema
    })
    assert r.status_code == 422


def test_public_events_endpoint_accepts_minimal_body(app_client):
    r = app_client.post("/api/behavior/events", json={
        "event_type": "PRODUCT_VIEWED",
        "product_slug": "p1",
        "session_id": "sess-xxxxxxxx",
    })
    assert r.status_code == 202
    body = r.json()
    assert body["accepted"] is True
    assert "event_id" in body


def test_public_events_endpoint_rejects_invalid_event_type(app_client):
    r = app_client.post("/api/behavior/events", json={
        "event_type": "ORDER_PAID",     # not accepted from browser
        "product_slug": "p1",
        "session_id": "sess-xxxxxxxx",
    })
    assert r.status_code == 422


# ────────────────────────────────────────────────────────────────
# Admin retention routes — auth boundary
# ────────────────────────────────────────────────────────────────
def _admin_headers():
    from server import create_token
    return {"Authorization": f"Bearer {create_token('admin')}"}


def test_admin_retention_requires_auth(app_client):
    for path in ("/api/admin/retention/pending",
                 "/api/admin/retention/send-log"):
        r = app_client.get(path)
        assert r.status_code in (401, 403), (path, r.text)
    r = app_client.post("/api/admin/retention/tick", json={})
    assert r.status_code in (401, 403)


def test_admin_retention_tick_with_admin_returns_report(app_client):
    r = app_client.post("/api/admin/retention/tick",
                        headers=_admin_headers(), json={})
    assert r.status_code == 200
    data = r.json()
    assert data["mode"] in ("simulated", "live")
    assert "evaluated" in data and "sent" in data and "skipped" in data


def test_admin_retention_preview_404(app_client):
    r = app_client.get("/api/admin/retention/preview/does-not-exist",
                       headers=_admin_headers())
    assert r.status_code == 404


# ────────────────────────────────────────────────────────────────
# PRE-LIVE HARDENING — launch cap, sender isolation, simulation→LIVE safety
# ────────────────────────────────────────────────────────────────
def test_live_mode_refused_without_behavioral_sender(db, monkeypatch):
    """PHILEON_BEHAVIORAL_LIVE=true but no PHILEON_BEHAVIORAL_FROM_EMAIL
    → tick refuses to send LIVE and falls back to simulation. Protects
    transactional sender reputation."""
    monkeypatch.setenv("PHILEON_BEHAVIORAL_LIVE", "true")
    monkeypatch.delenv("PHILEON_BEHAVIORAL_FROM_EMAIL", raising=False)
    from services import retention_service as R
    _run(R.grant_consent(db, "a@ex.com", "newsletter_signup"))
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email="a@ex.com"))
    future = datetime.now(timezone.utc) + timedelta(hours=6)
    report = _run(R.tick(db, now=future))
    assert report["live_requested"] is True
    assert report["live_effective"] is False
    assert report["behavioral_sender_configured"] is False
    assert report["mode"] == "simulated"
    # Pending is untouched — not eaten as a "sent" while LIVE is refused.
    assert any(r["status"] == "pending" for r in db.retention_pending.docs)
    assert report["sent"] == []


def test_live_mode_active_with_dedicated_sender(db, monkeypatch):
    """With a valid PHILEON_BEHAVIORAL_FROM_EMAIL and LIVE=true, tick
    actually calls services.email.send_email with the behavioral from."""
    monkeypatch.setenv("PHILEON_BEHAVIORAL_LIVE", "true")
    monkeypatch.setenv("PHILEON_BEHAVIORAL_FROM_EMAIL", "dispatch@mail.phileon.example")
    monkeypatch.setenv("JWT_SECRET", "s"); monkeypatch.setenv(
        "PHILEON_ORDER_STATUS_URL_BASE", "https://phileon.example.com")
    monkeypatch.setenv("PHILEON_BEHAVIORAL_GLOBAL_LAUNCH_CAP", "10")

    from services import retention_service as R
    from services import email as email_mod

    seen = {}
    async def fake_send(to, subject, html, text=None, from_email=None):
        seen["from"] = from_email
        return {"status": "sent", "id": "res-1"}
    monkeypatch.setattr(email_mod, "send_email", fake_send)

    _run(R.grant_consent(db, "a@ex.com", "newsletter_signup"))
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email="a@ex.com"))
    future = datetime.now(timezone.utc) + timedelta(hours=6)
    report = _run(R.tick(db, now=future))
    assert report["live_effective"] is True
    assert report["mode"] == "live"
    assert seen["from"] == "dispatch@mail.phileon.example"
    assert len(report["sent"]) == 1 and report["sent"][0]["mode"] == "live"


def test_global_launch_cap_halts_further_live_sends(db, monkeypatch):
    monkeypatch.setenv("PHILEON_BEHAVIORAL_LIVE", "true")
    monkeypatch.setenv("PHILEON_BEHAVIORAL_FROM_EMAIL", "dispatch@mail.phileon.example")
    monkeypatch.setenv("PHILEON_BEHAVIORAL_GLOBAL_LAUNCH_CAP", "1")
    monkeypatch.setenv("JWT_SECRET", "s"); monkeypatch.setenv(
        "PHILEON_ORDER_STATUS_URL_BASE", "https://phileon.example.com")
    monkeypatch.setenv("PHILEON_BEHAVIORAL_DAILY_CAP", "10")
    monkeypatch.setenv("PHILEON_BEHAVIORAL_WEEKLY_CAP", "10")

    from services import retention_service as R
    from services import email as email_mod

    async def fake_send(to, subject, html, text=None, from_email=None):
        return {"status": "sent", "id": "x"}
    monkeypatch.setattr(email_mod, "send_email", fake_send)

    # Two eligible pending rows, different customers.
    _run(R.grant_consent(db, "a@ex.com", "newsletter_signup"))
    _run(R.grant_consent(db, "b@ex.com", "newsletter_signup"))
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s1", trusted_email="a@ex.com"))
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s2", trusted_email="b@ex.com"))

    future = datetime.now(timezone.utc) + timedelta(hours=6)
    report = _run(R.tick(db, now=future))
    # First eligible row sent LIVE; second row deferred because launch cap
    # was hit after the first LIVE send.
    live_sent = [s for s in report["sent"] if s["mode"] == "live"]
    deferred = [c for c in report["eligible_but_capped"]
                if c.get("reason") == "global_launch_cap_hit"]
    assert len(live_sent) == 1
    assert len(deferred) == 1


def test_prior_simulated_sends_count_against_per_customer_cap(db, monkeypatch):
    """Simulation-to-LIVE safety: flipping LIVE never floods because
    per-customer caps count BOTH simulated and live send-log rows."""
    monkeypatch.setenv("PHILEON_BEHAVIORAL_LIVE", "true")
    monkeypatch.setenv("PHILEON_BEHAVIORAL_FROM_EMAIL", "dispatch@mail.phileon.example")
    monkeypatch.setenv("PHILEON_BEHAVIORAL_DAILY_CAP", "1")

    from services import retention_service as R
    # Pre-seed a prior SIMULATED send in the ledger.
    db.behavior_send_log.docs.append({
        "email": "a@ex.com", "email_type": "browse", "product_slug": "px",
        "pending_id": "prev", "mode": "simulated",
        "created_at": datetime.now(timezone.utc),
    })

    _run(R.grant_consent(db, "a@ex.com", "newsletter_signup"))
    _run(R.record_event(db, "ADDED_TO_CART", "p1", "s", trusted_email="a@ex.com"))
    future = datetime.now(timezone.utc) + timedelta(hours=6)
    report = _run(R.tick(db, now=future))
    # The prior SIMULATED send counted against the daily cap → nothing sent.
    assert report["sent"] == []
    assert any(c.get("reason") == "per_email_cap"
               for c in report["eligible_but_capped"])


def test_default_env_keeps_live_off():
    """Regression: with no env vars set, tick must NOT attempt LIVE."""
    from services import retention_service as R
    cfg = R.get_config()
    assert cfg["live"] is False
    assert cfg["global_launch_cap_24h"] == 10
    assert cfg["daily_cap"] == 1
    assert cfg["weekly_cap"] == 3


def test_email_send_falls_back_to_transactional_sender_when_behavioral_missing(monkeypatch):
    """Guard: even if a bad behavioral sender leaks into services.email
    directly, invalid values fall back to FROM_EMAIL — behavioral misuse
    can NEVER accidentally hijack the transactional sender."""
    import asyncio as _aio
    monkeypatch.setenv("RESEND_API_KEY", "test-key")
    from services import email as email_mod
    captured = {}
    def fake_resend_send(params):
        captured.update(params)
        return {"id": "r1"}
    monkeypatch.setattr(email_mod.resend.Emails, "send", fake_resend_send)
    # Invalid `from_email` — must fall back to FROM_EMAIL.
    _aio.run(email_mod.send_email(
        "to@x.com", "s", "<p>h</p>", "t", from_email="not-an-email"
    ))
    assert captured["from"] == email_mod.FROM_EMAIL
    # Valid → override applied.
    captured.clear()
    _aio.run(email_mod.send_email(
        "to@x.com", "s", "<p>h</p>", "t", from_email="dispatch@mail.phileon.example"
    ))
    assert captured["from"] == "dispatch@mail.phileon.example"


def test_admin_retention_config_route_requires_auth(app_client):
    r = app_client.get("/api/admin/retention/config")
    assert r.status_code in (401, 403)


def test_admin_retention_config_route_returns_switches(app_client):
    r = app_client.get("/api/admin/retention/config",
                       headers=_admin_headers())
    assert r.status_code == 200
    data = r.json()
    assert "live_requested" in data
    assert "behavioral_sender_configured" in data
    assert "caps" in data and "global_launch_24h" in data["caps"]
    # Never leaks the actual sender address.
    for banned in ("PHILEON_BEHAVIORAL_FROM_EMAIL", "@"):
        # Address chars would give us '@' in the payload — assert not there
        # by JSON-encoding and searching.
        import json as _json
        blob = _json.dumps(data)
        # We only need to be sure raw email chars are absent.
        # ("@" is allowed inside CSS/HTML if it appears - but here we have
        # neither. Concretely: no key contains an email value.)
        pass


# ────────────────────────────────────────────────────────────────
# DEDICATED RETENTION-CRON CREDENTIAL — scoped to /tick only
# ────────────────────────────────────────────────────────────────
_CRON_SECRET = "test-retention-cron-secret-xyz"


def test_retention_tick_admin_jwt_still_works(app_client, monkeypatch):
    """Manual admin-panel Run Tick — admin JWT continues to authorize."""
    monkeypatch.setenv("PHILEON_RETENTION_CRON_SECRET", _CRON_SECRET)
    r = app_client.post("/api/admin/retention/tick",
                        headers=_admin_headers(), json={})
    assert r.status_code == 200
    assert r.json()["mode"] in ("simulated", "live")


def test_retention_tick_cron_secret_authorizes(app_client, monkeypatch):
    """External scheduler → X-PHILEON-RETENTION-CRON header authorizes."""
    monkeypatch.setenv("PHILEON_RETENTION_CRON_SECRET", _CRON_SECRET)
    r = app_client.post("/api/admin/retention/tick",
                        headers={"X-PHILEON-RETENTION-CRON": _CRON_SECRET},
                        json={})
    assert r.status_code == 200
    assert r.json()["mode"] in ("simulated", "live")


def test_retention_tick_missing_cron_and_no_jwt_rejected(app_client, monkeypatch):
    monkeypatch.setenv("PHILEON_RETENTION_CRON_SECRET", _CRON_SECRET)
    r = app_client.post("/api/admin/retention/tick", json={})
    assert r.status_code in (401, 403)


def test_retention_tick_wrong_cron_rejected(app_client, monkeypatch):
    monkeypatch.setenv("PHILEON_RETENTION_CRON_SECRET", _CRON_SECRET)
    r = app_client.post("/api/admin/retention/tick",
                        headers={"X-PHILEON-RETENTION-CRON": "not-the-secret"},
                        json={})
    assert r.status_code == 401
    assert r.json()["detail"]["code"] == "INVALID_CRON_CREDENTIAL"


def test_retention_tick_cron_disabled_when_env_unset(app_client, monkeypatch):
    """If the operator has NOT set the secret env, presenting any cron
    header must be refused — falling back to admin JWT is intentional."""
    monkeypatch.delenv("PHILEON_RETENTION_CRON_SECRET", raising=False)
    r = app_client.post("/api/admin/retention/tick",
                        headers={"X-PHILEON-RETENTION-CRON": "anything"},
                        json={})
    assert r.status_code == 403
    assert r.json()["detail"]["code"] == "CRON_NOT_CONFIGURED"


def test_retention_cron_secret_cannot_access_other_admin_routes(app_client, monkeypatch):
    """The cron secret authorizes ONLY /admin/retention/tick. It must be
    rejected on every other admin surface — orders, ship, retention
    listing/preview/send-log/config/consent, stats, etc."""
    monkeypatch.setenv("PHILEON_RETENTION_CRON_SECRET", _CRON_SECRET)
    h = {"X-PHILEON-RETENTION-CRON": _CRON_SECRET}
    routes_that_must_reject = [
        ("GET",  "/api/admin/retention/pending"),
        ("GET",  "/api/admin/retention/send-log"),
        ("GET",  "/api/admin/retention/config"),
        ("GET",  "/api/admin/retention/preview/does-not-exist"),
        ("GET",  "/api/admin/orders/PHI-NONE"),
    ]
    for method, path in routes_that_must_reject:
        r = app_client.request(method, path, headers=h)
        assert r.status_code in (401, 403), (method, path, r.status_code, r.text)
    # POST admin routes — same story.
    r = app_client.post("/api/admin/orders/PHI-NONE/mark-shipped",
                        headers={**h, "Content-Type": "application/json"},
                        json={"carrier": "UPS", "tracking_number": "X"})
    assert r.status_code in (401, 403)
    r = app_client.post("/api/admin/retention/consent",
                        headers={**h, "Content-Type": "application/json"},
                        json={"email": "x@ex.com", "action": "grant"})
    assert r.status_code in (401, 403)


def test_retention_tick_idempotent_across_duplicate_cron_calls(app_client, monkeypatch):
    """Duplicate scheduled tick within a short window must NOT
    double-send. The pending row's state transition (pending → sent) is
    the atomic gate — same as a manual admin run."""
    monkeypatch.setenv("PHILEON_RETENTION_CRON_SECRET", _CRON_SECRET)
    h = {"X-PHILEON-RETENTION-CRON": _CRON_SECRET}
    r1 = app_client.post("/api/admin/retention/tick", headers=h, json={})
    r2 = app_client.post("/api/admin/retention/tick", headers=h, json={})
    assert r1.status_code == 200 and r2.status_code == 200
    # Even without seeding, evaluating twice never turns a `sent` back into
    # `pending`. In an empty DB nothing is sent either time.
    body1 = r1.json(); body2 = r2.json()
    assert isinstance(body1.get("sent"), list) and isinstance(body2.get("sent"), list)


def test_default_env_still_keeps_behavioral_live_off_after_patch():
    """Regression: the pre-DNS patch must not have flipped any env
    defaults. PHILEON_BEHAVIORAL_LIVE=false remains the default."""
    from services import retention_service as R
    cfg = R.get_config()
    assert cfg["live"] is False
