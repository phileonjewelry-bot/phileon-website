"""
PHILEON — backend runtime configuration.

Only the values that are actually consumed by shipped code are exported.
Weak default fallbacks (admin passwords, JWT secrets, "changeme" strings)
were removed as part of the Final Security Hardening pass — the audit
flagged them as latent weak-config risk. Missing production secrets now
fail closed instead of silently defaulting.
"""
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from .env file (untracked, gitignored).
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database Configuration
DATABASE_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "phileon")

# Stripe (consumed by services/stripe_service.py + routes/stripe_routes.py).
# Empty defaults are safe — Stripe SDK will simply refuse to authenticate
# until the owner sets real values in .env.
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# Shipping API — consumed by routes/inventory.py alerts if configured.
EASYPOST_API_KEY = os.getenv("EASYPOST_API_KEY", "")

# CORS Configuration — parsed by server.py (see SecurityHeadersMiddleware).
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Removed in Final Security Hardening (audit follow-up):
#   ADMIN_EMAIL / ADMIN_PASSWORD  — superseded by ADMIN_USERNAME + bcrypt
#     ADMIN_PASSWORD_HASH loaded directly in server.py.
#   SECRET_KEY                    — was never used for JWT signing;
#     customer JWT signing now reads CUSTOMER_JWT_SECRET (env-only,
#     fail-closed) via services/auth.py.
#   SENDGRID_API_KEY / _FROM_EMAIL — superseded by Resend, which loads
#     RESEND_API_KEY + PHILEON_FROM_EMAIL via services/email.py.
#   PAYPAL_*                       — PayPal integration is not wired.

# Startup summary — no secret values are ever printed.
print("Configuration loaded:")
print(f"  Database: {DB_NAME}")
print(f"  Stripe: {'configured' if STRIPE_SECRET_KEY else 'not configured'}")
print(f"  Stripe Webhook: {'configured' if STRIPE_WEBHOOK_SECRET else 'not configured'}")
print(f"  EasyPost: {'configured' if EASYPOST_API_KEY else 'not configured'}")
