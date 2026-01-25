from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
from models import Product, ProductCreate, ProductUpdate
from inventory_alerts import get_inventory_status
import os
from datetime import datetime
import base64
import uuid

router = APIRouter(prefix="/products", tags=["products"])

# Get database from app state (will be injected)
def get_db():
    from server import db
    return db

@router.get("")
async def get_products(
    category: Optional[str] = None,
    bestseller: Optional[bool] = None,
    search: Optional[str] = None
):
    """Get all products with optional filters and inventory status"""
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
    
    # Add inventory status to each product
    products_with_status = []
    for product_data in products:
        product = Product(**product_data)
        inventory_status = get_inventory_status(product)
        
        # Add inventory status to product data
        product_dict = product.dict()
        product_dict['inventory_status'] = inventory_status
        products_with_status.append(product_dict)
    
    return products_with_status

@router.get("/{product_id}")
async def get_product(product_id: str):
    """Get single product by ID with inventory status"""
    db = get_db()
    product_data = await db.products.find_one({"id": product_id})
    
    if not product_data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = Product(**product_data)
    inventory_status = get_inventory_status(product)
    
    # Return product with inventory status
    result = product.dict()
    result['inventory_status'] = inventory_status
    return result

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

@router.put("/{product_id}/inventory")
async def update_product_inventory(product_id: str, inventory_count: int):
    """Update product inventory and trigger DROP MODE alerts"""
    db = get_db()
    
    # Get current product
    current_product_data = await db.products.find_one({"id": product_id})
    if not current_product_data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    current_product = Product(**current_product_data)
    previous_inventory = current_product.inventory_count
    
    # Update inventory
    updated_data = {
        "inventory_count": inventory_count,
        "updated_at": datetime.utcnow()
    }
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": updated_data}
    )
    
    # Get updated product for alerts
    updated_product_data = await db.products.find_one({"id": product_id})
    updated_product = Product(**updated_product_data)
    
    # Trigger DROP MODE inventory alerts
    from inventory_alerts import handle_inventory_alerts
    handle_inventory_alerts(updated_product, previous_inventory)
    
    # If alerts changed the product, update it in database
    if (updated_product.low_stock_alert_sent != current_product.low_stock_alert_sent or
        updated_product.restock_alert_sent != current_product.restock_alert_sent):
        
        alert_updates = {
            "low_stock_alert_sent": updated_product.low_stock_alert_sent,
            "low_stock_alert_sent_at": updated_product.low_stock_alert_sent_at,
            "restock_alert_sent": updated_product.restock_alert_sent,
            "restock_alert_sent_at": updated_product.restock_alert_sent_at,
            "updated_at": datetime.utcnow()
        }
        
        await db.products.update_one(
            {"id": product_id},
            {"$set": alert_updates}
        )
    
    # Get final product with inventory status
    final_product_data = await db.products.find_one({"id": product_id})
    final_product = Product(**final_product_data)
    inventory_status = get_inventory_status(final_product)
    
    result = final_product.dict()
    result['inventory_status'] = inventory_status
    result['previous_inventory'] = previous_inventory
    
    return result

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