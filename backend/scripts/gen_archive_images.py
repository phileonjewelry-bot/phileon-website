"""
Regenerate the two STACKRATS archive gallery images with a wider canvas
and 10-15% breathing room around every bangle. Both use the current images
as visual references for bangle material, metal colour, mesh texture,
ivory/champagne background and lighting.

Outputs:
  /app/frontend/public/stackrats/archive-matrix.png    (was hhd9o4gw_1000157086.png)
  /app/frontend/public/stackrats/archive-trio.png      (was separated.png)
"""
import asyncio
import os
import base64
import sys
import urllib.request
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

REF_MATRIX_URL = (
    "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/"
    "artifacts/hhd9o4gw_1000157086.png"
)
REF_TRIO_PATH = Path("/app/frontend/public/stackrats/separated.png")

OUT_MATRIX = Path("/app/frontend/public/stackrats/archive-matrix.png")
OUT_TRIO = Path("/app/frontend/public/stackrats/archive-trio.png")

PROMPT_MATRIX = (
    "Use the supplied reference image as the EXACT visual template for: bangle "
    "design (donut-form micro-bead mesh), metal colours (14K rose gold, 14K white "
    "gold, 18K yellow gold), warm ivory/champagne studio background, soft "
    "diffused lighting, perspective, and overall aesthetic.\n\n"
    "Regenerate the SAME 2x3 configuration matrix poster with these changes:\n"
    "1. INCREASE the canvas WIDTH by 25-30%. Output a wider landscape canvas.\n"
    "2. Keep the same 2-row x 3-column layout: top row is WIDE 10mm bangles "
    "(Dinah rose gold, Valerie white gold, Dominique yellow gold left to right), "
    "bottom row is THIN 7mm bangles in the same order.\n"
    "3. Each bangle must have AT LEAST 10-15% empty space around every side. "
    "NO bangle may touch any image edge or any neighbouring bangle.\n"
    "4. Re-typeset the labels above each row: 'WIDE · 10MM' centred above the "
    "top row, 'THIN · 7MM' centred above the bottom row. Under each bangle: "
    "the name in elegant serif caps ('DINAH', 'VALERIE', 'DOMINIQUE') and the "
    "metal in italic serif ('14K Rose Gold', '14K White Gold', '18K Yellow "
    "Gold'). All text must be sharp, legible, fully contained within the image, "
    "and never cropped.\n"
    "5. Maintain the same ivory/champagne background and lighting as reference. "
    "Editorial luxury jewellery catalogue feel."
)

PROMPT_TRIO = (
    "Use the supplied reference image as the EXACT visual template for: bangle "
    "design (donut-form micro-bead mesh), metal colours (rose gold on the left, "
    "white gold in the centre, yellow gold on the right), warm ivory/champagne "
    "background, soft diffused lighting, three-quarter perspective, and overall "
    "aesthetic.\n\n"
    "Regenerate the same trio still-life with these changes:\n"
    "1. INCREASE the canvas WIDTH by 25-30%. Output a wider landscape canvas.\n"
    "2. Keep three bangles centred horizontally and aligned vertically.\n"
    "3. The LEFT (rose gold) bangle must be ENTIRELY visible — no edge clipping.\n"
    "4. The CENTRE (white gold) bangle must be entirely visible.\n"
    "5. The RIGHT (yellow gold) bangle must be ENTIRELY visible — no edge clipping.\n"
    "6. There must be a MINIMUM of 10% breathing room from each bangle to the "
    "nearest image edge AND a clear gap between adjacent bangles.\n"
    "7. NO text, NO labels, NO logos. Pure still-life product photography.\n"
    "8. Maintain identical ivory/champagne background, soft top lighting, subtle "
    "floor reflections, and identical perspective."
)


def fetch_bytes(src) -> bytes:
    if isinstance(src, Path) or (isinstance(src, str) and not src.startswith("http")):
        with open(src, "rb") as fh:
            return fh.read()
    req = urllib.request.Request(src, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


async def generate(session_id: str, prompt: str, ref_bytes: bytes, out_path: Path) -> bool:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY missing")
        return False
    ref_b64 = base64.b64encode(ref_bytes).decode("utf-8")
    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message="You are a luxury product photography image generator.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )
    msg = UserMessage(text=prompt, file_contents=[ImageContent(ref_b64)])
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"[{session_id}] text: {(text or '')[:160]}")
    if not images:
        print(f"[{session_id}] ERROR: no images returned")
        return False
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_bytes = base64.b64decode(images[0]["data"])
    with open(out_path, "wb") as f:
        f.write(out_bytes)
    print(f"[{session_id}] OK saved {out_path} ({len(out_bytes)} bytes)")
    return True


async def main() -> int:
    matrix_ref = fetch_bytes(REF_MATRIX_URL)
    trio_ref = fetch_bytes(REF_TRIO_PATH)
    ok_a = await generate("stackrats-archive-matrix", PROMPT_MATRIX, matrix_ref, OUT_MATRIX)
    ok_b = await generate("stackrats-archive-trio", PROMPT_TRIO, trio_ref, OUT_TRIO)
    return 0 if (ok_a and ok_b) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
