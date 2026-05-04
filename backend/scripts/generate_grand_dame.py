"""
Generate the 8-shot luxury image set for THE GRAND DAME — rose gold mesh cuff.
Uses Gemini Nano Banana with the user-provided reference, locked product
identity (sculptural open cuff, polished rose gold, mesh/lattice surface).

Outputs: /app/frontend/public/grand-dame/01_hero.png ... 08_on_wrist.png
"""
from __future__ import annotations

import asyncio
import base64
import io
import os
import sys
import uuid
from pathlib import Path

import httpx
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
from PIL import Image, ImageEnhance

load_dotenv()

REFERENCE_URL = (
    "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/"
    "artifacts/nb5ncpir_1000148898.png"
)
OUTPUT_DIR = Path("/app/frontend/public/grand-dame")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

LOCKED_PRODUCT = (
    "Use the SHAPE, SILHOUETTE, PROPORTIONS, and SURFACE TEXTURE of the cuff "
    "in the reference image. Preserve its identity EXACTLY: "
    "a sculptural OPEN CUFF bracelet (not a closed bangle, not a chain), "
    "polished rose gold metal with a fine mesh / lattice surface texture, "
    "smooth polished edges framing a perforated mesh body, oval profile with "
    "a clear visible gap on one side. The cuff is bold, architectural, refined. "
    "NO gemstones. NO logos visible. Only the camera angle, framing, lighting, "
    "and surrounding surface change between shots — the cuff itself is identical."
    "\n\n"
    "MATERIAL: Polished ROSE GOLD only. Warm pinkish-gold tone with controlled "
    "specular highlights and clean reflections. No yellow gold, no white gold, "
    "no platinum, no bronze, no copper. The mesh texture must remain crisp and "
    "consistent — uniform pattern across the entire surface."
)

STYLE = (
    "Ultra-realistic luxury jewelry photography, Cartier-level campaign quality, "
    "cinematic high-contrast lighting, dark charcoal or deep black backgrounds, "
    "shallow depth of field, sharp product focus, controlled specular highlights "
    "on the polished rose gold edges, deep shadows for sculptural depth. "
    "8K photoreal — no cartoon, no CGI, no stylization, no distortion, no "
    "blown highlights, no gemstones, no logos, no text, no watermark."
)

SHOTS = [
    (
        "01_hero",
        "HERO ANGLE. Low 3/4 perspective on the cuff, slightly rotated for "
        "asymmetry. Dramatic directional lighting from upper left. Cuff "
        "centered and dominant in frame. Strong specular highlights along "
        "the polished outer edges, deep shadow falling away on the opposite "
        "side. Mesh texture catches subtle warm rim-light. Dark charcoal "
        "background with cinematic falloff."
    ),
    (
        "02_front",
        "FRONT / SYMMETRY. Straight-on centered view showing the OPEN CUFF "
        "GAP clearly at the front. Perfectly balanced left/right symmetry. "
        "Soft even lighting on the polished edges, mesh body legible "
        "through the gap, clean editorial presentation. Dark neutral seamless "
        "background."
    ),
    (
        "03_topdown",
        "TOP-DOWN view. Direct overhead angle showing the full OVAL shape of "
        "the cuff and the visible OPENING. Soft controlled overhead lighting, "
        "minimal harsh shadows, mesh surface fully visible across the body. "
        "Charcoal background."
    ),
    (
        "04_side_profile",
        "SIDE PROFILE. Low side angle emphasizing the THICKNESS, the gentle "
        "CURVATURE of the cuff, and the structural depth of the mesh wall. "
        "Sculptural form is the focus. Side rim-light skimming across the "
        "surface, deep shadow underneath. Dark background."
    ),
    (
        "05_macro",
        "MACRO DETAIL. Extreme close-up of the MESH/LATTICE TEXTURE meeting "
        "the polished outer EDGE. Very shallow depth of field — sharp focus "
        "on a small section of mesh and the polished bevel beside it. High "
        "detail, soft fall-off into bokeh. Dark background."
    ),
    (
        "06_on_surface",
        "ON-SURFACE LUXURY. The cuff placed on a BLACK REFLECTIVE LACQUER "
        "TRAY or polished black surface. Subtle mirror reflection of the "
        "cuff visible underneath. Minimal environment, single soft directional "
        "key light, deep ambient shadow. Editorial luxury still life."
    ),
    (
        "07_in_hand",
        "IN-HAND. The cuff held lightly between fingers of a hand with neutral "
        "skin tones. Soft directional lighting. Focus on the cuff's SCALE "
        "and architectural presence relative to the fingers. Background dark "
        "and softly out of focus. Hand is a supporting element — the cuff "
        "is the subject."
    ),
    (
        "08_on_wrist",
        "ON-WRIST. The cuff worn on a forearm with neutral styling (no other "
        "jewelry, no watch, plain dark or skin background). Focus on FIT, "
        "PROPORTION, and how the open cuff sits on the wrist. Soft warm "
        "directional light catching the rose gold edges. Editorial luxury "
        "lifestyle, calm and quiet — no aggressive posing."
    ),
]


async def fetch_reference_base64() -> str:
    """Fetch reference. The reference has a 'PHILEON' engraving at the bottom
    of the lacquer tray — we want to keep the cuff identity but NOT repeat
    that engraving in every shot, so we do not pre-process colour (rose gold
    is the desired output) but the prompt explicitly says no logos.
    """
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(REFERENCE_URL)
        r.raise_for_status()
        return base64.b64encode(r.content).decode("utf-8")


async def generate_one(api_key: str, ref_b64: str, slug: str, shot_prompt: str) -> None:
    out_path = OUTPUT_DIR / f"{slug}.png"
    if out_path.exists():
        print(f"[skip] {out_path} already exists")
        return

    prompt = f"{LOCKED_PRODUCT}\n\nSHOT: {shot_prompt}\n\nSTYLE: {STYLE}"

    chat = LlmChat(
        api_key=api_key,
        session_id=f"grand-dame-{slug}-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury jewelry campaign photographer. Generate one "
            "photoreal image preserving the referenced rose gold mesh cuff's "
            "identity exactly while delivering the requested angle and "
            "composition. No engravings, logos, text, or watermarks."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=prompt, file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)

    if not images:
        print(f"[FAIL] {slug} — no image. text='{(text or '')[:120]}'")
        return

    img = images[0]
    img_bytes = base64.b64decode(img["data"])
    out_path.write_bytes(img_bytes)
    print(f"[ok]   {slug} -> {out_path} ({len(img_bytes)//1024} KB)")


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing", file=sys.stderr)
        return 1

    print(f"Fetching reference: {REFERENCE_URL}")
    ref_b64 = await fetch_reference_base64()
    print(f"Reference loaded ({len(ref_b64)//1024} KB base64)")

    for slug, shot_prompt in SHOTS:
        try:
            await generate_one(api_key, ref_b64, slug, shot_prompt)
        except Exception as e:  # noqa: BLE001
            print(f"[ERR]  {slug} — {type(e).__name__}: {e}")

    print("\nDone.")
    for p in sorted(OUTPUT_DIR.iterdir()):
        print(f" - /grand-dame/{p.name}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
