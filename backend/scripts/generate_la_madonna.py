"""Generate a placeholder corset image for LA MADONNA holding page.

Mood: dangerous luxury, ceremonial, haute couture relic, dark romance.
Subject: gold corset on a dark mannequin, museum-style display.
Render once. User can swap with real photography later.
"""
from __future__ import annotations
import asyncio, base64, os, sys, uuid
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")

OUT = Path("/app/frontend/public/la-madonna/corset_placeholder.png")
OUT.parent.mkdir(parents=True, exist_ok=True)

PROMPT = (
    "A single ceremonial haute-couture corset rendered in polished antique GOLD, "
    "displayed on a faceless dark MANNEQUIN BUST inside a private museum exhibition "
    "room. The corset has architectural boning and intricate embroidery — relic-like, "
    "not lingerie. Pure deep-black background (#050505), soft warm tungsten spotlight "
    "from above casting a controlled gold halo on the corset and a long sculptural "
    "shadow behind it on dark stone. The mannequin shoulders are barely visible, "
    "fading into the black. Centered composition, vertical orientation. "
    "Mood: dangerous luxury, dark romance, haute couture relic, museum room before "
    "opening night.\n\n"
    "STYLE: 8K photoreal luxury campaign photography. NO floating sparkles, NO "
    "particles, NO text, NO logos, NO watermark, NO lingerie-store mannequin look, "
    "NO pink or red tones. Tones strictly: deep black, polished gold, warm shadow."
)


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing", file=sys.stderr); return 1

    chat = LlmChat(
        api_key=api_key,
        session_id=f"la-madonna-corset-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a haute-couture museum-exhibition photographer. Generate ONE "
            "vertical photoreal image of a ceremonial gold corset on a dark "
            "mannequin in a museum room. Restrained, ceremonial, dangerous luxury."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    text, images = await chat.send_message_multimodal_response(UserMessage(text=PROMPT))
    if not images:
        print(f"[FAIL] no image. text={(text or '')[:200]!r}"); return 2

    OUT.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[ok] {OUT} ({OUT.stat().st_size//1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
