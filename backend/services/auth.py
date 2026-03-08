import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from passlib.context import CryptContext


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "phileon-customer-jwt-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days


def hash_password(password: str) -> str:
    """Hash a password for storing."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def generate_token() -> str:
    """Generate a secure random token."""
    return secrets.token_urlsafe(32)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


def generate_order_number() -> str:
    """Generate a unique order number."""
    timestamp = datetime.now().strftime('%Y%m%d%H%M')
    random_suffix = secrets.token_hex(3).upper()
    return f"PHI-{timestamp}-{random_suffix}"


def send_verification_email(email: str, token: str):
    """Send email verification (mock implementation)."""
    verification_link = f"https://phileon.com/verify-email?token={token}"
    print(f"[EMAIL] Verification email sent to {email}")
    print(f"[EMAIL] Verification link: {verification_link}")
    # TODO: Integrate with actual email service


def send_password_reset_email(email: str, token: str):
    """Send password reset email (mock implementation)."""
    reset_link = f"https://phileon.com/reset-password?token={token}"
    print(f"[EMAIL] Password reset email sent to {email}")
    print(f"[EMAIL] Reset link: {reset_link}")
    # TODO: Integrate with actual email service