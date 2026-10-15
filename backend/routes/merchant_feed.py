"""Request-time merchant feed.

Serves the generated Google Merchant feed but drops any seasonally retired
item at the moment of the request, so a stale static ``merchant-feed.xml``
can never keep advertising a retired piece if no rebuild has run.
The static file additionally carries ``<g:expiration_date>`` as a fail-safe.
"""
import re
from pathlib import Path

from fastapi import APIRouter, Response

from services.pricing_engine_catalog import season_state

router = APIRouter(prefix="/merchant-feed.xml", tags=["merchant-feed"])

_FEED_CANDIDATES = (
    Path(__file__).resolve().parents[2] / "frontend" / "public" / "merchant-feed.xml",
    Path(__file__).resolve().parents[2] / "frontend" / "build" / "merchant-feed.xml",
)
_ITEM_RE = re.compile(r"  <item>\n.*?\n  </item>\n?", re.S)
_ID_RE = re.compile(r"<g:id>([^<]+)</g:id>")


def filter_retired(xml: str) -> tuple[str, list[str]]:
    removed: list[str] = []

    def _keep(m: "re.Match[str]") -> str:
        slug = (_ID_RE.search(m.group(0)) or [None, ""])[1]
        if slug and not season_state(slug)["available"]:
            removed.append(slug)
            return ""
        return m.group(0)

    return _ITEM_RE.sub(_keep, xml), removed


@router.get("")
async def merchant_feed():
    src = next((p for p in _FEED_CANDIDATES if p.exists()), None)
    if src is None:
        return Response(status_code=404, content="merchant feed not generated",
                        media_type="text/plain")
    xml, removed = filter_retired(src.read_text(encoding="utf-8"))
    return Response(content=xml, media_type="application/xml",
                    headers={"Cache-Control": "no-store",
                             "X-Feed-Retired-Removed": ",".join(removed) or "none"})
