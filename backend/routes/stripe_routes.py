from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any
import stripe
import json
import logging
from datetime import datetime
from bson import ObjectId
from config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
from models import Order, OrderItem, ShippingAddress
import uuid

# Configure Stripe
stripe.api_key = STRIPE_SECRET_KEY

router = APIRouter(prefix="/stripe", tags=["stripe"])
logger = logging.getLogger(__name__)

def get_db():
    from server import db
    return db

async def _load_product(product_id: str):
    """Load product by ID, supporting both ObjectId and string IDs"""
    db = get_db()
    try:
        # First try by ObjectId for MongoDB documents with ObjectId _id
        try:
            return await db.products.find_one({"_id": ObjectId(product_id)})
        except:
            # Fallback to string ID lookup for products with string IDs
            return await db.products.find_one({"id": product_id})
    except Exception:
        return None

def _pname(p):
    """Get product name from various possible fields"""
    return p.get("name") or p.get("title") or "Product"

@router.post("/create-payment-intent")
async def create_payment_intent(payment_data: Dict[str, Any]):
    """Create Stripe Payment Intent for card payments"""
    try:
        # Extract cart items and calculate amount
        items = payment_data.get("items", [])
        shipping_address = payment_data.get("shippingAddress", {})
        email = payment_data.get("email")
        
        # Calculate total amount
        subtotal = sum(item["price"] * item["quantity"] for item in items)
        shipping_cost = 0.0 if subtotal >= 100 else (15.0 if shipping_address.get("country") == "USA" else 35.0)
        total_amount = int((subtotal + shipping_cost) * 100)  # Convert to cents
        
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=total_amount,
            currency="usd",
            payment_method_types=["card", "apple_pay", "google_pay"],
            receipt_email=email,
            metadata={
                "email": email,
                "subtotal": str(subtotal),
                "shipping_cost": str(shipping_cost),
                "items_count": str(len(items))
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": total_amount,
            "currency": "usd"
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/create-checkout-session")
async def create_checkout_session(session_data: Dict[str, Any]):
    """Create Stripe Checkout Session for comprehensive payment methods with inventory validation"""
    try:
        items = session_data.get("items", [])
        success_url = session_data.get("success_url", "https://yourdomain.com/success")
        cancel_url = session_data.get("cancel_url", "https://yourdomain.com/cancel")
        email = session_data.get("email")
        shipping_address = session_data.get("shippingAddress", {})
        
        # INVENTORY VALIDATION - Check stock before creating Stripe session
        validation_errors = []
        for item in items:
            # Support both product_id (from cart context) and direct item data
            pid = item.get("product_id")
            qty = int(item.get("qty", item.get("quantity", 1)))

            if pid:
                # Validate inventory for items with product_id
                product = await _load_product(pid)
                if not product:
                    validation_errors.append(f"Product not found: {pid}")
                    continue

                inv = int(product.get("inventory_count", 0))
                if inv <= 0:
                    validation_errors.append(f"{_pname(product)} is SOLD OUT.")
                elif inv < qty:
                    validation_errors.append(f"{_pname(product)} only has {inv} left (you requested {qty}).")
        
        # If any inventory issues, return error before creating Stripe session
        if validation_errors:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "OUT_OF_STOCK",
                    "messages": validation_errors
                }
            )
        
        # Create line items for Stripe
        line_items = []
        for item in items:
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": item["name"],
                        "description": item.get("description", ""),
                        "images": item.get("images", [])
                    },
                    "unit_amount": int(item["price"] * 100)  # Convert to cents
                },
                "quantity": item.get("quantity", item.get("qty", 1))
            })
        
        # Calculate shipping
        subtotal = sum(item["price"] * item["quantity"] for item in items)
        shipping_cost = 0.0 if subtotal >= 100 else (15.0 if shipping_address.get("country") == "USA" else 35.0)
        
        # Add shipping as line item if applicable
        if shipping_cost > 0:
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Shipping"
                    },
                    "unit_amount": int(shipping_cost * 100)
                },
                "quantity": 1
            })
        
        # Create checkout session with multiple payment methods
        session = stripe.checkout.Session.create(
            payment_method_types=[
                "card",           # Credit/Debit cards
                "apple_pay",     # Apple Pay
                "google_pay",    # Google Pay  
                "paypal"         # PayPal
            ],
            line_items=line_items,
            mode="payment",
            success_url=f"{success_url}?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=cancel_url,
            customer_email=email,
            billing_address_collection="required",
            shipping_address_collection={
                "allowed_countries": ["US", "CA", "GB", "AU"]
            },
            metadata={
                "email": email,
                "items_data": json.dumps(items),
                "shipping_address": json.dumps(shipping_address)
            }
        )
        
        return {
            "checkout_url": session.url,
            "session_id": session.id
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/confirm-payment")
async def confirm_payment(payment_data: Dict[str, Any]):
    """Confirm payment and create order"""
    try:
        payment_intent_id = payment_data.get("payment_intent_id")
        email = payment_data.get("email")
        items = payment_data.get("items", [])
        shipping_address = payment_data.get("shippingAddress", {})
        
        # Retrieve payment intent from Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == "succeeded":
            # Create order in database
            db = get_db()
            
            subtotal = sum(item["price"] * item["quantity"] for item in items)
            shipping_cost = 0.0 if subtotal >= 100 else (15.0 if shipping_address.get("country") == "USA" else 35.0)
            
            order = Order(
                id=str(uuid.uuid4()),
                email=email,
                items=[OrderItem(**item) for item in items],
                shippingAddress=ShippingAddress(**shipping_address),
                subtotal=subtotal,
                shippingCost=shipping_cost,
                total=subtotal + shipping_cost,
                paymentMethod="card",
                paymentStatus="completed",
                paymentIntentId=payment_intent_id,
                orderStatus="confirmed",
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )
            
            await db.orders.insert_one(order.dict())
            
            return {
                "success": True,
                "order_id": order.id,
                "message": "Payment confirmed and order created"
            }
        else:
            raise HTTPException(status_code=400, detail="Payment not completed")
            
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        logger.error(f"Error confirming payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/session/{session_id}")
async def get_checkout_session(session_id: str):
    """Retrieve checkout session details"""
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == "paid":
            # Create order from session data
            db = get_db()
            
            items_data = json.loads(session.metadata.get("items_data", "[]"))
            shipping_address_data = json.loads(session.metadata.get("shipping_address", "{}"))
            
            # Check if order already exists
            existing_order = await db.orders.find_one({"checkoutSessionId": session_id})
            
            if not existing_order:
                subtotal = session.amount_subtotal / 100
                shipping_cost = (session.amount_total - session.amount_subtotal) / 100
                
                order = Order(
                    id=str(uuid.uuid4()),
                    email=session.customer_email,
                    items=[OrderItem(**item) for item in items_data],
                    shippingAddress=ShippingAddress(**shipping_address_data),
                    subtotal=subtotal,
                    shippingCost=shipping_cost,
                    total=session.amount_total / 100,
                    paymentMethod=session.payment_method_types[0] if session.payment_method_types else "card",
                    paymentStatus="completed",
                    checkoutSessionId=session_id,
                    orderStatus="confirmed",
                    createdAt=datetime.utcnow(),
                    updatedAt=datetime.utcnow()
                )
                
                await db.orders.insert_one(order.dict())
                
                return {
                    "success": True,
                    "order_id": order.id,
                    "session": {
                        "id": session.id,
                        "payment_status": session.payment_status,
                        "customer_email": session.customer_email,
                        "amount_total": session.amount_total
                    }
                }
            else:
                return {
                    "success": True,
                    "order_id": existing_order["id"],
                    "message": "Order already exists"
                }
        else:
            return {
                "success": False,
                "message": "Payment not completed"
            }
            
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        logger.error(f"Error retrieving session: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        logger.info(f"Payment succeeded: {payment_intent['id']}")
        
    elif event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        logger.info(f"Checkout session completed: {session['id']}")
        
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        logger.error(f"Payment failed: {payment_intent['id']}")
        
    else:
        logger.info(f"Unhandled event type: {event['type']}")
    
    return {"success": True}

@router.get("/config")
async def get_stripe_config():
    """Get Stripe publishable key for frontend"""
    from config import STRIPE_SECRET_KEY
    
    # Return publishable key (starts with pk_)
    # In production, store this separately in env vars
    return {
        "publishable_key": "pk_test_" if STRIPE_SECRET_KEY.startswith("sk_test_") else "pk_live_"
    }