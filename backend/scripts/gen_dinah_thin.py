"""
One-shot generator: produces a 7mm thin-profile rose-gold mesh bangle render
that matches the existing 10mm Dinah-wide reference (same camera angle,
lighting, background, canvas, perspective). Saved to
/app/frontend/public/stackrats/dinah-thin-full.png
"""
import asyncio
import os
import base64
import sys
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

REFERENCE_PATH = Path("/app/frontend/public/stackrats/dinah-thin.png")
OUTPUT_PATH = Path("/app/frontend/public/stackrats/dinah-thin-full.png")

PROMPT = (
    "Using the supplied reference photograph as the EXACT visual template for "
    "framing, lighting, background, perspective, camera angle, canvas dimensions "
    "and post-production styling — regenerate the bangle with ONE change ONLY: "
    "the bangle profile must be visibly THINNER. Keep it a complete, unbroken "
    "donut-form ring viewed from the same three-quarter angle. The new bangle "
    "is a 14K ROSE GOLD micro-bead mesh bangle, 7mm wide (versus the 10mm of "
    "the reference). Maintain the same warm ivory studio sweep background, the "
    "same soft diffused top-down lighting with gentle reflected fill, the same "
    "subtle floor shadow, the same crop with 10–15 percent breathing room around "
    "the entire oval. The full bangle must fit fully inside the frame — NO edge "
    "clipping, NO macro crop, NO partial views. Show the entire ring from top "
    "to bottom and left to right, complete oval visible. Render at studio "
    "product photography quality."
)


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY missing from /app/backend/.env")
        return 1
    if not REFERENCE_PATH.exists():
        print(f"ERROR: reference image not found at {REFERENCE_PATH}")
        return 1

    with open(REFERENCE_PATH, "rb") as fh:
        ref_b64 = base64.b64encode(fh.read()).decode("utf-8")

    chat = LlmChat(
        api_key=api_key,
        session_id="stackrats-dinah-thin-render",
        system_message="You are a luxury product photography image generator.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=PROMPT, file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"Model text: {text[:200] if text else '(none)'}")

    if not images:
        print("ERROR: no images returned")
        return 1

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img_bytes = base64.b64decode(images[0]["data"])
    with open(OUTPUT_PATH, "wb") as f:
        f.write(img_bytes)
    print(f"OK saved {OUTPUT_PATH} ({len(img_bytes)} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
