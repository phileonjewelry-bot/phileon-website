from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid


# ============ COLLECTIONS ============
class CollectionBase(BaseModel):
    name: str
    slug: str
    description: str
    image_url: str
    display_order: int = 0
    is_active: bool = True


class CollectionCreate(CollectionBase):
    pass


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class Collection(CollectionBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ PRODUCTS ============
class ProductBase(BaseModel):
    name: str
    slug: str
    description: str
    short_description: str = ""
    collection_id: str
    images: List[str] = []
    materials: List[str] = []
    price_range: str = ""  # e.g., "$5,000 - $15,000"
    availability: str = "inquiry_only"  # available, made_to_order, inquiry_only
    is_featured: bool = False
    is_visible: bool = True
    display_order: int = 0
    details: dict = {}  # Additional details like dimensions, weight, etc.
    stock: int = 0
    low_stock_threshold: int = 5
    low_stock_alert_sent: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    collection_id: Optional[str] = None
    images: Optional[List[str]] = None
    materials: Optional[List[str]] = None
    price_range: Optional[str] = None
    availability: Optional[str] = None
    is_featured: Optional[bool] = None
    is_visible: Optional[bool] = None
    display_order: Optional[int] = None
    details: Optional[dict] = None
    stock: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    low_stock_alert_sent: Optional[bool] = None


class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ INQUIRIES ============
class InquiryBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    inquiry_type: str  # custom_design, product_inquiry, general
    product_id: Optional[str] = None
    message: str
    budget_range: Optional[str] = None
    timeline: Optional[str] = None


class InquiryCreate(InquiryBase):
    pass


class Inquiry(InquiryBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "new"  # new, in_progress, responded, closed
    admin_notes: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InquiryUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None


# ============ CONSULTATIONS ============
class ConsultationBase(BaseModel):
    name: str
    email: str
    phone: str
    preferred_date: str
    preferred_time: str
    consultation_type: str  # in_person, virtual
    interest: str  # rings, necklaces, bracelets, heirloom, custom
    message: Optional[str] = None


class ConsultationCreate(ConsultationBase):
    pass


class Consultation(ConsultationBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"  # pending, confirmed, completed, cancelled
    admin_notes: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ConsultationUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None


# ============ TESTIMONIALS ============
class TestimonialBase(BaseModel):
    client_name: str
    client_location: Optional[str] = None
    quote: str
    story: Optional[str] = None
    product_type: Optional[str] = None  # What they purchased
    image_url: Optional[str] = None
    is_featured: bool = False
    is_visible: bool = True
    display_order: int = 0


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    client_name: Optional[str] = None
    client_location: Optional[str] = None
    quote: Optional[str] = None
    story: Optional[str] = None
    product_type: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_visible: Optional[bool] = None
    display_order: Optional[int] = None


class Testimonial(TestimonialBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ FAQ ============
class FAQBase(BaseModel):
    question: str
    answer: str
    category: str  # process, pricing, timeline, care, general
    display_order: int = 0
    is_visible: bool = True


class FAQCreate(FAQBase):
    pass


class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None
    is_visible: Optional[bool] = None


class FAQ(FAQBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ ADMIN ============
class AdminLogin(BaseModel):
    username: str
    password: str


class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ============ SITE SETTINGS ============
class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    hero_title: str = "Timeless Elegance, Crafted for You"
    hero_subtitle: str = "Bespoke jewelry that tells your story"
    hero_image: str = ""
    featured_product_ids: List[str] = []
    contact_email: str = ""
    contact_phone: str = ""
    address: str = ""
    social_links: dict = {}
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SiteSettingsUpdate(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image: Optional[str] = None
    featured_product_ids: Optional[List[str]] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    social_links: Optional[dict] = None
