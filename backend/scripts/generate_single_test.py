"""Smoke-test the material lock on a single shot (01_hero) before burning budget on all 10."""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.generate_don_gorgon_home import (  # noqa: E402
    SHOTS,
    fetch_reference_base64,
    generate_one,
)


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        from dotenv import load_dotenv

        load_dotenv()
        api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("EMERGENT_LLM_KEY missing")
        return 1

    ref_b64 = await fetch_reference_base64()
    # Only run shot 01 (hero)
    slug, prompt = SHOTS[0]
    await generate_one(api_key, ref_b64, slug, prompt)
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
