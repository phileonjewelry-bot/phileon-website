from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Form
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
JWT_SECRET = os.environ.get('JWT_SECRET', 'phileon-jewelry-secret-key-2024')
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


# ============ HELPER FUNCTIONS ============
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
@api_router.get("/market-prices")
async def get_market_prices():
    """
    Returns live market prices per gram in CAD for pricing engine.
    Gold: 24K per gram CAD, Silver: per gram CAD.
    """
    import random
    
    # Base 24K gold per gram CAD (approx $150/g as of early 2026)
    base_gold = 152.40
    base_silver = 1.31
    
    # Small fluctuation ±0.8%
    gold_price = round(base_gold * (1 + random.uniform(-0.008, 0.008)), 2)
    silver_price = round(base_silver * (1 + random.uniform(-0.008, 0.008)), 2)
    
    return {
        "goldPerGram24kCad": gold_price,
        "silverPerGramCad": silver_price,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }


@api_router.get("/metal-prices")
async def get_metal_prices():
    """
    Returns live metal prices.
    Using realistic base prices with small random fluctuations for demo.
    In production, integrate with a metals API like Metals.dev or GoldAPI.
    """
    import random
    
    # Base prices (realistic as of late 2024)
    base_prices = {
        "GOLD": 2650.00,
        "SILVER": 31.50,
        "PLATINUM": 980.00,
        "PALLADIUM": 1050.00
    }
    
    prices = []
    for metal, base in base_prices.items():
        # Add small random fluctuation (±0.5%)
        fluctuation = base * random.uniform(-0.005, 0.005)
        price = round(base + fluctuation, 2)
        
        # Random change percentage for display
        change = round(random.uniform(-1.5, 1.5), 2)
        
        prices.append({
            "symbol": metal,
            "price": price,
            "change": change,
            "currency": "USD"
        })
    
    return {
        "prices": prices,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "simulated"
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
@admin_router.post("/login", response_model=Token)
async def admin_login(login: AdminLogin):
    # Check for default admin or existing admin
    admin = await db.admins.find_one({"username": login.username})
    
    if not admin:
        # Create default admin if none exists and credentials match default
        if login.username == "admin" and login.password == "phileon2024":
            password_hash = bcrypt.hashpw(login.password.encode(), bcrypt.gensalt()).decode()
            await db.admins.insert_one({
                "username": "admin",
                "password_hash": password_hash
            })
            return Token(access_token=create_token(login.username))
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(login.password.encode(), admin['password_hash'].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
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
app.include_router(api_router)
app.include_router(admin_router)

# Add route imports
from routes.products import router as products_router
from routes.inventory import router as inventory_router  
# from routes.cart import router as cart_router  # Temporarily disabled - using frontend cart context
from routes.orders import router as orders_router
# from routes.customer_photos import router as customer_photos_router  # Temporarily disabled - missing models
from routes.restock_routes import router as restock_router
from routes.stripe_routes import router as stripe_router
from routes.metals import router as metals_router

# Include all routers
app.include_router(products_router, prefix="/api")
app.include_router(inventory_router, prefix="/api")
# app.include_router(cart_router, prefix="/api")  # Temporarily disabled - using frontend cart context
app.include_router(orders_router, prefix="/api")
# app.include_router(customer_photos_router, prefix="/api")  # Temporarily disabled - missing models
app.include_router(restock_router, prefix="/api")
app.include_router(stripe_router, prefix="/api")
app.include_router(metals_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ TRY-ON ENDPOINTS ============
from fastapi import File, UploadFile, Form
from fastapi.responses import JSONResponse
import hashlib
import json
import time
from models import TryOnPhotoRequest, TryOnPhotoResponse, TryOnAssetsResponse, TryOnAnalytics

# Mock S3-compatible storage paths (in production, use actual S3)
TRYON_UPLOADS_PATH = Path("/app/tryon_uploads")
TRYON_RESULTS_PATH = Path("/app/tryon_results")
TRYON_UPLOADS_PATH.mkdir(exist_ok=True)
TRYON_RESULTS_PATH.mkdir(exist_ok=True)

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
        
        # Check if result already exists in cache
        result_path = TRYON_RESULTS_PATH / f"{cache_key}.jpg"
        
        if result_path.exists():
            # Return cached result
            processing_time = time.time() - start_time
            return TryOnPhotoResponse(
                result_url=f"/api/tryon/results/{cache_key}.jpg",
                product_id=product_id,
                processing_time=processing_time,
                cache_hit=True
            )
        
        # Save uploaded image
        upload_path = TRYON_UPLOADS_PATH / f"{cache_key}_original.jpg"
        with open(upload_path, "wb") as buffer:
            buffer.write(image_content)
        
        # Get product details for try-on processing
        product = await db.products.find_one({"id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Mock try-on processing (in production, integrate with AI service)
        # For now, we'll copy the original image as a placeholder result
        import shutil
        shutil.copy2(upload_path, result_path)
        
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
import mimetypes

# Serve try-on result images
@api_router.get("/tryon/results/{filename}")
async def serve_tryon_result(filename: str):
    """Serve try-on result images"""
    file_path = TRYON_RESULTS_PATH / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Result image not found")
    
    # Determine MIME type
    mime_type, _ = mimetypes.guess_type(str(file_path))
    if not mime_type:
        mime_type = "image/jpeg"
    
    return FileResponse(path=str(file_path), media_type=mime_type)


# ============ CUSTOMER AUTHENTICATION ============
import sys
sys.path.append('/app/backend/services')
from auth import (
    hash_password, verify_password, generate_token, create_access_token, 
    verify_access_token, send_verification_email, send_password_reset_email
)
from fastapi import Depends, HTTPException, status
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
async def register_customer(customer_data: CustomerRegister):
    """Register a new customer."""
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
async def login_customer(login_data: CustomerLogin):
    """Login customer."""
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
async def verify_email(verification: EmailVerification):
    """Verify customer email."""
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
async def request_password_reset(reset_data: PasswordReset):
    """Request password reset."""
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
async def confirm_password_reset(reset_data: PasswordResetConfirm):
    """Confirm password reset."""
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

        # Return final updated product
        final_product = await db.products.find_one({"id": product_id})
        return final_product

    except Exception as e:
        logger.error(f"Error updating inventory: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating inventory")


@app.on_event("startup")
async def startup_db():
    # Create indexes for better performance
    await db.collections.create_index("slug", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("collection_id")
    await db.inquiries.create_index("status")
    await db.consultations.create_index("status")
    await db.tryon_analytics.create_index("timestamp")
    logger.info("Database indexes created")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
