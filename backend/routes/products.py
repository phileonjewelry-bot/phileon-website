from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
from models.product import Product, ProductCreate, ProductUpdate
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import base64
import uuid

router = APIRouter(prefix="/products", tags=["products"])

# Get database from app state (will be injected)
def get_db():
    from server import db
    return db

@router.get("", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    bestseller: Optional[bool] = None,
    search: Optional[str] = None
):
    """Get all products with optional filters"""
    db = get_db()
    query = {}
    
    if category:
        query["category"] = category
    if bestseller is not None:
        query["bestseller"] = bestseller
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query).to_list(1000)
    return [Product(**product) for product in products]

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get single product by ID"""
    db = get_db()
    product = await db.products.find_one({"id": product_id})
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return Product(**product)

@router.post("", response_model=Product)
async def create_product(product: ProductCreate):
    """Create new product (Admin only)"""
    db = get_db()
    
    product_obj = Product(
        **product.dict(),
        id=str(uuid.uuid4()),
        createdAt=datetime.utcnow(),
        updatedAt=datetime.utcnow()
    )
    
    await db.products.insert_one(product_obj.dict())
    return product_obj

@router.put("/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate):
    """Update product (Admin only)"""
    db = get_db()
    
    # Get existing product
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@router.delete("/{product_id}")
async def delete_product(product_id: str):
    """Delete product (Admin only)"""
    db = get_db()
    
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

@router.post("/upload-image")
async def upload_product_image(file: UploadFile = File(...)):
    """Upload product image (stores locally for now)"""
    
    # Create uploads directory if it doesn't exist
    upload_dir = "/app/backend/uploads/products"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Return URL (in production, this would be S3/Cloudinary URL)
    image_url = f"/uploads/products/{unique_filename}"
    
    return {"imageUrl": image_url, "filename": unique_filename}

@router.post("/upload-video")
async def upload_product_video(file: UploadFile = File(...)):
    """Upload product video (360° rotation or promotional)"""
    
    # Create uploads directory if it doesn't exist
    upload_dir = "/app/backend/uploads/videos"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Return URL
    video_url = f"/uploads/videos/{unique_filename}"
    
    return {"videoUrl": video_url, "filename": unique_filename}