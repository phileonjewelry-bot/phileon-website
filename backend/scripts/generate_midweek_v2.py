"""
MIDWEEK — strict 7-angle campaign lock (regen + new shots).

Generates ONLY the four shots that are missing or need correction:
  ANGLE 2 — single cuff on green felt, low 3/4
  ANGLE 3 — Black model, navy/black wardrobe, ONE cuff
  ANGLE 4 — Black model, TWO cuffs stacked, at billiard table
  ANGLE 7 — lifestyle table shot (cue + whiskey + blurred ball)

KEEPS unchanged:
  ANGLE 1 — user's authentic two-cuff hero (01_hero.png)
  ANGLE 5 — macro (04_macro.png)
  ANGLE 6 — side profile (05_detail.png)

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
OUT_DIR = Path("/app/frontend/public/midweek")

PRODUCT_LOCK = (
    "MATCH the cuff identity in the reference image EXACTLY:\n"
    "• Sterling silver MESH WEAVE bracelet — fine round-rope chain-mail texture, "
    "polished bright silver. NOT a flat snake chain. NOT herringbone.\n"
    "• EXACTLY THREE evenly spaced barrel-shaped pavé stations encircling the "
    "cuff (NEVER more than three, NEVER fewer). Each barrel is set with BLACK "
    "DIAMOND PAVÉ — small round black stones tightly packed around the entire "
    "barrel circumference, flanked by polished silver bevels.\n"
    "• Cuff form factor: round profile, gently flexible, masculine sizing.\n\n"
    "MATERIAL: bright polished sterling silver. NO yellow gold. NO rose gold. "
    "NO gunmetal."
)

GLOBAL_STYLE = (
    "MIDWEEK visual identity: dark billiard-room atmosphere, warm tungsten "
    "lighting, late-night luxury, quiet masculine confidence. Successful "
    "people disappearing for a few quiet hours midweek.\n\n"
    "Cinematic shadows, controlled specular highlights on the silver weave, "
    "preserved silver realism, preserved woven texture detail. Editorial "
    "men's luxury campaign quality, 8K photoreal.\n\n"
    "DO NOT: tropical elements, neon club lighting, overexposed silver, "
    "flashy luxury clichés, unnecessary props, nightlife advertising feel, "
    "logos, watermarks, text, engravings."
)

SHOTS = [
    {
        "slug": "02_single_felt",
        "title": "ANGLE 2 — SINGLE HERO OBJECT",
        "prompt": (
            "Single MIDWEEK cuff isolated alone on deep GREEN BILLIARD FELT — "
            "no other props in frame. Low 3/4 camera angle slightly above the "
            "felt surface. Silver weave clearly visible across the entire body, "
            "all THREE black pavé caps catching controlled warm tungsten light. "
            "Tight composition, cuff dominates the frame. Soft fall-off into "
            "darker felt around the edges.\n\n"
            "RULE: ONE bracelet only. Never two. No duplicate, no mirror."
        ),
    },
    {
        "slug": "03_on_wrist_solo",
        "title": "ANGLE 3 — ON-WRIST EDITORIAL (BLACK MODEL, ONE CUFF)",
        "prompt": (
            "Editorial on-wrist photograph of a BLACK MAN wearing ONE single "
            "MIDWEEK cuff on his wrist. Subject's wardrobe is NAVY or BLACK "
            "wool — could be a fine knit sleeve or a tailored shirt cuff in "
            "deep colour. Posture relaxed and natural — the cuff is worn, not "
            "displayed. Camera framing: forearm and wrist, hand may rest "
            "casually on a dark surface or fall naturally at his side. Warm "
            "tungsten ambient lighting from a billiard / lounge background, "
            "softly out of focus. The cuff catches a single warm rim-light.\n\n"
            "Mood: late-night confidence. Quiet. Subtle luxury styling. No "
            "exaggerated posing. No watch, no other jewelry on the wrist.\n\n"
            "RULE: ONE cuff only on the wrist. Never two."
        ),
    },
    {
        "slug": "04_on_wrist_stack",
        "title": "ANGLE 4 — DOUBLE STACK ON WRIST (BLACK MODEL, TWO CUFFS)",
        "prompt": (
            "Editorial on-wrist photograph of a BLACK MAN wearing TWO MIDWEEK "
            "cuffs stacked together on the same wrist. The two cuffs sit "
            "close — minimal spacing, intentionally stacked, no gap between "
            "them. Wrist relaxed on the edge of a deep GREEN BILLIARD TABLE; "
            "wooden rail of the table partially visible. Wardrobe: navy or "
            "black wool sleeve, fine and refined. Warm tungsten lounge "
            "lighting in the background, softly bokeh'd. The two cuffs catch "
            "a single warm rim-light along the polished silver edges.\n\n"
            "Composition shows the LAYERING IDENTITY clearly — the viewer "
            "must immediately understand that these are two of the same piece "
            "stacked. No watch, no other jewelry. No cigar in hand. No glass "
            "in hand. Just the wrist and the table.\n\n"
            "RULE: EXACTLY TWO cuffs on the wrist, stacked tightly. Never one, "
            "never three. The cuff identity is identical between the two."
        ),
    },
    {
        "slug": "07_lifestyle_table",
        "title": "ANGLE 7 — LIFESTYLE TABLE SHOT",
        "prompt": (
            "Single MIDWEEK cuff resting alone on dark green billiard felt. "
            "In the same frame, partially out of focus: a wooden CUE STICK "
            "laid diagonally, a CRYSTAL WHISKEY GLASS catching a warm "
            "reflection of tungsten lamp light, and a SOFTLY BLURRED billiard "
            "ball in the distance. The cuff is the BRIGHTEST OBJECT in the "
            "frame — the props recede into deep shadow. Composition is "
            "restrained: do not overcrowd the scene. Just enough environment "
            "to read 'after-hours private lounge' without looking staged.\n\n"
            "RULE: ONE cuff only. Never two."
        ),
    },
]


async def generate_one(api_key: str, ref_b64: str, shot: dict) -> bool:
    out_path = OUT_DIR / f"{shot['slug']}.png"
    prompt = (
        f"{PRODUCT_LOCK}\n\n"
        f"SHOT — {shot['title']}:\n{shot['prompt']}\n\n"
        f"GLOBAL STYLE: {GLOBAL_STYLE}"
    )

    chat = LlmChat(
        api_key=api_key,
        session_id=f"midweek-shoot-{shot['slug']}-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury men's editorial campaign photographer. Generate "
            "ONE photoreal image of the referenced sterling silver mesh cuff "
            "(three black-diamond pavé barrels) at the requested angle. "
            "Follow the cuff-count rule in the prompt EXACTLY (one, two, or "
            "stacked as specified). No logos, no text, no watermark, no AI "
            "shimmer artefacts."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=prompt, file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)

    if not images:
        print(f"[FAIL] {shot['slug']} — no image. text={(text or '')[:200]!r}")
        return False

    out_path.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[ok]   {shot['slug']} -> {out_path} ({out_path.stat().st_size//1024} KB)")
    return True


async def main(slugs: list[str] | None = None) -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing", file=sys.stderr); return 1

    if not REF.exists():
        print(f"Reference missing: {REF}", file=sys.stderr); return 2

    ref_b64 = base64.b64encode(REF.read_bytes()).decode("utf-8")
    print(f"Loaded reference: {REF.stat().st_size//1024} KB")

    todo = [s for s in SHOTS if (slugs is None or s["slug"] in slugs)]
    for shot in todo:
        try:
            await generate_one(api_key, ref_b64, shot)
        except Exception as e:  # noqa: BLE001
            print(f"[ERR] {shot['slug']} — {type(e).__name__}: {e}")
            if "Budget" in str(e) or "BadRequest" in str(e):
                print("[stop] looks like budget cap, halting remaining shots.")
                break

    print("\nFinal contents of midweek dir:")
    for p in sorted(OUT_DIR.iterdir()):
        print(f" - /midweek/{p.name}")
    return 0


if __name__ == "__main__":
    args = sys.argv[1:] or None
    sys.exit(asyncio.run(main(args)))
