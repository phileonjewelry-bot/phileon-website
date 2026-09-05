"""PHILEON — Behavioral retention email templates (Simulation Phase).

Four editorial templates. Every email:
  • Includes PHILEON branding + a working unsubscribe link (HMAC signed).
  • Renders the product image, name, and displayed price only when the
    caller can supply them from the trusted catalog. When absent, the
    template gracefully omits them — NEVER fabricates data.
  • NEVER surfaces Stripe IDs, cart internals, DB IDs, session IDs,
    webhook data or FX metadata.
  • NO discount codes, NO countdown timers, NO scarcity/popularity claims.
"""
from __future__ import annotations
import os
from typing import Dict, Optional
from urllib.parse import quote, urlparse

from services.retention_service import make_unsub_token


# ────────────────────────────────────────────────────────────────
# TEMPLATE COPY — LOCKED, MINIMAL, EDITORIAL
# ────────────────────────────────────────────────────────────────
_HEADLINES = {
    "browse":   "STILL ON YOUR MIND?",
    "wishlist": "READY FOR ANOTHER LOOK?",
    "cart":     "YOU LEFT SOMETHING BEHIND.",
    "checkout": "YOUR SELECTION IS STILL WAITING.",
}
_SUBLINES = {
    "browse":   "You paused a moment with a PHILEON piece. It's here whenever you are.",
    "wishlist": "The piece you saved is quietly waiting — no rush, no reminder cascade.",
    "cart":     "A PHILEON piece is still in your bag. Return when the moment is right.",
    "checkout": "You began your order. We've kept your selection intact.",
}
_SUBJECTS = {
    "browse":   "Still on your mind — PHILEON",
    "wishlist": "Ready for another look — PHILEON",
    "cart":     "You left something behind — PHILEON",
    "checkout": "Your selection is still waiting — PHILEON",
}
_CTA_LABELS = {
    "browse":   "REVISIT THE PIECE",
    "wishlist": "REVISIT YOUR SAVED PIECE",
    "cart":     "RETURN TO YOUR BAG",
    "checkout": "COMPLETE YOUR ORDER",
}


# ────────────────────────────────────────────────────────────────
# LINK SAFETY
# ────────────────────────────────────────────────────────────────
def _base_url() -> str:
    for key in ("PHILEON_ORDER_STATUS_URL_BASE", "FRONTEND_URL", "CHECKOUT_SUCCESS_URL"):
        v = (os.environ.get(key) or "").strip()
        if not v:
            continue
        if v.startswith("http://") or v.startswith("https://"):
            # For CHECKOUT_SUCCESS_URL, take only the origin.
            try:
                p = urlparse(v)
                return f"{p.scheme}://{p.netloc}"
            except Exception:
                continue
    return ""


def _pdp_url(slug: str, kind: str) -> str:
    base = _base_url()
    if not base or not slug:
        return ""
    # Retention-tagged trusted PDP URL. `retref` is a NON-SECRET analytics
    # marker — carries only the campaign kind, no identity or session ID.
    return f"{base.rstrip('/')}/product/{quote(slug)}?retref={quote(kind)}"


def _unsub_url(email: str) -> str:
    base = _base_url()
    if not base:
        return ""
    return f"{base.rstrip('/')}/api/unsubscribe?token={quote(make_unsub_token(email))}"


# ────────────────────────────────────────────────────────────────
# BUILD
# ────────────────────────────────────────────────────────────────
def build_email(kind: str, *, email: str, product_slug: str,
                product: Optional[Dict] = None) -> Dict[str, str]:
    """Return {subject, html, text} for the four templates. `product` may
    supply {"name","image_url","display_price"} from the trusted catalog."""
    if kind not in _HEADLINES:
        raise ValueError(f"unknown template kind: {kind}")

    headline = _HEADLINES[kind]
    subline = _SUBLINES[kind]
    subject = _SUBJECTS[kind]
    cta_label = _CTA_LABELS[kind]

    pdp = _pdp_url(product_slug, kind)
    unsub = _unsub_url(email)

    name = ""
    image_html = ""
    price_html = ""
    if isinstance(product, dict):
        raw_name = str(product.get("name") or "").strip()
        if raw_name:
            name = raw_name
        img = str(product.get("image_url") or "").strip()
        if img.startswith("http://") or img.startswith("https://"):
            image_html = (
                f"<img src='{img}' alt='{name or 'PHILEON piece'}' "
                f"style='display:block;max-width:100%;height:auto;margin:0 auto 24px;"
                f"border:1px solid #33322a;' />"
            )
        dp = str(product.get("display_price") or "").strip()
        if dp:
            price_html = (
                f"<p style='font-family:\"Cinzel\",serif;font-size:11px;"
                f"letter-spacing:.4em;color:#c8a24a;text-align:center;margin:8px 0 24px;'>"
                f"{dp}</p>"
            )

    name_html = (
        f"<p style='font-family:\"Cinzel\",serif;font-size:14px;letter-spacing:.28em;"
        f"color:#f4ecd6;text-align:center;margin:0 0 6px;text-transform:uppercase;'>"
        f"{name}</p>"
    ) if name else ""

    cta_html = ""
    if pdp:
        cta_html = (
            f"<div style='text-align:center;margin:32px 0 24px;'>"
            f"<a href='{pdp}' style='display:inline-block;padding:14px 34px;"
            f"font-family:\"Cinzel\",serif;letter-spacing:.4em;font-size:11px;"
            f"color:#08070a;background:#c8a24a;text-decoration:none;'>"
            f"{cta_label}</a></div>"
        )

    unsub_html = ""
    if unsub:
        unsub_html = (
            f"<p style='font-size:11px;color:#7d7565;line-height:1.6;text-align:center;"
            f"margin:28px 0 0;'>"
            f"You are receiving this because you opted in to PHILEON updates. "
            f"<a href='{unsub}' style='color:#a89f89;text-decoration:underline;'>Unsubscribe</a>."
            f"</p>"
        )

    html = (
        f"<div style='background:#0a0a0c;color:#e8e0cf;font-family:Georgia,serif;padding:48px 24px;'>"
        f"  <div style='max-width:560px;margin:0 auto;'>"
        f"    <p style='font-family:\"Cinzel\",serif;letter-spacing:.5em;font-size:11px;"
        f"color:#c8a24a;margin:0 0 24px;text-align:center;'>PHILEON</p>"
        f"    <h1 style='font-family:\"Cinzel\",serif;letter-spacing:.14em;font-size:22px;"
        f"line-height:1.15;color:#f4ecd6;margin:0 0 12px;text-align:center;'>{headline}</h1>"
        f"    <p style='font-family:\"Playfair Display\",Georgia,serif;font-style:italic;"
        f"color:#a89f89;margin:0 0 32px;text-align:center;'>{subline}</p>"
        f"    {image_html}"
        f"    {name_html}"
        f"    {price_html}"
        f"    {cta_html}"
        f"    <p style='font-size:12px;color:#a89f89;line-height:1.65;text-align:center;"
        f"margin-top:32px;'>PHILEON &middot; Fine Jewelry, Made Slowly</p>"
        f"    {unsub_html}"
        f"  </div>"
        f"</div>"
    )
    text_lines = [
        "PHILEON",
        headline,
        subline,
    ]
    if name:
        text_lines.append(name)
    if pdp:
        text_lines += ["", pdp]
    text_lines += ["", "PHILEON — Fine Jewelry, Made Slowly"]
    if unsub:
        text_lines += ["", f"Unsubscribe: {unsub}"]
    text = "\n".join(text_lines)

    return {"subject": subject, "html": html, "text": text}
