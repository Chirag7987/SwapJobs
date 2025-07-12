from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from app.models.swipe_models import SwipeAction, SwipeActionDB, SwipeStatsResponse
from app.controllers.crud_swipe import (
    create_swipe,
    get_swipe,
    delete_swipe,
    get_swipe_stats,
    get_swipes_by_job,
    get_swipes_by_user,
    update_swipe_action
)
from pymongo.errors import DuplicateKeyError

router = APIRouter(prefix="/swipes", tags=["swipes"])

@router.post(
    "/",
    response_model=SwipeActionDB,
    status_code=status.HTTP_201_CREATED,
    summary="Record a new swipe action",
    responses={
        400: {"description": "Invalid swipe action"},
        409: {"description": "Duplicate swipe detected"}
    }
)
async def record_swipe(swipe: SwipeAction):
    """
    Record a user's swipe action on a job posting.
    
    - **user**: User ID (required)
    - **job**: Job ID (required)
    - **action**: Must be either 'like' or 'dislike' (required)
    """
    try:
        return await create_swipe(swipe)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User has already swiped this job"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get(
    "/{swipe_id}",
    response_model=SwipeActionDB,
    summary="Get a specific swipe record",
    responses={404: {"description": "Swipe not found"}}
)
async def retrieve_swipe(swipe_id: str):
    """Retrieve details of a specific swipe action by its ID"""
    swipe = await get_swipe(swipe_id)
    if not swipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swipe record not found"
        )
    return swipe

@router.get(
    "/user/{user_id}",
    response_model=List[SwipeActionDB],
    summary="Get all swipes by a user",
    responses={404: {"description": "No swipes found"}}
)
async def get_user_swipes(
    user_id: str,
    limit: int = Query(50, ge=1, le=1000),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """
    Get all swipe actions performed by a specific user.
    
    - **limit**: Number of records to return (1-1000)
    - **start_date**: Filter swipes after this date
    - **end_date**: Filter swipes before this date
    """
    swipes = await get_swipes_by_user(user_id, limit, start_date, end_date)
    if not swipes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No swipe history found for this user"
        )
    return swipes

@router.get(
    "/job/{job_id}",
    response_model=List[SwipeActionDB],
    summary="Get all swipes for a job",
    responses={404: {"description": "No swipes found"}}
)
async def get_job_swipes(
    job_id: str,
    action: Optional[str] = Query(None, regex="^(like|dislike)$"),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get all swipe actions received by a specific job posting.
    
    - **action**: Filter by 'like' or 'dislike'
    - **limit**: Number of records to return (1-1000)
    """
    swipes = await get_swipes_by_job(job_id, action, limit)
    if not swipes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No swipes recorded for this job"
        )
    return swipes

@router.patch(
    "/{swipe_id}",
    response_model=SwipeActionDB,
    summary="Update a swipe action",
    responses={
        400: {"description": "Invalid action"},
        404: {"description": "Swipe not found"}
    }
)
async def update_swipe(
    swipe_id: str,
    action: str = Query(..., regex="^(like|dislike)$", description="New action to set")
):
    """Update an existing swipe action (like/dislike)"""
    try:
        updated = await update_swipe_action(swipe_id, action)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Swipe record not found"
            )
        return updated
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete(
    "/{swipe_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a swipe record",
    responses={404: {"description": "Swipe not found"}}
)
async def remove_swipe(swipe_id: str):
    """Permanently delete a swipe record"""
    success = await delete_swipe(swipe_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swipe record not found"
        )

@router.get(
    "/stats/job/{job_id}",
    response_model=SwipeStatsResponse,
    summary="Get swipe statistics for a job",
    responses={404: {"description": "No swipes found"}}
)
async def get_job_swipe_stats(job_id: str):
    """
    Get aggregated statistics for a job's swipes:
    - Total likes
    - Total dislikes
    - Like ratio
    """
    stats = await get_swipe_stats(job_id)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No swipe data available for this job"
        )
    return stats