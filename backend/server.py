from fastapi import FastAPI, APIRouter, HTTPException, Depends
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

from models import (
    Collection, CollectionCreate, CollectionUpdate,
    Product, ProductCreate, ProductUpdate,
    Inquiry, InquiryCreate, InquiryUpdate,
    Consultation, ConsultationCreate, ConsultationUpdate,
    Testimonial, TestimonialCreate, TestimonialUpdate,
    FAQ, FAQCreate, FAQUpdate,
    AdminLogin, Token,
    SiteSettings, SiteSettingsUpdate
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
    return serialize_doc(doc)


# Consultations (Public - Create only)
@api_router.post("/consultations", response_model=Consultation)
async def create_consultation(consultation: ConsultationCreate):
    consultation_obj = Consultation(**consultation.model_dump())
    doc = consultation_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.consultations.insert_one(doc)
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
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.products.find_one_and_update(
        {"id": product_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db():
    # Create indexes for better performance
    await db.collections.create_index("slug", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.products.create_index("collection_id")
    await db.inquiries.create_index("status")
    await db.consultations.create_index("status")
    logger.info("Database indexes created")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
