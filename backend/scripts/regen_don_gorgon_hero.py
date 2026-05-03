"""Regenerate 01_hero.png with the explicit cinematic 3/4 hero spec."""
from __future__ import annotations

import asyncio
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.generate_don_gorgon_home import fetch_reference_base64, OUTPUT_DIR  # noqa: E402
from dotenv import load_dotenv  # noqa: E402
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent  # noqa: E402
import base64  # noqa: E402

load_dotenv()

HERO_PROMPT = """
ULTRA-REALISTIC LUXURY JEWELRY CAMPAIGN — HERO SHOT.

A high-end cinematic 3/4 angled hero shot of a dome-shaped luxury men's ring
resting on a deep black velvet surface inside a dark jewelry display case.

THE RING (preserve EXACTLY — do not alter design or proportions):
- Solid WHITE GOLD only. Cool-toned, platinum-like silvery white. Absolutely
  NO yellow, rose, champagne, brass, bronze, or warm gold tones on any metal
  surface. Ignore the reference image's metal colour entirely — the metal is
  cool silvery white.
- A single vertical center rail set with deep blood-red princess-cut rubies
  (not pink) in a clean polished WHITE GOLD channel setting.
- Dense black pavé diamonds tightly packed across the entire domed face.
- Smooth sculpted 8mm band, strong architectural silhouette, dome ~25x18mm.

CRITICAL COMPOSITION:
- Camera at a LOW 3/4 angle — NOT front-facing, NOT symmetrical.
- Ring slightly rotated to create asymmetry and dominance in the frame.
- Ruby rail catches a directional highlight — not evenly lit.
- One side of the ring subtly falls into shadow for depth and weight.
- The ring OWNS the frame — sculptural, authoritative, dominant.

LIGHTING:
- Dramatic directional studio lighting from the upper left.
- Soft spotlight glow above the ring creating a subtle halo.
- Deep shadows underneath the ring for contrast and weight.
- High dynamic range with controlled specular highlights on the white gold.
- NO flat lighting, NO overexposure, NO uniform illumination.

BACKGROUND:
- Dark black / charcoal gradient environment.
- Luxury jewelry case edges barely visible in soft focus.
- Subtle depth falloff, cinematic atmosphere, black velvet texture.

MATERIAL ACCURACY (STRICT):
- White gold MUST appear cool silvery / platinum. If any pixel of metal reads
  yellow or warm gold the output is INCORRECT.
- Rubies MUST be deep blood red, not pink.
- Black pavé diamonds must remain tightly packed and consistent.

STYLE:
- Cartier-level luxury campaign photography.
- Editorial, dramatic, powerful presence.
- Ultra-sharp macro detail, shallow depth of field.
- 8K photoreal realism. No stylization, no CGI look, no cartoon.

DO NOT change ring design, alter stone placement, introduce warm gold tones,
or center the ring symmetrically.
""".strip()


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("missing key")
        return 1

    ref_b64 = await fetch_reference_base64()  # desaturated reference

    chat = LlmChat(
        api_key=api_key,
        session_id=f"don-gorgon-home-01-hero-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury jewelry campaign photographer shooting a cinematic "
            "asymmetric 3/4 hero. Preserve the referenced ring's silhouette and "
            "proportions but render the metal strictly as cool silvery white gold "
            "or platinum — never yellow or warm gold."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=HERO_PROMPT, file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f"no image, text={(text or '')[:120]}")
        return 2

    out = OUTPUT_DIR / "01_hero.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"OK -> {out} ({out.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
