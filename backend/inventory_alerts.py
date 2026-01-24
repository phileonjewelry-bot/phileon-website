from email_utils import send_email
from datetime import datetime, timezone

def handle_inventory_alerts(product, previous_inventory_count):
    """
    DROP MODE Inventory Alerts:
    - Send LOW STOCK email only when crossing from >2 to <=2
    - Don't spam: don't re-send until inventory goes back above 2
    - LOW STOCK UI triggers when inventory_count is 1 or 2
    - SOLD OUT when inventory_count == 0
    """
    current_inventory = product.inventory_count
    threshold = product.low_stock_threshold  # Default = 2
    
    # LOW STOCK ALERT: Send only when crossing the threshold downward
    # From >2 to <=2 (e.g., 3 -> 2)
    if (
        previous_inventory_count > threshold 
        and current_inventory <= threshold 
        and current_inventory > 0
        and not product.low_stock_alert_sent
    ):
        send_email(
            subject=f"🚨 LOW STOCK ALERT: {product.name}",
            body=f"URGENT: {product.name} is now low on stock.\n"
                 f"Remaining units: {current_inventory}\n"
                 f"Threshold: {threshold}\n"
                 f"Previous stock: {previous_inventory_count}"
        )
        product.low_stock_alert_sent = True
        product.low_stock_alert_sent_at = datetime.now(timezone.utc)
        
    # RESTOCK ALERT: When going from 0 to any positive number
    elif previous_inventory_count == 0 and current_inventory > 0:
        send_email(
            subject=f"✅ RESTOCKED: {product.name}",
            body=f"{product.name} has been restocked and is now available!\n"
                 f"New stock count: {current_inventory}\n"
                 f"Ready for orders again."
        )
        # Reset alert flags when restocked above threshold
        if current_inventory > threshold:
            product.low_stock_alert_sent = False
            product.low_stock_alert_sent_at = None
        product.restock_alert_sent = True
        product.restock_alert_sent_at = datetime.now(timezone.utc)
        
    # Reset low stock alert when inventory goes back above threshold
    elif (
        product.low_stock_alert_sent 
        and current_inventory > threshold
    ):
        product.low_stock_alert_sent = False
        product.low_stock_alert_sent_at = None

def get_inventory_status(product):
    """
    Get inventory display status for DROP MODE
    """
    inventory_count = product.inventory_count
    threshold = product.low_stock_threshold
    
    if inventory_count == 0:
        return {
            "status": "sold_out",
            "message": "Sold Out",
            "show_restock_list": True,
            "show_add_to_cart": False,
            "is_low_stock": False,
            "urgency": "high"
        }
    elif inventory_count <= threshold:  # 1 or 2 with default threshold
        return {
            "status": "low_stock", 
            "message": f"Only {inventory_count} left!",
            "show_restock_list": False,
            "show_add_to_cart": True,
            "is_low_stock": True,
            "urgency": "medium" if inventory_count == 2 else "high"
        }
    else:
        return {
            "status": "in_stock",
            "message": "In Stock",
            "show_restock_list": False,
            "show_add_to_cart": True,
            "is_low_stock": False,
            "urgency": "none"
        }