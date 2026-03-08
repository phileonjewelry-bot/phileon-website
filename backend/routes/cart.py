from fastapi import APIRouter, HTTPException
from typing import List
from models import Product
import uuid
from datetime import datetime

router = APIRouter(prefix="/cart", tags=["cart"])

def get_db():
    from server import db
    return db

@router.post("")
async def add_to_cart(user_id: str, request: AddToCartRequest):
    """Add item to cart"""
    db = get_db()
    
    # Get product details
    product = await db.products.find_one({"id": request.productId})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create cart
    cart = await db.carts.find_one({"userId": user_id})
    
    if not cart:
        # Create new cart
        cart_item = CartItem(
            productId=request.productId,
            quantity=request.quantity,
            price=product["price"],
            name=product["name"],
            image=product["images"][0] if product["images"] else "",
            material=product.get("material", "")
        )
        
        new_cart = Cart(
            id=str(uuid.uuid4()),
            userId=user_id,
            items=[cart_item.dict()],
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow()
        )
        
        await db.carts.insert_one(new_cart.dict())
        return new_cart
    
    else:
        # Update existing cart
        items = cart.get("items", [])
        
        # Check if item already in cart
        item_exists = False
        for item in items:
            if item["productId"] == request.productId:
                item["quantity"] += request.quantity
                item_exists = True
                break
        
        # Add new item if not exists
        if not item_exists:
            new_item = CartItem(
                productId=request.productId,
                quantity=request.quantity,
                price=product["price"],
                name=product["name"],
                image=product["images"][0] if product["images"] else "",
                material=product.get("material", "")
            )
            items.append(new_item.dict())
        
        # Update cart
        await db.carts.update_one(
            {"userId": user_id},
            {"$set": {"items": items, "updatedAt": datetime.utcnow()}}
        )
        
        updated_cart = await db.carts.find_one({"userId": user_id})
        return Cart(**updated_cart)

@router.get("/{user_id}", response_model=Cart)
async def get_cart(user_id: str):
    """Get user's cart"""
    db = get_db()
    
    cart = await db.carts.find_one({"userId": user_id})
    
    if not cart:
        # Return empty cart
        return Cart(
            id=str(uuid.uuid4()),
            userId=user_id,
            items=[]
        )
    
    return Cart(**cart)

@router.put("/{user_id}/items/{product_id}")
async def update_cart_item(user_id: str, product_id: str, request: UpdateCartItemRequest):
    """Update cart item quantity"""
    db = get_db()
    
    cart = await db.carts.find_one({"userId": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    item_found = False
    
    for item in items:
        if item["productId"] == product_id:
            if request.quantity <= 0:
                items.remove(item)
            else:
                item["quantity"] = request.quantity
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    await db.carts.update_one(
        {"userId": user_id},
        {"$set": {"items": items, "updatedAt": datetime.utcnow()}}
    )
    
    updated_cart = await db.carts.find_one({"userId": user_id})
    return Cart(**updated_cart)

@router.delete("/{user_id}/items/{product_id}")
async def remove_from_cart(user_id: str, product_id: str):
    """Remove item from cart"""
    db = get_db()
    
    cart = await db.carts.find_one({"userId": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    items = [item for item in items if item["productId"] != product_id]
    
    await db.carts.update_one(
        {"userId": user_id},
        {"$set": {"items": items, "updatedAt": datetime.utcnow()}}
    )
    
    return {"message": "Item removed from cart"}

@router.delete("/{user_id}")
async def clear_cart(user_id: str):
    """Clear entire cart"""
    db = get_db()
    
    await db.carts.update_one(
        {"userId": user_id},
        {"$set": {"items": [], "updatedAt": datetime.utcnow()}}
    )
    
    return {"message": "Cart cleared"}