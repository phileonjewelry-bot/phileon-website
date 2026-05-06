"""Re-render MIDWEEK hero with a hardened single-bracelet lock.

The first hero pass replicated the user's reference too literally and produced
two bracelets. This re-shoot uses the macro shot (already a single bracelet)
as the geometry reference and bans pairs explicitly in both system + prompt.
"""
from __future__ import annotations

import asyncio
import base64
import os
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

# Use the already-passing top-down shot (single bracelet, 3 barrels visible)
# as the identity reference instead of the user's two-bracelet original.
REF = Path("/app/frontend/public/midweek/02_top_down.png")
OUT = Path("/app/frontend/public/midweek/01_hero.png")

PROMPT = (
    "Take the EXACT bracelet visible in the reference image (a single sterling "
    "silver mesh cuff with three black-diamond pavé barrel stations) and re-shoot "
    "it in a HERO ENVIRONMENTAL setting:\n\n"
    "• Resting alone on deep GREEN BILLIARD-FELT pool table\n"
    "• Low 3/4 angle, slight perspective\n"
    "• Crystal whisky tumbler with amber whisky softly out of focus, upper left\n"
    "• Wooden cue resting diagonally, upper right\n"
    "• Warm tungsten library lights blooming against dark walnut paneling, deep background\n"
    "• Cinematic moody Tuesday-night-after-dinner cigar-room atmosphere\n\n"
    "ABSOLUTE CRITICAL RULES (single-bracelet enforcement):\n"
    "1. ONE bracelet. Never two. Never a pair. Never stacked.\n"
    "2. Never duplicate or mirror the cuff anywhere in the frame.\n"
    "3. The bracelet must look like a single unique object, not a set.\n\n"
    "MATERIAL: bright polished sterling silver, no yellow gold, no rose gold.\n\n"
    "STYLE: 8K photoreal luxury jewelry editorial, cinematic lighting, no logos, "
    "no text, no watermark, no shimmer flares.\n\n"
    "NEGATIVE: NO duplicate bracelet. NO pair. NO stack. NO mirror image of the cuff."
)


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing", file=sys.stderr); return 1
    if not REF.exists():
        print(f"Reference missing: {REF}", file=sys.stderr); return 2

    ref_b64 = base64.b64encode(REF.read_bytes()).decode("utf-8")

    chat = LlmChat(
        api_key=api_key,
        session_id=f"midweek-hero-resnap-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury men's jewelry campaign photographer. The reference "
            "shows ONE single bracelet. Generate ONE photoreal hero image of that "
            "ONE bracelet in a new environmental setting. Never render two. Never "
            "render a pair. Never stack or duplicate the cuff. Single object only."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=PROMPT, file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)

    if not images:
        print(f"[FAIL] no image returned. text={(text or '')[:200]!r}"); return 3

    OUT.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[ok] {OUT} ({OUT.stat().st_size//1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
