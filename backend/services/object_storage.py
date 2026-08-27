"""
Emergent Object Storage helper for PHILEON.

Reusable module that wraps the Emergent Object Storage HTTP API so upload
endpoints can persist files across pod restarts and deploys. One storage
key is minted at startup and reused across all requests.

Object key convention (must be prefixed to avoid bucket collisions):
    phileon/{surface}/{uuid}.{ext}

Examples:
    phileon/tryon/originals/{cache_key}.jpg
    phileon/tryon/results/{cache_key}.jpg
    phileon/products/images/{uuid}.{ext}
    phileon/products/videos/{uuid}.{ext}
    phileon/customers/{uuid}.{ext}
"""
import logging
import os

import requests

logger = logging.getLogger(__name__)

APP_NAME = "phileon"

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")

# Module-level, set once at startup and reused across requests.
_storage_key: str | None = None


def init_storage(force: bool = False) -> str:
    """Mint (or return cached) session-scoped storage key.

    Call once at startup. Pass force=True to recover from a 404 on an
    inactive key mid-session.
    """
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    if not EMERGENT_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY is not set — cannot init object storage")
    resp = requests.post(
        f"{STORAGE_URL}/init",
        json={"emergent_key": EMERGENT_KEY},
        timeout=30,
    )
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Upload bytes to Object Storage. Returns {"path": "...", "size": N, "etag": "..."}."""
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if resp.status_code == 404:
        # storage_key may have gone inactive — mint a fresh one and retry once.
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    """Download bytes from Object Storage. Returns (content, content_type)."""
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    if resp.status_code == 404:
        # First: try a fresh key in case ours went inactive.
        key = init_storage(force=True)
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60,
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def object_exists(path: str) -> bool:
    """Cheap existence check via GET (Storage API has no HEAD)."""
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=30,
    )
    return resp.status_code == 200


def build_key(surface: str, filename: str) -> str:
    """Compose an app-prefixed object key. `surface` may include sub-paths.

    Example: build_key("tryon/originals", "abc123.jpg")
             -> "phileon/tryon/originals/abc123.jpg"
    """
    surface = surface.strip("/")
    filename = filename.lstrip("/")
    return f"{APP_NAME}/{surface}/{filename}"
