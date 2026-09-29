"""PHILEON — canonical policy source of truth for the AI concierge tool.

Kept concise and factual. If the fuller policy text lives elsewhere
(FAQ page, Shipping page, Warranty page), each entry ends with a
canonical URL path so the AI can direct the customer to the full text.
Owner-editable in one place.

Deliberately NOT duplicated inside the AI system prompt (§3D of the
concierge spec — never encode duplicate policy text in the prompt).
"""
from __future__ import annotations
from typing import Dict, Any

TOPICS = ("SHIPPING", "RETURNS", "WARRANTY", "CUSTOM", "PAYMENT")


PHILEON_POLICIES: Dict[str, Dict[str, Any]] = {
    "SHIPPING": {
        "summary": (
            "PHILEON ships fully insured with signature required on delivery "
            "for orders above the fine-jewellery threshold. Order status "
            "notifications are sent by email. Countries served follow the "
            "current PHILEON allow-list; some regions are made-to-order only."
        ),
        "notes": [
            "Signature required on higher-value pieces at delivery.",
            "Made-to-order pieces list an estimated production window on the product page.",
            "Real-time tracking is provided in the order-status email.",
        ],
        "full_reference_path": "/faq#shipping",
    },
    "RETURNS": {
        "summary": (
            "PHILEON accepts returns of ready-to-ship pieces within the "
            "documented returns window when the piece is unworn, in original "
            "condition, and accompanied by original packaging and documentation. "
            "Custom / made-to-order / one-of-one Vault pieces are non-returnable. "
            "Refunds are issued to the original payment method after inspection."
        ),
        "notes": [
            "Ready-to-ship pieces: eligible within the window listed on the returns page.",
            "Vault / made-to-order / custom pieces: not eligible for return.",
            "Return authorisation must be requested before shipping any piece back.",
            "Refunds are processed after PHILEON confirms receipt and condition.",
        ],
        "full_reference_path": "/faq#returns",
    },
    "WARRANTY": {
        "summary": (
            "PHILEON pieces carry a workmanship warranty covering manufacturing "
            "defects. It does not cover normal wear, accidental damage, loss, "
            "theft, or unauthorised modifications by third-party jewellers."
        ),
        "notes": [
            "Warranty covers manufacturing defects only.",
            "Repairs unrelated to defects are quoted separately.",
            "Contact PHILEON Concierge to open a warranty case.",
        ],
        "full_reference_path": "/faq#warranty",
    },
    "CUSTOM": {
        "summary": (
            "PHILEON offers bespoke and one-of-one commissions through the "
            "Custom Jewelry programme. Each project begins with an inquiry — "
            "the atelier reviews feasibility, materials, timeline, and budget "
            "before any commitment. No binding quote is issued in chat."
        ),
        "notes": [
            "Every custom project begins with a written inquiry.",
            "PHILEON reviews materials, feasibility, and timeline before quoting.",
            "One-of-one Vault pieces are available directly and are non-returnable.",
        ],
        "inquiry_path": "/custom-jewelry",
        "full_reference_path": "/custom-jewelry",
    },
    "PAYMENT": {
        "summary": (
            "PHILEON accepts major credit cards and select instalment "
            "options through the checkout. Currency is set by the customer's "
            "region at checkout; the catalog price is authoritative."
        ),
        "notes": [
            "All payment is processed through the PHILEON checkout.",
            "Prices displayed on the site are authoritative — no chat-based discounts.",
            "PHILEON does not accept payment via chat or email links.",
        ],
        "full_reference_path": "/faq#payment",
    },
}


def get_policy(topic: str) -> Dict[str, Any]:
    """Return the canonical policy record for a topic. Raises KeyError
    for unknown topics; the concierge tool wrapper turns that into a
    structured tool error."""
    t = (topic or "").strip().upper()
    if t not in PHILEON_POLICIES:
        raise KeyError(t)
    return {"topic": t, **PHILEON_POLICIES[t]}
