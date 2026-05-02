"""
Generate two editorial Size Guide images via Gemini Nano Banana:
  - Step 1: paper/ribbon wrapped around finger (overlap point visible, no jewelry)
  - Step 2: paper strip laid flat against a mm ruler
Both match a warm neutral luxury aesthetic (cream bg, soft lighting, minimal).
"""
import asyncio
import os
import base64
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")

STEP1_OUT = "/app/frontend/public/images/ring-size-wrap.jpg"
STEP2_OUT = "/app/frontend/public/images/ring-size-measure.jpg"

STEP1_PROMPT = """Editorial still-life photograph, luxury jewelry brand instructional style. A light strip of cream-colored ribbon or white paper wrapped once horizontally around the base of a relaxed adult ring finger, with the overlap point visible. Soft natural window lighting. Warm neutral background (cream, off-white, or beige tones, matching a luxury boutique color palette). Hand is clean, unadorned — absolutely no rings, no jewelry, no earrings, no watches, no other props, no pencil, no ruler. Shallow depth of field, soft focus on the background. Photographed from a slight overhead angle to show the wrap clearly. High-end editorial quality, soft tonal range, minimalist composition. Square aspect ratio, centered subject. Plain warm cream backdrop. No text, no logos."""

STEP2_PROMPT = """Editorial still-life photograph, luxury jewelry brand instructional style. A thin strip of cream-colored paper or light ribbon laid perfectly flat and straight on top of a slim, clean millimeter ruler (mm markings clearly visible). The paper strip has a single small pencil mark near one end indicating the measurement point. Warm neutral cream background (ivory, off-white, beige tones). Soft natural window lighting. No hands in frame, no fingers, no jewelry, no earrings, no other props. Shot from directly above, flat-lay composition. Minimal, editorial, high-end luxury aesthetic with shallow depth of field. Square aspect ratio. No text, no logos, no watermarks."""


async def generate(prompt: str, out_path: str, session_id: str) -> None:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing")

    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message="You are a world-class luxury editorial photographer specializing in minimalist instructional still-life photography for high-end jewelry brands.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=prompt)
    print(f"Generating → {out_path}")
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"  text: {str(text)[:120]}")
    print(f"  image count: {len(images) if images else 0}")

    if not images:
        raise RuntimeError(f"No image returned for {out_path}")

    img = images[0]
    out_bytes = base64.b64decode(img["data"])
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(out_bytes)
    print(f"  wrote {len(out_bytes)} bytes → {out_path}\n")


async def main() -> None:
    await generate(STEP1_PROMPT, STEP1_OUT, "size-guide-wrap")
    await generate(STEP2_PROMPT, STEP2_OUT, "size-guide-measure")


if __name__ == "__main__":
    asyncio.run(main())
