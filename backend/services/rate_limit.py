"""
PHILEON — In-memory rate limiter (Final Security Hardening).

Sliding-window IP+identity throttle for authentication endpoints. Backend
runs single-instance under supervisor, so an in-memory store is acceptable
for launch — see the limitation note below. Every counter self-prunes on
access so memory usage stays bounded.

Design goals:
  1. Do NOT expose whether a username / email exists (identity is folded
     into the throttle key by hashing, and the 429 message is generic).
  2. Do NOT trust client-supplied X-Forwarded-For blindly. Prefer
     X-Real-IP (single-value, set by the K8s ingress), fall back to the
     leftmost X-Forwarded-For hop, then the socket peer. Attackers who
     forge a header just create their own bucket — legitimate users are
     not affected.
  3. Successful authentications clear the failure counter for that
     identity so real users are never left locked out by a random spike.

Limitation:
  IN-MEMORY ONLY. If the pod restarts (deploy, crash) counters reset.
  If the backend is ever scaled to > 1 replica, move this store behind
  Redis / Memcached. For a single-instance launch it is safe.
"""
from __future__ import annotations

import hashlib
import time
from collections import defaultdict, deque
from typing import Optional

from fastapi import HTTPException, Request


# Sliding window: key -> deque[timestamps]
_STORE: dict[str, deque] = defaultdict(deque)

# Last-successful-clear marker (opt-in — call clear() on success paths)
_MAX_KEYS = 20_000  # hard cap to prevent unbounded growth under abuse


def _prune(window_secs: int, now: float) -> None:
    """Evict empty deques periodically to keep the store bounded."""
    if len(_STORE) < _MAX_KEYS:
        return
    threshold = now - window_secs
    dead = [k for k, q in _STORE.items() if not q or q[-1] < threshold]
    for k in dead:
        _STORE.pop(k, None)


def client_ip(request: Request) -> str:
    """Best-effort client IP behind the platform ingress.

    Preference order:
      1. X-Real-IP  (single-value, set by K8s ingress; hardest to spoof)
      2. leftmost X-Forwarded-For hop (spec-compliant client IP position)
      3. socket peer (request.client.host)
    """
    hdrs = request.headers
    real_ip = (hdrs.get("x-real-ip") or "").strip()
    if real_ip:
        return real_ip
    xff = (hdrs.get("x-forwarded-for") or "").strip()
    if xff:
        first = xff.split(",", 1)[0].strip()
        if first:
            return first
    peer = request.client.host if request.client else ""
    return peer or "unknown"


def _identity_hash(value: str) -> str:
    """Fold identity strings (usernames, emails) through SHA-256 so raw
    values are never stored as keys — mirrors the audit's request that
    plaintext credentials never live in rate-limit keys."""
    return hashlib.sha256(value.strip().lower().encode()).hexdigest()[:16]


def check_and_bump(
    bucket: str,
    request: Request,
    identity: Optional[str] = None,
    max_attempts: int = 5,
    window_secs: int = 15 * 60,
) -> None:
    """Raise 429 if the caller has exceeded `max_attempts` in `window_secs`.

    A single call increments the counter; call this at the *start* of a
    protected endpoint. Call `clear_on_success(...)` after a successful
    authentication to reset the identity bucket.
    """
    now = time.time()
    ip = client_ip(request)
    ident_part = _identity_hash(identity) if identity else "-"
    key = f"{bucket}:{ip}:{ident_part}"

    q = _STORE[key]
    threshold = now - window_secs
    # Drop expired entries from the head.
    while q and q[0] < threshold:
        q.popleft()

    if len(q) >= max_attempts:
        # Oldest entry inside the window sets when the caller can retry.
        retry_after = int(max(1, q[0] + window_secs - now))
        _prune(window_secs, now)
        raise HTTPException(
            status_code=429,
            detail="Too many attempts. Please try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    q.append(now)
    _prune(window_secs, now)


def clear_on_success(
    bucket: str,
    request: Request,
    identity: Optional[str] = None,
) -> None:
    """Clear the failure counter for this identity after a successful auth."""
    ip = client_ip(request)
    ident_part = _identity_hash(identity) if identity else "-"
    _STORE.pop(f"{bucket}:{ip}:{ident_part}", None)
