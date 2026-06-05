"""Generate the missing DINAH THIN (rose gold thin) bangle frame.

Uses the supplied DINAH WIDE image as the colour/material reference and
the VALERIE THIN as the silhouette/proportion reference so the output
matches both rose-gold tone AND the thin-7mm profile exactly.
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
OUTPUT_FILE = OUTPUT_DIR / "dinah-thin.png"

REFERENCES = [
    # Dinah WIDE — locks the rose-gold tone & mesh texture.
    "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/yumbxpr3_1000157081.jpg",
    # Valerie THIN — locks the thin-7mm silhouette/proportion.
    "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/jj4t1672_1000157085.jpg",
]

PROMPT = (
    "Render a single DINAH THIN bangle from the PHILEON STACKRATS "
    "collection. Match the EXACT rose-gold material, mesh texture and "
    "lighting from the first reference image. Match the EXACT thin 7mm "
    "circular silhouette, slim profile and standing-upright pose from "
    "the second reference image. The result must be: one rose-gold "
    "donut-form bangle, 7mm wide profile, perfectly circular, standing "
    "upright on a warm ivory studio sweep, soft champagne shadow "
    "beneath, no labels, no text, no watermark, vertical portrait "
    "framing identical to the references. Hyper-realistic luxury "
    "product photography, 85mm lens, large diffused softboxes, "
    "realistic gold reflections, micro-texture clearly visible. NOT "
    "CGI, NOT CAD, NOT 3D render. One single bangle only — no stack, "
    "no extra objects, no other bangles in frame."
)


async def generate() -> Path | None:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing", file=sys.stderr)
        return None

    refs_b64 = []
    for url in REFERENCES:
        print(f"fetching {url[-32:]}…", flush=True)
        data = urlopen(url, timeout=30).read()
        refs_b64.append(base64.b64encode(data).decode("utf-8"))
        print(f"  → {len(data)} bytes", flush=True)

    chat = (
        LlmChat(
            api_key=api_key,
            session_id="stackrats-dinah-thin",
            system_message=(
                "You are a museum-grade luxury jewelry product "
                "photographer for PHILEON. Render hyper-realistic "
                "editorial frames. Never add text overlays or watermarks."
            ),
        )
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )

    msg = UserMessage(
        text=PROMPT,
        file_contents=[ImageContent(b) for b in refs_b64],
    )
    text, images = await chat.send_message_multimodal_response(msg)
    if text:
        print(f"model text: {text[:160]!r}", flush=True)
    if not images:
        print("!! no image returned", flush=True)
        return None
    OUTPUT_FILE.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"saved -> {OUTPUT_FILE} ({OUTPUT_FILE.stat().st_size} bytes)", flush=True)
    return OUTPUT_FILE


if __name__ == "__main__":
    sys.exit(0 if asyncio.run(generate()) else 1)
