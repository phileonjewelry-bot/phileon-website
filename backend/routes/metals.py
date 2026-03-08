from fastapi import APIRouter
from fastapi.responses import JSONResponse
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

router = APIRouter()


def _try_metals_live():
    """Primary: gold-api.com (free, no auth required)"""
    try:
        r_gold = requests.get("https://api.gold-api.com/price/XAU", timeout=6)
        r_silver = requests.get("https://api.gold-api.com/price/XAG", timeout=6)
        
        if r_gold.status_code == 200 and r_silver.status_code == 200:
            gold_data = r_gold.json()
            silver_data = r_silver.json()
            
            gold = float(gold_data["price"])
            silver = float(silver_data["price"])
            
            return gold, silver, "gold-api.com"
    except Exception as e:
        print(f"gold-api.com failed: {e}")
    
    # Fallback to CoinGecko (using PAX Gold as proxy)
    try:
        r = requests.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,silver&vs_currencies=usd",
            timeout=6
        )
        if r.status_code == 200:
            data = r.json()
            # PAX Gold is 1:1 backed by physical gold
            gold = float(data["pax-gold"]["usd"])
            # Approximate silver from typical gold/silver ratio (~90:1 currently)
            silver = round(gold / 90, 2)
            return gold, silver, "coingecko"
    except Exception as e:
        print(f"CoinGecko failed: {e}")
        
    raise Exception("All metal price sources failed")


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
            # Validate that prices are reasonable (gold between $1500-$6000/oz)
            if gold > 1500 and gold < 6000:
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
