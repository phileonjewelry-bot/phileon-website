import smtplib
from email.message import EmailMessage
import os
import logging

# Configure email settings with defaults
SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")

logger = logging.getLogger(__name__)

def send_email(subject: str, body: str, to_email: str = None):
    """
    Send email notification. In DROP MODE, this handles inventory alerts.
    Falls back to logging if SMTP is not configured.
    """
    recipient = to_email or ADMIN_EMAIL
    
    # If SMTP not configured, log the email instead
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.info(f"EMAIL (SMTP not configured): To: {recipient}, Subject: {subject}, Body: {body}")
        print(f"📧 EMAIL ALERT: {subject}")
        print(f"   To: {recipient}")
        print(f"   Body: {body}")
        return
    
    try:
        msg = EmailMessage()
        msg["From"] = SMTP_USER
        msg["To"] = recipient
        msg["Subject"] = subject
        msg.set_content(body)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
            
        logger.info(f"Email sent successfully to {recipient}")
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        # Log the email content instead
        print(f"📧 EMAIL ALERT (Send failed): {subject}")
        print(f"   To: {recipient}")  
        print(f"   Body: {body}")
        print(f"   Error: {str(e)}")