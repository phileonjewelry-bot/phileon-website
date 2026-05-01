"""
One-shot script: edit baked text in the Prise de Couronne SPECIFICATIONS diagram
using Gemini Nano Banana. Replace:
  "10K White Gold"  ->  "10K Gold"
  "Champagne-Toned Finish"  ->  "Black Rhodium"
Preserve diagram layout, line art, dimension arrows, and all other text.
"""
import asyncio
import os
import base64
import urllib.request
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

SOURCE_URL = (
    "https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/"
    "artifacts/yvsvukw1_1000148336.png"
)
OUT_PATH = "/app/frontend/public/images/prise-de-couronne-specifications.png"

PROMPT = """Edit ONLY the text labels in this product specifications diagram. Do not redraw or change the ring illustration, dimension arrows, lines, layout, fonts, or color palette. Make only these EXACT text replacements while preserving the original font, size, color, and position of each label:

1. In the upper-left MATERIAL section, change "10K White Gold" to "10K Gold".
2. In the same MATERIAL section, change "Champagne-Toned Finish" to "Black Rhodium".
3. In the bottom caption that reads "10K White Gold · ~14.5g", change it to "10K Gold · ~14.5g".

Keep everything else identical: SPECIFICATIONS title, DIMENSIONS subtitle, DIAMONDS / 3.12 ctw label, all carat callouts (5 × 0.15 ct, 0.02 ct pavé), BAND WIDTH 12.5 mm, INNER RING DIAMETER 17.2 mm, the wireframe ring illustration, the dark background, and the rose-gold border accents at the top and bottom edges. Output the full image at the same dimensions and aspect ratio."""


async def main() -> None:
    print(f"Downloading source image from {SOURCE_URL}")
    with urllib.request.urlopen(SOURCE_URL, timeout=30) as resp:
        src_bytes = resp.read()
    print(f"Source image size: {len(src_bytes)} bytes")

    image_b64 = base64.b64encode(src_bytes).decode("utf-8")

    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing from env")

    chat = LlmChat(
        api_key=api_key,
        session_id="couronne-specs-edit",
        system_message="You are a precise image editor that makes minimal, targeted text replacements while preserving everything else exactly.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=PROMPT, file_contents=[ImageContent(image_b64)])

    print("Calling Nano Banana for image edit...")
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"Text response (first 200 chars): {str(text)[:200]}")
    print(f"Image count: {len(images) if images else 0}")

    if not images:
        raise RuntimeError("No image returned from Nano Banana")

    img = images[0]
    print(f"Returned mime_type: {img.get('mime_type')}")

    out_bytes = base64.b64decode(img["data"])
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "wb") as f:
        f.write(out_bytes)
    print(f"Wrote {len(out_bytes)} bytes -> {OUT_PATH}")


if __name__ == "__main__":
    asyncio.run(main())
