#!/usr/bin/env python3
"""
Migration script to populate database with initial product data
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Sample products data
products_data = [
    {
        "id": "ring-001",
        "name": "Phileon Signet Ring",
        "slug": "phileon-signet-ring", 
        "category": "rings",
        "price": 2500.00,
        "images": [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1605100804567-1ffe942b5cd6?auto=format&fit=crop&w=800&q=80"
        ],
        "description": "Elegant signet ring crafted with timeless precision. A signature piece that embodies the Phileon legacy.",
        "material": "18K Gold",
        "weight": "8.5g", 
        "certification": "Phileon Certified",
        "inStock": True,
        "stock": 12,
        "low_stock_threshold": 5,
        "bestseller": True,
        "is_active": True,
        "rating": 4.9,
        "reviews": 45
    },
    {
        "id": "1",
        "name": "Eternal Gold Chain Necklace",
        "category": "necklaces",
        "price": 1299.99,
        "images": [
            "https://images.pexels.com/photos/14823622/pexels-photo-14823622.jpeg",
            "https://images.unsplash.com/photo-1583095880514-777b51b6c771"
        ],
        "description": "Handcrafted 18K gold chain necklace with intricate detailing",
        "material": "18K Yellow Gold",
        "weight": "12.5g",
        "certification": "GIA Certified",
        "inStock": True,
        "bestseller": True,
        "rating": 4.8,
        "reviews": 127
    },
    {
        "id": "2",
        "name": "Diamond Solitaire Ring",
        "category": "rings",
        "price": 2499.99,
        "images": [
            "https://images.unsplash.com/photo-1605100804567-1ffe942b5cd6",
            "https://images.unsplash.com/photo-1648564585735-19491888545c"
        ],
        "description": "1.5 carat pear-shaped diamond with double halo set in white gold",
        "material": "14K White Gold, Diamond",
        "weight": "3.2g",
        "certification": "IGI Certified Diamond",
        "inStock": True,
        "bestseller": True,
        "rating": 4.9,
        "reviews": 203
    },
    {
        "id": "3",
        "name": "Classic Gold Bracelet",
        "category": "bracelets",
        "price": 899.99,
        "images": [
            "https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg",
            "https://images.unsplash.com/photo-1587636874655-3e2c869b0cf9"
        ],
        "description": "Timeless gold link bracelet with secure clasp",
        "material": "18K Yellow Gold",
        "weight": "15.8g",
        "certification": "Hallmarked Gold",
        "inStock": True,
        "bestseller": True,
        "rating": 4.7,
        "reviews": 89
    },
    {
        "id": "4",
        "name": "Pearl Drop Earrings",
        "category": "earrings",
        "price": 649.99,
        "images": [
            "https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg",
            "https://images.unsplash.com/photo-1583095880514-777b51b6c771"
        ],
        "description": "Elegant pearl earrings with gold accents",
        "material": "14K Gold, Natural Pearls",
        "weight": "4.5g",
        "certification": "Certified Natural Pearls",
        "inStock": True,
        "bestseller": False,
        "rating": 4.6,
        "reviews": 67
    },
    {
        "id": "5",
        "name": "Classic Wedding Band Set",
        "category": "rings",
        "price": 1799.99,
        "images": [
            "https://images.pexels.com/photos/2735981/pexels-photo-2735981.jpeg",
            "https://images.unsplash.com/photo-1648564585735-19491888545c"
        ],
        "description": "Matching wedding bands in lustrous white gold with diamond accents",
        "material": "18K White Gold",
        "weight": "8.0g (pair)",
        "certification": "Hallmarked Gold",
        "inStock": True,
        "bestseller": True,
        "rating": 5.0,
        "reviews": 156
    },
    {
        "id": "6",
        "name": "Statement Gold Necklace",
        "category": "necklaces",
        "price": 1899.99,
        "images": [
            "https://images.unsplash.com/photo-1583095880514-777b51b6c771",
            "https://images.pexels.com/photos/14823622/pexels-photo-14823622.jpeg"
        ],
        "description": "Bold statement necklace perfect for special occasions",
        "material": "18K Yellow Gold",
        "weight": "22.3g",
        "certification": "GIA Certified",
        "inStock": True,
        "bestseller": False,
        "rating": 4.8,
        "reviews": 92
    },
    {
        "id": "7",
        "name": "Delicate Chain Bracelet",
        "category": "bracelets",
        "price": 599.99,
        "images": [
            "https://images.unsplash.com/photo-1587636874655-3e2c869b0cf9",
            "https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg"
        ],
        "description": "Lightweight and elegant everyday bracelet",
        "material": "14K Yellow Gold",
        "weight": "6.2g",
        "certification": "Hallmarked Gold",
        "inStock": True,
        "bestseller": False,
        "rating": 4.5,
        "reviews": 54
    },
    {
        "id": "8",
        "name": "Hoop Earrings",
        "category": "earrings",
        "price": 799.99,
        "images": [
            "https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg",
            "https://images.unsplash.com/photo-1611540497578-4cb17aa00718"
        ],
        "description": "Classic gold hoop earrings with modern twist",
        "material": "18K Yellow Gold",
        "weight": "5.8g",
        "certification": "Hallmarked Gold",
        "inStock": True,
        "bestseller": True,
        "rating": 4.9,
        "reviews": 178
    },
    {
        "id": "9",
        "name": "Cushion Cut Diamond Ring",
        "category": "rings",
        "price": 3299.99,
        "images": [
            "https://images.unsplash.com/photo-1747116404311-55f8d8944e83",
            "https://images.unsplash.com/photo-1605100804567-1ffe942b5cd6"
        ],
        "description": "2 carat cushion-cut diamond with pavé halo and band",
        "material": "18K White Gold, Diamond",
        "weight": "4.1g",
        "certification": "GIA Certified Diamond",
        "inStock": True,
        "bestseller": True,
        "rating": 4.9,
        "reviews": 145
    },
    {
        "id": "10",
        "name": "Rose Gold Engagement Ring",
        "category": "rings",
        "price": 2899.99,
        "images": [
            "https://images.unsplash.com/photo-1588814096146-e7c56156f9f8",
            "https://images.unsplash.com/photo-1648564585735-19491888545c"
        ],
        "description": "Elegant rose gold ring with round brilliant diamond",
        "material": "14K Rose Gold, Diamond",
        "weight": "3.5g",
        "certification": "IGI Certified Diamond",
        "inStock": True,
        "bestseller": False,
        "rating": 4.8,
        "reviews": 98
    },
    {
        "id": "11",
        "name": "Trio Ring Collection",
        "category": "rings",
        "price": 1599.99,
        "images": [
            "https://images.unsplash.com/photo-1719924998065-0c60e329ef58",
            "https://images.pexels.com/photos/2735981/pexels-photo-2735981.jpeg"
        ],
        "description": "Set of three stackable gold rings with diamond accents",
        "material": "14K Yellow Gold, Diamonds",
        "weight": "5.2g",
        "certification": "Hallmarked Gold",
        "inStock": True,
        "bestseller": False,
        "rating": 4.7,
        "reviews": 76
    }
]

customer_photos_data = [
    {
        "id": "c1",
        "image": "https://images.pexels.com/photos/3674231/pexels-photo-3674231.jpeg",
        "customerName": "Amara K.",
        "productName": "Diamond Solitaire Ring",
        "location": "Paris, France",
        "approved": True
    },
    {
        "id": "c2",
        "image": "https://images.pexels.com/photos/10050218/pexels-photo-10050218.jpeg",
        "customerName": "Marcus D.",
        "productName": "Statement Gold Necklace",
        "location": "London, UK",
        "approved": True
    },
    {
        "id": "c3",
        "image": "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
        "customerName": "Zara M.",
        "productName": "Eternal Gold Chain Necklace",
        "location": "Milan, Italy",
        "approved": True
    },
    {
        "id": "c4",
        "image": "https://images.pexels.com/photos/2584269/pexels-photo-2584269.jpeg",
        "customerName": "Nia T.",
        "productName": "Classic Gold Bracelet",
        "location": "Geneva, Switzerland",
        "approved": True
    },
    {
        "id": "c5",
        "image": "https://images.pexels.com/photos/3693139/pexels-photo-3693139.jpeg",
        "customerName": "Imani R.",
        "productName": "Cushion Cut Diamond Ring",
        "location": "Monaco",
        "approved": True
    },
    {
        "id": "c6",
        "image": "https://images.pexels.com/photos/35358557/pexels-photo-35358557.jpeg",
        "customerName": "Sékou J.",
        "productName": "Wedding Band Set",
        "location": "Brussels, Belgium",
        "approved": True
    }
]

async def populate_database():
    """Populate database with initial data"""
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🚀 Starting database population...")
    
    # Clear existing data
    print("Clearing existing products...")
    await db.products.delete_many({})
    
    print("Clearing existing customer photos...")
    await db.customer_photos.delete_many({})
    
    # Insert products
    print(f"Inserting {len(products_data)} products...")
    await db.products.insert_many(products_data)
    
    # Insert customer photos
    print(f"Inserting {len(customer_photos_data)} customer photos...")
    await db.customer_photos.insert_many(customer_photos_data)
    
    print("✅ Database populated successfully!")
    print(f"   - {len(products_data)} products added")
    print(f"   - {len(customer_photos_data)} customer photos added")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate_database())
