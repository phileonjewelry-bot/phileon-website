"""OpenAI credential diagnostic — ONE read-only probe.

Rules:
  * NEVER print, log, hash, partially display, or return OPENAI_API_KEY.
  * Do NOT touch PHILEON code.
  * Do NOT invoke the Responses API.
  * Do NOT retry.
  * Do NOT rotate.
"""
import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path("/app/backend/.env"))

API_KEY = os.environ.get("OPENAI_API_KEY") or ""
if not API_KEY:
    print(json.dumps({"probe": "GET /v1/me", "status": "aborted",
                      "reason": "OPENAI_API_KEY not present in env"}))
    raise SystemExit(0)


def scrub(text: str) -> str:
    """Guarantee no substring of the credential leaks through error output.
    We DO NOT redact by printing the key first — we just replace it.
    """
    if not text:
        return text
    if API_KEY in text:
        text = text.replace(API_KEY, "<REDACTED>")
    # Redact any long sk-* fragments defensively.
    import re
    text = re.sub(r"sk-[A-Za-z0-9_\-]{6,}", "<REDACTED>", text)
    text = re.sub(r"Bearer\s+\S+", "Bearer <REDACTED>", text, flags=re.I)
    return text


req = urllib.request.Request(
    "https://api.openai.com/v1/me",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "User-Agent": "phileon-preview-diag/1.0",
        "Accept": "application/json",
    },
    method="GET",
)

t0 = time.perf_counter()
try:
    resp = urllib.request.urlopen(req, timeout=15)
    latency_ms = (time.perf_counter() - t0) * 1000.0
    status = resp.getcode()
    request_id = resp.headers.get("x-request-id") or resp.headers.get("openai-request-id")
    raw = resp.read().decode("utf-8", errors="replace")
except urllib.error.HTTPError as e:
    latency_ms = (time.perf_counter() - t0) * 1000.0
    status = e.code
    request_id = e.headers.get("x-request-id") if e.headers else None
    if not request_id and e.headers:
        request_id = e.headers.get("openai-request-id")
    try:
        raw = e.read().decode("utf-8", errors="replace")
    except Exception:
        raw = ""
except Exception as e:
    latency_ms = (time.perf_counter() - t0) * 1000.0
    status = None
    request_id = None
    raw = f"transport-error: {type(e).__name__}"

# Parse JSON safely.
body = None
try:
    body = json.loads(raw) if raw else None
except Exception:
    body = None

# Extract only the safe error fields.
err_code = None
err_type = None
if isinstance(body, dict):
    err = body.get("error") or {}
    if isinstance(err, dict):
        err_code = err.get("code")
        err_type = err.get("type")

# Extract non-PII account/org identifiers if present.
account_returned = False
org_ids = []
project_ids = []
if status == 200 and isinstance(body, dict):
    account_returned = True
    orgs = body.get("orgs") or body.get("organizations") or {}
    if isinstance(orgs, dict):
        data = orgs.get("data") or []
        if isinstance(data, list):
            for o in data:
                if isinstance(o, dict):
                    # Only the safe id + title (NOT the personal user id
                    # or email or name).
                    org_ids.append({
                        "id":    o.get("id"),
                        "title": o.get("title"),
                    })
    # Some OpenAI accounts also carry projects list under /v1/me.
    if body.get("projects"):
        pd = body.get("projects") or {}
        for p in (pd.get("data") or []):
            if isinstance(p, dict):
                project_ids.append({"id": p.get("id"),
                                     "title": p.get("title") or p.get("name")})

# Scrub any accidental key leakage before any print/serialize.
safe_raw_preview = scrub(raw)[:400] if status != 200 else None

report = {
    "probe":              "GET https://api.openai.com/v1/me",
    "success":            status == 200,
    "http_status":        status,
    "error_code":         err_code,
    "error_type":         err_type,
    "openai_request_id":  request_id,
    "user_or_account_object_returned": account_returned,
    "organizations":      org_ids or None,
    "projects":           project_ids or None,
    "latency_ms":         round(latency_ms, 1),
    "api_key_never_displayed": True,
    "response_body_preview_safe_scrubbed": safe_raw_preview,
}
print(json.dumps(report, indent=2))
