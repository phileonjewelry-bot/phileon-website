from pydantic import BaseModel, Field
from datetime import datetime

class CustomerPhoto(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    customerName: str
    productName: str
    location: str
    image: str  # URL or file path
    approved: bool = True  # Admin approval
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class CustomerPhotoCreate(BaseModel):
    customerName: str
    productName: str
    location: str
    image: str