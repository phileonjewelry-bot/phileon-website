from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OrderItem(BaseModel):
    productId: str
    name: str
    quantity: int
    price: float
    image: str

class ShippingAddress(BaseModel):
    firstName: str
    lastName: str
    address: str
    city: str
    state: str
    zipCode: str
    country: str = "USA"

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    userId: Optional[str] = None
    email: str
    items: List[OrderItem]
    shippingAddress: ShippingAddress
    subtotal: float
    shippingCost: float
    total: float
    paymentMethod: str  # stripe, paypal
    paymentStatus: str = "pending"  # pending, paid, failed
    orderStatus: str = "processing"  # processing, shipped, delivered, cancelled
    trackingNumber: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CreateOrderRequest(BaseModel):
    email: str
    items: List[OrderItem]
    shippingAddress: ShippingAddress
    paymentMethod: str