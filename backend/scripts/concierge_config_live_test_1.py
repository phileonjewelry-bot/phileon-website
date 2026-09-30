"""Supervised PREVIEW harness — Configuration Recovery LIVE TEST 1.
Single real invocation of run_turn (same call the /api/concierge/message
route makes). No code changes. OPENAI_API_KEY never printed.
"""
import asyncio
import json
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, "/app/backend")
from dotenv import load_dotenv  # noqa: E402
load_dotenv(Path("/app/backend/.env"))

from services.phileon_concierge import (  # noqa: E402
    STATS, public_view, run_turn, active_customer_constraints,
    is_enabled, current_model,
)

print("is_enabled():", is_enabled(),
      " model:", current_model(),
      " OPENAI_API_KEY_present:", bool((os.environ.get("OPENAI_API_KEY") or "").strip()))

pre = STATS.snapshot()

MESSAGE = (
    "I'm looking for a men's statement ring. Something black or dark, "
    "not traditional, and I want to stay under $4,000."
)

print("=" * 78)
print("PRE-RUN STATS SNAPSHOT")
print(json.dumps(pre, indent=2))
print("=" * 78)
print("ACTIVE CUSTOMER CONSTRAINTS (history=[], current=MESSAGE)")
print(json.dumps(active_customer_constraints([], MESSAGE), indent=2))
print("=" * 78)

t0 = time.perf_counter()
result = asyncio.run(run_turn(message=MESSAGE, history=[]))
client_latency_ms = (time.perf_counter() - t0) * 1000.0

print()
print("CLIENT WALL-CLOCK LATENCY (ms):", round(client_latency_ms, 1))
print("SERVER latency_ms:", result.get("latency_ms"))
print("TOOL CALLS USED:", result.get("tool_calls_used"))
print("=" * 78)

pub = public_view(result)
print("PUBLIC-VIEW RESPONSE (what the browser receives)")
print(json.dumps(pub, indent=2))
print("=" * 78)

internal = dict(result.get("_internal_evidence") or {})
trace = internal.pop("tool_trace", None)
print("INTERNAL EVIDENCE (test harness only)")
print(json.dumps(internal, indent=2, default=str))
print()
print("TOOL TRACE (ordered)")
if trace:
    for i, step in enumerate(trace, 1):
        print(f"\n--- STEP {i}: {step.get('tool')} ---")
        print("args:", json.dumps(step.get("args"), indent=2, default=str))
        print("output:", json.dumps(step.get("output"), indent=2, default=str))
else:
    print("(no tool trace recorded)")

print("=" * 78)
post = STATS.snapshot()
print("POST-RUN STATS SNAPSHOT")
print(json.dumps(post, indent=2))
print("DELTA")
print(json.dumps(
    {k: (post[k] - pre.get(k, 0)) if isinstance(post[k], (int, float)) else post[k]
     for k in post}, indent=2,
))
