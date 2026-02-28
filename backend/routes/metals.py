from fastapi import APIRouter
from fastapi.responses import JSONResponse
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

router = APIRouter()

@router.get("/api/metals")
def metals():
    """
    Returns live spot prices (USD/oz) with caching disabled.
    Uses metals.live (simple free endpoint).
    """
    try:
        r_gold = requests.get(
            "https://api.metals.live/v1/spot/gold",
            timeout=6,
            verify=False,
        )
        r_silver = requests.get(
            "https://api.metals.live/v1/spot/silver",
            timeout=6,
            verify=False,
        )

        gold_json = r_gold.json()
        silver_json = r_silver.json()

        gold = float(gold_json[0][1])
        silver = float(silver_json[0][1])

        return JSONResponse(
            content={
                "gold_usd_oz": gold,
                "silver_usd_oz": silver,
                "source": "metals.live",
                "status": "live",
            },
            headers={
                "Cache-Control": "no-store, max-age=0",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )

    except Exception as e:
        return JSONResponse(
            content={
                "gold_usd_oz": 0,
                "silver_usd_oz": 0,
                "source": "fallback",
                "status": "error",
                "error": str(e),
            },
            headers={
                "Cache-Control": "no-store, max-age=0",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )
