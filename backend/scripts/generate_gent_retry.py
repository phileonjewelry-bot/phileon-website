"""Retry the 2 hero frames that failed on first run."""
import asyncio
import base64
import os
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")

OUTPUT_DIR = Path("/app/frontend/public/gent")
MODEL = "gemini-3.1-flash-image-preview"

PROMPTS = [
    (
        "01-hero",
        "Ultra-luxury PHILEON signet ring named GENT, massive architectural "
        "gentleman's club ring in polished yellow gold, oversized raised "
        "block letters spelling GENT across the top, deeply sculpted woven "
        "lattice sidewalls inspired by old-world estate ironwork and "
        "tailored menswear textures, heavy masculine proportions, sharp "
        "beveled edges, rich reflections, black mirror surface, black void "
        "background, cinematic luxury lighting, ultra realistic macro "
        "jewelry photography, museum-grade product render. Square format, "
        "centered composition, no text overlay other than the engraved "
        "GENT lettering on the ring.",
    ),
    (
        "02-front",
        "Front-facing luxury jewelry editorial of the PHILEON GENT ring, "
        "bold raised GENT lettering dominating the composition, symmetrical "
        "woven side architecture, polished yellow gold, heavy signet "
        "proportions, black reflective background, dramatic frontal "
        "lighting, ultra sharp macro realism, sophisticated masculine "
        "elegance, cinematic shadows. Square format, perfectly centered, "
        "no text overlay.",
    ),
]


async def generate_one(api_key: str, slug: str, prompt: str) -> Path | None:
    session_id = f"gent-{slug}-{uuid.uuid4().hex[:8]}"
    chat = (
        LlmChat(api_key=api_key, session_id=session_id, system_message="You are a museum-grade luxury jewelry product photographer.")
        .with_model("gemini", MODEL)
        .with_params(modalities=["image", "text"])
    )
    text, images = await chat.send_message_multimodal_response(UserMessage(text=prompt))
    if not images:
        print(f"[{slug}] no image", flush=True)
        return None
    img = images[0]
    ext = ".png" if "png" in img.get("mime_type", "image/png") else ".jpg"
    out = OUTPUT_DIR / f"{slug}{ext}"
    out.write_bytes(base64.b64decode(img["data"]))
    print(f"[{slug}] saved -> {out} ({out.stat().st_size} bytes)", flush=True)
    return out


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        return 1
    for slug, prompt in PROMPTS:
        if any(OUTPUT_DIR.glob(f"{slug}.*")):
            print(f"[{slug}] already exists, skipping", flush=True)
            continue
        try:
            await generate_one(api_key, slug, prompt)
        except Exception as exc:  # noqa: BLE001
            print(f"[{slug}] EXC: {exc}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
