from fastapi import APIRouter, HTTPException
from app.models.swipe_models import SwipeAction
from app.database import get_mongo_db

router = APIRouter()

@router.post("/batch")
async def record_swipes(actions: list[SwipeAction]):
    db = await get_mongo_db()
    
    # Prepare bulk operations (matches JS logic)
    bulk_ops = [{
        "updateOne": {
            "filter": {
                "user": action.user,
                "job": action.job,
                "action": action.action
            },
            "update": {
                "$setOnInsert": {
                    "timestamp": action.timestamp
                }
            },
            "upsert": True
        }
    } for action in actions]
    
    # Execute bulk write
    try:
        result = await db.swipes.bulk_write(bulk_ops)
        return {
            "insertedCount": result.upserted_count,
            "matchedCount": result.matched_count
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))