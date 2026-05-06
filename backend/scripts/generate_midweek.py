"""
Generate the 5-shot luxury image set for MIDWEEK — Sterling Silver mesh cuff
with three black-diamond pavé barrel stations. Strict identity: SINGLE bracelet
only (the user reference shows two but we render only ONE).

Outputs: /app/frontend/public/midweek/01_hero.png ... 05_detail.png
Driver: Nano Banana via Emergent Universal LLM Key.
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

REF = Path("/app/frontend/public/midweek/_reference.png")
OUTPUT_DIR = Path("/app/frontend/public/midweek")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

LOCKED_PRODUCT = (
    "Match the EXACT cuff identity in the reference image:\n"
    "• Sterling silver MESH WEAVE bracelet — fine round-rope chain-mail texture, "
    "polished bright silver, NOT a flat snake-chain, NOT a herringbone.\n"
    "• THREE evenly spaced barrel-shaped stations encircling the cuff, each "
    "set with BLACK DIAMOND PAVÉ — small round black stones tightly packed "
    "around the entire barrel circumference. The barrels are flanked by "
    "polished silver bevels.\n"
    "• Cuff form factor: round profile, gently flexible, sits snugly on a "
    "man's wrist. Sized for a male wearer.\n\n"
    "ABSOLUTE CRITICAL RULE: render ONE single bracelet only — NEVER two, "
    "NEVER a stacked pair, NEVER a mirrored copy. The reference shows two "
    "but the final image must depict just one.\n\n"
    "MATERIAL: bright polished sterling silver (rhodium-finish look). "
    "NO yellow gold, NO rose gold, NO gunmetal."
)

NEGATIVE = (
    "DO NOT render two bracelets, a stacked pair, or any duplicate of the cuff. "
    "DO NOT include gemstones other than the black-diamond barrels. "
    "DO NOT add logos, text, watermarks, or engravings. "
    "DO NOT use yellow gold, rose gold, or gunmetal."
)

STYLE = (
    "Ultra-realistic luxury jewelry photography, men's editorial campaign quality. "
    "Cinematic moody lighting, deep wood-paneled / pool-room / late-night atmosphere "
    "where appropriate, controlled rim-light catching the silver weave, deep shadows "
    "for sculptural depth. 8K photoreal — no cartoon, no CGI, no stylization, "
    "no blown highlights, no shimmer flares, no watermark."
)

SHOTS = [
    (
        "01_hero",
        "HERO ENVIRONMENTAL. Single sterling silver mesh cuff resting on deep "
        "GREEN BILLIARD-FELT pool table, photographed at a low 3/4 angle. A "
        "crystal whisky tumbler with amber whisky sits softly out of focus in "
        "the upper left, a wooden cue rests diagonally in the upper right. "
        "Warm tungsten library lights bloom in the deep background against "
        "dark walnut paneling. The cuff is the sharp focal subject, all three "
        "black-diamond barrels visible. Mood: Tuesday-night-after-dinner, "
        "cigar room confidence."
    ),
    (
        "02_top_down",
        "TOP-DOWN STILL LIFE. Direct overhead view of a single sterling silver "
        "mesh cuff laid flat on a dark slate or charcoal stone surface. All "
        "three black-diamond barrel stations clearly visible and evenly spaced. "
        "Soft directional overhead lighting, minimal shadows, mesh weave fully "
        "legible. Editorial product still life."
    ),
    (
        "03_on_wrist",
        "ON-WRIST. Single sterling silver mesh cuff worn on a man's wrist — "
        "a refined male hand with a clean shirt cuff just visible (white or "
        "deep-navy fine wool, no logo). Soft dim ambient light, perhaps a "
        "low-key bar / lounge background out of focus. Focus on FIT and "
        "PROPORTION on the wrist, scale of the black-diamond barrels relative "
        "to the wrist bones. Quiet, masculine."
    ),
    (
        "04_macro",
        "MACRO DETAIL. Extreme close-up of ONE black-diamond barrel station "
        "meeting the silver mesh weave. Sharp focus on a small section of "
        "the pavé-set black diamonds and the polished silver bevel beside "
        "them. Mesh weave visible behind, falling into soft bokeh. Very shallow "
        "depth of field. Shows craftsmanship and stone integration."
    ),
    (
        "05_detail",
        "STRUCTURE / SIDE PROFILE. Single sterling silver mesh cuff photographed "
        "from a low side angle on a deep black or dark walnut surface. The "
        "round profile and gentle curvature of the cuff are emphasized; the "
        "mesh weave catches a single hard side-light, casting a long sculptural "
        "shadow. One black-diamond barrel sits in the foreground, the other "
        "two recede into focus along the band. Shows form and engineering."
    ),
]


def file_to_b64(p: Path) -> str:
    return base64.b64encode(p.read_bytes()).decode("utf-8")


async def generate_one(api_key: str, ref_b64: str, slug: str, shot_prompt: str) -> bool:
    out_path = OUTPUT_DIR / f"{slug}.png"
    if out_path.exists():
        print(f"[skip] {out_path} already exists")
        return True

    prompt = (
        f"{LOCKED_PRODUCT}\n\nSHOT: {shot_prompt}\n\nSTYLE: {STYLE}\n\nNEGATIVE: {NEGATIVE}"
    )

    chat = LlmChat(
        api_key=api_key,
        session_id=f"midweek-{slug}-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury men's jewelry campaign photographer. Generate ONE "
            "photoreal image of the referenced sterling silver mesh cuff with "
            "three black-diamond pavé barrels, at the requested angle. Render "
            "only one bracelet — never a pair. No logos, text, or watermark."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=prompt, file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)

    if not images:
        print(f"[FAIL] {slug} — no image. text={(text or '')[:200]!r}")
        return False

    img = images[0]
    img_bytes = base64.b64decode(img["data"])
    out_path.write_bytes(img_bytes)
    print(f"[ok]   {slug} -> {out_path} ({len(img_bytes)//1024} KB)")
    return True


async def main(slugs_filter: list[str] | None = None) -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing", file=sys.stderr)
        return 1

    if not REF.exists():
        print(f"Reference missing: {REF}", file=sys.stderr)
        return 2

    ref_b64 = file_to_b64(REF)
    print(f"Loaded reference: {REF.stat().st_size//1024} KB")

    todo = [s for s in SHOTS if (slugs_filter is None or s[0] in slugs_filter)]
    for slug, shot_prompt in todo:
        try:
            ok = await generate_one(api_key, ref_b64, slug, shot_prompt)
            if not ok:
                print(f"[stop] {slug} returned no image — halting to preserve budget.")
                break
        except Exception as e:  # noqa: BLE001
            print(f"[ERR]  {slug} — {type(e).__name__}: {e}")
            # Likely a budget cap — stop the run.
            if "Budget" in str(e) or "BadRequest" in str(e):
                print("[stop] looks like budget cap, halting remaining shots.")
                break

    print("\nFinal contents of /carapace-pave dir...")
    for p in sorted(OUTPUT_DIR.iterdir()):
        print(f" - /midweek/{p.name}")
    return 0


if __name__ == "__main__":
    args = sys.argv[1:] or None
    sys.exit(asyncio.run(main(args)))
