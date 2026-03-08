from fastapi import APIRouter
from fastapi.responses import JSONResponse
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

router = APIRouter()


def _try_metals_live():
    """Primary: metals-api.com (free tier, no auth needed)"""
    try:
        r = requests.get(
            "https://metals-api.com/api/latest?base=USD&symbols=XAU,XAG",
            timeout=6
        )
        if r.status_code == 200:
            data = r.json()
            if data.get("success"):
                rates = data.get("rates", {})
                # Rates are in grams, convert to troy ounces (1 oz = 31.1035 grams)
                gold_per_gram = 1 / rates.get("XAU", 0)
                silver_per_gram = 1 / rates.get("XAG", 0)
                gold = round(gold_per_gram * 31.1035, 2)
                silver = round(silver_per_gram * 31.1035, 2)
                return gold, silver, "metals-api.com"
    except:
        pass
    
    # Fallback to goldprice.org JSON
    try:
        r = requests.get("https://data-asg.goldprice.org/dbXRates/USD", timeout=6)
        data = r.json()
        gold = float(data["items"][0]["xauPrice"])
        silver = float(data["items"][0]["xagPrice"])
        return gold, silver, "goldprice.org"
    except:
        pass
        
    raise Exception("metals.live sources failed")


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
    If both fail, returns reasonable static fallback prices.
    """
    sources = [_try_metals_live, _try_freegoldapi]

    for source_fn in sources:
        try:
            gold, silver, source = source_fn()
            # Validate that prices are reasonable (gold between $1500-$3500/oz)
            if gold > 1500 and gold < 3500:
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

    # Both APIs failed or returned invalid data - use reasonable static fallback
    return JSONResponse(
        content={
            "gold_usd_oz": 2650,
            "silver_usd_oz": 31.50,
            "source": "static_fallback",
            "status": "fallback",
        },
        headers={
            "Cache-Control": "no-store, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )
