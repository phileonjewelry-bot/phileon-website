from datetime import datetime
from .emailer import send_email

def should_send_low_stock(prev_count: int, new_count: int, threshold: int, already_sent: bool) -> bool:
    # fires ONLY when crossing from > threshold down to <= threshold, and only if not sent for this event
    if threshold is None:
        threshold = 0
    crossed_into_low = (prev_count is not None and prev_count > threshold and new_count <= threshold and new_count > 0)
    return crossed_into_low and not already_sent

def should_reset_low_stock(new_count: int, threshold: int) -> bool:
    # reset guard when stock rises above threshold again (so next time it drops, we email again)
    if threshold is None:
        threshold = 0
    return new_count > threshold

def should_send_restock(prev_count: int, new_count: int, already_sent: bool) -> bool:
    crossed_restock = (prev_count is not None and prev_count <= 0 and new_count > 0)
    return crossed_restock and not already_sent

def should_reset_restock(new_count: int) -> bool:
    # reset guard when it goes back to 0 again
    return new_count <= 0

async def handle_inventory_alerts(product, prev_count: int, new_count: int):
    """
    product = dict or model instance. Must include:
      - name/title
      - _id or id
      - inventory_count
      - low_stock_threshold
      - low_stock_alert_sent
      - restock_alert_sent
    This function sends emails + returns fields to update in DB.
    """
    threshold = product.get("low_stock_threshold", 3)
    updates = {}

    # LOW STOCK
    if should_send_low_stock(prev_count, new_count, threshold, product.get("low_stock_alert_sent", False)):
        subject = f"[Phileon] LOW STOCK: {product.get('name','Product')} (Only {new_count} left)"
        body = (
            f"LOW STOCK ALERT\n\n"
            f"Product: {product.get('name','')}\n"
            f"Product ID: {product.get('_id', product.get('id',''))}\n"
            f"Inventory: {new_count}\n"
            f"Threshold: {threshold}\n\n"
            f"Action: Consider restocking."
        )
        send_email(subject, body)
        updates["low_stock_alert_sent"] = True
        updates["low_stock_alert_sent_at"] = datetime.utcnow()

    # Reset LOW STOCK guard when replenished above threshold
    if product.get("low_stock_alert_sent", False) and should_reset_low_stock(new_count, threshold):
        updates["low_stock_alert_sent"] = False

    # RESTOCK
    if should_send_restock(prev_count, new_count, product.get("restock_alert_sent", False)):
        subject = f"[Phileon] RESTOCKED: {product.get('name','Product')} (Now {new_count} in stock)"
        body = (
            f"RESTOCK ALERT\n\n"
            f"Product: {product.get('name','')}\n"
            f"Product ID: {product.get('_id', product.get('id',''))}\n"
            f"Inventory: {new_count}\n\n"
            f"Action: Consider promoting this restock."
        )
        send_email(subject, body)
        updates["restock_alert_sent"] = True
        updates["restock_alert_sent_at"] = datetime.utcnow()

    # Reset RESTOCK guard when it goes back to 0 again
    if product.get("restock_alert_sent", False) and should_reset_restock(new_count):
        updates["restock_alert_sent"] = False

    return updates