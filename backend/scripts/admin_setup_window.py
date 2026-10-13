"""Arm / disarm the one-time admin setup window (PREVIEW ONLY). Prints NO secret values.

Usage:
    python scripts/admin_setup_window.py arm      # rotate token, open 10-minute window
    python scripts/admin_setup_window.py disarm   # scrub token + expiry from .env
    python scripts/admin_setup_window.py status   # non-sensitive status

Edits only the ADMIN_SETUP_TOKEN / ADMIN_SETUP_EXPIRES_AT lines of /app/backend/.env.
Restart the backend afterwards: `sudo supervisorctl restart backend`.
"""
import re
import secrets
import sys
from datetime import datetime, timedelta, timezone

ENV = "/app/backend/.env"
WINDOW_MINUTES = 10


def _write(token: str, expires: str) -> None:
    with open(ENV, "r", encoding="utf-8") as fh:
        text = fh.read()
    for key, val in (("ADMIN_SETUP_TOKEN", token), ("ADMIN_SETUP_EXPIRES_AT", expires)):
        line = f"{key}={val}"
        if re.search(rf"^{key}=.*$", text, flags=re.M):
            text = re.sub(rf"^{key}=.*$", line, text, flags=re.M)
        else:
            text = text.rstrip("\n") + "\n" + line + "\n"
    with open(ENV, "w", encoding="utf-8") as fh:
        fh.write(text)


def main() -> None:
    cmd = (sys.argv[1] if len(sys.argv) > 1 else "status").lower()
    if cmd == "arm":
        exp = (datetime.now(timezone.utc) + timedelta(minutes=WINDOW_MINUTES)).replace(microsecond=0)
        _write(secrets.token_urlsafe(48), exp.isoformat())
        print(f"armed: window closes at {exp.isoformat()} (token written to .env only; not displayed)")
    elif cmd == "disarm":
        _write("", "")
        print("disarmed: token and expiry cleared")
    else:
        with open(ENV, encoding="utf-8") as fh:
            text = fh.read()
        tok = re.search(r"^ADMIN_SETUP_TOKEN=(.*)$", text, flags=re.M)
        exp = re.search(r"^ADMIN_SETUP_EXPIRES_AT=(.*)$", text, flags=re.M)
        print(f"token configured: {bool(tok and len(tok.group(1).strip()) >= 32)} · expires_at: {(exp.group(1).strip() if exp else '') or '—'}")


if __name__ == "__main__":
    main()
