from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import RestockList, RestockListCreate
from datetime import datetime
from email_utils import send_email
import uuid

router = APIRouter(prefix="/restock", tags=["restock"])

def get_db():
    from server import db
    return db

def _verify_admin():
    """Lazy-imported admin guard — imported inside the function so this
    module remains importable outside a running FastAPI app."""
    from server import verify_admin
    return verify_admin

@router.post("", response_model=RestockList)
async def join_restock_list(restock_request: RestockListCreate):
    """Join restock notification list for a sold out product"""
    db = get_db()
    
    # Check if email already exists for this product
    existing = await db.restock_list.find_one({
        "product_id": restock_request.product_id,
        "email": restock_request.email
    })
    
    if existing:
        return RestockList(**existing)
    
    # Create new restock list entry
    restock_entry = RestockList(
        product_id=restock_request.product_id,
        email=restock_request.email,
        name=restock_request.name,
        notified=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    await db.restock_list.insert_one(restock_entry.dict())
    
    # Send confirmation email to customer
    try:
        # Get product details for confirmation
        product = await db.products.find_one({"id": restock_request.product_id})
        product_name = product.get("name", "Unknown Product") if product else "Unknown Product"
        
        send_email(
            to_email=restock_request.email,
            subject=f"✅ You're on the restock list for {product_name}",
            body=f"Hi {restock_request.name or 'there'},\n\n"
                 f"You've successfully joined the restock notification list for {product_name}.\n"
                 f"We'll email you as soon as it's back in stock!\n\n"
                 f"Thanks for your interest,\n"
                 f"The Phileon Team"
        )
    except Exception as e:
        # Don't fail the API call if email fails
        print(f"Failed to send restock confirmation email: {e}")
    
    return restock_entry

@router.get("/product/{product_id}", response_model=List[RestockList])
async def get_restock_list(product_id: str, _admin=Depends(_verify_admin())):
    """Get restock list for a specific product (Admin only)"""
    db = get_db()
    
    restock_entries = await db.restock_list.find({
        "product_id": product_id
    }).sort("created_at", -1).to_list(1000)
    
    return [RestockList(**entry) for entry in restock_entries]

@router.post("/notify/{product_id}")
async def notify_restock_list(product_id: str, _admin=Depends(_verify_admin())):
    """Notify all users on restock list that product is available (Admin only)"""
    db = get_db()
    
    # Get product details
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_name = product.get("name", "Product")
    
    # Get all non-notified restock requests for this product
    restock_entries = await db.restock_list.find({
        "product_id": product_id,
        "notified": False
    }).to_list(1000)
    
    notification_count = 0
    
    for entry in restock_entries:
        try:
            # Send restock notification
            send_email(
                to_email=entry["email"],
                subject=f"🎉 {product_name} is back in stock!",
                body=f"Great news {entry.get('name', '')}!\n\n"
                     f"{product_name} is now back in stock and ready to order.\n"
                     f"Don't wait too long - our pieces are limited edition!\n\n"
                     f"Shop now: https://phileon.com/piece/{product.get('slug', '')}\n\n"
                     f"Best regards,\n"
                     f"The Phileon Team"
            )
            
            # Mark as notified
            await db.restock_list.update_one(
                {"_id": entry["_id"]},
                {"$set": {"notified": True, "updated_at": datetime.utcnow()}}
            )
            
            notification_count += 1
            
        except Exception as e:
            print(f"Failed to send restock notification to {entry['email']}: {e}")
            continue
    
    return {
        "success": True,
        "notifications_sent": notification_count,
        "product_name": product_name
    }

@router.delete("/cleanup/{product_id}")
async def cleanup_restock_list(product_id: str, _admin=Depends(_verify_admin())):
    """Clean up old restock entries for a product (Admin only)"""
    db = get_db()
    
    # Remove all notified entries older than 30 days
    from datetime import timedelta
    cutoff_date = datetime.utcnow() - timedelta(days=30)
    
    result = await db.restock_list.delete_many({
        "product_id": product_id,
        "notified": True,
        "updated_at": {"$lt": cutoff_date}
    })
    
    return {
        "success": True,
        "deleted_count": result.deleted_count
    }