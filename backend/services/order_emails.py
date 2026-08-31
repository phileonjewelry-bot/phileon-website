"""PHILEON — paid-order transactional email.

Sent exactly once on the first server-verified transition to `paid` for an
`orders_v2` document. Never sent from the success-page redirect, from
session creation, or from a pending/authorized state.

Idempotency is provided by the caller: the webhook handler performs an
atomic conditional update on `orders_v2` that flips `paid_notification_sent`
from unset/False → True in the same operation that flips `payment_status`
to `paid`. Only the caller whose write modifies the document then invokes
this helper. Replay of the same Stripe event is already blocked upstream
by the unique index on `webhook_events(provider, event_id)`.

The email body deliberately excludes payment/card data, Stripe identifiers,
internal pricing detail, and any metadata not needed for the customer.
"""
from __future__ import annotations

import logging
import os
from typing import Dict, List, Optional

from services.email import send_email

logger = logging.getLogger(__name__)


def _fmt_money(cents: int, currency: str) -> str:
    code = (currency or "USD").upper()
    return f"${(int(cents) / 100):,.2f} {code}"


def _shipping_line(currency: str) -> str:
    """Shipping wording aligned with published policy (Feb 2026):
    Canada: free standard shipping via Canada Post + UPS.
    US / International: shipping calculated at checkout via UPS / FedEx /
    DHL. International duties, taxes and brokerage remain the customer's
    responsibility.
    """
    if (currency or "").upper() == "CAD":
        return (
            "Standard shipping to Canada is included (Canada Post or UPS). "
            "Approximately 2–7 business days after fulfillment."
        )
    return "Shipping will be calculated at checkout by UPS, FedEx or DHL. International duties, taxes and brokerage remain the customer's responsibility."


def _items_html(items: List[Dict]) -> str:
    rows = []
    for i in items or []:
        name = i.get("product_name") or "PHILEON piece"
        variant = i.get("variant") or ""
        qty = int(i.get("quantity") or 1)
        line_cents = int(i.get("unit_amount_cents") or 0) * qty
        rows.append(
            f"<tr>"
            f"<td style='padding:12px 0;border-bottom:1px dotted #33322a;font-family:Georgia,serif;color:#f4ecd6;'>"
            f"<div style='font-size:15px'>{name}</div>"
            f"<div style='font-size:13px;color:#a89f89;font-style:italic'>{variant}</div>"
            f"<div style='font-size:12px;color:#7d7565'>Qty {qty}</div>"
            f"</td>"
            f"<td style='padding:12px 0;border-bottom:1px dotted #33322a;text-align:right;"
            f"font-family:Georgia,serif;color:#e8e0cf;font-size:14px;white-space:nowrap;'>"
            f"{_fmt_money(line_cents, i.get('currency') or '')}"
            f"</td>"
            f"</tr>"
        )
    return "".join(rows)


def _items_text(items: List[Dict]) -> str:
    lines = []
    for i in items or []:
        name = i.get("product_name") or "PHILEON piece"
        variant = i.get("variant") or ""
        qty = int(i.get("quantity") or 1)
        line_cents = int(i.get("unit_amount_cents") or 0) * qty
        lines.append(f"  · {name} — {variant} × {qty}   {_fmt_money(line_cents, i.get('currency') or '')}")
    return "\n".join(lines)


def build_customer_paid_email(order: Dict) -> Dict[str, str]:
    """Return {subject, html, text} for the customer's paid-order email.

    Uses only:  order_number, items[{product_name, variant, quantity,
    unit_amount_cents}], total_cents, currency.
    """
    order_no = order.get("order_number") or ""
    currency = order.get("currency") or "USD"
    total = _fmt_money(order.get("total_cents") or 0, currency)
    subject = f"PHILEON — Order {order_no} Confirmed"
    shipping_line = _shipping_line(currency)
    html = (
        f"<div style='background:#0a0a0c;color:#e8e0cf;font-family:Georgia,serif;padding:48px 24px;'>"
        f"  <div style='max-width:560px;margin:0 auto;'>"
        f"    <p style='font-family:\"Cinzel\",serif;letter-spacing:.5em;font-size:11px;color:#c8a24a;margin:0 0 24px;'>PHILEON</p>"
        f"    <h1 style='font-family:\"Cinzel\",serif;letter-spacing:.14em;font-size:26px;color:#f4ecd6;margin:0 0 12px;'>ORDER CONFIRMED.</h1>"
        f"    <p style='font-family:\"Playfair Display\",Georgia,serif;font-style:italic;color:#a89f89;margin:0 0 32px;'>Your PHILEON piece is now in motion.</p>"
        f"    <p style='font-size:14px;color:#e8e0cf;margin:0 0 8px;'>Order reference: <strong>{order_no}</strong></p>"
        f"    <table style='width:100%;border-collapse:collapse;margin-top:24px;'>{_items_html(order.get('items') or [])}</table>"
        f"    <div style='display:flex;justify-content:space-between;padding-top:16px;border-top:1px solid #33322a;margin-top:8px;'>"
        f"      <span style='font-family:\"Cinzel\",serif;letter-spacing:.4em;font-size:11px;color:#a89f89'>TOTAL</span>"
        f"      <span style='font-family:\"Cinzel\",serif;letter-spacing:.2em;font-size:14px;color:#c8a24a'>{total}</span>"
        f"    </div>"
        f"    <p style='font-size:13px;color:#a89f89;line-height:1.65;margin-top:32px;'>{shipping_line}</p>"
        f"    <p style='font-size:13px;color:#a89f89;line-height:1.65;'>Every PHILEON piece is prepared with intention. You will receive fulfillment updates as your order moves through production and dispatch.</p>"
        f"  </div>"
        f"</div>"
    )
    text = (
        f"PHILEON — Order Confirmed.\n\n"
        f"Order reference: {order_no}\n\n"
        f"{_items_text(order.get('items') or [])}\n\n"
        f"Total: {total}\n\n"
        f"{shipping_line}\n\n"
        f"Every PHILEON piece is prepared with intention. You will receive fulfillment updates as your order moves through production and dispatch."
    )
    return {"subject": subject, "html": html, "text": text}


def build_internal_paid_notification(order: Dict) -> Dict[str, str]:
    order_no = order.get("order_number") or ""
    currency = order.get("currency") or "USD"
    total = _fmt_money(order.get("total_cents") or 0, currency)
    items_text = _items_text(order.get("items") or [])
    subject = f"[PHILEON] Paid order — {order_no}"
    html = (
        f"<div style='font-family:Georgia,serif;'>"
        f"<p><strong>Order:</strong> {order_no}</p>"
        f"<p><strong>Total:</strong> {total}</p>"
        f"<pre style='font-family:ui-monospace,monospace;white-space:pre-wrap'>{items_text}</pre>"
        f"</div>"
    )
    text = f"Order: {order_no}\nTotal: {total}\n\n{items_text}\n"
    return {"subject": subject, "html": html, "text": text}


async def send_paid_order_emails(order: Dict) -> Dict[str, Optional[Dict]]:
    """Send the customer paid-order email and (if configured) an internal
    notification. Returns a small status dict for optional persistence.
    Never raises — email is a notification, not the source of truth.
    """
    result: Dict[str, Optional[Dict]] = {"customer": None, "internal": None}
    to = (order.get("customer_email") or "").strip()
    if to:
        payload = build_customer_paid_email(order)
        result["customer"] = await send_email(to, payload["subject"], payload["html"], payload["text"])
    internal_to = (os.environ.get("PHILEON_ORDER_NOTIFICATION_EMAIL")
                   or os.environ.get("PHILEON_CONCIERGE_NOTIFICATION_EMAIL") or "").strip()
    if internal_to:
        payload = build_internal_paid_notification(order)
        result["internal"] = await send_email(internal_to, payload["subject"], payload["html"], payload["text"])
    return result
