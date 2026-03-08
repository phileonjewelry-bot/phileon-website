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
    inventory_count: int = 0
    low_stock_threshold: int = 2  # DROP MODE: Default threshold = 2
    low_stock_alert_sent: bool = False
    is_bestseller: bool = False
    # Alert guard fields
    restock_alert_sent: bool = False
    low_stock_alert_sent_at: Optional[datetime] = None
    restock_alert_sent_at: Optional[datetime] = None
    # Try-on system fields
    tryon_glb_url: Optional[str] = None  # 3D GLB model for Three.js
    tryon_preview_png_url: Optional[str] = None  # Preview image for try-on
    tryon_ring_scale: float = 1.0  # Default scale for ring sizing
    # Legacy compatibility
    stock: int = 0  # Will be mapped to inventory_count


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
    inventory_count: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    low_stock_alert_sent: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    tryon_glb_url: Optional[str] = None
    tryon_preview_png_url: Optional[str] = None
    tryon_ring_scale: Optional[float] = None
    # Legacy compatibility
    stock: Optional[int] = None


class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ RESTOCK LIST ============
class RestockListBase(BaseModel):
    product_id: str
    email: str
    name: Optional[str] = None
    notified: bool = False

class RestockListCreate(RestockListBase):
    pass

class RestockList(RestockListBase):
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


# ============ TRY-ON SYSTEM ============
class TryOnPhotoRequest(BaseModel):
    product_id: str
    finger_position: Optional[dict] = None  # {x, y} coordinates if user tapped
    ring_size: Optional[str] = "7"  # Default ring size
    metal_variant: Optional[str] = None  # If product has variants
    stone_variant: Optional[str] = None  # If product has stone options


class TryOnPhotoResponse(BaseModel):
    result_url: str
    product_id: str
    processing_time: Optional[float] = None
    cache_hit: bool = False


class TryOnAssetsResponse(BaseModel):
    product_id: str
    tryon_glb_url: Optional[str] = None
    tryon_preview_png_url: Optional[str] = None
    tryon_ring_scale: float = 1.0
    available_metals: List[str] = []
    available_stones: List[str] = []
    available_sizes: List[str] = ["4", "5", "6", "7", "8", "9", "10", "11", "12"]


class TryOnAnalytics(BaseModel):
    event_type: str  # photo_upload, 3d_view, ar_attempt, result_download, result_share
    product_id: str
    user_agent: Optional[str] = None
    device_info: Optional[dict] = None
    session_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ CUSTOMER AUTHENTICATION ============
class CustomerBase(BaseModel):
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    marketing_consent: bool = True


class CustomerRegister(CustomerBase):
    password: str


class CustomerLogin(BaseModel):
    email: str
    password: str


class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    marketing_consent: Optional[bool] = None


class Customer(CustomerBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    password_hash: str
    is_verified: bool = False
    verification_token: Optional[str] = None
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CustomerToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    customer: Customer


class PasswordReset(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class EmailVerification(BaseModel):
    token: str


# ============ CUSTOMER ADDRESSES ============
class AddressBase(BaseModel):
    type: str  # billing, shipping
    first_name: str
    last_name: str
    company: Optional[str] = None
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state_province: str
    postal_code: str
    country: str = "Canada"
    phone: Optional[str] = None
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    type: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    is_default: Optional[bool] = None


class Address(AddressBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ CUSTOMER ORDERS ============
class OrderStatus(str):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PRODUCTION = "in_production"
    READY_FOR_PICKUP = "ready_for_pickup"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderItemBase(BaseModel):
    product_id: str
    product_name: str
    product_image: Optional[str] = None
    quantity: int = 1
    unit_price: float
    variant: Optional[str] = None


class OrderItem(OrderItemBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class OrderBase(BaseModel):
    subtotal: float
    tax_amount: float = 0.0
    shipping_amount: float = 0.0
    total_amount: float
    currency: str = "USD"
    status: str = OrderStatus.PENDING
    payment_status: str = "pending"  # pending, completed, failed, refunded
    payment_method: str = "card"  # card, apple_pay, google_pay, paypal
    payment_intent_id: Optional[str] = None
    checkout_session_id: Optional[str] = None
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemBase]
    shipping_address: AddressCreate
    billing_address: Optional[AddressCreate] = None


class Order(OrderBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"PHI-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}")
    customer_id: str
    items: List[OrderItem]
    shipping_address: Address
    billing_address: Optional[Address] = None
    tracking_number: Optional[str] = None
    shipped_date: Optional[datetime] = None
    delivered_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
