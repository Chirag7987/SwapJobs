from pymongo import ReturnDocument
from app.database import get_mongo_db
from app.models.swipe_models import SwipeAction, SwipeActionDB
from datetime import datetime
from typing import List

async def record_swipe(swipe: SwipeAction) -> SwipeActionDB:
    db = await get_mongo_db()
    swipe_data = swipe.model_dump()
    swipe_data["timestamp"] = datetime.utcnow()
    
    result = await db["swipes"].insert_one(swipe_data)
    created_swipe = await db["swipes"].find_one({"_id": result.inserted_id})
    return SwipeActionDB(**created_swipe, id=str(created_swipe["_id"]))

async def get_swipes_by_user(user_id: str, limit: int = 100) -> List[SwipeActionDB]:
    db = await get_mongo_db()
    return [
        SwipeActionDB(**swipe, id=str(swipe["_id"]))
        async for swipe in db["swipes"].find({"user": user_id}).limit(limit)
    ]

async def update_swipe(swipe_id: str, action: str) -> SwipeActionDB | None:
    db = await get_mongo_db()
    
    updated_swipe = await db["swipes"].find_one_and_update(
        {"_id": swipe_id},
        {"$set": {"action": action, "timestamp": datetime.utcnow()}},
        return_document=ReturnDocument.AFTER
    )
    return SwipeActionDB(**updated_swipe, id=str(updated_swipe["_id"])) if updated_swipe else None