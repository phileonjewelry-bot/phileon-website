#!/usr/bin/env python3
"""
Sample data population script for Phileon Try-On System
"""
import asyncio
import os
from pathlib import Path
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

# Add sample products with try-on data
SAMPLE_PRODUCTS = [
    {
        "id": "eclipse-ring-001",
        "name": "Eclipse Ring",
        "slug": "eclipse-ring",
        "description": "A mesmerizing piece that captures the celestial dance of shadow and light. The Eclipse Ring features a striking black diamond center stone surrounded by a halo of white diamonds, set in 18k white gold with hand-engraved details.",
        "short_description": "Celestial elegance with black diamond centerpiece",
        "collection_id": "signature-001", 
        "images": [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80"
        ],
        "materials": ["18K White Gold", "Black Diamond", "White Diamonds"],
        "price_range": "$8,500 - $12,000",
        "availability": "made_to_order",
        "is_featured": True,
        "is_visible": True,
        "display_order": 1,
        "inventory_count": 3,  # Low stock for testing
        "low_stock_threshold": 5,
        "is_bestseller": True,
        "low_stock_alert_sent": False,
        "restock_alert_sent": False,
        "low_stock_alert_sent_at": None,
        "restock_alert_sent_at": None,
        "tryon_glb_url": None,  # Will be added when 3D models are available
        "tryon_preview_png_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80",
        "tryon_ring_scale": 1.2,
        "stock": 3,  # Legacy compatibility
        "details": {
            "ring_size_range": "4-12",
            "band_width": "2.5mm",
            "stone_carat": "1.5ct center, 0.8ct total accent"
        },
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    },
    {
        "id": "celestial-band-002", 
        "name": "Celestial Band",
        "slug": "celestial-band",
        "description": "Inspired by the infinite expanse of the night sky, this delicate band features scattered diamonds that sparkle like distant stars against rose gold.",
        "short_description": "Delicate star-inspired rose gold band",
        "collection_id": "signature-001",
        "images": [
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
        ],
        "materials": ["18K Rose Gold", "VS1 Diamonds"],
        "price_range": "$3,200 - $4,800",
        "availability": "available",
        "is_featured": True,
        "is_visible": True,
        "display_order": 2,
        "inventory_count": 0,  # Sold out for testing
        "low_stock_threshold": 5,
        "is_bestseller": False,
        "tryon_glb_url": None,
        "tryon_preview_png_url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80",
        "tryon_ring_scale": 0.9,
        "stock": 0,
        "details": {
            "ring_size_range": "4-11",
            "band_width": "1.8mm",
            "diamond_count": "12 scattered diamonds"
        },
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    },
    {
        "id": "serpent-coil-003",
        "name": "Serpent Coil",
        "slug": "serpent-coil", 
        "description": "A bold statement piece that wraps around the finger like an ancient serpent. Crafted in rose gold with emerald eyes that seem to hold ancient wisdom.",
        "short_description": "Bold serpent-inspired statement ring",
        "collection_id": "signature-001",
        "images": [
            "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        ],
        "materials": ["18K Rose Gold", "Emerald", "Black Diamonds"],
        "price_range": "$6,800 - $9,500",
        "availability": "made_to_order",
        "is_featured": True,
        "is_visible": True,
        "display_order": 3,
        "inventory_count": 1,  # Low stock for testing
        "low_stock_threshold": 5,
        "is_bestseller": False,
        "tryon_glb_url": None,
        "tryon_preview_png_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=400&q=80",
        "tryon_ring_scale": 1.1,
        "stock": 1,
        "details": {
            "ring_size_range": "5-10",
            "band_width": "Variable (coil design)",
            "emerald_carat": "0.5ct total"
        },
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
]

SAMPLE_COLLECTION = {
    "id": "signature-001",
    "name": "Signature Collection",
    "slug": "signature",
    "description": "Our most celebrated pieces, each one a testament to exceptional craftsmanship and timeless design.",
    "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
    "display_order": 1,
    "is_active": True,
    "created_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc)
}

async def populate_sample_data():
    """Populate the database with sample data for testing"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'phileon')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Insert collection if it doesn't exist
        existing_collection = await db.collections.find_one({"id": SAMPLE_COLLECTION["id"]})
        if not existing_collection:
            await db.collections.insert_one(SAMPLE_COLLECTION)
            print(f"✅ Created collection: {SAMPLE_COLLECTION['name']}")
        
        # Insert products if they don't exist
        for product in SAMPLE_PRODUCTS:
            existing_product = await db.products.find_one({"id": product["id"]})
            if not existing_product:
                await db.products.insert_one(product)
                print(f"✅ Created product: {product['name']} (inventory: {product['inventory_count']})")
            else:
                # Update existing product with new fields
                await db.products.update_one(
                    {"id": product["id"]},
                    {"$set": {
                        "inventory_count": product["inventory_count"],
                        "low_stock_threshold": product["low_stock_threshold"], 
                        "is_bestseller": product["is_bestseller"],
                        "tryon_glb_url": product["tryon_glb_url"],
                        "tryon_preview_png_url": product["tryon_preview_png_url"],
                        "tryon_ring_scale": product["tryon_ring_scale"],
                        "updated_at": datetime.now(timezone.utc)
                    }}
                )
                print(f"✅ Updated product: {product['name']}")
        
        print("\n🎯 Sample data population complete!")
        print("Products created with different inventory statuses:")
        print("- Eclipse Ring: 3 in stock (low stock)")  
        print("- Celestial Band: 0 in stock (sold out)")
        print("- Serpent Coil: 1 in stock (very low stock)")
        
    except Exception as e:
        print(f"❌ Error populating data: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    # Set environment variables if not already set
    if not os.environ.get('MONGO_URL'):
        os.environ['MONGO_URL'] = 'mongodb://localhost:27017'
    if not os.environ.get('DB_NAME'):
        os.environ['DB_NAME'] = 'phileon'
    
    asyncio.run(populate_sample_data())