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

Currency rule
-------------
Every rendered money amount — the total AND every line-item — MUST use the
trusted order-level currency (``orders_v2.currency``), NEVER the per-item
``currency`` field, which is not persisted on all order documents. This
preserves mixed CAD/USD catalog support (each order stays single-currency)
while eliminating the "line item shows USD, total shows CAD" divergence.
"""
from __future__ import annotations

import logging
import os
from typing import Dict, List, Optional

from services.email import send_email

logger = logging.getLogger(__name__)


def _order_status_link(order: Dict) -> Optional[str]:
    """Return the secure customer Order Status deep-link for ``order`` or
    ``None`` when the token has not been persisted (historical orders).

    Trust rules:
      * Uses the plaintext ``email_status_token`` persisted on the order
        at session-create — the *same* secret already shared with the
        customer's browser/session. No new secret is minted at email
        time.
      * Never embeds order internals (Stripe IDs, DB IDs, webhook / FX
        metadata). Only order_number + token.
      * Base URL comes from env (``PHILEON_ORDER_STATUS_URL_BASE`` →
        ``FRONTEND_URL`` → ``CHECKOUT_SUCCESS_URL`` origin fallback).
    """
    order_no = (order.get("order_number") or "").strip()
    token = (order.get("email_status_token") or "").strip()
    if not order_no or not token:
        return None
    base = (os.environ.get("PHILEON_ORDER_STATUS_URL_BASE")
            or os.environ.get("FRONTEND_URL") or "").strip()
    if not base:
        # Fall back to the origin of CHECKOUT_SUCCESS_URL — same origin the
        # customer just visited on the Stripe redirect.
        success = (os.environ.get("CHECKOUT_SUCCESS_URL") or "").strip()
        if success.startswith("http://") or success.startswith("https://"):
            try:
                from urllib.parse import urlparse
                p = urlparse(success)
                base = f"{p.scheme}://{p.netloc}"
            except Exception:
                base = ""
    if not (base.startswith("http://") or base.startswith("https://")):
        return None
    base = base.rstrip("/")
    from urllib.parse import quote
    return f"{base}/orders/{quote(order_no)}/status?token={quote(token)}"


def _fmt_money(cents: int, currency: str) -> str:
    code = (currency or "USD").upper()
    if code == "JPY":
        # JPY has no minor units — cents are already yen×100 in our schema.
        return f"¥{int(int(cents) / 100):,} {code}"
    symbol = {
        "USD": "$",
        "CAD": "C$",
        "GBP": "£",
        "EUR": "€",
        "AUD": "A$",
    }.get(code, "$")
    return f"{symbol}{(int(cents) / 100):,.2f} {code}"


def _resolve_paid_display(order: Dict) -> Dict[str, object]:
    """Return the authoritative pair (currency, total_cents) to render on
    the customer paid email.

    Priority:
      1. Stripe Adaptive Pricing presentment (Stripe truth — never the
         storefront's display FX rate) when available.
      2. Canonical order currency + total (USD for every new order).
    """
    presentment = order.get("presentment") or {}
    if isinstance(presentment, dict):
        cur = (presentment.get("presentment_currency")
               or presentment.get("stripe_presentment_currency"))
        amt = (presentment.get("presentment_total_cents")
               or presentment.get("stripe_presentment_amount_cents"))
        if cur and amt is not None:
            return {"currency": str(cur).upper(), "total_cents": int(amt),
                    "is_presentment": True}
    return {"currency": (order.get("currency") or "USD").upper(),
            "total_cents": int(order.get("total_cents") or 0),
            "is_presentment": False}



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


def _items_html(items: List[Dict], order_currency: str) -> str:
    rows = []
    for i in items or []:
        name = i.get("product_name") or "PHILEON piece"
        variant = i.get("variant") or ""
        qty = int(i.get("quantity") or 1)
        line_cents = int(i.get("unit_amount_cents") or 0) * qty
        rows.append(
            f"<tr>"
            f"<td class='phi-li-meta' style='padding:12px 0;border-bottom:1px dotted #33322a;font-family:Georgia,serif;color:#f4ecd6;'>"
            f"<div style='font-size:15px'>{name}</div>"
            f"<div class='phi-li-variant' style='font-size:13px;color:#a89f89;font-style:italic'>{variant}</div>"
            f"<div style='font-size:12px;color:#7d7565'>Qty {qty}</div>"
            f"</td>"
            f"<td class='phi-li-price' style='padding:12px 0;border-bottom:1px dotted #33322a;text-align:right;"
            f"font-family:Georgia,serif;color:#e8e0cf;font-size:14px;white-space:nowrap;'>"
            f"{_fmt_money(line_cents, order_currency)}"
            f"</td>"
            f"</tr>"
        )
    return "".join(rows)


def _items_text(items: List[Dict], order_currency: str) -> str:
    lines = []
    for i in items or []:
        name = i.get("product_name") or "PHILEON piece"
        variant = i.get("variant") or ""
        qty = int(i.get("quantity") or 1)
        line_cents = int(i.get("unit_amount_cents") or 0) * qty
        lines.append(f"  · {name} — {variant} × {qty}   {_fmt_money(line_cents, order_currency)}")
    return "\n".join(lines)


# Mobile-safe editorial masthead: two intentional stacked spans so nothing
# ever mid-word-breaks in a narrow email column. Font-size scaled down
# slightly from 26px → 22px so ORDER / CONFIRMED. fit inside 320-CSS-px
# viewports even with tracking .14em, and a <style>@media block gives Gmail
# mobile an extra step down for very small screens.
_CUSTOMER_HEAD_STYLE = (
    "<style>"
    "@media (max-width: 480px){"
    " .phi-h1{font-size:20px !important;letter-spacing:.10em !important;}"
    " .phi-total-value{font-size:13px !important;letter-spacing:.16em !important;}"
    " .phi-li-meta{display:block !important;width:100% !important;"
    "  padding:12px 0 2px !important;border-bottom:0 !important;}"
    " .phi-li-price{display:block !important;width:100% !important;"
    "  text-align:left !important;padding:0 0 14px !important;"
    "  border-bottom:1px dotted #33322a !important;}"
    " .phi-li-variant{white-space:nowrap !important;}"
    "}"
    "</style>"
)


def build_customer_paid_email(order: Dict) -> Dict[str, str]:
    """Return {subject, html, text} for the customer's paid-order email.

    Uses only:  order_number, items[{product_name, variant, quantity,
    unit_amount_cents}], total_cents, currency (order-level).

    When Stripe Adaptive Pricing charged the customer in a non-USD local
    currency, the prominent TOTAL renders Stripe's authoritative
    presentment amount (never the storefront's display FX approximation).
    Line items continue to render in the canonical order currency (USD).
    """
    order_no = order.get("order_number") or ""
    canonical_currency = order.get("currency") or "USD"
    paid = _resolve_paid_display(order)
    total = _fmt_money(paid["total_cents"], paid["currency"])
    subject = f"PHILEON — Order {order_no} Confirmed"
    shipping_line = _shipping_line(canonical_currency)
    canonical_reference = ""
    if paid["is_presentment"]:
        canonical_reference = (
            f"<p style='font-size:11px;color:#7d7565;line-height:1.5;margin-top:8px;text-align:right;'>"
            f"Canonical reference: {_fmt_money(order.get('total_cents') or 0, canonical_currency)}"
            f"</p>"
        )
    status_link = _order_status_link(order)
    status_cta_html = ""
    status_cta_text = ""
    if status_link:
        status_cta_html = (
            f"<div style='margin-top:36px;text-align:center;'>"
            f"<a href='{status_link}' style='"
            f"display:inline-block;padding:14px 34px;"
            f"font-family:\"Cinzel\",serif;letter-spacing:.4em;font-size:11px;"
            f"color:#08070a;background:#c8a24a;text-decoration:none;'>"
            f"VIEW ORDER STATUS"
            f"</a>"
            f"</div>"
        )
        status_cta_text = f"\nView your order status: {status_link}\n"
    html = (
        f"{_CUSTOMER_HEAD_STYLE}"
        f"<div style='background:#0a0a0c;color:#e8e0cf;font-family:Georgia,serif;padding:48px 24px;'>"
        f"  <div style='max-width:560px;margin:0 auto;'>"
        f"    <p style='font-family:\"Cinzel\",serif;letter-spacing:.5em;font-size:11px;color:#c8a24a;margin:0 0 24px;'>PHILEON</p>"
        f"    <h1 class='phi-h1' style='font-family:\"Cinzel\",serif;letter-spacing:.14em;font-size:22px;line-height:1.15;color:#f4ecd6;margin:0 0 12px;word-break:keep-all;overflow-wrap:normal;'>"
        f"      <span style='display:block'>ORDER</span>"
        f"      <span style='display:block'>CONFIRMED.</span>"
        f"    </h1>"
        f"    <p style='font-family:\"Playfair Display\",Georgia,serif;font-style:italic;color:#a89f89;margin:0 0 32px;'>Your PHILEON piece is now in motion.</p>"
        f"    <p style='font-size:14px;color:#e8e0cf;margin:0 0 8px;'>Order reference: <strong>{order_no}</strong></p>"
        f"    <table style='width:100%;border-collapse:collapse;margin-top:24px;'>{_items_html(order.get('items') or [], canonical_currency)}</table>"
        f"    <div style='display:flex;justify-content:space-between;padding-top:16px;border-top:1px solid #33322a;margin-top:8px;'>"
        f"      <span style='font-family:\"Cinzel\",serif;letter-spacing:.4em;font-size:11px;color:#a89f89'>TOTAL PAID</span>"
        f"      <span class='phi-total-value' style='font-family:\"Cinzel\",serif;letter-spacing:.2em;font-size:14px;color:#c8a24a'>{total}</span>"
        f"    </div>"
        f"    {canonical_reference}"
        f"    {status_cta_html}"
        f"    <p style='font-size:13px;color:#a89f89;line-height:1.65;margin-top:32px;'>{shipping_line}</p>"
        f"    <p style='font-size:13px;color:#a89f89;line-height:1.65;'>Every PHILEON piece is prepared with intention. You will receive fulfillment updates as your order moves through production and dispatch.</p>"
        f"  </div>"
        f"</div>"
    )
    text_canonical = ""
    if paid["is_presentment"]:
        text_canonical = f"Canonical reference: {_fmt_money(order.get('total_cents') or 0, canonical_currency)}\n\n"
    text = (
        f"PHILEON — Order Confirmed.\n\n"
        f"Order reference: {order_no}\n\n"
        f"{_items_text(order.get('items') or [], canonical_currency)}\n\n"
        f"Total paid: {total}\n"
        f"{text_canonical}"
        f"{status_cta_text}"
        f"{shipping_line}\n\n"
        f"Every PHILEON piece is prepared with intention. You will receive fulfillment updates as your order moves through production and dispatch."
    )
    return {"subject": subject, "html": html, "text": text}


def build_internal_paid_notification(order: Dict) -> Dict[str, str]:
    order_no = order.get("order_number") or ""
    canonical_currency = order.get("currency") or "USD"
    canonical_total = _fmt_money(order.get("total_cents") or 0, canonical_currency)
    paid = _resolve_paid_display(order)
    items_text = _items_text(order.get("items") or [], canonical_currency)
    presentment_line_html = ""
    presentment_line_text = ""
    if paid["is_presentment"]:
        customer_paid = _fmt_money(paid["total_cents"], paid["currency"])
        presentment_line_html = f"<p><strong>Customer paid:</strong> {customer_paid}</p>"
        presentment_line_text = f"Customer paid: {customer_paid}\n"
    shipping = order.get("shipping") or {}
    zone_key = shipping.get("zone_key") or "(unresolved)"
    country = shipping.get("country") or "(unknown)"
    subject = f"[PHILEON] Paid order — {order_no}"
    html = (
        f"<div style='font-family:Georgia,serif;'>"
        f"<p><strong>Order:</strong> {order_no}</p>"
        f"{presentment_line_html}"
        f"<p><strong>Canonical PHILEON order:</strong> {canonical_total}</p>"
        f"<p><strong>Ship-to:</strong> {country} · zone {zone_key}</p>"
        f"<pre style='font-family:ui-monospace,monospace;white-space:pre-wrap'>{items_text}</pre>"
        f"</div>"
    )
    text = (
        f"Order: {order_no}\n"
        f"{presentment_line_text}"
        f"Canonical PHILEON order: {canonical_total}\n"
        f"Ship-to: {country} · zone {zone_key}\n\n{items_text}\n"
    )
    return {"subject": subject, "html": html, "text": text}


def build_internal_integrity_review_notification(order: Dict) -> Dict[str, str]:
    """Internal-only alert for a Stripe-paid order that failed the shipping
    trust boundary. Payment is real; fulfillment must NOT proceed until a
    human reviews the mismatch.
    """
    order_no = order.get("order_number") or ""
    currency = order.get("currency") or "USD"
    total = _fmt_money(order.get("total_cents") or 0, currency)
    stripe_shipping = _fmt_money(order.get("shipping_cents") or 0, currency)
    shipping_meta = order.get("shipping") or {}
    zone_key = shipping_meta.get("zone_key") or "(unresolved)"
    country = shipping_meta.get("country") or "(unknown)"
    service_label = shipping_meta.get("service_label") or "(unknown)"
    items_text = _items_text(order.get("items") or [], currency)
    subject = f"[PHILEON · REVIEW] Shipping-integrity hold — {order_no}"
    html = (
        f"<div style='font-family:Georgia,serif;background:#fff8ec;padding:24px;border:1px solid #c8a24a;'>"
        f"<p style='color:#8a5a00;font-weight:bold;'>SHIPPING-INTEGRITY HOLD — DO NOT SHIP.</p>"
        f"<p>Stripe payment succeeded for <strong>{order_no}</strong>, but the shipping "
        f"amount Stripe collected did not match the trusted PHILEON zone rate. "
        f"Fulfillment is paused pending review.</p>"
        f"<p><strong>Order:</strong> {order_no}<br>"
        f"<strong>Total charged:</strong> {total}<br>"
        f"<strong>Stripe-collected shipping:</strong> {stripe_shipping}<br>"
        f"<strong>Resolved zone / country / service:</strong> {zone_key} / {country} / {service_label}</p>"
        f"<pre style='font-family:ui-monospace,monospace;white-space:pre-wrap'>{items_text}</pre>"
        f"<p>Payment is real. Review the shipping selection in Stripe and reconcile before "
        f"releasing fulfillment.</p>"
        f"</div>"
    )
    text = (
        f"PHILEON — SHIPPING-INTEGRITY HOLD — DO NOT SHIP.\n\n"
        f"Stripe payment succeeded for {order_no}, but the shipping amount Stripe "
        f"collected did not match the trusted PHILEON zone rate. Fulfillment is "
        f"paused pending review.\n\n"
        f"Order: {order_no}\n"
        f"Total charged: {total}\n"
        f"Stripe-collected shipping: {stripe_shipping}\n"
        f"Resolved zone / country / service: {zone_key} / {country} / {service_label}\n\n"
        f"{items_text}\n\n"
        f"Payment is real. Review the shipping selection in Stripe and reconcile "
        f"before releasing fulfillment."
    )
    return {"subject": subject, "html": html, "text": text}


def build_customer_payment_received_email(order: Dict) -> Dict[str, str]:
    """PHILEON customer email for a paid order placed under a shipping-details
    review hold. It confirms payment WITHOUT claiming fulfillment is
    proceeding, and never exposes internal integrity terminology.
    """
    order_no = order.get("order_number") or ""
    currency = order.get("currency") or "USD"
    total = _fmt_money(order.get("total_cents") or 0, currency)
    subject = f"PHILEON — Payment Received · Order {order_no} Review"
    html = (
        f"{_CUSTOMER_HEAD_STYLE}"
        f"<div style='background:#0a0a0c;color:#e8e0cf;font-family:Georgia,serif;padding:48px 24px;'>"
        f"  <div style='max-width:560px;margin:0 auto;'>"
        f"    <p style='font-family:\"Cinzel\",serif;letter-spacing:.5em;font-size:11px;color:#c8a24a;margin:0 0 24px;'>PHILEON</p>"
        f"    <h1 class='phi-h1' style='font-family:\"Cinzel\",serif;letter-spacing:.14em;font-size:22px;line-height:1.15;color:#f4ecd6;margin:0 0 12px;word-break:keep-all;overflow-wrap:normal;'>"
        f"      <span style='display:block'>PAYMENT</span>"
        f"      <span style='display:block'>RECEIVED.</span>"
        f"    </h1>"
        f"    <p style='font-family:\"Playfair Display\",Georgia,serif;font-style:italic;color:#a89f89;margin:0 0 32px;'>Your PHILEON piece is with our atelier team.</p>"
        f"    <p style='font-size:14px;color:#e8e0cf;margin:0 0 8px;'>Order reference: <strong>{order_no}</strong></p>"
        f"    <table style='width:100%;border-collapse:collapse;margin-top:24px;'>{_items_html(order.get('items') or [], currency)}</table>"
        f"    <div style='display:flex;justify-content:space-between;padding-top:16px;border-top:1px solid #33322a;margin-top:8px;'>"
        f"      <span style='font-family:\"Cinzel\",serif;letter-spacing:.4em;font-size:11px;color:#a89f89'>TOTAL</span>"
        f"      <span class='phi-total-value' style='font-family:\"Cinzel\",serif;letter-spacing:.2em;font-size:14px;color:#c8a24a'>{total}</span>"
        f"    </div>"
        f"    <p style='font-size:13px;color:#a89f89;line-height:1.65;margin-top:32px;'>"
        f"      Your payment was successfully received. Your order has been placed "
        f"under a brief shipping-details review by our concierge team. No "
        f"additional payment is being requested. Fulfillment will proceed "
        f"automatically once the review is cleared — we will contact you only "
        f"if anything is required."
        f"    </p>"
        f"    <p style='font-size:13px;color:#a89f89;line-height:1.65;'>Thank you for your patience — every PHILEON piece is prepared with intention.</p>"
        f"  </div>"
        f"</div>"
    )
    text = (
        f"PHILEON — Payment Received.\n\n"
        f"Order reference: {order_no}\n\n"
        f"{_items_text(order.get('items') or [], currency)}\n\n"
        f"Total: {total}\n\n"
        f"Your payment was successfully received. Your order has been placed "
        f"under a brief shipping-details review by our concierge team. No "
        f"additional payment is being requested. Fulfillment will proceed "
        f"automatically once the review is cleared — we will contact you only "
        f"if anything is required.\n\n"
        f"Thank you for your patience — every PHILEON piece is prepared with intention."
    )
    return {"subject": subject, "html": html, "text": text}


def build_customer_shipment_email(order: Dict) -> Dict[str, str]:
    """PHILEON customer email sent when an authenticated admin marks a
    paid order shipped.

    Body includes:
      • PHILEON order number
      • purchased item(s), material/variant, size where applicable
      • carrier + tracking number + trusted tracking link (when the link
        is a well-formed http(s) URL — otherwise omitted)
      • order total in the trusted order currency
      • concierge contact path

    Deliberately excludes any Stripe identifier, webhook metadata,
    database ID, FX metadata, or presentment reconciliation detail.
    """
    order_no = order.get("order_number") or ""
    currency = order.get("currency") or "USD"
    total = _fmt_money(order.get("total_cents") or 0, currency)
    carrier = (order.get("carrier") or "").strip()
    tracking_number = (order.get("tracking_number") or "").strip()
    tracking_url = (order.get("tracking_url") or "").strip()
    # Only surface an http(s) tracking URL. Anything else is dropped so no
    # javascript:/data:/mailto: link can be smuggled into the email.
    safe_tracking_href = ""
    if tracking_url.startswith("http://") or tracking_url.startswith("https://"):
        safe_tracking_href = tracking_url

    subject = f"PHILEON — Order {order_no} Shipped"

    # Tracking block — HTML + text renditions.
    tracking_html_bits = []
    tracking_text_bits = []
    if carrier:
        tracking_html_bits.append(
            f"<p style='font-size:14px;color:#e8e0cf;margin:0 0 6px;'>"
            f"<span style='font-family:\"Cinzel\",serif;letter-spacing:.36em;font-size:10.5px;color:#a89f89'>CARRIER</span>&nbsp;&nbsp;{carrier}</p>"
        )
        tracking_text_bits.append(f"Carrier: {carrier}")
    if tracking_number:
        tracking_html_bits.append(
            f"<p style='font-size:14px;color:#e8e0cf;margin:0 0 6px;'>"
            f"<span style='font-family:\"Cinzel\",serif;letter-spacing:.36em;font-size:10.5px;color:#a89f89'>TRACKING&nbsp;#</span>&nbsp;&nbsp;{tracking_number}</p>"
        )
        tracking_text_bits.append(f"Tracking #: {tracking_number}")
    if safe_tracking_href:
        tracking_html_bits.append(
            f"<p style='margin:12px 0 0;'>"
            f"<a href='{safe_tracking_href}' style='color:#c8a24a;font-family:\"Cinzel\",serif;letter-spacing:.4em;font-size:11px;text-decoration:none;border-bottom:1px solid rgba(200,162,74,.4);padding-bottom:2px;'>TRACK YOUR SHIPMENT →</a>"
            f"</p>"
        )
        tracking_text_bits.append(f"Track your shipment: {safe_tracking_href}")

    tracking_html = "".join(tracking_html_bits) or (
        "<p style='font-size:14px;color:#a89f89;margin:0 0 6px;font-style:italic;'>"
        "Carrier details will follow shortly.</p>"
    )
    tracking_text = "\n".join(tracking_text_bits) or "Carrier details will follow shortly."

    status_link = _order_status_link(order)
    status_cta_html = ""
    status_cta_text = ""
    if status_link:
        status_cta_html = (
            f"<div style='margin-top:28px;text-align:center;'>"
            f"<a href='{status_link}' style='"
            f"display:inline-block;padding:14px 34px;"
            f"font-family:\"Cinzel\",serif;letter-spacing:.4em;font-size:11px;"
            f"color:#08070a;background:#c8a24a;text-decoration:none;'>"
            f"VIEW ORDER STATUS"
            f"</a>"
            f"</div>"
        )
        status_cta_text = f"\nView your order status: {status_link}\n"

    html = (
        f"{_CUSTOMER_HEAD_STYLE}"
        f"<div style='background:#0a0a0c;color:#e8e0cf;font-family:Georgia,serif;padding:48px 24px;'>"
        f"  <div style='max-width:560px;margin:0 auto;'>"
        f"    <p style='font-family:\"Cinzel\",serif;letter-spacing:.5em;font-size:11px;color:#c8a24a;margin:0 0 24px;'>PHILEON</p>"
        f"    <h1 class='phi-h1' style='font-family:\"Cinzel\",serif;letter-spacing:.14em;font-size:22px;line-height:1.15;color:#f4ecd6;margin:0 0 12px;word-break:keep-all;overflow-wrap:normal;'>"
        f"      <span style='display:block'>YOUR ORDER</span>"
        f"      <span style='display:block'>HAS SHIPPED.</span>"
        f"    </h1>"
        f"    <p style='font-family:\"Playfair Display\",Georgia,serif;font-style:italic;color:#a89f89;margin:0 0 32px;'>Your PHILEON piece is on its way.</p>"
        f"    <p style='font-size:14px;color:#e8e0cf;margin:0 0 8px;'>Order reference: <strong>{order_no}</strong></p>"
        f"    <table style='width:100%;border-collapse:collapse;margin-top:24px;'>{_items_html(order.get('items') or [], currency)}</table>"
        f"    <div style='display:flex;justify-content:space-between;padding-top:16px;border-top:1px solid #33322a;margin-top:8px;'>"
        f"      <span style='font-family:\"Cinzel\",serif;letter-spacing:.4em;font-size:11px;color:#a89f89'>TOTAL</span>"
        f"      <span class='phi-total-value' style='font-family:\"Cinzel\",serif;letter-spacing:.2em;font-size:14px;color:#c8a24a'>{total}</span>"
        f"    </div>"
        f"    <div style='margin-top:32px;padding-top:20px;border-top:1px solid #33322a;'>"
        f"      {tracking_html}"
        f"    </div>"
        f"    {status_cta_html}"
        f"    <p style='font-size:13px;color:#a89f89;line-height:1.65;margin-top:32px;'>"
        f"      If you have any questions about your shipment, reply to this email or "
        f"contact our concierge team at any time — we&apos;re here to help."
        f"    </p>"
        f"    <p style='font-size:13px;color:#a89f89;line-height:1.65;font-style:italic;'>"
        f"      Every PHILEON piece is prepared with intention."
        f"    </p>"
        f"  </div>"
        f"</div>"
    )
    text = (
        f"PHILEON — Your order has shipped.\n\n"
        f"Order reference: {order_no}\n\n"
        f"{_items_text(order.get('items') or [], currency)}\n\n"
        f"Total: {total}\n\n"
        f"{tracking_text}\n"
        f"{status_cta_text}\n"
        f"If you have any questions about your shipment, reply to this email or "
        f"contact our concierge team at any time — we're here to help.\n\n"
        f"Every PHILEON piece is prepared with intention."
    )
    return {"subject": subject, "html": html, "text": text}


async def send_shipment_email(order: Dict) -> Dict[str, object]:
    """Send the shipment-confirmation email to the customer exactly once.

    Idempotency is the caller's responsibility: `admin_orders.mark_shipped`
    performs an atomic transition (`shipping_notification_sent != True → True`)
    and only invokes this helper when its own write flipped that flag.

    Returns the underlying `send_email` status dict. Never raises.
    """
    to_customer = (order.get("customer_email") or "").strip()
    if not to_customer:
        return {"status": "skipped", "reason": "no_recipient"}
    payload = build_customer_shipment_email(order)
    try:
        return await send_email(to_customer, payload["subject"], payload["html"], payload["text"])
    except Exception as e:
        return {"status": "failed", "error": f"{type(e).__name__}: {str(e)[:180]}"}


async def send_paid_order_emails(order: Dict) -> Dict[str, Optional[Dict]]:
    """Notification router for a paid order. Returns a status dict the caller
    (webhook) uses to update `customer_notification_sent` and
    `internal_review_notification_sent` in `orders_v2`. Never raises — a
    failed notification is a signal, not a payment failure.

    Payment truth is never mutated here; the caller sets `payment_status`.

    Branches on `order.shipping_integrity_status`:

      * "pending_review"  →  customer PAYMENT RECEIVED email  +  internal
                             REVIEW alert. The customer never receives the
                             normal ORDER CONFIRMED email in this branch.
                             `mode == "pending_review"`.

      * any other value   →  customer ORDER CONFIRMED email  +  internal
                             plain paid notification (unchanged).
                             `mode == "ok"`.

    Each field in the returned dict carries a `status` key matching the
    underlying `services.email.send_email` contract:
        {"status": "sent"|"skipped"|"failed", ...}
    The webhook treats `"sent"` as a real delivery. Everything else must
    NOT be recorded as delivered on the OrderV2.
    """
    integrity = (order.get("shipping_integrity_status") or "").strip()
    to_customer = (order.get("customer_email") or "").strip()
    internal_to = (os.environ.get("PHILEON_ORDER_NOTIFICATION_EMAIL")
                   or os.environ.get("PHILEON_CONCIERGE_NOTIFICATION_EMAIL") or "").strip()

    result: Dict[str, Optional[Dict]] = {"customer": None, "internal": None,
                                          "mode": "pending_review" if integrity == "pending_review" else "ok"}

    if integrity == "pending_review":
        # Customer PAYMENT RECEIVED — never ORDER CONFIRMED for this transition.
        if to_customer:
            payload = build_customer_payment_received_email(order)
            try:
                result["customer"] = await send_email(to_customer, payload["subject"], payload["html"], payload["text"])
            except Exception as e:
                result["customer"] = {"status": "failed", "error": f"{type(e).__name__}: {str(e)[:180]}"}
        else:
            result["customer"] = {"status": "skipped", "reason": "no_recipient"}
        # Internal REVIEW alert — kept intentionally blunt for ops.
        if internal_to:
            payload = build_internal_integrity_review_notification(order)
            try:
                result["internal"] = await send_email(internal_to, payload["subject"], payload["html"], payload["text"])
            except Exception as e:
                result["internal"] = {"status": "failed", "error": f"{type(e).__name__}: {str(e)[:180]}"}
        else:
            result["internal"] = {"status": "skipped", "reason": "no_internal_recipient_configured"}
        return result

    # Normal branch — behavior preserved from prior release.
    if to_customer:
        payload = build_customer_paid_email(order)
        try:
            result["customer"] = await send_email(to_customer, payload["subject"], payload["html"], payload["text"])
        except Exception as e:
            result["customer"] = {"status": "failed", "error": f"{type(e).__name__}: {str(e)[:180]}"}
    else:
        result["customer"] = {"status": "skipped", "reason": "no_recipient"}
    if internal_to:
        payload = build_internal_paid_notification(order)
        try:
            result["internal"] = await send_email(internal_to, payload["subject"], payload["html"], payload["text"])
        except Exception as e:
            result["internal"] = {"status": "failed", "error": f"{type(e).__name__}: {str(e)[:180]}"}
    else:
        result["internal"] = {"status": "skipped", "reason": "no_internal_recipient_configured"}
    return result
