from fastapi import APIRouter, BackgroundTasks, Depends
from typing import List
import os
from datetime import datetime

router = APIRouter(prefix="/inventory", tags=["inventory"])

def get_db():
    from server import db
    return db

def _verify_admin():
    from server import verify_admin
    return verify_admin

async def check_low_stock_products():
    db = get_db()
    
    LOW_STOCK_THRESHOLD = 5
    ALMOST_SOLD_OUT_THRESHOLD = 2
    
    products = await db.products.find().to_list(1000)
    
    low_stock_products = []
    almost_sold_out_products = []
    sold_out_products = []
    
    for product in products:
        stock_qty = product.get('stockQuantity', 0)
        
        # Remove MongoDB _id field for JSON serialization
        if '_id' in product:
            del product['_id']
        
        if stock_qty == 0:
            sold_out_products.append(product)
        elif stock_qty <= ALMOST_SOLD_OUT_THRESHOLD:
            almost_sold_out_products.append(product)
        elif stock_qty <= LOW_STOCK_THRESHOLD:
            low_stock_products.append(product)
    
    return {
        'low_stock': low_stock_products,
        'almost_sold_out': almost_sold_out_products,
        'sold_out': sold_out_products
    }

@router.get("/check-stock")
async def check_stock(_admin=Depends(_verify_admin())):
    products_dict = await check_low_stock_products()
    
    return {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "sold_out": len(products_dict['sold_out']),
            "almost_sold_out": len(products_dict['almost_sold_out']),
            "low_stock": len(products_dict['low_stock']),
            "total_items_need_attention": len(products_dict['sold_out']) + len(products_dict['almost_sold_out']) + len(products_dict['low_stock'])
        },
        "products": products_dict
    }

@router.post("/send-stock-alert")
async def send_stock_alert(background_tasks: BackgroundTasks,
                              _admin=Depends(_verify_admin())):
    products_dict = await check_low_stock_products()
    
    total_items = len(products_dict['sold_out']) + len(products_dict['almost_sold_out']) + len(products_dict['low_stock'])
    
    if total_items == 0:
        return {
            "message": "No low stock items. All inventory levels are healthy.",
            "alert_sent": False
        }
    
    return {
        "message": f"Low stock alert: {total_items} items need attention.",
        "alert_sent": True,
        "summary": {
            "sold_out": len(products_dict['sold_out']),
            "almost_sold_out": len(products_dict['almost_sold_out']),
            "low_stock": len(products_dict['low_stock'])
        }
    }
