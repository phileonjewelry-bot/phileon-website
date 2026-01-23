from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.order import Order, CreateOrderRequest
import uuid
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["orders"])

def get_db():
    from server import db
    return db

@router.post("", response_model=Order)
async def create_order(order_request: CreateOrderRequest):
    """Create new order"""
    db = get_db()
    
    # Calculate totals
    subtotal = sum(item.price * item.quantity for item in order_request.items)
    
    # Calculate shipping (mock for now, will integrate EasyPost)
    shipping_cost = 0.0 if subtotal >= 100 else 15.0
    
    total = subtotal + shipping_cost
    
    # Create order
    order = Order(
        id=str(uuid.uuid4()),
        email=order_request.email,
        items=[item.dict() for item in order_request.items],
        shippingAddress=order_request.shippingAddress.dict(),
        subtotal=subtotal,
        shippingCost=shipping_cost,
        total=total,
        paymentMethod=order_request.paymentMethod,
        paymentStatus="pending",
        orderStatus="processing",
        createdAt=datetime.utcnow(),
        updatedAt=datetime.utcnow()
    )
    
    await db.orders.insert_one(order.dict())
    
    return order

@router.get("", response_model=List[Order])
async def get_orders(
    email: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all orders (with optional filters)"""
    db = get_db()
    query = {}
    
    if email:
        query["email"] = email
    if status:
        query["orderStatus"] = status
    
    orders = await db.orders.find(query).sort("createdAt", -1).to_list(1000)
    return [Order(**order) for order in orders]

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get single order by ID"""
    db = get_db()
    
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return Order(**order)

@router.put("/{order_id}/status")
async def update_order_status(order_id: str, status: str, tracking_number: Optional[str] = None):
    """Update order status (Admin only)"""
    db = get_db()
    
    update_data = {
        "orderStatus": status,
        "updatedAt": datetime.utcnow()
    }
    
    if tracking_number:
        update_data["trackingNumber"] = tracking_number
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    updated_order = await db.orders.find_one({"id": order_id})
    return Order(**updated_order)

@router.post("/calculate-shipping")
async def calculate_shipping(country: str, state: str, subtotal: float):
    """Calculate shipping cost (Mock - will integrate EasyPost)"""
    
    # Mock shipping calculation
    if subtotal >= 100:
        return {"shippingCost": 0.0, "freeShipping": True}
    
    if country == "USA":
        shipping_cost = 15.0
    else:
        shipping_cost = 35.0
    
    return {"shippingCost": shipping_cost, "freeShipping": False}