import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from passlib.context import CryptContext


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings — SECRET_KEY MUST come from env; no default (fail-closed).
# Rotating the env value invalidates all previously issued customer tokens,
# which is the desired behaviour for SEC-003 remediation.
SECRET_KEY = (os.environ.get("CUSTOMER_JWT_SECRET") or "").strip()
if not SECRET_KEY:
    raise RuntimeError(
        "CUSTOMER_JWT_SECRET is not set. Refusing to start the customer auth "
        "layer with a missing/empty secret."
    )
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
    """Send email verification.

    NOTE: Verification / reset tokens must NEVER be written to server logs
    (they are single-use auth credentials). Wire to the Resend helper once
    the sending domain is verified. Until then this call is a no-op that
    fails silently — customer flows that require verification are guarded
    server-side, not by log inspection.
    """
    # TODO: send via services.email.send_email once Resend is live.
    return None


def send_password_reset_email(email: str, token: str):
    """Send password reset email.

    NOTE: Reset tokens must NEVER be written to server logs. This is a no-op
    until Resend is live; see send_verification_email above.
    """
    # TODO: send via services.email.send_email once Resend is live.
    return None