from pymongo import ReturnDocument
from app.database import get_mongo_db
from app.models.user_models import UserBase, UserDB, UserPreferences
from typing import List, Dict, Any

async def create_user(user: UserBase) -> UserDB:
    db = await get_mongo_db()
    user_data = user.model_dump()
    
    result = await db["users"].insert_one(user_data)
    created_user = await db["users"].find_one({"_id": result.inserted_id})
    return UserDB(**created_user, id=str(created_user["_id"]))

async def get_user(user_id: str) -> UserDB | None:
    db = await get_mongo_db()
    user = await db["users"].find_one({"_id": user_id})
    return UserDB(**user, id=str(user["_id"])) if user else None

async def get_user_by_email(email: str) -> UserDB | None:
    db = await get_mongo_db()
    user = await db["users"].find_one({"email": email})
    return UserDB(**user, id=str(user["_id"])) if user else None

async def update_user(user_id: str, update_data: Dict[str, Any]) -> UserDB | None:
    db = await get_mongo_db()
    
    # Clean update data
    clean_data = {k: v for k, v in update_data.items() if v is not None}
    
    updated_user = await db["users"].find_one_and_update(
        {"_id": user_id},
        {"$set": clean_data},
        return_document=ReturnDocument.AFTER
    )
    return UserDB(**updated_user, id=str(updated_user["_id"])) if updated_user else None

async def update_user_preferences(
    user_id: str, 
    preferences: UserPreferences
) -> UserDB | None:
    db = await get_mongo_db()
    
    updated_user = await db["users"].find_one_and_update(
        {"_id": user_id},
        {"$set": {"preferences": preferences.model_dump()}},
        return_document=ReturnDocument.AFTER
    )
    return UserDB(**updated_user, id=str(updated_user["_id"])) if updated_user else None

async def record_user_swipe(
    user_id: str, 
    job_id: str, 
    action: str
) -> UserDB | None:
    db = await get_mongo_db()
    
    # Add swipe to history (avoids duplicates)
    updated_user = await db["users"].find_one_and_update(
        {"_id": user_id, "swipedJobs.jobId": {"$ne": job_id}},
        {"$push": {"swipedJobs": {"jobId": job_id, "action": action}}},
        return_document=ReturnDocument.AFTER
    )
    return UserDB(**updated_user, id=str(updated_user["_id"])) if updated_user else None