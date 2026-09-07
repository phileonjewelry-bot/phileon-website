"""PHILEON — Return email templates + dispatch idempotency (Layer 3 completion)."""
from __future__ import annotations
import asyncio
from types import SimpleNamespace


def _run(coro):
    return asyncio.run(coro)


_CASE = {
    "rma_number": "RMA-2026-ABCDEF",
    "order_number": "PHI-TEST-RTN-1",
    "customer_email": "buyer@example.com",
    "customer_name": "Ann",
    "refund_amount_base_cents": 350000,
    "refund_currency_base": "USD",
    "return_instructions": "Please pack in original box and include the RMA number.",
    "items_snapshot": [{
        "product_name": "LA MARVA",
        "variant": "14K Yellow Gold",
        "ring_size": "US 7",
        "quantity": 1,
    }],
}


# ---- rendering ---------------------------------------------------

def test_all_six_templates_render_and_contain_customer_and_rma():
    from services import return_emails as m
    fns = [
        m.render_return_request_received,
        m.render_return_authorized,
        m.render_return_received,
        m.render_refund_approved,
        m.render_refund_issued,
        m.render_return_denied,
    ]
    for fn in fns:
        r = fn(_CASE) if fn is not m.render_return_denied else fn(_CASE, public_reason="Outside 30-day window.")
        assert set(r.keys()) == {"subject", "html", "text"}
        assert _CASE["rma_number"] in r["subject"]
        assert _CASE["rma_number"] in r["html"]
        assert _CASE["order_number"] in r["html"]
        assert "PHILEON" in r["subject"]


def test_no_internal_leaks_in_any_template():
    from services import return_emails as m
    fns = [
        m.render_return_request_received,
        m.render_return_authorized,
        m.render_return_received,
        m.render_refund_approved,
        m.render_refund_issued,
        lambda c: m.render_return_denied(c, "Outside 30-day window."),
    ]
    banned = ("stripe_refund_id", "status_token_hash", "email_status_token",
               "webhook_event_ids", "provider_session_id",
               "provider_payment_intent_id", "presentment.fx",
               "shipping_integrity_status", "fraud", "inspection_notes",
               "admin", "mongodb", "ObjectId")
    for fn in fns:
        r = fn(_CASE)
        blob = (r["subject"] + " " + r["html"] + " " + r["text"]).lower()
        for b in banned:
            assert b.lower() not in blob, f"leak of {b} in template"


def test_refund_approved_never_claims_money_issued():
    from services.return_emails import render_refund_approved
    r = render_refund_approved(_CASE)
    lower = (r["subject"] + " " + r["html"] + " " + r["text"]).lower()
    # Approval copy — MUST NOT say "issued", "processed" (past tense of
    # money-movement), or "credited".
    assert "issued" not in lower
    assert "your refund has been processed" not in lower
    assert "credited" not in lower
    # Correct approval-only language present
    assert "approved" in lower
    assert "will be submitted" in lower


def test_refund_issued_uses_correct_timing_copy():
    from services.return_emails import render_refund_issued
    r = render_refund_issued(_CASE)
    lower = (r["subject"] + " " + r["html"] + " " + r["text"]).lower()
    assert "processed" in lower or "issued" in lower
    assert "5 to 10" in lower or "5-10" in lower


def test_denied_email_can_carry_public_reason_but_no_admin_notes():
    from services.return_emails import render_return_denied
    r = render_return_denied(_CASE, public_reason="Outside 30-day window.")
    assert "Outside 30-day window." in r["html"]
    # Admin identity / internal fields never surface even if `note` field
    # from an admin was carelessly forwarded (this test locks the design).
    assert "admin" not in r["html"].lower()
    assert "actor" not in r["html"].lower()


def test_authorized_email_includes_return_instructions_when_present():
    from services.return_emails import render_return_authorized
    r = render_return_authorized(_CASE)
    assert "original box" in r["html"]
    assert "5 to 10 business days" in r["text"]


def test_authorized_email_omits_instructions_block_when_absent():
    from services.return_emails import render_return_authorized
    case = dict(_CASE); case.pop("return_instructions", None)
    r = render_return_authorized(case)
    assert "RETURN INSTRUCTIONS" not in r["html"]


# ---- dispatch idempotency ---------------------------------------

class _RetColl:
    def __init__(self, docs=None):
        self.docs = list(docs or [])
        self.updates = []
    async def find_one(self, filt, projection=None):
        for d in self.docs:
            if all(d.get(k) == v for k, v in filt.items()):
                return dict(d)
        return None
    async def update_one(self, filt, update):
        self.updates.append((filt, update))
        for i, d in enumerate(self.docs):
            if all(d.get(k) == v for k, v in filt.items()):
                for k, v in (update.get("$set") or {}).items():
                    d[k] = v
                self.docs[i] = d
                class R: matched_count = 1
                return R()
        class R: matched_count = 0
        return R()


def test_dispatch_idempotent_second_call_is_skipped(monkeypatch):
    from services import return_emails as m
    coll = _RetColl(docs=[dict(_CASE)])
    fake_db = SimpleNamespace(returns=coll)
    calls = []
    async def _fake_send(**kw):
        calls.append(kw); return {"status": "sent"}
    monkeypatch.setattr(m, "send_email", _fake_send)
    r1 = _run(m.dispatch_return_email(fake_db, coll.docs[0], "request_received"))
    assert r1["status"] == "sent"
    # After successful dispatch, the flag is set in the case doc via
    # update_one — refresh manually to simulate persistence.
    coll.docs[0]["return_request_notification_sent"] = True
    r2 = _run(m.dispatch_return_email(fake_db, coll.docs[0], "request_received"))
    assert r2["status"] == "skipped"
    assert r2["reason"] == "already_sent"
    assert len(calls) == 1  # send_email called exactly once


def test_dispatch_send_failure_leaves_flag_unset(monkeypatch):
    from services import return_emails as m
    coll = _RetColl(docs=[dict(_CASE)])
    fake_db = SimpleNamespace(returns=coll)
    async def _fake_send(**kw):
        return {"status": "failed", "error": "resend_down"}
    monkeypatch.setattr(m, "send_email", _fake_send)
    r = _run(m.dispatch_return_email(fake_db, coll.docs[0], "refund_issued"))
    assert r["status"] == "failed"
    # No idempotency flag persisted → retryable next time.
    assert not any(
        "refund_issued_notification_sent" in (u[1].get("$set") or {})
        for u in coll.updates
    )


def test_dispatch_invalid_stage_returns_error():
    from services.return_emails import dispatch_return_email
    fake_db = SimpleNamespace(returns=_RetColl())
    r = _run(dispatch_return_email(fake_db, dict(_CASE), "bogus"))
    assert r["status"] == "error"
    assert r["reason"] == "invalid_stage"


def test_dispatch_no_recipient_skips():
    from services.return_emails import dispatch_return_email
    fake_db = SimpleNamespace(returns=_RetColl())
    case = dict(_CASE); case["customer_email"] = ""
    r = _run(dispatch_return_email(fake_db, case, "authorized"))
    assert r["status"] == "skipped"
    assert r["reason"] == "no_recipient"
