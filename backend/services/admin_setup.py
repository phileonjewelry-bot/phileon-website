"""PHILEON — One-time, owner-token-gated first-time admin setup (PREVIEW ONLY).

Gate (ALL must hold, fail-closed):
    1. Server env is not production (`PHILEON_ENV` via analytics current_env()).
    2. `ADMIN_SETUP_TOKEN` configured (>= 32 chars) in backend env only.
    3. `ADMIN_SETUP_EXPIRES_AT` (UTC ISO) is in the future (10-minute window).
    4. Zero administrator accounts in `db.admins`.
    5. No prior completion marker.

Security contract:
    * Token compared in constant time; never logged, never echoed.
    * Password stored ONLY as bcrypt hash (cost 12). Plaintext never persisted.
    * Atomic single-account creation via fixed `_id` -> concurrent attempts 409.
    * Successful completion closes the gate permanently (account exists +
      marker) and scrubs the token from the running process.
    * Production authentication (env credential path) is untouched when no
      DB admin exists.
"""
from __future__ import annotations

import hmac
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

import bcrypt
from pymongo.errors import DuplicateKeyError

from services.analytics_service import current_env

OWNER_ADMIN_ID = "owner-admin"
STATE_ID = "state"
_USERNAME_RX = re.compile(r"^[A-Za-z0-9_.-]{3,32}$")
MIN_PASSWORD = 12
MAX_PASSWORD = 128


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _token() -> str:
    return (os.environ.get("ADMIN_SETUP_TOKEN") or "").strip()


def _expires_at() -> Optional[datetime]:
    raw = (os.environ.get("ADMIN_SETUP_EXPIRES_AT") or "").strip()
    if not raw:
        return None
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


async def admin_account_count(db) -> int:
    return await db.admins.count_documents({})


async def setup_state(db) -> Dict[str, Any]:
    """Public, non-sensitive gate status. Never includes the token."""
    env = current_env()
    exp = _expires_at()
    if env == "production":
        return {"open": False, "reason": "production_env", "env": env, "expires_at": None}
    if await db.admin_setup_state.find_one({"_id": STATE_ID, "completed_at": {"$exists": True}}):
        return {"open": False, "reason": "completed", "env": env, "expires_at": None}
    if await admin_account_count(db) > 0:
        return {"open": False, "reason": "account_exists", "env": env, "expires_at": None}
    if len(_token()) < 32:
        return {"open": False, "reason": "token_not_configured", "env": env, "expires_at": None}
    if exp is None:
        return {"open": False, "reason": "window_not_opened", "env": env, "expires_at": None}
    if _now() >= exp:
        return {"open": False, "reason": "window_expired", "env": env, "expires_at": exp.isoformat()}
    return {"open": True, "reason": "open", "env": env, "expires_at": exp.isoformat()}


def validate_inputs(username: str, password: str, confirm: str) -> Optional[str]:
    if not _USERNAME_RX.match(username or ""):
        return "USERNAME_INVALID"
    if not isinstance(password, str) or len(password) < MIN_PASSWORD:
        return "PASSWORD_TOO_SHORT"
    if len(password) > MAX_PASSWORD:
        return "PASSWORD_TOO_LONG"
    if password != confirm:
        return "PASSWORD_MISMATCH"
    if password.lower() == username.lower() or "phileon" == password.lower():
        return "PASSWORD_TOO_WEAK"
    return None


async def complete_setup(db, *, setup_token: str, username: str, password: str,
                         confirm: str) -> Tuple[int, Dict[str, Any]]:
    """Returns (http_status, body). Body never contains secrets."""
    state = await setup_state(db)
    if not state["open"]:
        return 403, {"detail": "SETUP_CLOSED", "reason": state["reason"]}
    if not hmac.compare_digest((setup_token or "").strip(), _token()):
        return 403, {"detail": "INVALID_SETUP_TOKEN"}
    err = validate_inputs(username, password, confirm)
    if err:
        return 422, {"detail": err}
    # Re-check immediately before insert to narrow the race window; the fixed
    # _id makes the insert itself the authoritative single-winner guard.
    if await admin_account_count(db) > 0:
        return 409, {"detail": "ACCOUNT_ALREADY_CREATED"}
    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")
    now = _now().isoformat()
    try:
        await db.admins.insert_one({"_id": OWNER_ADMIN_ID, "username": username, "password_hash": pw_hash,
                                    "role": "owner", "source": "first_time_setup", "env": current_env(),
                                    "created_at": now})
    except DuplicateKeyError:
        return 409, {"detail": "ACCOUNT_ALREADY_CREATED"}
    await db.admin_setup_state.update_one({"_id": STATE_ID}, {"$set": {"completed_at": now, "username": username}},
                                          upsert=True)
    os.environ["ADMIN_SETUP_TOKEN"] = ""
    os.environ["ADMIN_SETUP_EXPIRES_AT"] = ""
    return 201, {"ok": True, "username": username, "login_path": "/admin/login"}


async def authenticate_admin(db, *, username: str, password: str) -> bool:
    """Owner-created DB admin takes precedence. When at least one DB admin
    exists the legacy env credential is NOT accepted. With zero DB admins the
    env credential path (production behaviour) is unchanged."""
    if await admin_account_count(db) > 0:
        admin = await db.admins.find_one({"username": username}, {"password_hash": 1})
        if not admin:
            return False
        return bcrypt.checkpw(password.encode("utf-8"), str(admin["password_hash"]).encode("utf-8"))
    env_username = (os.environ.get("ADMIN_USERNAME") or "").strip()
    env_hash = (os.environ.get("ADMIN_PASSWORD_HASH") or "").strip()
    if env_username and env_hash:
        return username == env_username and bcrypt.checkpw(password.encode("utf-8"), env_hash.encode("utf-8"))
    return False
