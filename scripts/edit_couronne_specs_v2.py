"""
Update Prise de Couronne SPECIFICATIONS diagram:
  "Black Rhodium" -> "Black Enamel"
Preserve everything else exactly.
"""
import asyncio
import os
import base64
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

SOURCE_PATH = "/app/frontend/public/images/prise-de-couronne-specifications.png"
OUT_PATH = "/app/frontend/public/images/prise-de-couronne-specifications.png"

PROMPT = """Edit ONLY one text label in this product specifications diagram. Do not redraw or modify the ring illustration, dimension arrows, lines, layout, fonts, or color palette. Make only this EXACT text replacement, preserving the original font, size, color, and position:

In the upper-left MATERIAL section, change "Black Rhodium" to "Black Enamel".

Keep ABSOLUTELY EVERYTHING ELSE identical, including but not limited to: SPECIFICATIONS title, DIMENSIONS subtitle, "MATERIAL" label, "10K Gold" label, "DIAMONDS" / "3.12 ctw", "5 × 0.15 ct" / "0.02 ct pavé", "0.02 ct pavé" callouts, BAND WIDTH 12.5 mm, INNER RING DIAMETER 17.2 mm, the bottom caption "10K Gold · ~14.5g", the wireframe ring illustration, the dark background, and the rose-gold border accents at the top and bottom edges. Output the full image at the same dimensions and aspect ratio."""


async def main() -> None:
    with open(SOURCE_PATH, "rb") as f:
        src_bytes = f.read()
    print(f"Source image size: {len(src_bytes)} bytes")

    image_b64 = base64.b64encode(src_bytes).decode("utf-8")

    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing")

    chat = LlmChat(
        api_key=api_key,
        session_id="couronne-specs-edit-v2",
        system_message="You are a precise image editor that makes minimal, targeted text replacements while preserving everything else exactly.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=PROMPT, file_contents=[ImageContent(image_b64)])

    print("Calling Nano Banana...")
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"Text response (first 200 chars): {str(text)[:200]}")
    print(f"Image count: {len(images) if images else 0}")

    if not images:
        raise RuntimeError("No image returned")

    img = images[0]
    print(f"Returned mime_type: {img.get('mime_type')}")

    out_bytes = base64.b64decode(img["data"])
    with open(OUT_PATH, "wb") as f:
        f.write(out_bytes)
    print(f"Wrote {len(out_bytes)} bytes -> {OUT_PATH}")


if __name__ == "__main__":
    asyncio.run(main())
