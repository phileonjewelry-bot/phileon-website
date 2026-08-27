from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
from models.customer_photo import CustomerPhoto, CustomerPhotoCreate
import uuid
from datetime import datetime
from services.object_storage import put_object, build_key

router = APIRouter(prefix="/customer-photos", tags=["customer_photos"])

def get_db():
    from server import db
    return db

@router.get("", response_model=List[CustomerPhoto])
async def get_customer_photos(approved: bool = True):
    """Get all customer photos"""
    db = get_db()
    
    query = {"approved": approved}
    photos = await db.customer_photos.find(query).sort("createdAt", -1).to_list(1000)
    
    return [CustomerPhoto(**photo) for photo in photos]

@router.post("", response_model=CustomerPhoto)
async def create_customer_photo(photo: CustomerPhotoCreate):
    """Add new customer photo"""
    db = get_db()
    
    photo_obj = CustomerPhoto(
        id=str(uuid.uuid4()),
        **photo.dict(),
        approved=True,  # Auto-approve for now, can add admin approval later
        createdAt=datetime.utcnow()
    )
    
    await db.customer_photos.insert_one(photo_obj.dict())
    return photo_obj

@router.delete("/{photo_id}")
async def delete_customer_photo(photo_id: str):
    """Delete customer photo (Admin only)"""
    db = get_db()
    
    result = await db.customer_photos.delete_one({"id": photo_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return {"message": "Photo deleted successfully"}

@router.post("/upload")
async def upload_customer_photo(file: UploadFile = File(...)):
    """Upload customer photo to Emergent Object Storage."""
    file_extension = (file.filename.rsplit(".", 1)[-1] if "." in (file.filename or "") else "bin").lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    object_key = build_key("customers", unique_filename)

    contents = await file.read()
    put_object(object_key, contents, file.content_type or "application/octet-stream")

    image_url = f"/api/files/{object_key}"

    return {"imageUrl": image_url, "filename": unique_filename, "storagePath": object_key}