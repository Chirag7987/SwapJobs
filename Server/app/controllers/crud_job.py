from typing import Optional, List, Dict
from datetime import datetime
from pymongo import ReturnDocument
from fastapi import HTTPException, status
from app.database import get_mongo_db
from app.models.job_models import JobBase, JobCreate, JobDB

async def create_job(job: JobCreate) -> JobDB:
    db = await get_mongo_db()
    job_data = job.model_dump()
    job_data["createdAt"] = datetime.utcnow()
    
    try:
        result = await db.jobs.insert_one(job_data)
        created_job = await db.jobs.find_one({"_id": result.inserted_id})
        return JobDB(**created_job)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create job: {str(e)}"
        )

async def get_job(job_id: str) -> Optional[JobDB]:
    db = await get_mongo_db()
    job = await db.jobs.find_one({"_id": job_id})
    return JobDB(**job) if job else None

async def get_all_jobs(skip: int = 0, limit: int = 100) -> List[JobDB]:
    db = await get_mongo_db()
    return [
        JobDB(**job)
        async for job in db.jobs.find().skip(skip).limit(limit)
    ]

async def update_job(job_id: str, update_data: Dict) -> Optional[JobDB]:
    db = await get_mongo_db()
    
    # Protect immutable fields
    protected_fields = {"createdAt"}
    update_data = {k: v for k, v in update_data.items() 
                  if k not in protected_fields and v is not None}
    
    updated_job = await db.jobs.find_one_and_update(
        {"_id": job_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER
    )
    return JobDB(**updated_job) if updated_job else None

async def delete_job(job_id: str) -> bool:
    db = await get_mongo_db()
    result = await db.jobs.delete_one({"_id": job_id})
    return result.deleted_count > 0

async def search_jobs(
    query: str,
    job_type: Optional[str] = None,
    is_remote: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> List[JobDB]:
    db = await get_mongo_db()
    search_filter = {}
    
    if query:
        search_filter["$text"] = {"$search": query}
    if job_type:
        search_filter["jobType"] = job_type
    if is_remote is not None:
        search_filter["isRemote"] = is_remote
    
    return [
        JobDB(**job)
        async for job in db.jobs.find(search_filter)
            .skip(skip)
            .limit(limit)
    ]