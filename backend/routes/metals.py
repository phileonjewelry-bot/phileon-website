from fastapi import APIRouter
from fastapi.responses import JSONResponse
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

router = APIRouter()


def _try_metals_live():
    """Primary: metals.live"""
    r_gold = requests.get("https://api.metals.live/v1/spot/gold", timeout=6, verify=False)
    r_silver = requests.get("https://api.metals.live/v1/spot/silver", timeout=6, verify=False)
    gold = float(r_gold.json()[0][1])
    silver = float(r_silver.json()[0][1])
    return gold, silver, "metals.live"


def _try_freegoldapi():
    """Fallback: freegoldapi.com (gold only, derive silver from ratio)"""
    r = requests.get("https://freegoldapi.com/data/latest.json", timeout=6, verify=False)
    data = r.json()
    latest = data[-1]
    gold = float(latest["price"])
    # Approximate silver from typical gold/silver ratio (~85:1)
    silver = round(gold / 85, 2)
    return gold, silver, "freegoldapi"


@router.get("/api/metals")
def metals():
    """
    Returns live spot prices (USD/oz) with caching disabled.
    Tries metals.live first, then freegoldapi as fallback.
    """
    sources = [_try_metals_live, _try_freegoldapi]

    for source_fn in sources:
        try:
            gold, silver, source = source_fn()
            if gold > 0:
                return JSONResponse(
                    content={
                        "gold_usd_oz": gold,
                        "silver_usd_oz": silver,
                        "source": source,
                        "status": "live",
                    },
                    headers={
                        "Cache-Control": "no-store, max-age=0",
                        "Pragma": "no-cache",
                        "Expires": "0",
                    },
                )
        except Exception:
            continue

    return JSONResponse(
        content={
            "gold_usd_oz": 0,
            "silver_usd_oz": 0,
            "source": "fallback",
            "status": "error",
            "error": "All price sources failed",
        },
        headers={
            "Cache-Control": "no-store, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )
