from typing import Optional, List
from datetime import datetime
from pymongo import ReturnDocument
from fastapi import HTTPException, status
from app.database import get_mongo_db
from app.models.swipe_models import SwipeAction, SwipeActionDB

async def create_swipe(swipe: SwipeAction) -> SwipeActionDB:
    """Record a new swipe action"""
    db = await get_mongo_db()
    swipe_data = swipe.model_dump()
    swipe_data["timestamp"] = datetime.utcnow()
    
    try:
        result = await db.swipes.insert_one(swipe_data)
        created_swipe = await db.swipes.find_one({"_id": result.inserted_id})
        return SwipeActionDB(**created_swipe)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record swipe: {str(e)}"
        )

async def get_swipe(swipe_id: str) -> Optional[SwipeActionDB]:
    db = await get_mongo_db()
    swipe = await db.swipes.find_one({"_id": swipe_id})
    return SwipeActionDB(**swipe) if swipe else None

async def get_swipes_by_user(user_id: str, limit: int = 100) -> List[SwipeActionDB]:
    """Get all swipes by a user"""
    db = await get_mongo_db()
    return [
        SwipeActionDB(**swipe)
        async for swipe in db.swipes.find({"user": user_id}).limit(limit)
    ]

async def get_swipes_by_job(job_id: str, limit: int = 100) -> List[SwipeActionDB]:
    """Get all swipes for a job"""
    db = await get_mongo_db()
    return [
        SwipeActionDB(**swipe)
        async for swipe in db.swipes.find({"job": job_id}).limit(limit)
    ]

async def update_swipe_action(swipe_id: str, new_action: str) -> Optional[SwipeActionDB]:
    """Update swipe action (like/dislike)"""
    db = await get_mongo_db()
    
    if new_action not in ["like", "dislike"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Must be 'like' or 'dislike'"
        )
    
    updated_swipe = await db.swipes.find_one_and_update(
        {"_id": swipe_id},
        {"$set": {"action": new_action, "timestamp": datetime.utcnow()}},
        return_document=ReturnDocument.AFTER
    )
    return SwipeActionDB(**updated_swipe) if updated_swipe else None

async def delete_swipe(swipe_id: str) -> bool:
    """Delete a swipe record"""
    db = await get_mongo_db()
    result = await db.swipes.delete_one({"_id": swipe_id})
    return result.deleted_count > 0

async def get_swipe_stats(job_id: str) -> dict:
    """Get statistics for a job (like/dislike counts)"""
    db = await get_mongo_db()
    pipeline = [
        {"$match": {"job": job_id}},
        {"$group": {
            "_id": "$action",
            "count": {"$sum": 1}
        }}
    ]
    results = await db.swipes.aggregate(pipeline).to_list(None)
    return {item["_id"]: item["count"] for item in results}