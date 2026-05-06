"""Re-render the MIDWEEK hero (slot 1) to match the FINAL design lock:
slip-on open C-shape cuff, EXACTLY two black-diamond pavé end caps, no
middle pavé. Two cuffs stacked naturally on green felt in a dark
billiard-room environment.

Identity reference: the just-regened single-felt shot (02_single_felt.png)
which already passes the design lock. We do NOT use the user's original
3-section reference photo because it tempts the model to copy the wrong
pavé count.
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

REF = Path("/app/frontend/public/midweek/02_single_felt.png")
OUT = Path("/app/frontend/public/midweek/01_hero.png")

PROMPT = (
    "Take the EXACT cuff visible in the reference image — a slip-on OPEN "
    "C-SHAPE sterling silver woven cuff with EXACTLY TWO black-diamond pavé "
    "END CAPS at the open terminals (and NO middle pavé) — and re-shoot it "
    "with TWO COPIES of the same cuff stacked naturally in a HERO STACK "
    "composition.\n\n"
    "SCENE — DARK BILLIARD ROOM:\n"
    "• Deep GREEN BILLIARD-FELT pool table\n"
    "• Warm tungsten lighting from above (lamp-shade glow), dark walnut "
    "panelling deep in the background\n"
    "• Quiet after-hours luxury atmosphere — successful people disappearing "
    "for a few quiet hours midweek\n\n"
    "COMPOSITION — TWO CUFFS STACKED NATURALLY:\n"
    "• Two slip-on open cuffs, IDENTICAL to the reference cuff in every "
    "way (same weave, same TWO end-cap pavé layout, same open C-shape)\n"
    "• Asymmetrical, lived-in placement: one cuff lying flat on the felt, "
    "the second cuff slightly OVERLAPPING the first (resting partially on "
    "top of it). Open terminals of both cuffs visible. Black pavé end "
    "caps clearly readable on at least three of the four total caps.\n"
    "• Feels worn / placed-after-a-late-game — NOT a centered showroom "
    "product display, NOT a symmetrical catalog layout.\n\n"
    "OPTIONAL SUBTLE ENVIRONMENTAL ELEMENTS (softly out of focus, never "
    "competing with the cuffs):\n"
    "• A wooden cue stick partially visible at one edge of the frame\n"
    "• A softly blurred billiard ball further into the background\n"
    "• A faint reflection of an amber-whisky tumbler in the deep "
    "background bokeh — but the glass itself can be cropped or barely-"
    "implied; do not put it in focus.\n\n"
    "RULES — STRICT, FAIL CRITERIA:\n"
    "• EXACTLY TWO cuffs. Never one, never three.\n"
    "• Each cuff must be a SLIP-ON OPEN C-SHAPE with a clearly visible gap "
    "at the open end. NEVER a closed bangle.\n"
    "• Each cuff has EXACTLY TWO black-diamond pavé end caps at the open "
    "terminals. NO middle pavé. NO third or fourth pavé station. NO extra "
    "collars. NO continuous black-diamond pattern around the body.\n"
    "• Both cuffs are identical in design. NO design variation between them.\n"
    "• The jewelry must be the BRIGHTEST object in the frame. The "
    "environment recedes into shadow.\n\n"
    "STYLE: 8K photoreal luxury editorial, cinematic moody lighting, "
    "realistic polished sterling silver reflections, preserved woven "
    "texture detail. NO logos, text, watermarks, or AI shimmer artefacts. "
    "NO neon club lighting, NO tropical elements, NO overexposed silver, "
    "NO flashy luxury clichés."
)


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key: print("EMERGENT_LLM_KEY missing", file=sys.stderr); return 1
    if not REF.exists(): print(f"Reference missing: {REF}", file=sys.stderr); return 2

    ref_b64 = base64.b64encode(REF.read_bytes()).decode("utf-8")

    chat = LlmChat(
        api_key=api_key,
        session_id=f"midweek-hero-final-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury men's editorial campaign photographer. The "
            "product is a SLIP-ON OPEN CUFF (C-shape) with EXACTLY TWO "
            "black-diamond pavé end caps at the open terminals — never "
            "more, never less, never in the middle. Render TWO copies of "
            "this cuff stacked naturally in a dark billiard-room hero "
            "composition. No logos, text, or watermark."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=PROMPT, file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)

    if not images:
        print(f"[FAIL] no image. text={(text or '')[:200]!r}"); return 3

    OUT.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[ok] {OUT} ({OUT.stat().st_size//1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
