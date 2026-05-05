"""
Generate the 6-shot luxury image set for THE CARAPACE — sculptural
exoskeleton dome ring with organic lattice structure.

Outputs: /app/frontend/public/carapace/01_hero.png … 06_on_hand.png
"""
from __future__ import annotations

import asyncio
import base64
import os
import sys
import uuid
from pathlib import Path

import httpx
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv()

REFERENCE_URL = (
    "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/"
    "artifacts/eddy5vzf_1000149056.png"
)
OUTPUT_DIR = Path("/app/frontend/public/carapace")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

LOCKED_PRODUCT = (
    "Preserve the ring identity from the reference image EXACTLY: "
    "a sculptural DOME statement ring with an ORGANIC EXOSKELETON / LATTICE "
    "structure — an open, honeycomb-like interconnected cell pattern forming "
    "the entire dome surface (the ring is essentially a perforated lattice "
    "sphere-top), high-polish gold metal finish, smooth sculpted 8mm band "
    "underneath, substantial statement coverage across the finger. "
    "Preserve the lattice cell count, proportions, band thickness, and dome "
    "silhouette. Only the camera angle, framing, lighting, and environment "
    "change between shots. No gemstones. No engraving. No logos. No text."
)

STYLE = (
    "Ultra-realistic luxury jewelry photography, Cartier-level campaign quality, "
    "cinematic high-contrast lighting, deep black or dark charcoal background, "
    "shallow depth of field, sharp product focus, controlled specular highlights "
    "on the polished gold, dramatic directional light. "
    "8K photoreal, no cartoon, no CGI, no stylization, no distortion, no "
    "blown highlights, no extra gemstones, no logos, no text, no watermark."
)

SHOTS = [
    (
        "01_hero",
        "HERO. Low 3/4 cinematic angle of the ring on a dark surface. "
        "Dome dominant in frame, lattice exoskeleton catching dramatic "
        "directional light from upper-left, deep shadow falling to opposite "
        "side. Warm cream cushion or black velvet surface. The ring feels "
        "sculptural and architectural — authority, weight, protection."
    ),
    (
        "02_angle",
        "ANGLE. 3/4 side angle showing the full dome curvature AND the band "
        "profile together. Lattice cells visible in rhythm, polished band "
        "catching a clean highlight. Moody dark background."
    ),
    (
        "03_top",
        "TOP-DOWN. Direct overhead view of the full lattice dome showing "
        "the complete cell pattern across the ring's face. Soft even "
        "overhead lighting, minimal harsh shadows, lattice structure fully "
        "legible. Dark charcoal background."
    ),
    (
        "04_macro",
        "MACRO DETAIL. Extreme close-up of a small section of the lattice "
        "cells and the polished gold ribs connecting them. Very shallow "
        "depth of field — sharp focus on two or three cells, soft fall-off "
        "around them. Luxury craftsmanship texture study."
    ),
    (
        "05_shadow",
        "SHADOW STUDY. The ring placed on a clean surface with a strong "
        "single directional key light casting the lattice pattern as a "
        "dramatic sculptural SHADOW across the surface beside the ring. "
        "The shadow is as much the subject as the ring itself. Minimal, "
        "editorial, architectural."
    ),
    (
        "06_on_hand",
        "ON-HAND. The ring worn on a long-fingered hand with neutral skin "
        "tone, relaxed posture, close editorial crop. Ring dominates the "
        "frame — lattice dome clearly readable, polished gold band visible. "
        "Background dark and softly out of focus. Scale and presence."
    ),
]


async def fetch_reference_base64() -> str:
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
        session_id=f"carapace-{slug}-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury jewelry campaign photographer. Generate one "
            "photoreal image preserving the referenced lattice dome ring "
            "identity exactly while delivering the requested angle. No "
            "engravings, logos, text, watermarks."
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

    img_bytes = base64.b64decode(images[0]["data"])
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
        print(f" - /carapace/{p.name}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
