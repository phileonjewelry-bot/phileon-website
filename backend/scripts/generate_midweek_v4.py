"""
MIDWEEK v4 — final corrected design lock.

CLOSED slide-on bangle (continuous silver mesh loop, NO opening).
EXACTLY TWO black-diamond pavé barrel sections, BOTH on the FRONT of the
bangle, sitting close together on the same quadrant. The rest of the
bangle (back + sides) is plain polished silver mesh — NO diamonds, NO
extra pavé.

Identity reference: the user's authentic hero (01_hero.png).

Regen all 6 AI shots:
  02_single_felt
  03_on_wrist_solo
  04_on_wrist_stack
  05_macro
  06_side_profile
  07_lifestyle_table
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

# Use the authentic hero photo as the only reference. It contains the correct
# design (closed loop + 2 front pavé barrels per bangle).
REF = Path("/app/frontend/public/midweek/01_hero.png")
OUT_DIR = Path("/app/frontend/public/midweek")

PRODUCT_LOCK = (
    "MIDWEEK BANGLE — final design lock (use the reference image as the "
    "ground truth for cuff design):\n\n"
    "FORM: CLOSED SLIDE-ON BANGLE — a CONTINUOUS LOOP of polished sterling "
    "silver mesh with NO opening, NO gap, NO C-shape. The wearer slides it "
    "over the hand onto the wrist. The loop is closed all the way around.\n\n"
    "PAVÉ — EXACTLY TWO black-diamond barrels, BOTH ON THE FRONT:\n"
    "  • The two pavé barrels sit CLOSE TOGETHER on the SAME front-facing "
    "quadrant of the bangle (roughly 30–60 degrees apart).\n"
    "  • Each barrel is a small cylindrical pavé station encircling the "
    "weave at that point, set with tightly packed black diamonds and "
    "flanked by polished silver bevels.\n"
    "  • TOTAL: TWO pavé barrels per bangle, BOTH on the FRONT. NEVER more, "
    "NEVER fewer. NEVER any pavé on the back or sides of the bangle.\n\n"
    "BODY: continuous polished sterling silver woven mesh. The back and "
    "sides of the bangle are PLAIN SILVER MESH — no diamonds, no extra "
    "collars, no pavé anywhere except the two front barrels.\n\n"
    "MATERIAL: bright polished sterling silver. NO yellow gold, NO rose "
    "gold, NO gunmetal, NO open ends, NO C-shape, NO opening of any kind."
)

NEGATIVE = (
    "FAIL CRITERIA: more than 2 pavé sections per bangle, ANY pavé on the "
    "back or sides of the bangle, an OPEN C-SHAPE cuff with a visible gap, "
    "diamonds wrapping all the way around, additional collars, beads or "
    "stations along the body. Also FAIL: yellow/rose gold, gunmetal, logos, "
    "text, watermarks, AI shimmer flares."
)

GLOBAL_STYLE = (
    "MIDWEEK visual identity: dark billiard-room atmosphere, warm tungsten "
    "lighting, late-night luxury, quiet masculine confidence — successful "
    "people disappearing for a few quiet hours midweek.\n\n"
    "Cinematic shadows, controlled specular highlights on the silver weave, "
    "preserved silver realism, preserved woven texture detail. Editorial "
    "men's luxury campaign quality, 8K photoreal."
)

SHOTS = [
    {
        "slug": "02_single_felt",
        "title": "ANGLE 2 — SINGLE HERO OBJECT",
        "prompt": (
            "Single MIDWEEK closed-loop bangle isolated alone on deep GREEN "
            "BILLIARD FELT — no other props in frame. Low 3/4 camera angle "
            "slightly above the felt. The bangle's TWO front pavé barrels are "
            "rotated TOWARD the camera so both are clearly readable. The "
            "back of the bangle (plain silver mesh, no diamonds) curves away "
            "into shadow. Tight composition, bangle dominates frame.\n\n"
            "RULE: ONE closed bangle, EXACTLY TWO front pavé barrels, plain "
            "silver back. NO opening. NO C-shape."
        ),
    },
    {
        "slug": "03_on_wrist_solo",
        "title": "ANGLE 3 — ON-WRIST EDITORIAL (BLACK MODEL, ONE BANGLE)",
        "prompt": (
            "Editorial on-wrist photograph of a BLACK MAN wearing ONE "
            "MIDWEEK closed-loop slide-on bangle. The bangle has slid over "
            "the hand and rests on the wrist as a CONTINUOUS LOOP. The two "
            "front pavé barrels sit on the FRONT/TOP of the wrist (visible "
            "to camera), close together. The back of the bangle wraps under "
            "the wrist out of view (plain silver mesh, no diamonds visible). "
            "Wardrobe: NAVY or BLACK fine wool sleeve. Posture relaxed, "
            "natural, worn — not displayed. Warm tungsten lounge background, "
            "softly out of focus. Single warm rim-light on the silver weave.\n\n"
            "RULE: ONE bangle, closed loop, exactly 2 front pavé barrels "
            "visible on top of the wrist. NO opening. Subject must be a "
            "Black man in navy or black wardrobe."
        ),
    },
    {
        "slug": "04_on_wrist_stack",
        "title": "ANGLE 4 — DOUBLE STACK ON WRIST (BLACK MODEL, TWO BANGLES)",
        "prompt": (
            "Editorial on-wrist photograph of a BLACK MAN wearing TWO "
            "MIDWEEK closed-loop bangles stacked together on the same wrist. "
            "Each bangle is a continuous loop. The two bangles sit close, "
            "minimal spacing, intentionally stacked. Each bangle's TWO front "
            "pavé barrels sit on the front of the wrist (visible to camera) "
            "— a total of FOUR pavé barrels visible across the two bangles, "
            "all on the front. Backs of both bangles wrap under the wrist "
            "out of view. Wrist relaxed on the edge of a deep GREEN BILLIARD "
            "TABLE; wooden rail visible. Wardrobe: navy or black wool "
            "sleeve. Warm tungsten lounge lighting, softly bokeh'd.\n\n"
            "RULE: EXACTLY TWO closed-loop bangles. Each bangle has exactly "
            "2 front pavé barrels. NEVER any pavé on the back or sides of "
            "either bangle. NO openings. No watch, no other jewelry."
        ),
    },
    {
        "slug": "05_macro",
        "title": "ANGLE 5 — MACRO DETAIL",
        "prompt": (
            "Extreme macro detail of ONE BLACK-DIAMOND PAVÉ BARREL on a "
            "MIDWEEK closed-loop bangle, shown transitioning into the "
            "polished sterling silver woven body on each side. Sharp focus "
            "on the pavé barrel and the polished silver bevels flanking it; "
            "mesh weave runs out of frame on both sides (continuous silver, "
            "no diamonds visible elsewhere). Very shallow depth of field, "
            "warm tungsten reflection. Shows craftsmanship — pavé density, "
            "bevel finishing, weave texture.\n\n"
            "RULE: ONE pavé barrel in focus. The flanking weave is plain "
            "silver. NO additional pavé visible anywhere in frame."
        ),
    },
    {
        "slug": "06_side_profile",
        "title": "ANGLE 6 — SIDE PROFILE",
        "prompt": (
            "Low side-angle photograph of a single MIDWEEK closed-loop "
            "bangle on a deep walnut or black surface. The CLOSED CONTINUOUS "
            "LOOP must be unmistakable — viewer immediately reads this as a "
            "slide-on bangle, NOT a C-shape cuff. The TWO front pavé barrels "
            "sit on the upper edge of the loop (closest to camera), close "
            "together. The back/bottom curve of the loop is plain polished "
            "silver mesh, no diamonds. Side rim-light skims the weave; the "
            "inner curve casts deep ambient shadow. Shows wearability "
            "clarity: full closed circumference, weave depth, pavé "
            "construction.\n\n"
            "RULE: ONE closed bangle, exactly 2 front pavé barrels, plain "
            "silver everywhere else. NO opening, NO gap, NO C-shape."
        ),
    },
    {
        "slug": "07_lifestyle_table",
        "title": "ANGLE 7 — LIFESTYLE TABLE",
        "prompt": (
            "Single MIDWEEK closed-loop bangle resting alone on dark GREEN "
            "BILLIARD FELT. Partially out of focus in the same frame: a "
            "wooden CUE STICK laid diagonally, a CRYSTAL WHISKEY GLASS "
            "catching warm tungsten reflection, and a SOFTLY BLURRED "
            "billiard ball in the distance. The bangle is the BRIGHTEST "
            "OBJECT — props recede into deep shadow. The TWO front pavé "
            "barrels are visible on the front of the bangle, close "
            "together. The back of the loop curves away into shadow.\n\n"
            "RULE: ONE closed-loop bangle, exactly 2 front pavé barrels, "
            "plain silver back. No opening. Props supporting, not crowding."
        ),
    },
]


async def generate_one(api_key: str, ref_b64: str, shot: dict) -> bool:
    out_path = OUT_DIR / f"{shot['slug']}.png"
    prompt = (
        f"{PRODUCT_LOCK}\n\n"
        f"NEGATIVE: {NEGATIVE}\n\n"
        f"SHOT — {shot['title']}:\n{shot['prompt']}\n\n"
        f"GLOBAL STYLE: {GLOBAL_STYLE}"
    )

    chat = LlmChat(
        api_key=api_key,
        session_id=f"midweek-v4-{shot['slug']}-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury men's editorial campaign photographer. The "
            "MIDWEEK product is a CLOSED-LOOP slide-on bangle (continuous, "
            "no opening) with EXACTLY TWO black-diamond pavé barrels on the "
            "FRONT of the loop, close together. The back and sides of the "
            "loop are plain polished silver mesh. Match the reference image "
            "design exactly. Never render an open C-shape cuff. Never add "
            "pavé to the back or sides. Never add a third or fourth station."
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
    if not api_key: print("EMERGENT_LLM_KEY missing", file=sys.stderr); return 1
    if not REF.exists(): print(f"Reference missing: {REF}", file=sys.stderr); return 2

    ref_b64 = base64.b64encode(REF.read_bytes()).decode("utf-8")
    print(f"Loaded reference: {REF.stat().st_size//1024} KB")

    todo = [s for s in SHOTS if (slugs is None or s["slug"] in slugs)]
    for shot in todo:
        try:
            await generate_one(api_key, ref_b64, shot)
        except Exception as e:  # noqa: BLE001
            print(f"[ERR] {shot['slug']} — {type(e).__name__}: {e}")
            if "Budget" in str(e) or "BadRequest" in str(e):
                print("[stop] budget cap likely; halting.")
                break
    return 0


if __name__ == "__main__":
    args = sys.argv[1:] or None
    sys.exit(asyncio.run(main(args)))
