import stripe
from typing import Dict, List, Any, Optional
from config import STRIPE_SECRET_KEY
import logging

# Configure Stripe
stripe.api_key = STRIPE_SECRET_KEY
logger = logging.getLogger(__name__)

class StripeService:
    """Service class for Stripe operations"""
    
    @staticmethod
    def calculate_shipping_cost(subtotal: float, country: str = "USA") -> float:
        """Calculate shipping cost based on subtotal and country"""
        if subtotal >= 100:
            return 0.0
        return 15.0 if country == "USA" else 35.0
    
    @staticmethod
    def create_payment_intent(
        amount: int,
        currency: str = "usd",
        payment_methods: List[str] = None,
        metadata: Dict[str, str] = None,
        receipt_email: str = None
    ) -> stripe.PaymentIntent:
        """Create a Stripe PaymentIntent"""
        if payment_methods is None:
            payment_methods = ["card", "apple_pay", "google_pay"]
        
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                payment_method_types=payment_methods,
                metadata=metadata or {},
                receipt_email=receipt_email
            )
            return intent
        except stripe.error.StripeError as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            raise
    
    @staticmethod
    def create_checkout_session(
        line_items: List[Dict],
        success_url: str,
        cancel_url: str,
        customer_email: str = None,
        metadata: Dict[str, str] = None,
        payment_methods: List[str] = None
    ) -> stripe.checkout.Session:
        """Create a Stripe Checkout Session"""
        if payment_methods is None:
            payment_methods = ["card", "apple_pay", "google_pay", "paypal"]
        
        try:
            session_data = {
                "payment_method_types": payment_methods,
                "line_items": line_items,
                "mode": "payment",
                "success_url": success_url,
                "cancel_url": cancel_url,
                "billing_address_collection": "required",
                "shipping_address_collection": {
                    "allowed_countries": ["US", "CA", "GB", "AU", "DE", "FR", "IT", "ES"]
                }
            }
            
            if customer_email:
                session_data["customer_email"] = customer_email
            
            if metadata:
                session_data["metadata"] = metadata
            
            session = stripe.checkout.Session.create(**session_data)
            return session
        except stripe.error.StripeError as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            raise
    
    @staticmethod
    def retrieve_payment_intent(payment_intent_id: str) -> stripe.PaymentIntent:
        """Retrieve a PaymentIntent by ID"""
        try:
            return stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.error.StripeError as e:
            logger.error(f"Error retrieving payment intent: {str(e)}")
            raise
    
    @staticmethod
    def retrieve_checkout_session(session_id: str) -> stripe.checkout.Session:
        """Retrieve a Checkout Session by ID"""
        try:
            return stripe.checkout.Session.retrieve(session_id)
        except stripe.error.StripeError as e:
            logger.error(f"Error retrieving checkout session: {str(e)}")
            raise
    
    @staticmethod
    def construct_webhook_event(payload: bytes, sig_header: str, webhook_secret: str):
        """Construct and verify webhook event"""
        try:
            return stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except ValueError:
            logger.error("Invalid webhook payload")
            raise
        except stripe.error.SignatureVerificationError:
            logger.error("Invalid webhook signature")
            raise
    
    @staticmethod
    def format_line_items_from_cart(cart_items: List[Dict]) -> List[Dict]:
        """Convert cart items to Stripe line items format"""
        line_items = []
        
        for item in cart_items:
            line_item = {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": item["name"],
                        "description": item.get("description", ""),
                    },
                    "unit_amount": int(item["price"] * 100)  # Convert to cents
                },
                "quantity": item["quantity"]
            }
            
            # Add images if available
            if item.get("images"):
                line_item["price_data"]["product_data"]["images"] = item["images"][:8]  # Max 8 images
            
            line_items.append(line_item)
        
        return line_items
    
    @staticmethod
    def add_shipping_line_item(line_items: List[Dict], shipping_cost: float) -> List[Dict]:
        """Add shipping as a line item if cost > 0"""
        if shipping_cost > 0:
            shipping_item = {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Shipping",
                        "description": "Standard shipping"
                    },
                    "unit_amount": int(shipping_cost * 100)
                },
                "quantity": 1
            }
            line_items.append(shipping_item)
        
        return line_items