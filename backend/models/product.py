from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    name: str
    category: str  # necklaces, rings, bracelets, earrings
    price: float
    images: List[str] = []  # URLs or file paths
    description: str = ""
    material: str = ""
    weight: str = ""
    certification: str = ""
    inStock: bool = True
    bestseller: bool = False
    rating: float = 4.5
    reviews: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    images: List[str] = []
    description: str = ""
    material: str = ""
    weight: str = ""
    certification: str = ""
    bestseller: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    images: Optional[List[str]] = None
    description: Optional[str] = None
    material: Optional[str] = None
    weight: Optional[str] = None
    certification: Optional[str] = None
    inStock: Optional[bool] = None
    bestseller: Optional[bool] = None