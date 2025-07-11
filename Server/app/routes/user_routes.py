from fastapi import APIRouter, HTTPException, status
from app.models.user_models import UserBase, UserPreferences
from datetime import datetime
from app.controllers.crud_user import create_user, update_user, update_user_preferences, get_user

router = APIRouter()

@router.post("/user", response_model=UserBase)
async def create_user_endpoint(user: UserBase):
    try:
        return await create_user(user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/user/{user_id}", response_model=UserBase)
async def get_user_endpoint(user_id: str):
    user = await get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/user/{user_id}", response_model=UserBase)
async def update_user_endpoint(user_id: str, update_data: dict):
    updated_user = await update_user(user_id, update_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.patch("/user/{user_id}/preferences", response_model=UserBase)
async def update_user_preferences_endpoint(user_id: str, preferences: UserPreferences):
    updated_user = await update_user_preferences(user_id, preferences)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user