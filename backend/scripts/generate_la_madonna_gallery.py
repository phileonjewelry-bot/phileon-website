"""LA MADONNA — Generate 4 missing gallery angles.

Reference: the two existing user-uploaded photos (with-hand hero + pedestal-only).
Goal: preserve the museum-grade visual identity exactly — same crimson pedestal,
deep-black room, gold corset, restrained reflections.

Generate:
  02_three_quarter — angled pedestal perspective showing dimensionality
  03_cup_detail    — extreme macro of upper corset structure + mesh
  04_top_view      — direct overhead showing interior structure
  06_angled_detail — macro angled showing gold piping + curvature

Slots 01 and 05 are user uploads — preserved untouched.
"""
from __future__ import annotations
import asyncio, base64, os, sys, uuid
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

REF_HERO = Path("/app/frontend/public/la-madonna/la-madonna-hero.png")           # with hand
REF_PED  = Path("/app/frontend/public/la-madonna/la-madonna-category.png")       # pedestal alone
OUT_DIR  = Path("/app/frontend/public/la-madonna")

IDENTITY_LOCK = (
    "Match the EXACT product identity in the two reference images:\n"
    "• Single ceremonial GOLD corset — polished antique-gold mesh weave with "
    "architectural boning, structural ribs, sculpted upper cups, reinforced "
    "perimeter edging.\n"
    "• Resting on a deep CRIMSON velvet pedestal (the reference pedestal).\n"
    "• Inside a private museum exhibition room: deep-BLACK background "
    "(#050505), dark stone surface, controlled warm-tungsten spotlight from "
    "above casting restrained gold reflections and a long sculptural shadow.\n"
    "• Mood: dangerous luxury, dark romance, haute couture relic, museum "
    "room before opening night.\n\n"
    "MATERIAL: polished gold ONLY. NO yellow tackiness, NO overcooked bloom, "
    "NO fantasy melted geometry. The corset must remain SHARP, STRUCTURED, "
    "and CEREMONIAL.\n\n"
    "STYLE: 8K photoreal couture-archive photography. NO floating sparkles, "
    "NO particles, NO text, NO logos, NO watermark, NO lingerie-store "
    "aesthetic, NO pink/red tones except the crimson pedestal."
)

NEGATIVE = (
    "DO NOT add a hand, a model, or any human element unless explicitly "
    "requested in the SHOT prompt. DO NOT change the corset's identity, "
    "color, or mesh structure between angles. DO NOT add fantasy bloom, "
    "halos, sparkles, or AI luxury clichés. DO NOT alter the museum-room "
    "atmosphere."
)

SHOTS = [
    {
        "slug": "la-madonna-02-three-quarter",
        "title": "ANGLE 02 — THREE QUARTER PEDESTAL",
        "prompt": (
            "Re-photograph the EXACT corset and pedestal from the references at "
            "a THREE-QUARTER perspective — camera approximately 30-40 degrees "
            "off-axis from straight-on, slightly above pedestal height. The "
            "viewer must immediately read the DIMENSIONALITY of the corset: "
            "front cups visible, side ribs visible falling away into shadow, "
            "the pedestal's depth and the back-edge fading into darkness. "
            "Same crimson pedestal, same museum room, same controlled overhead "
            "spotlight. Restrained gold reflections trace the structural ribs."
        ),
    },
    {
        "slug": "la-madonna-03-cup-detail",
        "title": "ANGLE 03 — CUP DETAIL MACRO",
        "prompt": (
            "Extreme MACRO close-up of the UPPER CORSET STRUCTURE — the "
            "shoulder-line / upper cup of the corset where the mesh meets a "
            "structural rib. Sharp focus on the interplay of polished gold "
            "MESH WEAVE and the polished gold STRUCTURAL EDGE. Surrounding "
            "structure falls into soft bokeh. Very shallow depth of field. "
            "Warm tungsten reflection traces the gold rib; mesh texture is "
            "fully readable. NO hand, NO model. Just the gold, the mesh, the "
            "structural edge."
        ),
    },
    {
        "slug": "la-madonna-04-top-view",
        "title": "ANGLE 04 — TOP VIEW",
        "prompt": (
            "DIRECT OVERHEAD shot, camera straight down looking into the "
            "INTERIOR of the corset. The viewer sees the corset as a "
            "SCULPTURAL VESSEL — the upper cups receding into the corset's "
            "interior cavity, the dark hollow inside, the polished gold rim "
            "of the upper opening, the structural ribs descending inward. "
            "Pedestal visible as a soft red halo around the corset. Museum "
            "room background, deep black, controlled overhead light. "
            "Architectural perspective — emphasizes the corset as built form, "
            "not garment."
        ),
    },
    {
        "slug": "la-madonna-06-angled-detail",
        "title": "ANGLE 06 — ANGLED DETAIL",
        "prompt": (
            "Macro ANGLED perspective showing the GOLD PIPING along a "
            "structural rib of the corset and the surrounding mesh weave. "
            "Camera is low and side-angled, ~15 degrees, focused on a single "
            "rib's CURVATURE — the way the polished gold edge sweeps from "
            "lower hip to upper cup. Visible: the rib itself (sharp, polished, "
            "luxurious), the mesh on both sides of the rib, the soft fall-off "
            "into shadow behind. Very shallow depth of field. Tungsten side-"
            "light skims the rib. Crimson pedestal blurred at frame bottom. "
            "Luxury finish close-up — the kind a couture archivist would "
            "shoot for catalogue documentation."
        ),
    },
]


def file_to_b64(p: Path) -> str:
    return base64.b64encode(p.read_bytes()).decode("utf-8")


async def generate_one(api_key: str, refs_b64: list[str], shot: dict) -> bool:
    out_path = OUT_DIR / f"{shot['slug']}.png"
    prompt = (
        f"{IDENTITY_LOCK}\n\n"
        f"NEGATIVE: {NEGATIVE}\n\n"
        f"SHOT — {shot['title']}:\n{shot['prompt']}"
    )
    chat = LlmChat(
        api_key=api_key,
        session_id=f"la-madonna-gallery-{shot['slug']}-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a couture-archive photographer documenting a single "
            "ceremonial gold corset on a crimson pedestal in a museum room. "
            "Preserve the exact visual identity from the reference images. "
            "Render ONE photoreal image at the requested angle. No text, "
            "logos, watermarks, or fantasy effects."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )
    msg = UserMessage(text=prompt, file_contents=[ImageContent(b) for b in refs_b64])
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
    if not REF_HERO.exists() or not REF_PED.exists():
        print("Refs missing", file=sys.stderr); return 2

    refs_b64 = [file_to_b64(REF_HERO), file_to_b64(REF_PED)]

    todo = [s for s in SHOTS if (slugs is None or s["slug"] in slugs)]
    for shot in todo:
        try:
            await generate_one(api_key, refs_b64, shot)
        except Exception as e:  # noqa: BLE001
            print(f"[ERR] {shot['slug']} — {type(e).__name__}: {e}")
            if "Budget" in str(e) or "BadRequest" in str(e):
                print("[stop] budget cap likely; halting."); break
    return 0


if __name__ == "__main__":
    args = sys.argv[1:] or None
    sys.exit(asyncio.run(main(args)))
