"""Generate the STACKRATS three-bangles-separated editorial frame.

Uses Gemini Nano Banana (image editing) with the original stacked-vertical
photo as the reference so proportions, mesh texture and lighting stay
identical, then outputs the side-by-side horizontal composition.
"""
import asyncio
import base64
import os
import sys
from pathlib import Path
from urllib.request import urlopen

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

OUTPUT_DIR = Path("/app/frontend/public/stackrats")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_FILE = OUTPUT_DIR / "separated.png"

REFERENCE_URL = (
    "https://customer-assets.emergentagent.com/"
    "job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/"
    "dgp6tl9l_1000156925.jpg"
)

PROMPT = (
    "Using the attached STACKRATS image as the exact reference, separate "
    "the three bangles into individual pieces while preserving the "
    "identical dimensions, proportions, mesh texture, metal finish, "
    "lighting and camera style. Arrange them side-by-side horizontally "
    "with generous negative space between each piece. "
    "LEFT: Dinah — 14K rose gold. "
    "CENTER: Valerie — 14K white gold. "
    "RIGHT: Dominique — 18K yellow gold. "
    "Each bangle must remain perfectly circular and identical in shape — "
    "do not stretch, resize, redesign, or alter the mesh pattern. "
    "Background: warm ivory luxury editorial backdrop, soft champagne "
    "tones, seamless studio sweep, subtle natural shadow beneath each "
    "bangle. Lighting: high-end luxury jewelry photography, large "
    "diffused softboxes, realistic metal reflections, micro-texture "
    "visible, true gold behavior, no blown highlights. Camera: 85mm "
    "luxury product photography, eye-level product view, shallow depth "
    "of field, crisp focus across all three bangles. NOT CGI. NOT CAD. "
    "NOT 3D render. NOT floating objects. NOT stacked. Three separate "
    "bangles presented as a luxury collection photograph for PHILEON. "
    "Wide landscape composition, ~3:2 aspect ratio. No text overlay, no "
    "watermark."
)


async def generate() -> Path | None:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing", file=sys.stderr)
        return None

    # Download reference and base64-encode it.
    print("fetching reference image…", flush=True)
    ref_bytes = urlopen(REFERENCE_URL, timeout=30).read()
    ref_b64 = base64.b64encode(ref_bytes).decode("utf-8")
    print(f"reference: {len(ref_bytes)} bytes", flush=True)

    chat = (
        LlmChat(
            api_key=api_key,
            session_id="stackrats-separated",
            system_message=(
                "You are a museum-grade luxury jewelry product "
                "photographer for PHILEON. You render hyper-realistic "
                "editorial campaign images. Always honour the exact "
                "composition, lighting and material instructions in the "
                "prompt. Never add text overlays or watermarks."
            ),
        )
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )

    msg = UserMessage(text=PROMPT, file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)
    if text:
        print(f"model text: {text[:160]!r}", flush=True)
    if not images:
        print("!! no image returned", flush=True)
        return None
    img = images[0]
    OUTPUT_FILE.write_bytes(base64.b64decode(img["data"]))
    print(f"saved -> {OUTPUT_FILE} ({OUTPUT_FILE.stat().st_size} bytes)", flush=True)
    return OUTPUT_FILE


if __name__ == "__main__":
    out = asyncio.run(generate())
    sys.exit(0 if out else 1)
