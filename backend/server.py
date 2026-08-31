from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Form, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import uuid
import mimetypes
import html
import re
from services.rate_limit import check_and_bump as _rl_check, clear_on_success as _rl_clear

from models import (
    Collection, CollectionCreate, CollectionUpdate,
    Product, ProductCreate, ProductUpdate,
    Inquiry, InquiryCreate, InquiryUpdate,
    Consultation, ConsultationCreate, ConsultationUpdate,
    Testimonial, TestimonialCreate, TestimonialUpdate,
    FAQ, FAQCreate, FAQUpdate,
    AdminLogin, Token,
    SiteSettings, SiteSettingsUpdate,
    TryOnPhotoRequest, TryOnPhotoResponse, TryOnAssetsResponse, TryOnAnalytics,
    # Customer auth models
    Customer, CustomerRegister, CustomerLogin, CustomerUpdate, CustomerToken,
    PasswordReset, PasswordResetConfirm, EmailVerification,
    Address, AddressCreate, AddressUpdate,
    Order, OrderCreate
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="Phileon Jewelry API")

# Create routers
api_router = APIRouter(prefix="/api")
admin_router = APIRouter(prefix="/api/admin")

security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# SEC-002 supporting helpers for /api/files and admin attachment proxy.
# Allowlist of content types we are willing to *serve* inline. Anything
# outside this list (including anything the storage layer returns as an
# HTML/SVG/JS content-type) is forced to `application/octet-stream` and
# served with `Content-Disposition: attachment` so browsers cannot execute
# it in-origin.
_SAFE_INLINE_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "video/mp4", "video/webm", "video/quicktime",
}
_UNSAFE_KEY_PATTERN = re.compile(r"(^|/)\.\.(/|$)")


def _sanitize_object_key(key: str) -> str:
    """Reject path traversal and NUL bytes on any object-key proxy."""
    if not key or "\x00" in key or _UNSAFE_KEY_PATTERN.search(key):
        raise HTTPException(status_code=400, detail="Invalid object key")
    # Reject encoded traversal too (e.g. %2e%2e).
    lowered = key.lower()
    if "%2e%2e" in lowered or "..\\" in key:
        raise HTTPException(status_code=400, detail="Invalid object key")
    return key


def _safe_stream_headers(content_type: str) -> tuple[str, dict]:
    """Return (safe_content_type, extra_headers) for an Object Storage stream."""
    ct = (content_type or "").split(";", 1)[0].strip().lower() or "application/octet-stream"
    headers = {
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "private, max-age=300",
    }
    if ct not in _SAFE_INLINE_TYPES:
        # Force safe type + attachment disposition so the browser cannot
        # execute it in the site origin.
        return "application/octet-stream", {**headers, "Content-Disposition": "attachment"}
    return ct, headers



def serialize_doc(doc: dict) -> dict:
    """Remove MongoDB _id and convert datetime to ISO string"""
    if doc is None:
        return None
    doc.pop('_id', None)
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc


def create_token(username: str) -> str:
    """Create JWT token"""
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ============ PUBLIC ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "Phileon Jewelry API", "status": "active"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}


# Metal Prices Endpoint
# ---------------------------------------------------------------------------
# Sources the same provider chain already used by /api/metals (gold-api.com,
# keyless) and converts USD/oz → CAD/g using the standard troy-ounce constant
# and the site-wide USD↔CAD constant (mirror of the frontend PHILEON_FX = 0.75).
# The last successful snapshot is retained in-process so a transient provider
# blip does not fall back to the static base within a single pod lifetime.
_MARKET_PRICES_CACHE: dict = {"gold_cad_g": None, "silver_cad_g": None, "updated_at": None}
_TROY_OUNCE_GRAMS = 31.1034768
_PHILEON_USD_TO_CAD = 1.0 / 0.75  # inverse of frontend PHILEON_FX

def _fetch_live_gold_silver_cad_per_gram():
    """Return (goldCadPerGram24k, silverCadPerGram, source) or raise."""
    from routes.metals import _try_metals_live
    gold_usd_oz, silver_usd_oz, source = _try_metals_live()
    if not (1500 < gold_usd_oz < 6000):
        raise ValueError("gold quote out of sane band")
    gold_cad_g   = (gold_usd_oz   * _PHILEON_USD_TO_CAD) / _TROY_OUNCE_GRAMS
    silver_cad_g = (silver_usd_oz * _PHILEON_USD_TO_CAD) / _TROY_OUNCE_GRAMS
    return round(gold_cad_g, 2), round(silver_cad_g, 4), source


@api_router.get("/market-prices")
async def get_market_prices(test_gold_multiplier: float = None):
    """
    Returns live market prices per gram in CAD for the storefront pricing
    engine. Gold: 24K per gram CAD. Silver: per gram CAD.
    Optional: ?test_gold_multiplier=1.1 to simulate a 10 % gold increase.
    """
    STATIC_FALLBACK_GOLD_CAD_G   = 152.40
    STATIC_FALLBACK_SILVER_CAD_G = 1.31

    try:
        gold_cad_g, silver_cad_g, source = _fetch_live_gold_silver_cad_per_gram()
        _MARKET_PRICES_CACHE["gold_cad_g"]   = gold_cad_g
        _MARKET_PRICES_CACHE["silver_cad_g"] = silver_cad_g
        _MARKET_PRICES_CACHE["updated_at"]   = datetime.now(timezone.utc).isoformat()
        feed_source = source
    except Exception:
        # Provider failed. Reuse last in-process success if we have one,
        # otherwise degrade to the historical static base.
        if _MARKET_PRICES_CACHE["gold_cad_g"] is not None:
            gold_cad_g   = _MARKET_PRICES_CACHE["gold_cad_g"]
            silver_cad_g = _MARKET_PRICES_CACHE["silver_cad_g"]
            feed_source  = "cached"
        else:
            gold_cad_g   = STATIC_FALLBACK_GOLD_CAD_G
            silver_cad_g = STATIC_FALLBACK_SILVER_CAD_G
            feed_source  = "static-fallback"

    if test_gold_multiplier and 0.5 <= test_gold_multiplier <= 2.0:
        # Test/dev-only lever. Ignored in production so a public URL param
        # cannot inflate customer-visible prices once real payments are live.
        stripe_mode = (os.environ.get("STRIPE_MODE") or "test").strip().lower()
        if stripe_mode != "live":
            gold_cad_g   = round(gold_cad_g   * test_gold_multiplier, 2)
            silver_cad_g = round(silver_cad_g * test_gold_multiplier, 4)

    return {
        "goldPerGram24kCad": gold_cad_g,
        "silverPerGramCad":  silver_cad_g,
        "updatedAt": _MARKET_PRICES_CACHE["updated_at"] or datetime.now(timezone.utc).isoformat(),
        "source": feed_source,
    }


# ============ CART VALIDATION ============
from pydantic import BaseModel
from typing import List as TypeList

class CartLineItem(BaseModel):
    product_key: str  # e.g. "ladyBamburgh"
    tier_key: str     # e.g. "signature"
    client_price: float  # price shown to client at add-to-cart time
    quantity: int = 1

class CartValidationRequest(BaseModel):
    items: TypeList[CartLineItem]

@api_router.post("/validate-cart")
async def validate_cart(request: CartValidationRequest):
    """
    Validates that cart line item prices match server-computed live prices.
    Called before checkout to prevent price manipulation.
    Tolerance: $100 CAD to account for rounding + market movement.
    """
    from pricing_engine import validate_line_item_price, get_current_market, compute_live_price
    
    results = []
    all_valid = True
    
    for item in request.items:
        validation = validate_line_item_price(
            product_key=item.product_key,
            tier_key=item.tier_key,
            client_price=item.client_price,
        )
        results.append({
            "product_key": item.product_key,
            "tier_key": item.tier_key,
            **validation,
        })
        if not validation["valid"]:
            all_valid = False
    
    return {
        "valid": all_valid,
        "items": results,
        "message": "Cart validated" if all_valid else "Price mismatch detected. Please refresh your cart.",
    }


# ───────────────────────────────────────────────────────────────
# PRIVATE CONSULTATION REQUESTS — bespoke product flows
# (Separate, lightweight model — does not disturb the existing
# admin /consultations endpoints which require strict date/time
# fields.)
# ───────────────────────────────────────────────────────────────

class PrivateConsultationRequest(BaseModel):
    product_slug: str            # e.g. "lady-jay"
    full_name: str
    email: str
    phone: Optional[str] = None
    preferred_metal: Optional[str] = None      # e.g. "18K White Gold"
    ring_size: Optional[str] = None            # e.g. "7.5" or "custom"
    consultation_type: Optional[str] = None    # virtual | in_person | sizing | collector
    message: Optional[str] = None


@api_router.post("/consultations/private")
async def create_private_consultation(payload: PrivateConsultationRequest):
    """Receive a bespoke / private consultation request and store it."""
    doc = {
        "id": str(uuid.uuid4()),
        "product_slug": payload.product_slug,
        "full_name": payload.full_name.strip(),
        "email": payload.email.strip().lower(),
        "phone": (payload.phone or "").strip() or None,
        "preferred_metal": payload.preferred_metal,
        "ring_size": payload.ring_size,
        "consultation_type": payload.consultation_type,
        "message": (payload.message or "").strip() or None,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.private_consultations.insert_one(doc)
    return {
        "ok": True,
        "id": doc["id"],
        "message": "Your request has been received. A member of the PHILEON atelier will contact you directly.",
    }


@api_router.get("/metal-prices")
async def get_metal_prices():
    """Deprecated compatibility shim.

    Historically returned USD/oz for GOLD/SILVER/PLATINUM/PALLADIUM with random
    fluctuation, which is unsafe for any customer-facing price calculation.
    It is not consumed by the current frontend. This endpoint now proxies the
    ticker `/api/metals` response (deterministic, live) and preserves the old
    envelope shape for any residual integration tests. Platinum and palladium
    are omitted because they are not part of PHILEON's real pricing authority.
    """
    from routes.metals import _try_metals_live
    try:
        gold_usd_oz, silver_usd_oz, source = _try_metals_live()
        return {
            "prices": [
                {"symbol": "GOLD",   "price": gold_usd_oz,   "change": 0, "currency": "USD"},
                {"symbol": "SILVER", "price": silver_usd_oz, "change": 0, "currency": "USD"},
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": source,
        }
    except Exception:
        return {
            "prices": [
                {"symbol": "GOLD",   "price": 2650.00, "change": 0, "currency": "USD"},
                {"symbol": "SILVER", "price": 31.50,  "change": 0, "currency": "USD"},
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "static-fallback",
        }


# Collections (Public)
@api_router.get("/collections", response_model=List[Collection])
async def get_collections():
    collections = await db.collections.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(100)
    return [serialize_doc(c) for c in collections]


@api_router.get("/collections/{slug}", response_model=Collection)
async def get_collection(slug: str):
    collection = await db.collections.find_one({"slug": slug, "is_active": True}, {"_id": 0})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return serialize_doc(collection)


# Products (Public)
@api_router.get("/products", response_model=List[Product])
async def get_products(collection_id: Optional[str] = None, featured: Optional[bool] = None):
    query = {"is_visible": True}
    if collection_id:
        query["collection_id"] = collection_id
    if featured is not None:
        query["is_featured"] = featured
    products = await db.products.find(query, {"_id": 0}).sort("display_order", 1).to_list(100)
    return [serialize_doc(p) for p in products]


@api_router.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    product = await db.products.find_one({"slug": slug, "is_visible": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_doc(product)


# Testimonials (Public)
@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials(featured: Optional[bool] = None):
    query = {"is_visible": True}
    if featured is not None:
        query["is_featured"] = featured
    testimonials = await db.testimonials.find(query, {"_id": 0}).sort("display_order", 1).to_list(50)
    return [serialize_doc(t) for t in testimonials]


# FAQ (Public)
@api_router.get("/faq", response_model=List[FAQ])
async def get_faqs(category: Optional[str] = None):
    query = {"is_visible": True}
    if category:
        query["category"] = category
    faqs = await db.faqs.find(query, {"_id": 0}).sort("display_order", 1).to_list(100)
    return [serialize_doc(f) for f in faqs]


# Site Settings (Public)
@api_router.get("/settings", response_model=SiteSettings)
async def get_site_settings():
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        return SiteSettings()
    return serialize_doc(settings)


# Inquiries (Public - Create only)
@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(inquiry: InquiryCreate):
    inquiry_obj = Inquiry(**inquiry.model_dump())
    doc = inquiry_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.inquiries.insert_one(doc)
    
    # Send email notification
    try:
        from email_utils import send_email
        subject = f"New Inquiry: {inquiry.inquiry_type.replace('_', ' ').title()}"
        body = f"""
New inquiry received from Phileon website:

Name: {inquiry.name}
Email: {inquiry.email}
Phone: {inquiry.phone or 'Not provided'}
Type: {inquiry.inquiry_type.replace('_', ' ').title()}
Product ID: {inquiry.product_id or 'General inquiry'}
Budget Range: {inquiry.budget_range or 'Not specified'}
Timeline: {inquiry.timeline or 'Not specified'}

Message:
{inquiry.message}

---
This inquiry was submitted through the Phileon website.
        """
        send_email(subject, body)
    except Exception as e:
        print(f"Failed to send email notification: {e}")
        # Continue without failing the inquiry creation
    
    return serialize_doc(doc)


# Consultations (Public - Create only)
@api_router.post("/consultations", response_model=Consultation)
async def create_consultation(consultation: ConsultationCreate):
    consultation_obj = Consultation(**consultation.model_dump())
    doc = consultation_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.consultations.insert_one(doc)
    
    # Send email notification
    try:
        from email_utils import send_email
        subject = "New Consultation Request - Phileon Jewelry"
        body = f"""
New consultation request received from Phileon website:

Name: {consultation.name}
Email: {consultation.email}
Phone: {consultation.phone or 'Not provided'}
Service: {consultation.service_type.replace('_', ' ').title()}
Budget: {consultation.budget_range or 'Not specified'}
Timeline: {consultation.timeline or 'Not specified'}
Preferred Contact: {consultation.preferred_contact or 'Not specified'}

Message:
{consultation.message}

---
This consultation request was submitted through the Phileon website.
        """
        send_email(subject, body)
    except Exception as e:
        print(f"Failed to send consultation email notification: {e}")
        # Continue without failing the consultation creation
    
    return serialize_doc(doc)


# ============ ADMIN ROUTES ============
CONCIERGE_STATUS_ORDER = ["new", "reviewing", "consultation-requested", "quote-in-progress", "replied", "closed"]
ALLOWED_CONCIERGE_STATUS = set(CONCIERGE_STATUS_ORDER)


def _serialize_inquiry(doc: dict) -> dict:
    if not doc:
        return doc
    doc = {k: v for k, v in doc.items() if k != "_id"}
    return doc


@admin_router.get("/concierge/inquiries")
async def admin_list_concierge(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    intent: Optional[str] = None,
    product: Optional[str] = None,
    _: str = Depends(verify_admin),
):
    q: dict = {}
    if status: q["status"] = status
    if priority: q["priority"] = priority
    if intent: q["intent"] = intent
    if product: q["product.slug"] = product
    cursor = db.concierge_inquiries.find(q).sort("created_at", -1).limit(500)
    items = [_serialize_inquiry(d) async for d in cursor]
    order_idx = {s: i for i, s in enumerate(CONCIERGE_STATUS_ORDER)}
    items.sort(key=lambda x: (order_idx.get(x.get("status", "new"), 99), -1 * int(x.get("created_at", "").replace("-", "").replace(":", "").replace("T", "").replace(".", "").replace("Z", "").replace("+", "").ljust(20, "0")[:20] or 0)))
    new_count = sum(1 for x in items if x.get("status") == "new")
    return {"items": items, "counts": {"new": new_count, "total": len(items)}}


# ── Phase 2: first-party event ingest (Concierge open tracking) ─────────────
_EVENT_ALLOWLIST = {"concierge_open"}
_SOURCE_PREFIXES = ("product:", "journal:", "bespoke:")
_SOURCE_FALLBACKS = {"custom-jewelry-canada"}
_SOURCE_MAX = 200
_SESSION_ID_MAX = 128
_EVENT_TTL_SECONDS = 60 * 60 * 24 * 365  # 12 months


async def _ensure_event_indexes():
    try:
        await db.phileon_events.create_index(
            [("event", 1), ("source", 1), ("session_id", 1)],
            name="uniq_event_source_session", unique=True)
    except Exception:
        pass
    try:
        await db.phileon_events.create_index(
            [("created_at", 1)], name="ttl_created_at",
            expireAfterSeconds=_EVENT_TTL_SECONDS)
    except Exception:
        pass


def _valid_source(s: str) -> bool:
    if not isinstance(s, str) or not s or len(s) > _SOURCE_MAX:
        return False
    if any(ord(c) < 32 for c in s):
        return False
    if s in _SOURCE_FALLBACKS:
        return True
    return any(s.startswith(p) for p in _SOURCE_PREFIXES)


@api_router.post("/events")
async def ingest_event(payload: dict, request: Request):
    """First-party analytics ingest. Narrow allowlist. No PII."""
    _rl_check("events-ingest", request, identity=None,
              max_attempts=60, window_secs=5 * 60)
    event = str(payload.get("event") or "").strip()
    source = str(payload.get("source") or "").strip()
    session_id = str(payload.get("session_id") or "").strip()
    if event not in _EVENT_ALLOWLIST or not _valid_source(source):
        return {"ok": True}
    if not session_id or len(session_id) > _SESSION_ID_MAX:
        return {"ok": True}
    try:
        await db.phileon_events.insert_one({
            "event": event, "source": source, "session_id": session_id,
            "created_at": datetime.now(timezone.utc),
        })
    except Exception:
        pass  # dedupe (unique-index collision) is expected
    return {"ok": True}




# ── Concierge Analytics Phase 1 ─────────────────────────────────────────────

_PERIOD_DAYS = {"7d": 7, "30d": 30, "90d": 90, "all": None}

# Test / synthetic source markers that must never surface in operational
# analytics even if a residual document exists in Mongo.
_SYNTHETIC_SOURCES = {
    "phase10-test", "phase-10.2-live", "phase-10.2-security-regression",
    "phase-10.1-verify", "phase-10.2-verify",
}

# Reverse map of Journal slug → article title (kept in sync manually so the
# analytics layer never has to import frontend code).
_JOURNAL_TITLES = {
    "10k-vs-14k-vs-18k-gold": "10K vs 14K vs 18K Gold",
    "lab-grown-vs-natural-diamonds": "Lab-Grown vs Natural Diamonds",
}


def _classify_source(raw: Optional[str], product: Optional[dict]) -> dict:
    """Normalize a raw source string to {kind, slug, key, label}.
    kind is one of: 'product' | 'journal' | 'bespoke' | 'other'."""
    s = (raw or "").strip()
    if not s:
        s = "unknown"

    if s in _SYNTHETIC_SOURCES:
        return {"kind": "synthetic", "slug": s, "key": s, "label": s}

    # Product PDP: "pdp:<slug>" or "product:<slug>"
    if s.startswith("pdp:") or s.startswith("product:"):
        slug = s.split(":", 1)[1].strip().lower()
        # Prefer the product name captured on the inquiry (never a live
        # commerce lookup — analytics reads its own stored context).
        name = (product or {}).get("name") if isinstance(product, dict) else None
        label = name or slug.replace("-", " ").upper()
        return {"kind": "product", "slug": slug, "key": f"product:{slug}", "label": label}

    # Journal article: "journal:<slug>"
    if s.startswith("journal:"):
        slug = s.split(":", 1)[1].strip().lower()
        label = _JOURNAL_TITLES.get(slug) or slug.replace("-", " ").title()
        return {"kind": "journal", "slug": slug, "key": f"journal:{slug}", "label": label}

    # Bespoke / custom jewelry surface
    if s in {"custom-jewelry-canada", "bespoke-page", "bespoke"}:
        return {"kind": "bespoke", "slug": s, "key": "bespoke:custom-jewelry", "label": "Custom Jewelry"}

    return {"kind": "other", "slug": s, "key": f"other:{s.lower()}", "label": s}


def _parse_created_at(v) -> Optional[datetime]:
    """Historical Concierge docs store `created_at` as an ISO string. Best-
    effort parse; return None if unparseable so the doc is silently skipped
    from period filters (but still counted in 'all')."""
    if isinstance(v, datetime):
        return v if v.tzinfo else v.replace(tzinfo=timezone.utc)
    if isinstance(v, str) and v:
        try:
            return datetime.fromisoformat(v.replace("Z", "+00:00"))
        except Exception:
            return None
    return None


@admin_router.get("/concierge/analytics")
async def admin_concierge_analytics(
    period: str = "30d",
    _: str = Depends(verify_admin),
):
    """Aggregated Concierge source performance (PII-free)."""
    period = period if period in _PERIOD_DAYS else "30d"
    days = _PERIOD_DAYS[period]
    cutoff = None
    if days is not None:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    # Small dataset (thousands, not millions) — a single scan is cheaper
    # than an aggregation pipeline that would still have to fold on the
    # normalized source string.
    projection = {"source": 1, "product": 1, "created_at": 1, "_id": 0}
    docs = await db.concierge_inquiries.find({}, projection).to_list(50000)

    # ── Phase 2: fold in Concierge open events ──
    ev_query = {"event": "concierge_open"}
    if cutoff is not None:
        ev_query["created_at"] = {"$gte": cutoff}
    events = await db.phileon_events.find(
        ev_query, {"source": 1, "session_id": 1, "created_at": 1, "_id": 0}
    ).to_list(100000)
    unique_opens_by_source: dict[str, int] = {}
    seen: set[tuple[str, str]] = set()
    total_opens = 0
    for ev in events:
        pair = (ev.get("source") or "", ev.get("session_id") or "")
        if not pair[0] or not pair[1] or pair in seen:
            continue
        seen.add(pair)
        cls = _classify_source(ev["source"], None)
        if cls["kind"] == "synthetic":
            continue
        unique_opens_by_source[cls["key"]] = unique_opens_by_source.get(cls["key"], 0) + 1
        total_opens += 1

    open_first = await db.phileon_events.find_one(
        {"event": "concierge_open"}, {"created_at": 1, "_id": 0},
        sort=[("created_at", 1)],
    )
    open_tracking_since = (
        open_first["created_at"].isoformat() if open_first and open_first.get("created_at") else None
    )

    buckets: dict[str, dict] = {}
    total = 0
    for doc in docs:
        ts = _parse_created_at(doc.get("created_at"))
        if cutoff is not None and (ts is None or ts < cutoff):
            continue
        cls = _classify_source(doc.get("source"), doc.get("product"))
        if cls["kind"] == "synthetic":
            continue
        total += 1
        b = buckets.setdefault(cls["key"], {"kind": cls["kind"], "slug": cls["slug"], "label": cls["label"], "inquiries": 0})
        b["inquiries"] += 1

    def _pack(kind: str):
        rows = []
        for b in buckets.values():
            if b["kind"] != kind:
                continue
            key = f"{kind}:{b['slug']}"
            opens = unique_opens_by_source.get(key, 0)
            conv = round(b["inquiries"] / opens, 4) if opens else None
            rows.append({
                "slug": b["slug"], "label": b["label"],
                "inquiries": b["inquiries"],
                "share": round(b["inquiries"] / total, 4) if total else 0.0,
                "opens": opens, "conversion_rate": conv,
            })
        # Also surface sources that had opens but zero inquiries this period.
        for key, opens in unique_opens_by_source.items():
            if not key.startswith(f"{kind}:"):
                continue
            slug = key.split(":", 1)[1]
            if any(r["slug"] == slug for r in rows):
                continue
            label = _JOURNAL_TITLES.get(slug) if kind == "journal" else None
            label = label or ("Custom Jewelry" if kind == "bespoke" else slug.replace("-", " ").upper())
            rows.append({
                "slug": slug, "label": label, "inquiries": 0,
                "share": 0.0, "opens": opens, "conversion_rate": 0.0,
            })
        rows.sort(key=lambda x: (x["inquiries"], x["opens"]), reverse=True)
        return rows

    products = _pack("product")
    journal = _pack("journal")
    bespoke = _pack("bespoke")
    other = _pack("other")

    top_sources = sorted(
        [
            {"key": k, "kind": b["kind"], "slug": b["slug"], "label": b["label"],
             "inquiries": b["inquiries"],
             "share": round(b["inquiries"] / total, 4) if total else 0.0,
             "opens": unique_opens_by_source.get(k, 0),
             "conversion_rate": (
                 round(b["inquiries"] / unique_opens_by_source[k], 4)
                 if unique_opens_by_source.get(k) else None
             )}
            for k, b in buckets.items()
        ],
        key=lambda x: (x["inquiries"], x["opens"]),
        reverse=True,
    )[:3]

    conversion_rate = round(total / total_opens, 4) if total_opens else None
    return {
        "period": period,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "open_tracking_since": open_tracking_since,
        "totals": {
            "inquiries": total,
            "concierge_opens": total_opens,
            "conversion_rate": conversion_rate,
            "conversion_note": (
                None if total_opens
                else "No Concierge open events recorded in the selected period yet."
            ),
        },
        "top_sources": top_sources,
        "products": products,
        "journal": journal,
        "bespoke": bespoke,
        "other": other,
    }




@admin_router.get("/concierge/inquiries/{reference}")
async def admin_get_concierge(reference: str, _: str = Depends(verify_admin)):
    doc = await db.concierge_inquiries.find_one({"reference": reference})
    if not doc:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return _serialize_inquiry(doc)


@admin_router.patch("/concierge/inquiries/{reference}/status")
@admin_router.post("/concierge/inquiries/{reference}/status")
async def admin_update_concierge_status(reference: str, body: dict, _: str = Depends(verify_admin)):
    new_status = (body or {}).get("status", "").lower()
    if new_status not in ALLOWED_CONCIERGE_STATUS:
        raise HTTPException(status_code=422, detail="Invalid status")
    now = datetime.now(timezone.utc).isoformat()
    result = await db.concierge_inquiries.update_one(
        {"reference": reference},
        {"$set": {"status": new_status, "updated_at": now},
         "$push": {"status_history": {"status": new_status, "at": now}}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"reference": reference, "status": new_status, "updated_at": now}


@admin_router.post("/concierge/inquiries/{reference}/notes")
async def admin_add_concierge_note(reference: str, body: dict, admin_username: str = Depends(verify_admin)):
    note = (body or {}).get("note", "").strip()
    if not note:
        raise HTTPException(status_code=422, detail="Note is required")
    if len(note) > 4000:
        raise HTTPException(status_code=422, detail="Note is too long")
    entry = {"note": note, "createdAt": datetime.now(timezone.utc).isoformat(), "author": admin_username}
    result = await db.concierge_inquiries.update_one(
        {"reference": reference},
        {"$push": {"admin_notes": entry}, "$set": {"updated_at": entry["createdAt"]}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return entry


@admin_router.get("/concierge/attachments/{object_key:path}")
async def admin_serve_concierge_attachment(object_key: str, _: str = Depends(verify_admin)):
    """Admin-authenticated attachment access — never public."""
    _sanitize_object_key(object_key)
    if not object_key.startswith("phileon/concierge/"):
        raise HTTPException(status_code=400, detail="Invalid attachment reference")
    try:
        data, content_type = get_object(object_key)
    except Exception:
        raise HTTPException(status_code=404, detail="Attachment not found")
    safe_ct, extra_headers = _safe_stream_headers(content_type)
    return Response(content=data, media_type=safe_ct, headers=extra_headers)


@admin_router.post("/login", response_model=Token)
async def admin_login(login: AdminLogin, request: Request):
    """Admin login. Credentials live in env vars (ADMIN_USERNAME +
    ADMIN_PASSWORD_HASH bcrypt). A previously seeded doc in db.admins is
    accepted for backward compatibility, but the env credential is the
    canonical source of truth.

    Final Security Hardening: rate limited to 5 attempts per 15 min per
    (IP, username-hash). Successful logins reset the counter.
    """
    # Throttle BEFORE bcrypt so brute force is cut off cheaply.
    _rl_check("admin-login", request, identity=login.username, max_attempts=5, window_secs=15 * 60)

    env_username = os.environ.get("ADMIN_USERNAME", "").strip()
    env_hash = os.environ.get("ADMIN_PASSWORD_HASH", "").strip()

    if env_username and env_hash:
        if login.username == env_username and bcrypt.checkpw(login.password.encode(), env_hash.encode()):
            _rl_clear("admin-login", request, identity=login.username)
            return Token(access_token=create_token(login.username))
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Fallback path (should not run in production — env creds required)
    admin = await db.admins.find_one({"username": login.username})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not bcrypt.checkpw(login.password.encode(), admin['password_hash'].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    _rl_clear("admin-login", request, identity=login.username)
    return Token(access_token=create_token(login.username))


# Admin Collections
@admin_router.get("/collections", response_model=List[Collection])
async def admin_get_collections(_: str = Depends(verify_admin)):
    collections = await db.collections.find({}, {"_id": 0}).sort("display_order", 1).to_list(100)
    return [serialize_doc(c) for c in collections]


@admin_router.post("/collections", response_model=Collection)
async def admin_create_collection(collection: CollectionCreate, _: str = Depends(verify_admin)):
    collection_obj = Collection(**collection.model_dump())
    doc = collection_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.collections.insert_one(doc)
    return serialize_doc(doc)


@admin_router.put("/collections/{collection_id}", response_model=Collection)
async def admin_update_collection(collection_id: str, update: CollectionUpdate, _: str = Depends(verify_admin)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.collections.find_one_and_update(
        {"id": collection_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Collection not found")
    return serialize_doc(result)


@admin_router.delete("/collections/{collection_id}")
async def admin_delete_collection(collection_id: str, _: str = Depends(verify_admin)):
    result = await db.collections.delete_one({"id": collection_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Collection not found")
    return {"message": "Collection deleted"}


# Admin Products
@admin_router.get("/products", response_model=List[Product])
async def admin_get_products(_: str = Depends(verify_admin)):
    products = await db.products.find({}, {"_id": 0}).sort("display_order", 1).to_list(500)
    return [serialize_doc(p) for p in products]


@admin_router.post("/products", response_model=Product)
async def admin_create_product(product: ProductCreate, _: str = Depends(verify_admin)):
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.products.insert_one(doc)
    return serialize_doc(doc)


@admin_router.put("/products/{product_id}", response_model=Product)
async def admin_update_product(product_id: str, update: ProductUpdate, _: str = Depends(verify_admin)):
    # Get the current product for comparison
    current_product = await db.products.find_one({"id": product_id})
    if not current_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    previous_stock = current_product.get('stock', 0)
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.products.find_one_and_update(
        {"id": product_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Handle inventory alerts if stock was updated
    if 'stock' in update_data:
        try:
            from inventory_alerts import handle_inventory_alerts
            from types import SimpleNamespace
            
            # Create a simple object with the needed attributes
            product_obj = SimpleNamespace(
                name=result.get('name'),
                stock=result.get('stock', 0),
                low_stock_threshold=result.get('low_stock_threshold', 5),
                low_stock_alert_sent=result.get('low_stock_alert_sent', False)
            )
            
            handle_inventory_alerts(product_obj, previous_stock)
            
            # Update the database with any changes to low_stock_alert_sent
            if result.get('low_stock_alert_sent') != product_obj.low_stock_alert_sent:
                await db.products.update_one(
                    {"id": product_id},
                    {"$set": {"low_stock_alert_sent": product_obj.low_stock_alert_sent}}
                )
                result['low_stock_alert_sent'] = product_obj.low_stock_alert_sent
        except Exception as e:
            print(f"Failed to send inventory alert: {e}")
            # Continue without failing the update
    
    return serialize_doc(result)


@admin_router.delete("/products/{product_id}")
async def admin_delete_product(product_id: str, _: str = Depends(verify_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}


# Admin Inquiries
@admin_router.get("/inquiries", response_model=List[Inquiry])
async def admin_get_inquiries(status: Optional[str] = None, _: str = Depends(verify_admin)):
    query = {}
    if status:
        query["status"] = status
    inquiries = await db.inquiries.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [serialize_doc(i) for i in inquiries]


@admin_router.put("/inquiries/{inquiry_id}", response_model=Inquiry)
async def admin_update_inquiry(inquiry_id: str, update: InquiryUpdate, _: str = Depends(verify_admin)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.inquiries.find_one_and_update(
        {"id": inquiry_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return serialize_doc(result)


# Admin Consultations
@admin_router.get("/consultations", response_model=List[Consultation])
async def admin_get_consultations(status: Optional[str] = None, _: str = Depends(verify_admin)):
    query = {}
    if status:
        query["status"] = status
    consultations = await db.consultations.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [serialize_doc(c) for c in consultations]


@admin_router.put("/consultations/{consultation_id}", response_model=Consultation)
async def admin_update_consultation(consultation_id: str, update: ConsultationUpdate, _: str = Depends(verify_admin)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.consultations.find_one_and_update(
        {"id": consultation_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return serialize_doc(result)


# Admin Testimonials
@admin_router.get("/testimonials", response_model=List[Testimonial])
async def admin_get_testimonials(_: str = Depends(verify_admin)):
    testimonials = await db.testimonials.find({}, {"_id": 0}).sort("display_order", 1).to_list(100)
    return [serialize_doc(t) for t in testimonials]


@admin_router.post("/testimonials", response_model=Testimonial)
async def admin_create_testimonial(testimonial: TestimonialCreate, _: str = Depends(verify_admin)):
    testimonial_obj = Testimonial(**testimonial.model_dump())
    doc = testimonial_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.testimonials.insert_one(doc)
    return serialize_doc(doc)


@admin_router.put("/testimonials/{testimonial_id}", response_model=Testimonial)
async def admin_update_testimonial(testimonial_id: str, update: TestimonialUpdate, _: str = Depends(verify_admin)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.testimonials.find_one_and_update(
        {"id": testimonial_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return serialize_doc(result)


@admin_router.delete("/testimonials/{testimonial_id}")
async def admin_delete_testimonial(testimonial_id: str, _: str = Depends(verify_admin)):
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted"}


# Admin FAQ
@admin_router.get("/faq", response_model=List[FAQ])
async def admin_get_faqs(_: str = Depends(verify_admin)):
    faqs = await db.faqs.find({}, {"_id": 0}).sort("display_order", 1).to_list(200)
    return [serialize_doc(f) for f in faqs]


@admin_router.post("/faq", response_model=FAQ)
async def admin_create_faq(faq: FAQCreate, _: str = Depends(verify_admin)):
    faq_obj = FAQ(**faq.model_dump())
    doc = faq_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.faqs.insert_one(doc)
    return serialize_doc(doc)


@admin_router.put("/faq/{faq_id}", response_model=FAQ)
async def admin_update_faq(faq_id: str, update: FAQUpdate, _: str = Depends(verify_admin)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.faqs.find_one_and_update(
        {"id": faq_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return serialize_doc(result)


@admin_router.delete("/faq/{faq_id}")
async def admin_delete_faq(faq_id: str, _: str = Depends(verify_admin)):
    result = await db.faqs.delete_one({"id": faq_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"message": "FAQ deleted"}


# Admin Site Settings
@admin_router.get("/settings", response_model=SiteSettings)
async def admin_get_settings(_: str = Depends(verify_admin)):
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        return SiteSettings()
    return serialize_doc(settings)


@admin_router.put("/settings", response_model=SiteSettings)
async def admin_update_settings(update: SiteSettingsUpdate, _: str = Depends(verify_admin)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.site_settings.find_one_and_update(
        {"id": "site_settings"},
        {"$set": update_data},
        upsert=True,
        return_document=True
    )
    return serialize_doc(result)


# Admin Stats
@admin_router.get("/stats")
async def admin_get_stats(_: str = Depends(verify_admin)):
    collections_count = await db.collections.count_documents({})
    products_count = await db.products.count_documents({})
    new_inquiries = await db.inquiries.count_documents({"status": "new"})
    pending_consultations = await db.consultations.count_documents({"status": "pending"})
    
    return {
        "collections": collections_count,
        "products": products_count,
        "new_inquiries": new_inquiries,
        "pending_consultations": pending_consultations
    }


# Include routers
# NOTE: `app.include_router(api_router)` is deliberately moved to the very
# bottom of this file. Many `@api_router.*` route decorators (auth, customers,
# tryon, inventory-patch, file proxy) live below this point; registering
# `api_router` here would freeze the route table before those decorators run.
app.include_router(admin_router)

# Add route imports
from routes.products import router as products_router
from routes.inventory import router as inventory_router  
from routes.orders import router as orders_router
# from routes.customer_photos import router as customer_photos_router  # Temporarily disabled - missing models
from routes.restock_routes import router as restock_router
from routes.stripe_routes import router as stripe_router
from routes.metals import router as metals_router

# Include all routers
app.include_router(products_router, prefix="/api")
app.include_router(inventory_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
# app.include_router(customer_photos_router, prefix="/api")  # Temporarily disabled - missing models
app.include_router(restock_router, prefix="/api")
app.include_router(stripe_router, prefix="/api")

# Phase 1 — secure checkout foundation (SCACCO MATTO pilot)
from routes.checkout import router as checkout_v2_router
from routes.webhooks_stripe import router as webhooks_stripe_router
app.include_router(checkout_v2_router, prefix="/api")
app.include_router(webhooks_stripe_router, prefix="/api")
app.include_router(metals_router)

from starlette.types import ASGIApp, Receive, Scope, Send


class SecurityHeadersMiddleware:
    """Add restrictive security headers to every response.

    Explicitly cheap ASGI middleware so it does not read/rewrite the body.
    - `X-Content-Type-Options: nosniff` (mitigates SEC-002 blast radius).
    - `X-Frame-Options: DENY` (clickjacking; kept for legacy browsers).
    - `Referrer-Policy: strict-origin-when-cross-origin`.
    - `Permissions-Policy: interest-cohort=(), browsing-topics=()` (tracking).
    - `Strict-Transport-Security` — meaningful under the platform's HTTPS
      terminator; harmless if downgraded.
    - `Content-Security-Policy` — enforced, audited allowlist.

    CSP audited origins (Final Security Hardening):
      script-src:  self + Emergent platform loader + Tailwind CDN (used in
                   preview iframes) + jsDelivr (a shared UI dep) + Stripe.js
                   + Cloudflare Web Analytics beacon.

                   `'unsafe-inline'` remains for ONE reason only:
                   Cloudflare's edge injects a per-request __CF$cv$params
                   bootstrap (Bot Fight Mode / JavaScript Detection). It
                   is added after our origin sends the response and
                   contains a per-request timestamp, so it cannot carry a
                   nonce and its hash changes every request. Every
                   PHILEON-owned inline script has been moved to an
                   external file (/emergent-preview-boot.js). To drop
                   `'unsafe-inline'`, disable Bot Fight Mode + JavaScript
                   Detections in the Cloudflare dashboard first.
      style-src:   self + Google Fonts + `'unsafe-inline'` (React inline
                   `style={}` props and Tailwind classes).
      img-src:     self + data: + blob: + any https (many product photos
                   are served from emergentagent CDN subdomains).
      media-src:   self + any https + blob: (hero videos on emergentagent).
      font-src:    self + Google Fonts + data:.
      connect-src: self + Stripe API.
      frame-src:   Stripe.js + Stripe hooks (checkout iframes).
      frame-ancestors 'none' — PHILEON must never be embedded.
      object-src / base-uri / form-action — locked to safe defaults.
    """

    _CSP = (
        "default-src 'self'; "
        "base-uri 'self'; "
        "object-src 'none'; "
        "frame-ancestors 'none'; "
        "img-src 'self' data: blob: https:; "
        "media-src 'self' https: blob:; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "connect-src 'self' https://api.stripe.com; "
        "script-src 'self' 'unsafe-inline' https://assets.emergent.sh "
        "https://cdn.tailwindcss.com https://cdn.jsdelivr.net "
        "https://js.stripe.com https://static.cloudflareinsights.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "frame-src https://js.stripe.com https://hooks.stripe.com; "
        "form-action 'self'; "
        "upgrade-insecure-requests"
    ).encode()

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        async def send_with_headers(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers") or [])
                extra = [
                    (b"x-content-type-options", b"nosniff"),
                    (b"x-frame-options", b"DENY"),
                    (b"referrer-policy", b"strict-origin-when-cross-origin"),
                    (b"permissions-policy", b"interest-cohort=(), browsing-topics=()"),
                    (b"strict-transport-security", b"max-age=31536000; includeSubDomains"),
                    (b"content-security-policy", self._CSP),
                ]
                existing = {k for k, _ in headers}
                for k, v in extra:
                    if k not in existing:
                        headers.append((k, v))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_headers)


app.add_middleware(SecurityHeadersMiddleware)


def _resolve_cors_origins() -> list[str]:
    raw = (os.environ.get("CORS_ORIGINS") or "").strip()
    if not raw or raw == "*":
        # Pin CORS to the deployed frontend origin. If the frontend origin is
        # not discoverable at import time we fall back to a permissive list
        # in dev BUT never with `allow_credentials=True`.
        return ["*"]
    return [o.strip() for o in raw.split(",") if o.strip()]


_cors_origins = _resolve_cors_origins()
_cors_credentials = _cors_origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=_cors_credentials,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ TRY-ON ENDPOINTS ============
from fastapi.responses import JSONResponse, Response
import hashlib
import json
import time
from services.object_storage import put_object, get_object, object_exists, build_key, init_storage

# Legacy path constants — kept for backward compatibility with any code that
# might still reference them, but ALL new uploads/results go to Emergent
# Object Storage (see put_object / get_object below).
TRYON_UPLOADS_PATH = Path("/app/tryon_uploads")
TRYON_RESULTS_PATH = Path("/app/tryon_results")

@api_router.post("/tryon/photo", response_model=TryOnPhotoResponse)
async def process_tryon_photo(
    file: UploadFile = File(...),
    product_id: str = Form(...),
    finger_position: Optional[str] = Form(None),  # JSON string of {x, y}
    ring_size: str = Form("7"),
    metal_variant: Optional[str] = Form(None),
    stone_variant: Optional[str] = Form(None)
):
    """Process photo try-on request"""
    start_time = time.time()
    
    try:
        # Read and hash the uploaded image for caching
        image_content = await file.read()
        image_hash = hashlib.md5(image_content).hexdigest()
        
        # Create cache key based on image + product + settings
        settings_str = f"{product_id}_{ring_size}_{metal_variant}_{stone_variant}_{finger_position}"
        cache_key = hashlib.md5(f"{image_hash}_{settings_str}".encode()).hexdigest()
        
        # Object Storage keys
        original_key = build_key("tryon/originals", f"{cache_key}.jpg")
        result_key = build_key("tryon/results", f"{cache_key}.jpg")

        # Check if result already exists in cache
        if object_exists(result_key):
            processing_time = time.time() - start_time
            return TryOnPhotoResponse(
                result_url=f"/api/tryon/results/{cache_key}.jpg",
                product_id=product_id,
                processing_time=processing_time,
                cache_hit=True
            )
        
        # Persist uploaded image to durable Object Storage
        put_object(original_key, image_content, file.content_type or "image/jpeg")
        
        # Get product details for try-on processing
        product = await db.products.find_one({"id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Mock try-on processing (in production, integrate with AI service).
        # For now, we write the original image bytes as the result placeholder.
        put_object(result_key, image_content, file.content_type or "image/jpeg")
        
        # Log analytics
        analytics_data = TryOnAnalytics(
            event_type="photo_upload",
            product_id=product_id,
            device_info={
                "ring_size": ring_size,
                "metal_variant": metal_variant,
                "stone_variant": stone_variant,
                "has_finger_position": finger_position is not None
            }
        )
        await db.tryon_analytics.insert_one(analytics_data.model_dump())
        
        processing_time = time.time() - start_time
        
        return TryOnPhotoResponse(
            result_url=f"/api/tryon/results/{cache_key}.jpg",
            product_id=product_id,
            processing_time=processing_time,
            cache_hit=False
        )
    
    except Exception as e:
        logger.error(f"Error processing try-on photo: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing try-on image")


@api_router.get("/tryon/assets", response_model=TryOnAssetsResponse)
async def get_tryon_assets(product_id: str):
    """Get try-on assets for a product"""
    try:
        product = await db.products.find_one({"id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Extract materials for variant options
        available_metals = []
        available_stones = []
        
        if "materials" in product:
            for material in product["materials"]:
                material_lower = material.lower()
                if any(metal in material_lower for metal in ["gold", "silver", "platinum", "titanium", "steel"]):
                    available_metals.append(material)
                elif any(stone in material_lower for stone in ["diamond", "sapphire", "ruby", "emerald", "pearl"]):
                    available_stones.append(material)
        
        return TryOnAssetsResponse(
            product_id=product_id,
            tryon_glb_url=product.get("tryon_glb_url"),
            tryon_preview_png_url=product.get("tryon_preview_png_url"),
            tryon_ring_scale=product.get("tryon_ring_scale", 1.0),
            available_metals=available_metals,
            available_stones=available_stones
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching try-on assets: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching try-on assets")


@api_router.post("/analytics/tryon")
async def log_tryon_analytics(analytics: TryOnAnalytics):
    """Log try-on analytics events"""
    try:
        await db.tryon_analytics.insert_one(analytics.model_dump())
        return {"status": "logged"}
    except Exception as e:
        logger.error(f"Error logging try-on analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error logging analytics")


# ============ INVENTORY ALERTS ============
@api_router.post("/inventory/check-alerts")
async def check_inventory_alerts():
    """Check for low stock products and send alerts"""
    try:
        # Find products with low stock that haven't been alerted
        low_stock_products = await db.products.find({
            "inventory_count": {"$gt": 0, "$lte": "$low_stock_threshold"},
            "low_stock_alert_sent": {"$ne": True}
        }).to_list(100)
        
        alerts_sent = 0
        for product in low_stock_products:
            # Send email alert (mock implementation)
            try:
                # In production, integrate with email service
                logger.warning(f"LOW STOCK ALERT: {product['name']} has {product['inventory_count']} items remaining")
                
                # Mark alert as sent
                await db.products.update_one(
                    {"id": product["id"]},
                    {"$set": {"low_stock_alert_sent": True}}
                )
                alerts_sent += 1
                
            except Exception as e:
                logger.error(f"Failed to send alert for product {product['id']}: {str(e)}")
        
        return {"alerts_sent": alerts_sent}
        
    except Exception as e:
        logger.error(f"Error checking inventory alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Error checking inventory alerts")


from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Serve try-on result images from durable Object Storage.
@api_router.get("/tryon/results/{filename}")
async def serve_tryon_result(filename: str):
    """Serve try-on result images from Emergent Object Storage."""
    result_key = build_key("tryon/results", filename)
    try:
        data, content_type = get_object(result_key)
    except Exception:
        raise HTTPException(status_code=404, detail="Result image not found")
    return Response(content=data, media_type=content_type or "image/jpeg")


# Generic backend proxy that streams any Object Storage file by its object key.
# Path pattern: /api/files/phileon/<surface>/<filename>
# Keeps raw storage URLs off the frontend and preserves server-side control.
@api_router.get("/files/{object_key:path}")
async def serve_stored_object(object_key: str):
    """Stream a file from Emergent Object Storage by its full object key.

    SEC-002: never trust the stored content-type. Only a small allowlist of
    image/video types is served inline; anything else is forced to
    application/octet-stream with `Content-Disposition: attachment` so a
    stored HTML/JS blob cannot execute in the site origin. `X-Content-Type-
    Options: nosniff` is always set.
    """
    _sanitize_object_key(object_key)
    if not object_key.startswith("phileon/"):
        raise HTTPException(status_code=400, detail="Invalid object key")
    try:
        data, content_type = get_object(object_key)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
    safe_ct, extra_headers = _safe_stream_headers(content_type)
    return Response(content=data, media_type=safe_ct, headers=extra_headers)


# ============ CUSTOMER AUTHENTICATION ============
import sys
sys.path.append('/app/backend/services')
from auth import (
    hash_password, verify_password, generate_token, create_access_token, 
    verify_access_token, send_verification_email, send_password_reset_email
)
from fastapi import Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

async def get_current_customer(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Customer:
    """Get current authenticated customer."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    payload = verify_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    customer_id = payload.get("sub")
    if not customer_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Customer not found"
        )
    
    return Customer(**customer)


@api_router.post("/auth/register", response_model=CustomerToken)
async def register_customer(customer_data: CustomerRegister, request: Request):
    """Register a new customer.

    Final Security Hardening: rate limited to 5 registrations per 15 min
    per IP to prevent bulk account farming.
    """
    _rl_check("customer-register", request, identity=customer_data.email,
              max_attempts=5, window_secs=15 * 60)
    try:
        # Check if customer already exists
        existing_customer = await db.customers.find_one({"email": customer_data.email.lower()})
        if existing_customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create customer
        password_hash = hash_password(customer_data.password)
        verification_token = generate_token()
        
        customer_dict = customer_data.model_dump()
        del customer_dict["password"]
        customer_dict.update({
            "email": customer_data.email.lower(),
            "password_hash": password_hash,
            "is_verified": False,
            "verification_token": verification_token,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        
        # Add ID
        customer_dict["id"] = str(uuid.uuid4())
        
        # Save to database
        await db.customers.insert_one(customer_dict)
        
        # Send verification email
        send_verification_email(customer_data.email, verification_token)
        
        # Create access token
        access_token = create_access_token(data={"sub": customer_dict["id"]})
        
        # Return customer data without sensitive info
        customer = Customer(**customer_dict)
        
        return CustomerToken(
            access_token=access_token,
            customer=customer
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering customer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@api_router.post("/auth/login", response_model=CustomerToken)
async def login_customer(login_data: CustomerLogin, request: Request):
    """Login customer.

    Final Security Hardening: rate limited to 5 attempts per 15 min per
    (IP, email-hash). Successful logins reset the counter.
    """
    _rl_check("customer-login", request, identity=login_data.email,
              max_attempts=5, window_secs=15 * 60)
    try:
        # Find customer
        customer = await db.customers.find_one({"email": login_data.email.lower()})
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, customer["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login
        await db.customers.update_one(
            {"id": customer["id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}}
        )
        
        # Create access token
        access_token = create_access_token(data={"sub": customer["id"]})
        
        # Return customer data
        customer_obj = Customer(**customer)
        _rl_clear("customer-login", request, identity=login_data.email)
        return CustomerToken(
            access_token=access_token,
            customer=customer_obj
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in customer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@api_router.post("/auth/verify-email")
async def verify_email(verification: EmailVerification, request: Request):
    """Verify customer email.

    Final Security Hardening: rate limited to 10 token attempts per 15 min
    per IP. Prevents brute-force guessing of verification tokens.
    """
    _rl_check("email-verify", request, identity=None,
              max_attempts=10, window_secs=15 * 60)
    try:
        customer = await db.customers.find_one({"verification_token": verification.token})
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token"
            )
        
        # Update customer
        await db.customers.update_one(
            {"id": customer["id"]},
            {
                "$set": {
                    "is_verified": True,
                    "verification_token": None,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return {"message": "Email verified successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification failed"
        )


@api_router.post("/auth/reset-password")
async def request_password_reset(reset_data: PasswordReset, request: Request):
    """Request password reset.

    Final Security Hardening: rate limited to 3 requests per 15 min per
    (IP, email-hash). Prevents using PHILEON to spam arbitrary inboxes
    with reset emails.
    """
    _rl_check("password-reset-request", request, identity=reset_data.email,
              max_attempts=3, window_secs=15 * 60)
    try:
        customer = await db.customers.find_one({"email": reset_data.email.lower()})
        if not customer:
            # Don't reveal if email exists or not
            return {"message": "If the email exists, a reset link has been sent"}
        
        # Generate reset token
        reset_token = generate_token()
        reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        
        # Update customer
        await db.customers.update_one(
            {"id": customer["id"]},
            {
                "$set": {
                    "reset_token": reset_token,
                    "reset_token_expires": reset_expires,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Send reset email
        send_password_reset_email(reset_data.email, reset_token)
        
        return {"message": "If the email exists, a reset link has been sent"}
        
    except Exception as e:
        logger.error(f"Error requesting password reset: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset request failed"
        )


@api_router.post("/auth/reset-password/confirm")
async def confirm_password_reset(reset_data: PasswordResetConfirm, request: Request):
    """Confirm password reset.

    Final Security Hardening: rate limited to 5 token attempts per 15 min
    per IP. Prevents brute-force guessing of reset tokens.
    """
    _rl_check("password-reset-confirm", request, identity=None,
              max_attempts=5, window_secs=15 * 60)
    try:
        customer = await db.customers.find_one({
            "reset_token": reset_data.token,
            "reset_token_expires": {"$gt": datetime.now(timezone.utc)}
        })
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Update password
        password_hash = hash_password(reset_data.new_password)
        await db.customers.update_one(
            {"id": customer["id"]},
            {
                "$set": {
                    "password_hash": password_hash,
                    "reset_token": None,
                    "reset_token_expires": None,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return {"message": "Password reset successful"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error confirming password reset: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )


@api_router.get("/auth/me", response_model=Customer)
async def get_current_customer_profile(current_customer: Customer = Depends(get_current_customer)):
    """Get current customer profile."""
    return current_customer


@api_router.put("/auth/me", response_model=Customer)
async def update_customer_profile(
    update_data: CustomerUpdate,
    current_customer: Customer = Depends(get_current_customer)
):
    """Update customer profile."""
    try:
        update_dict = {k: v for k, v in update_data.model_dump(exclude_unset=True).items() if v is not None}
        update_dict["updated_at"] = datetime.now(timezone.utc)
        
        await db.customers.update_one(
            {"id": current_customer.id},
            {"$set": update_dict}
        )
        
        updated_customer = await db.customers.find_one({"id": current_customer.id})
        return Customer(**updated_customer)
        
    except Exception as e:
        logger.error(f"Error updating customer profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )


# ============ CUSTOMER ADDRESSES ============
@api_router.get("/customers/addresses", response_model=List[Address])
async def get_customer_addresses(current_customer: Customer = Depends(get_current_customer)):
    """Get customer addresses."""
    try:
        addresses = await db.addresses.find({"customer_id": current_customer.id}).to_list(100)
        return [Address(**addr) for addr in addresses]
    except Exception as e:
        logger.error(f"Error fetching addresses: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch addresses"
        )


@api_router.post("/customers/addresses", response_model=Address)
async def create_customer_address(
    address_data: AddressCreate,
    current_customer: Customer = Depends(get_current_customer)
):
    """Create customer address."""
    try:
        address_dict = address_data.model_dump()
        address_dict.update({
            "id": str(uuid.uuid4()),
            "customer_id": current_customer.id,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        
        # If this is set as default, unset others
        if address_dict.get("is_default", False):
            await db.addresses.update_many(
                {"customer_id": current_customer.id},
                {"$set": {"is_default": False}}
            )
        
        await db.addresses.insert_one(address_dict)
        return Address(**address_dict)
        
    except Exception as e:
        logger.error(f"Error creating address: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Address creation failed"
        )


# ============ CUSTOMER ORDERS ============
@api_router.get("/customers/orders", response_model=List[Order])
async def get_customer_orders(current_customer: Customer = Depends(get_current_customer)):
    """Get customer orders."""
    try:
        orders = await db.orders.find({"customer_id": current_customer.id}).sort("created_at", -1).to_list(100)
        return [Order(**order) for order in orders]
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders"
        )


# ============ INVENTORY MANAGEMENT ============
from pydantic import BaseModel
import sys
sys.path.append('/app/backend/services')
from inventory_alerts import handle_inventory_alerts

class InventoryUpdate(BaseModel):
    inventory_count: int

@api_router.patch("/products/{product_id}/inventory")
async def update_inventory(product_id: str, payload: InventoryUpdate):
    """Update product inventory and trigger alerts if needed"""
    try:
        product = await db.products.find_one({"id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        prev_count = int(product.get("inventory_count", 0))
        new_count = int(payload.inventory_count)

        # Update inventory count
        await db.products.update_one(
            {"id": product_id},
            {"$set": {"inventory_count": new_count}}
        )

        # Reload product for alert logic
        updated_product = await db.products.find_one({"id": product_id})
        
        # Handle inventory alerts
        alert_updates = await handle_inventory_alerts(updated_product, prev_count, new_count)

        if alert_updates:
            await db.products.update_one(
                {"id": product_id},
                {"$set": alert_updates}
            )

        # Return final updated product (strip Mongo ObjectId to keep response JSON-serializable)
        final_product = await db.products.find_one({"id": product_id})
        if final_product and "_id" in final_product:
            final_product["_id"] = str(final_product["_id"])
        return final_product

    except Exception as e:
        logger.error(f"Error updating inventory: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating inventory")


# ═══════════════════════════════════════════════════════════════════════════
# CONCIERGE AGENT — High-intent product / bespoke / redesign inquiry intake
# (Phase 9)
#
# Two endpoints:
#   POST /api/concierge/attachments  — accept an image, store to Emergent
#                                       Object Storage under a private key
#   POST /api/concierge/inquiries    — persist the inquiry with structured
#                                       intent, optional attachments, and an
#                                       auto-generated internal summary
#
# All product context is passed verbatim from the client — the server does
# not price-look-up or validate the product, since Concierge is intake, not
# commerce. Reference code is customer-facing (short, human-readable).
# ═══════════════════════════════════════════════════════════════════════════
import secrets
from services.email import send_email as _send_transactional_email, INTERNAL_TO as _CONCIERGE_INTERNAL_TO

CONCIERGE_ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
CONCIERGE_MAX_BYTES = 8 * 1024 * 1024  # 8 MB per image
CONCIERGE_MAX_MESSAGE = 4000
CONCIERGE_MAX_ATTACHMENTS = 5


def _concierge_reference() -> str:
    """Short customer-facing reference like PHL-9F3K-42B."""
    alpha = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
    return "PHL-" + "".join(secrets.choice(alpha) for _ in range(4)) + "-" + "".join(secrets.choice(alpha) for _ in range(3))


def _classify_intent(message: str, has_attachments: bool, product_slug: str) -> str:
    """Lightweight rule-based intent classification. Manual override supported client-side."""
    m = (message or "").lower()
    if any(k in m for k in ("bespoke", "from scratch", "commission")):
        return "bespoke"
    if any(k in m for k in ("redesign", "old ring", "existing jewelry", "melt down", "reuse my")):
        return "redesign"
    if any(k in m for k in ("size ", "sizing", "what size", "ring size", "fit")):
        return "sizing"
    if any(k in m for k in ("rose gold", "yellow gold", "white gold", "in gold", "in silver", "different metal", "10k", "14k", "18k")):
        return "metal-change"
    if any(k in m for k in ("stone", "diamond", "sapphire", "ruby", "emerald", "lab-grown", "natural diamond")):
        return "stone-change"
    if any(k in m for k in ("under $", "under c$", "under cad", "budget", "cheaper")):
        return "pricing"
    if any(k in m for k in ("available", "in stock", "when can", "how long", "timeline")):
        return "availability"
    if any(k in m for k in ("wider", "bigger", "smaller", "shorter", "longer", "custom", "customize")):
        return "custom-variation"
    if product_slug:
        return "product-question"
    if has_attachments:
        return "custom-variation"
    return "other"


def _build_internal_summary(payload: dict, intent: str, attachment_count: int, priority: str) -> str:
    lines = []
    product = payload.get("product") or {}
    if product.get("name"):
        lines.append(f"Product: {product.get('name')}")
        if product.get("variant"):
            lines.append(f"Variant: {product.get('variant')}")
    lines.append(f"Intent: {intent.replace('-', ' ').title()}")
    if payload.get("message"):
        lines.append(f"Customer request: {payload['message'].strip()[:280]}")
    details = payload.get("optional_details") or {}
    for key in ("budget", "ring_size", "metal", "stone", "desired_timeline", "occasion"):
        if details.get(key):
            lines.append(f"{key.replace('_', ' ').title()}: {details[key]}")
    lines.append(f"Reference images: {attachment_count}")
    customer = payload.get("customer") or {}
    if customer.get("preferred_contact"):
        lines.append(f"Preferred contact: {customer['preferred_contact']}")
    lines.append(f"Priority: {priority}")
    lines.append("Response target: Typically within 24 hours")
    return "\n".join(lines)


def _priority_for(intent: str, payload: dict, attachment_count: int) -> str:
    details = payload.get("optional_details") or {}
    high_intent_intents = {"bespoke", "custom-variation", "redesign", "stone-change", "metal-change"}
    signals = 0
    if intent in high_intent_intents:
        signals += 1
    if details.get("budget"):
        signals += 1
    if attachment_count >= 2:
        signals += 1
    if (payload.get("product") or {}).get("slug"):
        signals += 1
    if signals >= 2:
        return "high-intent"
    if signals == 1:
        return "elevated"
    return "standard"


@api_router.post("/concierge/attachments")
async def upload_concierge_attachment(reference: str = Form(...), file: UploadFile = File(...)):
    """Upload a reference image for a concierge inquiry. Returns durable object key."""
    if not reference or len(reference) > 32 or not all(c.isalnum() or c == "-" for c in reference):
        raise HTTPException(status_code=400, detail="Invalid reference")
    if file.content_type not in CONCIERGE_ALLOWED_MIME:
        raise HTTPException(status_code=415, detail="Unsupported image type")
    contents = await file.read()
    if len(contents) > CONCIERGE_MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image too large")

    ext_map = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
    ext = ext_map[file.content_type]
    obj_id = uuid.uuid4().hex
    object_key = build_key(f"concierge/{reference}", f"{obj_id}.{ext}")
    put_object(object_key, contents, file.content_type)
    return {"storagePath": object_key, "contentType": file.content_type, "size": len(contents)}


@api_router.post("/concierge/inquiries")
async def create_concierge_inquiry(payload: dict):
    """Persist a Concierge inquiry with structured context, intent and summary."""
    # Basic server-side validation — client is untrusted.
    customer = (payload.get("customer") or {})
    name = (customer.get("name") or "").strip()
    email = (customer.get("email") or "").strip()
    message = (payload.get("message") or "").strip()
    if not name or not email or "@" not in email:
        raise HTTPException(status_code=422, detail="Name and a valid email are required.")
    if not message:
        raise HTTPException(status_code=422, detail="Please describe what you're looking for.")
    if len(message) > CONCIERGE_MAX_MESSAGE:
        raise HTTPException(status_code=422, detail="Message is too long.")
    attachments = payload.get("attachments") or []
    if not isinstance(attachments, list) or len(attachments) > CONCIERGE_MAX_ATTACHMENTS:
        raise HTTPException(status_code=422, detail="Too many attachments.")
    # Only accept storage keys inside our own prefix.
    for att in attachments:
        key = (att or {}).get("storagePath", "")
        if not key.startswith("phileon/concierge/"):
            raise HTTPException(status_code=400, detail="Invalid attachment reference.")

    # Client can hint intent; otherwise classify.
    hinted = (payload.get("intent") or "").strip().lower()
    product_slug = ((payload.get("product") or {}).get("slug") or "").strip()
    intent = hinted or _classify_intent(message, bool(attachments), product_slug)
    priority = _priority_for(intent, payload, len(attachments))
    summary = _build_internal_summary(payload, intent, len(attachments), priority)
    reference = payload.get("reference") or _concierge_reference()

    doc = {
        "reference": reference,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source": payload.get("source") or "web",
        "product": payload.get("product") or {},
        "customer": {
            "name": name,
            "email": email,
            "phone": (customer.get("phone") or "").strip() or None,
            "preferred_contact": (customer.get("preferred_contact") or "email").strip().lower(),
        },
        "intent": intent,
        "message": message,
        "optional_details": payload.get("optional_details") or {},
        "attachments": attachments,
        "status": "new",
        "priority": priority,
        "internal_summary": summary,
    }
    await db.concierge_inquiries.insert_one(doc)

    # Fire-and-forget email notifications. Delivery status is stored back
    # on the inquiry document so admin can see which messages failed.
    #
    # SEC-004: every user-controlled string that is interpolated into the
    # internal notification email HTML is HTML-escaped. The customer
    # acknowledgment does not currently interpolate any raw user text apart
    # from `product.name` (which is server-side product metadata, not
    # arbitrary customer input) — we escape that anyway for defence in depth.
    _prod = payload.get("product") or {}
    _customer = payload.get("customer") or {}
    _phone = (_customer.get("phone") or "").strip()
    _preferred = (_customer.get("preferred_contact") or "").strip()
    admin_link = f"/admin/concierge/{html.escape(reference, quote=True)}"
    _safe_reference = html.escape(reference)
    _safe_product_name = html.escape(_prod.get("name") or "")
    _safe_name = html.escape(name)
    _safe_email = html.escape(email)
    _safe_message = html.escape(message)
    _safe_summary = html.escape(summary)
    _safe_phone = html.escape(_phone) if _phone else ""
    _safe_preferred = html.escape(_preferred) if _preferred else ""

    ack_html = (
        f"<div style=\"font-family:Georgia,serif;color:#222;\">"
        f"<p>Thank you for reaching out to PHILEON.</p>"
        f"<p>We\u2019ve received your Concierge request"
        f"{(' about <strong>' + _safe_product_name + '</strong>') if _safe_product_name else ''}"
        f". Your reference is <strong>{_safe_reference}</strong>.</p>"
        f"<p>A PHILEON concierge will typically respond within 24 hours.</p>"
        f"<p style=\"color:#888;font-size:12px;\">If you didn\u2019t submit this, please disregard.</p>"
        f"</div>"
    )
    ack_text = f"Thank you for reaching out to PHILEON.\nReference: {reference}\nA PHILEON concierge will typically respond within 24 hours."
    ack_result = await _send_transactional_email(
        to=email,
        subject=f"We received your PHILEON Concierge request \u2014 {reference}",
        html=ack_html,
        text=ack_text,
    )
    internal_html = (
        f"<pre style=\"font-family:Menlo,monospace;font-size:13px;\">"
        f"{_safe_summary}"
        f"</pre>"
        f"<p><strong>Reference:</strong> {_safe_reference}<br>"
        f"<strong>Customer:</strong> {_safe_name} &lt;{_safe_email}&gt;"
        f"{('<br><strong>Phone:</strong> ' + _safe_phone) if _safe_phone else ''}"
        f"{('<br><strong>Preferred contact:</strong> ' + _safe_preferred) if _safe_preferred else ''}"
        f"<br><strong>Original message:</strong></p>"
        f"<blockquote style=\"border-left:3px solid #c48369;padding:8px 12px;color:#555;\">{_safe_message}</blockquote>"
        f"<p><a href=\"{html.escape(admin_link, quote=True)}\">Open in admin</a></p>"
    )
    internal_result = await _send_transactional_email(
        to=_CONCIERGE_INTERNAL_TO,
        subject=f"New PHILEON Concierge Inquiry \u2014 {reference}",
        html=internal_html,
        text=f"Reference {reference} from {name} <{email}>\n\n{summary}\n\nMessage:\n{message}",
    )
    await db.concierge_inquiries.update_one(
        {"reference": reference},
        {"$set": {"notifications": {"customerAck": ack_result, "internalAlert": internal_result}}},
    )
    return {
        "reference": reference,
        "intent": intent,
        "priority": priority,
        "attachmentCount": len(attachments),
        "message": "Your request is with PHILEON. A concierge will typically respond within 24 hours.",
    }





# Register api_router LAST so every `@api_router.*` decorator declared above
# is picked up. See note near admin_router include.
app.include_router(api_router)


@app.on_event("startup")
async def startup_db():
    # Create indexes for better performance
    await db.collections.create_index("slug", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("collection_id")
    await db.inquiries.create_index("status")
    await db.consultations.create_index("status")
    await db.tryon_analytics.create_index("timestamp")
    await _ensure_event_indexes()
    logger.info("Database indexes created")

    # Warm up Emergent Object Storage — non-fatal if unavailable so the API can still start.
    try:
        init_storage()
        logger.info("Emergent Object Storage initialized")
    except Exception as e:
        logger.error(f"Emergent Object Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
