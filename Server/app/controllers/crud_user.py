from typing import Optional, List
from datetime import datetime
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError
from fastapi import HTTPException, status
from app.database import get_mongo_db
from app.models.user_models import (
    UserBase,
    UserCreate,
    UserDB,
    UserPreferences,
    ExperienceLevel,
    LocationType,
)
from bson import ObjectId



async def create_user(user: UserCreate) -> UserDB:
    """
    Create a new user with validation for unique email
    """
    db = await get_mongo_db()
    user_data = user.model_dump()

    try:
        result = await db.users.insert_one(user_data)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])

    return UserDB(**created_user)


async def get_user(user_id: str) -> Optional[UserDB]:
    """
    Get user by ID, returns None if not found
    """
    db = await get_mongo_db()
    
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return None
        
        # Convert `_id` from ObjectId to string
        user["_id"] = str(user["_id"])
        return UserDB(**user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid user ID: {e}")


async def get_user_by_email(email: str) -> Optional[UserDB]:
    """
    Get user by email, returns None if not found
    """
    db = await get_mongo_db()
    user = await db.users.find_one({"email": email})
    user["_id"] = str(user["_id"])

    return UserDB(**user) if user else None


async def update_user(
    user_id: str, update_data: dict, partial: bool = True
) -> Optional[UserDB]:
    """
    Update user information with proper validation
    """
    db = await get_mongo_db()

    # Protect immutable fields
    protected_fields = {"email", "createdAt"}
    if any(field in update_data for field in protected_fields):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify protected fields",
        )

    # Clean None values if partial update
    if partial:
        update_data = {k: v for k, v in update_data.items() if v is not None}

    try:
        updated_user = await db.users.find_one_and_update(
            {"_id": user_id},
            {"$set": update_data, "$setOnInsert": {"updatedAt": datetime.utcnow()}},
            return_document=ReturnDocument.AFTER,
        )
        updated_user["_id"] = str(updated_user["_id"])
        return UserDB(**updated_user) if updated_user else None
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Update would create duplicate data",
        )


async def update_user_preferences(
    user_id: str, preferences: UserPreferences
) -> Optional[UserDB]:
    """
    Specialized update for user preferences
    """
    db = await get_mongo_db()

    updated_user = await db.users.find_one_and_update(
        {"_id": user_id},
        {
            "$set": {"preferences": preferences.model_dump()},
            "$setOnInsert": {"updatedAt": datetime.utcnow()},
        },
        return_document=ReturnDocument.AFTER,
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return UserDB(**updated_user)


async def delete_user(user_id: str) -> bool:
    """
    Soft delete user by setting deletedAt timestamp
    Returns True if user was deleted, False if not found
    """
    db = await get_mongo_db()

    result = await db.users.update_one(
        {"_id": user_id, "deletedAt": None},  # Only update if not already deleted
        {"$set": {"deletedAt": datetime.utcnow()}},
    )

    if result.modified_count == 0:
        existing = await db.users.count_documents({"_id": user_id})
        if existing == 0:
            return False
        raise HTTPException(
            status_code=status.HTTP_410_GONE, detail="User already deleted"
        )
    return True


async def permanently_delete_user(user_id: str) -> bool:
    """
    Permanently delete user from database
    Use with caution - irreversible operation
    """
    db = await get_mongo_db()
    result = await db.users.delete_one({"_id": user_id})
    return result.deleted_count > 0


async def restore_user(user_id: str) -> Optional[UserDB]:
    """
    Restore a soft-deleted user
    """
    db = await get_mongo_db()
    updated_user = await db.users.find_one_and_update(
        {"_id": user_id, "deletedAt": {"$ne": None}},
        {"$unset": {"deletedAt": ""}},
        return_document=ReturnDocument.AFTER,
    )
    return UserDB(**updated_user) if updated_user else None
