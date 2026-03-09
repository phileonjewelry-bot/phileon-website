from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class CartItem(BaseModel):
    productId: str
    quantity: int = 1
    price: float
    name: str
    image: str
    material: str

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    userId: str  # Can be session ID for guest users
    items: List[CartItem] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class AddToCartRequest(BaseModel):
    productId: str
    quantity: int = 1

class UpdateCartItemRequest(BaseModel):
    quantity: int