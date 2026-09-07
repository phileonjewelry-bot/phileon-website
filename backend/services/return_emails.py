"""PHILEON — Return / RMA customer email templates (Layer 3 completion).

Six templates, all rendered through the existing transactional email
infrastructure (`services.email.send_email`) from
`PHILEON_FROM_EMAIL` (concierge@getyourphileon.com).

Design rules:
  · Never claim a refund has been *issued* until Stripe confirms.
    That is the distinction between `render_refund_approved` (approval
    only) and `render_refund_issued` (only after `charge.refunded`).
  · Never surface Stripe internal IDs, admin identity, fraud notes,
    inspection notes, or Mongo IDs. Customer view is a strict subset
    of `_serialize_case_for_customer` fields plus the order snapshot.
  · Every send is idempotent at the caller: `send_*_email` refuses to
    resend if the corresponding `<name>_sent` flag is already true, and
    sets it after a successful dispatch.

All render helpers return `{subject, html, text}` and never raise.
Dispatch helpers `send_*` return a `{status, ...}` dict from
`services.email.send_email`.
"""
from __future__ import annotations
import os
from datetime import datetime
from typing import Any, Dict, Optional

from services.email import send_email


PHILEON_FROM_EMAIL = os.environ.get("PHILEON_FROM_EMAIL") or "concierge@getyourphileon.com"

_REFUND_TIMING_COPY = (
    "Refunds are processed within approximately 5 to 10 business days "
    "after inspection and approval. Your bank or card issuer may require "
    "additional time to post the credit."
)


def _fmt_money(cents: Optional[int], currency: Optional[str]) -> str:
    if not isinstance(cents, int) or cents <= 0:
        return ""
    code = (currency or "USD").upper()
    sym = {"USD": "$", "CAD": "C$", "GBP": "£", "EUR": "€",
            "AUD": "A$", "JPY": "¥"}.get(code, "$")
    is_jpy = code == "JPY"
    value = round(cents / 100) if is_jpy else cents / 100
    return f"{sym}{value:,.0f} {code}" if is_jpy else f"{sym}{value:,.2f} {code}"


def _items_lines_html(case: Dict[str, Any]) -> str:
    out = []
    for i in (case.get("items_snapshot") or []):
        name = str(i.get("product_name") or "")
        variant = str(i.get("variant") or "")
        size = str(i.get("ring_size") or "")
        qty = int(i.get("quantity") or 1)
        line = f"<div style=\"padding:8px 0;border-bottom:1px dotted #ddd;\">"
        line += f"<strong>{name}</strong>"
        if size:
            line += f" &middot; {size}"
        line += f"<br><em style=\"color:#555\">{variant}</em>"
        line += f" &middot; Qty {qty}</div>"
        out.append(line)
    return "".join(out) or "<em>—</em>"


def _items_lines_text(case: Dict[str, Any]) -> str:
    lines = []
    for i in (case.get("items_snapshot") or []):
        name = str(i.get("product_name") or "")
        variant = str(i.get("variant") or "")
        size = str(i.get("ring_size") or "")
        qty = int(i.get("quantity") or 1)
        piece = name
        if size:
            piece += f" · {size}"
        piece += f" — {variant} · Qty {qty}"
        lines.append(f"  {piece}")
    return "\n".join(lines) or "  —"


def _envelope(case: Dict[str, Any]) -> Dict[str, str]:
    """Common fields present in every template."""
    return {
        "rma": str(case.get("rma_number") or ""),
        "order": str(case.get("order_number") or ""),
        "customer": str(case.get("customer_name") or "").strip() or "there",
        "email": str(case.get("customer_email") or ""),
    }


def _shell(body_html: str) -> str:
    """PHILEON editorial email shell — dark, restrained, concierge tone."""
    return f"""\
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#08070a;
color:#e8e0cf;font-family:'Cormorant Garamond',Georgia,serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
         style="background:#08070a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0"
             style="max-width:600px;background:#0f0f14;border:1px solid #33322a;">
        <tr><td style="padding:36px 40px 12px;text-align:center;">
          <div style="font-family:'Cinzel',Georgia,serif;font-size:10.5px;
                       letter-spacing:.7em;color:#c8a24a;text-transform:uppercase;">
            PHILEON &nbsp;·&nbsp; CONCIERGE
          </div>
        </td></tr>
        <tr><td style="padding:6px 40px 32px;">
          {body_html}
        </td></tr>
        <tr><td style="padding:0 40px 32px;
                        border-top:1px solid rgba(200,162,74,.2);">
          <p style="margin:20px 0 4px;font-family:'Cormorant Garamond',Georgia,serif;
                     font-style:italic;color:rgba(232,224,207,.55);font-size:13px;">
            Questions? concierge@getyourphileon.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
"""


# ────────────────────────────────────────────────────────────────
# A. RETURN REQUEST RECEIVED
# ────────────────────────────────────────────────────────────────

def render_return_request_received(case: Dict[str, Any]) -> Dict[str, str]:
    env = _envelope(case)
    body = f"""
<h1 style="font-family:'Cinzel',Georgia,serif;letter-spacing:.18em;
           font-weight:400;color:#f4ecd6;font-size:22px;margin:0 0 12px;">
  RETURN REQUEST RECEIVED
</h1>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Dear {env['customer']},
</p>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Thank you for contacting the PHILEON concierge. We have received your
  return request and our team will respond within one business day.
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 6px;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">RMA</strong>
  &nbsp;{env['rma']}
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 18px;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">Order</strong>
  &nbsp;{env['order']}
</p>
<div style="background:#08070a;padding:14px 18px;border:1px solid rgba(200,162,74,.18);">
  {_items_lines_html(case)}
</div>
"""
    text = (f"RETURN REQUEST RECEIVED\n\n"
            f"Dear {env['customer']},\n\n"
            f"Thank you for contacting the PHILEON concierge. We have "
            f"received your return request and our team will respond "
            f"within one business day.\n\n"
            f"RMA:   {env['rma']}\nOrder: {env['order']}\n\n"
            f"Items:\n{_items_lines_text(case)}\n")
    return {"subject": f"PHILEON — Return request received ({env['rma']})",
            "html": _shell(body), "text": text}


# ────────────────────────────────────────────────────────────────
# B. RETURN AUTHORIZED
# ────────────────────────────────────────────────────────────────

def render_return_authorized(case: Dict[str, Any]) -> Dict[str, str]:
    env = _envelope(case)
    instructions = (case.get("return_instructions") or "").strip()
    inst_block = ""
    if instructions:
        inst_block = f"""
<h2 style="font-family:'Cinzel',Georgia,serif;letter-spacing:.18em;
           font-weight:400;color:#c8a24a;font-size:14px;margin:24px 0 10px;">
  RETURN INSTRUCTIONS
</h2>
<div style="background:#08070a;padding:14px 18px;border:1px solid rgba(200,162,74,.18);
             white-space:pre-wrap;color:#e8e0cf;font-size:14.5px;line-height:1.55;">
  {instructions}
</div>
"""
    body = f"""
<h1 style="font-family:'Cinzel',Georgia,serif;letter-spacing:.18em;
           font-weight:400;color:#f4ecd6;font-size:22px;margin:0 0 12px;">
  RETURN AUTHORIZED
</h1>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Dear {env['customer']},
</p>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Your return is authorized. Please include the RMA reference below
  in the package. Refund remains subject to inspection.
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 6px;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">RMA</strong>
  &nbsp;{env['rma']}
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 18px;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">Order</strong>
  &nbsp;{env['order']}
</p>
<div style="background:#08070a;padding:14px 18px;border:1px solid rgba(200,162,74,.18);">
  {_items_lines_html(case)}
</div>
{inst_block}
<p style="color:rgba(232,224,207,.55);font-size:13px;margin:22px 0 0;font-style:italic;">
  {_REFUND_TIMING_COPY}
</p>
"""
    text = (f"RETURN AUTHORIZED\n\nDear {env['customer']},\n\n"
            f"Your return is authorized. Please include the RMA reference "
            f"below in the package. Refund remains subject to inspection.\n\n"
            f"RMA:   {env['rma']}\nOrder: {env['order']}\n\n"
            f"Items:\n{_items_lines_text(case)}\n\n"
            + (f"Return Instructions:\n{instructions}\n\n" if instructions else "")
            + f"{_REFUND_TIMING_COPY}\n")
    return {"subject": f"PHILEON — Return authorized ({env['rma']})",
            "html": _shell(body), "text": text}


# ────────────────────────────────────────────────────────────────
# C. ITEM RECEIVED
# ────────────────────────────────────────────────────────────────

def render_return_received(case: Dict[str, Any]) -> Dict[str, str]:
    env = _envelope(case)
    body = f"""
<h1 style="font-family:'Cinzel',Georgia,serif;letter-spacing:.18em;
           font-weight:400;color:#f4ecd6;font-size:22px;margin:0 0 12px;">
  ITEM RECEIVED
</h1>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Dear {env['customer']},
</p>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Your return has arrived at PHILEON. Inspection will begin shortly.
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 6px;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">RMA</strong>
  &nbsp;{env['rma']}
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 0;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">Order</strong>
  &nbsp;{env['order']}
</p>
"""
    text = (f"ITEM RECEIVED\n\nDear {env['customer']},\n\n"
            f"Your return has arrived at PHILEON. Inspection will begin shortly.\n\n"
            f"RMA:   {env['rma']}\nOrder: {env['order']}\n")
    return {"subject": f"PHILEON — Return received ({env['rma']})",
            "html": _shell(body), "text": text}


# ────────────────────────────────────────────────────────────────
# D. REFUND APPROVED  (approval only — never claims money moved)
# ────────────────────────────────────────────────────────────────

def render_refund_approved(case: Dict[str, Any]) -> Dict[str, str]:
    env = _envelope(case)
    amount = _fmt_money(case.get("refund_amount_base_cents"),
                         case.get("refund_currency_base"))
    body = f"""
<h1 style="font-family:'Cinzel',Georgia,serif;letter-spacing:.18em;
           font-weight:400;color:#f4ecd6;font-size:22px;margin:0 0 12px;">
  REFUND APPROVED
</h1>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Dear {env['customer']},
</p>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Inspection is complete. Your refund has been approved and will be
  submitted to your original payment method shortly.
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 6px;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">RMA</strong>
  &nbsp;{env['rma']}
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 18px;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">Order</strong>
  &nbsp;{env['order']}
</p>
{f'<p style="color:#c8a24a;font-family:Cinzel,Georgia,serif;letter-spacing:.24em;font-size:14px;margin:0 0 18px;">Approved refund: {amount}</p>' if amount else ""}
<p style="color:rgba(232,224,207,.55);font-size:13px;margin:0;font-style:italic;">
  {_REFUND_TIMING_COPY}
</p>
"""
    text = (f"REFUND APPROVED\n\nDear {env['customer']},\n\n"
            f"Inspection is complete. Your refund has been approved and "
            f"will be submitted to your original payment method shortly.\n\n"
            f"RMA:   {env['rma']}\nOrder: {env['order']}\n"
            + (f"\nApproved refund: {amount}\n" if amount else "")
            + f"\n{_REFUND_TIMING_COPY}\n")
    return {"subject": f"PHILEON — Refund approved ({env['rma']})",
            "html": _shell(body), "text": text}


# ────────────────────────────────────────────────────────────────
# E. REFUND ISSUED  (only after Stripe charge.refunded confirmation)
# ────────────────────────────────────────────────────────────────

def render_refund_issued(case: Dict[str, Any]) -> Dict[str, str]:
    env = _envelope(case)
    amount = _fmt_money(case.get("refund_amount_base_cents"),
                         case.get("refund_currency_base"))
    body = f"""
<h1 style="font-family:'Cinzel',Georgia,serif;letter-spacing:.18em;
           font-weight:400;color:#f4ecd6;font-size:22px;margin:0 0 12px;">
  REFUND ISSUED
</h1>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Dear {env['customer']},
</p>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Your refund has been processed. Your bank or card issuer may require
  additional time to post the credit to your account.
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 6px;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">RMA</strong>
  &nbsp;{env['rma']}
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 18px;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">Order</strong>
  &nbsp;{env['order']}
</p>
{f'<p style="color:#c8a24a;font-family:Cinzel,Georgia,serif;letter-spacing:.24em;font-size:14px;margin:0 0 18px;">Refund: {amount}</p>' if amount else ""}
<p style="color:rgba(232,224,207,.55);font-size:13px;margin:0;font-style:italic;">
  Please allow 5 to 10 business days for the credit to post.
</p>
"""
    text = (f"REFUND ISSUED\n\nDear {env['customer']},\n\n"
            f"Your refund has been processed. Your bank or card issuer "
            f"may require additional time to post the credit to your "
            f"account.\n\n"
            f"RMA:   {env['rma']}\nOrder: {env['order']}\n"
            + (f"\nRefund: {amount}\n" if amount else "")
            + f"\nPlease allow 5 to 10 business days for the credit to post.\n")
    return {"subject": f"PHILEON — Refund issued ({env['rma']})",
            "html": _shell(body), "text": text}


# ────────────────────────────────────────────────────────────────
# F. RETURN NOT ELIGIBLE / DENIED
# ────────────────────────────────────────────────────────────────

def render_return_denied(case: Dict[str, Any],
                          public_reason: Optional[str] = None) -> Dict[str, str]:
    env = _envelope(case)
    reason_html = ""
    if public_reason:
        reason_html = f"""
<div style="background:#08070a;padding:14px 18px;border-left:2px solid #c8a24a;
             color:#e8e0cf;font-size:14.5px;line-height:1.55;margin:14px 0;
             font-style:italic;">
  {public_reason}
</div>
"""
    body = f"""
<h1 style="font-family:'Cinzel',Georgia,serif;letter-spacing:.18em;
           font-weight:400;color:#f4ecd6;font-size:22px;margin:0 0 12px;">
  RETURN NOT ELIGIBLE
</h1>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Dear {env['customer']},
</p>
<p style="color:#e8e0cf;font-size:16px;line-height:1.55;margin:0 0 18px;">
  Thank you for your patience. After review, this request is not eligible
  under our current return policy. Please write to
  <a href="mailto:concierge@getyourphileon.com" style="color:#c8a24a;">
  concierge@getyourphileon.com</a> if we can help further.
</p>
{reason_html}
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0 0 6px;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">RMA</strong>
  &nbsp;{env['rma']}
</p>
<p style="color:rgba(232,224,207,.7);font-size:13.5px;margin:0;">
  <strong style="color:#c8a24a;letter-spacing:.16em;">Order</strong>
  &nbsp;{env['order']}
</p>
"""
    text = (f"RETURN NOT ELIGIBLE\n\nDear {env['customer']},\n\n"
            f"Thank you for your patience. After review, this request is "
            f"not eligible under our current return policy. Please write "
            f"to concierge@getyourphileon.com if we can help further.\n"
            + (f"\n{public_reason}\n" if public_reason else "")
            + f"\nRMA:   {env['rma']}\nOrder: {env['order']}\n")
    return {"subject": f"PHILEON — Return not eligible ({env['rma']})",
            "html": _shell(body), "text": text}


# ────────────────────────────────────────────────────────────────
# DISPATCH HELPERS — one call per notification stage
# ────────────────────────────────────────────────────────────────

_NOTIFICATION_FLAGS = {
    "request_received":   "return_request_notification_sent",
    "authorized":         "return_authorized_notification_sent",
    "received":           "return_received_notification_sent",
    "refund_approved":    "refund_approved_notification_sent",
    "refund_issued":      "refund_issued_notification_sent",
    "denied":             "return_denied_notification_sent",
}

_RENDERERS = {
    "request_received":  render_return_request_received,
    "authorized":        render_return_authorized,
    "received":          render_return_received,
    "refund_approved":   render_refund_approved,
    "refund_issued":     render_refund_issued,
    "denied":            render_return_denied,
}


async def dispatch_return_email(db, case: Dict[str, Any], stage: str) -> Dict[str, Any]:
    """Idempotently render + dispatch one RMA customer email.

    Contract:
      · Refuses to resend if the corresponding `<stage>_notification_sent`
        flag is already true on the case (returns `{status: 'skipped', reason: 'already_sent'}`).
      · Sets the flag AFTER a successful dispatch. If Resend/SMTP fails,
        the flag is left false so a future retry can complete without
        double-sending.
      · Never mutates RMA/refund state. Emails are notifications, not
        the source of truth.
      · Never raises.
    """
    if stage not in _RENDERERS:
        return {"status": "error", "reason": "invalid_stage"}
    flag = _NOTIFICATION_FLAGS[stage]
    if case.get(flag) is True:
        return {"status": "skipped", "reason": "already_sent", "stage": stage}
    to = str(case.get("customer_email") or "").strip()
    if not to:
        return {"status": "skipped", "reason": "no_recipient", "stage": stage}
    try:
        rendered = _RENDERERS[stage](case)
    except Exception:
        return {"status": "error", "reason": "render_failed", "stage": stage}
    try:
        result = await send_email(
            to=to,
            subject=rendered["subject"],
            html=rendered["html"],
            text=rendered.get("text"),
            from_email=PHILEON_FROM_EMAIL,
        )
    except Exception:
        return {"status": "error", "reason": "send_exception", "stage": stage}
    ok = isinstance(result, dict) and result.get("status") in ("sent", "simulated")
    if ok:
        try:
            await db.returns.update_one(
                {"rma_number": case.get("rma_number")},
                {"$set": {flag: True,
                          f"{flag}_at": datetime.utcnow()}},
            )
        except Exception:
            pass
    return {"status": (result or {}).get("status", "unknown"),
            "stage": stage, "email_result": result}
