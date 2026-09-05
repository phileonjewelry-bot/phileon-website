"""20-iteration live round-trip against preview URL to verify unsub link reliability."""
import os
import random
import string
import sys
import requests

sys.path.insert(0, "/app/backend")
from services import retention_service as R  # noqa: E402

BASE = "https://labete-gallery.preview.emergentagent.com"

def rand_email():
    local = "".join(random.choices(string.ascii_lowercase + string.digits, k=random.randint(3, 20)))
    dom = "".join(random.choices(string.ascii_lowercase, k=random.randint(3, 8)))
    return f"{local}@{dom}.com"

fails = []
for i in range(20):
    email = rand_email()
    token = R.make_unsub_token(email)
    r = requests.get(f"{BASE}/api/unsubscribe", params={"token": token}, timeout=15)
    ok = r.status_code == 200 and "UNSUBSCRIBED" in r.text.upper() and "UNABLE" not in r.text.upper()
    if not ok:
        fails.append((i, email, r.status_code, r.text[:200]))
    print(f"[{i+1}/20] {email} status={r.status_code} ok={ok}")

print("\n=== RESULT ===")
print(f"Failures: {len(fails)}/20")
for f in fails:
    print(f)
sys.exit(0 if not fails else 1)
