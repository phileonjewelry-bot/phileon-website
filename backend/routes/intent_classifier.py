"""PHILEON — Intent Classifier admin surface (SHADOW MODE).

Owner-only:

    GET  /api/admin/analytics/intent-shadow          — aggregate summary
    GET  /api/admin/analytics/intent-shadow/recent   — last N decisions
    POST /api/admin/analytics/intent-shadow/classify — manual classify

Never exposes shadow decisions to the public surface. Never triggers
downstream effects (emails, merchandising, checkout).
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from services import intent_classifier as IC
from services.analytics_service import sanitize_env


admin_router = APIRouter(prefix="/admin/analytics/intent-shadow",
                         tags=["intent_shadow"])


def _get_deps():
    from server import verify_admin, db
    return verify_admin, db


verify_admin, db = _get_deps()


class ClassifyIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: str = Field(min_length=8, max_length=128)


@admin_router.get("")
async def summary(period: str = Query(default="30d"),
                  env: Optional[str] = Query(default=None),
                  _: str = Depends(verify_admin)):
    days = {"today": 1, "7d": 7, "30d": 30, "90d": 90}.get(period, 30)
    return await IC.summarize(db, env=sanitize_env(env), days=days)


@admin_router.get("/recent")
async def recent(limit: int = Query(default=25, ge=1, le=200),
                 env: Optional[str] = Query(default=None),
                 _: str = Depends(verify_admin)):
    target_env = sanitize_env(env)
    rows = await db.intent_classifications_shadow.find(
        {"env": target_env}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    out = []
    for r in rows:
        r["_id"] = str(r.get("_id"))
        # Serialize datetime.
        created = r.get("created_at")
        if created is not None:
            try:
                r["created_at"] = created.isoformat()
            except Exception:
                r["created_at"] = str(created)
        out.append(r)
    return {"env": target_env, "count": len(out), "decisions": out}


@admin_router.post("/classify")
async def classify(body: ClassifyIn, _: str = Depends(verify_admin)):
    if not IC.is_enabled():
        raise HTTPException(status_code=409, detail={
            "code": "SHADOW_CLASSIFIER_DISABLED",
            "message": "Set TYPESAFE_API_KEY and PHILEON_INTENT_CLASSIFIER_SHADOW=true to enable.",
        })
    result = await IC.classify_session(
        db, session_id=body.session_id, trigger="admin_manual")
    return result
