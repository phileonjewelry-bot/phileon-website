from email_utils import send_email

def handle_inventory_alerts(product, previous_stock):
    # LOW STOCK ALERT (send once)
    if (
        product.stock <= product.low_stock_threshold
        and product.stock > 0
        and not product.low_stock_alert_sent
    ):
        send_email(
            subject=f"LOW STOCK: {product.name}",
            body=f"{product.name} is low on stock.\nRemaining units: {product.stock}"
        )
        product.low_stock_alert_sent = True

    # RESTOCK ALERT
    if previous_stock == 0 and product.stock > 0:
        send_email(
            subject=f"RESTOCKED: {product.name}",
            body=f"{product.name} has been restocked.\nNew stock: {product.stock}"
        )
        product.low_stock_alert_sent = False