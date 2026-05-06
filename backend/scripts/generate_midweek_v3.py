"""
MIDWEEK v3 — design correction.

NEW design lock:
  • SLIP-ON OPEN CUFF (C-shape, not a closed bangle)
  • EXACTLY TWO black-diamond pavé END CAPS — one at each open terminal
  • NO middle pavé, NO third or fourth station, NO beads around the body
  • Continuous polished sterling silver woven mesh body between the two caps

Regen targets (all 6 AI shots — slot 1 user photo is preserved):
  02_single_felt        — single cuff on green felt, low 3/4
  03_on_wrist_solo      — Black model, 1 slip-on cuff, navy/black wardrobe
  04_on_wrist_stack     — Black model, 2 slip-on cuffs stacked
  05_macro              — macro on one end cap meeting the weave
  06_side_profile       — low side angle showing the C-shape and both end caps
  07_lifestyle_table    — single cuff with cue + whiskey + blurred ball
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
    "MIDWEEK CUFF — strict design lock. The reference image is for SILVER "
    "WEAVE TEXTURE only — IGNORE the number and placement of any pavé "
    "sections in the reference. The actual product is:\n\n"
    "FORM: SLIP-ON OPEN CUFF, C-shape. The cuff is NOT a closed circular "
    "bangle. It has two visible OPEN ENDS where the wearer slips it on / "
    "off the wrist. There is a deliberate small gap between the two open "
    "ends.\n\n"
    "PAVÉ — EXACTLY TWO black-diamond pavé END CAPS:\n"
    "  • ONE black-diamond pavé cap terminates the LEFT open end of the cuff\n"
    "  • ONE black-diamond pavé cap terminates the RIGHT open end of the cuff\n"
    "  • TOTAL: TWO pavé sections, BOTH at the open terminals, NEVER any in "
    "the middle, NEVER a third or fourth station, NEVER beads around the body.\n\n"
    "BODY: rugged polished sterling silver woven MESH (round-rope chain-mail "
    "texture). Continuous silver from end-cap to end-cap with no breaks, no "
    "extra pavé collars, no middle bands. Bright polished finish.\n\n"
    "MATERIAL: bright polished sterling silver. NO yellow gold, NO rose gold, "
    "NO gunmetal."
)

GLOBAL_STYLE = (
    "MIDWEEK visual identity: dark billiard-room atmosphere, warm tungsten "
    "lighting, late-night luxury, quiet masculine confidence — successful "
    "people disappearing for a few quiet hours midweek.\n\n"
    "Cinematic shadows, controlled specular highlights on the silver weave, "
    "preserved silver realism, preserved woven texture detail. Editorial "
    "men's luxury campaign quality, 8K photoreal.\n\n"
    "DO NOT: tropical elements, neon club lighting, overexposed silver, "
    "flashy luxury clichés, unnecessary props, nightlife advertising feel, "
    "logos, watermarks, text, engravings.\n\n"
    "FAIL if: more than 2 black-diamond sections appear on any cuff, OR if "
    "the cuff is rendered as a closed circular bangle without a visible gap."
)

SHOTS = [
    {
        "slug": "02_single_felt",
        "title": "ANGLE 2 — SINGLE HERO OBJECT",
        "prompt": (
            "Single MIDWEEK slip-on cuff isolated alone on deep GREEN BILLIARD "
            "FELT — no other props in frame. Low 3/4 camera angle slightly "
            "above the felt. Both BLACK PAVÉ END CAPS clearly visible at the "
            "two open terminals; the cuff lies with its open gap rotated "
            "slightly toward camera so both caps catch warm tungsten light. "
            "Continuous silver weave runs from one cap to the other. Tight "
            "composition, cuff dominates the frame, soft fall-off into "
            "darker felt around the edges.\n\n"
            "RULE: ONE open cuff, EXACTLY TWO end-cap pavé sections, no "
            "middle pavé."
        ),
    },
    {
        "slug": "03_on_wrist_solo",
        "title": "ANGLE 3 — ON-WRIST EDITORIAL (BLACK MODEL, ONE OPEN CUFF)",
        "prompt": (
            "Editorial on-wrist photograph of a BLACK MAN wearing ONE slip-on "
            "MIDWEEK cuff on his wrist. Subject's wardrobe is NAVY or BLACK "
            "wool — fine knit sleeve or tailored shirt cuff. Posture relaxed "
            "and natural; the cuff is worn, not displayed. The OPEN GAP of "
            "the cuff sits at the underside of the wrist (anatomically correct "
            "for a slip-on cuff). At least ONE black-diamond pavé end cap is "
            "clearly visible from the camera angle; the second end cap may "
            "wrap around the wrist out of frame. Silver weave catches a "
            "single warm rim-light. Warm tungsten lounge background, softly "
            "out of focus.\n\n"
            "RULE: ONE open cuff with ONLY two end-cap pavé sections. No "
            "middle pavé. Subject must be a Black man in navy or black."
        ),
    },
    {
        "slug": "04_on_wrist_stack",
        "title": "ANGLE 4 — DOUBLE STACK ON WRIST (BLACK MODEL, TWO OPEN CUFFS)",
        "prompt": (
            "Editorial on-wrist photograph of a BLACK MAN wearing TWO MIDWEEK "
            "slip-on cuffs stacked together on the same wrist. Both cuffs are "
            "open C-shape; their open gaps are oriented in the SAME DIRECTION "
            "(both gaps facing the underside of the wrist), giving a clean "
            "parallel stack. The two cuffs sit close — minimal spacing, "
            "intentionally stacked. Wrist relaxed on the edge of a deep GREEN "
            "BILLIARD TABLE; wooden rail of the table partially visible. "
            "Wardrobe: navy or black wool sleeve, fine and refined. Warm "
            "tungsten lounge lighting, softly bokeh'd background. The polished "
            "silver weave of both cuffs catches a single warm rim-light.\n\n"
            "Each cuff has EXACTLY TWO black-diamond pavé end caps (one at "
            "each open terminal). NO middle pavé on either cuff.\n\n"
            "RULE: EXACTLY TWO cuffs on the wrist (one stack of two). Each "
            "cuff has only TWO end-cap pavé sections. No watch, no other "
            "jewelry, no cigar, no glass in hand."
        ),
    },
    {
        "slug": "05_macro",
        "title": "ANGLE 5 — MACRO DETAIL",
        "prompt": (
            "Extreme macro detail of ONE BLACK-DIAMOND PAVÉ END CAP at the "
            "open terminal of a slip-on MIDWEEK cuff, transitioning into the "
            "polished sterling silver woven body. Sharp focus on a small "
            "section of the pavé black diamonds and the polished silver bevel "
            "where the cap meets the weave. Mesh weave visible behind the "
            "cap, falling into soft bokeh. Very shallow depth of field. Warm "
            "directional tungsten reflections. Shows craftsmanship — pavé "
            "stone density, bevel finishing, weave texture.\n\n"
            "RULE: only ONE end cap visible (or partial second cap softly "
            "out of focus in deep bokeh). NO middle pavé visible anywhere "
            "in the body. Single cuff."
        ),
    },
    {
        "slug": "06_side_profile",
        "title": "ANGLE 6 — SIDE PROFILE",
        "prompt": (
            "Low side-angle photograph of a single MIDWEEK slip-on cuff on a "
            "deep walnut or black surface. The C-SHAPE of the open cuff is "
            "the focal subject — the viewer must immediately read this as a "
            "slip-on, NOT a closed bangle. BOTH black-diamond end caps are "
            "visible at the open terminals. Side rim-light skims across the "
            "polished silver weave, the inner curve casts a deep ambient "
            "shadow. Shows wearability clarity: cuff thickness, weave depth, "
            "and end-cap construction.\n\n"
            "RULE: ONE open C-shape cuff. EXACTLY two end-cap pavé sections. "
            "The open gap MUST be visible. No middle pavé."
        ),
    },
    {
        "slug": "07_lifestyle_table",
        "title": "ANGLE 7 — LIFESTYLE TABLE",
        "prompt": (
            "Single MIDWEEK slip-on cuff resting alone on dark GREEN BILLIARD "
            "FELT. Partially out of focus in the same frame: a wooden CUE "
            "STICK laid diagonally, a CRYSTAL WHISKEY GLASS catching warm "
            "tungsten reflection, and a SOFTLY BLURRED billiard ball in the "
            "distance. The cuff is the BRIGHTEST OBJECT — props recede into "
            "deep shadow. Both BLACK PAVÉ END CAPS are visible at the open "
            "terminals; continuous silver weave runs between them. "
            "Composition restrained, props supporting, not crowding.\n\n"
            "RULE: ONE open slip-on cuff with EXACTLY two end-cap pavé "
            "sections. No middle pavé."
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
        session_id=f"midweek-v3-{shot['slug']}-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury men's editorial campaign photographer. The "
            "product is a SLIP-ON OPEN CUFF (C-shape) with EXACTLY TWO black-"
            "diamond pavé end caps at the open terminals — never more, never "
            "less, never in the middle. The reference image's pavé layout is "
            "WRONG and should be ignored; only use it for silver weave texture. "
            "Render the cuff as a slip-on with a visible open gap. No logos, "
            "no text, no watermark."
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
