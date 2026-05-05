"""
Regenerate THE CARAPACE — slots 1 (hero), 3 (side profile), 4 (macro) — to
match the ELONGATED OVAL SHIELD geometry of the user's authentic photos
(/carapace/07_top_real.png and /carapace/08_on_hand_real.png).

HARD PASS CRITERION (per user): the dome must read as an ELONGATED OVAL
SHIELD. If the silhouette reads as a round ball, sphere, or hemisphere, the
generation FAILS.

Outputs (NEW filenames, original lock files are preserved):
  /app/frontend/public/carapace/09_hero_oval.png
  /app/frontend/public/carapace/10_side_oval.png
  /app/frontend/public/carapace/11_macro_oval.png
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

REF_TOP   = Path("/app/frontend/public/carapace/07_top_real.png")
REF_HAND  = Path("/app/frontend/public/carapace/08_on_hand_real.png")

OUTPUT_DIR = Path("/app/frontend/public/carapace")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

LOCKED_PRODUCT = (
    "Match the EXACT shape, silhouette, and lattice geometry of the cuff in "
    "the two reference images.\n\n"
    "MANDATORY GEOMETRY — pass/fail criterion:\n"
    "• The ring's body must read as an ELONGATED OVAL SHIELD when viewed "
    "from above. NOT round, NOT spherical, NOT a ball, NOT a hemisphere.\n"
    "• The dome is LONGER than it is wide — clearly oblong / oval shaped, "
    "with the long axis running along the finger.\n"
    "• Open lattice exoskeleton built from large, rounded, organic cells "
    "with smooth flowing edges (NOT a tight honeycomb mesh, NOT small dense "
    "hexagons). Cells are spacious, irregularly hexagonal/rounded, similar "
    "in size to the cells in the reference photos.\n"
    "• The lattice walls are smooth, polished, sculptural — bone/coral-like.\n\n"
    "MATERIAL: Polished 10K yellow gold. Warm yellow-gold tone with crisp "
    "specular highlights. NOT rose gold, NOT white gold, NOT platinum, "
    "NOT bronze.\n\n"
    "PRODUCT IDENTITY: A statement ring. The lattice dome is the only subject. "
    "No gemstones, no pavé, no engraving, no logo, no text."
)

NEGATIVE = (
    "DO NOT generate a round/spherical/ball-shaped dome. "
    "DO NOT generate a tight dense honeycomb mesh with tiny cells. "
    "DO NOT generate rose gold, white gold, platinum, or bronze. "
    "DO NOT add diamonds, gemstones, pavé, engraving, or text."
)

STYLE = (
    "Ultra-realistic luxury jewelry photography, Cartier / Buccellati editorial "
    "campaign quality. Cinematic high-contrast lighting, deep black or dark "
    "charcoal backgrounds, sharp product focus, controlled specular highlights "
    "on the polished gold edges, deep shadows for sculptural depth. "
    "8K photoreal — no cartoon, no CGI, no stylization, no blown highlights, "
    "no watermark."
)

SHOTS = [
    (
        "09_hero_oval",
        "HERO 3/4 ANGLE. The ring photographed at a low 3/4 perspective on a "
        "dark velvet or charcoal seamless surface. The ELONGATED OVAL SHIELD "
        "silhouette must be obvious — the dome is clearly longer than wide. "
        "Dramatic directional key light from upper left rakes across the lattice, "
        "throwing crisp golden highlights along the spines of the cells while "
        "deep shadows fall through the openings. The viewer must immediately "
        "read this as an oblong sculptural exoskeleton, not a round ball."
    ),
    (
        "10_side_oval",
        "SIDE PROFILE. Pure side view at lens height. The ring is shown along "
        "its long axis — it must look LONG and LOW, like a rounded shield laid "
        "on its side, not a circular dome. The CURVATURE rises gently from the "
        "shank, peaks at the centre, and falls away on the other side — the "
        "outline is clearly oblong. Side rim-light skims the polished walls, "
        "negative space inside the lattice is dark and deep. Dark background."
    ),
    (
        "11_macro_oval",
        "MACRO DETAIL. Extreme close-up on a section of the lattice where 4–6 "
        "cells are in sharp focus, with the rest of the elongated dome falling "
        "into soft bokeh. The cells are LARGE, rounded, organically shaped, "
        "with smooth polished gold walls — NOT small dense hexagons. The "
        "macro must communicate the SCALE of the cells (each cell roughly "
        "the size of a fingernail-tip in real life). Shallow depth of field, "
        "warm gold reflections, dark ambient background."
    ),
]


def file_to_b64(p: Path) -> str:
    return base64.b64encode(p.read_bytes()).decode("utf-8")


async def generate_one(api_key: str, refs_b64: list[str], slug: str, shot_prompt: str) -> None:
    out_path = OUTPUT_DIR / f"{slug}.png"

    prompt = (
        f"{LOCKED_PRODUCT}\n\n"
        f"SHOT: {shot_prompt}\n\n"
        f"STYLE: {STYLE}\n\n"
        f"NEGATIVE: {NEGATIVE}"
    )

    chat = LlmChat(
        api_key=api_key,
        session_id=f"carapace-oval-{slug}-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury jewelry campaign photographer. Generate ONE "
            "photoreal image of the referenced ELONGATED OVAL SHIELD lattice "
            "ring at the requested angle. Preserve the oval geometry and large "
            "rounded lattice cells visible in the references. The ring must NOT "
            "appear round/spherical and the cells must NOT be a tight honeycomb."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(
        text=prompt,
        file_contents=[ImageContent(b) for b in refs_b64],
    )
    text, images = await chat.send_message_multimodal_response(msg)

    if not images:
        print(f"[FAIL] {slug} — no image returned. text={(text or '')[:160]!r}")
        return

    img = images[0]
    img_bytes = base64.b64decode(img["data"])
    out_path.write_bytes(img_bytes)
    print(f"[ok]   {slug} -> {out_path} ({len(img_bytes)//1024} KB)")


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing in /app/backend/.env", file=sys.stderr)
        return 1

    if not REF_TOP.exists() or not REF_HAND.exists():
        print(f"References missing:\n  {REF_TOP}\n  {REF_HAND}", file=sys.stderr)
        return 2

    refs_b64 = [file_to_b64(REF_TOP), file_to_b64(REF_HAND)]
    print(
        f"Loaded references: top={REF_TOP.stat().st_size//1024} KB, "
        f"hand={REF_HAND.stat().st_size//1024} KB"
    )

    for slug, shot_prompt in SHOTS:
        try:
            await generate_one(api_key, refs_b64, slug, shot_prompt)
        except Exception as e:  # noqa: BLE001
            print(f"[ERR]  {slug} — {type(e).__name__}: {e}")

    print("\nDone.")
    for p in sorted(OUTPUT_DIR.iterdir()):
        print(f" - /carapace/{p.name}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
