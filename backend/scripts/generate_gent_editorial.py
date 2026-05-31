"""
One-time editorial-frame generator for PHILEON · GENT.

Generates 6 luxury jewelry editorial frames from the 6 prompts supplied
by the design team, using Gemini Nano Banana via the Emergent universal
LLM key + emergentintegrations.

Output: PNG frames written to /app/frontend/public/gent/ so they ship
through the existing frontend static asset pipeline (same pattern as
/coogi-dna/, /carapace/ etc.).

Run:
    python /app/backend/scripts/generate_gent_editorial.py
"""
import asyncio
import base64
import os
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load the universal key from the backend env file.
load_dotenv("/app/backend/.env")

OUTPUT_DIR = Path("/app/frontend/public/gent")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

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
        "jewelry photography, Tom Ford editorial energy, elite private "
        "club aesthetic, extremely detailed gold texture, museum-grade "
        "product render, soft reflections, high contrast shadows, premium "
        "luxury campaign shot. Square format, centered composition, "
        "no text overlay other than the engraved GENT lettering on the ring.",
    ),
    (
        "02-front",
        "Front-facing luxury jewelry editorial of the PHILEON GENT ring, "
        "bold raised GENT lettering dominating the composition, symmetrical "
        "woven side architecture, polished yellow gold, heavy signet "
        "proportions, black reflective background, dramatic frontal "
        "lighting, luxury campaign photography, ultra sharp macro realism, "
        "sophisticated masculine elegance, quiet wealth aesthetic, private "
        "members club mood, highly detailed gold reflections, cinematic "
        "shadows. Square format, perfectly centered, no text overlay.",
    ),
    (
        "03-low-angle",
        "Low-angle cinematic macro photograph of the PHILEON GENT ring, "
        "oversized gold lettering towering above intricate woven sidewalls, "
        "monumental masculine luxury, deep black background, black "
        "reflective surface, strong directional lighting emphasizing depth "
        "and gold reflections, architectural signet ring aesthetic, luxury "
        "editorial photography, elite gentleman's club energy, hyper "
        "realistic gold textures, intimidating elegance. Square format.",
    ),
    (
        "04-side",
        "Side profile macro editorial of the PHILEON GENT signet ring, "
        "focus on the woven lattice sidewall architecture and braided edge "
        "details, polished yellow gold, black void background, dramatic "
        "side lighting revealing texture depth and negative space, "
        "sophisticated masculine luxury, old-world tailoring inspiration, "
        "museum-grade jewelry photography, hyper realistic reflections, "
        "premium editorial composition. Square format.",
    ),
    (
        "05-top",
        "Top-down luxury macro render of the PHILEON GENT ring, oversized "
        "block letters filling the frame, sculptural signet proportions, "
        "woven textures visible around the perimeter, polished yellow gold "
        "with rich reflections, black background, ultra detailed "
        "craftsmanship, luxury editorial campaign aesthetic, masculine "
        "elegance, highly realistic jewelry photography. Square format, "
        "perfectly centered overhead view.",
    ),
    (
        "06-cigar-lounge",
        "PHILEON GENT ring photographed in an elite cigar lounge "
        "environment, resting beside a crystal whiskey glass and dark wood "
        "table, polished yellow gold reflecting warm amber lighting, black "
        "leather and brass details in background, old-world gentleman's "
        "club aesthetic, cinematic shadows, luxury jewelry campaign "
        "photography, hyper realistic gold textures, sophisticated "
        "masculine atmosphere. Square format, editorial framing.",
    ),
]

SYSTEM_MESSAGE = (
    "You are a museum-grade luxury jewelry product photographer. You "
    "render hyper-realistic editorial campaign images. Always honour the "
    "exact composition, lighting and material instructions in the prompt. "
    "Never add text overlays. Never add watermarks. Output a single "
    "square image at high resolution."
)


async def generate_one(api_key: str, slug: str, prompt: str) -> Path | None:
    """Generate one frame and write it to OUTPUT_DIR. Returns the file path."""
    session_id = f"gent-{slug}-{uuid.uuid4().hex[:8]}"
    chat = (
        LlmChat(api_key=api_key, session_id=session_id, system_message=SYSTEM_MESSAGE)
        .with_model("gemini", MODEL)
        .with_params(modalities=["image", "text"])
    )
    msg = UserMessage(text=prompt)

    print(f"[{slug}] generating…", flush=True)
    text, images = await chat.send_message_multimodal_response(msg)
    if text:
        # Truncate text response just in case it's long.
        print(f"[{slug}] model text: {text[:120]!r}", flush=True)
    if not images:
        print(f"[{slug}] !! no images returned", flush=True)
        return None

    img = images[0]
    mime = img.get("mime_type", "image/png")
    ext = ".png" if "png" in mime else ".jpg"
    out_path = OUTPUT_DIR / f"{slug}{ext}"
    out_path.write_bytes(base64.b64decode(img["data"]))
    print(f"[{slug}] saved -> {out_path}  ({out_path.stat().st_size} bytes)", flush=True)
    return out_path


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing from environment", file=sys.stderr)
        return 1

    results: list[tuple[str, Path | None]] = []
    for slug, prompt in PROMPTS:
        try:
            path = await generate_one(api_key, slug, prompt)
        except Exception as exc:  # noqa: BLE001 — surface real error & continue
            print(f"[{slug}] EXCEPTION: {type(exc).__name__}: {exc}", flush=True)
            path = None
        results.append((slug, path))

    print("\n=== GENT editorial generation summary ===")
    for slug, path in results:
        status = "OK" if path else "FAIL"
        print(f"  {status:4s}  {slug:18s}  {path if path else '-'}")

    failed = [s for s, p in results if p is None]
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
