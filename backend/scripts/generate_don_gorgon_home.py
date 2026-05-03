"""
Generate the 10-shot luxury image set for THE DON GORGON — HOME (black pavé).
Uses Gemini Nano Banana (gemini-3.1-flash-image-preview) with a locked reference
image so product identity is preserved across every angle.

Outputs: /app/frontend/public/don-gorgon/home/01_hero.png ... 10_carousel.png

Run:
  cd /app/backend && python -m scripts.generate_don_gorgon_home
"""
from __future__ import annotations

import asyncio
import base64
import os
import sys
import uuid
from pathlib import Path

import httpx
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv()

REFERENCE_URL = (
    "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/"
    "artifacts/62xv6x0s_1000147741.png"
)

OUTPUT_DIR = Path("/app/frontend/public/don-gorgon/home")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

LOCKED_PRODUCT = (
    "Use the ring in the reference image. Preserve its identity EXACTLY: "
    "bold men's statement ring, large dome signet silhouette ~25mm x 18mm top, "
    "8mm wide heavy band, 3/4 pavé coverage of small BLACK round stones across "
    "the domed face, a single vertical curved ruby rail/channel running across "
    "the top with ~12 deep red princess-cut rubies set in polished gold, "
    "heavy architectural volume. DO NOT change the silhouette, proportions, "
    "band thickness, ruby count or placement, rail direction, pavé density, "
    "or metal colour. Only the composition, framing, lighting, camera angle "
    "and surroundings change between shots."
)

STYLE = (
    "Ultra-realistic luxury jewelry photography, Cartier-level campaign quality, "
    "cinematic low-key lighting, deep black velvet and warm cream leather jewelry "
    "box, polished gold accents, shallow depth of field, rich contrast, realistic "
    "reflections, sharp product detail. No cartoon, no CGI, no plastic skin, "
    "no warped jewelry or fingers, no extra gemstones, no white pavé, no silver-"
    "only look, no horizontal ruby rail, no extra rails, no watch, no bracelet, "
    "no text, no watermark."
)

SHOTS = [
    (
        "01_hero",
        "PRIMARY PRODUCT HERO. 3/4 angle of the ring sitting inside a warm cream "
        "leather jewelry box. Ring large in frame, ruby rail facing camera at a "
        "slight diagonal, dome curvature visible, BLACK pavé crisp, polished gold "
        "edges visible, soft champagne highlights.",
    ),
    (
        "02_front",
        "STRAIGHT FRONT PRODUCT. Ring centered inside cream leather box, front-"
        "facing symmetry, ruby rail perfectly vertical and centered, both BLACK "
        "pavé sides balanced, clean presentation, sharp focus, controlled sparkle.",
    ),
    (
        "03_topdown",
        "TOP-DOWN PRODUCT. Slight overhead angle showing the full dome shape and "
        "3/4 BLACK pavé coverage, ruby rail running cleanly through the form, "
        "BLACK pavé texture visible, cream leather cushion below, elegant "
        "editorial crop.",
    ),
    (
        "04_low_front",
        "LOW FRONT ARCHITECTURE SHOT. Low angle looking toward the ring to show "
        "height, band opening, dome volume, ruby rail depth, BLACK pavé catching "
        "small highlights, dramatic but refined lighting.",
    ),
    (
        "05_macro_ruby",
        "MACRO RUBY RAIL. Extreme close-up of the ruby channel, deep red "
        "princess-cut rubies in a polished gold channel, BLACK pavé visible on "
        "both sides of the rail, shallow depth of field, sharp center stones, "
        "luxury macro detail.",
    ),
    (
        "06_macro_pave",
        "MACRO BLACK PAVÉ. Extreme close-up of the BLACK round pavé stones, dark "
        "reflective sparkle, pavé setting texture with tiny gold beads, ruby rail "
        "partially visible at frame edge, moody macro lighting, tack-sharp main "
        "stones.",
    ),
    (
        "07_on_finger_hero",
        "ON-FINGER LIFESTYLE HERO. Male hand with dark skin tone wearing the ring "
        "on index or middle finger, relaxed confident posture, a cigar and a "
        "luxury lighter softly out-of-focus nearby (not overpowering), gentleman's "
        "lounge setting with black leather or dark velvet surface, ring clearly "
        "dominant in frame, ruby rail readable, BLACK pavé sharp.",
    ),
    (
        "08_on_finger_macro",
        "ON-FINGER SECONDARY. Closer crop of the ring on a dark-skinned male hand, "
        "fingers relaxed, ring centered and dominant, ruby rail catching a single "
        "warm highlight, BLACK pavé surface sharp, background softly blurred, "
        "quiet power mood.",
    ),
    (
        "09_box_moment",
        "OWNERSHIP / BOX MOMENT. Ring presented in a black velvet or cream leather "
        "jewelry box, optionally with hands holding the box edges, ring centered, "
        "premium unboxing feeling, warm directional light on the ruby rail, "
        "no clutter, no text, no logos.",
    ),
    (
        "10_carousel",
        "HOMEPAGE SPLIT-CAROUSEL READY SHOT. Dark HOME composition with BLACK "
        "pavé and ruby rail, strong negative space on the right for text overlay, "
        "ring angled 3/4 on the left third, luxury black/cream cinematic backdrop, "
        "moody lighting, wide editorial crop suitable for a website carousel.",
    ),
]


async def fetch_reference_base64() -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(REFERENCE_URL)
        r.raise_for_status()
        return base64.b64encode(r.content).decode("utf-8")


async def generate_one(api_key: str, ref_b64: str, slug: str, shot_prompt: str) -> None:
    out_path = OUTPUT_DIR / f"{slug}.png"
    if out_path.exists():
        print(f"[skip] {out_path} already exists")
        return

    prompt = f"{LOCKED_PRODUCT}\n\nSHOT: {shot_prompt}\n\nSTYLE: {STYLE}"

    chat = LlmChat(
        api_key=api_key,
        session_id=f"don-gorgon-home-{slug}-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a luxury jewelry campaign photographer. Generate one "
            "photoreal image that exactly preserves the referenced ring's "
            "identity while following the requested angle and composition."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=prompt, file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)

    if not images:
        print(f"[FAIL] {slug} — no image returned. text='{(text or '')[:120]}'")
        return

    img = images[0]
    img_bytes = base64.b64decode(img["data"])
    out_path.write_bytes(img_bytes)
    print(f"[ok]   {slug} -> {out_path} ({len(img_bytes)//1024} KB)")


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing in env", file=sys.stderr)
        return 1

    print(f"Fetching reference: {REFERENCE_URL}")
    ref_b64 = await fetch_reference_base64()
    print(f"Reference loaded ({len(ref_b64)//1024} KB base64)")

    # Serial generation to avoid rate limits and keep identity stable
    for slug, shot_prompt in SHOTS:
        try:
            await generate_one(api_key, ref_b64, slug, shot_prompt)
        except Exception as e:  # noqa: BLE001
            print(f"[ERR]  {slug} — {type(e).__name__}: {e}")

    print("\nDone.")
    print(f"Output dir: {OUTPUT_DIR}")
    for p in sorted(OUTPUT_DIR.iterdir()):
        print(f" - /don-gorgon/home/{p.name}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
