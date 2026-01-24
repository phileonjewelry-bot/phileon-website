from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from .env file
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database Configuration
DATABASE_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "phileon")

# Admin Authentication
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@phileon.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "change_me_to_a_strong_password")

# Email Configuration (SendGrid)
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "orders@getyourphileon.com")

# Payment Integration (Optional)
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_SECRET = os.getenv("PAYPAL_SECRET", "")

# Shipping API (Optional)
EASYPOST_API_KEY = os.getenv("EASYPOST_API_KEY", "")

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")

# Print configuration on startup (excluding sensitive data)
print("🔧 Configuration loaded:")
print(f"   Database: {DB_NAME}")
print(f"   Admin Email: {ADMIN_EMAIL}")
print(f"   SendGrid: {'✓ Configured' if SENDGRID_API_KEY else '✗ Not configured'}")
print(f"   Stripe: {'✓ Configured' if STRIPE_SECRET_KEY else '✗ Not configured'}")
print(f"   EasyPost: {'✓ Configured' if EASYPOST_API_KEY else '✗ Not configured'}")
